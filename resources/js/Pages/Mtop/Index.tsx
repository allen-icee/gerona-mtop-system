import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Pagination from "@/Components/Pagination";
import { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";
import Modal from "@/Components/Modal";
import PermitPreview from "./Partials/PermitPreview";
import { BARANGAYS } from "@/Constants/Barangays";

// ... (Keep your MtopApplication and Props interfaces exactly the same) ...
interface MtopApplication {
    id: number;
    mt_number: string;
    last_name: string;
    first_name: string;
    middle_name: string;
    body_number: string;
    address: string;
    plate_no: string;
    transaction_date: string;
    make_type: string;
    engine_motor_no: string;
    chassis_no: string;
    cedula_number: string;
    cedula_date: string;
    or_number: string;
    or_date: string;
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
        barangay?: string;
    };
}

export default function Index({ applications, filters }: Props) {
    const user = usePage().props.auth.user;

    const [search, setSearch] = useState(filters.search || "");
    const [month, setMonth] = useState(filters.month || "");
    const [year, setYear] = useState(filters.year || "");
    const [barangay, setBarangay] = useState(filters.barangay || "");
    const [viewingApp, setViewingApp] = useState<MtopApplication | null>(null);

    // ... (Keep useEffect and handleDelete exactly the same) ...
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                route("mtop.index"),
                { search, month, year, barangay },
                { preserveState: true, replace: true },
            );
        }, 300);
        return () => clearTimeout(timer);
    }, [search, month, year, barangay]);

    const handleDelete = (id: number) => {
        if (confirm("Are you sure? This cannot be undone.")) {
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
                    {/* TOOLBAR - MADE BIGGER */}
                    <div className="flex flex-col xl:flex-row justify-between items-center mb-6 gap-4">
                        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                            {/* SEARCH - WIDER AND TALLER */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500">
                                    <Icon
                                        icon="solar:magnifer-bold"
                                        width="20"
                                    />
                                </div>
                                <TextInput
                                    className="pl-12 w-full md:w-80 py-3 text-base" // Bigger width & padding
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {/* FILTERS - TALLER & WIDER */}
                            <div className="flex gap-3">
                                <select
                                    className="border-gray-300 rounded-md shadow-sm text-base py-3 pl-4 pr-10 w-48" // Wider
                                    value={barangay}
                                    onChange={(e) =>
                                        setBarangay(e.target.value)
                                    }
                                >
                                    <option value="">All Barangays</option>
                                    {BARANGAYS.map((b) => (
                                        <option key={b} value={b}>
                                            {b}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="border-gray-300 rounded-md shadow-sm text-base py-3 w-32" // Wider
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                >
                                    <option value="">Month</option>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i} value={i + 1}>
                                            {new Date(0, i).toLocaleString(
                                                "default",
                                                { month: "short" },
                                            )}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="border-gray-300 rounded-md shadow-sm text-base py-3 w-28" // Wider
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                >
                                    <option value="">Year</option>
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>
                                </select>
                            </div>
                        </div>

                        {/* ADD BUTTON - BIGGER */}
                        <Link
                            href={route("mtop.create")}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 shadow-md w-full xl:w-auto justify-center text-base transition-transform hover:scale-105"
                        >
                            <Icon icon="solar:add-circle-bold" width="24" />
                            Add New Record
                        </Link>
                    </div>

                    {/* TABLE */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4">Control No.</th>{" "}
                                    {/* Increased Padding */}
                                    <th className="px-6 py-4">
                                        Applicant Name
                                    </th>
                                    <th className="px-6 py-4 hidden sm:table-cell">
                                        Address
                                    </th>
                                    <th className="px-6 py-4 text-center">
                                        Details
                                    </th>
                                    <th className="px-6 py-4 text-center">
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
                                            {/* 1. CONTROL # */}
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900 text-base">
                                                    {app.mt_number || "-"}
                                                </div>
                                            </td>

                                            {/* 2. NAME - Bigger Font */}
                                            <td className="px-6 py-4 font-bold text-gray-800 text-base">
                                                {app.last_name},{" "}
                                                {app.first_name}{" "}
                                                {app.middle_name
                                                    ? app.middle_name[0] + "."
                                                    : ""}
                                            </td>

                                            {/* 3. ADDRESS */}
                                            <td className="px-6 py-4 hidden sm:table-cell text-gray-600">
                                                {app.address}
                                            </td>

                                            {/* 4. VIEW BUTTON - Bigger */}
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() =>
                                                        setViewingApp(app)
                                                    }
                                                    className="font-bold text-sm uppercase tracking-wider text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-3 py-1 rounded-md"
                                                >
                                                    View Info
                                                </button>
                                            </td>

                                            {/* 5. ACTIONS - Bigger Icons */}
                                            <td className="px-6 py-4 flex items-center justify-center gap-4">
                                                <a
                                                    href={route(
                                                        "mtop.print",
                                                        app.id,
                                                    )}
                                                    target="_blank"
                                                    className="text-green-600 hover:text-green-900 tooltip"
                                                    title="Print"
                                                >
                                                    <Icon
                                                        icon="solar:printer-bold"
                                                        width="24"
                                                    />
                                                </a>
                                                <Link
                                                    href={route(
                                                        "mtop.edit",
                                                        app.id,
                                                    )}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Edit"
                                                >
                                                    <Icon
                                                        icon="solar:pen-new-square-bold"
                                                        width="24"
                                                    />
                                                </Link>
                                                {user.role === "admin" && (
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(app.id)
                                                        }
                                                        className="text-red-500 hover:text-red-700"
                                                        title="Delete"
                                                    >
                                                        <Icon
                                                            icon="solar:trash-bin-trash-bold"
                                                            width="24"
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
                    <div className="mt-6">
                        <Pagination links={applications.links} />
                    </div>
                </div>
            </div>

            {/* --- PREVIEW MODAL --- */}
            <Modal
                show={!!viewingApp}
                onClose={() => setViewingApp(null)}
                maxWidth="2xl"
            >
                {" "}
                {/* WIDER MODAL (5xl) */}
                {viewingApp && (
                    <div className="bg-white rounded-lg shadow-xl relative z-50 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="bg-gray-800 px-6 py-4 flex justify-between items-center shrink-0">
                            <h3 className="text-white font-bold uppercase tracking-wider text-lg flex items-center gap-2">
                                <Icon icon="solar:document-text-bold" />
                                Information Preview
                            </h3>
                            <button
                                onClick={() => setViewingApp(null)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Icon
                                    icon="solar:close-circle-bold"
                                    width="28"
                                />
                            </button>
                        </div>

                        {/* Content - Increased Padding */}
                        <div className="overflow-y-auto p-0 bg-gray-100 flex-1">
                            {/* Pass showHeader=false to hide duplicate header inside modal */}
                            <PermitPreview
                                data={viewingApp}
                                showHeader={false}
                            />
                        </div>

                        {/* Footer */}
                        <div className="bg-white border-t px-6 py-4 flex justify-end gap-3 shrink-0">
                            <Link
                                href={route("mtop.edit", viewingApp.id)}
                                className="inline-flex items-center px-6 py-3 bg-blue-600 border border-transparent rounded-lg font-semibold text-sm text-white uppercase tracking-widest hover:bg-blue-700"
                            >
                                <Icon
                                    icon="solar:pen-new-square-bold"
                                    className="mr-2"
                                    width="18"
                                />
                                Edit Record
                            </Link>
                            <button
                                onClick={() => setViewingApp(null)}
                                className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg font-semibold text-sm text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
