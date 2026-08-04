---
document_id: 'GMS-TC-W02-MOBILE-E2E'
type: test-case
wave: 'W02'
phase: 'A+B'
boundary: 'garage-web, garage-mobile, gf-accounting, agg-garage-graph'
features:
  - FEAT-INS-STL-CREATE
  - CR-20260612-02
  - FEAT-INS-DOSSIER-CREATE
  - FEAT-INS-DOSSIER-VIEW
status: ACTIVE
version: 1
owner: 'QA Authority'
last_reviewed: '2026-06-19'
figma_available: 'NO (mobile oracle W02 chưa có)'
automation_candidate: false
note: >
  Full mobile E2E — gồm 3 lớp: (1) core business flows thực hiện từ đầu đến cuối trên mobile,
  (2) cross-platform sync (web↔mobile), (3) regression tính năng cũ trên mobile.
  TCs dùng ID riêng TC-W02-MOBILE-E2E-NNN, không trùng với TC-W02-E2E.md (web).
---

# Test Case: W02 — Mobile E2E

## 1. Thông tin chung

| Trường | Giá trị |
|---|---|
| Wave | W02 |
| Loại | MOBILE-E2E |
| Boundary | garage-web · garage-mobile · gf-accounting · agg-garage-graph |
| Mục tiêu | Kiểm tra đầy đủ E2E trên mobile: (1) core flows business từ đầu đến cuối trên mobile; (2) đồng bộ dữ liệu web↔mobile; (3) regression tính năng cũ sau W02 changes |
| Môi trường | staging — web + mobile cùng tenant |
| Automation candidate | false |

## 2. Phạm vi

### Lớp 1 — Core business flows (thực hiện từ đầu đến cuối TỪ MOBILE)
- Tạo phiếu QT BH từ SO có BH trên mobile (full flow)
- Hoàn thành SO có BH âm từ mobile — bottom sheet cảnh báo → confirm → SO hoàn thành
- Tạo hồ sơ BH trên mobile — điền Biên bản + GUQ + check 4 thẻ + xuất → bộ hồ sơ hoàn chỉnh
- Xem hồ sơ BH trên mobile — tap PDF card → viewer → share/download

### Lớp 2 — Cross-platform sync (web↔mobile)
- Phân bổ BH tạo trên web → mobile hiển thị đúng số liệu
- Phiếu QT BH tạo trên web → mobile xem chi tiết đúng
- Hoàn thành SO có BH âm trên web → mobile phản ánh trạng thái
- Hồ sơ BH xuất trên web → mobile tab "Hồ sơ đã xuất" hiển thị đúng
- Hồ sơ BH tạo trên mobile → web tab refresh hiển thị đúng

### Lớp 3 — Regression tính năng cũ sau W02 changes
- Hoàn thành SO không BH — không leak BH content
- Share-PDF phiếu QT BH trên mobile sau template change CR-20260616-01
- Submit Tạo QT mobile sau panel 2 cột CR-20260616-02
- Chỉnh sửa phiếu QT BH trên mobile
- Thanh toán từ chi tiết phiếu QT BH trên mobile
- Concurrent export 2 user mobile — 409 conflict handling

## 3. Tóm tắt trạng thái

