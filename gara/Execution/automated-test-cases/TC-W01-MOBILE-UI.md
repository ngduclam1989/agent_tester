---
document_id: 'GMS-TC-W01-MOBILE-UI'
type: automated-test-case
parent: 'Execution/test-cases/TEST-CASE-REGISTRY.md'
status: ACTIVE
version: 4
boundary: 'garage-mobile'
wave: 'W01'
owner: 'agent-test-mobile-ui'
last_reviewed: '2026-06-12'
---

# Automated Test Cases — W01: Mobile UI (Flutter / BLoC)

> Automated testcase artifact cho `agent-test-mobile-ui`, Wave 01.
> Manual QC reference: `Execution/test-cases/TC-W01-MOBILE-UI.md` (read-only).
> Spec files: `Execution/auto/specs/W01/mobile-ui/`
> Harness: `Execution/auto/harness/flutter-widget/` (C1) · `Execution/auto/harness/alchemist/` (C2) · `Execution/auto/harness/patrol/` (C3)
> **TEST_EXECUTION — Run 1 — 2026-06-11**: Environment Readiness Gate FAIL. `flutter --version` → "command not found" sau 2 retry. Tất cả 115 TC chuyển BLOCKED. TR: `Execution/test-reports/TR-W01-MOBILE-UI.md`.
>
> **POST-RUN-1 UNBLOCK — 2026-06-11 (cùng ngày)**: Phase 1+2 install hoàn tất (xem `Execution/checklists/impl/UNBLOCK-PLAN-W01-TEST-EXEC-RUN-2.md §A1 actual run` + `§A1 Phase 2 actual run` + `§A1 Phase 2 KVM enable + smoke`). Flutter 3.44.1 + Dart 3.12.1 tại `$HOME/flutter` (PATH persisted), widget smoke PASS. Android SDK 33/36 + emulator + AVD `pixel6_api33` tại `$HOME/Android/Sdk`. KVM accel verified (`getent group kvm` ok, cold boot <2 phút). Net post-unblock cho /test-exec Run 2:
> - **91 C1 widget+bloc_test READY** (headless flutter_test, không cần emulator)
> - **12 C2 alchemist BLOCKED** — root cause mới: harness pubspec khai báo `fonts/Roboto-{Regular,Medium,Bold}.ttf` nhưng `Execution/auto/harness/alchemist/fonts/` không tồn tại trên disk. Follow-up: agent-test-mobile-ui download Roboto tại Run 2.
> - **10 C3 Patrol READY** với RAM caveat (host 26 GB used / 31 GB total — emulator + Flutter build cần ~3 GB)
> - **2 C4 multi-device READY** (cần thêm 1 tablet AVD)
>
> **TEST_EXECUTION — Run 2 — 2026-06-11**: Flutter 3.44.1 xác nhận available (env gate PASS). C1 smoke PASS (28 stub tests). Tuy nhiên tất cả spec file là **stub placeholder** — production widget imports commented out, assert `expect(true, isTrue)`. Runner exit code 0 KHÔNG phải real widget test evidence (vi phạm `MOBILE_UI_SOURCE_EVIDENCE` nếu tính PASS). C1 giữ `BLOCKED-by-harness` cho đến khi harness được link tới production package. C2 alchemist **FAIL-incompatible**: `alchemist ^0.10.0` không tương thích với Flutter 3.44.1 (`Canvas.clipRSuperellipse`/`drawRSuperellipse` chưa implement trong `BlockedTextCanvasAdapter`). C3/C4 Patrol chưa attempt run 2 (ngoài scope). Tất cả 115 TC vẫn BLOCKED.

---

## 1. General Info

| Field         | Value                                                            |
| ------------- | ---------------------------------------------------------------- |
| Document ID   | `GMS-TC-W01-MOBILE-UI`                                           |
| Wave          | W01                                                              |
| Boundary(ies) | `garage-mobile`                                                  |
| Feature(s)    | `FEAT-INS-SO-ADJUSTMENT`, `FEAT-INS-STL-DETAIL`                  |
| Owner         | `agent-test-mobile-ui`                                           |
| Last Reviewed | 2026-06-11                                                       |
| Work Package  | `Execution/work-packages/PKG-W01-insurance-foundation.md`        |

---

## 2. Scope

### In Scope

- `InsuranceAllocationSection` (inline Card trên SO Edit/Detail): widget render, SegmentedButton mode VND/%, per-trường validation, realtime preview BLoC
- `InsuranceAllocationCubit`/BLoC state machine: Initial → Loading → Success/Error/Empty
- `InsuranceSettlementDetailScreen`: AppBar + 4 tab + 2 khối BH conditional + nút "Tạo hồ sơ BH" disabled
- Design conformance 5-cấp vs figma-mobile oracle (`wave01-ins-so-adjustment-oracle.md` + `wave01-ins-stl-detail-oracle.md`)
- Responsive phone portrait 375×822 / landscape / tablet portrait
- Accessibility (Semantics, touch target ≥48dp, contrast)
- Role-based visibility (accountant + garage-owner)
- Regression: màn SO Edit/Detail, InsuranceSettlementDetailScreen

### Out of Scope

- Web UI — `TC-W01-PLATFORM-UI.md`
- Backend API contract, validation rule exhaustive — `TC-W01-API.md`
- Cross-platform journey, deeplink cold start — `TC-W01-MOBILE-E2E.md`
- Tenant isolation — `TC-W01-ISOLATION.md`
- Permission grant flow native (camera/storage) — `agent-test-mobile-e2e`
- In toàn bộ hồ sơ / navigation FEAT-INS-DOSSIER-CREATE (W02 deferred)

### Test Environment & Data

| Item | Required Data / Setup | Notes |
| --- | --- | --- |
| Flutter SDK | Flutter 3.41+ / Dart 3.11+ | `flutter --version` trước khi chạy. Absent → BLOCKED C1/C2 |
| QC widget harness | `Execution/auto/harness/flutter-widget/pubspec.yaml` — `flutter_test`, `bloc_test ^9.1.6`, `mocktail ^1.0.0`; `flutter pub get` | Bootstrap nếu chưa có; smoke: `flutter test smoke_test.dart` |
| QC alchemist harness | `Execution/auto/harness/alchemist/pubspec.yaml` — `alchemist ^0.14.0` (upgraded Run 3 — Flutter 3.44.1 compat); Roboto-Regular.ttf + Roboto-Medium.ttf bundled; `alchemist_config.yaml` font deterministic | Chỉ C2. Smoke golden 100×100. |
| Patrol harness | `Execution/auto/harness/patrol/`; `patrol_cli`; Android emulator Pixel_6_API_34 hoặc iOS simulator | Chỉ C3/C4. Smoke patrol test. |
| Mock BLoC / data | `MockInsuranceAllocationCubit` (mocktail), `MockSettlementBloc` (mocktail); in-memory SO seed: 2 PT BH + 1 DV BH + 1 PT KH; phiếu QT BH `#SET-W01-INS-001` (payerType=INSURANCE, status=DRAFT) | C1/C2 dùng mock; C3 cần real/mock backend |
| App font asset | Roboto bundled trong app asset — cho C2 golden deterministic cross-platform | Kiểm tra `pubspec.yaml` của harness alchemist |
| Figma oracle | `wave01-ins-so-adjustment-oracle.md` + `wave01-ins-stl-detail-oracle.md` — loaded trong TEST_PLANNING | Wording/token từ oracle là canonical |

**Cluster assignment:**
- `C1`: TC logic-only (BLoC state machine, element-presence, role-based, disabled state, validation logic, wording với AppLocalizations thật)
- `C2`: TC visual-fidelity golden (alchemist), layout-structure (tester.getRect/getSize), responsive
- `C3`: TC flow-gated (route transition, BottomSheet/Dialog dismiss, snackbar timing, native keyboard, orientation rotate, hardware Back)

**Runner path:**
- C1/C2: `flutter test Execution/auto/specs/W01/mobile-ui/<spec_file>.dart` từ `Execution/auto/harness/flutter-widget/` hoặc `Execution/auto/harness/alchemist/`
- C3: `patrol test --target Execution/auto/specs/W01/mobile-ui/patrol/<spec_file>_patrol_test.dart`

**Oracle Coverage Plan (mobile):**

| Screen (oracle) | nodeId | TC(s) | 5-cấp | Cluster | Verdict gate |
|---|---|---|---|---|---|
| SO Edit — panel nhập "Phân bổ quyết toán bảo hiểm" (5 khoản + Áp dụng tất cả) | `397:24005` | TC-MUI-006, TC-MUI-007, TC-MUI-023 | Screen+Widget+Variant+Text+Tokens | C2 (golden) + C1 (wording) | alchemist goldenTest PASS + find.text exact |
| Panel "Tổng giá dịch vụ" — tab KH active | `400:23409` | TC-MUI-040, TC-MUI-041, TC-MUI-042 | Screen+Widget+Variant+Text+Tokens | C2 + C1 | golden + segmented tap |
| Panel "Tổng giá dịch vụ" — tab BH active | `400:23120` | TC-MUI-043 | Variant+Text | C1 | find.text 'Bảo hiểm thanh toán' |
| Chi tiết phiếu QT BH — toàn screen tab Bảng chi phí | `407:17089` / `81:39472` | TC-MUI-060, TC-MUI-061 | Screen+Widget+Text+Tokens | C2 | golden full |
| Nhóm A — Header & thông tin chung | `410:28748` | TC-MUI-062 | Widget+Text+Tokens | C2 + C1 | golden header + find.text |
| Tab bar 4 tab | `407:19398` | TC-MUI-063 | Widget+Text | C1 | find.text per tab |
| Tab Bảng chi phí — bảng hạng mục | `407:19436` | TC-MUI-064 | Widget | C1 | find.byType line-item |
| Phân bổ BH + Tổng giá dịch vụ + Cân TT | `407:19519` | TC-MUI-065, TC-MUI-066 | Widget+Text+Tokens | C2 + C1 | golden + find.text |
| Action bar | `407:17222` | TC-MUI-080, TC-MUI-081 | Widget+Tokens | C1/C2 | find.byType AppButton |

coverage_gaps (oracle) → route evidence:
- `AC-10 sign/color` (coverage_gap oracle wave01-ins-so-adjustment): mobile dùng plain amount (không dấu ±/màu) → verify qua FEAT AC, TC mark theo AC-10 FEAT không oracle-gated visual
- `AC-11 3-box` (coverage_gap): mobile dùng SegmentedButton tab thay 3-box → TC verify tab behavior per FEAT + oracle mobile
- `AC-12 negative warning` (coverage_gap): state không render trong Figma → verify qua FEAT AC-12 + widget error styling
- `AC-16 permission` (coverage_gap): no UI surface → out-of-visual-oracle-scope; covered by C1 role-based TC

**Coverage Map common-testcase-mobile-ui.md (sàn tối thiểu):**

