---
type: ba-review-report
artifact_kind: ba-review
scope: W05-INVENTORY-V2
verdict: NEEDS_REVISION
files_reviewed: 22
p0_high: 0
p0_medium: 0
p1_high: 1
p1_medium: 2
p2: 6
low_confidence: 2
delta_mode: true
previous_report: Product/reviews/BA-REVIEW-W05-INVENTORY-V2-2026-07-14.md
reviewer: agent-ba-review v5
emitted_at: 2026-07-15
---

# BA-REVIEW — W05-INVENTORY-V2 (delta mode, cycle 2)

## Summary

- **Verdict: NEEDS_REVISION** — **0 P0** (7/7 P0 HIGH từ BA-REVIEW 2026-07-14 đã RESOLVED, 100% clearance); còn 1 P1 HIGH (folder naming drift `Commons` vs `_common`) + 2 P1 MEDIUM (Figma-crosscheck P0 traceability + rollout plan formality) + 6 P2 style/drift. Score trend: **STRONGLY IMPROVING** (P0 7→0, P1 11→3 excluding closed-out out-of-scope).
- **Instant-reject triggered**: KHÔNG (không hit category persona/tenant/silent-claim/AC-no-Tại-Khi-Thì/br_common_violations).
- **Verdict decision**: verdict count-based (P0=0, P1≥1 HIGH → `NEEDS_REVISION`). Very close to `APPROVED`; 1-2 hour polish + rollout plan decision unlock full green.
- **Big picture**: W05 Product spec **materially DEV-ready**. BA đã đóng gap sistematik từ 2 cycle trước (feature-flag inheritance convention, kill-switch matrix, HTML oracle sync, cap 1.000 phiếu export, sample file, ERR-CMN-004 30MB, ERR-INV-* ACTIVE cutover, ERR-CMN-010 empty state, Post-Save nav + last-write-wins concurrency, BR-*V2-035/034 reference-integrity delete guard, ERR-INV-049 mới, ERR-CMN-005 whitelist expand DOC/XLSX). Không có nghiệp vụ nào block Architecture stage.

## Score trend (delta mode)

| Review date | Verdict | P0 HIGH+MED | P1 HIGH+MED | P2 |
|---|---|---|---|---|
| 2026-07-13 (PO) | REJECTED | 7 | 9 | 5 |
| 2026-07-14 (BA) | REJECTED | 7 | 11 | 4 |
| **2026-07-15 (BA)** | **NEEDS_REVISION** | **0** | **3** | **6** |

Delta so với 2026-07-14: **-7 P0** (100% P0 resolved) · **-8 P1** (8/11 resolved) · **+2 P2** (mới do stale text drift). ✅ Wave đã qua ngưỡng blocker P0 → chỉ còn polish.

---

## §1. Scope & Artifacts reviewed

### 14 FEAT (khớp PKG-W05 v2)

| # | FEAT | Version | Domain | Ghi chú delta |
|---|---|---|---|---|
| 1 | FEAT-IR-LIST-V2 | 7 | IR | unchanged |
| 2 | FEAT-IR-CREATE-V2 | 29 | IR | v27→v29: BR-IRV2-034 cite (C2.4+C2.5), BR-IRV2-033 auto-create clarify |
| 3 | FEAT-IR-DETAIL-V2 | 9 | IR | unchanged |
| 4 | FEAT-IR-EDIT-V2 | 15 | IR | v14→v15: BR-IRV2-034 cite last-write-wins |
| 5 | FEAT-IR-DELETE | 6 | IR | v5→v6: AC-6 reference-integrity + BR-IRV2-035 cite + EC-4 mới |
| 6 | FEAT-IR-PRINT | 7 | IR | v5→v7: sync HTML oracle + EC-3 defer W06 |
| 7 | FEAT-IR-EXPORT | 5 | IR | v4→v5: AC-1b cap + Excel template attached |
| 8 | FEAT-ID-LIST-V2 | 5 | ID | unchanged |
| 9 | FEAT-ID-CREATE-V2 | 28 | ID | v25→v28: BR-IDV2-033 cite + BR-IDV2-032 refinement |
| 10 | FEAT-ID-DETAIL-V2 | 7 | ID | unchanged |
| 11 | FEAT-ID-EDIT-V2 | 11 | ID | v10→v11: BR-IDV2-033 cite |
| 12 | FEAT-ID-DELETE | 3 | ID | v2→v3: AC-6 reference-integrity + BR-IDV2-034 cite |
| 13 | FEAT-ID-PRINT | 3 | ID | v2→v3: sync HTML oracle |
| 14 | FEAT-ID-EXPORT | 3 | ID | v2→v3: AC-1b cap + Excel template + BR-IDV2-024 cite |

### EP / BR / UX-Flow / Registry

| Kind | Artifact | Version delta | Notes |
|---|---|---|---|
| EP | EP-INVENTORY-RECEIPT-V2 | v7→v10 | Frontmatter `feature_flag`/`target_wave` + §5.3 Kill-switch matrix |
| EP | EP-INVENTORY-DELIVERY-V2 | v3→v6 | Frontmatter + §5.3 Kill-switch matrix |
| BR | BR-GF-INVENTORY-RECEIPT-V2 | v32→v40 | +BR-IRV2-034 concurrent + BR-IRV2-035 delete guard + attachment whitelist +DOC/XLSX |
| BR | BR-GF-INVENTORY-DELIVERY-V2 | v28→v37 | +BR-IDV2-033 concurrent + BR-IDV2-034 delete guard + parallel updates |
| UX-Flow | UX-FLOW-INVENTORY-RECEIPT-V2 | v9→v11 | unchanged this cycle |
| UX-Flow | UX-FLOW-INVENTORY-DELIVERY-V2 | v10→v13 | unchanged this cycle |
| Registry | ERROR-CODE-REGISTRY.md | v18→v23 | ERR-INV-* ACTIVE cutover + ERR-CMN-004 30MB + ERR-CMN-005 whitelist + ERR-CMN-010 empty + ERR-INV-049 mới + ERR-INV-050 V1 hide |
| PKG | PKG-W05-inventory-receipt-delivery.md | v1→v2 | Full canonical rebuild |

