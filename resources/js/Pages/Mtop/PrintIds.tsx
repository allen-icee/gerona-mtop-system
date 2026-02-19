import { Head } from "@inertiajs/react";
import { useEffect } from "react";

interface Props {
    applications: any[];
}

export default function PrintIds({ applications }: Props) {
    useEffect(() => {
        // 1. Auto-print on initial load
        setTimeout(() => window.print(), 800);

        // 2. Listen for Ctrl+P or Cmd+P
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
                e.preventDefault(); // Stop default browser save/print dialog if any
                window.print(); // Trigger our print
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        // 3. Cleanup listener when component unmounts
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // ✅ SAFE OUTLINE STYLE (Web + Electron + Print)
    const textStyle: any = {
        color: "black",
        textShadow: `
            -2px -2px 0 white,
             2px -2px 0 white,
            -2px  2px 0 white,
             2px  2px 0 white,
            -3px  0px 0 white,
             3px  0px 0 white,
             0px -3px 0 white,
             0px  3px 0 white
        `,
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
    };

    const smallTextStyle: any = {
        color: "black",
        textShadow: `
            -1px -1px 0 white,
             1px -1px 0 white,
            -1px  1px 0 white,
             1px  1px 0 white
        `,
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
    };

    return (
        <div className="w-full min-h-screen bg-gray-500 p-8 print:p-0 print:bg-white flex flex-col items-center gap-4 relative">
            <Head title="Print IDs" />

            {/* MANUAL PRINT BUTTON FOR ELECTRON & WEB */}
            <div className="fixed top-4 right-4 print:hidden z-50">
                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                    🖨️ PRINT
                </button>
            </div>

            <div className="mx-auto bg-white shadow-lg print:shadow-none w-[210mm] min-h-[297mm] grid grid-cols-2 content-start px-[2mm] py-[5mm]">
                {applications.map((app) => (
                    <div
                        key={app.id}
                        className="w-[4in] h-[5.5in] border border-black relative overflow-hidden font-sans flex flex-col px-[8mm] py-[2mm] shadow-sm print:shadow-none shrink-0 break-inside-avoid m-auto mt-2"
                        style={{
                            backgroundImage:
                                "url('/images/MTOPIDBackground.png')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            WebkitPrintColorAdjust: "exact",
                            printColorAdjust: "exact",
                        }}
                    >
                        {/* HEADER */}
                        <div className="relative z-10 grid grid-cols-[60px_1fr] items-center mb-6">
                            <div></div>
                            <div className="text-center leading-tight mt-4 ml-2">
                                <h1
                                    className="text-[11pt] font-['LEMONMILK'] font-light uppercase tracking-wider"
                                    style={smallTextStyle}
                                >
                                    Republic of the Philippines
                                </h1>
                                <h1
                                    className="text-[11pt] font-['LEMONMILK'] font-light uppercase tracking-wider"
                                    style={smallTextStyle}
                                >
                                    Province of Tarlac
                                </h1>
                                <h1
                                    className="text-[11pt] font-['LEMONMILK'] font-bold uppercase tracking-wider"
                                    style={smallTextStyle}
                                >
                                    Municipality of Gerona
                                </h1>
                            </div>
                        </div>

                        {/* TITLE */}
                        <h1
                            className="relative z-10 text-center font-['UPBOLTERS'] text-[15pt] tracking-normal mb-2 leading-none scale-y-[1.5] origin-bottom drop-shadow-[.8px_.8px_0_rgba(0,0,0,0.75)]"
                            style={smallTextStyle}
                        >
                            MOTORIZED TRICYCLE OPERATOR'S PERMIT
                        </h1>

                        {/* PHOTO + NUMBER */}
                        <div className="relative z-10 flex justify-between items-end gap-2 mb-1">
                            <div className="w-[30mm] h-[30mm] border border-black bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                {app.driver_photo_path ? (
                                    <img
                                        src={`/storage/${app.driver_photo_path}`}
                                        className="w-full h-full object-cover"
                                        alt="Driver"
                                    />
                                ) : (
                                    <span className="text-[8px] font-bold text-gray-400">
                                        PHOTO
                                    </span>
                                )}
                            </div>

                            <div className="w-[50mm] flex flex-col items-center justify-end">
                                <label
                                    className="text-[10.7pt] font-['KeepCalm'] font-bold uppercase -mb-1 tracking-wide text-center w-full drop-shadow-[.8px_.8px_0_rgba(0,0,0,0.65)]"
                                    style={smallTextStyle}
                                >
                                    Sidecar Number
                                </label>
                                <div className="border border-black rounded-lg h-[15mm] w-full flex items-center justify-center bg-white">
                                    <span
                                        className="text-5xl font-['UPBOLTERS'] drop-shadow-[1px_1px_0_rgba(0,0,0,0.85)]"
                                        style={textStyle}
                                    >
                                        {app.body_number || "---"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* FIELDS */}
                        <div className="flex-1 flex flex-col justify-center space-y-1">
                            <Field
                                label="DRIVER'S SIGNATURE"
                                value=""
                                height="13mm"
                                style={textStyle}
                                labelStyle={smallTextStyle}
                            />
                            <Field
                                label="DRIVER'S NAME"
                                value={app.driver_name || "---"}
                                style={textStyle}
                                labelStyle={smallTextStyle}
                            />
                            <Field
                                label="OPERATOR'S NAME AND ADDRESS"
                                value={`${app.first_name || ""} ${app.last_name || ""} / ${
                                    app.address
                                        ? app.address
                                              .split(/Gerona|Tarlac/i)[0]
                                              .replace(/,\s*$/, "")
                                              .trim()
                                        : "---"
                                }`}
                                style={textStyle}
                                labelStyle={smallTextStyle}
                            />
                            <Field
                                label="PLATE NUMBER"
                                value={app.plate_no || "N/A"}
                                style={textStyle}
                                labelStyle={smallTextStyle}
                            />
                            <Field
                                label="MTOP EXPIRATION DATE"
                                value={
                                    app.valid_until
                                        ? new Date(app.valid_until)
                                              .toLocaleDateString("en-US", {
                                                  month: "long",
                                                  day: "numeric",
                                                  year: "numeric",
                                              })
                                              .toUpperCase()
                                        : "---"
                                }
                                style={textStyle}
                                labelStyle={smallTextStyle}
                            />
                        </div>

                        {/* FOOTER */}
                        <div className="mt-4 flex justify-between items-end pb-1">
                            <FooterBlock
                                name={app.print_committee || "---"}
                                title="COMMITTEE ON TRANSPORTATION"
                                style={smallTextStyle}
                            />
                            <FooterBlock
                                name={app.print_mayor || "---"}
                                title="MUNICIPAL MAYOR"
                                style={smallTextStyle}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Field({
    label,
    value,
    height = "7mm",
    style,
    labelStyle,
}: {
    label: string;
    value: string;
    height?: string;
    style: any;
    labelStyle: any;
}) {
    return (
        <div className="flex flex-col items-center w-full">
            <div
                style={{ height }}
                className="border border-black rounded-md px-2 w-full flex items-center justify-center bg-white"
            >
                <span
                    className="text-[12pt] font-['UPBOLTERS'] text-center truncate tracking-wide w-full block drop-shadow-[.7px_.7px_0_rgba(0,0,0,0.85)]"
                    style={style}
                >
                    {value}
                </span>
            </div>
            <span
                className="text-[6.05pt] font-['KeepCalm'] font-semibold uppercase mt-[2px] leading-none tracking-wide drop-shadow-sm"
                style={labelStyle}
            >
                {label}
            </span>
        </div>
    );
}

function FooterBlock({
    name,
    title,
    style,
}: {
    name: string;
    title: string;
    style: any;
}) {
    return (
        <div className="text-center w-36 flex flex-col items-center">
            <div
                className="text-[8pt] font-['ArialNarrow7'] font-bold uppercase truncate px-1 tracking-tighter w-full scale-y-[1.2] origin-bottom pb-1"
                style={style}
            >
                {name}
            </div>
            <div className="w-full h-[3px] bg-black border border-white -mt-1.5"></div>
            <div
                className="text-[7pt] font-['DiezmaRd'] font-extrabold leading-none mt-1 tracking-tight"
                style={style}
            >
                {title}
            </div>
        </div>
    );
}
