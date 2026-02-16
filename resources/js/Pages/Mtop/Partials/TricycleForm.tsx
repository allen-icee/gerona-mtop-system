import InputGroup from "@/Components/InputGroup";
import { Icon } from "@iconify/react";

export default function TricycleForm({
    data,
    setData,
    errors,
    onKeyDown, // <--- Add this
}: any) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-gray-800 border-b border-gray-200 pb-2">
                <Icon
                    icon="solar:wheel-bold"
                    className="text-green-600"
                    width="20"
                />
                <h3 className="font-bold text-base uppercase tracking-wide">
                    Tricycle Unit Details
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputGroup
                    id="body_number"
                    label="Body Number (MTOP)"
                    name="body_number"
                    value={data.body_number}
                    onChange={(e: any) => {
                        setData(
                            "body_number",
                            e.target.value.replace(/\D/g, ""),
                        );
                    }}
                    error={errors.body_number}
                    icon="solar:hashtag-square-bold"
                    placeholder="1234"
                    required={true}
                    onKeyDown={onKeyDown} // <--- Pass it down
                />

                <InputGroup
                    id="plate_no"
                    label="Plate Number"
                    name="plate_no"
                    value={data.plate_no}
                    onChange={(e: any) => {
                        const val = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "");
                        setData("plate_no", val);
                    }}
                    error={errors.plate_no}
                    icon="solar:plate-bold"
                    placeholder="123ABC"
                    required={true}
                    onKeyDown={onKeyDown} // <--- Pass it down
                />

                <InputGroup
                    id="make_type"
                    label="Make / Type"
                    name="make_type"
                    value={data.make_type}
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
                    onKeyDown={onKeyDown} // <--- Pass it down
                />

                <InputGroup
                    id="engine_motor_no"
                    label="Engine Motor No."
                    name="engine_motor_no"
                    value={data.engine_motor_no}
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
                    onKeyDown={onKeyDown} // <--- Pass it down
                />

                <InputGroup
                    id="chassis_no"
                    label="Chassis No."
                    name="chassis_no"
                    value={data.chassis_no}
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
                    onKeyDown={onKeyDown} // <--- Pass it down
                />
            </div>
        </div>
    );
}
