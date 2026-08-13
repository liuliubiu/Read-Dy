import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
  cacheDir: ".cache/vite",
  plugins: [react()],
  clearScreen: false,
  define: {
    // Tauri CLI 在 beforeBuildCommand 时注入 TAURI_ENV_PLATFORM（android/desktop），
    // 作为构建期常量参与死代码消除，安卓包不含桌面专属代码。
    "import.meta.env.TAURI_PLATFORM": JSON.stringify(process.env.TAURI_ENV_PLATFORM ?? "desktop"),
  },
  server: {
    port: 1422,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1423,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
