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
import ToastListener from "@/Components/ToastListener";
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
    "Dropping Official" // <--- Added here
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
    dropping_fee: "Dropping Fee", // <--- Added here
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
    dropping_fee: 100, // <--- Added here
};

export default function Index({ signatories = [], feeSettings, filters = {} }: Props) {
    const [search, setSearch] = useState(filters.search || "");
    const [positionFilter, setPositionFilter] = useState(filters.position || "All");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // For handling the custom position typing
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

    // Added a separate state for the dropdown vs the actual value sent
    const [dropdownPosition, setDropdownPosition] = useState("Punong Bayan");

    const { data, setData, post, put, reset, errors, processing } = useForm({
        name: "",
        position: "Punong Bayan",
        is_active: true,
    });

    const openModal = (signatory?: Signatory) => {
        if (signatory) {
            setEditingId(signatory.id);
            // Check if the position from DB is one of the standard ones
            if (POSITIONS.includes(signatory.position)) {
                setDropdownPosition(signatory.position);
                setIsCustomPosition(signatory.position === "Dropping Official");
                setData({ name: signatory.name, position: signatory.position, is_active: Boolean(signatory.is_active) });
            } else {
                // If it's a custom title (like Admin Aide IV), set dropdown to Dropping Official
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
            setData("position", ""); // Clear it so they can type
        } else {
            setIsCustomPosition(false);
            setData("position", val);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Fallback in case they selected Dropping Official but didn't type anything
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
            <ToastListener />

            <div className="py-6 sm:py-12 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                            <div className="relative w-full sm:w-64 md:w-80">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500">
                                    <Icon icon="iconamoon:search-bold" width="20" />
                                </div>
                                <TextInput className="pl-12 w-full py-3 text-base shadow-sm" placeholder="Search official..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>

                            <div className="relative w-full sm:w-60">
                                <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} className="block w-full pl-5 pr-10 py-3 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm text-base bg-white transition-colors cursor-pointer appearance-none text-gray-700">
                                    {FILTER_TABS.map((tab) => <option key={tab} value={tab}>{tab === "All" ? "All Positions" : tab}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-600">
                                    <Icon icon="solar:alt-arrow-down-linear" width="20" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                            <button onClick={() => setIsImportModalOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white border font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all flex-1 sm:flex-none hover:cursor-pointer" title="Import from CSV">
                                <Icon icon="solar:import-bold" width="22" /> <span className="hidden sm:inline">Import</span>
                            </button>
                            <a href={route("signatories.export")} className="bg-green-600 hover:bg-green-700 text-white border font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all flex-1 sm:flex-none" title="Export to CSV">
                                <Icon icon="solar:file-download-bold" width="22" /> <span className="hidden sm:inline">Export</span>
                            </a>
                            <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 shadow-md transition-transform hover:scale-105 flex-1 sm:flex-none justify-center">
                                <Icon icon="solar:add-circle-bold" width="24" /> <span className="whitespace-nowrap">Add Official</span>
                            </button>
                        </div>
                    </div>

                    <div className="hidden md:block bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Position</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {signatories.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No officials found in this category.</td></tr>
                                ) : (
                                    signatories.map((sig) => (
                                        <tr key={sig.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-900 text-base">{sig.name}</td>
                                            <td className="px-6 py-4 text-gray-600">{sig.position}</td>
                                            <td className="px-6 py-4 text-center">{getStatusBadge(sig.is_active)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-3">
                                                    <button onClick={() => openModal(sig)} className="bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md px-3 py-1.5 flex items-center gap-1 font-bold">
                                                        <Icon icon="solar:pen-new-square-bold" width="18" /> Edit
                                                    </button>
                                                    <button onClick={() => confirmDelete(sig.id)} className="bg-red-50 text-red-600 hover:bg-red-100 rounded-md px-3 py-1.5 flex items-center gap-1 font-bold">
                                                        <Icon icon="solar:trash-bin-trash-bold" width="18" /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-12 bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100 p-8 relative">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b pb-5 gap-4">
                            <div>
                                <h3 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
                                    <Icon icon="solar:tag-price-bold" className="text-indigo-600" width="28" />
                                    Official Receipt Fee Configuration
                                </h3>
                                <p className="text-sm text-gray-500 mt-1 font-medium">Updates made here immediately reflect in new OR Records.</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                                {hasUnsavedChanges && (
                                    <span className="text-sm font-bold text-amber-600 flex items-center gap-1 animate-pulse">
                                        <Icon icon="solar:danger-triangle-bold" width="18" /> Unsaved changes
                                    </span>
                                )}

                                <button
                                    type="button"
                                    onClick={handleResetToDefault}
                                    disabled={isSavingFees}
                                    className="w-full sm:w-auto text-red-600 bg-red-50 hover:bg-red-100 px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-red-100 disabled:opacity-50"
                                >
                                    <Icon icon="solar:restart-circle-bold" width="18" />
                                    Reset to Default
                                </button>

                                <PrimaryButton
                                    id="btn-save-fees"
                                    onClick={handleSaveFees}
                                    disabled={!hasUnsavedChanges || isSavingFees}
                                    className={`w-full sm:w-auto justify-center px-8 py-3 text-base transition-all duration-200 ${!hasUnsavedChanges ? "opacity-50 cursor-not-allowed bg-gray-600" : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:-translate-y-0.5"}`}
                                >
                                    <Icon icon="solar:diskette-bold" className="mr-2" width="20" />
                                    {isSavingFees ? "Saving..." : "Save Changes"}
                                </PrimaryButton>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
                            {Object.entries(FEE_LABELS).map(([key, label]) => (
                                <div key={key} className="flex flex-col">
                                    <label className="text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">{label}</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-extrabold text-lg">₱</span>
                                        <input
                                            type="number"
                                            step="any"
                                            className="fee-input pl-11 pr-4 py-3 w-full border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base font-bold text-gray-900 transition-all bg-white"
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

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="lg">
                <div className="flex flex-col h-full sm:h-auto">
                    <div className="bg-gray-800 px-6 py-4 flex justify-between items-center shrink-0 sm:rounded-t-lg">
                        <h3 className="text-white font-bold uppercase tracking-wider text-lg flex items-center gap-2">
                            <Icon icon="solar:user-id-bold" width="24" /> {editingId ? "Edit Official" : "Add New Official"}
                        </h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors p-2">
                            <Icon icon="solar:close-circle-bold" width="28" />
                        </button>
                    </div>
                    <div className="p-6 bg-gray-50 overflow-y-auto flex-1">
                        <form id="signatory-form" onSubmit={submit}>
                            <InputGroup
                                id="name"
                                label="Name"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value.replace(/[^a-zA-ZñÑ\s.,-]/g, ""))}
                                error={errors.name}
                                placeholder="Hon. Allen Icee Dequiros, Ph.D"
                                icon="solar:user-bold"
                                required
                            />

                            <div className="mt-4 mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Position Category <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 z-10"><Icon icon="solar:diploma-verified-bold" width="20" /></div>
                                    <select
                                        value={dropdownPosition}
                                        onChange={(e) => handleDropdownChange(e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10 pr-10 py-3 appearance-none bg-white cursor-pointer"
                                    >
                                        {POSITIONS.map((pos) => <option key={pos} value={pos}>{pos}</option>)}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400"><Icon icon="solar:alt-arrow-down-bold" width="20" /></div>
                                </div>
                            </div>

                            {isCustomPosition && (
                                <div className="mb-4 animate-fade-in">
                                    <InputGroup
                                        id="custom_position"
                                        label="Specific Title / Position"
                                        value={data.position}
                                        onChange={(e) => setData("position", e.target.value)}
                                        error={errors.position}
                                        placeholder="e.g. Administrative Aide IV"
                                        icon="solar:pen-bold"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">This specific title will be printed on the Dropping Record.</p>
                                </div>
                            )}

                            {editingId && (
                                <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg flex items-center justify-between shadow-sm">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-800">Official Status</span>
                                        <span className="text-xs text-gray-500">{data.is_active ? "This official is visible in forms." : "This official is hidden."}</span>
                                    </div>
                                    <Switch checked={data.is_active} onChange={(checked: boolean) => setData("is_active", checked)} className={`${data.is_active ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-7 w-12 items-center rounded-full transition-colors`}>
                                        <span className={`${data.is_active ? "translate-x-6" : "translate-x-1"} inline-block h-5 w-5 transform rounded-full bg-white transition-transform`} />
                                    </Switch>
                                </div>
                            )}
                        </form>
                    </div>
                    <div className="bg-white border-t px-6 py-4 flex justify-end gap-3 shrink-0 sm:rounded-b-lg">
                        <SecondaryButton onClick={() => setIsModalOpen(false)}>Cancel</SecondaryButton>
                        <PrimaryButton className="bg-blue-600 hover:bg-blue-700 shadow-md" disabled={processing} onClick={() => { (document.getElementById("signatory-form") as HTMLFormElement)?.requestSubmit(); }}>
                            <Icon icon="solar:diskette-bold" className="mr-2" width="20" /> Save Official
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            <Modal show={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} maxWidth="md">
                <div className="bg-gray-800 px-6 py-4 rounded-t-lg flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2"><Icon icon="solar:import-bold" width="20" /> Import Signatories CSV</h3>
                    <button onClick={() => setIsImportModalOpen(false)}><Icon icon="solar:close-circle-bold" width="24" /></button>
                </div>
                <div className="p-6 bg-gray-50">
                    <form onSubmit={submitImport} className="space-y-4">
                        <div className="bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-lg text-sm">Upload a .csv file to cleanly sync official data.</div>
                        <input type="file" accept=".csv" onChange={(e) => setImportData("import_file", e.target.files?.[0] || null)} className="block w-full border border-gray-300 rounded-lg p-3 bg-white" required />
                        <InputError message={importErrors.import_file} className="mt-2" />
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <SecondaryButton onClick={() => setIsImportModalOpen(false)}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={importing || !importData.import_file} className="bg-emerald-600 hover:bg-emerald-700">{importing ? "Importing..." : "Run Import"}</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <ConfirmDeleteModal show={deletingId !== null} onClose={() => setDeletingId(null)} onConfirm={handleDelete} title="Delete Official?" message="Delete this official? They will no longer appear in new forms." processing={isDeleting} />
            <UnsavedChangesModal show={showUnsavedModal} onClose={() => { setShowUnsavedModal(false); setPendingVisit(null); }} onLeave={confirmLeave} />
        </AuthenticatedLayout>
    );
}
