import * as fs from 'fs';
import * as path from 'path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TablePagination from '@/components/share/tables/table-pagination';

/**
 * TC-W03-UI-F-016 [C1] List dung `share/tables/table-pagination` (khong dung moi).
 * Cluster C1 structural (mirror pattern A-014, khac production source file).
 */
const GF_WEB_ROOT = process.env.GF_WEB_ROOT || '/home/all_engineer/projects/garage-function/gf-gms-web';
const LIST_PAGE_SRC = path.join(
  GF_WEB_ROOT,
  'src/features/inventory-catalog/internal-product/components/InternalProductListPage.tsx',
);

describe('TC-W03-UI-F-016 - PROD-LIST reuse table-pagination (C1 structural)', () => {
  it('production source InternalProductListPage.tsx imports canonical share/tables/table-pagination', () => {
    const src = fs.readFileSync(LIST_PAGE_SRC, 'utf-8');
    expect(src).toMatch(/import\s+TablePagination\s+from\s+["']@\/components\/share\/tables\/table-pagination["']/);
  });

  it('canonical TablePagination render dung DOM structural (table + pagination controls) khi mount that', () => {
    render(
      <TablePagination
        data={[{ id: 1, code: 'PROD-001' }, { id: 2, code: 'PROD-002' }]}
        columns={[{ id: 'code', header: 'Ma san pham', accessorKey: 'code' }]}
        pagination={{ page: 1, pageSize: 20 }}
        totalPage={3}
        setPagination={() => undefined}
      />,
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
    expect(screen.getByText('common.per_page')).toBeInTheDocument();
  });
});
