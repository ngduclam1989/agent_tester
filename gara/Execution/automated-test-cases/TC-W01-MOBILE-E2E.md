---
document_id: 'GMS-TC-W01-MOBILE-E2E'
type: test-case
parent: 'Execution/test-cases/TEST-CASE-REGISTRY.md'
status: ACTIVE
version: 3
boundary: 'garage-mobile, gf-sales, gf-accounting, agg-garage-graph'
wave: 'W01'
owner: 'agent-test-mobile-e2e'
last_reviewed: '2026-06-11'
---

# Test Case Automated — W01: Mobile E2E (FEAT-INS-SO-ADJUSTMENT + FEAT-INS-STL-DETAIL)

> Cross-ref manual: `Execution/test-cases/TC-W01-MOBILE-E2E.md` — 3 TC cross-platform sync (TC-W01-E2E-002, TC-W01-E2E-023, TC-W01-E2E-025).
> Cross-ref web E2E: `Execution/automated-test-cases/TC-W01-E2E.md` (web counterpart journey).

---

## 1. General Info

| Field         | Value                                                                      |
| ------------- | -------------------------------------------------------------------------- |
| Document ID   | `GMS-TC-W01-MOBILE-E2E`                                                    |
| Wave          | W01                                                                        |
| Boundary(ies) | `garage-mobile`, `gf-sales`, `gf-accounting`, `agg-garage-graph`           |
| Feature(s)    | `FEAT-INS-SO-ADJUSTMENT`, `FEAT-INS-STL-DETAIL`                            |
| Owner         | `agent-test-mobile-e2e`                                                    |
| Last Reviewed | 2026-06-11                                                                 |
| Work Package  | `Execution/work-packages/PKG-W01-insurance-foundation.md`                  |

---

## 2. Scope

### In Scope

- Journey mobile end-to-end: SO Edit → nhập 5 khoản điều chỉnh BH → lưu → realtime preview → persist + outbox event (`FEAT-INS-SO-ADJUSTMENT`).
- Journey mobile: mở phiếu QT BH → 4 tab + panel "Tổng giá dịch vụ" + lịch sử thanh toán read-only (`FEAT-INS-STL-DETAIL`).
- Native interaction: deeplink (Android App Links + iOS Universal Links) đến màn chi tiết phiếu QT BH.
- Native interaction: FCM push background → system tray → tap → navigate màn chi tiết.
- Native interaction: background/foreground state restoration (form chưa lưu).
- Native interaction: offline mid-save → snackbar mất kết nối.
- Exception/Recovery: token refresh silent, BH thanh toán âm (warning + allow save), 5xx retry, field-level validation.
- Phân quyền: cả kế toán và chủ garage nhập được section Phân bổ BH.
- Regression: SO Create KHÔNG hiển thị section Phân bổ BH (AC-0 regression).
- Authentication flow + logout + localization Vietnamese.
- iOS-specific: Universal Link cold start (TC-MOB-025 — iOS only spec).

### Out of Scope

- UI render/wording chi tiết isolated từng widget → `agent-test-mobile-ui`.
- API contract / schema validation → `agent-test-api`.
- Cross-tenant denial → `agent-test-isolation`.
- App store review, in giấy tờ vật lý, device thật chuyên biệt không có trong CI farm → `out-of-automation-scope`.
- Dossier creation (W02 scope) → deferred.
- Biometric login (local_auth) → `out-of-wave` (không có trong W01 feature scope).
- Camera capture (image_picker) cho hồ sơ bảo lãnh → baseline production upload, không dev lần này (AC-2 baseline).
- Offline-first CRUD → `spec-gap` (PKG-W01 §2.2 chốt: SO save cần online).
- Web journey counterpart → `agent-test-e2e` (`TC-W01-E2E.md`).

### Test Environment & Data

| Item | Required Data / Setup | Notes |
| ---- | --------------------- | ----- |
| **Runner chính (C3/C4)** | QC-owned harness `Execution/auto/harness/patrol/` — `patrol_cli >= 2.8.0` | `cd Execution/auto/harness/patrol && flutter pub get && dart pub global activate patrol_cli` |
| **Runner phụ (C1/C2)** | QC-owned harness `Execution/auto/harness/integration-test/` — `flutter test integration_test/...` | Cho TC không cần native (auth/localization/permission check) |
| **Device matrix (C3)** | Android API 33 emulator (Pixel 6 API 33, ID: `emulator-5554`) + Android API 28 min-supported | `flutter emulators --launch Pixel_6_API_33` |
| **Device matrix (C4)** | + iOS 16+ simulator (iPhone 14 iOS 16.4, ID: `<sim-udid>`) | `xcrun simctl boot <udid>` |
| **iOS-only TC (C4)** | iOS 16+ simulator — TC-MOB-025 Universal Link | `xcrun simctl openurl <udid> https://app.garage.test/settlements/SET-W01-INS-001` |
| **BFF URL** | `http://10.0.2.2:3000` (Android emulator) / `http://localhost:3000` (iOS sim) | `--dart-define=BFF_BASE_URL=<url>` |
| **FCM test project** | `gms-test-firebase` (KHÔNG prod) | Tạo service account key cho test helper |
| **Firebase tokens** | Dùng real device token từ FCM test instance — KHÔNG `'fake_token'` | Token tự register khi app login + FCM permission grant |
| **Deeplink domain** | `app.garage.test` — test subdomain | `--dart-define=DEEPLINK_DOMAIN=app.garage.test` |
| **Universal Link domain** | `apple-app-site-association` trên `https://app.garage.test/.well-known/` | Cấu hình trên test subdomain |
| **Seed SO test** | `SO-W01-TEST-001`: SO hoàn thành, toggle BH=Có, chưa có phiếu QT | Setup qua API trước test suite |
| **Seed SO test** | `SO-W01-TEST-002`: SO hoàn thành để test save flow | |
| **Seed SO test** | `SO-W01-TEST-003`: SO với Cộng sau VAT BH nhỏ, để test BH âm | |
| **Seed phiếu QT BH** | `SET-W01-INS-001`: phiếu QT BH tenant `garage-a`, DRAFT state | |
| **Seed phiếu QT BH** | `SET-W01-INS-002`: phiếu QT BH với allocation = ví dụ thực (BH=197.680.000) | |
| **Seed phiếu QT BH** | `SET-W01-INS-003`: phiếu QT BH để test FCM push | |
| **Account kế toán** | `accountant@garage-a.test` / `Test@123456` — tenant `garage-a` | |
| **Account chủ garage** | `owner@garage-a.test` / `Test@123456` — tenant `garage-a` | |
| **Flutter SDK** | Flutter 3.41+ / Dart 3.11+ | `flutter --version` để verify |
| **Bootstrap lệnh** | `dart pub global activate patrol_cli` | Verify: `patrol --version` |
| **Device boot check** | Android: `adb devices` / iOS: `xcrun simctl list devices booted` | Phải có device trước khi chạy |
| **Smoke preflight** | `patrol test --target Execution/auto/specs/W01/mobile-e2e/smoke_patrol_test.dart -d <id>` | Smoke PASS = cluster C3 ready |

**Coverage Map (common-testcase-mobile-e2e.md §1-§21):**

| Common Group | Status | TC(s) |
|---|---|---|
| §1 Auth flows (AUTH-001..007) | `covered` (001,004,005,006) / `adapted` (003 biometric = out-of-wave W01) | TC-MOB-030,031,032,012 |
| §2 CRUD full flows (CRUD-001..006) | `covered` (001 Save+outbox / 003 Update allocation) / `adapted` (005 file picker = baseline không dev) / `adapted` (006 camera = baseline không dev) | TC-MOB-005 |
| §3 Search & Filter | `out-of-scope` — W01 không có màn search mới cho BH | — |
| §4 Pagination + pull-to-refresh | `out-of-scope` — list phiếu QT baseline, không thay đổi W01 | — |
| §5 File upload/download | `out-of-scope+lý do` — "Hồ sơ bảo lãnh" upload là baseline production (AC-2), không dev lần này; MOB-E2E-FIL = baseline coverage | — |
| §6 Camera capture | `out-of-scope+lý do` — camera capture cho hồ sơ BH = FEAT-INS-DOSSIER-CREATE (W02 scope) | — |
| §7 Permission/Role-based | `covered` (PRM-001 kế toán / PRM-002 owner) | TC-MOB-033, TC-MOB-014 |
| §8 Push notification (FCM) | `covered` (PSH-001 permission grant / PSH-003 background) / `spec-gap` (PSH-002 foreground / PSH-004 terminated / PSH-005 group / PSH-006 denial) | TC-MOB-023 |
| §9 Deeplink flows | `covered` (DPL-001 Android + iOS / DPL-002 foreground / DPL-004 not found / DPL-005 auth) / `spec-gap` (DPL-003 background = similar DPL-002) | TC-MOB-020,021,022,025 |
| §10 Navigation back/system back | `out-of-scope+lý do` — navigation back không thay đổi ở W01; agent-test-mobile-ui coverage | — |
| §11 Offline-to-online sync | `covered` (offline mid-save snackbar) / `out-of-scope` (offline-first = không có per PKG §2.2) | TC-MOB-011 |
| §12 App lifecycle (background/foreground) | `covered` (LIF-001 form state restored / LIF-005 via TC-MOB-010) | TC-MOB-010 |
| §13 Concurrent/multi-device | `spec-gap` — requires 2-device setup, deferred | — |
| §14 Network resilience | `covered` (NET-005 mid-action offline / NET-002 5xx via TC-MOB-011) | TC-MOB-011 |
| §15 Localization Vietnamese | `covered` (LOC-001) | TC-MOB-034 |
| §16 App store install/update | `out-of-scope+lý do` — W01 không có force-update logic mới | — |
| §17 Performance sanity | `out-of-scope+lý do` — SLO formal = agent-test-performance | — |
| §18 OS-level interrupt | `out-of-scope+lý do` — không thay đổi W01; device-thật chuyên biệt required | — |
| §19 Install/Uninstall/Update | `out-of-scope+lý do` — không thay đổi W01 | — |
| §20 Cross-version compat | `out-of-scope+lý do` — không có schema migration cục bộ W01 | — |
| §21 External link/inter-app | `out-of-scope+lý do` — không có external link mới W01 ngoài deeplink đã cover | — |

**Regression scope (Step 3.1):**
- SO Create KHÔNG hiển thị section Phân bổ BH → TC-MOB-001 (nhãn `regression` — cần Patrol live re-run).
- SO Edit toggle BH=Không → section ẩn → TC-W01-E2E-023 (từ manual cross-platform, adapted vào TC-MOB-002b).
- Phiếu QT baseline (layout mới shared KH+BH) → TC-MOB-015 (4 tab dùng layout mới cho cả 2 loại phiếu per DEV NOTE §2.2).

**Auto vs Manual Parity Audit:**

| Manual TC | Auto status | Phân loại |
|---|---|---|
| TC-W01-E2E-002 (Web nhập → Mobile sync) | TC-MOB-005 + cross-platform note | `covered` (mobile side assertion trong TC-MOB-005; web side → TC-W01-E2E từ agent-test-e2e) |
| TC-W01-E2E-023 (Web toggle BH=Không → Mobile ẩn) | TC-MOB-002 covers toggle BH=Có; TC-MOB-001 covers AC-0 | `covered-by-other-agent` (web toggle = agent-test-e2e; mobile Detail AC-1 = TC-MOB-002) |
| TC-W01-E2E-025 (Web xem QT BH → Mobile sync dữ liệu) | TC-MOB-017 covers số liệu đúng từ API; cross-platform parity = web side covers TC-W01-E2E | `covered` (mobile số liệu = TC-MOB-017; web number parity = agent-test-e2e) |

Không còn `auto-miss` chưa phân loại.

**Self-Audit (Coverage Depth Gate):**
- Impacted production journey: SO Create/Edit flow → TC-MOB-001 (regression label), TC-MOB-002.
- Phiếu QT BH detail layout (dùng chung KH+BH per DEV NOTE) → TC-MOB-015 assert layout mới đúng.
- Exception/Timeout coverage (10 nhánh): Network timeout `covered` TC-MOB-011; 5xx retry `covered` TC-MOB-011 notes; concurrent-edit `spec-gap` (deferred); session expiry `covered` TC-MOB-012; partial failure `covered` TC-MOB-009 notes; permission denied `out-of-wave` (camera baseline); deeplink edge cases `covered` TC-MOB-020/021/022; push edge cases `covered` TC-MOB-023; background-foreground `covered` TC-MOB-010; offline `covered` TC-MOB-011.

---

## 3. Status Summary

| Coverage Mode | Total | Status Summary |
| ------------- | ----- | -------------- |
| Automated | 30 | **Run 1 (2026-06-11)**: 0 PASS / 0 FAIL / 30 BLOCKED-by-harness (Flutter SDK + adb + xcrun absent). **Run 2 (2026-06-11)**: 0 PASS / 0 FAIL / 29 BLOCKED-by-harness (QC harness skeleton incomplete) / 1 SKIPPED (TC-MOB-025 iOS — CR-1781166951). |
| Manual | 3 | Xem `Execution/test-cases/TC-W01-MOBILE-E2E.md` (3 READY — cross-platform sync, covered by TC-MOB-005/015/017) |

