import { useState, useMemo, useEffect, useRef, useLayoutEffect } from "react";
import { Icon } from "@iconify/react";

interface Props {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    error?: string;
    required?: boolean;
    disabled?: boolean;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    className?: string;
}

export default function SignatorySelect({
    label,
    value,
    onChange,
    options,
    error,
    required,
    disabled = false,
    onKeyDown,
    className = "",
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [dropUp, setDropUp] = useState(false);
    const listRef = useRef<HTMLUListElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const filtered = useMemo(() => {
        if (!value) return options;
        return options.filter((o) =>
            o.toUpperCase().includes(value.toUpperCase()),
        );
    }, [value, options]);

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
            // 200px is slightly more than max-h-40 (160px) + margins
            setDropUp(spaceBelow < 200 && rect.top > 200);
        }
    }, [isOpen, filtered]);

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

                const selectedOption = filtered[selectedIndex];
                const nameOnly = selectedOption.includes(" | ")
                    ? selectedOption.split(" | ")[0]
                    : selectedOption;

                onChange(nameOnly);
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
        <div className={`relative ${className}`}>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            <div className="relative" ref={containerRef}>
                <input
                    type="text"
                    className={`block w-full px-3 py-2 text-sm font-semibold bg-white border ${error ? "border-red-500" : "border-slate-300"} rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 pr-9 transition-all ${disabled ? "bg-slate-100 cursor-not-allowed text-slate-500" : "text-slate-900"}`}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => {
                        const sanitized = e.target.value.replace(
                            /[^a-zA-ZñÑ\s.,-]/g,
                            "",
                        );
                        onChange(sanitized);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    required={required}
                    placeholder="Search or type name..."
                    onKeyDown={handleKeyDown}
                />

                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500 z-10">
                    <Icon icon="solar:alt-arrow-down-bold" width="16" height="16" />
                </div>
            </div>

            {isOpen && filtered.length > 0 && (
                <ul
                    ref={listRef}
                    className={`absolute z-50 w-full bg-white border border-gray-200 max-h-40 overflow-y-auto shadow-lg rounded-md text-sm ${dropUp ? "bottom-full mb-1" : "top-full mt-1"}`}
                >
                    {filtered.map((option, index) => {
                        const [name, position] = option.includes(" | ")
                            ? option.split(" | ")
                            : [option, null];

                        return (
                            <li
                                key={index}
                                className={`px-4 py-2 cursor-pointer ${index === selectedIndex
                                    ? "bg-blue-100 text-blue-900"
                                    : "hover:bg-blue-50 text-gray-700"
                                    }`}
                                onMouseDown={() => {
                                    onChange(name);
                                    setIsOpen(false);
                                }}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <div className="flex flex-col">
                                    <span className="font-bold">{name}</span>
                                    {position && (
                                        <span className="text-[10px] normal-case italic opacity-60 font-medium -mt-0.5">
                                            {position}
                                        </span>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
            {error && <p className="mt-1 text-[11px] font-bold text-red-500">{error}</p>}
        </div>
    );
}
