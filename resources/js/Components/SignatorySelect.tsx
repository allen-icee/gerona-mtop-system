import { useState, useMemo, useEffect, useRef } from "react";
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
    const listRef = useRef<HTMLUListElement>(null);

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
            <label className="block mb-1 font-semibold text-gray-800">
                {label} {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <div className="relative">
                <input
                    type="text"
                    className={`block w-full h-12 pl-4 pr-10 text-sm font-semibold border-gray-400 rounded-lg shadow-sm focus:border-blue-600 focus:ring-blue-600 transition-all ${error ? "border-red-500" : ""
                        } ${disabled
                            ? "bg-gray-100 cursor-not-allowed text-gray-500"
                            : "bg-white text-gray-900"
                        }`}
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

                <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-gray-400 z-10">
                    <Icon icon="solar:alt-arrow-down-bold" width="20" height="20" />
                </div>
            </div>

            {isOpen && filtered.length > 0 && (
                <ul
                    ref={listRef}
                    className="absolute z-50 w-full bg-white border border-gray-200 mt-1 max-h-40 overflow-y-auto shadow-lg rounded-md text-sm"
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
            {error && <p className="text-sm text-red-600 mt-1.5">{error}</p>}
        </div>
    );
}
