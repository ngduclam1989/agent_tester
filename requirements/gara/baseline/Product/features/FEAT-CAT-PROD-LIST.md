---
type: feature
artifact_kind: feature
status: PLANNED
version: 8
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-CATALOG"
boundary: "gf-inventory"
last_reviewed: "2026-07-03"
---
# FEAT-CAT-PROD-LIST: Danh sách mã sản phẩm nội bộ

---

## Metadata

| Field       | Value                              |
| ----------- | ---------------------------------- |
| Feature ID  | `FEAT-CAT-PROD-LIST`             |
| Title       | Danh sách mã sản phẩm nội bộ |
| Parent Epic | `EP-INVENTORY-CATALOG`           |
| Boundary    | `gf-inventory`                   |
| Priority    | P1                                 |
| Status      | PLANNED                            |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách mã sản phẩm nội bộ với tìm kiếm, bộ lọc và phân trang, **so that** tôi tra cứu nhanh mã chuẩn dùng để tính tồn và mapping SKU, đồng thời truy cập các thao tác quản lý.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị danh sách

- [ ] **AC-1**: Mở màn hình danh sách

  - Tại: tab **"Danh sách sản phẩm"** trong khu vực danh mục.
  - Khi: chủ garage truy cập tab.
  - Thì: hệ thống hiển thị màn **"Danh sách sản phẩm"** với mô tả **"Quản lý mã chuẩn dùng để tính tồn và mapping SKU."**, thanh tìm kiếm + 3 bộ lọc, bảng danh sách, phân trang, và các nút **"Thêm sản phẩm"**, **"Tải lên"** (import), **"Xuất file"** (export).
- [ ] **AC-2**: Cột hiển thị trong bảng

  - Tại: bảng danh sách.
  - Khi: bảng được render.
  - Thì: hệ thống hiển thị các cột: **"STT"**, **"Mã sản phẩm nội bộ"**, **"Tên sản phẩm"**, **"Tính chất"**, **"Nhóm vật tư/hàng hóa"**, **"ĐVT chính"**, **"Thương hiệu"**, **"Xuất xứ"**, **"Trạng thái"**, **"Thao tác"**.
- [ ] **AC-2b**: Thứ tự sắp xếp mặc định

  - Tại: bảng danh sách.
  - Khi: bảng được render lần đầu hoặc sau khi áp dụng tìm kiếm / bộ lọc (chưa có sort thủ công của user).
  - Thì: hệ thống sắp xếp bản ghi theo **thời gian tạo giảm dần (mới nhất trước)** — bản ghi vừa **Thêm sản phẩm** / **Tải lên** xuất hiện ở đầu danh sách. Thứ tự này giữ nguyên xuyên suốt các trang khi phân trang. Cột **"STT"** đánh số liên tục theo thứ tự đã sắp xếp trong toàn bộ tập kết quả (không reset theo trang).

### Nhóm B — Tìm kiếm & lọc

- [ ] **AC-3**: Tìm kiếm

  - Tại: ô tìm kiếm, placeholder **"Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết"**.
  - Khi: chủ garage nhập từ khóa.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp tương đối (LIKE) trên **mã nội bộ**, **tên sản phẩm**, hoặc **SKU liên kết**.
- [ ] **AC-4**: Lọc theo trạng thái

  - Tại: bộ lọc trạng thái.
  - Khi: chủ garage chọn giá trị.
  - Thì: hệ thống cung cấp 3 lựa chọn: **"Tất cả"**, **"Đang hoạt động"** (mặc định), **"Ngừng hoạt động"**.
- [ ] **AC-5**: Lọc theo tính chất

  - Tại: bộ lọc **"Tính chất"** — 4 giá trị: **Vật tư hàng hóa**, **CCDC**, **Dịch vụ**, **Khác** (xem **BR-CAT-PROD-019**).
  - Khi: chủ garage chọn một tính chất trong 4 giá trị.
  - Thì: hệ thống lọc danh sách theo tính chất đã chọn.
