import { Icon } from "@iconify/react";
import React, { useState, useRef, useEffect } from "react";

export const val = (text?: string) => (text ? String(text).toUpperCase() : "-");

export const formatName = (data: any) => {
    if (!data.last_name && !data.first_name) return "";
    return `${data.last_name || ""} ${data.suffix || ""}, ${data.first_name || ""} ${data.middle_name ? data.middle_name + "." : ""} `
        .trim()
        .toUpperCase();
};

export const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString)
        .toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        .toUpperCase();
};

// Perfectly mirrored Backend Math for Dynamic Events
export const formatExpiry = (data: any, activeEvents?: any[]) => {
    if (!data.transaction_date) return "-";

    let baseDate = new Date(data.transaction_date);
    let validUntil = new Date(baseDate);
    validUntil.setFullYear(validUntil.getFullYear() + 3);

    const currentEvent =
        activeEvents?.find((e: any) => e.id == data.event_id) ||
        activeEvents?.[0];

    // Event Logic
    if (data.event_id && currentEvent) {
        if (data.is_free) {
            // Route A: Free (Strictly follows the event expiry)
            return new Date(currentEvent.fixed_expiry_date + "T00:00:00")
                .toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                })
                .toUpperCase();
        } else {
            // Route B: Paid Bonus (Start 3-year contract on the next working day)
            let anchorDate = new Date(
                currentEvent.fixed_expiry_date + "T00:00:00",
            );
            anchorDate.setDate(anchorDate.getDate() + 1);

            // Skip weekends
            while (anchorDate.getDay() === 0 || anchorDate.getDay() === 6) {
                anchorDate.setDate(anchorDate.getDate() + 1);
            }

            validUntil = new Date(anchorDate);
            validUntil.setFullYear(validUntil.getFullYear() + 3);
        }
    }

    let year = validUntil.getFullYear();
    let targetMonth = validUntil.getMonth();
    let targetDay = validUntil.getDate();

    // Plate Number Adjustment
    if (data.plate_no && data.plate_no !== "FOR REGISTRATION") {
        const match = data.plate_no.match(/(\d)[^\d]*$/);
        if (match) {
            const digit = parseInt(match[1], 10);
            targetMonth = digit === 0 ? 9 : digit - 1;
            targetDay = baseDate.getDate(); // Always keep the exact day they transacted
        }
    }

    const daysInMonth = new Date(year, targetMonth + 1, 0).getDate();
    const finalDay = Math.min(targetDay, daysInMonth);
    const expiry = new Date(year, targetMonth, finalDay);

    return expiry
        .toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        })
        .toUpperCase();
};

// --- GLOBAL LIVE CASTING VARIABLES ---
let clientMonitorWindow: Window | null = null;

const generatePayload = (data: any, activeEvents?: any[]) => {
    const plateDisplay =
        data.plate_no === "FOR REGISTRATION"
            ? '<span style="color: #ea580c;">FOR REGISTRATION</span>'
            : val(data.plate_no);

    const bodyDisplay = data.body_number
        ? `<br><span style="color: #6b7280; font-size: 12pt;">(#${data.body_number})</span>`
        : "";

    let orNumberDisplay = val(data.or_number);

    // Auto-inject the formal Mandate into the Receipt field
    if (data.is_free && orNumberDisplay === "WAIVED" && data.event_id) {
        const currentEvent =
            activeEvents?.find((e: any) => e.id == data.event_id) ||
            activeEvents?.[0];
        if (currentEvent && currentEvent.mandated_by) {
            orNumberDisplay = `WAIVED <span style="font-size: 10pt; font-weight: normal; color: #4b5563;"><br>(${currentEvent.mandated_by})</span>`;
        }
    }

    return {
        name: val(formatName(data)),
        mt_number: val(data.mt_number),
        date: formatDate(data.transaction_date),
        address: val(data.address).replace(
            /(,\s*GERONA,\s*TARLAC|\s*GERONA,\s*TARLAC)/i,
            "",
        ),
        expiry: formatExpiry(data, activeEvents),
        make_type: val(data.make_type),
        engine_motor_no: val(data.engine_motor_no),
        chassis_no: val(data.chassis_no),
        plate_no_display: plateDisplay + bodyDisplay,
        cedula_number: val(data.cedula_number),
        cedula_date: formatDate(data.cedula_date),
        or_number: orNumberDisplay,
        or_date: formatDate(data.or_date),
        authorized_official: val(data.authorized_official),
        punong_bayan: val(data.punong_bayan),
    };
};

export const updateClientMonitor = (data: any, activeEvents?: any[]) => {
    if (clientMonitorWindow && !clientMonitorWindow.closed) {
        clientMonitorWindow.postMessage(
            {
                type: "UPDATE_DATA",
                payload: generatePayload(data, activeEvents),
            },
            "*",
        );
    }
};

