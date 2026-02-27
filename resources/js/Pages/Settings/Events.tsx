import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router } from "@inertiajs/react";
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";
import InputGroup from "@/Components/InputGroup";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import DangerButton from "@/Components/DangerButton";
import toast from "react-hot-toast";

export default function Events({ events }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
    } = useForm({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        fixed_expiry_date: "",
        mandated_by: "",
        is_active: true,
    });

    const openModal = (event: any = null) => {
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

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingEvent) {
            put(route("events.update", editingEvent.id), {
                onSuccess: () => {
                    toast.success("Event updated successfully");
                    setIsModalOpen(false);
                },
            });
        } else {
            post(route("events.store"), {
                onSuccess: () => {
                    toast.success("Event created successfully");
                    setIsModalOpen(false);
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (
            confirm(
                "Are you sure you want to delete this event? This cannot be undone.",
            )
        ) {
            destroy(route("events.destroy", id), {
                onSuccess: () => toast.success("Event deleted!"),
            });
        }
    };

    const toggleStatus = (event: any) => {
        // We use the global router here so we can pass custom data
        // without affecting the modal's useForm state.
        router.put(
            route("events.update", event.id),
            {
                ...event,
                is_active: !event.is_active,
            },
            {
                onSuccess: () =>
                    toast.success(
                        `Event ${!event.is_active ? "Activated" : "Deactivated"}`,
                    ),
            },
        );
    };
    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-bold text-xl text-gray-800 leading-tight">
                    Events & Promos
                </h2>
            }
        >
            <Head title="Events Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-black text-gray-800">
                                Registration Events
                            </h3>
                            <p className="text-sm text-gray-500">
                                Manage free registration promos and amnesties.
                            </p>
                        </div>
                        <PrimaryButton
                            onClick={() => openModal()}
                            className="flex items-center gap-2"
                        >
                            <Icon icon="solar:add-circle-bold" width="20" />{" "}
                            Create New Event
                        </PrimaryButton>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider border-b-2 border-gray-200">
                                        <th className="p-4 font-bold">
                                            Status
                                        </th>
                                        <th className="p-4 font-bold">
                                            Event Details
                                        </th>
                                        <th className="p-4 font-bold">
                                            Duration
                                        </th>
                                        <th className="p-4 font-bold">
                                            Permit Expiry
                                        </th>
                                        <th className="p-4 font-bold text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="p-8 text-center text-gray-500 font-medium"
                                            >
                                                No events found. Click "Create
                                                New Event" to add one.
                                            </td>
                                        </tr>
                                    ) : (
                                        events.map((evt: any) => (
                                            <tr
                                                key={evt.id}
                                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="p-4">
                                                    <button
                                                        onClick={() =>
                                                            toggleStatus(evt)
                                                        }
                                                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${evt.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                                    >
                                                        {evt.is_active
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </button>
                                                </td>
                                                <td className="p-4">
                                                    <p className="font-bold text-gray-800">
                                                        {evt.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {evt.mandated_by}
                                                    </p>
                                                </td>
                                                <td className="p-4 text-sm font-medium">
                                                    {new Date(
                                                        evt.start_date,
                                                    ).toLocaleDateString()}{" "}
                                                    <br />
                                                    <span className="text-gray-400">
                                                        to
                                                    </span>{" "}
                                                    {new Date(
                                                        evt.end_date,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="p-4">
                                                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded font-bold text-sm">
                                                        {new Date(
                                                            evt.fixed_expiry_date,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right space-x-2">
                                                    <button
                                                        onClick={() =>
                                                            openModal(evt)
                                                        }
                                                        className="text-blue-600 hover:text-blue-800 font-bold text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(evt.id)
                                                        }
                                                        className="text-red-600 hover:text-red-800 font-bold text-sm"
                                                    >
                                                        Delete
                                                    </button>
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

            <Modal
                show={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                maxWidth="2xl"
            >
                <form onSubmit={submit} className="p-6 space-y-6">
                    <h2 className="text-lg font-bold text-gray-900 border-b pb-2">
                        {editingEvent ? "Edit Event" : "Create New Event"}
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        <InputGroup
                            id="title"
                            label="Event Title"
                            name="title"
                            value={data.title}
                            onChange={(e: any) =>
                                setData("title", e.target.value)
                            }
                            error={errors.title}
                            required
                        />
                        <InputGroup
                            id="description"
                            label="Short Description (Optional)"
                            name="description"
                            value={data.description}
                            onChange={(e: any) =>
                                setData("description", e.target.value)
                            }
                            error={errors.description}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup
                                id="start_date"
                                label="Start Date"
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
                                label="End Date"
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
                            label="Forced Expiry Date for Applications"
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
                            label="Mandated By (e.g. Sangguniang Bayan Res No. 15-2026)"
                            name="mandated_by"
                            value={data.mandated_by}
                            onChange={(e: any) =>
                                setData("mandated_by", e.target.value)
                            }
                            error={errors.mandated_by}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 border-t pt-4">
                        <SecondaryButton onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing ? "Saving..." : "Save Event"}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
