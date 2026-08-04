---
document_id: 'GMS-TC-W02-ISOLATION'
type: test-case
wave: 'W02'
phase: 'A+B'
boundary: 'gf-accounting, agg-garage-graph, S3 (gms-insurance-dossier-{env})'
features:
  - FEAT-INS-DOSSIER-CREATE
  - FEAT-INS-DOSSIER-VIEW
  - FEAT-INS-STL-CREATE
status: ACTIVE
version: 1
owner: 'QA Authority'
last_reviewed: '2026-06-19'
figma_available: 'NO'
automation_candidate: false
note: >
  Tenant isolation TCs — không tìm thấy coverage isolation trong TC-W02-API.md (52 TCs).
  Đây là TCs mới bổ sung với ID riêng (TC-W02-ISOLATION-NNN).
---

# Test Case: W02 — Tenant Isolation

## 1. Thông tin chung

| Trường | Giá trị |
|---|---|
| Wave | W02 |
| Loại | ISOLATION |
| Boundary | gf-accounting · agg-garage-graph · S3 bucket `gms-insurance-dossier-{env}` |
| Mục tiêu | Kiểm tra dữ liệu hồ sơ BH và phân bổ BH không bị lộ cross-tenant |
| Cấu trúc tenant | S3 key: `{tenant}/insurance-dossiers/{settlementCode}/v{N}/{filename}` |
| Môi trường | staging — 2 tenant riêng biệt: `tenant-a` + `tenant-b` |
| Automation candidate | false |

## 2. Phạm vi

- Tenant A không đọc được hồ sơ BH của Tenant B (gf-accounting API)
- Tenant A không đọc được S3 file của Tenant B (S3 key prefix isolation)
- Signed URL cross-tenant: URL tenant A không dùng được bởi tenant B
- GraphQL: agg-garage-graph không trả dữ liệu BH cross-tenant
- Panel phân bổ: user tenant A không thấy data BH tenant B

## 3. Tóm tắt trạng thái

