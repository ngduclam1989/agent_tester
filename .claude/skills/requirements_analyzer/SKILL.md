---
name: requirements_analyzer
description: Kỹ năng phân tích trang web/module và sinh ra tài liệu Yêu cầu (Requirements Document/User Stories) chuẩn mực.
---

# Kỹ năng Phân tích Yêu cầu (Requirements Analyzer)

Kỹ năng này cung cấp các hướng dẫn chi tiết để AI (Claude Code) có thể chuyển đổi giao diện UI hoặc cấu trúc DOM/HTML của một trang web thành các tài liệu Yêu cầu rõ ràng, chi tiết, phục vụ trực tiếp cho QA, Tester và Developer.

## 1. Mục tiêu cốt lõi
- Xây dựng tài liệu yêu cầu bám sát thực tế hệ thống đang chạy.
- Đảm bảo tính nhất quán, tính bao quát cho cả Happy Path và Edge Cases (Trường hợp ngoại lệ/báo lỗi).
- Định dạng xuất ra một cách chuyên nghiệp (Sử dụng cấu trúc Artifact).

## 2. Tiền xử lý tài liệu Word (.docx)
Khi nhận được tài liệu yêu cầu đầu vào dạng file Word (`.docx`) và chưa có file `.md` tương ứng trong workspace:
- Agent **bắt buộc** phải tự động chạy script convert bằng cách gọi lệnh Node.js sau để tạo file `.md` trước khi phân tích:
  `node scripts/convert_doc/docx_to_md.js <đường_dẫn_tới_file_docx>`
- Nếu file ở định dạng `.doc` cũ, Agent cần thông báo và hướng dẫn người dùng "Save As" sang `.docx` trước khi thực hiện.
- Sử dụng nội dung file `.md` được sinh ra làm dữ liệu đầu vào chính để phân tích.

## 3. Quy trình trích xuất thông tin
Khi được yêu cầu tạo Requirements từ một trang web:
1. **Phân tích Khung giao diện (Layout Analysis):** Xác định các phần Header, Footer, Sidebar, và Nội dung chính (Main Content).
2. **Thu thập Form & Inputs:**
   - Tìm tất cả các trường nhập liệu (`input`, `select`, `textarea`).
   - Ghi nhận thuộc tính `type` (text, email, password, number), `required`, `maxlength`, `minlength`, `pattern`.
3. **Thu thập Các nút tương tác (Buttons/Links/Actions):**
   - Xác định chức năng của từng nút (Save, Submit, Cancel, Delete, Edit).
   - Các cảnh báo, thông báo (Alerts, Toasts, Validation Messages) xuất hiện khi tương tác lỗi.
4. **Trích xuất Luồng công việc (Workflows):**
   - Sự phụ thuộc giữa các thành phần (VD: Nút Submit chỉ enable khi đã tích chọn Checkbox "Tôi đồng ý").
5. **Trích xuất chi tiết thuộc tính UI và Validate trường dữ liệu (Field-Level & UI Details):**
   - **Bắt buộc** lập bảng danh sách tất cả các trường dữ liệu và elements trên form/UI.
   - Trích xuất chi tiết: Label hiển thị, Placeholder, Ký hiệu bắt buộc `*`, Trạng thái mặc định, Validation rules chi tiết (Max/Min length, Pattern, unique check).
   - Phát hiện các phần thiếu sót hoặc mờ nhạt (Ambiguities) trong tài liệu liên quan đến validate (ví dụ: thiếu độ dài tối đa, định dạng sđt, email, ký tự đặc biệt, unicode, XSS, SQL injection).

## 4. Cấu trúc Tài liệu Yêu cầu Đầu ra (Output Format)
Tài liệu cần được format theo Markdown chuyên nghiệp hoặc lưu dưới dạng Artifact (`requirements_spec.md`).

**Nội dung bắt buộc phải có:**

### 4.1. Tổng quan (Overview)
Mô tả tóm tắt tính năng và mục đích của trang web/module.

### 4.2. Yêu cầu Chức năng (Functional Requirements)
Chia thành các **User Stories** hoặc **Use Cases**:
- **Tên tính năng** (Ví dụ: Chức năng Đăng nhập)
- **Mô tả:** "Là một người dùng, tôi muốn... để có thể..."
- **Tiêu chí chấp nhận (Acceptance Criteria):** Ghi rõ các điều kiện cần thỏa mãn.

### 4.3. Đặc tả Trường Dữ Liệu (Field Specifications)
Đây là phần cốt lõi dành cho Automation Tester:
* Dùng bảng Markdown (*Markdown Table*) để liệt kê:
  - Tên Trường (Label)
  - Loại (Type UI)
  - Validation Rules (Bắt buộc / Mặc định / Giới hạn độ dài).
  - Ghi chú (Notes).

