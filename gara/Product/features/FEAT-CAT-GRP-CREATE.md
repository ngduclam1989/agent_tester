---
type: feature
artifact_kind: feature
status: PLANNED
version: 5
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-CATALOG"
boundary: "gf-inventory"
last_reviewed: "2026-07-02"
---

# FEAT-CAT-GRP-CREATE: Tạo nhóm vật tư hàng hóa

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-CREATE` |
| Title | Tạo nhóm vật tư hàng hóa |
| Parent Epic | `EP-INVENTORY-CATALOG` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo nhóm vật tư hàng hóa mới với mã, tên, nhóm cha và mô tả, **so that** tôi có thể xây dựng cấu trúc phân loại vật tư phục vụ quản lý mã sản phẩm nội bộ.

## 2. Acceptance Criteria

### Nhóm A — Mở form

- [ ] **AC-1**: Mở form thêm nhóm
  - Tại: màn hình Danh sách nhóm vật tư hàng hóa.
  - Khi: chủ garage nhấn nút **"Thêm Nhóm VT/HH"**.
  - Thì: hệ thống mở form **"Thêm nhóm vật tư hàng hóa"** với mô tả **"Form thêm nhóm vật tư hàng hóa theo danh mục."**, mục **"Thông tin chung"** gồm 5 trường, nút **"Huỷ bỏ"** và **"Tạo"**.

### Nhóm B — Trường thông tin

- [ ] **AC-2**: Nhập mã nhóm VTHH
  - Tại: trường **"Mã nhóm VTHH"** (bắt buộc, có dấu `*`).
  - Khi: chủ garage nhập mã.
  - Thì: hệ thống nhận giá trị nhập tay và **auto trim** khoảng trắng đầu + cuối. Mã **chỉ chấp nhận** chữ cái Latin không dấu (`A-Z`, `a-z`), chữ số (`0-9`), dấu gạch ngang (`-`), dấu gạch dưới (`_`), dấu chấm (`.`), dấu gạch chéo (`/`), dấu ngoặc đơn (`(` `)`), khoảng trắng ở giữa. **Tối đa 50 ký tự** (sau trim). Ký tự ngoài whitelist (bao gồm tiếng Việt có dấu, ký tự đặc biệt `~ ! @ # $ % ^ & *`, emoji) → báo lỗi mã không hợp lệ (`ERR-INV-001`, theo `BR-CAT-GRP-002`).
  - Khi: bỏ trống và nhấn Tạo.
  - Thì: hệ thống báo lỗi yêu cầu nhập mã nhóm.

- [ ] **AC-3**: Nhập tên nhóm VTHH
  - Tại: trường **"Tên nhóm VTHH"** (bắt buộc, có dấu `*`).
  - Khi: chủ garage nhập tên.
  - Thì: hệ thống nhận giá trị. Bỏ trống và Lưu → báo lỗi yêu cầu nhập tên nhóm.

- [ ] **AC-4**: Chọn nhóm cha
  - Tại: trường **"Thuộc nhóm"** (không bắt buộc, dropdown).
  - Khi: chủ garage chọn một nhóm cha.
  - Thì: hệ thống gán nhóm đang tạo làm con của nhóm cha đó. Bỏ trống → nhóm là nhóm gốc (cấp cao nhất). Dropdown **chỉ liệt kê nhóm "Đang hoạt động"** thuộc garage hiện tại (theo `BR-CAT-GRP-008` + `BR-CAT-GRP-013`); nhóm **"Ngừng hoạt động" không hiển thị**.

- [ ] **AC-5**: Chọn trạng thái
  - Tại: trường **"Trạng thái"** (dropdown).
  - Khi: form được mở.
  - Thì: trạng thái mặc định là **"Đang hoạt động"**. Có thể chọn **"Ngừng hoạt động"**.

- [ ] **AC-6**: Nhập mô tả
  - Tại: trường **"Mô tả"** (textarea, không bắt buộc).
  - Khi: chủ garage nhập mô tả.
  - Thì: hệ thống nhận tối đa **255 ký tự**. Vượt quá → chặn / báo giới hạn.

### Nhóm C — Validation trùng mã

- [ ] **AC-7**: Kiểm tra trùng mã nhóm
  - Tại: trường **"Mã nhóm VTHH"**, khi nhấn **"Lưu"**.
  - Khi: mã nhập trùng với một nhóm đã có trong garage hiện tại.
  - Thì: hệ thống báo lỗi **"Mã nhóm đã tồn tại"** và không lưu.

### Nhóm D — Lưu / Đóng

- [ ] **AC-8**: Lưu thành công
  - Tại: form thêm nhóm, nút **"Tạo"**.
  - Khi: các trường bắt buộc hợp lệ và mã không trùng.
  - Thì: hệ thống tạo nhóm với trạng thái đã chọn (mặc định "Đang hoạt động"), hiển thị thông báo thành công và quay về danh sách (nhóm mới xuất hiện đúng vị trí phân cấp).

