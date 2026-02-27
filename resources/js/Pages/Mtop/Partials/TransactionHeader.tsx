//GeronaMTOP\resources\js\Pages\Mtop\Partials\TransactionHeader.tsx
import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";
import { useEffect } from "react";

export default function TransactionHeader({
    data,
    setData,
    errors,
    expiryDisplay,
    onKeyDown,
    activeEvent, // --- NEW: Passed from Create/Edit/Renew ---
}: any) {
    let prefix = `${new Date().getFullYear()}-`;
    let sequence = "";

    if (data.mt_number) {
        const parts = data.mt_number.split("-");
        if (parts.length > 1) {
            prefix = `${parts[0]}-`;
            sequence = parts.slice(1).join("-");
        } else {
            prefix = "";
            sequence = data.mt_number;
        }
    }

    // --- NEW: Auto-fill OR fields when Promo is toggled ---
    useEffect(() => {
        if (data.is_free && !data.or_unlocked && activeEvent) {
            setData((prev: any) => ({
                ...prev,
                event_id: activeEvent.id,
                or_number: "WAIVED",
                // Use transaction date for the OR date since it's waived on that day
                or_date:
                    prev.transaction_date ||
                    new Date().toISOString().split("T")[0],
            }));
        } else if (!data.is_free && !data.or_unlocked) {
            setData((prev: any) => ({
                ...prev,
                event_id: null,
                or_number: "",
                or_date: "",
            }));
        }
    }, [data.is_free, data.or_unlocked, activeEvent]);

    const handleTogglePromo = () => {
        const isNowFree = !data.is_free;
        setData((prev: any) => ({
            ...prev,
            is_free: isNowFree,
            // Relock the OR fields if turning the promo ON
            or_unlocked: isNowFree ? false : prev.or_unlocked,
        }));
    };

    return (
        <div className="space-y-6">
            {/* --- NEW: EVENT BANNER --- */}
            {activeEvent && (
                <div className="bg-linear-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-xl shadow-md border-2 border-emerald-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-black text-lg uppercase tracking-wider text-yellow-300 flex items-center gap-2">
                            <Icon
                                icon="solar:star-fall-bold-duotone"
                                width="24"
                            />
                            {activeEvent.title}
                        </h3>
                        <p className="text-sm font-medium opacity-90">
                            {activeEvent.description}. Expires:{" "}
                            {new Date(
                                activeEvent.fixed_expiry_date,
                            ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                        <p className="text-xs italic opacity-75 mt-1">
                            Mandated by: {activeEvent.mandated_by}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-white/10 p-2 rounded-lg w-full sm:w-auto shrink-0 border border-white/20">
                        <span className="font-bold text-sm">Apply Event?</span>
                        <button
                            type="button"
                            onClick={handleTogglePromo}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                data.is_free ? "bg-yellow-400" : "bg-gray-400"
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    data.is_free
                                        ? "translate-x-5"
                                        : "translate-x-0"
                                }`}
                            />
                        </button>
                    </div>
                </div>
            )}

            {/* ORIGINAL INPUT GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <label className="block font-medium text-sm text-gray-700 mb-1">
                        Control No.
                    </label>
                    <div
                        className={`relative flex items-center h-11.75 border-none rounded-md shadow-sm bg-white overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors ${errors?.mt_number ? "border-red-500" : "border-gray-300"}`}
                    >
                        {prefix && (
                            <div className="px-3 h-full bg-gray-200 text-gray-700 font-bold border-r border-gray-300 flex items-center justify-center cursor-not-allowed select-none">
                                <Icon
                                    icon="solar:folder-with-files-bold"
                                    className="mr-2 text-gray-500"
                                    width="18"
                                />
                                {prefix}
                            </div>
                        )}

                        <input
                            type="text"
                            name="mt_number"
                            id="mt_number"
                            value={sequence}
                            onChange={(e) => {
                                let val = e.target.value.replace(/[^0-9]/g, "");

                                if (prefix && val.length > 4) {
                                    val = val.substring(0, 4);
                                }

                                setData("mt_number", `${prefix}${val}`);
                            }}
                            placeholder="0001"
                            className="flex-1 block w-full h-full border-none focus:ring-0 sm:text-sm px-3 font-bold text-gray-800"
                            onKeyDown={onKeyDown}
                        />
                    </div>
                    {errors?.mt_number && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.mt_number}
                        </p>
                    )}
                </div>

                <InputGroup
                    id="transaction_date"
                    label="Transaction Date"
                    name="transaction_date"
                    type="date"
                    max="9999-12-31"
                    value={data.transaction_date}
                    onChange={(e: any) =>
                        setData("transaction_date", e.target.value)
                    }
                    icon="solar:calendar-bold"
                    error={errors?.transaction_date}
                    onKeyDown={onKeyDown}
                />

                <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block font-medium text-sm text-gray-700 mb-1">
                        Validity{" "}
                        <span className="text-gray-400 font-normal text-xs">
                            (Auto-calculated LTO)
                        </span>
                    </label>
                    <div className="relative h-11.75">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                            <Icon icon="solar:clock-circle-bold" width="20" />
                        </div>
                        <input
                            type="text"
                            disabled
                            className="block w-full h-full pl-10 py-2 border-gray-300 bg-gray-50 text-gray-500 font-bold rounded-md shadow-sm text-sm"
                            value={
                                /* NEW: Override logic if promo is active */
                                data.is_free && activeEvent
                                    ? new Date(activeEvent.fixed_expiry_date)
                                          .toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                          })
                                          .toUpperCase()
                                    : typeof expiryDisplay === "function"
                                      ? expiryDisplay()
                                      : "N/A"
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
