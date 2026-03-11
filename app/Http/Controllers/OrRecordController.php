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
        $orRecords = OrRecord::latest()->get();

        // Generate the Next OR Number (e.g., OR 2026-0001)
        $year = date('Y');
        $prefix = 'OR ' . $year . '-'; // Added "OR " prefix here

        $lastRecord = OrRecord::where('or_number', 'like', $prefix . '%')
                              ->orderBy('or_number', 'desc')
                              ->first();

        $sequence = $lastRecord ? intval(explode('-', $lastRecord->or_number)[1]) + 1 : 1;
        $nextOrNumber = $prefix . str_pad($sequence, 4, '0', STR_PAD_LEFT);

        return Inertia::render('OrRecords/Index', [
            'signatories' => Signatory::where('position', 'Collecting Officer')->get(),
            'feeSettings' => FeeSetting::first() ?? new FeeSetting(),
            'orRecords' => $orRecords,
            'nextOrNumber' => $nextOrNumber
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'or_number' => 'required|string|unique:or_records,or_number',
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

        OrRecord::create($validated);

        return back()->with('success', 'OR Record saved successfully!');
    }

   // --- ADDED UPDATE FUNCTION ---
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'or_number' => 'required|string|unique:or_records,or_number,' . $id,
            'transaction_date' => 'required|date',
            'agency' => 'required|string',
            'payor_last_name' => 'required|string|max:255',
            'payor_first_name' => 'required|string|max:255',
            'payor_middle_name' => 'nullable|string|max:255',
            'payor_suffix' => 'nullable|string|max:255',
            'collecting_officer' => 'required|string|max:255',
            'total_amount' => 'required|numeric',
            'fee_breakdown' => 'required|array',
        ]);

        $record = OrRecord::findOrFail($id);
        $record->update($validated);

        return back()->with('success', 'Record updated successfully!');
    }

    // --- ADDED DELETE FUNCTION ---
    public function destroy($id)
    {
        $record = OrRecord::findOrFail($id);
        $record->delete();

        return back()->with('success', 'Record deleted successfully!');
    }
}
