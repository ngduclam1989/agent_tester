# Bug Report Template — PROPOSAL v2 (single-file model)

> **Status**: 🟡 PROPOSAL v2 — chưa active. Chờ Senior QC + Delivery Authority review.
> **Tác giả**: cuongnguyen_ac (Senior QC) · **Ngày cập nhật**: 2026-06-16
> **Thay đổi vs v1**: bỏ 3-layer (L1 row + L2 verify + L3 fix), chuyển sang **single-file per wave** — 1 file `Tracking/WAVE{NN}/BUGS.md` chứa cả dashboard tổng quan + chi tiết bug.
> **Mục tiêu**: agent-fix mở 1 file là có đủ context trace (Steps + Actual + Expected + Evidence + Impact + Root cause hint) — không phải nhảy 3 file.

---

## 1. Tư duy nền tảng

3 đau điểm hiện tại + cách template này giải quyết:

| Đau điểm hiện tại | Giải pháp single-file |
|---|---|
| Title vague → agent-fix đọc 5-10 file để hiểu | Title format ép `[Module] Chức năng — Hành vi lỗi` + Steps chi tiết ngay trong file |
| Mở 3 file (L1 row → L2 verify → L3 fix) mới có đủ context | **Single file/wave** — chỉ mở 1 file thấy hết Steps + Evidence + Root cause |
| Khó biết wave có bao nhiêu bug OPEN, FEAT nào nhiều bug | **§1 Dashboard tables** thống kê tổng quan ngay đầu file |
| Steps mô tả mơ hồ, không có link đến UI/API cụ thể | Steps BẮT BUỘC link tới screen/figma (UI) hoặc endpoint+field (API) |

**Nguyên tắc thiết kế**:

1. **1 wave = 1 file**: `Tracking/WAVE{NN}/BUGS.md`. KHÔNG tách per-bug file. KHÔNG tách verify/fix file riêng.
2. **3 section trong cùng file**: Dashboard (counters) · Master Index (slim table) · Detailed Cards (1 card/bug).
3. **Steps phải có anchor**: UI bug → link figma spec + screen; API bug → endpoint + payload + field name.
4. **Conditional block theo loại bug**: UI/API/DB/Event/Security mỗi loại có sub-section riêng trong card.
5. **Root cause hint BẮT BUỘC** ngay khi log (1-3 dòng observation) — tiết kiệm 1 vòng đoán cho agent-fix.

---

## 2. Cấu trúc file (target layout)

```text
Tracking/WAVE{NN}/BUGS.md
├── § Header — wave info + nguyên tắc ngắn
├── §1 Dashboard — tổng quan
│    ├── 1.1 Counter tổng (Status × Severity)
│    ├── 1.2 By Feature (mỗi FEAT có bao nhiêu bug + status)
│    ├── 1.3 By Boundary owner (gf-sales, agg-garage-graph, garage-web…)
│    └── 1.4 By Bug type (UI / API / DB / Event / Security)
├── §2 Master Index — bảng slim 1 dòng/bug để scan nhanh
│    └── (BUG-ID | Title | FEAT | Severity | Status | Assigned | Updated)
└── §3 Detailed Cards — chi tiết per-bug
     ├── ### BUG-W01-264
     │    ├── A. Identity (TC, FEAT, AC, Related, Reporter)
     │    ├── B. Environment (tier, build, tenant, seed, client)
     │    ├── C. Steps to Reproduce (đánh số + link UI/API/DB)
     │    ├── D. Expected vs Actual
     │    ├── E. Evidence (paths + inline snippets)
     │    ├── F. Conditional block (UI / API / DB / Event / Security)
     │    ├── G. Impact & Severity rationale
     │    ├── H. Root Cause Hint
     │    └── I. Verdict Log (status flip history)
     ├── ### BUG-W01-265
     └── ...
```

---

## 3. §1 Dashboard — Summary tables (design)

> Section đầu file, update mỗi khi add/update bug. Agent-fix + orchestrator scan ở đây trước khi đọc detail.

### 3.0 Status state machine (7 trạng thái)

> Áp dụng cho toàn bộ wave. KHÔNG dùng status nào ngoài 7 trạng thái dưới đây.

| Status | Ý nghĩa | Auto / Manual | Trigger / Actor | Điều kiện |
|---|---|---|---|---|
| **OPEN** | Bug đã tạo + assign agent-fix tương ứng | **Auto (log + assign)** | Reporter (agent-test-* · manual-qc · QC Human) | Lúc log bug — assign owner ngay (P1 KHÔNG để OPEN qua đêm mà không assign) |
| **RESOLVED** | Bug đã fix + bàn giao cho agent-test tương ứng | **🤖 Auto** | **agent-fix-* (agent-dev-fix-{boundary}) tự update khi fix xong** | Fix code merged + regression test local PASS + image rebuild xong |
| **VERIFIED** | Bug đã được agent-test re-test **automated** live PASS | **🤖 Auto** | **agent-test-* tự update khi verify automated done PASS** | Re-run TC pass + Acceptance Criteria khớp (UI bug: 4 design-source checkbox PASS) |
| **DONE** | Bug đã được **QC Human verify manual** done — final acceptance | **👤 Manual** | **QC Human** tự update khi verify manual xong | QC Human đã chạy manual acceptance (smoke test thực tế trên UI live · check side-effect cross-feature · confirm regression không xuất hiện); là **terminal state** của happy path |
| **REOPEN** | Fix FAIL — verify không pass / dev sửa nhầm layer / regression tái xuất | **🤖 Auto** | **agent-test-* tự update khi verify FAIL** | Re-run TC fail · acceptance criteria không khớp · regression tái xuất sau fix |
| **REJECTED** | Xác nhận **KHÔNG phải bug** — terminal | **👤 Manual** | **QC Human** (chính) HOẶC **agent-test-*** (khi đang test phát hiện không phải bug) | Sai oracle · misread spec · feature đúng spec · environment issue đã loại trừ |
| **PENDING** | Cần check lại — mâu thuẫn spec, oracle chưa rõ, chờ clarify | **👤 Manual** | **QC Human** (chính) HOẶC **agent-test-*** (khi đang test phát hiện mâu thuẫn / ambiguity) | Spec mâu thuẫn 2 nguồn (vd FEAT vs BR) · oracle chưa tồn tại · waiting on external decision (CR pending) · ambiguous expected behavior |

