import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { useState, useEffect, FormEventHandler } from "react";
import InputGroup from "@/Components/InputGroup";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import { Icon } from "@iconify/react";

interface Signatory {
    id: number;
    name: string;
    position: string;
    is_active: boolean;
}

interface Props {
    signatories: Signatory[];
    filters?: {
        search?: string;
    };
}

export default function Index({ signatories = [], filters = {} }: Props) {
    const [search, setSearch] = useState(filters.search || "");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // 1. AUTO-SEARCH
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                route("signatories.index"),
                { search },
                { preserveState: true, replace: true },
            );
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // 2. FORM
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        errors,
        processing,
    } = useForm({
        name: "",
        position: "Punong Bayan",
        is_active: true,
    });

    const openModal = (signatory?: Signatory) => {
        if (signatory) {
            setEditingId(signatory.id);
            setData({
                name: signatory.name,
                position: signatory.position,
                is_active: signatory.is_active,
            });
        } else {
            setEditingId(null);
            reset();
            setData("position", "Punong Bayan"); // Reset default
        }
        setIsModalOpen(true);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        };

        if (editingId) {
            put(route("signatories.update", editingId), options);
        } else {
            post(route("signatories.store"), options);
        }
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this official?")) {
            destroy(route("signatories.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Manage Signatories
                </h2>
            }
        >
            <Head title="Signatories" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* TOOLBAR */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        {/* SEARCH */}
                        <div className="relative w-full sm:w-auto">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500">
                                <Icon icon="iconamoon:search-bold" width="20" />
                            </div>
                            <TextInput
                                className="pl-12 w-full sm:w-80 py-3 text-base"
                                placeholder="Search official..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* ADD BUTTON */}
                        <button
                            onClick={() => openModal()}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 shadow-md transition-transform hover:scale-105 w-full sm:w-auto justify-center"
                        >
                            <Icon icon="solar:add-circle-bold" width="24" />
                            Add Official
                        </button>
                    </div>

                    {/* TABLE */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Position</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {signatories && signatories.length > 0 ? (
                                    signatories.map((sig) => (
                                        <tr
                                            key={sig.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 font-bold text-gray-900 uppercase text-base">
                                                {sig.name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {sig.position}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${sig.is_active ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}
                                                >
                                                    {sig.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-4">
                                                    <button
                                                        onClick={() =>
                                                            openModal(sig)
                                                        }
                                                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1 font-bold hover:cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <Icon
                                                            icon="solar:pen-new-square-bold"
                                                            width="20"
                                                        />{" "}
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(sig.id)
                                                        }
                                                        className="text-red-600 hover:text-red-900 flex items-center gap-1 font-bold hover:cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <Icon
                                                            icon="solar:trash-bin-trash-bold"
                                                            width="20"
                                                        />{" "}
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-8 text-center text-gray-400"
                                        >
                                            No officials found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- MODAL FORM --- */}
            <Modal
                show={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                maxWidth="lg"
            >
                <div className="bg-white rounded-lg shadow-xl relative z-50 overflow-visible flex flex-col">
                    {/* 1. HEADER */}
                    <div className="bg-gray-800 px-6 py-4 flex justify-between items-center shrink-0 rounded-t-lg">
                        <h3 className="text-white font-bold uppercase tracking-wider text-lg flex items-center gap-2">
                            <Icon icon="solar:user-id-bold" />
                            {editingId ? "Edit Official" : "Add New Official"}
                        </h3>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <Icon icon="solar:close-circle-bold" width="28" />
                        </button>
                    </div>

                    {/* 2. BODY */}
                    <div className="p-6 bg-gray-50">
                        <form id="signatory-form" onSubmit={submit}>
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Position{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                        <Icon
                                            icon="solar:badge-bold"
                                            width="20"
                                        />
                                    </div>
                                    <select
                                        value={data.position}
                                        onChange={(e) =>
                                            setData("position", e.target.value)
                                        }
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10 py-3"
                                    >
                                        <option value="Punong Bayan">
                                            Punong Bayan
                                        </option>
                                        <option value="Authorized Official">
                                            Authorized Official
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <InputGroup
                                label="Name"
                                value={data.name}
                                onChange={(e) =>
                                    setData(
                                        "name",
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                error={errors.name}
                                placeholder="HON. JUANA DELA CRUZ"
                                icon="solar:user-bold"
                                required
                            />

                            {editingId && (
                                <div className="mt-4 p-3 bg-white border border-gray-200 rounded-md flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        checked={data.is_active}
                                        onChange={(e) =>
                                            setData(
                                                "is_active",
                                                e.target.checked,
                                            )
                                        }
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 w-5 h-5"
                                    />
                                    <label
                                        htmlFor="active"
                                        className="text-sm font-medium text-gray-700 select-none cursor-pointer"
                                    >
                                        Set as Active (Visible in Forms)
                                    </label>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* 3. FOOTER */}
                    <div className="bg-white border-t px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                        <SecondaryButton onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </SecondaryButton>

                        <PrimaryButton
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={processing}
                            onClick={() => {
                                (
                                    document.getElementById(
                                        "signatory-form",
                                    ) as HTMLFormElement
                                )?.requestSubmit();
                            }}
                        >
                            <Icon icon="solar:diskette-bold" className="mr-2" />
                            Save Official
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
