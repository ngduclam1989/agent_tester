# BUGFIX BUG-W02-023 — Mobile UI fidelity drift post-DEV W02 (omnibus 4 sub-symptoms vs Figma oracle)

> **Bug L1 status (per `Tracking/WAVE02/BUGS.md`)**: `OPEN` → `FIX_DONE` (phase 1 sub-b PRIMARY applied 2026-06-19 by agent-fix-garage-mobile). Sub-a/c/d remain `needs_evidence` phase 2.
> **Authored by**: orchestrator (Manual QC user visual diff session 2026-06-19). **Phase 1 fix by**: agent-fix-garage-mobile (FIX cycle 2, spawned 2026-06-19 09:35Z).
> **Scope**: 4 mobile UI sub-symptoms post-DEV W02 (commit `0cb2096d init code wave 2`). Cross-FEAT: INS-DOSSIER-CREATE + INS-DOSSIER-VIEW + INS-STL-DETAIL. NO cross-boundary edit expected.
> **Why omnibus**: 4 drift screens cùng feature group (insurance settlement mobile UI), cùng `agent-fix-garage-mobile` assignee, cùng FIX cycle → tiết kiệm 4× overhead vs 4 BUGs riêng (per user choice AskUserQuestion 2026-06-19).
> **Decision path**: Hướng B (file BUG + `/spawn-fix`) thay vì Hướng A (DEV regression + `/cr-raise MAJOR` + manual state transition). Tránh stage regression overhead — W02 đã closed DEV gate qua CR-20260618-03 và đang ở TEST_PLANNING.

---

## 1. Failure mode (observed)

### Overview

| Field | Value |
|---|---|
| Bug | BUG-W02-023 (P2, OPEN) |
| Symptom | 4 mobile screens drift Figma oracle sau khi W02 DEV close (commit `0cb2096d`). User chạy iOS Simulator (iPhone 17 Pro Max) chụp 4 screenshots — orchestrator visual diff vs `Product/ux/figma-mobile/assets/wave02-*/​_full.png`. |
| Category | P2 UI/Fidelity — không block business flow nhưng cần fix trước QC handoff |
| Reporter | orchestrator (Manual QC user visual diff) |
| Spec | FEAT-INS-DOSSIER-CREATE §UI / FEAT-INS-DOSSIER-VIEW AC-1+AC-2 / FEAT-INS-STL-DETAIL §Layout / CR-20260616-02 (panel 2-col) / CR-20260618-01 (KH-alloc-only) |
| Evidence root | `mobile/gf-garage-app/reports/screens/Simulator Screenshot - iPhone 17 Pro Max - 2026-06-19 at 14.{39.59, 42.24, 42.33, 43.12}.png` (4 PNGs) + `Product/ux/figma-mobile/assets/wave02-*/_full.png` (4 oracle PNGs) |

### Sub-symptom table

