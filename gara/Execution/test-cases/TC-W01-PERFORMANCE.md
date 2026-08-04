---
document_id: 'GMS-TC-W01-PERFORMANCE'
type: test-case
parent: 'Execution/test-cases/TEST-CASE-REGISTRY.md'
status: ACTIVE
version: 1
boundary: 'gf-sales, gf-accounting, agg-garage-graph'
wave: 'W01'
owner: 'QA Authority'
last_reviewed: '2026-06-11'
---

# Test Case Template - W01: Performance

> Split từ `TC-W01-API.md` — gom các TC `Type=Performance` (SLA load test). TC ID giữ nguyên prefix `TC-W01-API-NNN` từ file gốc.

---

## 1. General Info

| Field         | Value                                                      |
| ------------- | ---------------------------------------------------------- |
| Document ID   | `GMS-TC-W01-PERFORMANCE`                                   |
| Wave          | W01                                                        |
| Boundary(ies) | `gf-sales`, `gf-accounting`, `agg-garage-graph`            |
| Feature(s)    | `FEAT-INS-SO-ADJUSTMENT`, `FEAT-INS-STL-DETAIL`            |
| Owner         | QA Authority                                               |
| Last Reviewed | 2026-06-11                                                 |
| Work Package  | `Execution/work-packages/PKG-W01-insurance-foundation.md`  |

---

## 2. Scope

### In Scope

- Performance / SLA load test cho 2 feature W01 (SO save với allocation, GET phiếu QT BH detail, createInsuranceSettlement success rate)

### Out of Scope

- Functional correctness — xem `TC-W01-API.md`
- UI rendering performance — out of W01 scope

### Test Environment & Data

| Item          | Required Data / Setup                                                       | Notes                                            |
| ------------- | --------------------------------------------------------------------------- | ------------------------------------------------ |
| Staging env   | gf-sales + gf-accounting + agg-garage-graph + DataLoader bật                | —                                                |
| Seed data     | 10.000 SO/tenant + 1.000 phiếu QT BH/tenant                                 | Load realistic                                   |
| Load tool     | k6 configured                                                               | —                                                |

---

## 3. Status Summary

| Coverage Mode | Total | Status Summary |
| ------------- | ----- | -------------- |
| Automated     | N/A   | —              |
| Manual        | 3     | 3 READY        |

---

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W01-API-066 | FEAT-INS-SO-ADJUSTMENT | gf-sales, agg-garage-graph | PKG §4.3 SLA | Performance | Performance | P2 | SO Edit save với allocation payload — p99 < 800ms | Staging; 10.000 SO seed; 20 concurrent users; k6 configured | 1. Chạy load test `updateServiceOrderV3` (allocation đầy đủ), concurrency 20 users, 60s.<br>2. Ghi nhận p99 + error rate. | - p99 < 800ms.<br>- Error rate < 0.1%.<br>- Không OOM / connection pool exhaustion trong log. | READY | N/A |
| TC-W01-API-099 | FEAT-INS-STL-DETAIL | gf-accounting, agg-garage-graph | PKG §4.3/§9 SLA | Performance | Performance | P2 | [Perf] GET chi tiết phiếu QT BH — p99 < 600ms | Staging; seed 1.000 phiếu QT BH/tenant; 20 concurrent users | 1. Chạy load test `getSettlementByCode` phiếu BH đầy đủ, 20 concurrent, 60s.<br>2. Ghi nhận p50/p95/p99 và error rate.<br>3. Kiểm tra log query. | - p99 < 600ms.<br>- Error rate < 0.1%.<br>- Không N+1 query (DataLoader hoạt động). | READY | N/A |
| TC-W01-API-100 | FEAT-INS-STL-DETAIL | agg-garage-graph, gf-sales, gf-accounting | ADR-014, PKG §9 SLA | Performance | Performance | P3 | [Perf] createInsuranceSettlement (pull → cặp atomic → settle) success rate ≥ 99.5% | Staging; SO seed sẵn sàng tạo QT; 10 concurrent | 1. Chạy 200 lần `createInsuranceSettlement` trên SO khác nhau, 10 concurrent.<br>2. Ghi nhận success rate + latency. | - Success rate ≥ 99.5%.<br>- Không rollback dở dang (DB sạch khi fail).<br>- Latency trong ngưỡng quan sát hợp lý. | READY | N/A |

---

## 5. Changelog

| Date     | Change                                              | Author     |
| -------- | --------------------------------------------------- | ---------- |
| 2026-06-11 | Split từ `TC-W01-API.md` — extract 3 TC Type=Performance: TC-W01-API-066, TC-W01-API-099, TC-W01-API-100. TC ID + nội dung row giữ nguyên (không renumber). | QA Authority |
