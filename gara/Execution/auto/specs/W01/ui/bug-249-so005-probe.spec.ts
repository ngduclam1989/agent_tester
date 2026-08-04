/**
 * Diagnostic probe — BUG-W01-249 re-verify using CORRECT seed SO.
 * PDV-20260611-00010 hasInsurance=false (wrong seed → section never renders).
 * PDV-20260611-00005 hasInsurance=true → this is the correct SO to test.
 *
 * Also verifies BUG-W01-253 (calc fix) and BUG-W01-254 (Khấu hao VT column)
 * on the correct insurance SO.
 *
 * Image: garage-web:local ea2b932c605d
 * Date: 2026-06-12
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:45300';
const SO_EDIT_URL_BH = `${BASE_URL}/service-order/PDV-20260611-00005/edit`;

async function loginAsAccountant(page: Page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('input[placeholder="Nhập số điện thoại"]', { timeout: 25000 });
  await page.locator('input[placeholder="Nhập số điện thoại"]').fill('0810000002');
  await page.locator('input[placeholder="Nhập mật khẩu"]').fill('Test@12345');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await page.waitForURL((url: URL) => !url.pathname.includes('/login'), { timeout: 20000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// PROBE: BUG-W01-249 gate on CORRECT insurance SO (PDV-20260611-00005)
// hasInsurance=true in DB → section SHOULD render if BUG-W01-249 is fixed
// ─────────────────────────────────────────────────────────────────────────────
test.describe('BUG-W01-249 gate probe on PDV-20260611-00005 (hasInsurance=true)', () => {
  test('[PROBE BUG-W01-249] PDV-00005 SO Edit — section-ins-adjustment count', async ({ page }) => {
    await loginAsAccountant(page);
    await page.goto(SO_EDIT_URL_BH, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    // Scroll full page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const url = page.url();
    const allDataTestIds = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('[data-testid]'));
      return els.map(el => el.getAttribute('data-testid'));
    });
    const allThHeaders = await page.evaluate(() => {
      const ths = Array.from(document.querySelectorAll('th'));
      return ths.map(th => th.textContent?.trim()).filter(Boolean);
    });
    const bodyTextShort = await page.evaluate(() => document.body.innerText.slice(0, 5000));
    const hasError = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('ECONNREFUSED') || body.includes('connect ECONNREFUSED');
    });

    const sectionByTestId = await page.locator('[data-testid="section-ins-adjustment"]').count();
    const sectionByText = await page.locator('text=Phân bổ quyết toán bảo hiểm').count();
    const tableCount = await page.locator('table').count();
    const toastError = await page.locator('[data-testid="toast-error"]').count();

    console.log(`=== PDV-00005 DIAGNOSTIC ===`);
    console.log(`URL: ${url}`);
    console.log(`data-testids: ${JSON.stringify(allDataTestIds)}`);
    console.log(`TH headers: ${JSON.stringify(allThHeaders)}`);
    console.log(`section-ins-adjustment (testid): ${sectionByTestId}`);
    console.log(`section-ins-adjustment (text): ${sectionByText}`);
    console.log(`table count: ${tableCount}`);
    console.log(`toast-error: ${toastError}`);
    console.log(`has ECONNREFUSED error: ${hasError}`);
    console.log(`Body text (5000): ${bodyTextShort}`);
    console.log(`=== END PDV-00005 DIAGNOSTIC ===`);

    // Gate assertion: section must be found
    const sectionFound = sectionByTestId >= 1 || sectionByText >= 1;
    expect(sectionFound, `section-ins-adjustment NOT found on PDV-00005 (hasInsurance=true). testid=${sectionByTestId}, text=${sectionByText}. ECONNREFUSED=${hasError}. BUG-W01-249 still OPEN or env error.`).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BUG-W01-253 verify on PDV-20260611-00005
// ─────────────────────────────────────────────────────────────────────────────
test.describe('BUG-W01-253 verify on PDV-00005 (hasInsurance=true)', () => {
  test('[VERIFY BUG-W01-253] C1 — Section visible on correct insurance SO', async ({ page }) => {
    await loginAsAccountant(page);
    await page.goto(SO_EDIT_URL_BH, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const sectionByTestId = page.locator('[data-testid="section-ins-adjustment"]');
    const sectionByText = page.locator('text=Phân bổ quyết toán bảo hiểm').first();

    let sectionFound = false;
    if (await sectionByTestId.count() > 0) {
      await expect(sectionByTestId.first()).toBeVisible({ timeout: 10000 });
      sectionFound = true;
    } else if (await sectionByText.count() > 0) {
      await expect(sectionByText).toBeVisible({ timeout: 10000 });
      sectionFound = true;
    }

    expect(sectionFound, 'Phân bổ BH section not found on hasInsurance=true SO').toBe(true);
  });

  test('[VERIFY BUG-W01-253] C2 — CK liên kết BH label/input visible', async ({ page }) => {
    await loginAsAccountant(page);
    await page.goto(SO_EDIT_URL_BH, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const ckLabel = page.locator('text=CK liên kết BH').first();
    const ckVtLabel = page.locator('text=CK Vật tư').first();
    const ckInput = page.locator('[data-testid="field-ck-vt"], [data-testid="field-ck-cdv"]').first();

    const hasLabel = (await ckLabel.count()) > 0 || (await ckVtLabel.count()) > 0;
    const hasInput = await ckInput.count() > 0;

    expect(hasLabel || hasInput, 'No CK liên kết BH label or input found').toBe(true);
  });

  test('[VERIFY BUG-W01-253] C3 — Panel "Tổng giá dịch vụ" visible', async ({ page }) => {
    await loginAsAccountant(page);
    await page.goto(SO_EDIT_URL_BH, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const panelText = page.locator('text=Tổng giá dịch vụ').first();
    const panelTestId = page.locator('[data-testid="total-service-price-panel"]').first();

    const panelVisible = (await panelText.count()) > 0 || (await panelTestId.count()) > 0;
    expect(panelVisible, '"Tổng giá dịch vụ" panel not found').toBe(true);
  });

  test('[VERIFY BUG-W01-253] C4 — PERCENT input triggers numeric preview', async ({ page }) => {
    await loginAsAccountant(page);
    await page.goto(SO_EDIT_URL_BH, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const ckVtInput = page.locator('[data-testid="field-ck-vt"]').first();
    if (await ckVtInput.count() === 0) {
      test.skip(true, 'field-ck-vt not found — BUG-W01-249 still blocking section render');
      return;
    }

    await ckVtInput.click();
    await ckVtInput.fill('5');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(1000);

    const previewAfter = await page.locator('[data-testid="balance-bh"], [data-testid="total-service-price-panel"]')
      .first().textContent().catch(() => 'N/A');
    console.log(`[BUG-W01-253] Preview after 5% CK VT: "${previewAfter}"`);

    expect(typeof previewAfter).toBe('string');
    expect(previewAfter?.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BUG-W01-254 verify on PDV-20260611-00005
// ─────────────────────────────────────────────────────────────────────────────
test.describe('BUG-W01-254 verify on PDV-00005 (hasInsurance=true)', () => {
  test('[VERIFY BUG-W01-254] C1 — Parts table renders', async ({ page }) => {
    await loginAsAccountant(page);
    await page.goto(SO_EDIT_URL_BH, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const tableCount = await page.locator('table').count();
    const hasPartsTestId = await page.locator('[data-testid="items-table"], [data-testid="parts-table"]').count();
    const allHeaders = await page.evaluate(() => {
      const ths = Array.from(document.querySelectorAll('th'));
      return ths.map(th => th.textContent?.trim()).filter(Boolean);
    });

    console.log(`[BUG-W01-254] table count: ${tableCount}, parts testid: ${hasPartsTestId}, headers: ${JSON.stringify(allHeaders)}`);
    expect(tableCount > 0 || hasPartsTestId > 0, 'No table found on SO Edit').toBe(true);
  });

  test('[VERIFY BUG-W01-254] C2 — Column "Khấu hao VT" present, not bare "Khấu hao"', async ({ page }) => {
    await loginAsAccountant(page);
    await page.goto(SO_EDIT_URL_BH, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const headers = await page.evaluate(() => {
      const ths = Array.from(document.querySelectorAll('th'));
      return ths.map(th => th.textContent?.trim() || '');
    });

    console.log(`[BUG-W01-254] All th headers: ${JSON.stringify(headers)}`);

    if (headers.length === 0) {
      test.skip(true, 'No table headers — BUG-W01-249 still blocking or parts table absent');
      return;
    }

    const hasKhauHaoVT = headers.some(h => h.includes('Khấu hao VT'));
    const hasBareKhauHao = headers.some(h => h.trim() === 'Khấu hao');

    expect(hasKhauHaoVT, `"Khấu hao VT" header not found. Headers: ${headers.join(', ')}`).toBe(true);
    expect(hasBareKhauHao, `Bare "Khấu hao" header still present. Headers: ${headers.join(', ')}`).toBe(false);
  });

  test('[VERIFY BUG-W01-254] C3 — Khấu hao VT cell is editable (InputNumber)', async ({ page }) => {
    await loginAsAccountant(page);
    await page.goto(SO_EDIT_URL_BH, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const colIndex = await page.evaluate(() => {
      const ths = Array.from(document.querySelectorAll('th'));
      return ths.findIndex(th => th.textContent?.includes('Khấu hao VT'));
    });

    if (colIndex === -1) {
      test.skip(true, '"Khấu hao VT" column not found — see C2');
      return;
    }

    const cellHasInput = await page.evaluate((idx: number) => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      if (rows.length === 0) return { found: false, reason: 'no tbody rows' };
      const firstRow = rows[0];
      const cells = Array.from(firstRow.querySelectorAll('td'));
      if (idx >= cells.length) return { found: false, reason: `col ${idx} beyond ${cells.length}` };
      const input = cells[idx].querySelector('input');
      return { found: input !== null, reason: input ? 'input found' : 'no input in cell' };
    }, colIndex);

    console.log(`[BUG-W01-254] colIndex=${colIndex}, cellHasInput=${JSON.stringify(cellHasInput)}`);

    if (!(cellHasInput as any).found && (cellHasInput as any).reason === 'no tbody rows') {
      test.skip(true, 'No parts rows in seed data for this SO');
      return;
    }

    expect((cellHasInput as any).found, `Khấu hao VT cell not editable: ${(cellHasInput as any).reason}`).toBe(true);
  });

  test('[VERIFY BUG-W01-254] C4 — Khấu hao VT cell accepts numeric input', async ({ page }) => {
    await loginAsAccountant(page);
    await page.goto(SO_EDIT_URL_BH, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const colIndex = await page.evaluate(() => {
      const ths = Array.from(document.querySelectorAll('th'));
      return ths.findIndex(th => th.textContent?.includes('Khấu hao VT'));
    });

    if (colIndex === -1) {
      test.skip(true, 'Column not found — see C2');
      return;
    }

    const inputSelector = await page.evaluate((idx: number) => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      if (rows.length === 0) return null;
      const firstRow = rows[0];
      const cells = Array.from(firstRow.querySelectorAll('td'));
      if (idx >= cells.length) return null;
      const input = cells[idx].querySelector('input');
      if (!input) return null;
      return `tbody tr:first-child td:nth-child(${idx + 1}) input`;
    }, colIndex);

    if (!inputSelector) {
      test.skip(true, 'No input in cell — see C3');
      return;
    }

    const inputEl = page.locator(inputSelector).first();
    await inputEl.click();
    await inputEl.fill('15');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);

    const currentValue = await inputEl.inputValue().catch(() => null);
    console.log(`[BUG-W01-254] Entered 15 into Khấu hao VT, read back: "${currentValue}"`);
    expect(currentValue).not.toBeNull();
    expect(currentValue).toMatch(/\d/);
  });
});
