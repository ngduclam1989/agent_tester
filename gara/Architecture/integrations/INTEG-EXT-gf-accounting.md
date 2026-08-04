---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 5
tier: T1
owner_authority: Architecture Authority
boundary: "gf-accounting (provider)"
provider: "gf-accounting"
last_reviewed: "2026-06-24"
supersedes: "none"
---

# Integration — Garage services ↔ `gf-accounting` (BE↔BE Garage-internal)

> Document tích hợp BE↔BE cho `gf-accounting` làm **provider**. 2 caller S2S: `gf-sales` (widget công nợ BH — ACTIVE design) + future RECEIPT-V2 / DELIVERY-V2 / PRC backends (AP lock-check — DESIGN ADR-019).
> ⚠️ **DESIGN (EP-INSURANCE-SETTLEMENT, CR-1780147390, ADR-014/015)** + **DESIGN (EP-INVENTORY-ACCOUNTING-PERIOD, ADR-019, Delivery Authority boundary correction 2026-06-23)** — chưa có trong source.
>
> Lưu ý: gf-accounting cũng là **caller** của gf-sales (settle/reopen/for-settlement/for-print) — chiều đó document tại [INTEG-EXT-gf-sales.md](INTEG-EXT-gf-sales.md). File này chỉ document chiều **gọi TỚI gf-accounting**.

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Provider | **`gf-accounting`** — Settlement + Insurance Settlement (Phiếu QT BH, Hồ sơ BH, đối soát thanh toán BH) master (ADR-014) + **Accounting Period (Kỳ kế toán) master (ADR-019)** |
| Provider docs | [Architecture/api/gf-accounting-api.md](../api/gf-accounting-api.md), [Architecture/hld/gf-accounting-HLD.md](../hld/gf-accounting-HLD.md) |
| Used by boundary | `gf-sales` (insurance debt widget) · **future RECEIPT-V2 / DELIVERY-V2 / PRC backends (AP lock-check, ADR-019)** |
| Module / class | `gf-sales`: `GfAccountingClient.java` (DESIGN — chưa có) · **future RECEIPT-V2/DELIVERY-V2/PRC: `GfAccountingClient.checkLock(date)` (DESIGN — chưa có)** |
| Sandbox URL | `gf-accounting.url=${GF_ACCOUNTING_URL}` |
| Production URL | Env runtime |
| API version pinned | `/protected/v1/...` |
| SDK / library | Spring HTTP Interface |
| Category | Internal Garage service (settlement master) |

### Caller config

| Caller | Client class | Config property |
|---|---|---|
| `gf-sales` | `GfAccountingClient.java` (DESIGN) | `gf-accounting.api.base-url` |
| **future RECEIPT-V2 / DELIVERY-V2 / PRC** (gf-inventory backend modules) _(DESIGN — ADR-019)_ | `GfAccountingClient.java` (will reuse cùng client class hoặc tạo dedicated `GfAccountingLockClient.java` — DEV decision khi implement) | `gf-accounting.api.base-url` (cùng config) |

---

## 2. Why this provider (decision)

**Decision**: gf-sales gọi gf-accounting để lấy **số liệu công nợ bảo hiểm** cho widget Dashboard (FEAT-INS-DASH-DEBT).

**Why**: gf-accounting sở hữu Phiếu QT BH + bản ghi thanh toán BH (`insurance_settlement_payments`) → là master số liệu "Còn phải thu BH" (CB-INS-008). gf-sales **KHÔNG** query DB cross-boundary; widget aggregation gọi REST debt-summary (ADR-015 — REST thay vì projection/CQRS).

**Ref**: ADR-014 (ownership), ADR-015 (debt-summary strategy), CB-INS-008.

---

## 3. Authentication & Authorization

| Thuộc tính | Giá trị |
|---|---|
| Auth method | `x-api-key` header (`INTERNAL_API_KEY`) |
| Tenant resolution | `X-Tenant-Id` header (HOẶC PathVariable `{tenantId}` tuỳ chuẩn endpoint) |

---

## 4. Endpoints / Operations Used

| # | Operation | Method | Path | Used by | Trigger |
|---|---|---|---|---|---|
| 1 | Insurance debt summary | GET | `/protected/v1/insurance-debt-summary?period={period}` | gf-sales | Render widget công nợ BH (3 KPI + 2 top-list) trên Dashboard |
| 2 _(DESIGN — ADR-019)_ | Accounting Period lock-check | GET | `/protected/v1/accounting-periods/lock-check?date={YYYY-MM-DD}&tenantId={t}` | future RECEIPT-V2 / DELIVERY-V2 / PRC | Advisory pre-check user input date → fail-fast UX nếu ngày rơi vào kỳ CLOSED; downstream backend vẫn phải re-check authoritative tại commit time |

