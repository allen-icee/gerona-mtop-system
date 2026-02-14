import InputGroup from "@/Components/InputGroup";
import PrimaryButton from "@/Components/PrimaryButton";
import { Transition } from "@headlessui/react";
import { useForm } from "@inertiajs/react";
import { FormEventHandler, useRef } from "react";
import { Icon } from "@iconify/react";

export default function UpdatePasswordForm({
    className = "",
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route("password.update"), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset("password", "password_confirmation");
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset("current_password");
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                    <Icon icon="solar:lock-password-bold" width="24" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        Update Password
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Ensure your account is using a long, random password to
                        stay secure.
                    </p>
                </div>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-4">
                <InputGroup
                    id="current_password"
                    label="Current Password"
                    type="password"
                    value={data.current_password}
                    onChange={(e) =>
                        setData("current_password", e.target.value)
                    }
                    error={errors.current_password}
                    ref={currentPasswordInput}
                    autoComplete="current-password"
                    showPasswordToggle={true}
                    icon="solar:key-minimalistic-bold"
                />

                <InputGroup
                    id="password"
                    label="New Password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                    error={errors.password}
                    ref={passwordInput}
                    autoComplete="new-password"
                    showPasswordToggle={true}
                    icon="solar:lock-bold"
                />

                <InputGroup
                    id="password_confirmation"
                    label="Confirm Password"
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) =>
                        setData("password_confirmation", e.target.value)
                    }
                    error={errors.password_confirmation}
                    autoComplete="new-password"
                    showPasswordToggle={true}
                    icon="solar:shield-check-bold"
                />

                <div className="flex items-center gap-4 pt-2">
                    <PrimaryButton disabled={processing}>
                        <Icon icon="solar:diskette-bold" className="mr-2" />
                        Save Password
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Icon
                                icon="solar:check-circle-bold"
                                className="text-green-500"
                            />
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
