---
document_id: 'GMS-TC-W{{WAVE_NUMBER}}-{{SUBJECT}}'
type: test-case-template
parent: 'Execution/test-cases/TEST-CASE-REGISTRY.md'
status: ACTIVE
version: 8
boundary: '{{BOUNDARY}}'
wave: 'W{{WAVE_NUMBER}}'
owner: 'QA Authority'
last_reviewed: '{{DATE}}'
---

# Test Case Template - W{{WAVE_NUMBER}}: {{SUBJECT}}

> Template chung cho testcase artifact của Garage.
> `Execution/test-cases/TEST-CASE-REGISTRY.md` là manual QC index + dashboard cho các file `TC-WAVE-*`, do human owner cập nhật.
> `Tracking/TEST-CASE-REGISTRY.md` là pointer/historical summary read-only, không phải write target của AI test agents.
> AI test agents ĐƯỢC dùng template này làm khung chung cho automated testcase artifact, nhưng KHÔNG ghi trực tiếp vào `Execution/test-cases/TC-WAVE-*.md` hay bất kỳ registry nào.

---

## 1. General Info

| Field         | Value                                                      |
| ------------- | ---------------------------------------------------------- |
| Document ID   | `GMS-TC-W{{WAVE_NUMBER}}-{{SUBJECT}}`                      |
| Wave          | W{{WAVE_NUMBER}}                                           |
| Boundary(ies) | `{{BOUNDARY}}`                                             |
| Feature(s)    | `{{FEAT_ID_LIST}}`                                         |
| Owner         | `{{owner}}`                                                |
| Last Reviewed | {{DATE}}                                                   |
| Work Package  | `Execution/work-packages/PKG-W{{WAVE_NUMBER}}-{{slug}}.md` |

---

## 2. Scope

### In Scope

- {{Chức năng / API / UI flow nằm trong scope test}}
- {{Luồng người dùng, rule, integration, hoặc edge case cần cover}}

### Out of Scope

- {{Chức năng thuộc wave khác hoặc boundary khác}}
- {{Chức năng chưa implement trong wave này}}

### Test Environment & Data

| Item                                        | Required Data / Setup       | Notes                           |
| ------------------------------------------- | --------------------------- | ------------------------------- |
| {{Role / account / seed data / dependency}} | {{Cách chuẩn bị}}           | {{Lưu ý khi execute}}           |
| {{Runtime / service / gateway / mock}}      | {{Môi trường cần sẵn sàng}} | {{Local/staging/test env note}} |

---

## 3. Status Summary

> Chỉ cần tóm tắt rất ngắn theo `Automated` và `Manual`.
> Dòng nào không áp dụng thì ghi `N/A`.
> Nếu cần nói rõ hook chạy hay blocker automation, ghi gọn trong `Test Environment & Data` hoặc `Preconditions` của TC liên quan; không tạo thêm section riêng.

| Coverage Mode | Total | Status Summary |
| --- | --- | --- |
| Automated | {{AUTO_TOTAL_OR_NA}} | {{Ví dụ: 14 READY, 27 BLOCKED}} |
| Manual | {{MANUAL_TOTAL_OR_NA}} | {{Ví dụ: 9 PASS, 2 FAIL, 1 BLOCKED}} |

---

## 4. Test Cases

> Với automated testcase artifact, sau `TEST_EXECUTION` mọi TC đã chạy phải đổi `Status` khỏi `READY` sang `PASS` / `FAIL` / `BLOCKED` / `SKIPPED` theo kết quả thực tế.
> Nếu `FAIL`, cột `Bug ID` phải được cập nhật cùng bug đã log trong `Tracking/BUGS.md`. Nếu chưa chạy thì mới được giữ `DRAFT` hoặc `READY`.
> Với manual QC artifact, nếu TC `FAIL` đã được fix và bug chuyển `RESOLVED`, testcase vẫn giữ `FAIL` cho tới khi có re-test xác nhận; chỉ khi bug `VERIFIED/CLOSED` sau re-test pass mới đổi testcase sang `PASS`.

