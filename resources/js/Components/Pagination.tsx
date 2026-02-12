import { Link } from "@inertiajs/react";

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    links: PaginationLink[];
}

export default function Pagination({ links }: Props) {
    // If there is only 1 page (3 links: Prev, 1, Next), don't show pagination
    if (links.length <= 3) return null;

    return (
        <div className="flex flex-wrap justify-center gap-1 mt-6">
            {links.map((link, key) => {
                // Render the HTML label (like &laquo; for arrows)
                const label = link.label
                    .replace("&laquo; Previous", "Previous")
                    .replace("Next &raquo;", "Next");

                return link.url === null ? (
                    // DISABLED LINK (e.g., "Previous" when on Page 1)
                    <div
                        key={key}
                        className="px-4 py-2 text-sm text-gray-400 bg-white border border-gray-200 rounded-md cursor-not-allowed opacity-50"
                    >
                        {label}
                    </div>
                ) : (
                    // ACTIVE LINK
                    <Link
                        key={key}
                        href={link.url}
                        className={`px-4 py-2 text-sm border rounded-md transition-colors duration-150 ease-in-out ${
                            link.active
                                ? "bg-blue-600 text-white border-blue-600 font-bold shadow-sm" // Current Page
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-blue-600" // Other Pages
                        }`}
                    >
                        {label}
                    </Link>
                );
            })}
        </div>
    );
}
