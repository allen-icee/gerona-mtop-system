<?php
//GeronaMTOP\app\Http\Controllers\UserController.php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use Rap2hpoutre\FastExcel\FastExcel;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $users = User::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10, ['*'], 'users_page')
            ->withQueryString();

        $auditLogs = AuditLog::with('user')
            ->latest()
            ->paginate(15, ['*'], 'logs_page')
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'auditLogs' => $auditLogs,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:' . User::class,
            'email' => 'nullable|string|lowercase|email|max:255|unique:' . User::class,
            'role' => 'required|in:admin,staff',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'role' => $request->role,
            'password' => Hash::make($request->password),
        ]);

        return redirect()->back()->with('message', 'User created successfully');
    }

    public function edit($id)
    {
        $user = User::findOrFail($id);
        return Inertia::render('Users/Edit', [
            'user' => $user
        ]);
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $user->id,
            'email' => 'nullable|string|lowercase|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:admin,staff',
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
        ]);

        $user->name = $request->name;
        $user->username = $request->username;
        $user->email = $request->email;
        $user->role = $request->role;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return redirect()->back()->with('message', 'User updated successfully');
    }

    public function destroy($id): RedirectResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === Auth::id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        if ($user->id === 1) {
            return back()->with('error', 'The Main Administrator cannot be deleted.');
        }

        $user->delete();

        return redirect()->back()->with('message', 'User deleted successfully');
    }
    public function exportAuditLogs()
    {
        $logs = AuditLog::with('user')->latest()->cursor();

        $fileName = 'audit_logs_' . date('Y-m-d_H-i-A') . '.xlsx';

        $generator = function () use ($logs) {
            foreach ($logs as $log) {
                yield $log;
            }
        };

        return (new FastExcel($generator()))->download($fileName, function ($log) {
            $safeDetails = is_string($log->payload)
                ? $log->payload
                : json_encode($log->payload);

            return [
                'ID' => $log->id,
                'Timestamp' => $log->created_at,
                'User' => $log->user ? $log->user->name : 'Deleted User',
                'Action' => $log->action,
                'Details' => $safeDetails,
                'IP Address' => $log->ip_address
            ];
        });
    }
    public function flushAuditLogs(Request $request)
    {
        \App\Models\AuditLog::truncate();

        \App\Models\AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'Flushed Audit Logs',
            'payload' => 'Admin manually cleared all system audit logs.',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('message', 'All audit logs have been safely cleared.');
    }
}
