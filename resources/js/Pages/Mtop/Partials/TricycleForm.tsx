//GeronaMTOP\resources\js\Pages\Mtop\Partials\TricycleForm.tsx
import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";
import React, { useState, useEffect, useMemo } from "react";
import Modal from "@/Components/Modal";
import { createPortal } from "react-dom";

export default function TricycleForm({
    data,
    setData,
    errors,
    onKeyDown,
    suggested_body_number,
    occupied_body_numbers = {}
}: any) {
    const isForRegistration = data.plate_no === "FOR REGISTRATION";

    const [noBodyNumber, setNoBodyNumber] = useState(
        data.body_number === "" || data.body_number === null,
    );

    const [showNumbersModal, setShowNumbersModal] = useState(false);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 100;
    const [tooltip, setTooltip] = useState({ show: false, num: 0, isTaken: false, owner: "", x: 0, y: 0 });

    useEffect(() => {
        setNoBodyNumber(data.body_number === "" || data.body_number === null);
    }, [data.body_number]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

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

    const isOldArrayFormat = Array.isArray(occupied_body_numbers);
    const activeNumbers = useMemo(() => {
        return isOldArrayFormat
            ? occupied_body_numbers
            : Object.keys(occupied_body_numbers || {}).map(Number);
    }, [occupied_body_numbers, isOldArrayFormat]);

    const activeNumbersSet = useMemo(() => new Set(activeNumbers), [activeNumbers]);

    const isBodyNumberTaken = useMemo(() => {
        if (!data.body_number) return false;
        const num = parseInt(data.body_number, 10);
        return activeNumbersSet.has(num);
    }, [data.body_number, activeNumbersSet]);

    const maxNumber = activeNumbers.length > 0 ? Math.max(...activeNumbers) : 0;
    const calculatedLimit = Math.ceil(maxNumber / 1000) * 1000;
    const gridLimit = Math.min(Math.max(calculatedLimit, 4000), 9999);

    const visibleNumbers = useMemo(() => {
        const nums = [];
        const lowerSearch = searchQuery.toLowerCase().trim();

        for (let num = 1; num <= gridLimit; num++) {
            const isTaken = activeNumbersSet.has(num);
            if (filter === 'active' && !isTaken) continue;
            if (filter === 'unused' && isTaken) continue;

            if (lowerSearch) {
                const paddedNum = String(num).padStart(4, "0");
                const ownerName = isOldArrayFormat ? "" : (occupied_body_numbers[num] || occupied_body_numbers[String(num)] || "");

                const matchesNum = paddedNum.includes(lowerSearch);
                const matchesOwner = ownerName.toLowerCase().includes(lowerSearch);

                if (!matchesNum && !matchesOwner) {
                    continue;
                }
            }
            nums.push(num);
        }
        return nums;
    }, [gridLimit, filter, activeNumbersSet, searchQuery, isOldArrayFormat, occupied_body_numbers]);

    const totalPages = Math.ceil(visibleNumbers.length / ITEMS_PER_PAGE) || 1;
    const paginatedNumbers = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return visibleNumbers.slice(start, end);
    }, [visibleNumbers, currentPage]);

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);
        setCurrentPage(1);
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
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                        Sidecar Number
                    </label>
                    <input
                        type="text"
                        name="body_number"
                        value={data.body_number || ""}
                        onChange={(e) => setData("body_number", e.target.value.replace(/\D/g, "").slice(0, 4))}
                        onBlur={(e) => {
                            if (e.target.value) {
                                setData("body_number", String(e.target.value).padStart(4, "0"));
                            }
                        }}
                        placeholder={noBodyNumber ? "N/A" : "0001"}
                        disabled={noBodyNumber}
                        className={`block w-full px-3 py-2 text-sm font-semibold bg-white border ${errors?.body_number ? "border-red-500" : "border-slate-300"} rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 ${noBodyNumber ? "bg-slate-100 text-slate-400 cursor-not-allowed" : ""}`}
                        onKeyDown={onKeyDown}
                    />
                    {errors?.body_number && <p className="mt-1 text-[11px] font-bold text-red-500">{errors.body_number}</p>}
                    {isBodyNumberTaken && !errors?.body_number && !noBodyNumber && (
                        <p className="mt-1 flex items-start gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 p-1.5 rounded border border-amber-200">
                            <Icon icon="solar:danger-triangle-bold" className="shrink-0 mt-0.5" />
                            Warning: This body number is already active on another record. Saving will override the restriction.
                        </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                        <div className="flex items-center gap-2">
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

                            <button
                                type="button"
                                onClick={() => setShowNumbersModal(true)}
                                className="h-8 flex items-center justify-center px-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100 shadow-sm focus:outline-none"
                                title="View Active and Unused Body Numbers"
                            >
                                <Icon icon="solar:eye-bold" width="18" />
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={toggleNoBodyNumber}
                            className="flex items-center gap-2 focus:outline-none group cursor-pointer px-1"
                        >
                            <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${noBodyNumber ? "text-indigo-800" : "text-gray-700 group-hover:text-gray-900"}`}>
                                No Body Number
                            </span>
                            <div className={`w-8 h-4 flex items-center rounded-full p-1 transition-colors duration-300 shadow-inner ${noBodyNumber ? "bg-indigo-800" : "bg-gray-500 group-hover:bg-gray-600"}`}>
                                <div className={`bg-white w-2.5 h-2.5 rounded-full shadow-md transform transition-transform duration-300 ${noBodyNumber ? "translate-x-3.5" : "translate-x-0"}`}></div>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                        Plate Number
                    </label>
                    <input
                        type="text"
                        name="plate_no"
                        value={data.plate_no || ""}
                        onChange={(e) => {
                            const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
                            setData("plate_no", val);
                        }}
                        placeholder={isForRegistration ? "FOR REGISTRATION" : "123ABC"}
                        maxLength={8}
                        readOnly={isForRegistration}
                        className={`block w-full px-3 py-2 text-sm font-semibold bg-white border ${errors?.plate_no ? "border-red-500" : "border-slate-300"} rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 ${isForRegistration ? "bg-indigo-50 text-indigo-700 cursor-not-allowed" : ""}`}
                        onKeyDown={onKeyDown}
                    />
                    {errors?.plate_no && <p className="mt-1 text-[11px] font-bold text-red-500">{errors.plate_no}</p>}

                    <div className="flex justify-end pt-2 px-1">
                        <button
                            type="button"
                            onClick={toggleForRegistration}
                            className="flex items-center gap-2 focus:outline-none group cursor-pointer"
                        >
                            <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${isForRegistration ? "text-indigo-800" : "text-gray-700 group-hover:text-gray-900"}`}>
                                For Registration
                            </span>
                            <div className={`w-8 h-4 flex items-center rounded-full p-1 transition-colors duration-300 shadow-inner ${isForRegistration ? "bg-indigo-800" : "bg-gray-500 group-hover:bg-gray-600"}`}>
                                <div className={`bg-white w-2.5 h-2.5 rounded-full shadow-md transform transition-transform duration-300 ${isForRegistration ? "translate-x-3.5" : "translate-x-0"}`}></div>
                            </div>
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                        Make / Type <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="make_type"
                        value={data.make_type || ""}
                        onChange={(e) => setData("make_type", e.target.value.toUpperCase().replace(/[^A-Z0-9\s.-]/g, ""))}
                        placeholder="HONDA TMX"
                        required
                        className={`block w-full px-3 py-2 text-sm font-semibold bg-white border ${errors?.make_type ? "border-red-500" : "border-slate-300"} rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500`}
                        onKeyDown={onKeyDown}
                    />
                    {errors?.make_type && <p className="mt-1 text-[11px] font-bold text-red-500">{errors.make_type}</p>}
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                        Engine Motor No. <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="engine_motor_no"
                        value={data.engine_motor_no || ""}
                        onChange={(e) => setData("engine_motor_no", e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
                        placeholder="ENG-12345"
                        required
                        className={`block w-full px-3 py-2 text-sm font-semibold bg-white border ${errors?.engine_motor_no ? "border-red-500" : "border-slate-300"} rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500`}
                        onKeyDown={onKeyDown}
                    />
                    {errors?.engine_motor_no && <p className="mt-1 text-[11px] font-bold text-red-500">{errors.engine_motor_no}</p>}
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                        Chassis No. <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="chassis_no"
                        value={data.chassis_no || ""}
                        onChange={(e) => setData("chassis_no", e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
                        placeholder="CHA-67890"
                        required
                        className={`block w-full px-3 py-2 text-sm font-semibold bg-white border ${errors?.chassis_no ? "border-red-500" : "border-slate-300"} rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500`}
                        onKeyDown={onKeyDown}
                    />
                    {errors?.chassis_no && <p className="mt-1 text-[11px] font-bold text-red-500">{errors.chassis_no}</p>}
                </div>
            </div>

            <Modal show={showNumbersModal} onClose={() => setShowNumbersModal(false)} maxWidth="lg">
                <div className="bg-slate-50 rounded-none sm:rounded-lg h-full max-h-[80vh] flex flex-col">
                    <div className="flex justify-between items-center bg-slate-700 px-5 py-3 rounded-none sm:rounded-t-lg border-b border-slate-800 shrink-0 z-10 relative">
                        <span className="text-white font-bold text-base uppercase tracking-wider flex items-center gap-2">
                            <Icon icon="solar:hashtag-square-bold" width="20" /> Body Numbers Status
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowNumbersModal(false)}
                            className="text-white hover:text-slate-300 transition-colors"
                        >
                            <Icon icon="solar:close-circle-bold" width="24" />
                        </button>
                    </div>

                    <div className="p-5 flex flex-col gap-3 shrink-0 z-10 relative">

                        <div className="relative">
                            <Icon icon="solar:magnifer-bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="18" />
                            <input
                                type="text"
                                placeholder="Search body number or owner name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-8 px-3 py-2 text-sm font-semibold bg-white border border-slate-300 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-md outline-none"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                                >
                                    <Icon icon="solar:close-circle-bold" width="18" />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row bg-slate-200 p-1 rounded-md border border-slate-300 gap-1">
                            <button
                                type="button"
                                onClick={() => handleFilterChange('all')}
                                className={`flex-1 py-1.5 text-[11px] sm:text-xs font-bold rounded-md transition-all duration-150 uppercase tracking-wide ${filter === 'all' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-300'}`}
                            >
                                All
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFilterChange('active')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] sm:text-xs font-bold rounded-md transition-all duration-150 uppercase tracking-wide ${filter === 'active' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:text-red-700 hover:bg-red-100'}`}
                            >
                                <span className={`w-2.5 h-2.5 rounded-sm transition-colors duration-150 ${filter === 'active' ? 'bg-white shadow-sm' : 'bg-red-400'}`}></span>
                                Active
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFilterChange('unused')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] sm:text-xs font-bold rounded-md transition-all duration-150 uppercase tracking-wide ${filter === 'unused' ? 'bg-green-600 text-white shadow-sm' : 'text-slate-600 hover:text-green-700 hover:bg-green-100'}`}
                            >
                                <span className={`w-2.5 h-2.5 rounded-sm transition-colors duration-150 ${filter === 'unused' ? 'bg-white shadow-sm' : 'bg-green-400'}`}></span>
                                Unused
                            </button>
                        </div>

                        <div className="text-slate-500 flex items-center justify-between gap-1.5 font-bold uppercase tracking-wide text-[10px] sm:text-[11px] px-1 mt-1">
                            <span className="flex items-center gap-1">
                                <Icon icon="solar:info-circle-bold-duotone" className="text-blue-500 shrink-0" width="14" />
                                Click available (green) to assign
                            </span>
                            <span className="text-slate-700">
                                {visibleNumbers.length} Result{visibleNumbers.length !== 1 && 's'}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 pb-2 relative" onScroll={() => setTooltip(prev => ({ ...prev, show: false }))}>
                        {showNumbersModal && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 pb-4">
                                {paginatedNumbers.length === 0 ? (
                                    <div className="col-span-2 text-center text-gray-400 py-10 font-bold text-sm">
                                        No body numbers found matching your search.
                                    </div>
                                ) : (
                                    paginatedNumbers.map(num => {
                                        const isTaken = activeNumbersSet.has(num);
                                        const ownerName = isOldArrayFormat ? null : (occupied_body_numbers[num] || occupied_body_numbers[String(num)]);

                                        return (
                                            <div
                                                key={num}
                                                className={`relative group w-full flex hover:z-[100] ${isTaken ? 'cursor-not-allowed' : ''}`}
                                                onMouseMove={(e) => {
                                                    setTooltip({
                                                        show: true,
                                                        num,
                                                        isTaken,
                                                        owner: ownerName,
                                                        x: e.clientX,
                                                        y: e.clientY
                                                    });
                                                }}
                                                onMouseLeave={() => setTooltip(prev => ({ ...prev, show: false }))}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!isTaken) {
                                                            setData("body_number", String(num).padStart(4, "0"));
                                                            setNoBodyNumber(false);
                                                            setShowNumbersModal(false);
                                                            setTooltip(prev => ({ ...prev, show: false }));
                                                        }
                                                    }}
                                                    disabled={isTaken}
                                                    className={`py-2 px-1 w-full text-sm sm:text-base tracking-wider font-mono font-bold rounded-md border transition-all duration-150 ${isTaken
                                                        ? 'bg-red-50 text-red-600 border-red-200 opacity-80 pointer-events-none'
                                                        : 'bg-white text-green-700 border-green-400 hover:bg-green-50 hover:border-green-600 shadow-sm cursor-pointer hover:shadow-md'
                                                        }`}
                                                >
                                                    {String(num).padStart(4, "0")}
                                                </button>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer/Pagination Controls */}
                    <div className="px-5 pt-4 pb-5 flex justify-between items-center shrink-0 border-t border-slate-200 mt-2 z-10 relative bg-slate-50">
                        <button
                            type="button"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-1 px-4 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-colors ${currentPage === 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-700 text-white hover:bg-slate-800 shadow-sm'}`}
                        >
                            <Icon icon="solar:alt-arrow-left-bold" width="16" /> Prev
                        </button>

                        <span className="text-slate-600 font-bold text-[11px] sm:text-xs uppercase tracking-widest">
                            Pg {currentPage} of {totalPages}
                        </span>

                        <button
                            type="button"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`flex items-center gap-1 px-4 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-colors ${currentPage === totalPages || totalPages === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-700 text-white hover:bg-slate-800 shadow-sm'}`}
                        >
                            Next <Icon icon="solar:alt-arrow-right-bold" width="16" />
                        </button>
                    </div>
                </div>
            </Modal>

            {/* PERFECT PORTAL TOOLTIP */}
            {tooltip.show && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed z-[999999] pointer-events-none transform -translate-x-1/2 -translate-y-full pb-3 transition-opacity duration-75"
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    <div className="w-max max-w-[200px] sm:max-w-xs p-2.5 bg-gray-900 text-white text-[11px] sm:text-xs font-semibold rounded-lg shadow-2xl text-center flex flex-col gap-1 items-center">
                        {tooltip.isTaken ? (
                            tooltip.owner ? (
                                <>
                                    <span className="text-gray-400 text-[10px] uppercase tracking-wider">Taken By</span>
                                    <span className="flex items-center gap-1.5 text-red-400 font-bold whitespace-nowrap">
                                        <Icon icon="solar:user-bold" width="14" />
                                        {tooltip.owner}
                                    </span>
                                </>
                            ) : (
                                <span className="flex items-center gap-1.5 text-red-400 font-bold whitespace-nowrap">
                                    <Icon icon="solar:forbidden-circle-bold" width="16" />
                                    Taken
                                </span>
                            )
                        ) : (
                            <span className="flex items-center gap-1.5 text-green-400">
                                <Icon icon="solar:check-circle-bold" width="14" /> Click to assign {String(tooltip.num).padStart(4, "0")}
                            </span>
                        )}
                        {/* Tooltip Arrow pointing down */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-[6px] border-transparent border-t-gray-900"></div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
