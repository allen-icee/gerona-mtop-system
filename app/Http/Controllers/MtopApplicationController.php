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
            'activeEvents' => $activeEvents
        ]);
    }

    public function store(MtopApplicationRequest $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validated();

        try {
            $mtop = DB::transaction(function () use ($validated, $request) {
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
                $applicationData['is_free'] = filter_var($validated['is_free'] ?? false, FILTER_VALIDATE_BOOLEAN);
                $applicationData['event_id'] = $validated['event_id'] ?? null;

                $applicationData['valid_until'] = $this->calculateValidUntil(
                    $request->transaction_date,
                    $validated['plate_no'] ?? null,
                    $validated['event_id'] ?? null,
                    filter_var($validated['is_free'] ?? false, FILTER_VALIDATE_BOOLEAN)
                );

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

        return Inertia::render('Mtop/Edit', [
            'application' => $application,
            'punong_bayans' => $punong_bayans,
            'officials' => $officials,
            'activeEvents' => $activeEvents
        ]);
    }

    public function update(MtopApplicationRequest $request, $id): RedirectResponse
    {
        $application = MtopApplication::findOrFail($id);
        $validated = $request->validated();

        if ($request->transaction_date) {
            $validated['valid_until'] = $this->calculateValidUntil(
                $request->transaction_date,
                $validated['plate_no'] ?? null,
                $validated['event_id'] ?? null,
                filter_var($validated['is_free'] ?? false, FILTER_VALIDATE_BOOLEAN)
            );
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

        return Inertia::render('Mtop/Renew', [
            'application' => $application,
            'punong_bayans' => $punong_bayans,
            'officials' => $officials,
            'activeEvents' => $activeEvents
        ]);
    }

    public function storeRenewal(MtopApplicationRequest $request, $id): RedirectResponse
    {
        /** @var \App\Models\MtopApplication $oldApp */
        $oldApp = MtopApplication::findOrFail($id);
        $validated = $request->validated();

        try {
            $newApp = DB::transaction(function () use ($oldApp, $validated, $request) {
                $final_mt_number = $validated['mt_number'];

                $exists = MtopFranchise::where('mt_number', $final_mt_number)
                    ->where('id', '!=', $oldApp->franchise_id)
                    ->exists();

                if ($exists) {
                    throw new \Exception("The Control Number {$final_mt_number} was just updated by another user. Please use a different number.");
                }

                $oldApp->update(['status' => 'archived']);

                /** @var \App\Models\MtopApplication $freshOldApp */
                $freshOldApp = $oldApp->fresh();
                $this->queueForSync('mtop_applications', $freshOldApp->toArray());

                if ($oldApp->franchise_id) {
                    /** @var \App\Models\MtopFranchise $franchise */
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

                    /** @var \App\Models\MtopFranchise $freshFranchise */
                    $freshFranchise = $franchise->fresh();
                    $this->queueForSync('mtop_franchises', $freshFranchise->toArray());
                }

                $applicationData = $validated;
                $applicationData['mt_number'] = $final_mt_number;
                $applicationData['valid_until'] = $this->calculateValidUntil(
                    $request->transaction_date,
                    $validated['plate_no'] ?? null,
                    $validated['event_id'] ?? null,
                    filter_var($validated['is_free'] ?? false, FILTER_VALIDATE_BOOLEAN)
                );
                $applicationData['status'] = 'active';
                $applicationData['franchise_id'] = $oldApp->franchise_id;
                $applicationData['transaction_type'] = 'Renewal';
                $applicationData['processed_by'] = Auth::id();

                /** @var \App\Models\MtopApplication $newAppCreated */
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

    private function queueForSync(string $tableName, array $payload)
    {
        SyncQueue::create([
            'table_name' => $tableName,
            'payload_json' => $payload,
            'status' => 'pending'
        ]);
    }

    private function calculateValidUntil($transactionDateStr, $plateNo, $eventId = null, $isFree = false)
    {
        $transactionDate = Carbon::parse($transactionDateStr);
        $validUntil = $transactionDate->copy()->addYears(3);

        if ($eventId) {
            $event = \App\Models\Event::find($eventId);
            if ($event) {
                if ($isFree) {
                    return Carbon::parse($event->fixed_expiry_date);
                } else {
                    $eventExpiry = Carbon::parse($event->fixed_expiry_date);

                    $anchorDate = $eventExpiry->copy()->addDay();
                    while ($anchorDate->isWeekend()) {
                        $anchorDate->addDay();
                    }

                    $validUntil = $anchorDate->copy()->addYears(3);
                }
            }
        }

        if (!empty($plateNo) && $plateNo !== 'FOR REGISTRATION') {
            if (preg_match('/(\d)[^\d]*$/', $plateNo, $matches)) {
                $digit = (int) $matches[1];
                $targetMonth = $digit === 0 ? 10 : $digit;
                $year = $validUntil->year;

                $day = $transactionDate->day;
                $daysInMonth = Carbon::createFromDate($year, $targetMonth, 1)->daysInMonth;
                $finalDay = min($day, $daysInMonth);

                $validUntil = Carbon::createFromDate($year, $targetMonth, $finalDay);
            }
        }

        return $validUntil;
    }

    public function importData(Request $request)
    {
        $request->validate([
            'import_file' => 'required|file|max:51200',
        ]);

        $file = $request->file('import_file');
        $extension = strtolower($file->getClientOriginalExtension());

        if (!in_array($extension, ['csv', 'sqlite', 'db'])) {
            return back()->withErrors(['import_file' => 'Only CSV and SQLite (.sqlite, .db) files are allowed.']);
        }

        $importedCount = 0;

        try {
            DB::beginTransaction();

            if ($extension === 'csv') {
                $path = $file->getRealPath();

                $fileHandle = fopen($path, 'r');

                $bom = fread($fileHandle, 3);
                if ($bom !== "\xEF\xBB\xBF") {
                    rewind($fileHandle);
                }

                $header = fgetcsv($fileHandle);
                if (!$header) throw new \Exception("File is empty or invalid");
                $header = array_map('trim', $header);

                $headerMap = [
                    'Control No' => 'mt_number',
                    'Transaction Date' => 'transaction_date',
                    'Transaction Type' => 'transaction_type',
                    'Last Name' => 'last_name',
                    'First Name' => 'first_name',
                    'Middle Name' => 'middle_name',
                    'Suffix' => 'suffix',
                    'Address' => 'address',
                    'Contact #' => 'contact_number',
                    'Body Number' => 'body_number',
                    'Plate No' => 'plate_no',
                    'Make/Type' => 'make_type',
                    'Engine No' => 'engine_motor_no',
                    'Chassis No' => 'chassis_no',
                    'OR No' => 'or_number',
                    'OR Date' => 'or_date',
                    'Cedula No' => 'cedula_number',
                    'Cedula Date' => 'cedula_date',
                    'Punong Bayan' => 'punong_bayan',
                    'Authorized Official' => 'authorized_official',
                    'Valid Until' => 'valid_until',
                    'Status' => 'status'
                ];

                while (($row = fgetcsv($fileHandle)) !== false) {
                    if (empty(array_filter($row)) || count($header) !== count($row)) continue;

                    $rowAssoc = array_combine($header, $row);
                    $mappedRow = [];

                    foreach ($rowAssoc as $csvKey => $value) {
                        $mappedKey = $headerMap[$csvKey] ?? $csvKey;
                        $mappedRow[$mappedKey] = $value === '' ? null : trim($value);
                    }

                    if (empty($mappedRow['mt_number'])) continue;

                    $franchise = MtopFranchise::updateOrCreate(
                        ['mt_number' => $mappedRow['mt_number']],
                        [
                            'last_name' => $mappedRow['last_name'] ?? '',
                            'first_name' => $mappedRow['first_name'] ?? '',
                            'middle_name' => $mappedRow['middle_name'] ?? null,
                            'suffix' => $mappedRow['suffix'] ?? null,
                            'address' => $mappedRow['address'] ?? '',
                            'make_type' => $mappedRow['make_type'] ?? '',
                            'engine_motor_no' => $mappedRow['engine_motor_no'] ?? '',
                            'chassis_no' => $mappedRow['chassis_no'] ?? '',
                            'plate_no' => $mappedRow['plate_no'] ?? '',
                            'body_number' => $mappedRow['body_number'] ?? null,
                            'contact_number' => $mappedRow['contact_number'] ?? null,
                            'status' => 'active',
                        ]
                    );

                    $mappedRow['franchise_id'] = $franchise->id;
                    if (!isset($mappedRow['transaction_type'])) $mappedRow['transaction_type'] = 'Imported';
                    if (!isset($mappedRow['processed_by'])) $mappedRow['processed_by'] = Auth::id();

                    MtopApplication::updateOrCreate(
                        ['mt_number' => $mappedRow['mt_number']],
                        $mappedRow
                    );
                    $importedCount++;
                }
                fclose($fileHandle);
            } else {
                $tempDbPath = $file->getRealPath();
                config(['database.connections.import_db' => [
                    'driver' => 'sqlite',
                    'database' => $tempDbPath,
                ]]);

                $oldFranchises = DB::connection('import_db')->table('mtop_franchises')->get();
                foreach ($oldFranchises as $old) {
                    $rowAssoc = (array) $old;
                    unset($rowAssoc['id']);
                    MtopFranchise::updateOrCreate(['mt_number' => $rowAssoc['mt_number']], $rowAssoc);
                }

                $oldRecords = DB::connection('import_db')->table('mtop_applications')->get();
                foreach ($oldRecords as $old) {
                    $rowAssoc = (array) $old;
                    unset($rowAssoc['id']);

                    $localFranchise = MtopFranchise::where('mt_number', $rowAssoc['mt_number'])->first();
                    if ($localFranchise) {
                        $rowAssoc['franchise_id'] = $localFranchise->id;
                    }

                    MtopApplication::updateOrCreate(
                        ['mt_number' => $rowAssoc['mt_number']],
                        $rowAssoc
                    );
                    $importedCount++;
                }
                DB::purge('import_db');
            }

            DB::commit();

            if ($importedCount === 0) {
                return back()->withErrors(['import_file' => '0 records imported. Please ensure the CSV format perfectly matches the exported file.']);
            }

            \App\Models\AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'Imported Data',
                'payload' => "Imported $importedCount records from $extension file.",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return back()->with('message', "Success! Synced $importedCount records safely.");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['import_file' => 'Import failed: ' . $e->getMessage()]);
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

        return Inertia::render('Mtop/Transfer', [
            'application' => $application,
            'punong_bayans' => $punong_bayans,
            'officials' => $officials,
            'activeEvents' => $activeEvents
        ]);
    }

    public function storeTransfer(MtopApplicationRequest $request, $id): \Illuminate\Http\RedirectResponse
    {
        $oldApp = MtopApplication::findOrFail($id);
        $validated = $request->validated();

        try {
            $newApp = DB::transaction(function () use ($oldApp, $validated, $request) {
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
                $applicationData['is_free'] = filter_var($validated['is_free'] ?? false, FILTER_VALIDATE_BOOLEAN);
                $applicationData['event_id'] = $validated['event_id'] ?? null;

                $applicationData['valid_until'] = $this->calculateValidUntil(
                    $request->transaction_date,
                    $validated['plate_no'] ?? null,
                    $validated['event_id'] ?? null,
                    filter_var($validated['is_free'] ?? false, FILTER_VALIDATE_BOOLEAN)
                );

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
}
