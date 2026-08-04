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

# EP-VEHICLE: Xe & lịch sử xe

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-VEHICLE` |
| Title | Xe & lịch sử xe |
| Status | PLANNED |
| Priority | P0 |
| Target wave | Wave 1 |

## 1. Outcome / Hypothesis

Nếu garage có thể xem danh sách toàn bộ xe trong hệ thống, tra cứu chi tiết từng xe bao gồm tổng quan, dịch vụ đã thực hiện, phụ tùng đã thay và ghi chú kỹ thuật — thì garage sẽ nắm bắt được toàn bộ lịch sử sửa chữa của mỗi xe, từ đó đưa ra tư vấn bảo dưỡng chính xác và nâng cao chất lượng dịch vụ.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Xem danh sách xe, tra cứu lịch sử sửa chữa, xuất file |
| Kế toán | PRIMARY | Quyền tương đương chủ garage trong xem thông tin xe |

## 3. Vòng đời trạng thái

Xe không có vòng đời trạng thái riêng. Xe là thực thể con của khách hàng (`CustomerVehicle`) — được tạo, chỉnh sửa và xóa trong luồng quản lý khách hàng (`EP-CUSTOMER`). Epic này tập trung vào **xem** thông tin xe và lịch sử dịch vụ.

## 4. Features

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-VEH-LIST` | Danh sách xe | [FEAT-VEH-LIST](../features/FEAT-VEH-LIST.md) | P0 |
| `FEAT-VEH-DETAIL` | Chi tiết xe | [FEAT-VEH-DETAIL](../features/FEAT-VEH-DETAIL.md) | P0 |

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-CUSTOMER` | Upstream | Xe thuộc về khách hàng — tạo/sửa/xóa xe trong luồng quản lý khách hàng. |
| `EP-SERVICE-ORDER` | Upstream | Lịch sử dịch vụ, phụ tùng đã thay và ghi chú kỹ thuật lấy từ phiếu dịch vụ đã hoàn thành. |
| `EP-CATALOG` | Upstream | Danh mục hãng xe, dòng xe, phiên bản để hiển thị thông tin xe. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-customer` | Boundary chính: lưu trữ và cung cấp thông tin xe (CustomerVehicle entity). |
| `agg-garage-graph` | BFF layer: chuyển tiếp GraphQL queries từ frontend sang gf-customer và gf-sales. |
| `gf-sales` | Cung cấp dữ liệu lịch sử dịch vụ xe: phiếu dịch vụ gần nhất, dịch vụ đã thực hiện, phụ tùng đã thay, ghi chú kỹ thuật (qua REST /protected/v1/). |
| `gf-erp-mdm` | Cung cấp danh mục hãng xe, dòng xe, phiên bản để validate và hiển thị. |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ xe có đủ thông tin nhận dạng | >= 70% | Số xe có biển số + hãng xe + dòng xe / tổng xe trong hệ thống |
| Thời gian tra cứu lịch sử xe | <= 5 giây | Từ click xe trong danh sách đến hiển thị đầy đủ tab Tổng quan |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo EP-VEHICLE từ 2 FEAT đã gen (LIST v1, DETAIL v1). Xe không có lifecycle riêng — CRUD nằm trong EP-CUSTOMER; epic này tập trung xem thông tin và lịch sử dịch vụ xe. |
