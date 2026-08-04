/**
 * W02 UI Spec: Insurance Settlement Create
 * TC Coverage: TC-A01, TC-A02, TC-A03, TC-A04, TC-A05, TC-A06 (Phase A — FEAT-INS-STL-CREATE)
 * Regression: TC-R01 (Settlement Detail CR-20260612-01), TC-R02/R03 (SO 2-col CR-20260616-02), TC-R04 (Popup CR-20260612-02)
 *
 * Runner: QC-owned Playwright harness at Execution/auto/harness/playwright/
 * Command: BASE_URL=http://192.168.110.191:45300 npx playwright test -c pw-w02-ui.config.ts ../../specs/W02/ui/insurance-settlement.spec.ts
 *
 * Run 9 fixes (2026-06-24):
 *   - TC-A01: aria-label mismatch — button has aria-label="Tạo hồ sơ tài liệu quyết toán bảo hiểm", visible text "Tạo hồ sơ bảo hiểm"
 *             use locator('button:has-text("Tạo hồ sơ bảo hiểm")') instead of getByRole+name match
 *   - TC-A04: Radix UI keeps all tabpanels in DOM; .last() picks payment-history panel (inactive).
 *             After clicking dossier tab, use [data-state="active"] to get visible panel.
 */

import { test, expect, Page } from '@playwright/test';

// ---- Helpers ----
async function loginAsAccountant(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Số điện thoại').fill('0810000002');
  await page.getByLabel('Mật khẩu').fill('Test@12345');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20000 });
}

async function loginAsOwner(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Số điện thoại').fill('0810000001');
  await page.getByLabel('Mật khẩu').fill('Test@12345');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20000 });
}

// Fresh Data Mandate (Run 9 — fresh data 2026-06-24)
const SO_BH_CODE = process.env.SEED_SO_BH_CODE ?? 'PDV-20260624-00008';
const INS_SETTLEMENT_CODE = process.env.SEED_INS_STL_CODE ?? 'SET-20260624-00004';
const KH_SETTLEMENT_CODE = process.env.SEED_KH_STL_CODE ?? 'SET-20260624-00003';

// ---- TC-A01: Settlement Detail (INSURANCE) — Hồ sơ BH tab visible ----
test('TC-A01 [Wave][P1] Settlement detail BH — tab "Hồ sơ bảo hiểm đã xuất" visible, buttons present', async ({ page }) => {
  await loginAsAccountant(page);
  await page.goto(`/settlement-voucher/${INS_SETTLEMENT_CODE}`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1500);

  // Verify page heading contains settlement code
  await expect(page.locator('h1').first()).toContainText(INS_SETTLEMENT_CODE);

  // Verify 4-tab layout including "Hồ sơ bảo hiểm đã xuất"
  const tabs = page.locator('[role="tab"]');
  await expect(tabs.filter({ hasText: 'Bảng chi phí' })).toBeVisible();
  await expect(tabs.filter({ hasText: 'Chứng từ & hóa đơn' })).toBeVisible();
  await expect(tabs.filter({ hasText: 'Hồ sơ bảo hiểm đã xuất' })).toBeVisible();
  await expect(tabs.filter({ hasText: 'Lịch sử thanh toán' })).toBeVisible();

  // Verify insurance action buttons present
  // Note: button has aria-label="Tạo hồ sơ tài liệu quyết toán bảo hiểm" but visible text "Tạo hồ sơ bảo hiểm"
  // Using has-text to match by visible content (aria-label mismatch is BUG logged separately)
  await expect(page.locator('button:has-text("Tạo hồ sơ bảo hiểm")')).toBeVisible();
  await expect(page.getByRole('button', { name: /Xuất hồ sơ bảo hiểm/ })).toBeVisible();

  // Screenshot evidence
  await page.screenshot({ path: 'Execution/auto/evidence/W02/ui/screenshots/TC-A01-stl-bh-detail.png' });
});

// ---- TC-A02: Settlement Detail (CUSTOMER) — Hồ sơ BH tab NOT visible ----
test('TC-A02 [Wave][P1] Settlement detail KH — tab "Hồ sơ bảo hiểm đã xuất" NOT present (regression)', async ({ page }) => {
  await loginAsAccountant(page);
  await page.goto(`/settlement-voucher/${KH_SETTLEMENT_CODE}`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1500);

  // Customer settlement should NOT have "Hồ sơ bảo hiểm đã xuất" tab
  const hosoTab = page.locator('[role="tab"]').filter({ hasText: 'Hồ sơ bảo hiểm đã xuất' });
  await expect(hosoTab).not.toBeVisible();

  // Standard 3-tab layout for customer settlement
  const tabs = page.locator('[role="tab"]');
  await expect(tabs.filter({ hasText: 'Bảng chi phí' })).toBeVisible();
  await expect(tabs.filter({ hasText: 'Lịch sử thanh toán' })).toBeVisible();

  // "Tạo hồ sơ bảo hiểm" button NOT present on KH settlement
  await expect(page.locator('button:has-text("Tạo hồ sơ bảo hiểm")')).not.toBeVisible();

  await page.screenshot({ path: 'Execution/auto/evidence/W02/ui/screenshots/TC-A02-stl-kh-no-bh-tab.png' });
});

