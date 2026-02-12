import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Pagination from "@/Components/Pagination";
import TextInput from "@/Components/TextInput";
import { useState, useEffect } from "react";

// Props Interface
interface Props {
    users: {
        data: Array<{
            id: number;
            name: string;
            username: string;
            role: string;
        }>;
        links: any[];
    };
    filters: {
        search?: string;
    };
}

export default function Index({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search || "");

    // 1. AUTO-SEARCH (Debounced)
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

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to remove this user?")) {
            router.delete(route("users.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="System Users" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* TOOLBAR (Bigger & Cleaner) */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        {/* SEARCH */}
                        <div className="relative w-full sm:w-auto">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500">
                                <Icon icon="solar:magnifer-bold" width="20" />
                            </div>
                            <TextInput
                                className="pl-12 w-full sm:w-80 py-3 text-base"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* ADD BUTTON */}
                        <Link
                            href={route("users.create")}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 shadow-md transition-transform hover:scale-105 w-full sm:w-auto justify-center"
                        >
                            <Icon icon="solar:user-plus-bold" width="24" />
                            Add New User
                        </Link>
                    </div>

                    {/* TABLE */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
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
                                            {/* NAME */}
                                            <td className="px-6 py-4 font-bold text-gray-800 text-base">
                                                {user.name}
                                            </td>

                                            {/* USERNAME */}
                                            <td className="px-6 py-4 text-gray-600">
                                                {user.username}
                                            </td>

                                            {/* ROLE BADGE */}
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                                        user.role === "admin"
                                                            ? "bg-purple-100 text-purple-700 border-purple-200"
                                                            : "bg-blue-100 text-blue-700 border-blue-200"
                                                    }`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-6 py-4 text-center flex justify-center gap-4">
                                                <Link
                                                    href={route(
                                                        "users.edit",
                                                        user.id,
                                                    )}
                                                    className="text-blue-500 hover:text-blue-700 transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Icon
                                                        icon="solar:pen-new-square-bold"
                                                        width="24"
                                                    />
                                                </Link>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(user.id)
                                                    }
                                                    className={`text-red-500 hover:text-red-700 transition-colors ${
                                                        user.id === 1
                                                            ? "opacity-30 cursor-not-allowed"
                                                            : ""
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
                                                        width="24"
                                                    />
                                                </button>
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
        </AuthenticatedLayout>
    );
}
