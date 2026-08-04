---
type: epic
artifact_kind: epic
status: PLANNED
version: 6
tier: T2
owner_authority: Business Authority
boundary: "gf-inventory"
last_reviewed: "2026-07-08"
supersedes: null
---

# EP-INVENTORY-OPENING-BALANCE: Tồn đầu kỳ

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-INVENTORY-OPENING-BALANCE` |
| Title | Tồn đầu kỳ (import số lượng & giá trị tồn theo mã sản phẩm nội bộ) |
| Status | PLANNED |
| Priority | P1 |
| Target wave | TBD — Inventory V2 (post-baseline) |

> **Phạm vi V2 / forward design**: Epic **mới hoàn toàn**, không có bản V1 gốc. Ghi tồn đầu kỳ vào **bảng dữ liệu mới**.

## 1. Outcome / Hypothesis

Nếu garage import được **tồn đầu kỳ** (số lượng + giá trị tồn theo mã sản phẩm nội bộ, theo kho, chốt tại một ngày) với bước kiểm tra dữ liệu trước khi ghi — thì garage có điểm khởi đầu tồn kho chính xác để phục vụ xuất kho và báo cáo tồn/NXT, kể cả khi chưa có phiếu nhập kho tương ứng.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Import tồn đầu kỳ, rà soát danh sách, xóa dòng theo guardrail |
| Kế toán | PRIMARY | Quyền tương đương chủ garage |

## 3. Vòng đời dữ liệu

```
  ┌──────────────────┐     Kiểm tra dữ liệu      ┌──────────────────┐
  │  Tải template +  │─────────────────────────►│  Preview         │
  │  chọn file       │                          │  (hợp lệ / lỗi)  │
  └──────────────────┘                          └────────┬─────────┘
                                                          │ Xác nhận import
                                                          ▼
                                              ┌──────────────────────┐
                                              │  Dòng tồn đầu kỳ     │
                                              │  (ghi vào bảng mới)  │
                                              └────────┬─────────────┘
                                                       │
                                          ┌────────────┼────────────┐
                                          │            │            │
                                     Sửa dòng    Xóa dòng    (giữ nguyên)
                                     (FEAT-OB-EDIT) (guardrail)
                                          │            │
                                          ▼            ▼
                                    ┌───────────┐ ┌──────────────┐
                                    │ Đã cập nhật│ │ Đã xóa/Chặn │
                                    └───────────┘ └──────────────┘
