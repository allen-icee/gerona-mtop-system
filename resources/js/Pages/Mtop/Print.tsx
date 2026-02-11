import { Head } from "@inertiajs/react";
import { MtopApplication } from "@/types";
import { useEffect } from "react";

export default function Print({
    application,
}: {
    application: MtopApplication;
}) {
    // Auto-trigger print dialog when page loads
    useEffect(() => {
        window.print();
    }, []);

    return (
        <div className="bg-gray-100 min-h-screen p-8 flex justify-center text-gray-900">
            <Head title={`Print MTOP - ${application.mt_number}`} />

            {/* --- PAPER CONTAINER (8.5in x 11in) --- */}
            <div className="bg-white w-[8.5in] min-h-[11in] shadow-lg p-10 relative print:shadow-none print:w-full">
                {/* 1. HEADER */}
                <div className="text-center mb-8 space-y-1">
                    <p className="text-sm font-serif uppercase">
                        Republic of the Philippines
                    </p>
                    <p className="text-sm font-serif uppercase">
                        Province of Tarlac
                    </p>
                    <p className="text-sm font-serif uppercase font-bold">
                        Municipality of Gerona
                    </p>
                    <h1 className="text-xl font-bold mt-4 uppercase underline decoration-2 underline-offset-4">
                        Application for Motorized Tricycle Operator's Permit
                        (MTOP)
                    </h1>
                </div>

                {/* 2. CASE NUMBER & DATE */}
                <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-2">
                    <div>
                        <span className="font-bold">Case No:</span>
                        <span className="text-xl font-mono ml-2 font-bold">
                            {application.mt_number}
                        </span>
                    </div>
                    <div>
                        <span className="font-bold">Date:</span>
                        <span className="ml-2 border-b border-black min-w-[150px] inline-block text-center">
                            {application.transaction_date}
                        </span>
                    </div>
                </div>

                {/* 3. THE 4 DATA TABLES */}
                <div className="space-y-6">
                    {/* TABLE 1: OPERATOR */}
                    <div className="border border-black">
                        <div className="bg-gray-200 border-b border-black px-2 py-1 font-bold text-sm uppercase">
                            I. Operator Details
                        </div>
                        <div className="p-2 grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs uppercase text-gray-500 block">
                                    Name of Operator
                                </span>
                                <div className="font-bold text-lg">
                                    {application.operator_name}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs uppercase text-gray-500 block">
                                    Address / Barangay
                                </span>
                                <div className="font-bold">
                                    {application.address}
                                </div>
                            </div>
                            <div className="col-span-2">
                                <span className="text-xs uppercase text-gray-500 block">
                                    Validity
                                </span>
                                <div>
                                    Valid until:{" "}
                                    <span className="font-bold">
                                        {application.valid_until}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TABLE 2: UNIT */}
                    <div className="border border-black">
                        <div className="bg-gray-200 border-b border-black px-2 py-1 font-bold text-sm uppercase">
                            II. Unit Details
                        </div>
                        <div className="p-2 grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs uppercase text-gray-500 block">
                                    Make / Type
                                </span>
                                <div className="font-bold">
                                    {application.make_type}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs uppercase text-gray-500 block">
                                    Plate Number
                                </span>
                                <div className="font-bold text-lg border-2 border-black inline-block px-2">
                                    {application.plate_no}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs uppercase text-gray-500 block">
                                    Motor / Engine No.
                                </span>
                                <div className="font-bold">
                                    {application.engine_motor_no}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs uppercase text-gray-500 block">
                                    Chassis No.
                                </span>
                                <div className="font-bold">
                                    {application.chassis_no}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs uppercase text-gray-500 block">
                                    Sidecar / Body No.
                                </span>
                                <div className="font-bold">
                                    {application.body_number || "N/A"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TABLE 3 & 4: DOCS */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* CEDULA */}
                        <div className="border border-black">
                            <div className="bg-gray-200 border-b border-black px-2 py-1 font-bold text-sm uppercase">
                                III. Cedula (CTC)
                            </div>
                            <div className="p-2 space-y-2">
                                <div>
                                    <span className="text-xs uppercase text-gray-500 block">
                                        CTC Number
                                    </span>
                                    <div className="font-bold">
                                        {application.cedula_number}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs uppercase text-gray-500 block">
                                        Date Issued
                                    </span>
                                    <div className="font-bold">
                                        {application.cedula_date}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* OFFICIAL RECEIPT */}
                        <div className="border border-black">
                            <div className="bg-gray-200 border-b border-black px-2 py-1 font-bold text-sm uppercase">
                                IV. Official Receipt
                            </div>
                            <div className="p-2 space-y-2">
                                <div>
                                    <span className="text-xs uppercase text-gray-500 block">
                                        O.R. Number
                                    </span>
                                    <div className="font-bold">
                                        {application.or_number}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs uppercase text-gray-500 block">
                                        Date Paid
                                    </span>
                                    <div className="font-bold">
                                        {application.or_date}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. SIGNATURE AREA */}
                <div className="mt-16 grid grid-cols-2 gap-10">
                    <div className="text-center">
                        <div className="border-b border-black mb-2 h-8"></div>
                        <p className="font-bold uppercase">
                            {application.operator_name}
                        </p>
                        <p className="text-xs">Signature of Applicant</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b border-black mb-2 h-8"></div>
                        <p className="font-bold uppercase">
                            Municipal Treasurer / Staff
                        </p>
                        <p className="text-xs">Verified By</p>
                    </div>
                </div>

                {/* NO-PRINT BUTTON (To go back) */}
                <div className="absolute top-4 right-4 print:hidden">
                    <button
                        onClick={() => window.history.back()}
                        className="bg-gray-500 text-white px-4 py-2 rounded shadow hover:bg-gray-600"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>

            {/* CSS to clean up print view */}
            <style>{`
                @media print {
                    @page { margin: 0.5in; }
                    body { background: white; }
                    .print\\:hidden { display: none !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:w-full { width: 100% !important; }
                }
            `}</style>
        </div>
    );
}
