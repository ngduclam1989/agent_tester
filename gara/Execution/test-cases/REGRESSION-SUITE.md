---
document_id: GMS-REGRESSION-SUITE
type: execution
artifact_kind: regression-test-suite
status: ACTIVE
version: 2
tier: T4
owner_authority: QA Authority
last_reviewed: "2026-06-11"
supersedes: "v1 (SnapVersify copy — incorrectly imported)"
---

# Regression Test Suite — Garage

> Bộ kiểm thử hồi quy — đảm bảo các chức năng đã giao ở wave trước KHÔNG bị phá vỡ khi phát triển feature/TD mới trên brownfield Garage (15 wave production đã ship). Convert từ SV v1 sang Garage thực tế (18 boundary, dual persona).

---

## 1. Mục đích

Regression suite phục vụ 2 mục tiêu:

1. **Phát hiện hồi quy (regression detection)** — chạy lại TC đã PASS ở wave trước hoặc baseline production, xác nhận chúng vẫn PASS sau khi code wave mới được merge.
2. **Bảo vệ tính toàn vẹn hệ thống** — với 18 boundaries, thay đổi ở boundary A có thể ảnh hưởng boundary B qua REST API contract, GraphQL schema, Kafka event schema, hoặc Temporal workflow.

### 1.1 Tiêu chí tuyển chọn TC vào regression

