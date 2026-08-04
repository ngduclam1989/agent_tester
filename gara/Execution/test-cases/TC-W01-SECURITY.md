---
document_id: 'GMS-TC-W01-SECURITY'
type: test-case
parent: 'Execution/test-cases/TEST-CASE-REGISTRY.md'
status: ACTIVE
version: 1
boundary: 'gf-sales, gf-accounting, agg-garage-graph, garage-web, garage-mobile'
wave: 'W01'
owner: 'QA Authority'
last_reviewed: '2026-06-11'
---

# Test Case Template - W01: Security

> Split từ `TC-W01-{API,UI}.md` — gom các TC `Suite=Security` (authn/authz/injection/leak/UI permission). KHÔNG cover Isolation (xem `TC-W01-ISOLATION.md`). TC ID giữ nguyên prefix gốc.

---

## 1. General Info

| Field         | Value                                                      |
| ------------- | ---------------------------------------------------------- |
| Document ID   | `GMS-TC-W01-SECURITY`                                      |
| Wave          | W01                                                        |
| Boundary(ies) | `gf-sales`, `gf-accounting`, `agg-garage-graph`, `garage-web`, `garage-mobile` |
| Feature(s)    | `FEAT-INS-SO-ADJUSTMENT`, `FEAT-INS-STL-DETAIL`            |
| Owner         | QA Authority                                               |
| Last Reviewed | 2026-06-11                                                 |
| Work Package  | `Execution/work-packages/PKG-W01-insurance-foundation.md`  |

---

## 2. Scope

### In Scope

- API Authn: token thiếu/expired/signature tampering → 401
- API Authz: role thợ → 403; chủ garage = quyền kế toán
- Injection: SQL injection an toàn
- Leak: response không chứa internal id / PII / stack trace
- UI Permission: role thợ → field readonly hoặc nút Lưu ẩn
- UI URL access control: deep-link bypass quyền → bị chặn
- UI XSS / Mask sensitive
- UI A11y + i18n keyboard-only + tiếng Việt render
- UI State error: 5xx/timeout → thông báo + Thử lại

### Out of Scope

- Tenant isolation — xem `TC-W01-ISOLATION.md`
- API functional contract — xem `TC-W01-API.md`
- Performance SLA — xem `TC-W01-PERFORMANCE.md`

### Test Environment & Data

| Item            | Required Data / Setup                                                       | Notes                                            |
| --------------- | --------------------------------------------------------------------------- | ------------------------------------------------ |
| Token kế toán   | `accountant@garage-a.test`                                                  | Happy path                                       |
| Token chủ garage| `owner@garage-a.test`                                                       | AC-16/AC-10 cross-role                           |
| Token role thợ  | `tech@garage-a.test` / `technician@garage-a.test`                           | 403 / UI disable                                 |
| Token expired   | Token đã hết hạn                                                            | API-AA02                                         |
| Token tampered  | JWT signature bị chỉnh                                                       | API-AA03                                         |
| SO đã lưu allocation | `#SO-W01-BH-001` allocation đầy đủ                                     | Input authz                                       |
| Phiếu QT BH     | `#SET-W01-INS-001`                                                          | Input STL authz                                   |
| Staging env     | gf-sales + gf-accounting + agg-garage-graph + garage-web + mobile running    | —                                                |

---

## 3. Status Summary

| Coverage Mode | Total | Status Summary |
| ------------- | ----- | -------------- |
| Automated     | N/A   | —              |
| Manual        | 23    | 23 READY       |

