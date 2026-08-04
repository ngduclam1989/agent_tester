---
document_id: 'GMS-TEST-CASE-REGISTRY'
title: 'Test Case Registry — Garage (Manual QC dashboard)'
type: execution
status: ACTIVE
version: 9
author: QA Authority
date: '2026-06-26'
supersedes: 'v6 (SnapVersify copy — incorrectly imported, 20 waves SV)'
---

# Test Case Registry — Garage

> File tổng hợp **manual QC test cases** cho Garage. Mỗi wave có thể có một hoặc nhiều file chi tiết `TC-WAVE-{NN}-*.md` trong cùng thư mục — file này đóng vai trò **bảng chỉ mục + dashboard trạng thái** để SA, PO, Dev và QC theo dõi tiến độ verification và tái sử dụng cho regression / E2E / smoke.

> **Nguồn chuẩn (source of truth):** nội dung manual QC test case nằm trong file chi tiết `TC-WAVE-{NN}-*.md`. File này chỉ giữ metadata + trạng thái tổng hợp. Các **Test Suite** (Regression / E2E / Smoke) nằm trong cùng thư mục và ref test case ID từ các file manual theo wave.

> **Brownfield note:** Garage đã production 15 feature waves (booking, SO, settlement, inventory, marketing…). Dashboard §4 chỉ track **execution thực tế đang chạy** — post-baseline TD/feature work (vd Insurance Settlement W01-W03). 15 feature wave lịch sử là baseline đã ship; chỉ vào registry này khi có regression/hồi quy chạm tới.

---

## 1. Mục đích

| Câu hỏi | Câu trả lời |
|---|---|
| Tại sao tách khỏi `test-reports/`? | Test report = kết quả **một lần chạy**. Test case = **thiết kế** tái sử dụng qua nhiều wave (regression, hồi quy, E2E, smoke). |
| Ai sở hữu file này? | QC (OWNER). SA + PO review scope mỗi wave. Dev đọc để biết phạm vi sắp test. |
| Ranh giới sở hữu | `Execution/test-cases/TEST-CASE-REGISTRY.md`, `TC-WAVE-*` và các suite file là vùng **manual QC** (human). `Execution/test-cases/TC-TEMPLATE.md` là template chung cho cả manual QC lẫn automated testcase artifact. AI test agents được ĐỌC template + registry để đối chiếu coverage, nhưng automated outputs PHẢI ghi sang `Execution/automated-test-cases/`. File pointer ở `Tracking/TEST-CASE-REGISTRY.md` là cross-wave summary read-only ở lớp tracking, cũng không thuộc write scope của AI test agents. |
| AI test agents có được cập nhật file này không? | **Không.** AI test agents chỉ tạo automated testcase artifact trong `Execution/automated-test-cases/`, test report trong `Execution/test-reports/`, và nếu cần thì bàn giao handoff summary để QC mirror thủ công vào registry này. |
| Khi nào cập nhật? | (1) Khi mở wave mới — QC thêm manual test cases `DRAFT`; (2) Trước khi vào manual QC — chuyển `READY`; (3) Trong/sau khi chạy manual QC — cập nhật `PASS/FAIL/BLOCKED/SKIPPED`; (4) Sau wave — chọn các case `PASS` để đưa vào regression/smoke/E2E nếu cần. |
| Dùng ở đâu trong quy trình? | Dùng trong `TEST_PLANNING`, `TEST_EXECUTION`, `QC` và khi chuẩn bị demo. Giúp QA Authority nhìn coverage manual theo wave và biết wave nào đã sẵn sàng vào manual QC. |
| Sync với file test case theo wave? | **BẮT BUỘC**. Mỗi lần file `TC-WAVE-{N}-*.md` thay đổi (thêm/sửa/xoá test case, đổi Status) → PHẢI cập nhật dashboard §4, suite liên quan (Regression/E2E/Smoke) trong cùng commit. Xem [DOC-DEPENDENCY-MAP.md](../../DOC-DEPENDENCY-MAP.md). |
| `Type` khác gì `Suite`? | `Type` mô tả bản chất test (`UI`, `API`, `E2E`, `Security`, `Integration`, `Isolation`, `Performance`…). `Suite` mô tả nhóm chạy (`Wave`, `Smoke`, `Regression`, `E2E`…). |
| Có cần ghi note dài như report không? | Không. File này là dashboard/index ở lớp execution — chỉ giữ dữ liệu cấu trúc (status, count, file link, suite membership, bug ref). Note narrative chi tiết nằm ở test report, testcase artifact, bug registry, hoặc changelog tương ứng. |