```

**Ghi chú:**
- Tồn đầu kỳ ghi vào **bảng dữ liệu mới**, theo từng dòng: mã sản phẩm nội bộ + kho + ngày chốt tồn ("Tồn đến ngày") + số lượng tồn + giá trị tồn.
- **Không gắn trực tiếp** kỳ kế toán (không chọn kỳ thủ công). Liên hệ kỳ kế toán **gián tiếp qua "Tồn đến ngày"**: ngày rơi vào kỳ nào — nếu kỳ đó **đã đóng** thì chặn import / xóa dòng.
- Import **all-or-nothing** (BR-OB-004a): chỉ ghi khi toàn bộ dòng hợp lệ; có dòng lỗi → chặn cả file. Giới hạn 500 dòng/lần (BR-OB-004b).
- **Sửa dòng** qua `FEAT-OB-EDIT` (form 6 trường, guardrails tương tự import). **Xóa dòng** qua `FEAT-OB-DELETE-LINES` (guardrail kỳ đóng + tồn âm).
- Tồn đầu kỳ là **nguồn tồn** để xuất kho (không cần phiếu nhập vẫn xuất được) và là input cho báo cáo tồn/NXT.

## 4. Features

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-OB-LIST` | Danh sách tồn đầu kỳ | [FEAT-OB-LIST](../features/FEAT-OB-LIST.md) | P1 |
| `FEAT-OB-IMPORT` | Import tồn đầu kỳ | [FEAT-OB-IMPORT](../features/FEAT-OB-IMPORT.md) | P1 |
| `FEAT-OB-EDIT` | Sửa dòng tồn đầu kỳ | [FEAT-OB-EDIT](../features/FEAT-OB-EDIT.md) | P1 |
| `FEAT-OB-DELETE-LINES` | Xóa dòng tồn đầu kỳ đã chọn | [FEAT-OB-DELETE-LINES](../features/FEAT-OB-DELETE-LINES.md) | P1 |

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-INVENTORY-CATALOG` | Upstream | Tồn đầu kỳ tham chiếu mã sản phẩm nội bộ + ĐVT chính (validate ĐVT file khớp ĐVT chính). |
| `EP-INVENTORY-ACCOUNTING-PERIOD` | Upstream (cross-boundary) | Kỳ kế toán master ở boundary `gf-accounting` (sau EP-INVENTORY-ACCOUNTING-PERIOD v16 boundary move 2026-07-07). OB gọi **REST advisory `V4-AP-LC`** (`GET /protected/accounting/v1/accounting-periods/lock-check?date={ISO}`) **per ADR-021** để verify "Tồn đến ngày" có rơi kỳ đóng: fail-CLOSED cho commit-path (import/edit/delete) trả `ERR-INV-024`, fail-OPEN cho preview-path (`W04-3 verify-import`) với marker `warningLockCheckUnavailable`. |
| `EP-INVENTORY-DELIVERY-V2` | Downstream | Tồn đầu kỳ là nguồn tồn để xuất kho. |
| `EP-INVENTORY-STOCK-V2` | Downstream | Báo cáo tồn / NXT lấy tồn đầu kỳ làm điểm khởi đầu. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-inventory` | Boundary chính: entity `opening_balance_line` (SoT OB) + `inventory_stock_ledger` (sổ tồn point-in-time daily snapshot); validate import + guardrail edit/delete; `StockLedgerRecomputeEngine.applyDelta()` idempotent + `cascadedKeys[]` output. |
| `gf-accounting` (cross-boundary) | REST advisory `V4-AP-LC` (`GET /protected/accounting/v1/accounting-periods/lock-check?date={ISO}`) — verify kỳ OPEN cho commit-path (fail-CLOSED trả `ERR-INV-024`) + preview-path (fail-OPEN với marker `warningLockCheckUnavailable`, không throw 503). `AccountingPeriodClient` (Resilience4j circuit breaker + Spring Retry max 3, exponential backoff 200/400/800ms; cache 60s per unique date). Ratified per **ADR-021** (2026-07-04, sau EP v4 gốc). |
| `agg-garage-graph` | BFF layer: passthrough GraphQL W04-Q1/Q3/M1..M4 (`searchOpeningBalances`, `verifyImportOpeningBalances`, `importOpeningBalances`, `updateOpeningBalanceLine`, `deleteOpeningBalanceLine`, `deleteOpeningBalanceLines`); `@FeatureOn("Inventory:InventoryV2")` gate resolver-level fail-fast 403 (per CR-20260707-02). Header propagation `Authorization` + `X-Tenant-Id` + `X-Branch-Id`. |
| Sổ tồn ledger (`inventory_stock_ledger`) | Bảng point-in-time daily snapshot per ADR-020 v4. OB import là **writer đầu tiên** vào ledger — cascade `origin_context = OB_IMPORT`; edit/delete cascade `OB_EDIT` / `OB_DELETE`. Output `cascadedKeys[]` shape §C4. Cross-ref data model `Architecture/data/gf-inventory-data-model.md §inventory_stock_ledger`. |
| Danh mục kho | Nguồn kho (warehouse) gắn theo garage — kho tự sinh khi tạo garage. |
| **Feature Flag** | **`Inventory:InventoryV2`** — toàn bộ API Tồn đầu kỳ được gate (`@FeatureOn` class-level). Tenant chưa enable → API 403; Web/Mobile ẩn menu/route. |
| **ADR references** | **ADR-020 v4** (Stock ledger point-in-time daily snapshot + `StockLedgerRecomputeEngine` interface C1..C8) · **ADR-021** (REST advisory lock-check cross-boundary `gf-inventory` → `gf-accounting`) · **ADR-022 v3** (OB import all-or-nothing bulk 1-tx + empty-file semantic — BR-OB-004a/b). |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ dòng import hợp lệ | >= 95% | Số dòng hợp lệ / tổng dòng trong các lần import |
| Thời gian import 1 file tồn đầu kỳ | <= 2 phút | Từ chọn file đến xác nhận import xong |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo EP-INVENTORY-OPENING-BALANCE (epic mới, no V1) — import tồn đầu kỳ vào bảng mới (3 feature: LIST/IMPORT/DELETE-LINES). Liên hệ kỳ kế toán gián tiếp qua "Tồn đến ngày"; là nguồn tồn cho xuất kho + báo cáo NXT. |
| 2026-06-16 | 2 | Business Authority | Gỡ con trỏ §27 "Bối cảnh + quy ước: `Plan/INVENTORY-V2-RULES.md`" (note file sắp xóa) — Product độc lập. |
| 2026-07-02 | 3 | Business Authority | **Thêm Feature Flag `Inventory:InventoryV2`** vào §5.2 — gate toàn bộ API Tồn đầu kỳ. Ref BR-GF-INVENTORY §6.6 v3, CR-1782974034. |
| 2026-07-02 | 4 | Business Authority | **Thêm FEAT-OB-EDIT** (sửa dòng tồn đầu kỳ) vào §4 Features (3→4 feature). Form 6 trường, guardrails tương tự import (kỳ đóng/tồn âm/OB trước phiếu/unique mã+kho). Thay thế workaround "xóa rồi import lại". Gỡ §3 note "không hỗ trợ sửa trực tiếp". |
| 2026-07-08 | 5 | Business Authority (quannn) + main agent | **Gọn title FEAT-OB-LIST "Danh sách tồn đầu kỳ đã import" → "Danh sách tồn đầu kỳ"** (cascade FEAT-OB-LIST v6). §4 Features row FEAT-OB-LIST title. Lý do: BA quannn 2026-07-08 quyết định label đã hiển thị dữ liệu tồn đầu kỳ là đủ ngữ cảnh — bỏ hàm nghĩa "đã import". |
| 2026-07-08 | 6 | Business Authority (quannn) + main agent | **Fix NC-W04-EP-OB-003 — bổ sung dependency thiếu §5.1 + §5.2** (audit W04 doc hygiene — nhóm 2 MEDIUM). Các ADR core của W04 đã ratified sau ngày EP v4 gốc (2026-07-02) nhưng §5 chưa cascade. Cascade 4 mục: (1) §5.1 row `EP-INVENTORY-ACCOUNTING-PERIOD` rewrite mô tả: từ "chặn import/xóa" (semantic ẩn) → tường minh **cross-boundary REST advisory `V4-AP-LC` per ADR-021** (AP master ở `gf-accounting` sau EP v16 boundary move) + fail-CLOSED commit / fail-OPEN preview + marker `warningLockCheckUnavailable`. (2) §5.2 thêm row **`gf-accounting`** — cross-boundary REST advisory + `AccountingPeriodClient` circuit breaker + Spring Retry + cache 60s. (3) §5.2 thêm row **Sổ tồn ledger `inventory_stock_ledger`** — OB writer đầu tiên, cascade `origin_context = OB_IMPORT/OB_EDIT/OB_DELETE`, `cascadedKeys[]` output shape ADR-020 v4 §C4. (4) §5.2 thêm row **ADR references** — ADR-020 v4 (stock ledger + engine C1..C8) + ADR-021 (REST advisory) + ADR-022 v3 (all-or-nothing + empty-file semantic BR-OB-004a/b). (5) §5.2 rewrite row `gf-inventory` chi tiết hơn (entity `opening_balance_line` + `inventory_stock_ledger` + engine `applyDelta()` + `cascadedKeys[]`) và row `agg-garage-graph` liệt kê 6 op W04 + `@FeatureOn` gate per CR-20260707-02. Không đổi §4 Features / §6 Success Metric. |
