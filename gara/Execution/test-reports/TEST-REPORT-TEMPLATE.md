---
document_id: "TR-W{{WAVE_NUMBER}}-{{SUBJECT}}-{{AGENT_ID}}"
type: test-report
parent: SV-TEST-CASE-REGISTRY
status: DRAFT
version: 7
wave: "W{{WAVE_NUMBER}}"
agent: "{{AGENT_ID}}"
boundary: "{{BOUNDARY}}"
execution_date: "{{DATE}}"
last_reviewed: "{{DATE}}"
---

# Báo cáo kiểm thử — Wave {{WAVE_NUMBER}}: {{SUBJECT}}

> Báo cáo kết quả kiểm thử cho Wave W{{WAVE_NUMBER}}, thực thi bởi `{{AGENT_ID}}`.
> Template chuẩn Garage — copy và thay thế `{{placeholder}}`.
> Ngưỡng verdict trong template này chỉ là chỗ điền. Gate cuối cùng PHẢI bám active work package, Master Execution Plan, và QA Authority; không được dùng template để tự nới hoặc tự siết gate.
> Toàn bộ phần diễn giải cho người đọc phải viết bằng tiếng Việt có dấu. Chỉ giữ tiếng Anh cho technical token chuẩn như `PASS/FAIL/BLOCKED/SKIPPED`, tên file, tên lệnh, endpoint, error code, hoặc identifier.
> Một wave có thể có nhiều test report. Mỗi report tương ứng với một TEST agent hoặc một execution slice rõ ràng; không gộp nhiều surface không liên quan vào cùng một report chỉ để đủ biểu mẫu.

---

## 1. Tổng quan

| Trường | Giá trị |
|---|---|
| **Wave** | W{{WAVE_NUMBER}} |
| **Subject / execution slice** | `{{SUBJECT}}` |
| **Boundary(ies)** | `{{BOUNDARY}}` |
| **Agent thực thi** | `{{AGENT_ID}}` |
| **Nguồn thống kê** | AUTOMATED / MANUAL / MIXED |
| **Ngày bắt đầu (Run 1)** | {{START_DATE}} |
| **Ngày kết thúc (latest run)** | {{END_DATE}} |
| **Số lần chạy chính thức** | {{TOTAL_RUNS}} (Run 1 = initial; Run 2+ = re-verify sau DEV-fix cycle) |
| **Loại kiểm thử** | Smoke / Regression / E2E / Full (chọn 1 hoặc nhiều) |
| **Môi trường** | Local (`docker compose`) / CI / Staging |
| **Phiên bản code (latest run)** | Commit `{{COMMIT_SHA}}` trên branch `{{BRANCH}}` |
| **Gate source** | Work package / Master Execution Plan / QA Authority note |
| **Kết luận tổng quát (latest run)** | **PASS** / **FAIL** / **BLOCKED** |

---

## 1.5 Run Timeline — Lịch sử các lần chạy

> Bắt buộc khi có ≥ 2 lần chạy (vd Run 1 initial → DEV-fix → Run 2 verify). Single-run wave vẫn ghi Run 1 row để giữ format thống nhất.
> Mỗi `/test-exec` invoke = 1 row mới ở Run N+1. Bugs filed = bug mới phát sinh ở run đó; Bugs verified = bugs chờ verify (canonical `FIX_DONE`/`VERIFY_PENDING`; W01 legacy alias `RESOLVED`) promote sang `VERIFIED`/`CLOSED` ở run đó (qua /test-exec Step 5 Bug Verification Loop).

| Run # | Ngày | Trigger | Commit | TC executed | PASS | FAIL | BLOCKED | SKIPPED | New bugs (BUG-IDs) | Bugs verified (BUG-IDs) | Verdict |
|---|---|---|---|---:|---:|---:|---:|---:|---|---|---|
| Run 1 | {{DATE}} | `/test-exec` initial sau `/test-plan` | `{{SHA}}` | — | — | — | — | — | — | — | FAIL / BLOCKED / PASS |
| Run 2 | {{DATE}} | `/test-exec` re-verify sau DEV-fix cycle 1 | `{{SHA}}` | — | — | — | — | — | — | — | — |
| Run N | {{DATE}} | `/test-exec` re-verify sau DEV-fix cycle N-1 | `{{SHA}}` | — | — | — | — | — | — | — | PASS / CONDITIONAL / FAIL |