| TC ID     | Feature ID  | Boundary                     | AC Ref                          | Type                                                                      | Suite                                                                | Priority          | Title                                               | Preconditions                                                           | Steps                                           | Expected Result      | Status                                          | Bug ID                                 |
| --------- | ----------- | ---------------------------- | ------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------- | --------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------- | -------------------- | ----------------------------------------------- | -------------------------------------- |
| {{TC-ID}} | {{FEAT-ID}} | {{boundary chính được test}} | {{AC-ID / AC number / AC name}} | API / UI / E2E / Integration / Security / Isolation / Performance / Event | Smoke / Regression / E2E / Wave / Security / Isolation / Performance | P1 / P2 / P3 / P4 | {{Tên test ngắn gọn theo ngôn ngữ người dùng cuối}} | {{Điều kiện trước khi chạy: env, data, role, auth, config, dependency}} | 1. {{Bước 1}}<br>2. {{Bước 2}}<br>3. {{Bước 3}} | - {{Kết quả mong đợi 1}}<br>- {{Kết quả mong đợi 2}} | DRAFT / READY / PASS / FAIL / BLOCKED / SKIPPED | {{BUG-ID nếu FAIL, N/A nếu chưa fail}} |

### 4.1 Ví dụ theo loại test

> Các dòng dưới đây là ví dụ format để agent bám sát khi sinh testcase. Khi tạo file thật, thay ID, feature, boundary, AC và dữ liệu theo wave hiện tại.
> Trong cột `Expected Result`, mỗi ý phải bắt đầu bằng `-`; nếu có nhiều ý thì tách bằng `<br>- ...` trong cùng cell.

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W{{WAVE_NUMBER}}-API-001 | FEAT-{{ID}} | gf-sales | AC-{{ID}} | API | Wave | P1 | API tạo lịch hẹn trả đúng response khi payload hợp lệ | Service `gf-sales` đang chạy; tenant `garage-a` active; token `garage-owner` hợp lệ; header `X-Tenant-Id`/`X-Branch-Id` set | 1. Gửi `POST /api/v3/bookings` với payload hợp lệ (khách hàng + biển số xe + thời gian hẹn).<br>2. Kiểm tra HTTP status.<br>3. Kiểm tra body response và record trong DB tenant. | - HTTP 201 được trả về.<br>- Response có `id`, `code`, `status` = "Lịch hẹn mới" đúng contract.<br>- Booking được ghi với `tenant_id` = `garage-a`. | READY | N/A |
| TC-W{{WAVE_NUMBER}}-E2E-001 | FEAT-{{ID}} | garage-web, agg-sso-graph | AC-{{ID}} | E2E | E2E | P1 | Chủ garage đăng nhập và vào dashboard thành công | `garage-web` và `agg-sso-graph` (`/graphql`) reachable; credential `garage-owner` (Firebase) hợp lệ | 1. Mở `/login`.<br>2. Nhập email/password hợp lệ.<br>3. Submit form đăng nhập.<br>4. Quan sát route và layout sau đăng nhập. | - User được chuyển vào dashboard route được bảo vệ.<br>- Sidebar/topbar theo quyền `garage-owner` render đầy đủ.<br>- Không hiển thị alert lỗi.<br>- Access token không xuất hiện trong `localStorage` (lưu httpOnly/secure cookie). | READY | N/A |
| TC-W{{WAVE_NUMBER}}-UI-001 | FEAT-{{ID}} | garage-web | AC-{{ID}} | UI | Wave | P1 | Form tạo lịch hẹn hiển thị validation khi thiếu biển số xe | Render `BookingForm` trong test setup; i18n dùng tiếng Việt | 1. Render `<BookingForm />`.<br>2. Focus field biển số xe rồi blur không nhập dữ liệu.<br>3. Query error message dưới field biển số xe. | - Error message "Biển số xe là bắt buộc." hiển thị.<br>- Error element có `role="alert"`.<br>- Input biển số xe có `aria-describedby` trỏ tới error element. | READY | N/A |
| TC-W{{WAVE_NUMBER}}-PERF-001 | FEAT-{{ID}} | gf-sales | AC-{{ID}} | Performance | Performance | P2 | Danh sách Service Order đạt ngưỡng p95 dưới tải mục tiêu | Staging có dữ liệu seed 10k service order/tenant; k6 hoặc Artillery configured; tenant `garage-a` active | 1. Chạy load test `GET /api/v3/service-orders?page=0&size=20` với concurrency mục tiêu.<br>2. Ghi nhận p50/p95/p99 và error rate.<br>3. Kiểm tra log service trong thời gian test. | - p95 không vượt ngưỡng trong HLD/work package.<br>- Error rate dưới ngưỡng cho phép.<br>- Không có timeout hàng loạt hoặc exception nghiêm trọng trong log. | READY | N/A |
| TC-W{{WAVE_NUMBER}}-ISO-001 | FEAT-{{ID}} | agg-garage-graph, gf-sales | AC-{{ID}} | Isolation | Isolation | P1 | Garage A không đọc được Service Order của Garage B | Có 2 tenant `garage-a` và `garage-b`; mỗi tenant có service order riêng; token `garage-owner` của `garage-a` hợp lệ | 1. Lấy `serviceOrderId` thuộc tenant `garage-b`.<br>2. Gọi API/BFF detail Service Order bằng token tenant `garage-a` (header `X-Tenant-Id: garage-a`).<br>3. Kiểm tra response và log tenant context. | - Request bị từ chối bằng 404 hoặc 403 theo contract.<br>- Response không leak thông tin Service Order của tenant `garage-b`.<br>- `TenantFilter` giữ tenant context = `garage-a`, không query data tenant `garage-b`. | READY | N/A |
| TC-W{{WAVE_NUMBER}}-SEC-001 | FEAT-{{ID}} | agg-sso-graph | AC-{{ID}} | Security | Security | P1 | Token bị chỉnh sửa signature bị từ chối | Có access token hợp lệ; operation protected qua `agg-sso-graph` available | 1. Login để lấy access token hợp lệ.<br>2. Sửa segment signature của JWT.<br>3. Gọi protected operation với token đã bị sửa. | - Request bị từ chối với HTTP 401 Unauthorized theo contract.<br>- Không trả dữ liệu user.<br>- Không có stack trace hoặc secret trong response. | READY | N/A |

