---
type: feature
artifact_kind: feature
status: PLANNED
version: 9
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-RECEIPT-V2"
boundary: "gf-inventory"
last_reviewed: "2026-06-26"
supersedes: "FEAT-IR-DETAIL"
---

# FEAT-IR-DETAIL-V2: Chi tiết phiếu nhập kho (V2)

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-IR-DETAIL-V2` |
| Title | Chi tiết phiếu nhập kho (V2) |
| Parent Epic | `EP-INVENTORY-RECEIPT-V2` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |
| Depends on | `EP-INVENTORY-ACCOUNTING-PERIOD` (lock kỳ), `EP-INVENTORY-STOCK-V2` (ghi sổ → biến động tồn) |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết phiếu nhập kho và thực hiện ghi sổ / bỏ ghi sổ / sửa / xóa / in, **so that** tôi kiểm soát vòng đời phiếu và tác động tồn kho.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị chi tiết

- [ ] **AC-1**: Mở màn chi tiết
  - Tại: danh sách, nhấn Số phiếu.
  - Khi: chủ garage chọn xem.
  - Thì: hệ thống mở màn **"Chi tiết phiếu nhập kho [số phiếu]"** với mô tả **"Dạng xem phiếu đã ghi sổ, giữ layout theo mẫu popup phiếu nhập."**, header read-only + tab **CHI TIẾT** / **ĐÍNH KÈM**, sidebar Tổng giá trị, các nút hành động.

- [ ] **AC-2**: Thông tin hiển thị
  - Tại: header + tab chi tiết.
  - Thì: hệ thống hiển thị read-only toàn bộ trường header (Loại phiếu, Mã đơn hàng, Mã lô hàng, Đối tượng, Người phụ trách, Người giao hàng, Kho nhập, Diễn giải, Số phiếu, Ngày nhập kho, Trạng thái) + bảng dòng chi tiết (SKU, mã nội bộ, ĐVT nhập, SL nhập, SL quy đổi, ĐVT chính, đơn giá nhập, thành tiền, kho, ghi chú) + dòng Tổng.

- [ ] **AC-3**: Thông tin audit
  - Tại: cuối màn.
  - Thì: hệ thống hiển thị Ngày tạo / Người tạo / Ngày sửa / Người sửa.

### Nhóm B — Ẩn/hiện nút theo trạng thái & kỳ

- [ ] **AC-4**: Ẩn/hiện nút hành động
  - Tại: thanh nút đầu màn chi tiết.
  - Khi: phiếu **"Nháp"** và kỳ kế toán **chưa khóa**.
  - Thì: hệ thống hiển thị **"Sửa"**, **"Xóa"**, **"Ghi sổ kho"** (ẩn "Bỏ ghi sổ kho").
  - Khi: phiếu **"Ghi sổ kho"** và kỳ kế toán **chưa khóa**.
  - Thì: hệ thống hiển thị **"Sửa"**, **"Xóa"**, **"Bỏ ghi sổ kho"** (ẩn "Ghi sổ kho").
  - Khi: ngày chứng từ phiếu thuộc **kỳ kế toán đã khóa**.
  - Thì: hệ thống **ẩn các nút thao tác (Sửa / Xóa / Ghi sổ kho / Bỏ ghi sổ kho)**.
  - Khi: bất kỳ trạng thái / kỳ nào.
  - Thì: **"In phiếu nhập"** **luôn hiển thị** (không phụ thuộc trạng thái hay kỳ).

### Nhóm C — Hành động ghi sổ

- [ ] **AC-5**: Ghi sổ kho
  - Tại: nút **"Ghi sổ kho"** (phiếu đang Nháp).
  - Khi: chủ garage nhấn.
  - Thì: hệ thống cộng tồn theo SL quy đổi cho từng (mã + kho + gara), chuyển trạng thái **"Ghi sổ kho"**. Trước khi cộng: **bắt buộc mọi dòng có mã nội bộ** (BR-IRV2-028 — phiếu Nền tảng còn dòng chỉ có SKU → chặn `ERR-INV-011`) + **check tồn âm** (chặn nếu vi phạm) + **lock kỳ** (chặn nếu kỳ đã đóng).

- [ ] **AC-6**: Bỏ ghi sổ kho
  - Tại: nút **"Bỏ ghi sổ kho"** (phiếu đang Ghi sổ kho).
  - Khi: chủ garage nhấn.
  - Thì: hệ thống trừ tồn đã cộng, đưa phiếu về **"Nháp"**. Nếu việc trừ làm tồn âm ở thời điểm về sau hoặc kỳ đã đóng → chặn.

### Nhóm D — Sửa / Xóa / In

- [ ] **AC-7**: Các nút hành động
  - Tại: đầu màn chi tiết.
  - Khi: chủ garage nhấn (nút hiển thị theo AC-4).
  - Thì: **"Sửa"** → `FEAT-IR-EDIT-V2`; **"Xóa"** → `FEAT-IR-DELETE`; **"In phiếu nhập"** → `FEAT-IR-PRINT`.

### Nhóm E — Phân quyền

- [ ] **AC-8**: Phân quyền
  - Tại: màn chi tiết.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò xem và thao tác với quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87557&t=W7XJPVvhmdBPtv2c-4 |
| Figma | mobile | https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21629-24082&t=30dKkXMi0PSOdK7b-4 |

- Luồng: [UX-FLOW-INVENTORY-RECEIPT-V2](../ux/UX-FLOW-INVENTORY-RECEIPT-V2.md) §3.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Chi tiết phiếu: Query `[PROPOSED] GetReceiptV2`.
- Ghi sổ / bỏ ghi sổ: Mutation `[PROPOSED] PostReceiptV2` / `[PROPOSED] UnpostReceiptV2`.

## 5. Business Rules

- **BR-IRV2-002**: Vòng đời Nháp → Ghi sổ kho → Bỏ ghi sổ kho.
- **BR-IRV2-003 / 004**: Ghi sổ cộng tồn / bỏ ghi sổ trừ tồn.
- **BR-IRV2-007**: Lock kỳ đã đóng.
- **BR-IRV2-008**: Chặn tồn âm point-in-time.
- **BR-IRV2-022**: Hiển thị audit.

## 6. Edge Cases

- **EC-1**: Bỏ ghi sổ làm tồn âm về sau → chặn.
- **EC-2**: Phiếu thuộc kỳ đã đóng → các hành động ghi sổ/bỏ ghi sổ/sửa/xóa bị chặn.

## 7. Out of Scope

- Chỉnh sửa → `FEAT-IR-EDIT-V2`. Xóa → `FEAT-IR-DELETE`. In → `FEAT-IR-PRINT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-IR-DETAIL-V2 (V2 của FEAT-IR-DETAIL) — xem phiếu + Ghi sổ kho / Bỏ ghi sổ kho (cộng/trừ tồn, check tồn âm + lock kỳ) + Sửa/Xóa/In; audit. Thêm AC-4 ẩn/hiện nút theo trạng thái + kỳ (Nháp: Sửa/Xóa/Ghi sổ; Ghi sổ kho: Sửa/Xóa/Bỏ ghi sổ — kỳ chưa khóa; kỳ đã khóa ẩn nút thao tác; In luôn hiện). |
| 2026-06-10 | 2 | Business Authority | Thêm §0 Δ Thay đổi so với V1 (map 8 AC ↔ V1, note bỏ "Hủy phiếu" V1 → thay bằng Xóa; "Hoàn tất"/"Hoàn tác" → "Ghi sổ"/"Bỏ ghi sổ") + gắn tag [GIỮ]/[ĐỔI]/[MỚI] + con trỏ lineage `← FEAT-IR-DETAIL AC-n` vào từng AC (để agent truy vết). |
| 2026-06-10 | 3 | Business Authority | Thêm khung **CR** giống mẫu: Metadata (Loại thay đổi CR / Màn hình target FEAT-IR-DETAIL / Depends on) + section **§0 Bối cảnh thay đổi (Change Request — DEV đọc trước)**; bảng Δ chuyển xuống §0.1. |
| 2026-06-10 | 4 | Business Authority | AC-5 (Ghi sổ kho): thêm điều kiện **bắt buộc mọi dòng có mã nội bộ** trước khi cộng tồn (BR-IRV2-028, `INTERNAL_PRODUCT_REQUIRED`) — phiếu Nền tảng còn dòng chỉ có SKU thì chặn. |
| 2026-06-10 | 5 | Business Authority | Gỡ khung mapping V1↔V2 (CR, §0 Bối cảnh, bảng Δ, lineage tags) — spec V2 đứng độc lập; giữ nguyên toàn bộ nội dung nghiệp vụ. |
| 2026-06-16 | 6 | Business Authority | Fix (quyết định BA — ý f): AC-4 kỳ đã khóa → **nút "Sửa" vẫn hiển thị** (mở form được, chặn khi Lưu — FEAT-IR-EDIT-V2 AC-2); chỉ ẩn Xóa/Ghi sổ/Bỏ ghi sổ. Đồng bộ BR-IRV2-024. |
| 2026-06-16 | 7 | Business Authority | Đăng ký mã lỗi: đổi mã bare → ERR-INV-NNN (ERROR-CODE-REGISTRY §4). |
| 2026-06-16 | 8 | Business Authority | Fix (quyết định BA cuối): kỳ đã khóa → ẩn nút Sửa (đảo lại "Sửa vẫn hiện"); làm rõ Thêm mới chặn khi Lưu (BR-IRV2-007). Guard Lưu = phòng vệ. |
| 2026-06-26 | 9 | Business Authority | **Gắn Figma web + mobile vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14146-87557`, mobile node `21629-24082`. |
