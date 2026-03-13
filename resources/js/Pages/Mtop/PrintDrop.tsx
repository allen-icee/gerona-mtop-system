//GeronaMTOP/resources/js/Pages/Mtop/PrintDrop.tsx
import React, { useEffect } from "react";
import { Head } from "@inertiajs/react";

interface Props {
    application: any;
    settings: any;
}

export default function PrintDrop({ application, settings }: Props) {
    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).toUpperCase();
    };

    // Safely format the full name
    const fullName = `${application.first_name} ${application.middle_name ? application.middle_name[0] + ". " : ""}${application.last_name}`.trim().toUpperCase();

    // Format the address to Title Case (e.g., Abagon, Gerona, Tarlac)
    const formatAddress = (str: string) => {
        if (!str) return "";
        return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const formattedAddress = formatAddress(application.address);

    useEffect(() => {
        setTimeout(() => window.print(), 500);

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
                e.preventDefault();
                window.print();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div className="bg-gray-100 min-h-screen flex justify-center text-gray-900 print:bg-white relative py-8 print:py-0">
            <Head title={`ORDER OF DROPPING - ${application.mt_number}`} />

            <div className="fixed top-4 right-4 print:hidden z-50">
                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                    🖨️ PRINT
                </button>
            </div>

            {/* This is the actual "Paper" */}
            <div
                className="w-[210mm] h-[297mm] bg-white shadow-xl print:shadow-none relative flex flex-col mx-auto overflow-hidden"
                style={{ fontFamily: "Tahoma, sans-serif" }}
            >
                {/* Header */}
                {settings?.show_header && (
                    <div className="w-full mb-6 px-4 mt-4">
                        <img
                            src={settings?.header_path ? `/storage/${settings.header_path}` : `/images/Gerona_Header.jpg`}
                            alt="Header"
                            className="w-full object-contain max-h-32"
                        />
                    </div>
                )}

                <div className="px-16 flex-1 flex flex-col">
                    {/* Title */}
                    <div className="text-center mt-10 mb-10">
                        <span className="font-bold underline text-[14pt]">ORDER OF DROPPING</span>
                    </div>

                    {/* Date aligned right */}
                    <div className="flex justify-end mb-12">
                        <span className="font-bold text-[12pt]">{formatDate(application.drop_date)}</span>
                    </div>

                    {/* Main Paragraph - Justified */}
                    <div className="text-justify text-[12pt] leading-[1.5] mb-10">
                        <span className="font-bold">{fullName}</span> of <span className="font-bold">{formattedAddress}</span>, has applied for cancellation of his/her franchise relative to his/her Motorized Tricycle with the following specifications:
                    </div>

                    {/* Vehicle Specs - Indented, Aligned Colons */}
                    <div className="pl-16 mb-12 text-[12pt]">
                        <div className="grid grid-cols-[160px_20px_1fr] mb-1">
                            <div>Make</div>
                            <div>:</div>
                            <div className="font-bold uppercase">{application.make_type}</div>
                        </div>
                        <div className="grid grid-cols-[160px_20px_1fr] mb-1">
                            <div>Engine No.</div>
                            <div>:</div>
                            <div className="font-bold uppercase">{application.engine_motor_no}</div>
                        </div>
                        <div className="grid grid-cols-[160px_20px_1fr] mb-1">
                            <div>Chassis No.</div>
                            <div>:</div>
                            <div className="font-bold uppercase">{application.chassis_no}</div>
                        </div>
                        <div className="grid grid-cols-[160px_20px_1fr]">
                            <div>Plate No./Body No.</div>
                            <div>:</div>
                            <div className="font-bold uppercase">
                                {application.plate_no} {application.body_number ? `(#${application.body_number})` : ""}
                            </div>
                        </div>
                    </div>

                    {/* Final Paragraph - Justified */}
                    <div className="text-justify text-[12pt] leading-[1.5] mb-24">
                        Application for cancellation of above franchise being in order, the same is hereby granted. Issued upon request of <span className="font-bold">{fullName}</span> of <span className="font-bold">{formattedAddress}</span> for whatever legal purpose it may serve.
                    </div>

                    {/* Official Signature Block - Right Aligned */}
                    <div className="flex justify-end mb-16">
                        <div className="text-center min-w-[250px]">
                            <div className="font-bold text-[12pt] uppercase underline">{application.drop_official}</div>
                            <div className="text-[12pt]">{application.drop_position}</div>
                        </div>
                    </div>

                    {/* OR Block - Bottom Left */}
                    <div className="mt-auto mb-10 text-[12pt]">
                        <div className="mb-1">Paid under OR, No.: <span className="font-bold">{application.drop_or_number}</span></div>
                        <div className="mb-1">Date: <span className="font-bold">{formatDate(application.drop_or_date)}</span></div>
                        <div>Amount: P/ <span className="font-bold">{Number(application.drop_amount || 0).toFixed(2)}</span></div>
                    </div>
                </div>

                {/* Footer */}
                {settings?.show_footer && settings?.footer_path && (
                    <div className="w-full mt-auto mb-4 px-4">
                        <img
                            src={`/storage/${settings.footer_path}`}
                            alt="Footer"
                            className="w-full object-contain max-h-32"
                        />
                    </div>
                )}
            </div>

            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        background: white;
                        -webkit-print-color-adjust: exact;
                    }
                    .print\\:hidden { display: none !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:py-0 { padding-top: 0 !important; padding-bottom: 0 !important; }
                }
            `}</style>
        </div>
    );
}
