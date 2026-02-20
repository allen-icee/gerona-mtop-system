<?php
//GeronaMTOP\app\Http\Controllers\SignatoryController.php
namespace App\Http\Controllers;

use App\Models\Signatory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;

class SignatoryController extends Controller
{
    public function index()
    {
        return Inertia::render('Signatories/Index', [
            'signatories' => Signatory::latest()->get()
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',

            'position' => 'required|string|in:Punong Bayan,Authorized Official,Committee on Transportation',
        ]);

        Signatory::create($validated);

        return redirect()->back()->with('message', 'Official added successfully.');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $signatory = Signatory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',

            'position' => 'required|string|in:Punong Bayan,Authorized Official,Committee on Transportation',
            'is_active' => 'boolean'
        ]);

        $signatory->update($validated);

        return redirect()->back()->with('message', 'Official updated successfully.');
    }

    public function destroy($id): RedirectResponse
    {
        Signatory::findOrFail($id)->delete();

        return redirect()->back()->with('message', 'Official deleted successfully.');
    }
}
