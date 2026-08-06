<?php
//GeronaMTOP\app\Http\Controllers\SignatoryController.php
namespace App\Http\Controllers;

use App\Models\Signatory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Rap2hpoutre\FastExcel\FastExcel;
use Illuminate\Support\Facades\Auth;

class SignatoryController extends Controller
{

    public function index(Request $request)
    {
        $search = $request->input('search');
        $position = $request->input('position', 'All');

        $signatories = Signatory::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($position !== 'All', function ($query) use ($position) {
                if ($position === 'Dropping Official') {
                    $query->where('position', 'like', '%Dropping%')->orWhere('position', $position);
                } else {
                    $query->where('position', $position);
                }
            })
            ->get();

        return Inertia::render('Signatories/Index', [
            'signatories' => $signatories,
            'filters' => $request->only(['search', 'position']),
            'feeSettings' => \App\Models\FeeSetting::first() ?? new \App\Models\FeeSetting()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:signatories,name',
            'position' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        Signatory::create($validated);

        return redirect()->back()->with('message', 'Official added successfully.');
    }

    public function update(Request $request, Signatory $signatory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:signatories,name,' . $signatory->id,
            'position' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $signatory->update($validated);

        return redirect()->back()->with('message', 'Official updated successfully.');
    }

    public function destroy(Signatory $signatory)
    {
        $signatory->delete();
        return redirect()->back()->with('message', 'Official deleted successfully.');
    }

    public function export()
    {
        $signatories = Signatory::all();

        $fileName = 'signatories_backup_' . date('Y-m-d_H-i') . '.xlsx';
        
        $generator = function () use ($signatories) {
            foreach ($signatories as $row) {
                yield $row;
            }
        };

        return (new FastExcel($generator()))->download($fileName, function ($row) {
            return [
                'ID' => $row->id,
                'Name' => $row->name,
                'Position' => $row->position,
                'Status' => $row->is_active ? 'Active' : 'Inactive'
            ];
        });
    }

    public function import(Request $request)
    {
        $request->validate([
            'import_file' => 'required|file|extensions:xlsx,xls,csv,txt|max:2048',
        ]);

        $file = $request->file('import_file');
        $importedCount = 0;

        try {
            DB::beginTransaction();

            $fullPath = $file->getRealPath();

            (new FastExcel)->import($fullPath, function ($rowAssoc) use (&$importedCount) {
                if (empty($rowAssoc['Name']) || empty($rowAssoc['Position'])) return;

                $isActive = (strtolower(trim($rowAssoc['Status'] ?? 'active')) === 'active') ? true : false;

                Signatory::updateOrCreate(
                    ['name' => trim($rowAssoc['Name'])],
                    [
                        'position' => trim($rowAssoc['Position']),
                        'is_active' => $isActive,
                    ]
                );
                $importedCount++;
            });

            DB::commit();

            \App\Models\AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'Imported Signatories',
                'payload' => "Imported/Synced $importedCount officials.",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return redirect()->back()->with('message', "Imported {$importedCount} officials successfully.");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['import_file' => 'Import failed: Please ensure you are uploading the exact CSV format that was exported.']);
        }
    }
}
