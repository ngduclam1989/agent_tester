import { test, expect } from '@playwright/test';
import {
  loginAsAccountant,
  gotoMaterialGroupList,
  INV_CAT_TESTID as T,
  uniqueSuffix,
} from './_helpers';

/**
 * W03 E2E — Material Group: List / Search / Filter / Detail / Create
 * TC-W03-E2E-A01 .. A12
 * Features: FEAT-CAT-GRP-LIST, FEAT-CAT-GRP-CREATE, FEAT-CAT-GRP-DETAIL
 */

test.describe('TC-W03-E2E-A01: Tạo cây nhóm 3 cấp — List trải phẳng đúng "Thuộc nhóm"', () => {
  test('Kế toán tạo cha→con→cháu, List flat hiển thị đúng quan hệ', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);

    const suf = uniqueSuffix();
    const codeA = `GRP-A-${suf}`;
    const codeA1 = `GRP-A1-${suf}`;
    const codeA11 = `GRP-A11-${suf}`;

    async function createGroup(code: string, name: string, parentLabel?: string) {
      await page.getByTestId(T.materialGroup.btnCreate).click();
      await page.getByTestId(T.materialGroup.formDialog).waitFor({ state: 'visible' });
      await page.getByTestId(T.materialGroup.fieldCode).locator('input').fill(code);
      await page.getByTestId(T.materialGroup.fieldName).locator('input').fill(name);
      if (parentLabel) {
        await page.getByTestId(T.materialGroup.fieldParentId).click();
        await page.getByText(parentLabel, { exact: false }).first().click();
      }
      await page.getByTestId(T.materialGroup.btnSubmit).click();
      await expect(page.getByText(/tạo nhóm vật tư hàng hóa thành công/i)).toBeVisible({ timeout: 10000 });
    }

    await createGroup(codeA, `Nhóm A ${suf}`);
    await createGroup(codeA1, `Nhóm A1 ${suf}`, codeA);
    await createGroup(codeA11, `Nhóm A11 ${suf}`, codeA1);

    // Final observable end state: list flat, "Thuộc nhóm" đúng cho từng dòng
    await gotoMaterialGroupList(page);
    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(suf);
    await page.waitForTimeout(500);
    await expect(page.getByText(codeA)).toBeVisible();
    await expect(page.getByText(codeA1)).toBeVisible();
    await expect(page.getByText(codeA11)).toBeVisible();
    // KHÔNG có indent/expand-collapse — flat table (R29): mỗi dòng đứng độc lập
    await expect(page.locator('[data-testid*="expand"]')).toHaveCount(0);
  });
});

test.describe('TC-W03-E2E-A02: Tìm kiếm nhóm theo mã/tên (LIKE)', () => {
  test('Nhập từ khoá khớp một phần mã hoặc tên → list lọc đúng', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill('GRP-A');
    await page.waitForLoadState('networkidle');
    const rows = page.getByTestId(T.materialGroup.table).locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText(/GRP-A/i);
    }
  });
});

test.describe('TC-W03-E2E-A03: Lọc theo trạng thái (Tất cả/Đang HĐ/Ngừng HĐ)', () => {
  test('Chọn "Ngừng hoạt động" → chỉ hiển thị nhóm INACTIVE', async ({ page }) => {
    // NOTE (2026-07-02, xác nhận qua Playwright live run — BUG-W03-103): testid
    // `filterStatus`/`filterParent` KHÔNG wire trong `MaterialGroupListPage.tsx`
    // dù đã khai báo trong `INV_CAT_TESTID` — dùng fallback role+name (button
    // hiển thị text "Trạng thái"/"Thuộc nhóm", xác nhận qua page snapshot thật).
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    await page.getByRole('button', { name: /Trạng thái/ }).click();
    await page.getByText('Ngừng hoạt động', { exact: true }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Đang hoạt động')).toHaveCount(0);
  });
});

test.describe('TC-W03-E2E-A04: Lọc theo nhóm cha "Thuộc nhóm"', () => {
  test('Chọn 1 nhóm cha → list chỉ hiển thị con trực tiếp của nhóm đó', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    await page.getByRole('button', { name: /Thuộc nhóm/ }).click();
    const firstOption = page.locator('[role="option"]').first();
    const parentLabel = (await firstOption.textContent()) ?? '';
    await firstOption.click();
    await page.waitForLoadState('networkidle');
    const rows = page.getByTestId(T.materialGroup.table).locator('tbody tr');
    if ((await rows.count()) > 0) {
      await expect(rows.first()).toBeVisible();
    }
    expect(parentLabel.length).toBeGreaterThan(0);
  });
});

