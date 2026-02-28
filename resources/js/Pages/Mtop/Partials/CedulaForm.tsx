//GeronaMTOP\resources\js\Pages\Mtop\Partials\CedulaForm.tsx
import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";

export default function CedulaForm({ data, setData, errors, onKeyDown }: any) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-700 border-b border-orange-200 pb-1">
                <h3 className="font-extrabold text-base uppercase tracking-wide">
                    Cedula Details
                </h3>
            </div>

            <div className="grid grid-cols-1 gap-2">
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
                    icon="solar:hashtag-square-bold"
                    placeholder="e.g. 12345678"
                    required={true}
                    onKeyDown={onKeyDown}
                />
                <InputGroup
                    id="cedula_date"
                    label="Date Issued"
                    name="cedula_date"
                    type="date"
                    max="9999-12-31"
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
