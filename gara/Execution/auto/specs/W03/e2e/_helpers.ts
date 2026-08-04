import { Page, expect } from '@playwright/test';

/**
 * Shared helpers cho W03 E2E — EP-INVENTORY-CATALOG (Danh mục vật tư).
 * KHÔNG là file test (không match testMatch pattern e2e/[glob].spec.ts) — chỉ import.
 *
 * Login pattern + SSO/BFF proxy route kế thừa từ W02 (TL-W02-E2E-008/009):
 * React bundle hardcode localhost:45410 (SSO) / localhost:45401 (BFF) khi
 * chạy remote-box mode — cần page.route() forward sang host thật.
 */

export const SSO_HOST = process.env.SSO_HOST || 'http://192.168.110.191:45410';
export const BFF_HOST = process.env.BFF_HOST || 'http://192.168.110.191:45401';

export const INV_CAT_TESTID = {
  materialGroup: {
    page: 'inv-cat.material-group.page',
    searchInput: 'inv-cat.material-group.search',
    filterStatus: 'inv-cat.material-group.filter-status',
    filterParent: 'inv-cat.material-group.filter-parent',
    btnCreate: 'inv-cat.material-group.btn-create',
    table: 'inv-cat.material-group.table',
    row: (id: string | number) => `inv-cat.material-group.row.${id}`,
    btnEdit: (id: string | number) => `inv-cat.material-group.btn-edit.${id}`,
    btnDelete: (id: string | number) => `inv-cat.material-group.btn-delete.${id}`,
    btnDetail: (id: string | number) => `inv-cat.material-group.btn-detail.${id}`,
    pagination: 'inv-cat.material-group.pagination',
    formDialog: 'inv-cat.material-group.form-dialog',
    fieldCode: 'inv-cat.material-group.field-code',
    fieldName: 'inv-cat.material-group.field-name',
    fieldParentId: 'inv-cat.material-group.field-parent-id',
    fieldDescription: 'inv-cat.material-group.field-description',
    fieldStatus: 'inv-cat.material-group.field-status',
    btnSubmit: 'inv-cat.material-group.btn-submit',
    btnCancel: 'inv-cat.material-group.btn-cancel',
    deleteDialog: 'inv-cat.material-group.delete-dialog',
    btnConfirmDelete: 'inv-cat.material-group.btn-confirm-delete',
    cascadeDialog: 'inv-cat.material-group.cascade-dialog',
    btnConfirmCascade: 'inv-cat.material-group.btn-confirm-cascade',
  },
  internalProduct: {
    page: 'inv-cat.internal-product.page',
    searchInput: 'inv-cat.internal-product.search',
    filterStatus: 'inv-cat.internal-product.filter-status',
    filterNature: 'inv-cat.internal-product.filter-nature',
    filterMaterialGroup: 'inv-cat.internal-product.filter-material-group',
    btnCreate: 'inv-cat.internal-product.btn-create',
    btnImport: 'inv-cat.internal-product.btn-import',
    btnExport: 'inv-cat.internal-product.btn-export',
    table: 'inv-cat.internal-product.table',
    row: (id: string | number) => `inv-cat.internal-product.row.${id}`,
    btnEdit: (id: string | number) => `inv-cat.internal-product.btn-edit.${id}`,
    btnDelete: (id: string | number) => `inv-cat.internal-product.btn-delete.${id}`,
    formPage: 'inv-cat.internal-product.form-page',
    detailPage: 'inv-cat.internal-product.detail-page',
    tabGeneral: 'inv-cat.internal-product.tab-general',
    tabSku: 'inv-cat.internal-product.tab-sku',
    tabConversion: 'inv-cat.internal-product.tab-conversion',
    tabAttachment: 'inv-cat.internal-product.tab-attachment',
    fieldCode: 'inv-cat.internal-product.field-code',
    fieldName: 'inv-cat.internal-product.field-name',
    fieldMainUnit: 'inv-cat.internal-product.field-main-unit',
    fieldMaterialGroup: 'inv-cat.internal-product.field-material-group',
    fieldNature: 'inv-cat.internal-product.field-nature',
    fieldBrand: 'inv-cat.internal-product.field-brand',
    fieldOrigin: 'inv-cat.internal-product.field-origin',
    fieldImageUrl: 'inv-cat.internal-product.field-image-url',
    btnSubmit: 'inv-cat.internal-product.btn-submit',
    btnCancel: 'inv-cat.internal-product.btn-cancel',
    btnAssignSku: 'inv-cat.internal-product.btn-assign-sku',
    btnAddConversion: 'inv-cat.internal-product.btn-add-conversion',
    btnUploadAttachment: 'inv-cat.internal-product.btn-upload-attachment',
  },
  import: {
    page: 'inv-cat.import.page',
    btnDownloadSample: 'inv-cat.import.btn-download-sample',
    fileUpload: 'inv-cat.import.file-upload',
    stepUpload: 'inv-cat.import.step-upload',
    stepVerify: 'inv-cat.import.step-verify',
    stepReview: 'inv-cat.import.step-review',
    stepCommit: 'inv-cat.import.step-commit',
    btnVerify: 'inv-cat.import.btn-verify',
    btnCommit: 'inv-cat.import.btn-commit',
    btnDownloadErrors: 'inv-cat.import.btn-download-errors',
    filterAll: 'inv-cat.import.filter-all',
    filterValid: 'inv-cat.import.filter-valid',
    filterError: 'inv-cat.import.filter-error',
    previewTable: 'inv-cat.import.preview-table',
  },
  export: {
    btnTrigger: 'inv-cat.export.btn-trigger',
    oversizeDialog: 'inv-cat.export.oversize-dialog',
    btnOversizeAck: 'inv-cat.export.btn-oversize-ack',
  },
} as const;

