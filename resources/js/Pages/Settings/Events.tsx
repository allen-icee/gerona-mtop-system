//GeronaMTOP\resources\js\Pages\Settings\Events.tsx
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router } from "@inertiajs/react";
import React, { useState, FormEventHandler } from "react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";
import InputGroup from "@/Components/InputGroup";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal";
import toast from "react-hot-toast";

export default function Events({ events }: { events: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            title: "",
            description: "",
            start_date: "",
            end_date: "",
            fixed_expiry_date: "",
            mandated_by: "",
            is_active: true,
        });

    const isFormValid =
        data.title.trim() !== "" &&
        data.start_date !== "" &&
        data.end_date !== "" &&
        data.fixed_expiry_date !== "" &&
        data.mandated_by.trim() !== "";

    const openModal = (event: any = null) => {
        clearErrors();
        if (event) {
            setEditingEvent(event);
            setData({
                title: event.title,
                description: event.description || "",
                start_date: event.start_date,
                end_date: event.end_date,
                fixed_expiry_date: event.fixed_expiry_date,
                mandated_by: event.mandated_by || "",
                is_active: !!event.is_active,
            });
        } else {
            setEditingEvent(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { onSuccess: () => closeModal() };

        if (editingEvent) {
            put(route("events.update", editingEvent.id), options);
        } else {
            post(route("events.store"), options);
        }
    };

    const confirmDelete = (id: number) => {
        setDeletingId(id);
    };

    const handleDelete = () => {
        if (deletingId) {
            setIsDeleting(true);
            router.delete(route("events.destroy", deletingId), {
                preserveScroll: true,
                onFinish: () => {
                    setDeletingId(null);
                    setIsDeleting(false);
                },
            });
        }
    };

    const toggleStatus = (event: any) => {
        router.put(
            route("events.update", event.id),
            { ...event, is_active: !event.is_active },
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(
                        `Event ${!event.is_active ? "Activated" : "Deactivated"}`,
                    ),
            },
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Events Management" />

            <div className="py-6 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shadow-inner hidden sm:flex">
                                <Icon
                                    icon="solar:calendar-star-bold-duotone"
                                    width="24"
                                />
                            </div>
                            <div>
                                <h2 className="font-extrabold text-lg sm:text-xl text-gray-800 tracking-tight flex items-center gap-2">
                                    Events & Promos
                                </h2>
                                <p className="text-xs text-gray-500 font-medium mt-0.5 hidden sm:block">
                                    Manage free registration promos, and MTOP
                                    events.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => openModal()}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 shadow-md w-full sm:w-auto justify-center transition-transform hover:scale-105"
                        >
                            <Icon icon="solar:add-circle-bold" width="24" />
                            Create New Event
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:hidden mb-6">
                        {events.length === 0 ? (
                            <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                                No events found. Click "Create New Event" to add
                                one.
                            </div>
                        ) : (
                            events.map((evt) => (
                                <div
                                    key={evt.id}
                                    className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-4"
                                >
                                    <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">
                                                {evt.title}
                                            </h3>
                                            <div className="flex items-center text-gray-500 text-sm mt-1 gap-1">
                                                <Icon
                                                    icon="solar:document-add-bold"
                                                    width="16"
                                                />
                                                {evt.mandated_by}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleStatus(evt)
                                                }
                                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${evt.is_active ? "bg-blue-500" : "bg-gray-300"}`}
                                            >
                                                <span
                                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${evt.is_active ? "translate-x-5" : "translate-x-0"}`}
                                                />
                                            </button>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                                {evt.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-gray-50 p-2 rounded-md">
                                            <span className="block text-[10px] uppercase text-gray-400 font-bold mb-0.5">
                                                Duration
                                            </span>
                                            <span className="font-semibold text-gray-700">
                                                {formatDate(evt.start_date)} -{" "}
                                                {formatDate(evt.end_date)}
                                            </span>
                                        </div>
                                        <div className="bg-blue-50 p-2 rounded-md">
                                            <span className="block text-[10px] uppercase text-blue-400 font-bold mb-0.5">
                                                Permit Expiry
                                            </span>
                                            <span className="font-semibold text-blue-700">
                                                {formatDate(
                                                    evt.fixed_expiry_date,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-4 flex gap-3">
                                        <button
                                            onClick={() => openModal(evt)}
                                            className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                                        >
                                            <Icon
                                                icon="solar:pen-new-square-bold"
                                                width="18"
                                            />{" "}
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                confirmDelete(evt.id)
                                            }
                                            className="flex-1 bg-red-50 text-red-600 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                                        >
                                            <Icon
                                                icon="solar:trash-bin-trash-bold"
                                                width="18"
                                            />{" "}
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Desktop View (Table) */}
                    <div className="hidden md:block bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100 mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 w-24 text-center">
                                            Status
                                        </th>
                                        <th className="px-6 py-4">
                                            Event Details
                                        </th>
                                        <th className="px-6 py-4">
                                            Promo Duration
                                        </th>
                                        <th className="px-6 py-4">
                                            Fixed Expiry
                                        </th>
                                        <th className="px-6 py-4 text-center">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-8 text-center text-gray-400"
                                            >
                                                No events found.
                                            </td>
                                        </tr>
                                    ) : (
                                        events.map((evt) => (
                                            <tr
                                                key={evt.id}
                                                className="bg-white border-b hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleStatus(evt)
                                                        }
                                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${evt.is_active ? "bg-blue-500" : "bg-gray-300"}`}
                                                        title={
                                                            evt.is_active
                                                                ? "Deactivate Event"
                                                                : "Activate Event"
                                                        }
                                                    >
                                                        <span
                                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${evt.is_active ? "translate-x-5" : "translate-x-0"}`}
                                                        />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-gray-800 text-base">
                                                        {evt.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {evt.mandated_by}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-700">
                                                            {formatDate(
                                                                evt.start_date,
                                                            )}
                                                        </span>
                                                        <span className="text-xs text-gray-400 font-bold uppercase">
                                                            To
                                                        </span>
                                                        <span className="font-semibold text-gray-700">
                                                            {formatDate(
                                                                evt.end_date,
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wide">
                                                        {formatDate(
                                                            evt.fixed_expiry_date,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-3">
                                                        <button
                                                            onClick={() =>
                                                                openModal(evt)
                                                            }
                                                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
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
                                                                    evt.id,
                                                                )
                                                            }
                                                            className="bg-red-50 text-red-600 px-4 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
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
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="xl">
                <div className="flex justify-between items-center bg-gray-800 px-6 py-4 rounded-t-lg">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Icon
                            icon={
                                editingEvent
                                    ? "solar:pen-new-square-bold"
                                    : "solar:calendar-star-bold"
                            }
                            width="24"
                        />
                        {editingEvent ? "Edit Event" : "Add New Event"}
                    </h3>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <Icon icon="solar:close-circle-bold" width="28" />
                    </button>
                </div>

                <div className="p-6 bg-gray-50">
                    <form id="event-form" onSubmit={submit}>
                        <div className="grid grid-cols-1 gap-4 mb-4">
                            <InputGroup
                                id="title"
                                label="Event Title"
                                name="title"
                                value={data.title}
                                onChange={(e: any) =>
                                    setData("title", e.target.value)
                                }
                                error={errors.title}
                                placeholder="e.g. General Promo"
                                required
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputGroup
                                    id="start_date"
                                    label="Promo Start Date"
                                    name="start_date"
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e: any) =>
                                        setData("start_date", e.target.value)
                                    }
                                    error={errors.start_date}
                                    required
                                />
                                <InputGroup
                                    id="end_date"
                                    label="Promo End Date"
                                    name="end_date"
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e: any) =>
                                        setData("end_date", e.target.value)
                                    }
                                    error={errors.end_date}
                                    required
                                />
                            </div>

                            <InputGroup
                                id="fixed_expiry_date"
                                label="Forced Expiry Date"
                                name="fixed_expiry_date"
                                type="date"
                                value={data.fixed_expiry_date}
                                onChange={(e: any) =>
                                    setData("fixed_expiry_date", e.target.value)
                                }
                                error={errors.fixed_expiry_date}
                                required
                            />

                            <InputGroup
                                id="mandated_by"
                                label="Mandated By"
                                name="mandated_by"
                                value={data.mandated_by}
                                onChange={(e: any) =>
                                    setData("mandated_by", e.target.value)
                                }
                                error={errors.mandated_by}
                                placeholder="e.g. Sangguniang Bayan Res No. 15-2026"
                                required
                            />

                            <div>
                                <label className="block font-medium text-sm text-gray-700 mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm w-full font-medium text-gray-800"
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                    placeholder="Add any extra details about the event..."
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.description}
                                    </p>
                                )}
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
                                    "event-form",
                                ) as HTMLFormElement
                            )?.requestSubmit();
                        }}
                    >
                        <Icon
                            icon="solar:diskette-bold"
                            className="mr-2"
                            width="20"
                        />
                        {editingEvent ? "Save Changes" : "Create Event"}
                    </PrimaryButton>
                </div>
            </Modal>

            <ConfirmDeleteModal
                show={deletingId !== null}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDelete}
                title="Delete Event?"
                message="Are you sure you want to completely remove this event? Applications already processed under this event will keep their calculated expiry, but the event itself will be removed from the system."
                processing={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