| Common group | Status | Mapped TC(s) |
|---|---|---|
| MOB-UI-LAY-001/002/004/005 Layout/Scaffold | `covered` | TC-MUI-001, TC-MUI-006, TC-MUI-023, TC-MUI-060, TC-MUI-061 |
| MOB-UI-LAY-003 BottomNav | `out-of-scope` — wave này chỉ test SO Edit/Detail + STL Detail, không test BottomNav tab switching (không thay đổi) |
| MOB-UI-LAY-006 Required field * | `covered` | TC-MUI-008 (label Chiết khấu liên kết không required * per AC) |
| MOB-UI-LAY-007/008/009/010 Orientation/safe-area/status-bar | `covered` / `C3-BLOCKED` | TC-MUI-096, TC-MUI-097 (C3) |
| MOB-UI-TXT-001..015 TextFormField per field | `covered` | TC-MUI-009..TC-MUI-055 (per-field taxonomy) |
| MOB-UI-DRP-001..005 Dropdown | `out-of-scope` — wave có SegmentedButton toggle đơn vị, không có DropdownButtonFormField; company dropdown là baseline production (AC-2 out-of-wave) |
| MOB-UI-DAT-001..008 DatePicker | `out-of-scope` — không có DatePicker trong scope W01 SO-ADJ/STL-DETAIL new UI |
| MOB-UI-SWT-001..010 Switch/Toggle | `covered` | TC-MUI-002, TC-MUI-003 (toggle Bảo hiểm Có/Không) |
| MOB-UI-BTS-001..003 BottomSheet | `out-of-scope` — W01 dùng inline Card không BottomSheet; xác nhận per PKG-W01 §2.2 |
| MOB-UI-DLG-001..005 Dialog | `covered` | TC-MUI-098 (confirm dialog Android Back dirty form) |
| MOB-UI-SNK-001..003 SnackBar | `covered` | TC-MUI-099, TC-MUI-100, TC-MUI-081 |
| MOB-UI-BTN-001..010 Button states | `covered` | TC-MUI-044, TC-MUI-045, TC-MUI-046, TC-MUI-080, TC-MUI-081 |
| MOB-UI-LST-001..012 ListView | `covered` | TC-MUI-064, TC-MUI-070 |
| MOB-UI-SCH-001..005 Search/Filter | `out-of-scope` — không có search/filter trong W01 new screens |
| MOB-UI-NAV-001..006 Navigation push/pop | `covered` (C3) | TC-MUI-090, TC-MUI-091, TC-MUI-092 |
| MOB-UI-BLC-001..006 BLoC state machine | `covered` | TC-MUI-030..TC-MUI-038 |
| MOB-UI-NAV-007..011 AppBar/BottomNav/Drawer | `covered` | TC-MUI-060, TC-MUI-063 |
| MOB-UI-RSP-001..008 Responsive | `covered` (C2/C4) | TC-MUI-103..TC-MUI-108 |
| MOB-UI-DRK-001..004 Dark mode | `out-of-scope` — app chưa support dark mode (không có ThemeMode switch trong app) |
| MOB-UI-A11-001..009 Accessibility | `covered` | TC-MUI-109..TC-MUI-115 |
| MOB-UI-LOC-001..005 Localization Vietnamese | `covered` | TC-MUI-116..TC-MUI-118 |
| MOB-UI-DPL-001..002 Deeplink rendering | `out-of-scope` — deeplink resolution thuộc `agent-test-mobile-e2e`; UI-level rendering sau deeplink out-of-wave cho W01 |
| MOB-UI-PLT-001..002 Platform widget | `covered` | TC-MUI-006 (Material 3 widget verify) |
| MOB-UI-GRD-001..007 Grid/Table cell | `covered` | TC-MUI-064, TC-MUI-065 (bảng chi phí + panel tổng giá) |
| MOB-UI-LNK-001..006 Link | `covered` | TC-MUI-071 (link phiếu DV liên kết) |
| MOB-UI-TXQ-001..008 UI Text quality | `covered` | TC-MUI-119..TC-MUI-122 |
| MOB-UI-MTI-001..005 Multi-touch/rapid input | `covered` (C3/C1) | TC-MUI-123..TC-MUI-125 |
| MOB-UI-DVC-001..006 Device compat | `covered` (C4-BLOCKED) | TC-MUI-126..TC-MUI-127 |
| MOB-UI-USA-001..008 Usability heuristics | `covered` | TC-MUI-109, TC-MUI-044, TC-MUI-100 |

**Impacted screens (regression):**
- `ServiceOrderCreationPage` (SO Edit host) — tác động do mount InsuranceAllocationSection mới; ≥1 regression TC (TC-MUI-001, TC-MUI-130)
- `InsuranceSettlementDetailScreen` (new screen) — wave mới, no prior PASS
- Shared `BottomNavigationBar` / `AppShell` — KHÔNG bị tác động trực tiếp bởi W01 changes → `out-of-wave` regression

**Deep UI flow trace:**
SO Edit (BH=Có) → nhập 5 khoản → realtime preview → Save → navigate SO Detail (read-only) → navigate tạo phiếu QT BH → InsuranceSettlementDetailScreen → 4 tab → panel Tổng giá dịch vụ → tab toggle KH/BH → nút Tạo hồ sơ disabled → SnackBar "Wave 2".

**Auto vs Manual Parity Diff:**

| Manual TC ID | Parity | Phân loại | Notes |
|---|---|---|---|
| TC-W01-UI-066 | `covered` | TC-MUI-001 | AC-0 SO Create không có section |
| TC-W01-UI-067 | `covered` | TC-MUI-002 | AC-1 section hiển thị Edit BH=Có |
| TC-W01-UI-068 | `covered` | TC-MUI-003 | AC-1 section ẩn BH=Không |
| TC-W01-UI-069 | `covered` | TC-MUI-004 | AC-1 Detail read-only |
| TC-W01-UI-070 | `covered` | TC-MUI-005 | inline Card không bottom sheet |
| TC-W01-UI-071 | `covered` | TC-MUI-006 | mount isEdit=true |
| TC-W01-UI-072 | `covered` (C3) | TC-MUI-096 | Android/iOS render |
| TC-W01-UI-073 | `covered` | TC-MUI-010 | SegmentedButton default=Số tiền |
| TC-W01-UI-074 | `covered` | TC-MUI-011 | tap % mode switch |
| TC-W01-UI-075 | `covered` | TC-MUI-016 | CK VT số âm error |
| TC-W01-UI-076 | `covered` | TC-MUI-017 | CK VT % > 100 error |
| TC-W01-UI-077 | `covered` | TC-MUI-053 | Khấu trừ BH không SegmentedButton |
| TC-W01-UI-078 | `covered` | TC-MUI-029 | Khấu hao per-line âm error |
| TC-W01-UI-079 | `covered` | TC-MUI-044 | Áp dụng tất cả |
| TC-W01-UI-080 | `covered` | TC-MUI-032 | BLoC realtime preview |
| TC-W01-UI-081 | `covered` | TC-MUI-034 | BLoC ví dụ epic 197.68tr |
| TC-W01-UI-082 | `covered` | TC-MUI-035 | BH âm warning |
| TC-W01-UI-083 | `covered` | TC-MUI-036 (C3) | Save → Detail navigate |
| TC-W01-UI-084 | `covered` (C3) | TC-MUI-097 | soft keyboard không che field |
| TC-W01-UI-085 | `covered` (C3) | TC-MUI-098 | hardware Back dirty form |
| TC-W01-UI-086 | `covered` (C3) | TC-MUI-093 | xoay ngang/dọc SO Edit |
| TC-W01-UI-087 | `covered` | TC-MUI-099 | offline khi save |
| TC-W01-UI-088 | `covered` | TC-MUI-100 | mất mạng đang save |
| TC-W01-UI-089 | `covered` | TC-MUI-109 | touch target SegmentedButton ≥48dp |
| TC-W01-UI-095 | `covered` (C3) | TC-MUI-094 | background resume giữ state |
| TC-W01-UI-101 | `covered` | TC-MUI-049 | toggle off BH=Không discard |
| TC-W01-UI-102 | `covered` | TC-MUI-050 | toggle off→on fields reset 0 |
| TC-W01-UI-147 | `covered` | TC-MUI-060 | AppBar mã phiếu + 4 tab |
| TC-W01-UI-148 | `covered` | TC-MUI-063 | tab Bảng chi phí active |
| TC-W01-UI-149 | `covered` (C3) | TC-MUI-075 | switching/swipe tab |
| TC-W01-UI-150 | `covered` | TC-MUI-065 | Panel Tổng giá DV payerType=INSURANCE |
| TC-W01-UI-151 | `covered` | TC-MUI-082 | phiếu KH 2 khối BH ẩn |
| TC-W01-UI-152 | `covered` | TC-MUI-083 | phiếu KH nút Tạo hồ sơ không có |
| TC-W01-UI-153 | `covered` | TC-MUI-080 | nút Tạo hồ sơ disabled W01 |
| TC-W01-UI-154 | `covered` | TC-MUI-081 | tap disabled → SnackBar Wave 2 |
| TC-W01-UI-155 | `covered` | TC-MUI-084 | không hiện phiếu CANCEL |
| TC-W01-UI-156 | `covered` (C3) | TC-MUI-096 | 4 tab Android+iOS |
| TC-W01-UI-157 | `covered` | TC-MUI-085 | offline empty state |
| TC-W01-UI-158 | `covered` | TC-MUI-086 | server 500 lỗi thân thiện |
| TC-W01-UI-159 | `covered` (C3) | TC-MUI-094 | xoay ngang/dọc STL Detail |

No `auto-miss` items — tất cả 40 manual TC đã covered hoặc phân loại.

**Self-Audit Record (Technique Compliance + Edge-Case Coverage + Field-Validation):**

Technique compliance:
- Equivalence Partitioning: covered (valid/invalid mode %, âm/0/dương, bỏ trống/có giá trị)
- Boundary Value Analysis: covered (% = 0, 100, 101; số tiền = 0, >cơ sở)
- Decision Table: covered (toggle BH Có/Không × có allocation → behavior matrix)
- State Transition: covered (BLoC Initial→Loading→Success/Error/Empty; toggle BH Có↔Không × có/không allocation)
- Error Guessing: covered (double-tap Save, stale state sau toggle, offline khi save, background resume)

Edge-case groups:
- State Machine: `covered` (TC-MUI-030..038, TC-MUI-049, TC-MUI-050)
- Concurrency: `covered` (TC-MUI-046 double-tap Save)
- Cascade: `covered` (TC-MUI-049, TC-MUI-050 toggle off discard)
- Boundary Constraints: `covered` (TC-MUI-017..021 per field)
- Data Integrity: `covered` (TC-MUI-034 ví dụ epic, stale-state)
- Permission & Isolation: `covered` (TC-MUI-087, TC-MUI-088 role-based)

Field-validation (5 input fields CKVT/CKCDV/Khấu hao header/Giảm trừ/Khấu trừ):
- CRITICAL: Bỏ trống `covered`, Định dạng sai `covered`, Số âm `covered`, Boundary `covered`, Cross-field dependency `covered`
- MEDIUM: Space-only `covered`, Trimspace `adapted`, Mode %/số tiền `covered`, Copy-paste `covered`

Coverage Accounting: tất cả coverage group đã gán trạng thái. Không còn mandatory failure.

---

## 3. Status Summary

| Coverage Mode | Total | Status Summary |
| --- | --- | --- |
| Automated | 115 | **Run 1 (2026-06-11)**: 0 PASS · 0 FAIL · 115 BLOCKED (env gate Flutter SDK absent). **Run 2 (2026-06-11)**: 0 PASS · 0 FAIL · 115 BLOCKED (env gate PASS; C1 stubs không phải real evidence; C2 alchemist incompatible; C3/C4 not attempted). **Run 3 (2026-06-12)**: 0 PASS · 0 FAIL · 115 BLOCKED (alchemist upgraded 0.14.0; specs rewritten với pure-Dart inline model tests; widget/cubit/wording BLOCKED-by-harness; path dep infeasible — TL-W01-MUI-003). |
| Manual | 40 | 40 READY (xem `Execution/test-cases/TC-W01-MOBILE-UI.md`) |

