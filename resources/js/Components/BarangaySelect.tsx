import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { BARANGAYS } from "@/Constants/Barangays";

interface Props {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
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
        // Strip out the ", GERONA, TARLAC" part for filtering if it's already there
        const searchTerms = value.split(",")[0].toUpperCase();
        return BARANGAYS.filter((b) => b.toUpperCase().includes(searchTerms));
    }, [value]);

    return (
        <div className="mb-4 relative">
            <label className="block font-medium text-sm text-gray-700 mb-1">
                Barangay / Address
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
                {/* Left Icon (Map Point) */}
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Icon icon="solar:map-point-bold" width="20" />
                </div>

                <input
                    type="text"
                    className={`block w-full pl-10 pr-10 py-3 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${error ? "border-red-500" : ""}`}
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
                    required={required}
                />

                {/* Right Icon (Dropdown Arrow) */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <Icon
                        icon="solar:alt-arrow-down-bold"
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        width="18"
                    />
                </div>
            </div>

            {/* DROPDOWN - Increased Z-Index to z-50 to prevent clipping */}
            {isOpen && filtered.length > 0 && (
                <ul className="absolute z-100 w-full bg-white border border-gray-200 mt-1 max-h-60 overflow-y-auto shadow-xl rounded-md text-sm py-1">
                    {filtered.map((brgy) => (
                        <li
                            key={brgy}
                            className="px-4 py-2.5 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer text-gray-700 transition-colors"
                            onMouseDown={() => {
                                onChange(
                                    `${brgy.toUpperCase()}, GERONA, TARLAC`,
                                );
                                setIsOpen(false);
                            }}
                        >
                            <span className="font-semibold">{brgy}</span>
                            <span className="text-gray-400 text-xs ml-1">
                                , GERONA, TARLAC
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
    );
}
