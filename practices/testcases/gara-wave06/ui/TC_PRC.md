# Test Cases — Wave 6 — Nhóm PRC (Tính giá xuất kho BQGQ)

## 1. Thông tin chung

| Field | Value |
|---|---|
| Dự án | GARA (Garage Agentic) |
| Wave | W06 — Inventory V2 slice 4/4 |
| Module | PRC — Tính giá xuất kho bình quân gia quyền cuối kỳ (boundary `gf-accounting`) |
| Sub-module | M1 PRC-LIST · M2 PRC-CREATE · M3 PRC-DETAIL · M4 PRC-RECALC · M5 PRC-DELETE |
| URL (Web) | `/inventory/price-calc-runs`, `/inventory/price-calc-runs/create`, `/inventory/price-calc-runs/:id` |
| Platform | Web GMS only (PRC không có mobile scope trong W06) |
| Tổng số TC | 122 |
| Kỹ thuật áp dụng | Equivalence Partitioning, Boundary Value Analysis, Decision Table (RECALC scope, error-reason enum), State Transition (log status PENDING→RUNNING→SUCCEEDED/COMPLETED_WITH_ERRORS) |
| Nguồn requirements | `requirements/gara/wave-06/wave-specs/` |
| Diagram tham chiếu | `practices/diagram/wave06-prc-lifecycle-activity.mermaid` / `.svg` |

## 2. Bảng tổng hợp Risk Level

| Module | Function | Validate | UI & Behavior | Phân quyền | Ảnh hưởng liên quan | Tổng TC |
|---|---|---|---|---|---|---|
| M1 PRC-LIST | High (8) | Medium (4) | Medium (8) | High (3) | High (4) | 27 |
| M2 PRC-CREATE | High (16) | Medium (6) | Medium (6) | High (2) | High (2) | 32 |
| M3 PRC-DETAIL | High (15) | Medium (3) | Medium (5) | High (2) | High (5) | 30 |
| M4 PRC-RECALC | High (7) | N/A (0 — không có field) | Medium (4) | High (2) | High (4) | 17 |
| M5 PRC-DELETE | High (7) | N/A (1 — dialog không có field, ghi rõ) | Medium (5) | High (2) | High (1) | 16 |
| **Tổng** | **53** | **14** | **28** | **11** | **16** | **122** |

> Số liệu bảng trên đã tính lại trực tiếp từ nội dung bảng TC thật ở mục 7 (script đếm tự động) — không phải ước lượng.

## 3. Tài khoản test / Test Data thiết yếu

| Loại | Giá trị | Ghi chú |
|---|---|---|
| Tài khoản garage-owner | `owner_test_20260804@gara.test` | Full quyền |
| Tài khoản accountant | `accountant_test_20260804@gara.test` | Quyền ngang garage-owner (BR-AP-CMN-002) |
| Kỳ kế toán mở | "Tháng 07/2026" (01/07/2026 - 31/07/2026) | Dùng cho happy path |
| Kỳ kế toán đã đóng | "Tháng 06/2026" (01/06/2026 - 30/06/2026) | Dùng cho negative test `ERR-INV-024` |
| Kho | "Kho Chính - CN Quận 1" | |
| Kho phụ | "Kho Phụ - CN Quận 3" | Dùng cho test tách kho |
| Mã BQGQ đang hoạt động | `PN-18901` (Phương pháp tính giá = Bình quân cuối kỳ, Trạng thái = Đang hoạt động) | |
| Mã ngừng hoạt động | `PN-18902` (Trạng thái = Ngừng hoạt động) | Dùng cho negative/edge |
| Mã không có phiếu nào trong kỳ | `PN-18903` | Dùng cho case mẫu số=0 |

## 4. Traceability Matrix (tham chiếu)

Xem đầy đủ tại nội dung Bước 4 của phiên làm việc — REQ-01 đến REQ-24b, REQ-44 đến REQ-49 map trực tiếp vào các TC dưới đây (cột Module + Test Title tương ứng REQ đã liệt kê).

## 5. Ambiguities & Q&A (đã xác nhận ở Bước 2)

| # | Vấn đề | Giải pháp áp dụng vào TC |
|---|---|---|
| Q1 | Label lệch giữa 2 nguồn (nút xác nhận xóa, nút hủy) | TC dùng đúng text theo tier-spec (Figma-derived): "Xác nhận xoá", "Huỷ bỏ" — có TC riêng verify label (GARA_PRC_TC_119 — Xác nhận xoá; GARA_PRC_TC_051 — Huỷ bỏ) |
| Q2 | Test data BQGQ hội tụ | Pre-condition ghi rõ chuỗi phiếu cần dựng (GARA_PRC_TC_064) |
| Q3 | Safety cap 100 vòng | Không đưa vào bộ TC UI này — out of scope Manual UI (ghi trong Traceability Gap Analysis) |
| Q4 | Concurrency 2 request đồng thời | GARA_PRC_TC_106, Priority Medium, best-effort |
| Q5 | Temporal crash resilience | Out of scope Manual UI Test |
| Q6 | `productId` null ở NXT | Áp dụng cho module Stock V2 (xem `TC_STOCK-V2-REPORTS.md`) |

## 6. Bảng thống kê

| Priority | Số lượng |
|---|---|
| Critical | 24 |
| High | 46 |
| Medium | 29 |
| Low | 22 |
| N/A | 1 |
| **Tổng** | **122** |

> Dòng "N/A" duy nhất là GARA_PRC_TC_108 (M5, nhóm Validate — dialog không có input field nên không áp dụng risk level/priority).

---

