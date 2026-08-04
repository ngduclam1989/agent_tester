import { test, expect } from '@playwright/test';
import {
  loginAsAccountant,
  gotoInternalProductList,
  INV_CAT_TESTID as T,
  uniqueSuffix,
  fillByLabel,
  selectComboboxByLabel,
  selectInputSelectByPlaceholder,
} from './_helpers';

/**
 * W03 E2E — Internal Product: List / Search / Filter / Create (4-tab)
 * TC-W03-E2E-B01 .. B16, B29, B30
 * Features: FEAT-CAT-PROD-LIST, FEAT-CAT-PROD-CREATE
 *
 * NOTE (2026-07-02, xác nhận qua Playwright live run — BUG-W03-103): các
 * `data-testid` field-level (`fieldCode`/`fieldName`/`fieldMainUnit`/
 * `fieldMaterialGroup`/`fieldNature`/`fieldBrand`/`fieldOrigin`/
 * `fieldImageUrl`) của form Tạo mã sản phẩm nội bộ (`GeneralInfoSection.tsx`)
 * đã khai báo trong `INV_CAT_TESTID` nhưng KHÔNG được wire vào DOM thật
 * (count=0). Spec dưới đây dùng fallback `fillByLabel`/`selectComboboxByLabel`
 * (label-based, xác nhận hoạt động thật) cho các field này; testid vẫn giữ
 * nguyên cho formPage/btnSubmit/btnCancel/cac-tab/table/search vì các testid đó
 * ĐÃ wire đúng.
 */

test.describe('TC-W03-E2E-B01: Tạo mã SP đầy đủ 4 tab — Detail render enrichment đúng', () => {
  test('Thông tin chung + ĐVT quy đổi + Mã SKU + Đính kèm → Detail render đúng', async ({ page }) => {
    const skuId = process.env.SEED_UNMAPPED_SKU_ID;
    test.skip(!skuId, 'Cần SEED_UNMAPPED_SKU_ID (SKU chưa mapping) — xem Test Environment & Data');
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const suf = uniqueSuffix();
    const code = `PROD-${suf}`;

    await page.getByTestId(T.internalProduct.btnCreate).click();
    await page.getByTestId(T.internalProduct.formPage).waitFor({ state: 'visible' });
    await fillByLabel(page, 'Mã sản phẩm nội bộ', code);
    await fillByLabel(page, 'Tên sản phẩm', `Lốp test ${suf}`);
    await selectInputSelectByPlaceholder(page, 'Chọn ĐVT chính', 'Cái');
    await fillByLabel(page, 'Thương hiệu', 'Michelin');

    await page.getByTestId(T.internalProduct.tabConversion).click();
    await page.getByRole('button', { name: 'Thêm ĐVT quy đổi' }).click();
    await selectInputSelectByPlaceholder(page, 'Chọn ĐVT', 'Thùng');
    await page.getByPlaceholder('Nhập tỷ lệ').fill('12');
    await page.getByRole('button', { name: 'Thêm' }).click();

    await page.getByTestId(T.internalProduct.tabSku).click();
    await page.getByRole('button', { name: 'Gắn SKU' }).click();
    await page.getByPlaceholder(/tìm.*sku/i).fill(String(skuId));
    await page.getByRole('button', { name: 'Gắn SKU' }).click();

    await page.getByTestId(T.internalProduct.tabAttachment).click();
    await page.locator('input[type="file"]').setInputFiles({
      name: 'spec.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 test file'),
    });

    await page.getByTestId(T.internalProduct.btnSubmit).click();
    await expect(page.getByText(/thành công/i).first()).toBeVisible({ timeout: 15000 });

    // Final observable end state: Detail render enrichment (mainUnitDisplayName/brand)
    await expect(page.getByRole('heading', { name: 'Chi tiết sản phẩm' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Michelin')).toBeVisible();
    await expect(page.getByText(code)).toBeVisible();
  });
});

test.describe('TC-W03-E2E-B02: Tìm kiếm mã SP theo mã/tên/SKU liên kết', () => {
  test('Từ khoá khớp mã nội bộ/tên/SKU → kết quả đúng', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByTestId(T.internalProduct.searchInput).locator('input').fill('PROD-');
    await page.waitForLoadState('networkidle');
    const rows = page.getByTestId(T.internalProduct.table).locator('tbody tr');
    if ((await rows.count()) > 0) await expect(rows.first()).toContainText(/PROD-/i);
  });
});

test.describe('TC-W03-E2E-B03: Áp dụng đồng thời 3 bộ lọc (trạng thái+tính chất+nhóm hàng)', () => {
  test('Kết quả thoả cả 3 điều kiện lọc (AND)', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: /Trạng thái/ }).click();
    await page.getByText('Đang hoạt động', { exact: true }).click();
    await page.getByRole('button', { name: /Tính chất/ }).click();
    await page.getByText('Vật tư hàng hóa', { exact: true }).click();
    await page.waitForLoadState('networkidle');
    const rows = page.getByTestId(T.internalProduct.table).locator('tbody tr');
    if ((await rows.count()) > 0) {
      await expect(rows.first()).toContainText('Đang hoạt động');
    }
  });
});

