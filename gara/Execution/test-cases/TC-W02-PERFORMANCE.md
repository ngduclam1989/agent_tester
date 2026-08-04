---
document_id: 'GMS-TC-W02-PERFORMANCE'
type: test-case
wave: 'W02'
phase: 'B'
boundary: 'gf-accounting, S3 (gms-insurance-dossier-{env})'
features:
  - FEAT-INS-DOSSIER-CREATE
  - FEAT-INS-DOSSIER-VIEW
status: ACTIVE
version: 1
owner: 'QA Authority'
last_reviewed: '2026-06-19'
figma_available: 'NO'
automation_candidate: false
note: >
  SLA targets từ PKG-W02-insurance-dossier.md:
  - PDF gen 4 tài liệu p95 < 5s
  - Concurrent 5 export no DB contention
  - S3 upload p99 < 2s
---

# Test Case: W02 — Performance

## 1. Thông tin chung

| Trường | Giá trị |
|---|---|
| Wave | W02 |
| Loại | PERFORMANCE |
| Boundary | gf-accounting · S3 bucket `gms-insurance-dossier-{env}` |
| SLA Ref | PKG-W02-insurance-dossier.md §SLA |
| Môi trường | staging — phải representative để đo SLA (không đo trên localhost) |
| Tool đo | k6 / JMeter / custom test script |
| Automation candidate | false |

## 2. SLA Targets

| Target | Ngưỡng | Đo lường |
|---|---|---|
| PDF generation 4 tài liệu | p95 < 5s | Từ lúc gọi `POST /export` đến khi response 200 trả về |
| Concurrent 5 export | Không có DB contention (deadlock / lock wait timeout) | 5 request export đồng thời cho 5 phiếu QT BH khác nhau |
| S3 upload 1 file PDF | p99 < 2s | Từ lúc bắt đầu upload đến khi S3 confirm |

## 3. Tóm tắt trạng thái

| Trạng thái | Số lượng |
|---|---|
| READY | 6 |
| SKIP | 0 |
| BLOCKED | 0 |
| **Tổng** | **6** |

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W02-PERFORMANCE-001 | FEAT-INS-DOSSIER-CREATE | gf-accounting | PKG §SLA | PERFORMANCE | Wave | P1 | PDF generation 4 tài liệu p95 < 5 giây | 1. Staging environment ổn định (không load test đang chạy song song)<br>2. Bộ hồ sơ v1 với 4 tài liệu READY (gồm 2 FORM_FILL đã điền đủ)<br>3. Test script k6/JMeter đã chuẩn bị | 1. Chạy 20 lần `POST /api/v1/insurance-dossiers/{dossierId}/export` với 4 documentTypes<br>2. Đo response time từng lần (end-to-end từ request đến response 200)<br>3. Tính p95 từ 20 samples | - p95 response time ≤ 5000ms<br>- Không có request nào timeout (> 30s)<br>- `dossierStatus = EXPORTED` sau mỗi request<br>- Ghi kết quả vào test report | READY | |
| TC-W02-PERFORMANCE-002 | FEAT-INS-DOSSIER-CREATE | gf-accounting | PKG §SLA | PERFORMANCE | Wave | P1 | Concurrent 5 export cho 5 phiếu QT BH khác nhau — không có DB contention | 1. 5 bộ hồ sơ khác nhau (5 phiếu QT BH), mỗi bộ READY<br>2. 5 token user hợp lệ (có thể cùng user) | 1. Gửi đồng thời 5 request `POST /export` cho 5 dossierId khác nhau<br>2. Đo thời gian từng request<br>3. Kiểm tra DB log không có deadlock hoặc lock wait timeout | - Cả 5 request trả 200 thành công<br>- Không có 409 Conflict (5 phiếu QT khác nhau, không phải concurrent trên cùng 1 phiếu)<br>- Không có deadlock trong DB log<br>- Lock wait timeout không xuất hiện<br>- p95 của 5 request ≤ 8s (SLA relaxed cho concurrent) | READY | |
| TC-W02-PERFORMANCE-003 | FEAT-INS-DOSSIER-CREATE | S3 (gms-insurance-dossier-{env}) | PKG §SLA | PERFORMANCE | Wave | P1 | S3 upload 1 file PDF p99 < 2 giây | 1. Staging S3 bucket khả dụng<br>2. File PDF test 500KB (representative size)<br>3. Script đo upload time | 1. Thực hiện 100 lần upload file PDF 500KB lên S3 bucket (prefix `{tenant}/insurance-dossiers/test/v1/`)<br>2. Đo thời gian từng upload<br>3. Tính p99 | - p99 upload time ≤ 2000ms<br>- Tất cả 100 upload thành công (không có 5xx từ S3)<br>- SSE-KMS encryption không làm chậm quá ngưỡng | READY | |
| TC-W02-PERFORMANCE-004 | FEAT-INS-DOSSIER-CREATE | gf-accounting | PKG §SLA | PERFORMANCE | Wave | P2 | Baseline: PDF generation 2 tài liệu (auto-render only) p95 < 3 giây | 1. Bộ hồ sơ với 2 tài liệu auto-render READY (Phiếu QT + Phiếu báo giá) | 1. Chạy 20 lần `POST export` với chỉ 2 documentTypes auto-render<br>2. Đo response time | - p95 ≤ 3000ms cho 2 tài liệu auto-render<br>- Là baseline so sánh với 4 tài liệu<br>- Scale tuyến tính (2 tài liệu ≈ 50% thời gian 4 tài liệu) | READY | |
| TC-W02-PERFORMANCE-005 | FEAT-INS-DOSSIER-VIEW | gf-accounting, S3 | AC-5, signed URL TTL | PERFORMANCE | Wave | P2 | GetInsuranceDossierDownloadUrl latency p95 < 500ms | 1. Bộ hồ sơ đã EXPORTED với 4 PDF<br>2. 4 docId có sẵn | 1. Chạy 50 lần `GET /api/v1/insurance-dossiers/documents/{docId}/download`<br>2. Đo response time từng lần (bao gồm generate signed URL) | - p95 ≤ 500ms<br>- Signed URL trong response hợp lệ (có thể truy cập S3)<br>- TTL đúng 300s | READY | |
| TC-W02-PERFORMANCE-006 | FEAT-INS-DOSSIER-CREATE | gf-accounting | PKG §SLA | PERFORMANCE | Wave | P2 | Concurrent 10 request tạo hồ sơ mới (POST /insurance-dossiers) — không có bottleneck | 1. 10 phiếu QT BH khác nhau<br>2. 10 token user hoặc cùng 1 user | 1. Gửi đồng thời 10 `POST /api/v1/insurance-dossiers` cho 10 settlementCode khác nhau<br>2. Đo số lượng 201 vs lỗi<br>3. Đo response time | - ≥ 9/10 request trả 201 thành công trong 5s<br>- Không có 500 hay timeout<br>- DB không có N+1 query rõ ràng | READY | |

## 5. Changelog

| Ngày | Version | Thay đổi |
|---|---|---|
| 2026-06-19 | 1 | Khởi tạo — 6 TCs performance theo SLA targets từ PKG-W02-insurance-dossier.md: PDF gen p95 < 5s, concurrent 5 export, S3 upload p99 < 2s |