> **BLOCKED-by-harness** (Run 1 + Run 2): Run 1 — Flutter SDK absent. Run 2 — Flutter 3.44.1 + Dart 3.12.1 + patrol_cli 2.8.0 + emulator-5554 pixel6_api33 (booted, swiftshader) tất cả PRESENT; tuy nhiên QC harness tại `Execution/auto/harness/patrol/` là skeleton thiếu `android/`, `lib/main.dart`, `integration_test/` — patrol build command `./gradlew :app:assembleDebug` fail `ProcessException: No such file or directory`. Không fallback code-inspection (MOBILE_E2E_INSPECTION_PASS).
>
> **TC-MOB-025 SKIPPED**: iOS Universal Link — CR-1781166951 APPROVED — Ubuntu host không hỗ trợ xcrun/Xcode. Defer đến CI macOS runner.
>
> **Unblock C3/C4**: Thêm `android/`, `lib/main.dart`, `integration_test/`, `android/app/src/androidTest/MainActivityTest.java` vào `Execution/auto/harness/patrol/` (hoặc dùng project-native setup trong `mobile/gf-garage-app/` sau khi add Patrol dependency). Evidence: `Execution/auto/evidence/W01/mobile-e2e/env-gate-run2.md`.
>
> **Unblock C1/C2**: Thêm `android/`, `lib/main.dart`, `integration_test/` vào `Execution/auto/harness/integration-test/`.

