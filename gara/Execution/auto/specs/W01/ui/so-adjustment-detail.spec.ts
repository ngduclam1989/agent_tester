/**
 * W01 UI Spec — SO Adjustment Detail (read-only insurance allocation section)
 * TCs: TC-AUTO-055, TC-AUTO-056, TC-AUTO-057, TC-AUTO-CONF-02
 * Cluster: C3 (Playwright live browser)
 *
 * Test data:
 *   SO with insurance (read-only, "Đã tạo quyết toán"): PDV-20260611-00007
 *
 * NOTE: No data-testid attributes in production build.
 * Selectors use semantic HTML / text-based patterns.
 *
 * Design discrepancy note (D2): Figma shows separate "Chiết khấu - Vật tư" and
 * "Chiết khấu - Công dịch vụ"; FEAT spec uses full names. FEAT wins.
 */
import { test, expect } from '@playwright/test';
import { login, BASE_URL } from './helpers';

const SO_WITH_INSURANCE = 'PDV-20260611-00007';

test.describe('SO Detail — Insurance Allocation Section (Read-only)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/service-order/${SO_WITH_INSURANCE}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
  });

  /**
   * TC-AUTO-055 [regression][C3]
   * FEAT-INS-SO-ADJUSTMENT AC-06: Trong màn Detail (BH=Có, đã tạo QT), section phân bổ
   * hiển thị read-only — không có input, không có "Áp dụng tất cả" button.
   */
  test('TC-AUTO-055 [regression] SO Detail — section "Phân bổ QT BH" read-only (no inputs, no Áp dụng tất cả)', async ({ page }) => {
    // STEP 1: Verify insurance allocation heading is present
    const insHeading = page.locator('h2:has-text("Phân bổ quyết toán bảo hiểm")');
    await expect(insHeading).toBeVisible({ timeout: 8000 });

    // STEP 2: No input/select/textarea in the insurance section
    const inputCount = await page.evaluate(() => {
      const h2s = Array.from(document.querySelectorAll('h2'));
      const insH2 = h2s.find(h => h.textContent?.includes('Phân bổ quyết toán'));
      if (!insH2) return -1;
      let container: HTMLElement | null = insH2;
      for (let i = 0; i < 4; i++) container = container?.parentElement || container;
      return container?.querySelectorAll('input:not([type="hidden"]), select, textarea').length ?? 0;
    });
    expect(inputCount).toBe(0);

    // STEP 3: "Áp dụng tất cả" button must NOT exist in detail view (edit-only control)
    await expect(page.locator('button:has-text("Áp dụng tất cả")')).toHaveCount(0);
  });

  /**
   * TC-AUTO-056 [C3]
   * FEAT-INS-SO-ADJUSTMENT AC-05: 5 allocation field labels must be visible.
   * Labels per FEAT spec (D2 override vs Figma short names):
   *   - Chiết khấu liên kết BH - Vật tư
   *   - Chiết khấu liên kết BH - Công dịch vụ
   *   - Khấu hao vật tư / thay mới
   *   - Giảm trừ bồi thường
   *   - Khấu trừ bảo hiểm
   */
  test('TC-AUTO-056 SO Detail — 5 allocation field labels visible (FEAT spec wording)', async ({ page }) => {
    const expectedLabels = [
      'Chiết khấu liên kết BH - Vật tư',
      'Chiết khấu liên kết BH - Công dịch vụ',
      'Khấu hao vật tư / thay mới',
      'Giảm trừ bồi thường',
      'Khấu trừ bảo hiểm',
    ];

    for (const labelText of expectedLabels) {
      await expect(page.locator(`text=${labelText}`).first()).toBeVisible({ timeout: 5000 });
    }
  });

  /**
   * TC-AUTO-057 [C3]
   * FEAT-INS-SO-ADJUSTMENT AC-07: Màn Detail không có nút "Lưu chỉnh sửa" hay "Lưu".
   */
  test('TC-AUTO-057 SO Detail — nút "Lưu chỉnh sửa" không tồn tại', async ({ page }) => {
    // In detail (read-only) mode: no save/lưu button
    await expect(page.locator('button:has-text("Lưu chỉnh sửa")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Lưu")')).toHaveCount(0);
  });

  /**
   * TC-AUTO-CONF-02 [C3] Oracle conformance — SO Detail
   * FEAT spec overrides Figma: heading H2, labels full names, no edit controls.
   */
  test('TC-AUTO-CONF-02 SO Detail — Oracle conformance: insurance section present + fully read-only', async ({ page }) => {
    // PRESENCE: insurance section heading
    await expect(page.locator('h2:has-text("Phân bổ quyết toán bảo hiểm")')).toBeVisible();

    // PRESENCE: "Bảo hiểm" badge/label
    await expect(page.locator('text=Bảo hiểm').first()).toBeVisible();

    // ABSENCE of edit controls
    await expect(page.locator('button:has-text("Áp dụng tất cả")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Lưu chỉnh sửa")')).toHaveCount(0);

    // PRESENCE: at least one monetary value in the section
    await expect(page.locator('text=160.000đ').first()).toBeVisible();
  });
});
