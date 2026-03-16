<?php
//C:\GeronaMTOP\app\Http\Controllers\OrRecordController.php
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
        $year = date('Y');
        $prefix = 'OR ' . $year . '-';
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

    public function destroy($id)
    {
        $record = OrRecord::findOrFail($id);
        $record->delete();

        return back()->with('success', 'Record deleted successfully!');
    }

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
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('or_number', 'like', "%{$search}%")
                    ->orWhere('payor_last_name', 'like', "%{$search}%")
                    ->orWhere('payor_first_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('month')) {
            $query->whereMonth('transaction_date', $request->input('month'));
        }

        if ($request->filled('year')) {
            $query->whereYear('transaction_date', $request->input('year'));
        }

        $records = $query->latest()->cursor();

        $feeSettings = \App\Models\FeeSetting::first();

        $csvFileName = 'or_records_' . date('Y-m-d_H-i') . '.csv';

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$csvFileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($records, $feeSettings) {
            $file = fopen('php://output', 'w');

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

                $getAmount = function ($key) use ($fees, $feeSettings) {
                    if (!empty($fees[$key]) && $feeSettings) {
                        return $feeSettings->$key ?? 0;
                    }
                    return 0;
                };

                fputcsv($file, [
                    $row->or_number,
                    \Carbon\Carbon::parse($row->transaction_date)->format('Y-m-d'),
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

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,txt|max:10240',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->path(), 'r');
        $header = fgetcsv($handle);

        $imported = 0;
        $skipped = 0;

        $expectedHeaders = ['OR Number', 'Transaction Date', 'Agency', 'Payor Name', 'Collecting Officer', 'Total Amount'];
        foreach ($expectedHeaders as $eh) {
            if (!in_array($eh, $header)) {
                return back()->withErrors(['file' => 'Invalid CSV format. Missing required column: ' . $eh]);
            }
        }

        while (($row = fgetcsv($handle)) !== false) {
            if (count($header) !== count($row)) continue;
            $data = array_combine($header, $row);

            $orNumber = $data['OR Number'] ?? null;
            if (!$orNumber) continue;

            if (OrRecord::where('or_number', $orNumber)->exists()) {
                $skipped++;
                continue;
            }

            $fullName = $data['Payor Name'] ?? '';
            $lastName = '';
            $firstName = '';
            $middleName = '';
            $suffix = '';

            $commaSplit = explode(',', $fullName, 2);
            $lastName = trim($commaSplit[0]);
            if (isset($commaSplit[1])) {
                $rest = trim($commaSplit[1]);
                $words = explode(' ', $rest);
                $suffixes = ['JR', 'JR.', 'SR', 'SR.', 'I', 'II', 'III', 'IV', 'V'];
                $lastWord = strtoupper(end($words));
                if (in_array($lastWord, $suffixes)) {
                    $suffix = array_pop($words);
                }

                $lastWord = end($words);
                if (strlen(trim($lastWord, '.')) === 1) {
                    $middleName = array_pop($words);
                }

                $firstName = implode(' ', $words);
            }

            $fee_breakdown = [
                'reg_filing_fee' => floatval($data['REG/Filing Fee'] ?? 0) > 0,
                'franchise_fee' => floatval($data['Franchise Fee'] ?? 0) > 0,
                'mayors_permit' => floatval($data['Mayors Permit'] ?? 0) > 0,
                'supervisor_fee' => floatval($data['Supervisor Fee'] ?? 0) > 0,
                'account_clearance' => floatval($data['Account Clearance'] ?? 0) > 0,
                'sticker_fee' => floatval($data['Sticker Fee'] ?? 0) > 0,
                'id_driver_operator_owner' => floatval($data['ID Fee'] ?? 0) > 0,
                'body_number_plate' => floatval($data['Body Number/Plate'] ?? 0) > 0,
                'penalty' => floatval($data['Penalty'] ?? 0) > 0,
            ];

            OrRecord::create([
                'or_number' => $orNumber,
                'transaction_date' => $data['Transaction Date'] ?? date('Y-m-d'),
                'agency' => $data['Agency'] ?? 'LGU GERONA',
                'payor_last_name' => $lastName,
                'payor_first_name' => $firstName ?: 'UNKNOWN',
                'payor_middle_name' => $middleName,
                'payor_suffix' => $suffix,
                'collecting_officer' => $data['Collecting Officer'] ?? 'UNKNOWN',
                'total_amount' => $data['Total Amount'] ?? 0,
                'fee_breakdown' => $fee_breakdown
            ]);

            $imported++;
        }

        fclose($handle);

        return back()->with('success', "Import completed: {$imported} added, {$skipped} skipped (duplicates).");
    }
}
