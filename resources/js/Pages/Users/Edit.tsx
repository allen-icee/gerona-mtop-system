import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputGroup from "@/Components/InputGroup";
import PrimaryButton from "@/Components/PrimaryButton";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";
import { Icon } from "@iconify/react";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";

export default function Edit({ user }: { user: any }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        role: user.role || "staff",
        password: "", // Leave blank to keep current
        password_confirmation: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route("users.update", user.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Edit User:{" "}
                    <span className="text-blue-600">{user.name}</span>
                </h2>
            }
        >
            <Head title="Edit User" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <form
                        onSubmit={submit}
                        className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-blue-600"
                    >
                        <div className="flex items-center gap-2 mb-6 border-b pb-2">
                            <Icon
                                icon="solar:user-bold"
                                className="text-blue-600"
                                width="24"
                            />
                            <h3 className="text-lg font-bold text-gray-700">
                                Update Credentials
                            </h3>
                        </div>

                        {/* 1. NAME & USERNAME */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <InputGroup
                                id="name"
                                label="Full Name"
                                name="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                error={errors.name}
                                icon="solar:user-id-bold"
                            />

                            <InputGroup
                                id="username"
                                label="Username"
                                name="username"
                                value={data.username}
                                onChange={(e) =>
                                    setData("username", e.target.value)
                                }
                                error={errors.username}
                                icon="solar:user-bold"
                            />
                        </div>

                        {/* 2. EMAIL & ROLE */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <InputGroup
                                id="email"
                                label="Email (Optional)"
                                name="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                error={errors.email}
                                icon="solar:letter-bold"
                            />

                            <div className="mb-4">
                                <InputLabel
                                    htmlFor="role"
                                    value="System Role"
                                />
                                <div className="relative mt-1">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                        <Icon
                                            icon="solar:shield-user-bold"
                                            width="20"
                                        />
                                    </div>
                                    <select
                                        id="role"
                                        name="role"
                                        value={data.role}
                                        onChange={(e) =>
                                            setData("role", e.target.value)
                                        }
                                        className="block w-full pl-10 py-3 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
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
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        {/* 3. PASSWORD RESET (Optional) */}
                        <div className="border-t pt-4 mt-2">
                            <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">
                                Change Password (Optional)
                            </h4>
                            <p className="text-xs text-gray-400 mb-4">
                                Leave these blank if you do not want to change
                                the password.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <InputGroup
                                    id="password"
                                    label="New Password"
                                    name="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    error={errors.password}
                                    icon="solar:lock-password-bold"
                                    showPasswordToggle={true}
                                />

                                <InputGroup
                                    id="password_confirmation"
                                    label="Confirm New Password"
                                    name="password_confirmation"
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
                                />
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center justify-end gap-4 border-t pt-4">
                            <Link
                                href={route("users.index")}
                                className="text-sm text-gray-600 underline hover:text-gray-900"
                            >
                                Cancel
                            </Link>

                            <PrimaryButton
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={processing}
                            >
                                <Icon
                                    icon="solar:diskette-bold"
                                    className="mr-2"
                                    width="20"
                                />
                                Update User
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
