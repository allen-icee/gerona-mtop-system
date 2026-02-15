import { usePage } from "@inertiajs/react";
import { useEffect } from "react";
import toast, { Toaster, ToastBar } from "react-hot-toast";
import { Icon } from "@iconify/react";

export default function ToastListener() {
    const { props } = usePage();
    const flash = props.flash as any;

    useEffect(() => {
        // 1. Success Message
        if (flash.message) {
            toast.success(flash.message, {
                duration: 3000, // Faster auto-dismiss (3 seconds)
                icon: (
                    <Icon
                        icon="solar:check-circle-bold"
                        className="text-green-600 text-xl"
                    />
                ),
            });
        }

        // 2. Error Message
        if (flash.error) {
            toast.error(flash.error, {
                duration: 4000,
                icon: (
                    <Icon
                        icon="solar:danger-circle-bold"
                        className="text-red-600 text-xl"
                    />
                ),
            });
        }
    }, [flash]);

    return (
        <Toaster
            position="bottom-center"
            gutter={8}
            containerStyle={{ zIndex: 99999 }}
            toastOptions={{
                className: "",
                style: {
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(4px)",
                    color: "#1F2937",
                    padding: "10px 20px", // Balanced padding
                    borderRadius: "9999px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #F3F4F6",
                    fontSize: "14px",
                    fontWeight: "600",
                },
            }}
        >
            {(t) => (
                <ToastBar toast={t}>
                    {({ icon, message }) => (
                        <div className="flex items-center gap-3">
                            {/* Icon */}
                            <div className="shrink-0">{icon}</div>

                            {/* Message */}
                            <div className="text-gray-700 whitespace-nowrap">
                                {message}
                            </div>
                        </div>
                    )}
                </ToastBar>
            )}
        </Toaster>
    );
}
