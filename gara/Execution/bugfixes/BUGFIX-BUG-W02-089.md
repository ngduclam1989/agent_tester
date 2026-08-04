# BUGFIX-BUG-W02-089 — Màn Tạo phiếu QT: "Phân bổ Bảo hiểm" thiếu/sai dấu

> L3 sửa lỗi cho `BUG-W02-089` (P2). Boundary: `garage-mobile`. Feature: `FEAT-INS-STL-CREATE`.
> Trạng thái: ⚠️ **CHƯA FIX — BLOCKED** chờ BA chốt hướng dấu (xem §4). Đã root-cause + có patch sẵn.
> ⚠️ KHÔNG cập nhật `Tracking/WAVE02/BUGS.md` (orchestrator giữ).

## 1. Hiện tượng

Màn "Tạo phiếu quyết toán" (SO có BH): section "Phân bổ Bảo hiểm" hiển thị 5 khoản **KHÔNG có dấu** +/− (chỉ số tiền trơn). Đúng ra (BR §7.1): 2 khoản "CK liên kết BH" (Vật tư/Công DV) = `−`; 3 khoản (Giảm trừ bồi thường / Khấu hao / Khấu trừ BH) = `+` → panel = `− − + + +`.

## 2. Root cause

`settlement_create_page.dart:92` truyền `hideSign: true` cho `InsuranceSettlementDetailView` → `InsuranceTotalPanel._allocationRow` nhánh `if (hideSign)` → render không prefix dấu cho cả 5 khoản.

## 3. Patch đề xuất (1 dòng)

```diff
@@ settlement_create_page.dart:92
-                  child: InsuranceSettlementDetailView(snapshot: cubit.insuranceSnapshot, hideSign: true),
+                  child: InsuranceSettlementDetailView(snapshot: cubit.insuranceSnapshot),
```
Bỏ `hideSign` → section hiện dấu. `hideSign` CHỈ ảnh hưởng `_allocationRow` (không đụng block khác của panel).

## 4. ⚠️ BLOCKED — mâu thuẫn hướng dấu (cần BA chốt)

Khi bỏ `hideSign`, DẤU hiện ra phụ thuộc hướng đã cài trong panel `_allocationRow`:

| Nguồn | Ngày | Hướng cho phiếu QT |
|---|---|---|
| `089.verify` (BA test thủ công) | 24-06 | `− − + + +` cố định |
| `BUGFIX-BUG-W02-086.md` §0/§5 (BA chốt) | 25-06 | side-dependent (tab KH=`+ + + + +`, BH=`− − − − −`) |

HEAD hiện tại (commit `bf5c30d6`) panel đi theo **side-dependent** (`fixedAllocationSign` chỉ bật cho SO; settlement không bật → side-dependent). ⇒ nếu bỏ `hideSign` bây giờ, màn Tạo sẽ ra **side-dependent**, KHÔNG phải `− − + + +` như `089.verify`.

→ **Cần BA chốt:**
- (a) **global `− − + + +`** (theo 089.verify): bỏ `hideSign` + đưa settlement về dấu cố định theo `reducesInsurance` (gỡ/đổi nhánh `fixedAllocationSign`), hoặc
- (b) **side-dependent** (theo 086 v3): chỉ bỏ `hideSign`, chấp nhận dấu đổi theo tab.

## 5. Regression test (khi unblock)

Tùy hướng chốt: assert section "Phân bổ Bảo hiểm" màn Tạo = `− − + + +` (global) HOẶC side-dependent theo tab. Pump `SettlementCreatePage` (nhận order qua ctor, pump OK) hoặc `InsuranceSettlementDetailView` không `hideSign`.

## Change Log

| Ngày | Phiên bản | Tác giả | Mô tả |
|---|---|---|---|
| 2026-06-25 | 1 | agent-fix-garage-mobile | Root-cause (`create:92 hideSign:true`) + patch 1 dòng. **BLOCKED** chờ BA chốt global `− − + + +` vs side-dependent (mâu thuẫn 089.verify vs BUGFIX-086 v3). Chưa áp. |
