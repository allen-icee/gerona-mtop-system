import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import PrimaryButton from '@/Components/PrimaryButton';
import { Icon } from '@iconify/react';

interface Props {
    show: boolean;
    onClose: () => void;
    onLeave: () => void;
    onSave?: () => void;       // <--- Added this to fix the error
    processing?: boolean;      // <--- Added this to fix the error
    message?: string;          // <--- Added this to make the text dynamic
}

export default function UnsavedChangesModal({
    show,
    onClose,
    onLeave,
    onSave,
    processing = false,
    message = "You have unsaved changes. If you leave now, your changes will be lost. Are you sure you want to proceed without saving?"
}: Props) {
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
                    {message}
                </p>

                <div className="flex justify-end gap-3">
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        {onSave ? "Cancel" : "Stay and Save"}
                    </SecondaryButton>

                    <DangerButton onClick={onLeave} disabled={processing}>
                        Leave Anyway
                    </DangerButton>

                    {/* This Save button only appears if the page supports saving from the modal */}
                    {onSave && (
                        <PrimaryButton
                            onClick={onSave}
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {processing ? "Saving..." : "Save Changes"}
                        </PrimaryButton>
                    )}
                </div>
            </div>
        </Modal>
    );
}
