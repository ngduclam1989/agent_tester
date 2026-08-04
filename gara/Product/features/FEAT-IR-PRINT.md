---
type: feature
artifact_kind: feature
status: PLANNED
version: 4
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-RECEIPT-V2"
boundary: "gf-inventory"
last_reviewed: "2026-06-10"
---

# FEAT-IR-PRINT: In phiếu nhập kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-IR-PRINT` |
| Title | In phiếu nhập kho |
| Parent Epic | `EP-INVENTORY-RECEIPT-V2` |
| Boundary | `gf-inventory` |
| Priority | P2 |
| Status | PLANNED |
| Depends on | — (in dùng đơn giá nhập, không phụ thuộc BQGQ) |

## 1. User Story

**As** chủ garage / kế toán, **I want** in một phiếu nhập kho ra PDF theo mẫu, **so that** tôi có chứng từ giấy lưu trữ / đối chiếu.

## 2. Acceptance Criteria

### Nhóm A — In phiếu (Mẫu 01-VT)

- [ ] **AC-1**: In từ chi tiết phiếu
  - Tại: màn chi tiết phiếu, nút **"In phiếu nhập"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống xuất **PDF 1 phiếu** theo **Mẫu số 01-VT** (kèm theo Thông tư số 99/2025/TT-BTC ngày 27/10/2025 của Bộ Tài chính).

- [ ] **AC-2**: Bố cục & nội dung mẫu 01-VT
  - Tại: file PDF.
  - Khi: render.
  - Thì: hệ thống hiển thị:
    - **Header**: "Đơn vị: [tên garage]" · "Bộ phận: ..." (góc trái); "Mẫu số: 01-VT" + dòng thông tư (góc phải).
    - **Tiêu đề**: **"PHIẾU NHẬP KHO"** + "Ngày ... tháng ... năm ..." (theo ngày nhập kho).
    - "Số: [số phiếu]" · "Nợ: ..." · "Có: ..." (Nợ/Có để trống).
    - "Họ và tên người giao: [người giao hàng]".
    - "Theo đơn hàng số [mã đơn hàng] ngày ... của [đối tượng]" (nếu có PO/đối tượng).
    - "Nhập tại kho: [kho nhập] · Địa điểm: ...".
  - Bảng dòng chi tiết với cột: **STT** · **Tên, nhãn hiệu, quy cách phẩm chất vật tư, dụng cụ sản phẩm, hàng hóa** (= tên sản phẩm nội bộ) · **Mã số** (= **MÃ SẢN PHẨM NỘI BỘ**, KHÔNG phải SKU) · **Đơn vị tính** (ĐVT nhập) · **Số lượng** (Theo chứng từ / Thực nhập) · **Đơn giá** · **Thành tiền**; dòng **Cộng**.
    - "Tổng số tiền (viết bằng chữ): ..." · "Số chứng từ gốc kèm theo: ...".
    - Khối chữ ký: **Người lập phiếu · Người giao hàng · Thủ kho · Kế toán trưởng (Hoặc bộ phận có nhu cầu nhập)** — (Ký, họ tên).

- [ ] **AC-3**: In từ danh sách
  - Tại: danh sách phiếu, nút **"In"**.
  - Khi: chủ garage chọn phiếu và in.
  - Thì: hệ thống xuất PDF phiếu tương ứng theo Mẫu 01-VT (nội dung như AC-2).

### Nhóm B — Phân quyền

- [ ] **AC-4**: Phân quyền
  - Tại: danh sách / chi tiết.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò in được với quyền ngang nhau. In khả dụng ở mọi trạng thái phiếu.

## 3. UI/UX Reference

- Luồng: [UX-FLOW-INVENTORY-RECEIPT-V2](../ux/UX-FLOW-INVENTORY-RECEIPT-V2.md) §3.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- In phiếu: endpoint `[PROPOSED] PrintReceiptV2` (render PDF theo mẫu).

## 5. Business Rules

- **BR-IRV2-019**: In phiếu xuất PDF 1 phiếu theo **Mẫu 01-VT** (TT 99/2025/TT-BTC); cột "Mã số" = **mã sản phẩm nội bộ**; khả dụng ở mọi trạng thái.

## 6. Edge Cases

- **EC-1**: Phiếu chưa chạy BQGQ → đơn giá/thành tiền in theo dữ liệu hiện có (nhập có đơn giá nhập → in được). (Phiếu nhập dùng đơn giá nhập, không phụ thuộc BQGQ.)
- **EC-2**: Nợ/Có để trống trên mẫu (không dùng trong V2).

## 7. Out of Scope

- Xuất danh sách excel → `FEAT-IR-EXPORT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-IR-PRINT (mới) — in PDF 1 phiếu nhập theo **Mẫu 01-VT** (TT 99/2025/TT-BTC); cột "Mã số" = mã sản phẩm nội bộ; từ danh sách / chi tiết. |
| 2026-06-10 | 2 | Business Authority | Thêm §0 Δ Thay đổi so với V1 (feature mới — tách từ nút "In phiếu" V1 DETAIL AC-12, thêm Mẫu 01-VT chuẩn) + gắn tag [MỚI] + con trỏ lineage `← tách FEAT-IR-DETAIL AC-12` cho AC-1 (để agent truy vết nguồn gốc). |
| 2026-06-10 | 3 | Business Authority | Thêm khung **CR** giống mẫu: Metadata (Loại thay đổi CR / Màn hình target FEAT-IR-DETAIL / Depends on) + section **§0 Bối cảnh thay đổi (Change Request — DEV đọc trước)**; bảng Δ chuyển xuống §0.1. |
| 2026-06-10 | 4 | Business Authority | Gỡ khung mapping V1↔V2 (CR, §0 Bối cảnh, bảng Δ, lineage tags) — spec V2 đứng độc lập; giữ nguyên toàn bộ nội dung nghiệp vụ. |
