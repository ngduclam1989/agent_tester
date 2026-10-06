# Bộ Test Case Báo cáo TM – MSB AML TM (Giám sát giao dịch) · v1.0

> TC cho 4 báo cáo nội bộ mới của cấu phần TM (Report TM_01 → TM_04) theo **Phụ lục 4 – MSB_Template Báo cáo nội bộ v1.4 (24/07/2026)** và **BRD TM v1.9 (30/09/2026)** mục III.5. Cách viết và bố cục Excel theo bộ TC báo cáo TF cũ `MSB_AML_Testcase_TF_Report_v1.1.xlsx`: mỗi báo cáo 1 sheet. File này là rollup; bảng TC chi tiết nằm ở 4 file con (mục 7).

## 1. Thông tin chung

| Thông tin | Giá trị |
|---|---|
| Dự án | DỰ ÁN TRIỂN KHAI BẢN QUYỀN PHẦN MỀM HỆ THỐNG AML MỚI – MSB |
| Cấu phần | TM – Giám sát giao dịch, báo cáo nội bộ trên Oracle Analytics Server (OAS) |
| Module | 4 báo cáo: TM_01 thống kê STR đã tạo; TM_02 hiệu quả kịch bản; TM_03 cảnh báo chưa xử lý; TM_04 khách hàng phát sinh cảnh báo theo kịch bản |
| Tài liệu gốc | `practices/requirements/MSB_TM/Phu luc 4.MSB_Template Bao cao noi bo_MSB_v1.4_240726.xlsx` (sheet Summary, Report TM_01–TM_04); `practices/requirements/MSB_TM/MSB_BRD_TM_v1.9_20260930.md` (luồng trạng thái dòng 37–142, CM-1 dòng 208–245, III.5 dòng 611–624) |
| Mẫu tham chiếu | `practices/requirements/MSB_TM/MSB_AML_Testcase_TF_Report_v1.1.xlsx` (TC báo cáo TF) |
| Ngoài phạm vi | Phân quyền xem/xuất báo cáo (đã có ở `TC_PHAN-QUYEN 6.md` mục M5 REPORT, REQ-31 → REQ-36) và ảnh hưởng chức năng liên quan (số liệu báo cáo thay đổi sau thao tác case) – bỏ theo yêu cầu, mỗi sheet chỉ gồm 3 nhóm Function, Validate, UI & Behavior |
| Loại kiểm thử | UI-only, manual, môi trường SIT |
| URL | OAS môi trường SIT của MSB (URL do MSB cung cấp) |
| Tổng số TC | 154 |
| Kỹ thuật áp dụng | Equivalence Partitioning (trạng thái case, loại KH, kết quả đánh giá event), Boundary Value Analysis (biên đầu/cuối kỳ, mẫu số = 0, làm tròn tỷ lệ), Decision Table (trạng thái case × cột đếm; trạng thái × cấp đơn vị xử lý), Use Case Testing (chạy – lọc – xuất báo cáo) |
| Quy ước TC ID | `MSB_TM-RP_TC_NNN`, đánh số liên tục qua 4 file con |
| File Excel bàn giao | `MSB_AML_Testcase_TM_Report_v1.0.xlsx` – sheet Cover, Records, Test Report, Report và 4 sheet Report_TM_01, Report_TM_02, Report_TM_03, Report_TM_04 |
| Ngày lập | 05/10/2026 |

**Phạm vi báo cáo sau chốt (Phụ lục 4 v1.4):**

- TM_01: tách cột STR thành *chưa duyệt* và *đã duyệt*; Đơn vị = đơn vị quản lý CIF; Nguồn tạo STR theo Case type.
- TM_02: đánh giá theo Event (không theo Case).
- TM_03: bỏ cột Nguồn kịch bản HIT, Mã kịch bản trùng khớp, Tên kịch bản trùng khớp; mỗi CIF + Case là 1 dòng.
- TM_04: dùng Event làm key; thêm cột Ngày phát sinh sự vụ (DD/MM/YYYY); bỏ cột Trạng thái STR; Trạng thái cảnh báo = Y/P/N.

**Lưu ý thực thi:** test data của từng báo cáo nằm ở kỳ riêng để số liệu kỳ vọng không bị dữ liệu của báo cáo khác làm lệch: TM_01 dùng tháng 04–06/2026, TM_03 dùng tháng 07/2026, TM_02 và TM_04 dùng chung bộ event tháng 09/2026 (để đối chiếu chéo). Không dựng thêm dữ liệu khác vào các kỳ này. Mọi TC chỉ đọc báo cáo, không đổi trạng thái case, nên không phụ thuộc thứ tự chạy.

## 2. Bảng tổng hợp Risk Level

Số liệu đếm tự động từ bảng TC ở 4 file con.

| Báo cáo | Nhóm rủi ro | Risk Level | Số TC |
|---|---|---|---|
| Report TM_01 | NHÓM FUNCTION | High | 26 |
| Report TM_01 | NHÓM VALIDATE | Medium | 8 |
| Report TM_01 | NHÓM UI & BEHAVIOR | Medium | 7 |
| Report TM_02 | NHÓM FUNCTION | High | 19 |
| Report TM_02 | NHÓM VALIDATE | Medium | 8 |
| Report TM_02 | NHÓM UI & BEHAVIOR | Medium | 7 |
| Report TM_03 | NHÓM FUNCTION | High | 29 |
| Report TM_03 | NHÓM VALIDATE | Medium | 8 |
| Report TM_03 | NHÓM UI & BEHAVIOR | Medium | 5 |
| Report TM_04 | NHÓM FUNCTION | High | 24 |
| Report TM_04 | NHÓM VALIDATE | Medium | 8 |
| Report TM_04 | NHÓM UI & BEHAVIOR | Medium | 5 |
| **Tổng** | | | **154** |