> `period` ∈ `YESTERDAY | THIS_WEEK | LAST_WEEK | THIS_MONTH | LAST_MONTH` (BR-INS-DASH-006).
>
> `date` _(op #2)_ ISO `YYYY-MM-DD`. `tenantId` BIGINT — fallback `X-Tenant-Id` header nếu query param absent.

---

## 5. Request / Response Contracts

### 5.1 Insurance debt summary

**Request**:
```
GET /protected/v1/insurance-debt-summary?period=THIS_MONTH
Headers: x-api-key, X-Tenant-Id
```

**Response**: `200 OK` `ApiResponse<InsuranceDebtSummaryResponse>`:
```json
{
  "data": {
    "totalReceivable": 980000000,
    "collectedInPeriod": 350000000,
    "pendingVoucherCount": 12,
    "topPendingByAmount": [ {"settlementCode":"SET-...","insuranceCompanyName":"...","remainingReceivable":...,"createdAt":"...","debtAgeDays":18} ],
    "topOverdueByAge":    [ {"settlementCode":"SET-...","insuranceCompanyName":"...","debtAgeDays":45,"remainingReceivable":...} ]
  }
}
```

**Rules**: chỉ phiếu `payerType=INSURANCE` + `status=DRAFT` chưa "Đã thu đủ" (BR-INS-DASH-001/003). Tuổi nợ tính **từ ngày tạo phiếu** (✅ chốt 2026-05-31 — BR-INS-DASH-004). Threshold cảnh báo = **30 ngày** (✅ chốt — MISS-INS-001).

### 5.2 Accounting Period lock-check _(DESIGN — ADR-019)_

**Request**:
```
GET /protected/v1/accounting-periods/lock-check?date=2026-06-15&tenantId=133
Headers: x-api-key, X-Tenant-Id
```

**Response (locked)**: `200 OK` `ApiResponse<AccountingPeriodLockCheckResult>`:
```json
{
  "data": {
    "locked": true,
    "periodId": 1024,
    "periodCode": "AP-MONTH-133-202606",
    "periodName": "Tháng 6/2026",
    "periodType": "MONTH",
    "status": "CLOSED",
    "startDate": "2026-06-01",
    "endDate": "2026-06-30"
  }
}
```

**Response (not locked — date trong OPEN period)**: cùng shape với `locked: false` + `status: "OPEN"`.

**Response (no period covers date)**: `locked: false`, `periodId: null`, `periodCode: null`, `status: null` (caller hiểu: chưa có kỳ nào include date này, downstream xử lý theo policy riêng — vd RECEIPT-V2 cho phép tạo phiếu).

**Rules**:
- Advisory only — KHÔNG enforcement authoritative; downstream backend phải re-check tại commit time (vd RECEIPT-V2 wrap `try-commit` with same lock-check inside transaction).
- Idempotent (read-only); cacheable.
- Caller-side LRU cache 30s (`(tenantId, date)` key) — balance freshness vs RTT.
- Tenant scope mandatory — `X-Tenant-Id` header và `tenantId` query param phải match (defensive).

---

## 6. Accounting Period lock-check consumer pattern _(DESIGN — ADR-019)_

> Future RECEIPT-V2 / DELIVERY-V2 / PRC backends (gf-inventory modules) consume `/protected/v1/accounting-periods/lock-check` để pre-check date trước final commit.

### 6.1 Caller candidates

| Caller (future) | Trigger | Action on `locked=true` |
|---|---|---|
| `gf-inventory` RECEIPT-V2 backend | User tạo / sửa / xóa phiếu nhập kho có ngày chứng từ rơi vào CLOSED period | Reject `400 ERR-INV-024` (BR-AP-012) — toast UI "Kỳ đã đóng" |
| `gf-inventory` DELIVERY-V2 backend | User tạo / sửa / xóa phiếu xuất kho có ngày chứng từ rơi vào CLOSED period | Reject `400 ERR-INV-024` (BR-AP-012) — toast UI "Kỳ đã đóng" |
| `gf-inventory` OPENING-BALANCE (OB) backend | User import / xóa OB với "Tồn đến ngày" rơi vào CLOSED period | Reject `400 ERR-INV-024` (BR-AP-013 — liên hệ gián tiếp qua ngày) |
| `gf-inventory` PRC backend | User chạy `FEAT-PRC-CREATE` (lần đầu) hoặc `FEAT-PRC-RECALC` cho period CLOSED | Reject `400 ERR-INV-024` (BR-PRC-008 — phải mở lại kỳ qua FEAT-AP-EDIT) |

### 6.2 Recommended pattern

```
Caller (RECEIPT-V2/DELIVERY-V2/PRC backend)
  │ User submit form (vd tạo phiếu nhập ngày X)
  ▼
  [pre-check — fail-fast UX]
  GfAccountingClient.checkLock(date=X, tenantId=T)
  │ ← cache LRU 30s ←
  ▼
  IF locked=true → return 400 ERR-INV-024 (UI toast "Kỳ đã đóng"); KHÔNG attempt commit
  IF locked=false → proceed to business validation
  ▼
  [authoritative re-check — defensive vs stale cache]
  Inside @Transactional commit guard:
    re-fetch lock-check (no cache) OR re-query accounting_period directly via REST
    IF still locked=false → COMMIT
    IF flipped to locked=true (race: kỳ vừa đóng trong 30s gap) → ROLLBACK + return 400 ERR-INV-024
```

### 6.3 Future event-driven cache invalidation (when PROPOSED → ACTIVE flip)

Khi `AccountingPeriodClosed`/`AccountingPeriodReopened` events flip ACTIVE (future wave per ADR-019):
- Caller subscribe topic `AC-DEV-ACCOUNTING-EVENTS` (group `dev-{caller-service}-of-accounting-cg`).
- Event consume → evict cache entry `(tenantId, date)` cho mọi date trong `[startDate, endDate]` của period.
- Inbox dedup mandatory (ADR-004).
- REST lock-check vẫn giữ làm authoritative fallback (event lag / message loss insurance).

---

## 7. Failure Handling

| Mode | Action |
|---|---|
| Network timeout | gf-sales widget render stale-from-cache + cảnh báo "số liệu tạm"; KHÔNG block Dashboard khác |
| Provider 5xx | Single retry idempotent read; fallback cache |
| 400 (period sai) | Surface validation, default THIS_MONTH |

---

## 8. Idempotency & Ordering

| Thuộc tính | Giá trị |
|---|---|
| Read (GET summary) | Idempotent; an toàn cache. Cache TTL = **5 phút** (✅ chốt 2026-05-31 — ADR-015). |
| Cache freshness | Cache TTL 5 phút, không event eviction — eventual consistency qua TTL expiry only. |

---

## 9. Observability

| Metric | Tags |
|---|---|
| `gf-sales.accounting_client.requests` | `op=debt-summary`, `period`, `status` |
| `gf-sales.accounting_client.duration` | `op`, `period` |

Log: `correlation_id`, `tenantId`, `caller=gf-sales`, `op`, `period`, `latency_ms`.

---

## 10. SLA, Quotas & Cost

Internal. p95 < 500ms (aggregate query + index `(tenant_id, payer_type, status)`). Widget chấp nhận eventual consistency qua cache.

---

## 11. PII / Compliance

Summary trả tên DN BH + số tiền — KHÔNG PII khách hàng. Audit truy cập theo tenant.

---

## 12. Sandbox vs Production

Env switchover via `GF_ACCOUNTING_URL`.

---

## 13. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock GfAccountingClient |
| Integration | Real gf-accounting test instance — verify period filter + tenant scope |
| Cross-caller contract | Verify schema `InsuranceDebtSummaryResponse` giữa gf-accounting controller và gf-sales widget |

---

## 14. Runbook

| Scenario | Action |
|---|---|
| gf-accounting down | Widget công nợ render từ cache + banner "tạm thời"; không block Dashboard; alert ops |
| Schema drift (summary fields) | Bilateral CR MAJOR; coordinate gf-sales widget |
| Cache stale lâu | Kiểm tra Redis TTL config (5 phút); verify cache key scope `(tenantId, period)` |

---

## 15. Forbidden patterns

- ❌ gf-sales query trực tiếp DB `gf_accounting` cho số liệu công nợ — phải qua REST debt-summary (CB-INS-008, ADR-015).
- ❌ Skip `x-api-key` / tenant header — provider reject / cross-tenant leak.
- ❌ Hardcode `INTERNAL_API_KEY` / `GF_ACCOUNTING_URL` — env vars only.
- ❌ Dùng event làm **nguồn số liệu** công nợ (cache TTL 5 phút, không event eviction; số liệu = REST).
- ❌ Cache summary không scope theo `tenantId` + `period` — sai số liệu cross-tenant/cross-period.
- ❌ **(DESIGN — ADR-019)** future RECEIPT-V2 / DELIVERY-V2 / PRC query trực tiếp DB `gf_accounting.accounting_period` cho lock-check — phải qua REST `/protected/v1/accounting-periods/lock-check` (Critical Rule #1 boundary isolation).
- ❌ **(DESIGN — ADR-019)** Skip authoritative re-check ở commit guard (chỉ rely vào pre-check lock-check 30s cache) — race window khi user vừa đóng kỳ trong 30s gap; phải defensive re-check (xem §6.2 pattern).
- ❌ **(DESIGN — ADR-019)** Cache lock-check không scope theo `(tenantId, date)` — sai response cross-tenant hoặc cross-date.
- ❌ **(DESIGN — ADR-019)** Subscribe Kafka events `AccountingPeriodClosed`/`Reopened` trong batch — events status `PROPOSED` không publish; subscribe sớm = consumer idle/error log noise. Subscribe khi flip ACTIVE (future wave).

## 16. References

- HLD provider: [gf-accounting-HLD.md](../hld/gf-accounting-HLD.md) §8 Insurance Settlement, **§9 Accounting Period extension**
- HLD caller: [gf-sales-HLD.md](../hld/gf-sales-HLD.md) §8 (debt widget); **future RECEIPT-V2/DELIVERY-V2/PRC: gf-inventory-HLD.md (TBD when implement)**
- API contract: [gf-accounting-api.md §3bis.8](../api/gf-accounting-api.md), [gf-accounting-api.md §4.7 lock-check](../api/gf-accounting-api.md), [gf-sales-api.md §3bis.3](../api/gf-sales-api.md)
- Events: [gf-accounting-events.md](../events/gf-accounting-events.md) — **§2 AP PROPOSED events**
- Related ADRs: ADR-014 (ownership), ADR-015 (debt-summary strategy), ADR-004 (Kafka), **ADR-019 (Accounting Period on gf-accounting)**
- Reverse direction (gf-accounting → gf-sales): [INTEG-EXT-gf-sales.md](INTEG-EXT-gf-sales.md) §4 ops #3-#6
- Product: EP-INSURANCE-SETTLEMENT, BR-EP-INSURANCE-SETTLEMENT (CB-INS-008, BR-INS-DASH-*); **EP-INVENTORY-ACCOUNTING-PERIOD + 5 FEAT-AP-* + BR-GF-INVENTORY-ACCOUNTING-PERIOD (BR-AP-012, BR-AP-013) — frontmatter `boundary: gf-inventory` mismatch (OQ1)**
- Tracking: [Tracking/arch-design-inventory-v2-answers-1.md](../../Tracking/arch-design-inventory-v2-answers-1.md) — Q4 SUPERSEDED note

## 17. Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-30 | v1 | Initial (NEW file, DESIGN — EP-INSURANCE-SETTLEMENT, CR-1780147390, ADR-014/015): BE↔BE provider gf-accounting, caller gf-sales — 1 operation `GET /protected/v1/insurance-debt-summary` (widget công nợ BH, period filter, x-api-key + tenant). REST thay vì cross-boundary DB (CB-INS-008); cache + event evict (`insurance-payment-recorded`). Full 16-section contract. Reverse direction (gf-accounting caller của gf-sales) tại INTEG-EXT-gf-sales. |
| 2026-05-31 | v2 | **Resolve Open Questions (Delivery Lead)**: cache TTL = 5′; tuổi nợ từ ngày tạo phiếu; threshold cảnh báo 30 ngày. |
| 2026-06-03 | v4 | **Xoá event eviction references**: cache debt widget → TTL 5 phút only. |
| 2026-05-31 | v3 | **ADR renumber 4→3** (gộp ADR-015 workflow vào ADR-014): debt-summary = ADR-015 (callout §0, §2 Why, §7, §14, §15 references). |
| 2026-06-24 | v5 | **+Accounting Period lock-check consumer pattern (DESIGN — EP-INVENTORY-ACCOUNTING-PERIOD, ADR-019, Delivery Authority boundary correction 2026-06-23)**: §1 Identity +AP master role + future RECEIPT-V2/DELIVERY-V2/PRC callers. §4 Operations +row #2 lock-check (S2S advisory). §5.2 full contract (request/response shapes — locked / not-locked / no-period). §6 mới — Caller candidates table + recommended pattern (pre-check fail-fast + authoritative re-check) + future event-driven cache invalidation. §7-§17 renumbered (old §6-§16). §15 Forbidden +4 bullet (no direct DB query AP, no skip authoritative re-check, cache scope `(tenantId, date)`, no subscribe PROPOSED events in batch). §16 References +ADR-019, AP api §4.7, events §2 AP, AP Product files, Tracking. v4 → v5. |
