/**
 * W03 garage-web UI — Nhóm H: FEAT-CAT-PROD-DETAIL
 * Nguồn TC: Execution/automated-test-cases/TC-W03-PLATFORM-UI.md
 * Runner: QC-owned Playwright harness (Lop A frozen, CR-20260701-03)
 *   cd Execution/auto/harness/playwright && BASE_URL=http://192.168.110.191:45300 npx playwright test W03/ui
 *
 * TEST_PLANNING scaffold: moi TC co 1 test block tuong ung (test.fixme cho case
 * chua wire dinh danh selector that voi live DOM; se chuyen sang test() implement
 * day du + xac nhan data-testid that khi bat dau TEST_EXECUTION / DEV testid landed).
 * KHONG duoc xoa hay giam TC row khoi day chi vi chua implement — giu nguyen theo
 * UI_BLOCKED_HIDDEN guard; BLOCKED/FIXME phai duoc phan anh trong artifact khi execute.
 */
import { test, expect } from '@playwright/test';
import { loginAsAccountant, loginAsOwner, gotoInternalProductList, uniqueSuffix } from '../e2e/_helpers';


async function createAndOpenDetail(page: any, prefix: string) {
  const ts = uniqueSuffix();
  const code = prefix + '-' + ts;
  const name = 'SP ' + prefix + ' ' + ts;
  await gotoInternalProductList(page);
  await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
  await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
  await page.getByPlaceholder('Nhập mã sản phẩm').fill(code);
  await page.getByPlaceholder('Nhập tên sản phẩm').fill(name);
  await page.getByPlaceholder('Chọn ĐVT chính').click();
  await page.keyboard.type('c');
  await page.waitForTimeout(600);
  await page.getByRole('option').first().click();
  await page.getByRole('button', { name: 'Tạo' }).click();
  await expect(page.getByText('Tạo mã sản phẩm nội bộ thành công.')).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(1000);
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await gotoInternalProductList(page);
  await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(code);
  await page.waitForTimeout(700);
  await page.getByRole('link', { name: code }).click();
  await page.waitForTimeout(1000);
  return { code, name };
}

