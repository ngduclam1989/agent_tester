# Bộ Test Case Create Case – MSB AML TM (Giám sát giao dịch) · v1.1

> Dựng lại từ bộ TC của MSB `MSB_AML_TM_Create_Case_v1.0.xlsx` (Build v1.2, 28 TC) theo mẫu chung của repo. **Giữ nguyên toàn bộ 28 case gốc** (không thêm, không bỏ), chỉ chuẩn hóa định dạng. Cột cuối `TC ID gốc` map 1-1 sang ID trong file MSB. Danh sách TC còn thiếu (124 TC, theo chuẩn Granular) ở mục 8, chờ quyết định – chưa đưa vào bảng mục 7 và file Excel.

## 1. Thông tin chung

| Thông tin | Giá trị |
|---|---|
| Dự án | DỰ ÁN TRIỂN KHAI BẢN QUYỀN PHẦN MỀM HỆ THỐNG AML MỚI – MSB |
| Cấu phần | TM – Giám sát giao dịch (Oracle OFSAA / ECM) |
| Phiên bản | **v1.1** — dựng lại từ `MSB_AML_TM_Create_Case_v1.0.xlsx` (Build v1.2, 28 TC) theo mẫu chung của repo |
| Module | Create Case – CM-1.2 Khởi tạo case thủ công và gán giao dịch vào case (Add Transaction) |
| Tài liệu gốc | `practices/requirements/MSB_TM/MSB_BRD_TM_v1.9_20260930.md` (mục CM-1.2, dòng 224–244); `practices/requirements/MSB_TM/TC MSB/4.TM/MSB_AML_TM_Create_Case_v1.0.xlsx` |
| Loại kiểm thử | UI-only, manual |
| URL | Màn hình OFSAA ECM của môi trường SIT MSB (URL do MSB cung cấp) |
| Tổng số TC | 28 |
| Kỹ thuật áp dụng | Use Case Testing (luồng tạo case, thêm/gán giao dịch), Equivalence Partitioning (trường bắt buộc/tùy chọn, loại giao dịch) |
| Quy ước TC ID | `MSB_TM-CC_TC_NNN` – cùng khuôn với bộ `TC_PHAN-QUYEN` (`MSB_TM-PQ_TC_NNN`) |
| Ngày lập | 02/10/2026 |

**Những gì đã chuẩn hóa so với file gốc:**

- Test Title viết lại theo khuôn `Kiểm tra <hành động/kết quả> <đối tượng> với <điều kiện>`; 10 title dạng công thức `="Kiểm tra trường "&F30` được thay bằng câu cụ thể.
- Pre-Condition bổ sung đủ 3 thành phần (user, màn hình, dữ liệu) cho cả 27/28 TC đang để trống.
- Expected Result đánh số 1-1 với Test Steps (file gốc chỉ có 1 kết quả cho cả chuỗi bước); nội dung kết quả cuối giữ nguyên văn file gốc.
- Test Data cụ thể cho từng TC (file gốc để trống, riêng nhóm kiểm tra trường ghi tên trường ở cột Test Datas).
- Xếp lại theo nhóm RBT: Function → Validate (tách nhóm con theo từng trường) → UI & Behavior.
- Ghi chú `[Inference]`/`[Unverified]` ở cột Notes của file gốc chuyển thành câu hỏi Q1–Q6 ở mục 5.

**Nhóm không có TC trong bộ gốc:** Phân quyền đã được MSB chuyển sang bộ ma trận phân quyền (Records v1.2), hiện nằm ở `TC_PHAN-QUYEN 6.md` REQ-13 và REQ-16; Ảnh hưởng chức năng liên quan chưa có TC nào – xem đề xuất ở mục 8.

**Ngoài phạm vi file này:** luồng xử lý sau khi tạo case (EDD, STR, phê duyệt, email) – đã có ở bộ `MSB_AML_TM_Workflow_v1.0.xlsx` (WF_TM_DVKH, WF_TM_AML).

## 2. Bảng tổng hợp Risk Level

Số liệu đếm tự động từ bảng TC ở mục 7.

| Nhóm rủi ro | Nhóm con | Risk Level | Số TC |
|---|---|---|---|
| NHÓM FUNCTION | Khởi tạo case thủ công | High | 4 |
| NHÓM FUNCTION | Add Transaction Manually | High | 3 |
| NHÓM FUNCTION | Search Existing Entities | High | 3 |
| NHÓM VALIDATE | Trường: Type | Medium | 1 |
| NHÓM VALIDATE | Trường: Title | Medium | 1 |
| NHÓM VALIDATE | Trường: Jurisdiction | Medium | 1 |
| NHÓM VALIDATE | Trường: Business Domain | Medium | 1 |
| NHÓM VALIDATE | Trường: Priority | Medium | 1 |
| NHÓM VALIDATE | Trường: Due | Medium | 1 |
| NHÓM VALIDATE | Trường: Owner | Medium | 1 |
| NHÓM VALIDATE | Trường: Assignee | Medium | 1 |
| NHÓM VALIDATE | Trường: Created By | Medium | 1 |
| NHÓM VALIDATE | Trường: Description | Medium | 1 |
| NHÓM UI & BEHAVIOR | Màn hình khởi tạo case thủ công | Medium | 1 |
| NHÓM UI & BEHAVIOR | Màn hình Add Transaction | Medium | 7 |
| **Tổng** | | | **28** |

| Risk Level | Số lượng TC |
|---|---|
| High | 10 |
| Medium | 18 |

## 3. Tài khoản test và Test Data thiết yếu

### 3.1. Tài khoản test

Dùng chung bộ user với `TC_PHAN-QUYEN 6.md`.

| User | Role | Đơn vị | Mục đích | Số TC sử dụng |
|---|---|---|---|---|
| `tm_aml_maker` | AML Maker | HO (HO0000001) | User đăng nhập thực hiện mọi TC; giá trị Owner/Assignee/Created By | 28 |
| `tm_aml_checker` | AML Checker | HO (HO0000001) | Giá trị phải xuất hiện trong drop-down Owner/Assignee/Created By | 15 |
| `tm_dvkh_maker_hn` | DVKH Maker | CN Hà Nội (VN0010001) | Giá trị phải xuất hiện trong drop-down Owner/Assignee/Created By | 15 |

### 3.2. Dữ liệu cần dựng sẵn

Mã thật do hệ thống sinh – QA ghi vào cột cuối khi dựng dữ liệu.

| Mã dữ liệu test | Loại | Mô tả | Số TC sử dụng | Mã thật |
|---|---|---|---|---|
| CC-01 | Case | Case thủ công do tm_aml_maker tạo, Type = AML_MN, Title = TM_CC_ADDTXN_20261002, Jurisdiction = All, trạng thái Pending Generate STR | 13 | |
| TXN-CC-01 | Giao dịch | Giao dịch đã có trong hệ thống của khách hàng PARTY-CC-01, chưa gán vào case CC-01 | 4 | |
| PARTY-CC-01 | Khách hàng | Party ID của khách hàng thực hiện giao dịch TXN-CC-01 | 4 | |
| ACC-CC-01 | Tài khoản | Tài khoản CASA của khách hàng PARTY-CC-01, dùng nhập Account ID khi Add Transaction Manually | 3 | |

Giá trị text tự nhập (Description, Title, Transaction Reference ID) gắn mã TC + ngày chạy (vd `TM_CC_TC005_20261002`) để truy ngược bản ghi do TC nào tạo; khi chạy lại đổi phần ngày.

## 4. Traceability Matrix

### 4.1. Requirement ↔ Test Case

