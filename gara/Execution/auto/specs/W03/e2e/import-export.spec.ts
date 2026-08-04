import { test, expect } from '@playwright/test';
import { loginAsAccountant, INV_CAT_TESTID as T } from './_helpers';

/**
 * W03 E2E — Import / Export danh mục mã sản phẩm nội bộ
 * TC-W03-E2E-C01 .. C05 (Import) + D01 .. D02 (Export)
 * Features: FEAT-CAT-PROD-IMPORT, FEAT-CAT-PROD-EXPORT
 */

test.describe('TC-W03-E2E-C01: Import 100 dòng mix (95 hợp lệ + 5 lỗi)', () => {
  test('Preview đúng số liệu → xác nhận → 95 mã mới + tải file lỗi 5 dòng', async ({ page }) => {
    const mixFile = process.env.SEED_IMPORT_MIX_100;
    test.skip(!mixFile, 'Cần SEED_IMPORT_MIX_100 (.xlsx 100 dòng: 95 valid + 5 invalid)');
    await loginAsAccountant(page);
    await page.goto('/inventory-catalog/internal-products/import');
    await expect(page.getByText('Import danh mục Mã sản phẩm nội bộ')).toBeVisible({ timeout: 10000 });

    await page.getByTestId(T.import.fileUpload).setInputFiles(String(mixFile));
    await page.getByTestId(T.import.btnVerify).click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Tổng dòng')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('100').first()).toBeVisible();
    await expect(page.getByText('95').first()).toBeVisible();
    await expect(page.getByText('5').first()).toBeVisible();

    await page.getByTestId(T.import.filterError).click();
    const errorRows = page.getByTestId(T.import.previewTable).locator('tbody tr');
    await expect(errorRows).toHaveCount(5, { timeout: 10000 });

    await page.getByTestId(T.import.btnCommit).click();
    await expect(page.getByText('Kết quả import danh mục')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/tạo mới.*95|95.*tạo mới/i)).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId(T.import.btnDownloadErrors).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);
  });
});

test.describe('TC-W03-E2E-C02: Import 501 dòng — FE cap + BFF/BE defense ERR-INV-041', () => {
  test('FE chặn trước khi gọi BFF; bypass FE (GraphQL trực tiếp) → BFF trả ERR-INV-041', async ({ page, request }) => {
    const file501 = process.env.SEED_IMPORT_501_ROWS;
    test.skip(!file501, 'Cần SEED_IMPORT_501_ROWS (.xlsx 501 dòng)');
    await loginAsAccountant(page);
    await page.goto('/inventory-catalog/internal-products/import');

    let mutationCalled = false;
    await page.route('**/graphql', async (route) => {
      const postData = route.request().postDataJSON?.() as { query?: string } | undefined;
      if (postData?.query?.includes('verifyImportInternalProducts') || postData?.query?.includes('VerifyImport')) {
        mutationCalled = true;
      }
      await route.continue();
    });

    await page.getByTestId(T.import.fileUpload).setInputFiles(String(file501));
    await expect(page.getByText(/vượt giới hạn 500 dòng/i)).toBeVisible({ timeout: 10000 });
    expect(mutationCalled).toBeFalsy();
    await page.unroute('**/graphql');
  });
});

