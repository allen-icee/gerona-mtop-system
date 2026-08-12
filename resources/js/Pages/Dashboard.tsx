//GeronaMTOP\resources\js\Pages\Dashboard.tsx
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage, useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import { useState, useEffect, useRef } from "react";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import InputError from "@/Components/InputError";
import axios from "axios";

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
            const response = await axios.post(
                route("settings.backup"),
                {},
                {
                    responseType: "blob",
                },
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;

            const date = new Date().toISOString().slice(0, 10);
            link.setAttribute("download", `MTOP_FULL_BACKUP_${date}.csv`);

            document.body.appendChild(link);
            link.click();
            link.remove();

            alert("Backup Successful! CSV downloaded and Database saved.");
        } catch (error) {
            console.error(error);
            alert("Backup failed. Please check the server logs.");
        } finally {
            setBackingUp(false);
        }
    };

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

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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

    const [showEasterEgg, setShowEasterEgg] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const secretKeys = useRef<string[]>([]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            secretKeys.current = [
                ...secretKeys.current,
                e.key.toLowerCase(),
            ].slice(-4);
            if (secretKeys.current.join("") === "devs") {
                setShowEasterEgg(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSecretClick = () => {
        setClickCount((prev) => {
            if (prev + 1 >= 5) {
                setShowEasterEgg(true);
                return 0;
            }
            return prev + 1;
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {user.role === "admin" && (
                        <div className="bg-gradient-to-r from-blue-800 to-blue-700 text-white overflow-hidden shadow-sm rounded-lg mb-4 border border-blue-900">
                            <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center gap-3 w-full sm:w-auto text-center sm:text-left">
                                    <div className="p-2 bg-white/10 rounded-full shrink-0 hidden sm:block">
                                        <Icon
                                            icon="solar:server-square-bold"
                                            width="28"
                                        />
                                    </div>
                                    <div className="w-full">
                                        <h3 className="text-base font-bold flex items-center justify-center sm:justify-start gap-2">
                                            MTOP System Online
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                            </span>
                                        </h3>
                                        <p className="text-blue-100 text-xs mt-0.5">
                                            Staff Access Link:{" "}
                                            <span className="font-mono bg-black/20 px-1.5 py-0.5 rounded select-all font-semibold text-blue-50">
                                                {staffLink}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="text-center sm:text-right mt-2 sm:mt-0">
                                    <div className="text-[11px] font-medium text-blue-200 uppercase tracking-widest mb-0.5">
                                        {currentTime.toLocaleDateString(
                                            "en-US",
                                            {
                                                weekday: "short",
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            },
                                        )}
                                    </div>
                                    <div className="text-xl sm:text-2xl font-bold tabular-nums tracking-wide text-white">
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

                    <div className="bg-slate-50 border border-slate-200 shadow-sm rounded-lg mb-4 border-l-4 border-l-blue-600">
                        <div className="p-4 text-slate-800 flex items-center justify-between">
                            <div
                                onClick={handleSecretClick}
                                className="cursor-pointer select-none rounded-lg transition-colors hover:bg-slate-100 p-2 -ml-2"
                            >
                                <h3 className="text-lg sm:text-xl font-bold text-slate-700">
                                    {greeting}, {user.name}!
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                                    Welcome to the Gerona Municipal Tricycle
                                    Operator Permit (MTOP) System.
                                </p>
                            </div>

                            <div
                                className={`hidden sm:flex items-center justify-center p-3 rounded-full ${iconColor} opacity-90`}
                            >
                                <Icon icon={greetingIcon} width="32" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
                        <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg shadow-sm border-t-4 border-t-blue-500 flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
                                    Total MTOP Records
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-slate-700 mt-0.5">
                                    {totalMtop}
                                </p>
                            </div>
                            <div className="p-2 bg-blue-100/50 rounded-full text-blue-600">
                                <Icon
                                    icon="solar:folder-with-files-bold"
                                    width="24"
                                    className="sm:w-7 sm:h-7"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg shadow-sm border-t-4 border-t-orange-400 flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
                                    Added Record Today
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-slate-700 mt-0.5">
                                    {newToday}
                                </p>
                            </div>
                            <div className="p-2 bg-orange-100/50 rounded-full text-orange-500">
                                <Icon
                                    icon="solar:clock-circle-bold"
                                    width="24"
                                    className="sm:w-7 sm:h-7"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg shadow-sm border-t-4 border-t-emerald-500 flex items-center justify-between sm:col-span-2 md:col-span-1">
                            <div>
                                <p className="text-slate-500 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
                                    System Users
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-slate-700 mt-0.5">
                                    {totalUsers}
                                </p>
                            </div>
                            <div className="p-2 bg-emerald-100/50 rounded-full text-emerald-600">
                                <Icon
                                    icon="solar:users-group-rounded-bold"
                                    width="24"
                                    className="sm:w-7 sm:h-7"
                                />
                            </div>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-600 mb-3 px-1 uppercase tracking-wider">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <Link
                            href={route("mtop.create")}
                            className="group bg-slate-50 p-3 sm:p-4 rounded-lg shadow-sm hover:shadow transition-all border border-slate-200 flex flex-col items-center text-center gap-2 hover:-translate-y-0.5"
                        >
                            <div className="p-2 sm:p-3 bg-blue-100/50 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Icon
                                    icon="solar:add-circle-bold"
                                    width="20"
                                    className="sm:w-6 sm:h-6"
                                />
                            </div>
                            <span className="font-semibold text-xs sm:text-sm text-slate-700 group-hover:text-blue-800 leading-tight">
                                Add Operator
                            </span>
                        </Link>


                        {user.role === "admin" && (
                            <>
                                <Link
                                    href={route("settings.print.edit")}
                                    className="group bg-slate-50 p-3 sm:p-4 rounded-lg shadow-sm hover:shadow transition-all border border-slate-200 flex flex-col items-center text-center gap-2 hover:-translate-y-0.5"
                                >
                                    <div className="p-2 sm:p-3 bg-purple-100/50 text-purple-600 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        <Icon
                                            icon="solar:printer-bold"
                                            width="20"
                                            className="sm:w-6 sm:h-6"
                                        />
                                    </div>
                                    <span className="font-semibold text-xs sm:text-sm text-slate-700 group-hover:text-purple-800 leading-tight">
                                        Print Settings
                                    </span>
                                </Link>

                                <button
                                    onClick={() => setShowImportModal(true)}
                                    className="group cursor-pointer bg-slate-50 p-3 sm:p-4 rounded-lg shadow-sm hover:shadow transition-all border border-slate-200 flex flex-col items-center text-center gap-2 hover:-translate-y-0.5 w-full"
                                >
                                    <div className="p-2 sm:p-3 bg-orange-100/50 text-orange-600 rounded-full group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                        <Icon
                                            icon="solar:import-bold"
                                            width="20"
                                            className="sm:w-6 sm:h-6"
                                        />
                                    </div>
                                    <span className="font-semibold text-xs sm:text-sm text-slate-700 group-hover:text-orange-800 leading-tight">
                                        Import Data
                                    </span>
                                </button>

                                <form method="POST" action={route("settings.backup")} className="w-full">
                                    <input
                                        type="hidden"
                                        name="_token"
                                        value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''}
                                    />
                                    <button
                                        type="submit"
                                        className="group cursor-pointer bg-slate-50 p-3 sm:p-4 rounded-lg shadow-sm hover:shadow transition-all border border-slate-200 flex flex-col items-center text-center gap-2 hover:-translate-y-0.5 w-full"
                                    >
                                        <div className="p-2 sm:p-3 bg-red-100/50 text-red-600 rounded-full group-hover:bg-red-600 group-hover:text-white transition-colors">
                                            <Icon
                                                icon="solar:shield-bold"
                                                width="20"
                                                className="sm:w-6 sm:h-6"
                                            />
                                        </div>
                                        <span className="font-semibold text-xs sm:text-sm text-slate-700 group-hover:text-red-800 leading-tight">
                                            Backup DB
                                        </span>
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>

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
                            <strong>.xlsx</strong> file. The system will safely
                            merge the data using Control Numbers to update
                            existing records and add new ones without creating
                            duplicates.
                        </div>
                        <div>
                            <input
                                type="file"
                                accept=".xlsx, .xls, .csv, .sqlite"
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
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                {importing ? "Importing..." : "Run Import"}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal
                show={showEasterEgg}
                onClose={() => setShowEasterEgg(false)}
                maxWidth="sm"
            >
                <div className="relative p-6 text-center bg-slate-50/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-200 shadow-xl">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>

                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative">
                        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-md shadow-blue-200/50 animate-pulse">
                            <Icon
                                icon="solar:code-square-bold-duotone"
                                width="32"
                                className="text-white"
                            />
                        </div>
                    </div>

                    <h2 className="mt-4 text-2xl font-black text-slate-800">
                        <span className="text-blue-600">System</span>{" "}
                        <span className="text-purple-600">Developers</span>
                    </h2>

                    <p className="text-xs text-slate-500 mt-1 italic">
                        Hi! We are the first creator as OJT Students:
                    </p>

                    <div className="mt-4 space-y-2">
                        <div className="p-3 bg-white/60 rounded-xl border border-slate-200 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all duration-300 font-semibold text-slate-700 hover:text-blue-600 text-sm">
                            Allen Icee A. Dequiros
                        </div>

                        <div className="p-3 bg-white/60 rounded-xl border border-slate-200 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all duration-300 font-semibold text-slate-700 hover:text-purple-600 text-sm">
                            Elijah Miguel V. Inocencio
                        </div>
                    </div>

                    <button
                        onClick={() => setShowEasterEgg(false)}
                        className="mt-5 w-full py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow hover:shadow-md hover:scale-[1.02]"
                    >
                        ⊂⁠(⁠≽^•⩊•^≼⁠)⁠つ
                    </button>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
