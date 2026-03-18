//GeronaMTOP\resources\js\Pages\Mtop\Partials\ApplicantForm.tsx
import InputGroup from "@/Components/InputGroup";
import BarangaySelect from "@/Components/BarangaySelect";
import SuffixSelect from "@/Components/SuffixSelect";

export default function ApplicantForm({
    data,
    setData,
    errors,
    onKeyDown,
}: any) {
    const handleNameChange = (field: string, value: string) => {
        // Added Ññ to the regex to allow the character
        const cleanValue = value.toUpperCase().replace(/[^A-ZÑñ\s.-]/g, "");
        setData(field, cleanValue);
    };

    const togglePaidBy = () => {
        if (!data.show_paid_by) {
            // Turning it ON: Only auto-fill if the fields are currently empty
            setData({
                ...data,
                show_paid_by: true,
                paid_by_last_name: data.paid_by_last_name || data.last_name,
                paid_by_first_name: data.paid_by_first_name || data.first_name,
                paid_by_middle_name: data.paid_by_middle_name || data.middle_name,
                paid_by_suffix: data.paid_by_suffix || data.suffix,
            });
        } else {
            // Turning it OFF: Just hide the section, do NOT delete the data
            setData({
                ...data,
                show_paid_by: false,
            });
        }
    };

    return (
        <div className="space-y-3">
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-800 border-b border-blue-300 pb-1">
                    <h3 className="font-extrabold text-base uppercase tracking-wide">
                        Applicant Information
                    </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-12 md:col-span-4">
                        <InputGroup
                            id="last_name"
                            label="Last Name"
                            name="last_name"
                            value={data.last_name}
                            onChange={(e) =>
                                handleNameChange("last_name", e.target.value)
                            }
                            error={errors.last_name}
                            icon="solar:user-bold"
                            placeholder="DEQUIROS"
                            required={true}
                            onKeyDown={onKeyDown}
                        />
                    </div>

                    <div className="sm:col-span-12 md:col-span-4">
                        <InputGroup
                            id="first_name"
                            label="First Name"
                            name="first_name"
                            value={data.first_name}
                            onChange={(e) =>
                                handleNameChange("first_name", e.target.value)
                            }
                            error={errors.first_name}
                            placeholder="ALLEN ICEE"
                            required={true}
                            onKeyDown={onKeyDown}
                        />
                    </div>

                    <div className="sm:col-span-6 md:col-span-2">
                        <InputGroup
                            id="middle_name"
                            label="M.I."
                            name="middle_name"
                            value={data.middle_name}
                            onChange={(e) => {
                                const val = e.target.value
                                    .toUpperCase()
                                    .replace(/[^A-ZÑñ]/g, "")
                                    .slice(0, 1);
                                setData("middle_name", val);
                            }}
                            error={errors.middle_name}
                            placeholder="A"
                            maxLength={1}
                            onKeyDown={onKeyDown}
                        />
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

                <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <h3 className="font-bold text-sm uppercase tracking-wide text-gray-700">
                            Include{" "}
                            <span className="font-extrabold text-blue-800">
                                "Paid By"
                            </span>{" "}
                            on Print?
                        </h3>
                        <button
                            type="button"
                            onClick={togglePaidBy}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${data.show_paid_by
                                    ? "bg-blue-600"
                                    : "bg-gray-300"
                                }`}
                            role="switch"
                            aria-checked={data.show_paid_by}
                        >
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.show_paid_by
                                        ? "translate-x-5"
                                        : "translate-x-0"
                                    }`}
                            />
                        </button>
                    </div>

                    {data.show_paid_by && (
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-2">
                            <div className="sm:col-span-12 md:col-span-4">
                                <InputGroup
                                    id="paid_by_last_name"
                                    label="Paid By: Last Name"
                                    name="paid_by_last_name"
                                    value={data.paid_by_last_name}
                                    onChange={(e) =>
                                        handleNameChange(
                                            "paid_by_last_name",
                                            e.target.value,
                                        )
                                    }
                                    error={errors.paid_by_last_name}
                                    placeholder="DEQUIROS"
                                    onKeyDown={onKeyDown}
                                    required
                                />
                            </div>

                            <div className="sm:col-span-12 md:col-span-4">
                                <InputGroup
                                    id="paid_by_first_name"
                                    label="Paid By: First Name"
                                    name="paid_by_first_name"
                                    value={data.paid_by_first_name}
                                    onChange={(e) =>
                                        handleNameChange(
                                            "paid_by_first_name",
                                            e.target.value,
                                        )
                                    }
                                    error={errors.paid_by_first_name}
                                    placeholder="ALLEN ICEE"
                                    onKeyDown={onKeyDown}
                                    required
                                />
                            </div>

                            <div className="sm:col-span-6 md:col-span-2">
                                <InputGroup
                                    id="middle_name"
                                    label="M.I."
                                    name="middle_name"
                                    value={data.middle_name}
                                    onChange={(e) => {
                                        const val = e.target.value
                                            .toUpperCase()
                                            .replace(/[^A-ZÑ]/g, "") // <--- NOW ALLOWS Ñ
                                            .slice(0, 1);
                                        setData("middle_name", val);
                                    }}
                                    error={errors.paid_by_middle_name}
                                    placeholder="A"
                                    maxLength={1}
                                    onKeyDown={onKeyDown}
                                />
                            </div>

                            <div className="sm:col-span-6 md:col-span-2">
                                <SuffixSelect
                                    value={data.paid_by_suffix}
                                    onChange={(val) =>
                                        setData("paid_by_suffix", val)
                                    }
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
        </div>
    );
}
