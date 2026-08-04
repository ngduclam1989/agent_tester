---
type: feature
artifact_kind: feature
status: PLANNED
version: 11
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-CATALOG"
boundary: "gf-inventory"
last_reviewed: "2026-07-03"
---

# FEAT-CAT-PROD-EDIT: Chỉnh sửa mã sản phẩm nội bộ

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-EDIT` |
| Title | Chỉnh sửa mã sản phẩm nội bộ |
| Parent Epic | `EP-INVENTORY-CATALOG` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** chỉnh sửa thông tin mã sản phẩm nội bộ, **so that** dữ liệu sản phẩm luôn chính xác — đồng thời hệ thống khóa các trường không được phép đổi khi mã đã phát sinh giao dịch.

## 2. Acceptance Criteria

### Nhóm A — Mở form sửa

- [ ] **AC-1**: Mở form chỉnh sửa
  - Tại: danh sách (icon Sửa) hoặc chi tiết (nút **"Chỉnh sửa"**).
  - Khi: chủ garage chọn sửa một mã sản phẩm.
  - Thì: hệ thống mở form **"Sửa sản phẩm"** giống form thêm mới, các trường được điền sẵn (pre-filled), 4 tab tương tự, nút **"Huỷ bỏ"** và **"Lưu"**.

### Nhóm B — Trường khóa

- [ ] **AC-2**: Mã sản phẩm khóa
  - Tại: trường **"Mã sản phẩm nội bộ"**.
  - Khi: form sửa được mở.
  - Thì: trường mã hiển thị giá trị hiện tại nhưng **không cho sửa** (disabled), kèm dòng hướng dẫn **"Không được sửa mã sản phẩm nội bộ."**.

- [ ] **AC-3**: ĐVT chính khóa khi đã giao dịch
  - Tại: trường **"ĐVT chính"**.
  - Khi: mã sản phẩm **đã phát sinh giao dịch**.
  - Thì: trường ĐVT chính bị khóa (disabled), kèm dòng hướng dẫn **"Không được sửa vì đã phát sinh giao dịch."**.
  - Khi: mã sản phẩm **chưa phát sinh giao dịch**.
  - Thì: trường ĐVT chính cho phép chọn lại từ danh mục master.

### Nhóm C — Sửa các trường khác

- [ ] **AC-4**: Sửa thông tin chung
  - Tại: tab Thông tin chung.
  - Khi: chủ garage chỉnh các trường: Tên sản phẩm (bắt buộc), **Tính chất** (dropdown, không bắt buộc — 4 giá trị cố định: **Vật tư hàng hóa**, **CCDC**, **Dịch vụ**, **Khác**; system-seeded, xem **BR-CAT-PROD-019**), Nhóm vật tư/hàng hóa (dropdown chỉ nhóm "Đang hoạt động"), Trạng thái, Thương hiệu (text — nhập tay), **Xuất xứ** (dropdown — chọn từ danh mục xuất xứ master, **BR-CAT-PROD-023**), Thông số kỹ thuật, Quy cách sản phẩm, **Mô tả** (≤ 500 ký tự — `ERR-INV-046`, **BR-CAT-PROD-025**), **Ghi chú** (≤ 500 ký tự — `ERR-INV-046`, **BR-CAT-PROD-025**), ảnh sản phẩm.
  - Thì: hệ thống nhận giá trị mới; **Tính chất** giữ giá trị hiện tại của mã khi mở form (nếu mã chưa có thì mặc định **"Vật tư hàng hóa"** — BR-CAT-PROD-019), cho chọn lại 1 trong 4 giá trị; Tên sản phẩm bỏ trống → báo lỗi.

- [ ] **AC-5**: Phương pháp tính giá vẫn khóa
  - Tại: trường **"Phương pháp tính giá"**.
  - Khi: form sửa được mở.
  - Thì: hệ thống giữ **"Bình quân cuối kỳ"** và không cho sửa (theo BR-CAT-PROD-010).

- [ ] **AC-6**: Đổi trạng thái
  - Tại: trường **"Trạng thái"**.
  - Khi: chủ garage đổi sang **"Ngừng hoạt động"** và lưu.
  - Thì: hệ thống cập nhật trạng thái; mã ở trạng thái "Ngừng hoạt động" không dùng được trong phiếu nhập/xuất kho mới.

- [ ] **AC-7**: ĐVT quy đổi / SKU / đính kèm trong form sửa
  - Tại: các tab ĐVT quy đổi / Mã SKU / Đính kèm file.
  - Khi: chủ garage thao tác.
  - Thì: hệ thống cho thêm/sửa/xóa tương tự khi tạo — modal "Thêm ĐVT quy đổi" áp dụng **BR-CAT-PROD-011** đầy đủ (> 0 → `ERR-INV-013`; **≤ 6 chữ số thập phân → `ERR-INV-047`**; không trùng ĐVT → `ERR-INV-014`); ĐVT quy đổi **đã phát sinh giao dịch** bị khóa sửa/xóa (theo BR-CAT-PROD-012). Tab **"Đính kèm file"**: tối đa **5 tệp**, mỗi tệp **≤ 30 MB** (mã lỗi `ERR-CMN-004`), định dạng **PDF, JPG, PNG** (mã lỗi `ERR-CMN-005`) — theo **BR-CAT-PROD-015**; ảnh sản phẩm chỉ nhận **jpg, png**. **Lưu ý persist**: mọi thay đổi ĐVT quy đổi / SKU / đính kèm chỉ **ghi DB khi nhấn "Lưu"** — nhấn **"Huỷ bỏ"** thì rollback toàn bộ thay đổi chưa lưu (giống form Thêm).

### Nhóm D — Lưu / Hủy

- [ ] **AC-8**: Lưu thay đổi
  - Tại: nút **"Lưu"**.
  - Khi: dữ liệu hợp lệ.
  - Thì: hệ thống ghi toàn bộ thay đổi (thông tin chung + ĐVT quy đổi + SKU + đính kèm) trong **cùng 1 lần lưu**, hiển thị thông báo thành công, cập nhật người sửa + ngày sửa.

- [ ] **AC-9**: Huỷ bỏ
  - Tại: nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống hủy thay đổi, quay về màn trước.

### Nhóm E — Phân quyền

- [ ] **AC-10**: Phân quyền sửa
  - Tại: form chỉnh sửa.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò sửa được với quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87153&t=fE3MKR6uAHS9vkKm-4 |

- Luồng: [UX-FLOW-INVENTORY-CATALOG](../ux/UX-FLOW-INVENTORY-CATALOG.md) §3.2, EC-6.
- Design source: **Figma** (web — xem bảng trên). Mobile: không thuộc phạm vi (web-only).

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Cập nhật mã sản phẩm: Mutation `[PROPOSED] UpdateInternalProduct`.

## 5. Business Rules

- **BR-CAT-PROD-004**: Mã sản phẩm không sửa sau khi tạo.
- **BR-CAT-PROD-006**: ĐVT chính không sửa khi đã phát sinh giao dịch.
- **BR-CAT-PROD-008**: Mã "Ngừng hoạt động" không dùng trong phiếu mới.
- **BR-CAT-PROD-009**: Dropdown nhóm chỉ hiển thị nhóm "Đang hoạt động".
- **BR-CAT-PROD-010**: Phương pháp tính giá mặc định BQ cuối kỳ, không sửa.
- **BR-CAT-PROD-012**: ĐVT quy đổi đã giao dịch không sửa/xóa.
- **BR-CAT-PROD-015**: Tệp đính kèm ≤ 5 tệp, mỗi tệp **≤ 30 MB** (ERR-CMN-004), định dạng PDF/JPG/PNG (ERR-CMN-005); ảnh jpg/png.
- **BR-CAT-PROD-019**: Tính chất — 4 giá trị cố định (Vật tư hàng hóa / CCDC / Dịch vụ / Khác), mặc định "Vật tư hàng hóa".

## 6. Edge Cases

- **EC-1**: Mã chưa giao dịch → cho đổi ĐVT chính; sau khi phát sinh giao dịch trường này bị khóa.
- **EC-2**: Đổi trạng thái sang "Ngừng hoạt động" trong khi mã đang dùng ở phiếu nháp — áp dụng cho phiếu mới sau thời điểm đổi (quy tắc dùng ở phiếu thuộc epic nhập/xuất kho V2).

## 7. Out of Scope

- Tạo mã sản phẩm → xem `FEAT-CAT-PROD-CREATE`.
- Xem chi tiết → xem `FEAT-CAT-PROD-DETAIL`.
- Xóa mã sản phẩm → xem `FEAT-CAT-PROD-DELETE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-CAT-PROD-EDIT (mới) — form sửa pre-filled: mã khóa, ĐVT chính khóa nếu đã giao dịch, phương pháp tính giá khóa, đổi trạng thái, quản lý ĐVT quy đổi/SKU/đính kèm (khóa ĐVT đã giao dịch). |
| 2026-06-16 | 2 | Business Authority | Đồng bộ với BR-CAT-PROD-019 (enum Tính chất) + BR-015 (đính kèm ≤10MB PDF/JPG/PNG, ảnh jpg/png) — kéo theo các fix đã áp ở CREATE/DETAIL. |
| 2026-06-16 | 3 | Business Authority | Bỏ hẳn lịch sử: gỡ "ghi lịch sử thao tác" ở AC lưu; cross-ref "Xem chi tiết / lịch sử" → "Xem chi tiết". Đồng bộ bỏ BR-CAT-CMN-001. |
| 2026-06-24 | 4 | Business Authority | Gắn **Figma web** vào §3 UI/UX Reference (node `14146-87153`, file GMS-v.3); Mobile **web-only** (không làm). Nguồn authoritative cho registry figma-links (wave 03 sync). |
| 2026-06-24 | 5 | Business Authority | **Xuất xứ → master lookup; Thương hiệu giữ free-text** (BA làm rõ rà soát wave 3): AC chỉnh — Thương hiệu (text, nhập tay), Xuất xứ = dropdown chọn từ danh mục xuất xứ master (**BR-CAT-PROD-023**). |
| 2026-06-24 | 6 | Business Authority | **Đồng bộ tên nút theo Figma** (rà soát wave 3): tiêu đề "Chỉnh sửa Mã sản phẩm nội bộ" → **"Sửa sản phẩm"**, entry "Sửa" → **"Chỉnh sửa"**, "Lưu thay đổi" → **"Lưu"**, "Hủy" → **"Huỷ bỏ"**. |
| 2026-06-25 | 7 | Business Authority | **Giới hạn 500 ký tự cho "Mô tả" + "Ghi chú"** (BA chốt): AC liệt kê trường chỉnh sửa thêm chú thích **"Mô tả (≤ 500 ký tự — `ERR-INV-046`, BR-CAT-PROD-025)"** + **"Ghi chú (≤ 500 ký tự — `ERR-INV-046`, BR-CAT-PROD-025)"**. Đồng bộ FEAT-CAT-PROD-CREATE v9 + BR-GF-INVENTORY-CATALOG v14 + ERROR-CODE-REGISTRY v15. |
| 2026-06-26 | 8 | Business Authority | **Cascade precision tỷ lệ quy đổi ≤ 6 chữ số thập phân vào form sửa** (BA chốt): AC-7 thêm chú thích modal "Thêm ĐVT quy đổi" áp dụng BR-CAT-PROD-011 đầy đủ — `> 0` (ERR-INV-013) + **≤ 6 chữ số thập phân (ERR-INV-047)** + non-trùng ĐVT (ERR-INV-014). Đồng bộ BR-GF-INVENTORY-CATALOG v15 + FEAT-CAT-PROD-CREATE v10 + FEAT-CAT-PROD-DETAIL v8 + ERROR-CODE-REGISTRY v16. |
| 2026-06-29 | 9 | Business Authority | **Revert dung lượng tệp đính kèm 10 MB → 30 MB** (BA chốt rà soát Wave 3). AC-7 tab "Đính kèm file" + cite BR-CAT-PROD-015 §Business Rules cập nhật con số dung lượng; định dạng + cap 5 tệp + mã lỗi giữ nguyên. CHỈ áp Wave 3 — Receipt/Delivery V2 vẫn 10 MB. Đồng bộ BR-GF-INVENTORY-CATALOG v16 + FEAT-CAT-PROD-CREATE v11 + FEAT-CAT-PROD-DETAIL v9. |
| 2026-06-29 | 10 | Business Authority | **Cleanup note divergence** — BA mở rộng scope all-30MB toàn Inventory V2; xóa note "W03 dùng cap 30 MB riêng — khác Receipt/Delivery V2 = 10 MB" trong AC-7 + §5 BR cite. Đồng bộ BR-GF-INVENTORY-CATALOG v17 + BR-GF-INVENTORY-RECEIPT-V2 v25 + BR-GF-INVENTORY-DELIVERY-V2 v21. |
| 2026-07-03 | 11 | Business Authority | **Clarify persist behavior tab ĐVT/SKU/đính kèm** (BA chốt: code hiện tại ghi DB ngay khi thao tác — sai spec): AC-7 bổ sung "mọi thay đổi chỉ ghi DB khi nhấn Lưu; Huỷ bỏ → rollback toàn bộ" (giống form Thêm). AC-8 clarify "ghi toàn bộ thay đổi (thông tin chung + ĐVT + SKU + đính kèm) trong cùng 1 lần lưu". |