---

## 2. Cấu trúc lưu trữ

```
Execution/
├── test-cases/
│   ├── TEST-CASE-REGISTRY.md                    ← file này (manual QC index + dashboard)
│   ├── TC-TEMPLATE.md                           ← template chung cho manual QC và automated testcase artifact
│   ├── REGRESSION-SUITE.md                      ← regression cross-wave (Garage v2)
│   ├── E2E-SUITE.md                             ← user journeys cross-wave (Garage v2 — J-01..J-07)
│   ├── SMOKE-SUITE.md                           ← critical sanity checks (Garage v2 — S-01..S-15)
│   └── TC-WAVE-{NN}-*.md / TC-W{NN}-{TYPE}.md   ← manual QC chi tiết theo wave
└── automated-test-cases/
    └── TC-W{NN}-*.md                            ← automated TC artifacts do AI test agents sinh ra
```

### Quan hệ giữa các file

```
                          TEST-CASE-REGISTRY.md
                          (manual QC index + dashboard)
                                  │
           ┌──────────────────────┼──────────────────────┐
           ▼                      ▼                      ▼
  TC-WAVE-{NN}-*.md        REGRESSION-SUITE.md      E2E-SUITE.md
  (manual source of        (ref manual TC IDs)      (journeys cross-wave,
   truth, chi tiết steps)                            ref manual TC IDs)
           │                      │                      │
           ▼                      │                      ▼
 Execution/test-reports/*         │               SMOKE-SUITE.md
 (manual execution results)       │               (subset critical S-01..S-15)
                                  │
 AI test agents: read-only from manual QC docs
 → write automated TC artifacts to `Execution/automated-test-cases/`
 → write execution reports to `Execution/test-reports/W{NN}/`
```

### Quy tắc đặt tên test case ID

Format khuyến nghị cho **manual QC**: `W{NN}-U-{NNN}`

| Ví dụ | Ý nghĩa |
|---|---|
| `W01-U-001` | Manual QC case số 001 của W01 (Insurance Foundation) |
| `W02-U-005` | Manual QC case số 005 của W02 |
| `W03-U-003` | Manual QC case số 003 của W03 |

`Feature ID`, `Boundary`, `AC Ref`, `Type`, `Suite` mang traceability chi tiết. Khi một manual test case từ wave trước được re-use cho regression/smoke/E2E ở wave sau, **GIỮ NGUYÊN ID** — chỉ thêm entry trong suite tương ứng.

> **Automated TC ID** (do AI test agents quản lý, KHÔNG ở file này): `TC-W{NN}-{TYPE}` cấp file (vd `TC-W01-API.md`), case-level theo template trong artifact.

> **Note 2026-06-11**: Hiện trạng W01 — `Execution/test-cases/` chứa 8 file post-split theo type (`TC-W01-{API,E2E,UI,MOBILE-UI,MOBILE-E2E,ISOLATION,PERFORMANCE,SECURITY}.md`) dùng convention automated-style. Rule manual `TC-WAVE-{NN}-*.md` + `W{NN}-U-{NNN}` áp dụng khi QC tạo manual TC mới hoặc khi rename sang manual convention.

---

## 3. Vòng đời Test Case

```
DRAFT ─► READY ─► PASS
             │
             ├─► FAIL     ─► (fix bug → READY → re-test)
             ├─► BLOCKED  ─► (gỡ dependency → READY)
             └─► SKIPPED  ─► (ngoài scope run hiện tại / chờ điều kiện phù hợp)
```

