import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";

export default function OfficialReceiptForm({ data, setData, errors }: any) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500 h-full">
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
                <Icon
                    icon="solar:bill-check-bold"
                    className="text-purple-600"
                    width="24"
                />
                <h3 className="text-lg font-bold text-gray-700 uppercase">
                    4. Official Receipt
                </h3>
            </div>
            <div className="space-y-4">
                <InputGroup
                    id="or_number"
                    label="O.R. No."
                    name="or_number"
                    value={data.or_number}
                    onChange={(e) => {
                        // STRICT: Letters, Numbers, Dashes. No special chars.
                        const val = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9-]/g, "");
                        setData("or_number", val);
                    }}
                    icon="solar:hashtag-bold"
                />
                <InputGroup
                    id="or_date"
                    label="Date Paid"
                    name="or_date"
                    type="date"
                    value={data.or_date}
                    onChange={(e) => setData("or_date", e.target.value)}
                    icon="solar:calendar-date-bold"
                />
            </div>
        </div>
    );
}