| Trạng thái | Số lượng |
|---|---|
| READY | 24 |
| SKIP | 0 |
| BLOCKED | 0 |
| **Tổng** | **24** |

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W02-MOBILE-E2E-001 | FEAT-INS-STL-CREATE | garage-web, garage-mobile, agg-garage-graph | AC-3, AC-4 | MOBILE-E2E | Smoke | P1 | Panel phân bổ BH tạo trên web → mobile hiển thị đúng số liệu | 1. SO có BH đã nhập phân bổ đầy đủ (trên web)<br>2. App mobile đã sync | 1. Trên web: mở Tạo phiếu QT từ SO có BH, ghi nhớ số tiền phân bổ từng khoản<br>2. Trên mobile app: mở cùng SO, vào màn Tạo phiếu QT<br>3. So sánh panel "Tổng giá dịch vụ" | - Số tiền từng khoản phân bổ BH trên mobile khớp với web<br>- Tổng "Cân thanh toán" BH và KH khớp<br>- Không có chênh lệch giữa 2 platform | READY | |
| TC-W02-MOBILE-E2E-002 | FEAT-INS-STL-CREATE, CR-20260612-01 | garage-web, garage-mobile, gf-accounting | AC-1, CR-20260612-01 | MOBILE-E2E | Smoke | P1 | Phiếu QT BH tạo trên web → mobile xem chi tiết đúng | 1. Đã tạo phiếu QT BH trên web<br>2. App mobile đã sync | 1. Trên web: tạo phiếu QT BH, ghi nhớ số tiền<br>2. Trên mobile: tìm phiếu QT BH vừa tạo, mở chi tiết<br>3. So sánh thông tin | - Phiếu QT BH xuất hiện trên mobile app<br>- Số tiền BH trong chi tiết khớp với web<br>- Cột BH (per-payer) hiển thị đúng | READY | |
| TC-W02-MOBILE-E2E-003 | CR-20260612-02 | garage-web, garage-mobile, gf-sales | CR-20260612-02 | MOBILE-E2E | Regression | P2 | Hoàn thành SO có BH âm trên web → mobile phản ánh trạng thái "Hoàn thành" | 1. SO có BH âm chưa hoàn thành<br>2. Web và mobile cùng đăng nhập | 1. Trên web: hoàn thành SO có BH âm (confirm popup)<br>2. Trên mobile: refresh SO list<br>3. Kiểm tra trạng thái SO trên mobile | - SO hiển thị trạng thái "Hoàn thành" trên mobile<br>- Thông tin BH âm vẫn hiển thị đúng trong chi tiết SO trên mobile | READY | |
| TC-W02-MOBILE-E2E-004 | FEAT-INS-DOSSIER-CREATE, FEAT-INS-DOSSIER-VIEW | garage-web, garage-mobile, gf-accounting | AC-9, AC-1 (View) | MOBILE-E2E | Smoke | P1 | Hồ sơ BH xuất trên web → mobile tab "Hồ sơ đã xuất" hiển thị đúng | 1. Phiếu QT BH tồn tại<br>2. Web và mobile cùng tenant, cùng SO | 1. Trên web: xuất hồ sơ BH (ví dụ 4 tài liệu)<br>2. Trên mobile: mở chi tiết phiếu QT BH, vào tab "Hồ sơ đã xuất"<br>3. Kiểm tra bộ hồ sơ | - Bộ hồ sơ vừa xuất trên web xuất hiện trong tab mobile<br>- Số PDF cards khớp với số tài liệu đã xuất<br>- Timestamp xuất đúng | READY | |
| TC-W02-MOBILE-E2E-005 | FEAT-INS-DOSSIER-CREATE, FEAT-INS-DOSSIER-VIEW | garage-web, garage-mobile, gf-accounting | AC-9, AC-7 (versioning) | MOBILE-E2E | Regression | P2 | Versioning: Bộ v1 xuất web, bộ v2 xuất mobile → cả hai tab hiển thị đúng thứ tự | 1. Phiếu QT BH tồn tại | 1. Trên web: xuất bộ hồ sơ v1<br>2. Trên mobile: xuất bộ hồ sơ v2 (tạo bộ mới)<br>3. Trên web: refresh tab "Hồ sơ đã xuất"<br>4. Trên mobile: refresh tab | - Web: bộ v2 (mới hơn) ở đầu, bộ v1 phía dưới<br>- Mobile: cùng thứ tự (v2 đầu, v1 dưới)<br>- Dữ liệu nhất quán cross-platform | READY | |
| TC-W02-MOBILE-E2E-006 | FEAT-INS-DOSSIER-VIEW | garage-web, garage-mobile, gf-accounting | AC-5 | MOBILE-E2E | Regression | P2 | Download PDF trên mobile, xem bằng viewer web — file giống nhau | 1. Hồ sơ BH đã xuất<br>2. Cùng bộ hồ sơ truy cập từ cả web và mobile | 1. Trên mobile: download Phiếu QT PDF<br>2. Trên web: xem cùng Phiếu QT PDF trong viewer<br>3. So sánh nội dung (số tiền, tên, ngày) | - Cùng file PDF (nội dung giống nhau)<br>- Không có sai khác về số liệu hay thông tin phiếu | READY | |
| TC-W02-MOBILE-E2E-007 | FEAT-INS-DOSSIER-CREATE | garage-web, garage-mobile, gf-accounting | AC-11 | MOBILE-E2E | Regression | P3 | Tạo bộ mới trên mobile → web tab refresh hiển thị bộ mới lên đầu | 1. Đã có bộ hồ sơ v1 (tạo trên web)<br>2. App mobile đang mở tab hồ sơ | 1. Trên mobile: tạo bộ hồ sơ mới v2 và xuất<br>2. Trên web: refresh tab "Hồ sơ đã xuất" | - Bộ v2 (mới nhất) xuất hiện ở đầu danh sách trên web<br>- Không cần logout/login lại để thấy dữ liệu mới | READY | |

