/**
 * Shared helpers for W01 UI specs.
 * Handles login with disabled-button pattern (GMS login form).
 *
 * NOTE: button[type="submit"] selector returns 0 elements after React hydration
 * in garage-web (dynamic attribute). Use button:has-text("Đăng nhập") instead.
 */
import { Page, expect } from '@playwright/test';

export const BASE_URL = process.env.BASE_URL || 'http://localhost:45300';

/**
 * Login to GMS.
 * The submit button starts disabled; becomes enabled after both fields are filled.
 * button[type="submit"] does NOT work post-hydration — use text selector.
 */
export async function login(page: Page, phone = '0901234567', password = 'Test@1234') {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  // Wait for login form inputs
  await page.waitForSelector('input[placeholder="Nhập số điện thoại"]', { timeout: 10000 });
  await page.locator('input[placeholder="Nhập số điện thoại"]').fill(phone);
  await page.locator('input[type="password"]').fill(password);
  // Wait for React state update: button becomes enabled after both fields filled
  await page.waitForTimeout(300);
  const submitBtn = page.locator('button:has-text("Đăng nhập")');
  await expect(submitBtn).toBeEnabled({ timeout: 5000 });
  await submitBtn.click();
  // Wait for redirect away from /login
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
}