| Trạng thái | Số lượng |
|---|---|
| READY | 7 |
| SKIP | 0 |
| BLOCKED | 0 |
| **Tổng** | **7** |

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W02-ISOLATION-001 | FEAT-INS-DOSSIER-VIEW | gf-accounting | BR-INS-DOSSIER-VIEW-001 | ISOLATION | Wave | P1 | Tenant A không đọc được hồ sơ BH của Tenant B qua gf-accounting API | 1. `tenant-a` có bộ hồ sơ BH `DOSSIER-A-001`<br>2. `tenant-b` có token hợp lệ | 1. Dùng token `tenant-b` gọi `GET /api/v1/insurance-dossiers/DOSSIER-A-001`<br>2. Kiểm tra HTTP status | - HTTP 403 Forbidden hoặc 404 Not Found<br>- Response không trả bất kỳ dữ liệu nào của tenant-a<br>- Error message không lộ thông tin nội bộ | READY | |
| TC-W02-ISOLATION-002 | FEAT-INS-DOSSIER-VIEW | gf-accounting | BR-INS-DOSSIER-VIEW-001 | ISOLATION | Wave | P1 | Tenant B không liệt kê được hồ sơ BH của Tenant A | 1. `tenant-a` có nhiều bộ hồ sơ<br>2. `tenant-b` có token hợp lệ | 1. Dùng token `tenant-b` gọi `GET /api/v1/insurance-dossiers?tenantId=tenant-a`<br>2. Dùng token `tenant-b` gọi `GET /api/v1/insurance-dossiers` (không filter) | - Cả 2 request không trả bộ hồ sơ của `tenant-a`<br>- Response trả list rỗng hoặc chỉ list của `tenant-b` | READY | |
| TC-W02-ISOLATION-003 | FEAT-INS-DOSSIER-VIEW | S3 (gms-insurance-dossier-{env}) | PKG §S3 | ISOLATION | Wave | P1 | S3 key prefix isolation — file tenant-a không thể đọc bằng credential tenant-b | 1. File S3: `tenant-a/insurance-dossiers/SET-A-001/v1/phieu-quyet-toan.pdf` tồn tại<br>2. Credential hoặc role của `tenant-b` | 1. Thử truy cập S3 object `tenant-a/insurance-dossiers/...` bằng credentials của `tenant-b`<br>2. Kiểm tra response từ S3 | - S3 trả 403 Access Denied<br>- Tenant-b không có permission đọc prefix `tenant-a/`<br>- IAM bucket policy phân tách đúng prefix | READY | |
| TC-W02-ISOLATION-004 | FEAT-INS-DOSSIER-VIEW | gf-accounting, S3 | AC-5 (View) | ISOLATION | Wave | P1 | Signed URL của tenant-a không dùng được bởi tenant-b | 1. `tenant-a` có signed URL hợp lệ của file PDF<br>2. `tenant-b` thử dùng URL đó | 1. Lấy signed URL cho file PDF của `tenant-a` (thông qua getInsuranceDossierDownloadUrl với token tenant-a)<br>2. Dùng signed URL đó từ browser hoặc curl không có token<br>3. Kiểm tra xem URL có phân tách theo tenant không | - Signed URL chứa tenant prefix trong S3 path<br>- URL hợp lệ cho người dùng biết URL (không có thêm auth check — đây là S3 presigned URL)<br>- [NOTE] Nếu cần auth thêm: ghi lại gap nếu URL không có tenant check | READY | |
| TC-W02-ISOLATION-005 | FEAT-INS-DOSSIER-CREATE | agg-garage-graph | PKG §2.2 | ISOLATION | Wave | P1 | GraphQL: Tenant B không tạo được hồ sơ cho settlementCode của Tenant A | 1. SettlementCode `SET-A-001` thuộc `tenant-a`<br>2. Token GraphQL `tenant-b` hợp lệ | 1. Dùng token `tenant-b` gọi `mutation { createInsuranceDossier(input: {settlementCode: "SET-A-001"}) {...} }` | - HTTP 403 hoặc GraphQL error `UNAUTHORIZED`<br>- Hồ sơ của `tenant-a` không bị tạo mới bởi `tenant-b`<br>- agg-garage-graph validate tenant từ JWT | READY | |
| TC-W02-ISOLATION-006 | FEAT-INS-STL-CREATE | agg-garage-graph | AC-1 | ISOLATION | Wave | P1 | GraphQL: Panel phân bổ BH chỉ trả data của đúng tenant hiện tại | 1. `tenant-a` và `tenant-b` đều có SO có BH<br>2. Token `tenant-a` đang test | 1. Dùng token `tenant-a` gọi `PrepareCreateSettlement` cho SO của `tenant-a`<br>2. Kiểm tra response không chứa data của `tenant-b` | - Response chỉ trả insuranceAdjustment của SO thuộc `tenant-a`<br>- Không có data lọt từ `tenant-b` | READY | |
| TC-W02-ISOLATION-007 | FEAT-INS-DOSSIER-CREATE | gf-accounting | EC-2, BR-INS-DOSSIER-005 | ISOLATION | Wave | P2 | Optimistic lock không bị ảnh hưởng bởi concurrent request cross-tenant | 1. `tenant-a` và `tenant-b` đều có hồ sơ riêng với dossierId khác nhau<br>2. 2 tenant gửi export đồng thời cho hồ sơ của mình | 1. `tenant-a` và `tenant-b` cùng gửi `POST export` cho hồ sơ riêng của mình<br>2. Kiểm tra kết quả | - Cả 2 export thành công độc lập<br>- Lock của `tenant-a` không ảnh hưởng `tenant-b`<br>- Không có 409 cross-tenant | READY | |

## 5. Changelog

| Ngày | Version | Thay đổi |
|---|---|---|
| 2026-06-19 | 1 | Khởi tạo — 7 TCs tenant isolation cho W02: gf-accounting API, S3 key prefix, GraphQL cross-tenant |
