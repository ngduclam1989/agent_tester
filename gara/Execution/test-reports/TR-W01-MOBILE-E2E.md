---
document_id: "TR-W01-MOBILE-E2E-agent-test-mobile-e2e"
type: test-report
parent: SV-TEST-CASE-REGISTRY
status: BLOCKED
version: 2
wave: "W01"
agent: "agent-test-mobile-e2e"
boundary: "garage-mobile, gf-sales, gf-accounting, agg-garage-graph"
execution_date: "2026-06-11"
last_reviewed: "2026-06-11"
---

# Báo cáo kiểm thử — Wave 01: Mobile E2E (FEAT-INS-SO-ADJUSTMENT + FEAT-INS-STL-DETAIL)

> Báo cáo kết quả kiểm thử cho Wave W01, thực thi bởi `agent-test-mobile-e2e`.
> Execution slice: Mobile E2E — Patrol live device/emulator + integration_test headless.
> Source TC artifact: `Execution/automated-test-cases/TC-W01-MOBILE-E2E.md` (30 TC).

---

## 1. Tổng quan

| Trường | Giá trị |
|---|---|
| **Wave** | W01 |
| **Subject / execution slice** | Mobile E2E — `FEAT-INS-SO-ADJUSTMENT` + `FEAT-INS-STL-DETAIL` |
| **Boundary(ies)** | `garage-mobile`, `gf-sales`, `gf-accounting`, `agg-garage-graph` |
| **Agent thực thi** | `agent-test-mobile-e2e` |
| **Nguồn thống kê** | AUTOMATED |
| **Ngày bắt đầu (Run 1)** | 2026-06-11 |
| **Ngày kết thúc (latest run)** | 2026-06-11 |
| **Số lần chạy chính thức** | 2 (Run 1 = env gate BLOCKED; Run 2 = partial env gate, harness BLOCKED) |
| **Loại kiểm thử** | E2E — Regression + Wave journey (native interaction: deeplink, FCM push, background-foreground, offline) |
| **Môi trường** | Local sandbox — BFF reachable tại `localhost:45401`; Flutter 3.44.1 + emulator-5554 present; QC harness skeleton incomplete |
| **Phiên bản code (latest run)** | Commit `f5ff0928` trên branch `feature/ep-insurance-settlement-w01` |
| **Gate source** | Work package `Execution/work-packages/PKG-W01-insurance-foundation.md` |
| **Kết luận tổng quát (latest run)** | **BLOCKED** |

---

## 1.5 Run Timeline — Lịch sử các lần chạy

| Run # | Ngày | Trigger | Commit | TC executed | PASS | FAIL | BLOCKED | SKIPPED | New bugs (BUG-IDs) | Bugs verified (BUG-IDs) | Verdict |
|---|---|---|---:|---:|---:|---:|---:|---:|---|---|---|
| Run 1 | 2026-06-11 | `/test-exec` initial sau `/test-plan` | `f5ff0928` | 30 | 0 | 0 | 30 | 0 | — | — | BLOCKED |
| Run 2 | 2026-06-11 | `/test-exec` re-run sau unblock attempt | `f5ff0928` | 30 | 0 | 0 | 29 | 1 | — | — | BLOCKED |

**Lý do BLOCKED Run 1**: Step 0 Env Gate thất bại — Flutter SDK hoàn toàn vắng mặt trong sandbox sau 2 retry.

**Lý do BLOCKED Run 2**: Step 0 Env Gate PARTIAL — Flutter 3.44.1 + Dart 3.12.1 + patrol_cli 2.8.0 + emulator-5554 pixel6_api33 booted tất cả PRESENT. Tuy nhiên smoke preflight thất bại: QC harness `Execution/auto/harness/patrol/` là skeleton thiếu `android/` directory → `patrol test` thực hiện `./gradlew :app:assembleDebug` → `ProcessException: No such file or directory`. Integration-test harness cũng skeleton (chỉ có pubspec.yaml). TC-MOB-025 SKIPPED per CR-1781166951.

