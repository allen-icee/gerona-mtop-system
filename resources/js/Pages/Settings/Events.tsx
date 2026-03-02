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

const MONTHS = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];

export default function Events({
    events,
    holidays = [],
}: {
    events: any[];
    holidays?: any[];
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState<any>(null);
    const [deletingHolidayId, setDeletingHolidayId] = useState<number | null>(
        null,
    );

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

    const {
        data: holidayData,
        setData: setHolidayData,
        post: postHoliday,
        put: putHoliday,
        reset: resetHoliday,
        processing: holidayProcessing,
    } = useForm({
        name: "",
        month: 1,
        day: 1,
    });

    const isFormValid =
        data.title.trim() !== "" &&
        data.start_date !== "" &&
        data.end_date !== "" &&
        data.fixed_expiry_date !== "" &&
        data.mandated_by.trim() !== "";
    const isHolidayValid = holidayData.name.trim() !== "";

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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                toast.success(
                    editingEvent ? "Event updated!" : "Event created!",
                );
            },
        };
        if (editingEvent) put(route("events.update", editingEvent.id), options);
        else post(route("events.store"), options);
    };

    const handleDelete = () => {
        if (deletingId) {
            setIsDeleting(true);
            router.delete(route("events.destroy", deletingId), {
                preserveScroll: true,
                onFinish: () => {
                    setDeletingId(null);
                    setIsDeleting(false);
                    toast.success("Event deleted!");
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

    const openHolidayModal = (holiday: any = null) => {
        if (holiday) {
            setEditingHoliday(holiday);
            setHolidayData({
                name: holiday.name,
                month: holiday.month,
                day: holiday.day,
            });
        } else {
            setEditingHoliday(null);
            resetHoliday();
        }
        setIsHolidayModalOpen(true);
    };

    const submitHoliday: FormEventHandler = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setIsHolidayModalOpen(false);
                resetHoliday();
                toast.success(
                    editingHoliday ? "Holiday updated!" : "Holiday added!",
                );
            },
        };

        if (editingHoliday) {
            putHoliday(route("holidays.update", editingHoliday.id), options);
        } else {
            postHoliday(route("holidays.store"), options);
        }
    };

    const handleHolidayDelete = () => {
        if (deletingHolidayId) {
            setIsDeleting(true);
            router.delete(route("holidays.destroy", deletingHolidayId), {
                preserveScroll: true,
                onFinish: () => {
                    setDeletingHolidayId(null);
                    setIsDeleting(false);
                    toast.success("Holiday removed!");
                },
            });
        }
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    const getMonthName = (m: number) =>
        MONTHS.find((month) => month.value === m)?.label;

    return (
        <AuthenticatedLayout>
            <Head title="Events & Holidays" />

            <div className="py-6 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                    <section>
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
                                        Manage free registration promos, and
                                        MTOP events.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => openModal()}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 shadow-md w-full sm:w-auto justify-center transition-transform hover:scale-105"
                            >
                                <Icon icon="solar:add-circle-bold" width="24" />{" "}
                                Create New Event
                            </button>
                        </div>

                        <div className="hidden md:block bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
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
                                                    className="bg-white border-b hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                toggleStatus(
                                                                    evt,
                                                                )
                                                            }
                                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${evt.is_active ? "bg-blue-500" : "bg-gray-300"}`}
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
                                                        <span className="font-semibold text-gray-700">
                                                            {formatDate(
                                                                evt.start_date,
                                                            )}
                                                        </span>{" "}
                                                        <span className="text-xs text-gray-400 font-bold uppercase mx-1">
                                                            To
                                                        </span>{" "}
                                                        <span className="font-semibold text-gray-700">
                                                            {formatDate(
                                                                evt.end_date,
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wide">
                                                            {formatDate(
                                                                evt.fixed_expiry_date,
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center flex justify-center gap-3">
                                                        <div className="flex justify-center gap-3">
                                                            <button
                                                                onClick={() =>
                                                                    openModal(
                                                                        evt,
                                                                    )
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
                                                                    setDeletingId(
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
                    </section>

                    <section>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-t border-gray-200 pt-8">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-100 p-2 rounded-lg text-red-600 shadow-inner hidden sm:flex">
                                    <Icon
                                        icon="solar:calendar-mark-bold-duotone"
                                        width="24"
                                    />
                                </div>
                                <div>
                                    <h2 className="font-extrabold text-lg sm:text-xl text-gray-800 tracking-tight flex items-center gap-2">
                                        Annual Holiday Setup
                                    </h2>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5 hidden sm:block">
                                        Expiration dates landing on these dates
                                        will be pushed to the next working day.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => openHolidayModal()}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 shadow-md w-full sm:w-auto justify-center transition-transform hover:scale-105"
                            >
                                <Icon icon="solar:add-circle-bold" width="24" />{" "}
                                Add Holiday
                            </button>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4">
                                                Holiday Name
                                            </th>
                                            <th className="px-6 py-4">Date</th>

                                            <th className="px-6 py-4 text-center">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {holidays.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={3}
                                                    className="px-6 py-8 text-center text-gray-400"
                                                >
                                                    No holidays set.
                                                </td>
                                            </tr>
                                        ) : (
                                            holidays.map((hol) => (
                                                <tr
                                                    key={hol.id}
                                                    className="bg-white border-b hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 font-bold text-gray-800">
                                                        {hol.name}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wide">
                                                            {getMonthName(
                                                                hol.month,
                                                            )}{" "}
                                                            {hol.day}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center flex justify-center gap-3">
                                                        <div className="flex justify-center gap-3">
                                                            <button
                                                                onClick={() =>
                                                                    openHolidayModal(
                                                                        hol,
                                                                    )
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
                                                                    setDeletingHolidayId(
                                                                        hol.id,
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
                    </section>
                </div>
            </div>

            <Modal
                show={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    reset();
                }}
                maxWidth="xl"
            >
                <div className="p-6">
                    <h3 className="text-lg font-bold mb-4">
                        {editingEvent ? "Edit Event" : "Add New Event"}
                    </h3>
                    <form
                        id="event-form"
                        onSubmit={submit}
                        className="space-y-4"
                    >
                        <InputGroup
                            id="title"
                            label="Event Title"
                            name="title"
                            value={data.title}
                            onChange={(e: any) =>
                                setData("title", e.target.value)
                            }
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup
                                id="start_date"
                                label="Start Date"
                                type="date"
                                value={data.start_date}
                                onChange={(e: any) =>
                                    setData("start_date", e.target.value)
                                }
                                required
                            />
                            <InputGroup
                                id="end_date"
                                label="End Date"
                                type="date"
                                value={data.end_date}
                                onChange={(e: any) =>
                                    setData("end_date", e.target.value)
                                }
                                required
                            />
                        </div>
                        <InputGroup
                            id="fixed_expiry_date"
                            label="Forced Expiry Date"
                            type="date"
                            value={data.fixed_expiry_date}
                            onChange={(e: any) =>
                                setData("fixed_expiry_date", e.target.value)
                            }
                            required
                        />
                        <InputGroup
                            id="mandated_by"
                            label="Mandated By"
                            value={data.mandated_by}
                            onChange={(e: any) =>
                                setData("mandated_by", e.target.value)
                            }
                            required
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description (Optional)
                            </label>
                            <textarea
                                className="w-full rounded-md border-gray-300"
                                rows={3}
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <SecondaryButton
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton
                                disabled={!isFormValid || processing}
                            >
                                {editingEvent ? "Save Changes" : "Create Event"}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal
                show={isHolidayModalOpen}
                onClose={() => {
                    setIsHolidayModalOpen(false);
                    resetHoliday();
                    setEditingHoliday(null);
                }}
                maxWidth="sm"
            >
                <div className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Icon
                            icon="solar:calendar-mark-bold"
                            className="text-red-500"
                            width="24"
                        />
                        {editingHoliday
                            ? "Edit Annual Holiday"
                            : "Add Annual Holiday"}
                    </h3>
                    <form onSubmit={submitHoliday} className="space-y-4">
                        <InputGroup
                            id="holiday_name"
                            label="Holiday Name"
                            value={holidayData.name}
                            onChange={(e: any) =>
                                setHolidayData("name", e.target.value)
                            }
                            placeholder="e.g. New Year's Day"
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Month
                                </label>
                                <select
                                    className="w-full rounded-md border-gray-300 h-12 pl-2 shadow-sm focus:border-red-500 focus:ring-red-500"
                                    value={holidayData.month}
                                    onChange={(e) =>
                                        setHolidayData(
                                            "month",
                                            Number(e.target.value),
                                        )
                                    }
                                >
                                    {MONTHS.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Day
                                </label>
                                <select
                                    className="w-full rounded-md border-gray-300 h-12 pl-2 shadow-sm focus:border-red-500 focus:ring-red-500"
                                    value={holidayData.day}
                                    onChange={(e) =>
                                        setHolidayData(
                                            "day",
                                            Number(e.target.value),
                                        )
                                    }
                                >
                                    {Array.from(
                                        { length: 31 },
                                        (_, i) => i + 1,
                                    ).map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <SecondaryButton
                                type="button"
                                onClick={() => {
                                    setIsHolidayModalOpen(false);
                                    resetHoliday();
                                    setEditingHoliday(null);
                                }}
                            >
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton
                                className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                                disabled={!isHolidayValid || holidayProcessing}
                            >
                                {editingHoliday
                                    ? "Save Changes"
                                    : "Save Holiday"}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <ConfirmDeleteModal
                show={deletingId !== null}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDelete}
                title="Delete Event?"
                message="Are you sure you want to completely remove this event?"
                processing={isDeleting}
            />
            <ConfirmDeleteModal
                show={deletingHolidayId !== null}
                onClose={() => setDeletingHolidayId(null)}
                onConfirm={handleHolidayDelete}
                title="Remove Holiday?"
                message="Are you sure you want to remove this holiday? It will no longer push validity dates forward."
                processing={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
