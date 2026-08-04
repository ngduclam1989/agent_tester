import * as fs from 'fs';
import { PNG } from 'pngjs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pixelmatchMod = require('pixelmatch');
const pixelmatch = pixelmatchMod.default || pixelmatchMod;

/**
 * Helper Visual Pixel Diff Cấp 6 (Nhóm M-013..M-019) — so sánh screenshot
 * live browser thật với oracle PNG Figma đã prefetch tại
 * `Product/ux/figma-test-web/assets/wave03-{screen}/{node}.png`.
 *
 * QC-owned devDependency bổ sung vào harness (pixelmatch + pngjs, mirror
 * tiền lệ `xlsx` thêm ở Run 3) — KHÔNG đụng production code.
 *
 * Do khung hình Figma export (design-time frame size) hầu như KHÔNG khớp
 * chính xác kích thước viewport browser thật (font rendering/anti-alias/
 * data thật khác mock Figma), nên diffPixelRatio > 0.02 gần như LUÔN xảy ra
 * — đây là hành vi kỳ vọng theo chính TC artifact (§4 Nhóm M-013..M-019):
 * "diffPixelRatio ≤ 0.02 → MATCH; > 0.02 → ghi VISUAL_DRIFT (S3 observation,
 * KHÔNG block PASS); > 0.15 → WARN_HARD escalate S2." Việc chạy đúng so
 * sánh live-vs-oracle và phân loại kết quả CHÍNH LÀ mục đích test — không
 * phải điều kiện match tuyệt đối để PASS.
 */
export interface VisualDiffResult {
  comparable: boolean;
  diffPixelRatio: number | null;
  liveWidth: number;
  liveHeight: number;
  oracleWidth: number;
  oracleHeight: number;
  classification: 'MATCH' | 'VISUAL_DRIFT' | 'WARN_HARD' | 'SIZE_MISMATCH';
  note: string;
}

function cropToBuffer(png: PNG, w: number, h: number): Buffer {
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    png.data.copy(out, y * w * 4, y * png.width * 4, y * png.width * 4 + w * 4);
  }
  return out;
}

export function compareScreenshotToOracle(liveBuffer: Buffer, oracleAbsPath: string): VisualDiffResult {
  if (!fs.existsSync(oracleAbsPath)) {
    return {
      comparable: false,
      diffPixelRatio: null,
      liveWidth: 0,
      liveHeight: 0,
      oracleWidth: 0,
      oracleHeight: 0,
      classification: 'SIZE_MISMATCH',
      note: `Oracle PNG khong ton tai tai ${oracleAbsPath}`,
    };
  }
  const livePng = PNG.sync.read(liveBuffer);
  const oraclePng = PNG.sync.read(fs.readFileSync(oracleAbsPath));
  const w = Math.min(livePng.width, oraclePng.width);
  const h = Math.min(livePng.height, oraclePng.height);
  if (w < 10 || h < 10) {
    return {
      comparable: false,
      diffPixelRatio: null,
      liveWidth: livePng.width,
      liveHeight: livePng.height,
      oracleWidth: oraclePng.width,
      oracleHeight: oraclePng.height,
      classification: 'SIZE_MISMATCH',
      note: 'Vung overlap qua nho de so sanh co y nghia',
    };
  }
  const liveCrop = cropToBuffer(livePng, w, h);
  const oracleCrop = cropToBuffer(oraclePng, w, h);
  const diff = new PNG({ width: w, height: h });
  const diffPixels = pixelmatch(liveCrop, oracleCrop, diff.data, w, h, { threshold: 0.15 });
  const diffPixelRatio = diffPixels / (w * h);
  let classification: VisualDiffResult['classification'] = 'MATCH';
  if (diffPixelRatio > 0.15) classification = 'WARN_HARD';
  else if (diffPixelRatio > 0.02) classification = 'VISUAL_DRIFT';
  const sizeNote = (livePng.width !== oraclePng.width || livePng.height !== oraclePng.height)
    ? ` (kich thuoc khac nhau: live ${livePng.width}x${livePng.height} vs oracle ${oraclePng.width}x${oraclePng.height} — diff tren vung overlap ${w}x${h})`
    : '';
  return {
    comparable: true,
    diffPixelRatio,
    liveWidth: livePng.width,
    liveHeight: livePng.height,
    oracleWidth: oraclePng.width,
    oracleHeight: oraclePng.height,
    classification,
    note: `diffPixelRatio=${(diffPixelRatio * 100).toFixed(2)}% -> ${classification}${sizeNote}`,
  };
}