## 3. Tài khoản test và Test Data thiết yếu

### 3.1. Tài khoản test

Dùng lại tài khoản của bộ `TC_PHAN-QUYEN 6.md`.

| User | Role | Đơn vị | Mục đích |
|---|---|---|---|
| `tm_dvkh_maker_hn` | DVKH Maker | CN Hà Nội (VN0010001) | Người tạo case thủ công AML_MN trong dữ liệu D-TM01, D-EVT (dùng khi dựng data, không chạy báo cáo) |
| `tm_aml_maker` | AML Maker | HO (HO0000001) | User chạy cả 4 báo cáo, thấy dữ liệu mọi chi nhánh |

### 3.2. D-TM01 – case có STR cho Report TM_01 (kỳ 04/2026 – 06/2026)

Mã dữ liệu là nhãn để dựng case; QA ghi Case ID thật khi dựng. Đơn vị = đơn vị quản lý CIF. Ngày tạo STR = ngày Save STR lần đầu (Q2).

| Mã | Nguồn tạo STR | Đơn vị | CIF | Ngày tạo STR | Trạng thái case | Đếm vào |
|---|---|---|---|---|---|---|
| R1-HN-01 | Tự động | VN0010001 | 10010001 | 08/05/2026 | Pending Checker Review STR | Chưa duyệt |
| R1-HN-02 | Tự động | VN0010001 | 10010002 | 15/05/2026 | Pending Supervisor Review | Chưa duyệt |
| R1-HN-03 | Tự động | VN0010001 | 10010003 | 20/05/2026 | Pending AML Maker | Chưa duyệt |
| R1-HN-04 | Tự động | VN0010001 | 10010004 | 22/05/2026 | Pending AML Checker review | Chưa duyệt |
| R1-HN-05 | Tự động | VN0010001 | 10010005 | 05/05/2026 | Approved STR | Đã duyệt |
| R1-HN-06 | Thủ công (AML_MN, tm_dvkh_maker_hn tạo) | VN0010001 | 10010006 | 12/05/2026 | Pending Checker Review STR | Chưa duyệt |
| R1-HN-07 | Thủ công (AML_MN, tm_dvkh_maker_hn tạo) | VN0010001 | 10010007 | 10/05/2026 | Approved STR | Đã duyệt |
| R1-HN-08 | Tự động | VN0010001 | 10010008 | 18/05/2026 | Rejected sending STR | Không đếm |
| R1-HN-09 | Tự động | VN0010001 | 10010009 | 19/05/2026 | Closed - Not Send STR | Không đếm |
| R1-HN-10 | Tự động (case tạo 21/05/2026) | VN0010001 | 10010010 | chưa tạo STR | Pending Generate STR | Không đếm |
| R1-HN-11 | Tự động | VN0010001 | 10010011 | 16/05/2026 | Pending Maker (DVKH Checker trả về ở bước duyệt STR) | Không đếm (Q4) |
| R1-HN-12 | Tự động | VN0010001 | 10010012 | 30/04/2026 | Approved STR | Đã duyệt – kỳ 04/2026 |
| R1-HN-13 | Tự động | VN0010001 | 10010013 | 01/06/2026 | Pending Checker Review STR | Chưa duyệt – kỳ 06/2026 |
| R1-HCM-01 | Tự động | VN0010002 | 10020001 | 09/05/2026 | Approved STR | Đã duyệt |
| R1-HCM-02 | Thủ công (AML_MN, tm_aml_maker tạo) | VN0010002 | 10020002 | 11/05/2026 | Pending AML Checker review | Chưa duyệt |

Kỳ vọng kỳ 05/2026, Đơn vị = VN0010001 + VN0010002:

| Đơn vị | Thời gian | Nguồn tạo STR | STR (chưa duyệt) | STR (đã duyệt) |
|---|---|---|---|---|
| VN0010001 | 05/2026 | Tự động | 4 | 1 |
| VN0010001 | 05/2026 | Thủ công | 1 | 1 |
| VN0010002 | 05/2026 | Tự động | 0 | 1 |
| VN0010002 | 05/2026 | Thủ công | 1 | 0 |

### 3.3. D-EVT – case và event cho Report TM_02, TM_04 (kỳ 01/09/2026 – 30/09/2026)

Tất cả case do VN0010001 quản lý. Event: mã – kịch bản – Đánh giá đáng ngờ (Y/N/P).

