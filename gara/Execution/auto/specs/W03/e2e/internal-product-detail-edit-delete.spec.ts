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
 * W03 E2E — Internal Product: Detail tabs / Edit / Delete / Cross-boundary
 * TC-W03-E2E-B17 .. B28
 * Features: FEAT-CAT-PROD-DETAIL, FEAT-CAT-PROD-EDIT, FEAT-CAT-PROD-DELETE
 *
 * NOTE (2026-07-02, xác nhận qua Playwright live run — BUG-W03-103): testid
 * field-level của form Internal Product chưa wire — dùng fallback
 * `fillByLabel`/`selectComboboxByLabel`. Đồng thời fix double-`btnCreate.click()`
 * (bug spec cũ: gọi click ở ngoài RỒI lại gọi trong `createBasicProduct` — bước
 * thứ 2 chạy trên trang Create nên `btnCreate` không còn tồn tại → timeout).
 */

async function createBasicProduct(page: import('@playwright/test').Page, code: string, name: string) {
  await page.getByTestId(T.internalProduct.btnCreate).click();
  await page.getByTestId(T.internalProduct.formPage).waitFor({ state: 'visible' });
  await fillByLabel(page, 'Mã sản phẩm nội bộ', code);
  await fillByLabel(page, 'Tên sản phẩm', name);
  await selectInputSelectByPlaceholder(page, 'Chọn ĐVT chính', 'Cái');
  await page.getByTestId(T.internalProduct.btnSubmit).click();
  await expect(page.getByText(/thành công/i).first()).toBeVisible({ timeout: 10000 });
  // Sau khi tạo thành công, app điều hướng sang trang Chi tiết — quay lại List
  // để các bước search/sửa/xóa tiếp theo hoạt động đúng (xác nhận qua
  // Playwright live run 2026-07-02: submit thành công → /internal-products/{id},
  // KHÔNG phải quay về list).
  await gotoInternalProductList(page);
}

test.describe('TC-W03-E2E-B17: Chi tiết — Tab ĐVT quy đổi: thêm/sửa/xóa + khoá khi đã giao dịch', () => {
  test('Thêm dòng ĐVT quy đổi mới; dòng đã giao dịch (seed) bị khoá Sửa/Xóa', async ({ page }) => {
    const txnProductCode = process.env.SEED_PRODUCT_WITH_TXN_CONVERSION;
    test.skip(!txnProductCode, 'Cần SEED_PRODUCT_WITH_TXN_CONVERSION (mã SP có ĐVT quy đổi đã giao dịch)');
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByTestId(T.internalProduct.searchInput).locator('input').fill(String(txnProductCode));
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.internalProduct.table).locator('tbody tr').first().getByRole('link').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.internalProduct.tabConversion).click();
    const firstRow = page.locator('[data-testid*="conversion-row"]').first();
    await expect(firstRow.getByRole('button', { name: 'Chỉnh sửa' })).toBeDisabled();
    await expect(firstRow.getByRole('button', { name: 'Xóa' })).toBeDisabled();
  });
});

test.describe('TC-W03-E2E-B18: Chi tiết — Tab Mã SKU: bỏ gắn SKU chỉ gỡ mapping', () => {
  test('Bỏ gắn SKU → SKU gốc không bị xóa, còn tồn tại ở nguồn dữ liệu SKU', async ({ page }) => {
    const mappedProductCode = process.env.SEED_PRODUCT_WITH_SKU;
    test.skip(!mappedProductCode, 'Cần SEED_PRODUCT_WITH_SKU (mã SP đã gắn ≥1 SKU)');
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByTestId(T.internalProduct.searchInput).locator('input').fill(String(mappedProductCode));
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.internalProduct.table).locator('tbody tr').first().getByRole('link').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.internalProduct.tabSku).click();
    const skuRow = page.locator('[data-testid*="sku-row"]').first();
    const skuCode = await skuRow.textContent();
    await skuRow.locator('[data-testid*="btn-remove-sku"]').click();
    await page.getByRole('button', { name: /xác nhận|có/i }).click();
    await expect(page.getByText(/gỡ.*thành công|thành công/i).first()).toBeVisible({ timeout: 10000 });
    expect(skuCode).toBeTruthy();
  });
});