---

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W01-MOB-001 | FEAT-INS-SO-ADJUSTMENT | garage-mobile, gf-sales, agg-garage-graph | AC-0 | E2E | Regression | P1 | [REGRESSION] Kế toán vào SO Create → section "Phân bổ quyết toán bảo hiểm" KHÔNG hiển thị | Cluster C3; app cold start; login `accountant@garage-a.test`; BFF + gf-sales reachable; seed SO Create flow | 1. Từ Home, tap "Tạo phiếu dịch vụ".<br>2. Quan sát body màn Create. | - Màn Tạo phiếu dịch vụ render thành công.<br>- Section "Phân bổ quyết toán bảo hiểm" KHÔNG xuất hiện ở bất kỳ vị trí nào.<br>- Form Create giữ nguyên baseline (không có 5 khoản điều chỉnh). | BLOCKED-by-harness | N/A |
| TC-W01-MOB-002 | FEAT-INS-SO-ADJUSTMENT | garage-mobile, gf-sales, agg-garage-graph | AC-1 | E2E | Wave | P1 | Kế toán vào SO Edit toggle Bảo hiểm=Có → section "Phân bổ quyết toán bảo hiểm" xuất hiện; toggle Không → ẩn | Cluster C3; login kế toán; seed SO-W01-TEST-001 (editable, chưa phiếu QT); BFF reachable | 1. Từ Danh sách SO, mở SO-W01-TEST-001.<br>2. Tap "Chỉnh sửa".<br>3. Tap "Có" tại mục "Bảo hiểm".<br>4. Quan sát section xuất hiện.<br>5. Tap "Không" tại mục "Bảo hiểm".<br>6. Quan sát section. | - Sau bước 3: section "Phân bổ quyết toán bảo hiểm" xuất hiện cùng panel "Tổng giá dịch vụ".<br>- 5 trường nhập (CK liên kết VT, CK liên kết CDV, Khấu hao, Giảm trừ bồi thường, Khấu trừ BH) hiển thị với input + dropdown đơn vị.<br>- Nút "Áp dụng tất cả" hiển thị.<br>- Sau bước 5: section ẩn hoàn toàn. | BLOCKED-by-harness | N/A |
| TC-W01-MOB-003 | FEAT-INS-SO-ADJUSTMENT | garage-mobile, gf-sales | AC-3, AC-4, AC-6, AC-7, AC-9, AC-10, AC-11 | E2E | Wave | P1 | Kế toán nhập 5 khoản điều chỉnh BH (CK VT, CK CDV, giảm trừ, khấu trừ, khấu hao) → panel Tổng giá dịch vụ cập nhật realtime | Cluster C3; SO Edit mode, BH=Có đã toggle; seed SO với dòng phụ tùng BH | 1. Trong SO Edit (BH=Có), nhập CK liên kết VT = 5.000.000 VND.<br>2. Nhập CK liên kết CDV = 2.500.000 VND.<br>3. Nhập Giảm trừ bồi thường = 2.000.000 VND.<br>4. Nhập Khấu trừ BH = 520.000 VND.<br>5. Quan sát panel Tổng giá dịch vụ sau mỗi thay đổi. | - Panel "Tổng giá dịch vụ" cập nhật realtime sau mỗi bước nhập.<br>- Bảng "Chi tiết theo bên thanh toán" hiển thị đúng BH/KH columns.<br>- Bảng "Phân bổ Bảo hiểm": CK liên kết dấu − màu xanh; giảm trừ/khấu hao/khấu trừ dấu + màu đỏ.<br>- "BH thanh toán", "Khách hàng thanh toán", "Tổng thanh toán" hiển thị số tiền.<br>- Không có validation error. | BLOCKED-by-harness | N/A |
| TC-W01-MOB-004 | FEAT-INS-SO-ADJUSTMENT | garage-mobile, gf-sales | AC-5, AC-8 | E2E | Wave | P1 | Kế toán nhập khấu hao 20% + nhấn "Áp dụng tất cả" → mọi dòng phụ tùng BH set 20% | Cluster C3; SO Edit, BH=Có; seed SO có ≥2 dòng phụ tùng BH | 1. Trong SO Edit (BH=Có), tìm trường "Khấu hao vật tư / thay mới" header.<br>2. Nhập 20% vào trường header.<br>3. Tap "Áp dụng tất cả".<br>4. Quan sát cột "Khấu hao (%)" trên từng dòng phụ tùng BH. | - Sau bước 3: mọi dòng phụ tùng BH trong bảng đều hiển thị 20% ở cột "Khấu hao (%)".<br>- Dòng công dịch vụ KHÔNG có cột Khấu hao (chỉ áp dụng phụ tùng — AC-5).<br>- Kế toán có thể override từng dòng riêng sau đó. | BLOCKED-by-harness | N/A |
| TC-W01-MOB-005 | FEAT-INS-SO-ADJUSTMENT | garage-mobile, gf-sales, agg-garage-graph | AC-13 | E2E | Wave | P1 | Kế toán lưu SO với phân bổ BH → API gf-sales persist + Detail hiển thị read-only đúng giá trị | Cluster C3 (với C2 DB observer nếu available); SO-W01-TEST-002; login kế toán | 1. Mở SO-W01-TEST-002 → Chỉnh sửa.<br>2. Toggle BH=Có.<br>3. Nhập CK liên kết VT = 5.000.000 VND.<br>4. Tap "Lưu".<br>5. Quan sát SnackBar + navigation.<br>6. Quan sát màn SO Detail. | - SnackBar "Lưu thành công" hiển thị sau tap Lưu.<br>- App navigate về SO Detail.<br>- Section "Phân bổ quyết toán bảo hiểm" read-only ở Detail hiển thị 5.000.000 CK liên kết VT.<br>- Panel "Tổng giá dịch vụ" read-only hiển thị đúng.<br>- (C2) gf-sales DB: `discount_material_value` = 5000000 persist với đúng `tenant_id`. | BLOCKED-by-harness | N/A |
| TC-W01-MOB-006 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-2 (baseline) | E2E | Wave | P2 | [BLOCKED-by-harness] Upload "Hồ sơ bảo lãnh" qua native file picker (AC-2 baseline — native file picker không dev lần này) | Cluster C3; native file picker available; iOS Files app / Android SAF configured | 1. SO Edit, BH=Có.<br>2. Tap khu vực "Hồ sơ bảo lãnh" → native file picker mở.<br>3. Chọn file PDF ≤ 30MB.<br>4. Confirm. | - Native file picker mở (iOS UIDocumentPicker / Android SAF).<br>- File được upload thành công (progress indicator).<br>- Tên file hiển thị trong khu vực Hồ sơ bảo lãnh.<br>- URL file persist trong SO record. | BLOCKED-by-harness | N/A |
| TC-W01-MOB-007 | FEAT-INS-SO-ADJUSTMENT | garage-mobile, gf-sales | AC-14, INS_ADJ_PERCENT_OUT_OF_RANGE | E2E | Wave | P1 | Kế toán nhập CK liên kết VT = 150% → lỗi field-level "Tỷ lệ phần trăm chỉ được nhập từ 0 đến 100." | Cluster C3; SO Edit, BH=Có; trường CK liên kết VT đang ở chế độ % | 1. SO Edit, BH=Có, switch CK liên kết VT sang đơn vị %.<br>2. Nhập 150.<br>3. Tap "Lưu". | - Lỗi field-level "Tỷ lệ phần trăm chỉ được nhập từ 0 đến 100." hiển thị inline dưới trường CK liên kết VT.<br>- Không navigate ra ngoài (SO ở lại Edit).<br>- Không có SnackBar lưu thành công. | BLOCKED-by-harness | N/A |
| TC-W01-MOB-008 | FEAT-INS-SO-ADJUSTMENT | garage-mobile, gf-sales | AC-14, INS_ADJ_VALUE_NEGATIVE | E2E | Wave | P1 | Kế toán nhập Khấu trừ BH = -1000 → lỗi field-level "Vui lòng nhập giá trị từ 0 trở lên." | Cluster C3; SO Edit, BH=Có | 1. SO Edit, BH=Có.<br>2. Nhập -1000 vào trường "Khấu trừ bảo hiểm".<br>3. Tap "Lưu". | - Lỗi field-level "Vui lòng nhập giá trị từ 0 trở lên." hiển thị inline dưới trường Khấu trừ BH.<br>- SO không lưu được.<br>- Không navigate ra ngoài. | BLOCKED-by-harness | N/A |
| TC-W01-MOB-009 | FEAT-INS-SO-ADJUSTMENT | garage-mobile, gf-sales | AC-12, INS_ADJ_BH_PAYMENT_NEGATIVE | E2E | Wave | P1 | BH thanh toán tính âm → warning "Số tiền bảo hiểm thanh toán đang nhỏ hơn 0" nhưng vẫn cho lưu | Cluster C3; seed SO-W01-TEST-003 với Cộng sau VAT BH nhỏ | 1. SO-W01-TEST-003 → Chỉnh sửa, BH=Có.<br>2. Nhập CK liên kết VT rất lớn (999.999.999 VND) khiến BH thanh toán < 0.<br>3. Quan sát panel.<br>4. Tap "Lưu". | - Panel "Cân thanh toán": ô "BH thanh toán" hiển thị số âm + highlight đỏ.<br>- Warning "Số tiền bảo hiểm thanh toán đang nhỏ hơn 0. Vui lòng kiểm tra lại các khoản điều chỉnh." hiển thị (không block lưu).<br>- Sau tap Lưu: SO lưu thành công (SnackBar thành công). | BLOCKED-by-harness | N/A |
| TC-W01-MOB-010 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | LIF-001 (MOB-E2E-LIF-001) | E2E | Wave | P2 | App background giữa nhập phân bổ BH → return foreground → giá trị nhập được giữ lại (background-foreground restoration) | Cluster C3; SO Edit, BH=Có; device có HOME button hoặc gesture | 1. SO Edit, BH=Có.<br>2. Nhập CK liên kết VT = 3.000.000 VND (chưa lưu).<br>3. Tap HOME (Android) hoặc swipe up (iOS) để background app.<br>4. Đợi 3 giây.<br>5. Mở lại app từ recent tasks.<br>6. Quan sát form. | - App foreground về đúng màn SO Edit.<br>- Trường CK liên kết VT vẫn hiển thị 3.000.000.<br>- Không bị redirect về Home hoặc Login.<br>- Panel "Phân bổ quyết toán bảo hiểm" vẫn visible. | BLOCKED-by-harness | N/A |
| TC-W01-MOB-011 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | NET-005 (MOB-E2E-NET-005) | E2E | Wave | P2 | Mất kết nối trước khi Lưu SO → snackbar "Mất kết nối" + form không mất dữ liệu | Cluster C3; SO Edit, đã nhập allocation; device có thể toggle WiFi/network | 1. SO Edit, BH=Có, nhập CK liên kết VT = 4.000.000 VND.<br>2. Tắt WiFi (toggle native network).<br>3. Tap "Lưu".<br>4. Quan sát snackbar.<br>5. Bật lại WiFi. | - SnackBar "Mất kết nối" hoặc tương đương hiển thị sau tap Lưu.<br>- Dữ liệu nhập (4.000.000) vẫn còn trong form.<br>- App không crash.<br>- Sau khi bật WiFi, kế toán có thể tap Lưu lại thành công. | BLOCKED-by-harness | N/A |
| TC-W01-MOB-012 | FEAT-INS-SO-ADJUSTMENT | garage-mobile, agg-garage-graph | AUTH-004 (token refresh mid-flow) | E2E | Wave | P2 | Firebase token hết hạn giữa nhập phân bổ → silent refresh → tiếp tục lưu thành công (không logout) | Cluster C3; Firebase test project configured với short-lived token; BFF token refresh endpoint available | 1. Login với short-lived token (Firebase test project).<br>2. Mở SO Edit, nhập allocation.<br>3. Đợi token expire (test token config).<br>4. Tap "Lưu". | - App KHÔNG redirect về màn Đăng nhập.<br>- Silent token refresh diễn ra ẩn.<br>- SO lưu thành công sau refresh (SnackBar thành công).<br>- Không có error dialog về "Phiên đăng nhập hết hạn". | BLOCKED-by-harness | N/A |
| TC-W01-MOB-013 | FEAT-INS-SO-ADJUSTMENT | garage-mobile, gf-sales | AC-13, concurrent-edit | E2E | Wave | P2 | [SPEC-GAP] Concurrent-edit: mobile A đang nhập allocation, web B lưu SO trước → conflict warning | Cluster C3 + C2 web session observer | [spec-gap — cần web session parallel setup + conflict detection mechanism từ gf-sales; defer đến khi API có optimistic lock spec] | - [spec-gap] | BLOCKED-by-harness | N/A |
| TC-W01-MOB-014 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-16 | E2E | Wave | P1 | Chủ garage (garage-owner) vào SO Edit → section "Phân bổ quyết toán bảo hiểm" hiển thị và input enabled | Cluster C3; login `owner@garage-a.test`; SO-W01-TEST-001 accessible | 1. Login với account chủ garage `owner@garage-a.test`.<br>2. Mở SO-W01-TEST-001 → Chỉnh sửa.<br>3. Toggle BH=Có.<br>4. Quan sát section + trường nhập. | - Section "Phân bổ quyết toán bảo hiểm" xuất hiện (chủ garage có quyền).<br>- Các trường input enabled (không readonly/disabled).<br>- Có thể nhập giá trị vào CK liên kết VT. | BLOCKED-by-harness | N/A |
| TC-W01-MOB-015 | FEAT-INS-STL-DETAIL | garage-mobile, gf-accounting, agg-garage-graph | AC-1, AC-2, AC-3, AC-4 | E2E | Wave | P1 | Kế toán mở phiếu QT BH SET-W01-INS-001 → header mã phiếu + 4 tab + 2 khối thông tin render đúng | Cluster C3; login kế toán; seed SET-W01-INS-001; BFF + gf-accounting reachable | 1. Từ Home, tap "Phiếu quyết toán".<br>2. Mở SET-W01-INS-001.<br>3. Quan sát header + tabs + khối thông tin. | - Header hiển thị mã phiếu "SET-W01-INS-001" + nút back (AC-1).<br>- Thanh hành động có nút "Chỉnh sửa" + "In toàn bộ hồ sơ" + "+ Tạo hồ sơ bảo hiểm" (AC-1).<br>- Khối "Thông tin quyết toán" hiển thị "Phiếu dịch vụ liên kết" / "Bên thanh toán" = Bảo hiểm (AC-2).<br>- Khối "Thông tin khách hàng & xe" render (AC-3).<br>- 4 tab render: "Bảng chi phí" / "Chứng từ & hoá đơn" / "Hồ sơ bảo hiểm đã xuất" / "Lịch sử thanh toán" (AC-4). | BLOCKED-by-harness | N/A |
| TC-W01-MOB-016 | FEAT-INS-STL-DETAIL | garage-mobile, gf-accounting | AC-5, AC-6, AC-9, AC-10, AC-11 | E2E | Wave | P1 | Tab "Bảng chi phí" → chỉ hạng mục Bảo hiểm + panel "Tổng giá dịch vụ" đủ 3 phần (Chi tiết/Phân bổ/Cân thanh toán) | Cluster C3; SET-W01-INS-001 với hạng mục BH + KH | 1. Mở SET-W01-INS-001.<br>2. Tab "Bảng chi phí" là default active — quan sát bảng hạng mục.<br>3. Scroll xuống quan sát panel "Tổng giá dịch vụ". | - Bảng hạng mục chỉ có dòng "Bên thanh toán = Bảo hiểm" (AC-5 — không có dòng KH).<br>- Phân trang hạng mục hoạt động.<br>- Panel "Chi tiết theo bên thanh toán": bảng Khoản mục / BH / KH với Dịch vụ/Phụ tùng/VAT/Cộng sau VAT (AC-6/AC-9).<br>- Panel "Phân bổ Bảo hiểm": 5 dòng với dấu −/+ đúng màu (AC-6/AC-10).<br>- Panel "Cân thanh toán": 3 ô BH/KH/Tổng (AC-6/AC-11). | BLOCKED-by-harness | N/A |
| TC-W01-MOB-017 | FEAT-INS-STL-DETAIL | garage-mobile, gf-accounting | AC-11, BR-INS-SO-ADJ-005 | E2E | Wave | P1 | Panel "Cân thanh toán" hiển thị số tiền đúng công thức: BH=197.680.000đ, KH=35.720.000đ, Tổng=233.400.000đ | Cluster C3; seed SET-W01-INS-002 với allocation = ví dụ thực FEAT (BH 207.900.000, CK VT 5M, CK CDV 2.5M, giảm trừ 2M, khấu hao VT 200K, khấu trừ 520K) | 1. Mở SET-W01-INS-002.<br>2. Tab "Bảng chi phí" — quan sát panel "Cân thanh toán". | - "BH thanh toán" = 197.680.000đ (ô xanh).<br>- "Khách hàng thanh toán" = 35.720.000đ (ô cam).<br>- "Tổng thanh toán" = 233.400.000đ (ô đen).<br>- Server là nguồn chốt (BR-INS-SO-ADJ-007). | BLOCKED-by-harness | N/A |
| TC-W01-MOB-018 | FEAT-INS-STL-DETAIL | garage-mobile, gf-accounting | AC-9 | E2E | Wave | P2 | Tab "Lịch sử thanh toán" → danh sách thanh toán BH read-only, cột Ngày/Số tiền/Phương thức | Cluster C3; SET-W01-INS-001 có ≥1 payment record | 1. Mở SET-W01-INS-001.<br>2. Tap tab "Lịch sử thanh toán".<br>3. Quan sát bảng. | - Bảng hiển thị cột Ngày / Số tiền / Phương thức / Ghi chú (AC-9).<br>- Sắp xếp giảm dần theo ngày.<br>- Không có nút "Thêm" / "Xóa" (read-only trong scope FEAT này).<br>- Không có action ghi nhận thanh toán (đó là baseline FEAT-STL-DETAIL ngoài scope). | BLOCKED-by-harness | N/A |
| TC-W01-MOB-019 | FEAT-INS-STL-DETAIL | garage-mobile | AC-11, BR-INS-STL-DET-003 | E2E | Wave | P1 | Phiếu QT BH không hiển thị nút "Huỷ phiếu" ở bất kỳ trạng thái nào | Cluster C3; SET-W01-INS-001 (DRAFT state) | 1. Mở SET-W01-INS-001.<br>2. Kiểm tra toàn bộ action bar + overflow menu + 4 tab. | - Không có nút "Huỷ phiếu" / "Hủy phiếu" / "Cancel" ở action bar, overflow menu, hoặc bất kỳ nơi nào trên màn.<br>- Không có action reopen SO sau cancel (không có cascade cancel). | BLOCKED-by-harness | N/A |
| TC-W01-MOB-020 | FEAT-INS-STL-DETAIL | garage-mobile | DPL-001 Android, AC-1 | E2E | Wave | P1 | Deeplink Android App Link cold start → mở đúng màn chi tiết phiếu QT BH SET-W01-INS-001 | Cluster C3 Android; app ở trạng thái terminated; `assetlinks.json` configured trên `app.garage.test` | 1. Kill app hoàn toàn trên Android device/emulator.<br>2. Trigger URL `https://app.garage.test/settlements/SET-W01-INS-001` qua `adb shell am start`.<br>3. Quan sát app cold start + màn mở. | - App cold start (splash screen).<br>- Sau splash + auth (nếu cần), navigate thẳng đến màn chi tiết SET-W01-INS-001.<br>- Màn hiển thị 4 tab đúng (AC-4).<br>- Không mở Chrome/browser (App Link resolved thành công).<br>- Native checkpoint: deeplink intent resolved → correct route. | BLOCKED-by-harness | N/A |
| TC-W01-MOB-021 | FEAT-INS-STL-DETAIL | garage-mobile | DPL-002 | E2E | Wave | P2 | Deeplink khi app đang foreground tại Home → navigate in-app đến màn chi tiết SET-W01-INS-001 | Cluster C3; app đang foreground ở Home screen | 1. Mở app, login, ở Home screen.<br>2. Trigger URL `https://app.garage.test/settlements/SET-W01-INS-001` (qua `adb shell` hoặc `xcrun simctl openurl`).<br>3. Quan sát navigation. | - App navigate in-app (push route) đến màn chi tiết SET-W01-INS-001.<br>- Không restart app, không cold start.<br>- AppBar back button quay lại Home. | BLOCKED-by-harness | N/A |
| TC-W01-MOB-022 | FEAT-INS-STL-DETAIL | garage-mobile, gf-accounting | INS_STL_NOT_FOUND | E2E | Wave | P2 | Deeplink tới phiếu QT BH không tồn tại → màn "Không tìm thấy phiếu quyết toán bảo hiểm." | Cluster C3; login kế toán | 1. Trigger URL `https://app.garage.test/settlements/SET-W01-INS-999` (ID không tồn tại).<br>2. Quan sát màn sau navigate. | - Màn error state hiển thị: "Không tìm thấy phiếu quyết toán bảo hiểm."<br>- Có nút "Quay lại" hoặc back button.<br>- Không crash. | BLOCKED-by-harness | N/A |
| TC-W01-MOB-023 | FEAT-INS-STL-DETAIL | garage-mobile, gf-accounting | PSH-003, AC-1 | E2E | Wave | P1 | FCM push background: nhận thông báo phiếu QT BH mới → tap notification → app foreground → màn chi tiết SET-W01-INS-003 | Cluster C3; FCM test project `gms-test-firebase`; device token đã đăng ký; app ở background state; KHÔNG dùng fake_token | 1. Login kế toán + grant FCM permission (Android 33+ / iOS 14+).<br>2. Background app (press HOME).<br>3. Trigger FCM test push cho device token (test script — FCM test instance).<br>4. Mở notification tray.<br>5. Tap notification "SET-W01-INS-003".<br>6. Quan sát app. | - Notification xuất hiện trong system tray (Android) / lock screen/notification center (iOS).<br>- Tap notification: app foreground về đúng màn chi tiết SET-W01-INS-003.<br>- Màn hiển thị 4 tab + header mã phiếu.<br>- Native checkpoint: FCM push rendered đúng trong system notification (real FCM token — không phải fake). | BLOCKED-by-harness | N/A |
| TC-W01-MOB-024 | FEAT-INS-STL-DETAIL | garage-mobile | AC-13 | E2E | Wave | P2 | Nút "+ Tạo hồ sơ bảo hiểm" disabled W01 → tap → SnackBar "Tính năng sẽ available ở Wave 2" | Cluster C3; SET-W01-INS-001 (DRAFT state) | 1. Mở SET-W01-INS-001.<br>2. Tìm nút "+ Tạo hồ sơ bảo hiểm" trên action bar.<br>3. Tap nút. | - Nút hiển thị ở action bar (AC-13).<br>- Nút ở trạng thái disabled (greyed out).<br>- SnackBar "Tính năng sẽ available ở Wave 2" hiển thị khi tap.<br>- Không navigate đến màn dossier (chưa có W01). | BLOCKED-by-harness | N/A |
| TC-W01-MOB-025 | FEAT-INS-STL-DETAIL | garage-mobile | DPL-001 iOS, AC-1 | E2E | Wave | P1 | [iOS only] Universal Link cold start iOS → mở đúng màn chi tiết phiếu QT BH SET-W01-INS-001 | Cluster C4 iOS simulator (iOS 16+); app ở trạng thái terminated; `apple-app-site-association` configured trên `app.garage.test`; Xcode entitlement `applinks:app.garage.test` | 1. Kill app trên iOS simulator.<br>2. Trigger `xcrun simctl openurl <udid> https://app.garage.test/settlements/SET-W01-INS-001`.<br>3. Quan sát app cold start + màn. | - App cold start trên iOS (splash screen).<br>- Sau splash + auth, navigate đến màn chi tiết SET-W01-INS-001.<br>- Không mở Safari (Universal Link resolved).<br>- 4 tab render đúng (AC-4).<br>- Native checkpoint iOS: universal link → app resolved, KHÔNG fallback Safari. | SKIPPED — CR-1781166951 (Ubuntu host, iOS xcrun absent; defer to CI macOS runner) | N/A |
| TC-W01-MOB-030 | FEAT-INS-SO-ADJUSTMENT, FEAT-INS-STL-DETAIL | garage-mobile, agg-garage-graph | AUTH-001 adapted | E2E | Wave | P1 | Kế toán login email/password → home screen render + FCM token đăng ký BFF | Cluster C2 (integration_test + BFF observer); BFF + agg-sso-graph reachable; Firebase test instance | 1. App cold start.<br>2. Nhập email `accountant@garage-a.test` + password.<br>3. Tap "Đăng nhập".<br>4. Quan sát màn sau login. | - Màn "Trang chủ" render sau login thành công.<br>- Không có error dialog.<br>- (C2) BFF nhận FCM token đăng ký (POST device token) từ app sau login. | BLOCKED-by-harness | N/A |
| TC-W01-MOB-031 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AUTH-005 | E2E | Wave | P2 | Token refresh fail (refresh token expired) → app tự logout → màn Đăng nhập | Cluster C2; Firebase test instance có short-lived refresh token | 1. Login với expired refresh token.<br>2. Trigger action cần auth (mở Phiếu quyết toán).<br>3. Quan sát app behavior. | - App chuyển về màn Đăng nhập.<br>- Không có crash.<br>- Không lặp vòng refresh. | BLOCKED-by-harness | N/A |
| TC-W01-MOB-032 | FEAT-INS-SO-ADJUSTMENT | garage-mobile, agg-sso-graph | AUTH-006 adapted | E2E | Wave | P2 | Kế toán logout → return to màn Đăng nhập | Cluster C2; login kế toán trước | 1. Login kế toán.<br>2. Mở tab "Tôi" → tap "Đăng xuất".<br>3. Quan sát màn. | - Màn "Đăng nhập" hiển thị sau logout.<br>- Home screen và data không còn accessible.<br>- FCM token unregister (C2 BFF observer). | BLOCKED-by-harness | N/A |
| TC-W01-MOB-033 | FEAT-INS-SO-ADJUSTMENT, FEAT-INS-STL-DETAIL | garage-mobile | AC-16, PRM-001 adapted | E2E | Wave | P2 | Kế toán login → thấy tab "Phiếu quyết toán" (persona-based navigation) | Cluster C1 (integration_test headless) | 1. Login `accountant@garage-a.test`.<br>2. Quan sát bottom navigation / tab bar. | - Bottom nav hoặc tab "Phiếu quyết toán" hiển thị cho kế toán.<br>- Không có error route 403. | BLOCKED-by-harness | N/A |
| TC-W01-MOB-034 | FEAT-INS-SO-ADJUSTMENT, FEAT-INS-STL-DETAIL | garage-mobile | LOC-001 | E2E | Wave | P3 | Toàn bộ wording màn Đăng nhập và Home tiếng Việt (AppLocalizations.vi.arb) | Cluster C1 (integration_test); device locale = vi | 1. App cold start với locale = tiếng Việt.<br>2. Quan sát màn Đăng nhập.<br>3. Login → quan sát màn Home. | - Màn Đăng nhập: "Đăng nhập", "Email", "Mật khẩu" tiếng Việt.<br>- Màn Home: "Trang chủ" tiếng Việt.<br>- Không có chuỗi tiếng Anh UI-facing trên các màn chính. | BLOCKED-by-harness | N/A |