| REQ-ID | Mô tả requirement | Nguồn | Test Case ID | Trạng thái |
|---|---|---|---|---|
| REQ-01 | Case ID do hệ thống tự sinh | BRD v1.9 dòng 228 | MSB_TM-CC_TC_002 | Đã phủ |
| REQ-02 | Chỉ user có quyền xử lý case TM được tạo case thủ công | BRD v1.9 dòng 228 | — (thuộc `TC_PHAN-QUYEN 6.md` REQ-13, REQ-16) | Phủ ở bộ khác |
| REQ-03 | Tạo case thủ công với các trường thông tin cơ bản | BRD v1.9 dòng 230–242 | MSB_TM-CC_TC_001, MSB_TM-CC_TC_003, MSB_TM-CC_TC_004 | Đã phủ một phần (xem mục 8) |
| REQ-04 | Thuộc tính từng trường: Type, Title, Jurisdiction, Business domain, Priority, Due, Owner, Assignee, Created By, Description | BRD v1.9 dòng 233–242 | MSB_TM-CC_TC_011, MSB_TM-CC_TC_012, MSB_TM-CC_TC_013, MSB_TM-CC_TC_014, MSB_TM-CC_TC_015, MSB_TM-CC_TC_016, MSB_TM-CC_TC_017, MSB_TM-CC_TC_018, MSB_TM-CC_TC_019, MSB_TM-CC_TC_020, MSB_TM-CC_TC_021 | Đã phủ một phần (xem mục 8) |
| REQ-05 | Tạo thông tin giao dịch để gán với case thủ công (Add Transaction Manually) | BRD v1.9 dòng 244 | MSB_TM-CC_TC_005, MSB_TM-CC_TC_006, MSB_TM-CC_TC_007, MSB_TM-CC_TC_022, MSB_TM-CC_TC_023, MSB_TM-CC_TC_024, MSB_TM-CC_TC_025, MSB_TM-CC_TC_026, MSB_TM-CC_TC_027 | Đã phủ một phần (xem mục 8) |
| REQ-06 | Tìm kiếm giao dịch có sẵn để gán với case thủ công (Search Existing Entities) | BRD v1.9 dòng 244 | MSB_TM-CC_TC_008, MSB_TM-CC_TC_009, MSB_TM-CC_TC_010, MSB_TM-CC_TC_028 | Đã phủ một phần (xem mục 8) |

### 4.2. Map TC ID mới ↔ TC ID gốc MSB

| TC ID gốc (MSB) | TC ID mới | Nhóm |
|---|---|---|
| TM_CC_1.1 | MSB_TM-CC_TC_021 | NHÓM UI & BEHAVIOR / Màn hình khởi tạo case thủ công |
| TM_CC_2.1 | MSB_TM-CC_TC_001 | NHÓM FUNCTION / Khởi tạo case thủ công |
| TM_CC_2.2 | MSB_TM-CC_TC_002 | NHÓM FUNCTION / Khởi tạo case thủ công |
| TM_CC_2.3 | MSB_TM-CC_TC_004 | NHÓM FUNCTION / Khởi tạo case thủ công |
| TM_CC_2.4 | MSB_TM-CC_TC_003 | NHÓM FUNCTION / Khởi tạo case thủ công |
| TM_CC_2.5 | MSB_TM-CC_TC_011 | NHÓM VALIDATE / Trường: Type |
| TM_CC_2.6 | MSB_TM-CC_TC_012 | NHÓM VALIDATE / Trường: Title |
| TM_CC_2.7 | MSB_TM-CC_TC_013 | NHÓM VALIDATE / Trường: Jurisdiction |
| TM_CC_2.8 | MSB_TM-CC_TC_014 | NHÓM VALIDATE / Trường: Business Domain |
| TM_CC_2.9 | MSB_TM-CC_TC_015 | NHÓM VALIDATE / Trường: Priority |
| TM_CC_2.10 | MSB_TM-CC_TC_016 | NHÓM VALIDATE / Trường: Due |
| TM_CC_2.11 | MSB_TM-CC_TC_017 | NHÓM VALIDATE / Trường: Owner |
| TM_CC_2.12 | MSB_TM-CC_TC_018 | NHÓM VALIDATE / Trường: Assignee |
| TM_CC_2.13 | MSB_TM-CC_TC_019 | NHÓM VALIDATE / Trường: Created By |
| TM_CC_2.14 | MSB_TM-CC_TC_020 | NHÓM VALIDATE / Trường: Description |
| TM_CC_3.1 | MSB_TM-CC_TC_022 | NHÓM UI & BEHAVIOR / Màn hình Add Transaction |
| TM_CC_3.2 | MSB_TM-CC_TC_023 | NHÓM UI & BEHAVIOR / Màn hình Add Transaction |
| TM_CC_3.3 | MSB_TM-CC_TC_024 | NHÓM UI & BEHAVIOR / Màn hình Add Transaction |
| TM_CC_3.4 | MSB_TM-CC_TC_025 | NHÓM UI & BEHAVIOR / Màn hình Add Transaction |
| TM_CC_3.5 | MSB_TM-CC_TC_026 | NHÓM UI & BEHAVIOR / Màn hình Add Transaction |
| TM_CC_3.6 | MSB_TM-CC_TC_027 | NHÓM UI & BEHAVIOR / Màn hình Add Transaction |
| TM_CC_3.7 | MSB_TM-CC_TC_007 | NHÓM FUNCTION / Add Transaction Manually |
| TM_CC_3.8 | MSB_TM-CC_TC_005 | NHÓM FUNCTION / Add Transaction Manually |
| TM_CC_3.9 | MSB_TM-CC_TC_006 | NHÓM FUNCTION / Add Transaction Manually |
| TM_CC_3.10 | MSB_TM-CC_TC_028 | NHÓM UI & BEHAVIOR / Màn hình Add Transaction |
| TM_CC_3.11 | MSB_TM-CC_TC_010 | NHÓM FUNCTION / Search Existing Entities |
| TM_CC_3.12 | MSB_TM-CC_TC_009 | NHÓM FUNCTION / Search Existing Entities |
| TM_CC_3.13 | MSB_TM-CC_TC_008 | NHÓM FUNCTION / Search Existing Entities |

## 5. Ambiguities & Q&A

Câu hỏi lấy từ ghi chú cột Notes của file gốc và từ đối chiếu với BRD v1.9. Chưa có câu trả lời nên TC giữ nguyên kỳ vọng của file gốc.

| # | Câu hỏi | Nguồn | TC liên quan | Phương án đang áp dụng |
|---|---|---|---|---|
| Q1 | Nội dung message lỗi khi bỏ trống trường bắt buộc (tạo case, Add Transaction) là gì? | Notes file gốc dòng 29, 49 (sheet Create Case) | MSB_TM-CC_TC_003, MSB_TM-CC_TC_006 | Chỉ kiểm có thông báo yêu cầu nhập đủ trường bắt buộc và không tạo/lưu bản ghi |
| Q2 | Trường Title và Description giới hạn tối đa bao nhiêu ký tự? | BRD v1.9 dòng 234, 242; Notes file gốc dòng 31, 39 | MSB_TM-CC_TC_012, MSB_TM-CC_TC_020 | Chưa có TC độ dài; TC maxlength đề xuất ở mục 8 cần câu trả lời này |
| Q3 | Danh sách trường theo từng loại giao dịch lấy theo cấu hình OFSAA chuẩn – cấu hình thực tế của MSB có khác không? | BRD v1.9 dòng 244; Notes file gốc dòng 42–46 | MSB_TM-CC_TC_023, MSB_TM-CC_TC_024, MSB_TM-CC_TC_025, MSB_TM-CC_TC_026, MSB_TM-CC_TC_027 | Giữ danh sách trường của file gốc |
| Q4 | Khi Add Transaction Manually, trường nào là bắt buộc? | Notes file gốc dòng 49 | MSB_TM-CC_TC_006, MSB_TM-CC_TC_005 | [ASSUMPTION: Base Amount là trường bắt buộc] – dùng làm trường bỏ trống trong test data |
| Q5 | Màn hình Search Existing Entities có những trường tìm kiếm nào? | BRD v1.9 dòng 244; Notes file gốc dòng 50 | MSB_TM-CC_TC_028 | Giữ 5 trường theo BRD: Transaction ID, Transaction type, Transaction date, Transaction base amount, Party ID |
| Q6 | BRD CM-4 ghi Assign tự gán cho user tạo case, trong khi CM-1.2 ghi Assignee là trường bắt buộc chọn từ drop-down. Hệ thống điền sẵn user tạo case hay để người dùng chọn? | BRD v1.9 dòng 239, 317 | MSB_TM-CC_TC_018 | Giữ kỳ vọng file gốc: drop-down bắt buộc chọn |

