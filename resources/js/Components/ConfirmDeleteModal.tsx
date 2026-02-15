import Modal from "@/Components/Modal";
import DangerButton from "@/Components/DangerButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { Icon } from "@iconify/react";

interface Props {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    processing?: boolean;
}

export default function ConfirmDeleteModal({
    show,
    onClose,
    onConfirm,
    title = "Delete Record?",
    message = "Are you sure you want to delete this record? This action cannot be undone.",
    processing = false,
}: Props) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6">
                {/* Icon Wrapper */}
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                    <Icon
                        icon="solar:trash-bin-trash-bold"
                        className="text-red-600"
                        width="32"
                    />
                </div>

                {/* Text Content */}
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500 leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>

                {/* Buttons - Centered */}
                <div className="mt-8 flex justify-center gap-3">
                    <SecondaryButton
                        onClick={onClose}
                        disabled={processing}
                        className="justify-center min-w-25"
                    >
                        Cancel
                    </SecondaryButton>

                    <DangerButton
                        onClick={onConfirm}
                        disabled={processing}
                        className="justify-center min-w-25"
                    >
                        {processing ? (
                            <span className="flex items-center gap-2">
                                <Icon
                                    icon="svg-spinners:ring-resize"
                                    width="16"
                                />
                                Deleting...
                            </span>
                        ) : (
                            "Yes, Delete"
                        )}
                    </DangerButton>
                </div>
            </div>
        </Modal>
    );
}
