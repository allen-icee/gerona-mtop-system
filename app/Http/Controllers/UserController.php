<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse; // Import this

class UserController extends Controller
{
    // 1. LIST USERS
    public function index(Request $request)
    {
        $search = $request->input('search');

        $users = User::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search']),
        ]);
    }

    // 2. SHOW CREATE FORM (Not strictly needed with Modals, but good to keep)
    public function create()
    {
        return Inertia::render('Users/Create');
    }

    // 3. STORE NEW USER
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

        // CHANGED: Use back() + 'message' for the Green Toast
        return redirect()->back()->with('message', 'User created successfully');
    }

    // 4. SHOW EDIT FORM (Not strictly needed with Modals)
    public function edit($id)
    {
        $user = User::findOrFail($id);
        return Inertia::render('Users/Edit', [
            'user' => $user
        ]);
    }

    // 5. UPDATE USER
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

        // CHANGED: Use back() + 'message' for the Green Toast
        return redirect()->back()->with('message', 'User updated successfully');
    }

    // 6. DELETE USER
    public function destroy($id): RedirectResponse
    {
        $user = User::findOrFail($id);

        // Rule 1: Cannot delete yourself
        if ($user->id === Auth::id()) {
            // CHANGED: Use 'error' flash key to trigger Red Toast
            return back()->with('error', 'You cannot delete your own account.');
        }

        // Rule 2: Cannot delete the Main Super Admin (ID 1)
        if ($user->id === 1) {
            // CHANGED: Use 'error' flash key to trigger Red Toast
            return back()->with('error', 'The Main Administrator cannot be deleted.');
        }

        $user->delete();

        // CHANGED: Added 'message' to trigger Green Toast on success
        return redirect()->back()->with('message', 'User deleted successfully');
    }
}
