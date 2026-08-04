---
document_id: "TR-W01-PERFORMANCE"
type: test-report
parent: SV-TEST-CASE-REGISTRY
status: FINAL
version: 3
wave: "W01"
agent: "agent-test-performance"
boundary: "gf-sales, gf-accounting, agg-garage-graph"
execution_date: "2026-06-17"
last_reviewed: "2026-06-17"
---

# Báo cáo kiểm thử — Wave 01: Performance (Insurance Foundation)

> Báo cáo kết quả kiểm thử hiệu năng W01 — `agent-test-performance`.
> Scope: sanity check 3 hot paths mới trong EP-INSURANCE-SETTLEMENT slice 1/3 (FEAT-INS-SO-ADJUSTMENT + FEAT-INS-STL-DETAIL).
> W01 KHÔNG phải designated perf wave (WT-M/WT-F) — mục tiêu là xác nhận SLO không bị vi phạm trên hot path mới trước khi release; deep load/soak deferred.

---

## 1. Tổng quan

| Trường | Giá trị |
|---|---|
| **Wave** | W01 |
| **Subject / execution slice** | Performance sanity — hot paths EP-INSURANCE-SETTLEMENT |
| **Boundary(ies)** | `gf-sales`, `gf-accounting`, `agg-garage-graph` |
| **Agent thực thi** | `agent-test-performance` |
| **Nguồn thống kê** | AUTOMATED (k6 load test) |
| **Ngày bắt đầu (Run 1)** | 2026-06-11 |
| **Ngày kết thúc (latest run)** | 2026-06-17 |
| **Số lần chạy chính thức** | 3 (Run 1 = initial sanity; Run 2 = re-run per /test-exec W01; Run 3 = FINAL REGRESSION ROUND) |
| **Loại kiểm thử** | Load (20 VUs × 60s steady state) |
| **Môi trường** | Local (`docker compose`) |
| **Phiên bản code (latest run)** | Branch `feature/ep-insurance-settlement-w01` |
| **Gate source** | PKG-W01 §9 Post-Wave Actuals (SLO thực tế: p99 SO save < 800ms; p99 GET detail < 600ms; createInsuranceSettlement success ≥ 99.5%) |
| **Kết luận tổng quát (latest run)** | **PASS** (2/3 TC passed; 1/3 TC BLOCKED do data seed không đủ — persistent qua 3 runs) |

---

## 1.5 Run Timeline

| Run # | Ngày | Trigger | Commit | TC executed | PASS | FAIL | BLOCKED | SKIPPED | New bugs (BUG-IDs) | Bugs verified (BUG-IDs) | Verdict |
|---|---|---|---|---:|---:|---:|---:|---:|---|---|---|
| 1 | 2026-06-11 | TEST_EXECUTION spawn từ /test-exec W01 | HEAD `feature/ep-insurance-settlement-w01` | 3 | 2 | 0 | 1 | 0 | — | — | PASS (partial — TC-003 blocked by data) |
| 2 | 2026-06-11 | /test-exec W01 re-run (orchestrator) | HEAD `feature/ep-insurance-settlement-w01` | 3 | 2 | 0 | 1 | 0 | — | — | PASS (partial — TC-003 blocked persistent) |
| 3 | 2026-06-17 | FINAL REGRESSION ROUND — VERIFY BUGS + FINAL REGRESSION per /test-exec W01 | HEAD `feature/ep-insurance-settlement-w01` | 3 | 2 | 0 | 1 | 0 | — | 0 bugs verified (0 perf bugs in WAITING-VERIFY) | PASS (partial — TC-003 blocked persistent; block reason clarified: status constraint PRICING≠COMPLETED) |

---

## 2. Kết quả chi tiết

### 2.1 Tổng hợp theo TC

