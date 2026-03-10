<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OrRecord;
use App\Models\Signatory;
use App\Models\FeeSetting;
use Inertia\Inertia;

class OrRecordController extends Controller
{
    public function index()
    {
        // Fetch existing OR records to display in the table
        $orRecords = OrRecord::latest()->get();

        return Inertia::render('OrRecords/Index', [
            'signatories' => Signatory::where('position', 'Collecting Officer')->get(),
            'feeSettings' => FeeSetting::first() ?? new FeeSetting(),
            'orRecords' => $orRecords
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'transaction_date' => 'required|date',
            'agency' => 'required|string',
            'payor_last_name' => 'required|string',
            'payor_first_name' => 'required|string',
            'payor_middle_name' => 'nullable|string',
            'payor_suffix' => 'nullable|string',
            'collecting_officer' => 'required|string',
            'total_amount' => 'required|numeric',
            'fee_breakdown' => 'nullable|array'
        ]);

        $orRecord = OrRecord::create($validated);

        return back()->with('success', 'OR Record saved successfully!');
    }
}