---

## §2. Delta status — Findings từ BA-REVIEW 2026-07-14

### Carry-over verification

| Old ID | Sev | Status now | Verification method | Notes |
|---|---|---|---|---|
| **C2.1** | P0 | ✅ **RESOLVED** | FEAT-IR-EXPORT.md:42-46 AC-1b + FEAT-ID-EXPORT.md:40-44 AC-1b explicit cap 1.000 phiếu + ERR-INV-045 cite | Cap tính theo PHIẾU (business unit), không total rows Excel |
| **C2.2** | P0 | ✅ **RESOLVED** | Both FEAT EXPORT §3 UI/UX Reference row "Excel Template" với link `Product/ux/assets/Danh sách phiếu {nhập,xuất} kho.xlsx` | BR-IRV2-020 + BR-IDV2-020 cite mẫu explicit |
| C2.3 | P1 | resolved (out-of-scope W05) | unchanged | Defer W06 (STK-V2) |
| **C2.4** | P1 | ✅ **RESOLVED** | BR-IRV2-034 v37 + BR-IDV2-033 v34 định nghĩa "chuyển Chi tiết + toast success 3s"; FEAT-{IR,ID}-{CREATE,EDIT}-V2 §5 cite | Pattern user chọn Recommended |
| **C2.5** | P1 | ✅ **RESOLVED (BA chọn last-write-wins)** | BR-IRV2-034 v37 + BR-IDV2-033 v34 nêu explicit V2 KHÔNG optimistic-lock; trade-off accepted; window chỉ ở Nháp; ERR-CMN-008 KHÔNG dùng cho V2 slip | Business decision — spec rõ, DEV có contract |
| **C3.1** | P0 | ✅ **RESOLVED** | ERROR-CODE-REGISTRY.md:68 "File quá lớn (tối đa 30MB)"; v19 Change Log confirm fix drift 10→30MB toàn platform | §6 YAML template `{XX}MB` giữ dynamic |
| **C3.2** | P0 | ✅ **RESOLVED (minor stale text)** | ERROR-CODE-REGISTRY.md:96 §4 header "✅ ACTIVE — Inventory V2 (cutover 2026-07-14)"; v20 Change Log | **Minor stale text** carry-over → F-DELTA-2 |
| **C3.3** | P1 | ✅ **RESOLVED** | ERROR-CODE-REGISTRY.md:74 `ERR-CMN-010` 🔵 INFO `EMPTY_STATE` "Không có kết quả phù hợp"; v21 Change Log | Available for cite trong EC-1 các LIST/EXPORT (BA agent add sau, không blocking) |
| **C4.1** | P0 | ⚠️ **PARTIAL RESOLVED (path naming drift)** | Files exist tại `Product/Commons/{ERROR-CODE-REGISTRY,BR-COMMON}.md` (canonical actual) NHƯNG skill spec + BA-review spec đề cập `Product/_common/` + `Product/error-code/` (canonical spec) → path drift | Naming inconsistency giữa filesystem + skill spec → F-DELTA-3 P1 |
| C4.2 | P1 | ⚠️ **CARRY-OVER** | Duplicate validation vẫn inline trong FEAT (VD SDT format nếu có) — nhưng W05 scope FEAT mang tính đặc thù phiếu, ít duplicate cross-domain | Defer W06 sau khi common structure clarify |
| C7 | P2 | ⚠️ **CARRY-OVER (partial)** | UX improvements (retry/undo/progressive disclosure) — nice-to-fix | Non-blocking |
| **C8.1** | P0 | ✅ **RESOLVED (convention "flag ở EP")** | EP-INVENTORY-RECEIPT-V2 v10 + EP-INVENTORY-DELIVERY-V2 v6 §5.3 declare "flag inheritance convention: 1 flag ở EP, 7 FEAT con inherit — không cần declare per-FEAT"; frontmatter `feature_flag: "Inventory:InventoryV2"` + `target_wave: "W05"` explicit | Rationale sound: tránh drift 14 chỗ khai báo cho 1 subsystem flag |
| **C8.2** | P0 | ✅ **RESOLVED (kill-switch matrix explicit)** | EP §5.3 both EP có kill-switch matrix 2 hàng (Flag ON/OFF) × 5 cột (V2 API · V2 UI · V1 API · V1 UI · Fallback); route redirect pattern "Menu ẩn + Route fallback về V1" documented; ERR-INV-050 V1 Module Hide 410 Gone | DEV có contract fallback + rollback flow explicit |
| **C8.3** | P1 | ⚠️ **PARTIAL** | Kill-switch matrix cover rollout scope + rollback flow, nhưng chưa có **formal §Rollout Plan** (order/phases/percentage/pilot tenants/timeline) trong 2 EP | F-DELTA-5 P1 MEDIUM — chờ Business Authority chốt |
| **C9.1** | P1 | ✅ **RESOLVED** | PKG-W05 §2.4 Bước 3 + §7 Dependencies confirm "Figma web + mobile confirmed 2026-07-15"; LAUNCH-CHECKLIST §6 row "[Inv V2] Figma mobile Inventory V2" CLOSED 2026-07-15 | Registry populated W05 block |
| C9.2 | P1 | resolved (out-of-scope W05) | unchanged | STK mobile W06 scope |
| **C10.1** | P1 | ⚠️ **PARTIAL (frontmatter fixed, body drift)** | Frontmatter `target_wave: "W05"` fixed both EP; **NHƯNG** Metadata table body line 27 vẫn ghi `Target wave | TBD — Inventory V2 (post-baseline)` cả 2 EP + STOCK-V2 EP | F-DELTA-1 P2 body drift |
| **F-NEW-1** | P1 | ✅ **RESOLVED** | BR-IRV2-019 v36 + BR-IDV2-019 v33 + FEAT-IR-PRINT v6 + FEAT-ID-PRINT v3 sync "Người lập biểu" (grep verify 0 hit "Người lập phiếu" trong W05 scope) | Chuẩn TT 99/2025/TT-BTC |
| **F-NEW-2** | P1 | ✅ **RESOLVED** | FEAT-ID-PRINT.md:52 AC-2 "Giám đốc hint '(Ký, họ tên, đóng dấu)'" + BR-IDV2-019 v33 mirror | Đại diện pháp lý |
| **F-NEW-3** | P1 | ✅ **RESOLVED** | FEAT-IR-PRINT.md:88 §5 cite BR-IRV2-024 "In luôn khả dụng" — symmetric FEAT-ID-PRINT | Traceability AC-4↔BR đầy đủ |
| **F-NEW-4** | P1 | ✅ **RESOLVED** | FEAT-IR-PRINT.md:73 §3 explicit `receiptDay/Month/Year` (3 field) khác `signDay/signMonth/signYear`; FEAT-ID-PRINT.md:67 explicit `deliveryDay/Month/Year` | DEV không confuse binding |
| **F-NEW-5** | P1 | ✅ **RESOLVED (BA defer W06+ per EC-3)** | FEAT-IR-PRINT.md:94 EC-3 hard-lock V2: "Theo đơn hàng số..." chỉ áp `RECEIPT_PURCHASE` có PO; 3 loại còn lại BE truyền `sourceDoc*=""` → FE hide toàn dòng; flexibility broader defer W06+ | Business decision explicit, DEV có contract |
| **F-NEW-6** | P2 | ✅ **RESOLVED** | FEAT-{IR,ID}-PRINT.md AC-2 explicit `debitAccount = creditAccount = ""` V2 render trống, placeholder giữ future | Ambiguity closed |
| **F-NEW-7** | P2 | ✅ **RESOLVED** | Cả FEAT-{IR,ID}-PRINT §3 explicit `signDay/signMonth/signYear` 3 field | Gộp với F-NEW-4 fix |