### 4.4. Các luồng xử lý và Báo lỗi (Business Rules & Validations)
Liệt kê chi tiết các Validation Message mong đợi khi người dùng nhập sai dữ liệu.

### 4.5. Điểm thiếu/điểm mờ (Gap Review)
Bảng liệt kê toàn bộ finding theo mã `RR-NNN`, xem cách phát hiện và định dạng bắt buộc tại mục 5 bên dưới. Đây KHÔNG phải mục phụ — đây là phần giá trị cao nhất của tài liệu, không được rút gọn hay bỏ qua finding nào.

### 4.6. Vị trí lưu file
Lưu tài liệu ra file Markdown tại `practices/requirements/[tên_dự_án_hoặc_module]/requirements_[tên_module].md` (tạo thư mục con nếu chưa có). Đây là vị trí chuẩn mà `rbt_manual_testing` sẽ đọc requirements từ đó khi sinh test cases — không lưu rải rác nơi khác.

## 5. Phát hiện điểm thiếu/điểm mờ (Requirement Gap Review)

Mục tiêu của phần này là tìm được **càng nhiều điểm thiếu/mờ càng tốt**, mỗi điểm có bằng chứng cụ thể — không phải liệt kê vài điểm "nhìn thấy ngay" rồi dừng lại.

### 5.1. Nguồn đối chiếu
Tuỳ đầu vào đang có, đối chiếu qua các nguồn sau (bỏ qua nguồn không tồn tại trong tác vụ hiện tại):
- Tài liệu yêu cầu gốc (.md đã convert từ .docx, Jira ticket, user story, mô tả text)
- Mockup / screenshot / design
- UI/DOM thực tế (nếu có Playwright MCP hoặc WebFetch)
- Related tickets / tài liệu phụ thuộc

### 5.2. 6 nhóm rà soát (Dimension) — đi qua lần lượt, không bỏ nhóm nào
Với mỗi field/component/luồng đã thu thập ở mục 3, đối chiếu đủ 6 nhóm sau. Nhóm nào tài liệu không nhắc tới → đó là 1 gap:

1. **Độ đầy đủ AC/User Story** — có phủ đủ happy path + negative + boundary + state không? AC có testable/quan sát được rõ ràng, hay chỉ mô tả mơ hồ (VD "hệ thống hoạt động ổn định")?
2. **Độ phủ Business Rule** — rule có ví dụ/số liệu cụ thể hay chỉ là câu chung chung (VD "không cho phép năm quá khứ" mà không nói rõ mốc năm)? Tổ hợp ≥2 rule cùng áp dụng có được nói tới không?
3. **Độ phủ trạng thái UX** — có đủ empty/loading/error/success state không? Transition giữa 2 state đã rõ chưa (VD "sau khi lưu xong chuyển màn nào")? Wording message cụ thể hay chỉ "hiển thị thông báo lỗi"?
4. **Khớp field/dữ liệu** — field trên UI/mockup có khớp field trong tài liệu (tên, loại, bắt buộc, giá trị mặc định) không? Label giữa các nguồn có nhất quán không (VD tài liệu ghi "Kỳ kế toán năm", UI hiển thị "Kỳ năm")?
5. **Nhất quán chéo nguồn** — tài liệu nói X, mockup nói Y, related ticket nói Z — có mâu thuẫn không?
6. **Dependency còn thiếu** — field/rule/luồng nào tài liệu tham chiếu tới nhưng không thấy định nghĩa ở đâu (role, permission, ticket phụ thuộc, mã lỗi...)?

### 5.3. 5 lăng kính rà soát sâu (Depth Lens) — áp dụng cho MỖI nhóm ở 5.2
Đây là nơi hay bị bỏ sót nhất. Khi rà mỗi dimension ở trên, luôn tự hỏi thêm 5 khía cạnh sau:

- **Biên & ngoại lệ**: input null/rỗng/0/âm/min/max/vượt giới hạn, timeout, thử lại, huỷ, lỗi một phần, dữ liệu cũ tạo trước khi có tính năng này.
- **Nhất quán trạng thái**: entity có đường chuyển trạng thái hợp lệ không, trạng thái cuối có bị chặn chuyển tiếp không, đồng bộ giữa các entity liên quan (VD đơn hàng/thanh toán/tồn kho).
- **Tương tranh & xung đột tài nguyên**: double-click/double-submit, nhiều tab, nhiều user cùng sửa 1 bản ghi, race condition giữa FE và BE.
- **Bảo mật & dữ liệu**: truy cập trái quyền, lộ dữ liệu nhạy cảm, XSS/SQL injection khi field nhận input tự do, dấu vết audit.
- **UX & khả năng tiếp cận**: empty/loading/error/success state, bàn phím/screen reader/focus/độ tương phản, luồng xác nhận + khôi phục cho hành động huỷ/xoá.

