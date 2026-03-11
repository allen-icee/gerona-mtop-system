import { Head } from "@inertiajs/react";
import { useEffect } from "react";

const FEE_LABELS = {
    reg_filing_fee: "REG./Filing Fee",
    franchise_fee: "Franchise Fee",
    mayors_permit: "Mayor's Permit",
    supervisor_fee: "Supervisor Fee",
    account_clearance: "Account Clearance",
    sticker_fee: "Sticker Fee",
    id_driver_operator_owner: "I.D. (DRIVER/OPERATOR/OWNER)",
    body_number_plate: "Body Number/Plate",
    penalty: "Penalty",
};

// Utility to convert number to words (Simplified for Philippine Currency)
function numberToWords(amount: number): string {
    const ones = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
    const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];

    function convertWhole(num: number): string {
        if (num === 0) return "ZERO";
        if (num < 20) return ones[num];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + ones[num % 10] : "");
        if (num < 1000) return ones[Math.floor(num / 100)] + " HUNDRED" + (num % 100 !== 0 ? " AND " + convertWhole(num % 100) : "");
        if (num < 1000000) return convertWhole(Math.floor(num / 1000)) + " THOUSAND" + (num % 1000 !== 0 ? " " + convertWhole(num % 1000) : "");
        return num.toString();
    }

    const wholePart = Math.floor(amount);
    const decimalPart = Math.round((amount - wholePart) * 100);

    let result = convertWhole(wholePart) + " PESOS";
    if (decimalPart > 0) {
        result += ` AND ${decimalPart}/100 CENTAVOS`;
    } else {
        result += " ONLY";
    }

    return result;
}

interface Props {
    record: any;
    feeSettings: any;
}

export default function Print({ record, feeSettings }: Props) {
    useEffect(() => {
        setTimeout(() => {
            window.print();
        }, 1000);
    }, []);

    const payorName = `${record.payor_first_name} ${record.payor_middle_name ? record.payor_middle_name + " " : ""}${record.payor_last_name} ${record.payor_suffix || ""}`.trim();
    const amountInWords = numberToWords(Number(record.total_amount));
    const activeFees = Object.keys(record.fee_breakdown || {}).filter(key => record.fee_breakdown[key]);

    return (
        /* Changed 'justify-center' to 'justify-start' and added 'p-0' to keep it left-aligned */
        <div className="min-h-screen bg-[#525659] flex justify-start p-0 print:bg-white print:block">
            <Head title={`Print OR - ${record.or_number}`} />

            <style>
                {`
                    @page {
                        size: A4; /* Standard A4 Paper */
                        margin: 0;
                    }
                    @media print {
                        body {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                    }
                `}
            </style>

            {/* MASTER CONTAINER
               Left-aligned by default. Absolute positions inside
               remain relative to this 100mm x 200mm box.
            */}
            <div className="relative w-[100mm] h-[200mm] min-w-[100mm] min-h-[200mm] overflow-hidden box-border bg-white bg-[url('/images/or_guide.jpg')] bg-[length:100mm_200mm] bg-no-repeat bg-left-top print:bg-none print:bg-transparent font-mono text-[11pt] font-bold text-black flex-shrink-0">

                {/* Date */}
                <div className="absolute whitespace-nowrap top-[42.5mm] left-[47mm]">
                    {record.transaction_date}
                </div>

                {/* Agency */}
                <div className="absolute whitespace-nowrap top-[50.5mm] left-[20mm]">
                    {record.agency || "LGU GERONA"}
                </div>

                {/* Payor Name */}
                <div className="absolute whitespace-nowrap top-[58mm] left-[17mm]">
                    {payorName}
                </div>

                {/* Fees Breakdown List */}
                <div className="absolute top-[77.5mm] left-[6mm] w-[80mm] leading-[0.97]">
                    {activeFees.map((feeKey) => (
                        <div key={feeKey} className="flex justify-between mb-1">
                            <span>{FEE_LABELS[feeKey as keyof typeof FEE_LABELS]}</span>
                            <span>{Number(feeSettings[feeKey] || 0).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                {/* Total Amount (Numeric) */}
                <div className="absolute whitespace-nowrap top-[121mm] left-[77mm]">
                    {Number(record.total_amount).toFixed(2)}
                </div>

                {/* Total Amount (In Words) with Text Indent */}
                <div className="absolute top-[129mm] left-[10mm] w-[85mm] indent-[25mm] leading-snug break-words tracking-tight">
                    {amountInWords.toUpperCase()}
                </div>

                {/* Cash Checkbox Mark */}
                <div className="absolute whitespace-nowrap top-[140mm] left-[7mm] text-[14pt]">
                    ✓
                </div>

                {/* Dashes/Separators */}
                <div className="absolute whitespace-nowrap top-[147mm] left-[39mm] text-[14pt]">--</div>
                <div className="absolute whitespace-nowrap top-[147mm] left-[60mm] text-[14pt]">--</div>
                <div className="absolute whitespace-nowrap top-[147mm] left-[82mm] text-[14pt]">--</div>

                {/* Collecting Officer */}
                <div className="absolute whitespace-nowrap top-[170mm] left-[42mm]">
                    {record.collecting_officer}
                </div>
            </div>
        </div>
    );
}
