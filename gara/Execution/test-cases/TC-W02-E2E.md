---
document_id: 'GMS-TC-W02-E2E'
type: test-case
wave: 'W02'
phase: 'A+B'
boundary: 'garage-web, gf-accounting, gf-sales, agg-garage-graph'
features:
  - FEAT-INS-STL-CREATE
  - CR-20260612-01
  - CR-20260612-02
  - CR-20260616-01
  - CR-20260616-02
  - FEAT-INS-DOSSIER-CREATE
  - FEAT-INS-DOSSIER-VIEW
status: ACTIVE
version: 1
owner: 'QA Authority'
last_reviewed: '2026-06-19'
figma_available: 'YES (web oracle dùng cho cross-screen verification)'
automation_candidate: false
---

# Test Case: W02 — End-to-End Flows

## 1. Thông tin chung

| Trường | Giá trị |
|---|---|
| Wave | W02 |
| Loại | E2E |
| Boundary | garage-web · gf-accounting · gf-sales · agg-garage-graph |
| Mục tiêu | Kiểm tra luồng xuyên suốt từ SO → QT → In phiếu → Hồ sơ BH → Tab xem |
| Môi trường | staging — full stack |
| Automation candidate | false |

## 2. Phạm vi

### Phase A E2E
- Luồng **SO với BH → Tạo QT** — kiểm tra số liệu nhất quán xuyên suốt (panel → phiếu QT → in)
- Luồng **Hoàn thành SO có BH âm** — popup warn → confirm → QT tiếp tục
- Luồng **Chi tiết phiếu QT BH vs KH** — tách payer đúng cột

### Phase B E2E
- Luồng **QT BH → Lập hồ sơ → Xuất → Tab xem** — happy path đầy đủ
- Luồng **Versioning** — xuất bộ 1 → xuất bộ 2 → tab hiển thị đúng thứ tự
- Luồng **Xuất subset** — chọn 2/4 tài liệu → verify chỉ 2 PDF được tạo
- **Cross-feature number consistency** — số tiền BH nhất quán từ phân bổ SO → panel QT → phiếu QT BH → PDF hồ sơ

## 3. Tóm tắt trạng thái

