# BUGFIX — BUG-W03-139

> MaterialGroup Edit form không pre-select nhóm cha hiện tại — trường "Thuộc nhóm" hiển thị placeholder thay vì tên nhóm cha.
> Severity: **P2** · Boundary: `garage-web` · Status: **RESOLVED** · Date: 2026-07-03

## 1. Summary

Trên `MaterialGroupFormPage.tsx` (chế độ Edit), khi mở form sửa 1 nhóm con có `parentId`, trường "Thuộc nhóm" hiển thị placeholder "Chọn nhóm cha" thay vì tên nhóm cha hiện tại (dù BFF trả đủ `parentId` + `parentName` và `SelectSuggestedMaterialGroup` nhận `defaultValue={value: String(parentId), label: parentName}`).

## 2. Root cause

Type mismatch giữa RHF field value và `SelectFilter` option.value:

- `useEffect` gọi `reset({ parentId: group.parentId ?? null, ... })` với `group.parentId` là `number` (theo `IMaterialGroup.parentId: number | null`).
- `SelectSuggestedMaterialGroup` (đọc từ `useSearchMaterialGroups`) build options với `value: String(g.id)` (string).
- `SelectFilter` render selected label bằng `options.find(o => o.value === field.value)`. Số 5 !== chuỗi "5" → không match → placeholder được hiển thị.
- `defaultValue.value = String(group.parentId)` được inject vào options list (line 65-74 của `select-suggested-material-group.tsx`) nhưng vẫn không match `field.value` là `number`.

## 3. Fix

Cast `parentId` sang string ngay tại `reset()` sao cho tương thích với options list (all string):

```tsx
reset({
  ...
  parentId: group.parentId != null ? String(group.parentId) : null,
  ...
});
```

- Schema `materialGroupFormSchema.parentId` là `z.union([z.number(), z.string(), z.null()])` — đã chấp nhận string.
- `toNumericParentId()` (dùng khi submit) đã xử lý cả string và number → không cần đổi.

## 4. Files changed

| File | Change |
|---|---|
| `frontend/gf-gms-web/src/features/inventory-catalog/material-group/components/MaterialGroupFormPage.tsx` | Cast `group.parentId` → `String(group.parentId)` khi reset defaultValues |

Commit: `640cb5a4` `fix(inventory-catalog): cast parentId to string in MaterialGroupFormPage edit reset`

## 5. Regression / verification

- `yarn tsc -b` (whole project) → **PASS**.
- `npx eslint` trên file touched → **PASS** (0 error, 0 warning).
- Runtime browser smoke: **DEFERRED** — user cần verify:
  1. Mở form Edit của 1 nhóm con CÓ nhóm cha → trường "Thuộc nhóm" hiển thị tên nhóm cha đúng.
  2. Mở form Edit của 1 nhóm root (parentId null) → trường "Thuộc nhóm" hiển thị placeholder "Chọn nhóm cha".
  3. Regression BUG-W03-127 (field disabled trong edit) — vẫn còn hiệu lực (prop `disabled={isEdit}` giữ nguyên).

## 6. Non-goals / out of scope

- Không chạm submit path (`toNumericParentId` đã handle string→number).
- Không sửa BFF/BE — bug xác nhận FE-only từ verify.md §9.
- Không refactor cross-feature — cùng type mismatch ở BUG-W03-151 (product form) được fix riêng.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-03 | 1 | agent-fix-garage-web (main session) | Cast parentId → string trong reset của MaterialGroupFormPage sao cho khớp SelectFilter option.value; test + lint pass. Runtime smoke deferred. |