| Case | CIF – Tên KH | Loại KH | Ngày phát sinh | Trạng thái case | Event |
|---|---|---|---|---|---|
| C01 | 10090001 – Trần Thị Bình | KHCN | 03/09/2026 | Pending Checker Review | E01 AML-01 Y; E02 AML-07 N |
| C02 | 20090002 – Công ty CP Đầu tư Hòa Bình | KHTC | 10/09/2026 | New | E03 AML-02 N |
| C03 | 10090001 – Trần Thị Bình | KHCN | 15/09/2026 | Approved STR | E04 AML-01 Y |
| C04 | 10090004 – Lý Văn Phúc | KHCN | 01/09/2026 | Closed - No Further Action | E05 AML-02 N (biên đầu kỳ) |
| C05 | 10090005 – Mai Thị Quỳnh | KHCN | 30/09/2026 | Pending Maker | E06 AML-01 Y (biên cuối kỳ) |
| C06 | 10090006 – Đinh Văn Sơn | KHCN | 31/08/2026 | Closed - No Further Action | E07 AML-01 Y (ngoài kỳ) |
| C07 | 10090007 – Hồ Thị Tâm | KHCN | 01/10/2026 | New | E08 AML-01 Y (ngoài kỳ) |
| C08 | 20090008 – Công ty TNHH Thực phẩm An Khang | KHTC | 12/09/2026 | Pending AML Maker | E09 AML-01 N |
| C09 | 10090009 – Võ Văn Uy | KHCN | 18/09/2026 | Closed - No Further Action | E10 AML-02 N; E11 AML-08 N |
| C10 | 10090010 – Kiều Thị Vân | KHCN | 20/09/2026 | Pending Checker Review | E12 AML-02 N; E13 AML-08 Y |
| C11 | 10090011 – Lâm Văn Xuân | KHCN | 22/09/2026 | New | E14 AML-05 P |
| C12 | 10090012 – Phan Thị Yến | KHCN | 24/09/2026 | New | E15 AML-05 P; E18 AML-01 P |
| C13 | 10090013 – Châu Văn Tài | KHCN | 25/09/2026 | Closed - Under Monitoring | E16 AML-08 N |
| C14 | 10090014 – Tạ Văn Hùng | KHCN | 16/09/2026 | Pending Checker Review (case thủ công AML_MN, tm_dvkh_maker_hn tạo) | Không có event |
| C15 | 20090015 – Công ty CP Vận tải Phương Nam | KHTC | 27/09/2026 | Pending Checker Review STR | E17 AML-07 Y |

Kỳ vọng TM_02 kỳ 09/2026, không lọc kịch bản (AML-03 không có event nên không có dòng):

| Mã KB | Tên kịch bản | Cảnh báo xử lý | False Positive | True Positive | Tỷ lệ FP | Tỷ lệ TP |
|---|---|---|---|---|---|---|
| AML-01 | Giao dịch có rủi ro cao: Khu vực địa lý có rủi ro cao | 4 | 1 | 3 | 25,00% | 75,00% |
| AML-02 | Giao dịch có rủi ro cao: Đối tượng có rủi ro cao trọng tâm | 4 | 4 | 0 | 100,00% | 0,00% |
| AML-05 | Sự dịch chuyển nhanh của dòng tiền | 0 | 0 | 0 | 0,00% | 0,00% |
| AML-07 | Mô hình Hub - Spoke | 2 | 1 | 1 | 50,00% | 50,00% |
| AML-08 | Giao dịch có IP nước ngoài | 3 | 2 | 1 | 66,67% | 33,33% |

Kỳ vọng TM_04 kỳ 09/2026, không lọc kịch bản: 16 dòng = 16 event E01–E06, E09–E18 (C06, C07 ngoài kỳ; C14 không có event).

### 3.4. D-TM03 – case cho Report TM_03 (kỳ 01/07/2026 – 31/07/2026)

| Case | CIF – Tên KH | Loại KH | Đơn vị | Ngày phát sinh | Trạng thái case | Cấp đơn vị kỳ vọng | Ghi chú |
|---|---|---|---|---|---|---|---|
| C301 | 10070001 – Nguyễn Văn An | KHCN | VN0010001 | 03/07/2026 | New | ĐVKD | 3 event: AML-01, AML-02, AML-07 |
| C302 | 20070002 – Công ty TNHH Thương mại Minh Phát | KHTC | VN0010001 | 05/07/2026 | Pending Checker Review | ĐVKD |  |
| C303 | 10070003 – Lê Thị Cúc | KHCN | VN0010001 | 07/07/2026 | Pending Maker | ĐVKD |  |
| C304 | 10070004 – Phạm Văn Dũng | KHCN | VN0010001 | 09/07/2026 | Pending Generate STR | ĐVKD | case tự động |
| C305 | 20070005 – Công ty CP Xây dựng Đại Việt | KHTC | VN0010001 | 11/07/2026 | Pending Checker Review STR | ĐVKD |  |
| C306 | 10070006 – Hoàng Thị Em | KHCN | VN0010001 | 13/07/2026 | Pending Supervisor Review | ĐVKD |  |
| C307 | 20070007 – Công ty TNHH Logistics Sao Mai | KHTC | VN0010001 | 15/07/2026 | Pending AML Maker | AML |  |
| C308 | 10070008 – Vũ Văn Giang | KHCN | VN0010001 | 17/07/2026 | Pending AML Checker review | AML |  |
| C309 | 10070009 – Đỗ Thị Hà | KHCN | VN0010001 | 19/07/2026 | Pending Generate STR | AML (Q13) | case thủ công AML_MN do tm_aml_maker tạo |
| C310 | 10070010 – Bùi Văn Khoa | KHCN | VN0010001 | 21/07/2026 | Closed - No Further Action | Không hiển thị |  |
| C311 | 10070011 – Cao Thị Lan | KHCN | VN0010001 | 22/07/2026 | Closed - Under Monitoring | Không hiển thị |  |
| C312 | 10070012 – Dương Văn Minh | KHCN | VN0010001 | 23/07/2026 | Approved STR | Không hiển thị |  |
| C313 | 20070013 – Công ty CP Dược phẩm Nam Việt | KHTC | VN0010001 | 24/07/2026 | Rejected sending STR | Không hiển thị |  |
| C314 | 10070014 – Lưu Thị Ngọc | KHCN | VN0010001 | 25/07/2026 | Closed - Not Send STR | Không hiển thị |  |
| C315 | 10070015 – Trịnh Văn Long | KHCN | VN0010001 | 01/07/2026 | New | ĐVKD | biên đầu kỳ |
| C316 | 10070016 – Ngô Thị Mai | KHCN | VN0010001 | 31/07/2026 | Pending Checker Review | ĐVKD | biên cuối kỳ |
| C317 | 10070017 – Quách Văn Phát | KHCN | VN0010001 | 30/06/2026 | New | Ngoài kỳ |  |
| C318 | 10070018 – Đặng Văn Nam | KHCN | VN0010002 | 10/07/2026 | New | ĐVKD | CN Hồ Chí Minh |
| C319 | 10070001 – Nguyễn Văn An | KHCN | VN0010001 | 20/07/2026 | Pending Checker Review | ĐVKD | cùng CIF với C301 |
| C320 | 10070020 – Kim Thị Oanh | KHCN | VN0010001 | 01/08/2026 | New | Ngoài kỳ |  |

