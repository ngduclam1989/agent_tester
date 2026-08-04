import { test } from '@playwright/test';

async function loginAsAccountant(page: any) {
  await page.goto('/login');
  await page.getByLabel('Số điện thoại').fill('0810000002');
  await page.getByLabel('Mật khẩu').fill('Test@12345');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

test('capture BFF request/response for settlement detail', async ({ page }) => {
  await loginAsAccountant(page);
  
  const gqlRequests: any[] = [];
  page.on('request', req => {
    if (req.url().includes('_bff/garage/graphql')) {
      gqlRequests.push({ op: JSON.parse(req.postData() || '{}')?.operationName, url: req.url() });
    }
  });
  page.on('response', async resp => {
    if (resp.url().includes('_bff/garage/graphql') && resp.status() >= 400) {
      const body = await resp.text().catch(() => '');
      console.log(`BFF ${resp.status()} resp:`, body.slice(0, 300));
    }
  });
  
  await page.goto('/settlement-voucher/SET-20260611-00001', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(3000);
  
  console.log('gql operations:', gqlRequests.map((r: any) => r.op).join(', '));
  
  // Also try API directly
  const token = await page.evaluate(() => {
    // Try to find auth token in storage
    const keys = Object.keys(localStorage);
    const authKey = keys.find(k => k.includes('token') || k.includes('auth') || k.includes('jwt'));
    return authKey ? localStorage.getItem(authKey) : 'not found';
  });
  console.log('auth token in localStorage (first 100):', String(token).slice(0, 100));
});