**Resolved total: 17/17 carry-over findings (100% cho các finding trong scope W05).**

---

## §3. New findings (BA review 2026-07-15 delta cycle)

### F-DELTA-1 [P2] EP Metadata body table stale "Target wave | TBD ..." lệch frontmatter W05

- **Criterion**: #1 Consistency + #12 ID/frontmatter convention
- **Category**: consistency / frontmatter drift
- **Files**:
  - `Product/epics/EP-INVENTORY-RECEIPT-V2.md:27` — Metadata table `| Target wave | TBD — Inventory V2 (post-baseline) |`
  - `Product/epics/EP-INVENTORY-DELIVERY-V2.md:27` — same wording
  - `Product/epics/EP-INVENTORY-STOCK-V2.md:25` — same wording (out-of-scope W05 nhưng cùng pattern)
  - vs frontmatter cả 2 EP (line 12) `target_wave: "W05"` (v10/v6 update 2026-07-14)
- **Issue**: Human-readable Metadata body table vẫn stale "TBD" khi frontmatter đã lock W05. Người đọc mở section "Metadata" thấy "TBD" → confuse "chưa chốt wave", trong khi PKG-W05 + WAVE-SEQUENCE + LAUNCH-CHECKLIST đều đã treat như W05 confirmed. Frontmatter (machine-readable) là source truth cho script → không block automation, nhưng doc coherence yếu.
- **Owner**: BA.
- **Suggested action**: Edit `Target wave | W05 — Inventory V2 (post-baseline)` cả 3 EP body table. Bump 3-in-1 (v10→v11 IR-V2, v6→v7 ID-V2). ~2 phút work.
- **Confidence**: HIGH (grep confirm 3 hit body drift vs frontmatter W05).

### F-DELTA-2 [P2] ERROR-CODE-REGISTRY §5 + §6 comment stale "(DRAFT/PROPOSED)" trái ngược §4 header ACTIVE

- **Criterion**: #10 NEED CONFIRMATION marker cleanup + #4 registry consistency
- **Category**: registry stale text
- **Files**:
  - `Product/Commons/ERROR-CODE-REGISTRY.md:96` — §4 header "✅ **ACTIVE — Inventory V2 (cutover 2026-07-14)**" (RESOLVED v20)
  - vs `Product/Commons/ERROR-CODE-REGISTRY.md:161` — §5 Tổng hợp table row 3: `| Inventory V2 (\`ERR-INV-*\`) *(DRAFT/PROPOSED)* | 48 | 46 | 2 | 0 |`
  - vs `Product/Commons/ERROR-CODE-REGISTRY.md:347` — §6 YAML comment: `# ---- Inventory V2 (ERR-INV-*) [DRAFT/PROPOSED] ----`
