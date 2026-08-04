---
document_id: "TR-W02-PERFORMANCE"
type: test-report
parent: SV-TEST-CASE-REGISTRY
status: FINAL
version: 3
wave: "W02"
agent: "agent-test-performance"
boundary: "gf-accounting, agg-garage-graph, ct-file-storage"
execution_date: "2026-06-22"
last_reviewed: '2026-06-26'
---

# Báo cáo kiểm thử — Wave 02: Performance Sanity (Insurance Dossier)

> Báo cáo kết quả kiểm thử hiệu năng W02 — `agent-test-performance`.
> Scope: perf sanity 6 hot paths mới trong EP-INSURANCE-SETTLEMENT slice 2/3 (FEAT-INS-STL-CREATE + FEAT-INS-DOSSIER-CREATE + FEAT-INS-DOSSIER-VIEW).
> W02 KHÔNG phải designated perf wave (WT-M/WT-F) — mục tiêu là xác nhận SLO không bị vi phạm trên hot path mới; full load/soak deferred sang WT-M/WT-F.
> SLO source chính: `PKG-W02-insurance-dossier.md §4.3` + `§9 Post-Wave Actuals`.

---

## 1. Tổng quan

| Trường | Giá trị |
|---|---|
| **Wave** | W02 |
| **Subject / execution slice** | Performance sanity — dossier export pipeline (FEAT-INS-DOSSIER-CREATE + VIEW) |
| **Boundary(ies)** | `gf-accounting` · `agg-garage-graph` (BFF orchestrator) · `ct-file-storage` (external sim) |
| **Agent thực thi** | `agent-test-performance` |
| **Nguồn thống kê** | AUTOMATED (Python 3 `urllib.request` + `threading` — k6/Artillery vắng mặt trong môi trường test) |
| **Ngày bắt đầu (Run 1)** | 2026-06-22 |
| **Ngày kết thúc (latest run)** | 2026-06-26 |
| **Số lần chạy chính thức** | 3 (Run 1 = TEST_EXECUTION W02; Run 2 = verify BUG-W02-032 status; Run 10 = out-of-wave skip) |
| **Loại kiểm thử** | Perf sanity (20–50 iterations, threading sanity) |
| **Môi trường** | Local (`docker compose`) |
| **Phiên bản code (latest run)** | Branch `feature/ep-insurance-settlement-w02` |
| **Gate source** | PKG-W02-insurance-dossier.md §4.3 + §9 Post-Wave Actuals |
| **Kết luận tổng quát (latest run)** | **SKIPPED (out-of-scope)** |
| **Bugs filed** | BUG-W02-032 (P2 — pdfUrl persist absolute URL vi phạm ADR-016 v11) |
| **SLO source matched** | Đúng — mọi SLO lấy từ PKG §4.3/§9; không hardcode/relax |
| **SLO relaxed** | Không |

---

## 1.5 Run Timeline — Lịch sử các lần chạy

| Run # | Ngày | Trigger | Commit | TC executed | PASS | FAIL | BLOCKED | SKIPPED | New bugs (BUG-IDs) | Bugs verified (BUG-IDs) | Verdict |
|---|---|---|---|---:|---:|---:|---:|---:|---|---|---|
| Run 1 | 2026-06-22 | TEST_EXECUTION spawn từ /test-exec W02 (resume session) | `feature/ep-insurance-settlement-w02` | 6 | 5 | 1 | 0 | 0 | BUG-W02-032 | — | PARTIAL PASS |
| Run 2 | 2026-06-22 | Minimal re-run — verify BUG-W02-032 status; no BLOCKED TCs to re-run | `feature/ep-insurance-settlement-w02` | 0 | — | — | — | — | — | BUG-W02-032 OPEN confirmed (no fix applied) | PARTIAL PASS (no change) |
| Run 10 | 2026-06-26 | Out-of-wave user override — performance not in W02 scope this run | `feature/ep-insurance-settlement-w02` | 0 | 0 | 0 | 0 | 6 | — | — | SKIPPED |

---

## 2. Kết quả tổng hợp

### 2.1 Tóm tắt số liệu

