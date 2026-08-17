# Test Cases (UI) — Gara Wave 7 — Module DPL (Driver Plus Link / Menu "Liên kết")

> Rollup index cho toàn bộ Manual Test Case UI (schema 9 cột FULL RBT, sinh theo skill `rbt_manual_testing`) của feature **FEAT-SYS-DRIVERPLUS-LINK** (Web GMS + Mobile `garage-mobile`). Bàn giao chính thức là các cặp `.md` + `.xlsx` liệt kê ở mục 7 — mỗi sub-module là 1 file riêng, KHÔNG gộp chung.
> Phần regression trên Booking (List/Detail/Edit khi hiển thị booking nguồn Driver+) nằm ở module riêng `TC_BOOKREG.md` (không phải sub-module của DPL, khác route/feature) — xem file đó riêng.

## 1. Thông tin chung

| Field | Value |
|---|---|
| Dự án | Gara Wave 7 — PKG-W07 (Partner Link + Booking relay + Document sync Driver Plus) |
| Module | DPL — Driver Plus Link (menu "Liên kết" Web GMS / tab "Liên kết" Mobile) |
| Nguồn requirements | `requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md` (v36, 43 AC / 14 nhóm A→N) |
| URL/Route | Web: `/partner-links` (menu "Liên kết", tab "Driver Plus") · Mobile: tab "Liên kết" bottom-nav |
| Nền tảng | Web GMS + Mobile `garage-mobile` (parity 100% ngoại trừ Nhóm N: entry point, layout danh sách, màn Bộ lọc) |
| Feature flag | `PartnerLink:DriverPlus` (default `on`, kill-switch khẩn cấp) |
| Tổng số TC | **209** (8 sub-module) |
| Kỹ thuật áp dụng | Equivalence Partitioning, Boundary Value Analysis (textarea 0/1/2000/2001 ký tự), Decision Table (filter 4 checkbox), State Transition (4 trạng thái LKD), Use Case Testing |

## 2. Bảng tổng hợp Risk Level theo Module × Nhóm

| Sub-module | Function | Validate | UI & Behavior | Phân quyền | Ảnh hưởng liên quan | Tổng |
|---|---|---|---|---|---|---|
| M1 PL-NAV-LIST | 27 | N/A | 13 | 3 | 7 | 50 |
| M2 PL-DETAIL | 22 | N/A | 7 | 2 | 3 | 34 |
| M3 PL-APPROVE | 22 | N/A | 5 | 2 | 2 | 31 |
| M4 PL-REJECT | 10 | 6 | 3 | 2 | 2 | 23 |
| M5 PL-RESYNC | 9 | N/A | 3 | 2 | 2 | 16 |
| M6 PL-CANCEL | 10 | 6 | 3 | 2 | 2 | 23 |
| M7 PL-INBOUND-GUARD | 12 + 2 (gap-fill) | N/A | 2 | 2 | 2 | 20 |
| M8 PL-PERM-ERROR | 5 + 1 (gap-fill) | N/A | 2 | 2 | 2 | 12 |
| **Tổng** | **120** | **12** | **38** | **17** | **22** | **209** |

## 3. Test Data thiết yếu

| Loại | Giá trị | Ghi chú |
|---|---|---|
| Tenant chính | 5001 "Garage Đăng Vinh" | Có sẵn 4 record đủ 4 trạng thái LKD-2026-001..004, dùng xuyên suốt hầu hết TC |
| Tenant rỗng | 7003 "Garage Mới" | 0 record — test empty state AC-7 |
| Tenant flag-off | 5099 | `PartnerLink:DriverPlus=off` — test kill-switch AC-43 |
| Tenant cap phòng vệ | 9001 | 501 record giả lập — test `truncated` cap 500 (BE), sort |
| Tài khoản garage-owner | owner_test_20260817@gara.test (role "Chủ garage") | Test phân quyền + snapshot "Người thực hiện" |
| Tài khoản accountant | acct_test_20260817@gara.test (role "Kế toán") | Test phân quyền dual-persona |
| Tài khoản không hợp lệ | tech_test_20260817@gara.test (role khác) | Test chặn truy cập route |
| Mã LKD mẫu | LKD-2026-001 (PENDING) / 002 (LINKED) / 003 (REJECTED) / 004 (UNLINKED) | Đồng bộ với test data đã dùng ở bộ TC API wave 7 (`TC_PARTNERLINK_API.md`) để tái sử dụng fixture |

