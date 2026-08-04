---
type: feature
artifact_kind: feature
status: PLANNED
version: 23
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INSURANCE-SETTLEMENT"
boundary: "gf-accounting"
modifies: ["FEAT-STL-DETAIL"]
related: ["FEAT-INS-STL-DETAIL"]
change_type: "brownfield-enhancement"
last_reviewed: "2026-06-22"
---

# FEAT-INS-DOSSIER-CREATE: Tạo & quản lý hồ sơ bảo hiểm (4 tài liệu chuẩn)

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-INS-DOSSIER-CREATE` |
| Title | Tạo & quản lý hồ sơ bảo hiểm (4 tài liệu chuẩn) |
| Parent Epic | `EP-INSURANCE-SETTLEMENT` |
| Boundary | `gf-accounting` |
| Priority | P1 |
| Status | PLANNED |
| Loại thay đổi | **CR — mở rộng feature production** (không phải màn hình mới) |
| Màn hình target | [`FEAT-STL-DETAIL`](./FEAT-STL-DETAIL.md) — Chi tiết phiếu quyết toán (production, gf-accounting) |
| Tích hợp qua | [`FEAT-INS-STL-DETAIL`](./FEAT-INS-STL-DETAIL.md) — lớp mở rộng BH của cùng màn |
| Depends on | Phiếu QT BH (tạo từ luồng baseline EP-SETTLEMENT + truyền phân bổ qua FEAT-INS-SO-ADJUSTMENT AC-15) là context |

## 0. Bối cảnh thay đổi (Change Request — DEV đọc trước)

> ⚠️ **ĐÂY LÀ CR MỞ RỘNG MÀN HÌNH ĐÃ CÓ — KHÔNG dựng màn hình mới.**
>
> - **Target (production)**: [`FEAT-STL-DETAIL`](./FEAT-STL-DETAIL.md) — màn **Chi tiết phiếu quyết toán** đang chạy production (gf-accounting): 3 tab baseline + nút hành động + phân quyền. DEV agent **PHẢI đọc FEAT-STL-DETAIL trước** để nắm cấu trúc màn hiện có và tái sử dụng.
> - **Tích hợp qua**: [`FEAT-INS-STL-DETAIL`](./FEAT-INS-STL-DETAIL.md) — lớp mở rộng bảo hiểm trên cùng màn, đã thêm nút **"+ Tạo hồ sơ bảo hiểm"** trên thanh hành động (= entry point của CR này, chỉ hiển thị khi Bên thanh toán = Bảo hiểm — BR-INS-STL-DET-007).
> - **Phạm vi CR này**: THÊM **modal "Hồ sơ bảo hiểm"** (lập & xuất 4 tài liệu chuẩn) mở từ nút trên. KHÔNG đụng luồng tạo phiếu QT, KHÔNG đụng phiếu QT khách hàng.
> - **Nguyên tắc DEV**: extend, không rebuild; tái sử dụng component màn hiện có; không phá vỡ hành vi baseline phiếu QT khách hàng.

## 1. User Story

**As** kế toán, **I want** lập bộ hồ sơ bảo hiểm chuẩn (4 tài liệu: Phiếu báo giá, Phiếu quyết toán, Biên bản nghiệm thu, Giấy ủy quyền) từ Phiếu quyết toán bảo hiểm — điền nội dung template, xuất PDF cả bộ — **so that** tôi gửi đầy đủ giấy tờ ngay lần đầu cho doanh nghiệp bảo hiểm, tránh bị trả lại và rút ngắn thời gian thu tiền.

## 2. Acceptance Criteria

### Nhóm A — Mở màn hình & bố cục

> **Bố cục màn hồ sơ:** danh sách 4 tài liệu hiển thị dạng:
> - **Web** — modal **"Hồ sơ bảo hiểm - {mã phiếu QT}"**: 4 dòng **accordion dọc** (checkbox + tiêu đề + dòng phụ + mũi tên ▾). Click 1 dòng → **mở rộng preview/template ngay inline** trong dòng đó (xem AC-8). Footer **"Huỷ bỏ" / "Xuất hồ sơ bảo hiểm"**.
> - **App** — màn **"Hồ sơ bảo hiểm"** (header có nút quay lại ‹): tiêu đề **"Tài liệu bảo hiểm"** + dòng mô tả **"Chọn tài liệu cần xuất."**; 4 dòng **list dọc** (checkbox + tiêu đề + dòng phụ + mũi tên ›). Tap 1 dòng → **điều hướng sang màn chi tiết/điền** của tài liệu. Footer **"Xuất hồ sơ bảo hiểm"** (disabled đến khi hợp lệ).
> Trạng thái "sẵn sàng" của tài liệu thể hiện qua **dòng phụ mô tả**. Checkbox **mặc định bỏ trống** — kế toán tự tích chọn tài liệu cần xuất.

- [ ] **AC-1**: Mở màn hồ sơ từ phiếu QT BH
  - Tại: phiếu QT BH (FEAT-INS-STL-DETAIL), nút **"Tạo hồ sơ bảo hiểm"**.
  - **Tiền đề hiển thị entry (chốt 2026-06-10)**: nút **"+ Tạo hồ sơ bảo hiểm"** **chỉ hiển thị/khả dụng khi Bên thanh toán của phiếu QT = Bảo hiểm** — ẩn với phiếu QT Khách hàng (xem FEAT-INS-STL-DETAIL AC-13 + BR-INS-STL-DET-007). Gate **chỉ theo Bên thanh toán**, **không** ràng buộc trạng thái phiếu (giao diện người dùng không có trạng thái DRAFT).
  - Khi: kế toán nhấn nút.
  - Thì:
    - **Web**: mở **modal "Hồ sơ bảo hiểm - {mã phiếu QT}"** (vd "Hồ sơ bảo hiểm - #SET-20260326-00001"); đóng qua **"Huỷ bỏ"** ở footer.
    - **App**: điều hướng sang **màn "Hồ sơ bảo hiểm"** (full screen, header "Hồ sơ bảo hiểm" + nút quay lại ‹).
    - Context = phiếu QT BH đang xem. Bộ hồ sơ khởi tạo version 1 (hoặc n+1 nếu BH yêu cầu sửa — xem AC-11).

- [ ] **AC-2**: Màn/modal Hồ sơ bảo hiểm
  - Tại: đầu modal (web) / đầu màn (app).
  - Khi: màn hồ sơ mở.
  - Thì: **App** hiển thị tiêu đề **"Tài liệu bảo hiểm"** + dòng mô tả **"Chọn tài liệu cần xuất."** 

- [ ] **AC-3**: 4 dòng tài liệu (accordion dọc — web / list dọc — app)
  - Tại: khu danh sách tài liệu.
  - Khi: màn hồ sơ mở.
  - Thì: hiển thị 4 dòng cố định **theo thứ tự**, mỗi dòng gồm **checkbox + tiêu đề + dòng phụ + mũi tên (▾ web / › app)**:
    1. **"Phiếu quyết toán"** — dòng phụ = **mã phiếu QT** (vd "SET-20260326-00001").
    2. **"Phiếu báo giá"** — dòng phụ = mã phiếu (web: **mã PDV** — vd "PDV-20260320-00639"; app: **mã phiếu QT** — vd "SET-20260326-00001").
    3. **"Biên bản nghiệm thu"** — dòng phụ web: **"Thông tin được sử dụng để lập biên bản nghiệm thu"**; app: **"Thông tin được sử dụng để lập biên bản nghiệm thu"**.
    4. **"Giấy ủy quyền nhận tiền bồi thường"** — dòng phụ web: **"Áp dụng cho garage chưa ký liên kết với bảo hiểm"**; app: **"Áp dụng cho garage chưa ký liên kết với bảo hiểm ·"**.
  - **Checkbox tất cả 4 dòng mặc định bỏ trống** — kế toán tự tích chọn tài liệu cần xuất. Cả 4 tài liệu đều có thể tích chọn ngay, không phụ thuộc trạng thái điền template.
  - **Web**: click dòng → **mở rộng accordion** hiển thị preview/template ngay trong dòng (AC-8); dòng đang mở highlight + đổi mũi tên ▴.
  - **App**: tap dòng → **mở màn chi tiết** tài liệu tương ứng (AC-4..AC-7).
  - Phiếu quyết toán + Phiếu báo giá = **auto-sinh sẵn** từ snapshot phiếu QT BH. Biên bản nghiệm thu + Giấy ủy quyền = **template điền trực tiếp**; kế toán tự quyết khi nào tích chọn để xuất.

### Nhóm B — Nội dung từng tài liệu

- [ ] **AC-4**: Phiếu quyết toán — auto-sinh "PHIẾU QUYẾT TOÁN SỬA CHỮA", read-only
  - Tại: dòng **"Phiếu quyết toán"** (web: mở rộng accordion; app: màn chi tiết).
  - Khi: kế toán mở.
  - Thì: preview render template **"PHIẾU QUYẾT TOÁN SỬA CHỮA"** từ dữ liệu phiếu QT BH gốc gồm:
    - Tiêu đề + dòng phụ **"{mã phiếu QT}"** (vd "SET-20260326-00001").
    - Header thông tin: **Garage**, **Ngày quyết toán**, **Khách hàng** (vd "Chungntt — 0123123123"), **Biển số xe** (vd "30A1234 — ACURA TSX").
    - Bảng **Dịch vụ thực hiện**: **STT | Nội dung | ĐVT | SL | Đơn giá | Thành tiền** + dòng **Tổng**.
    - Bảng **Phụ tùng sử dụng**: cùng cấu trúc cột + dòng **Tổng**.
    - Khối **Phân bổ bảo hiểm**: các dòng **CK liên kết BH - Vật tư**, **CK liên kết BH - Công dịch vụ**, **Giảm trừ bồi thường**, **Khấu hao vật tư/thay mới**, **Khấu trừ bảo hiểm** + dòng **Tổng thanh toán**.
  - Sẵn sàng ngay khi mở (có thể tích chọn để xuất; checkbox mặc định bỏ trống). **Toàn bộ read-only** — hệ thống tự sinh, **không cho sửa ở bước này** (muốn sửa số liệu phải quay về phiếu QT BH / SO gốc). Thao tác: **"In phiếu"** (web).

- [ ] **AC-5**: Phiếu báo giá — auto-sinh "PHIẾU BÁO GIÁ SỬA CHỮA", read-only
  - Tại: dòng **"Phiếu báo giá"** (web: mở rộng accordion; app: màn chi tiết).
  - Khi: kế toán mở.
  - Thì: preview render template **"PHIẾU BÁO GIÁ SỬA CHỮA"** từ snapshot phiếu QT BH gồm:
    - Tiêu đề + dòng phụ **"{mã PDV} · Bảo hiểm đã duyệt giá"** (vd "PDV-20260320-00639 ").
    - **Garage** (tên garage), **Ngày báo giá**, **Công ty bảo hiểm** (vd Bảo hiểm Bảo Việt), **Số hợp đồng BH** (vd BV-2903812-093814).
    - Bảng hạng mục: **STT | Nội dung sửa chữa | Phụ tùng | Đơn giá | Thành tiền** + dòng **Tổng**.
  - Sẵn sàng ngay khi mở (có thể tích chọn để xuất; checkbox mặc định bỏ trống). **Toàn bộ read-only** — hệ thống tự sinh, **không cho sửa ở bước này** (muốn sửa số liệu phải quay về phiếu QT BH / SO gốc). Thao tác: **"In phiếu"** (web).

- [ ] **AC-6**: Biên bản nghiệm thu — mẫu chung, kế toán hoàn tất
  - Tại: dòng **"Biên bản nghiệm thu"** (web: mở rộng accordion; app: màn chi tiết).
  - Khi: kế toán mở.
  - Thì: hiển thị template **"BIÊN BẢN NGHIỆM THU, THANH LÝ HỢP ĐỒNG"** (mẫu chung) với tiêu đề cố định "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM / Độc lập - Tự do - Hạnh phúc / -----o0o-----" Kèm hint **"Các trường thông tin có thể chỉnh sửa trực tiếp. Click vào ô để nhập/sửa thông tin."** (web) / banner cảnh báo cam **"Các trường mẫu cần được kiểm tra và bổ sung trước khi xuất hồ sơ."** (app). Kế toán **điền nội dung trực tiếp trên template** (click vào ô để nhập/sửa). Checkbox có thể tích chọn ngay, không phụ thuộc trạng thái điền template.
  - **Các trường thông tin (theo Figma — web node 13257-537424 / app node 452-24043):**

    | Nhóm | Trường | Nguồn |
    |---|---|---|
    | Lập biên bản | BKS xe | Nhập tay |
    | Lập biên bản | Ngày lập biên bản (`dd/mm/yyyy`) | Nhập tay |
    | Lập biên bản | Địa điểm lập biên bản | Nhập tay |
    | Lập biên bản | Căn cứ phiếu báo giá (số + ngày) | Prefill (từ Phiếu báo giá trong bộ hồ sơ) |
    | Thông tin các bên | Bên A — **Tên** khách hàng/chủ xe | **Prefill (chỉ Tên — từ phiếu QT BH)** |
    | Thông tin các bên | Bên A — các thông tin khác (đại diện, địa chỉ, CCCD… nếu có) | Nhập tay |
    | Thông tin các bên | Bên B (garage), Đại diện, Chức vụ, Địa chỉ Công ty, MST / STK / NH | Prefill (hồ sơ garage) |

  - **Nguyên tắc prefill**: trường nào **không có nguồn prefill** (không lấy được từ phiếu QT BH / hồ sơ garage / xe) → **để trống, kế toán nhập tay**.
  - **Nội dung nghiệm thu** = danh sách điều khoản dạng template (text sửa được), prefill 4 điều khoản chuẩn (hoàn thành sửa chữa / nhận bàn giao / bảo hành / lập thành 02 bản) + nút **"Thêm mục điều khoản"** (thêm/xoá dòng tự do).
  - **Khối ký**: "Đại diện khách hàng (Ký, ghi rõ họ tên)" — "Đại diện xưởng sửa chữa (Ký, ghi rõ họ tên)" → ký tay ngoài hệ thống.
  - **Thao tác**: **Web** — **"In biên bản"**. **App** — nút **"Lưu thông tin"** = **lưu cục bộ trong phiên/màn** (áp nội dung đã điền vào form trước khi quay lại danh sách), **KHÔNG** persist server (đồng bộ EC-1: nội dung chỉ persist thật khi "Xuất hồ sơ bảo hiểm"; đóng app trước khi xuất → mất).

- [ ] **AC-7**: Giấy ủy quyền nhận tiền bồi thường — template điền (mẫu chung)
  - Tại: dòng **"Giấy ủy quyền nhận tiền bồi thường"** (dòng phụ "Áp dụng cho garage chưa ký liên kết với bảo hiểm" — web: mở rộng accordion; app: màn chi tiết).
  - Khi: kế toán mở.
  - Thì: hệ thống cung cấp template **"GIẤY ỦY QUYỀN"** (mẫu chung) với tiêu đề cố định "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM / Độc lập - Tự do - Hạnh phúc / -----o0o-----" + hint **"Các trường thông tin có thể chỉnh sửa trực tiếp. Click vào ô để nhập/sửa thông tin."** (web) / banner cảnh báo cam (app). Kế toán **điền trực tiếp trên template** (click vào ô để nhập/sửa). **Riêng thông tin khách hàng chỉ prefill Tên từ phiếu QT BH — các trường định danh KH còn lại nhập tay** (xem BR-INS-DOSSIER-003). Checkbox có thể tích chọn ngay, không phụ thuộc trạng thái điền template.
  - **Các trường thông tin (theo Figma — web node 13257-537605 / app node 452-24580):**
    - **Đầu phiếu**: Địa danh + ngày lập (vd "An Lão, ngày dd/mm/yyyy") — **Nhập tay**.

    | Mục | Trường | Nguồn |
    |---|---|---|
    | I. Bên ủy quyền (KH) | **Họ tên / Tên đơn vị** | **Prefill (chỉ Tên — từ phiếu QT BH)** |
    | I. Bên ủy quyền (KH) | Địa chỉ | Nhập tay |
    | I. Bên ủy quyền (KH) | Quốc tịch | Nhập tay |
    | I. Bên ủy quyền (KH) | Đại diện / Chức vụ | Nhập tay |
    | I. Bên ủy quyền (KH) | GCN bảo hiểm tự nguyện / bắt buộc | Nhập tay |
    | I. Bên ủy quyền (KH) | Số CMND/CCCD · Ngày cấp · Nơi cấp | Nhập tay |
    | II. Bên được ủy quyền (garage) | Tên garage/Công ty, Địa chỉ, MST, Điện thoại, Đại diện, Chức vụ, Số tài khoản, Ngân hàng | Prefill (hồ sơ garage) |
    | III. Nội dung ủy quyền | Loại xe · Biển kiểm soát | Prefill (xe từ QT BH) |
    | III. Nội dung ủy quyền | Số tiền bồi thường · Bằng chữ | Prefill (từ QT BH) |
    | III. Nội dung ủy quyền | Ngày tai nạn · Nội dung | Nhập tay |

  - **Nguyên tắc prefill**: trường nào **không có nguồn prefill** (không lấy được từ phiếu QT BH / hồ sơ garage / xe) → **để trống, kế toán nhập tay**.
  - **IV. Cam kết** = danh sách điều khoản template (text sửa được), prefill 3 điều khoản chuẩn + nút **"Thêm mục điều khoản"**.
  - **Khối ký**: "Đại diện khách hàng (Ký, ghi rõ họ tên)" — "Đại diện xưởng sửa chữa (Ký, ghi rõ họ tên)".
  - **Thao tác**: **Web** — **"In giấy ủy quyền"**. **App** — nút **"Lưu thông tin"** = **lưu cục bộ trong phiên/màn** (KHÔNG persist server — đồng bộ EC-1; nội dung chỉ persist thật khi "Xuất hồ sơ bảo hiểm").
  - Lưu ý: giấy này cần chữ ký gốc KH khi gửi BH → in ra từ template để KH ký (ngoài hệ thống).

### Nhóm C — Preview, in & xuất hồ sơ

- [ ] **AC-8**: Khu vực preview + thao tác từng tài liệu
  - Tại: **Web** — vùng mở rộng accordion ngay trong dòng tài liệu. **App** — màn chi tiết tài liệu.
  - Khi: kế toán mở 1 tài liệu.
  - Thì: hiển thị preview/template nội dung tài liệu + nút thao tác theo loại tài liệu:
    - **Phiếu quyết toán + Phiếu báo giá** (auto-sinh, read-only): Web — **"In phiếu".
    - **Biên bản nghiệm thu + Giấy ủy quyền nhận tiền bồi thường** (template điền trực tiếp): Web — **"In biên bản" / "In giấy ủy quyền"**; App — **"Lưu thông tin"** (lưu cục bộ trong phiên, KHÔNG persist server). Nội dung kế toán đã điền chỉ được persist thật khi nhấn **"Xuất hồ sơ bảo hiểm"** (đồng bộ EC-1: không auto-save draft server).

- [ ] **AC-9**: Xuất hồ sơ bảo hiểm (footer)
  - Tại: footer modal, nút **"Xuất hồ sơ bảo hiểm"** (primary) + nút **"Huỷ bỏ"**.
  - Khi: kế toán nhấn **"Xuất hồ sơ bảo hiểm"**.
  - Thì:
    - Hệ thống **xuất các tài liệu được tích chọn (checkbox)** — KHÔNG bắt buộc đủ 4/4. Mọi tài liệu được tích chọn đều được xuất ngay, không gate theo trạng thái điền template (kế toán tự chịu trách nhiệm nội dung).
    - Nếu hợp lệ → generate **PDF riêng cho mỗi tài liệu được chọn** (vd Phiếu quyết toán.pdf, Phiếu báo giá.pdf, Biên bản nghiệm thu.pdf, Giấy ủy quyền nhận tiền bồi thường.pdf) — KHÔNG gộp thành 1 file. Lưu object storage thành 1 **bộ hồ sơ** (record `insurance_dossier` gồm nhiều file PDF + timestamp, người xuất).
    - Toast **"Xuất hồ sơ bảo hiểm thành công"**. Bộ hồ sơ hiển thị trong tab "Hồ sơ bảo hiểm đã xuất" (FEAT-INS-DOSSIER-VIEW) với danh sách file PDF riêng.
  - Khi: kế toán nhấn **"Huỷ bỏ"** → đóng modal, không xuất (xem EC-1).
  - **Error codes (BE↔FE)**:
    - `INS_DOSSIER_NO_DOC_SELECTED` (INS-3003 · 422 · toast) — "Vui lòng chọn ít nhất 1 tài liệu để xuất hồ sơ."

- [ ] **AC-10**: Sau khi xuất → version immutable + cập nhật tab "Hồ sơ đã xuất"
  - Tại: modal hồ sơ sau khi nhấn "Xuất hồ sơ bảo hiểm".
  - Khi: xuất thành công.
  - Thì: version vừa xuất chuyển **read-only** (không sửa/xuất đè). Tab **"Hồ sơ bảo hiểm đã xuất"** trên phiếu QT BH (FEAT-INS-DOSSIER-VIEW) cập nhật danh sách.

### Nhóm D — Tạo bộ hồ sơ mới khi BH yêu cầu sửa

- [ ] **AC-11**: Tạo bộ hồ sơ mới
  - Tại: phiếu QT BH đã có bộ hồ sơ đã xuất trước đó.
  - Khi: kế toán nhấn lại nút **"Tạo hồ sơ bảo hiểm"** (xem FEAT-INS-STL-DETAIL AC-13).
  - Thì: hệ thống mở màn hình hồ sơ **mới** (kế toán điền lại nội dung template từ đầu — **không có chức năng "Sao chép từ bản trước"**). **Bộ cũ vẫn giữ trong tab "Hồ sơ đã xuất"** (read-only). Các bộ phân biệt theo **ngày/lần xuất** — **không có trạng thái bộ hồ sơ** ("Đã thay thế"/"Replaced" không hiển thị trên giao diện).

- [ ] **AC-12**: Không cho sửa bản đã xuất
  - Tại: bất kỳ bộ hồ sơ nào đã xuất PDF.
  - Khi: kế toán mở từ tab "Hồ sơ đã xuất".
  - Thì: bộ hồ sơ ở chế độ **"Chỉ xem"** — **không có** nút sửa/xuất đè trên giao diện (các nút này không tồn tại). Chỉ có thao tác **"Xem PDF"** (xem FEAT-INS-DOSSIER-VIEW).

### Nhóm E — Phân quyền & lỗi

- [ ] **AC-13**: Phân quyền
  - Tại: chức năng tạo hồ sơ BH.
  - Khi: kế toán hoặc chủ garage truy cập.
  - Thì: cả 2 vai trò đều có quyền tạo & xuất hồ sơ BH.

- [ ] **AC-14**: Lỗi generate PDF
  - Tại: nút **"Xuất PDF hồ sơ"**.
  - Khi: lỗi generate (template render fail, storage lỗi).
  - Thì: hệ thống hiển thị lỗi, KHÔNG tạo record version mới. Kế toán có thể thử lại.
  - **Error codes (BE↔FE)**:
    - `INS_DOSSIER_PDF_GENERATION_FAILED` (INS-3007 · 500 · toast) — "Tạo PDF hồ sơ không thành công. Vui lòng thử lại."

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13257-536880&m=dev |
| Figma | mobile | https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=437-24051&m=dev |

**Node Figma theo tài liệu (đọc lại 2026-06-17):**

| Tài liệu / màn | Web (file `EMGjGsnAJzGoGwTSK7dTuZ`) | App (file `nAoFS33sTWj3ctWjZMUDEl`) |
|---|---|---|
| Danh sách hồ sơ (2/4) | `13257-536881` (modal `13257-537061`) | `437-26437` |
| Danh sách hồ sơ (4/4) | `13257-555266` | — |
| Phiếu quyết toán | `13257-537062` | `452-22958` |
| Phiếu báo giá | `13257-537243` | `452-23711` |
| Biên bản nghiệm thu | `13257-537424` | `452-24043` |
| Giấy ủy quyền | `13257-537605` | `452-24580` |
| Entry phiếu QT BH (nút "Tạo hồ sơ bảo hiểm") | — | `700-28585` |

- Behavior spec: [`Product/ux/UX-FLOW-INSURANCE-SETTLEMENT.md`](../ux/UX-FLOW-INSURANCE-SETTLEMENT.md) §3 (wireframe màn Hồ sơ bảo hiểm) + §4 Bước 6 & 8 (versioning).
- Design source: **Figma** (xem §3 UI/UX Reference) — không dùng HTML mockup. Bố cục: **web = modal accordion dọc**, **app = màn list + màn chi tiết per tài liệu**.

## 4. API Reference

- Boundary: `gf-accounting`
- Mutation `CreateInsuranceDossier(settlementId: ID)` → tạo dossier record version mới.
- Mutation `UpdateInsuranceDossierDocument(dossierId: ID, docType: Enum, content: JSON)` → cập nhật nội dung template từng tài liệu.
- Mutation `ExportInsuranceDossierPDF(dossierId: ID, selectedDocs: [DocType])` → generate **PDF riêng cho mỗi tài liệu được chọn** (không gộp), lưu storage thành 1 bộ hồ sơ, mark exported.
- Query `GetInsuranceDossierDraft(settlementId: ID)` → trả version đang draft (nếu có).
- Object storage (đề xuất): 1 bộ hồ sơ = thư mục version chứa **nhiều file PDF riêng từng tài liệu**:
  - `s3://{tenant}/insurance-dossiers/{settlementId}/v{N}/phieu-quyet-toan.pdf`, `phieu-bao-gia.pdf`, `bien-ban-nghiem-thu.pdf`, `giay-uy-quyen.pdf`