> **TEST_EXECUTION Run 1 — 2026-06-11**: Tất cả TC (C1/C2/C3/C4) chuyển BLOCKED do Environment gate fail (Flutter SDK absent). KHÔNG có TC nào được chạy.
> **TEST_EXECUTION Run 2 — 2026-06-11**: Env gate PASS (Flutter 3.44.1). C1 flutter_test smoke PASS nhưng tất cả spec là **stub placeholder** — 28 `expect(true, isTrue)` stubs pass, không phải real widget assertions. Per `MOBILE_UI_SOURCE_EVIDENCE`: stub PASS ≠ TC PASS. C2 alchemist BLOCKED-incompatible (`alchemist 0.10.0` / Flutter 3.44.1 Canvas API mismatch). C3/C4 không attempt. Tất cả 115 TC vẫn BLOCKED. Mọi TC visual-gated (C2) và flow-gated (C3) tiếp tục `BLOCKED-by-harness`.
> **TEST_EXECUTION Run 3 — 2026-06-12**: alchemist upgraded 0.10.0 → 0.14.0. 4 spec files rewritten với pure-Dart inline model layer (~27 headless test functions). Widget/cubit/wording tests skip-flagged BLOCKED-by-harness (root cause: `BaseCubit` native transitive deps + `@freezed` generated absent + path dep infeasible). TC verdict: 0 PASS · 0 FAIL · 115 BLOCKED. Resolution: per-service agent in `mobile/gf-garage-app/test/`. Lesson TL-W01-MUI-003.

---

## 4. Test Cases

### 4A — FEAT-INS-SO-ADJUSTMENT: Section render + toggle + role

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-001 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-0, BR-INS-SO-ADJ-001 | UI | Regression | P1 | SO Create — `InsuranceAllocationSection` KHÔNG xuất hiện trong widget tree | Mock `ServiceOrderCreationPage` với `isEdit=false`; mock BLoC; AppLocalizations vi; C1 widget test | 1. Pump `MaterialApp(home: ServiceOrderCreationPage(isEdit: false))` với mock BLoC.<br>2. `tester.pumpAndSettle()`.<br>3. `expect(find.byType(InsuranceAllocationSection), findsNothing)`. | - `InsuranceAllocationSection` không render khi `isEdit=false`.<br>- Không crash (exit code 0). | BLOCKED | N/A |
| TC-MUI-002 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-1, BR-INS-SO-ADJ-001 | UI | Wave | P1 | SO Edit + BH=Có — section `InsuranceAllocationSection` render trong widget tree | Mock `ServiceOrderCreationPage` với `isEdit=true`; toggle BH=Có; C1 | 1. Pump SO Edit page (`isEdit: true`) với BLoC state insurance=true.<br>2. `tester.pumpAndSettle()`.<br>3. `expect(find.byType(InsuranceAllocationSection), findsOneWidget)`. | - `InsuranceAllocationSection` render đúng 1 lần.<br>- Không crash. | BLOCKED | N/A |
| TC-MUI-003 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-1, BR-INS-SO-ADJ-001 | UI | Wave | P1 | SO Edit + BH=Không — section ẩn khỏi widget tree | Mock SO Edit; toggle BH=Không (BLoC state insurance=false); C1 | 1. Pump SO Edit, BLoC emit insurance=false.<br>2. `tester.pumpAndSettle()`.<br>3. `expect(find.byType(InsuranceAllocationSection), findsNothing)`. | - `InsuranceAllocationSection` không render khi BH=Không. | BLOCKED | N/A |
| TC-MUI-004 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-1, BR-INS-SO-ADJ-001 | UI | Wave | P1 | SO Detail — section render read-only (không có TextField) | Mock SO Detail widget với allocation data; C1 | 1. Pump `InsuranceAllocationSection(readOnly: true, data: mockAlloc)`.<br>2. `expect(find.byType(TextField), findsNothing)`.<br>3. `expect(find.text('Chiết khấu liên kết BH - Vật tư'), findsOneWidget)`. | - Section render read-only: không có `TextField`.<br>- Wording label tiếng Việt "Chiết khấu liên kết BH - Vật tư" hiển thị. | BLOCKED | N/A |
| TC-MUI-005 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | §2.2 PKG, Figma node 397:23265 | UI | Wave | P1 | Section là inline Card trong Body — KHÔNG BottomSheet, KHÔNG drag handle | Mock SO Edit; C1 | 1. Pump SO Edit (`isEdit: true`, BH=Có).<br>2. `expect(find.byType(BottomSheet), findsNothing)`.<br>3. `expect(find.byType(InsuranceAllocationSection), findsOneWidget)` (in body scroll). | - Không có `BottomSheet` widget.<br>- `InsuranceAllocationSection` là inline widget trong scroll body. | BLOCKED | N/A |
| TC-MUI-006 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | §2.2 PKG, Figma `397:24005` | UI | Wave | P2 | Golden: section "Phân bổ quyết toán bảo hiểm" panel nhập — layout + spacing + tokens vs oracle 375×822 | Alchemist harness; Roboto font bundled; mock data default (giá trị 0); C2 | 1. `goldenTest('ins_so_adj_panel_input_default', fileName: 'ins_so_adj_panel_input_default.png', builder: () => MaterialApp(home: InsuranceAllocationSection(...)))`.<br>2. Verify container padding = `EdgeInsets.all(16)`.<br>3. Verify text "Phân bổ quyết toán bảo hiểm" 18sp/w700 color `#262626`.<br>4. Pixel diff threshold = 0. | - Golden PNG sinh ra byte-identical với baseline.<br>- Section header "Phân bổ quyết toán bảo hiểm" color `#262626` 18sp w700.<br>- Container padding `EdgeInsets.all(16)`.<br>- TextField border 1px `#d1d1d1` radius 8. | BLOCKED-by-harness | N/A |
| TC-MUI-007 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-3,4,5,6,7, Figma Text §Panel nhập | UI | Wave | P1 | Wording 5 label tiếng Việt đúng oracle: "Chiết khấu liên kết BH - Vật tư", "Chiết khấu liên kết BH - Công dịch vụ", "Khấu hao vật tư / thay mới", "Giảm trừ bồi thường ", "Khấu trừ bảo hiểm" | Mock SO Edit BH=Có; AppLocalizations vi thật; C1 | 1. Pump `InsuranceAllocationSection(readOnly: false)`.<br>2. `expect(find.text('Chiết khấu liên kết BH - Vật tư'), findsOneWidget)`.<br>3. `expect(find.text('Chiết khấu liên kết BH - Công dịch vụ'), findsOneWidget)`.<br>4. `expect(find.text('Khấu hao vật tư / thay mới'), findsOneWidget)`.<br>5. `expect(find.text('Giảm trừ bồi thường '), findsOneWidget)` — trailing space per oracle.<br>6. `expect(find.text('Khấu trừ bảo hiểm'), findsOneWidget)`. | - Tất cả 5 label render đúng wording oracle tiếng Việt.<br>- Oracle ghi "Giảm trừ bồi thường " có trailing space — assert literal per oracle (flag wording drift nếu impl dùng trimmed version). | BLOCKED | N/A |
| TC-MUI-008 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-3..7, AC-14 | UI | Wave | P2 | Wording placeholder "Nhập chiết khấu" chung cho 5 field; helper text AC-3 "Khoản garage giảm trừ..." | Mock SO Edit BH=Có; AppLocalizations vi; C1 | 1. Pump InsuranceAllocationSection.<br>2. Với field CK VT: `expect(find.widgetWithText(TextField, 'Nhập chiết khấu'), findsWidgets)` (≥5).<br>3. `expect(find.text('Khoản garage giảm trừ cho doanh nghiệp bao hiểm trên phần vật tư/phụ tùng'), findsOneWidget)`. | - Placeholder "Nhập chiết khấu" render đúng oracle (chung 5 field).<br>- Helper text AC-3 render đúng (NOTE: oracle typo "bao hiểm" — assert literal oracle, flag wording defect nếu impl sửa typo). | BLOCKED | N/A |
| TC-MUI-009 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-3, BR-INS-SO-ADJ-002, Figma Variant AC-3 VNĐ+caret | UI | Wave | P1 | Unit selector CK VT: mặc định "VNĐ" với dropdown caret; unit selector AC-5 Khấu hao = "%" fixed (no caret) | Mock SO Edit BH=Có; C1 | 1. Pump InsuranceAllocationSection.<br>2. Với field CK VT: `expect(find.text('VNĐ'), findsAtLeastNWidgets(1))` + `expect(find.byIcon(Icons.arrow_drop_down), findsAtLeastNWidgets(1))`.<br>3. Với field Khấu hao: `expect(find.text('%'), findsOneWidget)` + `expect(find.byKey(Key('khauHao_unit_dropdown')), findsNothing)` (no caret/dropdown). | - CK VT default unit = "VNĐ" với dropdown caret render.<br>- Khấu hao unit = "%" fixed, không có dropdown caret (chỉ % theo AC-5/BR-004). | BLOCKED | N/A |

