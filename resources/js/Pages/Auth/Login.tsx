import PrimaryButton from "@/Components/PrimaryButton";
import GuestLayout from "@/Layouts/GuestLayout";
import InputGroup from "@/Components/InputGroup";
import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";

export default function Login({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: "",
        password: "",
    });

    // VALIDATION: Are both fields filled?
    const isFormValid =
        data.username.trim() !== "" && data.password.trim() !== "";

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600 text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                {/* 1. USERNAME FIELD */}
                <InputGroup
                    id="username"
                    label="Username"
                    name="username"
                    value={data.username}
                    onChange={(e) => setData("username", e.target.value)}
                    error={errors.username}
                    icon="solar:user-bold"
                    placeholder="Enter your username"
                />

                {/* 2. PASSWORD FIELD */}
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
                    placeholder="Enter your password"
                />

                {/* 3. SUBMIT BUTTON (Smart) */}
                <div className="mt-6">
                    <PrimaryButton
                        className={`w-full justify-center py-3 text-lg font-semibold tracking-wide transition duration-150 ease-in-out ${
                            isFormValid && !processing
                                ? "bg-blue-900 hover:bg-blue-800"
                                : "bg-gray-400 cursor-not-allowed opacity-70"
                        }`}
                        disabled={!isFormValid || processing}
                    >
                        LOG IN
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
