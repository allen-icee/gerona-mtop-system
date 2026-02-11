import { Icon } from "@iconify/react";
import TextInput from "./TextInput";
import InputLabel from "./InputLabel";
import InputError from "./InputError";
import { useState } from "react";

interface Props {
    id: string;
    label: string;
    name: string;
    value: string;
    onChange: (e: any) => void;
    type?: string;
    error?: string;
    icon?: string; // The icon name (e.g. "mdi:user")
    showPasswordToggle?: boolean; // Enable the "Eye" feature?
    placeholder?: string;
}

export default function InputGroup({
    id,
    label,
    name,
    value,
    onChange,
    type = "text",
    error,
    icon,
    showPasswordToggle = false,
    placeholder,
}: Props) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // If it's a password field with toggle, switch between 'text' and 'password'
    const inputType = showPasswordToggle
        ? isPasswordVisible
            ? "text"
            : "password"
        : type;

    return (
        <div className="mb-4">
            <InputLabel htmlFor={id} value={label} />

            <div className="relative mt-1">
                {/* 1. THE ICON (Left Side - Optional) */}
                {icon && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Icon icon={icon} width="20" height="20" />
                    </div>
                )}

                {/* 2. THE INPUT FIELD */}
                <TextInput
                    id={id}
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={`block w-full ${icon ? "pl-10" : "pl-3"} ${showPasswordToggle ? "pr-10" : "pr-3"} py-3`} // py-3 makes it taller
                    autoComplete={name}
                    placeholder={placeholder}
                />

                {/* 3. SHOW PASSWORD TOGGLE (Right Side - Optional) */}
                {showPasswordToggle && (
                    <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-600 transition"
                        tabIndex={-1} // Prevents Tab key from stopping on this button
                    >
                        <Icon
                            icon={
                                isPasswordVisible
                                    ? "solar:eye-bold"
                                    : "solar:eye-closed-bold"
                            }
                            width="20"
                            height="20"
                        />
                    </button>
                )}
            </div>

            <InputError message={error} className="mt-2" />
        </div>
    );
}
