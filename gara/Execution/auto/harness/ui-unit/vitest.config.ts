import * as path from 'path';
import { defineConfig } from 'vitest/config';

/**
 * QC-owned Vitest+RTL harness cho garage-web UI unit/structural (C1) checks.
 * Bootstrap Run 4 (2026-07-02) — mirror pattern cua Execution/auto/harness/playwright.
 *
 * Chien luoc: KHONG cai lai toan bo dependency tree cua frontend (React 19 + Radix +
 * TanStack + Apollo...) vao harness nay. Thay vao do, dung `resolve.alias` tro thang
 * react/react-dom/@apollo/client/@radix-ui/* VE ĐUNG 1 BAN SAO da cai san trong
 * `garage-function/gf-gms-web/node_modules` (biet qua GF_WEB_ROOT, mac dinh absolute
 * path cua checkout hien co tren may sandbox) — tranh loi "duplicate React instance /
 * Invalid hook call" khi @testing-library/react (chay tu harness nay) mount component
 * that duoc import truc tiep tu source `gf-gms-web/src/**`.
 *
 * Day la READ-ONLY reference — harness nay KHONG BAO GIO ghi file vao gf-gms-web (chi
 * `import`/resolve module o che do doc). Tuan thu CLAUDE.md Critical Rule #11 (Design
 * repo NO-CODE): agent chi doc source code frontend lam context, khong Write/Edit.
 */

const GF_WEB_ROOT = process.env.GF_WEB_ROOT
  || '/home/all_engineer/projects/garage-function/gf-gms-web';

function gfWebNodeModule(pkg: string) {
  return path.join(GF_WEB_ROOT, 'node_modules', pkg);
}

function ownNodeModule(pkg: string) {
  return path.resolve(__dirname, 'node_modules', pkg);
}

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  server: {
    fs: {
      allow: [GF_WEB_ROOT, path.resolve(__dirname, '../../specs'), path.resolve(__dirname, '.')],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setup.ts'],
    include: ['../../specs/W03/ui/unit/**/*.test.tsx'],
    css: false,
  },
  resolve: {
    alias: {
      '@': path.join(GF_WEB_ROOT, 'src'),
      'react-dom/client': gfWebNodeModule('react-dom/client'),
      'react-dom/test-utils': gfWebNodeModule('react-dom/test-utils'),
      'react-dom': gfWebNodeModule('react-dom'),
      'react/jsx-runtime': gfWebNodeModule('react/jsx-runtime'),
      'react/jsx-dev-runtime': gfWebNodeModule('react/jsx-dev-runtime'),
      react: gfWebNodeModule('react'),
      '@apollo/client': gfWebNodeModule('@apollo/client'),
      'react-hook-form': gfWebNodeModule('react-hook-form'),
      '@tanstack/react-router': gfWebNodeModule('@tanstack/react-router'),
      '@tanstack/react-query': gfWebNodeModule('@tanstack/react-query'),
      '@tabler/icons-react': gfWebNodeModule('@tabler/icons-react') + '/dist/esm/icons/index.mjs',
      // Spec file (Execution/auto/specs/W03/ui/unit/**) nam NGOAI cay node_modules cua
      // harness nay (../../harness/ui-unit/node_modules) nen Node resolution tu-nhien
      // (di-len-tim-node_modules tu thu muc file) KHONG tim thay @testing-library/* —
      // alias tuong minh ve dung ban cai trong harness.
      '@testing-library/react': ownNodeModule('@testing-library/react'),
      '@testing-library/jest-dom': ownNodeModule('@testing-library/jest-dom'),
    },
  },
});
