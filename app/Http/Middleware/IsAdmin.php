<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class IsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        // 🛑 SECURITY CHECK:
        // If the user is NOT logged in, OR their role is NOT 'admin'...
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            // ...block them with a 403 Forbidden error.
            abort(403, 'ACCESS DENIED: You do not have Super Admin privileges.');
        }

        return $next($request);
    }
}
