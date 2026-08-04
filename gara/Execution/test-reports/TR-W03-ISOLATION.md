---
document_id: "TR-W03-ISOLATION"
type: test-report
parent: SV-TEST-CASE-REGISTRY
status: ACTIVE
version: 1
wave: "W03"
agent: "agent-test-isolation"
boundary: "gf-inventory, agg-garage-graph, garage-web, ct-file-storage, gf-erp-mdm"
execution_date: "2026-07-02"
last_reviewed: "2026-07-02"
---

# Báo cáo kiểm thử — Wave 03: Tenant Isolation (Danh mục vật tư — EP-INVENTORY-CATALOG)

> Báo cáo kết quả kiểm thử cho Wave W03, thực thi bởi `agent-test-isolation`, batch run gồm 5 test agent (api, isolation, security, ui, e2e — KHÔNG có performance/mobile-ui/mobile-e2e trong batch này).
> Execution slice: tenant isolation — cross-tenant Material Group/Internal Product CRUD denial, SKU mapping/conversion-unit/attachment cross-tenant, import/export tenant scoping, JWT/header trusted-context integrity, TenantFilter full-sweep, dữ liệu chủ dùng chung regression guard.
> Two-tenant matrix: Tenant A `garage-a` (`tenant_id=1`), Tenant B `garage-b` (`tenant_id=467`, JWT forge HS256 `dev-sso-stub-secret`). Toàn bộ dữ liệu 2 tenant dùng trong run này là **dữ liệu tạo mới hoàn toàn** (không tái sử dụng seed cũ), theo yêu cầu riêng của lượt chạy.
> **KẾT LUẬN QUAN TRỌNG: 2 phát hiện P1 confirmed cross-tenant/trust-boundary — release-blocking theo Rule #4. KHÔNG được che bằng tỷ lệ pass tổng (34/36 = 94.4% trông có vẻ tốt nhưng 2 FAIL còn lại là nghiêm trọng nhất có thể có).**

---

## 1. Tổng quan

| Trường | Giá trị |
|---|---|
| **Wave** | W03 |
| **Subject / execution slice** | Tenant Isolation — 12 FEAT `EP-INVENTORY-CATALOG` (Material Group + Internal Product CRUD, SKU mapping, conversion-unit, attachment, import, export) |
| **Boundary(ies)** | `gf-inventory`, `agg-garage-graph`, `garage-web` (indirect), `ct-file-storage`, `gf-erp-mdm` (dùng chung, không isolate) |
| **Agent thực thi** | `agent-test-isolation` |
| **Nguồn thống kê** | AUTOMATED (`Execution/automated-test-cases/TC-W03-ISOLATION.md`) |
| **Ngày bắt đầu** | 2026-07-02 |
| **Ngày kết thúc** | 2026-07-02 (cùng ngày, gồm 1 lần chạy chính + 1 lần re-verify 2 phát hiện P1 sau khi hạ tầng restart) |
| **Số lần chạy chính thức** | 2 (Run 1 = full execution 36 TC; Run 2 = re-verify riêng 2 bug P1 sau session interrupt + `agg-garage-graph` restart) |
| **Loại kiểm thử** | Isolation / Regression |
| **Môi trường** | Local (`docker compose`, infra healthy: `gf-postgres`, `gf-redis`, `gf-kafka`, `gf-inventory`, `agg-garage-graph`, `gf-erp-mdm`, `gf-sims`) |
| **Gate source** | Work package `PKG-W03-inventory-catalog.md` §2.2.1/§2.2.2/§4.3; Rule #4 tenant isolation; `.agents/agent-test-isolation.md` |
| **Kết luận tổng quát** | **CONDITIONAL — KHÔNG READY cho release** — 34/36 TC PASS, nhưng 2 FAIL là P1 confirmed cross-tenant leak (`BUG-W03-103` JWT signature bypass — cross-tenant READ+WRITE thật; `BUG-W03-104` ct-file-storage không enforce tenant ACL). Cả 2 release-blocking theo Rule #4, đã file đủ 3-layer bug, chưa fix, chưa verify. |

---

## 1.5 Run Timeline