Kỳ vọng kỳ 07/2026, không lọc, user tm_aml_maker (HO): 13 dòng (C301–C309, C315, C316, C318, C319).

### 3.5. D-VOL – dữ liệu số lượng lớn để kiểm tra phân trang

Đặt ở năm 2024–2025 để không lẫn với kỳ của mục 3.2–3.4.

| Bộ dữ liệu | Dùng cho | Mô tả | Kỳ vọng |
|---|---|---|---|
| D-VOL-01 | TM_01 | Mỗi tháng 01/2025 → 12/2025, mỗi đơn vị VN0010001 và VN0010002, mỗi nguồn (Tự động; Thủ công AML_MN) có 1 case Approved STR, STR tạo trong tháng đó → 48 case | Kỳ 01/2025–12/2025, 2 đơn vị: 48 dòng, mỗi dòng Chưa duyệt 0, Đã duyệt 1 → 2 trang (25 + 23) |
| D-VOL-EVT | TM_03, TM_04 | 60 case tự động trạng thái New, nhãn V001–V060, CIF 10240001–10240060 (KHCN, VN0010001), phát sinh rải đều 01/03/2024–31/03/2024 (ngày 01/03 có V001–V002, …); mỗi case 1 event, kịch bản lần lượt AML-01 → AML-14 rồi lặp lại; Đánh giá đáng ngờ luân phiên Y, N, P | TM_03 và TM_04 kỳ 03/2024: 60 dòng → 3 trang (25 + 25 + 10). TM_02 không kiểm tra phân trang vì tối đa 14 dòng |

## 4. Traceability Matrix

Nguồn: PL4 = Phụ lục 4 v1.4 (sheet – ô); BRD = MSB_BRD_TM_v1.9_20260930.md (dòng).

