---
type: feature
artifact_kind: feature
status: PLANNED
version: 7
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INSURANCE-SETTLEMENT"
boundary: "gf-accounting"
modifies: ["FEAT-STL-CREATE"]
related: ["FEAT-INS-SO-ADJUSTMENT", "FEAT-INS-STL-DETAIL"]
change_type: "brownfield-enhancement"
last_reviewed: "2026-06-22"
---

# FEAT-INS-STL-CREATE: Hiển thị phân bổ bảo hiểm trên màn Tạo phiếu quyết toán

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-INS-STL-CREATE` |
| Title | Hiển thị phân bổ bảo hiểm trên màn Tạo phiếu quyết toán |
| Parent Epic | `EP-INSURANCE-SETTLEMENT` |
| Boundary | `gf-accounting` |
| Priority | P1 |
| Status | PLANNED |
| Loại thay đổi | **CR — mở rộng feature production** (không phải màn hình mới) |
| Màn hình target | [`FEAT-STL-CREATE`](./FEAT-STL-CREATE.md) — Tạo phiếu quyết toán (production, gf-accounting) |
| Reuses | Luồng tạo phiếu QT (cặp KH+BH) + snapshot SO từ `FEAT-STL-CREATE` baseline — KHÔNG xây mới luồng tạo |

## 0. Bối cảnh thay đổi (Change Request — DEV đọc trước)

> ⚠️ **ĐÂY LÀ CR MỞ RỘNG MÀN HÌNH ĐÃ CÓ — KHÔNG dựng màn hình mới.**
>
> - **Target (production)**: [`FEAT-STL-CREATE`](./FEAT-STL-CREATE.md) — màn **Tạo phiếu quyết toán** (màn xác nhận tạo phiếu QT) đang chạy production (gf-accounting). Baseline đã có: tải snapshot SO; mục **"Khách hàng chi trả"** + **"Bảo hiểm chi trả"** (bảng dịch vụ / phụ tùng / ghi chú); trường **"Tổng tiền khách trả"** + **"Tổng tiền bảo hiểm trả"** (nhập tay — baseline AC-10/AC-11); nút **"Hủy"** / **"Xác nhận"**; tạo cặp phiếu QT KH+BH (AC-4/AC-5). DEV agent **PHẢI đọc FEAT-STL-CREATE trước**.
> - **Trigger nghiệp vụ**: sau khi Phiếu dịch vụ chuyển trạng thái **Hoàn thành**, kế toán/chủ garage ấn **"Tạo phiếu quyết toán"** → mở màn xác nhận tạo phiếu QT.
> - **Phạm vi CR này**: THÊM panel read-only **"Tổng giá dịch vụ"** (3 khối: Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm + Cân thanh toán) vào màn Tạo phiếu quyết toán — **snapshot từ phân bổ BH đã nhập trên SO** ([`FEAT-INS-SO-ADJUSTMENT`](./FEAT-INS-SO-ADJUSTMENT.md)). Panel **chỉ hiển thị phần đặc thù BH khi SO có hạng mục Nguồn TT = Bảo hiểm** (BR-INS-STL-CRE-009).
> - **Nguyên tắc DEV**: extend màn Tạo phiếu QT hiện có, không rebuild; tái sử dụng component panel "Tổng giá dịch vụ" (giống màn SO `FEAT-INS-SO-ADJUSTMENT` AC-9..11 và màn chi tiết `FEAT-INS-STL-DETAIL` AC-6); không phá vỡ hành vi baseline tạo phiếu QT khách hàng. Số liệu phân bổ **tính server-side**, KHÔNG tự tính lại logic mới (xem BR-INS-STL-CRE-002/003).

## 1. User Story

**As** kế toán / chủ garage, **I want** thấy bảng phân bổ bảo hiểm (Chi tiết theo bên thanh toán + 5 khoản điều chỉnh BH + Cân thanh toán) ngay trên màn **xác nhận Tạo phiếu quyết toán** trước khi bấm "Xác nhận", **so that** tôi đối chiếu được số tiền bảo hiểm phải thu và phần khách hàng chịu — đúng với phân bổ đã duyệt trên Phiếu dịch vụ — trước khi chốt tạo cặp phiếu quyết toán.

## 2. Acceptance Criteria

### Nhóm A — Trigger & điều kiện hiển thị panel

- [ ] **AC-1**: Mở màn Tạo phiếu quyết toán từ SO đã hoàn thành
  - Tại: màn hình Phiếu dịch vụ (Chi tiết) khi SO ở trạng thái **Hoàn thành**.
  - Khi: kế toán/chủ garage nhấn **"Tạo phiếu quyết toán"**.
  - Thì: hệ thống mở màn **"Tạo phiếu quyết toán"** (loại **"Dịch vụ xe"**), tải snapshot SO (gồm phân bổ BH đã nhập — xem FEAT-INS-SO-ADJUSTMENT). Hành vi mở màn + tải snapshot giữ nguyên baseline (FEAT-STL-CREATE AC-1).

- [ ] **AC-2**: Panel "Tổng giá dịch vụ" hiển thị có điều kiện theo SO có Bảo hiểm
  - Tại: màn **"Tạo phiếu quyết toán"**, panel **"Tổng giá dịch vụ"** (read-only).
  - Khi: SO có ≥ 1 hạng mục **Nguồn thanh toán = Bảo hiểm**.
  - Thì: panel hiển thị **đầy đủ 3 khối** (AC-3, AC-4, AC-5) — gồm cột **"Bảo hiểm thanh toán"** + section **"Phân bổ Bảo hiểm"**.
  - Khi: SO **không** có hạng mục Nguồn TT = Bảo hiểm (toàn bộ Khách hàng tự trả).
  - Thì: panel hiển thị **rút gọn** — "Chi tiết theo bên thanh toán" chỉ **1 cột "Khách hàng thanh toán"**, **KHÔNG** có section "Phân bổ Bảo hiểm", "Cân thanh toán" chỉ **2 dòng** (Khách hàng thanh toán + Tổng thanh toán). Song song với [`FEAT-INS-SO-ADJUSTMENT`](./FEAT-INS-SO-ADJUSTMENT.md) AC-9..11 (panel trên SO) + [`FEAT-INS-STL-DETAIL`](./FEAT-INS-STL-DETAIL.md) AC-6 (panel trên chi tiết QT) — xem BR-INS-STL-CRE-009.

### Nhóm B — Panel "Tổng giá dịch vụ" (read-only, snapshot từ phân bổ SO)

> Panel này **read-only** trên màn Tạo phiếu QT — số liệu là **snapshot** từ phân bổ BH đã nhập/đã duyệt trên Phiếu dịch vụ (FEAT-INS-SO-ADJUSTMENT). Tại màn này **không cho nhập/sửa** các khoản điều chỉnh (muốn sửa phải quay về SO ở màn Chỉnh sửa). Công thức xem BR-EP-INSURANCE-SETTLEMENT §7; tính **server-side** (BR-INS-STL-CRE-003).

- [ ] **AC-3**: Bảng "Chi tiết theo bên thanh toán"
  - Tại: panel **"Tổng giá dịch vụ"** → section **"Chi tiết theo bên thanh toán"**.
  - Khi: SO có Bảo hiểm.
  - Thì: hiển thị bảng **2 cột** Khoản mục | **"Bảo hiểm thanh toán"** | **"Khách hàng thanh toán"**, gồm các dòng:
    - **"Dịch vụ"** — Σ công dịch vụ theo từng bên thanh toán.
    - **"Phụ tùng"** — Σ thành tiền phụ tùng theo từng bên.
    - **"VAT"** — Σ thuế các dòng theo từng bên (**thuế do người dùng tự nhập per dòng** — không cố định 10%).
    - **"Cộng sau VAT"** — (Dịch vụ + Phụ tùng + VAT) theo từng bên. Là **cơ sở tính phân bổ BH**.

- [ ] **AC-4**: Bảng "Phân bổ Bảo hiểm" — chỉ hiển thị khi SO có Bảo hiểm
  - Tại: panel **"Tổng giá dịch vụ"** → section **"Phân bổ Bảo hiểm"** (chỉ render khi SO có hạng mục Nguồn TT = Bảo hiểm — xem AC-2 + BR-INS-STL-CRE-009).
  - Khi: panel tải.
  - Thì: hiển thị 5 dòng điều chỉnh (snapshot) với **dấu và màu** rõ ràng:
    - **"CK liên kết BH — Vật tư"**: dấu **−**, màu xanh (giảm "BH thanh toán", không chuyển sang KH).
    - **"CK liên kết BH — Công dịch vụ"**: dấu **−**, màu xanh.
    - **"Giảm trừ bồi thường"**: dấu **+**, màu đỏ (chuyển sang KH).
    - **"Khấu hao vật tư / thay mới"**: dấu **+**, màu đỏ (**% khấu hao, chỉ áp dụng phụ tùng**).
    - **"Khấu trừ BH"**: dấu **+**, màu đỏ.

- [ ] **AC-5**: Khối "Cân thanh toán"
  - Tại: panel **"Tổng giá dịch vụ"** → section **"Cân thanh toán"**.
  - Khi: panel tải.
  - Thì: hiển thị (read-only, highlight):
    - **"Bảo hiểm thanh toán"** (ô xanh) = Cộng sau VAT (BH) − CK liên kết BH (vật tư + công DV) − Giảm trừ bồi thường − Khấu hao − Khấu trừ BH.
    - **"Khách hàng thanh toán"** (ô cam) = Cộng sau VAT (KH) + Giảm trừ bồi thường + Khấu hao + Khấu trừ BH.
    - **"Tổng thanh toán"** (ô đen) = Bảo hiểm thanh toán + Khách hàng thanh toán.
  - Lưu ý: số liệu khớp với panel trên SO (FEAT-INS-SO-ADJUSTMENT AC-11) và chi tiết phiếu QT BH (FEAT-INS-STL-DETAIL AC-6) — cùng một snapshot.

### Nhóm C — Quan hệ với tổng tiền baseline & xác nhận tạo

- [ ] **AC-6**: Trường "Tổng tiền bảo hiểm trả" bên BH = read-only = computed
  - Tại: màn **"Tạo phiếu quyết toán"** → trường **"Tổng tiền bảo hiểm trả"** ở mục "Bảo hiểm chi trả" (baseline FEAT-STL-CREATE AC-11 cho **nhập tay**).
  - Khi: SO có Bảo hiểm (phiếu QT bên thanh toán = Bảo hiểm).
  - Thì: trường **"Tổng tiền bảo hiểm trả" chuyển read-only**, giá trị = **"Bảo hiểm thanh toán"** computed từ khối "Cân thanh toán" (AC-5) — tính **server-side** theo `BR-INS-STL-CRE-003`. **Không nhập tay** cho bên BH. (Trường **"Tổng tiền khách trả"** giữ hành vi baseline cho phiếu QT KH — `BR-STL-CRE-005`.)
  - **ĐÃ chốt** (không phải open question mới): theo `CNF-INS-001` (BR-EP §9.1, RESOLVED tại EP v2) — ưu tiên rule mới computed read-only cho bên BH, baseline nhập tay vẫn áp dụng phiếu QT KH. Mở rộng sang màn Tạo phiếu QT 2026-06-12.

- [ ] **AC-7**: Xác nhận tạo → snapshot panel vào cặp phiếu QT
  - Tại: màn **"Tạo phiếu quyết toán"**, nút **"Xác nhận"**.
  - Khi: kế toán/chủ garage nhấn **"Xác nhận"** và hệ thống tạo phiếu QT thành công.
  - Thì: hệ thống **snapshot block phân bổ BH** (Chi tiết theo bên thanh toán + 5 khoản điều chỉnh + Cân thanh toán) vào phiếu QT BH (immutable sau tạo). Luồng tạo cặp phiếu QT KH+BH + toast thành công + chuyển SO sang "Đã quyết toán" **giữ nguyên baseline** (FEAT-STL-CREATE AC-3/AC-4). Đồng bộ với FEAT-INS-SO-ADJUSTMENT AC-15 (truyền payload phân bổ khi tạo phiếu QT) + BR-INS-STL-CRE-002.

### Nhóm D — Phân quyền

- [ ] **AC-8**: Phân quyền giữ nguyên baseline
  - Tại: màn **"Tạo phiếu quyết toán"**.
  - Khi: kế toán hoặc chủ garage truy cập.
  - Thì: cả 2 vai trò đều có quyền tạo phiếu QT + xem panel phân bổ. Phân quyền giữ nguyên như FEAT-STL-CREATE AC-14 — không thêm/bớt quyền riêng cho loại BH.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13535-157815&m=dev |
| Figma | mobile | https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=553-27738&m=dev |

- Frame target: **"Xác nhận tạo quyết toán (Dịch vụ xe)"** (node `13535-155254`) — panel "Tổng giá dịch vụ" ở cột phải (Chi tiết theo bên thanh toán / Phân bổ Bảo hiểm / Cân thanh toán).
- Behavior spec: [`Product/ux/UX-FLOW-INSURANCE-SETTLEMENT.md`](../ux/UX-FLOW-INSURANCE-SETTLEMENT.md) §4 **Bước 5** (Hoàn thành SO & tạo cặp phiếu QT — màn xác nhận + panel "Tổng giá dịch vụ") + Entry Point #2.
- Design source: **Figma** (web + mobile — xem bảng trên).
- Panel "Tổng giá dịch vụ" dùng **cùng component** với màn SO (FEAT-INS-SO-ADJUSTMENT) và màn chi tiết phiếu QT (FEAT-INS-STL-DETAIL) — chỉ khác chế độ read-only (snapshot) tại màn tạo.

## 4. API Reference

- Boundary: `gf-accounting` (qua BFF `agg-garage-graph`)
- Query mở màn tạo phiếu QT (`PrepareCreateSettlement` / reuse query tải snapshot SO baseline) — response bổ sung block `insuranceAdjustment` (giống FEAT-INS-STL-DETAIL §4):
  - `breakdownByPayer`: { service: {bh, kh}, parts: {bh, kh}, vat: {bh, kh}, totalAfterVat: {bh, kh} } — bảng "Chi tiết theo bên thanh toán".
  - `adjustments`: 5 khoản (CK liên kết = giảm BH; giảm trừ/khấu hao/khấu trừ = chuyển sang KH).
  - `settlementBalance`: { bhPayment, customerPayment, totalPayment } — khối "Cân thanh toán".
  - Tất cả computed **server-side** trên cơ sở "Cộng sau VAT" (BR-INS-STL-CRE-003) — nhất quán với panel trên SO + phiếu QT BH.
- Mutation `CreateSettlement` (baseline) — khi `payerType = INSURANCE`, snapshot block `insuranceAdjustment` vào phiếu QT BH (BR-INS-STL-CRE-002). **KHÔNG phát triển mutation mới** — mở rộng payload luồng tạo baseline (xem FEAT-INS-SO-ADJUSTMENT §4 + AC-15).

## 5. Business Rules

> Các rule lõi (tạo phiếu QT BH + snapshot + tính server-side) **ĐÃ CÓ** ở [`BR-EP-INSURANCE-SETTLEMENT`](../business-rules/BR-EP-INSURANCE-SETTLEMENT.md) §2.3 — feature này **tham chiếu**, không nhân bản:

- **BR-INS-STL-CRE-001** (đã có): Phiếu QT BH chỉ tạo từ SO loại "Dịch vụ xe" có ≥ 1 dòng Nguồn TT = BH.
- **BR-INS-STL-CRE-002** (đã có): Phiếu QT BH snapshot dữ liệu BH từ SO tại thời điểm tạo (gồm bảng phân bổ: Cộng sau VAT + BH thanh toán/KH chịu) — immutable sau snapshot.
- **BR-INS-STL-CRE-003** (đã có): **"BH thanh toán" tính server-side** theo công thức (§7.2) — **không nhận giá trị nhập tay** (khác baseline BR-STL-CRE-005). → liên quan AC-6.
- **BR-INS-STL-CRE-004..008** (đã có): atomic cặp KH+BH, code generation, default status, pair linking, pre-condition guard công ty BH.

> Rule **MỚI** của feature này (đã bổ sung vào BR-EP §2.3, v28):

- **BR-INS-STL-CRE-009** (đã có): Trên màn **Tạo phiếu quyết toán**, panel **"Tổng giá dịch vụ"** hiển thị **read-only** (snapshot phân bổ từ SO, không cho nhập/sửa tại màn này). Hiển thị có điều kiện theo SO chọn Bảo hiểm: SO có BH → đầy đủ 3 khối (2 cột BH+KH + section "Phân bổ Bảo hiểm" + Cân thanh toán 3 dòng); SO không BH → rút gọn (1 cột KH, không có "Phân bổ Bảo hiểm", Cân thanh toán 2 dòng). Song song **BR-INS-SO-ADJ-009** (panel trên SO) + **BR-INS-STL-DET-009** (panel trên chi tiết QT) — cùng quy tắc rút gọn theo bên thanh toán. Màn Tạo phiếu QT **tạo cùng lúc cặp KH+BH** nên panel hiển thị **gộp 2 cột BH+KH** — song song **BR-INS-SO-ADJ-010** (panel trên SO, cũng gộp 2 cột). *(FEAT-world numbering; BR-EP canonical = SO-ADJ-009 / STL-DET-009.)*
  - ⚠️ **NEED CONFIRMATION (BA/PO) sau CR-20260612-01**: panel **chi tiết QT** (BR-INS-STL-DET-005) đã đổi sang **tách per-payer** (phiếu BH chỉ cột BH; phiếu KH có "Phân bổ Bảo hiểm"). Màn **Tạo phiếu QT** hiện **GIỮ hiển thị gộp 2 cột** (vì tạo cặp cùng lúc, trước khi tách thành 2 phiếu) — cần BA/PO xác nhận có áp quy tắc tách per-payer cho màn tạo không, hay giữ gộp như hiện tại.

## 6. Edge Cases

- **EC-1**: SO chỉ có dòng Khách hàng (không có dòng BH) → panel rút gọn 1 cột KH, không có "Phân bổ Bảo hiểm" (AC-2); luồng tạo phiếu QT đơn lẻ loại "Khách hàng" theo baseline (FEAT-STL-CREATE AC-5/EC-1).
- **EC-2**: SO có cả KH + BH nhưng "BH thanh toán" tính ra ≤ 0 (các khoản điều chỉnh giảm trừ ≥ Cộng sau VAT BH) → panel vẫn hiển thị + **cho tạo phiếu QT** kèm số 0/âm (kế thừa FEAT-INS-SO-ADJUSTMENT AC-12 / EC-2 — chốt PO 2026-06-02, phục vụ audit).
- **EC-3**: Phân bổ trên SO chưa nhập (toàn bộ 5 khoản = 0) → "Phân bổ Bảo hiểm" hiển thị 5 dòng giá trị 0; "Bảo hiểm thanh toán" = Cộng sau VAT (BH).
- **EC-4**: SO đã tạo phiếu QT BH trước đó (đang hoạt động) → block tạo trùng theo baseline (FEAT-STL-CREATE AC-15 / BR-STL-CRE-004). Panel không thay đổi hành vi block này.

## 7. Out of Scope

- **Nhập/sửa** các khoản điều chỉnh BH → thuộc [`FEAT-INS-SO-ADJUSTMENT`](./FEAT-INS-SO-ADJUSTMENT.md) (màn SO Edit). Màn Tạo phiếu QT chỉ **hiển thị read-only** (snapshot).
- **Luồng tạo cặp phiếu QT (KH+BH)** + sinh mã + chuyển trạng thái SO → baseline production (FEAT-STL-CREATE, EP-SETTLEMENT). Feature này chỉ thêm panel hiển thị + snapshot block phân bổ.
- **Chi tiết / đối soát thanh toán phiếu QT BH sau khi tạo** → [`FEAT-INS-STL-DETAIL`](./FEAT-INS-STL-DETAIL.md).
- **Tạo hồ sơ bảo hiểm (4 tài liệu)** → `FEAT-INS-DOSSIER-CREATE`.
- **Trường "Tổng tiền khách trả" nhập tay (baseline AC-10)** → giữ baseline cho phiếu QT KH. Trường "Tổng tiền bảo hiểm trả" bên BH chuyển read-only = computed (AC-6, đã chốt theo CNF-INS-001).

## Related CRs

> Link sang [`Tracking/CHANGE-REQUESTS.md`](../../Tracking/CHANGE-REQUESTS.md) — chỉ liệt kê. Đọc chi tiết tại CR Registry.

| CR ID | Title (short) | Status | Scope hint |
|---|---|---|---|
| [CR-20260612-01](../../Tracking/CHANGE-REQUESTS.md#cr-20260612-01--ins-stl-detail-panel-split-by-payer) | Panel chi tiết QT tách per-payer | APPROVED | Share component "Tổng giá dịch vụ" với panel màn Tạo QT (NEED CONFIRMATION ở §5 v6) |
| [CR-20260616-02](../../Tracking/CHANGE-REQUESTS.md#cr-20260616-02--ins-total-panel-allocation-two-column) | Panel "Tổng giá dịch vụ" 2 cột (BH \| KH) | APPROVED | Layout 2 cột khối "Phân bổ Bảo hiểm" + "Cân thanh toán" cho màn Tạo QT |
| [CR-20260618-01](../../Tracking/CHANGE-REQUESTS.md#cr-20260618-01--ins-stl-create-dual-voucher-when-insurance-covers-all) | Sinh phiếu QT KH khi BH 100% + KH chịu phân bổ | APPROVED | Mở rộng điều kiện sinh phiếu QT KH (b2 + case BH 100% → 2 phiếu, phiếu KH "chỉ phân bổ BH") |

---

## 8. Change Log


| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-22 | 7 | Delivery Authority | Thêm section "Related CRs" — link 3 CR W02 Phase A (CR-20260612-01, -16-02, -18-01) sang `Tracking/CHANGE-REQUESTS.md`. Không copy nội dung CR — chỉ link dẫn + scope hint. |
| 2026-06-15 | 6 | Business Authority + Senior PM | **Ảnh hưởng chéo từ CR-20260612-01** (tách panel chi tiết QT per-payer): §5 BR-INS-STL-CRE-009 thêm ghi chú — màn Tạo phiếu QT GIỮ hiển thị gộp 2 cột BH+KH (tạo cặp cùng lúc, song song panel SO), kèm **NEED CONFIRMATION** BA/PO có áp tách per-payer cho màn tạo không. Không đổi AC. |
| 2026-06-15 | 5 | Business Authority + Senior PM | **BR-INS-STL-CRE-009 đã chính thức** vào BR-EP §2.3 (v28) — §5 đổi từ "đề xuất" → "đã có". |
| 2026-06-15 | 4 | Business Authority + Senior PM | **Bổ sung Figma mobile** màn Tạo phiếu QT BH (App GMS v3 — New Design, node `553-27738`, chuẩn `&m=dev`) — gỡ NEED CONFIRMATION mobile ở §3. Đồng bộ EP §6 cột Figma (mobile). |
| 2026-06-15 | 3 | Business Authority + Senior PM | **Đưa FEAT vào repo** (tái tạo Feature ID đã xoá ở EP v8 — scope MỚI: **hiển thị panel** trên màn Tạo phiếu QT, KHÔNG rebuild luồng tạo). Cross-ref panel dùng **numbering FEAT-world** đồng bộ cách sibling FEAT cross-ref: **BR-INS-SO-ADJ-010** (panel trên SO) + **BR-INS-STL-DET-005** (panel trên chi tiết QT). *(Drift đã biết: BR-EP canonical đánh số panel = SO-ADJ-009/STL-DET-009 — xem BR-EP §10 v28; reconcile ở pass riêng.)* BR-INS-STL-CRE-009 (rule riêng của FEAT này, không drift) chờ `gen-business-rules`. Cập nhật EP §6 (5→6 features) + README index. NEED CONFIRMATION: link Figma mobile. |
| 2026-06-12 | 2 | BA/PO (anhluong) | Cross-ref panel theo bản trước + **Reconcile BR numbering → BR-EP canonical**: cross-ref panel cập nhật BR-INS-STL-DET-005→**009**, BR-INS-SO-ADJ-010→**009** (panel trên SO). *(Ghi chú reconcile: mô tả renumber panel BR sang `-009` ở bản này không khớp repo — đã đính chính ở v3.)* Không đổi nội dung AC/BR feature. |
| 2026-06-12 | 1 | Business Authority + Senior PM | Khởi tạo FEAT-INS-STL-CREATE — **CR mở rộng màn Tạo phiếu quyết toán** (baseline FEAT-STL-CREATE, gf-accounting): thêm panel read-only "Tổng giá dịch vụ" (Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm 5 khoản + Cân thanh toán), snapshot từ phân bổ SO, hiển thị có điều kiện theo SO có/không Bảo hiểm (AC-1..8). Tham chiếu BR-INS-STL-CRE-001..008 (đã có ở BR-EP §2.3); đề xuất BR-INS-STL-CRE-009 (display rule). Frontmatter `modifies: [FEAT-STL-CREATE]` + `change_type: brownfield-enhancement`. AC-6 (trường "Tổng tiền bảo hiểm trả" bên BH = read-only computed) **đã chốt theo CNF-INS-001** (RESOLVED tại EP v2) — không phải open question. NEED CONFIRMATION còn lại: Figma mobile link cho màn này. Tái dùng ID của feature đã xoá (EP Change Log v8) — scope khác: lần này document **hiển thị panel** trên màn tạo, không phải rebuild luồng tạo. |
