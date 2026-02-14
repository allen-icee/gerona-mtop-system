import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import PrimaryButton from "@/Components/PrimaryButton";
import InputLabel from "@/Components/InputLabel";
import Checkbox from "@/Components/Checkbox";

export default function PrintLayout({ settings }: { settings: any }) {
    const { data, setData, post, processing, errors } = useForm({
        header: null as File | null,
        footer: null as File | null,
        show_header: settings.show_header ?? true,
        show_footer: settings.show_footer ?? false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("settings.print.update"));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Print Layout Settings
                </h2>
            }
        >
            <Head title="Print Layout Settings" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6">
                            {/* Header Settings */}
                            <div>
                                <InputLabel value="Header Image" />
                                <input
                                    type="file"
                                    onChange={(e) =>
                                        setData(
                                            "header",
                                            e.target.files
                                                ? e.target.files[0]
                                                : null,
                                        )
                                    }
                                    className="mt-1 block w-full"
                                />
                                <div className="mt-2 flex items-center">
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

                            {/* Footer Settings */}
                            <div>
                                <InputLabel value="Footer Image" />
                                <input
                                    type="file"
                                    onChange={(e) =>
                                        setData(
                                            "footer",
                                            e.target.files
                                                ? e.target.files[0]
                                                : null,
                                        )
                                    }
                                    className="mt-1 block w-full"
                                />
                                <div className="mt-2 flex items-center">
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
