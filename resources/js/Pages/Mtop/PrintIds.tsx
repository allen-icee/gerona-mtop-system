//GeronaMTOP\resources\js\Pages\Mtop\PrintIds.tsx
import { Head } from "@inertiajs/react";
import { useEffect } from "react";

interface Props {
    applications: any[];
    settings: any;
}

export default function PrintIds({ applications, settings }: Props) {
    useEffect(() => {
        setTimeout(() => window.print(), 500);
    }, []);

    const idBackgroundUrl = settings?.id_background_path
        ? `/storage/${settings.id_background_path}`
        : "/images/MTOPIDBackground.png";

    return (
        <div className="w-full min-h-screen bg-gray-500 p-8 print:p-0 print:bg-white flex flex-col items-center gap-4">
            <Head title="Print IDs" />

            <div className="mx-auto bg-white shadow-lg print:shadow-none w-[210mm] min-h-[297mm] grid grid-cols-2 content-start px-[2mm] py-[5mm]">
                {applications.map((app) => (
                    <div
                        key={app.id}
                        className="w-[4in] h-132 border border-black relative overflow-hidden font-sans flex flex-col px-[8mm] py-[2mm] shadow-sm print:shadow-none shrink-0 break-inside-avoid m-auto mt-2"
                        style={{
                            backgroundImage: `url('${idBackgroundUrl}')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                        }}
                    >
                        <div className="relative z-10 grid grid-cols-[60px_1fr] items-center mb-6">
                            <div className="relative flex justify-center items-center h-full">
                                <img
                                    src="/images/3DMunicipalLogo.png"
                                    alt="Gerona Logo"
                                    className="absolute max-w-none w-20 h-20 object-contain drop-shadow-md z-10"
                                    style={{
                                        left: "-10px",
                                        top: "55%",
                                        transform: "translateY(-50%)",
                                    }}
                                />
                            </div>

                            <div className="text-center leading-tight mt-3 mb-1 ml-0">
                                <h1
                                    className="text-[11pt] font-['LEMONMILK'] font-light uppercase tracking-wider
                                    [-webkit-text-stroke:1.5px_white]
                                    [paint-order:stroke_fill]
                                   "
                                >
                                    Republic of the Philippines
                                </h1>
                                <h1
                                    className="text-[11pt] font-['LEMONMILK'] font-light uppercase tracking-wider
                                    [-webkit-text-stroke:1.5px_white]
                                    [paint-order:stroke_fill]
                                  "
                                >
                                    Province of Tarlac
                                </h1>
                                <h1
                                    className="text-[11pt] font-['LEMONMILK'] font-bold uppercase tracking-wider
                                    [-webkit-text-stroke:1.5px_white]
                                    [paint-order:stroke_fill]
                                  "
                                >
                                    Municipality of Gerona
                                </h1>
                            </div>
                        </div>

                        <h1
                            className="relative z-10 text-center font-['UPBOLTERS'] text-[15pt] tracking-normal py-0 mb-2 leading-none
                            scale-y-[1.5] origin-bottom
                            [-webkit-text-stroke:2px_white]
                            [paint-order:stroke_fill]
                            drop-shadow-[.8px_.8px_0_rgba(0,0,0,0.75)]"
                        >
                            MOTORIZED TRICYCLE OPERATOR'S PERMIT
                        </h1>

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
                                    className="text-[10.7pt] font-['KeepCalm'] font-bold uppercase leading-none -mb-1 tracking-wide text-center w-full
                                    [-webkit-text-stroke:.8px_white] [paint-order:stroke_fill] drop-shadow-[.8px_.8px_0_rgba(0,0,0,0.65)]"
                                >
                                    Sidecar Number
                                </label>

                                <div className="border border-black rounded-lg h-[15mm] w-full flex mt-1 items-center justify-center bg-white">
                                    <span
                                        className="text-5xl text-black font-['UPBOLTERS']
                                        [-webkit-text-stroke:2px_white]
                                        [paint-order:stroke_fill]
                                        drop-shadow-[1px_1px_0_rgba(0,0,0,0.85)]"
                                    >
                                        {app.body_number || "---"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 flex-1 flex flex-col justify-center space-y-1 px-0">
                            <Field
                                label="DRIVER'S SIGNATURE"
                                value=""
                                isSignature={true}
                                height="13mm"
                            />
                            <Field
                                label="DRIVER'S NAME"
                                value={app.driver_name || "---"}
                                height="7mm"
                            />
                            <Field
                                label="OPERATOR'S NAME AND ADDRESS"
                                value={`${app.first_name} ${app.last_name} / ${
                                    app.address
                                        ? app.address
                                              .split(/Gerona|Tarlac/i)[0]
                                              .replace(/,\s*$/, "")
                                              .trim()
                                        : "---"
                                }`}
                                height="7mm"
                            />
                            <Field
                                label="PLATE NUMBER"
                                value={app.plate_no || "N/A"}
                                height="7mm"
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
                                height="7mm"
                            />
                        </div>
                        <div className="mt-4 relative z-10 flex justify-between items-end pb-1">
                            <div className="text-center w-36 flex flex-col items-center">
                                <div
                                    className="text-[8pt] font-['ArialNarrow7'] font-bold uppercase truncate px-1 tracking-tighter w-full
                                    scale-y-[1.2] origin-bottom pb-1
                                    [-webkit-text-stroke:2px_white] [paint-order:stroke_fill] drop-shadow-sm relative z-10"
                                >
                                    {app.print_committee || "---"}
                                </div>

                                <div className="w-full h-0.75 bg-black border border-white -mt-1.5 relative z-0"></div>

                                <div
                                    className="text-[7pt] font-['DiezmaRd'] font-extrabold leading-none mt-1 tracking-tight
                                    [-webkit-text-stroke:1px_white] [paint-order:stroke_fill] drop-shadow-sm"
                                >
                                    COMMITTEE ON TRANSPORTATION
                                </div>
                            </div>

                            <div className="text-center w-36 flex flex-col items-center">
                                <div
                                    className="text-[8pt] font-['ArialNarrow7'] font-bold uppercase truncate px-1 tracking-tighter w-full
                                    scale-y-[1.2] origin-bottom pb-1
                                    [-webkit-text-stroke:2px_white] [paint-order:stroke_fill] drop-shadow-sm relative z-10"
                                >
                                    {app.print_mayor || "---"}
                                </div>

                                <div className="w-full h-0.75 bg-black border border-white -mt-1.5 relative z-0"></div>

                                <div
                                    className="text-[7pt] font-['DiezmaRd'] font-extrabold leading-none mt-1 tracking-tight
                                    [-webkit-text-stroke:1px_white] [paint-order:stroke_fill] drop-shadow-sm"
                                >
                                    MUNICIPAL MAYOR
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @font-face {
                    font-family: 'LEMONMILK';
                    src: url('/fonts/LEMONMILK-Light.otf') format('opentype');
                    font-weight: 300;
                    font-style: normal;
                }
                @font-face {
                    font-family: 'LEMONMILK';
                    src: url('/fonts/LEMONMILK-Regular.otf') format('opentype');
                    font-weight: 400;
                    font-style: normal;
                }
                @font-face {
                    font-family: 'UPBOLTERS';
                    src: url('/fonts/UPBOLTERS New-Regular.otf') format('opentype');
                }
                @font-face {
                    font-family: 'KeepCalm';
                    src: url('/fonts/KeepCalm-Medium.ttf') format('truetype');
                    font-weight: 500;
                }
                @font-face {
                    font-family: 'ArialNarrow7';
                    src: url('/fonts/arialnarrow.ttf') format('truetype');
                }
                @font-face {
                    font-family: 'DiezmaRd';
                    src: url('/fonts/Diezma-ExtraBold.otf') format('opentype');
                    font-weight: 800;
                }

                @media print {
                    @page { margin: 0; size: A4 portrait; }
                    body { background: white; margin: 0; padding: 0; }
                    .no-print { display: none; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>
        </div>
    );
}

function Field({
    label,
    value,
    isSignature = false,
    height = "7mm",
}: {
    label: string;
    value: string;
    isSignature?: boolean;
    height?: string;
}) {
    return (
        <div className="flex flex-col items-center w-full">
            <div
                style={{ height: height }}
                className="border border-black rounded-md px-2 w-full flex items-center justify-center bg-white"
            >
                <span
                    className="text-[12pt] font-['UPBOLTERS'] text-black uppercase text-center truncate tracking-wide
                    [-webkit-text-stroke:2px_white] [paint-order:stroke_fill] drop-shadow-[.7px_.7px_0_rgba(0,0,0,0.85)]"
                >
                    {value}
                </span>
            </div>
            <span
                className="text-[6.05pt] font-['KeepCalm'] font-semibold text-black uppercase mt-0.5 leading-none tracking-wide
                [-webkit-text-stroke:2px_white] [paint-order:stroke_fill] drop-shadow-sm"
            >
                {label}
            </span>
        </div>
    );
}
