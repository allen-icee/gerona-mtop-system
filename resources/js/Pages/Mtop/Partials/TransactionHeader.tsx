import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

export default function TransactionHeader({
    data,
    setData,
    errors,
    expiryDisplay,
    onKeyDown,
    activeEvents, // Array of events passed from controller
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

    // Determine currently selected event details
    const currentEvent =
        activeEvents?.find((e: any) => e.id == data.event_id) ||
        activeEvents?.[0];

    // Local state to track "Regular" vs "Event" processing mode
    const [processingMode, setProcessingMode] = useState<"regular" | "event">(
        data.event_id ? "event" : "regular",
    );

    // Auto-select first event if shifting to 'event' mode and none is selected
    useEffect(() => {
        if (
            processingMode === "event" &&
            activeEvents?.length > 0 &&
            !data.event_id
        ) {
            setData("event_id", activeEvents[0].id);
        }
    }, [processingMode, activeEvents]);

    // Effect: Handle auto-locking the OR fields when Promo is applied
    useEffect(() => {
        if (
            processingMode === "event" &&
            data.is_free &&
            !data.or_unlocked &&
            data.event_id
        ) {
            setData((prev: any) => ({
                ...prev,
                or_number: "WAIVED",
                or_date:
                    prev.transaction_date ||
                    new Date().toISOString().split("T")[0],
            }));
        } else if (processingMode === "regular") {
            setData((prev: any) => ({
                ...prev,
                event_id: null,
                is_free: false,
                or_unlocked: false,
                or_number: prev.or_number === "WAIVED" ? "" : prev.or_number,
            }));
        }
    }, [processingMode, data.is_free, data.or_unlocked, data.event_id]);

    const handleModeChange = (mode: "regular" | "event") => {
        setProcessingMode(mode);
        if (mode === "event") {
            setData("is_free", true);
            setData("or_unlocked", false);
        }
    };

    const handleTogglePadlock = () => {
        const isNowUnlocked = !data.or_unlocked;
        setData((prev: any) => ({
            ...prev,
            or_unlocked: isNowUnlocked,
            // If we are unlocking to pay, it is no longer free, but the event_id STAYS attached
            is_free: !isNowUnlocked,
            or_number:
                isNowUnlocked && prev.or_number === "WAIVED"
                    ? ""
                    : prev.or_number,
        }));
    };

    return (
        <div className="space-y-6">
            {/* --- EVENT BANNER & SELECTION --- */}
            {activeEvents && activeEvents.length > 0 && (
                <div className="bg-linear-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-xl shadow-md border-2 border-emerald-400 gap-4">
                    <div className="mb-4 flex gap-4 font-bold items-center border-b border-white/20 pb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="processingMode"
                                value="regular"
                                checked={processingMode === "regular"}
                                onChange={() => handleModeChange("regular")}
                                className="w-4 h-4 text-yellow-400 focus:ring-yellow-400"
                            />
                            Regular Processing
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="processingMode"
                                value="event"
                                checked={processingMode === "event"}
                                onChange={() => handleModeChange("event")}
                                className="w-4 h-4 text-yellow-400 focus:ring-yellow-400"
                            />
                            Apply Event / Promo
                        </label>
                    </div>

                    {processingMode === "event" && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex-1 w-full">
                                {activeEvents.length > 1 ? (
                                    <select
                                        className="w-full bg-white/10 border border-white/30 text-white rounded-lg p-2 font-bold focus:ring-yellow-400 focus:border-yellow-400"
                                        value={data.event_id || ""}
                                        onChange={(e) =>
                                            setData("event_id", e.target.value)
                                        }
                                    >
                                        {activeEvents.map((ev: any) => (
                                            <option
                                                key={ev.id}
                                                value={ev.id}
                                                className="text-black"
                                            >
                                                {ev.title}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <h3 className="font-black text-lg uppercase tracking-wider text-yellow-300 flex items-center gap-2">
                                        <Icon
                                            icon="solar:star-fall-bold-duotone"
                                            width="24"
                                        />
                                        {currentEvent?.title}
                                    </h3>
                                )}

                                <p className="text-sm font-medium opacity-90 mt-1">
                                    {currentEvent?.description}. Event Expiry:{" "}
                                    {currentEvent &&
                                        new Date(
                                            currentEvent.fixed_expiry_date,
                                        ).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                </p>
                                <p className="text-xs italic opacity-75 mt-1">
                                    Mandated by: {currentEvent?.mandated_by}
                                </p>
                            </div>

                            {/* THE PADLOCK OVERRIDE UI */}
                            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg border border-white/20">
                                <span className="font-bold text-sm">
                                    {data.is_free
                                        ? "Status: Free"
                                        : "Status: Paid (Bonus Mode)"}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleTogglePadlock}
                                    className="p-1 rounded-full hover:bg-white/20 transition"
                                    title={
                                        data.is_free
                                            ? "Unlock to allow manual payment input"
                                            : "Lock to set as WAIVED"
                                    }
                                >
                                    <Icon
                                        icon={
                                            data.is_free
                                                ? "solar:lock-password-bold"
                                                : "solar:lock-unlocked-bold"
                                        }
                                        width="24"
                                        className={
                                            data.is_free
                                                ? "text-yellow-400"
                                                : "text-white"
                                        }
                                    />
                                </button>
                            </div>
                        </div>
                    )}
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
                            value={sequence}
                            onChange={(e) => {
                                let val = e.target.value.replace(/[^0-9]/g, "");
                                if (prefix && val.length > 4)
                                    val = val.substring(0, 4);
                                setData("mt_number", `${prefix}${val}`);
                            }}
                            placeholder="0001"
                            className="flex-1 block w-full h-full border-none focus:ring-0 sm:text-sm px-3 font-bold text-gray-800"
                            onKeyDown={onKeyDown}
                        />
                    </div>
                </div>

                <InputGroup
                    id="transaction_date"
                    label="Transaction Date"
                    name="transaction_date"
                    type="date"
                    value={data.transaction_date}
                    onChange={(e: any) =>
                        setData("transaction_date", e.target.value)
                    }
                    icon="solar:calendar-bold"
                    onKeyDown={onKeyDown}
                />

                <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block font-medium text-sm text-gray-700 mb-1">
                        Validity{" "}
                        <span className="text-gray-400 font-normal text-xs">
                            (Auto-calculated)
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
                                data.is_free &&
                                processingMode === "event" &&
                                currentEvent
                                    ? new Date(currentEvent.fixed_expiry_date)
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
