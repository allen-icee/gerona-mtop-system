import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { FormEventHandler, useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Modal from "@/Components/Modal";

// Partials
import TransactionHeader from "./Partials/TransactionHeader";
import ApplicantForm from "./Partials/ApplicantForm";
import TricycleForm from "./Partials/TricycleForm";
import CedulaForm from "./Partials/CedulaForm";
import OfficialReceiptForm from "./Partials/OfficialReceiptForm";
import OfficialsForm from "./Partials/OfficialsForm";
import PermitPreview from "./Partials/PermitPreview";
import PrintSuccessModal from "./Partials/PrintSuccessModal";

export default function Create({
    suggested_mt_number,
    punong_bayans,
    officials,
}: {
    suggested_mt_number: string;
    punong_bayans: string[];
    officials: string[];
}) {
    const { props } = usePage();
    const [step, setStep] = useState(1);
    const [showMobilePreview, setShowMobilePreview] = useState(false);

    // Success Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdRecord, setCreatedRecord] = useState<any>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        // Applicant
        last_name: "",
        first_name: "",
        middle_name: "",
        suffix: "",
        address: "",
        // Transaction
        mt_number: suggested_mt_number || "",
        transaction_date: new Date().toISOString().split("T")[0],
        // Unit
        make_type: "",
        engine_motor_no: "",
        chassis_no: "",
        plate_no: "",
        body_number: "",
        // Docs
        cedula_number: "",
        cedula_date: "",
        or_number: "",
        or_date: "",
        // Signatories
        punong_bayan: "",
        authorized_official: "",
    });

    // VALIDATION LOGIC
    const requiredFields = {
        1: ["last_name", "first_name", "address", "transaction_date"],
        2: [
            "body_number",
            "plate_no",
            "make_type",
            "engine_motor_no",
            "chassis_no",
        ],
        3: [
            "cedula_number",
            "cedula_date",
            "or_number",
            "or_date",
            "punong_bayan",
            "authorized_official",
        ],
    };

    const isStepValid = (stepNum: number) => {
        // @ts-ignore
        const fields = requiredFields[stepNum];
        // @ts-ignore
        return fields.every(
            (field: string) =>
                data[field as keyof typeof data] &&
                String(data[field as keyof typeof data]).trim() !== "",
        );
    };

    const handleNext = () => {
        if (isStepValid(step)) {
            setStep(step + 1);
        } else {
            toast.error(
                "Please fill in all required fields before proceeding.",
            );
        }
    };

    // Check if WHOLE form (Step 1 & 2) is valid for saving
    const isFormValid = isStepValid(1) && isStepValid(2) && isStepValid(3);

    const expiryDisplay = () => {
        if (!data.transaction_date) return "N/A";
        const date = new Date(data.transaction_date);
        const expiry = new Date(date.setFullYear(date.getFullYear() + 3));
        return expiry
            .toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
            .toUpperCase();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("mtop.store"), {
            onSuccess: (page: any) => {
                // Check if the backend returned the success_data flash session
                const successData = page.props.flash?.success_data;
                if (successData) {
                    setCreatedRecord(successData);
                    setShowSuccessModal(true);
                    reset(); // Clear form for next entry
                    setStep(1); // Reset to step 1
                }
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        New Application
                    </h2>
                    <button
                        type="button"
                        onClick={() => setShowMobilePreview(true)}
                        className="xl:hidden p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                        title="Preview Permit"
                    >
                        <Icon icon="solar:eye-bold" width="24" />
                    </button>
                </div>
            }
        >
            <Head title="New MTOP" />

            <div className="py-6 pb-24 sm:pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                        {/* --- LEFT COLUMN: FORM --- */}
                        <div className="xl:col-span-7 bg-white rounded-lg shadow-sm border border-gray-200 overflow-visible">
                            {/* 3-STEP NAVIGATION TABS */}
                            <div className="flex border-b border-gray-200 bg-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className={`flex-1 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${
                                        step === 1
                                            ? "bg-white text-blue-600 border-t-2 border-blue-600"
                                            : "text-gray-400 hover:text-gray-600"
                                    }`}
                                >
                                    <Icon
                                        icon="solar:user-id-bold"
                                        width="18"
                                    />{" "}
                                    Applicant
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isStepValid(1)) setStep(2);
                                        else
                                            toast.error(
                                                "Complete Step 1 first",
                                            );
                                    }}
                                    className={`flex-1 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${
                                        step === 2
                                            ? "bg-white text-blue-600 border-t-2 border-blue-600"
                                            : "text-gray-400 hover:text-gray-600"
                                    }`}
                                >
                                    <Icon icon="solar:wheel-bold" width="18" />{" "}
                                    Unit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isStepValid(1) && isStepValid(2))
                                            setStep(3);
                                        else
                                            toast.error(
                                                "Complete Step 1 & 2 first",
                                            );
                                    }}
                                    className={`flex-1 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${
                                        step === 3
                                            ? "bg-white text-blue-600 border-t-2 border-blue-600"
                                            : "text-gray-400 hover:text-gray-600"
                                    }`}
                                >
                                    <Icon
                                        icon="solar:file-check-bold"
                                        width="18"
                                    />{" "}
                                    Docs
                                </button>
                            </div>

                            <form
                                onSubmit={submit}
                                className="p-4 sm:p-6 space-y-6"
                            >
                                {/* STEP 1: TRANSACTION & APPLICANT */}
                                <div
                                    className={
                                        step === 1
                                            ? "block space-y-6"
                                            : "hidden"
                                    }
                                >
                                    <TransactionHeader
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        expiryDisplay={expiryDisplay}
                                    />
                                    <ApplicantForm
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                    />
                                </div>

                                {/* STEP 2: UNIT INFO */}
                                <div
                                    className={
                                        step === 2
                                            ? "block space-y-6"
                                            : "hidden"
                                    }
                                >
                                    <TricycleForm
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                    />
                                </div>

                                {/* STEP 3: DOCS & SIGNATORIES */}
                                <div
                                    className={
                                        step === 3
                                            ? "block space-y-6"
                                            : "hidden"
                                    }
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <CedulaForm
                                            data={data}
                                            setData={setData}
                                            errors={errors}
                                        />
                                        <OfficialReceiptForm
                                            data={data}
                                            setData={setData}
                                            errors={errors}
                                        />
                                    </div>
                                    <OfficialsForm
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        punong_bayans={punong_bayans}
                                        officials={officials}
                                    />
                                </div>

                                {/* FOOTER NAVIGATION */}
                                <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
                                    <Link
                                        href={route("mtop.index")}
                                        className="text-gray-500 hover:text-red-600 text-sm font-bold"
                                    >
                                        Cancel
                                    </Link>

                                    <div className="flex gap-3">
                                        {/* BACK BUTTON */}
                                        {step > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setStep(step - 1)
                                                }
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-bold hover:bg-gray-200 text-sm"
                                            >
                                                Back
                                            </button>
                                        )}

                                        {/* NEXT / SAVE BUTTON */}
                                        {step < 3 ? (
                                            <PrimaryButton
                                                type="button"
                                                onClick={handleNext}
                                                className={
                                                    !isStepValid(step)
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : ""
                                                }
                                            >
                                                Next Step{" "}
                                                <Icon
                                                    icon="solar:arrow-right-bold"
                                                    className="ml-2"
                                                />
                                            </PrimaryButton>
                                        ) : (
                                            <PrimaryButton
                                                className={`bg-green-600 hover:bg-green-700 ${
                                                    processing || !isFormValid
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : ""
                                                }`}
                                                disabled={
                                                    processing || !isFormValid
                                                }
                                            >
                                                <Icon
                                                    icon="solar:diskette-bold"
                                                    className="mr-2"
                                                />
                                                Save Record
                                            </PrimaryButton>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* --- RIGHT COLUMN: PREVIEW --- */}
                        <div className="hidden xl:block xl:col-span-5 sticky top-6">
                            <PermitPreview data={data} />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- PRINT SUCCESS MODAL (Replaces inline Success Modal) --- */}
            <PrintSuccessModal
                show={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                action="create"
                data={createdRecord}
            />

            {/* MOBILE PREVIEW MODAL */}
            <Modal
                show={showMobilePreview}
                onClose={() => setShowMobilePreview(false)}
                maxWidth="2xl"
            >
                <div className="flex flex-col h-dvh">
                    <div className="bg-gray-800 px-4 py-3 flex justify-between items-center shrink-0">
                        <span className="text-white font-bold uppercase flex items-center gap-2">
                            <Icon icon="solar:document-text-bold" /> Information
                            Preview
                        </span>
                        <button
                            onClick={() => setShowMobilePreview(false)}
                            className="text-white"
                        >
                            <Icon icon="solar:close-circle-bold" width="24" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto bg-gray-100">
                        <PermitPreview data={data} showHeader={false} />
                    </div>
                    <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                        <button
                            onClick={() => setShowMobilePreview(false)}
                            className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-lg"
                        >
                            Close Preview
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
