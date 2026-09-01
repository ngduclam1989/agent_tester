# Phân Tích Requirement: MSB BRD - Module Transaction Monitoring (TM)

Nguồn: `requirements/MSB_BRD_TM_v1.8_20260817.pdf` (41 trang, có kèm lịch sử comment review giữa MSB và FPT IS - nguồn quan trọng cho Gap Review vì nhiều quyết định nghiệp vụ chỉ tồn tại trong comment, chưa đưa vào thân văn bản chính thức).

## 1. Tổng Quan Tài Liệu

| Mục | Nội dung |
|---|---|
| Tên gói thầu | Mua sắm hệ thống CNTT hỗ trợ công tác phòng chống rửa tiền, chống tài trợ khủng bố và tuân thủ cấm vận của MSB |
| Loại tài liệu | BRD (Business Requirement Document) |
| Module | Transaction Monitoring (TM) - Giám sát giao dịch |
| Nền tảng triển khai | Oracle OFSAA |
| Version | v1.8, ngày 17/08/2026 |
| Đơn vị soạn thảo | FPT IS |
| Đơn vị nghiệp vụ | MSB (Ngân hàng TMCP Hàng Hải Việt Nam) |
| Đối tượng đọc | Trung tâm CNTT, Đội dự án PCRT của MSB, Nhà thầu triển khai AML |

Tài liệu này không phải Jira ticket/user story mà là BRD dạng đặc tả nghiệp vụ + đặc tả chức năng, nên không có mục "As a...I want...So that..." theo đúng nghĩa. Mục 2 dưới đây tóm tắt lại mục đích nghiệp vụ theo tinh thần tương đương.

## 2. Mục Đích Nghiệp Vụ (tương đương User Story)

Là cán bộ quản lý khách hàng (DVKH), cán bộ AML và cấp phê duyệt (Checker/Checker N+1/AML Checker) tại MSB, người dùng cần một hệ thống giám sát giao dịch tự động (chạy kịch bản AML-01 đến AML-14 trên OFSAA) để phát hiện, điều tra, đánh giá và báo cáo giao dịch đáng ngờ (STR) tới cơ quan quản lý, nhằm tuân thủ quy định phòng chống rửa tiền và tài trợ khủng bố.

## 3. Phạm Vi Áp Dụng (Scope)

| Khối chức năng | Mã | Mô tả |
|---|---|---|
| Luồng nghiệp vụ giám sát tự động | II.1.1 | Hệ thống tạo case từ kịch bản HIT, xử lý qua DVKH Maker → Checker → Checker N+1 → AML Maker → AML Checker |
| Luồng nghiệp vụ tạo thủ công (DVKH) | II.1.2.1 | Đơn vị nghiệp vụ tự tạo case, luồng phê duyệt tương tự (bỏ bước 1) |
| Luồng nghiệp vụ tạo thủ công (AML) | II.1.2.2 | AML tự tạo case và STR, chỉ qua 1 cấp AML Checker |
| Luồng re-open case | II.1.3 | Mở lại case đã đóng, phân theo nguồn gốc case |
| Quản lý kịch bản | III.1 | Tạo/sửa/cấu hình ngưỡng theo khẩu vị rủi ro cho 14 kịch bản AML-01→14 |
| Whitelist | III.2 | Danh sách loại trừ đối tượng khỏi phạm vi quét kịch bản |
| Quản lý Case | III.3 (CM-1→CM-8) | Khởi tạo, tìm kiếm, hiển thị, điều phối, đánh giá, gửi email, ghi chú, audit trail |
| Danh sách kịch bản giám sát | III.4 | 14 kịch bản AML-01 đến AML-14 với điều kiện định lượng cụ thể |
| Báo cáo | III.5 | 4 báo cáo nội bộ (Report TM_01→04) |
| Email tự động | III.6 | 9 mẫu email (EM-1→EM-9) gắn với các bước luồng |

## 4. Yêu Cầu Chức Năng - Phân Tích Chi Tiết

### 4.1. Luồng nghiệp vụ giám sát giao dịch đáng ngờ (II.1.1, II.1.2, II.1.3)

Luồng tự động gồm 8 bước qua 5 vai trò (DVKH Maker, DVKH Checker, Checker N+1, AML Maker, AML Checker), mỗi bước có action và trạng thái case tương ứng. Luồng thủ công do DVKH tạo tương tự nhưng bỏ bước cảnh báo hệ thống. Luồng thủ công do AML tạo chỉ có 2 bước qua 1 cấp AML Checker duy nhất - không có DVKH tham gia. Luồng re-open case phân theo nguồn gốc case ban đầu để xác định người xử lý khi mở lại.

Đặc điểm đáng chú ý: mỗi bước phê duyệt đều có 3 nhánh (Approve/Reject/Yêu cầu bổ sung thông tin), và mỗi nhánh có template email + trạng thái case riêng - tổng cộng phát sinh hơn 15 trạng thái case khác nhau xuyên suốt 3 luồng.

### 4.2. Quản lý kịch bản (III.1)

Kịch bản gồm thông tin chung (mã, tên, loại, đối tượng giám sát), thông tin chi tiết (cơ chế tạo cảnh báo, quy tắc lọc), và tham số ngưỡng theo 3 mức rủi ro (High/Medium/Regular Risk). Chỉnh sửa được ngưỡng/tần suất/khoảng giám sát nhưng không sửa được ID, trạng thái hoạt động, loại kịch bản.

### 4.3. Whitelist (III.2)

Danh sách trắng loại trừ khách hàng/tài khoản khỏi 1 kịch bản cụ thể, quản trị theo mô hình 2 cấp (Analyst tạo/sửa/xóa - Supervisor phê duyệt), hỗ trợ nhập UI hoặc upload Excel. Có 8 trường dữ liệu (List Code, ID, ID Type, Application scenario, Status, Reason Added, Effective date, Description, Comment) với ràng buộc M/O và độ dài tương ứng.

### 4.4. Quản lý Case (III.3, CM-1 đến CM-8)

8 nhóm chức năng: khởi tạo case (tự động/thủ công), tìm kiếm (>15 tiêu chí filter), hiển thị danh sách và chi tiết (Event List/Event Details), điều phối/phân công, đánh giá xử lý (Take Action + Comment bắt buộc), gửi email tư vấn, ghi chú/đính kèm tài liệu, và audit trail.

### 4.5. Danh sách 14 kịch bản giám sát (III.4, AML-01 → AML-14)

Mỗi kịch bản có mô tả/mục tiêu, phạm vi (chiều giám sát, phạm vi khách hàng, loại tài khoản, loại giao dịch), điều kiện cảnh báo (tần suất chạy, khoảng thời gian giám sát), và các điều kiện định lượng cụ thể (VND, số lượng giao dịch, tỷ lệ %). Các kịch bản bao phủ: khu vực địa lý rủi ro cao (AML-01), đối tượng rủi ro cao (AML-02), thay đổi hành vi so với trung bình/đỉnh lịch sử (AML-03/04), dịch chuyển dòng tiền nhanh (AML-05), tài khoản không hoạt động (AML-06), mô hình Hub-Spoke (AML-07), IP nước ngoài/IP trùng (AML-08/09), giao dịch quốc tế (AML-10→14).

### 4.6. Báo cáo (III.5)

4 báo cáo: thống kê STR đã tạo, đánh giá hiệu quả kịch bản, cảnh báo chưa xử lý, khách hàng phát sinh cảnh báo theo kịch bản - chỉ có tên và mô tả 1 dòng, không có đặc tả field/filter/layout.

### 4.7. Email thông báo tự động (III.6)

9 mẫu email (EM-1 đến EM-9) gắn với các bước luồng nghiệp vụ, nội dung tham chiếu Phụ lục 5 (không nằm trong file BRD đang phân tích).

## 5. Phụ Thuộc (Dependencies)

| Phụ thuộc | Trạng thái trong tài liệu |
|---|---|
| Phân hệ KYC (điểm rủi ro khách hàng) | Được tham chiếu (AML-02) nhưng cơ chế đồng bộ/quy đổi điểm rủi ro chưa rõ ràng - xem RR-021 |
| Hệ thống T24 (core banking) | Tham chiếu để loại trừ "tài khoản chuyên dùng" (AML-14) nhưng không mô tả cơ chế nhận diện |
| SBV (Ngân hàng Nhà nước) | Đích đến cuối cùng của STR nhưng việc nộp STR nằm ngoài phạm vi hệ thống (chỉ xác nhận qua comment - xem RR-025) |
| Phụ lục 1 - Danh mục dữ liệu yêu cầu | Chỉ có tiêu đề, không có nội dung - xem RR-028 |
| Phụ lục 2 - Ma trận phân quyền | Chỉ có tiêu đề, không có nội dung dù được tham chiếu nhiều lần - xem RR-028 |
| Phụ lục 3 - Bộ câu hỏi EDD | Có đính kèm 2 file .docx (KHCN/KHDN) - ngoài phạm vi phân tích này |
| Phụ lục 5 - Template Email TM | Không có trong file đang phân tích, comment xác nhận MSB đã cung cấp riêng |
| Phụ lục 6 - Màn hình STR và Template STR | Chỉ có tiêu đề, không có nội dung dù là màn hình lõi của mọi luồng - xem RR-029 |

## 6. Phân Tích Mockup/Screenshot

Tài liệu không kèm mockup hoặc screenshot UI thực tế - toàn bộ đặc tả màn hình được diễn giải bằng bảng field text (ví dụ Whitelist, Case creation). Riêng màn hình STR - màn hình lõi được tham chiếu ở hầu hết các bước luồng nghiệp vụ - không có bảng field nào cả (Phụ lục 6 trống), nên không thể đối chiếu UI thực tế với mô tả nghiệp vụ.

## 7. Điểm Thiếu/Điểm Mờ - Gap Review

### 7.1. Bảng tổng hợp

| Mã | Loại | Mức độ | Tóm tắt | Owner |
|---|---|---|---|---|
| RR-001 | Thiếu phủ | Cao | Rule "chỉ xuất STR khi Close case with STR" chỉ có trong comment, không có trong thân văn bản | Business Authority |
| RR-002 | Mơ hồ | Chặn | Re-open case: yêu cầu với STR/EDD đã điền trước đó chưa được mô tả | Business Authority |
| RR-003 | Ngoại lệ | Cao | Re-open case: chưa có phương án khi maker gốc đã nghỉ việc | Business Authority |
| RR-004 | Mơ hồ | Cao | Whitelist trường Key: văn bản ghi "02 trường" nhưng liệt kê 3 trường | BA/Solution Architect |
| RR-005 | Trạng thái | Trung bình | Whitelist: bản ghi xóa rồi thêm lại - Status/phê duyệt có reset không | Business Authority |
| RR-006 | Tương tranh | Trung bình | Whitelist Excel: bản ghi đang chờ duyệt khi tới giờ chạy batch kế tiếp | Solution Architect |
| RR-007 | Mơ hồ | Trung bình | Case Type tạo thủ công: câu hỏi "chọn có sẵn hay tạo thêm" chưa có câu trả lời | Business Authority |
| RR-008 | Nhất quán | Trung bình | Case Type dropdown tạo case (chỉ AML_MN) khác dropdown tìm kiếm (AML_MN+AML_SURV) | BA |
| RR-009 | Thiếu phủ | Cao | Không có bảng enum đầy đủ toàn bộ trạng thái Case dùng cho filter Status | BA |
| RR-010 | Mơ hồ | Thấp | Age filter: tính từ ngày tạo tới hiện tại hay tới ngày đóng case | BA |
| RR-011 | Tương tranh | Cao | CM-4: race condition khi ≥2 user cùng mở 1 case gần đồng thời | Solution Architect |
| RR-012 | Thiếu phủ | Cao | CM-4: rule điều phối case theo từng luồng chỉ "trao đổi trực tiếp", chưa đưa vào tài liệu | Business Authority |
| RR-013 | Mơ hồ | Trung bình | CM-6: mô tả "gửi email tư vấn" nhưng khẳng định không nhận phản hồi - mâu thuẫn logic | Business Authority |
| RR-014 | Mơ hồ | Thấp | CM-6 trường From: giá trị email mặc định cụ thể chưa xác nhận | Business Authority |
| RR-015 | Nhất quán | Cao | Quy định file đính kèm không nhất quán giữa CM-5 (9MB, 4 loại)/CM-6 (không giới hạn, 5 loại)/CM-7 (10MB) | Business Authority |
| RR-016 | Mơ hồ | Trung bình | CM-7 "Loại hồ sơ/giấy tờ": không có danh mục giá trị, hệ thống xác nhận không có trường lưu | BA |
| RR-017 | Thiếu phủ | Trung bình | CM-8 Audit Trail: danh sách "Hành động đối với case" cần log chưa liệt kê đầy đủ | Business Authority |
| RR-018 | Thiếu phủ | Chặn | III.1 Quản lý kịch bản: không có bảng field-spec (loại dữ liệu/bắt buộc/độ dài) như Whitelist | BA |
| RR-019 | Mơ hồ | Trung bình | III.1.3: không sửa được "trạng thái hoạt động" kịch bản nhưng không mô tả cách bật/tắt | Business Authority |
| RR-020 | Thiếu phủ | Chặn | AML-01: ngưỡng phân loại khu vực rủi ro cao/rất cao chỉ tham chiếu danh sách ngoài BRD | Business Authority |
| RR-021 | Mơ hồ | Chặn | AML-02: "Ngưỡng rủi ro thực tế của KH" chưa định nghĩa, mơ hồ với "Effctv Risk Lvl" | Business Authority |
| RR-022 | Mơ hồ | Chặn | AML-03/04: công thức Avg(Bi)/Avg(Di) có 2 phương án tính (PA1/PA2) chưa chốt | Business Authority |
| RR-023 | Mơ hồ | Thấp | AML-06: 2 nhánh OR cùng đánh số "Điều kiện 1" gây khó trích dẫn khi viết TC | BA |
| RR-024 | Thiếu phủ | Trung bình | Toàn bộ 14 kịch bản: "giá trị quy đổi" (FX) không có nguồn tỷ giá/thời điểm áp dụng | Business Authority + Backend Lead |
| RR-025 | Tuân thủ | Cao | "Approved STR" không tự động gửi SBV - thông tin quan trọng chỉ nằm trong comment, không có trong thân văn bản, không có trường lưu vết ngày nộp SBV | Business Authority + Compliance |
| RR-026 | Thiếu phủ | Trung bình | Chênh lệch số cấp phê duyệt: case DVKH/tự động (4 cấp) vs case AML tự tạo (1 cấp) chưa có giải trình | Business Authority + Compliance |
| RR-027 | Nhất quán | Thấp | Re-open case nguồn AML-manual không có email thông báo, khác với mong muốn nghiệp vụ chung | Business Authority |
| RR-028 | Thiếu phủ | Chặn | Phụ lục 1 (Danh mục dữ liệu) và Phụ lục 2 (Ma trận phân quyền) chỉ có tiêu đề, không nội dung | Business Authority + Security |
| RR-029 | Thiếu phủ | Chặn | Phụ lục 6 (Màn hình STR/Template STR) không có nội dung dù là màn hình lõi mọi luồng | BA + Business Authority |
| RR-030 | Thiếu phủ | Cao | III.5 Reporting: 4 báo cáo không có đặc tả field/filter/layout | Business Authority |
| RR-031 | Bảo mật | Trung bình | Các trường free-text không có ràng buộc chống XSS/injection dù nội dung có thể gửi qua email ra ngoài hệ thống | Security Lead |
| RR-032 | Bảo mật | Trung bình | Case List/Search hiển thị số CCCD/GTTT và thông tin định danh KH nhưng không quy định masking theo phân quyền | Security Lead + Business Authority |

### 7.2. Chi tiết từng finding

## RR-001 [Cao] Thiếu phủ — Bước 5 luồng STR (II.1.1): rule "chỉ xuất được STR khi case ở trạng thái Close case with STR" chỉ tồn tại trong comment review, chưa đưa vào thân văn bản

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 5, comment [A22R18]
- Section: II.1.1, bước 5 (Checker rà soát thông tin và phê duyệt tạo STR, EDD)
- Quote nguyên văn: "Xuất STR: chỉ được xuất khi ở trạng thái close case with STR. Nếu case thay đổi trạng thái sẽ ko xuất đc STR nữa"

#### 2. Bối cảnh nghiệp vụ

Khi DVKH Checker phê duyệt tạo STR ở bước 5, case chuyển qua Checker N+1 rồi AML Maker/Checker, cuối cùng dừng ở trạng thái "Approved STR". Trong lúc trao đổi, MSB xác nhận rằng chức năng "xuất file STR" (để nộp SBV) chỉ được phép khi case đang ở đúng trạng thái đóng kèm STR, và nếu sau đó case bị đổi trạng thái (ví dụ bị re-open) thì nút xuất STR sẽ không còn khả dụng.

#### 3. Vấn đề cụ thể

Quy tắc ràng buộc quan trọng này - vốn quyết định TC nào nên PASS/FAIL khi kiểm thử nút "Xuất STR" - chỉ nằm trong 1 dòng comment của người review, không hề xuất hiện trong bảng mô tả bước 5 hay bất kỳ mục nào của thân văn bản chính thức (mục III.3 Case Management cũng không nhắc tới chức năng xuất STR). Người đọc chỉ theo thân văn bản sẽ không biết chức năng này tồn tại, chưa nói tới điều kiện kích hoạt nó.

