# Requirements — Garage Agentic Design

Nguồn: `/Users/all_engineer3/projects/garage-agentic/garage-agentic-design/` (copy read-only, không chỉnh sửa).

## Cấu trúc

- `baseline/Product/` — toàn bộ tài liệu requirements gốc (Product/) trừ thư mục `ux/` (asset Figma nặng, không phải requirement text):
  - `features/` — 141 FEAT-*.md (tất cả module: Booking, Catalog, Customer, Insurance, Inventory, Marketing, Procurement, Sales, Settlement, Vehicle...)
  - `epics/` — 21 EP-*.md
  - `business-rules/` — 16 BR-*.md
  - `personas/` — accountant, garage-owner
  - `Commons/` — BR-COMMON, ERROR-CODE-REGISTRY
  - `hdsd-docs/` — user-guide templates
  - `reviews/` — review log (hiện chỉ có wave 5)

- `wave-06/` — **trọng tâm: toàn bộ requirement scope của Wave 6**
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

- `WAVE-SEQUENCE.md` (top-level) — bản đồ toàn bộ các wave (W01→W06+) để biết Wave 6 nằm ở đâu trong roadmap.

## Tóm tắt nhanh Wave 6

Wave 6 = **slice cuối (4/4) của Inventory V2** (sau W03 danh mục, W04 kỳ kế toán, W05 nhập/xuất). Gồm 2 module:

1. **PRC — Tính giá xuất kho bình quân gia quyền (BQGQ) cuối kỳ** — boundary `gf-accounting` (NEW), dùng Temporal workflow. 5 FEAT: LIST, CREATE, DETAIL, RECALC, DELETE.
2. **Stock V2 Reports — 3 báo cáo tồn kho** (đọc `inventory_stock_ledger`, read-only) — boundary `gf-inventory`. 3 FEAT: STK-LIST-V2 (tồn đến ngày), IP-VIEW-V2 (nhập-xuất-tồn), STK-DETAIL-V2 (thẻ kho).

Timebox 5 ngày, critical path là `gf-accounting` (7 Temporal activities ngày 3). Chi tiết đầy đủ xem `wave-06/wave-specs/_wave-overview.md`.