| Sub | Screen | Sim screenshot | Figma oracle | Confidence | Drift observed |
|---|---|---|---|---|---|
| **a** | `InsuranceDossierScreen` (create flow) | `14:39:59.png` | `wave02-ins-dossier-create/_full.png` frame 1 | MED | (i) Card border = solid blue outline (sim) vs Figma shadow/lighter border; (ii) CTA "Xuất hồ sơ bảo hiểm" footer disabled state khi progress `4/4 tài liệu sẵn sàng` — có thể đúng business logic vì 2 form Biên bản/Giấy ủy quyền chưa được fill nội dung; (iii) Whitespace lớn dưới 4 cards (Figma có thể có "Bản nháp #SET-..." section nếu có draft tồn tại) |
| **b** | `InsuranceDossierTab` (view list) | `14:43:12.png` | `wave02-ins-dossier-view/_full.png` frame 3 (empty state) | **HIGH** | Tab "Hồ sơ bảo hiểm đã xuất" active, **content area HOÀN TOÀN TRỐNG**: KHÔNG list dossiers KHÔNG empty state illustration. Figma frame 3 yêu cầu empty state widget `Không tìm hồ sơ bảo lãnh` + icon. Footer pinned section vẫn render `Phân bổ bảo hiểm` panel header khi tab dossier active (Figma frame 3 chỉ hiển thị `+ Tạo hồ sơ bảo hiểm` + `Thanh toán` buttons, KHÔNG có `Phân bổ bảo hiểm` panel cho empty state). |
| **c** | `InsuranceAllocationSection` panel 2-col responsive | _MISSING_ | `wave02-ins-stl-detail--section/_full.png` (4 frames) | **UNKNOWN** | 4 sim screenshots không cover màn này. User chốt scope drift qua AskUserQuestion confirm response, nhưng visual evidence missing. **Cần user chụp thêm Settlement Detail tab "Bảng chi phí" phone portrait + landscape** (responsive verify BH \| KH 2-col per CR-20260616-02). |
| **d** | KH-alloc-only screen (phiếu QT KH "chỉ phân bổ BH") | `14:43:12.png` (partial — chỉ thấy section bottom) | `wave02-ins-stl-detail--kh-alloc-only/_full.png` | MED | (i) Panel "Phân bổ bảo hiểm" header hiện nhưng 3 monetary rows (Giảm trừ +50k / Khấu hao +45M / Khấu trừ BH +5M) KHÔNG hiển thị trong viewport visible — có thể scroll/clipping issue dưới tab content area, có thể widget sticky pin che; (ii) Tab labels order drift: sim hiện `Chứng từ & hoá đơn / Hồ sơ bảo hiểm đã xuất / Lịch sử thanh toán` vs Figma kh-alloc-only spec `Bảng chi phí / Chứng từ & hóa đơn / Hồ sơ bảo hiểm` — labels khác từ + thiếu/thêm tab. |

## 2. Root-cause hypotheses (per sub)

### Sub-b — Root cause (HIGH confidence)

**Why #1 — Tại sao tab content area trống?**
Cubit/BLoC state of `InsuranceDossierTab` (load dossier versions from BFF query `getInsuranceDossierVersions`) likely returns `dossiers: []` empty list. Widget branch on empty likely returns `SizedBox.shrink()` (zero-size widget — default Flutter "render nothing" pattern) thay vì empty-state widget per Figma spec.

**Why #2 — Tại sao thiếu empty-state widget?**
Original W02 DEV scope ưu tiên happy path (list with N>0 dossier versions). Empty state implementation likely được deferred như "polish item" — không có DEBT registry entry nhưng đối ứng FEAT-INS-DOSSIER-VIEW AC-2 (yêu cầu empty state rendering).

**Why #3 — Tại sao footer pinned section vẫn hiện `Phân bổ bảo hiểm` panel khi tab dossier active?**
`InsuranceSettlementDetailScreen` (parent) sử dụng fixed footer Slot pattern — pinned section render độc lập với tab content. Figma frame 3 yêu cầu footer ẩn `Phân bổ bảo hiểm` khi tab dossier active (chỉ giữ `+ Tạo hồ sơ bảo hiểm` + `Thanh toán` buttons).

**Root cause**:
- `InsuranceDossierTab` thiếu empty-state branch implementation
- `InsuranceSettlementDetailScreen` footer slot không respect active tab context

### Sub-a — Root cause hypothesis (MED confidence)

- (i) Card border decoration likely dùng `Border.all(color: Colors.blue, width: 1)` thay vì design token `AppShadows.subtle()` hoặc `Border.all(color: AppColors.borderSubtle)`.
- (ii) CTA disabled state có thể là đúng business logic — verify vs FEAT-INS-DOSSIER-CREATE AC: "4/4 tài liệu sẵn sàng" có thể chỉ đề cập checkbox status, không phải content-fill status. Nếu đúng → cập nhật progress label semantic, không fix CTA.
- (iii) Whitespace có thể đúng cho fresh dossier (no draft). Verify with stateful screenshot (draft exists).

