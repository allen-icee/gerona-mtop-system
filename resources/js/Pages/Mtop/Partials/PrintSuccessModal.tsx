//GeronaMTOP\resources\js\Pages\Mtop\Partials\PrintSuccessModal.tsx
import Modal from "@/Components/Modal";
import { Link } from "@inertiajs/react";
import { Icon } from "@iconify/react";

interface Props {
    show: boolean;
    onClose: () => void;
    action: "create" | "update";
    data: {
        id: number;
        mt_number: string;
        operator_name: string;
    } | null;
}

export default function PrintSuccessModal({
    show,
    onClose,
    action,
    data,
}: Props) {
    if (!data) return null;

    return (
        <Modal show={show} onClose={() => {}} closeable={false} maxWidth="md">
            <div className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <Icon icon="solar:check-circle-bold" width="40" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {action === "create"
                        ? "Application Saved!"
                        : "Application Updated!"}
                </h3>
                <p className="text-gray-500 mb-6 text-sm">
                    The MTOP application has been successfully {action}d.
                </p>

                <div className="w-full bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 text-left">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide font-bold">
                            Case Number
                        </span>
                        <span className="text-lg font-bold text-blue-700">
                            {data.mt_number}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide font-bold">
                            Applicant
                        </span>
                        <p className="text-base font-medium text-gray-800 uppercase truncate">
                            {data.operator_name}
                        </p>
                    </div>
                </div>

                <div className="w-full space-y-3">
                    <a
                        href={route("mtop.print", data.id)}
                        target="_blank"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
                    >
                        <Icon icon="solar:printer-bold" width="20" />
                        Print Permit
                    </a>

                    {action === "create" ? (
                        <Link
                            href={route("mtop.edit", data.id)}
                            className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Icon icon="solar:pen-new-square-bold" width="20" />
                            Edit Record
                        </Link>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Icon icon="solar:pen-new-square-bold" width="20" />
                            Edit Again
                        </button>
                    )}

                    <Link
                        href={route("mtop.index")}
                        className="block w-full text-sm text-gray-400 hover:text-gray-600 font-semibold underline mt-3 text-center transition-colors"
                    >
                        Return to Records
                    </Link>
                </div>
            </div>
        </Modal>
    );
}
