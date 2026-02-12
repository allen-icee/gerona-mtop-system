import { Link, InertiaLinkProps } from "@inertiajs/react";

export default function ResponsiveNavLink({
    active = false,
    className = "",
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    // <--- Added '?' here
    return (
        <Link
            {...props}
            className={
                "w-full flex items-start ps-3 pe-4 py-2 border-l-4 transition duration-150 ease-in-out focus:outline-none " +
                (active
                    ? "border-yellow-400 text-white bg-blue-800 focus:text-white focus:bg-blue-700 "
                    : "border-transparent text-blue-100 hover:text-white hover:bg-blue-800 hover:border-gray-300 focus:text-white focus:bg-blue-800 focus:border-gray-300 ") +
                className
            }
        >
            {children}
        </Link>
    );
}