| REQ-ID | Báo cáo | Mô tả requirement | Nguồn | Test Case ID | Số TC | Trạng thái |
|---|---|---|---|---|---|---|
| REQ-01-01 | TM_01 | Tham số Từ, Đến bắt buộc, chọn theo bảng lịch, dạng mm/yyyy | PL4 TM_01 C22–C23 | `MSB_TM-RP_TC_001`, `MSB_TM-RP_TC_013`, `MSB_TM-RP_TC_020`, `MSB_TM-RP_TC_027` – `MSB_TM-RP_TC_031`, `MSB_TM-RP_TC_034`, `MSB_TM-RP_TC_036` – `MSB_TM-RP_TC_037`, `MSB_TM-RP_TC_040` | 12 | Covered |
| REQ-01-02 | TM_01 | Tham số Đơn vị: dropdown chọn 1 hoặc nhiều, bắt buộc tick (chốt 02/07) | PL4 TM_01 H24 | `MSB_TM-RP_TC_002`, `MSB_TM-RP_TC_016` – `MSB_TM-RP_TC_017`, `MSB_TM-RP_TC_032` – `MSB_TM-RP_TC_034`, `MSB_TM-RP_TC_036`, `MSB_TM-RP_TC_038` | 8 | Covered |
| REQ-01-03 | TM_01 | Cột Đơn vị lấy theo đơn vị quản lý CIF khách hàng | PL4 TM_01 H28 | `MSB_TM-RP_TC_011` | 1 | Covered |
| REQ-01-04 | TM_01 | Cột Thời gian theo tháng, định dạng MM/YYYY | PL4 TM_01 H29 | `MSB_TM-RP_TC_012` – `MSB_TM-RP_TC_015` | 4 | Covered |
| REQ-01-05 | TM_01 | Nguồn tạo STR Thủ công/Tự động xác định theo Case type | PL4 TM_01 H30 | `MSB_TM-RP_TC_008` – `MSB_TM-RP_TC_010` | 3 | Covered |
| REQ-01-06 | TM_01 | STR (chưa duyệt) = số case ở 4 trạng thái chờ duyệt STR | PL4 TM_01 H31 | `MSB_TM-RP_TC_003`, `MSB_TM-RP_TC_005` – `MSB_TM-RP_TC_007` | 4 | Covered |
| REQ-01-07 | TM_01 | STR (đã duyệt) = số case Approved STR | PL4 TM_01 H32 | `MSB_TM-RP_TC_004` – `MSB_TM-RP_TC_005` | 2 | Covered |
| REQ-01-08 | TM_01 | Xuất báo cáo Excel/PDF khớp template | BRD III.5 dòng 622 | `MSB_TM-RP_TC_018` – `MSB_TM-RP_TC_019`, `MSB_TM-RP_TC_024` – `MSB_TM-RP_TC_025`, `MSB_TM-RP_TC_041` | 5 | Covered |
| REQ-01-09 | TM_01 | Tiêu đề, bố cục, 5 cột theo template | PL4 TM_01 A1, C8–G8 | `MSB_TM-RP_TC_001`, `MSB_TM-RP_TC_035`, `MSB_TM-RP_TC_039` | 3 | Covered |
| REQ-01-12 | TM_01 | Hiển thị kết quả theo số lượng bản ghi: rỗng, ít (1 trang), nhiều (phân trang); xuất file đủ toàn bộ dòng | Chuẩn báo cáo OAS; PL4 không quy định (Q19) | `MSB_TM-RP_TC_020` – `MSB_TM-RP_TC_026` | 7 | Covered |
| REQ-02-01 | TM_02 | Mỗi kịch bản có event trong kỳ là 1 dòng; nếu chọn all thì hiển thị hết | PL4 TM_02 E8, D38 | `MSB_TM-RP_TC_042`, `MSB_TM-RP_TC_051` | 2 | Covered |
| REQ-02-02 | TM_02 | Tham số Từ ngày, Đến ngày bắt buộc, dạng dd/mm/yyyy | PL4 TM_02 B25–E26 | `MSB_TM-RP_TC_052` – `MSB_TM-RP_TC_053`, `MSB_TM-RP_TC_060` – `MSB_TM-RP_TC_065`, `MSB_TM-RP_TC_070` – `MSB_TM-RP_TC_071`, `MSB_TM-RP_TC_075` | 11 | Covered |
| REQ-02-03 | TM_02 | Số lượng cảnh báo xử lý = event phát sinh, không gồm event chưa xử lý | PL4 TM_02 D38 | `MSB_TM-RP_TC_043`, `MSB_TM-RP_TC_049` | 2 | Covered |
| REQ-02-04 | TM_02 | Số lượng False Positive = event đánh giá không đáng ngờ | PL4 TM_02 D39 | `MSB_TM-RP_TC_044`, `MSB_TM-RP_TC_049` | 2 | Covered |
| REQ-02-05 | TM_02 | Số lượng True Positive = event đánh giá đáng ngờ | PL4 TM_02 D40 | `MSB_TM-RP_TC_045`, `MSB_TM-RP_TC_049` | 2 | Covered |
| REQ-02-06 | TM_02 | Tỷ lệ False Positive = False Positive / Số lượng cảnh báo xử lý | PL4 TM_02 E41 | `MSB_TM-RP_TC_046`, `MSB_TM-RP_TC_048`, `MSB_TM-RP_TC_050`, `MSB_TM-RP_TC_074` | 4 | Covered |
| REQ-02-07 | TM_02 | Tỷ lệ True Positive = True Positive / Số lượng cảnh báo xử lý | PL4 TM_02 E42 | `MSB_TM-RP_TC_047` – `MSB_TM-RP_TC_048`, `MSB_TM-RP_TC_050`, `MSB_TM-RP_TC_074` | 4 | Covered |
| REQ-02-08 | TM_02 | Tham số Mã kịch bản, Tên kịch bản không bắt buộc; Tên phụ thuộc Mã | PL4 TM_02 B27–B28, F37 | `MSB_TM-RP_TC_054` – `MSB_TM-RP_TC_057`, `MSB_TM-RP_TC_066` – `MSB_TM-RP_TC_068`, `MSB_TM-RP_TC_070`, `MSB_TM-RP_TC_072` | 9 | Covered |
| REQ-02-09 | TM_02 | Tiêu đề, bố cục, 7 cột theo template | PL4 TM_02 C5, C12–I12 | `MSB_TM-RP_TC_042`, `MSB_TM-RP_TC_069`, `MSB_TM-RP_TC_073` | 3 | Covered |
| REQ-02-10 | TM_02 | Xuất báo cáo Excel/PDF | BRD III.5 dòng 622 | `MSB_TM-RP_TC_058` – `MSB_TM-RP_TC_059` | 2 | Covered |
| REQ-02-13 | TM_02 | Hiển thị báo cáo rỗng khi không có dữ liệu (không áp dụng phân trang: tối đa 14 dòng, mỗi dòng 1 kịch bản) | Chuẩn báo cáo OAS | `MSB_TM-RP_TC_060` | 1 | Covered |
| REQ-03-01 | TM_03 | Liệt kê case chưa được xử lý trong kỳ theo ngày phát sinh case | PL4 TM_03 C5 | `MSB_TM-RP_TC_076` | 1 | Covered |
| REQ-03-02 | TM_03 | Mỗi CIF và Case sự vụ là 1 bản ghi | PL4 Summary E5 | `MSB_TM-RP_TC_079` – `MSB_TM-RP_TC_080` | 2 | Covered |
| REQ-03-03 | TM_03 | Chỉ lấy case chưa đóng; case đã đóng không hiển thị | PL4 TM_03 C5; BRD dòng 136 | `MSB_TM-RP_TC_077` – `MSB_TM-RP_TC_078` | 2 | Covered |
| REQ-03-04 | TM_03 | CIF, Tên KH (KHCN họ tên, KHTC tên giao dịch đầy đủ), Loại KH theo CIF của case | PL4 TM_03 G37–G39 | `MSB_TM-RP_TC_084` – `MSB_TM-RP_TC_085` | 2 | Covered |
| REQ-03-05 | TM_03 | Tham số Từ ngày, Đến ngày bắt buộc; Ngày phát sinh sự vụ = ngày phát sinh case | PL4 TM_03 B25–B26, G44 | `MSB_TM-RP_TC_087`, `MSB_TM-RP_TC_089` – `MSB_TM-RP_TC_090`, `MSB_TM-RP_TC_098`, `MSB_TM-RP_TC_105` – `MSB_TM-RP_TC_109`, `MSB_TM-RP_TC_114` – `MSB_TM-RP_TC_115` | 11 | Covered |
| REQ-03-06 | TM_03 | Trạng thái sự vụ = trạng thái hiện tại theo luồng | PL4 TM_03 G45 | `MSB_TM-RP_TC_078` | 1 | Covered |
| REQ-03-07 | TM_03 | Cấp Đơn vị đang xử lý: ĐVKD hoặc AML theo role xử lý tiếp theo | PL4 TM_03 F46–G46 | `MSB_TM-RP_TC_081` – `MSB_TM-RP_TC_083` | 3 | Covered |
| REQ-03-08 | TM_03 | Mã Đơn vị lấy theo đơn vị quản lý CIF | PL4 TM_03 G47 | `MSB_TM-RP_TC_086` | 1 | Covered |
| REQ-03-09 | TM_03 | Tham số Loại khách hàng (KHCN, KHTC) và Trạng thái sự vụ không bắt buộc | PL4 TM_03 B27–B28 | `MSB_TM-RP_TC_091` – `MSB_TM-RP_TC_095`, `MSB_TM-RP_TC_110` – `MSB_TM-RP_TC_112`, `MSB_TM-RP_TC_114`, `MSB_TM-RP_TC_117` | 10 | Covered |
| REQ-03-10 | TM_03 | Tiêu đề, 9 cột sau khi bỏ Nguồn KB, Mã KB, Tên KB; STT tự sinh | PL4 TM_03 F41–F43, G36 | `MSB_TM-RP_TC_076`, `MSB_TM-RP_TC_088`, `MSB_TM-RP_TC_113`, `MSB_TM-RP_TC_116` | 4 | Covered |
| REQ-03-11 | TM_03 | Xuất báo cáo Excel/PDF | BRD III.5 dòng 622 | `MSB_TM-RP_TC_096` – `MSB_TM-RP_TC_097` | 2 | Covered |
| REQ-03-14 | TM_03 | Hiển thị kết quả theo số lượng bản ghi: rỗng, ít (1 trang), nhiều (phân trang); xuất file đủ toàn bộ dòng | Chuẩn báo cáo OAS; PL4 không quy định (Q19) | `MSB_TM-RP_TC_098` – `MSB_TM-RP_TC_104` | 7 | Covered |
| REQ-04-01 | TM_04 | Liệt kê event phát sinh từ kịch bản trong kỳ | PL4 TM_04 C5 | `MSB_TM-RP_TC_118`, `MSB_TM-RP_TC_123` | 2 | Covered |
| REQ-04-02 | TM_04 | Dùng Event làm key: mỗi CIF, Case, kịch bản là 1 bản ghi | PL4 TM_04 G44; Summary E6 | `MSB_TM-RP_TC_119` – `MSB_TM-RP_TC_120` | 2 | Covered |
| REQ-04-03 | TM_04 | CIF, Tên KH, Loại KH lấy theo thông tin CIF của event | PL4 TM_04 G38–G40 | `MSB_TM-RP_TC_124` | 1 | Covered |
| REQ-04-04 | TM_04 | Mã kịch bản, Tên kịch bản của event | PL4 TM_04 G41–C42 | `MSB_TM-RP_TC_125` | 1 | Covered |
| REQ-04-05 | TM_04 | Mã sự vụ = Case ID chứa event | PL4 TM_04 G43 | `MSB_TM-RP_TC_125` | 1 | Covered |
| REQ-04-06 | TM_04 | Trạng thái cảnh báo = Đánh giá đáng ngờ Y/P/N | PL4 TM_04 G44 | `MSB_TM-RP_TC_121` | 1 | Covered |
| REQ-04-07 | TM_04 | Trạng thái sự vụ = trạng thái hiện tại của case | PL4 TM_04 G45 | `MSB_TM-RP_TC_122` | 1 | Covered |
| REQ-04-08 | TM_04 | Tham số Từ ngày, Đến ngày bắt buộc; cột Ngày phát sinh sự vụ DD/MM/YYYY | PL4 TM_04 B25–B26, G37 | `MSB_TM-RP_TC_126`, `MSB_TM-RP_TC_128` – `MSB_TM-RP_TC_129`, `MSB_TM-RP_TC_135`, `MSB_TM-RP_TC_142` – `MSB_TM-RP_TC_146`, `MSB_TM-RP_TC_151` – `MSB_TM-RP_TC_152` | 11 | Covered |
| REQ-04-09 | TM_04 | Tham số Mã kịch bản, Tên kịch bản không bắt buộc | PL4 TM_04 B27–B28 | `MSB_TM-RP_TC_130` – `MSB_TM-RP_TC_132`, `MSB_TM-RP_TC_147` – `MSB_TM-RP_TC_149`, `MSB_TM-RP_TC_151`, `MSB_TM-RP_TC_154` | 8 | Covered |
| REQ-04-10 | TM_04 | Tiêu đề, 10 cột, bỏ cột Trạng thái STR; STT tự tăng | PL4 TM_04 G46, E36 | `MSB_TM-RP_TC_118`, `MSB_TM-RP_TC_127`, `MSB_TM-RP_TC_150`, `MSB_TM-RP_TC_153` | 4 | Covered |
| REQ-04-11 | TM_04 | Xuất báo cáo Excel/PDF | BRD III.5 dòng 622 | `MSB_TM-RP_TC_133` – `MSB_TM-RP_TC_134` | 2 | Covered |
| REQ-04-14 | TM_04 | Hiển thị kết quả theo số lượng bản ghi: rỗng, ít (1 trang), nhiều (phân trang); xuất file đủ toàn bộ dòng | Chuẩn báo cáo OAS; PL4 không quy định (Q19) | `MSB_TM-RP_TC_135` – `MSB_TM-RP_TC_141` | 7 | Covered |