## 4. Traceability Matrix (AC → Sub-module)

| Nhóm AC nguồn | AC | Sub-module | TC ID range |
|---|---|---|---|
| A — Điều hướng & khung màn hình | AC-1, 2, 3 | M1 | 001-003 |
| B — Danh sách (panel trái) | AC-4, 5, 6, 7 | M1 | 002, 004-009 |
| C — Form xem chi tiết (panel phải) | AC-8, 9, 10, 11 | M2 | 051-069 |
| D — Action Duyệt | AC-12, 13, 14, 15, 16 | M3 | 085-101 |
| E — Action Từ chối | AC-17, 18, 19 | M4 | 116-122, 126-131 |
| F — Action Đồng bộ lại | AC-20, 21 | M5 | 139-144, 148-149 |
| G — Action Hủy liên kết | AC-22, 23, 24 | M6 | 155-161, 165-170 |
| H — Re-request | AC-25 | M7 | 178-181 |
| I — Phân quyền | AC-26 | M1-M8 (mỗi module 2-3 TC riêng) + M8 matrix | 041-043, 080-081, 112-113, 135-136, 151-152, 174-175, 192-193, 203-204 |
| J — Race condition & lỗi hệ thống | AC-27, 28, 29, 30, 31, 32 | M2 (AC-30), M3 (AC-27/29/31), M4/M5/M6 (AC-27/29), M8 (AC-32), M8 gap-fill (AC-28) | 070, 103-105, 123-124, 145-146, 162-163, 196, 207 |
| K — Single-active guard | AC-34 | M7 | 181 |
| L — Hủy 2 chiều (inbound D+ unlink) | AC-33, 35 | M1 (TC_050, AC-33 sơ bộ), M7 (182-189, AC-35 đầy đủ), M8 gap-fill (208-209, AC-33 đầy đủ) | 050, 182-189, 208-209 |
| M — Notification outbound | AC-36, 37, 38, 39 | Ngoài phạm vi UI (thuần backend Kafka) — đã có TC ở `TC_PARTNERLINK_KAFKA_API.md` | N/A |
| N — Mobile | AC-40, 41, 42 | M1 | 010-022, 039-040 |
| Feature-flag | AC-43 | M1 (048-049), M8 (197-206) | — |

**Audit coverage**: 43/43 AC có ≥1 TC tham chiếu. 2 gap phát hiện trong lượt audit tổng cuối cùng (AC-28 "cascade bỏ qua record đã terminal", AC-33 "D+ withdraw pending — độ sâu tương đương AC-35") đã được vá bằng 3 TC bổ sung (207-209) trong `TC_DPL-PERM-ERROR.md` trước khi đóng gói.

## 5. Ambiguities & Q&A đã áp dụng

Toàn bộ 10 câu hỏi Q1-Q10 đặt ra ở Bước 2 đã được user xác nhận **"lấy thông tin gợi ý"** — áp dụng nguyên văn đề xuất mục 5 của từng câu, gắn nhãn `[ASSUMPTION]`/`[PENDING_DOC]` trực tiếp trong Test Title/Expected Result của TC liên quan:

