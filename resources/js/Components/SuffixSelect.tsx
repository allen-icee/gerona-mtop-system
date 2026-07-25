//GeronaMTOP\resources\js\Components\SuffixSelect.tsx
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Icon } from "@iconify/react";

interface Props {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const SUFFIXES = ["", "JR.", "SR.", "I", "II", "III", "IV", "V"];

export default function SuffixSelect({
    value,
    onChange,
    error,
    onKeyDown,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [dropUp, setDropUp] = useState(false);
    const listRef = useRef<HTMLUListElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSelectedIndex(SUFFIXES.indexOf(value));
    }, [value]);

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
            // max-h-40 is 160px
            setDropUp(spaceBelow < 200 && rect.top > 200);
        }
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            setIsOpen(true);
            return;
        }

        if (isOpen) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < SUFFIXES.length - 1 ? prev + 1 : prev,
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
                onChange(SUFFIXES[selectedIndex]);
                setIsOpen(false);
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
        <div className="relative">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                Suffix
            </label>
            <div className="relative" ref={containerRef}>
                <input
                    type="text"
                    className={`block w-full px-3 py-2 text-sm font-semibold bg-white border ${error ? "border-red-500" : "border-slate-300"} rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 pr-9 cursor-pointer caret-transparent transition-all`}
                    value={value || "N/A"}
                    onClick={() => setIsOpen(true)}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    onKeyDown={handleKeyDown}
                    onChange={() => { }}
                    readOnly={false}
                />

                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                    <Icon
                        icon="solar:alt-arrow-down-bold"
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                            }`}
                        width="18"
                    />
                </div>
            </div>

            {isOpen && (
                <ul
                    ref={listRef}
                    className={`absolute z-50 w-full bg-white border border-gray-200 max-h-40 overflow-y-auto shadow-lg rounded-md text-sm ${dropUp ? "bottom-full mb-1" : "top-full mt-1"}`}
                >
                    {SUFFIXES.map((opt, index) => (
                        <li
                            key={opt}
                            className={`px-4 py-2 cursor-pointer text-gray-700 ${index === selectedIndex
                                ? "bg-indigo-100 text-indigo-800 font-semibold"
                                : "hover:bg-indigo-50"
                                }`}
                            onMouseDown={() => {
                                onChange(opt);
                                setIsOpen(false);
                            }}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            {opt === "" ? "N/A" : opt}
                        </li>
                    ))}
                </ul>
            )}
            {error && <p className="mt-1 text-[11px] font-bold text-red-500">{error}</p>}
        </div>
    );
}