| TC ID | Title (nghiệp vụ) | SLO Target | Run 1 | Run 2 | Run 3 | Status | Ghi chú |
|---|---|---|---|---|---|---|---|
| TC-W01-PERF-001 | Lưu SO có phân bổ BH 5 khoản — p99 < 800ms | p99 < 800ms | p99=199.7ms | p99=228.48ms | p99=188.4ms | **PASS** | Stable across 3 runs; Run 3 best result; pool 4 SO (Run 3) vs 2 SO (Run 2) |
| TC-W01-PERF-002 | Xem chi tiết phiếu QT BH — p99 < 600ms | p99 < 600ms | p99=210.03ms | p99=170.29ms | p99=184.53ms | **PASS** | Stable across 3 runs; Run 3 pool 10 codes (expanded) |
| TC-W01-PERF-003 | Tạo phiếu QT BH atomic success rate ≥ 99.5% | success rate ≥ 99.5% | Chưa đo | Chưa đo | Chưa đo | **BLOCKED** | Run 3 xác nhận block kép: pool nhỏ (2 SO vs 200 cần) + status sai (PRICING≠COMPLETED) |

### 2.2 TC-W01-PERF-001: updateServiceOrderV3 với insurance allocation

#### Run 1 (2026-06-11)

**Load profile:**
- Runner: `grafana/k6:latest` (v2.0.0+dirty) via Docker
- Endpoint: `http://172.17.0.1:45401/garage/graphql`
- VUs: 20; warm-up 10s; steady 60s
- Data pool: SO IDs [3, 4, 5, 6] — has_insurance=true, shared pool

**Kết quả Run 1:**

| Metric | Giá trị | SLO | Verdict |
|---|---|---|---|
| p50 | 98.08ms | — | — |
| p95 | 158.35ms | — | — |
| p99 | **199.7ms** | < 800ms | **PASS** (headroom 75%) |
| max | 272.75ms | — | — |
| throughput | 182.1 req/s | — | — |
| HTTP error rate | 0.00% | < 0.1% | **PASS** |
| Tổng requests | 12.762 | ≥ 300 | OK |

#### Run 2 (2026-06-11)

**Load profile:**
- Runner: `grafana/k6:latest` via Docker
- Endpoint: `http://172.17.0.1:45401/garage/graphql`
- VUs: 20; warm-up 10s ramp 0→20; steady 60s @20 VUs
- Data pool: SO IDs [4, 10] — CHECKED, hasInsurance=true, tenant_id=1
- Script: `/tmp/perf-w01-run2/tc001-update-so-insurance.js`

**Kết quả Run 2:**

| Metric | Giá trị | SLO | Verdict |
|---|---|---|---|
| p50 | 115.98ms | — | — |
| p90 | 169.59ms | — | — |
| p95 | 190.74ms | — | — |
| p99 | **228.48ms** | < 800ms | **PASS** (headroom 71.5%) |
| max | 321.01ms | — | — |
| avg | 121.92ms | — | — |
| throughput | 152.1 req/s | — | — |
| HTTP error rate | 0.00% | < 0.1% | **PASS** |
| GraphQL error rate | 0.00% | < 0.1% | **PASS** |
| Tổng requests | 10.652 | ≥ 300 | OK |
| Checks pass rate | 100% (31.956/31.956) | — | OK |

**Log check gf-sales trong cửa sổ test Run 2:**
- HikariCP pool exhaustion: không có
- OOM / OutOfMemoryError: không có
- Lỗi từ k6 TC-001: 0

**Caveats Run 2:**
- Pool thu hẹp từ 4 SO (Run 1) xuống 2 SO (Run 2 — SOs 3 và 5,6 không còn CHECKED). Write contention trên 2 bản ghi với 20 VUs = worst-case.
- p99 tăng nhẹ (199.7ms → 228.48ms) do pool nhỏ hơn — expected variance. Cả 2 run đều trong SLO.
- Redis cache có thể warm → latency tốt hơn thực tế cold-path.

#### Run 3 (2026-06-17) — FINAL REGRESSION

**Load profile:**
- Runner: `grafana/k6:latest` via Docker
- Endpoint: `http://172.17.0.1:45401/garage/graphql`
- VUs: 20; warm-up 10s ramp 0→20; steady 60s @20 VUs
- Data pool: SO IDs [4, 10, 14, 16] — PRICING, hasInsurance=true, tenant_id=1 (pool expanded vs Run 2)
- Script: `/tmp/perf-w01-run3/tc001-update-so-insurance.js`
- Auth: sso-stub `GET /dev/token?identifier=accountant@demo.local` → accessToken

