# POST /transaction-screening/v1/transaction-screening - API Sàng Lọc Giao Dịch (AML Transaction Screening)

<!--
=========================== THÔNG TIN NGUỒN ===========================
- PTTK   : requirements/Thiết kế tích hợp điện.xlsx
           (sheets: 1.API Information, 1.1 Sample Request, 1.2. Response Element,
            1.3 Sample Response, Code Set (LOV), maping aml intergation)
- TC gốc : requirements/MSB_AML_Testcase_API_TF_v1.1.xlsx — CHỈ sheet "API Sàng Lọc" (303 TC)
- DB     : [ASSUMPTION: Không có tài liệu DB connection — bỏ qua mọi assertion tầng Database.
           Sheet "maping aml intergation" chỉ mô tả bảng cấu hình MSB_TF_CONFIG_MESSAGE(_DTLS),
           không phải bảng lưu giao dịch, không đủ để verify ghi DB.]
- RSD    : [PENDING_DOC: File thiết kế tham chiếu sheet "ErrorCode" nhưng sheet này KHÔNG tồn tại
           trong file. Bảng mã lỗi 00/01/03/05/07/08 lấy từ bộ TC gốc.]

=========================== CẤU HÌNH CẤU PHẦN ===========================
  AUTH_REQUIRED=YES (Basic Auth) | METHOD_CHECK=ON | CONTENT_TYPE_CHECK=ON | ACCEPT_HEADER_CHECK=ON
  MANDATORY_CHECK=BOTH | TYPE_CHECK=DEFAULT | LENGTH_CHECK=MAX_ONLY
  MALFORMED_JSON_CHECK=ON | EXTRA_FIELDS_CHECK=ON
  BVA_MODE=FULL | EG_CHECK=FULL
  RSP_SCHEMA_CHECK=ON | RSP_DATA_CHECK=ON | RSP_ERROR_CHECK=ON
  RSP_CONTENT_TYPE_CHECK=ON | RSP_PAGINATION_CHECK=OFF (không phải List/Search API)

=========================== ĐẶC THÙ API NÀY ===========================
1. 7 tham số nghiệp vụ (transactionId, requestId, transactionType, branchCd, channel,
   requestUserId, isCallBack) truyền ở tầng HTTP HEADER (sheet "1.1 Sample Request" đặt tên
   cột là "Header"), KHÔNG nằm trong JSON body.
   → Missing/Invalid các tham số này thuộc Cấu phần 1 [Basic]; Max Length thuộc Cấu phần 2.
2. Request Body là BẢN TIN THÔ (raw message), không phải JSON có schema field-by-field:
   MT = text SWIFT | MX = XML ISO 20022 | MSB001, MSB002 = JSON Object | MSB003 = JSON Array.
   → Cấu phần 2 kiểm "field mandatory bên trong bản tin" (errorCode=03) thay cho schema JSON.
3. Mọi kết quả NGHIỆP VỤ đều trả HTTP 200; trạng thái phân biệt qua $.result và $.errorCode.
   → Cấu phần 4 (Response Validation) là lớp kiểm thử quan trọng nhất của API này.

=========================== CẤU TRÚC PHÂN NHÓM ===========================
Test Design này tổ chức theo 3 tầng chuẩn của skill api_test_design
(xem `API-TD-1-Setup-Context.md` mục IV):

  ## Nhóm rủi ro RBT  →  ### BLOCK  →  #### Test Condition

TẦNG 1 — 4 NHÓM RỦI RO RBT (cột "Function" của file Test Case).
Đây là bản API của 5 nhóm rủi ro mà skill rbt_manual_testing dùng cho TC UI; nhóm
"UI & Behavior" không áp dụng cho API nên được lược bỏ:

  | Nhóm                              | Risk   | Node | Phạm vi trong API này                    |
  |-----------------------------------|--------|------|------------------------------------------|
  | NHÓM FUNCTION                     | High   |  30  | Happy Path, kết quả sàng lọc HIT/No-HIT/ |
  |                                   |        |      | KNOCKED-OUT, logic chéo body vs          |
  |                                   |        |      | transactionType, biên hợp lệ             |
  | NHÓM VALIDATE                     | Medium |  63  | Thiếu/rỗng/sai kiểu/quá độ dài của header|
  |                                   |        |      | và của trường mandatory trong bản tin;   |
  |                                   |        |      | sai method/endpoint/Content-Type/Accept  |
  | NHÓM PHÂN QUYỀN                   | High   |   3  | Basic Auth: thiếu, sai mật khẩu, sai     |
  |                                   |        |      | format header Authorization              |
  | NHÓM ẢNH HƯỞNG CHỨC NĂNG LIÊN QUAN| High   |  28  | Callback sang hệ thống ngoài (isCallBack)|
  |                                   |        |      | và hợp đồng dữ liệu trả về cho T24/kênh  |

LƯU Ý: 4 cấu phần của phương pháp 4-phase (Method & Header / Schema Validation /
Value-Business-Cross-Logic / Response Validation) vẫn là cách SINH RA Test Condition, và
vẫn nằm trong tiền tố node TD_P1..TD_P4. Chúng KHÔNG còn là tầng trình bày. Vì vậy một nhóm
rủi ro có thể chứa node đến từ nhiều cấu phần khác nhau (VD NHÓM VALIDATE chứa cả
TD_P1_0xx [Basic] lẫn TD_P2_0xx [Missing]) — đó là đúng theo thiết kế.

TẦNG 2 — BLOCK (cột "Group Tests"). API này thuộc Trường hợp A của mục IV.2 (có chiều
nghiệp vụ chính là transactionType), nên NHÓM FUNCTION và NHÓM VALIDATE chia block theo
loại bản tin:

  | Block    | Phạm vi                                                              |
  |----------|----------------------------------------------------------------------|
  | Common   | Không phụ thuộc transactionType (endpoint, method, header chung)      |
  | MT       | SWIFT MT Standard — MT195/196/199/295/296/299/499/700/701/707/       |
  |          | 710/711/720/740/742/747/760/767/799/999                             |
  | MX       | ISO 20022 — MX_IN / MX_OUT (pacs.009, pacs.004, pacs.008,           |
  |          | CAMT.110, CAMT.111)                                                  |
  | MSB001   | Custom Message Non-Swift 1 (JSON Object)                             |
  | MSB002   | Custom Message Non-Swift 2 (JSON Object)                             |
  | MSB003   | Custom Message Non-Swift 3 (JSON Array)                              |

Hai nhóm còn lại không phụ thuộc transactionType nên dùng block theo mối quan tâm:

  | Nhóm                              | Block                                       |
  |-----------------------------------|---------------------------------------------|
  | NHÓM PHÂN QUYỀN                   | Authentication                              |
  | NHÓM ẢNH HƯỞNG CHỨC NĂNG LIÊN QUAN| Callback & Trigger · Response Contract ·    |
  |                                   | Response Data · Response Error              |