### Sub-c — Root cause unknown (NEED EVIDENCE)

Cần user chụp thêm screenshot Settlement Detail tab "Bảng chi phí" tab — phone portrait + landscape — để compare với Figma 4 frames.

### Sub-d — Root cause hypothesis (MED confidence)

- (i) Monetary rows clipping: có thể `InsuranceAllocationSection` widget overflow + `ListView/Column` không scroll, hoặc sticky footer overlay content area; verify với scroll trên màn này.
- (ii) Tab labels: likely hardcoded labels trong `InsuranceSettlementDetailScreen` thiếu update theo CR-20260618-01 Figma reference.

## 3. Proposed fix (per sub)

### Sub-b (HIGH priority — fix trước, sub-other defer)

**Files (expected)**:
- `mobile/gf-garage-app/lib/ui/insurance_settlement/dossier/insurance_dossier_tab.dart` — add empty-state branch:
  ```dart
  if (state.versions.isEmpty) {
    return InsuranceDossierEmptyState(); // NEW widget
  }
  // existing list render
  ```
- `mobile/gf-garage-app/lib/ui/insurance_settlement/dossier/widgets/insurance_dossier_empty_state.dart` (NEW) — widget per Figma frame 3:
  ```dart
  Column(
    crossAxisAlignment: CrossAxisAlignment.center,
    children: [
      Image.asset('assets/images/insurance/dossier_empty_state.png'),
      const SizedBox(height: 16),
      Text(LocaleKeys.insurance_dossier_empty_state_title.tr()), // "Không tìm hồ sơ bảo lãnh"
    ],
  )
  ```
- `mobile/gf-garage-app/lib/ui/insurance_settlement/insurance_settlement_detail_screen.dart` — footer slot branch: ẩn `Phân bổ bảo hiểm` panel khi active tab = "Hồ sơ bảo hiểm đã xuất":
  ```dart
  if (currentTab != InsuranceSettlementTab.dossier) {
    AllocationSectionPanel(...)
  }
  ```
- Assets: add `assets/images/insurance/dossier_empty_state.png` (export từ Figma frame 3 illustration)
- Locale keys: add `insurance_dossier_empty_state_title` → "Không tìm hồ sơ bảo lãnh" trong `vi.json` + `en.json` + regen `locale_keys.gen.dart`

### Sub-a (MED — verify business logic trước)

- (i) Refactor `DocumentCardSlot` border:
  ```dart
  decoration: BoxDecoration(
    border: Border.all(color: AppColors.borderSubtle, width: 1),
    boxShadow: AppShadows.subtle(),
    borderRadius: BorderRadius.circular(8),
  )
  ```
  Hoặc reuse existing `AppCardWidget` pattern nếu có.
- (ii) **NO FIX cần thiết** nếu CTA business logic đúng (FEAT AC verify); chỉ semantic label clarification "4/4 tài liệu sẵn sàng" → "4/4 tài liệu đã kích hoạt" hoặc "Tiến độ kích hoạt 4/4".
- (iii) Whitespace: NO FIX cần thiết — đúng cho fresh state.

### Sub-c (UNKNOWN — defer pending user evidence)

Cần thêm 1-2 screenshot tab "Bảng chi phí" trước khi prescribe fix.

### Sub-d (MED — verify scroll first)

- (i) Verify scroll behavior trước khi prescribe; có thể chỉ là user chưa scroll trong sim session.
- (ii) Update tab labels theo Figma kh-alloc-only spec:
  ```dart
  // Verify exact labels từ Figma — likely:
  tabs: [
    'Bảng chi phí',
    'Chứng từ & hóa đơn',
    'Hồ sơ bảo hiểm',
  ]
  ```

### Fix delegation note

