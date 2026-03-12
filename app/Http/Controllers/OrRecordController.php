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


    // --- ADDED PRINT FUNCTION ---
    public function print($id)
    {
        $record = OrRecord::findOrFail($id);

        return Inertia::render('OrRecords/Print', [
            'record' => $record,
            'feeSettings' => FeeSetting::first() ?? new FeeSetting()
        ]);
    }

    public function export(Request $request)
    {
        $query = clone OrRecord::query();

        // Apply Search Filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('or_number', 'like', "%{$search}%")
                    ->orWhere('payor_last_name', 'like', "%{$search}%")
                    ->orWhere('payor_first_name', 'like', "%{$search}%");
            });
        }

        // Apply Month Filter
        if ($request->filled('month')) {
            $query->whereMonth('transaction_date', $request->input('month'));
        }

        // Apply Year Filter
        if ($request->filled('year')) {
            $query->whereYear('transaction_date', $request->input('year'));
        }

        $records = $query->latest()->cursor();

        // 1. FETCH THE ACTUAL FEE PRICES HERE
        $feeSettings = \App\Models\FeeSetting::first();

        $csvFileName = 'or_records_' . date('Y-m-d_H-i') . '.csv';

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$csvFileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        // 2. PASS $feeSettings INTO THE CALLBACK
        $callback = function () use ($records, $feeSettings) {
            $file = fopen('php://output', 'w');

            // Set CSV Headers
            fputcsv($file, [
                'OR Number',
                'Transaction Date',
                'Agency',
                'Payor Name',
                'Collecting Officer',
                'Total Amount',
                'REG/Filing Fee',
                'Franchise Fee',
                'Mayors Permit',
                'Supervisor Fee',
                'Account Clearance',
                'Sticker Fee',
                'ID Fee',
                'Body Number/Plate',
                'Penalty'
            ]);

            foreach ($records as $row) {
                $payorName = trim("{$row->payor_last_name}, {$row->payor_first_name} {$row->payor_middle_name} {$row->payor_suffix}");
                $fees = $row->fee_breakdown ?? [];

                // 3. HELPER FUNCTION: Get actual amount if toggled ON, else return 0
                $getAmount = function ($key) use ($fees, $feeSettings) {
                    if (!empty($fees[$key]) && $feeSettings) {
                        return $feeSettings->$key ?? 0;
                    }
                    return 0;
                };

                fputcsv($file, [
                    $row->or_number,
                    \Carbon\Carbon::parse($row->transaction_date)->format('Y-m-d'), // <-- Formats to date only
                    $row->agency,
                    $payorName,
                    $row->collecting_officer,
                    $row->total_amount,
                    $getAmount('reg_filing_fee'),
                    $getAmount('franchise_fee'),
                    $getAmount('mayors_permit'),
                    $getAmount('supervisor_fee'),
                    $getAmount('account_clearance'),
                    $getAmount('sticker_fee'),
                    $getAmount('id_driver_operator_owner'),
                    $getAmount('body_number_plate'),
                    $getAmount('penalty'),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
