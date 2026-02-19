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
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-dvh bg-gray-50">
            <ToastListener />
            {/* 1. NAVBAR */}
            <nav className="bg-blue-900 border-b border-blue-800 shadow-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            {/* LOGO */}
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-10 w-auto fill-current text-white" />
                                </Link>
                                <span className="ml-3 text-white font-bold tracking-widest text-sm hidden sm:block">
                                    MTOP SYSTEM
                                </span>
                            </div>

                            {/* NAVIGATION LINKS */}
                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route("dashboard")}
                                    active={route().current("dashboard")}
                                    className="text-blue-100 hover:text-white focus:text-white border-transparent hover:border-white focus:border-white"
                                >
                                    Dashboard
                                </NavLink>

                                <NavLink
                                    href={route("mtop.index")}
                                    active={route().current("mtop.*")}
                                    className="text-blue-100 hover:text-white focus:text-white border-transparent hover:border-white focus:border-white"
                                >
                                    MTOP Records
                                </NavLink>

                                {/* PRINT SETTINGS (VISIBLE TO EVERYONE) */}
                                <NavLink
                                    href={route("settings.print.edit")}
                                    active={route().current(
                                        "settings.print.edit",
                                    )}
                                    className="text-blue-100 hover:text-white focus:text-white border-transparent hover:border-white focus:border-white"
                                >
                                    Print Settings
                                </NavLink>

                                {/* RESTRICTED: SIGNATORIES (Admin Only) */}
                                {user.role === "admin" && (
                                    <NavLink
                                        href={route("signatories.index")}
                                        active={route().current(
                                            "signatories.*",
                                        )}
                                        className="text-blue-100 hover:text-white focus:text-white border-transparent hover:border-white focus:border-white"
                                    >
                                        Signatories
                                    </NavLink>
                                )}

                                {/* RESTRICTED: SYSTEM USERS (Admin Only) */}
                                {user.role === "admin" && (
                                    <NavLink
                                        href={route("users.index")}
                                        active={route().current("users.*")}
                                        className="text-blue-100 hover:text-white focus:text-white border-transparent hover:border-white focus:border-white"
                                    >
                                        System Users
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        {/* USER DROPDOWN */}
                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-blue-800 px-3 py-2 text-sm font-medium leading-4 text-white transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none shadow-sm"
                                            >
                                                <div className="flex flex-col items-start mr-2">
                                                    <span className="leading-none">
                                                        {user.name}
                                                    </span>
                                                    <span className="text-[10px] uppercase text-blue-200 font-bold tracking-wider">
                                                        {user.role}
                                                    </span>
                                                </div>

                                                <Icon
                                                    icon="solar:alt-arrow-down-bold"
                                                    width="16"
                                                    className="ml-1 text-blue-300"
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

                        {/* MOBILE HAMBURGER BUTTON */}
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

                {/* MOBILE MENU */}
                <div
                    className={
                        (showingNavigationDropdown ? "block" : "hidden") +
                        " sm:hidden bg-blue-800 border-t border-blue-700"
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route("dashboard")}
                            active={route().current("dashboard")}
                            className="text-white hover:bg-blue-700 focus:bg-blue-700 border-l-4 border-transparent hover:border-yellow-400"
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route("mtop.index")}
                            active={route().current("mtop.*")}
                            className="text-white hover:bg-blue-700 focus:bg-blue-700 border-l-4 border-transparent hover:border-yellow-400"
                        >
                            MTOP Records
                        </ResponsiveNavLink>

                        {/* PRINT SETTINGS (VISIBLE TO EVERYONE) */}
                        <ResponsiveNavLink
                            href={route("settings.print.edit")}
                            active={route().current("settings.print.edit")}
                            className="text-white hover:bg-blue-700 focus:bg-blue-700 border-l-4 border-transparent hover:border-yellow-400"
                        >
                            Print Settings
                        </ResponsiveNavLink>

                        {/* RESTRICTED MOBILE LINKS (Admin Only) */}
                        {user.role === "admin" && (
                            <>
                                <ResponsiveNavLink
                                    href={route("signatories.index")}
                                    active={route().current("signatories.*")}
                                    className="text-white hover:bg-blue-700 focus:bg-blue-700 border-l-4 border-transparent hover:border-yellow-400"
                                >
                                    Signatories
                                </ResponsiveNavLink>

                                <ResponsiveNavLink
                                    href={route("users.index")}
                                    active={route().current("users.*")}
                                    className="text-white hover:bg-blue-700 focus:bg-blue-700 border-l-4 border-transparent hover:border-yellow-400"
                                >
                                    System Users
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
                                className="text-blue-200 hover:text-white hover:bg-blue-700"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {/* HEADER */}
            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
