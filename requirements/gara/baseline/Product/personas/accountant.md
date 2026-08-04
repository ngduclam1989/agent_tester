---
type: persona
artifact_kind: persona
status: ACTIVE
version: 3
tier: T1
owner_authority: Business Authority
last_reviewed: "2026-06-11"
---

# Persona — accountant

## Metadata

| Field | Value |
|---|---|
| Persona ID | `accountant` |
| Display name | Kế toán |
| Type | PRIMARY |
| Status | ACTIVE |

## 1. Role & Demographics

**Role / title**: Kế toán — quản lý tài chính, theo dõi công nợ, đối soát thanh toán, nhập liệu chứng từ

**Typical context**: Làm việc tại văn phòng garage, sử dụng Web GMS chủ yếu trên máy tính. Chịu trách nhiệm quyết toán (khách hàng và bảo hiểm), đối soát thanh toán nhà cung cấp, kiểm tra tồn kho theo kỳ, làm hồ sơ gửi doanh nghiệp bảo hiểm, đồng thời hỗ trợ chủ garage trong vận hành hàng ngày.

**Demographics**:
- **Experience level**: INTERMEDIATE
- **Tech comfort**: MEDIUM
- **Language / locale**: vi-VN

## 2. Goals

- Quản lý quyết toán và theo dõi công nợ khách hàng chính xác
- Theo dõi đơn hàng mua, đối soát thanh toán với nhà cung cấp
- Quản lý nhập/xuất kho, kiểm kê tồn kho theo kỳ
- Quản lý danh mục hệ thống: dịch vụ, nhà cung cấp, nhà xe liên kết
- Hỗ trợ chủ garage trong quản lý lịch hẹn, phiếu dịch vụ, khách hàng
- **Phân bổ chính xác chi phí sửa chữa theo nguồn thanh toán (bảo hiểm / khách hàng tự trả) trên Phiếu dịch vụ**
- **Nhập đúng các khoản điều chỉnh bảo hiểm (chiết khấu liên kết, giảm trừ bồi thường, khấu hao vật tư, khấu trừ bảo hiểm) để tính ra số tiền bảo hiểm phải thanh toán**
- **Tạo phiếu quyết toán bảo hiểm độc lập với phiếu quyết toán khách hàng, theo dõi công nợ phải thu từ doanh nghiệp bảo hiểm**
- **Lập và xuất bộ hồ sơ bảo hiểm (4 tài liệu chuẩn: Phiếu báo giá, Phiếu quyết toán, Biên bản nghiệm thu, Giấy ủy quyền) gửi doanh nghiệp bảo hiểm**
- **Ghi nhận thanh toán từ doanh nghiệp bảo hiểm (có thể nhiều đợt) ngay trên phiếu quyết toán loại bảo hiểm**

## 3. Pain Points

- Đối soát thanh toán và công nợ thủ công giữa nhiều chứng từ — frequency: DAILY, severity: HIGH
- Khó kiểm soát giá vốn, giá bán khi tồn kho biến động — frequency: WEEKLY, severity: HIGH
- Nhập liệu chứng từ trùng lặp giữa nhiều hệ thống (sổ sách, phần mềm kế toán) — frequency: DAILY, severity: MED
- Thiếu báo cáo tổng hợp theo thời gian thực để đối chiếu — frequency: WEEKLY, severity: MED
- **Tính sai số tiền bảo hiểm phải trả vì lẫn lộn dòng KH tự thanh toán và dòng BH thanh toán trên Phiếu dịch vụ** — frequency: WEEKLY, severity: HIGH
- **Phải dùng Excel ngoài hệ thống để tách chi phí theo bảo hiểm và khách hàng, dễ sai sót và mất thời gian** — frequency: WEEKLY, severity: HIGH
- **Thiếu giấy tờ khi gửi hồ sơ cho doanh nghiệp bảo hiểm dẫn đến bị trả lại, kéo dài thời gian thu hồi tiền** — frequency: MONTHLY, severity: HIGH
- **Khó theo dõi công nợ phải thu từ bảo hiểm vì BH trả nhiều đợt và chậm, hồ sơ tồn lâu không có dashboard tổng hợp** — frequency: WEEKLY, severity: HIGH
- **Khi bảo hiểm yêu cầu bổ sung/chỉnh sửa hồ sơ sau khi đã gửi, không có cơ chế lưu lại bản cũ để đối chiếu** — frequency: MONTHLY, severity: MED

## 4. Jobs-to-be-done (JTBD)

