---
type: feature
artifact_kind: feature
status: PLANNED
version: 7
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
boundary: "gf-accounting"
last_reviewed: "2026-07-08"
---

# FEAT-AP-EDIT: Chỉnh sửa kỳ kế toán (gồm đóng/mở kỳ)

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-AP-EDIT` |
| Title | Chỉnh sửa kỳ kế toán (gồm đóng/mở kỳ) |
| Parent Epic | `EP-INVENTORY-ACCOUNTING-PERIOD` |
| Boundary | `gf-accounting` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** chỉnh sửa một số thông tin kỳ kế toán (tên, mô tả, thứ tự hiển thị) và đóng/mở kỳ, **so that** tôi điều chỉnh nhãn hiển thị và kiểm soát thời điểm chốt sổ — khi đóng kỳ thì phiếu nhập/xuất trong kỳ bị khóa. Các trường định nghĩa khung kỳ (loại kỳ, thuộc kỳ, ngày) cố định sau khi tạo.

## 2. Acceptance Criteria

### Nhóm A — Mở form sửa

- [ ] **AC-1**: Mở form chỉnh sửa
  - Tại: danh sách (icon Sửa) hoặc chi tiết (nút **"Chỉnh sửa"**).
  - Khi: chủ garage chọn sửa một kỳ.
  - Thì: hệ thống mở form **"Sửa Kỳ kế toán"** với các trường điền sẵn (pre-filled) theo loại kỳ, nút **"Huỷ bỏ"** và **"Lưu"**.

### Nhóm B — Trường được sửa / bị khóa

- [ ] **AC-2**: Các trường được phép sửa
  - Tại: form sửa.
  - Khi: chủ garage chỉnh sửa.
  - Thì: hệ thống **chỉ cho phép sửa 4 trường**: **"Tên kỳ kế toán"** (bắt buộc), **"Mô tả"**, **"Trạng thái"** (dropdown "Chưa đóng"/"Đã đóng"), **"Thứ tự hiển thị"**. Tên bỏ trống → báo lỗi **"Tên kỳ kế toán là bắt buộc"**.

- [ ] **AC-3**: Các trường bị khóa
  - Tại: form sửa.
  - Khi: form được mở.
  - Thì: hệ thống **khóa (disable)** các trường: **"Loại kỳ"** (radio không tích chọn được), **"Năm"** (áp dụng cho kỳ Năm — hiển thị năm hiện tại của kỳ, read-only; đồng bộ với "Thuộc kỳ" của Quý/Tháng), **"Thuộc kỳ"**, **"Ngày bắt đầu"**, **"Ngày kết thúc"**, checkbox **"Tự động sinh kỳ"** — hiển thị giá trị hiện tại nhưng không cho chỉnh. (Loại kỳ, phân cấp/năm và khoảng ngày là cố định sau khi tạo — muốn đổi năm phải xóa kỳ và tạo lại per EC-2.)

### Nhóm C — Đóng / mở kỳ

- [ ] **AC-4**: Đổi trạng thái đóng kỳ
  - Tại: trường **"Trạng thái"** (dropdown: "Chưa đóng" / "Đã đóng").
  - Khi: chủ garage đổi sang **"Đã đóng"** và Lưu.
  - Thì: hệ thống chuyển kỳ sang trạng thái **"Đã đóng"**; từ đó chặn thêm/sửa/xóa phiếu nhập kho, xuất kho có ngày chứng từ thuộc kỳ (enforcement chi tiết tại EP-INVENTORY-RECEIPT-V2 / EP-INVENTORY-DELIVERY-V2). **Đóng kỳ KHÔNG chặn việc tính giá lần đầu** cho kỳ (vẫn chạy `FEAT-PRC-CREATE` được) — chỉ **RECALC** bị chặn (BR-PRC-008). Cho phép đóng kỳ **kể cả khi còn phiếu xuất chưa tính giá** (giá vốn = 0); đóng kỳ **không vĩnh viễn** — muốn tính/tính lại sau đó thì **mở lại kỳ** (AC-5).

- [ ] **AC-5**: Mở lại kỳ & không ràng buộc thứ tự
  - Tại: trường **"Trạng thái"**.
  - Khi: chủ garage đổi một kỳ **"Đã đóng"** về **"Chưa đóng"** và Lưu.
  - Thì: hệ thống cho phép **mở lại** kỳ. Việc đóng/mở **không ràng buộc thứ tự** giữa các kỳ (không bắt buộc đóng kỳ con trước kỳ cha hay ngược lại) — người dùng tự thao tác trên từng kỳ. **Khi mở lại → bỏ khóa, phiếu trong kỳ thao tác lại được.** Nếu sửa/thêm/xóa phiếu sau khi mở lại, hệ thống **KHÔNG tự tính lại giá** — người dùng **tự chạy RECALC** (`FEAT-PRC-RECALC`) cho kỳ đó và các kỳ sau bị ảnh hưởng theo thứ tự (vì tồn cuối kỳ là đầu vào kỳ sau — BR-PRC-015).

### Nhóm D — Lưu / Đóng

- [ ] **AC-6**: Lưu thay đổi
  - Tại: nút **"Lưu"**.
  - Khi: dữ liệu hợp lệ.
  - Thì: hệ thống lưu, hiển thị thông báo thành công, cập nhật **"Người sửa"** + **"Ngày sửa"**, quay về danh sách/chi tiết.

- [ ] **AC-7**: Huỷ bỏ
  - Tại: nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống đóng form, không lưu thay đổi.

### Nhóm E — Phân quyền

- [ ] **AC-8**: Phân quyền sửa
  - Tại: form chỉnh sửa.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò sửa được với quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87554&t=W7XJPVvhmdBPtv2c-4 |

- Luồng: [UX-FLOW-INVENTORY-ACCOUNTING-PERIOD](../ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md) §3.1, EC-7.

## 4. API Reference

- Boundary: `gf-accounting` (qua BFF `agg-garage-graph`).
- Cập nhật kỳ: Mutation `[PROPOSED] UpdateAccountingPeriod`.
- Đóng/mở kỳ: Mutation `[PROPOSED] SetAccountingPeriodStatus`.

## 5. Business Rules

- **BR-AP-016**: Chỉnh sửa kỳ chỉ cho phép sửa **Tên kỳ kế toán, Mô tả, Thứ tự hiển thị, Trạng thái** (đóng/mở); các trường **Loại kỳ, Năm (kỳ Năm), Thuộc kỳ, Ngày bắt đầu, Ngày kết thúc, Tự động sinh kỳ** bị khóa (cố định sau khi tạo).
- **BR-AP-010**: Đóng/mở là field trạng thái sửa qua feature này (không có feature đóng/mở riêng).
- **BR-AP-011**: Đóng/mở không ràng buộc thứ tự; cho mở lại kỳ đã đóng.
- **BR-AP-012**: Kỳ "Đã đóng" → khóa thao tác phiếu nhập/xuất trong kỳ.
- **BR-PRC-008**: Đóng kỳ chỉ chặn RECALC (không chặn tính giá lần đầu); mở lại kỳ để tính lại — đóng kỳ không vĩnh viễn.

## 6. Edge Cases

- **EC-1**: Đóng kỳ trong khi đang có phiếu nháp trong kỳ → áp dụng khóa cho thao tác sau thời điểm đóng (chi tiết tại RECEIPT-V2/DELIVERY-V2).
- **EC-2**: Cần đổi loại kỳ / khoảng ngày / nhóm cha → không sửa được; phải xóa kỳ (nếu đủ điều kiện) và tạo lại.
- **EC-3**: Đóng kỳ khi còn phiếu xuất chưa tính giá (giá vốn = 0) → vẫn cho đóng; cần cập nhật giá vốn thì mở lại kỳ rồi tính/tính lại (BR-PRC-008).
- **EC-4**: Mở lại kỳ → sửa phiếu → hệ thống **không auto tính lại**; người dùng tự RECALC kỳ đó + các kỳ sau theo thứ tự.

## 7. Out of Scope

- Tạo kỳ mới → xem `FEAT-AP-CREATE`.
- Xem chi tiết → xem `FEAT-AP-DETAIL`.
- Xóa kỳ → xem `FEAT-AP-DELETE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-AP-EDIT (mới) — sửa kỳ kế toán + đóng/mở kỳ (field trạng thái, không ràng buộc thứ tự, cho mở lại); đóng kỳ khóa phiếu nhập/xuất trong kỳ. Chỉ cho sửa Tên/Mô tả/Thứ tự hiển thị/Trạng thái đóng kỳ; Loại kỳ/Thuộc kỳ/Ngày/Tự động sinh kỳ bị khóa (BR-AP-016). |
| 2026-06-15 | 2 | Business Authority | Rà completeness: mô tả hệ quả đóng kỳ lên **tính giá** — AC-4 đóng kỳ không chặn tính lần đầu, chỉ chặn RECALC, cho đóng kể cả còn phiếu xuất chưa tính giá, không vĩnh viễn (A1); AC-5 mở lại → bỏ khóa + user tự RECALC, không auto cascade (A2); EC-3/EC-4 mới; §5 thêm BR-PRC-008. |
| 2026-06-16 | 3 | Business Authority | AC-5: gỡ cụm "(snapshot/đơn giá neo)" (khái niệm đã bỏ) → diễn đạt thẳng "tồn cuối kỳ là đầu vào kỳ sau" (BR-PRC-015). |
| 2026-06-26 | 4 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14146-87554`. Mobile chưa có. |
| 2026-07-03 | 5 | Business Authority | **Đồng bộ wording labels + buttons theo Figma** (rà soát wave 3): AC-1 tiêu đề "Thêm/Sửa Kỳ kế toán" → **"Sửa Kỳ kế toán"**, nút "Đóng" → **"Huỷ bỏ"**, entry từ chi tiết "Sửa" → **"Chỉnh sửa"**; AC-2 field "Đã đóng kỳ (trạng thái)" → **"Trạng thái"**; AC-4/AC-5 field "Đã đóng kỳ" → **"Trạng thái"**; AC-7 nút "Đóng" → **"Huỷ bỏ"** + tiêu đề AC. **Follow-up NEED CONFIRMATION**: (a) BR-AP-016 gốc ở `BR-GF-INVENTORY-ACCOUNTING-PERIOD` vẫn dùng wording "Trạng thái đóng kỳ" — cần cascade đồng bộ; (b) EDIT form kỳ năm: Figma hiển thị field "Năm" active/editable, nhưng BR-AP-016 chưa nêu — cần chốt Năm có được sửa hay khóa. |
| 2026-07-07 | 6 | Business Authority + Senior PM | **Move boundary**: frontmatter `gf-inventory` → `gf-accounting`. Rationale: Kỳ kế toán (AP) thuộc nghiệp vụ kế toán — khớp SAP FI-CO / Misa / Fast / Odoo. OB + Sổ tồn giữ ở `gf-inventory`. Ref EP-INVENTORY-ACCOUNTING-PERIOD v16. Nội dung AC/BR không đổi. |
| 2026-07-08 | 7 | Business Authority (quannn) + main agent | **Resolve 2 NEED CONFIRMATION v5** (audit W04 FEAT↔UX drift 2026-07-08): (a) Field **"Năm"** khi EDIT kỳ Năm → **KHÓA** (user quannn quyết) — AC-3 thêm "Năm" vào danh sách trường disable (áp dụng cho kỳ Năm; hiển thị năm hiện tại read-only; đồng bộ semantic với "Thuộc kỳ" của Quý/Tháng). BR-AP-016 cập nhật liệt kê "Năm (kỳ Năm)" vào nhóm trường khóa. Muốn đổi năm phải xóa + tạo lại per EC-2 (đã có). (b) BR-AP-016 wording đồng bộ — nhóm sửa dùng "Trạng thái" (khớp AC-2 dropdown wording sau rework v5). Cascade cần làm ở `BR-GF-INVENTORY-ACCOUNTING-PERIOD` (nguồn gốc BR) — flag để cascade batch riêng. |
