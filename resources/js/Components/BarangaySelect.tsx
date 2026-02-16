import { useState, useMemo, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { BARANGAYS } from "@/Constants/Barangays";

interface Props {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function BarangaySelect({
    value,
    onChange,
    error,
    required,
    onKeyDown,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const listRef = useRef<HTMLUListElement>(null);

    // Filter list based on input
    const filtered = useMemo(() => {
        if (!value) return BARANGAYS;
        // Strip out the suffix for cleaner filtering
        const searchTerms = value
            .replace(/, GERONA, TARLAC/i, "")
            .trim()
            .toUpperCase();
        return BARANGAYS.filter((b) => b.toUpperCase().includes(searchTerms));
    }, [value]);

    // Reset selection index when filter changes
    useEffect(() => {
        setSelectedIndex(-1);
    }, [filtered]);

    // Scroll active item into view
    useEffect(() => {
        if (isOpen && listRef.current && selectedIndex >= 0) {
            const list = listRef.current;
            const element = list.children[selectedIndex] as HTMLElement;
            if (element) {
                const blockStart = list.scrollTop;
                const blockEnd = list.scrollTop + list.clientHeight;
                const elStart = element.offsetTop;
                const elEnd = element.offsetTop + element.clientHeight;

                if (elStart < blockStart) {
                    list.scrollTop = elStart;
                } else if (elEnd > blockEnd) {
                    list.scrollTop = elEnd - list.clientHeight;
                }
            }
        }
    }, [selectedIndex, isOpen]);

    // --- STRICT VALIDATION ON BLUR ---
    const handleBlur = () => {
        // Use timeout to allow "onClick" on the dropdown item to trigger first
        setTimeout(() => {
            setIsOpen(false);

            if (!value.trim()) return; // Let 'required' prop handle empty state

            // 1. Normalize Input: Remove suffix, trim, uppercase
            const inputBase = value
                .replace(/, GERONA, TARLAC$/i, "")
                .trim()
                .toUpperCase();

            // 2. Find Exact Match
            const match = BARANGAYS.find((b) => b.toUpperCase() === inputBase);

            if (match) {
                // 3. If matched, ensure it has the correct full format
                const correctFormat = `${match}, GERONA, TARLAC`;
                if (value !== correctFormat) {
                    onChange(correctFormat);
                }
            } else {
                // 4. If NO match, clear the field (force user to select valid option)
                onChange("");
            }
        }, 200);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isOpen && filtered.length > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < filtered.length - 1 ? prev + 1 : prev,
                );
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                return;
            }
            if (e.key === "Enter" && selectedIndex >= 0) {
                e.preventDefault();
                onChange(
                    `${filtered[selectedIndex].toUpperCase()}, GERONA, TARLAC`,
                );
                setIsOpen(false);
                setSelectedIndex(-1);
                return;
            }
            if (e.key === "Escape") {
                setIsOpen(false);
                return;
            }
        }

        if (onKeyDown) onKeyDown(e);
    };

    return (
        <div className="mb-4 relative">
            <label className="block font-medium text-sm text-gray-700 mb-1">
                Barangay / Address
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Icon icon="solar:map-point-bold" width="20" />
                </div>

                <input
                    type="text"
                    className={`block w-full pl-10 pr-10 py-3 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                        error ? "border-red-500" : ""
                    }`}
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
                    onBlur={handleBlur} // <--- UPDATED HANDLER
                    required={required}
                    onKeyDown={handleKeyDown}
                />

                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <Icon
                        icon="solar:alt-arrow-down-bold"
                        className={`transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                        }`}
                        width="18"
                    />
                </div>
            </div>

            {isOpen && filtered.length > 0 && (
                <ul
                    ref={listRef}
                    className="absolute z-100 w-full bg-white border border-gray-200 mt-1 max-h-60 overflow-y-auto shadow-xl rounded-md text-sm py-1"
                >
                    {filtered.map((brgy, index) => (
                        <li
                            key={brgy}
                            className={`px-4 py-2.5 cursor-pointer text-gray-700 transition-colors ${
                                index === selectedIndex
                                    ? "bg-indigo-100 text-indigo-800"
                                    : "hover:bg-indigo-50 hover:text-indigo-700"
                            }`}
                            onMouseDown={() => {
                                onChange(
                                    `${brgy.toUpperCase()}, GERONA, TARLAC`,
                                );
                                setIsOpen(false);
                            }}
                            onMouseEnter={() => setSelectedIndex(index)}
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
