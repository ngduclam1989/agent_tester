---
type: epic
artifact_kind: epic
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
boundary: "gf-sales"
last_reviewed: "2026-05-27"
supersedes: null
---

# EP-SERVICE-ORDER: Phiếu dịch vụ

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-SERVICE-ORDER` |
| Title | Phiếu dịch vụ |
| Status | PLANNED |
| Priority | P0 |
| Target wave | Wave 1 |

## 1. Outcome / Hypothesis

Nếu garage có thể tạo, quản lý và theo dõi toàn bộ phiếu dịch vụ (bao gồm cả phiếu dịch vụ xe và phiếu bán lẻ phụ tùng) — từ báo giá đến hoàn thành và quyết toán — trên một hệ thống duy nhất, thì garage sẽ kiểm soát được tiến trình sửa chữa, tối ưu hóa doanh thu và giảm sai sót trong quy trình vận hành.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Tạo, chỉnh sửa, theo dõi và quản lý toàn bộ phiếu dịch vụ |
| Kế toán | PRIMARY | Quyền tương đương chủ garage trong quản lý phiếu dịch vụ |

## 3. Vòng đời trạng thái

Phiếu dịch vụ có hai loại với vòng đời trạng thái khác nhau:

### 3.1 Phiếu dịch vụ xe (SERVICE)

```
  ┌──────────────────┐
  │    Tạo mới       │
  │  (Create)        │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │    Báo giá       │──────────────────────┐
  │   (PRICING)      │                      │
  └────┬─────┬───────┘                      │
       │     │                              │
       │   Từ chối                       Huỷ phiếu
       │   (Driver+)                        │
       │     │                              │
       │     ▼                              │
       │  ┌──────────────────┐              │
       │  │  Đã từ chối      │              │
       │  │  (DECLINED)      │              │
       │  └──────────────────┘              │
       │                                    │
  Bắt đầu                                  │
  sửa chữa                                 │
       │                                    │
       ▼                                    │
  ┌──────────────────┐                      │
  │ Đang thực hiện   │────── Huỷ phiếu ────┤
  │  (IN_PROGRESS)   │                      │
  └────────┬─────────┘                      │
           │                                │
      Hoàn thành                            │
           │                                │
           ▼                                │
  ┌──────────────────┐                      │
  │   Hoàn thành     │                      │
  │  (COMPLETED)     │                      │
  └────────┬─────────┘                      │
           │                                │
      Quyết toán                            │
           │                                │
           ▼                                ▼
  ┌──────────────────┐            ┌──────────────────┐
  │ Đã tạo quyết toán│            │     Đã huỷ       │
  │   (SETTLED)      │            │   (CANCELLED)    │
  └──────────────────┘            └──────────────────┘
```

### 3.2 Phiếu bán lẻ phụ tùng (RETAIL)

```
  ┌──────────────────┐
  │    Tạo mới       │
  │  (Create)        │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │    Báo giá       │──────── Huỷ phiếu ──┐
  │   (PRICING)      │                      │
  └────────┬─────────┘                      │
           │                                │
      Xác nhận                              │
      báo giá                               │
           │                                │
           ▼                                │
  ┌──────────────────┐                      │
  │  Đã xác nhận     │────── Huỷ phiếu ────┤
  │  (CONFIRMED)     │                      │
  └────────┬─────────┘                      │
           │                                │
      Giao hàng                             │
      (xuất kho)                            │
           │                                │
           ▼                                │
  ┌──────────────────┐                      │
  │  Đã xuất kho     │                      │
  │  (DELIVERED)     │                      │
  └────────┬─────────┘                      │
           │                                │
      Quyết toán                            │
           │                                │
           ▼                                ▼
  ┌──────────────────┐            ┌──────────────────┐
  │ Đã tạo quyết toán│            │     Đã huỷ       │
  │   (SETTLED)      │            │   (CANCELLED)    │
  └──────────────────┘            └──────────────────┘
