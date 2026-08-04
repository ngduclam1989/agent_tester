---
type: feature
artifact_kind: feature
status: PLANNED
version: 8
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-RECEIPT-V2"
boundary: "gf-inventory"
last_reviewed: "2026-07-16"
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
    - "Số: [số phiếu]" · "Nợ: ..." · "Có: ..." — **V2 render trống** (`debitAccount = creditAccount = ""`); placeholder trong template giữ cho tương lai khi tích hợp hạch toán Nợ/Có tự động từ module Kế toán.
    - "Họ và tên người giao: [người giao hàng]".
    - "Theo đơn hàng số [mã đơn hàng] ngày ... của [đối tượng]" (nếu có PO/đối tượng).
    - "Nhập tại kho: [kho nhập] · Địa điểm: ...".
  - Bảng dòng chi tiết với cột: **STT** · **Tên, nhãn hiệu, quy cách phẩm chất vật tư, dụng cụ sản phẩm, hàng hóa** (= tên sản phẩm nội bộ) · **Mã số** (= **MÃ SẢN PHẨM NỘI BỘ**, KHÔNG phải SKU) · **Đơn vị tính** (ĐVT nhập) · **Số lượng** (Theo chứng từ / Thực nhập) · **Đơn giá** · **Thành tiền**; dòng **Cộng**.
    - "Tổng số tiền (viết bằng chữ): ..." · "Số chứng từ gốc kèm theo: ...".
    - Khối chữ ký **4 vai**: **Người lập biểu · Người giao hàng · Thủ kho · Kế toán trưởng (Hoặc bộ phận có nhu cầu nhập)** — mỗi vai hint "(Ký, họ tên)".

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
- **Mẫu in (HTML template, A4)**: [phieu-nhap-kho-01-vt.html](../ux/assets/phieu-nhap-kho-01-vt.html) — bản dựng chuẩn **Mẫu 01-VT** (TT 99/2025/TT-BTC). Placeholder `{{...}}`:
  - Header: `tenantName`, `voucherNo`, `debitAccount`, `creditAccount` (V2 blank).
  - **Ngày chứng từ nhập kho** (tiêu đề PDF): `receiptDay`, `receiptMonth`, `receiptYear` (3 field, khác với sign date).
  - Info block: `deliveredByName`, `sourceDocType`, `sourceDocNo`, `sourceDocDay`, `sourceDocMonth`, `sourceDocYear`, `sourceDocParty`, `warehouseName`, `location`.
  - Line-items (`items[]` mỗi row): `index`, `itemName`, `internalCode`, `unit`, `qtyRequested`, `qtyReceived`, `unitPrice`, `amount`.
  - Footer: `totalAmount`, `amountInWords`, `attachmentsCount`.
  - **Ngày ký phiếu**: `signDay`, `signMonth`, `signYear` (3 field, thường = ngày lập biểu, có thể khác `receiptDay`).
  - Cột "Mã số" bind **mã sản phẩm nội bộ** (không SKU).

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- In phiếu: endpoint `[PROPOSED] PrintReceiptV2` (render PDF theo mẫu).

## 5. Business Rules

- **BR-IRV2-019**: In phiếu xuất PDF 1 phiếu theo **Mẫu 01-VT** (TT 99/2025/TT-BTC); cột "Mã số" = **mã sản phẩm nội bộ**; khối chữ ký 4 vai với hint "(Ký, họ tên)".
- **BR-IRV2-024**: **In phiếu** và **Xuất excel** luôn khả dụng — không phụ thuộc trạng thái phiếu (Nháp / Ghi sổ) hoặc trạng thái kỳ (đang mở / đã khóa). Justify AC-4.

## 6. Edge Cases

- **EC-1**: Phiếu chưa chạy BQGQ → đơn giá/thành tiền in theo dữ liệu hiện có (nhập có đơn giá nhập → in được). (Phiếu nhập dùng đơn giá nhập, không phụ thuộc BQGQ.)
- **EC-2**: Nợ/Có để trống trên mẫu (không dùng trong V2).
- **EC-3**: **Dòng "Theo đơn hàng số..." V2 chỉ áp phiếu Nhập mua có PO**. HTML template có 6 placeholder `sourceDoc*` (dynamic type/no/date/party) cho tương lai, NHƯNG V2 hard-lock: (a) `RECEIPT_PURCHASE` có PO → bind `sourceDocType="Đơn hàng"`, `sourceDocNo`, `sourceDocDay/Month/Year`, `sourceDocParty=<tên NCC>`; (b) `RECEIPT_PURCHASE` không PO / `RECEIPT_SALE_RETURN` / `RECEIPT_OTHER` → **dòng "Theo..." KHÔNG render** (BE truyền tất cả `sourceDoc*=""` → FE hide toàn dòng, không hiện "Theo đơn hàng số [trống] ngày [trống]..."). Flexibility "Theo [loại chứng từ nguồn]" (Phiếu xuất bán / Chứng từ / ...) **defer W06+** khi có nhu cầu nghiệp vụ cụ thể.

