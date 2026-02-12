import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { Icon } from "@iconify/react";

export default function Dashboard({
    totalMtop,
    totalUsers,
    newToday,
}: {
    totalMtop: number;
    totalUsers: number;
    newToday: number;
}) {
    const user = usePage().props.auth.user;

    // 1. SMART GREETING LOGIC
    const hour = new Date().getHours();
    const greeting =
        hour < 12
            ? "Good Morning"
            : hour < 18
              ? "Good Afternoon"
              : "Good Evening";

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* 2. WELCOME BANNER */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6 border-l-4 border-blue-900">
                        <div className="p-6 text-gray-900 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-blue-900">
                                    {greeting}, {user.name}!
                                </h3>
                                <p className="text-gray-500 mt-1">
                                    Welcome to the Gerona Municipal Tricycle
                                    Operator Permit (MTOP) System.
                                </p>
                            </div>
                            <Icon
                                icon="solar:sun-fog-bold-duotone"
                                width="48"
                                className="text-yellow-500 hidden sm:block"
                            />
                        </div>
                    </div>

                    {/* 3. QUICK STATS (Placeholders for now) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Card 1: Total Records */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-blue-500 flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                                    Total Records
                                </p>
                                <p className="text-3xl font-bold text-gray-800 mt-1">
                                    {totalMtop}
                                </p>{" "}
                                {/* Placeholder */}
                            </div>
                            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                                <Icon
                                    icon="solar:folder-with-files-bold"
                                    width="32"
                                />
                            </div>
                        </div>

                        {/* Card 2: Pending Renewals (Example) */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-orange-400 flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                                    Pending Renewal
                                </p>
                                <div>
                                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                                        Added Today
                                    </p>
                                    <p className="text-3xl font-bold text-gray-800 mt-1">
                                        {newToday}
                                    </p>
                                </div>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-full text-orange-500">
                                <Icon
                                    icon="solar:clock-circle-bold"
                                    width="32"
                                />
                            </div>
                        </div>

                        {/* Card 3: Active Users */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-green-500 flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                                    System Users
                                </p>
                                <p className="text-3xl font-bold text-gray-800 mt-1">
                                    {totalUsers}
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-full text-green-600">
                                <Icon
                                    icon="solar:users-group-rounded-bold"
                                    width="32"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 4. QUICK ACTIONS GRID */}
                    <h3 className="text-lg font-bold text-gray-700 mb-4 px-1">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Action: Add New Record */}
                        <Link
                            href={route("mtop.create")}
                            className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center gap-3 hover:-translate-y-1"
                        >
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Icon icon="solar:add-circle-bold" width="32" />
                            </div>
                            <span className="font-semibold text-gray-700 group-hover:text-blue-900">
                                Add New Operator
                            </span>
                        </Link>

                        {/* Action: View All Records */}
                        <Link
                            href={route("mtop.index")}
                            className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center gap-3 hover:-translate-y-1"
                        >
                            <div className="p-4 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Icon
                                    icon="solar:documents-minimalistic-bold"
                                    width="32"
                                />
                            </div>
                            <span className="font-semibold text-gray-700 group-hover:text-purple-900">
                                View Records
                            </span>
                        </Link>

                        {/* Action: Search (Just links to Index for now) */}
                        <Link
                            href={route("mtop.index")}
                            className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center gap-3 hover:-translate-y-1"
                        >
                            <div className="p-4 bg-teal-50 text-teal-600 rounded-full group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                <Icon icon="solar:magnifer-bold" width="32" />
                            </div>
                            <span className="font-semibold text-gray-700 group-hover:text-teal-900">
                                Search Database
                            </span>
                        </Link>

                        {/* Action: Profile Settings */}
                        <Link
                            href={route("profile.edit")}
                            className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center gap-3 hover:-translate-y-1"
                        >
                            <div className="p-4 bg-gray-50 text-gray-600 rounded-full group-hover:bg-gray-600 group-hover:text-white transition-colors">
                                <Icon icon="solar:settings-bold" width="32" />
                            </div>
                            <span className="font-semibold text-gray-700 group-hover:text-gray-900">
                                My Profile
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
