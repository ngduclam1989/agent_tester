---
type: feature
artifact_kind: feature
status: PLANNED
version: 2
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-DELIVERY-V2"
boundary: "gf-inventory"
last_reviewed: "2026-06-26"
---

# FEAT-ID-DELETE: Xóa phiếu xuất kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-ID-DELETE` |
| Title | Xóa phiếu xuất kho |
| Parent Epic | `EP-INVENTORY-DELIVERY-V2` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xóa phiếu xuất kho nhập sai, **so that** dữ liệu sạch — đồng thời hệ thống tính lại tồn và ngăn xóa khi thuộc kỳ đã khóa hoặc làm tồn âm.

## 2. Acceptance Criteria

### Nhóm A — Xác nhận xóa

- [ ] **AC-1**: Mở popup xác nhận
  - Tại: danh sách (icon Xóa) hoặc chi tiết (nút **"Xóa"**).
  - Khi: chủ garage xóa một phiếu (Nháp hoặc Ghi sổ kho) khi **kỳ chưa khóa** và xóa không làm tồn âm.
  - Thì: hệ thống hiển thị popup **"Xác nhận"** với nội dung **"Bạn có chắc chắn muốn xóa phiếu PX-xxxxx không?"**, nút **"Xóa"** / **"Hủy"**.

- [ ] **AC-2**: Thực hiện xóa + tính lại tồn
  - Tại: popup, nút **"Xóa"**.
  - Khi: chủ garage xác nhận.
  - Thì: hệ thống xóa phiếu; nếu phiếu **đã Ghi sổ kho** → cộng tồn lại (đảo phần đã trừ) và tính lại tồn. Hiển thị thông báo thành công.

- [ ] **AC-3**: Hủy — nút **"Hủy"** đóng popup, không xóa.

### Nhóm B — Chặn xóa

- [ ] **AC-4**: Chặn khi kỳ đã khóa hoặc tồn âm
  - Tại: thao tác xóa.
  - Khi: phiếu có ngày chứng từ thuộc **kỳ kế toán đã đóng**, **hoặc** việc xóa làm **tồn (mã + kho + gara) < 0** tại bất kỳ thời điểm nào.
  - Thì: hệ thống hiển thị popup **"Không thể xóa"** với nội dung **"Phiếu PX-xxxxx thuộc kỳ kế toán đã đóng hoặc việc xóa làm tồn kho âm nên không được xóa."**, chỉ có nút **"Đóng"**.

> Lưu ý: theo quyết định nghiệp vụ, phiếu **đã Ghi sổ kho** vẫn xóa được khi kỳ chưa khóa (không bắt buộc Bỏ ghi sổ trước) — chỉ chặn vì kỳ đã đóng hoặc tồn âm.

### Nhóm C — Phân quyền

- [ ] **AC-5**: Phân quyền — chủ garage + kế toán quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14492-89261&t=W7XJPVvhmdBPtv2c-4 |

- Luồng: [UX-FLOW-INVENTORY-DELIVERY-V2](../ux/UX-FLOW-INVENTORY-DELIVERY-V2.md) §3, EC-2/EC-3.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Xóa phiếu: Mutation `[PROPOSED] DeleteDeliveryV2`.

## 5. Business Rules

- **BR-IDV2-006**: Xóa phiếu → tính lại tồn (cộng lại nếu đã ghi sổ).
- **BR-IDV2-007**: Chặn khi kỳ đã khóa; kỳ chưa khóa cho xóa cả phiếu ghi sổ.
- **BR-IDV2-004**: Chặn nếu xóa làm tồn âm (point-in-time).

## 6. Edge Cases

- **EC-1**: Xóa phiếu Nháp → không tác động tồn.
- **EC-2**: Xóa phiếu Ghi sổ kho (kỳ chưa khóa) → cộng tồn lại; chỉ chặn nếu việc cộng/đảo gây mâu thuẫn tồn âm về sau.
- **EC-3**: Phiếu thuộc kỳ đã đóng → chặn.

## 7. Out of Scope

- Sửa → `FEAT-ID-EDIT-V2`. Bỏ ghi sổ → `FEAT-ID-DETAIL-V2`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-ID-DELETE (mới) — xóa phiếu xuất (cả phiếu đã ghi sổ khi kỳ chưa khóa) + tính lại tồn; chặn khi kỳ đã đóng hoặc xóa làm tồn âm. |
| 2026-06-26 | 2 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14492-89261`. Mobile chưa có. |