### 4B — FEAT-INS-SO-ADJUSTMENT: Trường CK liên kết BH - Vật tư (field validation)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-010 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-3, BR-INS-SO-ADJ-002 | UI | Wave | P1 | CK VT — default state: value=0, unit=VNĐ, editable | C1; mock SO Edit BH=Có | 1. Pump InsuranceAllocationSection.<br>2. Tìm field Key('discountMaterial').<br>3. `expect(tester.widget<TextField>(find.byKey(Key('discountMaterial'))).controller.text, equals('0'))`.<br>4. Verify unit chip hiển thị "VNĐ". | - Field giá trị mặc định "0", unit "VNĐ", không disabled. | BLOCKED | N/A |
| TC-MUI-011 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-3 | UI | Wave | P1 | CK VT — tap "%" → mode chuyển sang %, helper text cập nhật | C1; mock SO Edit | 1. Pump InsuranceAllocationSection.<br>2. `tester.tap(find.byKey(Key('discountMaterial_percentToggle')))`.<br>3. `tester.pump()`.<br>4. `expect(find.byKey(Key('discountMaterial_unitPercent')), findsOneWidget)`. | - Unit selector chuyển sang "%" mode.<br>- BLoC emit mode=PERCENT. | BLOCKED | N/A |
| TC-MUI-012 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-3 (happy AMOUNT) | UI | Wave | P1 | CK VT — nhập số tiền hợp lệ 5000000, blur → BLoC nhận value | C1; mock cubit | 1. `tester.enterText(find.byKey(Key('discountMaterial')), '5000000')`.<br>2. `tester.pump()`.<br>3. Verify cubit.state.discountMaterialValue == 5000000. | - BLoC state cập nhật discountMaterialValue = 5000000. | BLOCKED | N/A |
| TC-MUI-013 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-14, INS_ADJ_VALUE_NEGATIVE | UI | Wave | P1 | CK VT — bỏ trống rồi blur | C1 | 1. Xóa hết text field CK VT.<br>2. `tester.testTextInput.receiveAction(TextInputAction.done)`.<br>3. Kiểm tra error text. | - Field trả về 0 (treat as default) HOẶC error "Vui lòng nhập giá trị từ 0 trở lên" theo AC chốt. | BLOCKED | N/A |
| TC-MUI-014 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-14 | UI | Wave | P2 | CK VT — nhập only space → treat as 0/reject | C1 | 1. `tester.enterText(find.byKey(Key('discountMaterial')), '   ')`.<br>2. Blur.<br>3. Kiểm tra giá trị field và error state. | - Trim → xử như 0 HOẶC reject; không persist chuỗi trắng. | BLOCKED | N/A |
| TC-MUI-015 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-14, INS_ADJ_VALUE_NEGATIVE | UI | Wave | P1 | CK VT — nhập chữ "abc" → chặn nhập / báo format sai | C1 | 1. `tester.enterText(find.byKey(Key('discountMaterial')), 'abc')`.<br>2. `tester.pump()`.<br>3. `expect(find.descendant(of: find.byKey(Key('discountMaterial_field')), matching: find.byType(Text).where(t => t.data?.contains('Định dạng') ?? false)), findsOneWidget)` HOẶC field không nhận ký tự chữ (InputFormatter). | - Ký tự chữ bị chặn bởi `TextInputFormatter` HOẶC error message "Định dạng không hợp lệ" render. | BLOCKED | N/A |
| TC-MUI-016 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-14, INS_ADJ_VALUE_NEGATIVE | UI | Wave | P1 | CK VT — nhập số âm -100000 → error "Vui lòng nhập giá trị từ 0 trở lên" | C1 | 1. `tester.enterText(find.byKey(Key('discountMaterial')), '-100000')`.<br>2. Blur.<br>3. `expect(find.text('Vui lòng nhập giá trị từ 0 trở lên.'), findsOneWidget)`. | - Error message "Vui lòng nhập giá trị từ 0 trở lên." render đúng AC-14 error code `INS_ADJ_VALUE_NEGATIVE`. | BLOCKED | N/A |
| TC-MUI-017 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-14, INS_ADJ_PERCENT_OUT_OF_RANGE | UI | Wave | P1 | CK VT mode % — nhập 110 → error "Tỷ lệ phần trăm chỉ được nhập từ 0 đến 100" | C1; mode=% | 1. Tap "%" toggle field CK VT.<br>2. `tester.enterText(..., '110')`.<br>3. Blur.<br>4. `expect(find.text('Tỷ lệ phần trăm chỉ được nhập từ 0 đến 100.'), findsOneWidget)`. | - Error "Tỷ lệ phần trăm chỉ được nhập từ 0 đến 100." per AC-14 `INS_ADJ_PERCENT_OUT_OF_RANGE`. | BLOCKED | N/A |
| TC-MUI-018 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-14 boundary % | UI | Wave | P1 | CK VT mode % — nhập đúng cận 100 → chấp nhận | C1; mode=% | 1. Tap "%" toggle.<br>2. `tester.enterText(..., '100')`.<br>3. Blur.<br>4. `expect(find.byType(Text).where(t => t.data?.contains('Tỷ lệ') ?? false), findsNothing)`. | - Không có error message "Tỷ lệ...". BLoC nhận giá trị 100. | BLOCKED | N/A |
| TC-MUI-019 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-14, INS_ADJ_PERCENT_OUT_OF_RANGE | UI | Wave | P2 | CK VT mode % — nhập âm -5 → error số âm (không phải % out-of-range) | C1; mode=% | 1. Tap "%" toggle.<br>2. `tester.enterText(..., '-5')`.<br>3. Blur.<br>4. `expect(find.text('Vui lòng nhập giá trị từ 0 trở lên.'), findsOneWidget)`. | - Error "Vui lòng nhập giá trị từ 0 trở lên." (số âm). | BLOCKED | N/A |
| TC-MUI-020 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-14, AC-3 boundary AMOUNT | UI | Wave | P2 | CK VT mode VNĐ — nhập số 0 (cận dưới hợp lệ) → chấp nhận | C1 | 1. Nhập "0" mode VNĐ.<br>2. Blur.<br>3. Không có error message. | - Giá trị 0 hợp lệ, không error (cận dưới cho phép). | BLOCKED | N/A |
| TC-MUI-021 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-14, INS_ADJ_AMOUNT_EXCEEDS_BASE | UI | Wave | P2 | CK VT mode VNĐ — nhập số > cơ sở Cộng sau VAT vật tư BH → error "Số tiền vượt quá mức cho phép" | C1; seed: cơ sở VT BH = 5.000.000 | 1. Nhập "10000000" (> 5.000.000).<br>2. Blur / submit.<br>3. `expect(find.text('Số tiền vượt quá mức cho phép'), findsOneWidget)`. | - Error "Số tiền vượt quá mức cho phép" per AC-14 `INS_ADJ_AMOUNT_EXCEEDS_BASE`. | BLOCKED | N/A |
| TC-MUI-022 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-14 | UI | Wave | P2 | CK VT — paste text rác "5tr" → chặn/strip | C1/C3 | 1. Paste "5tr" vào field CK VT.<br>2. Verify field value sau paste. | - "5tr" bị strip bởi InputFormatter (chỉ chấp nhận ký tự số) HOẶC error format sai. Không persist "5tr". | BLOCKED | N/A |

### 4C — FEAT-INS-SO-ADJUSTMENT: Trường CK Công dịch vụ (AC-4)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-023 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-4 | UI | Wave | P1 | CK Công DV — default state VNĐ, placeholder "Nhập chiết khấu", helper đúng oracle | C1 | 1. Pump InsuranceAllocationSection.<br>2. `expect(find.text('Chiết khấu liên kết BH - Công dịch vụ'), findsOneWidget)`.<br>3. Verify unit "VNĐ" dropdown caret present cho field này.<br>4. `expect(find.text('Khoản garage giảm trừ cho doanh nghiệp bao hiểm trên phần công sửa chữa'), findsOneWidget)`. | - Label, unit, helper đúng oracle. | BLOCKED | N/A |
| TC-MUI-024 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-4, AC-14 | UI | Wave | P1 | CK Công DV — số âm → error "Vui lòng nhập giá trị từ 0 trở lên" | C1 | 1. Nhập "-1" vào field CK Công DV.<br>2. Blur.<br>3. `expect(find.text('Vui lòng nhập giá trị từ 0 trở lên.'), findsOneWidget)`. | - Error render đúng. | BLOCKED | N/A |
| TC-MUI-025 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-4 mode % | UI | Wave | P1 | CK Công DV mode % — nhập 110 → error % > 100 | C1 | 1. Tap "%" cho CK Công DV.<br>2. Nhập "110", blur.<br>3. `expect(find.text('Tỷ lệ phần trăm chỉ được nhập từ 0 đến 100.'), findsOneWidget)`. | - Error render đúng. | BLOCKED | N/A |

### 4D — FEAT-INS-SO-ADJUSTMENT: Trường Khấu hao vật tư (AC-5)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-026 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-5, BR-INS-SO-ADJ-004 | UI | Wave | P1 | Khấu hao — label "Khấu hao vật tư / thay mới", unit "%" fixed no caret, helper đúng oracle | C1 | 1. Pump InsuranceAllocationSection.<br>2. `expect(find.text('Khấu hao vật tư / thay mới'), findsOneWidget)`.<br>3. Verify unit = '%' no dropdown.<br>4. `expect(find.text('Tỷ lệ khấu hao vật tư do KH chịu. Có thể áp dụng đồng loạt hoặc chỉnh riêng từng dòng phụ tùng.'), findsOneWidget)`. | - Label, unit (%), helper đúng oracle. Không có dropdown caret. | BLOCKED | N/A |
| TC-MUI-027 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-5, AC-14 | UI | Wave | P1 | Khấu hao header — nhập âm → error | C1 | 1. Nhập "-10" vào field Khấu hao header.<br>2. Blur. | - Error "Vui lòng nhập giá trị từ 0 trở lên." | BLOCKED | N/A |
| TC-MUI-028 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-14, INS_ADJ_PERCENT_OUT_OF_RANGE | UI | Wave | P1 | Khấu hao header — nhập 110 → error "Tỷ lệ phần trăm chỉ được nhập từ 0 đến 100" | C1 | 1. Nhập "110" vào field Khấu hao header.<br>2. Blur.<br>3. `expect(find.text('Tỷ lệ phần trăm chỉ được nhập từ 0 đến 100.'), findsOneWidget)`. | - Error render đúng. | BLOCKED | N/A |
| TC-MUI-029 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-5, AC-14 | UI | Wave | P2 | Khấu hao per-line — nhập âm vào dòng PT-1 → error inline dòng PT-1 | C1; seed: 2 PT BH | 1. Tìm cột Khấu hao PT-1 (`find.byKey(Key('depreciation_line_PT1')`)).<br>2. Nhập "-5", blur.<br>3. Verify error chỉ dòng PT-1. | - Error inline tại dòng PT-1; dòng PT-2 không bị ảnh hưởng. | BLOCKED | N/A |
| TC-MUI-030 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | EC-1, BR-INS-SO-ADJ-004 | UI | Wave | P2 | SO không có phụ tùng BH — Khấu hao field disabled hoặc ẩn | C1; seed: SO chỉ có DV BH | 1. Pump InsuranceAllocationSection với mock data 0 PT BH.<br>2. `expect(find.byKey(Key('khauHaoSection')), findsNothing)` HOẶC `expect(tester.widget<TextField>(find.byKey(Key('depreciation'))).enabled, isFalse)`. | - Field Khấu hao disabled hoặc ẩn khi không có PT BH (EC-1). | BLOCKED | N/A |

### 4E — FEAT-INS-SO-ADJUSTMENT: Trường Giảm trừ bồi thường (AC-6)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-031 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-6 | UI | Wave | P1 | Giảm trừ BT — default VNĐ dropdown caret, helper đúng oracle | C1 | 1. Pump InsuranceAllocationSection.<br>2. `expect(find.text('Giảm trừ bồi thường '), findsOneWidget)` (trailing space per oracle).<br>3. Verify unit "VNĐ" + dropdown caret cho field này.<br>4. `expect(find.text('Khoản loại trừ hoặc giảm bồi thường theo quy tắc/hồ sơ bảo hiểm, chuyển sang KH chi trả'), findsOneWidget)`. | - Label (trailing space), unit, helper đúng oracle. | BLOCKED | N/A |
| TC-MUI-032 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-6, AC-14 | UI | Wave | P1 | Giảm trừ BT — nhập âm → error | C1 | Nhập "-5000" vào field Giảm trừ BT, blur. | - Error "Vui lòng nhập giá trị từ 0 trở lên." | BLOCKED | N/A |
| TC-MUI-033 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-6 mode % | UI | Wave | P1 | Giảm trừ BT mode % — nhập 101 → error % > 100 | C1 | Tap "%" toggle Giảm trừ, nhập "101", blur. | - Error "Tỷ lệ phần trăm chỉ được nhập từ 0 đến 100." | BLOCKED | N/A |

### 4F — FEAT-INS-SO-ADJUSTMENT: Trường Khấu trừ bảo hiểm (AC-7)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-034 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-7, BR-INS-SO-ADJ-003 | UI | Wave | P1 | Khấu trừ BH — chỉ TextField VNĐ, KHÔNG có SegmentedButton toggle % | C1 | 1. Pump InsuranceAllocationSection.<br>2. `expect(find.text('Khấu trừ bảo hiểm'), findsOneWidget)`.<br>3. `expect(find.byKey(Key('khauTru_percentToggle')), findsNothing)` (không có toggle %).<br>4. Verify unit = "VNĐ" tĩnh (không dropdown caret). | - Không có SegmentedButton toggle % cho trường Khấu trừ BH (chỉ VNĐ theo BR-003). | BLOCKED | N/A |
| TC-MUI-035 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-7, AC-14 | UI | Wave | P1 | Khấu trừ BH — nhập âm → error "Vui lòng nhập giá trị từ 0 trở lên" | C1 | Nhập "-100", blur. | - Error "Vui lòng nhập giá trị từ 0 trở lên." render đúng. | BLOCKED | N/A |
| TC-MUI-036 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-7 helper oracle | UI | Wave | P2 | Khấu trừ BH — helper text "Khoản khấu trừ bảo hiểm theo hợp đồng mà KH phải tự thanh toán" | C1 | `expect(find.text('Khoản khấu trừ bảo hiểm theo hợp đồng mà KH phải tự thanh toán'), findsOneWidget)`. | - Helper text đúng oracle. | BLOCKED | N/A |