---

## 5. Spec File Mapping

| TC ID | Spec File | Test Name (patrolTest / testWidgets) | Cluster |
|---|---|---|---|
| TC-W01-MOB-001 | `Execution/auto/specs/W01/mobile-e2e/ins_so_adjustment_patrol_test.dart` | `Kế toán vào SO Create — section Phân bổ quyết toán bảo hiểm KHÔNG hiển thị` | C3 |
| TC-W01-MOB-002 | `ins_so_adjustment_patrol_test.dart` | `Kế toán vào SO Edit toggle Bảo hiểm=Có → section Phân bổ quyết toán bảo hiểm xuất hiện` | C3 |
| TC-W01-MOB-003 | `ins_so_adjustment_patrol_test.dart` | `Kế toán nhập 5 khoản điều chỉnh BH → realtime preview BH/KH/Tổng cập nhật` | C3 |
| TC-W01-MOB-004 | `ins_so_adjustment_patrol_test.dart` | `Kế toán nhập khấu hao 20% + Áp dụng tất cả → mọi dòng phụ tùng BH set 20%` | C3 |
| TC-W01-MOB-005 | `ins_so_adjustment_patrol_test.dart` | `Kế toán lưu SO với allocation → API gf-sales persist + outbox event` | C3 (+C2) |
| TC-W01-MOB-006 | `ins_so_adjustment_patrol_test.dart` | [BLOCKED-by-harness — native file picker] | C3 |
| TC-W01-MOB-007 | `ins_so_adjustment_patrol_test.dart` | `Kế toán nhập CK liên kết VT = 150% → lỗi "Tỷ lệ phần trăm..."` | C3 |
| TC-W01-MOB-008 | `ins_so_adjustment_patrol_test.dart` | `Kế toán nhập Khấu trừ BH = -1000 → lỗi "Vui lòng nhập giá trị từ 0..."` | C3 |
| TC-W01-MOB-009 | `ins_so_adjustment_patrol_test.dart` | `BH thanh toán tính âm → warning + allow save` | C3 |
| TC-W01-MOB-010 | `ins_so_adjustment_patrol_test.dart` | `App background giữa nhập form → return foreground → state restored` | C3 |
| TC-W01-MOB-011 | `ins_so_adjustment_patrol_test.dart` | `Mất kết nối trước khi Lưu → snackbar "Mất kết nối"` | C3 |
| TC-W01-MOB-012 | `ins_so_adjustment_patrol_test.dart` | `Token expired mid-flow → silent refresh → tiếp tục` | C3 |
| TC-W01-MOB-013 | — (SPEC-GAP) | — deferred | — |
| TC-W01-MOB-014 | `ins_so_adjustment_patrol_test.dart` | `Chủ garage vào SO Edit → section và input enabled` | C3 |
| TC-W01-MOB-015 | `Execution/auto/specs/W01/mobile-e2e/ins_stl_detail_patrol_test.dart` | `Kế toán mở phiếu QT BH SET-W01-INS-001 → header + 4 tab` | C3 |
| TC-W01-MOB-016 | `ins_stl_detail_patrol_test.dart` | `Tab Bảng chi phí → bảng hạng mục BH + panel Tổng giá dịch vụ` | C3 |
| TC-W01-MOB-017 | `ins_stl_detail_patrol_test.dart` | `Panel Cân thanh toán hiển thị 197.680.000 + 35.720.000 + 233.400.000` | C3 |
| TC-W01-MOB-018 | `ins_stl_detail_patrol_test.dart` | `Tab Lịch sử thanh toán → read-only` | C3 |
| TC-W01-MOB-019 | `ins_stl_detail_patrol_test.dart` | `Phiếu QT BH không hiển thị nút Huỷ` | C3 |
| TC-W01-MOB-020 | `ins_stl_detail_patrol_test.dart` | `Deeplink Android App Link cold start → màn chi tiết` | C3 Android |
| TC-W01-MOB-021 | `ins_stl_detail_patrol_test.dart` | `Deeplink foreground → in-app navigate` | C3 |
| TC-W01-MOB-022 | `ins_stl_detail_patrol_test.dart` | `Deeplink ID không tồn tại → error "Không tìm thấy"` | C3 |
| TC-W01-MOB-023 | `ins_stl_detail_patrol_test.dart` | `FCM background push → tap → màn chi tiết` | C3 |
| TC-W01-MOB-024 | `ins_stl_detail_patrol_test.dart` | `Nút Tạo hồ sơ bảo hiểm disabled → SnackBar W2 message` | C3 |
| TC-W01-MOB-025 | `ins_stl_detail_patrol_test.dart` | `[iOS] Universal Link cold start → màn chi tiết` | C4 iOS |
| TC-W01-MOB-030 | `Execution/auto/specs/W01/mobile-e2e/auth_lifecycle_integration_test.dart` | `TC-MOB-030: Kế toán login email/password → home screen + FCM token` | C2 |
| TC-W01-MOB-031 | `auth_lifecycle_integration_test.dart` | `TC-MOB-031: Token refresh fail → logout → màn Đăng nhập` | C2 |
| TC-W01-MOB-032 | `auth_lifecycle_integration_test.dart` | `TC-MOB-032: Kế toán logout → return to màn Đăng nhập` | C2 |
| TC-W01-MOB-033 | `auth_lifecycle_integration_test.dart` | `TC-MOB-033: Kế toán thấy tab Phiếu quyết toán` | C1 |
| TC-W01-MOB-034 | `auth_lifecycle_integration_test.dart` | `TC-MOB-034: Wording tiếng Việt màn Đăng nhập và Home` | C1 |

