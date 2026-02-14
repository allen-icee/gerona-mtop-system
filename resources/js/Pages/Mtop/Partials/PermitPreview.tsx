import { Icon } from "@iconify/react";

export default function PermitPreview({
    data,
    showHeader = true,
}: {
    data: any;
    showHeader?: boolean;
}) {
    // UPDATE: Added suffix to the fullName string logic
    const fullName = [
        data.last_name,
        data.first_name,
        data.middle_name ? `${data.middle_name}.` : "",
        data.suffix, // <--- Added this
    ]
        .filter(Boolean) // This removes empty strings if middle_name or suffix is missing
        .join(" ")
        .toUpperCase();

    // Alternative formatting if you want the "Last Name, First Name M.I. Suffix" style:
    const formattedName =
        `${data.last_name || ""}, ${data.first_name || ""} ${data.middle_name ? data.middle_name + "." : ""} ${data.suffix || ""}`
            .trim()
            .toUpperCase();

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
        <div className="bg-white font-sans w-full">
            {/* Header */}
            {showHeader && (
                <div className="bg-gray-800 text-white p-3 font-bold text-center uppercase tracking-wider text-sm flex items-center justify-center gap-2 border-b border-black">
                    <Icon icon="solar:document-text-bold" />
                    Information Preview
                </div>
            )}

            <div className="p-4 sm:p-8">
                {/* --- TABLE 1: MAIN INFO --- */}
                <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse border border-black bg-white text-xs sm:text-sm shadow-sm min-w-75">
                        <tbody>
                            <tr className="border-b border-black">
                                <td className="p-2 sm:p-3 bg-blue-200 font-bold w-1/3 text-blue-900 border-r border-black align-top">
                                    NAME
                                </td>
                                <td className="p-2 sm:p-3 font-bold text-gray-800 align-top">
                                    {/* UPDATE: Use the formattedName including suffix */}
                                    {val(formattedName)}
                                </td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="p-2 sm:p-3 bg-blue-200 font-bold text-blue-900 border-r border-black align-top">
                                    USAPIN BILANG
                                </td>
                                <td className="p-2 sm:p-3 font-bold text-red-600 align-top">
                                    {val(data.mt_number)}
                                </td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="p-2 sm:p-3 bg-blue-200 font-bold text-blue-900 border-r border-black align-top">
                                    DATE
                                </td>
                                <td className="p-2 sm:p-3 font-medium text-gray-800 align-top">
                                    {formatDate(data.transaction_date)}
                                </td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="p-2 sm:p-3 bg-blue-200 font-bold text-blue-900 border-r border-black align-top">
                                    BARANGAY
                                </td>
                                <td className="p-2 sm:p-3 font-medium text-gray-800 align-top">
                                    {val(data.address)}
                                </td>
                            </tr>
                            <tr>
                                <td className="p-2 sm:p-3 bg-blue-200 font-bold text-blue-900 border-r border-black align-top">
                                    EXPIRY DATE
                                </td>
                                <td className="p-2 sm:p-3 font-bold text-gray-800 align-top">
                                    {formatExpiry(data.transaction_date)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* --- TABLE 2: UNIT --- */}
                <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse border border-black bg-white text-[10px] sm:text-xs text-center shadow-sm min-w-75">
                        <thead>
                            <tr className="bg-blue-300 text-blue-900 font-bold uppercase border-b border-black text-[10px] sm:text-xs">
                                <th className="p-2 sm:p-3 border-r border-black w-1/4 align-top">
                                    GAWA AT URI
                                </th>
                                <th className="p-2 sm:p-3 border-r border-black w-1/4 align-top">
                                    MOTOR BILANG
                                </th>
                                <th className="p-2 sm:p-3 border-r border-black w-1/4 align-top">
                                    TSASI BILANG
                                </th>
                                <th className="p-2 sm:p-3 w-1/4 align-top">
                                    PLAKA BILANG
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-2 sm:p-3 border-r border-black font-bold text-gray-700 text-xs sm:text-sm align-top">
                                    {val(data.make_type)}
                                </td>
                                <td className="p-2 sm:p-3 border-r border-black font-bold text-gray-700 text-xs sm:text-sm align-top">
                                    {val(data.engine_motor_no)}
                                </td>
                                <td className="p-2 sm:p-3 border-r border-black font-bold text-gray-700 text-xs sm:text-sm align-top">
                                    {val(data.chassis_no)}
                                </td>
                                <td className="p-2 sm:p-3 font-bold text-blue-700 text-xs sm:text-sm align-top">
                                    {val(data.plate_no)}
                                    {data.body_number ? (
                                        <div className="text-gray-500 font-normal">
                                            (#{data.body_number})
                                        </div>
                                    ) : null}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* --- TABLE 3 & 4: DOCS --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                    {/* CEDULA */}
                    <table className="w-full border-collapse border border-black bg-white text-xs sm:text-sm shadow-sm">
                        <thead>
                            <tr className="bg-blue-300 text-blue-900 border-b border-black">
                                <th
                                    colSpan={2}
                                    className="p-2 sm:p-3 font-bold text-center"
                                >
                                    CEDULA
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-black">
                                <td className="p-2 sm:p-3 bg-blue-200 font-bold text-blue-900 w-1/3 border-r border-black align-top">
                                    NUMBER
                                </td>
                                <td className="p-2 sm:p-3 font-mono font-bold text-gray-800 pl-3 align-top">
                                    {val(data.cedula_number)}
                                </td>
                            </tr>
                            <tr>
                                <td className="p-2 sm:p-3 bg-blue-200 font-bold text-blue-900 border-r border-black align-top">
                                    DATE
                                </td>
                                <td className="p-2 sm:p-3 text-gray-600 font-medium pl-3 align-top">
                                    {formatDate(data.cedula_date)}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* OFFICIAL RECEIPT */}
                    <table className="w-full border-collapse border border-black bg-white text-xs sm:text-sm shadow-sm">
                        <thead>
                            <tr className="bg-blue-300 text-blue-900 border-b border-black">
                                <th
                                    colSpan={2}
                                    className="p-2 sm:p-3 font-bold text-center"
                                >
                                    OFFICIAL RECEIPT
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-black">
                                <td className="p-2 sm:p-3 bg-blue-200 font-bold text-blue-900 w-1/3 border-r border-black align-top">
                                    NUMBER
                                </td>
                                <td className="p-2 sm:p-3 font-mono font-bold text-gray-800 pl-3 align-top">
                                    {val(data.or_number)}
                                </td>
                            </tr>
                            <tr>
                                <td className="p-2 sm:p-3 bg-blue-200 font-bold text-blue-900 border-r border-black align-top">
                                    DATE
                                </td>
                                <td className="p-2 sm:p-3 text-gray-600 font-medium pl-3 align-top">
                                    {formatDate(data.or_date)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* --- TABLE 5: SIGNATORIES --- */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-black bg-white text-xs sm:text-sm shadow-sm min-w-75">
                        <thead>
                            <tr className="bg-blue-300 text-blue-900 border-b border-black">
                                <th
                                    colSpan={2}
                                    className="p-2 sm:p-3 font-bold text-center uppercase tracking-wider"
                                >
                                    Signatories
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-black">
                                <td className="p-2 sm:p-3 bg-blue-200 font-bold text-blue-900 w-1/3 border-r border-black align-top">
                                    Authorized Official
                                </td>
                                <td className="p-2 sm:p-3 font-bold text-gray-800 pl-3 uppercase align-top">
                                    {val(data.authorized_official)}
                                </td>
                            </tr>
                            <tr>
                                <td className="p-2 sm:p-3 bg-blue-200 font-bold text-blue-900 border-r border-black align-top">
                                    Punong Bayan
                                </td>
                                <td className="p-2 sm:p-3 font-bold text-gray-800 pl-3 uppercase align-top">
                                    {val(data.punong_bayan)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
