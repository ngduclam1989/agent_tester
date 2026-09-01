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
