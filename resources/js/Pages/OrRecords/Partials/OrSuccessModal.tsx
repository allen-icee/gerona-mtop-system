import Modal from "@/Components/Modal";
import { Icon } from "@iconify/react";
import { Link } from "@inertiajs/react";

interface Props {
    show: boolean;
    onClose: () => void;
    onEdit: () => void;
    action: "create" | "update" | "delete";
    data: {
        id: number; // Added id to match PrintSuccessModal for routing
        or_number: string;
        payor_name: string;
    } | null;
}

export default function OrSuccessModal({ show, onClose, action, data }: Props) {
    if (!data) return null;

    const isDelete = action === "delete";

    return (
        <Modal show={show} onClose={() => {}} closeable={false} maxWidth="md">
            <div className="p-6 flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDelete ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    <Icon icon={isDelete ? "solar:trash-bin-trash-bold" : "solar:check-circle-bold"} width="40" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {action === "create" && "Record Saved!"}
                    {action === "update" && "Record Updated!"}
                    {action === "delete" && "Record Deleted!"}
                </h3>
                <p className="text-gray-500 mb-6 text-sm">
                    The OR record has been successfully {action}d.
                </p>

                <div className="w-full bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 text-left">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide font-bold">
                            OR Number
                        </span>
                        <span className={`text-lg font-bold ${isDelete ? 'text-red-700' : 'text-blue-700'}`}>
                            {data.or_number}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide font-bold">
                            Payor
                        </span>
                        <p className="text-base font-medium text-gray-800 uppercase truncate">
                            {data.payor_name}
                        </p>
                    </div>
                </div>

                <div className="w-full space-y-3">
                    {!isDelete && (
                        <>
                            {/* Primary Action: Print OR (Replacing Create MTOP App) */}
                            <a
                                href={route("or_records.print", data.id)}
                                target="_blank"
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
                            >
                                <Icon icon="solar:printer-bold" width="20" />
                                Print OR
                            </a>

                            {/* Secondary Action: Edit Logic */}
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                            >
                                <Icon icon="solar:pen-new-square-bold" width="20" />
                                {action === "create" ? "Edit Record" : "Edit Again"}
                            </button>

                            <Link
                                href={route("or_records.index")}
                                className="block w-full text-sm text-gray-400 hover:text-gray-600 font-semibold underline mt-3 text-center transition-colors"
                            >
                                Return to Records
                            </Link>
                        </>
                    )}

                    {isDelete && (
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Icon icon="solar:close-circle-bold" width="20" />
                            Close
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
}
