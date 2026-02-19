import GuestLayout from "@/Layouts/GuestLayout";
import { PageProps } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { Icon } from "@iconify/react";

export default function Welcome({ auth }: PageProps) {
    return (
        <GuestLayout>
            <Head title="Welcome to MTOP System" />

            <div className="flex flex-col items-center text-center px-4 py-4 sm:px-10">
                <div className="w-24 h-24 bg-blue-50 text-blue-800 rounded-full flex items-center justify-center mb-6 shadow-inner border border-blue-100">
                    <Icon
                        icon="pepicons-print:motorcycle-circle-filled"
                        width="60"
                    />
                </div>

                <div className="w-full max-w-sm space-y-4">
                    {auth.user ? (
                        <Link
                            href={route("dashboard")}
                            className="w-full flex items-center justify-center gap-2 rounded-xl border border-transparent bg-blue-700 px-6 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-md transition-all hover:bg-blue-800 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-900"
                        >
                            Enter Dashboard
                            <Icon icon="solar:arrow-right-bold" width="18" />
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route("login")}
                                className="w-full flex items-center justify-center gap-2 rounded-xl border border-transparent bg-blue-700 px-6 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-md transition-all hover:bg-blue-800 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-900"
                            >
                                Log in
                            </Link>

                            <p className="text-[11px] text-gray-400 mt-6 font-bold uppercase tracking-wider">
                                Authorized Government Personnel Only
                            </p>
                        </>
                    )}
                </div>
            </div>
        </GuestLayout>
    );
}
