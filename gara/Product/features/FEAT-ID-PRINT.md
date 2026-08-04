---
type: feature
artifact_kind: feature
status: PLANNED
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-DELIVERY-V2"
boundary: "gf-inventory"
last_reviewed: "2026-06-03"
---

# FEAT-ID-PRINT: In phiếu xuất kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-ID-PRINT` |
| Title | In phiếu xuất kho |
| Parent Epic | `EP-INVENTORY-DELIVERY-V2` |
| Boundary | `gf-inventory` |
| Priority | P2 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** in một phiếu xuất kho ra PDF theo mẫu, **so that** tôi có chứng từ giấy lưu trữ / giao kèm hàng.

## 2. Acceptance Criteria

### Nhóm A — In phiếu (Mẫu 02-VT)

- [ ] **AC-1**: In từ chi tiết phiếu
  - Tại: màn chi tiết, nút **"In phiếu xuất"**.
  - Thì: hệ thống xuất **PDF 1 phiếu** theo **Mẫu số 02-VT** (kèm theo Thông tư số 99/2025/TT-BTC ngày 27/10/2025 của Bộ Tài chính).

- [ ] **AC-2**: Bố cục & nội dung mẫu 02-VT
  - Tại: file PDF.
  - Khi: render.
  - Thì: hệ thống hiển thị:
    - **Header**: "Đơn vị: [tên garage]" · "Bộ phận: ..." (góc trái); "Mẫu số: 02-VT" + dòng thông tư (góc phải).
    - **Tiêu đề**: **"PHIẾU XUẤT KHO"** + "Ngày ... tháng ... năm ..." (theo ngày xuất kho).
    - "Số: [số phiếu]" · "Nợ: ..." · "Có: ..." (Nợ/Có để trống).
    - "Họ và tên người nhận hàng: [người giao hàng] · Địa chỉ (bộ phận): ...".
    - "Lý do xuất kho: [diễn giải / theo loại phiếu]".
    - "Xuất tại kho (ngăn lô): [kho xuất] · Địa điểm: ...".
  - Bảng dòng chi tiết với cột: **STT** · **Tên, nhãn hiệu, quy cách phẩm chất vật tư, dụng cụ sản phẩm, hàng hóa** (= tên sản phẩm nội bộ) · **Mã số** (= **MÃ SẢN PHẨM NỘI BỘ**, KHÔNG phải SKU) · **Đơn vị tính** (ĐVT xuất) · **Số lượng** (Yêu cầu / Thực xuất) · **Đơn giá** (giá vốn) · **Thành tiền**; dòng **Cộng**.
    - "Tổng số tiền (viết bằng chữ): ..." · "Số chứng từ gốc kèm theo: ...".
    - Khối chữ ký: **Người lập phiếu · Người nhận hàng · Thủ kho · Kế toán trưởng (Hoặc bộ phận có nhu cầu nhập) · Giám đốc** — (Ký, họ tên).

- [ ] **AC-3**: In từ danh sách
  - Tại: danh sách, nút **"In"**.
  - Thì: hệ thống xuất PDF phiếu tương ứng theo Mẫu 02-VT (nội dung như AC-2).

### Nhóm B — Phân quyền

- [ ] **AC-4**: Phân quyền — chủ garage + kế toán quyền ngang nhau. In luôn khả dụng ở mọi trạng thái + kỳ.

## 3. UI/UX Reference

- Luồng: [UX-FLOW-INVENTORY-DELIVERY-V2](../ux/UX-FLOW-INVENTORY-DELIVERY-V2.md) §4.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- In phiếu: endpoint `[PROPOSED] PrintDeliveryV2` (render PDF theo mẫu).

## 5. Business Rules

- **BR-IDV2-019**: In phiếu xuất PDF 1 phiếu theo **Mẫu 02-VT** (TT 99/2025/TT-BTC); cột "Mã số" = **mã sản phẩm nội bộ**.
- **BR-IDV2-024**: In luôn khả dụng (không phụ thuộc trạng thái / kỳ).

## 6. Edge Cases

- **EC-1**: In phiếu chưa chạy BQGQ → cột Đơn giá (giá vốn) / Thành tiền hiển thị **0** (giá vốn xuất chốt sau BQGQ).
- **EC-2**: Nợ/Có để trống trên mẫu (không dùng trong V2).

## 7. Out of Scope

- Xuất danh sách excel → `FEAT-ID-EXPORT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-ID-PRINT (mới) — in PDF 1 phiếu xuất theo **Mẫu 02-VT** (TT 99/2025/TT-BTC); cột "Mã số" = mã sản phẩm nội bộ; từ danh sách / chi tiết. |
