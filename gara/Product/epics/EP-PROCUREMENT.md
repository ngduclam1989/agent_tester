---
type: epic
artifact_kind: epic
status: DONE
version: 3
tier: T2
owner_authority: Business Authority
boundary: "gf-purchase"
last_reviewed: "2026-05-27"
supersedes: null
---

# EP-PROCUREMENT: Mua hàng

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-PROCUREMENT` |
| Title | Mua hàng |
| Status | PLANNED |
| Priority | P1 |
| Target wave | Wave 2 |

## 1. Outcome / Hypothesis

Nếu garage có thể tạo yêu cầu báo giá từ nhà cung cấp, chuyển thành yêu cầu đặt hàng và theo dõi đơn hàng mua từ đặt đến nhận hàng — trên một hệ thống duy nhất — thì garage sẽ tối ưu hóa chi phí mua phụ tùng, kiểm soát được tiến trình đặt hàng và giảm thời gian chờ hàng.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Tạo yêu cầu báo giá, yêu cầu đặt hàng, theo dõi đơn hàng mua |
| Kế toán | PRIMARY | Quyền tương đương chủ garage trong quản lý mua hàng |

## 3. Vòng đời trạng thái

### 3.1 Yêu cầu báo giá (Quotation Request)

```
  ┌──────────────────┐
  │    Tạo mới       │
  │  (Create)        │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │ Đã gửi yêu cầu  │──────── Huỷ ────────┐
  │(OPEN → ASKING)   │                      │
  └────────┬─────────┘                      │
           │                                │
      NCC phản hồi                          │
      báo giá                               │
           │                                │
           ▼                                │
  ┌──────────────────┐                      │
  │ Đã có báo giá    │──────── Huỷ ────────┤
  │(BIDDING→PRICING) │                      │
  └────────┬─────────┘                      │
           │                                │
      Garage xác nhận                       │
      đặt hàng                              │
           │                                │
           ▼                                ▼
  ┌──────────────────┐            ┌──────────────────┐
  │Xác nhận đặt hàng │            │     Đã huỷ       │
  │(ORDER_CONFIRMING)│            │   (CANCELLED)    │
  └────────┬─────────┘            └──────────────────┘
           │
      Tạo YCĐH + ĐHM
      thành công
           │
           ▼
  ┌──────────────────┐
  │    Đã đóng       │
  │   (CLOSED)       │
  └──────────────────┘
```

### 3.2 Yêu cầu đặt hàng (Purchase Request)

```
  ┌──────────────────┐
  │    Tạo mới       │
  │ (từ QR đã có     │
  │  báo giá)        │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │     Mở           │──────── Huỷ ────────┐
  │   (OPEN)         │                      │
  └────────┬─────────┘                      │
           │                                │
      Xác nhận                              │
      (tạo PO)                              │
           │                                │
           ▼                                ▼
  ┌──────────────────┐            ┌──────────────────┐
  │  Đã tạo đơn hàng │            │     Đã huỷ       │
  │ (ORDER_CREATED)  │            │   (CANCELLED)    │
  └──────────────────┘            └──────────────────┘

  Thanh toán (Payment Status):

  ┌──────────────────┐            ┌──────────────────┐
  │  Chờ thanh toán  │───────────▶│  Đã thanh toán   │
  │   (PENDING)      │  Checkout  │     (PAID)       │
  └──────────────────┘            └──────────────────┘
