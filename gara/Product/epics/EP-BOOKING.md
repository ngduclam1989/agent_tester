---
type: epic
artifact_kind: epic
status: DONE
version: 3
tier: T2
owner_authority: Business Authority
boundary: "gf-sales"
last_reviewed: "2026-05-27"
supersedes: null
---

# EP-BOOKING: Lịch hẹn & Driver+

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-BOOKING` |
| Title | Lịch hẹn & Driver+ |
| Status | PLANNED |
| Priority | P0 |
| Target wave | Wave 1 |

## 1. Outcome / Hypothesis

Nếu garage có thể quản lý toàn bộ vòng đời lịch hẹn (tạo, xác nhận, từ chối, tiếp nhận xe, hủy) trên một hệ thống duy nhất — đồng thời tự động nhận và phản hồi lịch hẹn từ ứng dụng tài xế Driver+ — thì garage sẽ giảm thiểu sai sót trong tiếp nhận xe, rút ngắn thời gian chờ của khách hàng và tăng tỷ lệ chuyển đổi từ lịch hẹn sang phiếu dịch vụ.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Quản lý và xử lý lịch hẹn hàng ngày: xác nhận, từ chối, tiếp nhận xe, tạo phiếu dịch vụ |
| Kế toán | PRIMARY | Xem và xử lý lịch hẹn với quyền tương đương chủ garage |

## 3. Vòng đời trạng thái

```
                        ┌─────────────────────────────────────────────┐
                        │              NGUỒN TẠO                      │
                        ├─────────────┬──────────────┬────────────────┤
                        │ Driver+     │ Driver+      │ Garage Care    │
                        │             │              │                │
                        └──────┬──────┴──────┬───────┴───────┬────────┘
                               │             │               │
                               ▼             │               ▼
                      ┌────────────────┐     │      ┌────────────────┐
                      │ Lịch hẹn mới  │     │      │ Đã xác nhận   │
                      │   (BOOKING)    │     │      │   (BOOKED)     │
                      └───┬────┬───┬───┘     │      └──┬────┬────┬───┘
                          │    │   │         │         │    │    │
              Xác nhận    │    │   │ Từ chối │  Xe đã  │    │    │ Hủy
                          │    │   │         │  đến    │    │    │
                          ▼    │   ▼         │         ▼    │    ▼
                 ┌─────────┐   │ ┌──────────┐│  ┌──────────┐│ ┌─────────┐
                 │ Đã xác  │   │ │ Đã từ   ││  │ Xe đã   ││ │ Đã hủy  │
                 │ nhận    │   │ │ chối    ││  │ đến     ││ │         │
                 │(BOOKED) │   │ │(DECLINED)││  │(ARRIVED) ││ │(CANCEL) │
                 └─────────┘   │ └──────────┘│  └──────────┘│ └─────────┘
                               │             │              │
                               ▼             ▼              │
                          ┌──────────────────────┐          │
                          │      Đã hủy          │◄─────────┘
                          │ (CANCELLED / NO_SHOW)│
                          │  Quá hạn tự động     │
                          └──────────────────────┘

  Walk-in (tự sinh từ Phiếu dịch vụ):
      ─── Tạo Phiếu DV không gắn booking ──► Xe đã đến (ARRIVED)