| Trạng thái | Emoji | Ý nghĩa | Ai cập nhật |
|---|---|---|---|
| `DRAFT` | 📝 | Test case mới soạn, chưa review | QC |
| `READY` | ✅ | Đã sẵn sàng để manual QC chạy | QC |
| `PASS` | 🟢 | Đã chạy và đúng expected | QC |
| `FAIL` | 🔴 | Đã chạy nhưng lệch expected, phải link bug | QC |
| `BLOCKED` | ⛔ | Không chạy được do dependency / env / data | QC |
| `SKIPPED` | 🟡 | Tạm không chạy trong đợt hiện tại | QC |

### Ràng buộc chuyển trạng thái

- `DRAFT → READY`: cần đủ preconditions, steps, expected result, priority và scope review.
- `READY → PASS/FAIL/BLOCKED/SKIPPED`: chỉ sau khi manual QC thực thi hoặc xác nhận không thể chạy.
- `FAIL`: bắt buộc tạo/link bug trong `Tracking/WAVE{NN}/BUGS.md` (rows) — index tại `Tracking/BUGS.md`.
- `BLOCKED`: phải ghi rõ dependency hoặc environment đang chặn.
- Khi wave đóng manual QC scope: không nên còn case ở `DRAFT` nếu case đó thuộc scope bắt buộc của wave.

---

## 4. Wave Index — Dashboard

> Cập nhật sau mỗi checkpoint hoặc khi trạng thái test case thay đổi. Số liệu tính theo từng wave (không tính re-use regression từ wave khác).
> **Scope đang chạy = Insurance Foundation W01-W03** (nguồn: [Plan/README.md](../../Plan/README.md), [Plan/WAVE-SEQUENCE.md](../../Plan/WAVE-SEQUENCE.md)).

| Wave | Title | Boundaries | Files | Total | DRAFT | READY | PASS | FAIL | BLOCKED | SKIPPED | Pass % | Status |
|---|---|---|---|--:|--:|--:|--:|--:|--:|--:|---|---|
| W01 | Insurance Foundation (EP-INSURANCE-SETTLEMENT slice 1/3) — FEAT-INS-SO-ADJUSTMENT + FEAT-INS-STL-DETAIL | `gf-sales`, `gf-accounting`, `agg-garage-graph`, `garage-web`, `garage-mobile` | `TC-W01-{API,E2E,UI,MOBILE-UI,MOBILE-E2E,ISOLATION,PERFORMANCE,SECURITY}.md` (8 files, 295 TC sau split) | 295 | 0 | 295 | 0 | 0 | 0 | 0 | — | 🟡 Đang chạy TEST_EXECUTION |
| W02 | Insurance Dossier (EP-INSURANCE-SETTLEMENT slice 2/3) — FEAT-INS-STL-CREATE + FEAT-INS-DOSSIER-CREATE + FEAT-INS-DOSSIER-VIEW + 6 CRs (CR-20260612-01/02 · CR-20260616-01/02 · CR-20260618-01/02) | `gf-accounting`, `gf-sales`, `agg-garage-graph`, `garage-web`, `garage-mobile`, `ct-file-storage` | Auto exec (QC-accepted basis): `Execution/automated-test-cases/TC-W02-*.md` (8 files, 400 TC executed). Manual design: `TC-W02-*` 429 TC. | 400 | 0 | 0 | 309 | 0 | 0 | 91 | 77.3% | 🟢 QC manual PASS — chờ sign-off |
| W03 | TBD | — | — | — | — | — | — | — | — | — | — | 🔲 Chưa hoạch định |

