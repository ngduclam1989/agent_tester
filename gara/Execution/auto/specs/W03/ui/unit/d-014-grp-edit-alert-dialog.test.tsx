import * as fs from 'fs';
import * as path from 'path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/**
 * TC-W03-UI-D-014 [C1] Alert-dialog cascade dung `ui/alert-dialog` reuse (khong build
 * moi). Cluster C1 structural.
 *
 * 1) Static import check — MaterialGroupFormPage.tsx (production source, dung chung cho
 *    Create+Edit theo CONFLICT-04) that su import 8 sub-component tu canonical
 *    `@/components/ui/alert-dialog` cho cascade confirm dialog (state `cascadeConfirm`).
 * 2) Runtime RTL render — mount CHINH cac sub-component do voi noi dung tuong tu cascade
 *    dialog that (title "Xac nhan", nut "Huy bo" + Action) — xac nhan DOM khong phai
 *    component tu che.
 */
const GF_WEB_ROOT = process.env.GF_WEB_ROOT || '/home/all_engineer/projects/garage-function/gf-gms-web';
const FORM_PAGE_SRC = path.join(
  GF_WEB_ROOT,
  'src/features/inventory-catalog/material-group/components/MaterialGroupFormPage.tsx',
);

describe('TC-W03-UI-D-014 - GRP-EDIT cascade dung ui/alert-dialog reuse (C1 structural)', () => {
  it('production source MaterialGroupFormPage.tsx import du 8 sub-component tu canonical @/components/ui/alert-dialog cho cascadeConfirm', () => {
    const src = fs.readFileSync(FORM_PAGE_SRC, 'utf-8');
    expect(src).toMatch(/from ["']@\/components\/ui\/alert-dialog["']/);
    for (const sub of [
      'AlertDialog',
      'AlertDialogAction',
      'AlertDialogCancel',
      'AlertDialogContent',
      'AlertDialogDescription',
      'AlertDialogFooter',
      'AlertDialogHeader',
      'AlertDialogTitle',
    ]) {
      expect(src).toContain(sub);
    }
    expect(src).toMatch(/cascadeConfirm/);
  });

  it('canonical AlertDialog sub-component render dung DOM structural (role=alertdialog, action/cancel buttons) khi mount that', () => {
    render(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận</AlertDialogTitle>
            <AlertDialogDescription>Thay doi trang thai se anh huong nhom con.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ bỏ</AlertDialogCancel>
            <AlertDialogAction>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Xác nhận' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Huỷ bỏ' })).toBeInTheDocument();
  });
});
