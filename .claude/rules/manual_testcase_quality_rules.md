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

## Tham chiếu

- Skill chính: `.claude/skills/rbt_manual_testing/SKILL.md` — Bước 5 mục 6 (Traceability Coverage Audit), Bước 6 phần "BƯỚC 3: VALIDATE TRƯỚC KHI BÁO HOÀN THÀNH", mục "Quy tắc đặt tên Test Title/Test Scenario" (naming convention), mục "Quy tắc nội dung Pre-Condition (UI)" (3 thành phần bắt buộc).
- Script: `scripts/validate_testcases/validate_tc.py`.
- Hook: `.claude/hooks/validate_testcases_on_write.sh`, khai báo tại `.claude/settings.json` → `hooks.PostToolUse`.