## 5. Business Rules

- **BR-INS-DOSSIER-001**: Bộ hồ sơ chuẩn cố định **4 tài liệu** cho mọi DN BH (mẫu chung), theo thứ tự: **(1) Phiếu quyết toán, (2) Phiếu báo giá, (3) Biên bản nghiệm thu, (4) Giấy ủy quyền nhận tiền bồi thường**. Không thêm/bớt tài liệu trong scope hiện tại.
- **BR-INS-DOSSIER-002**: Phiếu quyết toán + Phiếu báo giá auto-sinh từ phiếu QT BH → render ngay, **toàn bộ read-only, KHÔNG cho sửa ở bước này**. Thao tác web: **"In phiếu" + "Tải PDF"**. Muốn sửa số liệu → quay về phiếu QT BH / SO gốc. Biên bản nghiệm thu + Giấy ủy quyền nhận tiền bồi thường = mẫu chung, **điền template trực tiếp** — thao tác web: **"In biên bản" / "In giấy ủy quyền"** (nội dung persist khi "Xuất hồ sơ bảo hiểm", đồng bộ EC-1). **Checkbox tất cả tài liệu mặc định bỏ trống** — kế toán tự tích chọn tài liệu cần xuất; cả 4 tài liệu đều có thể tích chọn ngay, không phụ thuộc trạng thái điền template.
- **BR-INS-DOSSIER-003**: Biên bản nghiệm thu + Giấy ủy quyền nhận tiền bồi thường = **template điền trực tiếp (mẫu chung — "Mẫu linh hoạt dùng cho các hãng chưa chuẩn hóa form")**. Prefill **xe** + **DN bảo hiểm** + **số tiền bồi thường** từ phiếu QT BH; **thông tin garage** prefill từ hồ sơ garage. **Riêng thông tin khách hàng (chủ xe / Bên ủy quyền) CHỈ prefill Tên từ phiếu QT BH — toàn bộ trường định danh KH còn lại (địa chỉ, quốc tịch, đại diện/chức vụ, CMND/CCCD + ngày/nơi cấp, GCN bảo hiểm…) phải nhập tay**. **Nguyên tắc chung: trường nào không có nguồn prefill → để trống, kế toán nhập tay.** Thao tác web: **"In biên bản" / "In giấy ủy quyền"**; **app: nút "Lưu thông tin" = lưu cục bộ trong phiên/màn, KHÔNG persist server** — nội dung chỉ persist thật khi "Xuất hồ sơ bảo hiểm" (đồng bộ AC-8, BR-INS-DOSSIER-002, EC-1). In ra cho KH ký ngoài hệ thống.
- **BR-INS-DOSSIER-004**: Xuất hồ sơ: **xuất các tài liệu được tích chọn (checkbox)** — KHÔNG bắt buộc đủ 4/4. Mọi tài liệu được tích chọn đều được phép xuất, không có gate "phải hoàn tất template" ở bước này.
- **BR-INS-DOSSIER-005**: Sau khi xuất PDF, version đó **immutable** — không cho sửa nội dung, xuất lại đè bản cũ.
- **BR-INS-DOSSIER-006**: Khi BH yêu cầu sửa → tạo **bộ hồ sơ mới** (điền lại template từ đầu — không có chức năng "Sao chép từ bản trước"). Bộ cũ giữ trong tab "Hồ sơ đã xuất" để truy vết. Các bộ phân biệt theo ngày/lần xuất — **không có trạng thái bộ hồ sơ trên giao diện**.
- **BR-INS-DOSSIER-010**: Xuất hồ sơ sinh **PDF riêng cho mỗi tài liệu được tích chọn** (tối đa 4, không gộp 1 file). 1 lần xuất = 1 bộ hồ sơ chứa các file PDF (đồng bộ FEAT-INS-DOSSIER-VIEW). Không có file thứ 5/bản gộp.
- **BR-INS-DOSSIER-009**: Version số nguyên tăng dần per phiếu QT BH, bắt đầu từ 1.
- **BR-INS-DOSSIER-011**: Entry tạo hồ sơ BH — nút **"+ Tạo hồ sơ bảo hiểm"** trên màn chi tiết phiếu QT — **chỉ hiển thị/khả dụng khi Bên thanh toán của phiếu QT = Bảo hiểm**; ẩn hoàn toàn với phiếu QT Khách hàng. Gate **chỉ theo Bên thanh toán**, không theo trạng thái phiếu — giao diện người dùng **không có trạng thái DRAFT** (chốt 2026-06-10). Đồng bộ BR-INS-STL-DET-007/007 + FEAT-INS-STL-DETAIL AC-13.