---

## 2. Kết quả tổng hợp

### 2.1 Tóm tắt số liệu

| Chỉ số | Run 1 | Run 2 (latest) | Ngưỡng | Đạt? |
|---|---|---|---|---|
| Tổng TC (trừ spec-gap) | 30 | 30 | — | — |
| TC PASS | 0 | 0 | — | KHÔNG |
| TC FAIL | 0 | 0 | — | — |
| TC SKIP | 0 | 1 (TC-MOB-025 iOS) | — | — |
| TC BLOCKED | 30 | 29 | 0 (cho mobile E2E journey gate) | KHÔNG |
| **Tỷ lệ pass (excl. SKIPPED)** | 0% | 0% | ≥ 80% (per active gate) | KHÔNG |
| Bug P1 mở (mobile E2E owned) | 0 | 0 | 0 | CÓ |
| Bug P2 mở (mobile E2E owned) | 0 | 0 | — | — |

> Toàn bộ 29 TC bị BLOCKED-by-harness (Run 2). 1 TC SKIPPED (TC-MOB-025, CR-1781166951). KHÔNG có TC nào được execute. Không có product bug mới từ mobile E2E execution.

### 2.2 Phân bổ theo mức ưu tiên

| Mức ưu tiên | Tổng | PASS | FAIL | BLOCKED | SKIPPED | Tỷ lệ pass |
|---|---|---|---|---|---|---|
| P1 (Critical) | 14 | 0 | 0 | 13 | 1 (TC-MOB-025) | 0% |
| P2 (High) | 14 | 0 | 0 | 14 | 0 | 0% |
| P3 (Medium) | 1 | 0 | 0 | 1 | 0 | 0% |
| P4 (Low) | 0 | 0 | 0 | 0 | 0 | — |
| Spec-gap (deferred) | 1 | — | — | — | — | — |

> TC-W01-MOB-013 là spec-gap (concurrent-edit, defer); không đếm vào tổng 30. Bảng trên tính 29 TC có P-level + 1 spec-gap.

### 2.3 Phân bổ theo Execution Surface

| Execution Surface | Tổng | PASS | FAIL | BLOCKED | SKIPPED | Tỷ lệ pass |
|---|---|---|---|---|---|---|
| Mobile E2E (Patrol C3) | 22 | 0 | 0 | 22 | 0 | 0% |
| Mobile E2E native — Deeplink Android (C3) | 3 | 0 | 0 | 3 | 0 | 0% |
| Mobile E2E native — FCM push (C3) | 1 | 0 | 0 | 1 | 0 | 0% |
| Mobile E2E native — iOS Universal Link (C4) | 1 | 0 | 0 | 0 | 1 | N/A (SKIPPED) |
| Integration test headless (C1/C2) | 5 | 0 | 0 | 5 | 0 | 0% |

> C3 Patrol BLOCKED: harness thiếu `android/` + `gradlew`. C1/C2 integration_test BLOCKED: harness integration-test/ chỉ có pubspec.yaml. C4 iOS SKIPPED: CR-1781166951.

### 2.4 Phân bổ theo nguồn thực thi

| Nguồn | Tổng | PASS | FAIL | BLOCKED | SKIPPED | Ghi chú |
|---|---|---|---|---|---|---|
| Automated | 30 | 0 | 0 | 29 | 1 | `TC-W01-MOBILE-E2E.md` — Patrol C3/C4 + integration_test C1/C2 |
| Manual | 3 | — | — | — | — | Xem `Execution/test-cases/TC-W01-MOBILE-E2E.md` (3 READY — cross-platform) |

### 2.5 So sánh kết quả qua các lần chạy (multi-run trend)

