//GeronaMTOP\resources\js\Pages\Mtop\Partials\TricycleForm.tsx
import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";
import React, { useState, useEffect } from "react";

export default function TricycleForm({
    data,
    setData,
    errors,
    onKeyDown,
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
                            setData(
                                "body_number",
                                e.target.value.replace(/\D/g, "").slice(0, 5),
                            );
                        }}
                        error={errors.body_number}
                        icon="solar:hashtag-square-bold"
                        placeholder={noBodyNumber ? "N/A" : "1234"}
                        required={false}
                        onKeyDown={onKeyDown}
                        disabled={noBodyNumber}
                        className={
                            noBodyNumber ? "bg-gray-100 text-gray-400" : ""
                        }
                    />
                    <div className="flex justify-end pt-1">
                        <button
                            type="button"
                            onClick={toggleNoBodyNumber}
                            className="flex items-center gap-2 focus:outline-none group cursor-pointer"
                        >
                            <span
                                className={`text-xs font-bold uppercase tracking-wider transition-colors ${noBodyNumber ? "text-indigo-800" : "text-gray-700 group-hover:text-gray-900"}`}
                            >
                                No Body Number
                            </span>
                            <div
                                className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 shadow-inner ${noBodyNumber ? "bg-indigo-800" : "bg-gray-500 group-hover:bg-gray-600"}`}
                            >
                                <div
                                    className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-300 ${noBodyNumber ? "translate-x-4" : "translate-x-0"}`}
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
                    <div className="flex justify-end pt-1">
                        <button
                            type="button"
                            onClick={toggleForRegistration}
                            className="flex items-center gap-2 focus:outline-none group cursor-pointer"
                        >
                            <span
                                className={`text-xs font-bold uppercase tracking-wider transition-colors ${isForRegistration ? "text-indigo-800" : "text-gray-700 group-hover:text-gray-900"}`}
                            >
                                For Registration
                            </span>
                            <div
                                className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 shadow-inner ${isForRegistration ? "bg-indigo-800" : "bg-gray-500 group-hover:bg-gray-600"}`}
                            >
                                <div
                                    className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-300 ${isForRegistration ? "translate-x-4" : "translate-x-0"}`}
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
