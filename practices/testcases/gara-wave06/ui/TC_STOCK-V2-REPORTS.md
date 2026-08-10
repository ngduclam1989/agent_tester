# Test Cases — Wave 6 — Nhóm Stock V2 Reports (Báo cáo tồn kho V2)

## 1. Thông tin chung

| Field | Value |
|---|---|
| Dự án | GARA (Garage Agentic) |
| Wave | W06 — Inventory V2 slice 4/4 |
| Module | Stock V2 Reports (boundary `gf-inventory`, read-only) |
| Sub-module | M6 STK-LIST-V2 (Web+Mobile) · M7 IP-VIEW-V2 (Web only) · M8 STK-DETAIL-V2 (Web only) |
| URL (Web) | `/inventory-stock/reports/at-date`, `/inventory-stock/reports/inout`, `/inventory-stock/reports/card/$productCode` |
| URL (Mobile) | `/inventory/stock-list`, `/inventory/stock-list/search`, `/inventory/stock-list/filter` |
| Tổng số TC | 71 |
| Kỹ thuật áp dụng | Equivalence Partitioning, Boundary Value Analysis (hide-rule OR SL/GT), Decision Table (OB-in-range) |
| Nguồn requirements | `requirements/gara/wave-06/wave-specs/` |
| Diagram tham chiếu | `practices/diagram/wave06-stock-v2-reports-activity.mermaid` / `.svg` |

## 2. Bảng tổng hợp Risk Level

| Module | Function | Validate | UI & Behavior | Phân quyền | Ảnh hưởng liên quan | Tổng TC |
|---|---|---|---|---|---|---|
| M6 STK-LIST-V2 | High (11) | Medium (3) | Medium (6) | High (3) | High (5) | 28 |
| M7 IP-VIEW-V2 | High (7) | Medium (3) | Medium (5) | High (2) | High (5) | 22 |
| M8 STK-DETAIL-V2 | High (9) | Medium (1) | Medium (4) | High (2) | High (5) | 21 |
| **Tổng** | **27** | **7** | **15** | **7** | **15** | **71** |

## 3. Tài khoản test / Test Data thiết yếu

| Loại | Giá trị | Ghi chú |
|---|---|---|
| Tài khoản garage-owner | `owner_test_20260804@gara.test` | |
| Tài khoản accountant | `accountant_test_20260804@gara.test` | |
| Tenant khác (test isolation) | `tenant2_owner_20260804@gara.test` | Dùng cho SC tenant isolation |
| Kho | "Kho Chính - CN Quận 1", "Kho Phụ - CN Quận 3" | |
| Mã đã chạy BQGQ | `PN-18901` | GT xuất > 0 |
| Mã chưa chạy BQGQ | `PN-18906` | GT xuất = 0 |
| Mã có SL=0 nhưng GT≠0 | `PN-18907` | Chênh làm tròn BQGQ, dùng test hide-rule OR |
| Ngày báo cáo mẫu | 04/08/2026 (hôm nay) | |
| Khoảng ngày NXT mẫu | 01/07/2026 - 31/07/2026 | |
| OB import trong khoảng lọc | Import OB ngày 15/07/2026 | Dùng test BR-STKV2-010 |

## 4. Traceability Matrix (tham chiếu)

Xem đầy đủ tại nội dung Bước 4 của phiên làm việc — REQ-25 đến REQ-40 map trực tiếp vào TC dưới đây.

## 5. Ambiguities & Q&A (đã xác nhận ở Bước 2)

| # | Vấn đề | Giải pháp áp dụng vào TC |
|---|---|---|
| Q6 | `productId` null ở IP-VIEW-V2 | TC chính (GARA_STOCKV2_TC_034) test hành vi hiện tại (không render link khi null); TC phụ (GARA_STOCKV2_TC_032) đánh dấu Blocked chờ backend hoàn thiện field `productId` |
| — | Row-cap export (50k/50k/10k) | OI-W06-BR-STKV2-002 — hành vi chưa chốt, KHÔNG đưa vào bộ TC chi tiết này, chỉ ghi chú Gap ở Traceability |

## 6. Bảng thống kê

| Priority | Số lượng |
|---|---|
| Critical | 11 |
| High | 31 |
| Medium | 19 |
| Low | 10 |
| **Tổng** | **71** |

---

## 7. Danh sách file con

> Bảng Test Cases chi tiết được tách theo sub-module (xem SKILL.md `rbt_manual_testing` — mục "Tách file theo sub-module"). TC ID dùng chung 1 prefix `GARA_STOCKV2_TC_`, đánh số liên tục xuyên suốt các file con theo đúng thứ tự dưới đây. GARA_STOCKV2_TC_028 nằm trong file con M6 dù Module ghi "Cross (M6/M7/M8)" — vì đây là vị trí gốc của TC này trong bảng gốc (nhóm Ảnh hưởng chức năng liên quan của M6).

| File | Sub-module | TC ID range | Tổng TC |
|---|---|---|---|
| `TC_STOCKV2-LIST.md` | M6 STK-LIST-V2 (Web+Mobile) | `GARA_STOCKV2_TC_001` – `GARA_STOCKV2_TC_028` | 28 |
| `TC_STOCKV2-IPVIEW.md` | M7 IP-VIEW-V2 | `GARA_STOCKV2_TC_029` – `GARA_STOCKV2_TC_050` | 22 |
| `TC_STOCKV2-DETAIL.md` | M8 STK-DETAIL-V2 | `GARA_STOCKV2_TC_051` – `GARA_STOCKV2_TC_071` | 21 |