## 5. Ambiguities & Q&A (đã xác nhận)

Các điểm dưới đây Phụ lục 4/BRD chưa ghi rõ. Phương án ở cột "Quyết định đã chốt" đã được xác nhận ngày 05/10/2026 và là căn cứ Expected Result của TC. Cột Notes trong Excel ghi mã Q để tra ngược. Nếu sau này MSB thay đổi, chỉ cần sửa các TC ở cột cuối.

| Q | Báo cáo | Nguồn và vấn đề | Quyết định đã chốt | TC liên quan |
|---|---|---|---|---|
| Q1 | TM_01 | PL4 sheet Report TM_01: ô E24 ghi Đơn vị "Không bắt buộc", ô H24 (mô tả chốt 02/07) ghi "Bắt buộc phải tick chọn giá trị, nếu không tick chọn sẽ không show báo cáo" | Đơn vị bắt buộc chọn; không chọn thì báo cáo không hiển thị (theo H24). | `MSB_TM-RP_TC_032` |
| Q2 | TM_01 | PL4 TM_01 H29: "Khoảng thời gian mà báo cáo được lập (theo tháng)" – không nói mốc ngày nào (ngày tạo case, ngày Save STR hay ngày duyệt) | Tháng tính theo ngày Save STR lần đầu. STR tạo 30/04 thuộc 04/2026 dù duyệt tháng 05. | `MSB_TM-RP_TC_013` – `MSB_TM-RP_TC_015` |
| Q3 | TM_01 | PL4 TM_01 H30: "Lấy theo Case type để xác định nguồn tạo STR"; BRD dòng 228–234: case thủ công Type = AML_MN | Thủ công = case Type AML_MN (DVKH Maker hoặc AML Maker tạo); Tự động = case hệ thống sinh từ kịch bản. | `MSB_TM-RP_TC_008` – `MSB_TM-RP_TC_010` |
| Q4 | TM_01 | PL4 TM_01 H31 liệt kê "Pending AML Maker review"; BRD dòng 61 đặt tên trạng thái là "Pending AML Maker". H31 không nhắc case đã có STR nhưng bị trả về (Pending Maker), Rejected sending STR, Closed - Not Send STR | Hiểu "Pending AML Maker review" = "Pending AML Maker". Chỉ đếm đúng 4 trạng thái của H31 vào cột chưa duyệt; Pending Maker, Rejected sending STR, Closed - Not Send STR không đếm cột nào. | `MSB_TM-RP_TC_005`, `MSB_TM-RP_TC_007` |
| Q5 | TM_01 | PL4 TM_01 C8–G8: template không nói có hiển thị dòng Đơn vị – Tháng – Nguồn khi cả 2 cột = 0 không | Không hiển thị dòng có cả 2 cột = 0. | `MSB_TM-RP_TC_012` |
| Q6 | TM_02 | PL4 TM_02: tiêu đề cột template E12–G12 là "Số lượng sự kiện / Số lượng cảnh báo giả / Số lượng cảnh báo thật", bảng mô tả C38–C40 là "Số lượng cảnh báo xử lý / Số lượng False Positive / Số lượng True Positive" | Dùng tên ở bảng mô tả C38–C42 (bản mô tả chi tiết hơn). | `MSB_TM-RP_TC_042`, `MSB_TM-RP_TC_073` |
| Q7 | TM_02, TM_04 | PL4 Summary E4: "lấy theo Event … TRUE POSITIVE hay FALSE POSITIVE"; PL4 TM_04 G44: "Đánh giá đáng ngờ (Y/P/N)". BRD không mô tả màn hình/role đánh giá từng event | Y = True Positive, N = False Positive, P = chưa xử lý (không tính). Đánh giá nằm ở Event Details, DVKH Maker cập nhật. | `MSB_TM-RP_TC_043` – `MSB_TM-RP_TC_045`, `MSB_TM-RP_TC_121` |
| Q8 | TM_02 | PL4 TM_02 E41–E42 chỉ có công thức chia; không nói định dạng, làm tròn, mẫu số = 0, kịch bản không có event | Hiển thị % với 2 chữ số thập phân (25,00%); mẫu số = 0 thì hiển thị 0,00%; kịch bản không có event trong kỳ không hiển thị dòng. | `MSB_TM-RP_TC_042`, `MSB_TM-RP_TC_046` – `MSB_TM-RP_TC_048`, `MSB_TM-RP_TC_050` – `MSB_TM-RP_TC_051`, `MSB_TM-RP_TC_074` |
| Q9 | TM_02, TM_04 | PL4 TM_02/TM_04 B25–B26: "Ngày bắt đầu/kết thúc kỳ báo cáo" – không nói lọc theo ngày tạo event hay ngày phát sinh case | Lọc theo ngày phát sinh case chứa event (case tự động gộp event trong cùng 1 ngày nên trùng ngày event). | `MSB_TM-RP_TC_052` – `MSB_TM-RP_TC_053`, `MSB_TM-RP_TC_128` – `MSB_TM-RP_TC_129` |
| Q10 | TM_02, TM_04 | PL4 TM_02 F37: "khi chọn mã KB hệ thống sẽ show tên"; PL4 Summary D6 (FIS): đề xuất gộp 1 filter mã + tên, MSB chưa chốt | Giữ 2 tham số như template; dropdown Tên chỉ còn tên của mã đã chọn, không chọn được tổ hợp lệch. | `MSB_TM-RP_TC_056` – `MSB_TM-RP_TC_057`, `MSB_TM-RP_TC_066`, `MSB_TM-RP_TC_132`, `MSB_TM-RP_TC_147` |
| Q11 | TM_03 | PL4 TM_03 D9: "Có hiển thị hết tất cả trạng thái của case … → Có"; tên báo cáo là "cảnh báo chưa được xử lý" | Báo cáo chỉ lấy 8 trạng thái chưa đóng; dropdown Trạng thái sự vụ chỉ có 8 trạng thái này. 5 trạng thái đóng (BRD dòng 136) không hiển thị. | `MSB_TM-RP_TC_076` – `MSB_TM-RP_TC_078`, `MSB_TM-RP_TC_111` |
| Q12 | TM_03 | PL4 TM_03 G46: Cấp Đơn vị là ĐVKD hoặc AML theo role xử lý tiếp theo; case AML Maker tạo thủ công ở Pending Generate STR (BRD dòng 119) do AML Maker xử lý | New, Pending Maker, Pending Checker Review, Pending Generate STR (case tự động/DVKH), Pending Checker Review STR, Pending Supervisor Review = ĐVKD; Pending AML Maker, Pending AML Checker review, Pending Generate STR của case AML Maker tạo = AML. | `MSB_TM-RP_TC_081`, `MSB_TM-RP_TC_083` |
| Q13 | TM_03, TM_04 | PL4 TM_03 D39: "Phân loại KHCN (Individual) hay KHTC (Entity)" – không chốt giá trị hiển thị | Hiển thị KHCN/KHTC, khớp giá trị dropdown Loại khách hàng. | `MSB_TM-RP_TC_085`, `MSB_TM-RP_TC_110`, `MSB_TM-RP_TC_124` |
| Q14 | TM_04 | PL4 TM_04 G44: "Dùng Event làm key"; Summary E6: "mỗi CIF, Case và kịch bản là 1 bản ghi"; C37/G37 bổ sung Ngày phát sinh sự vụ nhưng không ghi vị trí; G46 bỏ Trạng thái STR | 1 dòng / event; cột Ngày phát sinh sự vụ đặt sau STT (theo vị trí dòng mô tả); không còn cột Trạng thái STR. | `MSB_TM-RP_TC_118` – `MSB_TM-RP_TC_120`, `MSB_TM-RP_TC_153` |
| Q15 | TM_04 | PL4 TM_04 C5: báo cáo theo kịch bản; case thủ công (BRD CM-1.2) không có event kịch bản | Case thủ công không có event không xuất hiện trên TM_04. | `MSB_TM-RP_TC_123` |
| Q16 | Chung | PL4 không mô tả hành vi khi thiếu tham số bắt buộc, Từ > Đến, nhập tay sai định dạng | Theo hành vi đã ghi nhận ở bộ TC báo cáo TF (MSB_AML_Testcase_TF_Report_v1.1): thiếu tham số bắt buộc thì không hiện nút Apply; Từ > Đến thì báo lỗi khoảng thời gian; nhập tay sai thì ô tham số báo định dạng không hợp lệ. | `MSB_TM-RP_TC_027` – `MSB_TM-RP_TC_031`, `MSB_TM-RP_TC_034`, `MSB_TM-RP_TC_061` – `MSB_TM-RP_TC_065`, `MSB_TM-RP_TC_105` – `MSB_TM-RP_TC_109`, `MSB_TM-RP_TC_142` – `MSB_TM-RP_TC_146` |
| Q17 | Chung | PL4 (cả 4 sheet) không quy định cách hiển thị khi kết quả nhiều dòng: có phân trang hay cuộn, bao nhiêu dòng/trang, xuất file lấy toàn bộ hay chỉ trang đang xem | Theo mặc định bảng của OAS: 25 dòng/trang, có nút chuyển trang đầu/trước/kế tiếp/cuối; kết quả ≤ 25 dòng không hiện nút chuyển trang; đổi tham số thì quay về trang 1; Export Excel/PDF xuất toàn bộ dòng. Nếu MSB cấu hình số dòng/trang khác, chỉ cần sửa số dòng kỳ vọng ở các TC liên quan. | `MSB_TM-RP_TC_021` – `MSB_TM-RP_TC_026`, `MSB_TM-RP_TC_099` – `MSB_TM-RP_TC_104`, `MSB_TM-RP_TC_136` – `MSB_TM-RP_TC_141` |

