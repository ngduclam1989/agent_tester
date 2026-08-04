---
type: feature
artifact_kind: feature
status: PLANNED
version: 8
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-DELIVERY-V2"
boundary: "gf-inventory"
last_reviewed: "2026-07-16"
supersedes: "FEAT-ID-LIST"
---

# FEAT-ID-LIST-V2: Danh sách phiếu xuất kho (V2)

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-ID-LIST-V2` |
| Title | Danh sách phiếu xuất kho (V2) |
| Parent Epic | `EP-INVENTORY-DELIVERY-V2` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách phiếu xuất kho với tìm kiếm và bộ lọc, **so that** tôi theo dõi luồng xuất, giá vốn và trạng thái ghi sổ.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị danh sách

- [ ] **AC-1**: Mở màn danh sách
  - Tại: tab **"Phiếu xuất kho"**.
  - Khi: chủ garage truy cập.
  - Thì: hệ thống hiển thị màn **"Danh sách phiếu xuất kho"** với mô tả **"Không cho ghi sổ nếu làm tồn khả dụng âm."**, ô tìm kiếm + 5 bộ lọc, bảng danh sách, phân trang, và các nút **"Xuất excel"**, **"Tạo mới phiếu xuất"** (In per-row trong cột Thao tác — không có toolbar "In" bulk, xem AC-6).

- [ ] **AC-2**: Cột hiển thị
  - Tại: bảng danh sách.
  - Thì: hệ thống hiển thị: **"STT"**, **"Ngày xuất"**, **"Nguồn xuất"**, **"Số phiếu"**, **"Phiếu dịch vụ"**, **"Diễn giải"**, **"Tiền vốn"**, **"Đối tượng"**, **"Người phụ trách"**, **"Loại phiếu"**, **"Phụ tùng xuất"** (link "Xem sản phẩm"), **"Trạng thái"**, **"Thao tác"**. Sắp xếp mặc định: **Ngày xuất mới nhất lên đầu** (DESC), tie-break bởi Số phiếu DESC.

### Nhóm B — Tìm kiếm & lọc

- [ ] **AC-3**: Tìm kiếm
  - Tại: ô tìm kiếm, placeholder **"Tìm Số phiếu xuất, Phiếu dịch vụ, Diễn giải"**.
  - Khi: chủ garage nhập từ khóa.
  - Thì: hệ thống lọc theo từ khóa khớp tương đối (LIKE, case-insensitive) trên **Số phiếu xuất / Phiếu dịch vụ / Diễn giải**. Match kiểu OR giữa 3 field (phiếu match nếu 1 trong 3 field chứa từ khóa). Debounce ≥ 300ms trước khi fire query. Search + filter combine **AND**.

- [ ] **AC-4**: Bộ lọc — 5 filter inline (theo Figma node `14146-87561`)
  - Tại: thanh filter cùng dòng với ô tìm kiếm.
  - Khi: chủ garage chọn giá trị filter.
  - Thì: hệ thống lọc danh sách theo tiêu chí, combine với search theo **AND**. Spec từng filter:

    | # | Filter | Widget | Enum / Nguồn | Default | Chọn |
    |---|---|---|---|---|---|
    | 1 | **Loại phiếu** | Dropdown | Tất cả / Xuất bán (`DELIVERY_SALE`) / Xuất trả hàng mua (`DELIVERY_PURCHASE_RETURN`) / Xuất sửa chữa (`DELIVERY_REPAIR`) / Xuất khác (`DELIVERY_OTHER`) — enum lock BR-IDV2-010 | Tất cả | single |
    | 2 | **Đối tượng** | Autocomplete + search | **DISTINCT `(object_type, object_id)`** từ **bảng phiếu xuất kho** của garage — chỉ list Đối tượng đã xuất hiện trong phiếu (không lấy full 3 danh mục NCC/KH/NV). **Dedup theo MÃ** (`object_id`), KHÔNG theo tên (tránh gộp nhầm 2 đối tượng cùng tên). Hiển thị tên = tên **hiện thời** từ danh mục master (không snapshot phiếu), suffix: `{name} ({NCC\|KH\|NV} · {code})`. Cascade với filter "Loại phiếu": khi Loại phiếu active → distinct chỉ trong scope loại đó (VD Xuất bán → chỉ KH; Xuất trả hàng mua → chỉ NCC; Xuất sửa chữa → chỉ NV). Sort dropdown theo tên alphabet. | (trống) | single |
    | 3 | **Người phụ trách** | Autocomplete + search | **DISTINCT `staff_id`** từ **bảng phiếu xuất kho** của garage — chỉ list nhân sự đã từng làm Người phụ trách trên phiếu (không lấy full danh mục nhân sự). **Dedup theo mã `staff_id`**. Hiển thị **tên hiện thời** từ danh mục nhân sự master (nhân sự đã ngừng vẫn hiện tên — cover phiếu cũ). Sort dropdown theo tên alphabet. Lý do: chỉ show Người phụ trách đã có phiếu → chọn = có kết quả; cover cả nhân sự đã nghỉ (đã từng tạo phiếu). Single-boundary. | (trống) | single |
    | 4 | **Trạng thái** | Dropdown | Tất cả / Nháp / Ghi sổ kho | Tất cả | single |
    | 5 | **Ngày xuất** | Date range | Từ – Đến | Trống (all-time) | — |

  - Nút **"Reset tất cả filter"** (thanh phụ, xuất hiện khi có ≥1 filter active) → xoá search + 5 filter về default.

### Nhóm C — Phân trang & thao tác

- [ ] **AC-5**: Phân trang
  - Tại: cuối bảng.
  - Thì: hệ thống hiển thị bộ chọn số dòng mỗi trang (mặc định **20**) + điều hướng trang.

- [ ] **AC-6**: Thao tác theo dòng (ẩn/hiện theo trạng thái + kỳ)
  - Tại: cột **"Thao tác"**.
  - **Web** — Khi: phiếu **"Nháp"** / **"Ghi sổ kho"** và kỳ kế toán **chưa khóa**.
  - Thì: hệ thống hiển thị icon **Sửa** (→ `FEAT-ID-EDIT-V2`) và **Xóa** (→ `FEAT-ID-DELETE`); **thao tác Ghi sổ / Bỏ ghi sổ thực hiện trong màn chi tiết** (không có icon inline trên web).
  - **Mobile** (mobile-only pattern, khác web) — Khi: phiếu **"Nháp"** và kỳ kế toán **chưa khóa**.
  - Thì: hệ thống hiển thị **icon "Ghi sổ kho" inline per-row**; tap → **flow đối soát SO** giống hệt `FEAT-ID-DETAIL-V2` **AC-5** (narrow V1 semantic per BR-IDV2-009):
    1. Popup xác nhận Ghi sổ chung verbatim `"Bạn có chắc chắn muốn thực hiện Ghi sổ kho phiếu này hay không?"` + button **[Đóng]** + **[Xác nhận]**.
    2. User **[Xác nhận]** → BE call `gf-sales` đối soát (chỉ khi phiếu có SO; không SO → skip).
    3. **Case lệch** (`ERR-INV-039`) → popup cảnh báo verbatim (BR-IDV2-009 canonical, title + list dòng lệch) + **[Đóng]** + **[Vẫn Ghi sổ]**. **[Đóng]** → hủy Ghi sổ. **[Vẫn Ghi sổ]** → commit.
    4. **Case DEGRADED** (`ERR-CMN-007-DEGRADED`) → popup DEGRADED verbatim + **[Đóng]** + **[Vẫn Ghi sổ]**.
    5. **Commit** → gọi mutation `postDeliveryV2` (guard `ERR-INV-011`/`036`/`024` — BR-IDV2-028/004/007) → badge dòng chuyển "Ghi sổ kho" + icon inline lật thành "Bỏ ghi sổ kho" + sổ tồn trừ đúng SL quy đổi.
  - **Không có icon Sửa/Xóa/In trên mobile** (5 op web-only: Sửa/Xóa/In/Tạo/Xuất excel).
  - **Mobile** — Khi: phiếu **"Ghi sổ kho"** và kỳ kế toán **chưa khóa**.
  - Thì: hệ thống hiển thị **icon "Bỏ ghi sổ kho" inline per-row**; tap → popup xác nhận verbatim `"Bạn có chắc chắn muốn thực hiện Bỏ ghi sổ kho phiếu này hay không?"` (share với FEAT-ID-DETAIL-V2 AC-6) → xác nhận → mutation `unpostDeliveryV2` → badge về "Nháp" + icon lật lại + sổ tồn cộng lại.
  - Khi: phiếu thuộc **kỳ đã khóa**.
  - Thì: hệ thống **ẩn** icon Sửa / Xóa **(web)** + **ẩn cả 2 icon Ghi sổ / Bỏ ghi sổ (mobile)**.
  - Khi: bất kỳ trạng thái.
  - Thì: nhấn **Số phiếu** → chi tiết (`FEAT-ID-DETAIL-V2`); nút **"Xuất excel"** luôn khả dụng (BR-IDV2-024) **(web-only)**; **In phiếu** dùng icon per-row trong cột Thao tác **(web-only)**.

- [ ] **AC-7**: Thanh công cụ
  - Tại: thanh công cụ trên cùng.
  - Thì: **"Tạo mới phiếu xuất"** → `FEAT-ID-CREATE-V2`; **"Xuất excel"** → `FEAT-ID-EXPORT`. **In phiếu**: icon per-row cột Thao tác → mở PDF phiếu tương ứng (`FEAT-ID-PRINT`).

### Nhóm D — Phân quyền & tenant

- [ ] **AC-8**: Phân quyền và phạm vi garage
  - Tại: danh sách.
  - Thì: chủ garage + kế toán quyền ngang nhau; chỉ hiển thị phiếu thuộc garage hiện tại.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87561&t=W7XJPVvhmdBPtv2c-4 |
| Figma | mobile | https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21629-28662&t=30dKkXMi0PSOdK7b-4 |

- Luồng: [UX-FLOW-INVENTORY-DELIVERY-V2](../ux/UX-FLOW-INVENTORY-DELIVERY-V2.md) §3, §4.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Lấy danh sách phiếu + filter: Query `[PROPOSED] ListDeliveriesV2`.

## 5. Business Rules

- **BR-IDV2-010**: 2 trường phân loại Nguồn xuất / Loại phiếu.
- **BR-IDV2-021**: Tenant isolation + tìm kiếm LIKE (Số phiếu xuất / Phiếu dịch vụ / **Diễn giải** — v26) + 5 bộ lọc (Loại phiếu / Đối tượng / Người phụ trách / Trạng thái / Ngày xuất) + cột Tiền vốn.
- **BR-IDV2-024**: Ẩn/hiện icon thao tác theo trạng thái + kỳ; In/Xuất excel luôn khả dụng.

## 6. Edge Cases

- **EC-1**: Garage chưa có phiếu nào — trạng thái rỗng.
- **EC-2**: Tiền vốn = 0 với phiếu thuộc kỳ chưa chạy BQGQ.

## 7. Out of Scope

- Tạo → `FEAT-ID-CREATE-V2`. Chi tiết → `FEAT-ID-DETAIL-V2`. Sửa → `FEAT-ID-EDIT-V2`. Xóa → `FEAT-ID-DELETE`. In → `FEAT-ID-PRINT`. Xuất excel → `FEAT-ID-EXPORT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-ID-LIST-V2 (V2 của FEAT-ID-LIST) — danh sách phiếu xuất: search (số phiếu/phiếu dịch vụ/người tạo), 4 filter, cột Nguồn xuất + Loại phiếu + Giá vốn, ẩn/hiện icon theo trạng thái + kỳ, nút Tạo mới/In/Xuất excel. |
| 2026-06-15 | 2 | Business Authority | Đổi nhãn cột **"Giá vốn" → "Tiền vốn"** ở AC-2 + §5 + EC-2 — đồng bộ "Tiền vốn". |
| 2026-06-26 | 3 | Business Authority | **Gắn Figma web + mobile vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14146-87561`, mobile node `21629-28662`. |
| 2026-07-13 | 4 | Business Authority (BA in-session review W05 chuẩn bị) | **Rà filter spec + thêm Người phụ trách + apply pattern song song FEAT-IR-LIST-V2 v6** (W05 planning prep — pre-DEV). (1) **AC-3** bỏ "Người tạo" khỏi search LIKE (chỉ còn Số phiếu xuất / Phiếu dịch vụ) — Người tạo tách sang thuộc thông tin audit, không dùng search nhanh; thêm debounce ≥ 300ms + combine AND. (2) **AC-4** rewrite từ list 4 tên → **spec table 5 filter** đầy đủ (widget / enum / default / single-select) — thêm filter **"Người phụ trách"** (dropdown nhân sự garage); Loại phiếu thêm mã backend `DELIVERY_*` inline (lock BR-IDV2-010); **Đối tượng dropdown = DISTINCT `(object_type, object_id)` từ bảng phiếu xuất** (không lấy full 3 danh mục NCC/KH/NV) — dedup **theo mã** (`object_id`), không theo tên; hiển thị tên hiện thời từ danh mục master + suffix loại + mã; cascade với Loại phiếu (Xuất bán → KH; Xuất trả hàng mua → NCC; Xuất sửa chữa → NV); thêm nút "Reset tất cả filter". KHÔNG thêm filter Kho (BA quyết). **KHÔNG thêm filter Nguồn xuất** (giữ nguyên baseline — Nguồn xuất kế thừa V1 không xuất hiện làm filter trong V2 doc). (3) **AC-1** đếm bộ lọc 4→5. (4) **AC-2** thêm sort mặc định **Ngày xuất DESC** (tie-break Số phiếu DESC). (5) **§5** cập nhật ref BR-IDV2-021 theo scope mới. Cascade BR-IDV2-021 v23 → v24. |
| 2026-07-13 | 5 | Business Authority (BA in-session review W05 chuẩn bị) | **AC-4 row Người phụ trách đổi nguồn sang DISTINCT từ bảng phiếu** (Option B — apply cùng pattern Đối tượng, đồng nhất với FEAT-IR-LIST-V2 v7). Trước: "Dropdown \| Danh sách nhân sự garage \| Tất cả". Sau: "Autocomplete + search \| DISTINCT `staff_id` từ bảng phiếu xuất kho của garage (không lấy full danh mục nhân sự) — dedup theo mã `staff_id`; hiển thị tên hiện thời từ danh mục master (nhân sự đã ngừng vẫn hiện tên — cover phiếu cũ); sort alphabet". Lý do: chỉ show Người phụ trách đã có phiếu → chọn = có kết quả; cover cả nhân sự đã nghỉ (từng tạo phiếu) — analog với Đối tượng filter. Cascade BR-IDV2-021 v24 → v25. |
| 2026-07-14 | 6 | Business Authority | **AC-3 thêm "Diễn giải" vào search LIKE** (BA chốt in-session, đối xứng FEAT-IR-LIST-V2 v8). Placeholder: "Tìm Số phiếu xuất, Phiếu dịch vụ" → "Tìm Số phiếu xuất, Phiếu dịch vụ, **Diễn giải**". LIKE case-insensitive trên **3 field**: Số phiếu xuất / Phiếu dịch vụ / Diễn giải — match kiểu **OR** (phiếu match nếu 1 trong 3 field chứa từ khóa). Lý do BA: user thường ghi context nghiệp vụ trong Diễn giải (VD "Xuất sửa xe cho KH-045 lô hàng 07/2026") — cần tìm được phiếu qua context này. Debounce 300ms + combine AND với filter giữ nguyên. Cascade BR-IDV2-021 v25 → v26. |
| 2026-07-14 | 7 | Business Authority | **Sync doc ↔ Figma cross-check W05 SYS-8 P1** (đối xứng FEAT-IR-LIST-V2 v9): (a) AC-1 + AC-7 xóa nút toolbar **"In"**. AC-6 giữ icon per-row. (b) Nhãn nút "Tạo mới PX" → **"Tạo mới phiếu xuất"**. |
| 2026-07-16 | 8 | Business Authority | **AC-6 cascade từ AC-5 rewrite popup logic** (BR-IDV2-009 v40 rewrite + FEAT-ID-DETAIL-V2 v13 AC-5 5-bước flow). AC-6 mobile inline Ghi sổ per-row entry point (c) share cùng flow đối soát SO với DETAIL AC-5: (1) popup xác nhận Ghi sổ chung; (2) BE call `gf-sales` đối soát; (3) Case lệch (`ERR-INV-039`) popup cảnh báo verbatim + `[Đóng]`+`[Vẫn Ghi sổ]`; (4) Case DEGRADED (`ERR-CMN-007-DEGRADED`) popup verbatim + `[Đóng]`+`[Vẫn Ghi sổ]`; (5) commit. **Web List row-action UNCHANGED** (chỉ Sửa/Xóa/In, không có Post/Unpost — narrow V1). Fix version drift do session refactor (BR-IDV2-009 v40 kéo cascade AC-6 mobile mở rộng nhưng chưa bump version 3-in-1). |
