---
title: W01 Test Execution — Unblock Plan for Run 2
wave: W01
generated_by: agent-test-api (post `/test-exec` Run 1)
generated_at: 2026-06-11
purpose: Aggregated, actionable config/install steps để mở khóa 228 TC bị BLOCKED ở Run 1; mỗi item gắn owner agent + verify command.
---

# Unblock Plan — W01 `/test-exec` Run 2

## Ngữ cảnh

`/test-exec` Run 1 (2026-06-11) chạy 8 agent song song trên 405 TC → **115 PASS / 40 FAIL / 228 BLOCKED / 17 SKIPPED**. 228 BLOCKED chia làm 4 nhóm root cause độc lập, có thể song song hóa giữa stream **A** (env/infra) và stream **B** (product fix).

---

## Stream A — Env / Infrastructure (KHÔNG cần DEV chạm code)

### A1. Cài Flutter SDK + Dart trên execution host

**Mở khóa**: 115 TC `mobile-ui` + 30 TC `mobile-e2e` + 2 TC `isolation` mobile-deeplink = **147 TC**.

Yêu cầu version (từ harness `pubspec.yaml` đã bootstrap):
- `flutter: '>=3.41.0'`
- `dart sdk: '>=3.11.0 <4.0.0'`

```bash
# Install Flutter 3.41+ (Linux)
git clone https://github.com/flutter/flutter.git -b stable /opt/flutter
echo 'export PATH="$PATH:/opt/flutter/bin"' >> ~/.bashrc
source ~/.bashrc

# Verify
flutter --version          # phải >= 3.41.0
dart --version             # phải >= 3.11.0
flutter doctor             # phải OK Android toolchain (cho Patrol)

# Cho cluster C3/C4 (Patrol live device) thêm:
dart pub global activate patrol_cli  # khớp ^2.8.0 trong pubspec
# Android emulator
sdkmanager "system-images;android-33;google_apis;x86_64"
avdmanager create avd -n pixel6_api33 -k "system-images;android-33;google_apis;x86_64"
emulator -avd pixel6_api33 &   # boot trước khi /test-exec Run 2

# (Optional) iOS — chỉ cần cho TC-MOB-025 (universal link)
# Bắt buộc macOS + Xcode 14+ + simulator iPhone 14 iOS 16.4
```

**Smoke verify**:
```bash
cd Execution/auto/harness/flutter-widget && flutter pub get && flutter test test/smoke_test.dart
cd ../patrol && flutter pub get && patrol test --target lib/smoke_patrol_test.dart
```

**Owner**: Ops (không phải DEV agent) · **Tracking**: lesson learn TL-W01-MUI-001, TL-W01-MOB-E2E-001.

### A1 actual run (2026-06-11) — partial success

| Step | Status | Notes |
|---|---|---|
| Clone Flutter stable to `$HOME/flutter` | ✓ DONE | Shallow clone 231 MB; PATH persisted in `~/.bashrc` |
| `flutter --version` | ✓ Flutter 3.44.1 / Dart 3.12.1 | Meets pubspec yêu cầu ≥3.41 / ≥3.11 |
| `flutter pub get` widget harness | ✓ 64 deps resolved | `Execution/auto/harness/flutter-widget/` |
| Widget smoke `flutter test smoke_test.dart` | ✓ PASS (`+1: All tests passed!`) | **91 mobile-ui C1 TC nay runnable** |
| `flutter pub get` alchemist harness | ✓ 29 deps resolved | — |
| Alchemist smoke `flutter test golden_smoke_test.dart` | ✗ FAIL | `Error: unable to locate asset entry in pubspec.yaml: "fonts/Roboto-Regular.ttf"` — harness pubspec khai báo 3 Roboto font asset (`Roboto-Regular.ttf`, `Roboto-Medium.ttf`, `Roboto-Bold.ttf`) nhưng `fonts/` dir + file font **không tồn tại** trên disk → bootstrap gap từ /test-plan. **12 mobile-ui C2 alchemist TC vẫn BLOCKED.** |

