//GeronaMTOP\resources\js\Pages\Mtop\Partials\CedulaForm.tsx
import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";

export default function CedulaForm({ data, setData, errors, onKeyDown }: any) {
    const toggleShowCedula = () => {
        setData("show_cedula", !data.show_cedula);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-orange-200 pb-1">
                <h3 className="font-extrabold text-base uppercase tracking-wide text-orange-700">
                    Cedula Details
                </h3>
                <button
                    type="button"
                    onClick={toggleShowCedula}
                    className="flex items-center gap-2 focus:outline-none group cursor-pointer"
                >
                    <div
                        className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 shadow-inner ${data.show_cedula ? "bg-indigo-800" : "bg-gray-500 group-hover:bg-gray-600"
                            }`}
                    >
                        <div
                            className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-300 ${data.show_cedula ? "translate-x-4" : "translate-x-0"
                                }`}
                        ></div>
                    </div>
                </button>
            </div>

            <div className="relative mt-2">
                <div
                    className={`grid grid-cols-1 gap-2 p-2 rounded-xl bg-white transition-all ${!data.show_cedula ? "opacity-50 blur-[0.4px] pointer-events-none" : ""}`}
                >
                    <InputGroup
                        id="cedula_number"
                        label="Cedula No."
                        name="cedula_number"
                        value={data.cedula_number}
                        onChange={(e: any) => {
                            const val = e.target.value
                                .toUpperCase()
                                .replace(/[^A-Z0-9-]/g, "");
                            setData("cedula_number", val);
                        }}
                        icon="solar:hashtag-square-bold"
                        placeholder="e.g. 12345678"
                        required={data.show_cedula}
                        disabled={!data.show_cedula}
                        onKeyDown={onKeyDown}
                    />
                    <InputGroup
                        id="cedula_date"
                        label="Date Issued"
                        name="cedula_date"
                        type="date"
                        max="9999-12-31"
                        value={data.cedula_date}
                        onChange={(e: any) =>
                            setData("cedula_date", e.target.value)
                        }
                        icon="solar:calendar-date-bold"
                        required={data.show_cedula}
                        disabled={!data.show_cedula}
                        onKeyDown={onKeyDown}
                    />
                </div>

                {!data.show_cedula && (
                    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none bg-black/5 rounded">
                        <div className="flex flex-col items-center">
                            <Icon
                                icon="solar:eye-closed-bold"
                                width="40"
                                className="text-slate-400"
                            />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                                Hidden From Print
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
