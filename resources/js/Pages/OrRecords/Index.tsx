//GeronaMTOP\resources\js\Pages\OrRecords\Index.tsx
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import InputGroup from "@/Components/InputGroup";
import SuffixSelect from "@/Components/SuffixSelect";
import { Icon } from "@iconify/react";
import SignatorySelect from "@/Components/SignatorySelect";
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal";
import OrSuccessModal from "./Partials/OrSuccessModal";
import toast from "react-hot-toast";
import ClearRecordsModal from "@/Components/ClearRecordsModal";


const FEE_LABELS = {
    reg_filing_fee: "REG./Filing Fee",
    franchise_fee: "Franchise Fee",
    mayors_permit: "Mayor's Permit",
    supervisor_fee: "Supervisor Fee",
    account_clearance: "Account Clearance",
    sticker_fee: "Sticker Fee",
    id_driver_operator_owner: "I.D.",
    body_number_plate: "Body Number / Plate",
    penalty: "Penalty",
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

interface OrRecord {
    id: number;
    or_number: string;
    transaction_date: string;
    agency?: string;
    payor_last_name: string;
    payor_first_name: string;
    payor_middle_name?: string;
    payor_suffix?: string;
    collecting_officer: string;
    total_amount: string;
    fee_breakdown?: any;
    status: string;
}

interface Props {
    signatories?: any[];
    feeSettings: any;
    orRecords: OrRecord[];
    nextOrNumber: string;
}

export default function Index({ signatories = [], feeSettings, orRecords = [], nextOrNumber }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setIsImporting(true);
        router.post(route('or_records.import'), formData, {
            preserveScroll: true,
            onSuccess: (page: any) => {
                const flash = page.props.flash;
                if (flash && flash.success) {
                    toast.success(flash.success);
                } else {
                    toast.success("Records imported successfully!");
                }
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            onError: (errors) => {
                toast.error(errors.file || "Failed to import records.");
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            onFinish: () => setIsImporting(false)
        });
    };
    const user = usePage().props.auth.user as any;
    const [search, setSearch] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [sortAlphabetical, setSortAlphabetical] = useState("");
    const [isReqModalOpen, setIsReqModalOpen] = useState(false);
    const signatoryOptions = signatories.map(sig => sig.position ? `${sig.name} | ${sig.position}` : sig.name);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [viewingRecord, setViewingRecord] = useState<OrRecord | null>(null);
    const [editingRecord, setEditingRecord] = useState<OrRecord | null>(null);
    const [successModal, setSuccessModal] = useState<{ show: boolean, action: 'create' | 'update' | 'delete', data: any }>({
        show: false, action: 'create', data: null
    });
    
    const getFeePrices = () => {
        const prices: any = { ...DEFAULT_FEES };
        if (feeSettings) {
            Object.keys(DEFAULT_FEES).forEach((key) => {
                if (feeSettings[key] !== undefined && feeSettings[key] !== null) {
                    prices[key] = feeSettings[key];
                }
            });
        }
        return prices;
    };
    const FEE_PRICES = getFeePrices();

    const [orNumber, setOrNumber] = useState(nextOrNumber);
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split("T")[0]);
    const [agency, setAgency] = useState("LGU GERONA");
    const [collectingOfficer, setCollectingOfficer] = useState("MARY ANN S. MANALO");
    const [enableEditConfigs, setEnableEditConfigs] = useState(false);
    const [payorDetails, setPayorDetails] = useState({ lastName: "", firstName: "", middleName: "", suffix: "" });
    const [toggles, setToggles] = useState({
        reg_filing_fee: true, franchise_fee: true, mayors_permit: true, supervisor_fee: true,
        account_clearance: true, sticker_fee: true, id_driver_operator_owner: true,
        body_number_plate: true, penalty: true,
    });

    const [editOrNumber, setEditOrNumber] = useState("");
    const [editTransactionDate, setEditTransactionDate] = useState("");
    const [editAgency, setEditAgency] = useState("LGU GERONA");
    const [editCollectingOfficer, setEditCollectingOfficer] = useState("");
    const [editEnableConfigs, setEditEnableConfigs] = useState(false);
    const [editPayorDetails, setEditPayorDetails] = useState({ lastName: "", firstName: "", middleName: "", suffix: "" });
    const [editToggles, setEditToggles] = useState({ ...toggles });

    useEffect(() => {
        setOrNumber(nextOrNumber);
    }, [nextOrNumber]);

    useEffect(() => {
        if (editingRecord) {
            setEditOrNumber(editingRecord.or_number || "");
            setEditTransactionDate(editingRecord.transaction_date || "");
            setEditAgency(editingRecord.agency || "LGU GERONA");
            setEditCollectingOfficer(editingRecord.collecting_officer || "");
            setEditPayorDetails({
                lastName: editingRecord.payor_last_name || "",
                firstName: editingRecord.payor_first_name || "",
                middleName: editingRecord.payor_middle_name || "",
                suffix: editingRecord.payor_suffix || ""
            });
            setEditToggles(editingRecord.fee_breakdown || {
                reg_filing_fee: true, franchise_fee: true, mayors_permit: true, supervisor_fee: true,
                account_clearance: true, sticker_fee: true, id_driver_operator_owner: true,
                body_number_plate: true, penalty: true,
            });
            setEditEnableConfigs(false);
        }
    }, [editingRecord]);

    const openRequirements = () => setIsReqModalOpen(true);
    const proceedToPayment = () => { setIsReqModalOpen(false); setIsPaymentModalOpen(true); };

    const handleToggle = (key: keyof typeof toggles) => setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
    const calculateTotal = () => {
        let total = 0;
        (Object.keys(toggles) as Array<keyof typeof toggles>).forEach((key) => { if (toggles[key]) total += Number(FEE_PRICES[key] || 0); });
        return total;
    };
    const handleNameChange = (field: string, value: string) => {
        const cleanValue = value.toUpperCase().replace(/[^A-ZÑñ\s.-]/g, "");
        setPayorDetails({ ...payorDetails, [field]: cleanValue });
    };

    const handleEditToggle = (key: keyof typeof editToggles) => setEditToggles((prev) => ({ ...prev, [key]: !prev[key] }));
    const calculateEditTotal = () => {
        let total = 0;
        (Object.keys(editToggles) as Array<keyof typeof editToggles>).forEach((key) => { if (editToggles[key]) total += Number(FEE_PRICES[key] || 0); });
        return total;
    };
    const handleEditNameChange = (field: string, value: string) => {
        const cleanValue = value.toUpperCase().replace(/[^A-ZÑñ\s.-]/g, "");
        setEditPayorDetails({ ...editPayorDetails, [field]: cleanValue });
    };

    const isFormValid = orNumber?.trim() !== "" && payorDetails.lastName.trim() !== "" && payorDetails.firstName.trim() !== "" && collectingOfficer.trim() !== "";
    const isEditFormValid = editOrNumber?.trim() !== "" && editPayorDetails.lastName.trim() !== "" && editPayorDetails.firstName.trim() !== "" && editCollectingOfficer.trim() !== "";
    const hasChanges = editingRecord !== null && (
        editOrNumber !== (editingRecord.or_number || "") ||
        editTransactionDate !== (editingRecord.transaction_date || "") ||
        editAgency !== (editingRecord.agency || "LGU GERONA") ||
        editCollectingOfficer !== (editingRecord.collecting_officer || "") ||
        editPayorDetails.lastName !== (editingRecord.payor_last_name || "") ||
        editPayorDetails.firstName !== (editingRecord.payor_first_name || "") ||
        editPayorDetails.middleName !== (editingRecord.payor_middle_name || "") ||
        editPayorDetails.suffix !== (editingRecord.payor_suffix || "") ||
        JSON.stringify(editToggles) !== JSON.stringify(editingRecord.fee_breakdown || {
            reg_filing_fee: true, franchise_fee: true, mayors_permit: true, supervisor_fee: true,
            account_clearance: true, sticker_fee: true, id_driver_operator_owner: true,
            body_number_plate: true, penalty: true,
        })
    );

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const focusableElements = Array.from(document.querySelectorAll("input:not([disabled]), select:not([disabled]), button#btn-proceed:not([disabled])")) as HTMLElement[];
            const currentIndex = focusableElements.indexOf(e.currentTarget as HTMLElement);
            if (currentIndex > -1 && currentIndex < focusableElements.length - 1) focusableElements[currentIndex + 1].focus();
            else if (isFormValid) document.getElementById("btn-proceed")?.click();
        }
    };

    const onEditKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const focusableElements = Array.from(document.querySelectorAll("input:not([disabled]), select:not([disabled]), button#btn-update:not([disabled])")) as HTMLElement[];
            const currentIndex = focusableElements.indexOf(e.currentTarget as HTMLElement);
            if (currentIndex > -1 && currentIndex < focusableElements.length - 1) focusableElements[currentIndex + 1].focus();
            else if (isEditFormValid) document.getElementById("btn-update")?.click();
        }
    };

    const handleProceedToApplication = () => {
        if (!isFormValid) return;
        setIsProcessing(true);
        const data = {
            or_number: orNumber, transaction_date: transactionDate, agency: agency,
            payor_last_name: payorDetails.lastName, payor_first_name: payorDetails.firstName,
            payor_middle_name: payorDetails.middleName, payor_suffix: payorDetails.suffix,
            collecting_officer: collectingOfficer, total_amount: calculateTotal(), fee_breakdown: toggles
        };
        router.post(route('or_records.store'), data, {
            onSuccess: (page: any) => {
                setIsPaymentModalOpen(false);
                setIsProcessing(false);
                toast.success("Application saved successfully");
                const newId = page.props.orRecords[0]?.id;
                setSuccessModal({
                    show: true,
                    action: 'create',
                    data: {
                        id: newId,
                        or_number: orNumber,
                        payor_name: `${payorDetails.lastName}, ${payorDetails.firstName} ${payorDetails.middleName} ${payorDetails.suffix}`.replace(/\s+/g, ' ').trim()
                    }
                });
                setPayorDetails({ lastName: "", firstName: "", middleName: "", suffix: "" });
                setTransactionDate(new Date().toISOString().split("T")[0]);
            },
            onError: () => setIsProcessing(false)
        });
    };

    const handleUpdateRecord = () => {
        if (!isEditFormValid || !editingRecord) return;
        setIsProcessing(true);
        const data = {
            or_number: editOrNumber, transaction_date: editTransactionDate, agency: editAgency,
            payor_last_name: editPayorDetails.lastName, payor_first_name: editPayorDetails.firstName,
            payor_middle_name: editPayorDetails.middleName, payor_suffix: editPayorDetails.suffix,
            collecting_officer: editCollectingOfficer, total_amount: calculateEditTotal(), fee_breakdown: editToggles
        };
        router.put(route('or_records.update', editingRecord.id), data, {
            onSuccess: () => {
                setEditingRecord(null);
                setIsProcessing(false);
                toast.success("Record updated successfully");
                setSuccessModal({
                    show: true,
                    action: 'update',
                    data: {
                        id: editingRecord.id,
                        or_number: editOrNumber,
                        payor_name: `${editPayorDetails.lastName}, ${editPayorDetails.firstName} ${editPayorDetails.middleName} ${editPayorDetails.suffix}`.replace(/\s+/g, ' ').trim()
                    }
                });
            },
            onError: () => setIsProcessing(false)
        });
    };

    const confirmDelete = (deleteId: number) => setDeletingId(deleteId);

    const handleDelete = () => {
        if (deletingId) {
            const recordToDelete = orRecords.find(r => r.id === deletingId);
            setIsDeleting(true);
            router.delete(route("or_records.destroy", deletingId), {
                onFinish: () => {
                    setDeletingId(null);
                    setIsDeleting(false);
                    if (recordToDelete) {
                        toast.success("Record deleted successfully");
                    }
                },
            });
        }
    };

    const handleClearAll = () => {
        setIsClearing(true);
        router.delete(route("or_records.clear"), {
            onFinish: () => {
                setIsClearModalOpen(false);
                setIsClearing(false);
            },
        });
    };

    let filteredRecords = orRecords.filter(record => {
        const searchLower = search.toLowerCase();
        const matchesSearch = (record.or_number || "").toLowerCase().includes(searchLower) ||
            (record.payor_last_name || "").toLowerCase().includes(searchLower) ||
            (record.payor_first_name || "").toLowerCase().includes(searchLower);

        let matchesMonth = true, matchesYear = true, matchesLetter = true;

        if (month || year) {
            const recordDate = new Date(record.transaction_date);
            if (month) matchesMonth = (recordDate.getMonth() + 1).toString() === month;
            if (year) matchesYear = recordDate.getFullYear().toString() === year;
        }

        if (sortAlphabetical && sortAlphabetical !== 'all') {
            matchesLetter = (record.payor_last_name || "").toUpperCase().startsWith(sortAlphabetical);
        }

        return matchesSearch && matchesMonth && matchesYear && matchesLetter;
    });

    if (sortAlphabetical) {
        filteredRecords.sort((a, b) => {
            const nameA = `${a.payor_last_name || ''} ${a.payor_first_name || ''}`.toLowerCase();
            const nameB = `${b.payor_last_name || ''} ${b.payor_first_name || ''}`.toLowerCase();
            return nameA.localeCompare(nameB);
        });
    }

    let createPrefix = "";
    let createSequence = "";
    if (orNumber) {
        const parts = orNumber.split("-");
        if (parts.length > 1) {
            createPrefix = `${parts[0]}-`;
            createSequence = parts.slice(1).join("-");
        } else {
            createSequence = orNumber;
        }
    }

    let editPrefix = "";
    let editSequence = "";
    if (editOrNumber) {
        const parts = editOrNumber.split("-");
        if (parts.length > 1) {
            editPrefix = `${parts[0]}-`;
            editSequence = parts.slice(1).join("-");
        } else {
            editSequence = editOrNumber;
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title="OR Records" />

            <div className="py-6 sm:py-12 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                    <div className="flex flex-col md:flex-row gap-2 w-full xl:w-auto flex-wrap">
                        <div className="relative w-full md:w-auto">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                <Icon icon="iconamoon:search-bold" width="16" />
                            </div>
                            <input type="text" className="pl-9 w-full md:w-80 py-2 text-sm rounded border border-slate-300 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white placeholder:text-slate-400 font-semibold" placeholder="Search OR No. or Payor..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-wrap">
                            <select className="py-2 text-sm rounded border border-slate-300 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white placeholder:text-slate-400 font-semibold w-full sm:w-32 cursor-pointer" value={month} onChange={(e) => setMonth(e.target.value)}>
                                <option value="">Month</option>
                                {Array.from({ length: 12 }, (_, i) => (<option key={i} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>))}
                            </select>

                            <select className="py-2 text-sm rounded border border-slate-300 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white placeholder:text-slate-400 font-semibold w-full sm:w-28 cursor-pointer" value={year} onChange={(e) => setYear(e.target.value)}>
                                <option value="">Year</option>
                                {Array.from({ length: new Date().getFullYear() - 2000 + 2 }, (_, i) => new Date().getFullYear() + 1 - i).map((y) => (<option key={y} value={y}>{y}</option>))}
                            </select>

                            {/* ADDED ALPHABETICAL DROPDOWN HERE */}
                            <select
                                className="py-2 text-sm rounded border border-slate-300 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white placeholder:text-slate-400 font-semibold w-full sm:w-48 cursor-pointer"
                                value={sortAlphabetical}
                                onChange={(e) => setSortAlphabetical(e.target.value)}
                            >
                                <option value="">Default Sort</option>
                                <option value="all">All Letters (A - Z)</option>
                                {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(letter => (
                                    <option key={letter} value={letter}>Starts with {letter}</option>
                                ))}
                            </select>

                            <div className="flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-700 px-4 py-2 rounded border border-indigo-200 shadow-sm whitespace-nowrap h-full min-w-[3rem]">
                                <Icon icon="solar:documents-bold" width="16" className="text-indigo-500" />
                                <span className="font-extrabold text-sm leading-none">{filteredRecords.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
                        {user.role === 'admin' && (
                            <button
                                onClick={() => setIsClearModalOpen(true)}
                                type="button"
                                title="Clear All OR Records"
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded flex items-center justify-center gap-1.5 shadow-sm w-full sm:w-auto text-sm transition-all"
                            >
                                <Icon icon="solar:trash-bin-trash-bold" width="16" />{" "}
                                <span className="hidden sm:inline">Clear</span>
                            </button>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".csv"
                            onChange={handleImport}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isImporting}
                            title="Import from CSV"
                            className={`bg-orange-600 hover:bg-orange-700 text-white border font-bold py-2 px-3 text-sm rounded flex items-center justify-center gap-1.5 shadow-sm transition-all flex-1 sm:flex-none hover:cursor-pointer ${isImporting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <Icon icon="solar:import-bold" width="16" />
                            <span className="hidden sm:inline">{isImporting ? 'Importing...' : 'Import'}</span>
                        </button>

                        <a
                            href={route('or_records.export', {
                                _query: { search, month, year, sortAlphabetical }
                            })}
                            className="bg-green-600 hover:bg-green-700 text-white border font-bold py-2 px-3 text-sm rounded flex items-center justify-center gap-1.5 shadow-sm transition-all flex-1 sm:flex-none"
                        >
                            <Icon icon="solar:file-download-bold" width="16" /> <span className="hidden sm:inline">Export</span>
                        </a>
                        <button onClick={openRequirements} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 text-sm rounded flex items-center justify-center gap-1.5 shadow-sm transition-transform hover:scale-105 flex-1 sm:flex-none">
                            <Icon icon="solar:add-circle-bold" width="18" /> <span className="whitespace-nowrap">Add</span>
                        </button>
                    </div>
                </div>

                <div className="bg-slate-50 overflow-hidden shadow-sm sm:rounded border border-slate-200">
                    <table className="w-full text-sm text-center text-slate-600 border-collapse [&_th]:border [&_th]:border-slate-200 [&_td]:border [&_td]:border-slate-200">
                        <thead className="text-[11px] text-slate-100 uppercase bg-slate-700 tracking-wide">
                            <tr>
                                <th className="px-4 py-3">OR Number</th>
                                <th className="px-4 py-3 text-center">Payor Name</th>
                                <th className="px-4 py-3">Collecting Officer</th>
                                <th className="px-4 py-3">Total Amount</th>
                                <th className="px-4 py-3 min-w-55">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredRecords.length === 0 ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No OR records found. Click "Add" to start.</td></tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <tr key={record.id} className="bg-white even:bg-blue-50 hover:bg-slate-100 transition-colors border-b border-slate-200 last:border-0">
                                        <td className="px-4 py-3 font-bold text-slate-800">{record.or_number}</td>
                                        <td className="px-4 py-3 font-bold text-slate-800 text-left">{`${record.payor_last_name}, ${record.payor_first_name} ${record.payor_middle_name || ''} ${record.payor_suffix || ''}`.replace(/\s+/g, ' ').trim()}</td>
                                        <td className="px-4 py-3">{record.collecting_officer}</td>
                                        <td className="px-4 py-3 font-bold text-slate-700">₱{Number(record.total_amount).toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button onClick={() => setViewingRecord(record)} title="View Details" className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors shadow-sm">
                                                    <Icon icon="solar:eye-bold" width="16" />
                                                </button>
                                                <button
                                                    onClick={() => window.open(route('or_records.print', record.id), '_blank')}
                                                    title="Print OR"
                                                    className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded border border-green-200 transition-colors shadow-sm"
                                                >
                                                    <Icon icon="solar:printer-bold" width="16" />
                                                </button>

                                                <button onClick={() => setEditingRecord(record)} title="Edit Record" className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors shadow-sm">
                                                    <Icon icon="solar:pen-new-square-bold" width="16" />
                                                </button>
                                                {user?.role === "admin" && (
                                                    <button onClick={() => confirmDelete(record.id)} title="Delete Record" className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors shadow-sm">
                                                        <Icon icon="solar:trash-bin-trash-bold" width="16" />
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
            </div>

            <Modal show={isReqModalOpen} onClose={() => setIsReqModalOpen(false)} maxWidth="md">
                <div className="bg-slate-50 rounded-none sm:rounded-lg h-full sm:h-auto max-h-[90vh] flex flex-col overflow-hidden">
                    <div className="bg-slate-700 px-5 py-3 rounded-none sm:rounded-t-lg border-b border-slate-800 flex justify-between items-center shrink-0">
                        <h3 className="text-white font-bold text-base flex items-center gap-2">
                            <Icon icon="solar:clipboard-list-bold" width="20" /> Requirements for MTOP
                        </h3>
                        <button onClick={() => setIsReqModalOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1">
                            <Icon icon="solar:close-circle-bold" width="24" />
                        </button>
                    </div>
                    <div className="p-5 bg-slate-50 text-slate-700 flex-1 overflow-y-auto">
                        <ul className="space-y-3">
                            {["Community Tax Certificate", "TODA Certificate", "Barangay Clearance", "Police Clearance", "OR / CR of the Motorcycle", "Photocopy of Driver’s License", "One (1) Driver Photo (1.5 × 1.5 inches)"].map((req, idx) => (
                                <li key={idx} className="flex items-center gap-2 font-medium text-sm"><Icon icon="solar:check-circle-bold" className="text-green-500" width="20" /> {req}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end items-center gap-2 pt-5 border-t border-slate-200 mt-2 px-5 pb-5">
                        <button onClick={() => setIsReqModalOpen(false)} className="w-full sm:w-auto px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300 font-bold rounded text-sm shadow-sm transition-colors text-center">Cancel</button>
                        <button onClick={proceedToPayment} className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 border border-transparent rounded font-bold text-sm text-white shadow-sm flex justify-center items-center gap-1.5 transition-colors">Proceed</button>
                    </div>
                </div>
            </Modal>

            <Modal show={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} maxWidth="5xl">
                <div className="bg-slate-50 rounded-none sm:rounded-lg h-full sm:h-auto max-h-[90vh] flex flex-col overflow-hidden">
                    <div className="bg-slate-700 px-5 py-3 rounded-none sm:rounded-t-lg border-b border-slate-800 flex justify-between items-center shrink-0">
                        <h3 className="text-white font-bold text-base flex items-center gap-2">
                            <Icon icon="solar:wallet-bold" width="20" /> Application Payment Form
                        </h3>
                        <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1">
                            <Icon icon="solar:close-circle-bold" width="24" />
                        </button>
                    </div>
                    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                        <div className="p-5 bg-slate-50 flex-1 overflow-y-auto space-y-4">
                            <div className="space-y-2 bg-white p-4 rounded border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <h3 className="font-bold text-xs uppercase tracking-wide text-slate-700 flex items-center gap-2">
                                        <Icon icon="solar:pen-new-square-bold" width="16" className="text-blue-800" />
                                        Enable <span className="font-extrabold text-blue-800">Custom Edits</span> on Details?
                                    </h3>
                                    <button type="button" onClick={() => setEnableEditConfigs(!enableEditConfigs)} className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${enableEditConfigs ? "bg-blue-800" : "bg-slate-500 hover:bg-slate-600"}`}>
                                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enableEditConfigs ? "translate-x-4" : "translate-x-0"}`} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-3 gap-y-1">
                                    <div className={`sm:col-span-6 lg:col-span-6 transition-all ${!enableEditConfigs ? "opacity-50 saturate-0 pointer-events-none" : ""}`}>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                            OR Number <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative flex items-stretch border border-slate-300 rounded shadow-sm bg-white overflow-hidden focus-within:ring-1 focus-within:ring-red-500 focus-within:border-red-500 w-full">
                                            {createPrefix && (
                                                <div className="px-3 py-2 bg-slate-100 text-slate-600 font-medium border-r border-slate-300 flex items-center justify-center cursor-not-allowed select-none text-sm shrink-0">
                                                    <Icon icon="solar:folder-with-files-bold" className="mr-1.5 text-slate-500" width="16" />
                                                    {createPrefix}
                                                </div>
                                            )}
                                            <input
                                                type="text"
                                                value={createSequence}
                                                disabled={!enableEditConfigs}
                                                onChange={(e) => {
                                                    let val = e.target.value.replace(/[^0-9]/g, "");
                                                    if (createPrefix && val.length > 4) val = val.substring(0, 4);
                                                    setOrNumber(`${createPrefix}${val}`);
                                                }}
                                                onKeyDown={onKeyDown}
                                                placeholder="0001"
                                                className="flex-1 block w-full border-none focus:ring-0 text-sm px-3 py-2 font-bold text-indigo-700 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={`sm:col-span-6 lg:col-span-6 transition-all ${!enableEditConfigs ? "opacity-50 saturate-0 pointer-events-none" : ""}`}>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Date <span className="text-red-500">*</span></label>
                                        <input type="date" value={transactionDate} disabled={!enableEditConfigs} onChange={(e) => setTransactionDate(e.target.value)} onKeyDown={onKeyDown} required className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 disabled:bg-slate-100 disabled:text-slate-500" />
                                    </div>

                                    <div className={`sm:col-span-6 lg:col-span-6 transition-all ${!enableEditConfigs ? "opacity-50 saturate-0 pointer-events-none" : ""}`}>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Agency</label>
                                        <input type="text" value={agency} disabled={!enableEditConfigs} onChange={(e) => setAgency(e.target.value)} onKeyDown={onKeyDown} className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 disabled:bg-slate-100 disabled:text-slate-500" />
                                    </div>

                                    <div className={`sm:col-span-6 lg:col-span-6 transition-all ${!enableEditConfigs ? "opacity-50 saturate-0 pointer-events-none" : ""}`}>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Collecting Officer <span className="text-red-500">*</span></label>
                                        <SignatorySelect label="" value={collectingOfficer} onChange={(val) => setCollectingOfficer(val)} options={signatoryOptions} required={true} disabled={!enableEditConfigs} onKeyDown={onKeyDown} className="[&>label]:hidden [&_input]:w-full [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:font-semibold [&_input]:bg-white [&_input]:border [&_input]:border-slate-300 [&_input]:rounded [&_input]:shadow-sm [&_input]:focus:border-red-500 [&_input]:focus:ring-1 [&_input]:focus:ring-red-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 pt-1">
                                <div className="flex items-center gap-2 text-blue-800 border-b border-blue-200 pb-1.5">
                                    <h3 className="font-extrabold text-sm uppercase tracking-wide">Payor Information</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                    <div className="sm:col-span-12 md:col-span-4">
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Last Name <span className="text-red-500">*</span></label>
                                        <input type="text" value={payorDetails.lastName} onChange={(e) => handleNameChange("lastName", e.target.value)} onKeyDown={onKeyDown} placeholder="DEQUIROS" required className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500" />
                                    </div>
                                    <div className="sm:col-span-12 md:col-span-4">
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">First Name <span className="text-red-500">*</span></label>
                                        <input type="text" value={payorDetails.firstName} onChange={(e) => handleNameChange("firstName", e.target.value)} onKeyDown={onKeyDown} placeholder="ALLEN ICEE" required className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500" />
                                    </div>
                                    <div className="sm:col-span-6 md:col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">M.I.</label>
                                        <input type="text" value={payorDetails.middleName} onChange={(e) => handleNameChange("middleName", e.target.value.slice(0, 1))} onKeyDown={onKeyDown} placeholder="A" className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 text-center" />
                                    </div>
                                    <div className="sm:col-span-6 md:col-span-2">
                                        <SuffixSelect value={payorDetails.suffix} onChange={(val) => setPayorDetails({ ...payorDetails, suffix: val })} onKeyDown={onKeyDown} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 pt-1">
                                <div className="flex items-center gap-2 text-blue-800 border-b border-blue-200 pb-1.5">
                                    <h3 className="font-extrabold text-sm uppercase tracking-wide">Required Fees</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                                    {Object.keys(toggles).map((feeKey) => (
                                        <div key={feeKey} className="flex flex-col bg-white p-2 border border-slate-200 rounded shadow-sm hover:border-blue-300 transition-colors">
                                            <div className="flex justify-between items-center w-full mb-1.5 gap-1">
                                                <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-tight leading-tight truncate">{FEE_LABELS[feeKey as keyof typeof FEE_LABELS]}</span>
                                                {feeKey === 'id_driver_operator_owner' && (
                                                    <div title="Driver/Operator/Owner I.D." className="shrink-0 flex items-center">
                                                        <Icon icon="solar:info-circle-bold" className="text-blue-500 cursor-help" width="14" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[11px] text-slate-500 font-bold">₱{Number(FEE_PRICES[feeKey] || 0).toFixed(2)}</span>
                                                <button type="button" onClick={() => handleToggle(feeKey as keyof typeof toggles)} className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${toggles[feeKey as keyof typeof toggles] ? "bg-blue-800" : "bg-slate-300"}`}>
                                                    <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${toggles[feeKey as keyof typeof toggles] ? "translate-x-3" : "translate-x-0"}`} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-5 bg-white border-l border-slate-200 w-full lg:w-72 flex flex-col shrink-0 overflow-y-auto">
                            <div className="flex items-center justify-center gap-1.5 text-slate-800 border-b border-slate-300 pb-2 mb-3">
                                <Icon icon="solar:document-text-bold" width="18" className="text-blue-800" />
                                <h4 className="text-sm font-extrabold uppercase tracking-wide">Live Preview</h4>
                            </div>
                            <div className="space-y-3 flex-1">
                                <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5 text-xs text-slate-700">
                                    <p className="flex justify-between"><strong className="text-slate-900">OR No:</strong> <span className="font-bold text-indigo-700">{orNumber}</span></p>
                                    <p className="flex justify-between"><strong className="text-slate-900">Date:</strong> <span>{transactionDate}</span></p>
                                    <p className="flex justify-between"><strong className="text-slate-900">Agency:</strong> <span>{agency}</span></p>
                                    <p className="flex justify-between"><strong className="text-slate-900">Payor:</strong> <span className="font-bold text-blue-800 truncate pl-2">{`${payorDetails.lastName}, ${payorDetails.firstName} ${payorDetails.middleName} ${payorDetails.suffix}`.replace(/\s+/g, ' ').trim() || "-"}</span></p>
                                    <p className="flex justify-between"><strong className="text-slate-900">Officer:</strong> <span className="uppercase truncate pl-2">{collectingOfficer || "-"}</span></p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                    <h5 className="font-bold text-slate-900 mb-2 uppercase tracking-wide text-[10px] border-b pb-1.5">Fee Breakdown:</h5>
                                    <ul className="space-y-1.5 text-xs">
                                        {Object.keys(toggles).map((feeKey) => toggles[feeKey as keyof typeof toggles] && (
                                            <li key={feeKey} className="flex justify-between text-slate-600">
                                                <span className="uppercase text-[10px] font-medium truncate pr-2 flex items-center gap-1">
                                                    {FEE_LABELS[feeKey as keyof typeof FEE_LABELS]}
                                                </span>
                                                <span className="font-bold shrink-0">₱{Number(FEE_PRICES[feeKey] || 0).toFixed(2)}</span>
                                            </li>
                                        ))}
                                        {calculateTotal() === 0 && <li className="text-center text-slate-400 italic py-1 text-[10px]">No fees selected</li>}
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-4 bg-blue-800 text-white p-3 rounded shadow-sm">
                                <div className="flex justify-between items-center text-base font-extrabold tracking-wide">
                                    <span>TOTAL:</span>
                                    <span>₱{calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end items-center gap-2 pt-5 border-t border-slate-200 px-5 pb-5 shrink-0 bg-slate-50">
                        <button onClick={() => setIsPaymentModalOpen(false)} className="w-full sm:w-auto px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300 font-bold rounded text-sm shadow-sm transition-colors text-center">Cancel</button>
                        <button id="btn-proceed" onClick={handleProceedToApplication} disabled={!isFormValid || isProcessing} className={`w-full sm:w-auto px-4 py-2 font-bold text-sm text-white rounded shadow-sm flex items-center justify-center gap-1.5 transition-colors ${isFormValid ? 'bg-blue-600 hover:bg-blue-700 border border-transparent' : 'bg-slate-400 cursor-not-allowed border border-transparent'}`}>
                            <Icon icon="solar:diskette-bold" width="16" /> {isProcessing ? "Saving..." : "Save Record"}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal show={editingRecord !== null} onClose={() => setEditingRecord(null)} maxWidth="6xl">
                <div className="bg-slate-50 rounded-none sm:rounded-lg h-full sm:h-auto max-h-[90vh] flex flex-col overflow-hidden">
                    <div className="bg-slate-700 px-5 py-3 rounded-none sm:rounded-t-lg border-b border-slate-800 flex justify-between items-center shrink-0">
                        <h3 className="text-white font-bold text-base flex items-center gap-2">
                            <Icon icon="solar:pen-new-square-bold" width="20" /> Edit OR Record Details
                        </h3>
                        <button onClick={() => setEditingRecord(null)} className="text-slate-400 hover:text-white transition-colors p-1">
                            <Icon icon="solar:close-circle-bold" width="24" />
                        </button>
                    </div>
                    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                        <div className="p-5 bg-slate-50 flex-1 overflow-y-auto space-y-4">
                            <div className="space-y-2 bg-white p-4 rounded border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <h3 className="font-bold text-xs uppercase tracking-wide text-slate-700 flex items-center gap-2">
                                        <Icon icon="solar:danger-circle-bold" width="16" className="text-blue-800" />
                                        Override Settings Enabled by Default for Editing
                                    </h3>
                                    <button type="button" onClick={() => setEditEnableConfigs(!editEnableConfigs)} className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${!editEnableConfigs ? "bg-blue-800" : "bg-slate-500 hover:bg-slate-600"}`}>
                                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${!editEnableConfigs ? "translate-x-4" : "translate-x-0"}`} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-3 gap-y-1">
                                    <div className={`sm:col-span-12 md:col-span-6 transition-all ${editEnableConfigs ? "opacity-50 saturate-0 pointer-events-none" : ""}`}>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                            OR Number <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative flex items-stretch border border-slate-300 rounded shadow-sm bg-white overflow-hidden focus-within:ring-1 focus-within:ring-red-500 focus-within:border-red-500 w-full">
                                            {editPrefix && (
                                                <div className="px-3 py-2 bg-slate-100 text-slate-600 font-medium border-r border-slate-300 flex items-center justify-center cursor-not-allowed select-none text-sm shrink-0">
                                                    <Icon icon="solar:folder-with-files-bold" className="mr-1.5 text-slate-500" width="16" />
                                                    {editPrefix}
                                                </div>
                                            )}
                                            <input
                                                type="text"
                                                value={editSequence}
                                                disabled={editEnableConfigs}
                                                onChange={(e) => {
                                                    let val = e.target.value.replace(/[^0-9]/g, "");
                                                    if (editPrefix && val.length > 4) val = val.substring(0, 4);
                                                    setEditOrNumber(`${editPrefix}${val}`);
                                                }}
                                                onKeyDown={onEditKeyDown}
                                                placeholder="0001"
                                                className="flex-1 block w-full border-none focus:ring-0 text-sm px-3 py-2 font-bold text-indigo-700 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className={`sm:col-span-12 md:col-span-6 transition-all ${editEnableConfigs ? "opacity-50 saturate-0 pointer-events-none" : ""}`}>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Transaction Date <span className="text-red-500">*</span></label>
                                        <input type="date" value={editTransactionDate} disabled={editEnableConfigs} onChange={(e) => setEditTransactionDate(e.target.value)} onKeyDown={onEditKeyDown} required className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 disabled:bg-slate-100 disabled:text-slate-500" />
                                    </div>
                                    <div className={`sm:col-span-12 md:col-span-4 transition-all ${editEnableConfigs ? "opacity-50 saturate-0 pointer-events-none" : ""}`}>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Agency</label>
                                        <input type="text" value={editAgency} disabled={editEnableConfigs} onChange={(e) => setEditAgency(e.target.value)} onKeyDown={onEditKeyDown} className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 disabled:bg-slate-100 disabled:text-slate-500" />
                                    </div>
                                    <div className={`sm:col-span-12 md:col-span-8 transition-all ${editEnableConfigs ? "opacity-50 saturate-0 pointer-events-none" : ""}`}>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Collecting Officer <span className="text-red-500">*</span></label>
                                        <SignatorySelect label="" value={editCollectingOfficer} onChange={(val) => setEditCollectingOfficer(val)} options={signatoryOptions} required={true} disabled={editEnableConfigs} onKeyDown={onEditKeyDown} className="[&>label]:hidden [&_input]:w-full [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:font-semibold [&_input]:bg-white [&_input]:border [&_input]:border-slate-300 [&_input]:rounded [&_input]:shadow-sm [&_input]:focus:border-red-500 [&_input]:focus:ring-1 [&_input]:focus:ring-red-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 pt-1">
                                <div className="flex items-center gap-2 text-blue-800 border-b border-blue-200 pb-1.5">
                                    <h3 className="font-extrabold text-sm uppercase tracking-wide">Payor Information</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                    <div className="sm:col-span-12 md:col-span-4">
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Last Name <span className="text-red-500">*</span></label>
                                        <input type="text" value={editPayorDetails.lastName} onChange={(e) => handleEditNameChange("lastName", e.target.value)} onKeyDown={onEditKeyDown} placeholder="DEQUIROS" required className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500" />
                                    </div>
                                    <div className="sm:col-span-12 md:col-span-4">
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">First Name <span className="text-red-500">*</span></label>
                                        <input type="text" value={editPayorDetails.firstName} onChange={(e) => handleEditNameChange("firstName", e.target.value)} onKeyDown={onEditKeyDown} placeholder="ALLEN ICEE" required className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500" />
                                    </div>
                                    <div className="sm:col-span-6 md:col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">M.I.</label>
                                        <input type="text" value={editPayorDetails.middleName} onChange={(e) => handleEditNameChange("middleName", e.target.value.slice(0, 1))} onKeyDown={onEditKeyDown} placeholder="A" className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 text-center" />
                                    </div>
                                    <div className="sm:col-span-6 md:col-span-2">
                                        <SuffixSelect value={editPayorDetails.suffix} onChange={(val) => setEditPayorDetails({ ...editPayorDetails, suffix: val })} onKeyDown={onEditKeyDown} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 pt-1">
                                <div className="flex items-center gap-2 text-blue-800 border-b border-blue-200 pb-1.5">
                                    <h3 className="font-extrabold text-sm uppercase tracking-wide">Required Fees</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                                    {Object.keys(editToggles).map((feeKey) => (
                                        <div key={feeKey} className="flex flex-col bg-white p-2 border border-slate-200 rounded shadow-sm hover:border-blue-300 transition-colors">
                                            <div className="flex justify-between items-center w-full mb-1.5 gap-1">
                                                <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-tight leading-tight truncate">{FEE_LABELS[feeKey as keyof typeof FEE_LABELS]}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[11px] text-slate-500 font-bold">₱{Number(FEE_PRICES[feeKey] || 0).toFixed(2)}</span>
                                                <button type="button" onClick={() => handleEditToggle(feeKey as keyof typeof editToggles)} className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${editToggles[feeKey as keyof typeof editToggles] ? "bg-blue-800" : "bg-slate-300"}`}>
                                                    <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${editToggles[feeKey as keyof typeof editToggles] ? "translate-x-3" : "translate-x-0"}`} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-5 bg-white border-l border-slate-200 w-full lg:w-[35%] flex flex-col shrink-0 overflow-y-auto">
                            <div className="flex items-center justify-center gap-1.5 text-slate-800 border-b border-slate-300 pb-2 mb-3">
                                <Icon icon="solar:document-text-bold" width="18" className="text-blue-800" />
                                <h4 className="text-sm font-extrabold uppercase tracking-wide">Live Preview</h4>
                            </div>
                            <div className="space-y-3 flex-1">
                                <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5 text-xs text-slate-700">
                                    <p className="flex justify-between"><strong className="text-slate-900">OR No:</strong> <span className="font-bold text-indigo-700">{editOrNumber}</span></p>
                                    <p className="flex justify-between"><strong className="text-slate-900">Date:</strong> <span>{editTransactionDate}</span></p>
                                    <p className="flex justify-between"><strong className="text-slate-900">Agency:</strong> <span>{editAgency}</span></p>
                                    <p className="flex justify-between"><strong className="text-slate-900">Payor:</strong> <span className="font-bold text-blue-800 truncate pl-2">{`${editPayorDetails.lastName}, ${editPayorDetails.firstName} ${editPayorDetails.middleName} ${editPayorDetails.suffix}`.replace(/\s+/g, ' ').trim() || "-"}</span></p>
                                    <p className="flex justify-between"><strong className="text-slate-900">Officer:</strong> <span className="uppercase truncate pl-2">{editCollectingOfficer || "-"}</span></p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                    <h5 className="font-bold text-slate-900 mb-2 uppercase tracking-wide text-[10px] border-b pb-1.5">Fee Breakdown:</h5>
                                    <ul className="space-y-1.5 text-xs">
                                        {Object.keys(editToggles).map((feeKey) => editToggles[feeKey as keyof typeof editToggles] && (
                                            <li key={feeKey} className="flex justify-between text-slate-600">
                                                <span className="uppercase text-[10px] font-medium truncate pr-2 flex items-center gap-1">
                                                    {FEE_LABELS[feeKey as keyof typeof FEE_LABELS]}
                                                </span>
                                                <span className="font-bold shrink-0">₱{Number(FEE_PRICES[feeKey] || 0).toFixed(2)}</span>
                                            </li>
                                        ))}
                                        {calculateEditTotal() === 0 && <li className="text-center text-slate-400 italic py-1 text-[10px]">No fees selected</li>}
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-4 bg-blue-800 text-white p-3 rounded shadow-sm">
                                <div className="flex justify-between items-center text-base font-extrabold tracking-wide">
                                    <span>TOTAL:</span>
                                    <span>₱{calculateEditTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end items-center gap-2 pt-5 border-t border-slate-200 px-5 pb-5 shrink-0 bg-slate-50">
                        <button onClick={() => setEditingRecord(null)} className="w-full sm:w-auto px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300 font-bold rounded text-sm shadow-sm transition-colors text-center">Cancel</button>
                        <button id="btn-update" onClick={handleUpdateRecord} disabled={!isEditFormValid || !hasChanges || isProcessing} className={`w-full sm:w-auto px-4 py-2 font-bold text-sm text-white rounded shadow-sm flex items-center justify-center gap-1.5 transition-colors ${isEditFormValid && hasChanges ? 'bg-blue-600 hover:bg-blue-700 border border-transparent' : 'bg-slate-400 cursor-not-allowed border border-transparent'}`}>
                            <Icon icon="solar:diskette-bold" width="16" /> {isProcessing ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal show={viewingRecord !== null} onClose={() => setViewingRecord(null)} maxWidth="md">
                <div className="bg-slate-50 rounded-none sm:rounded-lg h-full sm:h-auto max-h-[90vh] flex flex-col overflow-hidden">
                    <div className="bg-slate-700 px-5 py-3 rounded-none sm:rounded-t-lg border-b border-slate-800 flex justify-between items-center shrink-0">
                        <h3 className="text-white font-bold text-base flex items-center gap-2">
                            <Icon icon="solar:document-text-bold" width="20" /> Record Details
                        </h3>
                        <button onClick={() => setViewingRecord(null)} className="text-slate-400 hover:text-white transition-colors p-1">
                            <Icon icon="solar:close-circle-bold" width="24" />
                        </button>
                    </div>
                    {viewingRecord && (
                        <div className="p-5 bg-slate-50 flex flex-col flex-1 overflow-y-auto">
                            <div className="space-y-4 flex-1">
                                <div className="bg-white p-4 rounded border border-slate-200 shadow-sm space-y-2 text-sm text-slate-700">
                                    <p className="flex justify-between"><strong className="text-slate-900">OR No:</strong> <span className="font-bold text-indigo-700">{viewingRecord.or_number}</span></p>
                                    <p className="flex justify-between"><strong className="text-slate-900">Date:</strong> <span>{viewingRecord.transaction_date}</span></p>
                                    <p className="flex justify-between"><strong className="text-slate-900">Agency:</strong> <span>{viewingRecord.agency || "LGU GERONA"}</span></p>
                                    <p className="flex justify-between"><strong className="text-slate-900">Payor:</strong> <span className="font-bold text-blue-800 truncate pl-2">{`${viewingRecord.payor_last_name}, ${viewingRecord.payor_first_name} ${viewingRecord.payor_middle_name || ''} ${viewingRecord.payor_suffix || ''}`.replace(/\s+/g, ' ').trim() || "-"}</span></p>
                                    <p className="flex justify-between"><strong className="text-slate-900">Officer:</strong> <span className="uppercase truncate pl-2">{viewingRecord.collecting_officer || "-"}</span></p>
                                </div>
                                <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
                                    <h5 className="font-bold text-slate-900 mb-3 uppercase tracking-wide text-[10px] border-b pb-2">Fee Breakdown:</h5>
                                    <ul className="space-y-2 text-sm">
                                        {viewingRecord.fee_breakdown && Object.keys(viewingRecord.fee_breakdown).map((feeKey) => viewingRecord.fee_breakdown[feeKey] && (
                                            <li key={feeKey} className="flex justify-between text-slate-600">
                                                <span className="uppercase text-[11px] font-medium truncate pr-2 flex items-center gap-1">
                                                    {FEE_LABELS[feeKey as keyof typeof FEE_LABELS]}
                                                </span>
                                                <span className="font-bold shrink-0">₱{Number(FEE_PRICES[feeKey] || 0).toFixed(2)}</span>
                                            </li>
                                        ))}
                                        {(!viewingRecord.fee_breakdown || Object.values(viewingRecord.fee_breakdown).filter(Boolean).length === 0) && (
                                            <li className="text-center text-slate-400 italic py-2 text-xs">No fees recorded</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-4 bg-blue-800 text-white p-4 rounded shadow-sm">
                                <div className="flex justify-between items-center text-base font-extrabold tracking-wide">
                                    <span>TOTAL:</span>
                                    <span>₱{Number(viewingRecord.total_amount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row justify-end items-center gap-2 pt-5 border-t border-slate-200 mt-2 px-5 pb-5 shrink-0 bg-slate-50">
                        <button onClick={() => setViewingRecord(null)} className="w-full sm:w-auto px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300 font-bold rounded text-sm shadow-sm transition-colors text-center">Close</button>
                        <button onClick={() => viewingRecord && window.open(route('or_records.print', viewingRecord.id), '_blank')} className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 border border-transparent rounded font-bold text-sm text-white shadow-sm flex justify-center items-center gap-1.5 transition-colors">
                            <Icon icon="solar:printer-bold" width="16" /> Print OR
                        </button>
                    </div>
                </div>
            </Modal>

            <ConfirmDeleteModal
                show={deletingId !== null}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDelete}
                processing={isDeleting}
            />

            <ClearRecordsModal
                show={isClearModalOpen}
                onClose={() => setIsClearModalOpen(false)}
                onConfirm={handleClearAll}
                processing={isClearing}
                title="Clear All OR Records"
                description="This will permanently delete all Official Receipt Records in the database."
            />

            <OrSuccessModal
                show={successModal.show}
                action={successModal.action}
                data={successModal.data}
                onClose={() => setSuccessModal({ ...successModal, show: false })}

                onEdit={() => {
                    setSuccessModal({ ...successModal, show: false });

                    if (successModal.data?.id) {
                        const recordToEdit = orRecords.find(r => r.id === successModal.data.id);
                        if (recordToEdit) {
                            setTimeout(() => setEditingRecord(recordToEdit), 150);
                        } else {
                            toast.error("Could not load the record for editing.");
                        }
                    }
                }}
            />

        </AuthenticatedLayout>
    );
}