## 6. Bảng thống kê

| Priority | Số lượng |
|---|---|
| High | 17 |
| Medium | 11 |
| **Tổng** | **28** |

| Nhóm rủi ro | Số TC |
|---|---|
| NHÓM FUNCTION | 10 |
| NHÓM VALIDATE | 10 |
| NHÓM UI & BEHAVIOR | 8 |

## 7. Bảng Test Cases chi tiết

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | TC ID gốc |
|---|---|---|---|---|---|---|---|---|---|
| **NHÓM FUNCTION** | | | | | | | | | |
| **— Khởi tạo case thủ công** | | | | | | | | | |
| MSB_TM-CC_TC_001 | Create Case | High | Kiểm tra tạo mới case thủ công thành công khi chỉ nhập đầy đủ các trường bắt buộc | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: user thuộc đơn vị HO0000001; hệ thống có sẵn 3 user có quyền xử lý case TM là tm_aml_maker, tm_aml_checker, tm_dvkh_maker_hn | 1. Truy cập chức năng khởi tạo case thủ công (Create Case)<br>2. Chọn Type = AML_MN<br>3. Nhập/chọn đầy đủ các trường bắt buộc (*): Type, Jurisdiction, Business Domain, Owner, Assignee, Created By, Description<br>4. Nhấn nút Create | 1. Hiển thị màn hình khởi tạo case thủ công<br><br>2. Trường Type hiển thị giá trị AML_MN<br><br>3. Các trường bắt buộc nhận đúng giá trị đã nhập/chọn<br><br>4. Hệ thống tạo case thành công, tự động sinh Case ID cho case vừa tạo và hiển thị thông báo tạo case thành công | High | - Type: AML_MN<br><br>- Jurisdiction: All<br><br>- Business Domain: All<br><br>- Owner: tm_aml_maker<br><br>- Assignee: tm_aml_maker<br><br>- Created By: tm_aml_maker<br><br>- Description: TM_CC_TC001 tao case thu cong 20261002<br><br>- Title, Priority, Due: để trống | TM_CC_2.1 |
| MSB_TM-CC_TC_002 | Create Case | High | Kiểm tra hệ thống tự động sinh Case ID thành công khi tạo case thủ công | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: user thuộc đơn vị HO0000001; hệ thống có sẵn 3 user có quyền xử lý case TM là tm_aml_maker, tm_aml_checker, tm_dvkh_maker_hn | 1. Truy cập chức năng khởi tạo case thủ công (Create Case)<br>2. Nhập/chọn đầy đủ các trường bắt buộc<br>3. Nhấn nút Create<br>4. Kiểm tra Case ID của case vừa được tạo | 1. Hiển thị màn hình khởi tạo case thủ công; không có ô cho người dùng tự nhập/chỉnh sửa Case ID<br><br>2. Các trường bắt buộc nhận đúng giá trị đã nhập/chọn<br><br>3. Hệ thống tạo case thành công<br><br>4. Case vừa tạo có Case ID do hệ thống tự động sinh; người dùng không tự nhập/chỉnh sửa được Case ID trên màn hình khởi tạo | High | - Type: AML_MN<br><br>- Jurisdiction: All<br><br>- Business Domain: All<br><br>- Owner: tm_aml_maker<br><br>- Assignee: tm_aml_maker<br><br>- Created By: tm_aml_maker<br><br>- Description: TM_CC_TC002 kiem tra Case ID 20261002 | TM_CC_2.2 |
| MSB_TM-CC_TC_003 | Create Case | High | Kiểm tra tạo case thủ công thất bại khi bỏ trống 1 trường bắt buộc | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: user thuộc đơn vị HO0000001; hệ thống có sẵn 3 user có quyền xử lý case TM là tm_aml_maker, tm_aml_checker, tm_dvkh_maker_hn | 1. Truy cập chức năng khởi tạo case thủ công (Create Case)<br>2. Bỏ trống 1 trong các trường bắt buộc (Type/Jurisdiction/Business Domain/Owner/Assignee/Created By/Description)<br>3. Nhấn nút Create | 1. Hiển thị màn hình khởi tạo case thủ công<br><br>2. Trường Description để trống, các trường bắt buộc còn lại nhận đúng giá trị<br><br>3. Hệ thống hiển thị thông báo yêu cầu nhập đầy đủ các trường bắt buộc, không tạo case | High | - Type: AML_MN<br><br>- Jurisdiction: All<br><br>- Business Domain: All<br><br>- Owner: tm_aml_maker<br><br>- Assignee: tm_aml_maker<br><br>- Created By: tm_aml_maker<br><br>- Description: để trống | TM_CC_2.4 |
| MSB_TM-CC_TC_004 | Create Case | High | Kiểm tra xóa dữ liệu đã nhập thành công khi nhấn nút Reset trên màn hình khởi tạo case thủ công | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: user thuộc đơn vị HO0000001; hệ thống có sẵn 3 user có quyền xử lý case TM là tm_aml_maker, tm_aml_checker, tm_dvkh_maker_hn | 1. Truy cập chức năng khởi tạo case thủ công (Create Case)<br>2. Nhập/chọn giá trị bất kỳ vào các trường trên màn hình<br>3. Nhấn nút Reset | 1. Hiển thị màn hình khởi tạo case thủ công<br><br>2. Các trường nhận đúng giá trị đã nhập/chọn<br><br>3. Hệ thống xóa sạch dữ liệu người dùng đã nhập, các trường trở về trạng thái mặc định ban đầu, cho phép người dùng nhập lại từ đầu | Medium | - Type: AML_MN<br><br>- Jurisdiction: All<br><br>- Business Domain: All<br><br>- Owner: tm_aml_maker<br><br>- Assignee: tm_aml_maker<br><br>- Created By: tm_aml_maker<br><br>- Title: TM_CC_TC004_RESET<br><br>- Priority: High<br><br>- Due: 12/31/2026<br><br>- Description: TM_CC_TC004 kiem tra Reset 20261002 | TM_CC_2.3 |
| **— Add Transaction Manually** | | | | | | | | | |
| MSB_TM-CC_TC_005 | Add Transaction | High | Kiểm tra thêm mới giao dịch thủ công thành công với loại giao dịch Cash Transaction | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: đã tồn tại sẵn case thủ công CC-01 (Type = AML_MN, Title = TM_CC_ADDTXN_20261002, Jurisdiction = All, trạng thái Pending Generate STR) do tm_aml_maker tạo | 1. Truy cập theo đường dẫn Enterprise Case Management/Enterprise Case Investigation/Case Search and List<br>2. Chọn case thủ công CC-01 cần bổ sung thông tin giao dịch<br>3. Trên màn hình Case Summary, chọn Tab Entities/Transaction<br>4. Tại mục Transaction List, chọn "+" để Add Transaction<br>5. Chọn Add Transaction Manually, chọn 1 loại giao dịch<br>6. Nhập đầy đủ các trường bắt buộc và các trường thông tin khác<br>7. Nhấn Save | 1. Hiển thị màn hình Case Search and List<br><br>2. Hiển thị màn hình Case Summary của case CC-01<br><br>3. Hiển thị Tab Entities/Transaction có mục Transaction List<br><br>4. Hiển thị màn hình Add Transaction<br><br>5. Hiển thị form nhập giao dịch loại Cash Transaction<br><br>6. Các trường nhận đúng giá trị đã nhập<br><br>7. Hệ thống thêm mới giao dịch thành công, hiển thị giao dịch vừa thêm trên lưới Transaction List | High | - Select Transaction Type: Cash Transaction<br><br>- Date: 10/01/2026<br><br>- Debit/Credit: Credit<br><br>- Base Amount: 500,000,000<br><br>- Account ID: ACC-CC-01<br><br>- Location ID: VN0010001<br><br>- Type 1, Type 2, Type 3, Type 4, Account Risk, Location Name: chọn giá trị đầu tiên trong danh sách<br><br>- Transaction Reference ID: TM_CC_TC005_20261002 | TM_CC_3.8 |
| MSB_TM-CC_TC_006 | Add Transaction | High | Kiểm tra thêm mới giao dịch thủ công thất bại khi bỏ trống 1 trường bắt buộc | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: đã tồn tại sẵn case thủ công CC-01 (Type = AML_MN, Title = TM_CC_ADDTXN_20261002, Jurisdiction = All, trạng thái Pending Generate STR) do tm_aml_maker tạo | 1. Truy cập theo đường dẫn Enterprise Case Management/Enterprise Case Investigation/Case Search and List<br>2. Chọn case thủ công CC-01 cần bổ sung thông tin giao dịch<br>3. Trên màn hình Case Summary, chọn Tab Entities/Transaction<br>4. Tại mục Transaction List, chọn "+" để Add Transaction<br>5. Chọn Add Transaction Manually, chọn 1 loại giao dịch<br>6. Bỏ trống 1 trong các trường bắt buộc<br>7. Nhấn Save | 1. Hiển thị màn hình Case Search and List<br><br>2. Hiển thị màn hình Case Summary của case CC-01<br><br>3. Hiển thị Tab Entities/Transaction có mục Transaction List<br><br>4. Hiển thị màn hình Add Transaction<br><br>5. Hiển thị form nhập giao dịch loại Cash Transaction<br><br>6. Trường Base Amount để trống, các trường còn lại nhận đúng giá trị<br><br>7. Hệ thống hiển thị thông báo yêu cầu nhập đầy đủ các trường bắt buộc, không lưu giao dịch | High | - Select Transaction Type: Cash Transaction<br><br>- Date: 10/01/2026<br><br>- Debit/Credit: Credit<br><br>- Account ID: ACC-CC-01<br><br>- Location ID: VN0010001<br><br>- Type 1, Type 2, Type 3, Type 4, Account Risk, Location Name: chọn giá trị đầu tiên trong danh sách<br><br>- Base Amount: để trống<br><br>- Transaction Reference ID: TM_CC_TC006_20261002 | TM_CC_3.9 |
| MSB_TM-CC_TC_007 | Add Transaction | High | Kiểm tra xóa dữ liệu đã nhập thành công khi nhấn Reset trên màn hình Add Transaction Manually | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: đã tồn tại sẵn case thủ công CC-01 (Type = AML_MN, Title = TM_CC_ADDTXN_20261002, Jurisdiction = All, trạng thái Pending Generate STR) do tm_aml_maker tạo | 1. Truy cập theo đường dẫn Enterprise Case Management/Enterprise Case Investigation/Case Search and List<br>2. Chọn case thủ công CC-01 cần bổ sung thông tin giao dịch<br>3. Trên màn hình Case Summary, chọn Tab Entities/Transaction<br>4. Tại mục Transaction List, chọn "+" để Add Transaction<br>5. Chọn Add Transaction Manually, chọn 1 loại giao dịch bất kỳ<br>6. Nhập giá trị vào các trường trên màn hình<br>7. Nhấn Reset | 1. Hiển thị màn hình Case Search and List<br><br>2. Hiển thị màn hình Case Summary của case CC-01<br><br>3. Hiển thị Tab Entities/Transaction có mục Transaction List<br><br>4. Hiển thị màn hình Add Transaction<br><br>5. Hiển thị form nhập giao dịch loại Cash Transaction<br><br>6. Các trường nhận đúng giá trị đã nhập<br><br>7. Hệ thống xóa sạch dữ liệu người dùng đã nhập, cho phép người dùng nhập lại từ đầu | Medium | - Select Transaction Type: Cash Transaction<br><br>- Date: 10/01/2026<br><br>- Debit/Credit: Credit<br><br>- Base Amount: 500,000,000<br><br>- Account ID: ACC-CC-01<br><br>- Location ID: VN0010001<br><br>- Type 1, Type 2, Type 3, Type 4, Account Risk, Location Name: chọn giá trị đầu tiên trong danh sách<br><br>- Transaction Reference ID: TM_CC_TC007_20261002 | TM_CC_3.7 |
| **— Search Existing Entities** | | | | | | | | | |
| MSB_TM-CC_TC_008 | Add Transaction | High | Kiểm tra gán giao dịch tìm kiếm được vào case thủ công thành công | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: đã tồn tại sẵn case thủ công CC-01 (Type = AML_MN, trạng thái Pending Generate STR); giao dịch TXN-CC-01 của khách hàng PARTY-CC-01 đã có trong hệ thống và chưa được gán vào case CC-01 | 1. Truy cập theo đường dẫn Enterprise Case Management/Enterprise Case Investigation/Case Search and List<br>2. Chọn case thủ công CC-01 cần bổ sung thông tin giao dịch<br>3. Trên màn hình Case Summary, chọn Tab Entities/Transaction<br>4. Tại mục Transaction List, chọn "+" để Add Transaction<br>5. Chọn Search Existing Entities<br>6. Nhập điều kiện tìm kiếm hợp lệ, nhấn Search<br>7. Tại kết quả tìm kiếm (Transaction List), chọn giao dịch cần gán, nhấn "+" | 1. Hiển thị màn hình Case Search and List<br><br>2. Hiển thị màn hình Case Summary của case CC-01<br><br>3. Hiển thị Tab Entities/Transaction có mục Transaction List<br><br>4. Hiển thị màn hình Add Transaction<br><br>5. Hiển thị màn hình Search Existing Entities<br><br>6. Hệ thống tìm kiếm thành công theo điều kiện đã nhập, kết quả hiển thị giao dịch TXN-CC-01 đúng thông tin<br><br>7. Giao dịch TXN-CC-01 được gán (thêm) thành công vào Transaction List của case CC-01 | High | - Transaction ID: TXN-CC-01<br><br>- Giao dịch được chọn: TXN-CC-01 | TM_CC_3.13 |
| MSB_TM-CC_TC_009 | Add Transaction | High | Kiểm tra tìm kiếm giao dịch trả về thông báo không có dữ liệu khi điều kiện không khớp bản ghi nào | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: đã tồn tại sẵn case thủ công CC-01 (Type = AML_MN, trạng thái Pending Generate STR); giao dịch TXN-CC-01 của khách hàng PARTY-CC-01 đã có trong hệ thống và chưa được gán vào case CC-01 | 1. Truy cập theo đường dẫn Enterprise Case Management/Enterprise Case Investigation/Case Search and List<br>2. Chọn case thủ công CC-01 cần bổ sung thông tin giao dịch<br>3. Trên màn hình Case Summary, chọn Tab Entities/Transaction<br>4. Tại mục Transaction List, chọn "+" để Add Transaction<br>5. Chọn Search Existing Entities<br>6. Nhập điều kiện tìm kiếm không tồn tại trong hệ thống<br>7. Nhấn Search | 1. Hiển thị màn hình Case Search and List<br><br>2. Hiển thị màn hình Case Summary của case CC-01<br><br>3. Hiển thị Tab Entities/Transaction có mục Transaction List<br><br>4. Hiển thị màn hình Add Transaction<br><br>5. Hiển thị màn hình Search Existing Entities<br><br>6. Trường Transaction ID nhận đúng giá trị đã nhập<br><br>7. Hệ thống hiển thị thông báo "No data found for this search" | Medium | - Transaction ID: TM_CC_NOTEXIST_20261002 | TM_CC_3.12 |
| MSB_TM-CC_TC_010 | Add Transaction | High | Kiểm tra xóa điều kiện tìm kiếm thành công khi nhấn Reset trên màn hình Search Existing Entities | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: đã tồn tại sẵn case thủ công CC-01 (Type = AML_MN, trạng thái Pending Generate STR); giao dịch TXN-CC-01 của khách hàng PARTY-CC-01 đã có trong hệ thống và chưa được gán vào case CC-01 | 1. Truy cập theo đường dẫn Enterprise Case Management/Enterprise Case Investigation/Case Search and List<br>2. Chọn case thủ công CC-01 cần bổ sung thông tin giao dịch<br>3. Trên màn hình Case Summary, chọn Tab Entities/Transaction<br>4. Tại mục Transaction List, chọn "+" để Add Transaction<br>5. Chọn Search Existing Entities<br>6. Nhập thông tin vào các trường tìm kiếm<br>7. Nhấn Reset | 1. Hiển thị màn hình Case Search and List<br><br>2. Hiển thị màn hình Case Summary của case CC-01<br><br>3. Hiển thị Tab Entities/Transaction có mục Transaction List<br><br>4. Hiển thị màn hình Add Transaction<br><br>5. Hiển thị màn hình Search Existing Entities<br><br>6. Các trường tìm kiếm nhận đúng giá trị đã nhập<br><br>7. Thông tin đã nhập bị xóa, màn hình trở về trạng thái ban đầu | Medium | - Transaction ID: TXN-CC-01<br><br>- Party ID: PARTY-CC-01 | TM_CC_3.11 |
| **NHÓM VALIDATE** | | | | | | | | | |
| **— Trường: Type** | | | | | | | | | |
| MSB_TM-CC_TC_011 | Create Case | Medium | Kiểm tra trường "Type" là drop-down bắt buộc chọn với giá trị AML_MN | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: user thuộc đơn vị HO0000001; hệ thống có sẵn 3 user có quyền xử lý case TM là tm_aml_maker, tm_aml_checker, tm_dvkh_maker_hn | 1. Truy cập chức năng khởi tạo case thủ công (Create Case)<br>2. Kiểm tra/chỉnh sửa trường Type | 1. Hiển thị màn hình khởi tạo case thủ công<br><br>2. Hệ thống hiển thị giá trị drop-down list, bắt buộc chọn, gồm giá trị:<br>- AML_MN | High | - Trường kiểm tra: Type<br><br>- Giá trị chọn: AML_MN | TM_CC_2.5 |
| **— Trường: Title** | | | | | | | | | |
| MSB_TM-CC_TC_012 | Create Case | Medium | Kiểm tra trường "Title" cho phép nhập free text không bắt buộc | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: user thuộc đơn vị HO0000001; hệ thống có sẵn 3 user có quyền xử lý case TM là tm_aml_maker, tm_aml_checker, tm_dvkh_maker_hn | 1. Truy cập chức năng khởi tạo case thủ công (Create Case)<br>2. Kiểm tra/chỉnh sửa trường Title | 1. Hiển thị màn hình khởi tạo case thủ công<br><br>2. Hệ thống cho phép nhập tự do (free text), không bắt buộc nhập | Medium | - Trường kiểm tra: Title<br><br>- Giá trị nhập: TM_CC_TC012 tieu de case thu cong | TM_CC_2.6 |
| **— Trường: Jurisdiction** | | | | | | | | | |
| MSB_TM-CC_TC_013 | Create Case | Medium | Kiểm tra trường "Jurisdiction" là drop-down bắt buộc chọn với giá trị mặc định All | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: user thuộc đơn vị HO0000001; hệ thống có sẵn 3 user có quyền xử lý case TM là tm_aml_maker, tm_aml_checker, tm_dvkh_maker_hn | 1. Truy cập chức năng khởi tạo case thủ công (Create Case)<br>2. Kiểm tra/chỉnh sửa trường Jurisdiction | 1. Hiển thị màn hình khởi tạo case thủ công<br><br>2. Hệ thống hiển thị giá trị drop-down list, bắt buộc chọn, mặc định (default): All | High | - Trường kiểm tra: Jurisdiction<br><br>- Giá trị mặc định cần thấy: All | TM_CC_2.7 |
| **— Trường: Business Domain** | | | | | | | | | |
| MSB_TM-CC_TC_014 | Create Case | Medium | Kiểm tra trường "Business Domain" là drop-down bắt buộc chọn với giá trị mặc định All | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: user thuộc đơn vị HO0000001; hệ thống có sẵn 3 user có quyền xử lý case TM là tm_aml_maker, tm_aml_checker, tm_dvkh_maker_hn | 1. Truy cập chức năng khởi tạo case thủ công (Create Case)<br>2. Kiểm tra/chỉnh sửa trường Business Domain | 1. Hiển thị màn hình khởi tạo case thủ công<br><br>2. Hệ thống hiển thị giá trị drop-down list, bắt buộc chọn, mặc định (default): All | High | - Trường kiểm tra: Business Domain<br><br>- Giá trị mặc định cần thấy: All | TM_CC_2.8 |
| **— Trường: Priority** | | | | | | | | | |
| MSB_TM-CC_TC_015 | Create Case | Medium | Kiểm tra trường "Priority" là drop-down không bắt buộc với 3 giá trị High/Medium/Low | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: user thuộc đơn vị HO0000001; hệ thống có sẵn 3 user có quyền xử lý case TM là tm_aml_maker, tm_aml_checker, tm_dvkh_maker_hn | 1. Truy cập chức năng khởi tạo case thủ công (Create Case)<br>2. Kiểm tra/chỉnh sửa trường Priority | 1. Hiển thị màn hình khởi tạo case thủ công<br><br>2. Hệ thống hiển thị giá trị drop-down list, không bắt buộc chọn, gồm 3 giá trị:<br>- High<br>- Medium<br>- Low | Medium | - Trường kiểm tra: Priority<br><br>- Giá trị chọn: High, Medium, Low | TM_CC_2.9 |
| **— Trường: Due** | | | | | | | | | |
| MSB_TM-CC_TC_016 | Create Case | Medium | Kiểm tra trường "Due" cho phép nhập ngày định dạng MM/DD/YYYY không bắt buộc | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: user thuộc đơn vị HO0000001; hệ thống có sẵn 3 user có quyền xử lý case TM là tm_aml_maker, tm_aml_checker, tm_dvkh_maker_hn | 1. Truy cập chức năng khởi tạo case thủ công (Create Case)<br>2. Kiểm tra/chỉnh sửa trường Due | 1. Hiển thị màn hình khởi tạo case thủ công<br><br>2. Hệ thống cho phép nhập theo định dạng ngày MM/DD/YYYY, không bắt buộc nhập | Medium | - Trường kiểm tra: Due<br><br>- Giá trị nhập: 12/31/2026 | TM_CC_2.10 |
| **— Trường: Owner** | | | | | | | | | |
| MSB_TM-CC_TC_017 | Create Case | Medium | Kiểm tra trường "Owner" là drop-down bắt buộc chọn với danh sách user có quyền xử lý case TM | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: user thuộc đơn vị HO0000001; hệ thống có sẵn 3 user có quyền xử lý case TM là tm_aml_maker, tm_aml_checker, tm_dvkh_maker_hn | 1. Truy cập chức năng khởi tạo case thủ công (Create Case)<br>2. Kiểm tra/chỉnh sửa trường Owner | 1. Hiển thị màn hình khởi tạo case thủ công<br><br>2. Hệ thống hiển thị giá trị drop-down list là danh sách user được phân quyền xử lý case nghiệp vụ TM, bắt buộc chọn | High | - Trường kiểm tra: Owner<br><br>- Danh sách cần thấy: tm_aml_maker, tm_aml_checker, tm_dvkh_maker_hn | TM_CC_2.11 |
| **— Trường: Assignee** | | | | | | | | | |
| MSB_TM-CC_TC_018 | Create Case | Medium | Kiểm tra trường "Assignee" là drop-down bắt buộc chọn với danh sách user có quyền xử lý case TM | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: user thuộc đơn vị HO0000001; hệ thống có sẵn 3 user có quyền xử lý case TM là tm_aml_maker, tm_aml_checker, tm_dvkh_maker_hn | 1. Truy cập chức năng khởi tạo case thủ công (Create Case)<br>2. Kiểm tra/chỉnh sửa trường Assignee | 1. Hiển thị màn hình khởi tạo case thủ công<br><br>2. Hệ thống hiển thị giá trị drop-down list là danh sách user được phân quyền xử lý case nghiệp vụ TM, bắt buộc chọn | High | - Trường kiểm tra: Assignee<br><br>- Danh sách cần thấy: tm_aml_maker, tm_aml_checker, tm_dvkh_maker_hn | TM_CC_2.12 |
| **— Trường: Created By** | | | | | | | | | |
| MSB_TM-CC_TC_019 | Create Case | Medium | Kiểm tra trường "Created By" là drop-down bắt buộc chọn với danh sách user có quyền xử lý case TM | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: user thuộc đơn vị HO0000001; hệ thống có sẵn 3 user có quyền xử lý case TM là tm_aml_maker, tm_aml_checker, tm_dvkh_maker_hn | 1. Truy cập chức năng khởi tạo case thủ công (Create Case)<br>2. Kiểm tra/chỉnh sửa trường Created By | 1. Hiển thị màn hình khởi tạo case thủ công<br><br>2. Hệ thống hiển thị giá trị drop-down list là danh sách user được phân quyền xử lý case nghiệp vụ TM, bắt buộc chọn | High | - Trường kiểm tra: Created By<br><br>- Danh sách cần thấy: tm_aml_maker, tm_aml_checker, tm_dvkh_maker_hn | TM_CC_2.13 |
| **— Trường: Description** | | | | | | | | | |
| MSB_TM-CC_TC_020 | Create Case | Medium | Kiểm tra trường "Description" cho phép nhập free text và bắt buộc nhập | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: user thuộc đơn vị HO0000001; hệ thống có sẵn 3 user có quyền xử lý case TM là tm_aml_maker, tm_aml_checker, tm_dvkh_maker_hn | 1. Truy cập chức năng khởi tạo case thủ công (Create Case)<br>2. Kiểm tra/chỉnh sửa trường Description | 1. Hiển thị màn hình khởi tạo case thủ công<br><br>2. Hệ thống cho phép nhập tự do (free text), bắt buộc nhập | High | - Trường kiểm tra: Description<br><br>- Giá trị nhập: TM_CC_TC020 mo ta case thu cong 20261002 | TM_CC_2.14 |
| **NHÓM UI & BEHAVIOR** | | | | | | | | | |
| **— Màn hình khởi tạo case thủ công** | | | | | | | | | |
| MSB_TM-CC_TC_021 | Create Case | Medium | Kiểm tra hiển thị đầy đủ các trường và nút chức năng trên màn hình khởi tạo case thủ công | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: user thuộc đơn vị HO0000001; hệ thống có sẵn 3 user có quyền xử lý case TM là tm_aml_maker, tm_aml_checker, tm_dvkh_maker_hn | 1. Truy cập chức năng khởi tạo case thủ công (Create Case)<br>2. Chọn Type = AML_MN<br>3. Kiểm tra các trường hiển thị trên màn hình | 1. Hiển thị màn hình khởi tạo case thủ công<br><br>2. Trường Type hiển thị giá trị AML_MN<br><br>3. Màn hình hiển thị đầy đủ các trường theo đúng yêu cầu:<br>- Type<br>- Title<br>- Jurisdiction<br>- Business Domain<br>- Priority<br>- Due<br>- Owner<br>- Assignee<br>- Created By<br>- Description<br>Các nút chức năng:<br>- Reset<br>- Create | High | - Type: AML_MN | TM_CC_1.1 |
| **— Màn hình Add Transaction** | | | | | | | | | |
| MSB_TM-CC_TC_022 | Add Transaction | Medium | Kiểm tra hiển thị 2 lựa chọn thêm giao dịch trên màn hình Add Transaction | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: đã tồn tại sẵn case thủ công CC-01 (Type = AML_MN, Title = TM_CC_ADDTXN_20261002, Jurisdiction = All, trạng thái Pending Generate STR) do tm_aml_maker tạo | 1. Truy cập theo đường dẫn Enterprise Case Management/Enterprise Case Investigation/Case Search and List<br>2. Chọn case thủ công CC-01 cần bổ sung thông tin giao dịch<br>3. Trên màn hình Case Summary, chọn Tab Entities/Transaction<br>4. Tại mục Transaction List, chọn "+" để Add Transaction | 1. Hiển thị màn hình Case Search and List<br><br>2. Hiển thị màn hình Case Summary của case CC-01<br><br>3. Hiển thị Tab Entities/Transaction có mục Transaction List<br><br>4. Màn hình hiển thị 2 lựa chọn:<br>- Add Transaction Manually<br>- Search Existing Entities | High | - Case: CC-01 | TM_CC_3.1 |
| MSB_TM-CC_TC_023 | Add Transaction | Medium | Kiểm tra hiển thị 4 loại giao dịch tại Select Transaction Type trên màn hình Add Transaction Manually | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: đã tồn tại sẵn case thủ công CC-01 (Type = AML_MN, Title = TM_CC_ADDTXN_20261002, Jurisdiction = All, trạng thái Pending Generate STR) do tm_aml_maker tạo | 1. Truy cập theo đường dẫn Enterprise Case Management/Enterprise Case Investigation/Case Search and List<br>2. Chọn case thủ công CC-01 cần bổ sung thông tin giao dịch<br>3. Trên màn hình Case Summary, chọn Tab Entities/Transaction<br>4. Tại mục Transaction List, chọn "+" để Add Transaction<br>5. Chọn Add Transaction Manually | 1. Hiển thị màn hình Case Search and List<br><br>2. Hiển thị màn hình Case Summary của case CC-01<br><br>3. Hiển thị Tab Entities/Transaction có mục Transaction List<br><br>4. Hiển thị màn hình Add Transaction<br><br>5. Màn hình hiển thị Select Transaction Type gồm:<br>- Cash Transaction<br>- Funds Transfer<br>- Back Office Transaction<br>- Monetary Instrument Transaction | High | - Case: CC-01 | TM_CC_3.2 |
| MSB_TM-CC_TC_024 | Add Transaction | Medium | Kiểm tra hiển thị đầy đủ các trường và nút chức năng trên form Add Transaction Manually với loại giao dịch Cash Transaction | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: đã tồn tại sẵn case thủ công CC-01 (Type = AML_MN, Title = TM_CC_ADDTXN_20261002, Jurisdiction = All, trạng thái Pending Generate STR) do tm_aml_maker tạo | 1. Truy cập theo đường dẫn Enterprise Case Management/Enterprise Case Investigation/Case Search and List<br>2. Chọn case thủ công CC-01 cần bổ sung thông tin giao dịch<br>3. Trên màn hình Case Summary, chọn Tab Entities/Transaction<br>4. Tại mục Transaction List, chọn "+" để Add Transaction<br>5. Chọn Add Transaction Manually<br>6. Select Transaction Type chọn Cash Transaction | 1. Hiển thị màn hình Case Search and List<br><br>2. Hiển thị màn hình Case Summary của case CC-01<br><br>3. Hiển thị Tab Entities/Transaction có mục Transaction List<br><br>4. Hiển thị màn hình Add Transaction<br><br>5. Hiển thị danh sách Select Transaction Type<br><br>6. Màn hình hiển thị các trường:<br>- Date<br>- Type 1<br>- Type 2<br>- Type 3<br>- Type 4<br>- Debit/Credit<br>- Base Amount<br>- Account ID<br>- Account Risk<br>- Location ID<br>- Location Name<br>- Transaction Reference ID<br>Các nút chức năng:<br>- Reset<br>- Save | Medium | - Select Transaction Type: Cash Transaction | TM_CC_3.3 |
| MSB_TM-CC_TC_025 | Add Transaction | Medium | Kiểm tra hiển thị đầy đủ các trường và nút chức năng trên form Add Transaction Manually với loại giao dịch Funds Transfer | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: đã tồn tại sẵn case thủ công CC-01 (Type = AML_MN, Title = TM_CC_ADDTXN_20261002, Jurisdiction = All, trạng thái Pending Generate STR) do tm_aml_maker tạo | 1. Truy cập theo đường dẫn Enterprise Case Management/Enterprise Case Investigation/Case Search and List<br>2. Chọn case thủ công CC-01 cần bổ sung thông tin giao dịch<br>3. Trên màn hình Case Summary, chọn Tab Entities/Transaction<br>4. Tại mục Transaction List, chọn "+" để Add Transaction<br>5. Chọn Add Transaction Manually<br>6. Select Transaction Type chọn Funds Transfer | 1. Hiển thị màn hình Case Search and List<br><br>2. Hiển thị màn hình Case Summary của case CC-01<br><br>3. Hiển thị Tab Entities/Transaction có mục Transaction List<br><br>4. Hiển thị màn hình Add Transaction<br><br>5. Hiển thị danh sách Select Transaction Type<br><br>6. Màn hình hiển thị các trường:<br>- Transaction Reference ID<br>- Date<br>- Type 1<br>- Type 2<br>- Type 3<br>- Type 4<br>- Base Amount<br>- 3P/PT<br>- Originator Name<br>- Originator Account ID<br>- Beneficiary Name<br>- Beneficiary Account ID<br>- Send FI<br>- Send FI ID<br>- Receiving FI<br>- Receiving FI ID<br>- Originator Risk<br>- Beneficiary Risk<br>Các nút chức năng:<br>- Reset<br>- Save | Medium | - Select Transaction Type: Funds Transfer | TM_CC_3.4 |
| MSB_TM-CC_TC_026 | Add Transaction | Medium | Kiểm tra hiển thị đầy đủ các trường và nút chức năng trên form Add Transaction Manually với loại giao dịch Back Office Transaction | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: đã tồn tại sẵn case thủ công CC-01 (Type = AML_MN, Title = TM_CC_ADDTXN_20261002, Jurisdiction = All, trạng thái Pending Generate STR) do tm_aml_maker tạo | 1. Truy cập theo đường dẫn Enterprise Case Management/Enterprise Case Investigation/Case Search and List<br>2. Chọn case thủ công CC-01 cần bổ sung thông tin giao dịch<br>3. Trên màn hình Case Summary, chọn Tab Entities/Transaction<br>4. Tại mục Transaction List, chọn "+" để Add Transaction<br>5. Chọn Add Transaction Manually<br>6. Select Transaction Type chọn Back Office Transaction | 1. Hiển thị màn hình Case Search and List<br><br>2. Hiển thị màn hình Case Summary của case CC-01<br><br>3. Hiển thị Tab Entities/Transaction có mục Transaction List<br><br>4. Hiển thị màn hình Add Transaction<br><br>5. Hiển thị danh sách Select Transaction Type<br><br>6. Màn hình hiển thị các trường:<br>- Date<br>- Account ID<br>- Offset Account ID<br>- Security ID<br>- Quantity<br>- Debit/Credit<br>- Base Amount<br>- Type 1<br>- Type 2<br>- Type 3<br>- Type 4<br>- Transaction Reference ID<br>- Description<br>- Account Risk<br>- Offset Account Risk<br>- Overall Risk<br>Các nút chức năng:<br>- Reset<br>- Save | Medium | - Select Transaction Type: Back Office Transaction | TM_CC_3.5 |
| MSB_TM-CC_TC_027 | Add Transaction | Medium | Kiểm tra hiển thị đầy đủ các trường và nút chức năng trên form Add Transaction Manually với loại giao dịch Monetary Instrument Transaction | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: đã tồn tại sẵn case thủ công CC-01 (Type = AML_MN, Title = TM_CC_ADDTXN_20261002, Jurisdiction = All, trạng thái Pending Generate STR) do tm_aml_maker tạo | 1. Truy cập theo đường dẫn Enterprise Case Management/Enterprise Case Investigation/Case Search and List<br>2. Chọn case thủ công CC-01 cần bổ sung thông tin giao dịch<br>3. Trên màn hình Case Summary, chọn Tab Entities/Transaction<br>4. Tại mục Transaction List, chọn "+" để Add Transaction<br>5. Chọn Add Transaction Manually<br>6. Select Transaction Type chọn Monetary Instrument Transaction | 1. Hiển thị màn hình Case Search and List<br><br>2. Hiển thị màn hình Case Summary của case CC-01<br><br>3. Hiển thị Tab Entities/Transaction có mục Transaction List<br><br>4. Hiển thị màn hình Add Transaction<br><br>5. Hiển thị danh sách Select Transaction Type<br><br>6. Màn hình hiển thị các trường:<br>- Transaction Reference ID<br>- Issue Date<br>- Deposit Date<br>- Clearing Date<br>- 3P/PT<br>- Post Date<br>- Type 1<br>- Type 2<br>- Type 3<br>- Type 4<br>- Serial/Check #<br>- Base Amount<br>- Remitter Name<br>- Remitter Account ID<br>- Beneficiary Name<br>- Beneficiary Account ID<br>- Comments<br>- Issuing FI ID<br>- Instrument<br>- Clearing FI<br>- Clearing FI ID<br>- Depositing FI<br>- Depositing FI ID<br>- Remitter Risk<br>- Beneficiary Risk<br>Các nút chức năng:<br>- Reset<br>- Save | Medium | - Select Transaction Type: Monetary Instrument Transaction | TM_CC_3.6 |
| MSB_TM-CC_TC_028 | Add Transaction | Medium | Kiểm tra hiển thị các trường tìm kiếm và cột kết quả trên màn hình Search Existing Entities | - User: Đăng nhập tm_aml_maker (AML Maker – HO), có quyền xử lý case nghiệp vụ TM<br><br>- Màn hình: OFSAA ECM > Case List (màn hình mặc định sau đăng nhập)<br><br>- Dữ liệu: đã tồn tại sẵn case thủ công CC-01 (Type = AML_MN, trạng thái Pending Generate STR); giao dịch TXN-CC-01 của khách hàng PARTY-CC-01 đã có trong hệ thống và chưa được gán vào case CC-01 | 1. Truy cập theo đường dẫn Enterprise Case Management/Enterprise Case Investigation/Case Search and List<br>2. Chọn case thủ công CC-01 cần bổ sung thông tin giao dịch<br>3. Trên màn hình Case Summary, chọn Tab Entities/Transaction<br>4. Tại mục Transaction List, chọn "+" để Add Transaction<br>5. Chọn Search Existing Entities | 1. Hiển thị màn hình Case Search and List<br><br>2. Hiển thị màn hình Case Summary của case CC-01<br><br>3. Hiển thị Tab Entities/Transaction có mục Transaction List<br><br>4. Hiển thị màn hình Add Transaction<br><br>5. Màn hình hiển thị các trường tìm kiếm:<br>- Transaction ID<br>- Transaction type<br>- Transaction date<br>- Transaction base amount<br>- Party ID<br>Các nút chức năng:<br>- Reset<br>- Search<br>Kết quả tìm kiếm (Transaction List) hiển thị tối thiểu:<br>- Transaction ID<br>- Transaction type<br>- Transaction base amount<br>- Transaction date<br>- Party ID | High | - Case: CC-01 | TM_CC_3.10 |

