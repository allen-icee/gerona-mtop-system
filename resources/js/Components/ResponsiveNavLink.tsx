//GeronaMTOP\resources\js\Components\ResponsiveNavLink.tsx
import { Link, InertiaLinkProps } from "@inertiajs/react";

export default function ResponsiveNavLink({
    active = false,
    className = "",
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={
                "w-full flex items-start ps-3 pe-4 py-2 border-l-4 transition duration-150 ease-in-out focus:outline-none " +
                (active
                    ? "border-blue-400 text-white bg-slate-700 "
                    : "border-transparent text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-500 ") +
                className
            }
        >
            {children}
        </Link>
    );
}
