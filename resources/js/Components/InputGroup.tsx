import { useState, InputHTMLAttributes } from "react";
import { Icon } from "@iconify/react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    icon?: string;
    showPasswordToggle?: boolean;
    required?: boolean;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; // Added onKeyDown
}

export default function InputGroup({
    label,
    name,
    value,
    className = "",
    error,
    icon,
    type = "text",
    showPasswordToggle = false,
    required = false,
    onKeyDown, // Destructure onKeyDown
    ...props
}: Props) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const inputType = showPasswordToggle
        ? isPasswordVisible
            ? "text"
            : "password"
        : type;

    return (
        <div className={`mb-4 relative ${className}`}>
            <label
                htmlFor={name}
                className="block font-medium text-sm text-gray-700 mb-1"
            >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Icon icon={icon} width="20" height="20" />
                    </div>
                )}

                <input
                    {...props}
                    id={name}
                    name={name}
                    value={value}
                    type={inputType}
                    required={required}
                    onKeyDown={onKeyDown} // Pass onKeyDown to input
                    className={`border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-full py-3 ${
                        icon ? "pl-10" : "pl-3"
                    } ${error ? "border-red-500" : ""}`}
                />

                {showPasswordToggle && (
                    <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                        <Icon
                            icon={
                                isPasswordVisible
                                    ? "solar:eye-bold"
                                    : "solar:eye-closed-bold"
                            }
                            width="20"
                        />
                    </button>
                )}
            </div>

            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
    );
}