| Chỉ số | Run 1 | Run 2 (latest) | Δ Run1→2 | Ngưỡng | Đạt latest? |
|---|---:|---:|---:|---|---|
| Total TC executed | 30 | 30 | 0 | — | — |
| PASS count | 0 | 0 | 0 | — | — |
| FAIL count | 0 | 0 | 0 | ≤0 cho gate | N/A |
| BLOCKED count | 30 | 29 | -1 | 0 (ideal) | KHÔNG |
| SKIPPED count | 0 | 1 | +1 | — | — |
| Tỷ lệ pass | 0% | 0% | 0 | ≥80% | KHÔNG |
| Bugs P1 open (mobile E2E owned) | 0 | 0 | 0 | 0 | CÓ |

**Progress Run 1 → Run 2**: Flutter toolchain + emulator booted = partial progress. Harness skeleton issue discovered. 1 TC từ BLOCKED → SKIPPED (TC-MOB-025, CR-1781166951). Blocker type changed từ "SDK absent" sang "harness incomplete".

---

## 3. Chi tiết theo Test Suite

### 3.1 Smoke Suite

| TC ID | Tiêu đề | Run 1 | Run 2 | Thời gian | Ghi chú |
|---|---|---|---|---|---|
| smoke_patrol_test.dart | Smoke preflight: cold start app + assert 1 widget tiếng Việt | BLOCKED | BLOCKED | — | Run 2: `patrol test` gọi `./gradlew :app:assembleDebug` — `ProcessException: No such file or directory` (thiếu `android/` trong harness). Error log: `Execution/auto/evidence/W01/mobile-e2e/env-gate-run2.md`. |

### 3.2 Regression Suite

| TC ID | Tiêu đề | Wave gốc | Run 1 | Run 2 | Thời gian | Ghi chú |
|---|---|---|---|---|---|---|
| TC-W01-MOB-001 | [REGRESSION] SO Create — section "Phân bổ quyết toán bảo hiểm" KHÔNG hiển thị | W01 (AC-0) | BLOCKED | BLOCKED | — | Runner absent — cần Patrol C3 live device. Harness incomplete. |
| TC-W01-MOB-015 | [REGRESSION] Phiếu QT BH layout mới shared KH+BH — 4 tab render đúng | W01 (AC-1..4) | BLOCKED | BLOCKED | — | Runner absent — cần Patrol C3 live device. Harness incomplete. |

### 3.3 E2E Journeys

| Journey ID | Tên | Run 1 | Run 2 | Bước fail (Run 2) |
|---|---|---|---|---|
| J-MOB-SO-ADJ | SO Edit → nhập 5 khoản BH → lưu → persist (TC-MOB-001..014) | BLOCKED | BLOCKED | Step 0 Env Gate: harness `android/` absent → `./gradlew` not found |
| J-MOB-STL-DET | Phiếu QT BH → 4 tab + panel Tổng giá dịch vụ (TC-MOB-015..024) | BLOCKED | BLOCKED | Step 0 Env Gate: same |
| J-MOB-DEEPLINK | Deeplink Android cold start + foreground + not-found (TC-MOB-020..022) | BLOCKED | BLOCKED | Step 0 Env Gate: same |
| J-MOB-FCM | FCM background push → tap → navigate (TC-MOB-023) | BLOCKED | BLOCKED | Step 0 Env Gate: same + FCM test instance setup not attempted |
| J-MOB-AUTH | Login + token lifecycle + logout (TC-MOB-030..032) | BLOCKED | BLOCKED | Integration-test harness skeleton |
| J-MOB-DEEPLINK-iOS | iOS Universal Link cold start (TC-MOB-025) | BLOCKED | SKIPPED | CR-1781166951 — Ubuntu/Xcode absent |

### 3.4 Functional TCs (Wave hiện tại) — Multi-run verdict

