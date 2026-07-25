//GeronaMTOP\resources\js\Components\BarangaySelect.tsx
import { useState, useMemo, useEffect, useRef, useLayoutEffect } from "react";
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
    const [dropUp, setDropUp] = useState(false);
    const listRef = useRef<HTMLUListElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const filtered = useMemo(() => {
        if (!value) return BARANGAYS;
        const searchTerms = value
            .replace(/, GERONA, TARLAC/i, "")
            .trim()
            .toUpperCase();
        return BARANGAYS.filter((b) => b.toUpperCase().includes(searchTerms));
    }, [value]);

    useEffect(() => {
        setSelectedIndex(-1);
    }, [filtered]);

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

    useLayoutEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            // 250px is slightly more than max-h-60 (240px)
            setDropUp(spaceBelow < 250 && rect.top > 250);
        }
    }, [isOpen, filtered]);

    const handleBlur = () => {
        setTimeout(() => {
            setIsOpen(false);
            if (!value.trim()) return;

            const inputBase = value
                .replace(/, GERONA, TARLAC$/i, "")
                .trim()
                .toUpperCase();

            const match = BARANGAYS.find((b) => b.toUpperCase() === inputBase);

            if (match) {
                const correctFormat = `${match}, GERONA, TARLAC`;
                if (value !== correctFormat) {
                    onChange(correctFormat);
                }
            } else {
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
        <div className={`relative ${isOpen ? "z-50" : "z-10"}`}>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                Barangay / Address
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative" ref={containerRef}>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <Icon icon="solar:map-point-bold" width="16" />
                </div>

    <input
        type="text"
        name="address"
        className={`block w-full pl-9 pr-9 py-2 text-sm font-semibold bg-white border ${error ? "border-red-500" : "border-slate-300"} rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all`}
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
                    onBlur={handleBlur}
                    required={required}
                    onKeyDown={handleKeyDown}
                />

                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
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
                    className={`absolute z-50 w-full bg-white border border-gray-200 max-h-60 overflow-y-auto shadow-xl rounded-md text-sm py-1 ${dropUp ? "bottom-full mb-1" : "top-full mt-1"}`}
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

            {error && <p className="mt-1 text-[11px] font-bold text-red-500">{error}</p>}
        </div>
    );
}
