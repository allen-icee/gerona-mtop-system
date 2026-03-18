//GeronaMTOP\resources\js\Pages\Mtop\Partials\ClientMonitor.ts
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

export const formatExpiry = (
    data: any,
    activeEvents?: any[],
    holidays?: any[],
) => {
    if (data.is_manual_validity && data.valid_until) {
        return new Date(data.valid_until)
            .toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
            })
            .toUpperCase();
    }

    if (!data.transaction_date) return "-";

    let baseDate = new Date(data.transaction_date);
    let validUntil = new Date(baseDate);
    validUntil.setFullYear(validUntil.getFullYear() + 3);

    const currentEvent =
        activeEvents?.find((e: any) => e.id == data.event_id) ||
        activeEvents?.[0];

    const holidayList = (holidays || []).map((h) => {
        const m = String(h.month).padStart(2, "0");
        const d = String(h.day).padStart(2, "0");
        return `${m}-${d}`;
    });

<<<<<<< HEAD
    // ==============================================================
    // FRONTEND FIX: Verify if the selected date falls within the Event
    // ==============================================================
=======
>>>>>>> efed82f183c2c1a8c7535be20c3a5c5fd5e4abb3
    let isWithinEvent = false;
    if (currentEvent && currentEvent.start_date && currentEvent.end_date) {
        const tDate = new Date(data.transaction_date);
        tDate.setHours(0, 0, 0, 0);
        const eStart = new Date(currentEvent.start_date);
        eStart.setHours(0, 0, 0, 0);
        const eEnd = new Date(currentEvent.end_date);
        eEnd.setHours(23, 59, 59, 999);

        if (tDate >= eStart && tDate <= eEnd) {
            isWithinEvent = true;
        }
    }

<<<<<<< HEAD
    // Only apply the fixed date if the transaction date is WITHIN the promo
=======
>>>>>>> efed82f183c2c1a8c7535be20c3a5c5fd5e4abb3
    if (data.event_id && currentEvent && isWithinEvent) {
        if (data.is_free) {
            validUntil = new Date(currentEvent.fixed_expiry_date + "T00:00:00");
        } else {
            let anchorDate = new Date(
                currentEvent.fixed_expiry_date + "T00:00:00",
            );
            anchorDate.setDate(anchorDate.getDate() + 1);

            while (true) {
                const dayOfWeek = anchorDate.getDay();
                const m = String(anchorDate.getMonth() + 1).padStart(2, "0");
                const d = String(anchorDate.getDate()).padStart(2, "0");
                const mmdd = `${m}-${d}`;

                if (
                    dayOfWeek === 0 ||
                    dayOfWeek === 6 ||
                    holidayList.includes(mmdd)
                ) {
                    anchorDate.setDate(anchorDate.getDate() + 1);
                } else {
                    break;
                }
            }

            validUntil = new Date(anchorDate);
            validUntil.setFullYear(validUntil.getFullYear() + 3);
        }
    }

    // If it's NOT a free promo (or if the date was outside the promo range), do standard calculation
    if (
        (!data.is_free || !isWithinEvent) &&
        data.plate_no &&
        data.plate_no !== "FOR REGISTRATION"
    ) {
        let year = validUntil.getFullYear();
        let targetMonth = validUntil.getMonth();

        let targetDay = validUntil.getDate();

        const match = data.plate_no.match(/(\d)[^\d]*$/);
        if (match) {
            const digit = parseInt(match[1], 10);
            targetMonth = digit === 0 ? 9 : digit - 1;
        }

        const daysInMonth = new Date(year, targetMonth + 1, 0).getDate();
        const finalDay = Math.min(targetDay, daysInMonth);
        validUntil = new Date(year, targetMonth, finalDay);
    }

    while (true) {
        const dayOfWeek = validUntil.getDay();
        const m = String(validUntil.getMonth() + 1).padStart(2, "0");
        const d = String(validUntil.getDate()).padStart(2, "0");
        const mmdd = `${m}-${d}`;

        if (dayOfWeek === 0 || dayOfWeek === 6 || holidayList.includes(mmdd)) {
            validUntil.setDate(validUntil.getDate() + 1);
        } else {
            break;
        }
    }

    return validUntil
        .toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        })
        .toUpperCase();
};

