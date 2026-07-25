//GeronaMTOP\resources\js\Components\NavLink.tsx
import { Link, InertiaLinkProps } from "@inertiajs/react";

export default function NavLink({
    active = false,
    className = "",
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={
                "inline-flex items-center px-1 pt-1 border-b-2 text-[14px] font-medium leading-5 transition duration-150 ease-in-out focus:outline-none " +
                (active
                    ? "border-blue-400 text-white "
                    : "border-transparent text-slate-300 hover:text-white hover:border-slate-500 focus:text-white ") +
                className
            }
        >
            {children}
        </Link>
    );
}
