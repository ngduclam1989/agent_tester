---
document_id: GMS-SMOKE-SUITE
type: execution
artifact_kind: smoke-test-suite
status: ACTIVE
version: 2
tier: T4
owner_authority: QA Authority
last_reviewed: "2026-06-11"
supersedes: "v1 (SnapVersify copy — incorrectly imported)"
---

# Smoke Test Suite — Garage

> Bộ kiểm thử khói (smoke test) — xác nhận nhanh hệ thống Garage hoạt động ở mức cơ bản sau mỗi deployment hoặc wave mới. Convert từ SV v1 sang Garage thực tế (18 boundary, dual persona, dual gateway BFF).

---

## 1. Mục đích

| Tiêu chí | Giá trị |
|---|---|
| **Thời gian chạy thủ công** | < 30 phút |
| **Thời gian chạy tự động** | < 5 phút |
| **Số lượng TC tối đa** | 15 TCs (giữ lean, không phình) |
| **Fail fast policy** | 1 TC Critical fail → DỪNG smoke → ghi bug theo severity trong `Tracking/WAVE{NN}/BUGS.md` (thường tối thiểu `P1`) → revert deployment nếu cần |

**Nguyên tắc:**

- Smoke test KHÔNG thay thế regression hay E2E — chỉ xác nhận "hệ thống còn sống" theo happy path.
- Mỗi TC trong smoke set phải chạy được **độc lập** (không phụ thuộc thứ tự).
- Nếu smoke fail, KHÔNG chạy tiếp regression hay E2E — fix trước.
- Smoke set tăng dần theo wave: tối thiểu 5 TCs core (foundation), tối đa 15 TCs.
- **Brownfield note**: Garage đã production 15 feature waves (booking → marketing). Smoke set hiện hành cover happy path baseline + active TD/feature waves.

---

## 2. Smoke Set theo nhóm domain

> Quy ước: ưu tiên dùng ID thực tế từ `TC-WAVE-*.md` (manual QC, `W{NN}-U-{NNN}`) hoặc automated testcase artifact (`TC-W{NN}-{TYPE}` trong `Execution/automated-test-cases/`). Nếu chưa có artifact, suite được phép giữ placeholder và phải sync khi testcase nguồn ra đời.

### 2.1 Foundation smoke (5 TCs — core baseline)

| # | TC ID | Tiêu đề | Boundary | Loại | Mức ưu tiên | Mô tả ngắn |
|---|---|---|---|---|---|---|
| 1 | S-01 | Đăng nhập SSO Firebase | `agg-sso-graph`, `gf-hrms` | API | Critical | Gọi mutation login qua `/graphql` (`agg-sso-graph`) → Firebase token verify → session/JWT trả về + profile employee có role accountant/garage-owner |
| 2 | S-02 | Tạo booking happy path | `agg-garage-graph`, `gf-sales`, `garage-web` | API/UI | Critical | Tạo lịch hẹn (status "Lịch hẹn mới") qua BFF `/garage/graphql` → persist `bookings` table → hiển thị trong danh sách booking |
| 3 | S-03 | Tạo Service Order (gắn booking + walk-in) | `agg-garage-graph`, `gf-sales` | API | Critical | Tạo SO gắn booking → SO status `ARRIVED`/persist. Test thêm walk-in: tạo SO không gắn booking → hệ thống tự sinh booking walk-in (ARRIVED). |
| 4 | S-04 | BFF routing 2 gateway | `agg-garage-graph`, `agg-sso-graph` | API | High | Request `/garage/graphql` → đúng gateway garage; request `/sso/graphql` → đúng gateway SSO. Header `X-Tenant-Id`/`X-Branch-Id`/`Authorization` propagate đầy đủ downstream |
| 5 | S-05 | Health check 16 service core | 14 Java + 2 BFF | API | Critical | Gọi `GET /actuator/health` cho 14 service Java → tất cả 200 UP. Gọi GraphQL `{ __typename }` cho 2 BFF → response 200 |

