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

# EP-DASHBOARD: Tổng quan hoạt động

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-DASHBOARD` |
| Title | Tổng quan hoạt động |
| Status | PLANNED |
| Priority | P1 |
| Target wave | Wave 1 |

## 1. Outcome / Hypothesis

Nếu garage có thể xem tổng quan hoạt động realtime (xe đang sửa, yêu cầu báo giá, công nợ), theo dõi chỉ số dịch vụ, booking, doanh thu-chi phí và mua hàng qua dashboard trực quan — thì garage sẽ nắm bắt được tình hình kinh doanh nhanh chóng, phát hiện vấn đề kịp thời và đưa ra quyết định dựa trên dữ liệu.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Xem dashboard tổng quan hoạt động, theo dõi KPI kinh doanh |
| Kế toán | PRIMARY | Quyền tương đương chủ garage trong xem dashboard |

## 3. Vòng đời trạng thái

Epic này tập trung vào **xem** dữ liệu tổng hợp — không có vòng đời trạng thái riêng. Dữ liệu dashboard được tổng hợp từ nhiều boundary (gf-sales, gf-purchase) và hiển thị realtime.

## 4. Features

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-DASH-VIEW` | Tổng quan hoạt động | [FEAT-DASH-VIEW](../features/FEAT-DASH-VIEW.md) | P1 |

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-SERVICE-ORDER` | Upstream | Dữ liệu phiếu dịch vụ cung cấp chỉ số dịch vụ, doanh thu và trạng thái xe realtime. |
| `EP-BOOKING` | Upstream | Dữ liệu lịch hẹn cung cấp chỉ số booking funnel (tổng, hoàn thành, huỷ, tỷ lệ chuyển đổi). |
| `EP-SETTLEMENT` | Upstream | Dữ liệu quyết toán cung cấp chỉ số doanh thu và công nợ. |
| `EP-PROCUREMENT` | Upstream | Dữ liệu đơn hàng mua cung cấp chỉ số chi phí mua hàng và tỷ lệ chuyển đổi yêu cầu → đơn hàng. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-sales` | Boundary chính: cung cấp API dashboard realtime, chỉ số dịch vụ, booking và doanh thu-chi phí. |
| `agg-garage-graph` | BFF layer: chuyển tiếp GraphQL queries từ frontend sang gf-sales và gf-purchase cho dashboard. |
| `gf-purchase` | Cung cấp chỉ số mua hàng (tổng đơn, tổng chi phí, tỷ lệ chuyển đổi). |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Thời gian tải dashboard | <= 3 giây | Từ truy cập trang đến hiển thị đầy đủ các nhóm chỉ số |
| Tỷ lệ sử dụng dashboard hàng ngày | >= 60% | Số ngày có truy cập dashboard / tổng ngày hoạt động trong tháng |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo EP-DASHBOARD từ 1 FEAT đã gen (VIEW v1). Dashboard tổng hợp dữ liệu từ gf-sales (realtime, dịch vụ, booking, doanh thu) và gf-purchase (mua hàng). Tích hợp Superset BI cho báo cáo nâng cao. |
