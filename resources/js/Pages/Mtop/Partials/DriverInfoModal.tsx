import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import { FormEventHandler, useEffect, useRef, useState } from "react";
import TextInput from "@/Components/TextInput";
import SignatorySelect from "@/Components/SignatorySelect";

interface Props {
    show: boolean;
    onClose: () => void;
    selectedApps: any[];
    officials: { name: string; position: string }[];
}

export default function DriverInfoModal({
    show,
    onClose,
    selectedApps,
    officials,
}: Props) {
    const { data, setData, post, processing } = useForm({
        drivers: [] as any[],
    });

    // Camera state
    const [cameraIndex, setCameraIndex] = useState<number | null>(null);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

    const initialized = useRef(false);

    // Sync data when modal opens
    useEffect(() => {
        if (show && selectedApps.length > 0 && !initialized.current) {
            const defaultMayor =
                officials.find((o) => o.position === "Punong Bayan")?.name ||
                "";

            const defaultCommittee =
                officials.find(
                    (o) => o.position === "Committee on Transportation",
                )?.name ||
                officials.find((o) => o.position === "Authorized Official")
                    ?.name ||
                "";

            setData({
                drivers: selectedApps.map((app) => ({
                    id: app.id,
                    mt_number: app.mt_number,
                    driver_name:
                        app.driver_name || `${app.first_name} ${app.last_name}`,
                    photo: null as File | null,
                    preview: app.driver_photo_path
                        ? `/storage/${app.driver_photo_path}`
                        : null,
                    mayor: defaultMayor,
                    committee: defaultCommittee,
                })),
            });

            initialized.current = true;
        }

        if (!show) {
            initialized.current = false;
        }
    }, [show]);

    // --- Handlers for driver data ---
    const handleDriverChange = (index: number, field: string, value: any) => {
        const newDrivers = [...data.drivers];
        newDrivers[index][field] = value;
        setData("drivers", newDrivers);
    };

    const handlePhotoChange = (index: number, file: File) => {
        const newDrivers = [...data.drivers];
        newDrivers[index].photo = file;
        newDrivers[index].preview = URL.createObjectURL(file);
        setData("drivers", newDrivers);
    };

    const handleRemovePhoto = (index: number) => {
        const newDrivers = [...data.drivers];
        newDrivers[index].photo = null;
        newDrivers[index].preview = null;
        setData("drivers", newDrivers);
    };

    // --- Camera Functions ---
    const openCamera = async (index: number) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            setCameraStream(stream);
            setCameraIndex(index);
        } catch (err) {
            alert("Camera access denied or not available.");
            console.error(err);
        }
    };

    const capturePhoto = () => {
        if (cameraIndex === null || !cameraStream) return;

        const video = document.querySelector("video") as HTMLVideoElement;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], "driver_photo.png", {
                        type: "image/png",
                    });
                    handlePhotoChange(cameraIndex, file);
                }
            });
        }
        closeCamera();
    };

    const closeCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop());
        }
        setCameraStream(null);
        setCameraIndex(null);
    };

    // --- Form Navigation Logic ---
    const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();

            const form = e.currentTarget;
            const focusableElements = Array.from(
                form.querySelectorAll(
                    'input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])',
                ),
            ) as HTMLElement[];

            const activeElement = document.activeElement as HTMLElement;
            const currentIndex = focusableElements.indexOf(activeElement);

            if (currentIndex > -1) {
                if (currentIndex < focusableElements.length - 1) {
                    focusableElements[currentIndex + 1].focus();
                } else {
                    submit(e as unknown as React.FormEvent);
                }
            }
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("mtop.update_driver"), {
            onSuccess: () => {
                const params = new URLSearchParams();
                params.append("ids", data.drivers.map((d) => d.id).join(","));
                data.drivers.forEach((d) => {
                    params.append(`mayors[${d.id}]`, d.mayor);
                    params.append(`committees[${d.id}]`, d.committee);
                });

                const url = `${route("mtop.print_ids")}?${params.toString()}`;
                window.open(url, "_blank");
                onClose();
            },
            forceFormData: true,
        });
    };

    const mayorOptions = officials
        .filter((o) => o.position === "Punong Bayan")
        .map((o) => o.name);
    const committeeOptions = officials
        .filter(
            (o) =>
                o.position === "Committee on Transportation" ||
                o.position === "Authorized Official",
        )
        .map((o) => o.name);

    return (
        <Modal show={show} onClose={onClose} maxWidth="xl">
            <form
                onSubmit={submit}
                onKeyDown={handleFormKeyDown}
                className="p-6 flex flex-col h-[85vh]"
            >
                {/* HEADER */}
                <div className="flex justify-between items-center mb-6 shrink-0 border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Icon
                            icon="solar:printer-bold"
                            className="text-blue-600"
                        />
                        Print Setup ({data.drivers.length} IDs)
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <Icon icon="solar:close-circle-bold" width="28" />
                    </button>
                </div>

                {/* DRIVER LIST */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-4">
                    {data.drivers.map((driver, index) => (
                        <div
                            key={driver.id}
                            className="flex flex-col sm:flex-row gap-6 p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow relative"
                        >
                            {/* CARD NUMBER */}
                            <div className="absolute bottom-0 left-0 bg-gray-100 text-gray-400 font-black text-4xl px-3 py-1 rounded-tr-xl rounded-bl-xl select-none z-0 opacity-50">
                                #{index + 1}
                            </div>

                            {/* LEFT: PHOTO */}
                            <div className="shrink-0 flex flex-col items-center gap-3 w-full sm:w-40 border-b sm:border-b-0 sm:border-r border-gray-100 pb-4 sm:pb-0 sm:pr-6 z-10">
                                <div className="w-32 h-32 bg-gray-50 border-2 border-gray-300 border-dashed rounded-lg flex items-center justify-center overflow-hidden relative group">
                                    {driver.preview ? (
                                        <img
                                            src={driver.preview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center text-gray-300">
                                            <Icon
                                                icon="solar:camera-add-bold"
                                                width="40"
                                                className="mx-auto mb-1"
                                            />
                                            <span className="text-[10px] font-bold uppercase">
                                                No Photo
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* UPLOAD / REMOVE / CAPTURE BUTTONS */}
                                <div className="flex gap-2 w-full">
                                    {/* UPLOAD BUTTON */}
                                    <label className="flex-1 text-center cursor-pointer bg-blue-50 text-blue-600 border border-blue-100 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95">
                                        Upload
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="user" // ✅ FORCES LOCAL WEBCAM/CAMERA OVER PHONE LINK
                                            className="hidden"
                                            onChange={(e) =>
                                                e.target.files &&
                                                handlePhotoChange(
                                                    index,
                                                    e.target.files[0],
                                                )
                                            }
                                        />
                                    </label>

                                    {/* REMOVE BUTTON */}
                                    {driver.preview && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemovePhoto(index)
                                            }
                                            className="mt-0 flex-1 text-center cursor-pointer bg-red-50 text-red-600 border border-red-100 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                {/* CAPTURE BUTTON BELOW */}
                                <div className="mt-0 w-full">
                                    <button
                                        type="button"
                                        onClick={() => openCamera(index)}
                                        className="w-full text-center cursor-pointer bg-green-50 text-green-600 border border-green-100 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95"
                                    >
                                        Capture
                                    </button>
                                </div>
                            </div>

                            {/* RIGHT: DETAILS */}
                            <div className="flex-1 flex flex-col gap-4 z-10 pt-2 sm:pt-0">
                                <div className="flex items-center justify-end gap-3 border-b border-gray-100 pb-2">
                                    <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
                                        MTOP: {driver.mt_number}
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ">
                                        Driver Name
                                    </label>
                                    <TextInput
                                        className="w-full px-3 py-3"
                                        value={driver.driver_name}
                                        onChange={(e) =>
                                            handleDriverChange(
                                                index,
                                                "driver_name",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Enter Driver Name"
                                    />
                                </div>

                                <div>
                                    <SignatorySelect
                                        label="Committee on Transportation"
                                        value={driver.committee}
                                        onChange={(val) =>
                                            handleDriverChange(
                                                index,
                                                "committee",
                                                val,
                                            )
                                        }
                                        options={committeeOptions}
                                        required
                                    />
                                </div>

                                <div>
                                    <SignatorySelect
                                        label="Municipal Mayor"
                                        value={driver.mayor}
                                        onChange={(val) =>
                                            handleDriverChange(
                                                index,
                                                "mayor",
                                                val,
                                            )
                                        }
                                        options={mayorOptions}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FOOTER BUTTONS */}
                <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100 shrink-0">
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton
                        type="submit"
                        disabled={processing}
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-md transition-transform hover:scale-105"
                    >
                        <Icon icon="solar:printer-bold" className="mr-2" />
                        Save & Print
                    </PrimaryButton>
                </div>
            </form>

            {/* CAMERA MODAL */}
            {cameraStream && cameraIndex !== null && (
                <Modal show={true} onClose={closeCamera} maxWidth="md">
                    <div className="flex flex-col items-center p-6">
                        <div className="relative w-full h-[450px] bg-black rounded-xl overflow-hidden">
                            <video
                                ref={(el) => {
                                    if (el && cameraStream) {
                                        el.srcObject = cameraStream;
                                        el.play();
                                    }
                                }}
                                className="w-full h-full object-cover"
                            />

                            {/* DARK OVERLAY */}
                            <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                type="button"
                                className="px-4 py-2 bg-green-600 text-white rounded"
                                onClick={capturePhoto}
                            >
                                Capture Photo
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
                                onClick={closeCamera}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </Modal>
    );
}