| Trạng thái | Số lượng |
|---|---|
| READY | 28 |
| SKIP | 0 |
| BLOCKED | 0 |
| **Tổng** | **28** |

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W02-E2E-001 | FEAT-INS-STL-CREATE | garage-web, gf-accounting | AC-1..5 | E2E | Smoke | P1 | Luồng SO có BH → Tạo phiếu QT → Panel hiển thị đúng số liệu | 1. SO có BH với phân bổ đầy đủ 5 khoản<br>2. User có quyền tạo QT | 1. Ghi nhớ số tiền phân bổ BH từng khoản trên SO<br>2. Mở màn Tạo phiếu QT từ SO đó<br>3. Kiểm tra từng khoản trong panel "Tổng giá dịch vụ" | - Số tiền từng khoản phân bổ BH trong panel khớp với phân bổ trên SO<br>- Tổng "Cân thanh toán" BH = tổng phân bổ BH<br>- Tổng "Cân thanh toán" KH = giá SO − tổng BH | READY | |
| TC-W02-E2E-002 | FEAT-INS-STL-CREATE, CR-20260612-01 | garage-web, gf-accounting | AC-5, CR-20260612-01 | E2E | Smoke | P1 | Số liệu nhất quán từ panel Tạo QT → Chi tiết phiếu QT BH | 1. SO có BH<br>2. Đã tạo phiếu QT BH | 1. Ghi nhớ tổng BH từ panel "Cân thanh toán" trên màn Tạo QT<br>2. Submit tạo phiếu QT BH<br>3. Mở chi tiết phiếu QT BH<br>4. So sánh tổng tiền BH | - Tổng tiền BH trên chi tiết phiếu QT BH = tổng từ panel Tạo QT<br>- Không có làm tròn hay chênh lệch hiển thị | READY | |
| TC-W02-E2E-003 | CR-20260616-01, CR-20260612-01 | garage-web, gf-accounting | CR-20260616-01, CR-20260612-01 | E2E | Regression | P1 | Số liệu nhất quán từ phiếu QT BH → Template in phiếu QT BH | 1. Đã có phiếu QT BH | 1. Ghi nhớ 5 khoản phân bổ BH từ chi tiết phiếu QT BH<br>2. Mở "In phiếu" của phiếu QT BH<br>3. So sánh từng khoản trên template in | - 5 khoản BH trên template in khớp với chi tiết phiếu QT BH<br>- Dấu trừ (−) hiển thị đúng trước từng khoản | READY | |
| TC-W02-E2E-004 | CR-20260612-01, CR-20260616-01 | garage-web, gf-accounting | CR-20260612-01, CR-20260616-01 | E2E | Regression | P1 | Số liệu nhất quán từ phiếu QT KH → Template in phiếu QT KH | 1. SO có BH<br>2. Đã có cả phiếu QT BH và phiếu QT KH | 1. Ghi nhớ 3 khoản tổng hợp từ chi tiết phiếu QT KH<br>2. Mở "In phiếu" phiếu QT KH<br>3. So sánh | - 3 khoản trên template in KH khớp với chi tiết phiếu QT KH<br>- Tổng phiếu QT KH = tổng KH sau phân bổ BH | READY | |
| TC-W02-E2E-005 | CR-20260612-02, FEAT-INS-STL-CREATE | garage-web, gf-accounting | CR-20260612-02 | E2E | Smoke | P1 | Luồng BH âm: Cảnh báo → Tiếp tục → Tạo QT thành công | 1. SO có tổng BH âm | 1. Mở SO có tổng BH âm<br>2. Nhấn "Hoàn thành SO" → popup cảnh báo xuất hiện<br>3. Nhấn "Tiếp tục"<br>4. Kiểm tra SO hoàn thành<br>5. Mở Tạo phiếu QT → panel hiển thị BH âm đúng | - SO hoàn thành thành công sau khi confirm<br>- Có thể tạo phiếu QT<br>- Panel hiển thị BH âm với màu đỏ<br>- Tổng "Cân thanh toán" BH hiển thị âm | READY | |
| TC-W02-E2E-006 | CR-20260612-02 | garage-web | CR-20260612-02 | E2E | Regression | P2 | Luồng BH âm: Cảnh báo → Hủy → SO vẫn active, có thể sửa | 1. SO có tổng BH âm | 1. Nhấn "Hoàn thành SO" → popup cảnh báo<br>2. Nhấn "Hủy"<br>3. Kiểm tra trạng thái SO<br>4. Sửa phân bổ BH để dương<br>5. Nhấn "Hoàn thành SO" lại | - SO không hoàn thành sau khi cancel<br>- SO vẫn có thể sửa phân bổ BH<br>- Sau khi sửa BH dương, hoàn thành SO thành công mà không có popup | READY | |
| TC-W02-E2E-007 | CR-20260616-02, FEAT-INS-STL-CREATE | garage-web | CR-20260616-02, AC-1..5 | E2E | Regression | P1 | Panel 2 cột nhất quán trên cả 3 màn SO Edit/Detail/Tạo QT | 1. SO có BH với dữ liệu phân bổ đầy đủ | 1. Mở SO Edit → ghi nhớ số liệu cột BH và cột KH<br>2. Mở SO Detail → so sánh<br>3. Mở Tạo QT → so sánh | - Số liệu cột BH và KH nhất quán trên cả 3 màn<br>- Không có chênh lệch giữa các màn | READY | |
| TC-W02-E2E-008 | FEAT-INS-DOSSIER-CREATE, FEAT-INS-STL-CREATE | garage-web, gf-accounting | AC-1 (Dossier), AC-5 (STL-CREATE) | E2E | Smoke | P1 | Luồng đầy đủ: QT BH → Lập hồ sơ BH → Xuất → Tab xem hồ sơ | 1. SO có BH, đã hoàn thành<br>2. Có phiếu QT BH hợp lệ | 1. Mở chi tiết phiếu QT BH<br>2. Click "Lập hồ sơ bảo hiểm"<br>3. Check cả 4 thẻ (hoặc subset)<br>4. Click "Xuất hồ sơ bảo hiểm"<br>5. Chờ xuất xong<br>6. Xem tab "Hồ sơ đã xuất" | - Luồng chạy xuyên suốt không bị lỗi<br>- Tab "Hồ sơ đã xuất" hiển thị đúng số PDF cards tương ứng số tài liệu đã check<br>- PDFs có thể xem và tải | READY | |
| TC-W02-E2E-009 | FEAT-INS-DOSSIER-CREATE, FEAT-INS-DOSSIER-VIEW | garage-web, gf-accounting | AC-9..12 | E2E | Regression | P1 | Versioning: Xuất bộ 1 → Xuất bộ 2 → Tab hiển thị đúng thứ tự | 1. Phiếu QT BH chưa có hồ sơ | 1. Xuất bộ hồ sơ v1 (ví dụ: 2 tài liệu)<br>2. Mở lại modal, xuất bộ v2 (ví dụ: 4 tài liệu)<br>3. Mở tab "Hồ sơ đã xuất"<br>4. Quan sát thứ tự và số lượng bộ | - Có 2 bộ hồ sơ trong tab<br>- Bộ v2 (mới nhất) ở đầu danh sách<br>- Bộ v1 phía dưới<br>- Mỗi bộ có số tài liệu đúng | READY | |
| TC-W02-E2E-010 | FEAT-INS-DOSSIER-CREATE, FEAT-INS-DOSSIER-VIEW | garage-web, gf-accounting | BR-INS-DOSSIER-004, AC-9 | E2E | Regression | P1 | Xuất subset (2/4 tài liệu) → Tab chỉ hiển thị 2 PDF cards | 1. Phiếu QT BH tồn tại | 1. Mở modal tạo hồ sơ<br>2. Uncheck Biên bản + Giấy ủy quyền<br>3. Check Phiếu QT + Phiếu báo giá<br>4. Xuất hồ sơ<br>5. Mở tab "Hồ sơ đã xuất" | - Bộ hồ sơ trong tab chỉ có 2 PDF cards (Phiếu QT + Phiếu báo giá)<br>- Không có card Biên bản hay Giấy ủy quyền<br>- Xuất subset không báo lỗi | READY | |
| TC-W02-E2E-011 | FEAT-INS-STL-CREATE, FEAT-INS-DOSSIER-CREATE | garage-web, gf-accounting | AC-4 (STL), AC-4 (Dossier) | E2E | Regression | P1 | Cross-feature: Số tiền BH nhất quán từ phân bổ SO → Panel QT → PDF Phiếu QT trong hồ sơ | 1. SO có BH với phân bổ cụ thể<br>2. Đã tạo QT BH và xuất hồ sơ | 1. Ghi nhớ số tiền phân bổ BH từ SO<br>2. Kiểm tra panel "Cân thanh toán" BH trên màn Tạo QT<br>3. Kiểm tra tổng trên chi tiết phiếu QT BH<br>4. Mở PDF Phiếu QT từ tab hồ sơ<br>5. So sánh số tiền BH trong PDF | - Số tiền BH nhất quán xuyên suốt tất cả bước<br>- Không có chênh lệch giữa phân bổ SO, panel, phiếu QT và PDF hồ sơ | READY | |
| TC-W02-E2E-012 | FEAT-INS-DOSSIER-CREATE | garage-web, gf-accounting | AC-10, AC-11 | E2E | Regression | P2 | Bộ cũ immutable sau khi xuất bộ mới | 1. Đã xuất bộ v1 | 1. Mở tab "Hồ sơ đã xuất" xem bộ v1<br>2. Tạo bộ v2<br>3. Quay lại tab, thử click bộ v1 để edit | - Bộ v1 không thể chỉnh sửa (không có nút Edit)<br>- Chỉ view/download được bộ v1<br>- Bộ v2 mới xuất hiển thị đúng phía trên | READY | |
| TC-W02-E2E-013 | FEAT-INS-DOSSIER-VIEW | garage-web, gf-accounting | AC-5 | E2E | Regression | P1 | Download PDF từ tab hồ sơ — file hợp lệ và đúng nội dung | 1. Đã xuất bộ hồ sơ có Phiếu QT | 1. Mở tab "Hồ sơ đã xuất"<br>2. Click download card Phiếu QT<br>3. Mở file tải về | - File PDF tải về thành công<br>- File mở được, không corrupt<br>- Nội dung PDF là Phiếu QT đúng (đúng settlement code, đúng số tiền) | READY | |
| TC-W02-E2E-014 | FEAT-INS-DOSSIER-CREATE | garage-web, gf-accounting | EC-2 | E2E | Regression | P2 | Concurrent export: 2 user xuất cùng phiếu QT BH → 409 conflict | 1. 2 user (account A: kế toán, account B: chủ garage) cùng đăng nhập, cùng mở modal tạo hồ sơ cho cùng 1 phiếu QT BH ID<br>2. Cả 2 đã điền đủ Biên bản + GUQ, đã check 4 thẻ, chưa click Xuất<br>**Kỹ thuật thực hiện:** dùng 2 browser session (Chrome incognito + Edge) hoặc 2 thiết bị khác nhau; countdown thủ công "3-2-1-Click" cùng lúc | 1. Cả 2 user đồng thời click "Xuất hồ sơ bảo hiểm" trong vòng <1 giây (nhờ countdown)<br>2. Quan sát response trên màn User A và User B<br>3. Vào tab "Hồ sơ đã xuất" kiểm tra số bộ được tạo | - Đúng 1 trong 2 request thành công: modal đóng, tab "Hồ sơ đã xuất" có 1 bộ mới<br>- Request còn lại nhận thông báo conflict (nội dung: "Hồ sơ vừa được người khác xuất. Vui lòng tải lại trang.")<br>- Chỉ 1 bộ hồ sơ xuất hiện trong DB (không tạo duplicate)<br>- Nếu cả 2 đều thấy success: **FAIL** (optimistic lock không hoạt động) | READY | |
| TC-W02-E2E-015 | FEAT-INS-DOSSIER-VIEW | garage-web, gf-accounting | AC-4, signed URL TTL | E2E | Regression | P2 | Xem PDF sau 5 phút — re-query để refresh signed URL | 1. Đã có bộ hồ sơ xuất trong tab<br>2. Đã giữ tab mở > 5 phút (300s TTL) | 1. Mở tab "Hồ sơ đã xuất"<br>2. Đợi > 5 phút không reload<br>3. Click xem PDF | - URL cũ (403) được tự động refresh<br>- PDF vẫn xem được sau khi re-query<br>- Không hiển thị lỗi 403 cho user | READY | |
| TC-W02-E2E-016 | FEAT-INS-STL-CREATE, FEAT-INS-DOSSIER-CREATE | garage-web, gf-accounting, gf-sales | AC-7 (STL) | E2E | Full | P3 | Snapshot số liệu panel QT — không bị ảnh hưởng sau khi xuất hồ sơ | 1. SO có BH<br>2. Đang ở màn Tạo QT, panel visible | 1. Ghi nhớ giá trị panel Tạo QT lúc ban đầu<br>2. Mở tab khác, xuất hồ sơ BH<br>3. Quay lại màn Tạo QT<br>4. Kiểm tra panel | - Giá trị panel Tạo QT không thay đổi sau khi xuất hồ sơ (snapshot cố định) | READY | |
| TC-W02-E2E-017 | FEAT-INS-DOSSIER-CREATE | garage-web, gf-accounting | AC-6, AC-7 | E2E | Full | P3 | Prefill Biên bản từ phiếu QT BH — tên KH, DN BH, số tiền bồi thường đúng | 1. Phiếu QT BH có đầy đủ thông tin | 1. Mở modal tạo hồ sơ<br>2. Mở thẻ Biên bản nghiệm thu<br>3. Kiểm tra từng field prefill | - Tên KH: lấy đúng từ phiếu QT BH (không phải SO hay phiếu KH)<br>- Thông tin garage: lấy từ hồ sơ garage<br>- Số xe, DN BH, số tiền bồi thường: lấy từ phiếu QT BH | READY | |
| TC-W02-E2E-018 | FEAT-INS-DOSSIER-CREATE, FEAT-INS-DOSSIER-VIEW | garage-web, gf-accounting | AC-9, EC-1 | E2E | Regression | P2 | Đóng modal giữa chừng → Mở lại → Xuất → Hồ sơ OK | 1. Phiếu QT BH tồn tại | 1. Mở modal tạo hồ sơ, điền Biên bản<br>2. Click "Huỷ bỏ" (dữ liệu mất, EC-1)<br>3. Mở lại modal<br>4. Điền lại Biên bản<br>5. Xuất hồ sơ<br>6. Kiểm tra tab | - Lần mở lại: modal trống (no draft)<br>- Sau khi điền lại và xuất: hồ sơ tạo thành công<br>- Tab hiển thị bộ hồ sơ đúng | READY | |
| TC-W02-E2E-019 | FEAT-INS-DOSSIER-CREATE | garage-web, gf-accounting | AC-14, INS_DOSSIER_PDF_GENERATION_FAILED | E2E | Full | P3 | Lỗi PDF generation — xuất thất bại, retry thành công | 1. Mock PDF service trả lỗi lần 1, thành công lần 2 | 1. Click "Xuất hồ sơ"<br>2. Quan sát lần 1: lỗi xuất hiện (INS_DOSSIER_PDF_GENERATION_FAILED)<br>3. Click retry<br>4. Quan sát lần 2: thành công | - Lần 1: hiển thị thông báo lỗi rõ ràng, không crash<br>- Retry: xuất thành công<br>- Tab "Hồ sơ đã xuất" cập nhật với bộ hồ sơ vừa xuất | READY | |
| TC-W02-E2E-020 | FEAT-INS-DOSSIER-CREATE, FEAT-INS-STL-CREATE | garage-web, gf-accounting | AC-8 (phân quyền) | E2E | Regression | P2 | Phân quyền E2E: user không có quyền BH không thấy panel + nút lập hồ sơ | 1. User không có role BH<br>2. SO có BH, phiếu QT BH tồn tại | 1. Đăng nhập user không có quyền BH<br>2. Mở màn Tạo QT từ SO có BH<br>3. Mở chi tiết phiếu QT BH | - Panel "Tổng giá dịch vụ" không hiển thị phần BH<br>- Nút "Lập hồ sơ bảo hiểm" không visible<br>- Tab hồ sơ không hiển thị<br>- Không lộ thông tin BH ra ngoài phân quyền | READY | |