#### 4. Ảnh hưởng nếu không giải quyết

- Không thể viết TC cho chức năng "Xuất STR" vì thân văn bản không mô tả nút bấm, vị trí, và điều kiện enable/disable.
- Nếu case đang ở trạng thái "Approved STR" rồi bị re-open (theo luồng II.1.3), tester không biết liệu nút Xuất STR có tự ẩn đi ngay lập tức hay vẫn hiển thị gây sai lệch dữ liệu nộp SBV.

#### 5. Đề xuất giải quyết

Bổ sung vào mục III.3 (Case Management) một tiểu mục "CM-9: Xuất báo cáo STR" mô tả rõ: vị trí nút trên UI, danh sách trạng thái case được phép xuất (chỉ "Approved STR"), hành vi khi trạng thái case thay đổi (nút bị ẩn/disable), và định dạng file xuất ra. Đây là đề xuất dựa trên nội dung comment đã có, cần MSB xác nhận lại đầy đủ trước khi đưa vào bản chính thức.

#### 6. Liên kết với các phát hiện khác

Liên quan RR-029 (Phụ lục 6 - Màn hình/Template STR trống) vì cùng thuộc nhóm tính năng STR chưa được đặc tả đầy đủ.

#### 7. Câu hỏi cho người dùng

(a) Xác nhận nút "Xuất STR" chỉ hiển thị/khả dụng khi case đang ở đúng trạng thái "Approved STR", và bị ẩn/disable ngay khi trạng thái đổi (kể cả do re-open)? (b) Nếu case đã được xuất STR 1 lần rồi sau đó bị re-open và đóng lại "Approved STR" lần nữa, hệ thống có cho phép xuất STR lần 2 hay chặn vì đã xuất trước đó?

#### 8. Owner

Business Authority (nghiệp vụ AML/PCRT MSB) - vì đây là quy tắc kiểm soát tuân thủ khi nộp báo cáo cho SBV, cần người có thẩm quyền nghiệp vụ xác nhận, không phải quyết định kỹ thuật thuần túy.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-002 [Chặn] Mơ hồ — Re-open case: chưa mô tả yêu cầu xử lý đối với STR và EDD đã điền ở lần xử lý trước

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 11, comment [A121]
- Section: II.1.3 Luồng thực hiện re-open case
- Quote nguyên văn: "MSB mô tả rõ yêu cầu đối với báo cáo STR và EDD khi re-open case"

#### 2. Bối cảnh nghiệp vụ

Một case đã đóng ở trạng thái "Approved STR" (nghĩa là đã có 1 bộ câu hỏi EDD và 1 báo cáo STR hoàn chỉnh được phê duyệt) được user thực hiện re-open. Theo bước 2a của luồng re-open, DVKH Maker "thực hiện điền lại bộ câu hỏi EDD và/hoặc bổ sung thêm thông tin/tài liệu" rồi đề xuất lại đánh giá cảnh báo.

#### 3. Vấn đề cụ thể

Câu hỏi mở này (A121) chưa từng được trả lời trong toàn bộ tài liệu. Có ít nhất 2 khả năng hợp lý: Khả năng A - EDD/STR cũ vẫn được giữ lại làm bản nháp, Maker chỉ cần "bổ sung thêm" phần thay đổi thay vì điền lại từ đầu. Khả năng B - EDD/STR cũ bị xóa/lưu trữ riêng và Maker phải điền lại hoàn toàn một bộ EDD mới, độc lập với bản trước. Nếu chọn Khả năng B, cần làm rõ tiếp: STR cũ (đã có thể đã được nộp SBV theo RR-025) có còn được giữ lại để đối chiếu lịch sử hay bị ghi đè?

#### 4. Ảnh hưởng nếu không giải quyết

- Không thể viết TC cho màn hình EDD/STR ở bước re-open vì không biết trạng thái ban đầu của form là trống hay có sẵn dữ liệu cũ.
- Rủi ro nghiệp vụ: nếu hệ thống ghi đè STR cũ đã nộp SBV mà không lưu vết, sẽ mất dữ liệu tuân thủ quan trọng khi có thanh tra.

#### 5. Đề xuất giải quyết

Đề xuất (chưa xác nhận, cần MSB chốt): giữ nguyên toàn bộ EDD/STR của lần xử lý trước dưới dạng lịch sử (audit trail riêng theo case, xem CM-8), và mở form EDD/STR mới cho lần re-open, có liên kết ngược tới bản ghi cũ để người xem đối chiếu.

#### 6. Liên kết với các phát hiện khác

Liên quan RR-025 (Approved STR không tự động nộp SBV) - vì nếu STR đã nộp SBV trước khi re-open, việc xử lý dữ liệu cũ càng cần thận trọng hơn.

#### 7. Câu hỏi cho người dùng

(a) Khi re-open, EDD/STR cũ có được giữ nguyên làm dữ liệu tham khảo trong form mới hay form hiển thị trống hoàn toàn? (b) Nếu STR cũ đã được đánh dấu "đã nộp SBV", khi re-open và tạo STR mới, hệ thống có cần lưu cả 2 phiên bản STR (cũ và mới) để phục vụ thanh tra sau này không?

#### 8. Owner

Business Authority (nghiệp vụ AML/PCRT MSB) kết hợp với Compliance - vì liên quan trực tiếp tới yêu cầu lưu trữ hồ sơ tuân thủ, không thể tự suy diễn.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-003 [Cao] Ngoại lệ — Re-open case: chưa có phương án xử lý khi DVKH Maker ban đầu đã nghỉ việc

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 13, comment [A126]/[TMP(TP129R126)]/[A130R126]
- Section: II.1.3, bước 1a
- Quote nguyên văn: "Có nhất thiết phải là user của DVKH maker ban đầu? Nếu fix thì trường hợp cán bộ đã nghỉ việc thì sao?" → "Bổ sung thêm: assign về user ban đầu, luồng mail sẽ gửi cả cho group checker, tránh trường hợp checker trong luồng ban đầu cũng nghỉ" → "Đã update" (lưu ý: giải pháp đã chốt và cập nhật này CHỈ bổ sung email cho group Checker, không nhắc tới group Maker - đây chính là phần còn hở mà finding này nêu ra, không phải đặt lại câu hỏi đã được trả lời)

#### 2. Bối cảnh nghiệp vụ

Case do DVKH Maker "Nguyễn Văn A" xử lý và đóng cách đây 8 tháng, nay có yêu cầu re-open. Theo bước 1a, hệ thống chuyển trạng thái case về "Pending Maker" và gán lại đúng user Nguyễn Văn A ban đầu, đồng thời gửi email EM-9 tới cả Nguyễn Văn A và group email của DVKH Checker.

#### 3. Vấn đề cụ thể

Nếu tại thời điểm re-open, Nguyễn Văn A đã nghỉ việc hoặc bị khóa tài khoản, case vẫn bị gán ("assign") cho một user không còn hoạt động - không ai có thể mở và xử lý case đó. Giải pháp đã được FIS/MSB chốt và đánh dấu "Đã update" chỉ bổ sung việc gửi email cho group Checker (dự phòng khi Checker nghỉ), nhưng KHÔNG có cơ chế dự phòng tương ứng cho trường hợp chính Maker (người được gán xử lý case) nghỉ việc - group email của DVKH Maker không được đề cập trong giải pháp đã chốt. Đây không phải việc lật lại câu hỏi cũ mà là 1 khoảng hở cụ thể mà chính giải pháp đã chốt chưa che phủ tới.

#### 4. Ảnh hưởng nếu không giải quyết

- Case bị "treo" vĩnh viễn ở trạng thái "Pending Maker" vì được gán cho một tài khoản không ai truy cập được, không có cơ chế nhận biết hoặc chuyển giao.
- Checker nhận được email EM-9 nhưng không có quyền tự nhận xử lý bước Maker (theo mô tả CM-4, việc gán là tự động), nên dù biết case bị treo cũng không tự xử lý được.

#### 5. Đề xuất giải quyết

Đề xuất (giả định, cần MSB xác nhận): bổ sung cơ chế tương tự CM-4 cho case Pending Maker - nếu user gốc không hoạt động (khóa/nghỉ việc) quá X ngày kể từ khi re-open, hệ thống tự động chuyển case về nhóm quyền Maker để user khác trong nhóm được "mở đầu tiên và nhận xử lý" giống cơ chế phân công case mới.

#### 6. Liên kết với các phát hiện khác

Cùng mẫu thiếu sót với RR-011 (không có cơ chế xử lý khi user không khả dụng/xung đột thao tác trong CM-4).

#### 7. Câu hỏi cho người dùng

(a) Hệ thống có tích hợp kiểm tra trạng thái active/inactive của tài khoản Maker khi re-open, và tự động chuyển giao cho nhóm quyền nếu Maker không còn active? (b) Nếu không tích hợp tự động, quy trình thủ công (ai phát hiện, ai reassign) sẽ như thế nào?

#### 8. Owner

Business Authority (nghiệp vụ MSB) - vì đây là quyết định về quy trình vận hành khi nhân sự biến động, không phải vấn đề kỹ thuật đơn thuần.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-004 [Cao] Mơ hồ — Whitelist: văn bản ghi "trường Key gồm 02 trường" nhưng liệt kê 3 trường (ID, ID Type, Application scenario)

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 17
- Section: III.2 Whitelist
- Quote nguyên văn: "Hệ thống thực hiện kiểm tra trùng lặp dựa vào các trường (trường Key) của đối tượng trong Whitelist gồm 02 trường: ID, ID Type, Application scenario." Đối chiếu comment [A164R163]: "Trường Key gồm 3 trường là ID, ID Type và Application scenario. Ví dụ: kịch bản focus AC, key sẽ là Số tài khoản của KH +Account +mã kịch bản"

#### 2. Bối cảnh nghiệp vụ

Khi Analyst upload file Excel chứa 1 bản ghi có ID = "0123456789", ID Type = "Account", Application scenario = "AML-05" trùng hoàn toàn với 1 bản ghi đã tồn tại, hệ thống cần nhận diện đây là bản ghi trùng lặp để áp dụng logic cập nhật thay vì tạo mới (theo quy tắc "nếu Key giống thì update, khác thì tạo bản ghi mới" đã mô tả ngay phía trên).

#### 3. Vấn đề cụ thể

Câu văn trong thân tài liệu tự mâu thuẫn: ghi "02 trường" (số 2) nhưng danh sách liệt kê ngay sau đó có 3 phần tử (ID, ID Type, Application scenario). Comment review của chính FIS (A164R163) xác nhận đáp án đúng là 3 trường, kèm ví dụ minh họa cụ thể - nhưng thân văn bản chưa được sửa lại số "02" thành "03". Đây là lỗi số liệu còn sót lại sau khi nội dung đã có thay đổi.

#### 4. Ảnh hưởng nếu không giải quyết

- Tester có thể hiểu nhầm chỉ cần 2 trong 3 trường trùng là đủ để coi là trùng lặp (ví dụ chỉ ID + ID Type trùng nhưng khác Application scenario), dẫn tới thiết kế TC sai oracle.
- Vì đây là logic quyết định "tạo mới" hay "update" khi import Excel, sai lệch ở đây ảnh hưởng trực tiếp tới tính đúng đắn của toàn bộ luồng import dữ liệu whitelist.

#### 5. Đề xuất giải quyết

Sửa lại câu thân văn bản thành "gồm 03 trường: ID, ID Type, Application scenario" cho khớp với comment xác nhận và ví dụ minh họa đã có.

#### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

#### 7. Câu hỏi cho người dùng

(a) Xác nhận trường Key để kiểm tra trùng lặp là đúng 3 trường (ID + ID Type + Application scenario) như ví dụ trong comment, và sửa lại số "02" thành "03" trong bản chính thức tiếp theo?

#### 8. Owner

BA (FIS) phối hợp Solution Architect - vì đây là lỗi biên tập cần sửa nhanh, không cần quyết định nghiệp vụ mới (đã có câu trả lời trong comment, chỉ cần đưa vào thân văn bản).

#### 9. Trạng thái

ĐANG MỞ

---

## RR-005 [Trung bình] Trạng thái — Whitelist: khi bản ghi bị xóa rồi được thêm lại với cùng List Code cũ, chưa rõ Status có tự động Active hay cần phê duyệt lại từ đầu

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 16
- Section: III.2 Whitelist
- Quote nguyên văn: "List code hệ thống tự sinh sẽ gắn duy nhất với một bản ghi. Trong trường hợp bản ghi đã bị xóa nhưng sau được thêm lại vào danh sách whitelist thì vẫn gắn với List code hệ thống sinh lần đầu."

#### 2. Bối cảnh nghiệp vụ

Bản ghi whitelist mang List Code "AML05-00012" (theo công thức tự sinh List Code đã mô tả ở III.2) của khách hàng CIF 000789 bị Analyst xóa khỏi kịch bản AML-05 vào tháng 3. Đến tháng 6, cùng khách hàng CIF 000789 lại được thêm lại vào whitelist của đúng kịch bản AML-05 (cùng bộ Key ID + ID Type + Application scenario). Theo mô tả, bản ghi mới này được gắn lại với List Code cũ "AML05-00012" thay vì sinh mã mới.

#### 3. Vấn đề cụ thể

Quy tắc chỉ nêu về việc List Code được tái sử dụng, nhưng không nói tới 2 khía cạnh liên quan chặt chẽ: Vấn đề 1 - Status của bản ghi mới có mặc định là Active ngay hay bắt buộc phải qua lại luồng phê duyệt Supervisor như một bản ghi tạo mới hoàn toàn (theo mô tả 2 cấp Analyst/Supervisor đã nêu ở cuối mục)? Vấn đề 2 - Các trường Reason Added/Description/Comment/Effective date của lần thêm lại này có ghi đè hoàn toàn lên dữ liệu cũ, hay được nối tiếp/giữ lại lịch sử của lần đầu tiên?

#### 4. Ảnh hưởng nếu không giải quyết

- Không thể viết TC cho kịch bản "xóa rồi thêm lại" - không biết kỳ vọng PASS là Status = Active ngay hay Status = Pending approval.
- Nếu hệ thống thực tế yêu cầu phê duyệt lại nhưng field Effective date (không cho nhập tay, tự sinh theo ngày Supervisor duyệt) không được cập nhật đúng, dữ liệu audit về "ngày đối tượng có hiệu lực" sẽ sai lệch so với thực tế.

#### 5. Đề xuất giải quyết

Đề xuất (giả định, cần MSB xác nhận): coi việc "thêm lại" như một thao tác Tạo mới đầy đủ, vẫn qua luồng phê duyệt Supervisor 2 cấp như bình thường, chỉ khác là List Code được tái sử dụng thay vì sinh mới; Effective date cập nhật lại theo ngày phê duyệt lần thêm-lại này.

#### 6. Liên kết với các phát hiện khác

Không có liên kết trực tiếp với finding khác trong tài liệu này, nhưng câu trả lời phụ thuộc vào việc làm rõ trước bản chất của thao tác "Xóa" trong whitelist (soft-delete hay hard-delete).

#### 7. Câu hỏi cho người dùng

(a) Khi thêm lại 1 đối tượng đã từng bị xóa (cùng Key), bản ghi mới có bắt buộc qua lại luồng phê duyệt Supervisor như tạo mới hoàn toàn không? (b) Effective date của lần thêm lại có tính theo ngày phê duyệt mới nhất, hay giữ nguyên ngày hiệu lực gốc lần đầu tiên?

#### 8. Owner

Business Authority (nghiệp vụ AML/PCRT MSB) - vì liên quan tới kiểm soát rủi ro khi 1 đối tượng ra/vào whitelist nhiều lần, cần thẩm quyền nghiệp vụ quyết định mức độ kiểm soát.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-006 [Trung bình] Tương tranh — Whitelist: chưa mô tả xử lý khi bản ghi Excel đang chờ Supervisor phê duyệt tại đúng thời điểm batch kịch bản chạy

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 17
- Section: III.2 Whitelist
- Quote nguyên văn: "Việc tạo mới/ chỉnh sửa/xóa đối tượng trong whitelist thực hiện bởi người dùng được phân quyền tại bất kì thời điểm nào trong ngày và cần được phê duyệt trước thời điểm chạy batch kịch bản hàng ngày lần tiếp theo."

#### 2. Bối cảnh nghiệp vụ

Analyst upload file Excel thêm khách hàng CIF 000999 vào whitelist kịch bản AML-06 lúc 23:50. Batch chạy kịch bản AML-06 được lên lịch chạy lúc 00:00 hàng ngày (tần suất "1 ngày" theo bảng kịch bản AML-06). Supervisor chưa kịp phê duyệt bản ghi Excel vừa upload trước khi batch 00:00 khởi chạy.

#### 3. Vấn đề cụ thể

Câu văn chỉ nêu yêu cầu "cần được phê duyệt trước thời điểm chạy batch" như một điều kiện tiên quyết, nhưng không mô tả hệ thống làm gì nếu điều kiện đó KHÔNG được đáp ứng - tức bản ghi vẫn ở trạng thái chờ duyệt khi batch đã chạy. Có 2 khả năng: Khả năng A - batch coi bản ghi "chưa Active" là chưa áp dụng, khách hàng CIF 000999 vẫn bị quét bình thường lần này (không bị loại trừ), gây HIT giả nếu đáng lẽ phải được whitelist. Khả năng B - hệ thống có cơ chế khóa/hoãn batch cho tới khi mọi whitelist pending được xử lý xong, nhưng điều này không hợp lý về mặt vận hành nếu có nhiều Analyst thao tác liên tục.