| TC ID | Tiêu đề | Priority | Run 1 | Run 2 | Linked Bug | Final verdict |
|---|---|---|---|---|---|---|
| TC-W01-MOB-001 | [REGRESSION] SO Create không có section Phân bổ BH | P1 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-002 | SO Edit toggle BH=Có → section xuất hiện | P1 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-003 | Nhập 5 khoản BH → realtime preview | P1 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-004 | Khấu hao 20% + Áp dụng tất cả | P1 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-005 | Lưu SO với allocation → persist + Detail read-only | P1 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-006 | [file picker baseline] Upload Hồ sơ bảo lãnh | P2 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-007 | CK VT = 150% → lỗi field-level | P1 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-008 | Khấu trừ BH = -1000 → lỗi field-level | P1 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-009 | BH thanh toán âm → warning + allow save | P1 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-010 | Background-foreground restoration | P2 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-011 | Offline mid-save → snackbar "Mất kết nối" | P2 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-012 | Token expired mid-flow → silent refresh | P2 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-013 | [SPEC-GAP] Concurrent-edit | P2 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-014 | Chủ garage SO Edit → section + input enabled | P1 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-015 | [REGRESSION] Phiếu QT BH → header + 4 tab | P1 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-016 | Tab Bảng chi phí → hạng mục BH + panel | P1 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-017 | Panel Cân thanh toán số tiền đúng công thức | P1 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-018 | Tab Lịch sử thanh toán → read-only | P2 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-019 | Phiếu QT BH không có nút Huỷ | P1 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-020 | Deeplink Android App Link cold start | P1 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-021 | Deeplink foreground in-app navigate | P2 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-022 | Deeplink ID không tồn tại → error | P2 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-023 | FCM background push → tap → chi tiết | P1 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-024 | Nút "+ Tạo hồ sơ BH" disabled → SnackBar | P2 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-025 | [iOS] Universal Link cold start | P1 | BLOCKED | SKIPPED | — | SKIPPED (CR-1781166951) |
| TC-W01-MOB-030 | Login email/password → home + FCM token | P1 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-031 | Token refresh fail → logout | P2 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-032 | Logout → màn Đăng nhập | P2 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-033 | Kế toán thấy tab Phiếu quyết toán (C1) | P2 | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-MOB-034 | Wording tiếng Việt màn Đăng nhập + Home (C1) | P3 | BLOCKED | BLOCKED | — | BLOCKED |

---

## 4. Failed Tests — Chi tiết

Không có TC nào FAIL trong Run 1 hoặc Run 2. Toàn bộ TC ở trạng thái BLOCKED-by-harness hoặc SKIPPED.

### 4.1 Env Gate — Chi tiết từng lần chạy

#### Run 1 — 2026-06-11

| Check | Lệnh | Kết quả |
|---|---|---|
| Flutter SDK | `flutter --version` | FAIL — `command not found` (exit 127) |
| Dart SDK | `dart --version` | FAIL — `command not found` (exit 127) |
| adb | `adb devices` | FAIL — `command not found` (exit 127) |
| xcrun | `xcrun simctl list devices booted` | FAIL — `command not found` (exit 127) |
| Patrol CLI | `patrol --version` | FAIL — không cài được vì `dart` absent |
| integration_test runner | `flutter test ...` | FAIL — Flutter absent |
| BFF | `curl localhost:45401/health` | OK — `{"status":"ok"}` |

**Kết luận Run 1**: Flutter SDK hoàn toàn vắng mặt. Toàn bộ 30 TC → BLOCKED.

#### Run 2 — 2026-06-11

