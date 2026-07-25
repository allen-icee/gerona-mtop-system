import Modal from "@/Components/Modal";
import { Icon } from "@iconify/react";

interface Props {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    bodyNumber: string;
}

export default function ReassignConfirmationModal({ show, onClose, onConfirm, bodyNumber }: Props) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="bg-slate-50 rounded-none sm:rounded-lg h-full flex flex-col">
                <div className="flex justify-between items-center bg-slate-700 px-5 py-3 rounded-none sm:rounded-t-lg border-b border-slate-800">
                    <span className="text-white font-bold text-base uppercase tracking-wider flex items-center gap-2">
                        <Icon icon="solar:danger-triangle-bold" className="text-yellow-400" width="20" />
                        Reassign Body Number?
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-300 hover:text-white transition-colors"
                    >
                        <Icon icon="solar:close-circle-bold" width="24" />
                    </button>
                </div>

                <div className="p-5">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md shadow-sm mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <Icon icon="solar:info-circle-bold" className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-800 font-medium">
                                    Body Number <span className="font-bold text-lg mx-1">{bodyNumber}</span> is currently active and assigned to another operator.
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-slate-600 font-semibold mb-4 leading-relaxed">
                        If you proceed, the previous owner's franchise record will be automatically marked as <strong className="text-red-600">Dropped</strong>, and this body number will be officially reassigned to the current application.
                    </p>

                    <p className="text-sm text-slate-600 font-semibold leading-relaxed">
                        Do you want to proceed and overwrite the active assignment?
                    </p>
                </div>

                <div className="flex justify-end gap-2 pt-4 px-5 pb-5 border-t border-slate-200 mt-auto bg-slate-50 rounded-b-lg">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-bold bg-yellow-500 hover:bg-yellow-600 text-white rounded-md shadow-sm transition-colors flex items-center gap-2"
                    >
                        <Icon icon="solar:check-circle-bold" width="18" /> Yes, Reassign
                    </button>
                </div>
            </div>
        </Modal>
    );
}
