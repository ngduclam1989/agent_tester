---
type: business-rules
artifact_kind: business-rules
status: ACTIVE
version: 2
tier: T1
owner_authority: Business Authority
boundary: "cross-cutting"
scope: "multi-system (Garage + Vendor + Express + ...)"
source: "Confluence /wiki/spaces/CE/pages/13828374/System+Rules+-+Common+Business+Rule"
last_reviewed: "2026-07-14"
supersedes: "none"
---

# BR-COMMON — Common Business Rules

> Rule dùng chung toàn hệ thống, áp cho nhiều phân hệ (Garage, Vendor, Express, …).
> File này KHÔNG chỉ áp riêng Garage — một số rule có thể không apply hoặc apply 1 phần cho Garage. Khi cite trong FEAT/BR Garage cần kiểm tra applicability trước.

---

## §0 Nguồn & Nguyên tắc

**Nguồn gốc:** Confluence `/wiki/spaces/CE/pages/13828374/System+Rules+-+Common+Business+Rule` — org-level shared rule registry.

**Nguyên tắc dùng file này:**

1. **BA agent tham chiếu khi viết Product docs** (PRD/EP/FEAT/BR/UX-Flow): nếu rule cần dùng trùng scope 1 rule ở đây → cite `[BR-COMMON#SYS-RETRY-NNN]` thay vì viết lại toàn bộ.
2. **KHÔNG copy-paste rule content** vào FEAT/BR mới — chỉ cite. Nếu rule chưa cover case cụ thể của feature → viết BR feature-specific ở FEAT hoặc BR boundary của mình.
3. **Extensible**: rule mới từ Confluence append theo số tăng dần (SYS-RETRY-040, 041, …). Rule Garage-specific dùng prefix riêng (VD `GR-COMMON-NNN`) đặt ở section §3 (chưa có).
4. **Applicability cho Garage**: nếu rule không áp Garage (chỉ Vendor/Express) — BA agent bỏ qua khi cite. File chưa filter — sẽ bổ sung cột `applies_to_garage` ở version sau khi Business Authority review.

**Sync policy:**
- File này mirror Confluence — khi Confluence update, file update theo (manual sync, không auto).
- Nếu Confluence và file lệch → Confluence là source-of-truth.
- Mỗi lần sync → bump version + last_reviewed + Change Log.

---

## §1 Cách BA agent sử dụng

| Bước | Hành động |
|---|---|
| 1 | Trước khi viết BR mới cho FEAT, đọc `BR-COMMON` tìm rule đã tồn tại phủ scope tương tự |
| 2 | Nếu có → cite `[BR-COMMON#SYS-RETRY-NNN]` trong FEAT §4 hoặc BR boundary — KHÔNG lặp lại nội dung |
| 3 | Nếu chỉ áp 1 phần → cite kèm note "áp 1 phần: [phần cụ thể]" |
| 4 | Nếu không có → viết BR feature-specific/boundary-specific bình thường |
| 5 | Nếu phát hiện rule Confluence chưa có ở file này → flag Business Authority + append sau khi confirm |

---

## §2 Rules Registry

### 2.1 Xác thực & phiên

#### SYS-RETRY-001 — Số lần đăng nhập sai tối đa
Chỉ cho phép đăng nhập sai tài khoản tối đa **5 lần**.

#### SYS-RETRY-021 — Đăng nhập trên nhiều thiết bị
Cho phép người dùng đăng nhập trên nhiều thiết bị cùng lúc.

---

### 2.2 Định dạng dữ liệu

#### SYS-RETRY-002 — Định dạng số
Dùng dấu **chấm (.)** phân cách hàng nghìn, dấu **phẩy (,)** cho thập phân.

#### SYS-RETRY-011 — Định dạng Email (ngắn)
Kiểm tra định dạng email theo chuẩn `prefix@domain`.

