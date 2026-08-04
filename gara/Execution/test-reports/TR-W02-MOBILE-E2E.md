---
document_id: "TR-W02-MOBILE-E2E"
type: test-report
parent: SV-TEST-CASE-REGISTRY
status: BLOCKED
version: 4
wave: "W02"
agent: "agent-test-mobile-e2e"
boundary: "garage-mobile, gf-accounting, agg-garage-graph, gf-sales"
execution_date: "2026-06-26"
last_reviewed: "2026-06-26"
---

# Báo cáo kiểm thử — Wave W02: Mobile E2E

> Báo cáo kết quả kiểm thử W02 — mobile E2E slice, thực thi bởi `agent-test-mobile-e2e`.
> Run 9 (2026-06-24): Patrol APK build BLOCKED — `androidx.test:runner` version conflict trong `android/app/build.gradle` (BUG-W02-068). Toàn bộ 38 TC chuyển BLOCKED-by-harness.
> Run 10 (2026-06-26): Re-attempt per briefing (BUG-W02-068 marked INVALID 2026-06-24). Conflict confirmed STILL PRESENT — BUG-W02-136 filed. 38 TC vẫn BLOCKED-by-harness.
> Run 1+2 (2026-06-22): SKIPPED toàn bộ — mobile DEV PAUSED per `Execution/handoffs/W02-DEV-garage-mobile-PAUSED-2026-06-22.md`.

---

## 1. Tổng quan

