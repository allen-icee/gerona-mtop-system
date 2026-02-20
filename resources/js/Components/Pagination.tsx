//GeronaMTOP\resources\js\Components\Pagination.tsx
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
    if (links.length <= 3) return null;

    return (
        <div className="flex flex-wrap justify-center gap-1 mt-6">
            {links.map((link, key) => {
                const label = link.label
                    .replace("&laquo; Previous", "Previous")
                    .replace("Next &raquo;", "Next");

                return link.url === null ? (
                    <div
                        key={key}
                        className="px-4 py-2 text-sm text-gray-400 bg-white border border-gray-200 rounded-md cursor-not-allowed opacity-50"
                    >
                        {label}
                    </div>
                ) : (
                    <Link
                        key={key}
                        href={link.url}
                        className={`px-4 py-2 text-sm border rounded-md transition-colors duration-150 ease-in-out ${
                            link.active
                                ? "bg-blue-600 text-white border-blue-600 font-bold shadow-sm"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-blue-600"
                        }`}
                    >
                        {label}
                    </Link>
                );
            })}
        </div>
    );
}
