//GeronaMTOP\resources\js\Pages\Signatories\Index.tsx
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { useState, useEffect, FormEventHandler, useRef } from "react";
import InputGroup from "@/Components/InputGroup";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import { Icon } from "@iconify/react";
import { Switch } from "@headlessui/react";
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal";

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
        position?: string;
    };
}

const POSITIONS = [
    "Punong Bayan",
    "Authorized Official",
    "Committee on Transportation",
];

const FILTER_TABS = ["All", ...POSITIONS];

export default function Index({ signatories = [], filters = {} }: Props) {
    const [search, setSearch] = useState(filters.search || "");
    const [positionFilter, setPositionFilter] = useState(
        filters.position || "All",
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const {
        data: importData,
        setData: setImportData,
        post: postImport,
        processing: importing,
        errors: importErrors,
        reset: resetImport,
    } = useForm({
        import_file: null as File | null,
    });

    const initialRender = useRef(true);

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route("signatories.index"),
                { search, position: positionFilter },
                { preserveState: true, replace: true },
            );
        }, 300);
        return () => clearTimeout(timer);
    }, [search, positionFilter]);

    const { data, setData, post, put, reset, errors, processing } = useForm({
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
                is_active: Boolean(signatory.is_active),
            });
        } else {
            setEditingId(null);
            reset();
            setData("position", "Punong Bayan");
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

    const submitImport = (e: React.FormEvent) => {
        e.preventDefault();
        postImport(route("signatories.import"), {
            onSuccess: () => {
                setIsImportModalOpen(false);
                resetImport();
            },
        });
    };

    const confirmDelete = (id: number) => setDeletingId(id);

    const handleDelete = () => {
        if (deletingId) {
            setIsDeleting(true);
            router.delete(route("signatories.destroy", deletingId), {
                onFinish: () => {
                    setDeletingId(null);
                    setIsDeleting(false);
                },
            });
        }
    };

    const getStatusBadge = (isActive: boolean) => (
        <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}
        >
            {isActive ? "Active" : "Inactive"}
        </span>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Signatories" />

            <div className="py-6 sm:py-12 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                            <div className="relative w-full sm:w-64 md:w-80">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500">
                                    <Icon
                                        icon="iconamoon:search-bold"
                                        width="20"
                                    />
                                </div>
                                <TextInput
                                    className="pl-12 w-full py-3 text-base shadow-sm"
                                    placeholder="Search official..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="relative w-full sm:w-60">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-indigo-500 z-10"></div>
                                <select
                                    value={positionFilter}
                                    onChange={(e) =>
                                        setPositionFilter(e.target.value)
                                    }
                                    className="block w-full pl-5 pr-10 py-3 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm text-base bg-white transition-colors cursor-pointer appearance-none text-gray-700"
                                >
                                    {FILTER_TABS.map((tab) => (
                                        <option key={tab} value={tab}>
                                            {tab === "All"
                                                ? "All Positions"
                                                : tab}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-600">
                                    <Icon
                                        icon="solar:alt-arrow-down-linear"
                                        width="20"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                            <button
                                onClick={() => setIsImportModalOpen(true)}
                                className="bg-orange-600 hover:bg-orange-700 text-white  border font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all flex-1 sm:flex-none hover:cursor-pointer"
                                title="Import from CSV"
                            >
                                <Icon icon="solar:import-bold" width="22" />
                                <span className="hidden sm:inline">Import</span>
                            </button>

                            <a
                                href={route("signatories.export")}
                                className="bg-green-600 hover:bg-green-700 text-white  border font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all flex-1 sm:flex-none"
                                title="Export to CSV"
                            >
                                <Icon
                                    icon="solar:file-download-bold"
                                    width="22"
                                />
                                <span className="hidden sm:inline">Export</span>
                            </a>
                            <button
                                onClick={() => openModal()}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 shadow-md transition-transform hover:scale-105 flex-1 sm:flex-none justify-center"
                            >
                                <Icon icon="solar:add-circle-bold" width="24" />
                                <span className="whitespace-nowrap">
                                    Add Official
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {signatories.length === 0 ? (
                            <div className="bg-white p-8 text-center rounded-lg border border-gray-200 text-gray-400 shadow-sm">
                                No officials found in this category.
                            </div>
                        ) : (
                            signatories.map((sig) => (
                                <div
                                    key={sig.id}
                                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm transition-all flex flex-col"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-xs font-bold text-indigo-600 uppercase">
                                                {sig.position}
                                            </span>
                                            <h3 className="font-bold text-gray-900 text-lg uppercase leading-tight">
                                                {sig.name}
                                            </h3>
                                        </div>
                                        {getStatusBadge(sig.is_active)}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => openModal(sig)}
                                            className="flex-1 flex justify-center items-center gap-1.5 bg-blue-50 text-blue-700 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-100 transition-colors"
                                        >
                                            <Icon
                                                icon="solar:pen-new-square-bold"
                                                width="16"
                                            />{" "}
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                confirmDelete(sig.id)
                                            }
                                            className="flex-1 flex justify-center items-center gap-1.5 bg-red-50 text-red-600 py-2.5 rounded-lg font-bold text-sm hover:bg-red-100 transition-colors"
                                        >
                                            <Icon
                                                icon="solar:trash-bin-trash-bold"
                                                width="16"
                                            />{" "}
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
                                    <th className="px-6 py-4">Position</th>
                                    <th className="px-6 py-4 text-center">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {signatories.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-8 text-center text-gray-400"
                                        >
                                            No officials found in this category.
                                        </td>
                                    </tr>
                                ) : (
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
                                            <td className="px-6 py-4 text-center">
                                                {getStatusBadge(sig.is_active)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-3">
                                                    <button
                                                        onClick={() =>
                                                            openModal(sig)
                                                        }
                                                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 rounded-md px-3 py-1.5 flex items-center gap-1 font-bold hover:cursor-pointer transition-colors"
                                                    >
                                                        <Icon
                                                            icon="solar:pen-new-square-bold"
                                                            width="18"
                                                        />{" "}
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            confirmDelete(
                                                                sig.id,
                                                            )
                                                        }
                                                        className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md px-3 py-1.5 flex items-center gap-1 font-bold hover:cursor-pointer transition-colors"
                                                    >
                                                        <Icon
                                                            icon="solar:trash-bin-trash-bold"
                                                            width="18"
                                                        />{" "}
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
            </div>

            <Modal
                show={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                maxWidth="lg"
            >
                <div className="flex flex-col h-full sm:h-auto">
                    <div className="bg-gray-800 px-6 py-4 flex justify-between items-center shrink-0 sm:rounded-t-lg">
                        <h3 className="text-white font-bold uppercase tracking-wider text-lg flex items-center gap-2">
                            <Icon icon="solar:user-id-bold" width="24" />
                            {editingId ? "Edit Official" : "Add New Official"}
                        </h3>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="text-gray-400 hover:text-white transition-colors p-2"
                        >
                            <Icon icon="solar:close-circle-bold" width="28" />
                        </button>
                    </div>

                    <div className="p-6 bg-gray-50 overflow-y-auto flex-1">
                        <form id="signatory-form" onSubmit={submit}>
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Position{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 z-10">
                                        <Icon
                                            icon="solar:diploma-verified-bold"
                                            width="20"
                                        />
                                    </div>
                                    <select
                                        value={data.position}
                                        onChange={(e) =>
                                            setData("position", e.target.value)
                                        }
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10 pr-10 py-3 relative z-0 appearance-none bg-white cursor-pointer"
                                    >
                                        {POSITIONS.map((pos) => (
                                            <option key={pos} value={pos}>
                                                {pos}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                        <Icon
                                            icon="solar:alt-arrow-down-bold"
                                            width="20"
                                        />
                                    </div>
                                </div>
                            </div>

                            <InputGroup
                                id="name"
                                label="Name"
                                value={data.name}
                                onChange={(e) =>
                                    setData(
                                        "name",
                                        e.target.value
                                            .toUpperCase()
                                            .replace(/[^A-Z\s.,-]/g, ""),
                                    )
                                }
                                error={errors.name}
                                placeholder="HON. JUANA DELA CRUZ"
                                icon="solar:user-bold"
                                required
                            />

                            {editingId && (
                                <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg flex items-center justify-between shadow-sm">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-800">
                                            Official Status
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {data.is_active
                                                ? "This official is visible in forms."
                                                : "This official is hidden."}
                                        </span>
                                    </div>
                                    <Switch
                                        checked={data.is_active}
                                        onChange={(checked: boolean) =>
                                            setData("is_active", checked)
                                        }
                                        className={`${data.is_active ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                    >
                                        <span className="sr-only">
                                            Toggle Status
                                        </span>
                                        <span
                                            className={`${data.is_active ? "translate-x-6" : "translate-x-1"} inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ease-in-out`}
                                        />
                                    </Switch>
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="bg-white border-t px-6 py-4 flex justify-end gap-3 shrink-0 sm:rounded-b-lg pb-safe">
                        <SecondaryButton
                            onClick={() => setIsModalOpen(false)}
                            className="justify-center flex-1 sm:flex-none"
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            className="bg-blue-600 hover:bg-blue-700 justify-center flex-1 sm:flex-none shadow-md"
                            disabled={processing}
                            onClick={() => {
                                (
                                    document.getElementById(
                                        "signatory-form",
                                    ) as HTMLFormElement
                                )?.requestSubmit();
                            }}
                        >
                            <Icon
                                icon="solar:diskette-bold"
                                className="mr-2"
                                width="20"
                            />{" "}
                            Save Official
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            <Modal
                show={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                maxWidth="md"
            >
                <div className="bg-gray-800 px-6 py-4 rounded-t-lg flex justify-between items-center">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Icon icon="solar:import-bold" width="20" /> Import
                        Signatories CSV
                    </h3>
                    <button
                        onClick={() => setIsImportModalOpen(false)}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <Icon icon="solar:close-circle-bold" width="24" />
                    </button>
                </div>
                <div className="p-6 bg-gray-50">
                    <form onSubmit={submitImport} className="space-y-4">
                        <div className="bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-lg text-sm">
                            Upload a <strong>.csv</strong> file exported from
                            this system. The system will cleanly sync the data
                            based on the official's name to update records
                            without duplicating them!
                        </div>
                        <div>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={(e) =>
                                    setImportData(
                                        "import_file",
                                        e.target.files?.[0] || null,
                                    )
                                }
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer border border-gray-300 rounded-lg bg-white shadow-sm"
                                required
                            />
                            <InputError
                                message={importErrors.import_file}
                                className="mt-2"
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                            <SecondaryButton
                                onClick={() => setIsImportModalOpen(false)}
                            >
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton
                                disabled={importing || !importData.import_file}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                {importing ? "Importing..." : "Run Import"}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <ConfirmDeleteModal
                show={deletingId !== null}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDelete}
                title="Delete Official?"
                message="Are you sure you want to delete this official? They will no longer appear in new forms."
                processing={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
