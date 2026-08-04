---
type: feature
artifact_kind: feature
status: PLANNED
version: 17
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INSURANCE-SETTLEMENT"
boundary: "gf-accounting"
modifies: ["FEAT-STL-DETAIL"]
related: ["FEAT-INS-DOSSIER-CREATE", "FEAT-INS-DOSSIER-VIEW", "FEAT-INS-SO-ADJUSTMENT", "FEAT-INS-STL-CREATE"]
change_type: "brownfield-enhancement"
last_reviewed: "2026-06-22"
---

# FEAT-INS-STL-DETAIL: Chi tiết phiếu quyết toán bảo hiểm

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-INS-STL-DETAIL` |
| Title | Chi tiết phiếu quyết toán bảo hiểm |
| Parent Epic | `EP-INSURANCE-SETTLEMENT` |
| Boundary | `gf-accounting` |
| Priority | P1 |
| Status | PLANNED |
| Loại thay đổi | **CR — mở rộng feature production** (không phải màn hình mới) |
| Màn hình target | [`FEAT-STL-DETAIL`](./FEAT-STL-DETAIL.md) — Chi tiết phiếu quyết toán (production, gf-accounting) |
| Reuses | Chức năng ghi nhận thanh toán từ `FEAT-STL-DETAIL` baseline (đã chốt v5 — KHÔNG phát triển logic mới) |

## 0. Bối cảnh thay đổi (Change Request — DEV đọc trước)

> ⚠️ **ĐÂY LÀ CR MỞ RỘNG MÀN HÌNH ĐÃ CÓ — KHÔNG dựng màn hình mới.**
>
> - **Target (production)**: [`FEAT-STL-DETAIL`](./FEAT-STL-DETAIL.md) — màn **Chi tiết phiếu quyết toán** đang chạy production (gf-accounting): 3 tab baseline (Bảng chi phí / Chứng từ & hoá đơn / Lịch sử thanh toán) + section thông tin BH + nút In/Chỉnh sửa + phân quyền. DEV agent **PHẢI đọc FEAT-STL-DETAIL trước**.
> - **Phạm vi CR này**: THÊM (a) **tab thứ 3 "Hồ sơ bảo hiểm đã xuất"** + (c) 2 nút thanh hành động **"Xuất hồ sơ bảo hiểm (PDF)"** + **"+ Tạo hồ sơ bảo hiểm"** — 3 element này **chỉ hiển thị khi Bên thanh toán = Bảo hiểm**, ẩn hoàn toàn với phiếu QT Khách hàng (BR-INS-STL-DET-007); (b) **panel "Tổng giá dịch vụ"** (Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm + Cân thanh toán) — **hiển thị trên CẢ phiếu QT BH lẫn KH** nhưng **mỗi phiếu chỉ hiển thị thông tin đúng bên thanh toán của phiếu — tách theo đúng bên thanh toán, không lẫn cột bên kia** (chốt **CR-20260612-01**): phiếu **BH** chỉ 1 cột "Bảo hiểm thanh toán" (bỏ cột/dòng "Khách hàng thanh toán"), giữ "Tổng thanh toán" + "Phân bổ Bảo hiểm"; phiếu **KH** chỉ 1 cột "Khách hàng thanh toán" + (nếu đi từ SO có chọn Bảo hiểm) **thêm section "Phân bổ Bảo hiểm"** các khoản chuyển sang KH chịu (BR-INS-STL-DET-009).
> - **Sub-feature cắm vào màn này**: [`FEAT-INS-DOSSIER-CREATE`](./FEAT-INS-DOSSIER-CREATE.md) (modal) + [`FEAT-INS-DOSSIER-VIEW`](./FEAT-INS-DOSSIER-VIEW.md) (tab).
> - **Nguyên tắc DEV**: extend, không rebuild; tái sử dụng component màn hiện có; không phá vỡ hành vi baseline phiếu QT khách hàng.

## 1. User Story

**As** kế toán / chủ garage, **I want** xem chi tiết phiếu quyết toán bảo hiểm (thông tin quyết toán + KH/xe, bảng chi phí + panel "Tổng giá dịch vụ" với phân bổ BH, chứng từ, hồ sơ BH đã xuất, lịch sử thanh toán), **so that** kiểm soát công nợ phải thu từ doanh nghiệp bảo hiểm và theo dõi đối soát theo từng đợt thanh toán.

## 2. Acceptance Criteria

### Nhóm A — Header & thông tin chung

- [ ] **AC-1**: Header phiếu QT BH + thanh hành động
  - Tại: màn hình chi tiết phiếu quyết toán (loại Bảo hiểm).
  - Khi: kế toán mở phiếu.
  - Thì: hiển thị tiêu đề **mã phiếu** (vd `#SET-20260326-00001`) + nút back, và thanh hành động bên phải:
    - **"Chỉnh sửa"**.
    - **"Xuất hồ sơ bảo hiểm (PDF)"**.
    - **"+ Tạo hồ sơ bảo hiểm"** (nút primary).
  - **Điều kiện hiển thị (chốt 2026-06-10)**: 2 nút **"Xuất hồ sơ bảo hiểm (PDF)"** + **"+ Tạo hồ sơ bảo hiểm"** **chỉ hiển thị khi Bên thanh toán của phiếu = Bảo hiểm**. Với phiếu QT bên thanh toán = **Khách hàng** → **không hiển thị** (thanh hành động về layout baseline phiếu QT KH). Gate **chỉ theo Bên thanh toán** — **không** ràng buộc trạng thái phiếu; **giao diện người dùng không có trạng thái DRAFT** (xem BR-INS-STL-DET-007).
  - (Có nút "Button" placeholder trong design — bỏ qua, không phải chức năng thật.)
  - **Error codes (BE↔FE)**:
    - `INS_STL_NOT_FOUND` (INS-2006 · 404 · error state) — "Không tìm thấy phiếu quyết toán bảo hiểm."

