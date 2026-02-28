//GeronaMTOP\resources\js\Components\InputGroup.tsx
import { InputHTMLAttributes, useState } from "react";
import { Icon } from "@iconify/react";
import InputLabel from "./InputLabel";
import TextInput from "./TextInput";
import InputError from "./InputError";

interface InputGroupProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    icon?: string;
    showPasswordToggle?: boolean;
}

export default function InputGroup({
    label,
    error,
    icon,
    showPasswordToggle = false,
    type = "text",
    className = "",
    id,
    ...props
}: InputGroupProps) {
    const [showPassword, setShowPassword] = useState(false);

    const currentType = showPasswordToggle && showPassword ? "text" : type;

    return (
        <div className={className}>
            <InputLabel
                htmlFor={id}
                value={label}
                className="mb-1 font-semibold text-gray-700"
            />
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400 z-10">
                        <Icon icon={icon} width="20" height="20" />
                    </div>
                )}

                <TextInput
                    id={id}
                    type={currentType}
                    className={`block w-full h-12 font-semibold ${icon ? "pl-11" : "pl-4"} ${
                        showPasswordToggle ? "pr-11" : "pr-4"
                    } border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm transition-all text-sm bg-gray-50 focus:bg-white`}
                    {...props}
                />

                {showPasswordToggle && type === "password" && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-blue-600 transition-colors z-10 focus:outline-none"
                        tabIndex={-1}
                    >
                        <Icon
                            icon={
                                showPassword
                                    ? "solar:eye-bold-duotone"
                                    : "solar:eye-closed-bold-duotone"
                            }
                            width="22"
                            height="22"
                        />
                    </button>
                )}
            </div>
            <InputError message={error} className="mt-1.5" />
        </div>
    );
}
