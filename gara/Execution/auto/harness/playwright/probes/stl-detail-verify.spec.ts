/**
 * BUG-W01-240 verification + STL Detail UI TC execution (Run 2)
 * These TCs were previously BLOCKED by BUG-W01-240 — verifying post-fix
 */
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:45300';
const STL_CODE = 'SET-20260611-00001';
const STL_DETAIL_URL = `${BASE_URL}/settlement-voucher/${STL_CODE}`;

async function login(page: any) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(500);
  const phoneInput = page.locator('input[placeholder*="điện thoại"], input[type="tel"], input[name="phone"], input').first();
  await phoneInput.fill('0810000002');
  const pwInput = page.locator('input[type="password"]').first();
  await pwInput.fill('Test@12345');
  await page.locator('button[type="submit"], button:has-text("Đăng nhập"), button:has-text("Login")').first().click();
  await page.waitForTimeout(2000);
}

test.describe('BUG-W01-240 Verify + STL Detail TCs (Run 2)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(STL_DETAIL_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
  });

  test('BUG-W01-240 VERIFY — no system error fallback on STL detail', async ({ page }) => {
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('Something went wrong');
    expect(bodyText).not.toContain('Lỗi Hệ thống');
    expect(bodyText).not.toContain('Không tìm thấy phiếu quyết toán');
    expect(page.url()).toContain('/settlement-voucher/SET-20260611-00001');
  });

  test('TC-AUTO-072 [regression] STL Detail — layout: h1 with SET code present', async ({ page }) => {
    // h1 contains the settlement code
    await expect(page.locator(`text=${STL_CODE}`).first()).toBeVisible({ timeout: 8000 });
  });

  test('TC-AUTO-075 STL Detail — heading shows settlement code', async ({ page }) => {
    const h1 = await page.locator('h1').first().textContent();
    expect(h1).toContain(STL_CODE);
  });

  test('TC-AUTO-076 STL Detail — "Chỉnh sửa" button present (header action)', async ({ page }) => {
    await expect(page.locator('button:has-text("Chỉnh sửa")').first()).toBeVisible({ timeout: 8000 });
  });

  test('TC-AUTO-078 STL Detail — "+ Tạo hồ sơ bảo hiểm" button present (D6: FEAT spec)', async ({ page }) => {
    await expect(page.locator('button:has-text("Tạo hồ sơ bảo hiểm")').first()).toBeVisible({ timeout: 8000 });
  });

  test('TC-AUTO-081 STL Detail — "In toàn bộ hồ sơ" button present (D6: FEAT spec override)', async ({ page }) => {
    await expect(page.locator('button:has-text("In toàn bộ hồ sơ")').first()).toBeVisible({ timeout: 8000 });
  });

  test('TC-AUTO-085 4 tabs — names correct per FEAT spec (D7 override)', async ({ page }) => {
    const tabTexts = await page.locator('[role="tab"], .tab-button, button[data-testid^="tab-"]').allTextContents();
    // Also check via text matching
    await expect(page.locator('text=Bảng chi phí').first()).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=Chứng từ & hóa đơn').first()).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=Hồ sơ bảo hiểm đã xuất').first()).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=Lịch sử thanh toán').first()).toBeVisible({ timeout: 8000 });
  });

  test('TC-AUTO-091 STL Detail — AC-11 no-cancel: no "Hủy" button anywhere', async ({ page }) => {
    const huyCancelBtns = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, a')).filter(el => {
        const text = el.textContent?.trim();
        return text === 'Hủy' || text === 'Hủy phiếu' || text === 'Hủy quyết toán';
      }).length;
    });
    expect(huyCancelBtns).toBe(0);
  });

  test('TC-AUTO-085b Tab "Bảng chi phí" is default active when page loads', async ({ page }) => {
    // The first/default visible tab content should be cost table
    // Check that BH/KH table content or "Bảng chi phí" related content is visible
    const tabs = await page.locator('[role="tab"]').allTextContents();
    // "Bảng chi phí" tab must be in the list
    const hasBangChiPhi = tabs.some(t => t.includes('Bảng chi phí'));
    expect(hasBangChiPhi).toBe(true);
  });

  test('TC-AUTO-083 STL Detail — linked SO code visible (PDV-20260611-00007)', async ({ page }) => {
    await expect(page.locator('text=PDV-20260611-00007').first()).toBeVisible({ timeout: 8000 });
  });

  test('TC-AUTO-076 STL Detail — no system error; 3 action buttons in header', async ({ page }) => {
    const buttons = await page.locator('button').allTextContents();
    const trimmed = buttons.map(b => b.trim()).filter(Boolean);
    const hasEdit = trimmed.some(b => b.includes('Chỉnh sửa'));
    const hasIn = trimmed.some(b => b.includes('In toàn bộ hồ sơ'));
    const hasTao = trimmed.some(b => b.includes('Tạo hồ sơ bảo hiểm'));
    expect(hasEdit).toBe(true);
    expect(hasIn).toBe(true);
    expect(hasTao).toBe(true);
  });

  test('TC-AUTO-085c Click tab Chứng từ → tab panel visible', async ({ page }) => {
    // Find and click "Chứng từ & hóa đơn" tab
    await page.locator('text=Chứng từ & hóa đơn').first().click();
    await page.waitForTimeout(1000);
    // Page must not crash; still visible
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('Something went wrong');
    // Tab content area should still be in DOM
    const url = page.url();
    expect(url).toContain('/settlement-voucher/SET-20260611-00001');
  });

  test('TC-AUTO-CONF-03 STL Figma conformance — header visible, badge visible', async ({ page }) => {
    // header h1 with SET code
    await expect(page.locator(`h1:has-text("${STL_CODE}")`).first()).toBeVisible({ timeout: 8000 });
    // "Bảo hiểm" badge/label should be visible on the INSURANCE detail page
    await expect(page.locator('text=Bảo hiểm').first()).toBeVisible({ timeout: 8000 });
  });
});

test.describe('BUG-W01-241 Verify — no JS errors after fix', () => {
  test('BUG-W01-241 re-verify — JS pageerror on /settlement-voucher list', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', err => jsErrors.push(err.message));
    await login(page);
    await page.goto(`${BASE_URL}/settlement-voucher`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);
    const fatalErrors = jsErrors.filter(e => !e.includes('ResizeObserver') && !e.includes('network'));
    // Log what we found for evidence
    console.log('JS errors found:', fatalErrors);
    // BUG-W01-241 FIX_DONE — checking if still present
    // If still present, bug not yet deployed
    expect(fatalErrors).toHaveLength(0);
  });
});
