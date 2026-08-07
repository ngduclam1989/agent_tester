# Test Cases — Wave 6 — Nhóm Stock V2 Reports (Báo cáo tồn kho V2)

## 1. Thông tin chung

| Field | Value |
|---|---|
| Dự án | GARA (Garage Agentic) |
| Wave | W06 — Inventory V2 slice 4/4 |
| Module | Stock V2 Reports (boundary `gf-inventory`, read-only) |
| Sub-module | M6 STK-LIST-V2 (Web+Mobile) · M7 IP-VIEW-V2 (Web only) · M8 STK-DETAIL-V2 (Web only) |
| URL (Web) | `/inventory-stock/reports/at-date`, `/inventory-stock/reports/inout`, `/inventory-stock/reports/card/$productCode` |
| URL (Mobile) | `/inventory/stock-list`, `/inventory/stock-list/search`, `/inventory/stock-list/filter` |
| Tổng số TC | 71 |
| Kỹ thuật áp dụng | Equivalence Partitioning, Boundary Value Analysis (hide-rule OR SL/GT), Decision Table (OB-in-range) |
| Nguồn requirements | `requirements/gara/wave-06/wave-specs/` |
| Diagram tham chiếu | `practices/diagram/wave06-stock-v2-reports-activity.mermaid` / `.svg` |

## 2. Bảng tổng hợp Risk Level

| Module | Function | Validate | UI & Behavior | Phân quyền | Ảnh hưởng liên quan | Tổng TC |
|---|---|---|---|---|---|---|
| M6 STK-LIST-V2 | High (11) | Medium (3) | Medium (6) | High (3) | High (5) | 28 |
| M7 IP-VIEW-V2 | High (7) | Medium (3) | Medium (5) | High (2) | High (5) | 22 |
| M8 STK-DETAIL-V2 | High (9) | Medium (1) | Medium (4) | High (2) | High (5) | 21 |
| **Tổng** | **27** | **7** | **15** | **7** | **15** | **71** |

## 3. Tài khoản test / Test Data thiết yếu

| Loại | Giá trị | Ghi chú |
|---|---|---|
| Tài khoản garage-owner | `owner_test_20260804@gara.test` | |
| Tài khoản accountant | `accountant_test_20260804@gara.test` | |
| Tenant khác (test isolation) | `tenant2_owner_20260804@gara.test` | Dùng cho SC tenant isolation |
| Kho | "Kho Chính - CN Quận 1", "Kho Phụ - CN Quận 3" | |
| Mã đã chạy BQGQ | `PN-18901` | GT xuất > 0 |
| Mã chưa chạy BQGQ | `PN-18906` | GT xuất = 0 |
| Mã có SL=0 nhưng GT≠0 | `PN-18907` | Chênh làm tròn BQGQ, dùng test hide-rule OR |
| Ngày báo cáo mẫu | 04/08/2026 (hôm nay) | |
| Khoảng ngày NXT mẫu | 01/07/2026 - 31/07/2026 | |
| OB import trong khoảng lọc | Import OB ngày 15/07/2026 | Dùng test BR-STKV2-010 |

## 4. Traceability Matrix (tham chiếu)

Xem đầy đủ tại nội dung Bước 4 của phiên làm việc — REQ-25 đến REQ-40 map trực tiếp vào TC dưới đây.

## 5. Ambiguities & Q&A (đã xác nhận ở Bước 2)

| # | Vấn đề | Giải pháp áp dụng vào TC |
|---|---|---|
| Q6 | `productId` null ở IP-VIEW-V2 | TC chính (GARA_STOCKV2_TC_034) test hành vi hiện tại (không render link khi null); TC phụ (GARA_STOCKV2_TC_032) đánh dấu Blocked chờ backend hoàn thiện field `productId` |
| — | Row-cap export (50k/50k/10k) | OI-W06-BR-STKV2-002 — hành vi chưa chốt, KHÔNG đưa vào bộ TC chi tiết này, chỉ ghi chú Gap ở Traceability |

## 6. Bảng thống kê

| Priority | Số lượng |
|---|---|
| Critical | 11 |
| High | 31 |
| Medium | 19 |
| Low | 10 |
| **Tổng** | **71** |

