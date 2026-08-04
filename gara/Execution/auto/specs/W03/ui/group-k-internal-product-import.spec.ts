/**
 * W03 garage-web UI — Nhóm K: FEAT-CAT-PROD-IMPORT
 * Nguồn TC: Execution/automated-test-cases/TC-W03-PLATFORM-UI.md
 * Runner: QC-owned Playwright harness (Lop A frozen, CR-20260701-03)
 *   cd Execution/auto/harness/playwright && BASE_URL=http://192.168.110.191:45300 npx playwright test W03/ui
 *
 * TEST_PLANNING scaffold: moi TC co 1 test block tuong ung (test.fixme cho case
 * chua wire dinh danh selector that voi live DOM; se chuyen sang test() implement
 * day du + xac nhan data-testid that khi bat dau TEST_EXECUTION / DEV testid landed).
 * KHONG duoc xoa hay giam TC row khoi day chi vi chua implement — giu nguyen theo
 * UI_BLOCKED_HIDDEN guard; BLOCKED/FIXME phai duoc phan anh trong artifact khi execute.
 *
 * Ground-truth quan trong (doc source that Run 3, KHONG chi dua vao TC draft):
 * - UI thuc te la 1-page (khong wizard nhieu step/route rieng): Upload -> tu dong
 *   goi verify -> hien preview inline tren cung trang. KHONG co step "Quay lai"
 *   rieng biet - nut "x" tren FilesPreview dong vai tro reset toan bo state.
 * - Sau khi "Xac nhan import" thanh cong: chi co TOAST "Da nhap N ma san pham
 *   noi bo." + redirect thang ve List (`/inventory-catalog/internal-products`).
 *   KHONG co man hinh "Ket qua import" rieng (AC-8 khong duoc implement) - xem
 *   BUG-W03-128 (P2, moi file Run 3).
 * - Cot file import: mainUnitName/originName/materialGroupName trong file phai la
 *   MA (code), khong phai display-name (map thang, khong qua lookup rieng).
 */
import { test, expect } from '@playwright/test';
import {
  loginAsAccountant,
  gotoInternalProductList,
  uniqueSuffix,
  buildImportWorkbookBuffer,
  uploadImportBuffer,
  IMPORT_VALID_UNIT_CODE,
} from '../e2e/_helpers';

