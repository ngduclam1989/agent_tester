import { test } from '@playwright/test';
import { loginAsAccountant, gotoInternalProductList } from '../../../specs/W03/e2e/_helpers';

test('probe unit dropdown options', async ({ page }) => {
  test.setTimeout(60000);
  await loginAsAccountant(page);
  await gotoInternalProductList(page);
  await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
  await page.waitForURL(/\/internal-products\/create/, { timeout: 15000 });
  await page.getByPlaceholder('Chọn ĐVT chính').click();
  await page.waitForTimeout(800);
  const options = await page.getByRole('option').allInnerTexts();
  console.log('UNIT OPTIONS:', JSON.stringify(options));
});
