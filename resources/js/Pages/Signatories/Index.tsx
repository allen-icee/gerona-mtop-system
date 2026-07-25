//GeronaMTOP/resources/js/Pages/Signatories/Index.tsx
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { useState, useEffect, FormEventHandler, useRef } from "react";
import InputGroup from "@/Components/InputGroup";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import { Icon } from "@iconify/react";
import { Switch } from "@headlessui/react";
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal";
import UnsavedChangesModal from "@/Components/UnsavedChangesModal";
import toast from "react-hot-toast";

interface Signatory {
    id: number;
    name: string;
    position: string;
    is_active: boolean;
}

interface Props {
    signatories: Signatory[];
    feeSettings: any;
    filters?: {
        search?: string;
        position?: string;
    };
}

const POSITIONS = [
    "Punong Bayan",
    "Authorized Official",
    "Committee on Transportation",
    "Collecting Officer",
    "Dropping Official"
];

const FILTER_TABS = ["All", ...POSITIONS];

const FEE_LABELS = {
    reg_filing_fee: "REG./Filing Fee",
    franchise_fee: "Franchise Fee",
    mayors_permit: "Mayor's Permit",
    supervisor_fee: "Supervisor Fee",
    account_clearance: "Account Clearance",
    sticker_fee: "Sticker Fee",
    id_driver_operator_owner: "I.D. (Driver/Operator/Owner)",
    body_number_plate: "Body Number / Plate",
    penalty: "Penalty",
    dropping_fee: "Dropping Fee",
};

const DEFAULT_FEES = {
    reg_filing_fee: 30,
    franchise_fee: 300,
    mayors_permit: 150,
    supervisor_fee: 50,
    account_clearance: 50,
    sticker_fee: 165,
    id_driver_operator_owner: 100,
    body_number_plate: 100,
    penalty: 211.25,
    dropping_fee: 100,
};

