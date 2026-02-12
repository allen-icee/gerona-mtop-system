<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Auth;

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

    // 2. SHOW CREATE FORM
    public function create()
    {
        return Inertia::render('Users/Create');
    }

    // 3. STORE NEW USER
    public function store(Request $request)
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

        return redirect()->route('users.index')->with('message', 'User created successfully');
    }

    // 4. SHOW EDIT FORM (New!)
    public function edit($id)
    {
        $user = User::findOrFail($id);
        return Inertia::render('Users/Edit', [
            'user' => $user
        ]);
    }

    // 5. UPDATE USER (New!)
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $user->id,
            'email' => 'nullable|string|lowercase|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:admin,staff',
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()], // Nullable = Optional
        ]);

        // Update basic info
        $user->name = $request->name;
        $user->username = $request->username;
        $user->email = $request->email;
        $user->role = $request->role;

        // Update Password ONLY if provided (leave blank to keep current)
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return redirect()->route('users.index')->with('message', 'User updated successfully');
    }

    // 6. DELETE USER (Improved Security)
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Rule 1: Cannot delete yourself
        if ($user->id === Auth::id()) {
            return back()->withErrors(['error' => 'You cannot delete your own account.']);
        }

        // Rule 2: Cannot delete the Main Super Admin (ID 1)
        if ($user->id === 1) {
            return back()->withErrors(['error' => 'The Main Administrator cannot be deleted.']);
        }

        $user->delete();

        return redirect()->route('users.index');
    }
}
