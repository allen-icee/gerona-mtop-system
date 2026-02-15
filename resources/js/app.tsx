import "./bootstrap";
import "../css/app.css";

import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";

// --- ADD THESE LINES FOR OFFLINE ICONS ---
import { addCollection } from "@iconify/react";
import solarIcons from "@iconify-json/solar/icons.json";
import iconamoonIcons from "@iconify-json/iconamoon/icons.json";

// Register the icons so they are bundled with your app
// FIX: Cast to 'any' to bypass the TypeScript error.
// The data is correct, but TS sees the JSON as a generic object '{}' sometimes.
addCollection(solarIcons as any);
addCollection(iconamoonIcons as any);
// -----------------------------------------

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob("./Pages/**/*.tsx"),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: "#4B5563",
    },
});
