import { Head } from "@inertiajs/react";
import { useEffect } from "react";
import PrintPage1 from "./Partials/PrintPage1";
import PrintPage2 from "./Partials/PrintPage2";

interface MtopApplication {
    id: number;
    last_name: string;
    first_name: string;
    middle_name: string;
    suffix: string;
    address: string;
    mt_number: string;
    transaction_date: string;
    make_type: string;
    engine_motor_no: string;
    chassis_no: string;
    plate_no: string;
    body_number: string;
    cedula_number: string;
    cedula_date: string;
    or_number: string;
    or_date: string;
    punong_bayan: string;
    authorized_official: string;
}

export default function Print({
    application,
}: {
    application: MtopApplication;
}) {
    useEffect(() => {
        // 1. Auto-print on initial load
        setTimeout(() => window.print(), 500);

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

    const operatorName = `${application.first_name} ${
        application.middle_name ? application.middle_name + ". " : ""
    }${application.last_name}${
        application.suffix ? " " + application.suffix : ""
    }`;

    return (
        <div className="bg-gray-100 min-h-screen flex justify-center text-gray-900 print:bg-white relative">
            <Head title={`Print MTOP - ${application.mt_number}`} />

            <div className="w-[210mm] print:w-full">
                <div className="bg-white shadow-md print:shadow-none print:break-after-page">
                    <PrintPage1
                        application={application}
                        operatorName={operatorName}
                    />
                </div>

                <div className="bg-white shadow-md mt-4 print:mt-0 print:shadow-none">
                    <PrintPage2
                        application={application}
                        operatorName={operatorName}
                    />
                </div>

                {/* MANUAL PRINT BUTTON FOR ELECTRON & WEB */}
                <div className="fixed top-4 right-4 print:hidden z-50">
                    <button
                        onClick={() => window.print()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                    >
                        🖨️ PRINT
                    </button>
                </div>

                <style>{`
                    @media print {
                        @page {
                            size: A4;
                            margin: 0; /* Remove browser default margin */
                        }
                        body {
                            background: white;
                            -webkit-print-color-adjust: exact;
                        }
                        .print\\:hidden { display: none !important; }

                        /* Ensure content fits exactly */
                        .print\\:w-full { width: 100% !important; }
                        .print\\:mt-0 { margin-top: 0 !important; }
                        .print\\:shadow-none { box-shadow: none !important; }
                        .print\\:break-after-page { break-after: page; }
                    }
                `}</style>
            </div>
        </div>
    );
}
