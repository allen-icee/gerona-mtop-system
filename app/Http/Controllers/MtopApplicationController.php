<?php

namespace App\Http\Controllers;

use App\Models\MtopApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MtopApplicationController extends Controller
{
    // 1. SHOW THE LIST (Dashboard)
    public function index()
    {
        // Get all applications, newest first
        $applications = MtopApplication::latest()->get();

        return Inertia::render('Mtop/Index', [
            'applications' => $applications
        ]);
    }

    // 2. SHOW THE CREATE FORM
    public function create()
    {
        return Inertia::render('Mtop/Create');
    }

    // 3. STORE NEW APPLICATION (The "Save" Button)
    public function store(Request $request)
    {
        // A. Validate the Input (Prevent empty forms)
        $validated = $request->validate([
            'operator_name'   => 'required|string|max:255',
            'address'         => 'required|string|max:255',
            'make_type'       => 'required|string',
            'engine_motor_no' => 'required|string',
            'chassis_no'      => 'required|string',
            'plate_no'        => 'required|string',
            'transaction_date' => 'required|date',
            // Optional fields don't need 'required'
            'body_number'     => 'nullable|string',
            'or_number'       => 'nullable|string',
            'amount'          => 'nullable|numeric',
            'cedula_number'   => 'nullable|string',
        ]);

        // B. Auto-Generate Case Number (e.g., 2026-001)
        // logic: Find the last number for this year, add +1
        $year = date('Y');
        $lastApp = MtopApplication::where('mt_number', 'like', "$year-%")
            ->orderBy('id', 'desc')
            ->first();

        if ($lastApp) {
            // Extract "001" from "2026-001"
            $parts = explode('-', $lastApp->mt_number);
            $lastNum = intval(end($parts));
            $newNum = $lastNum + 1;
        } else {
            $newNum = 1;
        }

        // Format it back to "2026-001" (padded with zeros)
        $caseNumber = $year . '-' . str_pad($newNum, 3, '0', STR_PAD_LEFT);

        // C. Save to Database
        MtopApplication::create([
            ...$validated,
            'mt_number' => $caseNumber,
            'status'    => 'draft'
        ]);

        // D. Redirect back to Dashboard
        return redirect()->route('mtop.index');
    }

    // 4. EDIT FORM
    public function edit(MtopApplication $mtopApplication)
    {
        return Inertia::render('Mtop/Edit', [
            'application' => $mtopApplication
        ]);
    }

    // 5. UPDATE EXISTING RECORD
    public function update(Request $request, MtopApplication $mtopApplication)
    {
        $validated = $request->validate([
            'operator_name'   => 'required|string',
            'address'         => 'required|string',
            'make_type'       => 'required|string',
            'plate_no'        => 'required|string',
            // ... add other validations as needed
        ]);

        $mtopApplication->update($validated);

        return redirect()->route('mtop.index');
    }
    // 6. PRINT PREVIEW (The Document)
    public function print(MtopApplication $mtopApplication)
    {
        return Inertia::render('Mtop/Print', [
            'application' => $mtopApplication
        ]);
    }
}
