import { defineConfig, devices } from '@playwright/test';
// Polyfill TransformStream for Node environment if missing
if (typeof global.TransformStream === 'undefined') {
    const { TransformStream } = require('web-streams-polyfill/ponyfill');
    Object.defineProperty(global, 'TransformStream', { value: TransformStream });
}

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    timeout: 30000,
    use: {
        baseURL: 'http://localhost:3001',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3001',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});