**Follow-up cho `agent-test-mobile-ui`** (harness `Execution/auto/harness/alchemist/` ngoài OWNED_PATHS của agent-test-api → cần mobile-ui agent xử lý):
1. Download Roboto 3 weight (Regular/Medium/Bold) từ Google Fonts → `Execution/auto/harness/alchemist/fonts/`
2. HOẶC: bỏ font asset declaration trong pubspec — golden test dùng default platform font (chấp nhận font drift Linux/macOS — vi phạm intent "deterministic cross-platform golden")
3. Verify: re-run `flutter test golden_smoke_test.dart` đến `+1: All tests passed!`

**Net unblock status sau A1**: 91 TC mobile-ui C1 ready cho /test-exec Run 2. 12 TC mobile-ui C2 còn BLOCKED (harness asset). 12 TC mobile-ui C3 + 30 mobile-e2e + 2 iso vẫn cần Phase 2 (Android SDK + emulator).

### A1 Phase 2 actual run (2026-06-11) — Android SDK installed, KVM blocker surfaced

| Step | Status | Notes |
|---|---|---|
| `mkdir $HOME/Android/Sdk` + clone cmdline-tools (commandlinetools-linux-11076708_latest.zip, 147 MB) | ✓ DONE | User-local, no sudo |
| `sdkmanager --licenses` (accept all) | ✓ DONE | — |
| Install `platform-tools` (adb 1.0.41) | ✓ DONE | — |
| Install `emulator` (v36.6.11) | ✓ DONE | — |
| Install `platforms;android-33` + `platforms;android-36` | ✓ DONE | Flutter doctor yêu cầu android-36 |
| Install `build-tools;33.0.2` | ✓ DONE | — |
| Install `system-images;android-33;google_apis;x86_64` | ✓ DONE | — |
| Create AVD `pixel6_api33` | ✓ DONE | `/home/engineer_ac/.android/avd/pixel6_api33.avd` |
| `dart pub global activate patrol_cli 2.8.0` | ✓ DONE | Pinned to 2.8.0 khớp pubspec ^2.8.0 (4.x sẽ break) |
| Patrol analytics opt-out (`$HOME/.config/patrol_cli/analytics.json`) | ✓ DONE | Bypass first-run prompt (mason_logger no-TTY bug) |
| Persist env in `~/.bashrc` (ANDROID_HOME, JAVA_HOME, PATH, pub-cache/bin) | ✓ DONE | — |
| `flutter doctor` | ✓ Flutter ✓ Android toolchain | Chrome + Linux toolchain miss = không liên quan mobile |
| **Boot emulator** | ✗ **BLOCKED-by-KVM-permission** | `/dev/kvm` owned `root:kvm`, user `engineer_ac` chưa thuộc nhóm `kvm` → `crw-rw---- ... readable=NO writable=NO`. CPU có vmx (Intel VT-x) — accel khả thi nếu fix permission. |

**1 lệnh sudo cần user chạy thủ công**:

```bash
sudo usermod -aG kvm engineer_ac
# Logout + login lại (hoặc reboot) để group membership effective
newgrp kvm        # tạm hiệu lực trong shell hiện tại (không persistent)
# Verify:
groups | grep -o kvm                # phải thấy "kvm"
test -r /dev/kvm && echo OK         # phải print OK
```

Tổng disk Phase 2: `$HOME/flutter` (231 MB) + `$HOME/Android/Sdk` (~12 GB sau android-36) + `$HOME/.pub-cache` (~50 MB cho patrol_cli) ≈ **~12.3 GB**.

**Net unblock status sau A1 Phase 1 + Phase 2** (chờ user fix KVM):

