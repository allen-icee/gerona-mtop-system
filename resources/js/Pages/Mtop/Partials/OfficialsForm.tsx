//GeronaMTOP\resources\js\Pages\Mtop\Partials\OfficialsForm.tsx
import SignatorySelect from "@/Components/SignatorySelect";
import { Icon } from "@iconify/react";

interface Props {
    data: any;
    setData: (field: string, value: any) => void;
    errors: any;
    punong_bayans: string[];
    officials: string[];
    onKeyDown?: (
        e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
    ) => void;
}

export default function OfficialsForm({
    data,
    setData,
    errors,
    punong_bayans = [],
    officials = [],
    onKeyDown,
}: Props) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-yellow-700 border-b border-yellow-300 pb-1">
                <h3 className="font-extrabold text-base uppercase tracking-wide">
                    Signatories
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SignatorySelect
                    label="Authorized Official"
                    value={data.authorized_official}
                    onChange={(val) => setData("authorized_official", val)}
                    options={officials}
                    error={errors.authorized_official}
                    required={true}
                    onKeyDown={onKeyDown}
                />

                <SignatorySelect
                    label="Punong Bayan"
                    value={data.punong_bayan}
                    onChange={(val) => setData("punong_bayan", val)}
                    options={punong_bayans}
                    error={errors.punong_bayan}
                    required={true}
                    onKeyDown={onKeyDown}
                />
            </div>

            <div className="flex items-start gap-2 bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                <Icon
                    icon="solar:info-circle-bold"
                    className="text-yellow-500 mt-0.5 shrink-0"
                    width="16"
                />
                <p className="text-xs text-yellow-700 leading-relaxed">
                    <strong>Tip:</strong> You can type to search existing
                    officials or type a new name manually if they aren't on the
                    list.
                </p>
            </div>
        </div>
    );
}