## 7. Out of Scope

- Xuất danh sách excel → `FEAT-IR-EXPORT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-IR-PRINT (mới) — in PDF 1 phiếu nhập theo **Mẫu 01-VT** (TT 99/2025/TT-BTC); cột "Mã số" = mã sản phẩm nội bộ; từ danh sách / chi tiết. |
| 2026-06-10 | 2 | Business Authority | Thêm §0 Δ Thay đổi so với V1 (feature mới — tách từ nút "In phiếu" V1 DETAIL AC-12, thêm Mẫu 01-VT chuẩn) + gắn tag [MỚI] + con trỏ lineage `← tách FEAT-IR-DETAIL AC-12` cho AC-1 (để agent truy vết nguồn gốc). |
| 2026-06-10 | 3 | Business Authority | Thêm khung **CR** giống mẫu: Metadata (Loại thay đổi CR / Màn hình target FEAT-IR-DETAIL / Depends on) + section **§0 Bối cảnh thay đổi (Change Request — DEV đọc trước)**; bảng Δ chuyển xuống §0.1. |
| 2026-06-10 | 4 | Business Authority | Gỡ khung mapping V1↔V2 (CR, §0 Bối cảnh, bảng Δ, lineage tags) — spec V2 đứng độc lập; giữ nguyên toàn bộ nội dung nghiệp vụ. |
| 2026-07-14 | 5 | Business Authority | Gắn link mẫu in HTML `Product/ux/assets/phieu-nhap-kho-01-vt.html` vào §3 UI/UX Reference — bản dựng chuẩn Mẫu 01-VT (TT 99/2025/TT-BTC) A4, Times New Roman, đủ header/số/nợ-có/info-block/table 7 cột (STT · Tên · Mã số · ĐVT · SL Theo chứng từ + Thực nhập · Đơn giá · Thành tiền) + row Cộng + tổng bằng chữ + khối chữ ký 4 vai (Người lập biểu · Người giao hàng · Thủ kho · Kế toán trưởng); dùng làm oracle cho DEV render `PrintReceiptV2` endpoint. |
| 2026-07-14 | 6 | Business Authority | Sync doc ↔ HTML oracle (BA-review 2026-07-14 F-NEW-1..7): (1) AC-2 sửa "Người lập **phiếu**" → "Người lập **biểu**" (chuẩn TT 99/2025/TT-BTC + oracle). (2) AC-2 note Nợ/Có V2 = blank, placeholder giữ future tích hợp Kế toán. (3) §3 UI/UX Reference **liệt kê explicit đủ placeholder** (tách nhóm header/date/info/items/footer/sign-date; 3 field `receiptDay/Month/Year` khác 3 field `signDay/signMonth/signYear`; 6 field `sourceDoc*` broaden cho mọi loại chứng từ nguồn — không lock "đơn hàng"). (4) §5 Business Rules cite thêm **BR-IRV2-024** (justify AC-4 "khả dụng mọi trạng thái") — symmetric với FEAT-ID-PRINT. |
| 2026-07-14 | 7 | Business Authority | **EC-3 clarify V2 sourceDocType scope** (BA-review 2026-07-14 F-NEW-5 defer W06+, BA chốt giữ "Đơn hàng"): V2 hard-lock "Theo đơn hàng số..." **chỉ áp `RECEIPT_PURCHASE` có PO** (bind 6 field `sourceDoc*` từ PO); 3 loại còn lại (`RECEIPT_PURCHASE` không PO / `RECEIPT_SALE_RETURN` / `RECEIPT_OTHER`) → BE truyền `sourceDoc*=""` → FE **hide toàn dòng** (không hiện "Theo đơn hàng số [trống]..."). Flexibility "Theo [loại chứng từ nguồn]" dynamic defer W06+. HTML template placeholder giữ 6 field dynamic cho forward-compat. |
| 2026-07-16 | 8 | Business Authority | **Fix enum drift `RECEIPT_RETURN_FROM_SALES` → `RECEIPT_SALE_RETURN`** (BA-review Cycle 3 F-NEW-1 P1 HIGH — cross-layer drift Product ↔ Architecture). EC-3 body line 94 + CL v7 line 110 dùng tên bịa `RECEIPT_RETURN_FROM_SALES` — không match canonical `RECEIPT_SALE_RETURN` lock tại BR-IRV2-009 + Architecture. Sed replace 2 hit. Cascade Figma prefetch downstream tự close khi regenerate. Đồng bộ FEAT-IR-DETAIL-V2 v13. |