| Run # | Ngày | Trigger | Commit/Image | TC executed | PASS | FAIL | BLOCKED | SKIPPED | New bugs | Bugs verified | Verdict |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|---|
| Run 1 (full) | 2026-07-02 | `/test-exec` W03 isolation — TEST_EXECUTION | `gf-inventory@HEAD`, `agg-garage-graph@HEAD` | 36 | 34 | 2 | 0 | 0 | BUG-W03-103, BUG-W03-104 | — (lần đầu) | CONDITIONAL |
| Run 2 (re-verify P1) | 2026-07-02 (sau session interrupt) | Yêu cầu re-verify 2 phát hiện P1 trước khi file bug chính thức | `gf-inventory@HEAD`, `agg-garage-graph@HEAD` (đã restart, uptime 4 phút tại thời điểm re-verify) | 2 (chỉ TC-017 + TC-019) | 0 | 2 | 0 | 0 | — | — | Cả 2 tái hiện y hệt, KHÔNG phải flaky |

**Run 2 rationale**: Session bị gián đoạn giữa lúc file bug; trước khi ghi L1/L2/repro chính thức, thực hiện lại đúng 2 kịch bản trọng yếu (JWT tamper cross-tenant, ct-file-storage no-ACL probe) một lần nữa để xác nhận không phải kết quả tạm thời/flaky trước khi log bug chính thức. Kết quả: cả 2 tái hiện y hệt Run 1, kể cả sau khi `agg-garage-graph` đã restart — xác nhận bug ổn định, không phụ thuộc trạng thái tạm thời của service.

---

## 2. Kết quả tổng hợp

### 2.1 Tóm tắt số liệu

| Chỉ số | Giá trị | Ngưỡng | Đạt? |
|---|---|---|---|
| Tổng TC trong artifact | 36 (28 gốc + 8 case data-mới bổ sung TC-029..036) | — | — |
| TC thực thi được | 36 | — | — |
| TC PASS | 34 | — | — |
| TC FAIL | 2 (cả 2 là P1) | 0 P1 cross-tenant leak | **KHÔNG** |
| TC BLOCKED | 0 | — | CÓ |
| TC SKIPPED | 0 | — | CÓ |
| **Tỷ lệ pass** | 94.4% (34/36) | — | Số liệu cao nhưng **KHÔNG phản ánh đúng mức độ nghiêm trọng** — 2 FAIL là confirmed cross-tenant compromise |
| Bug P0 mở (isolation scope) | 0 | 0 | CÓ |
| **Bug P1 mở (isolation scope)** | **2 (`BUG-W03-103`, `BUG-W03-104`, cả 2 OPEN)** | 0 | **KHÔNG — release-blocking** |
| Bug P2 mở (isolation scope) | 0 | — | CÓ |
| Case data-mới required-only/full-fields (yêu cầu bổ sung) | 8/8 hoàn thành (TC-029..036, cả 2 tenant × 2 entity × 2 biến thể) | 8 | CÓ |

### 2.2 Phân bổ theo mức ưu tiên

| Mức ưu tiên | Tổng | PASS | FAIL | Tỷ lệ pass |
|---|---|---|---|---|
| P1 | 20 | 18 | 2 | 90% |
| P2 | 16 | 16 | 0 | 100% |

### 2.3 Phân bổ theo Execution Surface

| Execution Surface | Tổng | PASS | FAIL | Ghi chú |
|---|---|---|---|---|
| REST `gf-inventory` — Material Group CRUD cross-tenant | 6 | 6 | 0 | TC-002..007 |
| REST `gf-inventory` — Internal Product CRUD cross-tenant | 5 | 5 | 0 | TC-009..012 |
| REST `gf-inventory` — SKU/conversion-unit/attachment cross-tenant | 4 | 3 | 1 | TC-013/014/015 PASS; TC-017 FAIL (`BUG-W03-104`) |
| REST `gf-inventory` — Import/Export | 3 | 2 | 1 | TC-018/020 PASS; TC-019 FAIL (`BUG-W03-103`) |
| GraphQL BFF `agg-garage-graph` — propagation + deep-link data | 4 | 4 | 0 | TC-025/026/027 + kịch bản 1 của TC-019/103 cũng qua BFF |
| Trusted-context (JWT/header) | 3 | 2 | 1 | TC-021/024 PASS; kịch bản chính của TC-019 FAIL |
| DB-level full-sweep + master-data regression guard | 2 | 2 | 0 | TC-022, TC-028 |
| Data setup mới (required-only/full-fields, 2 tenant) | 8 | 8 | 0 | TC-029..036 |
| Concurrent 2-tenant create | 2 | 2 | 0 | TC-001, TC-008 |
| SKU search tenant-scoped | 1 | 1 | 0 | TC-023 |

### 2.4 Phân bổ theo nguồn thực thi