export const generatePayload = (
    data: any,
    activeEvents?: any[],
    holidays?: any[],
) => {
    const plateDisplay =
        data.plate_no === "FOR REGISTRATION"
            ? '<span style="color: #ea580c;">FOR REGISTRATION</span>'
            : val(data.plate_no);

    const bodyDisplay = data.body_number
        ? `<br><span style="color: #6b7280; font-size: 12pt;">(#${data.body_number})</span>`
        : "";

    let orNumberDisplay = val(data.or_number);
    let controlNumberDisplay = val(data.mt_number);

    if (data.transaction_type === "Transfer") {
        controlNumberDisplay += ` <span style="color: #9333ea; font-size: 10pt; font-weight: bold;">(TRANSFER)</span>`;
    }

    const currentEvent =
        activeEvents?.find((e: any) => e.id == data.event_id) ||
        activeEvents?.[0];

<<<<<<< HEAD
    // Check date range again for the OR text display
=======
>>>>>>> efed82f183c2c1a8c7535be20c3a5c5fd5e4abb3
    let isWithinEvent = false;
    if (
        data.transaction_date &&
        currentEvent &&
        currentEvent.start_date &&
        currentEvent.end_date
    ) {
        const tDate = new Date(data.transaction_date);
        tDate.setHours(0, 0, 0, 0);
        const eStart = new Date(currentEvent.start_date);
        eStart.setHours(0, 0, 0, 0);
        const eEnd = new Date(currentEvent.end_date);
        eEnd.setHours(23, 59, 59, 999);
        if (tDate >= eStart && tDate <= eEnd) {
            isWithinEvent = true;
        }
    }

<<<<<<< HEAD
    // Only say "WAIVED (Mandate)" if the date is actually inside the promo
=======
>>>>>>> efed82f183c2c1a8c7535be20c3a5c5fd5e4abb3
    if (
        data.is_free &&
        orNumberDisplay === "WAIVED" &&
        data.event_id &&
        isWithinEvent
    ) {
        if (currentEvent && currentEvent.mandated_by) {
            orNumberDisplay = `WAIVED <span style="font-size: 10pt; font-weight: normal; color: #4b5563;"><br>(${currentEvent.mandated_by})</span>`;
        }
    } else if (data.is_free && orNumberDisplay === "WAIVED" && !isWithinEvent) {
<<<<<<< HEAD
        // Strip the WAIVED text if they backdated outside the promo
=======
>>>>>>> efed82f183c2c1a8c7535be20c3a5c5fd5e4abb3
        orNumberDisplay = "-";
    }

    return {
        name: val(formatName(data)),
        mt_number: controlNumberDisplay,
        date: formatDate(data.transaction_date),
        address: val(data.address).replace(
            /(,\s*GERONA,\s*TARLAC|\s*GERONA,\s*TARLAC)/i,
            "",
        ),
        expiry: formatExpiry(data, activeEvents, holidays),
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

let clientMonitorWindow: Window | null = null;

export const updateClientMonitor = (
    data: any,
    activeEvents?: any[],
    holidays?: any[],
) => {
    if (clientMonitorWindow && !clientMonitorWindow.closed) {
        clientMonitorWindow.postMessage(
            {
                type: "UPDATE_DATA",
                payload: generatePayload(data, activeEvents, holidays),
            },
            "*",
        );
    }
};

export const openClientMonitor = (
    data: any,
    activeEvents?: any[],
    holidays?: any[],
) => {
    if (clientMonitorWindow && !clientMonitorWindow.closed) {
        clientMonitorWindow.focus();
        updateClientMonitor(data, activeEvents, holidays);
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

    const payload = generatePayload(data, activeEvents, holidays);

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
                        <tr><td class="label">BARANGAY</td><td class="value" id="c-address">${payload.address}</td></tr>
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
                            if (el) {
                                // If updating the address, append Gerona Tarlac to match the initial render
                                if (key === 'address') {
                                    el.innerHTML = p[key] + ', GERONA TARLAC';
                                } else {
                                    el.innerHTML = p[key];
                                }
                            }
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
