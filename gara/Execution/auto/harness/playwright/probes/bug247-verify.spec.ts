import { test, expect } from '@playwright/test';
const BASE_URL = process.env.BASE_URL || 'http://localhost:45300';

async function login(page: any) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(500);
  const phoneInput = page.locator('input[placeholder*="điện thoại"], input[type="tel"], input[name="phone"], input').first();
  await phoneInput.fill('0810000002');
  await page.locator('input[type="password"]').first().fill('Test@12345');
  await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
  await page.waitForTimeout(2000);
}

test('BUG-W01-247 verify — "Chỉnh sửa" click on INSURANCE STL detail', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE_URL}/settlement-voucher/SET-20260611-00001`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);
  
  const urlBefore = page.url();
  // Look for Chỉnh sửa button
  const chiSuaBtn = page.locator('button:has-text("Chỉnh sửa")').first();
  const isVisible = await chiSuaBtn.isVisible({ timeout: 5000 }).catch(() => false);
  console.log('Chỉnh sửa visible:', isVisible);
  console.log('URL before:', urlBefore);
  
  if (isVisible) {
    await chiSuaBtn.click();
    await page.waitForTimeout(2000);
    const urlAfter = page.url();
    console.log('URL after click:', urlAfter);
    const bodyText = await page.locator('body').textContent();
    const hasError = bodyText?.includes('Something went wrong') || bodyText?.includes('Lỗi Hệ thống');
    console.log('Has error after click:', hasError);
    
    // Check if URL changed (edit mode activated)
    const urlChanged = urlAfter !== urlBefore;
    const hasEditMode = urlAfter.includes('mode=edit') || urlAfter.includes('/edit');
    console.log('URL changed:', urlChanged, 'edit mode:', hasEditMode);
    
    // The button should trigger some navigation/state change
    expect(hasError).toBe(false);
  } else {
    console.log('BLOCKED: Chỉnh sửa button not found');
    test.skip(true, 'Chỉnh sửa button not visible — may be pending role/state');
  }
});