> **Phân biệt VERIFIED vs DONE**:
> - **VERIFIED** = automated TC pass (agent-test chạy re-run TC) → chứng minh fix **đúng** ở mức code/contract.
> - **DONE** = QC Human manual acceptance → chứng minh fix **không break** end-to-end thực tế trong wave (smoke flow + cross-feature side-effect).
> - VERIFIED **chưa phải** terminal — bug có thể bị Senior QC reopen nếu manual phát hiện vấn đề mà automated TC miss.
> - DONE = terminal happy path. Không reopen từ DONE; nếu tái xuất = bug mới với cross-ref Bug ID cũ.

#### 3.0.1 Automation rules (BẮT BUỘC tuân thủ — chốt 2026-06-16)

> 4 transition **auto** (do agent self-update), 2 transition **manual** (cần human/agent-test judgement). Mục tiêu: orchestrator không phải intervene mỗi lần status flip — agent có context tự chuyển; chỉ những quyết định cần judgement (not-a-bug / mâu thuẫn spec) mới cần human/test agent.

| Transition | Mode | Trigger cụ thể | Bắt buộc kèm trong Verdict Log |
|---|---|---|---|
| `— → OPEN` | 👤 Manual log | Reporter tạo bug | Bug card đầy đủ A→I |
| `OPEN → RESOLVED` | 🤖 **Auto** | **agent-fix-* hoàn tất fix + regression local PASS** | Image SHA mới + path regression test |
| `RESOLVED → VERIFIED` | 🤖 **Auto** | **agent-test-* verify automated PASS** trên image live | TC ID re-run + acceptance criteria result + evidence path |
| `VERIFIED → DONE` | 👤 **Manual** | **QC Human verify manual done** — final acceptance (smoke flow + cross-feature side-effect check) | Manual acceptance note + screen recording/screenshot + ngày verify |
| `VERIFIED → REOPEN` | 🤖 **Auto** | **agent-test-* verify automated FAIL** (sau fix) | Reason FAIL + image SHA tested + iteration # |
| `VERIFIED → REOPEN` | 👤 **Manual** | **QC Human manual phát hiện vấn đề** mà automated TC miss (cross-feature side-effect / regression hidden) | Reason FAIL manual + smoke flow path + iteration # |
| `REOPEN → RESOLVED` | 🤖 **Auto** | **agent-fix-* re-fix xong** | New image SHA + iteration # incremented |
| `OPEN → REJECTED` | 👤 **Manual** | QC Human / agent-test-* xác nhận not-a-bug | Rationale + reference (oracle đúng / spec source) |
| `RESOLVED → REJECTED` | 👤 **Manual** | QC Human / agent-test-* phát hiện fix vô hiệu (spec đúng nguyên bản) | Rationale |
| `OPEN → PENDING` | 👤 **Manual** | QC Human / agent-test-* phát hiện mâu thuẫn / ambiguity | Waiting for: ai/CR/oracle |
| `RESOLVED → PENDING` | 👤 **Manual** | agent-test-* khi verify phát hiện mâu thuẫn | Waiting for: ai/CR/oracle |
| `PENDING → OPEN` | 👤 **Manual** | QC Human clarify — vẫn là bug | Rationale clarify |
| `PENDING → REJECTED` | 👤 **Manual** | QC Human clarify — không phải bug | Rationale clarify |

> **DONE là terminal happy path** — không transition ra. Nếu bug tái xuất sau DONE = file bug mới với cross-ref Bug ID cũ trong Related Bugs.
> **REJECTED là terminal not-a-bug** — không transition ra. Cùng quy tắc nếu cần track lại.

**Notes**:
- **🤖 Auto** = agent có đủ context (test result PASS/FAIL · fix done signal) → tự flip status + append Verdict Log row + sync Master Index + counter dashboard. KHÔNG cần human/orchestrator confirm.
- **👤 Manual** = cần judgement về **nội dung** (bug hợp lệ? spec đúng nào canonical?). Chỉ QC Human (chính) hoặc agent-test-* (khi đang test phát hiện) được flip.
- **agent-fix-* KHÔNG được REJECTED/PENDING**: agent-fix có thể bias (muốn "đẩy bug đi"). Quyết định not-a-bug phải đến từ test side (agent-test-*) hoặc Senior QC.

**Transition cho phép**:

```text
                                         ┌─────────────────────────────────┐
                                         │                                 ▼
OPEN ──► RESOLVED ──► VERIFIED ──► DONE                                 REOPEN ──► RESOLVED  (re-fix)
  │         │             │  │                                            ▲
  │         │             │  └──► REOPEN  (QC Human manual phát hiện FAIL)─┤
  │         │             └────► REOPEN  (agent-test automated FAIL) ──────┘
  │         │
  │         ├──► REJECTED  (fix discover sai oracle)
  │         └──► PENDING   (fix gặp ambiguity, cần clarify)
  │
  ├──► REJECTED  (not-a-bug từ đầu)
  └──► PENDING   (spec mâu thuẫn, chờ Senior QC chốt)

PENDING ──► OPEN      (clarified — vẫn là bug hợp lệ)
PENDING ──► REJECTED  (clarified — không phải bug)
```

**Quy tắc bổ sung** (đã chốt 2026-06-16):

