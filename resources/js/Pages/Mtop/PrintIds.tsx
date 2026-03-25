import { Head } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import { toPng } from "html-to-image";
import toast from "react-hot-toast";

interface Props {
    applications: any[];
    settings: any;
}

export default function PrintIds({ applications, settings }: Props) {
    const idBackgroundUrl = settings?.id_background_path
        ? `/storage/${settings.id_background_path}`
        : "/images/ID_BG_1.png";

    const handleDownloadSingle = async (elementId: string, mtNumber: string) => {
        const element = document.getElementById(elementId);
        if (!element) return;
        const loadingToast = toast.loading("Exporting High-Res Image...");
        try {
            const image = await toPng(element, { pixelRatio: 4, backgroundColor: "#ffffff" });
            const link = document.createElement("a");
            link.href = image;
            const safeMtNumber = mtNumber ? mtNumber.replace(/[^a-zA-Z0-9-]/g, "_") : "Unknown";
            link.download = `MTOP_ID_${safeMtNumber}.png`;
            link.click();
            toast.success("Image exported successfully!", { id: loadingToast });
        } catch (error) {
            toast.error("Failed to export image.", { id: loadingToast });
        }
    };

    const handlePrintSingle = async (elementId: string) => {
        const element = document.getElementById(elementId);
        if (!element) return;
        const loadingToast = toast.loading("Preparing single ID for print...");
        try {
            const image = await toPng(element, { pixelRatio: 4, backgroundColor: "#ffffff" });
            const printWindow = window.open("", "_blank");
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Print Single ID</title>
                            <style>
                                @page { size: auto; margin: 0mm; }
                                body { margin: 0; display: flex; justify-content: center; align-items: flex-start; padding-top: 5mm; background: white; }
                                img { width: 3.75in; height: auto; }
                            </style>
                        </head>
                        <body>
                            <img src="${image}" />
                            <script>
                                window.onload = function() { window.focus(); setTimeout(() => { window.print(); }, 500); };
                            </script>
                        </body>
                    </html>
                `);
                printWindow.document.close();
            }
            toast.success("Ready to print!", { id: loadingToast });
        } catch (error) {
            toast.error("Failed to prepare ID.", { id: loadingToast });
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-500 p-8 print:p-0 print:bg-white flex flex-col items-center gap-4">
            <Head title="Print IDs" />

            <div className="no-print bg-white px-6 py-4 rounded-xl shadow-lg flex justify-between items-center w-[210mm] sticky top-4 z-50">
                <div className="flex items-center gap-3">
                    <Icon icon="solar:printer-bold" className="text-indigo-600" width="28" />
                    <div>
                        <h2 className="font-bold text-gray-800 leading-none">Print Options</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Use A4 Sheet or export single IDs</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => window.print()} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-colors cursor-pointer">
                        <Icon icon="solar:document-add-bold" width="18" /> Print All (A4 Sheet)
                    </button>
                </div>
            </div>

            <div className="mx-auto bg-white shadow-lg print:shadow-none w-[210mm] min-h-[297mm] grid grid-cols-2 content-start px-[2mm] py-[5mm]">
                {applications.map((app) => {
                    const mInitial = app.middle_name ? `${app.middle_name[0]}. ` : "";
                    const sfx = app.suffix ? ` ${app.suffix}` : "";
                    const operatorName = `${app.first_name} ${mInitial}${app.last_name}${sfx}`.trim().toUpperCase();

                    let paidByName = "";
                    if (app.show_paid_by) {
                        const pbInitial = app.paid_by_middle_name ? `${app.paid_by_middle_name[0]}. ` : "";
                        const pbSfx = app.paid_by_suffix ? ` ${app.paid_by_suffix}` : "";
                        paidByName = `${app.paid_by_first_name || ""} ${pbInitial}${app.paid_by_last_name || ""}${pbSfx}`.trim().toUpperCase();
                    }

                    let builtDriverName = "";
                    if (app.has_driver || app.driver_first_name || app.driver_last_name) {
                        const dInitial = app.driver_middle_name ? `${app.driver_middle_name[0]}. ` : "";
                        const dSfx = app.driver_suffix ? ` ${app.driver_suffix}` : "";
                        builtDriverName = `${app.driver_first_name || ""} ${dInitial}${app.driver_last_name || ""}${dSfx}`.trim().toUpperCase();
                    }

                    // Strict Resolution Match
                    let finalDriverName = "";
                    if (app.driver_name && app.driver_name.trim() !== "") {
                        finalDriverName = app.driver_name.trim().toUpperCase();
                    } else if (builtDriverName !== "") {
                        finalDriverName = builtDriverName;
                    } else if (app.show_paid_by && paidByName) {
                        finalDriverName = paidByName;
                    } else {
                        finalDriverName = operatorName;
                    }

                    return (
                        <div key={app.id} className="flex flex-col items-center justify-center p-2 break-inside-avoid">
                            <div className="no-print w-[4in] flex justify-end gap-2 mb-2">
                                <button onClick={() => handleDownloadSingle(`id-card-${app.id}`, app.mt_number)} className="flex items-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-colors shadow-sm cursor-pointer">
                                    <Icon icon="solar:download-square-bold" width="14" /> Export PNG
                                </button>
                                <button onClick={() => handlePrintSingle(`id-card-${app.id}`)} className="flex items-center gap-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-colors shadow-sm cursor-pointer">
                                    <Icon icon="solar:printer-minimalistic-bold" width="14" /> Print Single
                                </button>
                            </div>

                            <div id={`id-card-${app.id}`} className="w-[4in] h-132 border-2 border-black relative overflow-hidden font-sans flex flex-col px-[8mm] py-[2mm] shadow-sm print:shadow-none shrink-0 bg-white" style={{ backgroundImage: `url('${idBackgroundUrl}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
                                <div className="relative z-10 grid grid-cols-[60px_1fr] items-center mb-4">
                                    <div className="relative flex justify-center items-center h-full">
                                        <img src="/images/3DMunicipalLogo.png" alt="Gerona Logo" className="absolute max-w-none w-18 h-18 object-contain drop-shadow-md z-10" style={{ left: "-10px", top: "55%", transform: "translateY(-50%)" }} />
                                    </div>
                                    <div className="text-center leading-tight mt-0.75 mb-0 ml-0">
                                        <h1 className="text-[11pt] font-['LEMONMILK'] font-light uppercase tracking-wider [-webkit-text-stroke:1.5px_white] [paint-order:stroke_fill]">Republic of the Philippines</h1>
                                        <h1 className="text-[11pt] font-['LEMONMILK'] font-light uppercase tracking-wider [-webkit-text-stroke:1.5px_white] [paint-order:stroke_fill]">Province of Tarlac</h1>
                                        <h1 className="text-[11pt] font-['LEMONMILK'] font-bold uppercase tracking-wider [-webkit-text-stroke:1.5px_white] [paint-order:stroke_fill]">Municipality of Gerona</h1>
                                    </div>
                                </div>

                                <h1 className="relative z-10 text-center font-['UPBOLTERS'] text-[15pt] tracking-normal py-0 mb-1 leading-none scale-y-[1.5] origin-bottom [-webkit-text-stroke:2px_white] [paint-order:stroke_fill] drop-shadow-[.8px_.8px_0_rgba(0,0,0,0.75)]">
                                    MOTORIZED TRICYCLE OPERATOR'S PERMIT
                                </h1>

                                <div className="relative z-10 flex justify-between items-end gap-2 mb-1">
                                    <div className="w-[38.1mm] h-[38.1mm] border border-black bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                        {app.driver_photo_path ? (
                                            <img src={`/storage/${app.driver_photo_path}`} className="w-full h-full object-cover" alt="Driver" />
                                        ) : (
                                            <span className="text-[8px] font-bold text-gray-400">1.5in x 1.5in</span>
                                        )}
                                    </div>
                                    <div className="w-[50mm] flex flex-col items-center justify-end">
                                        <label className="text-[10.7pt] font-['KeepCalm'] font-bold uppercase leading-none -mb-1 tracking-wide text-center w-full [-webkit-text-stroke:.8px_white] [paint-order:stroke_fill] drop-shadow-[.8px_.8px_0_rgba(0,0,0,0.65)]">
                                            Sidecar Number
                                        </label>
                                        <div className="border border-black rounded-lg h-[15mm] w-full flex mt-1 items-center justify-center bg-white">
                                            <span className="text-5xl text-black font-['UPBOLTERS'] [-webkit-text-stroke:2px_white] [paint-order:stroke_fill] drop-shadow-[1px_1px_0_rgba(0,0,0,0.85)]">
                                                {app.body_number || "---"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 flex-1 flex flex-col justify-center space-y-0.5 px-0">
                                    <Field label="DRIVER'S SIGNATURE" value="" isSignature={true} height="13mm" />
                                    <Field label="DRIVER'S NAME" value={finalDriverName} height="7mm" />
                                    <Field label="OPERATOR'S NAME AND ADDRESS" value={`${operatorName} / ${app.address ? app.address.split(/Gerona|Tarlac/i)[0].replace(/,\s*$/, "").trim() : "---"}`} height="7mm" />
                                    <Field label="PLATE NUMBER" value={app.plate_no || "N/A"} height="7mm" />
                                    <Field label="MTOP EXPIRATION DATE" value={app.valid_until ? new Date(app.valid_until).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase() : "---"} height="7mm" />
                                </div>

                                <div className={`mt-4.5 relative z-10 flex items-end pb-1 ${app.show_committee ? "justify-between" : "justify-center"}`}>
                                    {app.show_committee && (
                                        <div className="text-center w-36 flex flex-col items-center">
                                            <div className="text-[8pt] font-['ArialNarrow7'] font-bold uppercase truncate px-1 tracking-tighter w-full scale-y-[1.2] origin-bottom pb-1 [-webkit-text-stroke:2px_white] [paint-order:stroke_fill] drop-shadow-sm relative z-10">
                                                {app.print_committee || "---"}
                                            </div>
                                            <div className="w-full h-[2.5px] bg-black -mt-1.5 relative z-0"></div>
                                            <div className="text-[7pt] font-['DiezmaRd'] font-extrabold leading-none mt-1 tracking-tight [-webkit-text-stroke:1px_white] [paint-order:stroke_fill] drop-shadow-sm">COMMITTEE ON TRANSPORTATION</div>
                                        </div>
                                    )}
                                    <div className="text-center w-36 flex flex-col items-center">
                                        <div className="text-[8pt] font-['ArialNarrow7'] font-bold uppercase truncate px-1 tracking-tighter w-full scale-y-[1.2] origin-bottom pb-0.5 [-webkit-text-stroke:2px_white] [paint-order:stroke_fill] drop-shadow-sm relative z-10">
                                            {app.print_mayor || "---"}
                                        </div>
                                        <div className="w-full h-[2.5px] bg-black -mt-1.5 relative z-0"></div>
                                        <div className="text-[7pt] font-['DiezmaRd'] font-extrabold leading-none mt-0.75 tracking-tight [-webkit-text-stroke:1px_white] [paint-order:stroke_fill] drop-shadow-sm">MUNICIPAL MAYOR</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                @font-face { font-family: 'LEMONMILK'; src: url('/fonts/LEMONMILK-Light.otf') format('opentype'); font-weight: 300; font-style: normal; }
                @font-face { font-family: 'LEMONMILK'; src: url('/fonts/LEMONMILK-Regular.otf') format('opentype'); font-weight: 400; font-style: normal; }
                @font-face { font-family: 'UPBOLTERS'; src: url('/fonts/UPBOLTERS New-Regular.otf') format('opentype'); }
                @font-face { font-family: 'KeepCalm'; src: url('/fonts/KeepCalm-Medium.ttf') format('truetype'); font-weight: 500; }
                @font-face { font-family: 'ArialNarrow7'; src: url('/fonts/arialnarrow.ttf') format('truetype'); }
                @font-face { font-family: 'DiezmaRd'; src: url('/fonts/Diezma-ExtraBold.otf') format('opentype'); font-weight: 800; }
                @media print { @page { margin: 0; size: A4 portrait; } body { background: white; margin: 0; padding: 0; } .no-print { display: none !important; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
            `}</style>
        </div>
    );
}

function Field({ label, value, isSignature = false, height = "7mm" }: { label: string; value: string; isSignature?: boolean; height?: string; }) {
    return (
        <div className="flex flex-col items-center w-full">
            <div style={{ height: height }} className="border border-black rounded-md px-2 w-full flex items-center justify-center bg-white">
                <span className="text-[12pt] font-['UPBOLTERS'] text-black uppercase text-center truncate tracking-wide [-webkit-text-stroke:2px_white] [paint-order:stroke_fill] drop-shadow-[.7px_.7px_0_rgba(0,0,0,0.85)]">{value}</span>
            </div>
            <span className="text-[6.05pt] font-['KeepCalm'] font-semibold text-black uppercase mt-0.5 leading-none tracking-wide [-webkit-text-stroke:2px_white] [paint-order:stroke_fill] drop-shadow-sm">{label}</span>
        </div>
    );
}
