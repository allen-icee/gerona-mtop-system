import BarangaySelect from "@/Components/BarangaySelect";
import SuffixSelect from "@/Components/SuffixSelect";

export default function ApplicantForm({
    data,
    setData,
    errors,
    onKeyDown,
}: any) {
    const handleNameChange = (field: string, value: string) => {
        const cleanValue = value.toUpperCase().replace(/[^A-ZÑñ\s.-]/g, "");
        setData(field, cleanValue);
    };

    const togglePaidBy = () => {
        if (!data.show_paid_by) {
            setData({
                ...data,
                show_paid_by: true,
                paid_by_last_name: data.paid_by_last_name || data.last_name,
                paid_by_first_name: data.paid_by_first_name || data.first_name,
                paid_by_middle_name: data.paid_by_middle_name || data.middle_name,
                paid_by_suffix: data.paid_by_suffix || data.suffix,
            });
        } else {
            setData({ ...data, show_paid_by: false });
        }
    };

    const toggleDriver = () => {
        setData("has_driver", !data.has_driver);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-800 border-b border-blue-300 pb-2">
                <h3 className="font-extrabold text-base uppercase tracking-wide">
                    Applicant Information
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-12 md:col-span-4">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                        Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="last_name"
                        value={data.last_name}
                        onChange={(e) => handleNameChange("last_name", e.target.value)}
                        placeholder="DEQUIROS"
                        className={`block w-full px-3 py-2 text-sm font-semibold bg-white border ${errors?.last_name ? "border-red-500" : "border-slate-300"} rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500`}
                        required
                        onKeyDown={onKeyDown}
                    />
                    {errors?.last_name && <p className="mt-1 text-[11px] font-bold text-red-500">{errors.last_name}</p>}
                </div>

                <div className="sm:col-span-12 md:col-span-4">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                        First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="first_name"
                        value={data.first_name}
                        onChange={(e) => handleNameChange("first_name", e.target.value)}
                        placeholder="ALLEN ICEE"
                        className={`block w-full px-3 py-2 text-sm font-semibold bg-white border ${errors?.first_name ? "border-red-500" : "border-slate-300"} rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500`}
                        required
                        onKeyDown={onKeyDown}
                    />
                    {errors?.first_name && <p className="mt-1 text-[11px] font-bold text-red-500">{errors.first_name}</p>}
                </div>

                <div className="sm:col-span-6 md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                        M.I.
                    </label>
                    <input
                        type="text"
                        name="middle_name"
                        value={data.middle_name}
                        onChange={(e) => {
                            const val = e.target.value.toUpperCase().replace(/[^A-ZÑñ]/g, "").slice(0, 1);
                            setData("middle_name", val);
                        }}
                        placeholder="A"
                        maxLength={1}
                        className={`block w-full px-3 py-2 text-sm font-semibold bg-white border ${errors?.middle_name ? "border-red-500" : "border-slate-300"} rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500`}
                        onKeyDown={onKeyDown}
                    />
                    {errors?.middle_name && <p className="mt-1 text-[11px] font-bold text-red-500">{errors.middle_name}</p>}
                </div>

                <div className="sm:col-span-6 md:col-span-2">
                    <SuffixSelect
                        value={data.suffix}
                        onChange={(val) => setData("suffix", val)}
                        error={errors.suffix}
                        onKeyDown={onKeyDown}
                    />
                </div>
            </div>

            <div className="space-y-4 bg-slate-50 p-4 rounded border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-slate-700">
                        Include <span className="font-extrabold text-blue-800">Driver</span> for ID?
                    </h3>
                    <button
                        type="button"
                        onClick={toggleDriver}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${data.has_driver ? "bg-blue-600" : "bg-slate-400"}`}
                        role="switch"
                        aria-checked={data.has_driver}
                    >
                        <span className={`pointer-events-none inline-block h-4 w-4 mt-0.5 ml-0.5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${data.has_driver ? "translate-x-4" : "translate-x-0"}`} />
                    </button>
                </div>

                {data.has_driver && (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-12 md:col-span-4">
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                Driver: Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="driver_last_name"
                                value={data.driver_last_name || ""}
                                onChange={(e) => handleNameChange("driver_last_name", e.target.value)}
                                placeholder="DEQUIROS"
                                className={`block w-full px-3 py-2 text-sm font-semibold bg-white border ${errors?.driver_last_name ? "border-red-500" : "border-slate-300"} rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500`}
                                required
                                onKeyDown={onKeyDown}
                            />
                            {errors?.driver_last_name && <p className="mt-1 text-[11px] font-bold text-red-500">{errors.driver_last_name}</p>}
                        </div>

                        <div className="sm:col-span-12 md:col-span-4">
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                Driver: First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="driver_first_name"
                                value={data.driver_first_name || ""}
                                onChange={(e) => handleNameChange("driver_first_name", e.target.value)}
                                placeholder="ALLEN ICEE"
                                className={`block w-full px-3 py-2 text-sm font-semibold bg-white border ${errors?.driver_first_name ? "border-red-500" : "border-slate-300"} rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500`}
                                required
                                onKeyDown={onKeyDown}
                            />
                            {errors?.driver_first_name && <p className="mt-1 text-[11px] font-bold text-red-500">{errors.driver_first_name}</p>}
                        </div>

                        <div className="sm:col-span-6 md:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                M.I.
                            </label>
                            <input
                                type="text"
                                name="driver_middle_name"
                                value={data.driver_middle_name || ""}
                                onChange={(e) => {
                                    const val = e.target.value.toUpperCase().replace(/[^A-ZÑñ]/g, "").slice(0, 1);
                                    setData("driver_middle_name", val);
                                }}
                                placeholder="A"
                                maxLength={1}
                                className={`block w-full px-3 py-2 text-sm font-semibold bg-white border ${errors?.driver_middle_name ? "border-red-500" : "border-slate-300"} rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500`}
                                onKeyDown={onKeyDown}
                            />
                            {errors?.driver_middle_name && <p className="mt-1 text-[11px] font-bold text-red-500">{errors.driver_middle_name}</p>}
                        </div>

                        <div className="sm:col-span-6 md:col-span-2">
                            <SuffixSelect
                                value={data.driver_suffix || ""}
                                onChange={(val) => setData("driver_suffix", val)}
                                error={errors.driver_suffix}
                                onKeyDown={onKeyDown}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4 bg-slate-50 p-4 rounded border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-slate-700">
                        Include <span className="font-extrabold text-blue-800">"Paid By"</span> on Print?
                    </h3>
                    <button
                        type="button"
                        onClick={togglePaidBy}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${data.show_paid_by ? "bg-blue-600" : "bg-slate-400"}`}
                        role="switch"
                        aria-checked={data.show_paid_by}
                    >
                        <span className={`pointer-events-none inline-block h-4 w-4 mt-0.5 ml-0.5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${data.show_paid_by ? "translate-x-4" : "translate-x-0"}`} />
                    </button>
                </div>

                {data.show_paid_by && (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-12 md:col-span-4">
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                Paid By: Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="paid_by_last_name"
                                value={data.paid_by_last_name}
                                onChange={(e) => handleNameChange("paid_by_last_name", e.target.value)}
                                placeholder="DEQUIROS"
                                className={`block w-full px-3 py-2 text-sm font-semibold bg-white border ${errors?.paid_by_last_name ? "border-red-500" : "border-slate-300"} rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500`}
                                required
                                onKeyDown={onKeyDown}
                            />
                            {errors?.paid_by_last_name && <p className="mt-1 text-[11px] font-bold text-red-500">{errors.paid_by_last_name}</p>}
                        </div>

                        <div className="sm:col-span-12 md:col-span-4">
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                Paid By: First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="paid_by_first_name"
                                value={data.paid_by_first_name}
                                onChange={(e) => handleNameChange("paid_by_first_name", e.target.value)}
                                placeholder="ALLEN ICEE"
                                className={`block w-full px-3 py-2 text-sm font-semibold bg-white border ${errors?.paid_by_first_name ? "border-red-500" : "border-slate-300"} rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500`}
                                required
                                onKeyDown={onKeyDown}
                            />
                            {errors?.paid_by_first_name && <p className="mt-1 text-[11px] font-bold text-red-500">{errors.paid_by_first_name}</p>}
                        </div>

                        <div className="sm:col-span-6 md:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                M.I.
                            </label>
                            <input
                                type="text"
                                name="paid_by_middle_name"
                                value={data.paid_by_middle_name}
                                onChange={(e) => {
                                    const val = e.target.value.toUpperCase().replace(/[^A-ZÑ]/g, "").slice(0, 1);
                                    setData("paid_by_middle_name", val);
                                }}
                                placeholder="A"
                                maxLength={1}
                                className={`block w-full px-3 py-2 text-sm font-semibold bg-white border ${errors?.paid_by_middle_name ? "border-red-500" : "border-slate-300"} rounded shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500`}
                                onKeyDown={onKeyDown}
                            />
                            {errors?.paid_by_middle_name && <p className="mt-1 text-[11px] font-bold text-red-500">{errors.paid_by_middle_name}</p>}
                        </div>

                        <div className="sm:col-span-6 md:col-span-2">
                            <SuffixSelect
                                value={data.paid_by_suffix}
                                onChange={(val) => setData("paid_by_suffix", val)}
                                error={errors.paid_by_suffix}
                                onKeyDown={onKeyDown}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div>
                <BarangaySelect
                    value={data.address}
                    onChange={(val) => setData("address", val)}
                    error={errors.address}
                    required={true}
                    onKeyDown={onKeyDown}
                />
            </div>
        </div>
    );
}
