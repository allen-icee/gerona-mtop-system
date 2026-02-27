//GeronaMTOP\resources\js\Pages\Mtop\Partials\OfficialReceiptForm.tsx
import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";

export default function OfficialReceiptForm({
    data,
    setData,
    errors,
    onKeyDown,
}: any) {
    return (
        <div className="space-y-2 relative">
            <div className="flex items-center justify-between text-purple-700 border-b border-gray-200 pb-2">
                <h3 className="font-bold text-base uppercase tracking-wide">
                    Official Receipt Details
                </h3>

                {/* --- NEW: The Padlock Override --- */}
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
                        title={
                            data.or_unlocked
                                ? "Lock fields to WAIVED"
                                : "Unlock to manually enter O.R."
                        }
                    >
                        <Icon
                            icon={
                                data.or_unlocked
                                    ? "solar:lock-unlocked-bold"
                                    : "solar:lock-password-bold"
                            }
                            width="16"
                        />
                        {data.or_unlocked ? "Lock Fields" : "Unlock Override"}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
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
                    // --- NEW: Dynamic Requirements and Disabled State ---
                    required={!data.is_free || data.or_unlocked}
                    disabled={data.is_free && !data.or_unlocked}
                    onKeyDown={onKeyDown}
                />
                <InputGroup
                    id="or_date"
                    label="Date Paid"
                    name="or_date"
                    type="date"
                    max="9999-12-31"
                    value={data.or_date}
                    onChange={(e: any) => setData("or_date", e.target.value)}
                    icon="solar:calendar-date-bold"
                    // --- NEW: Dynamic Requirements and Disabled State ---
                    required={!data.is_free || data.or_unlocked}
                    disabled={data.is_free && !data.or_unlocked}
                    onKeyDown={onKeyDown}
                />
            </div>
        </div>
    );
}
