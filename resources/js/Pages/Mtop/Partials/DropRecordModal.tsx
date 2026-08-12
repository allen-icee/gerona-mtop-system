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
    const getLocalDateString = () => {
        const date = new Date();
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().split('T')[0];
    };

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
        drop_date: getLocalDateString(), // <--- Uses local timezone now
        drop_or_number: '',
        drop_or_date: getLocalDateString(), // <--- Uses local timezone now
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
                drop_date: application.drop_date || getLocalDateString(), // <--- Uses local timezone now
                drop_or_number: application.drop_or_number || '',
                drop_or_date: application.drop_or_date || getLocalDateString(), // <--- Uses local timezone now
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
    const officialOptions = officials.map(o => `${o.name} | ${o.position}`);

    const handleEnterKey = (
        e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        if (e.key === "Enter") {
            e.preventDefault();

            const form = e.currentTarget.closest('form'); // Find the parent form
            if (!form) return;

            // Get all focusable elements inside the form, including the submit button
            const allInputs = Array.from(
                form.querySelectorAll(
                    'input:not([disabled]):not([readonly]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button[type="submit"]:not([disabled])'
                )
            ) as HTMLElement[];

            // Filter out hidden elements
            const visibleInputs = allInputs.filter(
                (el) => el.offsetParent !== null
            );

            const index = visibleInputs.indexOf(e.currentTarget as any);

            if (index > -1) {
                // If it's not the last element, focus the next one
                if (index < visibleInputs.length - 1) {
                    visibleInputs[index + 1].focus();
                } else {
                    // If it is the last element (which should be the submit button), trigger submit
                    const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                    if (submitButton && !submitButton.disabled) {
                        submitButton.click();
                    }
                }
            }
        }
    };

    const isFormValid = !!(
        data.drop_date &&
        data.drop_or_number &&
        data.drop_or_date &&
        data.drop_amount &&
        data.drop_official &&
        data.drop_position
    );

    return (
        <Modal show={show} onClose={handleClose} maxWidth="4xl">
            {/* Wrap the entire modal content (including footer) in the form so the submit button is reachable by handleEnterKey */}
            <form id="dropping-form" onSubmit={handleSubmit} className="bg-slate-50 rounded-none sm:rounded-lg h-full sm:h-auto max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center bg-slate-700 px-5 py-3 rounded-none sm:rounded-t-lg border-b border-slate-800 shrink-0">
                    <h3 className="text-white font-bold text-base flex items-center gap-2">
                        <Icon icon="solar:document-add-bold" width="20" />
                        {isAlreadyDropped ? 'Dropping Record Details' : 'Order of Dropping Form'}
                    </h3>
                    <button type="button" onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
                        <Icon icon="solar:close-circle-bold" width="24" />
                    </button>
                </div>

                <div className="overflow-y-auto p-5 bg-slate-50 flex-1">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* APPLICANT CARD */}
                            <div className="bg-white p-5 rounded border-t-4 border-t-indigo-500 border-x border-b border-slate-200 shadow-sm space-y-3">
                                <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wide border-b border-slate-200 pb-2 mb-1">Applicant Details</h4>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">Full Name</p>
                                        <p className="text-sm font-bold text-slate-800">{`${data.first_name || ''} ${data.middle_name ? data.middle_name + ' ' : ''}${data.last_name || ''}`.trim() || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">Address</p>
                                        <p className="text-sm font-bold text-slate-800">{data.address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* VEHICLE CARD */}
                            <div className="bg-white p-5 rounded border-t-4 border-t-blue-500 border-x border-b border-slate-200 shadow-sm space-y-3">
                                <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wide border-b border-slate-200 pb-2 mb-1">Vehicle Specifications</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">Make / Type</p>
                                        <p className="text-sm font-bold text-slate-800">{data.make_type || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">Engine No.</p>
                                        <p className="text-sm font-bold text-slate-800">{data.engine_motor_no || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">Chassis No.</p>
                                        <p className="text-sm font-bold text-slate-800">{data.chassis_no || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">Plate No.</p>
                                        <p className="text-sm font-bold text-slate-800">{data.plate_no || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">Body No.</p>
                                        <p className="text-sm font-bold text-slate-800">{data.body_number || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TRANSACTION CARD */}
                        <div className="bg-white p-5 rounded border-t-4 border-t-yellow-500 border-x border-b border-slate-200 shadow-sm">
                            <h4 className="text-sm font-bold text-yellow-700 uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 pb-2 mb-3">
                                <Icon icon="solar:tag-price-bold" width="16" />
                                Dropping Fee & Signatory
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Date Dropped <span className="text-red-500 ml-1">*</span></label>
                                    <input type="date" className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500" value={data.drop_date} onChange={e => setData('drop_date', e.target.value)} onKeyDown={handleEnterKey} required />
                                    <InputError message={errors.drop_date} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">OR Number <span className="text-red-500 ml-1">*</span></label>
                                    <input type="text" className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500" placeholder="e.g. 123456" value={data.drop_or_number} onChange={e => setData('drop_or_number', e.target.value)} onKeyDown={handleEnterKey} required />
                                    <InputError message={errors.drop_or_number} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">OR Date <span className="text-red-500 ml-1">*</span></label>
                                    <input type="date" className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500" value={data.drop_or_date} onChange={e => setData('drop_or_date', e.target.value)} onKeyDown={handleEnterKey} required />
                                    <InputError message={errors.drop_or_date} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Amount (P) <span className="text-red-500 ml-1">*</span></label>
                                    <input type="number" step="0.01" className="w-full px-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 text-yellow-700" placeholder="100.00" value={data.drop_amount} onChange={e => setData('drop_amount', e.target.value)} onKeyDown={handleEnterKey} required />
                                    <InputError message={errors.drop_amount} className="mt-1" />
                                </div>
                            </div>

                            {/* Selectable / Editable Official */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Dropping Official <span className="text-red-500 ml-1">*</span></label>
                                    <SignatorySelect
                                        label=""
                                        value={data.drop_official}
                                        onChange={handleOfficialChange}
                                        options={officialOptions}
                                        error={errors.drop_official}
                                        required={true}
                                        className="[&>label]:hidden [&_input]:w-full [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:font-semibold [&_input]:bg-white [&_input]:border [&_input]:border-slate-300 [&_input]:rounded [&_input]:shadow-sm [&_input]:focus:border-red-500 [&_input]:focus:ring-1 [&_input]:focus:ring-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Official Position / Title <span className="text-red-500 ml-1">*</span></label>
                                    <input type="text"
                                        className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                        placeholder="e.g. Administrative Aide IV"
                                        value={data.drop_position}
                                        onChange={e => setData('drop_position', e.target.value)}
                                        onKeyDown={handleEnterKey}
                                        required
                                    />
                                    <InputError message={errors.drop_position} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="flex flex-col sm:flex-row justify-end items-center gap-2 pt-5 border-t border-slate-200 mt-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="w-full sm:w-auto px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300 font-bold rounded text-sm shadow-sm transition-colors text-center"
                            >
                                Close
                            </button>

                            {/* Using application?.id fixes the Ziggy Error perfectly */}
                            {isAlreadyDropped && application?.id && (
                                <a
                                    href={route("mtop.print_drop", application.id)}
                                    target="_blank"
                                    className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 border border-transparent rounded font-bold text-sm text-white shadow-sm flex justify-center items-center gap-1.5 transition-colors"
                                >
                                    <Icon icon="solar:printer-bold" width="16" /> Print Order
                                </a>
                            )}

                            <button
                                type="submit"
                                disabled={processing || !isFormValid}
                                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 border border-transparent rounded font-bold text-sm text-white shadow-sm disabled:opacity-50 flex justify-center items-center gap-1.5 transition-colors"
                            >
                                <Icon icon="solar:diskette-bold" width="16" />
                                {processing ? 'Processing...' : (isAlreadyDropped ? 'Save Updates' : 'Confirm Drop')}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