- [ ] **AC-2**: Khối "Thông tin quyết toán"
  - Tại: section **"Thông tin quyết toán"** (cột trái).
  - Khi: phiếu được tải.
  - Thì: hiển thị: **"Phiếu dịch vụ liên kết"** (mã PDV — link), **"Người tạo"**, **"Ngày tạo"**, **"Bên thanh toán"** = **"Bảo hiểm"**, **"Cập nhật lần cuối"**, **"Ghi chú quyết toán"** (— nếu trống).

- [ ] **AC-3**: Khối "Thông tin khách hàng & xe"
  - Tại: section **"Thông tin khách hàng & xe"** (cột phải).
  - Khi: phiếu được tải.
  - Thì: hiển thị snapshot từ SO: **"Tên khách hàng"**, **"Số điện thoại"**, **"Loại khách hàng"** (vd Cá nhân), **"Hãng xe"** (vd Honda - Civic), **"Biển số xe"**, **"Số km đã chạy"**.

### Nhóm B — 4 tabs nội dung

- [ ] **AC-4**: Bộ 4 tab
  - Tại: vùng nội dung dưới 2 khối thông tin.
  - Khi: phiếu được tải.
  - Thì: hiển thị 4 tab: **"Bảng chi phí"** (mặc định active), **"Chứng từ & hoá đơn"**, **"Hồ sơ bảo hiểm đã xuất"**, **"Lịch sử thanh toán"**.
  - **Thứ tự tab (khớp design)**: 1. "Bảng chi phí" · 2. "Chứng từ & hoá đơn" · 3. **"Hồ sơ bảo hiểm đã xuất"** · 4. "Lịch sử thanh toán".
  - Lưu ý: trong 4 tab, **chỉ "Hồ sơ bảo hiểm đã xuất" là tab MỚI** (phát triển trong epic này), chèn ở **vị trí thứ 3** — giữa "Chứng từ & hoá đơn" và "Lịch sử thanh toán". **3 tab còn lại — "Bảng chi phí", "Chứng từ & hoá đơn", "Lịch sử thanh toán" — là tab CŨ (baseline production, reuse, KHÔNG dev lại)**. Tab "Hồ sơ bảo hiểm đã xuất" **chỉ hiển thị khi Bên thanh toán = Bảo hiểm** — phiếu QT bên thanh toán = **Khách hàng** **không có tab này** (về đúng 3 tab baseline). Xem BR-INS-STL-DET-007.

- [ ] **AC-5**: Tab "Bảng chi phí" — bảng hạng mục
  - Tại: tab **"Bảng chi phí"**, khu vực trái.
  - Khi: kế toán xem.
  - Thì: hiển thị bảng **"Dịch vụ thực hiện"** (và bảng **"Phụ tùng sử dụng"** — cuộn) với các cột: **STT**, **Tên dịch vụ/phụ tùng**, **Bên thanh toán** (Bảo hiểm/Khách hàng), **Người thực hiện**, **Đơn giá**, **Số lượng**, **Chiết khấu**, **Thuế**. Có **phân trang** (vd 10/trang, hiển thị tổng số trang). Dữ liệu read-only (snapshot).
  - **CHỐT (PO 2026-06-02)**: phiếu quyết toán đã tách **2 phiếu riêng** giữa Khách hàng và Bảo hiểm — **phiếu QT của bên nào chỉ hiển thị các hạng mục của bên đó** (logic baseline production). Vì vậy bảng chi phí phiếu QT BH **chỉ hiển thị hạng mục Nguồn TT = Bảo hiểm**; cột "Bên thanh toán" hiển thị "Bảo hiểm". *(Lưu ý: panel "Tổng giá dịch vụ" AC-6 vẫn hiển thị cả cột BH + KH vì là bảng phân bổ/cân thanh toán — khác với bảng line-item.)*

