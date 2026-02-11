<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            // 1. NAME: Regex allows Letters, Spaces, and Dots only
            'name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s.]+$/'],

            // 2. USERNAME: Min 5 chars, Letters/Numbers/Dashes only
            'username' => ['required', 'string', 'min:4', 'max:255', 'unique:' . User::class, 'regex:/^[a-zA-Z0-9._-]+$/'],

            // 3. EMAIL: Standard Email format (if provided)
            'email' => 'nullable|string|lowercase|email|max:255|unique:' . User::class,

            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
