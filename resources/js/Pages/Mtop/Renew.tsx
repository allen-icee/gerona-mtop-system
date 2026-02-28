//GeronaMTOP\resources\js\Pages\Mtop\Renew.tsx
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

export default function Renew({
    application,
    punong_bayans,
    officials,
    activeEvents,
}: {
    application: any;
    punong_bayans: string[];
    officials: string[];
    activeEvents: any;
}) {
    const [step, setStep] = useState(1);
    const [showMobilePreview, setShowMobilePreview] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        last_name: application.last_name || "",
        first_name: application.first_name || "",
        middle_name: application.middle_name || "",
        suffix: application.suffix || "",
        address: application.address || "",
        mt_number: application.mt_number || "",
        transaction_date: new Date().toISOString().split("T")[0],
        make_type: application.make_type || "",
        engine_motor_no: application.engine_motor_no || "",
        chassis_no: application.chassis_no || "",
        plate_no: application.plate_no || "",
        body_number: application.body_number || "",
        cedula_number: "",
        cedula_date: "",
        or_number: "",
        or_date: "",
        punong_bayan: application.punong_bayan || "",
        authorized_official: application.authorized_official || "",
        event_id: null,
        is_free: false,
        or_unlocked: false,
    });

    // --- NEW: Live sync to casted screen ---
    useEffect(() => {
        updateClientMonitor(data, activeEvents);
    }, [data, activeEvents]);

    const requiredFields = {
        1: [
            "mt_number",
            "last_name",
            "first_name",
            "address",
            "transaction_date",
        ],
        2: ["plate_no", "make_type", "engine_motor_no", "chassis_no"],
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

        if (stepNum === 3) {
            if (!isValidDate(data.cedula_date)) return false;
            // Only require the OR date if it is NOT a free promo (or if they explicitly unlocked it)
            if (!data.is_free && !isValidDate(data.or_date)) return false;
            if (data.is_free && data.or_unlocked && !isValidDate(data.or_date))
                return false;
        }

        return true;
    };

    const isFormValid = isStepValid(1) && isStepValid(2) && isStepValid(3);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!isValidDate(data.transaction_date))
            return toast.error("Invalid Transaction Date.");
        if (!isValidDate(data.cedula_date))
            return toast.error("Invalid Cedula Date.");
        if (!isValidDate(data.or_date))
            return toast.error("Invalid Official Receipt Date.");

        post(route("mtop.store_renewal", application.id), {
            onError: (errs) => {
                if (errs.mt_number) {
                    setStep(1);
                    toast.error(errs.mt_number);
                } else if (errs.body_number) {
                    setStep(2);
                    toast.error(errs.body_number);
                } else {
                    const firstError = Object.values(errs)[0];
                    toast.error(
                        firstError ||
                            "Failed to process renewal. Check inputs.",
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
            if (!isValidDate(data.cedula_date))
                return toast.error("Invalid Cedula Date! Check calendar.");
            if (!isValidDate(data.or_date))
                return toast.error("Invalid OR Date! Check calendar.");
        }

        if (isStepValid(step)) {
            setStep(step + 1);
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

        // Uses the perfectly synced "Next Working Day" math from PermitPreview
        return formatExpiry(data, activeEvents);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600 hidden sm:flex items-center justify-center shadow-inner">
                            <Icon
                                icon="solar:refresh-circle-bold-duotone"
                                width="24"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="font-extrabold text-lg sm:text-xl text-gray-800 tracking-tight flex items-center gap-2">
                                    <Icon
                                        icon="solar:refresh-circle-bold-duotone"
                                        width="20"
                                        className="sm:hidden text-yellow-600"
                                    />
                                    Renew Application
                                </h2>
                                <span className="text-[10px] sm:text-xs font-black bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-md shadow-sm border border-yellow-200 tracking-wider">
                                    {application.mt_number}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 font-medium mt-0.5 hidden sm:block">
                                Process a new 3-year validity for this
                                franchise.
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
            <Head title={`Renew ${application.mt_number}`} />

            <div className="py-6 pb-24 sm:pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="grid grid-cols-1 items-start transition-all duration-500 ease-in-out xl:grid-cols-12 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-500 relative xl:col-span-7">
                            <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-lg">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className={`flex-1 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-tl-lg ${
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
                                    className={`flex-1 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-tr-lg ${
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

                                <div className="hidden sm:flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
                                    <Link
                                        href={route("mtop.index")}
                                        className="text-gray-500 hover:text-red-600 text-sm font-bold"
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
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-bold hover:bg-gray-200 text-sm"
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
                                                type="submit"
                                                className={`bg-yellow-600 hover:bg-yellow-700 text-white ${processing || !isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
                                                disabled={
                                                    processing || !isFormValid
                                                }
                                            >
                                                <Icon
                                                    icon="solar:diskette-bold"
                                                    className="mr-2"
                                                />{" "}
                                                Process Renewal
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
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:hidden z-40 flex justify-between items-center safe-area-pb">
                <Link
                    href={route("mtop.index")}
                    className="text-gray-500 font-bold text-sm"
                >
                    Cancel
                </Link>
                <div className="flex gap-2">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={() => setStep(step - 1)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm"
                        >
                            Back
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm flex items-center ${!isStepValid(step) ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                            Next{" "}
                            <Icon
                                icon="solar:arrow-right-bold"
                                className="ml-1"
                            />
                        </button>
                    ) : (
                        <button
                            onClick={submit}
                            disabled={processing || !isFormValid}
                            className={`px-6 py-2 bg-yellow-600 text-white rounded-lg font-bold text-sm flex items-center ${processing || !isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            <Icon icon="solar:diskette-bold" className="mr-1" />{" "}
                            Renew
                        </button>
                    )}
                </div>
            </div>

            <Modal
                show={showMobilePreview}
                onClose={() => setShowMobilePreview(false)}
                maxWidth="2xl"
            >
                <div className="flex flex-col h-dvh">
                    <div className="bg-gray-800 px-4 py-3 flex justify-between items-center shrink-0">
                        <span className="text-white font-bold uppercase flex items-center gap-2">
                            <Icon icon="solar:document-text-bold" /> Preview
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
