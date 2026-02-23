//GeronaMTOP\resources\js\Pages\Mtop\Partials\DriverInfoModal.tsx
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import { FormEventHandler, useEffect, useRef, useState } from "react";
import TextInput from "@/Components/TextInput";
import SignatorySelect from "@/Components/SignatorySelect";
import toast from "react-hot-toast";

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

    const [cameraIndex, setCameraIndex] = useState<number | null>(null);
    const initialized = useRef(false);

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
                    // Fix 1: Prioritize the app's saved signatories before falling back to system defaults
                    mayor: app.punong_bayan || defaultMayor,
                    committee: app.authorized_official || defaultCommittee,
                })),
            });
            initialized.current = true;
        }

        if (!show) {
            initialized.current = false;
        }
    }, [show, selectedApps, officials]);

    // Listen for the image data sent back from the separate camera window
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === "CAMERA_CAPTURE" && cameraIndex !== null) {
                const base64Data = event.data.imageData;

                fetch(base64Data)
                    .then((res) => res.blob())
                    .then((blob) => {
                        const file = new File([blob], "driver_photo.png", {
                            type: "image/png",
                        });
                        handlePhotoChange(cameraIndex, file);
                    });
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [cameraIndex]);

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

    // OPENS A COMPLETELY NEW WINDOW
    const openCamera = async (index: number) => {
        const isSecure =
            window.isSecureContext ||
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1";

        if (!isSecure) {
            toast.error(
                "Camera access is restricted on this client. Please use the Main Application Server to capture photos.",
                { duration: 5000 },
            );
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            stream.getTracks().forEach((track) => track.stop());
        } catch (err) {
            toast.error(
                "Permission was not granted. Please allow camera access to use this feature.",
            );
            return;
        }

        setCameraIndex(index);

        const width = 500;
        const height = 750;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const camWindow = window.open(
            "",
            "CameraCapture",
            `width=${width},height=${height},left=${left},top=${top},menubar=no,status=no,toolbar=no`,
        );

        if (camWindow) {
            camWindow.document.write(`
                <html>
                <head>
                    <title>Secure Photo Capture</title>
                    <script src="https://code.iconify.design/3/3.1.0/iconify.min.js"></script>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        body { margin: 0; overflow: hidden; background: #f9fafb; font-family: ui-sans-serif, system-ui; }
                        .camera-container { position: relative; width: 100%; height: 100%; background: black; display: flex; align-items: center; justify-content: center; overflow: hidden; }
                        #video, #preview-img { width: 100%; height: 100%; object-fit: cover; }
                        .guide-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 20; }
                        .circle { width: 280px; height: 280px; border: 3px solid rgba(255,255,255,0.5); border-radius: 50%; box-shadow: 0 0 0 1000px rgba(0,0,0,0.4); }
                        #preview-img { display: none; z-index: 10; }
                        .floating-btn { position: absolute; z-index: 50; background: rgba(0, 0, 0, 0.5); color: white; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; transition: all 0.2s; }
                        .floating-btn:hover { background: rgba(59, 130, 246, 0.8); }
                        .btn-switch { top: 1rem; right: 1rem; }
                    </style>
                </head>
                <body>
                    <div class="flex flex-col h-screen">
                        <div class="bg-slate-800 p-4 text-white flex justify-between items-center shadow-lg">
                            <span class="text-xs font-bold uppercase tracking-widest" id="header-title">Secure Photo Capture</span>
                            <span class="iconify" data-icon="solar:camera-bold"></span>
                        </div>

                        <div class="camera-container flex-1">
                            <button id="switch-btn" class="floating-btn btn-switch" style="display: none;">
                                <span class="iconify text-2xl" data-icon="solar:camera-rotate-bold"></span>
                            </button>
                            <video id="video" autoplay playsinline></video>
                            <img id="preview-img" src="" />
                            <div id="guide" class="guide-overlay"><div class="circle"></div></div>
                        </div>

                        <div class="p-6 bg-white border-t">
                            <div id="instruction-box" class="mb-5 flex items-center gap-3 text-blue-700 bg-blue-50 px-4 py-3 rounded-lg border border-blue-100 shadow-sm">
                                <span class="iconify text-lg" data-icon="solar:info-circle-bold"></span>
                                <span class="text-xs font-medium leading-tight">Please align the subject's face within the guide for optimal photo quality.</span>
                            </div>
                            <button id="capture-btn" class="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                                <span class="iconify" data-icon="solar:camera-minimalistic-bold"></span> Take Photo
                            </button>
                            <div id="review-actions" class="hidden gap-3">
                                <button id="retake-btn" class="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2">
                                    <span class="iconify" data-icon="solar:refresh-bold"></span> Retake
                                </button>
                                <button id="save-btn" class="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                                    <span class="iconify" data-icon="solar:check-circle-bold"></span> Save Photo
                                </button>
                            </div>
                        </div>
                    </div>
                    <canvas id="canvas" style="display:none;"></canvas>
                    <script>
                        const video = document.getElementById('video');
                        const previewImg = document.getElementById('preview-img');
                        const switchBtn = document.getElementById('switch-btn');
                        const reviewActions = document.getElementById('review-actions');
                        const captureBtn = document.getElementById('capture-btn');
                        let videoDevices = [];
                        let currentDeviceIndex = 0;

                        async function initCamera(deviceId) {
                            try {
                                if (window.stream) { window.stream.getTracks().forEach(t => t.stop()); }
                                const stream = await navigator.mediaDevices.getUserMedia({
                                    video: { deviceId: deviceId ? { exact: deviceId } : undefined, width: 1280, height: 720 }
                                });
                                window.stream = stream;
                                video.srcObject = stream;
                                const devices = await navigator.mediaDevices.enumerateDevices();
                                videoDevices = devices.filter(d => d.kind === 'videoinput');
                                if (videoDevices.length > 1) switchBtn.style.display = 'flex';
                            } catch (e) { alert("Unable to initialize camera. Please verify device connection."); }
                        }

                        initCamera();

                        switchBtn.onclick = () => {
                            currentDeviceIndex = (currentDeviceIndex + 1) % videoDevices.length;
                            initCamera(videoDevices[currentDeviceIndex].deviceId);
                        };

                        captureBtn.onclick = () => {
                            const canvas = document.getElementById('canvas');
                            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
                            canvas.getContext('2d').drawImage(video, 0, 0);
                            canvas.toBlob((blob) => {
                                window.currentBlob = blob;
                                previewImg.src = URL.createObjectURL(blob);
                                previewImg.style.display = 'block'; video.style.display = 'none';
                                document.getElementById('guide').style.display = 'none';
                                document.getElementById('instruction-box').style.display = 'none';
                                document.getElementById('header-title').innerText = "Review Capture";
                                switchBtn.style.display = 'none';
                                captureBtn.classList.add('hidden');
                                reviewActions.classList.remove('hidden');
                                reviewActions.classList.add('flex');
                            }, 'image/png');
                        };

                        document.getElementById('retake-btn').onclick = () => {
                            previewImg.style.display = 'none'; video.style.display = 'block';
                            document.getElementById('guide').style.display = 'flex';
                            document.getElementById('instruction-box').style.display = 'flex';
                            document.getElementById('header-title').innerText = "Photo Capture";
                            if (videoDevices.length > 1) switchBtn.style.display = 'flex';
                            captureBtn.classList.remove('hidden');
                            reviewActions.classList.add('hidden');
                            reviewActions.classList.remove('flex');
                        };

                        document.getElementById('save-btn').onclick = () => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                window.opener.postMessage({ type: 'CAMERA_CAPTURE', imageData: reader.result }, "*");
                                window.close();
                            };
                            reader.readAsDataURL(window.currentBlob);
                        };
                    </script>
                </body>
                </html>
            `);
        }
    };

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

    // Fix 2: Dynamically include customized values into the options array
    // so the HTML <select> allows them to be displayed and chosen
    const baseMayorOptions = officials
        .filter((o) => o.position === "Punong Bayan")
        .map((o) => o.name);

    const customMayors = data.drivers.map((d) => d.mayor).filter(Boolean);
    const mayorOptions = Array.from(
        new Set([...baseMayorOptions, ...customMayors]),
    );

    const baseCommitteeOptions = officials
        .filter(
            (o) =>
                o.position === "Committee on Transportation" ||
                o.position === "Authorized Official",
        )
        .map((o) => o.name);

    const customCommittees = data.drivers
        .map((d) => d.committee)
        .filter(Boolean);
    const committeeOptions = Array.from(
        new Set([...baseCommitteeOptions, ...customCommittees]),
    );

    return (
        <Modal show={show} onClose={onClose} maxWidth="xl">
            <form
                onSubmit={submit}
                onKeyDown={handleFormKeyDown}
                className="p-6 flex flex-col h-[85vh]"
            >
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

                <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-4">
                    {data.drivers.map((driver, index) => (
                        <div
                            key={driver.id}
                            className="flex flex-col sm:flex-row gap-6 p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow relative"
                        >
                            <div className="absolute bottom-0 left-0 bg-gray-100 text-gray-400 font-black text-4xl px-3 py-1 rounded-tr-xl rounded-bl-xl select-none z-0 opacity-50">
                                #{index + 1}
                            </div>

                            <div className="shrink-0 flex flex-col items-center gap-3 w-full sm:w-40 border-b sm:border-b-0 sm:border-r border-gray-100 pb-4 sm:pb-0 sm:pr-6 z-10">
                                <div className="flex items-center justify-end gap-3">
                                    <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
                                        MTOP: {driver.mt_number}
                                    </span>
                                </div>
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

                                <div className="flex gap-2 w-full">
                                    <label className="flex-1 text-center cursor-pointer bg-blue-50 text-blue-600 border border-blue-100 py-2 rounded-md text-xs font-bold uppercase tracking-wide hover:scale-105 active:scale-95">
                                        Upload
                                        <input
                                            type="file"
                                            accept="image/*"
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
                                    {driver.preview && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemovePhoto(index)
                                            }
                                            className="flex-1 text-center cursor-pointer bg-red-50 text-red-600 border border-red-100 py-2 rounded-md text-xs font-bold uppercase tracking-wide hover:scale-105 active:scale-95"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className="w-full">
                                    <button
                                        type="button"
                                        onClick={() => openCamera(index)}
                                        className="w-full text-center bg-green-50 text-green-600 border border-green-100 py-2 rounded-md text-xs font-bold uppercase tracking-wide hover:scale-105 active:scale-95"
                                    >
                                        Capture
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col gap-4 z-10 pt-2 sm:pt-0">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        Driver Name
                                    </label>
                                    <TextInput
                                        type="text"
                                        value={driver.driver_name}
                                        onChange={(e) =>
                                            handleDriverChange(
                                                index,
                                                "driver_name",
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        className="w-full py-2.5 pl-2"
                                        placeholder="Enter driver name"
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

                <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100 shrink-0">
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton
                        type="submit"
                        disabled={processing}
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-md transition-transform hover:scale-105 cursor-pointer"
                    >
                        <Icon icon="solar:printer-bold" className="mr-2" />
                        Save & Print
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
