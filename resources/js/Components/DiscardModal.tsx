import React from 'react';
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';
import { Icon } from '@iconify/react';

interface DiscardModalProps {
    show: boolean;
    onClose: () => void;
    onDiscard: () => void;
}

export default function DiscardModal({ show, onClose, onDiscard }: DiscardModalProps) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <Icon icon="solar:danger-triangle-bold-duotone" width="28" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Unsaved Changes</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            You have unsaved changes. Are you sure you want to leave this page?
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-bold text-sm hover:bg-slate-200 transition-colors"
                    >
                        Keep Editing
                    </button>
                    <PrimaryButton
                        type="button"
                        onClick={onDiscard}
                        className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                    >
                        Discard Changes
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}