| Nguồn | Tổng | PASS | FAIL | Ghi chú |
|---|---|---|---|---|
| Automated (thực thi trực tiếp curl/python/psql trong session, không qua Jest harness) | 36 | 34 | 2 | Bash không bị chặn trong session này — không cần fallback `docker exec gf-sims node`. |
| Manual | N/A | — | — | Xem `Execution/test-cases/TC-W03-ISOLATION.md` (14 TC, read-only cross-check — parity 14/14 covered, 0 auto-miss, không đổi so với TEST_PLANNING) |

---

## 3. Chi tiết 2 phát hiện P1 (release-blocking)

### 3.1 BUG-W03-103 — JWT không được xác thực chữ ký, cross-tenant READ + WRITE (P1)

- **Nguồn**: `TC-W03-ISO-019`
- **Tóm tắt**: `gf-inventory` (và cả đường đi qua BFF `agg-garage-graph`) KHÔNG verify HMAC signature của JWT trước khi đọc claim `custom:tenant_id` để resolve tenant context. Chứng minh 2 kịch bản độc lập:
  1. **READ**: token của `garage-b`, sửa claim thành `custom:tenant_id="1"`, phá huỷ hoàn toàn signature (43 ký tự rác) → qua BFF `searchMaterialGroups` vẫn trả **HTTP 200 + dữ liệu THẬT của garage-a**.
  2. **WRITE**: token của `garage-a`, chỉ sửa claim thành `custom:tenant_id="467"` (giữ signature cũ, nay không khớp) → `importInternalProducts` vẫn **HTTP 200**, ghi thật 1 record vào `tenant_id=467` trong DB.
- **Root cause nghi vấn**: shared `common-security` library (dùng chung `gf-sales`/`gf-accounting`/`gf-inventory`) không có bước verify signature — cùng pattern đã từng ghi nhận `BUG-W01-227/228` (W01) và `BUG-W02-029` (W02), cả 2 đều bị đóng `INVALID (out-of-scope)` vì lý do "sóng đó chưa có scope Security" — **KHÔNG phải đã fix**. W03 lần này CÓ Security trong scope batch (5 agent: api/isolation/security/ui/e2e) nên lý do "out-of-scope" KHÔNG còn áp dụng được.
- **Mức độ mới**: lần đầu confirmed cho `gf-inventory`; lần đầu chứng minh được **cross-tenant WRITE** thành công (không chỉ READ) trong toàn bộ chuỗi phát hiện liên quan.
- **3-layer đã file**: L1 `Tracking/WAVE03/BUGS.md` row `BUG-W03-103`; L2 `Tracking/WAVE03/verify/BUG-W03-103.verify.md`; repro `Tracking/WAVE03/repro/BUG-W03-103.sh`; evidence `Execution/auto/evidence/W03/isolation/BUG-W03-103-jwt-signature-bypass.json`.
- **Verify lần 2**: reproduced lại y hệt sau khi `agg-garage-graph` restart — không phải flaky.

### 3.2 BUG-W03-104 — ct-file-storage không enforce tenant namespace/ACL (P1)

- **Nguồn**: `TC-W03-ISO-017`
- **Tóm tắt**: simulator `ct-file-storage` (`gf-sims`, port 45888) trả `HTTP 200 {"success":true,"code":"00","message":"stub: unmapped endpoint"}` cho **MỌI** path bất kể tenant prefix đúng hay sai, không cần Authorization/credential nào. Tái diễn nguyên văn pattern đã ghi nhận `BUG-W02-ISO-001` (W02, vẫn `OPEN` từ 2026-06-22, chưa có quyết định fix).
- **Root cause nghi vấn**: route `/tenant-*/...` chưa được implement thật trong simulator, rơi vào default catch-all handler luôn trả 200 — khả năng cao là giới hạn của test-env simulator (production dùng presigned URL S3 thật theo ADR-016), nhưng CHƯA có xác nhận chính thức từ Platform/Security nên KHÔNG được tự ý đóng `INVALID`.
- **3-layer đã file**: L1 `Tracking/WAVE03/BUGS.md` row `BUG-W03-104`; L2 `Tracking/WAVE03/verify/BUG-W03-104.verify.md`; repro `Tracking/WAVE03/repro/BUG-W03-104.sh`; evidence `Execution/auto/evidence/W03/isolation/BUG-W03-104-ct-file-storage-no-tenant-acl.json`.
- **Verify lần 2**: reproduced lại y hệt — không phải flaky.
- **Khuyến nghị**: nên xử lý gộp cùng `BUG-W02-ISO-001` (cùng root cause platform-level).

