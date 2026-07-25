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
            validity_years: 3,
            validity_months: 0,
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
                validity_years: event.validity_years ?? 3,
                validity_months: event.validity_months ?? 0,
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

            <div className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <section>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100/50 border border-blue-200/50 p-2 rounded-lg text-blue-600 hidden sm:flex">
                                    <Icon
                                        icon="solar:calendar-star-bold-duotone"
                                        width="20"
                                    />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg text-slate-700 tracking-tight flex items-center gap-2">
                                        Events & Promos
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5 hidden sm:block">
                                        Manage free registration promos, and MTOP events.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => openModal()}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2 px-4 rounded-md flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center transition-colors"
                            >
                                <Icon icon="solar:add-circle-bold" width="20" />{" "}
                                Create Event
                            </button>
                        </div>

                        <div className="hidden md:block bg-slate-50 overflow-hidden shadow-sm rounded-lg border border-slate-200">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-500 border-collapse [&_th]:border [&_th]:border-slate-200 [&_td]:border [&_td]:border-slate-200">
                                    <thead className="text-[11px] text-slate-100 uppercase bg-slate-700 border-b border-slate-800">
                                        <tr>
                                            <th className="px-4 py-3 w-24 text-center">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-center">
                                                Event Details
                                            </th>
                                            <th className="px-4 py-3 text-center">
                                                Promo Duration
                                            </th>
                                            <th className="px-4 py-3 text-center">
                                                Fixed Expiry
                                            </th>
                                            <th className="px-4 py-3 text-center">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {events.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-4 py-6 text-center text-slate-400"
                                                >
                                                    No events found.
                                                </td>
                                            </tr>
                                        ) : (
                                            events.map((evt) => (
                                                <tr
                                                    key={evt.id}
                                                    className="bg-white even:bg-blue-50 hover:bg-slate-100 transition-colors"
                                                >
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleStatus(evt)}
                                                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 ${evt.is_active ? "bg-blue-500" : "bg-slate-300"}`}
                                                        >
                                                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${evt.is_active ? "translate-x-4" : "translate-x-0"}`} />
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="font-semibold text-slate-700 text-sm">
                                                            {evt.title}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                                            {evt.mandated_by}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-center">
                                                        <span className="font-medium text-slate-600">
                                                            {formatDate(evt.start_date)}
                                                        </span>{" "}
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase mx-1">
                                                            To
                                                        </span>{" "}
                                                        <span className="font-medium text-slate-600">
                                                            {formatDate(evt.end_date)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="bg-blue-100/50 text-blue-700 border border-blue-200/50 px-2 py-1 rounded font-bold text-[11px] uppercase tracking-wide">
                                                            {formatDate(evt.fixed_expiry_date)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={() => openModal(evt)}
                                                                className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors border border-blue-200 shadow-sm"
                                                            >
                                                                <Icon icon="solar:pen-new-square-bold" width="14" />{" "}
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => setDeletingId(evt.id)}
                                                                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors border border-red-200 shadow-sm"
                                                            >
                                                                <Icon icon="solar:trash-bin-trash-bold" width="14" />{" "}
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
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 border-t border-slate-200 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-100/50 border border-red-200/50 p-2 rounded-lg text-red-600 hidden sm:flex">
                                    <Icon
                                        icon="solar:calendar-mark-bold-duotone"
                                        width="20"
                                    />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg text-slate-700 tracking-tight flex items-center gap-2">
                                        Annual Holiday Setup
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5 hidden sm:block">
                                        Expiration dates landing on these dates will be pushed to the next working day.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => openHolidayModal()}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm py-2 px-4 rounded-md flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center transition-colors"
                            >
                                <Icon icon="solar:add-circle-bold" width="20" />{" "}
                                Add Holiday
                            </button>
                        </div>

                        <div className="bg-slate-50 overflow-hidden shadow-sm rounded-lg border border-slate-200">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-500 border-collapse [&_th]:border [&_th]:border-slate-200 [&_td]:border [&_td]:border-slate-200">
                                    <thead className="text-[11px] text-slate-100 uppercase bg-slate-700 border-b border-slate-800">
                                        <tr>
                                            <th className="px-4 py-3 text-center">
                                                Holiday Name
                                            </th>
                                            <th className="px-4 py-3 text-center">Date</th>

                                            <th className="px-4 py-3 text-center">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {holidays.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={3}
                                                    className="px-4 py-6 text-center text-slate-400"
                                                >
                                                    No holidays set.
                                                </td>
                                            </tr>
                                        ) : (
                                            holidays.map((hol) => (
                                                <tr
                                                    key={hol.id}
                                                    className="bg-white even:bg-blue-50 hover:bg-slate-100 transition-colors"
                                                >
                                                    <td className="px-4 py-3 font-semibold text-slate-700 text-sm text-center">
                                                        {hol.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="bg-red-100/50 text-red-700 border border-red-200/50 px-2 py-1 rounded font-bold text-[11px] uppercase tracking-wide">
                                                            {getMonthName(hol.month)}{" "}
                                                            {hol.day}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={() => openHolidayModal(hol)}
                                                                className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors border border-blue-200 shadow-sm"
                                                            >
                                                                <Icon icon="solar:pen-new-square-bold" width="14" />{" "}
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => setDeletingHolidayId(hol.id)}
                                                                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors border border-red-200 shadow-sm"
                                                            >
                                                                <Icon icon="solar:trash-bin-trash-bold" width="14" />{" "}
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
                <div className="bg-slate-50 rounded-none sm:rounded-lg h-full flex flex-col">
                    <div className="flex justify-between items-center bg-slate-700 px-5 py-3 rounded-none sm:rounded-t-lg border-b border-slate-800">
                        <h3 className="text-white font-bold text-base flex items-center gap-2">
                            <Icon icon="solar:calendar-add-bold" width="20" className="text-blue-400" />
                            {editingEvent ? "Edit Event" : "Add New Event"}
                        </h3>
                    </div>
                    <div className="p-5">
                        <form
                            id="event-form"
                            onSubmit={submit}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                    Event Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e: any) => setData("title", e.target.value)}
                                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors placeholder:text-slate-400"
                                    placeholder="e.g. Free Registration Promo"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                        Start Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e: any) => setData("start_date", e.target.value)}
                                        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                        End Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e: any) => setData("end_date", e.target.value)}
                                        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                        Forced Expiry Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="fixed_expiry_date"
                                        type="date"
                                        value={data.fixed_expiry_date}
                                        onChange={(e: any) => setData("fixed_expiry_date", e.target.value)}
                                        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                        Mandated By <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="mandated_by"
                                        type="text"
                                        value={data.mandated_by}
                                        onChange={(e: any) => setData("mandated_by", e.target.value)}
                                        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors placeholder:text-slate-400"
                                        placeholder="e.g. Mayor's Office"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                        Validity (Years)
                                    </label>
                                    <input
                                        id="validity_years"
                                        type="number"
                                        value={data.validity_years}
                                        onChange={(e: any) => setData("validity_years", e.target.value)}
                                        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors placeholder:text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                        Validity (Months)
                                    </label>
                                    <input
                                        id="validity_months"
                                        type="number"
                                        value={data.validity_months}
                                        onChange={(e: any) => setData("validity_months", e.target.value)}
                                        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                    Description (Optional)
                                </label>
                                <textarea
                                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors placeholder:text-slate-400"
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) => setData("description", e.target.value)}
                                    placeholder="Brief description about the event..."
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-5 border-t border-slate-200 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded text-sm font-bold hover:bg-slate-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!isFormValid || processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {editingEvent ? "Save Changes" : "Create Event"}
                                </button>
                            </div>
                        </form>
                    </div>
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
                <div className="bg-slate-50 rounded-none sm:rounded-lg">
                    <div className="flex justify-between items-center bg-slate-700 px-5 py-3 rounded-none sm:rounded-t-lg border-b border-slate-800">
                        <h3 className="text-white font-bold text-base flex items-center gap-2">
                            <Icon
                                icon="solar:calendar-mark-bold"
                                className="text-red-400"
                                width="20"
                            />
                            {editingHoliday
                                ? "Edit Annual Holiday"
                                : "Add Annual Holiday"}
                        </h3>
                    </div>
                    <div className="p-5">
                        <form onSubmit={submitHoliday} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                    Holiday Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="holiday_name"
                                    type="text"
                                    value={holidayData.name}
                                    onChange={(e: any) =>
                                        setHolidayData("name", e.target.value)
                                    }
                                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors placeholder:text-slate-400 font-semibold"
                                    placeholder="e.g. New Year's Day, Christmas"
                                    required
                                />
                            </div>
                            
                            <div className="bg-red-50/50 border border-red-100 rounded-md p-3">
                                <p className="text-xs text-red-600 font-medium flex items-start gap-1.5 leading-snug">
                                    <Icon icon="solar:info-circle-bold" width="14" className="mt-0.5 shrink-0" />
                                    This holiday automatically pushes validity expiration dates that land on this day to the next working day.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                        Month
                                    </label>
                                    <select
                                        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
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
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                        Day
                                    </label>
                                    <select
                                        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
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
                            <div className="flex justify-end gap-2 pt-5 mt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsHolidayModalOpen(false);
                                        resetHoliday();
                                        setEditingHoliday(null);
                                    }}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded text-sm font-bold hover:bg-slate-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!isHolidayValid || holidayProcessing}
                                    className="px-4 py-2 bg-red-600 text-white rounded text-sm font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {editingHoliday
                                        ? "Save Changes"
                                        : "Save Holiday"}
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
