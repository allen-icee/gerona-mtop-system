<?php
//GeronaMTOP\app\Http\Controllers\HolidayController.php
namespace App\Http\Controllers;

use App\Models\Holiday;
use Illuminate\Http\Request;

class HolidayController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'month' => 'required|integer|min:1|max:12',
            'day' => 'required|integer|min:1|max:31',
        ]);

        Holiday::create($validated);

        return redirect()->back()->with('message', 'Holiday added successfully!');
    }

    public function update(Request $request, Holiday $holiday)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'month' => 'required|integer|min:1|max:12',
            'day' => 'required|integer|min:1|max:31',
        ]);

        $holiday->update($validated);

        return redirect()->back()->with('message', 'Holiday updated successfully!');
    }

    public function destroy(Holiday $holiday)
    {
        $holiday->delete();
        return redirect()->back()->with('message', 'Holiday removed successfully!');
    }
}