- [ ] **AC-6**: Tab "Bảng chi phí" — panel "Tổng giá dịch vụ" (bên phải) — **CR-20260612-01: tách hiển thị theo bên thanh toán**
  - Tại: tab **"Bảng chi phí"**, panel **"Tổng giá dịch vụ"** (cột phải) — read-only. Panel hiển thị trên **cả phiếu QT Bảo hiểm và phiếu QT Khách hàng**, nhưng **mỗi phiếu chỉ hiển thị thông tin đúng bên thanh toán của phiếu — tách theo đúng bên thanh toán, KHÔNG lẫn cột bên kia** (chốt **CR-20260612-01** 2026-06-12, đảo logic 2-cột cũ — xem BR-INS-STL-DET-009).
  - Khi: phiếu QT có **Bên thanh toán = Bảo hiểm**.
  - Thì: hiển thị **chỉ phần bảo hiểm** (KHÔNG lẫn cột/dòng Khách hàng):
    - **"Chi tiết theo bên thanh toán"**: bảng **1 cột** Khoản mục | **Bảo hiểm thanh toán** gồm Dịch vụ / Phụ tùng / VAT / **Cộng sau VAT** — **bỏ cột "Khách hàng thanh toán"** (CR-20260612-01a).
    - **"Phân bổ Bảo hiểm"**: CK liên kết BH — Vật tư (−), CK liên kết BH — Công dịch vụ (−), Giảm trừ bồi thường (+), Khấu hao vật tư/thay mới (+), Khấu trừ BH (+) — **giữ** (đặc thù BH).
    - **"Cân thanh toán"**: **"Bảo hiểm thanh toán"** (ô xanh) + **"Tổng thanh toán"** (ô đen, = "Bảo hiểm thanh toán" — **giữ**, chốt 2026-06-12) — **bỏ dòng "Khách hàng thanh toán"** (CR-20260612-01a).
  - Khi: phiếu QT có **Bên thanh toán = Khách hàng** và phiếu đi từ **SO có chọn Bảo hiểm**.
  - Thì: hiển thị phần khách hàng + phân bổ BH chuyển sang KH (**có điều kiện hiển thị "Phân bổ Bảo hiểm" theo nguồn SO** — CR-20260612-01b):
    - **"Chi tiết theo bên thanh toán"**: bảng **1 cột** Khoản mục | **Khách hàng thanh toán** gồm Dịch vụ / Phụ tùng / VAT / **Cộng sau VAT**.
    - **"Phân bổ Bảo hiểm"** *(MỚI — CR-20260612-01b)*: hiển thị các khoản điều chỉnh BH **chuyển sang Khách hàng chịu**: Giảm trừ bồi thường (+), Khấu hao vật tư/thay mới (+), Khấu trừ BH (+) — giúp KH hiểu vì sao phải chịu thêm; nhất quán CNF-INS-002. *(NEED CONFIRMATION (Business Authority): 2 khoản "CK liên kết BH" — chỉ giảm BH, không chuyển sang KH — có hiển thị trên phiếu KH để tham chiếu, hay ẩn?)*
    - **"Cân thanh toán"**: **"Khách hàng thanh toán"** (ô cam) + **"Tổng thanh toán"** (ô đen) — **KHÔNG có dòng "Bảo hiểm thanh toán"**.
  - Khi: phiếu QT có **Bên thanh toán = Khách hàng** và phiếu đi từ **SO KHÔNG chọn Bảo hiểm**.
  - Thì: hiển thị panel **rút gọn** — "Chi tiết theo bên thanh toán" **1 cột** Khách hàng thanh toán; **KHÔNG** có section "Phân bổ Bảo hiểm"; "Cân thanh toán" = "Khách hàng thanh toán" + "Tổng thanh toán".
  - Ví dụ thực: Cộng sau VAT BH 207.900.000 / KH 33.000.000; phiếu BH (sau 5 khoản điều chỉnh) → **Bảo hiểm thanh toán 197.680.000đ** = **Tổng thanh toán 197.680.000đ** (1 cột, không còn cột/dòng KH); phiếu KH (từ SO có BH) → **Khách hàng thanh toán 35.720.000đ** + mục Phân bổ Bảo hiểm (Giảm trừ bồi thường +2.000.000 / Khấu hao +200.000 / Khấu trừ BH +520.000).

- [ ] **AC-7**: Tab "Chứng từ & hoá đơn"
  - Tại: tab **"Chứng từ & hoá đơn"**.
  - Khi: kế toán mở tab.
  - Thì: hiển thị/quản lý chứng từ đính kèm phiếu QT (reuse cơ chế baseline FEAT-STL-DETAIL — xem/thêm/xoá chứng từ).

- [ ] **AC-8**: Tab "Hồ sơ bảo hiểm đã xuất"
  - Tại: tab **"Hồ sơ bảo hiểm đã xuất"** (chỉ có khi Bên thanh toán = Bảo hiểm — xem AC-4 + BR-INS-STL-DET-007).
  - Khi: kế toán mở tab.
  - Thì: hiển thị danh sách các bộ hồ sơ BH đã xuất (read-only, versioning) — nội dung thuộc `FEAT-INS-DOSSIER-VIEW`. Khi chưa có bộ hồ sơ nào → empty state.

- [ ] **AC-9**: Tab "Lịch sử thanh toán"
  - Tại: tab **"Lịch sử thanh toán"**.
  - Khi: kế toán mở tab.
  - Thì: hiển thị bảng lịch sử thanh toán từ BH (component baseline) — cột: Ngày, Số tiền, Phương thức, Ghi chú, File đính kèm. Sắp xếp giảm dần theo ngày.

### Nhóm C — Quyền & thao tác

- [ ] **AC-10**: Quyền & nghiệp vụ chỉnh sửa phiếu QT giữ nguyên
  - Tại: phiếu QT BH, nút **"Chỉnh sửa"**.
  - Khi: kế toán/chủ garage truy cập.
  - Thì: **quyền & nghiệp vụ chỉnh sửa phiếu QT giữ nguyên** như baseline FEAT-STL-DETAIL (đã chốt v4) — không thêm/bớt quyền riêng cho loại BH.