**Quy tắc đếm**:
- `TC executed` = số TC được run trong lần đó (có thể nhỏ hơn total nếu chỉ re-run các TC FAIL từ run trước).
- `New bugs` = bug đăng ký mới ở run đó (tăng monotonically theo wave). Empty/0 nếu Run 2+ không phát sinh bug mới.
- `Bugs verified` = bug chờ verify (canonical `FIX_DONE`/`VERIFY_PENDING`; W01 legacy `RESOLVED`) → `VERIFIED`/`CLOSED` trong run đó (typically Run 2+ sau DEV fix cycle).
- `Verdict` = kết luận của run đó: FAIL (có FAIL/BLOCKED critical), CONDITIONAL (pass có observation/debt), PASS (clean).

---

## 2. Kết quả tổng hợp

### 2.1 Tóm tắt số liệu

> Các số liệu trong report này có thể đến từ `AUTOMATED`, `MANUAL`, hoặc `MIXED` theo scope đã khai báo ở phần Tổng quan.
> Nếu là `MIXED`, phải điền thêm breakdown theo nguồn ở `2.4` và tránh double-count cùng một testcase hoặc cùng một kết luận đã được mirror từ hai nguồn.
> Manual QC có thể là testcase scenario-level cover đồng thời UI + functional + DB verification; automated source có thể tách nhỏ hơn. Không coi raw count của manual và automated là tương đương coverage 1:1.

| Chỉ số | Giá trị | Ngưỡng | Đạt? |
|---|---|---|---|
| Tổng TC thực thi | {{TOTAL}} | — | — |
| TC PASS | {{PASS_COUNT}} | — | — |
| TC FAIL | {{FAIL_COUNT}} | {{Theo active gate}} | CÓ / KHÔNG |
| TC SKIP | {{SKIP_COUNT}} | — | — |
| TC BLOCKED | {{BLOCKED_COUNT}} | {{Theo active gate}} | CÓ / KHÔNG |
| **Tỷ lệ pass** | {{PASS_RATE}}% | {{Theo active gate}} | CÓ / KHÔNG |
| Bug P0 mở | {{P0_COUNT}} | 0 | CÓ / KHÔNG |
| Bug P1 mở | {{P1_COUNT}} | {{Theo active gate}} | CÓ / KHÔNG |
| Bug P2 mở | {{P2_COUNT}} | {{Theo active gate hoặc N/A}} | — |

### 2.2 Phân bổ theo mức ưu tiên

| Mức ưu tiên | Tổng | PASS | FAIL | SKIP | Tỷ lệ pass |
|---|---|---|---|---|---|
| Critical | — | — | — | — | — |
| High | — | — | — | — | — |
| Medium | — | — | — | — | — |
| Low | — | — | — | — | — |

### 2.3 Phân bổ theo Execution Surface

> Nếu nguồn `MANUAL` hoặc `MIXED` có testcase cross-surface, không tách một manual testcase thành nhiều testcase giả chỉ để lấp bảng này.
> Một manual case có thể chạm nhiều surface; khi đó bảng này là breakdown phân tích theo surface touched, không nhất thiết cộng ngang phải bằng `2.1`.

| Execution Surface | Tổng | PASS | FAIL | Tỷ lệ pass |
|---|---|---|---|---|
| API (REST) | — | — | — | — |
| API (GraphQL) | — | — | — | — |
| UI | — | — | — | — |
| E2E (cross-service) | — | — | — | — |
| Kafka consumer | — | — | — | — |
| Cron job | — | — | — | — |
| Security | — | — | — | — |
| Performance | — | — | — | — |

### 2.4 Phân bổ theo nguồn thực thi

> Chỉ điền nếu report có số liệu manual, automated, hoặc mixed. Nếu report chỉ là một nguồn duy nhất, vẫn giữ subsection này và ghi `N/A` hoặc điền một dòng tương ứng.
> Dùng bảng này để cho Human QC/PO thấy rõ chênh lệch granularity giữa manual và automated; không dùng để ép hai nguồn phải có cùng số TC.

