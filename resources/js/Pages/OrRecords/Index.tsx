import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import InputGroup from "@/Components/InputGroup";
import SuffixSelect from "@/Components/SuffixSelect";
import ToastListener from "@/Components/ToastListener";
import { Icon } from "@iconify/react";
import SignatorySelect from "@/Components/SignatorySelect";

// Labels mapped to exactly match DB columns
const FEE_LABELS = {
    reg_filing_fee: "REG./Filing Fee",
    franchise_fee: "Franchise Fee",
    mayors_permit: "Mayor's Permit",
    supervisor_fee: "Supervisor Fee",
    account_clearance: "Account Clearance",
    sticker_fee: "Sticker Fee",
    id_driver_operator_owner: "I.D.", // <--- Changed to just I.D.
    body_number_plate: "Body Number / Plate",
    penalty: "Penalty",
};

interface OrRecord {
    id: number;
    transaction_date: string;
    payor_last_name: string;
    payor_first_name: string;
    payor_middle_name?: string;
    payor_suffix?: string;
    collecting_officer: string;
    total_amount: string;
    status: string;
}

interface Props {
    signatories?: any[];
    feeSettings: any;
    orRecords: OrRecord[];
}

export default function Index({ signatories = [], feeSettings, orRecords = [] }: Props) {
    const [search, setSearch] = useState("");
    const [isReqModalOpen, setIsReqModalOpen] = useState(false);
    const signatoryOptions = signatories.map(sig => sig.position ? `${sig.name} | ${sig.position}` : sig.name);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Extracting just the prices directly from the DB settings
    const { id, created_at, updated_at, ...FEE_PRICES } = feeSettings || {};

    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split("T")[0]);
    const [agency, setAgency] = useState("LGU GERONA");
    const [collectingOfficer, setCollectingOfficer] = useState("MARY ANN S. MANALO");
    const [enableEditConfigs, setEnableEditConfigs] = useState(false);

    const [payorDetails, setPayorDetails] = useState({
        lastName: "",
        firstName: "",
        middleName: "",
        suffix: "",
    });

    const [toggles, setToggles] = useState({
        reg_filing_fee: true,
        franchise_fee: true,
        mayors_permit: true,
        supervisor_fee: true,
        account_clearance: true,
        sticker_fee: true,
        id_driver_operator_owner: true,
        body_number_plate: true,
        penalty: true,
    });

    const openRequirements = () => setIsReqModalOpen(true);
    const proceedToPayment = () => { setIsReqModalOpen(false); setIsPaymentModalOpen(true); };

    const handleToggle = (key: keyof typeof toggles) => {
        setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const calculateTotal = () => {
        let total = 0;
        (Object.keys(toggles) as Array<keyof typeof toggles>).forEach((key) => {
            if (toggles[key]) total += Number(FEE_PRICES[key] || 0);
        });
        return total;
    };

    const handleNameChange = (field: string, value: string) => {
        const cleanValue = value.toUpperCase().replace(/[^A-ZÑñ\s.-]/g, "");
        setPayorDetails({ ...payorDetails, [field]: cleanValue });
    };

    const isFormValid = payorDetails.lastName.trim() !== "" && payorDetails.firstName.trim() !== "" && collectingOfficer.trim() !== "";

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const focusableElements = Array.from(document.querySelectorAll("input:not([disabled]), select:not([disabled]), button#btn-proceed:not([disabled])")) as HTMLElement[];
            const currentIndex = focusableElements.indexOf(e.currentTarget as HTMLElement);
            if (currentIndex > -1 && currentIndex < focusableElements.length - 1) focusableElements[currentIndex + 1].focus();
            else if (isFormValid) document.getElementById("btn-proceed")?.click();
        }
    };

    // --- SAVE TO DATABASE ACTION ---
    const handleProceedToApplication = () => {
        if (!isFormValid) return;
        setIsProcessing(true);

        const data = {
            transaction_date: transactionDate,
            agency: agency,
            payor_last_name: payorDetails.lastName,
            payor_first_name: payorDetails.firstName,
            payor_middle_name: payorDetails.middleName,
            payor_suffix: payorDetails.suffix,
            collecting_officer: collectingOfficer,
            total_amount: calculateTotal(),
            fee_breakdown: toggles // Save which fees were activated
        };

        router.post(route('or_records.store'), data, {
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                setIsProcessing(false);

                // Clear the form after success
                setPayorDetails({ lastName: "", firstName: "", middleName: "", suffix: "" });
                setTransactionDate(new Date().toISOString().split("T")[0]);
            },
            onError: () => {
                setIsProcessing(false);
            }
        });
    };

    // Filter logic for the table search
    const filteredRecords = orRecords.filter(record =>
        record.payor_last_name.toLowerCase().includes(search.toLowerCase()) ||
        record.payor_first_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AuthenticatedLayout>
            <Head title="OR Records" />
            <ToastListener />

            <div className="py-6 sm:py-12 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                    <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                        <div className="relative w-full sm:w-64 md:w-80">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500">
                                <Icon icon="iconamoon:search-bold" width="20" />
                            </div>
                            <TextInput className="pl-12 w-full py-3 text-base shadow-sm" placeholder="Search OR records..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                        <button className="bg-green-600 hover:bg-green-700 text-white border font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all flex-1 sm:flex-none">
                            <Icon icon="solar:file-download-bold" width="22" /> <span className="hidden sm:inline">Export</span>
                        </button>
                        <button onClick={openRequirements} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 shadow-md transition-transform hover:scale-105 flex-1 sm:flex-none justify-center">
                            <Icon icon="solar:add-circle-bold" width="24" /> <span className="whitespace-nowrap">Add</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4">OR Date</th>
                                <th className="px-6 py-4">Payor Name</th>
                                <th className="px-6 py-4">Collecting Officer</th>
                                <th className="px-6 py-4 text-center">Total Amount</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRecords.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No OR records found. Click "Add" to start.</td></tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{record.transaction_date}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{`${record.payor_last_name}, ${record.payor_first_name} ${record.payor_middle_name || ''} ${record.payor_suffix || ''}`.trim()}</td>
                                        <td className="px-6 py-4">{record.collecting_officer}</td>
                                        <td className="px-6 py-4 text-center font-bold text-blue-700">₱{Number(record.total_amount).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full border ${record.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* REQUIREMENTS MODAL */}
            <Modal show={isReqModalOpen} onClose={() => setIsReqModalOpen(false)} maxWidth="md">
                <div className="bg-gray-800 px-6 py-4 flex justify-between items-center sm:rounded-t-lg">
                    <h3 className="text-white font-bold uppercase tracking-wider flex items-center gap-2">
                        <Icon icon="solar:clipboard-list-bold" width="24" /> Requirements for MTOP
                    </h3>
                </div>
                <div className="p-6 bg-gray-50 text-gray-700">
                    <ul className="space-y-3">
                        {["Community Tax Certificate", "TODA Certificate (issued by the TODA President)", "Barangay Clearance", "Police Clearance", "OR / CR of the Motorcycle", "Photocopy of Driver’s License", "One (1) Driver Photo (1.5 × 1.5 inches)"].map((req, idx) => (
                            <li key={idx} className="flex items-center gap-2 font-medium">
                                <Icon icon="solar:check-circle-bold" className="text-green-500" width="20" /> {req}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white border-t px-6 py-4 flex justify-end gap-3 sm:rounded-b-lg">
                    <SecondaryButton onClick={() => setIsReqModalOpen(false)}>Cancel</SecondaryButton>
                    <PrimaryButton onClick={proceedToPayment} className="bg-blue-600 hover:bg-blue-700">Proceed</PrimaryButton>
                </div>
            </Modal>

            {/* PAYMENT FORM MODAL - CHANGED WIDTH FROM maxWidth="5xl" to maxWidth="6xl" */}
            <Modal show={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} maxWidth="6xl">
                <div className="bg-gray-800 px-6 py-4 flex justify-between items-center sm:rounded-t-lg">
                    <h3 className="text-white font-bold uppercase tracking-wider flex items-center gap-2">
                        <Icon icon="solar:wallet-bold" width="24" /> Application Payment Form
                    </h3>
                    <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-400 hover:text-white transition-colors p-2">
                        <Icon icon="solar:close-circle-bold" width="28" />
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row h-full max-h-[80vh]">
                    <div className="p-6 bg-white flex-1 overflow-y-auto space-y-5">
                        <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                                <h3 className="font-bold text-sm uppercase tracking-wide text-gray-700 flex items-center gap-2">
                                    <Icon icon="solar:pen-new-square-bold" width="20" className="text-blue-800" />
                                    Enable <span className="font-extrabold text-blue-800">Custom Edits</span> on Details?
                                </h3>
                                <button type="button" onClick={() => setEnableEditConfigs(!enableEditConfigs)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${enableEditConfigs ? "bg-blue-800" : "bg-gray-500 hover:bg-gray-600"}`}>
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enableEditConfigs ? "translate-x-5" : "translate-x-0"}`} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                                <div className="sm:col-span-12 md:col-span-3">
                                    <InputGroup id="transactionDate" label="Transaction Date" type="date" value={transactionDate} disabled={!enableEditConfigs} onChange={(e) => setTransactionDate(e.target.value)} onKeyDown={onKeyDown} required className={`transition-all ${!enableEditConfigs ? "opacity-50 saturate-0 pointer-events-none" : ""}`} />
                                </div>
                                <div className="sm:col-span-12 md:col-span-3">
                                    <InputGroup id="agency" label="Agency" value={agency} disabled onChange={(e) => setAgency(e.target.value)} className="opacity-50 saturate-0 pointer-events-none" />
                                </div>
                                <div className="sm:col-span-12 md:col-span-6">
                                    <div className={`transition-all ${!enableEditConfigs ? "opacity-50 saturate-0 pointer-events-none" : ""}`}>
                                        <SignatorySelect
                                            label="Collecting Officer"
                                            value={collectingOfficer}
                                            onChange={(val) => setCollectingOfficer(val)}
                                            options={signatoryOptions}
                                            required={true}
                                            disabled={!enableEditConfigs}
                                            onKeyDown={onKeyDown}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-blue-800 border-b border-blue-300 pb-2">
                                <h3 className="font-extrabold text-base uppercase tracking-wide">Payor Information</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                <div className="sm:col-span-12 md:col-span-4"><InputGroup id="lastName" label="Last Name" value={payorDetails.lastName} onChange={(e) => handleNameChange("lastName", e.target.value)} onKeyDown={onKeyDown} icon="solar:user-bold" placeholder="DEQUIROS" required={true} /></div>
                                <div className="sm:col-span-12 md:col-span-4"><InputGroup id="firstName" label="First Name" value={payorDetails.firstName} onChange={(e) => handleNameChange("firstName", e.target.value)} onKeyDown={onKeyDown} placeholder="ALLEN ICEE" required={true} /></div>
                                <div className="sm:col-span-6 md:col-span-2"><InputGroup id="middleName" label="M.I." value={payorDetails.middleName} onChange={(e) => handleNameChange("middleName", e.target.value.slice(0, 1))} onKeyDown={onKeyDown} placeholder="A" /></div>
                                <div className="sm:col-span-6 md:col-span-2"><SuffixSelect value={payorDetails.suffix} onChange={(val) => setPayorDetails({ ...payorDetails, suffix: val })} onKeyDown={onKeyDown} /></div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-blue-800 border-b border-blue-300 pb-2">
                                <h3 className="font-extrabold text-base uppercase tracking-wide">Required Fees</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                                {Object.keys(toggles).map((feeKey) => (
                                    <div key={feeKey} className="flex flex-col bg-white p-2.5 border border-gray-200 rounded-md shadow-sm hover:border-blue-300 transition-colors">

                                        {/* New flex container pushes text to left and icon to the far right */}
                                        <div className="flex justify-between items-center w-full mb-2 gap-1">
                                            <span
                                                className="text-xs font-extrabold text-gray-800 uppercase tracking-tight leading-tight truncate"
                                            >
                                                {FEE_LABELS[feeKey as keyof typeof FEE_LABELS]}
                                            </span>
                                            {feeKey === 'id_driver_operator_owner' && (
                                                <div title="Driver/Operator/Owner I.D." className="shrink-0 flex items-center">
                                                    <Icon icon="solar:info-circle-bold" className="text-blue-500 cursor-help" width="18" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] text-gray-500 font-bold">₱{Number(FEE_PRICES[feeKey] || 0).toFixed(2)}</span>
                                            <button type="button" onClick={() => handleToggle(feeKey as keyof typeof toggles)} className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${toggles[feeKey as keyof typeof toggles] ? "bg-blue-800" : "bg-gray-300"}`}>
                                                <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${toggles[feeKey as keyof typeof toggles] ? "translate-x-3" : "translate-x-0"}`} />
                                            </button>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-l border-gray-200 w-full lg:w-[35%] flex flex-col shadow-inner shrink-0">
                        <div className="flex items-center justify-center gap-2 text-gray-800 border-b border-gray-300 pb-3 mb-4">
                            <Icon icon="solar:document-text-bold" width="24" className="text-blue-800" />
                            <h4 className="text-lg font-extrabold uppercase tracking-wide">Live Preview</h4>
                        </div>
                        <div className="space-y-4 flex-1">
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-2 text-sm text-gray-700">
                                <p className="flex justify-between"><strong className="text-gray-900">Date:</strong> <span>{transactionDate}</span></p>
                                <p className="flex justify-between"><strong className="text-gray-900">Agency:</strong> <span>{agency}</span></p>
                                <p className="flex justify-between"><strong className="text-gray-900">Payor:</strong> <span className="font-bold text-blue-800 truncate pl-2">{`${payorDetails.lastName}, ${payorDetails.firstName} ${payorDetails.middleName} ${payorDetails.suffix}`.trim() || "-"}</span></p>
                                <p className="flex justify-between"><strong className="text-gray-900">Officer:</strong> <span className="uppercase truncate pl-2">{collectingOfficer || "-"}</span></p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <h5 className="font-bold text-gray-900 mb-3 uppercase tracking-wide text-xs border-b pb-2">Fee Breakdown:</h5>
                                <ul className="space-y-2 text-sm">
                                    {Object.keys(toggles).map((feeKey) => (
                                        toggles[feeKey as keyof typeof toggles] && (
                                            <li key={feeKey} className="flex justify-between text-gray-600">
                                                <span
                                                    className="uppercase text-[11px] font-medium truncate pr-2 flex items-center gap-1"
                                                    title={feeKey === 'id_driver_operator_owner' ? 'Driver/Operator/Owner I.D.' : FEE_LABELS[feeKey as keyof typeof FEE_LABELS]}
                                                >
                                                    {FEE_LABELS[feeKey as keyof typeof FEE_LABELS]}
                                                    {feeKey === 'id_driver_operator_owner' && (
                                                        <Icon icon="solar:info-circle-bold" className="text-gray-400 cursor-help shrink-0" width="13" />
                                                    )}
                                                </span>
                                                <span className="font-bold shrink-0">₱{Number(FEE_PRICES[feeKey] || 0).toFixed(2)}</span>
                                            </li>
                                        )
                                    ))}
                                    {calculateTotal() === 0 && <li className="text-center text-gray-400 italic py-2 text-xs">No fees selected</li>}
                                </ul>
                            </div>
                        </div>
                        <div className="mt-4 bg-blue-800 text-white p-4 rounded-xl shadow-md">
                            <div className="flex justify-between items-center text-lg font-extrabold tracking-wide">
                                <span>TOTAL:</span>
                                <span>₱{calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between gap-4 sm:rounded-b-lg">
                    <PrimaryButton className="bg-indigo-600 hover:bg-indigo-700 shadow-md flex-1 sm:flex-none justify-center py-2.5">
                        <Icon icon="solar:printer-bold" className="mr-2" width="22" /> Print OR
                    </PrimaryButton>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <SecondaryButton onClick={() => setIsPaymentModalOpen(false)} className="justify-center py-2.5">Cancel</SecondaryButton>
                        <PrimaryButton id="btn-proceed" onClick={handleProceedToApplication} className={`shadow-md justify-center py-2.5 px-8 transition-colors ${isFormValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`} disabled={!isFormValid || isProcessing} title={!isFormValid ? "Please fill out the First Name, Last Name, and Collecting Officer to proceed" : ""}>
                            {isProcessing ? "Saving..." : "Proceed to Application"}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