> **AC-11 (Huỷ phiếu QT BH) — đã gỡ 2026-06-10**: giao diện người dùng **không có hành động/trạng thái huỷ phiếu quyết toán** (không Draft, không Cancel trên UI). Cascade huỷ cặp KH+BH ở data model giữ nguyên (baseline EP-SETTLEMENT/KG/HLD). Số AC-12/AC-13 giữ nguyên (đang được cross-ref nhiều nơi) — không renumber để tránh vỡ tham chiếu.

- [ ] **AC-12**: Xuất hồ sơ bảo hiểm (PDF)
  - Tại: nút **"Xuất hồ sơ bảo hiểm (PDF)"** trên thanh hành động (label cũ "In toàn bộ hồ sơ" — đồng bộ Figma 2026-06-10).
  - Khi: kế toán nhấn.
  - Thì: hệ thống in/xuất **phiếu QT BH + bộ hồ sơ BH đã xuất gần nhất** (chốt PO 2026-06-02). Nếu chưa từng xuất bộ hồ sơ nào → chỉ in phiếu QT BH.
  - **Điều kiện hiển thị (chốt 2026-06-10)**: nút **chỉ hiển thị khi Bên thanh toán = Bảo hiểm** — ẩn với phiếu QT Khách hàng (xem BR-INS-STL-DET-007).

- [ ] **AC-13**: Nút "Tạo hồ sơ bảo hiểm"
  - Tại: nút **"+ Tạo hồ sơ bảo hiểm"** trên thanh hành động.
  - Khi: kế toán nhấn.
  - Thì: điều hướng sang `FEAT-INS-DOSSIER-CREATE` với phiếu QT BH này làm context.
  - **Điều kiện hiển thị (chốt 2026-06-10)**: nút **chỉ hiển thị khi Bên thanh toán = Bảo hiểm** — ẩn với phiếu QT Khách hàng. Gate **chỉ theo Bên thanh toán**, **không** ràng buộc trạng thái phiếu (giao diện người dùng không có trạng thái DRAFT). Xem BR-INS-STL-DET-007.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13255-177002&m=dev |
| Figma | mobile | https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=81-39472&m=dev |

- Behavior spec: [`Product/ux/UX-FLOW-INSURANCE-SETTLEMENT.md`](../ux/UX-FLOW-INSURANCE-SETTLEMENT.md) §3 (navigation map) + §4 Bước 9 (đối soát thanh toán BH).
- Design source: **Figma** (web + mobile — xem bảng trên). HTML mockup không dùng (chốt PO 2026-06-02 — design-source = Figma).

## 4. API Reference

- Boundary: `gf-accounting` (qua BFF `agg-garage-graph`)
- Query `GetSettlementDetail` mở rộng response:
  - Khi `payerType = INSURANCE` → trả thêm block `insuranceAdjustment` (snapshot: breakdownByPayer + adjustments + settlementBalance), `insurancePaymentHistory` (lịch sử thanh toán BH — read-only cho tab Lịch sử thanh toán), danh sách hồ sơ BH đã xuất.
- Ghi nhận thanh toán (`RecordSettlementPayment`) **không thuộc scope FEAT này** — đã có sẵn trên Phiếu quyết toán production (xem §7 Out of Scope).

## 5. Business Rules

> **Nguồn canonical: [`BR-EP-INSURANCE-SETTLEMENT`](../business-rules/BR-EP-INSURANCE-SETTLEMENT.md) §2.4** (`BR-INS-STL-DET-001..009`) + §8 (`PRINT-INS-001` BH bản in / `PRINT-INS-006` xuất hồ sơ / `PRINT-INS-007` KH bản in — CR-20260616-01). FEAT §5 dùng **đúng ID BR-EP** — đã reconcile numbering 2026-06-12 (bỏ hệ FEAT-local cũ DET-001..005). Mapping cũ→mới: DET-001→**002**, DET-002→**PRINT-INS-006**, DET-004→**007**, DET-005→**009**.

