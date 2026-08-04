---
document_id: 'GMS-TC-W01-MOBILE-UI'
type: test-case
parent: 'Execution/test-cases/TEST-CASE-REGISTRY.md'
status: ACTIVE
version: 1
boundary: 'garage-mobile'
wave: 'W01'
owner: 'QA Authority'
last_reviewed: '2026-06-11'
---

# Test Case Template - W01: Mobile UI

> Split từ `TC-W01-UI.md` — gom các TC mobile-only (Flutter / BLoC / SegmentedButton / Android API 28+ / iOS 14+). TC ID giữ nguyên prefix `TC-W01-UI-NNN` từ file gốc.

---

## 1. General Info

| Field         | Value                                                      |
| ------------- | ---------------------------------------------------------- |
| Document ID   | `GMS-TC-W01-MOBILE-UI`                                     |
| Wave          | W01                                                        |
| Boundary(ies) | `garage-mobile`                                            |
| Feature(s)    | `FEAT-INS-SO-ADJUSTMENT`, `FEAT-INS-STL-DETAIL`            |
| Owner         | QA Authority                                               |
| Last Reviewed | 2026-06-11                                                 |
| Work Package  | `Execution/work-packages/PKG-W01-insurance-foundation.md`  |

---

## 2. Scope

### In Scope

- Mobile inline Card section "Phân bổ quyết toán bảo hiểm" trên SO Edit/Detail
- SegmentedButton mode VNĐ/% cho 3 trường hỗ trợ
- BLoC realtime preview (InsuranceAllocationCubit)
- Mobile native: soft keyboard, hardware Back, orientation, offline, touch target, background resume
- Toggle off BH=Có → BH=Không trên mobile
- Mobile chi tiết phiếu QT BH: AppBar + 4 tab + panel + conditional display + nút Tạo hồ sơ disabled

### Out of Scope

- Web UI — xem `TC-W01-UI.md`
- Cross-platform sync — xem `TC-W01-MOBILE-E2E.md`
- Mobile security (permission) — xem `TC-W01-SECURITY.md`

### Test Environment & Data

| Item          | Required Data / Setup                                                              | Notes                                            |
| ------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------ |
| garage-mobile | Android API 28+ + iOS 14+ device thật; Figma mobile node 319-65571 + 81-39472      | Test [Mobile]                                    |
| SO Edit BH=Có | SO toggle BH=Có, ≥2 PT BH + 1 DV BH + 1 PT KH + 1 DV KH                            | Input chính                                      |
| Phiếu QT BH   | `#SET-W01-INS-001` đã tồn tại                                                       | Chi tiết QT mobile                               |
| Phiếu QT BH CANCEL | `#SET-W01-INS-CANCEL`                                                          | Conditional nút Tạo hồ sơ                        |
| Phiếu QT KH   | `#SET-W01-KH-001` — cùng cặp                                                       | Conditional display                               |

---

## 3. Status Summary

| Coverage Mode | Total | Status Summary |
| ------------- | ----- | -------------- |
| Automated     | N/A   | —              |
| Manual        | 40    | 40 READY       |

