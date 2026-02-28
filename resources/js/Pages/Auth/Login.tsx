//GeronaMTOP\resources\js\Pages\Auth\Login.tsx
import GuestLayout from "@/Layouts/GuestLayout";
import InputGroup from "@/Components/InputGroup";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";
import { Icon } from "@iconify/react";

export default function Login({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: "",
        password: "",
    });

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
            <Head title="Secure Log in" />

            <form onSubmit={submit} className="space-y-5">
                <InputGroup
                    id="username"
                    label="Username"
                    name="username"
                    value={data.username}
                    onChange={(e: any) => setData("username", e.target.value)}
                    error={errors.username}
                    icon="solar:user-bold"
                    placeholder="Enter your username"
                />

                <InputGroup
                    id="password"
                    label="Password"
                    name="password"
                    type="password"
                    value={data.password}
                    onChange={(e: any) => setData("password", e.target.value)}
                    error={errors.password}
                    icon="solar:lock-password-bold"
                    showPasswordToggle={true}
                    placeholder="Enter your password"
                />

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={!isFormValid || processing}
                        className={`w-full flex items-center justify-center gap-2 rounded-xl border border-transparent px-6 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            isFormValid && !processing
                                ? "bg-blue-700 shadow-md hover:bg-blue-800 hover:shadow-lg hover:-translate-y-0.5 active:bg-blue-900 hover:cursor-pointer"
                                : "bg-gray-300 cursor-not-allowed text-gray-500"
                        }`}
                    >
                        {processing ? "Authenticating..." : <>Log In</>}
                    </button>
                </div>

                <div className="pt-2 text-center">
                    <Link
                        href="/"
                        className="text-[11px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                    >
                        <Icon icon="solar:arrow-left-bold" width="12" />
                        Return to Welcome Page
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