- **BR-INS-STL-DET-001**: Tenant isolation — phiếu QT BH chỉ truy cập từ tenant sở hữu.
- **BR-INS-STL-DET-002**: Trường **"BH thanh toán"** / **"Tổng tiền bảo hiểm trả"** = computed từ bảng phân bổ (panel "Tổng giá dịch vụ" → Cân thanh toán), **read-only**, không cho sửa tay (snapshot từ phân bổ khi tạo phiếu — xem BR-INS-STL-CRE-003).
- **BR-INS-STL-DET-003**: Ghi nhận thanh toán từ DN BH **tái sử dụng** chức năng baseline (RecordSettlementPayment), prefill `payerType = INSURANCE`.
- **BR-INS-STL-DET-004**: Trạng thái thanh toán phiếu QT BH (**Chưa thu** / **Thu một phần** / **Đã thu đủ**) **suy ra realtime** từ tổng đợt đã ghi nhận.
- **BR-INS-STL-DET-006**: Huỷ phiếu QT BH cascade huỷ cặp KH+BH + mở lại SO — **chỉ ở data model/baseline**; giao diện người dùng không có hành động/trạng thái huỷ (chốt 2026-06-10). *(Rule huỷ phiếu trên UI đã gỡ 2026-06-10 — giao diện người dùng không có hành động/trạng thái huỷ phiếu quyết toán; cascade huỷ giữ ở data model KG/HLD/events.)*
- **BR-INS-STL-DET-007**: Các element đặc thù bảo hiểm trên màn chi tiết phiếu QT — nút **"+ Tạo hồ sơ bảo hiểm"**, **"Xuất hồ sơ bảo hiểm (PDF)"**, tab **"Hồ sơ bảo hiểm đã xuất"** — **chỉ hiển thị khi Bên thanh toán = Bảo hiểm**; phiếu QT bên thanh toán = **Khách hàng** → **ẩn hoàn toàn** cả 3 element (về layout baseline phiếu QT KH). Gate **chỉ theo Bên thanh toán**, **không** ràng buộc trạng thái phiếu — **giao diện người dùng không có trạng thái DRAFT** (chốt 2026-06-10, thay điều kiện DRAFT cũ).
- **BR-INS-STL-DET-008**: Overpayment — BH trả vượt → "Đã thu đủ" + badge "Thừa: {số}"; phần thừa xử lý ngoài hệ thống (không auto negative adjustment).
- **BR-INS-STL-DET-009** *(CR-20260612-01 — đảo quy tắc v23)*: Panel **"Tổng giá dịch vụ"** (AC-6) hiển thị trên **cả 2 loại phiếu QT** (BH và KH), nhưng **mỗi phiếu chỉ hiển thị thông tin đúng bên thanh toán — không lẫn cột bên kia** (tránh lẫn lộn; đảo logic 2-cột chốt 2026-06-10):
  - **(a) Phiếu QT BH**: "Chi tiết theo bên thanh toán" **chỉ 1 cột "Bảo hiểm thanh toán"** (bỏ cột "Khách hàng thanh toán"); giữ **"Phân bổ Bảo hiểm"**; "Cân thanh toán" **"Bảo hiểm thanh toán" + "Tổng thanh toán"** (= Bảo hiểm thanh toán — **giữ**, chốt 2026-06-12), **bỏ dòng "Khách hàng thanh toán"**.
  - **(b) Phiếu QT KH đi từ SO có chọn Bảo hiểm**: "Chi tiết theo bên thanh toán" 1 cột "Khách hàng thanh toán" + **THÊM section "Phân bổ Bảo hiểm"** liệt kê các khoản điều chỉnh BH **chuyển sang KH chịu** (Giảm trừ bồi thường / Khấu hao vật tư/thay mới / Khấu trừ BH — dấu +; giúp KH hiểu vì sao phải chịu thêm — nhất quán CNF-INS-002); "Cân thanh toán" **"Khách hàng thanh toán" + "Tổng thanh toán"** (không có dòng "Bảo hiểm thanh toán").
  - **(c) Phiếu QT KH đi từ SO không chọn Bảo hiểm**: panel **rút gọn** 1 cột KH, **không** có "Phân bổ Bảo hiểm".
  - *(Đảo quy tắc v23: trước đây phiếu BH hiển thị 2 cột BH+KH và phiếu KH không có "Phân bổ Bảo hiểm". Khác BR-INS-STL-DET-007 — 3 element ẩn HOÀN TOÀN theo bên thanh toán; panel này **không ẩn** mà **tách/rút gọn**.)* *(NEED CONFIRMATION: 2 khoản "CK liên kết BH" có hiển thị trên phiếu KH không — chỉ giảm BH, không sang KH.)*
- **PRINT-INS-006** (BR-EP §8): Nút **"Xuất hồ sơ bảo hiểm (PDF)"** (label cũ "In toàn bộ hồ sơ") xuất bản in phiếu QT BH **+ bộ hồ sơ đã xuất gần nhất** (chốt PO 2026-06-02; nếu chưa có → chỉ phiếu QT BH). Tách biệt logic với phiếu QT KH baseline.
- **PRINT-INS-001** (BR-EP §8) *(CR-20260616-01)*: Bản in **phiếu QT BH** bổ sung section **"Phân bổ bảo hiểm"** trên khối tổng tiền (`note-total`) — **5 khoản dấu −**: CK liên kết BH × 2 (Vật tư + Công dịch vụ), Giảm trừ bồi thường, Khấu hao vật tư/thay mới, Khấu trừ BH → trước dòng "Tổng thanh toán". Mẫu in: `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-insurance.html`.
- **PRINT-INS-007** (BR-EP §8) *(CR-20260616-01 — mới)*: Bản in **phiếu QT KH đi từ SO có chọn Bảo hiểm** bổ sung section **"Phân bổ bảo hiểm"** — **3 khoản dấu +** chuyển sang KH chịu: Giảm trừ bồi thường, Khấu hao vật tư/thay mới, Khấu trừ BH. **Ẩn** 2 khoản CK liên kết BH (chỉ ảnh hưởng bên BH — chốt 2026-06-16). Cờ điều kiện `soHasInsurance` từ BFF/snapshot (tái dùng cờ CR-20260612-01). Phiếu QT KH từ SO **không** chọn BH **giữ bản in baseline** (không có section). Mẫu in: `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-customer.html`. Dấu +/− + nhãn khoản khớp panel màn chi tiết (BR-INS-STL-DET-009).
- **BR-INS-STL-DET-005** (BR-EP §2.4) *(CR-20260616-01 — mở rộng)*: Template in cross-ref PRINT-INS-001 (phiếu BH) + PRINT-INS-007 (phiếu KH từ SO có BH); phiếu KH từ SO không BH giữ baseline.