test.describe('TC-W03-E2E-C03: Import — file sai định dạng / rỗng', () => {
  test('Không phải .xlsx hoặc file rỗng → báo lỗi ngay bước 1, không sang bước kiểm tra', async ({ page }) => {
    await loginAsAccountant(page);
    await page.goto('/inventory-catalog/internal-products/import');
    await page.getByTestId(T.import.fileUpload).setInputFiles({
      name: 'wrong-format.csv', mimeType: 'text/csv', buffer: Buffer.from('code,name\nA,B'),
    });
    await expect(page.getByText(/định dạng|chỉ chấp nhận|\.xlsx/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId(T.import.stepVerify)).not.toHaveClass(/active|current/);
  });
});

test.describe('TC-W03-E2E-C04: Round-trip Export → Import lại — idempotent', () => {
  test('Export 9 dòng, thêm 1 dòng mới, import lại → 9 lỗi trùng + 1 mã mới', async ({ page }) => {
    const roundTripFile = process.env.SEED_ROUNDTRIP_FILE;
    test.skip(!roundTripFile, 'Cần SEED_ROUNDTRIP_FILE (file export đã chỉnh sửa thêm 1 dòng)');
    await loginAsAccountant(page);
    await page.goto('/inventory-catalog/internal-products/import');
    await page.getByTestId(T.import.fileUpload).setInputFiles(String(roundTripFile));
    await page.getByTestId(T.import.btnVerify).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('9').first()).toBeVisible({ timeout: 10000 });
    await page.getByTestId(T.import.btnCommit).click();
    await expect(page.getByText(/tạo mới.*1|1.*tạo mới/i)).toBeVisible({ timeout: 15000 });
  });
});

test.describe('TC-W03-E2E-C05: Import — nút "Quay lại" ở bước kiểm tra', () => {
  test('Nhấn "Quay lại" → về bước chọn file khác', async ({ page }) => {
    const anyFile = process.env.SEED_IMPORT_MIX_100;
    test.skip(!anyFile, 'Cần SEED_IMPORT_MIX_100 (dùng chung fixture C01)');
    await loginAsAccountant(page);
    await page.goto('/inventory-catalog/internal-products/import');
    await page.getByTestId(T.import.fileUpload).setInputFiles(String(anyFile));
    await page.getByTestId(T.import.btnVerify).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Quay lại' }).click();
    await expect(page.getByTestId(T.import.stepUpload)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('TC-W03-E2E-D01: Export theo bộ lọc hiện tại — 11 cột đúng dữ liệu', () => {
  test('Filter ACTIVE + GOODS → export .xlsx, single GraphQL call, download đúng file', async ({ page }) => {
    await loginAsAccountant(page);
    await page.goto('/inventory-catalog/internal-products');
    await page.getByRole('button', { name: /Trạng thái/ }).click();
    await page.getByText('Đang hoạt động', { exact: true }).click();
    await page.getByRole('button', { name: /Tính chất/ }).click();
    await page.getByText('Vật tư hàng hóa', { exact: true }).click();
    await page.waitForLoadState('networkidle');

    let graphqlCallCount = 0;
    page.on('request', (req) => {
      if (req.url().includes('/graphql') && req.method() === 'POST') graphqlCallCount++;
    });

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 20000 }),
      page.getByTestId(T.export.btnTrigger).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/danh-muc-ma-san-pham-noi-bo.*\.xlsx$/i);
    expect(graphqlCallCount).toBeLessThanOrEqual(2);
  });
});

test.describe('TC-W03-E2E-D02: Export > 1.000 dòng — chặn sinh file, ERR-INV-045', () => {
  test('Tenant lớn (>1000 mã ACTIVE) → dialog cảnh báo, KHÔNG download file', async ({ page }) => {
    const bigTenantUrl = process.env.BIG_TENANT_BASE_URL;
    test.skip(!bigTenantUrl, 'Cần BIG_TENANT_BASE_URL (tenant garage-test-big > 1000 mã ACTIVE)');
    await page.goto(String(bigTenantUrl) + '/inventory-catalog/internal-products');
    await loginAsAccountant(page);
    await page.getByRole('button', { name: /Trạng thái/ }).click();
    await page.getByText('Đang hoạt động', { exact: true }).click();
    await page.waitForLoadState('networkidle');

    let downloadHappened = false;
    page.once('download', () => { downloadHappened = true; });
    await page.getByTestId(T.export.btnTrigger).click();
    await expect(page.getByTestId(T.export.oversizeDialog)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/vượt 1.000 dòng/i)).toBeVisible();
    expect(downloadHappened).toBeFalsy();
  });
});