> Trạng thái tổng hợp wave: `📝 Draft` → `✅ Ready` → `🟢 Passed` → `🔴 Failed` → `🧪 Test gate`.
> **Baseline lịch sử**: 15 feature wave (booking/SO/settlement/inventory/marketing…) đã production — không liệt kê ở đây trừ khi regression chạm tới. Mental model trong `Execution/knowledge-graphs/*.yaml` + `Product/epics/`.
> **W01 split (2026-06-11)**: ban đầu consolidate 3 file (API/E2E/UI = 100+36+159 = 295 TC), sau split 8 file theo type tương ứng 8 test agent (API/E2E/UI/MOBILE-UI/MOBILE-E2E/ISOLATION/PERFORMANCE/SECURITY). TC ID giữ prefix gốc `TC-W01-{TYPE}-NNN` (automated convention). Khi QC muốn convert sang manual QC convention `W01-U-NNN` — raise CR + QA Authority approve.
> **W02 dashboard (2026-06-26)**: số liệu mirror từ [`Tracking/WAVE02/REPORT-QC-FINAL-2026-06-26.md`](../../Tracking/WAVE02/REPORT-QC-FINAL-2026-06-26.md) §5.2 sau QC manual acceptance (CR-20260626-01). **Total 400 = TC automated thực thi (QC-accepted basis)**; PASS 309 (gồm 34 FAIL→PASS + 84 BLOCKED→PASS manual-test); FAIL 0; BLOCKED 0; **SKIPPED 91 = 67 out-of-scope (sec/perf/iso) + 14 DEFER + 10 WITHDRAWN** (gộp vào cột SKIPPED vì dashboard không có cột riêng). Pass% = 309/400 = 77.3%. Bug board: 94 VERIFIED + 18 INVALID, 0 OPEN, 0 release-blocker (BUG-107 IDOR → INVALID, live re-verify). Còn lại để đóng: QC Authority sign `qc.signed_by` → `/wave-end`.

---

## 5. Test Suites (cross-wave)

| Suite | File | Mục đích | Khi chạy | Owner |
|---|---|---|---|---|
| **Regression** | [REGRESSION-SUITE.md](REGRESSION-SUITE.md) | Đảm bảo wave mới không phá tính năng cũ — bao gồm 100% Priority=P1 của wave trước + P2 cross-boundary. Phải cover cả web + mobile platform parity. Brownfield baseline §2.0 cho 15 wave production (audit only). | Trong `TEST_EXECUTION` mỗi wave; áp mạnh ở release gate. | QC |
| **E2E** | [E2E-SUITE.md](E2E-SUITE.md) | User journey cross-boundary: J-01 booking→SO→settlement · J-02 quotation→PR→PO · J-03 customer→campaign→notification · J-04 tenant isolation · J-05 SO→delivery→inventory · J-06 PO→receipt→inventory · J-07 period stock closure→WAC/COGS. **Web (`agent-test-e2e` Playwright) + Mobile (`agent-test-mobile-e2e` Patrol) là 2 track riêng — cùng business outcome nhưng different stack**. | Chạy partial theo wave khi đủ dependency. | QC |
| **Smoke** | [SMOKE-SUITE.md](SMOKE-SUITE.md) | Sanity check nhanh sau mỗi build/deploy. Tập Critical tối thiểu (15 TCs S-01..S-15), chạy < 30 phút. Bao gồm cả web + mobile happy path. | Sau build mới trong DEV_GROUP, trước khi mở TEST_GROUP; sau deploy staging. | QC + Dev |

### Quy tắc tuyển chọn vào suite

| Suite | Tiêu chí |
|---|---|
| Regression | 100% Priority=P1 + P2 cross-boundary; P3 nếu từng có bug `P1/P2` |
| E2E | Journey xuyên ≥2 boundary, kết nối bằng data flow thực tế (REST/Kafka event/Temporal) |
| Smoke | Happy path P1, không đi sâu edge case; tất cả phải chạy được trên build vừa ra |

---

## 6. Ownership Matrix

| Hành động | SA | PO | Dev | QC |
|---|---|---|---|---|
| Soạn manual test case | Tham vấn | Tham vấn | Tham vấn | **OWNER** |
| Review scope manual test case (business) | — | **APPROVE** | Inform | Submit |
| Review scope manual test case (technical) | **APPROVE** | — | Tham vấn | Submit |
| Chuyển `DRAFT → READY` | Co-sign | Co-sign | Inform | Execute |
| Chạy manual test case (`READY → PASS/FAIL/BLOCKED/SKIPPED`) | — | — | Tham vấn | **OWNER** |
| Cập nhật Regression/E2E/Smoke suite | — | Tham vấn | Tham vấn (Smoke) | **OWNER** |
| Cập nhật file này (dashboard + matrix) | — | — | — | **OWNER** |