### 4G — FEAT-INS-SO-ADJUSTMENT: Nút "Áp dụng tất cả" (AC-8)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-044 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-8 | UI | Wave | P1 | Nút "Áp dụng tất cả" — tap → set khấu hao đồng loạt tất cả PT BH = x% | C1; seed 3 PT BH | 1. Nhập "5" vào field Khấu hao header.<br>2. `tester.tap(find.text('Áp dụng tất cả'))`.<br>3. `tester.pumpAndSettle()`.<br>4. Verify cả 3 dòng PT BH có depreciation_percent = 5. | - Tất cả 3 PT BH set = 5%. BLoC emit state mới với per-line values = 5. | BLOCKED | N/A |
| TC-MUI-045 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-8 — nút button state | UI | Wave | P2 | Nút "Áp dụng tất cả" — wording, bg `#eaeaea`, full-width, ink ripple khi tap | C1/C2 | 1. `expect(find.text('Áp dụng tất cả'), findsOneWidget)`.<br>2. Verify button bg color = `Color(0xFFEAEAEA)` per oracle.<br>3. Tap button → `tester.pump(Duration(milliseconds: 100))` → verify ink ripple (InkSplash). | - Wording "Áp dụng tất cả" đúng oracle.<br>- Bg `#eaeaea` per oracle Design Tokens.<br>- Ink ripple khi tap. | BLOCKED | N/A |
| TC-MUI-046 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-8, debounce | UI | Wave | P2 | Nút "Áp dụng tất cả" — double-tap trong 500ms → chỉ 1 event fire | C1 | 1. Tap "Áp dụng tất cả" 2 lần trong 500ms.<br>2. Verify cubit.applyAll() call count = 1 (spy/capture). | - Debounce: chỉ 1 call applyAll. | BLOCKED | N/A |
| TC-MUI-047 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-8, BR-INS-SO-ADJ-004 | UI | Wave | P2 | Nút "Áp dụng tất cả" touch target ≥ 48dp | C1 | `expect(tester.getSize(find.text('Áp dụng tất cả')).height, greaterThanOrEqualTo(48))`. | - Button height ≥ 48dp (a11y). | BLOCKED | N/A |

### 4H — FEAT-INS-SO-ADJUSTMENT: Panel "Tổng giá dịch vụ" + SegmentedButton

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-040 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-9, Figma `400:23409` | UI | Wave | P1 | Panel "Tổng giá DV" — tab "KH thanh toán" active: bảng "Chi tiết theo bên thanh toán" 4 dòng Dịch vụ/Phụ tùng/VAT/Cộng sau VAT | C1; mock data với 4 dòng | 1. Pump panel TotalServicePricePanel với tab KH active.<br>2. `expect(find.text('Chi tiết theo bên thanh toán'), findsOneWidget)`.<br>3. `expect(find.text('Dịch vụ '), findsOneWidget)` (trailing space oracle).<br>4. `expect(find.text('Phụ tùng '), findsOneWidget)`.<br>5. `expect(find.text('VAT '), findsOneWidget)`.<br>6. `expect(find.text('Cộng sau VAT '), findsOneWidget)`. | - Bảng render đúng 4 dòng với wording oracle (trailing space per oracle). Tab KH active. | BLOCKED | N/A |
| TC-MUI-041 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-9, Figma SegmentedButton | UI | Wave | P1 | SegmentedButton "KH thanh toán" / "BH thanh toán" — tap BH → tab switch, dòng Cần thanh toán đổi sang "Bảo hiểm thanh toán" | C1 | 1. Pump panel với tab KH active.<br>2. `tester.tap(find.text('BH thanh toán'))`.<br>3. `tester.pumpAndSettle()`.<br>4. `expect(find.text('Bảo hiểm thanh toán'), findsOneWidget)`.<br>5. `expect(find.text('Khách hàng thanh toán'), findsNothing)`. | - Sau tap "BH thanh toán": dòng Cần thanh toán = "Bảo hiểm thanh toán". Tab active đổi sang BH. | BLOCKED | N/A |
| TC-MUI-042 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | Figma SegmentedButton Variant, Design Tokens | UI | Wave | P2 | SegmentedButton — token màu: track bg `#f3f4f6`, pill active bg `#ffffff`, text active `#0052ff`, text inactive `#595e69` | C2 golden | `goldenTest('ins_so_adj_segmented_button', fileName: 'ins_so_adj_segmented_btn.png', builder: () => TotalServicePricePanel(activeTab: KH))`.<br>Verify colors per oracle. | - Golden pixel-identical với baseline; token màu đúng oracle. | BLOCKED-by-harness | N/A |
| TC-MUI-043 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-11, Figma `400:23120` | UI | Wave | P1 | Panel "Tổng giá DV" tab BH active — "Bảo hiểm thanh toán" row + ô "Tổng thanh toán" highlight `#f3f3f4` | C1 | 1. Pump panel với tab BH active.<br>2. `expect(find.text('Bảo hiểm thanh toán'), findsOneWidget)`.<br>3. `expect(find.text('Tổng thanh toán'), findsOneWidget)`.<br>4. Verify container Tổng thanh toán bg = `Color(0xFFF3F3F4)` + padding `EdgeInsets.all(12)`. | - "Bảo hiểm thanh toán" render. "Tổng thanh toán" bg `#f3f3f4`, padding 12. | BLOCKED | N/A |
| TC-MUI-048 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-10, notes wording | UI | Wave | P2 | Card "Phân bổ bảo hiểm" summary — 5 label đúng oracle: "CK liên kết BH — Vật tư" (em dash), "CK liên kết BH — Công dịch vụ", "Giảm trừ bồi thường", "Khấu hao vật tư / thay mới", "Khấu trừ BH" | C1 | 1. Pump InsuranceAllocationSummaryCard (read-only).<br>2. `expect(find.text('CK liên kết BH — Vật tư'), findsOneWidget)` (em dash "—").<br>3. `expect(find.text('CK liên kết BH — Công dịch vụ'), findsOneWidget)`.<br>4. `expect(find.text('Giảm trừ bồi thường'), findsOneWidget)`.<br>5. `expect(find.text('Khấu hao vật tư / thay mới'), findsOneWidget)`.<br>6. `expect(find.text('Khấu trừ BH'), findsOneWidget)`. | - 5 label summary đúng oracle (em dash, không hyphen). | BLOCKED | N/A |

### 4I — FEAT-INS-SO-ADJUSTMENT: BLoC state machine + realtime preview

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-049 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | BR-INS-SO-ADJ-007 | UI | Wave | P1 | BLoC — InsuranceAllocationCubit Initial → LoadingData → Success khi load allocation | C1; `blocTest` | `blocTest<InsuranceAllocationCubit, InsuranceAllocationState>('emits Loading then Success', build: () => cubit, act: (c) => c.loadAllocation('SO-001'), expect: () => [InsuranceAllocationLoading(), InsuranceAllocationSuccess(...)])`. | - BLoC emit sequence: Loading trước, Success sau (không skip). | BLOCKED | N/A |
| TC-MUI-050 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | BR-INS-SO-ADJ-007 | UI | Wave | P1 | BLoC — Error state khi API fail 500 | C1; `blocTest`; mock repo throw | `blocTest(... act: (c) => c.loadAllocation('SO-BAD'), expect: () => [InsuranceAllocationLoading(), InsuranceAllocationError(...)])`. | - Emit Loading → Error (không crash). | BLOCKED | N/A |
| TC-MUI-051 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-11, BR-INS-SO-ADJ-005, BR-INS-SO-ADJ-007 | UI | Wave | P1 | BLoC — nhập 5 khoản theo ví dụ epic → preview BH=197.680.000, KH=35.720.000, Tổng=233.400.000 | C1; `blocTest`; seed theo BR-005 worked example | `blocTest(... act: (c) { c.setDiscountMaterial(AmountMode.AMOUNT, 5000000); c.setDiscountLabor(AmountMode.AMOUNT, 2500000); c.setClaimReduction(AmountMode.AMOUNT, 2000000); c.setDepreciationDefault(200000); c.setDeductible(520000); }, expect: () => [..., InsuranceAllocationSuccess(bhPayment: 197680000, khPayment: 35720000, total: 233400000)])`. | - BH thanh toán = 197.680.000đ, KH thanh toán = 35.720.000đ, Tổng = 233.400.000đ đúng công thức BR-005. | BLOCKED | N/A |
| TC-MUI-052 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-12, INS_ADJ_BH_PAYMENT_NEGATIVE | UI | Wave | P2 | BLoC — khi BH thanh toán < 0 → emit state warning, không block (cho lưu) | C1; `blocTest`; input vượt cơ sở | `blocTest(... act: (c) => c.setDiscountMaterial(AmountMode.AMOUNT, 999999999), expect: () => [..., InsuranceAllocationNegativeWarning(message: 'Số tiền bảo hiểm thanh toán đang nhỏ hơn 0. Vui lòng kiểm tra lại các khoản điều chỉnh.')])`. | - BLoC emit warning (không Error state blocking). Message "Số tiền bảo hiểm thanh toán đang nhỏ hơn 0. Vui lòng kiểm tra lại các khoản điều chỉnh." per AC-12 `INS_ADJ_BH_PAYMENT_NEGATIVE`. | BLOCKED | N/A |
| TC-MUI-053 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | BR-INS-SO-ADJ-006 | UI | Wave | P2 | BLoC — toggle off BH=Không → section ẩn, allocation state cleared | C1; widget test | 1. SO Edit BH=Có, nhập allocation.<br>2. Tap toggle BH=Không.<br>3. `tester.pumpAndSettle()`.<br>4. `expect(find.byType(InsuranceAllocationSection), findsNothing)`.<br>5. Verify cubit state = cleared/empty. | - Section ẩn ngay khi toggle Không. State cubit = cleared. | BLOCKED | N/A |
| TC-MUI-054 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | EC-3, EC-5 | UI | Wave | P2 | BLoC — toggle off BH→on lại → fields reset về 0 (không stale state từ trước) | C1 | 1. Nhập CK VT = 5000000, toggle BH=Không.<br>2. Toggle BH=Có.<br>3. `expect(tester.widget<TextField>(...).controller.text, equals('0'))`. | - Field CK VT = 0 (không restore giá trị cũ đã xóa). | BLOCKED | N/A |
| TC-MUI-055 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | BLoC Loading UI state | UI | Wave | P1 | Widget — Loading state render CircularProgressIndicator trong section | C1 | 1. Mock cubit emit InsuranceAllocationLoading().<br>2. `expect(find.byType(CircularProgressIndicator), findsOneWidget)`.<br>3. `expect(find.bySemanticsLabel('Đang tải'), findsOneWidget)`. | - CircularProgressIndicator render khi loading. Semantics label "Đang tải" cho a11y. | BLOCKED | N/A |
| TC-MUI-056 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | BLoC Error state UI | UI | Wave | P1 | Widget — Error state render error banner + retry button | C1 | 1. Mock cubit emit InsuranceAllocationError(message: 'Lỗi tải phân bổ').<br>2. `expect(find.text('Lỗi tải phân bổ'), findsOneWidget)`.<br>3. `expect(find.text('Thử lại'), findsOneWidget)`. | - Error banner + retry button render. | BLOCKED | N/A |
| TC-MUI-057 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-13, EC-5 | UI | Wave | P1 | Flow — Save allocation → navigate SO Detail read-only (pumpAndSettle) | C3-BLOCKED; Patrol | 1. SO Edit, nhập CK VT=5000000.<br>2. `$.tap(find.text('Lưu'))`.<br>3. `$.pumpAndSettle()`.<br>4. `expect($('Chiết khấu liên kết BH - Vật tư'), findsOneWidget)` (read-only mode).<br>5. Verify không có TextField. | - Sau Save thành công: navigate SO Detail, section render read-only. Không trống (stale-state clear). | BLOCKED-by-harness | N/A |