---

## 6. Execution Preflight Commands

```bash
# 1. Verify Flutter SDK
flutter --version      # expect 3.41+
dart --version         # expect 3.11+

# 2. Bootstrap Patrol harness
cd Execution/auto/harness/patrol
flutter pub get
dart pub global activate patrol_cli
patrol --version       # expect >= 2.8.0

# 3. Boot Android emulator
flutter emulators --launch Pixel_6_API_33
adb devices            # expect emulator-5554 listed

# 4. Boot iOS simulator (C4 only)
xcrun simctl boot <iPhone-14-iOS-16-udid>
xcrun simctl list devices booted

# 5. Smoke preflight (C3 gate)
patrol test --target Execution/auto/specs/W01/mobile-e2e/smoke_patrol_test.dart \
  -d emulator-5554 \
  --dart-define=BFF_BASE_URL=http://10.0.2.2:3000

# 6. Run C3 suite (FEAT-INS-SO-ADJUSTMENT)
patrol test --target Execution/auto/specs/W01/mobile-e2e/ins_so_adjustment_patrol_test.dart \
  -d emulator-5554 \
  --dart-define=BFF_BASE_URL=http://10.0.2.2:3000 \
  --dart-define=TEST_TENANT_ID=garage-a

# 7. Run C3 suite (FEAT-INS-STL-DETAIL)
patrol test --target Execution/auto/specs/W01/mobile-e2e/ins_stl_detail_patrol_test.dart \
  -d emulator-5554 \
  --dart-define=BFF_BASE_URL=http://10.0.2.2:3000

# 8. Run C4 iOS (TC-MOB-025 iOS Universal Link only)
patrol test --target Execution/auto/specs/W01/mobile-e2e/ins_stl_detail_patrol_test.dart \
  -d <ios-sim-udid> \
  --dart-define=BFF_BASE_URL=http://localhost:3000

# 9. Run C1/C2 (integration_test)
cd Execution/auto/harness/integration-test
flutter test integration_test/auth_lifecycle_integration_test.dart \
  -d emulator-5554
```