| Check | Lệnh | Kết quả |
|---|---|---|
| Flutter SDK | `flutter --version` | PASS — Flutter 3.44.1 |
| Dart SDK | `dart --version` | PASS — Dart 3.12.1 |
| Patrol CLI | `patrol --version` | PASS — patrol_cli v2.8.0 |
| adb | `adb devices` | PASS — emulator-5554 device (pixel6_api33 booted) |
| Android emulator boot | `getprop sys.boot_completed` | PASS — `1` (swiftshader, no KVM hw) |
| iOS/xcrun | `xcrun simctl list devices booted` | FAIL — xcrun absent (Ubuntu host) |
| Harness pub get | `.dart_tool/package_config.json` | PASS — 103 packages incl. patrol, flutter, integration_test |
| **Smoke preflight** | `patrol test --target smoke_patrol_test.dart -d emulator-5554` | **FAIL** — `ProcessException: No such file or directory` — `./gradlew :app:assembleDebug` — no `android/` in harness |
| integration_test harness | harness integration-test/ | FAIL — only pubspec.yaml present, no `integration_test/`, `android/`, `lib/` |
| BFF | `curl localhost:45401/health` | PASS — `{"status":"ok"}`, uptime 198s |

**Kết luận Run 2**: Toolchain (Flutter/Dart/patrol/adb/emulator) đủ điều kiện. Blocker mới phát hiện: QC harness skeleton thiếu Android native project structure. iOS vẫn absent (xcrun). 29 TC BLOCKED-by-harness + 1 SKIPPED.

Evidence file: `Execution/auto/evidence/W01/mobile-e2e/env-gate-run2.md`

### 4.2 Hành động tiếp theo để unblock (Run 3)

**C3/C4 Patrol (29 TC)**:
1. Thêm vào `Execution/auto/harness/patrol/`:
   - `android/` — Flutter Android project structure + `gradlew`
   - `android/app/src/androidTest/MainActivityTest.java` — Patrol native runner
   - `lib/main.dart` — app entry point (wrapping target app hoặc stub)
   - `integration_test/` — test bundle entry
2. Hoặc: add `patrol: ^3.9.0` + `integration_test` vào `mobile/gf-garage-app/pubspec.yaml` và dùng project-native setup (design repo NO-CODE rule → cần per-service agent trong `garage-functions/garage-mobile/`)
3. Smoke: `patrol test --target ../../specs/W01/mobile-e2e/smoke_patrol_test.dart -d emulator-5554 --dart-define=BFF_BASE_URL=http://10.0.2.2:45401`

**C1/C2 integration_test (5 TC)**:
1. Thêm vào `Execution/auto/harness/integration-test/`:
   - `android/` — Flutter Android project structure
   - `lib/main.dart`
   - `integration_test/auth_lifecycle_integration_test.dart` (symlink hoặc copy từ specs)
2. Smoke: `flutter test integration_test/auth_lifecycle_integration_test.dart -d emulator-5554`

**TC-MOB-025 iOS (1 TC — SKIPPED)**:
- Defer to CI macOS runner per CR-1781166951. Không unblock trên Ubuntu host.

**BFF URL cho emulator**:
- Sử dụng `--dart-define=BFF_BASE_URL=http://10.0.2.2:45401` (port 45401 thực tế của agg-garage-graph)
- Hoặc: `adb reverse tcp:3000 tcp:45401` rồi dùng `http://10.0.2.2:3000`

---

## 5. Coverage Report

### 5.1 Code Coverage

N/A — không có execution nào diễn ra. Coverage data không thu được.

### 5.2 TC Coverage (Traceability)

| Feature ID | Tổng AC | AC có TC | AC chưa có TC | Coverage |
|---|---|---|---|---|
| `FEAT-INS-SO-ADJUSTMENT` | AC-0 đến AC-16 (17 AC) | 17 AC covered bởi TC-MOB-001..014 | 0 | 100% theo TC spec — verdict BLOCKED (chưa execute) |
| `FEAT-INS-STL-DETAIL` | AC-1 đến AC-13 (13 AC) | 13 AC covered bởi TC-MOB-015..025 | 0 | 100% theo TC spec — verdict BLOCKED (chưa execute) |

---

## 6. Performance Metrics

N/A — không áp dụng cho mobile E2E wave này. SLO formal thuộc `agent-test-performance`.

---

## 7. Step 5 Bug Verification Loop — Mobile E2E Owned Bugs