| Quy tắc | Chi tiết |
|---|---|
| Verify FAIL = REOPEN | KHÔNG dùng OPEN lại; REOPEN giữ trace verify attempt + rationale FAIL trong Verdict Log |
| **REOPEN counter** | **Track ở §4 Master Index — cột `REOPEN #`** (số lần status đã flip về REOPEN). Reporter/agent-test cập nhật khi flip status. KHÔNG cần field riêng trong §A Identity (đã có Master Index làm chỗ track). |
| **REOPEN ≥ 3 lần = warning** | **Chỉ flag warning** trong §3.5 Aging (vd "⚠️ iteration #3"), KHÔNG auto upgrade severity. Senior QC review manual để quyết định upgrade hay không (tránh false-positive khi fix complex hợp lý nhiều iteration). |
| REOPEN aging | P1 REOPEN > 1 day không có new fix attempt → escalate Senior QC |
| PENDING phải có "Waiting for" field | Ghi rõ chờ ai/gì (Senior QC / BA / PO / CR-{ID} / oracle release) — KHÔNG để PENDING vô thời hạn |
| **PENDING SLA = 3 days đồng nhất** | **Mọi severity** (P1/P2/P3/P4) PENDING > 3 days → auto escalate Senior QC; nếu vẫn block → bump severity hoặc raise CR. KHÔNG phân bậc theo severity (giữ rule đơn giản, dễ enforce). |
| REJECTED là terminal | Không reopen từ REJECTED; nếu cần track lại = file bug mới với cross-ref Bug ID cũ |

### 3.1 Counter tổng — Status × Severity

| Status \ Severity | P1 | P2 | P3 | P4 | **Total** |
|---|---:|---:|---:|---:|---:|
| OPEN | 3 | 2 | 1 | 0 | **6** |
| RESOLVED | 1 | 1 | 0 | 0 | **2** |
| VERIFIED | 2 | 3 | 1 | 0 | **6** |
| DONE | 3 | 5 | 1 | 1 | **10** |
| REOPEN | 1 | 0 | 0 | 0 | **1** |
| REJECTED | 1 | 1 | 0 | 0 | **2** |
| PENDING | 0 | 1 | 0 | 0 | **1** |
| **Total** | **11** | **13** | **3** | **1** | **28** |

> **Cảnh báo PENDING / REOPEN**: cả 2 status đều là "active state" — cần xử lý trong wave. Counter ở §3.1 phải hiển thị riêng để Senior QC không bỏ sót.
> **Wave done rate** = `DONE / Total` (KHÔNG dùng VERIFIED) — vd 10/28 = 36%. VERIFIED chưa tính là done vì chưa qua manual acceptance.

### 3.2 By Feature

| Feature ID | OPEN | RESOLVED | VERIFIED | DONE | REOPEN | REJECTED | PENDING | **Total** | Notes |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| FEAT-INS-SO-ADJUSTMENT | 4 | 1 | 3 | 6 | 1 | 2 | 1 | **18** | drift contract chain (W01) |
| FEAT-INS-STL-DETAIL | 2 | 0 | 2 | 3 | 0 | 0 | 0 | **7** | settlement read drift |
| TECH-SECURITY-W01 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | **4** | JWT/RBAC, all OPEN |
| (N/A — exploratory) | 0 | 1 | 1 | 1 | 0 | 0 | 0 | **3** | — |

### 3.3 By Boundary owner

| Boundary | OPEN | RESOLVED | VERIFIED | DONE | REOPEN | REJECTED | PENDING | **Total** | Top bug type |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| gf-sales | 2 | 1 | 2 | 3 | 1 | 1 | 1 | **11** | API · Persist |
| gf-accounting | 1 | 0 | 1 | 2 | 0 | 0 | 0 | **4** | API · Event |
| agg-garage-graph | 1 | 0 | 2 | 2 | 0 | 0 | 0 | **5** | SDL drift |
| garage-web | 2 | 1 | 1 | 5 | 0 | 1 | 0 | **10** | UI · Mapping |
| garage-mobile | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** | — |
| (cross-boundary) | 0 | 0 | 0 | 2 | 0 | 0 | 0 | **2** | Contract refactor |

### 3.4 By Bug type

| Bug type | OPEN | RESOLVED | VERIFIED | DONE | REOPEN | REJECTED | PENDING | **Total** | Required block |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| UI | 2 | 1 | 3 | 4 | 0 | 1 | 0 | **11** | Figma DEV spec + screen anchor |
| API | 3 | 1 | 3 | 6 | 1 | 1 | 1 | **16** | Endpoint + request/response + field |
| DB / Persist | 1 | 0 | 1 | 2 | 0 | 0 | 0 | **4** | Table.column + query + row state |
| Event / Kafka / Temporal | 0 | 0 | 0 | 1 | 0 | 0 | 0 | **1** | Topic + MessageType + envelope |
| Security | 4 | 0 | 0 | 0 | 0 | 0 | 0 | **4** | Attack vector + cross-tenant |

### 3.5 Aging snapshot (P1 còn OPEN/RESOLVED)

| Bug ID | Status | Age (days) | Assigned | Action |
|---|---|---:|---|---|
| BUG-W01-227 | OPEN | 8 | agent-fix-gf-sales | over-aged → escalate Senior QC |
| BUG-W01-259 | RESOLVED | 1 | agent-fix-agg-garage-graph | chờ agent-test-api re-run live |
| BUG-W01-013 | REOPEN | 2 | agent-fix-garage-web | iteration #3, fix lần 2 vẫn FAIL |

> Aging alert rule:
> - P1 OPEN > 1 day = alert · P1 RESOLVED > 2 days = alert (TEST chậm verify) · P1 REOPEN > 1 day = alert
> - PENDING > 3 days (mọi severity) = auto escalate Senior QC (xem §3.6)

### 3.6 PENDING snapshot — chờ clarify

> Section riêng cho PENDING vì có "waiting for" cần track. KHÔNG để PENDING vô thời hạn.

| Bug ID | Severity | Age (days) | Waiting for | Reporter | Last update |
|---|---|---:|---|---|---|
| BUG-W01-268 | P2 | 1 | Senior QC — clarify spec FEAT §AC-4 vs BR §5.3 mâu thuẫn về behavior discount > price | agent-test-api | 2026-06-16 |

