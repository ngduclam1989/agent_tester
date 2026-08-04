---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-SUPPORT"
boundary: "agg-garage-graph"
last_reviewed: "2026-05-27"
---

# FEAT-SUP-CHAT: Chat hỗ trợ

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-SUP-CHAT` |
| Title | Chat hỗ trợ |
| Parent Epic | `EP-SUPPORT` |
| Boundary | `agg-garage-graph` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage, **I want** sử dụng chat để liên hệ CSKH phần mềm và trao đổi về xe, **so that** tôi nhận được hỗ trợ kịp thời.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Danh sách chat, chat hỗ trợ, chat theo xe

- [ ] **AC-1**: Hiển thị màn hình tất cả chat
  - Tại: menu hệ thống, mục chat.
  - Khi: chủ garage truy cập chức năng chat.
  - Thì: hệ thống hiển thị màn hình tất cả các đoạn chat bao gồm cả chat hỗ trợ và chat theo xe. Bên trái là danh sách nhóm chat, bên phải là nội dung đoạn chat được chọn. Ô tìm kiếm có placeholder: **"Nhập tên hãng xe, dòng xe, hoặc mã để tìm kiếm"**. Khi chưa chọn đoạn chat nào, hiển thị thông báo: **"Hãy chọn một đoạn chat bất kì để bắt đầu cuộc trò chuyện"**.

- [ ] **AC-2**: Hiển thị màn hình chat hỗ trợ CSKH
  - Tại: menu hệ thống, mục chat hỗ trợ.
  - Khi: chủ garage truy cập chức năng chat hỗ trợ.
  - Thì: hệ thống hiển thị màn hình chat hỗ trợ CSKH với danh sách nhóm chat hỗ trợ. Ô tìm kiếm có placeholder: **"Nhập tên hãng xe, dòng xe, hoặc mã để tìm kiếm"**. Khi chưa chọn đoạn chat nào, hiển thị thông báo: **"Hãy chọn một đoạn chat bất kì để bắt đầu cuộc trò chuyện"**.

- [ ] **AC-3**: Hiển thị màn hình chat theo xe
  - Tại: menu hệ thống, mục chat theo xe.
  - Khi: chủ garage truy cập chức năng chat theo xe.
  - Thì: hệ thống hiển thị màn hình chat theo xe với danh sách nhóm chat gắn với xe. Ô tìm kiếm có placeholder: **"Nhập tên hãng xe, dòng xe, hoặc mã để tìm kiếm"**. Khi chưa chọn đoạn chat nào, hiển thị thông báo: **"Hãy chọn một đoạn chat bất kì để bắt đầu cuộc trò chuyện"**.

- [ ] **AC-4**: Tìm kiếm nhóm chat
  - Tại: màn hình chat (tất cả / hỗ trợ / theo xe), ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách nhóm chat khớp với từ khóa. Nếu không có kết quả, hiển thị thông báo: **"Không có group nào phù hợp"**.

- [ ] **AC-5**: Chọn đoạn chat để xem và trò chuyện
  - Tại: màn hình chat, danh sách nhóm chat bên trái.
  - Khi: chủ garage nhấn vào một nhóm chat.
  - Thì: hệ thống hiển thị nội dung đoạn chat tương ứng bên phải, bao gồm lịch sử tin nhắn và ô nhập tin nhắn mới. Hiển thị nhãn **"Trò chuyện"** và thông tin nhóm chat. Nhãn **"Bạn"** hiển thị bên cạnh tin nhắn do người dùng hiện tại gửi.

- [ ] **AC-6**: Gửi tin nhắn trong đoạn chat
  - Tại: màn hình chat, ô nhập tin nhắn.
  - Khi: chủ garage nhập nội dung tin nhắn và nhấn gửi.
  - Thì: hệ thống gửi tin nhắn đến nhóm chat và hiển thị tin nhắn mới trong cuộc trò chuyện.

- [ ] **AC-7**: Gọi thoại từ màn hình chat hỗ trợ
  - Tại: màn hình chat hỗ trợ, nút gọi.
  - Khi: chủ garage nhấn nút gọi thoại.
  - Thì: hệ thống hiển thị modal **"Cuộc gọi"** và khởi tạo cuộc gọi thoại đến CSKH. Nhãn hiển thị: **"Cuộc gọi thoại"**.

### Nhóm B — Tạo nhóm chat hỗ trợ mới

- [ ] **AC-8**: Tạo nhóm chat hỗ trợ mới
  - Tại: màn hình chat hỗ trợ, nút **"Tạo nhóm"**.
  - Khi: chủ garage nhấn nút **"Tạo nhóm"**.
  - Thì: hệ thống hiển thị modal **"Tạo mới"** với trường **"Tên nhóm"** (bắt buộc). Placeholder: **"Nhập tên nhóm"**.

- [ ] **AC-9**: Validation tên nhóm chat
  - Tại: modal tạo nhóm chat mới, trường **"Tên nhóm"**.
  - Khi: chủ garage nhập tên nhóm không hợp lệ.
  - Thì:
    - Nếu để trống: hiển thị thông báo lỗi **"Vui lòng nhập tên chủ đề nhóm chat"**.
    - Nếu dưới 3 ký tự hoặc trên 255 ký tự: hiển thị thông báo lỗi **"Tên chủ đề nhóm chat cần ít nhất 3 ký tự và nhiều nhất 255 ký tự"**.

- [ ] **AC-10**: Xác nhận tạo nhóm chat
  - Tại: modal tạo nhóm chat mới, nút **"Tạo nhóm mới"**.
  - Khi: chủ garage đã nhập tên nhóm hợp lệ và nhấn nút **"Tạo nhóm mới"**.
  - Thì: hệ thống tạo nhóm chat hỗ trợ mới và chuyển đến đoạn chat vừa tạo. Nhấn để bắt đầu trò chuyện: **"Nhấn để bắt đầu trò chuyện"**.

### Nhóm C — Phân quyền

- [ ] **AC-11**: Phân quyền chat hỗ trợ và tất cả chat
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền truy cập màn hình tất cả chat và màn hình chat hỗ trợ CSKH. Cả hai vai trò đều có thể xem, tìm kiếm, gửi tin nhắn, gọi thoại và tạo nhóm chat hỗ trợ mới.

- [ ] **AC-12**: Kế toán không có quyền truy cập chat theo xe
  - Tại: menu hệ thống.
  - Khi: kế toán truy cập chức năng chat theo xe.
  - Thì: hệ thống **không cho phép** kế toán truy cập màn hình chat theo xe. Đây là ngoại lệ phân quyền duy nhất trong hệ thống — chỉ chủ garage mới có quyền truy cập nhóm chat theo xe.

### Nhóm D — Thông báo và trạng thái

- [ ] **AC-13**: Nhận thông báo tin nhắn mới
  - Tại: bất kỳ màn hình nào trong hệ thống.
  - Khi: có tin nhắn mới trong nhóm chat mà người dùng tham gia.
  - Thì: hệ thống hiển thị thông báo popup với nội dung **"Tin nhắn mới từ"** kèm tên nhóm chat. Popup có ba tab: **"Cuộc gọi"**, **"Thông báo"**, **"Tin nhắn"**. Người dùng có thể nhấn **"Đánh dấu tất cả đã đọc"** để đánh dấu tất cả tin nhắn đã đọc.

- [ ] **AC-14**: Trạng thái đã đọc / chưa đọc
  - Tại: danh sách nhóm chat.
  - Khi: có tin nhắn chưa đọc trong nhóm chat.
  - Thì: nhóm chat hiển thị trạng thái **"Chưa đọc"**. Sau khi người dùng xem tin nhắn, trạng thái chuyển thành **"Đã đọc"**.

- [ ] **AC-15**: Gửi file đính kèm
  - Tại: màn hình chat, ô đính kèm file.
  - Khi: chủ garage gửi file đính kèm.
  - Thì: hệ thống chỉ chấp nhận file PDF, DOC hoặc DOCX. Nếu file không đúng định dạng, hiển thị thông báo lỗi: **"Chỉ được chọn file PDF, DOC hoặc DOCX"**. Nếu upload file thất bại, hiển thị thông báo: **"lỗi upload file"**.

### Nhóm E — Trạng thái trống và lỗi

- [ ] **AC-16**: Danh sách chat trống
  - Tại: màn hình chat (tất cả / hỗ trợ / theo xe).
  - Khi: không có đoạn chat nào.
  - Thì: hệ thống hiển thị thông báo: **"Không có đoạn chat nào để hiển thị"**.

- [ ] **AC-17**: Danh sách thông báo trống
  - Tại: popup thông báo tin nhắn.
  - Khi: không có thông báo nào.
  - Thì: hệ thống hiển thị thông báo: **"Không có thông báo nào."** và **"Thông báo mới nhất sẽ được hiển thị ở đây."**

- [ ] **AC-18**: Lỗi tạo nhóm chat
  - Tại: modal tạo nhóm chat mới.
  - Khi: hệ thống không thể tạo nhóm chat.
  - Thì: hiển thị thông báo lỗi: **"Lỗi tạo nhóm"**.

- [ ] **AC-19**: Tất cả nhân viên CSKH bận
  - Tại: màn hình chat hỗ trợ.
  - Khi: người dùng cố gắng kết nối với CSKH nhưng tất cả nhân viên đều bận.
  - Thì: hệ thống hiển thị thông báo: **"Tất cả thành viên đều bận, vui lòng thử lại sau"**.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-SUPPORT.

## 4. API Reference

- Boundary: `agg-garage-graph` (BFF) + `agg-sso-graph` (token)
- Chat runtime: CometChat SDK
- GraphQL mutations: `AddCS`, `AddCSWeekend`, `RoutingCandidate`

## 5. Business Rules

- **BR-SUP-CHAT-001**: Hệ thống chat có ba màn hình: tất cả chat, chat hỗ trợ CSKH, và chat theo xe. Màn hình tất cả chat tổng hợp cả hai loại.
- **BR-SUP-CHAT-002**: Kế toán không có quyền truy cập nhóm chat theo xe. Đây là ngoại lệ phân quyền duy nhất trong toàn bộ hệ thống — mọi chức năng khác đều cho phép cả chủ garage và kế toán thực hiện ngang nhau.
- **BR-SUP-CHAT-003**: Tên nhóm chat hỗ trợ phải từ 3 đến 255 ký tự.
- **BR-SUP-CHAT-004**: File đính kèm trong chat chỉ chấp nhận định dạng PDF, DOC hoặc DOCX.
- **BR-SUP-CHAT-005**: Tin nhắn realtime — khi có tin nhắn mới, hệ thống hiển thị thông báo popup cho người dùng đang online.

## 6. Edge Cases

- **EC-1**: Garage mới chưa có đoạn chat nào — hiển thị thông báo **"Không có đoạn chat nào để hiển thị"** và gợi ý **"Hãy chọn một đoạn chat bất kì để bắt đầu cuộc trò chuyện"**.
- **EC-2**: Tìm kiếm nhóm chat không có kết quả — hiển thị thông báo **"Không có group nào phù hợp"**.
- **EC-3**: Kế toán truy cập tất cả chat — chỉ hiển thị nhóm chat hỗ trợ, không hiển thị nhóm chat theo xe.
- **EC-4**: Mất kết nối realtime — tin nhắn mới không được cập nhật cho đến khi kết nối lại.

## 7. Out of Scope

- Gửi phản hồi về phần mềm: thuộc `FEAT-SUP-FEEDBACK`.
- Quản lý thông báo hệ thống (notification inbox): thuộc chức năng thông báo chung, không thuộc EP-SUPPORT.
- Quản lý chi tiết xe trong chat: thuộc `EP-VEHICLE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG garage-web (chat-all, chat-support, chat-vehicle screens) + gf-notification. Cover 3 màn hình chat, tạo nhóm, phân quyền kế toán bị loại khỏi chat theo xe. |
