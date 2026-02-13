import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";

interface Props {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    error?: string;
    required?: boolean;
}

export default function SignatorySelect({
    label,
    value,
    onChange,
    options,
    error,
    required,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const filtered = useMemo(() => {
        if (!value) return options;
        return options.filter((o) =>
            o.toUpperCase().includes(value.toUpperCase()),
        );
    }, [value, options]);

    return (
        <div className="mb-4 relative">
            <label className="block font-medium text-sm text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type="text"
                    className={`block w-full py-3 pl-3 pr-10 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${error ? "border-red-500" : ""}`}
                    value={value}
                    onChange={(e) => {
                        // ALLOW: Letters (A-Z), Spaces (\s), Dots (.), Commas (,), Dashes (-)
                        const sanitized = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z\s.,-]/g, "");

                        onChange(sanitized);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    required={required}
                    placeholder="Search or type name..."
                />

                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <Icon icon="solar:alt-arrow-down-bold" />
                </div>
            </div>

            {isOpen && filtered.length > 0 && (
                <ul className="absolute z-50 w-full bg-white border border-gray-200 mt-1 max-h-40 overflow-y-auto shadow-lg rounded-md text-sm">
                    {filtered.map((name, index) => (
                        <li
                            key={index}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700 uppercase"
                            onMouseDown={() => {
                                onChange(name);
                                setIsOpen(false);
                            }}
                        >
                            {name}
                        </li>
                    ))}
                </ul>
            )}
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
    );
}
