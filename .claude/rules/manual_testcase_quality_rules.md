# Quy Tắc Chất Lượng Manual Test Case (Traceability & Consistency)

> Áp dụng cho mọi tác vụ sinh manual test case (skill `rbt_manual_testing`, mode FULL RBT lẫn QUICK khi output lớn). Rule này ra đời sau 1 sự cố thật: sinh 186 TC cho Wave 6, khi rà soát lại phát hiện **7 lỗi** — 5-7 REQ đã chốt ở bước Traceability bị rớt không có TC, và toàn bộ bảng thống kê tổng hợp bị sai vì viết ước lượng thay vì tính lại từ nội dung cuối.

## Nguyên nhân gốc (Root Cause)

Khi sinh hàng trăm dòng TC bằng tay qua nhiều lượt viết dài, có 2 lớp lỗi hệ thống rất dễ xảy ra và **không thể tự phát hiện bằng cách đọc lại**:

1. **Rớt REQ/Scenario**: 1 REQ được định nghĩa ở bước Traceability (Bước 4 của FULL RBT) nhưng khi viết bảng TC chi tiết (Bước 5), người/agent viết quên đưa nó vào — không có cơ chế đối chiếu ngược nên lỗi này im lặng.
2. **Bảng tổng hợp lệch nội dung thật**: Risk Level summary, Priority stats, "Tổng số TC" thường được viết TRƯỚC hoặc TRONG LÚC soạn TC (ước lượng), rồi nội dung TC thay đổi sau đó (thêm/bớt/sửa) mà bảng tổng hợp không được cập nhật lại — im lặng lệch số.

Cả 2 lớp lỗi này **không phải lỗi logic nghiệp vụ** (không sai kiến thức domain) mà là lỗi **quy trình sinh nội dung dài bằng tay không có bước đối chiếu bắt buộc**. Vì vậy giải pháp không phải "cẩn thận hơn" mà là **thêm 1 bước audit tự động, bắt buộc, chạy bằng công cụ chứ không dựa vào mắt thường**.

## Quy tắc bắt buộc

1. **Traceability Coverage Audit** — sau khi sinh xong TC cho toàn bộ scope (không phải từng module riêng lẻ), đối chiếu **mỗi REQ-ID ở bước Traceability ↔ ít nhất 1 TC ID**. REQ nào không có TC nào tham chiếu → phải bổ sung trước khi báo hoàn thành.
2. **Test data khai báo phải được dùng**: nếu mục "Test Data thiết yếu" khai 1 giá trị/tài khoản cụ thể, phải có ≥1 TC thực sự dùng giá trị đó. Test data mồ côi (khai nhưng không TC nào dùng) là tín hiệu chắc chắn của 1 scenario bị rớt.
3. **Mọi số liệu tổng hợp phải tính lại từ nội dung cuối cùng bằng công cụ** — không viết theo trí nhớ/ước lượng. Áp dụng cho: Risk Level summary theo module×nhóm, Priority stats, "Tổng số TC".
4. **Cột Priority/Risk Level phải là enum sạch** (`Critical`/`High`/`Medium`/`Low`/`N/A`) — không nhét thêm chú thích ("Blocked", "best-effort", "cross-wave"...) vào 2 cột này. Chú thích thuộc về cột Pre-Condition/Test Data, không phải Priority/Risk Level — nhét vào đây làm bảng thống kê tự động không khớp được.
5. **Mọi TC ID được trích dẫn trong văn xuôi** (mục Ambiguities & Q&A, ghi chú...) phải trỏ tới đúng 1 dòng TC thật đang tồn tại — bắt buộc verify lại sau bất kỳ lần renumber/chỉnh sửa nào, không trích theo trí nhớ.
6. **Chạy `scripts/validate_testcases/validate_tc.py <file>`** trên mọi file `TC_*.md` trước khi báo hoàn thành hoặc trước khi chuyển sang bước Excel export. Script kiểm tra tự động cả 5 mục trên (trừ mục 1 — REQ coverage cần agent tự đối chiếu vì script không biết nội dung REQ). Sửa hết lỗi trước khi tiếp tục, lặp lại tới khi script exit 0.
7. **Không cần chờ tự giác** — một PostToolUse hook (`.claude/settings.json` → `.claude/hooks/validate_testcases_on_write.sh`) tự động chạy lại script này mỗi khi file khớp `practices/testcases/**/TC_*.md` được Write/Edit, cảnh báo lỗi ngay qua `systemMessage`/`additionalContext` để agent tự sửa. Hook là lưới an toàn cuối — không thay thế việc agent chủ động audit trước khi báo hoàn thành.
8. **Test Title (schema FULL RBT, cột thứ 4) bắt buộc theo convention `Kiểm tra <hành động: thành công/thất bại/validate/chặn...> <đối tượng> với <loại dữ liệu>`** — không được viết cụt lủn kiểu mô tả thao tác UI thô (vd "Bấm 'Xem' điều hướng đúng Detail", "Feature flag OFF") vì không nói rõ kỳ vọng PASS gì, khiến việc quét nhanh hàng trăm TC để tìm đúng case rất chậm và dễ nhầm. Xem ví dụ đúng/sai đầy đủ tại `.claude/skills/rbt_manual_testing/SKILL.md` mục "Quy tắc đặt tên Test Title/Test Scenario". `validate_tc.py` tự động FAIL nếu Test Title không bắt đầu bằng "Kiểm tra", và tự động FAIL nếu Expected Result chứa cụm mơ hồ không thể verify được (vd "NEED CONFIRMATION", "ghi nhận hành vi thực tế", "chưa quy định rõ") thay vì chọn 1 default cụ thể kèm nhãn `[ASSUMPTION: ...]`.
9. **Pre-Condition (TC thuộc phạm vi UI) bắt buộc nêu đủ 3 thành phần: (a) User được sử dụng — tài khoản/role cụ thể đang đăng nhập; (b) Màn hình đang đứng — route/màn hình UI ngay trước khi Test Steps chạy; (c) Dữ liệu cần thiết phải có — giá trị/ID/số lượng cụ thể đã tồn tại sẵn, không dùng định lượng mơ hồ.** Rule ra đời sau khi rà soát `TC_PRC.md` (Wave 6) phát hiện Pre-Condition kiểu "Tenant có ≥1 log PRC đã chạy", "Bảng có dòng id=4521", "3 log ở 3 trạng thái khác nhau" — mô tả trạng thái trừu tượng, không nói rõ ai đang đăng nhập, đang đứng ở màn nào (vì Test Steps thường viết tắt thao tác trực tiếp trên UI như "Bấm icon 'Xem' ở dòng id=4521" mà không lặp lại bước điều hướng), và dữ liệu cụ thể nào phải setup sẵn — khiến người thực thi TC không thể chuẩn bị môi trường độc lập, phải tự đoán. Xem ví dụ đúng/sai đầy đủ tại `.claude/skills/rbt_manual_testing/SKILL.md` mục "Quy tắc nội dung Pre-Condition (UI)". `validate_tc.py` cảnh báo (WARNING) các dòng Pre-Condition trong file `.../ui/TC_*.md` thiếu 1 trong 3 thành phần trên.