## 8. Đề xuất TC còn thiếu (chờ quyết định – chưa đưa vào bảng mục 7 và file Excel)

Đối chiếu 28 TC gốc với BRD v1.9 (CM-1.2, CM-2, CM-3, CM-4, CM-8) theo chuẩn của skill `rbt_manual_testing`, ở mức chi tiết mặc định (Granular): mỗi lỗi validate là 1 TC, mỗi element UI là 1 TC, mỗi hành vi tách riêng.

Quy ước cột "Lưu ý":

- **Trùng** – đã có ở bộ TC khác của MSB, cân nhắc bỏ.
- **Chờ Qx** – chưa viết được kỳ vọng chính xác cho tới khi có câu trả lời ở mục 5.

Khi được duyệt: TC mới đánh ID nối tiếp sau TC cuối của mục 7, cột `TC ID gốc` để trống.

### 8.1. Function – Khởi tạo case thủ công (22 TC)

| Mã | TC cần thêm | Số TC | Lưu ý |
|---|---|---|---|
| G01 | Tạo case thành công khi nhập đầy đủ 10 trường (bắt buộc + tùy chọn) | 1 | |
| G02 | Tạo thành công khi bỏ trống từng trường tùy chọn: chỉ Title / chỉ Priority / chỉ Due | 3 | Priority lần lượt High / Medium / Low |
| G03 | Tạo thành công khi bỏ trống từng cặp trường tùy chọn: Title+Priority / Title+Due / Priority+Due | 3 | |
| G04 | Tạo thành công khi Owner, Assignee, Created By là 3 user khác nhau | 1 | |
| G05 | Tạo thành công khi người tạo là DVKH Maker (bộ hiện có chỉ dùng AML Maker) | 1 | |
| G06 | Tạo thất bại khi thiếu từng trường bắt buộc: Type, Jurisdiction, Business Domain, Owner, Assignee, Created By | 6 | Bộ hiện có chỉ phủ Description. Jurisdiction/Business Domain có mặc định All – cần xác nhận xóa trắng được không |
| G07 | Tạo thất bại khi thiếu 2 trường bắt buộc (Owner + Description) | 1 | |
| G08 | Tạo thất bại khi thiếu 4 trường bắt buộc, hiển thị lỗi đồng thời | 1 | |
| G09 | Tạo thất bại khi để trống toàn bộ form rồi nhấn Create | 1 | |
| G10 | Case ID duy nhất: tạo 2 case liên tiếp → 2 Case ID khác nhau | 1 | |
| G11 | Nhấn Create 2 lần liên tiếp chỉ tạo 1 case | 1 | |
| G12 | Mất kết nối mạng / lỗi 500 khi Create → báo lỗi, không sinh case dở dang | 2 | |

