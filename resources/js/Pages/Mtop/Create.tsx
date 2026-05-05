//GeronaMTOP\resources\js\Pages\Mtop\Create.tsx
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import React, { FormEventHandler, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Modal from "@/Components/Modal";

import TransactionHeader from "./Partials/TransactionHeader";
import ApplicantForm from "./Partials/ApplicantForm";
import TricycleForm from "./Partials/TricycleForm";
import CedulaForm from "./Partials/CedulaForm";
import OfficialReceiptForm from "./Partials/OfficialReceiptForm";
import OfficialsForm from "./Partials/OfficialsForm";
import PermitPreview, {
    updateClientMonitor,
    formatExpiry,
} from "./Partials/PermitPreview";
import PrintSuccessModal from "./Partials/PrintSuccessModal";

const isValidDate = (dateString: string): boolean => {
    if (!dateString) return false;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
};

export default function Create({
    suggested_mt_number,
    suggested_body_number,
    punong_bayans,
    officials,
    activeEvents,
    holidays,
    occupied_body_numbers,
}: {
    suggested_mt_number: string;
    suggested_body_number: string;
    punong_bayans: string[];
    officials: string[];
    activeEvents: any;
    holidays: any[];
    occupied_body_numbers: number[];
}) {
    const { props } = usePage();
    const [step, setStep] = useState(1);
    const [showMobilePreview, setShowMobilePreview] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdRecord, setCreatedRecord] = useState<any>(null);
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const rawPayorName = searchParams?.get('payor_name') || '';

    let defaultLast = "";
    let defaultFirst = "";
    let defaultMiddle = "";
    let defaultSuffix = "";

    if (rawPayorName) {
        const cleanName = rawPayorName.trim().toUpperCase();
        const suffixList = ["JR", "JR.", "SR", "SR.", "I", "II", "III", "IV", "V", "VI"];

        if (cleanName.includes(',')) {
            const parts = cleanName.split(',');
            defaultLast = parts[0].trim();

            let remainingTokens = parts.slice(1).join(',').trim().split(/\s+/);

            remainingTokens = remainingTokens.filter(token => {
                if (suffixList.includes(token)) {
                    defaultSuffix = token.replace('.', '');
                    return false;
                }
                return true;
            });

            remainingTokens = remainingTokens.filter(token => {
                if (/^[A-Z]\.?$/.test(token)) {
                    defaultMiddle = token.replace('.', '');
                    return false;
                }
                return true;
            });

            defaultFirst = remainingTokens.join(' ');
        } else {
            let tokens = cleanName.split(/\s+/);

            tokens = tokens.filter(token => {
                if (suffixList.includes(token)) {
                    defaultSuffix = token.replace('.', '');
                    return false;
                }
                return true;
            });

            if (tokens.length > 1) {
                defaultLast = tokens.pop() || "";
            } else {
                defaultLast = tokens[0] || "";
                tokens = [];
            }

            tokens = tokens.filter(token => {
                if (/^[A-Z]\.?$/.test(token)) {
                    defaultMiddle = token.replace('.', '');
                    return false;
                }
                return true;
            });

            defaultFirst = tokens.join(' ');
        }
    }

    const { data, setData, post, processing, errors, reset } = useForm({
        last_name: defaultLast,
        first_name: defaultFirst,
        middle_name: defaultMiddle,
        suffix: defaultSuffix,
        has_driver: false,
        driver_first_name: "",
        driver_last_name: "",
        driver_middle_name: "",
        driver_suffix: "",
        driver_name: "",
        address: "",
        mt_number: suggested_mt_number || "",
        transaction_date: new Date().toISOString().split("T")[0],
        make_type: "",
        engine_motor_no: "",
        chassis_no: "",
        plate_no: "",
        body_number: suggested_body_number || "",
        cedula_number: "",
        cedula_date: "",
        or_number: "",
        or_date: "",
        punong_bayan:
            punong_bayans && punong_bayans.length > 0
                ? punong_bayans[0].split(" | ")[0]
                : "",
        authorized_official:
            officials && officials.length > 0
                ? officials[0].split(" | ")[0]
                : "",

        event_id:
            activeEvents && activeEvents.length > 0 ? activeEvents[0].id : null,
        is_free: activeEvents && activeEvents.length > 0 ? true : false,
        or_unlocked: false,
        show_auth_official: false,
        show_cedula: false,
        show_or: false,
        is_manual_validity: false,
        valid_until: "",
        show_paid_by: false,
        paid_by_last_name: "",
        paid_by_first_name: "",
        paid_by_middle_name: "",
        paid_by_suffix: "",
    });

    useEffect(() => {
        updateClientMonitor(data, activeEvents, holidays);
    }, [data, activeEvents, holidays]);

    const requiredFields = {
        1: [
            "mt_number",
            "last_name",
            "first_name",
            "address",
            "transaction_date",
        ],
        2: ["make_type", "engine_motor_no", "chassis_no"],
    };

    const isStepValid = (stepNum: number) => {
        if (stepNum === 1 || stepNum === 2) {
            const fields = requiredFields[stepNum];
            const basicCheck = fields.every(
                (field: string) =>
                    data[field as keyof typeof data] &&
                    String(data[field as keyof typeof data]).trim() !== "",
            );
            if (!basicCheck) return false;

            if (stepNum === 1) {
                if (!data.address.toUpperCase().includes("GERONA, TARLAC"))
                    return false;
                if (!isValidDate(data.transaction_date)) return false;
            }
        }

        if (stepNum === 3) {
            if (!data.punong_bayan || data.punong_bayan.trim() === "")
                return false;

            if (
                data.show_auth_official &&
                (!data.authorized_official ||
                    data.authorized_official.trim() === "")
            )
                return false;

            if (data.show_cedula) {
                if (!data.cedula_number || data.cedula_number.trim() === "")
                    return false;
                if (!isValidDate(data.cedula_date)) return false;
            }

            const requiresOr =
                (!data.is_free || data.or_unlocked) && data.show_or;
            if (requiresOr) {
                if (!data.or_number || data.or_number.trim() === "")
                    return false;
                if (!isValidDate(data.or_date)) return false;
            }
        }

        return true;
    };

    const isFormValid = isStepValid(1) && isStepValid(2) && isStepValid(3);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!isValidDate(data.transaction_date))
            return toast.error("Invalid Transaction Date.");

        if (data.show_cedula && !isValidDate(data.cedula_date))
            return toast.error("Invalid Cedula Date.");

        const requiresOr = (!data.is_free || data.or_unlocked) && data.show_or;
        if (requiresOr && !isValidDate(data.or_date))
            return toast.error("Invalid Official Receipt Date.");

        if (data.is_free && data.event_id) {
            const currentEvent =
                activeEvents?.find((ev: any) => ev.id == data.event_id) ||
                activeEvents?.[0];
            if (
                currentEvent &&
                currentEvent.start_date &&
                currentEvent.end_date
            ) {
                const tDate = new Date(data.transaction_date);
                tDate.setHours(0, 0, 0, 0);
                const eStart = new Date(currentEvent.start_date);
                eStart.setHours(0, 0, 0, 0);
                const eEnd = new Date(currentEvent.end_date);
                eEnd.setHours(23, 59, 59, 999);

                if (tDate < eStart || tDate > eEnd) {
                    const confirmProceed = window.confirm(
                        "⚠️ WARNING: DATE OUTSIDE PROMO PERIOD\n\n" +
                        "The transaction date you selected is outside the active dates of the Promo/Event.\n\n" +
                        "If you click OK, the system will save this record, but the FREE PROMO will be removed and it will be processed as a standard 3-Year validity permit.\n\n" +
                        "Do you want to proceed?",
                    );
                    if (!confirmProceed) return;
                }
            }
        }

        post(route("mtop.store"), {
            onSuccess: (page: any) => {
                const successData = page.props.flash?.success_data;
                if (successData) {
                    setCreatedRecord(successData);
                    setShowSuccessModal(true);
                    reset();
                    setStep(1);
                }
            },
            onError: (errs) => {
                if (errs.mt_number) {
                    setStep(1);
                    toast.error(errs.mt_number);
                } else if (errs.body_number) {
                    setStep(2);
                    toast.error(errs.body_number);
                } else {
                    toast.error(
                        "Failed to save record. Please check the red fields.",
                    );
                }
            },
        });
    };

    const handleNext = () => {
        if (step === 1) {
            if (!isValidDate(data.transaction_date))
                return toast.error("Invalid Transaction Date! Check calendar.");
            if (!data.address.toUpperCase().includes("GERONA, TARLAC"))
                return toast.error(
                    "Invalid Address! Please select a Barangay.",
                );
        }
        if (step === 3) {
            if (data.show_cedula && !isValidDate(data.cedula_date))
                return toast.error("Invalid Cedula Date! Check calendar.");

            const requiresOr =
                (!data.is_free || data.or_unlocked) && data.show_or;
            if (requiresOr && !isValidDate(data.or_date))
                return toast.error("Invalid OR Date! Check calendar.");
        }

        if (isStepValid(step)) {
            const nextStep = step + 1;
            setStep(nextStep);

            setTimeout(() => {
                const form = document.querySelector("form");
                if (form) {
                    const visibleInputs = Array.from(
                        form.querySelectorAll(
                            'input:not([disabled]):not([readonly]):not([type="hidden"]), select, textarea',
                        ),
                    ).filter(
                        (el) => (el as HTMLElement).offsetParent !== null,
                    ) as HTMLElement[];

                    if (visibleInputs.length > 0) visibleInputs[0].focus();
                }
            }, 100);
        } else {
            toast.error(
                "Please fill in all required fields before proceeding.",
            );
        }
    };

    const handleEnterKey = (
        e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (
                e.currentTarget.name === "address" ||
                e.currentTarget.closest('[name="address"]')
            ) {
                const currentVal = (e.currentTarget as HTMLInputElement).value;
                if (!currentVal.toUpperCase().includes("GERONA, TARLAC"))
                    return;
            }

            const form = e.currentTarget.form;
            if (!form) return;

            const allInputs = Array.from(
                form.querySelectorAll(
                    'input:not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled]), button[type="submit"]',
                ),
            ) as HTMLElement[];
            const visibleInputs = allInputs.filter(
                (el) => el.offsetParent !== null,
            );
            const index = visibleInputs.indexOf(e.currentTarget as any);

            if (index > -1) {
                if (index < visibleInputs.length - 1) {
                    visibleInputs[index + 1].focus();
                } else {
                    if (step < 3) handleNext();
                    else if (isFormValid)
                        submit(e as unknown as React.FormEvent);
                    else toast.error("Please fill in all required fields.");
                }
            }
        }
    };

    const expiryDisplay = () => {
        if (!data.transaction_date || !isValidDate(data.transaction_date)) {
            return "INVALID DATE";
        }

        return formatExpiry(data, activeEvents, holidays);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600 hidden sm:flex items-center justify-center shadow-inner">
                            <Icon
                                icon="solar:document-add-bold-duotone"
                                width="24"
                            />
                        </div>
                        <div>
                            <h2 className="font-extrabold text-lg sm:text-xl text-gray-800 tracking-tight flex items-center gap-2">
                                <Icon
                                    icon="solar:document-add-bold-duotone"
                                    width="20"
                                    className="sm:hidden text-blue-600"
                                />
                                New Application
                            </h2>
                            <p className="text-xs text-gray-500 font-medium mt-0.5 hidden sm:block">
                                Fill in the details to create a new MTOP record.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowMobilePreview(true)}
                        className="xl:hidden flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm"
                        title="Preview Permit"
                    >
                        <Icon icon="solar:eye-bold" width="18" />
                        <span className="hidden sm:inline">Preview Permit</span>
                    </button>
                </div>
            }
        >
            <Head title="New MTOP" />

            <div className="py-6 pb-24 sm:pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="grid grid-cols-1 items-start transition-all duration-500 ease-in-out xl:grid-cols-12 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-500 relative xl:col-span-7">
                            <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-lg">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className={`flex-1 py-4 text-xs sm:text-sm hover:cursor-pointer  font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-tl-lg ${step === 1
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
                                    className={`flex-1 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider hover:cursor-pointer flex items-center justify-center gap-2 ${step === 2
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
                                    className={`flex-1 py-4 text-xs sm:text-sm hover:cursor-pointer font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-tr-lg ${step === 3
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
                                        onKeyDown={handleEnterKey}
                                        activeEvents={activeEvents}
                                    />
                                    <ApplicantForm
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        onKeyDown={handleEnterKey}
                                    />
                                </div>

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
                                        onKeyDown={handleEnterKey}
                                        suggested_body_number={suggested_body_number}
                                        occupied_body_numbers={occupied_body_numbers}
                                    />
                                </div>

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
                                            onKeyDown={handleEnterKey}
                                        />
                                        <OfficialReceiptForm
                                            data={data}
                                            setData={setData}
                                            errors={errors}
                                            onKeyDown={handleEnterKey}
                                        />
                                    </div>
                                    <OfficialsForm
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        punong_bayans={punong_bayans}
                                        officials={officials}
                                        onKeyDown={handleEnterKey}
                                    />
                                </div>

                                <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
                                    <Link
                                        href={route("mtop.index")}
                                        className="text-gray-500 hover:text-red-600 text-sm font-bold hover:cursor-pointer "
                                    >
                                        Cancel
                                    </Link>
                                    <div className="flex gap-3">
                                        {step > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setStep(step - 1)
                                                }
                                                className="px-4 py-2 bg-gray-100 hover:cursor-pointer  text-gray-700 rounded-md font-bold hover:bg-gray-200 text-sm"
                                            >
                                                Back
                                            </button>
                                        )}
                                        {step < 3 ? (
                                            <PrimaryButton
                                                type="button"
                                                onClick={handleNext}
                                                className={
                                                    !isStepValid(step)
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : "hover:cursor-pointer"
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
                                                type="submit"
                                                className={`bg-green-600 hover:bg-green-700 hover:cursor-pointer  ${processing || !isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
                                                disabled={
                                                    processing || !isFormValid
                                                }
                                            >
                                                <Icon
                                                    icon="solar:diskette-bold"
                                                    className="mr-2"
                                                />{" "}
                                                Save Record
                                            </PrimaryButton>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="hidden xl:block xl:col-span-5 sticky top-6 z-20 animate-fade-in">
                            <div className="rounded-xl overflow-hidden shadow-md border border-gray-200">
                                <PermitPreview
                                    data={data}
                                    activeEvents={activeEvents}
                                    holidays={holidays}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PrintSuccessModal
                show={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                action="create"
                data={createdRecord}
            />

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
                        <PermitPreview
                            data={data}
                            showHeader={false}
                            activeEvents={activeEvents}
                            holidays={holidays}
                        />
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