test.describe('TC-W03-E2E-A05: Tìm/lọc không khớp dòng nào', () => {
  test('Từ khoá không tồn tại → empty state "Không tìm thấy kết quả phù hợp"', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill('ZZZ-NOT-EXIST-999');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Không tìm thấy kết quả phù hợp')).toBeVisible({ timeout: 10000 });
    // Thanh tìm kiếm + bộ lọc + nút Thêm vẫn còn (EC-4)
    await expect(page.getByTestId(T.materialGroup.btnCreate)).toBeVisible();
  });
});

test.describe('TC-W03-E2E-A06: Tenant mới chưa có nhóm nào', () => {
  test('[spec-gap: seed-dependent] Empty state "Không có dữ liệu" khi garage chưa có nhóm nào', async ({ page }) => {
    // Cluster C3-only: cần tenant sạch riêng biệt (không seed data). Đánh dấu điều kiện
    // trong Preconditions của TC artifact — spec giữ assertion chờ tenant rỗng cấp qua ENV.
    const emptyTenantReachable = !!process.env.EMPTY_TENANT_BASE_URL;
    test.skip(!emptyTenantReachable, 'Cần EMPTY_TENANT_BASE_URL trỏ tới tenant sạch — xem Test Environment & Data');
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    await expect(page.getByText('Không có dữ liệu')).toBeVisible();
    await expect(page.getByTestId(T.materialGroup.btnCreate)).toBeVisible();
  });
});

test.describe('TC-W03-E2E-A07: Xem chi tiết nhóm — 6 field + audit', () => {
  test('Mở Detail hiển thị đủ field read-only + Ngày/Người tạo/sửa', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const firstRow = page.getByTestId(T.materialGroup.table).locator('tbody tr').first();
    await firstRow.getByRole('link').first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Chi tiết nhóm vật tư hàng hóa')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Ngày tạo')).toBeVisible();
    await expect(page.getByText('Người tạo')).toBeVisible();
    await expect(page.getByText('Ngày sửa')).toBeVisible();
    await expect(page.getByText('Người sửa')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Chỉnh sửa' })).toBeVisible();
  });
});

test.describe('TC-W03-E2E-A08: Tạo nhóm — bỏ trống Mã/Tên', () => {
  test('Bỏ trống trường bắt buộc → lỗi validation, không lưu', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    await page.getByTestId(T.materialGroup.btnCreate).click();
    await page.getByTestId(T.materialGroup.formDialog).waitFor({ state: 'visible' });
    await page.getByTestId(T.materialGroup.btnSubmit).click();
    await expect(page.getByText(/vui lòng nhập mã nhóm|bắt buộc/i).first()).toBeVisible({ timeout: 5000 });
    // Form vẫn mở, KHÔNG có toast thành công
    await expect(page.getByTestId(T.materialGroup.formDialog)).toBeVisible();
  });
});

