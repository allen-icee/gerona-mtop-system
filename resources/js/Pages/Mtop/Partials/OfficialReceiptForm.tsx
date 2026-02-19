import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";

export default function OfficialReceiptForm({
    data,
    setData,
    errors,
    onKeyDown,
}: any) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-700 border-b border-gray-200 pb-2">
                <h3 className="font-bold text-base uppercase tracking-wide">
                    Official Receipt Details
                </h3>
            </div>

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
                    icon="solar:hashtag-square-bold"
                    placeholder="e.g. OR-12345"
                    required={true}
                    onKeyDown={onKeyDown}
                />
                <InputGroup
                    id="or_date"
                    label="Date Paid"
                    name="or_date"
                    type="date"
                    max="9999-12-31" // <--- Stops 5 digit years
                    value={data.or_date}
                    onChange={(e: any) => setData("or_date", e.target.value)}
                    icon="solar:calendar-date-bold"
                    required={true}
                    onKeyDown={onKeyDown}
                />
            </div>
        </div>
    );
}
