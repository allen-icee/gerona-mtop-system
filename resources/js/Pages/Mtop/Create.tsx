import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler, useState } from "react";
import { Icon } from "@iconify/react";
import InputGroup from "@/Components/InputGroup";
import Modal from "@/Components/Modal";

// Partials
import ApplicantForm from "./Partials/ApplicantForm";
import TricycleForm from "./Partials/TricycleForm";
import CedulaForm from "./Partials/CedulaForm";
import OfficialReceiptForm from "./Partials/OfficialReceiptForm";
import OfficialsForm from "./Partials/OfficialsForm";
import PermitPreview from "./Partials/PermitPreview";

export default function Create({
    suggested_mt_number,
    punong_bayans,
    officials,
}: {
    suggested_mt_number: string;
    punong_bayans: string[];
    officials: string[];
}) {
    const [step, setStep] = useState(1);
    const [showMobilePreview, setShowMobilePreview] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("mtop.store"));
    };

    const up = (field: keyof typeof data, val: string) =>
        setData(field, val.toUpperCase());

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
                        <div className="xl:col-span-7 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            {/* TABS */}
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
                                    onClick={() => setStep(2)}
                                    className={`flex-1 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${
                                        step === 2
                                            ? "bg-white text-blue-600 border-t-2 border-blue-600"
                                            : "text-gray-400 hover:text-gray-600"
                                    }`}
                                >
                                    <Icon icon="solar:wheel-bold" width="18" />{" "}
                                    Unit & Docs
                                </button>
                            </div>

                            <form
                                onSubmit={submit}
                                className="p-4 sm:p-6 space-y-6"
                            >
                                {/* STEP 1: APPLICANT */}
                                <div
                                    className={
                                        step === 1
                                            ? "block space-y-6"
                                            : "hidden"
                                    }
                                >
                                    {/* Transaction Header Fields */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <InputGroup
                                            id="mt_number"
                                            label="Control No."
                                            icon="solar:folder-with-files-bold"
                                            value={data.mt_number}
                                            onChange={(e) =>
                                                up("mt_number", e.target.value)
                                            }
                                            placeholder="2026-0001"
                                            required
                                        />
                                        <InputGroup
                                            id="transaction_date"
                                            type="date"
                                            label="Date"
                                            icon="solar:calendar-bold"
                                            value={data.transaction_date}
                                            onChange={(e) =>
                                                setData(
                                                    "transaction_date",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>

                                    {/* modular Applicant Form (Handles Names & Barangay) */}
                                    <ApplicantForm
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                    />
                                </div>

                                {/* STEP 2: UNIT & DOCS */}
                                <div
                                    className={
                                        step === 2
                                            ? "block space-y-6"
                                            : "hidden"
                                    }
                                >
                                    {/* modular Tricycle Form (Handles Engine/Chassis/Plate/Body) */}
                                    <TricycleForm
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* modular Cedula Form */}
                                        <CedulaForm
                                            data={data}
                                            setData={setData}
                                            errors={errors}
                                        />
                                        {/* modular Official Receipt Form */}
                                        <OfficialReceiptForm
                                            data={data}
                                            setData={setData}
                                            errors={errors}
                                        />
                                    </div>

                                    {/* modular Signatories Form */}
                                    <OfficialsForm
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        punong_bayans={punong_bayans}
                                        officials={officials}
                                    />
                                </div>

                                {/* DESKTOP FOOTER */}
                                <div className="hidden sm:flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
                                    <Link
                                        href={route("mtop.index")}
                                        className="text-gray-500 hover:text-red-600 text-sm font-bold"
                                    >
                                        Cancel
                                    </Link>

                                    <div className="flex gap-3">
                                        {step === 2 && (
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-bold hover:bg-gray-200 text-sm"
                                            >
                                                Back
                                            </button>
                                        )}

                                        {step === 1 ? (
                                            <PrimaryButton
                                                type="button"
                                                onClick={() => setStep(2)}
                                            >
                                                Next Step{" "}
                                                <Icon
                                                    icon="solar:arrow-right-bold"
                                                    className="ml-2"
                                                />
                                            </PrimaryButton>
                                        ) : (
                                            <PrimaryButton
                                                className="bg-green-600 hover:bg-green-700"
                                                disabled={processing}
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

                        {/* --- RIGHT COLUMN: PREVIEW --- */}
                        <div className="hidden xl:block xl:col-span-5 sticky top-6">
                            <PermitPreview data={data} />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MOBILE STICKY FOOTER --- */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:hidden z-40 flex justify-between items-center safe-area-pb">
                <Link
                    href={route("mtop.index")}
                    className="text-gray-500 font-bold text-sm"
                >
                    Cancel
                </Link>
                <div className="flex gap-2">
                    {step === 2 && (
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm"
                        >
                            Back
                        </button>
                    )}
                    {step === 1 ? (
                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm flex items-center"
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
                            disabled={processing}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold text-sm flex items-center"
                        >
                            <Icon icon="solar:diskette-bold" className="mr-1" />{" "}
                            Save
                        </button>
                    )}
                </div>
            </div>

            {/* --- MOBILE PREVIEW MODAL --- */}
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