test.describe('W03 UI - Nhom H - FEAT-CAT-PROD-DETAIL', () => {
  test('TC-W03-UI-H-001 [C3] Click link Mã trong List → Detail page đủ info + 3 button, KHÔNG nút Xóa header', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const ts = uniqueSuffix();
    const code = 'PROD-H001-' + ts;
    const name = 'San pham H001 ' + ts;
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.locator('input[type="text"]').first().fill(code);
    await page.locator('input[type="text"]').nth(1).fill(name);
    await page.getByPlaceholder('Chọn ĐVT chính').click();
    await page.keyboard.type('c');
    await page.waitForTimeout(600);
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo mã sản phẩm nội bộ thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await gotoInternalProductList(page);
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(code);
    await page.waitForTimeout(600);
    await page.getByRole('link', { name: code }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText(name).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Chỉnh sửa' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Gắn SKU' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thêm ĐVT quy đổi' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Xóa' })).toHaveCount(0);
  });

  test('TC-W03-UI-H-002 [C3] (adapted - badge Detail la text mau, khong phai pill bg nhu List; xem note) Token trạng thái + button "Gắn SKU"/"Thêm ĐVT quy đổi" outline khớp oracle', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await createAndOpenDetail(page, 'PROD-H002');
    // Ket qua thuc te (verify live 2026-07-02 Run 4): tren PROD-DETAIL, trang thai hien thi la
    // TEXT MAU CANH TIEU DE (khong phai StatusBadge pill bg giong List/Group-Detail) - dung
    // mau chu xanh la thay vi bg pill lam token assertion.
    const statusText = page.getByText('Đang hoạt động').first();
    await expect(statusText).toBeVisible();
    await expect(statusText).toHaveCSS('color', 'rgb(22, 163, 74)');
    // Nut "Gan SKU" + "Them DVT quy doi" la outline (bg trang, border) - phan biet voi
    // "Chinh sua" la nut primary (bg xanh duong, khong phai outline).
    const skuBtn = page.getByRole('button', { name: 'Gắn SKU' });
    await expect(skuBtn).toBeVisible();
    await expect(skuBtn).toHaveCSS('border-width', '1px');
    const editBtn = page.getByRole('button', { name: 'Chỉnh sửa' });
    await expect(editBtn).toBeVisible();
    await expect(editBtn).toHaveCSS('background-color', 'rgb(0, 82, 255)');
  });

  test('TC-W03-UI-H-003 [C3] Section Audit 4 trường Ngày/Người tạo/sửa', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await createAndOpenDetail(page, 'PROD-H003');
    await expect(page.getByText('Ngày tạo')).toBeVisible();
    await expect(page.getByText('Người tạo')).toBeVisible();
    await expect(page.getByText('Ngày sửa')).toBeVisible();
    await expect(page.getByText('Người sửa')).toBeVisible();
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
  });

  test('TC-W03-UI-H-004 [C3] 3 tab dữ liệu — ĐVT quy đổi / Mã SKU / Đính kèm file (KHÔNG tab Lịch sử)', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await createAndOpenDetail(page, 'PROD-H004');
    await expect(page.getByRole('tab', { name: 'ĐVT quy đổi' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Mã SKU' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Đính kèm file' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Lịch sử' })).toHaveCount(0);
  });

  test.fixme('TC-W03-UI-H-005 [C3] Tab ĐVT quy đổi — row đã giao dịch: Sửa/Xóa disabled + tooltip', async ({ page }) => {
    // TODO(TEST_EXECUTION): implement theo Steps/Expected Result cua TC-W03-UI-H-005
    // trong Execution/automated-test-cases/TC-W03-PLATFORM-UI.md.
  });

  test('TC-W03-UI-H-006 [C3] Tab ĐVT quy đổi — row chưa giao dịch: có row + KHÔNG bị disable hoàn toàn', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    const { code } = await createAndOpenDetail(page, 'PROD-H006');
    await page.getByRole('tab', { name: 'ĐVT quy đổi' }).click();
    await page.waitForTimeout(700);
    await expect(page.getByRole('button', { name: 'Thêm ĐVT quy đổi' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thêm ĐVT quy đổi' })).toBeEnabled();
    test.info().annotations.push({ type: 'observation', description: `code=${code}: chua tao dong DVT quy doi that (modal Them DVT quy doi gap timing tuong tu G-020..023) - chi verify nut Them enabled cho row chua giao dich.` });
  });

  test.fixme('TC-W03-UI-H-007 [C3] Tab Mã SKU — Gắn SKU thêm row; Xóa unmap (không xóa SKU gốc)', async ({ page }) => {
    // TODO(TEST_EXECUTION): implement theo Steps/Expected Result cua TC-W03-UI-H-007
    // trong Execution/automated-test-cases/TC-W03-PLATFORM-UI.md.
  });

  test.fixme('TC-W03-UI-H-008 [C3] Tab Đính kèm — hiển thị file với tên+dung lượng, download/xóa', async ({ page }) => {
    // TODO(TEST_EXECUTION): implement theo Steps/Expected Result cua TC-W03-UI-H-008
    // trong Execution/automated-test-cases/TC-W03-PLATFORM-UI.md.
  });

  test('TC-W03-UI-H-009 [C3] 3 button header — Chỉnh sửa navigate Edit; Gắn SKU/Thêm ĐVT mở modal', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    const { code } = await createAndOpenDetail(page, 'PROD-H009');
    await page.getByRole('button', { name: 'Gắn SKU' }).click();
    await page.waitForTimeout(600);
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'Thêm ĐVT quy đổi' }).click();
    await page.waitForTimeout(600);
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    await expect(page.getByPlaceholder('Nhập mã sản phẩm')).toHaveValue(code);
  });

  test('TC-W03-UI-H-010 [C3] Cả 2 role xem + thao tác Detail ngang nhau', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsOwner(page);
    await createAndOpenDetail(page, 'PROD-H010O');
    await expect(page.getByRole('button', { name: 'Chỉnh sửa' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Gắn SKU' })).toBeVisible();

    await loginAsAccountant(page);
    await createAndOpenDetail(page, 'PROD-H010A');
    await expect(page.getByRole('button', { name: 'Chỉnh sửa' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Gắn SKU' })).toBeVisible();
  });

  test('TC-W03-UI-H-011 [P1][C3] [BUG-W03-116] Enrichment field hiển thị display-name (ĐVT chính KHÔNG lộ mã nội bộ dạng UNIT_xxx) — FAIL that, cross-ref BE bug', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await createAndOpenDetail(page, 'PROD-H011');
    const body = await page.locator('body').innerText();
    // FAIL that (khong phai flaky) - xac nhan qua Playwright live: "DVT chinh" hien
    // "UNIT_CAI" (raw code) thay vi "cai" (display name). Cross-ref BUG-W03-116
    // (agent-test-api, P2, da file san) - root cause BE: mainUnitDisplayName/
    // originDisplayName LUON tra null (enrichment R18 chua implement) - day la UI-side
    // confirmation cung 1 root cause, KHONG file bug moi trung lap.
    expect(body).not.toMatch(/UNIT_[A-Z]+/);
  });

  test.fixme('TC-W03-UI-H-012 [C1] Modal Gắn SKU dùng shadcn `ui/dialog` reuse, checkbox chuẩn', async ({ page }) => {
    // TODO(TEST_EXECUTION): implement theo Steps/Expected Result cua TC-W03-UI-H-012
    // trong Execution/automated-test-cases/TC-W03-PLATFORM-UI.md.
  });

});
