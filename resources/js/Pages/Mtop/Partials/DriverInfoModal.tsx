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
                    remove_photo: false,
                    mayor: app.punong_bayan || defaultMayor,
                    committee: app.authorized_official || defaultCommittee,
                    show_committee: false,
                })),
            });
            initialized.current = true;
        }

        if (!show) {
            initialized.current = false;
        }
    }, [show, selectedApps, officials]);

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
        newDrivers[index].remove_photo = false;
        setData("drivers", newDrivers);
    };

    const handleRemovePhoto = (index: number) => {
        const newDrivers = [...data.drivers];
        newDrivers[index].photo = null;
        newDrivers[index].preview = null;
        newDrivers[index].remove_photo = true;
        setData("drivers", newDrivers);
    };

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
                    <title>Encoder Camera Control</title>
                    <script src="https://code.iconify.design/3/3.1.0/iconify.min.js"></script>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        body { margin: 0; overflow: hidden; background: #f9fafb; font-family: ui-sans-serif, system-ui; }
                        .camera-container { position: relative; width: 100%; height: 100%; background: black; display: flex; align-items: center; justify-content: center; overflow: hidden; }
                        #video, #preview-img { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
                        .guide-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 20; }
                        .circle { width: 280px; height: 280px; border: 3px solid rgba(255,255,255,0.5); border-radius: 50%; box-shadow: 0 0 0 1000px rgba(0,0,0,0.4); }
                        #preview-img { display: none; z-index: 10; }
                    </style>
                </head>
                <body>
                    <div class="flex flex-col h-screen">
                        <div class="bg-slate-800 p-4 text-white flex justify-between items-center shadow-lg">
                            <span class="text-xs font-bold uppercase tracking-widest" id="header-title">Encoder Control Panel</span>
                            <button id="cast-btn" class="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-colors">
                                <span class="iconify" data-icon="solar:monitor-camera-bold"></span> Cast to Client Monitor
                            </button>
                        </div>

                        <div class="camera-container flex-1">
                            <video id="video" autoplay playsinline></video>
                            <img id="preview-img" src="" />
                            <div id="guide" class="guide-overlay"><div class="circle"></div></div>
                        </div>

                        <div class="p-6 bg-white border-t">
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
                        const reviewActions = document.getElementById('review-actions');
                        const captureBtn = document.getElementById('capture-btn');

                        let clientWindow = null;

                        async function initCamera() {
                            try {
                                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
                                window.stream = stream;
                                video.srcObject = stream;
                            } catch (e) { alert("Unable to initialize camera."); }
                        }
                        initCamera();

                        document.getElementById('cast-btn').onclick = () => {
                            if (clientWindow && !clientWindow.closed) {
                                clientWindow.focus();
                                return;
                            }
                            clientWindow = window.open('', 'ClientMonitor', 'width=800,height=600,menubar=no,toolbar=no');
                            clientWindow.document.write(\`
                                <html><head><title>Client Monitor View</title></head>
                                <body style="margin:0; background:black; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                                    <video id="c-video" autoplay playsinline style="width:100%; height:100%; object-fit:cover; transform: scaleX(-1);"></video>
                                    <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; pointer-events:none;">
                                        <div style="width:320px; height:320px; border:4px solid rgba(255,255,255,0.6); border-radius:50%; box-shadow: 0 0 0 2000px rgba(0,0,0,0.5);"></div>
                                    </div>
                                </body></html>
                            \`);
                            clientWindow.document.getElementById('c-video').srcObject = window.stream;
                        };

                        captureBtn.onclick = () => {
                            const canvas = document.getElementById('canvas');
                            canvas.width = video.videoWidth; canvas.height = video.videoHeight;

                            const ctx = canvas.getContext('2d');
                            ctx.translate(canvas.width, 0);
                            ctx.scale(-1, 1);
                            ctx.drawImage(video, 0, 0);

                            canvas.toBlob((blob) => {
                                window.currentBlob = blob;
                                previewImg.src = URL.createObjectURL(blob);
                                previewImg.style.display = 'block'; video.style.display = 'none';
                                document.getElementById('guide').style.display = 'none';
                                document.getElementById('header-title').innerText = "Review Capture";
                                captureBtn.classList.add('hidden');
                                reviewActions.classList.remove('hidden');
                                reviewActions.classList.add('flex');
                            }, 'image/png');
                        };

                        document.getElementById('retake-btn').onclick = () => {
                            previewImg.style.display = 'none'; video.style.display = 'block';
                            document.getElementById('guide').style.display = 'flex';
                            document.getElementById('header-title').innerText = "Encoder Control Panel";
                            captureBtn.classList.remove('hidden');
                            reviewActions.classList.add('hidden');
                            reviewActions.classList.remove('flex');
                        };

                        document.getElementById('save-btn').onclick = () => {
                            if (clientWindow) clientWindow.close();
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
                    params.append(
                        `show_committees[${d.id}]`,
                        d.show_committee ? "1" : "0",
                    );
                });
                const url = `${route("mtop.print_ids")}?${params.toString()}`;
                window.open(url, "_blank");
                onClose();
            },
            forceFormData: true,
        });
    };

    const baseMayorOptions = officials
        .filter((o) => o.position === "Punong Bayan")
        .map((o) => `${o.name} | ${o.position}`);

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
        .map((o) => `${o.name} | ${o.position}`);

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
                                    <div className="relative">
                                        <div
                                            className={`transition-all ${!driver.show_committee ? "opacity-50 blur-[0.4px] pointer-events-none" : ""}`}
                                        >
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
                                                required={driver.show_committee}
                                            />
                                        </div>
                                        {!driver.show_committee && (
                                            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none bg-black/5 rounded">
                                                <div className="flex flex-col items-center mt-4">
                                                    <Icon
                                                        icon="solar:lock-password-bold"
                                                        width="24"
                                                        className="text-slate-500"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end pt-1">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDriverChange(
                                                    index,
                                                    "show_committee",
                                                    !driver.show_committee,
                                                )
                                            }
                                            className="flex items-center gap-2 focus:outline-none group"
                                        >
                                            <span
                                                className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${driver.show_committee ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"}`}
                                            >
                                                Print on ID
                                            </span>
                                            <div
                                                className={`w-8 h-4 flex items-center rounded-full p-1 transition-colors duration-300 ${driver.show_committee ? "bg-indigo-600" : "bg-gray-300"}`}
                                            >
                                                <div
                                                    className={`bg-white w-2.5 h-2.5 rounded-full shadow-sm transform transition-transform duration-300 ${driver.show_committee ? "translate-x-3.5" : "translate-x-0"}`}
                                                ></div>
                                            </div>
                                        </button>
                                    </div>
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