| TC-W02-E2E-021 | FEAT-INS-STL-CREATE, CR-20260616-01 | garage-web, gf-accounting | AC-2, CR-20260616-01 | E2E | Smoke | P1 | Luồng SO không có BH: Panel rút gọn → Tạo QT → In phiếu baseline (không có khoản BH) | 1. SO không có liên kết bảo hiểm<br>2. User có quyền tạo QT | 1. Mở màn Tạo phiếu QT từ SO không BH<br>2. Xác nhận panel rút gọn (1 cột KH, không có Phân bổ BH, Cân thanh toán 2 dòng)<br>3. Tạo phiếu QT (1 phiếu — loại KH)<br>4. Mở chi tiết phiếu QT → không có section "Phân bổ BH"<br>5. Mở "In phiếu" → template baseline | - Panel rút gọn đúng (không ẩn hoàn toàn, không có cột BH)<br>- Tạo thành công phiếu QT KH duy nhất (không tạo phiếu BH)<br>- Template in = baseline: không có dấu trừ khoản BH, không có section phân bổ BH<br>- Luồng hoàn thành không lỗi | READY | |
| TC-W02-E2E-022 | FEAT-INS-STL-CREATE | garage-web, gf-accounting | EC-3, AC-4, AC-5 | E2E | Full | P2 | Luồng SO có BH nhưng tất cả 5 khoản = 0: Panel vẫn hiển thị, BH = Cộng sau VAT BH, tạo QT được | 1. SO có BH với tất cả 5 khoản phân bổ = 0 | 1. Mở Tạo phiếu QT từ SO có BH nhưng 5 khoản = 0<br>2. Kiểm tra panel hiển thị đủ 5 khoản (EC-3)<br>3. Xác nhận "Bảo hiểm thanh toán" = "Cộng sau VAT BH" (không có điều chỉnh)<br>4. Tạo phiếu QT BH + KH<br>5. Kiểm tra chi tiết phiếu QT BH | - Panel vẫn hiển thị 5 khoản phân bổ với giá trị 0<br>- "Bảo hiểm thanh toán" = "Cộng sau VAT BH"<br>- Tạo thành công 2 phiếu QT (BH + KH)<br>- Chi tiết phiếu QT BH không bị lỗi | READY | |
| TC-W02-E2E-023 | FEAT-INS-STL-CREATE | garage-web, gf-accounting | AC-4, AC-5 | E2E | Full | P1 | Cross-verify: Công thức tính BH từ panel → xác nhận trên chi tiết phiếu QT BH | 1. SO có BH với các khoản điều chỉnh khác 0<br>2. Đã tạo phiếu QT BH | 1. Ghi nhớ Cộng sau VAT BH, CK VT, CK CDV, Giảm trừ, Khấu hao, Khấu trừ từ panel Tạo QT<br>2. Tính tay: BH = Cộng sau VAT BH − CK VT − CK CDV − Giảm trừ − Khấu hao − Khấu trừ<br>3. So sánh với "Bảo hiểm thanh toán" trên panel<br>4. Mở chi tiết phiếu QT BH → kiểm tra tổng tiền BH | - Giá trị tính tay = "Bảo hiểm thanh toán" trên panel (không có sai số)<br>- Tổng tiền BH trên chi tiết phiếu QT BH = giá trị tính tay<br>- Số liệu nhất quán end-to-end | READY | |

