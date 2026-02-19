import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage, useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";

export default function Dashboard({
    totalMtop,
    totalUsers,
    newToday,
    serverIp,
}: {
    totalMtop: number;
    totalUsers: number;
    newToday: number;
    serverIp: string;
}) {
    // We assume the user object includes the 'role' field
    const user: any = usePage().props.auth.user;

    const staffLink = `http://${serverIp}:8000`;

    // SMART GREETING LOGIC
    const hour = new Date().getHours();
    const { post: postBackup, processing: backingUp } = useForm();

    const handleBackup = () => {
        if (confirm("Create a database backup now?")) {
            postBackup(route("settings.backup"));
        }
    };

    const greeting =
        hour < 12
            ? "Good Morning"
            : hour < 18
              ? "Good Afternoon"
              : "Good Evening";

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="py-6 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* SYSTEM INFO CARD (VISIBLE ONLY TO ADMIN) */}
                    {user.role === "admin" && (
                        <div className="bg-linear-to-r from-blue-900 to-blue-800 text-white overflow-hidden shadow-lg rounded-xl mb-8">
                            <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/10 rounded-full">
                                        <Icon
                                            icon="solar:server-square-bold"
                                            width="32"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">
                                            System Online
                                        </h3>
                                        <p className="text-blue-100 text-sm">
                                            Staff Access Link:{" "}
                                            <span className="font-mono bg-black/20 px-2 py-1 rounded select-all font-bold text-yellow-300">
                                                {staffLink}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-xs text-blue-200 text-center sm:text-right">
                                    <p>Host IP: {serverIp}</p>
                                    <p>Port: 8000</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. WELCOME BANNER */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg sm:rounded-lg mb-6 border-l-4 border-blue-900">
                        <div className="p-6 text-gray-900 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-bold text-blue-900">
                                    {greeting}, {user.name}!
                                </h3>
                                <p className="text-sm sm:text-base text-gray-500 mt-1">
                                    Welcome to the Gerona Municipal Tricycle
                                    Operator Permit (MTOP) System.
                                </p>
                            </div>
                            <Icon
                                icon="solar:sun-fog-bold-duotone"
                                width="48"
                                className="text-yellow-500 hidden sm:block shrink-0 ml-4"
                            />
                        </div>
                    </div>

                    {/* 3. QUICK STATS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                        {/* Card 1: Total Records */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-blue-500 flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">
                                    Total Records
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">
                                    {totalMtop}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                                <Icon
                                    icon="solar:folder-with-files-bold"
                                    width="28"
                                    className="sm:w-8 sm:h-8"
                                />
                            </div>
                        </div>

                        {/* Card 2: Added Today */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-orange-400 flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">
                                    Added Today
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">
                                    {newToday}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-full text-orange-500">
                                <Icon
                                    icon="solar:clock-circle-bold"
                                    width="28"
                                    className="sm:w-8 sm:h-8"
                                />
                            </div>
                        </div>

                        {/* Card 3: Active Users */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-green-500 flex items-center justify-between sm:col-span-2 md:col-span-1">
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">
                                    System Users
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">
                                    {totalUsers}
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-full text-green-600">
                                <Icon
                                    icon="solar:users-group-rounded-bold"
                                    width="28"
                                    className="sm:w-8 sm:h-8"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 4. QUICK ACTIONS GRID */}
                    <h3 className="text-lg font-bold text-gray-700 mb-4 px-1">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Action: Add New Record */}
                        <Link
                            href={route("mtop.create")}
                            className="group bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center gap-3 hover:-translate-y-1"
                        >
                            <div className="p-3 sm:p-4 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Icon
                                    icon="solar:add-circle-bold"
                                    width="24"
                                    className="sm:w-8 sm:h-8"
                                />
                            </div>
                            <span className="font-semibold text-sm sm:text-base text-gray-700 group-hover:text-blue-900 leading-tight">
                                Add New Operator
                            </span>
                        </Link>

                        {/* Action: Search */}
                        <Link
                            href={route("mtop.index")}
                            className="group bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center gap-3 hover:-translate-y-1"
                        >
                            <div className="p-3 sm:p-4 bg-teal-50 text-teal-600 rounded-full group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                <Icon
                                    icon="solar:magnifer-bold"
                                    width="24"
                                    className="sm:w-8 sm:h-8"
                                />
                            </div>
                            <span className="font-semibold text-sm sm:text-base text-gray-700 group-hover:text-teal-900 leading-tight">
                                Search Database
                            </span>
                        </Link>

                        {/* ADMIN ONLY ACTIONS */}
                        {user.role === "admin" && (
                            <>
                                {/* Action: Manage Signatories */}
                                <Link
                                    href={route("signatories.index")}
                                    className="group bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center gap-3 hover:-translate-y-1"
                                >
                                    <div className="p-3 sm:p-4 bg-indigo-50 text-indigo-600 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <Icon
                                            icon="solar:pen-new-square-bold"
                                            width="24"
                                            className="sm:w-8 sm:h-8"
                                        />
                                    </div>
                                    <span className="font-semibold text-sm sm:text-base text-gray-700 group-hover:text-indigo-900 leading-tight">
                                        Manage Signatories
                                    </span>
                                </Link>

                                {/* Action: Backup Database */}
                                <button
                                    onClick={handleBackup}
                                    disabled={backingUp}
                                    className="group cursor-pointer bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center gap-3 hover:-translate-y-1 w-full"
                                >
                                    <div className="p-3 sm:p-4 bg-red-50 text-red-600 rounded-full group-hover:bg-red-600 group-hover:text-white transition-colors">
                                        {backingUp ? (
                                            <Icon
                                                icon="solar:restart-bold"
                                                width="24"
                                                className="animate-spin sm:w-8 sm:h-8"
                                            />
                                        ) : (
                                            <Icon
                                                icon="solar:shield-bold"
                                                width="24"
                                                className="sm:w-8 sm:h-8"
                                            />
                                        )}
                                    </div>
                                    <span className="font-semibold text-sm sm:text-base text-gray-700 group-hover:text-red-900 leading-tight">
                                        {backingUp
                                            ? "Backing up..."
                                            : "Backup Database"}
                                    </span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