| Cluster | Before | After A1 P1 | After A1 P2 (đã cài) | After KVM fix (user sudo) |
|---|---:|---:|---:|---:|
| mobile-ui C1 (widget+bloc_test, headless) | 91 BLK | **91 READY** | 91 READY | 91 READY |
| mobile-ui C2 (alchemist golden, headless) | 12 BLK | 12 BLK (font) | 12 BLK (font) | 12 BLK (font) |
| mobile-ui C3 (Patrol live device) | 10 BLK | 10 BLK | 10 BLK (cần emulator) | **10 READY** |
| mobile-ui C4 (Patrol multi-device) | 2 BLK | 2 BLK | 2 BLK | **2 READY** (1 emulator + 1 tablet AVD nếu tạo) |
| mobile-e2e C1/C2 (integration_test) | 4 BLK | 4 READY (BFF port fix) | 4 READY | 4 READY |
| mobile-e2e C3 (Patrol native) | 25 BLK | 25 BLK | 25 BLK | **25 READY** |
| mobile-e2e C4 (iOS Universal Link) | 1 BLK | 1 BLK | 1 BLK | 1 BLK (cần macOS — không khả thi Ubuntu) |
| iso mobile (TC-W01-ISO-011/012) | 2 BLK | 2 BLK | 2 BLK | **2 READY** |
| **Total mobile/iso TC unblocked** | 0 | 95 | 95 | **134/147** (91% — chỉ còn 12 alchemist font + 1 iOS) |

**Follow-up còn lại** (sau khi user fix KVM):
1. Alchemist Roboto fonts (12 TC) — `agent-test-mobile-ui` task khi /test-exec Run 2.
2. iOS C4 TC-MOB-025 (1 TC) — raise CR defer hoặc CI macOS runner (Ubuntu host không support).

### A1 Phase 2 KVM enable + smoke (2026-06-11) — verified, RAM pressure caveat

| Step | Status | Notes |
|---|---|---|
| `sudo usermod -aG kvm engineer_ac` (user-ran) | ✓ DONE | `getent group kvm` → `kvm:x:992:engineer_ac` |
| Verify via `sg kvm -c` subshell | ✓ DONE | `/dev/kvm` readable trong subshell — kernel accept |
| First emulator boot attempt (2048MB default RAM) | ✗ DIED mid-boot | OOM killed sau "Emulator is performing a full startup" — RAM pressure (26GB/31GB used) |
| Cleanup leftover AVD lock + retry (1536MB RAM, 2 cores) | ✓ DONE | `find /run/user/1001/avd/running/{pid} -type f -delete` |
| Second emulator boot — `sg kvm -c "nohup setsid emulator ... -memory 1536 -cores 2"` | ✓ BOOT COMPLETED | `adb devices` → `emulator-5554 device`; `getprop sys.boot_completed=1` |
| **KVM accel verified** | ✓ | Cold boot < 2 phút (so với 5-15 phút TCG mode); chứng tỏ KVM accel hoạt động |
| Patrol smoke test (`flutter pub get + patrol test`) | ⏸ DEFERRED | Host RAM critical post-boot: 324 MB free + 0 MB swap free. Flutter compile + adb install + patrol drive cần thêm ~2-3 GB → sẽ OOM. Defer cho khi user shutdown bớt Docker stack hoặc chạy /test-exec Run 2 ngoài giờ peak. |
| Shutdown emulator → RAM recover | ✓ | `adb emu kill` → 3.2 GB free recovered |

**⚠️ RAM PRESSURE CAVEAT (cần plan trước khi /test-exec Run 2)**:

Host này hiện chạy multiple workloads từ nhiều user (Docker stack gf-* services, IDE tsserver, các Java process khác). Tổng RAM 31 GB / 23 GB swap, hiện ~26 GB used. Emulator + Flutter build cần thêm 3-4 GB. Khi chạy /test-exec Run 2 với mobile agents:

| Tình huống | Hậu quả |
|---|---|
| Cứ thế chạy cùng Docker stack đang up | OOM kill ngẫu nhiên (emulator hoặc service container) |
| Shutdown Docker stack trước Run 2 | Mất gf-sales, gf-accounting, BFF — block API/E2E agents |
| Chạy mobile agents SEPARATELY khỏi backend agents | Phải split /test-exec — bất tiện |

**Khuyến nghị**: Trước khi /test-exec Run 2:
1. `docker stats --no-stream` để check container nào dư thừa
2. Stop containers KHÔNG thuộc W01 scope (vd các service khác wave, monitoring stack)
3. Hoặc upgrade host RAM lên 64 GB
4. Hoặc split Run 2 thành 2 phase: phase A (api/e2e/ui/iso/sec/perf) trước, shutdown backend, phase B (mobile-ui/mobile-e2e)

---

### A2. Seed insurance-SO pool cho perf TC-003

