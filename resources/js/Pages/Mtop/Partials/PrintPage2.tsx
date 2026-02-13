import React from "react";

interface Props {
    application: any;
    operatorName: string;
}

export default function PrintPage2({ application, operatorName }: Props) {
    return (
        // REMOVED p-10 here
        <div className="h-[11.69in] w-full relative flex flex-col bg-white overflow-hidden">
            {/* HEADER: Full Width */}
            <div className="w-full px-2">
                <img
                    src="/images/gerona-header.png"
                    alt="Municipality of Gerona Header"
                    className="w-full object-cover"
                />
            </div>

            {/* CONTENT: Padding added here */}
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

                <p className="text-base text-center font-bold mt-2 uppercase underline">
                    pagpapatibay
                </p>

                <div className="mt-4 text-justify leading-snug text-sm">
                    <p className="text-sm text-left font-bold mt-2 uppercase">
                        sa sinumang maaring kaakulan nito:
                    </p>
                    <p className="mt-4 mb-4 indent-8">
                        Pinatutunayan nito na ayon sa mga talaan sa tanggapang
                        ito, ang nasabing pangalan/humihiling ay napagkalooban
                        ng Motorized Tricycle Operator's Permit (MTOP):
                    </p>

                    <div className="flex justify-between w-full px-4">
                        <div className="space-y-1">
                            <p>
                                Pangalan ng Humihiling:{" "}
                                <span className="font-bold uppercase underline ml-2">
                                    {operatorName}
                                </span>
                            </p>
                            <p>
                                Tirahan:{" "}
                                <span className="font-bold underline ml-2">
                                    {application.address}
                                </span>
                            </p>
                            <p>
                                Uri ng Palingkuran:{" "}
                                <span className="font-bold ml-2">
                                    Paupahang Traysikel na may Motor
                                </span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p>
                                Usaping Bilang:{" "}
                                <span className="font-bold underline ml-2">
                                    {application.mt_number}
                                </span>
                            </p>
                        </div>
                    </div>

                    <p className="mt-6 mb-4">
                        Pinahihintulutang Ruta:{" "}
                        <span className="font-bold underline ml-2">
                            Nasasakupan ng Gerona, Tarlac, at iba pa.
                        </span>
                    </p>

                    <p className="mt-4 mb-4">
                        May bisa para sa loob ng tatlong taon, mula:{" "}
                        <span className="font-bold underline ml-2">
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

                    <table className="w-full border border-black border-collapse text-xs mt-6">
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

                    <p className="mt-8 mb-4 font-bold uppercase">PAGTITIBAY:</p>

                    <div className="mt-8 flex justify-end">
                        <div className="flex flex-col items-center w-72">
                            <div className="w-full border-b border-black">
                                <p className="font-bold uppercase text-sm text-center">
                                    {application.authorized_official || "N/A"}
                                </p>
                            </div>
                            <p className="text-xs text-center mt-1">
                                Pinunong Nagsagawa ng panunumpa at
                                <span className="block">
                                    Nagbigay ng Kapahintulutan
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="mt-16 flex justify-start">
                        <div className="flex flex-col items-center w-72">
                            <div className="w-full border-b border-black">
                                <p className="font-bold uppercase text-sm text-center">
                                    {application.punong_bayan || "N/A"}
                                </p>
                            </div>
                            <p className="text-xs text-center mt-1">
                                Punong Bayan
                            </p>
                        </div>
                    </div>

                    <div className="text-xs mt-12 px-4">
                        <div className="grid grid-cols-2">
                            <div>
                                <p>
                                    Bayad sa O.R. Bilang:{" "}
                                    <span className="font-bold underline ml-1">
                                        {application.or_number}
                                    </span>
                                </p>
                                <p>
                                    Inisyu Noong:{" "}
                                    <span className="font-bold underline ml-1">
                                        {application.or_date
                                            ? new Date(
                                                  application.or_date,
                                              ).toLocaleDateString("en-PH", {
                                                  year: "numeric",
                                                  month: "long",
                                                  day: "numeric",
                                              })
                                            : "N/A"}
                                    </span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p>Sa Gerona, Tarlac</p>
                            </div>
                        </div>
                    </div>

                    <p className="mt-8 italic text-[10px] text-center text-gray-500">
                        May tibay kung orihinal o may opisyal na resibo ng
                        bayarin sa pagpapatibay at may opisyal na tuyong tatak
                        ng Sangguniang Bayan.
                    </p>
                </div>
            </div>
        </div>
    );
}