#### 4. Ảnh hưởng nếu không giải quyết

- Không thể viết TC cho kịch bản biên "whitelist chưa duyệt kịp trước giờ chạy batch" - một edge case thực tế rất dễ xảy ra trong vận hành hàng ngày.
- Nếu hệ thống mặc định coi bản ghi pending là "chưa áp dụng" (Khả năng A), khách hàng lẽ ra phải được loại trừ vẫn bị tạo case oan, gây lãng phí công sức điều tra không cần thiết cho DVKH/AML.

#### 5. Đề xuất giải quyết

Đề xuất (giả định, cần MSB xác nhận): áp dụng Khả năng A - chỉ bản ghi có Status = Active (đã qua phê duyệt) mới được batch sử dụng để loại trừ; bản ghi Pending không ảnh hưởng tới lần quét gần nhất, sẽ áp dụng từ lần quét kế tiếp sau khi được duyệt. Cần bổ sung rõ ràng vào tài liệu để tránh hiểu nhầm.

#### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

#### 7. Câu hỏi cho người dùng

(a) Bản ghi whitelist đang ở trạng thái chờ Supervisor phê duyệt có được batch kịch bản áp dụng ngay hay bỏ qua cho tới khi Active? (b) Có cơ chế cảnh báo/nhắc nhở Supervisor khi có bản ghi pending gần tới giờ chạy batch không, hay hoàn toàn phụ thuộc vào Supervisor tự theo dõi?

#### 8. Owner

Solution Architect phối hợp Business Authority - vì vừa cần quyết định nghiệp vụ (mức độ chấp nhận rủi ro HIT giả) vừa cần xác nhận khả năng kỹ thuật đồng bộ giữa batch job và trạng thái phê duyệt.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-007 [Trung bình] Mơ hồ — Case Type khi tạo case thủ công: câu hỏi "chọn giá trị có sẵn hay cho phép tạo thêm" chưa có câu trả lời cuối cùng

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 18, comment [APTL(185)]/[A186R185]
- Section: III.3.1.2 (CM-1.2), trường "Type"
- Quote nguyên văn: bảng ghi Type = "Chọn giá trị trong drop-down list bao gồm các giá trị: AML_MN"; comment "Không phải mặc định à? Mai sau muốn thêm giá trị được ko?" → "Chốt lại với nghiệm vụ type cho case thủ công chọn là gì? Chọn các giá trị có sẵn hay muốn tạo thêm?"

#### 2. Bối cảnh nghiệp vụ

Khi DVKH Maker hoặc AML Maker tạo 1 case thủ công (không xuất phát từ kịch bản HIT), họ phải chọn trường "Type" bắt buộc (M) từ dropdown. Bảng hiện chỉ liệt kê đúng 1 giá trị khả dụng "AML_MN" (Case thủ công), không có giá trị nào khác.

#### 3. Vấn đề cụ thể

Câu hỏi cuối cùng của reviewer - liệu dropdown Type có luôn cố định chỉ 1 giá trị AML_MN (khi đó thực chất field này không cần là dropdown mà nên là giá trị mặc định/ẩn), hay về sau MSB có nhu cầu bổ sung thêm nhiều loại case thủ công khác (ví dụ phân theo mức độ ưu tiên điều tra) - chưa từng nhận được câu trả lời "TMP" xác nhận trong toàn bộ chuỗi comment được trích xuất.

#### 4. Ảnh hưởng nếu không giải quyết

- Không rõ nên viết TC kiểm tra dropdown Type có đúng 1 lựa chọn duy nhất (validate UI chỉ hiển thị 1 option) hay cần chuẩn bị test data cho nhiều loại case type khác nhau.
- Nếu về lâu dài hệ thống cần mở rộng thêm case type mới mà thiết kế hiện tại chỉ tính cho 1 giá trị cứng, sẽ phát sinh thay đổi lớn về sau.

#### 5. Đề xuất giải quyết

Cần MSB xác nhận dứt điểm: nếu chỉ có đúng 1 giá trị AML_MN cho case thủ công của TM, nên ghi rõ trong tài liệu là "giá trị cố định AML_MN, không phải danh sách mở rộng được" thay vì mô tả như 1 dropdown thông thường, tránh gây hiểu nhầm về khả năng mở rộng.

#### 6. Liên kết với các phát hiện khác

Liên quan RR-008 (Case Type giữa màn hình tạo và tìm kiếm không khớp nhau).

#### 7. Câu hỏi cho người dùng

(a) Case thủ công của module TM có luôn chỉ có đúng 1 Type "AML_MN" hay dự kiến sẽ bổ sung thêm loại khác trong tương lai gần? (b) Nếu cố định, có cần thiết kế lại UI trường này thành giá trị mặc định (ẩn, không cho chọn) thay vì dropdown?

#### 8. Owner

Business Authority (nghiệp vụ MSB) - vì câu hỏi trực tiếp dành cho nghiệp vụ đã được đặt ra trong comment nhưng chưa có phản hồi.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-008 [Trung bình] Nhất quán — Case Type trên màn hình tạo case (chỉ AML_MN) không khớp với Case Type trên màn hình tìm kiếm (AML_MN và AML_SURV)

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 18 (III.3.1.2) và trang 19 (III.3.2.1)
- Section: CM-1.2 vs CM-2.2
- Quote nguyên văn: CM-1.2: "Type ... Chọn giá trị trong drop-down list bao gồm các giá trị: AML_MN"; CM-2.2: "Type Droplist Lựa chọn trong drop-down list cho tiêu chí case thuộc loại nào. Ví dụ: • AML_MN (Case thủ công) • AML_SURV (Case tự động)"

#### 2. Bối cảnh nghiệp vụ

Người dùng vào màn hình tạo case thủ công thì chỉ thấy 1 giá trị Type khả dụng (AML_MN), nhưng khi vào màn hình tìm kiếm case (CM-2.2) để lọc theo trường Type thì lại thấy 2 giá trị (AML_MN và AML_SURV, trong đó AML_SURV là case tự động do kịch bản HIT sinh ra).

#### 3. Vấn đề cụ thể

Bản thân sự khác biệt này có thể hợp lý về logic (màn hình tạo case thủ công dĩ nhiên không cho chọn AML_SURV vì case tự động không do người dùng tạo tay), nhưng tài liệu không nói rõ điều này một cách tường minh - khiến người đọc phải tự suy luận thay vì được xác nhận bằng 1 câu giải thích rõ ràng. (Riêng băn khoăn về từ "Ví dụ:" ở CM-2.2 gợi ý danh sách chưa đầy đủ đã được FIS xác nhận cập nhật - "Fis update" - nên không còn là điểm mở, không đưa vào finding này.)

#### 4. Ảnh hưởng nếu không giải quyết

- Tester không chắc chắn được liệu Type filter trên màn hình tìm kiếm có đúng và chỉ có 2 giá trị AML_MN/AML_SURV, hay còn giá trị thứ 3 chưa được liệt kê đầy đủ, dẫn tới TC bao phủ tìm kiếm theo Type có thể bị thiếu.

#### 5. Đề xuất giải quyết

Bổ sung 1 câu xác nhận tường minh ở CM-1.2: "Màn hình tạo case thủ công chỉ hiển thị Type = AML_MN vì case AML_SURV chỉ do hệ thống tự sinh từ kịch bản, không tạo thủ công được." 

#### 6. Liên kết với các phát hiện khác

Cùng nhóm với RR-007 (mơ hồ về Case Type).

#### 7. Câu hỏi cho người dùng

(a) Xác nhận bổ sung 1 câu giải thích tường minh vào CM-1.2 rằng dropdown Type ở màn hình tạo case thủ công chỉ hiển thị AML_MN vì AML_SURV chỉ do hệ thống tự sinh, không tạo thủ công được?

#### 8. Owner

BA (FIS) - vì đây chủ yếu là vấn đề biên tập/làm rõ tài liệu hơn là quyết định nghiệp vụ mới.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-009 [Cao] Thiếu phủ — Không có bảng liệt kê đầy đủ toàn bộ enum trạng thái (Status) của Case dùng cho bộ lọc tìm kiếm

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 19, comment [APTL(215)]/[A216R215]
- Section: III.3.2.1 (CM-2.2), trường "Status"
- Quote nguyên văn: "Status Droplist Lọc theo trạng thái của case – có thể lọc nhiều tiêu chí cùng lúc"

#### 2. Bối cảnh nghiệp vụ

Người dùng vào màn hình tìm kiếm case, muốn lọc ra tất cả case đang ở trạng thái "Pending Checker Review" để rà soát. Trường Status được mô tả là dropdown cho phép lọc, hỗ trợ chọn nhiều trạng thái cùng lúc.

#### 3. Vấn đề cụ thể

Toàn bộ tài liệu chỉ mô tả trạng thái Status rải rác qua từng bước của 3 luồng nghiệp vụ (II.1.1, II.1.2, II.1.3) - đếm sơ bộ có ít nhất 15 giá trị khác nhau xuất hiện (New, Pending Checker Review, Pending Checker Review STR, Pending Supervisor Review, Pending Maker, Pending AML Maker, Pending AML Checker review, Pending Generate STR, Rejected sending STR, Closed - No Further Action, Closed - Under Monitoring, Closed - Not Send STR, Approved STR...). Không có bất kỳ bảng tổng hợp nào liệt kê đầy đủ toàn bộ các giá trị này để dùng làm option cho dropdown Status ở màn hình tìm kiếm.

#### 4. Ảnh hưởng nếu không giải quyết

- Test coverage cho bộ lọc Status gần như chắc chắn bị thiếu vì tester phải tự dò từng bước trong 3 luồng để tổng hợp danh sách, dễ bỏ sót các trạng thái ít gặp (ví dụ "Rejected sending STR" xuất hiện ở 3 vị trí khác nhau trong luồng với cùng tên nhưng có thể có ý nghĩa ngữ cảnh khác).
- Không rõ dropdown Status có phân nhóm theo luồng (case tự động vs thủ công có thể có tập trạng thái khác nhau) hay dùng chung 1 danh sách phẳng.

#### 5. Đề xuất giải quyết

Bổ sung 1 bảng "Danh mục trạng thái Case" tổng hợp toàn bộ giá trị Status đã xuất hiện xuyên suốt II.1.1/II.1.2/II.1.3, đặt tại đầu mục III.3 hoặc trong Phụ lục, làm nguồn tham chiếu chung cho cả CM-2 (tìm kiếm), CM-3 (hiển thị), và CM-8 (audit trail).

#### 6. Liên kết với các phát hiện khác

Liên quan RR-032 (không có bảng field-spec đầy đủ, cùng dạng thiếu phủ về đặc tả dữ liệu tham chiếu dùng chung).

#### 7. Câu hỏi cho người dùng

(a) Có thể cung cấp bảng tổng hợp đầy đủ toàn bộ giá trị Status hợp lệ trong hệ thống TM (không chỉ trích từ mô tả luồng) không? (b) Dropdown Status ở màn hình tìm kiếm có hiển thị toàn bộ giá trị cho mọi loại case, hay lọc theo Case Type đã chọn trước đó?

#### 8. Owner

BA (FIS) - vì đây là công việc tổng hợp lại thông tin đã có sẵn rải rác trong chính tài liệu, không cần quyết định nghiệp vụ mới.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-010 [Thấp] Mơ hồ — Trường Age (tuổi case) trong tìm kiếm không rõ tính từ ngày tạo tới hiện tại hay tới ngày đóng case

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 18-19, comment [APTL(211)]/[A212R211]
- Section: III.3.2.1 (CM-2.2), trường "Age"
- Quote nguyên văn: "Age Textbox Tuổi của case, Lựa chọn: '<='; '=' và '>=' Sau đó nhập số ngày – khoảng thời gian cần tìm kiếm."

#### 2. Bối cảnh nghiệp vụ

Người dùng muốn tìm các case đã tồn tại quá lâu (ví dụ "Age >= 30 ngày") để ưu tiên xử lý case tồn đọng. Với case đã đóng ("Closed - No Further Action" chẳng hạn) từ 60 ngày trước, filter Age có thể vẫn trả về case đó nếu Age tính đến "hiện tại", dù thực chất case không còn "tồn đọng" nữa.

#### 3. Vấn đề cụ thể

Comment [A212R211] chỉ giải thích cách nhập liệu ("số ngày là khoảng thời gian cần tìm kiếm") chứ không làm rõ điểm mốc tính toán: Age = (ngày hiện tại - ngày tạo case) áp dụng cho MỌI case bất kể đã đóng hay chưa, hay Age chỉ có ý nghĩa với case đang mở (case đã đóng thì Age "đóng băng" tại thời điểm đóng)?

#### 4. Ảnh hưởng nếu không giải quyết

- TC kiểm tra filter Age trên case đã đóng có thể cho kết quả khác kỳ vọng tùy theo cách hiểu, dẫn tới false positive/negative khi verify.

#### 5. Đề xuất giải quyết

Đề xuất (giả định): Age luôn tính = (ngày hiện tại - ngày tạo), áp dụng thống nhất cho mọi trạng thái case vì đây là công thức đơn giản nhất và phù hợp với ý nghĩa "case đã tồn tại bao lâu kể từ khi phát sinh".

#### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

#### 7. Câu hỏi cho người dùng

(a) Age = (ngày hiện tại - ngày tạo case) không phân biệt trạng thái, hay Age dừng tính khi case chuyển sang trạng thái Closed?

#### 8. Owner

Business Authority (nghiệp vụ MSB) - vì liên quan tới cách nghiệp vụ ưu tiên xử lý case tồn đọng.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-011 [Cao] Tương tranh — CM-4: chưa mô tả cơ chế xử lý khi 2 user trong cùng nhóm quyền cùng mở 1 case gần như đồng thời

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 21
- Section: III.3.4 (CM-4)
- Quote nguyên văn: "Khi hệ thống phát sinh sự vụ (case), case sẽ được tự động phân công cho nhóm user gán quyền case type của TM. User đầu tiên trong nhóm thực hiện mở case sẽ được gán làm người xử lý của case đó."

#### 2. Bối cảnh nghiệp vụ

Case mới HIT từ kịch bản AML-08 được phân công cho nhóm 5 DVKH Maker. Sáng hôm sau, cả 2 Maker là "Trần Thị B" và "Lê Văn C" cùng đăng nhập và cùng click mở case này gần như đồng thời (chênh lệch vài trăm mili-giây), mỗi người đều nhìn thấy case ở trạng thái "chưa có ai xử lý" trên màn hình danh sách của mình trước khi request được server xử lý xong.

#### 3. Vấn đề cụ thể

Cơ chế "user đầu tiên mở case được gán xử lý" ngụ ý có 1 điều kiện đua (race condition) khi 2 request mở case tới server gần như cùng lúc. Tài liệu không mô tả: Khả năng A - server xử lý tuần tự (có lock ở tầng DB), request tới sau sẽ nhận được thông báo "case đã được gán cho Trần Thị B" và bị chuyển sang chế độ chỉ xem (read-only). Khả năng B - không có cơ chế khóa, cả 2 user đều nghĩ mình đang là người xử lý và có thể cùng thao tác Take Action, dẫn tới ghi đè dữ liệu của nhau.

#### 4. Ảnh hưởng nếu không giải quyết

- Rủi ro dữ liệu nghiêm trọng: nếu là Khả năng B, 2 Maker cùng điền EDD khác nhau cho cùng 1 case, bản ghi cuối lưu vào hệ thống sẽ ghi đè bản ghi trước mà không có cảnh báo, làm mất thông tin điều tra của 1 trong 2 người.
- Không thể thiết kế được TC concurrency (2 session cùng thao tác) nếu không biết hành vi kỳ vọng.

#### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Solution Architect xác nhận theo khả năng của OFSAA): áp dụng khóa lạc quan (optimistic lock) ở tầng case - ngay khi 1 user mở case thành công, case chuyển trạng thái "đang được xử lý bởi X", user thứ 2 mở sau sẽ nhận thông báo case đã có người xử lý và được chuyển sang chế độ chỉ xem.

#### 6. Liên kết với các phát hiện khác

Liên quan RR-012 (rule điều phối case chưa có trong tài liệu) - cùng thuộc CM-4.

#### 7. Câu hỏi cho người dùng

(a) OFSAA có cơ chế khóa case tại tầng ứng dụng để đảm bảo chỉ 1 user xử lý tại 1 thời điểm không, hay cần MSB/FIS thiết kế bổ sung? (b) Nếu có khóa, user thứ 2 tới sau sẽ thấy thông báo gì và có được chuyển sang chế độ xem-only ngay không?

#### 8. Owner

Solution Architect - vì đây là quyết định về cơ chế kỹ thuật (locking) cần đánh giá khả năng đáp ứng của nền tảng OFSAA, không chỉ là quyết định nghiệp vụ thuần túy.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-012 [Cao] Thiếu phủ — CM-4: rule điều phối case cho từng luồng chỉ được thống nhất qua "trao đổi trực tiếp", chưa được đưa vào thân tài liệu

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 21, comment [HLV255]/[APTL(256)]/[A257R256]
- Section: III.3.4 (CM-4)
- Quote nguyên văn: "MSB đưa ra rule điều phối case cho từng luồng" → "Cái này khai báo và quản lý ở đâu nhỉ? Chưa rõ rule điều phối case?" → "Trao đổi trực tiếp"