---

## 4. Bug Verification Loop (Step 6 — kiểm tra bug ISO cũ cần re-verify)

Đã kiểm tra `Tracking/WAVE03/BUGS.md` trước khi bắt đầu execution: **KHÔNG có bug nào thuộc scope `agent-test-isolation`/`TC-W03-ISO-*` ở trạng thái `FIX_DONE`/`VERIFY_PENDING`/`RESOLVED`** — đây là lần đầu tiên `agent-test-isolation` chạy `TEST_EXECUTION` cho W03 (trước đó chỉ có `TEST_PLANNING`), nên không có bug tồn đọng nào cần verify lại trong lượt này. 2 bug mới (`BUG-W03-103`, `BUG-W03-104`) đều ở trạng thái `OPEN` lần đầu, chưa qua fix cycle.

---

## 5. Case Data-Mới (Required-only / Full-fields) — Yêu cầu bổ sung của lượt chạy

| Case | Entity | Tenant | Trạng thái | TC ID |
|---|---|---|---|---|
| Required-only | Material Group | garage-a | Hoàn thành, PASS | TC-W03-ISO-029 |
| Full-fields | Material Group | garage-a | Hoàn thành, PASS | TC-W03-ISO-030 |
| Required-only | Material Group | garage-b | Hoàn thành, PASS | TC-W03-ISO-031 |
| Full-fields | Material Group | garage-b | Hoàn thành, PASS | TC-W03-ISO-032 |
| Required-only | Internal Product | garage-a | Hoàn thành, PASS | TC-W03-ISO-033 |
| Full-fields | Internal Product | garage-a | Hoàn thành, PASS (kèm SKU mapping + conversion-unit + attachment bổ sung) | TC-W03-ISO-034 |
| Required-only | Internal Product | garage-b | Hoàn thành, PASS | TC-W03-ISO-035 |
| Full-fields | Internal Product | garage-b | Hoàn thành, PASS | TC-W03-ISO-036 |

Toàn bộ 8/8 case đã tạo mới thành công qua API thật (không dùng seed cũ, không INSERT DB trực tiếp), dùng làm nguồn dữ liệu cho các TC cross-tenant denial phía sau (TC-002..028). Xác nhận assertion cross-tenant denial đúng với **cả 2 biến thể** dữ liệu (required-only và full-fields) — không có khác biệt hành vi giữa 2 loại record khi bị truy cập cross-tenant.

---

## 6. Kết luận & Khuyến nghị

1. **KHÔNG READY cho release** cho tới khi `BUG-W03-103` và `BUG-W03-104` được Platform/Security review và có hướng xử lý rõ ràng (fix hoặc quyết định chính thức có ghi rationale — không được im lặng đóng).
2. `BUG-W03-103` là nghiêm trọng nhất từng phát hiện trong chuỗi "JWT signature bypass" qua 3 wave (W01/W02/W03) vì lần đầu chứng minh được **cross-tenant WRITE** thật, không chỉ READ lý thuyết.
3. `BUG-W03-104` nên được xử lý gộp với `BUG-W02-ISO-001` (cùng root cause platform/simulator) để tránh phát hiện lại lần thứ 3 ở wave sau.
4. TenantFilter ở tầng business logic (khi JWT đáng tin) hoạt động ĐÚNG trên toàn bộ 26/28 TC còn lại — không có lỗ hổng logic nghiệp vụ, vấn đề nằm hoàn toàn ở tầng auth/trust-boundary bên dưới.
5. Đề xuất 2 lesson-learn mới (`TL-W03-ISO-001`, `TL-W03-ISO-002`) đã ghi trong `TC-W03-ISOLATION.md` §5 — khuyến nghị escalate cả 2 root cause thành platform-level fix ưu tiên cao.

---

## 7. Changelog

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-07-02 | 1 | Khởi tạo — báo cáo TEST_EXECUTION đầy đủ cho W03 isolation: 36 TC (28 gốc + 8 case data-mới), 34 PASS/2 FAIL P1. 2 bug mới `BUG-W03-103` (JWT signature bypass cross-tenant) + `BUG-W03-104` (ct-file-storage no tenant ACL) đã file đủ 3-layer, re-verify độc lập lần 2 xác nhận không flaky. Kết luận CONDITIONAL — không release-ready. | agent-test-isolation |
