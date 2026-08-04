---
type: persona
artifact_kind: persona
status: ACTIVE
version: 2
tier: T1
owner_authority: Business Authority
last_reviewed: "2026-05-27"
---

# Persona — garage-owner

## Metadata

| Field | Value |
|---|---|
| Persona ID | `garage-owner` |
| Display name | Chủ garage |
| Type | PRIMARY |
| Status | ACTIVE |

## 1. Role & Demographics

**Role / title**: Chủ garage — quản lý toàn bộ hoạt động garage ô tô

**Typical context**: Quản lý garage ô tô tại Việt Nam, sử dụng hệ thống hàng ngày để theo dõi lịch hẹn, phiếu dịch vụ, mua hàng, tồn kho, khách hàng và marketing. Có thể trực tiếp tại garage hoặc quản lý từ xa qua App Garage.

**Demographics**:
- **Experience level**: INTERMEDIATE
- **Tech comfort**: MEDIUM
- **Language / locale**: vi-VN

## 2. Goals

- Quản lý toàn bộ hoạt động garage trên một hệ thống duy nhất — từ tiếp nhận xe đến quyết toán
- Theo dõi tình trạng lịch hẹn, phiếu dịch vụ, đơn hàng mua theo thời gian thực
- Quản lý khách hàng, xe và lịch sử dịch vụ để nâng cao chất lượng phục vụ
- Kiểm soát tài chính: quyết toán, công nợ, doanh thu hàng ngày
- Quản lý tồn kho, mua hàng và nhà cung cấp hiệu quả
- Quản lý nhân sự, phân quyền cho nhân viên
- Chạy chiến dịch marketing, chương trình ưu đãi để thu hút và giữ chân khách hàng
- Xem tổng quan hoạt động (dashboard) để ra quyết định kịp thời
- **Kiểm soát doanh thu sửa chữa bảo hiểm và mức chiết khấu liên kết với từng doanh nghiệp bảo hiểm**
- **Theo dõi công nợ phải thu từ doanh nghiệp bảo hiểm (tổng phải thu, đã thu trong kỳ) qua widget công nợ BH trên Dashboard**
- **Nắm bắt tình trạng hồ sơ bảo hiểm: hồ sơ đã xuất PDF, hồ sơ chờ bổ sung, hồ sơ chờ BH thanh toán**

## 3. Pain Points

- Quản lý hoạt động trên nhiều kênh (sổ sách, Excel, app khác nhau) gây phân tán dữ liệu — frequency: DAILY, severity: HIGH
- Khó theo dõi trạng thái phiếu dịch vụ và đơn hàng mua khi vắng mặt tại garage — frequency: DAILY, severity: HIGH
- Thiếu dữ liệu khách hàng và lịch sử dịch vụ khi tư vấn khách quay lại — frequency: DAILY, severity: MED
- Đối soát tồn kho, nhập/xuất kho thủ công dễ sai sót — frequency: WEEKLY, severity: HIGH
- Quản lý nhà cung cấp và mua hàng thủ công, khó so sánh giá và theo dõi đơn hàng — frequency: WEEKLY, severity: MED
- **Không kiểm soát được dòng tiền từ bảo hiểm: không rõ tổng công nợ BH, hồ sơ nào đang chờ, doanh nghiệp BH nào trả chậm** — frequency: WEEKLY, severity: HIGH
- **Không nắm được phần chiết khấu liên kết đã áp dụng cho từng ca sửa chữa bảo hiểm, khó đánh giá lợi nhuận thật từ ca BH** — frequency: WEEKLY, severity: MED
- **Khi khách hàng phàn nàn về số tiền họ phải tự chi trả thêm sau quyết toán BH (khấu hao, khấu trừ, giảm trừ bồi thường), không có nguồn dữ liệu chuẩn để giải thích** — frequency: WEEKLY, severity: MED

## 4. Jobs-to-be-done (JTBD)

- **JTBD-1**: Khi có khách đặt lịch qua Driver+, tôi muốn nhận và xác nhận lịch hẹn nhanh chóng, để có thể chuẩn bị nhân lực và vật tư trước khi khách đến.
- **JTBD-2**: Khi khách mang xe đến sửa chữa, tôi muốn tạo phiếu dịch vụ và theo dõi tiến độ, để có thể thông báo cho khách và thu phí chính xác.
- **JTBD-3**: Khi cần mua phụ tùng, tôi muốn tạo yêu cầu báo giá và đặt hàng từ nhà cung cấp, để có thể so sánh giá và đặt hàng nhanh.
- **JTBD-4**: Khi muốn bán lẻ phụ tùng cho khách vãng lai, tôi muốn tạo phiếu bán hàng nhanh chóng, để có thể ghi nhận doanh thu và xuất kho chính xác.
- **JTBD-5**: Khi cuối ngày, tôi muốn xem tổng quan doanh thu và công việc, để có thể đánh giá hoạt động và lên kế hoạch ngày tiếp theo.
- **JTBD-6**: Khi xem Dashboard, tôi muốn thấy ngay widget công nợ bảo hiểm (Tổng phải thu BH, Đã thu trong kỳ, lịch sử thanh toán BH theo phiếu QT), để biết garage đang bị BH chiếm dụng vốn bao nhiêu và quyết định khi nào cần thúc giục thanh toán.
- **JTBD-7**: Khi review phiếu quyết toán bảo hiểm do kế toán lập, tôi muốn xem chi tiết bảng phân bổ BH (Tổng chi phí thuộc BH, các khoản điều chỉnh BH, Bảo hiểm thanh toán, KH chịu từ điều chỉnh BH), để xác nhận con số trước khi kế toán xuất hồ sơ gửi doanh nghiệp bảo hiểm.
- **JTBD-8**: Khi khách hàng thắc mắc về khoản tiền họ phải tự chi trả thêm cho ca có bảo hiểm, tôi muốn tra cứu nhanh Phiếu quyết toán BH liên kết để giải thích từng khoản điều chỉnh (khấu hao vật tư, khấu trừ BH, giảm trừ bồi thường) một cách minh bạch.

## 5. Access Context

| Aspect | Value |
|---|---|
| Device | BOTH (Web GMS trên desktop, App Garage trên mobile) |
| Environment | FIELD (tại garage, di chuyển trong khu vực làm việc) |
| Network | STABLE |
| Permissions / auth level | Toàn quyền — tất cả chức năng trong hệ thống |
| Accessibility needs | NONE |

## 6. Change Log

| Date | Summary | Author |
|---|---|---|
| 2026-05-20 | Khởi tạo persona từ _RULES.md §10 + KG garage-web | Business Authority |
| 2026-05-27 | Bổ sung trách nhiệm giám sát liên quan `EP-INSURANCE-SETTLEMENT` (PRD v5): thêm 3 Goals (kiểm soát doanh thu BH & chiết khấu liên kết, theo dõi công nợ BH qua dashboard, nắm tình trạng hồ sơ BH), thêm 3 Pain Points (không kiểm soát dòng tiền BH, không nắm chiết khấu liên kết, khó giải thích khoản KH chịu từ điều chỉnh BH), thêm JTBD-6..8 (xem widget công nợ BH trên dashboard, review phiếu QT BH trước khi xuất hồ sơ, giải thích cho KH các khoản điều chỉnh BH). Không thay đổi quyền hạn / phân quyền hiện hành (Critical Rule #6 — dual persona only). | Business Authority |
