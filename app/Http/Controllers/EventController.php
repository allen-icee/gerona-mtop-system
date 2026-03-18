<?php
//GeronaMTOP\app\Http\Controllers\EventController.php
namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::orderBy('created_at', 'desc')->get();

        $holidays = \App\Models\Holiday::orderBy('month')->orderBy('day')->get();

        return Inertia::render('Settings/Events', [
            'events' => $events,
            'holidays' => $holidays
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'fixed_expiry_date' => 'required|date',
            'mandated_by' => 'required|string|max:255',
            'is_active' => 'boolean',
            'validity_years' => 'nullable|integer|min:0',
            'validity_months' => 'nullable|integer|min:0|max:11',
        ]);

        $validated['validity_years'] = $validated['validity_years'] ?? 0;
        $validated['validity_months'] = $validated['validity_months'] ?? 0;

        Event::create($validated);

        return redirect()->back()->with('message', 'Event created successfully!');
    }

    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'fixed_expiry_date' => 'required|date',
            'mandated_by' => 'required|string|max:255',
            'is_active' => 'boolean',
            'validity_years' => 'nullable|integer|min:0',
            'validity_months' => 'nullable|integer|min:0|max:11',
        ]);

        $validated['validity_years'] = $validated['validity_years'] ?? 0;
        $validated['validity_months'] = $validated['validity_months'] ?? 0;

        $event->update($validated);

        return redirect()->back()->with('message', 'Event updated successfully!');
    }

    public function destroy(Event $event)
    {
        $event->delete();
        return redirect()->back()->with('message', 'Event deleted successfully!');
    }
}
