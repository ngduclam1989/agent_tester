# MSB_BRD_TM_v1.8_20260817.pdf

> Chuyển đổi tự động từ `requirements/MSB_BRD_TM_v1.8_20260817.pdf` bằng `scripts/convert_doc/pdf_to_md.py`.
> Tổng 41 trang. Ngày chuyển đổi: 2026-08-27 14:52.
> Bản chuyển đổi giữ nguyên văn text layer và comment review, nhưng KHÔNG
> dựng lại cấu trúc bảng — với bảng phức tạp cần đối chiếu lại PDF gốc
> trước khi trích dẫn làm căn cứ viết test case.

---

## Trang 1

Mua sắm hệ thống công nghệ thông tin hỗ

trợ công tác phòng chống rửa tiền, chống
tài trợ khủng bố và tuân thủ cấm vận của

MSB

TÀI LIỆU YÊU CẦU NGHIỆP VỤ BRD
MODULE TRANSACTION MONITORING (TM) – GIÁM SÁT GIAO DỊCH

---

## Trang 2

KHÁI NIỆM VÀ CÁC TỪ NGỮ VIẾT TẮT

Khái niệm
Mô tả

MSB
Ngân hàng Thương Mại Cổ Phần Hàng Hải Việt Nam

OFSAA
Oracle Financial Services Analytical Applications – Hệ

thống Phân tích dịch vụ tài chính của Oracle

SBV (NHNN)
Ngân hàng Nhà nước

TM
Transaction monitoring – Giám sát giao dịch

AML
Anti-Money Laundering – Phòng chống rửa tiền

PCRT
Phòng chống rửa tiền

STR
Suspicious Transaction Report – Báo cáo giao dịch

đáng ngờ

RM
Chuyên viên quan hệ khách hàng

EDD
Quy trình thẩm định nâng cao

---

## Trang 3

I.
GIỚI THIỆU

1.
Mục đích và phạm vi tài liệu

Mục đích của tài liệu này là trình bày các yêu cầu nghiệp vụ của module Transaction Monitoring để

triển khai trên hệ thống OFSAA tại Ngân hàng thương mại cổ phần Hàng hải Việt Nam.

2.
Đối tượng người đọc

Tài liệu này hướng tới các đối tượng người đọc sau:

-
Trung tâm Công nghệ thông tin
-
Đội dự án triển khai hệ thống Phòng chống rửa tiền của MSB
-
Nhà thầu cung cấp, triển khai bản quyền phần mềm hệ thống AML mới.

II.
MÔ TẢ TỔNG QUAN

II.1.
Yêu cầu luồng nghiệp vụ

II.1.1. Luồng hành trình giám sát giao dịch đáng ngờ tự động

-
Lưu đồ mô tả luồng

-
Diễn giải lưu đồ

### Comment review — trang 3

