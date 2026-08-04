import { test, expect } from '@playwright/test';

test('login probe', async ({ page }) => {
  // Enable console and network logging
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url(), req.failure()?.errorText));
  
  await page.goto('http://192.168.110.191:45300/login');
  await page.waitForLoadState('domcontentloaded');
  console.log('Page loaded, URL:', page.url());
  
  await page.locator('input[placeholder="Nhập số điện thoại"]').fill('0810000002');
  await page.locator('input[placeholder="Nhập mật khẩu"]').fill('Test@12345');
  
  // Take screenshot before click
  await page.screenshot({ path: '/tmp/before-login.png' });
  
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  
  // Wait a bit and capture state
  await page.waitForTimeout(5000);
  
  console.log('After click URL:', page.url());
  await page.screenshot({ path: '/tmp/after-login.png' });
  
  // Try to wait for redirect but with shorter timeout
  try {
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
    console.log('SUCCESS - redirected to:', page.url());
  } catch (e) {
    console.log('TIMEOUT - still at:', page.url());
    // Get page content 
    const content = await page.content();
    const errorEl = await page.locator('.error, [class*="error"], [class*="alert"]').first().textContent().catch(() => 'none');
    console.log('Error element:', errorEl);
  }
});
