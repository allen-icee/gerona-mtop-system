import { Link } from "@inertiajs/react";
import { PropsWithChildren } from "react";

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-svh flex flex-col justify-center items-center pt-6 sm:pt-0 bg-linear-to-br from-blue-900 via-blue-700 to-blue-500 px-4">
            <div className="text-center mb-2">
                <Link href="/" className="flex flex-col items-center">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <img
                            src="/images/MunicipalityLogo.png"
                            alt="Municipality Logo"
                            className="h-10 sm:h-14 md:h-30 w-auto object-contain"
                        />
                        <img
                            src="/images/CCSLogo.png"
                            alt="CSS Logo"
                            className="h-10 sm:h-14 md:h-30 w-auto object-contain"
                        />
                        <img
                            src="/images/TSULogo.png"
                            alt="TSU Logo"
                            className="h-10 sm:h-14 md:h-30 w-auto object-contain"
                        />
                    </div>

                    <h1 className="text-white font-bold text-xl sm:text-2xl uppercase tracking-widest drop-shadow-md">
                        M.T.O.P System
                    </h1>
                    <p className="text-blue-100 text-xs sm:text-sm tracking-wide uppercase font-semibold">
                        Motorized Tricycle Operator's Permit
                    </p>
                    <p className="text-blue-100 text-xs sm:text-sm tracking-wide uppercase">
                        Municipality of Gerona
                    </p>
                </Link>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-6 py-8 bg-white shadow-2xl overflow-hidden rounded-xl border-t-4 border-yellow-400">
                {children}
            </div>

            <div className="mt-8 text-blue-200 text-[10px] sm:text-xs text-center">
                &copy; {new Date().getFullYear()} Municipal Government of
                Gerona. All rights reserved.
            </div>
        </div>
    );
}