TẦNG 3 — TEST CONDITION. Số thứ tự <NNN> chạy liên tục trong phạm vi 1 CẤU PHẦN
(TD_P1_001..., TD_P2_001...), không đánh lại theo nhóm rủi ro — nhờ vậy mỗi node giữ
nguyên ID xuyên suốt và cột "Notes" của Test Case truy ngược được bằng "TD: TD_Pn_NNN".

=========================== CHÚ THÍCH MAP ===========================
  <!-- MAP: <ID TC gốc> -->  = node được phủ bởi TC ĐÃ CÓ trong file gốc (giữ nguyên câu chữ).
  <!-- NEW -->               = node CHƯA có TC nào trong file gốc → sinh TC BỔ SUNG, đánh dấu rõ.
-->

## NHÓM FUNCTION

### BLOCK: Common — Risk: High

#### TD_P1_001 - [Smoke] - Happy Path (đúng endpoint, method POST, Basic Auth hợp lệ)
- **Steps**: Gọi POST đúng endpoint với Authorization Basic hợp lệ, Content-Type application/json và body điện MT hợp lệ.
- **Expected**: HTTP 200. Request vượt qua Gateway vào xử lý nghiệp vụ, response trả đủ 12 field.
<!-- MAP: AML_API_EP_01 -->

#### TD_P1_002 - [Smoke] - Happy Path (đầy đủ 7 tham số header bắt buộc)
- **Steps**: Gọi POST với đủ transactionId, requestId, transactionType, branchCd, channel, isCallBack và requestUserId.
- **Expected**: HTTP 200, errorCode = "00", xử lý thành công.
<!-- MAP: AML_API_HDR_01 -->

<!-- BƯỚC 1: HTTP METHOD & ENDPOINT -->

#### TD_P2_001 - [Smoke] - Happy Path (cả 6 giá trị transactionType đều parse được bản tin hợp lệ)
- **Steps**: Gửi lần lượt 6 request MT, MX_IN, MX_OUT, MSB001, MSB002, MSB003, mỗi request kèm bản tin đúng chuẩn tương ứng.
- **Expected**: Cả 6 request trả HTTP 200, errorCode = "00", transactionType echo đúng.
<!-- MAP: AML_API_NF_08 -->

<!-- MAX LENGTH cho 7 tham số header (PTTK sheet "1.1 Sample Request") -->

#### TD_P3_005 - [BVA+] - 'channel' tại biên trên hợp lệ (Max = 100 ký tự)
- **Steps**: Gửi POST với channel dài đúng 100 ký tự.
- **Expected**: HTTP 200, errorCode = "00", request được chấp nhận.
<!-- MAP: AML_API_NF_01 -->

#### TD_P3_006 - [BVA+] - 'transactionId' tại biên trên hợp lệ (Max = 100 ký tự)
- **Steps**: Gửi POST với transactionId dài đúng 100 ký tự.
- **Expected**: HTTP 200, errorCode = "00", transactionId echo đúng 100 ký tự trong response.
<!-- NEW -->

#### TD_P3_007 - [BVA+] - 'requestId' tại biên trên hợp lệ (Max = 100 ký tự)
- **Steps**: Gửi POST với requestId dài đúng 100 ký tự.
- **Expected**: HTTP 200, errorCode = "00", requestId echo đúng 100 ký tự trong response.
<!-- NEW -->

#### TD_P3_008 - [BVA+] - 'branchCd' tại biên trên hợp lệ (Max = 50 ký tự)
- **Steps**: Gửi POST với branchCd dài đúng 50 ký tự.
- **Expected**: HTTP 200, errorCode = "00", branchCd echo đúng trong response.
<!-- NEW -->

#### TD_P3_012 - [DT] - Cross-logic: cùng cấu trúc body, khác transactionType (MSB001 vs MSB002)
- **Steps**: Gửi cùng một body JSON với transactionType = MSB001, sau đó với transactionType = MSB002.
- **Expected**: HTTP 200 cả hai lượt, mỗi lượt echo đúng transactionType đã gửi, kết quả sàng lọc theo cấu hình từng loại điện.
<!-- MAP: AML_API_NF_06 -->

### BLOCK: MT — Risk: High

#### TD_P3_013 - [Smoke] - Happy Path (điện MT hợp lệ, kết quả sàng lọc No-HIT)
- **Steps**: Gửi POST điện MT hợp lệ với dữ liệu các bên không nằm trong danh sách cấm vận.
- **Expected**: HTTP 200, result = "No-HIT", errorCode = "00", score = 0, alertId rỗng.
<!-- MAP: AML_API_MT_01 -->

#### TD_P3_014 - [ECP] - Kết quả sàng lọc HIT với điện MT (khớp danh sách cấm vận)
- **Steps**: Gửi POST điện MT chứa đối tượng nằm trong danh sách cấm vận.
- **Expected**: HTTP 200, result = "HIT", errorCode = "00", score > 0, alertId khác rỗng.
<!-- MAP: AML_API_MT_02 -->

#### TD_P3_015 - [ECP] - Kết quả sàng lọc KNOCKED-OUT với điện MT (quốc gia Knock-out)
- **Steps**: Gửi POST điện MT chứa quốc gia thuộc danh sách Knock-out.
- **Expected**: HTTP 200, result = "KNOCKED-OUT", errorCode = "00", alertId khác rỗng.
<!-- MAP: AML_API_MT_03 -->

### BLOCK: MX — Risk: High

#### TD_P3_018 - [Smoke] - Happy Path (điện MX_IN hợp lệ, kết quả No-HIT)
- **Steps**: Gửi POST điện MX_IN (ISO 20022) hợp lệ, dữ liệu không thuộc danh sách cấm vận.
- **Expected**: HTTP 200, result = "No-HIT", errorCode = "00".
<!-- MAP: AML_API_MX_01 -->

#### TD_P3_019 - [Smoke] - Happy Path (điện MX_OUT hợp lệ, kết quả No-HIT)
- **Steps**: Gửi POST điện MX_OUT hợp lệ, dữ liệu không thuộc danh sách cấm vận.
- **Expected**: HTTP 200, result = "No-HIT", errorCode = "00".
<!-- MAP: AML_API_MX_02 -->

#### TD_P3_020 - [ECP] - Kết quả sàng lọc HIT với điện MX_IN
- **Steps**: Gửi POST điện MX_IN chứa đối tượng nằm trong danh sách cấm vận.
- **Expected**: HTTP 200, result = "HIT", errorCode = "00", alertId khác rỗng.
<!-- MAP: AML_API_MX_03 -->

#### TD_P3_021 - [ECP] - Kết quả sàng lọc KNOCKED-OUT với điện MX_IN
- **Steps**: Gửi POST điện MX_IN chứa quốc gia thuộc danh sách Knock-out.
- **Expected**: HTTP 200, result = "KNOCKED-OUT", errorCode = "00".
<!-- MAP: AML_API_MX_04 -->

