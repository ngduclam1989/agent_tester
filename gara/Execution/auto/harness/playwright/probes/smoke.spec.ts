import { test, expect } from '@playwright/test';

async function login(page: any) {
  await page.goto('http://localhost:45300/login', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('input[placeholder="Nhập số điện thoại"]', { timeout: 10000 });
  await page.locator('input[placeholder="Nhập số điện thoại"]').fill('0901234567');
  await page.locator('input[type="password"]').fill('Test@1234');
  await page.waitForTimeout(300);
  await page.locator('button:has-text("Đăng nhập")').click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
}

test('detailed check -006 in edit — insurance section persistence', async ({ page }) => {
  await login(page);
  await page.goto('http://localhost:45300/service-order/PDV-20260611-00006', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(800);
  
  // Check BH toggle state in detail
  const detailBHToggle = await page.evaluate(() => {
    const toggles = Array.from(document.querySelectorAll('[role="switch"], input[type="checkbox"]'));
    return toggles.map(t => ({
      ariaChecked: t.getAttribute('aria-checked'),
      dataState: t.getAttribute('data-state'),
    }));
  });
  console.log('Detail BH toggle:', JSON.stringify(detailBHToggle));
  
  // Check insurance section in detail
  const insH2InDetail = await page.locator('h2:has-text("Phân bổ quyết toán bảo hiểm")').count();
  console.log('Insurance H2 in detail:', insH2InDetail);
  
  // Click edit
  await page.locator('button:has-text("Chỉnh sửa")').click();
  await page.waitForTimeout(3000); // Give more time for data hydration
  
  const urlAfterEdit = page.url();
  console.log('URL:', urlAfterEdit);
  
  // Check if section visible AFTER full hydration
  const insH2Count = await page.locator('h2:has-text("Phân bổ quyết toán bảo hiểm")').count();
  console.log('H2 count AFTER full hydration (3s):', insH2Count);
  
  // Check BH toggle in edit mode
  const editBHToggle = await page.evaluate(() => {
    const toggles = Array.from(document.querySelectorAll('[role="switch"]'));
    return toggles.map(t => ({
      text: t.closest('label')?.textContent?.trim().substring(0, 30),
      ariaChecked: t.getAttribute('aria-checked'),
      dataState: t.getAttribute('data-state'),
    }));
  });
  console.log('Edit BH toggle:', JSON.stringify(editBHToggle));
  
  // Check if SO actually has BH data
  const bhRelatedText = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const found: string[] = [];
    let node: Text | null;
    while ((node = walker.nextNode() as Text)) {
      const t = node.textContent?.trim() || '';
      if (t === 'Có' || t === 'Không') found.push(`toggle_value:${t}`);
    }
    return found.slice(0, 5);
  });
  console.log('Có/Không values:', JSON.stringify(bhRelatedText));
}, { timeout: 60000 });
