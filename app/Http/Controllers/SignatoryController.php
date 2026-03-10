<?php
//GeronaMTOP\app\Http\Controllers\SignatoryController.php
namespace App\Http\Controllers;

use App\Models\Signatory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
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
                $query->where('position', $position);
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

        $csvFileName = 'signatories_backup_' . date('Y-m-d_H-i') . '.csv';
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$csvFileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($signatories) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Name', 'Position', 'Status']);

            foreach ($signatories as $row) {
                fputcsv($file, [
                    $row->id,
                    $row->name,
                    $row->position,
                    $row->is_active ? 'Active' : 'Inactive'
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function import(Request $request)
    {
        $request->validate([
            'import_file' => 'required|file|max:2048',
        ]);

        $file = $request->file('import_file');
        $extension = strtolower($file->getClientOriginalExtension());

        if ($extension !== 'csv') {
            return back()->withErrors(['import_file' => 'Only CSV files are allowed for signatories.']);
        }

        $importedCount = 0;

        try {
            DB::beginTransaction();

            $path = $file->getRealPath();
            $fileHandle = fopen($path, 'r');

            $bom = fread($fileHandle, 3);
            if ($bom !== "\xEF\xBB\xBF") {
                rewind($fileHandle);
            }

            $header = fgetcsv($fileHandle);
            if (!$header) throw new \Exception("File is empty or invalid");
            $header = array_map('trim', $header);

            while (($row = fgetcsv($fileHandle)) !== false) {
                if (empty(array_filter($row)) || count($header) !== count($row)) continue;

                $rowAssoc = array_combine($header, $row);

                if (empty($rowAssoc['Name']) || empty($rowAssoc['Position'])) continue;

                $isActive = (strtolower(trim($rowAssoc['Status'] ?? 'active')) === 'active') ? true : false;

                Signatory::updateOrCreate(
                    ['name' => trim($rowAssoc['Name'])],
                    [
                        'position' => trim($rowAssoc['Position']),
                        'is_active' => $isActive,
                    ]
                );
                $importedCount++;
            }
            fclose($fileHandle);

            DB::commit();

            \App\Models\AuditLog::create([
                'user_id' => Auth::id(),
                'action' => 'Imported Signatories',
                'payload' => "Imported/Synced $importedCount officials from CSV.",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return back()->with('message', "Success! Synced $importedCount officials safely.");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['import_file' => 'Import failed: Please ensure you are uploading the exact CSV format that was exported.']);
        }
    }
}