> Khi PENDING resolve: → `OPEN` (vẫn là bug) hoặc → `REJECTED` (không phải bug). KHÔNG để overdue.

---

## 4. §2 Master Index — slim table (1 dòng/bug)

> Bảng quick-scan. Cột tối thiểu để orchestrator triage nhanh; chi tiết ở §3 detailed cards.
> **Cột `REOPEN #`** track số lần bug đã flip về REOPEN (≥ 3 → ⚠️ warning manual review, KHÔNG auto upgrade severity).

| Bug ID | Title (≤120 ký tự) | Type | FEAT | Severity | Status | REOPEN # | Assigned | Updated |
|---|---|---|---|---|---|---:|---|---|
| BUG-W01-264 | [gf-sales] Settlement — total_amount âm khi discount > unit_price | API | FEAT-INS-SO-ADJUSTMENT | P1 | OPEN | 0 | agent-fix-gf-sales | 2026-06-16 |
| BUG-W01-265 | [garage-web] Settlement detail — cell "Phân bổ BH" hiển thị 0đ | UI | FEAT-INS-STL-DETAIL | P2 | RESOLVED | 0 | agent-fix-garage-web | 2026-06-16 |
| BUG-W01-266 | [exploratory] Báo nhầm — booking flow bị block khi đổi tab nhanh | UI | N/A | P3 | REJECTED | 0 | Senior QC | 2026-06-16 |
| BUG-W01-013 | [garage-web] SO edit — section BH crash on null | UI | FEAT-INS-SO-ADJUSTMENT | P1 | REOPEN | ⚠️ 3 | agent-fix-garage-web | 2026-06-16 |
| BUG-W01-268 | [gf-sales] Discount > unit_price — spec mâu thuẫn FEAT vs BR | API | FEAT-INS-SO-ADJUSTMENT | P2 | PENDING | 0 | (chờ Senior QC clarify) | 2026-06-16 |

> **REOPEN # rule**: 0 mặc định · 1-2 hiển thị số bình thường · **≥ 3 hiển thị `⚠️ N`** để Senior QC review manual — quyết định có upgrade severity hay giữ nguyên (vd fix complex hợp lý reopen nhiều lần). KHÔNG auto bump P2→P1.

> Title click → anchor link xuống `### BUG-W01-264` ở §3 (markdown `[BUG-W01-264](#bug-w01-264)`).

---

## 5. §3 Detailed Card — template 1 bug

> Đây là layout **MỘT card bug** trong §3 detailed section. Mỗi bug có 1 card với 9 sub-section A → I. Card dài ~80-150 dòng/bug · trung bình wave có 30-50 bug → file 3000-7000 dòng — vẫn quản được nếu có Master Index ở §2.

```markdown
### BUG-W01-264

#### A. Identity

| Field | Value |
|---|---|
| Bug ID | BUG-W01-264 |
| Title | [gf-sales] Settlement — total_amount âm khi discount > unit_price |
| Reporter | agent-test-api |
| Reported on | 2026-06-16 09:42 |
| Feature ID | FEAT-INS-SO-ADJUSTMENT |
| AC Ref | AC-4 (validation discount ≤ unit_price) |
| Source TC ID | TC-W01-API-027 |
| Related Bugs | BUG-W01-252 (upstream — base pre-VAT) · BUG-W01-256 (sibling — persist drift) |
| Severity | P1 |
| Priority | P1 |
| Status | OPEN |
| Assigned | agent-fix-gf-sales |

#### B. Environment

| Field | Value |
|---|---|
| Tier | local |
| Wave / Build | W01 · gf-sales:local@ea2b932c605d · agg-garage-graph:local@a1b2c3d |
| Tenant + persona | tenant=1 · accountant@demo.local |
| Seed data | SO=PDV-20260611-00005 · has_insurance=true · state=PRICING |
| Client | curl 8.4 (API-only test) |

#### C. Steps to Reproduce (đánh số + link)

1. Login: `POST {BFF_URL}/auth/login` body `{email:"accountant@demo.local", password:"..."}` → lưu `ACCOUNTANT_TOKEN`.
2. Lấy SO detail: `query getServiceOrderByCode(code:"PDV-20260611-00005")` qua GraphQL endpoint `POST {BFF_URL}/garage/graphql` → confirm `hasInsurance=true`.
3. Gọi mutation insurance adjustment với payload **vượt validation**:
   ```graphql
   mutation {
     updateServiceOrderInsuranceAdjustment(input: {
       serviceOrderCode: "PDV-20260611-00005"
       parts: [{ partCode: "P001", unitPrice: 100, discount: 150, quantity: 2 }]
     }) { total_amount }
   }
   ```
4. Observation point — quan sát:
   - **Field lỗi**: `total_amount` trong response → expect `400 Bad Request` với mã `INS_ADJ_DISCOUNT_EXCEEDS_PRICE`; **actual** trả `200 OK · total_amount=-100`.
   - **DB state**: `SELECT total_amount FROM service_order WHERE code='PDV-20260611-00005'` → `-100` (đã persist sai).

#### D. Expected vs Actual

| | Expected | Actual |
|---|---|---|
| HTTP status | 400 | 200 |
| Response field `total_amount` | not returned (error block thay vào) | `-100` |
| Response error code | `INS_ADJ_DISCOUNT_EXCEEDS_PRICE` | (no error) |
| DB row `service_order.total_amount` | unchanged | `-100` (persisted) |
| Reference source | `Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md §5.3` (validation discount ≤ unit_price) + `Architecture/api/gf-sales-api.md#updateServiceOrderInsuranceAdjustment` | — |

#### E. Evidence

