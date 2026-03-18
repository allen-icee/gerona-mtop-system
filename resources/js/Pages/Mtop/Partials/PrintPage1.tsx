import React from "react";
import { usePage } from "@inertiajs/react";

interface Props {
    application: any;
    operatorName: string;
}

export default function PrintPage1({ application, operatorName }: Props) {
    const { printSettings } = usePage().props as any;

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

    // BAGONG FUNCTION: Matalinong inaalam kung taon lang, buwan lang, o pareho
    const formatValidity = (years: number, months: number) => {
        const map: Record<number, string> = {
            1: "isang",
            2: "dalawang",
            3: "tatlong",
            4: "apat na",
            5: "limang",
            6: "anim na",
            7: "pitong",
            8: "walong",
            9: "siyam na",
            10: "sampung",
            11: "labing-isang",
            12: "labing dalawang",
        };

        let parts = [];

        if (years > 0) {
            let yrWord = map[years] || years.toString();
            parts.push(`${yrWord} (${years}) taon`);
        }

        if (months > 0) {
            let moWord = map[months] || months.toString();
            parts.push(`${moWord} (${months}) buwan`);
        }

        return parts.join(" at ");
    };

    // Default to 3 years and 0 months if not set by an event
    const years = application.event?.validity_years ?? 3;
    const months = application.event?.validity_months ?? 0;

    const transactionDate = application.transaction_date
        ? formatDate(application.transaction_date)
        : "_________________";

    let paidByName = "";
    if (application.show_paid_by) {
        paidByName = `${application.paid_by_first_name || ""} ${
            application.paid_by_middle_name
                ? application.paid_by_middle_name + ". "
                : ""
        }${application.paid_by_last_name || ""}${
            application.paid_by_suffix ? " " + application.paid_by_suffix : ""
        }`.trim();
    }

    return (
        <div
            className="w-full h-[11.69in] relative flex flex-col bg-white overflow-hidden text-black leading-tight"
            style={{ fontFamily: "Tahoma, sans-serif" }}
        >
            {printSettings?.show_header && (
                <div className="w-full mb-2 px-2 mt-2">
                    <img
                        src={
                            printSettings?.header_path
                                ? `/storage/${printSettings.header_path}`
                                : `/images/Gerona_Header.jpg`
                        }
                        alt="Header"
                        className="w-full object-contain max-h-32"
                    />
                </div>
            )}

            <div className="px-12 flex flex-col">
                <div className="text-center font-bold uppercase text-[12pt] leading-none mb-8 mt-4">
                    <p>TANGGAPAN NG</p>
                    <p>MUNICIPAL TRICYCLE FRANCHISING AND REGULATORY BOARD</p>
                </div>

                <div className="flex justify-end mb-8">
                    <div className="text-right font-bold text-[11pt] leading-[1.15]">
                        {transactionDate}
                    </div>
                </div>

                <div className="text-center font-bold uppercase mb-8 text-[13pt] leading-[1.15]">
                    <p>
                        APLIKASYON PARA SA MOTORIZED TRICYCLE OPERATOR’S PERMIT
                        (MTOP)
                    </p>
                </div>

                <div className="flex justify-end mb-8 text-[12pt] leading-[1.15]">
                    <div>
                        <span>Usapin Bilang:</span>{" "}
                        <span className="font-bold underline">
                            {application.mt_number}
                        </span>
                    </div>
                </div>

                <div className="text-justify mb-8 text-[12pt] leading-[1.15]">
                    <p>
                        Ako si{" "}
                        <span className="font-bold uppercase underline">
                            {operatorName}
                        </span>
                        {application.show_paid_by && paidByName ? (
                            <>
                                {" "}
                                <span className="font-bold underline">
                                    Paid by:
                                </span>
                                <span className="font-bold uppercase underline">
                                    {" "}
                                    {paidByName}
                                </span>
                            </>
                        ) : null}
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

                <div className="mb-8 text-[12pt] leading-[1.15] text-justify">
                    <ol className="list-decimal ml-10 space-y-1">
                        {/* DITO NA-APPLY ANG BAGONG LOGIC */}
                        <li className="pl-2">
                            Ang Motorized Tricycle Operator's Permit (MTOP) ay
                            may bisa{" "}
                            {application.is_manual_validity
                                ? `hanggang ${formatDate(application.valid_until)}`
                                : `na ${formatValidity(years, months)}`}
                            ;
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

                <div className="text-justify indent-8 mb-8 text-[12pt] leading-[1.15]">
                    <p>
                        Ang hindi ko pagsunod sa mga itinatadhana ng
                        kapahintulutang ito ay sapat nang maging dahilan upang
                        bawiin at mapasawalang-saysay ang naturang MTOP.
                    </p>
                </div>

                <div className="flex justify-end mb-4">
                    <div className="text-center min-w-65">
                        <div className="font-bold uppercase border-b border-black text-[12pt] leading-[1.15] px-2 mb-1">
                            {application.show_paid_by && paidByName
                                ? paidByName
                                : operatorName}
                        </div>
                        <p className="text-[12pt] leading-[1.15]">
                            Pirma ng Humiling/May-ari
                        </p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <div className="text-left italic text-[10pt] leading-[1.15] min-w-65">
                        {application.show_cedula ? (
                            <div>
                                <span className="w-25.5 inline-block">
                                    SEDULA BILANG:
                                </span>{" "}
                                <span className="underline">
                                    {application.cedula_number || "_________"}
                                </span>
                            </div>
                        ) : null}

                        <div>
                            <span className="w-9 inline-block">Petsa:</span>{" "}
                            <span
                                className={
                                    application.show_cedula &&
                                    application.cedula_date
                                        ? "underline"
                                        : ""
                                }
                            >
                                {application.show_cedula
                                    ? application.cedula_date
                                        ? formatDate(application.cedula_date)
                                        : "_________"
                                    : ""}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {printSettings?.show_footer && printSettings?.footer_path && (
                <div className="w-full mt-auto mb-2 px-2">
                    <img
                        src={`/storage/${printSettings.footer_path}`}
                        alt="Footer"
                        className="w-full object-contain max-h-32"
                    />
                </div>
            )}
        </div>
    );
}
