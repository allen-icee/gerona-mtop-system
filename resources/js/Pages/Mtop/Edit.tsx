import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputGroup from "@/Components/InputGroup";
import PrimaryButton from "@/Components/PrimaryButton";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";
import { Icon } from "@iconify/react";

// Define the Data Interface
interface MtopApplication {
    id: number;
    operator_name: string;
    address: string;
    transaction_date: string;
    mt_number: string;
    body_number: string;
    plate_no: string;
    make_type: string;
    engine_motor_no: string;
    chassis_no: string;
    cedula_number: string;
    cedula_date: string;
    or_number: string;
    or_date: string;
    valid_until?: string; // Optional
}

export default function Edit({
    application,
}: {
    application: MtopApplication;
}) {
    // 1. INITIALIZE FORM WITH EXISTING DATA
    const { data, setData, put, processing, errors } = useForm({
        operator_name: application.operator_name || "",
        address: application.address || "",
        transaction_date: application.transaction_date || "",
        mt_number: application.mt_number || "",

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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route("mtop.update", application.id)); // Use PUT for updates
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Edit Application:{" "}
                    <span className="text-blue-600">
                        #{application.body_number}
                    </span>
                </h2>
            }
        >
            <Head title="Edit MTOP" />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">
                        {/* --- SECTION 1: APPLICANT --- */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-600">
                            <div className="flex items-center gap-2 mb-6 border-b pb-2">
                                <Icon
                                    icon="solar:user-id-bold"
                                    className="text-blue-600"
                                    width="24"
                                />
                                <h3 className="text-lg font-bold text-gray-700 uppercase">
                                    1. Applicant & Validity
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup
                                    id="operator_name"
                                    label="Operator Name"
                                    name="operator_name"
                                    value={data.operator_name}
                                    onChange={(e) =>
                                        setData("operator_name", e.target.value)
                                    }
                                    error={errors.operator_name}
                                    icon="solar:user-bold"
                                />

                                <InputGroup
                                    id="address"
                                    label="Barangay / Address"
                                    name="address"
                                    value={data.address}
                                    onChange={(e) =>
                                        setData("address", e.target.value)
                                    }
                                    error={errors.address}
                                    icon="solar:map-point-bold"
                                />

                                <InputGroup
                                    id="transaction_date"
                                    label="Transaction Date"
                                    name="transaction_date"
                                    type="date"
                                    value={data.transaction_date}
                                    onChange={(e) =>
                                        setData(
                                            "transaction_date",
                                            e.target.value,
                                        )
                                    }
                                    icon="solar:calendar-bold"
                                />

                                {/* MTOP Case Number */}
                                <InputGroup
                                    id="mt_number"
                                    label="MTOP Case Number"
                                    name="mt_number"
                                    value={data.mt_number}
                                    onChange={(e) =>
                                        setData("mt_number", e.target.value)
                                    }
                                    icon="solar:folder-with-files-bold"
                                />
                            </div>
                        </div>

                        {/* --- SECTION 2: UNIT --- */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-600">
                            <div className="flex items-center gap-2 mb-6 border-b pb-2">
                                <Icon
                                    icon="solar:wheel-bold"
                                    className="text-green-600"
                                    width="24"
                                />
                                <h3 className="text-lg font-bold text-gray-700 uppercase">
                                    2. Tricycle Unit Details
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup
                                    id="body_number"
                                    label="Body Number (MTOP)"
                                    name="body_number"
                                    value={data.body_number}
                                    onChange={(e) =>
                                        setData("body_number", e.target.value)
                                    }
                                    error={errors.body_number}
                                    icon="solar:hashtag-square-bold"
                                />

                                <InputGroup
                                    id="plate_no"
                                    label="Plate Number"
                                    name="plate_no"
                                    value={data.plate_no}
                                    onChange={(e) =>
                                        setData("plate_no", e.target.value)
                                    }
                                    error={errors.plate_no}
                                    icon="solar:card-reciept-bold"
                                />

                                <InputGroup
                                    id="make_type"
                                    label="Make / Type"
                                    name="make_type"
                                    value={data.make_type}
                                    onChange={(e) =>
                                        setData("make_type", e.target.value)
                                    }
                                    error={errors.make_type}
                                    icon="solar:box-minimalistic-bold"
                                />

                                <InputGroup
                                    id="engine_motor_no"
                                    label="Engine Motor No."
                                    name="engine_motor_no"
                                    value={data.engine_motor_no}
                                    onChange={(e) =>
                                        setData(
                                            "engine_motor_no",
                                            e.target.value,
                                        )
                                    }
                                    error={errors.engine_motor_no}
                                    icon="solar:settings-bold"
                                />

                                <InputGroup
                                    id="chassis_no"
                                    label="Chassis No."
                                    name="chassis_no"
                                    value={data.chassis_no}
                                    onChange={(e) =>
                                        setData("chassis_no", e.target.value)
                                    }
                                    error={errors.chassis_no}
                                    icon="solar:structure-bold"
                                />
                            </div>
                        </div>

                        {/* --- SECTION 3: CEDULA & OR --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* CEDULA */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
                                <div className="flex items-center gap-2 mb-4 border-b pb-2">
                                    <Icon
                                        icon="solar:document-add-bold"
                                        className="text-yellow-600"
                                        width="24"
                                    />
                                    <h3 className="text-lg font-bold text-gray-700 uppercase">
                                        3. Cedula
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    <InputGroup
                                        id="cedula_number"
                                        label="Cedula Number"
                                        name="cedula_number"
                                        value={data.cedula_number}
                                        onChange={(e) =>
                                            setData(
                                                "cedula_number",
                                                e.target.value,
                                            )
                                        }
                                        icon="solar:hashtag-bold"
                                    />
                                    <InputGroup
                                        id="cedula_date"
                                        label="Date Issued"
                                        name="cedula_date"
                                        type="date"
                                        value={data.cedula_date}
                                        onChange={(e) =>
                                            setData(
                                                "cedula_date",
                                                e.target.value,
                                            )
                                        }
                                        icon="solar:calendar-date-bold"
                                    />
                                </div>
                            </div>

                            {/* OFFICIAL RECEIPT */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
                                <div className="flex items-center gap-2 mb-4 border-b pb-2">
                                    <Icon
                                        icon="solar:bill-check-bold"
                                        className="text-purple-600"
                                        width="24"
                                    />
                                    <h3 className="text-lg font-bold text-gray-700 uppercase">
                                        4. Official Receipt
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    <InputGroup
                                        id="or_number"
                                        label="O.R. Number"
                                        name="or_number"
                                        value={data.or_number}
                                        onChange={(e) =>
                                            setData("or_number", e.target.value)
                                        }
                                        icon="solar:hashtag-bold"
                                    />
                                    <InputGroup
                                        id="or_date"
                                        label="Date Paid"
                                        name="or_date"
                                        type="date"
                                        value={data.or_date}
                                        onChange={(e) =>
                                            setData("or_date", e.target.value)
                                        }
                                        icon="solar:calendar-date-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* FORM ACTIONS */}
                        <div className="flex items-center justify-end gap-4 pt-4">
                            <Link
                                href={route("mtop.index")}
                                className="text-sm text-gray-600 underline hover:text-gray-900 font-medium"
                            >
                                Cancel
                            </Link>

                            <PrimaryButton
                                className="bg-blue-800 hover:bg-blue-900 py-3 px-8 text-lg"
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
            </div>
        </AuthenticatedLayout>
    );
}
