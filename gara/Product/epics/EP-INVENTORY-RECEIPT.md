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

# EP-INVENTORY-RECEIPT: Nhập kho

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-INVENTORY-RECEIPT` |
| Title | Nhập kho |
| Status | PLANNED |
| Priority | P1 |
| Target wave | Wave 2 |

## 1. Outcome / Hypothesis

Nếu garage có thể tạo, quản lý và theo dõi toàn bộ phiếu nhập kho — từ tạo phiếu đến hoàn tất nhập kho, với khả năng hoàn tác khi phát hiện sai sót — thì garage sẽ kiểm soát được luồng hàng vào kho, đảm bảo số liệu tồn kho chính xác và truy vết được nguồn gốc phụ tùng.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Tạo, chỉnh sửa, duyệt, huỷ và hoàn tác phiếu nhập kho |
| Kế toán | PRIMARY | Quyền tương đương chủ garage trong quản lý phiếu nhập kho |

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
      nhập kho                              │
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
- Phiếu nhập kho khởi tạo ở trạng thái **"Chờ duyệt"**.
- Chỉ phiếu ở trạng thái **"Chờ duyệt"** mới được chỉnh sửa hoặc huỷ.
- **"Hoàn tất nhập kho"** (duyệt): cộng tồn kho theo số lượng nhập, cập nhật giá vốn bình quân gia quyền (WAC).
- **"Hoàn tác"**: trừ tồn kho đã cộng, điều chỉnh tồn kho theo kỳ nếu kỳ đã chốt.
- Huỷ phiếu yêu cầu nhập lý do.
- Nguồn nhập: **"Mua ngoài"** (tạo thủ công) hoặc **"Nền tảng"** (tự động tạo khi đơn hàng mua chuyển trạng thái **"Đang giao hàng"** — qua `ReceiptFulfillmentWorkflow`).

## 4. Features

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-IR-LIST` | Danh sách phiếu nhập kho | [FEAT-IR-LIST](../features/FEAT-IR-LIST.md) | P1 |
| `FEAT-IR-CREATE` | Tạo phiếu nhập kho | [FEAT-IR-CREATE](../features/FEAT-IR-CREATE.md) | P1 |
| `FEAT-IR-DETAIL` | Chi tiết phiếu nhập kho | [FEAT-IR-DETAIL](../features/FEAT-IR-DETAIL.md) | P1 |
| `FEAT-IR-EDIT` | Chỉnh sửa phiếu nhập kho | [FEAT-IR-EDIT](../features/FEAT-IR-EDIT.md) | P1 |

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-PROCUREMENT` | Upstream | Phiếu nhập kho nguồn **"Nền tảng"** liên kết với đơn hàng mua — sản phẩm nhập tham chiếu từ PO. |
| `EP-INVENTORY-PERIOD` | Downstream | Tồn kho theo kỳ được tính từ phiếu nhập kho đã duyệt. Hoàn tác phiếu duyệt sau khi chốt kỳ → điều chỉnh tồn kho kỳ. |
| `EP-CATALOG` | Upstream | Danh mục sản phẩm (phụ tùng) để thêm vào phiếu nhập kho. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-inventory` | Boundary chính: xử lý toàn bộ nghiệp vụ phiếu nhập kho, cập nhật tồn kho và giá vốn WAC. |
| `agg-garage-graph` | BFF layer: chuyển tiếp GraphQL operations từ frontend sang gf-inventory. |
| `gf-purchase` | Cung cấp thông tin đơn hàng mua khi phiếu nhập kho nguồn **"Nền tảng"**. |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ phiếu nhập kho hoàn tất | >= 90% | Số phiếu **"Đã duyệt"** / tổng phiếu tạo (loại trừ **"Đã huỷ"**) |
| Tỷ lệ hoàn tác | <= 5% | Số phiếu **"Hoàn tác"** / tổng phiếu **"Đã duyệt"** |
| Thời gian trung bình tạo phiếu nhập kho | <= 3 phút | Từ mở form đến lưu thành công |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo EP-INVENTORY-RECEIPT từ 4 FEAT đã gen (LIST v1, CREATE v1, DETAIL v1, EDIT v1). Vòng đời 4 trạng thái: PENDING → COMPLETED/CANCELLED, COMPLETED → REVERSED. |
| 2026-05-20 | 2 | Business Authority | Cập nhật §3 ghi chú nguồn nhập: "Mua ngoài" = tạo thủ công, "Nền tảng" = tự động từ PO via ReceiptFulfillmentWorkflow. |
