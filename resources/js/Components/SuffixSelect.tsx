//GeronaMTOP\resources\js\Components\SuffixSelect.tsx
import { useState, useEffect, useRef } from "react";
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
    const listRef = useRef<HTMLUListElement>(null);

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
        <div className="mb-4 relative">
            <label className="block text-sm text-gray-800 mb-1">
                Suffix
            </label>
            <div className="relative">
                <input
                    type="text"
                    className={`block w-full py-3 pl-3 pr-10 border-gray-400 text-gray-900 bg-white rounded-md shadow-sm focus:border-indigo-600 focus:ring-indigo-600 cursor-pointer caret-transparent ${error ? "border-red-500" : ""
                        }`}
                    value={value || "N/A"}
                    onClick={() => setIsOpen(true)}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    onKeyDown={handleKeyDown}
                    onChange={() => { }}
                    readOnly={false}
                />

                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-600">
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
                    className="absolute z-50 w-full bg-white border border-gray-200 mt-1 max-h-40 overflow-y-auto shadow-lg rounded-md text-sm"
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
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
    );
}
