<?php
//GeronaMTOP\app\Http\Controllers\PrintSettingController.php
namespace App\Http\Controllers;

use App\Models\PrintSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PrintSettingController extends Controller
{
    public function edit()
    {
        return Inertia::render('Settings/PrintLayout', [
            'settings' => PrintSetting::first() ?: new PrintSetting()
        ]);
    }

    public function update(Request $request)
    {
        $settings = PrintSetting::first() ?: new PrintSetting();

        $validated = $request->validate([
            'header' => 'nullable|image|max:2048',
            'footer' => 'nullable|image|max:2048',
            'id_background' => 'nullable|image|max:2048',
            'show_header' => 'required|boolean',
            'show_footer' => 'required|boolean',
            'remove_header' => 'nullable|boolean',
            'remove_footer' => 'nullable|boolean',
            'remove_id_background' => 'nullable|boolean',
        ]);

        if ($request->boolean('remove_header') && $settings->header_path) {
            Storage::disk('public')->delete($settings->header_path);
            $settings->header_path = null;
        }

        if ($request->boolean('remove_footer') && $settings->footer_path) {
            Storage::disk('public')->delete($settings->footer_path);
            $settings->footer_path = null;
        }

        if ($request->boolean('remove_id_background') && $settings->id_background_path) {
            Storage::disk('public')->delete($settings->id_background_path);
            $settings->id_background_path = null;
        }

        if ($request->hasFile('header')) {
            if ($settings->header_path) Storage::disk('public')->delete($settings->header_path);
            $settings->header_path = $request->file('header')->store('print-assets', 'public');
        }

        if ($request->hasFile('footer')) {
            if ($settings->footer_path) Storage::disk('public')->delete($settings->footer_path);
            $settings->footer_path = $request->file('footer')->store('print-assets', 'public');
        }

        if ($request->hasFile('id_background')) {
            if ($settings->id_background_path) Storage::disk('public')->delete($settings->id_background_path);
            $settings->id_background_path = $request->file('id_background')->store('print-assets', 'public');
        }

        $settings->show_header = $request->boolean('show_header');
        $settings->show_footer = $request->boolean('show_footer');

        $settings->save();

        return back()->with('message', 'Print layout updated successfully.');
    }
}
