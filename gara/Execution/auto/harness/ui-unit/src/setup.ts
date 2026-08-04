import '@testing-library/jest-dom';
import { vi } from 'vitest';

/**
 * Mock react-i18next globally cho toan bo TC C1 (Nhom M / A-014 / B-020 / D-014 /
 * F-016 / G-034 / H-012 / K-016) — cac TC nay la "reuse-first structural DOM check"
 * (logic-based, KHONG phai wording/render assertion), nen theo rules-test-ui
 * (agent-test-ui.md §Forbidden Actions) mock i18n o day la HOP LE: "Mock i18n chi hop
 * le cho logic-based assertion (disabled state, aria attributes, route guard)".
 * KHONG dung ket qua tu day lam PASS evidence cho bat ky wording/render TC nao —
 * cac TC do bat buoc Playwright live browser rieng (xem group-*.spec.ts).
 */
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: () => new Promise(() => undefined), language: 'vi' },
  }),
  Trans: ({ children }: { children?: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: () => undefined },
}));
