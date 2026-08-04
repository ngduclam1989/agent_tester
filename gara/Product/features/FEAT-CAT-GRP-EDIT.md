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

# FEAT-CAT-GRP-EDIT: Chỉnh sửa nhóm vật tư hàng hóa

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-EDIT` |
| Title | Chỉnh sửa nhóm vật tư hàng hóa |
| Parent Epic | `EP-INVENTORY-CATALOG` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** chỉnh sửa thông tin nhóm vật tư hàng hóa — gồm đổi tên, chuyển nhóm cha, đổi trạng thái, sửa mô tả, **so that** tôi giữ cấu trúc phân loại vật tư luôn chính xác theo nhu cầu vận hành.

## 2. Acceptance Criteria

### Nhóm A — Mở form sửa

- [ ] **AC-1**: Mở form chỉnh sửa
  - Tại: danh sách (icon Sửa) hoặc màn chi tiết (nút **"Chỉnh sửa"**).
  - Khi: chủ garage chọn sửa một nhóm.
  - Thì: hệ thống mở form **"Chỉnh sửa nhóm vật tư hàng hóa"** với mô tả **"Form cập nhật thông tin nhóm vật tư hàng hóa."**, các trường được điền sẵn (pre-filled), nút **"Huỷ bỏ"** và **"Lưu"**.

### Nhóm B — Trường chỉnh sửa

- [ ] **AC-2**: Mã nhóm khóa
  - Tại: trường **"Mã nhóm VTHH"**.
  - Khi: form sửa được mở.
  - Thì: trường mã hiển thị giá trị hiện tại nhưng **không cho chỉnh sửa** (disabled), kèm dòng hướng dẫn **"Không được sửa mã nhóm sau khi tạo."**.

- [ ] **AC-3**: Sửa tên nhóm
  - Tại: trường **"Tên nhóm VTHH"** (bắt buộc).
  - Khi: chủ garage sửa tên.
  - Thì: hệ thống nhận giá trị mới. Bỏ trống và Lưu → báo lỗi yêu cầu nhập tên.

- [ ] **AC-4**: Trường "Thuộc nhóm" bị khoá trên màn Chỉnh sửa
  - Tại: màn Chỉnh sửa nhóm vật tư hàng hóa.
  - Khi: chủ garage mở màn Chỉnh sửa.
  - Thì: trường **"Thuộc nhóm"** hiển thị **khoá (disabled)** — cùng cách khoá với trường **"Mã nhóm VTHH"** — không cho phép chọn lại nhóm cha khác sau khi đã tạo (theo `BR-CAT-GRP-009`, đảo ngược quyết định cũ cho phép đổi nhóm cha bất kỳ lúc nào). Nhóm cha chỉ được chọn **một lần duy nhất tại thời điểm tạo mới** (`FEAT-CAT-GRP-CREATE`).
  - Khi: client bị bypass hoặc gọi API trực tiếp cố tình đổi nhóm cha thành chính nó hoặc một nhóm con/hậu duệ.
  - Thì: backend vẫn chặn và báo lỗi vòng lặp phân cấp `ERR-INV-003` (giữ nguyên làm phòng vệ defense-in-depth, dù UI đã khoá trường).

- [ ] **AC-5**: Đổi trạng thái + cascade nhóm con
  - Tại: trường **"Trạng thái"**.
  - Khi: chủ garage đổi trạng thái nhóm sang **"Ngừng hoạt động"** và Lưu.
  - Thì: hệ thống cập nhật trạng thái nhóm và **tự động** cập nhật toàn bộ nhóm con (mọi cấp dưới) sang **"Ngừng hoạt động"**.
  - Khi: chủ garage đổi trạng thái sang **"Đang hoạt động"**.
  - Thì: hệ thống cập nhật trạng thái nhóm hiện tại (không tự động bật lại nhóm con — kích hoạt lại từng nhóm con nếu cần).

- [ ] **AC-6**: Sửa mô tả
  - Tại: trường **"Mô tả"**.
  - Khi: chủ garage sửa mô tả.
  - Thì: hệ thống nhận tối đa **255 ký tự**.

### Nhóm C — Lưu / Hủy

- [ ] **AC-7**: Lưu thay đổi
  - Tại: nút **"Lưu"**.
  - Khi: dữ liệu hợp lệ (tên không trống, không vi phạm vòng lặp phân cấp).
  - Thì: hệ thống lưu thay đổi, hiển thị thông báo thành công, cập nhật **"Người sửa"** + **"Ngày sửa"**, quay về danh sách/chi tiết.

- [ ] **AC-8**: Huỷ bỏ chỉnh sửa
  - Tại: nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn **"Huỷ bỏ"**.
  - Thì: hệ thống hủy thay đổi (không lưu) và quay về màn trước.

### Nhóm D — Phân quyền

- [ ] **AC-9**: Phân quyền sửa
  - Tại: form chỉnh sửa.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều sửa được với quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14423-88839&t=g9GrqfVRsuvDYwl3-4 |
| Figma | mobile | https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21555-24249&t=4nMPkzz6Vhf93ZCC-4 |

- Luồng: [UX-FLOW-INVENTORY-CATALOG](../ux/UX-FLOW-INVENTORY-CATALOG.md) §3.1, EC-3.
- Design source: **Figma** (web + mobile — xem bảng trên).

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Cập nhật nhóm: Mutation `[PROPOSED] UpdateMaterialGroup`.

## 5. Business Rules

- **BR-CAT-GRP-004**: Mã nhóm không sửa sau khi tạo.
- **BR-CAT-GRP-007**: Cha "Ngừng hoạt động" → cascade toàn bộ nhóm con sang "Ngừng hoạt động".
- **BR-CAT-GRP-008**: Nhóm "Ngừng hoạt động" không gắn được vào mã sản phẩm mới + **ẩn khỏi dropdown "Thuộc nhóm" ở form tạo/sửa nhóm VTHH**.
- **BR-CAT-GRP-008**: Nhóm "Ngừng hoạt động" không gắn được vào mã sản phẩm mới + **ẩn khỏi dropdown "Thuộc nhóm" ở form tạo/sửa nhóm VTHH**.
- **BR-CAT-GRP-009**: "Thuộc nhóm" đặt được sang bất kỳ nhóm khác; chặn chuyển vào chính nó hoặc nhóm con/hậu duệ.
- **BR-CAT-GRP-012**: Mô tả tối đa 255 ký tự.

## 6. Edge Cases

- **EC-1**: Đổi nhóm cha "Ngừng hoạt động" trong khi nhóm con đang "Đang hoạt động" — cascade chỉ áp khi nhóm cha chuyển sang "Ngừng hoạt động" (theo BR-CAT-GRP-007).
- **EC-2**: Chuyển nhóm vào nhánh khác làm thay đổi vị trí hiển thị trong cây ở danh sách.

## 7. Out of Scope

- Tạo nhóm mới → xem `FEAT-CAT-GRP-CREATE`.
- Xóa nhóm → xem `FEAT-CAT-GRP-DELETE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-CAT-GRP-EDIT (mới) — sửa nhóm VTHH: mã khóa, đổi tên/mô tả, chuyển nhóm cha (chặn vòng lặp), đổi trạng thái + cascade ngừng hoạt động xuống nhóm con. |
| 2026-06-24 | 2 | Business Authority | Gắn **Figma web + mobile** vào §3 (web GMS-v.3 node `14423-88839`, mobile App-Garage-V3 node `21555-24249`). Nguồn authoritative cho registry figma-links (wave 03 sync). |
| 2026-06-24 | 3 | Business Authority | **Đồng bộ tên nút theo Figma** (rà soát wave 3): tiêu đề "Sửa Nhóm…" → **"Chỉnh sửa nhóm vật tư hàng hóa"**, entry "Sửa" → **"Chỉnh sửa"**, nút "Hủy" → **"Huỷ bỏ"** (nút "Lưu" giữ nguyên). |
| 2026-07-02 | 5 | Business Authority (in-session — user "mobile dev" quyết định 2026-07-02) | **Khoá trường "Thuộc nhóm" trên màn Chỉnh sửa** — AC-4 viết lại hoàn toàn: đảo ngược quyết định cũ (v4, cho phép đổi nhóm cha sang bất kỳ nhóm nào khác trừ self/descendant) thành **khoá vĩnh viễn sau khi tạo**, cùng pattern khoá với "Mã nhóm VTHH". Backend cycle-guard `ERR-INV-003` giữ nguyên làm phòng vệ, không còn là validation chính trên UI. Đồng bộ `BR-GF-INVENTORY-CATALOG` v19 (`BR-CAT-GRP-009`). **Flag**: Figma edit-mode mockup (`wave03-cat-grp-edit.md`) hiện còn vẽ dropdown active — STALE so quyết định này, cần designer cập nhật ở lượt prefetch-figma kế tiếp. |
| 2026-06-29 | 4 | Business Authority | **Note điều kiện dropdown "Thuộc nhóm" — ẨN nhóm Ngừng hoạt động + loại self/descendants** (BA chốt close gap đã phát hiện): AC-4 bổ sung 2 điều kiện rõ ràng cho dropdown — (1) chỉ liệt kê nhóm "Đang hoạt động" (BR-CAT-GRP-008 mở rộng) + tenant-scoped (BR-CAT-GRP-013); (2) loại bỏ chính nhóm đang sửa + toàn bộ nhóm con/hậu duệ (BR-CAT-GRP-009 đã có, làm rõ thêm cấp client-side filter). Backend defense `ERR-INV-003` giữ nguyên. §5 BR cite mở rộng wording BR-CAT-GRP-008. Đồng bộ FEAT-CAT-GRP-CREATE v4 + BR-GF-INVENTORY-CATALOG v18. |