---

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W01-API-053 | FEAT-INS-SO-ADJUSTMENT | gf-sales, agg-garage-graph | API-AA01, AC-16 | Security | Security | P1 | [Authz] Gọi không có token → 401 | gf-sales running | 1. Gọi `updateServiceOrderV3` không header `Authorization`. | - HTTP 401.<br>- Không trả dữ liệu SO. | READY | N/A |
| TC-W01-API-054 | FEAT-INS-SO-ADJUSTMENT | gf-sales | API-AA02 | Security | Security | P1 | [Authz] Token hết hạn → 401 | gf-sales running; token đã expire | 1. Gọi `updateServiceOrderV3` với token hết hạn. | - HTTP 401.<br>- Không trả dữ liệu SO. | READY | N/A |
| TC-W01-API-055 | FEAT-INS-SO-ADJUSTMENT | gf-sales | API-AA03 | Security | Security | P1 | [Authz] Token bị sửa signature → 401 | Token hợp lệ bị chỉnh segment signature | 1. Gọi `updateServiceOrderV3` với JWT bị sửa signature. | - HTTP 401.<br>- Không trả dữ liệu, không stack trace. | READY | N/A |
| TC-W01-API-056 | FEAT-INS-SO-ADJUSTMENT | gf-sales | API-AA05, AC-16 | Security | Security | P1 | [Authz] Role thợ (không quyền sửa SO) → 403 | Token role thợ `tech@garage-a.test` | 1. Gọi `updateServiceOrderV3` lưu allocation bằng token role thợ. | - HTTP 403.<br>- SO không thay đổi. | READY | N/A |
| TC-W01-API-057 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-16 | Security | Security | P2 | [Authz] Chủ garage có quyền sửa allocation → 200 | Token `owner@garage-a.test` | 1. Gọi `updateServiceOrderV3` lưu allocation bằng token chủ garage. | - HTTP 200.<br>- Allocation persist (cả 2 vai trò đều có quyền — AC-16). | READY | N/A |
| TC-W01-API-061 | FEAT-INS-SO-ADJUSTMENT | gf-sales | API-SC02 | Security | Security | P2 | [Injection] SQL injection trong field text allocation → an toàn | SO DRAFT BH=Có; token kế toán | 1. Gọi `updateServiceOrderV3` với chuỗi `' OR 1=1 --` ở field text (vd ghi chú điều chỉnh nếu có). | - Không 500, không lộ DB error/stacktrace.<br>- Xử lý như text thường, không trả data ngoài quyền. | READY | N/A |
| TC-W01-API-062 | FEAT-INS-SO-ADJUSTMENT | gf-sales | API-RS07 | Security | Security | P2 | [Leak] Response không lộ sensitive data / internal field | SO đã lưu allocation; token kế toán | 1. Query `getServiceOrderByCode` + kiểm tra response. | - Không có field nhạy cảm (internal id, stack trace, giá vốn ngoài quyền) trong response. | READY | N/A |
| TC-W01-API-088 | FEAT-INS-STL-DETAIL | gf-accounting, agg-garage-graph | AC-10, API-AA01 | Security | Security | P1 | [Auth] Gọi getSettlementByCode không có token → 401 | gf-accounting running | 1. Gọi `getSettlementByCode` không có header Authorization. | - HTTP 401.<br>- Không trả data. | READY | N/A |
| TC-W01-API-089 | FEAT-INS-STL-DETAIL | gf-accounting, agg-garage-graph | AC-10, API-AA02 | Security | Security | P1 | [Auth] Token hết hạn → 401 | Token kế toán đã hết hạn | 1. Gọi `getSettlementByCode` với token expired. | - HTTP 401.<br>- Không trả data. | READY | N/A |
| TC-W01-API-090 | FEAT-INS-STL-DETAIL | gf-accounting, agg-garage-graph | AC-10, API-AA03 | Security | Security | P1 | [Auth] Token sửa signature → 401 | Token kế toán hợp lệ | 1. Sửa segment signature của JWT.<br>2. Gọi `getSettlementByCode` với token đã bị sửa. | - HTTP 401.<br>- Không trả data.<br>- Không stack trace trong response. | READY | N/A |
| TC-W01-API-091 | FEAT-INS-STL-DETAIL | gf-accounting, agg-garage-graph | AC-10, API-AA05, UI-PM01 | Security | Security | P1 | [Authz] Role thợ (thấp) gọi getSettlementByCode → 403 | Token `technician@garage-a` (role thấp) | 1. Gọi `getSettlementByCode` với token role thợ. | - HTTP 403.<br>- Không trả data phiếu QT BH. | READY | N/A |
| TC-W01-API-092 | FEAT-INS-STL-DETAIL | gf-accounting, agg-garage-graph | AC-10 | Security | Security | P1 | [Authz] Chủ garage cùng tenant → xem được (quyền tương đương kế toán) | Token `owner@garage-a`; phiếu thuộc garage-a | 1. Gọi `getSettlementByCode` với token chủ garage. | - HTTP 200.<br>- Data phiếu trả về đầy đủ (AC-10). | READY | N/A |
| TC-W01-API-093 | FEAT-INS-STL-DETAIL | gf-accounting, agg-garage-graph | non-negotiables, API-TN01 | Security | Security | P1 | [Tenant] garage-a đọc phiếu của garage-b → 404 (IDOR) | Token garage-a; phiếu `#SET-W01-INS-B` thuộc garage-b | 1. Gọi `getSettlementByCode` mã phiếu garage-b bằng token garage-a. | - HTTP 404 (không lộ tồn tại).<br>- Không trả data phiếu garage-b. | READY | N/A |
| TC-W01-API-094 | FEAT-INS-STL-DETAIL | gf-accounting | API-TN02 | Security | Security | P1 | [Tenant] garage-a huỷ phiếu của garage-b → bị chặn | Token garage-a; phiếu `#SET-W01-INS-B` DRAFT thuộc garage-b | 1. Gọi `cancelSettlement` mã phiếu garage-b bằng token garage-a. | - HTTP 403 hoặc 404.<br>- Phiếu garage-b KHÔNG bị huỷ. | READY | N/A |
| TC-W01-API-095 | FEAT-INS-STL-DETAIL | gf-accounting | API-RS07, API-ER03 | Security | Security | P2 | [Leak] Response không lộ sensitive data / stack trace | Phiếu `#SET-W01-INS-001`; gf-accounting running | 1. Query `getSettlementByCode` happy path.<br>2. Trigger 1 lỗi (mã sai) và đọc body lỗi. | - Response không chứa internal ID/PII ngoài contract.<br>- Lỗi không trả stack trace, chỉ generic message + error code. | READY | N/A |
| TC-W01-UI-090 | FEAT-INS-SO-ADJUSTMENT | garage-web, garage-mobile | UI-PM01, AC-16 | Security | Security | P1 | [Web+Mobile][Permission] Role thợ → section read-only / nút Lưu ẩn | Token role thợ `tech@garage-a.test`; SO Edit | 1. Đăng nhập role thợ, mở SO Edit BH=Có (nếu vào được). | - Field allocation readonly hoặc nút "Lưu" ẩn/disable theo quyền (không sửa được). | READY | N/A |
| TC-W01-UI-092 | FEAT-INS-SO-ADJUSTMENT | garage-web | UI-F05, API-SC01 | Security | Security | P2 | [Web][XSS] Nhập `<script>` vào field text → escape, không execute | garage-web; SO Edit field text (ghi chú điều chỉnh nếu có) | 1. Nhập `<script>alert(1)</script>` vào field text.<br>2. Lưu + xem lại Detail. | - Hiển thị nguyên văn (escape), KHÔNG execute script.<br>- Không crash. | READY | N/A |
| TC-W01-UI-093 | FEAT-INS-SO-ADJUSTMENT | garage-web | UI-PM07 | Security | Security | P2 | [Web][Mask] Không lộ field nhạy cảm (giá vốn) với role không xem | garage-web; role không quyền xem giá vốn; SO Edit | 1. Mở SO Edit, kiểm tra panel + DOM. | - Field giá vốn (nếu có) bị ẩn/mask, không có trong DOM. | READY | N/A |
| TC-W01-UI-142 | FEAT-INS-STL-DETAIL | garage-web | AC-10, UI-PM01 | Security | Security | P1 | [Web][Authz] Role thợ — nút huỷ/sửa ẩn hoặc disable | garage-web; token `technician@garage-a` | 1. Mở chi tiết phiếu QT BH bằng tài khoản thợ. | - Nút huỷ/sửa ẩn hoặc disabled theo quyền.<br>- Không thực hiện được hành động ghi. | READY | N/A |
| TC-W01-UI-143 | FEAT-INS-STL-DETAIL | garage-web | AC-10, UI-PM02, UI-N06 | Security | Security | P1 | [Web][Authz] Truy cập URL phiếu QT BH khi không đủ quyền → chặn | garage-web; tài khoản role thấp không có quyền | 1. Mở URL trực tiếp trang chi tiết phiếu QT BH. | - Bị chặn (redirect/403 page).<br>- Không hiển thị data phiếu. | READY | N/A |
| TC-W01-UI-144 | FEAT-INS-STL-DETAIL | garage-web | UI-PM04 | Security | Security | P1 | [Web][Tenant] garage-a không xem được phiếu của garage-b qua UI | garage-web; token garage-a; phiếu thuộc garage-b | 1. Mở URL phiếu QT BH của garage-b bằng phiên garage-a. | - Bị chặn (404/403 page).<br>- Không lộ data phiếu garage-b. | READY | N/A |
| TC-W01-UI-145 | FEAT-INS-STL-DETAIL | garage-web | UI-ST03, UI-ST04 | Security | Security | P2 | [Web][State] Lỗi tải phiếu (5xx/timeout) → thông báo + Thử lại | garage-web; server mock 500 khi load detail | 1. Mở trang chi tiết khi server trả lỗi.<br>2. Bấm "Thử lại" khi server phục hồi. | - Thông báo lỗi + nút "Thử lại", không màn trắng.<br>- Retry thành công → vào data state. | READY | N/A |
| TC-W01-UI-146 | FEAT-INS-STL-DETAIL | garage-web | UI-A01, UI-A06 | Security | Security | P2 | [Web][A11y] Keyboard-only + tiếng Việt render đúng | garage-web; phiếu `#SET-W01-INS-001` | 1. Thao tác tab/switch tab + huỷ bằng bàn phím (Tab/Enter/Esc).<br>2. Kiểm tra text tiếng Việt. | - Mọi action reachable qua keyboard, dialog huỷ có focus trap.<br>- Tiếng Việt có dấu render đúng, không `U+FFFD`. | READY | N/A |

---

## 5. Changelog

| Date     | Change                                              | Author     |
| -------- | --------------------------------------------------- | ---------- |
| 2026-06-11 | Split từ `TC-W01-{API,UI}.md` — extract 23 TC Suite=Security: TC-W01-API-053..057 (5), TC-W01-API-061..062 (2), TC-W01-API-088..095 (8), TC-W01-UI-090 + 092..093 (3), TC-W01-UI-142..146 (5). TC ID + nội dung row giữ nguyên (không renumber). | QA Authority |
