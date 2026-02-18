import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    server: {
        host: "0.0.0.0", // Allows access from network
        hmr: {
            host: "192.168.10.105", // REPLACE THIS with your computer's actual local IP address
        },
    },
    plugins: [
        laravel({
            input: "resources/js/app.tsx",
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
});
