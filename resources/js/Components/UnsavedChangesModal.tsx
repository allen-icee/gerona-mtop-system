import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Icon } from '@iconify/react';

interface Props {
    show: boolean;
    onClose: () => void;
    onLeave: () => void; // <--- Add this line
}

export default function UnsavedChangesModal({ show, onClose, onLeave }: Props) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <div className="flex items-center gap-4 mb-4 text-amber-600">
                    <Icon icon="solar:danger-triangle-bold" width="40" />
                    <h2 className="text-xl font-bold text-gray-900">
                        Unsaved Changes
                    </h2>
                </div>

                <p className="text-gray-600 mb-6">
                    You have modified the fee settings. If you leave now, your changes will be lost.
                    Are you sure you want to proceed without saving?
                </p>

                <div className="flex justify-end gap-3">
                    <SecondaryButton onClick={onClose}>
                        Stay and Save
                    </SecondaryButton>
                    <DangerButton onClick={onLeave}>
                        Leave Anyway
                    </DangerButton>
                </div>
            </div>
        </Modal>
    );
}
