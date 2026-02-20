//GeronaMTOP\resources\js\Pages\Mtop\Partials\ApplicantForm.tsx
import InputGroup from "@/Components/InputGroup";
import BarangaySelect from "@/Components/BarangaySelect";
import SuffixSelect from "@/Components/SuffixSelect";
import { Icon } from "@iconify/react";

export default function ApplicantForm({
    data,
    setData,
    errors,
    onKeyDown,
}: any) {
    const handleNameChange = (field: string, value: string) => {
        const cleanValue = value.toUpperCase().replace(/[^A-Z\s.-]/g, "");
        setData(field, cleanValue);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-800 border-b border-gray-200 pb-2">
                <h3 className="font-bold text-base uppercase tracking-wide">
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
                                .replace(/[^A-Z]/g, "")
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
