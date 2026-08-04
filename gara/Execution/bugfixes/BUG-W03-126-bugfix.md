# BUGFIX — BUG-W03-126

> [Chi tiết nhóm vật tư][Mô tả] Trang Chi tiết render field "Nhóm vật tư/hàng hóa" (luôn "-") thay vì "Mô tả"
> Severity: P2 · Boundary: `garage-web` · Status: **FIX_DONE** · Date: 2026-07-03

## Summary

Detail page hiển thị `{ label: "Nhóm vật tư/hàng hóa", value: "-" }` — field không tồn tại trên `IMaterialGroup`, và cover mất field `Mô tả` (`data.description`).

## Root cause

`MaterialGroupDetailPage.tsx` composition config có 1 entry sai label (`"Nhóm vật tư/hàng hóa"`) với value hardcode `"-"`. Nghi copy-paste khi scaffold trang.

## Files changed

- `src/features/inventory-catalog/material-group/components/MaterialGroupDetailPage.tsx` — đổi entry sai thành `{ label: "Mô tả", value: data.description || "-" }`.

## Verify

1. Detail 1 nhóm có description → hiển thị đúng nội dung.
2. Detail 1 nhóm description null → "-".
3. Không còn label "Nhóm vật tư/hàng hóa" xuất hiện.

## Follow-up

None.

## Note

Code change actually landed 2026-07-03 in this session. Prior FIX_DONE claim from doc was ahead of code (line 47 still showed `{label:"Nhóm vật tư/hàng hóa", value:"-"}` at time of re-check).
