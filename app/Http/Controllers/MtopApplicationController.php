<?php
//GeronaMTOP\app\Http\Controllers\MtopApplicationController.php
namespace App\Http\Controllers;

use App\Models\MtopApplication;
use App\Models\MtopFranchise;
use App\Models\Signatory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Models\SyncQueue;
use App\Http\Requests\MtopApplicationRequest;
use App\Services\ValidityService;
use Rap2hpoutre\FastExcel\FastExcel;

class MtopApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'month', 'year', 'barangay', 'renewal', 'sortAlphabetical']);

        $query = MtopApplication::filter($filters);

        // Handle the Combined Alphabetical Filter
        if (!empty($filters['sortAlphabetical'])) {
            if ($filters['sortAlphabetical'] === 'all') {
                // Sort everything A-Z
                $query->orderBy('last_name', 'asc')->orderBy('first_name', 'asc');
            } elseif (strlen($filters['sortAlphabetical']) === 1) {
                // Filter by specific letter AND sort A-Z
                $query->where('last_name', 'like', $filters['sortAlphabetical'] . '%')
                    ->orderBy('last_name', 'asc')
                    ->orderBy('first_name', 'asc');
            }
        } else {
            // Default sorting
            $query->orderBy('mt_number', 'desc');
        }

        $applications = $query->paginate(10)->withQueryString();

        $officials = Signatory::where('is_active', true)->get()->map(function ($s) {
            return ['name' => $s->name, 'position' => $s->position];
        });

        $activeEvents = \App\Models\Event::where('is_active', true)
            ->whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now())
            ->get();

        return Inertia::render('Mtop/Index', [
            'applications' => $applications,
            'filters' => $filters,
            'officials' => $officials,
            'activeEvents' => $activeEvents,
            'feeSettings' => \App\Models\FeeSetting::first()
        ]);
    }

    public function create(): Response
    {
        $year = now()->year;
        $holidays = \App\Models\Holiday::where('is_active', true)->get();

        $mtNumbers = MtopFranchise::where('mt_number', 'like', "$year-%")->pluck('mt_number');

        $maxSeq = 0;
        foreach ($mtNumbers as $num) {
            $parts = explode('-', $num);
            $seq = isset($parts[1]) ? (int) $parts[1] : 0;
            if ($seq > $maxSeq) {
                $maxSeq = $seq;
            }
        }
        $nextSequence = $maxSeq + 1;

        $suggested_mt_number = sprintf("%s-%04d", $year, $nextSequence);

        $punong_bayans = Signatory::where('position', 'Punong Bayan')
            ->where('is_active', true)
            ->selectRaw("CONCAT(name, ' | ', position) as formatted_name")
            ->pluck('formatted_name');

        $officials = Signatory::whereIn('position', ['Authorized Official', 'Committee on Transportation'])
            ->where('is_active', true)
            ->selectRaw("CONCAT(name, ' | ', position) as formatted_name")
            ->pluck('formatted_name');

        $activeEvents = \App\Models\Event::where('is_active', true)
            ->whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now())
            ->get();
        $suggested_body_number = $this->generateNextAvailableBodyNumber();

        return Inertia::render('Mtop/Create', [
            'suggested_mt_number' => $suggested_mt_number,
            'suggested_body_number' => $suggested_body_number,
            'punong_bayans' => $punong_bayans,
            'officials' => $officials,
            'activeEvents' => $activeEvents,
            'holidays' => $holidays,
            'occupied_body_numbers' => $this->getOccupiedBodyNumbers()
        ]);
    }

    public function store(MtopApplicationRequest $request, ValidityService $validityService): RedirectResponse
    {
        $validated = $request->validated();

        $event = null;
        if (!empty($validated['event_id'])) {
            $e = \App\Models\Event::find($validated['event_id']);
            if ($e) {
                $tDate = Carbon::parse($request->transaction_date)->startOfDay();
                $eventStart = Carbon::parse($e->start_date)->startOfDay();
                $eventEnd = Carbon::parse($e->end_date)->endOfDay();

                if ($tDate->between($eventStart, $eventEnd)) {
                    $event = $e;
                } else {
                    $validated['event_id'] = null;
                    $validated['is_free'] = false;
                }
            }
        }
        $isFree = filter_var($validated['is_free'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $expiryResult = $validityService->computeExpiry(
            Carbon::parse($request->transaction_date),
            $validated['plate_no'] ?? null,
            !$isFree,
            $event
        );

        try {

            $mtop = DB::transaction(function () use ($validated, $request, $expiryResult, $isFree) {
                $final_mt_number = $validated['mt_number'];
                $year = now()->year;
                // === ADD THIS BLOCK ===
                // Check if the frontend provided a body number. If it's empty OR already taken, generate a new one safely.
                $final_body_number = $validated['body_number'] ?? null;
                $isBodyNumberTaken = MtopFranchise::where('body_number', $final_body_number)
                    ->where('status', '!=', 'cancelled')
                    ->exists();

                if (empty($final_body_number) || $isBodyNumberTaken) {
                    $final_body_number = $this->generateNextAvailableBodyNumber();
                }
                // =======================

                MtopFranchise::where('mt_number', 'like', "$year-%")->lockForUpdate()->pluck('id');

                while (MtopFranchise::where('mt_number', $final_mt_number)->exists()) {
                    $parts = explode('-', $final_mt_number);
                    $seq = isset($parts[1]) ? intval($parts[1]) : 0;
                    $final_mt_number = sprintf("%s-%04d", $year, $seq + 1);
                }

                $franchise = MtopFranchise::create([
                    'mt_number' => $final_mt_number,
                    'body_number' => $final_body_number,
                    'last_name' => $validated['last_name'],
                    'first_name' => $validated['first_name'],
                    'middle_name' => $validated['middle_name'] ?? null,
                    'suffix' => $validated['suffix'] ?? null,
                    'address' => $validated['address'],
                    'contact_number' => $validated['contact_number'] ?? null,
                    'make_type' => $validated['make_type'],
                    'engine_motor_no' => $validated['engine_motor_no'],
                    'chassis_no' => $validated['chassis_no'],
                    'plate_no' => $validated['plate_no'],
                    'status' => 'active',
                    'show_paid_by' => filter_var($validated['show_paid_by'] ?? false, FILTER_VALIDATE_BOOLEAN),
                    'paid_by_last_name' => $validated['paid_by_last_name'] ?? null,
                    'paid_by_first_name' => $validated['paid_by_first_name'] ?? null,
                    'paid_by_middle_name' => $validated['paid_by_middle_name'] ?? null,
                    'paid_by_suffix' => $validated['paid_by_suffix'] ?? null,
                ]);

                $applicationData = $validated;
                $applicationData['mt_number'] = $final_mt_number;
                $applicationData['status'] = 'active';
                $applicationData['franchise_id'] = $franchise->id;
                $applicationData['transaction_type'] = 'New';
                $applicationData['processed_by'] = Auth::id();
                $applicationData['is_free'] = $isFree;
                $applicationData['event_id'] = $validated['event_id'] ?? null;
                $applicationData['is_manual_validity'] = filter_var($validated['is_manual_validity'] ?? false, FILTER_VALIDATE_BOOLEAN);
                $applicationData['valid_until'] = $applicationData['is_manual_validity'] && !empty($validated['valid_until'])
                    ? $validated['valid_until']
                    : $expiryResult['expiry_date'];

                $application = MtopApplication::create($applicationData);

                $this->queueForSync('mtop_franchises', $franchise->toArray());
                $this->queueForSync('mtop_applications', $application->toArray());

                return $application;
            });

            $message = 'Application created successfully!';

            if ($request->mt_number !== $mtop->mt_number) {
                $message = "Application saved! Note: Control No. {$request->mt_number} was just taken by another staff member, so this was automatically assigned to {$mtop->mt_number}.";
            }

            return redirect()->back()->with('success_data', [
                'id' => $mtop->id,
                'mt_number' => $mtop->mt_number,
                'operator_name' => $mtop->first_name . ' ' . $mtop->last_name,
            ])->with('message', $message);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['mt_number' => 'System error preventing creation: ' . $e->getMessage()])->withInput();
        }
    }

    public function edit($id): Response
    {
        $application = MtopApplication::findOrFail($id);
        $suggested_body_number = $this->generateNextAvailableBodyNumber();
        $punong_bayans = Signatory::where('position', 'Punong Bayan')
            ->where('is_active', true)
            ->selectRaw("CONCAT(name, ' | ', position) as formatted_name")
            ->pluck('formatted_name');

        $officials = Signatory::whereIn('position', ['Authorized Official', 'Committee on Transportation'])
            ->where('is_active', true)
            ->selectRaw("CONCAT(name, ' | ', position) as formatted_name")
            ->pluck('formatted_name');

        $activeEvents = \App\Models\Event::where('is_active', true)
            ->whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now())
            ->get();

        $holidays = \App\Models\Holiday::where('is_active', true)->get();

        return Inertia::render('Mtop/Edit', [
            'application' => $application,
            'punong_bayans' => $punong_bayans,
            'officials' => $officials,
            'activeEvents' => $activeEvents,
            'holidays' => $holidays,
            'suggested_body_number' => $suggested_body_number,
            'occupied_body_numbers' => $this->getOccupiedBodyNumbers()
        ]);
    }

    public function update(MtopApplicationRequest $request, $id, ValidityService $validityService): RedirectResponse
    {
        $application = MtopApplication::findOrFail($id);
        $validated = $request->validated();

        $validated['show_paid_by'] = filter_var($validated['show_paid_by'] ?? false, FILTER_VALIDATE_BOOLEAN);
        if (!$validated['show_paid_by']) {
            $validated['paid_by_last_name'] = null;
            $validated['paid_by_first_name'] = null;
            $validated['paid_by_middle_name'] = null;
            $validated['paid_by_suffix'] = null;
        }

        $validated['has_driver'] = filter_var($validated['has_driver'] ?? false, FILTER_VALIDATE_BOOLEAN);
        if (!$validated['has_driver']) {
            $validated['driver_last_name'] = null;
            $validated['driver_first_name'] = null;
            $validated['driver_middle_name'] = null;
            $validated['driver_suffix'] = null;
        }

        if ($request->transaction_date) {
            $event = null;
            if (!empty($validated['event_id'])) {
                $e = \App\Models\Event::find($validated['event_id']);
                if ($e) {
                    $tDate = Carbon::parse($request->transaction_date)->startOfDay();
                    $eventStart = Carbon::parse($e->start_date)->startOfDay();
                    $eventEnd = Carbon::parse($e->end_date)->endOfDay();

                    if ($tDate->between($eventStart, $eventEnd)) {
                        $event = $e;
                    } else {
                        $validated['event_id'] = null;
                        $validated['is_free'] = false;
                    }
                }
            }
            $isFree = filter_var($validated['is_free'] ?? false, FILTER_VALIDATE_BOOLEAN);

            $expiryResult = $validityService->computeExpiry(
                Carbon::parse($request->transaction_date),
                $validated['plate_no'] ?? null,
                !$isFree,
                $event
            );
            $validated['is_manual_validity'] = filter_var($validated['is_manual_validity'] ?? false, FILTER_VALIDATE_BOOLEAN);
            $validated['valid_until'] = $validated['is_manual_validity'] && !empty($validated['valid_until'])
                ? $validated['valid_until']
                : $expiryResult['expiry_date'];
        }

        try {
            DB::transaction(function () use ($application, $validated) {
                $final_mt_number = $validated['mt_number'];

                $exists = MtopFranchise::where('mt_number', $final_mt_number)
                    ->where('id', '!=', $application->franchise_id)
                    ->exists();

                if ($exists) {
                    throw new \Exception("The Control Number {$final_mt_number} was just updated by another user. Please use a different number.");
                }

                if (!$validated['show_paid_by'] && $application->show_paid_by) {
                    $pbInitial = $application->paid_by_middle_name ? substr($application->paid_by_middle_name, 0, 1) . '. ' : '';
                    $pbSfx = $application->paid_by_suffix ? ' ' . $application->paid_by_suffix : '';

                    $fullPaidByName = trim(strtoupper("{$application->paid_by_first_name} {$pbInitial}{$application->paid_by_last_name}{$pbSfx}"));
                    $basicPaidByName = trim(strtoupper("{$application->paid_by_first_name} {$application->paid_by_last_name}"));

                    $currentDriver = trim(strtoupper($application->driver_name ?? ''));

                    if ($currentDriver === $fullPaidByName || $currentDriver === $basicPaidByName) {
                        $application->driver_name = null;
                    }
                }

                $application->update($validated);
                $this->queueForSync('mtop_applications', $application->fresh()->toArray());

                if ($application->franchise_id) {
                    $franchise = MtopFranchise::find($application->franchise_id);
                    if ($franchise) {
                        $franchise->update([
                            'mt_number' => $final_mt_number,
                            'body_number' => $validated['body_number'] ?? $franchise->body_number,
                            'last_name' => $validated['last_name'],
                            'first_name' => $validated['first_name'],
                            'middle_name' => $validated['middle_name'],
                            'suffix' => $validated['suffix'],
                            'address' => $validated['address'],
                            'make_type' => $validated['make_type'],
                            'engine_motor_no' => $validated['engine_motor_no'],
                            'chassis_no' => $validated['chassis_no'],
                            'plate_no' => $validated['plate_no'],
                            'show_paid_by' => $validated['show_paid_by'],
                            'paid_by_last_name' => $validated['paid_by_last_name'],
                            'paid_by_first_name' => $validated['paid_by_first_name'],
                            'paid_by_middle_name' => $validated['paid_by_middle_name'],
                            'paid_by_suffix' => $validated['paid_by_suffix'],
                        ]);
                        $this->queueForSync('mtop_franchises', $franchise->fresh()->toArray());
                    }
                }
            });

            return redirect()->back()->with('success_data', [
                'id' => $application->id,
                'mt_number' => $application->mt_number,
                'operator_name' => $application->first_name . ' ' . $application->last_name . ($application->suffix ? ' ' . $application->suffix : ''),
            ])->with('message', 'Record updated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['mt_number' => $e->getMessage()])->withInput();
        }
    }

    public function cancel(Request $request, $id): RedirectResponse
    {
        $application = MtopApplication::findOrFail($id);

        $validated = $request->validate([
            'last_name' => 'required|string',
            'first_name' => 'required|string',
            'middle_name' => 'nullable|string',
            'address' => 'required|string',
            'make_type' => 'required|string',
            'engine_motor_no' => 'required|string',
            'chassis_no' => 'required|string',
            'plate_no' => 'nullable|string',
            'body_number' => 'nullable|string',
            'drop_date' => 'required|date',
            'drop_or_number' => 'required|string',
            'drop_or_date' => 'required|date',
            'drop_amount' => 'required|numeric|min:0',
            'drop_official' => 'required|string',
            'drop_position' => 'required|string',
        ]);

        $validated['status'] = 'cancelled';

        DB::transaction(function () use ($application, $validated) {
            $application->update($validated);
            $this->queueForSync('mtop_applications', $application->fresh()->toArray());

            if ($application->franchise_id) {
                $franchise = MtopFranchise::find($application->franchise_id);

                if ($franchise && in_array($application->getOriginal('status'), ['active', 'upcoming'])) {
                    $franchise->update([
                        'status' => 'cancelled',
                        'last_name' => $validated['last_name'],
                        'first_name' => $validated['first_name'],
                        'middle_name' => $validated['middle_name'],
                        'address' => $validated['address'],
                        'make_type' => $validated['make_type'],
                        'engine_motor_no' => $validated['engine_motor_no'],
                        'chassis_no' => $validated['chassis_no'],
                        'plate_no' => $validated['plate_no'],
                        'body_number' => $validated['body_number'],
                    ]);
                    $this->queueForSync('mtop_franchises', $franchise->fresh()->toArray());
                }
            }
        });

        return redirect()->back()->with('success_data', [
            'id' => $application->id,
            'action' => 'dropped'
        ])->with('message', 'Record dropped and cancelled successfully.');
    }

    public function printDrop($id): Response
    {
        $application = MtopApplication::findOrFail($id);

        return Inertia::render('Mtop/PrintDrop', [
            'application' => $application,
            'settings' => \App\Models\PrintSetting::first()
        ]);
    }

    public function destroy($id): RedirectResponse
    {
        $application = MtopApplication::findOrFail($id);

        DB::transaction(function () use ($application, $id) {
            $franchiseId = $application->franchise_id;
            $isNew = $application->transaction_type === 'New';

            $application->delete();
            $this->queueForSync('mtop_applications', ['id' => $id, '_action' => 'delete']);

            if ($isNew && $franchiseId) {
                MtopFranchise::where('id', $franchiseId)->delete();
                $this->queueForSync('mtop_franchises', ['id' => $franchiseId, '_action' => 'delete']);
            }
        });

        return redirect()->back()->with('message', 'Record deleted successfully.');
    }

    public function print($id): Response
    {
        $application = MtopApplication::with('event')->findOrFail($id);
        return Inertia::render('Mtop/Print', [
            'application' => $application
        ]);
    }

    public function export(Request $request)
    {
        $filters = $request->all();
        $query = MtopApplication::filter($filters);

        // Handle the Combined Alphabetical Filter for Exports
        if (!empty($filters['sortAlphabetical'])) {
            if ($filters['sortAlphabetical'] === 'all') {
                $query->orderBy('last_name', 'asc')->orderBy('first_name', 'asc');
            } elseif (strlen($filters['sortAlphabetical']) === 1) {
                $query->where('last_name', 'like', $filters['sortAlphabetical'] . '%')
                    ->orderBy('last_name', 'asc')
                    ->orderBy('first_name', 'asc');
            }
        } else {
            $query->orderBy('mt_number', 'desc');
        }

        // Get the LazyCollection cursor
        $records = $query->cursor();
        $fileName = 'mtop_records_' . date('Y-m-d_H-i') . '.xlsx';

        // FastExcel needs a standard Generator, Collection, or array.
        // A LazyCollection is not accepted natively in older/some versions.
        // We convert the LazyCollection into a standard Generator here:
        $generator = function () use ($records) {
            foreach ($records as $record) {
                yield $record;
            }
        };

        // Pass the generator to FastExcel
        return (new FastExcel($generator()))->download($fileName, function ($row) {
            $paidBy = $row->show_paid_by
                ? trim("{$row->paid_by_first_name} {$row->paid_by_last_name} {$row->paid_by_suffix}")
                : 'N/A';

            $driverName = 'N/A';
            if ($row->has_driver) {
                $dMiddle = $row->driver_middle_name ? substr($row->driver_middle_name, 0, 1) . '. ' : '';
                $driverName = trim("{$row->driver_first_name} {$dMiddle}{$row->driver_last_name} {$row->driver_suffix}");
            }

            return [
                'Control No' => (string) $row->mt_number, // (string) forces it to keep leading zeroes
                'Transaction Date' => $row->transaction_date,
                'Transaction Type' => $row->transaction_type,
                'Last Name' => $row->last_name,
                'First Name' => $row->first_name,
                'Middle Name' => $row->middle_name,
                'Suffix' => $row->suffix,
                'Paid By Details' => $paidBy,
                'Driver Name' => $driverName,
                'Address' => $row->address,
                'Contact #' => (string) $row->contact_number,
                'Body Number' => (string) $row->body_number,
                'Plate No' => $row->plate_no,
                'Make/Type' => $row->make_type,
                'Engine No' => (string) $row->engine_motor_no,
                'Chassis No' => (string) $row->chassis_no,
                'OR No' => (string) $row->or_number,
                'OR Date' => $row->or_date,
                'Cedula No' => (string) $row->cedula_number,
                'Cedula Date' => $row->cedula_date,
                'Punong Bayan' => $row->punong_bayan,
                'Authorized Official' => $row->authorized_official,
                'Is Free/Promo' => $row->is_free ? 'YES' : 'NO',
                'Valid Until' => $row->valid_until,
                'Status' => $row->status
            ];
        });
    }

    public function updateDriverInfo(Request $request)
    {
        $request->validate([
            'drivers' => 'required|array',
            'drivers.*.id' => 'required|exists:mtop_applications,id',
            'drivers.*.driver_last_name' => 'nullable|string|max:50',
            'drivers.*.driver_first_name' => 'nullable|string|max:50',
            'drivers.*.driver_middle_name' => 'nullable|string|max:50',
            'drivers.*.driver_suffix' => 'nullable|string|max:10',
            'drivers.*.photo' => 'nullable|image|max:10240',
        ]);

        $drivers = $request->input('drivers');

        DB::transaction(function () use ($request, $drivers) {
            foreach ($drivers as $index => $data) {
                $app = MtopApplication::find($data['id']);

                $hasDriver = !empty($data['driver_last_name']) || !empty($data['driver_first_name']);

                $updateData = [
                    'has_driver' => $hasDriver,
                    'driver_last_name' => $data['driver_last_name'] ?? null,
                    'driver_first_name' => $data['driver_first_name'] ?? null,
                    'driver_middle_name' => $data['driver_middle_name'] ?? null,
                    'driver_suffix' => $data['driver_suffix'] ?? null,
                    'driver_name' => null,
                ];

                $removePhoto = filter_var($data['remove_photo'] ?? false, FILTER_VALIDATE_BOOLEAN);

                if ($removePhoto) {
                    if ($app->driver_photo_path && Storage::exists('public/' . $app->driver_photo_path)) {
                        Storage::delete('public/' . $app->driver_photo_path);
                    }
                    $updateData['driver_photo_path'] = null;
                } elseif ($request->hasFile("drivers.{$index}.photo")) {
                    if ($app->driver_photo_path && Storage::exists('public/' . $app->driver_photo_path)) {
                        Storage::delete('public/' . $app->driver_photo_path);
                    }
                    $file = $request->file("drivers.{$index}.photo");
                    $path = $file->store('driver_photos', 'public');
                    $updateData['driver_photo_path'] = $path;
                }

                $app->update($updateData);
                $this->queueForSync('mtop_applications', $app->fresh()->toArray());
            }
        });

        return redirect()->back()->with('message', 'Driver information and photos updated successfully!');
    }

    public function printIds(Request $request)
    {
        $ids = explode(',', $request->query('ids', ''));
        $mayors = $request->query('mayors', []);
        $committees = $request->query('committees', []);
        $showCommittees = $request->query('show_committees', []);

        $applications = MtopApplication::whereIn('id', $ids)->get()->map(function (MtopApplication $app) use ($mayors, $committees, $showCommittees) {
            $data = $app->toArray();
            $data['print_mayor'] = $mayors[$app->id] ?? 'Municipal Mayor';
            $data['print_committee'] = $committees[$app->id] ?? 'Committee Chair';
            $data['show_committee'] = filter_var($showCommittees[$app->id] ?? false, FILTER_VALIDATE_BOOLEAN);
            return $data;
        });

        return Inertia::render('Mtop/PrintIds', [
            'applications' => $applications,
            'settings' => \App\Models\PrintSetting::first()
        ]);
    }

    public function renew($id): Response
    {
        $application = MtopApplication::findOrFail($id);
        $punong_bayans = Signatory::where('position', 'Punong Bayan')
            ->where('is_active', true)
            ->selectRaw("CONCAT(name, ' | ', position) as formatted_name")
            ->pluck('formatted_name');

        $officials = Signatory::whereIn('position', ['Authorized Official', 'Committee on Transportation'])
            ->where('is_active', true)
            ->selectRaw("CONCAT(name, ' | ', position) as formatted_name")
            ->pluck('formatted_name');

        $activeEvents = \App\Models\Event::where('is_active', true)
            ->whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now())
            ->get();

        $holidays = \App\Models\Holiday::where('is_active', true)->get();

        // Generate the suggested number
        $suggested_body_number = $this->generateNextAvailableBodyNumber();

        return Inertia::render('Mtop/Renew', [
            'application' => $application,
            'punong_bayans' => $punong_bayans,
            'officials' => $officials,
            'activeEvents' => $activeEvents,
            'holidays' => $holidays,
            'occupied_body_numbers' => $this->getOccupiedBodyNumbers(),
            'suggested_body_number' => $suggested_body_number // <--- ADD THIS
        ]);
    }

    public function storeRenewal(MtopApplicationRequest $request, $id, ValidityService $validityService): RedirectResponse
    {
        $oldApp = MtopApplication::findOrFail($id);
        $validated = $request->validated();

        $event = null;
        if (!empty($validated['event_id'])) {
            $e = \App\Models\Event::find($validated['event_id']);
            if ($e) {
                $tDate = Carbon::parse($request->transaction_date)->startOfDay();
                $eventStart = Carbon::parse($e->start_date)->startOfDay();
                $eventEnd = Carbon::parse($e->end_date)->endOfDay();

                if ($tDate->between($eventStart, $eventEnd)) {
                    $event = $e;
                } else {
                    $validated['event_id'] = null;
                    $validated['is_free'] = false;
                }
            }
        }
        $isFree = filter_var($validated['is_free'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $expiryResult = $validityService->computeExpiry(
            Carbon::parse($request->transaction_date),
            $validated['plate_no'] ?? null,
            !$isFree,
            $event
        );

        try {

            $newApp = DB::transaction(function () use ($oldApp, $validated, $expiryResult, $isFree) {
                $final_mt_number = $validated['mt_number'];

                $exists = MtopFranchise::where('mt_number', $final_mt_number)
                    ->where('id', '!=', $oldApp->franchise_id)
                    ->exists();

                if ($exists) {
                    throw new \Exception("The Control Number {$final_mt_number} was just updated by another user. Please use a different number.");
                }

                $oldApp->update(['status' => 'archived']);
                $this->queueForSync('mtop_applications', $oldApp->fresh()->toArray());

                if ($oldApp->franchise_id) {
                    $franchise = MtopFranchise::where('id', $oldApp->franchise_id)->first();
                    $franchise->update([
                        'mt_number' => $final_mt_number,
                        'body_number' => $validated['body_number'] ?? null,
                        'last_name' => $validated['last_name'],
                        'first_name' => $validated['first_name'],
                        'middle_name' => $validated['middle_name'],
                        'suffix' => $validated['suffix'],
                        'address' => $validated['address'],
                        'make_type' => $validated['make_type'],
                        'engine_motor_no' => $validated['engine_motor_no'],
                        'chassis_no' => $validated['chassis_no'],
                        'plate_no' => $validated['plate_no'],
                        'show_paid_by' => filter_var($validated['show_paid_by'] ?? false, FILTER_VALIDATE_BOOLEAN),
                        'paid_by_last_name' => $validated['paid_by_last_name'] ?? null,
                        'paid_by_first_name' => $validated['paid_by_first_name'] ?? null,
                        'paid_by_middle_name' => $validated['paid_by_middle_name'] ?? null,
                        'paid_by_suffix' => $validated['paid_by_suffix'] ?? null,
                    ]);
                    $this->queueForSync('mtop_franchises', $franchise->fresh()->toArray());
                }

                $applicationData = $validated;
                $applicationData['mt_number'] = $final_mt_number;
                $applicationData['status'] = 'active';
                $applicationData['franchise_id'] = $oldApp->franchise_id;
                $applicationData['transaction_type'] = 'Renewal';
                $applicationData['processed_by'] = Auth::id();
                $applicationData['is_free'] = $isFree;
                $applicationData['event_id'] = $validated['event_id'] ?? null;
                $applicationData['is_manual_validity'] = filter_var($validated['is_manual_validity'] ?? false, FILTER_VALIDATE_BOOLEAN);
                $applicationData['valid_until'] = $applicationData['is_manual_validity'] && !empty($validated['valid_until'])
                    ? $validated['valid_until']
                    : $expiryResult['expiry_date'];

                $newAppCreated = MtopApplication::create($applicationData);
                $this->queueForSync('mtop_applications', $newAppCreated->toArray());

                return $newAppCreated;
            });

            return redirect()->route('mtop.index')->with('success_data', [
                'id' => $newApp->id,
                'mt_number' => $newApp->mt_number,
                'operator_name' => $newApp->first_name . ' ' . $newApp->last_name . ($newApp->suffix ? ' ' . $newApp->suffix : ''),
            ])->with('message', 'Renewal successful!');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['mt_number' => $e->getMessage()])->withInput();
        }
    }

    public function transfer($id): Response
    {
        $application = MtopApplication::findOrFail($id);

        $punong_bayans = Signatory::where('position', 'Punong Bayan')
            ->where('is_active', true)
            ->selectRaw("CONCAT(name, ' | ', position) as formatted_name")
            ->pluck('formatted_name');

        $officials = Signatory::whereIn('position', ['Authorized Official', 'Committee on Transportation'])
            ->where('is_active', true)
            ->selectRaw("CONCAT(name, ' | ', position) as formatted_name")
            ->pluck('formatted_name');

        $activeEvents = \App\Models\Event::where('is_active', true)
            ->whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now())
            ->get();

        $holidays = \App\Models\Holiday::where('is_active', true)->get();

        // Generate the suggested number
        $suggested_body_number = $this->generateNextAvailableBodyNumber();

        return Inertia::render('Mtop/Transfer', [
            'application' => $application,
            'punong_bayans' => $punong_bayans,
            'officials' => $officials,
            'activeEvents' => $activeEvents,
            'holidays' => $holidays,
            'occupied_body_numbers' => $this->getOccupiedBodyNumbers(),
            'suggested_body_number' => $suggested_body_number // <--- ADD THIS
        ]);
    }

    public function storeTransfer(MtopApplicationRequest $request, $id, ValidityService $validityService): RedirectResponse
    {
        $oldApp = MtopApplication::findOrFail($id);
        $validated = $request->validated();

        $event = null;
        if (!empty($validated['event_id'])) {
            $e = \App\Models\Event::find($validated['event_id']);
            if ($e) {
                $tDate = Carbon::parse($request->transaction_date)->startOfDay();
                $eventStart = Carbon::parse($e->start_date)->startOfDay();
                $eventEnd = Carbon::parse($e->end_date)->endOfDay();

                if ($tDate->between($eventStart, $eventEnd)) {
                    $event = $e;
                } else {
                    $validated['event_id'] = null;
                    $validated['is_free'] = false;
                }
            }
        }
        $isFree = filter_var($validated['is_free'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $expiryResult = $validityService->computeExpiry(
            Carbon::parse($request->transaction_date),
            $validated['plate_no'] ?? null,
            !$isFree,
            $event
        );

        try {

            $newApp = DB::transaction(function () use ($oldApp, $validated, $expiryResult, $isFree) {
                $final_mt_number = $validated['mt_number'];

                $exists = MtopFranchise::where('mt_number', $final_mt_number)
                    ->where('id', '!=', $oldApp->franchise_id)
                    ->exists();

                if ($exists) {
                    throw new \Exception("The Control Number {$final_mt_number} was just updated by another user. Please use a different number.");
                }

                $oldApp->update(['status' => 'archived']);
                $this->queueForSync('mtop_applications', $oldApp->fresh()->toArray());

                if ($oldApp->franchise_id) {
                    $franchise = MtopFranchise::where('id', $oldApp->franchise_id)->first();
                    $franchise->update([
                        'mt_number' => $final_mt_number,
                        'body_number' => $validated['body_number'] ?? null,
                        'last_name' => $validated['last_name'],
                        'first_name' => $validated['first_name'],
                        'middle_name' => $validated['middle_name'],
                        'suffix' => $validated['suffix'],
                        'address' => $validated['address'],
                        'contact_number' => $validated['contact_number'] ?? null,
                        'make_type' => $validated['make_type'],
                        'engine_motor_no' => $validated['engine_motor_no'],
                        'chassis_no' => $validated['chassis_no'],
                        'plate_no' => $validated['plate_no'],
                        'show_paid_by' => filter_var($validated['show_paid_by'] ?? false, FILTER_VALIDATE_BOOLEAN),
                        'paid_by_last_name' => $validated['paid_by_last_name'] ?? null,
                        'paid_by_first_name' => $validated['paid_by_first_name'] ?? null,
                        'paid_by_middle_name' => $validated['paid_by_middle_name'] ?? null,
                        'paid_by_suffix' => $validated['paid_by_suffix'] ?? null,
                    ]);
                    $this->queueForSync('mtop_franchises', $franchise->fresh()->toArray());
                }

                $applicationData = $validated;
                $applicationData['mt_number'] = $final_mt_number;
                $applicationData['status'] = 'active';
                $applicationData['franchise_id'] = $oldApp->franchise_id;
                $applicationData['transaction_type'] = 'Transfer';
                $applicationData['processed_by'] = Auth::id();
                $applicationData['is_free'] = $isFree;
                $applicationData['event_id'] = $validated['event_id'] ?? null;
                $applicationData['is_manual_validity'] = filter_var($validated['is_manual_validity'] ?? false, FILTER_VALIDATE_BOOLEAN);
                $applicationData['valid_until'] = $applicationData['is_manual_validity'] && !empty($validated['valid_until'])
                    ? $validated['valid_until']
                    : $expiryResult['expiry_date'];

                $newAppCreated = MtopApplication::create($applicationData);
                $this->queueForSync('mtop_applications', $newAppCreated->toArray());

                return $newAppCreated;
            });

            return redirect()->route('mtop.index')->with('success_data', [
                'id' => $newApp->id,
                'mt_number' => $newApp->mt_number,
                'operator_name' => $newApp->first_name . ' ' . $newApp->last_name . ($newApp->suffix ? ' ' . $newApp->suffix : ''),
            ])->with('message', 'Ownership transferred successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['mt_number' => $e->getMessage()])->withInput();
        }
    }

    public function importData(Request $request): RedirectResponse
    {
        // Added xlsx and xls to the allowed extensions
        $request->validate([
            'import_file' => 'required|file|extensions:xlsx,xls,csv,txt|max:20480', // <--- FIXED
        ]);

        try {
            $file = $request->file('import_file');
            $validityService = app(\App\Services\ValidityService::class);

            DB::transaction(function () use ($file, $validityService) {
                $seenBodyNumbers = [];

                // FastExcel reads the file and returns rows as associative arrays
                (new FastExcel)->import($file->getRealPath(), function ($row) use (&$seenBodyNumbers, $validityService) {

                    // Normalize headers dynamically like your previous logic
                    $cleanRow = [];
                    foreach ($row as $key => $val) {
                        $clean = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $key);
                        $cleanRow[strtolower(trim($clean))] = trim((string)$val);
                    }

                    $getVal = function ($key) use ($cleanRow) {
                        return $cleanRow[$key] ?? '';
                    };

                    $mt_number = $getVal('control no');
                    if (empty($mt_number)) return; // "return" replaces "continue" inside a closure

                    $short_year = substr($mt_number, 2, 2);
                    $seq = substr($mt_number, 5);

                    $body_number = $getVal('body number');
                    if (empty($body_number) || strtoupper($body_number) === 'N/A' || strtoupper($body_number) === 'NONE') {
                        $body_number = "T{$short_year}-{$seq}";
                    }

                    $existsInDb = DB::table('mtop_franchises')
                        ->where('body_number', $body_number)
                        ->where('mt_number', '!=', $mt_number)
                        ->exists();

                    if (in_array($body_number, $seenBodyNumbers) || $existsInDb) {
                        $body_number = null;
                    } else {
                        if ($body_number !== null) {
                            $seenBodyNumbers[] = $body_number;
                        }
                    }

                    $plate_no = $getVal('plate no');
                    if (empty($plate_no)) {
                        $plate_no = "P{$short_year}-{$seq}";
                    }

                    $tDateRaw = $getVal('transaction date');
                    $tDate = !empty($tDateRaw) ? Carbon::parse($tDateRaw) : now();

                    $event = \App\Models\Event::where('is_active', true)
                        ->whereDate('start_date', '<=', $tDate)
                        ->whereDate('end_date', '>=', $tDate)
                        ->first();

                    $wantsFullValidity = $event ? false : true;

                    $expiryResult = $validityService->computeExpiry(
                        $tDate,
                        $plate_no,
                        $wantsFullValidity,
                        $event
                    );

                    $paidByRaw = $getVal('paid by details');
                    $show_paid_by = false;
                    $pb_first = null;
                    $pb_last = null;
                    if (!empty($paidByRaw) && strtoupper($paidByRaw) !== 'N/A') {
                        $show_paid_by = true;
                        $pbParts = explode(' ', $paidByRaw);
                        $pb_last = array_pop($pbParts);
                        $pb_first = implode(' ', $pbParts);
                        if (empty($pb_first)) {
                            $pb_first = $pb_last;
                            $pb_last = null;
                        }
                    }

                    $driverRaw = $getVal('driver name');
                    $has_driver = false;
                    $drv_first = null;
                    $drv_last = null;
                    if (!empty($driverRaw) && strtoupper($driverRaw) !== 'N/A') {
                        $has_driver = true;
                        $drvParts = explode(' ', $driverRaw);
                        $drv_last = array_pop($drvParts);
                        $drv_first = implode(' ', $drvParts);
                        if (empty($drv_first)) {
                            $drv_first = $drv_last;
                            $drv_last = null;
                        }
                    }

                    $franchise = MtopFranchise::updateOrCreate(
                        ['mt_number' => $mt_number],
                        [
                            'last_name' => $getVal('last name'),
                            'first_name' => $getVal('first name'),
                            'middle_name' => $getVal('middle name') ?: null,
                            'suffix' => $getVal('suffix') ?: null,
                            'address' => $getVal('address'),
                            'contact_number' => $getVal('contact #') ?: null,
                            'body_number' => $body_number,
                            'plate_no' => $plate_no,
                            'make_type' => $getVal('make/type'),
                            'engine_motor_no' => $getVal('engine no'),
                            'chassis_no' => $getVal('chassis no'),
                            'status' => $getVal('status') ?: 'active',
                            'show_paid_by' => $show_paid_by,
                            'paid_by_first_name' => $pb_first,
                            'paid_by_last_name' => $pb_last,
                        ]
                    );

                    $orDateRaw = $getVal('or date');
                    $cedDateRaw = $getVal('cedula date');

                    $application = MtopApplication::updateOrCreate(
                        ['mt_number' => $mt_number],
                        [
                            'franchise_id' => $franchise->id,
                            'transaction_date' => $tDate->format('Y-m-d'),
                            'transaction_type' => $getVal('transaction type') ?: 'New',
                            'last_name' => $getVal('last name'),
                            'first_name' => $getVal('first name'),
                            'middle_name' => $getVal('middle name') ?: null,
                            'suffix' => $getVal('suffix') ?: null,
                            'address' => $getVal('address'),
                            'contact_number' => $getVal('contact #') ?: null,
                            'body_number' => $body_number,
                            'plate_no' => $plate_no,
                            'make_type' => $getVal('make/type'),
                            'engine_motor_no' => $getVal('engine no'),
                            'chassis_no' => $getVal('chassis no'),
                            'or_number' => $getVal('or no') ?: null,
                            'or_date' => !empty($orDateRaw) ? date('Y-m-d', strtotime($orDateRaw)) : null,
                            'cedula_number' => $getVal('cedula no') ?: null,
                            'cedula_date' => !empty($cedDateRaw) ? date('Y-m-d', strtotime($cedDateRaw)) : null,
                            'punong_bayan' => $getVal('punong bayan') ?: null,
                            'authorized_official' => $getVal('authorized official') ?: null,
                            'status' => $getVal('status') ?: 'active',
                            'processed_by' => Auth::id(),
                            'is_free' => !$wantsFullValidity,
                            'event_id' => $event ? $event->id : null,
                            'valid_until' => $expiryResult['expiry_date'],

                            'has_driver' => $has_driver,
                            'driver_first_name' => $drv_first,
                            'driver_last_name' => $drv_last,
                            'show_paid_by' => $show_paid_by,
                            'paid_by_first_name' => $pb_first,
                            'paid_by_last_name' => $pb_last,
                        ]
                    );

                    $this->queueForSync('mtop_franchises', $franchise->toArray());
                    $this->queueForSync('mtop_applications', $application->toArray());
                });
            });

            return redirect()->back()->with('message', 'Data imported and validities recalculated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['import_file' => 'Error importing file: ' . $e->getMessage()]);
        }
    }
    private function queueForSync(string $tableName, array $payload)
    {
        SyncQueue::create([
            'table_name' => $tableName,
            'payload_json' => $payload,
            'status' => 'pending'
        ]);
    }

    /**
     * Helper to retrieve an array of currently occupied body numbers.
     */
    private function getOccupiedBodyNumbers(): array
    {
        return DB::table('mtop_franchises')
            ->where('status', '!=', 'cancelled')
            ->whereNotNull('body_number')
            ->pluck('body_number')
            ->map(fn($num) => (int) $num)
            ->toArray();
    }

    /**
     * Automatically generates the lowest available body number.
     * Recycles gaps from 'cancelled' records and increments up to 9999.
     */
    private function generateNextAvailableBodyNumber(): string
    {
        $occupiedNumbers = $this->getOccupiedBodyNumbers();

        // Loop up to 9999 (4-digits max)
        for ($number = 1; $number <= 9999; $number++) {
            if (!in_array($number, $occupiedNumbers)) {
                // sprintf("%04d") forces the number to be exactly 4 digits
                // by adding leading zeros (e.g., 1 becomes "0001", 12 becomes "0012")
                return sprintf("%04d", $number);
            }
        }

        throw new \Exception("Maximum 4-digit capacity reached. All 9999 body numbers are occupied.");
    }
}
