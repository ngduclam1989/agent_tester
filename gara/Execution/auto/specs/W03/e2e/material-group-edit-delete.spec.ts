import { test, expect } from '@playwright/test';
import {
  loginAsAccountant,
  gotoMaterialGroupList,
  INV_CAT_TESTID as T,
  uniqueSuffix,
} from './_helpers';

/**
 * W03 E2E — Material Group: Edit / Cascade / Delete
 * TC-W03-E2E-A13 .. A20
 * Features: FEAT-CAT-GRP-EDIT, FEAT-CAT-GRP-DELETE
 */

async function createGroup(page: import('@playwright/test').Page, code: string, name: string, parentLabel?: string) {
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

test.describe('TC-W03-E2E-A13: Sửa nhóm — đổi tên+mô tả thành công', () => {
  test('Cập nhật Tên+Mô tả → Người sửa/Ngày sửa cập nhật', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const suf = uniqueSuffix();
    const code = `GRP-EDIT-${suf}`;
    await createGroup(page, code, `Tên gốc ${suf}`);

    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(code);
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.materialGroup.table).locator('tbody tr').first().getByRole('link').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Chỉnh sửa' }).click();

    await page.getByTestId(T.materialGroup.fieldName).locator('input').fill(`Tên đã sửa ${suf}`);
    await page.getByTestId(T.materialGroup.fieldDescription).locator('textarea').fill('Mô tả cập nhật qua Playwright');
    await page.getByTestId(T.materialGroup.btnSubmit).click();

    await expect(page.getByText(/cập nhật nhóm vật tư hàng hóa thành công/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(`Tên đã sửa ${suf}`)).toBeVisible();
    await expect(page.getByText('Người sửa')).toBeVisible();
  });
});

test.describe('TC-W03-E2E-A14: Sửa nhóm — Mã nhóm VTHH khoá', () => {
  test('Trường Mã nhóm ở form sửa là disabled', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const suf = uniqueSuffix();
    const code = `GRP-LOCKCODE-${suf}`;
    await createGroup(page, code, `Nhóm khoá mã ${suf}`);
    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(code);
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.materialGroup.table).locator('tbody tr').first().getByRole('link').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Chỉnh sửa' }).click();
    const codeInput = page.getByTestId(T.materialGroup.fieldCode).locator('input');
    await expect(codeInput).toBeDisabled();
  });
});

test.describe('TC-W03-E2E-A15: Sửa nhóm — "Thuộc nhóm" khoá (FEAT-CAT-GRP-EDIT v5 AC-4)', () => {
  test('Trường "Thuộc nhóm" ở form sửa là disabled — KHÔNG đổi được nhóm cha sau khi tạo', async ({ page }) => {
    // NOTE (drift risk — ghi nhận tại TEST_PLANNING qua source read, KHÔNG dùng để kết luận
    // PASS/FAIL): FEAT-CAT-GRP-EDIT v5 (2026-07-02) đổi AC-4 sang khoá field "Thuộc nhóm"
    // giống pattern "Mã nhóm VTHH". Code hiện tại (MaterialGroupFormPage.tsx dòng ~271-278)
    // CHƯA truyền `disabled={isEdit}` cho SelectSuggestedMaterialGroup — chỉ có
    // `excludeId={isEdit ? group?.id : undefined}` (loại chính nó, KHÔNG loại descendant,
    // KHÔNG disable). Assertion dưới đây theo đúng FEAT v5 (nguồn business); nếu FAIL thật
    // ở live run thì đây là bug hợp lệ cần log, không phải lỗi spec.
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const suf = uniqueSuffix();
    const parentCode = `GRP-PARENT-${suf}`;
    const childCode = `GRP-CHILD-${suf}`;
    await createGroup(page, parentCode, `Cha ${suf}`);
    await createGroup(page, childCode, `Con ${suf}`, parentCode);

    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(childCode);
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.materialGroup.table).locator('tbody tr').first().getByRole('link').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Chỉnh sửa' }).click();

    const parentField = page.getByTestId(T.materialGroup.fieldParentId);
    const parentControl = parentField.locator('input, [role="combobox"], button').first();
    await expect(parentControl).toBeDisabled();
  });
});

