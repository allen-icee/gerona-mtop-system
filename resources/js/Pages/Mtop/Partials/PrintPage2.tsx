import React from "react";

interface Props {
    application: any;
    operatorName: string;
}

export default function PrintPage2({ application, operatorName }: Props) {
    // Helpers
    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDateUpper = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString)
            .toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
            .toUpperCase();
    };

    const getExpiryDateUpper = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const expiry = new Date(date.setFullYear(date.getFullYear() + 3));
        return expiry
            .toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
            .toUpperCase();
    };

    // Helper for address formatting (first part uppercase if it's the barangay)
    const formatAddress = (addr: string) => {
        if (!addr) return "";

        // Split and clean parts
        const parts = addr
            .split(",")
            .map((part) => part.trim())
            .filter((part) => part.length > 0);

        if (parts.length === 0) return "";

        // First part (Barangay) → FULL UPPERCASE
        const barangay = parts[0].toUpperCase();

        // Remaining parts → Proper Case (Gerona, Tarlac)
        const properCase = (text: string) =>
            text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

        const rest = parts.slice(1).map(properCase);

        return [barangay, ...rest].join(", ");
    };

    const transactionDate = application.transaction_date
        ? formatDate(application.transaction_date)
        : "_________________";

    return (
        <div
            className="w-full h-[11.69in] relative flex flex-col bg-white overflow-hidden text-black leading-tight"
            style={{ fontFamily: "Tahoma, sans-serif" }}
        >
            {/* HEADER IMAGE */}
            <div className="w-full mb-2 px-2 mt-2">
                <img
                    src="/images/gerona-header.png"
                    alt="Municipality of Gerona Header"
                    className="w-full object-contain max-h-32"
                />
            </div>

            {/* CONTENT BODY */}
            <div className="px-12 flex flex-col">
                {/* 1. OFFICE HEADER (Match Page 1: 12pt, Bold, Center, 1.0) */}
                <div className="text-center font-bold uppercase text-[12pt] leading-none mt-4 mb-8">
                    <p>TANGGAPAN NG</p>
                    <p>MUNICIPAL TRYCICLE FRANCHISING AND REGULATORY BOARD</p>
                </div>

                {/* 2. DATE (Right, Bold, 11pt, 1.15) - Matching Page 1 style */}
                <div className="flex justify-end mb-6">
                    <div className="text-right font-bold text-[11pt] leading-[1.15]">
                        {transactionDate}
                    </div>
                </div>

                {/* 3. TITLE (14pt, Bold, No Underline, Leading 1.0, Spaced) */}
                <div className="text-center font-bold uppercase mb-8 text-[14pt] leading-none">
                    <p>P A G P A P A T I B A Y</p>
                </div>

                {/* 4. SALUTATION (12pt, Bold, Leading 1.0) */}
                <div className="font-bold uppercase mb-5 text-[12pt] leading-none">
                    SA SINUMANG MAAARING KAUKULAN NITO:
                </div>

                {/* 5. OPENING PARAGRAPH (12pt, Leading 1.0, Indent 8) */}
                <div className="text-justify indent-8 mb-6 text-[12pt] leading-none">
                    <p>
                        Pinatutunayan nito na ayon sa mga talaan sa tanggapang
                        ito, ang nasabing pangalan/humihiling ay napagkalooban
                        ng Motorized Tricycle Operator’s Permit (MTOP):
                    </p>
                </div>

                {/* 6. DETAILS BLOCK (12pt, Leading 1.0) */}
                <div className="space-y-1 mb-4 text-[12pt] leading-none">
                    <div>
                        <span className="w-56 shrink-0">
                            Pangalan ng Humihiling:
                        </span>{" "}
                        <span className="font-bold uppercase underline">
                            {operatorName}
                        </span>
                    </div>

                    {/* Tirahan + Usapin Bilang Line */}
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="w-56 shrink-0">Tirahan:</span>{" "}
                            <span className="font-bold underline normal-case">
                                {formatAddress(application.address)}
                            </span>
                        </div>
                        <div>
                            <span>Usaping Bilang:</span>{" "}
                            <span className="font-bold underline">
                                {application.mt_number}
                            </span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <span className="w-56 shrink-0">
                            Uri ng Palingkuran:
                        </span>{" "}
                        <span>Paupahang Traysikel na may Motor</span>
                    </div>
                    <div className="mb-6">
                        <span className="w-56 shrink-0">
                            Pinahihintulutang Ruta:
                        </span>{" "}
                        <span className="font-bold underline">
                            Nasasakupan ng Gerona, Tarlac, at iba pa.
                        </span>
                    </div>
                    <div className="mb-4">
                        <span className="w-75 shrink-0">
                            May tibay para sa loob ng tatlong taon, mula:
                        </span>{" "}
                        <span className="font-bold uppercase underline">
                            {formatDateUpper(application.transaction_date)} -{" "}
                            {getExpiryDateUpper(application.transaction_date)}
                        </span>
                    </div>
                </div>

                {/* 7. TABLE INTRO */}
                <div className="mb-6 text-[12pt] leading-none">
                    <p>Hanggang isinalalarawan ayon sa mga sumusunod:</p>
                </div>

                {/* 8. TABLE */}
                <div className="mb-6">
                    <table className="w-full border border-black border-collapse text-center text-[12pt]">
                        <thead>
                            <tr>
                                <th className="border border-black p-1 italic uppercase font-normal">
                                    GAWA AT URI
                                </th>
                                <th className="border border-black p-1 italic uppercase font-normal">
                                    MOTOR BILANG
                                </th>
                                <th className="border border-black p-1 italic uppercase font-normal">
                                    TSASI BILANG
                                </th>
                                <th className="border border-black p-1 italic uppercase font-normal">
                                    PLAKA BILANG
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-black p-1 font-bold uppercase">
                                    {application.make_type}
                                </td>
                                <td className="border border-black p-1 font-bold uppercase">
                                    {application.engine_motor_no}
                                </td>
                                <td className="border border-black p-1 font-bold uppercase">
                                    {application.chassis_no}
                                </td>
                                <td className="border border-black p-1 font-bold uppercase">
                                    {application.plate_no}{" "}
                                    {application.body_number
                                        ? `(#${application.body_number})`
                                        : ""}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 9. CLOSING PARAGRAPH (No Indent, 12pt, Leading 1.0) */}
                <div className="text-justify mb-8 text-[12pt] leading-none">
                    <p>
                        Ang Pagtitibay na ito ay pinagkaloob ayon sa kahilingan
                        ng nasabing may-ari ng traysikel upang gamitin sa
                        pagpapatala sa ilalim ng hanay ng “PAUPAHAN”.
                    </p>
                </div>

                {/* 10. PINAGTITIBAY Header (Left, 12pt) */}
                <div className="uppercase mb-4 text-[12pt]">PINAGTITIBAY:</div>

                {/* 11. SIGNATORIES */}

                {/* Authorized Official (Right Aligned) */}
                <div className="flex justify-end mb-8">
                    <div className="text-center min-w-55">
                        <div className="font-bold uppercase border-b border-black text-[12pt]">
                            {application.authorized_official ||
                                "________________________"}
                        </div>
                        <p className="text-[11pt]">
                            Pinunong Nagsagawa ng Panunumpa at
                        </p>
                        <p className="text-[11pt]">
                            Nagbigay ng Kapahintulutan
                        </p>
                    </div>
                </div>

                {/* Punong Bayan (Left Aligned) */}
                <div className="flex justify-start mb-8">
                    <div className="text-center min-w-55">
                        <div className="font-bold uppercase border-b border-black text-[12pt]">
                            {application.punong_bayan ||
                                "________________________"}
                        </div>
                        <p className="text-[11pt]">Punong Bayan</p>
                    </div>
                </div>

                {/* 12. FOOTER DETAILS (Left, 11pt, Leading 1.0, Values Bold & Underline) */}
                <div className="text-[11pt] leading-none space-y-1 mb-6">
                    <div>
                        <span className="w-48">Bayad na sa O.R. Bilang:</span>{" "}
                        <span className="font-bold underline">
                            {application.or_number || "_________"}
                        </span>
                    </div>
                    <div>
                        <span className="w-48">Inisyu Noong:</span>{" "}
                        <span className="font-bold underline">
                            {transactionDate}
                        </span>
                    </div>
                    <div className="flex">
                        <span className="w-48">Sa Gerona, Tarlac</span>
                    </div>
                </div>

                {/* 13. DISCLAIMER (11pt, Leading 1.0, Not Italic) */}
                <div className="text-[11pt] leading-none text-justify">
                    <p>
                        May tibay kung orihinal o may opisyal na resibo ng
                        bayarin sa pagpapatibay at may opisyal na tuyong tatak
                        ng Sangguniang Bayan.
                    </p>
                </div>
            </div>
        </div>
    );
}
