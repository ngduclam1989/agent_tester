import type { Config } from 'jest';
import path from 'path';

/**
 * QC-owned API test harness — Lớp A (frozen, CR-20260701-03 §B2).
 * Spec thật nằm ở Lớp B: ../../specs/W{NN}/api/*.spec.ts (KHÔNG còn ở đây).
 * Chọn wave qua testPathPattern, vd:
 *   npx jest --testPathPattern='W02/api'
 */
const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['./probes', '../../specs'],
  testMatch: ['**/api/**/*.test.ts', '**/api/**/*.spec.ts', '**/probes/*.probe.ts'],
  testTimeout: 60000,
  globals: {
    'ts-jest': {
      tsconfig: {
        strict: false,
        esModuleInterop: true,
      },
    },
  },
  setupFiles: ['./setup.ts'],
  modulePaths: [path.join(__dirname, 'node_modules')],
  moduleDirectories: ['node_modules', path.join(__dirname, 'node_modules')],
  // CR-20260704-01 Phase 1 (Observability): dùng built-in Jest JSON reporter qua CLI flag
  // khi cần shell-only parser (không cần config sửa):
  //   npx jest --testPathPattern='W03/api' --json --outputFile=/tmp/jest-W03.json
  // scripts/parse-test-result.py đọc file này → update TC-W{NN}-API.md status/bug ID.
};

export default config;
