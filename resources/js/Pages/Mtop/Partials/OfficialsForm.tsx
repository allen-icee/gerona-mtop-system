import SignatorySelect from "@/Components/SignatorySelect";
import { Icon } from "@iconify/react";

interface Props {
    data: any;
    setData: (field: string, value: any) => void;
    errors: any;
    punong_bayans: string[];
    officials: string[];
}

export default function OfficialsForm({
    data,
    setData,
    errors,
    punong_bayans = [],
    officials = [],
}: Props) {
    return (
        <div className="space-y-2">
            {/* Section Header */}
            <div className="flex items-center gap-2 text-gray-800 border-b border-gray-200 pb-2">
                <Icon
                    icon="solar:pen-new-square-bold"
                    className="text-gray-600"
                    width="20"
                />
                <h3 className="font-bold text-base uppercase tracking-wide">
                    Signatories (Mga Pumirma)
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Authorized Official Selector */}
                <SignatorySelect
                    label="Authorized Official"
                    value={data.authorized_official}
                    onChange={(val) => setData("authorized_official", val)}
                    options={officials}
                    error={errors.authorized_official}
                    required={true}
                />

                {/* Punong Bayan Selector */}
                <SignatorySelect
                    label="Punong Bayan"
                    value={data.punong_bayan}
                    onChange={(val) => setData("punong_bayan", val)}
                    options={punong_bayans}
                    error={errors.punong_bayan}
                    required={true}
                />
            </div>

            <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <Icon
                    icon="solar:info-circle-bold"
                    className="text-blue-500 mt-0.5 shrink-0"
                    width="16"
                />
                <p className="text-xs text-blue-700 leading-relaxed">
                    <strong>Pro-tip:</strong> You can type to search existing
                    officials or type a new name manually if they aren't on the
                    list.
                </p>
            </div>
        </div>
    );
}