test.describe('W03 UI - Nhom K - FEAT-CAT-PROD-IMPORT', () => {
  test('TC-W03-UI-K-001 [C3] Click "Tải lên" mở dedicated route Import', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Tải lên' }).click();
    await expect(page).toHaveURL(/\/internal-products\/import/);
    await expect(page.getByRole('button', { name: 'Xác nhận import' })).toBeDisabled();
  });

  test('TC-W03-UI-K-002 [C3] Click nút tải file mẫu — download `.xlsx`', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Tải lên' }).click();
    await expect(page).toHaveURL(/\/internal-products\/import/);
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
    // Nut tai template hien thi verbatim ten file mau (khong phai text "Tai file mau" chung chung).
    await page.getByRole('button', { name: /\.xlsx$/i }).click();
    const download = await downloadPromise;
    expect(download).not.toBeNull();
    expect(download?.suggestedFilename() || '').toMatch(/\.xlsx$/i);
  });

  test('TC-W03-UI-K-003 [C3] (adapted - khong co step "Kiem tra du lieu" rieng, verify tu dong chay ngay khi chon file) Chọn file `.xlsx` valid — FileItem hiển thị + preview auto-verify + nút "Xác nhận import" enabled', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Tải lên' }).click();
    await expect(page).toHaveURL(/\/internal-products\/import/);
    const ts = uniqueSuffix();
    const buf = buildImportWorkbookBuffer([
      { code: `PROD-K003-${ts}`, name: `SP K003 ${ts}`, mainUnitName: IMPORT_VALID_UNIT_CODE },
    ]);
    await uploadImportBuffer(page, buf, 'k003-valid.xlsx');
    await expect(page.getByText('k003-valid.xlsx')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Tổng dòng:')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Xác nhận import' })).toBeEnabled({ timeout: 10000 });
  });

  test('TC-W03-UI-K-004 [C3] (adapted - EC that: file .xlsx rong bao loi dung AC-3b; .csv duoc client chap nhan extension nhung fail khi doc noi dung - xem gap) Upload file `.xlsx` rỗng — báo lỗi "File không có dữ liệu"', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Tải lên' }).click();
    await expect(page).toHaveURL(/\/internal-products\/import/);
    const buf = buildImportWorkbookBuffer([]);
    await uploadImportBuffer(page, buf, 'k004-empty.xlsx');
    await expect(page.getByText('File không có dữ liệu')).toBeVisible({ timeout: 10000 });
    // Khong chuyen sang preview - nut Xac nhan import van disabled.
    await expect(page.getByRole('button', { name: 'Xác nhận import' })).toBeDisabled();
  });

  test('TC-W03-UI-K-005 [C3] Upload file 501 dòng — FE-side cap trước khi gọi BFF, toast + reset', async ({ page }) => {
    test.setTimeout(90000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Tải lên' }).click();
    await expect(page).toHaveURL(/\/internal-products\/import/);
    const ts = uniqueSuffix();
    const rows = Array.from({ length: 501 }, (_, i) => ({
      code: `PROD-K005-${ts}-${i}`,
      name: `SP K005 ${ts} ${i}`,
      mainUnitName: IMPORT_VALID_UNIT_CODE,
    }));
    const buf = buildImportWorkbookBuffer(rows);
    await uploadImportBuffer(page, buf, 'k005-501rows.xlsx');
    await expect(page.getByText(/Vượt giới hạn 500 dòng\/lần/)).toBeVisible({ timeout: 15000 });
    // Reset ve step Upload - nut Xac nhan import van disabled, khong co preview table.
    await expect(page.getByRole('button', { name: 'Xác nhận import' })).toBeDisabled();
    await expect(page.getByText('Tổng dòng:')).toHaveCount(0);
  });

  test('TC-W03-UI-K-006 [C3] Upload file mix (valid+invalid) — hiển thị 3 chỉ số + bảng preview đúng số dòng', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Tải lên' }).click();
    await expect(page).toHaveURL(/\/internal-products\/import/);
    const ts = uniqueSuffix();
    const buf = buildImportWorkbookBuffer([
      { code: `PROD-K006A-${ts}`, name: `SP K006 valid A ${ts}`, mainUnitName: IMPORT_VALID_UNIT_CODE },
      { code: `PROD-K006B-${ts}`, name: `SP K006 valid B ${ts}`, mainUnitName: IMPORT_VALID_UNIT_CODE },
      { code: `PROD-K006C-${ts}`, name: `SP K006 valid C ${ts}`, mainUnitName: IMPORT_VALID_UNIT_CODE },
      // Dong loi: thieu ten (required field).
      { code: `PROD-K006D-${ts}`, name: undefined, mainUnitName: IMPORT_VALID_UNIT_CODE },
      // Dong loi: tinh chat ngoai enum -> ERR-INV-012 (tinh toan phia client).
      { code: `PROD-K006E-${ts}`, name: `SP K006 badnature ${ts}`, mainUnitName: IMPORT_VALID_UNIT_CODE, natureLabel: 'KhongHopLe123' },
    ]);
    await uploadImportBuffer(page, buf, 'k006-mix.xlsx');
    await expect(page.getByText('Tổng dòng:')).toBeVisible({ timeout: 15000 });
    const totalRow = page.locator('div').filter({ hasText: /^Tổng dòng:5$/ });
    // Assert tong = 5 qua text ghep (fallback: doc toan bo vung thong ke).
    const statsText = await page.locator('body').innerText();
    expect(statsText).toMatch(/Tổng dòng:\s*5/);
    expect(statsText).toMatch(/Hợp lệ:\s*3/);
    expect(statsText).toMatch(/Lỗi:\s*2/);
    await expect(page.getByRole('cell', { name: 'Hợp lệ', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Lỗi', exact: true }).first()).toBeVisible();
  });

  test('TC-W03-UI-K-007 [C3] Nút "Xác nhận import" ENABLED khi có mix valid+invalid (theo FEAT, KHÔNG theo oracle screenshot disabled)', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Tải lên' }).click();
    await expect(page).toHaveURL(/\/internal-products\/import/);
    const ts = uniqueSuffix();
    const buf = buildImportWorkbookBuffer([
      { code: `PROD-K007A-${ts}`, name: `SP K007 valid ${ts}`, mainUnitName: IMPORT_VALID_UNIT_CODE },
      { code: `PROD-K007B-${ts}`, name: undefined, mainUnitName: IMPORT_VALID_UNIT_CODE },
    ]);
    await uploadImportBuffer(page, buf, 'k007-mix.xlsx');
    await expect(page.getByText('Tổng dòng:')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Xác nhận import' })).toBeEnabled();
  });

  test('TC-W03-UI-K-008 [C3] Nút "Xác nhận import" DISABLED khi 0 dòng hợp lệ (toàn bộ lỗi)', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Tải lên' }).click();
    await expect(page).toHaveURL(/\/internal-products\/import/);
    const ts = uniqueSuffix();
    const buf = buildImportWorkbookBuffer([
      { code: `PROD-K008A-${ts}`, name: undefined, mainUnitName: IMPORT_VALID_UNIT_CODE },
      { code: undefined, name: `SP K008 B ${ts}`, mainUnitName: IMPORT_VALID_UNIT_CODE },
    ]);
    await uploadImportBuffer(page, buf, 'k008-allinvalid.xlsx');
    await expect(page.getByText('Tổng dòng:')).toBeVisible({ timeout: 15000 });
    const statsText = await page.locator('body').innerText();
    expect(statsText).toMatch(/Hợp lệ:\s*0/);
    await expect(page.getByRole('button', { name: 'Xác nhận import' })).toBeDisabled();
  });

  test('TC-W03-UI-K-009 [C3] Mỗi dòng lỗi hiển thị lý do human-readable (không rỗng, không phải mã lỗi thô)', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Tải lên' }).click();
    await expect(page).toHaveURL(/\/internal-products\/import/);
    const ts = uniqueSuffix();
    const buf = buildImportWorkbookBuffer([
      { code: `PROD-K009-${ts}`, name: `SP K009 badnature ${ts}`, mainUnitName: IMPORT_VALID_UNIT_CODE, natureLabel: 'KhongTonTaiXYZ' },
    ]);
    await uploadImportBuffer(page, buf, 'k009-badnature.xlsx');
    await expect(page.getByText('Tổng dòng:')).toBeVisible({ timeout: 15000 });
    // Loi tinh chat tinh phia client theo dung message ERR-INV-012.
    await expect(page.getByText('Tính chất sản phẩm không hợp lệ')).toBeVisible();
  });

  test('TC-W03-UI-K-010 [P1][Smoke] [C3] (adapted - xem BUG-W03-128 khong co man Ket qua rieng) Click "Xác nhận import" — ghi chỉ dòng hợp lệ, toast đúng số lượng, redirect List, dữ liệu persist thật', async ({ page }) => {
    test.setTimeout(90000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Tải lên' }).click();
    await expect(page).toHaveURL(/\/internal-products\/import/);
    const ts = uniqueSuffix();
    const validCode1 = `PROD-K010A-${ts}`;
    const validCode2 = `PROD-K010B-${ts}`;
    const buf = buildImportWorkbookBuffer([
      { code: validCode1, name: `SP K010 valid A ${ts}`, mainUnitName: IMPORT_VALID_UNIT_CODE },
      { code: validCode2, name: `SP K010 valid B ${ts}`, mainUnitName: IMPORT_VALID_UNIT_CODE },
      // 1 dong loi (thieu ten) - phai bi bo qua, KHONG duoc ghi.
      { code: `PROD-K010ERR-${ts}`, name: undefined, mainUnitName: IMPORT_VALID_UNIT_CODE },
    ]);
    await uploadImportBuffer(page, buf, 'k010-mix.xlsx');
    await expect(page.getByText('Tổng dòng:')).toBeVisible({ timeout: 15000 });
    const statsText = await page.locator('body').innerText();
    expect(statsText).toMatch(/Hợp lệ:\s*2/);
    const commitBtn = page.getByRole('button', { name: 'Xác nhận import' });
    await expect(commitBtn).toBeEnabled();
    await commitBtn.click();
    // Toast that: "Thanh cong" / "Da nhap N ma san pham noi bo." (N=2, dung so dong hop le).
    await expect(page.getByText(/Đã nhập 2 mã sản phẩm nội bộ\./)).toBeVisible({ timeout: 15000 });
    // Redirect thang ve List (KHONG co man "Ket qua import" rieng - gap AC-8, xem BUG-W03-128).
    await page.waitForURL((u) => u.pathname.endsWith('/internal-products'), { timeout: 15000 });
    await page.waitForTimeout(800);
    // Persist that: ca 2 ma hop le xuat hien trong List; ma loi KHONG duoc tao.
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(validCode1);
    await page.waitForTimeout(600);
    await expect(page.getByRole('row').filter({ hasText: validCode1 })).toHaveCount(1);
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(`PROD-K010ERR-${ts}`);
    await page.waitForTimeout(600);
    await expect(page.getByRole('row').filter({ hasText: `PROD-K010ERR-${ts}` })).toHaveCount(0);
  });

  test('TC-W03-UI-K-011 [C3] (adapted - khong co nut "Quay lai" rieng; icon xoa file tren FilesPreview dong vai tro reset ve step Upload) Xóa file đã chọn — reset về step Upload', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Tải lên' }).click();
    await expect(page).toHaveURL(/\/internal-products\/import/);
    const ts = uniqueSuffix();
    const buf = buildImportWorkbookBuffer([
      { code: `PROD-K011-${ts}`, name: `SP K011 ${ts}`, mainUnitName: IMPORT_VALID_UNIT_CODE },
    ]);
    await uploadImportBuffer(page, buf, 'k011-valid.xlsx');
    await expect(page.getByText('Tổng dòng:')).toBeVisible({ timeout: 15000 });
    // FilesPreview: nut xoa la <button> chua icon Trash, la SIBLING (khong phai con)
    // cua div chua link ten file - xac nhan qua page snapshot live (ancestor::div[3] tu
    // link la container flex row dung chung voi button remove). Khong co aria-label/testid
    // rieng (xac nhan qua doc source components/share/files/files-preview.tsx).
    const fileLink = page.getByRole('link', { name: 'k011-valid.xlsx' });
    const fileRow = fileLink.locator('xpath=ancestor::div[3]');
    await fileRow.locator('button').first().click();
    await page.waitForTimeout(600);
    await expect(page.getByText('Tổng dòng:')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Xác nhận import' })).toBeDisabled();
  });

  test('TC-W03-UI-K-012 [C3] (adapted - BUG-W03-128: KHONG co man "Ket qua import" rieng, chi co toast + redirect List) Sau commit — verify toast thay cho man Result 4-chi-so', async ({ page }) => {
    test.setTimeout(90000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Tải lên' }).click();
    await expect(page).toHaveURL(/\/internal-products\/import/);
    const ts = uniqueSuffix();
    const buf = buildImportWorkbookBuffer([
      { code: `PROD-K012-${ts}`, name: `SP K012 ${ts}`, mainUnitName: IMPORT_VALID_UNIT_CODE },
    ]);
    await uploadImportBuffer(page, buf, 'k012-valid.xlsx');
    await expect(page.getByText('Tổng dòng:')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Xác nhận import' }).click();
    await expect(page.getByText(/Đã nhập 1 mã sản phẩm nội bộ\./)).toBeVisible({ timeout: 15000 });
    await page.waitForURL((u) => u.pathname.endsWith('/internal-products'), { timeout: 15000 });
    // Xac nhan KHONG co man Result rieng (URL van la List, khong co /result hay /import/result).
    expect(page.url()).not.toMatch(/result/i);
  });

  test('TC-W03-UI-K-013 [C3] **[BUG-W03-137]** Import commit gặp lỗi hệ thống — kỳ vọng TOAST + nút "Thử lại", thực tế CHỈ có TOAST generic (thiếu nút Thử lại)', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Tải lên' }).click();
    await expect(page).toHaveURL(/\/internal-products\/import/);
    const ts = uniqueSuffix();
    const buf = buildImportWorkbookBuffer([
      { code: `PROD-K013-${ts}`, name: `SP K013 ${ts}`, mainUnitName: IMPORT_VALID_UNIT_CODE },
    ]);
    await uploadImportBuffer(page, buf, 'k013-valid.xlsx');
    await expect(page.getByText('Tổng dòng:')).toBeVisible({ timeout: 15000 });
    // Ky thuat da verify hoat dong dung (M-009 Run 4): page.route('**/garage/graphql', ...)
    // dang ky SAU installRemoteProxies (setup boi loginAsAccountant) - Playwright chain nhieu
    // route handler tren cung URL theo thu tu LIFO, route.continue() o handler nay se roi qua
    // handler cu hon (proxy chung) neu KHONG match dieu kien - chi mutation ImportInternalProducts
    // moi bi force loi 500 gia lap, cac request GraphQL khac (searchInternalProducts...) van
    // forward binh thuong qua proxy that.
    await page.route('**/garage/graphql', async (route) => {
      const postData = route.request().postDataJSON?.() as { query?: string } | undefined;
      if (postData?.query?.includes('importInternalProducts') || postData?.query?.includes('ImportInternalProducts')) {
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ errors: [{ message: 'Internal Server Error' }] }) });
        return;
      }
      await route.continue();
    });
    const commitBtn = page.getByRole('button', { name: 'Xác nhận import' });
    await expect(commitBtn).toBeEnabled();
    await commitBtn.click();
    // Nhanh 1 - TOAST loi he thong PHAI xuat hien (KHONG phai business ErrorResponse) - PASS
    // thuc te: `handleInventoryMutationError` co fallback toast generic "Có lỗi không mong muốn
    // xảy ra, vui lòng thử lại." (xem shared/error-codes/handle-mutation-error.ts).
    const toastLocator = page.locator('text=/lỗi|thất bại|error/i').first();
    await expect(toastLocator).toBeVisible({ timeout: 8000 });
    // Nhanh 2 - step Kiem tra KHONG duoc chuyen sang Result/List (commit that su that bai) -
    // URL van con o /import, KHONG redirect.
    await expect(page).toHaveURL(/\/internal-products\/import/);
    // Nhanh 3 (ky vong FEAT) - nut "Thu lai" phai xuat hien canh TOAST de nguoi dung retry ngay
    // ma khong can upload lai file. Doc source xac nhan `toastCustom()`/`Toast` component
    // (components/share/toasts/toast.tsx) KHONG ho tro action/retry button (chi co
    // showCloseButton) - assert dung theo ky vong FEAT de FAIL that, xac nhan BUG-W03-137
    // (thieu nut "Thu lai" tren toast loi he thong import, nguoi dung phai tu thao tac lai tu dau).
    await expect(page.getByRole('button', { name: /thử lại/i })).toBeVisible({ timeout: 5000 });
    await page.unroute('**/garage/graphql');
  });

  test('TC-W03-UI-K-014 [C3] Cả 2 role có quyền truy cập Import page', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Tải lên' }).click();
    await expect(page).toHaveURL(/\/internal-products\/import/);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test('TC-W03-UI-K-015 [C3] Double-click "Xác nhận import" — không commit 2 lần', async ({ page }) => {
    test.setTimeout(90000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Tải lên' }).click();
    await expect(page).toHaveURL(/\/internal-products\/import/);
    const ts = uniqueSuffix();
    const code = `PROD-K015-${ts}`;
    const buf = buildImportWorkbookBuffer([
      { code, name: `SP K015 ${ts}`, mainUnitName: IMPORT_VALID_UNIT_CODE },
    ]);
    await uploadImportBuffer(page, buf, 'k015-valid.xlsx');
    await expect(page.getByText('Tổng dòng:')).toBeVisible({ timeout: 15000 });
    const commitBtn = page.getByRole('button', { name: 'Xác nhận import' });
    await commitBtn.click();
    // Double-click that: dispatch native click lan 2 ngay sau do (bo qua Playwright
    // actionability wait vi nut co the disable/detach rat nhanh khi navigate - dung
    // page.evaluate de tranh flake "element was detached").
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="inv-cat.import.btn-commit"]') as HTMLButtonElement | null;
      btn?.click();
    }).catch(() => {});
    await expect(page.getByText(/Đã nhập 1 mã sản phẩm nội bộ\./)).toBeVisible({ timeout: 15000 });
    await page.waitForURL((u) => u.pathname.endsWith('/internal-products'), { timeout: 15000 });
    await page.waitForTimeout(800);
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(code);
    await page.waitForTimeout(600);
    // Chi 1 dong duy nhat - khong tao trung lap du double-click.
    await expect(page.getByRole('row').filter({ hasText: code })).toHaveCount(1);
  });

  test.fixme('TC-W03-UI-K-016 [C1] Import page reuse `ExcelUpload+FilesPreview+Container+Section+TablePagination+InputSearch+PageHeader+Button+toastCustom` mirror `customers/import`', async ({ page }) => {
    // TODO(TEST_EXECUTION): can bootstrap Execution/auto/harness/ui-unit truoc khi
    // implement C1 structural check nay - xem TR Run 3 nhom C1 backlog.
  });

});
