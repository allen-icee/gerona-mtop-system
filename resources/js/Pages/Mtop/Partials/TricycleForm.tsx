//GeronaMTOP\resources\js\Pages\Mtop\Partials\TricycleForm.tsx
import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";
import React, { useState, useEffect } from "react";

export default function TricycleForm({
    data,
    setData,
    errors,
    onKeyDown,
    suggested_body_number
}: any) {
    const isForRegistration = data.plate_no === "FOR REGISTRATION";

    const [noBodyNumber, setNoBodyNumber] = useState(
        data.body_number === "" || data.body_number === null,
    );

    useEffect(() => {
        setNoBodyNumber(data.body_number === "" || data.body_number === null);
    }, [data.body_number]);

    const toggleForRegistration = () => {
        if (!isForRegistration) {
            setData("plate_no", "FOR REGISTRATION");
        } else {
            setData("plate_no", "");
        }
    };

    const toggleNoBodyNumber = () => {
        const newVal = !noBodyNumber;
        setNoBodyNumber(newVal);
        if (newVal) {
            setData("body_number", "");
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-700 border-b border-green-300 pb-1">
                <h3 className="font-extrabold text-base uppercase tracking-wide">
                    Tricycle Unit Details
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="space-y-2">
                    <InputGroup
                        id="body_number"
                        label="Sidecar Number"
                        name="body_number"
                        value={data.body_number || ""}
                        onChange={(e: any) => {
                            // Limits input to 4 digits maximum while typing
                            setData(
                                "body_number",
                                e.target.value.replace(/\D/g, "").slice(0, 4),
                            );
                        }}
                        onBlur={(e: any) => {
                            // Automatically pads with zeros when the user clicks away
                            if (e.target.value) {
                                setData(
                                    "body_number",
                                    String(e.target.value).padStart(4, "0")
                                );
                            }
                        }}
                        error={errors.body_number}
                        icon="solar:hashtag-square-bold"
                        placeholder={noBodyNumber ? "N/A" : "0001"}
                        required={false}
                        onKeyDown={onKeyDown}
                        disabled={noBodyNumber}
                        className={
                            noBodyNumber ? "bg-gray-100 text-gray-400" : ""
                        }
                    />

                    {/* AUTO-ASSIGN & TOGGLE ROW (Improved Layout) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                        {/* Auto-Assign Button */}
                        {suggested_body_number ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setData("body_number", String(suggested_body_number).padStart(4, "0"));
                                    setNoBodyNumber(false);
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 rounded-md transition-colors border border-blue-200 focus:outline-none text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shadow-sm"
                            >
                                <Icon icon="solar:magic-stick-3-bold" width="14" /> Auto-Assign
                            </button>
                        ) : (
                            <div></div> // Empty div to keep the flex layout balanced if no suggestion exists
                        )}

                        {/* No Body Number Toggle */}
                        <button
                            type="button"
                            onClick={toggleNoBodyNumber}
                            className="flex items-center gap-2 focus:outline-none group cursor-pointer px-1"
                        >
                            <span
                                className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${noBodyNumber ? "text-indigo-800" : "text-gray-700 group-hover:text-gray-900"}`}
                            >
                                No Body Number
                            </span>
                            <div
                                className={`w-8 h-4 flex items-center rounded-full p-1 transition-colors duration-300 shadow-inner ${noBodyNumber ? "bg-indigo-800" : "bg-gray-500 group-hover:bg-gray-600"}`}
                            >
                                <div
                                    className={`bg-white w-2.5 h-2.5 rounded-full shadow-md transform transition-transform duration-300 ${noBodyNumber ? "translate-x-3.5" : "translate-x-0"}`}
                                ></div>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <InputGroup
                        id="plate_no"
                        label="Plate Number"
                        name="plate_no"
                        value={data.plate_no || ""}
                        onChange={(e: any) => {
                            const val = e.target.value
                                .toUpperCase()
                                .replace(/[^A-Z0-9]/g, "")
                                .slice(0, 8);
                            setData("plate_no", val);
                        }}
                        error={errors.plate_no}
                        icon="solar:plate-bold"
                        placeholder={
                            isForRegistration ? "FOR REGISTRATION" : "123ABC"
                        }
                        maxLength={8}
                        onKeyDown={onKeyDown}
                        readOnly={isForRegistration}
                        className={
                            isForRegistration
                                ? "bg-indigo-50 text-indigo-700 font-bold"
                                : ""
                        }
                    />

                    {/* For Registration Toggle (Improved Padding) */}
                    <div className="flex justify-end pt-2 px-1">
                        <button
                            type="button"
                            onClick={toggleForRegistration}
                            className="flex items-center gap-2 focus:outline-none group cursor-pointer"
                        >
                            <span
                                className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${isForRegistration ? "text-indigo-800" : "text-gray-700 group-hover:text-gray-900"}`}
                            >
                                For Registration
                            </span>
                            <div
                                className={`w-8 h-4 flex items-center rounded-full p-1 transition-colors duration-300 shadow-inner ${isForRegistration ? "bg-indigo-800" : "bg-gray-500 group-hover:bg-gray-600"}`}
                            >
                                <div
                                    className={`bg-white w-2.5 h-2.5 rounded-full shadow-md transform transition-transform duration-300 ${isForRegistration ? "translate-x-3.5" : "translate-x-0"}`}
                                ></div>
                            </div>
                        </button>
                    </div>
                </div>

                <InputGroup
                    id="make_type"
                    label="Make / Type"
                    name="make_type"
                    value={data.make_type || ""}
                    onChange={(e: any) => {
                        const val = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9\s.-]/g, "");
                        setData("make_type", val);
                    }}
                    error={errors.make_type}
                    icon="solar:box-minimalistic-bold"
                    placeholder="HONDA TMX"
                    required={true}
                    onKeyDown={onKeyDown}
                />

                <InputGroup
                    id="engine_motor_no"
                    label="Engine Motor No."
                    name="engine_motor_no"
                    value={data.engine_motor_no || ""}
                    onChange={(e: any) => {
                        const val = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9-]/g, "");
                        setData("engine_motor_no", val);
                    }}
                    error={errors.engine_motor_no}
                    icon="solar:settings-bold"
                    placeholder="ENG-12345"
                    required={true}
                    onKeyDown={onKeyDown}
                />

                <InputGroup
                    id="chassis_no"
                    label="Chassis No."
                    name="chassis_no"
                    value={data.chassis_no || ""}
                    onChange={(e: any) => {
                        const val = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9-]/g, "");
                        setData("chassis_no", val);
                    }}
                    error={errors.chassis_no}
                    icon="solar:structure-bold"
                    placeholder="CHA-67890"
                    required={true}
                    onKeyDown={onKeyDown}
                />
            </div>
        </div>
    );
}