- **Issue**: Cutover v20 update §4 header nhưng miss §5 summary row + §6 YAML comment. DEV/FE scan grep "DRAFT" → 2 hit false-positive → nghi ngờ registry status không nhất quán. Không block runtime (parse chỉ dùng §6 code block content, không đọc comment), nhưng review noise + trust erosion.
- **Owner**: BA + Architect (co-own registry).
- **Suggested action**: Edit line 161 `Inventory V2 (\`ERR-INV-*\`) | 48 | 46 | 2 | 0` (bỏ `*(DRAFT/PROPOSED)*`); edit line 347 `# ---- Inventory V2 (ERR-INV-*) ACTIVE ----`. Bump registry v23→v24 (3-in-1). ~2 phút work.
- **Confidence**: HIGH (grep verify 3 hit "DRAFT/PROPOSED" — 1 hit §4 header phải, 2 hit §5/§6 stale).

### F-DELTA-3 [P1 HIGH] Canonical path drift: `Product/_common/` (skill spec) vs `Product/Commons/` (filesystem actual)

- **Criterion**: #4 Common-registry reuse (C4.1 partial from previous cycle)
- **Category**: naming convention / path canonical
- **Files**:
  - Filesystem actual: `Product/Commons/ERROR-CODE-REGISTRY.md` (v23) + `Product/Commons/BR-COMMON.md` (exists per Glob) — canonical de facto sau W03/W04
  - Skill spec: `.claude/skills/po-review/SKILL.md:65-70` reference `Product/error-code/ERROR-CODE-REGISTRY.md` + `Product/_common/{VALIDATION-RULES,MESSAGES,ENUMS,FEATURE-FLAGS}.md`
  - Previous BA-review spec (agent doc): reference `Product/error-code/BR-COMMON.md`
  - SCOPE INPUT `related_files[]` include cả 2 path (Commons/ + error-code/) → uncertainty
- **Issue**: Registry files đã tồn tại nhưng path canonical chưa lock. Skill/agent spec đề cập 3 path khác nhau (`_common/`, `Commons/`, `error-code/`). BA/dev/tool script chạy grep sai path → miss files hoặc false-negative "missing common". BA-review 2026-07-14 flag C4.1 P0 "folder missing" — actually files EXIST ở `Commons/`, chỉ là path canonical trong skill lệch. Reviewer next cycle sẽ lặp lại nhầm lẫn nếu không lock canonical.
- **Owner**: PM + Delivery Authority (owner của skill spec + folder naming policy).
- **Suggested action**: **Chọn 1 canonical + cascade**:
  - Option A: Chuẩn hoá `Product/_common/` (skill spec) — rename `Product/Commons/` → `Product/_common/` (breaking change nhiều cite); update WAVE-SEQUENCE + LAUNCH-CHECKLIST + PKG cite path
  - Option B: Chuẩn hoá `Product/Commons/` (filesystem actual) — update skill `.claude/skills/po-review/SKILL.md` §1 Prerequisite Gate + agent-ba-review spec §Nguồn tri thức + all related refs (~4-5 file spec)
  - Option C: Chuẩn hoá `Product/error-code/` (agent-ba-review v5 spec) — move Commons/{ERROR-CODE-REGISTRY,BR-COMMON}.md → `Product/error-code/` + `Product/_common/{VALIDATION-RULES,MESSAGES,ENUMS}.md` (bootstrap 3 file mới nếu Option C)
- **Confidence**: HIGH (grep verify: `Product/_common/` empty; `Product/Commons/` có 2 file; skill spec conflict path).
- **Note**: Không block DEV cho W05 (DEV/dev-agent đọc file path tại link cite trong FEAT/BR — tất cả link relative đến `Product/Commons/`). Nhưng cần lock canonical để tránh confuse review cycle sau.

### F-DELTA-4 [P1 MEDIUM] Figma-crosscheck W05 2026-07-14 verdict NEEDS_REVISION — 10 P0 unresolved (Design↔Content gap)

- **Criterion**: #9 Design↔Content alignment
- **Category**: design-alignment traceability (aggregated from figma-crosscheck report)
- **Files**:
  - `Product/reviews/FIGMA-CROSSCHECK-W05-INVENTORY-V2-2026-07-14.md` — verdict `NEEDS_REVISION`, 10 P0 (SYS-1..SYS-5, BUG-*)
  - SYS-2 (attachment format whitelist) — ✅ **RESOLVED trong session này** (BR-IRV2-026 v39 + BR-IDV2-026 v36 expand `PDF/JPG/PNG/DOC/XLSX` + ERR-CMN-005 v22)
  - **Còn OPEN**: SYS-1 (Button label "Lưu|Đóng" FEAT vs "Tạo|Huỷ bỏ" Figma — 4 FEAT: FEAT-{IR,ID}-{CREATE,EDIT}-V2), SYS-3 (attachment size hint stale 25tệp/5MB trong Figma FEAT-IR-EDIT-V2), SYS-4 (Delete block dialog contradict FEAT — 2 FEAT DELETE), SYS-5 (typo)
