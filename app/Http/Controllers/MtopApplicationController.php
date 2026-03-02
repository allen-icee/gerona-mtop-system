<?php

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
use App\Services\ValidityService; // <-- Injected Service

class MtopApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'month', 'year', 'barangay', 'renewal']);

        $applications = MtopApplication::filter($filters)
            ->orderBy('mt_number', 'desc')
            ->paginate(10)
            ->withQueryString();

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
            'activeEvents' => $activeEvents
        ]);
    }

    public function create(): \Inertia\Response
    {
        $year = now()->year;
        $holidays = \App\Models\Holiday::where('is_active', true)->get();

        $mtNumbers = MtopFranchise::where('mt_number', 'like', "$year-%")->pluck('mt_number');

        $maxSeq = 0;
        foreach ($mtNumbers as $num) {
            $parts = explode('-', $num);
            $seq = isset($parts[1]) ? (int)$parts[1] : 0;
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

        return Inertia::render('Mtop/Create', [
            'suggested_mt_number' => $suggested_mt_number,
            'punong_bayans' => $punong_bayans,
            'officials' => $officials,
            'activeEvents' => $activeEvents,
            'holidays' => $holidays
        ]);
    }

    public function store(MtopApplicationRequest $request, ValidityService $validityService): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();

        // 1. Compute Expiry via Service BEFORE the transaction
        $event = !empty($validated['event_id']) ? \App\Models\Event::find($validated['event_id']) : null;
        $isFree = filter_var($validated['is_free'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $expiryResult = $validityService->computeExpiry(
            Carbon::parse($request->transaction_date),
            $validated['plate_no'] ?? null,
            !$isFree, // wantsFullValidity = not free
            $event
        );

        try {
            $mtop = DB::transaction(function () use ($validated, $request, $expiryResult) {
                $final_mt_number = $validated['mt_number'];
                $year = now()->year;

                MtopFranchise::where('mt_number', 'like', "$year-%")->lockForUpdate()->pluck('id');

                while (MtopFranchise::where('mt_number', $final_mt_number)->exists()) {
                    $parts = explode('-', $final_mt_number);
                    $seq = isset($parts[1]) ? intval($parts[1]) : 0;
                    $final_mt_number = sprintf("%s-%04d", $year, $seq + 1);
                }

                $franchise = MtopFranchise::create([
                    'mt_number' => $final_mt_number,
                    'body_number' => $validated['body_number'] ?? null,
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

                // 2. Assign the computed legal expiry
                $applicationData['valid_until'] = $expiryResult['expiry_date'];

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
            'holidays' => $holidays
        ]);
    }

    public function update(MtopApplicationRequest $request, $id, ValidityService $validityService): RedirectResponse
    {
        $application = MtopApplication::findOrFail($id);
        $validated = $request->validated();

        if ($request->transaction_date) {
            $event = !empty($validated['event_id']) ? \App\Models\Event::find($validated['event_id']) : null;
            $isFree = filter_var($validated['is_free'] ?? false, FILTER_VALIDATE_BOOLEAN);

            $expiryResult = $validityService->computeExpiry(
                Carbon::parse($request->transaction_date),
                $validated['plate_no'] ?? null,
                !$isFree,
                $event
            );
            $validated['valid_until'] = $expiryResult['expiry_date'];
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
                            'show_paid_by' => filter_var($validated['show_paid_by'] ?? false, FILTER_VALIDATE_BOOLEAN),
                            'paid_by_last_name' => $validated['paid_by_last_name'] ?? null,
                            'paid_by_first_name' => $validated['paid_by_first_name'] ?? null,
                            'paid_by_middle_name' => $validated['paid_by_middle_name'] ?? null,
                            'paid_by_suffix' => $validated['paid_by_suffix'] ?? null,
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
        $records = MtopApplication::filter($request->all())
            ->orderBy('mt_number', 'desc')
            ->cursor();

        $csvFileName = 'mtop_records_' . date('Y-m-d_H-i') . '.csv';
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$csvFileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($records) {
            $file = fopen('php://output', 'w');

            fputcsv($file, [
                'Control No',
                'Transaction Date',
                'Transaction Type',
                'Last Name',
                'First Name',
                'Middle Name',
                'Suffix',
                'Address',
                'Contact #',
                'Body Number',
                'Plate No',
                'Make/Type',
                'Engine No',
                'Chassis No',
                'OR No',
                'OR Date',
                'Cedula No',
                'Cedula Date',
                'Punong Bayan',
                'Authorized Official',
                'Valid Until',
                'Status'
            ]);

            foreach ($records as $row) {
                fputcsv($file, [
                    $row->mt_number,
                    $row->transaction_date,
                    $row->transaction_type,
                    $row->last_name,
                    $row->first_name,
                    $row->middle_name,
                    $row->suffix,
                    $row->address,
                    $row->contact_number,
                    $row->body_number,
                    $row->plate_no,
                    $row->make_type,
                    $row->engine_motor_no,
                    $row->chassis_no,
                    $row->or_number,
                    $row->or_date,
                    $row->cedula_number,
                    $row->cedula_date,
                    $row->punong_bayan,
                    $row->authorized_official,
                    $row->valid_until,
                    $row->status
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function updateDriverInfo(Request $request)
    {
        $request->validate([
            'drivers' => 'required|array',
            'drivers.*.id' => 'required|exists:mtop_applications,id',
            'drivers.*.driver_name' => 'nullable|string|max:100',
            'drivers.*.photo' => 'nullable|image|max:10240',
        ]);

        $drivers = $request->input('drivers');

        DB::transaction(function () use ($request, $drivers) {
            foreach ($drivers as $index => $data) {
                $app = MtopApplication::find($data['id']);
                $updateData = ['driver_name' => $data['driver_name'] ?? $app->driver_name];

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

        $applications = MtopApplication::whereIn('id', $ids)->get()->map(function (MtopApplication $app) use ($mayors, $committees) {
            $data = $app->toArray();
            $data['print_mayor'] = $mayors[$app->id] ?? 'Municipal Mayor';
            $data['print_committee'] = $committees[$app->id] ?? 'Committee Chair';
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

        return Inertia::render('Mtop/Renew', [
            'application' => $application,
            'punong_bayans' => $punong_bayans,
            'officials' => $officials,
            'activeEvents' => $activeEvents,
            'holidays' => $holidays
        ]);
    }

    public function storeRenewal(MtopApplicationRequest $request, $id, ValidityService $validityService): RedirectResponse
    {
        $oldApp = MtopApplication::findOrFail($id);
        $validated = $request->validated();

        $event = !empty($validated['event_id']) ? \App\Models\Event::find($validated['event_id']) : null;
        $isFree = filter_var($validated['is_free'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $expiryResult = $validityService->computeExpiry(
            Carbon::parse($request->transaction_date),
            $validated['plate_no'] ?? null,
            !$isFree,
            $event
        );

        try {
            $newApp = DB::transaction(function () use ($oldApp, $validated, $expiryResult) {
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
                $applicationData['valid_until'] = $expiryResult['expiry_date'];

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

    public function transfer($id): \Inertia\Response
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

        return Inertia::render('Mtop/Transfer', [
            'application' => $application,
            'punong_bayans' => $punong_bayans,
            'officials' => $officials,
            'activeEvents' => $activeEvents,
            'holidays' => $holidays
        ]);
    }

    public function storeTransfer(MtopApplicationRequest $request, $id, ValidityService $validityService): \Illuminate\Http\RedirectResponse
    {
        $oldApp = MtopApplication::findOrFail($id);
        $validated = $request->validated();

        $event = !empty($validated['event_id']) ? \App\Models\Event::find($validated['event_id']) : null;
        $isFree = filter_var($validated['is_free'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $expiryResult = $validityService->computeExpiry(
            Carbon::parse($request->transaction_date),
            $validated['plate_no'] ?? null,
            !$isFree,
            $event
        );

        try {
            $newApp = DB::transaction(function () use ($oldApp, $validated, $expiryResult) {
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
                $applicationData['valid_until'] = $expiryResult['expiry_date'];

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

    private function queueForSync(string $tableName, array $payload)
    {
        SyncQueue::create([
            'table_name' => $tableName,
            'payload_json' => $payload,
            'status' => 'pending'
        ]);
    }
}