**Mở khóa**: 1 TC `TC-W01-PERF-003` (createInsuranceSettlement success rate ≥ 99.5% trên 200 iterations).

Hiện trạng: DB chỉ có 4 SO unique đủ điều kiện (`has_insurance=true AND status=PRICING AND no_settlement`). Cần ≥ 200 SO.

Tạo script seed mới:

```sql
-- File mới: infra/init-data/seed-insurance-so-pool.sql (Ops owned)
-- Seed 220 SO insurance status=PRICING cho tenant_id=1, không có settlement liên kết.
INSERT INTO dev_gf_sales.service_order (
    code, tenant_id, branch_id, vehicle_id, status,
    has_insurance, insurance_company_code, insurance_policy_number,
    created_at, ...
)
SELECT
    'PDV-PERFSEED-' || LPAD(generate_series::text, 5, '0'),
    1, 1, (SELECT id FROM dev_gf_sales.vehicle LIMIT 1),
    'PRICING', true, 'BAOMINH', 'POL-' || generate_series,
    NOW(), ...
FROM generate_series(1, 220);
-- + service_order_part + insurance_adjustment_lines tương ứng (tham khảo seed hiện hữu)
```

Đăng ký vào `infra/wave-up.sh` `AUTO-SEED` block hoặc chạy thủ công 1 lần:
```bash
psql -h localhost -p 15432 -U chungnt -d gf_sales -f infra/init-data/seed-insurance-so-pool.sql
```

**Owner**: Ops + agent-test-performance · **Tracking**: TL-W01-PERF-001.

---

## Stream B — Product fix (DEV agent qua per-service repo)

### B1. BFF SDL — thêm field `bh` (và `kh`) vào type `InsuranceSettlementBreakdown`

**Mở khóa**: 30 TC `UI web` (STL detail crash cascade) + 15 TC `e2e web` STL TCs + BUG-W01-240/-244 (P1). Tổng ~45 TC trực tiếp + cascade UI BLOCKED.

**File cần sửa** (per-service repo `bffs/agg-garage-graph/`):

| File | Thay đổi |
|---|---|
| `src/schema/insurance-settlement.graphql` | Thêm `bh: InsuranceBreakdownItem` + `kh: InsuranceBreakdownItem` vào `type InsuranceSettlementBreakdown` |
| `src/resolvers/insurance-settlement.ts` (hoặc tương đương) | Map `bh` / `kh` từ gf-accounting REST response → resolver fields |

Verify (live):
```bash
curl -s http://localhost:45401/garage/graphql \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Id: 1" \
  -d '{"query":"{ getSettlementByCode(code:\"SET-20260611-00001\") { breakdown { bh { amount vatRate vatAmount } kh { amount vatRate vatAmount } } } }"}'
# Expect: data.getSettlementByCode.breakdown.bh.amount > 0 (không còn errors[].message "Cannot query field \"bh\"")
```

**Owner**: `agent-fix-agg-garage-graph` (per-service repo `bffs/agg-garage-graph/`) · **Trigger**: `/spawn-fix agg-garage-graph` · **L2 verify**: [BUG-W01-244.verify.md](Tracking/WAVE01/verify/BUG-W01-244.verify.md).

---

### B2. `garage-web` — thêm `data-testid` attributes (giải 53 TC BLOCKED-by-missing-testid)

**Mở khóa**: 53 TC `UI web` cluster C3/C4 (BUG-W01-242, P2).

Spec Playwright dùng convention `[data-testid="..."]` nhưng production build không có. Cần DEV thêm attribute vào các component theo TC artifact `Execution/automated-test-cases/TC-W01-PLATFORM-UI.md`.

Danh sách `data-testid` cần wire (subset chính — đầy đủ trong BUG-W01-242 L1 row + L2 nếu tạo):

