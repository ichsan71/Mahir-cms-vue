import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

// Callback agar bisa membaca variabel .env (loadEnv) untuk konfigurasi proxy.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      proxy: {
        // Frontend memanggil /graphql (same-origin) → diteruskan ke gateway
        // sehingga tidak terkena CORS. Target dibaca dari VITE_GRAPHQL_URI.
        "/graphql": {
          target: env.VITE_GRAPHQL_URI,
          changeOrigin: true,
          secure: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/graphql/, ""),
        },
      },
    },
  };
});
