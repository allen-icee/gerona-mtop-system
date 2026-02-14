import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import PrimaryButton from "@/Components/PrimaryButton";
import InputLabel from "@/Components/InputLabel";
import Checkbox from "@/Components/Checkbox";
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

    // Initialize with existing images from database
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
            // Create a temporary URL for the selected file
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

    return (
        <AuthenticatedLayout>
            <Head title="Print Layout Settings" />
            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-8">
                            {/* HEADER SECTION */}
                            <div className="border-b pb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Header Configuration
                                </h3>

                                {/* PREVIEW BOX */}
                                <div className="mb-4">
                                    <InputLabel
                                        value="Current Header Preview"
                                        className="mb-1"
                                    />
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-50 flex items-center justify-center min-h-25">
                                        {headerPreview ? (
                                            <img
                                                src={headerPreview}
                                                alt="Header Preview"
                                                className="max-h-40 object-contain"
                                            />
                                        ) : (
                                            <span className="text-gray-400">
                                                No header image selected
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    <div>
                                        <InputLabel value="Upload New Header" />
                                        <input
                                            type="file"
                                            onChange={handleHeaderChange}
                                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            accept="image/*"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <Checkbox
                                            checked={data.show_header}
                                            onChange={(e) =>
                                                setData(
                                                    "show_header",
                                                    e.target.checked,
                                                )
                                            }
                                        />
                                        <span className="ml-2 text-sm text-gray-600">
                                            Show Header in Prints
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* FOOTER SECTION */}
                            <div className="border-b pb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Footer Configuration
                                </h3>

                                {/* PREVIEW BOX */}
                                <div className="mb-4">
                                    <InputLabel
                                        value="Current Footer Preview"
                                        className="mb-1"
                                    />
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-50 flex items-center justify-center min-h-25">
                                        {footerPreview ? (
                                            <img
                                                src={footerPreview}
                                                alt="Footer Preview"
                                                className="max-h-40 object-contain"
                                            />
                                        ) : (
                                            <span className="text-gray-400">
                                                No footer image selected
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    <div>
                                        <InputLabel value="Upload New Footer" />
                                        <input
                                            type="file"
                                            onChange={handleFooterChange}
                                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            accept="image/*"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <Checkbox
                                            checked={data.show_footer}
                                            onChange={(e) =>
                                                setData(
                                                    "show_footer",
                                                    e.target.checked,
                                                )
                                            }
                                        />
                                        <span className="ml-2 text-sm text-gray-600">
                                            Show Footer in Prints
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <PrimaryButton disabled={processing}>
                                Save Settings
                            </PrimaryButton>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
