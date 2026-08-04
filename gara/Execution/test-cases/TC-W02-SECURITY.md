---
document_id: 'GMS-TC-W02-SECURITY'
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
---

# Test Case: W02 — Security

## 1. Thông tin chung

| Trường | Giá trị |
|---|---|
| Wave | W02 |
| Loại | SECURITY |
| Boundary | gf-accounting · agg-garage-graph · S3 |
| Mục tiêu | Kiểm tra upload validation, signed URL security, authz per persona, JWT validation, SSRF risk |
| Môi trường | staging |
| Automation candidate | false |

## 2. Phạm vi

- **Upload validation:** MIME whitelist, size limit, virus scan
- **Signed URL security:** TTL expiry enforcement, không thể forge URL
- **Authorization:** role-based access per persona (kế toán, chủ garage, tech)
- **JWT validation:** invalid/expired token bị reject
- **SSRF risk:** PDF render service không thực hiện request ra ngoài từ template data
- **Object storage:** retention policy không cho phép delete, SSE-KMS

## 3. Tóm tắt trạng thái

| Trạng thái | Số lượng |
|---|---|
| READY | 12 |
| SKIP | 0 |
| BLOCKED | 0 |
| **Tổng** | **12** |

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W02-SECURITY-001 | FEAT-INS-DOSSIER-CREATE | gf-accounting | PKG §2.2 upload | SECURITY | Wave | P1 | Upload file MIME không trong whitelist bị reject với 400 | 1. Bộ hồ sơ v1 với PENDING doc<br>2. File test: application/x-executable, text/html, application/zip | 1. Upload file .exe (application/x-executable)<br>2. Upload file .html (text/html)<br>3. Upload file .zip (application/zip)<br>4. Kiểm tra response từng lần | - Tất cả 3 đều bị reject với HTTP 400 hoặc 422<br>- Error message nêu rõ MIME không được phép<br>- Chỉ application/pdf, image/jpeg, image/png được chấp nhận<br>- `docStatus` vẫn PENDING | READY | |
| TC-W02-SECURITY-002 | FEAT-INS-DOSSIER-CREATE | gf-accounting | PKG §2.2 upload | SECURITY | Wave | P1 | Upload file giả MIME (content-type giả mạo nhưng magic bytes sai) bị reject | 1. Bộ hồ sơ v1 với PENDING doc<br>2. File .exe đổi tên thành .pdf | 1. Upload file binary (magic bytes EXE) với Content-Type: application/pdf<br>2. Kiểm tra response | - Server phải validate magic bytes (không chỉ dựa vào Content-Type header)<br>- File bị reject với 400/422<br>- Log ghi lại upload attempt | READY | |
| TC-W02-SECURITY-003 | FEAT-INS-DOSSIER-CREATE | gf-accounting, S3 | PKG §2.2 virus scan | SECURITY | Wave | P1 | Upload file eicar test signature → virus scan reject | 1. Virus scan enabled trên staging<br>2. Bộ hồ sơ v1 PENDING | 1. Upload file chứa EICAR test signature (Standard Anti-Virus Test File)<br>2. Kiểm tra response | - File bị reject sau khi scan<br>- `docStatus` không chuyển READY<br>- Error rõ ràng: file bị từ chối bởi virus scan<br>- Không upload lên S3 trước khi scan | READY | |
| TC-W02-SECURITY-004 | FEAT-INS-DOSSIER-VIEW | gf-accounting, S3 | AC-5 | SECURITY | Wave | P1 | Signed URL expired (>300s) → S3 trả 403, không cho download | 1. Signed URL hợp lệ đã sinh<br>2. Đợi > 300s | 1. Lấy signed URL từ `getInsuranceDossierDownloadUrl`<br>2. Đợi 310 giây<br>3. Dùng URL cũ để truy cập S3 trực tiếp | - S3 trả 403 Forbidden (URL expired)<br>- Nội dung file không trả về<br>- Error message: "Request has expired" hoặc tương đương từ S3 | READY | |
| TC-W02-SECURITY-005 | FEAT-INS-DOSSIER-VIEW | S3 | PKG §S3 | SECURITY | Wave | P2 | Không thể forge signed URL bằng cách thay đổi expiry param | 1. Signed URL hợp lệ với X-Amz-Expires=300 | 1. Lấy signed URL<br>2. Thay đổi `X-Amz-Expires` sang 86400 (1 ngày) trong URL<br>3. Thử truy cập S3 với URL đã sửa | - S3 trả 403 Forbidden (signature mismatch)<br>- Forged URL không hoạt động<br>- Signature check detect param tampering | READY | |
| TC-W02-SECURITY-006 | FEAT-INS-DOSSIER-CREATE | gf-accounting | AC-13, BR-INS-DOSSIER | SECURITY | Wave | P1 | Tech support (chưa được phân quyền) bị 403 khi gọi POST /insurance-dossiers | 1. Token của user role "tech-support" (không có quyền BH)<br>2. Phiếu QT BH tồn tại | 1. Dùng token tech-support gọi `POST /api/v1/insurance-dossiers`<br>2. Dùng token tech-support gọi `POST /export`<br>3. Dùng token tech-support gọi `GET /insurance-dossiers` | - Tất cả đều trả 403 Forbidden<br>- Không lộ metadata hồ sơ (tên file, số tiền) trong error response | READY | |
| TC-W02-SECURITY-007 | FEAT-INS-DOSSIER-CREATE | gf-accounting, agg-garage-graph | AC-13 | SECURITY | Wave | P1 | JWT không hợp lệ (tampered/expired) bị reject toàn bộ endpoints | 1. JWT expired (nbf vượt quá)<br>2. JWT tampered (signature sai)<br>3. JWT không có field tenant | 1. Gọi `POST /api/v1/insurance-dossiers` với JWT expired<br>2. Gọi cùng endpoint với JWT tampered<br>3. Gọi với JWT thiếu tenant claim | - Tất cả đều trả 401 Unauthorized<br>- Error không lộ thông tin internal (stack trace, DB schema)<br>- Không xử lý request nào | READY | |
| TC-W02-SECURITY-008 | FEAT-INS-DOSSIER-CREATE | gf-accounting | AC-13 | SECURITY | Wave | P2 | Kế toán và chủ garage được phép, nhân viên kỹ thuật bị block | 1. Token kế toán (role: accountant)<br>2. Token chủ garage (role: owner)<br>3. Token nhân viên kỹ thuật (role: technician) | 1. Thử `POST /api/v1/insurance-dossiers` với từng role<br>2. Thử `POST /export` với từng role<br>3. Thử `GET /insurance-dossiers/{code}` với từng role | - accountant: 2xx trên tất cả endpoints<br>- owner: 2xx trên tất cả endpoints<br>- technician: 403 trên write endpoints (POST); 403 trên GET nếu thiết kế cũng block view | READY | |
| TC-W02-SECURITY-009 | FEAT-INS-DOSSIER-CREATE | gf-accounting | PKG §SSRF risk | SECURITY | Wave | P2 | SSRF: dữ liệu user trong form fill không được dùng để fetch URL ngoài khi render PDF | 1. Bộ hồ sơ v1 PENDING<br>2. Server PDF renderer đang chạy | 1. Điền field "Địa chỉ garage" với giá trị `http://169.254.169.254/latest/meta-data/` (AWS metadata URL)<br>2. Điền field "Tên KH" với `<img src="http://attacker.example.com/beacon">`<br>3. Gọi PUT để update formData<br>4. Gọi POST export để trigger render<br>5. Kiểm tra outbound request log | - PDF renderer không thực hiện bất kỳ HTTP request nào đến metadata URL hay attacker domain<br>- Field URL-like được escape/sanitize trước khi render<br>- PDF vẫn được tạo (render không bị lỗi vì URL được escape) | READY | |
| TC-W02-SECURITY-010 | FEAT-INS-DOSSIER-VIEW | S3 | PKG §S3 retention | SECURITY | Wave | P2 | Object storage: không thể xóa file PDF hồ sơ BH (retention policy 10 năm) | 1. File PDF đã upload lên S3 bucket<br>2. Admin/system credentials | 1. Thử xóa file `{tenant}/insurance-dossiers/{code}/v1/phieu-quyet-toan.pdf` trực tiếp từ S3<br>2. Kiểm tra kết quả | - S3 từ chối delete do Object Lock / Lifecycle retention policy<br>- File vẫn tồn tại sau khi thử xóa<br>- Retention period: 10 năm (hoặc cấu hình tương đương) | READY | |
| TC-W02-SECURITY-011 | FEAT-INS-STL-CREATE | gf-accounting | AC-6, BR-INS-STL-CRE-003 | SECURITY | Wave | P1 | Không thể nhập tay "Tổng tiền BH" — field computed server-side | 1. Token kế toán hợp lệ<br>2. SO có BH | 1. Gọi mutation `CreateSettlement` với body chứa `insuranceTotalAmount: 999999999` (giá trị giả mạo)<br>2. Kiểm tra response và giá trị được lưu | - API ignore giá trị nhập tay cho `insuranceTotalAmount`<br>- Giá trị được lưu = server-side computed (không phải 999999999)<br>- Không có 2xx nào lưu giá trị giả mạo | READY | |
| TC-W02-SECURITY-012 | FEAT-INS-DOSSIER-CREATE | S3 | PKG §S3 SSE-KMS | SECURITY | Wave | P3 | File PDF trên S3 được encrypt bằng SSE-KMS | 1. File PDF đã upload lên S3 | 1. Dùng AWS CLI / SDK để lấy object metadata của file PDF trong S3<br>2. Kiểm tra header `x-amz-server-side-encryption` và `x-amz-server-side-encryption-aws-kms-key-id` | - File được encrypt với SSE-KMS (không phải SSE-S3 hay unencrypted)<br>- KMS key ID thuộc về key được quản lý đúng<br>- GetObject không hoạt động nếu không có KMS permission | READY | |

## 5. Changelog

| Ngày | Version | Thay đổi |
|---|---|---|
| 2026-06-19 | 1 | Khởi tạo — 12 TCs bảo mật: upload MIME/magic bytes/virus, signed URL expiry/forge, authz per persona, JWT validation, SSRF risk, S3 retention + SSE-KMS |
