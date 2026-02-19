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
use Illuminate\Validation\Rule; // <-- Used for update validation

class MtopApplicationController extends Controller
{
    /**
     * Display the main list with Search & Filters.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $month = $request->input('month');
        $year = $request->input('year');
        $barangay = $request->input('barangay');
        $renewal = $request->input('renewal');

        // We still list MtopApplications here because this represents the active ledger
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
            // Harmonized to 60 days to perfectly match the Frontend UI
            $query->where('status', 'active')->whereBetween('valid_until', [now(), now()->addDays(60)]);
        } elseif ($renewal === 'expired') {
            // Find records the script marked as 'expired', OR ones that just naturally expired today
            $query->where(function ($q) {
                $q->where('status', 'expired')
                    ->orWhere(function ($subQ) {
                        $subQ->where('status', 'active')->whereDate('valid_until', '<', now());
                    });
            });
        } elseif ($renewal === 'active') {
            // Only currently valid, active records
            $query->where('status', 'active')->whereDate('valid_until', '>=', now());
        } elseif ($renewal === 'archived') {
            // Only historical, old records
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

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $year = now()->year;

        // Generate Suggested MT Number based on the Permanent Franchise Table
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

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            // Applicant
            'last_name' => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'first_name' => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'middle_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'suffix' => ['nullable', 'string', 'max:10', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'address' => 'required|string|max:100',
            'contact_number' => ['nullable', 'regex:/^(09|\+639)\d{9}$/'],

            // Transaction
            'transaction_date' => 'required|date',
            'mt_number' => 'nullable|string',

            // Unit (WITH UNIQUE VALIDATION)
            'body_number' => [
                'nullable',
                'regex:/^[0-9]+$/',
                'unique:mtop_franchises,body_number' // Prevents crash, shows warning
            ],
            'plate_no' => ['required', 'string', 'max:30'],
            'make_type' => 'required|string|max:30',
            'engine_motor_no' => 'required|string|max:30',
            'chassis_no' => 'required|string|max:30',

            // Docs & Signatories
            'cedula_number' => 'required|string|max:20',
            'cedula_date' => 'required|date',
            'or_number' => 'required|string|max:20',
            'or_date' => 'required|date',
            'punong_bayan' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'authorized_official' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
        ], [
            // Custom friendly error message
            'body_number.unique' => 'This Body Number is already assigned to another operator!'
        ]);

        // ATOMIC TRANSACTION: Creates both Franchise and Application Ledger
        $mtop = DB::transaction(function () use ($validated, $request) {
            $year = now()->year;

            // Lock rows to prevent race conditions on Franchises table
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

            // Force generated MT Number
            $generated_mt_number = sprintf("%s-%04d", $year, $nextSequence);

            // 1. CREATE PERMANENT FRANCHISE RECORD
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

            // 2. CREATE THE SNAPSHOT TRANSACTION IN THE LEDGER
            $applicationData = $validated;
            $applicationData['mt_number'] = $generated_mt_number;
            $applicationData['valid_until'] = Carbon::parse($request->transaction_date)->addYears(3);
            $applicationData['status'] = 'active'; // No more draft phase

            // Add Ledger specific tracker fields
            $applicationData['franchise_id'] = $franchise->id;
            $applicationData['transaction_type'] = 'New';
            $applicationData['processed_by'] = Auth::id(); // Tracks which user processed this!

            return MtopApplication::create($applicationData);
        });

        return redirect()->back()->with('success_data', [
            'id' => $mtop->id,
            'mt_number' => $mtop->mt_number,
            'operator_name' => $mtop->first_name . ' ' . $mtop->last_name . ($mtop->suffix ? ' ' . $mtop->suffix : ''),
        ])->with('message', 'Application and Franchise created successfully!');
    }

    /**
     * Show the form for editing the specified resource.
     */
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

    /**
     * Update the specified resource in storage.
     */
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

            // Unit (WITH UNIQUE VALIDATION IGNORING ITSELF)
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
            // Custom friendly error message
            'body_number.unique' => 'This Body Number is already assigned to another operator!'
        ]);

        if ($request->transaction_date) {
            $validated['valid_until'] = Carbon::parse($request->transaction_date)->addYears(3);
        }

        // 1. Update the Ledger Application
        $application->update($validated);

        // 2. Sync changes back to the permanent Franchise record so they stay perfectly matched
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
            }
        }

        return redirect()->back()->with('success_data', [
            'id' => $application->id,
            'mt_number' => $application->mt_number,
            'operator_name' => $application->first_name . ' ' . $application->last_name . ($application->suffix ? ' ' . $application->suffix : ''),
        ])->with('message', 'Record updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): RedirectResponse
    {
        $application = MtopApplication::findOrFail($id);

        // If this is the original "New" application being deleted (e.g. a mistake by staff),
        // we should completely delete the permanent franchise to keep the database clean.
        if ($application->transaction_type === 'New' && $application->franchise_id) {
            MtopFranchise::where('id', $application->franchise_id)->delete();
        } else {
            $application->delete();
        }

        return redirect()->back()->with('message', 'Record deleted successfully.');
    }

    /**
     * Show the Print View.
     */
    public function print($id): Response
    {
        $application = MtopApplication::findOrFail($id);
        return Inertia::render('Mtop/Print', [
            'application' => $application
        ]);
    }

    /**
     * Export data to CSV
     */
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

    /**
     * Batch Update Driver Info & Photos
     */
    public function updateDriverInfo(Request $request)
    {
        $request->validate([
            'drivers' => 'required|array',
            'drivers.*.id' => 'required|exists:mtop_applications,id',
            'drivers.*.driver_name' => 'nullable|string|max:100',
            'drivers.*.photo' => 'nullable|image|max:10240',
        ]);

        $drivers = $request->input('drivers');

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
        }

        return redirect()->back()->with('message', 'Driver information and photos updated successfully!');
    }

    /**
     * Print IDs View
     */
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

    /**
     * Phase 3: Renew an existing active application
     */
    public function renew($id): RedirectResponse
    {
        $oldApp = MtopApplication::findOrFail($id);

        // Return the newly created app directly out of the transaction
        $newApp = DB::transaction(function () use ($oldApp) {
            // 1. Duplicate the exact record (this automatically copies the franchise_id too!)
            $duplicate = $oldApp->replicate();

            // 2. Set as Renewal and Clear out old receipts
            $duplicate->transaction_type = 'Renewal';
            $duplicate->status = 'active'; // The new one becomes active
            $duplicate->transaction_date = now();
            $duplicate->valid_until = null;
            $duplicate->or_number = null;
            $duplicate->or_date = null;
            $duplicate->cedula_number = null;
            $duplicate->cedula_date = null;
            $duplicate->processed_by = Auth::id(); // Audit Trail
            $duplicate->save();

            // 3. Archive the old application so it is kept in history but no longer active
            $oldApp->update(['status' => 'archived']);

            return $duplicate; // Return it so $newApp catches it
        });

        // 4. Send them straight to the Edit screen of the newly generated row!
        return redirect()->route('mtop.edit', $newApp->id)
            ->with('message', 'Renewal record generated! Please fill in the new OR and Cedula details.');
    }
}