### 5.4. Định dạng bắt buộc cho MỖI finding

Mỗi gap/ambiguity phát hiện được PHẢI viết thành 1 block Markdown độc lập theo đúng cấu trúc 8 mục cố định dưới đây — thiếu mục nào thì finding đó không hợp lệ. Không dùng bảng rút gọn thay thế — bảng chỉ dùng cho phần tổng hợp (mục 4.5 / §7.1 của output), còn mỗi finding chi tiết bắt buộc viết đầy đủ theo mẫu này.

**Mã** — `RR-NNN` (đánh số tuần tự toàn tài liệu, không trùng, không tái sử dụng, không reset theo module).

**Loại** — chọn đúng 1 trong 10 enum sau, ghi bằng nhãn tiếng Việt kèm ý nghĩa gốc trong ngoặc khi cần đối chiếu:

| Nhãn tiếng Việt dùng trong heading | Enum gốc |
|---|---|
| Biên | Edge |
| Ngoại lệ | Exception |
| Trạng thái | State |
| Mơ hồ | Ambiguity |
| Tương tranh | Concurrency |
| Bảo mật | Security |
| Tuân thủ | Compliance |
| UX | UX |
| Khả năng tiếp cận | Accessibility |
| Thiếu phủ | Coverage-Gap |

**Mức độ** — ghi bằng nhãn tiếng Việt trong heading (`[Chặn]` / `[Cao]` / `[Trung bình]` / `[Thấp]`):

- `[Chặn]` (BLOCKER) — không giải quyết thì không thể sinh TC chính xác (VD field bắt buộc không định nghĩa loại dữ liệu).
- `[Cao]` (HIGH) — TC sinh được nhưng thiếu hẳn 1 nhánh chính (VD error state/response contract chưa được đặc tả).
- `[Trung bình]` (MEDIUM) — TC sinh được nhưng sẽ bỏ sót 1 edge case (VD giá trị biên chưa được đặc tả).
- `[Thấp]` (LOW) — chỉ ảnh hưởng độ rõ ràng/wording, không ảnh hưởng khả năng sinh TC.

**Cấu trúc block** (heading + 8 mục con, theo đúng thứ tự):

```markdown
## RR-NNN [Mức độ] Loại — Tóm tắt 1 dòng nêu rõ FEAT/AC/section liên quan và bản chất gap

### 1. Trích dẫn nguồn

- **File**: [tên file](đường_dẫn_tương_đối#Lxx-Lyy) — dùng markdown link kèm anchor dòng thật nếu là file trong workspace; nếu nguồn là UI/mockup thì mô tả rõ vị trí (tên màn hình, tên field/component quan sát được) thay cho File/Dòng.
- **Section**: mục/§/AC cụ thể trong file đó.
- **Dòng**: số dòng bắt đầu-kết thúc của đoạn được trích.
- **Quote nguyên văn**: trích nguyên văn (blockquote `>`), không diễn giải lại.

### 2. Bối cảnh nghiệp vụ

Giải thích ngắn gọn domain/luồng nghiệp vụ liên quan để người đọc không cần mở lại tài liệu gốc vẫn hiểu được vấn đề. Nếu có thể, minh hoạ bằng 1 ví dụ dữ liệu cụ thể (mã phiếu, số liệu, ngày tháng...) thay vì mô tả trừu tượng.

### 3. Vấn đề cụ thể

Nêu rõ (các) điểm mơ hồ/thiếu sót. Nếu gap có nhiều khía cạnh độc lập, tách thành "Vấn đề 1", "Vấn đề 2"... trong CÙNG 1 mã RR (không tách mã) khi các khía cạnh đó cùng chung 1 câu hỏi gốc cho user; nếu là gap thực sự khác nhau về bản chất thì phải tách thành mã RR riêng theo mục 5.5. Khi có ≥2 cách hiểu hợp lý, liệt kê rõ "Khả năng A / Khả năng B" thay vì chỉ nói "chưa rõ".

### 4. Ảnh hưởng nếu không giải quyết

Danh sách bullet, mỗi bullet 1 hệ quả cụ thể (kỹ thuật, nghiệp vụ, trải nghiệm, hoặc rủi ro test) — không viết chung chung kiểu "sẽ gây khó khăn".

### 5. Đề xuất giải quyết

Đề xuất cụ thể, có thể kèm ví dụ (JSON schema, bảng, đoạn message mẫu...) nếu gap thuộc dạng contract/API/message. Phải dựa trên tài liệu liên quan hoặc best practice ngành đã nêu rõ nguồn — không bịa. Nếu không có căn cứ, ghi rõ đây là giả định đề xuất, không phải sự thật đã xác nhận.

### 6. Liên kết với các phát hiện khác

Nếu gap này lặp lại pattern ở 1 finding khác (VD cùng loại thiếu sót ở 1 FEAT khác), hoặc liên quan/ảnh hưởng tới 1 mã RR khác, ghi rõ tại đây (VD "Cùng mẫu với RR-xxx", "Ảnh hưởng tới RR-yyy"). Nếu không có liên kết nào, ghi "Không có liên kết với finding khác trong tài liệu này".

### 7. Câu hỏi cho người dùng

Liệt kê các lựa chọn cụ thể dạng (a) / (b) / (c)... để user chọn hoặc phản hồi tự do — không viết 1 câu hỏi mở chung chung nếu có thể quy về các lựa chọn rõ ràng hơn.

### 8. Trạng thái

`ĐANG MỞ` khi mới phát hiện. Cập nhật thành `ĐÃ CHỐT — {tóm tắt quyết định}` khi user trả lời trong các lượt hội thoại sau, không xoá finding cũ.
```