**Kết quả Run 3:**

| Metric | Giá trị | SLO | Verdict |
|---|---|---|---|
| p50 | 103.5ms | — | — |
| p90 | 142.3ms | — | — |
| p95 | 159ms | — | — |
| p99 | **188.4ms** | < 800ms | **PASS** (headroom 76.5%) |
| max | 254.58ms | — | — |
| avg | 107.2ms | — | — |
| throughput | 172.9 req/s | — | — |
| HTTP error rate | 0.00% | < 0.1% | **PASS** |
| GraphQL error rate | 0.00% | 0/12.119 | **PASS** |
| Tổng requests | 12.119 | ≥ 300 | OK |
| Checks pass rate | 100% (36.357/36.357) — HTTP 200 + no GraphQL errors + success=true | — | OK |

**Caveats Run 3:**
- Pool 4 SO (Run 3) vs 2 SO (Run 2) — giảm write contention, p99 cải thiện (228ms → 188ms).
- Tất cả SOs ở PRICING status. Write trên cùng 4 bản ghi với 20 VUs = worst-case lock contention cho số pool này.
- Redis cache warm → latency tốt hơn thực tế cold-path.

---

### 2.3 TC-W01-PERF-002: getSettlementByCode với insurance additive block

#### Run 1 (2026-06-11)

**Load profile:**
- Data pool: 2 INSURANCE settlement codes (SET-20260610-00002, SET-20260611-00001)
- VUs: 20; warm-up 10s; steady 60s

**Kết quả Run 1:**

| Metric | Giá trị | SLO | Verdict |
|---|---|---|---|
| p50 | 121.24ms | — | — |
| p95 | 179.16ms | — | — |
| p99 | **210.03ms** | < 600ms | **PASS** (headroom 65%) |
| max | 308.6ms | — | — |
| throughput | 148.6 req/s | — | — |
| HTTP error rate | 0.00% | < 0.1% | **PASS** |
| Tổng requests | 10.418 | ≥ 300 | OK |

#### Run 2 (2026-06-11)

**Load profile:**
- Runner: `grafana/k6:latest` via Docker
- Endpoint: `http://172.17.0.1:45401/garage/graphql`
- VUs: 20; warm-up 10s; steady 60s
- Data pool: 4 INSURANCE codes: SET-20260610-00002, SET-20260611-00001, SET-20260611-00003, SET-20260611-00004
- Full insurance block query verified vs live schema (Run 2 introspection)
- Script: `/tmp/perf-w01-run2/tc002-get-settlement-detail.js`

**Kết quả Run 2:**

| Metric | Giá trị | SLO | Verdict |
|---|---|---|---|
| p50 | 103.88ms | — | — |
| p90 | 137.32ms | — | — |
| p95 | 148.57ms | — | — |
| p99 | **170.29ms** | < 600ms | **PASS** (headroom 71.6%) |
| max | 232.87ms | — | — |
| avg | 104.05ms | — | — |
| throughput | 178.0 req/s | — | — |
| HTTP error rate | 0.00% | < 0.1% | **PASS** |
| GraphQL error rate | 0.00% | < 0.1% | **PASS** |
| Tổng requests | 12.471 | ≥ 300 | OK |
| Checks pass rate | 100% (49.884/49.884) | — | OK |

**N+1 guard Run 2:**
- Response time stable across 12.471 requests — không có escalation pattern
- No N+1 query indicators (DataLoader active)

#### Run 3 (2026-06-17) — FINAL REGRESSION

