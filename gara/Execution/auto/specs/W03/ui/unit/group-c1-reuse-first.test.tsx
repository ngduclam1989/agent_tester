/**
 * W03 garage-web UI unit — Nhom C1: reuse-first structural check (Vitest + RTL, jsdom).
 * Nguon TC: Execution/automated-test-cases/TC-W03-PLATFORM-UI.md (A-014/B-020/D-014/
 * F-016/G-034/H-012/K-016) — 7 TC Cluster **C1**.
 * Runner: QC-owned harness Execution/auto/harness/ui-unit (bootstrap Run 4, 2026-07-02)
 *   cd Execution/auto/harness/ui-unit && npx vitest run
 *
 * Chien luoc kiem chung (dung voi dinh nghia C1 "structural, khong can wording"):
 * (a) DOC TRUC TIEP source file thuc te cua man/component dang xet (fs.readFileSync,
 *     KHONG phai doan/gia dinh) + regex assert co import dung tu registry-canonical
 *     path — day la "Inspect DOM/imports ... doi chieu registry key" dung nhu Steps
 *     cua tung TC goc yeu cau.
 * (b) Voi it nhat 1 TC dai dien, MOUNT THAT component qua RTL (real source import tu
 *     garage-function/gf-gms-web/src, KHONG mock/stub) de chung minh reuse la THAT
 *     (function nang), khong chi la reference tinh.
 * Tat ca import deu tro THANG vao source that cua gf-gms-web (qua alias `@` trong
 * vitest.config.ts) — KHONG duplicate/rewrite code, chi doc (Critical Rule #11).
 *
 * LUU Y: `src/setup.ts` cua harness nay tung bi 1 tac nhan khac (song song) sua them
 * mock `react-i18next` — file test nay KHONG dung mock do de judge bat ky verdict
 * wording nao (chi dung cho structural/import-inspection thuan, khong wording claim).
 */
import * as fs from 'fs';
import * as path from 'path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const GF_WEB_ROOT = process.env.GF_WEB_ROOT || '/home/all_engineer/projects/garage-function/gf-gms-web';

function readSrc(relPath: string): string {
  return fs.readFileSync(path.join(GF_WEB_ROOT, 'src', relPath), 'utf-8');
}