| Component | `data-testid` value |
|---|---|
| Insurance section wrapper (SO Edit) | `section-ins-adjustment` |
| CK Vật tư field | `field-ck-vt` |
| CK Công DV field | `field-ck-cong-dv` |
| Khấu hao field | `field-khau-hao` |
| Giảm trừ field | `field-giam-tru` |
| Khấu trừ BH field | `field-khau-tru-bh` |
| Mode toggle %/amount per khoản | `toggle-mode-{ck-vt\|ck-cong-dv\|...}` |
| Panel "Tổng giá dịch vụ" | `panel-total-price` |
| STL detail 4 tabs | `tab-bang-chi-phi`, `tab-chung-tu`, `tab-ho-so-bh`, `tab-lich-su-tt` |
| Nút "Tạo hồ sơ bảo hiểm" (disabled W01) | `btn-create-dossier` |
| Panel "Phân bổ Bảo hiểm" (BH/KH breakdown) | `panel-allocation-bh-kh` |

Pattern Tailwind/React (per memory `garage-web-route-singular-vs-api-plural` — convention hiện hữu):
```tsx
<section data-testid="section-ins-adjustment" className="...">
  <Input data-testid="field-ck-vt" {...register('ckVatTu')} />
  ...
</section>
```

**Owner**: `agent-fix-garage-web` (per-service repo `frontend/gf-gms-web/`) · **Trigger**: `/spawn-fix garage-web` với scope = "thêm data-testid theo BUG-W01-242 mapping".

**Lưu ý**: agent-test-ui đã ghi (BUG-W01-242 column "Resolution"): "Workaround hiện tại: dùng semantic selectors (text, heading, placeholder) cho subset có thể test được — đã implement cho 31 TCs". Khi web sẵn `data-testid`, agent-test-ui chỉ re-author spec cho 53 TC còn lại.

---

### B3. E2E spec — re-author login helper + replace fictional codes (BUG-W01-243, P1)

**Mở khóa**: 28 TC `e2e web` FAIL.

Đây **KHÔNG phải product bug** — là test-spec defect do planning agent generate từ assumption thay vì live DOM probe.

File cần fix (trong design repo, test agent owns):
- `Execution/auto/specs/W01/e2e/insurance-so-adjustment.spec.ts`
- `Execution/auto/specs/W01/e2e/insurance-stl-detail.spec.ts`

Thay đổi:

| Sai | Đúng |
|---|---|
| `page.getByLabel('Email')` | `page.locator('input[placeholder="Nhập số điện thoại"]')` |
| Email identifier (`accountant@...`) | Phone identifier (`0810000002` accountant / `0810000001` owner) |
| `getByRole('heading', { name: /đăng nhập/i })` | Bỏ hoặc thay = `page.locator('text=Đăng nhập')` (heading không có role=heading) |
| Fictional `SO-W01-BH-001` | Mã thực từ DB (vd `PDV-20260611-00006`, query trước khi run) |
| Route `/settlement/...` | Route `/settlement-voucher/...` (per memory `garage-web-route-singular-vs-api-plural`) |

**Owner**: `agent-test-e2e` (NOT DEV; spec là test artifact, design-repo owns) · **Trigger**: re-spawn `agent-test-e2e` ở TEST_EXECUTION mode (sẽ tự discover bug, re-author, re-run). Hoặc dùng `/test-exec` Run 2.

---

### B4. Security backend — JWT verify + RBAC (BUG-W01-227/228/230, 3 P1)

**Mở khóa**: 7+ TC `security` group A (authn/authz) + cải thiện pass rate 47% → > 80%.

Đây là **3 lỗ hổng release-blocking** trong gf-sales + gf-accounting:

| Bug | Service | Thay đổi |
|---|---|---|
| BUG-W01-227 | gf-sales + gf-accounting | Backend phải verify JWT `exp` claim → reject 401 cho token hết hạn |
| BUG-W01-228 | gf-sales + gf-accounting | Backend phải verify JWT signature → reject 401 cho token bị tamper |
| BUG-W01-230 | gf-accounting | Thêm RBAC check — role `THO` (thợ kỹ thuật) phải bị 403 trên endpoint settlement |

> Lưu ý — memory `garage-jwt-no-signature-verify` ghi rằng backend HIỆN KHÔNG verify signature. Đây là decision cố ý hay regression cần kiểm tra với Architecture Authority trước khi fix. Có thể là intentional design (sso-stub mint HS256 tùy ý) cho local dev, nhưng phải đảm bảo production có signature verify thật.

