import Modal from "@/Components/Modal";
import DangerButton from "@/Components/DangerButton";
import PrimaryButton from "@/Components/PrimaryButton";
import { Icon } from "@iconify/react";

interface Props {
    show: boolean;
    onClose: () => void; // Triggered by clicking background
    onDiscard: () => void; // Discard & Leave
    onSave: () => void; // Save & Leave
    processing?: boolean;
}

export default function UnsavedChangesModal({
    show,
    onClose,
    onDiscard,
    onSave,
    processing = false,
}: Props) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                {/* Header / Icon */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-yellow-100 rounded-full shrink-0">
                        <Icon
                            icon="solar:danger-triangle-bold"
                            className="text-yellow-600 w-6 h-6"
                        />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">
                        Unsaved Changes
                    </h2>
                </div>

                {/* Body */}
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    You have unsaved changes. Do you want to save them before
                    leaving?
                </p>

                {/* Actions: Stack on mobile, Row on desktop */}
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                    <DangerButton
                        onClick={onDiscard}
                        disabled={processing}
                        className="w-full sm:w-auto justify-center"
                    >
                        Discard Changes
                    </DangerButton>

                    <PrimaryButton
                        onClick={onSave}
                        disabled={processing}
                        className="w-full sm:w-auto justify-center"
                    >
                        {processing ? "Saving..." : "Save"}
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}
