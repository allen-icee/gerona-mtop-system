import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";

export default function OfficialReceiptForm({
    data,
    setData,
    errors,
    onKeyDown,
}: any) {
    const locked = data.is_free && !data.or_unlocked;

    return (
        <div className="space-y-0">
            <div className="flex items-center justify-between border-b border-violet-300 pb-2">
                <h3 className="font-extrabold text-sm uppercase tracking-wide text-violet-700">
                    Official Receipt Details
                </h3>

                {data.is_free && (
                    <button
                        type="button"
                        onClick={() =>
                            setData("or_unlocked", !data.or_unlocked)
                        }
                        className={`flex items-center gap-1 text-xs font-bold transition-colors ${
                            data.or_unlocked
                                ? "text-red-500 hover:text-red-700"
                                : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        <Icon
                            icon={
                                data.or_unlocked
                                    ? "solar:lock-unlocked-bold"
                                    : "solar:lock-password-bold"
                            }
                            width="16"
                        />
                        {data.or_unlocked ? "Lock" : "Unlock"}
                    </button>
                )}
            </div>

            <div className="relative">
                <div
                    className={`grid grid-cols-1 gap-2 p-2 rounded-xl bg-white transition-all ${
                        locked ? "opacity-50 blur-[0.4px]" : ""
                    }`}
                >
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
                        required={!data.is_free || data.or_unlocked}
                        disabled={locked}
                        onKeyDown={onKeyDown}
                    />

                    <InputGroup
                        id="or_date"
                        label="Date Paid"
                        name="or_date"
                        type="date"
                        max="9999-12-31"
                        value={data.or_date}
                        onChange={(e: any) =>
                            setData("or_date", e.target.value)
                        }
                        icon="solar:calendar-date-bold"
                        required={!data.is_free || data.or_unlocked}
                        disabled={locked}
                        onKeyDown={onKeyDown}
                    />
                </div>

                {locked && (
                    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none bg-black/5 rounded">
                        <div className="flex flex-col items-center ">
                            <Icon
                                icon="solar:lock-password-bold"
                                width="40"
                                className="text-slate-500"
                            />
                            <span className="text-xs font-bold text-slate-500">
                                Locked
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