| Nguồn | Tổng | PASS | FAIL | BLOCKED | SKIPPED | Ghi chú |
|---|---|---|---|---|---|---|
| Automated | — | — | — | — | — | {{artifact/report source nếu có}} |
| Manual | — | — | — | — | — | {{TC-WAVE file / manual run source nếu có}} |

### 2.5 So sánh kết quả qua các lần chạy (multi-run trend)

> **Bắt buộc** khi `Số lần chạy chính thức ≥ 2` (xem §1). Bảng này show trajectory metric từ Run 1 → Run N để QA/PO nhìn rõ wave có tiến triển ra sao sau mỗi DEV-fix cycle.
> Nếu single-run wave: ghi `N/A` toàn bộ row Run 2+ và bỏ cột `Δ Run1→latest`.

| Chỉ số | Run 1 | Run 2 | Run N (latest) | Δ Run1→latest | Ngưỡng | Đạt latest? |
|---|---:|---:|---:|---:|---|---|
| Total TC executed | — | — | — | — | — | — |
| PASS count | — | — | — | +/-X | — | — |
| FAIL count | — | — | — | -X (mong giảm về 0) | {{Theo active gate}} | CÓ / KHÔNG |
| BLOCKED count | — | — | — | -X | — | — |
| Tỷ lệ pass | —% | —% | —% | +/-X pp | {{Theo active gate}} | CÓ / KHÔNG |
| Bugs P1 open | — | — | — | -X | 0 | CÓ / KHÔNG |
| Bugs chờ verify chưa được promote (canonical `FIX_DONE`/`VERIFY_PENDING`; W01 `RESOLVED`) | — | — | — | -X | 0 | CÓ / KHÔNG |
| Bugs `VERIFIED`+`CLOSED` cumulative | — | — | — | +X | — | — |

**Quy tắc**: Bug chờ verify (canonical `FIX_DONE`/`VERIFY_PENDING`; W01 legacy `RESOLVED`) đếm vào "chưa được promote" ở Run N nếu chưa được /test-exec Step 5 Bug Verification Loop promote sang `VERIFIED`. Mục tiêu cuối wave: bugs chờ verify chưa promote = 0 (`no_resolved_unverified` exit_criterion). Status taxonomy: `Tracking/BUGS.md §5.1`.

---

## 3. Chi tiết theo Test Suite

> Chỉ dùng các subsection bên dưới để trình bày kết quả suite. Không tạo thêm section riêng kiểu `Unit Test Run`, `TC Status Table`, `Summary`, hay `Pipeline Impact`.

### 3.1 Smoke Suite

| TC ID | Tiêu đề | Kết quả | Thời gian | Ghi chú |
|---|---|---|---|---|
| TC-W{{NN}}-{{MODULE}}-NNN | {{Tiêu đề}} | PASS / FAIL / SKIP | {{ms}} | {{Ghi chú nếu FAIL/SKIP}} |

### 3.2 Regression Suite

| TC ID | Tiêu đề | Wave gốc | Kết quả | Thời gian | Ghi chú |
|---|---|---|---|---|---|
| TC-W{{NN}}-{{MODULE}}-NNN | {{Tiêu đề}} | W{{NN}} | PASS / FAIL / SKIP | {{ms}} | {{Ghi chú}} |

### 3.3 E2E Journeys

> Chỉ điền khi report này thực sự là E2E hoặc có journey cross-service trong scope. Nếu không áp dụng, giữ subsection và ghi `N/A`.

| Journey ID | Tên | Kết quả | Thời gian | Bước fail (nếu có) |
|---|---|---|---|---|
| J-{{NN}} | {{Tên journey theo wave hiện tại}} | PASS / FAIL / BLOCKED | {{s}} | {{Bước fail nếu có, hoặc `—`}} |

### 3.4 Functional TCs (Wave hiện tại) — Multi-run verdict

