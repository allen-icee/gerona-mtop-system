export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    role: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

// --- ADD THIS SECTION ---
export interface MtopApplication {
    id: number;
    mt_number: string;
    operator_name: string;
    address: string;
    transaction_date: string;
    valid_until: string;

    make_type: string;
    engine_motor_no: string;
    chassis_no: string;
    plate_no: string;
    body_number: string;

    cedula_number?: string;
    cedula_date?: string;
    or_number?: string;
    or_date?: string;
    punong_bayan?: string;
    authorized_official?: string;
    status: string;
}
