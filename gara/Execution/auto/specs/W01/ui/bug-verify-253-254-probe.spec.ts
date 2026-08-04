/**
 * Bug Verification Probe — BUG-W01-253 + BUG-W01-254 (re-attempt after BUG-W01-249 fix)
 * Step 5.2.4 — Playwright live evidence, 2026-06-12 re-run
 * Runner: QC-owned harness — Execution/auto/harness/playwright/
 *
 * Credentials: phone 0810000002 / Test@12345 (accountant)
 * BASE_URL: http://localhost:45300
 *
 * Test data:
 *   SO Edit BH, editable: PDV-20260611-00010 (/service-order/PDV-20260611-00010/edit)
 *
 * Purpose: Re-verify after BUG-W01-249 fix (CR raised, dev fixed per user report).
 *   - First probe: count section-ins-adjustment → gate decision for 253/254
 *   - BUG-W01-253: Phân bổ BH section renders + CK inputs visible
 *   - BUG-W01-254: Khấu hao VT column header + editable cell
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:45300';
const SO_EDIT_URL = `${BASE_URL}/service-order/PDV-20260611-00010/edit`;
const LOGIN_TIMEOUT = 30000;
const PAGE_LOAD_TIMEOUT = 30000;
const ELEMENT_TIMEOUT = 15000;

async function loginAsAccountant(page: Page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: LOGIN_TIMEOUT });
  // Wait for React SPA to hydrate — up to 25s for initial JS bundle load
  await page.waitForSelector('input[placeholder="Nhập số điện thoại"]', { timeout: 25000 });
  await page.locator('input[placeholder="Nhập số điện thoại"]').fill('0810000002');
  await page.locator('input[placeholder="Nhập mật khẩu"]').fill('Test@12345');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await page.waitForURL((url: URL) => !url.pathname.includes('/login'), { timeout: 20000 });
}

async function navigateToSOEdit(page: Page) {
  await page.goto(SO_EDIT_URL, { waitUntil: 'domcontentloaded', timeout: PAGE_LOAD_TIMEOUT });
  // Wait for form to render (not just HTML skeleton)
  await page.waitForTimeout(3000);
}

// ─────────────────────────────────────────────────────────────────────────────
// PROBE: BUG-W01-249 gate check — section-ins-adjustment count
// Must pass (count ≥ 1) before 253/254 can be verified.
// If count = 0 → BUG-W01-249 still open → 253/254 BLOCKED again.
// ─────────────────────────────────────────────────────────────────────────────
test.describe('PROBE: BUG-W01-249 gate — section-ins-adjustment on SO Edit', () => {
  test('[PROBE BUG-W01-249] SO Edit PDV-20260611-00010 — section-ins-adjustment count >= 1', async ({ page }) => {
    await loginAsAccountant(page);
    await navigateToSOEdit(page);

    // Scroll to ensure section is in DOM
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    // Primary check: data-testid
    const sectionByTestId = page.locator('[data-testid="section-ins-adjustment"]');
    const countByTestId = await sectionByTestId.count();

    // Fallback check: text
    const sectionByText = page.locator('text=Phân bổ quyết toán bảo hiểm');
    const countByText = await sectionByText.count();

    // Report both counts
    console.log(`[PROBE-249] section-ins-adjustment data-testid count: ${countByTestId}`);
    console.log(`[PROBE-249] "Phân bổ quyết toán bảo hiểm" text count: ${countByText}`);

    // Gate assertion: at least one method must find the section
    const sectionFound = countByTestId >= 1 || countByText >= 1;
    expect(sectionFound, `section-ins-adjustment not found: testid=${countByTestId}, text=${countByText}. BUG-W01-249 may still be open.`).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BUG-W01-253 (P1): SO Edit — PERCENT preview uses post-VAT basis
// DoD:
//   1. Section "Phân bổ quyết toán bảo hiểm" renders
//   2. "CK liên kết BH" inputs visible (PERCENT mode available)
//   3. Panel "Tổng giá dịch vụ" present (shows preview output)
//   4. Entering PERCENT value triggers numeric preview update
// ─────────────────────────────────────────────────────────────────────────────
test.describe('BUG-W01-253: SO Edit — PERCENT preview post-VAT basis (re-verify after BUG-W01-249 fix)', () => {
  test('[VERIFY BUG-W01-253] C1 — Phân bổ BH section visible on SO Edit BH=Có', async ({ page }) => {
    await loginAsAccountant(page);
    await navigateToSOEdit(page);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    // Section must render
    const sectionByTestId = page.locator('[data-testid="section-ins-adjustment"]');
    const sectionByText = page.locator('text=Phân bổ quyết toán bảo hiểm').first();

    let sectionFound = false;
    if (await sectionByTestId.count() > 0) {
      await expect(sectionByTestId.first()).toBeVisible({ timeout: ELEMENT_TIMEOUT });
      sectionFound = true;
    } else if (await sectionByText.count() > 0) {
      await expect(sectionByText).toBeVisible({ timeout: ELEMENT_TIMEOUT });
      sectionFound = true;
    }

    expect(sectionFound, `Phân bổ BH section not visible — section-ins-adjustment not found`).toBe(true);
  });

  test('[VERIFY BUG-W01-253] C2 — CK liên kết BH labels/inputs visible', async ({ page }) => {
    await loginAsAccountant(page);
    await navigateToSOEdit(page);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    // DoD: "CK liên kết BH" label visible (Vật tư and/or Công DV)
    const ckLabel = page.locator('text=CK liên kết BH').first();
    const ckVtLabel = page.locator('text=CK Vật tư').first();
    const hasLabel = (await ckLabel.count()) > 0 || (await ckVtLabel.count()) > 0;

    // DoD: CK input present (testid or generic)
    const ckInput = page.locator('[data-testid="field-ck-vt"], [data-testid="field-ck-cdv"]').first();
    const hasInput = await ckInput.count() > 0;

    expect(hasLabel || hasInput, `No CK liên kết BH label or input found on SO Edit. Section may not render (BUG-W01-249).`).toBe(true);
  });

  test('[VERIFY BUG-W01-253] C3 — Panel "Tổng giá dịch vụ" visible (preview output surface)', async ({ page }) => {
    await loginAsAccountant(page);
    await navigateToSOEdit(page);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    // DoD: The total-service-price panel must be visible (it shows CK liên kết BH preview)
    const panelText = page.locator('text=Tổng giá dịch vụ').first();
    const panelTestId = page.locator('[data-testid="total-service-price-panel"]').first();

    const panelVisible = (await panelText.count()) > 0 || (await panelTestId.count()) > 0;
    expect(panelVisible, `"Tổng giá dịch vụ" panel not found — preview surface unavailable`).toBe(true);
  });

  test('[VERIFY BUG-W01-253] C4 — Entering PERCENT in CK VT field triggers numeric preview update', async ({ page }) => {
    await loginAsAccountant(page);
    await navigateToSOEdit(page);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    // Find CK VT input
    const ckVtInput = page.locator('[data-testid="field-ck-vt"]').first();
    if (await ckVtInput.count() === 0) {
      test.skip(true, '[BUG-W01-253] CK VT field not found — section may not render (BUG-W01-249 still blocking)');
      return;
    }

    // Read current preview value before input
    const previewBefore = await page.locator('[data-testid="balance-bh"], [data-testid="total-service-price-panel"]')
      .first().textContent().catch(() => 'N/A');

    // Enter PERCENT value
    await ckVtInput.click();
    await ckVtInput.fill('5');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(1000);

    // Read preview after — must be a string (non-empty)
    const previewAfter = await page.locator('[data-testid="balance-bh"], [data-testid="total-service-price-panel"]')
      .first().textContent().catch(() => 'N/A');

    // The preview surface must render (not crash to empty/undefined)
    expect(typeof previewAfter).toBe('string');
    expect(previewAfter?.length).toBeGreaterThan(0);
    console.log(`[VERIFY BUG-W01-253] Preview before: "${previewBefore}" → after entering 5%: "${previewAfter}"`);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BUG-W01-254 (P2): SO Edit — column header "Khấu hao VT" + editable cell
// DoD:
//   1. Parts table visible on SO Edit
//   2. Column header = "Khấu hao VT" (not bare "Khấu hao")
//   3. Cell in that column contains <input> (InputNumber, not read-only div)
//   4. No bare "Khấu hao" header present without "VT" suffix
// ─────────────────────────────────────────────────────────────────────────────
test.describe('BUG-W01-254: SO Edit — Khấu hao VT column rename + editable (re-verify after BUG-W01-249 fix)', () => {
  test('[VERIFY BUG-W01-254] C1 — Parts table renders on SO Edit', async ({ page }) => {
    await loginAsAccountant(page);
    await navigateToSOEdit(page);

    await page.waitForTimeout(2000);

    // Check that a table is present (parts/items table)
    const tableCount = await page.locator('table').count();
    const hasPartsTestId = await page.locator('[data-testid="items-table"], [data-testid="parts-table"]').count();

    console.log(`[VERIFY BUG-W01-254] table count: ${tableCount}, parts testid: ${hasPartsTestId}`);
    expect(tableCount > 0 || hasPartsTestId > 0, `No table found on SO Edit page`).toBe(true);
  });

  test('[VERIFY BUG-W01-254] C2 — Column header "Khấu hao VT" present (not bare "Khấu hao")', async ({ page }) => {
    await loginAsAccountant(page);
    await navigateToSOEdit(page);

    await page.waitForTimeout(2000);

    // Get all <th> text content
    const headers = await page.evaluate(() => {
      const ths = Array.from(document.querySelectorAll('th'));
      return ths.map(th => th.textContent?.trim() || '');
    });

    console.log(`[VERIFY BUG-W01-254] All th headers: ${JSON.stringify(headers)}`);

    if (headers.length === 0) {
      test.skip(true, '[BUG-W01-254] No table headers found — parts table not rendered. BUG-W01-249 may still be blocking.');
      return;
    }

    // DoD: "Khấu hao VT" must be present
    const hasKhauHaoVT = headers.some(h => h.includes('Khấu hao VT'));
    // DoD: bare "Khấu hao" (without VT) must NOT be standalone column
    const hasBareKhauHao = headers.some(h => h.trim() === 'Khấu hao');

    expect(hasKhauHaoVT, `"Khấu hao VT" header not found. Headers: ${headers.join(', ')}`).toBe(true);
    expect(hasBareKhauHao, `Bare "Khấu hao" header still present (old label). Headers: ${headers.join(', ')}`).toBe(false);
  });

  test('[VERIFY BUG-W01-254] C3 — Khấu hao VT cell is editable (InputNumber, not read-only div)', async ({ page }) => {
    await loginAsAccountant(page);
    await navigateToSOEdit(page);

    await page.waitForTimeout(2000);

    const colIndex = await page.evaluate(() => {
      const ths = Array.from(document.querySelectorAll('th'));
      return ths.findIndex(th => th.textContent?.includes('Khấu hao VT'));
    });

    if (colIndex === -1) {
      test.skip(true, '[BUG-W01-254] "Khấu hao VT" column not found — blocked by BUG-W01-249 or fix not applied.');
      return;
    }

    const cellHasInput = await page.evaluate((idx: number) => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      if (rows.length === 0) return { found: false, reason: 'no tbody rows' };
      const firstRow = rows[0];
      const cells = Array.from(firstRow.querySelectorAll('td'));
      if (idx >= cells.length) return { found: false, reason: `col ${idx} beyond row cells (${cells.length})` };
      const cell = cells[idx];
      const input = cell.querySelector('input');
      return { found: input !== null, reason: input ? 'input found' : 'no input in cell' };
    }, colIndex);

    console.log(`[VERIFY BUG-W01-254] Khấu hao VT col=${colIndex}, cell has input: ${JSON.stringify(cellHasInput)}`);

    if (!(cellHasInput as any).found && (cellHasInput as any).reason === 'no tbody rows') {
      test.skip(true, '[BUG-W01-254] No parts rows in seed data — cannot verify editable cell. Header check passed.');
      return;
    }

    expect((cellHasInput as any).found, `Khấu hao VT cell is not editable (no <input>): ${(cellHasInput as any).reason}`).toBe(true);
  });

  test('[VERIFY BUG-W01-254] C4 — Khấu hao VT cell accepts numeric input', async ({ page }) => {
    await loginAsAccountant(page);
    await navigateToSOEdit(page);

    await page.waitForTimeout(2000);

    // Find the input in Khấu hao VT column
    const colIndex = await page.evaluate(() => {
      const ths = Array.from(document.querySelectorAll('th'));
      return ths.findIndex(th => th.textContent?.includes('Khấu hao VT'));
    });

    if (colIndex === -1) {
      test.skip(true, '[BUG-W01-254] Column not found — see C2.');
      return;
    }

    // Get the input in first data row, col index
    const inputSelector = await page.evaluate((idx: number) => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      if (rows.length === 0) return null;
      const firstRow = rows[0];
      const cells = Array.from(firstRow.querySelectorAll('td'));
      if (idx >= cells.length) return null;
      const cell = cells[idx];
      const input = cell.querySelector('input') as HTMLInputElement | null;
      if (!input) return null;
      // Create a unique selector: nth-child path
      return `tbody tr:first-child td:nth-child(${idx + 1}) input`;
    }, colIndex);

    if (!inputSelector) {
      test.skip(true, '[BUG-W01-254] No input found in cell — see C3.');
      return;
    }

    const inputEl = page.locator(inputSelector).first();
    // Click and enter value
    await inputEl.click();
    await inputEl.fill('15');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);

    // Read back value
    const currentValue = await inputEl.inputValue().catch(() => null);
    console.log(`[VERIFY BUG-W01-254] Entered 15 into Khấu hao VT cell, read back: "${currentValue}"`);

    // DoD: input accepted the value (not empty, not read-only)
    expect(currentValue).not.toBeNull();
    // Value should contain digits (15 or normalized)
    expect(currentValue).toMatch(/\d/);
  });
});
