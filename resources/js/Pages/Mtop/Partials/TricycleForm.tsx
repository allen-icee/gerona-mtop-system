import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";

export default function TricycleForm({
    data,
    setData,
    errors,
    onKeyDown,
}: any) {
    // Helper to toggle "FOR REGISTRATION"
    const toggleForRegistration = (checked: boolean) => {
        if (checked) {
            setData("plate_no", "FOR REGISTRATION");
        } else {
            setData("plate_no", "");
        }
    };

    // Helper to toggle No Body Number (Clear it)
    const toggleNoBodyNumber = (checked: boolean) => {
        if (checked) {
            setData("body_number", "");
        }
    };

    const isForRegistration = data.plate_no === "FOR REGISTRATION";
    // We assume "No Body Number" mode if the field is empty,
    // but for the checkbox UI, we can just check if it's empty to show it checked?
    // Or better, let the user check it to force clear it.
    // Actually, simpler: If they check "No Body Number", we disable the input.
    const [noBodyNumber, setNoBodyNumber] = React.useState(false);

    // Sync local state if data loads with empty body number (optional, but good for UX)
    // For now, let's just let the checkbox control the "disabled" state.

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-gray-800 border-b border-gray-200 pb-2">
                <Icon
                    icon="solar:wheel-bold"
                    className="text-green-600"
                    width="20"
                />
                <h3 className="font-bold text-base uppercase tracking-wide">
                    Tricycle Unit Details
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* BODY NUMBER */}
                <div className="space-y-2">
                    <InputGroup
                        id="body_number"
                        label="Body Number (MTOP)"
                        name="body_number"
                        value={data.body_number}
                        onChange={(e: any) => {
                            setData(
                                "body_number",
                                e.target.value.replace(/\D/g, ""),
                            );
                        }}
                        error={errors.body_number}
                        icon="solar:hashtag-square-bold"
                        placeholder={noBodyNumber ? "N/A" : "1234"}
                        required={!noBodyNumber}
                        onKeyDown={onKeyDown}
                        disabled={noBodyNumber}
                    />
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="no_body_num"
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 cursor-pointer"
                            checked={noBodyNumber}
                            onChange={(e) => {
                                setNoBodyNumber(e.target.checked);
                                if (e.target.checked) {
                                    setData("body_number", "");
                                }
                            }}
                        />
                        <label
                            htmlFor="no_body_num"
                            className="ml-2 text-sm text-gray-600 cursor-pointer select-none"
                        >
                            No Body Number yet
                        </label>
                    </div>
                </div>

                {/* PLATE NUMBER */}
                <div className="space-y-2">
                    <InputGroup
                        id="plate_no"
                        label="Plate Number"
                        name="plate_no"
                        value={data.plate_no}
                        onChange={(e: any) => {
                            const val = e.target.value
                                .toUpperCase()
                                .replace(/[^A-Z0-9]/g, "");
                            setData("plate_no", val);
                        }}
                        error={errors.plate_no}
                        icon="solar:plate-bold"
                        placeholder="123ABC"
                        required={true}
                        onKeyDown={onKeyDown}
                        readOnly={isForRegistration}
                        className={
                            isForRegistration ? "bg-gray-100 text-gray-500" : ""
                        }
                    />
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="for_reg"
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 cursor-pointer"
                            checked={isForRegistration}
                            onChange={(e) =>
                                toggleForRegistration(e.target.checked)
                            }
                        />
                        <label
                            htmlFor="for_reg"
                            className="ml-2 text-sm text-gray-600 cursor-pointer select-none"
                        >
                            For Registration
                        </label>
                    </div>
                </div>

                {/* Other Fields - Unchanged */}
                <InputGroup
                    id="make_type"
                    label="Make / Type"
                    name="make_type"
                    value={data.make_type}
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
                    value={data.engine_motor_no}
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
                    value={data.chassis_no}
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

// Need to import React for useState
import React from "react";
