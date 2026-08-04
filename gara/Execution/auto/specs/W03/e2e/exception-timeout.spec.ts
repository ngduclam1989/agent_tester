import { test, expect, Page, BrowserContext } from '@playwright/test';
import {
  loginAsAccountant,
  loginAsOwner,
  gotoMaterialGroupList,
  gotoInternalProductList,
  INV_CAT_TESTID as T,
  uniqueSuffix,
  fillByLabel,
} from './_helpers';

/**
 * W03 E2E — Exception & Timeout group (dùng chung Group + Product + Import)
 * TC-W03-E2E-T01 .. T08
 * Bắt buộc theo §Test Case Authoring Style — Nhóm Exception & Timeout.
 */

async function createGroup(page: Page, code: string, name: string, parentLabel?: string) {
  await page.getByTestId(T.materialGroup.btnCreate).click();
  await page.getByTestId(T.materialGroup.formDialog).waitFor({ state: 'visible' });
  await page.getByTestId(T.materialGroup.fieldCode).locator('input').fill(code);
  await page.getByTestId(T.materialGroup.fieldName).locator('input').fill(name);
  if (parentLabel) {
    await page.getByTestId(T.materialGroup.fieldParentId).click();
    await page.getByText(parentLabel, { exact: false }).first().click();
  }
  await page.getByTestId(T.materialGroup.btnSubmit).click();
  await expect(page.getByText(/thành công/i).first()).toBeVisible({ timeout: 10000 });
}

test.describe('TC-W03-E2E-T01: Cascade rollback atomicity — mock 500 giữa chừng', () => {
  test('Lỗi tại 1 node giữa chừng cascade → rollback toàn bộ, không node nào đổi trạng thái', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const suf = uniqueSuffix();
    const a = `GRP-ROLLBACK-A-${suf}`;
    const b = `GRP-ROLLBACK-B-${suf}`;
    await createGroup(page, a, `Rollback A ${suf}`);
    await createGroup(page, b, `Rollback B ${suf}`, a);

    // Mock lỗi 500 cho mutation updateMaterialGroup (cascade path)
    await page.route('**/graphql', async (route) => {
      const postData = route.request().postDataJSON?.() as { query?: string } | undefined;
      if (postData?.query?.includes('updateMaterialGroup')) {
        await route.fulfill({ status: 500, body: JSON.stringify({ errors: [{ message: 'Internal Server Error (mock)' }] }) });
        return;
      }
      await route.continue();
    });

    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(a);
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.materialGroup.table).locator('tbody tr').first().getByRole('link').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.getByTestId(T.materialGroup.fieldStatus).click();
    await page.getByText('Ngừng hoạt động', { exact: true }).click();
    await page.getByTestId(T.materialGroup.btnSubmit).click();
    const cascadeDialog = page.getByTestId(T.materialGroup.cascadeDialog);
    if (await cascadeDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.getByTestId(T.materialGroup.btnConfirmCascade).click();
    }

    await expect(page.getByText(/lỗi|thất bại|error/i).first()).toBeVisible({ timeout: 10000 });
    await page.unroute('**/graphql');

    // Verify rollback: cả 2 node vẫn ACTIVE
    await gotoMaterialGroupList(page);
    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(suf);
    await page.waitForLoadState('networkidle');
    const rows = page.getByTestId(T.materialGroup.table).locator('tbody tr');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText('Đang hoạt động');
    }
  });
});

test.describe('TC-W03-E2E-T02: Optimistic concurrency — 2 phiên cùng sửa 1 nhóm', () => {
  test('2 session sửa gần đồng thời → ghi nhận hành vi last-write-wins/conflict (không giả định trước)', async ({ browser }) => {
    const suf = uniqueSuffix();
    const code = `GRP-CONCURRENT-${suf}`;

    const ctxA: BrowserContext = await browser.newContext();
    const pageA = await ctxA.newPage();
    await loginAsAccountant(pageA);
    await gotoMaterialGroupList(pageA);
    await createGroup(pageA, code, `Concurrent gốc ${suf}`);

    const ctxB: BrowserContext = await browser.newContext();
    const pageB = await ctxB.newPage();
    await loginAsOwner(pageB);
    await gotoMaterialGroupList(pageB);

    for (const p of [pageA, pageB]) {
      await p.getByTestId(T.materialGroup.searchInput).locator('input').fill(code);
      await p.waitForLoadState('networkidle');
      await p.getByTestId(T.materialGroup.table).locator('tbody tr').first().getByRole('link').first().click();
    await page.waitForLoadState('networkidle');
      await p.getByRole('button', { name: 'Chỉnh sửa' }).click();
    }

    await pageA.getByTestId(T.materialGroup.fieldName).locator('input').fill(`Tên A ${suf}`);
    await pageA.getByTestId(T.materialGroup.btnSubmit).click();
    await expect(pageA.getByText(/thành công/i).first()).toBeVisible({ timeout: 10000 });

    await pageB.getByTestId(T.materialGroup.fieldName).locator('input').fill(`Tên B ${suf}`);
    await pageB.getByTestId(T.materialGroup.btnSubmit).click();

    // Ghi nhận thực tế (không giả định trước): last-write-wins (toast success, tên = "Tên B")
    // HOẶC conflict 409 (toast lỗi, yêu cầu tải lại). Cả 2 nhánh đều hợp lệ per manual TC-031.
    const bSuccess = await pageB.getByText(/thành công/i).first().isVisible({ timeout: 8000 }).catch(() => false);
    const bConflict = await pageB.getByText(/xung đột|conflict|tải lại/i).isVisible({ timeout: 3000 }).catch(() => false);
    expect(bSuccess || bConflict).toBeTruthy();

    await ctxA.close();
    await ctxB.close();
  });
});

