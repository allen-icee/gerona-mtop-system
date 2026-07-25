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

    private function handleBodyNumberReassignment($body_number, $force_reassign, $ignore_franchise_id = null)
    {
        if (empty($body_number)) return;

        $query = \App\Models\MtopFranchise::where('body_number', $body_number)
            ->where('status', 'active');
            
        if ($ignore_franchise_id) {
            $query->where('id', '!=', $ignore_franchise_id);
        }

        $existingActive = $query->first();

        if ($existingActive) {
            if (!$force_reassign) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'body_number' => 'REASSIGN_CONFIRMATION_REQUIRED'
                ]);
            } else {
                $existingActive->update(['status' => 'dropped']);
            }
        }
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
            'occupied_body_numbers' => (object) $this->getOccupiedBodyNumbers()
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
                $final_body_number = $validated['body_number'] ?? null;
                // Client requested to allow overriding body numbers instead of restricting it.
                // We will still auto-generate one if left entirely blank.
                if (empty($final_body_number)) {
                    $final_body_number = $this->generateNextAvailableBodyNumber();
                }

                $this->handleBodyNumberReassignment($final_body_number, filter_var($validated['force_reassign'] ?? false, FILTER_VALIDATE_BOOLEAN));

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
            'occupied_body_numbers' => (object) $this->getOccupiedBodyNumbers($application->franchise_id)
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
                        $this->handleBodyNumberReassignment($validated['body_number'] ?? null, filter_var($validated['force_reassign'] ?? false, FILTER_VALIDATE_BOOLEAN), $franchise->id);
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

        $validated = $request->validate([]);

        $validated['status'] = 'cancelled';

        DB::transaction(function () use ($application, $validated) {
            $originalStatus = $application->status;
            $application->update($validated);
            $this->queueForSync('mtop_applications', $application->fresh()->toArray());

            if ($application->franchise_id) {
                $franchise = MtopFranchise::find($application->franchise_id);

                if ($franchise && in_array($originalStatus, ['active', 'upcoming', 'expired'])) {
                    $franchise->update([
                        'status' => 'cancelled',
                        'last_name' => $validated['last_name'] ?? $franchise->last_name,
                        'first_name' => $validated['first_name'] ?? $franchise->first_name,
                        'middle_name' => $validated['middle_name'] ?? $franchise->middle_name,
                        'address' => $validated['address'] ?? $franchise->address,
                        'make_type' => $validated['make_type'] ?? $franchise->make_type,
                        'engine_motor_no' => $validated['engine_motor_no'] ?? $franchise->engine_motor_no,
                        'chassis_no' => $validated['chassis_no'] ?? $franchise->chassis_no,
                        'plate_no' => $validated['plate_no'] ?? $franchise->plate_no,
                        'body_number' => $validated['body_number'] ?? $franchise->body_number,
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

            if ($franchiseId) {
                if ($isNew) {
                    MtopFranchise::where('id', $franchiseId)->delete();
                    $this->queueForSync('mtop_franchises', ['id' => $franchiseId, '_action' => 'delete']);
                } else {
                    $franchise = MtopFranchise::find($franchiseId);
                    if ($franchise) {
                        $franchise->update(['status' => 'cancelled']);
                        $this->queueForSync('mtop_franchises', $franchise->fresh()->toArray());
                    }
                }
            }
        });

        return redirect()->back()->with('message', 'Record deleted and body number freed successfully.');
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

        $records = $query->cursor();
        $fileName = 'mtop_records_' . date('Y-m-d_H-i') . '.xlsx';
        $generator = function () use ($records) {
            foreach ($records as $record) {
                yield $record;
            }
        };

        return (new FastExcel($generator()))->download($fileName, function ($row) {
            $formatValue = function ($value) {
                $val = trim((string)$value);
                return ($val === '' || strtoupper($val) === 'N/A') ? '-' : $val;
            };

            $paidBy = '-';
            if ($row->show_paid_by) {
                $pbMiddle = $row->paid_by_middle_name ? substr($row->paid_by_middle_name, 0, 1) . '. ' : '';
                $paidBy = trim("{$row->paid_by_first_name} {$pbMiddle}{$row->paid_by_last_name} {$row->paid_by_suffix}");
            }

            $driverName = '-';
            if ($row->has_driver) {
                $dMiddle = $row->driver_middle_name ? substr($row->driver_middle_name, 0, 1) . '. ' : '';
                $driverName = trim("{$row->driver_first_name} {$dMiddle}{$row->driver_last_name} {$row->driver_suffix}");
            }

            $validUntilDate = '-';
            if (!empty($row->valid_until)) {
                $validUntilDate = date('Y-m-d', strtotime($row->valid_until));
            }

            $exportBodyNum = preg_match('/^T\d{2}-\d+$/', (string)$row->body_number) ? '-' : $formatValue($row->body_number);

            return [
                'Control No' => $formatValue($row->mt_number),
                'Transaction Date' => $formatValue($row->transaction_date),
                'Transaction Type' => $formatValue($row->transaction_type),
                'Last Name' => $formatValue($row->last_name),
                'First Name' => $formatValue($row->first_name),
                'Middle Name' => $formatValue($row->middle_name),
                'Suffix' => $formatValue($row->suffix),
                'Paid By Details' => $formatValue($paidBy),
                'Driver Name' => $formatValue($driverName),
                'Address' => $formatValue($row->address),
                'Contact #' => $formatValue($row->contact_number),
                'Body Number' => $exportBodyNum,
                'Plate No' => $formatValue($row->plate_no),
                'Make/Type' => $formatValue($row->make_type),
                'Engine No' => $formatValue($row->engine_motor_no),
                'Chassis No' => $formatValue($row->chassis_no),
                'OR No' => $formatValue($row->or_number),
                'OR Date' => $formatValue($row->or_date),
                'Cedula No' => $formatValue($row->cedula_number),
                'Cedula Date' => $formatValue($row->cedula_date),
                'Punong Bayan' => $formatValue($row->punong_bayan),
                'Authorized Official' => $formatValue($row->authorized_official),
                'Is Free/Promo' => $row->is_free ? 'YES' : 'NO',
                'Valid Until' => $validUntilDate,
                'Status' => $formatValue($row->status)
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

        $suggested_body_number = $this->generateNextAvailableBodyNumber();

        return Inertia::render('Mtop/Renew', [
            'application' => $application,
            'punong_bayans' => $punong_bayans,
            'officials' => $officials,
            'activeEvents' => $activeEvents,
            'holidays' => $holidays,
            'occupied_body_numbers' => (object) $this->getOccupiedBodyNumbers($application->franchise_id),
            'suggested_body_number' => $suggested_body_number
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
                    $this->handleBodyNumberReassignment($validated['body_number'] ?? null, filter_var($validated['force_reassign'] ?? false, FILTER_VALIDATE_BOOLEAN), $franchise->id);
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

        $suggested_body_number = $this->generateNextAvailableBodyNumber();

        return Inertia::render('Mtop/Transfer', [
            'application' => $application,
            'punong_bayans' => $punong_bayans,
            'officials' => $officials,
            'activeEvents' => $activeEvents,
            'holidays' => $holidays,
            'occupied_body_numbers' => (object) $this->getOccupiedBodyNumbers($application->franchise_id),
            'suggested_body_number' => $suggested_body_number
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
                    $this->handleBodyNumberReassignment($validated['body_number'] ?? null, filter_var($validated['force_reassign'] ?? false, FILTER_VALIDATE_BOOLEAN), $franchise->id);
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
        $request->validate([
            'import_file' => 'required|file|extensions:xlsx,xls,csv,txt,sqlite|max:51200',
        ]);

        try {
            $file = $request->file('import_file');
            $validityService = app(\App\Services\ValidityService::class);
            $extension = strtolower($file->getClientOriginalExtension());
            $filename = 'import_' . time() . '_' . uniqid() . '.' . $extension;
            $destinationPath = storage_path('app' . DIRECTORY_SEPARATOR . 'temp');

            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }

            $file->move($destinationPath, $filename);
            $fullPath = $destinationPath . DIRECTORY_SEPARATOR . $filename;

            if ($extension === 'sqlite') {
                $this->processSqliteImport($fullPath);
            } else {
                $this->processSpreadsheetImport($fullPath, $validityService);
            }

            if (file_exists($fullPath)) {
                unlink($fullPath);
            }

            return redirect()->back()->with('message', 'Data imported successfully!');
        } catch (\Exception $e) {
            if (isset($fullPath) && file_exists($fullPath)) {
                unlink($fullPath);
            }
            return redirect()->back()->withErrors(['import_file' => 'Error importing file: ' . $e->getMessage()]);
        }
    }

    private function processSqliteImport(string $backupPath)
    {
        \Illuminate\Support\Facades\Config::set('database.connections.sqlite_backup', [
            'driver' => 'sqlite',
            'database' => $backupPath,
            'prefix' => '',
            'foreign_key_constraints' => false,
        ]);
        DB::purge('sqlite_backup');

        try {
            $oldFranchises = DB::connection('sqlite_backup')->table('mtop_franchises')->get();
            $oldApplications = DB::connection('sqlite_backup')->table('mtop_applications')->get();

            DB::transaction(function () use ($oldFranchises, $oldApplications) {
                $seenBodyNumbers = [];

                foreach ($oldFranchises as $franchise) {
                    $exists = DB::table('mtop_franchises')->where('mt_number', $franchise->mt_number)->exists();
                    if (!$exists) {
                        $franchiseData = (array) $franchise;
                        $status = strtolower($franchiseData['status'] ?? 'active');

                        $bNum = trim($franchiseData['body_number'] ?? '');
                        if ($bNum === '' || strtoupper($bNum) === 'N/A' || strtoupper($bNum) === 'NONE') {
                            $franchiseData['body_number'] = null;
                        } else {
                            if (in_array($status, ['cancelled', 'archived', 'expired'])) {
                                $franchiseData['body_number'] = null;
                            } else {
                                $bodyExistsInDb = DB::table('mtop_franchises')->where('body_number', $bNum)
                                    ->whereNotIn('status', ['cancelled', 'archived', 'expired'])
                                    ->exists();

                                if (in_array($bNum, $seenBodyNumbers) || $bodyExistsInDb) {
                                    $franchiseData['body_number'] = null;
                                } else {
                                    $seenBodyNumbers[] = $bNum;
                                }
                            }
                        }
                        DB::table('mtop_franchises')->insert($franchiseData);
                    }
                }

                foreach ($oldApplications as $app) {
                    $exists = DB::table('mtop_applications')->where('id', $app->id)->exists();
                    if (!$exists) {
                        $data = (array) $app;
                        if (!array_key_exists('is_manual_validity', $data)) $data['is_manual_validity'] = 0;
                        if (!array_key_exists('is_free', $data)) $data['is_free'] = 0;
                        if (!array_key_exists('show_paid_by', $data)) $data['show_paid_by'] = 0;

                        DB::table('mtop_applications')->insert($data);
                    }
                }
            });
        } finally {
            DB::disconnect('sqlite_backup');
            DB::purge('sqlite_backup');
        }
    }

    private function processSpreadsheetImport(string $fullPath, \App\Services\ValidityService $validityService)
    {
        DB::transaction(function () use ($fullPath, $validityService) {
            $seenBodyNumbers = [];

            (new \Rap2hpoutre\FastExcel\FastExcel)->import($fullPath, function ($row) use (&$seenBodyNumbers, $validityService) {

                $cleanRow = [];
                foreach ($row as $key => $val) {
                    $clean = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $key);
                    $cleanRow[strtolower(trim($clean))] = trim((string)$val);
                }

                $getVal = function ($key) use ($cleanRow) {
                    $val = trim((string)($cleanRow[$key] ?? ''));

                    if ($val === '-' || strtoupper($val) === 'N/A') {
                        return '';
                    }

                    return $val;
                };

                $mt_number = $getVal('control no');
                if (empty($mt_number)) return;

                $short_year = substr($mt_number, 2, 2);
                $seq = substr($mt_number, 5);

                $raw_body = $getVal('body number');
                if (empty($raw_body) || strtoupper($raw_body) === 'N/A' || strtoupper($raw_body) === 'NONE') {
                    $raw_body = null;
                }

                $row_status = strtolower($getVal('status') ?: 'active');
                $app_body_number = $raw_body;
                $franchise_body_number = $raw_body;
                if (in_array($row_status, ['cancelled', 'archived', 'expired'])) {
                    $franchise_body_number = null;
                } else {
                    $existsInDb = DB::table('mtop_franchises')
                        ->where('body_number', $franchise_body_number)
                        ->where('mt_number', '!=', $mt_number)
                        ->whereNotIn('status', ['cancelled', 'archived', 'expired'])
                        ->exists();

                    if (in_array($franchise_body_number, $seenBodyNumbers) || $existsInDb) {
                        $franchise_body_number = null;
                    } else {
                        $seenBodyNumbers[] = $franchise_body_number;
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

                $paidByRaw = $getVal('paid by details') ?: $getVal('paid by');
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
                        'body_number' => $franchise_body_number,
                        'plate_no' => $plate_no,
                        'make_type' => $getVal('make/type'),
                        'engine_motor_no' => $getVal('engine no'),
                        'chassis_no' => $getVal('chassis no'),
                        'status' => $row_status,
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
                        'body_number' => $app_body_number,
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
                        'status' => $row_status,
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
    }

    private function queueForSync(string $tableName, array $payload)
    {
        SyncQueue::create([
            'table_name' => $tableName,
            'payload_json' => $payload,
            'status' => 'pending'
        ]);
    }

    private function getOccupiedBodyNumbers($excludeFranchiseId = null): array
    {
        $query = DB::table('mtop_franchises')
            ->whereNotIn('status', ['cancelled', 'archived', 'expired'])
            ->whereNotNull('body_number');

        if ($excludeFranchiseId) {
            $query->where('id', '!=', $excludeFranchiseId);
        }

        $franchises = $query->get(['body_number', 'first_name', 'last_name']);

        $occupied = [];
        foreach ($franchises as $f) {
            $num = (int) $f->body_number;
            $occupied[(string)$num] = trim("{$f->first_name} {$f->last_name}");
        }

        return $occupied;
    }

    private function generateNextAvailableBodyNumber(): string
    {
        $occupiedNumbers = $this->getOccupiedBodyNumbers();
        $occupiedKeys = array_keys($occupiedNumbers);

        for ($number = 1; $number <= 9999; $number++) {
            if (!in_array((string)$number, $occupiedKeys) && !in_array($number, $occupiedKeys)) {
                return sprintf("%04d", $number);
            }
        }

        throw new \Exception("Maximum 4-digit capacity reached. All 9999 body numbers are occupied.");
    }

    public function clear(): RedirectResponse
    {
        DB::beginTransaction();
        try {
            MtopApplication::query()->delete();
            MtopFranchise::query()->delete();
            
            // Delete all associated files in storage
            Storage::disk('public')->deleteDirectory('signatures');
            Storage::disk('public')->deleteDirectory('pictures');
            Storage::disk('public')->deleteDirectory('generated_ids');

            DB::commit();
            return redirect()->route('mtop.index')->with('success', 'All MTOP records have been cleared successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('mtop.index')->with('error', 'Failed to clear records: ' . $e->getMessage());
        }
    }
}