#### Regression — Tính năng cũ (baseline features) trên các màn bị W02 chạm vào

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W02-E2E-024 | CR-20260612-02 | garage-web, gf-sales | CR-20260612-02, FEAT-SO-DETAIL AC-16 | E2E | Regression | P1 | Hoàn thành SO không có BH — popup baseline KHÔNG có cảnh báo BH âm | 1. SO không có liên kết bảo hiểm<br>2. SO đang ở trạng thái cho phép hoàn thành | 1. Mở SO không có BH<br>2. Click "Hoàn thành phiếu dịch vụ"<br>3. Quan sát nội dung popup<br>4. Click "Xác nhận" | - Popup hoàn thành xuất hiện với nội dung baseline<br>- KHÔNG có dòng cảnh báo BH âm (ERR-INS-003)<br>- Nút "Xác nhận" enable ngay, không có warning<br>- SO chuyển trạng thái "Hoàn thành" thành công<br>- CR-20260612-02 không làm vỡ luồng SO không BH | READY | |
| TC-W02-E2E-025 | CR-20260616-02, FEAT-INS-STL-CREATE | garage-web, gf-accounting | CR-20260616-02, AC-1..6 | E2E | Regression | P1 | Màn Tạo phiếu QT (panel 2 cột mới) → Submit tạo phiếu QT thành công | 1. SO có BH đầy đủ<br>2. Đang ở màn Tạo phiếu QT (panel 2 cột CR-20260616-02 đã hiển thị) | 1. Mở màn Tạo phiếu QT từ SO có BH<br>2. Xác nhận panel "Tổng giá dịch vụ" hiển thị 2 cột (CR-20260616-02)<br>3. Điền các field bắt buộc của phiếu QT (ngày tạo, người nhận...)<br>4. Click "Xác nhận tạo phiếu quyết toán"<br>5. Quan sát kết quả | - Phiếu QT BH + phiếu QT KH được tạo thành công<br>- Không có lỗi liên quan đến panel component mới (2 cột)<br>- Redirect về chi tiết phiếu QT BH<br>- Panel 2 cột mới không làm vỡ nút submit | READY | |
| TC-W02-E2E-026 | CR-20260616-01 | garage-web, gf-accounting | CR-20260616-01, BR-INS-STL-DET-005 | E2E | Regression | P1 | Chi tiết phiếu QT BH → click "In phiếu" → print preview mở đúng (template mới không lỗi render) | 1. Phiếu QT BH đã tạo<br>2. Đang ở màn chi tiết phiếu QT BH | 1. Mở chi tiết phiếu QT BH<br>2. Click nút "In phiếu"<br>3. Quan sát print preview / dialog in | - Print preview mở ra thành công, không có lỗi render<br>- Template in có section "Phân bổ bảo hiểm" 5 khoản dấu − (CR-20260616-01)<br>- Nút "In" / "Xuất PDF" trong preview hoạt động<br>- CR-20260616-01 không làm vỡ action "In phiếu" | READY | |
| TC-W02-E2E-027 | CR-20260612-01 | garage-web, gf-accounting, gf-sales | CR-20260612-01, FEAT-INS-STL-DETAIL | E2E | Regression | P1 | Chi tiết phiếu QT BH → nút "Thanh toán" visible và flow mở được sau W02 panel per-payer | 1. Phiếu QT BH đã tạo và chưa thanh toán<br>2. Đang ở màn chi tiết phiếu QT BH | 1. Mở chi tiết phiếu QT BH<br>2. Quan sát panel per-payer (CR-20260612-01) hiển thị đúng<br>3. Tìm nút "Thanh toán" trên cùng màn<br>4. Click nút "Thanh toán"<br>5. Quan sát | - Nút "Thanh toán" visible, không bị panel per-payer mới che khuất<br>- Click "Thanh toán" → dialog/flow thanh toán mở được<br>- Panel per-payer (CR-20260612-01) không làm vỡ flow thanh toán baseline | READY | |
| TC-W02-E2E-028 | CR-20260612-01 | garage-web, gf-accounting | CR-20260612-01, FEAT-INS-STL-DETAIL | E2E | Regression | P2 | Chi tiết phiếu QT BH → nút "Chỉnh sửa" tap được, form mở, lưu thành công sau W02 | 1. Phiếu QT BH ở trạng thái có thể chỉnh sửa<br>2. Đang ở màn chi tiết phiếu QT BH | 1. Mở chi tiết phiếu QT BH<br>2. Click nút "Chỉnh sửa"<br>3. Form chỉnh sửa mở<br>4. Sửa một field (ví dụ: ngày tạo phiếu)<br>5. Click "Lưu" | - Nút "Chỉnh sửa" accessible trên màn chi tiết QT BH sau khi W02 thêm panel per-payer<br>- Form chỉnh sửa mở không bị lỗi<br>- Sau "Lưu": chi tiết phiếu QT cập nhật đúng field đã sửa<br>- Panel per-payer vẫn hiển thị đúng sau khi save | READY | |

## 5. Changelog

| Ngày | Version | Thay đổi |
|---|---|---|
| 2026-06-19 | 3 | Bổ sung TC-024..028 (5 TCs) — regression tính năng cũ bị W02 chạm vào: Hoàn thành SO không BH (popup baseline không có ERR-INS-003), Submit Tạo QT sau panel 2 cột mới, In phiếu QT BH (template mới không vỡ action), Thanh toán QT BH (panel per-payer không che nút), Chỉnh sửa QT BH (panel per-payer không block form) |
| 2026-06-19 | 2 | Bổ sung TC-021..023: luồng SO không BH (panel rút gọn → QT KH baseline → in không có khoản BH), luồng 5 khoản = 0 (EC-3 vẫn tạo QT được), cross-verify công thức BH end-to-end |
| 2026-06-19 | 1 | Khởi tạo — 20 TCs phủ Phase A E2E (SO→QT→In, BH âm, per-payer) và Phase B E2E (QT BH→Hồ sơ→Xuất→Tab, versioning, subset, cross-feature number consistency) |