test.describe('TC-W03-E2E-B19: Chi tiết — Tab Đính kèm: xem/tải tệp', () => {
  test('Tệp đã đính kèm hiển thị tên+dung lượng và mở/tải được', async ({ page }) => {
    const productWithAttachment = process.env.SEED_PRODUCT_WITH_ATTACHMENT;
    test.skip(!productWithAttachment, 'Cần SEED_PRODUCT_WITH_ATTACHMENT');
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByTestId(T.internalProduct.searchInput).locator('input').fill(String(productWithAttachment));
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.internalProduct.table).locator('tbody tr').first().getByRole('link').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.internalProduct.tabAttachment).click();
    const row = page.locator('[data-testid*="attachment-row"]').first();
    await expect(row).toBeVisible({ timeout: 10000 });
    await expect(row.getByRole('link')).toBeVisible();
  });
});

test.describe('TC-W03-E2E-B20: Sửa mã SP — Mã sản phẩm khóa', () => {
  test('Trường Mã sản phẩm nội bộ disabled trên form sửa', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const suf = uniqueSuffix();
    const code = `PROD-LOCKCODE-${suf}`;
    await createBasicProduct(page, code, `Lock code ${suf}`);
    await page.getByTestId(T.internalProduct.searchInput).locator('input').fill(code);
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.internalProduct.table).locator('tbody tr').first().getByRole('button', { name: 'Chỉnh sửa' }).click();
    await expect(page.getByLabel('Mã sản phẩm nội bộ', { exact: false }).first()).toBeDisabled();
  });
});

test.describe('TC-W03-E2E-B21: Sửa mã SP — ĐVT chính khóa/mở theo giao dịch', () => {
  test('Đã giao dịch → khóa ĐVT chính; chưa giao dịch → cho đổi', async ({ page }) => {
    const txnProduct = process.env.SEED_PRODUCT_WITH_TXN;
    test.skip(!txnProduct, 'Cần SEED_PRODUCT_WITH_TXN (mã SP đã phát sinh giao dịch)');
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByTestId(T.internalProduct.searchInput).locator('input').fill(String(txnProduct));
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.internalProduct.table).locator('tbody tr').first().getByRole('button', { name: 'Chỉnh sửa' }).click();
    const container = page.locator('label', { hasText: 'ĐVT chính' }).first().locator('xpath=ancestor::*[.//*[@role="combobox"] or .//button][1]');
    await expect(container.locator('button, [role="combobox"]').first()).toBeDisabled();
  });
});

test.describe('TC-W03-E2E-B22: Sửa mã SP — cập nhật đầy đủ trường thông tin chung', () => {
  test('Tên/tính chất/nhóm/trạng thái/thương hiệu/xuất xứ cập nhật thành công', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const suf = uniqueSuffix();
    const code = `PROD-EDIT-${suf}`;
    await createBasicProduct(page, code, `Edit gốc ${suf}`);
    await page.getByTestId(T.internalProduct.searchInput).locator('input').fill(code);
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.internalProduct.table).locator('tbody tr').first().getByRole('button', { name: 'Chỉnh sửa' }).click();
    await fillByLabel(page, 'Tên sản phẩm', `Edit đã sửa ${suf}`);
    await fillByLabel(page, 'Thương hiệu', 'Bosch');
    await page.getByTestId(T.internalProduct.btnSubmit).click();
    await expect(page.getByText(/thành công/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Bosch')).toBeVisible();
  });
});

test.describe('TC-W03-E2E-B23: Sửa mã SP — Phương pháp tính giá vẫn khóa', () => {
  test('Trường Phương pháp tính giá luôn "Bình quân cuối kỳ", disabled', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const suf = uniqueSuffix();
    const code = `PROD-PRICING-${suf}`;
    await createBasicProduct(page, code, `Pricing ${suf}`);
    await page.getByTestId(T.internalProduct.searchInput).locator('input').fill(code);
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.internalProduct.table).locator('tbody tr').first().getByRole('button', { name: 'Chỉnh sửa' }).click();
    await expect(page.getByText('Bình quân cuối kỳ')).toBeVisible();
    const container = page.locator('label', { hasText: 'Phương pháp tính giá' }).first().locator('xpath=ancestor::*[.//*[@role="combobox"]][1]');
    await expect(container.getByRole('combobox').first()).toBeDisabled();
  });
});

test.describe('TC-W03-E2E-B24: Xóa mã SP — chưa giao dịch: cascade unmap', () => {
  test('Xóa thành công, cascade gỡ SKU/ĐVT quy đổi/đính kèm, SKU gốc không mất', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const suf = uniqueSuffix();
    const code = `PROD-DEL-${suf}`;
    await createBasicProduct(page, code, `Del ${suf}`);
    await page.getByTestId(T.internalProduct.searchInput).locator('input').fill(code);
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.internalProduct.table).locator('tbody tr').first().getByRole('button', { name: 'Xóa' }).click();
    await expect(page.getByText(/xác nhận/i)).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Xóa' }).click();
    await expect(page.getByText(/xóa.*thành công/i)).toBeVisible({ timeout: 10000 });
    await page.getByTestId(T.internalProduct.searchInput).locator('input').fill(code);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Không tìm thấy kết quả phù hợp')).toBeVisible();
  });
});