> Bảng này list TẤT CẢ TCs với verdict per-run. Single-run wave: chỉ điền cột `Run 1`, để cột `Run 2+` blank hoặc `—`. Multi-run wave: điền verdict ở mỗi cột.
> TC PASS ở Run 1 mà không re-run ở Run 2+ → ghi `(no rerun)` hoặc giữ blank. TC FAIL ở Run 1 → bắt buộc re-run ở Run 2+ sau DEV-fix; verdict cập nhật.
> Cột `Final verdict` = kết quả lần chạy gần nhất (verdict effective cho gate decision).

| TC ID | Tiêu đề | Mức ưu tiên | Run 1 | Run 2 | Run N | Linked Bug (current status) | Final verdict |
|---|---|---|---|---|---|---|---|
| TC-W{{NN}}-{{MODULE}}-NNN | {{Tiêu đề}} | Critical / High / Medium | PASS / FAIL | PASS / (no rerun) | — | BUG-NNN ({{canonical status: OPEN \| ASSIGNED \| IN_FIX \| FIX_DONE \| VERIFY_PENDING \| VERIFIED \| REOPENED \| DEFERRED \| INVALID \| CLOSED}}) | PASS / FAIL |

**Quy ước viết tắt trong cell**:
- `PASS` / `FAIL` / `BLOCKED` / `SKIPPED` — verdict chính thức (per evidence class agent)
- `(no rerun)` — TC PASS từ run trước, không re-run lần này (acceptable cho TC PASS trong /test-exec Step 5)
- `—` — chưa tới run đó (vd chỉ có 2 runs thì cột Run N = —)
- `BLOCKED-by-harness` — chưa chạy được vì env/runner unavailable (2-retry exhausted)

---

## 4. Failed Tests — Chi tiết

> Mỗi TC FAIL phải có block chi tiết bên dưới. Nếu không có TC nào FAIL, ghi "Không có TC nào FAIL trong lần chạy này."

### 4.1 TC-W{{NN}}-{{MODULE}}-NNN: {{Tiêu đề}}

| Trường | Giá trị |
|---|---|
| **TC ID** | `TC-W{{NN}}-{{MODULE}}-NNN` |
| **Mức ưu tiên** | Critical / High / Medium |
| **Boundary** | `{{BOUNDARY}}` |
| **Linked Bug** | `BUG-W{{NN}}-NNN` (`Tracking/WAVE{{NN}}/BUGS.md` L1 + verify file L2) |
| **Verification history** | xem bảng dưới |

**Verification history (multi-run lifecycle):**

| Run # | Ngày | Verdict | Bug status sau run | Evidence path | Notes |
|---|---|---|---|---|---|
| Run 1 | {{DATE}} | FAIL | BUG-W{{NN}}-NNN filed (`OPEN` canonical, hoặc W01 `OPEN`) | `Execution/auto/evidence/W{{NN}}/...` | Mô tả failure mode |
| Run 2 | {{DATE}} | FAIL / PASS | Pass: `FIX_DONE`/`VERIFY_PENDING` → `VERIFIED` (canonical W02+); W01 legacy: `RESOLVED → VERIFIED`. Fail: `→ REOPENED` (canonical) hoặc `→ OPEN` (W01 re-open) | `Execution/auto/evidence/W{{NN}}/...` | So với Run 1 + L2 Verdict Log ref |
| Run N | {{DATE}} | PASS | `VERIFIED` → `CLOSED` (sign-off) | `Execution/auto/evidence/W{{NN}}/...` | TC artifact đã update FAIL → PASS |

**Mô tả lỗi:**

```
{{Mô tả ngắn gọn lỗi — actual result vs expected result}}
```

**Log / Error output:**

```
{{Paste log output từ Jest/Vitest — giới hạn 30 dòng, link full log nếu dài hơn}}
```

**Steps để reproduce:**

1. {{Bước 1}}
2. {{Bước 2}}
3. {{Bước 3}}

**Root cause (nếu đã xác định):**

- {{Nguyên nhân gốc — ví dụ: API contract thay đổi mà consumer chưa cập nhật}}

**Hành động tiếp theo:**

