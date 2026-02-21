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
use Illuminate\Validation\Rule;
use App\Models\SyncQueue; // 🟢 ALREADY IMPORTED

class MtopApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $month = $request->input('month');
        $year = $request->input('year');
        $barangay = $request->input('barangay');
        $renewal = $request->input('renewal');

        $query = MtopApplication::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('last_name', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('body_number', 'like', "%{$search}%")
                    ->orWhere('mt_number', 'like', "%{$search}%")
                    ->orWhere('plate_no', 'like', "%{$search}%");
            });
        }

        if ($month) {
            $query->whereMonth('transaction_date', $month);
        }
        if ($year) {
            $query->whereYear('transaction_date', $year);
        }
        if ($barangay) {
            $query->where('address', 'like', "%{$barangay}%");
        }
        if ($renewal === 'upcoming') {
            $query->where('status', 'active')->whereBetween('valid_until', [now(), now()->addDays(60)]);
        } elseif ($renewal === 'expired') {
            $query->where(function ($q) {
                $q->where('status', 'expired')
                    ->orWhere(function ($subQ) {
                        $subQ->where('status', 'active')->whereDate('valid_until', '<', now());
                    });
            });
        } elseif ($renewal === 'active') {
            $query->where('status', 'active')->whereDate('valid_until', '>=', now());
        } elseif ($renewal === 'archived') {
            $query->where('status', 'archived');
        }

        $applications = $query->latest()
            ->paginate(10)
            ->withQueryString();

        $officials = Signatory::where('is_active', true)->get()->map(function ($s) {
            return ['name' => $s->name, 'position' => $s->position];
        });

        return Inertia::render('Mtop/Index', [
            'applications' => $applications,
            'filters' => $request->only(['search', 'month', 'year', 'barangay', 'renewal']),
            'officials' => $officials,
        ]);
    }

    public function create(): Response
    {
        $year = now()->year;

        $lastFranchise = MtopFranchise::where('mt_number', 'like', "$year-%")
            ->orderBy('id', 'desc')
            ->first();

        $nextSequence = 1;

        if ($lastFranchise) {
            $parts = explode('-', $lastFranchise->mt_number);
            if (count($parts) === 2) {
                $nextSequence = intval($parts[1]) + 1;
            }
        }

        $suggested_mt_number = sprintf("%s-%04d", $year, $nextSequence);

        $punong_bayans = Signatory::where('position', 'Punong Bayan')->where('is_active', true)->pluck('name');
        $officials = Signatory::where('position', 'Authorized Official')->where('is_active', true)->pluck('name');

        return Inertia::render('Mtop/Create', [
            'suggested_mt_number' => $suggested_mt_number,
            'punong_bayans' => $punong_bayans,
            'officials' => $officials
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'last_name' => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'first_name' => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'middle_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'suffix' => ['nullable', 'string', 'max:10', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'address' => 'required|string|max:100',
            'contact_number' => ['nullable', 'regex:/^(09|\+639)\d{9}$/'],
            'transaction_date' => 'required|date',
            'mt_number' => 'nullable|string',
            'body_number' => [
                'nullable',
                'regex:/^[0-9]+$/',
                'unique:mtop_franchises,body_number'
            ],
            'plate_no' => ['required', 'string', 'max:30'],
            'make_type' => 'required|string|max:30',
            'engine_motor_no' => 'required|string|max:30',
            'chassis_no' => 'required|string|max:30',
            'cedula_number' => 'required|string|max:20',
            'cedula_date' => 'required|date',
            'or_number' => 'required|string|max:20',
            'or_date' => 'required|date',
            'punong_bayan' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'authorized_official' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
        ], [
            'body_number.unique' => 'This Body Number is already assigned to another operator!'
        ]);

        $mtop = DB::transaction(function () use ($validated, $request) {
            $year = now()->year;

            $lastFranchise = MtopFranchise::where('mt_number', 'like', "$year-%")
                ->orderBy('id', 'desc')
                ->lockForUpdate()
                ->first();

            $nextSequence = 1;
            if ($lastFranchise) {
                $parts = explode('-', $lastFranchise->mt_number);
                if (count($parts) === 2) {
                    $nextSequence = intval($parts[1]) + 1;
                }
            }

            $generated_mt_number = sprintf("%s-%04d", $year, $nextSequence);

            $franchise = MtopFranchise::create([
                'mt_number' => $generated_mt_number,
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
            ]);

            $applicationData = $validated;
            $applicationData['mt_number'] = $generated_mt_number;
            $applicationData['valid_until'] = Carbon::parse($request->transaction_date)->addYears(3);
            $applicationData['status'] = 'active';
            $applicationData['franchise_id'] = $franchise->id;
            $applicationData['transaction_type'] = 'New';
            $applicationData['processed_by'] = Auth::id();

            $application = MtopApplication::create($applicationData);

            // 🟢 ELITE FEATURE #1: QUEUE FOR SYNC (CREATE)
            $this->queueForSync('mtop_franchises', $franchise->toArray());
            $this->queueForSync('mtop_applications', $application->toArray());

            return $application;
        });

        return redirect()->back()->with('success_data', [
            'id' => $mtop->id,
            'mt_number' => $mtop->mt_number,
            'operator_name' => $mtop->first_name . ' ' . $mtop->last_name . ($mtop->suffix ? ' ' . $mtop->suffix : ''),
        ])->with('message', 'Application and Franchise created successfully!');
    }

    public function edit($id): Response
    {
        $application = MtopApplication::findOrFail($id);
        $punong_bayans = Signatory::where('position', 'Punong Bayan')->where('is_active', true)->pluck('name');
        $officials = Signatory::where('position', 'Authorized Official')->where('is_active', true)->pluck('name');

        return Inertia::render('Mtop/Edit', [
            'application' => $application,
            'punong_bayans' => $punong_bayans,
            'officials' => $officials
        ]);
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $application = MtopApplication::findOrFail($id);

        $validated = $request->validate([
            'last_name' => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'first_name' => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'middle_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'suffix' => ['nullable', 'string', 'max:10', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'address' => 'required|string|max:100',
            'transaction_date' => 'required|date',
            'mt_number' => 'nullable|string|max:20',
            'body_number' => [
                'nullable',
                'regex:/^[0-9]+$/',
                Rule::unique('mtop_franchises', 'body_number')->ignore($application->franchise_id)
            ],
            'plate_no' => ['required', 'string', 'max:30'],
            'make_type' => 'required|string|max:30',
            'engine_motor_no' => 'required|string|max:30',
            'chassis_no' => 'required|string|max:30',
            'cedula_number' => 'required|string|max:20',
            'cedula_date' => 'required|date',
            'or_number' => 'required|string|max:20',
            'or_date' => 'required|date',
            'punong_bayan' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'authorized_official' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
        ], [
            'body_number.unique' => 'This Body Number is already assigned to another operator!'
        ]);

        if ($request->transaction_date) {
            $validated['valid_until'] = Carbon::parse($request->transaction_date)->addYears(3);
        }

        DB::transaction(function () use ($application, $validated) {
            $application->update($validated);

            // 🟢 ELITE FEATURE #1: QUEUE FOR SYNC (UPDATE)
            $this->queueForSync('mtop_applications', $application->fresh()->toArray());

            if ($application->franchise_id) {
                $franchise = MtopFranchise::find($application->franchise_id);
                if ($franchise) {
                    $franchise->update([
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
                    ]);

                    // 🟢 ELITE FEATURE #1: QUEUE FOR SYNC (UPDATE)
                    $this->queueForSync('mtop_franchises', $franchise->fresh()->toArray());
                }
            }
        });

        return redirect()->back()->with('success_data', [
            'id' => $application->id,
            'mt_number' => $application->mt_number,
            'operator_name' => $application->first_name . ' ' . $application->last_name . ($application->suffix ? ' ' . $application->suffix : ''),
        ])->with('message', 'Record updated successfully!');
    }

    public function destroy($id): RedirectResponse
    {
        $application = MtopApplication::findOrFail($id);

        DB::transaction(function () use ($application, $id) {
            if ($application->transaction_type === 'New' && $application->franchise_id) {
                MtopFranchise::where('id', $application->franchise_id)->delete();
                // 🟢 ELITE FEATURE #1: QUEUE FOR SYNC (DELETE)
                $this->queueForSync('mtop_franchises', ['id' => $application->franchise_id, '_action' => 'delete']);
            } else {
                // 🟢 ELITE FEATURE #1: QUEUE FOR SYNC (DELETE)
                $this->queueForSync('mtop_applications', ['id' => $id, '_action' => 'delete']);
                $application->delete();
            }
        });

        return redirect()->back()->with('message', 'Record deleted successfully.');
    }

    public function print($id): Response
    {
        $application = MtopApplication::findOrFail($id);
        return Inertia::render('Mtop/Print', [
            'application' => $application
        ]);
    }

    public function export(Request $request)
    {
        $search = $request->input('search');
        $month = $request->input('month');
        $year = $request->input('year');
        $barangay = $request->input('barangay');

        $query = MtopApplication::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('last_name', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('body_number', 'like', "%{$search}%")
                    ->orWhere('mt_number', 'like', "%{$search}%")
                    ->orWhere('plate_no', 'like', "%{$search}%");
            });
        }

        if ($month) {
            $query->whereMonth('transaction_date', $month);
        }
        if ($year) {
            $query->whereYear('transaction_date', $year);
        }
        if ($barangay) {
            $query->where('address', 'like', "%{$barangay}%");
        }

        $records = $query->latest()->get();

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
                'Valid Until',
                'Status'
            ]);

            foreach ($records as $row) {
                fputcsv($file, [
                    $row->mt_number,
                    $row->transaction_date,
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

                if ($request->hasFile("drivers.{$index}.photo")) {
                    if ($app->driver_photo_path && Storage::exists('public/' . $app->driver_photo_path)) {
                        Storage::delete('public/' . $app->driver_photo_path);
                    }

                    $file = $request->file("drivers.{$index}.photo");
                    $path = $file->store('driver_photos', 'public');
                    $updateData['driver_photo_path'] = $path;
                }

                $app->update($updateData);

                // 🟢 ELITE FEATURE #1: QUEUE FOR SYNC (DRIVER INFO)
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

        $applications = MtopApplication::whereIn('id', $ids)->get()->map(function ($app) use ($mayors, $committees) {
            $data = $app->toArray();

            $data['print_mayor'] = $mayors[$app->id] ?? 'Municipal Mayor';
            $data['print_committee'] = $committees[$app->id] ?? 'Committee Chair';

            return $data;
        });

        return Inertia::render('Mtop/PrintIds', [
            'applications' => $applications,
        ]);
    }

    public function renew($id): Response
    {
        $application = MtopApplication::findOrFail($id);
        $punong_bayans = Signatory::where('position', 'Punong Bayan')->where('is_active', true)->pluck('name');
        $officials = Signatory::where('position', 'Authorized Official')->where('is_active', true)->pluck('name');

        return Inertia::render('Mtop/Renew', [
            'application' => $application,
            'punong_bayans' => $punong_bayans,
            'officials' => $officials
        ]);
    }

    public function storeRenewal(Request $request, $id): RedirectResponse
    {
        $oldApp = MtopApplication::findOrFail($id);

        $validated = $request->validate([
            'last_name' => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'first_name' => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'middle_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'suffix' => ['nullable', 'string', 'max:10', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'address' => 'required|string|max:100',
            'transaction_date' => 'required|date',
            'body_number' => [
                'nullable',
                'regex:/^[0-9]+$/',
                Rule::unique('mtop_franchises', 'body_number')->ignore($oldApp->franchise_id)
            ],
            'plate_no' => ['required', 'string', 'max:30'],
            'make_type' => 'required|string|max:30',
            'engine_motor_no' => 'required|string|max:30',
            'chassis_no' => 'required|string|max:30',
            'cedula_number' => 'required|string|max:20',
            'cedula_date' => 'required|date',
            'or_number' => 'required|string|max:20',
            'or_date' => 'required|date',
            'punong_bayan' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'authorized_official' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
        ], [
            'body_number.unique' => 'This Body Number is already assigned to another operator!'
        ]);

        $newApp = DB::transaction(function () use ($oldApp, $validated, $request) {

            $oldApp->update(['status' => 'archived']);
            // 🟢 ELITE FEATURE #1: QUEUE FOR SYNC (ARCHIVE OLD)
            $this->queueForSync('mtop_applications', $oldApp->fresh()->toArray());

            if ($oldApp->franchise_id) {
                $franchise = MtopFranchise::where('id', $oldApp->franchise_id)->first();
                $franchise->update([
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
                ]);
                // 🟢 ELITE FEATURE #1: QUEUE FOR SYNC (UPDATE FRANCHISE)
                $this->queueForSync('mtop_franchises', $franchise->fresh()->toArray());
            }

            $applicationData = $validated;
            $applicationData['mt_number'] = $oldApp->mt_number;
            $applicationData['valid_until'] = Carbon::parse($request->transaction_date)->addYears(3);
            $applicationData['status'] = 'active';
            $applicationData['franchise_id'] = $oldApp->franchise_id;
            $applicationData['transaction_type'] = 'Renewal';
            $applicationData['processed_by'] = Auth::id();

            $newAppCreated = MtopApplication::create($applicationData);

            // 🟢 ELITE FEATURE #1: QUEUE FOR SYNC (CREATE RENEWAL)
            $this->queueForSync('mtop_applications', $newAppCreated->toArray());

            return $newAppCreated;
        });

        return redirect()->route('mtop.index')->with('success_data', [
            'id' => $newApp->id,
            'mt_number' => $newApp->mt_number,
            'operator_name' => $newApp->first_name . ' ' . $newApp->last_name . ($newApp->suffix ? ' ' . $newApp->suffix : ''),
        ])->with('message', 'Renewal successful!');
    }

    /**
     * Helper method to insert a record into the sync queue.
     */
    private function queueForSync(string $tableName, array $payload)
    {
        SyncQueue::create([
            'table_name' => $tableName,
            'payload_json' => $payload,
            'status' => 'pending'
        ]);
    }
}
