<?php

namespace App\Http\Controllers;

use App\Models\Signatory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse; // Import this for type hinting

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
            'position' => 'required|string|in:Punong Bayan,Authorized Official',
        ]);

        Signatory::create($validated);

        // CHANGED: Added success message for Toast
        return redirect()->back()->with('message', 'Official added successfully.');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $signatory = Signatory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'position' => 'required|string|in:Punong Bayan,Authorized Official',
            'is_active' => 'boolean'
        ]);

        $signatory->update($validated);

        // CHANGED: Added success message for Toast
        return redirect()->back()->with('message', 'Official updated successfully.');
    }

    public function destroy($id): RedirectResponse
    {
        Signatory::findOrFail($id)->delete();

        // CHANGED: Added success message for Toast
        return redirect()->back()->with('message', 'Official deleted successfully.');
    }
}
