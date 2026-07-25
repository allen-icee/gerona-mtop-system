//GeronaMTOP\resources\js\Layouts\AuthenticatedLayout.tsx
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";
import { PropsWithChildren, ReactNode, useState } from "react";
import { Icon } from "@iconify/react";
import ToastListener from "@/Components/ToastListener";

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user as any;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-dvh bg-gray-50 relative">
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-5"
                style={{
                    backgroundImage: "url('/images/BGTric.png')",
                    backgroundPosition: "center center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "50%",
                    backgroundAttachment: "fixed",
                }}
            />

            <div className="relative z-10 flex flex-col min-h-dvh">
                <ToastListener />

                <nav className="bg-slate-800 border-b border-slate-700">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-14 justify-between items-center">
                            <div className="flex items-center h-full">
                                <div className="flex shrink-0 items-center">
                                    <Link href="/">
                                        <ApplicationLogo className="block h-7 w-auto fill-current text-white" />
                                    </Link>
                                    <span className="ml-3 text-white font-medium tracking-wide text-[13px] hidden sm:block">
                                        MTOP System
                                    </span>
                                </div>

                                <div className="hidden space-x-6 sm:-my-px sm:ms-8 sm:flex h-full">
                                    <NavLink
                                        href={route("dashboard")}
                                        active={route().current("dashboard")}
                                    >
                                        Dashboard
                                    </NavLink>

                                    <NavLink
                                        href={route("mtop.index")}
                                        active={route().current("mtop.*")}
                                    >
                                        MTOP Records
                                    </NavLink>

                                    <NavLink
                                        href={route("or_records.index")}
                                        active={route().current("or_records.*")}
                                    >
                                        OR Records
                                    </NavLink>


                                    {user.role === "admin" && (
                                        <>

                                            <NavLink
                                                href={route("settings.print.edit")}
                                                active={route().current(
                                                    "settings.print.edit",
                                                )}
                                            >
                                                Printing
                                            </NavLink>

                                            <NavLink
                                                href={route(
                                                    "signatories.index",
                                                )}
                                                active={route().current(
                                                    "signatories.*",
                                                )}
                                            >
                                                Signatories
                                            </NavLink>

                                            <NavLink
                                                href={route("users.index")}
                                                active={route().current(
                                                    "users.*",
                                                )}
                                            >
                                                Users
                                            </NavLink>

                                            <NavLink
                                                href={route("events.index")}
                                                active={route().current(
                                                    "events.*",
                                                )}
                                            >
                                                Events
                                            </NavLink>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="hidden sm:ms-6 sm:flex sm:items-center">
                                <div className="relative ms-3">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center border border-transparent px-2 py-1 text-sm font-medium leading-4 text-slate-200 hover:text-white focus:outline-none transition"
                                                >
                                                    <div className="flex flex-col items-end mr-2 text-right">
                                                        <span className="leading-none text-[13px] font-medium">
                                                            {user.name}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 mt-1 capitalize">
                                                            {user.role}
                                                        </span>
                                                    </div>
                                                    <Icon
                                                        icon="solar:alt-arrow-down-bold"
                                                        width="14"
                                                        className="text-slate-400"
                                                    />
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content>
                                            <Dropdown.Link
                                                href={route("logout")}
                                                method="post"
                                                as="button"
                                            >
                                                Log Out
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>

                            <div className="-me-2 flex items-center sm:hidden">
                                <button
                                    onClick={() =>
                                        setShowingNavigationDropdown(
                                            (previousState) => !previousState,
                                        )
                                    }
                                    className="inline-flex items-center justify-center rounded-md p-2 text-blue-200 transition duration-150 ease-in-out hover:bg-blue-800 hover:text-white focus:bg-blue-800 focus:text-white focus:outline-none"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            className={
                                                !showingNavigationDropdown
                                                    ? "inline-flex"
                                                    : "hidden"
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                        <path
                                            className={
                                                showingNavigationDropdown
                                                    ? "inline-flex"
                                                    : "hidden"
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        className={
                            (showingNavigationDropdown ? "block" : "hidden") +
                            " sm:hidden bg-slate-800 border-t border-slate-700"
                        }
                    >
                        <div className="space-y-1 pb-3 pt-2">
                            <ResponsiveNavLink
                                href={route("dashboard")}
                                active={route().current("dashboard")}
                            >
                                Dashboard
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route("mtop.index")}
                                active={route().current("mtop.*")}
                            >
                                MTOP Records
                            </ResponsiveNavLink>

                            <ResponsiveNavLink
                                href={route("or_records.index")}
                                active={route().current("or_records.*")}
                            >
                                OR Records
                            </ResponsiveNavLink>


                            {user.role === "admin" && (
                                <>

                                    <ResponsiveNavLink
                                        href={route("settings.print.edit")}
                                        active={route().current("settings.print.edit")}
                                    >
                                        Printing
                                    </ResponsiveNavLink>

                                    <ResponsiveNavLink
                                        href={route("signatories.index")}
                                        active={route().current(
                                            "signatories.*",
                                        )}
                                    >
                                        Signatories
                                    </ResponsiveNavLink>

                                    <ResponsiveNavLink
                                        href={route("users.index")}
                                        active={route().current("users.*")}
                                    >
                                        Users
                                    </ResponsiveNavLink>

                                    <ResponsiveNavLink
                                        href={route("events.index")}
                                        active={route().current("events.*")}
                                    >
                                        Events
                                    </ResponsiveNavLink>
                                </>
                            )}
                        </div>
                        <div className="border-t border-blue-700 pb-1 pt-4">
                            <div className="px-4">
                                <div className="text-base font-medium text-white">
                                    {user.name}
                                </div>
                                <div className="text-sm font-medium text-blue-300 uppercase">
                                    {user.role}
                                </div>
                            </div>

                            <div className="mt-3 space-y-1">
                                <ResponsiveNavLink
                                    method="post"
                                    href={route("logout")}
                                    as="button"
                                >
                                    Log Out
                                </ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                </nav>

                {header && (
                    <header className="bg-white shadow relative z-10">
                        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                <main className="relative z-10">{children}</main>
            </div>
        </div>
    );
}