## 6. Edge Cases

- **EC-1**: Kế toán tạo dossier draft nhưng đóng màn hình trước khi xuất → **KHÔNG auto-save draft**: dữ liệu nhập sẽ **mất**, chỉ persist khi nhấn "Xuất hồ sơ bảo hiểm". Mở lại = bắt đầu draft mới. **Lưu ý app**: nút **"Lưu thông tin"** trên màn điền (Biên bản nghiệm thu / Giấy ủy quyền) chỉ **lưu cục bộ trong phiên** (giữ nội dung khi quay lại danh sách tài liệu trong cùng phiên) — **KHÔNG** persist server, không tạo draft (đóng app → vẫn mất).
- **EC-2**: 2 user (kế toán + chủ garage) cùng mở dossier draft 1 phiếu QT BH → áp dụng **optimistic lock** (version field): thao tác xuất/ghi sau bị từ chối nếu version đã thay đổi, user phải reload. **Error code (BE↔FE)**: `INS_DOSSIER_VERSION_CONFLICT` (INS-3006 · 409 · dialog reload) — "Hồ sơ vừa được người khác cập nhật. Vui lòng tải lại trang."
- **EC-3**: Phiếu QT BH có Bảo hiểm thanh toán = 0 → vẫn cho phép tạo hồ sơ (audit case BH từ chối toàn bộ).
- **EC-5**: BH yêu cầu sửa lần 5, 6, 7+ → versioning hoạt động **không giới hạn, KHÔNG cảnh báo** khi version cao.
- **EC-6**: Object storage timeout khi generate PDF → retry tự động 2 lần; nếu vẫn fail → hiển thị lỗi rõ ràng, không lưu record version (rollback transaction). **Error code (BE↔FE)**: `INS_DOSSIER_STORAGE_TIMEOUT` (INS-3008 · 504 · toast + retry) — "Hệ thống lưu trữ đang bận. Vui lòng thử lại sau giây lát."

