import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";

export default function TricycleForm({ data, setData, errors }: any) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-600">
            <div className="flex items-center gap-2 mb-6 border-b pb-2">
                <Icon
                    icon="solar:wheel-bold"
                    className="text-green-600"
                    width="24"
                />
                <h3 className="text-lg font-bold text-gray-700 uppercase">
                    2. Tricycle Unit Details
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup
                    id="body_number"
                    label="Body Number (MTOP)"
                    name="body_number"
                    value={data.body_number}
                    onChange={(e) => {
                        // STRICT: Numbers ONLY. No letters, no symbols.
                        setData(
                            "body_number",
                            e.target.value.replace(/\D/g, ""),
                        );
                    }}
                    error={errors.body_number}
                    icon="solar:hashtag-square-bold"
                    placeholder="#1234"
                    required={true} // <--- Added
                />

                <InputGroup
                    id="plate_no"
                    label="Plate Number"
                    name="plate_no"
                    value={data.plate_no}
                    onChange={(e) => {
                        // STRICT: A-Z, 0-9. No spaces, no dashes (usually).
                        const val = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "");
                        setData("plate_no", val);
                    }}
                    error={errors.plate_no}
                    icon="solar:card-reciept-bold"
                    placeholder="123ABC"
                    required={true} // <--- Added
                />

                <InputGroup
                    id="make_type"
                    label="Make / Type"
                    name="make_type"
                    value={data.make_type}
                    onChange={(e) => {
                        // ALLOW: A-Z, 0-9, Spaces, Dots, Dashes.
                        // BLOCK: = @ # $ %
                        const val = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9\s.-]/g, "");
                        setData("make_type", val);
                    }}
                    error={errors.make_type}
                    icon="solar:box-minimalistic-bold"
                    placeholder="HONDA TMX"
                    required={true} // <--- Added
                />

                <InputGroup
                    id="engine_motor_no"
                    label="Engine Motor No."
                    name="engine_motor_no"
                    value={data.engine_motor_no}
                    onChange={(e) => {
                        // STRICT: A-Z, 0-9, Dash. NO SPACES.
                        const val = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9-]/g, "");
                        setData("engine_motor_no", val);
                    }}
                    error={errors.engine_motor_no}
                    icon="solar:settings-bold"
                    required={true} // <--- Added
                />

                <InputGroup
                    id="chassis_no"
                    label="Chassis No."
                    name="chassis_no"
                    value={data.chassis_no}
                    onChange={(e) => {
                        // STRICT: A-Z, 0-9, Dash. NO SPACES.
                        const val = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9-]/g, "");
                        setData("chassis_no", val);
                    }}
                    error={errors.chassis_no}
                    icon="solar:structure-bold"
                    required={true} // <--- Added
                />
            </div>
        </div>
    );
}
