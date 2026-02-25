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
import InputError from "@/Components/InputError";
import { useState, useEffect, useRef, FormEventHandler } from "react";
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal";

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
}

interface AuditLog {
    id: number;
    action: string;
    payload: string | any;
    created_at: string;
    user?: User;
}

interface Props {
    users: {
        data: User[];
        links: any[];
    };
    auditLogs: {
        data: AuditLog[];
        links: any[];
    };
    filters: {
        search?: string;
    };
}

export default function Index({ users, auditLogs, filters }: Props) {
    const [search, setSearch] = useState(filters.search || "");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const initialRender = useRef(true);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: "",
        username: "",
        email: "",
        role: "staff",
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
            setNameError(
                isValid
                    ? ""
                    : "Names can only contain letters, spaces, and dots.",
            );
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
                    "Username must be at least 5 characters long.",
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
            setEmailError(isValid ? "" : "Please enter a valid email address.");
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

    const isPasswordValid =
        editingUser && data.password === ""
            ? true
            : allRequirementsMet && passwordsMatch;

    const isFormValid =
        data.name.trim() !== "" &&
        nameError === "" &&
        data.username.trim() !== "" &&
        usernameError === "" &&
        emailError === "" &&
        isPasswordValid;

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }
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
        setNameError("");
        setUsernameError("");
        setEmailError("");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { onSuccess: () => closeModal() };
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

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const renderPayload = (payload: any) => {
        if (!payload) return "-";
        if (typeof payload === "string") return payload;
        return (
            <span className="text-gray-400 italic text-xs">Details Data</span>
        );
    };

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
                                className="pl-12 w-full sm:w-80 py-3 text-base shadow-sm"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 shadow-md w-full sm:w-auto justify-center transition-transform hover:scale-105"
                        >
                            <Icon icon="solar:user-plus-bold" width="24" />
                            Add New User
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:hidden mb-6">
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
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${user.role === "admin" ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}
                                        >
                                            {user.role}
                                        </span>
                                    </div>

                                    <div className="border-t border-gray-100 pt-4 flex gap-3">
                                        <button
                                            onClick={() => openModal(user)}
                                            className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
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
                                            className={`flex-1 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                                                user.id === 1
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-red-50 text-red-600 hover:bg-red-100"
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

                    <div className="hidden md:block bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100 mb-6">
                        <div className="overflow-x-auto">
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
                                                <td className="px-6 py-4">
                                                    {user.username}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${user.role === "admin" ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}
                                                    >
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-3">
                                                        <button
                                                            onClick={() =>
                                                                openModal(user)
                                                            }
                                                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                                                        >
                                                            <Icon
                                                                icon="solar:pen-new-square-bold"
                                                                width="18"
                                                            />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                confirmDelete(
                                                                    user.id,
                                                                )
                                                            }
                                                            disabled={
                                                                user.id === 1
                                                            }
                                                            className={`bg-red-50 text-red-600 px-4 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors ${
                                                                user.id === 1
                                                                    ? "opacity-50 cursor-not-allowed"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <Icon
                                                                icon="solar:trash-bin-trash-bold"
                                                                width="18"
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
                    </div>
                    <Pagination links={users.links} />

                    <div className="mt-16">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shadow-sm hidden sm:block">
                                    <Icon
                                        icon="solar:history-bold-duotone"
                                        width="28"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                        System Audit Logs
                                    </h2>
                                    <p className="text-sm text-gray-500 font-medium mt-0.5">
                                        Track user actions and system changes
                                    </p>
                                </div>
                            </div>

                            <a
                                href={route("audit-logs.export")}
                                className="bg-green-600 hover:bg-green-700 text-white border border-emerald-200 hover:border-emerald-600 font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
                            >
                                <Icon icon="solar:export-bold" width="20" />
                                <span className="hidden sm:inline">
                                    Export CSV
                                </span>
                            </a>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500 whitespace-nowrap">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4">
                                                Timestamp
                                            </th>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">
                                                Action
                                            </th>
                                            <th className="px-6 py-4 w-1/2">
                                                Details
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {auditLogs.data.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-6 py-8 text-center text-gray-400"
                                                >
                                                    No audit logs found.
                                                </td>
                                            </tr>
                                        ) : (
                                            auditLogs.data.map((log) => (
                                                <tr
                                                    key={log.id}
                                                    className="bg-white border-b hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                                        {formatDateTime(
                                                            log.created_at,
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-gray-800">
                                                        {log.user ? (
                                                            log.user.name
                                                        ) : (
                                                            <span className="text-red-400 italic">
                                                                Deleted User
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700">
                                                        {renderPayload(
                                                            log.payload,
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Pagination links={auditLogs.links} />
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="xl">
                <div className="flex justify-between items-center bg-gray-800 px-6 py-4 rounded-t-lg">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Icon
                            icon={
                                editingUser
                                    ? "solar:pen-new-square-bold"
                                    : "solar:user-plus-bold"
                            }
                            width="24"
                        />
                        {editingUser ? "Edit User" : "Add New User"}
                    </h3>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <Icon icon="solar:close-circle-bold" width="28" />
                    </button>
                </div>

                <div className="p-6 bg-gray-50">
                    <form id="user-form" onSubmit={submit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <InputGroup
                                id="name"
                                label="Full Name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                error={errors.name || nameError}
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
                                error={errors.username || usernameError}
                                icon="solar:user-bold"
                                placeholder="e.g. juanc"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <InputGroup
                                id="email"
                                label="Email (Optional)"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                error={errors.email || emailError}
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

                        <div className="border-t border-gray-200 pt-4 mt-2">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                    <Icon
                                        icon="solar:lock-password-bold"
                                        width="16"
                                    />
                                    {editingUser
                                        ? "Change Password"
                                        : "Set Password"}
                                </h4>
                                {editingUser && (
                                    <span className="text-[10px] bg-gray-200 text-gray-500 font-bold px-2 py-1 rounded uppercase tracking-widest">
                                        Optional
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <InputGroup
                                        id="password"
                                        label="New Password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        error={errors.password}
                                        icon="solar:key-minimalistic-bold"
                                        showPasswordToggle={true}
                                        required={!editingUser}
                                    />
                                    {data.password.length > 0 && (
                                        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm text-xs">
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
                                </div>

                                <div className="flex flex-col">
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
                                        required={!editingUser}
                                    />
                                    {data.password_confirmation.length > 0 && (
                                        <div
                                            className={`mt-3 text-xs font-bold flex items-center gap-1.5 ${passwordsMatch ? "text-green-600" : "text-red-500"}`}
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
                                                ? "Passwords match!"
                                                : "Passwords do not match."}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="bg-white border-t px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                    <SecondaryButton
                        onClick={closeModal}
                        className="justify-center flex-1 sm:flex-none"
                    >
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton
                        className={`justify-center flex-1 sm:flex-none shadow-md transition-all ${!isFormValid || processing ? "opacity-50 cursor-not-allowed bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
                        disabled={!isFormValid || processing}
                        onClick={() => {
                            (
                                document.getElementById(
                                    "user-form",
                                ) as HTMLFormElement
                            )?.requestSubmit();
                        }}
                    >
                        <Icon
                            icon="solar:diskette-bold"
                            className="mr-2"
                            width="20"
                        />
                        {editingUser ? "Save Changes" : "Create User"}
                    </PrimaryButton>
                </div>
            </Modal>

            <ConfirmDeleteModal
                show={deletingId !== null}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDelete}
                title="Delete User?"
                message="Are you sure you want to completely remove this user from the system? They will no longer be able to log in."
                processing={isDeleting}
            />
        </AuthenticatedLayout>
    );
}

function RequirementItem({ met, label }: { met: boolean; label: string }) {
    return (
        <li
            className={`flex items-center gap-2 ${met ? "text-green-600 font-bold" : "text-gray-400"}`}
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
