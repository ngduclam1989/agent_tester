/**
 * W03 garage-web UI — Nhóm J: FEAT-CAT-PROD-DELETE
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

test.describe('W03 UI - Nhom J - FEAT-CAT-PROD-DELETE', () => {
  test('TC-W03-UI-J-001 [C3] Icon Xóa mở dialog "Xác nhận"', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const ts = uniqueSuffix();
    const code = 'PROD-J001-' + ts;
    const name = 'San pham J001 ' + ts;
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
    await page.getByRole('row').filter({ hasText: code }).getByRole('button', { name: 'Xóa' }).click();
    await page.waitForTimeout(600);
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await expect(page.getByText(new RegExp('chắc chắn muốn xoá|chắc chắn muốn xóa', 'i'))).toBeVisible();
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test('TC-W03-UI-J-002 [C3] Click "Xóa" — xóa thành công + toast + biến mất', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const ts = uniqueSuffix();
    const code = 'PROD-J002-' + ts;
    const name = 'San pham J002 ' + ts;
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
    await page.getByRole('row').filter({ hasText: code }).getByRole('button', { name: 'Xóa' }).click();
    await page.waitForTimeout(600);
    await page.getByRole('alertdialog').getByRole('button', { name: 'Xóa' }).click();
    await expect(page.getByText('Xóa mã sản phẩm nội bộ thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(800);
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(code);
    await page.waitForTimeout(600);
    await expect(page.getByRole('row').filter({ hasText: code })).toHaveCount(0);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test('TC-W03-UI-J-003 [C3] Click "Huỷ" — đóng, không xóa', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const ts = uniqueSuffix();
    const code = 'PROD-J003-' + ts;
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.locator('input[type="text"]').first().fill(code);
    await page.locator('input[type="text"]').nth(1).fill('San pham J003 ' + ts);
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
    await page.getByRole('row').filter({ hasText: code }).getByRole('button', { name: 'Xóa' }).click();
    await page.waitForTimeout(600);
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Hủy' }).click();
    await page.waitForTimeout(600);
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(code);
    await page.waitForTimeout(600);
    await expect(page.getByRole('row').filter({ hasText: code })).toHaveCount(1);
  });

  test.fixme('TC-W03-UI-J-004 [C3] Xóa mã đã giao dịch — dialog "Không thể xóa" chỉ nút Đóng', async ({ page }) => {
    // TODO(TEST_EXECUTION run sau): BLOCKED-by-data - can 1 ma san pham "da giao dich" (co
    // phieu nhap/xuat kho gan) de trigger ERR-INV-008. Module Nhap/Xuat kho (W04-W06) CHUA
    // duoc build trong scope wave nay (xac nhan qua PKG-W03) - khong co duong UI thuc de tao
    // precondition nay. Neu co seed API rieng cho conversion-unit da giao dich (xem
    // TC-W03-UI-H-005 cung can precondition tuong tu), co the tai su dung o Run sau.
  });

  test('TC-W03-UI-J-005 [C3] Cả 2 role đều xóa được mã chưa giao dịch', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsOwner(page);
    await gotoInternalProductList(page);
    const ts = uniqueSuffix();
    const ownerCode = 'PROD-J005O-' + ts;
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.locator('input[type="text"]').first().fill(ownerCode);
    await page.locator('input[type="text"]').nth(1).fill('San pham J005 owner ' + ts);
    await page.getByPlaceholder('Chọn ĐVT chính').click();
    await page.keyboard.type('c');
    await page.waitForTimeout(600);
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo mã sản phẩm nội bộ thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await gotoInternalProductList(page);
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(ownerCode);
    await page.waitForTimeout(600);
    await page.getByRole('row').filter({ hasText: ownerCode }).getByRole('button', { name: 'Xóa' }).click();
    await page.waitForTimeout(600);
    await page.getByRole('alertdialog').getByRole('button', { name: 'Xóa' }).click();
    await expect(page.getByText('Xóa mã sản phẩm nội bộ thành công.')).toBeVisible({ timeout: 10000 });

    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const accCode = 'PROD-J005A-' + ts;
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.locator('input[type="text"]').first().fill(accCode);
    await page.locator('input[type="text"]').nth(1).fill('San pham J005 accountant ' + ts);
    await page.getByPlaceholder('Chọn ĐVT chính').click();
    await page.keyboard.type('c');
    await page.waitForTimeout(600);
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo mã sản phẩm nội bộ thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await gotoInternalProductList(page);
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(accCode);
    await page.waitForTimeout(600);
    await page.getByRole('row').filter({ hasText: accCode }).getByRole('button', { name: 'Xóa' }).click();
    await page.waitForTimeout(600);
    await page.getByRole('alertdialog').getByRole('button', { name: 'Xóa' }).click();
    await expect(page.getByText('Xóa mã sản phẩm nội bộ thành công.')).toBeVisible({ timeout: 10000 });
  });

  test('TC-W03-UI-J-006 [C3] Double-click "Xóa" — không xóa 2 lần / không lỗi', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const ts = uniqueSuffix();
    const code = 'PROD-J006-' + ts;
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.locator('input[type="text"]').first().fill(code);
    await page.locator('input[type="text"]').nth(1).fill('San pham J006 ' + ts);
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
    await page.getByRole('row').filter({ hasText: code }).getByRole('button', { name: 'Xóa' }).click();
    await page.waitForTimeout(600);
    const confirmBtn = page.getByRole('alertdialog').getByRole('button', { name: 'Xóa' });
    await confirmBtn.click();
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button')).filter((b) => b.textContent?.trim() === 'Xóa');
      btns.forEach((b) => (b as HTMLButtonElement).click());
    }).catch(() => {});
    await expect(page.getByText('Xóa mã sản phẩm nội bộ thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(800);
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(code);
    await page.waitForTimeout(600);
    await expect(page.getByRole('row').filter({ hasText: code })).toHaveCount(0);
  });

});
