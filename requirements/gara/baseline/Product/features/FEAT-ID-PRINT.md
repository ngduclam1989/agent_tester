---
type: feature
artifact_kind: feature
status: PLANNED
version: 3
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-DELIVERY-V2"
boundary: "gf-inventory"
last_reviewed: "2026-07-14"
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
    - "Số: [số phiếu]" · "Nợ: ..." · "Có: ..." — **V2 render trống** (`debitAccount = creditAccount = ""`); placeholder trong template giữ cho tương lai khi tích hợp hạch toán Nợ/Có tự động từ module Kế toán.
    - "Họ và tên người nhận hàng: [người giao hàng] · Địa chỉ (bộ phận): ...".
    - "Lý do xuất kho: [diễn giải / theo loại phiếu]".
    - "Xuất tại kho (ngăn lô): [kho xuất] · Địa điểm: ...".
  - Bảng dòng chi tiết với cột: **STT** · **Tên, nhãn hiệu, quy cách phẩm chất vật tư, dụng cụ sản phẩm, hàng hóa** (= tên sản phẩm nội bộ) · **Mã số** (= **MÃ SẢN PHẨM NỘI BỘ**, KHÔNG phải SKU) · **Đơn vị tính** (ĐVT xuất) · **Số lượng** (Yêu cầu / Thực xuất) · **Đơn giá** (giá vốn) · **Thành tiền**; dòng **Cộng**.
    - "Tổng số tiền (viết bằng chữ): ..." · "Số chứng từ gốc kèm theo: ...".
    - Khối chữ ký **5 vai**: **Người lập biểu · Người nhận hàng · Thủ kho · Kế toán trưởng (Hoặc bộ phận có nhu cầu nhập) · Giám đốc** — 4 vai đầu hint "(Ký, họ tên)", **Giám đốc** hint "(Ký, họ tên, **đóng dấu**)" (đại diện pháp lý, cần dấu công ty).

- [ ] **AC-3**: In từ danh sách
  - Tại: danh sách, nút **"In"**.
  - Thì: hệ thống xuất PDF phiếu tương ứng theo Mẫu 02-VT (nội dung như AC-2).

### Nhóm B — Phân quyền

- [ ] **AC-4**: Phân quyền — chủ garage + kế toán quyền ngang nhau. In luôn khả dụng ở mọi trạng thái + kỳ.

## 3. UI/UX Reference

- Luồng: [UX-FLOW-INVENTORY-DELIVERY-V2](../ux/UX-FLOW-INVENTORY-DELIVERY-V2.md) §4.
- **Mẫu in (HTML template, A4)**: [phieu-xuat-kho-02-vt.html](../ux/assets/phieu-xuat-kho-02-vt.html) — bản dựng chuẩn **Mẫu 02-VT** (TT 99/2025/TT-BTC). Placeholder `{{...}}`:
  - Header: `tenantName`, `voucherNo`, `debitAccount`, `creditAccount` (V2 blank).
  - **Ngày chứng từ xuất kho** (tiêu đề PDF): `deliveryDay`, `deliveryMonth`, `deliveryYear` (3 field, khác với sign date).
  - Info block: `receiverName`, `receiverDepartment`, `deliveryReason`, `warehouseName`, `location`.
  - Line-items (`items[]` mỗi row): `index`, `itemName`, `internalCode`, `unit`, `qtyRequested`, `qtyDelivered`, `unitCost` (= giá vốn), `amount`.
  - Footer: `totalAmount`, `amountInWords`, `attachmentsCount`.
  - **Ngày ký phiếu**: `signDay`, `signMonth`, `signYear` (3 field, thường = ngày lập biểu, có thể khác `deliveryDay`).
  - Cột "Mã số" bind **mã sản phẩm nội bộ** (không SKU); khối chữ ký **5 vai** (thêm **Giám đốc** với hint "(Ký, họ tên, **đóng dấu**)").

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
| 2026-07-14 | 2 | Business Authority | Gắn link mẫu in HTML `Product/ux/assets/phieu-xuat-kho-02-vt.html` vào §3 UI/UX Reference — bản dựng chuẩn Mẫu 02-VT (TT 99/2025/TT-BTC) A4, Times New Roman, đủ header/số/nợ-có/info-block (thêm người nhận + địa chỉ bộ phận + lý do xuất)/table 7 cột (STT · Tên · Mã số · ĐVT · SL Yêu cầu + Thực xuất · Đơn giá (giá vốn) · Thành tiền) + row Cộng + tổng bằng chữ + khối chữ ký **5 vai** (Người lập biểu · Người nhận hàng · Thủ kho · Kế toán trưởng · Giám đốc — có "đóng dấu"); dùng làm oracle cho DEV render `PrintDeliveryV2` endpoint. |
| 2026-07-14 | 3 | Business Authority | Sync doc ↔ HTML oracle (BA-review 2026-07-14 F-NEW-1..7): (1) AC-2 sửa "Người lập **phiếu**" → "Người lập **biểu**" (chuẩn TT 99/2025/TT-BTC + oracle). (2) AC-2 **Giám đốc** bổ sung "(Ký, họ tên, **đóng dấu**)" (đại diện pháp lý — cần dấu công ty). (3) AC-2 note Nợ/Có V2 = blank, placeholder giữ future tích hợp Kế toán. (4) §3 UI/UX Reference **liệt kê explicit đủ placeholder** (tách nhóm header/date/info/items/footer/sign-date; 3 field `deliveryDay/Month/Year` khác 3 field `signDay/signMonth/signYear`; items[] rõ `unitCost` = giá vốn). |
