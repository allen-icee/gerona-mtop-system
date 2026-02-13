import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler, useState } from "react";
import { Icon } from "@iconify/react";
import InputGroup from "@/Components/InputGroup";
import BarangaySelect from "@/Components/BarangaySelect";
import PermitPreview from "./Partials/PermitPreview";
import OfficialsForm from "./Partials/OfficialsForm";

interface MtopApplication {
    id: number;
    last_name: string;
    first_name: string;
    middle_name: string;
    address: string;
    mt_number: string;
    transaction_date: string;
    make_type: string;
    engine_motor_no: string;
    chassis_no: string;
    plate_no: string;
    body_number: string;
    cedula_number: string;
    cedula_date: string;
    or_number: string;
    or_date: string;
    punong_bayan: string;
    authorized_official: string;
}

export default function Edit({
    application,
    punong_bayans, // New Prop
    officials, // New Prop
}: {
    application: MtopApplication;
    punong_bayans: string[]; // Define Type
    officials: string[]; // Define Type
}) {
    const [step, setStep] = useState(1);

    // 1. INITIALIZE FORM WITH EXISTING DATA
    const { data, setData, put, processing, errors } = useForm({
        last_name: application.last_name || "",
        first_name: application.first_name || "",
        middle_name: application.middle_name || "",
        address: application.address || "",
        mt_number: application.mt_number || "",
        transaction_date: application.transaction_date || "",
        make_type: application.make_type || "",
        engine_motor_no: application.engine_motor_no || "",
        chassis_no: application.chassis_no || "",
        plate_no: application.plate_no || "",
        body_number: application.body_number || "",
        cedula_number: application.cedula_number || "",
        cedula_date: application.cedula_date || "",
        or_number: application.or_number || "",
        or_date: application.or_date || "",
        punong_bayan: application.punong_bayan || "",
        authorized_official: application.authorized_official || "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route("mtop.update", application.id)); // Use PUT for updates
    };

    const up = (field: keyof typeof data, val: string) =>
        setData(field, val.toUpperCase());

    return (
        <AuthenticatedLayout
            header={
                // CENTERED, SMALL HEADER
                <div className="flex justify-center items-center h-0 gap-2">
                    <h2 className="font-bold text-sm text-gray-700 uppercase tracking-widest">
                        Edit MTOP Application
                    </h2>
                    <span className="text-xs font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {application.mt_number}
                    </span>
                </div>
            }
        >
            <Head title="Edit MTOP" />

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
                                                required={true}
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
                                                required={true}
                                            />
                                        </div>

                                        <div className="col-span-12 border-t pt-2 mt-2"></div>
                                        <div className="col-span-5">
                                            <InputGroup
                                                id="last_name"
                                                label="Last Name"
                                                placeholder="DELA CRUZ"
                                                icon="solar:user-bold"
                                                value={data.last_name}
                                                onChange={(e) =>
                                                    up(
                                                        "last_name",
                                                        e.target.value,
                                                    )
                                                }
                                                required={true}
                                            />
                                        </div>
                                        <div className="col-span-5">
                                            <InputGroup
                                                id="first_name"
                                                label="First Name"
                                                placeholder="JUAN"
                                                value={data.first_name}
                                                onChange={(e) =>
                                                    up(
                                                        "first_name",
                                                        e.target.value,
                                                    )
                                                }
                                                required={true}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <InputGroup
                                                id="middle_name"
                                                label="M.I."
                                                placeholder="A"
                                                maxLength={1}
                                                value={data.middle_name}
                                                onChange={(e) =>
                                                    up(
                                                        "middle_name",
                                                        e.target.value,
                                                    )
                                                }
                                                // Middle Name Optional
                                            />
                                        </div>

                                        <div className="col-span-12">
                                            <BarangaySelect
                                                value={data.address}
                                                onChange={(val) =>
                                                    setData("address", val)
                                                }
                                                required={true}
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
                                                value={data.body_number}
                                                onChange={(e) =>
                                                    setData(
                                                        "body_number",
                                                        e.target.value,
                                                    )
                                                }
                                                required={true}
                                            />
                                        </div>
                                        <div className="col-span-4">
                                            <InputGroup
                                                id="plate_no"
                                                label="Plate Number"
                                                icon="solar:card-reciept-bold"
                                                value={data.plate_no}
                                                onChange={(e) =>
                                                    up(
                                                        "plate_no",
                                                        e.target.value,
                                                    )
                                                }
                                                required={true}
                                            />
                                        </div>
                                        <div className="col-span-4">
                                            <InputGroup
                                                id="make_type"
                                                label="Make / Type"
                                                placeholder="HONDA"
                                                value={data.make_type}
                                                onChange={(e) =>
                                                    up(
                                                        "make_type",
                                                        e.target.value,
                                                    )
                                                }
                                                required={true}
                                            />
                                        </div>

                                        <div className="col-span-6">
                                            <InputGroup
                                                id="engine_motor_no"
                                                label="Engine Motor No."
                                                value={data.engine_motor_no}
                                                onChange={(e) =>
                                                    up(
                                                        "engine_motor_no",
                                                        e.target.value,
                                                    )
                                                }
                                                required={true}
                                            />
                                        </div>
                                        <div className="col-span-6">
                                            <InputGroup
                                                id="chassis_no"
                                                label="Chassis No."
                                                value={data.chassis_no}
                                                onChange={(e) =>
                                                    up(
                                                        "chassis_no",
                                                        e.target.value,
                                                    )
                                                }
                                                required={true}
                                            />
                                        </div>

                                        <div className="col-span-12 border-t pt-2 mt-2"></div>

                                        {/* DOCS SECTIONS */}
                                        <div className="col-span-6 bg-yellow-50 p-3 rounded border border-yellow-200">
                                            <div className="font-bold text-xs text-yellow-800 uppercase mb-2">
                                                Cedula
                                            </div>
                                            <div className="space-y-3">
                                                <InputGroup
                                                    id="cedula_number"
                                                    label="No."
                                                    value={data.cedula_number}
                                                    onChange={(e) =>
                                                        up(
                                                            "cedula_number",
                                                            e.target.value,
                                                        )
                                                    }
                                                    required={true}
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
                                                    required={true}
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
                                                    label="No."
                                                    value={data.or_number}
                                                    onChange={(e) =>
                                                        up(
                                                            "or_number",
                                                            e.target.value,
                                                        )
                                                    }
                                                    required={true}
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
                                                    required={true}
                                                />
                                            </div>
                                        </div>

                                        {/* SIGNATORIES SECTION */}
                                        <div className="col-span-12">
                                            <OfficialsForm
                                                data={data}
                                                setData={setData}
                                                errors={errors}
                                                // PASS THE NEW PROPS DOWN
                                                punong_bayans={punong_bayans}
                                                officials={officials}
                                            />
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
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setStep(2);
                                                }}
                                            >
                                                Next Step{" "}
                                                <Icon
                                                    icon="solar:arrow-right-bold"
                                                    className="ml-2"
                                                />
                                            </PrimaryButton>
                                        ) : (
                                            <PrimaryButton
                                                className="bg-blue-800 hover:bg-blue-900"
                                                disabled={processing}
                                            >
                                                <Icon
                                                    icon="solar:diskette-bold"
                                                    className="mr-2"
                                                />{" "}
                                                Update Record
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