### 8.2. Function – Add Transaction (19 TC)

| Mã | TC cần thêm | Số TC | Lưu ý |
|---|---|---|---|
| G13 | Thêm giao dịch thủ công thành công cho Funds Transfer / Back Office Transaction / Monetary Instrument Transaction | 3 | Bộ hiện có chỉ phủ Cash Transaction |
| G14 | Thêm giao dịch Cash Transaction thành công khi chỉ nhập trường bắt buộc | 1 | Chờ Q4 |
| G15 | Thêm thất bại khi thiếu trường bắt buộc – mỗi loại giao dịch còn lại 1 TC | 3 | Chờ Q4 |
| G16 | Nhấn Save khi form để trống hoàn toàn | 1 | |
| G17 | Thêm giao dịch vào case đã đóng (Closed - No Further Action) bị chặn | 1 | BRD chưa quy định – cần chốt giả định |
| G18 | Lỗi hệ thống khi Save giao dịch | 1 | |
| G19 | Search theo từng tiêu chí: Transaction ID / Transaction type / Transaction date / Transaction base amount / Party ID | 5 | |
| G20 | Search kết hợp 2 tiêu chí; Search khi để trống mọi tiêu chí | 2 | |
| G21 | Gán lại giao dịch đã có trong case thì không thêm trùng; gán nhiều giao dịch cùng lúc | 2 | |