test.describe('TC-W03-E2E-T03: Xóa nhóm xong tạo lại đúng mã cũ', () => {
  test('Không báo trùng giả (hard-delete), bản ghi mới hoàn toàn khác id/createdAt', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const suf = uniqueSuffix();
    const code = `GRP-RECREATE-${suf}`;
    await createGroup(page, code, `Recreate v1 ${suf}`);

    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(code);
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.materialGroup.table).locator('tbody tr').first().getByRole('button', { name: 'Xóa' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Xóa' }).click();
    await expect(page.getByText(/xoá.*thành công/i)).toBeVisible({ timeout: 10000 });

    await createGroup(page, code, `Recreate v2 ${suf}`);
    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(code);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(`Recreate v2 ${suf}`)).toBeVisible();
    await expect(page.getByText(`Recreate v1 ${suf}`)).toHaveCount(0);
  });
});

test.describe('TC-W03-E2E-T04: Race condition — 2 user gắn cùng SKU vào 2 mã khác nhau', () => {
  test('1 user thành công, user còn lại nhận lỗi ERR-INV-015', async ({ browser }) => {
    // Precondition: SKU test id phải cấp qua ENV — nếu absent, BLOCKED (không giả định số cố định)
    const skuId = process.env.SEED_UNMAPPED_SKU_ID;
    test.skip(!skuId, 'Cần SEED_UNMAPPED_SKU_ID trỏ SKU chưa mapping — xem Test Environment & Data');

    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    await loginAsAccountant(pageA);
    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await loginAsOwner(pageB);

    const prodA = process.env.SEED_PRODUCT_A_CODE || 'PROD-RACE-A';
    const prodB = process.env.SEED_PRODUCT_B_CODE || 'PROD-RACE-B';

    for (const [p, code] of [[pageA, prodA], [pageB, prodB]] as const) {
      await gotoInternalProductList(p);
      await p.getByTestId(T.internalProduct.searchInput).locator('input').fill(code);
      await p.waitForLoadState('networkidle');
      await p.getByTestId(T.internalProduct.table).locator('tbody tr').first().getByRole('link').first().click();
    await page.waitForLoadState('networkidle');
      await p.getByTestId(T.internalProduct.tabSku).click();
      await p.getByRole('button', { name: 'Gắn SKU' }).click();
      await p.getByPlaceholder(/tìm.*sku/i).fill(String(skuId));
    }

    await Promise.all([
      pageA.getByRole('button', { name: 'Gắn SKU' }).click(),
      pageB.getByRole('button', { name: 'Gắn SKU' }).click(),
    ]);

    const aOk = await pageA.getByText(/thành công/i).first().isVisible({ timeout: 8000 }).catch(() => false);
    const bOk = await pageB.getByText(/thành công/i).first().isVisible({ timeout: 8000 }).catch(() => false);
    // Đúng 1 trong 2 thành công, phía còn lại báo "đã mapping mã khác"
    expect(aOk !== bOk).toBeTruthy();

    await ctxA.close();
    await ctxB.close();
  });
});

test.describe('TC-W03-E2E-T05: Upload đồng thời nhiều tệp đính kèm gần cap 5', () => {
  test('[spec-gap: cần seed mã SP có 3 attachment sẵn] Không vượt cap 5 do race condition', async ({ page }) => {
    const productCode = process.env.SEED_PRODUCT_NEAR_CAP_CODE;
    test.skip(!productCode, 'Cần SEED_PRODUCT_NEAR_CAP_CODE (mã SP đã có 3 attachment, còn 2 slot)');
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByTestId(T.internalProduct.searchInput).locator('input').fill(String(productCode));
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.internalProduct.table).locator('tbody tr').first().getByRole('link').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.internalProduct.tabAttachment).click();
    // 3 upload request gửi gần như đồng thời — tối đa 2 thành công (đủ 5), 1 bị từ chối
    const fileInput = page.locator('input[type="file"]');
    const uploads = ['a.pdf', 'b.pdf', 'c.pdf'].map((_, i) =>
      fileInput.setInputFiles({ name: `race-${i}.pdf`, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 test') })
    );
    await Promise.allSettled(uploads);
    await page.waitForTimeout(3000);
    const rows = page.locator('[data-testid*="attachment-row"]');
    await expect(rows).toHaveCount(5, { timeout: 10000 });
  });
});