| Loại | Path |
|---|---|
| API request/response | `Execution/test-reports/W01/API/BUG-W01-264-request-response.json` |
| DB query result | `Execution/test-reports/W01/DB/BUG-W01-264-row-state.txt` |
| Inline error log | (gf-sales log không có WARN — silent persist; xem path log đầy đủ trong `…/BUG-W01-264-gf-sales.log`) |
| Repro script | `Tracking/WAVE01/repro/BUG-W01-264.sh` (persistent — KHÔNG /tmp) |

#### F. Conditional block — API Bug (loại bug = API)

| Field | Value |
|---|---|
| Endpoint / GraphQL op | `mutation updateServiceOrderInsuranceAdjustment` |
| Boundary owner | gf-sales (validator) · agg-garage-graph (passthrough) |
| Headers gửi | `Authorization: Bearer {ACCOUNTANT_TOKEN}`, `X-Tenant-Id: 1`, `X-Branch-Id: 1` |
| Request body | xem repro §C step 3 |
| Field sai trong request | `parts[0].discount=150 > parts[0].unitPrice=100` (input vi phạm BR §5.3) |
| Response body actual | `{ "data": { "updateServiceOrderInsuranceAdjustment": { "total_amount": -100 } } }` |
| Schema drift (nếu có) | none — bug là **missing validation**, không phải contract drift |

> Nếu là UI bug → đổi sang block 9A; DB bug → 9C; Event → 9D; Security → 9E (xem mẫu §6 bên dưới).

#### G. Impact & Severity rationale

| Trục | Phân tích |
|---|---|
| FEAT scope | Cross-FEAT: FEAT-INS-SO-ADJUSTMENT + FEAT-INS-STL-DETAIL (settlement read sẽ hiển thị `total_amount=-100` cho user) |
| Boundary consumers | REST: `agg-garage-graph` → `garage-web` (settlement detail page) · Kafka: `gf-accounting` consume `INSURANCE_ADJUSTMENT_APPLIED` (sẽ ghi nhầm số âm) |
| Regression must-cover | TC-W01-API-027 (direct), TC-W01-API-031 (same validator path), TC-W01-E2E-STL-005 (cross-feat settlement detail), TC-W01-API-ACC-012 (Kafka consumer gf-accounting) |
| Severity rationale | **P1** — data corruption (persist số âm) + cross-tenant ko (tenant=1 only) nhưng affect financial calc, cascade gf-accounting. Rule §4 "data loss / corrupt" |

#### H. Root Cause Hint (Reporter observation — 1-3 dòng)

| Trục | Hypothesis |
|---|---|
| Quan sát | Validator `validateInsuranceAdjustmentInputs` không check `discount ≤ unitPrice`; persist xong mới phát hiện (silent-drop ko hoạt động trong case này) |
| Hypothesis | Layer **service** (gf-sales `InsuranceAdjustmentService.validate()`) thiếu rule §5.3; có khả năng schema validator class-level annotation thiếu |
| Boundary nghi | gf-sales (cao) · agg-garage-graph (loại trừ — passthrough) |
| Layer nghi | `app/service/InsuranceAdjustmentService.java` hoặc `domain/validator/InsuranceAdjustmentValidator.java` |

#### I. Verdict Log (status flip history — 6-state machine)

> Mỗi dòng = 1 lần status flip. Append-only. Mỗi flip phải có Rationale. REOPEN/PENDING thêm field "Waiting for" hoặc "Iteration #".

| Date | Actor | Status change | Image SHA / Evidence | Rationale / Waiting for |
|---|---|---|---|---|
| 2026-06-16 09:42 | agent-test-api | — → OPEN | gf-sales@ea2b932c605d | Bug logged + assign agent-fix-gf-sales |
| 2026-06-17 14:10 | agent-fix-gf-sales | OPEN → RESOLVED | gf-sales@f3d4e5a | Fix `validateInsuranceAdjustmentInputs` + regression test PASS |
| 2026-06-17 16:20 | agent-test-api | RESOLVED → VERIFIED | gf-sales@f3d4e5a | TC-W01-API-027 automated re-run PASS; HTTP 400 + INS_ADJ_DISCOUNT_EXCEEDS_PRICE; DB unchanged |
| 2026-06-18 10:00 | Senior QC (human) | VERIFIED → DONE | gf-sales@f3d4e5a | Manual acceptance: smoke flow SO create+settlement PASS; cross-check FEAT-INS-STL-DETAIL không regression; screenshot evidence `Execution/test-reports/W01/manual/BUG-W01-264-done.png` |

**Các nhánh khác (mẫu)**:

