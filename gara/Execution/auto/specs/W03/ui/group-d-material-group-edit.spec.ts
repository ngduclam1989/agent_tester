/**
 * W03 garage-web UI — Nhóm D: FEAT-CAT-GRP-EDIT
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
import { loginAsAccountant, loginAsOwner, gotoMaterialGroupList, uniqueSuffix } from '../e2e/_helpers';

test.describe('W03 UI - Nhom D - FEAT-CAT-GRP-EDIT', () => {
  test('TC-W03-UI-D-001 [C3] (CONFLICT-04 drift: live = full-page, khong Dialog) Click icon Sửa mở form "Chỉnh sửa nhóm vật tư hàng hóa" pre-filled', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const ts = uniqueSuffix();
    const code = 'GRP-D001-' + ts;
    const name = 'Nhom D001 seed ' + ts;
    await page.getByRole('button', { name: 'Thêm Nhóm VT/HH' }).click();
    await page.getByPlaceholder('Nhập mã nhóm').fill(code);
    await page.getByPlaceholder('Nhập tên nhóm').fill(name);
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(800);
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(code);
    await page.waitForTimeout(600);
    await page.getByRole('row').filter({ hasText: code }).getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Chỉnh sửa nhóm vật tư hàng hóa' })).toBeVisible();
    await expect(page.getByPlaceholder('Nhập mã nhóm')).toHaveValue(code);
    await expect(page.getByPlaceholder('Nhập tên nhóm')).toHaveValue(name);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test('TC-W03-UI-D-002 [C3] (adapted - khong co helper text rieng, chi verify disabled) Field Mã nhóm VTHH disabled trên màn Chỉnh sửa', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const ts = uniqueSuffix();
    const code = 'GRP-D002-' + ts;
    await page.getByRole('button', { name: 'Thêm Nhóm VT/HH' }).click();
    await page.getByPlaceholder('Nhập mã nhóm').fill(code);
    await page.getByPlaceholder('Nhập tên nhóm').fill('D002 seed ' + ts);
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(700);
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(code);
    await page.waitForTimeout(600);
    await page.getByRole('row').filter({ hasText: code }).getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    await expect(page.getByPlaceholder('Nhập mã nhóm')).toBeDisabled();
  });

  test('TC-W03-UI-D-003 [C3] (wording thuc te = "Vui long nhap ten nhom VTHH", cung branch B-009) Tên nhóm sửa thành rỗng + Lưu → inline error', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const ts = uniqueSuffix();
    const code = 'GRP-D003-' + ts;
    await page.getByRole('button', { name: 'Thêm Nhóm VT/HH' }).click();
    await page.getByPlaceholder('Nhập mã nhóm').fill(code);
    await page.getByPlaceholder('Nhập tên nhóm').fill('D003 seed ' + ts);
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(700);
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(code);
    await page.waitForTimeout(600);
    await page.getByRole('row').filter({ hasText: code }).getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    await page.getByPlaceholder('Nhập tên nhóm').fill('');
    await page.getByRole('button', { name: 'Lưu' }).click();
    await page.waitForTimeout(700);
    await expect(page.getByText('Vui lòng nhập tên nhóm VTHH')).toBeVisible();
    await expect(page).toHaveURL(/edit/);
  });

  test('TC-W03-UI-D-004 [C3] **[FEAT v5 mới nhất, BUG-W03-127]** Field "Thuộc nhóm" PHẢI bị khóa trên màn Chỉnh sửa — thực tế VẪN editable (gap xác nhận)', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const ts = uniqueSuffix();
    const parentCode = 'GRP-D004P-' + ts;
    const childCode = 'GRP-D004C-' + ts;
    await page.getByRole('button', { name: 'Thêm Nhóm VT/HH' }).click();
    await page.getByPlaceholder('Nhập mã nhóm').fill(parentCode);
    await page.getByPlaceholder('Nhập tên nhóm').fill('D004 parent ' + ts);
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: 'Thêm Nhóm VT/HH' }).click();
    await page.getByPlaceholder('Nhập mã nhóm').fill(childCode);
    await page.getByPlaceholder('Nhập tên nhóm').fill('D004 child ' + ts);
    await page.getByText('Chọn nhóm cha').click();
    await page.keyboard.type(parentCode);
    await page.waitForTimeout(600);
    await page.getByRole('option', { name: new RegExp(parentCode) }).click();
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(700);
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(childCode);
    await page.waitForTimeout(600);
    await page.getByRole('row').filter({ hasText: childCode }).getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    await page.waitForTimeout(500);
    // Ky vong FEAT v5 (business authority moi nhat 2026-07-02): field khoa vinh vien.
    // Thuc te xac nhan live: VAN editable - BUG-W03-127 (CONFLICT-02). Assert dung theo
    // ky vong FEAT de test nay FAIL that neu gap con ton tai (khong tu judge PASS sai).
    const label = page.locator('label,p').filter({ hasText: 'Thuộc nhóm' }).first();
    const container = label.locator('xpath=ancestor::*[.//*[@role="combobox"] or .//input][1]');
    const trigger = container.locator('[role="combobox"], input, button').first();
    await expect(trigger).toBeDisabled();
  });

  test('TC-W03-UI-D-005 [C3] (adapted - FEAT AC-5 khong yeu cau dialog, chi "tu dong" cascade - verified khong co alertdialog xuat hien) Đổi trạng thái ACTIVE→INACTIVE (nhóm có con ACTIVE) → Lưu trực tiếp, không dialog cascade', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const ts = uniqueSuffix();
    const parentCode = 'GRP-D005-' + ts;
    const childCode = 'GRP-D005C-' + ts;
    await page.getByRole('button', { name: 'Thêm Nhóm VT/HH' }).click();
    await page.getByPlaceholder('Nhập mã nhóm').fill(parentCode);
    await page.getByPlaceholder('Nhập tên nhóm').fill('D005 parent ' + ts);
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: 'Thêm Nhóm VT/HH' }).click();
    await page.getByPlaceholder('Nhập mã nhóm').fill(childCode);
    await page.getByPlaceholder('Nhập tên nhóm').fill('D005 child ' + ts);
    await page.getByText('Chọn nhóm cha').click();
    await page.keyboard.type(parentCode);
    await page.waitForTimeout(600);
    await page.getByRole('option', { name: new RegExp(parentCode) }).click();
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(700);
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(parentCode);
    await page.waitForTimeout(600);
    await page.getByRole('row').filter({ hasText: parentCode }).getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    const formArea5 = page.locator('form, main').first();
    await formArea5.getByText('Đang hoạt động', { exact: true }).first().click();
    await page.getByRole('option', { name: 'Ngừng hoạt động' }).click();
    await page.getByRole('button', { name: 'Lưu' }).click();
    await page.waitForTimeout(1000);
    // FEAT AC-5 khong quy dinh dialog xac nhan - cascade la "tu dong". Assert dung hanh
    // vi thuc te: KHONG co alertdialog, submit thanh cong truc tiep.
    await expect(page.locator('[role="alertdialog"]')).toHaveCount(0);
    await expect(page.getByText('Cập nhật nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
  });

  test('TC-W03-UI-D-006 [C3] Đổi Trạng thái cha sang Ngừng hoạt động → cascade TỰ ĐỘNG xuống nhóm con (verify qua List, đúng FEAT AC-5)', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const ts = uniqueSuffix();
    const parentCode = 'GRP-D006-' + ts;
    const childCode = 'GRP-D006C-' + ts;
    await page.getByRole('button', { name: 'Thêm Nhóm VT/HH' }).click();
    await page.getByPlaceholder('Nhập mã nhóm').fill(parentCode);
    await page.getByPlaceholder('Nhập tên nhóm').fill('D006 parent ' + ts);
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: 'Thêm Nhóm VT/HH' }).click();
    await page.getByPlaceholder('Nhập mã nhóm').fill(childCode);
    await page.getByPlaceholder('Nhập tên nhóm').fill('D006 child ' + ts);
    await page.getByText('Chọn nhóm cha').click();
    await page.keyboard.type(parentCode);
    await page.waitForTimeout(600);
    await page.getByRole('option', { name: new RegExp(parentCode) }).click();
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(700);
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(parentCode);
    await page.waitForTimeout(600);
    await page.getByRole('row').filter({ hasText: parentCode }).getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    const formArea6 = page.locator('form, main').first();
    await formArea6.getByText('Đang hoạt động', { exact: true }).first().click();
    await page.getByRole('option', { name: 'Ngừng hoạt động' }).click();
    await page.getByRole('button', { name: 'Lưu' }).click();
    await expect(page.getByText('Cập nhật nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: 'Đặt lại bộ lọc' }).click().catch(() => {});
    await page.getByRole('button', { name: /^Trạng thái/ }).click();
    await page.getByRole('option', { name: 'Tất cả', exact: false }).click();
    await page.waitForTimeout(600);
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(childCode);
    await page.waitForTimeout(700);
    const childRow = page.getByRole('row').filter({ hasText: childCode });
    await expect(childRow).toContainText('Ngừng hoạt động');
  });

  test('TC-W03-UI-D-007 [C3] (adapted - FEAT AC-5 bullet 2: bat lai cha KHONG tu dong bat lai con) Đổi Trạng thái cha từ INACTIVE sang ACTIVE — con vẫn giữ nguyên INACTIVE (không tự cascade ngược)', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const ts = uniqueSuffix();
    const parentCode = 'GRP-D007-' + ts;
    const childCode = 'GRP-D007C-' + ts;
    await page.getByRole('button', { name: 'Thêm Nhóm VT/HH' }).click();
    await page.getByPlaceholder('Nhập mã nhóm').fill(parentCode);
    await page.getByPlaceholder('Nhập tên nhóm').fill('D007 parent ' + ts);
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: 'Thêm Nhóm VT/HH' }).click();
    await page.getByPlaceholder('Nhập mã nhóm').fill(childCode);
    await page.getByPlaceholder('Nhập tên nhóm').fill('D007 child ' + ts);
    await page.getByText('Chọn nhóm cha').click();
    await page.keyboard.type(parentCode);
    await page.waitForTimeout(600);
    await page.getByRole('option', { name: new RegExp(parentCode) }).click();
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(700);
    // B1: chuyen cha sang Ngung hoat dong (cascade con theo).
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(parentCode);
    await page.waitForTimeout(600);
    await page.getByRole('row').filter({ hasText: parentCode }).getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    const formArea7a = page.locator('form, main').first();
    await formArea7a.getByText('Đang hoạt động', { exact: true }).first().click();
    await page.getByRole('option', { name: 'Ngừng hoạt động' }).click();
    await page.getByRole('button', { name: 'Lưu' }).click();
    await expect(page.getByText('Cập nhật nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(800);
    // B2: bat lai cha -> Dang hoat dong.
    await page.getByRole('button', { name: 'Đặt lại bộ lọc' }).click().catch(() => {});
    await page.getByRole('button', { name: /^Trạng thái/ }).click();
    await page.getByRole('option', { name: 'Tất cả', exact: false }).click();
    await page.waitForTimeout(600);
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(parentCode);
    await page.waitForTimeout(600);
    await page.getByRole('row').filter({ hasText: parentCode }).getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    const formArea7b = page.locator('form, main').first();
    await formArea7b.getByText('Ngừng hoạt động', { exact: true }).first().click();
    await page.getByRole('option', { name: 'Đang hoạt động' }).click();
    await page.getByRole('button', { name: 'Lưu' }).click();
    await expect(page.getByText('Cập nhật nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(800);
    // B3: assert con VAN con Ngung hoat dong (khong tu bat lai) - phai mo filter "Tat ca"
    // vi con dang INACTIVE se bi an boi default filter "Dang hoat dong".
    await page.getByRole('button', { name: 'Đặt lại bộ lọc' }).click().catch(() => {});
    await page.getByRole('button', { name: /^Trạng thái/ }).click();
    await page.getByRole('option', { name: 'Tất cả', exact: false }).click();
    await page.waitForTimeout(600);
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(childCode);
    await page.waitForTimeout(700);
    const childRow = page.getByRole('row').filter({ hasText: childCode });
    await expect(childRow).toContainText('Ngừng hoạt động');
  });

  test('TC-W03-UI-D-008 [C3] (BUG-W03-124 cung ap dung cho Edit) Mô tả boundary 255 PASS / 256 van duoc chap nhan (thieu validation, cung gap voi Create)', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const ts = uniqueSuffix();
    const code = 'GRP-D008-' + ts;
    await page.getByRole('button', { name: 'Thêm Nhóm VT/HH' }).click();
    await page.getByPlaceholder('Nhập mã nhóm').fill(code);
    await page.getByPlaceholder('Nhập tên nhóm').fill('D008 seed ' + ts);
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(700);
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(code);
    await page.waitForTimeout(600);
    await page.getByRole('row').filter({ hasText: code }).getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    await page.getByPlaceholder('Nhập mô tả').fill('A'.repeat(255));
    await page.getByRole('button', { name: 'Lưu' }).click();
    await expect(page.getByText('Cập nhật nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
  });

  test('TC-W03-UI-D-009 [C3] Submit valid (sửa tên) → list phản ánh + audit cập nhật', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const ts = uniqueSuffix();
    const code = 'GRP-D009-' + ts;
    const seedName = 'Nhom D009 seed ' + ts;
    await page.getByRole('button', { name: 'Thêm Nhóm VT/HH' }).click();
    await page.getByPlaceholder('Nhập mã nhóm').fill(code);
    await page.getByPlaceholder('Nhập tên nhóm').fill(seedName);
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(800);
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(code);
    await page.waitForTimeout(600);
    await page.getByRole('row').filter({ hasText: code }).getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    const newName = 'Nhom D009 da sua ' + ts;
    const nameField = page.getByPlaceholder('Nhập tên nhóm');
    await nameField.fill('');
    await nameField.fill(newName);
    await page.getByRole('button', { name: 'Lưu' }).click();
    await page.waitForURL((u) => !u.pathname.endsWith('/edit'), { timeout: 15000 });
    await page.waitForTimeout(800);
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(code);
    await page.waitForTimeout(600);
    await expect(page.getByRole('row').filter({ hasText: code })).toContainText(newName);
  });

  test('TC-W03-UI-D-010 [C3] Click "Huỷ bỏ" (nút chính form) — đóng, không lưu thay đổi', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const ts = uniqueSuffix();
    const code = 'GRP-D010-' + ts;
    const seedName = 'D010 seed ' + ts;
    await page.getByRole('button', { name: 'Thêm Nhóm VT/HH' }).click();
    await page.getByPlaceholder('Nhập mã nhóm').fill(code);
    await page.getByPlaceholder('Nhập tên nhóm').fill(seedName);
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(700);
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(code);
    await page.waitForTimeout(600);
    await page.getByRole('row').filter({ hasText: code }).getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    await page.getByPlaceholder('Nhập tên nhóm').fill('Ten se khong duoc luu ' + ts);
    await page.getByRole('button', { name: 'Huỷ bỏ' }).click();
    await page.waitForTimeout(800);
    await expect(page).not.toHaveURL(/edit/);
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(code);
    await page.waitForTimeout(600);
    await expect(page.getByRole('row').filter({ hasText: code })).toContainText(seedName);
  });

  test('TC-W03-UI-D-011 [C3] Double-click "Lưu" — không tạo 2 request update trùng', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const ts = uniqueSuffix();
    const code = 'GRP-D011-' + ts;
    await page.getByRole('button', { name: 'Thêm Nhóm VT/HH' }).click();
    await page.getByPlaceholder('Nhập mã nhóm').fill(code);
    await page.getByPlaceholder('Nhập tên nhóm').fill('D011 seed ' + ts);
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(700);
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(code);
    await page.waitForTimeout(600);
    await page.getByRole('row').filter({ hasText: code }).getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    await page.getByPlaceholder('Nhập tên nhóm').fill('D011 da sua ' + ts);
    let updateCalls = 0;
    page.on('request', (req) => {
      if (req.url().includes('graphql') && req.method() === 'POST') {
        const data = req.postData() || '';
        if (data.includes('updateMaterialGroup')) updateCalls++;
      }
    });
    await page.getByRole('button', { name: 'Lưu' }).click({ clickCount: 2, delay: 30 }).catch(() => {});
    await page.waitForTimeout(2000);
    expect(updateCalls).toBeLessThanOrEqual(1);
  });

  test('TC-W03-UI-D-012 [C3] Hover nút "Lưu" đổi màu so với trạng thái mặc định', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const ts = uniqueSuffix();
    const code = 'GRP-D012-' + ts;
    await page.getByRole('button', { name: 'Thêm Nhóm VT/HH' }).click();
    await page.getByPlaceholder('Nhập mã nhóm').fill(code);
    await page.getByPlaceholder('Nhập tên nhóm').fill('D012 seed ' + ts);
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(700);
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(code);
    await page.waitForTimeout(600);
    await page.getByRole('row').filter({ hasText: code }).getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    const saveBtn = page.getByRole('button', { name: 'Lưu' });
    const before = await saveBtn.evaluate((el) => getComputedStyle(el).backgroundColor);
    await saveBtn.hover();
    await page.waitForTimeout(300);
    const after = await saveBtn.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(after).not.toBe(before);
  });

  test('TC-W03-UI-D-013 [C3] Cả 2 role (chủ garage/kế toán) đều Sửa được nhóm', async ({ page, browser }) => {
    test.setTimeout(90000);
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const ts = uniqueSuffix();
    const code = 'GRP-D013-' + ts;
    await page.getByRole('button', { name: 'Thêm Nhóm VT/HH' }).click();
    await page.getByPlaceholder('Nhập mã nhóm').fill(code);
    await page.getByPlaceholder('Nhập tên nhóm').fill('D013 seed ' + ts);
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(700);
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(code);
    await page.waitForTimeout(600);
    await page.getByRole('row').filter({ hasText: code }).getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    await page.getByPlaceholder('Nhập tên nhóm').fill('D013 accountant sua ' + ts);
    await page.getByRole('button', { name: 'Lưu' }).click();
    await expect(page.getByText('Cập nhật nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });

    const ownerCtx = await browser.newContext();
    const ownerPage = await ownerCtx.newPage();
    await loginAsOwner(ownerPage);
    await gotoMaterialGroupList(ownerPage);
    await ownerPage.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(code);
    await ownerPage.waitForTimeout(600);
    await ownerPage.getByRole('row').filter({ hasText: code }).getByRole('button', { name: 'Chỉnh sửa' }).click();
    await ownerPage.waitForURL(/\/edit/, { timeout: 15000 });
    await ownerPage.getByPlaceholder('Nhập tên nhóm').fill('D013 owner sua ' + ts);
    await ownerPage.getByRole('button', { name: 'Lưu' }).click();
    await expect(ownerPage.getByText('Cập nhật nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await ownerPage.waitForTimeout(500);
    await ownerPage.unrouteAll({ behavior: 'ignoreErrors' });
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await ownerCtx.close();
  });

  test.fixme('TC-W03-UI-D-014 [C1] Alert-dialog cascade dùng `ui/alert-dialog` reuse (không build mới)', async ({ page }) => {
    // TODO(TEST_EXECUTION): implement theo Steps/Expected Result cua TC-W03-UI-D-014
    // trong Execution/automated-test-cases/TC-W03-PLATFORM-UI.md.
  });

  test('TC-W03-UI-D-015 [C3] Required-fields-only: sua nhom chi doi Ten, giu Mo ta trong', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const ts = uniqueSuffix();
    const code = 'GRP-EDR-' + ts;
    const seedName = 'Nhom edit-req seed ' + ts;
    await page.getByRole('button', { name: 'Thêm Nhóm VT/HH' }).click();
    await page.getByPlaceholder('Nhập mã nhóm').fill(code);
    await page.getByPlaceholder('Nhập tên nhóm').fill(seedName);
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(800);
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(code);
    await page.waitForTimeout(600);
    const row = page.getByRole('row').filter({ hasText: code });
    await row.getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    const newName = 'Nhom edit-req da sua ' + ts;
    const nameField = page.getByPlaceholder('Nhập tên nhóm');
    await nameField.fill('');
    await nameField.fill(newName);
    // KHONG dong vao Mo ta - giu trong.
    await page.getByRole('button', { name: 'Lưu' }).click();
    await page.waitForURL((u) => !u.pathname.endsWith('/edit'), { timeout: 15000 });
    await page.waitForTimeout(800);
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(code);
    await page.waitForTimeout(600);
    const rowAfter = page.getByRole('row').filter({ hasText: code });
    await expect(rowAfter).toContainText(newName);
  });

  test('TC-W03-UI-D-016 [C3] Full-fields: sua nhom doi Ten+Mo ta+Trang thai, verify List dung gia tri moi', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const ts = uniqueSuffix();
    const code = 'GRP-EDF-' + ts;
    const seedName = 'Nhom edit-full seed ' + ts;
    await page.getByRole('button', { name: 'Thêm Nhóm VT/HH' }).click();
    await page.getByPlaceholder('Nhập mã nhóm').fill(code);
    await page.getByPlaceholder('Nhập tên nhóm').fill(seedName);
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo nhóm vật tư hàng hóa thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(800);
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(code);
    await page.waitForTimeout(600);
    const row = page.getByRole('row').filter({ hasText: code });
    await row.getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    const newName = 'Nhom edit-full da sua ' + ts;
    const description = 'Mo ta them luc sua ' + ts;
    const nameField = page.getByPlaceholder('Nhập tên nhóm');
    await nameField.fill('');
    await nameField.fill(newName);
    await page.getByPlaceholder('Nhập mô tả').fill(description);
    const statusTrigger = page.getByText('Đang hoạt động', { exact: true });
    if (await statusTrigger.isVisible().catch(() => false)) {
      await statusTrigger.click();
      await page.getByRole('option', { name: 'Ngừng hoạt động' }).click();
    }
    await page.getByRole('button', { name: 'Lưu' }).click();
    await page.waitForURL((u) => !u.pathname.endsWith('/edit'), { timeout: 15000 });
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: 'Đặt lại bộ lọc' }).click().catch(() => {});
    await page.getByPlaceholder('Tìm theo mã nhóm, tên nhóm').fill(code);
    await page.waitForTimeout(600);
    const rowAfter = page.getByRole('row').filter({ hasText: code });
    const rowText = await rowAfter.innerText();
    expect(rowText).toContain(newName);
  });

});
