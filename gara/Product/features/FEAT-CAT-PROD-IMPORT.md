---
type: feature
artifact_kind: feature
status: PLANNED
version: 12
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-CATALOG"
boundary: "gf-inventory"
last_reviewed: "2026-07-02"
---

# FEAT-CAT-PROD-IMPORT: Import danh mục mã sản phẩm nội bộ

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-IMPORT` |
| Title | Import danh mục mã sản phẩm nội bộ |
| Parent Epic | `EP-INVENTORY-CATALOG` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** import danh mục mã sản phẩm nội bộ từ file mẫu với bước kiểm tra dữ liệu trước khi ghi, **so that** tôi tạo nhanh nhiều mã sản phẩm và tránh ghi dữ liệu lỗi.

## 2. Acceptance Criteria

### Nhóm A — Bước 1: Tải template

- [ ] **AC-1**: Mở wizard import
  - Tại: danh sách mã sản phẩm, nút **"Tải lên"**.
  - Khi: chủ garage nhấn nút.
  - Thì: hệ thống mở màn **"Import danh mục Mã sản phẩm nội bộ"** với mô tả **"Tạo nhanh danh mục từ file mẫu, có preview trước khi ghi dữ liệu."**, gồm 2 bước: **"Tải Template"** → **"Kiểm tra dữ liệu"**, và nút **"Đóng"**.

- [ ] **AC-2**: Tải template mẫu
  - Tại: bước **"Tải Template"**, nút **"Tải template"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống tải file template `.xlsx` gồm **4 tab**:
    - **Tab "Import Mã nội bộ"** (tab nhập liệu chính) — cột: **STT, Mã nội bộ \*, Tên sản phẩm \*, ĐVT \*, Thương hiệu, Xuất xứ, Tính chất, Nhóm sản phẩm, Quy cách sản phẩm**. Dòng hướng dẫn (dòng 2) ghi hint: "Nhập tên ĐVT", "Nhập mã xuất xứ tham chiếu Tab Xuất xứ bên cạnh", "Nhập mã tính chất tham chiếu Tab tính chất bên cạnh".
    - **Tab "Xuất xứ"** (tham chiếu) — cột: STT, Mã, Tên xuất xứ. Liệt kê danh mục xuất xứ master (VN, CN, JP, KR…).
    - **Tab "Tính chất"** (tham chiếu) — liệt kê 4 giá trị hợp lệ (Vật tư hàng hóa, CCDC, Dịch vụ, Khác — **BR-CAT-PROD-019**).
    - **Tab "ĐVT"** (tham chiếu) — liệt kê danh mục đơn vị tính master.
  - Lưu ý: template import **không có cột "phương pháp tính giá"** — mọi mã nhập luôn nhận mặc định **"Bình quân cuối kỳ"** (field khóa theo **BR-CAT-PROD-010**); cột này chỉ còn ở template **export** (xem **FEAT-CAT-PROD-EXPORT** / **BR-CAT-PROD-018**). Giá trị **tính chất** ngoài 4 giá trị hợp lệ → đánh dấu dòng lỗi `ERR-INV-012`.
  - Lưu ý cột template: cột **"STT"** là số thứ tự dòng (chỉ hiển thị, không phải dữ liệu nghiệp vụ — không bắt buộc nhập). Các cột **ĐVT**, **nhóm sản phẩm**, **xuất xứ** phải **khớp danh mục master** (xem AC-5 + BR-CAT-PROD-021/022/023); **thương hiệu** nhập tay (không validate danh mục). 3 tab tham chiếu (Xuất xứ, Tính chất, ĐVT) giúp user tra cứu giá trị hợp lệ ngay trong file — **nhóm sản phẩm** không có tab tham chiếu vì mỗi garage có danh mục riêng.

- [ ] **AC-3b**: Kiểm tra cấp file (trước khi preview từng dòng)
  - Tại: bước chọn file.
  - Khi: file **không phải `.xlsx`** hoặc **không đọc được**.
  - Thì: hệ thống báo lỗi định dạng, **không chuyển** sang bước kiểm tra dữ liệu.
  - Khi: file hợp lệ nhưng **không có dòng dữ liệu nào** (file rỗng).
  - Thì: hệ thống báo **"File không có dữ liệu"**, không cho xác nhận import.
  - Khi: file có **> 500 dòng dữ liệu**.
  - Thì: hệ thống **từ chối toàn bộ lần import ngay ở bước kiểm tra** (không ghi dòng nào), báo mã lỗi **`ERR-INV-041`** ("Vượt giới hạn 500 dòng/lần — vui lòng tách file"). Áp dụng ở cả tầng kiểm tra lẫn ghi (**BR-CAT-PROD-020**).

- [ ] **AC-3**: Chọn file import
  - Tại: vùng kéo thả file.
  - Khi: chủ garage kéo thả hoặc nhấn chọn file.
  - Thì: hệ thống nhận file và chuyển sang bước **"Kiểm tra dữ liệu"**. Hệ thống **không ghi dữ liệu** ở bước tải file — bắt buộc đi qua bước kiểm tra.

### Nhóm B — Bước 2: Kiểm tra dữ liệu (preview)

- [ ] **AC-4**: Hiển thị tổng quan kiểm tra
  - Tại: bước **"Kiểm tra dữ liệu"**.
  - Khi: file được phân tích.
  - Thì: hệ thống hiển thị 3 chỉ số: **Tổng dòng**, **Hợp lệ**, **Lỗi**; bảng preview từng dòng với cột **"Trạng thái"** (Hợp lệ / Lỗi) và **"Lý do lỗi"**; phân trang.

- [ ] **AC-5**: Đánh dấu dòng lỗi (validate từng dòng)
  - Tại: bảng preview.
  - Khi: mã nội bộ **trùng** mã đã tồn tại trong garage → dòng **"Lỗi"**, lý do **"Mã nội bộ đã tồn tại"** (`ERR-INV-007`, BR-CAT-PROD-003).
  - Khi: dòng **thiếu trường bắt buộc** (mã nội bộ, tên sản phẩm, ĐVT) → dòng **"Lỗi"** lý do tương ứng (BR-CAT-PROD-005).
  - Khi: mã nội bộ (sau auto trim khoảng trắng đầu + cuối) chứa **ký tự ngoài whitelist** (chỉ chấp nhận `A-Z a-z 0-9 - _ . / ( )` + khoảng trắng ở giữa) hoặc **vượt 50 ký tự** (sau trim) → dòng **"Lỗi"** (`ERR-INV-006`, BR-CAT-PROD-002).
  - Khi: **ĐVT** trong file **không khớp** danh mục đơn vị tính master → dòng **"Lỗi"** (`ERR-INV-042`, BR-CAT-PROD-021).
  - Khi: **nhóm vật tư/hàng hóa** trong file **không tồn tại** hoặc đang **"Ngừng hoạt động"** → dòng **"Lỗi"** (`ERR-INV-043`, BR-CAT-PROD-022). *(Bỏ trống nhóm = hợp lệ.)*
  - Khi: **xuất xứ** trong file (nếu có) **không khớp** danh mục xuất xứ master → dòng **"Lỗi"** (`ERR-INV-044`, BR-CAT-PROD-023). *(Thương hiệu nhập tay — không validate.)*
  - Khi: **tính chất** ngoài 4 giá trị hợp lệ → dòng **"Lỗi"** (`ERR-INV-012`, BR-CAT-PROD-019).
  - Thì: mỗi dòng lỗi hiển thị **"Lý do lỗi"** rõ ràng; nhiều lỗi trên một dòng → gộp lý do.

- [ ] **AC-6**: Xác nhận import
  - Tại: bước kiểm tra, nút **"Xác nhận import"**.
  - Khi: chủ garage xác nhận.
  - Thì: hệ thống **chỉ ghi các dòng hợp lệ** (tạo mới), bỏ qua dòng lỗi. Import **chỉ tạo mới** (không cập nhật mã đã có). Chỉ ghi nhóm trường **"Thông tin chung"** (không gồm SKU, ĐVT quy đổi, ảnh, tệp đính kèm).

- [ ] **AC-7**: Quay lại
  - Tại: bước kiểm tra, nút **"Quay lại"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống quay về bước tải file để chọn file khác.

### Nhóm C — Kết quả import

- [ ] **AC-8**: Màn kết quả
  - Tại: sau khi xác nhận import.
  - Khi: import hoàn tất.
  - Thì: hệ thống hiển thị màn **"Kết quả import danh mục"** với các chỉ số: **Tạo mới**, **Cập nhật** (luôn 0 vì không hỗ trợ cập nhật), **Bỏ qua/lỗi**, **Thời gian**; nút **"Tải file lỗi"** và **"Đóng"**.

- [ ] **AC-9**: Tải file lỗi
  - Tại: màn kết quả, nút **"Tải file lỗi"**.
  - Khi: có dòng bị bỏ qua/lỗi.
  - Thì: hệ thống cho tải file chứa các dòng lỗi kèm lý do để chủ garage sửa và import lại.

### Nhóm D — Phân quyền

- [ ] **AC-10**: Phân quyền import
  - Tại: danh sách mã sản phẩm.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò import được với quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87154&t=fE3MKR6uAHS9vkKm-4 |
| Template (.xlsx) | import | [cat-prod-import-template.xlsx](../ux/assets/cat-prod-import-template.xlsx) |

- Luồng: [UX-FLOW-INVENTORY-CATALOG](../ux/UX-FLOW-INVENTORY-CATALOG.md) §3.2, EC-7.
- Design source: **Figma** (web — xem bảng trên). Mobile: không thuộc phạm vi (web-only).
- File mẫu template import (**AC-2** "Tải template"): [`ux/assets/cat-prod-import-template.xlsx`](../ux/assets/cat-prod-import-template.xlsx) — bản tham chiếu **chuẩn cột + tab tham chiếu** trong design repo; file production user tải về do **garage-web** serve (ADR-018). Template gồm **4 tab**: tab nhập liệu "Import Mã nội bộ" + 3 tab tham chiếu (Xuất xứ, Tính chất, ĐVT). Template import KHÔNG có cột "Trạng thái" — mã mới mặc định **"Đang hoạt động"** (BR-CAT-PROD-001). KHÔNG có cột "Thông số kỹ thuật" — bỏ từ v12.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Tải template: endpoint `[PROPOSED] DownloadInternalProductTemplate`.
- Kiểm tra dữ liệu (preview): Mutation `[PROPOSED] ValidateInternalProductImport`.
- Xác nhận import: Mutation `[PROPOSED] ConfirmInternalProductImport`.

## 5. Business Rules

- **BR-CAT-PROD-002/003/005**: validate mã (whitelist ký tự + auto trim + max 50 / unique / trường bắt buộc).
- **BR-CAT-PROD-017**: Import chỉ thêm mới, mã trùng → lỗi "Mã nội bộ đã tồn tại"; chỉ ghi "Thông tin chung"; bắt buộc qua bước kiểm tra; template `.xlsx`.
- **BR-CAT-PROD-019**: Tính chất ngoài 4 giá trị → `ERR-INV-012`.
- **BR-CAT-PROD-020**: Import ≤ **500 dòng/lần**; vượt → từ chối toàn bộ, `ERR-INV-041` (cả tầng kiểm tra lẫn ghi).
- **BR-CAT-PROD-021**: ĐVT trong file phải khớp danh mục master → không khớp: `ERR-INV-042`.
- **BR-CAT-PROD-022**: Nhóm VTHH trong file phải tồn tại + đang hoạt động → không thỏa: `ERR-INV-043` (bỏ trống = hợp lệ).
- **BR-CAT-PROD-023**: Xuất xứ = lookup danh mục master → không khớp: `ERR-INV-044`. Thương hiệu = nhập tay (không validate).

## 6. Edge Cases

- **EC-1**: File có cả dòng hợp lệ và dòng lỗi → ghi dòng hợp lệ, bỏ qua dòng lỗi, báo cáo ở màn kết quả.
- **EC-2**: Toàn bộ dòng lỗi → không ghi dòng nào; cho tải file lỗi.
- **EC-3**: Trùng mã nội bộ ngay trong cùng file import → các dòng trùng nhau (sau dòng đầu) bị đánh dấu lỗi.

## 7. Out of Scope

- Cập nhật mã sản phẩm qua import → không hỗ trợ (chỉ thêm mới).
- Import SKU / ĐVT quy đổi / ảnh / tệp đính kèm → không hỗ trợ (khai thủ công ở chi tiết).
- Export → xem `FEAT-CAT-PROD-EXPORT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-CAT-PROD-IMPORT (mới) — wizard 2 bước (Tải template → Kiểm tra dữ liệu) + màn kết quả; chỉ thêm mới, mã trùng báo lỗi, chỉ ghi Thông tin chung, template .xlsx, tải file lỗi. |
| 2026-06-16 | 2 | Business Authority | Theo quyết định BA: làm rõ AC-2 — cột "phương pháp tính giá" **bị bỏ qua khi import** (luôn "Bình quân cuối kỳ", BR-017/010); cột "tính chất" validate theo enum BR-CAT-PROD-019 (lỗi `PRODUCT_NATURE_INVALID`). |
| 2026-06-16 | 3 | Business Authority | Theo quyết định BA: đổi tên cột template "nhóm sản phẩm" → **"nhóm vật tư/hàng hóa"** (đồng bộ BR-CAT-PROD-018 + tên thực thể). |
| 2026-06-16 | 4 | Business Authority | Đăng ký mã lỗi: đổi mã bare → ERR-INV-NNN (ERROR-CODE-REGISTRY §4). |
| 2026-06-24 | 5 | Business Authority | Theo quyết định BA: **bỏ cột "phương pháp tính giá" khỏi template import** (trước đây giữ để khớp export nhưng bị bỏ qua khi import). AC-2: gỡ cột khỏi danh sách + sửa Lưu ý (mọi mã vẫn default "Bình quân cuối kỳ" per BR-CAT-PROD-010). Cột vẫn **giữ ở template export** (FEAT-CAT-PROD-EXPORT). Đồng bộ BR-CAT-PROD-017. |
| 2026-06-24 | 6 | Business Authority | Gắn **Figma web** vào §3 UI/UX Reference (node `14146-87154`, file GMS-v.3); Mobile **web-only** (không làm). Nguồn authoritative cho registry figma-links (wave 03 sync). |
| 2026-06-24 | 7 | Business Authority | Gắn **file mẫu template import** `ux/assets/cat-prod-import-template.xlsx` vào §3 (bản tham chiếu chuẩn cột; production serve ở garage-web per ADR-018). **Flag lệch**: file dùng cột "Nhóm sản phẩm" thay vì canonical "Nhóm vật tư/hàng hóa" (BR-CAT-PROD-018) — chờ BA chốt. |
| 2026-06-24 | 8 | Business Authority | **Xử lý flag (BA chốt option B)**: sửa file Excel `cat-prod-import-template.xlsx` đổi cột "Nhóm sản phẩm" → **"Nhóm vật tư/hàng hóa"** (khớp canonical). Cập nhật §3 note: gỡ flag, ghi rõ import không có cột Trạng thái — mã mới mặc định "Đang hoạt động" (BR-CAT-PROD-001). |
| 2026-06-24 | 9 | Business Authority | **Lấp lỗ hổng rà soát wave 3**: (a) thêm **AC-3b** kiểm tra cấp file — sai định dạng (không `.xlsx`), file rỗng, **>500 dòng → `ERR-INV-041`** (BR-CAT-PROD-020); (b) mở rộng **AC-5** thêm 3 loại dòng lỗi: ĐVT không khớp master (`ERR-INV-042`), nhóm không tồn tại/ngừng (`ERR-INV-043`), xuất xứ không khớp (`ERR-INV-044`) + ký tự đặc biệt (`ERR-INV-006`); (c) AC-2 note cột STT + master-validate; (d) §5 bổ sung BR-020..023. Đồng bộ ERROR-CODE-REGISTRY v13 + BR-GF-INVENTORY-CATALOG v12. |
| 2026-06-24 | 10 | Business Authority | **Đồng bộ tên nút theo Figma** (rà soát wave 3): nút entry "Import" → **"Tải lên"** (AC-1) cho khớp nút trên danh sách. *(Nút trong wizard import chưa có screenshot Figma — giữ nguyên, chờ đối chiếu.)* |
| 2026-07-02 | 11 | Business Authority | **Đồng bộ validate mã nội bộ theo BR-CAT-PROD-002 v19 (blacklist → whitelist)**: AC-5 đổi "ký tự đặc biệt" → "ký tự ngoài whitelist (`A-Z a-z 0-9 - _ . / ( )` + khoảng trắng ở giữa)" + thêm validate **auto trim** + **max 50 ký tự** (sau trim). §5 sync wording BR-CAT-PROD-002. Đồng bộ BR-GF-INVENTORY-CATALOG v19 + FEAT-CAT-PROD-CREATE v13. |
| 2026-07-02 | 12 | Business Authority | **Template import multi-tab** (BA cập nhật file mẫu): thay file `cat-prod-import-template.xlsx` — từ 1 tab → **4 tab**: tab nhập liệu "Import Mã nội bộ" (9 cột, bỏ cột "Thông số kỹ thuật") + 3 tab tham chiếu (**Xuất xứ** — mã + tên, **Tính chất** — 4 giá trị, **ĐVT** — danh mục master). AC-2 rewrite mô tả cấu trúc 4 tab + dòng hint hướng dẫn. §3 note cập nhật. Mục đích: user tra cứu giá trị hợp lệ ngay trong file, giảm lỗi nhập liệu. |
