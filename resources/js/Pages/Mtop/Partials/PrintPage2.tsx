//GeronaMTOP\resources\js\Pages\Mtop\Partials\PrintPage2.tsx
import React from "react";
import { usePage } from "@inertiajs/react";

interface Props {
    application: any;
    operatorName: string;
}

export default function PrintPage2({ application, operatorName }: Props) {
    const { printSettings } = usePage().props as any;

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

    const getExpiryDateUpper = (
        dateString: string,
        validUntilString?: string,
    ) => {
        if (validUntilString) {
            return new Date(validUntilString)
                .toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })
                .toUpperCase();
        }

        // Fallback just in case
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

    const formatAddress = (addr: string) => {
        if (!addr) return "";

        const parts = addr
            .split(",")
            .map((part) => part.trim())
            .filter((part) => part.length > 0);

        if (parts.length === 0) return "";

        const barangay = parts[0].toUpperCase();

        const properCase = (text: string) =>
            text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

        const rest = parts.slice(1).map(properCase);

        return [barangay, ...rest].join(", ");
    };

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
            parts.push(`${yrWord} taon`);
        }

        if (months > 0) {
            let moWord = map[months] || months.toString();
            parts.push(`${moWord} buwan`);
        }

        return parts.join(" at ");
    };

    const years = application.event?.validity_years ?? 3;
    const months = application.event?.validity_months ?? 0;

    const transactionDate = application.transaction_date
        ? formatDate(application.transaction_date)
        : "_________________";
    let paidByName = "";
    if (application.show_paid_by) {
        paidByName = `${application.paid_by_first_name || ""} ${application.paid_by_middle_name
            ? application.paid_by_middle_name + ". "
            : ""
            }${application.paid_by_last_name || ""}${application.paid_by_suffix ? " " + application.paid_by_suffix : ""
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
                <div className="text-center font-bold uppercase text-[12pt] leading-none mt-4 mb-8">
                    <p>TANGGAPAN NG</p>
                    <p>MUNICIPAL TRYCICLE FRANCHISING AND REGULATORY BOARD</p>
                </div>

                <div className="flex justify-end mb-6">
                    <div className="text-right font-bold text-[11pt] leading-[1.15]">
                        {transactionDate}
                    </div>
                </div>

                <div className="text-center font-bold uppercase mb-8 text-[14pt] leading-none">
                    <p>P A G P A P A T I B A Y</p>
                </div>

                <div className="font-bold uppercase mb-5 text-[12pt] leading-none">
                    SA SINUMANG MAAARING KAUKULAN NITO:
                </div>

                <div className="text-justify indent-8 mb-6 text-[12pt] leading-none">
                    <p>
                        Pinatutunayan nito na ayon sa mga talaan sa tanggapang
                        ito, ang nasabing pangalan/humihiling ay napagkalooban
                        ng Motorized Tricycle Operator’s Permit (MTOP):
                    </p>
                </div>

                <div className="space-y-1 mb-4 text-[12pt] leading-none">
                    <div>
                        <span className="w-56 shrink-0">
                            Pangalan ng Humihiling:
                        </span>{" "}
                        <span className="font-bold underline">
                            {operatorName}{" "}
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
                        </span>
                    </div>

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
                        {application.is_manual_validity ? (
                            <span className="w-75 shrink-0">
                                May tibay mula:
                            </span>
                        ) : (
                            <span className="w-75 shrink-0">
                                May tibay para sa loob ng{" "}
                                {formatValidity(years, months)}, mula:
                            </span>
                        )}{" "}
                        <span className="font-bold uppercase underline">
                            {formatDateUpper(application.transaction_date)} -{" "}
                            {getExpiryDateUpper(
                                application.transaction_date,
                                application.valid_until,
                            )}
                        </span>
                    </div>
                </div>

                <div className="mb-4 text-[12pt] leading-none">
                    <p>Hanggang isinalalarawan ayon sa mga sumusunod:</p>
                </div>

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
                                    {application.plate_no === 'FOR REGISTRATION' ? '' : application.plate_no}{" "}
                                    {application.body_number
                                        ? `(#${application.body_number})`
                                        : ""}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="text-justify mb-4 text-[12pt] leading-none">
                    <p>
                        Ang Pagtitibay na ito ay pinagkaloob ayon sa kahilingan
                        ng nasabing may-ari ng traysikel upang gamitin sa
                        pagpapatala sa ilalim ng hanay ng “PAUPAHAN”.
                    </p>
                </div>

                <div className="uppercase mb-4 text-[12pt]">PINAGTITIBAY:</div>

                <div
                    className={`flex justify-end mb-4 ${application.show_auth_official ? "" : "invisible"}`}
                >
                    <div className="text-center min-w-55">
                        <div className="font-bold border-b border-black text-[12pt]">
                            {application.authorized_official ||
                                "________________________"}
                        </div>
                        <div>
                            <p className="text-[11pt]">
                                Pinunong Nagsagawa ng Panunumpa at
                            </p>
                            <p className="text-[11pt]">
                                Nagbigay ng Kapahintulutan
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-start mb-4">
                    <div className="text-center min-w-55">
                        <div className="font-bold border-b border-black text-[12pt]">
                            {application.punong_bayan ||
                                "________________________"}
                        </div>
                        <p className="text-[11pt]">Punong Bayan</p>
                    </div>
                </div>

                <div className="text-[11pt] leading-none space-y-1 mb-4">
                    {application.show_or ? (
                        <div>
                            <span className="w-40.5 inline-block">
                                Bayad na sa O.R. Bilang:
                            </span>{" "}
                            <span className="font-bold underline">
                                {application.is_free
                                    ? `WAIVED ${application.event?.mandated_by ? "(" + application.event.mandated_by + ")" : ""}`
                                    : application.or_number || "_________"}
                            </span>
                        </div>
                    ) : null}

                    <div>
                        <span className="w-23 inline-block">Inisyu Noong:</span>{" "}
                        <span className="font-bold underline uppercase">
                            {application.or_date
                                ? formatDate(application.or_date)
                                : formatDate(application.transaction_date)}
                        </span>
                    </div>
                    <div className="flex">
                        <span className="w-48">Sa Gerona, Tarlac</span>
                    </div>
                </div>
                <div className="text-[11pt] leading-none text-justif mb-2">
                    <p>
                        May tibay kung orihinal o may opisyal na resibo ng
                        bayarin sa pagpapatibay at may opisyal na tuyong tatak
                        ng Sangguniang Bayan.
                    </p>
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
