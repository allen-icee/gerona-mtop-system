import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link } from "@inertiajs/react";
import { PropsWithChildren } from "react";

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        // CHANGED: min-h-[100svh] ensures it fits perfectly on mobile screens with URL bars.
        // CHANGED: px-4 adds safety margins on small phones.
        <div className="min-h-svh flex flex-col justify-center items-center pt-6 sm:pt-0 bg-linear-to-br from-blue-900 via-blue-700 to-blue-500 px-4">
            {/* 1. HEADER SECTION */}
            <div className="text-center mb-6">
                <Link href="/" className="flex flex-col items-center">
                    <ApplicationLogo className="w-20 h-20 sm:w-24 sm:h-24 fill-current text-white drop-shadow-lg transition-all" />
                    <h1 className="text-white font-bold text-xl sm:text-2xl mt-4 uppercase tracking-widest drop-shadow-md">
                        M.T.O.P. System
                    </h1>
                    <p className="text-blue-100 text-xs sm:text-sm tracking-wide uppercase">
                        Municipality of Gerona
                    </p>
                </Link>
            </div>

            {/* 2. THE CARD (Responsive Width) */}
            <div className="w-full sm:max-w-md mt-6 px-6 py-8 bg-white shadow-2xl overflow-hidden rounded-xl border-t-4 border-yellow-400">
                {children}
            </div>

            {/* 3. FOOTER */}
            <div className="mt-8 text-blue-200 text-[10px] sm:text-xs text-center">
                &copy; {new Date().getFullYear()} Municipal Government of
                Gerona. All rights reserved.
            </div>
        </div>
    );
}