`agent-fix-garage-mobile` xử lý sub-b PRIMARY (highest confidence + clearest scope). Sub-a/c/d flagged NEED_EVIDENCE — agent có thể:
- Sub-a: verify FEAT AC + refactor card border (nếu confirm visual drift)
- Sub-c: escalate user qua RETURN JSON `needs_evidence: [c]` field
- Sub-d: scroll test + verify tab labels

## 4. Blast radius

| Area | Change | Risk |
|---|---|---|
| `InsuranceDossierTab` widget | Empty state branch additive — no impact on happy path | None |
| `InsuranceDossierEmptyState` widget (NEW) | Pure additive | None |
| `InsuranceSettlementDetailScreen` footer | Branch logic on `currentTab` — guarded | Low: footer behaviors trên tabs khác có thể bị side-effect; cần test 3 tabs |
| `DocumentCardSlot` border decoration | Style-only change | None |
| Tab labels | String constants update | Low: i18n consistency check (locale keys nếu có) |
| Locale `vi.json` + `en.json` + gen | Add 1 key namespace `insurance_dossier_empty_state_*` | None |
| Assets `dossier_empty_state.png` | New file | None |

Cross-boundary: NONE. Contract change: NONE.

## 5. Regression test plan

- New widget test: `test/ui/insurance_settlement/dossier/insurance_dossier_tab_empty_state_test.dart` — verify empty branch render `InsuranceDossierEmptyState` khi `versions: []`.
- Existing test extend: `insurance_settlement_detail_screen_test.dart` — assert footer `Phân bổ bảo hiểm` panel ẩn khi tab dossier active.
- Visual smoke: re-capture sim screenshot tab "Hồ sơ bảo hiểm đã xuất" với 0 dossier versions → match Figma frame 3.

## 6. Build / lint / test status

| Gate | Actual Result (phase 1, 2026-06-19) |
|---|---|
| `fvm flutter analyze` (changed files) | DEFERRED (DEBT-W01-MOBILE-BUILD-ENV — no Flutter toolchain on harness; orchestrator paste local `fvm flutter analyze lib/ui/insurance_settlement/dossier/insurance_dossier_tab.dart lib/ui/settlement/settlement_detail/insurance_settlement_detail_screen.dart`) |
| `fvm flutter test test/ui/settlement/insurance_dossier/bug_w02_023_dossier_tab_empty_state_test.dart` | DEFERRED (DEBT-W01-MOBILE-BUILD-ENV — orchestrator paste local output) |
| Visual screenshot diff | TBD — user verify post-fix (re-capture sim screenshot tab "Hồ sơ bảo hiểm đã xuất" với 0 versions; match Figma `wave02-ins-dossier-view/_full.png` frame 3) |

DEBT: BLOCKER-W02-MOBILE-HARNESS-FLUTTER (Flutter toolchain harness unverified) — same as W01/W02 cycle precedent; user runs `fvm flutter analyze/test` locally trên Mac dev box, paste output vào commit/PR description.

## 7. Files changed (actual — phase 1 sub-b PRIMARY, 2026-06-19)

**3 files** (architecture win: pure reuse, zero new widget/asset/locale key):
- `mobile/gf-garage-app/lib/ui/insurance_settlement/dossier/insurance_dossier_tab.dart` — line 40: `if (state.versions.isEmpty) return const EmptyRecordsWidget();` (replaces local `_EmptyState` class with canonical `EmptyRecordsWidget` reuse). `_EmptyState` private class removed; imports cleaned.
- `mobile/gf-garage-app/lib/ui/settlement/settlement_detail/insurance_settlement_detail_screen.dart` — add `_handleTabIndexChanged()` TabController listener (line 83 + 93 + 100 dispose) + `final isDossierTabActive = _tabController.index == 2;` (line 115) + gate `Phân bổ bảo hiểm` panel render: `if (isInsurance && !isDossierTabActive)` (line 156) + KH-alloc allocation: `if (!isInsurance && !isDossierTabActive && detailData?.customerStillHasInsuranceAllocation == true)` (line 161).
- `mobile/gf-garage-app/test/ui/settlement/insurance_dossier/bug_w02_023_dossier_tab_empty_state_test.dart` (**NEW** — 62 lines, 2741 bytes) — 2 widget tests pinning Figma-canonical `EmptyRecordsWidget` heading + subtitle to prevent future drift; smoke override pattern test for back-compat.