**Verify config (Spring Security typical)**:
```yaml
# services/gf-sales/src/main/resources/application.yml (and gf-accounting)
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          jwk-set-uri: ${SSO_JWKS_URI}    # phải set, không bypass
          # OR public-key-location: classpath:public.pem
```

**Owner**: `agent-fix-gf-sales` + `agent-fix-gf-accounting` (per-service repos) · **Trigger**: `/spawn-fix gf-sales` + `/spawn-fix gf-accounting`. L2 verify: BUG-W01-227/228/230.verify.md đã tồn tại.

---

### B5. API persist + validate (BUG-W01-236, BUG-W01-237, 2 P1)

**Mở khóa**: 3 TC API SOADJ-032/034/035; close root cause "validation gap" trong CALC-INS-006.

| Bug | File trong `services/gf-sales/` | Thay đổi |
|---|---|---|
| BUG-W01-236 | Controller/DTO `ServiceOrderUpdateV3Request` | Thêm `@Min(0) @Max(100)` cho `depreciationByLine[].percent`; reject 400 nếu out of range |
| BUG-W01-237 | JPA mapping `ServiceOrderPartEntity` + write-side use case | Wire `depreciationByLine[].percent` → column `service_order_part.depreciation_percent` (hiện đang NULL sau update) |

**Owner**: `agent-fix-gf-sales` · **Trigger**: `/spawn-fix gf-sales`. L2 verify: BUG-W01-236/237.verify.md.

---

## Dependency / Sequence (gợi ý)

```
Day 1 — parallel
├── Stream A1 (Ops): cài Flutter SDK + boot emulator
├── Stream A2 (Ops): seed insurance-SO pool
├── Stream B1 (DEV agg-garage-graph): BFF SDL bh/kh           ← unblock UI + E2E cascade
├── Stream B3 (test-e2e): re-author spec (login + codes)      ← spec defect
├── Stream B4 (DEV gf-sales + gf-accounting): JWT verify + RBAC ← security gate
└── Stream B5 (DEV gf-sales): percent validate + persist

Day 2 — sau khi A + B1/B4/B5 xong
├── Stream B2 (DEV garage-web): data-testid wire             ← phụ thuộc B1 đã có data render
└── /test-exec Run 2 partial: chạy lại 8 agent

Day 3
├── /test-exec Run 2 full + Step 5 Bug Verification Loop
└── verify-stage-exit.sh TEST_EXECUTION + transition QC nếu pass
```

## Verify trước khi /test-exec Run 2

```bash
# Stream A
flutter --version && dart --version                # ≥ 3.41 / ≥ 3.11
adb devices | grep emulator                        # device booted
psql -h localhost -p 15432 -U chungnt -d gf_sales -c \
  "SELECT count(*) FROM service_order WHERE has_insurance AND status='PRICING'"
# expect ≥ 200

# Stream B (smoke)
curl -s -H "Authorization: Bearer $EXPIRED_TOKEN" http://localhost:45091/api/v3/service-orders/1
# expect HTTP 401 (B4 BUG-W01-227)
curl -s http://localhost:45401/garage/graphql -d '{"query":"{ __type(name:\"InsuranceSettlementBreakdown\") { fields { name } } }"}'
# expect fields include "bh" and "kh" (B1 BUG-W01-244)
```

## Mapping bug → unblock plan