---

## 5. Changelog

| Date     | Change                                              | Author     |
| -------- | --------------------------------------------------- | ---------- |
| {{DATE}} | Created from `Execution/test-cases/TC-TEMPLATE.md`. | {{author}} |
| 2026-05-15 | Rút gọn template: bỏ section hook/handoff riêng, thay bằng `Status Summary` ngắn cho `Automated` và `Manual`; hook/gap chỉ giữ ở setup hoặc từng TC khi thực sự cần. | Codex |
| 2026-05-15 | Mở rộng rule propagation cho cả manual testcase và bug lifecycle: `RESOLVED` chưa tự đổi testcase sang `PASS`; mọi aggregate liên quan phải sync cùng task. | Codex |
| 2026-06-04 | **Convert sang Garage** (đồng bộ với 2 registry đã convert): `document_id` prefix `SV-TC-` → `GMS-TC-` (frontmatter + §1 General Info); §4.1 thay toàn bộ 6 ví dụ từ domain SnapVersify (api-service/platform-ui/auth-client/search/aggregate-tenant, tenant `acme`/`beta`, "video", `sv-*`, `SV-AUTH-401-INVALID_TOKEN`, role "Platform Admin") sang Garage thật: boundary `gf-sales`/`garage-web`/`agg-sso-graph`/`agg-garage-graph`, flow booking/Service Order (`/api/v3/bookings`, `/api/v3/service-orders`), biển số xe, persona `garage-owner`, tenant `garage-a`/`garage-b`, isolation qua `TenantFilter`. Bỏ error code bịa — dùng HTTP 401 chuẩn. | QA Authority |