**Not touched** (phase 1 scope discipline): NO new widget, NO new asset PNG, NO new locale key, NO `vi.json`/`en.json` regen. Pre-existing `EmptyRecordsWidget` (`lib/ui/settlement/widgets/empty_records_widget.dart` built for BUG-W01-025 same Figma 410:28016 oracle) already pinned canonical strings + SVG illustration.

## 8. Don't-touch list

- BFF query `getInsuranceDossierVersions` SDL — kept as-is
- Existing `InsuranceDossierScreen` create flow (sub-a NO FIX expected pending BA verify)
- `InsuranceAllocationSection` widget logic — only border decoration touch nếu sub-a fix
- W02 closed-bug fixes (BUG-W02-002 date format, BUG-W02-003 i18n) — preserved

## 9. Regression Scope YAML (per BUG-VERIFY-MECHANISM-V2)

```yaml
bug_id: BUG-W02-023
severity: P2
omnibus_sub_symptoms: [a, b, c, d]
primary_sub_symptom: b  # HIGH confidence, fix-first
last_verify_run:
  timestamp: 2026-06-19T09:43:00Z
  command: "manual (orchestrator post-spawn-fix verification — code applied, automated /verify-bug deferred to TEST_GROUP local toolchain)"
  verdict: PARTIAL  # phase 1 sub-b RESOLVED at code level; sub-a/c/d needs_evidence
  failed_tcs: []
  notes: "Phase 1 sub-b PRIMARY code applied: insurance_dossier_tab.dart reuse EmptyRecordsWidget + insurance_settlement_detail_screen.dart TabController listener gate. Regression test added. Build/lint/test DEFERRED (DEBT-W01-MOBILE-BUILD-ENV)."
fix_status: FIX_DONE_PARTIAL  # phase 1 sub-b only; sub-a/c/d remain needs_evidence

regression_scope:
  direct:
    mobile_ui:
      - TC-W02-MOB-UI-DOSSIER-TAB-EMPTY-STATE     # NEW — sub-b primary
      - TC-W02-MOB-UI-DOSSIER-TAB-LIST-RENDER     # existing — sub-b regression guard
      - TC-W02-MOB-UI-DOSSIER-SCREEN-CARD-BORDER  # NEW — sub-a (style)
    mobile_e2e: []  # no E2E direct — UI fidelity touch-up

  same_path:
    mobile_ui:
      - TC-W02-MOB-UI-SETTLEMENT-DETAIL-FOOTER-TAB-AWARE  # NEW — sub-b footer branch
      - TC-W02-MOB-UI-SETTLEMENT-DETAIL-TAB-NAVIGATION    # existing — guard tab switching
      - TC-W02-MOB-UI-KH-ALLOC-ONLY-LAYOUT                # existing — sub-d
    mobile_e2e:
      - TC-W02-MOB-E2E-DOSSIER-CREATE-VIEW-FLOW           # existing — verify create→view loop with empty initial state

  downstream:
    mobile_ui:
      - TC-W02-MOB-UI-SETTLEMENT-DETAIL-RESPONSIVE        # existing — sub-c panel 2-col (needs user evidence)
    api: []  # no API change — UI-only

  cascade:
    mobile_ui:
      - TC-W02-MOB-UI-I18N-INSURANCE-DOSSIER-EMPTY-STATE  # NEW — locale key wiring (vi/en)
    e2e: []
    ui: []  # web parity not affected (separate boundary)

minimum_coverage_check:
  rule_applied: "P2: >=1 direct + >=1 same_path"
  direct_count: 3  # all mobile_ui
  same_path_count: 4  # 3 mobile_ui + 1 mobile_e2e
  status: PASS

needs_evidence:
  - sub: c
    reason: "4 sim screenshots không cover Settlement Detail tab 'Bảng chi phí' — user xác nhận scope drift qua AskUserQuestion nhưng visual evidence missing"
    request: "User chụp thêm screenshot Settlement Detail tab 'Bảng chi phí' phone portrait + landscape (cùng device iPhone 17 Pro Max simulator)"
  - sub: a-ii
    reason: "CTA disabled state khi 4/4 progress complete — có thể đúng business logic"
    request: "BA confirm FEAT-INS-DOSSIER-CREATE AC về gating 'cards ready' vs 'forms filled' — nếu form-fill required → NO FIX cần thiết"
  - sub: d-i
    reason: "Monetary rows clipping có thể do user chưa scroll trong sim — cần verify behavior"
    request: "User scroll trong tab 'Hồ sơ bảo hiểm đã xuất' xem rows hiện ra không, hoặc chụp screenshot KH-alloc-only màn dài"

fix_strategy:
  phase_1: "agent-fix-garage-mobile xử lý sub-b PRIMARY (empty state widget + footer tab-aware branch). Scope ≤ 6 files. Expected RETURN JSON: boundary_clean=true, flutter analyze/test pass."
  phase_2: "Sau khi user cung cấp evidence (sub-a-ii BA confirm + sub-c sim screenshot + sub-d scroll test), spawn FIX cycle 2 nếu cần. Nếu user confirm sub-a-ii là correct business → close sub-a no-fix; nếu sub-d scroll resolves → close sub-d no-fix."

verify_workflow:
  command: "/verify-bug BUG-W02-023"
  after_phase_1: "Re-run TC subset direct + same_path mobile_ui; sub-c+d marked DEFERRED nếu chưa evidence; L1 status update: phase-1 done → IN_FIX → verify pending sub-b only → FIX_DONE_PARTIAL (custom status nếu cần) hoặc keep OPEN until omnibus close"
```

