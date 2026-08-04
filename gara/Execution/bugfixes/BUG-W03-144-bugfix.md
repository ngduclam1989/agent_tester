# BUGFIX — BUG-W03-144

> [Danh sách nhóm vật tư][Page title] Title trang thiếu prefix "Danh sách"
> Severity: P3 · Boundary: `garage-web` · Status: **FIX_DONE** · Date: 2026-07-03

## Summary

Manual QC báo title trang Danh sách nhóm vật tư thiếu prefix "Danh sách". Kiểm tra code: `MaterialGroupListPage.tsx:174` đã set `title="Danh sách nhóm vật tư hàng hóa"` đúng convention → đã có fix từ commit trước, không cần code change.

## Root cause

Có khả năng: (a) fix landed trước khi QC screenshot; (b) môi trường QC deploy build cũ. Code hiện tại (2026-07-03) đã đúng.

## Files changed

None (code đã đúng).

## Verify

1. Deploy latest build lên môi trường QC.
2. Mở `<garage-web>/inventory-catalog/material-groups`.
3. Title verbatim = "Danh sách nhóm vật tư hàng hóa".

## Follow-up

None. Nếu QC re-verify vẫn thấy "Nhóm vật tư hàng hóa" (thiếu prefix) → verify deploy version thật.