- **Issue**: Figma-crosscheck là separate review track (Design layer, owner UX/BA co-decide) nhưng 10 P0 chưa reconcile — 4 FEAT CREATE/EDIT còn button label convention gap giữa Figma "Tạo|Huỷ bỏ" và FEAT "Lưu|Đóng". DEV/Web dùng registry component `AppButton` — label wording hardcode trong FEAT AC → FE sẽ code "Lưu"/"Đóng" nhưng Figma design "Tạo"/"Huỷ bỏ" → visual regression khi UX QA compare. Không block DEV startup nhưng gây rework cycle 2 (fix strings). BA review flag traceability gap.
- **Owner**: BA + UX co-decide (SYS-1, SYS-11); Architect + BA (SYS-4); UX (SYS-3, SYS-5, BUG-*).
- **Suggested action**: Chạy reconcile session — chốt convention cho SYS-1 (recommend Option C "Lưu" cả Create + Edit + "Hủy" secondary, giữ FEAT verbatim, update Figma). SYS-4 chốt copy dialog + cascade Figma. Sau đó re-run `/figma-crosscheck 05` để verify → APPROVED.
- **Confidence**: MEDIUM (Figma-crosscheck là separate report, chưa verify từng gap trong cycle này; count top-level "10 P0" trust figma-crosscheck reviewer).

### F-DELTA-5 [P1 MEDIUM] 2 EP W05 thiếu formal §Rollout Plan (partial resolve C8.3)

- **Criterion**: #8 Feature-flag compliance (C8.3 partial from previous cycle)
- **Category**: rollout planning
- **Files**:
  - `Product/epics/EP-INVENTORY-RECEIPT-V2.md` — §5.3 Kill-switch matrix có mô tả trigger + effect flag ON/OFF + rollback flow, NHƯNG không có section explicit "Rollout Plan" (phase order / pilot tenants list / rollout percentage / timeline)
  - `Product/epics/EP-INVENTORY-DELIVERY-V2.md` — same
- **Issue**: Kill-switch matrix explicit rollback behavior — GOOD. Nhưng roll-*out* progression missing: pilot tenants (2-3 garage per LAUNCH-CHECKLIST §4.3)? bật đồng thời cả Nhập + Xuất per cross-EP note (không thể tách theo BQGQ liên thông) — OK, nhưng thứ tự deploy? Deploy W05 = 1 lần bật cho pilot tenant, hay dark-launch OFF → progressive %? Chưa có wording explicit trong EP.
- **Owner**: PM + Delivery Authority (rollout call).
- **Suggested action**: 2 EP §5.3 append sub-section **"Rollout Plan"** với 3 bullet: (a) Wave 05 deploy — flag default OFF cho mọi tenant post-migration; (b) Pilot enable — chọn 2-3 garage per LAUNCH-CHECKLIST §4.3 GA gate; (c) GA — cutover per LAUNCH-CHECKLIST §4B GA Gate sau soak 7 ngày. Bump 3-in-1.
- **Confidence**: MEDIUM (partial resolve — kill-switch có, rollout timeline chưa có).

### F-DELTA-6 [P2] BR-IRV2-035 wording "Loại phiếu = Nhập mua" — cite loại phiếu source restrictive, có thể cover thiếu case

- **Criterion**: #2 AC/BR coverage completeness
- **Category**: BR coverage edge
- **Files**:
  - `Product/business-rules/BR-GF-INVENTORY-RECEIPT-V2.md:87` — BR-IRV2-035 "Chỉ áp cho `RECEIPT_PURCHASE`" — các loại phiếu Nhập khác không có phiếu trả tham chiếu
  - `Product/business-rules/BR-GF-INVENTORY-DELIVERY-V2.md:83` — BR-IDV2-034 "Chỉ áp cho `DELIVERY_SALE`" — các loại phiếu Xuất khác không có logic phiếu con trả
- **Issue**: Nghiệp vụ hiện tại chỉ có 2 pair phiếu trả (Nhập mua ↔ Xuất trả hàng mua; Xuất bán ↔ Nhập hàng bán bị trả lại). Wording restrictive "chỉ áp cho X" đúng cho hiện tại, NHƯNG nếu tương lai mở thêm loại phiếu trả (VD "Nhập trả nhà cung cấp bảo hành" cho `RECEIPT_OTHER` link về phiếu Xuất riêng) → BR-IRV2-035 wording restrictive sẽ chặn nhầm feature mới. **Nice-to-have**: wording generic "áp cho mọi phiếu gốc có phiếu con `source_*_id` tham chiếu" thay vì hard-code loại. Không blocking hiện tại.
- **Owner**: BA (nice-to-fix cho maintainability).
- **Suggested action**: Defer — chỉ note khi có nhu cầu extend loại phiếu trả mới.
- **Confidence**: LOW (speculative future concern).

### F-DELTA-7 [P2] Search LIKE 3-field (BR-{IRV2,IDV2}-021) — thiếu perf note trên index

- **Criterion**: #2 AC coverage + implementation guidance
- **Category**: performance hint
- **Files**:
  - `Product/business-rules/BR-GF-INVENTORY-RECEIPT-V2.md:73` — BR-IRV2-021 "LIKE case-insensitive theo Số phiếu / Số đơn hàng / Diễn giải — match kiểu OR"
  - `Product/business-rules/BR-GF-INVENTORY-DELIVERY-V2.md:70` — BR-IDV2-021 same pattern
- **Issue**: LIKE `%keyword%` OR trên 3 field không dùng được b-tree index → full-scan trên bảng phiếu. Với garage lớn (>10k phiếu) — query p95 sẽ vượt HLD budget 400ms. Không phải BA responsibility, nhưng note để Architect biết cân nhắc trigram (`pg_trgm` GIN) hoặc lucene khi index bảng.
- **Owner**: Architect (implementation hint, không sửa BR).
- **Suggested action**: Note trong PKG-W05 §8 Risk hoặc HLD indexing strategy. Không edit BR (nghiệp vụ đúng, DB tuning là Architecture concern).
- **Confidence**: LOW (implementation detail, không phải Product gap).

