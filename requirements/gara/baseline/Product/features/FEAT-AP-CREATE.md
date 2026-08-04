---
type: feature
artifact_kind: feature
status: PLANNED
version: 6
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
boundary: "gf-accounting"
last_reviewed: "2026-07-08"
---

# FEAT-AP-CREATE: Tạo kỳ kế toán

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-AP-CREATE` |
| Title | Tạo kỳ kế toán |
| Parent Epic | `EP-INVENTORY-ACCOUNTING-PERIOD` |
| Boundary | `gf-accounting` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo kỳ kế toán mới theo loại năm/quý/tháng (kèm tùy chọn tự động sinh kỳ con), **so that** tôi thiết lập được khung kỳ để kiểm soát đóng/mở và chốt sổ kho.

## 2. Acceptance Criteria

### Nhóm A — Mở form & chọn loại kỳ

- [ ] **AC-1**: Mở form thêm kỳ
  - Tại: danh sách kỳ kế toán, nút **"Thêm kỳ kế toán"**.
  - Khi: chủ garage nhấn nút.
  - Thì: hệ thống mở form **"Thêm kỳ kế toán"** với mô tả **"Form danh mục theo 3 loại kỳ: năm, quý, tháng. Field 'Thuộc kỳ' xuất hiện với kỳ quý/tháng."**, mục **"Thông tin chung"**, nút **"Huỷ bỏ"** và **"Tạo"**.

- [ ] **AC-2**: Chọn loại kỳ
  - Tại: nhóm radio loại kỳ.
  - Khi: chủ garage chọn.
  - Thì: hệ thống cho chọn 1 trong 3: **"Kỳ kế toán năm"**, **"Kỳ kế toán quý"**, **"Kỳ kế toán tháng"**; form thay đổi field theo loại đã chọn (xem AC-4, AC-5).

### Nhóm B — Trường thông tin

- [ ] **AC-3**: Nhập tên kỳ kế toán
  - Tại: trường **"Tên kỳ kế toán"** (bắt buộc, có `*`).
  - Khi: chủ garage nhập.
  - Thì: hệ thống nhận giá trị. Bỏ trống và Lưu → báo lỗi **"Tên kỳ kế toán là bắt buộc"**.

- [ ] **AC-4**: Field đặc thù theo loại kỳ
  - Tại: form thêm kỳ.
  - Khi: chọn loại kỳ.
  - Thì:
    - **Kỳ năm**: hiển thị field **"Năm"** (bắt buộc) — **dropdown single-select** liệt kê **`[currentYear, currentYear + 49]`** = **50 giá trị** sort ascending (VD hiện tại 2026 → dropdown `2026..2075`), **default selected = năm hiện tại** khi mở form; KHÔNG cho chọn năm quá khứ (BR-AP-003a). **Không có** "Thuộc kỳ".
    - **Kỳ quý**: hiển thị **"Thuộc kỳ"** (bắt buộc, chọn kỳ năm).
    - **Kỳ tháng**: hiển thị **"Thuộc kỳ"** (bắt buộc, chọn kỳ quý).

- [ ] **AC-5**: Dropdown "Thuộc kỳ" lọc kỳ cha hợp lệ
  - Tại: trường **"Thuộc kỳ"** (kỳ quý/tháng).
  - Khi: chủ garage mở dropdown.
  - Thì: hệ thống chỉ hiển thị kỳ cha hợp lệ — kỳ quý chọn trong các kỳ năm; kỳ tháng chọn trong các kỳ quý (theo năm tương ứng).

- [ ] **AC-6**: Nhập ngày bắt đầu / kết thúc
  - Tại: trường **"Ngày bắt đầu"**, **"Ngày kết thúc"** (bắt buộc, dd/mm/yyyy).
  - Khi: chủ garage nhập.
  - Thì: hệ thống nhận giá trị; validate theo AC-9.

- [ ] **AC-7**: Thứ tự hiển thị & Mô tả & Trạng thái
  - Tại: các trường còn lại.
  - Khi: form được mở.
  - Thì: **"Thứ tự hiển thị"** mặc định **0** (không bắt buộc); **"Trạng thái"** mặc định **"Chưa đóng"** (dropdown 2 giá trị "Chưa đóng" / "Đã đóng"); **"Mô tả"** textarea (không bắt buộc), placeholder **"Nhập mô tả"**.

### Nhóm C — Tự động sinh kỳ

- [ ] **AC-8**: Tùy chọn tự động sinh kỳ
  - Tại: checkbox **"Tự động sinh kỳ"** (chỉ có ở kỳ **năm** và **quý**; kỳ **tháng** không có).
  - Khi: chủ garage tích chọn và Lưu.
  - Thì:
    - Kỳ **năm** + tích → hệ thống tự sinh đầy đủ cây con: **4 quý + 12 tháng**.
    - Kỳ **quý** + tích → hệ thống tự sinh **3 tháng con**.
    - Ngày bắt đầu/kết thúc của các kỳ auto sinh được tính tự động theo loại kỳ.
    - Trường **"Thứ tự hiển thị"** của các kỳ con auto sinh được set theo **thứ tự thời gian tăng dần trong phạm vi kỳ cha trực tiếp** — trong kỳ năm: Q1=1, Q2=2, Q3=3, Q4=4; trong mỗi kỳ quý: tháng đầu=1, tháng giữa=2, tháng cuối=3. Việc set này đảm bảo sort ASC theo "Thứ tự hiển thị" ở bảng danh sách (`FEAT-AP-LIST` AC-6b) khớp thứ tự thời gian tự nhiên.
    - **Bỏ qua kỳ con đã tồn tại** (trùng khoảng ngày — theo BR-AP-008), chỉ sinh kỳ còn thiếu; sau khi sinh hiển thị **thông báo tóm tắt**: **"Đã tạo X kỳ, bỏ qua Y kỳ đã tồn tại."**.

### Nhóm D — Validation ngày

- [ ] **AC-9**: Validate khoảng ngày
  - Tại: trường ngày, khi Lưu.
  - Khi: ngày kết thúc < ngày bắt đầu.
  - Thì: hệ thống chặn lưu, báo lỗi ngày.
  - Khi: kỳ con có ngày nằm ngoài khoảng kỳ cha (ngày bắt đầu con < ngày bắt đầu cha, hoặc ngày kết thúc con > ngày kết thúc cha) — **trùng ngày biên được chấp nhận**.
  - Thì: hệ thống chặn lưu, báo lỗi phạm vi ngày.
  - Khi: kỳ cùng cấp trong cùng kỳ cha chồng lấn khoảng ngày.
  - Thì: hệ thống chặn lưu, báo lỗi chồng lấn.

### Nhóm E — Lưu / Đóng

- [ ] **AC-10**: Lưu thành công
  - Tại: nút **"Tạo"**.
  - Khi: dữ liệu hợp lệ.
  - Thì: hệ thống tạo kỳ (và kỳ con nếu tự động sinh), trạng thái khởi tạo **"Chưa đóng"**, hiển thị thông báo thành công, quay về danh sách (kỳ mới xuất hiện đúng vị trí phân cấp).

- [ ] **AC-11**: Huỷ bỏ
  - Tại: nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống đóng form, không lưu, quay về danh sách.

### Nhóm F — Phân quyền

- [ ] **AC-12**: Phân quyền tạo
  - Tại: danh sách kỳ kế toán.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò tạo được với quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87555&t=W7XJPVvhmdBPtv2c-4 |

- Luồng: [UX-FLOW-INVENTORY-ACCOUNTING-PERIOD](../ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md) §3.1.

## 4. API Reference

- Boundary: `gf-accounting` (qua BFF `agg-garage-graph`).
- Tạo kỳ: Mutation `[PROPOSED] CreateAccountingPeriod`.
- Tự động sinh kỳ con: Mutation `[PROPOSED] GenerateChildPeriods`.

## 5. Business Rules

- **BR-AP-001**: Khởi tạo "Chưa đóng".
- **BR-AP-002**: Không có mã; định danh bằng tên (bắt buộc, không bắt trùng).
- **BR-AP-003**: 3 loại kỳ, phân cấp Năm→Quý→Tháng.
- **BR-AP-004**: "Thuộc kỳ" bắt buộc với quý/tháng; dropdown lọc kỳ cha hợp lệ.
- **BR-AP-005**: Trường bắt buộc (loại, tên, ngày bắt đầu, ngày kết thúc, đã đóng kỳ; thuộc kỳ / năm theo loại).
- **BR-AP-006**: Ngày kết thúc ≥ ngày bắt đầu.
- **BR-AP-007**: Kỳ con trong khoảng kỳ cha, cho phép trùng ngày biên.
- **BR-AP-008**: Kỳ cùng cấp không chồng lấn.
- **BR-AP-009**: Tự động sinh kỳ (năm⇒4 quý+12 tháng, quý⇒3 tháng); bỏ qua kỳ con đã tồn tại + thông báo tóm tắt.

## 6. Edge Cases

- **EC-1**: Chưa có kỳ năm/quý nào → dropdown "Thuộc kỳ" rỗng → không tạo được kỳ quý/tháng cho tới khi có kỳ cha.
- **EC-2**: Tự động sinh kỳ khi đã có sẵn một số kỳ con (trùng khoảng ngày) → hệ thống **bỏ qua kỳ đã tồn tại, chỉ sinh kỳ còn thiếu**, rồi báo tóm tắt "Đã tạo X kỳ, bỏ qua Y kỳ đã tồn tại" (theo BR-AP-009 + chống chồng lấn BR-AP-008).

## 7. Out of Scope

- Danh sách → xem `FEAT-AP-LIST`.
- Sửa / đóng-mở kỳ → xem `FEAT-AP-EDIT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-AP-CREATE (mới) — form thêm kỳ theo 3 loại (năm/quý/tháng), field "Thuộc kỳ" theo loại, tự động sinh kỳ con (bỏ qua kỳ con đã tồn tại + thông báo tóm tắt), validate ngày (kết thúc≥bắt đầu, kỳ con trong cha cho trùng biên, không chồng lấn). |
| 2026-06-26 | 2 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14146-87555`. Mobile chưa có. |
| 2026-07-03 | 3 | Business Authority | Bổ sung wording **"Thứ tự hiển thị" khi tự động sinh kỳ**: AC-8 thêm bullet — kỳ con auto sinh được set `display_order` theo **thứ tự thời gian tăng dần trong phạm vi kỳ cha trực tiếp** (kỳ năm: Q1=1..Q4=4; kỳ quý: tháng đầu=1..cuối=3). Đảm bảo sort ASC theo "Thứ tự hiển thị" ở bảng LIST (`FEAT-AP-LIST` AC-6b) khớp thứ tự thời gian tự nhiên. |
| 2026-07-03 | 4 | Business Authority | **Đồng bộ wording labels + buttons theo Figma** (rà soát wave 3): AC-1 tiêu đề "Thêm/Sửa Kỳ kế toán" → **"Thêm kỳ kế toán"**, nút "Đóng" → **"Huỷ bỏ"**, nút "Lưu" → **"Tạo"**; AC-7 field "Đã đóng kỳ" → **"Trạng thái"** (dropdown 2 giá trị "Chưa đóng"/"Đã đóng"), Mô tả bổ sung placeholder **"Nhập mô tả"**; AC-10 nút "Lưu" → **"Tạo"**; AC-11 nút "Đóng" → **"Huỷ bỏ"** + tiêu đề AC. Chọn "Huỷ bỏ" (không "Huỷ") — Figma inconsistent giữa 3 loại kỳ; đồng bộ với ảnh CREATE-1 + toàn bộ EDIT + pattern FEAT-CAT-PROD-CREATE. |
| 2026-07-07 | 5 | Business Authority + Senior PM | **Move boundary**: frontmatter `gf-inventory` → `gf-accounting`. Rationale: Kỳ kế toán (AP) thuộc nghiệp vụ kế toán — khớp SAP FI-CO / Misa / Fast / Odoo. OB + Sổ tồn giữ ở `gf-inventory`. Ref EP-INVENTORY-ACCOUNTING-PERIOD v16. Nội dung AC/BR không đổi. |
| 2026-07-08 | 6 | Business Authority (quannn) + main agent | **Tả rõ widget field "Năm" khi tạo kỳ Năm** (BA quannn quyết 2026-07-08 sau khi rà Figma dropdown). AC-2 "Kỳ năm" — thêm mô tả **dropdown single-select 50 giá trị `[currentYear, currentYear + 49]`** sort ascending, default = năm hiện tại, không cho chọn năm quá khứ. Ref BR-AP-003a mới (BR-GF-INVENTORY-ACCOUNTING-PERIOD v27). Đồng bộ UX-FLOW-AP §3.1 (widget "date picker" → "dropdown năm rời"). Không đổi các loại kỳ khác (Quý/Tháng vẫn dùng "Thuộc kỳ" dropdown kỳ cha). |
