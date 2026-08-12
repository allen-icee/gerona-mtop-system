//GeronaMTOP\resources\js\Pages\Settings\PrintLayout.tsx
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router } from "@inertiajs/react";
import PrimaryButton from "@/Components/PrimaryButton";
import InputLabel from "@/Components/InputLabel";
import { Switch } from "@headlessui/react";
import { useState, useEffect, useRef } from "react";
import UnsavedChangesModal from "@/Components/UnsavedChangesModal";
import { Icon } from "@iconify/react";

export default function PrintLayout({ settings }: { settings: any }) {
    const { data, setData, post, processing, isDirty, reset } = useForm({
        header: null as File | null,
        footer: null as File | null,
        id_background: null as File | null,
        show_header: settings.show_header ? true : false,
        show_footer: settings.show_footer ? true : false,
        remove_header: false,
        remove_footer: false,
        remove_id_background: false,
    });

    const [headerPreview, setHeaderPreview] = useState<string | null>(null);
    const [footerPreview, setFooterPreview] = useState<string | null>(null);
    const [idBackgroundPreview, setIdBackgroundPreview] = useState<
        string | null
    >(null);
    const [showExitModal, setShowExitModal] = useState(false);
    const [pendingUrl, setPendingUrl] = useState<string | null>(null);

    const allowExitRef = useRef(false);

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            show_header: settings.show_header ? true : false,
            show_footer: settings.show_footer ? true : false,
            remove_header: false,
            remove_footer: false,
            remove_id_background: false,
            header: null,
            footer: null,
            id_background: null,
        }));

        const timestamp = new Date().getTime();

        if (settings.header_path) {
            setHeaderPreview(`/storage/${settings.header_path}?t=${timestamp}`);
        } else {
            setHeaderPreview(`/images/Gerona_Header.jpg?t=${timestamp}`);
        }

        if (settings.footer_path) {
            setFooterPreview(`/storage/${settings.footer_path}?t=${timestamp}`);
        } else {
            setFooterPreview(null);
        }

        if (settings.id_background_path) {
            setIdBackgroundPreview(
                `/storage/${settings.id_background_path}?t=${timestamp}`,
            );
        } else {
            setIdBackgroundPreview(`/images/ID_BG_1.png?t=${timestamp}`);
        }
    }, [settings]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty && !allowExitRef.current) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        const removeInertiaListener = router.on("before", (event) => {
            if (
                !allowExitRef.current &&
                isDirty &&
                event.detail.visit.method === "get"
            ) {
                event.preventDefault();
                setPendingUrl(event.detail.visit.url.href);
                setShowExitModal(true);
            }
        });

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            removeInertiaListener();
        };
    }, [isDirty]);

    const cancelExit = () => {
        setShowExitModal(false);
        setPendingUrl(null);
    };

    const discardAndExit = () => {
        allowExitRef.current = true;
        setShowExitModal(false);
        reset();
        if (pendingUrl) router.visit(pendingUrl);
    };

    const saveAndExit = () => {
        post(route("settings.print.update"), {
            onSuccess: () => {
                allowExitRef.current = true;
                setShowExitModal(false);
                if (pendingUrl) router.visit(pendingUrl);
            },
            onError: () => {
                setShowExitModal(false);
                allowExitRef.current = false;
            },
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("settings.print.update"));
    };

    const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData((prev) => ({
                ...prev,
                header: file,
                remove_header: false,
            }));
            setHeaderPreview(URL.createObjectURL(file));
        }
        e.target.value = "";
    };

    const handleRemoveHeader = () => {
        setData((prev) => ({ ...prev, header: null, remove_header: true }));
        setHeaderPreview(`/images/Gerona_Header.jpg?t=${new Date().getTime()}`);
    };

    const handleFooterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData((prev) => ({
                ...prev,
                footer: file,
                remove_footer: false,
            }));
            setFooterPreview(URL.createObjectURL(file));
        }
        e.target.value = "";
    };

    const handleRemoveFooter = () => {
        setData((prev) => ({ ...prev, footer: null, remove_footer: true }));
        setFooterPreview(null);
    };

    const handleIdBackgroundChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setData((prev) => ({
                ...prev,
                id_background: file,
                remove_id_background: false,
            }));
            setIdBackgroundPreview(URL.createObjectURL(file));
        }
        e.target.value = "";
    };

    const handleRemoveIdBackground = () => {
        setData((prev) => ({
            ...prev,
            id_background: null,
            remove_id_background: true,
        }));
        setIdBackgroundPreview(`/images/ID_BG_1.png?t=${new Date().getTime()}`);
    };

    const ToggleSwitch = ({ label, checked, onChange }: any) => (
        <Switch.Group as="div" className="flex items-center justify-between">
            <Switch.Label className="mr-3 text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                {label}
            </Switch.Label>
            <Switch
                checked={checked}
                onChange={onChange}
                className={`${checked ? "bg-blue-600" : "bg-slate-300"} relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
            >
                <span
                    aria-hidden="true"
                    className={`${checked ? "translate-x-5" : "translate-x-0"} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
            </Switch>
        </Switch.Group>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Print Layout Settings" />

            <UnsavedChangesModal
                show={showExitModal}
                onClose={cancelExit}
                onLeave={discardAndExit}
                onSave={saveAndExit}
                processing={processing}
            />

            <div className="py-6 sm:py-12 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-slate-50 overflow-hidden shadow-sm sm:rounded border border-slate-200 p-5">
                        <form
                            onSubmit={submit}
                            className="space-y-8"
                        >
                            <div className="border-b border-slate-200 pb-8">
                                <div className="md:flex md:items-center md:justify-between mb-6">
                                    <div>
                                        <h3 className="text-base font-extrabold text-slate-800">
                                            Permit Header Image
                                        </h3>
                                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">
                                            Recommended size: 1000x200px (PNG or JPG).
                                        </p>
                                    </div>
                                    <div className="mt-4 md:mt-0">
                                        <ToggleSwitch
                                            label={
                                                data.show_header
                                                    ? "Enabled"
                                                    : "Disabled"
                                            }
                                            checked={data.show_header}
                                            onChange={(val: boolean) =>
                                                setData("show_header", val)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                    <div className="lg:col-span-4 space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="cursor-pointer w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded text-sm font-bold transition-all flex items-center justify-center gap-1.5 border border-indigo-200 shadow-sm group">
                                                <Icon
                                                    icon="solar:gallery-send-bold-duotone"
                                                    width="16"
                                                    className="text-slate-600 group-hover:-translate-y-0.5 transition-transform"
                                                />{" "}
                                                Choose Picture
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={
                                                        handleHeaderChange
                                                    }
                                                />
                                            </label>

                                            {((settings.header_path &&
                                                !data.remove_header) ||
                                                data.header) && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveHeader}
                                                    className="w-full text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded text-sm font-bold transition-all flex items-center justify-center gap-1.5 border border-red-100"
                                                >
                                                    <Icon
                                                        icon="solar:trash-bin-trash-bold"
                                                        width="16"
                                                    />{" "}
                                                    Reset to Default
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        className={`lg:col-span-8 transition-opacity duration-300 ${data.show_header ? "opacity-100" : "opacity-50 grayscale"}`}
                                    >
                                        <div className="border-2 border-dashed border-slate-300 rounded p-4 bg-white flex items-center justify-center min-h-32 relative overflow-hidden group">
                                            {(!settings.header_path &&
                                                !data.header) ||
                                            data.remove_header ? (
                                                <span className="absolute top-2 right-2 bg-slate-200 text-slate-600 text-[10px] font-extrabold px-2 py-1 rounded uppercase tracking-wider z-10 shadow-sm">
                                                    Default
                                                </span>
                                            ) : null}

                                            {headerPreview ? (
                                                <img
                                                    src={headerPreview}
                                                    alt="Header Preview"
                                                    className="max-h-32 w-auto object-contain rounded drop-shadow-sm"
                                                    onError={(e) => {
                                                        e.currentTarget.src = `/images/Gerona_Header.jpg?t=${new Date().getTime()}`;
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                                                    <Icon
                                                        icon="solar:gallery-remove-bold-duotone"
                                                        width="16"
                                                    />{" "}
                                                    No image selected
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-b border-slate-200 pb-8 mt-8">
                                <div className="md:flex md:items-center md:justify-between mb-6">
                                    <div>
                                        <h3 className="text-base font-extrabold text-slate-800">
                                            Permit Footer Image
                                        </h3>
                                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">
                                            Recommended size: 1000x150px (PNG or JPG).
                                        </p>
                                    </div>
                                    <div className="mt-4 md:mt-0">
                                        <ToggleSwitch
                                            label={
                                                data.show_footer
                                                    ? "Enabled"
                                                    : "Disabled"
                                            }
                                            checked={data.show_footer}
                                            onChange={(val: boolean) =>
                                                setData("show_footer", val)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                    <div className="lg:col-span-4 space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="cursor-pointer w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded text-sm font-bold transition-all flex items-center justify-center gap-1.5 border border-indigo-200 shadow-sm group">
                                                <Icon
                                                    icon="solar:gallery-send-bold-duotone"
                                                    width="16"
                                                    className="text-slate-600 group-hover:-translate-y-0.5 transition-transform"
                                                />{" "}
                                                Choose Picture
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={
                                                        handleFooterChange
                                                    }
                                                />
                                            </label>

                                            {((settings.footer_path &&
                                                !data.remove_footer) ||
                                                data.footer) && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveFooter}
                                                    className="w-full text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded text-sm font-bold transition-all flex items-center justify-center gap-1.5 border border-red-100"
                                                >
                                                    <Icon
                                                        icon="solar:trash-bin-trash-bold"
                                                        width="16"
                                                    />{" "}
                                                    Remove Picture
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        className={`lg:col-span-8 transition-opacity duration-300 ${data.show_footer ? "opacity-100" : "opacity-50 grayscale"}`}
                                    >
                                        <div className="border-2 border-dashed border-slate-300 rounded p-4 bg-white flex items-center justify-center min-h-32 relative overflow-hidden">
                                            {footerPreview ? (
                                                <img
                                                    src={footerPreview}
                                                    alt="Footer Preview"
                                                    className="max-h-32 w-auto object-contain rounded drop-shadow-sm"
                                                />
                                            ) : (
                                                <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                                                    <Icon
                                                        icon="solar:gallery-remove-bold-duotone"
                                                        width="16"
                                                    />{" "}
                                                    No image selected
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pb-4 mt-8">
                                <div className="md:flex md:items-center md:justify-between mb-6">
                                    <div>
                                        <h3 className="text-base font-extrabold text-slate-800">
                                            Operator ID Background
                                        </h3>
                                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">
                                            Recommended size: 400x650px (PNG or JPG).
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                    <div className="lg:col-span-4 space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="cursor-pointer w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded text-sm font-bold transition-all flex items-center justify-center gap-1.5 border border-indigo-200 shadow-sm group">
                                                <Icon
                                                    icon="solar:gallery-send-bold-duotone"
                                                    width="16"
                                                    className="text-slate-600 group-hover:-translate-y-0.5 transition-transform"
                                                />{" "}
                                                Choose Picture
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={
                                                        handleIdBackgroundChange
                                                    }
                                                />
                                            </label>

                                            {((settings.id_background_path &&
                                                !data.remove_id_background) ||
                                                data.id_background) && (
                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleRemoveIdBackground
                                                    }
                                                    className="w-full text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded text-sm font-bold transition-all flex items-center justify-center gap-1.5 border border-red-100"
                                                >
                                                    <Icon
                                                        icon="solar:trash-bin-trash-bold"
                                                        width="16"
                                                    />{" "}
                                                    Reset to Default
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="lg:col-span-8">
                                        <div className="border-2 border-dashed border-slate-300 rounded p-4 bg-white flex items-center justify-center min-h-75 relative overflow-hidden">
                                            {(!settings.id_background_path &&
                                                !data.id_background) ||
                                            data.remove_id_background ? (
                                                <span className="absolute top-2 right-2 bg-slate-200 text-slate-600 text-[10px] font-extrabold px-2 py-1 rounded uppercase tracking-wider z-10 shadow-sm">
                                                    Default
                                                </span>
                                            ) : null}

                                            {idBackgroundPreview ? (
                                                <img
                                                    src={idBackgroundPreview}
                                                    alt="ID Background Preview"
                                                    className="max-h-80 w-auto object-contain drop-shadow-md rounded"
                                                    onError={(e) => {
                                                        e.currentTarget.src = `/images/ID_BG_1.png?t=${new Date().getTime()}`;
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                                                    <Icon
                                                        icon="solar:gallery-remove-bold-duotone"
                                                        width="16"
                                                    />{" "}
                                                    No image selected
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end pt-6 border-t border-slate-200">
                                <button
                                    disabled={processing || !isDirty}
                                    type="submit"
                                    className={`w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm rounded font-bold transition-all ${!isDirty ? "opacity-50 cursor-not-allowed bg-slate-400 text-white" : "bg-blue-600 hover:bg-blue-700 text-white shadow"}`}
                                >
                                    <Icon
                                        icon="solar:diskette-bold"
                                        className="mr-1.5"
                                        width="16"
                                    />{" "}
                                    Save Print Settings
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
