import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import React, { FormEventHandler, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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

// --- EXTERNAL WINDOW COMPONENT FOR DUAL MONITORS ---
function ExternalWindow({
    children,
    onClose,
}: {
    children: React.ReactNode;
    onClose: () => void;
}) {
    const [container, setContainer] = useState<HTMLElement | null>(null);
    const winRef = useRef<Window | null>(null);

    useEffect(() => {
        winRef.current = window.open(
            "",
            "",
            "width=600,height=850,left=200,top=100",
        );
        if (!winRef.current) {
            toast.error(
                "Popup blocked! Please allow pop-ups for this site to use the Dual Monitor feature.",
            );
            onClose();
            return;
        }

        winRef.current.document.head.innerHTML = window.document.head.innerHTML;
        winRef.current.document.title = "Live Permit Preview (Dual Monitor)";
        winRef.current.document.body.className = "bg-gray-200 m-0 p-4";

        const div = winRef.current.document.createElement("div");
        winRef.current.document.body.appendChild(div);
        setContainer(div);

        winRef.current.addEventListener("beforeunload", () => onClose());

        return () => {
            if (winRef.current) winRef.current.close();
        };
    }, []);

    if (!container) return null;
    return createPortal(children, container);
}

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
}: {
    application: any;
    punong_bayans: string[];
    officials: string[];
}) {
    const [step, setStep] = useState(1);
    const [showMobilePreview, setShowMobilePreview] = useState(false);
    const [isFloating, setIsFloating] = useState(false);

    // ✅ PRE-FILL WITH OLD DATA, BUT CLEAR OUT THE DOCS & SET DATE TO TODAY
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
        cedula_number: "", // Cleared for renewal
        cedula_date: "", // Cleared for renewal
        or_number: "", // Cleared for renewal
        or_date: "", // Cleared for renewal
        punong_bayan: application.punong_bayan || "",
        authorized_official: application.authorized_official || "",
    });

    const requiredFields = {
        1: ["last_name", "first_name", "address", "transaction_date"],
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
            if (!isValidDate(data.or_date)) return false;
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

        // ✅ Point to the specific renewal submit route
        post(route("mtop.store_renewal", application.id), {
            onSuccess: () => {
                setIsFloating(false);
            },
            onError: (errs) => {
                if (errs.body_number) {
                    setStep(2);
                    toast.error(errs.body_number);
                } else {
                    toast.error("Failed to process renewal. Check inputs.");
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
        if (!data.transaction_date || !isValidDate(data.transaction_date))
            return "INVALID DATE";
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h2 className="font-bold text-sm sm:text-base text-gray-700 uppercase tracking-widest">
                            Renew Application
                        </h2>
                        <span className="text-xs font-black bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded hidden sm:inline-block">
                            {application.mt_number}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowMobilePreview(true)}
                        className="xl:hidden p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                    >
                        <Icon icon="solar:eye-bold" width="24" />
                    </button>
                </div>
            }
        >
            <Head title={`Renew ${application.mt_number}`} />

            <div className="py-6 pb-24 sm:pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div
                        className={`grid grid-cols-1 items-start transition-all duration-500 ease-in-out ${isFloating ? "max-w-4xl mx-auto" : "xl:grid-cols-12 gap-6"}`}
                    >
                        <div
                            className={`bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-500 relative ${isFloating ? "w-full ring-4 ring-indigo-100" : "xl:col-span-7"}`}
                        >
                            {isFloating && (
                                <div className="bg-indigo-600 p-3 flex justify-between items-center px-6 rounded-t-lg">
                                    <span className="text-white text-sm font-bold flex items-center gap-2">
                                        <Icon
                                            icon="solar:monitor-smartphone-bold"
                                            width="20"
                                        />{" "}
                                        Dual Monitor Mode Active
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setIsFloating(false)}
                                        className="text-xs font-bold bg-white text-indigo-600 px-4 py-1.5 rounded shadow-sm hover:bg-gray-100 transition-colors"
                                    >
                                        Dock Preview Here
                                    </button>
                                </div>
                            )}

                            <div
                                className={`flex border-b border-gray-200 bg-gray-50 ${!isFloating ? "rounded-t-lg" : ""}`}
                            >
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className={`flex-1 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${!isFloating ? "rounded-tl-lg" : ""} ${step === 1 ? "bg-white text-blue-600 border-t-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
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
                                    className={`flex-1 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${step === 2 ? "bg-white text-blue-600 border-t-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
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
                                    className={`flex-1 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${!isFloating ? "rounded-tr-lg" : ""} ${step === 3 ? "bg-white text-blue-600 border-t-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
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

                        {!isFloating && (
                            <div className="hidden xl:block xl:col-span-5 sticky top-6 z-20 animate-fade-in">
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsFloating(true)}
                                        className="absolute -top-3 -right-3 z-50 bg-gray-900 text-white p-3 rounded-full shadow-xl hover:bg-indigo-600 hover:scale-110 transition-all border-2 border-white flex items-center justify-center cursor-pointer"
                                    >
                                        <Icon
                                            icon="proicons:expand"
                                            width="22"
                                        />
                                    </button>
                                    <div className="rounded-xl overflow-hidden shadow-md border border-gray-200">
                                        <PermitPreview data={data} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isFloating && (
                <ExternalWindow onClose={() => setIsFloating(false)}>
                    <div className="drop-shadow-xl max-w-lg mx-auto">
                        <PermitPreview data={data} showHeader={true} />
                    </div>
                </ExternalWindow>
            )}

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
