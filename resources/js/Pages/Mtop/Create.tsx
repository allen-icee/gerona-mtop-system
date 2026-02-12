import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputGroup from "@/Components/InputGroup"; // Using our smart component
import PrimaryButton from "@/Components/PrimaryButton";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";
import { Icon } from "@iconify/react";

export default function Create() {
    // 1. FORM STATE (Matches your exact data structure)
    const { data, setData, post, processing, errors } = useForm({
        // Table 1: Main Info
        operator_name: "",
        mt_number: "", // Optional/Auto
        transaction_date: new Date().toISOString().split("T")[0], // Today
        address: "",

        // Table 2: Unit
        make_type: "",
        engine_motor_no: "",
        chassis_no: "",
        plate_no: "",
        body_number: "",

        // Table 3: Cedula
        cedula_number: "",
        cedula_date: "",

        // Table 4: OR
        or_number: "",
        or_date: "",
    });

    // Helper: Calculate Expiry Year (Transaction Date + 3 Years)
    const expiryDisplay = () => {
        if (!data.transaction_date) return "";
        const startYear = data.transaction_date.split("-")[0];
        const endYear = parseInt(startYear) + 3;
        return `${data.transaction_date} - ${endYear}`; // Valid until
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("mtop.store"));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    New MTOP Application
                </h2>
            }
        >
            <Head title="New MTOP" />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">
                        {/* --- SECTION 1: APPLICANT & VALIDITY (BLUE) --- */}
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
                                    placeholder="Juan Dela Cruz"
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
                                    placeholder="Barangay, Gerona, Tarlac"
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

                                {/* Auto-Calculated Expiry (Read Only) */}
                                <div>
                                    <label className="block font-medium text-sm text-gray-700 mb-1">
                                        Validity (Auto-Calculated)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                            <Icon
                                                icon="solar:clock-circle-bold"
                                                width="20"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            disabled
                                            className="block w-full pl-10 py-3 border-gray-300 bg-gray-100 text-gray-600 font-bold rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            value={expiryDisplay()}
                                        />
                                    </div>
                                </div>

                                <InputGroup
                                    id="mt_number"
                                    label="MTOP Case Number"
                                    name="mt_number"
                                    value={data.mt_number}
                                    onChange={(e) =>
                                        setData("mt_number", e.target.value)
                                    }
                                    icon="solar:folder-with-files-bold"
                                    placeholder="(Auto-Generated or Manual)"
                                />
                            </div>
                        </div>

                        {/* --- SECTION 2: TRICYCLE UNIT (GREEN) --- */}
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
                                    placeholder="#1234"
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
                                    placeholder="e.g. 123ABC"
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
                                    placeholder="e.g. Honda TMX"
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
                                    placeholder="Engine Serial #"
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
                                    placeholder="Chassis Serial #"
                                />
                            </div>
                        </div>

                        {/* --- SECTION 3: CEDULA & OR (YELLOW & PURPLE) --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* CEDULA (Yellow) */}
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

                            {/* OFFICIAL RECEIPT (Purple) */}
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
                                SAVE APPLICATION
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