export default function Index({ signatories = [], feeSettings, filters = {} }: Props) {
    const [search, setSearch] = useState(filters.search || "");
    const [positionFilter, setPositionFilter] = useState(filters.position || "All");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const [isCustomPosition, setIsCustomPosition] = useState(false);

    const getInitialFees = () => {
        const fees: any = {};
        Object.keys(FEE_LABELS).forEach((key) => {
            const val = (feeSettings && feeSettings[key] !== undefined && feeSettings[key] !== null)
                ? feeSettings[key]
                : DEFAULT_FEES[key as keyof typeof DEFAULT_FEES];
            fees[key] = String(val);
        });
        return fees;
    };

    const [savedFees, setSavedFees] = useState(getInitialFees());
    const [currentFees, setCurrentFees] = useState(getInitialFees());
    const [isSavingFees, setIsSavingFees] = useState(false);

    const hasUnsavedChanges = JSON.stringify(savedFees) !== JSON.stringify(currentFees);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [pendingVisit, setPendingVisit] = useState<any>(null);

    useEffect(() => {
        const unbind = router.on('before', (event) => {
            const isSavingRequest = event.detail.visit.method === 'post'
                && event.detail.visit.url.pathname === new URL(route('settings.fees.update')).pathname;

            if (hasUnsavedChanges && !showUnsavedModal && !isSavingRequest) {
                event.preventDefault();
                setPendingVisit(event.detail.visit);
                setShowUnsavedModal(true);
            }
        });
        return unbind;
    }, [hasUnsavedChanges, showUnsavedModal]);

    const handleSaveFees = () => {
        setIsSavingFees(true);
        router.post(route('settings.fees.update'), currentFees, {
            preserveScroll: true,
            onSuccess: () => {
                setSavedFees(currentFees);
                toast.success("Official Receipt Fees saved successfully!", {
                    duration: 3000,
                    icon: <Icon icon="solar:check-circle-bold" className="text-green-600 text-xl" />,
                });
            },
            onError: (errors) => {
                toast.error("Failed to save fees. Please check your inputs.", {
                    duration: 4000,
                    icon: <Icon icon="solar:danger-circle-bold" className="text-red-600 text-xl" />,
                });
            },
            onFinish: () => setIsSavingFees(false)
        });
    };

    const handleResetToDefault = () => {
        const resetFees: any = {};
        Object.keys(DEFAULT_FEES).forEach((key) => {
            resetFees[key] = String(DEFAULT_FEES[key as keyof typeof DEFAULT_FEES]);
        });
        setCurrentFees(resetFees);
    };

    const onFeeKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const focusableElements = Array.from(document.querySelectorAll("input.fee-input, button#btn-save-fees")) as HTMLElement[];
            const currentIndex = focusableElements.indexOf(e.currentTarget as HTMLElement);
            if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
                focusableElements[currentIndex + 1].focus();
            } else if (hasUnsavedChanges) {
                document.getElementById("btn-save-fees")?.click();
            }
        }
    };

    const { data: importData, setData: setImportData, post: postImport, processing: importing, errors: importErrors, reset: resetImport } = useForm({
        import_file: null as File | null,
    });

    const initialRender = useRef(true);

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }
        const timer = setTimeout(() => {
            router.get(route("signatories.index"), { search, position: positionFilter }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [search, positionFilter]);

    const [dropdownPosition, setDropdownPosition] = useState("Punong Bayan");

    const { data, setData, post, put, reset, errors, processing } = useForm({
        name: "",
        position: "Punong Bayan",
        is_active: true,
    });

    const openModal = (signatory?: Signatory) => {
        if (signatory) {
            setEditingId(signatory.id);
            if (POSITIONS.includes(signatory.position)) {
                setDropdownPosition(signatory.position);
                setIsCustomPosition(signatory.position === "Dropping Official");
                setData({ name: signatory.name, position: signatory.position, is_active: Boolean(signatory.is_active) });
            } else {
                setDropdownPosition("Dropping Official");
                setIsCustomPosition(true);
                setData({ name: signatory.name, position: signatory.position, is_active: Boolean(signatory.is_active) });
            }
        } else {
            setEditingId(null);
            reset();
            setDropdownPosition("Punong Bayan");
            setIsCustomPosition(false);
            setData({ name: "", position: "Punong Bayan", is_active: true });
        }
        setIsModalOpen(true);
    };

    const handleDropdownChange = (val: string) => {
        setDropdownPosition(val);
        if (val === "Dropping Official") {
            setIsCustomPosition(true);
            setData("position", "");
        } else {
            setIsCustomPosition(false);
            setData("position", val);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (dropdownPosition === "Dropping Official" && data.position.trim() === "") {
            setData("position", "Dropping Official");
        }

        const options = { onSuccess: () => { setIsModalOpen(false); reset(); } };
        if (editingId) put(route("signatories.update", editingId), options);
        else post(route("signatories.store"), options);
    };

    const submitImport = (e: React.FormEvent) => {
        e.preventDefault();
        postImport(route("signatories.import"), { onSuccess: () => { setIsImportModalOpen(false); resetImport(); } });
    };

    const confirmDelete = (id: number) => setDeletingId(id);

    const handleDelete = () => {
        if (deletingId) {
            setIsDeleting(true);
            router.delete(route("signatories.destroy", deletingId), {
                onFinish: () => { setDeletingId(null); setIsDeleting(false); },
            });
        }
    };

    const confirmLeave = () => {
        setShowUnsavedModal(false);
        if (pendingVisit) {
            router.visit(pendingVisit.url, { method: pendingVisit.method, data: pendingVisit.data });
        }
    };

    const getStatusBadge = (isActive: boolean) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
            {isActive ? "Active" : "Inactive"}
        </span>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Signatories" />

            <div className="py-6 sm:py-12 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                            <div className="relative w-full sm:w-64 md:w-80">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                                    <Icon icon="iconamoon:search-bold" width="16" />
                                </div>
                                <input type="text" className="pl-9 w-full py-2 text-sm rounded border border-slate-300 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white placeholder:text-slate-400 font-semibold" placeholder="Search official..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>

                            <div className="relative w-full sm:w-60">
                                <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} className="block w-full pl-3 pr-8 py-2 border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded shadow-sm text-sm font-semibold bg-white transition-colors cursor-pointer appearance-none text-slate-700">
                                    {FILTER_TABS.map((tab) => <option key={tab} value={tab}>{tab === "All" ? "All Positions" : tab}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-500">
                                    <Icon icon="solar:alt-arrow-down-linear" width="16" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
                            <button onClick={() => setIsImportModalOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-3 rounded flex items-center justify-center gap-1 shadow-sm transition-all flex-1 sm:flex-none hover:cursor-pointer text-sm" title="Import from CSV">
                                <Icon icon="solar:import-bold" width="16" /> <span className="hidden sm:inline">Import</span>
                            </button>
                            <a href={route("signatories.export")} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded flex items-center justify-center gap-1 shadow-sm transition-all flex-1 sm:flex-none text-sm" title="Export to CSV">
                                <Icon icon="solar:file-download-bold" width="16" /> <span className="hidden sm:inline">Export</span>
                            </a>
                            <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-1 shadow-md transition-all flex-1 sm:flex-none justify-center text-sm">
                                <Icon icon="solar:add-circle-bold" width="18" /> <span className="whitespace-nowrap">Add Official</span>
                            </button>
                        </div>
                    </div>

                    <div className="hidden md:block bg-slate-50 overflow-hidden shadow-sm sm:rounded-lg border border-slate-200">
                        <table className="w-full text-sm text-slate-600 border-collapse [&_th]:border [&_th]:border-slate-200 [&_td]:border [&_td]:border-slate-200">
                            <thead className="text-xs text-slate-100 uppercase bg-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-center">Name</th>
                                    <th className="px-6 py-4 text-center">Position</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {signatories.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No officials found in this category.</td></tr>
                                ) : (
                                    signatories.map((sig) => (
                                        <tr key={sig.id} className="bg-white even:bg-blue-50 hover:bg-slate-100 transition-colors border-b border-slate-200 last:border-0">
                                            <td className="px-6 py-4 font-bold text-slate-800 text-base text-center">{sig.name}</td>
                                            <td className="px-6 py-4 text-slate-600 text-center">{sig.position}</td>
                                            <td className="px-6 py-4 text-center">{getStatusBadge(sig.is_active)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => openModal(sig)} className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded px-3 py-1.5 flex items-center gap-1 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm">
                                                        <Icon icon="solar:pen-new-square-bold" width="16" /> Edit
                                                    </button>
                                                    <button onClick={() => confirmDelete(sig.id)} className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded px-3 py-1.5 flex items-center gap-1 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm">
                                                        <Icon icon="solar:trash-bin-trash-bold" width="16" /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 bg-slate-50 overflow-hidden shadow-sm sm:rounded border border-slate-200 p-5 relative">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 border-b border-slate-200 pb-4 gap-4">
                            <div>
                                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                                    <Icon icon="solar:tag-price-bold" className="text-red-500" width="20" />
                                    Official Receipt Fee Configuration
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5 font-bold uppercase tracking-wide">Updates reflect in new OR Records.</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                {hasUnsavedChanges && (
                                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1 animate-pulse">
                                        <Icon icon="solar:danger-triangle-bold" width="16" /> Unsaved changes
                                    </span>
                                )}

                                <button
                                    type="button"
                                    onClick={handleResetToDefault}
                                    disabled={isSavingFees}
                                    className="w-full sm:w-auto text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded text-sm font-bold transition-all flex items-center justify-center gap-1.5 border border-red-100 disabled:opacity-50"
                                >
                                    <Icon icon="solar:restart-circle-bold" width="16" />
                                    Reset to Default
                                </button>

                                <button
                                    id="btn-save-fees"
                                    onClick={handleSaveFees}
                                    disabled={!hasUnsavedChanges || isSavingFees}
                                    className={`w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm rounded font-bold transition-all ${!hasUnsavedChanges ? "opacity-50 cursor-not-allowed bg-slate-400 text-white" : "bg-blue-600 hover:bg-blue-700 text-white shadow"}`}
                                >
                                    <Icon icon="solar:diskette-bold" className="mr-1.5" width="16" />
                                    {isSavingFees ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-4">
                            {Object.entries(FEE_LABELS).map(([key, label]) => (
                                <div key={key} className="flex flex-col">
                                    <label className="text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 font-extrabold text-sm">₱</span>
                                        <input
                                            type="number"
                                            step="any"
                                            className="fee-input pl-7 pr-2 py-1.5 w-full border border-slate-300 rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm font-semibold text-slate-700 transition-all bg-white"
                                            value={currentFees[key as keyof typeof currentFees] ?? ''}
                                            onChange={(e) => setCurrentFees({ ...currentFees, [key]: e.target.value })}
                                            onKeyDown={onFeeKeyDown}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm">
                <div className="bg-slate-50 rounded-none sm:rounded-lg h-full flex flex-col">
                    <div className="flex justify-between items-center bg-slate-700 px-5 py-3 rounded-none sm:rounded-t-lg border-b border-slate-800">
                        <h3 className="text-white font-bold text-base flex items-center gap-2">
                            <Icon icon="solar:user-id-bold" width="20" className="text-blue-400" />
                            {editingId ? "Edit Official" : "Add New Official"}
                        </h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                            <Icon icon="solar:close-circle-bold" width="22" />
                        </button>
                    </div>

                    <div className="p-5">
                        <form id="signatory-form" onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value.replace(/[^a-zA-ZñÑ\s.,-]/g, ""))}
                                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors placeholder:text-slate-400"
                                    placeholder="Hon. Allen Icee Dequiros, Ph.D"
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                    Position Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={dropdownPosition}
                                    onChange={(e) => handleDropdownChange(e.target.value)}
                                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                >
                                    {POSITIONS.map((pos) => <option key={pos} value={pos}>{pos}</option>)}
                                </select>
                            </div>

                            {isCustomPosition && (
                                <div className="animate-fade-in">
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                        Specific Title / Position <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="custom_position"
                                        type="text"
                                        value={data.position}
                                        onChange={(e) => setData("position", e.target.value)}
                                        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors placeholder:text-slate-400"
                                        placeholder="e.g. Administrative Aide IV"
                                        required
                                    />
                                    {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
                                    <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wider">This title will be printed on the Dropping Record.</p>
                                </div>
                            )}

                            {editingId && (
                                <div className="mt-2 p-3 bg-white border border-slate-200 rounded flex items-center justify-between shadow-sm">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Official Status</span>
                                        <span className="text-[10px] text-slate-500 font-semibold">{data.is_active ? "Visible in forms" : "Hidden"}</span>
                                    </div>
                                    <Switch checked={data.is_active} onChange={(checked: boolean) => setData("is_active", checked)} className={`${data.is_active ? "bg-blue-600" : "bg-slate-300"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}>
                                        <span className={`${data.is_active ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                    </Switch>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-5 border-t border-slate-200 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded text-sm font-bold hover:bg-slate-300 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing || !data.name.trim() || (isCustomPosition && !data.position.trim())} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    {editingId ? "Save Changes" : "Save Official"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>

            <Modal show={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} maxWidth="sm">
                <div className="bg-slate-50 rounded-none sm:rounded-lg h-full flex flex-col">
                    <div className="flex justify-between items-center bg-slate-700 px-5 py-3 rounded-none sm:rounded-t-lg border-b border-slate-800">
                        <h3 className="text-white font-bold text-base flex items-center gap-2">
                            <Icon icon="solar:import-bold" width="20" className="text-orange-400" />
                            Import Signatories CSV
                        </h3>
                        <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                            <Icon icon="solar:close-circle-bold" width="22" />
                        </button>
                    </div>

                    <div className="p-5">
                        <form onSubmit={submitImport} className="space-y-4">
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded text-[11px] font-bold uppercase tracking-wide">
                                Upload a .csv file to cleanly sync official data.
                            </div>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={(e) => setImportData("import_file", e.target.files?.[0] || null)}
                                className="block w-full border border-slate-300 rounded p-2 text-sm bg-white font-semibold text-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                required
                            />
                            {importErrors.import_file && <p className="text-red-500 text-xs mt-1">{importErrors.import_file}</p>}

                            <div className="flex justify-end gap-2 pt-5 border-t border-slate-200 mt-4">
                                <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded text-sm font-bold hover:bg-slate-300 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={importing || !importData.import_file} className="px-4 py-2 bg-emerald-600 text-white rounded text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                                    {importing ? "Importing..." : "Run Import"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>

            <ConfirmDeleteModal show={deletingId !== null} onClose={() => setDeletingId(null)} onConfirm={handleDelete} title="Delete Official?" message="Delete this official? They will no longer appear in new forms." processing={isDeleting} />
            <UnsavedChangesModal show={showUnsavedModal} onClose={() => { setShowUnsavedModal(false); setPendingVisit(null); }} onLeave={confirmLeave} />
        </AuthenticatedLayout>
    );
}
