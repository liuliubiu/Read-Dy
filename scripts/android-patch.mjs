// 对 src-tauri/gen/android 应用安卓端补丁（gen/ 不入库，重新 tauri android init 后需重跑本脚本）：
// 1. 应用显示名 → 识谱练习（桌面端 productName 仍为 Ref）
// 2. compileSdk / targetSdk 36 → 35（复用本机已装 SDK，避免 Gradle 拉取 dl.google.com）
// 3. 程序化绘制音符图标替换默认 Tauri 图标（无第三方依赖）
// 用法：npm run android:patch
import { deflateSync } from 'node:zlib';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GEN = join(ROOT, 'src-tauri', 'gen', 'android');
const APP_NAME = '识谱练习';

// ---------- PNG 编码 ----------

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(data.length + 12);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ---------- 图标绘制 ----------

/** 背景测试：rounded（圆角方）或 circle（圆形），坐标已归一化到 0..size。 */
function inBackground(px, py, size, kind) {
  if (kind === 'circle') {
    return Math.hypot(px - size / 2, py - size / 2) <= size * 0.46;
  }
  const inset = size * 0.04;
  const r = size * 0.22;
  const hw = size / 2 - inset;
  const hh = size / 2 - inset;
  const ax = Math.abs(px - size / 2);
  const ay = Math.abs(py - size / 2);
  if (ax <= hw - r || ay <= hh - r) return true;
  return Math.hypot(ax - (hw - r), ay - (hh - r)) <= r;
}

/** 音符测试：椭圆符头（-25°）+ 符干 + 符尾三角。scale 相对 (0.5,0.5) 缩放，几何常量相对锚点同步缩放。 */
function inNote(px, py, size, scale) {
  const ux = ((px / size - 0.5) * scale + 0.5) * size;
  const uy = ((py / size - 0.5) * scale + 0.5) * size;
  const k = scale;
  // 锚点：符头中心 (0.40S, 0.68S)
  const anchorX = 0.4 * size;
  const anchorY = 0.68 * size;

  // 符头：旋转椭圆
  const rot = (-25 * Math.PI) / 180;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const dx = (ux - anchorX) * cos + (uy - anchorY) * sin;
  const dy = -(ux - anchorX) * sin + (uy - anchorY) * cos;
  const rx = 0.155 * size * k;
  const ry = 0.115 * size * k;
  if ((dx / rx) ** 2 + (dy / ry) ** 2 <= 1) return true;

  // 符干：锚点右侧 [0.125S, 0.165S]，从 0.20S 到锚点
  const left = anchorX + 0.125 * size * k;
  const right = anchorX + 0.165 * size * k;
  const top = anchorY - 0.48 * size * k;
  if (ux >= left && ux <= right && uy >= top && uy <= anchorY) return true;

  // 符尾：三角 (0.165,-0.48) (0.32,-0.38) (0.165,-0.24)（相对锚点）
  const ax = anchorX + 0.165 * size * k;
  const ay = anchorY - 0.48 * size * k;
  const bx = anchorX + 0.32 * size * k;
  const by = anchorY - 0.38 * size * k;
  const cx = anchorX + 0.165 * size * k;
  const cy = anchorY - 0.24 * size * k;
  const d1 = (ux - bx) * (ay - by) - (ax - bx) * (uy - by);
  const d2 = (ux - cx) * (by - cy) - (bx - cx) * (uy - cy);
  const d3 = (ux - ax) * (cy - ay) - (cx - ax) * (uy - ay);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

const BG = [28, 28, 28]; // #1c1c1c
const NOTE = [236, 236, 236]; // #ececec

function renderIcon(size, { background = null, noteScale = 1 } = {}) {
  const SS = 3;
  const N = SS * SS;
  const rgba = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let bgCov = 0;
      let noteCov = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS;
          const py = y + (sy + 0.5) / SS;
          if (background && inBackground(px, py, size, background)) bgCov++;
          if (inNote(px, py, size, noteScale)) noteCov++;
        }
      }
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      if (bgCov > 0) {
        const ba = bgCov / N;
        r = BG[0] * ba;
        g = BG[1] * ba;
        b = BG[2] * ba;
        a = ba;
      }
      if (noteCov > 0) {
        const na = noteCov / N;
        r = NOTE[0] * na + r * (1 - na);
        g = NOTE[1] * na + g * (1 - na);
        b = NOTE[2] * na + b * (1 - na);
        a = na + a * (1 - na);
      }
      const i = (y * size + x) * 4;
      rgba[i] = Math.round(r);
      rgba[i + 1] = Math.round(g);
      rgba[i + 2] = Math.round(b);
      rgba[i + 3] = Math.round(a * 255);
    }
  }
  return encodePng(size, size, rgba);
}

// ---------- 补丁 ----------

function patchStringsXml() {
  const p = join(GEN, 'app', 'src', 'main', 'res', 'values', 'strings.xml');
  let s = readFileSync(p, 'utf8');
  if (!s.includes(APP_NAME)) {
    s = s.replaceAll('>"Ref"<', `>${APP_NAME}<`);
    writeFileSync(p, s);
    console.log(`patched: ${p}`);
  }
}

function patchGradle() {
  const p = join(GEN, 'app', 'build.gradle.kts');
  let s = readFileSync(p, 'utf8');
  let changed = false;
  if (s.includes('compileSdk = 36')) {
    s = s.replace('compileSdk = 36', 'compileSdk = 35');
    changed = true;
  }
  if (s.includes('targetSdk = 36')) {
    s = s.replace('targetSdk = 36', 'targetSdk = 35');
    changed = true;
  }
  if (changed) {
    writeFileSync(p, s);
    console.log(`patched: ${p}`);
  }
}

function patchIcons() {
  const sizes = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
  for (const [dpi, size] of Object.entries(sizes)) {
    const dir = join(GEN, 'app', 'src', 'main', 'res', `mipmap-${dpi}`);
    writeFileSync(join(dir, 'ic_launcher.png'), renderIcon(size, { background: 'rounded' }));
    writeFileSync(join(dir, 'ic_launcher_round.png'), renderIcon(size, { background: 'circle' }));
    writeFileSync(join(dir, 'ic_launcher_foreground.png'), renderIcon(size, { noteScale: 0.72 }));
  }
  console.log('patched: launcher icons');
}

patchStringsXml();
patchGradle();
patchIcons();
console.log('android-patch done');