#### 2. Bối cảnh nghiệp vụ

Nội dung thân văn bản của CM-4 chỉ nói chung chung "case được phân công cho nhóm user gán quyền case type của TM" mà không nêu rule cụ thể case nào đi tới nhóm nào - ví dụ case HIT từ kịch bản AML-01 (giao dịch khu vực rủi ro cao) có luôn đi tới đúng nhóm DVKH phụ trách khách hàng đó theo chi nhánh/jurisdiction hay đi tới 1 nhóm DVKH tập trung xử lý mọi kịch bản?

#### 3. Vấn đề cụ thể

Câu hỏi trực tiếp của reviewer ("khai báo và quản lý ở đâu") đã bị trả lời bằng "trao đổi trực tiếp" - nghĩa là 2 bên đã thống nhất bằng lời nói/họp offline nhưng KHÔNG ghi lại kết quả vào tài liệu. Đây là kiểu gap nguy hiểm nhất vì câu hỏi trông như "đã đóng" (có phản hồi) nhưng nội dung thực chất vẫn hoàn toàn thiếu trong văn bản chính thức.

#### 4. Ảnh hưởng nếu không giải quyết

- Không thể viết bất kỳ TC nào về phân công case theo đúng rule nghiệp vụ (vì rule không được ghi lại), chỉ có thể test happy path chung chung "case được gán cho 1 user trong nhóm quyền".
- Nếu rule điều phối phức tạp hơn (theo chi nhánh, theo loại khách hàng, theo mức độ ưu tiên...), toàn bộ phần UI cấu hình rule đó (nếu có) hoàn toàn chưa được đặc tả.

#### 5. Đề xuất giải quyết

Yêu cầu MSB cung cấp lại bằng văn bản nội dung đã "trao đổi trực tiếp" về rule điều phối case theo từng luồng, bổ sung vào CM-4 dưới dạng bảng mapping (Kịch bản/Luồng → Nhóm quyền xử lý).

#### 6. Liên kết với các phát hiện khác

Liên quan RR-011 (race condition trong CM-4) và RR-028 (Phụ lục 2 Ma trận phân quyền trống - có thể chính là nơi dự kiến chứa rule điều phối này).

#### 7. Câu hỏi cho người dùng

(a) Rule điều phối case theo từng luồng đã "trao đổi trực tiếp" có nội dung cụ thể là gì - phân theo chi nhánh, theo loại kịch bản, hay theo tiêu chí khác? (b) Rule này có được cấu hình được trên UI (như phần III.1 Quản lý kịch bản) hay là hard-code theo thiết kế hệ thống?

#### 8. Owner

Business Authority (nghiệp vụ MSB) - vì đây là quyết định nghiệp vụ về tổ chức vận hành, đã được thống nhất offline nhưng cần chính MSB xác nhận lại bằng văn bản.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-013 [Trung bình] Mơ hồ — CM-6: mô tả tính năng là "gửi email để tư vấn xử lý case" nhưng đồng thời khẳng định hệ thống chỉ gửi 1 chiều, không nhận phản hồi - mâu thuẫn logic

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 21, comment [APTL(267)]/[A268R267]
- Section: III.3.6 (CM-6)
- Quote nguyên văn: "Hệ thống cho phép người dùng thực hiện gửi email để tư vấn xử lý case" và ngay sau đó "Với tính năng gửi email, hệ thống cho phép gửi email chỉ theo 1 chiều đi và không có chiều nhận phản hồi về"; comment "Thế thì nhận tư vấn kiểu j nhỉ?" → "Hệ thống sẽ không hỗ trợ nhận mail phản hồi. Chưa hiểu ý 'nhận tư vấn' gì? Ai nhận tư vấn?"

#### 2. Bối cảnh nghiệp vụ

AML Maker đang xử lý 1 case phức tạp cần hỏi ý kiến từ 1 chuyên gia pháp lý bên ngoài đội AML (ví dụ phòng Pháp chế). Maker dùng chức năng CM-6 để soạn email mô tả case và gửi đi để "tư vấn xử lý". Theo tên gọi chức năng, người ta kỳ vọng sẽ nhận lại được câu trả lời/ý kiến tư vấn để tiếp tục xử lý case.

#### 3. Vấn đề cụ thể

Bản thân 2 câu mô tả liền kề nhau trong cùng 1 mục lại mâu thuẫn nhau về mặt ý nghĩa: nếu hệ thống "không có chiều nhận phản hồi về" thì chức năng gửi email này thực chất không phải "tư vấn" (2 chiều, có qua có lại) mà chỉ là "thông báo/yêu cầu 1 chiều" (gửi đi và chờ người nhận phản hồi ở KÊNH KHÁC, ví dụ ngoài hệ thống, qua điện thoại hoặc email cá nhân) - nhưng nếu vậy, người xử lý case sau khi nhận được câu trả lời bên ngoài phải tự tay ghi chú lại kết quả tư vấn vào case (qua CM-7 Ghi chú?) mà điều này chưa được liên kết rõ ràng trong tài liệu. Bản thân comment của reviewer cũng xác nhận không hiểu được ý nghĩa "nhận tư vấn" và câu hỏi "Ai nhận tư vấn?" chưa có câu trả lời rõ ràng nào tiếp theo.

#### 4. Ảnh hưởng nếu không giải quyết

- Đặt tên chức năng sai lệch với hành vi thực tế sẽ gây hiểu nhầm cho end-user khi sử dụng, và cho tester khi verify "kỳ vọng nhận được gì sau khi gửi tư vấn".
- Không rõ có cần liên kết chức năng CM-6 (gửi email) với CM-7 (ghi chú) để đóng vòng lặp "gửi hỏi → nhận câu trả lời qua kênh khác → ghi chú lại vào case" hay 2 chức năng hoàn toàn độc lập.

#### 5. Đề xuất giải quyết

Đề xuất (giả định): đổi tên mô tả chức năng từ "gửi email để tư vấn xử lý case" thành "gửi email thông báo/yêu cầu hỗ trợ xử lý case (1 chiều)" cho đúng bản chất, đồng thời bổ sung hướng dẫn rằng nếu nhận được phản hồi ngoài hệ thống, người dùng cần dùng CM-7 để ghi chú lại kết quả vào case.

#### 6. Liên kết với các phát hiện khác

Liên quan RR-014 (trường From chưa xác nhận giá trị) - cùng thuộc CM-6.

#### 7. Câu hỏi cho người dùng

(a) Chức năng CM-6 có đúng là chỉ dùng để THÔNG BÁO/yêu cầu ra ngoài hệ thống (1 chiều), và mọi phản hồi nhận được phải được người dùng tự ghi chú thủ công qua CM-7? (b) Có cần đổi lại tên/mô tả chức năng cho đúng với hành vi 1 chiều để tránh gây hiểu nhầm với người dùng cuối?

#### 8. Owner

Business Authority (nghiệp vụ MSB) - vì cần xác nhận lại đúng mục đích sử dụng thực tế của chức năng trước khi chốt cách đặt tên và mô tả.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-014 [Thấp] Mơ hồ — CM-6: giá trị cụ thể của trường "From" (email mặc định gửi đi) chưa được xác nhận, chỉ ghi chung chung "có thể cài đặt được"

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 21-22, comment [APTL(269)]/[A270R269]
- Section: III.3.6 (CM-6), trường "From"
- Quote nguyên văn: "From Mặc định hiển thị 1 email gửi đối với tất cả các case."; comment "Email chung của AML à?" → "Cụ thể dùng email nào có thể cài đặt được"

#### 2. Bối cảnh nghiệp vụ

Khi AML Maker soạn email tư vấn/thông báo về 1 case, trường "From" hiển thị sẵn 1 địa chỉ email mặc định dùng chung cho tất cả case trong toàn hệ thống (không phải email cá nhân của Maker).

#### 3. Vấn đề cụ thể

Câu trả lời "cụ thể dùng email nào có thể cài đặt được" chỉ xác nhận về mặt khả năng kỹ thuật (hệ thống cho phép cấu hình), nhưng không cho biết giá trị email mặc định thực tế sẽ là gì (ví dụ aml.notification@msb.com.vn) để tester có thể verify khi kiểm thử.

#### 4. Ảnh hưởng nếu không giải quyết

- Không thể viết TC assert chính xác giá trị hiển thị mặc định của trường From, chỉ có thể test rằng trường có giá trị (không rỗng) mà không xác nhận đúng địa chỉ nghiệp vụ mong muốn.

#### 5. Đề xuất giải quyết

Yêu cầu MSB cung cấp giá trị email cụ thể sẽ cấu hình cho môi trường UAT/Production để đưa vào test data.

#### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

#### 7. Câu hỏi cho người dùng

(a) Địa chỉ email mặc định cho trường From ở môi trường UAT là gì, để dùng làm dữ liệu test?

#### 8. Owner

Business Authority (nghiệp vụ MSB) - vì đây là giá trị cấu hình nghiệp vụ cụ thể, không phải quyết định thiết kế.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-015 [Cao] Nhất quán — Quy định file đính kèm (định dạng, dung lượng) không nhất quán giữa 3 tính năng CM-5, CM-6, CM-7

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 21-22
- Section: III.3.5 (CM-5), III.3.6 (CM-6), III.3.7 (CM-7)
- Quote nguyên văn: CM-5: "đính kèm file không giới hạn trong quá trình đánh giá tổng thể cảnh báo với những File có dung lượng không quá 9 MB và các định dạng attach file gồm word, excel, text, PDF"; CM-6: "Attach Cho phép đính kèm file Word, Excel, pdf, hình ảnh hoặc audio" (không nêu giới hạn dung lượng); CM-7: "Số lượng file ko có giới hạn... dung lượng 1 file tối đa có thể điều chỉnh, hiện hệ thống đang setup 10MB"

#### 2. Bối cảnh nghiệp vụ

Cùng 1 case, người dùng có thể đính kèm file ở 3 vị trí khác nhau trong quá trình xử lý: khi Take Action đánh giá case (CM-5), khi gửi email liên quan case (CM-6), và khi thêm ghi chú/bình luận (CM-7). Một file MP3 ghi âm cuộc gọi tư vấn khách hàng 8MB, hoặc 1 ảnh chụp giấy tờ 9.5MB, sẽ có kết quả upload khác nhau tùy vào việc người dùng chọn đính kèm qua tính năng nào.

#### 3. Vấn đề cụ thể

3 tính năng có 3 bộ quy định khác nhau: CM-5 giới hạn 4 định dạng (word/excel/text/PDF) và tối đa 9MB; CM-6 cho phép thêm hình ảnh và audio (không có trong CM-5) nhưng không nêu giới hạn dung lượng nào; CM-7 không giới hạn định dạng rõ ràng (kế thừa ngầm định từ CM-5?) nhưng dung lượng lại là 10MB (khác 9MB của CM-5). Không có cơ sở nào trong tài liệu giải thích tại sao 3 tính năng cùng thuộc 1 case lại có 3 quy định đính kèm khác nhau, có thể đây là chủ đích nghiệp vụ (audio ghi âm chỉ hợp lý khi gửi email tư vấn ra ngoài) nhưng cũng có thể là 3 lần soạn thảo độc lập không đối chiếu chéo với nhau.

#### 4. Ảnh hưởng nếu không giải quyết

- Tester không biết dùng bộ quy định nào (9MB hay 10MB, có audio hay không) để thiết kế TC boundary cho từng tính năng, dễ chọn nhầm ngưỡng khi viết TC biên (ví dụ test file 9.5MB ở CM-7 sẽ PASS nhưng test viên có thể nhầm tưởng nó phải FAIL nếu áp dụng nhầm ngưỡng 9MB của CM-5).
- Nếu đây thực chất là 1 rule đính kèm dùng chung cho toàn hệ thống case (không phân biệt theo tính năng) thì tài liệu hiện tại đang mô tả sai và cần hợp nhất lại thành 1 rule duy nhất.

#### 5. Đề xuất giải quyết

Yêu cầu MSB/FIS xác nhận: (1) 3 rule này có chủ đích khác nhau theo từng tính năng hay nên hợp nhất thành 1 rule chung; (2) nếu khác nhau có chủ đích, bổ sung câu giải thích ngắn ở mỗi mục để người đọc không hiểu nhầm là lỗi soạn thảo.

#### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

#### 7. Câu hỏi cho người dùng

(a) Giới hạn dung lượng file đính kèm là 9MB (theo CM-5) hay 10MB (theo CM-7) - hay mỗi tính năng thực sự có ngưỡng riêng theo đúng như đã mô tả? (b) Định dạng hình ảnh và audio ở CM-6 có thực sự chỉ áp dụng riêng cho gửi email, không áp dụng cho CM-5/CM-7?

#### 8. Owner

Business Authority (nghiệp vụ MSB) - vì cần quyết định rule đính kèm là thống nhất toàn hệ thống hay có chủ đích khác biệt theo từng tính năng.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-016 [Trung bình] Mơ hồ — CM-7: trường "Loại hồ sơ/giấy tờ" không có danh mục giá trị cụ thể, chính hệ thống xác nhận không có trường lưu kiểu tài liệu

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 22, comment [APTL(289)]/[A290R289]
- Section: III.3.7 (CM-7)
- Quote nguyên văn: "Hệ thống cần có tối thiểu các trường thông tin: Loại hồ sơ/giấy tờ, Ghi chú tiêu chuẩn..."; comment "Có danh mục chưa?" → "Không có trường lưu kiểu doc type"

#### 2. Bối cảnh nghiệp vụ

Khi AML Checker đính kèm 1 file hộ chiếu của khách hàng vào case, họ được yêu cầu chọn "Loại hồ sơ/giấy tờ" - hàm ý có 1 danh mục phân loại như "Hộ chiếu", "CCCD", "Sao kê giao dịch", "Hợp đồng"... để tra soát dễ dàng về sau.

#### 3. Vấn đề cụ thể

Câu trả lời của FIS mâu thuẫn trực tiếp với tên trường đã liệt kê: xác nhận rằng thực tế hệ thống KHÔNG có trường lưu kiểu tài liệu (doc type) - nghĩa là trường "Loại hồ sơ/giấy tờ" ghi trong bảng yêu cầu tối thiểu thực chất chưa được hiện thực/không tồn tại. Đây là mâu thuẫn giữa yêu cầu (muốn có) và xác nhận về khả năng đáp ứng (không có), nhưng dòng yêu cầu trong bảng vẫn chưa được xóa hoặc sửa lại cho khớp với thực tế.

#### 4. Ảnh hưởng nếu không giải quyết

- Tester theo đúng bảng yêu cầu sẽ viết TC kỳ vọng có trường "Loại hồ sơ/giấy tờ" trên UI, nhưng tính năng thực tế không có, dẫn tới báo lỗi sai (false defect) khi thực thi.

#### 5. Đề xuất giải quyết

Đề xuất: xóa dòng "Loại hồ sơ/giấy tờ" khỏi danh sách yêu cầu tối thiểu nếu MSB xác nhận không cần tính năng phân loại tài liệu; nếu vẫn cần, phải bổ sung lại thành yêu cầu thực sự kèm danh mục giá trị cụ thể.

#### 6. Liên kết với các phát hiện khác

Cùng nhóm thiếu phủ đặc tả với RR-018 (Quản lý kịch bản thiếu bảng field-spec).

#### 7. Câu hỏi cho người dùng

Câu hỏi gốc "có danh mục chưa?" đã có câu trả lời (FIS xác nhận hệ thống không có trường lưu doc type), nên đây không còn là câu hỏi mở mà là 1 việc cần đồng bộ lại tài liệu: (a) Xác nhận xóa dòng "Loại hồ sơ/giấy tờ" khỏi bảng yêu cầu tối thiểu của CM-7 vì đã xác nhận không tồn tại trên hệ thống? (b) Nếu MSB vẫn muốn có phân loại tài liệu đính kèm cho mục đích tra soát, đây sẽ là 1 yêu cầu MỚI (chưa từng được duyệt) cần danh mục giá trị cụ thể, không phải khôi phục lại field cũ.

#### 8. Owner

Business Authority (nghiệp vụ MSB) - vì cần quyết định có giữ lại yêu cầu nghiệp vụ này hay không.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-017 [Trung bình] Thiếu phủ — CM-8 Audit Trail: danh sách "Hành động đối với case" cần được ghi log chưa được liệt kê đầy đủ

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 22, comment [APTL(299)]/[A300R299]
- Section: III.3.8 (CM-8)
- Quote nguyên văn: "Hệ thống cần có tối thiểu các trường thông tin: Tên người dùng, Thời gian thực hiện (ngày, giờ), Hành động đối với case..."; comment "Tối thiểu này chưa đủ, chưa biết hành động trên case nào?" → "Có thông tin 'Hành động đối với case'"

#### 2. Bối cảnh nghiệp vụ

Khi cần điều tra lại lịch sử xử lý 1 case cho mục đích thanh tra/tuân thủ, cán bộ kiểm soát cần xem Audit Trail để biết ai đã làm gì, khi nào - ví dụ ai đã thay đổi trạng thái case, ai đã thêm file đính kèm, ai đã xem case dù không thao tác gì.

#### 3. Vấn đề cụ thể

