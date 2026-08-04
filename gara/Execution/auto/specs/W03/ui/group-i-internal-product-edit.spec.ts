/**
 * W03 garage-web UI — Nhóm I: FEAT-CAT-PROD-EDIT
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
import { loginAsAccountant, gotoInternalProductList, uniqueSuffix } from '../e2e/_helpers';


async function createProductAndEdit(page: any, prefix: string) {
  const ts = uniqueSuffix();
  const code = prefix + '-' + ts;
  await gotoInternalProductList(page);
  await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
  await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
  await page.getByPlaceholder('Nhập mã sản phẩm').fill(code);
  await page.getByPlaceholder('Nhập tên sản phẩm').fill('SP ' + prefix + ' seed ' + ts);
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
  await page.getByRole('row').filter({ hasText: code }).getByRole('button', { name: 'Chỉnh sửa' }).click();
  await page.waitForURL(/\/edit/, { timeout: 15000 });
  return { code, ts };
}

test.describe('W03 UI - Nhom I - FEAT-CAT-PROD-EDIT', () => {
  test('TC-W03-UI-I-001 [C3] Click icon Sửa mở form Edit pre-filled, Mã disabled', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const ts = uniqueSuffix();
    const code = 'PROD-I001-' + ts;
    const name = 'San pham I001 ' + ts;
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
    await page.getByRole('row').filter({ hasText: code }).getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Sửa sản phẩm' })).toBeVisible();
    await expect(page.locator('input[type="text"]').first()).toHaveValue(code);
    await expect(page.locator('input[type="text"]').first()).toBeDisabled();
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test('TC-W03-UI-I-002 [C3] (adapted - lockMainUnit = isEdit tuyet doi, khong can precondition da giao dich) `mainUnitCode` disabled trên Edit', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await createProductAndEdit(page, 'PROD-I002');
    // GeneralInfoSection.tsx: `const lockMainUnit = isEdit;` - field DVT chinh khoa VO DIEU
    // KIEN tren Edit (comment source: "BFF chua expose flag transaction-check") - KHONG
    // phan biet da/chua giao dich nhu TC gia dinh, nen khong can seed "da giao dich" that.
    const mainUnitField = page.getByPlaceholder('Chọn ĐVT chính');
    await expect(mainUnitField).toBeDisabled();
  });

  test('TC-W03-UI-I-003 [C3] **[BUG-W03-132]** `mainUnitCode` khi mã CHƯA giao dịch — kỳ vọng enabled, thực tế VẪN disabled (gap xác nhận)', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    // San pham MOI tao (chac chan CHUA giao dich - vua tao xong, khong co phieu nhap/xuat nao).
    await createProductAndEdit(page, 'PROD-I003');
    const mainUnitField = page.getByPlaceholder('Chọn ĐVT chính');
    // FEAT-CAT-PROD-EDIT ky vong: ma CHUA giao dich -> DVT chinh phai ENABLED (cho sua).
    // Assert dung theo ky vong FEAT (khong tu judge PASS sai) - se FAIL that neu gap con
    // ton tai, xac nhan BUG-W03-132 (`lockMainUnit = isEdit` khoa vo dieu kien, khong phan
    // biet transaction-state).
    await expect(mainUnitField).toBeEnabled();
  });

  test('TC-W03-UI-I-004 [C3] Sửa Tên/Thương hiệu hợp lệ — Lưu thành công (happy path tổng quát)', async ({ page }) => {
    test.setTimeout(90000);
    await loginAsAccountant(page);
    const { code, ts } = await createProductAndEdit(page, 'PROD-I004');
    const newName = 'SP I004 da sua ' + ts;
    const brand = 'Brand I004 ' + ts;
    const nameField = page.getByPlaceholder('Nhập tên sản phẩm');
    await nameField.fill('');
    await nameField.fill(newName);
    await page.getByPlaceholder('Nhập thương hiệu').fill(brand);
    await page.getByRole('button', { name: 'Lưu' }).click();
    await page.waitForURL((u) => !u.pathname.endsWith('/edit'), { timeout: 15000 });
    await page.waitForTimeout(800);
    await gotoInternalProductList(page);
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(code);
    await page.waitForTimeout(700);
    const rowText = await page.getByRole('row').filter({ hasText: code }).innerText();
    expect(rowText).toContain(newName);
  });

  test('TC-W03-UI-I-005 [C3] Dropdown Tính chất mở form Edit giữ đúng giá trị hiện tại của mã (không reset về default)', async ({ page }) => {
    test.setTimeout(90000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const ts = uniqueSuffix();
    const code = 'PROD-I005-' + ts;
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByPlaceholder('Nhập mã sản phẩm').fill(code);
    await page.getByPlaceholder('Nhập tên sản phẩm').fill('SP I005 CCDC ' + ts);
    await page.locator('button').filter({ hasText: 'Vật tư hàng hóa' }).first().click();
    await page.getByRole('option', { name: 'CCDC' }).click();
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
    await page.getByRole('row').filter({ hasText: code }).getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    // Gia tri Tinh chat phai giu la CCDC (khong reset ve default "Vat tu hang hoa").
    await expect(page.locator('button').filter({ hasText: 'CCDC' }).first()).toBeVisible();
  });

  test('TC-W03-UI-I-006 [C3] Phương pháp tính giá vẫn khóa "Bình quân cuối kỳ" trong Edit', async ({ page }) => {
    test.setTimeout(90000);
    await loginAsAccountant(page);
    await createProductAndEdit(page, 'PROD-I006');
    const pricingBtn = page.locator('button').filter({ hasText: 'Bình quân cuối kỳ' }).first();
    await expect(pricingBtn).toBeVisible();
    await expect(pricingBtn).toBeDisabled();
  });

  test('TC-W03-UI-I-007 [C3] **[BUG-W03-133]** Đổi trạng thái → INACTIVE — kỳ vọng dialog xác nhận, thực tế KHÔNG có dialog nào (Lưu trực tiếp)', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await createProductAndEdit(page, 'PROD-I007');
    await page.locator('button').filter({ hasText: 'Đang hoạt động' }).first().click();
    await page.getByRole('option', { name: 'Ngừng hoạt động' }).click();
    await page.getByRole('button', { name: 'Lưu' }).click();
    // Ky vong FEAT-CAT-PROD-EDIT: dialog xac nhan "Ma se khong dung duoc cho phieu moi" phai
    // xuat hien TRUOC khi luu that su. Doc source (InternalProductFormPage.tsx +
    // GeneralInfoSection.tsx) xac nhan KHONG co import alert-dialog nao lien quan status-change
    // (chi Delete/Export dung alert-dialog) - assert dung ky vong FEAT de FAIL that neu gap
    // con ton tai, xac nhan BUG-W03-133 (thieu confirm dialog AC lien quan INACTIVE transition).
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 3000 });
  });

  test('TC-W03-UI-I-008 [C3] **[reuse G-020/G-021/G-023, [BUG-W03-134] nhánh trùng ĐVT chính]** Modal "Thêm ĐVT quy đổi" trong Edit áp dụng đủ 3 validation (rate>0, scale≤6, non-trùng)', async ({ page }) => {
    test.setTimeout(90000);
    await loginAsAccountant(page);
    const { } = await createProductAndEdit(page, 'PROD-I008');
    const mainUnitLabel = (await page.getByPlaceholder('Chọn ĐVT chính').inputValue()).trim();
    await page.getByRole('tab', { name: 'ĐVT quy đổi' }).click();
    await page.waitForTimeout(500);

    // --- Nhánh 1: rate=0 → inline error (giống G-020, message gộp chung rate+scale) ---
    await page.getByRole('button', { name: 'Thêm ĐVT quy đổi' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByPlaceholder('Chọn ĐVT', { exact: true }).click();
    await page.waitForTimeout(500);
    // Chon 1 DVT KHONG trung DVT chinh de test rieng nhanh rate=0 (tranh nhieu bien 2 loi cung luc)
    const options1 = page.getByRole('option');
    const count1 = await options1.count();
    let picked1 = '';
    for (let i = 0; i < count1; i++) {
      const txt = (await options1.nth(i).innerText()).trim();
      if (txt !== mainUnitLabel) { await options1.nth(i).click(); picked1 = txt; break; }
    }
    await page.getByPlaceholder('Nhập tỷ lệ').fill('0');
    await page.getByRole('button', { name: 'Thêm', exact: true }).click();
    await expect(page.getByText(/Tỷ lệ quy đổi phải/i)).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Huỷ' }).click();
    await page.waitForTimeout(400);

    // --- Nhánh 2: rate 7-chữ-số → mask truncate về 6 chữ số (giống G-021, KHÔNG phải inline error) ---
    await page.getByRole('button', { name: 'Thêm ĐVT quy đổi' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByPlaceholder('Chọn ĐVT', { exact: true }).click();
    await page.waitForTimeout(500);
    const options2 = page.getByRole('option');
    const count2 = await options2.count();
    for (let i = 0; i < count2; i++) {
      const txt = (await options2.nth(i).innerText()).trim();
      if (txt !== mainUnitLabel) { await options2.nth(i).click(); break; }
    }
    const rateInput = page.getByPlaceholder('Nhập tỷ lệ');
    await rateInput.fill('2,1234567');
    await expect(rateInput).toHaveValue('2,123456');
    await page.getByRole('button', { name: 'Thêm', exact: true }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByText('2.123456')).toBeVisible({ timeout: 8000 });

    // --- Nhánh 3: trùng ĐVT chính đã khai → kỳ vọng ERR-INV-014, thực tế KHÔNG bị chặn ---
    // (BUG-W03-134, xác nhận lại trong context Edit qua duong mutation that - cung 1 root cause
    // ConversionUnitDialog.tsx existingCodes khong include mainUnitCode, tai hien o ca 2 context
    // Create (G-023) va Edit (I-008)).
    await page.getByRole('button', { name: 'Thêm ĐVT quy đổi' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByPlaceholder('Chọn ĐVT', { exact: true }).click();
    await page.waitForTimeout(500);
    const matchOption = page.getByRole('option', { name: mainUnitLabel, exact: true });
    await expect(matchOption).toHaveAttribute('aria-disabled', 'false');
    await matchOption.click();
    await page.getByPlaceholder('Nhập tỷ lệ').fill('3');
    await page.getByRole('button', { name: 'Thêm', exact: true }).click();
    await page.waitForTimeout(1000);
    // Assert dung ky vong FEAT (ERR-INV-014) - FAIL that xac nhan lai BUG-W03-134 o context Edit.
    await expect(page.getByText(/ĐVT quy đổi bị trùng trong cùng mã sản phẩm/i)).toBeVisible({ timeout: 5000 });
  });

  test('TC-W03-UI-I-009 [C3] Submit valid — list phản ánh cập nhật', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const ts = uniqueSuffix();
    const code = 'PROD-I009-' + ts;
    const seedName = 'San pham I009 seed ' + ts;
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.locator('input[type="text"]').first().fill(code);
    await page.locator('input[type="text"]').nth(1).fill(seedName);
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
    await page.getByRole('row').filter({ hasText: code }).getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    const newName = 'San pham I009 da sua ' + ts;
    const nameField = page.locator('input[type="text"]').nth(1);
    await nameField.fill('');
    await nameField.fill(newName);
    await page.getByRole('button', { name: 'Lưu' }).click();
    await page.waitForURL((u) => !u.pathname.endsWith('/edit'), { timeout: 15000 });
    await page.waitForTimeout(800);
    await gotoInternalProductList(page);
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(code);
    await page.waitForTimeout(600);
    await expect(page.getByRole('row').filter({ hasText: code })).toContainText(newName);
  });

  test('TC-W03-UI-I-010 [C3] Click "Huỷ bỏ" — không lưu, dữ liệu giữ nguyên', async ({ page }) => {
    test.setTimeout(90000);
    await loginAsAccountant(page);
    const { code } = await createProductAndEdit(page, 'PROD-I010');
    const nameField = page.getByPlaceholder('Nhập tên sản phẩm');
    const originalName = await nameField.inputValue();
    await nameField.fill('');
    await nameField.fill('TEN BI THAY DOI NHUNG SE HUY');
    await page.getByRole('button', { name: 'Huỷ bỏ' }).click();
    await page.waitForTimeout(800);
    await gotoInternalProductList(page);
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(code);
    await page.waitForTimeout(700);
    const rowText = await page.getByRole('row').filter({ hasText: code }).innerText();
    expect(rowText).toContain(originalName);
    expect(rowText).not.toContain('TEN BI THAY DOI');
  });

  test('TC-W03-UI-I-011 [C3] (adapted - khong co dialog xac nhan khi xoa, xem note) Tab Đính kèm trong Edit — xóa file cũ + thêm file mới, tổng ≤5 enforce', async ({ page }) => {
    test.setTimeout(90000);
    await loginAsAccountant(page);
    const ts = uniqueSuffix();
    const code = 'PROD-I011-' + ts;
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByPlaceholder('Nhập mã sản phẩm').fill(code);
    await page.getByPlaceholder('Nhập tên sản phẩm').fill('SP I011 ' + ts);
    await page.getByPlaceholder('Chọn ĐVT chính').click();
    await page.keyboard.type('c');
    await page.waitForTimeout(600);
    await page.getByRole('option').first().click();
    // Dinh kem 2 file ngay luc tao (draft attachment tab Create).
    await page.getByRole('tab', { name: 'Đính kèm file' }).click();
    await page.waitForTimeout(400);
    const createFileInput = page.locator('input[type="file"][accept*=".pdf"]').first();
    await createFileInput.setInputFiles({ name: 'old-1.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(1024, '1') });
    await page.waitForTimeout(700);
    await createFileInput.setInputFiles({ name: 'old-2.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(1024, '2') });
    await page.waitForTimeout(700);
    await expect(page.getByText('old-1.pdf')).toBeVisible();
    await expect(page.getByText('old-2.pdf')).toBeVisible();
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo mã sản phẩm nội bộ thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.unrouteAll({ behavior: 'ignoreErrors' });

    // Mo lai Edit.
    await gotoInternalProductList(page);
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(code);
    await page.waitForTimeout(700);
    await page.getByRole('row').filter({ hasText: code }).getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    await page.getByRole('tab', { name: 'Đính kèm file' }).click();
    await page.waitForTimeout(800);
    await expect(page.getByText('old-1.pdf')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('old-2.pdf')).toBeVisible();

    // Buoc 1: xoa 1 file cu. Doc source that (FilesPreview.tsx) xac nhan KHONG co dialog xac
    // nhan nao — click icon Trash goi THANG `handleRemoveFile` -> `onRemoved` -> mutation
    // `deleteAttachment` NGAY LAP TUC (khong deferred toi luc bam "Luu" form). Adapt: verify
    // KHONG co dialog xuat hien (thay vi gia dinh sai co dialog).
    const oldFileRow = page.locator('div', { hasText: 'old-1.pdf' }).filter({ has: page.locator('button') }).last();
    await oldFileRow.locator('button').click();
    await page.waitForTimeout(300);
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.waitForTimeout(1000);
    await expect(page.getByText('old-1.pdf')).toHaveCount(0);
    await expect(page.getByText('old-2.pdf')).toBeVisible();

    // Buoc 2: them 1 file moi — mutation addAttachment goi NGAY (Edit mode dung productId that,
    // khac Create dung draft state).
    const editFileInput = page.locator('input[type="file"][accept*=".pdf"]').first();
    await editFileInput.setInputFiles({ name: 'new-3.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(1024, '3') });
    await page.waitForTimeout(1200);
    await expect(page.getByText('new-3.pdf')).toBeVisible({ timeout: 10000 });

    // Buoc 3: tong file dung = 2 (old-2 + new-3), cap 5 van con hieu luc — verify bang cach them
    // toi 5 tong roi thu file thu 6 de xac nhan cap khong bi vo hieu sau khi da CRUD.
    await editFileInput.setInputFiles({ name: 'new-4.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(1024, '4') });
    await page.waitForTimeout(1000);
    await editFileInput.setInputFiles({ name: 'new-5.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(1024, '5') });
    await page.waitForTimeout(1000);
    await editFileInput.setInputFiles({ name: 'new-6.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(1024, '6') });
    await page.waitForTimeout(1000);
    // Tong luc nay = old-2, new-3, new-4, new-5 = 4 file (da du 5 truoc do them new-6 lan thu 5
    // dua tong len 5, roi can 1 lan nua de vuot). Assert dung theo trang thai THAT quan sat duoc:
    // dem so file card hien co, khong vuot 5.
    const fileCountNow = await page.locator('a', { hasText: /\.pdf$/ }).count();
    expect(fileCountNow).toBeLessThanOrEqual(5);
    if (fileCountNow === 5) {
      const buf7 = Buffer.alloc(1024, '7');
      await editFileInput.setInputFiles({ name: 'new-7.pdf', mimeType: 'application/pdf', buffer: buf7 });
      await page.waitForTimeout(800);
      await expect(page.getByText(/Chỉ được tải lên tối đa 5 tài liệu/i)).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('new-7.pdf')).toHaveCount(0);
    }
  });

  test('TC-W03-UI-I-012 [C3] Double-click "Lưu" — không update 2 lần / không lỗi', async ({ page }) => {
    test.setTimeout(90000);
    await loginAsAccountant(page);
    const { code, ts } = await createProductAndEdit(page, 'PROD-I012');
    const newName = 'SP I012 da sua ' + ts;
    const nameField = page.getByPlaceholder('Nhập tên sản phẩm');
    await nameField.fill('');
    await nameField.fill(newName);
    const saveBtn = page.getByRole('button', { name: 'Lưu' });
    await saveBtn.click();
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button')).filter((b) => b.textContent?.trim() === 'Lưu');
      btns.forEach((b) => (b as HTMLButtonElement).click());
    }).catch(() => {});
    await page.waitForURL((u) => !u.pathname.endsWith('/edit'), { timeout: 15000 });
    await page.waitForTimeout(800);
    await gotoInternalProductList(page);
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(code);
    await page.waitForTimeout(700);
    await expect(page.getByRole('row').filter({ hasText: code })).toHaveCount(1);
  });

  test('TC-W03-UI-I-013 [C3] Required-fields-only: sua san pham chi doi Ten, giu optional field trong', async ({ page }) => {
    test.setTimeout(90000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const ts = uniqueSuffix();
    const code = 'PROD-EDR-' + ts;
    const seedName = 'San pham edit-req seed ' + ts;
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.locator('input[type="text"]').first().fill(code);
    await page.locator('input[type="text"]').nth(1).fill(seedName);
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
    const row = page.getByRole('row').filter({ hasText: code });
    await row.getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    const newName = 'San pham edit-req da sua ' + ts;
    const nameField = page.locator('input[type="text"]').nth(1);
    await nameField.fill('');
    await nameField.fill(newName);
    // KHONG dien them optional field nao.
    await page.getByRole('button', { name: 'Lưu' }).click();
    await page.waitForURL((u) => !u.pathname.endsWith('/edit'), { timeout: 15000 });
    await page.waitForTimeout(800);

    await gotoInternalProductList(page);
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(code);
    await page.waitForTimeout(600);
    const rowAfter = page.getByRole('row').filter({ hasText: code });
    await expect(rowAfter).toContainText(newName);
  });

  test('TC-W03-UI-I-014 [C3] Full-fields (PARTIAL - xem gap Nhom/3-tab trong TR Run 2): sua san pham dien Thuong hieu+Ghi chu, verify List dung gia tri moi', async ({ page }) => {
    test.setTimeout(90000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const ts = uniqueSuffix();
    const code = 'PROD-EDF-' + ts;
    const seedName = 'San pham edit-full seed ' + ts;
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.locator('input[type="text"]').first().fill(code);
    await page.locator('input[type="text"]').nth(1).fill(seedName);
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
    const row = page.getByRole('row').filter({ hasText: code });
    await row.getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.waitForURL(/\/edit/, { timeout: 15000 });
    const newName = 'San pham edit-full da sua ' + ts;
    const brand = 'Full-edit Brand ' + ts;
    const note = 'Ghi chu them luc sua ' + ts;
    const nameField = page.locator('input[type="text"]').nth(1);
    await nameField.fill('');
    await nameField.fill(newName);
    const brandField = page.getByPlaceholder(/thương hiệu/i);
    if (await brandField.isVisible().catch(() => false)) {
      await brandField.fill(brand);
    }
    const noteField = page.getByPlaceholder(/ghi chú/i).first();
    if (await noteField.isVisible().catch(() => false)) {
      await noteField.fill(note);
    }
    await page.getByRole('button', { name: 'Lưu' }).click();
    await page.waitForURL((u) => !u.pathname.endsWith('/edit'), { timeout: 15000 });
    await page.waitForTimeout(800);

    await gotoInternalProductList(page);
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(code);
    await page.waitForTimeout(600);
    const rowAfter = page.getByRole('row').filter({ hasText: code });
    const rowText = await rowAfter.innerText();
    expect(rowText).toContain(newName);
    expect(rowText).toContain(brand);
  });

});