- [ ] **AC-6**: Lọc theo nhóm hàng

  - Tại: bộ lọc **"Nhóm hàng"**.
  - Khi: chủ garage chọn một nhóm vật tư hàng hóa.
  - Thì: hệ thống lọc danh sách theo nhóm đã chọn.

### Nhóm C — Phân trang & thao tác

- [ ] **AC-7**: Phân trang

  - Tại: cuối bảng.
  - Khi: danh sách nhiều hơn một trang.
  - Thì: hệ thống hiển thị bộ chọn số dòng mỗi trang (mặc định **20**) và điều hướng trang (**Trước / số trang / Sau**).
- [ ] **AC-8**: Nút thao tác theo dòng và trạng thái

  - Tại: cột **"Thao tác"**.
  - Khi: bảng được render.
  - Thì: dòng **"Đang hoạt động"** hiển thị icon **Sửa** và **Xóa**; dòng **"Ngừng hoạt động"** chỉ hiển thị icon **Xem**. Nhấn vào mã sản phẩm (link) → mở chi tiết (`FEAT-CAT-PROD-DETAIL`).
- [ ] **AC-9**: Mở các chức năng từ thanh công cụ

  - Tại: thanh công cụ trên cùng.
  - Khi: chủ garage nhấn nút tương ứng.
  - Thì: **"Thêm sản phẩm"** → form tạo (`FEAT-CAT-PROD-CREATE`); **"Tải lên"** → wizard import (`FEAT-CAT-PROD-IMPORT`); **"Xuất file"** → xuất file (`FEAT-CAT-PROD-EXPORT`).

### Nhóm D — Phân quyền & tenant

- [ ] **AC-10**: Phân quyền và phạm vi garage

  - Tại: danh sách mã sản phẩm.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò xem và thao tác với quyền ngang nhau; danh sách chỉ hiển thị mã sản phẩm thuộc garage hiện tại.
- [ ] **AC-11**: Phạm vi mobile — chỉ xem (view-only)

  - Tại: app mobile (garage-mobile).
  - Khi: người dùng mở danh sách mã sản phẩm trên app.
  - Thì: app **chỉ hiển thị danh sách + tìm kiếm/lọc (xem)** — KHÔNG có nút **Thêm / Import / Export** và KHÔNG thao tác sửa/xóa. Mọi thao tác tạo/sửa/xóa/import/export chỉ thực hiện trên **web** (wave 3 mobile = view-only).

## 3. UI/UX Reference

| Kind  | Platform | URL / Path                                                                                                 |
| ----- | -------- | ---------------------------------------------------------------------------------------------------------- |
| Figma | web      | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14329-254775&t=fE3MKR6uAHS9vkKm-4      |
| Figma | mobile   | https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21254-52585&t=4nMPkzz6Vhf93ZCC-4 |

- Luồng: [UX-FLOW-INVENTORY-CATALOG](../ux/UX-FLOW-INVENTORY-CATALOG.md) §3.2.
- Design source: **Figma** (web + mobile — xem bảng trên).

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Lấy danh sách + filter + phân trang: Query `[PROPOSED] ListInternalProducts`.

## 5. Business Rules

- **BR-CAT-PROD-007**: Trạng thái 2 giá trị (badge).
- **BR-CAT-PROD-008**: Mã "Ngừng hoạt động" không dùng trong phiếu mới (danh sách chỉ cho Xem).
- **BR-CAT-CMN-003**: 2 vai trò quyền ngang nhau.

## 6. Edge Cases

