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
| Tổng số TC | 123 |
| Kỹ thuật áp dụng | Equivalence Partitioning, Boundary Value Analysis, Decision Table (RECALC scope, error-reason enum), State Transition (log status PENDING→RUNNING→SUCCEEDED/COMPLETED_WITH_ERRORS) |
| Nguồn requirements | `requirements/gara/wave-06/wave-specs/` |
| Diagram tham chiếu | `practices/diagram/wave06-prc-lifecycle-activity.mermaid` / `.svg` |

## 2. Bảng tổng hợp Risk Level

| Module | Function | Validate | UI & Behavior | Phân quyền | Ảnh hưởng liên quan | Tổng TC |
|---|---|---|---|---|---|---|
| M1 PRC-LIST | High (8) | Medium (4) | Medium (8) | High (3) | High (4) | 27 |
| M2 PRC-CREATE | High (16) | Medium (6) | Medium (6) | High (2) | High (2) | 32 |
| M3 PRC-DETAIL | High (15) | Medium (3) | Medium (5) | High (2) | High (5) | 30 |
| M4 PRC-RECALC | High (7) | N/A (1 — action button không có field, ghi rõ) | Medium (4) | High (2) | High (4) | 18 |
| M5 PRC-DELETE | High (7) | N/A (1 — dialog không có field, ghi rõ) | Medium (5) | High (2) | High (1) | 16 |
| **Tổng** | **53** | **15** | **28** | **11** | **16** | **123** |

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
| Q1 | Label lệch giữa 2 nguồn (nút xác nhận xóa, nút hủy) | TC dùng đúng text theo tier-spec (Figma-derived): "Xác nhận xoá", "Huỷ bỏ" — có TC riêng verify label (GARA_PRC_TC_120 — Xác nhận xoá; GARA_PRC_TC_051 — Huỷ bỏ) |
| Q2 | Test data BQGQ hội tụ | Pre-condition ghi rõ chuỗi phiếu cần dựng (GARA_PRC_TC_064) |
| Q3 | Safety cap 100 vòng | Không đưa vào bộ TC UI này — out of scope Manual UI (ghi trong Traceability Gap Analysis) |
| Q4 | Concurrency 2 request đồng thời | GARA_PRC_TC_107, Priority Medium, best-effort |
| Q5 | Temporal crash resilience | Out of scope Manual UI Test |
| Q6 | `productId` null ở NXT | Áp dụng cho module Stock V2 (xem `TC_STOCK-V2-REPORTS.md`) |

## 6. Bảng thống kê

| Priority | Số lượng |
|---|---|
| Critical | 24 |
| High | 46 |
| Medium | 29 |
| Low | 22 |
| N/A | 2 |
| **Tổng** | **123** |

> 2 dòng "N/A" là GARA_PRC_TC_097 (M4, nhóm Validate — 2 nút Recalc là action button cố định, không có input field) và GARA_PRC_TC_115 (M5, nhóm Validate — dialog không có input field) — cả 2 không áp dụng risk level/priority.


---

## 7. Danh sách file con

> Bảng Test Cases chi tiết được tách theo sub-module (xem SKILL.md `rbt_manual_testing` — mục "Tách file theo sub-module"). TC ID dùng chung 1 prefix `GARA_PRC_TC_`, đánh số liên tục xuyên suốt các file con theo đúng thứ tự dưới đây.

| File | Sub-module | TC ID range | Tổng TC |
|---|---|---|---|
| `TC_PRC-LIST.md` | M1 PRC-LIST | `GARA_PRC_TC_001` – `GARA_PRC_TC_027` | 27 |
| `TC_PRC-CREATE.md` | M2 PRC-CREATE | `GARA_PRC_TC_028` – `GARA_PRC_TC_059` | 32 |
| `TC_PRC-DETAIL.md` | M3 PRC-DETAIL | `GARA_PRC_TC_060` – `GARA_PRC_TC_089` | 30 |
| `TC_PRC-RECALC.md` | M4 PRC-RECALC | `GARA_PRC_TC_090` – `GARA_PRC_TC_107` | 18 |
| `TC_PRC-DELETE.md` | M5 PRC-DELETE | `GARA_PRC_TC_108` – `GARA_PRC_TC_123` | 16 |