| Trường | Giá trị |
|---|---|
| **Wave** | W02 |
| **Subject / execution slice** | Mobile E2E — `garage-mobile` native journey qua BFF → `gf-accounting` / `gf-sales` |
| **Boundary(ies)** | `garage-mobile · gf-accounting · agg-garage-graph · gf-sales` |
| **Agent thực thi** | `agent-test-mobile-e2e` |
| **Nguồn thống kê** | AUTOMATED (`Execution/automated-test-cases/TC-W02-MOBILE-E2E.md`) |
| **Ngày bắt đầu (Run 1)** | 2026-06-22 |
| **Ngày kết thúc (latest run)** | 2026-06-26 |
| **Số lần chạy chính thức** | 4 (Run 1 + Run 2 SKIPPED 2026-06-22; Run 9 BLOCKED 2026-06-24; Run 10 BLOCKED 2026-06-26) |
| **Loại kiểm thử** | E2E Mobile (Patrol + integration_test) |
| **Môi trường** | Android emulator-5554 (Pixel6_API33_arm64, booted); BFF `http://192.168.110.191:45401` (reachable từ emulator); Flutter 3.44.1 / Dart 3.12.1; patrol_cli 4.4.0 (patched); flavor dev |
| **Phiên bản code (latest run)** | `mobile/gf-garage-app@HEAD` (2026-06-26); same HEAD as Run 9 |
| **Gate source** | Run 10: Patrol APK build blocker (BUG-W02-136 — production `build.gradle:201` runner version conflict re-confirmed, Rule #11 NO-CODE cannot fix); Seed fresh 2026-06-26 (SO=PDV-20260626-00008, STL=SET-20260626-00010) |
| **Kết luận tổng quát (latest run)** | **BLOCKED** |

**Lý do BLOCKED (Run 9):**
Patrol APK build thất bại với lỗi irreconcilable dependency conflict: `android/app/build.gradle:201` khai báo `androidTestImplementation "androidx.test:runner:1.6.2"` nhưng `patrol` package (^4.6.1 via git ref) đã pin `runner:1.5.1` trong `devDebugRuntimeClasspath` qua AGP consistent resolution — hai constraint không thể thỏa mãn đồng thời. Đã thực hiện 2 retry từ 2 path khác nhau (`.Kaiser` + `phinh/`) — cùng lỗi. Fix yêu cầu sửa production `android/app/build.gradle:201` → forbidden per Rule #11 (Design repo NO-CODE). Bug filed: BUG-W02-068. Emulator-5554 đã booted, BFF reachable, flavor `dev` endpoints đúng, code READY tại HEAD — blocker thuần harness/build, không phải product defect.

**Lý do BLOCKED (Run 10):**
BUG-W02-068 được đánh dấu INVALID (2026-06-24) vì bị cho là false-positive do infra rebuild. Run 10 (2026-06-26) re-attempt xác nhận: conflict `androidx.test:runner:1.6.2` vs `{strictly 1.5.1}` vẫn còn nguyên trong production `build.gradle:201`. Patrol 4.6.1 (`~/.pub-cache/hosted/pub.dev/patrol-4.6.1/android/build.gradle:68`) khai báo `api "androidx.test:runner:1.5.1"` → AGP pins runner:1.5.1, reject `androidTestImplementation "androidx.test:runner:1.6.2"` tại build. Retry 1 (no --flavor): FAIL — `assembleDebugAndroidTest ambiguous` (multi-flavor). Retry 2 (--flavor dev): FAIL — runner version conflict. Pre-flight tất cả PASSED (emulator booted, BFF reachable, seed fresh). Bug filed: BUG-W02-136.

---

## 1.5 Run Timeline — Lịch sử các lần chạy

| Run # | Ngày | Trigger | Commit | TC executed | PASS | FAIL | BLOCKED | SKIPPED | New bugs (BUG-IDs) | Bugs verified (BUG-IDs) | Verdict |
|---|---|---|---|---:|---:|---:|---:|---:|---|---|---|
| Run 1 | 2026-06-22 | `/test-exec w02` — user-authorized scope reduction; mobile DEV PAUSED | N/A (no APK build) | 0 | 0 | 0 | 0 | 38 | — | — | SKIPPED |
| Run 2 | 2026-06-22 | `/test-exec w02` Run 2 — no change, mobile dev still paused | N/A (no APK build) | 0 | 0 | 0 | 0 | 38 | — | — | SKIPPED |
| Run 9 | 2026-06-24 | `/test-exec w02` Run 9 — post mobile DEV resume; fresh data 2026-06-24; BUG-W02-068 filed | `mobile/gf-garage-app@HEAD` (APK build fail — runner version conflict) | 0 | 0 | 0 | 38 | 0 | BUG-W02-068 | — | BLOCKED |
| Run 10 | 2026-06-26 | `/test-exec w02` Run 10 — BUG-W02-068 marked INVALID; re-attempt per briefing; fresh seed 2026-06-26 | `mobile/gf-garage-app@HEAD` (APK build fail — runner version conflict persists) | 0 | 0 | 0 | 38 | 0 | BUG-W02-136 | — | BLOCKED |

**Ghi chú Run 1:** Không có TC nào được run. Tất cả 38 TC chuyển SKIPPED do mobile DEV PAUSED (handoff ref). Không có bug mới filed và không có bug nào được verify trong cycle này.

**Ghi chú Run 2:** No change from Run 1. Mobile dev still paused as of 2026-06-22. All 38 TCs remain SKIPPED.



**Ghi chú Run 10 (2026-06-26 — BLOCKED):**
Pre-flight items PASSED:
- Flutter 3.44.1 / Dart 3.12.1: PRESENT
- patrol_cli 4.4.0 (patched): PRESENT
- Android emulator-5554 (Pixel6_API33_arm64, API 33): BOOTED (`boot_completed=1`)
- BFF `http://192.168.110.191:45401`: REACHABLE (`{"data":{"__typename":"Query"}}`)
- gf-sales UP / gf-accounting UP: CONFIRMED
- SSO stub `http://192.168.110.191:45410`: REACHABLE (token obtained)
- Seed fresh 2026-06-26: PDV-20260626-00008 / SET-20260626-00010 / SET-20260626-00009 / dossier-v1:2docs — SEEDED

Patrol build attempt 1 (no --flavor): FAIL — `assembleDebugAndroidTest ambiguous in project :app. Candidates: assembleDevDebugAndroidTest, assemblePreprodDebugAndroidTest, ...` — patrol_cli 4.4.0 passed no flavor → Gradle ambiguous task.
Patrol build attempt 2 (--flavor dev): FAIL — `Execution failed for task ':app:processDevDebugAndroidTestManifest'. Could not resolve androidx.test:runner:1.6.2. ... Constraint path ... --> 'androidx.test:runner:{strictly 1.5.1}'` — SAME root cause as BUG-W02-068.
Conclusion: BUG-W02-068 INVALID reclassification was incorrect; the underlying code issue in `build.gradle:201` remains.
Bug filed: **BUG-W02-136** (P2, OPEN, agent-fix-garage-mobile).
Verdict: **BLOCKED** — 0 TC executed, 38 TC BLOCKED-by-harness.

**Ghi chú Run 9 (2026-06-24 — BLOCKED):**
Pre-flight steps hoàn thành thành công:
- Flutter 3.44.1 / Dart 3.12.1: PRESENT
- patrol_cli 4.4.0 (patched path-sanitization): PRESENT
- Android emulator-5554 (Pixel6_API33_arm64): BOOTED (`boot_completed=1`)
- BFF connectivity: `http://192.168.110.191:45401` — REACHABLE từ emulator (`nc` test → HTTP/1.1 200 OK)
- Flavor `dev` endpoints: `graphQLUrl = "http://192.168.110.191:45401/garage/graphql"` — CONFIRMED
- Smoke spec API fix: `$.pumpAndSettle(duration: ...)` named param — PATCHED (patrol ^4.x API)
- Seed data 2026-06-24: PDV-20260624-00009 / SET-20260624-00006 — SEEDED

Patrol build attempt 1 (path `.Kaiser/garage-agentic-design/mobile/gf-garage-app`): FAIL — runner version conflict.
Patrol build attempt 2 (path `phinh/garage-agentic-design/mobile/gf-garage-app`): FAIL — identical error.
Cả 2 retry đều gặp: `Execution failed for task ':app:processDevDebugAndroidTestManifest'. Could not resolve androidx.test:runner:1.6.2. ... Constraint path ... --> 'androidx.test:runner:{strictly 1.5.1}' because of the following reason: version resolved in configuration ':app:devDebugRuntimeClasspath' by consistent resolution`
Bug filed: **BUG-W02-068** (P2, OPEN, agent-fix-garage-mobile).
Verdict: **BLOCKED** — 0 TC executed, 38 TC BLOCKED-by-harness.

---

## 2. Kết quả tổng hợp

### 2.1 Tóm tắt số liệu

| Chỉ số | Giá trị | Ngưỡng | Đạt? |
|---|---|---|---|
| Tổng TC thực thi | 0 | — | N/A |
| TC PASS | 0 | — | N/A |
| TC FAIL | 0 | 0 | N/A |
| TC SKIP | 0 (Run 9; 38 SKIPPED chỉ ở Run 1+2) | — | N/A |
| TC BLOCKED | 38 | — | N/A |
| **Tỷ lệ pass** | N/A | — | N/A |
| Bug P0 mở | 0 (mobile) | 0 | N/A |
| Bug P1 mở | 0 (mobile; BUG-W02-068 là P2 harness) | — | N/A |
| Bug P2 mở | 1 (BUG-W02-068 — harness blocker) | — | N/A |

> 38 TC BLOCKED-by-harness (Run 9). 0 TC PASS/FAIL. Gate không được đánh giá. Blocker thuần harness/build — không phải product defect.

### 2.2 Phân bổ theo mức ưu tiên

| Mức ưu tiên | Tổng | PASS | FAIL | BLOCKED | SKIPPED | Tỷ lệ pass |
|---|---|---|---|---|---|---|
| P1 (Critical/High) | 14 | 0 | 0 | 14 | 0 | N/A |
| P2 (Medium) | 18 | 0 | 0 | 18 | 0 | N/A |
| P3 (Low) | 6 | 0 | 0 | 6 | 0 | N/A |

> Phân bổ theo TC artifact. Run 9: tất cả 38 BLOCKED-by-harness.

### 2.3 Phân bổ theo Execution Surface

| Execution Surface | Tổng | PASS | FAIL | BLOCKED | Tỷ lệ pass |
|---|---|---|---|---|---|
| E2E (cross-service, mobile native) | 38 | 0 | 0 | 38 | N/A |

### 2.4 Phân bổ theo nguồn thực thi

| Nguồn | Tổng | PASS | FAIL | BLOCKED | SKIPPED | Ghi chú |
|---|---|---|---|---|---|---|
| Automated | 38 | 0 | 0 | 38 | 0 | Run 9 — Patrol APK build fail BUG-W02-068 |
| Manual | — | — | — | — | — | Manual artifact TC-W02-MOBILE-E2E.md không được execute cycle này |

### 2.5 So sánh kết quả qua các lần chạy (multi-run trend)

| Chỉ số | Run 1 | Run 2 | Run 9 | Run 10 | Δ Run9→Run10 | Ngưỡng | Đạt latest? |
|---|---:|---:|---:|---:|---:|---|---|
| Total TC executed | 0 | 0 | 0 | 0 | 0 | — | N/A |
| PASS count | 0 | 0 | 0 | 0 | 0 | — | N/A |
| FAIL count | 0 | 0 | 0 | 0 | 0 | 0 | N/A |
| BLOCKED count | 0 | 0 | 38 | 38 | 0 | — | N/A |
| SKIPPED count | 38 | 38 | 0 | 0 | 0 | — | N/A |
| Tỷ lệ pass | N/A | N/A | N/A | N/A | — | — | N/A |
| Bugs P1 open (mobile) | 0 | 0 | 0 | 0 | 0 | 0 | N/A |
| New bugs filed | 0 | 0 | 1 (BUG-W02-068) | 1 (BUG-W02-136) | +1 | — | N/A |

---

## 3. Chi tiết theo Test Suite

### 3.1 Smoke Suite

| TC ID | Tiêu đề | Run 1 | Run 2 | Run 9 | Run 10 | Ghi chú |
|---|---|---|---|---|---|
| TC-W02-ME2E-001 | Kế toán tạo phiếu QT BH từ SO có BH — full flow panel 2 cột | SKIPPED | SKIPPED | BLOCKED | BUG-W02-068 — Patrol APK build fail |
| TC-W02-ME2E-002 | SO BH âm → bottom sheet ERR-INS-003 → confirm | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 |
| TC-W02-ME2E-006 | Kế toán lập hồ sơ BH full flow | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 |
| TC-W02-ME2E-019 | Kế toán xem hồ sơ BH đã xuất → PDF viewer → share/download | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 |
| TC-W02-ME2E-CR618-01-01 | [CR618-01] BH 100% + KH chịu phân bổ → tạo 2 phiếu QT | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 |
| TC-W02-ME2E-CR618-01-02 | [CR618-01] Chi tiết phiếu QT KH chỉ phân bổ BH — 3 khoản dấu + | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 |
| TC-W02-ME2E-CR618-02-01 | [CR618-02] In phiếu dịch vụ SO có BH → PDF preview 5×2 cột | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 |

### 3.2 Regression Suite

| TC ID | Tiêu đề | Wave gốc | Run 1 | Run 2 | Run 9 | Run 10 | Ghi chú |
|---|---|---|---|---|---|---|
| TC-W02-ME2E-003 | [regression] SO BH âm hoàn thành web → mobile reflect | W02 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 |
| TC-W02-ME2E-004 | [regression] Hồ sơ BH xuất web → mobile tab sync | W02 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 |
| TC-W02-ME2E-005 | [regression] Versioning bộ v1 web → v2 mobile → tab thứ tự đúng | W02 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 |
| TC-W02-ME2E-021 | [regression] SO không BH hoàn thành web → mobile không leak BH content | W02 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 |
| TC-W02-ME2E-022 | [regression] Share PDF / In phiếu QT BH vẫn hoạt động sau CR618 | W02 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 |
| TC-W02-ME2E-024 | [regression] Nút Thanh toán visible sau panel per-payer thay đổi | W02 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 |
| TC-W02-ME2E-026 | [regression] Chỉnh sửa phiếu QT BH trên mobile | W02 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 |
| TC-W02-ME2E-CR618-01-03 | [regression][CR618-01] SO không BH → chỉ 1 phiếu QT KH baseline | W02 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 |
| TC-W02-ME2E-CR618-01-04 | [regression][CR618-01] Web tạo 2 phiếu → mobile pull-to-refresh → 2 phiếu visible | W02 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 |
| TC-W02-ME2E-CR618-02-02 | [regression][CR618-02] SO không BH → In PDV → baseline không có khối Phân bổ BH | W02 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 |
| TC-W02-ME2E-REG-06 | [regression][co-located] Thanh toán phiếu QT BH → payment_status PAID | W02 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 |
| TC-W02-ME2E-REG-07 | [regression][co-located] SO BH dương → Hoàn thành → KHÔNG ERR-INS-003 → COMPLETED | W02 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 |

### 3.3 E2E Journeys

| Journey ID | Tên | Run 1 | Run 2 | Run 9 | Run 10 | Bước fail (nếu có) |
|---|---|---|---|---|---|
| J-ME2E-01 | Kế toán tạo phiếu QT BH + hồ sơ BH full flow mobile | SKIPPED | SKIPPED | BLOCKED | BLOCKED | APK build fail — BUG-W02-136 |
| J-ME2E-02 | SO BH âm warn-and-allow → complete → mobile reflect | SKIPPED | SKIPPED | BLOCKED | BLOCKED | APK build fail — BUG-W02-136 |
| J-ME2E-03 | Xuất hồ sơ BH native file picker → PDF viewer → share sheet | SKIPPED | SKIPPED | BLOCKED | BLOCKED | APK build fail — BUG-W02-136 |
| J-ME2E-04 | CR618-01 dual voucher mobile journey | SKIPPED | SKIPPED | BLOCKED | BLOCKED | APK build fail — BUG-W02-136 |
| J-ME2E-05 | CR618-02 In phiếu dịch vụ + native share sheet | SKIPPED | SKIPPED | BLOCKED | BLOCKED | APK build fail — BUG-W02-136 |

### 3.4 Functional TCs (Wave hiện tại) — Multi-run verdict

| TC ID | Tiêu đề | Mức ưu tiên | Run 1 | Run 2 | Run 9 | Run 10 | Linked Bug | Final verdict |
|---|---|---|---|---|---|---|---|
| TC-W02-ME2E-001 | Kế toán tạo phiếu QT BH full flow — panel 2 cột | P1 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-002 | SO BH âm → bottom sheet ERR-INS-003 → confirm | P1 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-003 | [regression] SO BH âm web → mobile reflect | P2 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-004 | [regression] Hồ sơ BH web → mobile tab sync | P1 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-005 | [regression] Versioning v1 web → v2 mobile | P2 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-006 | Lập hồ sơ BH full flow — điền 2 form + 4 checkbox + xuất | P1 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-007 | Xuất hồ sơ khi chưa tích → INS-3003 | P2 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-008 | Mở bộ hồ sơ đã xuất → chỉ xem, không sửa/xuất đè | P2 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-009 | Upload PDF Biên bản native picker → S3 → READY | P1 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-010 | Upload 5xx → retry → lần 2 thành công | P2 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-011 | File type .docx → reject không upload | P2 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-012 | File PDF > 10MB → reject size limit | P2 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-013 | Background giữa form Biên bản → return foreground → EC-1 data lost | P1 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-014 | Pull-to-refresh tab hồ sơ đã xuất → bộ mới nhất lên đầu | P1 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-015 | Tab hồ sơ đã xuất empty state khi chưa xuất | P2 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-016 | 5xx xuất hồ sơ → retry → success | P2 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-017 | Mất mạng mid-export → recover | P2 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-018 | Concurrent 2 device xuất cùng phiếu → 409 conflict | P2 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-019 | Tap PDF card → viewer → share/download native | P1 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-020 | PDF card tap khi storage lỗi → INS-009 | P3 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-021 | [regression] SO không BH hoàn thành → mobile không leak BH | P1 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-022 | [regression] Share PDF / In phiếu sau CR618 | P1 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-023 | Tạo bộ hồ sơ mới → màn mới trống, bộ cũ giữ nguyên | P2 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-024 | [regression] Thanh toán visible sau panel per-payer | P2 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-025 | Session expiry giữa xuất hồ sơ → token refresh / re-login | P2 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-026 | [regression] Chỉnh sửa phiếu QT BH → lưu → số liệu đúng | P2 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-027 | Phân quyền accountant + garage-owner → menu đúng per persona | P2 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-028 | Back từ form Biên bản có data chưa lưu → EC-1 / confirm discard | P2 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-029 | Wording tiếng Việt key labels màn hồ sơ BH | P3 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-CR618-01-01 | [CR618-01] BH 100% + KH chịu phân bổ → 2 phiếu QT | P1 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-CR618-01-02 | [CR618-01] Chi tiết phiếu QT KH chỉ phân bổ BH — 3 khoản dấu + | P1 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-CR618-01-03 | [regression][CR618-01] SO không BH → 1 phiếu QT baseline | P2 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-CR618-01-04 | [regression][CR618-01] Web tạo 2 phiếu → mobile pull-to-refresh | P2 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-CR618-02-01 | [CR618-02] In PDV SO có BH → PDF 5×2 cột + share sheet native | P1 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-CR618-02-02 | [regression][CR618-02] SO không BH → In PDV → baseline | P2 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-CR618-02-03 | [CR618-02] SO BH 5 khoản = 0 → bằng chữ "Không đồng" | P3 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-REG-06 | [regression][co-located] Thanh toán phiếu QT BH → payment_status PAID | P1 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |
| TC-W02-ME2E-REG-07 | [regression][co-located] SO BH dương → Hoàn thành → KHÔNG ERR-INS-003 → COMPLETED | P1 | SKIPPED | SKIPPED | BLOCKED | BLOCKED | BUG-W02-136 | BLOCKED |

---

## 4. BLOCKER Detail — Run 9 (2026-06-24)

### 4.1 Failing Command (Retry 2 — identical error cả 2 retry)

```
cd /Users/all_engineer/phinh/garage-agentic-design/mobile/gf-garage-app
$HOME/.pub-cache/bin/patrol test \
  --flavor dev \
  --target /Users/all_engineer/.Kaiser/garage-agentic-design/Execution/auto/specs/W02/mobile-e2e/harness_smoke_patrol_test.dart \
  -d emulator-5554
```

### 4.2 Error Output (cuối cùng của Gradle)

```
Execution failed for task ':app:processDevDebugAndroidTestManifest'.
> Could not resolve all files for configuration ':app:devDebugAndroidTestRuntimeClasspath'.
   > Could not resolve androidx.test:runner:1.6.2.
     Required by: project :app
     > Cannot find a version of 'androidx.test:runner' that satisfies the version constraints:
          Dependency path 'android:app:unspecified' --> 'androidx.test:runner:1.6.2'
          Constraint path 'android:app:unspecified' --> 'androidx.test:runner:{strictly 1.5.1}'
          because of the following reason: version resolved in configuration
          ':app:devDebugRuntimeClasspath' by consistent resolution

BUILD FAILED in 31s
```

### 4.3 Root Cause Analysis

| Element | Value |
|---|---|
| Conflict source | `android/app/build.gradle:201`: `androidTestImplementation "androidx.test:runner:1.6.2"` |
| Constraint source | `patrol` package ^4.6.1 (git ref) đã resolve `runner:1.5.1` trong `devDebugRuntimeClasspath` → AGP consistent resolution enforce `{strictly 1.5.1}` cho test classpath |
| Nature of conflict | `1.6.2 ≠ 1.5.1` — AGP strict mode không allow version override cho test classpath khi main classpath đã chốt |
| Root code location | `android/app/build.gradle:199–203` (block `BEGIN Patrol E2E test instrumentation`) — DUPLICATE của block `Patrol native automation` line 196–197 (`runner` khai báo lại với version mới hơn) |
| Additional duplicates | `testOptions { execution "ANDROIDX_TEST_ORCHESTRATOR" }` khai báo 2 lần (line 163–166 + line 168–172); `testInstrumentationRunner` khai báo 2 lần trong `defaultConfig` (line 117–119 + 121–125) |
| Fix path | Sửa `runner:1.6.2` → `runner:1.5.1` tại `build.gradle:201`; HOẶC xoá toàn bộ block duplicate `BEGIN Patrol E2E test instrumentation` (lines 199–203) vì là duplicate của block `Patrol native automation` (line 196–197) |
| Owner | `agent-fix-garage-mobile` |
| Bug ref | BUG-W02-068 (P2, OPEN) |
| Rule constraint | Rule #11 (Design repo NO-CODE): QC-owned harness không thể edit `android/app/build.gradle` (production source) |

### 4.4 Pre-flight Items PASSED (Run 9)

Các hạng mục sau đã hoàn thành thành công trước khi gặp blocker:

| Item | Status | Detail |
|---|---|---|
| Flutter SDK | PASS | Flutter 3.44.1 / Dart 3.12.1 |
| patrol_cli | PASS | patrol_cli 4.4.0 (path-sanitization patched) |
| Android emulator | PASS | emulator-5554 Pixel6_API33_arm64 booted (`boot_completed=1`) |
| BFF connectivity | PASS | `192.168.110.191:45401` → HTTP 200 từ emulator (`nc` test) |
| Flavor dev endpoints | PASS | `graphQLUrl = "http://192.168.110.191:45401/garage/graphql"`, `graphQLSSOUrl = "http://192.168.110.191:45410/graphql"` |
| Smoke spec API patch | PASS | `$.pumpAndSettle(duration: const Duration(seconds: 5))` — named param patrol ^4.x |
| Seed data 2026-06-24 | PASS | PDV-20260624-00009 / SET-20260624-00006 seeded via `seed-w02-mobile-e2e.sh` |
| Mobile code at HEAD | PASS | BUG-W02-023/024/025/026 FIX_DONE confirmed at HEAD |

---

## 5. Coverage Report

### 5.1 Code Coverage

N/A — không có execution (APK build fail). Patrol/integration_test không chạy trong Run 9.

### 5.2 TC Coverage (Traceability)

| Feature ID | Tổng AC | AC có TC | AC chưa có TC | Coverage |
|---|---|---|---|---|
| FEAT-INS-STL-CREATE | — | — | — | BLOCKED |
| FEAT-INS-DOSSIER-CREATE | — | — | — | BLOCKED |
| FEAT-INS-DOSSIER-VIEW | — | — | — | BLOCKED |

> Coverage không được đánh giá — APK build fail. TC artifact đã sẵn sàng ở trạng thái BLOCKED-by-harness — chờ BUG-W02-068 resolved (agent-fix-garage-mobile sửa `build.gradle:201`).

---

## 6. Performance Metrics

N/A — không áp dụng cycle này.

---

## 7. Issues phát hiện

### 7.1 Bug mới filed trong Run 9

| Bug ID | Severity | Status | Tiêu đề | Owner |
|---|---|---|---|---|
| BUG-W02-068 | P2 | INVALID | Patrol APK build BLOCKED (marked INVALID 2026-06-24 — false-positive claim; Run 10 re-confirms underlying code issue still present) | agent-fix-garage-mobile |

### 7.1b Bug mới filed trong Run 10

| Bug ID | Severity | Status | Tiêu đề | Owner |
|---|---|---|---|---|
| BUG-W02-136 | P2 | OPEN | Run 10 re-confirms: Patrol APK build BLOCKED — `androidx.test:runner:1.6.2` vs `{strictly 1.5.1}` AGP consistent resolution conflict trong `android/app/build.gradle:201` STILL PRESENT after BUG-W02-068 INVALID | agent-fix-garage-mobile |

### 7.2 Bug Verification Deferral (mobile-e2e owned / cascade)

Theo nhiệm vụ, các bugs có TC map tới mobile E2E vẫn chưa được verify vì APK build fail:

| Bug ID | Status hiện tại | Mobile E2E TC ref | Deferral action |
|---|---|---|---|
| BUG-W02-023 | FIX_DONE | `TC-W02-MOB-E2E-DOSSIER-CREATE-VIEW-FLOW` | Deferred — APK build fail (BUG-W02-068); require BUG-W02-068 resolved trước |
| BUG-W02-024 | FIX_DONE | `TC-W02-MOB-E2E-DOSSIER-EXPORT-HAPPY` | Deferred — same blocker |
| BUG-W02-025 | FIX_DONE | `TC-W02-MOB-E2E-DOSSIER-EXPORT-HAPPY` | Deferred — same blocker |
| BUG-W02-026 | FIX_DONE | `TC-W02-MOB-E2E-DOSSIER-EXPORT-HAPPY` | Deferred — same blocker |

> Re-run chính thức phải xảy ra SAU KHI `agent-fix-garage-mobile` resolve BUG-W02-068 (`build.gradle:201` runner version fix). Không thể verify bất kỳ mobile E2E TC nào khi APK build fail.

### 7.3 Observation từ pre-flight (không phải product defect)

Trong quá trình pre-flight Run 9, phát hiện thêm 2 vấn đề không phải product bug nhưng cần note:

1. **Duplicate Gradle blocks** — `android/app/build.gradle` có 2 duplicate block từ 2 thời điểm thêm Patrol config khác nhau: `testInstrumentationRunner` khai báo 2 lần (line 117 + 121), `testOptions` khai báo 2 lần (line 163 + 168), `androidTestUtil orchestrator:1.5.1` khai báo 2 lần (line 197 + 202). Duplicate chỉ gây noise; conflict thực sự là `runner:1.6.2` (line 201) vs `{strictly 1.5.1}`. Fix BUG-W02-068 nên dọn duplicate đồng thời.

2. **patrol.yaml package_name** — `Execution/auto/harness/patrol/patrol.yaml` still references `com.cardoctor.garage.squad.stag` (stag flavor) nhưng build phải dùng flavor `dev` (`com.cardoctor.garage.squad.dev`) vì stag flavor có empty BFF endpoints. QC harness patrol.yaml cần update sang `dev` khi BUG-W02-068 resolved. (Đây là harness config issue, không phải product defect.)

### 7.4 Handoff cập nhật registry / tracker (nếu cần)

| Artifact đích | Wave / TC / Metric | Giá trị đề xuất | Owner cập nhật |
|---|---|---|---|
| `Execution/test-cases/TEST-CASE-REGISTRY.md` | TC-W02-MOBILE-E2E aggregate | `BLOCKED=38 PASS=0 FAIL=0 SKIPPED=0` | QA Authority |
| `Execution/WAVE-TRACKER.md` | Mobile E2E W02 verdict | `BLOCKED — BUG-W02-068 (Patrol APK build runner version conflict); re-run sau agent-fix-garage-mobile resolve build.gradle:201` | Delivery Authority / QA Authority |

---

## 8. Kết luận

### 8.1 Verdict

| Tiêu chí | Kết quả | Ghi chú |
|---|---|---|
| Smoke đạt ngưỡng active gate? | N/A | Không execute — APK build fail (BUG-W02-068) |
| Regression đạt ngưỡng active gate? | N/A | Không execute |
| E2E Journeys đạt ngưỡng active gate? | N/A | Không execute |
| Coverage đạt ngưỡng active gate? | N/A | Không execute |
| Bug P0 = 0? | N/A | Không file product bug cycle này; BUG-W02-068 là harness/infra P2 |
| Open bugs đạt ngưỡng active gate? | N/A | BUG-W02-068 (harness) — không phải product gate |
| Tenant isolation = 0 leakage? | N/A | Không execute |

### 8.2 Quyết định

- [x] **BLOCKED** — Mobile E2E W02 execution (Run 10, 2026-06-26) BLOCKED toàn bộ 38 TC do Patrol APK build fail (BUG-W02-136: `androidx.test:runner` version conflict trong `android/app/build.gradle:201` CONFIRMED vẫn còn sau BUG-W02-068 INVALID). Fix phải thực hiện bởi `agent-fix-garage-mobile` (sửa `runner:1.6.2` → `1.5.1` hoặc xoá block duplicate). Không thể unblock từ QC-owned harness phía design repo.

> Verdict mobile E2E BLOCKED do harness bug, KHÔNG phải product defect. Không ảnh hưởng đến gate verdict của các agent khác (web E2E, API, UI — đã/đang execute riêng biệt). Mobile slice re-activate sau BUG-W02-136 resolved (= `build.gradle:201` runner version fix).

### 8.3 Ghi chú cho re-run cycle sau BUG-W02-068 resolved

1. `agent-fix-garage-mobile` sửa `android/app/build.gradle:201`: `androidTestImplementation "androidx.test:runner:1.6.2"` → `"androidx.test:runner:1.5.1"` (hoặc xoá block duplicate lines 199–203 — block `Patrol native automation` line 196–197 đã đủ).
2. Sau khi fix pushed, cập nhật `Execution/auto/harness/patrol/patrol.yaml`: `package_name: com.cardoctor.garage.squad.dev` + `flavor: dev` (vì stag flavor có empty endpoints).
3. Re-run smoke preflight: `patrol test --target Execution/auto/specs/W02/mobile-e2e/harness_smoke_patrol_test.dart -d emulator-5554 --flavor dev`.
4. Nếu smoke PASS, chạy full TC suite với fresh seed data ngày chạy.
5. Verify BUG-W02-023/024/025/026 (FIX_DONE) bằng Patrol live device sau khi APK build unblocked.
6. Update TC artifact: BLOCKED-by-harness → READY → execute → PASS/FAIL per result thực tế.

---

## Changelog

| Ngày | Thay đổi | Tác giả |
|---|---|---|
| 2026-06-22 | v1: Khởi tạo TR-W02-MOBILE-E2E. Kết luận SKIPPED toàn bộ 38 TC — mobile DEV PAUSED (R-FID 19+ PNG gap, APK env-blocked). User-authorized scope reduction cycle 2026-06-22. Bug verify deferred (BUG-W02-023 mobile_e2e cascade). Lesson learn entry appended. | agent-test-mobile-e2e |
| 2026-06-22 | v2: Run 2 — no change, mobile dev still paused, all 38 TCs remain SKIPPED (mobile-dev-paused-2026-06-22). BUG-W02-024/025/026 P0 mobile FIX_DONE NOT verified — requires device/emulator and mobile dev completion. §1.5 Run Timeline updated with Run 2 row. §2.5 multi-run trend updated (Run 2 column added). §3.4 functional TC table updated with Run 2 column. §7.1 deferral note added for BUG-W02-024/025/026. | agent-test-mobile-e2e |
| 2026-06-26 | v4: Run 10 (2026-06-26) — BLOCKED (confirmed). Re-attempt per briefing (BUG-W02-068 INVALID). Pre-flight PASSED: Flutter 3.44.1 + patrol_cli 4.4.0 + emulator-5554 API 33 booted + BFF 192.168.110.191:45401 reachable + gf-sales/accounting UP + seed fresh 2026-06-26 (PDV-20260626-00008/SET-20260626-00010). Patrol build retry 1 (no --flavor): FAIL — assembleDebugAndroidTest ambiguous. Patrol build retry 2 (--flavor dev): FAIL — runner:1.6.2 vs {strictly 1.5.1} conflict STILL PRESENT. BUG-W02-068 INVALID reclassification was incorrect for the underlying code issue. Filed BUG-W02-136 (P2, OPEN, agent-fix-garage-mobile). TC artifact updated: version 4→5, block_reason refreshed, Bug ID updated to BUG-W02-136. 38 TC remain BLOCKED-by-harness. §1.5 Run Timeline: Run 10 row added. §2.5 multi-run trend: Run 10 column added. §3.1-3.4: Run 10 column added. §7.1b: BUG-W02-136 filed. §8.2 verdict updated. | agent-test-mobile-e2e (Run 10, 2026-06-26) |
| 2026-06-24 | v3: Run 9 (2026-06-24) — BLOCKED. Patrol APK build fail BUG-W02-068 (`androidx.test:runner:1.6.2` vs `{strictly 1.5.1}` AGP consistent resolution conflict `build.gradle:201`). 38 TC chuyển BLOCKED-by-harness (từ SKIPPED). Pre-flight items PASSED: Flutter 3.44.1 + patrol_cli 4.4.0 + emulator-5554 booted + BFF `192.168.110.191:45401` reachable + flavor dev endpoints đúng + smoke spec patched (pumpAndSettle named param) + seed data 2026-06-24. 2 Patrol build retry exhausted. Bug filed: BUG-W02-068 (P2, OPEN, agent-fix-garage-mobile). Status: SKIPPED→BLOCKED. §1.5 Run Timeline: Run 9 row added. §2.x stats: BLOCKED=38, SKIPPED=0. §3.1..3.4: Run 9 column added (all BLOCKED). §4 Blocker Detail: failing command + error output + root cause analysis + pre-flight items PASSED. §7.1: BUG-W02-068 filed. §7.2: bug verify deferral updated. §7.3: pre-flight observations. §8 verdict: BLOCKED. Lesson learn entry TL-W02-MOB-E2E-003 added (separate file). | agent-test-mobile-e2e (Run 9) |