10. **Nhóm Validate phải tách nhóm con theo TỪNG ĐƠN VỊ ĐƯỢC VALIDATE — áp dụng cho cả TC UI lẫn TC API.**
    Không được gộp toàn bộ test case validation của nhiều trường vào một khối liền. Cụ thể:
    - **UI:** mỗi trường trên form là 1 nhóm con (`Trường: Email`, `Trường: Số điện thoại`...),
      gom đủ checklist của trường đó (bỏ trống, whitespace-only, max length, ký tự đặc biệt,
      XSS/SQLi, trim space đầu/cuối) vào cùng nhóm con.
    - **API — header/tham số:** 1 nhóm con cho mỗi trường (`Header: transactionId`...).
    - **API — trường mandatory bên trong payload nhiều trường** (bản tin SWIFT, XML ISO 20022,
      JSON lồng nhau): 1 nhóm con cho mỗi bản tin/payload (`Bản tin MT195`, `Bản tin CAMT.110`...).
    - **API — tầng giao thức** (sai HTTP method, sai Content-Type, sai Accept): 1 nhóm con riêng.

    Rule ra đời sau khi rà soát bộ TC API AML (327 TC): nhóm Validate bị gộp thành block `MT`
    chứa 110 test case của 20 loại bản tin khác nhau — người review phải cuộn qua hàng trăm
    dòng mới tìm được trường mình cần xem. Mục đích của việc tách nhóm con là để **quét mắt
    tìm đúng trường cần xem**, nên block quá thô thì bảng TC quay về đúng vấn đề ban đầu:
    dài và không đọc được.

11. **Cột Pre-condition VÀ cột Test Data dùng gạch đầu dòng `-`, KHÔNG đánh số `1.` `2.` `3.`** —
    áp cho cả TC UI lẫn TC API. Đánh số chỉ dùng ở `Test Steps` (thứ tự thực hiện là bắt buộc) và
    `Expected result` (phải map 1-1 với số bước). Pre-condition là **tập điều kiện phải đồng thời
    đúng** trước khi test chạy, còn Test Data là **tập thành phần cấu thành request/dữ liệu cần
    chuẩn bị** — cả hai đều không có thứ tự thực hiện, nên đánh số gây hiểu nhầm là phải làm tuần
    tự và làm ô dữ liệu rườm rà. Riêng nội dung body (JSON/XML/bản tin SWIFT) nằm dưới dòng
    `- Body:` thì giữ nguyên định dạng gốc, không thêm gạch đầu dòng vào từng dòng body.
    `validate_tc.py` báo lỗi khi phát hiện Pre-condition hoặc Test Data còn đánh số.

