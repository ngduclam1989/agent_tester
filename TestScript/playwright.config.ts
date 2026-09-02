import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,

    /**
     * REPORT — mặc định dùng monocart-reporter (theo setup gốc ở C:\playwright_Demo).
     *   Xem báo cáo : npm run report        -> npx monocart show-report test-results/report.html
     *   KHÔNG dùng `npx playwright show-report`: lệnh đó chỉ mở reporter 'html' của Playwright,
     *   mà cấu hình này không bật 'html' nên sẽ không có gì để mở.
     *
     * Allure là lựa chọn thay thế, đã cài sẵn `allure-playwright` nhưng KHÔNG bật mặc định.
     *   Chạy kèm Allure : npm run test:api:allure   (ghi kết quả thô vào ./allure-results)
     *   Render HTML     : cần Allure CLI riêng (`allure-commandline`), chưa cài trong project.
     *
     * Dọn kết quả cũ trước khi chạy lại: npm run clean (dùng rimraf).
     */
    reporter: [
        ['list'],
        ['monocart-reporter', {
            name: 'Báo Cáo Automation Test',
            outputFile: './test-results/report.html',
        }],
    ],

    use: {
        trace: 'on-first-retry',
    },

    /**
     * FIX #10: tách project API và Web.
     * Suite API không mở browser nên screenshot là chi phí thừa — chỉ bật cho Web,
     * và chỉ chụp khi fail (đúng rule "không chụp screenshot tràn lan" trong CLAUDE.md).
     */
    projects: [
        {
            name: 'api',
            testDir: './tests/api',
        },
        {
            name: 'web',
            testDir: './tests/web',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 }, // Rule bắt buộc: desktop 1920x1080
                screenshot: 'only-on-failure',
                video: 'retain-on-failure',
            },
        },
    ],
});