**Tổng cộng Foundation: 5 TCs** (4 Critical, 1 High)

---

### 2.2 Domain core smoke (thêm 5 TCs = tổng 10)

> Sanity check các domain chính sau khi foundation pass. Áp dụng khi wave touch tới domain tương ứng.

| # | TC ID | Tiêu đề | Boundary | Loại | Mức ưu tiên | Mô tả ngắn |
|---|---|---|---|---|---|---|
| 6 | S-06 | Tạo phiếu báo giá (quotation) | `gf-purchase` | API | High | Tạo quotation ask/bid → persist → response chứa ID + status hợp lệ |
| 7 | S-07 | Tạo PR/PO (procurement) | `gf-purchase` | API | High | Tạo Purchase Request → approved → Purchase Order created với supplier/items đúng |
| 8 | S-08 | Tạo Settlement record từ SO completed | `gf-accounting`, `agg-garage-graph` | API | Critical | SO `COMPLETED` → gọi `createSettlement` (hoặc `createInsuranceSettlement` cho SO BH) → settlement record persist, cặp KH+BH atomic nếu BH |
| 9 | S-09 | Inventory stock query | `gf-inventory` | API | High | GET stock by warehouse + part → trả `stock_quantity` integer + `last_io_at` |
| 10 | S-10 | Customer master query | `gf-customer` | API | High | GET customer by phone/code → trả master record + vehicle list snapshot |

**Tổng cộng sau Domain core: 10 TCs** (5 Critical, 5 High)

---

### 2.3 Cross-cutting smoke (thêm 5 TCs = tổng 15)

> Cross-cutting concerns (tenant isolation, event publishing, async workflows).

| # | TC ID | Tiêu đề | Boundary | Loại | Mức ưu tiên | Mô tả ngắn |
|---|---|---|---|---|---|---|
| 11 | S-11 | Tenant isolation sanity (smoke) | `gf-sales`, `agg-garage-graph` | SEC | Critical | Login `garage-a` → query SO của `garage-b` → 403/404. Không lộ data tenant khác (`TenantFilter` enforced) |
| 12 | S-12 | Outbox/inbox event relay | Producer + Consumer (vd `gf-sales` → `gf-accounting`) | Event | High | Tạo event state-changing (vd `ServiceOrderCompleted`) → outbox publish → consumer dedup qua inbox → no duplicate processing |
| 13 | S-13 | Temporal workflow start (5 services) | `gf-sales`/`gf-customer`/`gf-marketing`/`gf-inventory`/`gf-inventory-worker` | API | High | Trigger 1 workflow (vd `ReservationExpiryWorkflow`) → wf-id deterministic `{domain}-{tenantId}-{aggregate}` → Temporal Cloud nhận start, no duplicate |
| 14 | S-14 | Marketing notification fan-out | `gf-marketing`, `gf-notification` | API | High | Trigger campaign event → notification fan-out tới user_devices (DynamoDB) → response 2xx + delivery audit |
| 15 | S-15 | ERP-bridge inbound (gf-erp-agent) | `gf-erp-agent` | API | High | Mock external ERP message qua `gf-erp-agent` → validate schema → relay sang internal service đúng. Reject malformed schema (no domain-table direct write) |

**Tổng cộng sau Cross-cutting: 15 TCs** (6 Critical, 9 High)

---

## 3. Quy trình chạy Smoke

### 3.1 Khởi động (Startup)

1. Đảm bảo hạ tầng local đã khởi động: `infra/wave-up.sh` (Postgres 16 + Redis 7 + Kafka 3.6 + Temporal worker + Kong/AWS Gateway)
2. Đảm bảo tất cả services đã start: kiểm tra `/actuator/health` cho 14 Java + GraphQL ping cho 2 BFF
3. Seed dữ liệu test cơ bản (nếu cần): tenant (`garage-a`, `garage-b`) + accountant + garage-owner accounts

