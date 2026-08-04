---
type: feature
artifact_kind: feature
status: PLANNED
version: 5
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INSURANCE-SETTLEMENT"
boundary: "gf-sales"
last_reviewed: "2026-06-05"
---

# FEAT-INS-DASH-DEBT: Widget công nợ bảo hiểm trên Dashboard

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-INS-DASH-DEBT` |
| Title | Widget công nợ bảo hiểm trên Dashboard |
| Parent Epic | `EP-INSURANCE-SETTLEMENT` |
| Boundary | `gf-sales` (Dashboard ownership; data từ gf-accounting qua REST hoặc snapshot/replication) |
| Priority | P1 |
| Status | PLANNED |
| Extends | `FEAT-DASH-VIEW` (EP-DASHBOARD) — mở rộng không thay thế |

> ⏸️ **DEFERRED (2026-06-05)** — Dashboard **KHÔNG nằm trong đợt phát triển hiện tại**. Toàn bộ các **NEED CONFIRMATION** của feature này (vị trí widget AC-1, threshold tuổi nợ AC-3, cần 1 hay 2 top-list AC-4, empty state ẩn/hiện AC-7, cache TTL AC-8, BH thanh toán âm EC-2, gốc tính tuổi nợ + widget config BR-INS-DASH-004/005) được **SKIP khi chạy sóng** — sẽ resolve khi feature vào scope. KHÔNG block các feature còn lại của epic.

## 1. User Story

**As** chủ garage, **I want** xem ngay trên Dashboard widget công nợ bảo hiểm (tổng phải thu BH, đã thu trong kỳ, số phiếu chờ thu, top phiếu QT BH chờ thu / chậm thanh toán), **so that** tôi biết garage đang bị doanh nghiệp bảo hiểm chiếm dụng vốn bao nhiêu và phiếu nào cần thúc giục.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị widget trên Dashboard

- [ ] **AC-1**: Widget "Công nợ bảo hiểm" hiển thị trên Dashboard
  - Tại: màn hình Dashboard (FEAT-DASH-VIEW).
  - Khi: chủ garage / kế toán mở dashboard và tenant có ≥ 1 phiếu QT BH trong hệ thống.
  - Thì: hiển thị widget mới tên **"Công nợ bảo hiểm"**, vị trí widget cấu hình được hoặc cố định (NEED CONFIRMATION layout).

- [ ] **AC-2**: Các con số tổng quan
  - Tại: widget **"Công nợ bảo hiểm"**, phần tổng quan.
  - Khi: widget load.
  - Thì: hiển thị 3 KPI chính:
    - **"Tổng phải thu BH"** = Σ (`Còn phải thu BH`) của tất cả phiếu QT BH ở trạng thái DRAFT, chưa thu đủ.
    - **"Đã thu trong kỳ"** = Σ (số tiền BH đã thanh toán) trong kỳ đang xem (mặc định: tháng hiện tại).
    - **"Số phiếu QT BH chờ thu"** = đếm số phiếu DRAFT có trạng thái thanh toán ≠ "Đã thu đủ".

- [ ] **AC-3**: Filter theo kỳ
  - Tại: widget, dropdown filter kỳ.
  - Khi: chủ garage chọn kỳ — các giá trị: **Hôm qua, Tuần này, Tuần trước, Tháng này, Tháng trước**.
  - Thì: các con số AC-2 refresh theo kỳ được chọn. Mặc định: **Tháng này**.

### Nhóm B — Danh sách top phiếu QT BH chờ thu

- [ ] **AC-4**: Top phiếu QT BH chờ thu (số tiền lớn nhất)
  - Tại: widget, section **"Top phiếu QT BH chờ thu"**.
  - Khi: widget load.
  - Thì: hiển thị bảng top 5 phiếu QT BH có **"Còn phải thu BH"** lớn nhất (chỉ tính phiếu DRAFT chưa thu đủ), cột: Mã phiếu QT, Công ty BH, Còn phải thu, Ngày tạo phiếu QT, Tuổi nợ (ngày từ ngày tạo đến hiện tại). Mỗi dòng có link mở chi tiết phiếu QT BH (FEAT-INS-STL-DETAIL).
  - Tuổi nợ > 30 ngày (NEED CONFIRMATION threshold) highlight màu cảnh báo.

- [ ] **AC-5**: Top phiếu chậm thanh toán (tuổi nợ cao nhất)
  - Tại: widget, section **"Phiếu chậm thanh toán"** (tab thứ 2 hoặc list khác bên cạnh AC-4).
  - Khi: kế toán xem.
  - Thì: hiển thị top 5 phiếu QT BH có tuổi nợ cao nhất, không phụ thuộc số tiền. NEED CONFIRMATION: cần cả 2 list này hay chỉ 1.

### Nhóm C — Phân quyền & xử lý

- [ ] **AC-6**: Phân quyền xem widget
  - Tại: widget công nợ BH trên Dashboard.
  - Khi: kế toán hoặc chủ garage truy cập.
  - Thì: cả 2 vai trò đều xem được.

- [ ] **AC-7**: Tenant không có phiếu QT BH
  - Tại: Dashboard.
  - Khi: tenant chưa từng có phiếu QT BH (mới onboard hoặc không làm BH).
  - Thì: widget hiển thị empty state **"Chưa có dữ liệu công nợ bảo hiểm"** + hint link đến tài liệu hướng dẫn — NEED CONFIRMATION có cần ẩn widget hoàn toàn không.

- [ ] **AC-8**: Hiệu năng & cache
  - Tại: API trả số liệu công nợ BH.
  - Khi: dashboard load.
  - Thì: số liệu được cache server-side với TTL hợp lý (NEED CONFIRMATION: 1 phút / 5 phút / 10 phút). Có nút **"Làm mới"** để force refresh.

## 3. UI/UX Reference

> TBD — wireframe widget mới cho Dashboard. Tham chiếu FEAT-DASH-VIEW hiện hành để giữ design language nhất quán.

## 4. API Reference

- Boundary: `gf-sales` (Dashboard ownership).
- Cross-boundary: gf-sales gọi REST `/protected/v1/insurance-debt-summary` từ gf-accounting để aggregate số liệu công nợ BH.
- Query `GetInsuranceDebtSummary(period: Enum)` → trả block KPI (3 con số) + 2 top list (chờ thu theo số tiền + chậm thanh toán theo tuổi nợ). `period` ∈ {YESTERDAY, THIS_WEEK, LAST_WEEK, THIS_MONTH, LAST_MONTH}.
- Cache: aggregation cache layer (Redis) per tenant + period — invalidate khi có thanh toán BH mới ghi nhận (event-driven hoặc TTL).

## 5. Business Rules

- **BR-INS-DASH-001**: Số liệu công nợ BH lấy từ phiếu QT BH có `payerType = INSURANCE` và `status = DRAFT` (không tính CANCEL).
- **BR-INS-DASH-002**: **"Đã thu trong kỳ"** chỉ đếm các bản ghi `payment` thuộc phiếu QT BH có `paymentDate` nằm trong kỳ filter.
- **BR-INS-DASH-003**: **"Tổng phải thu BH"** = Σ (Bảo hiểm thanh toán − Đã thanh toán) của các phiếu QT BH DRAFT chưa thu đủ.
- **BR-INS-DASH-004**: Tuổi nợ tính từ ngày tạo phiếu QT BH đến hiện tại (NEED CONFIRMATION: hay từ ngày xuất hồ sơ BH lần đầu?).
- **BR-INS-DASH-005**: Widget extends FEAT-DASH-VIEW — không thay thế các widget hiện có; chủ garage cấu hình bật/tắt widget nếu Dashboard hỗ trợ widget config (NEED CONFIRMATION).
- **BR-INS-DASH-006**: Filter kỳ gồm 5 giá trị cố định: Hôm qua, Tuần này, Tuần trước, Tháng này (mặc định), Tháng trước.

## 6. Edge Cases

- **EC-1**: Tenant có 1000+ phiếu QT BH → API phải efficient với pagination và aggregation tier; tránh full-table scan mỗi lần load.
- **EC-2**: Phiếu QT BH có `Bảo hiểm thanh toán` âm (do điều chỉnh quá lớn) → không tính vào "Tổng phải thu BH" (hoặc tính riêng với cảnh báo data anomaly — NEED CONFIRMATION).
- **EC-3**: Phiếu QT BH cũ từ trước feature này (migration) — không có dữ liệu điều chỉnh đầy đủ → fallback: lấy "Tổng tiền bảo hiểm trả" từ baseline FEAT-STL-CREATE AC-11 (nhập tay) làm `Bảo hiểm thanh toán`.
- **EC-4**: Multi-tenant — đảm bảo aggregation strict theo `tenantId` (Critical Rule #4 tenant isolation).
- **EC-5**: Thanh toán BH ghi nhận sai (đã ghi rồi xoá/sửa) → widget reflect đúng sau khi cache invalidate; UI có nút refresh thủ công.

## 7. Out of Scope

- **Biểu đồ lịch sử thanh toán BH theo kỳ** → **bỏ khỏi scope** (chốt 2026-05-27).
- **Phân chia công nợ theo doanh nghiệp BH** (bảng/pie chart theo DN) → **bỏ khỏi scope** (chốt 2026-05-27).
- Báo cáo chi tiết doanh thu BH (profit analysis) → ngoài scope (PRD OS-4 §EP).
- Cảnh báo email/SMS khi phiếu QT BH quá hạn → ngoài scope MVP.
- Dự báo dòng tiền BH → ngoài scope.
- Master data / danh sách công ty BH → **system-seeded production** (đã bỏ FEAT-INS-COMPANY-*), không trong scope.
- Cấu hình tuỳ biến widget vị trí/kích thước → phụ thuộc khả năng Dashboard hiện hành.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-05 | 5 | BA/PO (anhluong) | **DEFERRED** — Dashboard không nằm trong đợt phát triển hiện tại. Thêm banner đầu feature: toàn bộ NEED CONFIRMATION (AC-1 vị trí widget, AC-3 threshold tuổi nợ, AC-4 1/2 top-list, AC-7 empty state, AC-8 cache TTL, EC-2 BH âm, BR-INS-DASH-004/005) **SKIP khi chạy sóng**, resolve khi feature vào scope. Không block phần còn lại của epic. |
| 2026-05-27 | 1 | Business Authority | Khởi tạo FEAT từ PRD v5 §EP-INSURANCE-SETTLEMENT phạm vi §4 + quyết định chốt v4 (cần widget công nợ BH trên dashboard). 3 KPI chính (Tổng phải thu, Đã thu trong kỳ, Số phiếu chờ thu), top phiếu chậm thanh toán, biểu đồ lịch sử, optional phân chia theo DN BH (phụ thuộc Q3 master data). Extends FEAT-DASH-VIEW không thay thế. |
| 2026-05-27 | 2 | Business Authority | Resolve PRD v6 (master data DN BH có): **AC-7 phân chia công nợ theo DN BH chính xác** — bảng + pie chart top 5 DN BH, drill-down list phiếu QT BH của DN đó. Gỡ NEED CONFIRMATION/fallback grouping free text. Cập nhật BR-INS-DASH-006 dùng `insuranceCompanyId` reference. Out-of-scope cập nhật để tham chiếu FEAT-INS-COMPANY-* mới. |
| 2026-05-27 | 4 | Business Authority | Gỡ ref FEAT-INS-COMPANY-* (đã bỏ): Out of Scope → "master data/danh sách công ty BH = system-seeded production". |
| 2026-05-27 | 3 | Business Authority | **Thu gọn scope widget**: AC-3 filter kỳ = 5 giá trị cố định (Hôm qua / Tuần này / Tuần trước / Tháng này / Tháng trước, mặc định Tháng này); **bỏ AC-6 biểu đồ lịch sử thanh toán BH**; **bỏ AC-7 phân chia công nợ theo DN BH**. Renumber AC-8/9/10 → AC-6/7/8. Cập nhật §1, §4 API (bỏ chart series), BR-006 (→ filter kỳ), §7 Out of Scope (thêm 2 phần bỏ). |