export const openClientMonitor = (data: any, activeEvents?: any[]) => {
    if (clientMonitorWindow && !clientMonitorWindow.closed) {
        clientMonitorWindow.focus();
        updateClientMonitor(data, activeEvents);
        return;
    }

    clientMonitorWindow = window.open(
        "",
        "ClientPreview",
        "width=1000,height=800,menubar=no,toolbar=no,status=no",
    );

    if (!clientMonitorWindow) {
        alert(
            "Pop-up blocked. Please allow pop-ups to use the casting feature.",
        );
        return;
    }

    const payload = generatePayload(data, activeEvents);

    clientMonitorWindow.document.write(`
        <html>
        <head>
            <title>Client Review Monitor</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                body { background: #e5e7eb; display: flex; align-items: flex-start; justify-content: center; min-height: 100vh; margin: 0; padding: 2rem; font-family: ui-sans-serif, system-ui, sans-serif; overflow-y: auto; }
                #zoom-wrapper { width: 100%; max-width: 1100px; transform-origin: top center; margin-top: 2rem; margin-bottom: 4rem; transition: zoom 0.1s ease; }
                .container { background: white; padding: 3rem; border-radius: 1.5rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); width: 100%; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 14pt; }
                td, th { border: 2px solid #111827; padding: 1rem; }
                .label { background-color: #bfdbfe; color: #1e3a8a; font-weight: bold; width: 35%; text-transform: uppercase; }
                .value { font-weight: 900; color: #111827; text-transform: uppercase; }
                .header-table th { background-color: #93c5fd; color: #1e3a8a; font-weight: bold; text-align: center; font-size: 13pt; text-transform: uppercase; letter-spacing: 0.05em; }
                .help-toast { position: fixed; top: 1rem; right: 1rem; background: rgba(17, 24, 39, 0.8); color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: bold; pointer-events: none; z-index: 50; }
            </style>
        </head>
        <body>
            <div class="help-toast">Ctrl + Scroll to Zoom</div>
            <div id="zoom-wrapper">
                <div class="container">
                    <div style="text-align: center; margin-bottom: 2rem; border-bottom: 4px solid #111827; padding-bottom: 1rem;">
                        <h1 class="text-4xl font-black uppercase text-gray-900 m-0 tracking-tight">Information Preview</h1>
                        <p class="text-gray-500 font-bold mt-2 text-lg">Please verify if all details below are correct.</p>
                    </div>

                    <table>
                        <tr><td class="label">NAME</td><td class="value text-2xl" id="c-name">${payload.name}</td></tr>
                        <tr><td class="label">USAPIN BILANG</td><td class="value text-red-600 text-2xl" id="c-mt_number">${payload.mt_number}</td></tr>
                        <tr><td class="label">DATE</td><td class="value" id="c-date">${payload.date}</td></tr>
                        <tr><td class="label">BARANGAY</td><td class="value" id="c-address">${payload.address}, GERONA TARLAC</td></tr>
                        <tr><td class="label">EXPIRY DATE</td><td class="value text-indigo-700" id="c-expiry">${payload.expiry}</td></tr>
                    </table>

                    <table>
                        <tr class="header-table">
                            <th>GAWA AT URI</th>
                            <th>MOTOR BILANG</th>
                            <th>TSASI BILANG</th>
                            <th>PLAKA BILANG</th>
                        </tr>
                        <tr style="text-align: center;">
                            <td class="value" id="c-make_type">${payload.make_type}</td>
                            <td class="value" id="c-engine_motor_no">${payload.engine_motor_no}</td>
                            <td class="value" id="c-chassis_no">${payload.chassis_no}</td>
                            <td class="value text-blue-700" id="c-plate_no_display">${payload.plate_no_display}</td>
                        </tr>
                    </table>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <table>
                            <tr class="header-table"><th colspan="2">CEDULA</th></tr>
                            <tr><td class="label" style="width: 40%;">NUMBER</td><td class="value font-mono tracking-wider" id="c-cedula_number">${payload.cedula_number}</td></tr>
                            <tr><td class="label">DATE</td><td class="value" id="c-cedula_date">${payload.cedula_date}</td></tr>
                        </table>
                        <table>
                            <tr class="header-table"><th colspan="2">OFFICIAL RECEIPT</th></tr>
                            <tr><td class="label" style="width: 40%;">NUMBER</td><td class="value font-mono tracking-wider" id="c-or_number">${payload.or_number}</td></tr>
                            <tr><td class="label">DATE</td><td class="value" id="c-or_date">${payload.or_date}</td></tr>
                        </table>
                    </div>

                    <table>
                        <tr class="header-table"><th colspan="2">SIGNATORIES</th></tr>
                        <tr><td class="label" style="width: 40%;">AUTHORIZED OFFICIAL</td><td class="value" id="c-authorized_official">${payload.authorized_official}</td></tr>
                        <tr><td class="label">PUNONG BAYAN</td><td class="value" id="c-punong_bayan">${payload.punong_bayan}</td></tr>
                    </table>
                </div>
            </div>

            <script>
                // LIVE UPDATE LOGIC
                window.addEventListener('message', (event) => {
                    if (event.data && event.data.type === 'UPDATE_DATA') {
                        const p = event.data.payload;
                        for (const key in p) {
                            const el = document.getElementById('c-' + key);
                            if (el) el.innerHTML = p[key];
                        }
                    }
                });

                // ZOOM LOGIC
                let currentScale = 1;
                const zoomWrapper = document.getElementById('zoom-wrapper');

                window.addEventListener('wheel', (e) => {
                    if (e.ctrlKey) {
                        e.preventDefault();
                        if (e.deltaY < 0) {
                            currentScale = Math.min(currentScale + 0.1, 2.5);
                        } else {
                            currentScale = Math.max(currentScale - 0.1, 0.5);
                        }
                        zoomWrapper.style.zoom = currentScale;
                    }
                }, { passive: false });
            </script>
        </body>
        </html>
    `);
    clientMonitorWindow.document.close();
};

export default function PermitPreview({
    data,
    showHeader = true,
    activeEvents,
}: {
    data: any;
    showHeader?: boolean;
    activeEvents?: any[];
}) {
    const [scale, setScale] = useState(1);
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

    const payload = generatePayload(data, activeEvents);

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
                        onClick={() => openClientMonitor(data, activeEvents)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-md text-[10pt] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors active:scale-95 shadow-sm border border-blue-400"
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
                                Signatories
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
