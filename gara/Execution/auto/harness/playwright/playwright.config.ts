import { defineConfig, devices } from '@playwright/test';
import { getChromeExecutable } from './lib/chrome-resolver';

/**
 * QC-owned Playwright harness cho Garage E2E/UI journeys — Lớp A (frozen,
 * CR-20260701-03 §B1). Test agent (test-exec.md + agent-test-{e2e,ui}.md)
 * đọc READ-ONLY — không tự sửa file này trong lúc chạy /test-exec.
 *
 * testDir trỏ sang ../../specs (Execution/auto/specs/W{NN}/{e2e,ui}/)
 * outputDir trỏ sang ../../evidence/.playwright-raw (scratch, gitignored — CR-20260702-03).
 * Playwright TỰ ĐỘNG xoá sạch outputDir mỗi lần chạy test — KHÔNG được trỏ thẳng vào
 * Execution/auto/evidence/ (dùng CHUNG cho mọi test agent, kể cả agent không dùng
 * Playwright như isolation/security/api ghi JSON trực tiếp). Evidence PERSISTENT
 * (FAIL/BLOCKED screenshot cần giữ lại) PHẢI được agent copy thủ công ra
 * Execution/auto/evidence/W{NN}/* sau mỗi run — đúng convention test-exec.md,
 * KHÔNG dựa vào raw outputDir sống sót qua run kế tiếp.
 *
 * Chọn wave/type qua CLI positional filter (KHÔNG đẻ config riêng per wave):
 *   BASE_URL=http://localhost:45300 npx playwright test W02/ui
 *   BASE_URL=http://localhost:45300 npx playwright test W02/e2e
 *   npx playwright test --project=probe                     # smoke probe infra-level
 *   npx playwright test --project=probe probes/smoke.spec.ts
 *
 * baseURL CHỈ lấy từ BASE_URL env — KHÔNG hardcode IP máy cụ thể.
 * Executable path resolve qua lib/chrome-resolver.ts (union candidate mọi máy
 * + PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ưu tiên).
 *
 * NOTE: testMatch restricts to E2E + UI specs only (exclude api/ which requires axios/Jest harness).
 * API specs are run from Execution/auto/harness/api/ with Jest.
 *
 * Login note: identifier=phone number vd "0810000002" (accountant) hoặc
 * "0810000001" (owner). Credentials: phone/Test@12345 → SSO stub accept mọi
 * password cho user đã config.
 */

export default defineConfig({
  testDir: '../../specs',
  testMatch: ['**/e2e/**/*.spec.ts', '**/ui/**/*.spec.ts'],
  outputDir: '../../evidence/.playwright-raw',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60000,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:45300',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // CR-20260704-01 Phase 1 (Observability quick win): enable video recording cho FAIL run
    // → QC human replay được flow live thay vì chỉ đọc log/screenshot cuối. Video lưu ở
    // outputDir '../../evidence/.playwright-raw' (scratch, gitignored) — agent copy sang
    // Execution/auto/evidence/W{NN}/videos/ khi cần persistent.
    video: 'retain-on-failure',
    headless: true,
    locale: 'vi-VN',
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: getChromeExecutable(),
          // --disable-gpu + --disable-software-rasterizer BẮT BUỘC trên macOS arm64
          // (TL-W02-E2E-012 / BUG-W02-117: Chromium arm64 SEGV_ACCERR khi render form phức tạp)
          args: ['--disable-gpu', '--disable-software-rasterizer', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        },
      },
    },
    {
      name: 'probe',
      testDir: './probes',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: getChromeExecutable(),
          // --disable-gpu + --disable-software-rasterizer BẮT BUỘC trên macOS arm64
          // (TL-W02-E2E-012 / BUG-W02-117: Chromium arm64 SEGV_ACCERR khi render form phức tạp)
          args: ['--disable-gpu', '--disable-software-rasterizer', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        },
      },
    },
  ],
});