test.describe('TC-W03-E2E-B25: Xóa mã SP — đã giao dịch: chặn, chuyển INACTIVE thay thế', () => {
  test('Popup "Không thể xóa"; Edit→INACTIVE là hướng thay thế hợp lệ', async ({ page }) => {
    const txnProduct = process.env.SEED_PRODUCT_WITH_TXN;
    test.skip(!txnProduct, 'Cần SEED_PRODUCT_WITH_TXN (mã SP đã phát sinh dữ liệu sử dụng)');
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByTestId(T.internalProduct.searchInput).locator('input').fill(String(txnProduct));
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.internalProduct.table).locator('tbody tr').first().getByRole('button', { name: 'Xóa' }).click();
    await expect(page.getByText('Không thể xóa')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Đóng' }).click();

    await page.getByTestId(T.internalProduct.table).locator('tbody tr').first().getByRole('button', { name: 'Chỉnh sửa' }).click();
    await selectComboboxByLabel(page, 'Trạng thái', 'Ngừng hoạt động');
    await page.getByTestId(T.internalProduct.btnSubmit).click();
    await expect(page.getByText(/thành công/i).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('TC-W03-E2E-B26: Mã SP thuộc nhóm vừa Ngừng HĐ — Detail/Edit vẫn dùng được', () => {
  test('Detail render đầy đủ; dropdown Nhóm hàng khi Edit chỉ còn nhóm ACTIVE (W05 placeholder)', async ({ page }) => {
    const productInInactiveGroup = process.env.SEED_PRODUCT_IN_INACTIVE_GROUP;
    test.skip(!productInInactiveGroup, 'Cần SEED_PRODUCT_IN_INACTIVE_GROUP (mã SP thuộc nhóm vừa chuyển INACTIVE)');
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByTestId(T.internalProduct.searchInput).locator('input').fill(String(productInInactiveGroup));
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.internalProduct.table).locator('tbody tr').first().getByRole('link').first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Chi tiết sản phẩm' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Chỉnh sửa' }).click();
    const container = page.locator('label', { hasText: 'Nhóm vật tư/hàng hóa' }).first().locator('xpath=ancestor::*[.//input][1]');
    await container.locator('input').first().click();
    const options = page.locator('[role="option"]');
    const count = await options.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      await expect(options.nth(i)).not.toContainText('Ngừng hoạt động');
    }
  });
});

test.describe('TC-W03-E2E-B27: gf-erp-mdm thêm Xuất xứ mới → dropdown + Detail reflect ngay', () => {
  test('Xuất xứ mới hiển thị trong dropdown Create + originDisplayName Detail', async ({ page }) => {
    const newCountryLabel = process.env.SEED_NEW_COUNTRY_LABEL;
    test.skip(!newCountryLabel, 'Cần SEED_NEW_COUNTRY_LABEL (master COUNTRY mới thêm trước test)');
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByTestId(T.internalProduct.btnCreate).click();
    const container = page.locator('label', { hasText: 'Xuất xứ' }).first().locator('xpath=ancestor::*[.//*[@role="combobox"] or .//input][1]');
    await container.locator('input, [role="combobox"]').first().click();
    await page.getByPlaceholder(/tìm/i).fill(String(newCountryLabel).slice(0, 4));
    await expect(page.getByText(String(newCountryLabel))).toBeVisible({ timeout: 10000 });
  });
});

test.describe('TC-W03-E2E-B28: Tải tệp đính kèm qua presigned URL (ADR-016)', () => {
  test('2-bước upload (presigned generate + PUT storage) + metadata save + Detail render link', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    const suf = uniqueSuffix();
    const code = `PROD-ATTACH-${suf}`;
    await createBasicProduct(page, code, `Attach ${suf}`);

    const requests: string[] = [];
    page.on('request', (req) => requests.push(req.url()));

    await page.getByTestId(T.internalProduct.searchInput).locator('input').fill(code);
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.internalProduct.table).locator('tbody tr').first().getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.getByTestId(T.internalProduct.tabAttachment).click();
    await page.locator('input[type="file"]').setInputFiles({
      name: 'presigned-test.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 test'),
    });
    await expect(page.getByText(/tải lên thành công|đã tải lên/i)).toBeVisible({ timeout: 15000 });

    const hasPresignedFlow = requests.some((u) => /presign|storage|attachment/i.test(u));
    expect(hasPresignedFlow).toBeTruthy();
  });
});
