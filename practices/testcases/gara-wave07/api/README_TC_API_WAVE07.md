# TC API — Gara Wave 7 (PKG-W07: Partner Link + Booking relay + Document sync Driver Plus)

> Rollup index cho toàn bộ Manual Test Case API (schema 19 cột, sinh theo skill `api_test_design`, phương pháp 4-phase ISTQB). Bàn giao chính thức là các cặp `.md` + `.xlsx` liệt kê dưới đây — file `.tsv` trung gian đã được xoá sau mỗi lần convert.

## 1. Tổng quan phạm vi

Toàn bộ API-only scope của PKG-W07 (không bao gồm UI Web/Mobile, không bao gồm BFF GraphQL passthrough theo xác nhận của user). 4 sub-module theo đúng ranh giới đã chốt ở Bước 3-4 (FULL RBT):

| Sub-module | Boundary | Bề mặt API | File | Tổng TC |
|---|---|---|---|---|
| M1 — Partner Link (REST) | `gf-system` | 6 REST endpoint | `TC_PARTNERLINK_API.md` / `.xlsx` | 179 |
| M1 — Partner Link (Kafka) | `gf-system` | 6 MessageStep (3 inbound + 3 outbound) | `TC_PARTNERLINK_KAFKA_API.md` / `.xlsx` | 85 |
| M2 — Booking Inbound | `gf-sales` | 2 MessageStep (BOOKING.CREATE.REQUEST, BOOKING.CANCELLED) | `TC_BOOKINGINBOUND_API.md` / `.xlsx` | 42 |
| M3 — Booking Outbound + regression | `gf-sales` | BOOKING.CHANGE.STATUS + BOOKING.UPDATE.RESPONSE (FEAT-BOOK-EDIT AC-15) | `TC_BOOKINGOUTBOUND_API.md` / `.xlsx` | 38 |
| M4 — Document Sync | `gf-sales` + `gf-accounting` | DOCUMENT.SERVICE_ORDER.SYNC, DOCUMENT.SETTLEMENT.SYNC + REST `for-settlement` additive | `TC_DOCUMENTSYNC_API.md` / `.xlsx` | 47 |
| **Tổng** | | | | **391** |

Test Design (Markmap) chi tiết cho batch đầu tiên (M1 REST) được giữ lại làm tài liệu tham chiếu tại `_TD_PARTNERLINK_REST_batch1.md`. Các batch sau (M1 Kafka, M2, M3, M4) áp dụng cùng phương pháp 4-phase nhưng không lưu file Markmap trung gian riêng (theo yêu cầu tăng tốc độ của user) — Node Registry coverage vẫn được audit thủ công trước khi sinh TC (đối chiếu số node kỳ vọng ↔ số TC thực sinh cho từng nhóm C1-C4).

## 2. Đã áp dụng nhất quán trên toàn bộ 391 TC

- **Oracle đã chốt (Q1-Q12 + 10 assumption mức Trung bình/Thấp)** từ Bước 2 FULL RBT — không hỏi lại, áp dụng trực tiếp làm giá trị kỳ vọng (vd `ERR-DPL-013` dùng chung cho cả 2 case resolve tenant thất bại, kill-switch check thứ tự sau resolve, không sanitize `reason` ở tầng API...).
- **Coverage 100%** theo Node Registry nội bộ mỗi cấu phần — self-audit số TC sinh ra khớp số Test Condition dự kiến trước khi convert.
- **Quy tắc Verify DB**: chỉ verify ghi DB cho Happy Path/positive case trên write API; negative case (4xx hoặc outcome=skipped/rejected) không verify DB.
- **`[PENDING_DOC]`** dùng cho mọi hành vi chưa được tài liệu nguồn đặc tả rõ (không tự bịa mã lỗi/field).
- **`[ASSUMPTION]`** dùng cho giả định đã có căn cứ nhưng cần xác nhận thêm từ Backend Lead/Business Authority/Solution Architect (trích rõ Q# hoặc RR-# gốc trong Test Case Summary để truy vết).

## 3. Danh sách điểm cần theo dõi/xác nhận thêm (tổng hợp từ toàn bộ 391 TC)

| Mã | Chủ đề | Ảnh hưởng | Sub-module |
|---|---|---|---|
| [PENDING_DOC] role sai (không phải garage-owner/accountant) | Chưa có mã lỗi HTTP riêng cho case role không đủ quyền, khác AUTH_403 | M1 REST (6 TC) |
| [PENDING_DOC] hành vi Missing field payload Kafka (không phải 5-6 field bắt buộc adapter gate) | Nhiều field Kafka Missing/Type chưa có hành vi consumer rõ ràng | M1 Kafka, M2 (nhiều TC) |
| Q6/RR-025 [ASSUMPTION] | Payload `BOOKING.UPDATE.RESPONSE` chỉ có id/code, KHÔNG mang nội dung đã sửa | M3 (3 TC) |
| Q7/RR-034 [ASSUMPTION] | Giá trị enum `LeadSource` thật = `DRIVER_PLUS`, cần Backend Lead xác nhận từ source code | M3 (2 TC) |
| Q8/RR-033 [ASSUMPTION] | Booking D+ chưa có `service_type` vẫn bị bắt buộc chọn khi Edit dù chỉ sửa trường không liên quan | M3 (1 TC) |
| Q9/RR-035 + RR-040 [ASSUMPTION] | Ngưỡng NO_SHOW_AUTO = 30 phút (`BOOKING_NO_SHOW_DELAY`); Edit giờ hẹn không validate bước 15 phút | M3 (2 TC) |
| Q11/RR-043 [ASSUMPTION] | `eventId` trùng khi tái sử dụng mã phiếu QT sau hủy (known limitation, không phải bug) | M4 (1 TC) |
| Q12 [ASSUMPTION] | Kill-switch `Document:DriverPlus` chỉ chặn ghi mới, không chặn outbox row đã PENDING | M4 (2 TC) |
| Q10/RR-041 | Enum `DocumentMessageStep` tại `gf-accounting-api.md` §6.5 còn thừa `SERVICE_ORDER.REVOKED` — TC dùng đúng 2 giá trị theo `gf-sales-api.md` | M4 (2 TC) |

**Khuyến nghị**: review 391 TC theo file, ưu tiên rà soát các dòng có nhãn `[PENDING_DOC]`/`[ASSUMPTION]` trong cột Test Case Summary trước khi giao cho automation, vì đây là những chỗ oracle chưa 100% chắc chắn từ tài liệu nguồn.

## 4. Không có script `validate_tc.py` áp dụng được cho schema này

`scripts/validate_testcases/validate_tc.py` được thiết kế cho schema TC UI 9-cột (skill `rbt_manual_testing`), không tương thích với schema API 19-cột. Validate cho batch API này được thực hiện thủ công qua kiểm tra: đúng 18 tab/dòng (19 cột), không trùng Test Case ID, số TC khớp Node Registry dự kiến — đã chạy cho cả 5 file trước khi convert.