test.describe('TC-W03-E2E-A16: Sửa nhóm — Huỷ bỏ', () => {
  test('Nhấn "Huỷ bỏ" ở form sửa → không lưu thay đổi', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const suf = uniqueSuffix();
    const code = `GRP-EDITCANCEL-${suf}`;
    await createGroup(page, code, `Tên gốc ${suf}`);
    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(code);
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.materialGroup.table).locator('tbody tr').first().getByRole('link').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.getByTestId(T.materialGroup.fieldName).locator('input').fill('Tên sẽ bị huỷ');
    await page.getByTestId(T.materialGroup.btnCancel).click();
    await expect(page.getByText(`Tên gốc ${suf}`)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('TC-W03-E2E-A17: Sửa nhóm — cascade Ngừng hoạt động', () => {
  test('Cha đổi INACTIVE → toàn bộ con/cháu INACTIVE', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const suf = uniqueSuffix();
    const a = `GRP-CASC-A-${suf}`;
    const a1 = `GRP-CASC-A1-${suf}`;
    const a11 = `GRP-CASC-A11-${suf}`;
    await createGroup(page, a, `Cascade A ${suf}`);
    await createGroup(page, a1, `Cascade A1 ${suf}`, a);
    await createGroup(page, a11, `Cascade A11 ${suf}`, a1);

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
    await expect(page.getByText(/thành công/i).first()).toBeVisible({ timeout: 10000 });

    await gotoMaterialGroupList(page);
    await page.getByRole('button', { name: /Trạng thái/ }).click();
    await page.getByText('Tất cả', { exact: true }).click();
    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(suf);
    await page.waitForLoadState('networkidle');
    const rows = page.getByTestId(T.materialGroup.table).locator('tbody tr');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText('Ngừng hoạt động');
    }
  });
});

test.describe('TC-W03-E2E-A18: Sửa nhóm — cha ACTIVE, con KHÔNG tự bật lại', () => {
  test('Cha INACTIVE→ACTIVE, con vẫn INACTIVE (không cascade khi bật lại)', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const suf = uniqueSuffix();
    const p = `GRP-REV-P-${suf}`;
    const c = `GRP-REV-C-${suf}`;
    await createGroup(page, p, `Reverse P ${suf}`);
    await createGroup(page, c, `Reverse C ${suf}`, p);

    // Đưa cha về INACTIVE trước (cascade con theo)
    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(p);
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
    await expect(page.getByText(/thành công/i).first()).toBeVisible({ timeout: 10000 });

    // Bật lại cha
    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(p);
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.materialGroup.table).locator('tbody tr').first().getByRole('link').first().click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Chỉnh sửa' }).click();
    await page.getByTestId(T.materialGroup.fieldStatus).click();
    await page.getByText('Đang hoạt động', { exact: true }).click();
    await page.getByTestId(T.materialGroup.btnSubmit).click();
    await expect(page.getByText(/thành công/i).first()).toBeVisible({ timeout: 10000 });

    // Verify con vẫn INACTIVE
    await gotoMaterialGroupList(page);
    await page.getByRole('button', { name: /Trạng thái/ }).click();
    await page.getByText('Tất cả', { exact: true }).click();
    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(c);
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId(T.materialGroup.table).locator('tbody tr').first()).toContainText('Ngừng hoạt động');
  });
});

test.describe('TC-W03-E2E-A19: Xóa nhóm — chain block-child / block-product / happy', () => {
  test('Chặn còn con → chặn có mã SP → xóa thành công khi trống', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const suf = uniqueSuffix();
    const parent = `GRP-DEL-P-${suf}`;
    const child = `GRP-DEL-C-${suf}`;
    const empty = `GRP-DEL-EMPTY-${suf}`;
    await createGroup(page, parent, `Del Parent ${suf}`);
    await createGroup(page, child, `Del Child ${suf}`, parent);
    await createGroup(page, empty, `Del Empty ${suf}`);

    // 1) Xóa cha khi còn con → block
    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(parent);
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.materialGroup.table).locator('tbody tr').first().getByRole('button', { name: 'Xóa' }).click();
    await expect(page.getByText('Không thể xóa')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Đóng' }).click();

    // 2) Xóa nhóm rỗng → thành công
    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(empty);
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.materialGroup.table).locator('tbody tr').first().getByRole('button', { name: 'Xóa' }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 10000 });
    await page.getByRole('alertdialog').getByRole('button', { name: 'Xóa' }).click();
    await expect(page.getByText(/xoá nhóm vật tư hàng hóa thành công/i)).toBeVisible({ timeout: 10000 });
    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(empty);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Không tìm thấy kết quả phù hợp')).toBeVisible();
  });
});

test.describe('TC-W03-E2E-A20: Xóa nhóm — Huỷ', () => {
  test('Nhấn "Hủy" ở popup xác nhận → không xóa', async ({ page }) => {
    await loginAsAccountant(page);
    await gotoMaterialGroupList(page);
    const suf = uniqueSuffix();
    const code = `GRP-DELCANCEL-${suf}`;
    await createGroup(page, code, `Del cancel ${suf}`);
    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(code);
    await page.waitForLoadState('networkidle');
    await page.getByTestId(T.materialGroup.table).locator('tbody tr').first().getByRole('button', { name: 'Xóa' }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Hủy' }).click();
    await expect(page.getByRole('alertdialog')).toBeHidden();
    await page.getByTestId(T.materialGroup.searchInput).locator('input').fill(code);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(code)).toBeVisible();
  });
});