- [ ] Ghi bug `Tracking/BUGS.md`
- [ ] Assign cho `agent-fix-{{boundary}}`
- [ ] Re-test sau khi fix

---

## 5. Coverage Report

### 5.1 Code Coverage

> Chỉ điền khi active gate hoặc execution mode thực sự thu được số liệu coverage.
> Không tạo section riêng kiểu `Unit Test Run`; nếu cần nêu bằng chứng coverage hoặc nguồn số liệu từ `Jest` / `Vitest`, ghi tại đây.
> Nếu wave chạy theo code-inspection, manual evidence, hoặc chưa có hook coverage đáng tin cậy, giữ subsection này và ghi `N/A` kèm lý do.
> Target: **≥ 80%** (backend + frontend) — `MIN_COVERAGE=80` theo chuẩn Garage khi gate hiện hành yêu cầu.
> Tool tham chiếu phổ biến: **Jest** (backend NestJS) + **Vitest** (frontend React).
> Lệnh tham chiếu: `pnpm -r test -- --coverage` hoặc `pnpm --filter sv-{{service}} test -- --coverage`

| Boundary | Statements | Branches | Functions | Lines | Đạt ngưỡng 80%? |
|---|---|---|---|---|---|
| `{{BOUNDARY}}` | —% | —% | —% | —% | CÓ / KHÔNG |

### 5.2 TC Coverage (Traceability)

| Feature ID | Tổng AC | AC có TC | AC chưa có TC | Coverage |
|---|---|---|---|---|
| `{{FEAT_ID}}` | — | — | — | —% |

> **Quy tắc**: mọi AC phải có ≥ 1 TC. AC chưa có TC = coverage gap → báo QA Authority.

---

## 6. Performance Metrics

> Chỉ điền nếu wave có kiểm thử hiệu năng. Nếu không áp dụng, giữ nguyên section và ghi `N/A`.

### 6.1 API Response Time

| Endpoint | Method | p50 | p95 | p99 | Ngưỡng p95 | Đạt? |
|---|---|---|---|---|---|---|
| `{{PATH}}` | GET / POST | —ms | —ms | —ms | {{Theo active gate hoặc N/A}} | CÓ / KHÔNG / N/A |

### 6.2 Throughput

| Endpoint | RPS (requests/second) | Error rate | Ghi chú |
|---|---|---|---|
| `{{PATH}}` | — | —% | — |

### 6.3 Resource Usage

| Service | CPU peak | Memory peak | DB connections | Redis connections |
|---|---|---|---|---|
| `sv-{{boundary}}` | —% | — MB | — | — |

---

## 7. Issues phát hiện

> Tổng hợp tất cả issues (không chỉ TC FAIL) phát hiện trong quá trình kiểm thử.

| # | Loại | Mức nghiêm trọng | Mô tả | Boundary | Bug ID | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | Bug / Drift / Observation | P0 / P1 / P2 / P3 | {{Mô tả}} | `{{BOUNDARY}}` | BUG-NNN / — | Open / Fixed / Deferred |

### 7.1 Drift phát hiện

> Ghi nhận các drift giữa implementation và architecture docs (API contract, data model, event schema).

| Drift | Tài liệu gốc | Thực tế | Hành động |
|---|---|---|---|
| {{Mô tả drift}} | {{File path + section}} | {{Behavior thực tế}} | CR / Fix / Accept |

### 7.2 Handoff cập nhật registry / tracker (nếu cần)

> TEST agents không tự cập nhật registry hay tracker ngoài write scope. Nếu cần mirror kết quả sang `Execution/test-cases/TEST-CASE-REGISTRY.md` hoặc `Execution/WAVE-TRACKER.md`, dùng bảng này để QA Authority / Delivery Authority cập nhật thủ công.
> Với `Execution/test-cases/TEST-CASE-REGISTRY.md`, chỉ mirror dữ liệu cấu trúc cần cho dashboard/index. Giải thích dài, drift detail, và release context giữ trong report này hoặc `Tracking/BUGS.md`.