> Số liệu bên dưới phản ánh trạng thái latest run (Run 10 — SKIPPED). Xem §2.5 để so sánh qua các lần chạy.

| Chỉ số | Giá trị | Ngưỡng | Đạt? |
|---|---|---|---|
| Tổng TC thực thi | 0 (Run 10 — out-of-wave) | — | N/A |
| TC PASS | 0 | — | N/A |
| TC FAIL | 0 | 0 | N/A |
| TC SKIP | 6 | — | N/A |
| TC BLOCKED | 0 | 0 | N/A |
| **Tỷ lệ pass** | N/A | — | N/A |
| Bug P0 mở | 0 | 0 | CÓ |
| Bug P1 mở | 0 | 0 | CÓ |
| Bug P2 mở | 1 (BUG-W02-032 OPEN) | N/A — perf skipped this run | N/A |

### 2.2 Phân bổ theo mức ưu tiên

| Mức ưu tiên | Tổng | PASS | FAIL | SKIP | Tỷ lệ pass |
|---|---|---|---|---|---|
| P1 (Critical) | 4 | 0 | 0 | 4 | N/A (SKIPPED) |
| P2 (Medium) | 2 | 0 | 0 | 2 | N/A (SKIPPED) |

### 2.3 Phân bổ theo Execution Surface

| Execution Surface | Tổng | PASS | FAIL | Tỷ lệ pass |
|---|---|---|---|---|
| API (REST) | 1 | 0 | 0 | N/A (SKIPPED) |
| API (GraphQL) | 3 | 0 | 0 | N/A (SKIPPED) |
| Performance | 6 | 0 | 0 | N/A (SKIPPED) |

### 2.4 Phân bổ theo nguồn thực thi

| Nguồn | Tổng | PASS | FAIL | BLOCKED | SKIPPED | Ghi chú |
|---|---|---|---|---|---|---|
| Automated | 6 | 0 | 0 | 0 | 6 | `Execution/automated-test-cases/TC-W02-PERFORMANCE.md` — Run 10 all SKIPPED |
| Manual | N/A | — | — | — | — | `Execution/test-cases/TC-W02-PERFORMANCE.md` — read-only reference |

### 2.5 So sánh kết quả qua các lần chạy (multi-run trend)

| Chỉ số | Run 1 | Run 2 | Run 10 (latest) | Δ Run1→latest | Ngưỡng | Đạt latest? |
|---|---:|---:|---:|---:|---|---|
| Total TC executed | 6 | 0 | 0 | -6 | — | N/A |
| PASS count | 5 | — | 0 | -5 | — | N/A (SKIPPED) |
| FAIL count | 1 | — | 0 | -1 | 0 | N/A (SKIPPED) |
| BLOCKED count | 0 | 0 | 0 | 0 | 0 | CÓ |
| Tỷ lệ pass | 83.3% | — | N/A | — | — | N/A (SKIPPED) |
| Bugs P1 open | 0 | 0 | 0 | 0 | 0 | CÓ |
| Bugs chờ verify chưa promote (BUG-W02-032 OPEN) | 0 | 1 | 1 | +1 | 0 | KHÔNG (perf skipped) |
| Bugs VERIFIED+CLOSED cumulative | 0 | 0 | 0 | 0 | — | — |

---

## 3. Chi tiết theo Test Suite

### 3.1 Smoke Suite

N/A — perf sanity không có smoke suite riêng; tất cả TCs là performance suite.

### 3.2 Regression Suite

N/A — Run 10 SKIPPED; không có regression run.

### 3.3 E2E Journeys

N/A — Performance sanity không có E2E journey trong scope.

### 3.4 Functional TCs (Wave hiện tại) — Multi-run verdict