---

## 7. Sync Rules — khi file TC-WAVE-* thay đổi

> Bắt buộc thực hiện ngay trong cùng commit với thay đổi test case.
> Nguyên tắc nền: bug status và testcase status không tự suy luận thay nhau. `RESOLVED` chưa đủ để đổi testcase `FAIL` → `PASS`; chỉ re-test pass dẫn tới `VERIFIED/CLOSED` mới được đổi testcase và aggregate liên quan.

| Thay đổi trong `TC-WAVE-{N}-*.md` / `TC-W{N}-{TYPE}.md` | Cập nhật bắt buộc |
|---|---|
| Thêm test case mới | (1) Dashboard §4 — tăng `Total` + `DRAFT`; (2) Nếu Priority=P1 → thêm vào `REGRESSION-SUITE.md`; (3) Nếu Smoke candidate → thêm vào `SMOKE-SUITE.md` |
| Xoá test case | (1) Dashboard §4 — giảm `Total` + cột tương ứng; (2) Gỡ khỏi REGRESSION/E2E/SMOKE nếu có; (3) Note trong Changelog lý do xoá |
| Đổi Status | (1) Dashboard §4 — điều chỉnh cột + recompute Pass %; (2) Nếu FAIL → link `Tracking/WAVE{NN}/BUGS.md`; (3) Nếu thuộc suite → review cập nhật suite |
| Đổi Priority | (1) Dashboard §4 không đổi; (2) Lên P1 → đưa vào REGRESSION; xuống dưới → review gỡ khỏi REGRESSION |
| Sửa Traceability (Feature/Boundary/AC Ref) | Cập nhật trực tiếp cột trong bảng testcase của `TC-WAVE-*`/`TC-W*`; không cần chạm registry |
| Bug linked đổi status trong `Tracking/WAVE{NN}/BUGS.md` | (1) Bug chỉ `RESOLVED`/`FIX_DONE` → testcase giữ status hiện tại tới khi re-test; (2) Bug `VERIFIED/CLOSED` sau re-test pass → testcase `FAIL → PASS`, refresh Dashboard §4 + suite; (3) Bug `REOPEN`/verify fail → testcase giữ/quay lại `FAIL`, sync notes |
| Automated testcase artifact / test report đổi aggregate | AI test agents KHÔNG cập nhật file này trực tiếp. QC dùng handoff summary từ artifact/report để mirror đúng wave row hoặc suite/dashboard |

---

## 8. Tham chiếu

| Tài liệu | Đường dẫn | Mô tả |
|---|---|---|
| Test Case Template | [TC-TEMPLATE.md](TC-TEMPLATE.md) | Template chung cho testcase artifact |
| Regression Suite | [REGRESSION-SUITE.md](REGRESSION-SUITE.md) | Tổng hợp regression cross-wave (Garage v2 — 18 boundary) |
| E2E Suite | [E2E-SUITE.md](E2E-SUITE.md) | Cross-wave user journeys (Garage v2 — J-01..J-07) |
| Smoke Suite | [SMOKE-SUITE.md](SMOKE-SUITE.md) | Sanity check nhanh sau build mới (Garage v2 — S-01..S-15) |
| Wave Sequence | [../../Plan/WAVE-SEQUENCE.md](../../Plan/WAVE-SEQUENCE.md) · [../../Plan/README.md](../../Plan/README.md) | Active waves, titles, gate |
| Master Execution Plan | [../MASTER-EXECUTION-PLAN.md](../MASTER-EXECUTION-PLAN.md) | Stage topology + exit criteria |
| Test Report Template | [../test-reports/TEST-REPORT-TEMPLATE.md](../test-reports/TEST-REPORT-TEMPLATE.md) | Báo cáo kết quả chạy |
| Bug Registry (index) | [../../Tracking/BUGS.md](../../Tracking/BUGS.md) | Index liên-wave; rows ở `Tracking/WAVE{NN}/BUGS.md` |
| Pointer Registry | [../../Tracking/TEST-CASE-REGISTRY.md](../../Tracking/TEST-CASE-REGISTRY.md) | Cross-wave pointer + summary read-only ở lớp tracking |
| Document Dependency Map | [../../DOC-DEPENDENCY-MAP.md](../../DOC-DEPENDENCY-MAP.md) | Propagation rules cho test docs |

