---
type: feature
artifact_kind: feature
status: PLANNED
version: 10
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-CATALOG"
boundary: "gf-inventory"
last_reviewed: "2026-06-29"
---

# FEAT-CAT-PROD-DETAIL: Chi tiết mã sản phẩm nội bộ

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-DETAIL` |
| Title | Chi tiết mã sản phẩm nội bộ (gắn SKU, ĐVT quy đổi) |
| Parent Epic | `EP-INVENTORY-CATALOG` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết mã sản phẩm nội bộ và quản lý ĐVT quy đổi, mã SKU, tệp đính kèm, **so that** tôi nắm đầy đủ thông tin và cập nhật mapping/đơn vị mà không cần vào form sửa.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị chi tiết

- [ ] **AC-1**: Mở màn chi tiết
  - Tại: danh sách, nhấn vào mã sản phẩm (hoặc icon Xem).
  - Khi: chủ garage chọn xem.
  - Thì: hệ thống mở màn **"Chi tiết sản phẩm"** với mô tả **"Read-only, cho phép chỉnh sửa, gắn SKU, thêm ĐVT quy đổi theo quyền."**, mục **"Thông tin chung"** read-only, các nút **"Chỉnh sửa"**, **"Gắn SKU"**, **"Thêm ĐVT quy đổi"**. *(Theo Figma màn chi tiết KHÔNG có nút "Xóa" — xóa mã thực hiện từ icon Thao tác ở danh sách.)*

- [ ] **AC-2**: Hiển thị thông tin chung
  - Tại: mục **"Thông tin chung"**.
  - Khi: màn được render.
  - Thì: hệ thống hiển thị read-only: ảnh sản phẩm, Mã sản phẩm nội bộ, Tên sản phẩm, Tính chất, Nhóm vật tư/hàng hóa, ĐVT chính, Trạng thái (badge), Thương hiệu, Xuất xứ, Phương pháp tính giá, Thông số kỹ thuật, Quy cách sản phẩm, Mô tả, Ghi chú.

- [ ] **AC-3**: Thông tin audit
  - Tại: cuối mục **"Thông tin chung"** (format chung của mọi form chi tiết).
  - Khi: màn được render.
  - Thì: hệ thống hiển thị: **"Ngày tạo"**, **"Người tạo"**, **"Ngày sửa"**, **"Người sửa"**.

- [ ] **AC-4**: Các tab dữ liệu liên quan
  - Tại: khu vực tab dưới thông tin chung.
  - Khi: màn được render.
  - Thì: hệ thống hiển thị 3 tab: **"ĐVT quy đổi"**, **"Mã SKU"**, **"Đính kèm file"**. (Dòng audit ở trên là thông tin tạo/sửa gần nhất, áp dụng chung mọi form.)

### Nhóm B — Tab ĐVT quy đổi

- [ ] **AC-5**: Xem & quản lý ĐVT quy đổi
  - Tại: tab **"ĐVT quy đổi"**.
  - Thì: hệ thống hiển thị bảng (STT / ĐVT / Tỷ lệ quy đổi / Thao tác). Nút **"Thêm ĐVT quy đổi"** mở modal thêm; mỗi dòng có **"Sửa"** / **"Xóa"**.
  - Khi: ĐVT quy đổi đã phát sinh giao dịch.
  - Thì: nút Sửa / Xóa của dòng đó bị khóa (không cho sửa/xóa).
  - Khi: thêm/sửa với tỷ lệ ≤ 0 hoặc trùng ĐVT.
  - Thì: hệ thống báo lỗi (tỷ lệ > 0, không trùng ĐVT).

### Nhóm C — Tab Mã SKU

- [ ] **AC-6**: Xem & gắn SKU
  - Tại: tab **"Mã SKU"** (hoặc nút **"Gắn SKU"** trên đầu màn).
  - Thì: hệ thống hiển thị bảng SKU đã gắn (STT / SKU / Tên SKU / Thao tác). Nút **"Gắn SKU"** mở modal **"Gắn SKU cho [mã]"**: tìm SKU (theo SKU/tên SKU/nguồn-phân hệ), hiển thị trạng thái **"Chưa mapping"** / **"Đã mapping mã khác"**.
  - Khi: chọn SKU **"Chưa mapping"** và **"Gắn SKU"**.
  - Thì: hệ thống thêm SKU vào danh sách gắn của mã sản phẩm.
  - Khi: SKU **"Đã mapping mã khác"**.
  - Thì: hệ thống không cho chọn (một SKU chỉ thuộc một mã nội bộ).

- [ ] **AC-7**: Bỏ gắn SKU
  - Tại: tab Mã SKU, nút **"Xóa"** trên dòng SKU.
  - Khi: chủ garage bỏ gắn một SKU.
  - Thì: hệ thống gỡ mapping giữa SKU và mã sản phẩm (xóa khỏi bảng trung gian), **không** xóa bản ghi SKU gốc.

### Nhóm D — Tab Đính kèm file

- [ ] **AC-8**: Tab Đính kèm file
  - Tại: tab **"Đính kèm file"**.
  - Thì: hệ thống hiển thị các tệp đã đính kèm (tên tệp, dung lượng) và cho phép mở/tải; giới hạn tối đa **5 tệp**, mỗi tệp **≤ 30 MB** (mã lỗi `ERR-CMN-004`), định dạng **PDF, JPG, PNG** (mã lỗi `ERR-CMN-005`) — theo chuẩn upload file toàn platform.

### Nhóm E — Hành động & phân quyền

- [ ] **AC-10**: Các nút hành động
  - Tại: đầu màn chi tiết.
  - Khi: chủ garage nhấn.
  - Thì: **"Chỉnh sửa"** → form chỉnh sửa (`FEAT-CAT-PROD-EDIT`); **"Gắn SKU"** → modal gắn SKU; **"Thêm ĐVT quy đổi"** → modal thêm ĐVT. *(Xóa mã: từ icon Thao tác ở danh sách → `FEAT-CAT-PROD-DELETE`; màn chi tiết không có nút Xóa theo Figma.)*

- [ ] **AC-11**: Phân quyền
  - Tại: màn chi tiết.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò xem và thao tác với quyền ngang nhau.

- [ ] **AC-12**: Phạm vi mobile — chỉ xem (view-only)
  - Tại: app mobile (garage-mobile).
  - Khi: người dùng mở chi tiết mã sản phẩm trên app.
  - Thì: app **chỉ hiển thị chi tiết + các tab (ĐVT quy đổi / SKU / đính kèm) ở chế độ xem** — KHÔNG có nút **Chỉnh sửa** và KHÔNG thao tác gắn/bỏ SKU, thêm/sửa ĐVT quy đổi, thêm/xóa đính kèm. Thao tác chỉ trên **web** (wave 3 mobile = view-only).

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87538&t=fE3MKR6uAHS9vkKm-4 |
| Figma | mobile | https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21555-24017&t=4nMPkzz6Vhf93ZCC-4 |

- Luồng: [UX-FLOW-INVENTORY-CATALOG](../ux/UX-FLOW-INVENTORY-CATALOG.md) §3.2, §3.3.
- Design source: **Figma** (web + mobile — xem bảng trên).

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Chi tiết mã sản phẩm: Query `[PROPOSED] GetInternalProduct`.
- Gắn/bỏ gắn SKU: Mutation `[PROPOSED] MapSku` / `[PROPOSED] UnmapSku`.
- Thêm/sửa/xóa ĐVT quy đổi: Mutation `[PROPOSED] UpsertConversionUnit` / `[PROPOSED] DeleteConversionUnit`.

## 5. Business Rules

- **BR-CAT-PROD-011**: ĐVT quy đổi > 0, **số thập phân tối đa 6 chữ số sau dấu phẩy**, không trùng.
- **BR-CAT-PROD-012**: ĐVT quy đổi đã giao dịch không sửa/xóa.
- **BR-CAT-PROD-013**: Một SKU chỉ thuộc một mã nội bộ; một mã gắn nhiều SKU.
- **BR-CAT-PROD-014**: Bỏ gắn SKU chỉ gỡ mapping, không xóa SKU gốc.
- **BR-CAT-CMN-002**: Hiển thị thông tin audit.

## 6. Edge Cases

- **EC-1**: Mã đã phát sinh giao dịch → các thao tác ĐVT quy đổi liên quan bị khóa (theo BR-CAT-PROD-012).
- **EC-2**: SKU vừa bị mã khác gắn ở phiên song song → modal cập nhật trạng thái "Đã mapping mã khác".

## 7. Out of Scope

- Chỉnh sửa thông tin chung → xem `FEAT-CAT-PROD-EDIT`.
- Xóa mã sản phẩm → xem `FEAT-CAT-PROD-DELETE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-CAT-PROD-DETAIL (mới) — chi tiết read-only + 4 tab (ĐVT quy đổi / Mã SKU / Đính kèm file / Lịch sử); gắn-bỏ gắn SKU (mapping), quản lý ĐVT quy đổi (khóa nếu đã giao dịch), nhật ký thao tác. |
| 2026-06-16 | 2 | Business Authority | Fix (quyết định BA): tệp đính kèm tuân platform ≤10MB + PDF/JPG/PNG (ERR-CMN-004/005), bỏ ≤30MB/5-định-dạng |
| 2026-06-16 | 3 | Business Authority | **Bỏ hẳn tab "Lịch sử"** (chốt BA): 4 tab → 3 tab (ĐVT quy đổi / Mã SKU / Đính kèm file); xóa AC-9, mục API `GetInternalProductHistory`, ref BR-CAT-CMN-001; sửa Title + User Story + heading Nhóm D. Không code tab, không hiển thị. |
| 2026-06-24 | 4 | Business Authority | Gắn **Figma web** vào §3 UI/UX Reference (node `14146-87538`, file GMS-v.3) + ghi chú Mobile **chờ cấp link**. Nguồn authoritative cho registry figma-links (wave 03 sync). |
| 2026-06-24 | 5 | Business Authority | Bổ sung **Figma mobile** vào §3 (file App-Garage-V3 node `21555-24017`); gỡ ghi chú "chờ cấp link" → web + mobile đầy đủ. Re-sync registry figma-links wave 03. |
| 2026-06-24 | 6 | Business Authority | Thêm **AC-12 mobile view-only** (BA chốt rà soát wave 3): app chỉ xem chi tiết + 3 tab ở chế độ xem, không Sửa/gắn SKU/ĐVT quy đổi/đính kèm. |
| 2026-06-24 | 7 | Business Authority | **Đồng bộ tên nút theo Figma** (rà soát wave 3): tiêu đề "Chi tiết Mã sản phẩm nội bộ" → **"Chi tiết sản phẩm"**, "Sửa" → **"Chỉnh sửa"**; **bỏ nút "Xóa"** khỏi header chi tiết (Figma không có — xóa thực hiện từ icon Thao tác ở danh sách). |
| 2026-06-26 | 8 | Business Authority | **BR mirror — precision tỷ lệ quy đổi ≤ 6 chữ số thập phân** (cascade theo BR-GF-INVENTORY-CATALOG v15 / FEAT-CAT-PROD-CREATE v10): §Business Rules — BR-CAT-PROD-011 mirror cập nhật "số thập phân" → "**số thập phân tối đa 6 chữ số sau dấu phẩy**". Áp cho tab "ĐVT quy đổi" trên màn chi tiết khi mở modal Thêm/Sửa ĐVT (vượt → ERR-INV-047). |
| 2026-06-29 | 9 | Business Authority | **Revert dung lượng tệp đính kèm 10 MB → 30 MB** (BA chốt rà soát Wave 3). AC-8 tab "Đính kèm file" cập nhật con số dung lượng; định dạng + cap 5 tệp + mã lỗi giữ nguyên. CHỈ áp Wave 3. Đồng bộ BR-GF-INVENTORY-CATALOG v16 + FEAT-CAT-PROD-CREATE v11 + FEAT-CAT-PROD-EDIT. |
| 2026-06-29 | 10 | Business Authority | **Cleanup note divergence** — BA mở rộng scope all-30MB toàn Inventory V2; xóa note "W03 dùng cap 30 MB riêng — khác Receipt/Delivery V2 = 10 MB" trong AC-8 + phục hồi wording "theo chuẩn upload file toàn platform". Đồng bộ BR-GF-INVENTORY-CATALOG v17 + BR-GF-INVENTORY-RECEIPT-V2 v25 + BR-GF-INVENTORY-DELIVERY-V2 v21. |
