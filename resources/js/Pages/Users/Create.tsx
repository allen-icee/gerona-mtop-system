//GeronaMTOP\resources\js\Pages\Users\Create.tsx
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputGroup from "@/Components/InputGroup";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";
import { Icon } from "@iconify/react";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        username: "",
        email: "",
        role: "staff",
        password: "",
        password_confirmation: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("users.store"));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Add System User" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center gap-3">
                        <Link
                            href={route("users.index")}
                            className="p-2 bg-white text-gray-500 hover:text-blue-600 rounded-full shadow-sm hover:shadow transition-all border border-gray-100"
                        >
                            <Icon icon="solar:arrow-left-bold" width="24" />
                        </Link>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Add New User
                        </h2>
                    </div>

                    <form
                        onSubmit={submit}
                        className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-100 relative z-0"
                    >
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                <Icon
                                    icon="solar:user-plus-bold-duotone"
                                    width="28"
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                    User Profile
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Set up the personal details and role.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <InputGroup
                                id="name"
                                label="Full Name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                error={errors.name}
                                icon="solar:user-id-bold"
                                placeholder="e.g. Juan Cruz"
                                required
                            />

                            <InputGroup
                                id="username"
                                label="Username"
                                value={data.username}
                                onChange={(e) =>
                                    setData("username", e.target.value)
                                }
                                error={errors.username}
                                icon="solar:user-bold"
                                placeholder="e.g. juanc"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <InputGroup
                                id="email"
                                label="Email Address (Optional)"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                error={errors.email}
                                icon="solar:letter-bold"
                                placeholder="email@example.com"
                            />

                            <div>
                                <InputLabel
                                    htmlFor="role"
                                    value="System Role"
                                    className="mb-1 font-semibold text-gray-700"
                                />
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400 z-10">
                                        <Icon
                                            icon="solar:shield-user-bold"
                                            width="20"
                                        />
                                    </div>
                                    <select
                                        id="role"
                                        value={data.role}
                                        onChange={(e) =>
                                            setData("role", e.target.value)
                                        }
                                        className="block w-full pl-11 py-2.5 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm text-sm bg-gray-50 focus:bg-white transition-colors"
                                    >
                                        <option value="staff">
                                            Staff (Limited Access)
                                        </option>
                                        <option value="admin">
                                            Administrator (Full Access)
                                        </option>
                                    </select>
                                </div>
                                <InputError
                                    message={errors.role}
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-8 mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                                    <Icon
                                        icon="solar:lock-password-bold-duotone"
                                        width="28"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        Security
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Create a secure password for this
                                        account.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup
                                    id="password"
                                    label="Password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    error={errors.password}
                                    icon="solar:key-minimalistic-bold"
                                    showPasswordToggle={true}
                                    required
                                />

                                <InputGroup
                                    id="password_confirmation"
                                    label="Confirm Password"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value,
                                        )
                                    }
                                    error={errors.password_confirmation}
                                    icon="solar:shield-check-bold"
                                    showPasswordToggle={true}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-gray-100">
                            <Link
                                href={route("users.index")}
                                className="w-full sm:w-auto text-center"
                            >
                                <SecondaryButton className="w-full justify-center py-3">
                                    Cancel
                                </SecondaryButton>
                            </Link>

                            <PrimaryButton
                                className="w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-700 py-3 px-8 text-base shadow-lg hover:-translate-y-0.5 transition-all"
                                disabled={processing}
                            >
                                <Icon
                                    icon="solar:diskette-bold"
                                    className="mr-2"
                                    width="20"
                                />
                                Create User
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