// ---- TC-A03: Insurance info fields visible on BH settlement detail ----
test('TC-A03 [Wave][P1] BH settlement detail — insurance info fields rendered (Công ty BH, Số HĐ, MST BH)', async ({ page }) => {
  await loginAsAccountant(page);
  await page.goto(`/settlement-voucher/${INS_SETTLEMENT_CODE}`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1500);

  // Insurance info fields should be visible
  await expect(page.getByText('Công ty bảo hiểm')).toBeVisible();
  await expect(page.getByText('Số hợp đồng bảo hiểm')).toBeVisible();
  await expect(page.getByText('Mã số thuế bảo hiểm')).toBeVisible();

  // Bảo hiểm section header visible
  await expect(page.getByText('Bảo hiểm').first()).toBeVisible();

  await page.screenshot({ path: 'Execution/auto/evidence/W02/ui/screenshots/TC-A03-bh-fields.png' });
});

// ---- TC-A04: "Hồ sơ bảo hiểm đã xuất" tab click — dossier tab content loads ----
test('TC-A04 [Wave][P1] Click tab "Hồ sơ bảo hiểm đã xuất" — tab content renders (empty or populated)', async ({ page }) => {
  await loginAsAccountant(page);
  await page.goto(`/settlement-voucher/${INS_SETTLEMENT_CODE}`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1500);

  // Click the "Hồ sơ bảo hiểm đã xuất" tab
  await page.locator('[role="tab"]').filter({ hasText: 'Hồ sơ bảo hiểm đã xuất' }).click();
  await page.waitForTimeout(1000);

  // Tab should be selected (active state)
  const activeTab = page.locator('[role="tab"][data-state="active"], [role="tab"][aria-selected="true"]').filter({ hasText: 'Hồ sơ bảo hiểm đã xuất' });
  await expect(activeTab).toBeVisible();

  // Tab content area should exist — Radix UI: use data-state="active" to find the visible panel
  // Not .last() which picks the final panel in DOM (payment-history) regardless of active state
  const tabContent = page.locator('[role="tabpanel"][data-state="active"]');
  await expect(tabContent).toBeVisible();

  await page.screenshot({ path: 'Execution/auto/evidence/W02/ui/screenshots/TC-A04-hoso-tab.png' });
});

// ---- TC-A05: Regression — SO Detail 2-col layout (CR-20260616-02) ----
test('TC-A05 [Regression][P1] SO Detail page renders correctly — 2-col layout not broken', async ({ page }) => {
  await loginAsAccountant(page);
  await page.goto(`/service-order/${SO_BH_CODE}`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1500);

  // SO detail page h1 visible
  await expect(page.locator('h1').first()).toBeVisible();

  // Standard SO detail tabs visible
  const tabs = page.locator('[role="tab"]');
  await expect(tabs.filter({ hasText: 'Dịch vụ & phụ tùng' })).toBeVisible();
  await expect(tabs.filter({ hasText: 'Thông tin khác' })).toBeVisible();

  // Print button present (actual label is 'In phiếu' dropdown — TL-W02-UI-002)
  await expect(page.getByRole('button', { name: /in phiếu/i })).toBeVisible();

  await page.screenshot({ path: 'Execution/auto/evidence/W02/ui/screenshots/TC-A05-so-detail-regression.png' });
});

// ---- TC-A06: Regression — Settlement Detail (INSURANCE) buttons/layout stable after CR ----
test('TC-A06 [Regression][P1] Settlement Detail BH — existing buttons and sections stable after CRs', async ({ page }) => {
  await loginAsAccountant(page);
  await page.goto(`/settlement-voucher/${INS_SETTLEMENT_CODE}`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1500);

  // Standard settlement detail controls still present
  await expect(page.getByRole('button', { name: 'Chỉnh sửa' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'In phiếu' })).toBeVisible();

  // No broken layout — page not showing error state
  await expect(page.getByText(/Lỗi|Error|404|500/i)).not.toBeVisible();

  await page.screenshot({ path: 'Execution/auto/evidence/W02/ui/screenshots/TC-A06-stl-detail-stable.png' });
});