---

## 7. Changelog

| Date | Change | Author |
| ---- | ------ | ------ |
| 2026-06-11 | Khởi tạo — TEST_PLANNING stage W01 mobile E2E. 30 TC (25 C3/C4 Patrol + 5 C1/C2 integration_test). Cover FEAT-INS-SO-ADJUSTMENT (AC-0/1/3-16) + FEAT-INS-STL-DETAIL (AC-1-13). Spec files: `ins_so_adjustment_patrol_test.dart`, `ins_stl_detail_patrol_test.dart`, `auth_lifecycle_integration_test.dart`, `smoke_patrol_test.dart`. Harness: `Execution/auto/harness/patrol/` + `integration-test/`. Coverage map common §1-§21 đầy đủ. Auto/Manual parity audit: 3 manual cross-platform TCs đều covered. Impacted regression: TC-MOB-001 (SO Create AC-0), TC-MOB-015 (layout mới shared KH+BH). iOS-specific TC-MOB-025. | agent-test-mobile-e2e |
| 2026-06-11 | TEST_EXECUTION Run 1 — Step 0 Env Gate BLOCKED. Flutter SDK (flutter + dart): command not found sau 2 retry. adb (Android): command not found. xcrun (iOS): command not found. Flutter toolchain hoàn toàn vắng mặt trong sandbox. BFF tại port 45401 reachable (health OK). Kết quả: 30/30 TC → BLOCKED-by-harness. Lý do chính thức: "Flutter SDK absent — Patrol/integration_test runner unavailable". KHÔNG có fallback code-inspection. KHÔNG có PASS. | agent-test-mobile-e2e |
| 2026-06-11 | TEST_EXECUTION Run 2 — Step 0 Env Gate PARTIAL PASS / BLOCKED-by-harness. Flutter 3.44.1 + Dart 3.12.1 + patrol_cli 2.8.0 + emulator-5554 pixel6_api33 booted (swiftshader): PASS. Smoke preflight FAIL: `patrol test` attempted `./gradlew :app:assembleDebug` nhưng QC harness `Execution/auto/harness/patrol/` thiếu `android/` directory → `ProcessException: No such file or directory`. iOS xcrun: absent (Ubuntu host). TC-MOB-025: SKIPPED (CR-1781166951). Kết quả: 29 TC BLOCKED-by-harness + 1 TC SKIPPED. Kết luận: BLOCKED — harness cần `android/` + `lib/` + `integration_test/`. Evidence: `Execution/auto/evidence/W01/mobile-e2e/env-gate-run2.md`. | agent-test-mobile-e2e |
