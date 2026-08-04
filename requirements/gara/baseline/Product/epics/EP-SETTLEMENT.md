---
type: epic
artifact_kind: epic
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
boundary: "gf-accounting"
last_reviewed: "2026-05-27"
supersedes: null
---

# EP-SETTLEMENT: Quyết toán

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-SETTLEMENT` |
| Title | Quyết toán |
| Status | PLANNED |
| Priority | P0 |
| Target wave | Wave 1 |

## 1. Outcome / Hypothesis

Nếu garage có thể tạo phiếu quyết toán từ phiếu dịch vụ đã hoàn thành, theo dõi trạng thái thanh toán của từng bên (khách hàng và bảo hiểm), quản lý chứng từ và in phiếu quyết toán — trên một hệ thống duy nhất — thì garage sẽ kiểm soát được dòng tiền, giảm sai sót quyết toán và đẩy nhanh thu hồi công nợ.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Tạo phiếu quyết toán, quản lý chứng từ, theo dõi thanh toán, in phiếu |
| Kế toán | PRIMARY | Quyền tương đương chủ garage trong quản lý quyết toán |

## 3. Vòng đời trạng thái

```
  ┌──────────────────┐
  │    Tạo mới       │
  │  (Create)        │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐         ┌──────────────────┐
  │   Nháp           │────────▶│   Đã huỷ         │
  │  (DRAFT)         │  Huỷ    │  (CANCEL)        │
  └──────────────────┘         └──────────────────┘
```

**Ghi chú:**
- Phiếu quyết toán khởi tạo ở trạng thái **"Nháp"** (DRAFT).
- Huỷ phiếu quyết toán bị chặn nếu phiếu đã có bản ghi thanh toán.
- Khi huỷ phiếu quyết toán: huỷ tất cả phiếu quyết toán cùng bộ (khách hàng + bảo hiểm) và mở lại phiếu dịch vụ về trạng thái trước quyết toán.
- Phiếu quyết toán không có trạng thái thanh toán riêng — trạng thái thanh toán (Chưa thanh toán / Thanh toán 1 phần / Đã thanh toán) thuộc phiếu dịch vụ gốc trên gf-sales.
- Mã phiếu quyết toán sinh tự động theo pattern **SET-{yyyyMMdd}-{00001}**, unique theo tenant.
- Phiếu dịch vụ xe có bảo hiểm → tạo **cặp** phiếu quyết toán (khách hàng + bảo hiểm). Phiếu bán lẻ → chỉ tạo phiếu quyết toán khách hàng.

## 4. Features

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-STL-LIST` | Danh sách phiếu quyết toán | [FEAT-STL-LIST](../features/FEAT-STL-LIST.md) | P0 |
| `FEAT-STL-CREATE` | Tạo phiếu quyết toán | [FEAT-STL-CREATE](../features/FEAT-STL-CREATE.md) | P0 |
| `FEAT-STL-DETAIL` | Chi tiết phiếu quyết toán | [FEAT-STL-DETAIL](../features/FEAT-STL-DETAIL.md) | P0 |

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-SERVICE-ORDER` | Upstream | Phiếu quyết toán được tạo từ phiếu dịch vụ đã hoàn thành (SERVICE) hoặc đã xuất kho (RETAIL). Huỷ quyết toán mở lại phiếu dịch vụ. |
| `EP-CUSTOMER` | Upstream | Thông tin khách hàng hiển thị trong phiếu quyết toán — dữ liệu snapshot từ phiếu dịch vụ. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-accounting` | Boundary chính: xử lý toàn bộ nghiệp vụ quyết toán, tài liệu, sinh mã settlement và in/xuất chứng từ. |
| `agg-garage-graph` | BFF layer: chuyển tiếp GraphQL operations từ frontend sang gf-accounting. |
| `gf-sales` | Cung cấp snapshot phiếu dịch vụ (dịch vụ, phụ tùng, tổng tiền) khi tạo quyết toán. Nhận callback settle/reopen để cập nhật trạng thái phiếu dịch vụ. |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ phiếu quyết toán không bị huỷ | >= 95% | Số phiếu trạng thái **"Nháp"** / tổng phiếu tạo trong tháng |
| Thời gian trung bình tạo quyết toán | <= 1 phút | Từ nhấn tạo quyết toán đến lưu thành công |
| Tỷ lệ phiếu có chứng từ đính kèm | >= 50% | Số phiếu có ít nhất 1 tài liệu / tổng phiếu quyết toán |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo EP-SETTLEMENT từ 3 FEAT đã gen (LIST v1, CREATE v1, DETAIL v1). Vòng đời trạng thái đơn giản: DRAFT → CANCEL. Thanh toán không thuộc gf-accounting — trạng thái thanh toán nằm trên gf-sales. |