## 6. Bảng thống kê

| Priority | Số lượng |
|---|---|
| High | 77 |
| Medium | 65 |
| Low | 12 |
| **Tổng** | **154** |

| Báo cáo | High | Medium | Low | Tổng |
|---|---|---|---|---|
| Report TM_01 | 22 | 17 | 2 | 41 |
| Report TM_02 | 13 | 18 | 3 | 34 |
| Report TM_03 | 24 | 15 | 3 | 42 |
| Report TM_04 | 18 | 15 | 4 | 37 |

## 7. Danh sách file con

| File | Sub-module | TC ID range | Tổng TC |
|---|---|---|---|
| `TC_MSB_TM_REPORT-TM01.md` | Report TM_01 – Báo cáo thống kê số lượng báo cáo giao dịch đáng ngờ đã tạo | `MSB_TM-RP_TC_001` – `MSB_TM-RP_TC_041` | 41 |
| `TC_MSB_TM_REPORT-TM02.md` | Report TM_02 – Báo cáo đánh giá hiệu quả của kịch bản quét sàng lọc giao dịch của khách hàng | `MSB_TM-RP_TC_042` – `MSB_TM-RP_TC_075` | 34 |
| `TC_MSB_TM_REPORT-TM03.md` | Report TM_03 – Báo cáo các cảnh báo chưa được xử lý | `MSB_TM-RP_TC_076` – `MSB_TM-RP_TC_117` | 42 |
| `TC_MSB_TM_REPORT-TM04.md` | Report TM_04 – Báo cáo khách hàng phát sinh cảnh báo theo từng kịch bản | `MSB_TM-RP_TC_118` – `MSB_TM-RP_TC_154` | 37 |