Câu trả lời "Có thông tin 'Hành động đối với case'" không thực sự trả lời câu hỏi của reviewer - chỉ lặp lại tên trường đã có sẵn trong bảng mà không liệt kê ra danh sách các loại hành động cụ thể sẽ được ghi nhận (ví dụ: Create, Take Action, Add Comment, Attach File, Send Email, Approve, Reject, Return to Maker, Re-open, View...). Trước đó có xác nhận riêng rẽ rằng "view case" cũng được tính là 1 hành động cần log (A298R297), nhưng đó là câu trả lời cho 1 câu hỏi khác, không phải là danh sách đầy đủ.

#### 4. Ảnh hưởng nếu không giải quyết

- Không thể viết TC verify đầy đủ Audit Trail có ghi nhận đúng MỌI loại hành động dự kiến, dễ sót hành động quan trọng (ví dụ Send Email hoặc Attach File có được ghi log không?).
- Với 1 hệ thống AML, việc audit trail thiếu sót có thể trực tiếp ảnh hưởng tới khả năng tuân thủ khi bị thanh tra.

#### 5. Đề xuất giải quyết

Yêu cầu bổ sung 1 bảng liệt kê đầy đủ toàn bộ loại hành động cần ghi Audit Trail, tối thiểu bao gồm: các action đã liệt kê trong 3 luồng nghiệp vụ (Recommend to.../Approve/Reject/Return to Maker/Re-open...), cộng thêm View case, Add Comment, Attach File, Send Email, Whitelist add/edit/delete (nếu audit trail dùng chung).

#### 6. Liên kết với các phát hiện khác

Cùng nhóm thiếu phủ với RR-009 (thiếu bảng enum Status).

#### 7. Câu hỏi cho người dùng

(a) Có thể cung cấp danh sách đầy đủ, tường minh mọi loại hành động cần ghi vào Audit Trail (không chỉ tên trường) không?

#### 8. Owner

Business Authority (nghiệp vụ MSB) - vì đây là yêu cầu tuân thủ, cần nghiệp vụ xác nhận mức độ chi tiết log cần thiết.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-018 [Chặn] Thiếu phủ — III.1 Quản lý kịch bản: không có bảng đặc tả field-level (loại dữ liệu/bắt buộc/độ dài) cho form tạo/sửa kịch bản, khác với cách đặc tả đầy đủ đã áp dụng cho Whitelist

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 14-15
- Section: III.1.1, III.1.2, III.1.3
- Quote nguyên văn: "Hệ thống cho phép người dùng tạo mới kịch bản gồm các thông tin: Thông tin chung: Mã kịch bản, Tên kịch bản, Loại kịch bản (theo chuỗi hành vi hoặc theo điều kiện ràng buộc), Đối tượng giám sát, Mô tả và mục tiêu kịch bản."

#### 2. Bối cảnh nghiệp vụ

Business Analyst hoặc Compliance Officer cần tạo mới 1 kịch bản giám sát (ví dụ AML-15 trong tương lai) qua UI. Mục III.1.1/III.1.2 chỉ liệt kê tên các trường thông tin bằng văn xuôi (Mã kịch bản, Tên kịch bản, Loại kịch bản...) hoàn toàn không có bảng field-spec dạng "Tên trường | Loại dữ liệu | Bắt buộc M/O | Độ dài | Mô tả" như đã áp dụng chi tiết cho Whitelist ở mục III.2 ngay sau đó.

#### 3. Vấn đề cụ thể

Không có thông tin: Mã kịch bản có tự sinh hay nhập tay, độ dài tối đa, có phải unique không; Tên kịch bản giới hạn ký tự bao nhiêu; "Loại kịch bản" là 1 trong 2 giá trị cố định (theo chuỗi hành vi/theo điều kiện ràng buộc) hay dropdown mở rộng; các tham số ngưỡng (giá trị tiền, số lượng giao dịch, phần trăm, tần suất, độ trễ, vùng địa lý) ở III.1.2 có kiểu dữ liệu và ràng buộc gì (ví dụ số âm có hợp lệ không, giá trị 0 có hợp lệ không).

#### 4. Ảnh hưởng nếu không giải quyết

- Không thể viết bất kỳ TC input validation nào (định dạng, độ dài, bắt buộc/tùy chọn, biên) cho toàn bộ màn hình tạo/sửa kịch bản - một trong những chức năng quan trọng nhất của hệ thống vì nó quyết định logic phát hiện rửa tiền.
- Không có cơ sở để xác nhận UI thực tế có đúng field như yêu cầu hay bị thiếu/thừa trường khi thực hiện review DOM thật.

#### 5. Đề xuất giải quyết

Bổ sung bảng field-spec đầy đủ cho III.1.1-III.1.3 theo đúng format đã dùng cho Whitelist (III.2), bao gồm ít nhất: Mã kịch bản (tự sinh/nhập tay, độ dài, unique), Tên kịch bản (độ dài, ký tự đặc biệt), Loại kịch bản (enum cụ thể), Đối tượng giám sát (enum: Khách hàng/Tài khoản), các tham số ngưỡng theo từng mức rủi ro HR/MR/RR (kiểu số, min/max).

#### 6. Liên kết với các phát hiện khác

Cùng mẫu thiếu phủ với RR-030 (Reporting không có field-spec) và RR-009 (Status enum thiếu).

#### 7. Câu hỏi cho người dùng

(a) Có thể cung cấp bảng field-spec đầy đủ cho form tạo/sửa kịch bản tương tự bảng đã có cho Whitelist không? (b) "Loại kịch bản" chỉ có đúng 2 giá trị cố định (theo chuỗi hành vi/theo điều kiện ràng buộc) hay có thể mở rộng thêm loại khác?

#### 8. Owner

BA (FIS) - vì đây là công việc hoàn thiện đặc tả còn thiếu, cần phối hợp với Business Authority để xác nhận từng ràng buộc cụ thể.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-019 [Trung bình] Mơ hồ — III.1.3: không thể chỉnh sửa "Trạng thái hoạt động" của kịch bản nhưng không có mô tả nào khác về cách bật/tắt (activate/deactivate) một kịch bản

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 15
- Section: III.1.3
- Quote nguyên văn: "Không thể chỉnh sửa một số thông tin định danh: ID, Trạng thái hoạt động, Loại của kịch bản."

#### 2. Bối cảnh nghiệp vụ

Sau khi tạo kịch bản AML-05 và đưa vào vận hành, MSB nhận thấy kịch bản này đang gây quá nhiều false positive và muốn tạm ngưng chạy (deactivate) trong khi chờ điều chỉnh ngưỡng, nhưng không muốn xóa hẳn kịch bản.

#### 3. Vấn đề cụ thể

Câu văn khẳng định "Trạng thái hoạt động" KHÔNG được phép chỉnh sửa qua tính năng "Chỉnh sửa kịch bản" (III.1.3) - nhưng không có mục nào khác trong toàn bộ III.1 mô tả một cách nào KHÁC để kích hoạt/ngưng kích hoạt kịch bản. Nếu trạng thái hoạt động thực sự không đổi được bằng bất kỳ cách nào sau khi tạo, kịch bản một khi đã Active sẽ chạy vĩnh viễn cho tới khi bị xóa hẳn - đây có vẻ không hợp lý về mặt vận hành.

#### 4. Ảnh hưởng nếu không giải quyết

- Không thể viết TC cho luồng "tạm ngưng 1 kịch bản đang chạy" - một nhu cầu vận hành rất thực tế (điều chỉnh ngưỡng, giảm false positive) - vì không biết chức năng này có tồn tại ở đâu.

#### 5. Đề xuất giải quyết

Làm rõ: nếu "trạng thái hoạt động" chỉ được set 1 lần khi Tạo mới và không đổi được sau đó, cần một tính năng riêng (không thuộc "Chỉnh sửa kịch bản") để Activate/Deactivate kịch bản, tương tự cơ chế Active/Deactivated đã có ở Whitelist.

#### 6. Liên kết với các phát hiện khác

Cùng nhóm thiếu phủ đặc tả với RR-018.

#### 7. Câu hỏi cho người dùng

(a) Có tính năng riêng để bật/tắt (Activate/Deactivate) một kịch bản đang hoạt động không, nếu có thì nằm ở màn hình nào? (b) Nếu không có, kịch bản một khi Active có bắt buộc chạy vĩnh viễn tới khi bị xóa không?

#### 8. Owner

Business Authority (nghiệp vụ MSB) - vì liên quan tới quy trình vận hành và kiểm soát rủi ro khi cần tạm ngưng 1 kịch bản.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-020 [Chặn] Thiếu phủ — AML-01: ngưỡng phân loại "khu vực địa lý rủi ro cao" và "rủi ro rất cao" chỉ tham chiếu tới danh sách bên ngoài BRD, không có trong tài liệu

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 23-24, comment [A301]
- Section: III.4.1 (AML-01)
- Quote nguyên văn: "* MSB cung cấp thông tin danh sách khu vực địa lý có rủi ro cao" và comment "MSB cung cấp danh sách khu vực địa lý có rủi ro cao, lưu ý, điểm quy ước cho danh sách này theo thang điểm 10"

#### 2. Bối cảnh nghiệp vụ

Kịch bản AML-01 có 3 trường hợp cảnh báo, sử dụng đồng thời 2 khái niệm khác nhau "khu vực địa lý có rủi ro cao" và "khu vực địa lý có rủi ro rất cao" (Trường hợp 1) với ngưỡng số lượng/giá trị giao dịch khác nhau. Để chạy được kịch bản, hệ thống cần biết chính xác quốc gia/vùng lãnh thổ nào thuộc nhóm "cao" và nhóm "rất cao".

#### 3. Vấn đề cụ thể

Cả danh sách khu vực địa lý cụ thể VÀ ranh giới điểm số phân tách "cao" với "rất cao" (chỉ được gợi ý mơ hồ là "thang điểm 10" mà không nói ngưỡng điểm cụ thể nào là "cao", ngưỡng nào là "rất cao") đều KHÔNG có trong BRD, chỉ được ghi chú sẽ do MSB cung cấp riêng, và không có bằng chứng trong các trang đã trích xuất cho thấy danh sách này đã được đính kèm.

#### 4. Ảnh hưởng nếu không giải quyết

- Không thể viết bất kỳ TC nào cho AML-01 - kịch bản đầu tiên và mang tính đại diện cho cả nhóm kịch bản dùng phân loại địa lý - vì thiếu dữ liệu tham chiếu cốt lõi để xác định input hợp lệ (quốc gia nào thuộc rủi ro cao/rất cao).
- Compliance risk: nếu danh sách/ngưỡng điểm sau này thay đổi mà không đồng bộ giữa tài liệu BRD và cấu hình hệ thống thực tế, kết quả kiểm thử UAT sẽ không phản ánh đúng hành vi production.

#### 5. Đề xuất giải quyết

Yêu cầu MSB cung cấp kèm theo tài liệu: (1) danh sách đầy đủ quốc gia/vùng lãnh thổ với điểm rủi ro theo thang điểm 10; (2) ngưỡng điểm cụ thể phân tách "rủi ro cao" và "rủi ro rất cao" (ví dụ điểm 7-8 = cao, 9-10 = rất cao).

#### 6. Liên kết với các phát hiện khác

Cùng mẫu thiếu phủ dữ liệu tham chiếu ngoài BRD với RR-021 (Effctv Risk Lvl từ KYC).

#### 7. Câu hỏi cho người dùng

(a) Danh sách khu vực địa lý rủi ro cao/rất cao kèm điểm số theo thang 10 đã được MSB cung cấp ở đâu (file riêng, hệ thống KYC, hay chưa hoàn thành)? (b) Ngưỡng điểm cụ thể phân tách "cao" và "rất cao" là bao nhiêu?

#### 8. Owner

Business Authority (nghiệp vụ AML/PCRT MSB) - vì đây là dữ liệu tham chiếu do chính sách nội bộ MSB quyết định, không thể tự suy diễn.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-021 [Chặn] Mơ hồ — AML-02: khái niệm "Ngưỡng rủi ro thực tế của Khách hàng" chưa từng được định nghĩa, không rõ có phải là cùng khái niệm với "Ngưỡng rủi ro hiệu quả (Effctv Risk Lvl)" đã có công thức hay không

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 25, comment [A302]
- Section: III.4.2 (AML-02)
- Quote nguyên văn: "Điều kiện 1: Ngưỡng rủi ro thực tế của Khách hàng thực hiện các giao dịch ≥ Ngưỡng rủi ro hiệu quả (Effctv Risk Lvl) VÀ..."; comment "Cần MSB confirm nguyên tắc này"

#### 2. Bối cảnh nghiệp vụ

Kịch bản AML-02 giám sát khách hàng có rủi ro cao. Điều kiện 1 so sánh 2 đại lượng: "Ngưỡng rủi ro thực tế của Khách hàng" (vế trái) với "Ngưỡng rủi ro hiệu quả - Effctv Risk Lvl" (vế phải). Chỉ có vế phải được giải thích chi tiết bằng công thức quy đổi từ điểm rủi ro KYC (KH điểm >70 → 10 điểm TM, KH điểm ≤70 → 0 điểm TM).

#### 3. Vấn đề cụ thể

Vế trái "Ngưỡng rủi ro thực tế của Khách hàng" không được định nghĩa ở bất kỳ đâu trong tài liệu. Có 2 khả năng: Khả năng A - đây thực chất là điểm rủi ro gốc của khách hàng lấy trực tiếp từ KYC trước khi quy đổi (ví dụ điểm 72,5 thực tế so với ngưỡng quy đổi 10) - nhưng nếu vậy phép so sánh "≥" giữa 1 thang điểm KYC (0-100) và 1 thang điểm quy đổi TM (chỉ có 2 giá trị 0 hoặc 10) là vô nghĩa về mặt logic. Khả năng B - đây là lỗi đánh máy/dịch thuật và thực chất 2 vế nên là cùng 1 khái niệm (tự so sánh chính nó luôn đúng), nghĩa là điều kiện 1 có thể đã bị viết sai và cần lược bỏ hoặc viết lại hoàn toàn.

#### 4. Ảnh hưởng nếu không giải quyết

- Không thể xác định input hợp lệ để kích hoạt AML-02 vì Điều kiện 1 - điều kiện đầu tiên và tiên quyết của kịch bản - có thể chưa từng thực sự có ý nghĩa tính toán rõ ràng.
- Nếu đội phát triển tự diễn giải sai khác với ý định thực sự của MSB, toàn bộ logic phát hiện rủi ro cao của AML-02 sẽ sai lệch trong production - hậu quả nghiêm trọng với hệ thống AML.

#### 5. Đề xuất giải quyết

Yêu cầu MSB làm rõ và viết lại chính xác công thức Điều kiện 1, phân biệt rõ ràng giữa "điểm rủi ro thực tế" (raw KYC score) và "ngưỡng rủi ro hiệu quả" (giá trị quy đổi 0/10), có thể kèm ví dụ số liệu cụ thể minh họa (VD: KH có điểm KYC 75 → Effctv Risk Lvl = 10 → điều kiện 1 kiểm tra điều gì cụ thể).

#### 6. Liên kết với các phát hiện khác

Cùng nhóm mơ hồ công thức định lượng với RR-022 (AML-03/04 công thức Avg).

#### 7. Câu hỏi cho người dùng

(a) "Ngưỡng rủi ro thực tế của Khách hàng" và "Ngưỡng rủi ro hiệu quả (Effctv Risk Lvl)" có phải là 2 tên gọi khác nhau cho cùng 1 khái niệm, hay là 2 đại lượng khác nhau cần so sánh với nhau? (b) Nếu là 2 đại lượng khác nhau, công thức tính "Ngưỡng rủi ro thực tế" cụ thể là gì?

#### 8. Owner

Business Authority (nghiệp vụ AML/PCRT MSB) - vì đây là công thức nghiệp vụ cốt lõi quyết định độ chính xác của kịch bản, cần chính MSB xác nhận (đã được ghi nhận là "Cần MSB confirm" trong chính tài liệu).

#### 9. Trạng thái

ĐANG MỞ

---

## RR-022 [Chặn] Mơ hồ — AML-03/AML-04: công thức tính giá trị giao dịch trung bình các tháng trong kỳ lookback có 2 phương án tính khác nhau (PA1/PA2) chưa được MSB xác nhận chọn phương án nào

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 26, comment [A303]
- Section: III.4.3 (AML-03), áp dụng tương tự cho III.4.4 (AML-04)
- Quote nguyên văn: "MSB confirm: việc tính Số tiền giao dịch trung bình các tháng trong thời gian lookback sẽ tính theo cách nào? PA1: Số tháng quy định trong thời gian lookback. PA2: Số tháng thực tế có giao dịch phát sinh"

#### 2. Bối cảnh nghiệp vụ

AML-03 so sánh giá trị giao dịch tháng hiện tại (A) với trung bình 6 tháng trước đó Avg(Bi), dùng để tính "(A - Avg(Bi))/Avg(Bi) ≥ 200%". Giả sử khách hàng chỉ có giao dịch phát sinh ở 2 trong 6 tháng lookback (4 tháng còn lại giá trị Bi = 0 vì không hoạt động).

#### 3. Vấn đề cụ thể

