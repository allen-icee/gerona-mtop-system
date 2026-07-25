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

    // New states for the Flush Logs feature
    const [isFlushModalOpen, setIsFlushModalOpen] = useState(false);
    const [isFlushing, setIsFlushing] = useState(false);

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

    const handleFlushLogs = () => {
        setIsFlushing(true);
        router.delete(route("audit-logs.flush"), {
            onFinish: () => {
                setIsFlushModalOpen(false);
                setIsFlushing(false);
            },
        });
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

            <div className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
                        <div className="relative w-full sm:w-auto">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                <Icon icon="iconamoon:search-bold" width="18" />
                            </div>
                            <TextInput
                                className="pl-10 w-full sm:w-80 py-2 text-sm shadow-sm border-slate-200"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2 px-4 rounded-md flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center transition-colors"
                        >
                            <Icon icon="solar:user-plus-bold" width="20" />
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

                    <div className="hidden md:block bg-slate-50 overflow-hidden shadow-sm rounded-lg border border-slate-200 mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-500 border-collapse [&_th]:border [&_th]:border-slate-200 [&_td]:border [&_td]:border-slate-200">
                                <thead className="text-[11px] text-slate-100 uppercase bg-slate-700 border-b border-slate-800">
                                    <tr>
                                        <th className="px-4 py-3 text-center">Name</th>
                                        <th className="px-4 py-3 text-center">Username</th>
                                        <th className="px-4 py-3 text-center">Role</th>
                                        <th className="px-4 py-3 text-center">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-4 py-6 text-center text-slate-400"
                                            >
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="bg-white even:bg-blue-50 hover:bg-slate-100 transition-colors border-b border-slate-200 last:border-0"
                                            >
                                                <td className="px-4 py-3 font-semibold text-slate-700 text-sm text-center">
                                                    {user.name}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600 text-center">
                                                    {user.username}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span
                                                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${user.role === "admin" ? "bg-purple-100/50 text-purple-700 border-purple-200/50" : "bg-blue-100/50 text-blue-700 border-blue-200/50"}`}
                                                    >
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => openModal(user)}
                                                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border border-blue-200 px-3 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-sm"
                                                        >
                                                            <Icon icon="solar:pen-new-square-bold" width="14" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => confirmDelete(user.id)}
                                                            disabled={user.id === 1}
                                                            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-sm border ${
                                                                user.id === 1
                                                                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                                                    : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                                                            }`}
                                                        >
                                                            <Icon icon="solar:trash-bin-trash-bold" width="14" />
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

                    <div className="mt-8 border-t border-slate-200 pt-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100/50 border border-indigo-200/50 text-indigo-600 rounded-lg hidden sm:block">
                                    <Icon
                                        icon="solar:history-bold-duotone"
                                        width="20"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-700 tracking-tight">
                                        System Audit Logs
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                        Track user actions and system changes
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <a
                                    href={route("audit-logs.export")}
                                    className="flex-1 sm:flex-none justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 shadow-sm transition-colors text-sm whitespace-nowrap"
                                >
                                    <Icon
                                        icon="solar:file-download-bold"
                                        width="18"
                                    />
                                    <span className="hidden sm:inline">
                                        Export CSV
                                    </span>
                                </a>
                                <button
                                    onClick={() => setIsFlushModalOpen(true)}
                                    className="flex-1 sm:flex-none justify-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 shadow-sm transition-colors text-sm whitespace-nowrap"
                                >
                                    <Icon
                                        icon="solar:trash-bin-trash-bold"
                                        width="18"
                                    />
                                    <span className="hidden sm:inline">
                                        Clear Logs
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-50 overflow-hidden shadow-sm rounded-lg border border-slate-200">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-500 whitespace-nowrap border-collapse [&_th]:border [&_th]:border-slate-200 [&_td]:border [&_td]:border-slate-200">
                                    <thead className="text-[11px] text-slate-100 uppercase bg-slate-700 border-b border-slate-800">
                                        <tr>
                                            <th className="px-4 py-3 text-center">
                                                Timestamp
                                            </th>
                                            <th className="px-4 py-3 text-center">User</th>
                                            <th className="px-4 py-3 text-center">
                                                Action
                                            </th>
                                            <th className="px-4 py-3 w-1/2 text-center">
                                                Details
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {auditLogs.data.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-4 py-6 text-center text-slate-400"
                                                >
                                                    No audit logs found.
                                                </td>
                                            </tr>
                                        ) : (
                                            auditLogs.data.map((log) => (
                                                <tr
                                                    key={log.id}
                                                    className="bg-white even:bg-blue-50 hover:bg-slate-100 transition-colors"
                                                >
                                                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500 text-center">
                                                        {formatDateTime(
                                                            log.created_at,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-slate-700 text-sm text-center">
                                                        {log.user ? (
                                                            log.user.name
                                                        ) : (
                                                            <span className="text-red-400 italic">
                                                                Deleted User
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="bg-slate-200/50 text-slate-700 border border-slate-300/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600 text-xs">
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
                <div className="bg-slate-50 rounded-none sm:rounded-lg h-full flex flex-col">
                    <div className="flex justify-between items-center bg-slate-700 px-5 py-3 rounded-none sm:rounded-t-lg border-b border-slate-800">
                        <h3 className="text-white font-bold text-base flex items-center gap-2">
                            <Icon
                                icon={
                                    editingUser
                                        ? "solar:pen-new-square-bold"
                                        : "solar:user-plus-bold"
                                }
                                width="20"
                                className="text-blue-400"
                            />
                            {editingUser ? "Edit User" : "Add New User"}
                        </h3>
                        <button
                            onClick={closeModal}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <Icon icon="solar:close-circle-bold" width="22" />
                        </button>
                    </div>

                    <div className="p-5">
                        <form id="user-form" onSubmit={submit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors placeholder:text-slate-400"
                                        placeholder="e.g. Juan Cruz"
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    {nameError && !errors.name && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                        Username <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={data.username}
                                        onChange={(e) => setData("username", e.target.value)}
                                        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors placeholder:text-slate-400"
                                        placeholder="e.g. juanc"
                                        required
                                    />
                                    {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                                    {usernameError && !errors.username && <p className="text-red-500 text-xs mt-1">{usernameError}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                        Email (Optional)
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors placeholder:text-slate-400"
                                        placeholder="email@example.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    {emailError && !errors.email && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                        System Role <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="role"
                                        value={data.role}
                                        onChange={(e) => setData("role", e.target.value)}
                                        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                    >
                                        <option value="staff">Staff (Limited Access)</option>
                                        <option value="admin">Administrator (Full Access)</option>
                                    </select>
                                    {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1 tracking-wide">
                                        <Icon icon="solar:lock-password-bold" width="14" />
                                        {editingUser ? "Change Password" : "Set Password"}
                                    </h4>
                                    {editingUser && (
                                        <span className="text-[9px] bg-slate-200 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase tracking-widest">
                                            Optional
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                                New Password {(!editingUser) && <span className="text-red-500">*</span>}
                                            </label>
                                            <input
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData("password", e.target.value)}
                                                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                                required={!editingUser}
                                                placeholder="••••••••"
                                            />
                                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                        </div>
                                        {data.password.length > 0 && (
                                            <div className="mt-2 p-2.5 bg-white rounded border border-slate-200 shadow-sm text-[11px]">
                                                <p className="font-bold text-slate-500 mb-1.5">
                                                    Password must contain:
                                                </p>
                                                <ul className="space-y-1">
                                                    <RequirementItem met={requirements.length} label="At least 8 characters" />
                                                    <RequirementItem met={requirements.uppercase} label="One uppercase letter (A-Z)" />
                                                    <RequirementItem met={requirements.number} label="One number (0-9)" />
                                                    <RequirementItem met={requirements.symbol} label="One symbol (!@#$)" />
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                                Confirm Password {(!editingUser) && <span className="text-red-500">*</span>}
                                            </label>
                                            <input
                                                id="password_confirmation"
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData("password_confirmation", e.target.value)}
                                                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                                required={!editingUser}
                                                placeholder="••••••••"
                                            />
                                            {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
                                        </div>
                                        {data.password_confirmation.length > 0 && (
                                            <div className={`mt-2 text-[11px] font-bold flex items-center gap-1.5 ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
                                                <Icon
                                                    icon={passwordsMatch ? "solar:check-circle-bold" : "solar:close-circle-bold"}
                                                    width="14"
                                                />
                                                {passwordsMatch ? "Passwords match!" : "Passwords do not match."}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-5 border-t border-slate-200 mt-5">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded text-sm font-bold hover:bg-slate-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={!isFormValid || processing}
                                    onClick={() => {
                                        (document.getElementById("user-form") as HTMLFormElement)?.requestSubmit();
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    <Icon icon="solar:diskette-bold" width="16" />
                                    {editingUser ? "Save Changes" : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>
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

            <ConfirmDeleteModal
                show={isFlushModalOpen}
                onClose={() => setIsFlushModalOpen(false)}
                onConfirm={handleFlushLogs}
                title="Clear All Audit Logs?"
                message="Are you sure you want to permanently delete ALL system audit logs? Make sure you have exported them to a CSV first. This action cannot be undone."
                processing={isFlushing}
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
