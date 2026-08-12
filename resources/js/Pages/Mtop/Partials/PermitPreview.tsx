//GeronaMTOP\resources\js\Pages\Mtop\Partials\PermitPreview.tsx
import { Icon } from "@iconify/react";
import React, { useState, useRef, useEffect } from "react";
import { openClientMonitor, generatePayload } from "./ClientMonitor";

export { updateClientMonitor, formatExpiry } from "./ClientMonitor";

export default function PermitPreview({
    data,
    showHeader = true,
    activeEvents,
    holidays,
}: {
    data: any;
    showHeader?: boolean;
    activeEvents?: any[];
    holidays?: any[];
}) {
    const [scale, setScale] = useState(0.85);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                setScale((s) =>
                    e.deltaY < 0
                        ? Math.min(s + 0.1, 2.5)
                        : Math.max(s - 0.1, 0.5),
                );
            }
        };
        el.addEventListener("wheel", handleWheel, { passive: false });
        return () => el.removeEventListener("wheel", handleWheel);
    }, []);

    const payload = generatePayload(data, activeEvents, holidays);

    return (
        <div
            ref={containerRef}
            className="font-sans w-full h-full overflow-auto relative rounded-b-lg"
        >
            {showHeader && (
                <div className="bg-gray-800 text-white py-3 px-4 flex justify-between items-center border-b border-black sticky top-0 z-10">
                    <div className="flex items-center gap-1.5 text-[10pt] font-medium opacity-80">
                        <Icon icon="solar:mouse-circle-bold" width="18" />
                        <span className="hidden sm:inline">
                            Ctrl + Scroll to Zoom
                        </span>
                        <span className="sm:hidden">Pinch to Zoom</span>
                    </div>
                    <button
                        type="button"
                        onClick={() =>
                            openClientMonitor(data, activeEvents, holidays)
                        }
                        className="bg-blue-600 hover:bg-blue-500 hover:cursor-pointer text-white px-4 py-1.5 rounded-md text-[10pt] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors active:scale-95 shadow-sm border border-blue-400"
                    >
                        <Icon icon="solar:monitor-smartphone-bold" width="18" />{" "}
                        Cast to Screen
                    </button>
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
                                <td className="px-3 py-2 font-bold text-gray-900 align-top wrap-break-words whitespace-normal break-all leading-tight text-[13pt]">
                                    {payload.name}
                                </td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="px-3 py-2 bg-blue-200 font-bold text-blue-900 border-r border-black align-top leading-tight">
                                    USAPIN BILANG
                                </td>
                                <td className="px-3 py-2 font-bold text-red-600 align-top wrap-break-words whitespace-normal break-all leading-tight text-[13pt]">
                                    {payload.mt_number}
                                </td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="px-3 py-2 bg-blue-200 font-bold text-blue-900 border-r border-black align-top leading-tight">
                                    DATE
                                </td>
                                <td className="px-3 py-2 font-bold text-gray-800 align-top leading-tight">
                                    {payload.date}
                                </td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="px-3 py-2 bg-blue-200 font-bold text-blue-900 border-r border-black align-top leading-tight">
                                    BARANGAY
                                </td>
                                <td className="px-3 py-2 font-bold text-gray-800 align-top wrap-break-words whitespace-normal break-all leading-tight">
                                    {payload.address}, GERONA TARLAC
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2 bg-blue-200 font-bold text-blue-900 border-r border-black align-top leading-tight">
                                    EXPIRY DATE
                                </td>
                                <td className="px-3 py-2 font-bold text-indigo-700 align-top leading-tight">
                                    {payload.expiry}
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
                                <td className="px-2 py-2 border-r border-black font-bold text-gray-800 wrap-break-words whitespace-normal break-all align-top leading-tight text-[12pt]">
                                    {payload.make_type}
                                </td>
                                <td className="px-2 py-2 border-r border-black font-bold text-gray-800 wrap-break-words whitespace-normal break-all align-top leading-tight text-[12pt]">
                                    {payload.engine_motor_no}
                                </td>
                                <td className="px-2 py-2 border-r border-black font-bold text-gray-800 wrap-break-words whitespace-normal break-all align-top leading-tight text-[12pt]">
                                    {payload.chassis_no}
                                </td>
                                <td
                                    className="px-2 py-2 font-bold text-blue-700 wrap-break-words whitespace-normal break-all align-top leading-tight text-[10pt]"
                                    dangerouslySetInnerHTML={{
                                        __html: payload.plate_no_display,
                                    }}
                                />
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
                                <td className="px-3 py-2 font-mono font-bold text-gray-800 wrap-break-words whitespace-normal break-all align-top leading-tight">
                                    {payload.cedula_number}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-2 bg-blue-200 font-bold text-blue-900 border-r border-black align-top leading-tight">
                                    DATE
                                </td>
                                <td className="px-3 py-2 font-bold text-gray-800 wrap-break-words whitespace-normal break-all align-top leading-tight">
                                    {payload.cedula_date}
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
                                <td
                                    className="px-3 py-2 font-mono font-bold text-gray-800 wrap-break-words whitespace-normal break-all align-top leading-tight"
                                    dangerouslySetInnerHTML={{
                                        __html: payload.or_number,
                                    }}
                                />
                            </tr>
                            <tr>
                                <td className="px-3 py-2 bg-blue-200 font-bold text-blue-900 border-r border-black align-top leading-tight">
                                    DATE
                                </td>
                                <td className="px-3 py-2 font-bold text-gray-800 wrap-break-words whitespace-normal break-all align-top leading-tight">
                                    {payload.or_date}
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
                                SIGNATORIES
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-black">
                            <td className="px-3 py-2 bg-blue-200 font-bold text-blue-900 w-[45%] sm:w-[35%] border-r border-black align-top leading-tight">
                                AUTHORIZED OFFICIAL
                            </td>
                            <td className="px-3 py-2 font-bold text-gray-800 uppercase wrap-break-words whitespace-normal break-all align-top leading-tight">
                                {payload.authorized_official}
                            </td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2 bg-blue-200 font-bold text-blue-900 border-r border-black align-top leading-tight">
                                PUNONG BAYAN
                            </td>
                            <td className="px-3 py-2 font-bold text-gray-800 uppercase wrap-break-words whitespace-normal break-all align-top leading-tight">
                                {payload.punong_bayan}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