### 4J — FEAT-INS-SO-ADJUSTMENT: Cross-field + toggle BH (AC-0, AC-1)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-058 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-0, AC-1 — dependency | UI | Wave | P1 | Cross-field: toggle BH=Không → tất cả field bị ẩn/disabled (dependency) | C1 | 1. SO Edit BH=Có → InsuranceAllocationSection render.<br>2. Tap toggle BH=Không.<br>3. `tester.pumpAndSettle()`.<br>4. `expect(find.byType(InsuranceAllocationSection), findsNothing)`. | - Section (toàn bộ 5 field + nút) ẩn khi toggle BH=Không (dependency cross-field). | BLOCKED | N/A |
| TC-MUI-059 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-16, BR-INS-SO-ADJ-001 | UI | Wave | P1 | Role-based: cả accountant và garage-owner đều thấy và nhập được section | C1; persona=accountant + persona=garage-owner | 1. Pump SO Edit với role=accountant → `expect(find.byType(InsuranceAllocationSection), findsOneWidget)`.<br>2. Pump SO Edit với role=garage-owner → `expect(find.byType(InsuranceAllocationSection), findsOneWidget)`. | - Section render và không disabled với cả 2 persona. | BLOCKED | N/A |

### 4K — FEAT-INS-STL-DETAIL: Screen layout, AppBar, tabs (AC-1, AC-4)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-060 | FEAT-INS-STL-DETAIL | garage-mobile | AC-1, AC-4, Figma `407:17089` | UI | Wave | P1 | Golden: toàn màn InsuranceSettlementDetailScreen — tab Bảng chi phí active vs oracle 375×1856 | C2 golden; mock data `#SET-W01-INS-001` | `goldenTest('ins_stl_detail_full', fileName: 'ins_stl_detail_full.png', builder: () => MaterialApp(home: InsuranceSettlementDetailScreen(settlementId: 'SET-W01-INS-001')))`. | - Golden sinh ra byte-identical baseline. Màn render đúng layout tổng. | BLOCKED-by-harness | N/A |
| TC-MUI-061 | FEAT-INS-STL-DETAIL | garage-mobile | AC-1, Figma AppBar `407:17219` | UI | Wave | P1 | AppBar — title "Chi tiết phiếu quyết toán", back button, overflow 3-dot | C1 | 1. Pump `InsuranceSettlementDetailScreen`.<br>2. `expect(find.text('Chi tiết phiếu quyết toán'), findsOneWidget)` (AppBar title per oracle).<br>3. `expect(find.byType(BackButton), findsOneWidget)` hoặc `find.byIcon(Icons.arrow_back)`.<br>4. `expect(find.byType(PopupMenuButton), findsOneWidget)` (overflow 3-dot). | - AppBar title "Chi tiết phiếu quyết toán" đúng oracle.<br>- Back button + overflow 3-dot render. | BLOCKED | N/A |
| TC-MUI-062 | FEAT-INS-STL-DETAIL | garage-mobile | AC-1, Figma `410:28748`, Design Tokens header | UI | Wave | P1 | Golden: header group mã phiếu + badge + info rows | C2 golden | `goldenTest('ins_stl_detail_header', fileName: 'ins_stl_detail_header.png', builder: () => InsuranceSettlementDetailHeader(code: '#PHDV-240923-001', status: 'Đã thanh toán', ...))`. Verify mã phiếu 18sp/w700 `#0052ff`. | - Golden header đúng oracle tokens. | BLOCKED-by-harness | N/A |
| TC-MUI-063 | FEAT-INS-STL-DETAIL | garage-mobile | AC-4, Figma `407:19398` | UI | Wave | P1 | 4 tab render đúng wording: "Bảng chi phí", "Chứng từ & hoá đơn", "Hồ sơ bảo hiểm đã xuất", "Lịch sử thanh toán" | C1; AppLocalizations vi | 1. Pump `InsuranceSettlementDetailScreen`.<br>2. `expect(find.text('Bảng chi phí'), findsOneWidget)`.<br>3. `expect(find.text('Chứng từ & hoá đơn'), findsOneWidget)` (FEAT AC-4 dùng "hoá đơn" — verify vs oracle "hóa đơn"; assert FEAT wording).<br>4. `expect(find.text('Hồ sơ bảo hiểm đã xuất'), findsOneWidget)`.<br>5. `expect(find.text('Lịch sử thanh toán'), findsOneWidget)`. | - 4 tab render đúng wording FEAT (flag nếu impl dùng "hóa đơn" khác FEAT "hoá đơn"). Tab "Bảng chi phí" active khi mở. | BLOCKED | N/A |
| TC-MUI-064 | FEAT-INS-STL-DETAIL | garage-mobile | AC-4 | UI | Wave | P1 | Tab "Bảng chi phí" active mặc định khi mở màn | C1 | 1. Pump `InsuranceSettlementDetailScreen`.<br>2. Verify tab "Bảng chi phí" là selected/active (kiểm tra TabController.index == 0 hoặc `expect(find.byKey(Key('tab_bangchiphi_active')), findsOneWidget)`). | - Tab "Bảng chi phí" active ngay khi mở. | BLOCKED | N/A |

### 4L — FEAT-INS-STL-DETAIL: Tab "Bảng chi phí" — bảng hạng mục (AC-5)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-064b | FEAT-INS-STL-DETAIL | garage-mobile | AC-5, Figma `407:19436` | UI | Wave | P2 | Tab Bảng chi phí — section "Dịch vụ thực hiện" và "Phụ tùng sử dụng" render đúng wording | C1 | 1. Pump tab Bảng chi phí với mock 2 dịch vụ + 2 phụ tùng.<br>2. `expect(find.text('Dịch vụ thực hiện'), findsOneWidget)`.<br>3. `expect(find.text('Phụ tùng sử dụng'), findsOneWidget)`. | - Section header wording đúng oracle. | BLOCKED | N/A |
| TC-MUI-065 | FEAT-INS-STL-DETAIL | garage-mobile | AC-6, AC-9, AC-10, Figma `407:19519` | UI | Wave | P1 | Panel "Tổng giá DV" trên tab Bảng chi phí — section "Phân bổ bảo hiểm" + "Tổng giá dịch vụ" render khi payerType=INSURANCE | C1 | 1. Pump `InsuranceSettlementDetailScreen(payerType: INSURANCE)`.<br>2. `expect(find.text('Phân bổ bảo hiểm'), findsOneWidget)`.<br>3. `expect(find.text('Tổng giá dịch vụ'), findsOneWidget)`.<br>4. `expect(find.text('Chi tiết theo bên thanh toán'), findsOneWidget)`.<br>5. `expect(find.text('Tổng thanh toán'), findsOneWidget)`. | - Cả 2 section render khi payerType=INSURANCE. Panel layout gồm Phân bổ BH + Tổng giá DV. | BLOCKED | N/A |
| TC-MUI-066 | FEAT-INS-STL-DETAIL | garage-mobile | AC-6, DEV NOTE — SegmentedButton toggle | UI | Wave | P2 | Panel "Tổng giá DV" — SegmentedButton toggle "KH thanh toán" / "BH thanh toán" tap switch dòng Cần thanh toán | C1 | 1. Pump panel với tab KH active.<br>2. `tester.tap(find.text('BH thanh toán'))`.<br>3. `tester.pumpAndSettle()`.<br>4. `expect(find.text('Bảo hiểm thanh toán'), findsOneWidget)`. | - Tap "BH thanh toán" → dòng "Cần thanh toán" = "Bảo hiểm thanh toán". | BLOCKED | N/A |
| TC-MUI-067 | FEAT-INS-STL-DETAIL | garage-mobile | AC-6, Figma `407:19519`, notes wording "Cần thanh toán" | UI | Wave | P2 | Panel "Tổng giá DV" — wording "Cần thanh toán" render (oracle) vs "Cân thanh toán" (FEAT AC-11) — flag wording drift | C1 | 1. Pump panel.<br>2. Verify label của row kết quả payment ("Cần thanh toán" oracle vs "Cân thanh toán" FEAT).<br>3. Log observation: wording "Cần thanh toán" khác FEAT AC-11 "Cân thanh toán" — cần BA confirm. | - Một trong 2 wording render. Flag observation: "Cần thanh toán" (oracle Figma) vs "Cân thanh toán" (FEAT) — wording không sync, cần BA xác nhận (không auto-FAIL, cần clarification). | BLOCKED | N/A |

### 4M — FEAT-INS-STL-DETAIL: Các tab còn lại (AC-7, AC-8, AC-9)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-068 | FEAT-INS-STL-DETAIL | garage-mobile | AC-4, AC-7 | UI | Wave | P2 | Tab "Chứng từ & hoá đơn" — tap chuyển tab, content không crash | C3-BLOCKED | `$.tap(find.text('Chứng từ & hoá đơn'))` → `$.pumpAndSettle()` → verify nội dung tab không crash. | - Tab chuyển không crash. Nội dung tab render (placeholder hoặc data). | BLOCKED-by-harness | N/A |
| TC-MUI-069 | FEAT-INS-STL-DETAIL | garage-mobile | AC-8 | UI | Wave | P2 | Tab "Hồ sơ bảo hiểm đã xuất" — render đúng (read-only list) | C3-BLOCKED | Switch sang tab "Hồ sơ bảo hiểm đã xuất" → verify nội dung render. | - Tab render không crash. | BLOCKED-by-harness | N/A |
| TC-MUI-070 | FEAT-INS-STL-DETAIL | garage-mobile | AC-9 | UI | Wave | P2 | Tab "Lịch sử thanh toán" — render bảng lịch sử | C1 | 1. Mock `InsurancePaymentHistoryBloc` với 2 bản ghi.<br>2. `expect(find.byType(ListView), findsWidgets)` trong tab Lịch sử thanh toán. | - Bảng lịch sử render. | BLOCKED | N/A |
| TC-MUI-075 | FEAT-INS-STL-DETAIL | garage-mobile | AC-4 | UI | Wave | P2 | Switching tab nhanh không crash + state per tab preserved | C3-BLOCKED | Switch nhanh giữa 4 tab 5 lần → verify không crash, không blank screen. | - App không crash khi switch tab rapid. | BLOCKED-by-harness | N/A |

### 4N — FEAT-INS-STL-DETAIL: Nút "Tạo hồ sơ bảo hiểm" + action bar (AC-13, AC-11)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-080 | FEAT-INS-STL-DETAIL | garage-mobile | AC-13, BR-INS-STL-DET-004, PKG §2.2 | UI | Wave | P1 | Nút "+ Tạo hồ sơ bảo hiểm" — disabled (greyed) trong W01 khi phiếu DRAFT | C1 | 1. Pump `InsuranceSettlementDetailScreen(payerType: INSURANCE, status: DRAFT)`.<br>2. `expect(tester.widget<ElevatedButton>(find.text('Tạo hồ sơ bảo hiểm')).onPressed, isNull)` hoặc verify button enabled=false. | - Nút disabled (onPressed=null hoặc enabled=false). | BLOCKED | N/A |
| TC-MUI-081 | FEAT-INS-STL-DETAIL | garage-mobile | AC-13, PKG §2.2 — SnackBar "Wave 2" | UI | Wave | P1 | Nút "Tạo hồ sơ bảo hiểm" disabled — tap → SnackBar "Tính năng sẽ available ở Wave 2" | C1/C3-BLOCKED | 1. Pump màn DRAFT.<br>2. `tester.tap(find.text('Tạo hồ sơ bảo hiểm'))`.<br>3. `tester.pumpAndSettle()`.<br>4. `expect(find.text('Tính năng sẽ available ở Wave 2'), findsOneWidget)`. | - SnackBar wording tiếng Việt "Tính năng sẽ available ở Wave 2" hiển thị sau tap disabled.<br>- Auto-dismiss ~3s. | BLOCKED | N/A |
| TC-MUI-082 | FEAT-INS-STL-DETAIL | garage-mobile | AC-11 — no cancel | UI | Wave | P1 | Phiếu QT BH — KHÔNG có nút Huỷ trong action bar | C1 | `expect(find.text('Huỷ phiếu'), findsNothing)` và `expect(find.text('Huỷ'), findsNothing)` trong action bar area. | - Không có nút Huỷ (AC-11 chốt 2026-06-08). | BLOCKED | N/A |
| TC-MUI-083 | FEAT-INS-STL-DETAIL | garage-mobile | DEV NOTE PKG conditional display | UI | Wave | P1 | Phiếu QT KH — `InsuranceAllocationPanel` + `TotalServicePricePanel` KHÔNG render | C1 | `pump InsuranceSettlementDetailScreen(payerType: CUSTOMER)` → `expect(find.byType(InsuranceAllocationPanel), findsNothing)` + `expect(find.byType(TotalServicePricePanel), findsNothing)`. | - 2 khối BH ẩn khi payerType=CUSTOMER. Layout còn lại (AppBar, 4 tab, action bar) vẫn render. | BLOCKED | N/A |
| TC-MUI-084 | FEAT-INS-STL-DETAIL | garage-mobile | DEV NOTE PKG — nút Tạo hồ sơ insurance-only | UI | Wave | P1 | Phiếu QT KH — nút "+ Tạo hồ sơ bảo hiểm" KHÔNG có | C1 | `pump InsuranceSettlementDetailScreen(payerType: CUSTOMER)` → `expect(find.text('Tạo hồ sơ bảo hiểm'), findsNothing)`. | - Nút Tạo hồ sơ BH không render với phiếu KH. | BLOCKED | N/A |
| TC-MUI-085 | FEAT-INS-STL-DETAIL | garage-mobile | DEV NOTE PKG — layout mới cho mọi loại phiếu | UI | Wave | P1 | Phiếu QT KH — layout mới (4 tab + AppBar + action bar) vẫn render đầy đủ | C1 | `pump InsuranceSettlementDetailScreen(payerType: CUSTOMER)` → `expect(find.byType(TabBar), findsOneWidget)` + `expect(find.text('Bảng chi phí'), findsOneWidget)` + action bar render. | - Layout mới áp dụng cho cả KH (không gate cả màn theo payerType). | BLOCKED | N/A |