| TC-W02-MOBILE-E2E-008 | CR-20260612-02 | garage-web, garage-mobile, gf-sales | CR-20260612-02, FEAT-SO-DETAIL AC-16 | MOBILE-E2E | Regression | P1 | Hoàn thành SO không BH trên web → mobile phản ánh trạng thái "Hoàn thành" (không có BH content nào bị leak) | 1. SO không có BH, chưa hoàn thành<br>2. Web và mobile cùng đăng nhập tenant | 1. Trên web: click "Hoàn thành phiếu dịch vụ" trên SO không BH<br>2. Xác nhận popup baseline (không có cảnh báo BH âm)<br>3. Click "Xác nhận" → SO hoàn thành<br>4. Trên mobile: refresh SO list, mở SO vừa hoàn thành | - SO hiển thị trạng thái "Hoàn thành" trên mobile<br>- Không có thông tin BH nào xuất hiện trên màn SO (không có panel BH, không có cảnh báo BH)<br>- CR-20260612-02 không làm leak BH content sang SO không BH trên mobile | READY | |
| TC-W02-MOBILE-E2E-009 | CR-20260616-01 | garage-mobile, gf-accounting | CR-20260616-01 | MOBILE-E2E | Regression | P1 | Chi tiết phiếu QT BH mobile → action "Share-PDF" / "In phiếu" vẫn hoạt động sau template change | 1. Phiếu QT BH đã tạo<br>2. Đang trên mobile ở màn chi tiết phiếu QT BH | 1. Trên mobile: mở chi tiết phiếu QT BH<br>2. Tap nút "Share-PDF" / "In phiếu" (native action)<br>3. Quan sát phản hồi | - PDF được share/render thành công, không có lỗi template<br>- Share sheet iOS/Android xuất hiện (hoặc file tải về)<br>- PDF có section "Phân bổ bảo hiểm" 5 khoản dấu − (CR-20260616-01 template đúng)<br>- Action "Share-PDF" không bị vỡ sau khi W02 sửa template | READY | |
| TC-W02-MOBILE-E2E-010 | CR-20260616-02, FEAT-INS-STL-CREATE | garage-mobile, gf-accounting | CR-20260616-02, AC-1..6 | MOBILE-E2E | Regression | P1 | Tạo phiếu QT mobile (SO có BH, panel 2 cột) → Submit → QT được tạo thành công | 1. SO có BH đầy đủ<br>2. App mobile đang ở màn Tạo phiếu QT | 1. Trên mobile: mở màn Tạo phiếu QT từ SO có BH<br>2. Xác nhận panel "Tổng giá dịch vụ" hiển thị đúng (2 cột CR-20260616-02)<br>3. Điền các field bắt buộc của phiếu QT<br>4. Tap "Xác nhận tạo phiếu quyết toán"<br>5. Quan sát kết quả | - Phiếu QT BH + KH được tạo thành công trên mobile<br>- Không có lỗi liên quan đến panel component 2 cột<br>- App điều hướng về chi tiết phiếu QT BH sau khi tạo<br>- Panel 2 cột mới (CR-20260616-02) không làm vỡ nút submit trên mobile | READY | |
| TC-W02-MOBILE-E2E-011 | CR-20260612-01 | garage-mobile, gf-accounting, gf-sales | CR-20260612-01, FEAT-INS-STL-DETAIL | MOBILE-E2E | Regression | P2 | Chi tiết phiếu QT BH mobile → nút "Thanh toán" visible và tap được sau W02 panel per-payer | 1. Phiếu QT BH đã tạo, chưa thanh toán<br>2. Đang ở màn chi tiết phiếu QT BH trên mobile | 1. Trên mobile: mở chi tiết phiếu QT BH<br>2. Quan sát panel per-payer (CR-20260612-01 — chỉ cột BH)<br>3. Tìm nút "Thanh toán" trên cùng màn<br>4. Tap nút "Thanh toán" | - Nút "Thanh toán" visible, không bị panel per-payer mới che khuất trên màn mobile<br>- Tap "Thanh toán" → dialog/flow thanh toán mở được<br>- Panel per-payer (CR-20260612-01) không interfere với baseline action Thanh toán trên mobile | READY | |
| TC-W02-MOBILE-E2E-012 | FEAT-INS-DOSSIER-CREATE | garage-mobile, gf-accounting | AC-6, AC-12 | MOBILE-E2E | Regression | P1 | Upload file Biên bản PENDING via native picker → S3 upload → docStatus READY (E2E full flow) | 1. Phiếu QT BH tồn tại<br>2. Thẻ Biên bản docStatus PENDING (chưa fill form)<br>3. File PDF test <10MB sẵn sàng | 1. Mở màn tạo hồ sơ BH trên mobile<br>2. Tap thẻ Biên bản nghiệm thu<br>3. Tap nút "Upload file thay thế"<br>4. Native file picker mở → chọn file PDF (<10MB)<br>5. Chờ upload hoàn tất<br>6. Quan sát trạng thái thẻ Biên bản | - Native file picker mở đúng (iOS Files / Android file picker)<br>- Upload progress hiển thị trong quá trình<br>- Sau upload: docStatus thẻ Biên bản → READY<br>- Badge đổi "Sẵn sàng" màu xanh<br>- Checkbox thẻ Biên bản enable (có thể tích)<br>- File tồn tại trên S3 gms-insurance-dossier-{env} | READY | |
| TC-W02-MOBILE-E2E-013 | FEAT-INS-DOSSIER-CREATE | garage-mobile, gf-accounting | AC-6, AC-14 | MOBILE-E2E | Full | P2 | Upload Biên bản fail lần 1 (5xx) → error snackbar → retry → lần 2 thành công | 1. Màn tạo hồ sơ đang mở<br>2. Môi trường: mock gf-accounting trả 5xx lần 1, 200 lần 2 | 1. Tap thẻ Biên bản → upload file<br>2. Server trả 5xx → quan sát<br>3. Tap "Thử lại"<br>4. Server trả 200 → quan sát | - Lần 1: Error snackbar đỏ "Tải file thất bại, vui lòng thử lại"<br>- docStatus thẻ vẫn PENDING sau lỗi (không corrupt state)<br>- Nút retry hoặc user có thể upload lại<br>- Lần 2: Upload thành công, docStatus READY<br>- App không crash sau lỗi | READY | |
| TC-W02-MOBILE-E2E-014 | FEAT-INS-DOSSIER-CREATE | garage-mobile, gf-accounting | AC-6 | MOBILE-E2E | Regression | P2 | File type reject (.docx) và size >10MB trong native picker context → reject với message rõ, không upload | 1. Màn tạo hồ sơ đang mở<br>2. File test: .docx sẵn sàng; PDF >10MB sẵn sàng | 1. Tap thẻ Biên bản → picker → chọn file .docx<br>2. Quan sát phản hồi<br>3. Tap thẻ Biên bản → picker → chọn PDF >10MB<br>4. Quan sát phản hồi | - .docx: reject với message "Chỉ cho phép PDF, JPEG, PNG" (hoặc tương tự). KHÔNG upload<br>- PDF >10MB: reject "Tệp vượt quá giới hạn 10MB". KHÔNG upload<br>- docStatus thẻ vẫn PENDING sau cả 2 reject<br>- App không crash | READY | |
| TC-W02-MOBILE-E2E-015 | FEAT-INS-DOSSIER-CREATE | garage-mobile | EC-1 | MOBILE-E2E | Regression | P1 | App background giữa form Biên bản đang điền → return foreground → data mất (verify EC-1 lifecycle) | 1. Form Biên bản đang mở trên mobile<br>2. Đã điền BKS xe "51F-12345", Ngày lập "19/06/2026" | 1. Điền BKS xe và Ngày lập trong form Biên bản<br>2. Nhấn HOME → app vào background<br>3. Đợi 30 giây<br>4. Tap icon app → return foreground<br>5. Quan sát form Biên bản | - App resume về đúng màn tạo hồ sơ (không về Home)<br>- Data "51F-12345" và "19/06/2026" MẤT (EC-1: không auto-save — intentional behavior)<br>- Form về trạng thái trống<br>- App không crash | READY | |
| TC-W02-MOBILE-E2E-016 | FEAT-INS-DOSSIER-CREATE | garage-mobile, gf-accounting | AC-9, AC-14 | MOBILE-E2E | Full | P2 | 5xx khi tap "Xuất hồ sơ" trên mobile → error snackbar + nút re-enable → retry → success | 1. Đã check tài liệu, nút "Xuất" enable<br>2. Mock: lần 1 gf-accounting trả 5xx, lần 2 trả 200 | 1. Tap "Xuất hồ sơ bảo hiểm"<br>2. Server trả 5xx → quan sát<br>3. Tap retry<br>4. Server trả 200 → quan sát | - Lần 1: Loading indicator → Error snackbar đỏ "Xuất hồ sơ thất bại, vui lòng thử lại"<br>- Nút "Xuất" re-enable sau lỗi (không disabled mãi mãi)<br>- Lần 2: Xuất thành công, tab hồ sơ hiển thị bộ mới<br>- Không có bộ hồ sơ duplicate từ lần 1 | READY | |
| TC-W02-MOBILE-E2E-017 | FEAT-INS-DOSSIER-CREATE | garage-mobile, gf-accounting | AC-9 | MOBILE-E2E | Full | P2 | Mất kết nối mạng mid-export → app hiển thị offline warning → recover khi có lại network, không stuck | 1. Đang trong quá trình xuất hồ sơ (tap Xuất xong đang loading)<br>2. Network available ban đầu | 1. Tap "Xuất hồ sơ" → đang loading<br>2. Tắt wifi/data giữa chừng<br>3. Quan sát phản hồi<br>4. Bật lại wifi/data<br>5. Quan sát | - Khi mất mạng: loading dừng → error toast/banner "Mất kết nối" hoặc "Xuất hồ sơ thất bại"<br>- App không crash, không loading vô hạn<br>- Khi có lại mạng: user có thể tap "Xuất" lại bình thường<br>- Bộ hồ sơ chưa được tạo (không corrupt S3 state) | READY | |
| TC-W02-MOBILE-E2E-018 | FEAT-INS-DOSSIER-VIEW | garage-mobile, gf-accounting | AC-7 | MOBILE-E2E | Regression | P1 | Pull-to-refresh tab hồ sơ đã xuất → reload từ server → bộ mới nhất lên đầu (không cần restart app) | 1. Tab "Hồ sơ BH đã xuất" mở với bộ v1<br>2. Bộ v2 vừa tạo từ thiết bị khác, chưa hiển thị trên mobile | 1. Không refresh app<br>2. Kéo xuống (pull-to-refresh) trên tab hồ sơ đã xuất<br>3. Chờ RefreshIndicator hoàn tất<br>4. Quan sát list | - RefreshIndicator spinner xuất hiện khi pull<br>- List reload từ server (không phải cache cũ)<br>- Bộ v2 (mới nhất) xuất hiện đầu list sau refresh<br>- Bộ v1 vẫn còn ở dưới<br>- Không cần logout/login | READY | |
| TC-W02-MOBILE-E2E-019 | FEAT-INS-STL-CREATE, CR-20260616-02 | garage-mobile, gf-accounting, gf-sales | AC-1..6, CR-20260616-02 | MOBILE-E2E | Smoke | P1 | Tạo phiếu QT BH từ SO có BH trên mobile — full flow từ đầu đến cuối | 1. SO có BH đầy đủ phân bổ, chưa có phiếu QT<br>2. App mobile đang mở SO detail | 1. Tap "Tạo phiếu quyết toán" từ SO có BH<br>2. Kiểm tra panel "Tổng giá dịch vụ" 2 cột (CR-20260616-02) hiển thị đúng<br>3. Điền các field bắt buộc của phiếu QT<br>4. Tap "Xác nhận tạo phiếu quyết toán"<br>5. Quan sát kết quả và điều hướng | - App điều hướng về màn chi tiết phiếu QT BH<br>- 2 phiếu được tạo (BH + KH)<br>- Số tiền phân bổ trong chi tiết QT BH khớp với SO (không chênh lệch)<br>- Panel 2 cột mới không gây lỗi trong toàn bộ flow tạo QT | READY | |
| TC-W02-MOBILE-E2E-020 | FEAT-INS-STL-CREATE, CR-20260612-02 | garage-mobile, gf-sales | CR-20260612-02 | MOBILE-E2E | Smoke | P1 | Hoàn thành SO có BH âm TỪ MOBILE — bottom sheet cảnh báo ERR-INS-003 → confirm → SO hoàn thành | 1. SO có Tổng BH âm, chưa hoàn thành<br>2. Đang ở màn SO detail trên mobile | 1. Tap "Hoàn thành phiếu dịch vụ" trên mobile<br>2. Quan sát bottom sheet/popup xuất hiện<br>3. Đọc nội dung cảnh báo<br>4. Tap "Tiếp tục" (confirm, warn-and-allow)<br>5. Quan sát trạng thái SO | - Bottom sheet cảnh báo ERR-INS-003 xuất hiện (BH < 0)<br>- Nội dung cảnh báo tiếng Việt rõ nghĩa (không phải error key)<br>- Tap "Tiếp tục" → SO chuyển trạng thái "Hoàn thành" thành công<br>- Phiếu QT BH và KH được tạo từ flow mobile này<br>- Toàn bộ flow hoàn thành trên mobile (không cần web) | READY | |
| TC-W02-MOBILE-E2E-021 | FEAT-INS-STL-CREATE | garage-mobile, gf-accounting | AC-7 | MOBILE-E2E | Regression | P2 | Chi tiết phiếu QT BH mobile → "Chỉnh sửa" → form edit mở → lưu → số liệu cập nhật | 1. Phiếu QT BH đã tạo, chưa thanh toán<br>2. Màn chi tiết phiếu QT BH đang mở trên mobile | 1. Quan sát màn chi tiết QT BH — ghi nhớ 1 giá trị có thể sửa<br>2. Tap nút "Chỉnh sửa"<br>3. Form edit mở — thay đổi 1 trường<br>4. Tap "Lưu"<br>5. Quan sát chi tiết phiếu QT BH | - Tap "Chỉnh sửa" → form edit mở đúng, không lỗi<br>- Giá trị mới được lưu sau tap "Lưu"<br>- Chi tiết phiếu QT BH hiển thị giá trị mới ngay sau lưu<br>- Không mất dữ liệu khác trong phiếu | READY | |
| TC-W02-MOBILE-E2E-022 | FEAT-INS-DOSSIER-CREATE | garage-mobile, gf-accounting | AC-1..9 | MOBILE-E2E | Smoke | P1 | Dossier CREATE full flow trên mobile: điền Biên bản + GUQ + check 4 thẻ + Xuất → bộ hồ sơ hoàn chỉnh | 1. Phiếu QT BH tồn tại<br>2. Cả 4 thẻ docStatus FILL (cần điền form) hoặc READY (sẵn sàng check)<br>3. Tên KH đã prefill | 1. Tap "Lập hồ sơ bảo hiểm" từ chi tiết QT BH<br>2. Điền form Biên bản: BKS xe, Ngày lập, Địa điểm lập<br>3. Confirm form Biên bản → thẻ Biên bản READY<br>4. Điền form GUQ: CCCD, Ngày cấp, Địa chỉ, bằng chữ số tiền<br>5. Confirm form GUQ → thẻ GUQ READY<br>6. Check 4 checkbox (tất cả thẻ READY)<br>7. Tap "Xuất hồ sơ bảo hiểm"<br>8. Chờ xuất xong<br>9. Kiểm tra tab "Hồ sơ đã xuất" | - Cả 2 form (Biên bản + GUQ) điền được và save thành công<br>- 4 checkbox enable sau khi form đủ điều kiện<br>- "Xuất hồ sơ" thành công, success snackbar xuất hiện<br>- Tab "Hồ sơ đã xuất" hiển thị bộ hồ sơ mới với đủ 4 PDF cards<br>- Tên file đúng 4 loại (QT, BG, Biên bản, GUQ) | READY | |
| TC-W02-MOBILE-E2E-023 | FEAT-INS-DOSSIER-VIEW | garage-mobile, gf-accounting | AC-3..5 | MOBILE-E2E | Smoke | P1 | Dossier VIEW full flow on mobile: tap PDF card → PDF viewer mở → share/download thành công | 1. Bộ hồ sơ BH đã xuất với đủ 4 PDF<br>2. Tab "Hồ sơ đã xuất" đang mở | 1. Tap vào card "Phiếu quyết toán.pdf"<br>2. PDF viewer mở<br>3. Xem nội dung PDF<br>4. Tap nút Share / "Chia sẻ"<br>5. iOS Share sheet / Android share menu xuất hiện<br>6. Chọn "Lưu về máy" | - Tap card → viewer mở đúng (không lỗi 404/403, không blank)<br>- PDF render được, nội dung đọc được<br>- Tap Share → share sheet OS xuất hiện thành công<br>- "Lưu về máy" → file PDF tồn tại trong Photos/Downloads của device | READY | |
| TC-W02-MOBILE-E2E-024 | FEAT-INS-DOSSIER-CREATE | garage-mobile, gf-accounting | AC-11 | MOBILE-E2E | Full | P2 | Concurrent: 2 mobile users cùng tap "Xuất" trên cùng 1 phiếu QT → 409 conflict, chỉ 1 bộ được tạo | 1. 2 device mobile, cùng phiếu QT BH, cùng tenant<br>2. Cả 2 device đều ở màn tạo hồ sơ, đã check 4 thẻ | 1. Device A và Device B cùng mở màn tạo hồ sơ của cùng 1 phiếu QT BH<br>2. Cả 2 cùng tap "Xuất hồ sơ" gần đồng thời (<1 giây)<br>3. Quan sát kết quả trên cả 2 device<br>4. Kiểm tra tab "Hồ sơ đã xuất" số lượng bộ hồ sơ | - 1 device thành công (bộ hồ sơ được tạo, success snackbar)<br>- Device còn lại nhận 409 conflict → error message rõ nghĩa ("Bộ hồ sơ đã được tạo bởi người dùng khác" / tương tự)<br>- Tab hồ sơ chỉ có 1 bộ (không duplicate)<br>- App không crash trên device nhận 409 | READY | |

