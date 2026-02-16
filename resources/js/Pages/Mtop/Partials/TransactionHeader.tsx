import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";

export default function TransactionHeader({
    data,
    setData,
    errors,
    expiryDisplay,
    onKeyDown, // <--- Add this
}: any) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. CONTROL NUMBER (Read Only) */}
            <div className="relative">
                <InputGroup
                    id="mt_number"
                    label="Control No."
                    name="mt_number"
                    value={data.mt_number}
                    readOnly
                    icon="solar:folder-with-files-bold"
                    placeholder="Auto-Generated"
                    error={errors?.mt_number}
                    onKeyDown={onKeyDown} // <--- Pass it down
                />
                <div className="absolute right-3 top-9.5 text-gray-400 pointer-events-none">
                    <Icon icon="solar:lock-bold" width="16" />
                </div>
            </div>

            {/* 2. TRANSACTION DATE */}
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
                error={errors?.transaction_date}
                onKeyDown={onKeyDown} // <--- Pass it down
            />

            {/* 3. VALIDITY */}
            <div className="sm:col-span-2 lg:col-span-1">
                <label className="block font-medium text-sm text-gray-700 mb-1">
                    Validity{" "}
                    <span className="text-gray-400 font-normal text-xs">
                        (Auto-calculated) 3 Years
                    </span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Icon icon="solar:clock-circle-bold" width="20" />
                    </div>
                    <input
                        type="text"
                        disabled
                        className="block w-full pl-10 py-3 border-gray-300 bg-gray-50 text-gray-500 font-bold rounded-md shadow-sm text-sm"
                        value={
                            typeof expiryDisplay === "function"
                                ? expiryDisplay()
                                : "N/A"
                        }
                        // No onKeyDown needed here since it's disabled
                    />
                </div>
            </div>
        </div>
    );
}
