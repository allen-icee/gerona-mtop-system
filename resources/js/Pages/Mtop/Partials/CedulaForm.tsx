import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";

export default function CedulaForm({ data, setData, errors }: any) {
    return (
        <div className="space-y-2">
            {/* Section Header */}
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

            {/* Changed to grid-cols-1 for vertical stacking */}
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
                />
                <InputGroup
                    id="cedula_date"
                    label="Date Issued"
                    name="cedula_date"
                    type="date"
                    value={data.cedula_date}
                    onChange={(e: any) =>
                        setData("cedula_date", e.target.value)
                    }
                    icon="solar:calendar-date-bold"
                    required={true}
                />
            </div>
        </div>
    );
}