## 5. Changelog

| Ngày | Version | Thay đổi |
|---|---|---|
| 2026-06-19 | 4 | Restructure B: đổi scope từ "cross-platform sync only" → "full mobile E2E" với 3 lớp (core flows / sync / regression). Bổ sung A: TC-019..024 (6 TCs core flows): Tạo QT BH full flow mobile (TC-019), Hoàn thành SO BH âm từ mobile CR-20260612-02 (TC-020), Chỉnh sửa QT BH mobile (TC-021), Dossier CREATE full flow mobile (TC-022), Dossier VIEW tap→viewer→share (TC-023), Concurrent 2 user 409 conflict (TC-024) |
| 2026-06-19 | 3 | Bổ sung TC-012..018 (7 TCs) từ gap audit common-testcase-mobile-e2e §5/§12/§14/§4: Upload Biên bản E2E via native picker (TC-012); Upload fail 5xx → retry (TC-013); File type+size reject E2E (TC-014); App lifecycle background → data mất EC-1 (TC-015); 5xx xuất → re-enable → retry (TC-016); Mất mạng mid-export → recover (TC-017); Pull-to-refresh tab hồ sơ (TC-018) |
| 2026-06-19 | 2 | Bổ sung TC-008..011 (4 TCs) — regression tính năng cũ trên mobile: Hoàn thành SO không BH (cross-platform, không leak BH), Share-PDF phiếu QT BH (template CR-20260616-01 không vỡ action), Submit Tạo QT mobile (panel 2 cột CR-20260616-02 không vỡ submit), Thanh toán từ chi tiết QT BH (panel per-payer không che nút) |
| 2026-06-19 | 1 | Khởi tạo — 7 TCs cross-platform sync (web↔mobile) cho W02 insurance dossier features |
