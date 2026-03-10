<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\FeeSetting;

class FeeSettingController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'reg_filing_fee' => 'required|numeric|min:0',
            'franchise_fee' => 'required|numeric|min:0',
            'mayors_permit' => 'required|numeric|min:0',
            'supervisor_fee' => 'required|numeric|min:0',
            'account_clearance' => 'required|numeric|min:0',
            'sticker_fee' => 'required|numeric|min:0',
            'id_driver_operator_owner' => 'required|numeric|min:0',
            'body_number_plate' => 'required|numeric|min:0',
            'penalty' => 'required|numeric|min:0',
        ]);

        $feeSetting = FeeSetting::first() ?? new FeeSetting();
        $feeSetting->fill($validated);
        $feeSetting->save();

        return back()->with('success', 'Global fees updated successfully!');
    }
}
