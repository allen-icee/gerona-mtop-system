import DangerButton from "@/Components/DangerButton";
import InputGroup from "@/Components/InputGroup";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import { useForm } from "@inertiajs/react";
import { FormEventHandler, useRef, useState } from "react";
import { Icon } from "@iconify/react";

export default function DeleteUserForm({
    className = "",
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: "",
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route("profile.destroy"), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header className="flex items-start gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-lg shrink-0">
                    <Icon icon="solar:trash-bin-trash-bold" width="24" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        Delete Account
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Once your account is deleted, all of its resources and
                        data will be permanently deleted. Before deleting your
                        account, please download any data or information that
                        you wish to retain.
                    </p>
                </div>
            </header>

            <div className="flex justify-end sm:justify-start">
                <DangerButton onClick={confirmUserDeletion}>
                    <Icon icon="solar:trash-bin-trash-bold" className="mr-2" />
                    Delete Account
                </DangerButton>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                {/* RESPONSIVE MODAL STRUCTURE */}
                <div className="flex flex-col h-full sm:h-auto">
                    {/* 1. Header (Red for Danger) */}
                    <div className="bg-red-600 px-6 py-4 flex justify-between items-center shrink-0 sm:rounded-t-lg">
                        <h3 className="text-white font-bold uppercase tracking-wider text-lg flex items-center gap-2">
                            <Icon icon="solar:danger-triangle-bold" />
                            Confirm Deletion
                        </h3>
                        <button
                            onClick={closeModal}
                            className="text-red-200 hover:text-white transition-colors"
                        >
                            <Icon icon="solar:close-circle-bold" width="28" />
                        </button>
                    </div>

                    {/* 2. Body */}
                    <div className="p-6 bg-white overflow-y-auto flex-1">
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete your account? Once
                            your account is deleted, all of its resources and
                            data will be permanently deleted. Please enter your
                            password to confirm you would like to permanently
                            delete your account.
                        </p>

                        <form id="delete-account-form" onSubmit={deleteUser}>
                            <InputGroup
                                id="password"
                                type="password"
                                name="password"
                                label="Password"
                                placeholder="Enter password to confirm"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                error={errors.password}
                                icon="solar:lock-password-bold"
                                showPasswordToggle={true}
                                required
                            />
                        </form>
                    </div>

                    {/* 3. Footer */}
                    <div className="bg-gray-50 border-t px-6 py-4 flex justify-end gap-3 shrink-0 sm:rounded-b-lg pb-safe">
                        <SecondaryButton
                            onClick={closeModal}
                            className="justify-center flex-1 sm:flex-none"
                        >
                            Cancel
                        </SecondaryButton>

                        <DangerButton
                            className="justify-center flex-1 sm:flex-none"
                            disabled={processing}
                            onClick={() => {
                                (
                                    document.getElementById(
                                        "delete-account-form",
                                    ) as HTMLFormElement
                                )?.requestSubmit();
                            }}
                        >
                            <Icon
                                icon="solar:trash-bin-trash-bold"
                                className="mr-2"
                            />
                            Delete Account
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </section>
    );
}
