import { defineConfig, loadEnv } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import os from "os";

function getLocalIP(): string {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name] || []) {
            if (iface.family === "IPv4" && !iface.internal) {
                return iface.address;
            }
        }
    }
    return "localhost";
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    const hostIp = env.VITE_HMR_HOST || env.SERVER_IP || getLocalIP();

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
                host: hostIp,
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