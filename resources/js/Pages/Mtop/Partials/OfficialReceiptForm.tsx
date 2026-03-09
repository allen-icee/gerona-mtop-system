//GeronaMTOP\resources\js\Pages\Mtop\Partials\OfficialReceiptForm.tsx
import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";
import { useEffect } from "react";

export default function OfficialReceiptForm({
    data,
    setData,
    errors,
    onKeyDown,
}: any) {
    const isHidden = !data.show_or;
    const isWaived = data.is_free && !data.or_unlocked;

    const locked = isHidden || isWaived;
    const isRequired = (!data.is_free || data.or_unlocked) && data.show_or;

    useEffect(() => {
        if (!data.or_date && data.transaction_date) {
            setData("or_date", data.transaction_date);
        }
    }, [data.transaction_date]);

    const toggleShowOr = () => {
        setData("show_or", !data.show_or);
    };

    return (
        <div className="space-y-0">
            <div className="flex items-center justify-between border-b border-violet-300 pb-2">
                <div className="flex items-center gap-4">
                    <h3 className="font-extrabold text-sm uppercase tracking-wide text-violet-700">
                        Official Receipt Details
                    </h3>
                </div>

                <div className="flex items-center gap-4">
                    {data.is_free && !isHidden && (
                        <button
                            type="button"
                            onClick={() =>
                                setData("or_unlocked", !data.or_unlocked)
                            }
                            className={`flex items-center gap-1 text-xs font-bold transition-colors ${data.or_unlocked
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

                    <button
                        type="button"
                        onClick={toggleShowOr}
                        className="flex items-center gap-2 focus:outline-none group cursor-pointer"
                    >
                        <div
                            className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 shadow-inner ${data.show_or ? "bg-indigo-800" : "bg-gray-500 group-hover:bg-gray-600"
                                }`}
                        >
                            <div
                                className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-300 ${data.show_or ? "translate-x-4" : "translate-x-0"
                                    }`}
                            ></div>
                        </div>
                    </button>
                </div>
            </div>

            <div className="relative mt-2">
                <div
                    className={`grid grid-cols-1 gap-2 p-2 rounded-xl bg-white transition-all ${locked
                            ? "opacity-50 blur-[0.4px] pointer-events-none"
                            : ""
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
                        required={isRequired}
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
                        required={isRequired}
                        disabled={locked}
                        onKeyDown={onKeyDown}
                    />
                </div>

                {locked && (
                    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none bg-black/5 rounded">
                        <div className="flex flex-col items-center">
                            <Icon
                                icon={
                                    isHidden
                                        ? "solar:eye-closed-bold"
                                        : "solar:ticket-sale-bold"
                                }
                                width="40"
                                className={
                                    isHidden
                                        ? "text-slate-400"
                                        : "text-emerald-500"
                                }
                            />
                            <span
                                className={`text-xs font-bold uppercase tracking-wider mt-1 ${isHidden ? "text-slate-500" : "text-emerald-600"}`}
                            >
                                {isHidden ? "Hidden From Print" : "Fee Waived"}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
