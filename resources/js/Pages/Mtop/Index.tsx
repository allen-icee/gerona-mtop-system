import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react"; // Added usePage
import { Icon } from "@iconify/react";
import Pagination from "@/Components/Pagination";
import { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";

// Define the Data Type
interface MtopApplication {
    id: number;
    operator_name: string;
    body_number: string;
    address: string;
    contact_number: string;
    mt_plate_number: string;
    make_type: string;
    date_of_application: string;
}

interface Props {
    applications: {
        data: MtopApplication[];
        links: any[];
    };
    filters: {
        search?: string;
        month?: string;
        year?: string;
    };
}

export default function Index({ applications, filters }: Props) {
    // 1. GET USER ROLE (To hide Delete button from Staff)
    const user = usePage().props.auth.user;

    // STATE for Filters
    const [search, setSearch] = useState(filters.search || "");
    const [month, setMonth] = useState(filters.month || "");
    const [year, setYear] = useState(filters.year || "");

    // AUTO-SEARCH: Trigger search when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                route("mtop.index"),
                { search, month, year },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search, month, year]);

    // DELETE FUNCTION
    const handleDelete = (id: number) => {
        if (
            confirm(
                "Are you sure you want to delete this record? This cannot be undone.",
            )
        ) {
            router.delete(route("mtop.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    MTOP Records
                </h2>
            }
        >
            <Head title="MTOP Records" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* 1. TOOLBAR */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            {/* Search Input */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                    <Icon icon="solar:magnifer-bold" />
                                </div>
                                <TextInput
                                    className="pl-10 w-full sm:w-64"
                                    placeholder="Search Name, MTOP, or Plate..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {/* Filters */}
                            <select
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                            >
                                <option value="">All Months</option>
                                <option value="1">January</option>
                                <option value="2">February</option>
                                <option value="3">March</option>
                                <option value="4">April</option>
                                <option value="5">May</option>
                                <option value="6">June</option>
                                <option value="7">July</option>
                                <option value="8">August</option>
                                <option value="9">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                            </select>

                            <select
                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                            >
                                <option value="">All Years</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                            </select>
                        </div>

                        <Link
                            href={route("mtop.create")}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-md transition-all"
                        >
                            <Icon icon="solar:add-circle-bold" width="20" />
                            Add New
                        </Link>
                    </div>

                    {/* 2. THE TABLE */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">Body Number</th>
                                    <th className="px-6 py-3">Operator Name</th>
                                    <th className="px-6 py-3 hidden sm:table-cell">
                                        Address
                                    </th>
                                    <th className="px-6 py-3 hidden md:table-cell">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-8 text-center text-gray-400"
                                        >
                                            No records found.
                                        </td>
                                    </tr>
                                ) : (
                                    applications.data.map((app) => (
                                        <tr
                                            key={app.id}
                                            className="bg-white border-b hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                {app.body_number}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {app.operator_name}
                                                </div>
                                                <div className="text-xs text-gray-400 sm:hidden">
                                                    {app.address}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden sm:table-cell">
                                                {app.address}
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                {app.contact_number}
                                            </td>

                                            {/* ACTION BUTTONS */}
                                            <td className="px-6 py-4 flex items-center justify-center gap-3">
                                                {/* 1. PRINT (Open in new tab) */}
                                                <a
                                                    href={route(
                                                        "mtop.print",
                                                        app.id,
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-600 hover:text-green-900 tooltip"
                                                    title="Print Permit"
                                                >
                                                    <Icon
                                                        icon="solar:printer-bold"
                                                        width="20"
                                                    />
                                                </a>

                                                {/* 2. EDIT */}
                                                {/* Check if user is admin, OR just let staff edit (depending on your rule) */}
                                                {/* Usually Staff CAN edit but CANNOT delete */}
                                                <Link
                                                    href={route(
                                                        "mtop.edit",
                                                        app.id,
                                                    )}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Edit Record"
                                                >
                                                    <Icon
                                                        icon="solar:pen-new-square-bold"
                                                        width="20"
                                                    />
                                                </Link>

                                                {/* 3. DELETE (Admin Only) */}
                                                {user.role === "admin" && (
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(app.id)
                                                        }
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                        title="Delete Record"
                                                    >
                                                        <Icon
                                                            icon="solar:trash-bin-trash-bold"
                                                            width="20"
                                                        />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 3. PAGINATION */}
                    <div className="mt-4">
                        <Pagination links={applications.links} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