| Tình huống | Mode | Dòng Verdict Log mẫu |
|---|---|---|
| Verify FAIL → REOPEN | 🤖 Auto (agent-test) | `2026-06-17 17:00 \| agent-test-api \| VERIFIED → REOPEN \| gf-sales@f3d4e5a \| Iteration #2: re-test FAIL — actual HTTP 200; validator vẫn miss case discount=unitPrice (boundary equal); auto-reopen` |
| Re-fix sau REOPEN | 🤖 Auto (agent-fix) | `2026-06-18 10:30 \| agent-fix-gf-sales \| REOPEN → RESOLVED \| gf-sales@a7b8c9d \| Iteration #2 fix: thêm boundary check 'discount >= unitPrice' (was strict >); regression PASS` |
| Spec ambiguity (agent-test phát hiện khi đang test) | 👤 Manual (agent-test) | `2026-06-16 11:00 \| agent-test-api \| OPEN → PENDING \| — \| Waiting for: Senior QC — FEAT-INS-SO-ADJUSTMENT §AC-4 nói 'discount ≤ unitPrice'; BR-EP §5.3 cho phép vượt khi note 'khuyến mãi'. Cần chốt single source.` |
| Spec ambiguity (QC Human phát hiện) | 👤 Manual (QC Human) | `2026-06-16 11:00 \| Senior QC \| OPEN → PENDING \| — \| Waiting for: BA — cần làm rõ behavior...` |
| PENDING clarify — vẫn là bug | 👤 Manual (QC Human) | `2026-06-17 09:00 \| Senior QC \| PENDING → OPEN \| — \| Clarified: FEAT-INS-SO-ADJUSTMENT §AC-4 canonical; BR-EP §5.3 sẽ patch CR-178XXX. Bug hợp lệ, proceed fix.` |
| PENDING clarify — không phải bug | 👤 Manual (QC Human) | `2026-06-17 09:00 \| Senior QC \| PENDING → REJECTED \| — \| Clarified: BR-EP §5.3 canonical; FEAT-INS-SO-ADJUSTMENT §AC-4 đang outdated, sẽ patch. Bug invalid.` |
| agent-test phát hiện not-a-bug khi đang test | 👤 Manual (agent-test) | `2026-06-16 10:30 \| agent-test-api \| OPEN → REJECTED \| — \| Khi build repro phát hiện oracle sai: endpoint trả 200 + error block là spec đúng (BR-EP §5.5 error envelope pattern). Bug invalid.` |
| QC Human reject batch triage | 👤 Manual (QC Human) | `2026-06-16 10:30 \| Senior QC \| OPEN → REJECTED \| — \| Misread oracle: feature đúng spec. Reporter assert sai HTTP status.` |
| QC Human manual reopen (automated miss) | 👤 Manual (QC Human) | `2026-06-18 11:00 \| Senior QC \| VERIFIED → REOPEN \| gf-sales@f3d4e5a \| Manual acceptance phát hiện: smoke flow OK nhưng tab "Phân bổ BH" FEAT-INS-STL-DETAIL bị regression — total âm vẫn hiển thị 0đ thay vì error message. Auto TC không cover. Iteration #2.` |
```

---

## 6. Conditional Block templates (§F của card thay đổi theo loại bug)

> Mỗi loại bug có template §F riêng. UI bug điền 9A; API bug điền 9B; … Mix loại (vd UI + API drift) thì điền nhiều block.

### 6.1 Block 9A — UI Bug (đồng bộ `Tracking/BUGS.md` rule 25-26)

| Field | Value |
|---|---|
| Platform | web / mobile |
| Figma DEV spec | `Product/ux/figma-web/wave01-insurance-settlement--detail.md#section-thong-tin-xe` |
| Screen anchor | `#section-ins-adjustment` |
| Screenshot reference (oracle) | `Product/ux/figma-web/assets/wave01-...--ins-adjustment.png` |
| Field/component name (theo design — KHÔNG dùng code id) | "Field 'Số biển số xe', section 'Thông tin xe', dưới field 'Hãng xe'" |
| Design-actual gap | Oracle: text "Đăng nhập" 16sp `#1A1A1A`; Actual: text "Login" 14sp `#666` |
| Visual aspect lệch | □ Font ☑ Color ☑ Spacing □ Alignment □ Responsive ☑ Wording □ Visual state |
| Verify checkboxes (4 cấp, BẮT BUỘC khi VERIFY) | □ Screen match · □ Field name match · □ Position match · □ Wording+token match |

### 6.2 Block 9B — API Bug

(xem mẫu trong §5 card BUG-W01-264 phía trên)

### 6.3 Block 9C — DB / Persist Bug

| Field | Value |
|---|---|
| Boundary owner | gf-sales / gf-accounting / … |
| Table + column | `service_order.total_amount` |
| Query kiểm tra | `SELECT total_amount, debt_amount FROM service_order WHERE code='PDV-...'` |
| Expected row state | `total_amount=99000, debt_amount=99000` |
| Actual row state | `total_amount=-100, debt_amount=NULL` |
| Migration liên quan | `V42__add_insurance_adjustment.sql` (nếu schema drift) |

### 6.4 Block 9D — Event / Kafka / Temporal

| Field | Value |
|---|---|
| Topic | `AC-DEV-INSURANCE-EVENTS` |
| MessageType + MessageStep | `INSURANCE_ADJUSTMENT_APPLIED` · step `EMIT` |
| Envelope headers | `OriginTenantId=1`, `MessageGroup=INSURANCE`, `MessageStep=EMIT` |
| Producer outbox row | `outbox_events.status='PENDING'` (stuck — chưa publish) |
| Consumer inbox row | `inbox_events.processed_at=NULL` (chưa nhận) |
| Workflow ID (Temporal) | `insurance-1-PDV-20260611-00005` |

### 6.5 Block 9E — Security / Auth

| Field | Value |
|---|---|
| Vulnerability class | JWT exp bypass / IDOR / authz missing / injection |
| Attack vector | request mẫu (curl) tái hiện exploit |
| Cross-tenant evidence | row data tenant A truy cập được từ tenant B (nếu data leak) |
| OWASP / CWE | `CWE-285` (Improper Authorization) |
| Mitigation status | hotfix branch / temp config / N/A |

---

## 7. Quy tắc maintain file (operational)

| Quy tắc | Chi tiết |
|---|---|
| **Append-only cho card** | Thêm card mới ở cuối §3; KHÔNG xoá card cũ kể cả INVALID (audit trail). |
| **Update Dashboard mỗi lần status flip** | §1 counter + by-feature + by-boundary + aging table luôn phải đồng bộ. Có thể chạy script gen từ Master Index. |
| **Master Index đồng bộ card** | Sửa Status/Assigned trong §3 card → sync xuống §2 Master Index row tương ứng. |
| **Anchor link** | Mỗi card có anchor `### BUG-W01-{NNN}` để Master Index click → nhảy tới. |
| **File size** | Ước lượng 50 bug × ~120 dòng/card = 6000 dòng + 200 dòng dashboard ≈ 6200 dòng/wave. Vẫn manageable. Wave >100 bug → split per-feature file (vd `BUGS-FEAT-INS-SO-ADJUSTMENT.md`). |
| **Repro script vẫn external** | `Tracking/WAVE{NN}/repro/BUG-W{NN}-{NNN}.sh` — KHÔNG nhồi script dài vào card. Card chỉ link path. |
| **Evidence file vẫn external** | Screenshot/log/trace nằm `Execution/test-reports/W{NN}/...` — card chỉ link path. |

