import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";

export default function OfficialsForm({ data, setData, errors }: any) {
    const handleNameChange = (field: string, value: string) => {
        const cleanValue = value.toUpperCase().replace(/[^A-Z\s.-]/g, "");
        setData(field, cleanValue);
    };

    return (
        <div className="mt-6">
            <div className="flex items-center gap-2 mb-6 border-b pb-2"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup
                    label="Authorized Official"
                    name="authorized_official"
                    value={data.authorized_official || ""}
                    onChange={(e) =>
                        handleNameChange("authorized_official", e.target.value)
                    }
                    error={errors.authorized_official}
                    icon="solar:user-speak-bold"
                    placeholder="NAGBIGAY NG KAPAHINTULUTAN"
                    required={true}
                />
                <InputGroup
                    label="Punong Bayan"
                    name="punong_bayan"
                    value={data.punong_bayan || ""}
                    onChange={(e) =>
                        handleNameChange("punong_bayan", e.target.value)
                    }
                    error={errors.punong_bayan}
                    icon="solar:medal-ribbon-bold"
                    placeholder="NAME OF MAYOR"
                    required={true}
                />
            </div>
            <p className="text-[10px] text-gray-400 italic mt-1">
                Note: These names will appear exactly as typed on the printed
                MTOP form.
            </p>
        </div>
    );
}
