# Requirements — Garage Agentic Design

Nguồn: `/Users/all_engineer3/projects/garage-agentic/garage-agentic-design/` (copy read-only, không chỉnh sửa).

## Cấu trúc

- `baseline/Product/` — toàn bộ tài liệu requirements gốc (Product/) trừ thư mục `ux/` (asset Figma nặng, không phải requirement text). Đã đồng bộ lại (2026-08-11) phần liên quan Wave 7 — Booking + Partner Link:
  - `features/` — 132 FEAT-*.md (tất cả module: Booking, Catalog, Customer, Insurance, Inventory, Marketing, Procurement, Sales, Settlement, Vehicle...). Mới thêm `FEAT-SYS-DRIVERPLUS-LINK`, `FEAT-BOOK-DRIVERPLUS-INBOUND`, `FEAT-BOOK-DRIVERPLUS-OUTBOUND`; refresh version mới nhất cho toàn bộ `FEAT-BOOK-*` (ARRIVE/CANCEL/CONFIRM/CREATE/DECLINE/DETAIL/EDIT/LIST).
  - `epics/` — 23 EP-*.md. Mới thêm `EP-PARTNER-LINK`; refresh `EP-BOOKING` lên v4.
  - `business-rules/` — 16 BR-*.md. Refresh `BR-GF-SYSTEM` (v1→v21) và `BR-GF-SALES` (v1→v5) — 2 business rule chốt cho Wave 7. (Lưu ý: `BR-GF-ACCOUNTING` cũng đang lệch version so với nguồn (v1 vs v3 hiện tại) nhưng thuộc phạm vi Wave 6/Inventory, không refresh trong đợt cập nhật Wave 7 này.)
  - `personas/` — accountant, garage-owner
  - `Commons/` — BR-COMMON, ERROR-CODE-REGISTRY
  - `hdsd-docs/` — user-guide templates
  - `reviews/` — review log (hiện chỉ có wave 5)

- `wave-06/` — **toàn bộ requirement scope của Wave 6** (Inventory V2 slice cuối — PRC + Stock V2 Reports)
  - `wave-specs/` — snapshot chính thức (DRAFT→ACTIVE) của Wave 6, nguồn `Execution/wave-specs/W06/`:
    - `_wave-overview.md` — tổng hợp scope, vertical slice, sequencing DAG 5 ngày, open items (đọc file này trước tiên)
    - `_decisions.md` — log quyết định trong quá trình author wave spec
    - `contract-scope.yaml` — 6 contract cross-boundary đã ký (8 cặp producer/consumer)
    - `Product/epics/` — `EP-INVENTORY-ACCOUNTING-PERIOD`, `EP-INVENTORY-STOCK-V2`
    - `Product/business-rules/` — `BR-GF-INVENTORY-ACCOUNTING-PERIOD`, `BR-GF-INVENTORY-STOCK-V2`
    - `Product/features/{be,bff,fe-web,mobile}/` — 25 file đặc tả theo tầng kỹ thuật cho 8 FEAT của wave: `FEAT-PRC-LIST/CREATE/DETAIL/RECALC/DELETE` (tính giá xuất kho BQGQ) + `FEAT-STK-LIST-V2/DETAIL-V2` + `FEAT-IP-VIEW-V2` (3 báo cáo tồn kho V2). Mobile chỉ có 1 file (`FEAT-STK-LIST-V2`) — 7 FEAT còn lại là web-only (chủ đích, không phải thiếu sót).
  - `PKG-W06-inventory-pricing-stock-report.md` — work package gốc (nguồn sinh ra wave-specs)
  - `tracking/` — `ARCH-REVIEW-W06.md`, `arch-design-W06-answers-1.md`, `arch-design-W06-answers-2.md` (Q&A kiến trúc trong quá trình chốt scope)
  - `service-tasks/` — task breakdown theo service: `gf-accounting-wave-06-tasks.md`, `gf-inventory-wave-06-tasks.md`