Theo PA1, Avg(Bi) = (tổng giá trị 6 tháng, kể cả tháng 0 đồng) / 6 - sẽ cho ra số trung bình rất thấp, khiến tỷ lệ tăng trưởng ((A - Avg)/Avg) rất cao và dễ HIT hơn. Theo PA2, Avg(Bi) = (tổng giá trị 2 tháng có giao dịch) / 2 - cho ra số trung bình cao hơn nhiều, khó HIT hơn. 2 phương án cho ra kết quả cảnh báo hoàn toàn khác nhau với cùng 1 bộ dữ liệu giao dịch, và câu hỏi (A303) chưa từng nhận được câu trả lời "TMP" xác nhận trong các trang đã trích xuất.

#### 4. Ảnh hưởng nếu không giải quyết

- Không thể viết TC xác định chính xác case nào sẽ HIT hay không HIT với AML-03/AML-04 vì kết quả phụ thuộc hoàn toàn vào phương án tính chưa được chốt - đây là ảnh hưởng trực tiếp lên oracle của TC (đúng nghĩa BLOCKER theo tiêu chí phân loại tác động TC).
- Rủi ro nghiệp vụ: nếu triển khai production dùng nhầm phương án so với ý định thực sự của MSB, hệ thống có thể bỏ sót cảnh báo thật (false negative) hoặc sinh quá nhiều cảnh báo giả (false positive) trên diện rộng vì đây là công thức áp dụng cho MỌI khách hàng.

#### 5. Đề xuất giải quyết

Yêu cầu MSB xác nhận dứt điểm chọn PA1 hay PA2 (hoặc phương án khác), kèm ví dụ số liệu minh họa cụ thể để đối chiếu khi viết TC.

#### 6. Liên kết với các phát hiện khác

Cùng nhóm mơ hồ công thức định lượng với RR-021. Công thức tương tự Avg(Di) áp dụng cả chiều ghi Có của AML-03 và cả 2 chiều Nợ/Có của AML-04 (dùng Bi max/Di max thay vì Avg) - toàn bộ 4 vị trí công thức này đều bị ảnh hưởng bởi cùng 1 câu hỏi gốc.

#### 7. Câu hỏi cho người dùng

(a) Chọn PA1 (chia cho đủ số tháng quy định trong kỳ lookback, kể cả tháng không có giao dịch) hay PA2 (chỉ chia cho số tháng thực tế có phát sinh giao dịch)? (b) Nếu khách hàng không có giao dịch ở BẤT KỲ tháng nào trong kỳ lookback (mẫu số PA2 = 0), công thức xử lý phép chia cho 0 như thế nào?

#### 8. Owner

Business Authority (nghiệp vụ AML/PCRT MSB) - vì đây là công thức nghiệp vụ cốt lõi, chính tài liệu đã ghi nhận "Cần MSB confirm" nhưng chưa thấy câu trả lời.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-023 [Thấp] Mơ hồ — AML-06: 2 nhánh điều kiện nối bằng "HOẶC" cùng được đánh số "Điều kiện 1", gây khó khăn khi trích dẫn số điều kiện trong test case

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 30-31
- Section: III.4.6 (AML-06)
- Quote nguyên văn: "Điều kiện 1: Tổng số tiền ghi Nợ ≥ 400 triệu VND quy đổi HOẶC Điều kiện 1: Tổng số tiền ghi Có ≥ 400 triệu VND quy đổi"

#### 2. Bối cảnh nghiệp vụ

AML-06 giám sát giao dịch tăng đột biến trên tài khoản không hoạt động, chỉ có duy nhất 1 nhóm điều kiện (khác với các kịch bản khác thường có 2-4 điều kiện nối AND). Điều kiện này có 2 nhánh nối bằng "HOẶC" (ghi Nợ ≥ 400 triệu, hoặc ghi Có ≥ 400 triệu) nhưng cả 2 nhánh đều được đánh số trùng nhau là "Điều kiện 1".

#### 3. Vấn đề cụ thể

Trong khi tất cả các kịch bản khác đánh số điều kiện tuần tự (Điều kiện 1, 2, 3...) cho mỗi mệnh đề riêng biệt dù nối bằng AND hay OR, AML-06 lại dùng chung 1 số cho cả 2 nhánh OR - đây là điểm không nhất quán về quy ước đánh số so với 13 kịch bản còn lại, dù không làm thay đổi bản chất logic (vẫn hiểu đúng là OR).

#### 4. Ảnh hưởng nếu không giải quyết

- Khi viết TC ID hoặc tài liệu tham chiếu tới "Điều kiện 1 của AML-06", không rõ đang nói tới nhánh ghi Nợ hay ghi Có, gây khó khăn khi trao đổi giữa các thành viên team hoặc khi audit lại TC.

#### 5. Đề xuất giải quyết

Đánh số lại thành "Điều kiện 1a" (ghi Nợ) và "Điều kiện 1b" (ghi Có) hoặc "Điều kiện 1"/"Điều kiện 2" độc lập, giữ nguyên quan hệ OR.

#### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

#### 7. Câu hỏi cho người dùng

(a) Xác nhận đánh số lại 2 nhánh OR của AML-06 thành Điều kiện 1a/1b (hoặc 1/2) để tránh nhầm lẫn khi trích dẫn?

#### 8. Owner

BA (FIS) - vì đây thuần túy là vấn đề biên tập/đánh số văn bản, không phải quyết định nghiệp vụ.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-024 [Trung bình] Thiếu phủ — Toàn bộ 14 kịch bản AML: ghi chú "(giá trị quy đổi)" xuất hiện xuyên suốt nhưng không có mục nào mô tả nguồn tỷ giá quy đổi, thời điểm áp dụng tỷ giá

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 23-39 (xuất hiện trong hầu hết 14 kịch bản, ví dụ trang 23: "Tổng giá trị giao dịch... ≥ 1 tỷ VND (giá trị quy đổi)")
- Section: III.4.1 → III.4.14 (toàn bộ)
- Quote nguyên văn: "(giá trị quy đổi)" lặp lại tại hầu hết điều kiện có đơn vị tiền tệ trong 14 kịch bản

#### 2. Bối cảnh nghiệp vụ

Khách hàng thực hiện 1 giao dịch bằng USD tương đương khoảng 42.000 USD trong kỳ giám sát của AML-01 (ngưỡng 1 tỷ VND). Để hệ thống đánh giá đúng giao dịch này có vượt ngưỡng 1 tỷ VND hay không, cần quy đổi 42.000 USD sang VND theo 1 tỷ giá cụ thể tại 1 thời điểm cụ thể.

#### 3. Vấn đề cụ thể

Cụm "(giá trị quy đổi)" được lặp lại hàng chục lần xuyên suốt toàn bộ 14 kịch bản như một cụm từ mặc định, nhưng không có bất kỳ mục nào trong tài liệu (kể cả phần đầu III.4 mô tả chung, hay bất kỳ phụ lục nào) giải thích: nguồn tỷ giá lấy từ đâu (tỷ giá niêm yết MSB, tỷ giá NHNN, hay tỷ giá giao dịch thực tế tại thời điểm phát sinh); thời điểm chốt tỷ giá (tại thời điểm giao dịch phát sinh, hay tại thời điểm batch kịch bản chạy để tổng hợp).

#### 4. Ảnh hưởng nếu không giải quyết

- Không thể chuẩn bị test data cho các giao dịch ngoại tệ một cách chính xác (không biết dùng tỷ giá nào để tính trước kỳ vọng HIT/không HIT).
- Với các giao dịch ngoại tệ xảy ra gần ranh giới ngưỡng (ví dụ gần đúng 1 tỷ VND sau quy đổi), sự khác biệt nhỏ về tỷ giá áp dụng (niêm yết đầu ngày và cuối ngày) có thể làm thay đổi kết quả HIT/không HIT - đây là rủi ro biên (edge case) cần được xác định rõ nguồn tỷ giá để test đúng.

#### 5. Đề xuất giải quyết

Bổ sung 1 mục chung ở đầu III.4 (trước khi liệt kê 14 kịch bản) mô tả rõ: nguồn tỷ giá quy đổi dùng thống nhất cho toàn bộ kịch bản TM, tần suất cập nhật tỷ giá, và thời điểm chốt tỷ giá áp dụng cho mỗi giao dịch.

#### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

#### 7. Câu hỏi cho người dùng

(a) Tỷ giá quy đổi ngoại tệ dùng nguồn nào (niêm yết MSB/NHNN/khác)? (b) Tỷ giá áp dụng chốt tại thời điểm giao dịch phát sinh hay tại thời điểm batch kịch bản chạy để tổng hợp dữ liệu?

#### 8. Owner

Business Authority phối hợp Backend Lead - vì vừa cần chính sách nghiệp vụ (nguồn tỷ giá) vừa cần xác nhận khả năng tích hợp lấy tỷ giá real-time hay batch của hệ thống.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-025 [Cao] Tuân thủ — "Approved STR" chỉ là trạng thái nội bộ hệ thống, KHÔNG tự động gửi STR tới SBV; thông tin tuân thủ quan trọng này chỉ nằm trong comment, không có trong thân văn bản chính, và không có trường lưu vết ngày thực tế nộp SBV

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 6-7, comment [HLV69]
- Section: II.1.1, bước 8 (AML Checker rà soát và phê duyệt gửi STR)
- Quote nguyên văn: "Hệ thống sẽ không tự động gửi STR đến SBV, đây là thông tin để NSD theo dõi và phân loại case."

#### 2. Bối cảnh nghiệp vụ

Ở bước cuối cùng của luồng, khi AML Checker chọn "Trường hợp 2: Phê duyệt gửi STR", hệ thống chuyển case sang trạng thái "Approved STR" và kết thúc luồng. Tên gọi action "Approve sending STR" (phê duyệt GỬI STR) và trạng thái "Approved STR" tạo cảm giác rằng báo cáo đã thực sự được gửi đi tới Ngân hàng Nhà nước - nhưng thực tế theo xác nhận của MSB trong comment, đây chỉ là quyết định nội bộ, việc nộp báo cáo thực tế cho SBV nằm HOÀN TOÀN ngoài phạm vi hệ thống (có thể qua kênh khác như cổng báo cáo NHNN, hoặc thủ công).

#### 3. Vấn đề cụ thể

Đây là 1 chi tiết mang tính tuân thủ pháp lý cực kỳ quan trọng (STR - Suspicious Transaction Report - phải nộp cho SBV theo quy định PCRT) nhưng chỉ tồn tại dưới dạng 1 dòng comment review, hoàn toàn không xuất hiện trong bất kỳ đoạn mô tả chính thức nào của luồng nghiệp vụ (bước 8 trong bảng chỉ ghi ngắn gọn "Approve sending STR → Approved STR"). Ngoài ra, không có trường dữ liệu nào trong toàn bộ đặc tả Case (III.3.1, III.3.3) hay STR để ghi nhận "đã thực sự nộp SBV vào ngày nào, qua kênh nào, người nào xác nhận đã nộp" - nghĩa là hệ thống TM sẽ không có cách nào theo dõi được liệu 1 case "Approved STR" đã thực sự hoàn tất nghĩa vụ báo cáo hay vẫn đang chờ nộp thủ công.

#### 4. Ảnh hưởng nếu không giải quyết

- Người đọc tài liệu (bao gồm cả đội test) không phân biệt được "Approved STR" (quyết định nội bộ) với "Đã nộp SBV" (nghĩa vụ pháp lý đã hoàn tất), dễ hiểu sai và bỏ sót một bước kiểm tra tuân thủ thực tế quan trọng.
- Rủi ro compliance: không có cơ chế nào trong hệ thống nhắc nhở/theo dõi các case "Approved STR" đã bị bỏ quên chưa nộp SBV thực tế, có thể dẫn tới vi phạm thời hạn báo cáo theo quy định NHNN mà không ai phát hiện.

#### 5. Đề xuất giải quyết

Đề xuất (dựa trên comment đã có, cần MSB xác nhận thêm): (1) bổ sung ghi chú tường minh vào bước 8 của thân văn bản làm rõ "Approved STR chỉ là quyết định nội bộ, việc nộp SBV thực hiện ngoài hệ thống"; (2) cân nhắc bổ sung 1 trường theo dõi thủ công "Ngày đã nộp SBV" hoặc trạng thái phụ "Đã nộp SBV" để phục vụ mục đích kiểm soát và báo cáo nội bộ (liên quan Report TM_01).

#### 6. Liên kết với các phát hiện khác

Liên quan trực tiếp RR-001 (rule xuất file STR chỉ ở trạng thái Close with STR) và RR-002 (yêu cầu STR/EDD khi re-open) - cả 3 cùng thuộc nhóm gap về vòng đời của báo cáo STR sau khi được duyệt.

#### 7. Câu hỏi cho người dùng

(a) Xác nhận bổ sung ghi chú tường minh vào thân văn bản chính (không chỉ trong comment) rằng hệ thống không tự động nộp STR cho SBV? (b) Có cần bổ sung trường/trạng thái theo dõi việc đã nộp SBV thực tế (ngoài hệ thống) để phục vụ kiểm soát tuân thủ nội bộ không?

#### 8. Owner

Business Authority phối hợp Compliance (nghiệp vụ AML/PCRT MSB) - vì đây là quyết định liên quan trực tiếp tới nghĩa vụ báo cáo pháp lý với NHNN.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-026 [Trung bình] Thiếu phủ — Chênh lệch đáng kể về số cấp phê duyệt giữa case xuất phát từ hệ thống/DVKH (4 cấp) và case do AML tự tạo thủ công (chỉ 1 cấp) chưa có giải trình nghiệp vụ

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 6-11 (II.1.1, II.1.2.1) đối chiếu trang 11 (II.1.2.2)
- Section: II.1.1/II.1.2.1 (luồng hệ thống/DVKH) vs II.1.2.2 (luồng AML thủ công)
- Quote nguyên văn: luồng II.1.1 có 8 bước qua 5 vai trò (DVKH Maker → DVKH Checker → Checker N+1 → AML Maker → AML Checker); luồng II.1.2.2: "1a Bộ phận AML tạo sự vụ thủ công... 1b Thực hiện tạo STR... 2 AML Checker rà soát và phê duyệt gửi STR" (chỉ 2 bước, 1 cấp phê duyệt)

#### 2. Bối cảnh nghiệp vụ

Một case HIT từ kịch bản AML-08 (phát hiện tự động, hệ thống sinh case) phải đi qua tối đa 4 cấp phê duyệt/rà soát (DVKH Checker, Checker N+1, AML Maker, AML Checker) trước khi STR được duyệt gửi. Trong khi đó, nếu cùng 1 tình huống nghi ngờ đó được cán bộ AML tự phát hiện và tạo case thủ công (case "AML tự tạo"), STR chỉ cần qua đúng 1 cấp phê duyệt (AML Checker) là đủ để hoàn tất.

#### 3. Vấn đề cụ thể

Với cùng một loại quyết định cuối cùng có ý nghĩa pháp lý như nhau (quyết định có gửi STR hay không), mức độ kiểm soát rủi ro (số cấp rà soát độc lập) lại chênh lệch tới 4 lần tùy vào NGUỒN GỐC case, thay vì tùy vào MỨC ĐỘ RỦI RO của case. Tài liệu không giải thích lý do của sự chênh lệch này (ví dụ giả thiết hợp lý là AML Maker/Checker vốn đã là chuyên gia PCRT nên cần ít lớp kiểm soát hơn DVKH), khiến sự bất đối xứng này trông giống một khoảng trống kiểm soát chưa được cân nhắc kỹ hơn là 1 chủ đích thiết kế.

#### 4. Ảnh hưởng nếu không giải quyết

- Rủi ro compliance: kiểm toán/thanh tra NHNN có thể đặt câu hỏi tại sao case do chính đội AML tự tạo lại có ít bước kiểm soát chéo hơn case phát hiện tự động, trong khi về nguyên tắc 4-mắt (four-eyes principle) nên áp dụng nhất quán.
- Không có TC nào kiểm tra tính nhất quán của rule kiểm soát theo loại rủi ro (chỉ có thể test theo đúng số bước đã tài liệu hóa, không thể test "có nên có thêm bước kiểm soát" vì đó là quyết định thiết kế).

#### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Business Authority + Compliance xác nhận): nếu chênh lệch này là chủ đích, bổ sung 1 câu giải trình ngắn vào đầu mục II.1.2.2 nêu rõ lý do (ví dụ: "case AML tự tạo do chính chuyên viên PCRT cấp cao khởi xướng nên áp dụng cơ chế rút gọn theo chính sách rủi ro nội bộ số ..."). Nếu không phải chủ đích, cân nhắc bổ sung ít nhất 1 cấp rà soát độc lập (ví dụ AML Maker riêng biệt với người tạo case) trước khi AML Checker phê duyệt cuối.

#### 6. Liên kết với các phát hiện khác

Liên quan RR-025 (tuân thủ nộp STR) - cả 2 cùng thuộc nhóm rủi ro compliance của luồng phê duyệt STR.

#### 7. Câu hỏi cho người dùng

(a) Việc case AML tự tạo chỉ cần 1 cấp phê duyệt (thay vì 4 cấp như case DVKH/tự động) có phải là chủ đích chính sách rủi ro đã được MSB phê duyệt chính thức? (b) Nếu có, đề nghị cung cấp căn cứ/chính sách nội bộ để ghi chú vào tài liệu.

#### 8. Owner