**Tìm kiếm bugs owned by agent-test-mobile-e2e** tại `RESOLVED`/`FIX_DONE`/`VERIFY_PENDING`:

Kết quả: Không có bug nào owned by `agent-test-mobile-e2e` trong `Tracking/WAVE01/BUGS.md`. Tất cả bugs hiện tại (BUG-W01-005..244) được phát hiện bởi web E2E, API, UI, và security agents — không có execution từ mobile E2E runner trong bất kỳ run nào.

**Kết luận Step 5**: Không có bug verification cần thực hiện cho mobile E2E slice W01.

Verify files có mention "mobile/patrol/flutter/FCM/deeplink": BUG-W01-227, BUG-W01-228, BUG-W01-229, BUG-W01-230 — tất cả owned by `agent-test-security`, không phải mobile E2E.

---

## 8. Step 6 Regression — No-Inherit

Regression TCs (TC-MOB-001, TC-MOB-015) vẫn BLOCKED cả 2 run. Không có PASS history từ wave trước áp dụng. Regression verdict không thể kết luận — cần Patrol live execution sau harness unblock.

Không mirror PASS từ web E2E sang mobile regression (per MOBILE_E2E_NO_INHERIT rule).

---

## 9. Issues phát hiện

### 9.1 Environment Issues (không phải product defect)

| # | Loại | Mức | Mô tả | Boundary | Run phát hiện | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | Environment | Blocker | Run 1: Flutter SDK (flutter + dart) absent trong sandbox. adb + xcrun absent. | Infrastructure | Run 1 | Đã giải quyết 1 phần (Run 2): Flutter/Dart/adb/emulator present |
| 2 | Environment | Blocker | Run 2: QC harness `Execution/auto/harness/patrol/` thiếu `android/` directory. Patrol `./gradlew :app:assembleDebug` fail `ProcessException: No such file or directory`. | Infrastructure (QC harness) | Run 2 | Open — cần thêm Android native structure vào harness |
| 3 | Environment | Blocker | Run 2: QC harness `Execution/auto/harness/integration-test/` chỉ có pubspec.yaml. Không có `integration_test/`, `android/`, `lib/` → không thể chạy `flutter test`. | Infrastructure (QC harness) | Run 2 | Open — cần thêm Flutter project structure |
| 4 | Environment | Warning | iOS xcrun absent trên Ubuntu host. TC-MOB-025 SKIPPED per CR-1781166951. | Infrastructure | Run 1 + 2 | Accepted (CR-approved) |
| 5 | Config | Warning | BFF URL trong patrol.yaml khai báo port 3000 nhưng BFF thực tế chạy port 45401. Cần `--dart-define=BFF_BASE_URL=http://10.0.2.2:45401` khi run. | Configuration | Run 2 discovery | Open — cần update patrol.yaml hoặc note cho Run 3 |

### 9.2 Drift phát hiện trong Run 2

Không phát hiện product drift từ run này (runner không execute).

### 9.3 Observation từ BFF health check (Run 2)

BFF `agg-garage-graph` tại `localhost:45401` reachable và healthy (`{"status":"ok"}`, uptime 198s, `NODE_ENV=development`). Backend side sẵn sàng. Android emulator `emulator-5554` reachable qua `adb`. BFF URL từ emulator cần `http://10.0.2.2:45401`.

---

## 10. Kết luận

### 10.1 Verdict

| Tiêu chí | Run 1 | Run 2 (latest) | Ghi chú |
|---|---|---|---|
| Smoke đạt ngưỡng active gate? | KHÔNG | KHÔNG | Smoke BLOCKED — harness `android/` absent (Run 2) |
| Regression đạt ngưỡng active gate? | KHÔNG | KHÔNG | TC-MOB-001, TC-MOB-015 cần Patrol live |
| E2E Journeys đạt ngưỡng active gate? | KHÔNG | KHÔNG | Tất cả 5 journey groups BLOCKED |
| Coverage đạt ngưỡng active gate? | N/A | N/A | Không execute được |
| Bug P1 = 0 (mobile E2E owned)? | CÓ | CÓ | Không có bug product từ mobile E2E (runner không chạy) |
| Tenant isolation = 0 leakage? | N/A | N/A | Không execute được |

