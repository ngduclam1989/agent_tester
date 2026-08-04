---
type: epic
artifact_kind: epic
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
boundary: "gf-marketing"
last_reviewed: "2026-05-27"
supersedes: null
---

# EP-MARKETING: Marketing & phân khúc khách hàng

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-MARKETING` |
| Title | Marketing & phân khúc khách hàng |
| Status | PLANNED |
| Priority | P2 |
| Target wave | Wave 2 |

## 1. Outcome / Hypothesis

Nếu garage có thể tạo và quản lý chiến dịch marketing (SMS, thông báo), phát hành và theo dõi voucher giảm giá, và xem danh sách phân khúc khách hàng — trên một hệ thống duy nhất — thì garage sẽ tăng tỷ lệ khách quay lại, chủ động tiếp cận khách hàng đúng thời điểm và đo lường hiệu quả marketing.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Tạo chiến dịch, phát hành voucher, xem phân khúc khách hàng |
| Kế toán | PRIMARY | Quyền tương đương chủ garage trong quản lý marketing |

## 3. Vòng đời trạng thái

### 3.1 Chiến dịch (Campaign)

```
  ┌──────────────────┐
  │    Tạo mới       │
  │  (Create)        │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │    Nháp          │──────── Huỷ ────────┐
  │   (DRAFT)        │                      │
  └────────┬─────────┘                      │
           │                                │
      Lên lịch                              │
           │                                │
           ▼                                │
  ┌──────────────────┐                      │
  │  Đã lên lịch     │──────── Huỷ ────────┤
  │  (SCHEDULED)     │                      │
  └────────┬─────────┘                      │
           │                                │
      Thực hiện                             │
      (tự động)                             │
           │                                │
           ▼                                │
  ┌──────────────────┐                      │
  │ Đang thực hiện   │                      │
  │ (IN_PROGRESS)    │                      │
  └────────┬─────────┘                      │
           │                                │
      Hoàn thành                            │
      (tự động)                             │
           │                                │
           ▼                                ▼
  ┌──────────────────┐            ┌──────────────────┐
  │  Hoàn thành      │            │     Đã huỷ       │
  │  (COMPLETED)     │            │   (CANCELLED)    │
  └──────────────────┘            └──────────────────┘
```

### 3.2 Voucher

```
  ┌──────────────────┐
  │    Tạo mới       │
  │  (Create)        │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐         ┌──────────────────┐
  │ Đang hoạt động   │────────▶│ Ngừng hoạt động  │
  │   (ACTIVE)       │  Ngừng  │   (INACTIVE)     │
  └──────────────────┘         └──────────────────┘
           ▲                            │
           │       Kích hoạt lại        │
           └────────────────────────────┘
```

### 3.3 Phân khúc khách hàng (Segment)

Phân khúc khách hàng không có vòng đời trạng thái phức tạp — phân khúc có thể tạo mới, xem chi tiết và bật/tắt trạng thái hoạt động.

**Ghi chú:**
- Chiến dịch khởi tạo ở trạng thái **"Nháp"** — chỉ được chỉnh sửa khi còn ở trạng thái này.
- Chiến dịch chuyển từ **"Đã lên lịch"** sang **"Đang thực hiện"** và **"Hoàn thành"** tự động theo lịch trình.
- Voucher khởi tạo ở trạng thái **"Đang hoạt động"** — có thể bật/tắt trạng thái.
- Voucher hết hạn hoặc hết số lượng sẽ tự động ngừng hoạt động.

## 4. Features

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-MKT-CAMP-LIST` | Danh sách chiến dịch | [FEAT-MKT-CAMP-LIST](../features/FEAT-MKT-CAMP-LIST.md) | P2 |
| `FEAT-MKT-CAMP-CREATE` | Tạo chiến dịch | [FEAT-MKT-CAMP-CREATE](../features/FEAT-MKT-CAMP-CREATE.md) | P2 |
| `FEAT-MKT-CAMP-DETAIL` | Chi tiết chiến dịch | [FEAT-MKT-CAMP-DETAIL](../features/FEAT-MKT-CAMP-DETAIL.md) | P2 |
| `FEAT-MKT-CAMP-EDIT` | Chỉnh sửa chiến dịch | [FEAT-MKT-CAMP-EDIT](../features/FEAT-MKT-CAMP-EDIT.md) | P2 |
| `FEAT-MKT-VOUC-LIST` | Danh sách voucher | [FEAT-MKT-VOUC-LIST](../features/FEAT-MKT-VOUC-LIST.md) | P2 |
| `FEAT-MKT-VOUC-CREATE` | Tạo voucher | [FEAT-MKT-VOUC-CREATE](../features/FEAT-MKT-VOUC-CREATE.md) | P2 |
| `FEAT-MKT-VOUC-DETAIL` | Chi tiết voucher | [FEAT-MKT-VOUC-DETAIL](../features/FEAT-MKT-VOUC-DETAIL.md) | P2 |
| `FEAT-MKT-VOUC-EDIT` | Chỉnh sửa voucher | [FEAT-MKT-VOUC-EDIT](../features/FEAT-MKT-VOUC-EDIT.md) | P2 |
| `FEAT-MKT-SEG-LIST` | Danh sách phân khúc khách hàng | [FEAT-MKT-SEG-LIST](../features/FEAT-MKT-SEG-LIST.md) | P2 |
| `FEAT-MKT-SEG-CREATE` | Tạo phân khúc khách hàng | [FEAT-MKT-SEG-CREATE](../features/FEAT-MKT-SEG-CREATE.md) | P2 |
| `FEAT-MKT-SEG-DETAIL` | Chi tiết phân khúc khách hàng | [FEAT-MKT-SEG-DETAIL](../features/FEAT-MKT-SEG-DETAIL.md) | P2 |

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-CUSTOMER` | Upstream | Dữ liệu khách hàng cung cấp nền tảng cho phân khúc và danh sách người nhận chiến dịch. |
| `EP-SERVICE-ORDER` | Upstream | Lịch sử dịch vụ khách hàng ảnh hưởng đến phân khúc và điều kiện áp dụng voucher. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-marketing` | Boundary chính: xử lý toàn bộ nghiệp vụ chiến dịch, voucher, mẫu tin nhắn, QR và Temporal workflows cho gửi tin tự động. |
| `agg-garage-graph` | BFF layer: chuyển tiếp GraphQL operations từ frontend sang gf-marketing. |
| `gf-customer` | Cung cấp dữ liệu phân khúc khách hàng và danh sách khách hàng mục tiêu cho chiến dịch. |
| `gf-notification` | Nhận yêu cầu gửi tin nhắn (SMS, push) từ chiến dịch marketing qua Kafka events. |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ chiến dịch hoàn thành | >= 80% | Số chiến dịch **"Hoàn thành"** / tổng chiến dịch tạo (loại trừ **"Đã huỷ"**) |
| Tỷ lệ voucher được sử dụng | >= 30% | Số voucher đã dùng / tổng voucher phát hành |
| Số chiến dịch trung bình mỗi tháng | >= 2 | Tổng chiến dịch tạo / số tháng hoạt động |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo EP-MARKETING từ 11 FEAT đã gen: chiến dịch (LIST/CREATE/DETAIL/EDIT v1), voucher (LIST/CREATE/DETAIL/EDIT v1), phân khúc (LIST/CREATE/DETAIL v1). Chiến dịch có 5 trạng thái (DRAFT → SCHEDULED → IN_PROGRESS → COMPLETED, CANCELLED). Voucher toggle active/inactive. |
