import * as fs from 'fs';
import * as path from 'path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TablePagination from '@/components/share/tables/table-pagination';

/**
 * TC-W03-UI-A-014 [C1] List dung component reuse `share/tables/table-pagination`
 * (khong dung moi). Cluster C1 (structural DOM check, khong can wording) theo
 * TC-W03-PLATFORM-UI.md Nhom A.
 *
 * 2 lop bang chung:
 * 1) Static import check — xac nhan MaterialGroupListPage.tsx (production source) that
 *    su import dung module canonical `@/components/share/tables/table-pagination`
 *    (khong tu dung lai table/pagination rieng).
 * 2) Runtime RTL render — mount CHINH module canonical do, xac nhan DOM structural that
 *    su co table + pagination controls (khong phai stub rong).
 */
const GF_WEB_ROOT = process.env.GF_WEB_ROOT || '/home/all_engineer/projects/garage-function/gf-gms-web';
const LIST_PAGE_SRC = path.join(
  GF_WEB_ROOT,
  'src/features/inventory-catalog/material-group/components/MaterialGroupListPage.tsx',
);

describe('TC-W03-UI-A-014 - GRP-LIST reuse table-pagination (C1 structural)', () => {
  it('production source MaterialGroupListPage.tsx imports canonical share/tables/table-pagination (khong tu dung lai)', () => {
    const src = fs.readFileSync(LIST_PAGE_SRC, 'utf-8');
    expect(src).toMatch(/import\s+TablePagination\s+from\s+["']@\/components\/share\/tables\/table-pagination["']/);
  });

  it('canonical TablePagination component render dung DOM structural (table + pagination controls) khi mount that', () => {
    render(
      <TablePagination
        data={[{ id: 1, name: 'Nhom A' }, { id: 2, name: 'Nhom B' }]}
        columns={[{ id: 'name', header: 'Ten nhom', accessorKey: 'name' }]}
        pagination={{ page: 1, pageSize: 20 }}
        totalPage={3}
        setPagination={() => undefined}
      />,
    );
    // Table structural markers (shadcn ui/table renders <table> semantics via role).
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
    // DataTablePagination page-size Select trigger + Pagination nav — proof la component
    // that (khong phai duplicate rieng khong co pagination).
    expect(screen.getByText('common.per_page')).toBeInTheDocument();
  });
});
