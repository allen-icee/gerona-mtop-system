import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler, useState } from "react";
import { Icon } from "@iconify/react";
import InputGroup from "@/Components/InputGroup";
import BarangaySelect from "@/Components/BarangaySelect";
import PermitPreview from "./Partials/PermitPreview";

export default function Create({
    suggested_mt_number,
}: {
    suggested_mt_number: string;
}) {
    const [step, setStep] = useState(1);
    const { data, setData, post, processing, errors } = useForm({
        // Applicant
        last_name: "",
        first_name: "",
        middle_name: "",
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
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("mtop.store"));
    };

    // --- FIX IS HERE ---
    const up = (field: keyof typeof data, val: string) =>
        setData(field, val.toUpperCase());

    return (
        <AuthenticatedLayout
            header={
                // CENTERED, SMALL HEADER
                <div className="flex justify-center items-center h-0">
                    <h2 className="font-bold text-sm text-gray-700 uppercase tracking-widest">
                        New MTOP Application
                    </h2>
                </div>
            }
        >
            <Head title="New MTOP" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                        {/* --- LEFT COLUMN: THE FORM CARD --- */}
                        <div className="xl:col-span-7 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            {/* TABS */}
                            <div className="flex border-b border-gray-200 bg-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${step === 1 ? "bg-white text-blue-600 border-t-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    <Icon icon="solar:user-id-bold" /> Applicant
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${step === 2 ? "bg-white text-blue-600 border-t-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    <Icon icon="solar:wheel-bold" /> Unit & Docs
                                </button>
                            </div>

                            <form onSubmit={submit} className="p-6">
                                {/* --- STEP 1: APPLICANT --- */}
                                <div
                                    className={step === 1 ? "block" : "hidden"}
                                >
                                    <div className="grid grid-cols-12 gap-4">
                                        <div className="col-span-6">
                                            <InputGroup
                                                id="mt_number"
                                                label="Control / Case No."
                                                icon="solar:folder-with-files-bold"
                                                value={data.mt_number}
                                                onChange={(e) =>
                                                    up(
                                                        "mt_number",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="2026-0001"
                                            />
                                        </div>
                                        <div className="col-span-6">
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
                                            />
                                        </div>

                                        <div className="col-span-12 border-t pt-2 mt-2"></div>
                                        <div className="col-span-5">
                                            <InputGroup
                                                id="last_name"
                                                label="Last Name"
                                                placeholder="BAGSIC"
                                                icon="solar:user-bold"
                                                value={data.last_name}
                                                onChange={(e) =>
                                                    up(
                                                        "last_name",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="col-span-5">
                                            <InputGroup
                                                id="first_name"
                                                label="First Name"
                                                placeholder="RICARTE"
                                                value={data.first_name}
                                                onChange={(e) =>
                                                    up(
                                                        "first_name",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <InputGroup
                                                id="middle_name"
                                                label="M.I."
                                                placeholder="R"
                                                maxLength={1}
                                                value={data.middle_name}
                                                onChange={(e) =>
                                                    up(
                                                        "middle_name",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="col-span-12">
                                            <BarangaySelect
                                                value={data.address}
                                                onChange={(val) =>
                                                    setData("address", val)
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* --- STEP 2: UNIT & DOCS --- */}
                                <div
                                    className={step === 2 ? "block" : "hidden"}
                                >
                                    <div className="grid grid-cols-12 gap-4">
                                        <div className="col-span-4">
                                            <InputGroup
                                                id="body_number"
                                                label="Body Number"
                                                icon="solar:hashtag-square-bold"
                                                placeholder="1616"
                                                value={data.body_number}
                                                onChange={(e) =>
                                                    setData(
                                                        "body_number",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="col-span-4">
                                            <InputGroup
                                                id="plate_no"
                                                label="Plate Number (Plaka Bilang)"
                                                placeholder="RE1470"
                                                icon="solar:card-reciept-bold"
                                                value={data.plate_no}
                                                onChange={(e) =>
                                                    up(
                                                        "plate_no",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="col-span-4">
                                            <InputGroup
                                                id="make_type"
                                                label="Make/Brand (Gawa at Uri)"
                                                placeholder="HONDA"
                                                value={data.make_type}
                                                onChange={(e) =>
                                                    up(
                                                        "make_type",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="col-span-6">
                                            <InputGroup
                                                id="engine_motor_no"
                                                label="Engine Motor No. (Motor Bilang)"
                                                placeholder="KB506058032636E"
                                                value={data.engine_motor_no}
                                                onChange={(e) =>
                                                    up(
                                                        "engine_motor_no",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="col-span-6">
                                            <InputGroup
                                                id="chassis_no"
                                                label="Chassis No. (Tsasi Bilang)"
                                                placeholder="KB50605803236"
                                                value={data.chassis_no}
                                                onChange={(e) =>
                                                    up(
                                                        "chassis_no",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="col-span-12 border-t pt-2 mt-2"></div>

                                        <div className="col-span-6 bg-yellow-50 p-3 rounded border border-yellow-200">
                                            <div className="font-bold text-xs text-yellow-800 uppercase mb-2">
                                                Cedula
                                            </div>
                                            <div className="space-y-3">
                                                <InputGroup
                                                    id="cedula_number"
                                                    label="Number"
                                                    placeholder="28534360"
                                                    value={data.cedula_number}
                                                    onChange={(e) =>
                                                        up(
                                                            "cedula_number",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <InputGroup
                                                    id="cedula_date"
                                                    type="date"
                                                    label="Date"
                                                    value={data.cedula_date}
                                                    onChange={(e) =>
                                                        setData(
                                                            "cedula_date",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="col-span-6 bg-purple-50 p-3 rounded border border-purple-200">
                                            <div className="font-bold text-xs text-purple-800 uppercase mb-2">
                                                Official Receipt
                                            </div>
                                            <div className="space-y-3">
                                                <InputGroup
                                                    id="or_number"
                                                    label="Number"
                                                    placeholder="9801547"
                                                    value={data.or_number}
                                                    onChange={(e) =>
                                                        up(
                                                            "or_number",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <InputGroup
                                                    id="or_date"
                                                    type="date"
                                                    label="Date"
                                                    value={data.or_date}
                                                    onChange={(e) =>
                                                        setData(
                                                            "or_date",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* --- FOOTER ACTIONS --- */}
                                <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
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
        </AuthenticatedLayout>
    );
}