### 10.2 Quyết định

- [x] **KHÔNG CHO QUA GATE (NO-GO)** — Wave W01 Mobile E2E slice BLOCKED. 29/30 TC không thể execute do QC harness skeleton thiếu Android native project structure. 1/30 TC SKIPPED (iOS CR-approved). Phải hoàn thiện harness trước khi tái chạy.

**Kết luận tổng quát: BLOCKED**

**Điều kiện unblock (cần đủ trước khi tái chạy Run 3):**
1. Harness `Execution/auto/harness/patrol/` có `android/` + `gradlew` + `lib/main.dart` + `integration_test/` (C3 gate).
2. Hoặc: project-native Patrol setup trong `mobile/gf-garage-app/` (cần per-service dev agent add patrol dependency).
3. Smoke preflight: `patrol test --target ../../specs/W01/mobile-e2e/smoke_patrol_test.dart -d emulator-5554 --dart-define=BFF_BASE_URL=http://10.0.2.2:45401` → exit 0 + widget `find.text('Đăng nhập')` found.
4. Integration-test harness: `flutter test integration_test/auth_lifecycle_integration_test.dart -d emulator-5554` → exit 0 (C1 gate).

### 10.3 Ghi chú cho wave tiếp theo

- QC harness skeleton cần được hoàn thiện thành Flutter project thật (với Android native structure) trước bất kỳ wave nào chạy mobile E2E. Đây là blocker hệ thống, không phải blocker per-wave.
- BFF URL mapping: patrol.yaml khai báo `http://10.0.2.2:3000` — cần cập nhật thành `http://10.0.2.2:45401` (hoặc dùng `adb reverse tcp:3000 tcp:45401`).
- TC-MOB-013 (concurrent-edit, spec-gap) vẫn cần gf-sales optimistic lock spec trước khi có thể run.
- TC-MOB-006 (native file picker): giữ out-of-wave W01 (FEAT-INS-DOSSIER-CREATE = W02 scope).
- KVM note: emulator chạy được với swiftshader (không cần KVM hw) — boot chậm hơn nhưng functional. Không cần fix KVM permissions cho emulator headless.

---

## Changelog

| Ngày | Thay đổi | Tác giả |
|---|---|---|
| 2026-06-11 | Khởi tạo Run 1 — TEST_EXECUTION. Step 0 Env Gate BLOCKED: Flutter SDK absent (flutter + dart command not found, 2 retry), adb absent, xcrun absent. BFF healthy tại :45401. 30/30 TC → BLOCKED-by-harness. Không có product bug mới. Kết luận: NO-GO cho mobile E2E slice. | agent-test-mobile-e2e |
| 2026-06-11 | Run 2 — Step 0 Env Gate PARTIAL PASS / BLOCKED-by-harness. Flutter 3.44.1 + Dart 3.12.1 + patrol_cli 2.8.0 + emulator-5554 pixel6_api33 booted (swiftshader): PASS. Smoke preflight FAIL: harness `Execution/auto/harness/patrol/` thiếu `android/` directory → `patrol test` thực thi `./gradlew :app:assembleDebug` → `ProcessException: No such file or directory`. Integration-test harness cũng skeleton. iOS xcrun absent. TC-MOB-025 SKIPPED (CR-1781166951). Step 5 Bug Verification: không có mobile-E2E-owned bug. Step 6 Regression: no-inherit maintained. Kết quả: 29 BLOCKED + 1 SKIPPED. Kết luận: BLOCKED — harness cần Android native structure. Evidence: `Execution/auto/evidence/W01/mobile-e2e/env-gate-run2.md`. | agent-test-mobile-e2e |