| Ưu tiên | Quy tắc tuyển chọn |
|---|---|
| **100% Critical (P1)** | Mọi TC có Priority=P1 từ wave trước hoặc baseline production → BẮT BUỘC vào regression |
| **High cross-boundary (P2 cross)** | TC P2 mà liên quan ≥ 2 boundaries (cross-boundary integration: REST/Kafka/Temporal) → BẮT BUỘC vào regression |
| **Medium với lịch sử bug P1/P2** | TC Medium đã từng FAIL và ghi bug P1 hoặc P2 → BẮT BUỘC vào regression |
| **Low (P3/P4)** | KHÔNG tuyển vào regression (trừ khi QA Authority override có lý do) |
| **Tenant isolation** | 100% TC isolation → BẮT BUỘC vào regression (Critical Rule §3.2 #4 — Tenant isolation) |
| **Web + Mobile parity** | Regression phải cover cả Web (Playwright) + Mobile (Patrol) cho cùng business outcome |

### 1.2 Nguồn TC

- Manual QC: `Execution/test-cases/TC-WAVE-{NN}-*.md` (ID `W{NN}-U-{NNN}`)
- Automated artifact: `Execution/automated-test-cases/TC-W{NN}-*.md` (case-level ID theo template)
- E2E journeys: `Execution/test-cases/E2E-SUITE.md` (J-01..J-07)
- TC được tuyển vào suite này giữ nguyên ID gốc; chỉ thêm entry tham chiếu trong section §2.x tương ứng wave.

---

## 2. Phạm vi hồi quy theo wave (Incremental Regression)

> **Brownfield context**: Garage đã production 15 feature wave (W01-W15: booking, SO, settlement, inventory, marketing…). Regression scope chia 2 nhóm:
> - **Baseline regression** (§2.0): re-run các TC cover 15 wave production khi feature mới chạm tới baseline (rare — chỉ khi cần audit major).
> - **Active wave regression** (§2.1+): re-run TC từ wave kề trước khi wave mới mở.
>
> Scope đang chạy = TD P0 Remediation hoặc Insurance Settlement (xem `Plan/WAVE-SEQUENCE.md`).

### 2.0 Baseline regression — 15 wave production (audit only)

| Domain | Boundary chính | TC source | Trigger chạy |
|---|---|---|---|
| Booking | `gf-sales` | Smoke S-02; J-01 (booking section) | Khi feature mới chạm `gf-sales` booking core |
| Service Order | `gf-sales` | Smoke S-03; J-01, J-05 | Khi feature mới chạm `gf-sales` SO core (walk-in, status flow) |
| Settlement (KH) | `gf-accounting` | Smoke S-08; J-01 | Khi feature mới chạm `gf-accounting` settlement |
| Quotation/PR/PO | `gf-purchase` | Smoke S-06, S-07; J-02 | Khi feature mới chạm `gf-purchase` |
| Inventory stock | `gf-inventory`, `gf-inventory-worker` | Smoke S-09; J-05, J-06, J-07 | Khi feature mới chạm inventory/temporal |
| Customer + Vehicle | `gf-customer` | Smoke S-10; J-03 | Khi feature mới chạm customer master / projection |
| Marketing/Campaign | `gf-marketing`, `gf-notification` | Smoke S-14; J-03 | Khi feature mới chạm marketing flow |
| ERP-bridge | `gf-erp-agent` | Smoke S-15 | Khi feature mới chạm ERP integration |
| Tenant isolation | mọi service | Smoke S-11; J-04 | **MỌI wave** (rule #4 Critical) |

**Tổng baseline ước tính**: 15-20 TC core cho 15 wave production; tăng theo feature mới chạm tới.

---

### 2.1 Wave W01 — Insurance Foundation (active)

**Scope**: Insurance Settlement slice 1/3 — `FEAT-INS-SO-ADJUSTMENT` + `FEAT-INS-STL-DETAIL`. Boundary touched: `gf-sales`, `gf-accounting`, `agg-garage-graph`, `garage-web`, `garage-mobile`.

| Module | TC IDs | Mô tả | Mức ưu tiên |
|---|---|---|---|
| `gf-sales` (SO Adjustment) | TC-W01-API-001..052, 067..071 (allocation persist + discard) | Lưu 8 scalar adjustment + depreciationByLine; toggle BH=Không discard; `updateServiceOrderV3` reuse SO thường | P1 (Critical) |
| `gf-sales` (for-settlement snapshot) | TC-W01-API-044..046 | Idempotent pull snapshot 8 breakdown + 8 adjustment fields | P1 |
| `gf-accounting` (Insurance Settlement detail) | TC-W01-API-072..087 (core), 096..098 (regression KH baseline) | `createInsuranceSettlement` cặp KH+BH atomic, rollback khi settle fail, cancel cascade, getSettlementByCode block insurance | P1 |
| `agg-garage-graph` (BFF passthrough) | TC-W01-API-016, 021 (mode validation propagation) + cross-feat | Mapper insurance.mapper.ts (mapServiceOrderInsuranceAdjustment) — read + write echo | P1 |
| `garage-web` (UI SO + Settlement) | TC-W01-UI-001..065 (SO Edit/Detail Web), 103..141 (STL detail Web) | Section Phân bổ QT BH, panel Tổng giá DV, 4 tab phiếu QT BH, conditional display phiếu KH | P1/P2 |
| `garage-mobile` (UI parity) | TC-W01-UI-066..089 (mobile), 147..159 (STL mobile) | Mobile inline Card, SegmentedButton, BLoC realtime, AppBar 4 tab | P1/P2 |
| **Isolation** (cross-cutting) | TC-W01-API-058..060, TC-W01-E2E-020, TC-W01-UI-091 | Tenant A query SO/Settlement của Tenant B → 403/404; OriginTenantId integrity | P1 |
| **Security** (cross-cutting) | TC-W01-API-053..057, 061..062, 088..095; TC-W01-UI-090, 092..093, 142..146 | Authn (token thiếu/expired/sig), Authz (role thợ 403), Injection, Leak | P1/P2 |
| **Performance** (SLO) | TC-W01-API-066, 099, 100 | SO save p99 < 800ms; GET phiếu QT BH p99 < 600ms; createInsuranceSettlement success rate ≥99.5% | P2/P3 |
| **E2E** (cross-boundary) | TC-W01-E2E-001..036 (web), TC-W01-E2E-002, 023, 025 (mobile sync) | Nhập 5 khoản → tạo cặp phiếu QT → snapshot khớp; Web ↔ Mobile parity; Deep E2E SO BH → cặp phiếu QT | P1/P2 |

**Tổng ước tính W01**: 295 TC (100 API + 36 E2E + 159 UI), tham chiếu split 8 file:
- `TC-W01-API.md` 79 TC (sau split) — `agent-test-api`
- `TC-W01-E2E.md` 32 TC — `agent-test-e2e`
- `TC-W01-UI.md` 110 TC — `agent-test-ui`
- `TC-W01-MOBILE-UI.md` 40 TC — `agent-test-mobile-ui`
- `TC-W01-MOBILE-E2E.md` 3 TC — `agent-test-mobile-e2e`
- `TC-W01-ISOLATION.md` 5 TC — `agent-test-isolation`
- `TC-W01-PERFORMANCE.md` 3 TC — `agent-test-performance`
- `TC-W01-SECURITY.md` 23 TC — `agent-test-security`

---

### 2.2 Wave W02+ — TBD

**Scope**: Chờ `Plan/WAVE-SEQUENCE.md` confirm scope post W01 (Insurance slice 2/3 hoặc TD P0 next).

Mẫu cấu trúc khi wave mở:

| Module | TC IDs | Mô tả | Mức ưu tiên |
|---|---|---|---|
| _Tất cả TCs từ §2.1_ | _(xem trên)_ | Regression W01 Critical + High cross-boundary | — |
| New boundary touched | TBD | TBD | TBD |

**Tổng ước tính**: TBD khi wave 02 chốt.

---

### 2.3 Wave W03+ — TBD

> QA Authority bổ sung section khi wave mở rộng. Nguyên tắc:
>
> - Mỗi wave mới hoàn thành → Critical TCs + High cross-boundary TCs → thêm vào regression set
> - Regression set tăng đều, KHÔNG xóa TC trừ khi feature bị deprecate
> - Brownfield baseline (§2.0) chỉ chạm khi feature mới chạm vào — không re-run full 15 wave mỗi commit

---

## 3. Full Regression — Gate Release

### 3.1 Release gate sau active wave block (vd Insurance W01-W03)

**Thời điểm**: Sau khi hoàn thành chuỗi wave (Insurance W01-W03 hoặc TD P0 W01-W03), trước khi release.

**Scope**:

| Hạng mục | Nội dung |
|---|---|
| **Tất cả Critical TCs** | Từ active wave block (vd W01-W03 Insurance) |
| **Tất cả High cross-boundary TCs** | Liên quan ≥ 2 boundaries trong block |
| **Baseline regression** (§2.0) | 15-20 TC cover baseline 15 wave (subset chạm bởi feature mới) |
| **E2E Journeys** | J-01 (Booking→SO→Settlement), J-04 (Tenant Isolation), + journey liên quan domain block (J-02/J-03/J-05/J-06/J-07) |
| **Smoke Suite** | 15/15 TCs |
| **Kiểm thử phi chức năng** | Tenant isolation per-tenant (J-04 full), performance SLO (p99 < ngưỡng PKG), security scan (OWASP smoke) |

**Exit criteria release gate**:

- [ ] 100% Critical TCs PASS
- [ ] 100% High cross-boundary TCs PASS
- [ ] Baseline §2.0 PASS cho domain bị chạm
- [ ] E2E Journeys (J-01, J-04, + liên quan) PASS
- [ ] Smoke Suite 15/15 PASS
- [ ] 0 bug P1/P2 open trong wave block
- [ ] Tenant isolation: 0 cross-tenant leakage (rule #4 Critical)
- [ ] Performance: p95 ≤ ngưỡng PKG cho API endpoints chính
- [ ] Web + Mobile parity verified (cross-platform)

---

### 3.2 Hotfix release gate (urgent fix on baseline 15 wave)

**Thời điểm**: Khi cần hotfix trên baseline production (vd P1 bug found in feature đã ship).

**Scope**:

| Hạng mục | Nội dung |
|---|---|
| **Bug verification re-run** | TC liên quan FAIL → re-test sau fix |
| **Baseline §2.0 (subset)** | Chỉ regression cho boundary bị chạm bởi hotfix |
| **Smoke Suite** | 15/15 PASS bắt buộc |
| **E2E Journeys (J-04 isolation)** | Bắt buộc — hotfix không vỡ tenant isolation |

**Exit criteria hotfix**:

- [ ] Bug verified resolved (L2 verify file PASS)
- [ ] Smoke Suite 15/15 PASS
- [ ] J-04 isolation PASS
- [ ] 0 new regression bug
- [ ] QA Authority sign-off (BUGS.md rule §3.2 #4: CLOSED chỉ bởi QA Authority)

---

## 4. Ma trận coverage theo Boundary

> Bảng dưới đây là placeholder — QA Authority cập nhật khi TC thực tế được tạo. 18 boundary Garage.

| Boundary | Tech | TC Critical | TC High | TC Medium | Tổng Regression | Ghi chú |
|---|---|---|---|---|---|---|
| `gf-system` | Java | — | — | — | — | Tenant provisioning, branch, invoice info |
| `gf-hrms` | Java | — | — | — | — | Employee + SSO + role |
| `gf-erp-mdm` | Java | — | — | — | — | Catalog MDM, PIM ingest, dynamic-data |
| `gf-sales` | Java | 14+ (W01) | — | — | 14+ | Booking, SO, settlement-facing, allocation insurance |
| `gf-purchase` | Java | — | — | — | — | Quotation, PR, PO, supplier, cart |
| `gf-inventory` | Java | — | — | — | — | Stock SoT, IO, period-closure, WAC/COGS |
| `gf-inventory-worker` | Java | — | — | — | — | Temporal: fulfillment, reservation-expiry, period-closure saga |
| `gf-accounting` | Java | 5+ (W01) | — | — | 5+ | Settlement record (KH + BH), sequence, printing |
| `gf-shipment` | Java | — | — | — | — | Shipment-order, ERP-bridge |
| `gf-customer` | Java | — | — | — | — | Customer master, vehicle, segment, campaign-trigger |
| `gf-marketing` | Java | — | — | — | — | Campaign, voucher, message-template, QR, Temporal workflows |
| `gf-notification` | Java | — | — | — | — | Notification fan-out push/in-app |
| `gf-erp-agent` | Java | — | — | — | — | ERP/COP bridge inbound/outbound |
| `gf-worker` | Java | — | — | — | — | DB-driven scheduled HTTP-job |
| `agg-garage-graph` | Node BFF | 20+ (W01) | — | — | 20+ | GraphQL aggregation cho Garage domain |
| `agg-sso-graph` | Node BFF | — | — | — | — | Auth gateway, Firebase token, Superset proxy |
| `garage-web` | React | 25+ (W01) | — | — | 25+ | SPA insurance, SO Edit/Detail, settlement detail |
| `garage-mobile` | Flutter | 25+ (W01) | — | — | 25+ | App insurance, SO, settlement |
| **Tổng** | — | — | — | — | — | Tăng dần khi wave mở rộng |

---

## 5. Quy trình chạy Regression

### 5.1 Trước khi chạy

1. Smoke suite PHẢI pass 100% trước — nếu smoke fail, KHÔNG chạy regression
2. Chuẩn bị environment: `infra/wave-up.sh` (Postgres 16 + Redis + Kafka + Temporal worker), seed data (tenant `garage-a`/`garage-b` + employee accounts)
3. Xác nhận regression set: lấy danh sách TC từ section §2.x tương ứng wave hiện tại + §2.0 baseline subset

### 5.2 Thực thi

1. Chạy regression TCs theo thứ tự domain (gf-sales → gf-purchase → gf-inventory → gf-accounting → gf-customer → gf-marketing → cross-cutting)
2. Mỗi TC fail → ghi bug `Tracking/WAVE{NN}/BUGS.md` với tag `[REGRESSION]`; severity tối thiểu P2, P1 nếu chạm crash/leak/data-loss
3. **Regression fail = chặn wave mới** cho đến khi fix

### 5.3 Báo cáo

- Kết quả ghi vào `Execution/test-reports/W{NN}/TEST-REPORT-W{NN}-regression.md`
- Nếu Full Regression (release gate): báo cáo riêng `TEST-REPORT-W{NN}-full-regression.md`
- Nếu Hotfix gate: `TEST-REPORT-HOTFIX-{date}-{issue}.md`

---

## Changelog

| Ngày | Thay đổi | Tác giả |
|---|---|---|
| 2026-04-24 | (SV legacy) Khởi tạo Regression Suite SnapVersify — incremental per wave + full regression W10/W20 (20 waves SV) | QA Authority (SV) |
| 2026-06-11 | **Convert SV → Garage (v1 → v2)**: thay toàn bộ domain SnapVersify (Platform Foundation/Tenant CRUD/Provisioning/Content/Moderation) bằng Garage thực tế. (a) Frontmatter `document_id` SV-REGRESSION-SUITE → GMS-REGRESSION-SUITE; (b) §2 restructure 4 SV section (W02/W04+/W06+/W08+) → 3 Garage section: §2.0 Baseline regression cho 15 wave production (audit only), §2.1 W01 Insurance Foundation (active, fill bằng TC consolidate W01), §2.2/§2.3 TBD; (c) §3 release gate: SV W10/W20 → Garage release gate sau active wave block + hotfix gate; (d) §4 module matrix: SV 14 boundary → Garage 18 boundary; (e) Tenant isolation rule #4 Critical (`TenantFilter` + `OriginTenantId` thay database-per-tenant SV); (f) Persona dual (accountant + garage-owner); (g) BUGS 2-tier `Tracking/WAVE{NN}/BUGS.md`; (h) Web + Mobile parity rule (Playwright + Patrol). | agent-test-api (bypass-owned + QA Authority sign-off pending) |
