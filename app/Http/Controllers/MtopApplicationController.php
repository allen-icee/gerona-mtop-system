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

        $query = MtopApplication::query();

        // Search Logic
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('operator_name', 'like', "%{$search}%")
                    ->orWhere('body_number', 'like', "%{$search}%")
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

        $applications = $query->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Mtop/Index', [
            'applications' => $applications,
            'filters' => $request->only(['search', 'month', 'year']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Mtop/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        // 1. VALIDATION
        $validated = $request->validate([
            // Applicant
            'operator_name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'transaction_date' => 'required|date',
            'mt_number' => 'nullable|string|max:50',

            // Unit
            'body_number' => 'required|string|max:50',
            'plate_no' => 'required|string|max:50',
            'make_type' => 'required|string|max:100',
            'engine_motor_no' => 'required|string|max:100',
            'chassis_no' => 'required|string|max:100',

            // Documents (Nullable)
            'cedula_number' => 'nullable|string|max:50',
            'cedula_date' => 'nullable|date',
            'or_number' => 'nullable|string|max:50',
            'or_date' => 'nullable|date',
        ]);

        // 2. AUTO-CALCULATE: Valid Until (3 Years from Transaction Date)
        if ($request->transaction_date) {
            $validated['valid_until'] = Carbon::parse($request->transaction_date)->addYears(3);
        }

        // 3. DEFAULT STATUS
        $validated['status'] = 'draft';

        // 4. SAVE
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
