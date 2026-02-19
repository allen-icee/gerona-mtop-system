import PrimaryButton from "@/Components/PrimaryButton";
import GuestLayout from "@/Layouts/GuestLayout";
import { PageProps } from "@/types";
import { Head, Link } from "@inertiajs/react";

export default function Welcome({ auth }: PageProps) {
    return (
        <GuestLayout>
            <Head title="Welcome" />

            <div className="flex flex-col items-center space-y-6 text-center">
                {/* Optional Welcome Text */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                        Welcome
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Please select an option to proceed.
                    </p>
                </div>

                {/* ACTION BUTTONS */}
                <div className="w-full space-y-4">
                    {auth.user ? (
                        <Link
                            href={route("dashboard")}
                            className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-blue-900 px-4 py-3 text-sm font-bold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-blue-800 focus:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-blue-900"
                        >
                            Go to Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route("login")}
                                className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-blue-900 px-4 py-3 text-sm font-bold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-blue-800 focus:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-blue-900"
                            >
                                Log in
                            </Link>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">
                                    Or
                                </span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>

                            <Link
                                href={route("register")}
                                className="w-full inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-bold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25"
                            >
                                Register Account
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </GuestLayout>
    );
}
