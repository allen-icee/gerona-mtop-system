import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";

export default function OfficialReceiptForm({ data, setData, errors }: any) {
    return (
        <div className="space-y-2">
            {/* Section Header */}
            <div className="flex items-center gap-2 text-gray-800 border-b border-gray-200 pb-2">
                <Icon
                    icon="solar:bill-check-bold"
                    className="text-purple-600"
                    width="20"
                />
                <h3 className="font-bold text-base uppercase tracking-wide">
                    Official Receipt Details
                </h3>
            </div>

            {/* Changed to grid-cols-1 for vertical stacking */}
            <div className="grid grid-cols-1 gap-4">
                <InputGroup
                    id="or_number"
                    label="O.R. No."
                    name="or_number"
                    value={data.or_number}
                    onChange={(e: any) => {
                        const val = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9-]/g, "");
                        setData("or_number", val);
                    }}
                    icon="solar:hashtag-bold"
                    placeholder="e.g. OR-12345"
                    required={true}
                />
                <InputGroup
                    id="or_date"
                    label="Date Paid"
                    name="or_date"
                    type="date"
                    value={data.or_date}
                    onChange={(e: any) => setData("or_date", e.target.value)}
                    icon="solar:calendar-date-bold"
                    required={true}
                />
            </div>
        </div>
    );
}