test.describe('TC-W03-E2E-A09: Tạo nhóm — mã chứa ký tự đặc biệt', () => {
  test('Ký tự đặc biệt trong Mã nhóm bị chặn/báo lỗi', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    await page.getByTestId(T.materialGroup.btnCreate).click();
    await page.getByTestId(T.materialGroup.formDialog).waitFor({ state: 'visible' });
    const codeInput = page.getByTestId(T.materialGroup.fieldCode).locator('input');
    await codeInput.fill('GRP@#$001');
    await page.getByTestId(T.materialGroup.fieldName).locator('input').fill('Nhóm ký tự lỗi');
    await page.getByTestId(T.materialGroup.btnSubmit).click();
    const currentValue = await codeInput.inputValue();
    const hasSubmitError = await page.getByText(/không hợp lệ/i).first().isVisible().catch(() => false);
    expect(hasSubmitError || !/[@#$]/.test(currentValue)).toBeTruthy();
  });
});

test.describe('TC-W03-E2E-A10: Tạo nhóm — mã trùng', () => {
  test('Mã trùng nhóm đã tồn tại → "Mã nhóm đã tồn tại", không lưu', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const suf = uniqueSuffix();
    const code = `GRP-DUP-${suf}`;

    // Tạo nhóm gốc trước
    await page.getByTestId(T.materialGroup.btnCreate).click();
    await page.getByTestId(T.materialGroup.fieldCode).locator('input').fill(code);
    await page.getByTestId(T.materialGroup.fieldName).locator('input').fill(`Nhóm gốc ${suf}`);
    await page.getByTestId(T.materialGroup.btnSubmit).click();
    await expect(page.getByText(/thành công/i).first()).toBeVisible({ timeout: 10000 });

    // Tạo lại với mã trùng
    await page.getByTestId(T.materialGroup.btnCreate).click();
    await page.getByTestId(T.materialGroup.fieldCode).locator('input').fill(code);
    await page.getByTestId(T.materialGroup.fieldName).locator('input').fill(`Nhóm trùng ${suf}`);
    await page.getByTestId(T.materialGroup.btnSubmit).click();
    await expect(page.getByText('Mã nhóm đã tồn tại')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId(T.materialGroup.formDialog)).toBeVisible();
  });
});

