<?php

namespace App\Http\Controllers;

use App\Models\MtopApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Carbon\Carbon;
use App\Models\Signatory;

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

        // Search Logic
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('last_name', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('body_number', 'like', "%{$search}%")
                    ->orWhere('mt_number', 'like', "%{$search}%")
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

        // Find the latest MT number for this year
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
        // UPDATE: Added comma (\,) to the regex rules below
        $validated = $request->validate([
            // NAMES: Letters, spaces, dots, dashes, AND COMMAS allowed.
            'last_name'   => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'first_name'  => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'middle_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],

            'address'        => 'required|string|max:100',
            'contact_number' => ['nullable', 'regex:/^(09|\+639)\d{9}$/'],

            'transaction_date' => 'required|date',
            'mt_number'        => 'nullable|string|max:20',

            // UNIT
            'body_number'     => ['required', 'regex:/^[0-9]+$/'], // Numbers only
            'plate_no'        => ['required', 'string', 'max:20'],
            'make_type'       => 'required|string|max:30',
            'engine_motor_no' => 'required|string|max:30',
            'chassis_no'      => 'required|string|max:30',

            // DOCS & OFFICIALS
            'cedula_number'       => 'nullable|string|max:20',
            'cedula_date'         => 'nullable|date',
            'or_number'           => 'nullable|string|max:20',
            'or_date'             => 'nullable|date',
            // UPDATE: Allowed comma here
            'punong_bayan'        => ['nullable', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'authorized_official' => ['nullable', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
        ]);

        $validated['valid_until'] = Carbon::parse($request->transaction_date)->addYears(3);
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

        // UPDATE: Added comma (\,) to the regex rules below
        $validated = $request->validate([
            'last_name'   => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'first_name'  => ['required', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'middle_name' => ['nullable', 'string', 'max:50', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],

            'address'          => 'required|string|max:100',
            'transaction_date' => 'required|date',
            'mt_number'        => 'nullable|string|max:20',

            'body_number'     => ['required', 'regex:/^[0-9]+$/'],
            'plate_no'        => ['required', 'string', 'max:20'],
            'make_type'       => 'required|string|max:30',
            'engine_motor_no' => 'required|string|max:30',
            'chassis_no'      => 'required|string|max:30',

            'cedula_number'       => 'nullable|string|max:20',
            'cedula_date'         => 'nullable|date',
            'or_number'           => 'nullable|string|max:20',
            'or_date'             => 'nullable|date',
            // UPDATE: Allowed comma here
            'punong_bayan'        => ['nullable', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
            'authorized_official' => ['nullable', 'string', 'max:100', 'regex:/^[a-zA-Z\s\.\,\-]+$/'],
        ]);

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
