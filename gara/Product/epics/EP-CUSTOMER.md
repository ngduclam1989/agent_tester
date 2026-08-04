---
type: epic
artifact_kind: epic
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
boundary: "gf-customer"
last_reviewed: "2026-05-27"
supersedes: null
---

# EP-CUSTOMER: Quản lý khách hàng

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-CUSTOMER` |
| Title | Quản lý khách hàng |
| Status | PLANNED |
| Priority | P0 |
| Target wave | Wave 1 |

## 1. Outcome / Hypothesis

Nếu garage có thể quản lý toàn bộ danh sách khách hàng (tạo, chỉnh sửa, import hàng loạt, xem chi tiết và lịch sử tương tác) — trên một hệ thống duy nhất — thì garage sẽ nắm bắt được thông tin khách hàng chính xác, theo dõi lịch sử ghé thăm và chi tiêu, từ đó nâng cao chất lượng phục vụ và tăng tỷ lệ khách quay lại.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Quản lý danh sách khách hàng, tạo/sửa thông tin, import khách hàng |
| Kế toán | PRIMARY | Quyền tương đương chủ garage trong quản lý khách hàng |

## 3. Vòng đời trạng thái

### 3.1 Trạng thái khách hàng

```
  ┌──────────────────┐
  │    Tạo mới       │
  │  (Create)        │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐         ┌──────────────────┐
  │ Đang hoạt động   │────────▶│ Ngừng hoạt động  │
  │   (is_active     │  Ngừng  │   (is_active     │
  │    = true)       │         │    = false)       │
  └──────────────────┘         └──────────────────┘
           ▲                            │
           │       Kích hoạt lại        │
           └────────────────────────────┘
```

**Ghi chú:**
- Khi tạo khách hàng, trạng thái khởi tạo là **"Đang hoạt động"**.
- Khách hàng **"Ngừng hoạt động"** có thể kích hoạt lại về **"Đang hoạt động"**.
- Trạng thái khách hàng là soft-delete qua field `is_active` — không xóa vật lý dữ liệu.
- Mã khách hàng sinh tự động theo pattern **KH-{sequence}**, unique theo tenant.

## 4. Features

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-CUST-LIST` | Danh sách khách hàng | [FEAT-CUST-LIST](../features/FEAT-CUST-LIST.md) | P0 |
| `FEAT-CUST-DETAIL` | Chi tiết khách hàng | [FEAT-CUST-DETAIL](../features/FEAT-CUST-DETAIL.md) | P0 |
| `FEAT-CUST-CREATE` | Tạo khách hàng | [FEAT-CUST-CREATE](../features/FEAT-CUST-CREATE.md) | P0 |
| `FEAT-CUST-EDIT` | Chỉnh sửa khách hàng | [FEAT-CUST-EDIT](../features/FEAT-CUST-EDIT.md) | P1 |
| `FEAT-CUST-IMPORT` | Import khách hàng | [FEAT-CUST-IMPORT](../features/FEAT-CUST-IMPORT.md) | P1 |

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-VEHICLE` | Downstream | Xe gắn liền với khách hàng — tạo/sửa khách hàng bao gồm quản lý xe. |
| `EP-BOOKING` | Downstream | Lịch hẹn tham chiếu khách hàng khi tạo booking. |
| `EP-SERVICE-ORDER` | Downstream | Phiếu dịch vụ tham chiếu khách hàng và xe. |
| `EP-MARKETING` | Downstream | Phân khúc khách hàng (segment) dựa trên dữ liệu customer. |
| `EP-CATALOG` | Upstream | Danh mục tỉnh/thành phố, phường/xã và hãng xe/dòng xe để validate thông tin. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-customer` | Boundary chính: xử lý toàn bộ nghiệp vụ khách hàng, xe, tương tác và phân khúc. |
| `agg-garage-graph` | BFF layer: chuyển tiếp GraphQL operations từ frontend sang gf-customer. |
| `gf-erp-mdm` | Cung cấp danh mục tỉnh/thành phố, phường/xã qua Redis-cached MDM và validate vehicle catalog (hãng xe/dòng xe/phiên bản). |
| `gf-sales` | Giữ projection read-only customer/vehicle — sync qua REST, không phải master data. |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ khách hàng có đủ thông tin cơ bản | >= 90% | Số khách hàng có tên + SĐT + ít nhất 1 xe / tổng khách hàng **"Đang hoạt động"** |
| Thời gian trung bình tạo khách hàng | <= 2 phút | Từ mở form đến lưu thành công (bao gồm thêm xe) |
| Tỷ lệ import thành công | >= 85% | Số dòng hợp lệ được import / tổng dòng trong file |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo EP-CUSTOMER từ 5 FEAT đã gen (LIST v1, DETAIL v1, CREATE v1, EDIT v1, IMPORT v1). Trạng thái khách hàng đơn giản: is_active boolean (2 trạng thái). |