| TC ID | Tiêu đề | Mức ưu tiên | Run 1 | Run 2 | Run 10 | Linked Bug (current status) | Final verdict |
|---|---|---|---|---|---|---|---|
| TC-W02-PERF-001 | Render bộ 4 tài liệu PDF đạt p95 < 5 giây | P1 | PASS | (no rerun) | SKIPPED | — | SKIPPED |
| TC-W02-PERF-002 | Xuất 5 bộ hồ sơ đồng thời — không DB deadlock | P1 | PASS | (no rerun) | SKIPPED | — | SKIPPED |
| TC-W02-PERF-003 | ct-file-storage upload lỗi < 0.1% | P1 | PASS | (no rerun) | SKIPPED | — | SKIPPED |
| TC-W02-PERF-004 | Batch persist 10 bộ đồng thời — không bottleneck | P2 | PASS | (no rerun) | SKIPPED | — | SKIPPED |
| TC-W02-PERF-005 | Tìm kiếm bộ hồ sơ BH — latency p95 sanity < 1s | P2 | FAIL | FAIL (no fix) | SKIPPED | BUG-W02-032 (OPEN) | SKIPPED |
| TC-W02-PERF-006 | BFF exportInsuranceDossier success rate ≥ 99% | P1 | PASS | (no rerun) | SKIPPED | — | SKIPPED |

---

## 4. Failed Tests — Chi tiết

Không có TC nào FAIL trong Run 10 (tất cả SKIPPED). Historical: TC-W02-PERF-005 đã FAIL trong Run 1 và Run 2 do BUG-W02-032 — xem chi tiết dưới đây cho context.

### 4.1 TC-W02-PERF-005: Tìm kiếm bộ hồ sơ BH — latency p95 sanity (Historical FAIL — Run 1/2)

| Trường | Giá trị |
|---|---|
| **TC ID** | `TC-W02-PERF-005` |
| **Mức ưu tiên** | P2 |
| **Boundary** | `gf-accounting` |
| **Linked Bug** | `BUG-W02-032` (`Tracking/WAVE02/BUGS.md` + verify file `Tracking/WAVE02/verify/BUG-W02-032.verify.md`) |
| **Verification history** | xem bảng dưới |

**Verification history (multi-run lifecycle):**

| Run # | Ngày | Verdict | Bug status sau run | Evidence path | Notes |
|---|---|---|---|---|---|
| Run 1 | 2026-06-22 | FAIL | BUG-W02-032 filed (OPEN) | — | `pdfUrl` trả absolute URL `http://localhost:45888/files/...` thay vì object key; vi phạm ADR-016 v11. Latency PASS (p95=30.2ms); failure do format assertion. |
| Run 2 | 2026-06-22 | FAIL | BUG-W02-032 OPEN confirmed (no fix applied) | — | Re-verify qua curl: pdfUrl vẫn absolute URL. Status không thay đổi. |
| Run 10 | 2026-06-26 | SKIPPED | BUG-W02-032 OPEN (performance out-of-wave this run) | — | TC skipped per user override Run 10. BUG-W02-032 vẫn OPEN và cần verify khi performance được re-enable trong wave sau. |

**Mô tả lỗi:**

```
Expected: pdfUrl = ct-file-storage object key (relative path, no scheme/domain)
         e.g. "files/settlements/SET-20260618-00001/SETTLEMENT_SHEET.pdf"
Actual:   pdfUrl = "http://localhost:45888/files/oversized.pdf" (absolute URL)

Vi phạm: ADR-016 v11 §Decision §Storage — "pdfUrl = ct-file-storage object key /
relative path — KHÔNG scheme/domain"

Root cause: gf-accounting batch persist (Phase D) lưu full URL nhận từ BFF Phase C
upload response thay vì extract và persist chỉ object key vào cột pdf_url.
```

**Root cause:**

- gf-accounting `POST /api/v1/insurance-dossier-documents/batch` nhận payload từ BFF Phase C (trong đó `fileUrl` là full URL trả từ ct-file-storage), rồi persist nguyên giá trị vào cột `pdf_url` thay vì chỉ lấy path component.

**Hành động tiếp theo:**

- [x] Ghi bug `Tracking/WAVE02/BUGS.md` (BUG-W02-032 OPEN)
- [x] Assign cho `agent-fix-gf-accounting`
- [ ] Re-test sau khi fix (defer sang wave sau hoặc khi performance được re-enable)

---

## 5. Coverage Report

### 5.1 Code Coverage

N/A — Run 10 SKIPPED; không có code coverage thu thập trong run này.

### 5.2 TC Coverage (Traceability)