## 10. Change Log

| Date | Version | Description | Author |
|---|---|---|---|
| 2026-06-19 | 1 | Initial filing — omnibus 4 sub-symptoms post-DEV W02 visual diff. Path = Hướng B (BUG + /spawn-fix). Sub-b HIGH confidence (clear evidence); sub-a/c/d NEED_EVIDENCE (partial visual coverage). Approach: phase 1 fix sub-b, phase 2 wait user evidence sub-a/c/d. | orchestrator (Manual QC) |
| 2026-06-19 | 2 | **Phase 1 sub-b PRIMARY applied** — agent-fix-garage-mobile (FIX cycle 2, spawned by orchestrator). Architecture win: discovered canonical `EmptyRecordsWidget` already exists (`mobile/gf-garage-app/lib/ui/settlement/widgets/empty_records_widget.dart` built for BUG-W01-025 same Figma 410:28016 oracle) → pure reuse, zero new widget/asset/locale key. (1) `insurance_dossier_tab.dart` line 40 reuse `EmptyRecordsWidget` thay `_EmptyState` local class (removed). (2) `insurance_settlement_detail_screen.dart` add `_handleTabIndexChanged()` TabController listener + `isDossierTabActive` gate ẩn `Phân bổ bảo hiểm` panel (line 156) + KH-alloc allocation (line 161) khi tab dossier active. (3) Regression test `bug_w02_023_dossier_tab_empty_state_test.dart` (62 lines, 2 widget tests pin canonical heading + subtitle). Status: OPEN → FIX_DONE phase 1. Sub-a/c/d remain `needs_evidence` (5 items): a-i (BA semantic CTA gate), a-iii (whitespace empty-draft state), c (Settlement Detail 'Bảng chi phí' screenshot bổ sung), d-i (KH-alloc-only scroll verify), d-ii (Product Authority 3 vs 4 tabs). Build/lint/test DEFERRED (DEBT-W01-MOBILE-BUILD-ENV). | agent-fix-garage-mobile |
