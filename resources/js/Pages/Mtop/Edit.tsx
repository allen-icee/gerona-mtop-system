import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import InputGroup from "@/Components/InputGroup";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";
import { Icon } from "@iconify/react";

// Import Partials (Reusing what we built for Create!)
import TransactionHeader from "./Partials/TransactionHeader";
import ApplicantForm from "./Partials/ApplicantForm";
import TricycleForm from "./Partials/TricycleForm";
import CedulaForm from "./Partials/CedulaForm";
import OfficialReceiptForm from "./Partials/OfficialReceiptForm";
import PermitPreview from "./Partials/PermitPreview";

interface MtopApplication {
    id: number;
    // Applicant
    last_name: string;
    first_name: string;
    middle_name: string;
    address: string;

    // MTOP
    mt_number: string;
    transaction_date: string;

    // Unit
    body_number: string;
    plate_no: string;
    make_type: string;
    engine_motor_no: string;
    chassis_no: string;

    // Docs
    cedula_number: string;
    cedula_date: string;
    or_number: string;
    or_date: string;
    valid_until?: string;
}

export default function Edit({
    application,
}: {
    application: MtopApplication;
}) {
    // 1. LOAD EXISTING DATA
    const { data, setData, put, processing, errors } = useForm({
        last_name: application.last_name || "",
        first_name: application.first_name || "",
        middle_name: application.middle_name || "",
        address: application.address || "",

        mt_number: application.mt_number || "",
        transaction_date: application.transaction_date || "",

        body_number: application.body_number || "",
        plate_no: application.plate_no || "",
        make_type: application.make_type || "",
        engine_motor_no: application.engine_motor_no || "",
        chassis_no: application.chassis_no || "",

        cedula_number: application.cedula_number || "",
        cedula_date: application.cedula_date || "",
        or_number: application.or_number || "",
        or_date: application.or_date || "",
    });

    const expiryDisplay = () => {
        if (!data.transaction_date) return "";
        const startYear = data.transaction_date.split("-")[0];
        const endYear = parseInt(startYear) + 3;
        return `${data.transaction_date} - ${endYear}`;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route("mtop.update", application.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Edit Application:{" "}
                        <span className="text-blue-600">
                            #{application.body_number}
                        </span>
                    </h2>
                    <span className="text-xs font-normal text-white bg-blue-600 px-2 py-1 rounded shadow-sm">
                        Editing Mode
                    </span>
                </div>
            }
        >
            <Head title="Edit MTOP" />

            <div className="py-6 lg:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* GRID LAYOUT (Form + Preview) */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                        {/* LEFT: FORM */}
                        <div className="xl:col-span-7">
                            <form onSubmit={submit} className="space-y-6">
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

                                <TricycleForm
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                />

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

                                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 mt-8">
                                    <Link
                                        href={route("mtop.index")}
                                        className="text-sm text-gray-600 underline hover:text-gray-900 font-medium"
                                    >
                                        Cancel
                                    </Link>

                                    <PrimaryButton
                                        className="bg-blue-800 hover:bg-blue-900 py-3 px-8 text-lg shadow-lg"
                                        disabled={processing}
                                    >
                                        <Icon
                                            icon="solar:diskette-bold"
                                            className="mr-2"
                                            width="20"
                                        />
                                        UPDATE RECORD
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>

                        {/* RIGHT: PREVIEW */}
                        <div className="hidden xl:block xl:col-span-5 relative">
                            <PermitPreview data={data} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
