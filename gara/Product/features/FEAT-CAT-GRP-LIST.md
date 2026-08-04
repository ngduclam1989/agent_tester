---
type: feature
artifact_kind: feature
status: PLANNED
version: 7
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-CATALOG"
boundary: "gf-inventory"
last_reviewed: "2026-07-03"
---

# FEAT-CAT-GRP-LIST: Danh sách nhóm vật tư hàng hóa

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-LIST` |
| Title | Danh sách nhóm vật tư hàng hóa |
| Parent Epic | `EP-INVENTORY-CATALOG` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách nhóm vật tư hàng hóa dưới dạng danh sách trải phẳng có phân trang với tìm kiếm và bộ lọc, **so that** tôi có thể tra cứu, điều hướng và quản lý phân loại vật tư của garage.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị danh sách

- [ ] **AC-1**: Mở màn hình danh sách nhóm vật tư hàng hóa
  - Tại: tab **"Nhóm vật tư hàng hóa"** trong khu vực danh mục.
  - Khi: chủ garage truy cập tab.
  - Thì: hệ thống hiển thị màn hình **"Danh sách Nhóm vật tư hàng hóa"** với thanh tìm kiếm + 2 bộ lọc, **bảng danh sách trải phẳng có phân trang** (mặc định 20 dòng/trang), và nút **"Thêm Nhóm VT/HH"**.

- [ ] **AC-2**: Cột hiển thị trong bảng
  - Tại: bảng danh sách nhóm.
  - Khi: bảng được render.
  - Thì: hệ thống hiển thị các cột: **"STT"**, **"Tên nhóm VTHH"**, **"Mã nhóm VTHH"**, **"Thuộc nhóm"**, **"Mô tả"**, **"Trạng thái"**, **"Thao tác"**.

- [ ] **AC-3**: Hiển thị trải phẳng — quan hệ cha–con thể hiện qua cột "Thuộc nhóm"
  - Tại: bảng danh sách nhóm.
  - Khi: danh sách có nhóm cha và nhóm con.
  - Thì: hệ thống hiển thị **trải phẳng** — mỗi nhóm trên một dòng độc lập, **KHÔNG** thụt lề theo cấp, **KHÔNG** có biểu tượng expand/collapse. Quan hệ phân cấp thể hiện qua cột **"Thuộc nhóm"**: nhóm gốc **để trống** cột này; nhóm con/cháu hiển thị **tên nhóm cha trực tiếp** (chỉ 1 cấp — KHÔNG breadcrumb đầy đủ, dù cấu trúc có thể đa tầng). Bảng có **phân trang** ở chân (mặc định 20 dòng/trang, cho phép chọn lại số dòng/trang).

- [ ] **AC-3b**: Thứ tự sắp xếp mặc định — grouped theo nhánh cây (DFS pre-order)
  - Tại: bảng danh sách nhóm.
  - Khi: bảng được render **KHÔNG** kèm tìm kiếm (AC-4) / lọc trạng thái (AC-5) — hiển thị đầy đủ tập nhóm của garage.
  - Thì: hệ thống sắp xếp bản ghi theo **DFS pre-order theo nhánh cây**:
    - **Nhóm gốc** (`parent_id` NULL) sắp xếp theo `created_at DESC` — nhóm gốc mới nhất lên đầu.
    - **Ngay dưới mỗi nhóm gốc**, toàn bộ con / cháu thuộc **cây con** của nhóm gốc đó xếp liền kề — **KHÔNG** interleave sang cây khác (áp dụng cho cấu trúc **đa tầng ≥ 3 cấp**).
    - **Siblings** (các nhóm có cùng cha trực tiếp): sắp xếp theo `created_at DESC` (bản ghi mới nhất trước).
  - Cột **"STT"** đánh số liên tục theo thứ tự đã sắp xếp trong toàn bộ tập kết quả (không reset theo trang).

- [ ] **AC-3c**: Thứ tự sắp xếp khi có tìm kiếm hoặc bộ lọc
  - Tại: bảng danh sách nhóm.
  - Khi: chủ garage áp dụng **tìm kiếm** (AC-4) hoặc **lọc trạng thái** (AC-5).
  - Thì: hệ thống **bỏ grouping cây**, sắp xếp toàn bộ dòng khớp theo `created_at DESC` thuần (mới nhất trước) — **KHÔNG** kéo nhóm cha lên nếu chỉ con/cháu khớp (xem EC-5). Khi user xóa hết điều kiện, danh sách quay về grouped DFS mặc định (AC-3b).
  - Trường hợp **lọc "Thuộc nhóm"** (AC-6): hệ thống chỉ trả về các con/cháu thuộc **cây con** của nhóm cha đã chọn — vẫn giữ **grouped DFS trong phạm vi subtree** đó (siblings DESC theo `created_at`).

### Nhóm B — Tìm kiếm & lọc

- [ ] **AC-4**: Tìm kiếm theo mã/tên nhóm
  - Tại: ô tìm kiếm, placeholder **"Tìm theo mã nhóm, tên nhóm"**.
  - Khi: chủ garage nhập từ khóa.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp tương đối (LIKE) trên **mã nhóm** hoặc **tên nhóm**.

- [ ] **AC-5**: Lọc theo trạng thái
  - Tại: bộ lọc trạng thái.
  - Khi: chủ garage chọn giá trị lọc.
  - Thì: hệ thống cung cấp 3 lựa chọn: **"Tất cả"**, **"Đang hoạt động"** (mặc định), **"Ngừng hoạt động"** — và lọc danh sách tương ứng.

- [ ] **AC-6**: Lọc theo nhóm cha
  - Tại: bộ lọc **"Thuộc nhóm"**.
  - Khi: chủ garage chọn một nhóm cha.
  - Thì: hệ thống hiển thị các nhóm thuộc nhóm cha đã chọn. Chỉ chọn được một nhóm cha tại một thời điểm.

### Nhóm C — Thao tác trên dòng

- [ ] **AC-7**: Nút thao tác theo dòng
  - Tại: cột **"Thao tác"** trên mỗi dòng nhóm.
  - Khi: bảng được render.
  - Thì: hệ thống hiển thị 3 icon: **Xem** (→ `FEAT-CAT-GRP-DETAIL`), **Sửa** (→ `FEAT-CAT-GRP-EDIT`), **Xóa** (→ `FEAT-CAT-GRP-DELETE`).

- [ ] **AC-8**: Mở form thêm nhóm
  - Tại: nút **"Thêm Nhóm VT/HH"** ở góc trên bên phải.
  - Khi: chủ garage nhấn nút.
  - Thì: hệ thống mở form thêm nhóm vật tư hàng hóa (`FEAT-CAT-GRP-CREATE`).

### Nhóm D — Phân quyền

- [ ] **AC-9**: Phân quyền truy cập
  - Tại: tab **"Nhóm vật tư hàng hóa"**.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều xem được danh sách và thực hiện các thao tác (thêm/xem/sửa/xóa) với quyền ngang nhau.

### Nhóm E — Tenant isolation

- [ ] **AC-10**: Phạm vi theo garage
  - Tại: danh sách nhóm.
  - Khi: danh sách được tải.
  - Thì: hệ thống chỉ hiển thị nhóm thuộc garage hiện tại, không hiển thị nhóm của garage khác.

- [ ] **AC-11**: Phạm vi nền tảng — nhóm VTHH **đầy đủ trên web + mobile**
  - Tại: app mobile (garage-mobile) và web.
  - Khi: người dùng mở danh sách nhóm VTHH.
  - Thì: cả 2 nền tảng đều hỗ trợ **đầy đủ** thêm / sửa / xóa / tìm kiếm / xem (mobile KHÔNG bị giới hạn view-only). *(Khác với danh sách mã sản phẩm — mobile chỉ list + view.)*

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14423-88836&t=g9GrqfVRsuvDYwl3-4 |
| Figma | mobile | https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21254-52586&t=4nMPkzz6Vhf93ZCC-4 |

- Luồng: [UX-FLOW-INVENTORY-CATALOG](../ux/UX-FLOW-INVENTORY-CATALOG.md) §3.1.
- Design source: **Figma** (web + mobile — xem bảng trên).

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Lấy danh sách nhóm (trải phẳng, có phân trang) + filter: Query `[PROPOSED] ListMaterialGroups` — response trả về parent_id / parent_name để client hiển thị cột "Thuộc nhóm".

## 5. Business Rules

- **BR-CAT-GRP-005**: Cấu trúc phân cấp đa tầng (cha–con) qua trường "Thuộc nhóm".
- **BR-CAT-GRP-006**: Trạng thái có 2 giá trị "Đang hoạt động" / "Ngừng hoạt động".
- **BR-CAT-GRP-013**: Tenant isolation + tìm kiếm LIKE trên mã + tên nhóm.

## 6. Edge Cases

- **EC-1**: Garage **chưa có nhóm nào** (mới khởi tạo) → vùng danh sách hiển thị **empty state**: icon placeholder + text **"Không có dữ liệu"** ở giữa. **Vẫn hiển thị** thanh tìm kiếm, bộ lọc và nút **"Thêm Nhóm VT/HH"** (để tạo nhóm đầu tiên). Đây **không phải lỗi** (display `EMPTY_STATE`).
- **EC-2**: Bộ lọc "Đang hoạt động" (mặc định) ẩn các nhóm "Ngừng hoạt động"; chọn "Tất cả" để xem toàn bộ.
- **EC-3**: Nhóm con "Ngừng hoạt động" do cascade từ nhóm cha vẫn hiển thị trạng thái ngừng tương ứng.
- **EC-4**: Garage **có nhóm** nhưng **tìm kiếm / bộ lọc không khớp dòng nào** → empty state với text **"Không tìm thấy kết quả phù hợp"** (phân biệt với EC-1). Giữ nguyên thanh tìm kiếm + bộ lọc để người dùng điều chỉnh/xóa điều kiện.
- **EC-5**: Khi tìm kiếm / lọc trạng thái khớp một nhóm **con hoặc cháu** nhưng **KHÔNG** khớp nhóm cha, hệ thống **KHÔNG** kéo nhóm cha lên list — chỉ hiển thị dòng khớp (search thuần, đồng bộ pattern `FEAT-CAT-PROD-LIST`). Nếu cần thấy grouping cha–con, user xóa điều kiện để về grouped DFS mặc định (AC-3b).

## 7. Out of Scope

- Tạo nhóm mới → xem `FEAT-CAT-GRP-CREATE`.
- Xem chi tiết nhóm → xem `FEAT-CAT-GRP-DETAIL`.
- Chỉnh sửa nhóm → xem `FEAT-CAT-GRP-EDIT`.
- Xóa nhóm → xem `FEAT-CAT-GRP-DELETE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-CAT-GRP-LIST (mới) — danh sách nhóm VTHH dạng cây phân cấp, tìm kiếm LIKE, lọc trạng thái (Tất cả/Đang/Ngừng) + lọc nhóm cha. |
| 2026-06-24 | 2 | Business Authority | Gắn **Figma web + mobile** vào §3 (web GMS-v.3 node `14423-88836`, mobile App-Garage-V3 node `21254-52586`). Nguồn authoritative cho registry figma-links (wave 03 sync). |
| 2026-06-24 | 3 | Business Authority | Thêm **AC-11 phạm vi nền tảng** (BA làm rõ rà soát wave 3): nhóm VTHH hỗ trợ **đầy đủ thêm/sửa/xóa/list/view trên cả web + mobile** (mobile KHÔNG view-only — khác danh sách mã sản phẩm chỉ list+view). |
| 2026-06-24 | 4 | Business Authority | Đặc tả **empty state** (rà soát wave 3): EC-1 làm rõ màn rỗng "chưa có dữ liệu" → text **"Không có dữ liệu"** + icon + giữ tìm kiếm/lọc/nút Thêm; thêm **EC-4** màn rỗng do tìm/lọc không khớp → **"Không tìm thấy kết quả phù hợp"**. |
| 2026-06-24 | 5 | Business Authority | **Đồng bộ theo Figma** (rà soát wave 3): AC-2 thêm cột **"STT"**; placeholder "Tìm mã nhóm, tên nhóm" → **"Tìm theo mã nhóm, tên nhóm"**. (Nút "Thêm Nhóm VT/HH" đã khớp.) |
| 2026-06-26 | 6 | Business Authority | **Chuyển hiển thị từ cây phân cấp sang trải phẳng có phân trang** (theo Figma web mới): AC-1 đổi "bảng dạng cây" → "bảng trải phẳng có phân trang (20 dòng/trang mặc định)"; AC-3 viết lại — bỏ thụt lề + biểu tượng expand/collapse, quan hệ cha–con vẫn thể hiện qua cột "Thuộc nhóm" (gốc để trống, con hiển thị tên nhóm cha); User Story cập nhật tương ứng; §4 API note nhấn mạnh response cần parent_id/parent_name để render cột "Thuộc nhóm". BR-CAT-GRP-005 (cấu trúc cha–con) giữ nguyên — chỉ thay đổi cách render, KHÔNG thay đổi mô hình dữ liệu. |
| 2026-07-03 | 7 | Business Authority | Bổ sung **sort rule grouped theo nhánh cây**: thêm **AC-3b** (default DFS pre-order — nhóm gốc `created_at DESC`, con/cháu liền kề dưới cây con, siblings DESC; hỗ trợ đa tầng ≥ 3 cấp; STT liên tục toàn tập kết quả); thêm **AC-3c** (khi search / lọc trạng thái: bỏ grouping, sort `created_at DESC` thuần; lọc "Thuộc nhóm" vẫn giữ grouped DFS trong subtree); thêm **EC-5** (search/filter khớp con/cháu KHÔNG kéo cha lên). AC-3 làm rõ cột "Thuộc nhóm" chỉ show cha trực tiếp 1 cấp — KHÔNG breadcrumb đầy đủ (nhất quán với đa tầng). |
