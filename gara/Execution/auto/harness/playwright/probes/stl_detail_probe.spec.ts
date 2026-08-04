import { test } from '@playwright/test';

async function loginAsAccountant(page: any) {
  await page.goto('/login');
  await page.getByLabel('Số điện thoại').fill('0810000002');
  await page.getByLabel('Mật khẩu').fill('Test@12345');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

test('inspect settlement detail page', async ({ page }) => {
  await loginAsAccountant(page);
  
  await page.goto('/settlement-voucher/SET-20260611-00001');
  await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  console.log('url:', page.url());
  const h1 = await page.locator('h1').first().textContent().catch(() => '');
  console.log('h1:', h1);
  const tabs = await page.locator('[role="tab"]').allTextContents().catch(() => []);
  console.log('tabs:', JSON.stringify(tabs));
  const btns = await page.locator('button').allTextContents().catch(() => []);
  console.log('buttons:', JSON.stringify(btns));
  const allText = await page.locator('body').textContent().catch(() => '');
  console.log('body text slice:', allText.slice(0, 500));
  
  await page.screenshot({ path: '../../evidence/W01/e2e/settlement-detail-probe.png', timeout: 5000 });
});
