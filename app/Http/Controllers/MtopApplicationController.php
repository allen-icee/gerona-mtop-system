<?php

namespace App\Http\Controllers;

use App\Models\MtopApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Carbon\Carbon; // <--- Needed for date calculation

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
        $barangay = $request->input('barangay'); // NEW FILTER

        $query = MtopApplication::query();

        // Search Logic (Updated for split names)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('last_name', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('body_number', 'like', "%{$search}%")
                    ->orWhere('mt_number', 'like', "%{$search}%") // Search by Control No.
                    ->orWhere('plate_no', 'like', "%{$search}%");
            });
        }

        // Filter Logic
        if ($month) {
            $query->whereMonth('transaction_date', $month);
        }
        if ($year) {
            $query->whereYear('transaction_date', $year);
        }
        if ($barangay) {
            // Flexible match: "Poblacion 1" matches "POBLACION 1, GERONA..."
            $query->where('address', 'like', "%{$barangay}%");
        }

        $applications = $query->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Mtop/Index', [
            'applications' => $applications,
            'filters' => $request->only(['search', 'month', 'year', 'barangay']), // Pass it to React
        ]);
    }
    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        // 1. Get Current Year
        $year = now()->year;

        // 2. Find the latest MT number for this year (e.g., "2026-0005")
        $lastApp = MtopApplication::where('mt_number', 'like', "$year-%")
            ->orderBy('id', 'desc') // Order by ID to get the latest created
            ->first();

        $nextSequence = 1;

        if ($lastApp) {
            // Extract the sequence part (after the hyphen)
            $parts = explode('-', $lastApp->mt_number);
            if (count($parts) === 2) {
                $nextSequence = intval($parts[1]) + 1;
            }
        }

        // 3. Format as YYYY-XXXX (e.g., 2026-0001)
        $suggested_mt_number = sprintf("%s-%04d", $year, $nextSequence);

        return Inertia::render('Mtop/Create', [
            'suggested_mt_number' => $suggested_mt_number
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            // NAMES: Letters, spaces, dots, dashes only. No numbers!
            'last_name'   => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\-]+$/'],
            'first_name'  => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\-]+$/'],
            'middle_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\-]+$/'],

            'address'        => 'required|string|max:100',
            'contact_number' => ['nullable', 'regex:/^(09|\+639)\d{9}$/'], // Must be valid PH mobile

            'transaction_date' => 'required|date',
            'mt_number'        => 'nullable|string|max:20',

            // UNIT: Strict formatting
            'body_number'     => ['required', 'regex:/^[0-9]+$/'], // Numbers only
            'plate_no'        => ['required', 'regex:/^[0-9A-Z]+$/'], // Uppercase Alphanumeric only (No dashes allowed in DB if you prefer clean data)
            'make_type'       => 'required|string|max:30',
            'engine_motor_no' => 'required|string|max:30',
            'chassis_no'      => 'required|string|max:30',

            // DOCS
            'cedula_number' => 'nullable|string|max:20',
            'cedula_date'   => 'nullable|date',
            'or_number'     => 'nullable|string|max:20',
            'or_date'       => 'nullable|date',
        ]);

        // Auto-Calculate Expiry
        $validated['valid_until'] = \Carbon\Carbon::parse($request->transaction_date)->addYears(3);
        $validated['status'] = 'draft';

        MtopApplication::create($validated);

        return redirect()->route('mtop.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id): Response
    {
        $application = MtopApplication::findOrFail($id);
        return Inertia::render('Mtop/Edit', [
            'application' => $application
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id): RedirectResponse
    {
        $application = MtopApplication::findOrFail($id);

        $validated = $request->validate([
            'operator_name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'transaction_date' => 'required|date',
            'mt_number' => 'nullable|string|max:50',
            'body_number' => 'required|string|max:50',
            'plate_no' => 'required|string|max:50',
            'make_type' => 'required|string|max:100',
            'engine_motor_no' => 'required|string|max:100',
            'chassis_no' => 'required|string|max:100',
            'cedula_number' => 'nullable|string|max:50',
            'cedula_date' => 'nullable|date',
            'or_number' => 'nullable|string|max:50',
            'or_date' => 'nullable|date',
        ]);

        // Recalculate expiry if date changed
        if ($request->transaction_date) {
            $validated['valid_until'] = Carbon::parse($request->transaction_date)->addYears(3);
        }

        $application->update($validated);

        return redirect()->route('mtop.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): RedirectResponse
    {
        $application = MtopApplication::findOrFail($id);
        $application->delete();

        return redirect()->route('mtop.index');
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
}