- `wave-07/` — **toàn bộ requirement scope của Wave 7** (Partner Link + Booking relay Driver Plus). Nguồn chưa có snapshot `Execution/wave-specs/W07/` (wave còn ở giai đoạn Architecture pre-DEV/PKG, chưa author per-layer FEAT be/bff/fe-web/mobile như W06) nên thư mục này tập hợp trực tiếp từ `Product/` + `Architecture/` + `Execution/work-packages/` + `Tracking/` của nguồn:
  - `PKG-W07-partner-link-booking-driver-plus.md` — work package chính (scope, entry/exit criteria, agent assignment, demo, risk) — đọc file này trước tiên
  - `tracking/ARCH-REVIEW-W07.md` — trạng thái review kiến trúc (gate P0/P1 phải =0 trước khi start wave)
  - `Product/epics/` — `EP-PARTNER-LINK` (epic chính), `EP-BOOKING` (epic bị ảnh hưởng — booking relay)
  - `Product/features/` — 3 FEAT core (`FEAT-SYS-DRIVERPLUS-LINK`, `FEAT-BOOK-DRIVERPLUS-INBOUND`, `FEAT-BOOK-DRIVERPLUS-OUTBOUND`) + 7 FEAT Booking bị ảnh hưởng/regression (`FEAT-BOOK-ARRIVE/CANCEL/CONFIRM/CREATE/DECLINE/DETAIL/EDIT/LIST`)
  - `Product/business-rules/` — `BR-GF-SYSTEM` (v21), `BR-GF-SALES` (v5)
  - `Architecture/decisions/` — `ADR-029` (Kafka adapter tự-own + correlated response), `ADR-030` (tenant profile SoT), `ADR-031` (document sync)
  - `Architecture/integrations/` — `INTEG-EXT-driver-plus.md` (SSOT external transport), `INTEG-FE-garage-web-agg-garage-graph.md`, `INTEG-MOB-garage-mobile-agg-garage-graph.md`
  - `Architecture/api/` — `gf-system-api.md`, `gf-sales-api.md`, `agg-garage-graph-graphql.md`
  - `Architecture/data/` — `gf-system-data-model.md`
  - `Architecture/events/` — `gf-system-events.md`, `gf-sales-events.md`
  - `Architecture/hld/` — `gf-system-HLD.md`, `gf-sales-HLD.md`

- `WAVE-SEQUENCE.md` (top-level) — bản đồ toàn bộ các wave (W01→W07+), đã đồng bộ lại 2026-08-11.

## Tóm tắt nhanh Wave 6

Wave 6 = **slice cuối (4/4) của Inventory V2** (sau W03 danh mục, W04 kỳ kế toán, W05 nhập/xuất). Gồm 2 module:

1. **PRC — Tính giá xuất kho bình quân gia quyền (BQGQ) cuối kỳ** — boundary `gf-accounting` (NEW), dùng Temporal workflow. 5 FEAT: LIST, CREATE, DETAIL, RECALC, DELETE.
2. **Stock V2 Reports — 3 báo cáo tồn kho** (đọc `inventory_stock_ledger`, read-only) — boundary `gf-inventory`. 3 FEAT: STK-LIST-V2 (tồn đến ngày), IP-VIEW-V2 (nhập-xuất-tồn), STK-DETAIL-V2 (thẻ kho).

Timebox 5 ngày, critical path là `gf-accounting` (7 Temporal activities ngày 3). Chi tiết đầy đủ xem `wave-06/wave-specs/_wave-overview.md`.

## Tóm tắt nhanh Wave 7

Wave 7 = **Partner Link + Booking relay Driver Plus** — wave độc lập với Inventory V2 (không kế thừa hard gate W06), gồm 3 FEAT core:

1. **`FEAT-SYS-DRIVERPLUS-LINK`** (boundary `gf-system`, mới) — garage duyệt/từ chối liên kết tài khoản Driver Plus, tối đa 1 liên kết `LINKED` tại một thời điểm (partial unique index), 6 REST endpoint + 6 GraphQL operation (list/detail/approve/reject/resync/cancel), Kafka topic `AC-DEV-PARTNER-LINK-EVENTS`.
2. **`FEAT-BOOK-DRIVERPLUS-INBOUND`** (boundary `gf-sales`) — nhận booking/hủy từ Driver Plus qua Kafka `AC-DEV-BOOKING-EVENTS` (`BOOKING.CREATE.REQUEST` 14 field, `BOOKING.CANCELLED`), inbox dedupe, idempotent theo `bookingCode`.
3. **`FEAT-BOOK-DRIVERPLUS-OUTBOUND`** (boundary `gf-sales`) — phản hồi correlated event (`BOOKING.CREATE.RESPONSE`, `BOOKING.CANCEL.RESPONSE`, `BOOKING.CHANGE.STATUS`) theo ADR-029, không dùng HTTP synchronous callback.

5 boundary thực thi: `gf-system`, `gf-sales`, `agg-garage-graph` (BFF), `garage-web`, `garage-mobile`. Timebox 5 ngày. Out of scope W07: emit chứng từ SO/QT sang Driver Plus, UI hiển thị retry/error delivery (retry xử lý ngầm backend, không có badge/nút thử lại trên Web/Mobile). Chi tiết đầy đủ xem `wave-07/PKG-W07-partner-link-booking-driver-plus.md` và `wave-07/tracking/ARCH-REVIEW-W07.md` (gate P0/P1 phải =0 trước khi `/wave-start 07`).
