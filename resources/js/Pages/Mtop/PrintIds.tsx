import { Head } from "@inertiajs/react";
import { useEffect } from "react";

interface Props {
    applications: any[];
}

export default function PrintIds({ applications }: Props) {
    useEffect(() => {
        setTimeout(() => window.print(), 500);
    }, []);

    return (
        <div className="w-full min-h-screen bg-gray-500 p-8 print:p-0 print:bg-white">
            <Head title="Print IDs" />

            <div className="mx-auto bg-white shadow-lg print:shadow-none max-w-[210mm] min-h-[297mm] p-[5mm] grid grid-cols-2 gap-4 content-start">
                {applications.map((app) => (
                    <div
                        key={app.id}
                        className="border-2 border-gray-800 rounded-lg p-3 relative h-[320px] flex flex-col text-xs font-sans overflow-hidden"
                    >
                        {/* HEADER */}
                        <div className="text-center border-b-2 border-gray-800 pb-2 mb-2">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <img
                                    src="/images/MunicipalityLogo.png"
                                    className="w-10 h-10"
                                    alt="Logo"
                                />
                                <div>
                                    <h1 className="font-bold text-[10px] leading-tight uppercase">
                                        Republic of the Philippines
                                    </h1>
                                    <h2 className="font-bold text-sm leading-tight uppercase text-blue-900">
                                        Municipality of Gerona
                                    </h2>
                                    <h3 className="font-bold text-[10px] uppercase tracking-widest bg-black text-white px-2 rounded-sm mt-0.5 inline-block">
                                        Tricycle Operator's ID
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* BODY */}
                        <div className="flex gap-3 flex-1">
                            <div className="w-1/3 flex flex-col items-center gap-2">
                                <div className="w-[85px] h-[85px] border border-gray-400 bg-gray-100 flex items-center justify-center overflow-hidden rounded-sm">
                                    {app.driver_photo_path ? (
                                        <img
                                            src={`/storage/${app.driver_photo_path}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center text-gray-400 text-[8px] leading-tight">
                                            2x2
                                            <br />
                                            PHOTO
                                        </div>
                                    )}
                                </div>
                                <div className="w-full text-center mt-auto">
                                    <div className="border-b border-black w-full h-4"></div>
                                    <span className="text-[8px] font-bold uppercase">
                                        Driver's Signature
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-1.5 relative">
                                <div className="absolute top-0 right-0 text-right">
                                    <span className="block text-[8px] font-bold text-gray-500 uppercase">
                                        Body Number
                                    </span>
                                    <span className="block text-3xl font-black text-red-600 leading-none">
                                        {app.body_number || "---"}
                                    </span>
                                </div>
                                <div className="pt-10 space-y-1">
                                    <div className="border-b border-gray-200 pb-0.5">
                                        <span className="block text-[8px] text-gray-500 uppercase">
                                            Driver Name
                                        </span>
                                        <span className="block font-bold text-sm uppercase truncate">
                                            {app.driver_name || "---"}
                                        </span>
                                    </div>
                                    <div className="border-b border-gray-200 pb-0.5">
                                        <span className="block text-[8px] text-gray-500 uppercase">
                                            Operator Name
                                        </span>
                                        <span className="block font-bold text-xs uppercase truncate">
                                            {app.first_name} {app.last_name}{" "}
                                            {app.suffix || ""}
                                        </span>
                                    </div>
                                    <div className="border-b border-gray-200 pb-0.5">
                                        <span className="block text-[8px] text-gray-500 uppercase">
                                            Address
                                        </span>
                                        <span className="block font-bold text-[10px] uppercase truncate leading-tight">
                                            {app.address}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        <div>
                                            <span className="block text-[8px] text-gray-500 uppercase">
                                                Plate No.
                                            </span>
                                            <span className="block font-bold text-xs uppercase">
                                                {app.plate_no || "N/A"}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-[8px] text-gray-500 uppercase">
                                                Expiry Date
                                            </span>
                                            <span className="block font-bold text-xs uppercase text-red-600">
                                                {app.valid_until
                                                    ? new Date(
                                                          app.valid_until,
                                                      ).toLocaleDateString()
                                                    : "---"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="mt-auto pt-2 flex justify-between items-end text-center gap-2">
                            <div className="flex-1">
                                <div className="border-b border-black mx-auto w-full"></div>
                                <div className="text-[8px] font-bold uppercase mt-0.5 leading-tight">
                                    {app.print_committee}
                                </div>
                                <div className="text-[6px] text-gray-500 uppercase">
                                    Committee on Transportation
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="border-b border-black mx-auto w-full"></div>
                                <div className="text-[8px] font-bold uppercase mt-0.5 leading-tight">
                                    {app.print_mayor}
                                </div>
                                <div className="text-[6px] text-gray-500 uppercase">
                                    Municipal Mayor
                                </div>
                            </div>
                        </div>

                        {/* Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
                            <img
                                src="/images/MunicipalityLogo.png"
                                className="w-48 grayscale"
                            />
                        </div>
                    </div>
                ))}
            </div>
            <style>{`
                @media print {
                    @page { margin: 5mm; size: A4; }
                    body { background: white; }
                    .no-print { display: none; }
                }
            `}</style>
        </div>
    );
}
