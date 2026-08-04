---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-DASHBOARD"
boundary: "gf-sales"
last_reviewed: "2026-05-27"
---

# FEAT-DASH-VIEW: Dashboard vận hành

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-DASH-VIEW` |
| Title | Dashboard vận hành |
| Parent Epic | `EP-DASHBOARD` |
| Boundary | `gf-sales` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem dashboard tổng quan vận hành garage bao gồm số liệu booking, phiếu dịch vụ, doanh thu, **so that** tôi nắm được tình hình kinh doanh realtime.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị dashboard tổng quan

- [ ] **AC-1**: Hiển thị màn hình dashboard
  - Tại: menu hệ thống, trang chủ.
  - Khi: chủ garage truy cập dashboard.
  - Thì: hệ thống hiển thị màn hình dashboard với tiêu đề mô tả **"Tổng quan tình hình hoạt động của Garage"**, bao gồm hai phần chính: phần vận hành thời gian thực và phần thống kê theo khoảng thời gian.

### Nhóm B — Vận hành thời gian thực

- [ ] **AC-2**: Hiển thị phần vận hành hiện tại
  - Tại: màn hình dashboard, phần trên.
  - Khi: chủ garage xem dashboard.
  - Thì: hệ thống hiển thị phần **"Vận hành hiện tại"** với 5 thẻ số liệu realtime:
    - **"YCBG chờ báo giá"**: số lượng yêu cầu báo giá đang chờ.
    - **"Tổng đơn nhập phụ tùng đang giao"**: số lượng đơn mua hàng đang giao.
    - **"Tổng xe đã đến, chưa phục vụ"**: số lượng xe đã đến garage nhưng chưa có phiếu dịch vụ.
    - **"Tổng xe đang sửa"**: số lượng xe đang trong quá trình sửa chữa.
    - **"Tổng công nợ khách hàng"**: tổng số tiền công nợ khách hàng.

### Nhóm C — Bộ lọc thời gian

- [ ] **AC-3**: Lọc dữ liệu thống kê theo khoảng thời gian
  - Tại: màn hình dashboard, bộ lọc thời gian.
  - Khi: chủ garage chọn khoảng thời gian.
  - Thì: hệ thống cập nhật toàn bộ số liệu thống kê (ngoại trừ phần vận hành thời gian thực) theo khoảng thời gian đã chọn. Các giá trị bộ lọc bao gồm:
    - **"Hôm qua"**
    - **"Tuần này"**
    - **"Tuần trước"**
    - **"Tháng này"**
    - **"Tháng trước"**

### Nhóm D — Thống kê dịch vụ

- [ ] **AC-4**: Hiển thị số liệu dịch vụ
  - Tại: màn hình dashboard, phần thống kê dịch vụ.
  - Khi: chủ garage xem dashboard.
  - Thì: hệ thống hiển thị các thẻ KPI dịch vụ bao gồm:
    - Tổng lịch hẹn đã tạo kèm phần trăm thay đổi so với kỳ trước.
    - Tổng xe đã đến garage kèm phần trăm thay đổi so với kỳ trước.
    - Tỷ lệ xe đến garage (tỷ lệ chuyển đổi từ lịch hẹn sang xe đến).
    - Số xe đã sửa xong.
    - Thời gian sửa chữa trung bình (đơn vị: giờ).

- [ ] **AC-5**: Hiển thị phễu chuyển đổi lịch hẹn
  - Tại: màn hình dashboard, phần phễu chuyển đổi.
  - Khi: chủ garage xem dashboard.
  - Thì: hệ thống hiển thị biểu đồ phễu chuyển đổi từ lịch hẹn đến phiếu dịch vụ, bao gồm các bước:
    - Lịch hẹn đã tạo (số lượng và tỷ lệ).
    - Lịch hẹn xe đã đến (số lượng và tỷ lệ).
    - Lịch hẹn có phiếu dịch vụ (số lượng và tỷ lệ).
    - Phiếu dịch vụ đang xử lý (số lượng và tỷ lệ).

### Nhóm E — Thống kê doanh thu và chi phí

- [ ] **AC-6**: Hiển thị số liệu doanh thu và chi phí
  - Tại: màn hình dashboard, phần doanh thu và chi phí.
  - Khi: chủ garage xem dashboard.
  - Thì: hệ thống hiển thị các thẻ KPI doanh thu và chi phí bao gồm:
    - Tổng doanh thu dịch vụ kèm phần trăm thay đổi so với kỳ trước và giá trị kỳ trước.
    - Tổng chi phí mua hàng kèm phần trăm thay đổi so với kỳ trước và giá trị kỳ trước.

- [ ] **AC-7**: Hiển thị biểu đồ doanh thu và chi phí
  - Tại: màn hình dashboard, phần biểu đồ.
  - Khi: chủ garage xem dashboard.
  - Thì: hệ thống hiển thị biểu đồ doanh thu và chi phí theo thời gian, mỗi điểm dữ liệu bao gồm: doanh thu, chi phí, và chênh lệch.

### Nhóm F — Thống kê mua hàng

- [ ] **AC-8**: Hiển thị số liệu mua hàng
  - Tại: màn hình dashboard, phần mua hàng.
  - Khi: chủ garage xem dashboard.
  - Thì: hệ thống hiển thị các thẻ KPI mua hàng bao gồm:
    - Số yêu cầu báo giá đã tạo.
    - Số yêu cầu báo giá đã được báo giá.
    - Số đơn mua hàng đã tạo.
    - Số đơn mua hàng hoàn thành.

- [ ] **AC-9**: Hiển thị tỷ lệ chuyển đổi mua hàng
  - Tại: màn hình dashboard, phần mua hàng.
  - Khi: chủ garage xem dashboard.
  - Thì: hệ thống hiển thị tỷ lệ chuyển đổi mua hàng bao gồm: tỷ lệ chuyển đổi (phần trăm), số đơn đã chuyển đổi, và tổng số đơn.

### Nhóm G — Dashboard nâng cao (Superset)

- [ ] **AC-10**: Hiển thị dashboard thống kê nâng cao
  - Tại: màn hình dashboard, phần thống kê nâng cao.
  - Khi: chủ garage xem dashboard.
  - Thì: hệ thống hiển thị dashboard BI nhúng (Superset) với các biểu đồ và bảng thống kê chi tiết. Dashboard được render bằng guest token lấy qua hệ thống xác thực.

### Nhóm H — Phân quyền

- [ ] **AC-11**: Phân quyền xem dashboard
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem dashboard tổng quan, các số liệu realtime, thống kê theo thời gian và dashboard nâng cao. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm I — Trạng thái trống và lỗi

- [ ] **AC-12**: Garage mới chưa có dữ liệu
  - Tại: màn hình dashboard.
  - Khi: garage mới chưa có lịch hẹn, phiếu dịch vụ, hoặc đơn mua hàng.
  - Thì: các thẻ KPI hiển thị giá trị 0. Phần trăm thay đổi so với kỳ trước không hiển thị hoặc hiển thị 0%. Biểu đồ hiển thị trống.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-DASHBOARD.

## 4. API Reference

- Boundary: `gf-sales` (qua BFF `agg-garage-graph`)
- Dashboard realtime: Query `GetDashboardRealtime`
- Dashboard thống kê: Query `SupperSetQuestToken` (Superset guest token)

## 5. Business Rules

- **BR-DASH-VW-001**: Phần vận hành thời gian thực hiển thị dữ liệu live, không bị ảnh hưởng bởi bộ lọc thời gian.
- **BR-DASH-VW-002**: Phần thống kê (dịch vụ, doanh thu, mua hàng) được lọc theo khoảng thời gian đã chọn.
- **BR-DASH-VW-003**: Phần trăm thay đổi được tính so với kỳ trước cùng độ dài (ví dụ: tuần này so với tuần trước).
- **BR-DASH-VW-004**: Dashboard dữ liệu luôn được phạm vi theo garage hiện tại — không hiển thị dữ liệu của garage khác.
- **BR-DASH-VW-005**: Dashboard BI nâng cao (Superset) yêu cầu guest token hợp lệ để render. Token được lấy qua hệ thống xác thực.

## 6. Edge Cases

- **EC-1**: Garage mới chưa có dữ liệu — các thẻ KPI hiển thị giá trị 0, biểu đồ trống.
- **EC-2**: Kỳ trước không có dữ liệu — phần trăm thay đổi hiển thị giá trị mặc định (0% hoặc không hiển thị).
- **EC-3**: Superset không khả dụng — phần dashboard BI nâng cao không render, các phần còn lại vẫn hoạt động bình thường.
- **EC-4**: Dữ liệu realtime không thể tải — các thẻ vận hành hiện tại hiển thị trạng thái loading hoặc giá trị mặc định 0.

## 7. Out of Scope

- Quản lý lịch hẹn: thuộc `EP-BOOKING`.
- Quản lý phiếu dịch vụ: thuộc `EP-SERVICE-ORDER`.
- Quản lý mua hàng: thuộc `EP-PROCUREMENT`.
- Quản lý quyết toán và công nợ: thuộc `EP-SETTLEMENT`.
- Cấu hình dashboard (thêm/bớt widget, sắp xếp layout): ngoài phạm vi hiện tại.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG garage-web (dashboard screen, GetDashboardRealtime query, SupperSetQuestToken, IDashboardData interfaces). Cover vận hành realtime, thống kê dịch vụ/doanh thu/mua hàng, phễu chuyển đổi, Superset BI. |
