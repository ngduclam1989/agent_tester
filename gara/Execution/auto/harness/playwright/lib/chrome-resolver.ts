import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

/**
 * Resolve Chrome/Chromium executable portable qua mọi máy chạy harness (Lớp A frozen).
 *
 * Ưu tiên:
 *   1. ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH (escape hatch tuyệt đối)
 *   2. Quét ĐỘNG ms-playwright cache — chromium-* build MỚI NHẤT (bền qua version bump,
 *      KHÔNG hardcode chromium-1228/1223 nữa → Playwright bump version vẫn tự tìm được)
 *   3. Puppeteer legacy cache (linux)
 *   4. Fallback 'chromium' (để Playwright tự lo bundled browser)
 *
 * getChromeExecutable(): string — giữ nguyên signature cho playwright.config.ts.
 */

// Quét 1 cache root ms-playwright, trả path chrome của build chromium-* cao nhất
function scanMsPlaywright(root: string): string | undefined {
  if (!existsSync(root)) return undefined;
  const builds = readdirSync(root)
    // chromium-1228, chromium-1223 … (loại chromium_headless_shell-*)
    .filter((d) => d.startsWith('chromium-') && !d.includes('headless'))
    .sort((a, b) => Number(b.split('-')[1] || 0) - Number(a.split('-')[1] || 0));
  for (const b of builds) {
    const rels = [
      ['chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'],
      ['chrome-mac-x64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'],
      ['chrome-linux64', 'chrome'],
      ['chrome-linux', 'chrome'],
    ];
    for (const rel of rels) {
      const p = join(root, b, ...rel);
      if (existsSync(p)) return p;
    }
  }
  return undefined;
}

// Quét puppeteer legacy cache (linux-/mac- version dirs)
function scanPuppeteer(root: string): string | undefined {
  if (!existsSync(root)) return undefined;
  for (const d of readdirSync(root)) {
    const rels = [
      ['chrome-linux64', 'chrome'],
      ['chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'],
    ];
    for (const rel of rels) {
      const p = join(root, d, ...rel);
      if (existsSync(p)) return p;
    }
  }
  return undefined;
}

export function getChromeExecutable(): string {
  // 1. ENV override
  const env = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  if (env && existsSync(env)) return env;

  const home = homedir();

  // 2. ms-playwright caches (quét động, mọi máy)
  const msRoots = [
    join(home, 'Library', 'Caches', 'ms-playwright'), // macOS
    join(home, '.cache', 'ms-playwright'),            // Linux
    '/home/engineer_ac/.cache/ms-playwright',         // shared linux dev box
  ];
  for (const root of msRoots) {
    const hit = scanMsPlaywright(root);
    if (hit) return hit;
  }

  // 3. Puppeteer legacy
  const puppeteerRoots = [
    join(home, '.cache', 'puppeteer', 'chrome'),
    '/home/all_engineer/.cache/puppeteer/chrome',
  ];
  for (const root of puppeteerRoots) {
    const hit = scanPuppeteer(root);
    if (hit) return hit;
  }

  // 4. Để Playwright tự lo bundled browser
  return 'chromium';
}