## 6. Edge Cases

- **EC-1**: Sửa SO sau khi đã có phiếu QT BH → bị chặn (xử lý theo luồng baseline EP-SETTLEMENT / SO-EDIT); xem CNF-INS-003 trong BR-EP-INSURANCE-SETTLEMENT §9. *(EC cũ về phiếu QT BH đã huỷ đã gỡ — UI không có trạng thái huỷ phiếu.)*

## 7. Out of Scope

- Tạo phiếu QT BH (luồng tạo cặp KH+BH) → baseline production (FEAT-STL-CREATE, EP-SETTLEMENT); truyền phân bổ BH khi tạo → FEAT-INS-SO-ADJUSTMENT AC-15.
- Tạo hồ sơ BH (4 tài liệu) → `FEAT-INS-DOSSIER-CREATE`.
- Xem hồ sơ BH đã xuất → `FEAT-INS-DOSSIER-VIEW`.
- Widget công nợ BH tổng hợp → `FEAT-INS-DASH-DEBT`.
- Đối soát & ghi nhận thanh toán từ doanh nghiệp BH (ghi nhận đợt thanh toán, trạng thái thu Chưa thu/Thu một phần/Đã thu đủ, xử lý thừa/thiếu) → **đã phát triển trên production tại Phiếu quyết toán (FEAT-STL-DETAIL baseline)**, KHÔNG thuộc scope FEAT này. Màn chi tiết QT BH chỉ **hiển thị** lịch sử thanh toán read-only (AC-9).

## Related CRs

> Link sang [`Tracking/CHANGE-REQUESTS.md`](../../Tracking/CHANGE-REQUESTS.md) — chỉ liệt kê. Đọc chi tiết tại CR Registry.

