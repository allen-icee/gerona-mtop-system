import InputGroup from "@/Components/InputGroup";
import BarangaySelect from "@/Components/BarangaySelect";
import { Icon } from "@iconify/react";
import InputLabel from "@/Components/InputLabel";

const SUFFIXES = ["", "JR.", "SR.", "I", "II", "III", "IV", "V"];

export default function ApplicantForm({ data, setData, errors }: any) {
    // Helper to allow ONLY Letters, Spaces, Dots (.), and Dashes (-)
    const handleNameChange = (field: string, value: string) => {
        const cleanValue = value.toUpperCase().replace(/[^A-Z\s.-]/g, "");
        setData(field, cleanValue);
    };

    return (
        <div className="space-y-4">
            {/* Section Header (Optional - good for visual separation if used in a long form) */}
            <div className="flex items-center gap-2 text-gray-800 border-b border-gray-200 pb-2">
                <Icon
                    icon="solar:user-id-bold"
                    className="text-blue-600"
                    width="20"
                />
                <h3 className="font-bold text-base uppercase tracking-wide">
                    Applicant Information
                </h3>
            </div>

            {/* NAME GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Last Name (4 cols on tablet/desktop) */}
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
                        placeholder="DELA CRUZ"
                        required={true}
                    />
                </div>

                {/* First Name (4 cols on tablet/desktop) */}
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
                        placeholder="JUAN"
                        required={true}
                    />
                </div>

                {/* Middle Initial (2 cols on tablet/desktop) */}
                <div className="sm:col-span-6 md:col-span-2">
                    <InputGroup
                        id="middle_name"
                        label="M.I."
                        name="middle_name"
                        value={data.middle_name}
                        onChange={(e) => {
                            const val = e.target.value
                                .toUpperCase()
                                .replace(/[^A-Z]/g, "")
                                .slice(0, 1);
                            setData("middle_name", val);
                        }}
                        error={errors.middle_name}
                        placeholder="S"
                        maxLength={1}
                    />
                </div>

                {/* Suffix (2 cols on tablet/desktop) */}
                <div className="sm:col-span-6 md:col-span-2">
                    <InputLabel htmlFor="suffix" value="Suffix" />
                    <div className="relative mt-1">
                        <select
                            id="suffix"
                            value={data.suffix}
                            onChange={(e) => setData("suffix", e.target.value)}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm w-full py-3 pl-3 text-sm bg-white"
                        >
                            {SUFFIXES.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt === "" ? "N/A" : opt}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* ADDRESS */}
            <div>
                <BarangaySelect
                    value={data.address}
                    onChange={(val) => setData("address", val)}
                    error={errors.address}
                    required={true}
                />
            </div>
        </div>
    );
}
