<?php

namespace App\Http\Controllers;

use App\Models\MtopApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Carbon\Carbon;
use App\Models\Signatory;
use Illuminate\Support\Facades\DB;

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

        $applications = $query->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Mtop/Index', [
            'applications' => $applications,
            'filters' => $request->only(['search', 'month', 'year', 'barangay']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $year = now()->year;

        // Generate Suggested MT Number
        $lastApp = MtopApplication::where('mt_number', 'like', "$year-%")
            ->orderBy('id', 'desc')
            ->first();

        $nextSequence = 1;

        if ($lastApp) {
            $parts = explode('-', $lastApp->mt_number);
            if (count($parts) === 2) {
                $nextSequence = intval($parts[1]) + 1;
            }
        }

        $suggested_mt_number = sprintf("%s-%04d", $year, $nextSequence);

        // Fetch Signatories for Dropdowns
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
            'last_name'           => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'first_name'          => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'middle_name'         => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'suffix'              => ['nullable', 'string', 'max:10', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'address'             => 'required|string|max:100',
            'contact_number'      => ['nullable', 'regex:/^(09|\+639)\d{9}$/'],

            // Transaction
            'transaction_date'    => 'required|date',
            'mt_number'           => 'nullable|string',

            // Unit
            'body_number'         => ['required', 'regex:/^[0-9]+$/'],
            'plate_no'            => ['required', 'string', 'max:20'],
            'make_type'           => 'required|string|max:30',
            'engine_motor_no'     => 'required|string|max:30',
            'chassis_no'          => 'required|string|max:30',

            // Docs & Signatories (STRICTLY REQUIRED)
            'cedula_number'       => 'required|string|max:20',
            'cedula_date'         => 'required|date',
            'or_number'           => 'required|string|max:20',
            'or_date'             => 'required|date',
            'punong_bayan'        => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'authorized_official' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
        ]);

        // ATOMIC TRANSACTION
        $mtop = DB::transaction(function () use ($validated, $request) {
            $year = now()->year;

            // Lock rows to prevent race conditions
            $lastApp = MtopApplication::where('mt_number', 'like', "$year-%")
                ->orderBy('id', 'desc')
                ->lockForUpdate()
                ->first();

            $nextSequence = 1;
            if ($lastApp) {
                $parts = explode('-', $lastApp->mt_number);
                if (count($parts) === 2) {
                    $nextSequence = intval($parts[1]) + 1;
                }
            }

            // Force generated number
            $validated['mt_number'] = sprintf("%s-%04d", $year, $nextSequence);
            $validated['valid_until'] = Carbon::parse($request->transaction_date)->addYears(3);
            $validated['status'] = 'draft';

            return MtopApplication::create($validated);
        });

        return redirect()->back()->with('success_data', [
            'id' => $mtop->id,
            'mt_number' => $mtop->mt_number,
            'operator_name' => $mtop->first_name . ' ' . $mtop->last_name . ($mtop->suffix ? ' ' . $mtop->suffix : ''),
        ])->with('message', 'Application created successfully!');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id): Response
    {
        $application = MtopApplication::findOrFail($id);

        // FETCH LISTS FOR EDIT DROPDOWNS
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
            'last_name'           => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'first_name'          => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'middle_name'         => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'suffix'              => ['nullable', 'string', 'max:10', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'address'             => 'required|string|max:100',
            'transaction_date'    => 'required|date',
            'mt_number'           => 'nullable|string|max:20',
            'body_number'         => ['required', 'regex:/^[0-9]+$/'],
            'plate_no'            => ['required', 'string', 'max:20'],
            'make_type'           => 'required|string|max:30',
            'engine_motor_no'     => 'required|string|max:30',
            'chassis_no'          => 'required|string|max:30',
            'cedula_number'       => 'required|string|max:20',
            'cedula_date'         => 'required|date',
            'or_number'           => 'required|string|max:20',
            'or_date'             => 'required|date',
            'punong_bayan'        => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'authorized_official' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
        ]);

        if ($request->transaction_date) {
            $validated['valid_until'] = Carbon::parse($request->transaction_date)->addYears(3);
        }

        $application->update($validated);

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
        $application->delete();

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
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$csvFileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
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
}