### 8.3. Validate (42 TC – mỗi trường 1 nhóm con)

| Mã | Trường | TC cần thêm | Số TC | Lưu ý |
|---|---|---|---|---|
| G22 | Title | Vượt max length · chỉ khoảng trắng · ký tự `<>&"'` · XSS · SQL injection · Unicode/emoji · cắt khoảng trắng đầu/cuối | 7 | Max length chờ Q2 |
| G23 | Description | Chỉ khoảng trắng · vượt max length · XSS · SQL injection · thẻ HTML · xuống dòng · ký tự đặc biệt/Unicode | 7 | Chờ Q2 |
| G24 | Due | Sai định dạng (31/12/2026) · ngày không tồn tại (02/30/2026) · năm nhuận hợp lệ (02/29/2028) · năm nhuận không hợp lệ (02/29/2027) · ngày quá khứ · nhập chữ | 6 | |
| G25 | Priority | Mặc định trống · đổi/bỏ lựa chọn | 2 | |
| G26 | Type | Giá trị mặc định · chỉ có AML_MN, không có AML_SURV | 2 | |
| G27 | Jurisdiction | Danh sách giá trị · đổi từ All sang chi nhánh cụ thể | 2 | |
| G28 | Business Domain | Danh sách giá trị · đổi từ All sang giá trị cụ thể | 2 | |
| G29 | Owner / Assignee / Created By | User không có role TM (`tm_no_role`) không xuất hiện trong danh sách – 1 TC mỗi trường | 3 | |
| G30 | Trường Add Transaction | Base Amount âm / 0 / chữ / thập phân / số cực lớn · Date sai định dạng / ngày không tồn tại · Transaction Reference ID trùng | 8 | Chờ Q3, Q4 |
| G31 | Trường Search Existing Entities | Transaction date sai định dạng · Transaction base amount nhập chữ · XSS/SQL injection trong Transaction ID | 3 | |