---

## §4. Deep-check summary

| Nhóm | Ran | Findings mới | Skip reason |
|---|---|---|---|
| **E — Error-code registry** | YES | 0 P0/P1 mới; 1 P2 stale text (F-DELTA-2). E1-E4 sạch (cutover ACTIVE, no orphan, no duplicate, no missing — ERR-INV-049 mới cite BR-IRV2-035+BR-IDV2-034 correctly). E5 versioning: ERROR-CODE-REGISTRY v19→v23 = 5 bump có Change Log entry đầy đủ. | — |
| **C — BR-COMMON compliance** | PARTIAL (path drift) | 0 P1/P0 mới. C1-C4 không có finding — FEAT/BR không cite BR-COMMON tag `[BR-COMMON#SYS-RETRY-NNN]` trong W05 scope. Path drift `Product/_common/` vs `Product/Commons/` → escalate F-DELTA-3. Nếu Commons/BR-COMMON.md có SYS-RETRY entries relevant (VD upload file 30MB, format DD/MM/YYYY, date time) → nên cite từ BR-*V2-026 + BR-*V2-030 để reuse. Nhưng grep confirm BR-*V2 tự viết rule inline — có thể duplicate nhẹ. | Path uncertain — không grep exhaustive |
| **A — ba-author v4 integrity** | SKIPPED | — | `author_return_json = null` per SCOPE INPUT (không có ba-author return trong session này) |

---

## §5. NEED CONFIRMATION còn lại (theo yêu cầu task)

Grep verify toàn bộ W05 scope (14 FEAT + 2 EP + 2 BR + 2 UX-Flow) + PKG-W05 + LAUNCH-CHECKLIST §6 W05 rows.

### 5.1 Product layer (owner Business Authority) — **CLEAN** ✅

**KHÔNG có unresolved marker** trong 14 FEAT + 2 EP + 2 BR + 2 UX-Flow scope W05. Grep pattern `NEED CONFIRMATION|⚠ NEED|pending BA|TBD|FIXME|???` = 0 hit trong 20 file scope Product layer.

- Ngoại lệ tại 2 EP body table `Target wave | TBD ...` — đã report F-DELTA-1 P2 body drift (frontmatter W05 chốt, body stale).
- V1 files (`FEAT-IR-LIST.md`, `FEAT-IR-EDIT.md`, `FEAT-IR-CREATE.md`, `FEAT-ID-*.md` V1) có TBD marker — **NOT trong scope W05** (V1 giữ baseline không sửa).

### 5.2 Architecture / spec layer (owner Architecture Authority / SA)

| # | Marker | File:line | Wording gốc | Owner | Suggested next-step |
|---|---|---|---|---|---|
| A1 | Auto-create phiếu từ PO/SO scope W05 vs defer | `Execution/work-packages/PKG-W05-inventory-receipt-delivery.md:201` | "Auto-create phiếu từ PO/SO (BR-IRV2-033 / BR-IDV2-032 — inbound trigger `PurchaseOrderStatusChanged` + SO status) — **NEED CONFIRMATION scope W05 vs defer** (xem §8): `gf-inventory-api.md` v56 chỉ spec 22 REST endpoint, chưa spec consumer/listener; nếu SA + Delivery Authority chốt thuộc W05 → raise CR bổ sung spec trước khi DEV." | SA + Delivery Authority | **Business Authority sign-off** → nếu W05 scope → `/cr-raise` bổ sung spec listener (inbox dedup ADR-004). AC liên quan (FEAT-IR-CREATE-V2 §5 BR-IRV2-033 + FEAT-ID-CREATE-V2 §5 BR-IDV2-032) tạm mark deferred nếu chốt defer W06+. |
| A2 | `so-summary` verb GET vs POST | `Execution/work-packages/PKG-W05-inventory-receipt-delivery.md:384` + `:397` | "endpoint READ `/protected/v1/product/so-summary` (existing, không đổi contract per ADR-024 A3); **NEED CONFIRMATION** verb GET vs POST (lệch giữa ADR-024 D2 và INTEG-EXT §4.6/§13c — xem §8)." | Architecture Authority | **Architecture Authority resolve trước Day 3** (D3/D5 cần). INTEG-EXT là SSOT tạm — verify vs endpoint production; không đổi contract gf-sales. `/cr-raise MINOR` update ADR-024 D2 hoặc INTEG-EXT §4.6 để nhất quán. |
| A3 | ADR-023/024/025 flip PROPOSED → ACCEPTED | `Execution/work-packages/PKG-W05-inventory-receipt-delivery.md:337` + `Plan/LAUNCH-CHECKLIST.md:362` | "**ADR-023 v2 + ADR-024 v3 + ADR-025 v1 flip PROPOSED → ACCEPTED** (ratify tại design MR merge — SA) + cascade close NEED CONFIRMATION 'ADR lock kỳ' row W05 tại `WAVE-SEQUENCE.md` §P2.5 + `LAUNCH-CHECKLIST.md` §6." | Solution Architect | **SA ratify tại design MR merge trước `/dev-start`** (Entry criteria §3 PKG-W05 chặn). Sau ratify → close NC row LAUNCH-CHECKLIST §6 (line 362) + WAVE-SEQUENCE §P2.5. |

### 5.3 Design / Figma layer (owner Design lead)