/** Cài route proxy cho SSO + BFF khi chạy remote-box (TL-W02-E2E-008/009). */
export async function installRemoteProxies(page: Page) {
  await page.route('http://localhost:45410/**', async (route) => {
    const url = route.request().url().replace('http://localhost:45410', SSO_HOST);
    const response = await page.request.fetch(url, {
      method: route.request().method(),
      headers: { ...route.request().headers(), host: new URL(SSO_HOST).host },
      data: route.request().postData() ?? undefined,
    });
    await route.fulfill({ response });
  });
  await page.route('http://localhost:45401/**', async (route) => {
    const url = route.request().url().replace('http://localhost:45401', BFF_HOST);
    const response = await page.request.fetch(url, {
      method: route.request().method(),
      headers: { ...route.request().headers(), host: new URL(BFF_HOST).host },
      data: route.request().postData() ?? undefined,
    });
    await route.fulfill({ response });
  });
}

export async function loginAs(page: Page, phone: string, password = 'Test@12345') {
  await installRemoteProxies(page);
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  // Luôn CHỦ ĐỘNG clear session cũ (cookie + localStorage) trước khi chờ form
  // đăng nhập — KHÔNG dựa vào kiểm tra page.url() ngay sau goto() để quyết
  // định có cần clear hay không, vì SPA redirect (nếu có session cũ, vd đổi
  // user giữa luồng TC-W03-E2E-R01/R02) xảy ra SAU khi React hydrate — không
  // đồng bộ với thời điểm goto() resolve, nên kiểm tra sớm cho kết quả sai
  // (race condition, xác nhận qua Playwright live run 2026-07-02). Auth token
  // của SSO stub lưu tại `localStorage['common-storage']` (Zustand persist),
  // không dùng cookie/IndexedDB — clear cookie + localStorage là đủ.
  await page.context().clearCookies();
  await page.evaluate(() => {
    try { localStorage.clear(); sessionStorage.clear(); } catch { /* noop */ }
  });
  await page.goto('/login');
  await page.waitForSelector('input[placeholder="Nhập số điện thoại"]', { timeout: 10000 });
  await page.locator('input[placeholder="Nhập số điện thoại"]').fill(phone);
  await page.locator('input[placeholder="Nhập mật khẩu"]').fill(password);
  const loginBtn = page.getByRole('button', { name: 'Đăng nhập' });
  await expect(loginBtn).toBeEnabled({ timeout: 5000 });
  await loginBtn.click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
}

// Seed tenant garage-a — cùng seed user với W01/W02 (TL-W02-E2E series).
export async function loginAsAccountant(page: Page) { await loginAs(page, '0810000002'); }
export async function loginAsOwner(page: Page) { await loginAs(page, '0810000001'); }

export async function gotoMaterialGroupList(page: Page) {
  await page.goto('/inventory-catalog/material-groups');
  await page.waitForLoadState('networkidle', { timeout: 15000 });
}

export async function gotoInternalProductList(page: Page) {
  await page.goto('/inventory-catalog/internal-products');
  await page.waitForLoadState('networkidle', { timeout: 15000 });
}

/** Random suffix để tránh trùng mã giữa các lần chạy (không hardcode seed cố định). */
export function uniqueSuffix() {
  return Date.now().toString(36).toUpperCase();
}

/**
 * Fallback locator theo LABEL text cho field text-input/textarea của form
 * Internal Product ("Tạo mã sản phẩm nội bộ") — dùng khi `data-testid`
 * field-level của `GeneralInfoSection.tsx` CHƯA được wire (xác nhận thật qua
 * Playwright live run 2026-07-02: `getByTestId(fieldCode|fieldName|fieldMainUnit|
 * fieldMaterialGroup|fieldNature|fieldBrand|fieldOrigin|fieldImageUrl)` đều
 * count=0 dù `INV_CAT_TESTID` đã khai báo — xem BUG-W03-103).
 * `Input`/`Textarea` share component có `FormLabel htmlFor={name}` +
 * `input/textarea id={name}` nên `getByLabel` resolve đúng, ổn định hơn
 * testid không tồn tại.
 */
export async function fillByLabel(page: Page, label: string, value: string) {
  await page.getByLabel(label, { exact: false }).first().fill(value);
}