## 7. Bảng Test Cases chi tiết

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|---|---|---|---|---|---|---|---|---|
| **NHÓM FUNCTION — M1 PRC-LIST** | | | | | | | | |
| GARA_PRC_TC_001 | M1 | High | Kiểm tra hiển thị màn PRC-LIST thành công với dữ liệu đã có log tính giá | Tenant có ≥1 log PRC đã chạy | 1. Đăng nhập garage-owner<br>2. Vào menu "Kho hàng" → "Tính giá xuất kho" | 1. Route `/inventory/price-calc-runs` load thành công<br>2. Bảng hiển thị đúng 11 cột: STT, Kỳ kế toán, Từ ngày, Đến ngày, Kho, Phương pháp tính giá vốn, Tài khoản thực hiện, Ngày giờ thực hiện, Số mã, Trạng thái, Thao tác<br>3. Sort mặc định theo Ngày giờ thực hiện giảm dần | Critical | owner_test_20260804@gara.test |
| GARA_PRC_TC_002 | M1 | High | Kiểm tra hiển thị empty state thành công tại PRC-LIST khi chưa có log nào | Tenant mới, chưa từng chạy PRC | 1. Vào route `/inventory/price-calc-runs` | 1. Hiển thị empty state, text verbatim "Không có dữ liệu"<br>2. Không hiển thị pagination | High | N/A |
| GARA_PRC_TC_003 | M1 | High | Kiểm tra hiển thị 2 dòng riêng biệt thành công với dữ liệu 2 log cùng (kỳ+kho) | Đã chạy Tính giá 2 lần cho cùng Kỳ+Kho | 1. Vào PRC-LIST | 1. Hiển thị 2 dòng riêng biệt (BR-PRC-010), log chạy sau nằm trên | High | Kỳ: Tháng 07/2026; Kho: Kho Chính - CN Quận 1 |
| GARA_PRC_TC_004 | M1 | High | Kiểm tra điều hướng sang màn Detail thành công khi bấm icon "Xem" | Bảng có dòng id=4521 | 1. Bấm icon "Xem" ở dòng id=4521 | 1. Điều hướng tới `/inventory/price-calc-runs/4521`<br>2. Không gọi GraphQL nào tại LIST trước khi điều hướng | Critical | id=4521 |
| GARA_PRC_TC_005 | M1 | High | Kiểm tra điều hướng sang màn Create thành công khi bấm CTA "Tính giá" | — | 1. Bấm nút "Tính giá" ở page header | 1. Điều hướng tới `/inventory/price-calc-runs/create` | Critical | N/A |
| GARA_PRC_TC_006 | M1 | High | Kiểm tra mở dialog xác nhận xóa thành công khi bấm icon "Xóa" | Bảng có ≥1 dòng | 1. Bấm icon "Xóa" ở 1 dòng | 1. Mở dialog xác nhận đúng dữ liệu dòng đã chọn (kỳ, kho trong nội dung dialog) | Critical | N/A |
| GARA_PRC_TC_007 | M1 | High | Kiểm tra hiển thị lỗi tải danh sách thất bại với dữ liệu BE trả network/500 | Giả lập BE trả lỗi 500 | 1. Vào route PRC-LIST khi BE lỗi | 1. Toast lỗi tải danh sách<br>2. Không crash trang, không hiện bảng như thành công | High | N/A |
| GARA_PRC_TC_008 | M1 | High | Kiểm tra xóa log thất bại với dữ liệu log đã bị user khác xóa trước (`ERR-CMN-not-found`) | 2 user cùng mở LIST, user B xóa trước | 1. User A bấm "Xóa" cùng dòng user B vừa xóa<br>2. User A xác nhận xóa | 1. Toast lỗi không tìm thấy bản ghi<br>2. Dialog đóng<br>3. LIST tự refetch, dòng không còn | Medium | N/A |
| **NHÓM VALIDATE — M1 PRC-LIST** | | | | | | | | |
| GARA_PRC_TC_009 | M1 | Medium | Kiểm tra validate filter "Ngày thực hiện" thất bại khi executedFrom > executedTo | Bảng có data nhiều ngày | 1. Mở filter "Ngày thực hiện"<br>2. Chọn Từ: 31/07/2026, Đến: 01/07/2026 | 1. Hiển thị lỗi validate trước khi gọi query<br>2. Không gọi `priceCalcRunList` với input sai | Medium | Từ: 31/07/2026; Đến: 01/07/2026 |
| GARA_PRC_TC_010 | M1 | Medium | Kiểm tra filter "Ngày thực hiện" thành công với khoảng ngày hợp lệ | Bảng có data trong khoảng | 1. Chọn Từ: 01/07/2026, Đến: 31/07/2026 | 1. Gọi lại query đúng `executedFrom/executedTo`<br>2. `page` reset về 0<br>3. Bảng chỉ hiện log trong khoảng | High | Từ: 01/07/2026; Đến: 31/07/2026 |
| GARA_PRC_TC_011 | M1 | Medium | Kiểm tra hiển thị dropdown filter "Phương pháp" thành công với dữ liệu chỉ có 1 option | — | 1. Mở dropdown "Phương pháp" | 1. Chỉ hiển thị 1 option "Phương pháp bình quân cuối kỳ"<br>2. Chọn được, không lỗi | Low | N/A |
| GARA_PRC_TC_012 | M1 | Medium | Kiểm tra kết hợp 2 filter "Phương pháp" + "Ngày thực hiện" thành công theo điều kiện AND | Data đa dạng | 1. Chọn "Phương pháp" + khoảng ngày 01/07/2026-31/07/2026 | 1. Kết quả thỏa cả 2 điều kiện (AND) | Medium | Từ: 01/07/2026; Đến: 31/07/2026 |
| **NHÓM UI & BEHAVIOR — M1 PRC-LIST** | | | | | | | | |
| GARA_PRC_TC_013 | M1 | Medium | Kiểm tra hiển thị đúng badge trạng thái với dữ liệu 3 log ở 3 trạng thái khác nhau | 3 log ở 3 trạng thái khác nhau | 1. Quan sát cột "Trạng thái" | 1. PENDING/RUNNING → "Đang tính"<br>2. SUCCEEDED → "Thành công"<br>3. COMPLETED_WITH_ERRORS → "Hoàn thành có lỗi", 3 màu semantic + text kèm | Medium | N/A |
| GARA_PRC_TC_014 | M1 | Low | Kiểm tra semantic HTML đúng chuẩn cho heading và table header tại PRC-LIST | — | 1. Inspect DOM | 1. Page title dùng `<h1>`<br>2. Header cột dùng `<th scope="col">` | Low | N/A |
| GARA_PRC_TC_015 | M1 | Low | Kiểm tra icon action Xem/Xóa có đúng thuộc tính aria-label | Bảng có data | 1. Inspect icon Xem/Xóa | 1. Icon "Xem" có `aria-label="Xem chi tiết"`<br>2. Icon "Xóa" có `aria-label="Xóa lần tính"` | Low | N/A |
| GARA_PRC_TC_016 | M1 | Medium | Kiểm tra hiển thị empty state đúng test-id và text verbatim khi chưa có log | Tenant chưa có log | 1. Vào LIST | 1. Text "Không có dữ liệu" đúng verbatim<br>2. Test id `table-price-calc-runs` tồn tại | Medium | N/A |
| GARA_PRC_TC_017 | M1 | Medium | Kiểm tra pagination reset về trang 0 thành công khi đổi page-size với dữ liệu ≥25 dòng | ≥25 dòng data | 1. Đang ở trang 2 (size 20)<br>2. Đổi page-size sang 50 | 1. Refetch `page=0, size=50`<br>2. Tổng trang/phần tử đúng theo response | Medium | page-size: 50 |
| GARA_PRC_TC_018 | M1 | Low | Kiểm tra hiển thị loading state dạng skeleton bảng khi PRC-LIST đang tải | — | 1. Mở LIST, quan sát lúc tải | 1. Chỉ vùng bảng hiện skeleton<br>2. Filter bar + header hiển thị bình thường | Low | N/A |
| GARA_PRC_TC_019 | M1 | Low | Kiểm tra tab order đúng thứ tự DOM tại màn PRC-LIST | — | 1. Tab liên tục từ đầu trang | 1. Thứ tự: filter Phương pháp → filter Ngày thực hiện → bảng → pagination → action buttons | Low | N/A |
| GARA_PRC_TC_020 | M1 | Low | Kiểm tra focus-trap và focus trả về đúng thành công khi thao tác dialog xác nhận xóa | Bảng có data | 1. Bấm "Xóa"<br>2. Tab liên tục trong dialog<br>3. Đóng dialog (Hủy) | 1. Focus không thoát dialog khi mở<br>2. Sau đóng, focus quay lại đúng button "Xóa" | Low | N/A |
| **NHÓM PHÂN QUYỀN — M1 PRC-LIST** | | | | | | | | |
| GARA_PRC_TC_021 | M1 | High | Kiểm tra phân quyền truy cập đầy đủ thành công cho vai trò garage-owner tại PRC-LIST | Tài khoản garage-owner | 1. Đăng nhập garage-owner<br>2. Vào PRC-LIST | 1. Thấy đủ bảng + filter + CTA "Tính giá" + action Xem/Xóa | Critical | owner_test_20260804@gara.test |
| GARA_PRC_TC_022 | M1 | High | Kiểm tra phân quyền truy cập đầy đủ thành công cho vai trò accountant tại PRC-LIST | Tài khoản accountant | 1. Đăng nhập accountant<br>2. Vào PRC-LIST | 1. KHÔNG control nào bị ẩn/khóa so với TC_021 | Critical | accountant_test_20260804@gara.test |
| GARA_PRC_TC_023 | M1 | High | Kiểm tra chặn truy cập route PRC-LIST thành công khi feature flag Inventory:InventoryV2 đang OFF | Tenant chưa bật `Inventory:InventoryV2` | 1. Truy cập route PRC-LIST khi flag OFF | 1. Route không truy cập được / empty-state (`FORBIDDEN_ERROR`) | High | N/A |
| **NHÓM ẢNH HƯỞNG CHỨC NĂNG LIÊN QUAN — M1 PRC-LIST** | | | | | | | | |
| GARA_PRC_TC_024 | M1 | High | Kiểm tra LIST cập nhật đúng dòng mới ở đầu bảng thành công sau khi CREATE | Vừa tạo 1 lần tính mới ở M2 | 1. Từ Detail bấm back về LIST | 1. Dòng vừa tạo xuất hiện đầu bảng (sort desc) | High | N/A |
| GARA_PRC_TC_025 | M1 | High | Kiểm tra LIST cập nhật đúng thành công sau khi xóa 1 dòng không phải dòng cuối trang | Trang có 20 dòng, xóa 1 dòng giữa | 1. Xóa 1 log không phải dòng cuối trang | 1. LIST mất đúng 1 dòng, giữ nguyên filter + trang | High | N/A |
| GARA_PRC_TC_026 | M1 | High | Kiểm tra LIST tự động lùi trang thành công khi xóa dòng duy nhất của trang cuối | Trang cuối chỉ còn 1 dòng | 1. Xóa dòng duy nhất của trang cuối | 1. LIST tự lùi về trang trước | Medium | N/A |
| GARA_PRC_TC_027 | M1 | High | Kiểm tra LIST hiển thị đúng cả log cũ lẫn mới thành công sau khi RECALC | Đã RECALC 1 log | 1. Quay lại LIST | 1. 2 dòng riêng biệt (BR-PRC-010) — không ghi đè | High | N/A |
| **NHÓM FUNCTION — M2 PRC-CREATE** | | | | | | | | |
| GARA_PRC_TC_028 | M2 | High | Kiểm tra mở form CREATE thành công khi bấm CTA "Tính giá" | — | 1. Bấm "Tính giá" ở LIST | 1. Route `/inventory/price-calc-runs/create` load<br>2. 2 section: "Thông tin kỳ tính giá" + "Vật tư hàng hoá cần tính giá" | Critical | N/A |
| GARA_PRC_TC_029 | M2 | High | Kiểm tra tự động khóa Từ ngày/Đến ngày thành công khi chọn Kỳ kế toán "Tháng 07/2026" | Kỳ "Tháng 07/2026" tồn tại | 1. Chọn Kỳ kế toán "Tháng 07/2026" | 1. Từ ngày = 01/07/2026, Đến ngày = 31/07/2026 tự điền<br>2. 2 input chuyển disabled, không gõ được | Critical | Kỳ: Tháng 07/2026 |
| GARA_PRC_TC_030 | M2 | High | Kiểm tra tự động chọn Phương pháp mặc định thành công khi chọn Kho | — | 1. Chọn Kho "Kho Chính - CN Quận 1" | 1. Phương pháp mặc định chọn sẵn "Phương pháp bình quân cuối kỳ" | High | Kho: Kho Chính - CN Quận 1 |
| GARA_PRC_TC_031 | M2 | High | Kiểm tra ẩn bảng vật tư thành công khi chọn Phạm vi vật tư = "Tất cả mã" | — | 1. Chọn Phạm vi vật tư = "Tất cả mã" | 1. Bảng "Vật tư hàng hoá cần tính giá" ẩn/không dùng<br>2. Nút "Thêm phụ tùng" ẩn/disable | High | N/A |
| GARA_PRC_TC_032 | M2 | High | Kiểm tra hiển thị bảng vật tư thành công khi chọn Phạm vi vật tư = "Chọn mã cụ thể" | — | 1. Chọn Phạm vi vật tư = "Chọn mã cụ thể" | 1. Bảng 7 cột + nút "Thêm phụ tùng" active | High | N/A |
| GARA_PRC_TC_033 | M2 | High | Kiểm tra thêm dòng vật tư thành công với mã nội bộ hợp lệ PN-18901 | Scope = Chọn mã cụ thể | 1. Bấm "Thêm phụ tùng"<br>2. Chọn mã `PN-18901` | 1. Dòng mới thêm<br>2. 4 cột (Tên SP, ĐVT, Có phát sinh xuất, Lần tính gần nhất) auto-fill readonly | High | Mã: PN-18901 |
| GARA_PRC_TC_034 | M2 | High | Kiểm tra xóa dòng vật tư thành công với dữ liệu dòng vừa thêm chưa submit | Đã thêm ≥1 dòng | 1. Bấm icon xóa (Trash) trên dòng vừa thêm | 1. Dòng biến mất khỏi bảng (client state, chưa gọi API) | Medium | N/A |
| GARA_PRC_TC_035 | M2 | High | Kiểm tra submit CREATE thành công với Phạm vi vật tư = "Tất cả mã" | Kỳ mở, Kho hợp lệ | 1. Điền đủ Kỳ+Kho, scope="Tất cả mã"<br>2. Bấm "Thực hiện tính giá" | 1. Nhận 202 Accepted<br>2. Redirect `/inventory/price-calc-runs/{runId}` (Detail run mới) | Critical | Kỳ: Tháng 07/2026; Kho: Kho Chính - CN Quận 1 |
| GARA_PRC_TC_036 | M2 | High | Kiểm tra submit CREATE thành công với Phạm vi vật tư = "Chọn mã cụ thể" và dữ liệu 3 mã | Kỳ mở, đã thêm 3 mã hợp lệ | 1. Bấm "Thực hiện tính giá" | 1. 202 Accepted, redirect Detail run mới | Critical | Mã: PN-18901, PN-18904, PN-18905 |
| GARA_PRC_TC_037 | M2 | High | Kiểm tra submit CREATE thành công cho kỳ N với dữ liệu kỳ N-1 chưa từng tính giá | Kỳ N-1 "Tháng 06/2026" chưa có log PRC nào; Kỳ N "Tháng 07/2026" mở | 1. Chọn Kỳ "Tháng 07/2026", điền đủ Kho + scope hợp lệ<br>2. Bấm "Thực hiện tính giá" | 1. Không bị chặn dù kỳ trước chưa tính (BR-PRC-006)<br>2. 202 Accepted, redirect Detail bình thường | High | Kỳ: Tháng 07/2026 (kỳ N-1 "Tháng 06/2026" chưa tính) |
| GARA_PRC_TC_038 | M2 | High | Kiểm tra chặn tạo trùng job thành công khi double-click nút Submit liên tiếp | Form hợp lệ | 1. Bấm "Thực hiện tính giá" 2 lần liên tiếp nhanh | 1. Chỉ 1 job thực sự được tạo (idempotency-key)<br>2. Không tạo 2 run trùng | High | N/A |
| GARA_PRC_TC_039 | M2 | High | Kiểm tra chặn submit CREATE thất bại khi Phạm vi = "Chọn mã cụ thể" nhưng bảng vật tư rỗng | Scope=SPECIFIC, chưa thêm dòng nào | 1. Bấm "Thực hiện tính giá" | 1. Nút Submit disable / chặn, không gọi API | High | N/A |
| GARA_PRC_TC_040 | M2 | High | Kiểm tra submit CREATE thất bại với dữ liệu Kỳ kế toán đã đóng | Kỳ "Tháng 06/2026" đã đóng | 1. Chọn Kỳ đã đóng, điền đủ Kho<br>2. Bấm Submit | 1. Inline error tại section "Thông tin kỳ tính giá"<br>2. Form giữ nguyên, không redirect | High | Kỳ: Tháng 06/2026 (đã đóng) |
| GARA_PRC_TC_041 | M2 | High | Kiểm tra submit CREATE thất bại khi đã có job PENDING chạy cùng kỳ+kho | Đang có 1 job PENDING cùng (kỳ, kho) | 1. Submit form cùng kỳ+kho đang chạy | 1. Dialog "Đang có lần tính giá chạy cho kỳ + kho này" (`ERR-INV-029`)<br>2. Form giữ nguyên | High | Kỳ: Tháng 07/2026; Kho: Kho Chính - CN Quận 1 |
| GARA_PRC_TC_042 | M2 | High | Kiểm tra hiển thị toast cảnh báo thành công với dữ liệu response có affectedSubsequentPeriods | Kỳ sau đã có log tính trước | 1. Submit form cho kỳ N | 1. Toast cảnh báo liệt kê `periodName` kỳ sau cần tính lại<br>2. Vẫn redirect sang Detail | Medium | N/A |
| GARA_PRC_TC_043 | M2 | High | Kiểm tra hủy form CREATE thành công khi bấm nút "Huỷ bỏ" | — | 1. Bấm nút "Huỷ bỏ" | 1. Điều hướng về `/inventory/price-calc-runs`<br>2. Không gọi mutation | High | N/A |
| **NHÓM VALIDATE — M2 PRC-CREATE** | | | | | | | | |
| GARA_PRC_TC_044 | M2 | Medium | Kiểm tra validate field "Kỳ kế toán" thất bại khi để trống | — | 1. Không chọn Kỳ kế toán<br>2. Bấm Submit | 1. Chặn submit / báo lỗi required | High | N/A |
| GARA_PRC_TC_045 | M2 | Medium | Kiểm tra validate field "Kho" thất bại khi để trống | Đã chọn Kỳ | 1. Không chọn Kho<br>2. Bấm Submit | 1. Chặn submit / báo lỗi required | High | N/A |
| GARA_PRC_TC_046 | M2 | Medium | Kiểm tra validate field "Phạm vi vật tư" thất bại khi chưa chọn | — | 1. Không chọn Phạm vi<br>2. Bấm Submit | 1. Chặn submit / báo lỗi required | Medium | N/A |
| GARA_PRC_TC_047 | M2 | Medium | Kiểm tra dropdown "Mã nội bộ" search thành công chỉ trả về mã BQGQ "Đang hoạt động" với từ khóa "PN-189" | Có mã `PN-18901`(Đang HĐ, BQGQ) và `PN-18902`(Ngừng HĐ) | 1. Mở dropdown, gõ "PN-189" | 1. Chỉ hiện `PN-18901` (không hiện PN-18902 hay mã phương pháp khác)<br>2. Debounce ~300ms, không query mỗi keystroke | High | keyword: PN-189 |
| GARA_PRC_TC_048 | M2 | Medium | Kiểm tra dropdown "Mã nội bộ" search rỗng thành công với từ khóa không khớp "XYZ-99999" | — | 1. Gõ "XYZ-99999" | 1. Dropdown rỗng, không lỗi | Low | keyword: XYZ-99999 |
| GARA_PRC_TC_049 | M2 | Medium | Kiểm tra validate chặn trùng mã thành công khi thêm 2 dòng cùng chọn mã PN-18901 | Scope=SPECIFIC | 1. Thêm dòng 1, chọn PN-18901<br>2. Thêm dòng 2, chọn lại PN-18901 | 1. Dòng 2 báo lỗi inline "Mã đã được chọn" ngay khi chọn, KHÔNG cho thêm trùng vào bảng [ASSUMPTION: PTTK không quy định rõ hành vi — chọn chặn trùng phía client vì bảng vật tư là state cục bộ trước khi submit; xác nhận lại với BA/dev nếu BE cũng cần validate trùng khi submit] | Low | Mã: PN-18901 (x2) |
| **NHÓM UI & BEHAVIOR — M2 PRC-CREATE** | | | | | | | | |
| GARA_PRC_TC_050 | M2 | Medium | Kiểm tra input ngày disabled vẫn giữ đúng label liên kết | Đã chọn Kỳ | 1. Inspect input Từ ngày/Đến ngày | 1. `<label>` liên kết đúng<br>2. Input không focusable khi disabled | Low | N/A |
| GARA_PRC_TC_051 | M2 | Medium | Kiểm tra hiển thị đúng label "Huỷ bỏ" verbatim theo Figma | — | 1. Quan sát nút hủy | 1. Text hiển thị đúng "Huỷ bỏ" (không phải "Hủy bỏ") | Medium | N/A |
| GARA_PRC_TC_052 | M2 | Medium | Kiểm tra hiển thị đúng 7 cột bảng vật tư với dữ liệu Phạm vi = "Chọn mã cụ thể" | Scope=SPECIFIC | 1. Quan sát bảng | 1. Thứ tự: STT, Mã nội bộ, Tên sản phẩm nội bộ, ĐVT chính, Có phát sinh xuất, Lần tính gần nhất, Thao tác | Medium | N/A |
| GARA_PRC_TC_053 | M2 | Medium | Kiểm tra hiển thị loading state thành công cho nút Submit với dữ liệu form hợp lệ | Form hợp lệ | 1. Bấm Submit, quan sát ngay lập tức | 1. Nút hiện spinner, disable, chặn double-click | Medium | N/A |
| GARA_PRC_TC_054 | M2 | Medium | Kiểm tra ẩn icon xóa thành công cho dòng vật tư mới thêm chưa chọn mã | Scope=SPECIFIC | 1. Bấm "Thêm phụ tùng" (chưa chọn mã) | 1. Icon xóa opacity-0 (giữ layout, không unmount) cho tới khi chọn mã | Low | N/A |
| GARA_PRC_TC_055 | M2 | Medium | Kiểm tra tab order đúng thứ tự DOM tại form CREATE | — | 1. Tab liên tục từ đầu form | 1. Thứ tự: Kỳ kế toán → Kho → Phương pháp → Phạm vi vật tư → (bảng nếu SPECIFIC) → Huỷ bỏ → Thực hiện tính giá | Low | N/A |
| **NHÓM PHÂN QUYỀN — M2 PRC-CREATE** | | | | | | | | |
| GARA_PRC_TC_056 | M2 | High | Kiểm tra phân quyền hiển thị đầy đủ trường và nút thành công cho vai trò garage-owner tại form CREATE | Tài khoản garage-owner | 1. Đăng nhập garage-owner<br>2. Mở form CREATE | 1. Thấy đầy đủ trường + nút Submit/Hủy | Critical | owner_test_20260804@gara.test |
| GARA_PRC_TC_057 | M2 | High | Kiểm tra phân quyền hiển thị đầy đủ trường và nút thành công cho vai trò accountant tại form CREATE | Tài khoản accountant | 1. Đăng nhập accountant<br>2. Mở form CREATE | 1. KHÔNG field/nút nào bị ẩn so với TC_055 | Critical | accountant_test_20260804@gara.test |
| **NHÓM ẢNH HƯỞNG CHỨC NĂNG LIÊN QUAN — M2 PRC-CREATE** | | | | | | | | |
| GARA_PRC_TC_058 | M2 | High | Kiểm tra LIST cập nhật đúng log mới với trạng thái "Đang tính" thành công sau khi Submit CREATE | Vừa Submit thành công | 1. Từ Detail quay lại LIST | 1. Log mới ở đầu bảng, badge "Đang tính" | High | N/A |
| GARA_PRC_TC_059 | M2 | High | Kiểm tra báo cáo Stock V2 cập nhật đúng GT tồn/GT xuất thành công sau khi job PRC hoàn tất | Job SUCCEEDED | 1. Mở M6 (Báo cáo tồn kho) cùng mã/kho | 1. GT tồn/GT xuất cập nhật đúng theo kết quả BQGQ (không còn 0) | High | Mã: PN-18901; Kho: Kho Chính - CN Quận 1 |
| **NHÓM FUNCTION — M3 PRC-DETAIL** | | | | | | | | |
| GARA_PRC_TC_060 | M3 | High | Kiểm tra mở màn Detail thành công khi click 1 dòng tại LIST | Bảng LIST có data | 1. Click 1 dòng ở LIST | 1. Route `/inventory/price-calc-runs/:runId` load đúng run | Critical | N/A |
| GARA_PRC_TC_061 | M3 | High | Kiểm tra mở màn Detail thành công qua deep-link từ toast cảnh báo RECALC | Có toast cảnh báo từ RECALC chứa link | 1. Click link kỳ sau bị ảnh hưởng | 1. Load đúng run theo `runId` trong link | Medium | N/A |
| GARA_PRC_TC_062 | M3 | High | Kiểm tra hiển thị đúng 8 trường tại RunInfoGrid với dữ liệu run đã load | Run đã load | 1. Quan sát grid | 1. Grid 4 cột × 2 hàng (KHÔNG Card, KHÔNG 2 cột)<br>2. Đủ 8 trường: Kỳ, Từ ngày, Đến ngày, Kho, Phương pháp, Người thực hiện, Ngày giờ thực hiện, Trạng thái | High | N/A |
| GARA_PRC_TC_063 | M3 | High | Kiểm tra hiển thị đúng trạng thái "Đang tính" gộp thành công cho cả 2 giá trị PENDING và RUNNING | Run đang PENDING hoặc RUNNING | 1. Quan sát trường Trạng thái | 1. Hiển thị "Đang tính" cho cả 2 trạng thái BE | High | N/A |
| GARA_PRC_TC_064 | M3 | High | Kiểm tra polling tự động đúng chu kỳ 5s và hội tụ đúng công thức BQGQ với dữ liệu phiếu tự tham chiếu | Run đang chạy; Pre-condition: có mã với phiếu "Nhập hàng bán bị trả lại" tự tham chiếu Xuất bán cùng kỳ (setup: tạo phiếu Nhập mua → phiếu Xuất bán từ mã đó → phiếu Nhập hàng bán bị trả lại tham chiếu phiếu Xuất bán trên, "Tự nhập giá" để trống) | 1. Mở Detail, quan sát 5s/lần | 1. Refetch đúng chu kỳ 5000ms cố định<br>2. Sau vài vòng lặp hội tụ, đơn giá BQ chốt đúng công thức (BR-PRC-017) | Critical | Xem pre-condition |
| GARA_PRC_TC_065 | M3 | High | Kiểm tra dừng polling thành công khi run chuyển trạng thái SUCCEEDED | Run chuyển SUCCEEDED | 1. Chờ tới khi job hoàn tất | 1. `refetchInterval` dừng<br>2. Toast "Tính giá hoàn tất"<br>3. Bảng + RunInfoGrid refresh | High | N/A |
| GARA_PRC_TC_066 | M3 | High | Kiểm tra dừng polling thành công khi run chuyển trạng thái COMPLETED_WITH_ERRORS | Run chuyển có lỗi | 1. Chờ tới khi job hoàn tất có lỗi | 1. Toast biến thể lỗi<br>2. Bảng hiện mã lỗi | High | N/A |
| GARA_PRC_TC_067 | M3 | High | Kiểm tra hiển thị đúng 11 cột bảng chi tiết với dữ liệu run có items | Run có items | 1. Quan sát bảng | 1. Thứ tự: STT, Mã nội bộ, Tên sản phẩm nội bộ, ĐVT chính, Tồn đầu kỳ, Nhập trong kỳ, Xuất trong kỳ, Giá bình quân, Số phiếu xuất cập nhật, Trạng thái, Lí do lỗi | High | N/A |
| GARA_PRC_TC_068 | M3 | High | Kiểm tra dòng Tổng giữ nguyên giá trị aggregates BE thành công khi đổi filter trạng thái | Bảng có filter/pagination áp dụng | 1. Đổi filter trạng thái = "Đã tính"<br>2. Quan sát dòng Tổng | 1. Dòng Tổng KHÔNG đổi theo filter (vẫn = full scope, không tự SUM trang hiện tại) | High | N/A |
| GARA_PRC_TC_069 | M3 | High | Kiểm tra hiển thị đúng badge và lý do lỗi "Do tồn âm" với dữ liệu mã lỗi NEGATIVE_STOCK | Run có ≥1 mã lỗi "Do tồn âm" | 1. Quan sát dòng mã lỗi | 1. Badge "Lỗi" (màu error)<br>2. Cột "Giá bình quân" trống<br>3. "Lí do lỗi" = "Do tồn âm" | High | Lý do: NEGATIVE_STOCK → "Do tồn âm" |
| GARA_PRC_TC_070 | M3 | High | Kiểm tra hiển thị đúng lý do lỗi "Do sự cố hệ thống" với dữ liệu mã lỗi SYSTEM_ERROR | Job nền bị gián đoạn/hết retry trước khi tính tới 1 mã (cần phối hợp giả lập gián đoạn — khó tái tạo bằng thao tác UI thông thường) | 1. Quan sát mã chưa tới lượt tính khi log chốt "Hoàn thành có lỗi" | 1. Mã đó `status=Lỗi`, "Lí do lỗi" = "Do sự cố hệ thống"<br>2. Mã này vẫn được cover bởi nút "Tính lại mã lỗi" | Low | N/A |
| GARA_PRC_TC_071 | M3 | High | Kiểm tra tính đơn giá bình quân = 0 thành công với dữ liệu mã PN-18903 không có tồn đầu/nhập trong kỳ | Mã `PN-18903` không có phiếu nhập/xuất nào trong kỳ, không có tồn đầu | 1. Chạy CREATE cho mã `PN-18903`<br>2. Xem kết quả ở Detail | 1. Đơn giá bình quân = 0<br>2. Trạng thái = "Đã tính" (KHÔNG phải "Lỗi") — mẫu số=0 không tính là lỗi (BR-PRC-001) | High | Mã: PN-18903 |
| GARA_PRC_TC_072 | M3 | High | Kiểm tra hiển thị đúng giá bình quân làm tròn 2 chữ số thập phân với dữ liệu kết quả thập phân dài | Mã có kết quả tính ra số thập phân dài (vd 3 chữ số) | 1. Xem cột "Giá bình quân" của mã đó | 1. Hiển thị đúng làm tròn 2 chữ số thập phân (HALF_UP) ngay sau khi tính<br>2. Tiền vốn phiếu xuất = giá đã làm tròn (2 lẻ) × SL quy đổi, rồi làm tròn về đồng (BR-PRC-013) | High | N/A |
| GARA_PRC_TC_073 | M3 | High | Kiểm tra redirect về LIST thành công với dữ liệu runId=99999 không tồn tại | runId=99999 không có | 1. Truy cập `/inventory/price-calc-runs/99999` | 1. Redirect về LIST<br>2. Toast lỗi "không tìm thấy" | Medium | runId: 99999 |
| GARA_PRC_TC_074 | M3 | High | Kiểm tra chặn truy cập màn Detail thành công khi feature flag Inventory:InventoryV2 đang OFF | Flag `Inventory:InventoryV2` OFF | 1. Truy cập Detail khi flag OFF | 1. Route error boundary hiển thị | Medium | N/A |
| **NHÓM VALIDATE — M3 PRC-DETAIL** | | | | | | | | |
| GARA_PRC_TC_075 | M3 | Medium | Kiểm tra filter search (mã/tên) client-side thành công với từ khóa "PN-189" | Bảng có nhiều mã | 1. Gõ "PN-189" vào ô search | 1. Debounce 300ms<br>2. Filter khớp một phần mã/tên, KHÔNG gọi lại API | Medium | keyword: PN-189 |
| GARA_PRC_TC_076 | M3 | Medium | Kiểm tra filter dropdown "Trạng thái" thành công với giá trị "Lỗi" | Bảng có mã Đã tính + Lỗi | 1. Chọn "Lỗi" trong dropdown | 1. Chỉ hiện dòng `status=ERROR` | Medium | N/A |
| GARA_PRC_TC_077 | M3 | Medium | Kiểm tra kết hợp filter search + dropdown "Trạng thái" thành công theo điều kiện AND | — | 1. Search "PN-18" + chọn "Đã tính" | 1. Kết quả thỏa cả 2 điều kiện (AND) | Low | keyword: PN-18 |
| **NHÓM UI & BEHAVIOR — M3 PRC-DETAIL** | | | | | | | | |
| GARA_PRC_TC_078 | M3 | Medium | Kiểm tra RunInfoGrid dùng đúng cặp label-value chuẩn a11y | — | 1. Inspect DOM RunInfoGrid | 1. `<dt>/<dd>` hoặc `aria-label` cặp đúng | Low | N/A |
| GARA_PRC_TC_079 | M3 | Medium | Kiểm tra bảng chi tiết và dòng Tổng đúng semantic HTML | — | 1. Inspect bảng | 1. `<th scope="col">`; `<tfoot>` có `aria-label="Dòng tổng"` | Low | N/A |
| GARA_PRC_TC_080 | M3 | Medium | Kiểm tra badge "Lỗi" hiển thị đúng kèm text, không chỉ dựa vào màu | Có dòng lỗi | 1. Quan sát badge | 1. Có text kèm màu (WCAG contrast) | Low | N/A |
| GARA_PRC_TC_081 | M3 | Medium | Kiểm tra nút Recalc có đúng thuộc tính aria-busy khi đang loading | Bấm nút Recalc | 1. Bấm "Tính lại toàn bộ", quan sát | 1. `aria-busy="true"` khi đang gọi | Low | N/A |
| GARA_PRC_TC_082 | M3 | Medium | Kiểm tra hiển thị empty state thành công khi filter search không khớp từ khóa "ZZZ-000" | Search từ khóa không tồn tại | 1. Search "ZZZ-000" | 1. Hiện "Không có dữ liệu" tại vùng bảng | Medium | keyword: ZZZ-000 |
| **NHÓM PHÂN QUYỀN — M3 PRC-DETAIL** | | | | | | | | |
| GARA_PRC_TC_083 | M3 | High | Kiểm tra phân quyền hiển thị đầy đủ RunInfoGrid, bảng và 2 nút Recalc thành công cho vai trò garage-owner | Tài khoản garage-owner | 1. Mở Detail | 1. Đầy đủ mọi phần tử | Critical | owner_test_20260804@gara.test |
| GARA_PRC_TC_084 | M3 | High | Kiểm tra phân quyền hiển thị đầy đủ thành công giống garage-owner cho vai trò accountant | Tài khoản accountant | 1. Mở Detail | 1. KHÔNG khác biệt so với TC_079 | Critical | accountant_test_20260804@gara.test |
| **NHÓM ẢNH HƯỞNG CHỨC NĂNG LIÊN QUAN — M3 PRC-DETAIL** | | | | | | | | |
| GARA_PRC_TC_085 | M3 | High | Kiểm tra giá trị Giá bình quân khớp đúng báo cáo Stock V2 với dữ liệu mã PN-18901 SUCCEEDED | Run SUCCEEDED, mã PN-18901 | 1. So sánh "Giá bình quân" ở Detail vs GT ở M6/M7/M8 cùng mã | 1. Giá trị khớp nhau, "Số phiếu xuất cập nhật" > 0 | High | Mã: PN-18901 |
| GARA_PRC_TC_086 | M3 | High | Kiểm tra phiếu Xuất bán hiển thị đúng giá vốn mới thành công sau khi PRC tính giá (cross-wave) | Mã đã PRC tính giá thành công, có phiếu Xuất bán trong kỳ (thuộc W05, ngoài phạm vi wave 6) | 1. Mở phiếu Xuất bán liên quan (`FEAT-ID-DETAIL-V2`, ngoài Wave 6) | 1. Cột giá vốn hiển thị đúng giá trị mới (không còn 0) — chỉ verify dữ liệu, không test lại toàn bộ UI màn ngoài phạm vi wave | Medium | N/A |
| GARA_PRC_TC_087 | M3 | High | Kiểm tra phiếu "Nhập hàng bán bị trả lại" hiển thị đúng giá kế thừa thành công từ phiếu Xuất bán gốc (cross-wave) | Có phiếu trả hàng kế thừa giá từ phiếu Xuất bán gốc đã PRC tính | 1. Mở phiếu "Nhập hàng bán bị trả lại" liên quan (`FEAT-IR-DETAIL-V2`, ngoài Wave 6) | 1. Giá trị nhập hiển thị đúng giá kế thừa từ phiếu Xuất bán gốc (BR-IRV2-031) — chỉ verify dữ liệu | Medium | N/A |
| GARA_PRC_TC_088 | M3 | High | Kiểm tra disable 2 nút Recalc thành công khi run đang PENDING/RUNNING | Run đang chạy | 1. Quan sát 2 nút khi status=RUNNING | 1. Cả 2 nút disable | High | N/A |
| GARA_PRC_TC_089 | M3 | High | Kiểm tra ẩn/disable nút "Tính lại mã lỗi" thành công khi run không có mã lỗi | Run SUCCEEDED hoàn toàn (itemsErrorCount=0) | 1. Quan sát nút "Tính lại mã lỗi" | 1. Ẩn hoặc disable, có `title`/tooltip lý do | High | N/A |
| **NHÓM FUNCTION — M4 PRC-RECALC** | | | | | | | | |
| GARA_PRC_TC_090 | M4 | High | Kiểm tra RECALC scope ALL thành công khi bấm "Tính lại toàn bộ" | Run có kết quả cũ | 1. Bấm "Tính lại toàn bộ" | 1. Mutation `runScope=ALL`<br>2. 202, toast "Đã bắt đầu tính lại"<br>3. Redirect run mới | Critical | N/A |
| GARA_PRC_TC_091 | M4 | High | Kiểm tra RECALC scope ERROR_ONLY thành công khi bấm "Tính lại mã lỗi" | Run có ≥1 mã lỗi | 1. Bấm "Tính lại mã lỗi" | 1. Mutation `runScope=ERROR_ONLY`<br>2. Redirect run mới | Critical | N/A |
| GARA_PRC_TC_092 | M4 | High | Kiểm tra hiển thị toast cảnh báo thành công với dữ liệu response affectedSubsequentPeriods non-empty | Kỳ sau đã tính | 1. Bấm Recalc | 1. Toast cảnh báo non-blocking liệt kê kỳ sau | Medium | N/A |
| GARA_PRC_TC_093 | M4 | High | Kiểm tra RECALC thất bại với dữ liệu Kỳ kế toán đã đóng | Kỳ đã đóng | 1. Bấm "Tính lại toàn bộ" | 1. Dialog cảnh báo (`ERR-INV-024`), không redirect | High | N/A |
| GARA_PRC_TC_094 | M4 | High | Kiểm tra RECALC thất bại khi đang có job RUNNING cùng kỳ+kho | Job khác đang RUNNING cùng kỳ+kho | 1. Bấm Recalc | 1. Dialog chặn (`ERR-INV-029`) | High | N/A |
| GARA_PRC_TC_095 | M4 | High | Kiểm tra chặn tạo trùng request thành công khi double-click nút Recalc | — | 1. Bấm nút Recalc 2 lần liên tiếp nhanh | 1. Chỉ 1 request thực thi (clientNonce idempotency) | High | N/A |
| GARA_PRC_TC_096 | M4 | High | Kiểm tra RECALC thành công với dữ liệu kỳ vừa được mở lại | Kỳ vừa mở lại | 1. Mở lại kỳ (qua FEAT-AP-EDIT, ngoài wave)<br>2. Bấm Recalc | 1. Chạy lại bình thường | Medium | N/A |
| **NHÓM UI & BEHAVIOR — M4 PRC-RECALC** | | | | | | | | |
| GARA_PRC_TC_097 | M4 | Medium | Kiểm tra hiển thị đúng label "Tính lại  toàn bộ" verbatim theo Figma (2 khoảng trắng) | — | 1. Quan sát nút | 1. Text đúng "Tính lại  toàn bộ" theo Figma | Low | N/A |
| GARA_PRC_TC_098 | M4 | Medium | Kiểm tra hiển thị đúng label "Tính lại mã lỗi " verbatim theo Figma | — | 1. Quan sát nút | 1. Text đúng "Tính lại mã lỗi " (1 space cuối) | Low | N/A |
| GARA_PRC_TC_099 | M4 | Medium | Kiểm tra disable đồng thời cả 2 nút Recalc thành công khi đang loading | Bấm 1 nút | 1. Bấm "Tính lại toàn bộ", quan sát nút còn lại | 1. Cả 2 nút disable trong lúc gọi (tránh race) | Medium | N/A |
| GARA_PRC_TC_100 | M4 | Medium | Kiểm tra đóng dialog lỗi thành công và trả focus đúng khi nhấn Escape | Dialog lỗi đang mở | 1. Nhấn Escape | 1. Dialog đóng, focus trả về nút vừa bấm | Low | N/A |
| **NHÓM PHÂN QUYỀN — M4 PRC-RECALC** | | | | | | | | |
| GARA_PRC_TC_101 | M4 | High | Kiểm tra phân quyền bấm được cả 2 nút Recalc thành công cho vai trò garage-owner | Tài khoản garage-owner | 1. Mở Detail, quan sát 2 nút | 1. Cả 2 nút hiển thị + bấm được | Critical | owner_test_20260804@gara.test |
| GARA_PRC_TC_102 | M4 | High | Kiểm tra phân quyền bấm được cả 2 nút Recalc thành công cho vai trò accountant | Tài khoản accountant | 1. Mở Detail, quan sát 2 nút | 1. Giống hệt TC_095 | Critical | accountant_test_20260804@gara.test |
| **NHÓM ẢNH HƯỞNG CHỨC NĂNG LIÊN QUAN — M4 PRC-RECALC** | | | | | | | | |
| GARA_PRC_TC_103 | M4 | High | Kiểm tra run mới có source_run_id trỏ đúng run gốc thành công sau khi RECALC | Sau RECALC | 1. Kiểm tra run mới | 1. `sourceRunId` = id của run gốc (audit trail) | High | N/A |
| GARA_PRC_TC_104 | M4 | High | Kiểm tra RECALC scope ERROR_ONLY giữ nguyên kết quả mã "Đã tính" thành công | Run có mã Đã tính + mã Lỗi | 1. RECALC scope ERROR_ONLY | 1. Mã "Đã tính" giữ nguyên kết quả cũ, không recompute | High | N/A |
| GARA_PRC_TC_105 | M4 | High | Kiểm tra báo cáo Stock V2 Reports cập nhật đúng giá trị thành công sau khi RECALC | Sau RECALC thành công | 1. Mở M6/M7/M8 cùng mã | 1. Giá trị hiển thị = kết quả RECALC mới nhất | High | N/A |
| GARA_PRC_TC_106 | M4 | High | Kiểm tra chặn concurrency thành công khi 2 request RECALC/CREATE gần đồng thời cùng kỳ+kho | Mở 2 tab, cùng điền form giống nhau (best-effort thủ công — race condition không đảm bảo chính xác 100% qua thao tác tay, khuyến nghị bổ sung automation/integration test riêng) | 1. Submit ở cả 2 tab cách nhau <1 giây | 1. 1 request 202 thành công<br>2. Request kia chặn `ERR-INV-029`<br>3. Không deadlock/race giá vốn | Medium | Kỳ: Tháng 07/2026; Kho: Kho Chính - CN Quận 1 |
| **NHÓM FUNCTION — M5 PRC-DELETE** | | | | | | | | |
| GARA_PRC_TC_107 | M5 | High | Kiểm tra mở dialog xác nhận xóa đúng nội dung thành công khi click icon "Xóa" | Bảng LIST có data | 1. Click icon "Xóa" | 1. Dialog hiện đúng "Bạn có muốn xóa log tính giá {periodFrom} - {periodTo} của {warehouseName}." | Critical | N/A |
| GARA_PRC_TC_108 | M5 | High | Kiểm tra xóa log thành công với dữ liệu kỳ mở và log ở trạng thái terminal (SUCCEEDED) | Log SUCCEEDED, kỳ mở | 1. Bấm "Xác nhận xoá" | 1. Soft-delete<br>2. Toast thành công<br>3. Dialog đóng, LIST refetch | Critical | N/A |
| GARA_PRC_TC_109 | M5 | High | Kiểm tra đóng dialog xác nhận thành công khi bấm "Hủy", không thực hiện xóa | — | 1. Bấm "Hủy" | 1. Dialog đóng, KHÔNG gọi mutation | High | N/A |
| GARA_PRC_TC_110 | M5 | High | Kiểm tra đóng dialog xác nhận thành công khi nhấn Escape, không thực hiện xóa | — | 1. Nhấn Escape | 1. Dialog đóng, KHÔNG gọi mutation | Medium | N/A |
| GARA_PRC_TC_111 | M5 | High | Kiểm tra xóa log thất bại với dữ liệu Kỳ kế toán đã đóng | Log thuộc kỳ đã đóng | 1. Bấm "Xác nhận xoá" | 1. Dialog swap "Không thể xóa" — "Log tính giá đã được dùng để khóa giá vốn hoặc kỳ kế toán đã đóng nên không được xóa." | High | N/A |
| GARA_PRC_TC_112 | M5 | High | Kiểm tra xóa log thất bại với dữ liệu log đang ở trạng thái "Đang tính" (PENDING/RUNNING) | Log status=PENDING/RUNNING | 1. Bấm "Xác nhận xoá" | 1. Dialog swap "Không thể xóa" — "Đang có lần tính giá chạy cho kỳ + kho này — vui lòng đợi hoàn tất" (khác message TC_105) | High | N/A |
| GARA_PRC_TC_113 | M5 | High | Kiểm tra xóa log thành công và giá vốn phiếu xuất không bị rollback | Log SUCCEEDED đã cập nhật giá vốn | 1. Xóa log<br>2. Mở phiếu xuất liên quan | 1. Giá vốn phiếu xuất vẫn giữ nguyên giá trị đã tính | High | N/A |
| **NHÓM VALIDATE — M5 PRC-DELETE** | | | | | | | | |
| GARA_PRC_TC_114 | M5 | N/A | Kiểm tra dialog xác nhận xóa không phát sinh field cần validate (N/A) | — | — | N/A — dialog chỉ có nút xác nhận/hủy, không có input field | N/A | N/A |
| **NHÓM UI & BEHAVIOR — M5 PRC-DELETE** | | | | | | | | |
| GARA_PRC_TC_115 | M5 | Medium | Kiểm tra dialog xác nhận xóa đúng kích thước 441px và bo góc vuông | Dialog xác nhận đang mở | 1. Inspect dialog | 1. `width=441px`, `rounded-none` (không bo góc) | Low | N/A |
| GARA_PRC_TC_116 | M5 | Medium | Kiểm tra title dialog luôn hiển thị màu đen với mọi biến thể nội dung | Dialog "Không thể xóa" đang mở | 1. Quan sát title | 1. `text-foreground` (đen), KHÔNG nhuộm đỏ/cam | Low | N/A |
| GARA_PRC_TC_117 | M5 | Medium | Kiểm tra hiển thị loading state thành công cho nút "Xác nhận xoá" khi đang chờ mutation | Bấm "Xác nhận xoá" | 1. Bấm và quan sát ngay | 1. Nút disable + spinner, chặn double-submit | Medium | N/A |
| GARA_PRC_TC_118 | M5 | Medium | Kiểm tra không hiển thị mã lỗi kỹ thuật ra UI tại dialog chặn xóa | Dialog chặn đang mở | 1. Quan sát nội dung dialog | 1. Không thấy `ERR-INV-024`/`ERR-INV-029` — chỉ text tiếng Việt | Medium | N/A |
| GARA_PRC_TC_119 | M5 | Medium | Kiểm tra hiển thị đúng label "Xác nhận xoá" verbatim theo Figma | — | 1. Quan sát nút xác nhận | 1. Text đúng "Xác nhận xoá" (theo Figma, không phải "Xóa khoản mục") | Medium | N/A |
| **NHÓM PHÂN QUYỀN — M5 PRC-DELETE** | | | | | | | | |
| GARA_PRC_TC_120 | M5 | High | Kiểm tra phân quyền thao tác xóa thành công cho vai trò garage-owner | Tài khoản garage-owner | 1. Xóa 1 log | 1. Thao tác thành công bình thường | Critical | owner_test_20260804@gara.test |
| GARA_PRC_TC_121 | M5 | High | Kiểm tra phân quyền thao tác xóa thành công cho vai trò accountant | Tài khoản accountant | 1. Xóa 1 log | 1. Giống hệt TC_114 | Critical | accountant_test_20260804@gara.test |
| **NHÓM ẢNH HƯỞNG CHỨC NĂNG LIÊN QUAN — M5 PRC-DELETE** | | | | | | | | |
| GARA_PRC_TC_122 | M5 | High | Kiểm tra dữ liệu Stock V2 Reports giữ nguyên không đổi thành công sau khi xóa log (đúng thiết kế không rollback) | Đã xóa 1 log SUCCEEDED | 1. Mở M6/M7/M8 cùng mã | 1. Giá trị GT xuất/tồn vẫn giữ nguyên như trước khi xóa log (không bị rollback về 0) | High | N/A |
