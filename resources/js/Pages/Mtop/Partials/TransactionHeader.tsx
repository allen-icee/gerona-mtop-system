import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

export default function TransactionHeader({
    data,
    setData,
    errors,
    expiryDisplay,
    onKeyDown,
    activeEvents,
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

    const currentEvent =
        activeEvents?.find((e: any) => e.id == data.event_id) ||
        activeEvents?.[0];

    const [processingMode, setProcessingMode] = useState<"regular" | "event">(
        data.event_id ? "event" : "regular",
    );

    useEffect(() => {
        if (
            processingMode === "event" &&
            activeEvents?.length > 0 &&
            !data.event_id
        ) {
            setData("event_id", activeEvents[0].id);
        }
    }, [processingMode, activeEvents]);

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

    const handleTogglePaymentMode = () => {
        const isNowUnlocked = !data.or_unlocked;
        setData((prev: any) => ({
            ...prev,
            or_unlocked: isNowUnlocked,
            is_free: !isNowUnlocked,
            or_number:
                isNowUnlocked && prev.or_number === "WAIVED"
                    ? ""
                    : prev.or_number,
        }));
    };

    return (
        <div className="space-y-4">
            {activeEvents && activeEvents.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm px-4 py-3">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3 flex-1">
                            <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => handleModeChange("regular")}
                                    className={`px-3 py-1.5 text-xs font-bold rounded hover:cursor-pointer ${processingMode === "regular"
                                        ? "bg-white text-slate-800 border border-slate-200"
                                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-200"
                                        }`}
                                >
                                    Standard
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleModeChange("event")}
                                    className={`px-3 py-1.5 text-xs font-bold rounded hover:cursor-pointer ${processingMode === "event"
                                        ? "bg-white  text-blue-700 border border-blue-200 "
                                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-200 "
                                        }`}
                                >
                                    Apply Promo
                                </button>
                            </div>

                            {processingMode === "event" && (
                                <>
                                    {activeEvents.length > 1 ? (
                                        <select
                                            className="bg-white border border-slate-300 text-slate-800 rounded-md px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={data.event_id || ""}
                                            onChange={(e) =>
                                                setData(
                                                    "event_id",
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            {activeEvents.map((ev: any) => (
                                                <option
                                                    key={ev.id}
                                                    value={ev.id}
                                                >
                                                    {ev.title}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-sm font-semibold text-slate-800">
                                            {currentEvent?.title}
                                        </span>
                                    )}

                                    <div className="relative group">
                                        <Icon
                                            icon="solar:info-circle-bold-duotone"
                                            width="20"
                                            className="text-slate-400 hover:text-blue-600 cursor-help"
                                        />

                                        <div className="absolute left-1/2 bottom-full -translate-x-1/2 mb-3 w-72 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                                            <p className="leading-relaxed">
                                                {currentEvent?.description}
                                            </p>

                                            <div className="mt-2 border-t border-slate-700 pt-2 space-y-1">
                                                <p className="text-blue-300 italic">
                                                    Mandated by:{" "}
                                                    {currentEvent?.mandated_by}
                                                </p>

                                                <p className="text-emerald-400 font-medium">
                                                    Fixed Expiry:{" "}
                                                    {currentEvent &&
                                                        new Date(
                                                            currentEvent.fixed_expiry_date,
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            },
                                                        )}
                                                </p>
                                            </div>

                                            <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900"></div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {processingMode === "event" && (
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-blue-600">
                                    {data.is_free ? "Free" : "Still Paid"}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => setData("is_manual_validity", !data.is_manual_validity)}
                                    className={`relative inline-flex h-5 w-10 items-center rounded-full p-1 transition-colors duration-300 shadow-inner focus:outline-none cursor-pointer ${data.is_manual_validity
                                        ? "bg-blue-600"
                                        : "bg-gray-500 hover:bg-gray-600"
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${data.is_manual_validity ? "translate-x-4" : "translate-x-0"
                                            }`}
                                    />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                    <label className="block font-medium text-sm text-gray-700 mb-1">
                        Control No. <span className="text-red-500">*</span>
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
                    className=""
                    onKeyDown={onKeyDown}
                    required
                />

                <div className="sm:col-span-2 lg:col-span-1">
                    <div className="flex justify-between items-center mb-1">
                        <label className="block font-medium text-sm text-gray-700">
                            Validity{" "}
                            <span className="text-gray-400 font-normal text-xs">
                                (
                                {data.is_manual_validity
                                    ? "Manual"
                                    : "Auto-calculated"}
                                )
                            </span>
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setData("is_manual_validity", !data.is_manual_validity)}
                                className={`relative inline-flex h-5 w-10 items-center rounded-full p-1 transition-colors duration-300 shadow-inner focus:outline-none cursor-pointer ${data.is_manual_validity
                                        ? "bg-blue-800"
                                        : "bg-gray-500 hover:bg-gray-600"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${data.is_manual_validity ? "translate-x-4" : "translate-x-0"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                    <div className="relative h-11.75">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                            <Icon icon="solar:clock-circle-bold" width="20" />
                        </div>
                        {data.is_manual_validity ? (
                            <input
                                type="date"
                                className={`block w-full h-full pl-10 py-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 font-bold text-gray-800 rounded-md shadow-sm text-sm ${errors?.valid_until ? "border-red-500" : ""
                                    }`}
                                value={data.valid_until || ""}
                                onChange={(e) =>
                                    setData("valid_until", e.target.value)
                                }
                            />
                        ) : (
                            <input
                                type="text"
                                disabled
                                className="block w-full h-full pl-10 py-2 hover:cursor-not-allowed border-gray-300 bg-gray-50 text-gray-500 font-bold rounded-md shadow-sm text-sm"
                                value={
                                    typeof expiryDisplay === "function"
                                        ? expiryDisplay()
                                        : "N/A"
                                }
                            />
                        )}
                    </div>
                    {errors?.valid_until && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.valid_until}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