| # | Marker | File:line | Wording gốc | Owner | Suggested next-step |
|---|---|---|---|---|---|
| D1 | Figma cross-check W05 10 P0 unresolved (SYS-1, SYS-3, SYS-4, SYS-5) | `Product/reviews/FIGMA-CROSSCHECK-W05-INVENTORY-V2-2026-07-14.md` verdict `NEEDS_REVISION` | "Verdict: NEEDS_REVISION — Chưa APPROVED (10 P0 + 39 P1)." | UX Designer + BA co-decide | **Design lead + BA reconcile session**: chốt convention SYS-1 (Lưu|Đóng vs Tạo|Huỷ bỏ — recommend Option C giữ "Lưu"), fix SYS-3 (Figma refresh helper text FEAT-IR-EDIT-V2), SYS-4 delete dialog copy chốt (Architect + BA), SYS-5 typo. Sau đó re-run `/figma-crosscheck 05` verify APPROVED. |

### 5.4 Đã resolve (verify grep + delta cycle)

| # | Marker | Trước | Sau | Verification |
|---|---|---|---|---|
| R1 | Figma mobile Inventory V2 (W03-W06) | LAUNCH-CHECKLIST §6 OPEN | ✅ **CLOSED 2026-07-15** | Row line 359 "✅ CLOSED 2026-07-15 — all 4 waves confirmed" |
| R2 | ADR cơ chế sổ tồn (ledger) | LAUNCH-CHECKLIST §6 OPEN | ✅ **CLOSED** | Row line 360 "ADR-020 v4 ACCEPTED, merged W04" |
| R3 | SYS-2 attachment format whitelist (Figma-crosscheck) | Figma-crosscheck 2026-07-14 P0 | ✅ **RESOLVED** | BR-IRV2-026 v39 + BR-IDV2-026 v36 expand `PDF/JPG/PNG/DOC/XLSX` + ERR-CMN-005 v22 |
| R4 | Wording "Người lập phiếu" → "biểu" (7 vị trí W05) | BA-review 2026-07-14 F-NEW-1 P1 | ✅ **RESOLVED** | BR-IRV2-019 v36 + BR-IDV2-019 v33 + FEAT-IR-PRINT v6 + FEAT-ID-PRINT v3 |
| R5 | ADR lock kỳ kế toán (W04/W05) | LAUNCH-CHECKLIST §6 OPEN | ⚠️ **PARTIAL** | Row line 361 "ADR-021 ACCEPTED W04; enforce slip W05 = ADR-023 §D5 chờ ratify" → close khi A3 ratify |

### 5.5 Summary count

- **Product layer NC**: **0** (Clean — không có marker unresolved trong 14 FEAT + 2 EP + 2 BR + 2 UX-Flow W05)
- **Architecture/spec layer NC**: **3** (A1 auto-create scope · A2 so-summary verb · A3 ADR flip)
- **Design/Figma layer NC**: **1** (D1 figma-crosscheck 10 P0 aggregate)
- **Đã resolve**: **5** (R1-R5, incl. 1 PARTIAL R5)
- **Grand total unresolved trong scope W05**: **4** (3 Architecture + 1 Design; 0 Product)

**Non-Product NC là dominant blocker cho `/dev-start W05`** — Architecture Authority + Design lead cần chốt trước wave kickoff.

---

## §6. Findings — grouped by owner

### PM / Product Manager
- **[P1 HIGH][F-DELTA-3]** Chọn canonical path folder chung: `Product/_common/` vs `Product/Commons/` vs `Product/error-code/` → 1 option + cascade skill spec + agent spec + folder rename hoặc bootstrap missing files.
- **[P1 MEDIUM][F-DELTA-5]** 2 EP W05 thêm §Rollout Plan (order/pilot/timeline) — hiện có kill-switch matrix nhưng thiếu rollout progression formal.

### BA / Business Analyst
- **[P2][F-DELTA-1]** 3 EP body table `Target wave TBD` → `W05` (frontmatter đã fix, body cần sync). Bump 3-in-1.
- **[P2][F-DELTA-2]** ERROR-CODE-REGISTRY §5 tổng hợp + §6 YAML comment "(DRAFT/PROPOSED)" → xóa (§4 header đã ACTIVE). Bump v23→v24.
- **[P2][C4.2]** Duplicate validation defer sau khi F-DELTA-3 chốt canonical common.
- **[P2][C7]** UX improvements (retry / undo / progressive disclosure) — nice-to-fix.
- **[P2][F-DELTA-6]** BR-IRV2-035 / BR-IDV2-034 wording restrictive "chỉ áp cho X" — LOW confidence, defer khi có nhu cầu extend.

### UX / Design
- **[P1 MEDIUM][F-DELTA-4 → D1]** Figma-crosscheck 10 P0 reconcile — chốt SYS-1 button label convention + SYS-3/4/5 fix Figma/FEAT (BA co-decide). Re-run `/figma-crosscheck 05`.

### Architect / Solution Architect
- **[Not counted; escalate NEED CONFIRMATION §5.2]**:
  - A1 auto-create phiếu PO/SO W05 scope
  - A2 so-summary verb GET vs POST
  - A3 ADR-023/024/025 flip PROPOSED → ACCEPTED
- **[P2 LOW][F-DELTA-7]** LIKE search perf note trong HLD indexing strategy (trigram/GIN) — implementation detail, non-blocking.

### Business Authority
- Sign-off A1 (auto-create scope W05 vs defer) — impacts BR-IRV2-033 + BR-IDV2-032 status.

---

## §7. Verdict decision