### 8.4. UI & Behavior (22 TC)

| Mã | TC cần thêm | Số TC | Lưu ý |
|---|---|---|---|
| G32 | Label và dấu `*` của từng trường form Create Case (7 trường có `*`, 3 trường không) – 1 TC mỗi trường | 10 | |
| G33 | Hiển thị nút Reset / Create; trạng thái mặc định các trường khi mở form | 2 | |
| G34 | Focus · Tab · Shift+Tab · hover nút · resize · zoom · Browser Back khi đang nhập · trạng thái nút Create khi chưa đủ trường bắt buộc | 8 | |
| G35 | Thứ tự Tab và Browser Back trên form Add Transaction | 2 | |

### 8.5. Phân quyền (7 TC)

| Mã | TC cần thêm | Số TC | Lưu ý |
|---|---|---|---|
| G36 | Quyền Add Transaction theo 6 role: DVKH Maker, DVKH Checker, Checker N+1, AML Maker, AML Checker, Admin/IT (CÓ QUYỀN / KHÔNG CÓ QUYỀN) | 6 | Ma trận phân quyền chưa có dòng riêng; quyền tạo case đã có ở `TC_PHAN-QUYEN 6.md` REQ-13, REQ-16 |
| G37 | Không thêm được giao dịch vào case thuộc chi nhánh khác | 1 | |