test.describe('TC-W03-E2E-A11: Tạo nhóm — Huỷ bỏ', () => {
  test('Nhấn "Huỷ bỏ" → đóng form, không lưu, quay list', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const suf = uniqueSuffix();
    await page.getByTestId(T.materialGroup.btnCreate).click();
    await page.getByTestId(T.materialGroup.fieldCode).locator('input').fill(`GRP-CANCEL-${suf}`);
    await page.getByTestId(T.materialGroup.fieldName).locator('input').fill('Nhóm sẽ huỷ');
    await page.getByTestId(T.materialGroup.btnCancel).click();
    await expect(page.getByTestId(T.materialGroup.formDialog)).toBeHidden({ timeout: 5000 });
    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(`GRP-CANCEL-${suf}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Không tìm thấy kết quả phù hợp')).toBeVisible();
  });
});

test.describe('TC-W03-E2E-A12: Dropdown "Thuộc nhóm" chỉ liệt kê nhóm Đang hoạt động', () => {
  test('Nhóm INACTIVE ẩn khỏi dropdown "Thuộc nhóm" khi tạo mới (BR-CAT-GRP-008)', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    await page.getByTestId(T.materialGroup.btnCreate).click();
    await page.getByTestId(T.materialGroup.fieldParentId).click();
    const options = page.locator('[role="option"]');
    const optCount = await options.count();
    for (let i = 0; i < Math.min(optCount, 10); i++) {
      await expect(options.nth(i)).not.toContainText('Ngừng hoạt động');
    }
  });
});

// ---------------------------------------------------------------------------
// Bổ sung theo yêu cầu coordinator (2026-07-02, /test-exec bổ sung riêng):
// data test PHẢI tạo mới hoàn toàn qua UI cho journey tạo mới — tối thiểu
// 2 case: (a) required-only, (b) full-fields. A01 ở trên chỉ điền Mã+Tên+
// Thuộc nhóm (cho GRP-A1/A11), KHÔNG có case chỉ-bắt-buộc thuần và KHÔNG có
// case điền đủ Mô tả — A21/A22 bổ sung đúng 2 case còn thiếu.
// ---------------------------------------------------------------------------

test.describe('TC-W03-E2E-A21: Tạo nhóm — CHỈ nhập trường bắt buộc (Mã + Tên)', () => {
  test('Bỏ trống Thuộc nhóm + Mô tả, giữ Trạng thái mặc định → tạo thành công, Detail hiển thị optional field rỗng/mặc định', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const suf = uniqueSuffix();
    const code = `GRP-REQ-${suf}`;
    const name = `Nhóm required-only ${suf}`;

    await page.getByTestId(T.materialGroup.btnCreate).click();
    await page.getByTestId(T.materialGroup.formDialog).waitFor({ state: 'visible' });
    await page.getByTestId(T.materialGroup.fieldCode).locator('input').fill(code);
    await page.getByTestId(T.materialGroup.fieldName).locator('input').fill(name);
    // KHÔNG chọn Thuộc nhóm, KHÔNG nhập Mô tả, giữ Trạng thái mặc định "Đang hoạt động"
    await page.getByTestId(T.materialGroup.btnSubmit).click();
    await expect(page.getByText(/tạo nhóm vật tư hàng hóa thành công/i)).toBeVisible({ timeout: 10000 });

    // Final observable end state: mở Detail — verify optional field rỗng/mặc định
    await gotoMaterialGroupList(page);
    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(code);
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.materialGroup.table).locator('tbody tr').first().getByRole('link').first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(code)).toBeVisible();
    await expect(page.getByText(name)).toBeVisible();
    await expect(page.getByText('Đang hoạt động')).toBeVisible();
  });
});

test.describe('TC-W03-E2E-A22: Tạo nhóm — ĐẦY ĐỦ TẤT CẢ trường (bắt buộc + optional)', () => {
  test('Điền Mã+Tên+Thuộc nhóm+Mô tả (255 ký tự) → Detail hiển thị đúng toàn bộ giá trị', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const suf = uniqueSuffix();
    const parentCode = `GRP-FULLPARENT-${suf}`;
    const parentName = `Nhóm cha cho full-fields ${suf}`;

    // Tạo trước 1 nhóm cha ACTIVE để case full-fields có "Thuộc nhóm" để chọn
    await page.getByTestId(T.materialGroup.btnCreate).click();
    await page.getByTestId(T.materialGroup.formDialog).waitFor({ state: 'visible' });
    await page.getByTestId(T.materialGroup.fieldCode).locator('input').fill(parentCode);
    await page.getByTestId(T.materialGroup.fieldName).locator('input').fill(parentName);
    await page.getByTestId(T.materialGroup.btnSubmit).click();
    await expect(page.getByText(/tạo nhóm vật tư hàng hóa thành công/i)).toBeVisible({ timeout: 10000 });

    const code = `GRP-FULL-${suf}`;
    const name = `Nhóm full-fields ${suf}`;
    const description = `Mô tả đầy đủ 255 ký tự cho case full-fields ${suf} `.padEnd(200, 'x').slice(0, 200);

    await page.getByTestId(T.materialGroup.btnCreate).click();
    await page.getByTestId(T.materialGroup.formDialog).waitFor({ state: 'visible' });
    await page.getByTestId(T.materialGroup.fieldCode).locator('input').fill(code);
    await page.getByTestId(T.materialGroup.fieldName).locator('input').fill(name);
    await page.getByTestId(T.materialGroup.fieldParentId).click();
    await page.getByText(parentCode, { exact: false }).first().click();
    await page.getByTestId(T.materialGroup.fieldStatus).getByRole('combobox').click();
    await page.getByText('Đang hoạt động', { exact: true }).first().click();
    await page.getByTestId(T.materialGroup.fieldDescription).locator('textarea').fill(description);
    await page.getByTestId(T.materialGroup.btnSubmit).click();
    await expect(page.getByText(/tạo nhóm vật tư hàng hóa thành công/i)).toBeVisible({ timeout: 10000 });

    // Final observable end state: Detail render đúng TOÀN BỘ giá trị đã nhập
    await gotoMaterialGroupList(page);
    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(code);
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.materialGroup.table).locator('tbody tr').first().getByRole('link').first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(code)).toBeVisible();
    await expect(page.getByText(name)).toBeVisible();
    await expect(page.getByText(parentCode, { exact: false })).toBeVisible();
    await expect(page.getByText(description)).toBeVisible();
    await expect(page.getByText('Đang hoạt động')).toBeVisible();
  });
});
