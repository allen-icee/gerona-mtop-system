import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { MtopApplication } from "@/types"; // We'll define this type below if needed, or use 'any' for now

export default function Index({ applications }: { applications: any[] }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    MTOP Records
                </h2>
            }
        >
            <Head title="MTOP Records" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* TOP ACTION BAR */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-gray-600 text-lg">
                            Total Records: {applications.length}
                        </h3>
                        <Link
                            href={route("mtop.create")}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
                        >
                            + New Application
                        </Link>
                    </div>

                    {/* THE TABLE (The "Logbook") */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Case No.
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Operator Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Plate / Body #
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Transaction Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {applications.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-4 text-center text-gray-500"
                                        >
                                            No records found. Click "New
                                            Application" to start.
                                        </td>
                                    </tr>
                                ) : (
                                    applications.map((app) => (
                                        <tr
                                            key={app.id}
                                            className="hover:bg-gray-50 transition"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                                                {app.mt_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                {app.operator_name}
                                                <div className="text-xs text-gray-500">
                                                    {app.address}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <div>
                                                    Plate:{" "}
                                                    <span className="font-bold">
                                                        {app.plate_no}
                                                    </span>
                                                </div>
                                                <div className="text-xs">
                                                    Body:{" "}
                                                    {app.body_number || "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {app.transaction_date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        app.status === "printed"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {app.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={route(
                                                        "mtop.edit",
                                                        app.id,
                                                    )}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                >
                                                    Edit
                                                </Link>
                                                <Link
                                                    href={route(
                                                        "mtop.print",
                                                        app.id,
                                                    )}
                                                    className="text-green-600 hover:text-green-900 font-bold"
                                                >
                                                    PRINT
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
