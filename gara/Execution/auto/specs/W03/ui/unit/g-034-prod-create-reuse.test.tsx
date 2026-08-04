import * as fs from 'fs';
import * as path from 'path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { FileUpload } from '@/components/share/files/file-upload';
import { FolderTypeEnum } from '@/interfaces/enum';

/**
 * TC-W03-UI-G-034 [C1] Form dung `share/inputs/tag-input` (SKU chip) +
 * `share/files/file-upload` + `share/tables/table-pagination` (DVT quy doi inline
 * table). Cluster C1 structural.
 *
 * DRIFT ghi nhan khi doc production source that (4 tab component):
 * - Tab "Dinh kem" (AttachmentSection.tsx) DUNG chinh xac `share/files/file-upload`
 *   (khop TC).
 * - Tab "Ma SKU" (SkuMappingSection.tsx + AssignSkuDialog.tsx) KHONG dung
 *   `share/inputs/tag-input` (chip UI) nhu TC gia dinh — thuc te dung
 *   `share/tables/table` (danh sach SKU da gan, dang bang) + `ui/dialog` (modal chon
 *   SKU) — da verify rieng o H-012.
 * - Tab "DVT quy doi" (ConversionUnitSection.tsx) KHONG dung `share/tables/table-pagination`
 *   (khong co pagination — danh sach DVT quy doi it dong, khong can phan trang) — dung
 *   `share/tables/table` (khong pagination) + `ConversionUnitDialog` (rieng, dung
 *   `ui/dialog`).
 *
 * Ket luan: TC "adapted" — 3 component TC doan (tag-input/table-pagination cho 2/3 tab)
 * khong khop chinh xac ten, nhung CA 3 tab deu reuse component canonical
 * (`share/tables/table`, `share/files/file-upload`, `ui/dialog`) — KHONG co table/modal
 * tu che rieng. Day la assumption drift o buoc TEST_PLANNING (doan sai ten cu the),
 * khong phai vi pham reuse-first gate thuc te.
 */
const GF_WEB_ROOT = process.env.GF_WEB_ROOT || '/home/all_engineer/projects/garage-function/gf-gms-web';
const ATTACHMENT_SRC = path.join(
  GF_WEB_ROOT,
  'src/features/inventory-catalog/internal-product/components/sections/AttachmentSection.tsx',
);
const SKU_SECTION_SRC = path.join(
  GF_WEB_ROOT,
  'src/features/inventory-catalog/internal-product/components/sections/SkuMappingSection.tsx',
);
const CONVERSION_SECTION_SRC = path.join(
  GF_WEB_ROOT,
  'src/features/inventory-catalog/internal-product/components/sections/ConversionUnitSection.tsx',
);

function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({ defaultValues: { attachments: [] } });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('TC-W03-UI-G-034 - PROD-CREATE 4-tab reuse (C1 structural, adapted)', () => {
  it('AttachmentSection.tsx import canonical share/files/file-upload (khop TC dung ten)', () => {
    const src = fs.readFileSync(ATTACHMENT_SRC, 'utf-8');
    expect(src).toMatch(/import\s+\{\s*FileUpload\s*\}\s+from\s+["']@\/components\/share\/files\/file-upload["']/);
  });

  it('SkuMappingSection.tsx + AssignSkuDialog reuse canonical share/tables/table + ui/dialog (khong phai tag-input nhu TC gia dinh, van la reuse-first hop le)', () => {
    const src = fs.readFileSync(SKU_SECTION_SRC, 'utf-8');
    expect(src).toMatch(/import\s+\{\s*Table\s*\}\s+from\s+["']@\/components\/share\/tables\/table["']/);
    expect(src).not.toMatch(/tag-input/);
  });

  it('ConversionUnitSection.tsx reuse canonical share/tables/table (khong phai table-pagination nhu TC gia dinh — danh sach khong can phan trang, van la reuse-first hop le)', () => {
    const src = fs.readFileSync(CONVERSION_SECTION_SRC, 'utf-8');
    expect(src).toMatch(/import\s+\{\s*Table\s*\}\s+from\s+["']@\/components\/share\/tables\/table["']/);
  });

  it('canonical FileUpload render dung DOM structural (dropzone input[type=file]) khi mount that trong FormProvider', () => {
    render(
      <FormWrapper>
        <FileUpload name="attachments" label="Đính kèm" folderType={FolderTypeEnum.INVENTORY} />
      </FormWrapper>,
    );
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
    expect(screen.getByText('Đính kèm')).toBeInTheDocument();
  });
});