```

### 3.3 Đơn hàng mua (Purchase Order)

```
  ┌──────────────────┐
  │    Tạo mới       │
  │ (từ PR hoặc      │
  │  tạo trực tiếp)  │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │  Chờ xác nhận    │──────── Huỷ ────────┐
  │(WAIT_TO_CONFIRM) │                      │
  └────────┬─────────┘                      │
           │                                │
      NCC xác nhận                          │
           │                                │
           ▼                                │
  ┌──────────────────┐                      │
  │  Chuẩn bị hàng   │──────── Huỷ ────────┤
  │   (OPEN)         │                      │
  └────────┬─────────┘                      │
           │                                │
      Bắt đầu                              │
      giao hàng                             │
           │                                │
           ▼                                │
  ┌──────────────────┐                      │
  │  Đang giao hàng  │                      │
  │  (DELIVERING)    │                      │
  └────────┬─────────┘                      │
           │                                │
      Nhận hàng                             │
      hoàn tất                              │
           │                                │
           ▼                                ▼
  ┌──────────────────┐            ┌──────────────────┐
  │   Hoàn thành     │            │     Đã huỷ       │
  │(DELIVERED →      │            │   (CANCELLED)    │
  │ COMPLETED)       │            └──────────────────┘
  └────────┬─────────┘
           │
      Hoàn hàng
      (sau khi nhận)
           │
           ▼
  ┌──────────────────┐
  │   Hoàn hàng      │
  │  (RETURNED)      │
  └──────────────────┘
