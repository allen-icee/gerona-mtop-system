import Modal from "@/Components/Modal";
import DangerButton from "@/Components/DangerButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { Icon } from "@iconify/react";
import { useState } from "react";

interface Props {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    processing?: boolean;
}

export default function ClearRecordsModal({ show, onClose, onConfirm, title, description, processing = false }: Props) {
    const [confirmText, setConfirmText] = useState("");

    const handleConfirm = () => {
        if (confirmText === "CONFIRM") {
            onConfirm();
            setConfirmText("");
        }
    };

    const handleClose = () => {
        setConfirmText("");
        onClose();
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="md">
            <div className="bg-slate-50 rounded-none sm:rounded-lg h-full flex flex-col">
                <div className="flex justify-between items-center bg-red-600 px-5 py-3 rounded-none sm:rounded-t-lg border-b border-red-700">
                    <h3 className="text-white font-bold text-base flex items-center gap-2">
                        <Icon icon="solar:danger-triangle-bold" width="20" />
                        {title}
                    </h3>
                    <button onClick={handleClose} className="text-red-200 hover:text-white transition-colors">
                        <Icon icon="solar:close-circle-bold" width="22" />
                    </button>
                </div>

                <div className="p-5">
                    <p className="text-sm text-slate-700 mb-4">
                        {description}
                    </p>
                    <p className="text-sm font-bold text-red-600 mb-2">
                        This action is irreversible. To proceed, please type <span className="text-lg font-black select-all">CONFIRM</span> below:
                    </p>
                    
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Type CONFIRM here"
                        className="w-full px-3 py-2 text-sm font-semibold rounded border border-slate-300 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white placeholder:text-slate-400 mb-5 text-center tracking-widest uppercase"
                        onPaste={(e) => e.preventDefault()}
                    />

                    <div className="flex justify-end gap-2">
                        <SecondaryButton onClick={handleClose} disabled={processing} className="px-4 py-2 text-sm font-bold shadow-sm">
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={handleConfirm} disabled={confirmText !== "CONFIRM" || processing} className="px-4 py-2 text-sm font-bold shadow-sm flex items-center gap-1.5">
                            <Icon icon="solar:trash-bin-trash-bold" width="16" />
                            {processing ? "Clearing..." : "Clear Records"}
                        </DangerButton>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
