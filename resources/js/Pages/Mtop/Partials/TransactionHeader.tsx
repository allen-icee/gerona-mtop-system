import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";

export default function TransactionHeader({
    data,
    setData,
    errors,
    expiryDisplay,
}: any) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-600">
            <div className="flex items-center gap-2 mb-6 border-b pb-2">
                <Icon
                    icon="solar:file-text-bold"
                    className="text-indigo-600"
                    width="24"
                />
                <h3 className="text-lg font-bold text-gray-700 uppercase">
                    Application Details
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. CONTROL NUMBER (Case #) */}
                <InputGroup
                    id="mt_number"
                    label="Control No. / Case #"
                    name="mt_number"
                    value={data.mt_number}
                    onChange={(e) => {
                        // RESTRICTION: Allow Letters, Numbers, and Dashes (-).
                        // Block all other special characters (@, #, $, etc).
                        const val = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9-]/g, "");
                        setData("mt_number", val);
                    }}
                    icon="solar:folder-with-files-bold"
                    placeholder="2026-0001"
                    className="md:col-span-1"
                    error={errors?.mt_number}
                />

                {/* 2. TRANSACTION DATE */}
                <InputGroup
                    id="transaction_date"
                    label="Date of Application"
                    name="transaction_date"
                    type="date"
                    value={data.transaction_date}
                    onChange={(e) =>
                        setData("transaction_date", e.target.value)
                    }
                    icon="solar:calendar-bold"
                    error={errors?.transaction_date}
                />

                {/* 3. VALIDITY (Read Only) */}
                <div>
                    <label className="block font-medium text-sm text-gray-700 mb-1">
                        Validity (Auto-Calculated)
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                            <Icon icon="solar:clock-circle-bold" width="20" />
                        </div>
                        <input
                            type="text"
                            disabled
                            className="block w-full pl-10 py-3 border-gray-300 bg-gray-100 text-gray-600 font-bold rounded-md shadow-sm"
                            // FIX: Added check to ensure expiryDisplay is a function before calling it
                            value={
                                typeof expiryDisplay === "function"
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