| Bug | Severity | Stream | Item | Owner |
|---|---|---|---|---|
| BUG-W01-227 | P1 | B4 | JWT exp verify | `agent-fix-gf-sales` + `agent-fix-gf-accounting` |
| BUG-W01-228 | P1 | B4 | JWT signature verify | idem |
| BUG-W01-230 | P1 | B4 | RBAC role THO 403 | `agent-fix-gf-accounting` |
| BUG-W01-236 | P1 | B5 | percent range validate | `agent-fix-gf-sales` |
| BUG-W01-237 | P1 | B5 | percent persist column | `agent-fix-gf-sales` |
| BUG-W01-240 | P1 | B1 | STL detail crash (BFF SDL) | `agent-fix-agg-garage-graph` |
| BUG-W01-243 | P1 | B3 | E2E spec login/codes | `agent-test-e2e` |
| BUG-W01-244 | P1 | B1 | BFF SDL bh field | `agent-fix-agg-garage-graph` |
| BUG-W01-242 | P2 | B2 | `data-testid` wire | `agent-fix-garage-web` |
| BUG-W01-239 | P2 | B2-adjacent | Regression BH=Không render | `agent-fix-garage-web` |
| BUG-W01-241 | P2 | B1-adjacent | STL list JS error | `agent-fix-garage-web` (sau B1) |
| BUG-W01-226 | P2 | B1-adjacent | BFF info disclosure | `agent-fix-agg-garage-graph` |
| BUG-W01-229 | P2 | B1-adjacent | BFF 401 wrapping | `agent-fix-agg-garage-graph` |
| BUG-W01-231 | P2 | B5-adjacent | XSS encode | `agent-fix-gf-sales` |
| BUG-W01-232 | P2 | (separate) | ADR-014 contract drift | `agent-fix-gf-sales` |
| BUG-W01-233/234/235/238 | P3 | đặt sau | Enum/type/oracle drift | `agent-fix-gf-sales` |

---

## Decision Matrix (Stream 2 — 4 user decisions, hiện trạng 2026-06-11)

