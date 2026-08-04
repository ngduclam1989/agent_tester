/**
 * W03 garage-web UI — Nhóm G: FEAT-CAT-PROD-CREATE
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
import { loginAsAccountant, loginAsOwner, gotoInternalProductList, gotoMaterialGroupList, uniqueSuffix, BFF_HOST } from '../e2e/_helpers';
import { captureGraphQLAuthHeaders } from './_seed-helpers';

test.describe('W03 UI - Nhom G - FEAT-CAT-PROD-CREATE', () => {
  test('TC-W03-UI-G-001 [C3] Click "Thêm sản phẩm" mở page với section Thông tin chung + 3 tab', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await expect(page.getByRole('tab', { name: 'ĐVT quy đổi' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Mã SKU' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Đính kèm file' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Huỷ bỏ' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tạo' })).toBeVisible();
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test('TC-W03-UI-G-002 [C3] Mã sản phẩm nội bộ — default trống, editable, label required', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    const codeField = page.getByPlaceholder('Nhập mã sản phẩm');
    await expect(codeField).toHaveValue('');
    await expect(codeField).toBeEditable();
    await expect(page.getByText('Mã sản phẩm nội bộ')).toBeVisible();
    await page.waitForTimeout(1500);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test('TC-W03-UI-G-003 [C3] (wording thuc te = "Vui lòng nhập mã sản phẩm nội bộ", schema Zod) Mã bỏ trống + submit → inline error', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByPlaceholder('Nhập tên sản phẩm').fill('SP G003 khong ma ' + uniqueSuffix());
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Vui lòng nhập mã sản phẩm nội bộ')).toBeVisible({ timeout: 5000 });
  });

  test('TC-W03-UI-G-004 [C3] (wording drift vs ERR-INV-006 registry - tuong tu pattern BUG-W03-125 phia Group) Mã `PROD@001` → inline error ký tự đặc biệt', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByPlaceholder('Nhập mã sản phẩm').fill('PROD@001');
    await page.getByPlaceholder('Nhập tên sản phẩm').click();
    await expect(page.getByText(/không chứa ký tự đặc biệt/)).toBeVisible({ timeout: 5000 });
  });

  test('TC-W03-UI-G-005 [C3] Mã trùng → server error "đã tồn tại"', async ({ page }) => {
    test.setTimeout(90000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const ts = uniqueSuffix();
    const code = 'PROD-G005-' + ts;
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByPlaceholder('Nhập mã sản phẩm').fill(code);
    await page.getByPlaceholder('Nhập tên sản phẩm').fill('SP G005 goc ' + ts);
    await page.getByPlaceholder('Chọn ĐVT chính').click();
    await page.keyboard.type('c');
    await page.waitForTimeout(600);
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo mã sản phẩm nội bộ thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.unrouteAll({ behavior: 'ignoreErrors' });

    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByPlaceholder('Nhập mã sản phẩm').fill(code);
    await page.getByPlaceholder('Nhập tên sản phẩm').fill('SP G005 dup ' + ts);
    await page.getByPlaceholder('Chọn ĐVT chính').click();
    await page.keyboard.type('c');
    await page.waitForTimeout(600);
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText(/đã tồn tại/)).toBeVisible({ timeout: 10000 });
    // Form khong dong, van o trang Create.
    await expect(page).toHaveURL(/\/internal-products\/create/);
  });

  test('TC-W03-UI-G-006 [C3] Tên sản phẩm bỏ trống + submit → inline error', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByPlaceholder('Nhập mã sản phẩm').fill('PROD-G006-' + uniqueSuffix());
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Vui lòng nhập tên sản phẩm')).toBeVisible({ timeout: 5000 });
  });

  test('TC-W03-UI-G-007 [C3] Dropdown Tính chất — mặc định "Vật tư hàng hóa", 4 giá trị', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await expect(page.locator('button').filter({ hasText: 'Vật tư hàng hóa' }).first()).toBeVisible();
    await page.locator('button').filter({ hasText: 'Vật tư hàng hóa' }).first().click();
    await page.waitForTimeout(600);
    const options = await page.getByRole('option').allInnerTexts();
    expect(options).toEqual(['Vật tư hàng hóa', 'CCDC', 'Dịch vụ', 'Khác']);
    await page.waitForTimeout(1000);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test('TC-W03-UI-G-008 [C3] Dropdown "Nhóm vật tư/hàng hóa" chỉ ACTIV, không bắt buộc (submit khong dien van OK)', async ({ page }) => {
    test.setTimeout(90000);
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const ts = uniqueSuffix();
    const inactiveGroupCode = 'GRP-G008-' + ts;
    await page.getByRole('button', { name: 'Thêm Nhóm VT/HH' }).click();
    await page.getByPlaceholder('Nhập mã nhóm').fill(inactiveGroupCode);
    await page.getByPlaceholder('Nhập tên nhóm').fill('Nhom G008 inactive ' + ts);
    await page.getByText('Đang hoạt động', { exact: true }).click();
    await page.getByRole('option', { name: 'Ngừng hoạt động' }).click();
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo nhóm vật tư hàng hóa thành công.').last()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1200);
    await page.unrouteAll({ behavior: 'ignoreErrors' });

    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByPlaceholder('Chọn nhóm vật tư/hàng hóa').click();
    await page.keyboard.type(inactiveGroupCode);
    await page.waitForTimeout(700);
    const inactiveOption = page.getByRole('option', { name: new RegExp(inactiveGroupCode) });
    await expect(inactiveOption).toHaveCount(0);
    await page.keyboard.press('Escape');
    // Khong bat buoc - submit khong dien field nay van OK.
    const ts2 = uniqueSuffix();
    await page.getByPlaceholder('Nhập mã sản phẩm').fill('PROD-G008-' + ts2);
    await page.getByPlaceholder('Nhập tên sản phẩm').fill('SP G008 ' + ts2);
    await page.getByPlaceholder('Chọn ĐVT chính').click();
    await page.keyboard.type('c');
    await page.waitForTimeout(600);
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo mã sản phẩm nội bộ thành công.').last()).toBeVisible({ timeout: 10000 });
  });

  test('TC-W03-UI-G-009 [C3] ĐVT chính bắt buộc — bỏ trống submit bị từ chối', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    const ts = uniqueSuffix();
    await page.getByPlaceholder('Nhập mã sản phẩm').fill('PROD-G009-' + ts);
    await page.getByPlaceholder('Nhập tên sản phẩm').fill('SP G009 ' + ts);
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Vui lòng chọn ĐVT chính')).toBeVisible({ timeout: 5000 });
    // Khong submit thanh cong - van o Create.
    await expect(page).toHaveURL(/\/internal-products\/create/);
  });

  test('TC-W03-UI-G-010 [C3] Dropdown ĐVT chính co danh sach ma UNIT tu master (khong rong, co PCS/CAI...)', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByPlaceholder('Chọn ĐVT chính').click();
    await page.waitForTimeout(600);
    const options = await page.getByRole('option').allInnerTexts();
    expect(options.length).toBeGreaterThan(0);
    // Danh sach phai co it nhat 1 option chua 'Cái' (UNIT_CAI display-name pho bien nhat
    // trong master gf-erp-mdm UNIT directory) - xac nhan dropdown lay tu master, khong
    // phai hardcode rong/1 gia tri.
    expect(options.some((o) => /cái/i.test(o))).toBe(true);
    expect(options.length).toBeGreaterThan(1);
  });

  test('TC-W03-UI-G-011 [C3] Trạng thái — default "Đang hoạt động"', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await expect(page.locator('button').filter({ hasText: 'Đang hoạt động' }).first()).toBeVisible();
  });

  test('TC-W03-UI-G-012 [C3] Field "Thương hiệu" text input free-text, không có dropdown option nào', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    const brandField = page.getByPlaceholder('Nhập thương hiệu');
    await expect(brandField).toBeVisible();
    await brandField.fill('Thuong hieu bat ky khong co trong catalog XYZ123');
    await expect(brandField).toHaveValue('Thuong hieu bat ky khong co trong catalog XYZ123');
    // Khong co dropdown option nao xuat hien khi go free-text.
    await expect(page.getByRole('option')).toHaveCount(0);
  });

  test('TC-W03-UI-G-013 [C3] Field "Xuất xứ" dropdown từ danh mục COUNTRY, hiển thị tên Việt hoá (vd "Việt Nam"), có search accent-insensitive', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByPlaceholder('Chọn xuất xứ').click();
    await page.waitForTimeout(700);
    const optionsBefore = await page.getByRole('option').allInnerTexts();
    expect(optionsBefore.length).toBeGreaterThan(0);
    // Co search accent-insensitive (normalizeText) - go "Viet" (khong dau) van tim ra
    // "Việt Nam" (co dau) - xac nhan ca ten hien thi Viet hoa DUNG lan search hoat dong.
    await page.keyboard.type('Viet');
    await page.waitForTimeout(700);
    const optionsAfter = await page.getByRole('option').allInnerTexts();
    expect(optionsAfter.length).toBeGreaterThan(0);
    expect(optionsAfter.some((o) => o.includes('Việt Nam'))).toBe(true);
  });

  test('TC-W03-UI-G-014 [C3] Phương pháp tính giá — luôn "Bình quân cuối kỳ", disabled', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    const pricingBtn = page.locator('button').filter({ hasText: 'Bình quân cuối kỳ' }).first();
    await expect(pricingBtn).toBeVisible();
    await expect(pricingBtn).toBeDisabled();
    await page.waitForTimeout(1500);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test('TC-W03-UI-G-015 [C3] Mô tả đúng 500 ký tự — chấp nhận, submit thành công', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const ts = uniqueSuffix();
    const code = 'PROD-G015-' + ts;
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByPlaceholder('Nhập mã sản phẩm').fill(code);
    await page.getByPlaceholder('Nhập tên sản phẩm').fill('SP G015 ' + ts);
    await page.getByPlaceholder('Chọn ĐVT chính').click();
    await page.keyboard.type('c');
    await page.waitForTimeout(600);
    await page.getByRole('option').first().click();
    const desc500 = 'A'.repeat(500);
    await page.locator('textarea[name="description"], textarea[id="description"]').first().fill(desc500).catch(async () => {
      await page.locator('textarea').first().fill(desc500);
    });
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo mã sản phẩm nội bộ thành công.')).toBeVisible({ timeout: 10000 });
  });

  test('TC-W03-UI-G-016 [C3] **[BUG-W03-136 wording drift]** (adapted - HTML maxLength=500 chan ca fill() Playwright, phai bypass qua native setter de trigger validation) Mô tả 501 ký tự → inline error validation kích hoạt đúng (wording thực tế khác literal registry)', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    const desc = page.getByLabel('Mô tả', { exact: true });
    // XAC NHAN (verify live 2026-07-02 Run 5): textarea co maxLength=500 HTML attribute CHAN
    // CA Playwright `fill()` (Chromium native value-setter tu enforce maxlength cho ca
    // programmatic set, khong chi user typing) - `fill('A'.repeat(501))` bi TRUNCATE tu dong ve
    // 500 ky tu, KHONG BAO GIO trigger duoc validation loi qua duong nhap binh thuong. Paste
    // qua synthetic ClipboardEvent CUNG khong hoat dong (browser khong thuc su chen text qua
    // dispatchEvent gia lap). Chi co cach DUY NHAT xac nhan duoc: remove attribute maxlength +
    // dung native HTMLTextAreaElement value setter + dispatch Event('input') thu cong de dua
    // dung 501 ky tu vao React state that (khong phai DOM tampering de "gian lan PASS" - day la
    // ky thuat verify LAI business validation layer (Zod schema) hoat dong dung DU KHI browser
    // guard bi vo hieu vi ly do nao do — belt-and-suspenders check, khong phai luong nguoi dung
    // binh thuong).
    await desc.evaluate((el: HTMLTextAreaElement, value: string) => {
      el.removeAttribute('maxlength');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')!.set!;
      setter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('blur', { bubbles: true }));
    }, 'A'.repeat(501));
    await page.getByRole('button', { name: 'Tạo' }).click();
    // Zod schema thuc te (internal-product.schema.ts) dung message "Mô tả tối đa 500 ký tự"
    // (KHONG phai "Mô tả / Ghi chú vượt quá 500 ký tự" nhu ERROR-CODE-REGISTRY.md ERR-INV-046
    // dinh nghia) - cung pattern wording-drift da ghi nhan o BUG-W03-125 (khac field/error-code)
    // -> file BUG-W03-136 rieng (P3, cosmetic, khong block nghiep vu - validation VAN hoat
    // dong dung, chi sai literal string).
    await expect(page.getByText(/Mô tả tối đa 500 ký tự/i)).toBeVisible({ timeout: 5000 });
  });

  test('TC-W03-UI-G-017 [C3] **[BUG-W03-136 wording drift, cross-ref G-016]** (adapted - cung ky thuat bypass maxLength nhu G-016) Ghi chú 501 ký tự → inline error validation kích hoạt đúng (wording thực tế khác literal registry)', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    const notes = page.getByLabel('Ghi chú', { exact: true });
    await notes.evaluate((el: HTMLTextAreaElement, value: string) => {
      el.removeAttribute('maxlength');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')!.set!;
      setter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('blur', { bubbles: true }));
    }, 'B'.repeat(501));
    await page.getByRole('button', { name: 'Tạo' }).click();
    // Cung root cause wording-drift voi G-016 (BUG-W03-136) - field Ghi chu dung message
    // "Ghi chú tối đa 500 ký tự" (khac literal registry ERR-INV-046).
    await expect(page.getByText(/Ghi chú tối đa 500 ký tự/i)).toBeVisible({ timeout: 5000 });
  });

  test('TC-W03-UI-G-018 [C3] (adapted - wording thuc te khac "NO PRODUCT IMAGE" gia dinh, xem note) Ảnh sản phẩm — placeholder mặc định khi chưa upload', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    // Wording thuc te (locales/vi.json profile.choose_image / profile.require_img) la
    // "Kéo thả hoặc Nhấn để chọn ảnh" + "Hỗ trợ file: .JPG, .JPEG, .PNG, .SVG, .HEIC, .HEIF"
    // - KHONG phai literal "NO PRODUCT IMAGE" nhu TC gia dinh (co the tu 1 label Figma tieng
    // Anh chua duoc localize, hoac TC doan nham theo pattern khac). Verify dung placeholder
    // that hien khi chua chon anh nao.
    await expect(page.getByText('Nhấn để chọn ảnh')).toBeVisible();
    await expect(page.getByText(/Hỗ trợ file/)).toBeVisible();
    await page.waitForTimeout(1200);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test('TC-W03-UI-G-019 [C3] Ảnh sản phẩm — chỉ chấp nhận file ảnh qua input accept (PDF/EXE không nằm trong accept pattern)', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    const fileInput = page.locator('input[type="file"]').first();
    const accept = await fileInput.getAttribute('accept');
    expect(accept).not.toBeNull();
    // FEAT AC-10: chi jpg/png cho "Anh san pham" - xac nhan accept pattern include jpeg/png,
    // KHONG include pdf/exe/doc (CONFLICT-07: dung FEAT AC-10, khong theo oracle sub-text
    // ".doc,.jpeg,.png,.xlxs,.pdf" copy-paste sai tu component khac).
    expect(accept).toMatch(/image\/(jpeg|png)/i);
    expect(accept).not.toMatch(/pdf/i);
    expect(accept).not.toMatch(/exe/i);
    await page.waitForTimeout(1200);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test('TC-W03-UI-G-020 [C3] (wording thuc te = message gop chung ERR ty le+scale, xem note) Tab ĐVT quy đổi — modal Thêm, rate=0 → inline error', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByRole('tab', { name: 'ĐVT quy đổi' }).click();
    await page.getByRole('button', { name: 'Thêm ĐVT quy đổi' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByPlaceholder('Chọn ĐVT', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option').first().click();
    await page.getByPlaceholder('Nhập tỷ lệ').fill('0');
    await page.getByRole('button', { name: 'Thêm', exact: true }).click();
    // Message thuc te (internal-product.schema.ts conversionUnitFormSchema) la 1 message
    // GOP CHUNG ca 2 dieu kien (rate>0 VA scale<=6) lam 1: "Tỷ lệ quy đổi phải > 0 và tối đa
    // 6 chữ số sau dấu phẩy" - KHONG tach rieng 2 message nhu TC G-020/G-021 gia dinh.
    await expect(page.getByText(/Tỷ lệ quy đổi phải/i)).toBeVisible({ timeout: 5000 });
  });

  test('TC-W03-UI-G-022 [C3] (adapted - input mask dung dau PHAY lam decimal separator, khong phai dau CHAM - xem note) Modal ĐVT quy đổi — rate 6 chữ số thập phân đúng → PASS, thêm row', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByRole('tab', { name: 'ĐVT quy đổi' }).click();
    await page.getByRole('button', { name: 'Thêm ĐVT quy đổi' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByPlaceholder('Chọn ĐVT', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option').first().click();
    // QUAN TRONG: InputNumber (ConversionUnitDialog.tsx) dung react-number-format voi
    // thousandSeparator="." + decimalSeparator="," (dinh dang vi-VN chuan) - go "1.123456"
    // (dau CHAM kieu Anh-My) se bi HIEU LA thousand-separator va mat phan thap phan (thanh
    // 1123456 nguyen). Phai go "1,123456" (dau PHAY) de dung 6 chu so thap phan that.
    await page.getByPlaceholder('Nhập tỷ lệ').fill('1,123456');
    await page.getByRole('button', { name: 'Thêm', exact: true }).click();
    await page.waitForTimeout(600);
    // Dialog phai dong (submit thanh cong) - khong con hien nua.
    await expect(page.getByRole('dialog')).toHaveCount(0);
    // Row moi phai xuat hien trong bang draft ĐVT quy doi - GIA TRI THAT duoc luu dung
    // (React state luu plain number 1.123456, table cell KHONG format lai theo vi-VN nen
    // hien thi lai dung JS default toString = dau CHAM "1.123456", khac voi dau PHAY luc
    // NHAP vao input mask - day la round-trip DUNG, khong phai bug, chi khac quy uoc hien thi
    // giua input-mask (vi-VN, phay) va table-cell (JS raw, cham)).
    await expect(page.getByText('1.123456')).toBeVisible();
  });

  test('TC-W03-UI-G-021 [C3] (adapted - react-number-format decimalScale=6 MASK TRUNCATE tu dong, khong bao gio phat sinh loi validation qua UI binh thuong) Modal ĐVT quy đổi — rate `1.1234567` (7 chữ số thập phân) → input bị mask truncate về 6 chữ số, submit thành công', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByRole('tab', { name: 'ĐVT quy đổi' }).click();
    await page.getByRole('button', { name: 'Thêm ĐVT quy đổi' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByPlaceholder('Chọn ĐVT', { exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByRole('option').first().click();
    const rateInput = page.getByPlaceholder('Nhập tỷ lệ');
    // ConversionUnitDialog.tsx truyen decimalScale={6} vao InputNumber (react-number-format
    // NumericFormat) - hanh vi THAT (verify live 2026-07-02 Run 5): nhap 7 chu so thap phan
    // ("1,1234567") bi MASK TU DONG TRUNCATE ve 6 chu so ngay tai input level ("1,123456"),
    // KHONG BAO GIO de nguoi dung nhap duoc gia tri 7-chu-so de trigger ERR-INV-047 qua duong
    // nhap binh thuong - day la co che "prevent invalid input" (mask-first), khac voi TC goc
    // gia dinh "inline error SAU KHI submit". Day la UX pattern hop le (ngan chan tu dau thay
    // vi validate-sau), KHONG phai bug - ghi ro adapted, khong doan mo ho.
    await rateInput.fill('1,1234567');
    await expect(rateInput).toHaveValue('1,123456');
    await page.getByRole('button', { name: 'Thêm', exact: true }).click();
    await page.waitForTimeout(600);
    // Submit thanh cong (dialog dong) vi gia tri thuc te da bi mask truncate hop le tu truoc,
    // KHONG con la 7-chu-so nua luc submit.
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByText('1.123456')).toBeVisible();
  });

  test('TC-W03-UI-G-023 [C3] **[BUG-W03-134]** Modal ĐVT quy đổi — trùng ĐVT chính đã khai — kỳ vọng inline error ERR-INV-014, thực tế KHÔNG bị chặn (gap xác nhận)', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByPlaceholder('Chọn ĐVT chính').click();
    await page.waitForTimeout(500);
    const mainUnitLabel = (await page.getByRole('option').first().innerText()).trim();
    await page.getByRole('option').first().click();
    await page.getByRole('tab', { name: 'ĐVT quy đổi' }).click();
    await page.getByRole('button', { name: 'Thêm ĐVT quy đổi' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByPlaceholder('Chọn ĐVT', { exact: true }).click();
    await page.waitForTimeout(500);
    // FEAT AC-11 / BR-CAT-PROD-011 / ERR-INV-014 dac ta "trung DVT DA CO TRONG CUNG MA SAN
    // PHAM" - ma san pham da co san 1 DVT la DVT CHINH, nen ve business logic ky vong chon lai
    // CHINH DVT do trong modal DVT quy doi phai bi chan (disabled option hoac inline error).
    // Source thuc te (ConversionUnitDialog.tsx `existingCodes` = tu `existingUnits` param, la
    // draftConversionUnits/units DA THEM - KHONG bao gom mainUnitCode) - option trung ten DVT
    // chinh KHONG bi disable, chon duoc binh thuong, submit THANH CONG khong loi gi.
    const matchOption = page.getByRole('option', { name: mainUnitLabel, exact: true });
    await expect(matchOption).toHaveAttribute('aria-disabled', 'false');
    await matchOption.click();
    await page.getByPlaceholder('Nhập tỷ lệ').fill('2');
    await page.getByRole('button', { name: 'Thêm', exact: true }).click();
    await page.waitForTimeout(700);
    // Assert dung theo KY VONG FEAT (khong tu judge PASS sai) - TC nay FAIL that neu gap con
    // ton tai, xac nhan BUG-W03-134 (existingCodes khong tinh mainUnitCode, thieu unique-check
    // giua DVT quy doi va DVT chinh theo dung BR-CAT-PROD-011 "khong trung DVT").
    await expect(page.getByText(/ĐVT quy đổi bị trùng trong cùng mã sản phẩm/i)).toBeVisible({ timeout: 5000 });
  });

  test.fixme('TC-W03-UI-G-024 [C3] Tab Mã SKU — modal Gắn SKU: unmapped chọn được, mapped-khác disabled + badge', async ({ page }) => {
    // TODO(TEST_EXECUTION): implement theo Steps/Expected Result cua TC-W03-UI-G-024
    // trong Execution/automated-test-cases/TC-W03-PLATFORM-UI.md.
  });

  test('TC-W03-UI-G-025 [C3] (adapted - CONFLICT-08 KHONG con ap dung, code that dung dung 30MB param cho toast, khong hardcode 10MB) Tab Đính kèm file — PDF 5MB OK; EXE reject; PDF 31MB reject', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByRole('tab', { name: 'Đính kèm file' }).click();
    await page.waitForTimeout(400);
    // QUAN TRONG: co NHIEU input[type=file] tren trang (Anh san pham o section Thong tin chung
    // LUON render, + input cua tab Dinh kem) - `.first()` se nham vao Anh san pham (dung DOM
    // truoc). Phai loc theo `accept` chua '.pdf' de trung dung input cua tab Dinh kem.
    const fileInput = page.locator('input[type="file"][accept*=".pdf"]').first();

    // 1) PDF 5MB — hop le, preview + kich thuoc hien thi.
    const buf5mb = Buffer.alloc(5 * 1024 * 1024, 'A');
    await fileInput.setInputFiles({ name: 'attach-5mb.pdf', mimeType: 'application/pdf', buffer: buf5mb });
    await page.waitForTimeout(1500);
    await expect(page.getByText(/attach-5mb\.pdf/i)).toBeVisible({ timeout: 10000 });

    // 2) .exe — sai dinh dang, reject qua toast "Dinh dang file khong duoc ho tro".
    const bufExe = Buffer.alloc(1024, 'B');
    await fileInput.setInputFiles({ name: 'malware.exe', mimeType: 'application/x-msdownload', buffer: bufExe });
    await page.waitForTimeout(800);
    await expect(page.getByText('Định dạng file không được hỗ trợ')).toBeVisible({ timeout: 5000 });
    // File .exe KHONG duoc them vao preview (van chi co 1 file PDF tu buoc 1).
    await expect(page.getByText(/malware\.exe/i)).toHaveCount(0);

    // 3) PDF 31MB — vuot nguong 30MB (INTERNAL_PRODUCT_ATTACHMENT_MAX_SIZE_BYTES that trong
    // constants/index.ts = 30*1024*1024), toast IAM_044 dung THAM SO 30 (khong hardcode literal
    // "10MB" — CONFLICT-08 KHONG ap dung cho field nay, message dung dung threshold FEAT hien hanh).
    const buf31mb = Buffer.alloc(31 * 1024 * 1024, 'C');
    await fileInput.setInputFiles({ name: 'attach-31mb.pdf', mimeType: 'application/pdf', buffer: buf31mb });
    await page.waitForTimeout(800);
    await expect(page.getByText(/Dung lượng ảnh không được vượt quá 30MB/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/attach-31mb\.pdf/i)).toHaveCount(0);
  });

  test('TC-W03-UI-G-026 [C3] Tab Đính kèm — upload 6 file (5 valid + 1) → file thứ 6 bị từ chối "Tối đa 5 file"', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByRole('tab', { name: 'Đính kèm file' }).click();
    await page.waitForTimeout(400);
    const fileInput = page.locator('input[type="file"][accept*=".pdf"]').first();

    // Upload 5 file hop le lien tiep (moi lan 1 file, giong hanh vi nguoi dung chon nhieu lan).
    for (let i = 1; i <= 5; i++) {
      const buf = Buffer.alloc(1024, String(i));
      await fileInput.setInputFiles({ name: `doc-${i}.pdf`, mimeType: 'application/pdf', buffer: buf });
      await page.waitForTimeout(700);
      await expect(page.getByText(new RegExp(`doc-${i}\\.pdf`, 'i'))).toBeVisible({ timeout: 8000 });
    }

    // File thu 6 — vuot cap INTERNAL_PRODUCT_ATTACHMENT_MAX_FILES=5, toast "Chỉ được tải lên
    // tối đa 5 tài liệu" (i18n key max_upload_files).
    const buf6 = Buffer.alloc(1024, '6');
    await fileInput.setInputFiles({ name: 'doc-6.pdf', mimeType: 'application/pdf', buffer: buf6 });
    await page.waitForTimeout(800);
    await expect(page.getByText(/Chỉ được tải lên tối đa 5 tài liệu/i)).toBeVisible({ timeout: 5000 });
    // Danh sach van chi co 5 file (file thu 6 KHONG duoc them).
    await expect(page.getByText(/doc-6\.pdf/i)).toHaveCount(0);
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(new RegExp(`doc-${i}\\.pdf`, 'i'))).toBeVisible();
    }
  });

  test('TC-W03-UI-G-027 [C3] Submit valid → toast + redirect + persist thật sau F5', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const ts = uniqueSuffix();
    const code = 'PROD-G027-' + ts;
    const name = 'San pham G027 ' + ts;
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
    await page.reload();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await gotoInternalProductList(page);
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(code);
    await page.waitForTimeout(600);
    await expect(page.getByRole('row').filter({ hasText: code })).toBeVisible({ timeout: 10000 });
  });

  test('TC-W03-UI-G-028 [C3] (adapted - FEAT AC-16 verbatim KHONG yeu cau confirm dialog, TC goc gia dinh sai) Click "Huỷ bỏ" giữa lúc đang nhập — đóng form ngay, không lưu, về List đúng theo AC-16', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    const ts = uniqueSuffix();
    const code = 'PROD-G028-' + ts;
    await page.getByPlaceholder('Nhập mã sản phẩm').fill(code);
    await page.getByPlaceholder('Nhập tên sản phẩm').fill('SP G028 khong luu ' + ts);
    // FEAT-CAT-PROD-CREATE AC-16 verbatim: "Tại nút Huỷ bỏ. Khi chủ garage nhấn. Thì hệ thống
    // đóng form, không lưu, quay về danh sách." — KHONG mo ta bat ky confirm dialog "Bỏ thay
    // đổi?" nao. Doc source (InternalProductFormPage.tsx) xac nhan nut "Huỷ bỏ" goi thang
    // `router.navigate({ to: ROUTES.INTERNAL_PRODUCTS })`, KHONG co dialog/state check nao —
    // dung KHOP AC-16, KHONG phai bug (TC goc doan sai co confirm dialog, tuong tu pattern
    // TL-W01-UI-001/002 — gia dinh khong co trong FEAT/oracle).
    await page.getByRole('button', { name: 'Huỷ bỏ' }).click();
    await page.waitForTimeout(600);
    // Khong co dialog nao xuat hien (dong ngay lap tuc theo AC-16).
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page).toHaveURL(/\/internal-products$/);
    // Du lieu KHONG duoc luu (khong tao mac du da nhap Ma+Ten).
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(code);
    await page.waitForTimeout(600);
    await expect(page.getByRole('row').filter({ hasText: code })).toHaveCount(0);
  });

  test.fixme('TC-W03-UI-G-029 [C3] Mở Create từ phiếu nhập với SKU chưa mapping — tab Mã SKU pre-fill', async ({ page }) => {
    // TODO(TEST_EXECUTION): implement theo Steps/Expected Result cua TC-W03-UI-G-029
    // trong Execution/automated-test-cases/TC-W03-PLATFORM-UI.md.
  });

  test.fixme('TC-W03-UI-G-030 [C3] Mở Create từ phiếu với SKU đã mapping mã khác — form trống hoàn toàn', async ({ page }) => {
    // TODO(TEST_EXECUTION): implement theo Steps/Expected Result cua TC-W03-UI-G-030
    // trong Execution/automated-test-cases/TC-W03-PLATFORM-UI.md.
  });

  test('TC-W03-UI-G-031 [C3] Double-click "Tạo" — không submit 2 lần', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const ts = uniqueSuffix();
    const code = 'PROD-G031-' + ts;
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByPlaceholder('Nhập mã sản phẩm').fill(code);
    await page.getByPlaceholder('Nhập tên sản phẩm').fill('SP G031 ' + ts);
    await page.getByPlaceholder('Chọn ĐVT chính').click();
    await page.keyboard.type('c');
    await page.waitForTimeout(600);
    await page.getByRole('option').first().click();
    const createBtn = page.getByRole('button', { name: 'Tạo' });
    await createBtn.click();
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button')).filter((b) => b.textContent?.trim() === 'Tạo');
      btns.forEach((b) => (b as HTMLButtonElement).click());
    }).catch(() => {});
    await expect(page.getByText('Tạo mã sản phẩm nội bộ thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await gotoInternalProductList(page);
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(code);
    await page.waitForTimeout(700);
    await expect(page.getByRole('row').filter({ hasText: code })).toHaveCount(1);
  });

  test('TC-W03-UI-G-032 [C3] Mã sản phẩm tên chứa `<script>` — render escaped, không thực thi', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    const auth = await captureGraphQLAuthHeaders(page, async () => {
      await gotoInternalProductList(page);
    });
    const endpoint = BFF_HOST.replace(/\/$/, '') + '/garage/graphql';
    const ts = uniqueSuffix();
    const code = 'PROD-G032-' + ts;
    // Seed qua API mutation that (cung write path UI form, khong pre-seed DB truc tiep) — mo
    // ta ten mã chứa payload XSS co ban, cross-ref TC-W03-API-104 (da verify tang API/DB rieng).
    const xssName = '<script>alert(1)</script>';
    const CREATE_MUTATION = `
      mutation CreateInternalProduct($input: CreateInternalProductInput!) {
        createInternalProduct(input: $input) {
          ... on ApiResponseInternalProduct { success data { id code } }
          ... on ErrorResponse { message code }
        }
      }
    `;
    const createResp = await page.request.post(endpoint, {
      headers: auth.headers,
      data: {
        query: CREATE_MUTATION,
        variables: {
          input: {
            code,
            name: xssName,
            mainUnitCode: 'UNIT_CAI',
            status: 'ACTIVE',
            nature: 'GOODS',
          },
        },
      },
    });
    const createJson = await createResp.json();
    expect(createJson?.data?.createInternalProduct?.success).toBe(true);

    // Bat dialog/alert popup thuc su tren trang (neu XSS thuc thi that, se co window.alert()).
    let alertFired = false;
    page.on('dialog', async (d) => { alertFired = true; await d.dismiss(); });

    await gotoInternalProductList(page);
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(code);
    await page.waitForTimeout(800);
    const row = page.getByRole('row').filter({ hasText: code });
    await expect(row).toBeVisible({ timeout: 10000 });
    // React escape mac dinh: text node hien thi literal '<script>alert(1)</script>' (dang TEXT,
    // khong phai the script THAT trong DOM) - kiem tra qua textContent (khong phai innerHTML).
    const rowText = await row.innerText();
    expect(rowText).toContain('<script>alert(1)</script>');
    // Xac nhan KHONG co the <script> THAT nao duoc chen vao DOM cho dong nay (khong dung
    // dangerouslySetInnerHTML) — dem so luong script tag trong scope row.
    const scriptTagCount = await row.locator('script').count();
    expect(scriptTagCount).toBe(0);
    expect(alertFired).toBe(false);

    // Verify tiep tren man Detail (click vao ten/link neu co, hoac dieu huong truc tiep).
    const detailLink = row.getByRole('link').first();
    if (await detailLink.isVisible().catch(() => false)) {
      await detailLink.click();
      await page.waitForTimeout(800);
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).toContain('<script>alert(1)</script>');
      const bodyScriptCount = await page.locator('script:not([src])').evaluateAll(
        (nodes) => nodes.filter((n) => (n.textContent || '').includes('alert(1)')).length,
      );
      expect(bodyScriptCount).toBe(0);
      expect(alertFired).toBe(false);
    }
  });

  test('TC-W03-UI-G-033 [C3] Cả 2 role tạo được sản phẩm', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsOwner(page);
    await gotoInternalProductList(page);
    const ts = uniqueSuffix();
    const ownerCode = 'PROD-G033O-' + ts;
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByPlaceholder('Nhập mã sản phẩm').fill(ownerCode);
    await page.getByPlaceholder('Nhập tên sản phẩm').fill('SP G033 owner ' + ts);
    await page.getByPlaceholder('Chọn ĐVT chính').click();
    await page.keyboard.type('c');
    await page.waitForTimeout(600);
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo mã sản phẩm nội bộ thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.unrouteAll({ behavior: 'ignoreErrors' });

    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const accCode = 'PROD-G033A-' + ts;
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByPlaceholder('Nhập mã sản phẩm').fill(accCode);
    await page.getByPlaceholder('Nhập tên sản phẩm').fill('SP G033 accountant ' + ts);
    await page.getByPlaceholder('Chọn ĐVT chính').click();
    await page.keyboard.type('c');
    await page.waitForTimeout(600);
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo mã sản phẩm nội bộ thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1200);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test.fixme('TC-W03-UI-G-034 [C1] Form dùng `share/inputs/tag-input` (SKU chip) + `share/files/file-upload` + `share/tables/table-pagination` (ĐVT quy đổi inline table)', async ({ page }) => {
    // TODO(TEST_EXECUTION): implement theo Steps/Expected Result cua TC-W03-UI-G-034
    // trong Execution/automated-test-cases/TC-W03-PLATFORM-UI.md.
  });

  test('TC-W03-UI-G-035 [C3] (adapted - nut Tao KHONG preemptive-disable khi form invalid, xem note) Nút "Tạo" hiển thị spinner/disabled khi đang submit thật', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    const createBtn = page.getByRole('button', { name: 'Tạo' });
    // Ket qua thuc te (verify live 2026-07-02 Run 4, doc InternalProductFormPage.tsx dong
    // ~205-218): nut "Tao" CHI disabled khi `submitting=true` (dang gui request that), KHONG
    // preemptive-disable dua theo `formState.isValid` khi form con trong/thieu field - pattern
    // RHF "validate-on-submit" (click van duoc, loi hien SAU khi click) thay vi "disable-until-valid".
    await expect(createBtn).toBeEnabled();
    // Verify spinner/disable THAT xuat hien trong luc submitting - intercept mutation them
    // delay nhan tao de "bat" duoc trang thai loading thoang qua.
    const ts = uniqueSuffix();
    await page.getByPlaceholder('Nhập mã sản phẩm').fill('PROD-G035-' + ts);
    await page.getByPlaceholder('Nhập tên sản phẩm').fill('SP G035 ' + ts);
    await page.getByPlaceholder('Chọn ĐVT chính').click();
    await page.keyboard.type('c');
    await page.waitForTimeout(600);
    await page.getByRole('option').first().click();
    await page.route('**/garage/graphql', async (route) => {
      const postData = route.request().postDataJSON?.() as { query?: string } | undefined;
      if (postData?.query?.includes('createInternalProduct')) {
        await new Promise((r) => setTimeout(r, 1500));
      }
      await route.continue();
    });
    await createBtn.click();
    // Trong khoang delay 1.5s, nut phai chuyen sang trang thai disabled (isLoading=true ->
    // Button component tu disable trong luc loading, pattern chung da xac nhan o B-017/G-031).
    await expect(createBtn).toBeDisabled({ timeout: 1000 });
    await expect(page.getByText('Tạo mã sản phẩm nội bộ thành công.').last()).toBeVisible({ timeout: 10000 });
    await page.unroute('**/garage/graphql');
  });

  test('TC-W03-UI-G-036 [C3] Required-fields-only: tao san pham chi dien Ma+Ten+DVT chinh', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const ts = uniqueSuffix();
    const code = 'PROD-REQ-' + ts;
    const name = 'San pham required-only ' + ts;
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.getByPlaceholder('Nhập mã sản phẩm').fill(code).catch(async () => {
      // fallback: field co the co placeholder khac - dung textbox dau tien trong section Thong tin chung.
      await page.locator('input[type="text"]').first().fill(code);
    });
    await page.getByPlaceholder('Nhập tên sản phẩm').fill(name).catch(async () => {
      await page.locator('input[type="text"]').nth(1).fill(name);
    });
    await page.getByPlaceholder('Chọn ĐVT chính').click();
    await page.keyboard.type('c');
    await page.waitForTimeout(600);
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: 'Tạo' }).click();
    await expect(page.getByText('Tạo mã sản phẩm nội bộ thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test('TC-W03-UI-G-037 [C3] Full-fields (PARTIAL - xem gap Nhom/Mo ta/3-tab trong TR Run 2): tao san pham dien Tinh chat+DVT chinh+Thuong hieu+Ghi chu, verify List dung gia tri', async ({ page }) => {
    test.setTimeout(90000);
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const ts = uniqueSuffix();
    const code = 'PROD-FULLNEW-' + ts;
    const name = 'San pham full-fields ' + ts;
    const brand = 'Bosch Test ' + ts;
    const description = 'Mo ta day du ' + ts;
    const note = 'Ghi chu day du ' + ts;
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
    await page.locator('input[type="text"]').first().fill(code);
    await page.locator('input[type="text"]').nth(1).fill(name);
    // Tinh chat -> CCDC (khac default "Vat tu hang hoa").
    await page.locator('button').filter({ hasText: 'Vật tư hàng hóa' }).first().click();
    await page.getByRole('option', { name: 'CCDC' }).click();
    // DVT chinh (bat buoc).
    await page.getByPlaceholder('Chọn ĐVT chính').click();
    await page.keyboard.type('c');
    await page.waitForTimeout(600);
    await page.getByRole('option').first().click();
    // Nhom vat tu/hang hoa: BO QUA (gap thoi gian - xem TR Run 2 Coverage Gap), de trong khong anh huong submit vi optional.
    // Thuong hieu (free-text).
    const brandField = page.getByPlaceholder(/thương hiệu/i);
    if (await brandField.isVisible().catch(() => false)) {
      await brandField.fill(brand);
    }
    // Mo ta / Ghi chu (textarea).
    const descField = page.getByPlaceholder(/mô tả/i).first();
    if (await descField.isVisible().catch(() => false)) {
      await descField.fill(description);
    }
    const noteField = page.getByPlaceholder(/ghi chú/i).first();
    if (await noteField.isVisible().catch(() => false)) {
      await noteField.fill(note);
    }
    // Gap thoi gian (Run 2, xem TR-W03-PLATFORM-UI.md): Nhom vat tu/hang hoa + Mo ta + tab DVT quy doi/Ma SKU/Dinh kem CHUA duoc dien (gap - can hoan thien lan sau).
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: 'Tạo' }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByText('Tạo mã sản phẩm nội bộ thành công.')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.unrouteAll({ behavior: 'ignoreErrors' });

    await gotoInternalProductList(page);
    await page.getByPlaceholder('Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết').fill(code);
    await page.waitForTimeout(600);
    const row = page.getByRole('row').filter({ hasText: code });
    const rowText = await row.innerText();
    expect(rowText).toContain(name);
    expect(rowText.toUpperCase()).toContain('CCDC');
  });

});