| Feature ID | Tổng AC perf | AC có TC | AC chưa có TC | Coverage |
|---|---|---|---|---|
| `FEAT-INS-DOSSIER-CREATE` | 4 (PDF gen, concurrent, upload, end-to-end) | 4 | 0 | 100% (TCs exist; SKIPPED in Run 10) |
| `FEAT-INS-DOSSIER-VIEW` | 1 (search pagination latency) | 1 | 0 | 100% (TC exists; SKIPPED in Run 10) |

---

## 6. Performance Metrics

> Run 10: tất cả SKIPPED — không có metric mới. Historical metrics từ Run 1 (2026-06-22) được giữ lại để tham chiếu.

### 6.1 API Response Time (Run 1 — 2026-06-22 historical)

| Endpoint | Method | p50 | p95 | p99 | Ngưỡng p95 | Đạt? |
|---|---|---|---|---|---|---|
| `/api/v1/insurance-dossier-documents/acceptance-record/render-pdf` + `/payment-authorization/render-pdf` (TC-001) | POST | ~98ms | 126ms | ~145ms | 5000ms (PKG §4.3) | CÓ |
| `/api/v1/insurance-dossiers/search` (TC-005) | POST | ~28ms | 30.2ms | ~35ms | 1000ms (sanity) | CÓ (latency) — FAIL (pdfUrl format) |

### 6.2 Throughput (Run 1 — 2026-06-22 historical)

| Test Case | RPS / success | Error rate | Ghi chú |
|---|---|---|---|
| TC-002: concurrent 5 export | 5/5 concurrent | 0% | No deadlock, no lock wait |
| TC-003: ct-file-storage upload 50 runs | 50/50 | 0% | error rate = 0% << SLO 0.1% |
| TC-004: concurrent batch persist 10 | 10/10 concurrent | 0% | elapsed=248ms, no deadlock |
| TC-006: BFF export 20 runs | 20/20 | 0% | success rate = 100% >> SLO 99% |

### 6.3 Resource Usage

N/A — không có APM/resource monitoring hooked trong sanity run. Docker logs spot-check không thấy OOM/CPU spike.

---

## 7. Issues phát hiện

| # | Loại | Mức nghiêm trọng | Mô tả | Boundary | Bug ID | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | Bug | P2 | `pdfUrl` được persist dưới dạng absolute URL thay vì object key — vi phạm ADR-016 v11 | `gf-accounting` | BUG-W02-032 | OPEN |

### 7.1 Drift phát hiện

| Drift | Tài liệu gốc | Thực tế | Hành động |
|---|---|---|---|
| pdfUrl format | ADR-016 v11: "pdfUrl = object key / relative path" | gf-accounting persist full URL `http://host:port/files/...` | Fix — BUG-W02-032 filed; assign agent-fix-gf-accounting |
| BFF GraphQL endpoint path | Không documented rõ trong SERVICE-BOUNDARY-MATRIX | `/garage/graphql` (CONTEXT_PATH=/garage + GRAPHQL_PUBLIC_PATH=/graphql) | Observation — perf debt candidate; add canonical path vào SERVICE-BOUNDARY-MATRIX |

### 7.2 Handoff cập nhật registry / tracker

| Artifact đích | Wave / TC / Metric | Giá trị đề xuất | Owner cập nhật |
|---|---|---|---|
| `Execution/test-cases/TEST-CASE-REGISTRY.md` | TC-W02-PERF-001 đến 006 | SKIPPED (Run 10 out-of-wave) | QA Authority |
| `Execution/WAVE-TRACKER.md` | W02 performance — Run 10 | SKIPPED (out-of-wave per user override) | Delivery Authority / QA Authority |

---

## 8. Kết luận

### 8.1 Kết luận tổng quát

**SKIPPED (out-of-scope)** — Run 10 ngày 2026-06-26: kiểm thử hiệu năng được đánh dấu out-of-wave theo user override tường minh cho run này. Tất cả 6 TCs (`TC-W02-PERF-001` đến `TC-W02-PERF-006`) được chuyển sang trạng thái `SKIPPED` mà không thực thi. Không có load test, không có infra action, không có bug mới được file trong Run 10. Hiệu năng của W02 sẽ được kiểm tra lại trong một dedicated performance wave hoặc khi agent-test-performance được kích hoạt trở lại với đủ điều kiện môi trường. Bug đang tồn đọng BUG-W02-032 (P2 — pdfUrl format vi phạm ADR-016 v11) giữ nguyên trạng thái OPEN và cần được verify sau khi agent-fix-gf-accounting hoàn tất fix.