/**
 * Fallback cho combobox (`SelectFilter`/`InputSelect`) của form Internal
 * Product — control tương tác thật KHÔNG có `id={name}` gắn với label (chỉ
 * `FormLabel htmlFor={name}` trỏ tới `name` không tồn tại trên DOM), nên
 * `getByLabel` không resolve được. Định vị bằng ancestor gần nhất chứa cả
 * label text lẫn `[role="combobox"]`.
 */
export async function selectComboboxByLabel(
  page: Page,
  label: string,
  optionMatcher?: string | RegExp,
) {
  const labelLocator = page.locator('label', { hasText: label }).first();
  const container = labelLocator.locator('xpath=ancestor::*[.//*[@role="combobox"]][1]');
  await container.getByRole('combobox').first().click();
  if (optionMatcher) {
    await page.getByRole('option', { name: optionMatcher }).first().click();
  } else {
    await page.locator('[role="option"]').first().click();
  }
}

/**
 * Fallback cho `InputSelect` (ĐVT chính / Nhóm vật tư-hàng hóa / Xuất xứ /
 * ĐVT quy đổi trong modal) — control render là `<input readOnly>` (role
 * "textbox", accessible name = placeholder, KHÔNG phải `role="combobox"`
 * như `SelectFilter`) — xác nhận qua Playwright live run 2026-07-02 (page
 * snapshot thật: `textbox "Chọn ĐVT chính"`, không phải `combobox`). Chỉ
 * dùng được khi field CHƯA có giá trị (placeholder còn hiển thị).
 */
export async function selectInputSelectByPlaceholder(
  page: Page,
  placeholder: string,
  optionMatcher?: string | RegExp,
) {
  await page.getByPlaceholder(placeholder, { exact: false }).first().click();
  if (optionMatcher) {
    await page.getByRole('option', { name: optionMatcher }).first().click();
  } else {
    await page.locator('[role="option"]').first().click();
  }
}

/**
 * Helper cho FEAT-CAT-PROD-IMPORT (Nhóm K) — build workbook `.xlsx` buffer
 * đúng 10-cột canonical (STT + 9 cột data, xem `internal-product/constants/import.ts`
 * `INTERNAL_PRODUCT_IMPORT_COLUMNS`) trực tiếp trong Node bằng package `xlsx`
 * (SheetJS, devDependency riêng của harness — KHÔNG phải production code).
 * Cột `mainUnitName`/`originName`/`materialGroupName` trong file phải là MÃ
 * (code) chứ không phải display-name — verify qua đọc source `helper/import.ts`
 * `formatDataImportInternalProductData` (map thẳng `mainUnitName` → `mainUnitCode`
 * không qua lookup riêng).
 */
import * as XLSXLib from 'xlsx';

export interface ImportRowInput {
  stt?: number | string;
  code?: string;
  name?: string;
  mainUnitName?: string; // thực chất là MÃ đơn vị tính (vd 'UNIT_CAI')
  brand?: string;
  originName?: string; // MÃ xuất xứ (vd 'US')
  natureLabel?: string; // 1 trong 4 label VN hợp lệ, hoặc chuỗi bất kỳ để test EC lỗi
  materialGroupName?: string;
  productSpec?: string;
  technicalSpec?: string;
}

const IMPORT_HEADER = [
  'STT',
  'Mã nội bộ *',
  'Tên sản phẩm *',
  'ĐVT * (Nhập mã ĐVT)',
  'Thương hiệu',
  'Xuất xứ',
  'Tính chất',
  'Nhóm vật tư/hàng hóa',
  'Quy cách sản phẩm',
  'Thông số kỹ thuật',
];

export function buildImportWorkbookBuffer(rows: ImportRowInput[]): Buffer {
  const aoa: (string | number | undefined)[][] = [IMPORT_HEADER];
  rows.forEach((r, idx) => {
    aoa.push([
      r.stt ?? idx + 1,
      r.code,
      r.name,
      r.mainUnitName,
      r.brand,
      r.originName,
      r.natureLabel,
      r.materialGroupName,
      r.productSpec,
      r.technicalSpec,
    ]);
  });
  const ws = XLSXLib.utils.aoa_to_sheet(aoa);
  const wb = XLSXLib.utils.book_new();
  XLSXLib.utils.book_append_sheet(wb, ws, 'Import Mã nội bộ');
  return XLSXLib.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

/** Upload buffer qua `<input type="file">` ẩn (ExcelUpload component). */
export async function uploadImportBuffer(page: Page, buffer: Buffer, filename = 'import-test.xlsx') {
  const input = page.locator('input[type="file"]');
  await input.setInputFiles({
    name: filename,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer,
  });
}

/**
 * Gia tri "DVT" trong file import khop theo TEN hien thi (khong phai code
 * UNIT_CAI dung cho GraphQL createInternalProduct truc tiep) - xac nhan qua
 * `w03-import-export-legacy.spec.ts` dong 11 ("import mainUnitCode field
 * thuc chat match theo TEN DVT, khong phai code UNIT_CAI"). Dung gia tri
 * lowercase 'cai' (khong dau, dung API test ground-truth y het).
 */
export const IMPORT_VALID_UNIT_CODE = 'cái';