### 5.5. Quy tắc không được bỏ sót
- Thấy gap dù nhỏ (`[Thấp]`/cosmetic) PHẢI vẫn ghi finding đầy đủ 8 mục theo mục 5.4 — không được lược bớt hay gộp vào câu tóm tắt kiểu "còn vài điểm nhỏ khác".
- Không gộp nhiều gap khác nhau về bản chất vào 1 mã `RR-NNN` — mỗi gap là 1 mã riêng, dù cùng nằm trong 1 section của tài liệu gốc. Chỉ được gộp thành nhiều "Vấn đề" trong CÙNG 1 mã khi chúng thực sự cùng 1 câu hỏi gốc cần user trả lời 1 lần (xem mục 5.4 §3).
- Finding không có trích dẫn nguồn cụ thể (file/dòng/quote) → không hợp lệ, phải bổ sung trước khi đưa vào tài liệu output.
- Không tự suy diễn nghiệp vụ khi thiếu căn cứ — đưa vào "Đề xuất giải quyết" kèm ghi rõ đây là đề xuất, không phải sự thật đã xác nhận.

### 5.6. Khuyến nghị cuối mục Gap Review
Ghi 1 dòng khuyến nghị tổng kết:
- `SẴN SÀNG sinh TC` — nếu 0 finding mức `[Chặn]` còn mở
- `CẦN LÀM RÕ TRƯỚC` — nếu còn ≥1 finding mức `[Chặn]` chưa có câu trả lời

Lưu ý: đây là khuyến nghị tham khảo để người đọc ưu tiên xử lý, KHÔNG phải cơ chế chặn kỹ thuật — không có gì ngăn việc chạy tiếp `/generate_manual_testcases_rbt` hay `/generate_testcases_from_requirements` kể cả khi còn BLOCKER mở; quyết định vẫn thuộc về user.

## 6. Bắt buộc (Strict Rules)
- Luôn viết bằng **Tiếng Việt** có dấu đầy đủ.
- Không sử dụng định dạng in đậm (dấu `**`) trong toàn bộ nội dung tài liệu sinh ra (áp dụng cho phần 4.1-4.4 và 4.6; riêng bảng/finding ở mục 4.5 dùng định dạng cứng theo mục 5.4, cho phép in đậm tên trường để dễ đọc).
- Không tự suy diễn các yêu cầu nghiệp vụ phức tạp nếu không có căn cứ từ UI. Nếu thiếu logic, hãy liệt kê chúng vào mục 4.5 (Gap Review) theo đúng định dạng `RR-NNN` (8 mục, mục 5.4).
- Tuyệt đối không đoán các trường dữ liệu, nút bấm, thông báo lỗi — phải quan sát UI/DOM thực tế trước khi liệt kê vào tài liệu.
- Nếu có Playwright MCP, ưu tiên mở browser thật để screenshot/capture giao diện nếu cần.
- Mọi finding trong mục 4.5 phải tuân thủ đúng cấu trúc 8 mục ở mục 5.4 (đủ trích dẫn nguồn) và quy tắc không bỏ sót ở mục 5.5.
