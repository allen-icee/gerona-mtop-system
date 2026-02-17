import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Pagination from "@/Components/Pagination";
import { useState, useEffect, useMemo } from "react";
import TextInput from "@/Components/TextInput";
import Modal from "@/Components/Modal";
import PermitPreview from "./Partials/PermitPreview";
import { BARANGAYS } from "@/Constants/Barangays";
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal";
import Checkbox from "@/Components/Checkbox";
import DriverInfoModal from "./Partials/DriverInfoModal";

// Interfaces
interface MtopApplication {
    id: number;
    mt_number: string;
    last_name: string;
    first_name: string;
    middle_name: string;
    suffix?: string;
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
    // New fields for ID printing
    driver_name?: string;
    driver_photo_path?: string;
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
    // Received from Controller
    officials: { name: string; position: string }[];
}

export default function Index({ applications, filters, officials }: Props) {
    // <--- Added 'officials' here
    const user = usePage().props.auth.user;

    const [search, setSearch] = useState(filters.search || "");
    const [month, setMonth] = useState(filters.month || "");
    const [year, setYear] = useState(filters.year || "");
    const [barangay, setBarangay] = useState(filters.barangay || "");
    const [viewingApp, setViewingApp] = useState<MtopApplication | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- PHASE 4: BATCH PRINTING STATE ---
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showDriverModal, setShowDriverModal] = useState(false);

    // 1. SEARCH & AUTO-REFRESH (POLLING)
    useEffect(() => {
        const searchTimer = setTimeout(() => {
            router.get(
                route("mtop.index"),
                { search, month, year, barangay },
                { preserveState: true, replace: true },
            );
        }, 300);

        const pollInterval = setInterval(() => {
            router.reload({ only: ["applications"] });
        }, 10000);

        return () => {
            clearTimeout(searchTimer);
            clearInterval(pollInterval);
        };
    }, [search, month, year, barangay]);

    const confirmDelete = (id: number) => {
        setDeletingId(id);
    };

    const handleDelete = () => {
        if (deletingId) {
            setIsDeleting(true);
            router.delete(route("mtop.destroy", deletingId), {
                onFinish: () => {
                    setDeletingId(null);
                    setIsDeleting(false);
                },
            });
        }
    };

    // --- SELECTION LOGIC ---
    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((i) => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === applications.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(applications.data.map((app) => app.id));
        }
    };

    // Filter selected apps for the modal
    const selectedApps = useMemo(() => {
        return applications.data.filter((app) => selectedIds.includes(app.id));
    }, [selectedIds, applications.data]);

    return (
        <AuthenticatedLayout>
            <Head title="MTOP Records" />

            <div className="py-6 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* TOOLBAR */}
                    <div className="flex flex-col xl:flex-row justify-between items-center mb-6 gap-4">
                        {/* SEARCH & FILTERS */}
                        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto flex-wrap">
                            <div className="relative w-full md:w-auto">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500">
                                    <Icon
                                        icon="iconamoon:search-bold"
                                        width="20"
                                    />
                                </div>
                                <TextInput
                                    className="pl-12 w-full md:w-80 py-3 text-base"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-wrap">
                                <select
                                    className="border-gray-300 rounded-md shadow-sm text-base py-3 pl-4 pr-10 w-full sm:w-48"
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
                                    className="border-gray-300 rounded-md shadow-sm text-base py-3 w-full sm:w-32"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                >
                                    <option value="">Month</option>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i} value={i + 1}>
                                            {new Date(0, i).toLocaleString(
                                                "default",
                                                { month: "long" },
                                            )}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="border-gray-300 rounded-md shadow-sm text-base py-3 w-full sm:w-28"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                >
                                    <option value="">Year</option>
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>
                                </select>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                            {/* --- BATCH PRINT BUTTON (Shows when items selected) --- */}
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={() => setShowDriverModal(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-md w-full sm:w-auto text-base transition-transform hover:scale-105 animate-in fade-in slide-in-from-right-4"
                                >
                                    <Icon
                                        icon="solar:printer-bold"
                                        width="24"
                                    />
                                    Print IDs ({selectedIds.length})
                                </button>
                            )}

                            <a
                                href={route("mtop.export", {
                                    _query: { search, month, year, barangay },
                                })}
                                target="_blank"
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-md w-full sm:w-auto text-base transition-transform hover:scale-105"
                            >
                                <Icon
                                    icon="solar:file-download-bold"
                                    width="24"
                                />
                                Export
                            </a>

                            <Link
                                href={route("mtop.create")}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-md w-full sm:w-auto text-base transition-transform hover:scale-105"
                            >
                                <Icon icon="solar:add-circle-bold" width="24" />
                                Add
                            </Link>
                        </div>
                    </div>

                    {/* --- DESKTOP VIEW: TABLE --- */}
                    <div className="hidden md:block bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    {/* CHECKBOX HEADER */}
                                    <th className="px-6 py-4 w-4">
                                        <Checkbox
                                            checked={
                                                applications.data.length > 0 &&
                                                selectedIds.length ===
                                                    applications.data.length
                                            }
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-6 py-4">Control No.</th>
                                    <th className="px-6 py-4">
                                        Applicant Name
                                    </th>
                                    <th className="px-6 py-4 hidden lg:table-cell">
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
                                            colSpan={6}
                                            className="px-6 py-8 text-center text-gray-400"
                                        >
                                            No records found.
                                        </td>
                                    </tr>
                                ) : (
                                    applications.data.map((app) => (
                                        <tr
                                            key={app.id}
                                            className={`border-b transition-colors ${
                                                selectedIds.includes(app.id)
                                                    ? "bg-indigo-50"
                                                    : "bg-white hover:bg-gray-50"
                                            }`}
                                        >
                                            {/* CHECKBOX ROW */}
                                            <td className="px-6 py-4">
                                                <Checkbox
                                                    checked={selectedIds.includes(
                                                        app.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleSelect(app.id)
                                                    }
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900 text-base">
                                                    {app.mt_number || "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-800 text-base">
                                                {app.last_name},{" "}
                                                {app.first_name}{" "}
                                                {app.middle_name
                                                    ? app.middle_name[0] + "."
                                                    : ""}{" "}
                                                {app.suffix
                                                    ? app.suffix + ". "
                                                    : ""}
                                            </td>
                                            <td className="px-6 py-4 hidden lg:table-cell text-gray-600">
                                                {app.address}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() =>
                                                        setViewingApp(app)
                                                    }
                                                    className="inline-flex items-center justify-center gap-2 font-bold text-sm tracking-wider hover:cursor-pointer text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
                                                >
                                                    <Icon
                                                        icon="solar:eye-bold"
                                                        width="18"
                                                    />
                                                    Details
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <a
                                                        href={route(
                                                            "mtop.print",
                                                            app.id,
                                                        )}
                                                        target="_blank"
                                                        className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 px-3 py-1.5 rounded-md font-bold text-sm transition-colors"
                                                        title="Print Permit"
                                                    >
                                                        <Icon
                                                            icon="solar:printer-bold"
                                                            width="18"
                                                        />
                                                        Print
                                                    </a>
                                                    <Link
                                                        href={route(
                                                            "mtop.edit",
                                                            app.id,
                                                        )}
                                                        className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 hover:cursor-pointer px-3 py-1.5 rounded-md font-bold text-sm transition-colors"
                                                        title="Edit Application"
                                                    >
                                                        <Icon
                                                            icon="solar:pen-new-square-bold"
                                                            width="18"
                                                        />
                                                        Edit
                                                    </Link>
                                                    {user.role === "admin" && (
                                                        <button
                                                            onClick={() =>
                                                                confirmDelete(
                                                                    app.id,
                                                                )
                                                            }
                                                            className="inline-flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 p-1.5 rounded-md transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Icon
                                                                icon="solar:trash-bin-trash-bold"
                                                                width="18"
                                                            />
                                                        </button>
                                                    )}
                                                </div>
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

            {/* --- DRIVER INFO MODAL (BATCH PRINTING) --- */}
            <DriverInfoModal
                show={showDriverModal}
                onClose={() => setShowDriverModal(false)}
                selectedApps={selectedApps}
                officials={officials} // <--- CORRECTLY PASSED NOW
            />

            {/* --- PREVIEW MODAL --- */}
            <Modal
                show={!!viewingApp}
                onClose={() => setViewingApp(null)}
                maxWidth="2xl"
            >
                {viewingApp && (
                    <div className="flex flex-col h-dvh sm:h-auto sm:max-h-[90vh]">
                        <div className="bg-gray-800 px-6 py-4 flex justify-between items-center shrink-0 sm:rounded-t-lg">
                            <h3 className="text-white font-bold uppercase tracking-wider text-lg flex items-center gap-2">
                                <Icon icon="solar:document-text-bold" />
                                Information Preview
                            </h3>
                            <button
                                onClick={() => setViewingApp(null)}
                                className="text-gray-400 hover:text-white transition-colors p-2"
                            >
                                <Icon
                                    icon="solar:close-circle-bold"
                                    width="28"
                                />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-0 bg-gray-100 flex-1">
                            <PermitPreview
                                data={viewingApp}
                                showHeader={false}
                            />
                        </div>

                        <div className="bg-white border-t px-6 py-4 flex justify-end gap-3 shrink-0 sm:rounded-b-lg pb-safe">
                            <Link
                                href={route("mtop.edit", viewingApp.id)}
                                className="justify-center flex-1 sm:flex-none inline-flex items-center px-6 py-3 bg-blue-600 border border-transparent rounded-lg font-semibold text-sm text-white uppercase tracking-widest hover:bg-blue-700"
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
                                className="justify-center flex-1 sm:flex-none inline-flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg font-semibold text-sm text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* --- DELETE CONFIRMATION MODAL --- */}
            <ConfirmDeleteModal
                show={deletingId !== null}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDelete}
                processing={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