### 3.2 Thực thi tuần tự

1. Chạy **tuần tự** từ TC #1 → TC #N (N = số TC active theo wave hiện tại)
2. Mỗi TC ghi kết quả: PASS / FAIL / SKIP
3. **Nếu TC Critical FAIL** → DỪNG ngay → chuyển bước 3.3
4. Nếu TC High FAIL → ghi nhận, tiếp tục chạy các TC còn lại

### 3.3 Xử lý khi Fail

| Mức ưu tiên TC | Hành động |
|---|---|
| **Critical FAIL** | (1) Dừng smoke ngay lập tức. (2) Ghi bug vào `Tracking/WAVE{NN}/BUGS.md` với tag `[SMOKE]`; severity thường tối thiểu `P1`. (3) Revert deployment/commit gây lỗi nếu impact yêu cầu. (4) Chạy lại smoke sau khi fix. |
| **High FAIL** | (1) Ghi bug vào `Tracking/WAVE{NN}/BUGS.md` với tag `[SMOKE]`; severity thường tối thiểu `P2` nếu không có crash/leak/security issue. (2) Hoàn thành smoke run. (3) Fix trước khi chạy regression. |

### 3.4 Báo cáo

- Kết quả smoke ghi vào `Execution/test-reports/W{NN}/TEST-REPORT-W{NN}-smoke.md` (dùng TEST-REPORT-TEMPLATE.md)
- Tổng hợp: số TC PASS / FAIL / SKIP, thời gian chạy, danh sách bug filed

---

## 4. Ma trận Smoke theo phạm vi

| Phạm vi | TCs active | TC IDs | Thời gian ước tính (tự động) |
|---|---|---|---|
| Foundation (auth/booking/SO/BFF/health) | 5 | S-01..S-05 | < 1 phút |
| Domain core (quotation/PO/settlement/inventory/customer) | 10 | S-01..S-10 | < 2 phút |
| Cross-cutting (isolation/outbox/temporal/marketing/erp) | 15 | S-01..S-15 | < 3 phút |
| Wave-specific full smoke (per active wave) | 15 + wave delta | S-01..S-15 + delta | < 5 phút |

> **Wave-specific delta**: mỗi wave kích hoạt thêm TC chuyên biệt (vd W01 Insurance → thêm sanity cho `createInsuranceSettlement` + `for-settlement` snapshot). Chốt tại `WAVE-SEQUENCE.md` mỗi wave.

---

## Changelog

| Ngày | Thay đổi | Tác giả |
|---|---|---|
| 2026-04-24 | (SV legacy) Khởi tạo Smoke Suite — 15 TCs chia 4 giai đoạn wave SnapVersify | QA Authority (SV) |
| 2026-06-11 | **Convert SV → Garage (v1 → v2)**: thay toàn bộ domain SnapVersify (auth-client/platform-ui/tenant/media-service/content/moderation) bằng Garage thật. (a) Frontmatter `document_id` SV-SMOKE-SUITE → GMS-SMOKE-SUITE; (b) §2 smoke set restructure 4 giai đoạn wave-based → 3 group domain-based (Foundation 5 + Domain core 5 + Cross-cutting 5) cho phù hợp brownfield 15-wave production + 18-boundary topology; (c) TC IDs đổi từ `W01-U-{NNN}`/`TC-W{NN}-...` SV sang `S-01..S-15` Garage smoke convention; (d) BUGS path 2-tier `Tracking/WAVE{NN}/BUGS.md`; (e) Domain: SSO Firebase, booking + walk-in, SO, BFF dual-gateway, Health 14+2, quotation/PR/PO, settlement (BH + KH), inventory, customer, tenant isolation, outbox/inbox, Temporal 5 services, marketing fan-out, ERP-bridge. | agent-test-api (bypass-owned + QA Authority sign-off pending) |
