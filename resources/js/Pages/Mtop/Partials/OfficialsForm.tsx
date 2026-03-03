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
    const toggleShowAuthOfficial = () => {
        setData("show_auth_official", !data.show_auth_official);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-yellow-300 pb-1">
                <h3 className="font-extrabold text-base uppercase tracking-wide text-yellow-700">
                    Signatories
                </h3>

                <button
                    type="button"
                    onClick={toggleShowAuthOfficial}
                    className="flex items-center gap-2 focus:outline-none group"
                >
                    <span
                        className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${data.show_auth_official ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"}`}
                    >
                        Enable Auth. Official
                    </span>
                    <div
                        className={`w-8 h-4 flex items-center rounded-full p-1 transition-colors duration-300 ${data.show_auth_official ? "bg-indigo-600" : "bg-gray-300"}`}
                    >
                        <div
                            className={`bg-white w-2.5 h-2.5 rounded-full shadow-sm transform transition-transform duration-300 ${data.show_auth_official ? "translate-x-3.5" : "translate-x-0"}`}
                        ></div>
                    </div>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                <div className="space-y-1">
                    <div className="relative">
                        <div
                            className={`transition-all ${!data.show_auth_official ? "opacity-50 blur-[0.4px] pointer-events-none" : ""}`}
                        >
                            <SignatorySelect
                                label="Authorized Official"
                                value={data.authorized_official}
                                onChange={(val) =>
                                    setData("authorized_official", val)
                                }
                                options={officials}
                                error={errors.authorized_official}
                                required={data.show_auth_official}
                                disabled={!data.show_auth_official}
                                onKeyDown={onKeyDown}
                            />
                        </div>

                        {!data.show_auth_official && (
                            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none bg-black/5 rounded">
                                <div className="flex flex-col items-center">
                                    <Icon
                                        icon="solar:eye-closed-bold"
                                        width="40"
                                        className="text-slate-400"
                                    />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                                        Hidden From Print
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

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
