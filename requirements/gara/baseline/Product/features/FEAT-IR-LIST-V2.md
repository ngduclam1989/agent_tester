---
type: feature
artifact_kind: feature
status: PLANNED
version: 14
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-RECEIPT-V2"
boundary: "gf-inventory"
last_reviewed: "2026-07-17"  # v14 (sonhoang 2026-07-17) — rewrite AC-11 semantic từ "delete/unpost blocker" → "post-mismatch warning" (BA clarify: popup fire khi tap Ghi sổ + kỳ mở + call getInheritedReceiptFromSaleDelivery detect SL mismatch; Xác nhận = force-through mutation postReceiptV2 · Huỷ = cancel). Slug rename delete-blocker-popup → post-mismatch-warning-popup. Extend AC-8 mobile inline Post/Unpost với 2-API guard chain (checkAccountingPeriodLock + getInheritedReceiptFromSaleDelivery). BR-IRV2-031 semantic revised. v13 → v14.
supersedes: "FEAT-IR-LIST"
---

# FEAT-IR-LIST-V2: Danh sách phiếu nhập kho (V2)

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-IR-LIST-V2` |
| Title | Danh sách phiếu nhập kho (V2) |
| Parent Epic | `EP-INVENTORY-RECEIPT-V2` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |
| Depends on | `EP-INVENTORY-ACCOUNTING-PERIOD` (ẩn/hiện nút theo kỳ khóa), `EP-INVENTORY-CATALOG` (Loại phiếu / Đối tượng) |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách phiếu nhập kho với tìm kiếm, nhiều bộ lọc và tổng hợp giá trị, **so that** tôi theo dõi luồng nhập, trạng thái ghi sổ và truy cập thao tác (tạo/in/xuất excel).

## 2. Acceptance Criteria

### Nhóm A — Hiển thị danh sách

- [ ] **AC-1**: Mở màn danh sách
  - Tại: tab **"Phiếu nhập kho"**.
  - Khi: chủ garage truy cập.
  - Thì: hệ thống hiển thị màn **"Danh sách phiếu nhập kho"** với mô tả **"Theo dõi phiếu nhập kho trong garage hiện tại, không filter Garage."**, ô tìm kiếm + 6 bộ lọc, bảng danh sách, dòng Tổng, phân trang, và các nút **"Xuất excel"**, **"Tạo mới phiếu nhập"** (In per-row trong cột Thao tác — không có toolbar "In" bulk, xem AC-8).

- [ ] **AC-2**: Cột hiển thị
  - Tại: bảng danh sách.
  - Khi: bảng được render.
  - Thì: hệ thống hiển thị: **"STT"**, **"Ngày nhập"**, **"Nguồn nhập"**, **"Số phiếu"**, **"Đơn hàng mua"**, **"Diễn giải"**, **"Thành tiền"**, **"Đối tượng"**, **"Người phụ trách"**, **"Loại phiếu"**, **"Phụ tùng nhập"** (link "Xem sản phẩm"), **"Trạng thái"**, **"Thao tác"**. Sắp xếp mặc định: **Ngày nhập mới nhất lên đầu** (DESC), tie-break bởi Số phiếu DESC.

- [ ] **AC-3**: Dòng tổng
  - Tại: cuối bảng.
  - Thì: hệ thống hiển thị dòng **"Tổng"** = tổng **"Thành tiền"** các phiếu theo bộ lọc hiện tại.

- [ ] **AC-4**: Hiển thị trạng thái
  - Tại: cột **"Trạng thái"**.
  - Thì: phiếu **"Ghi sổ kho"** hiển thị badge xanh; phiếu **"Nháp"** hiển thị badge cam.

### Nhóm B — Tìm kiếm & lọc

- [ ] **AC-5**: Tìm kiếm
  - Tại: ô tìm kiếm, placeholder **"Tìm Số phiếu nhập, Số đơn hàng, Diễn giải"**.
  - Khi: chủ garage nhập từ khóa.
  - Thì: hệ thống lọc theo từ khóa khớp tương đối (LIKE, case-insensitive) trên **Số phiếu / Số đơn hàng / Diễn giải**. Match kiểu OR giữa 3 field (phiếu match nếu 1 trong 3 field chứa từ khóa). Debounce ≥ 300ms trước khi fire query. Search + filter combine **AND**.

- [ ] **AC-6**: Bộ lọc — 6 filter inline (theo Figma node `14146-87559`)
  - Tại: thanh filter cùng dòng với ô tìm kiếm.
  - Khi: chủ garage chọn giá trị filter.
  - Thì: hệ thống lọc danh sách theo tiêu chí, combine với search theo **AND**. Spec từng filter:

    | # | Filter | Widget | Enum / Nguồn | Default | Chọn |
    |---|---|---|---|---|---|
    | 1 | **Nguồn nhập** | Dropdown | Tất cả / Mua ngoài / Nền tảng | Tất cả | single |
    | 2 | **Loại phiếu** | Dropdown | Tất cả / Nhập mua (`RECEIPT_PURCHASE`) / Nhập hàng bán bị trả lại (`RECEIPT_SALE_RETURN`) / Nhập khác (`RECEIPT_OTHER`) — enum lock BR-IRV2-009 | Tất cả | single |
    | 3 | **Đối tượng** | Autocomplete + search | **DISTINCT `(object_type, object_id)`** từ **bảng phiếu nhập kho** của garage — chỉ list Đối tượng đã xuất hiện trong phiếu (không lấy full 3 danh mục NCC/KH/NV). **Dedup theo MÃ** (`object_id`), KHÔNG theo tên (tránh gộp nhầm 2 đối tượng cùng tên). Hiển thị tên = tên **hiện thời** từ danh mục master (không snapshot phiếu), suffix: `{name} ({NCC\|KH\|NV} · {code})`. Cascade với filter "Loại phiếu": khi Loại phiếu active → distinct chỉ trong scope loại đó (VD Nhập mua → chỉ NCC). Sort dropdown theo tên alphabet. | (trống) | single |
    | 4 | **Người phụ trách** | Autocomplete + search | **DISTINCT `staff_id`** từ **bảng phiếu nhập kho** của garage — chỉ list nhân sự đã từng làm Người phụ trách trên phiếu (không lấy full danh mục nhân sự). **Dedup theo mã `staff_id`**. Hiển thị **tên hiện thời** từ danh mục nhân sự master (nhân sự đã ngừng vẫn hiện tên — cover phiếu cũ). Sort dropdown theo tên alphabet. Lý do: chỉ show Người phụ trách đã có phiếu → chọn = có kết quả; cover cả nhân sự đã nghỉ (đã từng tạo phiếu). Single-boundary. | (trống) | single |
    | 5 | **Trạng thái** | Dropdown | Tất cả / Nháp / Ghi sổ kho | Tất cả | single |
    | 6 | **Ngày nhập** | Date range | Từ – Đến | Trống (all-time) | — |

  - **Cascade behavior — Loại phiếu → Đối tượng**: khi user đổi Loại phiếu (VD Nhập mua → Nhập khác) mà Đối tượng đã chọn trước đó **không nằm trong scope Loại phiếu mới** (VD Đối tượng đã chọn = NCC nhưng Loại phiếu mới = Nhập khác đòi Loại đối tượng KH) → hệ thống **auto clear Đối tượng về (trống)** + hiển thị toast trên góc phải màn hình: *"Đã xóa bộ lọc Đối tượng do không khớp Loại phiếu mới."* (2 giây, không disruptive). Trường hợp Đối tượng cũ vẫn nằm trong scope Loại phiếu mới → giữ nguyên selection. Lý do UX: tránh state bối rối "filter active nhưng không có kết quả" (RGR RR-018 decision 2026-07-16 user sonhoang).
  - Nút **"Reset tất cả filter"** (thanh phụ, xuất hiện khi có ≥1 filter active) → xoá search + 6 filter về default.

### Nhóm C — Phân trang & thao tác

- [ ] **AC-7**: Phân trang
  - Tại: cuối bảng.
  - Thì: hệ thống hiển thị bộ chọn số dòng mỗi trang (mặc định **20**) và điều hướng trang.

- [ ] **AC-8**: Thao tác theo dòng (ẩn/hiện theo trạng thái + kỳ)
  - Tại: cột **"Thao tác"**.
  - **Web** — Khi: phiếu **"Nháp"** hoặc **"Ghi sổ kho"** và kỳ kế toán **chưa khóa**.
  - Thì: hệ thống hiển thị icon **Sửa** (→ `FEAT-IR-EDIT-V2`) và **Xóa** (→ `FEAT-IR-DELETE`); **thao tác Ghi sổ / Bỏ ghi sổ thực hiện trong màn chi tiết** (không có icon inline trên web).
  - **Mobile** (mobile-only pattern, khác web — v14 revise flow) — Khi: phiếu **"Nháp"**.
  - Thì: hệ thống hiển thị **icon "Ghi sổ kho" inline per-row** (LUÔN hiển thị, không proactive-hide theo kỳ — v14 revert từ v10 hide-on-locked pattern). Tap thực hiện **guard chain**:
    1. Call **`checkAccountingPeriodLock(date: entryDate)`**. Response `locked=true` → common toast "Kỳ kế toán đã khóa, không thể thực hiện" (2s, snackbar) + STOP.
    2. Response `locked=false` → hiển thị popup xác nhận verbatim `"Bạn có chắc chắn muốn thực hiện Ghi sổ kho phiếu này hay không?"` + 2 nút `[Huỷ | Xác nhận]` (share với `FEAT-IR-DETAIL-V2` AC-5). Huỷ → giữ Nháp. Xác nhận → bước 3.
    3. Call **`getInheritedReceiptFromSaleDelivery(receiptId)`**. Response `mismatch=true` → hiển thị popup mismatch warning `22260:24548` (xem AC-11 v14). User trong popup mismatch: [Huỷ]=giữ Nháp · [Xác nhận]=force-through, tiếp bước 4. Response `mismatch=false` → bước 4 trực tiếp.
    4. Gọi mutation **`postReceiptV2(id, idempotencyKey)`** → thành công: badge dòng "Ghi sổ kho" + icon lật thành "Bỏ ghi sổ kho" + sổ tồn cộng đúng SL quy đổi.
  - **Mobile** — Khi: phiếu **"Ghi sổ kho"**.
  - Thì: hệ thống hiển thị **icon "Bỏ ghi sổ kho" inline per-row** (LUÔN hiển thị, không proactive-hide theo kỳ — v14). Tap thực hiện **guard chain (simpler than post — KHÔNG check mismatch)**:
    1. Call **`checkAccountingPeriodLock(date: entryDate)`**. Response `locked=true` → common toast "Kỳ kế toán đã khóa..." + STOP.
    2. Response `locked=false` → popup xác nhận verbatim `"Bạn có chắc chắn muốn thực hiện Bỏ ghi sổ kho phiếu này hay không?"` + 2 nút `[Huỷ | Xác nhận]` (share với `FEAT-IR-DETAIL-V2` AC-6). Huỷ → giữ Ghi sổ. Xác nhận → mutation **`unpostReceiptV2(id, idempotencyKey)`** → badge về "Nháp" + icon lật lại + sổ tồn đảo.
  - **Không có icon Sửa/Xóa/In trên mobile** (5 op web-only: Sửa/Xóa/In/Tạo/Xuất excel — carve-out unchanged).
  - Khi: **kỳ đã khóa (Web)** — hệ thống **ẩn** icon Sửa / Xóa **(web)**; Mobile giữ icon Ghi sổ/Bỏ ghi sổ hiện thị (xử lý reactive qua toast per guard chain trên).
  - Khi: bất kỳ trạng thái nào.
  - Thì: nhấn **Số phiếu** → mở chi tiết (`FEAT-IR-DETAIL-V2`); nút **"Xuất excel"** luôn khả dụng (BR-IRV2-024) **(web-only)**; **In phiếu** dùng icon per-row trong cột Thao tác **(web-only, không có toolbar bulk In)**.

- [ ] **AC-9**: Thanh công cụ
  - Tại: thanh công cụ trên cùng.
  - Thì: **"Tạo mới phiếu nhập"** → form tạo (`FEAT-IR-CREATE-V2`); **"Xuất excel"** → xuất danh sách (`FEAT-IR-EXPORT`). **In phiếu**: icon per-row cột Thao tác → mở PDF phiếu tương ứng (`FEAT-IR-PRINT`) — không có toolbar bulk In.

### Nhóm D — Phân quyền & tenant

- [ ] **AC-10**: Phân quyền và phạm vi garage
  - Tại: danh sách.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò xem và thao tác với quyền ngang nhau; danh sách chỉ hiển thị phiếu thuộc garage hiện tại.

### Nhóm E — Popup mismatch warning (mobile-only, v14 revise)

- [ ] **AC-11**: Popup "Không thể xoá" — cảnh báo mismatch khi Ghi sổ kho (mobile-only, force-through pattern)
  - Tại: mobile — flow **Ghi sổ kho** trên màn Danh sách (icon per-row AC-8 mobile-only) — mã Figma popup: `22260:24548` (xem §3).
  - Khi: user tap icon "Ghi sổ kho" trên card row → hệ thống chạy **guard chain 2 bước** theo thứ tự (xem AC-8 v14 flow chi tiết):
    1. **`checkAccountingPeriodLock(date: entryDate)`** — nếu `locked=true` → common toast "Kỳ đã khóa..." + STOP (không mở popup này).
    2. **`getInheritedReceiptFromSaleDelivery(receiptId)`** — sau khi user đã confirm popup "Chắc chắn Ghi sổ kho" (AC-8 flow) và trước khi gọi `postReceiptV2`. Response detect **phụ tùng nhập đã được xuất kho (`phiếu xuất kho`) phục vụ phiếu dịch vụ (SO)** nhưng SL giữa 2 phiếu chưa trùng khớp → **hiển thị popup này**.
  - Thì: popup overlay 375×812 (barrier + Popover content), chứa:
    - **Tiêu đề nội dung verbatim** (giữ nguyên placeholder mã phiếu): *"Số lượng phụ tùng trong phiếu xuất kho và phiếu dịch vụ `#mã_phiếu` chưa trùng khớp. Vui lòng cập nhật chính xác số lượng phụ tùng."*
    - **Danh sách phụ tùng lệch** (dòng lặp lại per item từ response `getInheritedReceiptFromSaleDelivery`), format verbatim: *"Phụ tùng `{tên}` thừa `{n}` cái chưa khớp phiếu xuất kho"* — scroll trong overlay nếu vượt chiều cao (không cap top-N).
    - **Action bar 2 nút** (Figma partial `_Partials/Action bar 2-button`): **[Huỷ]** (secondary) + **[Xác nhận]** (primary). Semantic **force-through** (chốt v14):
      - **[Huỷ]** → dismiss popup, **cancel Ghi sổ kho**, phiếu giữ trạng thái **Nháp** (không gọi mutation).
      - **[Xác nhận]** → dismiss popup, **chạy tiếp mutation `postReceiptV2`** bình thường (force-through — accept SL mismatch, tồn cộng theo SL phiếu nhập, downstream SO reconciliation vẫn lệch cho tới khi user chỉnh phiếu Xuất/SO manual). Không cần flag `force: true` mới trên BFF — mutation hiện tại tự xử lý; popup chỉ là UX warning layer trước khi commit.
  - Ghi chú spec:
    - Icon overlay `vuesax/bold/clipboard-close` được ẩn ở variant này (hidden per Figma), không render.
    - Popup chỉ áp cho flow **Ghi sổ kho** (post). Flow **Bỏ ghi sổ** (unpost) KHÔNG check `getInheritedReceiptFromSaleDelivery` → không hiển thị popup này. Flow **Xoá phiếu** hiện KHÔNG có trên mobile (5 op web-only) → không áp popup.
    - `getInheritedReceiptFromSaleDelivery` là op **NEW** (v14) — chưa ratified trong BFF/BE SDL W05 hiện tại. Response cần tối thiểu `{ mismatch: Boolean!, items: [{name: String!, excessQty: Int!}]! }` — cascade Architecture Authority ratify contract + owner (BE `gf-inventory` hay BFF `agg-garage-graph` aggregate?) trước /dev-start.
  - Web: **không áp dụng** — web List có Xoá per-row (`FEAT-IR-DELETE`) không cần popup này; nếu web cũng cần warning mismatch khi Ghi sổ → separate CR cho web tier.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87559&t=W7XJPVvhmdBPtv2c-4 |
