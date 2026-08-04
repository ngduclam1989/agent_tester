# BUGFIX — BUG-W03-179

> [Danh sách sản phẩm][Bộ lọc Nhóm hàng] Filter chỉ hiển thị nhóm ACTIVE — ẩn mất nhóm INACTIVE đã liên kết với sản phẩm (BR-CAT-PROD-009 bị áp dụng sai phạm vi)
> Severity: **P2** · Boundary: `garage-web` · Status: **FIX_DONE** · Date: 2026-07-07

## 1. Summary

Filter "Nhóm hàng" ở Danh sách sản phẩm chỉ hiển thị nhóm "Đang hoạt động" — nhóm "Ngừng hoạt động" dù đã có sản phẩm gán vào vẫn bị ẩn khỏi dropdown, khiến user không lọc lại được sản phẩm thuộc nhóm đã archive.

## 2. Root cause

Fix trước đó của `BUG-W03-130` thêm `status: MaterialGroupStatus.ACTIVE` vào call `useSearchMaterialGroups` tại `InternalProductListPage.tsx` — đúng phạm vi cho picker Create/Edit (BR-CAT-PROD-009: chỉ hiển thị nhóm ACTIVE khi CHỌN nhóm mới gán cho sản phẩm) nhưng bị áp dụng lan sang filter List, nơi mục đích là LỌC LẠI sản phẩm đã có theo nhóm (bất kể nhóm hiện đang active hay archived).

## 3. Fix

Chọn hướng (B) theo khuyến nghị verify doc (đơn giản, FE-only, không cần BE): `src/features/inventory-catalog/internal-product/components/InternalProductListPage.tsx` — bỏ tham số `status: MaterialGroupStatus.ACTIVE` khỏi call `useSearchMaterialGroups` dùng cho filter List (đồng thời loại bỏ import `MaterialGroupStatus` không còn dùng trong file). Picker Create/Edit sản phẩm nằm ở component/hook khác (không đụng), giữ nguyên hành vi chỉ hiển thị nhóm ACTIVE theo `BUG-W03-130`.

## 4. Verify

- `npx tsc --noEmit` — pass.
- `yarn lint` — không lỗi mới.
- Manual: chuẩn bị 1 nhóm VTHH INACTIVE có sản phẩm gán → mở dropdown "Nhóm hàng" ở Danh sách sản phẩm → verify nhóm INACTIVE xuất hiện → chọn → verify bảng lọc đúng sản phẩm thuộc nhóm đó. Verify nhóm ACTIVE vẫn hiển thị (không regression). Verify picker Create/Edit KHÔNG bị ảnh hưởng (vẫn chỉ ACTIVE, code path riêng).

## 5. Blast radius / regression risk

- Chỉ đụng 1 callsite (`InternalProductListPage.tsx`) — picker Create/Edit dùng component/hook riêng, không import gì từ file này.
- Dropdown filter List sẽ dài hơn (bao gồm cả nhóm chưa từng có sản phẩm nào — trade-off đã ghi nhận ở verify doc §3.4 hướng B, chọn nhóm rỗng → empty state đúng theo EC-4, không lỗi).
- Flag cho Business Authority (đã ghi trong verify doc, ngoài phạm vi code fix): `FEAT-CAT-PROD-LIST.md` AC-6 nên bổ sung rõ nguồn dữ liệu populate dropdown "Nhóm hàng" để tránh lặp lại nhầm phạm vi BR trong tương lai.