- [ ] **AC-9**: Huỷ bỏ form
  - Tại: form thêm nhóm, nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn **"Huỷ bỏ"**.
  - Thì: hệ thống đóng form, không lưu dữ liệu, quay về danh sách.

### Nhóm E — Phân quyền

- [ ] **AC-10**: Phân quyền tạo
  - Tại: danh sách nhóm.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều thấy nút **"Thêm Nhóm VT/HH"** và tạo được nhóm.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14423-88837&t=g9GrqfVRsuvDYwl3-4 |
| Figma | mobile | https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21555-24247&t=4nMPkzz6Vhf93ZCC-4 |

- Luồng: [UX-FLOW-INVENTORY-CATALOG](../ux/UX-FLOW-INVENTORY-CATALOG.md) §3.1.
- Design source: **Figma** (web + mobile — xem bảng trên).

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Tạo nhóm: Mutation `[PROPOSED] CreateMaterialGroup`.

## 5. Business Rules

- **BR-CAT-GRP-001**: Nhóm khởi tạo trạng thái "Đang hoạt động".
- **BR-CAT-GRP-002**: Mã nhóm không chứa ký tự đặc biệt.
- **BR-CAT-GRP-003**: Mã nhóm unique theo garage; trùng → "Mã nhóm đã tồn tại".
- **BR-CAT-GRP-005**: Phân cấp đa tầng qua "Thuộc nhóm".
- **BR-CAT-GRP-006**: Trạng thái 2 giá trị.
- **BR-CAT-GRP-008**: Dropdown "Thuộc nhóm" chỉ liệt kê nhóm **"Đang hoạt động"** — nhóm "Ngừng hoạt động" ẩn khỏi dropdown.
- **BR-CAT-GRP-012**: Mô tả tối đa 255 ký tự.
- **BR-CAT-GRP-013**: Tenant isolation — chỉ nhóm thuộc garage hiện tại.

## 6. Edge Cases

- **EC-1**: Không chọn nhóm cha → nhóm gốc.
- **EC-2**: Tạo nhóm với trạng thái "Ngừng hoạt động" ngay từ đầu → nhóm không khả dụng để gắn mã sản phẩm (theo BR-CAT-GRP-008).

## 7. Out of Scope

- Danh sách nhóm → xem `FEAT-CAT-GRP-LIST`.
- Chỉnh sửa nhóm (gồm chuyển nhóm cha, đổi trạng thái) → xem `FEAT-CAT-GRP-EDIT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-CAT-GRP-CREATE (mới) — form thêm nhóm VTHH: mã (validate ký tự đặc biệt + trùng), tên, nhóm cha, trạng thái, mô tả ≤255 ký tự. |
| 2026-06-24 | 2 | Business Authority | Gắn **Figma web + mobile** vào §3 (web GMS-v.3 node `14423-88837`, mobile App-Garage-V3 node `21555-24247`). Nguồn authoritative cho registry figma-links (wave 03 sync). |
| 2026-06-24 | 3 | Business Authority | **Đồng bộ tên nút theo Figma** (rà soát wave 3): tiêu đề "Thêm Nhóm…" → **"Thêm nhóm vật tư hàng hóa"**, nút "Đóng" → **"Huỷ bỏ"**, "Lưu" → **"Tạo"** (AC-1, AC-8, AC-9). |
| 2026-06-29 | 4 | Business Authority | **Note điều kiện dropdown "Thuộc nhóm" — ẨN nhóm Ngừng hoạt động** (BA chốt close gap đã phát hiện): AC-4 bổ sung dòng "Dropdown chỉ liệt kê nhóm 'Đang hoạt động' thuộc garage hiện tại; nhóm 'Ngừng hoạt động' không hiển thị" (theo BR-CAT-GRP-008 mở rộng + BR-CAT-GRP-013). §5 thêm reference BR-CAT-GRP-008 + BR-CAT-GRP-013. Đồng bộ FEAT-CAT-GRP-EDIT v4 + BR-GF-INVENTORY-CATALOG v18 (BR-CAT-GRP-008 mở rộng cover dropdown form nhóm). |
| 2026-07-02 | 5 | Business Authority | **Chuyển validate mã nhóm VTHH từ blacklist → whitelist** (BA chốt chặn tiếng Việt có dấu): AC-2 rewrite — "không chứa ký tự đặc biệt" → "**chỉ chấp nhận** `A-Z a-z 0-9 - _ . / ( )` + khoảng trắng ở giữa + auto trim đầu cuối + tối đa 50 ký tự". Thêm cite `ERR-INV-001` + `BR-CAT-GRP-002`. Gộp 3 nhánh Khi/Thì (nhập valid / bỏ trống / ký tự ngoài whitelist) thành 2 nhánh gọn. Đồng bộ BR-GF-INVENTORY-CATALOG v19 (BR-CAT-GRP-002) + FEAT-CAT-PROD-CREATE v13 (BR-CAT-PROD-002). |