| Figma | mobile | https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21629-24081&t=30dKkXMi0PSOdK7b-4 |
| Figma | mobile | https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=22260-24548&t=30dKkXMi0PSOdK7b-4 |

> **Split-mode registry** (`Product/ux/figma/figma-links.yaml` waves.05.FEAT-IR-LIST-V2.mobile.screens`): 2 entry — slug `main` (`21629:24081`) là màn Danh sách chính; slug `post-mismatch-warning-popup` (`22260:24548`) là popup cảnh báo SL mismatch khi Ghi sổ kho (v14 revise semantic từ "delete-blocker" — xem AC-11). Prefetch sinh 2 spec file: `wave05-ir-list-v2--main.md` + `wave05-ir-list-v2--post-mismatch-warning-popup.md`.

- Luồng: [UX-FLOW-INVENTORY-RECEIPT-V2](../ux/UX-FLOW-INVENTORY-RECEIPT-V2.md) §3.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Lấy danh sách phiếu + filter: Query `[PROPOSED] ListReceiptsV2`.

## 5. Business Rules

- **BR-IRV2-009**: 2 trường phân loại Nguồn nhập / Loại phiếu.
- **BR-IRV2-021**: Tenant isolation + tìm kiếm LIKE (Số phiếu / Số đơn hàng / **Diễn giải** — v29) + 6 bộ lọc (Nguồn nhập / Loại phiếu / Đối tượng / Người phụ trách / Trạng thái / Ngày nhập) + dòng Tổng.
- **BR-IRV2-002**: Trạng thái Nháp / Ghi sổ kho.
- **BR-IRV2-024**: Ẩn/hiện icon thao tác theo trạng thái + kỳ; In / Xuất excel luôn khả dụng.
- **BR-IRV2-031** *(v14 revise semantic — post-mismatch warning force-through)*: Guard mobile — flow **Ghi sổ kho** trên mobile List (icon inline per-row AC-8) gọi `getInheritedReceiptFromSaleDelivery(receiptId)` sau khi user confirm popup "Chắc chắn Ghi sổ" và trước khi gọi `postReceiptV2` mutation. Nếu response `mismatch=true` (tồn tại phụ tùng nhập đã xuất kho khớp SO nhưng SL chưa cân) → hiển thị popup cảnh báo "Không thể xoá" (Figma `22260:24548`, xem AC-11) liệt kê phụ tùng lệch. User [Xác nhận] = force-through → chạy tiếp mutation; [Huỷ] = cancel, giữ Nháp. Popup KHÔNG áp cho flow Bỏ ghi sổ. **Op `getInheritedReceiptFromSaleDelivery` là NEW** (chưa ratified BFF/BE SDL W05) — cascade Architecture Authority ratify contract owner + response shape `{mismatch: Boolean!, items: [{name: String!, excessQty: Int!}]!}` trước /dev-start.

## 6. Edge Cases

- **EC-1**: Garage chưa có phiếu nào — hiển thị trạng thái rỗng.
- **EC-2**: Dòng Tổng theo bộ lọc hiện tại.
- **EC-3** *(v14 revise)*: Phiếu Nháp có dòng phụ tùng đã xuất kho khớp SO nhưng SL không cân — flow Ghi sổ mobile (List inline) → sau confirm "Chắc chắn Ghi sổ" hiển thị popup AC-11 cảnh báo mismatch. User [Xác nhận] force-through commit mutation `postReceiptV2` (chấp nhận sổ tồn downstream tiếp tục lệch cho tới khi user chỉnh phiếu Xuất/SO manual); [Huỷ] giữ Nháp.

## 7. Out of Scope

- Tạo phiếu → `FEAT-IR-CREATE-V2`. Chi tiết → `FEAT-IR-DETAIL-V2`. Sửa → `FEAT-IR-EDIT-V2`. Xóa → `FEAT-IR-DELETE`. In → `FEAT-IR-PRINT`. Xuất excel → `FEAT-IR-EXPORT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-IR-LIST-V2 (V2 của FEAT-IR-LIST) — danh sách phiếu nhập: search (số phiếu/đơn hàng/người tạo), 5 filter, cột Loại phiếu + Nguồn nhập, trạng thái Nháp/Ghi sổ kho, dòng Tổng, nút Tạo mới/In/Xuất excel. |
| 2026-06-10 | 2 | Business Authority | Thêm §0 Δ Thay đổi so với V1 (map 10 AC ↔ V1) + gắn tag [GIỮ]/[ĐỔI]/[MỚI] + con trỏ lineage `← FEAT-IR-LIST AC-n` vào từng AC (để agent truy vết AC V2 phát triển từ AC V1 nào). |
| 2026-06-10 | 3 | Business Authority | Thêm khung **CR** giống mẫu: Metadata (Loại thay đổi CR / Màn hình target FEAT-IR-LIST / Depends on) + section **§0 Bối cảnh thay đổi (Change Request — DEV đọc trước)**; bảng Δ chuyển xuống §0.1. |
| 2026-06-10 | 4 | Business Authority | Gỡ khung mapping V1↔V2 (CR, §0 Bối cảnh, bảng Δ, lineage tags) — spec V2 đứng độc lập; giữ nguyên toàn bộ nội dung nghiệp vụ. |
| 2026-06-26 | 5 | Business Authority | **Gắn Figma web + mobile vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14146-87559`, mobile node `21629-24081`. |
| 2026-07-13 | 6 | Business Authority (BA in-session review W05 chuẩn bị) | **Rà filter spec + thêm Người phụ trách** (W05 planning prep — pre-DEV). (1) **AC-5** bỏ "Người tạo" khỏi search LIKE (chỉ còn Số phiếu / Số đơn hàng) — Người tạo tách sang thuộc thông tin audit, không dùng search nhanh; thêm debounce ≥ 300ms + combine AND. (2) **AC-6** rewrite từ list 5 tên → **spec table 6 filter** đầy đủ (widget / enum / default / single-select) — thêm filter **"Người phụ trách"** (dropdown nhân sự garage); giữ 5 filter cũ (Nguồn nhập / Loại phiếu / Đối tượng / Trạng thái / Ngày nhập); **Đối tượng dropdown = DISTINCT `(object_type, object_id)` từ bảng phiếu nhập** (không lấy full 3 danh mục NCC/KH/NV) — dedup **theo mã** (`object_id`), không theo tên; hiển thị tên hiện thời từ danh mục master + suffix loại + mã; cascade với Loại phiếu (chọn Nhập mua → distinct chỉ NCC); thêm nút "Reset tất cả filter". KHÔNG thêm filter Kho (BA quyết). (3) **AC-1** đếm bộ lọc 5→6. (4) **AC-2** thêm sort mặc định **Ngày nhập DESC** (tie-break Số phiếu DESC). KHÔNG thêm cột "Kho" (BA quyết đồng nhất với quyết định không lọc theo Kho — Kho không xuất hiện ở cả filter lẫn cột danh sách). (5) **§5** cập nhật ref BR-IRV2-021 theo scope mới. Cascade BR-IRV2-021 v26 → v27. |
| 2026-07-13 | 7 | Business Authority (BA in-session review W05 chuẩn bị) | **AC-6 row Người phụ trách đổi nguồn sang DISTINCT từ bảng phiếu** (Option B — apply cùng pattern Đối tượng). Trước: "Dropdown \| Danh sách nhân sự garage \| Tất cả". Sau: "Autocomplete + search \| DISTINCT `staff_id` từ bảng phiếu nhập kho của garage (không lấy full danh mục nhân sự) — dedup theo mã `staff_id`; hiển thị tên hiện thời từ danh mục master (nhân sự đã ngừng vẫn hiện tên — cover phiếu cũ); sort alphabet". Lý do: chỉ show Người phụ trách đã có phiếu → chọn = có kết quả; cover cả nhân sự đã nghỉ (từng tạo phiếu) — analog với Đối tượng filter. Cascade BR-IRV2-021 v27 → v28. |
| 2026-07-14 | 8 | Business Authority | **AC-5 thêm "Diễn giải" vào search LIKE** (BA chốt in-session). Placeholder: "Tìm Số phiếu nhập, Số đơn hàng" → "Tìm Số phiếu nhập, Số đơn hàng, **Diễn giải**". LIKE case-insensitive trên **3 field**: Số phiếu / Số đơn hàng / Diễn giải — match kiểu **OR** (phiếu match nếu 1 trong 3 field chứa từ khóa). Lý do BA: user thường ghi nội dung nghiệp vụ trong Diễn giải (VD "Nhập lô hàng tháng 7 cho SO-123") — cần tìm được phiếu qua context này. Debounce 300ms + combine AND với filter giữ nguyên. Cascade BR-IRV2-021 v28 → v29. |
| 2026-07-14 | 9 | Business Authority | **Sync doc ↔ Figma cross-check W05 SYS-8 P1**: (a) AC-1 + AC-9 xóa nút toolbar **"In"** — Figma không có bulk In toolbar, chỉ có icon In per-row (BA chốt follow Figma). AC-8 giữ icon per-row → PDF. (b) Nhãn nút toolbar "Tạo mới PN" → **"Tạo mới phiếu nhập"** (full form Figma convention). |
| 2026-07-16 | 10 | Business Authority | **AC-8 thêm mobile-only pattern Post/Unpost inline row-action** (cover BR-IRV2-021 v41 mobile clause + PKG-W05 §2.2.4 mobile scope; đối xứng FEAT-ID-LIST-V2 v8 nhưng Receipt KHÔNG có SO reconciliation nên flow đơn giản hơn — chỉ popup xác nhận Ghi sổ chung → mutation `postReceiptV2` → badge lật + sổ tồn cộng). Nháp+kỳ mở → icon "Ghi sổ kho" inline; Ghi sổ+kỳ mở → icon "Bỏ ghi sổ kho" inline; kỳ đóng → ẩn cả 2. **Không có Sửa/Xóa/In trên mobile** (5 op web-only). Web List row-action UNCHANGED (Sửa/Xóa/In only). Fix version drift do session refactor (BR-IRV2-021 v41 kéo cascade AC-8 mobile mở rộng nhưng chưa bump version 3-in-1). |
| 2026-07-16 | 11 | Business Authority (RGR bachho + user sonhoang decision 2026-07-16) | **RGR RR-018 fix — bổ sung cascade behavior Loại phiếu → Đối tượng** khi filter Đối tượng đã chọn không khớp Loại phiếu mới. Trước: AC-6 row 3 chỉ nói "cascade với Loại phiếu: khi Loại phiếu active → distinct chỉ trong scope loại đó" — mơ hồ khi user đổi Loại phiếu mid-session (Đối tượng cũ đang chọn không nằm trong scope mới thì behavior gì?). Sau: bổ sung note dưới bảng 6 filter — **auto clear Đối tượng về (trống)** + hiển thị toast góc phải "Đã xóa bộ lọc Đối tượng do không khớp Loại phiếu mới." 2 giây, không disruptive. Trường hợp Đối tượng cũ vẫn nằm trong scope Loại phiếu mới → giữ nguyên selection. Lý do UX: tránh state bối rối "filter active nhưng không có kết quả". No cascade BR / Architecture / API contract — behavior thuần FE cascade filter. v10 → v11. |
| 2026-07-17 | 12 | Business Authority (user sonhoang directive 2026-07-17) | **Add AC-11 Popup "Không thể xoá" mobile-only + split registry entry** — user chỉ ra 2 node Figma mobile mới (`22260-24548` cho List, `22260-24396` cho Detail) là variant "Popup không thể xoá" liệt kê phụ tùng lệch số lượng giữa phiếu xuất kho + phiếu dịch vụ. LIST-V2 add: AC-11 (nội dung popup verbatim + button đóng đơn + không có nhánh "force delete") · §3 đổi table 3-cột (thêm cột `Screen slug`) + 3 row (web/mobile-main/mobile-delete-blocker-popup) · §5 add BR-IRV2-031 (NEED CONFIRMATION BA — trigger context delete-vs-unpost) · §6 add EC-3. Registry `figma-links.yaml` waves.05.FEAT-IR-LIST-V2.mobile.screens chuyển từ single (slug:null) → split (main + delete-blocker-popup); prefetch sinh 2 spec file. Cascade FEAT-IR-DETAIL-V2 v14→v15 (mirror node 22260-24396) + Execution/wave-specs/W05/Product/features/mobile mirrors. **Chưa cascade BR-IRV2-031 chi tiết + Architecture/API guard** — chờ BA chốt trigger context (delete từ Detail, hay bỏ ghi sổ từ List/Detail). v11 → v12. |
| 2026-07-17 | 13 | Business Authority (post-prefetch verification fix 2026-07-17) | **AC-11 button count drift fix — Figma render 2 nút `[Huỷ \| Xác nhận]` không phải 1 nút "Đóng"** như v12 initial patch. Update AC-11 Action bar description: 2-button `_Partials/Action bar 2-button` + flag semantic NEED CONFIRMATION BA giữa 2 phương án: (a) acknowledge-only (cả 2 button dismiss, phiếu giữ nguyên) vs (b) force-through ([Xác nhận] override guard, cần BFF mutation `force: true` field mới). Discovered qua worker `agent-figma-prefetch-worker` output G-1 khi worker fetch fresh MCP `get_metadata` + `get_design_context` cho node `22260:24548` và phát hiện shared instance `_Partials/Action bar 2-button`. v12 initial patch dựa trên `get_metadata` top-level không expand deep vào Action bar internals → 1-button assumption sai. Cascade FEAT-IR-DETAIL-V2 v15→v16 (mirror fix cho AC-9). Execution spec mirrors cần bump SHA + Change Log. v12 → v13. |
| 2026-07-17 | 14 | Business Authority (BA sonhoang flow clarify 2026-07-17) | **Rewrite AC-8 mobile inline + AC-11 semantic từ "delete-blocker" → "post-mismatch warning" (force-through)** — BA clarify flow: (1) tap Ghi sổ mobile → `checkAccountingPeriodLock` → nếu locked = common toast + stop; nếu open → popup xác nhận "Chắc chắn Ghi sổ?" → confirm → gọi op MỚI `getInheritedReceiptFromSaleDelivery(receiptId)` → nếu response `mismatch=true` → hiển thị popup `22260:24548` liệt kê phụ tùng lệch; user [Xác nhận]=**force-through** chạy tiếp `postReceiptV2`, [Huỷ]=cancel giữ Nháp. (2) tap Bỏ ghi sổ mobile → `checkAccountingPeriodLock` → toast/confirm identical Flow 1 bước 1-2 nhưng **KHÔNG** check mismatch (unpost không gọi `getInheritedReceiptFromSaleDelivery`) → confirm → `unpostReceiptV2`. (3) Nút Ghi sổ/Bỏ ghi sổ mobile **LUÔN HIỂN THỊ** trên List (revert v10 hide-on-locked pattern) — reactive-only guard qua toast/popup sau tap. Cascade: FEAT-IR-DETAIL-V2 v16→v17 (mirror AC-4 revert proactive-hide + AC-5 add mismatch check + AC-9 semantic revise); slug rename registry + spec `delete-blocker-popup → post-mismatch-warning-popup`; BR-IRV2-031 semantic revised; Op `getInheritedReceiptFromSaleDelivery` **NEW** — chưa ratified BFF/BE SDL — cascade Architecture Authority. v13 → v14. |