> Xem chi tiết ở [SYS-RETRY-028](#sys-retry-028--định-dạng-email-chi-tiết).

#### SYS-RETRY-015 — Nhập ngày sinh
- Định dạng: **DD/MM/YYYY**
- Không cho phép ngày sai hoặc quá xa (quá tương lai / quá quá khứ).

<!-- NEED CONFIRMATION: "quá xa" là ngưỡng bao nhiêu năm? -->

#### SYS-RETRY-019 — Xác thực đầu vào số điện thoại (ngắn)
- Nội địa: **10 số**.
- Quốc tế: phải có **mã vùng**, không chứa ký tự lạ.

> Xem chi tiết ở [SYS-RETRY-027](#sys-retry-027--định-dạng-số-điện-thoại-chi-tiết).

#### SYS-RETRY-027 — Định dạng số điện thoại (chi tiết)
- Nội địa: độ dài **chính xác 10 ký tự**.
- Quốc tế: phải bắt đầu bằng **mã quốc gia**.
- Các ký tự phải là số — KHÔNG cho phép ký tự đặc biệt hoặc chữ cái.
- Ví dụ hợp lệ: `0901234567` hoặc `+84 901234567`.

#### SYS-RETRY-028 — Định dạng Email (chi tiết)
Định dạng email hợp lệ: `prefix@domain` (VD: `example@example.com`).

**Prefix hợp lệ:** `a-z`, số, `_`, `.`, `-` (KHÔNG đứng đầu/kết thúc, KHÔNG lặp).
- Ví dụ sai: `abc-@`, `abc..def@`, `.abc@`, `abc#def@`
- Ví dụ đúng: `abc-d@`, `abc.def@`, `abc@`, `abc_def@`

**Domain hợp lệ:** chữ cái, số, dấu chấm, gạch ngang. Phần cuối ít nhất **2 ký tự** (`.com`, `.org`, `.cc`, …).
- Ví dụ sai: `mail.c`, `mail`, `mail..com`, `mail#@...` <!-- NEED CONFIRMATION: source Confluence có text lạ chèn từ hyperlink -->
- Ví dụ đúng: `mail.cc`, `mail.org`, `hello@mail.com` <!-- NEED CONFIRMATION: source Confluence có text lạ chèn từ hyperlink -->

#### SYS-RETRY-032 — Định dạng biển số xe
Pattern: `CCX-YYYYY` hoặc `CCXX-YYYYY`

Trong đó:
- `CC`: **2 chữ số** đại diện mã tỉnh/thành (VD: `30`, `51`, `43`, …)
- `X` hoặc `XX`: **1-2 chữ cái in hoa** (A-Z), KHÔNG có dấu, KHÔNG số
- `YYYYY`: **4 hoặc 5 chữ số** (0-9)

#### SYS-RETRY-038 — Định dạng thời gian
Format: `hh:mm`
- `hh`: giờ, từ `00` đến `23`
- `mm`: phút, từ `00` đến `59`

---

### 2.3 Nhập liệu & validation

#### SYS-RETRY-005 — Vượt độ dài tối đa
- Chặn nhập vượt số ký tự tối đa.
- Loại bỏ khoảng trắng đầu/cuối (trim).

#### SYS-RETRY-010 — Trường bắt buộc
Trường bắt buộc sẽ hiển thị lỗi nếu **trống** hoặc **sai** (không đạt validation).

#### SYS-RETRY-012 — Quy tắc mật khẩu
- Độ dài: **8-20 ký tự**
- Bao gồm: **chữ**, **số**, **ký tự đặc biệt**
- KHÔNG khoảng trắng

#### SYS-RETRY-018 — Giới hạn độ dài tên người dùng (username)
- Độ dài: **6-20 ký tự**
- KHÔNG chỉ chứa số
- KHÔNG có `_` hoặc `.` ở đầu hoặc cuối

---

### 2.4 Danh sách & phân trang

#### SYS-RETRY-004 — Di động: Phân trang & cuộn
- Tải **20 bản ghi/trang**.
- Hỗ trợ cuộn (infinite scroll).
- Thanh tiêu đề ẩn/hiện theo scroll direction.

#### SYS-RETRY-007 — Web: Phân trang
- Hiển thị **5 số trang**.
- Có nút chuyển nhanh (đầu/cuối) và điều hướng (prev/next).

#### SYS-RETRY-008 — Web: Giao diện danh sách
- Mặc định **20 bản ghi/trang**.
- Có thể chọn **20 / 50 / 100** bản ghi/trang.

#### SYS-RETRY-022 — Web: Giao diện danh sách (bổ sung)
- Tải **20 bản ghi/trang**, hỗ trợ cuộn — **chỉ scroll phần danh sách**.
- **Cố định** bộ lọc và tìm kiếm (sticky) khi cuộn.

<!-- NEED CONFIRMATION: 022 và 008 có mâu thuẫn không? 008 phân trang cứng, 022 infinite scroll — cùng "Web: giao diện danh sách" -->

---

### 2.5 UI & hiển thị

#### SYS-RETRY-003 — Tải lại trang (refresh)
Dữ liệu được cập nhật khi người dùng mở lại màn hình.

#### SYS-RETRY-006 — Hộp kiểm (Checkbox)
- Hỗ trợ **chọn tất cả** (select-all).
- Đồng bộ trạng thái checkbox con khi thay đổi checkbox cha (và ngược lại).

#### SYS-RETRY-009 — Lựa chọn với giá trị mặc định
- Ghi nhớ lựa chọn trong phiên (session).
- Thoát khỏi phiên → về giá trị mặc định.

#### SYS-RETRY-020 — Tìm kiếm theo keyword
- Hỗ trợ tìm kiếm theo **từng ký tự**.
- **Không phân biệt hoa/thường** (case-insensitive).
- Khi kết hợp nhiều tham số tìm kiếm → hệ thống hiển thị kết quả phải có **tất cả** các tham số đó (AND).
- Khi kết hợp nhiều tham chiếu cách nhau bằng **dấu cách**. <!-- NEED CONFIRMATION: câu này ambiguous — "nhiều tham chiếu" ý là gì? Cần Business Authority làm rõ -->
- Tìm kiếm **gần đúng** (fuzzy).
- **Realtime** (as-you-type).

#### SYS-RETRY-024 — Hiển thị số lượng "Bình luận" chưa đọc
- Nếu tổng bình luận chưa đọc ≤ 99 → hiển thị số thực (VD: `3`, `27`, `99`).
- Nếu tổng bình luận chưa đọc > 99 → hiển thị `99+`.

#### SYS-RETRY-025 — Hiển thị text quá dài vượt quá độ rộng
Khi text (tên gara, địa chỉ, …) dài vượt quá độ rộng dòng:
- Hệ thống hiển thị `…` ở cuối (ellipsis).
- Khi user **hover** → hệ thống hiển thị full text trên **popover**.

Ví dụ:
- `Công ty cổ phần xây dựng Kinh Bắc Industry...`
- `61/72 Mỹ Đình 2 - Nam Từ Liêm - Hà …`

#### SYS-RETRY-030 — Hiển thị thời gian dạng "x phút trước / x giờ trước / …"
Dùng cho notification.

| Điều kiện | Hiển thị |
|---|---|
| `t < 1 phút` | `Vừa xong` hoặc `1 phút trước` <!-- NEED CONFIRMATION: chọn 1 trong 2? --> |
| `t < 60 phút` | `X phút trước` |
| `t < 24h` | `X giờ trước` |
| `t < 3 ngày` | `X ngày trước` |
| `t ≥ 3 ngày` | `dd/mm/yyyy HH:mm` |

#### SYS-RETRY-033 — Hiển thị số tiền chênh lệch
Dùng cho tính toán chênh lệch: `diff = a - b`.

| Điều kiện | Hiển thị |
|---|---|
| `diff = 0` | KHÔNG hiển thị thông tin chênh lệch |
| `diff > 0` | `+ {số tiền} VNĐ` — **màu xanh** |
| `diff < 0` | `- {số tiền} VNĐ` — **màu đỏ** |

---

### 2.6 Xác nhận thao tác

#### SYS-RETRY-013 — Xác nhận hủy
Hiển thị pop-up xác nhận: **"Bạn có chắc chắn muốn hủy?"**

#### SYS-RETRY-014 — Xác nhận xóa
Cảnh báo **xóa vĩnh viễn**, không thể khôi phục.

---

### 2.7 Tải file/ảnh/video

#### SYS-RETRY-016 — Tải ảnh (ngắn)
- Định dạng: `.JPG`, `.JPEG`, `.PNG`, `.SVG`, `.HEIC`, `.HEIF`
- Dung lượng tối đa: **30MB**
- Kích thước tối đa: **1920 x 1080**

> Xem chi tiết xử lý lỗi ở [SYS-RETRY-037](#sys-retry-037--tải-lên-ảnh-chi-tiết-xử-lý-lỗi).

#### SYS-RETRY-017 — Tải video
- Định dạng: `.MP4`, `.AVI`, `.MOV`, `.WEBM`, `.WMV`
- Dung lượng tối đa: **100MB**
- Kích thước tối đa: **1280 x 720**

#### SYS-RETRY-026 — Tải file (spreadsheet)
Định dạng: `.CSV`, `.XLSX`, `.XLS`

#### SYS-RETRY-034 — Định dạng tải file (mở rộng)
Định dạng cho phép:
- `.pdf`
- `.doc`, `.docx`
- `.xls`, `.xlsx`
- `.ppt`, `.pptx`
- `.txt`
- `.csv`

#### SYS-RETRY-037 — Tải lên ảnh (chi tiết xử lý lỗi)
**Định dạng:** `.JPG`, `.JPEG`, `.PNG`, `.SVG`, `.HEIC`, `.HEIF`. Max **30MB**.

**Thứ tự kiểm tra lỗi:**
1. Kiểm tra **định dạng** ảnh trước.
2. Nếu định dạng không hợp lệ → hiển thị lỗi định dạng, KHÔNG tiếp tục kiểm tra dung lượng.
3. Nếu định dạng hợp lệ → tiếp tục kiểm tra **dung lượng** ảnh.

**Cách hiển thị thông báo lỗi:**
- Lỗi hiển thị dưới dạng **toast message**.
- Mỗi ảnh chỉ hiển thị **một lỗi** tại một thời điểm.

**Xử lý ảnh khi có lỗi:**
- Khi phát hiện ảnh lỗi → hệ thống chỉ **xóa ảnh lỗi**.
- Các ảnh hợp lệ vẫn được giữ nguyên (tránh user phải upload lại từ đầu).

---

### 2.8 Nghiệp vụ nội tại hệ thống

#### SYS-RETRY-023 — Thông tin xe
Thông tin xe hiển thị theo thứ tự:

`[Hãng xe] [Dòng xe] [Năm sản xuất] [Phiên bản xe]`

**Ví dụ:**
- Hãng xe: `TOYOTA`
- Dòng xe: `CAMRY`
- Năm sản xuất: `2025`
- Phiên bản xe: `2.0Q`
- ⇒ Tên hiển thị: `TOYOTA CAMRY 2025 2.0Q`

#### SYS-RETRY-029 — Thời gian hiệu lực của yêu cầu báo giá
- **SLA = 15 phút**
- Đếm ngược.
- Hiển thị realtime trên UI.

#### SYS-RETRY-031 — Hiển thị phân khúc lên FE/Mobile (matching BE↔FE)

<!-- NEED CONFIRMATION: rule này có ảnh mapping BE↔FE (image-20250723-033854.png) chưa được import. Cần Business Authority cung cấp mapping table dạng text hoặc re-upload ảnh. -->

`[Ảnh phân khúc BE↔FE mapping — pending]`

#### SYS-RETRY-035 — Tự sinh ID khi khởi tạo entity
ID tự sinh của mỗi loại entity là **số thứ tự tăng dần bắt đầu từ 1**.

#### SYS-RETRY-036 — Tự sinh mã Tenant khi khởi tạo Tenant
Mã tenant phân loại theo loại tenant:

| Loại tenant | Prefix | Format |
|---|---|---|
| Garage | `GR` | `GR{N}` — số thứ tự tăng dần bắt đầu từ 1 |
| Vendor | `VD` | `VD{N}` — số thứ tự tăng dần bắt đầu từ 1 |
| Express | `EX` | `EX{N}` — số thứ tự tăng dần bắt đầu từ 1 |

#### SYS-RETRY-039 — Quy tắc làm tròn chiết khấu theo %
**Nguyên tắc:** Làm tròn đến đồng.

- Độ chính xác: **0 chữ số thập phân**.
- Phương pháp: **Round half up** (≥ 0.5 làm tròn lên).
- Lý do: VNĐ không có đơn vị nhỏ hơn đồng.

**Công thức:**
```
ROUND(line_amount * discount_percent / 100, 0)
```

Trong đó:
- `line_amount` = tiền hàng = giá bán × số lượng
- `discount_percent` = phần trăm chiết khấu
- `/100` = chuyển % thành số thập phân (VD: `7 / 100 = 0.07`)
- `ROUND(..., 0)` = làm tròn đến 0 chữ số thập phân

**Ví dụ:**
- `86,419.69 → 86,420`
- `86,419.49 → 86,419`
- `86,419.50 → 86,420`

---

## §3 Rules Garage-specific

<!-- Rule COMMON Garage-specific (không thuộc org-level Confluence). Dùng prefix GR-COMMON-NNN. -->

### 3.1 Form dropdown — filter cứng theo status (áp cross-module)

| ID | Rule |
|---|---|
| **GR-COMMON-001** | **Dropdown master data filter cứng theo trạng thái hoạt động** — mọi form nghiệp vụ Garage (phiếu Nhập, phiếu Xuất, phiếu dịch vụ SO, quotation, PO, v.v.) khi hiển thị dropdown lấy dữ liệu từ danh mục master: **Nhà cung cấp (NCC)** chỉ hiển thị records status **"Đang hoạt động"**; **Khách hàng (KH)** chỉ hiển thị records status **"Đang hoạt động"**; **Nhân viên (NV)** chỉ hiển thị records status **"Đang làm việc"**. KHÔNG hiển thị NCC/KH "Ngừng hoạt động" hoặc NV "Ngừng làm việc" / "Nghỉ việc" trong dropdown chọn mới. **Edge case phiếu cũ**: nếu phiếu đã lưu tham chiếu đến 1 master record đã bị đổi status sau đó (VD phiếu tạo khi NV còn "Đang làm việc", nay NV đã "Nghỉ việc") → form Sửa **vẫn hiển thị selected value** (tên NV đó, giữ reference); **nhưng** dropdown khi mở lại **KHÔNG cho phép chọn** NV/NCC/KH đã ngừng khác. Áp cho: form CREATE + EDIT của mọi phiếu; áp cho dropdown Đối tượng + Người phụ trách + tương đương. |
| **GR-COMMON-002** | **Radio-inside-dropdown pattern cho field đa-loại đối tượng** — khi 1 field business chấp nhận nhiều loại đối tượng (VD "Đối tượng" của phiếu Nhập khác / Xuất khác: NCC + KH + NV), FE dùng pattern **radio-inside-dropdown**: form giữ 1 trường duy nhất; khi user click mở dropdown → popup hiển thị **radio group "Loại đối tượng"** ở top (VD 3 lựa chọn NCC/KH/NV, single-select) + ô search + list. **Default trước khi tick radio**: list rỗng + placeholder "Chọn loại đối tượng trước". User tick radio → list re-fetch từ bảng master tương ứng. Đổi radio → clear selection + reload list bảng mới. Chọn item → đóng dropdown, field hiện tên item; lưu phiếu ghi cả `(object_type, object_id)`. **Form Sửa phiếu cũ**: mở dropdown → radio **auto tick loại tương ứng `object_type` đã lưu** + list load bảng đó; user có thể đổi radio (cascade như CREATE). **Rationale**: 3 loại (NCC/KH/NV) lưu ở 3 bảng khác nhau (NCC + KH ở `gf-customer`, NV ở `gf-hrms`) → không merge được 1 dropdown; chọn loại trước để BE query đúng 1 bảng. **Chỉ áp cho loại phiếu có "Đối tượng" đa-loại** — loại phiếu fix 1 đối tượng (VD Xuất bán → chỉ KH, Nhập mua → chỉ NCC) dùng dropdown thường không radio. |

**Cite từ**: BR-IRV2-025 (Nhập kho V2 — Nhập khác), BR-IDV2-025 (Xuất kho V2 — Xuất khác), + các phiếu tương lai (quotation Nhập khác, adjustment kho, v.v.) — thay vì duplicate wording ~500 ký tự × N BR domain-specific.

---

## §4 Open Questions / NEED CONFIRMATION

| Ref | Câu hỏi | Owner |
|---|---|---|
| SYS-RETRY-015 | "Không nhập ngày sai hoặc quá xa" — ngưỡng "quá xa" là bao nhiêu năm? | Business Authority |
| SYS-RETRY-020 | "Khi kết hợp nhiều tham chiếu cách nhau bằng dấu cách" — "tham chiếu" ở đây nghĩa là gì (từ khóa? entity?)? | Business Authority |
| SYS-RETRY-022 vs 008 | 008 nói web pagination cứng (20/50/100), 022 nói web scroll — có mâu thuẫn không? Áp cho screen nào? | Business Authority |
| SYS-RETRY-028 | Ví dụ email trong Confluence có text bị hyperlink parser chèn (`AI Creator Marketing Platform`, `The Mail Archive`, …) — cần cleanup wording | BA |
| SYS-RETRY-030 | `t < 1 phút` hiển thị `Vừa xong` hay `1 phút trước`? Chọn 1. | Business Authority |
| SYS-RETRY-031 | Ảnh mapping BE↔FE phân khúc chưa được import. Cần Business Authority cung cấp mapping table dạng text hoặc re-upload ảnh. | Business Authority |
| Applicability | Rule nào áp Garage / Vendor / Express / all? Cần Business Authority filter để add cột `applies_to_garage`. | Business Authority |

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-10 | 1 | BA (ninhnguyen@cardoctor.vn) | Import 39 rules từ Confluence `/wiki/spaces/CE/pages/13828374`. Verbatim wording; group thành 8 category (§2.1-§2.8). Ảnh SYS-RETRY-031 placeholder. 7 điểm NEED CONFIRMATION list ở §4. |
| 2026-07-14 | 2 | Business Authority | **Thêm §3.1 Garage-specific — GR-COMMON-001 + GR-COMMON-002** (BA-review 2026-07-14 C4.2 P1 unblock refactor dedup validation). Extract 2 pattern lặp trong BR-IRV2-025 + BR-IDV2-025 (form Inventory V2) thành common rule: (a) **GR-COMMON-001** — Dropdown master data (NCC/KH/NV) filter cứng theo status + edge case phiếu cũ giữ selected value. (b) **GR-COMMON-002** — Radio-inside-dropdown pattern cho field đa-loại đối tượng (Nhập khác / Xuất khác). 2 BR-*V2-025 giữ nguyên nội dung (defensive — không cut context domain-specific), nhưng future BR sẽ cite `[BR-COMMON#GR-COMMON-001/002]` thay vì duplicate ~500 ký tự. Cite từ: BR-IRV2-025, BR-IDV2-025 + phiếu tương lai (quotation Nhập khác, adjustment kho, ...). |