Business Authority phối hợp Compliance (nghiệp vụ AML/PCRT MSB) - vì đây là quyết định về mức độ kiểm soát rủi ro nội bộ, cần thẩm quyền cao hơn BA thông thường.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-027 [Thấp] Nhất quán — Luồng re-open case với case nguồn gốc AML tự tạo thủ công không đề cập gửi email thông báo, trong khi mong muốn nghiệp vụ chung đã nêu là luôn có email khi re-open

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 12-13, đối chiếu comment [A124]
- Section: II.1.3, bước 1a vs bước 1b
- Quote nguyên văn: bước 1a "Hệ thống chuyển trạng thái case và tự động gửi email theo mẫu EM-9 tới DVKH maker ban đầu... và group email của DVKH Checker"; bước 1b "Hệ thống chuyển trạng thái case, chuyển bước 2" (không nhắc email); đối chiếu comment A124: "Mong muốn của nghiệp vụ: Khi re-open có email thông báo cho maker. Không giới hạn thời gian được re-open case"

#### 2. Bối cảnh nghiệp vụ

Case do AML Maker tự tạo thủ công, đã đóng ở trạng thái "Approved STR", nay được re-open. Theo bước 1b của luồng re-open, hệ thống chỉ "chuyển trạng thái case" mà không có mô tả gửi email nào, khác hẳn với bước 1a (case nguồn DVKH) có gửi email EM-9 rõ ràng.

#### 3. Vấn đề cụ thể

Mong muốn nghiệp vụ được ghi nhận ở comment A124 là "khi re-open có email thông báo cho maker" - không giới hạn phạm vi chỉ áp dụng cho case nguồn DVKH. Việc bước 1b không đề cập email có thể chỉ là thiếu sót khi soạn thảo (rơi rớt do sao chép từ mẫu 1a nhưng quên bổ sung phần email) chứ không hẳn là chủ đích khác biệt.

#### 4. Ảnh hưởng nếu không giải quyết

- Nếu bỏ sót email là ngoài ý muốn, AML Maker phụ trách case AML tự tạo sẽ không được thông báo khi case bị re-open, có thể chậm trễ xử lý case đã có thời hạn báo cáo liên quan tuân thủ.

#### 5. Đề xuất giải quyết

Đề xuất (giả định): bổ sung tương tự bước 1a - khi re-open case nguồn AML tự tạo, gửi email thông báo cho AML Maker gốc (và group AML Checker dự phòng, áp dụng cùng logic đã thống nhất ở RR-003).

#### 6. Liên kết với các phát hiện khác

Liên quan RR-003 (re-open khi maker gốc nghỉ việc) - cùng thuộc luồng re-open case.

#### 7. Câu hỏi cho người dùng

(a) Xác nhận bước 1b (re-open case nguồn AML tự tạo) cũng cần gửi email thông báo tương tự bước 1a, hay đây là chủ đích khác biệt (case AML tự tạo do chính đội AML theo dõi liên tục nên không cần email)?

#### 8. Owner

Business Authority (nghiệp vụ MSB) - vì cần xác nhận đây có phải thiếu sót soạn thảo hay chủ đích nghiệp vụ.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-028 [Chặn] Thiếu phủ — Phụ lục 1 (Danh mục dữ liệu yêu cầu) và Phụ lục 2 (Ma trận phân quyền) chỉ có tiêu đề mục lục, hoàn toàn không có nội dung, dù được tham chiếu nhiều lần xuyên suốt BRD

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 40
- Section: IV.1, IV.2
- Quote nguyên văn: "IV.1. Phụ lục 1: Danh mục dữ liệu yêu cầu" và "IV.2. Phụ lục 2: Ma trận phân quyền" - cả 2 mục chỉ có dòng tiêu đề, không có bảng/nội dung nào theo sau (khác với IV.3 ngay bên dưới có đính kèm 2 file .docx cụ thể)

#### 2. Bối cảnh nghiệp vụ

Trong suốt tài liệu, Phụ lục 2 (Ma trận phân quyền) được tham chiếu ít nhất 3 lần ở các ngữ cảnh khác nhau: III.3.1 khi mô tả quyền sở hữu/xử lý case ("Phụ lục – 2. Phụ lục 2: Ma trận phân quyền"), III.5 khi mô tả quyền xem/xuất báo cáo, và nhiều comment yêu cầu "Bổ sung yêu cầu phân quyền dữ liệu" ở CM-2/CM-3 (tìm kiếm và hiển thị case). Phụ lục 1 được tham chiếu khi mô tả danh mục dữ liệu dùng trong các kịch bản.

#### 3. Vấn đề cụ thể

Cả 2 phụ lục này - vốn là nguồn tham chiếu trung tâm cho toàn bộ yêu cầu phân quyền của hệ thống (ai được xem case nào, ai được tạo/sửa/xóa whitelist, ai được xem báo cáo nào) - đều KHÔNG có bất kỳ nội dung nào trong file BRD v1.8 đang được phân tích. Điều này khác biệt rõ với Phụ lục 3 (Bộ câu hỏi EDD) ngay phía dưới, vốn có đính kèm 2 file .docx cụ thể cho KHCN và KHDN.

#### 4. Ảnh hưởng nếu không giải quyết

- Không thể viết bất kỳ TC nào về kiểm tra phân quyền (ai xem được gì, ai thao tác được gì) - một phần kiểm thử bảo mật/access-control cực kỳ quan trọng với hệ thống AML xử lý dữ liệu nhạy cảm của khách hàng.
- Không có danh mục dữ liệu chuẩn để đối chiếu khi thiết kế test data cho 14 kịch bản (ví dụ danh sách trường dữ liệu giao dịch nào hệ thống có thể sử dụng để tính toán điều kiện).

#### 5. Đề xuất giải quyết

Yêu cầu MSB/FIS cung cấp nội dung đầy đủ của Phụ lục 1 và Phụ lục 2 (dưới dạng file đính kèm tương tự Phụ lục 3, hoặc bổ sung trực tiếp vào bản BRD tiếp theo) trước khi tiến hành thiết kế test case liên quan phân quyền.

#### 6. Liên kết với các phát hiện khác

Liên quan RR-012 (rule điều phối case "trao đổi trực tiếp" - có thể chính là nội dung dự kiến của Phụ lục 2) và RR-032 (thiếu quy định masking dữ liệu nhạy cảm theo phân quyền).

#### 7. Câu hỏi cho người dùng

(a) Phụ lục 1 và Phụ lục 2 đã có nội dung ở 1 file riêng biệt ngoài BRD này chưa, nếu có đề nghị cung cấp? (b) Nếu chưa có, timeline dự kiến hoàn thành 2 phụ lục này là khi nào, vì đây là điều kiện tiên quyết để viết TC liên quan phân quyền?

#### 8. Owner

Business Authority phối hợp Security Lead - vì Ma trận phân quyền vừa cần quyết định nghiệp vụ (vai trò nào làm gì) vừa cần rà soát bảo mật dữ liệu.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-029 [Chặn] Thiếu phủ — Phụ lục 6 (Màn hình STR và Template STR) không có bất kỳ nội dung nào, dù màn hình nhập STR là màn hình lõi được tham chiếu bắt buộc ở hầu hết các bước trong cả 3 luồng nghiệp vụ chính

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 41, đối chiếu comment [TMP(TP308)]/[PT309R308] ở trang 40
- Section: IV.6.1, IV.6.2
- Quote nguyên văn: "IV.6.1. Màn hình STR" và "IV.6.2. Template STR" - cả 2 mục chỉ có dòng tiêu đề, không có nội dung/bảng field nào theo sau; đối chiếu tham chiếu ở trang 5: "Thông tin chi tiết về nhập màn hình STR tham chiếu <<VI.Phụ lục - Phụ lục 6.1. Màn hình STR>>". Lưu ý quan trọng: comment [PT309R308] ghi "Đã bổ sung phụ lục 06: Màn hình STR và template STR" - tức phía FIS xác nhận ĐÃ bổ sung nội dung này ở đâu đó, nhưng bản PDF đang phân tích (v1.8) không thể hiện bất kỳ nội dung nào tại đúng vị trí IV.6.1/IV.6.2 (khác hẳn Phụ lục 3 ngay gần đó vẫn hiển thị icon file đính kèm rõ ràng).

#### 2. Bối cảnh nghiệp vụ

Ở bước 4 của luồng tự động (II.1.1), khi DVKH Maker "thực hiện tạo STR sau đó trình duyệt lên DVKH Checker", tài liệu chủ động dẫn người đọc sang Phụ lục 6.1 để xem chi tiết màn hình nhập liệu STR - đây là màn hình DVKH Maker/AML Maker phải sử dụng ở gần như MỌI nhánh "tạo STR" xuyên suốt 3 luồng nghiệp vụ (II.1.1 bước 4, II.1.2.1 bước 3, II.1.2.2 bước 1b, và mọi nhánh re-open dẫn tới tạo STR).

#### 3. Vấn đề cụ thể

Giống RR-028, phụ lục này hoàn toàn trống trong bản PDF đang phân tích - không có bảng field, không có mô tả layout, không có validation rule cho màn hình STR - mặc dù comment [PT309R308] khẳng định "Đã bổ sung phụ lục 06". Đây không hẳn là 1 câu hỏi mở về nghiệp vụ (nội dung có thể đã tồn tại ở phiên bản file khác hoặc bị lỗi khi xuất PDF), nhưng vẫn là 1 gap thực sự đối với chính bản v1.8 này: nếu tester chỉ có đúng file PDF này trong tay, họ sẽ không thấy được đặc tả màn hình STR - chức năng lõi được tham chiếu ở hầu hết mọi luồng nghiệp vụ.

#### 4. Ảnh hưởng nếu không giải quyết

- Không thể viết bất kỳ TC nào cho chức năng lõi nhất của hệ thống AML - màn hình tạo/nhập liệu STR - vì hoàn toàn không có field, validation, hay layout nào được đặc tả.
- Comment [A313] còn nêu câu hỏi chưa trả lời về chữ ký số trên STR ("Luồng thủ công xuất phát từ AML maker: user nào sẽ ký và ký ở vị trí nào?") - càng cho thấy đặc tả màn hình STR còn rất nhiều khoảng trống chưa được giải quyết dù đã qua nhiều vòng review.

#### 5. Đề xuất giải quyết

Vì FIS đã xác nhận "Đã bổ sung" Phụ lục 6 ở đâu đó, đề xuất trước tiên là yêu cầu MSB/FIS gửi lại đúng bản PDF/file đã chứa đầy đủ nội dung Phụ lục 6 (màn hình STR, Template STR, Template Mô tả dòng tiền, Bảng kê giao dịch) để đối chiếu lại - nhiều khả năng đây là lỗi xuất file hơn là nội dung thực sự chưa có. Nếu xác nhận nội dung thực sự chưa tồn tại ở bất kỳ đâu, đây sẽ là gap mức Chặn cần MSB/FIS bổ sung trước khi test design cho luồng STR.

#### 6. Liên kết với các phát hiện khác

Liên quan chặt chẽ RR-001 (rule xuất STR), RR-002 (STR khi re-open), RR-025 (Approved STR và nghĩa vụ nộp SBV) - toàn bộ nhóm finding về vòng đời STR đều phụ thuộc vào việc có được đặc tả màn hình STR đầy đủ.

#### 7. Câu hỏi cho người dùng

(a) Comment [PT309R308] ghi "Đã bổ sung phụ lục 06" - nội dung đã bổ sung này nằm ở file/phiên bản nào, có thể gửi lại để đối chiếu với file PDF v1.8 đang thiếu nội dung này không? (b) Câu hỏi về chữ ký số trên STR (ai ký, ký ở vị trí nào với case nguồn AML thủ công) đã được MSB xác nhận chưa?

#### 8. Owner

Business Authority + BA (FIS) - vì đây là công việc bổ sung đặc tả còn thiếu nghiêm trọng nhất trong toàn bộ tài liệu, cần ưu tiên xử lý trước tiên.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-030 [Cao] Thiếu phủ — III.5 Reporting: 4 báo cáo nội bộ chỉ có tên và mô tả 1 dòng, không có đặc tả field/filter/layout/định dạng xuất

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 40, comment [A304]
- Section: III.5
- Quote nguyên văn: bảng chỉ có 3 cột (STT, Mã yêu cầu, Nội dung yêu cầu) với nội dung 1 dòng cho mỗi báo cáo, ví dụ "Report TM_03 | Báo cáo các cảnh báo chưa được xử lý"; comment "Chi tiết comment theo file đính kèm" - tương tự RR-029, đây là 1 xác nhận rằng chi tiết ĐÃ tồn tại ở 1 file đính kèm khác, chỉ là file đó không xuất hiện trong PDF đang phân tích (khác Phụ lục 3 có icon file rõ ràng)

#### 2. Bối cảnh nghiệp vụ

Compliance Officer cần dùng Report TM_03 (báo cáo các cảnh báo chưa xử lý) để theo dõi case tồn đọng hàng tuần. Để dùng được báo cáo này, cần biết báo cáo hiển thị cột nào (Case ID? Age? Assignee?), có filter theo khoảng thời gian/chi nhánh không, xuất ra định dạng gì (Excel/PDF), và tần suất tạo báo cáo (real-time hay theo lịch).

#### 3. Vấn đề cụ thể

Cả 4 báo cáo (TM_01 đến TM_04) chỉ có duy nhất 1 dòng mô tả tên gọi mục đích, hoàn toàn không có bảng field/cột dữ liệu, không có filter, không có định dạng xuất - khác biệt hoàn toàn so với mức độ chi tiết đã áp dụng cho Whitelist hay Case Management. Comment [A304] "Chi tiết comment theo file đính kèm" gợi ý có 1 file bên ngoài chứa chi tiết nhưng file đó không nằm trong nội dung BRD đang phân tích.

#### 4. Ảnh hưởng nếu không giải quyết

- Không thể thiết kế bất kỳ TC nào cho toàn bộ tính năng Reporting (4 báo cáo) - hoàn toàn thiếu field/filter/layout để đối chiếu kỳ vọng.

#### 5. Đề xuất giải quyết

Yêu cầu MSB/FIS cung cấp file đính kèm chi tiết đã đề cập trong comment A304, hoặc bổ sung trực tiếp bảng field-spec cho từng báo cáo vào III.5.

#### 6. Liên kết với các phát hiện khác

Cùng nhóm thiếu phủ đặc tả với RR-018 (Scenario Management) và RR-028/RR-029 (Phụ lục trống).

#### 7. Câu hỏi cho người dùng

(a) File chi tiết đặc tả 4 báo cáo (được nhắc tới trong comment A304) có thể cung cấp để bổ sung vào phân tích này không?

#### 8. Owner

Business Authority (nghiệp vụ MSB) - vì cần xác nhận yêu cầu chi tiết từng báo cáo phục vụ mục đích quản lý/kiểm soát nào.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-031 [Trung bình] Bảo mật — Các trường free-text (Comment, Description, Email content, Reason Added...) không có ràng buộc nào về chống XSS/injection dù nội dung có thể được gửi ra ngoài qua email hoặc hiển thị lại cho nhiều người dùng khác xem

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 16 (Whitelist: Reason Added/Description/Comment), trang 21-22 (CM-6: Email content, Subject)
- Section: III.2, III.3.6
- Quote nguyên văn: "Reason Added | Nguyên nhân tạo mới đối tượng | String | O | 500 | Trường này được nhập free-text..."; "Email content Cho phép nhập free-text - nội dung về case muốn gửi email"

#### 2. Bối cảnh nghiệp vụ

Một Analyst nhập vào trường "Comment" của whitelist hoặc "Email content" của CM-6 một đoạn script HTML/JavaScript (ví dụ `<script>alert(1)</script>`) thay vì văn bản thông thường - có thể vô tình (paste nhầm từ nguồn khác) hoặc cố ý (thử nghiệm/tấn công). Nội dung "Email content" sau đó được gửi trực tiếp ra ngoài hệ thống (tới địa chỉ email tùy ý người dùng nhập ở trường "To"), còn "Comment" của whitelist/case có thể được nhiều Checker/AML Maker khác xem lại trên UI.

#### 3. Vấn đề cụ thể

Toàn bộ các trường free-text trong tài liệu (Whitelist: Reason Added/Description/Comment; CM-3.5/CM-3.7: Comment/Ghi chú; CM-6: Subject/Email content) chỉ mô tả kiểu dữ liệu (String) và độ dài tối đa, không có bất kỳ ràng buộc nào về việc sanitize/escape nội dung trước khi lưu hoặc hiển thị lại, cũng như không đề cập việc chặn ký tự đặc biệt nguy hiểm. Đây là rủi ro bảo mật kinh điển (Stored XSS nếu hiển thị lại trên UI không escape đúng cách, hoặc email injection nếu nội dung chèn được vào header email).

#### 4. Ảnh hưởng nếu không giải quyết

- Nếu 1 Comment chứa mã độc được lưu và hiển thị lại không qua escape trên màn hình Case Detail cho nhiều Checker/Supervisor xem, có thể dẫn tới thực thi script trái phép trong phiên làm việc của họ.
- Nội dung Email content không kiểm soát có thể bị lợi dụng để chèn thêm header email trái phép (nếu implementation không xử lý đúng), ảnh hưởng tới uy tín domain gửi email của MSB.

#### 5. Đề xuất giải quyết

Đề xuất theo best practice OWASP (chưa xác nhận với MSB, đây là khuyến nghị chung của ngành): áp dụng output encoding/escaping khi hiển thị lại mọi trường free-text trên UI, và validate/sanitize nội dung trước khi đưa vào email content để tránh injection.

#### 6. Liên kết với các phát hiện khác