---

## 7. Bảng Test Cases chi tiết

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|---|---|---|---|---|---|---|---|---|
| **NHÓM FUNCTION — M6 STK-LIST-V2 (Web)** | | | | | | | | |
| GARA_STOCKV2_TC_001 | M6 | High | Kiểm tra hiển thị filter mặc định thành công khi mở tab "Báo cáo tồn kho" | Tenant có data tồn kho | 1. Vào tab "Báo cáo tồn kho" | 1. Filter mặc định: ngày=hôm nay, kho=tất cả<br>2. Bảng 8 cột + dòng Tổng hiển thị | Critical | Ngày: 04/08/2026 |
| GARA_STOCKV2_TC_002 | M6 | High | Kiểm tra refetch dữ liệu thành công khi đổi filter search/kho/ngày | Bảng có data | 1. Gõ search "PN-189"<br>2. Chọn kho "Kho Chính - CN Quận 1"<br>3. Đổi ngày 01/08/2026 | 1. Refetch đúng theo từng filter, kết quả cập nhật | High | keyword: PN-189; ngày: 01/08/2026 |
| GARA_STOCKV2_TC_003 | M6 | High | Kiểm tra điều hướng đúng mã/kho thành công khi bấm "Xem lịch sử" | Dòng mã PN-18901, kho Kho Chính | 1. Bấm "Xem lịch sử" ở dòng PN-18901 | 1. Điều hướng `/inventory-stock/reports/card/PN-18901` kèm `warehouseCode` đúng | Critical | Mã: PN-18901 |
| GARA_STOCKV2_TC_004 | M6 | High | Kiểm tra xuất file "Báo cáo tồn kho.xlsx" thành công khi bấm "Xuất file" | Bảng có data | 1. Bấm "Xuất file" | 1. Tải file `Báo cáo tồn kho.xlsx` đúng mẫu, đúng filter hiện tại, không có cột "Thao tác" | High | N/A |
| GARA_STOCKV2_TC_005 | M6 | High | Kiểm tra hiển thị lỗi tải báo cáo thất bại với dữ liệu BE trả network/500 | Giả lập lỗi BE | 1. Mở tab khi BE lỗi | 1. Toast lỗi, giữ bảng cũ (nếu có) | Medium | N/A |
| GARA_STOCKV2_TC_006 | M6 | High | Kiểm tra disable nút "Xuất file" thành công khi filter không khớp mã nào (0 dòng dữ liệu) | Filter không khớp mã nào | 1. Search từ khóa không tồn tại | 1. Nút "Xuất file" disable | Medium | keyword: ZZZ-000 |
| **NHÓM FUNCTION — M6 STK-LIST-V2 (Mobile)** | | | | | | | | |
| GARA_STOCKV2_TC_007 | M6 | High | Kiểm tra mở StockListPage thành công khi tap tile "Tồn kho" trên hub | Flag `Inventory:InventoryV2` ON | 1. Mở hub `InventoryHubPage`<br>2. Tap tile "Tồn kho" | 1. Push route `StockListRoute`<br>2. `StockListCubit` fetch filter mặc định (hôm nay, tất cả kho) | Critical | N/A |
| GARA_STOCKV2_TC_008 | M6 | High | Kiểm tra hiển thị đúng thứ tự 4 dòng info trên card với dữ liệu ≥1 sản phẩm tồn | Có ≥1 sản phẩm tồn | 1. Quan sát 1 card | 1. Thứ tự: Kho → Số lượng tồn → ĐVT → Giá trị tồn | High | N/A |
| GARA_STOCKV2_TC_009 | M6 | High | Kiểm tra hiển thị đúng 3 trạng thái SearchPage thành công khi tap search icon | — | 1. Tap icon search<br>2. Chưa gõ gì<br>3. Gõ từ khóa không khớp<br>4. Gõ từ khóa khớp | 1. Trạng thái `hint` (gợi ý Mã/Tên SP)<br>2. `noResults` khi không khớp<br>3. `results` với đếm số lượng + list card khi khớp | High | keyword không khớp: ZZZ; keyword khớp: PN-189 |
| GARA_STOCKV2_TC_010 | M6 | High | Kiểm tra áp dụng filter Ngày+Kho thành công khi tap filter icon | — | 1. Tap icon filter<br>2. Chọn "Tồn đến ngày" = 01/08/2026<br>3. Chọn Kho<br>4. Bấm "Áp dụng" | 1. Pop về StockListPage<br>2. `StockListCubit` refetch với filter mới | High | Ngày: 01/08/2026 |
| GARA_STOCKV2_TC_011 | M6 | High | Kiểm tra reset filter về mặc định thành công khi bấm "Thiết lập lại" | Đã chọn ngày/kho khác mặc định | 1. Bấm "Thiết lập lại" | 1. Reset về filter mặc định (hôm nay, tất cả kho) | Medium | N/A |
| **NHÓM VALIDATE — M6 STK-LIST-V2** | | | | | | | | |
| GARA_STOCKV2_TC_012 | M6 | Medium | Kiểm tra filter ngày thành công với dữ liệu ngày hợp lệ 01/08/2026 | — | 1. Chọn ngày 01/08/2026 | 1. Refetch đúng `asOfDate` | Medium | Ngày: 01/08/2026 |
| GARA_STOCKV2_TC_013 | M6 | Medium | Kiểm tra filter search debounce 300ms và LIKE khớp mã/tên thành công | — | 1. Gõ liên tục "PN-1" rồi dừng | 1. Chỉ 1 query gửi đi sau khi dừng gõ ~300ms<br>2. LIKE khớp mã hoặc tên | Medium | keyword: PN-1 |
| GARA_STOCKV2_TC_014 | M6 | Medium | Kiểm tra filter kho multi-select thành công với dữ liệu 2 kho | 2 kho có data | 1. Chọn cả 2 kho | 1. Kết quả gồm data của cả 2 kho | Medium | Kho: Kho Chính + Kho Phụ |
| **NHÓM UI & BEHAVIOR — M6 STK-LIST-V2** | | | | | | | | |
| GARA_STOCKV2_TC_015 | M6 | Medium | Kiểm tra hiển thị GT tồn dạng số/0 thành công, không hiển thị text "Tạm tính" với dữ liệu mã chưa chạy BQGQ | Mã PN-18906 chưa chạy BQGQ | 1. Quan sát dòng PN-18906 | 1. GT tồn = số (kể cả 0), không có text "Tạm tính" | Medium | Mã: PN-18906 |
| GARA_STOCKV2_TC_016 | M6 | Medium | Kiểm tra hiển thị dòng Tổng đúng geometry 4-cell riêng biệt | Bảng có data | 1. Quan sát dòng Tổng | 1. Footer 4-cell riêng biệt bảng dữ liệu (không dùng grid 8 cột) | Low | N/A |
| GARA_STOCKV2_TC_017 | M6 | Medium | Kiểm tra hiển thị cột "ĐVT chính" đúng tên VN, fallback mã khi null | Mã có `mainUnitDisplayName` | 1. Quan sát cột ĐVT | 1. Hiển thị "Cái" (tên VN) thay vì "PCS" (mã thô)<br>2. Nếu null → fallback `mainUnitCode` | Medium | N/A |
| GARA_STOCKV2_TC_018 | M6 | Medium | Kiểm tra ẩn dòng Tổng thành công tại empty state khi filter không khớp | Filter không khớp | 1. Search từ khóa không tồn tại | 1. "Không có dữ liệu", KHÔNG có dòng Tổng, KHÔNG pagination | Medium | keyword: ZZZ-000 |
| GARA_STOCKV2_TC_019 | M6 | Medium | Kiểm tra link "Xem lịch sử" có đúng aria-label riêng theo từng mã | Bảng có nhiều dòng | 1. Inspect link ở 2 dòng khác nhau | 1. Mỗi link có `aria-label` chứa mã+kho riêng (không mơ hồ) | Low | N/A |
| GARA_STOCKV2_TC_020 | M6 | Medium | Kiểm tra semantics label+value đúng cho InfoRow trên Mobile | Card đang hiển thị | 1. Bật screen reader, focus vào 1 InfoRow | 1. Đọc đúng "$label $value" liền mạch | Low | N/A |
| **NHÓM PHÂN QUYỀN — M6 STK-LIST-V2** | | | | | | | | |
| GARA_STOCKV2_TC_021 | M6 | High | Kiểm tra phân quyền truy cập đầy đủ thành công cho vai trò garage-owner trên cả Web và Mobile | Tài khoản garage-owner | 1. Đăng nhập, mở báo cáo trên cả Web và Mobile | 1. Truy cập đầy đủ cả 2 platform | Critical | owner_test_20260804@gara.test |
| GARA_STOCKV2_TC_022 | M6 | High | Kiểm tra phân quyền truy cập đầy đủ thành công cho vai trò accountant trên cả Web và Mobile | Tài khoản accountant | 1. Đăng nhập, mở báo cáo trên cả Web và Mobile | 1. Giống hệt TC_021 | Critical | accountant_test_20260804@gara.test |
| GARA_STOCKV2_TC_023 | M6 | High | Kiểm tra ẩn action "Xem lịch sử"/"Xuất file" thành công trên Mobile | Mở StockListPage mobile | 1. Quan sát card | 1. Không có nút/onTap/chevron nào cho 2 action này (chỉ có ở Web) | High | N/A |
| **NHÓM ẢNH HƯỞNG CHỨC NĂNG LIÊN QUAN — M6 STK-LIST-V2** | | | | | | | | |
| GARA_STOCKV2_TC_024 | M6 | High | Kiểm tra hiển thị 2 dòng riêng biệt thành công với dữ liệu cùng mã tồn ở 2 kho | Mã PN-18901 tồn ở 2 kho | 1. Filter "Tất cả kho" | 1. 2 dòng riêng biệt, không gộp | High | Mã: PN-18901 |
| GARA_STOCKV2_TC_025 | M6 | High | Kiểm tra hiển thị dòng thành công theo hide-rule OR với dữ liệu SL=0 nhưng GT≠0 | Mã PN-18907 | 1. Filter ngày sao cho SL=0, GT còn chênh | 1. Mã PN-18907 vẫn xuất hiện trong bảng | High | Mã: PN-18907 |
| GARA_STOCKV2_TC_026 | M6 | High | Kiểm tra GT tồn cập nhật đúng thành công sau khi PRC chạy xong | Mã vừa được PRC tính giá | 1. So sánh GT tồn trước/sau khi PRC chạy | 1. GT tồn đổi từ 0 sang giá trị BQGQ thực | High | Mã: PN-18901 |
| GARA_STOCKV2_TC_027 | M6 | High | Kiểm tra ẩn 2 tab V1 khỏi menu thành công khi feature flag Inventory:InventoryV2 đang ON | Flag `Inventory:InventoryV2` ON | 1. Quan sát menu top-nav Web | 1. Tab V1 "Tồn kho" + "Tồn kho theo kỳ" không còn hiển thị | High | N/A |
| GARA_STOCKV2_TC_028 | Cross (M6/M7/M8) | High | Kiểm tra tenant isolation thành công — 2 tenant khác nhau chỉ thấy đúng dữ liệu garage của mình ở cả 3 báo cáo | Tenant A và Tenant B đều có data tồn kho | 1. Đăng nhập Tenant A, ghi nhận danh sách mã ở cả 3 báo cáo (M6/M7/M8)<br>2. Đăng nhập Tenant B (`tenant2_owner_20260804@gara.test`), xem lại 3 báo cáo | 1. Tenant B KHÔNG thấy bất kỳ dữ liệu nào của Tenant A (BR-STKV2-004)<br>2. Mỗi tenant chỉ thấy đúng garage của mình | High | tenant2_owner_20260804@gara.test |
| **NHÓM FUNCTION — M7 IP-VIEW-V2** | | | | | | | | |
| GARA_STOCKV2_TC_029 | M7 | High | Kiểm tra hiển thị filter mặc định tháng hiện tại thành công khi mở tab "Báo cáo NXT" | — | 1. Vào tab "Báo cáo NXT" | 1. Filter mặc định = tháng hiện tại (từ ngày 01 tới ngày cuối tháng, tính động)<br>2. Bảng 13 cột hiển thị | Critical | N/A |
| GARA_STOCKV2_TC_030 | M7 | High | Kiểm tra refetch dữ liệu thành công khi đổi filter search/kho/khoảng ngày | Bảng có data | 1. Đổi khoảng ngày 01/07/2026-31/07/2026 | 1. Refetch đúng, `page` reset 0 | High | Từ: 01/07/2026; Đến: 31/07/2026 |
| GARA_STOCKV2_TC_031 | M7 | High | Kiểm tra xuất file "Báo cáo nhập xuất tồn.xlsx" thành công khi bấm "Xuất file" | Bảng có data | 1. Bấm "Xuất file" | 1. Tải `Báo cáo nhập xuất tồn.xlsx` đúng mẫu | High | N/A |
| GARA_STOCKV2_TC_032 | M7 | High | Kiểm tra điều hướng thành công khi click "Mã SP nội bộ" với dữ liệu productId có giá trị (Blocked — chờ backend hoàn thiện field productId, hiện BE luôn trả null) | `productId` != null (giả định BE đã hoàn thiện, hiện tại KHÔNG thực thi được) | 1. Click "Mã SP nội bộ" | 1. Điều hướng `/inventory-catalog/internal-products/{id}` | Medium | N/A |
| GARA_STOCKV2_TC_033 | M7 | High | Kiểm tra hiển thị lỗi tải báo cáo thất bại với dữ liệu BE lỗi | Giả lập lỗi BE | 1. Mở tab khi BE lỗi | 1. Toast lỗi | Medium | N/A |
| GARA_STOCKV2_TC_034 | M7 | High | Kiểm tra hiển thị text thường không phải link thành công với dữ liệu productId = null (hành vi hiện tại) | Data hiện tại | 1. Quan sát cột "Mã SP nội bộ" | 1. Hiển thị plain text, KHÔNG màu xanh/hover-underline (đúng hành vi hiện tại vì BFF resolver luôn trả null) | High | N/A |
| GARA_STOCKV2_TC_035 | M7 | Medium | Kiểm tra hiển thị empty state thành công khi 0 dòng khớp filter | Filter không khớp | 1. Search "ZZZ-000" | 1. "Không có dữ liệu", ẩn dòng Tổng + pagination | Medium | keyword: ZZZ-000 |
| **NHÓM VALIDATE — M7 IP-VIEW-V2** | | | | | | | | |
| GARA_STOCKV2_TC_036 | M7 | Medium | Kiểm tra validate khoảng ngày thất bại khi fromDate > toDate | — | 1. Chọn Từ: 31/07/2026, Đến: 01/07/2026 | 1. Inline validation lỗi dưới chip khoảng ngày | Medium | Từ: 31/07/2026; Đến: 01/07/2026 |
| GARA_STOCKV2_TC_037 | M7 | Medium | Kiểm tra filter kho trả về tất cả kho thành công khi không chọn kho nào | — | 1. Không chọn kho nào | 1. Kết quả = tất cả kho | Low | N/A |
| GARA_STOCKV2_TC_038 | M7 | Medium | Kiểm tra filter search debounce 300ms thành công | — | 1. Gõ liên tục rồi dừng | 1. Chỉ 1 query sau khi dừng gõ | Low | keyword: PN-1 |
| **NHÓM UI & BEHAVIOR — M7 IP-VIEW-V2** | | | | | | | | |
| GARA_STOCKV2_TC_039 | M7 | Medium | Kiểm tra hiển thị đúng header bảng 2 tầng bắt buộc | Bảng có data | 1. Inspect header | 1. 5 cột định danh `rowSpan=2` + 4 nhóm `colSpan=2` | Medium | N/A |
| GARA_STOCKV2_TC_040 | M7 | Medium | Kiểm tra hiển thị đúng hậu tố "đ" cho cột Giá trị, không hậu tố cho cột Số lượng | Bảng có data | 1. Quan sát cột Giá trị vs Số lượng | 1. Giá trị: "1.500.000 đ" (cả body + Tổng)<br>2. Số lượng: không hậu tố | Medium | N/A |
| GARA_STOCKV2_TC_041 | M7 | Medium | Kiểm tra bảng giữ viewport-fixed và scroll ngang thành công khi resize màn hình hẹp | Màn hình hẹp | 1. Resize trình duyệt nhỏ lại | 1. Bảng không co lại, xuất hiện scroll ngang | Low | N/A |
| GARA_STOCKV2_TC_042 | M7 | Medium | Kiểm tra prefill khoảng ngày tính động theo ngày hiện tại thành công (không hardcode) | Mở tab ngày 04/08/2026 | 1. Quan sát filter mặc định | 1. Từ: 01/08/2026, Đến: 31/08/2026 (tính theo ngày hiện tại thật, không phải mẫu tĩnh Figma) | Medium | N/A |
| GARA_STOCKV2_TC_043 | M7 | Medium | Kiểm tra hiển thị loading state dạng skeleton table thành công, giữ nguyên page header | — | 1. Quan sát lúc đang tải | 1. Chỉ bảng hiện skeleton, header/filter vẫn hiển thị | Low | N/A |
| **NHÓM PHÂN QUYỀN — M7 IP-VIEW-V2** | | | | | | | | |
| GARA_STOCKV2_TC_044 | M7 | High | Kiểm tra phân quyền truy cập đầy đủ thành công cho vai trò garage-owner tại tab NXT | Tài khoản garage-owner | 1. Mở tab NXT | 1. Đầy đủ mọi control | Critical | owner_test_20260804@gara.test |
| GARA_STOCKV2_TC_045 | M7 | High | Kiểm tra phân quyền truy cập đầy đủ thành công cho vai trò accountant tại tab NXT | Tài khoản accountant | 1. Mở tab NXT | 1. Giống hệt TC_043 | Critical | accountant_test_20260804@gara.test |
| **NHÓM ẢNH HƯỞNG CHỨC NĂNG LIÊN QUAN — M7 IP-VIEW-V2** | | | | | | | | |
| GARA_STOCKV2_TC_046 | M7 | High | Kiểm tra hiển thị 2 dòng riêng biệt thành công với dữ liệu cùng mã ở 2 kho | Mã PN-18901 ở 2 kho | 1. Xem bảng NXT | 1. 2 dòng riêng biệt | High | Mã: PN-18901 |
| GARA_STOCKV2_TC_047 | M7 | High | Kiểm tra cộng đúng OB import vào nhóm Nhập kho thành công (không cộng vào Đầu kỳ) | OB import ngày 15/07/2026, filter 01/07-31/07/2026 | 1. Xem nhóm cột Nhập kho | 1. SL/GT của OB đó cộng vào **Nhập kho**, KHÔNG cộng vào Đầu kỳ (BR-STKV2-010, regression GAP-W06-GI-08) | High | Ngày OB: 15/07/2026 |
| GARA_STOCKV2_TC_048 | M7 | High | Kiểm tra hiển thị GT Xuất=0 và GT Đầu/Nhập là số thật thành công với dữ liệu mã chưa chạy BQGQ | Mã PN-18906 | 1. Xem dòng PN-18906 | 1. GT Xuất=0; GT Đầu/Nhập vẫn là số thật; GT Cuối = GT Đầu + GT Nhập | High | Mã: PN-18906 |
| GARA_STOCKV2_TC_049 | M7 | High | Kiểm tra đối chiếu Cuối kỳ NXT khớp đúng Tồn-đến-ngày (M6) thành công với dữ liệu cùng ngày | Cùng ngày X | 1. So sánh cột Cuối kỳ (đến ngày X) ở M7 vs SL/GT tồn ở M6 ngày X | 1. Số liệu khớp nhau tuyệt đối (cùng nguồn sổ tồn) | High | Ngày X: 31/07/2026 |
| GARA_STOCKV2_TC_050 | M7 | High | Kiểm tra GT Xuất chuyển từ 0 sang giá trị thực thành công sau khi PRC chạy xong | Mã vừa PRC | 1. So sánh trước/sau PRC | 1. GT Xuất đổi đúng | High | Mã: PN-18901 |
| **NHÓM FUNCTION — M8 STK-DETAIL-V2** | | | | | | | | |
| GARA_STOCKV2_TC_051 | M8 | High | Kiểm tra điều hướng full-page thành công (không modal) khi click "Xem lịch sử" | Từ M6 | 1. Click "Xem lịch sử" ở dòng PN-18901 | 1. Điều hướng full-page `/inventory-stock/reports/card/PN-18901`, KHÔNG mở popup/modal | Critical | Mã: PN-18901 |
| GARA_STOCKV2_TC_052 | M8 | High | Kiểm tra auto-fill khoảng ngày mặc định thành công theo tháng hiện tại | Mở màn ngày 04/08/2026 | 1. Quan sát range-picker | 1. Từ: 01/08/2026, Đến: 31/08/2026 | High | N/A |
| GARA_STOCKV2_TC_053 | M8 | High | Kiểm tra bảng running hiển thị đúng theo từng phiếu với dữ liệu ≥3 phiếu trong khoảng | Có ≥3 phiếu nhập/xuất trong khoảng | 1. Quan sát bảng | 1. Mỗi dòng = 1 phiếu, đúng thứ tự thời gian | High | N/A |
| GARA_STOCKV2_TC_054 | M8 | High | Kiểm tra refetch dữ liệu thành công khi đổi khoảng ngày | — | 1. Đổi khoảng ngày 01/07/2026-31/07/2026 | 1. Refetch đúng | High | Từ: 01/07/2026; Đến: 31/07/2026 |
| GARA_STOCKV2_TC_055 | M8 | High | Kiểm tra điều hướng đúng chi tiết phiếu nhập thành công khi click "Số phiếu" | Dòng slipType=RECEIPT | 1. Click "Số phiếu" | 1. Điều hướng đúng chi tiết phiếu nhập (`FEAT-IR-DETAIL-V2`) | High | N/A |
| GARA_STOCKV2_TC_056 | M8 | High | Kiểm tra điều hướng đúng chi tiết phiếu xuất thành công khi click "Số phiếu" | Dòng slipType=DELIVERY | 1. Click "Số phiếu" | 1. Điều hướng đúng chi tiết phiếu xuất (`FEAT-ID-DETAIL-V2`) | High | N/A |
| GARA_STOCKV2_TC_057 | M8 | High | Kiểm tra xuất file "Báo cáo thẻ kho.xlsx" thành công khi bấm "Xuất file" | Bảng có data | 1. Bấm "Xuất file" | 1. Tải `Báo cáo thẻ kho.xlsx` đúng mẫu | High | N/A |
| GARA_STOCKV2_TC_058 | M8 | High | Kiểm tra điều hướng quay lại M6 thành công khi bấm "Đóng" | — | 1. Bấm "Đóng" | 1. Điều hướng về `/inventory-stock/reports/at-date`, giữ filter cũ nếu router hỗ trợ | Medium | N/A |
| GARA_STOCKV2_TC_059 | M8 | High | Kiểm tra trả HTTP 200 với content rỗng thành công khi không có biến động trong khoảng lọc | Mã không có phiếu trong khoảng lọc | 1. Chọn khoảng ngày không có phiếu | 1. HTTP 200, `content:[]` (KHÔNG 404)<br>2. Dòng Tổng vẫn hiện, Đầu kỳ = Cuối kỳ | High | N/A |
| **NHÓM VALIDATE — M8 STK-DETAIL-V2** | | | | | | | | |
| GARA_STOCKV2_TC_060 | M8 | Medium | Kiểm tra chặn chọn ngược Đến<Từ trên range-picker thành công | — | 1. Thử chọn Đến < Từ trên range-picker | 1. UI chặn/tự điều chỉnh hợp lý (verify hành vi thực tế của component) | Low | N/A |
| **NHÓM UI & BEHAVIOR — M8 STK-DETAIL-V2** | | | | | | | | |
| GARA_STOCKV2_TC_061 | M8 | Medium | Kiểm tra ẩn filter/chip Kho thành công tại màn Thẻ kho | Màn đã mở | 1. Quan sát toàn màn | 1. Không có control chọn/hiển thị Kho (kho xác định ngầm qua route param) | Medium | N/A |
| GARA_STOCKV2_TC_062 | M8 | Medium | Kiểm tra chặn chọn mã trực tiếp thành công tại màn Thẻ kho | Màn đã mở | 1. Tìm control chọn mã | 1. Không tồn tại — mã cố định từ route param nguồn | Medium | N/A |
| GARA_STOCKV2_TC_063 | M8 | Medium | Kiểm tra hiển thị đúng style link cho "Số phiếu" và text thường cho "Mã SP nội bộ" | Bảng có data | 1. Quan sát 2 cột | 1. "Số phiếu" màu brand-blue (link); "Mã SP nội bộ" text thường (không phải link) | Low | N/A |
| GARA_STOCKV2_TC_064 | M8 | Medium | Kiểm tra focus tự động vào tiêu đề `<h1>` thành công khi route mount | Điều hướng vào màn | 1. Điều hướng từ M6 | 1. Focus tự động vào tiêu đề "Xem lịch sử tồn kho" (screen reader announce) | Low | N/A |
| **NHÓM PHÂN QUYỀN — M8 STK-DETAIL-V2** | | | | | | | | |
| GARA_STOCKV2_TC_065 | M8 | High | Kiểm tra phân quyền truy cập đầy đủ thành công cho vai trò garage-owner tại màn Thẻ kho | Tài khoản garage-owner | 1. Mở Thẻ kho | 1. Đầy đủ control | Critical | owner_test_20260804@gara.test |
| GARA_STOCKV2_TC_066 | M8 | High | Kiểm tra phân quyền truy cập đầy đủ thành công cho vai trò accountant tại màn Thẻ kho | Tài khoản accountant | 1. Mở Thẻ kho | 1. Giống hệt TC_064 | Critical | accountant_test_20260804@gara.test |
| **NHÓM ẢNH HƯỞNG CHỨC NĂNG LIÊN QUAN — M8 STK-DETAIL-V2** | | | | | | | | |
| GARA_STOCKV2_TC_067 | M8 | High | Kiểm tra running balance đúng thành công: Cuối kỳ dòng trước khớp Đầu kỳ dòng sau | ≥3 phiếu trong khoảng | 1. Đối chiếu 2 dòng liên tiếp | 1. Cuối kỳ dòng N = Đầu kỳ dòng N+1 | High | N/A |
| GARA_STOCKV2_TC_068 | M8 | High | Kiểm tra Đầu kỳ dòng đầu tiên tra đúng sổ tồn thành công | Có biến động trước khoảng lọc | 1. Kiểm tra Đầu kỳ dòng đầu tiên | 1. Khớp tồn tại thời điểm (Từ ngày - 1) theo sổ tồn | High | N/A |
| GARA_STOCKV2_TC_069 | M8 | High | Kiểm tra reconciliation thành công: Cuối kỳ dòng cuối ngày D khớp tồn cuối ngày D (M6) | Cùng ngày D | 1. So sánh dòng phiếu cuối cùng của ngày D vs SL/GT ở M6 ngày D | 1. Khớp tuyệt đối | High | Ngày D: 31/07/2026 |
| GARA_STOCKV2_TC_070 | M8 | High | Kiểm tra hiển thị GT Xuất=0 và GT Cuối = GT Đầu+Nhập thành công với dữ liệu mã chưa chạy BQGQ | Mã PN-18906 | 1. Xem dòng phiếu xuất của PN-18906 | 1. GT Xuất=0, GT Cuối kỳ = GT Đầu + GT Nhập | High | Mã: PN-18906 |
| GARA_STOCKV2_TC_071 | M8 | High | Kiểm tra GT Xuất các dòng cập nhật đúng thành công sau khi PRC chạy xong | Mã vừa PRC | 1. So sánh trước/sau PRC | 1. GT Xuất đổi từ 0 sang giá trị BQGQ thực ở từng dòng phiếu | High | Mã: PN-18901 |