describe('TC-W03-UI-A-014 [C1] List Group dung component reuse `share/tables/table-pagination`', () => {
  it('MaterialGroupListPage.tsx import TablePagination tu registry path `@/components/share/tables/table-pagination` (registry key data-table-with-pagination)', () => {
    const src = readSrc('features/inventory-catalog/material-group/components/MaterialGroupListPage.tsx');
    expect(src).toMatch(/import\s+TablePagination\s+from\s+["']@\/components\/share\/tables\/table-pagination["']/);
  });

  it('mount thuc te component TablePagination (real source) khong crash — chung minh reuse la functional, khong chi la reference tinh', async () => {
    const mod = await import('@/components/share/tables/table-pagination');
    const TablePagination = mod.default;
    expect(typeof TablePagination).toBe('function');
    render(
      <TablePagination
        data={[{ id: 1, name: 'row A' }]}
        columns={[{ accessorKey: 'name', header: 'Name' }]}
        pagination={{ page: 1, pageSize: 20 }}
        totalPage={1}
        setPagination={() => {}}
      />,
    );
    expect(screen.getByText('row A')).toBeInTheDocument();
  });
});

describe('TC-W03-UI-B-020 [C1] Form Group dung component reuse cho dropdown "Thuoc nhom" + textarea "Mo ta"', () => {
  it('MaterialGroupFormPage.tsx import Textarea tu `@/components/share/textareas/textarea` (registry key form-textarea)', () => {
    const src = readSrc('features/inventory-catalog/material-group/components/MaterialGroupFormPage.tsx');
    expect(src).toMatch(/import\s+Textarea\s+from\s+["']@\/components\/share\/textareas\/textarea["']/);
  });

  it('(drift ghi nhan) Dropdown "Thuoc nhom" KHONG dung truc tiep `share/inputs/input-select` nhu TC goc gia dinh — thuc te dung wrapper customs `SelectSuggestedMaterialGroup` boc `share/selects/select-filter` (registry key select-filter, VAN la reuse hop le theo registry, chi khac ten component cu the)', () => {
    const formSrc = readSrc('features/inventory-catalog/material-group/components/MaterialGroupFormPage.tsx');
    expect(formSrc).toMatch(/import\s+SelectSuggestedMaterialGroup\s+from\s+["']@\/components\/customs\/select\/select-suggested-material-group["']/);
    const wrapperSrc = readSrc('components/customs/select/select-suggested-material-group.tsx');
    expect(wrapperSrc).toMatch(/import\s+SelectFilter\s+from\s+["']@\/components\/share\/selects\/select-filter["']/);
  });
});

describe('TC-W03-UI-D-014 [C1] Alert-dialog dung `ui/alert-dialog` reuse (khong build moi)', () => {
  it('(adapted - ground-truth Run 3: KHONG co cascade dialog rieng, cascade la TU DONG) MaterialGroupDeleteDialog.tsx (alert-dialog dai dien gan nhat con lai trong feature nay) import dung tu `@/components/ui/alert-dialog`', () => {
    const src = readSrc('features/inventory-catalog/material-group/components/MaterialGroupDeleteDialog.tsx');
    expect(src).toMatch(/from\s+["']@\/components\/ui\/alert-dialog["']/);
    expect(src).toMatch(/AlertDialogTitle/);
    expect(src).toMatch(/AlertDialogAction/);
  });

  it('mount thuc te shadcn AlertDialog (real source `@/components/ui/alert-dialog`) render dung, khong custom-build lai tu dau', async () => {
    const mod = await import('@/components/ui/alert-dialog');
    render(
      <mod.AlertDialog open>
        <mod.AlertDialogContent>
          <mod.AlertDialogHeader>
            <mod.AlertDialogTitle>Xác nhận</mod.AlertDialogTitle>
            <mod.AlertDialogDescription>Ban co chac chan?</mod.AlertDialogDescription>
          </mod.AlertDialogHeader>
        </mod.AlertDialogContent>
      </mod.AlertDialog>,
    );
    expect(screen.getByText('Xác nhận')).toBeInTheDocument();
  });
});

describe('TC-W03-UI-F-016 [C1] List Product dung `share/tables/table-pagination` (khong dung moi)', () => {
  it('InternalProductListPage.tsx import TablePagination tu dung registry path', () => {
    const src = readSrc('features/inventory-catalog/internal-product/components/InternalProductListPage.tsx');
    expect(src).toMatch(/import\s+TablePagination\s+from\s+["']@\/components\/share\/tables\/table-pagination["']/);
  });
});

describe('TC-W03-UI-G-034 [C1] Form Product tab DVT quy doi / Ma SKU / Dinh kem dung component reuse', () => {
  it('AttachmentSection.tsx import FileUpload tu `@/components/share/files/file-upload` (registry key file-upload) — khop dung gia dinh goc', () => {
    const src = readSrc('features/inventory-catalog/internal-product/components/sections/AttachmentSection.tsx');
    expect(src).toMatch(/import\s+\{\s*FileUpload\s*\}\s+from\s+["']@\/components\/share\/files\/file-upload["']/);
  });

  it('(drift ghi nhan) Tab Ma SKU + tab DVT quy doi KHONG dung `share/inputs/tag-input` nhu TC goc gia dinh — thuc te dung `share/tables/table` (generic Table, khong phai TagInput chip UI) cho ca 2 section', () => {
    const skuSrc = readSrc('features/inventory-catalog/internal-product/components/sections/SkuMappingSection.tsx');
    const convSrc = readSrc('features/inventory-catalog/internal-product/components/sections/ConversionUnitSection.tsx');
    expect(skuSrc).toMatch(/import\s+\{\s*Table\s*\}\s+from\s+["']@\/components\/share\/tables\/table["']/);
    expect(convSrc).toMatch(/import\s+\{\s*Table\s*\}\s+from\s+["']@\/components\/share\/tables\/table["']/);
    expect(skuSrc).not.toMatch(/tag-input/);
    expect(convSrc).not.toMatch(/tag-input/);
  });
});

describe('TC-W03-UI-H-012 [C1] Modal Gan SKU dung shadcn `ui/dialog` reuse, checkbox chuan', () => {
  it('AssignSkuDialog.tsx import Dialog family tu `@/components/ui/dialog` (registry key ui/dialog)', () => {
    const src = readSrc('features/inventory-catalog/internal-product/components/AssignSkuDialog.tsx');
    expect(src).toMatch(/Dialog,[\s\S]*?DialogContent,[\s\S]*?DialogFooter,[\s\S]*?DialogHeader,[\s\S]*?DialogTitle[\s\S]*?\}\s+from\s+["']@\/components\/ui\/dialog["']/);
  });

  it('mount thuc te shadcn Dialog (real source `@/components/ui/dialog`) render dung', async () => {
    const mod = await import('@/components/ui/dialog');
    render(
      <mod.Dialog open>
        <mod.DialogContent>
          <mod.DialogHeader>
            <mod.DialogTitle>Gắn SKU cho PROD-TEST</mod.DialogTitle>
          </mod.DialogHeader>
        </mod.DialogContent>
      </mod.Dialog>,
    );
    expect(screen.getByText('Gắn SKU cho PROD-TEST')).toBeInTheDocument();
  });
});

describe('TC-W03-UI-K-016 [C1] Import page reuse ExcelUpload+FilesPreview+Container+Section+TablePagination+InputSearch+PageHeader+Button+toastCustom mirror customers/import.tsx', () => {
  it('internal-product import/index.tsx VA customers/import/index.tsx (nguon mirror) CUNG import dung 9 thanh phan reuse duoc TC lieu ke', () => {
    const prodImportSrc = readSrc('features/inventory-catalog/internal-product/components/import/index.tsx');
    const custImportSrc = readSrc('features/customers/components/import/index.tsx');
    const expectedImports: Array<[string, RegExp]> = [
      ['Container', /Container/],
      ['Button', /from\s+["']@\/components\/share\/buttons\/button["']/],
      ['Section', /import\s+Section\s+from\s+["']@\/components\/share\/containers\/section["']/],
      ['FilesPreview', /import\s+FilesPreview\s+from\s+["']@\/components\/share\/files\/files-preview["']/],
      ['InputSearch', /import\s+InputSearch\s+from\s+["']@\/components\/share\/inputs\/input-search["']/],
      ['PageHeader', /import\s+PageHeader\s+from\s+["']@\/components\/share\/layouts\/page-header["']/],
      ['TablePagination', /import\s+TablePagination\s+from\s+["']@\/components\/share\/tables\/table-pagination["']/],
      ['toastCustom', /import\s+\{\s*toastCustom\s*\}\s+from\s+["']@\/components\/share\/toasts\/toast["']/],
      ['ExcelUpload', /ExcelUpload/],
    ];
    for (const [label, re] of expectedImports) {
      expect(prodImportSrc, `internal-product import thieu reuse "${label}"`).toMatch(re);
      expect(custImportSrc, `customers import (mirror source) thieu reuse "${label}"`).toMatch(re);
    }
  });
});