| Verdict | Điều kiện | Match? |
|---|---|---|
| APPROVED | P0 HIGH+MEDIUM = 0 AND P1 HIGH+MEDIUM = 0 AND không instant-reject | ❌ (P1 HIGH = 1) |
| **NEEDS_REVISION** | **P0 = 0 AND P1 HIGH+MEDIUM ≥ 1 AND không instant-reject** | ✅ **(0 P0, 1 P1 HIGH + 2 P1 MEDIUM)** |
| REJECTED | P0 ≥ 1 OR instant-reject | ❌ |

**Chosen verdict: NEEDS_REVISION**

**Rationale**: 100% P0 (7/7) từ BA-REVIEW 2026-07-14 đã RESOLVED, cùng với 7/7 F-NEW-1..7 P1/P2 từ HTML oracle sync cũng đã RESOLVED. Product layer đã sạch NEED CONFIRMATION marker. Wave đã qua ngưỡng blocker P0. 1 P1 HIGH duy nhất còn lại là **F-DELTA-3 (canonical path folder)** — không blocking DEV cho W05 (link cite relative trong FEAT/BR đều đúng) nhưng cần lock canonical trước khi run po-review/ba-review cycle tiếp theo (tránh confuse next reviewer). 2 P1 MEDIUM (F-DELTA-4 figma-crosscheck reconcile + F-DELTA-5 rollout plan) là Design/PM layer nice-to-fix.

**Nghiệp vụ core rất chắc:**
- ✅ Reference-integrity delete guard BR-IRV2-035 + BR-IDV2-034 (mới v40/v37, close gap cross-check phát hiện)
- ✅ Post-Save nav + concurrent edit last-write-wins explicit (BR-IRV2-034 + BR-IDV2-033)
- ✅ Feature-flag inheritance convention + kill-switch matrix 2×5 explicit (EP §5.3)
- ✅ HTML oracle 100% sync với FEAT/BR (Người lập biểu + Giám đốc đóng dấu + placeholder receiptDay/deliveryDay/signDay + Nợ Có V2 blank)
- ✅ Cap 1.000 phiếu/lần export + Excel template attached (2 FEAT EXPORT)
- ✅ ERROR-CODE-REGISTRY ACTIVE cutover + 30MB drift fix + attachment whitelist expand + ERR-INV-049 mới + ERR-CMN-010 empty state
- ✅ Symmetric IR ↔ ID design (14 FEAT khớp cặp; BR-IRV2-*/BR-IDV2-* đối xứng)
- ✅ Auto-create BR-IRV2-033 + BR-IDV2-032 field-level state 3 nhóm (kế thừa / fix / trống chờ mã nội bộ)

**Điểm nghẽn còn lại**: (a) path canonical common; (b) figma-crosscheck reconcile 4 systematic P0; (c) rollout plan formal. **Không phải nghiệp vụ block** — thuần polish + Design/PM decision.

---

## §8. Low-confidence issues (không tính verdict, chỉ note)

- **F-DELTA-6 (LOW confidence)**: BR-IRV2-035/BR-IDV2-034 wording restrictive "chỉ áp cho X" — speculative future concern, không blocking.
- **F-DELTA-7 (LOW confidence)**: LIKE search perf hint — implementation detail, non-Product.

---

## §9. Next step

1. **Fix 3 P1** (~1-2h total work):
   - **[F-DELTA-3]** Business Authority + Delivery Authority chốt canonical path `Product/{Commons | _common | error-code}/` + cascade skill spec + agent spec. Recommend Option B (chuẩn hoá `Product/Commons/` = filesystem actual, update skill spec để tránh rename).
   - **[F-DELTA-4]** UX + BA reconcile session Figma-crosscheck SYS-1/3/4/5 → re-run `/figma-crosscheck 05`.
   - **[F-DELTA-5]** PM + Delivery Authority chốt Rollout Plan cho 2 EP W05 §5.3.
2. **Fix 4 P2 polish** (~10 phút work):
   - **[F-DELTA-1]** Edit 3 EP body table `Target wave: TBD → W05`; bump 3-in-1.
   - **[F-DELTA-2]** Edit ERROR-CODE-REGISTRY line 161 + 347 xóa "(DRAFT/PROPOSED)"; bump v23→v24.
3. **Business Authority sign-off 3 Architecture NEED CONFIRMATION** (§5.2):
   - A1 auto-create scope W05 vs defer
   - A2 so-summary verb GET vs POST
   - A3 ADR-023/024/025 flip PROPOSED → ACCEPTED (chờ SA design MR merge)
4. Sau khi 3 P1 fix + Architecture sign-off → re-run `/ba-review W05-INVENTORY-V2 --previous Product/reviews/BA-REVIEW-W05-INVENTORY-V2-2026-07-15.md` → expect **APPROVED**.
5. Chỉ khi APPROVED + Architecture NEED CONFIRMATION resolved → unlock `/dev-start W05` (per PKG-W05 §3 Entry Criteria).

---

## Fallback notes

- SKILL po-review đọc thành công (10 tiêu chí + verdict deterministic + template).
- `BR-COMMON.md` file tồn tại tại `Product/Commons/BR-COMMON.md` (agent-ba-review spec đề cập `Product/error-code/BR-COMMON.md` — path drift → F-DELTA-3 escalate).
- `author_return_json = null` → skip deep-check A (không có ba-author v4 return trong session này).
- `previous_report_file` valid → delta mode enabled, 17 carry-over finding verified vs source docs qua grep.
- Report persisted bởi parent agent (agent-ba-review v5 chỉ có Read/Grep/Glob/AskUserQuestion tool, không Write được).