- **EC-1**: Garage **chưa có mã sản phẩm nào** (mới khởi tạo) → vùng danh sách hiển thị **empty state**: icon placeholder + text **"Không có dữ liệu"** ở giữa. **Vẫn hiển thị** thanh tìm kiếm, 3 bộ lọc (trạng thái / tính chất / nhóm hàng) và các nút **"Thêm sản phẩm" / "Tải lên" / "Xuất file"**. Đây **không phải lỗi** (display `EMPTY_STATE`).
- **EC-2**: Tìm kiếm theo SKU liên kết trả về mã nội bộ có SKU khớp.
- **EC-3**: Bộ lọc "Đang hoạt động" (mặc định) ẩn mã "Ngừng hoạt động"; chọn "Tất cả" để xem toàn bộ.
- **EC-4**: Garage **có mã** nhưng **tìm kiếm / bộ lọc không khớp dòng nào** → empty state với text **"Không tìm thấy kết quả phù hợp"** (phân biệt với EC-1). Giữ nguyên thanh tìm kiếm + bộ lọc để điều chỉnh/xóa điều kiện.

## 7. Out of Scope

- Tạo mã sản phẩm → xem `FEAT-CAT-PROD-CREATE`.
- Chi tiết / gắn SKU / ĐVT quy đổi → xem `FEAT-CAT-PROD-DETAIL`.
- Import / Export → xem `FEAT-CAT-PROD-IMPORT`, `FEAT-CAT-PROD-EXPORT`.

## 8. Change Log

| Date       | Version | Author             | Description                                                                                                                                                                                                                                                                                                              |
| ---------- | ------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-06-03 | 1       | Business Authority | Khởi tạo FEAT-CAT-PROD-LIST (mới) — danh sách mã SP nội bộ: search (mã/tên/SKU liên kết), 3 bộ lọc (trạng thái/tính chất/nhóm hàng), phân trang 20/trang, thao tác theo trạng thái, nút Thêm/Import/Export.                                                                                    |
| 2026-06-16 | 2       | Business Authority | Theo quyết định BA: cụ thể hóa**AC-5 bộ lọc "Tính chất"** — 4 giá trị (Vật tư hàng hóa, CCDC, Dịch vụ, Khác), dẫn chiếu **BR-CAT-PROD-019**.                                                                                                                                           |
| 2026-06-24 | 3       | Business Authority | Gắn**Figma web** vào §3 UI/UX Reference (node `14329-254775`, file GMS-v.3) + ghi chú Mobile **chờ cấp link**. Nguồn authoritative cho registry figma-links (wave 03 sync).                                                                                                                         |
| 2026-06-24 | 4       | Business Authority | Bổ sung**Figma mobile** vào §3 (file App-Garage-V3 node `21254-52585`); gỡ ghi chú "chờ cấp link" → web + mobile đầy đủ. Re-sync registry figma-links wave 03.                                                                                                                                       |
| 2026-06-24 | 5       | Business Authority | Thêm**AC-11 mobile view-only** (BA chốt rà soát wave 3): app chỉ xem danh sách + tìm/lọc, không Thêm/Import/Export/sửa/xóa.                                                                                                                                                                            |
| 2026-06-24 | 6       | Business Authority | Đặc tả**empty state** (rà soát wave 3): EC-1 làm rõ màn rỗng "chưa có dữ liệu" → text **"Không có dữ liệu"** + icon + giữ tìm kiếm/3 bộ lọc/nút Thêm-Import-Export; thêm **EC-4** màn rỗng do tìm/lọc không khớp → **"Không tìm thấy kết quả phù hợp"**. |
| 2026-06-24 | 7       | Business Authority | **Đồng bộ tên nút theo Figma** (rà soát wave 3): "Thêm Mã sản phẩm nội bộ" → **"Thêm sản phẩm"**, "Import" → **"Tải lên"**, "Export" → **"Xuất file"** (AC-1, AC-9, EC-1).                                                                                                 |
| 2026-07-03 | 8       | Business Authority | Bổ sung **AC-2b thứ tự sắp xếp mặc định**: bản ghi hiển thị theo `created_at DESC` (mới nhất trước) — đồng bộ pattern với các list khác (booking / SO / receipt V2); STT đánh số liên tục toàn bộ tập kết quả, không reset theo trang.                                                             |
