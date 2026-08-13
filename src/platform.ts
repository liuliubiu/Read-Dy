/** 构建期确定的运行平台。桌面构建恒为 false，安卓构建恒为 true。 */
export const IS_ANDROID = import.meta.env.TAURI_PLATFORM === "android";
