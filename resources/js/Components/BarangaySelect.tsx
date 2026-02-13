import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { BARANGAYS } from "@/Constants/Barangays";

interface Props {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean; // 1. Add this optional prop
}

export default function BarangaySelect({
    value,
    onChange,
    error,
    required,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);

    // Filter list based on input
    const filtered = useMemo(() => {
        if (!value) return BARANGAYS;
        return BARANGAYS.filter((b) =>
            b.toUpperCase().includes(value.toUpperCase()),
        );
    }, [value]);

    return (
        <div className="mb-4 relative">
            <label className="block font-medium text-sm text-gray-700 mb-1">
                Barangay / Address
                {/* 2. Conditionally render the red asterisk */}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Icon icon="solar:map-point-bold" width="20" />
                </div>
                <input
                    type="text"
                    className={`block w-full pl-10 py-3 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${error ? "border-red-500" : ""}`}
                    placeholder="Search Barangay..."
                    value={value}
                    onChange={(e) => {
                        const val = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9\s.-]/g, "");
                        onChange(val);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    required={required} // 3. Pass it to the input element too
                />
            </div>

            {/* DROPDOWN */}
            {isOpen && filtered.length > 0 && (
                <ul className="absolute z-100 w-full bg-white border border-gray-200 mt-1 max-h-60 overflow-y-auto shadow-lg rounded-md text-sm">
                    {filtered.map((brgy) => (
                        <li
                            key={brgy}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700"
                            onMouseDown={() => {
                                onChange(
                                    `${brgy.toUpperCase()}, GERONA, TARLAC`,
                                );
                                setIsOpen(false);
                            }}
                        >
                            {brgy}
                        </li>
                    ))}
                </ul>
            )}

            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
    );
}
