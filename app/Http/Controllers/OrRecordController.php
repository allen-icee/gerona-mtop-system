<?php
//GeronaMTOP\app\Http\Controllers\OrRecordController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OrRecord;
use App\Models\Signatory;
use App\Models\FeeSetting;
use Inertia\Inertia;
use Rap2hpoutre\FastExcel\FastExcel;

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

        $fileName = 'or_records_' . date('Y-m-d_H-i') . '.xlsx';

        $generator = function () use ($records) {
            foreach ($records as $row) {
                yield $row;
            }
        };

        return (new FastExcel($generator()))->download($fileName, function ($row) use ($feeSettings) {
            $payorName = trim("{$row->payor_last_name}, {$row->payor_first_name} {$row->payor_middle_name} {$row->payor_suffix}");
            $fees = $row->fee_breakdown ?? [];

            $getAmount = function ($key) use ($fees, $feeSettings) {
                if (!empty($fees[$key]) && $feeSettings) {
                    return $feeSettings->$key ?? 0;
                }
                return 0;
            };

            return [
                'OR Number' => $row->or_number,
                'Transaction Date' => \Carbon\Carbon::parse($row->transaction_date)->format('Y-m-d'),
                'Agency' => $row->agency,
                'Payor Name' => $payorName,
                'Collecting Officer' => $row->collecting_officer,
                'Total Amount' => $row->total_amount,
                'REG/Filing Fee' => $getAmount('reg_filing_fee'),
                'Franchise Fee' => $getAmount('franchise_fee'),
                'Mayors Permit' => $getAmount('mayors_permit'),
                'Supervisor Fee' => $getAmount('supervisor_fee'),
                'Account Clearance' => $getAmount('account_clearance'),
                'Sticker Fee' => $getAmount('sticker_fee'),
                'ID Fee' => $getAmount('id_driver_operator_owner'),
                'Body Number/Plate' => $getAmount('body_number_plate'),
                'Penalty' => $getAmount('penalty'),
            ];
        });
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|extensions:xlsx,xls,csv,txt|max:10240',
        ]);

        $file = $request->file('file');
        $fullPath = $file->path();

        $imported = 0;
        $skipped = 0;

        (new FastExcel)->import($fullPath, function ($data) use (&$imported, &$skipped) {
            $orNumber = $data['OR Number'] ?? null;
            if (!$orNumber) return;

            if (OrRecord::where('or_number', $orNumber)->exists()) {
                $skipped++;
                return;
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
        });

        return back()->with('success', "Import completed: {$imported} added, {$skipped} skipped (duplicates).");
    }

    public function clear(\Illuminate\Http\RedirectResponse $redirectResponse = null)
    {
        OrRecord::query()->delete();
        return back()->with('success', 'All OR records have been cleared successfully.');
    }
}
