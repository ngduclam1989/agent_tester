# BUGFIX-BUG-W03-145 — Icon "Thêm Nhóm VT/HH" swap sang iconsax `<Add>` đồng nhất Figma vuesax/linear/add

> **L1 ticket**: `Tracking/WAVE03/BUGS.md` row `BUG-W03-145`
> **L2 verify**: `Tracking/WAVE03/verify/BUG-W03-145.verify.md`
> **Feature**: FEAT-CAT-GRP-LIST
> **Boundary**: `garage-web`
> **Severity**: P3
> **Status**: OPEN → RESOLVED
> **Fixed by**: agent-fix-garage-web — 2026-07-03

---

## 1. Failure mode

Nút brand "Thêm Nhóm VT/HH" ở page header của `Danh sách nhóm vật tư hàng hóa` render icon prefix `<Plus>` từ `lucide-react` — visual (stroke, corners) khác Figma DEV spec `wave03-cat-grp-list.md` §Icon Catalog + §1 Layout DSL L203 (`icon_leading: { source: lucide-react, name: "add" }` — vuesax/linear/add layer). Không đồng nhất với nút "Thêm sản phẩm" ở màn Danh sách sản phẩm (dùng `<Add>` iconsax-reactjs).

## 2. Root cause

`MaterialGroupListPage.tsx` L4 import `Plus` từ `lucide-react` + L209 render `<Plus className="w-4 h-4 mr-2" />`. Nhánh khác `InternalProductListPage.tsx` (nút "Thêm sản phẩm") đã đúng pattern `<Add size={16} className="mr-2" />` từ `iconsax-reactjs` (vuesax family — khớp Figma layer `vuesax/linear/add`).

Spec §Icon Catalog nói alias là lucide `<Plus>` nhưng đã có drift trong wave03 default pattern: các nút Thêm khác đều đã dùng iconsax `<Add>` (vuesax family) — đây là source of truth de-facto cho wave03 (BUG-W03-125-family default-pattern audit).

## 3. Fix

`frontend/gf-gms-web/src/features/inventory-catalog/material-group/components/MaterialGroupListPage.tsx`:

- L3: `import { Edit, Trash } from "iconsax-reactjs";` → `import { Add, Edit, Trash } from "iconsax-reactjs";`
- L4: xóa `import { Plus } from "lucide-react";`
- L209: `<Plus className="w-4 h-4 mr-2" />` → `<Add size={16} className="mr-2" />`

Kết quả: nút "Thêm Nhóm VT/HH" giờ dùng chung icon `<Add>` iconsax với nút "Thêm sản phẩm" — visual đồng nhất, khớp Figma vuesax/linear/add.

## 4. Regression / verify

- `npx eslint` PASS trên MaterialGroupListPage.tsx.
- TypeScript build 0 errors.
- Manual QC: mở màn Danh sách nhóm vật tư — inspect element icon `+` → svg từ iconsax (không phải lucide), size=16px, stroke match Figma spec.
- Side-by-side với nút "Thêm sản phẩm" → cùng visual identity.

## 5. Files touched

- `frontend/gf-gms-web/src/features/inventory-catalog/material-group/components/MaterialGroupListPage.tsx`

## 6. Follow-ups

- Nếu design system muốn chuẩn hoá về lucide-react theo spec §Icon Catalog, cần Business Authority ratify + orchestrator update `wave03-cat-grp-list.md` §Icon Catalog + swap toàn bộ button "Thêm *" trong app. Session này giữ đồng nhất với sibling pattern hiện tại (iconsax) — không escalate.

## 7. Retro fields

- `agent_origin`: agent-dev-garage-web (dev khi impl MaterialGroupListPage đã dùng library khác với sibling).
- `root_cause_category`: checklist (không diff với sibling implementation trước khi choose icon library).
- `recurrence_of`: null (chưa có W03 bug icon library drift cùng dạng).