Liên quan RR-032 (bảo mật dữ liệu nhạy cảm - cùng nhóm lăng kính Bảo mật).

#### 7. Câu hỏi cho người dùng

(a) Hệ thống OFSAA có cơ chế sẵn có (built-in) để chống XSS/injection cho các trường free-text hay cần đội triển khai bổ sung thêm lớp validate riêng cho module TM? (b) Có yêu cầu security testing riêng (penetration test) cho các trường nhập liệu tự do trước khi go-live không?

#### 8. Owner

Security Lead - vì đây là yêu cầu bảo mật kỹ thuật cần đánh giá bởi đội an ninh thông tin, không thuộc thẩm quyền nghiệp vụ thuần túy.

#### 9. Trạng thái

ĐANG MỞ

---

## RR-032 [Trung bình] Bảo mật — Case List/Search hiển thị số CCCD/giấy tờ tùy thân và thông tin định danh khách hàng nhạy cảm nhưng không có quy định về che/ẩn (masking) dữ liệu theo cấp độ phân quyền

#### 1. Trích dẫn nguồn

- File: [MSB_BRD_TM_v1.8_20260817.pdf](../../../requirements/MSB_BRD_TM_v1.8_20260817.pdf) - trang 19
- Section: III.3.2.1 (CM-2.2)
- Quote nguyên văn: "Identification number | Text box | Số giấy tờ tùy thân của khách hàng"; "Entity ID | Text box | ID khách hàng"

#### 2. Bối cảnh nghiệp vụ

Một DVKH Checker tìm kiếm case theo số CCCD của khách hàng để tra soát nhanh. Kết quả tìm kiếm hiển thị danh sách case kèm theo các trường định danh khách hàng (CIF, số CCCD, tên, có thể cả số điện thoại/email theo mô tả Event Details ở CM-3.2).

#### 3. Vấn đề cụ thể

Đây là hệ thống AML xử lý dữ liệu cực kỳ nhạy cảm của khách hàng (giao dịch tài chính, thông tin định danh cá nhân), nhưng toàn bộ mục III.3 (Case Management) không có bất kỳ điều khoản nào về việc che/ẩn một phần dữ liệu định danh (ví dụ chỉ hiển thị 3 số cuối CCCD, ẩn hoàn toàn với vai trò không cần xem đầy đủ) tùy theo cấp độ phân quyền của người xem - dù nhiều comment trong tài liệu (APTL205, APTL224, APTL236...) liên tục nhắc "Bổ sung yêu cầu phân quyền dữ liệu" và luôn được trả lời là sẽ nằm trong Phụ lục 2 (đã xác nhận trống ở RR-028).

#### 4. Ảnh hưởng nếu không giải quyết

- Rủi ro rò rỉ dữ liệu cá nhân nhạy cảm (PII) nếu người dùng có quyền tìm kiếm case nhưng không cần biết đầy đủ CCCD/thông tin định danh khách hàng (ví dụ 1 vai trò chỉ cần xem case để thống kê số lượng, không cần xem chi tiết khách hàng) vẫn nhìn thấy đầy đủ dữ liệu.
- Không thể viết TC verify masking vì hoàn toàn chưa có quy định để đối chiếu.

#### 5. Đề xuất giải quyết

Bổ sung vào Phụ lục 2 (Ma trận phân quyền - đã được flag trống ở RR-028) quy định rõ: vai trò nào được xem đầy đủ Identification number/thông tin định danh, vai trò nào chỉ xem dạng che một phần hoặc không xem được.

#### 6. Liên kết với các phát hiện khác

Liên quan trực tiếp RR-028 (Phụ lục 2 Ma trận phân quyền trống) - đây là 1 khía cạnh cụ thể (masking PII) cần được Phụ lục 2 giải quyết.

#### 7. Câu hỏi cho người dùng

(a) Có yêu cầu che/ẩn một phần thông tin định danh khách hàng (CCCD, số tài khoản) theo cấp độ phân quyền xem case không? (b) Nếu có, quy tắc che cụ thể là gì (ví dụ chỉ hiện 3-4 số cuối)?

#### 8. Owner

Security Lead phối hợp Business Authority - vì cần cân bằng giữa yêu cầu nghiệp vụ (đủ thông tin để điều tra) và yêu cầu bảo mật dữ liệu cá nhân.

#### 9. Trạng thái

ĐANG MỞ

---

> **Ghi chú rà soát lại (sau phản hồi người dùng):** Bản phân tích đầu tiên có 35 finding, trong đó 3 finding (List Code Whitelist, mô tả CRUD Whitelist, mẫu Ghi chú tiêu chuẩn CM-7) được trích chủ yếu từ thread comment mà FIS/MSB đã trả lời bằng ngôn ngữ xác nhận đã sửa ("FIS update", "Đã điều chỉnh") mà không còn bằng chứng mâu thuẫn nào trong thân văn bản hiện tại - tức là đã được đồng ý và cập nhật, không còn là gap mở. 3 finding này đã được loại bỏ khỏi danh sách. Một số finding khác (đánh dấu rõ trong phần "Trích dẫn nguồn"/"Vấn đề cụ thể" của từng mã) vẫn được giữ lại dù có thread "đã update", nhưng CHỈ khi nội dung đã update chỉ giải quyết một phần câu hỏi gốc và phần còn lại vẫn chưa được viết vào tài liệu (ví dụ RR-003 - giải pháp đã chốt chỉ bổ sung email cho group Checker, không cho group Maker) - những trường hợp này được ghi chú rõ là "phần dư sau khi đã có giải pháp", không phải "câu hỏi bị lờ đi".

### 7.3. Khuyến nghị

CẦN LÀM RÕ TRƯỚC - tài liệu hiện còn 7 finding ở mức `[Chặn]` đang mở: RR-002 (yêu cầu STR/EDD khi re-open), RR-018 (thiếu field-spec form kịch bản), RR-020 (ngưỡng khu vực rủi ro AML-01), RR-021 (công thức Điều kiện 1 AML-02), RR-022 (2 phương án tính Avg AML-03/04 chưa chốt), RR-028 (Phụ lục 1-2 trống), RR-029 (Phụ lục 6 màn hình/template STR trống). Đáng chú ý nhất là nhóm liên quan tới màn hình/template STR (RR-029) và Phụ lục phân quyền (RR-028) - dù comment review có nhắc "đã bổ sung", nội dung tương ứng không xuất hiện trong bản PDF đang phân tích - cùng với công thức định lượng của các kịch bản AML-01 đến AML-04 (RR-020, RR-021, RR-022) vẫn đang chờ MSB xác nhận. Các finding dựa trên thread comment đã có xác nhận "FIS update"/"Đã điều chỉnh" và không còn bằng chứng mâu thuẫn trong thân văn bản đã được loại khỏi danh sách này (xem ghi chú cuối mục 7.2).

### 7.4. Phân loại theo tác động

#### Nhóm TC (ảnh hưởng trực tiếp tới viết Test Case)

| Mã | Mức độ | Lý do thuộc nhóm TC |
|---|---|---|
| RR-001 | Cao | Không biết điều kiện enable/disable nút Xuất STR để viết TC |
| RR-004 | Cao | Số liệu mâu thuẫn (2 vs 3 trường Key) làm sai oracle kiểm tra trùng lặp |
| RR-005 | Trung bình | Không rõ Status/phê duyệt khi thêm lại bản ghi đã xóa |
| RR-009 | Cao | Thiếu enum đầy đủ Status để thiết kế TC filter |
| RR-011 | Cao | Không rõ hành vi kỳ vọng khi 2 user cùng mở 1 case |
| RR-015 | Cao | 3 bộ quy định file đính kèm khác nhau, không biết ngưỡng đúng để test boundary |
| RR-017 | Trung bình | Danh sách hành động cần audit chưa đầy đủ |
| RR-018 | Chặn | Không có field-spec cho form kịch bản để viết TC validation |
| RR-020 | Chặn | Thiếu danh sách/ngưỡng khu vực địa lý rủi ro để chuẩn bị test data AML-01 |
| RR-021 | Chặn | Công thức Điều kiện 1 của AML-02 không rõ nghĩa |
| RR-022 | Chặn | 2 phương án tính công thức Avg chưa chốt, ảnh hưởng trực tiếp oracle AML-03/04 |
| RR-023 | Thấp | Đánh số trùng gây khó trích dẫn khi viết TC ID |
| RR-024 | Trung bình | Không rõ nguồn/thời điểm tỷ giá quy đổi để chuẩn bị test data ngoại tệ |
| RR-028 | Chặn | Không có ma trận phân quyền để viết TC access-control |
| RR-029 | Chặn | Không có field-spec màn hình STR - chức năng lõi của hệ thống |
| RR-030 | Cao | Không có field/filter cho 4 báo cáo để viết TC |
| RR-031 | Trung bình | Không rõ ràng buộc validate để viết TC security cho input free-text |
| RR-032 | Trung bình | Không rõ quy tắc masking để viết TC verify hiển thị PII |

#### Nhóm UX (hành vi người dùng)

| Mã | Mức độ | Lý do thuộc nhóm UX |
|---|---|---|
| RR-003 | Cao | Maker nghỉ việc, người dùng khác không biết cách xử lý case bị treo |
| RR-007 | Trung bình | Người dùng cuối không rõ dropdown Type có cố định hay mở rộng |
| RR-008 | Trung bình | Người dùng có thể nhầm lẫn giữa dropdown tạo case và tìm kiếm |
| RR-010 | Thấp | Người dùng hiểu sai kết quả filter Age |
| RR-013 | Trung bình | Người dùng cuối hiểu sai bản chất chức năng "gửi email tư vấn" |
| RR-014 | Thấp | Người dùng không biết chính xác giá trị From hiển thị |
| RR-016 | Trung bình | Người dùng thấy field "Loại hồ sơ" nhưng không hoạt động thực tế |
| RR-019 | Trung bình | Người dùng không biết cách tạm ngưng 1 kịch bản đang chạy |
| RR-027 | Thấp | Maker case AML-manual không nhận được thông báo khi case re-open |

#### Nhóm Khác (compliance/vận hành/governance)

RR-002 (yêu cầu STR/EDD khi re-open - compliance lưu trữ hồ sơ), RR-006 (vận hành: đồng bộ whitelist pending với lịch batch), RR-012 (governance: rule điều phối case chưa văn bản hóa), RR-025 (compliance: nghĩa vụ nộp STR cho SBV), RR-026 (compliance: chênh lệch mức kiểm soát theo nguồn case).

## 8. Ma Trận Trạng Thái Case (tổng hợp từ 3 luồng nghiệp vụ)

| Trạng thái | Ý nghĩa | Luồng phát sinh |
|---|---|---|
| New | Case vừa được hệ thống tạo từ kịch bản HIT | II.1.1 bước 1 |
| Pending Checker Review | Chờ DVKH Checker rà soát kết quả xử lý cảnh báo | II.1.1/II.1.2.1 |
| Pending Maker | Yêu cầu Maker bổ sung thông tin | Mọi luồng, nhiều bước |
| Closed - No Further Action | Đóng case, đánh giá không đáng ngờ | II.1.1/II.1.2.1 bước Checker |
| Closed - Under Monitoring | Đóng case, cần giám sát thêm | II.1.1/II.1.2.1 bước Checker |
| Pending Generate STR | Chờ Maker tạo STR sau khi Checker đánh giá đáng ngờ | II.1.1/II.1.2.1 |
| Pending Checker Review STR | Chờ Checker rà soát STR vừa tạo | II.1.1/II.1.2.1 |
| Pending Supervisor Review | Chờ Checker N+1 rà soát STR | II.1.1/II.1.2.1 |
| Rejected sending STR | Bị từ chối ở cấp Checker hoặc Checker N+1, kết thúc luồng | II.1.1/II.1.2.1 |
| Pending AML Maker | Chờ AML Maker phân tích STR | II.1.1/II.1.2.1 |
| Pending AML Checker review | Chờ AML Checker phê duyệt | Mọi luồng |
| Closed - Not Send STR | AML Checker từ chối gửi STR, đóng case | Mọi luồng |
| Approved STR | AML Checker phê duyệt gửi STR, đóng case (xem RR-025 về ý nghĩa thực tế) | Mọi luồng |

Lưu ý: bảng này được tổng hợp thủ công từ nội dung rải rác trong tài liệu (xem RR-009) - cần MSB/FIS xác nhận đây đã là danh sách đầy đủ.

## 9. Tóm Tắt Acceptance Criteria (Checklist)

### Luồng nghiệp vụ
- [ ] Case tự động từ kịch bản HIT đi qua đủ 8 bước, 5 vai trò (II.1.1)
- [ ] Case thủ công DVKH đi qua 7 bước tương tự, bỏ bước cảnh báo hệ thống (II.1.2.1)
- [ ] Case thủ công AML đi qua 2 bước, 1 cấp phê duyệt AML Checker (II.1.2.2) - xem RR-026
- [ ] Re-open case theo đúng nguồn gốc case (II.1.3) - xem RR-002, RR-003, RR-027

### Quản lý kịch bản
- [ ] Tạo mới kịch bản với đủ trường thông tin chung + chi tiết (III.1.1) - thiếu field-spec, xem RR-018
- [ ] Cấu hình ngưỡng theo 3 mức rủi ro HR/MR/RR (III.1.2)
- [ ] Sửa kịch bản, không sửa được ID/trạng thái/loại (III.1.3) - xem RR-019

### Whitelist
- [ ] CRUD whitelist qua UI hoặc Excel (III.2)
- [ ] Kiểm tra trùng lặp theo 3 trường Key (xem RR-004)
- [ ] Luồng phê duyệt 2 cấp Analyst/Supervisor (xem RR-006)

### Quản lý Case
- [ ] Khởi tạo case tự động/thủ công (CM-1)
- [ ] Tìm kiếm case theo >15 tiêu chí (CM-2) - thiếu enum Status đầy đủ, xem RR-009
- [ ] Hiển thị danh sách/chi tiết case (CM-3)
- [ ] Điều phối phân công tự động (CM-4) - thiếu rule cụ thể, xem RR-012; race condition, xem RR-011
- [ ] Take Action đánh giá case (CM-5)
- [ ] Gửi email liên quan case (CM-6) - mâu thuẫn logic "tư vấn", xem RR-013
- [ ] Ghi chú, đính kèm tài liệu (CM-7)
- [ ] Audit Trail (CM-8) - thiếu danh sách hành động đầy đủ, xem RR-017

### 14 kịch bản AML-01 → AML-14
- [ ] Mỗi kịch bản có mô tả, phạm vi, điều kiện cảnh báo, điều kiện định lượng - một số kịch bản có công thức/ngưỡng chưa chốt (AML-01, AML-02, AML-03/04, xem RR-020/024/025)

### Báo cáo và Email
- [ ] 4 báo cáo nội bộ TM_01→04 (III.5) - thiếu field-spec, xem RR-030
- [ ] 9 mẫu email EM-1→9 (III.6) - nội dung nằm ở Phụ lục 5 ngoài tài liệu này

## 10. Khuyến Nghị Cho Kiểm Thử

1. Ưu tiên giải quyết 8 finding mức `[Chặn]` trước khi bắt đầu thiết kế test case chi tiết cho các khu vực tương ứng, đặc biệt là RR-029 (màn hình STR) vì đây là màn hình lõi xuất hiện ở hầu hết mọi luồng.
2. Với nhóm kịch bản AML-01 đến AML-04, cần có bộ dữ liệu tham chiếu bên ngoài (danh sách khu vực rủi ro, công thức Avg đã chốt phương án) trước khi chuẩn bị test data định lượng - nếu không, mọi TC "đúng ngưỡng HIT/không HIT" đều có nguy cơ sai oracle.
3. Thiết kế riêng 1 nhóm TC cho concurrency/race condition (RR-011, RR-006) vì đây là lớp lỗi khó phát hiện qua test thủ công tuần tự, nên cân nhắc kịch bản test với nhiều session song song.
4. Khi Phụ lục 2 (Ma trận phân quyền) được bổ sung, cần thiết kế riêng 1 bộ TC access-control đầy đủ theo từng vai trò (DVKH Maker/Checker, Checker N+1, AML Maker/Checker, Supervisor, Analyst) x từng chức năng (Case, Whitelist, Scenario, Report).
5. Đối chiếu lại toàn bộ 3 quy định file đính kèm không nhất quán (RR-015) trên UI thực tế trước khi viết TC boundary cho dung lượng/định dạng file.
6. Vì đây là hệ thống AML xử lý dữ liệu tài chính/định danh nhạy cảm, nên bổ sung riêng 1 pass kiểm thử bảo mật (RR-031, RR-032) sau khi có Ma trận phân quyền, thay vì chỉ kiểm thử chức năng thuần túy.
7. Với 15 trạng thái Case đã tổng hợp thủ công ở mục 8, nên yêu cầu MSB/FIS xác nhận lại đây là danh sách đầy đủ trước khi dùng làm cơ sở thiết kế TC cho CM-2 (tìm kiếm theo Status).
8. Toàn bộ câu hỏi ở cột "Câu hỏi cho người dùng" (mục 7.2) nên được tổng hợp thành 1 danh sách riêng gửi MSB xác nhận theo từng Owner tương ứng, vì nhiều câu hỏi đã "treo" từ các vòng review trước (v1.3-v1.8) mà chưa có câu trả lời cuối cùng ghi lại trong văn bản.
