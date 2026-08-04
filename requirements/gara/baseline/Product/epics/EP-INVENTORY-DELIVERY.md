---
type: epic
artifact_kind: epic
status: DONE
version: 2
tier: T2
owner_authority: Business Authority
boundary: "gf-inventory"
last_reviewed: "2026-05-27"
supersedes: null
---

# EP-INVENTORY-DELIVERY: Xuất kho

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-INVENTORY-DELIVERY` |
| Title | Xuất kho |
| Status | PLANNED |
| Priority | P1 |
| Target wave | Wave 2 |

## 1. Outcome / Hypothesis

Nếu garage có thể tạo, quản lý và theo dõi toàn bộ phiếu xuất kho — từ tạo phiếu đến hoàn tất xuất kho, với khả năng hoàn tác khi phát hiện sai sót — thì garage sẽ kiểm soát được luồng hàng ra kho, đảm bảo số liệu tồn kho chính xác và liên kết được phụ tùng xuất với phiếu dịch vụ tương ứng.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Tạo, chỉnh sửa, duyệt, huỷ và hoàn tác phiếu xuất kho |
| Kế toán | PRIMARY | Quyền tương đương chủ garage trong quản lý phiếu xuất kho |

## 3. Vòng đời trạng thái

```
  ┌──────────────────┐
  │    Tạo mới       │
  │  (Create)        │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │   Chờ duyệt     │──────── Huỷ phiếu ──┐
  │  (PENDING)       │                      │
  └────────┬─────────┘                      │
           │                                │
      Hoàn tất                              │
      xuất kho                              │
           │                                │
           ▼                                ▼
  ┌──────────────────┐            ┌──────────────────┐
  │   Đã duyệt      │            │     Đã huỷ       │
  │  (COMPLETED)     │            │   (CANCELLED)    │
  └────────┬─────────┘            └──────────────────┘
           │
      Hoàn tác
           │
           ▼
  ┌──────────────────┐
  │   Hoàn tác       │
  │  (REVERSED)      │
  └──────────────────┘
```

**Ghi chú:**
- Phiếu xuất kho khởi tạo ở trạng thái **"Chờ duyệt"**.
- Chỉ phiếu ở trạng thái **"Chờ duyệt"** mới được chỉnh sửa hoặc huỷ.
- **"Hoàn tất xuất kho"** (duyệt): trừ tồn kho theo số lượng xuất. Khi hoàn tất có liên kết phiếu dịch vụ, hệ thống đối soát số lượng sản phẩm giữa phiếu xuất và phiếu dịch vụ — trả về cờ chênh lệch (không chặn).
- **"Hoàn tác"**: cộng lại tồn kho đã trừ, điều chỉnh tồn kho theo kỳ nếu kỳ đã chốt.
- Huỷ phiếu yêu cầu nhập lý do.
- Nguồn xuất: **"Mua ngoài"** (tạo thủ công) hoặc **"Nền tảng"** (tự động tạo khi phiếu dịch vụ chuyển trạng thái **"Hoàn thành"** và có phụ tùng từ kho — qua `DeliveryFulfillmentWorkflow`).

## 4. Features

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-ID-LIST` | Danh sách phiếu xuất kho | [FEAT-ID-LIST](../features/FEAT-ID-LIST.md) | P1 |
| `FEAT-ID-CREATE` | Tạo phiếu xuất kho | [FEAT-ID-CREATE](../features/FEAT-ID-CREATE.md) | P1 |
| `FEAT-ID-DETAIL` | Chi tiết phiếu xuất kho | [FEAT-ID-DETAIL](../features/FEAT-ID-DETAIL.md) | P1 |
| `FEAT-ID-EDIT` | Chỉnh sửa phiếu xuất kho | [FEAT-ID-EDIT](../features/FEAT-ID-EDIT.md) | P1 |

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-SERVICE-ORDER` | Upstream | Phiếu xuất kho có thể liên kết phiếu dịch vụ — đối soát sản phẩm khi hoàn tất xuất kho. |
| `EP-INVENTORY-PERIOD` | Downstream | Tồn kho theo kỳ được tính từ phiếu xuất kho đã duyệt. Hoàn tác phiếu duyệt sau khi chốt kỳ → điều chỉnh tồn kho kỳ. |
| `EP-CATALOG` | Upstream | Danh mục sản phẩm (phụ tùng) để thêm vào phiếu xuất kho. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-inventory` | Boundary chính: xử lý toàn bộ nghiệp vụ phiếu xuất kho và cập nhật tồn kho. |
| `agg-garage-graph` | BFF layer: chuyển tiếp GraphQL operations từ frontend sang gf-inventory. |
| `gf-sales` | Cung cấp thông tin phiếu dịch vụ khi phiếu xuất kho liên kết SO — dùng để đối soát sản phẩm. |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ phiếu xuất kho hoàn tất | >= 90% | Số phiếu **"Đã duyệt"** / tổng phiếu tạo (loại trừ **"Đã huỷ"**) |
| Tỷ lệ chênh lệch với phiếu dịch vụ | <= 10% | Số phiếu xuất có cờ chênh lệch / tổng phiếu xuất liên kết SO |
| Thời gian trung bình tạo phiếu xuất kho | <= 3 phút | Từ mở form đến lưu thành công |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo EP-INVENTORY-DELIVERY từ 4 FEAT đã gen (LIST v1, CREATE v1, DETAIL v1, EDIT v1). Vòng đời 4 trạng thái: PENDING → COMPLETED/CANCELLED, COMPLETED → REVERSED. Đối soát SO khi hoàn tất xuất kho — cờ chênh lệch không chặn. |
| 2026-05-20 | 2 | Business Authority | Cập nhật §3 ghi chú nguồn xuất: "Mua ngoài" = tạo thủ công, "Nền tảng" = tự động từ SO via DeliveryFulfillmentWorkflow. |