| Q# | Chủ đề | TC áp dụng |
|---|---|---|
| Q1 (RR-009) | Checkbox scroll-gate: chấp nhận scroll bàn phím tương đương chuột, aria-live best-effort | GARA_DPL_TC_091, 111 |
| Q2 (RR-017) | Kill-switch tắt giữa modal đang mở → coi là subcase lỗi hệ thống chung `ERR-DPL-005` | GARA_DPL_TC_115 |
| Q3 (RR-012) | Fallback `{Tên garage}` khi `business_name` NULL → dùng cụm trung tính, không hiển thị "null" | GARA_DPL_TC_149 |
| Q4 (RR-015) | Mobile lỗi tải danh sách ban đầu → thông báo lỗi + hành động thử lại generic | GARA_DPL_TC_027 |
| Q5 (RR-019) | F5/reload → RESET filter về default (theo cơ chế Zustand in-memory hiện tại) | GARA_DPL_TC_024 |
| Q6 (RR-022) | Cơ chế "làm mới" cho cập nhật ngầm → dùng F5 làm hành động cụ thể trong Test Steps | GARA_DPL_TC_050, 182-189, 208-209 |
| Q7 (RR-023) | 404 tại auto-select → không đủ điều kiện tạo TC thực tế, bỏ qua có ghi chú | Không sinh TC (ghi nhận known gap thấp) |
| Q8 (RR-018) | Panel phải lỗi 503 khi detail API fail → tái dùng pattern banner+Tải lại | GARA_DPL_TC_071 |
| Q9 (RR-033) | "Loại dịch vụ" GMS bắt buộc khi Sửa booking D+ dù `service_type` null → test theo đúng nghĩa đen đặc tả (nút Lưu vẫn disabled) | Module BOOKREG (`TC_BOOKREG.md`, ngoài rollup này) |
| Q10 (RR-040) | Bước 15 phút khi Sửa giờ hẹn booking D+ → KHÔNG mở rộng ràng buộc từ luồng Tạo sang luồng Sửa | Module BOOKREG (`TC_BOOKREG.md`, ngoài rollup này) |

## 6. Bảng thống kê Priority

| Priority | Số lượng |
|---|---|
| Critical | 28 |
| High | 99 |
| Medium | 64 |
| Low | 18 |
| **Tổng** | **209** |

## 7. Danh sách file con

| File | Sub-module | TC ID range | Tổng TC |
|---|---|---|---|
| `TC_DPL-NAVLIST.md` | M1 — Điều hướng & Danh sách (Web+Mobile) | `GARA_DPL_TC_001` – `GARA_DPL_TC_050` | 50 |
| `TC_DPL-DETAIL.md` | M2 — Form xem chi tiết | `GARA_DPL_TC_051` – `GARA_DPL_TC_084` | 34 |
| `TC_DPL-APPROVE.md` | M3 — Action Duyệt | `GARA_DPL_TC_085` – `GARA_DPL_TC_115` | 31 |
| `TC_DPL-REJECT.md` | M4 — Action Từ chối | `GARA_DPL_TC_116` – `GARA_DPL_TC_138` | 23 |
| `TC_DPL-RESYNC.md` | M5 — Action Đồng bộ lại | `GARA_DPL_TC_139` – `GARA_DPL_TC_154` | 16 |
| `TC_DPL-CANCEL.md` | M6 — Action Hủy liên kết | `GARA_DPL_TC_155` – `GARA_DPL_TC_177` | 23 |
| `TC_DPL-INBOUND-GUARD.md` | M7 — Re-request / Single-active guard / Hủy 2 chiều | `GARA_DPL_TC_178` – `GARA_DPL_TC_195` | 18 |
| `TC_DPL-PERM-ERROR.md` | M8 — Phân quyền tổng hợp / Lỗi hệ thống / Kill-switch / Gap-fill audit (AC-28, AC-33) | `GARA_DPL_TC_196` – `GARA_DPL_TC_209` | 14 |

> Module regression Booking (`FEAT-BOOK-LIST`/`DETAIL`/`EDIT` cho booking nguồn Driver+) nằm ở file độc lập ngoài rollup này (module riêng, khác route/feature, không dùng chung prefix TC ID): `TC_BOOKREG.md` — 17 TC, tự chứa đầy đủ mục 1-7 trong 1 file (không tách sub-module vì scope nhỏ). Xem file đó để biết chi tiết TC ID.

**Tổng UI Test Case Wave 7**: 209 (DPL) + 17 (BOOKREG) = **226 TC**.
