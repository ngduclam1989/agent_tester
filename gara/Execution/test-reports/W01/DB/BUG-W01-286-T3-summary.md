# BUG-W01-286 Triage T3 Summary — DB Layer 3 Analysis

**Date**: 2026-06-16
**Run by**: agent-test-api
**Method**: Direct PostgreSQL query qua `docker exec gf-postgres psql -U chungnt`

## Finding 1 — Schema gap: `discount_amount` type inconsistency

| Table | Column | Type | Notes |
|---|---|---|---|
| `dev_gf_sales.service_order_item` | `discount_amount` | **`character varying(255)`** (VARCHAR text) | Lưu text — không phải numeric |
| `dev_gf_sales.service_order_item` | `discount_percent` | `numeric(5,2)` | Numeric, max 99.99 |
| `dev_gf_sales.service_order_part` | `discount_amount` | `numeric(38,2)` | Numeric, large precision |
| `dev_gf_sales.service_order_part` | `discount_percent` | `numeric(5,2)` | Numeric |

**Vấn đề**: 2 table cho cùng concept "Chiết khấu" nhưng `discount_amount` type khác nhau giữa item (VARCHAR) và part (NUMERIC). Sẽ gây drift mapper/parser khi BE/BFF convert sang DTO.

**KHÔNG có field `discount_unit` / `discount_mode`** trong cả 2 table → BE + FE phải infer mode qua convention `discount_amount != 0 → VND mode; discount_percent != 0 → PERCENT mode`. Convention dễ break nếu cả 2 field cùng tồn tại hoặc cùng = 0.

## Finding 2 — No SO row có discount VND value > 0 trong toàn bộ DB

Query:
```sql
SELECT * FROM dev_gf_sales.service_order_item
WHERE discount_amount IS NOT NULL AND discount_amount NOT IN ('0','0.00','') AND is_deleted = false;
-- 0 rows

SELECT * FROM dev_gf_sales.service_order_part
WHERE discount_amount IS NOT NULL AND discount_amount > 0 AND is_deleted = false;
-- 0 rows
```

**Hàm ý**: Toàn bộ SO hiện tại lưu discount = PERCENT only (`discount_percent != 0`, `discount_amount = 0`). KHÔNG có SO nào lưu discount = VND với value > 0.

→ Có thể là 1 trong 3 khả năng:
- **(A) Layer 3 — BE persist drop value**: gf-sales nhận input VND từ FE nhưng persist `discount_amount = 0` (drop value).
- **(B) Layer 1 — FE submit only PERCENT**: FE chưa từng submit VND discount value xuống BE (form chỉ có nhánh PERCENT).
- **(C) Env data gap**: tester chưa tạo SO với VND discount trong env này; user screenshot Bug 2 là từ env khác.

→ Cần repro **live** (Playwright login + create SO + submit VND discount + observe DB row sau persist) để confirm.

## Finding 3 — Settlement records master không lưu line-item discount

`gf_accounting.settlement_records` chỉ lưu **aggregate** (`breakdown_parts_*`, `breakdown_service_*`, `discount_amount` tổng, `final_amount` tổng), KHÔNG có per-row discount. STL Detail UI khi render bảng "Dịch vụ thực hiện" + "Phụ tùng sử dụng" cột "Chiết khấu" per-row PHẢI đọc qua BFF resolver join về `service_order_item` + `service_order_part` (snapshot SO master).

→ Layer 3 root cause (nếu confirm) nằm ở **gf-sales SO persist path**, KHÔNG phải gf-accounting settlement snapshot.

## Layer Determination — Preliminary

| Layer | Likelihood | Owner candidate | Evidence required |
|---|---|---|---|
| Layer 1 (FE render only) | Low | agent-fix-garage-web | DB có VND value + BFF response có VND value → FE chỉ hiển thị sai |
| Layer 2 (BFF mapper drop) | Medium | agent-fix-agg-garage-graph | DB có VND value + BFF response NULL VND field |
| **Layer 3 (BE persist drop value)** | **High** | **agent-fix-gf-sales (primary)** | DB column type discrepancy + 0 VND row tồn tại trong DB → likely persist gap |

**Recommendation**: Primary suspect = **agent-fix-gf-sales** (schema gap + persist drop). Verify qua live repro before final assignment.

## T1/T2 Deferred

T1 (curl BFF) + T2 (curl SO) yêu cầu Firebase token (BFF auth qua Firebase verify, không có login mutation BFF-side). Cần Playwright session intercept token hoặc trigger qua FE login UI flow.

→ **Next action recommended**: spawn `agent-test-e2e` chạy Playwright script (a) login accountant; (b) tạo SO BH với 3 case discount (VND 50.000đ + 0% + 10%); (c) tạo Phiếu QT BH; (d) capture (request payload + BFF response + DB row state) → identify layer chính xác.

## Evidence files

- `BUG-W01-286-T3a-settlement-record.txt` — query SET-20260616-00004 (0 rows — not in DB)
- `BUG-W01-286-T3b-so-items.txt` — SO items PDV-20260615-00015 (all PERCENT, 0 VND)
- `BUG-W01-286-T3c-so-parts.txt` — SO parts PDV-20260615-00015 (all PERCENT, 0 VND)
