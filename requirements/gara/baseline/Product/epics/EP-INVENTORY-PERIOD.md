---
type: epic
artifact_kind: epic
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
boundary: "gf-inventory"
last_reviewed: "2026-05-27"
supersedes: null
---

# EP-INVENTORY-PERIOD: Tồn kho theo kỳ

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-INVENTORY-PERIOD` |
| Title | Tồn kho theo kỳ |
| Status | PLANNED |
| Priority | P2 |
| Target wave | Wave 2 |

## 1. Outcome / Hypothesis

Nếu garage có thể xem tổng quan tồn kho theo từng kỳ — bao gồm tồn đầu kỳ, nhập trong kỳ, xuất trong kỳ, tồn cuối kỳ và giá vốn tương ứng — thì garage sẽ kiểm soát được biến động tồn kho qua thời gian, phát hiện chênh lệch sớm và hỗ trợ kiểm kê định kỳ.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Xem tồn kho theo kỳ, tra cứu chi tiết sản phẩm, lọc theo kỳ và phân khúc |
| Kế toán | PRIMARY | Quyền tương đương chủ garage trong xem tồn kho theo kỳ |

## 3. Vòng đời trạng thái

Epic này tập trung vào **xem** dữ liệu tồn kho theo kỳ — không có vòng đời trạng thái riêng. Dữ liệu tồn kho theo kỳ được tính toán tự động từ phiếu nhập kho và xuất kho đã duyệt, kết hợp với giá vốn bình quân gia quyền (WAC).

## 4. Features

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-IP-VIEW` | Tồn kho theo kỳ | [FEAT-IP-VIEW](../features/FEAT-IP-VIEW.md) | P2 |

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-INVENTORY-RECEIPT` | Upstream | Phiếu nhập kho đã duyệt cung cấp dữ liệu nhập trong kỳ và ảnh hưởng giá vốn WAC. |
| `EP-INVENTORY-DELIVERY` | Upstream | Phiếu xuất kho đã duyệt cung cấp dữ liệu xuất trong kỳ. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-inventory` | Boundary chính: tính toán và lưu trữ tồn kho theo kỳ, giá vốn WAC, hỗ trợ chốt kỳ và điều chỉnh. |
| `agg-garage-graph` | BFF layer: chuyển tiếp GraphQL queries từ frontend sang gf-inventory. |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Thời gian tra cứu tồn kho theo kỳ | <= 5 giây | Từ chọn kỳ đến hiển thị đầy đủ bảng tồn kho |
| Tỷ lệ sản phẩm có dữ liệu tồn kho chính xác | >= 95% | Số sản phẩm mà tồn cuối kỳ = tồn đầu kỳ + nhập − xuất / tổng sản phẩm |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo EP-INVENTORY-PERIOD từ 1 FEAT đã gen (VIEW v1). Epic chỉ có chức năng xem — chốt kỳ và điều chỉnh tồn kho là tác vụ hệ thống tự động, không có FEAT riêng. |
