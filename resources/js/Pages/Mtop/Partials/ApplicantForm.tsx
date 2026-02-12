import InputGroup from "@/Components/InputGroup";
import BarangaySelect from "@/Components/BarangaySelect";
import { Icon } from "@iconify/react";

export default function ApplicantForm({ data, setData, errors }: any) {
    // Helper to allow ONLY Letters, Spaces, Dots (.), and Dashes (-)
    // Removes Numbers and Symbols
    const handleNameChange = (field: string, value: string) => {
        const cleanValue = value.toUpperCase().replace(/[^A-Z\s.-]/g, "");
        setData(field, cleanValue);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-600">
            <div className="flex items-center gap-2 mb-6 border-b pb-2">
                <Icon
                    icon="solar:user-id-bold"
                    className="text-blue-600"
                    width="24"
                />
                <h3 className="text-lg font-bold text-gray-700 uppercase">
                    1. Applicant Details
                </h3>
            </div>

            {/* NAME GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="md:col-span-2">
                    <InputGroup
                        id="last_name"
                        label="Last Name (Apelyido)"
                        name="last_name"
                        value={data.last_name}
                        onChange={(e) =>
                            handleNameChange("last_name", e.target.value)
                        }
                        error={errors.last_name}
                        icon="solar:user-bold"
                        placeholder="DELA CRUZ"
                    />
                </div>
                <div className="md:col-span-1">
                    <InputGroup
                        id="first_name"
                        label="First Name (Pangalan)"
                        name="first_name"
                        value={data.first_name}
                        onChange={(e) =>
                            handleNameChange("first_name", e.target.value)
                        }
                        error={errors.first_name}
                        placeholder="JUAN"
                    />
                </div>
                <div className="md:col-span-1">
                    <InputGroup
                        id="middle_name"
                        label="M.I."
                        name="middle_name"
                        value={data.middle_name}
                        onChange={(e) => {
                            // Strict: Letters only, max 1 char
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
            </div>

            {/* ADDRESS (Full Width) */}
            <div>
                <BarangaySelect
                    value={data.address}
                    onChange={(val) => setData("address", val)}
                    error={errors.address}
                />
            </div>
        </div>
    );
}
