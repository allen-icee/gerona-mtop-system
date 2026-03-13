//GeronaMTOP/resources/js/Pages/Mtop/Partials/DropRecordModal.tsx
import React, { useEffect } from "react";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import SignatorySelect from "@/Components/SignatorySelect";
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";

interface Props {
    show: boolean;
    onClose: () => void;
    application: any | null;
    officials: { name: string; position: string }[];
    feeSettings: any;
}

export default function DropRecordModal({ show, onClose, application, officials, feeSettings }: Props) {
    const { data, setData, put, processing, reset, errors } = useForm({
        id: null as number | null,
        last_name: '',
        first_name: '',
        middle_name: '',
        address: '',
        make_type: '',
        engine_motor_no: '',
        chassis_no: '',
        plate_no: '',
        body_number: '',
        drop_date: new Date().toISOString().split('T')[0],
        drop_or_number: '',
        drop_or_date: new Date().toISOString().split('T')[0],
        drop_amount: '',
        drop_official: '',
        drop_position: ''
    });

    useEffect(() => {
        if (application && show) {
            const droppingOfficials = officials.filter(o => o.position.toLowerCase().includes('dropping'));
            const defaultOff = droppingOfficials.length > 0 ? droppingOfficials[0] : (officials.length > 0 ? officials[0] : null);

            const amountToUse = application.drop_amount
                ? Number(application.drop_amount).toFixed(2)
                : (feeSettings?.dropping_fee ? Number(feeSettings.dropping_fee).toFixed(2) : '100.00');

            setData({
                id: application.id,
                last_name: application.last_name || '',
                first_name: application.first_name || '',
                middle_name: application.middle_name || '',
                address: application.address || '',
                make_type: application.make_type || '',
                engine_motor_no: application.engine_motor_no || '',
                chassis_no: application.chassis_no || '',
                plate_no: application.plate_no || '',
                body_number: application.body_number || '',
                drop_date: application.drop_date || new Date().toISOString().split('T')[0],
                drop_or_number: application.drop_or_number || '',
                drop_or_date: application.drop_or_date || new Date().toISOString().split('T')[0],
                drop_amount: amountToUse,
                drop_official: application.drop_official || (defaultOff ? defaultOff.name : ''),
                drop_position: application.drop_position || (defaultOff ? defaultOff.position : '')
            });
        }
    }, [application, show, officials, feeSettings]);

    const handleOfficialChange = (selectedName: string) => {
        const selectedOff = officials.find(o => o.name === selectedName);
        setData(prev => ({
            ...prev,
            drop_official: selectedName,
            drop_position: selectedOff ? selectedOff.position : prev.drop_position
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.id) {
            put(route("mtop.cancel", data.id as number), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const isAlreadyDropped = application?.status === 'cancelled';
    const officialNames = officials.map(o => o.name);

    return (
        <Modal show={show} onClose={handleClose} maxWidth="4xl">
            <div className="flex flex-col h-full sm:h-auto max-h-[90vh]">

                {/* Header */}
                <div className="bg-gray-800 px-6 py-4 flex justify-between items-center shrink-0 sm:rounded-t-lg shadow-sm z-10">
                    <h3 className="text-white font-bold uppercase tracking-wider text-lg flex items-center gap-2">
                        <Icon icon="solar:document-add-bold" width="24" />
                        {isAlreadyDropped ? 'Dropping Record Details' : 'Order of Dropping Form'}
                    </h3>
                    <button type="button" onClick={handleClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full">
                        <Icon icon="solar:close-circle-bold" width="28" />
                    </button>
                </div>

                <div className="bg-gray-100 overflow-y-auto flex-1 p-4">
                    <form id="dropping-form" onSubmit={handleSubmit} className="space-y-2">

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                            {/* APPLICANT CARD */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                <h4 className="text-sm font-extrabold text-indigo-600 uppercase tracking-wider border-b mb-2">Applicant Details</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">First Name</label>
                                        <TextInput className="w-full p-3" value={data.first_name} onChange={e => setData('first_name', e.target.value)} required />
                                        <InputError message={errors.first_name} className="mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Middle Name</label>
                                        <TextInput className="w-full p-3" value={data.middle_name} onChange={e => setData('middle_name', e.target.value)} />
                                        <InputError message={errors.middle_name} className="mt-1" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Last Name</label>
                                        <TextInput className="w-full p-3" value={data.last_name} onChange={e => setData('last_name', e.target.value)} required />
                                        <InputError message={errors.last_name} className="mt-1" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Address</label>
                                        <TextInput className="w-full p-3" value={data.address} onChange={e => setData('address', e.target.value)} required />
                                        <InputError message={errors.address} className="mt-1" />
                                    </div>
                                </div>
                            </div>

                            {/* VEHICLE CARD */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                <h4 className="text-sm font-extrabold text-indigo-600 uppercase tracking-wider border-b mb-4">Vehicle Specifications</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Make / Type</label>
                                        <TextInput className="w-full p-3" value={data.make_type} onChange={e => setData('make_type', e.target.value)} required />
                                        <InputError message={errors.make_type} className="mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Engine No.</label>
                                        <TextInput className="w-full p-3" value={data.engine_motor_no} onChange={e => setData('engine_motor_no', e.target.value)} required />
                                        <InputError message={errors.engine_motor_no} className="mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Chassis No.</label>
                                        <TextInput className="w-full p-3" value={data.chassis_no} onChange={e => setData('chassis_no', e.target.value)} required />
                                        <InputError message={errors.chassis_no} className="mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Plate No.</label>
                                        <TextInput className="w-full p-3" value={data.plate_no} onChange={e => setData('plate_no', e.target.value)} required />
                                        <InputError message={errors.plate_no} className="mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Body No.</label>
                                        <TextInput className="w-full p-3" value={data.body_number} onChange={e => setData('body_number', e.target.value)} />
                                        <InputError message={errors.body_number} className="mt-1" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TRANSACTION CARD (Matches OfficialsForm Theme) */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between border-b border-yellow-300 mb-5">
                                <h4 className="font-extrabold text-base uppercase tracking-wide text-yellow-700 flex items-center gap-2">
                                    <Icon icon="solar:tag-price-bold" width="20" />
                                    Dropping Fee & Signatory
                                </h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Date Dropped</label>
                                    <TextInput type="date" className="w-full p-3" value={data.drop_date} onChange={e => setData('drop_date', e.target.value)} required />
                                    <InputError message={errors.drop_date} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">OR Number</label>
                                    <TextInput className="w-full p-3" placeholder="e.g. 123456" value={data.drop_or_number} onChange={e => setData('drop_or_number', e.target.value)} required />
                                    <InputError message={errors.drop_or_number} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">OR Date</label>
                                    <TextInput type="date" className="w-full p-3" value={data.drop_or_date} onChange={e => setData('drop_or_date', e.target.value)} required />
                                    <InputError message={errors.drop_or_date} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Amount (P)</label>
                                    <TextInput type="number" step="0.01" className="w-full font-bold p-3" placeholder="100.00" value={data.drop_amount} onChange={e => setData('drop_amount', e.target.value)} required />
                                    <InputError message={errors.drop_amount} className="mt-1" />
                                </div>
                            </div>

                            {/* Selectable / Editable Official */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Dropping Official</label>
                                    <SignatorySelect
                                        label=""
                                        value={data.drop_official}
                                        onChange={handleOfficialChange}
                                        options={officialNames}
                                        error={errors.drop_official}
                                        required={true}
                                        className="[&>label]:hidden" /* <-- Placed directly inside the component! */
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Official Position / Title</label>
                                    <TextInput
                                        className="w-full p-3"
                                        placeholder="e.g. Administrative Aide IV"
                                        value={data.drop_position}
                                        onChange={e => setData('drop_position', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.drop_position} className="mt-1" />
                                </div>
                            </div>

                            <div className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg border border-yellow-100 mt-5">
                                <Icon icon="solar:info-circle-bold" className="text-yellow-500 mt-0.5 shrink-0" width="18" />
                                <p className="text-xs text-yellow-700 leading-relaxed">
                                    <strong>Tip:</strong> Search or select an official to auto-fill their position, or you can manually type a custom name and title.
                                </p>
                            </div>
                        </div>
                    </form>
                </div>

                {/* FOOTER */}
                <div className="bg-white border-t px-6 py-4 flex flex-col sm:flex-row justify-end items-center gap-3 shrink-0 sm:rounded-b-lg">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 disabled:opacity-25 transition-all text-center"
                    >
                        Close
                    </button>

                    {/* Using application?.id fixes the Ziggy Error perfectly */}
                    {isAlreadyDropped && application?.id && (
                        <a
                            href={route("mtop.print_drop", application.id)}
                            target="_blank"
                            className="w-full sm:w-auto px-6 py-2.5 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 active:bg-green-800 shadow-sm flex justify-center items-center gap-2 transition-all"
                        >
                            <Icon icon="solar:printer-bold" width="18" /> Print Order
                        </a>
                    )}

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={processing}
                        className="w-full sm:w-auto px-6 py-2.5 bg-orange-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-orange-500 active:bg-orange-700 shadow-sm disabled:opacity-25 flex justify-center items-center gap-2 transition-all"
                    >
                        <Icon icon="solar:diskette-bold" width="18" />
                        {processing ? 'Processing...' : (isAlreadyDropped ? 'Save Updates' : 'Confirm Drop')}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
