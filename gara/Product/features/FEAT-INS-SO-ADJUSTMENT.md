---
type: feature
artifact_kind: feature
status: PLANNED
version: 26
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INSURANCE-SETTLEMENT"
boundary: "gf-sales"
modifies: ["FEAT-SO-EDIT", "FEAT-SO-DETAIL"]
related: ["FEAT-INS-STL-CREATE", "FEAT-INS-STL-DETAIL"]
change_type: "brownfield-enhancement"
last_reviewed: "2026-06-22"
---

# FEAT-INS-SO-ADJUSTMENT: Nhập & tính các khoản điều chỉnh BH trên Phiếu dịch vụ

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-INS-SO-ADJUSTMENT` |
| Title | Nhập & tính các khoản điều chỉnh BH trên Phiếu dịch vụ |
| Parent Epic | `EP-INSURANCE-SETTLEMENT` |
| Boundary | `gf-sales` (mở rộng entity Phiếu dịch vụ — header level) |
| Priority | P1 |
| Status | PLANNED |
| Depends on | Năng lực **chọn Nguồn thanh toán per dòng** trên SO — **đã có ở production** (EP-SERVICE-ORDER baseline, foundation) |
| Extends | `FEAT-SO-EDIT` (nhập), `FEAT-SO-DETAIL` (xem read-only) — **KHÔNG** áp dụng `FEAT-SO-CREATE` |
| Loại thay đổi | **CR — mở rộng feature production** (không phải màn hình mới) |
| Màn hình target | [`FEAT-SO-EDIT`](./FEAT-SO-EDIT.md) (nhập) + [`FEAT-SO-DETAIL`](./FEAT-SO-DETAIL.md) (xem) — Phiếu dịch vụ (production, gf-sales). **KHÔNG** áp `FEAT-SO-CREATE`. |

> **Bối cảnh nghiệp vụ (chốt 2026-05-27)**: Section "Phân bổ quyết toán bảo hiểm" chỉ ở màn hình **Chỉnh sửa (Edit) + Chi tiết (Detail)**, KHÔNG ở Tạo (Create). Luồng: Create = báo giá sơ bộ gửi BH → BH duyệt + đưa phân bổ → Edit nhập điều chỉnh BH đã duyệt. Năng lực chọn Nguồn TT per dòng là baseline production (foundation, không dev lần này).

## 0. Bối cảnh thay đổi (Change Request — DEV đọc trước)

> ⚠️ **ĐÂY LÀ CR MỞ RỘNG MÀN HÌNH ĐÃ CÓ — KHÔNG dựng màn hình mới.**
>
> - **Target (production)**: [`FEAT-SO-EDIT`](./FEAT-SO-EDIT.md) (màn Chỉnh sửa Phiếu dịch vụ — nhập) + [`FEAT-SO-DETAIL`](./FEAT-SO-DETAIL.md) (màn Chi tiết — xem read-only), đang chạy production (gf-sales). **KHÔNG** áp dụng `FEAT-SO-CREATE`. DEV agent **PHẢI đọc 2 FEAT này trước**.
> - **Phạm vi CR này**: THÊM section **"Phân bổ quyết toán bảo hiểm"** (5 khoản điều chỉnh + panel "Tổng giá dịch vụ" theo bên thanh toán) vào màn Edit (nhập) + Detail (read-only) — chỉ khi SO có dòng Nguồn TT = Bảo hiểm. Năng lực chọn Nguồn TT per dòng là baseline (foundation, KHÔNG dev lại).
> - **Liên kết xuôi**: dữ liệu phân bổ truyền sang phiếu QT BH ([`FEAT-INS-STL-DETAIL`](./FEAT-INS-STL-DETAIL.md)) khi tạo phiếu (AC-15).
> - **Nguyên tắc DEV**: extend màn SO hiện có, không rebuild; không phá vỡ hành vi baseline SO khách hàng tự trả.

## 1. User Story

**As** kế toán, **I want** nhập các khoản điều chỉnh bảo hiểm (chiết khấu liên kết, khấu hao vật tư, giảm trừ bồi thường, khấu trừ bảo hiểm) trong section **"Phân bổ quyết toán bảo hiểm"** **khi chỉnh sửa Phiếu dịch vụ** (sau khi bảo hiểm đã duyệt và đưa thông tin phân bổ), **so that** hệ thống tự tính ra số tiền bảo hiểm phải thanh toán và phần khách hàng chịu từ điều chỉnh, làm cơ sở cho phiếu quyết toán bảo hiểm.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị section "Phân bổ quyết toán bảo hiểm"

- [ ] **AC-0**: Section KHÔNG hiển thị ở màn hình Tạo phiếu dịch vụ
  - Tại: màn hình Tạo phiếu dịch vụ (FEAT-SO-CREATE).
  - Khi: kế toán lập SO + báo giá sơ bộ.
  - Thì: section **"Phân bổ quyết toán bảo hiểm"** **KHÔNG** hiển thị (chưa có dữ liệu phân bổ BH — báo giá sơ bộ gửi BH duyệt trước). Form Create giữ nguyên baseline.

- [ ] **AC-1**: Section hiển thị ở Edit/Detail khi chọn "Có" tại mục Bảo hiểm
  - Tại: form **Chỉnh sửa (Edit)** hoặc **Chi tiết (Detail)** Phiếu dịch vụ loại **"Dịch vụ xe"**.
  - Khi: người dùng chọn **"Có"** tại mục **"Bảo hiểm"** (toggle — xem AC-2).
  - Thì: section **"Phân bổ quyết toán bảo hiểm"** hiển thị (cùng với khu vực thông tin bảo hiểm). Ở màn Edit cho nhập/sửa; ở màn Detail hiển thị **read-only**.
  - Khi: người dùng chọn **"Không"** tại mục Bảo hiểm.
  - Thì: section **"Phân bổ quyết toán bảo hiểm"** **KHÔNG** hiển thị (ẩn cùng khu vực thông tin bảo hiểm).
  - ⚠️ **Phân biệt 2 khối (chốt 2026-06-07, PO directive)** — đừng nhầm lẫn:
    - **Section "Phân bổ quyết toán bảo hiểm"** (Nhóm B) = panel **nhập** 5 khoản điều chỉnh ở Edit; ở **Detail hiển thị read-only** = recap giá trị kế toán đã nhập (label + giá trị + đơn vị VND/%). Đây là khối **riêng**, hiển thị ở **cả Edit lẫn Detail**.
    - **Bảng "Phân bổ Bảo hiểm"** (trong panel "Tổng giá dịch vụ" — Nhóm C, AC-10) = 5 **số tiền đã tính** với dấu ±/màu. Đây là khối **kết quả**, không phải recap nhập.
    - Ở màn **Detail (read-only)**, **CẢ HAI** khối cùng hiển thị (không trùng nội dung). Việc chỉ hiển thị bảng "Phân bổ Bảo hiểm" mà thiếu section "Phân bổ quyết toán bảo hiểm" read-only = **vi phạm AC-1**.

- [ ] **AC-2**: Khu vực thông tin bảo hiểm trên SO — **TOÀN BỘ ĐÃ CÓ TRONG PRODUCTION (BASELINE)**
  - Tại: màn hình Chỉnh sửa phiếu dịch vụ, mục **"Bảo hiểm"** (toggle Không / Có).
  - Khi: người dùng chọn **"Có"** ở mục Bảo hiểm.
  - Thì: hệ thống hiển thị khu vực thông tin bảo hiểm gồm (xác nhận theo production screenshot 2026-05-27):
    - **"Công ty bảo hiểm"** *(bắt buộc)* — **dropdown chọn từ danh sách công ty bảo hiểm có sẵn** (vd ABIC - Bảo hiểm Agribank, Bảo hiểm AAA, Bảo hiểm Bảo Long, Bảo hiểm Bảo Minh, Bảo hiểm Bảo Việt, BHV - Bảo hiểm Hùng Vương...), có ô search. Placeholder **"Vui lòng chọn công ty bảo hiểm"**.
    - **"Số hợp đồng bảo hiểm"** — text input, placeholder **"Nhập số hợp đồng"**.
    - **"Ngày hết hạn"** — date picker `dd/mm/yyyy`.
    - **"Số điện thoại liên hệ bảo hiểm"** — text input, placeholder **"Nhập số điện thoại"**.
    - **"Người giám định"** — text input, placeholder **"Nhập tên người giám định"**.
    - **"Hồ sơ bảo lãnh"** — khu vực upload file (kéo thả / click tải tệp), **tối đa 5 files, 30 MB/file**.
  - Khi: người dùng chọn **"Không"**.
  - Thì: khu vực thông tin bảo hiểm ẩn.
  - ⚠️ **Toàn bộ khu vực này (toggle + dropdown công ty BH + 6 trường + upload hồ sơ bảo lãnh) ĐÃ CÓ TRONG PRODUCTION — KHÔNG phát triển trong scope lần này.** AC document hành vi hiện hành làm context.
  - **Error codes (BE↔FE)**:
    - `INS_SO_COMPANY_REQUIRED` (INS-1002 · 422 · field-level) — "Vui lòng chọn công ty bảo hiểm trước khi tiếp tục."

> **Ghi chú phân định scope (chốt 2026-05-27 qua production screenshot):**
> - **BASELINE (đã production, không dev)**: toggle "Bảo hiểm", dropdown "Công ty bảo hiểm" (đã có master data list + search), số hợp đồng, ngày hết hạn, SĐT liên hệ, người giám định, upload "Hồ sơ bảo lãnh".
> - **MỚI (scope EP-INSURANCE-SETTLEMENT)**: phần **section "Phân bổ quyết toán bảo hiểm"** = 5 khoản điều chỉnh BH (CK liên kết vật tư/công DV, khấu hao, giảm trừ bồi thường, khấu trừ) + nút "Áp dụng tất cả" (AC-3..8) **và** panel "Tổng giá dịch vụ" (Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm + Cân thanh toán — AC-9..12). **CHỐT (PO 2026-06-02)**: trên production hiện chỉ có **1 dòng "Tổng thành tiền"** (cộng gộp cả 2 bên KH + BH) — vì vậy **toàn bộ panel "Tổng giá dịch vụ" theo bên thanh toán (breakdown BH/KH + Phân bổ Bảo hiểm + Cân thanh toán) là MỚI** trong scope epic này, không có phần nào kế thừa production ngoài con số tổng gộp.
> - **"Hồ sơ bảo lãnh"** (upload file trên SO — production) **khác** với **"Hồ sơ bảo hiểm"** (bộ 4 tài liệu versioning để gửi BH — FEAT-INS-DOSSIER-CREATE, mới). Không nhầm lẫn 2 khái niệm.
> - **Danh sách công ty BH = system-seeded production** (garage chỉ chọn từ dropdown, KHÔNG tự thêm/sửa — chốt 2026-05-27). Đã bỏ 3 features FEAT-INS-COMPANY-*. Không có "% chiết khấu liên kết mặc định per công ty BH" — chiết khấu nhập trực tiếp per-SO (AC-3/AC-4).

### Nhóm B — Section "Phân bổ quyết toán bảo hiểm" (panel nhập, bên trái) — 5 khoản điều chỉnh

> Header section có badge **"Bảo hiểm"** + toggle bật/tắt. Dưới header là dòng mô tả công thức:
> *"BH thanh toán = phần bảo hiểm duyệt sau chiết khấu liên kết − giảm trừ bồi thường − khấu hao vật tư − khấu trừ bảo hiểm. KH thanh toán = phần KH tự trả trên bảng + các khoản bị loại trừ chuyển sang KH."*
>
> 5 trường điều chỉnh xếp dạng lưới, mỗi trường có **input số + dropdown đơn vị** (mặc định **VND**; dropdown cho phép đổi sang **%** với các khoản hỗ trợ — xem từng AC). Cuối panel có nút **"Áp dụng tất cả"**.

- [ ] **AC-3**: CK liên kết BH — Vật tư
  - Tại: trường **"CK liên kết BH — Vật tư"** (CK = Chiết khấu) trong section.
  - Khi: kế toán mở SO ở màn Edit.
  - Thì: hiển thị input số + dropdown đơn vị **VND / %**. Mặc định đơn vị **VND**, giá trị 0.
  - Khi: kế toán chọn đơn vị **%**.
  - Thì: hệ thống tính số tiền = (% × **"Cộng sau VAT" phần vật tư thuộc BH**). Khi đơn vị **VND** → nhận số tiền trực tiếp.
  - Ý nghĩa: khoản garage giảm trừ cho doanh nghiệp BH → **giảm "BH thanh toán"**, KHÔNG chuyển sang KH. Hiển thị ở panel tổng với dấu **−** (màu xanh).

- [ ] **AC-4**: CK liên kết BH — Công dịch vụ
  - Tại: trường **"CK liên kết BH — Công dịch vụ"** trong section.
  - Khi: kế toán mở SO ở màn Edit.
  - Thì: hành vi tương tự AC-3, cơ sở tính (chế độ %) là **"Cộng sau VAT" phần dịch vụ thuộc BH**. Cũng là khoản giảm trừ cho DN BH (dấu **−**, không chuyển sang KH).

- [ ] **AC-5**: Khấu hao vật tư / thay mới — **% khấu hao, chỉ áp dụng phụ tùng**
  - Tại: trường header **"Khấu hao vật tư / thay mới"** trong section + cột **"Khấu hao (%)"** trên từng dòng phụ tùng.
  - Khi: kế toán mở SO ở màn Edit.
  - Thì:
    - Khấu hao **chỉ tính trên phụ tùng (vật tư) thuộc BH** — **KHÔNG áp dụng cho công dịch vụ**.
    - Nhập theo **% khấu hao** (không phải số tiền — không có dropdown VND).
    - 2 cách nhập:
      - **(a) Đồng loạt**: nhập x% ở trường header + nút **"Áp dụng tất cả"** (xem AC-8) → set mọi dòng phụ tùng BH = x%.
      - **(b) Riêng từng dòng**: nhập % trực tiếp trên cột **"Khấu hao (%)"** của từng dòng phụ tùng → override giá trị đồng loạt cho dòng đó.
  - Số tiền khấu hao = Σ (thành tiền phụ tùng BH × % khấu hao của dòng tương ứng).
  - **Điều kiện hiển thị cột (chốt 2026-06-10, theo production screenshot)**: cột **"Khấu hao VT"** (Khấu hao %) trên bảng **Phụ tùng sử dụng** **chỉ hiển thị khi SO chọn "Bảo hiểm = Có"**; SO không chọn Bảo hiểm → **không hiển thị cột này** (xem BR-INS-SO-ADJ-009).
  - Ý nghĩa: **giảm "BH thanh toán"** + **chuyển sang KH** (dấu **+** màu đỏ ở panel tổng).

- [ ] **AC-6**: Giảm trừ bồi thường
  - Tại: trường **"Giảm trừ bồi thường"** trong section.
  - Khi: kế toán mở SO ở màn Edit.
  - Thì: input số + dropdown đơn vị **VND / %** (mặc định **VND**). Chế độ **%** tính trên **Tổng "Cộng sau VAT" thuộc BH**.
  - Ý nghĩa: khoản BH loại trừ/giảm bồi thường → **giảm "BH thanh toán"** + **chuyển sang KH** (dấu **+** màu đỏ).

- [ ] **AC-7**: Khấu trừ bảo hiểm
  - Tại: trường **"Khấu trừ bảo hiểm"** trong section.
  - Khi: kế toán mở SO ở màn Edit.
  - Thì: input số (đơn vị **VND**; theo chốt v4 không có chế độ %). Mặc định 0.
  - Ý nghĩa: khoản khấu trừ theo hợp đồng BH → **giảm "BH thanh toán"** + **chuyển sang KH** (dấu **+** màu đỏ).

- [ ] **AC-8**: Nút "Áp dụng tất cả" — set khấu hao đồng loạt
  - Tại: cạnh trường **"Khấu hao vật tư / thay mới"** (header), nút **"Áp dụng tất cả"**.
  - Khi: kế toán nhập mức khấu hao **x%** ở trường header và nhấn **"Áp dụng tất cả"**.
  - Thì: hệ thống set **tất cả dòng phụ tùng thuộc BH** = cùng mức khấu hao **x%** (cột "Khấu hao (%)" của mọi dòng = x). Sau đó kế toán vẫn có thể override % riêng từng dòng (AC-5 cách b).
  - Lưu ý: nút này dành **riêng cho khấu hao** (không áp dụng cho 4 khoản điều chỉnh còn lại).

### Nhóm C — Panel "Tổng giá dịch vụ" (panel kết quả, bên phải) — read-only

> **Điều kiện hiển thị (chốt 2026-06-10, theo production screenshot)**: panel **"Tổng giá dịch vụ"** hiển thị trên **cả SO có Bảo hiểm và SO không Bảo hiểm** (màn Edit + Detail), nhưng **phần đặc thù BH chỉ hiển thị khi SO chọn "Bảo hiểm = Có"** (xem BR-INS-SO-ADJ-009):
> - **SO có Bảo hiểm**: "Chi tiết theo bên thanh toán" **2 cột (Bảo hiểm thanh toán + Khách hàng thanh toán)** + section **"Phân bổ Bảo hiểm"** + "Cân thanh toán" **3 dòng** (BH + KH + Tổng) — đầy đủ như AC-9..11.
> - **SO không Bảo hiểm**: "Chi tiết theo bên thanh toán" **1 cột (chỉ Khách hàng thanh toán)** + **KHÔNG có section "Phân bổ Bảo hiểm"** + "Cân thanh toán" **2 dòng** (Khách hàng thanh toán + Tổng thanh toán).

- [ ] **AC-9**: Bảng "Chi tiết theo bên thanh toán"
  - Tại: panel **"Tổng giá dịch vụ"** → section **"Chi tiết theo bên thanh toán"**.
  - Khi: SO có dòng thuộc BH và/hoặc KH.
  - Thì: hiển thị bảng 3 cột **Khoản mục | BH | KH**, gồm các dòng:
    - **"Dịch vụ"** — Σ đơn giá công DV theo từng bên thanh toán.
    - **"Phụ tùng"** — Σ thành tiền phụ tùng theo từng bên.
    - **"VAT"** — tổng thuế theo từng bên. **Thuế suất do người dùng tự nhập** trên từng dòng (cột "Thuế" của line item — không cố định 10%, không theo cấu hình hệ thống). Nhãn "%" hiển thị phản ánh mức thuế đã nhập. VAT (BH) = Σ thuế các dòng BH; VAT (KH) = Σ thuế các dòng KH.
    - **"Cộng sau VAT"** — (Dịch vụ + Phụ tùng + VAT) theo từng bên. Đây là **cơ sở tính phân bổ BH**.
  - Ví dụ thực (screenshot): Dịch vụ BH 21.000.000 / KH 0; Phụ tùng BH 168.000.000 / KH 30.000.000; VAT BH 18.900.000 / KH 3.000.000; **Cộng sau VAT BH 207.900.000 / KH 33.000.000**.

- [ ] **AC-10**: Bảng "Phân bổ Bảo hiểm" — **chỉ hiển thị khi SO có Bảo hiểm**
  - Tại: panel **"Tổng giá dịch vụ"** → section **"Phân bổ Bảo hiểm"** (chỉ render khi SO chọn "Bảo hiểm = Có" — xem note Nhóm C + BR-INS-SO-ADJ-009; SO không Bảo hiểm thì section này **không xuất hiện**).
  - Khi: kế toán đã nhập các khoản điều chỉnh.
  - Thì: hiển thị 5 dòng điều chỉnh với **dấu và màu** rõ ràng:
    - **"CK liên kết BH — Vật tư"**: dấu **−**, màu xanh (giảm BH, không sang KH).
    - **"CK liên kết BH — Công dịch vụ"**: dấu **−**, màu xanh.
    - **"Giảm trừ bồi thường"**: dấu **+**, màu đỏ (chuyển sang KH).
    - **"Khấu hao vật tư / thay mới"**: dấu **+**, màu đỏ.
    - **"Khấu trừ BH"**: dấu **+**, màu đỏ.
  - Ví dụ thực: −5.000.000 / −2.500.000 / +2.000.000 / +200.000 / +520.000.

- [ ] **AC-11**: Khối "Cân thanh toán"
  - Tại: panel **"Tổng giá dịch vụ"** → section **"Cân thanh toán"**.
  - Khi: panel refresh.
  - Thì: hiển thị 3 ô kết quả (read-only, highlight):
    - **"BH thanh toán"** (ô xanh) = Cộng sau VAT (BH) − CK liên kết BH (vật tư + công DV) − Giảm trừ bồi thường − Khấu hao − Khấu trừ BH.
    - **"Khách hàng thanh toán"** (ô cam) = Cộng sau VAT (KH) + Giảm trừ bồi thường + Khấu hao + Khấu trừ BH.
    - **"Tổng thanh toán"** (ô đen) = BH thanh toán + Khách hàng thanh toán.
  - Ví dụ thực: BH thanh toán **197.680.000đ**, Khách hàng thanh toán **35.720.000đ**, Tổng thanh toán **233.400.000đ**.

- [ ] **AC-12**: Cảnh báo khi "BH thanh toán" âm
  - Tại: ô **"BH thanh toán"** trong khối Cân thanh toán.
  - Khi: giá trị tính ra < 0 (tổng các khoản điều chỉnh giảm trừ lớn hơn Cộng sau VAT thuộc BH).
  - Thì: hệ thống highlight đỏ + cảnh báo **"BH thanh toán không thể âm — kiểm tra lại các khoản điều chỉnh"** (`ERR-INS-003` · `INLINE_WARNING`). **CHỐT (PO 2026-06-02): cho lưu kèm cảnh báo** (không chặn) — phiếu QT BH vẫn tạo được với số 0/âm để phục vụ audit.

### Nhóm D — Lưu & xử lý lỗi

- [ ] **AC-13**: Lưu các trường điều chỉnh khi lưu SO
  - Tại: nút **"Lưu"** Phiếu dịch vụ.
  - Khi: kế toán nhấn lưu.
  - Thì: hệ thống lưu các trường điều chỉnh BH (5 khoản) vào header của SO entity. Schema mới của gf-sales phải có các trường này (xem §4 API).

- [ ] **AC-14**: Validate giá trị input
  - Tại: các input trong section.
  - Khi: kế toán nhập số âm, hoặc % > 100 cho khoản hỗ trợ %, hoặc số tiền > cơ sở tương ứng.
  - Thì: hệ thống hiển thị lỗi cụ thể tại từng trường (`INLINE_FIELD`): **"Chiết khấu không thể lớn hơn 100%"** (`ERR-CMN-002`) / **"Khấu hao không thể lớn hơn 100%"** (`ERR-CMN-003`) cho khoản %, hoặc **"Số tiền vượt quá số lượng cho phép"** (`ERR-CMN-001`) khi số tiền > cơ sở. Mã lỗi dùng chung BE/FE — xem [`ERROR-CODE-REGISTRY`](../error-code/ERROR-CODE-REGISTRY.md).

- [ ] **AC-15**: Truyền thông tin phân bổ BH khi tạo phiếu quyết toán
  - Tại: hành động **tạo phiếu quyết toán** từ Phiếu dịch vụ (luồng baseline FEAT-STL-CREATE — đã production).
  - Khi: SO có thông tin bảo hiểm (toggle "Bảo hiểm = Có") + đã nhập phân bổ, và kế toán tạo phiếu quyết toán.
  - Thì: hệ thống **truyền (snapshot) block thông tin phân bổ bảo hiểm** sang phiếu quyết toán bảo hiểm, gồm: 5 khoản điều chỉnh (CK liên kết vật tư/công DV, khấu hao %, giảm trừ bồi thường, khấu trừ BH), bảng "Chi tiết theo bên thanh toán" (Cộng sau VAT BH/KH), và kết quả "Cân thanh toán" (BH thanh toán / Khách hàng thanh toán / Tổng thanh toán).
  - Lưu ý: **luồng tạo phiếu quyết toán (cặp KH+BH) đã có ở production** (FEAT-STL-CREATE baseline). Phần MỚI lần này chỉ là **bổ sung truyền thêm thông tin phân bổ BH** vào payload tạo phiếu QT — không xây mới luồng tạo phiếu.
  - **CHỐT (PO 2026-06-02)**: dữ liệu phân bổ **snapshot cứng** tại thời điểm tạo phiếu QT. **Sau khi tạo phiếu QT, Phiếu dịch vụ bị khoá VĨNH VIỄN — KHÔNG cho sửa lại thông tin** (theo logic production hiện hữu) → không phát sinh sai lệch snapshot, **không cần cơ chế re-snapshot**. **Phiếu QT BH KHÔNG có chức năng huỷ** (chốt 2026-06-08) → không có đường mở lại SO để sửa phân bổ.
  - **Error codes (BE↔FE)** — khi gọi tạo phiếu QT BH (luồng tạo = baseline EP-SETTLEMENT, nguồn VLD-INS-STL-*):
    - `INS_STL_COMPANY_REQUIRED` (INS-2002 · 422 · toast) — "Vui lòng chọn công ty bảo hiểm trên phiếu dịch vụ trước khi tạo phiếu quyết toán."
    - `INS_STL_DUPLICATE_DRAFT` (INS-2003 · 409 · toast) — "Phiếu dịch vụ này đã có phiếu quyết toán bảo hiểm."
    - `INS_STL_SO_NOT_COMPLETED` (INS-2004 · 422 · toast) — "Chỉ tạo được phiếu quyết toán khi phiếu dịch vụ đã hoàn thành."
    - `INS_STL_PAIR_ATOMIC_FAILED` (INS-2005 · 500 · toast + traceId) — "Tạo phiếu quyết toán không thành công. Vui lòng thử lại." (nguồn CB-INS-004)

### Nhóm E — Phân quyền

- [ ] **AC-16**: Phân quyền nhập điều chỉnh BH
  - Tại: section **"Phân bổ quyết toán bảo hiểm"**.
  - Khi: kế toán hoặc chủ garage truy cập SO.
  - Thì: cả 2 vai trò đều có quyền nhập/sửa. Phân quyền giữ nguyên như FEAT-SO-EDIT baseline.

### Nhóm F — Cảnh báo tại bước hoàn thành phiếu dịch vụ (CR-20260612-02)

- [ ] **AC-17**: Cảnh báo "Tổng bảo hiểm thanh toán âm" tại popup hoàn thành phiếu dịch vụ — **CR-20260612-02** *(MỚI)*
  - Tại: hộp thoại **"Hoàn thành phiếu dịch vụ"** (extend baseline [`FEAT-SO-DETAIL`](./FEAT-SO-DETAIL.md) AC-16, gf-sales — không dựng popup mới) — nội dung baseline: **"Bạn xác nhận hoàn thành phiếu dịch vụ?"** + nút "Hủy" / "Xác nhận".
  - Khi: SO có hạng mục Bảo hiểm (toggle **"Bảo hiểm = Có"** / Nguồn TT = Bảo hiểm) và **Tổng "Bảo hiểm thanh toán" < 0** (giá trị computed từ phân bổ — xem AC-11; tổng các khoản điều chỉnh giảm trừ lớn hơn Cộng sau VAT thuộc BH — cùng điều kiện AC-12) tại thời điểm mở popup.
  - Thì: trong popup hiển thị **dòng cảnh báo** ngay trong hộp thoại — **"Bảo hiểm thanh toán đang âm — kiểm tra lại các khoản điều chỉnh trước khi hoàn thành"** (`ERR-INS-003`). **Warn-and-allow**: nút **"Xác nhận"** **vẫn enable** — kế toán/chủ garage vẫn hoàn thành được SO (nhất quán AC-12 + EC-2 — cho lưu/hoàn thành kèm cảnh báo, phục vụ audit; KHÔNG chặn).
  - Khi: "Bảo hiểm thanh toán" ≥ 0, hoặc SO không có hạng mục Bảo hiểm.
  - Thì: popup hoàn thành hiển thị **nguyên baseline** (không có dòng cảnh báo BH).
  - Lưu ý: cảnh báo này **bổ sung** vị trí hiển thị (popup hoàn thành) bên cạnh cảnh báo inline panel (AC-12) — KHÔNG thay thế. Boundary `gf-sales` (popup hoàn thành thuộc luồng SO).
  - **Error codes (BE↔FE)**:
    - `ERR-INS-003` (`INLINE_WARNING` · cảnh báo non-block) — "Bảo hiểm thanh toán đang âm — kiểm tra lại các khoản điều chỉnh trước khi hoàn thành." *(dùng chung với AC-12 — cùng cảnh báo, thêm vị trí hiển thị tại popup hoàn thành; xem [`ERROR-CODE-REGISTRY`](../error-code/ERROR-CODE-REGISTRY.md))*

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13257-469505&m=dev |
| Figma | mobile | https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=319-65571&m=dev |

- Behavior spec: [`Product/ux/UX-FLOW-INSURANCE-SETTLEMENT.md`](../ux/UX-FLOW-INSURANCE-SETTLEMENT.md) §3 (wireframe section "Phân bổ quyết toán bảo hiểm") + §4 Bước 4.
- Design source: **Figma** (web + mobile — xem bảng trên). HTML mockup không dùng (chốt PO 2026-06-02 — design-source = Figma).

## 4. API Reference

- Boundary: `gf-sales` (qua BFF `agg-garage-graph`)
- Mutation `UpdateServiceOrder` mở rộng input:
  - `insuranceCompany: String`
  - `insurancePolicyNo: String`
  - `insuranceInspectorName: String`, `insuranceInspectorPhone: String`
  - `discountMaterial: { mode: 'PERCENT' | 'AMOUNT', value: Number }`
  - `discountLabor: { mode: 'PERCENT' | 'AMOUNT', value: Number }`
  - `depreciationDefault: { percent: Number }`
  - `depreciationByLine: [ { lineId: ID, percent: Number } ]`
  - `claimReduction: { mode: 'PERCENT' | 'AMOUNT', value: Number }`
  - `insuranceDeductible: { amount: Number }`
  - Thuế per dòng do người dùng nhập (trường `tax`/`vat` trên line item baseline) — không có field VAT% cấp SO; tổng VAT theo bên tính từ thuế các dòng.
- Query `GetServiceOrderDetail` response bổ sung block `insuranceAdjustment` gồm:
  - `breakdownByPayer`: { service: {bh, kh}, parts: {bh, kh}, vat: {bh, kh}, totalAfterVat: {bh, kh} } — bảng "Chi tiết theo bên thanh toán".
  - `adjustments`: 5 khoản với dấu (CK liên kết = giảm BH; giảm trừ/khấu hao/khấu trừ = chuyển sang KH).
  - `settlementBalance`: { bhPayment, customerPayment, totalPayment } — khối "Cân thanh toán".
  - Tất cả computed **server-side** trên cơ sở "Cộng sau VAT" để đảm bảo nhất quán với phiếu QT BH.

## 5. Business Rules

- **BR-INS-SO-ADJ-001**: Section "Phân bổ quyết toán bảo hiểm" hiển thị ở màn hình **Chỉnh sửa (Edit, cho nhập) + Chi tiết (Detail, read-only)** khi người dùng chọn **"Có"** tại mục **"Bảo hiểm"** (cùng trigger với khu vực thông tin bảo hiểm — AC-2). Chọn "Không" → ẩn. **KHÔNG** hiển thị ở màn hình Tạo (Create) — vì Create chỉ lập báo giá sơ bộ gửi BH duyệt, phân bổ BH nhập sau qua Edit.
> **Nguồn canonical: [`BR-EP-INSURANCE-SETTLEMENT`](../business-rules/BR-EP-INSURANCE-SETTLEMENT.md) §2.2** (`BR-INS-SO-ADJ-001..010`) + §7 Calculation. FEAT §5 dùng **đúng ID BR-EP** — reconcile numbering 2026-06-12 (bỏ hệ FEAT-local 001..011). Mapping cũ→mới: 002→**002+003**, 003→**004**, 004→**005**, 005→**§7 CALC**, 006+007→**008**, 008→**006**, 009→**007**, 010→**009**, 011→**010**.

- **BR-INS-SO-ADJ-002**: **Chiết khấu liên kết BH** (Vật tư + Công DV) nhập **% hoặc số tiền** (toggle, lưu `mode`+`value`).
- **BR-INS-SO-ADJ-003**: **Giảm trừ bồi thường** nhập **% hoặc số tiền** (toggle; mode % tính trên Tổng chi phí thuộc BH).
- **BR-INS-SO-ADJ-004**: **Khấu trừ bảo hiểm** chỉ nhập **số tiền** (không có chế độ %).
- **BR-INS-SO-ADJ-005**: **Khấu hao vật tư/thay mới** — **% khấu hao, chỉ áp dụng phụ tùng (vật tư) thuộc BH** (không công DV). Cột "Khấu hao (%)" per dòng + nút "Áp dụng tất cả" set đồng loạt; per-dòng override. Số tiền = Σ(thành tiền phụ tùng BH × % khấu hao dòng).
> **Công thức tính** (canonical: BR-EP §7 Calculation; cơ sở là **"Cộng sau VAT" theo bên thanh toán** — xác nhận production screenshot 2026-05-27):
  - `Cộng sau VAT (BH) = Σ(dịch vụ BH) + Σ(phụ tùng BH) + Σ(thuế các dòng BH)`.
  - `Cộng sau VAT (KH) = Σ(dịch vụ KH) + Σ(phụ tùng KH) + Σ(thuế các dòng KH)`. (Thuế do người dùng tự nhập per dòng — không cố định 10%.)
  - `BH thanh toán = Cộng sau VAT (BH) − CK liên kết BH (vật tư + công DV) − Giảm trừ bồi thường − Khấu hao vật tư/thay mới − Khấu trừ BH`.
  - `Khách hàng thanh toán = Cộng sau VAT (KH) + Giảm trừ bồi thường + Khấu hao vật tư/thay mới + Khấu trừ BH` (3 khoản chuyển từ BH sang KH; **CK liên kết BH KHÔNG cộng sang KH**).
  - `Tổng thanh toán = BH thanh toán + Khách hàng thanh toán`.

  **Ví dụ thực (production screenshot)**:
  | Khoản mục | BH | KH |
  |---|---|---|
  | Dịch vụ | 21.000.000 | 0 |
  | Phụ tùng | 168.000.000 | 30.000.000 |
  | VAT (10%) | 18.900.000 | 3.000.000 |
  | **Cộng sau VAT** | **207.900.000** | **33.000.000** |

  Điều chỉnh: CK liên kết vật tư −5.000.000, CK liên kết công DV −2.500.000, Giảm trừ bồi thường +2.000.000, Khấu hao +200.000, Khấu trừ BH +520.000.
  - BH thanh toán = 207.900.000 − 5.000.000 − 2.500.000 − 2.000.000 − 200.000 − 520.000 = **197.680.000đ**.
  - Khách hàng thanh toán = 33.000.000 + 2.000.000 + 200.000 + 520.000 = **35.720.000đ**.
  - Tổng thanh toán = **233.400.000đ**.
- **BR-INS-SO-ADJ-006**: Khu vực thông tin BH trên SO (toggle "Bảo hiểm", **dropdown công ty BH system-seeded**, số hợp đồng, ngày hết hạn, SĐT liên hệ, người giám định, upload "Hồ sơ bảo lãnh" max 5 files/30MB) **ĐÃ CÓ PRODUCTION** — không dev lần này (xem AC-2).
- **BR-INS-SO-ADJ-007**: % chiết khấu liên kết BH nhập **trực tiếp per-SO** (AC-3/AC-4) — không có % mặc định per công ty (danh sách system-seeded, không có entity master data để prefill).
- **BR-INS-SO-ADJ-008**: Khi đổi Nguồn TT của line item → cơ sở tính các khoản điều chỉnh refresh tự động; số liệu nhất quán giữa client-side realtime và server-side (server là nguồn chốt khi chênh lệch).
- **BR-INS-SO-ADJ-009**: **Hiển thị có điều kiện theo SO chọn Bảo hiểm** (chốt 2026-06-10, theo production screenshot): (a) **Panel "Tổng giá dịch vụ"** (Nhóm C) hiển thị trên **cả SO có/không Bảo hiểm**, nhưng phần đặc thù BH chỉ khi "Bảo hiểm = Có" — section **"Phân bổ Bảo hiểm"** ẩn khi không BH; "Chi tiết theo bên thanh toán" **2 cột (BH+KH)** khi có BH / **1 cột (KH)** khi không; "Cân thanh toán" **3 dòng** (có BH) / **2 dòng** (không BH). (b) **Cột "Khấu hao VT" (Khấu hao %)** trên bảng Phụ tùng sử dụng **chỉ hiển thị khi "Bảo hiểm = Có"**; SO không Bảo hiểm → ẩn cột. Song song với **BR-INS-STL-DET-009** (panel tương tự trên phiếu QT). *(Lưu ý: panel trên SO Edit/Detail giữ 2 cột BH+KH — KHÔNG áp CR-20260612-01; CR đó chỉ tách hiển thị trên màn **chi tiết phiếu QT** FEAT-INS-STL-DETAIL.)*
- **BR-INS-SO-ADJ-010** *(CR-20260612-02)*: Tại **popup "Hoàn thành phiếu dịch vụ"** (FEAT-SO-DETAIL AC-16), nếu SO có hạng mục Bảo hiểm và **Tổng "Bảo hiểm thanh toán" < 0** → hiển thị dòng cảnh báo `ERR-INS-003` **"Bảo hiểm thanh toán đang âm — kiểm tra lại các khoản điều chỉnh trước khi hoàn thành"**. **Warn-and-allow**: vẫn cho hoàn thành SO (không chặn — nhất quán AC-12/EC-2). Cảnh báo này bổ sung vị trí (popup hoàn thành) bên cạnh inline panel AC-12.

## 6. Edge Cases

- **EC-1**: SO không có dòng phụ tùng BH (chỉ có công DV BH) → Khấu hao vật tư bị disable hoặc ẩn (không có cơ sở áp dụng).
- **EC-2**: Bảo hiểm thanh toán tính ra = 0 hoặc âm → hệ thống cảnh báo nhưng **cho lưu** (chốt PO 2026-06-02 — xem AC-12); phiếu QT BH vẫn tạo được với số tiền 0/âm để phục vụ audit.
- **EC-3**: Kế toán đổi % chiết khấu sau khi đã ghi số tiền → toggle %/số tiền giữ giá trị gần nhất kế toán nhập trực tiếp; chế độ kia tự quy đổi.
- **EC-4**: Khấu hao đồng loạt = 0% + 1 dòng có khấu hao riêng 30% → chỉ dòng đó khấu hao 30%, các dòng khác 0%.
- **EC-5**: SO đã tạo phiếu QT BH → **khoá hoàn toàn, KHÔNG cho sửa các trường điều chỉnh (và SO nói chung)** theo logic production hiện hữu (chốt PO 2026-06-02). **Giao diện người dùng không có hành động huỷ phiếu quyết toán** → không có escape-hatch "huỷ phiếu để sửa" trên UI; mọi điều chỉnh sau khi đã tạo phiếu QT xử lý ở data model/backend (baseline EP-SETTLEMENT). Đồng bộ AC-15 + FEAT-INS-STL-DETAIL (chốt 2026-06-10).

## 7. Out of Scope

- Phân bổ Nguồn TT per line → năng lực baseline production (EP-SERVICE-ORDER), không thuộc scope feature này.
- **Luồng tạo phiếu quyết toán (cặp KH+BH)** → baseline production (FEAT-STL-CREATE, EP-SETTLEMENT). Feature này chỉ truyền thêm thông tin phân bổ BH vào payload tạo phiếu (AC-15), KHÔNG xây mới luồng tạo.
- Chi tiết / đối soát thanh toán phiếu QT BH → thuộc `FEAT-INS-STL-DETAIL`.
- Master data Doanh nghiệp BH + chiết khấu mặc định theo hợp đồng → ngoài epic này.
- Audit log thay đổi các khoản điều chỉnh → dùng **cơ chế audit chung của gf-sales**, **KHÔNG cần audit chuyên biệt** cho khoản điều chỉnh BH (chốt PO 2026-06-02).

## Related CRs

> Link sang [`Tracking/CHANGE-REQUESTS.md`](../../Tracking/CHANGE-REQUESTS.md) — chỉ liệt kê. Đọc chi tiết tại CR Registry.

| CR ID | Title (short) | Status | Scope hint |
|---|---|---|---|
| [CR-20260612-02](../../Tracking/CHANGE-REQUESTS.md#cr-20260612-02--ins-so-complete-popup-negative-bh-warn) | Popup hoàn thành SO cảnh báo Tổng BH âm | APPROVED | AC-17 / Nhóm F — extend FEAT-SO-DETAIL AC-16, warn-and-allow `ERR-INS-003` |
| [CR-20260616-02](../../Tracking/CHANGE-REQUESTS.md#cr-20260616-02--ins-total-panel-allocation-two-column) | Panel "Tổng giá dịch vụ" 2 cột (BH \| KH) | APPROVED | Layout 2 cột khối "Phân bổ Bảo hiểm" + "Cân thanh toán" trên màn SO Edit + SO Detail |
| [CR-20260618-02](../../Tracking/CHANGE-REQUESTS.md#cr-20260618-02--ins-so-print-voucher-add-allocation-and-payer-split) | Bản in PDV bổ sung "Phân bổ bảo hiểm" + tách "Cần thanh toán" | APPROVED | Mẫu in PDV (extend FEAT-SO-DETAIL print): 5 khoản 2-cột + 3 dòng "Cần thanh toán" + số "bằng chữ" bám KH thanh toán |

---

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-22 | 26 | Delivery Authority | Thêm section "Related CRs" — link 3 CR W02 Phase A (CR-20260612-02, -16-02, -18-02) sang `Tracking/CHANGE-REQUESTS.md`. Không copy nội dung CR — chỉ link dẫn + scope hint. |
| 2026-06-15 | 25 | Business Authority + Senior PM | **CR-20260612-02** (APPROVED, đầu W02): thêm **Nhóm F / AC-17** — cảnh báo "BH thanh toán âm" tại popup **"Hoàn thành phiếu dịch vụ"** (mở rộng FEAT-SO-DETAIL AC-16), warn-and-allow, dùng `ERR-INS-003` (cùng cảnh báo AC-12, thêm vị trí hiển thị). Đồng bộ BR-EP (AC-12/validation scope) + UX-FLOW. |
| 2026-06-15 | 24 | Business Authority + Senior PM | **Cross-ref FEAT-INS-STL-CREATE**: thêm `FEAT-INS-STL-CREATE` vào frontmatter `related` — payload phân bổ BH truyền khi tạo phiếu QT (AC-15) nay hiển thị read-only trên màn Tạo phiếu QT (panel "Tổng giá dịch vụ"). Không đổi nội dung AC/BR. |
| 2026-06-12 | 23 | BA/PO (anhluong) | **Reconcile BR numbering → BR-EP canonical**: rewrite §5 dùng đúng ID BR-EP §2.2 (BR-INS-SO-ADJ-001..010) + §7 Calculation, bỏ hệ FEAT-local 001..011. Mapping 002→002+003 (tách CK/Giảm trừ), 003→004, 004→005, 005→§7 CALC, 006+007→008, 008→006, 009→007, 010→009, 011→010. Cập nhật cross-ref AC (ADJ-010→009 panel; completion → 010). Công thức chuyển blockquote tham chiếu §7. Đồng bộ BR-EP v30. |
| 2026-06-12 | 22 | BA/PO (anhluong) | **CR-20260612-02 — cảnh báo "Tổng bảo hiểm thanh toán âm" tại popup hoàn thành phiếu dịch vụ**: thêm **Nhóm F + AC-17** (extend FEAT-SO-DETAIL AC-16) — popup "Hoàn thành phiếu dịch vụ" hiển thị dòng cảnh báo `ERR-INS-003` khi Tổng BH thanh toán < 0, **warn-and-allow** (vẫn cho hoàn thành, nhất quán AC-12/EC-2). Thêm **BR-INS-SO-ADJ-010**. Ghi chú BR-INS-SO-ADJ-009: panel trên SO giữ 2 cột (CR-20260612-01 chỉ áp màn chi tiết phiếu QT). Slot đầu W02. Đồng bộ BR-EP, Tracking/CHANGE-REQUESTS.md. |
| 2026-06-11 | 21 | BA/PO (anhluong) | **Gắn mã lỗi vào AC** (xem [`Product/error-code/ERROR-CODE-REGISTRY.md`](../error-code/ERROR-CODE-REGISTRY.md)): AC-12 → `ERR-INS-003` (`INLINE_WARNING`); AC-14 → `ERR-CMN-002`/`ERR-CMN-003` (% chiết khấu/khấu hao) + `ERR-CMN-001` (số tiền, canonical-hoá "Số tiền vượt quá số lượng cho phép" — gỡ message gắn biến cũ). |
|---|---|---|---|
| 2026-06-10 | 20 | BA/PO (anhluong) | **Validate hiển thị theo SO có Bảo hiểm** (theo production screenshot 2 ảnh): (1) note Nhóm C + AC-10 — panel **"Tổng giá dịch vụ"** hiển thị cả SO có/không BH nhưng phần BH (section "Phân bổ Bảo hiểm" + cột "Bảo hiểm thanh toán" + dòng Cân thanh toán BH) chỉ khi "Bảo hiểm = Có"; SO không BH = panel rút gọn 1 cột KH; (2) AC-5 — cột **"Khấu hao VT"** trên bảng phụ tùng chỉ hiển thị khi SO có BH; (3) thêm **BR-INS-SO-ADJ-009**. Song song BR-INS-STL-DET-009 (phiếu QT). Đồng bộ BR-EP v24. |
| 2026-06-10 | 19 | BA/PO (anhluong) | **Đánh dấu là CR mở rộng feature production**: thêm frontmatter `modifies: [FEAT-SO-EDIT, FEAT-SO-DETAIL]` + `related: FEAT-INS-STL-DETAIL` + `change_type`; rows Metadata (Loại thay đổi / Màn hình target); thêm **§0 Bối cảnh thay đổi** — DEV đọc FEAT-SO-EDIT/DETAIL trước, extend màn Phiếu dịch vụ đã có (thêm section "Phân bổ quyết toán bảo hiểm"), không dựng màn mới, KHÔNG áp Create. Giữ `artifact_kind=feature`. |
| 2026-06-10 | 18 | BA/PO (anhluong) | **EC-5 — gỡ escape-hatch "huỷ phiếu QT để sửa"**: giao diện người dùng không có hành động huỷ phiếu quyết toán; SO vẫn **khoá hoàn toàn** khi đã có phiếu QT (logic production), điều chỉnh sau đó xử lý ở data model/backend. Gỡ cross-ref tới FEAT-INS-STL-DETAIL EC-2 cũ. Đồng bộ FEAT-INS-STL-DETAIL v10-11, BR-EP v21, UX-FLOW v14. |
| 2026-06-04 | 17 | Business Authority | §3 UI/UX Reference: chuẩn hoá **Figma Mobile (App) design link** sang query `&m=dev` (dev-mode chuẩn, đồng bộ format link web), node-id `319-65571` giữ nguyên. Registry `figma-links.yaml` (mobile, wave01) sync theo. |
| 2026-06-04 | 16 | Business Authority | §3 UI/UX Reference: cập nhật **Figma Web design link** sang file mới `GMS-v.3` (file_key `EMGjGsnAJzGoGwTSK7dTuZ`, node `13257-469505`), thay link cũ `GMS-V3---New-Design` node `1113-15568`. Registry `figma-links.yaml` (web) sync theo; spec `Product/ux/figma-web/wave01-ins-so-adjustment.md` cần re-prefetch (`/prefetch-figma web 01`) vì design source đổi file. (CR-1780555878) |
| 2026-06-02 | 15 | PO (cuongnguyen_ac) + Business Authority | **Resolve 5 NEED CONFIRMATION (PO sign-off)**: (1) **AC-9/§scope** — production chỉ có 1 dòng "Tổng thành tiền" gộp 2 bên → toàn bộ panel "Tổng giá dịch vụ" theo bên thanh toán là MỚI; (2) **AC-12 + EC-2** — BH thanh toán 0/âm: cho lưu kèm cảnh báo (không chặn); (3) **AC-15** — snapshot cứng, SO khoá không cho sửa sau khi tạo phiếu QT → không cần re-snapshot; (4) **EC-5** — SO đã có phiếu QT BH: khoá hoàn toàn theo logic production, muốn sửa phải huỷ phiếu QT trước; (5) **Out of Scope** — audit dùng cơ chế chung gf-sales, không cần audit chuyên biệt. Gỡ "HTML mockup: TBD" (design-source = Figma). |  (App GMS v3 — New Design, node `319-65571`) cho mobile app, bổ sung bên cạnh link web hiện có (DESIGN-SOURCE-POLICY §2.1, figma mode). |
| 2026-06-02 | 13 | Business Authority | §3 UI/UX Reference: thêm **Figma Web design link** (GMS V3 — New Design, node `1113-15568`) theo schema DESIGN-SOURCE-POLICY §2.1 (figma mode); gỡ dòng tham chiếu "Production design reference (screenshot 2026-05-27)" (design-source thay bằng Figma). |
| 2026-05-27 | 1 | Business Authority | Khởi tạo FEAT từ PRD v5 §EP-INSURANCE-SETTLEMENT phạm vi §1 + công thức tính. 5 khoản điều chỉnh: chiết khấu liên kết vật tư/công DV (%/số tiền), khấu hao vật tư đồng loạt + per dòng, giảm trừ bồi thường (%/số tiền), khấu trừ BH (nhập tay). Bảng tổng realtime với 7 dòng. |
| 2026-05-27 | 2 | Business Authority | Cập nhật AC-2 theo PRD v6: trường **"Công ty bảo hiểm"** chuyển từ free text sang **dropdown chọn từ master data DN BH** (FEAT-INS-COMPANY-LIST). Khi chọn DN BH → auto-prefill % chiết khấu liên kết mặc định (có thể override per-SO). Số hợp đồng / Người giám định / SĐT giám định giữ là per-SO nhập tay. Thêm nút inline "+ Thêm DN BH mới" để giảm friction. |
| 2026-05-27 | 3 | Business Authority | **Correction nghiệp vụ**: section "Phân bổ quyết toán bảo hiểm" chỉ ở màn hình **Chỉnh sửa (Edit) + Chi tiết (Detail)**, KHÔNG ở Tạo (Create). Lý do: Create = báo giá sơ bộ gửi BH → BH duyệt + đưa phân bổ → Edit nhập phân bổ đã duyệt. Extends đổi FEAT-SO-CREATE+EDIT → FEAT-SO-EDIT (nhập) + FEAT-SO-DETAIL (read-only). Thêm AC-0 (Create KHÔNG hiển thị), cập nhật AC-1 (Edit/Detail only). Cập nhật BR-INS-SO-ADJ-001. |
| 2026-05-27 | 4 | Business Authority | **Sửa AC-2 (ghi sai)**: trigger hiển thị thông tin công ty BH là toggle **"Bảo hiểm" (Có/Không)** — cơ chế này + các trường fill (Công ty BH, số hợp đồng, người giám định, SĐT) **ĐÃ CÓ TRONG PRODUCTION**, không dev lần này. Tách AC-2b: tích hợp master data DN BH dropdown vào trường "Công ty bảo hiểm" → **NEED CONFIRMATION** (enhancement chưa chốt — production hiện dùng cơ chế fill sẵn có). Thêm BR-INS-SO-ADJ-008 (toggle baseline) + BR-INS-SO-ADJ-009 (master data integration NEED CONFIRMATION). |
| 2026-05-27 | 6 | Business Authority | Gỡ tham chiếu FEAT-INS-SO-PAYMENT-SOURCE (đã xoá — feature đã production): Depends on → "năng lực chọn Nguồn TT per dòng (EP-SERVICE-ORDER baseline)"; cập nhật BR-INS-SO-ADJ-006 + Out of Scope. |
| 2026-05-27 | 8 | Business Authority | **Sửa trigger AC-1**: section "Phân bổ quyết toán bảo hiểm" hiển thị khi người dùng chọn **"Có"** tại mục Bảo hiểm (cùng trigger AC-2), KHÔNG phải "có dòng thuộc BH". Chọn "Không" → ẩn cùng khu vực thông tin BH. Cập nhật BR-INS-SO-ADJ-001 tương ứng. |
| 2026-05-27 | 12 | Business Authority | **Bỏ 3 features FEAT-INS-COMPANY-*** — danh sách công ty BH là system-seeded production (garage chỉ chọn, không CRUD). Gỡ ghi chú/NEED CONFIRMATION về master data; cập nhật BR-INS-SO-ADJ-009 (system-seeded, không % chiết khấu mặc định per công ty). Dropdown công ty BH = baseline production. |
| 2026-05-27 | 11 | Business Authority | **Tiếp nhận scope từ FEAT-INS-STL-CREATE đã xoá** (tạo phiếu QT đã production): thêm AC-15 "Truyền thông tin phân bổ BH khi tạo phiếu quyết toán" — luồng tạo phiếu QT (cặp KH+BH) là baseline, phần mới chỉ truyền block phân bổ BH vào payload. Renumber Phân quyền AC-15 → AC-16. Cập nhật Out of Scope (luồng tạo phiếu QT = baseline; chi tiết QT → FEAT-INS-STL-DETAIL). |
| 2026-05-27 | 10 | Business Authority | **Thuế (VAT) do người dùng tự nhập per dòng** — không cố định 10%, không theo cấu hình (AC-9). Công thức "Cộng sau VAT" = dịch vụ + phụ tùng + Σ thuế các dòng theo bên thanh toán. Cập nhật BR-005 + API (bỏ field vatPercent cấp SO, dùng thuế per dòng baseline). Đồng bộ EP §5, BR-EP §7.2. |
| 2026-05-27 | 9 | Business Authority | **Làm rõ Khấu hao (AC-5) + Áp dụng tất cả (AC-8)**: khấu hao tính theo **% (không phải VND)**, **chỉ áp dụng phụ tùng** (không công DV); có cột "Khấu hao (%)" per dòng phụ tùng (override) + nút "Áp dụng tất cả" set đồng loạt mọi phụ tùng = x%. Nút "Áp dụng tất cả" dành **riêng cho khấu hao** (không phải cho cả 5 khoản). Cập nhật BR-INS-SO-ADJ-004 + wireframe UX-FLOW + BR-EP §7.1. |
| 2026-05-27 | 7 | Business Authority | **Chi tiết hoá theo production design screenshot**: (a) Nhóm B 5 trường điều chỉnh với dropdown đơn vị VND/% + ý nghĩa dấu (CK liên kết = − xanh không sang KH; giảm trừ/khấu hao/khấu trừ = + đỏ chuyển sang KH) + nút "Áp dụng tất cả" (AC-8). (b) **Nhóm C panel "Tổng giá dịch vụ"** 3 phần: Chi tiết theo bên thanh toán (Dịch vụ/Phụ tùng/VAT/Cộng sau VAT × BH/KH — AC-9), Phân bổ Bảo hiểm (AC-10), Cân thanh toán (BH thanh toán/Khách hàng thanh toán/Tổng thanh toán — AC-11). (c) **Sửa công thức BR-005**: cơ sở tính là **"Cộng sau VAT" theo bên thanh toán** (không phải tổng thành tiền trước VAT) + worked example khớp screenshot (197.680.000 / 35.720.000 / 233.400.000). (d) API response thêm breakdownByPayer + settlementBalance + vatPercent. Renumber AC: Lưu/Validate/Phân quyền → AC-13/14/15. |
| 2026-05-27 | 5 | Business Authority | **Production screenshot xác nhận**: dropdown "Công ty bảo hiểm" **ĐÃ CÓ SẴN trong production** (list ABIC/AAA/Bảo Long/Bảo Minh/Bảo Việt/BHV + search). Gộp AC-2b vào AC-2 (resolve: toàn bộ khu vực thông tin BH là BASELINE). Bổ sung 2 trường production còn thiếu: **"Ngày hết hạn"** (date) + **"Hồ sơ bảo lãnh"** (upload max 5 files 30MB). Ghi chú phân định scope rõ: BASELINE = toàn khu vực thông tin BH; MỚI = chỉ section "Phân bổ quyết toán bảo hiểm" (5 khoản điều chỉnh). Phân biệt "Hồ sơ bảo lãnh" (SO upload, production) vs "Hồ sơ bảo hiểm" (4 tài liệu versioning, mới). Cập nhật BR-008/009. Còn NEED CONFIRMATION: nguồn quản lý list công ty BH + % chiết khấu mặc định per công ty (chưa có production). |