### 8.2 Gate Pass/Fail (Run 10)

| Gate | Kết quả | Ghi chú |
|---|---|---|
| SLO source authoritative | N/A | Không có SLO evaluation trong Run 10 — TCs SKIPPED |
| No SLO relaxed | CÓ | Không có SLO bị relax hoặc thay đổi |
| TC FAIL disclosed | CÓ | Historical FAIL (TC-W02-PERF-005, BUG-W02-032) đã disclosed rõ ràng |
| Warm-up/retry/outlier disclosed | N/A | Không có execution trong Run 10 |
| No load/stress on production | CÓ | Không có load test được chạy |

### 8.3 Quyết định

- [x] **SKIPPED (out-of-scope)** — Run 10 2026-06-26: Performance testing out-of-wave per user override. Không có GO/NO-GO decision trong run này. Kết quả Run 1 historical (5/6 PASS) vẫn là kết quả cuối cùng có hiệu lực cho gate W02 performance.

### 8.4 Ghi chú cho wave tiếp theo

- BUG-W02-032 (pdfUrl absolute URL) cần re-verify khi performance được re-enable: chạy lại TC-W02-PERF-005 sau khi agent-fix-gf-accounting apply fix tại gf-accounting batch persist Phase D.
- k6/Artillery cần được cài đặt trước WT-M/WT-F để thay thế Python workaround cho full load test (1000 VU, 5-min soak).
- BFF endpoint canonical path (`/garage/graphql`) nên được documented trong `Execution/SERVICE-BOUNDARY-MATRIX.md` để tránh probe lại ở wave sau.

---

## 9. Lesson Learn References

| Lesson ID | Ghi chú |
|---|---|
| TL-W01-PERF-003 | Auth method: sso-stub REST `GET /dev/token?identifier=accountant@demo.local` → `accessToken`; KHÔNG GraphQL login mutation. Áp dụng đúng trong W02. |
| TL-W02-PERF-001 | Architecture drift SLO: manual TC-W02-PERFORMANCE-005 dùng endpoint `/download` stale. Auto artifact không adopt. |
| TL-W02-PERF-002 | SLO derivation: manual TC-W02-PERFORMANCE-004 dùng SLO suy diễn 2 tài liệu = 50% × 5s. Auto artifact không adopt. |
| TL-W02-PERF-003 | k6/Artillery vắng; BFF endpoint `/garage/graphql` non-obvious; pdfUrl absolute URL bug phát hiện qua expected-result assertion trong perf TC. |

---

## 10. Changelog

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-06-22 | 1 | Khởi tạo TR-W02-PERFORMANCE: 6 TCs (5 PASS / 1 FAIL), SLO compliance table, bug BUG-W02-032, perf debt candidates, lesson learn refs. | agent-test-performance |
| 2026-06-22 | 2 | Run 2 minimal: BUG-W02-032 status re-verified via curl — pdfUrl still absolute URL, no fix applied, status remains OPEN. TC-W02-PERF-005 remains FAIL. No BLOCKED TCs in perf scope. Verdict unchanged: PARTIAL PASS. §1 tổng quan cập nhật số lần chạy → 2. §6 thêm Run 2 block. | agent-test-performance |
| 2026-06-26 | 3 | Run10 out-of-scope SKIPPED: thêm Run 10 row vào §1.5 Run Timeline (0 TC executed, 6 SKIPPED). Cập nhật §1 Kết luận tổng quát → SKIPPED (out-of-scope) + last_reviewed. Cập nhật §2.1 số liệu latest run (0 PASS, 0 FAIL, 6 SKIP). Cập nhật §2.5 trend. Cập nhật §3.4 Final verdict cột Run 10 = SKIPPED tất cả TCs. Cập nhật §8 Kết luận. Kết quả lịch sử Run 1/Run 2 được giữ nguyên. | agent-test-performance |
