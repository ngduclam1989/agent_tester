import * as fs from 'fs';
import * as path from 'path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { ExcelUpload } from '@/components/share/uploads/excel-upload';

/**
 * TC-W03-UI-K-016 [C1] Import page reuse
 * `ExcelUpload+FilesPreview+Container+Section+TablePagination+InputSearch+PageHeader+Button+toastCustom`
 * mirror `customers/import`. Cluster C1 structural.
 *
 * 1) Static import check — production source
 *    `internal-product/components/import/index.tsx` that su import DUNG 9 module canonical
 *    theo TC (khong tu che rieng bo widget import).
 * 2) Runtime RTL render — mount canonical `ExcelUpload` (thanh phan tieu bieu, dropzone
 *    input) trong FormProvider, xac nhan DOM structural that (input[type=file] + label).
 */
const GF_WEB_ROOT = process.env.GF_WEB_ROOT || '/home/all_engineer/projects/garage-function/gf-gms-web';
const IMPORT_SRC = path.join(
  GF_WEB_ROOT,
  'src/features/inventory-catalog/internal-product/components/import/index.tsx',
);

function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({ defaultValues: { file: undefined } });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('TC-W03-UI-K-016 - PROD-IMPORT reuse ExcelUpload/FilesPreview/... mirror customers/import (C1 structural)', () => {
  it('production source import/index.tsx import du 9 module canonical (Container/Section/FilesPreview/InputSearch/PageHeader/TablePagination/toastCustom/ExcelUpload/Button)', () => {
    const src = fs.readFileSync(IMPORT_SRC, 'utf-8');
    const expectedImports: Array<[string, RegExp]> = [
      ['Container', /from ["']@\/components\/share["']/],
      ['Button', /from ["']@\/components\/share\/buttons\/button["']/],
      ['Section', /from ["']@\/components\/share\/containers\/section["']/],
      ['FilesPreview', /from ["']@\/components\/share\/files\/files-preview["']/],
      ['InputSearch', /from ["']@\/components\/share\/inputs\/input-search["']/],
      ['PageHeader', /from ["']@\/components\/share\/layouts\/page-header["']/],
      ['TablePagination', /from ["']@\/components\/share\/tables\/table-pagination["']/],
      ['toastCustom', /from ["']@\/components\/share\/toasts\/toast["']/],
      ['ExcelUpload', /from ["']@\/components\/share\/uploads\/excel-upload["']/],
    ];
    for (const [name, re] of expectedImports) {
      expect(src).toContain(name);
      expect(src).toMatch(re);
    }
  });

  it('canonical ExcelUpload render dung DOM structural (dropzone input[type=file]) khi mount that trong FormProvider', () => {
    render(
      <FormWrapper>
        <ExcelUpload
          name="file"
          sampleFileUrl="https://example.com/sample.xlsx"
          sampleFileName="mau-import.xlsx"
          readFile={() => undefined}
        />
      </FormWrapper>,
    );
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
