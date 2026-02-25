//GeronaMTOP\resources\js\Pages\Mtop\Index.tsx
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
import DriverInfoModal from "./Partials/DriverInfoModal";

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
    status: string;
    driver_name?: string;
    driver_photo_path?: string;
    valid_until?: string;
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
        renewal?: string;
    };
    officials: { name: string; position: string }[];
}

export default function Index({ applications, filters, officials }: Props) {
    const user = usePage().props.auth.user;

    const [search, setSearch] = useState(filters.search || "");
    const [month, setMonth] = useState(filters.month || "");
    const [year, setYear] = useState(filters.year || "");
    const [barangay, setBarangay] = useState(filters.barangay || "");
    const [renewal, setRenewal] = useState(filters.renewal || "");
    const [viewingApp, setViewingApp] = useState<MtopApplication | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showDriverModal, setShowDriverModal] = useState(false);

    const { now, sixtyDaysFromNow } = useMemo(() => {
        const currentDate = new Date();
        const futureDate = new Date();
        futureDate.setDate(currentDate.getDate() + 60);
        return { now: currentDate, sixtyDaysFromNow: futureDate };
    }, []);

    useEffect(() => {
        const searchTimer = setTimeout(() => {
            router.get(
                route("mtop.index"),
                { search, month, year, barangay, renewal },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 300);

        return () => clearTimeout(searchTimer);
    }, [search, month, year, barangay, renewal]);

    useEffect(() => {
        const pollInterval = setInterval(() => {
            router.reload({ only: ["applications"] });
        }, 10000);

        return () => clearInterval(pollInterval);
    }, []);

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

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((i) => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const toggleSelectAll = () => {
        if (
            selectedIds.length === applications.data.length &&
            applications.data.length > 0
        ) {
            setSelectedIds([]);
        } else {
            setSelectedIds(applications.data.map((app) => app.id));
        }
    };

    const selectedApps = useMemo(() => {
        return applications.data.filter((app) => selectedIds.includes(app.id));
    }, [selectedIds, applications.data]);

    return (
        <AuthenticatedLayout>
            <Head title="MTOP Records" />

            <div className="py-6 sm:py-12 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col xl:flex-row justify-between items-center mb-6 gap-4">
                        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto flex-wrap">
                            <div className="relative w-full md:w-auto">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500">
                                    <Icon
                                        icon="iconamoon:search-bold"
                                        width="20"
                                    />
                                </div>
                                <TextInput
                                    className="pl-12 w-full md:w-80 py-3 text-base shadow-sm"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-wrap">
                                <select
                                    className="border-gray-300 rounded-md shadow-sm text-base py-3 pl-4 pr-10 w-full sm:w-48 focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer"
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
                                    className="border-gray-300 rounded-md shadow-sm text-base py-3 w-full sm:w-32 focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer"
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
                                    className="border-gray-300 rounded-md shadow-sm text-base py-3 w-full sm:w-28 focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                >
                                    <option value="">Year</option>
                                    {Array.from(
                                        {
                                            length:
                                                new Date().getFullYear() -
                                                2000 +
                                                2,
                                        },
                                        (_, i) =>
                                            new Date().getFullYear() + 1 - i,
                                    ).map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="border-gray-300 rounded-md shadow-sm text-base py-3 w-full sm:w-40 focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer"
                                    value={renewal}
                                    onChange={(e) => setRenewal(e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="active">
                                        Active (Valid)
                                    </option>
                                    <option value="upcoming">
                                        For Renewal
                                    </option>
                                    <option value="expired">Expired</option>
                                    <option value="archived">
                                        Archived (History)
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                            <a
                                href={route("mtop.export", {
                                    _query: {
                                        search,
                                        month,
                                        year,
                                        barangay,
                                        renewal,
                                    },
                                })}
                                target="_blank"
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-md w-full sm:w-auto text-base transition-transform hover:scale-105"
                            >
                                <Icon
                                    icon="solar:file-download-bold"
                                    width="24"
                                />{" "}
                                Export
                            </a>

                            <Link
                                href={route("mtop.create")}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-md w-full sm:w-auto text-base transition-transform hover:scale-105"
                            >
                                <Icon icon="solar:add-circle-bold" width="24" />{" "}
                                Add
                            </Link>
                        </div>
                    </div>

                    <div className="hidden md:block bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 w-12 text-center">
                                        <button
                                            type="button"
                                            onClick={toggleSelectAll}
                                            aria-label="Select all records"
                                            className={`w-5 h-5 mx-auto rounded flex items-center justify-center transition-all duration-200 border ${
                                                applications.data.length > 0 &&
                                                selectedIds.length ===
                                                    applications.data.length
                                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-inner scale-110"
                                                    : "bg-white border-gray-300 text-transparent hover:border-indigo-400 hover:bg-indigo-50"
                                            }`}
                                        >
                                            <Icon
                                                icon="solar:check-read-bold"
                                                width="14"
                                            />
                                        </button>
                                    </th>
                                    <th className="px-6 py-4">Control No.</th>
                                    <th className="px-6 py-4">
                                        Applicant Name
                                    </th>
                                    <th className="px-6 py-4 hidden lg:table-cell">
                                        Address
                                    </th>
                                    <th className="px-6 py-4 text-center">
                                        Status
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
                                            colSpan={7}
                                            className="px-6 py-8 text-center text-gray-400"
                                        >
                                            No records found.
                                        </td>
                                    </tr>
                                ) : (
                                    applications.data.map((app) => {
                                        const validUntilDate = app.valid_until
                                            ? new Date(app.valid_until)
                                            : null;

                                        const isExpired = validUntilDate
                                            ? validUntilDate < now
                                            : false;
                                        const isExpiringSoon = validUntilDate
                                            ? validUntilDate <= sixtyDaysFromNow
                                            : false;

                                        let displayStatus = "Draft";
                                        let statusClasses =
                                            "bg-gray-100 text-gray-600 border border-gray-200";

                                        if (app.status === "archived") {
                                            displayStatus = "Archived";
                                            statusClasses =
                                                "bg-gray-100 text-gray-500 border border-gray-200";
                                        } else if (
                                            app.status === "expired" ||
                                            (app.status === "active" &&
                                                isExpired)
                                        ) {
                                            displayStatus = "Expired";
                                            statusClasses =
                                                "bg-red-50 text-red-600 border border-red-200";
                                        } else if (app.status === "active") {
                                            if (isExpiringSoon) {
                                                displayStatus = "For Renewal";
                                                statusClasses =
                                                    "bg-yellow-50 text-yellow-700 border border-yellow-200";
                                            } else {
                                                displayStatus = "Active";
                                                statusClasses =
                                                    "bg-green-50 text-green-700 border border-green-200";
                                            }
                                        }

                                        const canRenew =
                                            app.status === "expired" ||
                                            (app.status === "active" &&
                                                (isExpired ||
                                                    isExpiringSoon ||
                                                    !app.valid_until));
                                        const isSelected = selectedIds.includes(
                                            app.id,
                                        );

                                        return (
                                            <tr
                                                key={app.id}
                                                className={`border-b transition-colors ${isSelected ? "bg-indigo-50/50" : "bg-white hover:bg-gray-50"}`}
                                            >
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleSelect(app.id)
                                                        }
                                                        className={`w-5 h-5 mx-auto rounded flex items-center justify-center transition-all duration-200 border ${
                                                            isSelected
                                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm scale-110"
                                                                : "bg-white border-gray-300 text-transparent hover:border-indigo-400 hover:bg-indigo-50"
                                                        }`}
                                                    >
                                                        <Icon
                                                            icon="solar:check-read-bold"
                                                            width="14"
                                                        />
                                                    </button>
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
                                                        ? app.middle_name[0] +
                                                          "."
                                                        : ""}{" "}
                                                    {app.suffix
                                                        ? app.suffix + ""
                                                        : ""}
                                                </td>
                                                <td className="px-6 py-4 hidden lg:table-cell text-gray-600 uppercase">
                                                    {app.address.replace(
                                                        /(,\s*GERONA,\s*TARLAC|\s*GERONA,\s*TARLAC)/i,
                                                        "",
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusClasses}`}
                                                    >
                                                        {displayStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() =>
                                                            setViewingApp(app)
                                                        }
                                                        className="inline-flex hover:cursor-pointer items-center justify-center gap-2 font-bold text-sm tracking-wider text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
                                                    >
                                                        <Icon
                                                            icon="solar:eye-bold"
                                                            width="18"
                                                        />{" "}
                                                        View
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
                                                        >
                                                            <Icon
                                                                icon="solar:printer-bold"
                                                                width="18"
                                                            />{" "}
                                                            Print
                                                        </a>
                                                        <Link
                                                            href={route(
                                                                "mtop.edit",
                                                                app.id,
                                                            )}
                                                            className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 hover:cursor-pointer px-3 py-1.5 rounded-md font-bold text-sm transition-colors"
                                                        >
                                                            <Icon
                                                                icon="solar:pen-new-square-bold"
                                                                width="18"
                                                            />{" "}
                                                            Edit
                                                        </Link>

                                                        {canRenew && (
                                                            <Link
                                                                href={route(
                                                                    "mtop.renew",
                                                                    app.id,
                                                                )}
                                                                className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800 px-3 py-1.5 rounded-md font-bold text-sm transition-colors"
                                                            >
                                                                <Icon
                                                                    icon="solar:restart-square-bold"
                                                                    width="18"
                                                                />{" "}
                                                                Renew
                                                            </Link>
                                                        )}

                                                        {user.role ===
                                                            "admin" && (
                                                            <button
                                                                onClick={() =>
                                                                    confirmDelete(
                                                                        app.id,
                                                                    )
                                                                }
                                                                className="inline-flex items-center hover:cursor-pointer justify-center bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 p-1.5 rounded-md transition-colors"
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
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="md:hidden space-y-4">
                        {applications.data.length === 0 ? (
                            <div className="bg-white p-8 text-center rounded-lg border border-gray-200 text-gray-400">
                                No records found.
                            </div>
                        ) : (
                            applications.data.map((app) => {
                                const validUntilDate = app.valid_until
                                    ? new Date(app.valid_until)
                                    : null;

                                const isExpired = validUntilDate
                                    ? validUntilDate < now
                                    : false;
                                const isExpiringSoon = validUntilDate
                                    ? validUntilDate <= sixtyDaysFromNow
                                    : false;

                                let displayStatus = "Draft";
                                let statusClasses =
                                    "bg-gray-100 text-gray-600 border border-gray-200";

                                if (app.status === "archived") {
                                    displayStatus = "Archived";
                                    statusClasses =
                                        "bg-gray-100 text-gray-500 border border-gray-200";
                                } else if (
                                    app.status === "expired" ||
                                    (app.status === "active" && isExpired)
                                ) {
                                    displayStatus = "Expired";
                                    statusClasses =
                                        "bg-red-50 text-red-600 border border-red-200";
                                } else if (app.status === "active") {
                                    if (isExpiringSoon) {
                                        displayStatus = "For Renewal";
                                        statusClasses =
                                            "bg-yellow-50 text-yellow-700 border border-yellow-200";
                                    } else {
                                        displayStatus = "Active";
                                        statusClasses =
                                            "bg-green-50 text-green-700 border border-green-200";
                                    }
                                }

                                const canRenew =
                                    app.status === "expired" ||
                                    (app.status === "active" &&
                                        (isExpired ||
                                            isExpiringSoon ||
                                            !app.valid_until));
                                const isSelected = selectedIds.includes(app.id);

                                return (
                                    <div
                                        key={app.id}
                                        className={`bg-white rounded-xl border p-4 shadow-sm transition-all flex flex-col ${isSelected ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/10" : "border-gray-200"}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleSelect(app.id)
                                                    }
                                                    className={`w-6 h-6 rounded flex items-center justify-center transition-all duration-200 border shrink-0 ${isSelected ? "bg-indigo-600 border-indigo-600 text-white shadow-sm scale-110" : "bg-white border-gray-300 text-transparent hover:border-indigo-400 hover:bg-indigo-50"}`}
                                                >
                                                    <Icon
                                                        icon="solar:check-read-bold"
                                                        width="16"
                                                    />
                                                </button>
                                                <div>
                                                    <span className="text-xs font-bold text-indigo-600 uppercase">
                                                        Control No.
                                                    </span>
                                                    <p className="font-bold text-gray-900">
                                                        {app.mt_number || "-"}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    setViewingApp(app)
                                                }
                                                className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                            >
                                                <Icon
                                                    icon="solar:eye-bold"
                                                    width="20"
                                                />
                                            </button>
                                        </div>

                                        <div className="mb-4 pl-9">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-gray-400 uppercase">
                                                    Applicant
                                                </span>
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${statusClasses}`}
                                                >
                                                    {displayStatus}
                                                </span>
                                            </div>
                                            <p className="text-gray-800 font-medium">
                                                {app.last_name},{" "}
                                                {app.first_name}{" "}
                                                {app.middle_name
                                                    ? app.middle_name[0] + "."
                                                    : ""}
                                            </p>
                                            <p className="text-sm text-gray-500 leading-tight mt-1">
                                                {app.address.replace(
                                                    /(,\s*GERONA,\s*TARLAC|\s*GERONA,\s*TARLAC)/i,
                                                    "",
                                                )}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                                            <a
                                                href={route(
                                                    "mtop.print",
                                                    app.id,
                                                )}
                                                target="_blank"
                                                className="flex-1 flex justify-center items-center gap-1.5 bg-green-50 text-green-700 py-2.5 rounded-lg font-bold text-sm hover:bg-green-100 transition-colors"
                                            >
                                                <Icon
                                                    icon="solar:printer-bold"
                                                    width="16"
                                                />{" "}
                                                Print
                                            </a>
                                            <Link
                                                href={route(
                                                    "mtop.edit",
                                                    app.id,
                                                )}
                                                className="flex-1 flex justify-center items-center gap-1.5 bg-blue-50 text-blue-700 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-100 transition-colors"
                                            >
                                                <Icon
                                                    icon="solar:pen-new-square-bold"
                                                    width="16"
                                                />{" "}
                                                Edit
                                            </Link>

                                            {canRenew && (
                                                <Link
                                                    href={route(
                                                        "mtop.renew",
                                                        app.id,
                                                    )}
                                                    className="flex-1 flex justify-center items-center gap-1.5 bg-yellow-50 text-yellow-700 py-2.5 rounded-lg font-bold text-sm hover:bg-yellow-100 transition-colors"
                                                >
                                                    <Icon
                                                        icon="solar:restart-bold"
                                                        width="16"
                                                    />{" "}
                                                    Renew
                                                </Link>
                                            )}

                                            {user.role === "admin" && (
                                                <button
                                                    onClick={() =>
                                                        confirmDelete(app.id)
                                                    }
                                                    className="px-3 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                >
                                                    <Icon
                                                        icon="solar:trash-bin-trash-bold"
                                                        width="18"
                                                    />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="mt-6">
                        <Pagination links={applications.links} />
                    </div>
                </div>
            </div>
            <div
                className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
                    selectedIds.length > 0
                        ? "translate-y-0 opacity-100 scale-100"
                        : "translate-y-12 opacity-0 scale-95 pointer-events-none"
                }`}
            >
                <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-1.5 rounded-full shadow-2xl flex items-center gap-2">
                    <div className="flex items-center gap-3 pl-3 pr-2">
                        <div className="flex items-center gap-2">
                            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                                {selectedIds.length}
                            </span>
                            <span className="text-sm font-medium text-slate-300 hidden sm:block">
                                Selected
                            </span>
                        </div>
                    </div>

                    <div className="w-px h-6 bg-slate-700"></div>

                    <button
                        onClick={() => setShowDriverModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:cursor-pointer"
                    >
                        <Icon icon="solar:printer-bold" width="18" />
                        <span>Print IDs</span>
                    </button>

                    <button
                        onClick={() => setSelectedIds([])}
                        className="text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors rounded-full p-1 hover:cursor-pointer"
                        title="Clear Selection"
                    >
                        <Icon icon="solar:close-circle-bold" width="18" />
                    </button>
                </div>
            </div>

            <DriverInfoModal
                show={showDriverModal}
                onClose={() => setShowDriverModal(false)}
                selectedApps={selectedApps}
                officials={officials}
            />

            <Modal
                show={!!viewingApp}
                onClose={() => setViewingApp(null)}
                maxWidth="2xl"
            >
                {viewingApp && (
                    <div className="flex flex-col h-dvh sm:h-auto sm:max-h-[90vh]">
                        <div className="bg-gray-800 px-6 py-4 flex justify-between items-center shrink-0 sm:rounded-t-lg">
                            <h3 className="text-white font-bold uppercase tracking-wider text-lg flex items-center gap-2">
                                <Icon icon="solar:document-text-bold" />{" "}
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
                                />{" "}
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

            <ConfirmDeleteModal
                show={deletingId !== null}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDelete}
                processing={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
