//GeronaMTOP\resources\js\Pages\Auth\Register.tsx
import PrimaryButton from "@/Components/PrimaryButton";
import GuestLayout from "@/Layouts/GuestLayout";
import InputGroup from "@/Components/InputGroup";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler, useEffect, useState } from "react";
import { Icon } from "@iconify/react";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        username: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const [requirements, setRequirements] = useState({
        length: false,
        number: false,
        symbol: false,
        uppercase: false,
    });

    const [usernameError, setUsernameError] = useState("");
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");

    useEffect(() => {
        if (data.name.length > 0) {
            const isValid = /^[a-zA-Z\s.]+$/.test(data.name);
            if (!isValid) {
                setNameError(
                    "Names can only contain letters, spaces, and dots.",
                );
            } else {
                setNameError("");
            }
        } else {
            setNameError("");
        }
    }, [data.name]);

    useEffect(() => {
        if (data.username.length > 0) {
            const isFormatValid = /^[a-zA-Z0-9._-]+$/.test(data.username);
            const isLengthValid = data.username.length >= 5;

            if (!isFormatValid) {
                setUsernameError(
                    "Username can only contain letters, numbers, and _ . -",
                );
            } else if (!isLengthValid) {
                setUsernameError(
                    "Username must be at least 3 characters long.",
                );
            } else {
                setUsernameError("");
            }
        } else {
            setUsernameError("");
        }
    }, [data.username]);

    useEffect(() => {
        if (data.email.length > 0) {
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
            if (!isValid) {
                setEmailError("Please enter a valid email address.");
            } else {
                setEmailError("");
            }
        } else {
            setEmailError("");
        }
    }, [data.email]);

    useEffect(() => {
        setRequirements({
            length: data.password.length >= 8,
            number: /[0-9]/.test(data.password),
            symbol: /[!@#$%^&*(),.?":{}|<>_-]/.test(data.password),
            uppercase: /[A-Z]/.test(data.password),
        });
    }, [data.password]);

    const allRequirementsMet =
        requirements.length &&
        requirements.number &&
        requirements.symbol &&
        requirements.uppercase;

    const passwordsMatch =
        data.password === data.password_confirmation &&
        data.password_confirmation.length > 0;

    const isFormValid =
        data.name.trim() !== "" &&
        nameError === "" &&
        data.username.trim() !== "" &&
        usernameError === "" &&
        emailError === "" &&
        allRequirementsMet &&
        passwordsMatch;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                <InputGroup
                    id="name"
                    label="Full Name"
                    name="name"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    error={errors.name || nameError}
                    icon="solar:user-id-bold"
                    placeholder="Enter full name"
                />

                <InputGroup
                    id="username"
                    label="Username"
                    name="username"
                    value={data.username}
                    onChange={(e) => setData("username", e.target.value)}
                    error={errors.username || usernameError}
                    icon="solar:user-bold"
                    placeholder="Enter username"
                />

                <InputGroup
                    id="email"
                    label="Email Address (Optional)"
                    name="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    error={errors.email || emailError}
                    icon="solar:letter-bold"
                    placeholder="Enter email address"
                />

                <InputGroup
                    id="password"
                    label="Password"
                    name="password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                    error={errors.password}
                    icon="solar:lock-password-bold"
                    showPasswordToggle={true}
                    placeholder="Create a password"
                />

                {data.password.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                        <p className="font-bold text-gray-500 mb-2">
                            Password must contain:
                        </p>
                        <ul className="space-y-1">
                            <RequirementItem
                                met={requirements.length}
                                label="At least 8 characters"
                            />
                            <RequirementItem
                                met={requirements.uppercase}
                                label="One uppercase letter (A-Z)"
                            />
                            <RequirementItem
                                met={requirements.number}
                                label="One number (0-9)"
                            />
                            <RequirementItem
                                met={requirements.symbol}
                                label="One symbol (!@#$)"
                            />
                        </ul>
                    </div>
                )}

                <InputGroup
                    id="password_confirmation"
                    label="Confirm Password"
                    name="password_confirmation"
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) =>
                        setData("password_confirmation", e.target.value)
                    }
                    error={errors.password_confirmation}
                    icon="solar:shield-check-bold"
                    showPasswordToggle={true}
                    placeholder="Retype password"
                />

                {data.password_confirmation.length > 0 && (
                    <div
                        className={`mb-4 text-xs font-bold flex items-center gap-2 ${passwordsMatch ? "text-green-600" : "text-red-500"}`}
                    >
                        <Icon
                            icon={
                                passwordsMatch
                                    ? "solar:check-circle-bold"
                                    : "solar:close-circle-bold"
                            }
                            width="16"
                        />
                        {passwordsMatch
                            ? "Passwords match perfectly!"
                            : "Passwords do not match yet."}
                    </div>
                )}

                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
                    <Link
                        href={route("login")}
                        className="text-center sm:text-left rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton
                        className={`justify-center py-3 font-bold tracking-wide transition duration-150 ease-in-out ${
                            isFormValid
                                ? "bg-blue-900 hover:bg-blue-800"
                                : "bg-gray-400 cursor-not-allowed opacity-70"
                        }`}
                        disabled={!isFormValid || processing}
                    >
                        REGISTER ACCOUNT
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}

function RequirementItem({ met, label }: { met: boolean; label: string }) {
    return (
        <li
            className={`flex items-center gap-2 ${met ? "text-green-600" : "text-gray-400"}`}
        >
            <Icon
                icon={
                    met ? "solar:check-circle-bold" : "solar:close-circle-bold"
                }
                width="14"
                height="14"
            />
            <span>{label}</span>
        </li>
    );
}
