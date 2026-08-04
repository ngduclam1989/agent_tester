import * as fs from 'fs';
import * as path from 'path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import Textarea from '@/components/share/textareas/textarea';
import SelectFilter from '@/components/share/selects/select-filter';

/**
 * TC-W03-UI-B-020 [C1] Form dung component reuse `share/inputs/input-select` +
 * `share/textareas/textarea`. Cluster C1 structural.
 *
 * DRIFT ghi nhan khi doc production source that (MaterialGroupFormPage.tsx):
 * - "Mo ta" textarea DUNG chinh xac `share/textareas/textarea` (khop TC).
 * - "Thuoc nhom" dropdown KHONG dung `share/inputs/input-select` nhu TC gia dinh, ma
 *   dung `customs/select/select-suggested-material-group` (component domain-specific,
 *   compose tren nen `share/selects/select-filter` canonical o trong — xac nhan qua doc
 *   source, KHONG phai <select> tho tu che).
 * - "Trang thai" dropdown dung `share/selects/select-filter` (registry key
 *   `select-with-filter`), KHAC voi `input-select` (registry key `form-combo-select`)
 *   nhung VAN la shared component canonical trong `web-component-registry.yaml`.
 *
 * Ket luan: TC "adapted" — component TC doan sai ten cu the, nhung thuc te toan bo
 * field deu reuse component canonical (khong custom-built rieng). Rieng
 * `select-suggested-material-group` HIEN CHUA co entry trong
 * `.claude/references/web-component-registry.yaml` (khong `domain-group-select`, chi co
 * `domain-product-suggest`/`domain-service-suggest`/etc.) — ghi observation registry-gap,
 * KHONG phai anti-pattern hand-built (component nay compose tren SelectFilter canonical).
 */
const GF_WEB_ROOT = process.env.GF_WEB_ROOT || '/home/all_engineer/projects/garage-function/gf-gms-web';
const FORM_PAGE_SRC = path.join(
  GF_WEB_ROOT,
  'src/features/inventory-catalog/material-group/components/MaterialGroupFormPage.tsx',
);
const SELECT_SUGGESTED_GROUP_SRC = path.join(
  GF_WEB_ROOT,
  'src/components/customs/select/select-suggested-material-group.tsx',
);

function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({ defaultValues: { status: '', description: '' } });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('TC-W03-UI-B-020 - GRP-CREATE reuse dropdown+textarea (C1 structural, adapted)', () => {
  it('production source MaterialGroupFormPage.tsx import Textarea tu canonical share/textareas/textarea cho field Mo ta', () => {
    const src = fs.readFileSync(FORM_PAGE_SRC, 'utf-8');
    expect(src).toMatch(/import\s+Textarea\s+from\s+["']@\/components\/share\/textareas\/textarea["']/);
    expect(src).toMatch(/import\s+SelectFilter\s+from\s+["']@\/components\/share\/selects\/select-filter["']/);
  });

  it('field "Thuoc nhom" (customs/select/select-suggested-material-group) compose tren canonical share/selects/select-filter ben trong (khong phai <select> tho tu che)', () => {
    const src = fs.readFileSync(SELECT_SUGGESTED_GROUP_SRC, 'utf-8');
    expect(src).toMatch(/import\s+SelectFilter\s+from\s+["']@\/components\/share\/selects\/select-filter["']/);
  });

  it('canonical Textarea render dung DOM structural (label + textarea element) khi mount that trong FormProvider', () => {
    render(
      <FormWrapper>
        <Textarea name="description" label="Mô tả" placeholder="Nhập mô tả" />
      </FormWrapper>,
    );
    expect(screen.getByText('Mô tả')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nhập mô tả')).toBeInTheDocument();
    expect(document.querySelector('textarea')).not.toBeNull();
  });

  it('canonical SelectFilter render dung DOM structural (combobox trigger) khi mount that trong FormProvider', () => {
    render(
      <FormWrapper>
        <SelectFilter
          name="status"
          label="Trạng thái"
          options={[{ value: 'ACTIVE', label: 'Đang hoạt động' }]}
          canClear={false}
        />
      </FormWrapper>,
    );
    expect(screen.getByText('Trạng thái')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