```

**Ghi chú:**
- **Garage Care** là tên sản phẩm bao gồm **Web GMS** và **App Garage**. Lịch hẹn tạo từ Garage Care khởi tạo ở trạng thái **"Đã xác nhận"**.
- Chỉ lịch hẹn từ **Driver+** mới khởi tạo ở trạng thái **"Lịch hẹn mới"** (cần garage xác nhận).
- **"Lịch hẹn mới"** và **"Đã xác nhận"** là 2 trạng thái cho phép chỉnh sửa.
- **"Đã xác nhận"** chỉ cho phép hủy khi chưa có Phiếu dịch vụ liên kết.
- Trạng thái **"Đã hủy"** trên giao diện gồm cả hủy thủ công và quá hạn tự động (NO_SHOW và CANCELLED).
- Walk-in không phải hành động của người dùng trong module lịch hẹn — hệ thống tự sinh khi tạo Phiếu dịch vụ (xem `FEAT-SO-CREATE`).

## 4. Features

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-BOOK-LIST` | Danh sách lịch hẹn | [FEAT-BOOK-LIST](../features/FEAT-BOOK-LIST.md) | P0 |
| `FEAT-BOOK-DETAIL` | Chi tiết lịch hẹn | [FEAT-BOOK-DETAIL](../features/FEAT-BOOK-DETAIL.md) | P0 |
| `FEAT-BOOK-CREATE` | Tạo lịch hẹn mới | [FEAT-BOOK-CREATE](../features/FEAT-BOOK-CREATE.md) | P0 |
| `FEAT-BOOK-EDIT` | Chỉnh sửa lịch hẹn | [FEAT-BOOK-EDIT](../features/FEAT-BOOK-EDIT.md) | P1 |
| `FEAT-BOOK-CONFIRM` | Xác nhận lịch hẹn | [FEAT-BOOK-CONFIRM](../features/FEAT-BOOK-CONFIRM.md) | P0 |
| `FEAT-BOOK-ARRIVE` | Xác nhận xe đã đến | [FEAT-BOOK-ARRIVE](../features/FEAT-BOOK-ARRIVE.md) | P0 |
| `FEAT-BOOK-CANCEL` | Hủy lịch hẹn | [FEAT-BOOK-CANCEL](../features/FEAT-BOOK-CANCEL.md) | P1 |
| `FEAT-BOOK-DECLINE` | Từ chối lịch hẹn | [FEAT-BOOK-DECLINE](../features/FEAT-BOOK-DECLINE.md) | P1 |

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-SERVICE-ORDER` | Downstream | Sau khi xe đã đến, tạo Phiếu dịch vụ liên kết từ lịch hẹn. Walk-in booking được tự sinh khi tạo Phiếu dịch vụ không gắn lịch hẹn. |
| `EP-FOUND` | Upstream | Cấu hình garage, khung giờ (timeslot) và phân quyền người dùng. |
| `EP-CUSTOMER` | Upstream | Dữ liệu khách hàng và xe dùng cho gợi ý khi tạo/chỉnh sửa lịch hẹn. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-sales` | Boundary chính: xử lý toàn bộ nghiệp vụ booking. |
| `agg-garage-graph` | BFF layer: chuyển tiếp GraphQL operations từ frontend sang gf-sales. |
| Driver+ (external) | Nhận lịch hẹn từ ứng dụng tài xế; đồng bộ trạng thái và cập nhật hai chiều. |
| Garage Care | Tên sản phẩm bao gồm Web GMS và App Garage. Lịch hẹn tạo từ Garage Care khởi tạo ở trạng thái **"Đã xác nhận"**. |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ lịch hẹn được xử lý (xác nhận hoặc từ chối) trong 24h | >= 90% | Số lịch hẹn xử lý trong 24h / tổng lịch hẹn mới |
| Tỷ lệ chuyển đổi lịch hẹn sang Phiếu dịch vụ | >= 70% | Số lịch hẹn có Phiếu DV liên kết / tổng lịch hẹn **"Xe đã đến"** |
| Tỷ lệ lịch hẹn quá hạn tự động (NO_SHOW) | <= 15% | Số lịch hẹn bị hệ thống tự hủy / tổng lịch hẹn |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo EP-BOOKING từ 8 FEAT đã gen (LIST v3, DETAIL v2, CREATE v6, EDIT v2, CONFIRM v1, ARRIVE v1, CANCEL v1, DECLINE v1). Vòng đời trạng thái tổng hợp từ KG gf-sales v5 + garage-web. |
| 2026-05-20 | 2 | Business Authority | Sửa toàn bộ nội dung thiếu dấu tiếng Việt (vi phạm _RULES §4); sửa nguồn tạo cột 1 bỏ Web GMS. |
| 2026-05-20 | 3 | Business Authority | Bổ sung ghi chú: Garage Care = Web GMS + App Garage → trạng thái khởi tạo **"Đã xác nhận"**; chỉ Driver+ khởi tạo **"Lịch hẹn mới"**. Cập nhật §5.2. |