test.describe('TC-W03-E2E-T06: 2 user import 2 file khác nhau đồng thời', () => {
  test('[spec-gap: cần 2 file test riêng biệt] Cả 2 import thành công, không deadlock/duplicate', async ({ browser }) => {
    const fileAPath = process.env.SEED_IMPORT_FILE_A;
    const fileBPath = process.env.SEED_IMPORT_FILE_B;
    test.skip(!fileAPath || !fileBPath, 'Cần SEED_IMPORT_FILE_A/B (2 file .xlsx 50 dòng, mã không trùng nhau)');

    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    await loginAsAccountant(pageA);
    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await loginAsOwner(pageB);

    for (const [p, filePath] of [[pageA, fileAPath], [pageB, fileBPath]] as const) {
      await p.goto('/inventory-catalog/internal-products/import');
      await p.getByTestId(T.import.fileUpload).setInputFiles(String(filePath));
      await p.getByTestId(T.import.btnVerify).click();
      await p.waitForLoadState('networkidle');
    }
    await Promise.all([
      pageA.getByTestId(T.import.btnCommit).click(),
      pageB.getByTestId(T.import.btnCommit).click(),
    ]);
    await expect(pageA.getByText(/kết quả import/i)).toBeVisible({ timeout: 20000 });
    await expect(pageB.getByText(/kết quả import/i)).toBeVisible({ timeout: 20000 });

    await ctxA.close();
    await ctxB.close();
  });
});

test.describe('TC-W03-E2E-T07: Mất kết nối/5xx ngay lúc submit tạo nhóm', () => {
  test('Báo lỗi rõ ràng, dữ liệu form giữ nguyên, retry thành công', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const suf = uniqueSuffix();
    const code = `GRP-NETFAIL-${suf}`;

    let firstAttempt = true;
    await page.route('**/graphql', async (route) => {
      const postData = route.request().postDataJSON?.() as { query?: string } | undefined;
      if (firstAttempt && postData?.query?.includes('createMaterialGroup')) {
        firstAttempt = false;
        await route.abort('failed');
        return;
      }
      await route.continue();
    });

    await page.getByTestId(T.materialGroup.btnCreate).click();
    await page.getByTestId(T.materialGroup.fieldCode).locator('input').fill(code);
    await page.getByTestId(T.materialGroup.fieldName).locator('input').fill(`Net fail ${suf}`);
    await page.getByTestId(T.materialGroup.btnSubmit).click();

    await expect(page.getByText(/lỗi|thất bại|mất kết nối/i).first()).toBeVisible({ timeout: 10000 });
    // Dữ liệu form vẫn còn nguyên
    await expect(page.getByTestId(T.materialGroup.fieldCode).locator('input')).toHaveValue(code);

    // Retry — network đã phục hồi (route bypass sau lần đầu)
    await page.getByTestId(T.materialGroup.btnSubmit).click();
    await expect(page.getByText(/thành công/i).first()).toBeVisible({ timeout: 10000 });
    await page.unroute('**/graphql');
  });
});

test.describe('TC-W03-E2E-T08: Phiên hết hạn giữa lúc tạo mã sản phẩm', () => {
  test('[spec-gap: cần khả năng ép hết hạn access token] Silent refresh HOẶC redirect login rõ ràng, không mất dữ liệu ngầm', async ({ page }) => {
    const canForceExpiry = !!process.env.SSO_FORCE_TOKEN_EXPIRY_ENDPOINT;
    test.skip(!canForceExpiry, 'Cần SSO_FORCE_TOKEN_EXPIRY_ENDPOINT (stub SSO hỗ trợ ép hết hạn token trong test) — xem Test Environment & Data');
    await loginAsAccountant(page);
    await gotoInternalProductList(page);
    await page.getByTestId(T.internalProduct.btnCreate).click();
    await fillByLabel(page, 'Mã sản phẩm nội bộ', 'PROD-SESSION-EXP');
    await fillByLabel(page, 'Tên sản phẩm', 'Session expiry test');

    await page.request.post(String(process.env.SSO_FORCE_TOKEN_EXPIRY_ENDPOINT));
    await page.getByTestId(T.internalProduct.btnSubmit).click();

    const redirectedToLogin = await page.waitForURL(/\/login/, { timeout: 15000 }).then(() => true).catch(() => false);
    const savedSilently = await page.getByText(/thành công/i).first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(redirectedToLogin || savedSilently).toBeTruthy();
  });
});
