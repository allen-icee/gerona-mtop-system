import { Head } from "@inertiajs/react";
import { useEffect } from "react";

interface Props {
    applications: any[];
}

export default function PrintIds({ applications }: Props) {
    useEffect(() => {
        // Auto print when page loads
        setTimeout(() => window.print(), 500);
    }, []);

    return (
        <div className="w-full min-h-screen bg-gray-500 p-8 print:p-0 print:bg-white flex flex-col items-center gap-4">
            <Head title="Print IDs" />

            {/* A4 Page Container */}
            <div className="mx-auto bg-white shadow-lg print:shadow-none max-w-[210mm] min-h-[297mm] p-[5mm] flex flex-col items-center gap-10">
                {applications.map((app) => (
                    /* Portrait ID Dimensions: 4in Width x 5.5in Height */
                    <div
                        key={app.id}
                        className="w-[4in] h-[5.5in] bg-white border-2 border-black relative overflow-hidden font-sans flex flex-col p-4 shadow-sm print:shadow-none shrink-0 border-box"
                    >
                        {/* Background Design Shapes */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 right-0 w-[3in] h-[3in] bg-red-500 rounded-full opacity-10 transform translate-x-10 -translate-y-10"></div>
                            <div className="absolute bottom-0 left-0 w-[3in] h-[3in] bg-blue-500 rounded-full opacity-10 transform -translate-x-10 translate-y-10"></div>
                        </div>

                        {/* HEADER SECTION */}
                        <div className="relative z-10 flex flex-col items-center mb-2">
                            <div className="flex items-center justify-center w-full relative">
                                <img
                                    src="/images/MunicipalityLogo.png"
                                    alt="Logo"
                                    className="w-14 h-14 object-contain absolute left-0"
                                />
                                <div className="text-center">
                                    <h1 className="text-[9px] font-bold uppercase leading-tight">
                                        Republic of the Philippines
                                    </h1>
                                    <h1 className="text-[9px] font-bold uppercase leading-tight text-red-600">
                                        Province of Tarlac
                                    </h1>
                                    <h1 className="text-[11px] font-black uppercase leading-tight text-blue-900">
                                        Municipality of Gerona
                                    </h1>
                                </div>
                            </div>
                        </div>

                        {/* PERMIT TITLE */}
                        <div className="relative z-10 text-center font-black text-sm tracking-tight border-y border-black py-1 mb-4 bg-white/50">
                            MOTORIZED TRICYCLE OPERATOR'S PERMIT
                        </div>

                        {/* PHOTO & SIDECAR SECTION */}
                        <div className="relative z-10 flex gap-4 mb-4">
                            {/* Photo with Rounded Corners */}
                            <div className="w-24 h-24 border-2 border-black bg-white rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                {app.driver_photo_path ? (
                                    <img
                                        src={`/storage/${app.driver_photo_path}`}
                                        className="w-full h-full object-cover"
                                        alt="Driver"
                                    />
                                ) : (
                                    <span className="text-[8px] font-bold text-gray-400">
                                        2x2 PHOTO
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="border-2 border-black rounded-lg h-14 w-full flex items-center justify-center text-4xl font-black text-red-600 bg-white">
                                    {app.body_number || "0000"}
                                </div>
                                <label className="text-[9px] font-black text-gray-700 uppercase mt-1">
                                    Sidecar Number
                                </label>
                            </div>
                        </div>

                        {/* CENTERED STACKED FORM FIELDS WITH LABELS BELOW */}
                        <div className="relative z-10 flex-1 flex flex-col justify-center space-y-4 px-2">
                            <Field
                                label="DRIVER'S SIGNATURE"
                                value=""
                                isSignature={true}
                            />
                            <Field
                                label="DRIVER'S NAME"
                                value={app.driver_name || "---"}
                            />
                            <Field
                                label="OPERATOR'S NAME AND ADDRESS"
                                value={`${app.first_name} ${app.last_name}${app.suffix ? " " + app.suffix : ""}, ${app.address}`}
                            />
                            <Field
                                label="PLATE NUMBER"
                                value={app.plate_no || "N/A"}
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
                            />
                        </div>

                        {/* FOOTER SECTION */}
                        <div className="mt-6 relative z-10 flex justify-between items-end pb-1">
                            <div className="text-center w-36">
                                <div className="text-[9px] font-bold uppercase truncate px-1 underline decoration-1 underline-offset-4">
                                    {app.print_committee || "---"}
                                </div>
                                <div className="text-[7px] font-black leading-none mt-2">
                                    COMMITTEE ON TRANSPORTATION
                                </div>
                            </div>

                            <div className="text-center w-36">
                                <div className="text-[9px] font-bold uppercase truncate px-1 underline decoration-1 underline-offset-4">
                                    {app.print_mayor || "---"}
                                </div>
                                <div className="text-[7px] font-black leading-none mt-2">
                                    MUNICIPAL MAYOR
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @media print {
                    @page { margin: 0; size: A4 portrait; }
                    body { background: white; margin: 0; padding: 0; }
                    .no-print { display: none; }
                }
            `}</style>
        </div>
    );
}

/* Updated Field Component: Label placed below and centered */
function Field({
    label,
    value,
    isSignature = false,
}: {
    label: string;
    value: string;
    isSignature?: boolean;
}) {
    return (
        <div className="flex flex-col items-center w-full">
            <div
                className={`border-2 border-black rounded-lg px-2 w-full flex items-center justify-center bg-white ${isSignature ? "h-10 border-dashed border-gray-400" : "h-8"}`}
            >
                <span className="text-[10px] font-black text-gray-800 uppercase text-center truncate">
                    {value}
                </span>
            </div>
            <span className="text-[8px] font-black text-gray-600 uppercase mt-1 leading-none">
                {label}
            </span>
        </div>
    );
}