| CR ID | Title (short) | Status | Scope hint |
|---|---|---|---|
| [CR-20260612-01](../../Tracking/CHANGE-REQUESTS.md#cr-20260612-01--ins-stl-detail-panel-split-by-payer) | Panel chi tiết QT tách per-payer | APPROVED | AC-6 + BR-INS-STL-DET-009 — phiếu BH chỉ 1 cột; phiếu KH từ SO có BH thêm "Phân bổ Bảo hiểm" |
| [CR-20260616-01](../../Tracking/CHANGE-REQUESTS.md#cr-20260616-01--ins-stl-print-voucher-add-allocation) | Bản in phiếu QT bổ sung "Phân bổ bảo hiểm" | APPROVED | PRINT-INS-001 (phiếu BH 5 khoản dấu −) + PRINT-INS-007 (phiếu KH 3 khoản dấu +); BR-INS-STL-DET-005 mở rộng |
| [CR-20260618-01](../../Tracking/CHANGE-REQUESTS.md#cr-20260618-01--ins-stl-create-dual-voucher-when-insurance-covers-all) | Sinh phiếu QT KH khi BH 100% + KH chịu phân bổ | APPROVED | Render layout phiếu QT KH "chỉ phân bổ BH" (3 khoản dấu +, không có dòng dịch vụ/phụ tùng) — Figma web `13906-29632` / app `758-28571` |

---

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-22 | 17 | Delivery Authority | Thêm section "Related CRs" — link 3 CR W02 (CR-20260612-01, -16-01, -18-01) sang `Tracking/CHANGE-REQUESTS.md`. Không copy nội dung CR — chỉ link dẫn + scope hint. |
| 2026-06-18 | 16 | Delivery Authority (BE/raw cascade) | **CR-20260616-01 cascade BE/raw** (APPROVED 2026-06-16, slot W02 Phase A): §5 thêm mục **PRINT-INS-001** (phiếu BH 5 khoản dấu −) + **PRINT-INS-007** (phiếu KH từ SO có BH 3 khoản dấu +, ẩn 2 khoản CK liên kết BH chốt 2026-06-16) + **BR-INS-STL-DET-005** mở rộng cross-ref 2 mockup HTML; §5 intro cập nhật canonical refs §8 (PRINT-INS-001/006/007). Cờ điều kiện `soHasInsurance` tái dùng CR-20260612-01. Mẫu in `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-{insurance,customer}.html`. Đồng bộ BR-EP v32 + UX-FLOW Bước 9 (lưu ý bản in). |
| 2026-06-15 | 15 | Business Authority + Senior PM | **CR-20260612-01** (APPROVED, đầu W02): rewrite **AC-6** + **BR-INS-STL-DET-009** + §0(b) — tách panel "Tổng giá dịch vụ" theo đúng bên thanh toán (đảo logic 2-cột chốt 2026-06-10): phiếu BH **chỉ 1 cột BH** (bỏ cột/dòng "Khách hàng thanh toán", **giữ "Tổng thanh toán"**); phiếu KH từ SO có BH **thêm section "Phân bổ Bảo hiểm"** (các khoản chuyển sang KH); phiếu KH từ SO không BH giữ rút gọn. NEED CONFIRMATION: 2 khoản CK liên kết BH có hiển thị trên phiếu KH không. Đồng bộ BR-EP (BR-INS-STL-DET-009) + UX-FLOW. |
| 2026-06-12 | 15 | BA/PO (anhluong) | **Reconcile BR numbering → BR-EP canonical**: rewrite §5 dùng đúng ID BR-EP §2.4 (BR-INS-STL-DET-001..009 + PRINT-INS-006), bỏ hệ FEAT-local. Mapping DET-001→002, DET-002→PRINT-INS-006, DET-004→007, DET-005→009. Cập nhật cross-ref §0/AC (DET-004→007, DET-005→009). Đồng bộ BR-EP v30. |
| 2026-06-15 | 14 | Business Authority + Senior PM | **Cross-ref FEAT-INS-STL-CREATE**: thêm `FEAT-INS-STL-CREATE` vào frontmatter `related` — panel "Tổng giá dịch vụ" (AC-6) dùng cùng component & snapshot với panel read-only trên màn Tạo phiếu QT (BR-INS-STL-DET-009 song song BR-INS-STL-CRE-009). Không đổi nội dung AC/BR. |
| 2026-06-12 | 14 | BA/PO (anhluong) | **CR-20260612-01 — tách hiển thị panel "Tổng giá dịch vụ" theo bên thanh toán** (đảo BR-INS-STL-DET-009 v13): rewrite **AC-6** — phiếu **BH** chỉ 1 cột "Bảo hiểm thanh toán" (bỏ cột + dòng "Khách hàng thanh toán"), giữ "Phân bổ Bảo hiểm"; phiếu **KH** chỉ 1 cột "Khách hàng thanh toán" + hiển thị "Phân bổ Bảo hiểm" **chỉ khi đi từ SO có chọn Bảo hiểm** (nhất quán CNF-INS-002). Cập nhật §0 (b) + **BR-INS-STL-DET-009**. **GIỮ "Tổng thanh toán" trên phiếu BH** (= BH; chốt BA/PO 2026-06-12), chỉ bỏ dòng "Khách hàng thanh toán". Slot đầu W02. Đồng bộ BR-EP, Tracking/CHANGE-REQUESTS.md. |
| 2026-06-10 | 13 | BA/PO (anhluong) | **Validate hiển thị panel "Tổng giá dịch vụ" theo Bên thanh toán** (theo production screenshot): rewrite **AC-6** thành 2 nhánh — phiếu BH hiển thị đầy đủ (2 cột BH+KH, section "Phân bổ Bảo hiểm", Cân thanh toán 3 dòng); phiếu KH hiển thị **rút gọn** (1 cột KH, KHÔNG có "Phân bổ Bảo hiểm", Cân thanh toán 2 dòng). Thêm **BR-INS-STL-DET-009** (panel không ẩn hẳn mà rút gọn — khác BR-007 ẩn hoàn toàn). Refine §0 (b). Đồng bộ BR-EP v23. |
| 2026-06-10 | 12 | BA/PO (anhluong) | **Đánh dấu là CR mở rộng feature production**: thêm frontmatter `modifies: FEAT-STL-DETAIL` + `related` + `change_type`; rows Metadata (Loại thay đổi / Màn hình target); thêm **§0 Bối cảnh thay đổi** — DEV đọc FEAT-STL-DETAIL trước, extend màn chi tiết phiếu QT đã có (thêm tab 3 / panel phân bổ BH / 2 nút), không dựng màn mới. Giữ `artifact_kind=feature`. |
| 2026-06-10 | 11 | BA/PO (anhluong) | **Làm rõ tab "Hồ sơ bảo hiểm đã xuất" là tab MỚI** (AC-4): trong 4 tab, chỉ "Hồ sơ bảo hiểm đã xuất" là tab mới của epic — chèn **vị trí thứ 3** (giữa "Chứng từ & hoá đơn" và "Lịch sử thanh toán"); 3 tab còn lại (Bảng chi phí, Chứng từ & hoá đơn, Lịch sử thanh toán) là tab CŨ baseline (reuse). Thêm dòng thứ tự tab khớp design. |
| 2026-06-10 | 10 | BA/PO (anhluong) | **Gỡ hành động/trạng thái huỷ phiếu QT khỏi UI** — giao diện người dùng KHÔNG có trạng thái phiếu quyết toán Draft & Cancel: gỡ **AC-11** (Huỷ phiếu QT BH) + **BR-INS-STL-DET-003** (cascade huỷ cặp) + **EC-1** cũ (phiếu đã huỷ vẫn xem hồ sơ) + dòng API `CancelSettlement`; reword **EC-2→EC-1** (bỏ chữ "DRAFT"). Giữ số AC-12/13 + BR-004 (cross-ref) → để tombstone tại AC-11/BR-003, không renumber. Data model DRAFT/CANCEL giữ ở baseline/KG/HLD. Đồng bộ BR-EP v21, FEAT-INS-DOSSIER-VIEW v10. |
| 2026-06-10 | 9 | BA/PO (anhluong) | **Validate hiển thị element đặc thù BH theo Bên thanh toán**: (1) **gỡ điều kiện "chỉ hiển thị khi DRAFT"** khỏi AC-13 + BR-INS-STL-DET-007 — giao diện người dùng KHÔNG có trạng thái phiếu Draft; (2) nút **"+ Tạo hồ sơ bảo hiểm"** (AC-13), nút **"Xuất hồ sơ bảo hiểm (PDF)"** (AC-12), tab **"Hồ sơ bảo hiểm đã xuất"** (AC-4/AC-8) **chỉ hiển thị khi Bên thanh toán = Bảo hiểm**, ẩn hoàn toàn với phiếu QT Khách hàng (gate **chỉ theo Bên thanh toán**, không theo trạng thái); (3) đồng bộ label AC-12/BR-002 **"In toàn bộ hồ sơ" → "Xuất hồ sơ bảo hiểm (PDF)"** theo Figma. Đồng bộ BR-EP v20, UX-FLOW v13. |
| 2026-06-04 | 8 | Business Authority | §3 UI/UX Reference: chuẩn hoá **Figma Mobile (App) design link** sang query `&m=dev` (dev-mode chuẩn, đồng bộ format link web), node-id `81-39472` giữ nguyên. Registry `figma-links.yaml` (mobile, wave01) sync theo. |
| 2026-06-04 | 7 | Business Authority | §3 UI/UX Reference: cập nhật **Figma Web design link** sang file mới `GMS-v.3` (file_key `EMGjGsnAJzGoGwTSK7dTuZ`, node `13255-177002`), thay link cũ `GMS-V3---New-Design` node `1101-9485`. Registry `figma-links.yaml` (web) sync theo; spec `Product/ux/figma-web/wave01-ins-stl-detail.md` cần re-prefetch (`/prefetch-figma web 01`) vì design source đổi file. (CR-1780555878) |
| 2026-06-02 | 6 | PO (cuongnguyen_ac) + Business Authority | **Resolve 2 NEED CONFIRMATION (PO sign-off)**: (1) **AC-5** — bảng chi phí phiếu QT BH chỉ hiển thị hạng mục Nguồn TT = Bảo hiểm (phiếu QT mỗi bên chỉ hiển thị mục bên đó — logic baseline production); (2) **AC-12 + BR-002** — "In toàn bộ hồ sơ" = phiếu QT BH + bộ hồ sơ BH đã xuất gần nhất. Gỡ "HTML mockup: TBD" (design-source = Figma). |
| 2026-05-27 | 1 | Business Authority | Khởi tạo FEAT từ PRD v5 §EP-INSURANCE-SETTLEMENT phạm vi §2 + quyết định chốt v5 (đối soát thanh toán tái sử dụng FEAT-STL-DETAIL baseline). Phiếu QT BH có panel công nợ riêng, bảng phân bổ chi tiết, template in tách biệt phiếu QT KH. Cascade huỷ cặp KH+BH theo baseline. |
| 2026-05-27 | 2 | Business Authority | **Chi tiết hoá theo production design screenshot** (màn #SET): header + thanh hành động (Chỉnh sửa / In toàn bộ hồ sơ / Tạo hồ sơ bảo hiểm); khối "Thông tin quyết toán" (Phiếu DV liên kết, Người tạo, Ngày tạo, Bên thanh toán, Cập nhật lần cuối, Ghi chú QT) + "Thông tin khách hàng & xe"; **4 tab** (Bảng chi phí / Chứng từ & hoá đơn / Hồ sơ bảo hiểm đã xuất / Lịch sử thanh toán); tab Bảng chi phí = bảng hạng mục (cột Bên thanh toán/Người thực hiện/Đơn giá/SL/Chiết khấu/Thuế + phân trang) + panel "Tổng giá dịch vụ" (Chi tiết theo bên thanh toán / Phân bổ Bảo hiểm / Cân thanh toán). Rewrite AC-1..15. Gỡ ref FEAT-INS-STL-CREATE (đã xoá) → baseline. Đổi "In phiếu" → "In toàn bộ hồ sơ". |
| 2026-06-02 | 5 | Business Authority | §3 UI/UX Reference: thêm **Figma Mobile design link** (App GMS v3 — New Design, node `81-39472`) cho mobile app, bổ sung bên cạnh link web hiện có (DESIGN-SOURCE-POLICY §2.1, figma mode). |
| 2026-06-02 | 4 | Business Authority | §3 UI/UX Reference: thêm **Figma Web design link** (GMS V3 — New Design, node `1101-9485`) theo schema DESIGN-SOURCE-POLICY §2.1 (figma mode); gỡ dòng tham chiếu "Production design reference (screenshot 2026-05-27)" (design-source thay bằng Figma) + blockquote screenshot dưới §2. |
| 2026-05-29 | 3 | Business Authority | **Gỡ Nhóm C — Đối soát thanh toán từ doanh nghiệp BH** (cũ AC-10 Ghi nhận thanh toán + AC-11 Trạng thái thanh toán): việc ghi nhận thanh toán nằm trên Phiếu quyết toán và **đã được phát triển trên production** (FEAT-STL-DETAIL baseline) → không re-spec trong FEAT này. Relabel Nhóm D → Nhóm C, renumber AC-12..15 → AC-10..13. Gỡ BR-001/003/007 (payment reuse / status realtime / xử lý thừa) + renumber BR còn lại 1..4. Gỡ EC-1/2/3 (trạng thái thu) + renumber EC còn lại 1..2. Cập nhật §4 (bỏ RecordSettlementPayment khỏi scope), §7 Out of Scope (đối soát thanh toán = production baseline), User Story (bỏ "ghi nhận thanh toán"). Màn chỉ **hiển thị** lịch sử thanh toán read-only (tab AC-9 giữ nguyên). |
