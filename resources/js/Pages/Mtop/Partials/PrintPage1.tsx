import React from "react";
import { usePage } from "@inertiajs/react";

interface Props {
    application: any;
    operatorName: string;
}

export default function PrintPage1({ application, operatorName }: Props) {
    const { printSettings } = usePage().props as any;

    // Helper to format date like "February 3, 2026"
    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };
    const toTitleCase = (str: string) => {
        if (!str) return "";
        return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    };
    const transactionDate = application.transaction_date
        ? formatDate(application.transaction_date)
        : "_________________";

    return (
        <div
            className="w-full h-[11.69in] relative flex flex-col bg-white overflow-hidden text-black leading-tight"
            style={{ fontFamily: "Tahoma, sans-serif" }}
        >
            {printSettings?.show_header && printSettings?.header_path && (
                <div className="w-full mb-2 px-2 mt-2">
                    <img
                        src={`/storage/${printSettings.header_path}`}
                        alt="Header"
                        className="w-full object-contain max-h-32"
                    />
                </div>
            )}

            {/* CONTENT BODY - Padding px-12 is exactly 0.5 inches */}
            <div className="px-12 flex flex-col">
                {/* 1. OFFICE HEADER (12pt, Bold, Center, 1.0 spacing) */}
                <div className="text-center font-bold uppercase text-[12pt] leading-none mb-8 mt-4">
                    <p>TANGGAPAN NG</p>
                    <p>MUNICIPAL TRYCICLE FRANCHISING AND REGULATORY BOARD</p>
                </div>

                {/* 2. DATE (Right, Bold, 11px, 1.15 spacing) */}
                <div className="flex justify-end mb-8">
                    <div className="text-right font-bold text-[11pt] leading-[1.15]">
                        {transactionDate}
                    </div>
                </div>

                {/* 3. TITLE (13pt, Center, Bold, 1.15 spacing) */}
                <div className="text-center font-bold uppercase mb-8 text-[13pt] leading-[1.15]">
                    <p>
                        APLIKASYON PARA SA MOTORIZED TRICYCLE OPERATOR’S PERMIT
                        (MTOP)
                    </p>
                </div>

                {/* 4. USAPIN BILANG - RIGHT SIDE (Bold Label 12px) */}
                <div className="flex justify-end mb-8 text-[12pt] leading-[1.15]">
                    <div>
                        <span>Usapin Bilang:</span>{" "}
                        <span className="font-bold underline">
                            {application.mt_number}
                        </span>
                    </div>
                </div>

                {/* 5. BODY PARAGRAPH 1 (Justified, 12px, 1.15 spacing) */}
                <div className="text-justify mb-8 text-[12pt] leading-[1.15]">
                    <p>
                        Ako si{" "}
                        <span className="font-bold uppercase underline">
                            {operatorName}
                        </span>
                        , may sapat na taong gulang, may
                        asawa/balo/binata/dalaga, nakatira sa{" "}
                        <span className="font-bold underline">
                            {toTitleCase(application.address)}
                        </span>
                        , ay humihiling ng pahintulot para paupahan ang isang
                        (1) traysikel na may motor na aking pag-aari bilang
                        palingkurang pangmadla sa bayan ng Gerona, arabal o
                        kalapit na lugar at iba pa na makikita ayon sa mga
                        sumusunod:
                    </p>
                </div>

                {/* 6. TABLE (Italic Headers - NOT BOLD) */}
                <div className="mb-8">
                    <table className="w-full border border-black border-collapse text-center text-[11pt]">
                        <thead>
                            <tr>
                                <th className="border border-black p-1 font-normal italic uppercase">
                                    GAWA AT URI
                                </th>
                                <th className="border border-black p-1 font-normal italic uppercase">
                                    MOTOR BILANG
                                </th>
                                <th className="border border-black p-1 font-normal italic uppercase">
                                    TSASI BILANG
                                </th>
                                <th className="border border-black p-1 font-normal italic uppercase">
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

                {/* 7. BODY PARAGRAPHS 2 & 3 (Justified, 12px, 1.15 spacing) */}
                <div className="space-y-4 mb-2 text-[12pt] leading-[1.15] text-justify">
                    <p className="indent-8">
                        Ako ay may kakayahang panatilihin ang paglilingkod at sa
                        pagpapatibay sa nasabing palingkurang pangmadla at ang
                        lubos na pagtangkilik ay gagawin nang maayos at naaayon
                        sa batas o legal na pamamaraan.
                    </p>
                    <p className="indent-8">
                        Ako ay susunod sa mga itinatadhana ng sinusundang batas
                        sa paglingkurang pangmadla, mga tuntunin o alituntuning
                        ipapatupad ng Municipal Tricycle Franchising and
                        Regulatory Board at iba pang umiiral na batas na
                        maaaring ipatupad. Kabilang dito ang mga sumusunod:
                    </p>
                </div>

                {/* 8. LIST (Justified, 12px, 1.15 spacing) */}
                <div className="mb-8 text-[12pt] leading-[1.15] text-justify">
                    <ol className="list-decimal ml-10 space-y-1">
                        <li className="pl-2">
                            Ang Motorized Tricycle Operator's Permit (MTOP) ay
                            may bisa na tatlong (3) taon;
                        </li>
                        <li className="pl-2">
                            Ang may-ari/drayber ay kinakailangang maningil
                            lamang sa pasahero ng mga pinahintulutang halagang
                            pasahe;
                        </li>
                        <li className="pl-2">
                            At anumang pagbabago, pagdaragdag, o pag-aalis na
                            ginagawa at hindi pinahintulutan dito ay sapat nang
                            magpawalang-bisa sa kasulatang ito.
                        </li>
                    </ol>
                </div>

                {/* 9. FINAL PARAGRAPH (Justified, 12px, 1.15 spacing) */}
                <div className="text-justify indent-8 mb-16 text-[12pt] leading-[1.15]">
                    <p>
                        Ang hindi ko pagsunod sa mga itinatadhana ng
                        kapahintulutang ito ay sapat nang maging dahilan upang
                        bawiin at mapasawalang-saysay ang naturang MTOP.
                    </p>
                </div>

                {/* 10. SIGNATURE AREA (Right Side, 12px, 1.15 spacing) */}
                <div className="flex justify-end mb-4">
                    <div className="text-center min-w-70">
                        <div className="font-bold uppercase border-b border-black text-[12pt] leading-[1.15] px-2 mb-1">
                            {operatorName}
                        </div>
                        <p className="text-[12pt] leading-[1.15]">
                            Pirma ng Humiling/May-ari
                        </p>
                    </div>
                </div>

                {/* Added mt-auto to push the footer to the bottom of the 11.69in page */}
                {printSettings?.show_footer && printSettings?.footer_path && (
                    <div className="w-full mt-auto mb-8 px-2">
                        <img
                            src={`/storage/${printSettings.footer_path}`}
                            alt="Footer"
                            className="w-full object-contain max-h-32"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
