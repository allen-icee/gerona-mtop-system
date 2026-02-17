import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";

export default function CedulaForm({ data, setData, errors, onKeyDown }: any) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-800 border-b border-gray-200 pb-2">
                <Icon
                    icon="solar:document-add-bold"
                    className="text-yellow-600"
                    width="20"
                />
                <h3 className="font-bold text-base uppercase tracking-wide">
                    Cedula Details
                </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <InputGroup
                    id="cedula_number"
                    label="Cedula No."
                    name="cedula_number"
                    value={data.cedula_number}
                    onChange={(e: any) => {
                        const val = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9-]/g, "");
                        setData("cedula_number", val);
                    }}
                    icon="solar:hashtag-bold"
                    placeholder="e.g. 12345678"
                    required={true}
                    onKeyDown={onKeyDown}
                />
                <InputGroup
                    id="cedula_date"
                    label="Date Issued"
                    name="cedula_date"
                    type="date"
                    max="9999-12-31" // <--- Stops 5 digit years
                    value={data.cedula_date}
                    onChange={(e: any) =>
                        setData("cedula_date", e.target.value)
                    }
                    icon="solar:calendar-date-bold"
                    required={true}
                    onKeyDown={onKeyDown}
                />
            </div>
        </div>
    );
}
