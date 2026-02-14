import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import InputLabel from "@/Components/InputLabel";
import { Switch } from "@headlessui/react"; // Using your installed Headless UI
import { useState, useEffect } from "react";

export default function PrintLayout({ settings }: { settings: any }) {
    const { data, setData, post, processing } = useForm({
        header: null as File | null,
        footer: null as File | null,
        show_header: settings.show_header ?? true,
        show_footer: settings.show_footer ?? false,
    });

    // Preview States
    const [headerPreview, setHeaderPreview] = useState<string | null>(null);
    const [footerPreview, setFooterPreview] = useState<string | null>(null);

    // Initialize previews
    useEffect(() => {
        if (settings.header_path)
            setHeaderPreview(`/storage/${settings.header_path}`);
        if (settings.footer_path)
            setFooterPreview(`/storage/${settings.footer_path}`);
    }, [settings]);

    const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("header", file);
            setHeaderPreview(URL.createObjectURL(file));
        }
    };

    const handleFooterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("footer", file);
            setFooterPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("settings.print.update"));
    };

    // Reusable Toggle Switch Component
    const ToggleSwitch = ({
        label,
        checked,
        onChange,
    }: {
        label: string;
        checked: boolean;
        onChange: (checked: boolean) => void;
    }) => (
        <Switch.Group as="div" className="flex items-center justify-between">
            <Switch.Label
                as="span"
                className="mr-3 text-sm font-medium text-gray-700"
            >
                {label}
            </Switch.Label>
            <Switch
                checked={checked}
                onChange={onChange}
                className={`${
                    checked ? "bg-blue-600" : "bg-gray-200"
                } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`}
            >
                <span
                    aria-hidden="true"
                    className={`${
                        checked ? "translate-x-5" : "translate-x-0"
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
            </Switch>
        </Switch.Group>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Print Layout Settings" />

            <div className="py-6 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form
                            onSubmit={submit}
                            className="p-4 sm:p-8 space-y-8"
                        >
                            {/* --- HEADER CONFIGURATION --- */}
                            <div className="border-b border-gray-200 pb-8">
                                <div className="md:flex md:items-center md:justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Header
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Manage the branding image at the top
                                            of documents.
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
                                            onChange={(val) =>
                                                setData("show_header", val)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                                    {/* Upload Input */}
                                    <div className="space-y-2">
                                        <InputLabel value="Upload New Image" />
                                        <input
                                            type="file"
                                            onChange={handleHeaderChange}
                                            className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2.5 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-50 file:text-blue-700
                                                hover:file:bg-blue-100 cursor-pointer
                                                border border-gray-300 rounded-lg"
                                            accept="image/*"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Recommended size: 1000x200px (PNG or
                                            JPG)
                                        </p>
                                    </div>

                                    {/* Preview */}
                                    <div
                                        className={`transition-opacity duration-300 ${data.show_header ? "opacity-100" : "opacity-50 grayscale"}`}
                                    >
                                        <InputLabel
                                            value="Preview"
                                            className="mb-2"
                                        />
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 flex items-center justify-center min-h-30">
                                            {headerPreview ? (
                                                <img
                                                    src={headerPreview}
                                                    alt="Header Preview"
                                                    className="max-h-32 w-auto object-contain"
                                                />
                                            ) : (
                                                <span className="text-gray-400 italic text-sm">
                                                    No image selected
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* --- FOOTER CONFIGURATION --- */}
                            <div className="border-b border-gray-200 pb-8">
                                <div className="md:flex md:items-center md:justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Footer
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Manage the branding image at the
                                            bottom of documents.
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
                                            onChange={(val) =>
                                                setData("show_footer", val)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                                    {/* Upload Input */}
                                    <div className="space-y-2">
                                        <InputLabel value="Upload New Image" />
                                        <input
                                            type="file"
                                            onChange={handleFooterChange}
                                            className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2.5 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-50 file:text-blue-700
                                                hover:file:bg-blue-100 cursor-pointer
                                                border border-gray-300 rounded-lg"
                                            accept="image/*"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Recommended size: 1000x150px (PNG or
                                            JPG)
                                        </p>
                                    </div>

                                    {/* Preview */}
                                    <div
                                        className={`transition-opacity duration-300 ${data.show_footer ? "opacity-100" : "opacity-50 grayscale"}`}
                                    >
                                        <InputLabel
                                            value="Preview"
                                            className="mb-2"
                                        />
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 flex items-center justify-center min-h-30">
                                            {footerPreview ? (
                                                <img
                                                    src={footerPreview}
                                                    alt="Footer Preview"
                                                    className="max-h-32 w-auto object-contain"
                                                />
                                            ) : (
                                                <span className="text-gray-400 italic text-sm">
                                                    No image selected
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* --- ACTIONS --- */}
                            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-2">
                                <Link
                                    href={route("dashboard")}
                                    className="w-full sm:w-auto"
                                >
                                    <SecondaryButton
                                        disabled={processing}
                                        className="w-full justify-center"
                                    >
                                        Cancel
                                    </SecondaryButton>
                                </Link>

                                <PrimaryButton
                                    disabled={processing}
                                    className="w-full sm:w-auto justify-center"
                                >
                                    Save Changes
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