### 4O — FEAT-INS-STL-DETAIL: BLoC state + network error

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-086 | FEAT-INS-STL-DETAIL | garage-mobile | BLoC Initial→Loading→Success | UI | Wave | P1 | BLoC — SettlementDetailBloc emit Loading → Success khi load phiếu INSURANCE | C1; `blocTest` | `blocTest(build: () => SettlementDetailBloc(repo: mockRepo), act: (b) => b.add(LoadSettlement('SET-W01-INS-001')), expect: () => [SettlementDetailLoading(), SettlementDetailSuccess(payerType: INSURANCE, ...)])`. | - Emit Loading trước, Success sau. | BLOCKED | N/A |
| TC-MUI-087 | FEAT-INS-STL-DETAIL | garage-mobile | BLoC Error state | UI | Wave | P1 | BLoC — Error state khi API 500 | C1 | `blocTest(... mock 500, expect: () => [SettlementDetailLoading(), SettlementDetailError(...)])`. | - Emit Loading → Error. | BLOCKED | N/A |
| TC-MUI-088 | FEAT-INS-STL-DETAIL | garage-mobile | AC-1, INS_STL_NOT_FOUND | UI | Wave | P1 | BLoC — Error state khi load ID không tồn tại → 404 → SettlementDetailError | C1 | `blocTest(... mock 404, expect: () => [SettlementDetailLoading(), SettlementDetailError(code: 'INS_STL_NOT_FOUND')])`. | - Emit Error với code `INS_STL_NOT_FOUND`. | BLOCKED | N/A |
| TC-MUI-089 | FEAT-INS-STL-DETAIL | garage-mobile | network error UI | UI | Wave | P2 | Widget — Error state UI render "Không tìm thấy phiếu quyết toán bảo hiểm" + retry button | C1 | 1. Mock emit `SettlementDetailError(code: 'INS_STL_NOT_FOUND')`.<br>2. `expect(find.text('Không tìm thấy phiếu quyết toán bảo hiểm.'), findsOneWidget)`.<br>3. `expect(find.text('Thử lại'), findsOneWidget)`. | - Error message "Không tìm thấy phiếu quyết toán bảo hiểm." + retry render. | BLOCKED | N/A |
| TC-MUI-090 | FEAT-INS-STL-DETAIL | garage-mobile | offline state | UI | Wave | P2 | Widget — offline state render empty/error screen thân thiện, không crash | C1; mock emit no-network error | 1. Mock emit network error state.<br>2. `expect(find.text('Không có kết nối mạng'), findsOneWidget)` hoặc error banner.<br>3. Không crash. | - Offline state UI thân thiện, không crash, không stack trace lộ ra. | BLOCKED | N/A |

### 4P — Navigation + Flow (C3-BLOCKED)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-091 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-13 route flow | UI | Regression | P1 | Flow: SO Edit → Save → navigate SO Detail (route push) | C3-BLOCKED; Patrol | `$.tap(find.text('Lưu'))` → `$.pumpAndSettle()` → `expect(find.byType(ServiceOrderDetailPage), findsOneWidget)`. | - Navigate SO Detail sau Save. Back button present. | BLOCKED-by-harness | N/A |
| TC-MUI-092 | FEAT-INS-STL-DETAIL | garage-mobile | back navigation | UI | Wave | P1 | Back button từ InsuranceSettlementDetailScreen → pop về list | C3-BLOCKED; Patrol | `$.tap(find.byType(BackButton))` → `$.pumpAndSettle()` → verify previous screen. | - Pop về màn trước. List/SO Detail restore. | BLOCKED-by-harness | N/A |
| TC-MUI-093 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | UI-MB02 — Android system back dirty | UI | Wave | P2 | Android hardware Back khi form dirty → confirm dialog trước khi exit | C3-BLOCKED; Patrol Android | `$.native.pressBack()` khi form dirty → `expect(find.byType(AlertDialog), findsOneWidget)`. | - AlertDialog confirm render khi dirty. "Huỷ" = no-op; "Xác nhận" = exit. | BLOCKED-by-harness | N/A |
| TC-MUI-094 | FEAT-INS-STL-DETAIL | garage-mobile | orientation | UI | Wave | P3 | Orientation rotate trên InsuranceSettlementDetailScreen — 4 tab không vỡ | C3-BLOCKED; Patrol | Rotate device ngang/dọc → verify 4 tab render, không overflow. | - Layout không vỡ ở landscape. 4 tab vẫn accessible. | BLOCKED-by-harness | N/A |
| TC-MUI-095 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | UI-MB03 — orientation SO Edit | UI | Wave | P2 | SO Edit xoay ngang/dọc — data không mất, layout không vỡ | C3-BLOCKED; Patrol | Nhập CK VT=5000000. Xoay landscape. Xoay portrait. Verify giá trị giữ. | - Data giữ nguyên sau rotate. Layout không vỡ. | BLOCKED-by-harness | N/A |
| TC-MUI-096 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | Android API 28+ / iOS 14+ render | UI | Wave | P2 | Render SO Edit trên Android API 28+ và iOS 14+ — không layout shift/overflow | C3-BLOCKED | Run trên cả 2 platform → verify InsuranceAllocationSection render đúng. | - Không layout shift/overflow trên Android 28+ và iOS 14+. | BLOCKED-by-harness | N/A |
| TC-MUI-097 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | UI-MB01 — soft keyboard | UI | Wave | P2 | Soft keyboard không che field cuối section khi đang nhập | C3-BLOCKED; Patrol | Tap field cuối section → keyboard bật → verify field không bị che (scroll-into-view). | - Field visible sau keyboard bật. Không bị che. | BLOCKED-by-harness | N/A |
| TC-MUI-098 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | UI-MB07 — background resume | UI | Wave | P3 | App vào background rồi resume → giữ form state SO Edit | C3-BLOCKED; Patrol | Nhập CK VT=5000000 → background → resume → verify value. | - Value giữ nguyên sau background/resume. | BLOCKED-by-harness | N/A |

### 4Q — Network / Offline (C1)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-099 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | UI-MB06 | UI | Wave | P2 | SO Edit offline khi Save → SnackBar "Không có kết nối mạng" | C1; mock network error | 1. Mock network offline (repo throw NetworkException).<br>2. Tap "Lưu".<br>3. `tester.pumpAndSettle()`.<br>4. `expect(find.text('Không có kết nối mạng'), findsOneWidget)`. | - SnackBar "Không có kết nối mạng" render. Không crash. Form data giữ nguyên. | BLOCKED | N/A |
| TC-MUI-100 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | UI-MB06, UI-FB03 | UI | Wave | P2 | SO Edit — Save bắt đầu rồi mất mạng → SnackBar lỗi, data không mất | C1; mock mid-request timeout | 1. Mock repo throw TimeoutException sau 500ms.<br>2. Tap "Lưu".<br>3. `tester.pumpAndSettle(Duration(milliseconds: 2000))`.<br>4. `expect(find.byType(SnackBar), findsOneWidget)`. 5. Verify CK VT value vẫn = giá trị đã nhập. | - SnackBar lỗi render. Field values không reset về 0. | BLOCKED | N/A |

### 4R — Responsive (C2-BLOCKED)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-103 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | MOB-UI-RSP-001 | UI | Wave | P2 | Phone portrait 375×822 — InsuranceAllocationSection không overflow | C2; alchemist | `goldenTest('ins_so_adj_phone_portrait_375', fileName: 'ins_so_adj_phone_portrait.png', builder: () => MediaQuery(data: MediaQueryData(size: Size(375, 822)), child: InsuranceAllocationSection(...)))`. | - Golden không overflow. Layout không cắt chữ. | BLOCKED-by-harness | N/A |
| TC-MUI-104 | FEAT-INS-STL-DETAIL | garage-mobile | MOB-UI-RSP-001 | UI | Wave | P2 | Phone portrait 375×1856 — InsuranceSettlementDetailScreen không overflow | C2; alchemist | `goldenTest('ins_stl_detail_phone_portrait', fileName: 'ins_stl_detail_phone_portrait.png', ...)`. | - Layout không overflow, 4 tab accessible. | BLOCKED-by-harness | N/A |
| TC-MUI-105 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | MOB-UI-RSP-002 | UI | Wave | P2 | Phone landscape 800×360 — layout adapt không vỡ | C2 | `goldenTest(..., MediaQueryData(size: Size(800, 360)), ...)`. | - Layout adapt landscape không vỡ. | BLOCKED-by-harness | N/A |
| TC-MUI-106 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | MOB-UI-RSP-003 | UI | Wave | P2 | Tablet portrait 768×1024 — layout adapt (2 column nếu AC) | C2 | `goldenTest(..., MediaQueryData(size: Size(768, 1024)), ...)`. | - Layout adapt tablet portrait. | BLOCKED-by-harness | N/A |
| TC-MUI-107 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | MOB-UI-RSP-005 | UI | Wave | P2 | Text scale 1.5 — không cắt chữ trong section | C2 | `goldenTest(..., MediaQueryData(textScaleFactor: 1.5), ...)`. | - Không cắt chữ tại text scale 1.5x. | BLOCKED-by-harness | N/A |
| TC-MUI-108 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | MOB-UI-RSP-006/007 | UI | Wave | P3 | Device cross-form matrix (Samsung/OPPO/iPhone) — không vỡ form | C4-BLOCKED | Patrol multi-device matrix. | - Layout không vỡ trên device range. | BLOCKED-by-harness | N/A |