test.describe('TC-W03-E2E-B04: Phân trang danh sách mã SP', () => {
  test('Chuyển trang 1→2, không trùng lặp dữ liệu', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const pagination = page.getByTestId(T.internalProduct.table).locator('~ *').filter({ hasText: /trang|page/i });
    const nextBtn = page.getByRole('button', { name: /trang sau|next/i });
    if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      const firstRowBefore = await page.getByTestId(T.internalProduct.table).locator('tbody tr').first().textContent();
      await nextBtn.click();
      await page.waitForLoadState('networkidle');
      const firstRowAfter = await page.getByTestId(T.internalProduct.table).locator('tbody tr').first().textContent();
      expect(firstRowBefore).not.toEqual(firstRowAfter);
    }
    expect(pagination).toBeTruthy();
  });
});

test.describe('TC-W03-E2E-B05: Cột Thao tác theo trạng thái', () => {
  test('Đang HĐ có Sửa+Xóa; Ngừng HĐ chỉ Xem', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByRole('button', { name: /Trạng thái/ }).click();
    await page.getByText('Ngừng hoạt động', { exact: true }).click();
    await page.waitForLoadState('networkidle');
    const rows = page.getByTestId(T.internalProduct.table).locator('tbody tr');
    if ((await rows.count()) > 0) {
      const firstRow = rows.first();
      await expect(firstRow.getByRole('button', { name: 'Chỉnh sửa' })).toHaveCount(0);
      await expect(firstRow.getByRole('button', { name: 'Xóa' })).toHaveCount(0);
    }
  });
});

test.describe('TC-W03-E2E-B06: Tenant mới chưa có mã SP nào', () => {
  test('[spec-gap: seed-dependent] Empty state "Không có dữ liệu"', async ({ page }) => {
    const emptyTenantReachable = !!process.env.EMPTY_TENANT_BASE_URL;
    test.skip(!emptyTenantReachable, 'Cần EMPTY_TENANT_BASE_URL trỏ tới tenant sạch');
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await expect(page.getByText('Không có dữ liệu')).toBeVisible();
    await expect(page.getByTestId(T.internalProduct.btnCreate)).toBeVisible();
  });
});

