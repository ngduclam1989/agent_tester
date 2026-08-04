---
type: feature
artifact_kind: feature
status: PLANNED
version: 7
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-OPENING-BALANCE"
boundary: "gf-inventory"
last_reviewed: "2026-07-07"
---

# FEAT-OB-DELETE-LINES: Xóa dòng tồn đầu kỳ đã chọn

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-OB-DELETE-LINES` |
| Title | Xóa dòng tồn đầu kỳ đã chọn |
| Parent Epic | `EP-INVENTORY-OPENING-BALANCE` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xóa nhiều dòng tồn đầu kỳ đã chọn, **so that** tôi loại bỏ dữ liệu tồn khởi đầu nhập sai — đồng thời hệ thống ngăn xóa dòng thuộc kỳ đã khóa hoặc dòng mà việc xóa làm tồn kho âm.

## 2. Acceptance Criteria

### Nhóm A — Xác nhận xóa

- [ ] **AC-1**: Mở popup xác nhận
  - Tại: danh sách tồn đầu kỳ, sau khi chọn ≥ 1 dòng, nút **"Xóa dòng đã chọn"**.
  - Khi: chủ garage nhấn và **tất cả** dòng đã chọn đều thỏa guardrail (không thuộc kỳ đã khóa; xóa không làm tồn âm).
  - Thì: hệ thống hiển thị popup **"Xác nhận"** với nội dung **"Bạn có chắc chắn muốn xóa các dòng tồn đầu kỳ đã chọn không?"**, nút **"Xóa"** và **"Hủy"**.

- [ ] **AC-2**: Thực hiện xóa
  - Tại: popup, nút **"Xóa"**.
  - Khi: chủ garage xác nhận.
  - Thì: hệ thống xóa các dòng đã chọn, hiển thị thông báo thành công, cập nhật danh sách + dòng Tổng.

- [ ] **AC-3**: Hủy xóa
  - Tại: popup, nút **"Hủy"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống đóng popup, không xóa.

### Nhóm B — Chặn xóa (guardrail)

- [ ] **AC-4**: Chặn khi thuộc kỳ đã khóa hoặc làm tồn âm
  - Tại: thao tác **"Xóa dòng đã chọn"**.
  - Khi: trong các dòng đã chọn có **ít nhất một** dòng vi phạm:
    - Dòng có **"Tồn đến ngày" thuộc kỳ kế toán đã đóng (khóa)**, **hoặc**
    - Việc xóa dòng làm **tồn kho của (mã sản phẩm + kho) xuống < 0**.
  - Thì: hệ thống hiển thị popup **"Không thể xóa"** với nội dung **"Một số dòng tồn đầu kỳ thuộc kỳ kế toán đã khóa, hoặc việc xóa làm tồn kho xuống âm, nên không được xóa."**, chỉ có nút **"Đóng"**, và **không xóa dòng nào** (chặn cả lô). (KHÔNG chặn chỉ vì "có phiếu xuất" — xem AC-5 / BR-OB-DEL-003.)
  - **Thứ tự mã lỗi** (khi 1 dòng vi phạm cả 2): kỳ đóng (**`ERR-INV-024`**) trước → tồn âm (**`ERR-INV-036`**) sau. Mỗi dòng chỉ báo **1 mã lỗi** (mã đầu tiên vi phạm). Xem BR-OB-DEL-005.

- [ ] **AC-5**: Quy tắc tồn ≥ 0 (làm rõ)
  - Tại: kiểm tra guardrail tồn.
  - Khi: dòng tồn đầu kỳ đã được dùng cho phiếu xuất kho **nhưng** đã có phiếu nhập kho bù đủ — tức sau khi xóa tồn đầu kỳ, tồn của (mã + kho) vẫn **≥ 0**.
  - Thì: hệ thống **cho phép xóa** (không chặn chỉ vì "có phiếu xuất"; chỉ chặn khi xóa làm tồn âm).

### Nhóm C — Phân quyền

- [ ] **AC-6**: Phân quyền xóa
  - Tại: danh sách tồn đầu kỳ.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò xóa được với quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14492-89264&t=W7XJPVvhmdBPtv2c-4 |

- Luồng: [UX-FLOW-INVENTORY-OPENING-BALANCE](../ux/UX-FLOW-INVENTORY-OPENING-BALANCE.md) §3, EC-12.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Xóa nhiều dòng (kiểm tra guardrail): Mutation `[PROPOSED] DeleteOpeningBalanceLines`.

## 5. Business Rules

- **BR-OB-DEL-001**: Xóa nhiều dòng qua checkbox + nút "Xóa dòng đã chọn".
- **BR-OB-DEL-002**: Chặn xóa dòng thuộc kỳ kế toán đã đóng — `ERR-INV-024`.
- **BR-OB-DEL-003**: Chặn xóa nếu làm tồn (mã + kho) < 0 (không chặn theo "có phiếu xuất hay không") — `ERR-INV-036`.
- **BR-OB-DEL-004**: Một số dòng vi phạm → chặn cả lô, không xóa partial.
- **BR-OB-DEL-005**: Thứ tự bắn mã lỗi khi 1 dòng vi phạm cả 2 điều kiện — kỳ đóng (`ERR-INV-024`) trước, tồn âm (`ERR-INV-036`) sau. Mỗi dòng chỉ báo 1 mã lỗi.
- **Cập nhật sổ tồn**: xóa dòng OB → **tính lại (cascade forward)** SL + giá trị sổ tồn của (mã+kho) từ "Tồn đến ngày" của OB trở đi (cơ chế lưu tồn — xem BR-STKV2-001) → báo cáo tồn/NXT cập nhật theo.

## 6. Edge Cases

- **EC-1**: Chọn 1 lô lớn có cả dòng hợp lệ + dòng vi phạm → chặn toàn bộ, báo "Không thể xóa".
- **EC-2**: Dòng đủ điều kiện xóa nhưng phiên khác vừa đóng kỳ / phát sinh xuất kho làm tồn âm → kiểm tra lại tại thời điểm xóa, chuyển sang popup "Không thể xóa".
- **EC-3**: Xóa OB thành công → hệ thống **tính lại sổ tồn (cascade)** của (mã+kho) từ "Tồn đến ngày" trở đi; báo cáo tồn/NXT cập nhật theo.

## 7. Out of Scope

- Import tồn đầu kỳ → xem `FEAT-OB-IMPORT`.
- Danh sách → xem `FEAT-OB-LIST`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-OB-DELETE-LINES (mới) — xóa nhiều dòng theo checkbox; chặn nếu thuộc kỳ đã khóa hoặc xóa làm tồn (mã+kho) < 0; chặn cả lô khi một số dòng vi phạm. |
| 2026-06-15 | 2 | Business Authority | Rà completeness (B3): sửa wording popup "Không thể xóa" AC-4 — bỏ câu sai "đã phát sinh phiếu xuất kho", đổi thành "thuộc kỳ đã khóa hoặc việc xóa làm tồn âm" cho khớp BR-OB-DEL-003. |
| 2026-06-15 | 3 | Business Authority | Rà lỗ hổng (Nhóm C-9): bổ sung **cascade sổ tồn khi xóa OB** (§5 + EC-3) — xóa OB tính lại SL/giá trị sổ tồn từ "Tồn đến ngày" trở đi → báo cáo cập nhật. |
| 2026-06-16 | 4 | Business Authority | Fix: sửa tham chiếu UX edge-case EC-7 → EC-12 (case xóa dòng tồn đầu kỳ bị chặn). |
| 2026-06-16 | 5 | Business Authority | Gỡ con trỏ §6 EC tới `Plan/INVENTORY-V2-RULES.md` §7.1 (note file sắp xóa) → đổi sang BR-STKV2-001. |
| 2026-06-26 | 6 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14492-89264`. Mobile chưa có. |
| 2026-07-07 | 7 | Business Authority (in-session, user ninhnguyen) | **Chốt thứ tự mã lỗi ở AC-4**: kỳ đóng (`ERR-INV-024`) trước → tồn âm (`ERR-INV-036`) sau; mỗi dòng chỉ báo 1 mã lỗi. §5 gắn mã lỗi vào BR-OB-DEL-002/003 + thêm BR-OB-DEL-005 (thứ tự bắn mã lỗi). Đồng bộ BR-GF-INVENTORY-OPENING-BALANCE v13. |
