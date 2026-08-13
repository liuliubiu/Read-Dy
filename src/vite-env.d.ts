/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Tauri CLI 注入的构建目标平台，见 vite.config.ts 的 define。 */
  readonly TAURI_PLATFORM?: "android" | "desktop";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
