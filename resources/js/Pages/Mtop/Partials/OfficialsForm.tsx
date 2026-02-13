import SignatorySelect from "@/Components/SignatorySelect";
import { Icon } from "@iconify/react";

// Add new props for the lists
interface Props {
    data: any;
    setData: Function;
    errors: any;
    punong_bayans?: string[]; // Optional array of names
    officials?: string[]; // Optional array of names
}

export default function OfficialsForm({
    data,
    setData,
    errors,
    punong_bayans = [],
    officials = [],
}: Props) {
    return (
        <div className="bg-white ">
            <div className="flex items-center gap-2 mb-6 border-b pb-2">
                <h3 className="text-lg font-bold text-gray-700 uppercase">
                    Signatories
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Punong Bayan Selector */}
                <SignatorySelect
                    label="Punong Bayan"
                    value={data.punong_bayan}
                    onChange={(val) => setData("punong_bayan", val)}
                    options={punong_bayans} // Pass the list here
                    error={errors.punong_bayan}
                    // required={true} // Uncomment if strictly required
                />
                {/* Authorized Official Selector */}
                <SignatorySelect
                    label="Authorized Official"
                    value={data.authorized_official}
                    onChange={(val) => setData("authorized_official", val)}
                    options={officials} // Pass the list here
                    error={errors.authorized_official}
                    // required={true} // Uncomment if strictly required
                />
            </div>

            <p className="text-xs text-gray-500 mt-2 italic">
                * Type to search. If the name is not in the list, you can still
                type it manually.
            </p>
        </div>
    );
}