## 7. Out of Scope

- Xem hồ sơ BH đã xuất → `FEAT-INS-DOSSIER-VIEW`.
- Sửa nội dung bản đã xuất → KHÔNG cho phép (chỉ tạo bản mới).
- Gửi hồ sơ qua email/API trực tiếp cho DN BH → ngoài scope (PRD OS-4: không tích hợp 2 chiều).
- Workflow phê duyệt hồ sơ trước khi xuất → ngoài scope.
- Template riêng cho từng DN BH → ngoài scope (1 template chung).
- **Hóa đơn GTGT** → **KHÔNG nằm trong scope** bộ hồ sơ bảo hiểm. Bộ hồ sơ chỉ gồm 4 tài liệu chuẩn (BR-INS-DOSSIER-001).

## Related CRs

> Link sang [`Tracking/CHANGE-REQUESTS.md`](../../Tracking/CHANGE-REQUESTS.md) — chỉ liệt kê. Đọc chi tiết tại CR Registry.

| CR ID | Title (short) | Status | Scope hint |
|---|---|---|---|
| [CR-20260622-01](../../Tracking/CHANGE-REQUESTS.md#cr-20260622-01--ins-dossier-current-endpoint-contract) | Add `GET /api/v1/insurance-dossiers/current` endpoint | RAISED (pending Architecture) | BE add controller + Architecture spec; BFF op `getInsuranceDossierCurrent`; FE/Mobile wire preload draft khi reopen create screen |
| [CR-20260622-03](../../Tracking/CHANGE-REQUESTS.md#cr-20260622-03--ins-dossier-create-nav-expansion-to-push) | §5.2 ExpansionTile inline → push nav 4 màn chi tiết | APPROVED (MINOR self) | §5.2 widget breakdown: 4 màn standalone (DossierPhieuQuyetToanPage / PhieuBaoGiaPage / BienBanNghiemThuPage / GiayUyQuyenPage) + back/BottomBar "Lưu thông tin" |

---

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-22 | 23 | Delivery Authority | Thêm section "Related CRs" — link 2 CR W02 mobile-cycle (CR-20260622-01 pending + CR-20260622-03 APPROVED) sang `Tracking/CHANGE-REQUESTS.md`. Không copy nội dung CR — chỉ link dẫn + scope hint. |
| 2026-06-18 | 22 | BA/PO (anhluong) | **Gỡ gate "③④ chỉ tích được sau khi điền đủ trường bắt buộc"**: rule không chính xác — cả 4 tài liệu đều có thể tích chọn ngay, không phụ thuộc trạng thái điền template. Cập nhật: AC-3 (Nhóm A bullets 4-5 — bỏ câu "chỉ tích được sau khi điền đủ"), BR-INS-DOSSIER-002 (bỏ "cần kế toán hoàn tất mới sẵn sàng"), BR-INS-DOSSIER-003 (bỏ "Các trường nhập tay bắt buộc phải đủ thì tài liệu mới sẵn sàng để tích chọn xuất"), BR-INS-DOSSIER-004 (bỏ "Tài liệu được chọn phải đã hoàn tất … block nếu chưa hoàn tất"), **gỡ EC-4** (không còn áp dụng). Cascade: PKG-W02 §2.4 Bước 1/2/5, UX-FLOW §5.2, BR-EP BR-INS-DOSSIER-005, wave-spec mirrors (fe-web/mobile), figma DEV/test prefetch. |
| 2026-06-17 | 21 | BA/PO (anhluong) | **Đồng bộ bố cục theo đọc lại 2 Figma APP (`437-24051`) + WEB (`13257-536880`)**: (1) **Gỡ progress bar "{X}/4 tài liệu sẵn sàng" + gỡ badge "Sẵn sàng"/"Bổ sung"** — AC-2/AC-3 rewrite: web = **modal accordion dọc** (click mở rộng preview inline), app = **màn list + màn chi tiết per tài liệu**, trạng thái thể hiện qua checkbox + dòng phụ. (2) **AC-4 Phiếu quyết toán** chi tiết hoá theo design: "PHIẾU QUYẾT TOÁN SỬA CHỮA" + header (Garage/Ngày QT/KH/Biển số) + bảng Dịch vụ (STT/Nội dung/ĐVT/SL/Đơn giá/Thành tiền) + Phụ tùng + khối Phân bổ bảo hiểm. (3) **Nút thao tác**: auto-sinh (PQT, báo giá) web thêm **"Tải PDF"** cạnh "In phiếu"; điền tay web = **"In biên bản"/"In giấy ủy quyền"**; **app = "Lưu thông tin" = lưu cục bộ trong phiên, KHÔNG persist server** (giữ EC-1 — chốt qua BA/PO). (4) Dòng phụ tài liệu + subtitle template "**Mẫu linh hoạt dùng cho các hãng chưa chuẩn hóa form**" + hint click-để-sửa. (5) §7 Out of Scope thêm **Hóa đơn GTGT ngoài scope**. (6) §3 thêm bảng node Figma per tài liệu; mobile link đổi `319-57346` → `437-24051`. Cập nhật BR-002/003, EC-1/EC-4. (7) **Làm sạch nội dung chính**: gỡ các ghi chú dạng "(chốt YYYY-MM-DD)" khỏi AC/BR/EC/Out-of-Scope — lịch sử quyết định giữ ở Change Log; gỡ các câu mô tả "không có progress bar / không có badge". (8) **Khớp screenshot mới màn Hồ sơ bảo hiểm**: AC-2 app subtitle rút gọn còn **"Chọn tài liệu cần xuất."**; AC-3 dòng phụ rút gọn — Phiếu quyết toán = mã phiếu QT, Phiếu báo giá = mã PDV (web)/mã phiếu QT (app); Giấy ủy quyền app = "Áp dụng cho garage chưa ký liên kết với bảo hiểm · Cần bổ sung nội dung"; §7 gỡ tham chiếu UI "ghi chú trên màn app" cho Hóa đơn GTGT; sync wireframe UX-FLOW. (9) **Bỏ checkbox mặc định tích**: tất cả 4 tài liệu mặc định **bỏ trống**, kế toán tự tích chọn tài liệu cần xuất (PQT + báo giá tích được ngay; BBNT + GUQ chỉ tích được sau khi điền đủ) — AC-3/AC-4/AC-5, BR-INS-DOSSIER-002, UX-FLOW §4 Bước 6 + §5.2. |
| 2026-06-16 | 20 | BA/PO (anhluong) | **Bỏ hẳn "Lưu phiếu" khỏi toàn feature + nguyên tắc để-trống-nhập-tay** (khớp design — template chỉ có nút "In phiếu"): gỡ mọi nhắc đến "Lưu phiếu" trong phần spec, **không note "không có Lưu phiếu"** — AC-4/AC-5 (tiêu đề + thao tác), AC-6/AC-7 (chỉ "In biên bản"/"In giấy ủy quyền"), AC-8, BR-INS-DOSSIER-002/003. Nội dung tài liệu chỉ persist khi "Xuất hồ sơ bảo hiểm" (đồng bộ EC-1). Thêm nguyên tắc **trường không prefill được → để trống, nhập tay** (AC-6/AC-7/BR-003). |
| 2026-06-16 | 19 | BA/PO (anhluong) | **Chi tiết hoá trường nhập 2 tài liệu template theo Figma** (node `13257-537424` Biên bản nghiệm thu, `13257-537605` Giấy ủy quyền): AC-6 + AC-7 thêm bảng trường đầy đủ (Prefill vs Nhập tay) + khối ký + nút In/Lưu; **chốt thông tin khách hàng CHỈ prefill Tên từ phiếu QT BH, các trường định danh KH còn lại (địa chỉ, quốc tịch, đại diện/chức vụ, CMND/CCCD + ngày/nơi cấp, GCN bảo hiểm…) nhập tay**; garage prefill từ hồ sơ garage, xe + DN BH + số tiền bồi thường prefill từ QT BH. Cập nhật BR-INS-DOSSIER-003 tương ứng (đồng bộ EC-4 trường bắt buộc). |
| 2026-06-12 | 18.1 | BA/PO (anhluong) | **Reconcile BR numbering → BR-EP canonical**: cross-ref nút/tab gate đặc thù BH cập nhật BR-INS-STL-DET-004→**007**. Không đổi nội dung feature. |
| 2026-06-11 | 18 | BA/PO (anhluong) | **Bỏ "Sao chép từ bản trước" + trạng thái bộ hồ sơ** (chốt E-4/E-5/E-6): AC-11 — tạo bộ mới = điền lại template từ đầu, **không có "Sao chép từ bản trước"**, **không có trạng thái bộ** ("Đã thay thế"/"Replaced" không hiển thị), phân biệt theo ngày/lần xuất; AC-12 — bộ đã xuất "Chỉ xem", **không có nút sửa/xuất đè** (thay vì "disabled"); BR-INS-DOSSIER-006 cập nhật; **gỡ BR-INS-DOSSIER-008** (Sao chép từ bản trước). |
| 2026-06-11 | 17 | BA/PO (anhluong) | **Bỏ chức năng upload file scan** (chốt B-3): Biên bản nghiệm thu + Giấy ủy quyền = **điền template trực tiếp**. Cập nhật User Story, AC-6/AC-7 (điền trực tiếp), AC-8/AC-10/AC-12, **gỡ AC cũ "Lỗi upload file" + renumber "Lỗi generate PDF" → AC-14**, §4 API (bỏ `fileUpload`/attachments), BR-INS-DOSSIER-002/003/005/008, EC-4. `ERR-CMN-004/005` không còn dùng tại feature. |
| 2026-06-11 | 16 | BA/PO (anhluong) | **Gắn mã lỗi vào AC-9** (xem [`Product/error-code/ERROR-CODE-REGISTRY.md`](../error-code/ERROR-CODE-REGISTRY.md)): thông báo xuất hồ sơ khi tài liệu chưa hoàn tất → `ERR-INS-007` (`INLINE_FORM`), canonical-hoá "Vui lòng hoàn tất các tài liệu còn thiếu" (gỡ biến `{danh sách thiếu}`). |
|---|---|---|---|
| 2026-06-10 | 15 | BA/PO (anhluong) | **Đánh dấu là CR mở rộng feature production**: thêm frontmatter `modifies: FEAT-STL-DETAIL` + `related: FEAT-INS-STL-DETAIL` + `change_type`; thêm rows Metadata (Loại thay đổi / Màn hình target / Tích hợp qua); thêm **§0 Bối cảnh thay đổi** chỉ thị DEV agent đọc FEAT-STL-DETAIL trước, extend màn chi tiết phiếu QT đã có (không dựng màn mới). Giữ `artifact_kind=feature` (không đổi epic count/index). |
| 2026-06-10 | 14 | BA/PO (anhluong) | **Bổ sung gate entry theo Bên thanh toán**: AC-1 + BR-INS-DOSSIER-011 — nút entry **"+ Tạo hồ sơ bảo hiểm"** chỉ hiển thị/khả dụng khi Bên thanh toán phiếu QT = Bảo hiểm, ẩn với phiếu QT Khách hàng; gate **chỉ theo Bên thanh toán**, không theo trạng thái (giao diện không có DRAFT). Fix xref AC-11 "FEAT-INS-STL-DETAIL AC-14" → "AC-13". Đồng bộ FEAT-INS-STL-DETAIL v9, BR-EP v20. |
| 2026-06-05 | 13 | BA/PO (anhluong) | **Resolve 3 NEED CONFIRMATION**: (1) **EC-1** — KHÔNG auto-save draft, dữ liệu chỉ persist khi nhấn "Xuất hồ sơ bảo hiểm" (đóng màn trước khi xuất → mất); (2) **EC-2** — concurrent draft: áp dụng **optimistic lock** (version field), không last-write-wins; (3) **EC-5** — versioning không giới hạn, **không cảnh báo** khi version cao. Gỡ "HTML mockup: TBD" (design-source = Figma). Đồng bộ BR-EP v19, UX-FLOW v12. |
| 2026-06-04 | 12 | Business Authority | §3 UI/UX Reference: chuẩn hoá **Figma Mobile (App) design link** sang query `&m=dev` (dev-mode chuẩn, đồng bộ format link web), node-id `319-57346` giữ nguyên. Registry `figma-links.yaml` (mobile, wave02) sync theo. |
| 2026-06-04 | 11 | Business Authority | §3 UI/UX Reference: cập nhật **Figma Web design link** sang file mới `GMS-v.3` (file_key `EMGjGsnAJzGoGwTSK7dTuZ`, node `13257-536880`), thay link cũ `GMS-V3---New-Design` node `1101-9486`. Registry `figma-links.yaml` (web) sync theo; spec figma-web (wave02) cần re-prefetch (`/prefetch-figma web 02`) khi gen vì design source đổi file. (CR-1780555878) |
| 2026-06-03 | 10 | Business Authority (PO sign-off, CR-1780477500) | **Gỡ AC-14** (Phiếu QT BH trạng thái CANCEL) — kịch bản UI không-với-tới-được: phiếu QT BH không hiển thị trạng thái vòng đời trên UI (chỉ trạng thái thanh toán), và phiếu đã huỷ (`settlement_status=CANCEL` soft-delete) bị lọc khỏi danh sách nên kế toán không điều hướng tới để bấm "Tạo hồ sơ". Renumber AC-15→AC-14 (lỗi upload), AC-16→AC-15 (lỗi generate PDF). Gỡ feature-level **BR-INS-DOSSIER-007** (restatement CANCEL guard thừa + mis-numbered — canonical guard = BR-INS-DOSSIER-010 + VLD-INS-DOSSIER-004 ở BR-EP). **GIỮ nguyên** data model DRAFT/CANCEL ở KG (`BR-GF-ACCOUNTING-013`)/HLD/events — chỉ gỡ tiêu chí UI (Option A). |
| 2026-06-02 | 9 | Business Authority | §3 UI/UX Reference: thêm **Figma Mobile design link** (App GMS v3 — New Design, node `319-57346`) cho mobile app, bổ sung bên cạnh link web hiện có (DESIGN-SOURCE-POLICY §2.1, figma mode). |
| 2026-06-02 | 8 | Business Authority | §3 UI/UX Reference: thêm **Figma Web design link** (GMS V3 — New Design, node `1101-9486`) theo schema DESIGN-SOURCE-POLICY §2.1 (figma mode); gỡ dòng tham chiếu "Production design reference (screenshot 2026-05-27)" (design-source thay bằng Figma) + blockquote screenshot dưới §2. |
| 2026-05-27 | 1 | Business Authority | Khởi tạo FEAT từ PRD v5 §EP-INSURANCE-SETTLEMENT phạm vi §3. 4 tài liệu chuẩn (Phiếu báo giá, Phiếu quyết toán, Biên bản nghiệm thu, Giấy ủy quyền) dùng chung mọi DN BH. Auto-fill template từ phiếu QT BH cho 3 tài liệu đầu; Giấy ủy quyền bắt buộc upload scan. Xuất PDF gộp 4 tài liệu, immutable sau xuất. Versioning khi BH yêu cầu sửa — tạo bản mới, không unlock bản cũ. Sao chép từ bản trước để giảm thao tác nhập lại. |
| 2026-05-27 | 2 | Business Authority | Resolve PRD v6: **AC-4 Phiếu báo giá tất cả trường read-only** — kế toán không sửa trên hồ sơ, phải sửa ngược về phiếu QT BH / SO gốc. Trạng thái tài liệu tự động "Sẵn sàng" ngay khi mở (vì auto-render). Cập nhật BR-INS-DOSSIER-002 cho rõ Phiếu báo giá + Phiếu quyết toán đều all read-only; Biên bản nghiệm thu vẫn cho phép điền tay/upload. |
| 2026-05-27 | 3 | Business Authority | Gỡ ref FEAT-INS-STL-CREATE (đã xoá): Depends on → "Phiếu QT BH (baseline EP-SETTLEMENT + truyền phân bổ qua FEAT-INS-SO-ADJUSTMENT AC-15)". |
| 2026-05-27 | 7 | Business Authority | Resolve NEED CONFIRMATION: (1) **Giấy ủy quyền = template điền** (mẫu chung, không bắt buộc upload scan — AC-7, BR-003); (2) **xuất theo tài liệu tích chọn** checkbox, không bắt buộc đủ 4/4 (AC-9, BR-004); (3) tối đa **4 tài liệu** không có file thứ 5 (BR-010). Cập nhật AC-8/AC-15, BR-008, EC-4. |
| 2026-05-27 | 6 | Business Authority | **Export sinh PDF riêng từng tài liệu** (không gộp 1 file) — đồng bộ với FEAT-INS-DOSSIER-VIEW (tab hiển thị danh sách file PDF riêng). Cập nhật AC-9, BR-INS-DOSSIER-008, +BR-INS-DOSSIER-010, §4 API + object storage path. NEED CONFIRMATION số file (5 vs 4). |
| 2026-05-27 | 5 | Business Authority | **Resolve Phiếu quyết toán + Phiếu báo giá**: hệ thống tự sinh, **read-only, KHÔNG có nút "Lưu phiếu"** (chỉ "In phiếu") — không cho sửa ở bước này. Resolve NEED CONFIRMATION về Phiếu báo giá (read-only, khớp v6). AC-8: "Lưu phiếu" chỉ áp dụng Biên bản nghiệm thu + Giấy ủy quyền (tài liệu cho điền/upload). Cập nhật AC-4, AC-5, AC-8, BR-INS-DOSSIER-002. |
| 2026-05-27 | 4 | Business Authority | **Chi tiết hoá theo production design screenshot** (modal "Hồ sơ bảo hiểm - #SET"): rewrite §2 AC-1..10 theo layout thực — progress bar "{X}/4 tài liệu sẵn sàng", **4 thẻ ngang có checkbox + badge "Sẵn sàng"/"Bổ sung"**, thứ tự (1) Phiếu quyết toán (2) Phiếu báo giá (3) Biên bản nghiệm thu (4) Giấy ủy quyền nhận tiền bồi thường; preview "PHIẾU BÁO GIÁ SỬA CHỮA" (Garage/Ngày/Công ty BH/Số HĐ + bảng nội dung sửa chữa) + "In phiếu"/"Lưu phiếu"; footer "Huỷ bỏ"/"Xuất hồ sơ bảo hiểm". BĐ nghiệm thu + Giấy ủy quyền = "Mẫu chung dùng cho tất cả hãng BH". Cập nhật BR-001 (thứ tự tài liệu), BR-002 (Sẵn sàng/Bổ sung + NEED CONFIRMATION Phiếu báo giá Lưu phiếu vs read-only), BR-004 (xuất theo checkbox). NEED CONFIRMATION: đủ 4/4 hay xuất tập đã chọn. |
