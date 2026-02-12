import { Icon } from "@iconify/react";

// Add showHeader to props, default it to true
export default function PermitPreview({
    data,
    showHeader = true,
}: {
    data: any;
    showHeader?: boolean;
}) {
    // ... (Keep all your existing helper functions: fullName, val, formatDate, formatExpiry) ...
    // Copy them exactly from your previous file
    const fullName =
        `${data.last_name || ""}, ${data.first_name || ""} ${data.middle_name || ""}`.toUpperCase();
    const val = (text: string) => (text ? text.toUpperCase() : "-");
    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Date(dateString)
            .toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
            .toUpperCase();
    };
    const formatExpiry = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const startStr = date
            .toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
            })
            .toUpperCase();
        const endYear = date.getFullYear() + 3;
        return `${startStr} - ${endYear}`;
    };

    return (
        <div className="flex flex-col h-full bg-white font-sans">
            {/* CONDITIONAL HEADER: Only show if showHeader is true */}
            {showHeader && (
                <div className="bg-gray-800 text-white p-3 font-bold text-center uppercase tracking-wider text-sm flex items-center justify-center gap-2 border-b border-black">
                    <Icon icon="solar:document-text-bold" />
                    Information Preview
                </div>
            )}

            <div className="p-6 overflow-y-auto">
                {/* ... (Keep the rest of your Table code exactly the same) ... */}

                {/* --- TABLE 1: MAIN INFO --- */}
                <table className="w-full border-collapse border border-black bg-white text-sm mb-6 shadow-sm">
                    <tbody>
                        <tr className="border-b border-black">
                            <td className="p-3 bg-blue-200 font-bold w-1/3 text-blue-900 border-r border-black">
                                NAME
                            </td>
                            <td className="p-3 font-bold text-gray-800 text-sm">
                                {val(fullName)}.
                            </td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-3 bg-blue-200 font-bold text-blue-900 border-r border-black">
                                USAPIN BILANG
                            </td>
                            <td className="p-3 font-bold text-red-600">
                                {val(data.mt_number)}
                            </td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-3 bg-blue-200 font-bold text-blue-900 border-r border-black">
                                DATE
                            </td>
                            <td className="p-3 font-medium text-gray-800">
                                {formatDate(data.transaction_date)}
                            </td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-3 bg-blue-200 font-bold text-blue-900 border-r border-black">
                                BARANGAY
                            </td>
                            <td className="p-3 font-medium text-gray-800">
                                {val(data.address)}
                            </td>
                        </tr>
                        <tr>
                            <td className="p-3 bg-blue-200 font-bold text-blue-900 border-r border-black">
                                EXPIRY DATE
                            </td>
                            <td className="p-3 font-bold text-gray-800">
                                {formatExpiry(data.transaction_date)}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* --- TABLE 2: UNIT --- */}
                <table className="w-full border-collapse border border-black bg-white text-xs mb-6 text-center shadow-sm">
                    <thead>
                        <tr className="bg-blue-300 text-blue-900 font-bold uppercase border-b border-black">
                            <th className="p-2 border-r border-black w-1/4">
                                GAWA AT URI
                            </th>
                            <th className="p-2 border-r border-black w-1/4">
                                MOTOR BILANG
                            </th>
                            <th className="p-2 border-r border-black w-1/4">
                                TSASI BILANG
                            </th>
                            <th className="p-2 w-1/4">PLAKA BILANG</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-2 border-r border-black font-bold text-gray-700">
                                {val(data.make_type)}
                            </td>
                            <td className="p-2 border-r border-black font-bold text-gray-700">
                                {val(data.engine_motor_no)}
                            </td>
                            <td className="p-2 border-r border-black font-bold text-gray-700">
                                {val(data.chassis_no)}
                            </td>
                            <td className="p-2 font-bold text-blue-700 text-sm">
                                {val(data.plate_no)}
                                {data.body_number ? (
                                    <span className="text-gray-500 ml-1 font-normal">
                                        (#{data.body_number})
                                    </span>
                                ) : (
                                    ""
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* --- TABLE 3 & 4: DOCS --- */}
                <div className="grid grid-cols-2 gap-4">
                    {/* CEDULA */}
                    <table className="w-full border-collapse border border-black bg-white text-xs shadow-sm">
                        <thead>
                            <tr className="bg-blue-300 text-blue-900 border-b border-black">
                                <th
                                    colSpan={2}
                                    className="p-2 font-bold text-center"
                                >
                                    CEDULA
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-black">
                                <td className="p-2 bg-blue-200 font-bold text-blue-900 w-1/3 border-r border-black">
                                    NUMBER
                                </td>
                                <td className="p-2 font-mono font-bold text-gray-800 text-sm pl-3">
                                    {val(data.cedula_number)}
                                </td>
                            </tr>
                            <tr>
                                <td className="p-2 bg-blue-200 font-bold text-blue-900 border-r border-black">
                                    DATE
                                </td>
                                <td className="p-2 text-gray-600 font-medium pl-3">
                                    {formatDate(data.cedula_date)}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* OFFICIAL RECEIPT */}
                    <table className="w-full border-collapse border border-black bg-white text-xs shadow-sm">
                        <thead>
                            <tr className="bg-blue-300 text-blue-900 border-b border-black">
                                <th
                                    colSpan={2}
                                    className="p-2 font-bold text-center"
                                >
                                    OFFICIAL RECEIPT
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-black">
                                <td className="p-2 bg-blue-200 font-bold text-blue-900 w-1/3 border-r border-black">
                                    NUMBER
                                </td>
                                <td className="p-2 font-mono font-bold text-gray-800 text-sm pl-3">
                                    {val(data.or_number)}
                                </td>
                            </tr>
                            <tr>
                                <td className="p-2 bg-blue-200 font-bold text-blue-900 border-r border-black">
                                    DATE
                                </td>
                                <td className="p-2 text-gray-600 font-medium pl-3">
                                    {formatDate(data.or_date)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