---

## 8. So sánh trước/sau — agent-fix workflow

| Tình huống | Trước (3-layer L1/L2/L3 — v1) | Sau (single-file — v2) |
|---|---|---|
| agent-fix nhận bug P1 | Mở `BUGS.md` (L1 row) → mở `verify/BUG-W01-264.verify.md` (L2) → có thể mở `BUGFIX-...md` (L3 nếu có) | Mở **1 file** `WAVE01/BUGS.md` → scroll tới `### BUG-W01-264` → đủ A→I |
| Orchestrator triage | Scan L1 table (text dài, khó count) | §1 Dashboard sẵn count theo status × severity × FEAT × boundary |
| QC review wave | Đọc `BUGS.md` + 30 file verify + N file bugfix = 60+ file | Đọc 1 file `BUGS.md`, nhảy theo anchor §2 → §3 |
| Token cost cho agent-fix | ~30-50k token (mở 3-4 file) | ~10-15k token (mở 1 file, jump anchor) |
| Update status | Sửa L1 row + L2 verdict log + (L3 nếu có) | Sửa §3 card §I Verdict Log + sync §1 Dashboard + §2 Master Index |

---

## 9. Migration plan (W01 đang chạy → adopt v2)

| Step | Owner | Khi nào |
|---|---|---|
| 1. Review proposal v2 | Senior QC + Delivery Authority | sau khi nhận file |
| 2. Pilot: convert 3-5 bug W01 mới (BUG-W01-264+) sang single-file format | agent-test-api / manual-qc | trong stage TEST_EXECUTION |
| 3. Đo lường: token agent-fix · thời gian fix · % reopen | Orchestrator | sau 5 bug pilot |
| 4. Quyết định adopt full W01 (backfill 30+ bug) hay chỉ áp W02 trở đi | QA Authority | sau pilot |
| 5. Nếu adopt: viết script migrate L1+L2+L3 hiện hữu → single-file format | agent-test-api | post-decision |
| 6. Update `Tracking/BUGS.md` schema §3.1/§3.2 — bỏ 3-layer, thêm single-file rule | Senior QC | post-decision |

---

## 10. Open questions (xin Senior QC chốt)

~~1. **Tên status #4 — REJECTED**~~ ✅ **CHỐT 2026-06-16**: dùng `REJECTED`.
~~2. **Ai được phép chuyển sang REJECTED**~~ ✅ **CHỐT 2026-06-16**: **QC Human (chính) + agent-test-*** (khi đang test phát hiện not-a-bug). **agent-fix-* KHÔNG được REJECTED** (tránh bias). Tương tự cho PENDING.
3. **File size threshold split**: ngưỡng nào (50 / 100 / 200 bug) thì split sang per-feature file?
4. **Dashboard auto-gen**: viết script đọc Master Index → gen §1 counter table tự động, hay maintain manual?
5. **Repro script + Evidence**: giữ external (path link) như đề xuất, hay nhồi inline vào card cho 1-stop?
6. **Verdict Log dài**: nếu bug reopen nhiều lần (vd BUG-W01-013 có 3 iteration `VERIFIED → OPEN`) → Verdict Log §I trong card có grow lớn, tiếp tục inline hay split sang sub-file?
7. **Cluster bugs**: bug cùng root cause (vd BUG-W01-201..208) — mỗi bug 1 card riêng hay gom 1 card chung "BUG-W01-201-208-cluster"?
8. **W01 backfill**: bug W01 đang OPEN/RESOLVED có cần convert sang single-file format không, hay chỉ áp cho bug mới?
9. **3-layer cũ**: nếu adopt v2, có giữ `Tracking/WAVE{NN}/verify/*.md` + `Execution/bugfixes/*.md` cho audit lịch sử, hay deprecate hoàn toàn?
10. **Map legacy 9-status W02+ canonical → 7-state mới**: đề xuất mapping:
    - `OPEN` → `OPEN`
    - `ASSIGNED`, `IN_FIX`, `IN_PROGRESS` → `OPEN`
    - `FIX_DONE`, `RESOLVED (chưa re-test)`, `VERIFY_PENDING` → `RESOLVED`
    - `VERIFIED`, `VERIFIED-FIXED`, `RESOLVED (đã re-test live)` → `VERIFIED`
    - `CLOSED` legacy (QA Authority sign-off) → `DONE`
    - `REOPENED` legacy → `REOPEN`
    - `INVALID` legacy → `REJECTED`
    - `DEFERRED` legacy → `PENDING` (với Waiting for = blocker description trong STATE.json)
