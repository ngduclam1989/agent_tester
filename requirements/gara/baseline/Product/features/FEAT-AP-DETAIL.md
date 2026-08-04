---
type: feature
artifact_kind: feature
status: PLANNED
version: 5
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
boundary: "gf-accounting"
last_reviewed: "2026-07-07"
---

# FEAT-AP-DETAIL: Chi tiết kỳ kế toán

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-AP-DETAIL` |
| Title | Chi tiết kỳ kế toán |
| Parent Epic | `EP-INVENTORY-ACCOUNTING-PERIOD` |
| Boundary | `gf-accounting` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem thông tin chi tiết một kỳ kế toán cùng thông tin tạo/sửa, **so that** tôi nắm được nội dung và trạng thái đóng/mở của kỳ trước khi chỉnh sửa hoặc xóa.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị chi tiết

- [ ] **AC-1**: Mở màn xem chi tiết
  - Tại: danh sách, icon **Xem** ở cột Thao tác.
  - Khi: chủ garage chọn xem một kỳ.
  - Thì: hệ thống mở màn **"Chi tiết kỳ kế toán [loại]"** (vd "Chi tiết kỳ kế toán năm") với mô tả **"Xem thông tin kỳ kế toán [loại] ở trạng thái read-only."**, mục **"Thông tin chung"** chỉ đọc, nút **"Chỉnh sửa"** (góc trên bên phải) và **icon back "←"** ở tiêu đề để quay về danh sách. **KHÔNG có nút "Đóng"** riêng.

- [ ] **AC-2**: Các trường hiển thị
  - Tại: mục **"Thông tin chung"**.
  - Khi: màn được render.
  - Thì: hệ thống hiển thị (read-only): **"Loại kỳ"**, **"Tên kỳ kế toán"**, **"Thuộc kỳ"** (với quý/tháng), **"Ngày bắt đầu"**, **"Ngày kết thúc"**, **"Thứ tự hiển thị"**, **"Trạng thái"**, **"Mô tả"**.

- [ ] **AC-3**: Thông tin audit
  - Tại: cuối màn chi tiết.
  - Khi: màn được render.
  - Thì: hệ thống hiển thị: **"Ngày tạo"**, **"Người tạo"**, **"Ngày sửa"**, **"Người sửa"** — **áp dụng cho cả 3 loại kỳ** (Năm/Quý/Tháng). **"Ngày sửa"/"Người sửa"** hiển thị giá trị khi kỳ đã từng được chỉnh sửa; kỳ **chưa từng sửa** → 2 field vẫn hiển thị label + giá trị trống (dấu **"—"** hoặc để rỗng theo pattern shadcn) — KHÔNG ẩn field. (Figma ảnh 1 kỳ năm không hiển thị 2 field vì đang là empty state chưa từng sửa, không phải cố ý bỏ.)

### Nhóm B — Hành động

- [ ] **AC-4**: Chuyển sang chỉnh sửa
  - Tại: nút **"Chỉnh sửa"** (góc trên bên phải).
  - Khi: chủ garage nhấn.
  - Thì: hệ thống chuyển sang form chỉnh sửa kỳ (`FEAT-AP-EDIT`).

- [ ] **AC-5**: Quay về danh sách
  - Tại: **icon back "←"** ở tiêu đề màn chi tiết.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống đóng màn chi tiết, quay về danh sách kỳ kế toán. *(Không có nút "Đóng" riêng — điều hướng bằng arrow back theo Figma.)*

### Nhóm C — Phân quyền

- [ ] **AC-6**: Phân quyền xem
  - Tại: màn chi tiết kỳ.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò xem được với quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87552&t=W7XJPVvhmdBPtv2c-4 |

- Luồng: [UX-FLOW-INVENTORY-ACCOUNTING-PERIOD](../ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md) §3.

## 4. API Reference

- Boundary: `gf-accounting` (qua BFF `agg-garage-graph`).
- Lấy chi tiết kỳ: Query `[PROPOSED] GetAccountingPeriod`.

## 5. Business Rules

- **BR-AP-CMN-001**: Hiển thị thông tin audit (ngày/người tạo, ngày/người sửa).
- **BR-AP-010**: Trạng thái đóng kỳ 2 giá trị.

## 6. Edge Cases

- **EC-1**: Kỳ đã bị xóa bởi phiên khác → hiển thị thông báo không tìm thấy khi mở.

## 7. Out of Scope

- Chỉnh sửa / đóng-mở kỳ → xem `FEAT-AP-EDIT`.
- Xóa kỳ → xem `FEAT-AP-DELETE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-AP-DETAIL (mới) — màn xem chi tiết kỳ kế toán read-only theo loại (năm/quý/tháng) + thông tin audit, nút Sửa/Đóng. |
| 2026-06-26 | 2 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14146-87552`. Mobile chưa có. |
| 2026-07-03 | 3 | Business Authority | **Đồng bộ wording labels + buttons theo Figma** (rà soát wave 3): AC-1 tiêu đề "Xem Kỳ kế toán [loại]" → **"Chi tiết kỳ kế toán [loại]"**, nút "Sửa" → **"Chỉnh sửa"**, **bỏ nút "Đóng"** — điều hướng quay lại bằng icon back "←" ở tiêu đề; AC-2 field "Đã đóng kỳ" → **"Trạng thái"**; AC-4 nút "Sửa" → **"Chỉnh sửa"**; AC-5 rewrite — "nút Đóng" → **"icon back ←"** ở tiêu đề. **Follow-up NEED CONFIRMATION**: Figma ảnh 1 (chi tiết kỳ năm) KHÔNG hiển thị "Ngày sửa"/"Người sửa" — có phải ẩn khi chưa từng sửa, hay chi tiết kỳ năm cố ý bỏ 2 field này (khác quý/tháng)? |
| 2026-07-07 | 4 | Business Authority + Senior PM | **Move boundary**: frontmatter `gf-inventory` → `gf-accounting`. Rationale: Kỳ kế toán (AP) thuộc nghiệp vụ kế toán — khớp SAP FI-CO / Misa / Fast / Odoo. OB + Sổ tồn giữ ở `gf-inventory`. Ref EP-INVENTORY-ACCOUNTING-PERIOD v16. Nội dung AC/BR không đổi. |
| 2026-07-07 | 5 | Business Authority (in-session, user ninhnguyen) | **Resolve NEED CONFIRMATION v3** — chốt: kỳ **Năm CÓ hiển thị "Ngày sửa"/"Người sửa"** giống Quý/Tháng (áp dụng cả 3 loại kỳ). Figma ảnh 1 kỳ năm không hiện 2 field vì kỳ đó ở empty state (chưa từng sửa), không phải cố ý bỏ khỏi loại kỳ Năm. AC-3 rewrite: hiển thị 4 field audit đầy đủ; khi chưa từng sửa → 2 field "Ngày sửa"/"Người sửa" hiển thị label + giá trị trống ("—" hoặc rỗng), KHÔNG ẩn field. Đóng follow-up v3. |