- **[APTL(1]** Sao trên lưu đồ lại có 2 phân vùng hệ thống? Cập nhật các quy tắc ký hiệu của lưu đồ cho đúng. Start đâu?...
- **[A2R1]** FIS update

---

## Trang 4

Trạng thái sự

Người

vụ sau khi
hoàn thành

Bước
Mô tả

thực

Hành động

hiện

tác vụ

Cảnh báo phát sinh từ hệ thống

Hệ thống
OFSAA

N/A
New

Hệ thống tạo sự vụ và tự động gửi
email theo mẫu EM-1 tới group
email của Cán bộ quản lý KH
(DVKH Maker), chuyển bước 2

Đề xuất xử lý cảnh báo

DVKH
Maker

Recommend to Not
suspicious/
Recommend to
suspicious/
Recommend to Under
monitoring

Pending
Checker
Review

DVKH Maker thực hiện điền bộ
câu hỏi EDD, đề xuất xử lý cảnh
báo là “Đáng ngờ/ Không đáng
giờ/ Cần giám sát thêm”, hệ thống
tự động gửi email theo mẫu EM-2
tới DVKH Checker, chuyển tiếp
bước 3

Thông tin bộ câu hỏi chi tiết tham
chiếu <<IV.Phụ lục - Phụ lục 3. Bộ
câu hỏi EDD>>

Trong trường hợp DVKH Maker
nhận được yêu cầu bổ sung thông
tin từ bước 3, DVKH Maker thực
hiện bổ sung thông tin và trình
duyệt lên DVKH Checker, chuyển
tiếp bước 3

Maker Add
Information

Pending
Checker
Review

Rà soát kết quả xử lý cảnh báo

DVKH
Checker

Sau khi nhận được email, DVKH
Checker thực hiện rà soát và phê
duyệt kết quả xử lý cảnh báo

- Trường hợp 1: Phê duyệt đánh giá
sự vụ là “Không đáng ngờ”, hệ
thống tự động thực hiện gửi email
theo mẫu EM-4.1 đến DVKH
Maker và đóng sự vụ, kết thúc
luồng

Not suspicious
Closed - No
Further Action

- Trường hợp 2: Phê duyệt đánh giá
sự vụ là “Đáng ngờ”, hệ thống tự

Suspicious
Pending
Generate STR

### Comment review — trang 4

- **[APTL(5]** Cột này có ý nghĩa j?
- **[A6R5]** Thể hiện các action mà user có thể được thực hiên tương ứng với các bước nghiệp vụ phát sinh.
- **[APTL(3]** Đổi cột này sau cột Bước, trước cột Mô tả
- **[A4R3]** Xuất phát từ tình huống nghiệp vụ phát sinh, theo phân công thì tình huống đó sẽ do Ai thực hiện và thực hiện hành động gì, sau khi thực hiện xong case sẽ được update trạng thái mới .
- **[APTL(7]** Không thấy thể hiện trên lưu đồ
- **[A8R7]** FIS update
- **[HLV9]** MSB cung cấp template email
- **[TMP(P10R9]** Đã cung cấp
- **[PT11]** Nhận yêu cầu bổ sung thông tin từ bước nào?
- **[TMP(TP12R11]** Tại bước này
- **[A13R11]** Có được hiểu Maker nhận thông tin yêu cầu bổ sung từ bước 5 (checker), 6 (checker N+1),
- **[TMP(TP14]** Vẫn đẩy lên Checker, Checker là người quyết định đáng ngờ hay ko đáng ngờ → điều chỉnh lại luồng
- **[A15R14]** Trao đổi

---

## Trang 5

Trạng thái sự

Người

vụ sau khi
hoàn thành

Bước
Mô tả

thực

Hành động

hiện

tác vụ
động thực hiện gửi email theo mẫu
EM-3 đến DVKH Maker và
chuyển tiếp bước 4

- Trường hợp 3:  Phê duyệt đánh
giá sự vụ là “Cần giám sát thêm”,
hệ thống tự động thực hiện gửi
email theo mẫu EM-4.2 đến
DVKH Maker, đóng sự vụ và kết
thúc luồng.

Under monitoring
Closed - Under
Monitoring

- Trường hợp 4: Yêu cầu bổ sung
thông tin, hệ thống tự động thực
hiện gửi email theo mẫu EM-5 đến
DVKH Maker và quay lại bước 2

Return to Maker
Pending Maker

Tạo STR và đề xuất xử lý

DVKH
Maker

Create STR and Submit
to Checker

Pending
Checker
Review STR

Khi DVKH Maker nhận được
email từ DVKH Checker với thông
tin đánh giá cảnh báo là “Đáng
ngờ”, DVKH Maker sẽ thực hiện
tạo STR  sau đó trình duyệt lên
DVKH Checker, chuyển tiếp bước

Thông tin chi tiết về nhập màn
hình STR tham chiếu <<VI.Phụ
lục - Phụ lục 6.1. Màn hình STR>>

Trong trường hợp DVKH Maker
nhận được yêu cầu bổ sung thông
tin từ bước 5/6/7/8, DVKH Maker
thực hiện bổ sung thông tin và trình
duyệt lên DVKH Checker, chuyển
tiếp bước 5

Maker Add
Information

Pending
Checker
Review STR

Checker rà soát thông tin và phê
duyệt tạo STR, EDD

DVKH
Checker

Checker Approve STR
and EDD

Pending
Supervisor
Review

- Trường hợp 1: Phê duyệt, hệ
thống tự động gửi tới Checker N+1

### Comment review — trang 5

- **[APTL(5]** Cột này có ý nghĩa j?
- **[A6R5]** Thể hiện các action mà user có thể được thực hiên tương ứng với các bước nghiệp vụ phát sinh.
- **[APTL(3]** Đổi cột này sau cột Bước, trước cột Mô tả
- **[A4R3]** Xuất phát từ tình huống nghiệp vụ phát sinh, theo phân công thì tình huống đó sẽ do Ai thực hiện và thực hiện hành động gì, sau khi thực hiện xong case sẽ được update trạng thái mới .
- **[APTL(16]** Chưa hiểu viết kiểu chia ô này là j? ko rõ case j cả?
- **[A17R16]** Chia ô để thể hiện các hành động và trạng thái hành động tương ứng với từng nghiệp vụ
- **[HLV18]** +MSB cung cấp template email + Xem xét hệ thống có cần hỗ trợ gì khi cần giám sát thêm không (VD: mở lại case)
- **[TMP(TP19R18]** Cho phép re-open case , bổ sung chức năng whitelist
- **[A20R18]** Mô tả rõ tình huống nào sẽ re- open, re-open xong sẽ phân lại case như thế nào?
- **[TMP(TP21R18]** Maker, Checker có thể lựa chọn re-open nếu thấy quyết định đóng case trước đó chưa phù hơp hoặc cần bổ sung thêm tài liệu, thông tin đánh giá Case phân lại cho Maker tạo case ban đầu
- **[A22R18]** Khi re open sẽ quay lại từ maker (bước đầu tiên) Ảnh hưởng đến báo cáo nội bộ liên quan đến trạng thái của case. MSB NV: xem xét bổ sung thêm trạng thái lên báo cáo “có phải case re open không” Xuất STR: chỉ được xuất khi ở trạng thái close case with STR Nếu case thay đổi trạng thái sẽ ko xuất đc STR nữa ...
- **[A23]** MSB cung cấp thêm template của ...
- **[MPTH(-TP24R23]** EM-4.2
- **[A25R23]** Template cung cấp ở đâu?
- **[TMP(TP26R23]** MSB gửi template email ...
- **[TMP(TP27]** Với các file đính kèm (bảng ...
- **[TMP(P28]** Yêu cầu STR sẽ fill-in tự động
- **[A29R28]** Bổ sung Màn hình nhập STR
- **[A30]** Lưu ý: Việc điền STR và điền bảng ...
- **[TMP(TP31R30]** Đồng ý, tuy nhiên EDD ...
- **[A32R30]** Đã điều chỉnh. Tuy nhiên MSB ...
- **[TMP(TP33R30]** Đúng thế, khi phát sinh ...
- **[PT34]** Nhận yêu cầu bổ sung thông tin từ ...
- **[TMP(TP35R34]** Tại bước này
- **[A36R34]** Có được hiểu Maker nhận thông ...
- **[TMP(TP37]** Bổ sung thêm từ chối STR
- **[PT38R37]** Luồng tiếp theo sau khi từ chối ...
- **[TMP(TP39R37]** Kết thúc luồng, STR ko ...

---

## Trang 6

Trạng thái sự

Người

vụ sau khi
hoàn thành

Bước
Mô tả

thực

Hành động

hiện

tác vụ
thông báo email theo mẫu EM-6,
chuyển tiếp bước 6

- Trường hợp 2: Từ chối phê duyệt,
hệ thống tự động đóng sự vụ và kết
thúc luồng

Close and Reject STR
Rejected
sending STR

- Trường hợp 3: Yêu cầu bổ sung
thông tin, quay về bước 4

Return to Maker
Pending Maker

Checker N+1 rà soát thông tin và
phê duyệt STR

Checker
N+1

- Trường hợp 1: Phê duyệt, hệ
thống tự động gửi email theo mẫu
EM-7 đến AML Maker, chuyển
tiếp bước 7

Supervisor
Approve
STR and EDD

Pending AML
Maker

- Trường hợp 2: Từ chối phê duyệt
STR, hệ thống tự động đóng sự vụ
và kết thúc luồng

Close and Reject STR
Rejected
sending STR

- Trường hợp 3: Yêu cầu bổ sung
thông tin, quay về bước 4

Return to Maker
Pending Maker

AML Maker đánh giá và đề xuất
duyệt gửi STR

AML
Maker

Sau khi nhận được thông báo có
STR qua email, AML Maker truy
cập vào hệ thống để đánh giá và
thực hiện:

- Trường hợp 1: Đề xuất không gửi
STR, chuyển tiếp bước 8

Recommend Close and
Not Send STR

Pending AML
Checker
review

- Trường hợp 2: Đề xuất gửi STR,
chuyển tiếp bước 8

Recommend Close and
send STR

Pending AML
Checker
review

- Trường hợp 3: Yêu cầu bổ sung
thông tin, hệ thống thực hiện gửi

Return to Maker
Pending Maker

### Comment review — trang 6

- **[APTL(5]** Cột này có ý nghĩa j?
- **[A6R5]** Thể hiện các action mà user có thể được thực hiên tương ứng với các bước nghiệp vụ phát sinh.
- **[APTL(3]** Đổi cột này sau cột Bước, trước cột Mô tả
- **[A4R3]** Xuất phát từ tình huống nghiệp vụ phát sinh, theo phân công thì tình huống đó sẽ do Ai thực hiện và thực hiện hành động gì, sau khi thực hiện xong case sẽ được update trạng thái mới .
- **[APTL(40]** Xem lại mô tả
- **[A41R40]** FIS update
- **[A42]** Trao đổi lại với MSB muốn để trạng thái gì?
- **[APTL(43]** Checker đâu tự kết thúc luồng được, xem lại cách mô tả
- **[A44R43]** Theo yêu cầu nghiệp vụ, DVKH checker có thể kết thúc luồng tại bước 5
- **[APTL(45]** Xem lại toàn bộ phần chia dòng khi mô tả các bước
- **[A46R45]** Đã trả lời bên trên
- **[APTL(47]** Yêu cầu bổ sung thông tin, chứ có nhu cầu là như nào?
- **[A48R47]** FIS update
- **[TNT(TP49]** Phê duyệt đồng ý hoặc phê duyệt từ chối
- **[A50R49]** Sau khi từ chối có đóng case không?
- **[TMP(TP51R49]** Kết thúc luồng, STR ko đc đẩy lên AML
- **[APTL(56]** Xem lại cách viết của toàn bộ các đoạn kiểu này.
- **[A57R56]** Đã trả lời bên trên
- **[A58]** Trao đổi lại với MSB muốn để trạng thái gì?
- **[APTL(59]** Xem lại
- **[A60R59]** Chưa rõ câu hỏi
- **[APTL(61]** Xem lại chia ô người thực hiện
- **[A62R61]** Đã trả lời bên trên
- **[TMP(P63]** AML nhận thông báo có STR qua email

---

## Trang 7

Trạng thái sự

Người

vụ sau khi
hoàn thành

Bước
Mô tả

thực

Hành động

hiện

tác vụ
email theo mẫu EM-8 đến DVKH
Maker, quay về bước 4

AML Checker rà soát và phê
duyệt gửi STR

AML
Checker

- Trường hợp 1: Từ chối gửi STR,
hệ thống tự động đóng sự vụ và kết
thúc luồng

Closed and Not Send
STR

Closed - Not
Send STR

- Trường hợp 2: Phê duyệt gửi
STR, hệ thống tự động đóng sự vụ
và kết thúc luồng

Approve sending STR
Approved STR

- Trường hợp 3: Có nhu cầu bổ
sung thông tin, quay về bước 4

Return to Maker
Pending Maker

Note: Các mẫu email tham khảo III.6.  Chức năng Email thông báo tự động gắn với luồng nghiệp vụ

II.1.2. Luồng nghiệp vụ giao dịch đáng ngờ từ đơn vị nghiệp vụ tạo thủ công

-
Lưu đồ mô tả luồng

### Comment review — trang 7

- **[APTL(5]** Cột này có ý nghĩa j?
- **[A6R5]** Thể hiện các action mà user có thể được thực hiên tương ứng với các bước nghiệp vụ phát sinh.
- **[APTL(3]** Đổi cột này sau cột Bước, trước cột Mô tả
- **[A4R3]** Xuất phát từ tình huống nghiệp vụ phát sinh, theo phân công thì tình huống đó sẽ do Ai thực hiện và thực hiện hành động gì, sau khi thực hiện xong case sẽ được update trạng thái mới .
- **[APTL(65]** Comment như trên
- **[A66R65]** FIS update
- **[APTL(67]** Sao bước 7 mô tả là nhận được email thông báo có str, bước 8 checker ko nhận email à?
- **[A68R67]** Nghiệp vụ ko yêu cầu gửi Email từ AML maker đến AML checker
- **[HLV69]** Hệ thống sẽ không tự động gửi STR đến SBV, đây là thông tin để NSD theo dõi và phân loại case.
- **[TMP(TP70R69]** Đổi thành action: Approve sending STR Đổi trạng thái: Approved STR
- **[A71R69]** Đã điều chỉnh
- **[TMP(P72]** STR thủ công cũng có thể xuất phát từ team AML: AML tạo case thủ công → Đơn vị tiếp nhận và xử lý như miêu tả → Bổ sung thêm luồng tạo STR từ AML
- **[A73R72]** Nếu case thủ công tạo từ AML thì luồng sau đó sẽ như thế nào?
- **[TMP(TP74R72]** Thống nhất DVKH Maker và AML đều có thể tạo STR thủ công Nếu AML tạo thủ công thì vẫn có 2 cấp AML Maker và AML Checker xử lý, ko có DVKH tham gia
- **[A75R72]** Mô tả lại cụ thể các bước thực hiện khi luồng xuất phát từ AML maker
- **[APTL(76]** Comment như bên trên
- **[APTL(77]** Bước 2 của đvkd đâu? Xem lại cách đặt text chia case nhìn ko rõ ràng. Có khi bỏ luôn cái vùng hệ thống đi, vì chẳng có ý nghĩa j khi nhìn vào cả?
- **[A78R77]** FIS update

---

## Trang 8

-
Diễn giải lưu đồ chi tiết:

II.1.2.1. Trường hợp Đơn vị nghiệp vụ tạo sự vụ thủ công

Người

Trạng thái sự
vụ sau khi hoàn

Bước
Mô tả

thực

Hành động

hiện

thành tác vụ

- II.1.2.a – trường hợp đơn vị nghiệp vụ tạo sự vụ thủ công
- II.1.2.b – trường hợp AML tạo sự vụ thủ công

Đơn vị nghiệp vụ tạo sự vụ thủ
công:

DVKH
Maker

Create Case
Pending
Checker Review

DVKH Maker tạo sự vụ thủ công do
tự nhận diện và thực hiện điền bộ câu
hỏi EDD, hệ thống gửi email theo
mẫu EM-2 đến DVKH Checker,
chuyển bước 2

Thông tin bộ câu hỏi chi tiết tham
chiếu <<IV.Phụ lục - Phụ lục 3. Bộ
câu hỏi EDD>>

Trong trường hợp DVKH Maker nhận
được yêu cầu bổ sung thông tin từ
bước 2, DVKH Maker thực hiện bổ
sung thông tin và trình duyệt lên
DVKH Checker, chuyển tiếp bước 2

Maker
Add
Information

Pending
Checker Review

### Comment review — trang 8

- **[APTL(79]** Đọc cmt của luồng trước để update. Sau khi update lại sẽ cmt sau.
- **[A80R79]** FIS update
- **[TMP(TP81]** Đơn vị nghiệp vụ chứ nhỉ Chia thành 2 tình huống:
- **[A82R81]** FIS update
- **[HLV83]** MSB cung cấp template email
- **[TMP(P84R83]** Đã cung cấp
- **[A85R83]** Mới có template EM-2 cho cảnh báo giám sát giao dịch đáng ngờ tự động, đề nghị bổ sung
- **[MPTH(-TP86R83]** Dùng được EM-2: Email gửi từ Maker đến Group Checker để thông báo rà soát kết quả xử lý cảnh báo giao dịch là đáng ngờ/không ngờ/cần giám sát thêm
- **[APTL(87]** Chuyển bước 2 và gửi thông báo email là j? mô tả gửi email cho đúng chứ?
- **[A88R87]** FIS update

---

## Trang 9

Người

Trạng thái sự
vụ sau khi hoàn

Bước
Mô tả

thực

Hành động

hiện

thành tác vụ

Rà soát kết quả xử lý cảnh báo

DVKH
Checker

Sau khi nhận được email, DVKH
Checker thực hiện rà soát và phê
duyệt kết quả xử lý cảnh báo

- Trường hợp 1: Phê duyệt đánh giá sự
vụ là Không đáng ngờ, hệ thống tự
động gửi email theo mẫu EM-4.1 đến
DVKH Maker, đóng sự vụ và kết thúc
luồng

Not suspicious
Closed
-
No
Further Action

- Trường hợp 2: Phê duyệt đánh giá sự
vụ là Đáng ngờ, hệ thống tự động gửi
email theo mẫu EM-3 đến DVKH
Maker, chuyển tiếp bước 3

Suspicious
Pending
Generate STR

- Trường hợp 3: Phê duyệt đánh giá sự
vụ là Cần giám sát thêm, hệ thống tự
động gửi email theo mẫu EM-4.2  đến
DVKH Maker, đóng sự vụ và kết thúc
luồng

Under monitoring
Closed - Under
Monitoring

- Trường hợp 4: Yêu cầu bổ sung
thông tin, hệ thống tự động gửi email
theo mẫu EM-5 đến DVKH Maker,
quay lại bước 1

Return to Maker
Pending Maker

Tạo STR và đề xuất xử lý

DVKH
Maker

Create STR and
Submit
to
Checker

Pending
Checker Review
STR

DVKH Maker thực hiện tạo STR sau
đó trình duyệt lên DVKH Checker,
chuyển tiếp bước 4

Thông tin chi tiết về nhập màn hình
STR tham chiếu <<VI.Phụ lục - Phụ
lục 6.1. Màn hình STR>>

Trong trường hợp DVKH Maker nhận
được yêu cầu bổ sung thông tin từ
bước 4/5/6/7, DVKH Maker thực hiện
bổ sung thông tin và trình duyệt lên
DVKH Checker, chuyển tiếp bước 4

Maker Add
Information

Pending
Checker Review
STR

Checker rà soát thông tin và phê
duyệt tạo STR

DVKH
Checker

- Trường hợp 1: Phê duyệt tạo STR,
hệ thống tự động gửi email theo mẫu
EM-6 đến Checker N+1, chuyển tiếp
bước 6

Checker Approve
STR and EDD

Pending
Supervisor
Review

### Comment review — trang 9

- **[HLV89]** MSB cung cấp template email
- **[TMP(P90R89]** Đã cung cấp
- **[A91R89]** Có dùng chung temp EM4 được không?
- **[MPTH(-TP92R89]** Đã chỉnh sửa và bổ sung EM-4.1
- **[HLV93]** MSB cung cấp template email
- **[TMP(P94R93]** Đã cung cấp
- **[A95R93]** Có dùng chung temp EM3 được không?
- **[MPTH(-TP96R93]** Dùng EM-3
- **[HLV97]** MSB cung cấp template email
- **[MPTH(-TP98]** EM-4.2: Email thông báo đến Maker xử lý cảnh báo khi kết quả rà soát từ checker trả về là: Giao dịch cần giám sát thêm
- **[HLV99]** MSB cung cấp template email
- **[TMP(P100R99]** Đã cung cấp
- **[A101R99]** Có dùng chung temp EM4 được không?
- **[MPTH(-TP102R99]** Đã chỉnh sửa và bổ sung EM-4.1
- **[TMP(P103]** Yêu cầu STR sẽ fill-in tự động
- **[A104R103]** Yêu cầu đối với các thông tin trên báo cáo STR chi tiết MSB làm rõ các nội dung theo file đính kèm
- **[A105]** Lưu ý: Việc điền STR và điền bảng hỏi EDD là phụ thuộc vào người dùng chủ động làm hay không trước khi đi resolution, hệ thống ko validate được.
- **[TMP(TP106R105]** Tương tự cmt luồng trên

---

## Trang 10

Người

Trạng thái sự
vụ sau khi hoàn

Bước
Mô tả

thực

Hành động

hiện

thành tác vụ

- Trường hợp 2: Từ chối phê duyệt
STR, hệ thống đóng sự vụ và kết thúc
luồng

Close and Reject
STR

Rejected
sending STR

- Trường hợp 3: Yêu cầu bổ sung
thông tin, quay về bước 3

Return to Maker
Pending Maker

Checker N+1 rà soát và phê duyệt
STR

Checker
N+1

- Trường hợp 1: Phê duyệt, hệ thống
gửi thông báo email theo mẫu EM-7
đến AML Maker, chuyển tiếp bước 6

Supervisor
Approve STR and
EDD

Pending
AML
Maker

- Trường hợp 2: Từ chối phê duyệt
STR, hệ thống đóng sự vụ và kết thúc
luồng

Close and Reject
STR

Rejected
sending STR

- Trường hợp 3: Yêu cầu bổ sung
thông tin, quay về bước 3

Return to Maker
Pending Maker

AML Maker phân tích và đề xuất
duyệt gửi STR

Sau khi nhận được thông báo có STR
qua email, AML maker truy cập vào
hệ thống để phân tích và thực hiện:

- Trường hợp 1: Đề xuất không gửi
STR, chuyển tiếp bước 7

AML
Maker

Recommend
Close
and
Not
Send STR

Pending
AML
Checker review

- Trường hợp 2: Đề xuất gửi STR,
chuyển tiếp bước 7

Recommend
Close and send
STR

Pending
AML
Checker review

- Trường hợp 3: Yêu cầu bổ sung
thông tin, hệ thống gửi thông báo
email theo mẫu EM-8 đến DVKH
Maker, quay về bước 3

Return to Maker
Pending Maker

AML Checker rà soát và phê duyệt
gửi STR

AML
Checker

- Trường hợp 1: Từ chối gửi STR, hệ
thống đóng sự vụ và kết thúc luồng

Closed and Not
Send STR

Closed
-
Not
Send STR

- Trường hợp 2: Phê duyệt gửi STR,
hệ thống đóng sự vụ và kết thúc
luồng

Approve sending
STR

Approved STR

- Trường hợp 3: Yêu cầu bổ sung
thông tin, quay về bước 3

Return to Maker
Pending Maker

Note: Các mẫu email tham khảo III.6.  Chức năng Email thông báo tự động gắn với luồng nghiệp vụ

### Comment review — trang 10

- **[A107]** Trao đổi lại với MSB muốn để trạng thái gì?
- **[TNT(TP108]** Bổ sung phê duyệt từ chối STR
- **[A109R108]** Từ chối xong có đóng case không?, luồng cụ thể sau đó là gì
- **[TMP(TP110R108]** Dừng luồng
- **[HLV111]** MSB cung cấp template email
- **[TMP(TP112R111]** FIS bổ sung
- **[TMP(TP113R111]** EM-7
- **[A114]** Trao đổi lại với MSB muốn để trạng thái gì?
- **[TMP(TP117]** Sửa lại action + trạng thái tương tự như luồng trên: Approve sending STR + Approved STR
- **[PT118R117]** Đã bổ sung

---

## Trang 11

II.1.2.2. Trường hợp Bộ phận AML tạo sự vụ thủ công

Người

Trạng thái sự
vụ sau khi hoàn

Bước
Mô tả

thực

Hành động

hiện

thành tác vụ

1a
Bộ phận AML tạo sự vụ thủ công:

AML
Maker

Create Case
Pending
Generate STR

Cán bộ tạo sự vụ thủ công do tự nhận
diện, chuyển bước 1b

1b
Thực hiện tạo STR, chuyển bước 2

Create STR and
Submit
to
Checker

Pending
AML
Checker review

Thông tin chi tiết về nhập màn hình
STR tham chiếu <<VI.Phụ lục - Phụ
lục 6.1. Màn hình STR>>

AML Checker rà soát và phê duyệt
gửi STR

AML
Checker

- Trường hợp 1: Từ chối gửi STR, hệ
thống đóng sự vụ và kết thúc luồng

Closed and Not
Send STR

Closed
-
Not
Send STR

- Trường hợp 2: Phê duyệt gửi STR,
hệ thống đóng sự vụ và kết thúc
luồng

Approve sending
STR

Approved STR

- Trường hợp 3: Yêu cầu bổ sung
thông tin, quay về bước 1

Return to Maker
Pending
AML
Maker

II.1.3. Luồng thực hiện re-open case

-
Lưu đồ mô tả luồng

### Comment review — trang 11

- **[APTL(119]** Không thấy mô tả tính năng re- open này bên dưới
- **[A120R119]** Re-open là 1 action trong luồng, khi case thỏa mãn điều kiện ở trạng thái Close
- **[A121]** MSB mô tả rõ yêu cầu đối với báo cáo STR và EDD khi re-open case
- **[APTL(122]** Cmt tương tự 2 luồng trên. Re open case không phải là 1 action trong luồng à mà đặt ở hình bầu dục là ký hiệu của start thế kia?
- **[A123R122]** FIS đã update

---

## Trang 12

-
Diễn giải lưu đồ

Trạng thái sự

Người

vụ sau khi
hoàn thành

Bước
Mô tả

thực

Hành động

hiện

tác vụ

Khi có user thực hiện mở lại sự vụ
(re-open case) đã được đóng (Case ở
các trạng thái: Closed - No Further
Action/ Closed - Under Monitoring/
Closed - Not Send STR/ Approved
STR/ Rejected sending STR)

### Comment review — trang 12

- **[A124]** Mong muốn của nghiệp vụ: Khi re- open có email thông báo cho maker. Không giới hạn thời gian được re-open case -> MSB cung cấp temp email. Tương tự với luồng thủ công
- **[TMP(TP125R124]** Cung cấp cùng email phản hồi BRD v1.3 này

---

## Trang 13

Trạng thái sự

Người

vụ sau khi
hoàn thành

Bước
Mô tả

thực

Hành động

hiện

tác vụ

1a
Trường hợp Case ban đầu phát sinh
từ hệ thống/Case thủ công được tạo
bởi DVKH maker:

Maker/
Checker

Re-open
Pending Maker

Hệ thống chuyển trạng thái case và
tự động gửi email theo mẫu EM-9
tới DVKH maker ban đầu xử lý case
và group email của DVKH Checker,
chuyển bước 2

1b
Trường hợp Case thủ công được tạo
bởi AML maker:

AML
maker/

Re-open
Pending AML
Maker

Hệ thống chuyển trạng thái case,
chuyển bước 2

AML
checker

Đề xuất xử lý cảnh báo

2a
Trường hợp Case ban đầu phát sinh
từ hệ thống/Case thủ công được tạo
bởi DVKH maker

DVKH
Maker

Recommend to Not
suspicious/
Recommend to
suspicious/
Recommend to Under
monitoring

Pending
Checker
Review

Khi nhận được thông báo case do
DVKH Maker từng xử lý được re-
open DVKH Maker thực hiện xử lý
cảnh báo theo đúng luồng như ban
đầu.

DVKH Maker thực hiện điền lại bộ
câu hỏi EDD và/hoặc bổ sung thêm
thông tin/tài liệu.

Đề xuất xử lý cảnh báo là “Đáng
ngờ/ Không đáng giờ/ Cần giám sát
thêm” và gửi thông báo email EM-
2 tới
DVKH
Checker,
chuyển
tiếp bước 3

Thông tin bộ câu hỏi chi tiết tham
chiếu <<IV.Phụ lục - Phụ lục 3. Bộ
câu hỏi EDD>>

### Comment review — trang 13

- **[A126]** Có nhất thiết phải là user của DVKH maker ban đâu? Nếu fix thì trường hợp cán bộ đã nghỉ việc thì sao?
- **[A127R126]** Mong muốn của nghiệp vụ: Vẫn assign về user ban đầu, luồng mail thông báo cho cả checker, trong trường hợp đã nghỉ phép/nghỉ việc thì checker vào phân công để xử lý.
- **[A128R126]** Xử lý tương tự với luồng thủ công
- **[TMP(TP129R126]** Bổ sung thêm: assign về user ban đầu, luồng mail sẽ gửi cả cho group checker, tránh trường hợp checker trong luồng ban đầu cũng nghỉ
- **[A130R126]** Đã update
- **[TMP(TP131]** Bổ sung

---

## Trang 14

Trạng thái sự

Người

vụ sau khi
hoàn thành

Bước
Mô tả

thực

Hành động

hiện

tác vụ

2b
Trường hợp Case thủ công được tạo
bởi AML maker:

AML
maker

Create STR and Submit
to Checker

Pending AML
Checker
review

AML Maker thực hiện tạo STR và
bổ sung thêm thông tin/tài liệu,
chuyển bước 3

Các bước tiếp theo thực hiện tương
tự luồng giám sát giao dịch ở mục
II.1.1 và II.1.2, cụ thể:

- Trường hợp Case ban đầu phát sinh
từ hệ thống: thực hiện tương tự các
bước từ 3 -> 8 (mục II.1.1)

- Trường hợp Case ban đầu là Case
thủ công được tạo bởi DVKH
maker: thực hiện tương tự các bước
từ 3 -> 7 (mục II.1.2)
- Trường hợp Case ban đầu là Case
thủ công được tạo bởi AML maker:
thực hiện tương tự bước 2 (mục
II.1.2)

III.
YÊU CẦU CHI TIẾT CHỨC NĂNG

III.1. Quản lý kịch bản (Scenario Management)

Phân hệ cho phép người dùng định nghĩa và duy trì các kịch bản phát hiện hành vi dùng để phát
sinh cảnh báo AML, đồng thời cấu hình các tham số và ngưỡng điều khiển logic phát hiện của từng
kịch bản.

III.1.1. Tạo mới kịch bản

Hệ thống cho phép người dùng tạo mới kịch bản gồm các thông tin:

-
Thông tin chung: Mã kịch bản, Tên kịch bản, Loại kịch bản (theo chuỗi hành vi hoặc theo điều
kiện ràng buộc), Đối tượng giám sát, Mô tả và mục tiêu kịch bản.

-
Thông tin chi tiết: Cơ chế tạo cảnh báo, xác định dữ liệu mà kịch bản cần sử dụng để tính toán
và hiển thị thông tin, định nghĩa các quy tắc lọc loại trừ/bao gồm dữ liệu.

III.1.2. Cấu hình tham số/thông số kịch bản theo khẩu vị rủi ro

-
Mỗi kịch bản đều được gắn với ngưỡng giá trị cụ thể, cho phép định nghĩa tập các tham số
ngưỡng như: Giá trị tiền, số lượng giao dịch, phần trăm, tần suất, độ trễ, vùng địa lý;

### Comment review — trang 14

- **[TMP(TP132]** Bổ sung
- **[TMP(P133]** Rà soát với các yêu cầu của hồ sơ yêu cầu thầu tương tự như BRD KYC và TF
- **[A134R133]** Đã gửi thông tin phản hồi
- **[TMP(TP135]** Bổ sung chức năng whitelist
- **[PT136R135]** Không có chức năng OOTB, cần trao đổi để làm rõ yêu cầu
- **[TMP(TP137R135]** Whitelist sẽ đc add thủ công, ko xuất phát từ case
- **[A138R135]** Cần cung cấp temp cụ thể để add thủ công
- **[APTL(139]** Đây là brd, là yêu cầu của nghiệp vụ thì liên quan j đến công cụ nào??? Mô tả chi tiết phân tích dùng công cụ nào tại URD hoặc SRS
- **[A140R139]** Trao đổi trực tiếp
- **[A141R139]** FIS điều chỉnh

---

## Trang 15

-
Có thể cấu hình các mức rủi ro khác nhau như High Risk (HR), Medium Risk (MR), Regular
Risk (RR) với các giá trị tham số khác nhau;

-
Cấu hình vận hành: Thông tin chi tiết hiển thị trong cảnh báo, Tần suất chạy kịch bản, Khoảng
thời gian giám sát.

III.1.3. Chỉnh sửa kịch bản

-
Hệ thống cho phép chỉnh sửa: các giá trị ngưỡng, Tần suất chạy kịch bản, Khoảng thời gian
giám sát, ngưỡng rủi ro.

-
Không thể chỉnh sửa một số thông tin định danh: ID, Trạng thái hoạt động, Loại của kịch bản.
III.2. Whitelist

Danh sách trắng (Whitelist) được sử dụng để loại bỏ đối tượng ra khỏi phạm vi quét của một kịch bản
bất kì. Khi một đối tượng (Khách hàng/ tài khoản) nằm trong whitelist của một kịch bản, đối tượng
đó sẽ không bị quét bởi kịch bản và không tạo case.

Danh sách whitelist được quản trị theo kịch bản mà MSB sử dụng. Theo đó, mỗi whitelist sẽ tương
ứng với một kịch bản.

Danh sách whitelist gồm các trường thông tin như sau:

Bắt buộc

Tên trường

nhập
Mô tả trường
Loại dữ

(M)/Tùy
chọn (O)

Độ dài
Mô tả

liệu

List
Code
(*)

Mã whitelist
String
M

Là mã whitelist được sử dụng để nhận
biết đối tượng thuộc danh sách
whitelist nào trong các danh sách
whitelist đang tồn tại trong hệ thống.

Hệ thống sẽ tự sinh theo nguyên tắc:
Mã kịch bản + STT tự sinh

ID (*)
Mã perg của KH
String
M
Là mã định danh của Khách hàng, loại
thông tin ở trường này phụ thuộc
trường ID type. Ví dụ:

- ID type là Account, thông tin ID là
Số tài khoản,

- ID type là Customer, thông tin ID là
CIF khách hàng

ID Type (*)
Loại đối tượng
String
M
Trường phân loại của đối tượng. (gán
theo đối tượng giám sát của từng kịch
bản được loại trừ, ví dụ: Customer,
Account)

Application
scenario

Mã – tên kịch bản
String
M
Trường thông tin xác định ID sẽ được
loại ra khỏi phạm vi quét của kịch bản
nào (drop list theo danh sách mã kịch
bản)

### Comment review — trang 15

- **[APTL(142]** Cái này ở đâu trong kịch bản ấy nhỉ? Ko mô tả trong kịch bản
- **[A143R142]** Đây là tính năng nghiệp vụ yêu cầu xây sẵn, hiện chưa setup cho kịch bản cụ thể nào.
- **[APTL(144]** Thêm cột phân loại field/button
- **[A145R144]** Form này sẽ có thể thực hiện nhập thủ công trên màn hình/upload excel
- **[A146]** FIs update lại, thông tin trường này hệ thống sẽ tự sinh STT
- **[APTL(147]** Không hiểu
- **[A148R147]** FIS đã điều chỉnh
- **[APTL(149]** Không đúng ý nghĩa
- **[A150R149]** FIS đã điều chỉnh
- **[APTL(151]** Mô tả chưa rõ, là type thì luôn có sẵn list lựa chọn.
- **[A152R151]** FIS đã điều chỉnh

---

## Trang 16

Bắt buộc

Tên trường

nhập
Mô tả trường
Loại dữ

(M)/Tùy
chọn (O)

Độ dài
Mô tả

liệu

Status
Hiệu lực của danh sách
String
M

Trường thông tin thể hiện trạng thái
hiệu lực của đối tượng được loại trừ,
gồm 2 trạng thái:

Active: Đối tượng có hiệu lực và được
sử dụng để quét.

Deactivated: Đối tượng không có hiệu
lực và không được sử dụng để quét.

Reason
Added

Nguyên nhân tạo mới đối
tượng

String
O
Trường này được nhập free-text, dùng
để nhập thông tin nguyên nhân tạo
mới đối tượng.

Effective
date

Ngày hiệu lực
Date
Không cho

Trường ghi nhận ngày đối tượng được
tạo mới trong danh sách (Ngày mà cấp
supervisor phê duyệt cho việc tạo đối
tượng mới).

phép nhập

Trường thông tin này được hệ thống tự

sinh. Format: DD/MM/YYYY

Description
Mô tả đối tượng
String
O
Trường nhập free-text, dùng để mô tả
đối tượng

Comment
Ghi chú đối với đối tượng
String
O
Trường nhập free-text, dùng để ghi
chú thêm thông tin đối với đối tượng

Hệ thống hỗ trợ người dùng thực hiện quản trị các đối tượng whitelist theo luồng 2 cấp gồm người
thao tác (Analyst) và người phê duyệt (Supervisor). Cụ thể các thao tác người dùng có thể thực hiện
bao gồm:

Thao tác
Mô tả

Tạo mới
Tạo mới đối tượng trong whitelist

Sửa
Chỉnh sửa thông tin của đối tượng trong whitelist

Xóa
Xóa đối tượng trong whitelist

- Hệ thống tạo mới/ chỉnh sửa/xóa đối tượng trong whitelist trên màn hình hoặc bằng cách tải file

Excel (theo định dạng yêu cầu cụ thể của hệ thống) chứa thông tin các đối tượng để thêm vào danh
sách whitelist.

- Trong trường hợp chỉnh sửa dữ liệu whitelist, nếu bản ghi ở file Excel mới tải lên có thông tin các

trường Key không giống với các trường Key của các bản ghi đã tồn tại thì sẽ sinh bản ghi mới.
Ngược lại, sẽ cập nhật những trường thông tin còn lại theo bản ghi mới import.

- List code hệ thống tự sinh sẽ gắn duy nhất với một bản ghi. Trong trường hợp bản ghi đã bị xóa

nhưng sau được thêm lại vào danh sách whitelist thì vẫn gắn với List code hệ thống sinh lần đầu.

### Comment review — trang 16

- **[APTL(144]** Thêm cột phân loại field/button
- **[A145R144]** Form này sẽ có thể thực hiện nhập thủ công trên màn hình/upload excel
- **[APTL(153]** Trạng thái chứ? Mà thế này là trạng thái của từng ID chứ đâu phải của danh sách?
- **[A154R153]** FIS đã điều chỉnh
- **[APTL(155]** Sao lại dùng từ này
- **[A156R155]** Để thể hiện ID này đã không còn hoạt động, nghĩa là không còn được loại trừ khi quét thông tin khi chạy các kịch bản.
- **[APTL(157]** Sao lại mô tả thành ngày hiệu lực?
- **[A158R157]** FIS đã điều chỉnh
- **[APTL(159]** Cái này thừa à?
- **[A160R159]** FIS đã điều chỉnh
- **[APTL(161]** Chả thấy mô tả tạo mới như nào? Sửa thì được sửa những j? xóa ra sao???
- **[A162R161]** FIS update

---

## Trang 17

- Hệ thống thực hiện kiểm tra trùng lặp dựa vào các trường (trường Key) của đối tượng trong

Whitelist gồm 02 trường: ID, ID Type, Application scenario.

- Khi thực hiện tải dữ liệu đối tượng mới trong Whitelist, trong trường hợp upload file Excel bị lỗi,

hệ thống thông báo lỗi (khi không đủ thông tin các trường bắt buộc) và toàn bộ file sẽ không được
upload lên và sẽ yêu cầu upload lại file.

- Sau khi thực hiện upload dữ liệu hoặc xóa bản ghi trên màn hình, hệ thống chạy tổng hợp kết quả

theo tần suất MSB cập nhật và gửi kết quả cập nhật (thông báo qua email theo mẫu EM-10 ở <<
Phụ lục 5. MSB_Template Email TM >>) danh sách bao gồm các thông tin so sánh được sự thay
đổi giữa từng lần cập nhật: Số lượng bản ghi/đối tượng trước khi thay đổi; Số lượng bản ghi/đối
tượng sau khi thay đổi; Số lượng bản ghi thay đổi của danh sách mới so với danh sách cũ (thêm
mới (khi upload excel) /xóa (khi xóa bản ghi trên màn hình)).

Người dùng có thể thực hiện các thao tác trên theo 2 phương thức:

- Thao tác đơn lẻ với từng bản ghi
- Thao tác với nhiều bản ghi cùng lúc
- Việc tạo mới/ chỉnh sửa/xóa đối tượng trong whitelist thực hiện bởi người dùng được phân quyền

tại bất kì thời điểm nào trong ngày và cần được phê duyệt trước thời điểm chạy batch kịch bản
hàng ngày lần tiếp theo.
III.3. Quản lý Case (Case Management)

III.3.1. CM-1: Khởi tạo case

Mục đích tính năng: Hệ thống sẽ khởi tạo case cho phép người dùng điều tra các trường hợp cần điều
tra do HIT qua các kịch bản, hoặc người dùng có thể tạo thêm case để điều tra các đối tượng cần điều
tra bổ sung.

Case hiển thị có thể được khởi tạo theo 2 cách:

-
Khởi tạo bởi hệ thống sau khi chạy kịch bản;

-
Khởi tạo thủ công bởi người dùng

III.3.1.1. CM – 1.1: Case khởi tạo bởi hệ thống sau khi chạy kịch bản

-
Một khách hàng có hành vi giao dịch trùng khớp (HIT) với nguyên tắc và 1 bộ tham số của
một kịch bản gọi là 1 Event. Một khách hàng có thể HIT với nhiều kịch bản được thiết lập, tức là một
khách hàng có thể tạo ra nhiều Event trên hệ thống.

-
Hệ thống tự động tạo case theo cơ chế tổng hợp các Event của cùng 1 khách hàng sinh ra trong
cùng 01 ngày lại thành 01 Case.

III.3.1.2. CM – 1.2: Case khởi tạo thủ công bởi người dùng

Ngoài case được tạo từ việc chạy kịch bản theo yêu cầu, Hệ thống cho phép người dùng tạo case thủ
công. Cụ thể như sau:

-
Case ID được hệ thống sinh tự động: Chỉ các người dùng được phân quyền xử lý case của
nghiệp vụ TM mới có thể tạo case thủ công với nhóm case type của TM, trong đó case type của TM
là ‘AML’.

### Comment review — trang 17

- **[TMP(TP163]** Các key check trùng là các thông tin nào? → bổ sung cụ thể
- **[A164R163]** Trường Key gồm 3 trường là ID, ID Type và Application scenario. Ví dụ: kịch bản focus AC, key sẽ là Số tài khoản của KH +Account +mã kịch bản
- **[TMP(TP165]** Sẽ thông báo qua email tương tự như cơ chế thông báo kết quả upload các file Watchlist khác đúng ko?
- **[A166R165]** FIS update nội dung bên dưới
- **[A167]** MSB cung cấp temp email
- **[APTL(168]** Là sao?
- **[A169R168]** FIS update
- **[APTL(170]** Lủng củng
- **[A171R170]** FIS update
- **[APTL(172]** Ko thấy mô tả chạy batch như nào? Luồng ra sao?
- **[A173R172]** Trao đổi trực tiếp
- **[APTL(174]** Đây là giải thích của hệ thống, không phải viết đứng trên vai trò của người dùng yêu cầu. SỬA LẠI TOÀN BỘ PHẦN MÔ TẢ
- **[A175R174]** Trao đổi trực tiếp
- **[A176R174]** FIS update
- **[APTL(177]** Các đầu mục ko đánh dấu “:”
- **[A178R177]** FIS update
- **[APTL(179]** Bỏ đi. Chỉ mô tả đúng theo đầu mục đi
- **[A180R179]** FIS update

---

## Trang 18

-
Hệ thống cần cho phép người dùng nhập thông tin cơ bản của case bao gồm:

Tên trường
Mô tả trường
Bắt buộc (M)/Tùy chọn

(O)
Cách thức nhập

Type
Loại case
M
Chọn giá trị trong drop-down
list bao gồm các giá trị:

AML_MN

Title
Tên case
O
Trường free text

Jurisdiction
Chi nhánh (theo định
nghĩa là Oracle)

M
Default: All

Business domain
Khối/Phòng/Ban
M
Default: All

Priority
Thứ tự ưu tiên
O
Chọn giá trị trong drop-down
list (Bao gồm 3 giá trị:
High/Medium/Low)

Due
Ngày đến hạn case
O
Date (MM/DD/YYYY)

Owner
User owner của case
M
Chọn giá trị trong drop-down
list

Assignee
User được chỉ định xử
lý case

M
Chọn giá trị trong drop-down
list

Created By
User tạo case
M
Chọn giá trị trong drop-down
list

Description
Mô tả case
M
Trường free-text

-
Hệ thống hỗ trợ người dùng tìm kiếm/tạo thông tin của giao dịch để gán với case thủ công.
Thông tin giao dịch gồm: Transaction ID, Transaction type, Transaction base amount, Transaction
date, Party ID,…

III.3.2. CM-2: Tìm kiếm case

III.3.2.1. CM - 2.2: Tính năng tìm kiếm cảnh báo

Người dùng có thể thực hiện tìm kiếm các case phát sinh thông qua màn hình search theo các tiêu chí
sẵn có của hệ thống, ví dụ một số tiêu chí sau:

Trường
Định dạng
Mô tả

Case ID

Event ID

Created From, To Date picker
Khoảng ngày case được tạo

Age
Textbox
Tuổi của case

Lựa chọn: “<=”; “=” và “>=”

Sau đó nhập số ngày – khoảng thời gian cần tìm kiếm.

### Comment review — trang 18

- **[TNT(TP181]** Hệ thống hỗ trợ lọc các giao dịch theo các thông tin: số CIF, ngày, loại giao dịch, giá trị giao dịch… khi pick up các giao dịch để tạo case thủ công
- **[A182R181]** FIS update thông tin bên dưới
- **[APTL(183]** Chẳng ăn nhập với mô tả
- **[A184R183]** FIS update
- **[APTL(185]** Không phải mặc định à? Mai sau muốn thêm giá trị được ko?
- **[A186R185]** Chốt lại với nghiệm vụ type cho case thủ công chọn là gì? Chọn các giá trị có sẵn hay muốn tạo thêm?
- **[TMP(P187]** M
- **[A188R187]** Đây là màn hình OOTB của hệ thống, đề nghị giữ nguyên
- **[APTL(189]** Là j?
- **[A190R189]** FIS chỉnh sửa
- **[TMP(P191]** Giải thích cơ chế hệ thống phân thứ tự mức độ ưu tiên để đánh giá có cần M ko
- **[A192R191]** Đây là thông tin do người dùng chọn, không liên quan đến cơ chế của hệ thống
- **[APTL(193]** ?
- **[A194R193]** Chưa hiểu câu hỏi?
- **[APTL(195]** ?
- **[A196R195]** Chưa hiểu câu hỏi?
- **[APTL(197]** ?
- **[A198R197]** Chưa hiểu câu hỏi?
- **[APTL(203]** TÌM KIẾM NHƯ NÀO?
- **[A204R203]** Trao dổi trực tiếp
- **[APTL(205]** Bổ sung yêu cầu phân quyền dữ liệu
- **[A206R205]** FIS update file phân quyền
- **[APTL(207]** Không thấy mô tả kết quả tìm kiếm như nào?
- **[A208R207]** FIS bổ sung
- **[APTL(209]** Nhập
- **[A210R209]** FIS điều chỉnh
- **[APTL(211]** Là sao?
- **[A212R211]** Nghĩa là số ngày là khoảng thời gian cần tìm kiếm.

---

## Trang 19

Trường
Định dạng
Mô tả

Ví dụ: “<= 3”

Class
Droplist
Phân loại case

• AML

Type
Droplist
Lựa chọn trong drop-down list cho tiêu chí case thuộc
loại nào. Ví dụ:

• AML_MN (Case thủ công)
• AML_SURV (Case tự động)

Jurisdiction
Droplist
Mặc định: All

Business
Domain

Droplist
Mặc định: All

Status
Droplist
Lọc theo trạng thái của case – có thể lọc nhiều tiêu chí
cùng lúc

Creared by
Droplist

Entity type
Droplist

Entity ID
Text box
ID khách hàng

Entity Name
Text box
Tên khách hàng

Branch
Droplist
Chi nhánh

Assignee
Droplist
User đang xử lý case

Title
Text box
Điền tên case cần tìm

Hệ thống cho phép tìm kiếm theo ký tự con chứa trong 1
Title dài bằng cách thêm dấu “%”. Ví dụ, nếu người dùng
nhập ‘%AML%’, hệ thống sẽ tìm kiếm tất cả các case có
tên chứa ‘AML’ như AML123, AMLMSBBANK…

Scenario
Droplist
Lựa chọn trong drop-down list bao gồm danh sách các
kịch bản

Có thể chọn 1 hoặc nhiều kịch bản từ drop-down list

Description
Text box
Điền thông tin mô tả của case. Hệ thống cho phép tìm
kiếm theo ký tự đại diện bằng cách thêm dấu “%” (tương
tự trường ‘Title’)

Identification

Text box
Số giấy tờ tùy thân của khách hàng

number

Khi chọn Type: AML_MN, AML_SURV

Sau khi tìm kiếm sẽ hiển thị chi tiết các case theo kết quả tìm kiếm.

III.3.3. CM-3: Hiển thị thông tin case

### Comment review — trang 19

- **[APTL(213]** Sao lại ví dụ? list luôn ra chứ
- **[A214R213]** Fis update
- **[APTL(215]** Là sao?
- **[A216R215]** Là có thể lọc nhiều trạng thái của các case trong 1 lần tìm kiếm
- **[TMP(TP217]** ID gì? Theo CIF hay Giấy tờ pháp lý của KH?
- **[TMP(TP218R217]** Bổ sung thêm tìm kiếm theo số Giấy tờ pháp lý của KH (vd số CCCD, thẻ CC, ĐKKD…)
- **[A219R217]** FIS update
- **[A220R217]** Theo OOTB là tìm kiếm theo thông tin CIF KH.
- **[APTL(221]** Bên trên mô tả assignee là user/nhóm user. Bên dưới này chỉ hiển thị user thôi à?
- **[A222R221]** hiển thị cả người dùng cụ thể và nhóm người dùng

---

## Trang 20

Trên màn hình hiển thị chi tiết cảnh báo có một nút “MSB Guideline”  cho phép NSD xem một file
tài liệu Hướng dẫn xử lý AML đính kèm.

-
Nội dung file Hướng dẫn do MSB cung cấp

-
NSD có thể thay đổi file theo quy định của từng thời kì bằng cách upload lên server của hệ
thống

III.3.3.1. CM - 3.1: Yêu cầu màn hình thông tin tổng hợp case

-
Danh sách cảnh báo liệt kê các trường hợp case phát sinh tự động, case thủ công. Từ đó người
dùng truy cập có thể thực hiện các bước xử lý case theo luồng nghiệp vụ.

-
Hệ thống hiển thị tối thiểu bao gồm thông tin sau:

Trường
Mô tả

Case ID
Mã định danh duy nhất của case.

Loại Hyperlink điều hướng người dùng đến trang Case Summary
để xem thông tin chi tiết của case.

Title
Tên của case

Type
Loại case: gồm AML_MN, AML_SURV

Due Date
Thời hạn xử lý case.

Format: MM/DD/YYYY

Priority
Mức độ ưu tiên của case sau khi đã được tạo(Bao gồm 3 giá trị:
High/ Medium/Low)

Status
Trạng thái hiện tại của case (gồm các trạng thái được mô tả
trong luồng nghiệp vụ)

Owner
Tên người dùng hoặc nhóm người dùng sở hữu case

Assigned to
Tên người dùng hoặc nhóm người dùng được chỉ định xử lý case

Created
Thời gian case được tạo

Format: MM/DD/YYYY hh:mm:ss

Jurisdiction
Mặc định: All

Business Domain
Mặc định: All

III.3.3.2. CM - 3.2: Yêu cầu hiển thị thông tin chi tiết case

Trong màn hình Case List, khi người dùng click vào 1 Case ID, hệ thống hiển thị màn hình thể hiện
thông tin chi tiết case (Case Details). Thông tin chi tiết được hiển thị trên màn hình theo các nhóm
sau:

-
Thông tin tổng quan của case: Case ID, Title, Status, Priority

-
Thông tin chi tiết của Event: hiển thị danh sách các Event (HIT kịch bản). Thông tin chi tiết
được chia làm hai phần chính: Event List và Event Details.

### Comment review — trang 20

- **[A223]** FIS bổ sung
- **[APTL(224]** Bổ sung yêu cầu phân quyền dữ liệu
- **[A225R224]** Update ở file phân quyền
- **[APTL(226]** Danh mục loại case này gồm những j?
- **[A227R226]** FIS update
- **[APTL(228]** Quá hạn thì sao?
- **[A229R228]** Trao đổi thêm với nghiệp vụ
- **[TMP(TP230R228]** Hệ thống có thể gửi email remind đến group đang pending ko?
- **[A231R228]** Trên màn hình, hệ thống có hỗ trợ tìm kiếm các case quá hạn. OOTB hiện không có sẵn tính năng gửi email đến remind đến group user khi phát sinh case quá hạn.
- **[APTL(232]** Gồm các mức nào?
- **[A233R232]** FIS update
- **[APTL(234]** Gồm những trạng thái nào?
- **[A235R234]** FIS updte
- **[APTL(236]** Nhóm người dùng này định nghĩa ở đâu? Thông tin này lấy từ đâu?
- **[A237R236]** Trao đổi
- **[APTL(238]** Hỏi tương tự
- **[A239R238]** Trao đổi
- **[APTL(240]** Mục đích là j?
- **[A241R240]** Phân quyền dữ liệu của hệ thống
- **[APTL(242]** Mục đích?
- **[A243R242]** Phân quyền dữ liệu của hệ thống
- **[APTL(244]** Màn hình này ở đâu?
- **[A245R244]** Trao đổi trực tiếp
- **[TMP(P246]** FIS giúp kiểm tra lại phần này. Vì sao danh sách các case lại được hiển thị trong phần thông tin Event
- **[A247R246]** FIS update

---

## Trang 21

+
Event list hiển thị tối thiểu bao gồm các trường thông tin: Event ID, Loại đối tượng, Mã khách
hàng, tên đối tượng trong event, tên kịch bản, ngày tạo event, Highlight của event (được set
up theo kịch bản), Ngày event được promote, Trạng thái của event.

+
Event Details: Hiển thị các thông tin chi tiết liên quan đến các event bị HIT trong case.

-
Thông tin chi tiết của tài khoản bao gồm: Số tài khoản, tên tài khoản, status, loại chủ sở hữu

-
Thông tin chi tiết của khách hàng: Loại khách hàng, tên khách hàng, Số GTTT/ĐKKD, mã
khách hàng (CIF), địa chỉ, số điện thoại, email, số tài khoản, điểm rủi ro của khách hàng.

-
Thông tin chi tiết các giao dịch: Ngày giao dịch, loại giao dịch, số tiền giao dịch, Đơn vị tiền
tệ, thông tin của bên đối ứng,…

III.3.4. CM-4: Điều phối và phân công xử lý case

-
Khi hệ thống phát sinh sự vụ (case), case sẽ được tự động phân công cho nhóm user gán quyền
case type của TM. User đầu tiên trong nhóm thực hiện mở case sẽ được gán làm người xử lý của case
đó.

-
Khi user thực hiện tạo case thủ công, trường thông tin Assign sẽ được gán cho user tạo case.

-
Các user thuộc cùng một nhóm quyền sẽ được thực hiện thao tác giống nhau.

III.3.5. CM-5: Đánh giá và xử lý case

-
Để thực hiện đánh giá, người dùng lựa chọn nút chức năng “Take Action” trên màn hình Case
ECM.

-
Hệ thống cần yêu cầu người dùng nhập Comment trước khi hoàn thành “Take Action”.

-
Hệ thống cho phép người dùng đính kèm file không giới hạn trong quá trình đánh giá tổng thể
cảnh báo với những File có dung lượng không quá 9 MB và các định dạng attach file gồm word,
excel, text, PDF.

III.3.6. CM-6: Gửi email/ thông báo liên quan đến case thủ công (Send Email/RFI)

-
Hệ thống cho phép người dùng thực hiện gửi email để tư vấn xử lý case

-
Với tính năng gửi email, hệ thống cho phép gửi email chỉ theo 1 chiều đi và không có chiều
nhận phản hồi về

-
Khi người dùng chọn tính năng này, hệ thống cần yêu cầu người dùng nhập thông tin cho các
trường sau:

Tên trường
Nội dung

From
Mặc định hiển thị 1 email gửi đối với tất cả các case.

To
Nhập free-text email người nhận (cho phép người dùng có thể giới hạn
domain trong trường hợp có nhu cầu)

Hệ thống cho phép gửi email tới nhiều người nhận, mỗi email được phân
cách bằng dấu phẩy “,” và không có dấu cách.

### Comment review — trang 21

- **[APTL(248]** Đánh dấu này lùi vào
- **[TNT(TP249]** FIS giúp làm rõ tiêu chí này
- **[A250R249]** Đây là thông tin ngày event được đưa lên case để bắt đầu quá trình điều tra
- **[TNT(TP251]** + Mã Khách hàng (CIF), mức độ rủi ro
- **[A252R251]** FIS update
- **[TNT(TP253]** + Kênh giao dịch, các bên liên quan trong giao dịch, Đơn vị tiền tệ
- **[A254R253]** FIS update
- **[HLV255]** MSB đưa ra rule điều phối case cho từng luồng
- **[APTL(256]** Cái này khai báo và quản lý ở đâu nhỉ? Chưa rõ rule điều phối case?
- **[A257R256]** Trao đổi trực tiếp
- **[APTL(258]** Sao lại mô tả cái này vào đây nhỉ? ở phần điều phối này có thấy user cần thao tác j đâu?
- **[A259R258]** Trao đổi
- **[APTL(260]** Chưa thấy mô tả đánh giá như nào?
- **[A261R260]** Trao đổi trực tiếp
- **[TMP(P262]** Bổ sung
- **[APTL(263]** Tính năng này có ở màn hình nào? Ai được sử dụng tính năng này?
- **[A264R263]** Ở trong màn hình case chi tiết. Trao đổi chi tiết
- **[APTL(265]** Không thấy mô tả tính năng gửi email tự động yêu cầu xử lý case nhỉ?
- **[A266R265]** Tính năng gửi email tự động được sửu dụng trong quá trình thực hiện luồng (tham khảo mục II.1)
- **[APTL(267]** Thế thì nhận tư vấn kiểu j nhỉ?
- **[A268R267]** Hệ thống sẽ không hỗ trợ nhận mail phản hồi. Chưa hiểu ý “nhận tự vấn” gì? Ai nhận tư vấn?
- **[APTL(269]** Email chung của AML à?
- **[A270R269]** Cụ thể dùng email nào có thể cài đặt được
- **[APTL(271]** Mô tả lại câu này cho rõ đi
- **[A272R271]** FIS update

---

## Trang 22

Tên trường
Nội dung

Cc
Nhập email người nhận gián tiếp.

Subject
Cho phép nhập free-text Tiêu đề liên quan đến case

Attach
Cho phép đính kèm file Word, Excel, pdf, hình ảnh hoặc audio

Include Case Details
Hệ thống cho phép gửi kèm chi tiết case

Email content
Cho phép nhập free-text - nội dung về case muốn gửi email

-
Nội dung email đã gửi sẽ được lưu lại trên hệ thống OFSAA

III.3.7. CM-7: Ghi chú, bình luận và đính kèm tài liệu

-
Mục đích tính năng: Trong trường hợp phát sinh nhu cầu đính kèm giấy tờ hoặc hồ sơ cho
một hoặc nhiều case, người dùng có thể lựa chọn thêm Ghi chú, bình luận và đính kèm file (Số lượng
file ko có giới hạn, phụ thuộc vào hạ tầng cung cấp; dung lượng 1 file tối đa có thể điều chỉnh, hiện
hệ thống đang setup 10MB hoặc theo nhu cầu điều chỉnh của MSB từng thời kỳ).

-
Hệ thống cần có tối thiểu các trường thông tin: Loại hồ sơ/giấy tờ, Ghi chú tiêu chuẩn (theo
mẫu có sẵn), Ghi chú/bình luận nhập thủ công, Ghi chú/bình luận đính kèm cùng file.

III.3.8. CM-8: Lưu vết kiểm toán (Audit Trail)

-
Mục đích tính năng: Cho phép người dùng xem lịch sử các hành động đã thực hiện lên case.

-
Hệ thống cần có tối thiểu các trường thông tin: Tên người dùng, Thời gian thực hiện (ngày,
giờ), Hành động đối với case, Người tạo case, Người xử lý hiện tại, Trạng thái của case, Comment,
Thời hạn xử lý case.

III.4. Danh sách kịch bản giám sát

Các kịch bản sử dụng cho nghiệp vụ TM sẽ được trình bày bao gồm các nội dung chính:

-
Tên kịch bản

-
Mô tả và Mục tiêu kịch bản

-
Phạm vi kịch bản:

•
Chiều giám sát

•
Phạm vi khách hàng

•
Loại tài khoản

•
Loại giao dịch giám sát

-
Điều kiện cảnh báo

•
Thời gian thực hiện cảnh báo:

o
Tần suất chạy kịch bản

o
Khoảng thời gian giám sát

### Comment review — trang 22

- **[TMP(TP273]** Check lại có cc đc ko
- **[A274R273]** FIS điều chỉnh nội dung này và điều chỉnh temp email tương ứng
- **[A275R273]** FIS check lại, đây là tính năng gửi mail thủ công trên màn hình case, có thể cc được. Luồng email tự động gắn với take action của case thì sẽ không thực hiện cc dược.
- **[APTL(276]** Cho phép đính kèm file …
- **[A277R276]** Fis update
- **[APTL(278]** Bỏ
- **[A279R278]** Fis update
- **[APTL(280]** Chi tiết ở đây là j?
- **[A281R280]** Ghi tiết theo case context, ví dụ: Case ID, case type, status, priority, created, Description
- **[APTL(282]** Ghi chú ở đâu? Lúc nào?
- **[A283R282]** Trên màn hình case summary, khi có nhu cầu ghi chú, bình luận
- **[TMP(TP284]** Đc attach tối đa bao nhiêu file? Mỗi file max dung lượng bao nhiêu?
- **[A285R284]** Đã bổ sung
- **[TMP(TP286]** Bổ sung
- **[APTL(287]** Đây không phải là mô tả yêu cầu trong brd, ko đứng trên vai trò người dùng yêu cầu.
- **[A288R287]** Trao đổi trực tiếp với nghiệp vụ
- **[APTL(289]** Có danh mục chưa?
- **[A290R289]** Không có trường lưu kiểu doc type
- **[APTL(291]** Mẫu đâu?
- **[A292R291]** Cá c ghi chú tiê ú chúá n đượ c qúy đi nh vá lưú trư trong DB, co thê tú y chỉ nh linh hoá t
- **[APTL(293]** Bình luận là phản hồi qua lại như trả lời comment à?
- **[A294R293]** Không phải là hình thức phản hồi qua lại mà hoạt động theo nguyên tắc: - Bản ghi độc lập trong Audit history - Gắn liền với hành động nghiệp vụ - Không thay đổi trạng thái hồ sơ
- **[APTL(295]** Chả hiểu?
- **[A296R295]** Nghĩa là tính năng Ghi chú/bình luận có thể nhập freetext và/hoặc đính kèm file
- **[APTL(297]** Tất cả hành động gồm view case nữa à?
- **[A298R297]** Bao gồm cả view case
- **[APTL(299]** Tối thiểu này chưa đủ, chưa biết hành động trên case nào?
- **[A300R299]** Có thông tin “Hành động đối với case”

---

## Trang 23

•
Các điều kiện của kịch bản

Nội dung chi tiết của từng kịch bản như sau:

III.4.1. AML-01: Giao dịch có rủi ro cao: Khu vực địa lý có rủi ro cao

Mục
Nội dung

Mô tả và Mục tiêu kịch
bản

Xác định các khách hàng thực hiện các giao dịch thông qua Tài khoản
thanh toán liên quan đến các khu vực địa lý được xác định có mức độ
rủi ro cao theo chính sách PCRT từng thời kỳ

Phạm vi kịch bản

Chiều giám sát
Khách hàng

Phạm vi khách hàng
Khách hàng cá nhân, Khách hàng tổ chức.

Loại tài khoản
Tài khoản thanh toán

Loại giao dịch giám sát
Bao gồm các giao dịch được ghi nhận trên Tài khoản thanh toán. Loại
trừ:

• Giao dịch trả lãi/phí

• Giao dịch bị hủy

Điều kiện cảnh báo

Thời gian thực hiện cảnh báo

Tần suất chạy kịch bản
7 ngày

Khoảng thời gian giám
sát

14 ngày (từ ngày T-14 đến T-1)

Các điều kiện của kịch bản

Điều kiện 1: Tổng giá trị giao dịch (ghi Nợ và ghi Có) với khu vực địa lý có rủi ro cao trong chu
kỳ ≥ 1 tỷ VND (giá trị quy đổi) VÀ

• Trường hợp 1:

o Điều kiện 2: Tổng số lượng giao dịch (ghi Nợ và ghi Có) với khu vực địa lý có rủi ro rất

cao ≥ 1 giao dịch VÀ

---

## Trang 24

Mục
Nội dung

o Điều kiện 3: Tổng giá trị giao dịch (ghi Nợ và ghi Có) với khu vực địa lý có rủi ro rất cao

≥ 1 tỷ VND (giá trị quy đổi)

• Trường hợp 2:

o Điều kiện 2: Tổng số lượng giao dịch (ghi Nợ và ghi Có) với khu vực địa lý có rủi ro cao

≥ 3 giao dịch VÀ

o Điều kiện 3: Tổng giá trị giao dịch (ghi Nợ và ghi Có) với khu vực địa lý có rủi ro cao ≥

2,5 tỷ VND quy đổi

• Trường hợp 3:

o Điều kiện 2: Tổng số lượng giao dịch (ghi Nợ và ghi Có) với khu vực địa lý có rủi ro cao

≥ 2 giao dịch VÀ

o Điều kiện 3: Tổng giá trị giao dịch (ghi Nợ và ghi Có) với khu vực địa lý có rủi ro cao ≥

1,5 tỷ VND quy đổi VÀ

o Điều kiện 4: Tỷ lệ tổng giá trị giao dịch (ghi Nợ và ghi Có) HRG/ Tổng giá trị tất cả các

giao dịch (ghi Nợ và ghi Có) ≥ 50%

* MSB cung cấp thông tin danh sách khu vực địa lý có rủi ro cao

III.4.2. AML-02: Giao dịch có rủi ro cao: Đối tượng có rủi ro cao trọng tâm

Mục
Nội dung

Mô tả và Mục tiêu kịch
bản

Giám sát Khách hàng có rủi ro cao thực hiện một số loại giao dịch
trong một khoảng thời gian nhất định theo các điều kiện của kịch bản.

Phạm vi kịch bản

Chiều giám sát
Khách hàng

Phạm vi khách hàng
Khách hàng cá nhân, Khách hàng tổ chức.

Loại tài khoản
Tài khoản thanh toán

Loại giao dịch giám sát
Bao gồm các giao dịch được ghi nhận trên Tài khoản thanh toán. Loại
trừ:

• Giao dịch trả lãi/phí

• Giao dịch bị hủy

### Comment review — trang 24

- **[A301]** MSB cung cấp danh sách khu vực địa lý có rủi ro cao, lưu ý, điểm quy ước cho danh sách này theo thang điểm 10

---

## Trang 25

Mục
Nội dung

Điều kiện cảnh báo

Thời gian thực hiện cảnh báo

Tần suất chạy kịch bản
7 ngày

Khoảng thời gian giám
sát

14 ngày (từ ngày T-14 đến T-1)

Các điều kiện của kịch bản

Điều kiện 1: Ngưỡng rủi ro thực tế của Khách hàng thực hiện các giao dịch ≥ Ngưỡng rủi ro hiệu
quả (Effctv Risk Lvl) VÀ

Điều kiện 2: Tổng giá trị giao dịch ghi Nợ và ghi Có ≥ KHCN: 2 tỷ, KHTC: 5 tỷ VND (giá trị quy
đổi) VÀ

Điều kiện 3: Tổng số giao dịch ghi Nợ và ghi Có ≥ 15 giao dịch VÀ

*Ngưỡng rủi ro hiệu quả (Effctv Risk Lvl) được quy đổi từ điểm rủi ro của Khách hàng tại phân
hệ KYC theo nguyên tắc: KH có điểm rủi ro > 70 (ví dụ 70,01) khi chuyển sang phân hệ TM sẽ quy
đổi thành 10 điểm, KH có điểm rủi ro ≤ 70,00 điểm khi chuyển sang phân hệ TM sẽ quy đổi thành
0 điểm.

III.4.3. AML-03: Thay đổi đáng kể so với hoạt động trung bình trước đó

Mục
Nội dung

Mô tả và Mục tiêu kịch
bản

Hệ thống phát hiện các trường hợp hoạt động của khách hàng trong
tháng hiện tại tăng đáng kể so với mức hoạt động trung bình của các
tháng trước đó. Việc đánh giá được thực hiện dựa trên hồ sơ hành vi,
được xây dựng từ dữ liệu hoạt động lịch sử trong một khoảng thời gian
xác định trong quá khứ.

Phạm vi kịch bản

Chiều giám sát
Khách hàng

Phạm vi khách hàng
Khách hàng cá nhân, Khách hàng tổ chức

Loại tài khoản
Tài khoản thanh toán

### Comment review — trang 25

- **[A302]** Cần MSB confirm nguyên tắc này

---

## Trang 26

Mục
Nội dung

Loại giao dịch giám sát
Bao gồm các giao dịch được ghi nhận trên Tài khoản thanh toán. Loại
trừ:

• Giao dịch trả lãi/phí

• Giao dịch bị hủy

Điều kiện cảnh báo

Thời gian thực hiện cảnh báo

Tần suất chạy kịch bản
01 tháng – Không bao gồm tháng hiện tại (Tháng T). Chạy ngày đầu
tiên của tháng

Khoảng thời gian giám
sát

06 tháng (Từ tháng T-7 đến tháng T-2)

Các điều kiện của kịch bản

• Giám sát theo chiều giao dịch ghi Nợ

o Điều kiện 1: Khách hàng có Tài khoản thanh toán thỏa mãn điều kiện: (Ngày cuối cùng

của tháng (T-1) – Ngày mở tài khoản) ≥ 180 ngày VÀ

o Điều kiện 2: (SD x kmin) ≤ (A – Avg(Bi)) VÀ

Trong đó:

- Tổng giá trị giao dịch ghi Nợ tháng (T-1) của tất cả Tài khoản thanh toán của Khách hàng =

A

- Tổng giá trị giao dịch ghi Nợ từng tháng của các tháng thứ i trong kỳ giám sát của tất cả

Tài khoản thanh toán của Khách hàng = Bi

- SD là Độ lệch chuẩn

- kmin = 1,5

o Điều kiện 3: A ≥ KHCN: 5 tỷ VND (quy đổi), KHTC: 1 tỷ VND (quy đổi) VÀ

o Điều kiện 4: (A – Avg(Bi))/Avg(Bi) ≥ 200%

• Giám sát theo chiều giao dịch ghi Có

o Điều kiện 1: (Ngày cuối cùng của tháng (T-1) – Ngày mở tài khoản) ≥ 180 ngày VÀ

o Điều kiện 2: (SD x kmin) ≤ (C – Avg(Di)) VÀ

### Comment review — trang 26

- **[A303]** MSB confirm: việc tính So tiê n giáo di ch trúng bỉ nh cá c thá ng trong thợ i gián lookbáck sê tỉ nh thêo cá ch ná o? PA1: So thá ng qúy đi nh trong thợ i gián lookbáck PA2: So thá ng thư c tê co giáo di ch phá t sinh

---

## Trang 27

Mục
Nội dung

- Tổng giá trị giao dịch ghi Có tháng (T-1) của tất cả Tài khoản thanh toán của Khách
hàng = C

- Tổng giá trị giao dịch ghi Có từng tháng của các tháng trong kỳ giám sát của tất cả Tài
khoản thanh toán của KH = Di

- SD là Độ lệch chuẩn

- kmin = 1,5

o Điều kiện 3: C ≥ KHCN: 5 tỷ VND (quy đổi), KHTC: 1 tỷ VND (quy đổi) VÀ

o Điều kiện 4: (C – Avg(Di))/Avg(Di) ≥ 200%

III.4.4. AML-04: Thay đổi đáng kể so với hoạt động đạt mức cao nhất trước đó

Mục
Nội dung

Mô tả và Mục tiêu kịch
bản

Hệ thống phát hiện các trường hợp hoạt động của khách hàng trong
tháng hiện tại tăng đáng kể so với mức hoạt động cao nhất của các
tháng trước đó. Việc đánh giá được thực hiện dựa trên hồ sơ hành vi,
được xây dựng từ dữ liệu hoạt động lịch sử trong một khoảng thời gian
xác định trong quá khứ.

Phạm vi kịch bản

Chiều giám sát
Khách hàng

Phạm vi khách hàng
Khách hàng cá nhân, Khách hàng tổ chức.

Loại tài khoản
Tài khoản thanh toán

Loại giao dịch giám sát
Bao gồm các giao dịch được ghi nhận trên Tài khoản thanh toán. Loại
trừ:

• Giao dịch trả lãi/phí

• Giao dịch bị hủy

Điều kiện cảnh báo

Thời gian thực hiện cảnh báo

---

## Trang 28

Mục
Nội dung

Tần suất chạy kịch bản
01 tháng – Không bao gồm tháng hiện tại (Tháng T). Chạy ngày đầu
tiên của tháng

Khoảng thời gian giám
sát

06 tháng (Từ tháng T-7 đến tháng T-2)

Các điều kiện của kịch bản

• Giám sát theo chiều giao dịch ghi Nợ

o Điều kiện 1: Khách hàng có Tài khoản thanh toán thỏa mãn điều kiện: (Ngày cuối cùng

của tháng (T-1) – Ngày mở tài khoản) ≥ 180 ngày VÀ

o Điều kiện 2: (SD x kmin) ≤ (A – Bi max) VÀ

Trong đó:

- Tổng giá trị giao dịch ghi Nợ tháng (T-1) của tất cả Tài khoản thanh toán của Khách
hàng = A

- Tổng giá trị giao dịch ghi Nợ từng tháng của các tháng thứ i trong kỳ giám sát của tất cả
Tài khoản thanh toán của Khách hàng = Bi

- SD là Độ lệch chuẩn

- kmin = 1,5

o Điều kiện 3: A ≥ KHCN: 5 tỷ VND (quy đổi), KHTC: 1 tỷ VND (quy đổi) VÀ

o Điều kiện 4: (A – Bi max)/Bi max ≥ 200%

• Giám sát theo chiều giao dịch ghi Có

o Điều kiện 1: (Ngày cuối cùng của tháng (T-1) – Ngày mở tài khoản) ≥ 180 ngày VÀ

o Điều kiện 2: (S x kmin) ≤ (C – Di max) VÀ

- Tổng giá trị giao dịch ghi Có tháng (T-1) của tất cả Tài khoản thanh toán của Khách
hàng = C

- Tổng giá trị giao dịch ghi Có từng tháng của các tháng trong kỳ giám sát của tất cả Tài
khoản thanh toán của KH = Di

- SD là Độ lệch chuẩn

- kmin = 1,5

o Điều kiện 3: C ≥ KHCN: 5 tỷ VND (quy đổi), KHTC: 1 tỷ VND (quy đổi) VÀ

o Điều kiện 4: (C – Di max)/Di max ≥ 200%

---

## Trang 29

III.4.5. AML-05: Sự dịch chuyển nhanh của dòng tiền

Mục
Nội dung

Mô tả và Mục tiêu kịch
bản

Xác định khách hàng có giao dịch chuyển tiền điện tử đến/đi trong
một giai đoạn xác định. Trong đó có xem xét quy mô hoặc tốc độ luân
chuyển của dòng tiền qua tài khoản so với số dư tài khoản hoặc giá trị
tài sản ròng.

Phạm vi kịch bản

Chiều giám sát
Khách hàng

Phạm vi khách hàng
Khách hàng cá nhân, Khách hàng tổ chức

Loại tài khoản
Tài khoản thanh toán

Loại giao dịch giám sát
Bao gồm các giao dịch được ghi nhận trên Tài khoản thanh toán. Loại
trừ:

• Giao dịch trả lãi/phí

• Giao dịch bị hủy

• Giao dịch chuyển tiền qua lại giữa các tài khoản của chung 1
khách hàng trong nội bộ MSB

Điều kiện cảnh báo

Thời gian thực hiện cảnh báo

Tần suất chạy kịch bản
7 ngày (Được phép tùy chỉnh)

Khoảng thời gian giám
sát

14 ngày (từ ngày T-14 đến T-1)

Các điều kiện của kịch bản

• Đối với Khách hàng mới

o Điều kiện 1: Khách hàng có Tài khoản thanh toán thỏa mãn điều kiện: (Ngày (T-1) –

Ngày mở tài khoản) ≤ 90 ngày VÀ

o Điều kiện 2: Tổng giá trị giao dịch ghi Có của tất cả Tài khoản thanh toán của Khách

hàng ≥ KHCN và SME: 700 triệu VND (quy đổi) CIB: 10 tỷ VND (quy đổi)  VÀ

---

## Trang 30

Mục
Nội dung

o Điều kiện 3: Số giao dịch ghi Có của tất cả Tài khoản thanh toán của Khách hàng ≥ 100

giao dịch VÀ

o Điều kiện 4: Số giao dịch ghi Nợ của tất cả Tài khoản thanh toán của Khách hàng ≥ 100

giao dịchVÀ

o Điều kiện 5: ABS((B-A)/A) ≤ 5%

A = Tổng giá trị ghi Có của tất cả Tài khoản thanh toán của Khách hàng trong khoảng
thời gian giám sát

B = Tổng giá trị ghi Nợ của tất cả Tài khoản thanh toán của Khách hàng trong khoảng
thời gian giám sát

• Đối với Khách hàng hiện hữu

o Điều kiện 1: Khách hàng có Tài khoản thanh toán thỏa mãn điều kiện: (Ngày (T-1) –

Ngày mở tài khoản) > 90 ngày VÀ

o Điều kiện 2: Tổng giá trị giao dịch ghi Có của tất cả Tài khoản thanh toán của Khách

hàng ≥ KHCN và SME: 700 triệu VND (quy đổi) CIB: 5 tỷ VND (quy đổi) VÀ

o Điều kiện 3: Số giao dịch ghi Có của tất cả Tài khoản thanh toán của Khách hàng ≥ 110

giao dịch VÀ

o Điều kiện 4: Số giao dịch ghi Nợ của tất cả Tài khoản thanh toán của Khách hàng ≥ 110

giao dịch VÀ

o Điều kiện 5: ABS((B-A)/A) ≤ 10%

A = Tổng giá trị ghi Có của tất cả Tài khoản thanh toán của Khách hàng trong khoảng
thời gian giám sát

B = Tổng giá trị ghi Nợ của tất cả Tài khoản thanh toán của Khách hàng trong khoảng
thời gian giám sát

o Điều kiện 6: Tổng giá trị ghi Có của tất cả Tài khoản thanh toán của KH/ Tổng số dư cuối

cùng của tất cả các Tài khoản thanh toán của Khách hàng ≥ 50%

III.4.6. AML-06: Giao dịch trên tài khoản không hoạt động

Mục
Nội dung

Mô tả và Mục tiêu kịch
bản

Giám sát các giao dịch tăng đột biến ở tài khoản của khách hàng không
hoạt động trong vòng 6 tháng (không phát sinh giao dịch nào trong
vòng 6 tháng)

Phạm vi kịch bản

---

## Trang 31

Mục
Nội dung

Chiều giám sát
Tài khoản

Phạm vi khách hàng
Khách hàng cá nhân, Khách hàng tổ chức.

Loại trừ khách hàng:

• Có sản phẩm tiết kiệm, trái phiếu, CCTG

• TKTT khác vẫn đang active và phát sinh giao dịch (đối với TKTT)
thường xuyên (thường xuyên là tồn tại 1 giao dịch trong vòng 6
tháng)

Loại tài khoản
Tài khoản thanh toán ở trạng thái không hoạt động trong vòng 6 tháng
ở ngày (t-7) (chỉ lấy TKTT ứng với loại tiền tệ là VND)

Loại giao dịch giám sát
Bao gồm các giao dịch được ghi nhận trên Tài khoản thanh toán. Loại
trừ:

• Giao dịch trả lãi/phí

• Giao dịch bị hủy

Điều kiện cảnh báo

Thời gian thực hiện cảnh báo

Tần suất chạy kịch bản
1 ngày

Khoảng thời gian giám
sát

7 ngày (từ ngày T-6 đến T)

Các điều kiện của kịch bản

Điều kiện 1: Tổng số tiền ghi Nợ ≥ 400 triệu VND quy đổi

HOẶC

Điều kiện 1: Tổng số tiền ghi Có ≥ 400 triệu VND quy đổi

III.4.7. AML-07: Mô hình Hub - Spoke

---

## Trang 32

Mục
Nội dung

Mô tả và Mục tiêu kịch
bản

Phát hiện các giao dịch có dấu hiệu tập trung (nhiều người gửi tới 1
người nhận) hoặc phân tán (1 người gửi tới nhiều người nhận) trong
khoảng thời gian xác định.

Phạm vi kịch bản

Chiều giám sát
Khách hàng

Phạm vi khách hàng
Khách hàng cá nhân, Khách hàng tổ chức.

Loại tài khoản
Tài khoản thanh toán

Loại giao dịch giám sát
Bao gồm các giao dịch được ghi nhận trên Tài khoản thanh toán. Loại
trừ:

• Giao dịch trả lãi/phí

• Giao dịch bị hủy

Điều kiện cảnh báo

Thời gian thực hiện cảnh báo

Tần suất chạy kịch bản
Hàng tháng, chạy ngày đầu tiên của tháng

Khoảng thời gian giám
sát

Tháng liền trước

Các điều kiện của kịch bản

• Trường hợp ghi Có:

o Điều kiện 1: Số lượng đối tác đối ứng không trùng lặp ≥ 25 đối tác VÀ

o Điều kiện 2: Số lượng giao dịch ghi Có ≥ 150 giao dịch VÀ

o Điều kiện 3: Tổng giá trị giao dịch ghi Có ≥ KHCN: 1,5 tỷ VND (quy đổi); KHTC: 5 tỷ

VND (quy đổi)

• Trường hợp ghi Nợ:

o Điều kiện 1: Số lượng đối tác đối ứng không trùng lặp ≥ 25 đối tác VÀ

o Điều kiện 2: Số lượng giao dịch ghi Nợ ≥ 150 giao dịch VÀ

---

## Trang 33

Mục
Nội dung

o Điều kiện 3: Tổng giá trị giao dịch ghi Nợ ≥ KHCN: 1,5 tỷ VND (quy đổi); KHTC: 5 tỷ

VND (quy đổi)

Trong đó: Đối tác đối ứng không trùng lặp được xác định dựa trên thông tin: Tên khách hàng +
STK.

III.4.8. AML-08: Giao dịch có IP nước ngoài

Mục
Nội dung

Mô tả và Mục tiêu kịch
bản

Giám sát các khách hàng của MSB thực hiện đăng nhập có địa chỉ IP
nước ngoài mà có sự thay đổi đột biến trong doanh số giao dịch trên
tài khoản; tiền vào và rút ra nhanh khỏi tài khoản; doanh số giao dịch
lớn trong ngày nhưng số dư tài khoản rất nhỏ hoặc bằng không.

Phạm vi kịch bản

Chiều giám sát
Khách hàng

Phạm vi khách hàng
Khách hàng cá nhân, Khách hàng tổ chức.

Loại tài khoản
Tài khoản thanh toán

Loại giao dịch giám sát
Giao dịch chuyển tiền, nhận tiền trên kênh IB, MB

Điều kiện cảnh báo

Thời gian thực hiện cảnh báo

Tần suất chạy kịch bản
7 ngày

Khoảng thời gian giám
sát

14 ngày (từ ngày T-14 đến T-1)

Các điều kiện của kịch bản

Điều kiện 1: Số lần đăng nhập có có IP nước ngoài ≥ 2 lần VÀ

Điều kiện 2: Tổng giá trị ghi Có ≥ 2 tỷ VND (quy đổi) VÀ

Điều kiện 3: Tổng giá trị ghi Có/ Tổng giá trị ghi Nợ ≥ 95%

---

## Trang 34

III.4.9. AML-09: Giao dịch có cùng địa chỉ IP

Mục
Nội dung

Mô tả và Mục tiêu kịch
bản

Giám sát các khách hàng của MSB thực hiện đăng nhập cùng địa chỉ
IP nhằm phát hiện kịp thời các gian lận lừa đảo và PCRT qua các lần
đăng nhập cùng địa chỉ IP

Phạm vi kịch bản

Chiều giám sát
Khách hàng

Phạm vi khách hàng
Khách hàng cá nhân, Khách hàng tổ chức

Loại tài khoản
Tài khoản thanh toán

Loại giao dịch giám sát
Giao dịch chuyển tiền, nhận tiền trên kênh IB, MB

Điều kiện cảnh báo

Thời gian thực hiện cảnh báo

Tần suất chạy kịch bản
7 ngày

Khoảng thời gian giám
sát

14 ngày (từ ngày T-14 đến T-1)

Các điều kiện của kịch bản

Điều kiện 1: Khách hàng gửi và Khách hàng nhận có cùng địa chỉ IP đăng nhập

Điều kiện 2: Khách hàng gửi và Khách hàng nhận có cùng địa chỉ IP đăng nhập có phát sinh giao
dịch với nhau ≥ 1 giao dịch

VÀ

Điều kiện 3: Tổng giá trị ghi Có ≥ 500 triệu VND (quy đổi)

HOẶC

Điều kiện 3: Tổng giá trị ghi Nợ ≥ 500 triệu VND (quy đổi)

VÀ

Điều kiện 4: Tổng giá trị ghi Có/ Tổng giá trị ghi Nợ ≥ 95%

III.4.10. AML-10: Khách hàng cá nhân nhận tiền từ tổ chức nước ngoài

---

## Trang 35

Mục
Nội dung

Mô tả và Mục tiêu kịch
bản

Giám sát các giao dịch tiền đến tài khoản cá nhân mà người chuyển
tiền là tổ chức ở nước ngoài.

Phạm vi kịch bản

Chiều giám sát
Tài khoản

Phạm vi khách hàng
Khách hàng cá nhân

Loại tài khoản
Tài khoản thanh toán

Loại giao dịch giám sát
Bao gồm các giao dịch được ghi nhận trên Tài khoản thanh toán. Loại
trừ:

• Giao dịch trả lãi/phí

• Giao dịch bị hủy

Điều kiện cảnh báo

Thời gian thực hiện cảnh báo

Tần suất chạy kịch bản
7 ngày

Khoảng thời gian giám
sát

14 ngày (từ ngày T-14 đến T-1)

Các điều kiện của kịch bản

Điều kiện 1: Số giao dịch ghi Có từ Tổ chức nước ngoài ≥ 1 giao dịch VÀ

Điều kiện 2: Giá trị ghi Có của mỗi giao dịch từ Tổ chức nước ngoài ≥ 500 triệu VND (quy đổi)
VÀ

Điều kiện 3: Tổng giá trị ghi Có/Tổng giá trị ghi Nợ ≥ 95%

(Của tất cả các giao dịch không phân biệt Khách hàng đối ứng)

III.4.11. AML-11: Cá nhân nước ngoài/tổ chức có vốn đầu tư nước ngoài (FDI) chuyển tiền ra nước
ngoài

---

## Trang 36

Mục
Nội dung

Mô tả và Mục tiêu kịch
bản

Nhận biết các KH là người nước ngoài hoặc tổ chức có vốn đầu tư
nước ngoài (FDI) chuyển tiền ra nước ngoài ngay sau khi nhận được
tiền từ nước ngoài chuyển về (trong thời gian giám sát).

Phạm vi kịch bản

Chiều giám sát
Khách hàng

Phạm vi khách hàng
Khách hàng cá nhân nước ngoài, Khách hàng tổ chức có vốn đầu tư
nước ngoài (FDI)

Loại tài khoản
Tài khoản thanh toán

Tài khoản DICA

Loại giao dịch giám sát
Bao gồm các giao dịch Ghi Có quốc tế và Ghi Nợ quốc tế. Loại trừ:

• Giao dịch trả lãi/phí

• Giao dịch bị hủy

Điều kiện cảnh báo

Thời gian thực hiện cảnh báo

Tần suất chạy kịch bản
7 ngày

Khoảng thời gian giám
sát

14 ngày (từ ngày T-14 đến T-1)

Các điều kiện của kịch bản

Điều kiện 1: Tổng giá trị giao dịch ghi Có từ nước ngoài ≥ KHCN: 1 tỷ (quy đổi), KHTC: 2 tỷ (quy
đổi) VÀ

Điều kiện 2: Tổng giá trị giao dịch ghi Nợ đến nước ngoài ≥ KHCN: 1 tỷ (quy đổi), KHTC: 2 tỷ
(quy đổi) VÀ

Điều kiện 3: Tổng số tiền ghi nợ đến nước ngoài / Tổng số tiền ghi có từ nước ngoài ≥ 70%

III.4.12. AML-12: Khách hàng thuộc nhóm SSE, MSME và SME thực hiện chuyển tiền quốc tế nhiều
và liên tục

---

## Trang 37

Mục
Nội dung

Mô tả và Mục tiêu kịch
bản

Giám sát các khách hàng có thực hiện chuyển tiền quốc tế nhiều và
liên tục trong khoảng thời gian giám sát

Phạm vi kịch bản

Chiều giám sát
Khách hàng

Phạm vi khách hàng
Khách hàng tổ chức: SSE, MSME và SME

Loại tài khoản
Tài khoản thanh toán

Loại giao dịch giám sát
Bao gồm các giao dịch Ghi Nợ quốc tế trên Tài khoản thanh toán. Loại
trừ:

• Giao dịch trả lãi/phí

• Giao dịch bị hủy

Điều kiện cảnh báo

Thời gian thực hiện cảnh báo

Tần suất chạy kịch bản
7 ngày

Khoảng thời gian giám
sát

14 ngày (từ ngày T-14 đến T-1)

Các điều kiện của kịch bản

Điều kiện 1: Thời gian thành lập ≤ 12 tháng VÀ

Điều kiện 2: Tổng giá trị giao dịch ghi Nợ đến nước ngoài ≥ SSE, MSME 10 tỷ (quy đổi), SME:
15 tỷ (quy đổi) VÀ

Điều kiện 3: Tổng số giao dịch ghi Nợ đến nước ngoài ≥ 5 giao dịch

III.4.13. AML-13: Khách hàng thực hiện chuyển tiền quốc tế nhiều và liên tục - CN (AFF, MAFF, Hộ
kinh doanh) và MC (SMC, LMC)

---

## Trang 38

Mục
Nội dung

Mô tả và Mục tiêu kịch
bản

Giám sát các khách hàng có thực hiện chuyển tiền quốc tế nhiều và
liên tục trong khoảng thời gian giám sát

Phạm vi kịch bản

Chiều giám sát
Khách hàng

Phạm vi khách hàng
Khách hàng cá nhân: AFF, MAFF, Hộ kinh doanh;

Khách hàng MC: SMC, LMC

Loại tài khoản
Tài khoản thanh toán

Loại giao dịch giám sát
Bao gồm các giao dịch Ghi Nợ quốc tế trên Tài khoản thanh toán. Loại
trừ:

• Giao dịch trả lãi/phí

• Giao dịch bị hủy

Điều kiện cảnh báo

Thời gian thực hiện cảnh báo

Tần suất chạy kịch bản
7 ngày

Khoảng thời gian giám
sát

14 ngày (từ ngày T-14 đến T-1)

Các điều kiện của kịch bản

Điều kiện 1: Tổng giá trị giao dịch ghi Nợ đến nước ngoài ≥ KHCN 3 tỷ (quy đổi), KH MC: 30 tỷ
(quy đổi) VÀ

Điều kiện 2: Tổng số giao dịch ghi Nợ đến nước ngoài ≥ 5 giao dịch

III.4.14. AML-14: Nhiều nạp/rút ví điện tử – vòng quay nhanh

---

## Trang 39

Mục
Nội dung

Mô tả và Mục tiêu kịch
bản

Phát hiện sớm các khách hàng có hành vi nạp và rút tiền qua ví điện
tử với tần suất cao, tổng giá trị lớn và thời gian luân chuyển ngắn, có
dấu hiệu quay vòng dòng tiền bất thường

Phạm vi kịch bản

Chiều giám sát
Khách hàng

Phạm vi khách hàng
Khách hàng cá nhân, Khách hàng tổ chức

Loại tài khoản
Tài khoản thanh toán. Loại trừ tài khoản được định nghĩa là tài khoản
chuyên dùng trên T24

Loại giao dịch giám sát
Bao gồm tất cả các giao dịch nộp tiền vào ví điện tử (chuyển tiền từ
TKTT vào ví điện tử) và rút tiền ra khỏi ví điện tử (chuyển tiền từ ví
điện tử vào TKTT). Loại trừ:

• Giao dịch trả phí/trả lãi

• Các giao dịch bị hủy

Điều kiện cảnh báo

Thời gian thực hiện cảnh báo

Tần suất chạy kịch bản
1 ngày

Khoảng thời gian giám
sát

1 ngày (T-1)

Các điều kiện của kịch bản

Điều kiện 1: Tổng giá trị giao dịch chuyển tiền và rút tiền từ TKTT vào ví điện tử ≥ 200 triệu đồng
(quy đổi) VÀ

Điều kiện 2: Tổng số giao dịch chuyển tiền vào ví điện tử và rút tiền ra khỏi ví điện tử ≥ 20 giao
dịch VÀ

Điều kiện 3: Tổng số ví được nộp và rút tiền ≥ 5 loại

III.5. Chức năng báo cáo (Reporting)

---

## Trang 40

Danh sách báo cáo của cấu phần TM, mô tả chi tiết tham chiếu <<IV. Phụ lục - 4. Phục lục 4: Báo

cáo nội bộ>>

STT
Mã yêu cầu
Nội dung yêu cầu

Report TM_01
Báo cáo thống kê số lượng báo cáo giao dịch đáng ngờ đã tạo

Report TM_02
Báo cáo đánh giá hiệu quả của kịch bản quét sàng lọc giao dịch của
khách hàng

Report TM_03
Báo cáo các cảnh báo chưa được xử lý

Report TM_04
Báo cáo khách hàng phát sinh cảnh báo theo từng kịch bản

Việc xem/xuất báo cáo được thực hiện bởi người dùng được phân quyền, chi tiết tham chiếu <<IV.
Phụ lục – 2. Phụ lục 2: Ma trận phân quyền>>.

Hệ thống có khả năng cho phép chủ động tạo mới báo cáo khi có yêu cầu phát sinh.

III.6. Chức năng Email thông báo tự động gắn với luồng nghiệp vụ

III.6.1. EM-1: Email thông báo xử lý cảnh báo giám sát giao dịch đáng ngờ tự động

III.6.2. EM-2: Email thông báo phê duyệt kết quả xử lý cảnh báo giám sát giao dịch đáng ngờ tự
động

III.6.3. EM-3: Email thông báo phê duyệt kết quả rà soát xử lý cảnh báo

III.6.4. EM-4.1, EM-4.2: Email thông báo kết quả xử lý cảnh báo

III.6.5. EM-5: Email Yêu cầu bổ sung thêm thông tin

III.6.6. EM-6: Email thông báo phê duyệt báo cáo STR

III.6.7. EM-7: Email hỗ trợ phân tích và gửi báo cáo STR

III.6.8. EM-8: Email Yêu cầu bổ sung thông tin báo cáo STR

III.6.9. EM-9: Email thông báo có case được mở lại cần xử lý (re-open case)

Chi tiết tham chiếu <<Phụ lục 5. MSB_Template Email TM>>

IV.
 PHỤ LỤC

IV.1. Phụ lục 1: Danh mục dữ liệu yêu cầu

IV.2. Phụ lục 2: Ma trận phân quyền

IV.3. Phụ lục 3: Bộ câu hỏi EDD

BỘ CÂU HỎI NHẬN
BIẾT TĂNG CƯỜNG K

BỘ CÂU HỎI NHẬN
BIẾT TĂNG CƯỜNG K

IV.4. Phụ lục 4: Báo cáo nội bộ

### Comment review — trang 40

- **[A304]** Chi tiết comment theo file đính kèm
- **[HLV305]** MSB cung cấp template email
- **[A306R305]** 
- **[A307]** Bổ sung theo email ngày 30/6
- **[TMP(TP308]** FIS rà soát lại với luồng STR còn có file Template Mô tả dòng tiền STR; Bảng kê giao dịch; Template STR
- **[PT309R308]** 1.Đã bổ sung phụ lục 06: Màn hình STR và template STR 2.Các nội dung liên quan đên mô tả dòng tiền, bảng kê dòng tiền trao đổi trong file Mô tả dòng tiền

---

## Trang 41

IV.5. Phụ lục 5: Template Email TM

IV.6. Phụ lục 6: Màn hình STR và Template STR

IV.6.1. Màn hình STR

IV.6.2. Template STR

Lưu ý: Bản ghi STR và các thông tin liên quan của STR cần được lưu trữ tối đa 5 năm trên hệ thống
tùy theo chính sách của Ngân hàng trong từng thời kỳ.

### Comment review — trang 41

- **[A310]** MSB check các nội dung trong file đính kèm
- **[A311]** File STR do hệ thống sinh ra có bao gồm phần “hướng dẫn điền báo cáo” không? MSB cung cấp file minh họa
- **[TMP(TP312R311]** Phần “hướng dẫn điền báo cáo” không cần thiết kế trên file STR. Hướng dẫn sẽ là 1 phần trong file hướng dẫn đc attach theo chức năng MSB Guideline
- **[A313]** MSB confirm lại nội dung: - Luồng tự động/luông thủ công xuất phát từ ĐVKD: chữ ký là thông tin user của maker/checker/checker N+1 - Luồng thủ công xuất phát từ AML maker: user nào sẽ ký và ký ở vị trí nào?
- **[TMP(TP314]** Bổ sung thêm trường hợp lưu trữ các bản ghi luồng xử lý TM
- **[APTL(315]** Phần này yêu cầu làm cấu hình thời gian lưu trữ dữ liệu STR
- **[A316R315]** Hệ thống lưu HIT các thông tịn để xử lý Kịch bản và output còn lưu bao lâu phụ thuộc archive của ngân hàng

---