~~11. **REOPEN iteration counter**: cần track iteration number (vd `BUG-W01-013` đã reopen 3 lần — track ở đâu? Inline Verdict Log đếm dòng REOPEN, hay thêm field `iteration_count` trong §A Identity?~~ ✅ **CHỐT 2026-06-16**: cột `REOPEN #` trong §4 Master Index (slim table). KHÔNG dùng field riêng trong §A.
~~12. **PENDING SLA**: ngưỡng auto escalate Senior QC — 3 days (đề xuất), hay phụ thuộc severity (P1: 1 day, P2: 3 days, P3: 7 days)?~~ ✅ **CHỐT 2026-06-16**: **3 days đồng nhất mọi severity** (giữ rule đơn giản).
~~13. **REOPEN nhiều lần = upgrade severity?**: bug đã reopen ≥ 3 iteration → có auto upgrade severity (P2→P1) hay chỉ flag warning?~~ ✅ **CHỐT 2026-06-16**: **chỉ warning** (`⚠️ N` trong Master Index), KHÔNG auto upgrade — Senior QC review manual.

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-16 | 1 | cuongnguyen_ac (Senior QC) | Initial v1 — 4-cluster template + 5 conditional block + map vào L1/L2/L3 (3-layer model). |
| 2026-06-16 | 2 | cuongnguyen_ac (Senior QC) | **Rewrite v2 — single-file model** per wave. Bỏ 3-layer, gộp tất cả vào `Tracking/WAVE{NN}/BUGS.md`: §1 Dashboard counters (status × severity × FEAT × boundary × type × aging) + §2 Master Index slim + §3 Detailed Card 9 sub-section (A Identity / B Environment / C Steps detailed có link / D Expected vs Actual / E Evidence / F Conditional UI-API-DB-Event-Security / G Impact & Severity / H Root Cause Hint / I Verdict Log). Migration plan + 7 open questions. |
| 2026-06-16 | 3 | cuongnguyen_ac (Senior QC) | **Simplify status sang 4-state machine** — bỏ 9-status legacy (OPEN/ASSIGNED/IN_FIX/FIX_DONE/VERIFY_PENDING/VERIFIED/REOPENED/DEFERRED/INVALID/CLOSED) còn `OPEN / RESOLVED / VERIFIED / REJECTED`. §3.0 thêm state machine + transition rules; §3.1-3.4 cập nhật cột counter; §5 card §A Status enum 4 giá trị; §5 card §I Verdict Log mẫu 4-state với happy path + reject case + reopen case; §10 open questions thêm Q1-Q2 (tên status #4, ai được REJECTED) + Q10 (mapping legacy → 4-state). |
| 2026-06-16 | 4 | cuongnguyen_ac (Senior QC) | **Mở rộng 4-state → 6-state**: thêm `REOPEN` (fix FAIL — track iteration) + `PENDING` (cần check lại, mâu thuẫn spec hoặc ambiguous oracle, có "Waiting for" field). §3.0 cập nhật state machine + transition diagram (REOPEN ↔ RESOLVED iteration loop, PENDING → OPEN/REJECTED clarify branch) + 5 quy tắc bổ sung (REOPEN aging, PENDING SLA 3 days, REJECTED terminal). §3.1-3.4 cột counter mở rộng. §3.5 Aging snapshot có row REOPEN. §3.6 PENDING snapshot mới (track Waiting for). §4 Master Index thêm 2 row mẫu REOPEN + PENDING. §5 card §I Verdict Log mẫu 6-state với 5 nhánh: verify FAIL → REOPEN, re-fix sau REOPEN, OPEN → PENDING, PENDING → OPEN/REJECTED clarify. §10 mở rộng Q10 mapping legacy 9 → 6-state, thêm Q11 (REOPEN iteration counter), Q12 (PENDING SLA per-severity), Q13 (REOPEN ≥ 3 lần auto upgrade severity). |
| 2026-06-16 | 5 | cuongnguyen_ac (Senior QC) | **Chốt 3 decisions** (Q11/Q12/Q13): (1) REOPEN counter ở §4 Master Index — thêm cột `REOPEN #` (0 default, ≥3 = `⚠️ N` warning); (2) PENDING SLA = **3 days đồng nhất** mọi severity (giữ rule đơn giản, không phân bậc); (3) REOPEN ≥ 3 lần = **chỉ warning** (Master Index hiển thị `⚠️ N`), KHÔNG auto upgrade severity — Senior QC review manual. §3.0 update 3 quy tắc bổ sung. §4 Master Index thêm cột `REOPEN #` + row BUG-W01-013 ví dụ ⚠️ 3. §10 mark Q11/Q12/Q13 strikethrough + chốt 2026-06-16. |
| 2026-06-16 | 6 | cuongnguyen_ac (Senior QC) | **Chốt Q2 + thêm Automation rules §3.0.1**: (a) RESOLVED/VERIFIED/REOPEN/RESOLVED-từ-REOPEN = **🤖 Auto** do agent-fix/agent-test tự update khi fix done/verify done/verify FAIL — orchestrator không phải intervene. (b) REJECTED + PENDING = **👤 Manual** — chỉ QC Human (chính) hoặc agent-test-* (khi đang test phát hiện not-a-bug / mâu thuẫn) được phép. **agent-fix-* KHÔNG được REJECTED/PENDING** (tránh bias đẩy bug đi). §3.0 bảng status thêm cột "Auto / Manual" + "Trigger / Actor"; §3.0.1 thêm bảng 11 transition với mode + trigger + bắt buộc kèm Verdict Log. §5 card §I Verdict Log mở rộng cột Mode (🤖/👤) cho mọi nhánh mẫu. §10 chốt Q2 (manual REJECTED chỉ QC Human + agent-test). |
| 2026-06-16 | 7 | cuongnguyen_ac (Senior QC) | **Chốt Q1 + thêm status DONE (7-state)**: (a) Chốt status #4 = `REJECTED` (không đổi sang INVALID/NOT_A_BUG). (b) Thêm trạng thái **DONE** — terminal happy path do **QC Human update khi verify manual done**. Phân biệt: **VERIFIED** = agent-test automated PASS (chứng minh fix đúng code/contract); **DONE** = QC Human manual acceptance (smoke flow thực tế + cross-feature side-effect check). VERIFIED chưa terminal — QC Human có thể manual reopen nếu phát hiện automated TC miss. §3.0 thêm row DONE + section "Phân biệt VERIFIED vs DONE". §3.0 transition diagram thêm nhánh VERIFIED → DONE (terminal) và VERIFIED → REOPEN (manual phát hiện FAIL). §3.0.1 thêm 2 transition: `VERIFIED → DONE` (Manual, QC Human, evidence manual acceptance) + `VERIFIED → REOPEN` Manual variant (QC Human phát hiện automated miss). §3.1-3.4 thêm cột counter DONE; §3.1 thêm "Wave done rate = DONE/Total". §5 §I Verdict Log mẫu thêm dòng VERIFIED → DONE (Senior QC) + nhánh QC Human manual reopen. §10 chốt Q1 + cập nhật Q10 mapping (CLOSED legacy → DONE). |
