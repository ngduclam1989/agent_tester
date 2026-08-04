---
type: feature
artifact_kind: feature
status: PLANNED
version: 8
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-CATALOG"
boundary: "gf-inventory"
last_reviewed: "2026-06-25"
---

# FEAT-CAT-PROD-EXPORT: Export danh mục mã sản phẩm nội bộ

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-EXPORT` |
| Title | Export danh mục mã sản phẩm nội bộ |
| Parent Epic | `EP-INVENTORY-CATALOG` |
| Boundary | `gf-inventory` |
| Priority | P2 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xuất danh mục mã sản phẩm nội bộ ra file Excel theo bộ lọc hiện tại, **so that** tôi có dữ liệu để tra cứu ngoài hệ thống hoặc chuẩn bị cho import lần sau.

## 2. Acceptance Criteria

### Nhóm A — Export

- [ ] **AC-1**: Xuất file theo bộ lọc hiện tại
  - Tại: danh sách mã sản phẩm nội bộ, nút **"Xuất file"**.
  - Khi: chủ garage nhấn nút.
  - Thì: hệ thống xuất file `.xlsx` chứa các mã sản phẩm **đang hiển thị theo bộ lọc/tìm kiếm hiện tại** (trạng thái / tính chất / nhóm hàng / từ khóa).

- [ ] **AC-2**: Cột trong file export
  - Tại: file `.xlsx` xuất ra.
  - Khi: file được tạo.
  - Thì: hệ thống xuất các cột: **mã nội bộ, tên sản phẩm, ĐVT, phương pháp tính giá, thương hiệu, xuất xứ, tính chất, nhóm vật tư/hàng hóa, quy cách sản phẩm, thông số kỹ thuật, trạng thái**.
  - Lưu ý: bộ cột export = các cột template import **cộng thêm 2 cột chỉ có ở export**: **"phương pháp tính giá"** + **"trạng thái"** (giá trị **"Đang hoạt động" / "Ngừng hoạt động"** theo **BR-CAT-PROD-007**). Import KHÔNG có 2 cột này — mã mới mặc định trạng thái **"Đang hoạt động"** (BR-CAT-PROD-001) + phương pháp tính giá **"Bình quân cuối kỳ"** (BR-CAT-PROD-010). Xem **FEAT-CAT-PROD-IMPORT** AC-2 / **BR-CAT-PROD-017**.

- [ ] **AC-3**: Không có bộ lọc
  - Tại: nút **"Xuất file"**.
  - Khi: không áp bộ lọc nào (mặc định lọc "Đang hoạt động").
  - Thì: hệ thống xuất theo phạm vi bộ lọc mặc định đang áp trên danh sách.

### Nhóm B — Phân quyền & tenant

- [ ] **AC-4**: Phân quyền và phạm vi garage
  - Tại: danh sách mã sản phẩm.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò export được với quyền ngang nhau; file chỉ chứa mã sản phẩm thuộc garage hiện tại.

### Nhóm C — Giới hạn dung lượng

- [ ] **AC-5**: Giới hạn 1.000 dòng/lần xuất
  - Tại: danh sách mã sản phẩm nội bộ, nút **"Xuất file"**.
  - Khi: chủ garage / kế toán nhấn nút, hệ thống đếm số mã khớp bộ lọc hiện tại **trước** khi sinh file.
  - Thì:
    - Nếu **≤ 1.000 dòng** → xuất `.xlsx` bình thường (AC-1, AC-2).
    - Nếu **> 1.000 dòng** → **không sinh file**, hiển thị cảnh báo mã **`ERR-INV-045`**: **"Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại"** (gợi ý người dùng dùng bộ lọc trạng thái / tính chất / nhóm vật tư/hàng hóa / từ khóa để thu hẹp).
  - Tham chiếu: **BR-CAT-PROD-024**.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Template (.xlsx) | export | [cat-prod-export-template.xlsx](../ux/assets/cat-prod-export-template.xlsx) |

- Luồng: [UX-FLOW-INVENTORY-CATALOG](../ux/UX-FLOW-INVENTORY-CATALOG.md) §3.2.
- File mẫu export (**AC-2** bộ cột xuất): [`ux/assets/cat-prod-export-template.xlsx`](../ux/assets/cat-prod-export-template.xlsx) — bản tham chiếu **chuẩn cột**; file production do **garage-web** serve. Bộ cột = cột template import **+ "Phương pháp tính giá" + "Trạng thái"** (2 cột chỉ có ở export — BA chốt giữ cột Trạng thái). Cột nhóm đã chuẩn hóa **"Nhóm vật tư/hàng hóa"** (đồng bộ BR-CAT-PROD-018).

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Export danh mục: endpoint `[PROPOSED] ExportInternalProducts` (nhận tham số filter hiện tại).

## 5. Business Rules

- **BR-CAT-PROD-018**: Export theo bộ lọc hiện tại, gồm các cột template import **cộng thêm 2 cột chỉ có ở export**: **"phương pháp tính giá"** + **"trạng thái"** (Đang/Ngừng hoạt động), định dạng `.xlsx`.
- **BR-CAT-PROD-024**: Mỗi lần xuất tối đa **1.000 dòng**. Vượt → chặn sinh file, cảnh báo mã **`ERR-INV-045`**, yêu cầu người dùng áp dụng thêm bộ lọc rồi xuất lại.

## 6. Edge Cases

- **EC-1**: Bộ lọc không khớp mã nào → file xuất chỉ có dòng tiêu đề (không có dữ liệu).
- **EC-2**: Kết quả khớp bộ lọc **> 1.000 dòng** → hệ thống **không sinh file**, hiển thị cảnh báo `ERR-INV-045` ("Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại"). Người dùng dùng các bộ lọc sẵn có (trạng thái / tính chất / nhóm vật tư/hàng hóa / từ khóa) thu hẹp rồi nhấn lại nút "Xuất file". Xem **BR-CAT-PROD-024** + **AC-5**.

## 7. Out of Scope

- Export kèm SKU / ĐVT quy đổi / ảnh / tệp đính kèm → không bao gồm (chỉ "Thông tin chung").
- Import → xem `FEAT-CAT-PROD-IMPORT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-CAT-PROD-EXPORT (mới) — xuất `.xlsx` theo bộ lọc hiện tại, 10 cột giống template import. |
| 2026-06-16 | 2 | Business Authority | Theo quyết định BA: đổi tên cột "nhóm sản phẩm" → **"nhóm vật tư/hàng hóa"** (đồng bộ BR-CAT-PROD-018 + template import). |
| 2026-06-24 | 3 | Business Authority | Theo quyết định BA: template import **bỏ cột "phương pháp tính giá"** nhưng **export giữ cột này**. AC-2 + BR-CAT-PROD-018: gỡ wording "cột giống template import" → liệt kê tường minh, ghi rõ "phương pháp tính giá" chỉ có ở export. Đồng bộ FEAT-CAT-PROD-IMPORT v5 + BR-CAT-PROD-017/018. |
| 2026-06-24 | 4 | Business Authority | Gắn **file mẫu export** `ux/assets/cat-prod-export-template.xlsx` vào §3 (bản tham chiếu chuẩn cột; production serve ở garage-web). **Flag**: file có thêm cột **"Trạng thái"** (chưa có trong AC-2/BR-018) + dùng "Nhóm sản phẩm" thay vì canonical "Nhóm vật tư/hàng hóa" — chờ BA chốt. |
| 2026-06-24 | 5 | Business Authority | **Xử lý flag (BA chốt)**: (a) **hợp thức hóa cột "Trạng thái"** vào export — AC-2 + BR-CAT-PROD-018 thêm cột "trạng thái" (giá trị "Đang hoạt động"/"Ngừng hoạt động" per BR-CAT-PROD-007); export nay = cột import + "phương pháp tính giá" + "trạng thái". (b) Sửa file Excel `cat-prod-export-template.xlsx` đổi cột "Nhóm sản phẩm" → **"Nhóm vật tư/hàng hóa"**. Gỡ flag §3. |
| 2026-06-24 | 6 | Business Authority | §5 đồng bộ mô tả **BR-CAT-PROD-018** — bổ sung cột "trạng thái" (trước chỉ ghi "+ phương pháp tính giá") cho khớp AC-2 + BR v11 (rà soát wave 3). |
| 2026-06-24 | 7 | Business Authority | **Đồng bộ tên nút theo Figma** (rà soát wave 3): nút entry "Export" → **"Xuất file"** (AC-1, AC-3) cho khớp nút trên danh sách. |
| 2026-06-25 | 8 | Business Authority | **Cap 1.000 dòng/lần xuất** (BA chốt — phòng timeout / OOM khi catalog garage lớn): thêm **AC-5** (đếm trước khi sinh file; >1.000 → chặn xuất + cảnh báo `ERR-INV-045`; ≤1.000 → xuất bình thường), thêm **BR-CAT-PROD-024** vào §5, viết lại **EC-2** từ "xuất toàn bộ không giới hạn" → "chặn + cảnh báo khi >1.000 dòng". Đồng bộ BR-GF-INVENTORY-CATALOG v13 + ERROR-CODE-REGISTRY v14 (`ERR-INV-045`). |