---

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W01-UI-066 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-0, BR-INS-SO-ADJ-001 | UI | Wave | P1 | [Mobile] SO Create — InsuranceAllocationSection KHÔNG xuất hiện | App device; kế toán garage-a | 1. Mở màn Tạo phiếu dịch vụ.<br>2. Scroll toàn bộ. | - Section KHÔNG có trên Create.<br>- Không crash. | READY | N/A |
| TC-W01-UI-067 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-1 | UI | Wave | P1 | [Mobile] SO Edit + BH=Có → section inline Card hiển thị | App device; SO Edit BH=Có | 1. Mở SO Chỉnh sửa.<br>2. Tìm section. | - Section dạng inline Card.<br>- Đủ 5 trường nhập. | READY | N/A |
| TC-W01-UI-068 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-1 | UI | Wave | P1 | [Mobile] SO Edit + BH=Không → section ẩn | App device; SO Edit toggle BH=Không | 1. Toggle BH=Không.<br>2. Quan sát. | - Section ẩn (widget tree không render). | READY | N/A |
| TC-W01-UI-069 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-1 | UI | Wave | P1 | [Mobile] SO Detail → section read-only | App; SO Detail đã lưu allocation | 1. Mở SO Chi tiết. | - Section read-only (không TextField).<br>- 5 khoản đúng giá trị. | READY | N/A |
| TC-W01-UI-070 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | §2.2 PKG | UI | Wave | P1 | [Mobile] Section là inline Card — KHÔNG bottom sheet | App; SO Edit BH=Có; Figma node 319-65571 | 1. Mở SO Edit, quan sát component. | - Render dạng Card trong body màn.<br>- Không drag handle / overlay. | READY | N/A |
| TC-W01-UI-071 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | §2.2 PKG | UI | Wave | P2 | [Mobile] Section mount đúng ServiceOrderCreationPage khi isEdit=true | App; SO Edit | 1. Mở SO Chỉnh sửa.<br>2. Xác nhận host page. | - Section có trong widget tree khi isEdit=true.<br>- KHÔNG có khi Create. | READY | N/A |
| TC-W01-UI-072 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | §5.1 PKG, UI-BC05 | UI | Wave | P2 | [Mobile] Render đúng Android API 28+ và iOS 14+ | Android 28+ + iOS 14+ device | 1. Chạy SO Edit trên cả 2 platform.<br>2. So sánh layout. | - Render không lỗi trên cả 2.<br>- Không layout shift / overflow. | READY | N/A |
| TC-W01-UI-073 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-3, BR-INS-SO-ADJ-002 | UI | Wave | P1 | [Mobile][CK VT] SegmentedButton default = "Số tiền" | App; SO Edit BH=Có | 1. Quan sát SegmentedButton cạnh field CK VT. | - Mặc định chọn "Số tiền" (không %). | READY | N/A |
| TC-W01-UI-074 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-3 | UI | Wave | P1 | [Mobile][CK VT] Tap "%" → input chuyển sang % | App; SO Edit BH=Có | 1. Tap "%".<br>2. Nhập 3. | - Mode đổi sang %.<br>- Preview BH giảm = 3% × cơ sở VT BH. | READY | N/A |
| TC-W01-UI-075 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-14 | UI | Wave | P1 | [Mobile][CK VT] Nhập âm → error inline | App; SO Edit BH=Có | 1. Nhập -100.<br>2. Blur. | - Error inline dưới field. | READY | N/A |
| TC-W01-UI-076 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-14 | UI | Wave | P1 | [Mobile][CK VT] Nhập % > 100 → error inline | App; SO Edit BH=Có; mode % | 1. Mode %, nhập 110.<br>2. Blur. | - Error inline "không thể lớn hơn 100%". | READY | N/A |
| TC-W01-UI-077 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-7, BR-INS-SO-ADJ-003 | UI | Wave | P1 | [Mobile][Khấu trừ BH] KHÔNG có SegmentedButton | App; SO Edit BH=Có | 1. Quan sát field "Khấu trừ bảo hiểm". | - Chỉ TextField số tiền VNĐ, không SegmentedButton. | READY | N/A |
| TC-W01-UI-078 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-14 | UI | Wave | P2 | [Mobile][Khấu hao per-line] Keyboard số, nhập âm → error | App; SO Edit có PT BH | 1. Tap field % dòng PT-1.<br>2. Keyboard số.<br>3. Nhập -5, blur. | - Keyboard numeric.<br>- Error inline cho PT-1. | READY | N/A |
| TC-W01-UI-079 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-8 | UI | Wave | P2 | [Mobile][Khấu hao] "Áp dụng tất cả" set đồng loạt PT BH | App; SO Edit có 3 PT BH | 1. Nhập 5% header.<br>2. Tap "Áp dụng tất cả". | - Cả 3 PT BH = 5%. | READY | N/A |
| TC-W01-UI-080 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-11, BR-INS-SO-ADJ-007 | UI | Wave | P1 | [Mobile][BLoC] Nhập → Cubit emit state → preview realtime | App; SO Edit BH=Có | 1. Nhập 5.000.000 vào CK VT.<br>2. Quan sát preview BH/KH. | - InsuranceAllocationCubit emit state mới.<br>- Preview realtime (không cần Save). | READY | N/A |
| TC-W01-UI-081 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | BR-INS-SO-ADJ-005 | UI | Wave | P1 | [Mobile][BLoC] Kết quả đúng ví dụ epic 197.68tr/35.72tr | App; SO Edit dữ liệu ví dụ epic | 1. Nhập đủ 5 khoản theo ví dụ.<br>2. Đọc preview. | - BH=197.680.000đ, KH=35.720.000đ, Tổng=233.400.000đ. | READY | N/A |
| TC-W01-UI-082 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-12 | UI | Wave | P2 | [Mobile][BLoC] BH âm → inline warning | App; SO Edit khoản giảm > BH | 1. Nhập khoản vượt Cộng sau VAT BH. | - Warning inline "BH thanh toán không thể âm". | READY | N/A |
| TC-W01-UI-083 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-13 | UI | Wave | P1 | [Mobile][BLoC] Save thành công → Detail read-only | App; SO Edit BH=Có đã nhập allocation | 1. Tap Save.<br>2. Chờ response.<br>3. Navigate Detail. | - Save thành công.<br>- Detail read-only. | READY | N/A |
| TC-W01-UI-084 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | UI-MB01 | UI | Wave | P2 | [Mobile] Soft keyboard không che field đang nhập | App; SO Edit BH=Có | 1. Tap vào field cuối section → keyboard bật. | - Keyboard không che field.<br>- Tự scroll field vào vùng nhìn thấy. | READY | N/A |
| TC-W01-UI-085 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | UI-MB02, UI-FB01 | UI | Wave | P2 | [Mobile] Hardware Back (Android) khi form dirty → cảnh báo | App Android; SO Edit đã sửa chưa lưu | 1. Nhập allocation.<br>2. Bấm hardware Back. | - Cảnh báo nếu form dirty.<br>- Không thoát app ngoài ý muốn. | READY | N/A |
| TC-W01-UI-086 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | UI-MB03 | UI | Wave | P2 | [Mobile] Xoay ngang/dọc → không vỡ layout, không mất data | App; SO Edit đang nhập allocation | 1. Nhập vài khoản.<br>2. Xoay ngang rồi dọc. | - Layout không vỡ.<br>- Data đang nhập không mất. | READY | N/A |
| TC-W01-UI-087 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | UI-MB06 | UI | Wave | P2 | [Mobile] Offline khi nhập → không crash, snackbar khi Save | App; SO Edit BH=Có; tắt mạng | 1. Tắt mạng.<br>2. Tiếp tục nhập → cố Save. | - Không crash, nhập local OK.<br>- SnackBar "Không có kết nối mạng" khi Save. | READY | N/A |
| TC-W01-UI-088 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | UI-MB06, UI-FB03 | UI | Wave | P2 | [Mobile] Mất mạng đang save → snackbar lỗi, data không mất | App; SO Edit; Save rồi tắt mạng | 1. Nhập allocation → Save.<br>2. Tắt mạng khi đang submit. | - SnackBar lỗi.<br>- Data nhập vẫn còn (không reset 0). | READY | N/A |
| TC-W01-UI-089 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | UI-MB08 | UI | Wave | P3 | [Mobile] Touch target SegmentedButton/nút đủ lớn, không bấm nhầm | App; SO Edit BH=Có | 1. Tap SegmentedButton + nút "Áp dụng tất cả" sát nhau. | - Touch target ≥44px, không bấm nhầm nút cạnh. | READY | N/A |
| TC-W01-UI-095 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | UI-MB07 | UI | Wave | P3 | [Mobile] App vào background rồi resume → giữ state form | App; SO Edit đang nhập allocation | 1. Nhập vài khoản.<br>2. Đưa app background → mở lại. | - Giữ state form, không logout/mất data (theo spec). | READY | N/A |
| TC-W01-UI-101 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-1, AC-13 | UI | Wave | P1 | [Mobile][Toggle off] SO đã lưu BH=Có → toggle Không → Save → Detail không section, allocation discard | App device; SO Edit BH=Có có allocation đã lưu | 1. Toggle BH=Không.<br>2. Tap Save.<br>3. Navigate Detail. | - Section ẩn ngay khi toggle.<br>- Save thành công.<br>- Detail KHÔNG có section, allocation cũ bị discard. | READY | N/A |
| TC-W01-UI-102 | FEAT-INS-SO-ADJUSTMENT | garage-mobile | AC-1, EC-3 | UI | Wave | P2 | [Mobile][Toggle off→on] Sau lưu BH=Không → Edit → toggle Có lại → fields reset 0 (no stale) | App; SO đã lưu BH=Không (từng có allocation) | 1. Mở SO Edit.<br>2. Toggle BH=Có.<br>3. Kiểm tra 5 trường. | - Section hiện lại, 5 trường = 0.<br>- KHÔNG restore giá trị cũ đã xoá. | READY | N/A |
| TC-W01-UI-147 | FEAT-INS-STL-DETAIL | garage-mobile | AC-1, AC-4 | UI | Wave | P1 | [Mobile][Layout] AppBar mã phiếu + 4 tab đúng tên | App trên device; phiếu `#SET-W01-INS-001` | 1. Mở phiếu QT BH trên app.<br>2. Quan sát AppBar và TabBar. | - AppBar: mã phiếu + back + action buttons.<br>- 4 tab đúng tên theo AC-4. | READY | N/A |
| TC-W01-UI-148 | FEAT-INS-STL-DETAIL | garage-mobile | AC-4 | UI | Wave | P1 | [Mobile][Tab] Tab "Bảng chi phí" active mặc định | App; phiếu `#SET-W01-INS-001` | 1. Mở phiếu QT BH.<br>2. Quan sát tab active. | - Tab "Bảng chi phí" active ngay khi mở. | READY | N/A |
| TC-W01-UI-149 | FEAT-INS-STL-DETAIL | garage-mobile | AC-4 | UI | Wave | P2 | [Mobile][Tab] Switching/swipe tab hoạt động đúng | App; phiếu `#SET-W01-INS-001` | 1. Swipe hoặc tap sang từng tab.<br>2. Quan sát nội dung. | - Mỗi tab: nội dung đúng tab hiển thị.<br>- Không crash khi switch nhanh. | READY | N/A |
| TC-W01-UI-150 | FEAT-INS-STL-DETAIL | garage-mobile | AC-6, DEV NOTE PKG | UI | Wave | P1 | [Mobile][Panel] Panel "Tổng giá DV" render khi payerType=INSURANCE | App; phiếu QT BH `#SET-W01-INS-001` | 1. Mở tab "Bảng chi phí" phiếu QT BH. | - InsuranceAllocationPanel + TotalServicePricePanel hiển thị.<br>- BH=197.680.000đ, KH=35.720.000đ. | READY | N/A |
| TC-W01-UI-151 | FEAT-INS-STL-DETAIL | garage-mobile | DEV NOTE PKG §2.2 | UI | Wave | P1 | [Mobile][Conditional] Phiếu KH — 2 khối BH ẩn, layout mới render | App; phiếu QT KH `#SET-W01-KH-001` | 1. Mở phiếu QT **KH** trên app.<br>2. Kiểm tra layout. | - AppBar + 4 tab + body layout mới render đầy đủ.<br>- InsuranceAllocationPanel + TotalServicePricePanel KHÔNG hiển thị. | READY | N/A |
| TC-W01-UI-152 | FEAT-INS-STL-DETAIL | garage-mobile | DEV NOTE PKG §2.2 | UI | Wave | P1 | [Mobile][Conditional] Phiếu KH — nút "Tạo hồ sơ BH" KHÔNG có | App; phiếu QT KH | 1. Quan sát AppBar action menu phiếu QT KH. | - Nút "+ Tạo hồ sơ bảo hiểm" KHÔNG có trong action bar. | READY | N/A |
| TC-W01-UI-153 | FEAT-INS-STL-DETAIL | garage-mobile | AC-13, BR-INS-STL-DET-004 | UI | Wave | P1 | [Mobile][Nút Tạo hồ sơ] Disabled W01 | App; phiếu QT BH DRAFT | 1. Quan sát nút "+ Tạo hồ sơ bảo hiểm" trong AppBar action. | - Nút disabled (greyed). | READY | N/A |
| TC-W01-UI-154 | FEAT-INS-STL-DETAIL | garage-mobile | AC-13 | UI | Wave | P1 | [Mobile][Nút Tạo hồ sơ] Tap disabled → SnackBar "Wave 2" | App; phiếu QT BH DRAFT | 1. Tap vào nút "+ Tạo hồ sơ BH" (disabled). | - SnackBar "Tính năng sẽ available ở Wave 2".<br>- Tự đóng sau ~3 giây. | READY | N/A |
| TC-W01-UI-155 | FEAT-INS-STL-DETAIL | garage-mobile | AC-13 | UI | Wave | P2 | [Mobile][Nút Tạo hồ sơ] KHÔNG hiện trên phiếu CANCEL | App; phiếu QT BH CANCEL | 1. Mở phiếu QT BH CANCEL.<br>2. Quan sát action bar. | - Nút "+ Tạo hồ sơ BH" KHÔNG có. | READY | N/A |
| TC-W01-UI-156 | FEAT-INS-STL-DETAIL | garage-mobile | AC-4 | UI | Wave | P2 | [Mobile][Layout] 4 tab render đúng Android 28+ và iOS 14+ | Android 28+ device + iOS 14+ device | 1. Mở phiếu QT BH trên cả 2 platform. | - 4 tab render không lỗi trên Android + iOS.<br>- Không overflow/layout shift. | READY | N/A |
| TC-W01-UI-157 | FEAT-INS-STL-DETAIL | garage-mobile | UI-MB06, UI-ST07 | UI | Wave | P2 | [Mobile][Network] Offline → empty state thân thiện, không crash | App; tắt mạng rồi mở phiếu | 1. Tắt mạng.<br>2. Mở phiếu QT BH lần đầu. | - App không crash.<br>- Empty state hoặc "Không có kết nối" hiển thị. | READY | N/A |
| TC-W01-UI-158 | FEAT-INS-STL-DETAIL | garage-mobile | UI-ST03 | UI | Wave | P2 | [Mobile][Network] Server 500 khi load → lỗi thân thiện | App; server mock 500 | 1. Mở phiếu QT BH khi server trả 500. | - Thông báo lỗi thân thiện ("Đã có lỗi xảy ra").<br>- Không crash, không stack trace. | READY | N/A |
| TC-W01-UI-159 | FEAT-INS-STL-DETAIL | garage-mobile | UI-MB03 | UI | Wave | P3 | [Mobile][Orientation] Xoay ngang/dọc — layout 4 tab không vỡ | App; phiếu `#SET-W01-INS-001` | 1. Xoay device ngang rồi dọc khi đang ở từng tab. | - Layout không vỡ, không mất dữ liệu hiển thị.<br>- 4 tab vẫn truy cập được. | READY | N/A |

---

## 5. Changelog

| Date     | Change                                              | Author     |
| -------- | --------------------------------------------------- | ---------- |
| 2026-06-11 | Split từ `TC-W01-UI.md` — extract 40 TC mobile-only: TC-W01-UI-066..089 (24 SO-ADJ Mobile), TC-W01-UI-095 (background resume), TC-W01-UI-101..102 (toggle off Mobile), TC-W01-UI-147..159 (13 STL Mobile). TC ID + nội dung row giữ nguyên (không renumber). | QA Authority |