**Load profile:**
- Runner: `grafana/k6:latest` via Docker
- Endpoint: `http://172.17.0.1:45401/garage/graphql`
- VUs: 20; warm-up 10s; steady 60s
- Data pool: 10 INSURANCE codes (expanded from Run 2's 4):
  SET-20260617-00004, SET-20260617-00002, SET-20260616-00003, SET-20260615-00004, SET-20260615-00002,
  SET-20260612-00002, SET-20260611-00004, SET-20260611-00003, SET-20260611-00001, SET-20260610-00002
- Script: `/tmp/perf-w01-run3/tc002-get-settlement-detail.js`
- Auth: sso-stub `GET /dev/token?identifier=accountant@demo.local` → accessToken

**Kết quả Run 3:**

| Metric | Giá trị | SLO | Verdict |
|---|---|---|---|
| p50 | 109.06ms | — | — |
| p90 | 145.65ms | — | — |
| p95 | 158.23ms | — | — |
| p99 | **184.53ms** | < 600ms | **PASS** (headroom 69.2%) |
| max | 266.1ms | — | — |
| avg | 110.82ms | — | — |
| throughput | 167.1 req/s | — | — |
| HTTP error rate | 0.00% | < 0.1% | **PASS** |
| GraphQL error rate | 0.00% | 0/11.708 | **PASS** |
| Tổng requests | 11.708 | ≥ 300 | OK |
| Checks pass rate | 100% (35.124/35.124) — HTTP 200 + no GraphQL errors + has data | — | OK |

**Caveats Run 3:**
- Pool 10 codes vs 4 codes (Run 2) — cache spread tốt hơn nhưng p99 hơi cao hơn Run 2 (184ms vs 170ms) do thêm codes chưa fully warm.
- Tất cả 10 records đã cache-hot sau warm-up. Cold-path p99 với 1000+ diverse records sẽ cao hơn — cần verify WT-M/WT-F.
- Headroom 69.2% vs SLO 600ms vẫn đủ buffer lớn.

---

### 2.4 TC-W01-PERF-003: createInsuranceSettlement success rate — BLOCKED (Run 1 + Run 2 + Run 3)

**Block persistent sau Run 3 (clarified):**
- Run 1: 4 SO eligible (IDs 3, 4, 5, 6) — quá ít (cần 200)
- Run 2: 0 SO eligible — tất cả SO với hasInsurance=true đã có settlement records
- Run 3: 2 SO (IDs 4, 5) có insurance không SETTLED — nhưng cả 2 ở PRICING status; probe API xác nhận: createInsuranceSettlement trả lỗi BAD_REQUEST "Service order must be COMPLETED or SETTLED to read settlement snapshot. Current status: PRICING"

**Block kép Run 3 (clarified):**
1. Pool nhỏ: chỉ 2 SO có insurance chưa SETTLED (cần 200)
2. Status sai: SO 4 và 5 ở PRICING — cần COMPLETED để pull snapshot qua `/protected/v1/service-orders/{tenant}/{id}/for-settlement`

**Không có product defect.** TC block hoàn toàn do data infrastructure + missing status transition trong data seed.

---

## 3. Môi trường thực thi

### 3.1 Infrastructure Status (Run 3 — 2026-06-17)

| Container | Image | Status |
|---|---|---|
| gf-postgres | postgres:16-alpine | healthy |
| gf-redis | redis:7.4.8-alpine | healthy |
| gf-kafka | apache/kafka:3.9.1 | healthy |
| gf-sales | gf-sales:local | healthy |
| gf-accounting | gf-accounting:local | healthy |
| agg-garage-graph | agg-garage-graph:local | healthy |
| gf-sims | infra-sims | healthy |
| garage-web | garage-web:local | healthy |

### 3.2 Service Health Check (Run 3)

| Service | Endpoint | Status |
|---|---|---|
| gf-sales | `GET http://localhost:45091/actuator/health` | `{"status":"UP"}` |
| gf-accounting | `GET http://localhost:45081/actuator/health` | `{"status":"UP"}` |
| agg-garage-graph BFF | `POST http://localhost:45401/garage/graphql {"query":"{__typename}"}` | `{"data":{"__typename":"Query"}}` |

### 3.3 Cấu hình kỹ thuật đã xác minh (Run 3)

| Item | Giá trị xác minh |
|---|---|
| BFF GraphQL endpoint | `/garage/graphql` (CONTEXT_PATH=/garage + GRAPHQL_PUBLIC_PATH=/graphql) |
| Tenant ID header | `X-Tenant-Id: 1` (numeric) |
| Auth token source | sso-stub `GET http://localhost:45410/dev/token?identifier=accountant@demo.local` → field `accessToken` |
| Auth note | `login` mutation KHÔNG tồn tại trên `agg-garage-graph` (Run 3 xác nhận — GraphQL error) |
| k6 runner | `grafana/k6:latest` Docker, volume mount `/tmp/perf-w01-run3/` |
| k6 → BFF network | `http://172.17.0.1:45401/garage/graphql` (Docker bridge gateway → host) |
| updateServiceOrderV3 union | `ApiResponse { success code message }` / `ErrorResponse { message statusCode }` |
| getSettlementByCode union | `ApiResponseSettlementByCodeResponse { success data: SettlementByCodeData }` / `ErrorResponse` |
| createInsuranceSettlement args | `id: Int, input: CreateInsuranceSettlementRequest { customerNotes: String, insuranceNotes: String }` |
| createInsuranceSettlement SO status req | SO phải ở COMPLETED hoặc SETTLED (BAD_REQUEST khi PRICING) |

### 3.4 Data Inventory (Run 3)

| Item | Yêu cầu | Thực tế Run 3 | Gap |
|---|---|---|---|
| Total SO/tenant | 10.000 | 19 | Thiếu 9.981 |
| SO có insurance + non-SETTLED (cho TC-001) | ≥ 500 | 4 (IDs 4, 10, 14, 16) ở PRICING | Thiếu 496 |
| INSURANCE settlement records (cho TC-002) | 1.000 | 10 | Thiếu 990 |
| SO unique cho TC-003 pool (COMPLETED, no settlement) | 200 | 0 | Thiếu 200 — BLOCKER TC-003 (persistent) |

---

## 4. Phân tích kết quả

### 4.1 SLO Compliance (tổng hợp 3 runs)

| SLO | Target | Run 1 | Run 2 | Run 3 | Trend | Verdict | Confidence |
|---|---|---|---|---|---|---|---|
| SO Edit save p99 | < 800ms | 199.7ms | 228.48ms | **188.4ms** | Stable — variance do pool size; Run 3 best | **PASS** | Trung bình — pool nhỏ = worst-case write contention |
| GET phiếu QT BH detail p99 | < 600ms | 210.03ms | 170.29ms | **184.53ms** | Stable trong range 170–210ms | **PASS** | Trung bình — cache-hot all records |
| createInsuranceSettlement success rate | ≥ 99.5% | Chưa đo | Chưa đo | Chưa đo | BLOCKED persistent — 3 runs | **BLOCKED** | — |

### 4.2 Bottleneck / Observation

1. **TC-001 — SO update path**: p99 dao động 188–228ms qua 3 runs — variance phụ thuộc pool size (write lock contention). Tất cả đều trong SLO 800ms với headroom > 70%. Stable, không có pattern escalation.

2. **TC-002 — Settlement GET path**: p99 dao động 170–210ms qua 3 runs — cache-spread effect. Run 3 p99=184ms (10 codes). Cold-path với 1000+ diverse records sẽ cao hơn — chưa đo.

3. **Không có connection pool exhaustion hoặc OOM**: Stable dưới 20 VUs qua cả 3 runs.

4. **TC-003 block clarified (Run 3)**: Probe API xác nhận createInsuranceSettlement yêu cầu SO status=COMPLETED. Seed script cho WT-M/WT-F phải đưa SO lên COMPLETED trước khi chạy TC-003.

5. **Auth method clarified (Run 3)**: `login` mutation không tồn tại trên `agg-garage-graph`. Auth via sso-stub REST `GET /dev/token?identifier=accountant@demo.local` → accessToken.

### 4.3 Perf-Debt Candidates (không ghi DEBT-REGISTRY — để Architecture Authority quyết)

| Candidate | Mô tả | Đề xuất action |
|---|---|---|
| TC-003 seed script | Không có script seed 200+ SO unique COMPLETED cho createInsuranceSettlement pool | Tạo `infra/init-data/seed-insurance-so-pool.sql` với SO status=COMPLETED + reset mechanism trước WT-M/WT-F |
| Cache-cold GET phiếu QT BH | p99 cache-hot = 170–184ms (10 records); cache-cold path (1000+ diverse records) chưa đo | Đo cold-path WT-M/WT-F với 1000+ records diverse, reset Redis cache trước test |
| Full SO seed (10k) | Môi trường dev chỉ có 19 SO — ảnh hưởng tính đại diện | Seed script `infra/init-data/seed-so-volume.sql` 10k SO trước WT-M/WT-F |
| Test session data isolation | Các agent khác consume insurance SOs → pool cạn (Run 2 confirmed) | Data isolation strategy: mỗi test type có pool riêng |
| Auth method documentation | Nhầm lẫn login mutation vs sso-stub REST | Cập nhật TC precondition ghi rõ: Auth = sso-stub GET /dev/token (Run 3 clarified) |

---

## 5. Bug Verification Loop (Step 5)

### 5.1 WAITING-VERIFY Bugs (TC-W01-PERF-* reference)

Kết quả scan `Tracking/WAVE01/BUGS.md`:
- **0 bugs** có status WAITING-VERIFY/VERIFY_PENDING/RESOLVED referencing TC-W01-PERF-* test cases.
- Performance TCs (PERF-001, PERF-002) không file bug (no SLO violation qua 3 runs).
- PERF-003 BLOCKED = data/infra constraint, không phải product defect — không file bug.

Các bugs RESOLVED+PendingTEST trong WAVE01 (BUG-W01-296, BUG-W01-297, BUG-W01-299, BUG-W01-301): Web/UI layer — ownership `agent-test-ui`, KHÔNG thuộc perf agent scope.
Các bugs Mobile (BUG-W01-303, BUG-W01-304, BUG-W01-305): Excluded per OVERRIDE (mobile bugs excluded).
VERIFY_PENDING (BUG-W01-029, BUG-W01-031): API-level bugs, không reference TC-W01-PERF-*.

**Kết luận verify round:** verified=0, reopened=0, skipped_mobile=0 (0 perf bugs in WAITING-VERIFY).

---

## 6. Regression Check (Step 6 — Run 3 Final Regression)

Run 3 re-executed TC-W01-PERF-001 và TC-W01-PERF-002 với expanded data pools. Kết quả:

| TC | Run 2 p99 | Run 3 p99 | Delta | SLO | Regression? |
|---|---|---|---|---|---|
| TC-W01-PERF-001 | 228.48ms | 188.4ms | -40.08ms (cải thiện) | < 800ms | KHÔNG — cải thiện |
| TC-W01-PERF-002 | 170.29ms | 184.53ms | +14.24ms (variance bình thường) | < 600ms | KHÔNG — vẫn trong SLO, variance do pool diff |
| TC-W01-PERF-003 | BLOCKED | BLOCKED | — | ≥ 99.5% | N/A — persistent block |

**Kết luận**: Không có SLO regression giữa Run 2 và Run 3. PERF-001 cải thiện. PERF-002 variance nhỏ (14ms) do pool lớn hơn (10 codes vs 4) với một số codes chưa fully warm. Cả 2 TC đều trong SLO với headroom > 65%.

---

## 7. Lessons Learned

| Lesson ID | Tóm tắt | Lần log |
|---|---|---|
| TL-W01-PERF-001 | Data seed volume không được chuẩn bị trước TEST_EXECUTION: verify pool size từ DB trước khi chốt TC precondition. | Run 2 |
| TL-W01-PERF-002 | GraphQL schema field names phải verify qua introspection vs live schema trước khi viết k6 script. | Run 2 |
| TL-W01-PERF-003 | Auth method: sso-stub REST GET /dev/token → accessToken (không phải login mutation trên agg-garage-graph, mutation đó không tồn tại). | Run 3 |
| TL-W01-PERF-004 | createInsuranceSettlement yêu cầu SO status=COMPLETED (không phải PRICING); seed script cho TC-003 phải đưa SO lên COMPLETED trước test run. | Run 3 |

> TL-W01-PERF-001 và TL-W01-PERF-002 đã được ghi vào `Tracking/TEST-LESSONS-LEARNED.md` (Run 2).
> TL-W01-PERF-003 và TL-W01-PERF-004 cần được append vào `Tracking/TEST-LESSONS-LEARNED.md` section `agent-test-performance`.

---

## 8. Kết luận và khuyến nghị

**Kết luận (Run 1 + Run 2 + Run 3):** TC-W01-PERF-001 và TC-W01-PERF-002 PASS ổn định qua 3 runs với headroom đáng kể. Hai hot paths mới — SO Edit save với insurance allocation và GET phiếu QT BH với additive block — không vi phạm SLO PKG §9.

**Kết quả Run 3 (FINAL REGRESSION):**
- TC-W01-PERF-001: p99=188.4ms — PASS, headroom 76.5%, 12.119 requests, 0 errors, 36.357 checks 100%.
- TC-W01-PERF-002: p99=184.53ms — PASS, headroom 69.2%, 11.708 requests, 0 errors, 35.124 checks 100%.
- TC-W01-PERF-003: BLOCKED persistent — block kép xác nhận (pool nhỏ + status PRICING≠COMPLETED).
- Verify round: 0 bugs với WAITING-VERIFY status referencing TC-W01-PERF-*. 0 perf bugs to verify.

**SLO source gate:** PKG-W01 §9 Post-Wave Actuals — SLO source verified, KHÔNG relaxed.

**Khuyến nghị cho WT-M/WT-F:**
1. Tạo seed script `infra/init-data/seed-insurance-so-pool.sql` (≥ 200 SO unique, has_insurance=true, status=COMPLETED, no settlement) trước khi chạy TC-003.
2. Seed 10.000 SO + 1.000 phiếu QT BH diverse cho full load/soak test.
3. Đo cache-cold p99 cho GET phiếu QT BH (reset Redis trước test).
4. Auth: sử dụng sso-stub `GET /dev/token?identifier=accountant@demo.local` → field `accessToken` (KHÔNG phải `login` mutation).
5. Implement data isolation: perf agent pool tách biệt với functional/e2e agent data.
6. Mở rộng sang load + soak test theo scale target đầy đủ của WT-M/WT-F.

---

## 9. Changelog

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-06-11 | 1 | Khởi tạo báo cáo kiểm thử hiệu năng W01. Run 1: TC-001 PASS (p99=199.7ms), TC-002 PASS (p99=210.03ms), TC-003 BLOCKED (data seed). k6 Docker runner. | agent-test-performance |
| 2026-06-11 | 2 | Cập nhật Run 2 (/test-exec W01 re-run): TC-001 PASS (p99=228.48ms, headroom 71.5%), TC-002 PASS (p99=170.29ms, headroom 71.6%), TC-003 BLOCKED persistent (0 SO eligible). Thêm Run Timeline, schema introspection results Run 2, sso-stub login mutation verified, data isolation observation. Bug Verification Loop (Step 5): không có perf-owned bugs. Regression check: không vi phạm SLO. Evidence: TC-W01-PERF-001/002-k6-run2.txt + TC-W01-PERF-003-blocked-run2.txt. | agent-test-performance |
| 2026-06-17 | 3 | Cập nhật Run 3 (FINAL REGRESSION ROUND — VERIFY BUGS + FINAL REGRESSION per /test-exec W01): TC-001 PASS (p99=188.4ms, headroom 76.5%, 12.119 req, 36.357 checks 100%). TC-002 PASS (p99=184.53ms, headroom 69.2%, 11.708 req, 35.124 checks 100%). TC-003 BLOCKED persistent — block kép xác nhận Run 3 (2 SO có insurance ở PRICING status; BAD_REQUEST "must be COMPLETED or SETTLED"). Verify round: 0 bugs WAITING-VERIFY referencing TC-W01-PERF-*. Run 3 data pool: TC-001=[4,10,14,16]; TC-002=10 INSURANCE codes. Auth method clarified: sso-stub GET /dev/token (login mutation không tồn tại trên agg-garage-graph). Thêm lessons TL-W01-PERF-003 + TL-W01-PERF-004. Thêm regression table §6. Cập nhật §3 infrastructure Run 3, §4 SLO compliance 3-run table. | agent-test-performance |
