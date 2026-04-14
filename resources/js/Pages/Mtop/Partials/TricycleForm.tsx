//GeronaMTOP\resources\js\Pages\Mtop\Partials\TricycleForm.tsx
import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";
import React, { useState, useEffect } from "react";
import Modal from "@/Components/Modal";

export default function TricycleForm({
    data,
    setData,
    errors,
    onKeyDown,
    suggested_body_number,
    occupied_body_numbers = []
}: any) {
    const isForRegistration = data.plate_no === "FOR REGISTRATION";

    const [noBodyNumber, setNoBodyNumber] = useState(
        data.body_number === "" || data.body_number === null,
    );

    // State for showing the body numbers grid modal
    const [showNumbersModal, setShowNumbersModal] = useState(false);

    // State for the segmented control inside the modal ('all', 'active', 'unused')
    const [filter, setFilter] = useState("all");

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

    // Safely calculate grid limit: Starts at 4000, adds 1000 when exceeded, up to 9999 max
    const maxNumber = occupied_body_numbers && occupied_body_numbers.length > 0
        ? occupied_body_numbers.reduce((max: number, current: number) => max > current ? max : current, 0)
        : 0;

    const calculatedLimit = Math.ceil(maxNumber / 1000) * 1000;
    const gridLimit = Math.min(Math.max(calculatedLimit, 4000), 9999);

    // Calculate Counts
    const activeCount = occupied_body_numbers ? occupied_body_numbers.length : 0;
    const unusedCount = gridLimit - activeCount;
    const totalCount = gridLimit;

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

                    {/* AUTO-ASSIGN, VIEW STATUS (EYE) & TOGGLE ROW */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                        {/* Action Buttons Group */}
                        <div className="flex items-center gap-2">
                            {/* Auto-Assign Button - Matches Eye button size */}
                            {suggested_body_number ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData("body_number", String(suggested_body_number).padStart(4, "0"));
                                        setNoBodyNumber(false);
                                    }}
                                    className="h-8 flex items-center gap-1.5 px-3 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 rounded-lg transition-colors border border-amber-200 focus:outline-none text-[11px] sm:text-xs font-extrabold uppercase tracking-wider shadow-sm"
                                >
                                    <Icon icon="solar:magic-stick-3-bold" width="16" /> Auto-Assign
                                </button>
                            ) : null}

                            {/* View Status Button (Eye Icon Only - Aligned with Preview Button Design) */}
                            <button
                                type="button"
                                onClick={() => setShowNumbersModal(true)}
                                className="h-8 flex items-center justify-center px-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100 shadow-sm focus:outline-none"
                                title="View Active and Unused Body Numbers"
                            >
                                <Icon icon="solar:eye-bold" width="18" />
                            </button>
                        </div>

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

                    {/* For Registration Toggle */}
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

            {/* Body Numbers Status Modal */}
            <Modal
                show={showNumbersModal}
                onClose={() => setShowNumbersModal(false)}
                maxWidth="md"
            >
                <div className="flex flex-col h-[75vh] bg-white rounded-xl overflow-hidden shadow-xl">
                    {/* Header */}
                    <div className="bg-gray-800 px-4 py-3 flex justify-between items-center shrink-0">
                        <span className="text-white font-bold uppercase tracking-wider flex items-center gap-2">
                            <Icon icon="solar:hashtag-square-bold" width="20" /> Body Numbers Status
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowNumbersModal(false)}
                            className="text-white hover:text-gray-300 transition-colors"
                        >
                            <Icon icon="solar:close-circle-bold" width="24" />
                        </button>
                    </div>

                    {/* Dynamic Color-Shifting Filters & Legend */}
                    <div className="p-4 bg-white border-b border-gray-200 flex flex-col gap-3 shrink-0">
                        {/* Toggle Buttons Container */}
                        <div className="flex flex-col sm:flex-row bg-gray-100 p-1.5 rounded-lg gap-1">
                            <button
                                type="button"
                                onClick={() => setFilter('all')}
                                className={`flex-1 py-1.5 text-[11px] sm:text-xs font-bold rounded-md transition-all duration-150 ${filter === 'all'
                                    ? 'bg-gray-800 text-white shadow-md scale-[1.02]'
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'
                                    }`}
                            >
                                All ({totalCount})
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilter('active')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] sm:text-xs font-bold rounded-md transition-all duration-150 ${filter === 'active'
                                    ? 'bg-red-500 text-white shadow-md scale-[1.02]'
                                    : 'text-gray-500 hover:text-red-600 hover:bg-red-100'
                                    }`}
                            >
                                <span className={`w-2.5 h-2.5 rounded-sm transition-colors duration-150 ${filter === 'active' ? 'bg-white shadow-sm' : 'bg-red-400'}`}></span>
                                Active ({activeCount})
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilter('unused')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] sm:text-xs font-bold rounded-md transition-all duration-150 ${filter === 'unused'
                                    ? 'bg-green-500 text-white shadow-md scale-[1.02]'
                                    : 'text-gray-500 hover:text-green-600 hover:bg-green-100'
                                    }`}
                            >
                                <span className={`w-2.5 h-2.5 rounded-sm transition-colors duration-150 ${filter === 'unused' ? 'bg-white shadow-sm' : 'bg-green-400'}`}></span>
                                Unused ({unusedCount})
                            </button>
                        </div>

                        {/* Helper Text */}
                        <div className="text-gray-500 flex items-center gap-1.5 font-medium italic text-[11px] sm:text-xs px-1">
                            <Icon icon="solar:info-circle-bold-duotone" className="text-blue-500 shrink-0" width="16" />
                            Click an available (green) number to instantly assign it.
                        </div>
                    </div>

                    {/* Scrollable Grid - 2 Columns with bold fonts for BOTH */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            {Array.from({ length: gridLimit }, (_, i) => i + 1).map(num => {
                                const isTaken = occupied_body_numbers?.includes(num);

                                // Apply the toggle filter
                                if (filter === 'active' && !isTaken) return null;
                                if (filter === 'unused' && isTaken) return null;

                                return (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => {
                                            if (!isTaken) {
                                                setData("body_number", String(num).padStart(4, "0"));
                                                setNoBodyNumber(false);
                                                setShowNumbersModal(false);
                                            }
                                        }}
                                        disabled={isTaken}
                                        className={`py-3 px-2 w-full text-base sm:text-lg tracking-widest font-mono font-extrabold rounded-xl border-2 transition-all duration-150 ${isTaken
                                            ? 'bg-red-50 text-red-500 border-red-200 cursor-not-allowed opacity-80'
                                            : 'bg-white text-green-700 border-green-300 hover:bg-green-50 hover:border-green-500 hover:-translate-y-0.5 shadow-sm cursor-pointer hover:shadow-md'
                                            }`}
                                        title={isTaken ? `Body Number ${String(num).padStart(4, "0")} is taken` : `Assign Body Number ${String(num).padStart(4, "0")}`}
                                    >
                                        {String(num).padStart(4, "0")}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
