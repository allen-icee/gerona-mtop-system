//GeronaMTOP\resources\js\Pages\Mtop\Partials\PermitPreview.tsx
import { Icon } from "@iconify/react";
import React, { useState, useRef, useEffect } from "react";

export default function PermitPreview({
    data,
    showHeader = true,
}: {
    data: any;
    showHeader?: boolean;
}) {
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                if (e.deltaY < 0) {
                    setScale((s) => Math.min(s + 0.1, 2.5));
                } else {
                    setScale((s) => Math.max(s - 0.1, 0.5));
                }
            }
        };

        el.addEventListener("wheel", handleWheel, { passive: false });
        return () => el.removeEventListener("wheel", handleWheel);
    }, []);

    const formattedName =
        `${data.last_name || ""} ${data.suffix || ""}, ${data.first_name || ""} ${data.middle_name ? data.middle_name + "." : ""} `
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
        <div
            ref={containerRef}
            className="font-sans w-full h-full overflow-auto relative rounded-b-lg"
        >
            {showHeader && (
                <div className="bg-gray-800 text-white py-3 px-4 font-bold uppercase tracking-wider text-[12pt] flex justify-between items-center border-b border-black sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <Icon icon="solar:document-text-bold" width="20" />
                        Information Preview
                    </div>
                    <div className="flex items-center gap-2 text-[10pt] font-medium opacity-80 normal-case tracking-normal">
                        <Icon icon="solar:mouse-circle-bold" width="18" />
                        <span className="hidden sm:inline">
                            Ctrl + Scroll to Zoom
                        </span>
                        <span className="sm:hidden">Pinch to Zoom</span>
                    </div>
                </div>
            )}

            <div className="p-4 sm:p-6 origin-top" style={{ zoom: scale }}>
                <div className="mb-5">
                    <table className="w-full border-collapse border border-black bg-white shadow-sm table-fixed text-[12pt]">
                        <tbody>
                            <tr className="border-b border-black">
                                <td className="px-3 py-2 bg-blue-200 font-bold w-[35%] sm:w-[30%] text-blue-900 border-r border-black align-top leading-tight">
                                    NAME
                                </td>
                                <td className="px-3 py-2 font-bold text-gray-900 align-top wrap-break-words leading-tight text-[13pt]">
                                    {val(formattedName)}
                                </td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="px-3 py-2 bg-blue-200 font-bold text-blue-900 border-r border-black align-top leading-tight">
                                    USAPIN BILANG
                                </td>
                                <td className="px-3 py-2 font-bold text-red-600 align-top leading-tight text-[13pt]">
                                    {val(data.mt_number)}
                                </td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="px-3 py-2 bg-blue-200 font-bold text-blue-900 border-r border-black align-top leading-tight">
                                    DATE
                                </td>
                                <td className="px-3 py-2 font-bold text-gray-800 align-top leading-tight">
                                    {formatDate(data.transaction_date)}
                                </td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="px-3 py-2 bg-blue-200 font-bold text-blue-900 border-r border-black align-top leading-tight">
                                    BARANGAY
                                </td>
                                <td className="px-3 py-2 font-bold text-gray-800 align-top wrap-break-words leading-tight">
                                    {val(data.address).replace(
                                        /(,\s*GERONA,\s*TARLAC|\s*GERONA,\s*TARLAC)/i,
                                        "",
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2 bg-blue-200 font-bold text-blue-900 border-r border-black align-top leading-tight">
                                    EXPIRY DATE
                                </td>
                                <td className="px-3 py-2 font-bold text-gray-800 align-top leading-tight">
                                    {formatExpiry(data.transaction_date)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mb-5">
                    <table className="w-full border-collapse border border-black bg-white text-center shadow-sm table-fixed">
                        <thead>
                            <tr className="bg-blue-300 text-blue-900 font-bold uppercase border-b border-black text-[11pt] leading-tight">
                                <th className="px-2 py-2 border-r border-black w-1/4 align-middle">
                                    GAWA AT URI
                                </th>
                                <th className="px-2 py-2 border-r border-black w-1/4 align-middle">
                                    MOTOR BILANG
                                </th>
                                <th className="px-2 py-2 border-r border-black w-1/4 align-middle">
                                    TSASI BILANG
                                </th>
                                <th className="px-2 py-2 w-1/4 align-middle">
                                    PLAKA BILANG
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="px-2 py-2 border-r border-black font-bold text-gray-800 wrap-break-words align-top leading-tight text-[12pt]">
                                    {val(data.make_type)}
                                </td>
                                <td className="px-2 py-2 border-r border-black font-bold text-gray-800 wrap-break-words align-top leading-tight text-[12pt]">
                                    {val(data.engine_motor_no)}
                                </td>
                                <td className="px-2 py-2 border-r border-black font-bold text-gray-800 wrap-break-words align-top leading-tight text-[12pt]">
                                    {val(data.chassis_no)}
                                </td>
                                <td className="px-2 py-2 font-bold text-blue-700 wrap-break-words align-top leading-tight text-[12pt]">
                                    {data.plate_no === "FOR REGISTRATION" ? (
                                        <span className="text-orange-600 block">
                                            FOR REGISTRATION
                                        </span>
                                    ) : (
                                        val(data.plate_no)
                                    )}
                                    {data.body_number && (
                                        <div className="text-gray-500 font-bold mt-1">
                                            (#{data.body_number})
                                        </div>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <table className="w-full border-collapse border border-black bg-white text-[12pt] shadow-sm table-fixed">
                        <thead>
                            <tr className="bg-blue-300 text-blue-900 border-b border-black">
                                <th
                                    colSpan={2}
                                    className="px-3 py-2 font-bold text-center leading-tight"
                                >
                                    CEDULA
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-black">
                                <td className="px-3 py-2 bg-blue-200 font-bold text-blue-900 w-[40%] border-r border-black align-top leading-tight">
                                    NUMBER
                                </td>
                                <td className="px-3 py-2 font-mono font-bold text-gray-800 wrap-break-words align-top leading-tight">
                                    {val(data.cedula_number)}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2 bg-blue-200 font-bold text-blue-900 border-r border-black align-top leading-tight">
                                    DATE
                                </td>
                                <td className="px-3 py-2 font-bold text-gray-800 wrap-break-words align-top leading-tight">
                                    {formatDate(data.cedula_date)}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <table className="w-full border-collapse border border-black bg-white text-[12pt] shadow-sm table-fixed">
                        <thead>
                            <tr className="bg-blue-300 text-blue-900 border-b border-black">
                                <th
                                    colSpan={2}
                                    className="px-3 py-2 font-bold text-center leading-tight"
                                >
                                    OFFICIAL RECEIPT
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-black">
                                <td className="px-3 py-2 bg-blue-200 font-bold text-blue-900 w-[40%] border-r border-black align-top leading-tight">
                                    NUMBER
                                </td>
                                <td className="px-3 py-2 font-mono font-bold text-gray-800 wrap-break-words align-top leading-tight">
                                    {val(data.or_number)}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2 bg-blue-200 font-bold text-blue-900 border-r border-black align-top leading-tight">
                                    DATE
                                </td>
                                <td className="px-3 py-2 font-bold text-gray-800 wrap-break-words align-top leading-tight">
                                    {formatDate(data.or_date)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <table className="w-full border-collapse border border-black bg-white text-[12pt] shadow-sm table-fixed">
                    <thead>
                        <tr className="bg-blue-300 text-blue-900 border-b border-black">
                            <th
                                colSpan={2}
                                className="px-3 py-2 font-bold text-center uppercase tracking-wider leading-tight"
                            >
                                Signatories
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-black">
                            <td className="px-3 py-2 bg-blue-200 font-bold text-blue-900 w-[45%] sm:w-[35%] border-r border-black align-top leading-tight">
                                Auth. Official
                            </td>
                            <td className="px-3 py-2 font-bold text-gray-800 uppercase wrap-break-words align-top leading-tight">
                                {val(data.authorized_official)}
                            </td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2 bg-blue-200 font-bold text-blue-900 border-r border-black align-top leading-tight">
                                Punong Bayan
                            </td>
                            <td className="px-3 py-2 font-bold text-gray-800 uppercase wrap-break-words align-top leading-tight">
                                {val(data.punong_bayan)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
