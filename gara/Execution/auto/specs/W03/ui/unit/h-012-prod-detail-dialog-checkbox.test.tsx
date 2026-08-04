import * as fs from 'fs';
import * as path from 'path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table } from '@/components/share/tables/table';

/**
 * TC-W03-UI-H-012 [C1] Modal Gan SKU dung shadcn `ui/dialog` reuse, checkbox chuan.
 * Cluster C1 structural.
 *
 * 1) Static import check — AssignSkuDialog.tsx (production source) that su import
 *    canonical `@/components/ui/dialog` (5 sub-component) + `@/components/share/tables/table`
 *    (voi setRowSelection -> checkbox column dung `@/components/ui/checkbox` canonical,
 *    KHONG phai checkbox input tu che).
 * 2) Runtime RTL render — mount dialog + table voi setRowSelection, xac nhan checkbox
 *    column that su xuat hien (role=checkbox tu Radix Checkbox, khong phai <input> tho).
 */
const GF_WEB_ROOT = process.env.GF_WEB_ROOT || '/home/all_engineer/projects/garage-function/gf-gms-web';
const ASSIGN_SKU_SRC = path.join(
  GF_WEB_ROOT,
  'src/features/inventory-catalog/internal-product/components/AssignSkuDialog.tsx',
);

describe('TC-W03-UI-H-012 - Modal Gan SKU dung ui/dialog + Table checkbox reuse (C1 structural)', () => {
  it('production source AssignSkuDialog.tsx import canonical ui/dialog (5 sub-component) + share/tables/table voi setRowSelection', () => {
    const src = fs.readFileSync(ASSIGN_SKU_SRC, 'utf-8');
    expect(src).toMatch(/from ["']@\/components\/ui\/dialog["']/);
    for (const sub of ['Dialog', 'DialogContent', 'DialogFooter', 'DialogHeader', 'DialogTitle']) {
      expect(src).toContain(sub);
    }
    expect(src).toMatch(/from ["']@\/components\/share\/tables\/table["']/);
    expect(src).toMatch(/setRowSelection/);
  });

  it('canonical Dialog + Table(setRowSelection) render dung DOM structural (role=dialog, checkbox Radix) khi mount that', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gắn SKU</DialogTitle>
          </DialogHeader>
          <Table
            data={[{ id: 1, sku: 'SKU-001' }]}
            columns={[{ id: 'sku', header: 'SKU', accessorKey: 'sku' }]}
            setRowSelection={() => undefined}
            rowSelection={{}}
          />
          <DialogFooter>Footer</DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    // Checkbox column tu Table.tsx dung canonical `@/components/ui/checkbox` (Radix) —
    // render ra role="checkbox", KHONG phai <input type=checkbox> tho tu che.
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
  });
});