#### TD_P3_022 - [DT] - Cross-logic: body MT nhưng transactionType = MX_IN
- **Steps**: Gửi POST với transactionType = MX_IN nhưng body là điện SWIFT MT.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03", errorDetail = "Invalid message format".
<!-- MAP: AML_API_MX_06_a -->

### BLOCK: MSB001 — Risk: High

#### TD_P3_023 - [Smoke] - Happy Path (điện MSB001 hợp lệ, kết quả No-HIT)
- **Steps**: Gửi POST điện MSB001 hợp lệ, dữ liệu không thuộc danh sách cấm vận.
- **Expected**: HTTP 200, result = "No-HIT", errorCode = "00".
<!-- MAP: AML_API_MSB001_01 -->

#### TD_P3_024 - [ECP] - Kết quả sàng lọc HIT với điện MSB001
- **Steps**: Gửi POST điện MSB001 chứa đối tượng nằm trong danh sách cấm vận.
- **Expected**: HTTP 200, result = "HIT", errorCode = "00", alertId khác rỗng.
<!-- MAP: AML_API_MSB001_02 -->

#### TD_P3_025 - [ECP] - Kết quả sàng lọc KNOCKED-OUT với điện MSB001
- **Steps**: Gửi POST điện MSB001 chứa quốc gia thuộc danh sách Knock-out.
- **Expected**: HTTP 200, result = "KNOCKED-OUT", errorCode = "00".
<!-- MAP: AML_API_MSB001_03 -->

#### TD_P3_026 - [DT] - Cross-logic: body MT nhưng transactionType = MSB001
- **Steps**: Gửi POST với transactionType = MSB001 nhưng body là điện SWIFT MT.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03".
<!-- MAP: AML_API_MSB001_05 -->

#### TD_P3_027 - [DT] - Chuyển đổi thông tin điện MSB001 từ JSON sang XML khi gọi API sàng lọc
- **Steps**: Gửi POST điện MSB001 dạng JSON, đối chiếu thông tin đã được chuyển đổi sang XML theo bảng cấu hình mapping.
- **Expected**: HTTP 200, thông tin được confirm bình thường, mapping đúng theo bảng cấu hình MSB_TF_CONFIG_MESSAGE_DTLS.
<!-- MAP: AML_MSB001_MND_01 -->

### BLOCK: MSB002 — Risk: High

#### TD_P3_028 - [Smoke] - Happy Path (điện MSB002 hợp lệ, kết quả No-HIT)
- **Steps**: Gửi POST điện MSB002 hợp lệ, dữ liệu không thuộc danh sách cấm vận.
- **Expected**: HTTP 200, result = "No-HIT", errorCode = "00".
<!-- MAP: AML_API_MSB002_01 -->

#### TD_P3_029 - [ECP] - Kết quả sàng lọc HIT với điện MSB002
- **Steps**: Gửi POST điện MSB002 chứa đối tượng nằm trong danh sách cấm vận.
- **Expected**: HTTP 200, result = "HIT", errorCode = "00", alertId khác rỗng.
<!-- MAP: AML_API_MSB002_02 -->

#### TD_P3_030 - [ECP] - Kết quả sàng lọc KNOCKED-OUT với điện MSB002
- **Steps**: Gửi POST điện MSB002 chứa quốc gia thuộc danh sách Knock-out.
- **Expected**: HTTP 200, result = "KNOCKED-OUT", errorCode = "00".
<!-- MAP: AML_API_MSB002_03 -->

#### TD_P3_031 - [DT] - Cross-logic: body MT nhưng transactionType = MSB002
- **Steps**: Gửi POST với transactionType = MSB002 nhưng body là điện SWIFT MT.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03".
<!-- MAP: AML_API_NF_07 -->

#### TD_P3_032 - [DT] - Chuyển đổi thông tin điện MSB002 từ JSON sang XML khi gọi API sàng lọc
- **Steps**: Gửi POST điện MSB002 dạng JSON, đối chiếu thông tin đã được chuyển đổi sang XML theo bảng cấu hình mapping.
- **Expected**: HTTP 200, thông tin được confirm bình thường, mapping đúng theo bảng cấu hình MSB_TF_CONFIG_MESSAGE_DTLS.
<!-- MAP: AML_MSB002_MND_01 -->

### BLOCK: MSB003 — Risk: High

#### TD_P3_033 - [Smoke] - Happy Path (điện MSB003 hợp lệ, kết quả No-HIT)
- **Steps**: Gửi POST điện MSB003 (JSON Array) hợp lệ, dữ liệu không thuộc danh sách cấm vận.
- **Expected**: HTTP 200, result = "No-HIT", errorCode = "00".
<!-- MAP: AML_API_MSB003_01 -->

#### TD_P3_034 - [ECP] - Kết quả sàng lọc HIT với điện MSB003 (Debtor/Creditor/InvolvedParty)
- **Steps**: Gửi POST điện MSB003 có Debtor/Creditor/InvolvedParty khớp danh sách cấm vận.
- **Expected**: HTTP 200, result = "HIT", errorCode = "00", alertId khác rỗng.
<!-- MAP: AML_API_MSB003_02 -->

#### TD_P3_035 - [ECP] - Kết quả sàng lọc KNOCKED-OUT với điện MSB003
- **Steps**: Gửi POST điện MSB003 chứa quốc gia thuộc danh sách Knock-out.
- **Expected**: HTTP 200, result = "KNOCKED-OUT", errorCode = "00".
<!-- MAP: AML_API_MSB003_03 -->

#### TD_P3_036 - [DT] - Chuyển đổi thông tin điện MSB003 từ JSON sang XML khi gọi API sàng lọc
- **Steps**: Gửi POST điện MSB003 dạng JSON, đối chiếu thông tin đã được chuyển đổi sang XML theo bảng cấu hình mapping.
- **Expected**: HTTP 200, thông tin được confirm bình thường, mapping đúng theo bảng cấu hình MSB_TF_CONFIG_MESSAGE_DTLS.
<!-- MAP: AML_MSB003_MND_01_a -->

## NHÓM VALIDATE

### BLOCK: Giao thức HTTP — Risk: Medium

#### TD_P1_003 - [Protocol] - Gọi sai endpoint URL
- **Steps**: Gửi POST tới đường dẫn không tồn tại (/wrong-path/v1/transaction-screening).
- **Expected**: HTTP 404 Not Found, không có body nghiệp vụ.
<!-- MAP: AML_API_EP_02 -->
<!-- MAP: AML_API_HTTP_04 --> <!-- TC gốc trùng phạm vi với AML_API_EP_02 — giữ nguyên cả hai, không xoá -->

#### TD_P1_004 - [Protocol] - Gọi đúng endpoint nhưng sai HTTP Method (GET)
- **Steps**: Gửi GET tới đúng endpoint, không có body.
- **Expected**: HTTP 405 Method Not Allowed, không có body nghiệp vụ.
<!-- MAP: AML_API_EP_03 -->

