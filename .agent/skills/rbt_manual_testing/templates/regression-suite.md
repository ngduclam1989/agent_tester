# Định nghĩa regression suite

## Mục đích

- Test suite này bảo vệ những gì (hành trình quan trọng của người dùng, dòng doanh thu, sự tuân thủ)

## Phạm vi

- Trong phạm vi/ngoài phạm vi
- Platforms/browsers/devices được coverage

## Các cấp độ và ý định của test suite

- **Smoke**: kiểm tra đường tới hạn ở mức tối thiểu (nhanh, chọn cổng)
- **Sanity**: xác minh build sau khi thay đổi (được nhắm mục tiêu)
- **Regression**: phạm vi bao phủ rộng khắp các khu vực ổn định, có giá trị cao
- **Đầy đủ**: mức độ bao phủ ở mức phát hành (có thể bao gồm cả phần mở rộng không có chức năng)

## Tiêu chí lựa chọn (risk-based)

- Mức độ rủi ro (tác động × khả năng xảy ra)
- Tần suất sử dụng và mức độ quan trọng trong kinh doanh
- Lịch sử lỗi/tỷ lệ thoát
- Thay đổi điểm phát sóng và điểm tích hợp
- Tính ổn định cho tự động hóa (đối với các tập hợp con tự động)

## Thẻ và thực thi

- Quy ước thẻ (ví dụ): `@smoke`, `@sanity`, `@regression`, `@full`
- Ví dụ về Playwright:
  - `npx playwright test --grep @smoke`
  - `npx playwright test --grep @regression`

## Quy định bảo trì

- Thêm test regression khi: escaped defects ra, tính năng có rủi ro cao xuất hiện, các thay đổi quan trọng về luồng
- Xóa hoặc viết lại các test khi: hành vi lỗi thời, khu vực flaky/unstable, coverage trùng lặp
- Xem lại nhịp độ và quyền sở hữu

## quyền sở hữu

- Chủ căn hộ:
- Người đóng góp:
