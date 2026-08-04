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
| GARA_PRC_TC_001 | M1 | High | Mở màn khi đã có log tính giá | Tenant có ≥1 log PRC đã chạy | 1. Đăng nhập garage-owner<br>2. Vào menu "Kho hàng" → "Tính giá xuất kho" | 1. Route `/inventory/price-calc-runs` load thành công<br>2. Bảng hiển thị đúng 11 cột: STT, Kỳ kế toán, Từ ngày, Đến ngày, Kho, Phương pháp tính giá vốn, Tài khoản thực hiện, Ngày giờ thực hiện, Số mã, Trạng thái, Thao tác<br>3. Sort mặc định theo Ngày giờ thực hiện giảm dần | Critical | owner_test_20260804@gara.test |
| GARA_PRC_TC_002 | M1 | High | Mở màn khi chưa có log nào (empty state) | Tenant mới, chưa từng chạy PRC | 1. Vào route `/inventory/price-calc-runs` | 1. Hiển thị empty state, text verbatim "Không có dữ liệu"<br>2. Không hiển thị pagination | High | N/A |
| GARA_PRC_TC_003 | M1 | High | Nhiều log cùng (kỳ+kho) hiển thị riêng biệt | Đã chạy Tính giá 2 lần cho cùng Kỳ+Kho | 1. Vào PRC-LIST | 1. Hiển thị 2 dòng riêng biệt (BR-PRC-010), log chạy sau nằm trên | High | Kỳ: Tháng 07/2026; Kho: Kho Chính - CN Quận 1 |
| GARA_PRC_TC_004 | M1 | High | Bấm "Xem" điều hướng đúng Detail | Bảng có dòng id=4521 | 1. Bấm icon "Xem" ở dòng id=4521 | 1. Điều hướng tới `/inventory/price-calc-runs/4521`<br>2. Không gọi GraphQL nào tại LIST trước khi điều hướng | Critical | id=4521 |
| GARA_PRC_TC_005 | M1 | High | Bấm CTA "Tính giá" điều hướng sang Create | — | 1. Bấm nút "Tính giá" ở page header | 1. Điều hướng tới `/inventory/price-calc-runs/create` | Critical | N/A |
| GARA_PRC_TC_006 | M1 | High | Bấm icon "Xóa" mở đúng dialog xác nhận | Bảng có ≥1 dòng | 1. Bấm icon "Xóa" ở 1 dòng | 1. Mở dialog xác nhận đúng dữ liệu dòng đã chọn (kỳ, kho trong nội dung dialog) | Critical | N/A |
| GARA_PRC_TC_007 | M1 | High | Lỗi tải danh sách (network/500) | Giả lập BE trả lỗi 500 | 1. Vào route PRC-LIST khi BE lỗi | 1. Toast lỗi tải danh sách<br>2. Không crash trang, không hiện bảng như thành công | High | N/A |
| GARA_PRC_TC_008 | M1 | High | Xóa log đã bị user khác xóa trước (`ERR-CMN-not-found`) | 2 user cùng mở LIST, user B xóa trước | 1. User A bấm "Xóa" cùng dòng user B vừa xóa<br>2. User A xác nhận xóa | 1. Toast lỗi không tìm thấy bản ghi<br>2. Dialog đóng<br>3. LIST tự refetch, dòng không còn | Medium | N/A |
| **NHÓM VALIDATE — M1 PRC-LIST** | | | | | | | | |
| GARA_PRC_TC_009 | M1 | Medium | Filter "Ngày thực hiện" — executedFrom > executedTo | Bảng có data nhiều ngày | 1. Mở filter "Ngày thực hiện"<br>2. Chọn Từ: 31/07/2026, Đến: 01/07/2026 | 1. Hiển thị lỗi validate trước khi gọi query<br>2. Không gọi `priceCalcRunList` với input sai | Medium | Từ: 31/07/2026; Đến: 01/07/2026 |
| GARA_PRC_TC_010 | M1 | Medium | Filter "Ngày thực hiện" — khoảng hợp lệ | Bảng có data trong khoảng | 1. Chọn Từ: 01/07/2026, Đến: 31/07/2026 | 1. Gọi lại query đúng `executedFrom/executedTo`<br>2. `page` reset về 0<br>3. Bảng chỉ hiện log trong khoảng | High | Từ: 01/07/2026; Đến: 31/07/2026 |
| GARA_PRC_TC_011 | M1 | Medium | Filter "Phương pháp" — chỉ có 1 option | — | 1. Mở dropdown "Phương pháp" | 1. Chỉ hiển thị 1 option "Phương pháp bình quân cuối kỳ"<br>2. Chọn được, không lỗi | Low | N/A |
| GARA_PRC_TC_012 | M1 | Medium | Kết hợp cả 2 filter (AND) | Data đa dạng | 1. Chọn "Phương pháp" + khoảng ngày 01/07/2026-31/07/2026 | 1. Kết quả thỏa cả 2 điều kiện (AND) | Medium | Từ: 01/07/2026; Đến: 31/07/2026 |
| **NHÓM UI & BEHAVIOR — M1 PRC-LIST** | | | | | | | | |
| GARA_PRC_TC_013 | M1 | Medium | Badge trạng thái đúng 3 màu/nhãn | 3 log ở 3 trạng thái khác nhau | 1. Quan sát cột "Trạng thái" | 1. PENDING/RUNNING → "Đang tính"<br>2. SUCCEEDED → "Thành công"<br>3. COMPLETED_WITH_ERRORS → "Hoàn thành có lỗi", 3 màu semantic + text kèm | Medium | N/A |
| GARA_PRC_TC_014 | M1 | Low | Semantic HTML — heading & table header | — | 1. Inspect DOM | 1. Page title dùng `<h1>`<br>2. Header cột dùng `<th scope="col">` | Low | N/A |
| GARA_PRC_TC_015 | M1 | Low | Icon action có `aria-label` | Bảng có data | 1. Inspect icon Xem/Xóa | 1. Icon "Xem" có `aria-label="Xem chi tiết"`<br>2. Icon "Xóa" có `aria-label="Xóa lần tính"` | Low | N/A |
| GARA_PRC_TC_016 | M1 | Medium | Empty state đúng test-id và text verbatim | Tenant chưa có log | 1. Vào LIST | 1. Text "Không có dữ liệu" đúng verbatim<br>2. Test id `table-price-calc-runs` tồn tại | Medium | N/A |
| GARA_PRC_TC_017 | M1 | Medium | Pagination — đổi page-size reset về trang 0 | ≥25 dòng data | 1. Đang ở trang 2 (size 20)<br>2. Đổi page-size sang 50 | 1. Refetch `page=0, size=50`<br>2. Tổng trang/phần tử đúng theo response | Medium | page-size: 50 |
| GARA_PRC_TC_018 | M1 | Low | Loading state dùng skeleton bảng | — | 1. Mở LIST, quan sát lúc tải | 1. Chỉ vùng bảng hiện skeleton<br>2. Filter bar + header hiển thị bình thường | Low | N/A |
| GARA_PRC_TC_019 | M1 | Low | Tab order đúng thứ tự DOM | — | 1. Tab liên tục từ đầu trang | 1. Thứ tự: filter Phương pháp → filter Ngày thực hiện → bảng → pagination → action buttons | Low | N/A |
| GARA_PRC_TC_020 | M1 | Low | Confirm dialog xóa — focus-trap & focus trả về | Bảng có data | 1. Bấm "Xóa"<br>2. Tab liên tục trong dialog<br>3. Đóng dialog (Hủy) | 1. Focus không thoát dialog khi mở<br>2. Sau đóng, focus quay lại đúng button "Xóa" | Low | N/A |
| **NHÓM PHÂN QUYỀN — M1 PRC-LIST** | | | | | | | | |
| GARA_PRC_TC_021 | M1 | High | `garage-owner` truy cập đầy đủ quyền | Tài khoản garage-owner | 1. Đăng nhập garage-owner<br>2. Vào PRC-LIST | 1. Thấy đủ bảng + filter + CTA "Tính giá" + action Xem/Xóa | Critical | owner_test_20260804@gara.test |
| GARA_PRC_TC_022 | M1 | High | `accountant` truy cập đầy đủ quyền | Tài khoản accountant | 1. Đăng nhập accountant<br>2. Vào PRC-LIST | 1. KHÔNG control nào bị ẩn/khóa so với TC_021 | Critical | accountant_test_20260804@gara.test |
| GARA_PRC_TC_023 | M1 | High | Feature flag OFF | Tenant chưa bật `Inventory:InventoryV2` | 1. Truy cập route PRC-LIST khi flag OFF | 1. Route không truy cập được / empty-state (`FORBIDDEN_ERROR`) | High | N/A |
| **NHÓM ẢNH HƯỞNG CHỨC NĂNG LIÊN QUAN — M1 PRC-LIST** | | | | | | | | |
| GARA_PRC_TC_024 | M1 | High | Sau CREATE, LIST hiện dòng mới đầu bảng | Vừa tạo 1 lần tính mới ở M2 | 1. Từ Detail bấm back về LIST | 1. Dòng vừa tạo xuất hiện đầu bảng (sort desc) | High | N/A |
| GARA_PRC_TC_025 | M1 | High | Sau DELETE (không phải dòng cuối trang) | Trang có 20 dòng, xóa 1 dòng giữa | 1. Xóa 1 log không phải dòng cuối trang | 1. LIST mất đúng 1 dòng, giữ nguyên filter + trang | High | N/A |
| GARA_PRC_TC_026 | M1 | High | Xóa dòng cuối trang → tự lùi trang | Trang cuối chỉ còn 1 dòng | 1. Xóa dòng duy nhất của trang cuối | 1. LIST tự lùi về trang trước | Medium | N/A |
| GARA_PRC_TC_027 | M1 | High | Sau RECALC, LIST hiện cả log cũ lẫn mới | Đã RECALC 1 log | 1. Quay lại LIST | 1. 2 dòng riêng biệt (BR-PRC-010) — không ghi đè | High | N/A |
| **NHÓM FUNCTION — M2 PRC-CREATE** | | | | | | | | |
| GARA_PRC_TC_028 | M2 | High | Mở form từ CTA "Tính giá" | — | 1. Bấm "Tính giá" ở LIST | 1. Route `/inventory/price-calc-runs/create` load<br>2. 2 section: "Thông tin kỳ tính giá" + "Vật tư hàng hoá cần tính giá" | Critical | N/A |
| GARA_PRC_TC_029 | M2 | High | Chọn Kỳ kế toán → tự khóa Từ/Đến ngày | Kỳ "Tháng 07/2026" tồn tại | 1. Chọn Kỳ kế toán "Tháng 07/2026" | 1. Từ ngày = 01/07/2026, Đến ngày = 31/07/2026 tự điền<br>2. 2 input chuyển disabled, không gõ được | Critical | Kỳ: Tháng 07/2026 |
| GARA_PRC_TC_030 | M2 | High | Chọn Kho + Phương pháp mặc định | — | 1. Chọn Kho "Kho Chính - CN Quận 1" | 1. Phương pháp mặc định chọn sẵn "Phương pháp bình quân cuối kỳ" | High | Kho: Kho Chính - CN Quận 1 |
| GARA_PRC_TC_031 | M2 | High | Chọn "Tất cả mã" → ẩn bảng vật tư | — | 1. Chọn Phạm vi vật tư = "Tất cả mã" | 1. Bảng "Vật tư hàng hoá cần tính giá" ẩn/không dùng<br>2. Nút "Thêm phụ tùng" ẩn/disable | High | N/A |
| GARA_PRC_TC_032 | M2 | High | Chọn "Chọn mã cụ thể" → hiện bảng vật tư | — | 1. Chọn Phạm vi vật tư = "Chọn mã cụ thể" | 1. Bảng 7 cột + nút "Thêm phụ tùng" active | High | N/A |
| GARA_PRC_TC_033 | M2 | High | Thêm 1 dòng, chọn mã hợp lệ | Scope = Chọn mã cụ thể | 1. Bấm "Thêm phụ tùng"<br>2. Chọn mã `PN-18901` | 1. Dòng mới thêm<br>2. 4 cột (Tên SP, ĐVT, Có phát sinh xuất, Lần tính gần nhất) auto-fill readonly | High | Mã: PN-18901 |
| GARA_PRC_TC_034 | M2 | High | Xóa 1 dòng đã thêm (chưa submit) | Đã thêm ≥1 dòng | 1. Bấm icon xóa (Trash) trên dòng vừa thêm | 1. Dòng biến mất khỏi bảng (client state, chưa gọi API) | Medium | N/A |
| GARA_PRC_TC_035 | M2 | High | Submit "Tất cả mã" thành công | Kỳ mở, Kho hợp lệ | 1. Điền đủ Kỳ+Kho, scope="Tất cả mã"<br>2. Bấm "Thực hiện tính giá" | 1. Nhận 202 Accepted<br>2. Redirect `/inventory/price-calc-runs/{runId}` (Detail run mới) | Critical | Kỳ: Tháng 07/2026; Kho: Kho Chính - CN Quận 1 |
| GARA_PRC_TC_036 | M2 | High | Submit "Chọn mã cụ thể" với 3 mã | Kỳ mở, đã thêm 3 mã hợp lệ | 1. Bấm "Thực hiện tính giá" | 1. 202 Accepted, redirect Detail run mới | Critical | Mã: PN-18901, PN-18904, PN-18905 |
| GARA_PRC_TC_037 | M2 | High | CREATE cho kỳ N dù kỳ N-1 chưa từng tính giá | Kỳ N-1 "Tháng 06/2026" chưa có log PRC nào; Kỳ N "Tháng 07/2026" mở | 1. Chọn Kỳ "Tháng 07/2026", điền đủ Kho + scope hợp lệ<br>2. Bấm "Thực hiện tính giá" | 1. Không bị chặn dù kỳ trước chưa tính (BR-PRC-006)<br>2. 202 Accepted, redirect Detail bình thường | High | Kỳ: Tháng 07/2026 (kỳ N-1 "Tháng 06/2026" chưa tính) |
| GARA_PRC_TC_038 | M2 | High | Double-click Submit liên tiếp | Form hợp lệ | 1. Bấm "Thực hiện tính giá" 2 lần liên tiếp nhanh | 1. Chỉ 1 job thực sự được tạo (idempotency-key)<br>2. Không tạo 2 run trùng | High | N/A |
| GARA_PRC_TC_039 | M2 | High | Submit "Chọn mã cụ thể" nhưng bảng rỗng | Scope=SPECIFIC, chưa thêm dòng nào | 1. Bấm "Thực hiện tính giá" | 1. Nút Submit disable / chặn, không gọi API | High | N/A |
| GARA_PRC_TC_040 | M2 | High | Submit khi kỳ đã đóng | Kỳ "Tháng 06/2026" đã đóng | 1. Chọn Kỳ đã đóng, điền đủ Kho<br>2. Bấm Submit | 1. Inline error tại section "Thông tin kỳ tính giá"<br>2. Form giữ nguyên, không redirect | High | Kỳ: Tháng 06/2026 (đã đóng) |
| GARA_PRC_TC_041 | M2 | High | Submit khi đã có job chạy cùng kỳ+kho | Đang có 1 job PENDING cùng (kỳ, kho) | 1. Submit form cùng kỳ+kho đang chạy | 1. Dialog "Đang có lần tính giá chạy cho kỳ + kho này" (`ERR-INV-029`)<br>2. Form giữ nguyên | High | Kỳ: Tháng 07/2026; Kho: Kho Chính - CN Quận 1 |
| GARA_PRC_TC_042 | M2 | High | Response có `affectedSubsequentPeriods` | Kỳ sau đã có log tính trước | 1. Submit form cho kỳ N | 1. Toast cảnh báo liệt kê `periodName` kỳ sau cần tính lại<br>2. Vẫn redirect sang Detail | Medium | N/A |
| GARA_PRC_TC_043 | M2 | High | Bấm "Hủy bỏ" | — | 1. Bấm nút "Huỷ bỏ" | 1. Điều hướng về `/inventory/price-calc-runs`<br>2. Không gọi mutation | High | N/A |
| **NHÓM VALIDATE — M2 PRC-CREATE** | | | | | | | | |
| GARA_PRC_TC_044 | M2 | Medium | Field "Kỳ kế toán" — để trống | — | 1. Không chọn Kỳ kế toán<br>2. Bấm Submit | 1. Chặn submit / báo lỗi required | High | N/A |
| GARA_PRC_TC_045 | M2 | Medium | Field "Kho" — để trống | Đã chọn Kỳ | 1. Không chọn Kho<br>2. Bấm Submit | 1. Chặn submit / báo lỗi required | High | N/A |
| GARA_PRC_TC_046 | M2 | Medium | Field "Phạm vi vật tư" — chưa chọn | — | 1. Không chọn Phạm vi<br>2. Bấm Submit | 1. Chặn submit / báo lỗi required | Medium | N/A |
| GARA_PRC_TC_047 | M2 | Medium | Dropdown "Mã nội bộ" — search đúng, chỉ hiện mã BQGQ "Đang hoạt động" | Có mã `PN-18901`(Đang HĐ, BQGQ) và `PN-18902`(Ngừng HĐ) | 1. Mở dropdown, gõ "PN-189" | 1. Chỉ hiện `PN-18901` (không hiện PN-18902 hay mã phương pháp khác)<br>2. Debounce ~300ms, không query mỗi keystroke | High | keyword: PN-189 |
| GARA_PRC_TC_048 | M2 | Medium | Dropdown "Mã nội bộ" — search không khớp | — | 1. Gõ "XYZ-99999" | 1. Dropdown rỗng, không lỗi | Low | keyword: XYZ-99999 |
| GARA_PRC_TC_049 | M2 | Medium | Thêm 2 dòng cùng chọn 1 mã trùng nhau | Scope=SPECIFIC | 1. Thêm dòng 1, chọn PN-18901<br>2. Thêm dòng 2, chọn lại PN-18901 | 1. Ghi nhận hành vi thực tế (spec chưa quy định rõ có chặn trùng hay không) — NEED CONFIRMATION nếu BE không tự loại trùng | Low | Mã: PN-18901 (x2) |
| **NHÓM UI & BEHAVIOR — M2 PRC-CREATE** | | | | | | | | |
| GARA_PRC_TC_050 | M2 | Medium | Input ngày disabled vẫn có label liên kết | Đã chọn Kỳ | 1. Inspect input Từ ngày/Đến ngày | 1. `<label>` liên kết đúng<br>2. Input không focusable khi disabled | Low | N/A |
| GARA_PRC_TC_051 | M2 | Medium | Label "Huỷ bỏ" đúng verbatim Figma | — | 1. Quan sát nút hủy | 1. Text hiển thị đúng "Huỷ bỏ" (không phải "Hủy bỏ") | Medium | N/A |
| GARA_PRC_TC_052 | M2 | Medium | Bảng vật tư đúng 7 cột | Scope=SPECIFIC | 1. Quan sát bảng | 1. Thứ tự: STT, Mã nội bộ, Tên sản phẩm nội bộ, ĐVT chính, Có phát sinh xuất, Lần tính gần nhất, Thao tác | Medium | N/A |
| GARA_PRC_TC_053 | M2 | Medium | Nút Submit loading state | Form hợp lệ | 1. Bấm Submit, quan sát ngay lập tức | 1. Nút hiện spinner, disable, chặn double-click | Medium | N/A |
| GARA_PRC_TC_054 | M2 | Medium | Dòng mới thêm — icon xóa ẩn cho tới khi có mã hợp lệ | Scope=SPECIFIC | 1. Bấm "Thêm phụ tùng" (chưa chọn mã) | 1. Icon xóa opacity-0 (giữ layout, không unmount) cho tới khi chọn mã | Low | N/A |
| GARA_PRC_TC_055 | M2 | Medium | Tab order đúng | — | 1. Tab liên tục từ đầu form | 1. Thứ tự: Kỳ kế toán → Kho → Phương pháp → Phạm vi vật tư → (bảng nếu SPECIFIC) → Huỷ bỏ → Thực hiện tính giá | Low | N/A |
| **NHÓM PHÂN QUYỀN — M2 PRC-CREATE** | | | | | | | | |
| GARA_PRC_TC_056 | M2 | High | `garage-owner` thấy đầy đủ trường + nút | Tài khoản garage-owner | 1. Đăng nhập garage-owner<br>2. Mở form CREATE | 1. Thấy đầy đủ trường + nút Submit/Hủy | Critical | owner_test_20260804@gara.test |
| GARA_PRC_TC_057 | M2 | High | `accountant` thấy đầy đủ trường + nút | Tài khoản accountant | 1. Đăng nhập accountant<br>2. Mở form CREATE | 1. KHÔNG field/nút nào bị ẩn so với TC_055 | Critical | accountant_test_20260804@gara.test |
| **NHÓM ẢNH HƯỞNG CHỨC NĂNG LIÊN QUAN — M2 PRC-CREATE** | | | | | | | | |
| GARA_PRC_TC_058 | M2 | High | Sau Submit, LIST hiện log mới đầu bảng đúng trạng thái "Đang tính" | Vừa Submit thành công | 1. Từ Detail quay lại LIST | 1. Log mới ở đầu bảng, badge "Đang tính" | High | N/A |
| GARA_PRC_TC_059 | M2 | High | Sau khi job hoàn tất, báo cáo Stock V2 cùng mã/kho/kỳ phản ánh đúng | Job SUCCEEDED | 1. Mở M6 (Báo cáo tồn kho) cùng mã/kho | 1. GT tồn/GT xuất cập nhật đúng theo kết quả BQGQ (không còn 0) | High | Mã: PN-18901; Kho: Kho Chính - CN Quận 1 |
| **NHÓM FUNCTION — M3 PRC-DETAIL** | | | | | | | | |
| GARA_PRC_TC_060 | M3 | High | Mở từ LIST (click 1 dòng) | Bảng LIST có data | 1. Click 1 dòng ở LIST | 1. Route `/inventory/price-calc-runs/:runId` load đúng run | Critical | N/A |
| GARA_PRC_TC_061 | M3 | High | Mở qua deep-link | Có toast cảnh báo từ RECALC chứa link | 1. Click link kỳ sau bị ảnh hưởng | 1. Load đúng run theo `runId` trong link | Medium | N/A |
| GARA_PRC_TC_062 | M3 | High | RunInfoGrid hiển thị đúng 8 trường | Run đã load | 1. Quan sát grid | 1. Grid 4 cột × 2 hàng (KHÔNG Card, KHÔNG 2 cột)<br>2. Đủ 8 trường: Kỳ, Từ ngày, Đến ngày, Kho, Phương pháp, Người thực hiện, Ngày giờ thực hiện, Trạng thái | High | N/A |
| GARA_PRC_TC_063 | M3 | High | Trạng thái "Đang tính" gộp PENDING+RUNNING | Run đang PENDING hoặc RUNNING | 1. Quan sát trường Trạng thái | 1. Hiển thị "Đang tính" cho cả 2 trạng thái BE | High | N/A |
| GARA_PRC_TC_064 | M3 | High | Polling tự động mỗi 5s khi Đang tính | Run đang chạy; Pre-condition: có mã với phiếu "Nhập hàng bán bị trả lại" tự tham chiếu Xuất bán cùng kỳ (setup: tạo phiếu Nhập mua → phiếu Xuất bán từ mã đó → phiếu Nhập hàng bán bị trả lại tham chiếu phiếu Xuất bán trên, "Tự nhập giá" để trống) | 1. Mở Detail, quan sát 5s/lần | 1. Refetch đúng chu kỳ 5000ms cố định<br>2. Sau vài vòng lặp hội tụ, đơn giá BQ chốt đúng công thức (BR-PRC-017) | Critical | Xem pre-condition |
| GARA_PRC_TC_065 | M3 | High | Polling dừng khi SUCCEEDED | Run chuyển SUCCEEDED | 1. Chờ tới khi job hoàn tất | 1. `refetchInterval` dừng<br>2. Toast "Tính giá hoàn tất"<br>3. Bảng + RunInfoGrid refresh | High | N/A |
| GARA_PRC_TC_066 | M3 | High | Polling dừng khi COMPLETED_WITH_ERRORS | Run chuyển có lỗi | 1. Chờ tới khi job hoàn tất có lỗi | 1. Toast biến thể lỗi<br>2. Bảng hiện mã lỗi | High | N/A |
| GARA_PRC_TC_067 | M3 | High | Bảng chi tiết đúng 11 cột | Run có items | 1. Quan sát bảng | 1. Thứ tự: STT, Mã nội bộ, Tên sản phẩm nội bộ, ĐVT chính, Tồn đầu kỳ, Nhập trong kỳ, Xuất trong kỳ, Giá bình quân, Số phiếu xuất cập nhật, Trạng thái, Lí do lỗi | High | N/A |
| GARA_PRC_TC_068 | M3 | High | Dòng Tổng dùng `aggregates` BE | Bảng có filter/pagination áp dụng | 1. Đổi filter trạng thái = "Đã tính"<br>2. Quan sát dòng Tổng | 1. Dòng Tổng KHÔNG đổi theo filter (vẫn = full scope, không tự SUM trang hiện tại) | High | N/A |
| GARA_PRC_TC_069 | M3 | High | Mã lỗi hiển thị đúng badge + lý do | Run có ≥1 mã lỗi "Do tồn âm" | 1. Quan sát dòng mã lỗi | 1. Badge "Lỗi" (màu error)<br>2. Cột "Giá bình quân" trống<br>3. "Lí do lỗi" = "Do tồn âm" | High | Lý do: NEGATIVE_STOCK → "Do tồn âm" |
| GARA_PRC_TC_070 | M3 | High | Mã lỗi "Do sự cố hệ thống" (SYSTEM_ERROR) | Job nền bị gián đoạn/hết retry trước khi tính tới 1 mã (cần phối hợp giả lập gián đoạn — khó tái tạo bằng thao tác UI thông thường) | 1. Quan sát mã chưa tới lượt tính khi log chốt "Hoàn thành có lỗi" | 1. Mã đó `status=Lỗi`, "Lí do lỗi" = "Do sự cố hệ thống"<br>2. Mã này vẫn được cover bởi nút "Tính lại mã lỗi" | Low | N/A |
| GARA_PRC_TC_071 | M3 | High | Mẫu số=0 (không tồn đầu, không nhập trong kỳ) → đơn giá=0 | Mã `PN-18903` không có phiếu nhập/xuất nào trong kỳ, không có tồn đầu | 1. Chạy CREATE cho mã `PN-18903`<br>2. Xem kết quả ở Detail | 1. Đơn giá bình quân = 0<br>2. Trạng thái = "Đã tính" (KHÔNG phải "Lỗi") — mẫu số=0 không tính là lỗi (BR-PRC-001) | High | Mã: PN-18903 |
| GARA_PRC_TC_072 | M3 | High | Giá bình quân hiển thị đúng 2 chữ số thập phân | Mã có kết quả tính ra số thập phân dài (vd 3 chữ số) | 1. Xem cột "Giá bình quân" của mã đó | 1. Hiển thị đúng làm tròn 2 chữ số thập phân (HALF_UP) ngay sau khi tính<br>2. Tiền vốn phiếu xuất = giá đã làm tròn (2 lẻ) × SL quy đổi, rồi làm tròn về đồng (BR-PRC-013) | High | N/A |
| GARA_PRC_TC_073 | M3 | High | Mở Detail với runId không tồn tại | runId=99999 không có | 1. Truy cập `/inventory/price-calc-runs/99999` | 1. Redirect về LIST<br>2. Toast lỗi "không tìm thấy" | Medium | runId: 99999 |
| GARA_PRC_TC_074 | M3 | High | Feature flag OFF | Flag `Inventory:InventoryV2` OFF | 1. Truy cập Detail khi flag OFF | 1. Route error boundary hiển thị | Medium | N/A |
| **NHÓM VALIDATE — M3 PRC-DETAIL** | | | | | | | | |
| GARA_PRC_TC_075 | M3 | Medium | Filter search (mã/tên) — client-side | Bảng có nhiều mã | 1. Gõ "PN-189" vào ô search | 1. Debounce 300ms<br>2. Filter khớp một phần mã/tên, KHÔNG gọi lại API | Medium | keyword: PN-189 |
| GARA_PRC_TC_076 | M3 | Medium | Filter dropdown "Trạng thái" | Bảng có mã Đã tính + Lỗi | 1. Chọn "Lỗi" trong dropdown | 1. Chỉ hiện dòng `status=ERROR` | Medium | N/A |
| GARA_PRC_TC_077 | M3 | Medium | Kết hợp search + dropdown trạng thái | — | 1. Search "PN-18" + chọn "Đã tính" | 1. Kết quả thỏa cả 2 điều kiện (AND) | Low | keyword: PN-18 |
| **NHÓM UI & BEHAVIOR — M3 PRC-DETAIL** | | | | | | | | |
| GARA_PRC_TC_078 | M3 | Medium | RunInfoGrid dùng cặp label-value chuẩn a11y | — | 1. Inspect DOM RunInfoGrid | 1. `<dt>/<dd>` hoặc `aria-label` cặp đúng | Low | N/A |
| GARA_PRC_TC_079 | M3 | Medium | Bảng chi tiết & dòng Tổng đúng semantic | — | 1. Inspect bảng | 1. `<th scope="col">`; `<tfoot>` có `aria-label="Dòng tổng"` | Low | N/A |
| GARA_PRC_TC_080 | M3 | Medium | Badge "Lỗi" không chỉ dựa màu | Có dòng lỗi | 1. Quan sát badge | 1. Có text kèm màu (WCAG contrast) | Low | N/A |
| GARA_PRC_TC_081 | M3 | Medium | Nút Recalc loading `aria-busy` | Bấm nút Recalc | 1. Bấm "Tính lại toàn bộ", quan sát | 1. `aria-busy="true"` khi đang gọi | Low | N/A |
| GARA_PRC_TC_082 | M3 | Medium | Empty state khi filter không khớp | Search từ khóa không tồn tại | 1. Search "ZZZ-000" | 1. Hiện "Không có dữ liệu" tại vùng bảng | Medium | keyword: ZZZ-000 |
| **NHÓM PHÂN QUYỀN — M3 PRC-DETAIL** | | | | | | | | |
| GARA_PRC_TC_083 | M3 | High | `garage-owner` thấy đủ RunInfoGrid + bảng + 2 nút Recalc | Tài khoản garage-owner | 1. Mở Detail | 1. Đầy đủ mọi phần tử | Critical | owner_test_20260804@gara.test |
| GARA_PRC_TC_084 | M3 | High | `accountant` thấy giống garage-owner | Tài khoản accountant | 1. Mở Detail | 1. KHÔNG khác biệt so với TC_079 | Critical | accountant_test_20260804@gara.test |
| **NHÓM ẢNH HƯỞNG CHỨC NĂNG LIÊN QUAN — M3 PRC-DETAIL** | | | | | | | | |
| GARA_PRC_TC_085 | M3 | High | Mã SUCCEEDED khớp báo cáo Stock V2 | Run SUCCEEDED, mã PN-18901 | 1. So sánh "Giá bình quân" ở Detail vs GT ở M6/M7/M8 cùng mã | 1. Giá trị khớp nhau, "Số phiếu xuất cập nhật" > 0 | High | Mã: PN-18901 |
| GARA_PRC_TC_086 | M3 | High | Cross-wave: phiếu Xuất bán hiển thị đúng giá vốn mới sau PRC | Mã đã PRC tính giá thành công, có phiếu Xuất bán trong kỳ (thuộc W05, ngoài phạm vi wave 6) | 1. Mở phiếu Xuất bán liên quan (`FEAT-ID-DETAIL-V2`, ngoài Wave 6) | 1. Cột giá vốn hiển thị đúng giá trị mới (không còn 0) — chỉ verify dữ liệu, không test lại toàn bộ UI màn ngoài phạm vi wave | Medium | N/A |
| GARA_PRC_TC_087 | M3 | High | Cross-wave: phiếu "Nhập hàng bán bị trả lại" hiển thị đúng giá kế thừa | Có phiếu trả hàng kế thừa giá từ phiếu Xuất bán gốc đã PRC tính | 1. Mở phiếu "Nhập hàng bán bị trả lại" liên quan (`FEAT-IR-DETAIL-V2`, ngoài Wave 6) | 1. Giá trị nhập hiển thị đúng giá kế thừa từ phiếu Xuất bán gốc (BR-IRV2-031) — chỉ verify dữ liệu | Medium | N/A |
| GARA_PRC_TC_088 | M3 | High | Disable 2 nút Recalc khi run đang PENDING/RUNNING | Run đang chạy | 1. Quan sát 2 nút khi status=RUNNING | 1. Cả 2 nút disable | High | N/A |
| GARA_PRC_TC_089 | M3 | High | Ẩn/disable "Tính lại mã lỗi" khi không có mã lỗi | Run SUCCEEDED hoàn toàn (itemsErrorCount=0) | 1. Quan sát nút "Tính lại mã lỗi" | 1. Ẩn hoặc disable, có `title`/tooltip lý do | High | N/A |
| **NHÓM FUNCTION — M4 PRC-RECALC** | | | | | | | | |
| GARA_PRC_TC_090 | M4 | High | Bấm "Tính lại toàn bộ" | Run có kết quả cũ | 1. Bấm "Tính lại toàn bộ" | 1. Mutation `runScope=ALL`<br>2. 202, toast "Đã bắt đầu tính lại"<br>3. Redirect run mới | Critical | N/A |
| GARA_PRC_TC_091 | M4 | High | Bấm "Tính lại mã lỗi" | Run có ≥1 mã lỗi | 1. Bấm "Tính lại mã lỗi" | 1. Mutation `runScope=ERROR_ONLY`<br>2. Redirect run mới | Critical | N/A |
| GARA_PRC_TC_092 | M4 | High | Response `affectedSubsequentPeriods` non-empty | Kỳ sau đã tính | 1. Bấm Recalc | 1. Toast cảnh báo non-blocking liệt kê kỳ sau | Medium | N/A |
| GARA_PRC_TC_093 | M4 | High | RECALC khi kỳ đã đóng | Kỳ đã đóng | 1. Bấm "Tính lại toàn bộ" | 1. Dialog cảnh báo (`ERR-INV-024`), không redirect | High | N/A |
| GARA_PRC_TC_094 | M4 | High | RECALC khi đang có job chạy cùng kỳ+kho | Job khác đang RUNNING cùng kỳ+kho | 1. Bấm Recalc | 1. Dialog chặn (`ERR-INV-029`) | High | N/A |
| GARA_PRC_TC_095 | M4 | High | Double-click nút Recalc | — | 1. Bấm nút Recalc 2 lần liên tiếp nhanh | 1. Chỉ 1 request thực thi (clientNonce idempotency) | High | N/A |
| GARA_PRC_TC_096 | M4 | High | Mở lại kỳ đã đóng rồi RECALC | Kỳ vừa mở lại | 1. Mở lại kỳ (qua FEAT-AP-EDIT, ngoài wave)<br>2. Bấm Recalc | 1. Chạy lại bình thường | Medium | N/A |
| **NHÓM UI & BEHAVIOR — M4 PRC-RECALC** | | | | | | | | |
| GARA_PRC_TC_097 | M4 | Medium | Label "Tính lại  toàn bộ" đúng verbatim (2 khoảng trắng) | — | 1. Quan sát nút | 1. Text đúng "Tính lại  toàn bộ" theo Figma | Low | N/A |
| GARA_PRC_TC_098 | M4 | Medium | Label "Tính lại mã lỗi " đúng verbatim | — | 1. Quan sát nút | 1. Text đúng "Tính lại mã lỗi " (1 space cuối) | Low | N/A |
| GARA_PRC_TC_099 | M4 | Medium | 2 nút disable đồng thời khi loading | Bấm 1 nút | 1. Bấm "Tính lại toàn bộ", quan sát nút còn lại | 1. Cả 2 nút disable trong lúc gọi (tránh race) | Medium | N/A |
| GARA_PRC_TC_100 | M4 | Medium | Dialog lỗi trap focus + Escape | Dialog lỗi đang mở | 1. Nhấn Escape | 1. Dialog đóng, focus trả về nút vừa bấm | Low | N/A |
| **NHÓM PHÂN QUYỀN — M4 PRC-RECALC** | | | | | | | | |
| GARA_PRC_TC_101 | M4 | High | `garage-owner` bấm được cả 2 nút | Tài khoản garage-owner | 1. Mở Detail, quan sát 2 nút | 1. Cả 2 nút hiển thị + bấm được | Critical | owner_test_20260804@gara.test |
| GARA_PRC_TC_102 | M4 | High | `accountant` bấm được cả 2 nút | Tài khoản accountant | 1. Mở Detail, quan sát 2 nút | 1. Giống hệt TC_095 | Critical | accountant_test_20260804@gara.test |
| **NHÓM ẢNH HƯỞNG CHỨC NĂNG LIÊN QUAN — M4 PRC-RECALC** | | | | | | | | |
| GARA_PRC_TC_103 | M4 | High | Run mới có `source_run_id` trỏ đúng run gốc | Sau RECALC | 1. Kiểm tra run mới | 1. `sourceRunId` = id của run gốc (audit trail) | High | N/A |
| GARA_PRC_TC_104 | M4 | High | Scope ERROR_ONLY giữ nguyên mã "Đã tính" | Run có mã Đã tính + mã Lỗi | 1. RECALC scope ERROR_ONLY | 1. Mã "Đã tính" giữ nguyên kết quả cũ, không recompute | High | N/A |
| GARA_PRC_TC_105 | M4 | High | Kết quả RECALC cập nhật đúng ở Stock V2 Reports | Sau RECALC thành công | 1. Mở M6/M7/M8 cùng mã | 1. Giá trị hiển thị = kết quả RECALC mới nhất | High | N/A |
| GARA_PRC_TC_106 | M4 | High | 2 request RECALC/CREATE gần đồng thời cùng kỳ+kho | Mở 2 tab, cùng điền form giống nhau (best-effort thủ công — race condition không đảm bảo chính xác 100% qua thao tác tay, khuyến nghị bổ sung automation/integration test riêng) | 1. Submit ở cả 2 tab cách nhau <1 giây | 1. 1 request 202 thành công<br>2. Request kia chặn `ERR-INV-029`<br>3. Không deadlock/race giá vốn | Medium | Kỳ: Tháng 07/2026; Kho: Kho Chính - CN Quận 1 |
| **NHÓM FUNCTION — M5 PRC-DELETE** | | | | | | | | |
| GARA_PRC_TC_107 | M5 | High | Click icon Xóa mở dialog đúng nội dung | Bảng LIST có data | 1. Click icon "Xóa" | 1. Dialog hiện đúng "Bạn có muốn xóa log tính giá {periodFrom} - {periodTo} của {warehouseName}." | Critical | N/A |
| GARA_PRC_TC_108 | M5 | High | Xác nhận xóa (kỳ mở, log terminal) | Log SUCCEEDED, kỳ mở | 1. Bấm "Xác nhận xoá" | 1. Soft-delete<br>2. Toast thành công<br>3. Dialog đóng, LIST refetch | Critical | N/A |
| GARA_PRC_TC_109 | M5 | High | Hủy — đóng dialog không xóa | — | 1. Bấm "Hủy" | 1. Dialog đóng, KHÔNG gọi mutation | High | N/A |
| GARA_PRC_TC_110 | M5 | High | Escape — đóng dialog không xóa | — | 1. Nhấn Escape | 1. Dialog đóng, KHÔNG gọi mutation | Medium | N/A |
| GARA_PRC_TC_111 | M5 | High | Xóa khi kỳ đã đóng | Log thuộc kỳ đã đóng | 1. Bấm "Xác nhận xoá" | 1. Dialog swap "Không thể xóa" — "Log tính giá đã được dùng để khóa giá vốn hoặc kỳ kế toán đã đóng nên không được xóa." | High | N/A |
| GARA_PRC_TC_112 | M5 | High | Xóa khi log đang "Đang tính" | Log status=PENDING/RUNNING | 1. Bấm "Xác nhận xoá" | 1. Dialog swap "Không thể xóa" — "Đang có lần tính giá chạy cho kỳ + kho này — vui lòng đợi hoàn tất" (khác message TC_105) | High | N/A |
| GARA_PRC_TC_113 | M5 | High | Xóa thành công — giá vốn không rollback | Log SUCCEEDED đã cập nhật giá vốn | 1. Xóa log<br>2. Mở phiếu xuất liên quan | 1. Giá vốn phiếu xuất vẫn giữ nguyên giá trị đã tính | High | N/A |
| **NHÓM VALIDATE — M5 PRC-DELETE** | | | | | | | | |
| GARA_PRC_TC_114 | M5 | N/A | Không có field cần validate | — | — | N/A — dialog chỉ có nút xác nhận/hủy, không có input field | N/A | N/A |
| **NHÓM UI & BEHAVIOR — M5 PRC-DELETE** | | | | | | | | |
| GARA_PRC_TC_115 | M5 | Medium | Dialog width 441px, bo góc vuông | Dialog xác nhận đang mở | 1. Inspect dialog | 1. `width=441px`, `rounded-none` (không bo góc) | Low | N/A |
| GARA_PRC_TC_116 | M5 | Medium | Title luôn màu đen dù biến thể nào | Dialog "Không thể xóa" đang mở | 1. Quan sát title | 1. `text-foreground` (đen), KHÔNG nhuộm đỏ/cam | Low | N/A |
| GARA_PRC_TC_117 | M5 | Medium | Nút loading khi đang chờ mutation | Bấm "Xác nhận xoá" | 1. Bấm và quan sát ngay | 1. Nút disable + spinner, chặn double-submit | Medium | N/A |
| GARA_PRC_TC_118 | M5 | Medium | KHÔNG hiển thị mã lỗi kỹ thuật ra UI | Dialog chặn đang mở | 1. Quan sát nội dung dialog | 1. Không thấy `ERR-INV-024`/`ERR-INV-029` — chỉ text tiếng Việt | Medium | N/A |
| GARA_PRC_TC_119 | M5 | Medium | Nút xác nhận đúng label "Xác nhận xoá" | — | 1. Quan sát nút xác nhận | 1. Text đúng "Xác nhận xoá" (theo Figma, không phải "Xóa khoản mục") | Medium | N/A |
| **NHÓM PHÂN QUYỀN — M5 PRC-DELETE** | | | | | | | | |
| GARA_PRC_TC_120 | M5 | High | `garage-owner` thao tác xóa đầy đủ | Tài khoản garage-owner | 1. Xóa 1 log | 1. Thao tác thành công bình thường | Critical | owner_test_20260804@gara.test |
| GARA_PRC_TC_121 | M5 | High | `accountant` thao tác xóa đầy đủ | Tài khoản accountant | 1. Xóa 1 log | 1. Giống hệt TC_114 | Critical | accountant_test_20260804@gara.test |
| **NHÓM ẢNH HƯỞNG CHỨC NĂNG LIÊN QUAN — M5 PRC-DELETE** | | | | | | | | |
| GARA_PRC_TC_122 | M5 | High | Sau xóa, dữ liệu Stock V2 Reports không đổi (đúng thiết kế không rollback) | Đã xóa 1 log SUCCEEDED | 1. Mở M6/M7/M8 cùng mã | 1. Giá trị GT xuất/tồn vẫn giữ nguyên như trước khi xóa log (không bị rollback về 0) | High | N/A |