<!-- BƯỚC 2: AUTHORIZATION (Basic Auth) -->

#### TD_P1_005 - [Format] - Sai Content-Type (text/plain)
- **Steps**: Gửi POST với Content-Type text/plain trong khi PTTK quy định application/json.
- **Expected**: HTTP 415 Unsupported Media Type. [ASSUMPTION: PTTK chỉ khai báo Content-Type hợp lệ, không mô tả hành vi khi sai — theo chuẩn HTTP expect 415.]
<!-- NEW -->

<!-- BƯỚC 4: ACCEPT HEADER -->

#### TD_P1_006 - [Accept] - Accept yêu cầu định dạng không được hỗ trợ (text/xml)
- **Steps**: Gửi POST với Accept text/xml trong khi API chỉ trả application/json.
- **Expected**: HTTP 406 Not Acceptable HOẶC HTTP 200 trả application/json. [ASSUMPTION: PTTK khai Accept là */* — chấp nhận cả hai hành vi, ghi nhận kết quả thực tế làm baseline.]
<!-- NEW -->

<!-- BƯỚC 5: CUSTOM HEADERS — 7 tham số nghiệp vụ truyền ở tầng header -->

### BLOCK: Header: transactionId — Risk: Medium

#### TD_P1_007 - [Basic] - Thiếu header bắt buộc 'transactionId'
- **Steps**: Gửi POST không truyền transactionId, các tham số còn lại đầy đủ.
- **Expected**: HTTP 200, result = ERROR, errorCode = "01", errorDetail = "Missing Parameter".
<!-- MAP: AML_API_HDR_02 -->

#### TD_P1_016 - [Basic] - Header bắt buộc truyền giá trị rỗng ("") thay vì thiếu key
- **Steps**: Gửi POST với transactionId = "" (header tồn tại nhưng giá trị rỗng).
- **Expected**: HTTP 200, result = ERROR, errorCode = "01", errorDetail = "Missing Parameter". [ASSUMPTION: PTTK không phân biệt Missing key và Empty value — expect cùng errorCode 01.]
<!-- NEW -->

#### TD_P2_002 - [Max Length] - 'transactionId' vượt Max Length (101 ký tự, Max = 100)
- **Steps**: Gửi POST với transactionId dài 101 ký tự.
- **Expected**: HTTP 200, result = ERROR, errorCode = "01".
<!-- MAP: AML_API_HDR_12 -->

#### TD_P3_009 - [EG] - Ký tự đặc biệt trong 'transactionId'
- **Steps**: Gửi POST với transactionId chứa ký tự đặc biệt.
- **Expected**: Hệ thống xử lý ổn định — chấp nhận và echo nguyên vẹn, hoặc từ chối với errorCode xác định; không lỗi hệ thống.
<!-- MAP: AML_API_NF_03 -->

### BLOCK: Header: requestId — Risk: Medium

#### TD_P1_008 - [Basic] - Thiếu header bắt buộc 'requestId'
- **Steps**: Gửi POST không truyền requestId.
- **Expected**: HTTP 200, result = ERROR, errorCode = "01", errorDetail = "Missing Parameter".
<!-- MAP: AML_API_HDR_03 -->

#### TD_P2_004 - [Max Length] - 'requestId' vượt Max Length (101 ký tự, Max = 100)
- **Steps**: Gửi POST với requestId dài 101 ký tự.
- **Expected**: HTTP 200, result = ERROR, errorCode = "01".
<!-- NEW -->

### BLOCK: Header: transactionType — Risk: Medium

#### TD_P1_009 - [Basic] - Thiếu header bắt buộc 'transactionType'
- **Steps**: Gửi POST không truyền transactionType.
- **Expected**: HTTP 200, result = ERROR, errorCode = "01", errorDetail = "Missing Parameter".
<!-- MAP: AML_API_HDR_04 -->

#### TD_P1_015 - [Basic] - Header 'transactionType' không thuộc Code Set được hỗ trợ
- **Steps**: Gửi POST với transactionType là giá trị ngoài LOV (MT / MX_IN / MX_OUT / MSB001 / MSB002 / MSB003).
- **Expected**: HTTP 200, result = ERROR, errorCode = "01" hoặc "03".
<!-- MAP: AML_API_HDR_13 -->

#### TD_P2_006 - [Max Length] - 'transactionType' vượt Max Length (51 ký tự, Max = 50)
- **Steps**: Gửi POST với transactionType dài 51 ký tự.
- **Expected**: HTTP 200, result = ERROR, errorCode = "01".
<!-- NEW -->

### BLOCK: Header: branchCd — Risk: Medium

#### TD_P1_010 - [Basic] - Thiếu header bắt buộc 'branchCd'
- **Steps**: Gửi POST không truyền branchCd.
- **Expected**: HTTP 200, result = ERROR, errorCode = "01", errorDetail = "Missing Parameter".
<!-- MAP: AML_API_HDR_05 -->

#### TD_P2_005 - [Max Length] - 'branchCd' vượt Max Length (51 ký tự, Max = 50)
- **Steps**: Gửi POST với branchCd dài 51 ký tự.
- **Expected**: HTTP 200, result = ERROR, errorCode = "01".
<!-- NEW -->

### BLOCK: Header: channel — Risk: Medium

#### TD_P1_011 - [Basic] - Thiếu header bắt buộc 'channel'
- **Steps**: Gửi POST không truyền channel.
- **Expected**: HTTP 200, result = ERROR, errorCode = "01", errorDetail = "Missing Parameter".
<!-- MAP: AML_API_HDR_06 -->

#### TD_P2_003 - [Max Length] - 'channel' vượt Max Length (101 ký tự, Max = 100)
- **Steps**: Gửi POST với channel dài 101 ký tự.
- **Expected**: HTTP 200, result = ERROR, errorCode = "01".
<!-- MAP: AML_API_NF_02 -->

#### TD_P3_010 - [EG] - Emoji / ký tự Unicode đặc biệt trong 'channel'
- **Steps**: Gửi POST với channel chứa emoji và ký tự Unicode ngoài BMP.
- **Expected**: HTTP 200 với channel echo nguyên vẹn, HOẶC result = ERROR errorCode = "01"; tuyệt đối không HTTP 500. [ASSUMPTION: PTTK không quy định charset cho channel.]
<!-- NEW -->

#### TD_P3_011 - [Whitespace] - 'channel' chỉ chứa khoảng trắng
- **Steps**: Gửi POST với channel = "   " (3 khoảng trắng).
- **Expected**: HTTP 200 với giá trị được trim/từ chối, HOẶC result = ERROR errorCode = "01". [ASSUMPTION: PTTK không quy định xử lý whitespace-only.]
<!-- NEW -->

### BLOCK: Header: isCallBack — Risk: Medium

#### TD_P1_012 - [Basic] - Thiếu header bắt buộc 'isCallBack'
- **Steps**: Gửi POST không truyền isCallBack.
- **Expected**: HTTP 200, result = ERROR, errorCode = "01", errorDetail = "Missing Parameter".
<!-- MAP: AML_API_HDR_07 -->

<!-- Optional field — chỉ kiểm trường hợp không truyền vẫn hợp lệ, KHÔNG sinh [Missing] lỗi -->

#### TD_P1_014 - [Basic] - Header 'isCallBack' sai định dạng giá trị (khác Y/N)
- **Steps**: Gửi POST với isCallBack = 'X'.
- **Expected**: HTTP 200, result = ERROR, errorCode = "01".
<!-- MAP: AML_API_HDR_11 -->

### BLOCK: Header: requestUserId — Risk: Medium

#### TD_P1_013 - [Basic] - Không truyền header optional 'requestUserId' vẫn hợp lệ
- **Steps**: Gửi POST đủ 6 tham số bắt buộc, bỏ requestUserId.
- **Expected**: HTTP 200, errorCode = "00", xử lý bình thường.
<!-- MAP: AML_API_HDR_08 -->

#### TD_P2_007 - [Max Length] - 'requestUserId' (optional) vượt Max Length (101 ký tự, Max = 100)
- **Steps**: Gửi POST có truyền requestUserId dài 101 ký tự.
- **Expected**: HTTP 200, result = ERROR, errorCode = "01".
<!-- NEW -->

### BLOCK: Header: field lạ — Risk: Medium

#### TD_P2_008 - [Extra-Fields] - Request kèm header lạ không định nghĩa trong PTTK
- **Steps**: Gửi POST hợp lệ kèm thêm header lạ (VD: x-injected-role: ADMIN).
- **Expected**: HTTP 200, header lạ bị bỏ qua hoàn toàn, không xuất hiện trong response, không đổi kết quả sàng lọc. [ASSUMPTION: PTTK không định nghĩa hành vi với header lạ — expect silently ignore.]
<!-- NEW -->

### BLOCK: Cấu trúc body: MT — Risk: Medium

#### TD_P2_009 - [Malformed] - Body điện MT sai format (không phải chuẩn SWIFT MT)
- **Steps**: Gửi POST với transactionType = MT nhưng body là chuỗi không đúng cấu trúc block SWIFT.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03", errorDetail = "Invalid message format".
<!-- MAP: AML_API_MT_04 -->

#### TD_P2_010 - [Empty] - Body điện MT rỗng
- **Steps**: Gửi POST với transactionType = MT và body rỗng.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03".
<!-- MAP: AML_API_MT_05 -->

<!-- MANDATORY FIELDS BÊN TRONG BẢN TIN MT (errorCode = 03) — mỗi node = 1 loại điện -->

### BLOCK: Cấu trúc body: MX — Risk: Medium

#### TD_P2_031 - [Malformed] - Body điện MX sai cấu trúc XML (không đúng schema ISO 20022)
- **Steps**: Gửi POST với transactionType = MX_IN nhưng body XML không đúng schema ISO 20022.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03".
<!-- MAP: AML_API_MX_05 -->

#### TD_P2_032 - [Empty] - Body điện MX rỗng
- **Steps**: Gửi POST với transactionType = MX_IN và body rỗng.
- **Expected**: HTTP 400 Bad Request (theo TC gốc — khác hành vi với MT body rỗng trả errorCode 03).
<!-- MAP: AML_API_MX_06_b -->

### BLOCK: Cấu trúc body: MSB001 — Risk: Medium

#### TD_P2_038 - [Malformed] - Body điện MSB001 sai cấu trúc JSON
- **Steps**: Gửi POST với transactionType = MSB001 và body JSON sai cấu trúc.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03".
<!-- MAP: AML_API_MSB001_04 -->

#### TD_P2_039 - [Empty] - Body điện MSB001 rỗng
- **Steps**: Gửi POST với transactionType = MSB001 và body rỗng.
- **Expected**: HTTP 200 với result = ERROR, errorCode = "03" HOẶC HTTP 400. [ASSUMPTION: PTTK không quy định; TC gốc cho MT trả 03 còn MX trả 400 — cần chốt hành vi thống nhất.]
<!-- NEW -->

### BLOCK: Cấu trúc body: MSB002 — Risk: Medium

#### TD_P2_041 - [Malformed] - Body điện MSB002 sai cấu trúc JSON
- **Steps**: Gửi POST với transactionType = MSB002 và body JSON sai cấu trúc.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03".
<!-- MAP: AML_API_MSB002_04 -->

#### TD_P2_042 - [Empty] - Body điện MSB002 rỗng
- **Steps**: Gửi POST với transactionType = MSB002 và body rỗng.
- **Expected**: HTTP 200 với result = ERROR, errorCode = "03" HOẶC HTTP 400. [ASSUMPTION: như TD_P2_039.]
<!-- NEW -->

### BLOCK: Cấu trúc body: MSB003 — Risk: Medium

#### TD_P2_044 - [Type] - Body MSB003 là JSON Object thay vì JSON Array
- **Steps**: Gửi POST với transactionType = MSB003 và body là {} thay vì [{}].
- **Expected**: HTTP 200, result = ERROR, errorCode = "03", errorDetail = "Invalid message format".
<!-- MAP: AML_API_MSB003_04 -->

#### TD_P2_045 - [Malformed] - Body điện MSB003 sai cú pháp JSON (thiếu dấu đóng ngoặc)
- **Steps**: Gửi POST với transactionType = MSB003 và body JSON Array bị lỗi cú pháp (thiếu ký tự ]).
- **Expected**: HTTP 200 với result = ERROR, errorCode = "03" HOẶC HTTP 400 tầng gateway. [ASSUMPTION: PTTK không tách bạch lỗi cú pháp JSON và lỗi cấu trúc bản tin.]
<!-- NEW -->

#### TD_P2_046 - [Empty] - Body điện MSB003 rỗng
- **Steps**: Gửi POST với transactionType = MSB003 và body rỗng.
- **Expected**: HTTP 200 với result = ERROR, errorCode = "03" HOẶC HTTP 400. [ASSUMPTION: như TD_P2_039.]
<!-- NEW -->

### BLOCK: Bản tin MT195 — Risk: Medium

#### TD_P2_011 - [Missing] - Thiếu field mandatory trong điện MT195 (3 field: :20:, :21:, :75:)
- **Steps**: Lần lượt gửi POST với body MT195 thiếu từng field mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MT195_MND -->

### BLOCK: Bản tin MT196 — Risk: Medium

#### TD_P2_012 - [Missing] - Thiếu field mandatory trong điện MT196 (1 field: :20:)
- **Steps**: Gửi POST với body MT196 thiếu field :20:.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03".
<!-- MAP: AML_MT196_MND -->

### BLOCK: Bản tin MT199 — Risk: Medium

#### TD_P2_013 - [Missing] - Thiếu field mandatory trong điện MT199 (2 field: :20:, :79:)
- **Steps**: Lần lượt gửi POST với body MT199 thiếu từng field mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MT199_MND -->

### BLOCK: Bản tin MT295 — Risk: Medium

#### TD_P2_014 - [Missing] - Thiếu field mandatory trong điện MT295 (3 field: :20:, :21:, :75:)
- **Steps**: Lần lượt gửi POST với body MT295 thiếu từng field mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MT295_MND -->

### BLOCK: Bản tin MT296 — Risk: Medium

#### TD_P2_015 - [Missing] - Thiếu field mandatory trong điện MT296 (3 field: :20:, :21:, :76:)
- **Steps**: Lần lượt gửi POST với body MT296 thiếu từng field mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MT296_MND -->

### BLOCK: Bản tin MT299 — Risk: Medium

#### TD_P2_016 - [Missing] - Thiếu field mandatory trong điện MT299 (2 field: :20:, :79:)
- **Steps**: Lần lượt gửi POST với body MT299 thiếu từng field mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MT299_MND -->

### BLOCK: Bản tin MT499 — Risk: Medium

#### TD_P2_017 - [Missing] - Thiếu field mandatory trong điện MT499 (2 field: :20:, :79:)
- **Steps**: Lần lượt gửi POST với body MT499 thiếu từng field mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MT499_MND -->

### BLOCK: Bản tin MT700 — Risk: Medium

#### TD_P2_018 - [Missing] - Thiếu field mandatory trong điện MT700 (12 field)
- **Steps**: Lần lượt gửi POST với body MT700 thiếu từng field mandatory (:20:, :27:, :31C:, :31D:, :32B:, :40A:, :40E:, :41A:, :41D:, :49:, :50:, :59:).
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MT700_MND -->

### BLOCK: Bản tin MT701 — Risk: Medium

#### TD_P2_019 - [Missing] - Thiếu field mandatory trong điện MT701 (2 field: :20:, :27:)
- **Steps**: Lần lượt gửi POST với body MT701 thiếu từng field mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MT701_MND -->

### BLOCK: Bản tin MT707 — Risk: Medium

#### TD_P2_020 - [Missing] - Thiếu field mandatory trong điện MT707 (8 field)
- **Steps**: Lần lượt gửi POST với body MT707 thiếu từng field mandatory (:20:, :21:, :22A:, :23:, :26E:, :27:, :30:, :31C:).
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MT707_MND -->

### BLOCK: Bản tin MT710 — Risk: Medium

#### TD_P2_021 - [Missing] - Thiếu field mandatory trong điện MT710 (13 field)
- **Steps**: Lần lượt gửi POST với body MT710 thiếu từng field mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MT710_MND -->

### BLOCK: Bản tin MT711 — Risk: Medium

#### TD_P2_022 - [Missing] - Thiếu field mandatory trong điện MT711 (3 field: :20:, :21:, :27:)
- **Steps**: Lần lượt gửi POST với body MT711 thiếu từng field mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MT711_MND -->

### BLOCK: Bản tin MT720 — Risk: Medium

#### TD_P2_023 - [Missing] - Thiếu field mandatory trong điện MT720 (13 field)
- **Steps**: Lần lượt gửi POST với body MT720 thiếu từng field mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MT720_MND -->

### BLOCK: Bản tin MT740 — Risk: Medium

#### TD_P2_024 - [Missing] - Thiếu field mandatory trong điện MT740 (5 field: :20:, :32B:, :40F:, :41A:, :41D:)
- **Steps**: Lần lượt gửi POST với body MT740 thiếu từng field mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MT740_MND -->

### BLOCK: Bản tin MT742 — Risk: Medium

#### TD_P2_025 - [Missing] - Thiếu field mandatory trong điện MT742 (7 field)
- **Steps**: Lần lượt gửi POST với body MT742 thiếu từng field mandatory (:20:, :21:, :32B:, :34A:, :34B:, :52A:, :52D:).
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MT742_MND -->

### BLOCK: Bản tin MT747 — Risk: Medium

#### TD_P2_026 - [Missing] - Thiếu field mandatory trong điện MT747 (2 field: :20:, :30:)
- **Steps**: Lần lượt gửi POST với body MT747 thiếu từng field mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MT747_MND -->

### BLOCK: Bản tin MT760 — Risk: Medium

#### TD_P2_027 - [Missing] - Thiếu field mandatory trong điện MT760 (14 field)
- **Steps**: Lần lượt gửi POST với body MT760 thiếu từng field mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MT760_MND -->

### BLOCK: Bản tin MT767 — Risk: Medium

#### TD_P2_028 - [Missing] - Thiếu field mandatory trong điện MT767 (9 field)
- **Steps**: Lần lượt gửi POST với body MT767 thiếu từng field mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MT767_MND -->

### BLOCK: Bản tin MT799 — Risk: Medium

#### TD_P2_029 - [Missing] - Thiếu field mandatory trong điện MT799 (2 field: :20:, :79:)
- **Steps**: Lần lượt gửi POST với body MT799 thiếu từng field mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MT799_MND -->

### BLOCK: Bản tin MT999 — Risk: Medium

#### TD_P2_030 - [Missing] - Thiếu field mandatory trong điện MT999 (2 field: :20:, :79:)
- **Steps**: Lần lượt gửi POST với body MT999 thiếu từng field mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MT999_MND -->

### BLOCK: Bản tin PACS.009 — Risk: Medium

#### TD_P2_033 - [Missing] - Thiếu field mandatory trong điện PACS.009 (8 field)
- **Steps**: Lần lượt gửi POST với body XML pacs.009 thiếu từng element mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_PACS009_MND -->

### BLOCK: Bản tin PACS.004 — Risk: Medium

#### TD_P2_034 - [Missing] - Thiếu field mandatory trong điện PACS.004 (4 field)
- **Steps**: Lần lượt gửi POST với body XML pacs.004 thiếu từng element mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_PACS004_MND -->

### BLOCK: Bản tin PACS.008 — Risk: Medium

#### TD_P2_035 - [Missing] - Thiếu field mandatory trong điện PACS.008 (11 field)
- **Steps**: Lần lượt gửi POST với body XML pacs.008 thiếu từng element mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_PACS008_MND -->

### BLOCK: Bản tin CAMT.110 — Risk: Medium

#### TD_P2_036 - [Missing] - Thiếu field mandatory trong điện CAMT.110 (6 field)
- **Steps**: Lần lượt gửi POST với body XML camt.110 thiếu từng element mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_CAM110_MND -->

### BLOCK: Bản tin CAMT.111 — Risk: Medium

#### TD_P2_037 - [Missing] - Thiếu field mandatory trong điện CAMT.111 (6 field)
- **Steps**: Lần lượt gửi POST với body XML camt.111 thiếu từng element mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_CAM111_MND -->

### BLOCK: Bản tin MSB001 — Risk: Medium

#### TD_P2_040 - [Missing] - Thiếu field mandatory trong điện MSB001 (20 field)
- **Steps**: Lần lượt gửi POST với body JSON MSB001 thiếu từng field mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MSB001_MND (trừ _01 — thuộc TD_P3) -->

### BLOCK: Bản tin MSB002 — Risk: Medium

#### TD_P2_043 - [Missing] - Thiếu field mandatory trong điện MSB002 (20 field)
- **Steps**: Lần lượt gửi POST với body JSON MSB002 thiếu từng field mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MSB002_MND (trừ _01 — thuộc TD_P3) -->

### BLOCK: Bản tin MSB003 — Risk: Medium

#### TD_P2_047 - [Missing] - Thiếu field mandatory trong điện MSB003 (45 field)
- **Steps**: Lần lượt gửi POST với body JSON Array MSB003 thiếu từng field mandatory.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03" cho mỗi lượt.
<!-- MAP: AML_MSB003_MND (trừ _01 đầu tiên — thuộc TD_P3) -->

## NHÓM PHÂN QUYỀN

### BLOCK: Authentication — Risk: High

#### TD_P1_017 - [Security] - Thiếu hoàn toàn header Authorization
- **Steps**: Gửi POST không đính kèm header Authorization.
- **Expected**: HTTP 401 Unauthorized, không có body nghiệp vụ.
<!-- MAP: AML_API_HTTP_03 -->

#### TD_P1_018 - [Security] - Basic Auth sai username/password
- **Steps**: Gửi POST với Authorization: Basic <base64 của cặp user/password không tồn tại>.
- **Expected**: HTTP 401 Unauthorized, body không lộ thông tin hệ thống.
<!-- NEW -->

#### TD_P1_019 - [Security] - Authorization sai format (thiếu prefix "Basic ")
- **Steps**: Gửi POST với Authorization là chuỗi base64 trần, không có prefix "Basic ".
- **Expected**: HTTP 401 Unauthorized.
<!-- NEW -->

<!-- BƯỚC 3: CONTENT-TYPE -->

## NHÓM ẢNH HƯỞNG CHỨC NĂNG LIÊN QUAN

### BLOCK: Callback & Trigger — Risk: High

#### TD_P3_001 - [ST] - isCallBack = Y: AML callback về hệ thống nguồn sau khi Alert hoàn thành
- **Steps**: Gửi POST với isCallBack = Y và body điện có HIT; chờ Alert xử lý xong và quan sát callback.
- **Expected**: HTTP 200 trả ngay; sau khi Alert hoàn thành, AML gọi callback URL kèm alertId và kết quả.
<!-- MAP: AML_API_HDR_09 -->

#### TD_P3_002 - [ST] - isCallBack = N: AML không thực hiện callback
- **Steps**: Gửi POST với isCallBack = N và body điện hợp lệ; theo dõi hệ thống nguồn.
- **Expected**: HTTP 200; không có callback nào được gửi tới hệ thống nguồn.
<!-- MAP: AML_API_HDR_10 -->

#### TD_P3_003 - [ST] - isCallBack = Y nhưng endpoint callback của hệ thống nguồn không phản hồi
- **Steps**: Gửi POST với isCallBack = Y trong khi endpoint callback đang down; theo dõi cơ chế retry/log của AML.
- **Expected**: Response sàng lọc vẫn trả HTTP 200 bình thường; lỗi callback không ảnh hưởng kết quả sàng lọc, được ghi log/retry. [PENDING_DOC: PTTK không mô tả cơ chế retry callback.]
<!-- NEW -->

#### TD_P3_004 - [ST] - Gửi nhiều request với cùng requestId (idempotency)
- **Steps**: Gửi nhiều POST liên tiếp với cùng requestId.
- **Expected**: Mỗi lượt trả kết quả nhất quán theo hành vi định nghĩa của hệ thống, không lỗi hệ thống.
<!-- MAP: AML_API_NF_04 -->

#### TD_P3_016 - [ST] - Điện MT với transactionId trùng lặp giao dịch đã tồn tại
- **Steps**: Gửi 2 lần POST điện MT với cùng transactionId, so sánh kết quả 2 lượt.
- **Expected**: Hệ thống không ghi nhận lỗi, trả kết quả phù hợp cho mỗi lần chạy.
<!-- MAP: AML_API_MT_06 -->

#### TD_P3_017 - [ST] - Điện MT với isCallBack = Y, verify callback sau khi Alert hoàn thành
- **Steps**: Gửi POST điện MT với isCallBack = Y, chờ Alert xử lý xong và verify callback nhận được.
- **Expected**: HTTP 200 trả ngay; callback được gửi về hệ thống nguồn kèm alertId và kết quả.
<!-- MAP: AML_API_MT_07 -->

### BLOCK: Response Contract — Risk: High

#### TD_P4_001 - [RSP-Schema] - Response kịch bản HIT trả đầy đủ 12 field theo PTTK
- **Steps**: Gửi POST điện có HIT, verify cấu trúc response body.
- **Expected**: HTTP 200, đủ 12 field (transactionId, transactionType, result, requestId, errorCode, errorDetail, score, groupMessageId, alertId, processDate, branchCd, channel) đúng kiểu dữ liệu.
<!-- MAP: AML_API_RESP_01 -->

#### TD_P4_002 - [RSP-Schema] - Response kịch bản No-HIT (alertId rỗng, score = 0)
- **Steps**: Gửi POST điện không HIT, verify cấu trúc và giá trị nullable của response.
- **Expected**: HTTP 200, result = "No-HIT", alertId rỗng, score = 0, errorCode = "00".
<!-- MAP: AML_API_RESP_02 -->

#### TD_P4_003 - [RSP-Schema] - Response kịch bản KNOCKED-OUT (alertId khác null)
- **Steps**: Gửi POST điện thuộc quốc gia Knock-out, verify cấu trúc response.
- **Expected**: HTTP 200, result = "KNOCKED-OUT", alertId khác null, errorCode = "00".
<!-- MAP: AML_API_RESP_03 -->

#### TD_P4_004 - [RSP-Schema] - Response kịch bản ERROR (score rỗng, alertId rỗng, processDate null)
- **Steps**: Gửi POST điện lỗi, verify các field nullable trong response.
- **Expected**: HTTP 200, result = "ERROR", score rỗng, alertId rỗng, processDate = null.
<!-- MAP: AML_API_RESP_04 -->
<!-- MAP: AML_API_NF_05 -->

#### TD_P4_005 - [RSP-Schema] - 'processDate' đúng format dd-mm-yyyy hh:mi:ss
- **Steps**: Gửi POST điện hợp lệ đã hoàn thành đánh giá, verify format processDate.
- **Expected**: HTTP 200, processDate khớp format dd-mm-yyyy hh:mi:ss.
<!-- MAP: AML_API_RESP_08 -->

#### TD_P4_006 - [RSP-Schema] - Response không chứa field lạ ngoài 12 field định nghĩa trong PTTK
- **Steps**: Gửi POST điện hợp lệ, liệt kê toàn bộ key ở cấp gốc của response body.
- **Expected**: HTTP 200, response chỉ chứa đúng 12 field theo sheet "1.2. Response Element", không có field thừa (không lộ dữ liệu nội bộ/debug).
<!-- NEW -->

#### TD_P4_007 - [RSP-Content-Type] - Response header Content-Type là application/json
- **Steps**: Gửi POST điện hợp lệ, đọc header Content-Type của response.
- **Expected**: HTTP 200, response header Content-Type = application/json (kèm charset UTF-8 nếu có khai báo).
<!-- NEW -->

<!-- [RSP-Pagination] KHÔNG áp dụng: API trả về 1 object đơn lẻ, không phải List/Search API. -->

### BLOCK: Response Data — Risk: High

#### TD_P4_008 - [RSP-Data] - 'transactionId' echo đúng giá trị đã gửi
- **Steps**: Gửi POST với transactionId có giá trị xác định, đối chiếu response.
- **Expected**: HTTP 200, response.transactionId = giá trị đã gửi (round-trip chính xác).
<!-- MAP: AML_API_RESP_06 -->

#### TD_P4_009 - [RSP-Data] - 'requestId' echo đúng giá trị đã gửi
- **Steps**: Gửi POST với requestId có giá trị xác định, đối chiếu response.
- **Expected**: HTTP 200, response.requestId = giá trị đã gửi.
<!-- MAP: AML_API_RESP_07 -->

#### TD_P4_010 - [RSP-Data] - 'branchCd' và 'channel' echo đúng giá trị đã gửi
- **Steps**: Gửi POST với branchCd và channel có giá trị xác định, đối chiếu response.
- **Expected**: HTTP 200, response.branchCd và response.channel khớp giá trị đã gửi.
<!-- MAP: AML_API_RESP_09 -->

#### TD_P4_011 - [RSP-Data] - 'groupMessageId' là số nguyên duy nhất cho mỗi request
- **Steps**: Gửi nhiều POST liên tiếp, thu thập và so sánh groupMessageId giữa các response.
- **Expected**: HTTP 200, groupMessageId là số nguyên, không trùng lặp giữa các request.
<!-- MAP: AML_API_RESP_10 -->

#### TD_P4_012 - [RSP-Data] - 'transactionType' echo đúng giá trị đã gửi cho từng loại điện
- **Steps**: Gửi POST lần lượt với MT, MX_IN, MX_OUT, MSB001, MSB002, MSB003 và đối chiếu transactionType trong từng response.
- **Expected**: HTTP 200, response.transactionType khớp chính xác giá trị header đã gửi ở mỗi lượt.
<!-- NEW -->

<!-- ERROR RESPONSE CONSISTENCY -->

### BLOCK: Response Error — Risk: High

#### TD_P4_013 - [RSP-Error] - errorCode = "00" (No Error) khi xử lý thành công
- **Steps**: Gửi POST điện hợp lệ, verify cặp errorCode/errorDetail.
- **Expected**: HTTP 200, errorCode = "00", errorDetail = "No Error".
<!-- MAP: AML_API_ERR_01 -->

#### TD_P4_014 - [RSP-Error] - errorCode = "01" (Missing parameter)
- **Steps**: Gửi POST thiếu tham số bắt buộc, verify cặp errorCode/errorDetail.
- **Expected**: HTTP 200, result = ERROR, errorCode = "01", errorDetail mô tả field bị thiếu.
<!-- MAP: AML_API_ERR_02 -->

#### TD_P4_015 - [RSP-Error] - errorCode = "03" (Invalid message format)
- **Steps**: Gửi POST với body điện sai format, verify cặp errorCode/errorDetail.
- **Expected**: HTTP 200, result = ERROR, errorCode = "03", errorDetail = "Message is not valid. Please correct the message and repost it".
<!-- MAP: AML_API_ERR_03 -->

#### TD_P4_016 - [RSP-Error] - errorCode = "05" (Webservices not responding — EDQ down)
- **Steps**: Gửi POST khi service EDQ đang down, verify cặp errorCode/errorDetail.
- **Expected**: HTTP 200, result = ERROR, errorCode = "05".
<!-- MAP: AML_API_ERR_04 -->

#### TD_P4_017 - [RSP-Error] - errorCode = "07" (Others exception)
- **Steps**: Gửi POST gây lỗi ngoài kịch bản đã định nghĩa, verify cặp errorCode/errorDetail.
- **Expected**: HTTP 200, result = ERROR, errorCode = "07".
<!-- MAP: AML_API_ERR_05 -->

#### TD_P4_018 - [RSP-Error] - errorCode = "08" (Request Timeout — EDQ xử lý > 30 giây)
- **Steps**: Gửi POST trong điều kiện EDQ xử lý vượt 30 giây, verify cặp errorCode/errorDetail.
- **Expected**: HTTP 200, result = ERROR, errorCode = "08".
<!-- MAP: AML_API_ERR_06 -->

#### TD_P4_019 - [RSP-Error] - HTTP Status luôn là 200 kể cả khi nghiệp vụ ERROR
- **Steps**: Gửi POST gây lỗi nghiệp vụ, verify HTTP status của response.
- **Expected**: HTTP 200; trạng thái lỗi chỉ phản ánh qua $.result và $.errorCode trong body.
<!-- MAP: AML_API_RESP_05 -->
<!-- MAP: AML_API_HTTP_01 -->

#### TD_P4_020 - [RSP-Error] - HTTP 400 khi request không hợp lệ ở tầng HTTP
- **Steps**: Gửi POST vi phạm ràng buộc tầng HTTP, verify cấu trúc error response.
- **Expected**: HTTP 400 Bad Request với body lỗi có timestamp/status/error/path, không phải body nghiệp vụ.
<!-- MAP: AML_API_HTTP_02 -->

#### TD_P4_021 - [RSP-Error] - HTTP 500 Internal Server Error
- **Steps**: Gửi POST trong điều kiện server lỗi nội bộ, verify cấu trúc error response.
- **Expected**: HTTP 500 với cấu trúc lỗi nhất quán, KHÔNG lộ stack trace hay raw exception.
<!-- MAP: AML_API_HTTP_05 -->

#### TD_P4_022 - [RSP-Error] - Error response HTTP 404 có cấu trúc nhất quán, không lộ nội bộ
- **Steps**: Gửi POST tới endpoint không tồn tại, kiểm tra kiểu nội dung và nội dung của error body.
- **Expected**: HTTP 404 trả JSON có cấu trúc lỗi thống nhất (timestamp/status/error/path); KHÔNG trả HTML error page, KHÔNG có stack trace hay tên class nội bộ.
<!-- NEW -->

<!-- RESPONSE CONTENT-TYPE -->