---

## 9. Changelog

| Ngày | Version | Tác giả | Thay đổi |
|---|---|---|---|
| 2026-04-11 → 2026-05-06 | 1-6 | orchestrator + qc + Codex | (SV legacy) Khởi tạo + iterate SnapVersify versions — branding SV, 20 wave, content/video domain. |
| 2026-06-11 | 7 | agent-test-api (bypass-owned + QA Authority sign-off pending) | **Convert SV → Garage (v6 → v7)**: thay toàn bộ domain SnapVersify (20 wave Platform Foundation/Tenant CRUD/Provisioning/Content/Moderation/Engagement/Search/Notification/Analytics) bằng thực tế Garage. (a) Frontmatter `document_id` SV-TEST-CASE-REGISTRY → GMS-TEST-CASE-REGISTRY; title → "Test Case Registry — Garage (Manual QC dashboard)"; (b) Brownfield context: 15 wave production đã ship + post-baseline active waves (W01-W03 Insurance Foundation hoặc TD P0 work); (c) Cấu trúc: 18 boundary Garage (14 Java + 2 BFF + Web + Mobile); (d) §4 Dashboard: 20 SV waves → 3 active row (W01 Insurance filled 295 TC, W02-W03 TBD); (e) §5 Suite: ref E2E J-01..J-07 Garage + Smoke S-01..S-15 Garage + Regression brownfield-aware; (f) §7 Sync rules: BUGS path 2-tier `Tracking/WAVE{NN}/BUGS.md`; status canonical extended (RESOLVED→FIX_DONE/VERIFY_PENDING per `Tracking/BUGS.md §5.1`); (g) W01 split note: 8 file `TC-W01-{TYPE}.md` post-split theo 8 test agent; (h) Dual persona only (`accountant` + `garage-owner`). | agent-test-api |

| 2026-06-22 | 8 | orchestrator (per QA Authority proxy authorization session 2026-06-22) | **Fill §4 W02 row** từ TBD/🔲 Chưa hoạch định → actual scope post-TEST_PLANNING: Title "Insurance Dossier (slice 2/3)" + 3 FEAT (STL-CREATE + DOSSIER-CREATE + DOSSIER-VIEW) + 6 CRs (CR-20260612-01/02 + CR-20260616-01/02 + CR-20260618-01/02); Boundaries 6 (gf-accounting + gf-sales + agg-garage-graph + garage-web + garage-mobile + ct-file-storage); Files 8 manual (429 TC, all READY) + 8 automated AI-ref (520 TC); Status "🟡 Đang chạy TEST_PLANNING". Source: handoff doc `Execution/handoffs/W02-TEST-PLANNING-handoff.md` session 2026-06-22. Per §1 FAQ "Khi nào cập nhật": (1) mở wave mới → manual TCs DRAFT/READY. QC sẽ tiếp tục update §4 trong TEST_EXECUTION khi TC chạy. |
| 2026-06-26 | 9 | QC (Authority anhluong, in-session) | **Update §4 W02 dashboard — QC manual acceptance final** (mirror `Tracking/WAVE02/REPORT-QC-FINAL-2026-06-26.md` §5.2, per CR-20260626-01). W02 row: Total 400 (TC automated executed, QC-accepted basis); PASS 309 (34 FAIL→PASS + 84 BLOCKED→PASS manual-test); FAIL 0; BLOCKED 0; SKIPPED 91 (67 out-of-scope sec/perf/iso + 14 DEFER + 10 WITHDRAWN); Pass% 77.3%; Status "🟢 QC manual PASS — chờ sign-off". Bug board 94 VERIFIED + 18 INVALID, 0 OPEN, 0 release-blocker (BUG-107 IDOR→INVALID live re-verify). Thỏa exit criterion `manual_qc_dashboard_updated`. Còn lại: QC sign `qc.signed_by` → `/wave-end`. |