### 4S — Accessibility (C1)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-109 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | MOB-UI-A11-001, MOB-UI-A11-002 | UI | Wave | P1 | Semantics label cho 5 field + touch target ≥48dp | C1 | 1. Pump InsuranceAllocationSection.<br>2. Mỗi field: `expect(find.bySemanticsLabel('Chiết khấu liên kết BH - Vật tư'), findsOneWidget)`.<br>3. `expect(tester.getSize(find.byKey(Key('discountMaterial_field'))).height, greaterThanOrEqualTo(48))`. | - Semantics label tiếng Việt cho từng field.<br>- Touch target ≥ 48dp. | BLOCKED | N/A |
| TC-MUI-110 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | MOB-UI-A11-005, AC-14 | UI | Wave | P1 | Error message accessble qua SemanticsProperties.errorMessage | C1 | 1. Trigger error field CK VT (nhập âm).<br>2. `expect(find.bySemanticsLabel('Vui lòng nhập giá trị từ 0 trở lên.'), findsOneWidget)` (SemanticsProperties.errorMessage). | - Error message accessible via a11y semantics. | BLOCKED | N/A |
| TC-MUI-111 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | MOB-UI-A11-006 | UI | Wave | P2 | Loading state có Semantics(label: 'Đang tải') | C1 | Mock emit InsuranceAllocationLoading() → `expect(find.bySemanticsLabel('Đang tải'), findsOneWidget)`. | - "Đang tải" semantics label present khi loading. | BLOCKED | N/A |
| TC-MUI-112 | FEAT-INS-STL-DETAIL | garage-mobile | MOB-UI-A11-001, MOB-UI-USA-001 | UI | Wave | P1 | InsuranceSettlementDetailScreen — action buttons Semantics label + touch target ≥48dp | C1 | 1. Pump InsuranceSettlementDetailScreen.<br>2. `expect(find.bySemanticsLabel('Tạo hồ sơ bảo hiểm'), findsOneWidget)`.<br>3. `expect(tester.getSize(find.text('Tạo hồ sơ bảo hiểm')).height, greaterThanOrEqualTo(48))`. | - Semantics label cho nút action. Touch target ≥48dp. | BLOCKED | N/A |
| TC-MUI-113 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | MOB-UI-A11-009 — color not only channel | UI | Wave | P2 | Error không chỉ màu đỏ — có text lỗi kèm theo | C1 | 1. Trigger error field.<br>2. `expect(find.byType(Text).where((t) => t.data?.contains('Vui lòng') ?? false), findsOneWidget)` (error text kèm theo, không chỉ border đỏ). | - Error text hiện rõ kèm màu — không phụ thuộc màu duy nhất. | BLOCKED | N/A |
| TC-MUI-114 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | MOB-UI-A11-007 | UI | Wave | P2 | Text body ≥12sp (a11y) trong InsuranceAllocationSection | C1 | 1. Pump section.<br>2. Với các Text widget helper: `expect(tester.widget<Text>(...).style?.fontSize ?? 14, greaterThanOrEqualTo(12))`. | - Không có text < 12sp. | BLOCKED | N/A |
| TC-MUI-115 | FEAT-INS-STL-DETAIL | garage-mobile | MOB-UI-A11-003 contrast | UI | Wave | P2 | Text chính `#262626` trên `#ffffff` — contrast ratio ≥4.5:1 | C1/C2 | Verify Color ratio: `#262626` trên `#ffffff` = 15.3:1 (pass). Tương tự `#0052ff` trên `#ffffff` = 4.87:1 (pass). | - Contrast ratio ≥4.5:1 cho text chính và link color per oracle. | BLOCKED | N/A |

### 4T — Localization / Text Quality (C1)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-116 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | MOB-UI-LOC-003 currency | UI | Wave | P2 | Currency format tiền VND — "197.680.000đ" đúng locale Việt | C1; AppLocalizations vi | Verify amount text format = "197.680.000đ" (dấu chấm ngàn, suffix đ). | - Format tiền đúng: "N.NNN.NNNđ" theo locale Việt. | BLOCKED | N/A |
| TC-MUI-117 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | MOB-UI-TXQ-001/002 typo | UI | Wave | P1 | Text quality — không lỗi chính tả tiếng Việt, đầy đủ dấu (oracle typo "bao hiểm" → flag nếu impl copy oracle) | C1 | `expect(find.text('bao hiểm'), findsNothing)` (oracle typo — impl NÊN sửa thành "bảo hiểm"). | - "bao hiểm" (thiếu dấu) không render. Impl dùng "bảo hiểm" đúng. | BLOCKED | N/A |
| TC-MUI-118 | FEAT-INS-STL-DETAIL | garage-mobile | MOB-UI-LOC-005 | UI | Wave | P2 | Translation key không lộ ra UI — không có chuỗi dạng "ins.adj.label.discount_material" | C1 | Verify toàn bộ Text widget trong màn không chứa chuỗi dạng "ins.", "l10n.", "key_", "errors.". | - Không có raw l10n key render trên UI. | BLOCKED | N/A |
| TC-MUI-119 | FEAT-INS-STL-DETAIL | garage-mobile | MOB-UI-TXQ-003 capitalization | UI | Wave | P2 | AppBar title "Chi tiết phiếu quyết toán" — đúng Title Case theo style guide | C1 | `expect(find.text('Chi tiết phiếu quyết toán'), findsOneWidget)` (Title Case: chữ đầu mỗi từ chính hoa). | - Title Case đúng style guide. | BLOCKED | N/A |
| TC-MUI-120 | FEAT-INS-STL-DETAIL | garage-mobile | MOB-UI-GRD-006 | UI | Wave | P2 | Empty cell trong bảng chi phí hiển thị "—" không phải "null" / "" | C1; mock empty cell | Verify cell empty value = "—" (dash) hoặc khoảng trắng, không "null". | - Empty cell không lộ "null". | BLOCKED | N/A |

### 4U — Multi-touch / Rapid input (C1/C3)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-123 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | MOB-UI-MTI-003, MOB-UI-BTN-007 | UI | Wave | P2 | Rapid tap nút "Áp dụng tất cả" 10 lần → không crash, debounce | C1 | Loop 10 lần: `tester.tap(find.text('Áp dụng tất cả'))` + `tester.pump(Duration(milliseconds: 50))`. Verify app không throw exception + applyAll call count ≤ 2. | - Không crash. Debounce giữ call count ≤ 2. | BLOCKED | N/A |
| TC-MUI-124 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | MOB-UI-BTN-005 | UI | Wave | P2 | Double-tap "Lưu" trong 500ms → 1 submit event | C1 | Tap "Lưu" 2 lần trong 300ms. Spy repo.save() call count. | - repo.save() call count = 1 (debounce hoạt động). | BLOCKED | N/A |
| TC-MUI-125 | FEAT-INS-STL-DETAIL | garage-mobile | MOB-UI-BTN-004 | UI | Wave | P1 | Nút action bar — loading state: CircularProgressIndicator size 20 thay text | C1 | 1. Mock BLoC emit loading state.<br>2. `expect(find.byType(CircularProgressIndicator), findsOneWidget)`. | - Loading state: spinner size ≤ 20 trong button. | BLOCKED | N/A |

### 4V — Device Compat (C4-BLOCKED)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-126 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | MOB-UI-DVC-001/002 | UI | Wave | P3 | Android device range (Samsung/OPPO/Xiaomi) + iOS (SE/Pro Max) — không vỡ form | C4-BLOCKED | Patrol multi-device matrix. | - Layout không vỡ trên tất cả device trong matrix. | BLOCKED-by-harness | N/A |
| TC-MUI-127 | FEAT-INS-STL-DETAIL | garage-mobile | MOB-UI-DVC-006 safe-area | UI | Wave | P3 | Safe-area (notch/hole-punch) không che AppBar "Chi tiết phiếu quyết toán" | C2/C4 | Verify AppBar content không bị che bởi notch trên iPhone X+ / Galaxy S20+. | - AppBar content visible trên notch device. | BLOCKED-by-harness | N/A |

### 4W — Regression: SO Edit/Detail (impacted screens)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-MUI-130 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | BR-INS-SO-ADJ-001, AC-0 regression | UI | Regression | P1 | Regression: SO Edit host page (`ServiceOrderCreationPage`) render đúng sau mount `InsuranceAllocationSection` — không crash, không widget orphan | C1; mock SO Edit isEdit=true | 1. Pump `ServiceOrderCreationPage(isEdit: true, fromServiceOrderDetail: mockSO)`.<br>2. `tester.pumpAndSettle()`.<br>3. `expect(find.byType(InsuranceAllocationSection), findsOneWidget)` khi BH=Có.<br>4. `expect(tester.takeException(), isNull)` (no crash). | - Page host render không crash. InsuranceAllocationSection mounted đúng (không orphan). | BLOCKED | N/A |
| TC-MUI-131 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-0 regression | UI | Regression | P1 | Regression: SO Create page KHÔNG bị ảnh hưởng bởi InsuranceAllocationSection mount — section vẫn absent | C1; mock SO Create isEdit=false | 1. Pump `ServiceOrderCreationPage(isEdit: false)`.<br>2. `expect(find.byType(InsuranceAllocationSection), findsNothing)`.<br>3. `expect(tester.takeException(), isNull)`. | - SO Create không bị mount InsuranceAllocationSection (không regression). | BLOCKED | N/A |

---

## 5. Changelog

| Date | Change | Author |
| --- | --- | --- |
| 2026-06-11 | Khởi tạo — Wave 01 Mobile UI auto testcase artifact. 130 TC (89 READY C1, 41 BLOCKED-by-harness C2/C3/C4). Covers FEAT-INS-SO-ADJUSTMENT + FEAT-INS-STL-DETAIL. Figma oracle conformance (8 screen nodes). Common baseline coverage map §1-§21. Auto vs manual parity (40/40 covered). Self-audit: no mandatory failure. | agent-test-mobile-ui |
| 2026-06-11 | **TEST_EXECUTION Run 1**: Environment Readiness Gate FAIL — Flutter SDK absent sau 2 retry. Tất cả 91 READY (C1) TC chuyển BLOCKED; 24 BLOCKED-by-harness (C2/C3/C4) giữ nguyên. Tổng 115 BLOCKED, 0 PASS, 0 FAIL. Status Summary cập nhật. Execution gate note thêm vào intro. Lesson learned entry TL-W01-MUI-001 tạo tại `Tracking/TEST-LESSONS-LEARNED.md`. TC report: `Execution/test-reports/TR-W01-MOBILE-UI.md`. | agent-test-mobile-ui |
| 2026-06-11 | **TEST_EXECUTION Run 2**: Env gate PASS (Flutter 3.44.1 / Dart 3.12.1). C1 smoke PASS (28 stub tests pass). NHƯNG toàn bộ spec C1 là **placeholder stubs** — production widget import commented out; assertions là `expect(true, isTrue)`. Stub runner PASS KHÔNG phải real evidence (per `MOBILE_UI_SOURCE_EVIDENCE`). C2 alchemist BLOCKED-incompatible: `alchemist ^0.10.0` không tương thích Flutter 3.44.1 (Canvas API mismatch — `clipRSuperellipse`/`drawRSuperellipse`). C3/C4 không attempt. Tất cả 115 TC vẫn BLOCKED. Lesson learned TL-W01-MUI-002 tạo (alchemist version lock). TR-W01-MOBILE-UI.md cập nhật Run 2. | agent-test-mobile-ui |
| 2026-06-12 | **TEST_EXECUTION Run 3**: alchemist upgraded 0.10.0 → 0.14.0 (Canvas API fix, Flutter 3.44.1 compat). 4 spec files fully rewritten: pure-Dart inline model+calculator tests runnable C1 headless; widget/cubit/wording tests skip-flagged BLOCKED-by-harness. Root cause confirmed: `InsuranceAllocationCubit` requires `BaseCubit` → `dio`+`graphql_flutter`+`firebase_*` native plugins; `@freezed` generated `.freezed.dart` absent in design repo; path dep `cardoctor_garage_v3` not feasible for QC harness. TC verdict: 0 PASS · 0 FAIL · 115 BLOCKED. Lesson TL-W01-MUI-003 created. TR-W01-MOBILE-UI.md updated Run 3. | agent-test-mobile-ui |