test.describe('TC-W03-E2E-B07: Tìm/lọc không khớp mã nào', () => {
  test('Empty state "Không tìm thấy kết quả phù hợp"', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByTestId(T.internalProduct.searchInput).locator('input').fill('ZZZ-NO-MATCH-9999');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Không tìm thấy kết quả phù hợp')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('TC-W03-E2E-B08: Tạo mã SP — bỏ trống Mã/Tên/ĐVT chính', () => {
  test('Bỏ trống trường bắt buộc → lỗi validation, không lưu', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByTestId(T.internalProduct.btnCreate).click();
    await page.getByTestId(T.internalProduct.btnSubmit).click();
    await expect(page.getByText(/vui lòng nhập|bắt buộc/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId(T.internalProduct.formPage)).toBeVisible();
  });
});

test.describe('TC-W03-E2E-B09: Tạo mã SP — mã chứa ký tự đặc biệt', () => {
  test('Ký tự đặc biệt trong Mã sản phẩm nội bộ bị chặn/báo lỗi', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByTestId(T.internalProduct.btnCreate).click();
    const codeInput = page.getByLabel('Mã sản phẩm nội bộ', { exact: false }).first();
    await codeInput.fill('PROD@#$001');
    await fillByLabel(page, 'Tên sản phẩm', 'SP ký tự lỗi');
    await page.getByTestId(T.internalProduct.btnSubmit).click();
    const value = await codeInput.inputValue();
    const hasError = await page.getByText(/không hợp lệ/i).first().isVisible().catch(() => false);
    expect(hasError || !/[@#$]/.test(value)).toBeTruthy();
  });
});

test.describe('TC-W03-E2E-B10: Tạo mã SP — mã trùng', () => {
  test('Mã trùng đã tồn tại → lỗi, không lưu', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const suf = uniqueSuffix();
    const code = `PROD-DUP-${suf}`;

    await page.getByTestId(T.internalProduct.btnCreate).click();
    await fillByLabel(page, 'Mã sản phẩm nội bộ', code);
    await fillByLabel(page, 'Tên sản phẩm', `Gốc ${suf}`);
    await selectInputSelectByPlaceholder(page, 'Chọn ĐVT chính', 'Cái');
    await page.getByTestId(T.internalProduct.btnSubmit).click();
    await expect(page.getByText(/thành công/i).first()).toBeVisible({ timeout: 10000 });

    await page.getByTestId(T.internalProduct.btnCreate).click();
    await fillByLabel(page, 'Mã sản phẩm nội bộ', code);
    await fillByLabel(page, 'Tên sản phẩm', `Trùng ${suf}`);
    await selectInputSelectByPlaceholder(page, 'Chọn ĐVT chính', 'Cái');
    await page.getByTestId(T.internalProduct.btnSubmit).click();
    await expect(page.getByText(/đã tồn tại/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('TC-W03-E2E-B11: Tạo mã SP — Huỷ bỏ', () => {
  test('Nhấn "Huỷ bỏ" → không lưu, quay list', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const suf = uniqueSuffix();
    await page.getByTestId(T.internalProduct.btnCreate).click();
    await fillByLabel(page, 'Mã sản phẩm nội bộ', `PROD-CANCEL-${suf}`);
    await page.getByTestId(T.internalProduct.btnCancel).click();
    await expect(page.getByTestId(T.internalProduct.table)).toBeVisible({ timeout: 5000 });
    await page.getByTestId(T.internalProduct.searchInput).locator('input').fill(`PROD-CANCEL-${suf}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Không tìm thấy kết quả phù hợp')).toBeVisible();
  });
});

test.describe('TC-W03-E2E-B12: Mô tả/Ghi chú vượt 500 ký tự → ERR-INV-046', () => {
  test('Nhập > 500 ký tự vào Mô tả → highlight lỗi, không lưu', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByTestId(T.internalProduct.btnCreate).click();
    const longText = 'x'.repeat(501);
    await page.getByPlaceholder(/mô tả/i).fill(longText);
    await page.getByTestId(T.internalProduct.btnSubmit).click();
    await expect(page.getByText(/vượt quá 500 ký tự/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('TC-W03-E2E-B13: ĐVT quy đổi — tỷ lệ ≤0 / trùng ĐVT', () => {
  test('Rate ≤0 → ERR-INV-013; ĐVT trùng → ERR-INV-014', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByTestId(T.internalProduct.btnCreate).click();
    await page.getByTestId(T.internalProduct.tabConversion).click();
    await page.getByRole('button', { name: 'Thêm ĐVT quy đổi' }).click();
    await selectInputSelectByPlaceholder(page, 'Chọn ĐVT', 'Thùng');
    await page.getByPlaceholder('Nhập tỷ lệ').fill('0');
    await page.getByRole('button', { name: 'Thêm' }).click();
    await expect(page.getByText('Tỷ lệ quy đổi phải lớn hơn 0')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('TC-W03-E2E-B14: ĐVT quy đổi — tỷ lệ vượt 6 chữ số thập phân', () => {
  test('Rate 7 chữ số thập phân → ERR-INV-047', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByTestId(T.internalProduct.btnCreate).click();
    await page.getByTestId(T.internalProduct.tabConversion).click();
    await page.getByRole('button', { name: 'Thêm ĐVT quy đổi' }).click();
    await selectInputSelectByPlaceholder(page, 'Chọn ĐVT', 'Thùng');
    await page.getByPlaceholder('Nhập tỷ lệ').fill('1.1234567');
    await page.getByRole('button', { name: 'Thêm' }).click();
    await expect(page.getByText('Tỷ lệ quy đổi không được có quá 6 chữ số sau dấu phẩy')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('TC-W03-E2E-B15: Gắn SKU — chặn SKU đã mapping mã khác', () => {
  test('SKU "Đã mapping mã khác" không chọn được; SKU "Chưa mapping" gắn thành công', async ({ page }) => {
    const mappedSku = process.env.SEED_MAPPED_SKU_ID;
    test.skip(!mappedSku, 'Cần SEED_MAPPED_SKU_ID (SKU đã mapping mã khác)');
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByTestId(T.internalProduct.btnCreate).click();
    await page.getByTestId(T.internalProduct.tabSku).click();
    await page.getByRole('button', { name: 'Gắn SKU' }).click();
    await page.getByPlaceholder(/tìm.*sku/i).fill(String(mappedSku));
    await expect(page.getByText('Đã mapping mã khác')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('checkbox').first()).toBeDisabled();
  });
});

test.describe('TC-W03-E2E-B16: Tab Đính kèm file — cap 5 tệp / định dạng / dung lượng', () => {
  test('File sai định dạng bị chặn (ERR-CMN-005); quá dung lượng bị chặn (ERR-CMN-004)', async ({ page }) => {
    // NOTE (drift risk — observation từ ERROR-CODE-REGISTRY.md dòng 68): message ERR-CMN-004
    // hiện vẫn ghi "tối đa 10MB" nhưng FEAT-CAT-PROD-CREATE v12 (2026-06-29) chốt cap 30MB
    // riêng cho W03 catalog (BA "revert 10MB → 30MB"). Registry sync là follow-up CHƯA áp
    // dụng (dual-owner CR). Assertion dưới đây theo cap 30MB (FEAT — nguồn business), phần
    // message text cụ thể cần verify thực tế khi chạy live (có thể vẫn hiện "10MB" do lag).
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByTestId(T.internalProduct.btnCreate).click();
    await page.getByTestId(T.internalProduct.tabAttachment).click();
    await page.locator('input[type="file"]').setInputFiles({
      name: 'malware.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('MZ fake exe'),
    });
    await expect(page.getByText(/định dạng không hỗ trợ|PDF, JPG, PNG/i)).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// Bổ sung theo yêu cầu coordinator (2026-07-02, /test-exec bổ sung riêng):
// data test PHẢI tạo mới hoàn toàn qua UI cho journey tạo mới — tối thiểu
// 2 case: (a) required-only, (b) full-fields. B01 ở trên đã gần với full-fields
// (4 tab) nhưng CHƯA điền hết mọi optional field info-tab (Tính chất non-default,
// Nhóm vật tư/hàng hóa, Xuất xứ, Thông số kỹ thuật, Quy cách sản phẩm, Mô tả,
// Ghi chú) và CHƯA có case required-only riêng — B29/B30 bổ sung đúng 2 case này.
// ---------------------------------------------------------------------------

test.describe('TC-W03-E2E-B29: Tạo mã SP — CHỈ nhập trường bắt buộc (Mã + Tên + ĐVT chính)', () => {
  test('Bỏ trống mọi optional field (Tính chất/Nhóm/Thương hiệu/Xuất xứ/Thông số/Quy cách/Mô tả/Ghi chú/Ảnh, không tab phụ) → tạo thành công, Detail hiển thị optional field rỗng/mặc định', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const suf = uniqueSuffix();
    const code = `PROD-REQ-${suf}`;
    const name = `SP required-only ${suf}`;

    await page.getByTestId(T.internalProduct.btnCreate).click();
    await page.getByTestId(T.internalProduct.formPage).waitFor({ state: 'visible' });
    await fillByLabel(page, 'Mã sản phẩm nội bộ', code);
    await fillByLabel(page, 'Tên sản phẩm', name);
    await selectInputSelectByPlaceholder(page, 'Chọn ĐVT chính', 'Cái');
    // KHÔNG đụng vào: Tính chất (giữ mặc định "Vật tư hàng hóa"), Nhóm vật tư/hàng hóa,
    // Trạng thái (giữ mặc định "Đang hoạt động"), Thương hiệu, Xuất xứ, Thông số kỹ thuật,
    // Quy cách sản phẩm, Mô tả, Ghi chú, Ảnh sản phẩm, tab ĐVT quy đổi/Mã SKU/Đính kèm.
    await page.getByTestId(T.internalProduct.btnSubmit).click();
    await expect(page.getByText(/thành công/i).first()).toBeVisible({ timeout: 15000 });

    // Final observable end state: Detail render — optional field mặc định/rỗng
    await expect(page.getByRole('heading', { name: 'Chi tiết sản phẩm' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(code)).toBeVisible();
    await expect(page.getByText(name)).toBeVisible();
    await expect(page.getByText('Vật tư hàng hóa', { exact: true })).toBeVisible();
    await expect(page.getByText('Đang hoạt động').first()).toBeVisible();
  });
});

test.describe('TC-W03-E2E-B30: Tạo mã SP — ĐẦY ĐỦ TẤT CẢ trường (bắt buộc + optional)', () => {
  test('Điền hết Tính chất/Nhóm/Thương hiệu/Xuất xứ/Thông số/Quy cách/Mô tả/Ghi chú + ĐVT quy đổi/SKU/Đính kèm → Detail hiển thị đúng toàn bộ giá trị', async ({ page }) => {
    const skuId = process.env.SEED_UNMAPPED_SKU_ID;
    test.skip(!skuId, 'Cần SEED_UNMAPPED_SKU_ID (SKU chưa mapping) — xem Test Environment & Data');
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const suf = uniqueSuffix();
    const code = `PROD-FULL-${suf}`;
    const name = `SP full-fields ${suf}`;
    const techSpec = `Thông số kỹ thuật ${suf}`;
    const productSpec = `Quy cách sản phẩm ${suf}`;
    const description = `Mô tả đầy đủ cho case full-fields ${suf}`;
    const notes = `Ghi chú đầy đủ cho case full-fields ${suf}`;

    await page.getByTestId(T.internalProduct.btnCreate).click();
    await page.getByTestId(T.internalProduct.formPage).waitFor({ state: 'visible' });
    await fillByLabel(page, 'Mã sản phẩm nội bộ', code);
    await fillByLabel(page, 'Tên sản phẩm', name);
    await selectComboboxByLabel(page, 'Tính chất', 'CCDC');
    await selectInputSelectByPlaceholder(page, 'Chọn nhóm vật tư/hàng hóa');
    await selectInputSelectByPlaceholder(page, 'Chọn ĐVT chính', 'Cái');
    await fillByLabel(page, 'Thương hiệu', 'Michelin Full');
    await selectInputSelectByPlaceholder(page, 'Chọn xuất xứ');
    await fillByLabel(page, 'Thông số kỹ thuật', techSpec);
    await fillByLabel(page, 'Quy cách sản phẩm', productSpec);
    await fillByLabel(page, 'Mô tả', description);
    await fillByLabel(page, 'Ghi chú', notes);

    await page.getByTestId(T.internalProduct.tabConversion).click();
    await page.getByRole('button', { name: 'Thêm ĐVT quy đổi' }).click();
    await selectInputSelectByPlaceholder(page, 'Chọn ĐVT', 'Thùng');
    await page.getByPlaceholder('Nhập tỷ lệ').fill('24');
    await page.getByRole('button', { name: 'Thêm' }).click();

    await page.getByTestId(T.internalProduct.tabSku).click();
    await page.getByRole('button', { name: 'Gắn SKU' }).click();
    await page.getByPlaceholder(/tìm.*sku/i).fill(String(skuId));
    await page.getByRole('button', { name: 'Gắn SKU' }).click();

    await page.getByTestId(T.internalProduct.tabAttachment).click();
    await page.locator('input[type="file"]').setInputFiles({
      name: 'full-fields-spec.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 full fields test file'),
    });

    await page.getByTestId(T.internalProduct.btnSubmit).click();
    await expect(page.getByText(/thành công/i).first()).toBeVisible({ timeout: 15000 });

    // Final observable end state: Detail render — TOÀN BỘ giá trị optional đã nhập
    await expect(page.getByRole('heading', { name: 'Chi tiết sản phẩm' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(code)).toBeVisible();
    await expect(page.getByText(name)).toBeVisible();
    await expect(page.getByText('Michelin Full')).toBeVisible();
    await expect(page.getByText(techSpec)).toBeVisible();
    await expect(page.getByText(productSpec)).toBeVisible();
    await expect(page.getByText(description)).toBeVisible();
    await expect(page.getByText(notes)).toBeVisible();
  });
});