| Artifact đích | Wave / TC / Metric | Giá trị đề xuất | Owner cập nhật |
|---|---|---|---|
| `Execution/test-cases/TEST-CASE-REGISTRY.md` | {{TC ID / aggregate row}} | {{READY / PASS / FAIL / BLOCKED / SKIPPED}} | QA Authority |
| `Execution/WAVE-TRACKER.md` | {{coverage / verdict / blocker note}} | {{text ngắn}} | Delivery Authority / QA Authority |

---

## 8. Kết luận

### 8.1 Verdict

| Tiêu chí | Kết quả | Ghi chú |
|---|---|---|
| Smoke đạt ngưỡng active gate? | CÓ / KHÔNG / N/A | — |
| Regression đạt ngưỡng active gate? | CÓ / KHÔNG / N/A | — |
| E2E Journeys đạt ngưỡng active gate? | CÓ / KHÔNG / N/A | — |
| Coverage đạt ngưỡng active gate? | CÓ / KHÔNG | — |
| Bug P0 = 0? | CÓ / KHÔNG | — |
| Open bugs đạt ngưỡng active gate? | CÓ / KHÔNG | — |
| Tenant isolation = 0 leakage? | CÓ / KHÔNG / N/A | — |

### 8.2 Quyết định

- [ ] **CHO QUA GATE (GO)** — Wave W{{WAVE_NUMBER}} đạt exit criteria kiểm thử, sẵn sàng chuyển stage tiếp theo
- [ ] **KHÔNG CHO QUA GATE (NO-GO)** — Còn issues blocking, cần fix trước khi tiến tiếp
- [ ] **CHO QUA GATE CÓ ĐIỀU KIỆN (CONDITIONAL GO)** — Go với điều kiện: {{liệt kê điều kiện}}

### 8.3 Ghi chú cho wave tiếp theo

- {{Ghi chú 1 — ví dụ: TC-W06-API-003 cần đánh giá lại sau khi `api-service` refactor}}
- {{Ghi chú 2 — ví dụ: Thêm baseline hiệu năng cho endpoint feed vào regression W12}}

---

## Changelog

| Ngày | Thay đổi | Tác giả |
|---|---|---|
| {{DATE}} | Khởi tạo từ TEST-REPORT-TEMPLATE | {{AGENT_ID}} |
| 2026-05-15 | Siết rule tiếng Việt có dấu, cấm layout kiểu `Unit Test Run`/`Summary`, và làm rõ cách điền coverage theo active gate | Codex |
| 2026-05-15 | Tối ưu template cho mô hình nhiều report theo agent: làm rõ execution slice, bỏ hard-code E2E journeys, và nới các chỗ threshold/perf quá cứng sang active gate | Codex |
| 2026-05-15 | Bổ sung `Nguồn thống kê` và breakdown `2.4` để report có thể thống kê automated, manual, hoặc mixed mà không nhập nhằng số liệu | Codex |
| 2026-06-10 | v6 — Multi-run support: thêm §1.5 Run Timeline (chronological all runs), §2.5 So sánh runs (trend metric Run1→RunN với Δ + ngưỡng), §3.4 modify thêm cột Run 1/Run 2/Run N + Final verdict + Bug current status, §4.1 Verification history table (multi-run lifecycle per failed TC mapping bug status transitions). Sync với /test-exec Step 5 Bug Verification Loop. Hỗ trợ trả lời câu hỏi "Run 1 PASS/FAIL bao nhiêu vs Run 2 sau DEV-fix PASS/FAIL bao nhiêu" trực quan ở §1.5 + §2.5. | QA Authority |
| 2026-06-10 | v7 — Status taxonomy alignment với `Tracking/BUGS.md §5.1` canonical W02+ (9-status) + W01 legacy alias mapping. Replace ambiguous `RESOLVED → VERIFIED/CLOSED` bằng explicit "bugs chờ verify (canonical `FIX_DONE`/`VERIFY_PENDING`; W01 legacy `RESOLVED`)" trong §1.5, §2.5, §4.1. Fix invalid terms: `REOPEN` → `REOPENED` (canonical), `REPORTED` → `OPEN`. §3.4 Bug current status column liệt kê đầy đủ 10 canonical states. Đồng bộ taxonomy với /test-plan + /test-exec exit_criteria. | QA Authority |
