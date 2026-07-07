# Ma trận đánh giá rủi ro - {{PROJECT}}

> Đánh giá product quality risks để ưu tiên testing theo risk-based testing.

## Kiểm soát tài liệu

- Dự án: {{PROJECT}}
- Release: {{RELEASE}}
- Ngày: {{DATE}}
- Tác giả: {{OWNER}}
- Người phê duyệt: {{APPROVER}}

## Thang điểm risk

### Likelihood

|Điểm|Mức|Mô tả|
|:---:|---|---|
|1|Rất thấp|Hiếm khi xảy ra|
|2|Thấp|Ít khả năng xảy ra|
|3|Trung bình|Có thể xảy ra|
|4|Cao|Có khả năng xảy ra|
|5|Rất cao|Gần như chắc chắn xảy ra|

### Impact

|Điểm|Mức|Mô tả|
|:---:|---|---|
|1|Trivial|Vấn đề thẩm mỹ, có workaround rõ ràng|
|2|Minor|Một nhóm nhỏ user bị ảnh hưởng, có workaround|
|3|Medium|Nhiều user bị ảnh hưởng hoặc workaround khó dùng|
|4|Major|Critical flow bị blocked, business impact đáng kể|
|5|Critical|System down, mất dữ liệu, hoặc liên quan safety/legal|

## Risk matrix

|Risk score|Risk level|Testing priority|Coverage target|
|---:|---|---|---|
|20-25|Critical|P0 - Bắt buộc test|100%|
|13-19|High|P1 - Thiết yếu|100%|
|6-12|Medium|P2 - Quan trọng|80%+|
|1-5|Low|P3 - Test chọn lọc|50%+|

## Product risk register

### Functional risks

|ID|Risk|Area/Feature|Likelihood|Impact|Score|Risk level|Mitigation|
|---|---|---|:---:|:---:|:---:|---|---|
|FR-001|Payment processing thất bại|Thanh toán|3|5|15|High|Integration tests + functional tests mở rộng|
|FR-002|User data không được lưu chính xác|Đăng ký|2|4|8|Medium|Data validation + boundary value tests|
|FR-003|Search trả về kết quả không chính xác|Tìm kiếm|3|3|9|Medium|EP/BVA + relevance checks|
|FR-004|Session hết hạn bất ngờ|Authentication|2|3|6|Medium|Session management tests|

### Non-functional risks

|ID|Risk|Quality attribute|Likelihood|Impact|Score|Risk level|Mitigation|
|---|---|---|:---:|:---:|:---:|---|---|
|NF-001|Page load vượt quá 3 giây|Performance|4|3|12|High|Performance testing + monitoring|
|NF-002|SQL injection vulnerability|Security|2|5|10|Medium|Security scan + penetration testing|
|NF-003|System crash dưới tải cao|Reliability|3|4|12|High|Load testing + stress testing|
|NF-004|Không hỗ trợ screen reader đúng cách|Accessibility|3|3|9|Medium|WCAG compliance testing|

### Integration risks

|ID|Risk|Integration point|Likelihood|Impact|Score|Risk level|Mitigation|
|---|---|---|:---:|:---:|:---:|---|---|
|IR-001|Payment gateway timeout|Payment API|3|4|12|High|Timeout handling + retry tests|
|IR-002|Email delivery failure|Email service|2|3|6|Medium|Delivery verification + fallback handling|
|IR-003|Third-party API contract thay đổi|External API|3|4|12|High|Contract testing + version monitoring|

## Mapping sang test suite tier

|Risk level|Smoke|Sanity|Regression|Full|
|---|:---:|:---:|:---:|:---:|
|Critical|Có|Có|Có|Có|
|High|Có|Có|Có|Có|
|Medium|-|Sample|Có|Có|
|Low|-|-|Sample|Có|

## Phân bổ effort

|Risk level|% effort|Kỹ thuật đề xuất|
|---|:---:|---|
|Critical|40%|Nhiều kỹ thuật test, nhiều vòng review|
|High|30%|Functional tests đầy đủ + NFR liên quan|
|Medium|20%|Coverage tiêu chuẩn, ưu tiên theo impact|
|Low|10%|Basic verification hoặc sample testing|

## Risk monitoring

|Risk ID|Initial score|Current score|Trend|Status|Ghi chú|
|---|:---:|:---:|:---:|---|---|
|FR-001|15|12|Down|Mitigated|Đã thêm tests bổ sung|
|FR-002|8|8|Stable|Open|Đang theo dõi|

## Rủi ro mới trong quá trình testing

|ID|Risk|Source|Likelihood|Impact|Score|Action|
|---|---|---|:---:|:---:|:---:|---|
| | | | | | | |

## Residual risks

|Risk ID|Residual score|Justification|Accepted by|
|---|:---:|---|---|
| | | | |

## Revision history

|Version|Date|Author|Change|
|:---:|---|---|---|
|0.1|{{DATE}}|{{OWNER}}|Đánh giá ban đầu|
