---
type: feature
artifact_kind: feature
status: PLANNED
version: 7
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-DELIVERY-V2"
boundary: "gf-inventory"
last_reviewed: "2026-06-26"
supersedes: "FEAT-ID-DETAIL"
---

# FEAT-ID-DETAIL-V2: Chi tiết phiếu xuất kho (V2)

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-ID-DETAIL-V2` |
| Title | Chi tiết phiếu xuất kho (V2) |
| Parent Epic | `EP-INVENTORY-DELIVERY-V2` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết phiếu xuất kho và ghi sổ / bỏ ghi sổ / sửa / xóa / in, **so that** tôi kiểm soát vòng đời phiếu và tác động tồn kho.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị chi tiết

- [ ] **AC-1**: Mở màn chi tiết
  - Tại: danh sách, nhấn Số phiếu.
  - Thì: hệ thống mở màn **"Chi tiết phiếu xuất kho [số phiếu]"** với mô tả **"Dạng xem phiếu đã ghi sổ, action theo trạng thái và quyền."**, header read-only + tab **CHI TIẾT** / **ĐÍNH KÈM**, sidebar Tổng giá trị, các nút hành động.

- [ ] **AC-2**: Thông tin hiển thị
  - Tại: header + tab chi tiết.
  - Thì: hệ thống hiển thị read-only header (Loại phiếu, Mã đơn hàng/SO, Mã lô hàng, Đối tượng, Người phụ trách, Người giao hàng, Kho xuất, Diễn giải, Số phiếu, Ngày xuất kho, Trạng thái) + bảng dòng (SKU, mã nội bộ, SL tồn, SL xuất, SL quy đổi, ĐVT chính, đơn giá vốn, tiền vốn, kho, ghi chú) + dòng Tổng. Tiền vốn = 0 nếu chưa chạy BQGQ; số thực sau khi chạy.

- [ ] **AC-3**: Thông tin audit
  - Tại: cuối màn.
  - Thì: hệ thống hiển thị Ngày tạo / Người tạo / Ngày sửa / Người sửa.

### Nhóm B — Ẩn/hiện nút theo trạng thái & kỳ

- [ ] **AC-4**: Ẩn/hiện nút hành động
  - Tại: thanh nút đầu màn chi tiết.
  - Khi: phiếu **"Nháp"** và kỳ **chưa khóa**.
  - Thì: hiển thị **Sửa**, **Xóa**, **Ghi sổ kho** (ẩn "Bỏ ghi sổ kho").
  - Khi: phiếu **"Ghi sổ kho"** và kỳ **chưa khóa**.
  - Thì: hiển thị **Sửa**, **Xóa**, **Bỏ ghi sổ kho** (ẩn "Ghi sổ kho").
  - Khi: ngày chứng từ thuộc **kỳ đã khóa**.
  - Thì: **ẩn các nút thao tác (Sửa / Xóa / Ghi sổ kho / Bỏ ghi sổ kho)**.
  - Khi: bất kỳ trạng thái / kỳ.
  - Thì: **"In phiếu xuất"** **luôn hiển thị**.

### Nhóm C — Hành động ghi sổ

- [ ] **AC-5**: Ghi sổ kho
  - Tại: nút **"Ghi sổ kho"** (phiếu Nháp).
  - Thì: hệ thống hiển thị popup xác nhận **"Bạn có chắc chắn muốn thực hiện Ghi sổ kho phiếu này hay không?"**; xác nhận → trừ tồn theo SL quy đổi (**bắt buộc mọi dòng có mã nội bộ** — BR-IDV2-028, thiếu → chặn `ERR-INV-011`; check tồn khả dụng + lock kỳ trước khi trừ), chuyển **"Ghi sổ kho"**.

- [ ] **AC-6**: Bỏ ghi sổ kho
  - Tại: nút **"Bỏ ghi sổ kho"** (phiếu Ghi sổ kho).
  - Thì: hệ thống hiển thị popup xác nhận **"Bạn có chắc chắn muốn thực hiện Bỏ ghi sổ kho phiếu này hay không?"**; xác nhận → cộng tồn lại, đưa về **"Nháp"** (chặn nếu kỳ đã đóng).

### Nhóm D — Sửa / Xóa / In

- [ ] **AC-7**: Các nút hành động
  - Tại: đầu màn chi tiết (nút hiển thị theo AC-4).
  - Thì: **"Sửa"** → `FEAT-ID-EDIT-V2`; **"Xóa"** → `FEAT-ID-DELETE`; **"In phiếu xuất"** → `FEAT-ID-PRINT`.

### Nhóm E — Phân quyền

- [ ] **AC-8**: Phân quyền — chủ garage + kế toán quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87563&t=W7XJPVvhmdBPtv2c-4 |
| Figma | mobile | https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21629-28663&t=30dKkXMi0PSOdK7b-4 |

- Luồng: [UX-FLOW-INVENTORY-DELIVERY-V2](../ux/UX-FLOW-INVENTORY-DELIVERY-V2.md) §3, §4.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Chi tiết phiếu: Query `[PROPOSED] GetDeliveryV2`.
- Ghi sổ / bỏ ghi sổ: Mutation `[PROPOSED] PostDeliveryV2` / `[PROPOSED] UnpostDeliveryV2`.

## 5. Business Rules

- **BR-IDV2-002**: Vòng đời Nháp → Ghi sổ kho → Bỏ ghi sổ kho.
- **BR-IDV2-003 / 004 / 005**: Ghi sổ trừ tồn (check tồn khả dụng) / bỏ ghi sổ cộng tồn.
- **BR-IDV2-007**: Lock kỳ đã đóng.
- **BR-IDV2-008**: Giá vốn = 0 đến khi BQGQ.
- **BR-IDV2-009**: Đối soát SO (cảnh báo).
- **BR-IDV2-022**: Audit.
- **BR-IDV2-024**: Ẩn/hiện nút theo trạng thái + kỳ.

## 6. Edge Cases

- **EC-1**: Ghi sổ làm tồn âm → chặn (popup không hoàn tất).
- **EC-2**: Phiếu thuộc kỳ đã đóng → **ẩn các nút thao tác** (Sửa/Xóa/Ghi sổ/Bỏ ghi sổ).

## 7. Out of Scope

- Sửa → `FEAT-ID-EDIT-V2`. Xóa → `FEAT-ID-DELETE`. In → `FEAT-ID-PRINT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-ID-DETAIL-V2 (V2 của FEAT-ID-DETAIL) — xem phiếu + Ghi sổ/Bỏ ghi sổ (popup xác nhận, trừ/cộng tồn, check tồn khả dụng + lock kỳ) + Sửa/Xóa/In; ẩn/hiện nút theo trạng thái + kỳ; giá vốn=0 đến BQGQ; audit. |
| 2026-06-10 | 2 | Business Authority | AC-5 (Ghi sổ kho): thêm điều kiện **bắt buộc mọi dòng có mã nội bộ** trước khi trừ tồn (BR-IDV2-028, `INTERNAL_PRODUCT_REQUIRED`) — phiếu Nền tảng (SO đẩy) còn dòng chỉ có SKU thì chặn. |
| 2026-06-15 | 3 | Business Authority | Đổi nhãn cột **"giá vốn" → "tiền vốn"** ở AC-2 (bảng dòng + ô = 0) — đồng bộ "Tiền vốn". Giữ "đơn giá vốn" và khái niệm "giá vốn xuất". |
| 2026-06-16 | 4 | Business Authority | Fix (quyết định BA — ý f): AC-4 + EC-2 kỳ đã khóa → **nút "Sửa" vẫn hiển thị** (mở form được, chặn khi Lưu — FEAT-ID-EDIT-V2 AC-2); chỉ ẩn Xóa/Ghi sổ/Bỏ ghi sổ. Đồng bộ BR-IDV2-024. |
| 2026-06-16 | 5 | Business Authority | Đăng ký mã lỗi: đổi mã bare → ERR-INV-NNN (ERROR-CODE-REGISTRY §4). |
| 2026-06-16 | 6 | Business Authority | Fix (quyết định BA cuối): kỳ đã khóa → ẩn nút Sửa (đảo lại "Sửa vẫn hiện"); làm rõ Thêm mới chặn khi Lưu (BR-IDV2-007). Guard Lưu = phòng vệ. |
| 2026-06-26 | 7 | Business Authority | **Gắn Figma web + mobile vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14146-87563`, mobile node `21629-28663`. |
