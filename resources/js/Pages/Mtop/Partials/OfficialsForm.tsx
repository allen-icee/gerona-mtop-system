import SignatorySelect from "@/Components/SignatorySelect";
import { Icon } from "@iconify/react";

// FIX: Define the props to include 'data', 'punong_bayans', and 'officials'
interface Props {
    data: any; // Accepts the form data object
    setData: Function; // Accepts the setData function
    errors: any; // Accepts the errors object
    punong_bayans: string[]; // List of names for the dropdown
    officials: string[]; // List of names for the dropdown
}

export default function OfficialsForm({
    data,
    setData,
    errors,
    punong_bayans = [],
    officials = [],
}: Props) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-gray-600">
            <div className="flex items-center gap-2 mb-6 border-b pb-2">
                <Icon
                    icon="solar:pen-new-square-bold"
                    className="text-gray-600"
                    width="24"
                />
                <h3 className="text-lg font-bold text-gray-700 uppercase">
                    3. Signatories (Mga Pumirma)
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Authorized Official Selector */}
                <SignatorySelect
                    label="Authorized Official"
                    value={data.authorized_official}
                    onChange={(val) => setData("authorized_official", val)}
                    options={officials}
                    error={errors.authorized_official}
                    required={true}
                />

                {/* Punong Bayan Selector */}
                <SignatorySelect
                    label="Punong Bayan"
                    value={data.punong_bayan}
                    onChange={(val) => setData("punong_bayan", val)}
                    options={punong_bayans}
                    error={errors.punong_bayan}
                    required={true}
                />
            </div>

            <p className="text-xs text-gray-500 mt-2 italic">
                * Type to search. You can also type a new name if it's not in
                the list.
            </p>
        </div>
    );
}
