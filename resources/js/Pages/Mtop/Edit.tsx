import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";
import { MtopApplication } from "@/types";

export default function Edit({
    application,
}: {
    application: MtopApplication;
}) {
    // Initialize form with EXISTING data from the database
    const { data, setData, put, processing, errors } = useForm({
        operator_name: application.operator_name,
        mt_number: application.mt_number,
        transaction_date: application.transaction_date,
        address: application.address,

        make_type: application.make_type,
        engine_motor_no: application.engine_motor_no,
        chassis_no: application.chassis_no,
        plate_no: application.plate_no,
        body_number: application.body_number || "",

        cedula_number: application.cedula_number || "",
        cedula_date: application.cedula_date || "",

        or_number: application.or_number || "",
        or_date: application.or_date || "",
    });

    // Helper: Calculate Expiry Year
    const expiryDisplay = () => {
        if (!data.transaction_date) return "";
        const startYear = data.transaction_date.split("-")[0];
        const endYear = parseInt(startYear) + 3;
        return `${data.transaction_date} - ${endYear}`;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Use PUT for updates, and pass the ID
        put(route("mtop.update", application.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Edit Application: {application.mt_number}
                </h2>
            }
        >
            <Head title="Edit MTOP" />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">
                        {/* --- TABLE 1: APPLICANT & VALIDITY (BLUE) --- */}
                        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase">
                                1. Applicant & Validity
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        value={data.operator_name}
                                        onChange={(e) =>
                                            setData(
                                                "operator_name",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.operator_name}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Barangay / Address
                                    </label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        value={data.address}
                                        onChange={(e) =>
                                            setData("address", e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date (Transaction)
                                    </label>
                                    <input
                                        type="date"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Control / Case Number
                                    </label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-600 font-bold"
                                        value={data.mt_number}
                                        onChange={(e) =>
                                            setData("mt_number", e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Expiry Date (Auto-Calculated)
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-600 font-bold"
                                        value={expiryDisplay()}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* --- TABLE 2: UNIT DETAILS (GREEN) --- */}
                        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase">
                                2. Tricycle Unit
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Gawa at Uri (Make/Brand)
                                    </label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        value={data.make_type}
                                        onChange={(e) =>
                                            setData("make_type", e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Motor Bilang (Engine No)
                                    </label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        value={data.engine_motor_no}
                                        onChange={(e) =>
                                            setData(
                                                "engine_motor_no",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tsasi Bilang (Chassis No)
                                    </label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        value={data.chassis_no}
                                        onChange={(e) =>
                                            setData(
                                                "chassis_no",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>
                                <div className="flex space-x-2">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Plaka Bilang
                                        </label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                            value={data.plate_no}
                                            onChange={(e) =>
                                                setData(
                                                    "plate_no",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="w-1/3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Body #
                                        </label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                            value={data.body_number}
                                            onChange={(e) =>
                                                setData(
                                                    "body_number",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* --- TABLE 3: CEDULA (YELLOW) --- */}
                            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase">
                                    3. Cedula
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Cedula Number
                                        </label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                            value={data.cedula_number}
                                            onChange={(e) =>
                                                setData(
                                                    "cedula_number",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Cedula Date
                                        </label>
                                        <input
                                            type="date"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                            </div>

                            {/* --- TABLE 4: OFFICIAL RECEIPT (PURPLE) --- */}
                            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase">
                                    4. Official Receipt
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            O.R. Number
                                        </label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                            value={data.or_number}
                                            onChange={(e) =>
                                                setData(
                                                    "or_number",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            O.R. Date
                                        </label>
                                        <input
                                            type="date"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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

                        {/* SUBMIT */}
                        <div className="flex justify-between pt-4">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded shadow-lg text-lg uppercase tracking-wider"
                                disabled={processing}
                            >
                                {processing ? "Updating..." : "Update Record"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