- **JTBD-1**: Khi phiếu dịch vụ hoàn thành, tôi muốn tạo phiếu quyết toán và ghi nhận thanh toán, để có thể theo dõi công nợ khách hàng chính xác.
- **JTBD-2**: Khi nhà cung cấp giao hàng, tôi muốn đối soát đơn hàng mua và tạo phiếu nhập kho, để có thể xác nhận số lượng và giá trị hàng nhận đúng.
- **JTBD-3**: Khi cuối kỳ, tôi muốn thực hiện kiểm kê tồn kho và chốt kỳ, để có thể đối chiếu số liệu thực tế với sổ sách.
- **JTBD-4**: Khi cần mua phụ tùng, tôi muốn tạo yêu cầu báo giá và theo dõi đơn hàng mua, để có thể kiểm soát chi phí mua hàng.
- **JTBD-5**: Khi lập Phiếu dịch vụ cho ca sửa chữa có bảo hiểm, tôi muốn đánh dấu nguồn thanh toán (Bảo hiểm / Khách hàng tự trả) cho từng dòng vật tư và công dịch vụ, để có thể tách chính xác phần bảo hiểm phải trả và phần khách hàng phải tự thanh toán.
- **JTBD-6**: Khi đã tách nguồn thanh toán xong, tôi muốn nhập các khoản điều chỉnh bảo hiểm (chiết khấu liên kết theo % hoặc số tiền, giảm trừ bồi thường theo % hoặc số tiền, khấu hao vật tư, khấu trừ bảo hiểm) ngay trên Phiếu dịch vụ, để hệ thống tự tính ra số tiền bảo hiểm phải thanh toán và phần khách hàng chịu từ điều chỉnh.
- **JTBD-7**: Khi đã xác định được phần bảo hiểm phải trả, tôi muốn tạo Phiếu quyết toán bảo hiểm (độc lập với Phiếu quyết toán khách hàng) chỉ chứa các hạng mục có nguồn thanh toán là bảo hiểm, để theo dõi công nợ phải thu từ doanh nghiệp bảo hiểm rõ ràng.
- **JTBD-8**: Khi chuẩn bị gửi hồ sơ cho doanh nghiệp bảo hiểm, tôi muốn tạo bộ hồ sơ chuẩn gồm 4 tài liệu (Phiếu báo giá, Phiếu quyết toán, Biên bản nghiệm thu, Giấy ủy quyền) — điền nội dung trực tiếp trên template, xuất PDF cả bộ — để gửi đầy đủ ngay lần đầu, tránh bị BH trả lại.
- **JTBD-9**: Khi bảo hiểm yêu cầu bổ sung hoặc sửa hồ sơ sau khi đã xuất PDF, tôi muốn tạo bản hồ sơ mới (giữ nguyên bản cũ trong tab "Hồ sơ bảo hiểm đã xuất" để truy vết), để vừa đáp ứng yêu cầu BH vừa có lịch sử đối chiếu.
- **JTBD-10**: Khi doanh nghiệp bảo hiểm chuyển tiền (có thể trả từng đợt), tôi muốn ghi nhận thanh toán trực tiếp trên Phiếu quyết toán bảo hiểm bằng chức năng ghi nhận thanh toán hiện có, để cập nhật trạng thái thanh toán và số còn phải thu BH.

## 5. Access Context

| Aspect | Value |
|---|---|
| Device | BOTH (chủ yếu Web GMS trên desktop, App Garage khi cần) |
| Environment | OFFICE (văn phòng tại garage) |
| Network | STABLE |
| Permissions / auth level | Toàn quyền, **ngoại trừ** nhóm chat theo xe |
| Accessibility needs | NONE |

## 6. Change Log

| Date | Summary | Author |
|---|---|---|
| 2026-05-20 | Khởi tạo persona từ _RULES.md §10 + KG garage-web | Business Authority |
| 2026-05-27 | Bổ sung trách nhiệm liên quan `EP-INSURANCE-SETTLEMENT` (PRD v5): cập nhật Typical context (thêm vai trò quyết toán BH + làm hồ sơ BH), thêm 5 Goals (phân bổ nguồn TT, nhập điều chỉnh BH, tạo phiếu QT BH, lập & xuất hồ sơ BH 4 tài liệu chuẩn, ghi nhận thanh toán từ BH), thêm 5 Pain Points (sai số tiền BH, dùng Excel ngoài hệ thống, thiếu giấy tờ, công nợ BH khó theo dõi, không có cơ chế versioning hồ sơ), thêm JTBD-5..10 (đánh dấu nguồn TT, nhập điều chỉnh BH, tạo phiếu QT BH, tạo bộ hồ sơ BH, tạo bản hồ sơ mới khi BH yêu cầu sửa, ghi nhận thanh toán BH nhiều đợt) | Business Authority |
| 2026-06-11 | **Bỏ upload file scan** (chốt B-3): JTBD-8 — bộ hồ sơ BH "điền nội dung trực tiếp trên template" (gỡ "upload giấy tờ scan"). Đồng bộ FEAT-INS-DOSSIER-CREATE v17. | BA/PO (anhluong) |