| Decision | Status | CR ID | Action ngay |
|---|---|---|---|
| **iOS TC-MOB-025 defer** | ✓ APPROVED | [CR-1781166951](../../Tracking/CHANGE-REQUESTS.md#cr-1781166951--w01-defer-ios-universal-link-tc-mob-025) MINOR | TC-W01-MOBILE-E2E.md row TC-MOB-025 cần update status `BLOCKED-by-harness` → `SKIPPED-out-of-wave-by-CR` ở Run 2 |
| **garage-web data-testid backfill (53 TC)** | ✓ APPROVED | [CR-1781160847](../../Tracking/CHANGE-REQUESTS.md#cr-1781160847--w01-testability-backfill-data-testid) MINOR | User cần `scripts/state.py transition DEV` + mở Claude Code session trong `frontend/gf-gms-web/` + `/spawn-dev garage-web` |
| **Alchemist Roboto fonts (12 TC)** | PENDING | — | Option A: agent-test-mobile-ui download Roboto khi Run 2 (no CR cần — harness in agent's allowed write scope). Option B: bỏ font declaration trong harness pubspec (accept font drift Linux/macOS). |
| **Perf TC-003 seed pool (1 TC)** | PENDING | — | Option A: defer sang perf wave WT-M/WT-F (no CR cần — W01 không phải designated perf wave). Option B: viết `infra/init-data/seed-insurance-so-pool.sql` (Ops task). |
| **JWT verify policy (BUG-W01-227/228 P1)** | PENDING | — | Hỏi Architecture Authority trước khi fix. Memory `garage-jwt-no-signature-verify` ghi đây là behavior cố ý cho local-dev sso-stub HS256. Nếu confirm production phải verify thật → raise CR MAJOR (cross-boundary contract). Nếu profile-based skip cho local-dev → CR MODERATE. |

**Khuyến nghị xử lý 3 PENDING ngay**:
1. Alchemist font: chọn Option A (download Roboto khi Run 2) — minimal risk, không cần CR.
2. Perf seed: chọn Option A (defer) — raise CR MINOR ngắn defer TC-W01-PERF-003 cùng với TC-MOB-025 cluster.
3. JWT: defer quyết định sau khi DEV fix BUG-W01-236/237 + BFF SDL xong; resume Architecture review tại QC stage handoff.

---

## Phase-Split Execution Plan cho RAM bottleneck (2026-06-11)

Host RAM: 31 GB total / 26 GB used (Docker stack + IDE + Java services other users). Mobile-e2e cluster cần emulator (1.5 GB) + Flutter compile (1-2 GB) + APK install (200 MB) + Patrol drive → ~3-4 GB headroom required. Không thể chạy đồng thời với full Run 2 backend agents (gf-sales 600 MB + gf-accounting 600 MB + BFF 250 MB + Postgres + Kafka + Redis + Web container).

**Phase-Split Strategy** (recommended cho Run 2):

### Phase A — Backend + Web + Headless tests (RAM ~5-6 GB beyond baseline)

Chạy 6 agents song song qua `/test-exec` (modified scope):
- `agent-test-api` (75 TC, runner: QC harness Jest)
- `agent-test-e2e` (28 TC, runner: Playwright Chromium, ~600 MB)
- `agent-test-ui` (92 TC, runner: Playwright Chromium share + RTL)
- `agent-test-isolation` (14 TC, runner: HTTP client + DB)
- `agent-test-performance` (3 TC, runner: k6 Docker)
- `agent-test-security` (32 TC, runner: HTTP fuzz + manual)

**+ headless mobile cluster** chạy chung phase A vì không cần emulator:
- `agent-test-mobile-ui` C1 (91 TC, flutter_test headless)
- `agent-test-mobile-e2e` C1/C2 (4 TC, integration_test headless)

→ **Phase A target**: 339 TC executable. Pass rate gate `> 80%`.

### Phase B — Mobile native (chạy SAU Phase A, RAM dồn cho emulator)

Trước khi bắt đầu Phase B:
1. Stop Docker container không thuộc W01 scope (giữ Postgres + Redis + Kafka + gf-sales + gf-accounting + agg-garage-graph + garage-web):
   ```bash
   docker stop $(docker ps -q --filter "name=^(?!gf-sales|gf-accounting|agg-garage-graph|garage-web|gf-postgres|gf-redis|gf-kafka).*$")
   # hoặc explicit list:
   docker compose -f infra/docker-compose.yml stop gf-system gf-erp-mdm gf-customer gf-inventory gf-sims 2>/dev/null
   ```
2. Verify free RAM ≥ 4 GB: `free -m | head -3`
3. Boot emulator detached: `sg kvm -c "nohup setsid emulator -avd pixel6_api33 -no-window -no-snapshot -no-audio -gpu swiftshader_indirect -memory 1536 -cores 2 > /tmp/emu.log 2>&1 < /dev/null &"`
4. Wait boot: `adb wait-for-device && adb shell getprop sys.boot_completed`

Chạy 2 mobile agents:
- `agent-test-mobile-ui` C2/C3/C4 (24 TC remaining sau Phase A)
- `agent-test-mobile-e2e` C3/C4 (26 TC remaining)

→ **Phase B target**: 50 TC executable. Combine vào pass rate aggregate.

### Phase orchestration

- Phase A run cùng 1 lần `/test-exec` qua command modification: pass `--scope-exclude mobile-native-c3c4` (chưa support — tạm thời mobile-ui/mobile-e2e tự skip C2/C3/C4 ở Phase A via TC status `SKIPPED-deferred-to-phase-B`).
- Phase B: re-run `/test-exec` với scope chỉ 2 mobile agents (qua filter trong spawn-test prompt).

### Khả thi không cần phase split

Nếu user kill toàn bộ container không liên quan, free RAM lên ~10 GB, có thể chạy single-phase Run 2 với tất cả agents song song. Trade-off: mất API/E2E backend nếu lỡ kill nhầm container.

---

## Lint status sau cập nhật (2026-06-11)

- `bash Execution/checklists/impl/scripts/validate-bugs-md.sh` → **VERDICT: PASS** (0 violations, 0 warnings)
- L2 verify files đã đủ cho 4 P1 mới (BUG-W01-243/247 cộng với BUG-W01-029/031/240 mà sibling agents đã tạo)
- Status taxonomy clean (BUG-W01-237: ESCALATED → ASSIGNED; BUG-W01-238: ESCALATED → DEFERRED)

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-11 | 2 | agent-test-api | Add §A1 actual run (Phase 1 Flutter SDK install + widget smoke PASS + alchemist font gap); §A1 Phase 2 actual run (Android SDK + emulator + AVD + patrol_cli 2.8.0 pinned + analytics opt-out); §A1 Phase 2 KVM enable + smoke (verified, RAM pressure caveat); §Decision Matrix (4 user decisions với CR mapping); §Phase-Split Execution Plan (cho RAM bottleneck); §Lint status (PASS sau L2 stub + status fix). |
| 2026-06-11 | 1 | agent-test-api (post Run 1) | Initial unblock plan aggregating 4 stream + 19 bug mapping for /test-exec Run 2 |