```

**Ghi chú:**
- Trạng thái khởi tạo cho cả hai loại phiếu là **"Báo giá"**.
- **"Đã từ chối"** chỉ áp dụng cho phiếu dịch vụ xe khi khách hàng từ chối báo giá qua Driver+.
- Phiếu dịch vụ xe: quyết toán từ **"Hoàn thành"** sang **"Đã tạo quyết toán"**. Phiếu bán lẻ: quyết toán từ **"Đã xuất kho"** sang **"Đã tạo quyết toán"**.
- Mở lại phiếu từ **"Đã tạo quyết toán"** quay về trạng thái trước quyết toán theo loại phiếu — bị chặn nếu phiếu đã có thanh toán.
- Mã phiếu dịch vụ sinh tự động theo pattern **PDV-{yyyyMMdd}-{00000}**, unique theo tenant.
- Khi tạo phiếu dịch vụ xe không gắn lịch hẹn → hệ thống tự sinh booking walk-in với trạng thái **"Đã đến"** (không áp dụng cho phiếu bán lẻ).

## 4. Features

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-SO-LIST` | Danh sách phiếu dịch vụ | [FEAT-SO-LIST](../features/FEAT-SO-LIST.md) | P0 |
| `FEAT-SO-CREATE` | Tạo phiếu dịch vụ xe | [FEAT-SO-CREATE](../features/FEAT-SO-CREATE.md) | P0 |
| `FEAT-SO-DETAIL` | Chi tiết phiếu dịch vụ xe | [FEAT-SO-DETAIL](../features/FEAT-SO-DETAIL.md) | P0 |
| `FEAT-SO-EDIT` | Chỉnh sửa phiếu dịch vụ xe | [FEAT-SO-EDIT](../features/FEAT-SO-EDIT.md) | P0 |
| `FEAT-SO-SALE-CREATE` | Tạo phiếu bán lẻ phụ tùng | [FEAT-SO-SALE-CREATE](../features/FEAT-SO-SALE-CREATE.md) | P0 |
| `FEAT-SO-SALE-DETAIL` | Chi tiết phiếu bán lẻ phụ tùng | [FEAT-SO-SALE-DETAIL](../features/FEAT-SO-SALE-DETAIL.md) | P0 |
| `FEAT-SO-SALE-EDIT` | Chỉnh sửa phiếu bán lẻ phụ tùng | [FEAT-SO-SALE-EDIT](../features/FEAT-SO-SALE-EDIT.md) | P0 |

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-BOOKING` | Upstream | Phiếu dịch vụ xe có thể gắn với lịch hẹn — lịch hẹn cung cấp thông tin khách hàng, xe và ghi chú ban đầu. |
| `EP-CUSTOMER` | Upstream | Thông tin khách hàng và xe hiển thị trong phiếu — dữ liệu từ gf-customer qua projection. |
| `EP-VEHICLE` | Upstream | Thông tin xe (biển số, hãng, dòng, số km) hiển thị trong phiếu dịch vụ xe. |
| `EP-CATALOG` | Upstream | Danh mục dịch vụ và phụ tùng để thêm vào phiếu dịch vụ. |
| `EP-SETTLEMENT` | Downstream | Phiếu quyết toán được tạo từ phiếu dịch vụ đã hoàn thành/đã xuất kho. |
| `EP-INVENTORY-DELIVERY` | Downstream | Xuất kho phụ tùng khi phiếu dịch vụ có phụ tùng nguồn từ kho. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-sales` | Boundary chính: xử lý toàn bộ nghiệp vụ phiếu dịch vụ, thanh toán, in/xuất và tích hợp Driver+. |
| `agg-garage-graph` | BFF layer: chuyển tiếp GraphQL operations từ frontend sang gf-sales. |
| `gf-customer` | Source of truth khách hàng và xe — gf-sales giữ projection read-only, sync qua REST. |
| `gf-erp-mdm` | Cung cấp danh mục dịch vụ, phụ tùng qua REST cached. |
| `gf-inventory` | Nhận event xuất kho khi phiếu có phụ tùng nguồn INVENTORY và feature flag bật. |
| `gf-accounting` | Nhận yêu cầu tạo quyết toán — chuyển trạng thái phiếu sang SETTLED qua REST callback. |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ phiếu hoàn thành quyết toán | >= 80% | Số phiếu trạng thái **"Đã tạo quyết toán"** / tổng phiếu tạo trong tháng (loại trừ **"Đã huỷ"**) |
| Thời gian trung bình tạo phiếu dịch vụ xe | <= 3 phút | Từ mở form đến lưu thành công (bao gồm thêm dịch vụ, phụ tùng) |
| Tỷ lệ phiếu có đầy đủ thông tin | >= 90% | Số phiếu có khách hàng + xe + ít nhất 1 dịch vụ hoặc phụ tùng / tổng phiếu |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo EP-SERVICE-ORDER từ 7 FEAT đã gen (LIST v1, CREATE v1, DETAIL v1, EDIT v1, SALE-CREATE v1, SALE-DETAIL v1, SALE-EDIT v1). Vòng đời trạng thái tách riêng SERVICE (5 trạng thái chính + DECLINED + CANCELLED) và RETAIL (4 trạng thái chính + CANCELLED). Walk-in booking tự sinh khi tạo phiếu dịch vụ xe không gắn lịch hẹn. |
