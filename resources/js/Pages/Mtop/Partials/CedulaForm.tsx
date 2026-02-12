import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";

export default function CedulaForm({ data, setData, errors }: any) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500 h-full">
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
                <Icon
                    icon="solar:document-add-bold"
                    className="text-yellow-600"
                    width="24"
                />
                <h3 className="text-lg font-bold text-gray-700 uppercase">
                    3. Cedula
                </h3>
            </div>
            <div className="space-y-4">
                <InputGroup
                    id="cedula_number"
                    label="Cedula No."
                    name="cedula_number"
                    value={data.cedula_number}
                    onChange={(e) => {
                        // STRICT: Letters, Numbers, Dashes. No special chars.
                        const val = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9-]/g, "");
                        setData("cedula_number", val);
                    }}
                    icon="solar:hashtag-bold"
                />
                <InputGroup
                    id="cedula_date"
                    label="Date Issued"
                    name="cedula_date"
                    type="date"
                    value={data.cedula_date}
                    onChange={(e) => setData("cedula_date", e.target.value)}
                    icon="solar:calendar-date-bold"
                />
            </div>
        </div>
    );
}
