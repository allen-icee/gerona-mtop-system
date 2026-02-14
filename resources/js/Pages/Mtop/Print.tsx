import { Head, Link } from "@inertiajs/react"; // Import Link
import { useEffect } from "react";
import PrintPage1 from "./Partials/PrintPage1";
import PrintPage2 from "./Partials/PrintPage2";
interface MtopApplication {
    id: number;
    last_name: string;
    first_name: string;
    middle_name: string;
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
        // Optional: Wrap in setTimeout to ensure rendering finishes
        setTimeout(() => window.print(), 500);
    }, []);

    const operatorName = `${application.first_name} ${application.middle_name ? application.middle_name + ". " : ""}${application.last_name}`;

    return (
        <div className="bg-gray-100 min-h-screen flex justify-center text-gray-900 print:bg-white">
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

                {/* FIXED BACK BUTTON */}
                <div className="fixed top-4 right-4 print:hidden">
                    <Link
                        href={route("mtop.index")} // Explicitly links to the index
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow font-bold text-sm flex items-center gap-2"
                    >
                        <span>← BACK</span>
                    </Link>
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