```

**Ghi chú:**
- Luồng mua hàng: **Yêu cầu báo giá** → **Yêu cầu đặt hàng** → **Đơn hàng mua**.
- Yêu cầu báo giá có 3 trạng thái chính từ góc nhìn garage: **"Đã gửi yêu cầu"** → **"Đã có báo giá"** → **"Xác nhận đặt hàng"**. Backend chia nhỏ hơn (OPEN/ASKING/BIDDING/PRICING/ORDER_CONFIRMING) nhưng giao diện gom thành 3 nhóm.
- Huỷ yêu cầu đặt hàng chỉ hợp lệ khi tất cả đơn hàng mua liên quan còn ở trạng thái **"Chờ xác nhận"** (BR-GF-PURCHASE-005).
- Yêu cầu đặt hàng không được tạo từ yêu cầu báo giá đã ở trạng thái **"Xác nhận đặt hàng"**, **"Đã huỷ"** hoặc **"Đã đóng"** (BR-GF-PURCHASE-002).
- Đơn hàng mua có thể tạo từ yêu cầu đặt hàng (source QUOTATION_ASK) hoặc tạo trực tiếp (source DIRECT).
- Giao diện hiển thị **6 trạng thái** đơn hàng mua: **"Chờ xác nhận"**, **"Chuẩn bị hàng"**, **"Đang giao hàng"**, **"Hoàn thành"**, **"Đã huỷ"**, **"Hoàn hàng"**.
- Backend có DELIVERED và COMPLETED là 2 stage riêng, nhưng trên giao diện gom thành một trạng thái **"Hoàn thành"**.
- **"Đã huỷ"** bắt buộc nhập lý do huỷ; **"Hoàn hàng"** bắt buộc nhập lý do hoàn hàng (BR-GF-PURCHASE-012).
- Trạng thái **"Hoàn thành"**, **"Đã huỷ"**, **"Hoàn hàng"** là trạng thái kết thúc — không chuyển tiếp được.
- Khi đơn hàng mua chuyển sang **"Đang giao hàng"**, hệ thống có thể tự động sinh phiếu nhập kho nếu tính năng tồn kho đã bật (BR-GF-PURCHASE-014).

## 4. Features

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-QR-LIST` | Danh sách yêu cầu báo giá | [FEAT-QR-LIST](../features/FEAT-QR-LIST.md) | P1 |
| `FEAT-QR-CREATE` | Tạo yêu cầu báo giá | [FEAT-QR-CREATE](../features/FEAT-QR-CREATE.md) | P1 |
| `FEAT-QR-DETAIL` | Chi tiết yêu cầu báo giá | [FEAT-QR-DETAIL](../features/FEAT-QR-DETAIL.md) | P1 |
| `FEAT-PR-LIST` | Danh sách yêu cầu đặt hàng | [FEAT-PR-LIST](../features/FEAT-PR-LIST.md) | P1 |
| `FEAT-PR-CREATE` | Tạo yêu cầu đặt hàng | [FEAT-PR-CREATE](../features/FEAT-PR-CREATE.md) | P1 |
| `FEAT-PR-DETAIL` | Chi tiết yêu cầu đặt hàng | [FEAT-PR-DETAIL](../features/FEAT-PR-DETAIL.md) | P1 |
| `FEAT-PO-LIST` | Danh sách đơn hàng mua | [FEAT-PO-LIST](../features/FEAT-PO-LIST.md) | P1 |
| `FEAT-PO-CREATE` | Tạo đơn hàng mua | [FEAT-PO-CREATE](../features/FEAT-PO-CREATE.md) | P1 |
| `FEAT-PO-DETAIL` | Chi tiết đơn hàng mua | [FEAT-PO-DETAIL](../features/FEAT-PO-DETAIL.md) | P1 |
| `FEAT-PO-EDIT` | Chỉnh sửa đơn hàng mua | [FEAT-PO-EDIT](../features/FEAT-PO-EDIT.md) | P1 |

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-SERVICE-ORDER` | Upstream | Phiếu dịch vụ cung cấp danh sách phụ tùng cần mua — yêu cầu báo giá có thể tham chiếu phiếu dịch vụ. |
| `EP-CATALOG` | Upstream | Danh mục nhà cung cấp và nhà vận chuyển liên kết dùng khi tạo yêu cầu đặt hàng và đơn hàng mua. |
| `EP-INVENTORY-RECEIPT` | Downstream | Đơn hàng mua hoàn tất nhận hàng có thể sinh phiếu nhập kho nguồn **"Nền tảng"**. |
| `EP-DASHBOARD` | Downstream | Chỉ số mua hàng (tổng đơn, tổng chi phí, tỷ lệ chuyển đổi) hiển thị trên dashboard. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-purchase` | Boundary chính: xử lý toàn bộ nghiệp vụ yêu cầu báo giá, yêu cầu đặt hàng, đơn hàng mua, giỏ hàng, thanh toán và đối soát. |
| `agg-garage-graph` | BFF layer: chuyển tiếp GraphQL operations từ frontend sang gf-purchase. |
| `gf-sales` | Cung cấp thông tin phiếu dịch vụ khi yêu cầu báo giá tham chiếu SO. |
| `gf-inventory` | Nhận event đơn hàng mua hoàn tất giao hàng để xử lý nhập kho tự động (qua gf-inventory-worker). |
| `gf-shipment` | Quản lý giao hàng cho đơn hàng mua — theo dõi trạng thái vận chuyển và callback kết quả. |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ chuyển đổi yêu cầu báo giá → đơn hàng mua | >= 60% | Số yêu cầu báo giá dẫn đến ít nhất 1 đơn hàng mua / tổng yêu cầu báo giá |
| Thời gian trung bình từ yêu cầu báo giá đến nhận hàng | <= 48 giờ | Từ tạo yêu cầu báo giá đến xác nhận nhận hàng trên đơn hàng mua |
| Tỷ lệ đơn hàng mua hoàn tất | >= 85% | Số đơn hàng mua hoàn tất / tổng đơn hàng mua (loại trừ đã huỷ) |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo EP-PROCUREMENT từ 10 FEAT đã gen: yêu cầu báo giá (LIST/CREATE/DETAIL v1), yêu cầu đặt hàng (LIST/CREATE/DETAIL v1), đơn hàng mua (LIST/CREATE/DETAIL/EDIT v1). Luồng 3 bước: QR → PR → PO. |
| 2026-05-20 | 2 | Business Authority | Sửa §3.1: gom 7 backend enum thành 3 trạng thái business (Đã gửi yêu cầu / Đã có báo giá / Xác nhận đặt hàng). Bổ sung §3.2: sơ đồ ASCII lifecycle cho Yêu cầu đặt hàng (OPEN → ORDER_CREATED / CANCELLED + payment PENDING → PAID). Bổ sung §3.3: sơ đồ ASCII lifecycle cho Đơn hàng mua. Bổ sung ghi chú BR tham chiếu. |
| 2026-05-20 | 3 | Business Authority | Sửa §3.3: gom DELIVERED + COMPLETED thành "Hoàn thành" (UI gom 2 backend stage thành 1). Đổi "Đã xác nhận" → "Chuẩn bị hàng", "Trả hàng" → "Hoàn hàng". Giao diện 6 trạng thái: Chờ xác nhận / Chuẩn bị hàng / Đang giao hàng / Hoàn thành / Đã huỷ / Hoàn hàng. |
