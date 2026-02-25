<?php
//GeronaMTOP\app\Http\Middleware\LogStaffActions.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use App\Models\AuditLog;

class LogStaffActions
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log POST, PUT, PATCH, DELETE requests if a user is logged in
        if (Auth::check() && in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {

            $method = $request->method();
            $path = $request->path();

            // Default fallback
            $actionName = "System Action";
            $details = "Performed $method on /$path";

            // --- SMART TRANSLATION LOGIC ---
            if ($path === 'logout') {
                $actionName = 'Logged Out';
                $details = 'User safely logged out of the system.';
            } elseif ($path === 'login') {
                $actionName = 'Logged In';
                $details = 'User authenticated successfully.';
            } elseif (str_starts_with($path, 'mtop')) {
                // Try to get the MT Number from the form data
                $mt = $request->input('mt_number');
                $id = basename($path);

                if ($method === 'POST') {
                    if (str_ends_with($path, 'renew')) {
                        $actionName = 'Renewed Permit';
                        $details = $mt ? "Renewed Control No: $mt" : "Renewed an application.";
                    } else {
                        $actionName = 'Created Permit';
                        $details = $mt ? "Created Control No: $mt" : "Created a new application.";
                    }
                } elseif (in_array($method, ['PUT', 'PATCH'])) {
                    $actionName = 'Edited Permit';
                    // If we can't find the MT number in the input, at least show the ID
                    $details = $mt ? "Edited Control No: $mt" : "Edited Database ID: $id";
                } elseif ($method === 'DELETE') {
                    $actionName = 'Deleted Permit';
                    $details = "Deleted permit record ID: $id";
                }
            } elseif (str_starts_with($path, 'users')) {
                $userTarget = $request->input('username', 'User');
                if ($method === 'POST') {
                    $actionName = 'Created User';
                    $details = "Created staff account: $userTarget";
                } elseif (in_array($method, ['PUT', 'PATCH'])) {
                    $actionName = 'Edited User';
                    $details = "Updated staff account: $userTarget";
                } elseif ($method === 'DELETE') {
                    $actionName = 'Deleted User';
                    $details = "Deleted a system user.";
                }
            } elseif (str_starts_with($path, 'settings')) {
                $actionName = 'Updated Settings';
                $details = 'Modified print layouts or system configurations.';
            } elseif (str_starts_with($path, 'signatories')) {
                $actionName = "Updated Signatories";
                $details = "Modified the list of authorized officials.";
            }

            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => $actionName,
                'payload' => $details, // This saves the READABLE sentence now!
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        return $response;
    }
}
