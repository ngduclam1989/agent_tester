---
type: feature
artifact_kind: feature
status: PLANNED
version: 5
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-RECEIPT-V2"
boundary: "gf-inventory"
last_reviewed: "2026-06-26"
---

# FEAT-IR-DELETE: Xóa phiếu nhập kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-IR-DELETE` |
| Title | Xóa phiếu nhập kho |
| Parent Epic | `EP-INVENTORY-RECEIPT-V2` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |
| Depends on | `EP-INVENTORY-ACCOUNTING-PERIOD` (lock kỳ), `EP-INVENTORY-STOCK-V2` (tính lại tồn) |

## 1. User Story

**As** chủ garage / kế toán, **I want** xóa phiếu nhập kho nhập sai, **so that** dữ liệu sạch — đồng thời hệ thống tính lại tồn và ngăn xóa khi làm tồn âm hoặc thuộc kỳ đã khóa.

## 2. Acceptance Criteria

### Nhóm A — Xác nhận xóa

- [ ] **AC-1**: Mở popup xác nhận
  - Tại: danh sách (icon Xóa) hoặc chi tiết (nút **"Xóa"**).
  - Khi: chủ garage xóa một phiếu thỏa điều kiện (không thuộc kỳ đã khóa; xóa không làm tồn âm).
  - Thì: hệ thống hiển thị popup xác nhận **"Bạn có chắc chắn muốn xóa phiếu nhập kho [số phiếu] không?"**, nút **"Xóa"** / **"Hủy"**.

- [ ] **AC-2**: Thực hiện xóa + tính lại tồn
  - Tại: popup, nút **"Xóa"**.
  - Khi: chủ garage xác nhận.
  - Thì: hệ thống xóa phiếu; nếu phiếu **đã Ghi sổ kho** → trừ tồn đã cộng và **tính lại tồn** theo (mã + kho + gara). Hiển thị thông báo thành công.

- [ ] **AC-3**: Hủy
  - Tại: popup, nút **"Hủy"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống đóng popup, không xóa.

### Nhóm B — Chặn xóa

- [ ] **AC-4**: Chặn khi kỳ đã khóa
  - Tại: thao tác xóa.
  - Khi: phiếu có ngày chứng từ thuộc **kỳ kế toán đã đóng**.
  - Thì: hệ thống chặn, báo lỗi **"kỳ đã khóa"**.

- [ ] **AC-5**: Chặn khi làm tồn âm
  - Tại: thao tác xóa phiếu đã Ghi sổ kho.
  - Khi: việc xóa (trừ tồn đã cộng) làm **tồn (mã + kho + gara) < 0 tại bất kỳ thời điểm nào** từ ngày chứng từ trở đi (vd tồn đã bị phiếu xuất sau đó tiêu thụ).
  - Thì: hệ thống chặn, báo lỗi tồn âm.

### Nhóm C — Phân quyền

- [ ] **AC-6**: Phân quyền
  - Tại: danh sách / chi tiết.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò xóa được với quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14492-89260&t=W7XJPVvhmdBPtv2c-4 |

- Luồng: [UX-FLOW-INVENTORY-RECEIPT-V2](../ux/UX-FLOW-INVENTORY-RECEIPT-V2.md) §3, EC-1/EC-2.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Xóa phiếu: Mutation `[PROPOSED] DeleteReceiptV2`.

## 5. Business Rules

- **BR-IRV2-006**: Xóa phiếu → tính lại tồn.
- **BR-IRV2-007**: Chặn khi kỳ đã khóa.
- **BR-IRV2-008**: Chặn nếu xóa làm tồn âm (point-in-time).

## 6. Edge Cases

- **EC-1**: Xóa phiếu Nháp → không tác động tồn (chưa cộng).
- **EC-2**: Xóa phiếu Ghi sổ kho mà tồn đã bị xuất tiêu thụ → trừ tồn làm âm → chặn.
- **EC-3**: Phiếu thuộc kỳ đã đóng → chặn.

## 7. Out of Scope

- Sửa phiếu → `FEAT-IR-EDIT-V2`. Bỏ ghi sổ (thay vì xóa) → `FEAT-IR-DETAIL-V2`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-IR-DELETE (mới) — xóa phiếu nhập kho + tính lại tồn; chặn khi kỳ đã khóa hoặc xóa làm tồn âm point-in-time. |
| 2026-06-10 | 2 | Business Authority | Thêm §0 Δ Thay đổi so với V1 (feature mới — V1 dùng "Hủy phiếu" trong DETAIL, V2 thay bằng Xóa cứng) + gắn tag [MỚI] + con trỏ lineage `← thay FEAT-IR-DETAIL AC-10` cho AC-1/2 (để agent truy vết nguồn gốc). |
| 2026-06-10 | 3 | Business Authority | Thêm khung **CR** giống mẫu: Metadata (Loại thay đổi CR / Màn hình target FEAT-IR-DETAIL / Depends on) + section **§0 Bối cảnh thay đổi (Change Request — DEV đọc trước)**; bảng Δ chuyển xuống §0.1. |
| 2026-06-10 | 4 | Business Authority | Gỡ khung mapping V1↔V2 (CR, §0 Bối cảnh, bảng Δ, lineage tags) — spec V2 đứng độc lập; giữ nguyên toàn bộ nội dung nghiệp vụ. |
| 2026-06-26 | 5 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14492-89260`. Mobile chưa có. |
