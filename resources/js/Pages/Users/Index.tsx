//GeronaMTOP\resources\js\Pages\Users\Index.tsx
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Pagination from "@/Components/Pagination";
import TextInput from "@/Components/TextInput";
import Modal from "@/Components/Modal";
import InputGroup from "@/Components/InputGroup";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import InputLabel from "@/Components/InputLabel";
import { useState, useEffect, FormEventHandler } from "react";
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal";

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
}

interface Props {
    users: {
        data: User[];
        links: any[];
    };
    filters: {
        search?: string;
    };
}

export default function Index({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search || "");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: "",
        username: "",
        email: "",
        role: "staff",
        password: "",
        password_confirmation: "",
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                route("users.index"),
                { search },
                { preserveState: true, replace: true },
            );
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const openModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setData({
                name: user.name,
                username: user.username,
                email: user.email || "",
                role: user.role,
                password: "",
                password_confirmation: "",
            });
        } else {
            setEditingUser(null);
            reset();
            setData("role", "staff");
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => closeModal(),
        };

        if (editingUser) {
            put(route("users.update", editingUser.id), options);
        } else {
            post(route("users.store"), options);
        }
    };

    const confirmDelete = (id: number) => {
        setDeletingId(id);
    };

    const handleDelete = () => {
        if (deletingId) {
            setIsDeleting(true);
            router.delete(route("users.destroy", deletingId), {
                onFinish: () => {
                    setDeletingId(null);
                    setIsDeleting(false);
                },
            });
        }
    };

    const getRoleBadge = (role: string) => (
        <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                role === "admin"
                    ? "bg-purple-100 text-purple-700 border-purple-200"
                    : "bg-blue-100 text-blue-700 border-blue-200"
            }`}
        >
            {role}
        </span>
    );

    return (
        <AuthenticatedLayout>
            <Head title="System Users" />

            <div className="py-6 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <div className="relative w-full sm:w-auto">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500">
                                <Icon icon="iconamoon:search-bold" width="20" />
                            </div>
                            <TextInput
                                className="pl-12 w-full sm:w-80 py-3 text-base"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => openModal()}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 shadow-md transition-transform hover:scale-105 w-full sm:w-auto justify-center"
                        >
                            <Icon icon="solar:user-plus-bold" width="24" />
                            Add New User
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {users.data.length === 0 ? (
                            <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                                No users found.
                            </div>
                        ) : (
                            users.data.map((user) => (
                                <div
                                    key={user.id}
                                    className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-4"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">
                                                {user.name}
                                            </h3>
                                            <div className="flex items-center text-gray-500 text-sm mt-1">
                                                <Icon
                                                    icon="solar:user-bold"
                                                    className="mr-1"
                                                    width="16"
                                                />
                                                {user.username}
                                            </div>
                                        </div>
                                        {getRoleBadge(user.role)}
                                    </div>

                                    <div className="border-t border-gray-100 pt-4 flex gap-3">
                                        <button
                                            onClick={() => openModal(user)}
                                            className="flex-1 bg-blue-50 text-blue-700  hover:text-blue-800 rounded-md px-3 py-1.5 text-sm flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                                        >
                                            <Icon
                                                icon="solar:pen-new-square-bold"
                                                width="18"
                                            />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                confirmDelete(user.id)
                                            }
                                            disabled={user.id === 1}
                                            className={`flex-1 py-2 rounded-md font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                                                user.id === 1
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 p-1.5 rounded-md"
                                            }`}
                                        >
                                            <Icon
                                                icon="solar:trash-bin-trash-bold"
                                                width="18"
                                            />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="hidden md:block bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Username</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4 text-center">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-8 text-center text-gray-400"
                                        >
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="bg-white border-b hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 font-bold text-gray-800 text-base">
                                                {user.name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {user.username}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getRoleBadge(user.role)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-4">
                                                    <button
                                                        onClick={() =>
                                                            openModal(user)
                                                        }
                                                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 rounded-md px-3 py-1.5 transition-colors flex items-center gap-1 font-bold hover:cursor-pointer"
                                                        title="Edit User"
                                                    >
                                                        <Icon
                                                            icon="solar:pen-new-square-bold"
                                                            width="20"
                                                        />
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            confirmDelete(
                                                                user.id,
                                                            )
                                                        }
                                                        className={`bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 p-1.5 rounded-md transition-colors flex items-center gap-1 font-bold ${
                                                            user.id === 1
                                                                ? "opacity-30 cursor-not-allowed"
                                                                : "cursor-pointer"
                                                        }`}
                                                        disabled={user.id === 1}
                                                        title={
                                                            user.id === 1
                                                                ? "Main Admin cannot be deleted"
                                                                : "Delete User"
                                                        }
                                                    >
                                                        <Icon
                                                            icon="solar:trash-bin-trash-bold"
                                                            width="20"
                                                        />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6">
                        <Pagination links={users.links} />
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="xl">
                <div className="flex flex-col h-full sm:h-auto">
                    <div className="bg-gray-800 px-6 py-4 flex justify-between items-center shrink-0 sm:rounded-t-lg">
                        <h3 className="text-white font-bold uppercase tracking-wider text-lg flex items-center gap-2">
                            <Icon
                                icon={
                                    editingUser
                                        ? "solar:pen-new-square-bold"
                                        : "solar:user-plus-bold"
                                }
                            />
                            {editingUser ? "Edit User" : "Add New User"}
                        </h3>
                        <button
                            onClick={closeModal}
                            className="text-gray-400 hover:text-white transition-colors p-2"
                        >
                            <Icon icon="solar:close-circle-bold" width="28" />
                        </button>
                    </div>

                    <div className="p-6 bg-gray-50 overflow-y-auto flex-1">
                        <form id="user-form" onSubmit={submit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <InputGroup
                                    id="email"
                                    label="Email (Optional)"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    error={errors.email}
                                    icon="solar:letter-bold"
                                />

                                <div>
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
                                            value={data.role}
                                            onChange={(e) =>
                                                setData("role", e.target.value)
                                            }
                                            className="block w-full pl-10 py-3 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        >
                                            <option value="staff">Staff</option>
                                            <option value="admin">
                                                Administrator
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mt-2">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1">
                                    <Icon icon="solar:lock-password-bold" />
                                    {editingUser
                                        ? "Change Password (Optional)"
                                        : "Set Password"}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputGroup
                                        id="password"
                                        label="Password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        error={errors.password}
                                        showPasswordToggle={true}
                                        required={!editingUser}
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
                                        showPasswordToggle={true}
                                        required={!editingUser}
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white border-t px-6 py-4 flex justify-end gap-3 shrink-0 sm:rounded-b-lg pb-safe">
                        <SecondaryButton
                            onClick={closeModal}
                            className="justify-center flex-1 sm:flex-none"
                        >
                            Cancel
                        </SecondaryButton>

                        <PrimaryButton
                            className="bg-blue-600 hover:bg-blue-700 justify-center flex-1 sm:flex-none"
                            disabled={processing}
                            onClick={() => {
                                (
                                    document.getElementById(
                                        "user-form",
                                    ) as HTMLFormElement
                                )?.requestSubmit();
                            }}
                        >
                            <Icon icon="solar:diskette-bold" className="mr-2" />
                            {editingUser ? "Update User" : "Save User"}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            <ConfirmDeleteModal
                show={deletingId !== null}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDelete}
                title="Delete User?"
                message="Are you sure you want to remove this user from the system? They will no longer be able to login."
                processing={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
