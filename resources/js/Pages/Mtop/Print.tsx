import { Head } from "@inertiajs/react";
import { MtopApplication } from "@/types";
import { useEffect } from "react";

export default function Print({
    application,
}: {
    application: MtopApplication;
}) {
    useEffect(() => {
        window.print();
    }, []);

    return (
        <div className="bg-gray-100 min-h-screen p-4 flex justify-center text-gray-900">
            <Head title="Print MTOP" />

            <div className="bg-white w-204">
                {/* ================= PAGE 1 ================= */}
                <div className="p-10 print:min-h-0">
                    {/* HEADER */}
                    <div className="text-center mb-4">
                        <img
                            src="/images/gerona-header.png"
                            alt="Municipality of Gerona Header"
                            className="mx-auto w-[95%] max-h-36 object-contain"
                        />
                    </div>

                    {/* CASE NUMBER & DATE */}
                    <div className="px-6 grow">
                        <p className="text-sm text-center font-bold uppercase mt-4">
                            Tanggapan ng
                            <br />
                            Municipal Trycicle Franchising and Regulatory Board
                        </p>

                        <div className="w-full flex justify-end mb-2">
                            <span className="font-bold text-sm">
                                {application.transaction_date
                                    ? new Date(
                                          application.transaction_date,
                                      ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                      })
                                    : "N/A"}
                            </span>
                        </div>

                        <p className="text-base text-center font-bold mt-2 uppercase">
                            Aplikasyon para sa motorized tricycle operator's
                            permit (MTOP)
                        </p>

                        <div className="flex justify-end text-sm font-bold mt-1">
                            <span>Usaping Bilang: </span>
                            <span className="ml-2 text-sm">
                                {application.mt_number}
                            </span>
                        </div>

                        {/* OPERATOR PARAGRAPHS & TABLE */}
                        <div className="space-y-4 mt-4 text-justify leading-snug text-sm">
                            <p className="indent-6">
                                Ako si{" "}
                                <span className="font-bold uppercase underline">
                                    {application.operator_name}
                                </span>
                                , may sapat na taong gulang, may
                                asawa/balo/binata/dalaga, nakatira sa{" "}
                                <span className="font-bold underline">
                                    {application.address}
                                </span>
                                , ay humihiling ng pahintulot para paupahan ang
                                (1) traysikel na may motor na aking pag-aari
                                bilang palingkurang pangmadla sa bayan ng
                                Gerona, arabal o kalapit na lugar at iba pa na
                                makikita ayon sa mga sumusunod:
                            </p>

                            <div className="mt-2 overflow-x-auto">
                                <table className="w-full border border-black border-collapse text-xs">
                                    <thead>
                                        <tr>
                                            <th className="border border-black px-1 py-1 uppercase italic font-normal text-center">
                                                Gawa at Uri
                                            </th>
                                            <th className="border border-black px-1 py-1 uppercase italic font-normal text-center">
                                                Motor Bilang
                                            </th>
                                            <th className="border border-black px-1 py-1 uppercase italic font-normal text-center">
                                                Tsasi Bilang
                                            </th>
                                            <th className="border border-black px-1 py-1 uppercase italic font-normal text-center">
                                                Plaka Bilang
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border border-black px-1 py-1 text-center font-bold uppercase">
                                                {application.make_type}
                                            </td>
                                            <td className="border border-black px-1 py-1 text-center font-bold uppercase">
                                                {application.engine_motor_no}
                                            </td>
                                            <td className="border border-black px-1 py-1 text-center font-bold uppercase">
                                                {application.chassis_no}
                                            </td>
                                            <td className="border border-black px-1 py-1 text-center font-bold uppercase">
                                                {application.plate_no} (
                                                {application.body_number})
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 mb-12">
                                <p className="indent-6 mb-2">
                                    Ako ay may kakayahang panatilihin ang
                                    paglilingkod at sa pagpapatibay sa nasabing
                                    palingkurang pangmadla at ang lubos na
                                    pagtangkilik ay gagawin nang maayos at
                                    naaayon sa batas o legal na pamamaraan.
                                </p>
                                <p className="indent-6 mb-2">
                                    Ako ay susunod sa mga itinatadhana ng
                                    sinusundang batas sa paglingkurang
                                    pangmadla, mga tuntunin o alituntuning
                                    ipapatupad ng Municipal Tricycle Franchising
                                    and Regulatory Board at iba pang umiiral na
                                    batas na maaaring ipatupad. Kabilang dito
                                    ang mga sumusunod:
                                </p>
                                <ol className="list-decimal ml-10 mb-2 text-sm">
                                    <li>
                                        Ang Motorized Tricycle Operator's Permit
                                        (MTOP) ay may bisa na tatlong (3) taon;
                                    </li>
                                    <li>
                                        Ang may-ari/drayber ay kinakailangang
                                        maningil lamang sa pasahero ng mga
                                        pinahintulutang halagang pasahe;
                                    </li>
                                    <li>
                                        At anumang pagbabago, pagdaragdag, o
                                        pag-aalis na ginagawa at hindi
                                        pinahintulutan dito ay sapat nang
                                        magpawalang-bisa sa kasulatang ito.
                                    </li>
                                </ol>
                                <p className="indent-6 text-sm">
                                    Ang hindi ko pagsunod sa mga itinatadhana ng
                                    kapahintulutang ito ay sapat nang maging
                                    dahilan upang bawiin at mapasawalang-saysay
                                    ang naturang MTOP.
                                </p>
                            </div>
                        </div>

                        {/* --- SIGNATURE AREA --- */}
                        <div className="mt-8 mb-30 flex justify-end">
                            <div className="flex flex-col items-center w-64">
                                {/* Signature line with name above it */}
                                <div className="relative w-full mb-1">
                                    <p className="font-bold uppercase text-sm text-center relative z-10">
                                        {application.operator_name}
                                    </p>
                                    <div className="border-b border-black absolute bottom-0 w-full"></div>
                                </div>

                                {/* Pirma */}
                                <p className="text-xs text-center mt-1 mb-2">
                                    Pirma ng Humiling/ May-ari
                                </p>

                                {/* Cedula info */}
                                <div className="text-center text-xs">
                                    <p>
                                        <span className="font-semibold">
                                            SEDULA BILANG:
                                        </span>{" "}
                                        {application.cedula_number || "N/A"}
                                    </p>
                                    <p>
                                        <span className="font-semibold">
                                            Petsa ng Pagkuha:
                                        </span>{" "}
                                        {application.cedula_date
                                            ? new Date(
                                                  application.cedula_date,
                                              ).toLocaleDateString("en-PH", {
                                                  year: "numeric",
                                                  month: "long",
                                                  day: "numeric",
                                              })
                                            : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= PAGE BREAK ================= */}
                <div className="hidden print:block print:break-before-page"></div>

                {/* ================= PAGE 2 ================= */}
                <div className="p-10 print:min-h-0">
                    {/* HEADER */}
                    <div className="text-center mb-4">
                        <img
                            src="/images/gerona-header.png"
                            alt="Municipality of Gerona Header"
                            className="mx-auto w-FULL max-h-36 object-contain"
                        />
                    </div>

                    {/* CASE NUMBER & DATE */}
                    <div className="px-6 grow">
                        <p className="text-sm text-center font-bold uppercase mt-4">
                            Tanggapan ng
                            <br />
                            Municipal Trycicle Franchising and Regulatory Board
                        </p>

                        <div className="text-right mb-2">
                            <span className="font-bold ml-2 min-w-30 inline-block text-center text-sm">
                                {application.transaction_date}
                            </span>
                        </div>

                        <p className="text-base text-center font-bold mt-2 uppercase">
                            pagpapatibay
                        </p>
                    </div>

                    <div className="mt-4 text-justify leading-snug text-sm">
                        <p className="text-sm text-left font-bold mt-2 uppercase">
                            sa sinumang maaring kaakulan nito:
                        </p>
                        <p className="mt-4 mb-4 indent-6">
                            Pinatutunayan nito na ayon sa mga talaan sa
                            tanggapang ito, ang nasabing pangalan/humihiling ay
                            napagkalooban ng Motorized Tricycle Operator's
                            Permit (MTOP):
                        </p>

                        <div className="flex justify-between w-full">
                            {/* Left side: Name, Address, and Service Type */}
                            <div>
                                <p>
                                    Pangalan ng Humihiling:{" "}
                                    <span className="font-bold">
                                        {application.operator_name || "N/A"}
                                    </span>
                                </p>
                                <p>
                                    Tirahan:{" "}
                                    <span className="font-bold">
                                        {application.address || "N/A"}
                                    </span>
                                </p>
                                <p>
                                    Uri ng Palingkuran: Paupahang Traysikel na
                                    may Motor
                                </p>
                            </div>

                            {/* Right side: Case Number */}
                            <div className="text-right">
                                <p>
                                    Usaping Bilang:{" "}
                                    <span className="font-bold">
                                        {application.mt_number || "N/A"}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <p className="mt-4 mb-4">
                            Pinahihintulutang Ruta:{" "}
                            <span className="font-bold">
                                Nasasakupan ng Gerona, Tarlac, at iba pa.
                            </span>
                        </p>

                        <p className="mt-4 mb-4">
                            May bisa para sa loob ng tatlong taon, mula:{" "}
                            <span className="font-bold">
                                {application.transaction_date
                                    ? `${new Date(
                                          application.transaction_date,
                                      ).toLocaleDateString("en-PH", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                      })} - ${new Date(
                                          new Date(
                                              application.transaction_date,
                                          ).setFullYear(
                                              new Date(
                                                  application.transaction_date,
                                              ).getFullYear() + 3,
                                          ),
                                      ).toLocaleDateString("en-PH", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                      })}`
                                    : "N/A"}
                            </span>
                        </p>

                        <p className="mt-4 mb-4">
                            Hanggang isinalalarawan ayon sa mga sumusunod:
                        </p>

                        <div className="mt-2 overflow-x-auto">
                            <table className="w-full border border-black border-collapse text-xs">
                                <thead>
                                    <tr>
                                        <th className="border border-black px-1 py-1 uppercase italic font-normal text-center">
                                            Gawa at Uri
                                        </th>
                                        <th className="border border-black px-1 py-1 uppercase italic font-normal text-center">
                                            Motor Bilang
                                        </th>
                                        <th className="border border-black px-1 py-1 uppercase italic font-normal text-center">
                                            Tsasi Bilang
                                        </th>
                                        <th className="border border-black px-1 py-1 uppercase italic font-normal text-center">
                                            Plaka Bilang
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-black px-1 py-1 text-center font-bold uppercase">
                                            {application.make_type}
                                        </td>
                                        <td className="border border-black px-1 py-1 text-center font-bold uppercase">
                                            {application.engine_motor_no}
                                        </td>
                                        <td className="border border-black px-1 py-1 text-center font-bold uppercase">
                                            {application.chassis_no}
                                        </td>
                                        <td className="border border-black px-1 py-1 text-center font-bold uppercase">
                                            {application.plate_no} (
                                            {application.body_number})
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <p className="mt-4 mb-4 indent-6">
                                Ang Pagtitibay na ito ay pinagkaloob ayon sa
                                kahilingan ng nasabing may-ari ng traysikel
                                upang gamitin sa pagpapatala sa ilalim ng hanay
                                ng "PAUPAHAN".
                            </p>

                            <p className="mt-6 mb-4">PAGTITIBAY:</p>

                            {/* --- SIGNATURE AREA SECOND PAGE --- */}
                            <div className="mt-8 flex justify-end">
                                <div className="flex flex-col items-center w-64">
                                    <div className="relative w-full mb-1">
                                        <p className="font-bold uppercase text-sm text-center relative z-10">
                                            {application.authorized_official ||
                                                "N/A"}
                                        </p>
                                        <div className="border-b border-black absolute bottom-0 w-full"></div>
                                    </div>
                                    <p className="text-xs text-center mt-1 mb-2">
                                        Pinunong Nagsagawa ng panunumpa at
                                        <span className="block mt-1">
                                            Nagbigay ng Kapahintulutan
                                        </span>
                                    </p>
                                </div>
                            </div>
                            {/* --- SIGNATURE AREA PUNONG BAYAN --- */}
                            <div className="mt-4 flex justify-start">
                                <div className="flex flex-col items-center w-64">
                                    <div className="relative w-full mb-1">
                                        <p className="font-bold uppercase text-sm text-center relative z-10">
                                            {application.punong_bayan || "N/A"}
                                        </p>
                                        <div className="border-b border-black absolute bottom-0 w-full"></div>
                                    </div>
                                    <p className="text-xs text-center mt-1 mb-2">
                                        Punong Bayan
                                    </p>
                                </div>
                            </div>

                            <div className="text-xs">
                                <p className="m-0">
                                    Bayad sa O.R. Bilang:{" "}
                                    <span className="font-bold">
                                        {application.or_number}
                                    </span>
                                </p>
                                <p className="m-0">
                                    Inisyu Noong:{" "}
                                    <span className="font-bold">
                                        {new Date(
                                            application.transaction_date,
                                        ).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </span>
                                </p>
                                <p className="m-0">
                                    Sa{" "}
                                    <span className="font-bold">
                                        {application.address}
                                    </span>
                                </p>
                            </div>

                            <p className="mt-6">
                                May tibay kung orihinal o may opisyal na resibo
                                ng bayarin sa pagpapatibay at may opisyal na
                                tuyong tatak ng Sangguniang Bayan.
                            </p>
                        </div>
                    </div>
                </div>

                {/* BACK BUTTON */}
                <div className="absolute top-2 right-2 print:hidden">
                    <button
                        onClick={() => window.history.back()}
                        className="bg-gray-500 text-white px-3 py-1 rounded shadow hover:bg-gray-600 text-xs"
                    >
                        Back to Dashboard
                    </button>
                </div>

                <style>{`
                    @media print {
                        @page { margin: 0.35in; }
                        body { background: white; }
                        .print\\:hidden { display: none !important; }
                    }
                `}</style>
            </div>
        </div>
    );
}