12. **Ô nhiều dòng phải ngắt khối bằng 1 dòng trống.** Một **khối** bắt đầu ở dòng mở bằng
    `- ` hoặc `N. `; mọi dòng còn lại (thân JSON, thân bản tin SWIFT/XML, danh sách header)
    thuộc về khối ngay trước nó. Áp dụng:
    - `Pre-condition`, `Test Data`, `Expected result`: các khối **cách nhau đúng 1 dòng trống**.
    - `Test Steps`: mỗi bước một dòng riêng nhưng **chỉ xuống dòng 1 lần** giữa 2 bước —
      KHÔNG chèn dòng trống, vì các bước là một mạch trình tự liên tục, tách rời ra làm mất
      cảm giác thứ tự.
    - Trong khối `- Headers:` của `Test Data`, **mỗi header nằm trên một dòng riêng**.

    Rule ra đời sau khi bàn giao bộ TC API AML: nội dung ô đã có xuống dòng thật và ô Excel
    đã bật `wrapText`, nhưng các nhóm thông tin khác loại dính liền nhau thành một mảng chữ
    đặc nên người review không đọc nổi. "Có xuống dòng rồi" chưa đủ để kết luận ô đọc được.

13. **Pre-Condition của TC API chỉ có 2 thành phần: `User/Quyền` và `Dữ liệu có sẵn`** —
    **KHÔNG viết dòng `Trạng thái hệ thống`**. Nội dung dòng đó (service đang chạy, môi
    trường sẵn sàng, có/không kết nối DB) **giống hệt nhau ở mọi TC của cùng 1 API**, nên
    lặp lại hàng trăm lần chỉ làm ô dày thêm mà không thêm thông tin; nó thuộc về mục 1
    (Thông tin chung) và mục 5 (Ambiguities & Assumptions) của file `.md` bàn giao. Không
    nhúng credential (`Basic ...`, token, mật khẩu) vào Pre-Condition — credential thuộc về
    cột `Test Data`.

    Đây là **điểm khác biệt có chủ đích so với rule 9 (Pre-Condition của TC UI)**: TC UI vẫn
    bắt buộc đủ 3 thành phần vì "màn hình đang đứng" là thông tin riêng của từng TC, còn API
    không có khái niệm màn hình và "trạng thái hệ thống" lại là hằng số dùng chung.
    `validate_tc.py` cảnh báo khi TC API thiếu 1 trong 2 thành phần, hoặc khi còn sót dòng
    `Trạng thái hệ thống`.

14. **Mọi file `.xlsx` TC đầu ra (UI lẫn API) phải bật dấu `'` (quotePrefix) cho mọi ô**,
    tối thiểu `Pre-condition`, `Test Steps`, `Expected result` — không phụ thuộc file gốc của
    khách có hay không. Cả 2 converter đều tự bật qua `scripts/convert_excel/quote_prefix.js`;
    xuất `.xlsx` bằng cách khác thì phải tự set rồi kiểm tra lại trước khi bàn giao.

    Rule ra đời sau khi bàn giao `MSB_AML_TM_Create_Case_v1.1.xlsx`: converter API đã có
    quotePrefix từ trước, nhưng converter UI (`md_to_xlsx.js`) bị thiếu nên mọi file TC UI
    ra đời không có dấu `'`.

## Tham chiếu

- Skill chính: `.claude/skills/rbt_manual_testing/SKILL.md` — Bước 5 mục 6 (Traceability Coverage Audit), Bước 6 phần "BƯỚC 3: VALIDATE TRƯỚC KHI BÁO HOÀN THÀNH", mục "Quy tắc đặt tên Test Title/Test Scenario" (naming convention), mục "Quy tắc nội dung Pre-Condition (UI)" (3 thành phần bắt buộc).
- Nhánh API (rule 12–13): `.claude/skills/api_test_design/SKILL.md` (mục mapping cột) và `.claude/skills/api_test_design/references/API-Gen-TC-From-TD-v4.md` mục **2b. Quy tắc ngắt khối trong ô** + mục **5. "Pre-conditions"**.
- Script: `scripts/validate_testcases/validate_tc.py`.
- Hook: `.claude/hooks/validate_testcases_on_write.sh`, khai báo tại `.claude/settings.json` → `hooks.PostToolUse`.