### 8.6. Ảnh hưởng chức năng liên quan (12 TC – hiện chưa có TC nào)

| Mã | TC cần thêm | Số TC | Lưu ý |
|---|---|---|---|
| G38 | Case mới hiển thị đúng ở Case List (11 cột theo CM-3.1, BRD dòng 283–297) | 1 | Trùng một phần sheet Case List của bộ UI |
| G39 | Case mới hiển thị đúng ở Case Summary / Case Details (CM-3.2) | 1 | |
| G40 | Tìm thấy case mới theo Type = AML_MN và theo Case ID (CM-2) | 1 | Trùng một phần TM_UI_CASE_LIST.02.x |
| G41 | Assignee của case thủ công = user tạo case (CM-4, BRD dòng 317) | 1 | Trùng TM_UI_CASE_DETAIL.10.3; mâu thuẫn Q6 |
| G42 | Audit Trail ghi nhận Create Case / Add Transaction (CM-8) | 2 | |
| G43 | Giao dịch thêm thủ công / giao dịch được gán hiển thị đúng ở phần giao dịch của Case Details (CM-3.2) | 2 | |
| G44 | Trạng thái sau Create: AML Maker → Pending Generate STR; DVKH Maker → bắt buộc Save EDD, Pending Checker Review, gửi email EM-2 (BRD dòng 87, 119) | 2 | Trùng WF_TM_AML.01.01, WF_TM_DVKH.01.01 (bộ Workflow) |
| G45 | Bản ghi case trong DB lưu đúng và đủ các trường | 1 | |

### 8.7. Tổng hợp

| Nhóm | Số TC thiếu |
|---|---|
| Function – Khởi tạo case thủ công | 22 |
| Function – Add Transaction | 19 |
| Validate | 42 |
| UI & Behavior | 22 |
| Phân quyền | 7 |
| Ảnh hưởng chức năng liên quan | 12 |
| **Tổng** | **124** |

Nếu bỏ 3 TC trùng hẳn bộ khác (G41, G44) thì còn 121. Trong đó 14 TC chờ câu trả lời Q2, Q3, Q4 (G14, G15, TC max length của G22 và G23, G30); G41 phụ thuộc Q6.
