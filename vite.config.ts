import { defineConfig, loadEnv } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    const isProduction = mode === "production";

    return {
        plugins: [
            laravel({
                input: ["resources/js/app.tsx"],
                refresh: true,
            }),
            react(),
            tailwindcss(),
        ],

        server: {
            host: "0.0.0.0",
            port: 5173,
            cors: true,
            hmr: {
            host: "192.168.11.52",
            },
        },

        build: {
            outDir: "public/build",
            manifest: true,
            emptyOutDir: true,

            rollupOptions: {
                output: {
                    manualChunks: undefined,
                },
            },
        },

        resolve: {
            alias: {
                "@": "/resources/js",
            },
        },
    };
});
