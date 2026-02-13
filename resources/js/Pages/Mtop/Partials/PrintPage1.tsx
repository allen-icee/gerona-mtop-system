import React from "react";

interface Props {
    application: any;
    operatorName: string;
}

export default function PrintPage1({ application, operatorName }: Props) {
    return (
        // REMOVED p-10 here so header can touch edges
        <div className="h-[11.69in] w-full relative flex flex-col bg-white overflow-hidden">
            {/* HEADER: Full Width, No Padding */}
            <div className="w-full px-2">
                <img
                    src="/images/gerona-header.png"
                    alt="Municipality of Gerona Header"
                    className="w-full object-cover"
                />
            </div>

            {/* CONTENT: Padding added here instead */}
            <div className="px-12 pb-12 pt-2 grow flex flex-col">
                <p className="text-sm text-center font-bold uppercase mt-2">
                    Tanggapan ng
                    <br />
                    Municipal Tricycle Franchising and Regulatory Board
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
                    Aplikasyon para sa motorized tricycle operator's permit
                    (MTOP)
                </p>

                <div className="flex justify-end text-sm font-bold mt-1">
                    <span>Usaping Bilang: </span>
                    <span className="ml-2 text-sm underline">
                        {application.mt_number}
                    </span>
                </div>

                <div className="space-y-4 mt-4 text-justify leading-snug text-sm">
                    <p className="indent-8">
                        Ako si{" "}
                        <span className="font-bold uppercase underline">
                            {operatorName}
                        </span>
                        , may sapat na taong gulang, may
                        asawa/balo/binata/dalaga, nakatira sa{" "}
                        <span className="font-bold underline">
                            {application.address}
                        </span>
                        , ay humihiling ng pahintulot para paupahan ang (1)
                        traysikel na may motor na aking pag-aari bilang
                        palingkurang pangmadla sa bayan ng Gerona, arabal o
                        kalapit na lugar at iba pa na makikita ayon sa mga
                        sumusunod:
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
                                        {application.plate_no} (#
                                        {application.body_number})
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 mb-12">
                        <p className="indent-8 mb-2">
                            Ako ay may kakayahang panatilihin ang paglilingkod
                            at sa pagpapatibay sa nasabing palingkurang
                            pangmadla at ang lubos na pagtangkilik ay gagawin
                            nang maayos at naaayon sa batas o legal na
                            pamamaraan.
                        </p>
                        <p className="indent-8 mb-2">
                            Ako ay susunod sa mga itinatadhana ng sinusundang
                            batas sa paglingkurang pangmadla, mga tuntunin o
                            alituntuning ipapatupad ng Municipal Tricycle
                            Franchising and Regulatory Board at iba pang umiiral
                            na batas na maaaring ipatupad. Kabilang dito ang mga
                            sumusunod:
                        </p>
                        <ol className="list-decimal ml-12 mb-2 text-sm space-y-1">
                            <li>
                                Ang Motorized Tricycle Operator's Permit (MTOP)
                                ay may bisa na tatlong (3) taon;
                            </li>
                            <li>
                                Ang may-ari/drayber ay kinakailangang maningil
                                lamang sa pasahero ng mga pinahintulutang
                                halagang pasahe;
                            </li>
                            <li>
                                At anumang pagbabago, pagdaragdag, o pag-aalis
                                na ginagawa at hindi pinahintulutan dito ay
                                sapat nang magpawalang-bisa sa kasulatang ito.
                            </li>
                        </ol>
                        <p className="indent-8 text-sm mt-4">
                            Ang hindi ko pagsunod sa mga itinatadhana ng
                            kapahintulutang ito ay sapat nang maging dahilan
                            upang bawiin at mapasawalang-saysay ang naturang
                            MTOP.
                        </p>
                    </div>
                </div>

                <div className="mt-auto mb-20 flex justify-end">
                    <div className="flex flex-col items-center w-64">
                        <div className="relative w-full mb-1 border-b border-black">
                            <p className="font-bold uppercase text-sm text-center">
                                {operatorName}
                            </p>
                        </div>
                        <p className="text-xs text-center mt-1 mb-2">
                            Pirma ng Humiling/ May-ari
                        </p>

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
    );
}
