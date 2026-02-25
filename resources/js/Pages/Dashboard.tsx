//GeronaMTOP\resources\js\Pages\Dashboard.tsx
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage, useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import InputError from "@/Components/InputError";
import axios from "axios"; // Ensure axios is imported

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
    const user: any = usePage().props.auth.user;
    const staffLink = `${serverIp}`;

    // --- DUAL BACKUP LOGIC (SQLite + CSV Download) ---
    const [backingUp, setBackingUp] = useState(false);

    const handleBackup = async () => {
        if (
            !confirm(
                "Create a database backup? This will save a snapshot on the server AND download a CSV file.",
            )
        ) {
            return;
        }

        setBackingUp(true);

        try {
            // Request the backup route as a blob (file)
            const response = await axios.post(
                route("settings.backup"),
                {},
                {
                    responseType: "blob",
                },
            );

            // Create a hidden link to trigger the download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;

            // Generate filename with date
            const date = new Date().toISOString().slice(0, 10);
            link.setAttribute("download", `MTOP_FULL_BACKUP_${date}.csv`);

            document.body.appendChild(link);
            link.click();
            link.remove(); // Clean up

            alert("Backup Successful! CSV downloaded and Database saved.");
        } catch (error) {
            console.error(error);
            alert("Backup failed. Please check the server logs.");
        } finally {
            setBackingUp(false);
        }
    };
    // ------------------------------------------------

    // --- IMPORT STATE & LOGIC ---
    const [showImportModal, setShowImportModal] = useState(false);
    const {
        data: importData,
        setData: setImportData,
        post: postImport,
        processing: importing,
        errors: importErrors,
        reset: resetImport,
    } = useForm({
        import_file: null as File | null,
    });

    const submitImport = (e: React.FormEvent) => {
        e.preventDefault();
        postImport(route("mtop.import"), {
            onSuccess: () => {
                setShowImportModal(false);
                resetImport();
            },
        });
    };
    // ----------------------------

    // --- CLOCK STATE & EFFECT ---
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    // ----------------------------

    const hour = currentTime.getHours();

    let greeting = "Good Evening";
    let greetingIcon = "solar:moon-stars-bold-duotone";
    let iconColor = "text-indigo-500 bg-indigo-50";

    if (hour < 12) {
        greeting = "Good Morning";
        greetingIcon = "solar:sunrise-bold-duotone";
        iconColor = "text-yellow-500 bg-yellow-50";
    } else if (hour < 18) {
        greeting = "Good Afternoon";
        greetingIcon = "solar:sun-bold-duotone";
        iconColor = "text-orange-500 bg-orange-50";
    }

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="py-6 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {user.role === "admin" && (
                        <div className="bg-linear-to-r from-blue-900 to-blue-800 text-white overflow-hidden shadow-lg rounded-xl mb-8">
                            <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 w-full sm:w-auto text-center sm:text-left">
                                    <div className="p-3 bg-white/10 rounded-full shrink-0 hidden sm:block">
                                        <Icon
                                            icon="solar:server-square-bold"
                                            width="32"
                                        />
                                    </div>
                                    <div className="w-full">
                                        <h3 className="text-lg font-bold flex items-center justify-center sm:justify-start gap-2">
                                            MTOP System Online
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                            </span>
                                        </h3>
                                        <p className="text-blue-100 text-sm mt-1">
                                            Staff Access Link:{" "}
                                            <span className="font-mono bg-black/20 px-2 py-1 rounded select-all font-bold text-yellow-300">
                                                {staffLink}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="text-center sm:text-right mt-2 sm:mt-0">
                                    <div className="text-xs sm:text-sm font-medium text-blue-200 uppercase tracking-widest mb-0.5">
                                        {currentTime.toLocaleDateString(
                                            "en-US",
                                            {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            },
                                        )}
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-black tabular-nums tracking-wide text-white">
                                        {currentTime.toLocaleTimeString(
                                            "en-US",
                                            {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            },
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm rounded-lg sm:rounded-lg mb-6 border-l-4 border-blue-900">
                        <div className="p-6 text-gray-900 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-bold text-blue-900">
                                    {greeting}, {user.name}!
                                </h3>
                                <p className="text-sm sm:text-base text-gray-600 mt-1">
                                    Welcome to the Gerona Municipal Tricycle
                                    Operator Permit (MTOP) System.
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    Serbisyong May Puso, Serbisyong Totoo!
                                </p>
                            </div>

                            <div
                                className={`hidden sm:flex items-center justify-center p-4 rounded-full ${iconColor}`}
                            >
                                <Icon icon={greetingIcon} width="42" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-blue-500 flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">
                                    Total MTOP Records
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

                        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-orange-400 flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wider">
                                    Added Record Today
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

                    <h3 className="text-lg font-bold text-gray-700 mb-4 px-1">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

                        <Link
                            href={route("settings.print.edit")}
                            className="group bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center gap-3 hover:-translate-y-1"
                        >
                            <div className="p-3 sm:p-4 bg-orange-50 text-orange-600 rounded-full group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                <Icon
                                    icon="solar:printer-bold"
                                    width="24"
                                    className="sm:w-8 sm:h-8"
                                />
                            </div>
                            <span className="font-semibold text-sm sm:text-base text-gray-700 group-hover:text-orange-900 leading-tight">
                                Print Settings
                            </span>
                        </Link>

                        {user.role === "admin" && (
                            <>
                                <button
                                    onClick={() => setShowImportModal(true)}
                                    className="group cursor-pointer bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center gap-3 hover:-translate-y-1 w-full"
                                >
                                    <div className="p-3 sm:p-4 bg-emerald-50 text-emerald-600 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        <Icon
                                            icon="solar:import-bold"
                                            width="24"
                                            className="sm:w-8 sm:h-8"
                                        />
                                    </div>
                                    <span className="font-semibold text-sm sm:text-base text-gray-700 group-hover:text-emerald-900 leading-tight">
                                        Import Data
                                    </span>
                                </button>

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

            {/* IMPORT MODAL */}
            <Modal
                show={showImportModal}
                onClose={() => setShowImportModal(false)}
                maxWidth="md"
            >
                <div className="bg-gray-800 px-6 py-4 rounded-t-lg flex justify-between items-center">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Icon icon="solar:import-bold" width="20" /> Import
                        Database / CSV
                    </h3>
                    <button
                        onClick={() => setShowImportModal(false)}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <Icon icon="solar:close-circle-bold" width="24" />
                    </button>
                </div>
                <div className="p-6 bg-gray-50">
                    <form onSubmit={submitImport} className="space-y-4">
                        <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-lg text-sm">
                            Upload an <strong>.sqlite</strong> backup file or a{" "}
                            <strong>.csv</strong> file. The system will safely
                            merge the data using Control Numbers to update
                            existing records and add new ones without creating
                            duplicates.
                        </div>

                        <div>
                            <input
                                type="file"
                                accept=".csv,.sqlite,.db"
                                onChange={(e) =>
                                    setImportData(
                                        "import_file",
                                        e.target.files?.[0] || null,
                                    )
                                }
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer border border-gray-300 rounded-lg bg-white shadow-sm"
                                required
                            />
                            <InputError
                                message={importErrors.import_file}
                                className="mt-2"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                            <SecondaryButton
                                onClick={() => setShowImportModal(false)}
                            >
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton
                                disabled={importing || !importData.import_file}
                                className="bg-emerald-600 hover:bg-emerald-700 focus:bg-emerald-700 active:bg-emerald-800"
                            >
                                {importing ? "Importing..." : "Run Import"}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
