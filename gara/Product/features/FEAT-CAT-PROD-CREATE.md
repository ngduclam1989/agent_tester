---
type: feature
artifact_kind: feature
status: PLANNED
version: 13
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-CATALOG"
boundary: "gf-inventory"
last_reviewed: "2026-07-02"
---

# FEAT-CAT-PROD-CREATE: Tạo mã sản phẩm nội bộ

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-CREATE` |
| Title | Tạo mã sản phẩm nội bộ |
| Parent Epic | `EP-INVENTORY-CATALOG` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo mã sản phẩm nội bộ mới với thông tin chung, đơn vị tính quy đổi, mã SKU và tệp đính kèm, **so that** tôi có mã chuẩn để quản lý tồn kho và mapping SKU.

## 2. Acceptance Criteria

### Nhóm A — Mở form

- [ ] **AC-1**: Mở form thêm mã sản phẩm
  - Tại: danh sách mã sản phẩm nội bộ.
  - Khi: chủ garage nhấn **"Thêm sản phẩm"**.
  - Thì: hệ thống mở form **"Thêm sản phẩm"** dạng một trang có 4 tab: **"Thông tin chung"**, **"ĐVT quy đổi"**, **"Mã SKU"**, **"Đính kèm file"**; nút **"Huỷ bỏ"** và **"Tạo"**.

- [ ] **AC-1b**: Mở form từ phiếu nhập/xuất kho (kế thừa SKU)
  - Bối cảnh: dòng phiếu **chỉ có mã SKU + tên SKU, chưa có mã nội bộ** — điển hình là **phiếu nhập "Nền tảng"** do bên mua (`gf-purchase`) đẩy sang (bên mua chỉ có SKU). Người dùng bấm **"+ Tạo mới mã nội bộ"** để tạo mã nội bộ và gắn với SKU đó.
  - Tại: form mở qua nút **"+ Tạo mới mã nội bộ"** ở dropdown dòng phiếu nhập/xuất kho (`FEAT-IR-CREATE-V2` AC-6b / `FEAT-ID-CREATE-V2` AC-5b).
  - Khi: dòng có **SKU chưa mapping mã nội bộ nào**.
  - Thì: hệ thống mở form và **gắn sẵn SKU đó vào tab "Mã SKU"** (mã SKU + tên SKU). **"Mã sản phẩm nội bộ"** và **"Tên sản phẩm"** đều **để trống — nhập tay** (không seed từ tên SKU).
  - Khi: dòng có **SKU đã mapping mã nội bộ khác** (1 SKU chỉ thuộc 1 mã — BR-CAT-PROD-013).
  - Thì: **KHÔNG** gắn sẵn SKU vào tab "Mã SKU"; form mở **trống** (coi như người dùng tạo mã nội bộ mới để gắn với **SKU khác**).
  - Khi: dòng **chưa chọn SKU**, hoặc mở từ danh mục mã sản phẩm.
  - Thì: form mở **trống** như bình thường (AC-1).

### Nhóm B — Tab Thông tin chung

- [ ] **AC-2**: Nhập mã sản phẩm nội bộ
  - Tại: trường **"Mã sản phẩm nội bộ"** (bắt buộc, có `*`).
  - Khi: chủ garage nhập mã.
  - Thì: hệ thống nhận giá trị nhập tay và **auto trim** khoảng trắng đầu + cuối. Mã **chỉ chấp nhận** chữ cái Latin không dấu (`A-Z`, `a-z`), chữ số (`0-9`), dấu gạch ngang (`-`), dấu gạch dưới (`_`), dấu chấm (`.`), dấu gạch chéo (`/`), dấu ngoặc đơn (`(` `)`), khoảng trắng ở giữa. **Tối đa 50 ký tự** (sau trim). Bỏ trống → báo lỗi yêu cầu nhập mã; ký tự ngoài whitelist (bao gồm tiếng Việt có dấu, `~ ! @ # $ % ^ & *`, emoji) → báo lỗi mã không hợp lệ (`ERR-INV-006`, theo `BR-CAT-PROD-002`).

- [ ] **AC-3**: Nhập tên sản phẩm
  - Tại: trường **"Tên sản phẩm"** (bắt buộc, có `*`).
  - Khi: chủ garage nhập tên.
  - Thì: hệ thống nhận giá trị. Bỏ trống → báo lỗi yêu cầu nhập tên.

- [ ] **AC-4**: Chọn tính chất
  - Tại: trường **"Tính chất"** (dropdown, không bắt buộc) — 4 giá trị cố định: **Vật tư hàng hóa**, **CCDC**, **Dịch vụ**, **Khác** (system-seeded, xem **BR-CAT-PROD-019**). Mặc định focus **"Vật tư hàng hóa"** khi mở form.
  - Khi: chủ garage chọn một trong 4 giá trị.
  - Thì: hệ thống nhận giá trị đã chọn; nếu để nguyên mặc định thì lưu **"Vật tư hàng hóa"**.

- [ ] **AC-5**: Chọn nhóm vật tư/hàng hóa
  - Tại: trường **"Nhóm vật tư/hàng hóa"** (dropdown, không bắt buộc).
  - Khi: chủ garage mở dropdown.
  - Thì: hệ thống chỉ hiển thị nhóm **"Đang hoạt động"** (ẩn nhóm "Ngừng hoạt động").

- [ ] **AC-6**: Chọn ĐVT chính
  - Tại: trường **"ĐVT chính"** (bắt buộc, có `*`, dropdown).
  - Khi: chủ garage mở dropdown.
  - Thì: hệ thống hiển thị danh sách đơn vị tính từ **danh mục ĐVT master** sẵn có. Bỏ trống → báo lỗi yêu cầu chọn ĐVT chính.

- [ ] **AC-7**: Chọn trạng thái
  - Tại: trường **"Trạng thái"** (dropdown).
  - Khi: form được mở.
  - Thì: trạng thái mặc định **"Đang hoạt động"**; có thể chọn **"Ngừng hoạt động"**.

- [ ] **AC-8**: Các trường thông tin bổ sung
  - Tại: tab Thông tin chung.
  - Khi: chủ garage nhập.
  - Thì: hệ thống nhận các trường không bắt buộc: **"Thương hiệu"** (text — **nhập tay**), **"Xuất xứ"** (dropdown — chọn từ **danh mục xuất xứ master**, KHÔNG nhập tự do; xem **BR-CAT-PROD-023**), **"Thông số kỹ thuật"** (text), **"Quy cách sản phẩm"** (text), **"Mô tả"** (textarea — **tối đa 500 ký tự**, vượt → `ERR-INV-046`), **"Ghi chú"** (textarea — **tối đa 500 ký tự**, vượt → `ERR-INV-046`). Xem **BR-CAT-PROD-025**.

- [ ] **AC-9**: Phương pháp tính giá
  - Tại: trường **"Phương pháp tính giá"** (dropdown).
  - Khi: form được mở.
  - Thì: hệ thống mặc định **"Bình quân cuối kỳ"** và **không cho phép sửa** (4 giá trị tồn tại cho mở rộng tương lai: Bình quân cuối kỳ / Đích danh / Nhập trước xuất trước / Bình quân tức thời).

- [ ] **AC-10**: Ảnh sản phẩm
  - Tại: ô ảnh sản phẩm.
  - Khi: chủ garage nhấn **"Chọn"** hoặc **"Link"**.
  - Thì: hệ thống cho phép tải ảnh (định dạng **jpg, png**) hoặc gắn qua link. Không bắt buộc; mặc định hiển thị **"NO PRODUCT IMAGE"**.

### Nhóm C — Tab ĐVT quy đổi

- [ ] **AC-11**: Thêm ĐVT quy đổi
  - Tại: tab **"ĐVT quy đổi"**, nút **"Thêm ĐVT quy đổi"**.
  - Khi: chủ garage nhấn nút.
  - Thì: hệ thống mở modal **"Thêm ĐVT quy đổi"** gồm **"ĐVT quy đổi"** (dropdown từ master, bắt buộc) và **"Tỷ lệ quy đổi"** (bắt buộc); nút modal **"Huỷ"** / **"Thêm"**.
  - Khi: nhập tỷ lệ ≤ 0 hoặc trùng ĐVT đã có trong cùng mã sản phẩm hoặc có quá 6 chữ số sau dấu phẩy.
  - Thì: hệ thống báo lỗi tương ứng (≤ 0 → `ERR-INV-013`; trùng ĐVT → `ERR-INV-014`; **vượt 6 chữ số thập phân → `ERR-INV-047` "Tỷ lệ quy đổi không được có quá 6 chữ số sau dấu phẩy"**), không lưu dòng.
  - Khi: nhập tỷ lệ hợp lệ (**> 0, cho phép số thập phân tối đa 6 chữ số sau dấu phẩy**) và ĐVT không trùng.
  - Thì: hệ thống thêm dòng vào bảng (cột STT / ĐVT / Tỷ lệ quy đổi / Thao tác Sửa-Xóa).

### Nhóm D — Tab Mã SKU

- [ ] **AC-12**: Gắn SKU
  - Tại: tab **"Mã SKU"**, nút **"Gắn SKU"**.
  - Khi: chủ garage nhấn nút.
  - Thì: hệ thống mở modal tìm SKU (theo SKU / tên SKU / nguồn-phân hệ) hiển thị trạng thái **"Chưa mapping"** hoặc **"Đã mapping mã khác"**. SKU **"Đã mapping mã khác"** không chọn được. Modal tiêu đề **"Gắn SKU cho [mã]"**, nút **"Huỷ"** / **"Gắn SKU"**; chọn các SKU "Chưa mapping" → **"Gắn SKU"** → thêm vào bảng (STT / SKU / Tên SKU / Thao tác Xóa).

### Nhóm E — Tab Đính kèm file

- [ ] **AC-13**: Tải tệp đính kèm
  - Tại: tab **"Đính kèm file"**.
  - Khi: chủ garage kéo thả hoặc nhấn **"Nhấn để tải lên"**.
  - Thì: hệ thống cho phép tải tối đa **5 tệp**, mỗi tệp **≤ 30 MB** (mã lỗi `ERR-CMN-004`), định dạng **PDF, JPG, PNG** (mã lỗi `ERR-CMN-005`) — theo chuẩn upload file toàn platform.

### Nhóm F — Lưu / Hủy

- [ ] **AC-14**: Lưu thành công
  - Tại: nút **"Tạo"**.
  - Khi: các trường bắt buộc (mã, tên, ĐVT chính) hợp lệ và mã không trùng trong garage.
  - Thì: hệ thống tạo mã sản phẩm với trạng thái đã chọn, lưu kèm ĐVT quy đổi / SKU / tệp đính kèm đã khai, hiển thị thông báo thành công và chuyển về danh sách hoặc chi tiết.

- [ ] **AC-15**: Trùng mã
  - Tại: trường **"Mã sản phẩm nội bộ"**, khi Lưu.
  - Khi: mã trùng mã đã có trong garage.
  - Thì: hệ thống báo lỗi mã đã tồn tại, không lưu.

- [ ] **AC-16**: Huỷ bỏ
  - Tại: nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống đóng form, không lưu, quay về danh sách.

### Nhóm G — Phân quyền

- [ ] **AC-17**: Phân quyền tạo
  - Tại: danh sách mã sản phẩm.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò tạo được với quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87151&t=fE3MKR6uAHS9vkKm-4 |

- Luồng: [UX-FLOW-INVENTORY-CATALOG](../ux/UX-FLOW-INVENTORY-CATALOG.md) §3.2, §3.3.
- Design source: **Figma** (web — xem bảng trên). Mobile: không thuộc phạm vi (web-only).

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Tạo mã sản phẩm: Mutation `[PROPOSED] CreateInternalProduct`.
- Tìm SKU chưa mapping: Query `[PROPOSED] SearchAvailableSkus`.
- Danh mục ĐVT: Query `[PROPOSED] ListUnitsOfMeasure`.

## 5. Business Rules

- **BR-CAT-PROD-001**: Khởi tạo "Đang hoạt động".
- **BR-CAT-PROD-002**: Mã không chứa ký tự đặc biệt.
- **BR-CAT-PROD-003**: Mã unique theo garage.
- **BR-CAT-PROD-005**: Bắt buộc mã + tên + ĐVT chính.
- **BR-CAT-PROD-006**: ĐVT chính từ danh mục master.
- **BR-CAT-PROD-009**: Dropdown nhóm chỉ hiển thị nhóm "Đang hoạt động".
- **BR-CAT-PROD-010**: Phương pháp tính giá mặc định "Bình quân cuối kỳ", không sửa.
- **BR-CAT-PROD-011**: ĐVT quy đổi > 0, **số thập phân tối đa 6 chữ số sau dấu phẩy**, không trùng ĐVT.
- **BR-CAT-PROD-013**: Một SKU chỉ thuộc một mã nội bộ; một mã gắn nhiều SKU.
- **BR-IRV2-027 / BR-IDV2-027**: Mở form từ phiếu nhập/xuất kho; nếu dòng có **SKU chưa mapping** → **gắn sẵn SKU vào tab "Mã SKU"** (Mã + Tên sản phẩm nội bộ đều nhập tay); SKU đã mapping mã khác → không gắn sẵn. (AC-1b)
- **BR-CAT-PROD-015**: Tệp đính kèm ≤ 5 tệp, mỗi tệp **≤ 30 MB** (ERR-CMN-004), định dạng PDF/JPG/PNG (ERR-CMN-005); ảnh jpg/png.

## 6. Edge Cases

- **EC-1**: Tạo mã ở trạng thái "Ngừng hoạt động" ngay từ đầu → không dùng được trong phiếu nhập/xuất (theo BR-CAT-PROD-008).
- **EC-2**: Không có nhóm "Đang hoạt động" nào → dropdown nhóm rỗng, mã vẫn tạo được (nhóm không bắt buộc).
- **EC-3**: Gắn SKU / khai ĐVT quy đổi ngay khi tạo là tùy chọn — có thể bổ sung sau ở màn chi tiết.
- **EC-4**: Mở từ phiếu với SKU **đã mapping mã nội bộ khác** → form **không** gắn sẵn SKU (tab "Mã SKU" trống); người dùng tạo mã mới rồi gắn **SKU khác** (1 SKU chỉ thuộc 1 mã — BR-CAT-PROD-013).

## 7. Out of Scope

- Sửa mã sản phẩm sau khi tạo → xem `FEAT-CAT-PROD-EDIT`.
- Quản lý SKU / ĐVT quy đổi sau khi tạo → xem `FEAT-CAT-PROD-DETAIL`.
- Quản lý danh mục ĐVT master, danh mục SKU gốc → ngoài phạm vi epic này.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-CAT-PROD-CREATE (mới) — form 4 tab (Thông tin chung / ĐVT quy đổi / Mã SKU / Đính kèm file); validate mã, ĐVT chính từ master, phương pháp tính giá mặc định BQ cuối kỳ khóa, gắn SKU (chặn SKU đã mapping), ĐVT quy đổi số thập phân không trùng, đính kèm ≤5 tệp (sau cập nhật v5: ≤10MB / PDF·JPG·PNG). |
| 2026-06-10 | 2 | Business Authority | Thêm **AC-1b**: mở form từ phiếu nhập/xuất qua "+ Tạo mới mã nội bộ"; nếu dòng đã có SKU → **pre-fill mã SKU + tên SKU** (gắn sẵn tab Mã SKU + Tên sản phẩm = tên SKU; Mã nội bộ vẫn nhập tay). Thêm EC-4 (SKU đã mapping khác). |
| 2026-06-10 | 3 | Business Authority | **Sửa AC-1b/EC-4** theo bối cảnh: phiếu nhập "Nền tảng" (mua đẩy sang) chỉ có SKU. Chỉ **gắn sẵn SKU vào tab "Mã SKU"**; **Mã + Tên sản phẩm nội bộ đều nhập tay** (bỏ seed Tên = tên SKU). SKU **đã mapping mã khác** → KHÔNG gắn sẵn (form trống, gắn SKU khác). |
| 2026-06-16 | 4 | Business Authority | Theo quyết định BA: cụ thể hóa **AC-4 "Tính chất"** — 4 giá trị cố định (Vật tư hàng hóa, CCDC, Dịch vụ, Khác), mặc định "Vật tư hàng hóa", dẫn chiếu **BR-CAT-PROD-019**. AC testable thay vì "vd ...". |
| 2026-06-16 | 5 | Business Authority | Fix (quyết định BA): tệp đính kèm tuân platform ≤10MB + PDF/JPG/PNG (ERR-CMN-004/005), bỏ ≤30MB/5-định-dạng; ảnh sản phẩm AC-10 đồng bộ **jpg, png** (bỏ gif). |
| 2026-06-24 | 6 | Business Authority | Gắn **Figma web** vào §3 UI/UX Reference (node `14146-87151`, file GMS-v.3); Mobile **web-only** (không làm). Nguồn authoritative cho registry figma-links (wave 03 sync). |
| 2026-06-24 | 7 | Business Authority | **Xuất xứ → master lookup; Thương hiệu giữ free-text** (BA làm rõ rà soát wave 3): AC trường không bắt buộc — **Thương hiệu** giữ (text, nhập tay); **Xuất xứ** đổi sang (dropdown chọn từ danh mục xuất xứ master) theo **BR-CAT-PROD-023**. |
| 2026-06-24 | 8 | Business Authority | **Đồng bộ tên nút theo Figma** (rà soát wave 3): tiêu đề + entry → **"Thêm sản phẩm"**, submit "Lưu Mã sản phẩm nội bộ" → **"Tạo"**, "Hủy bỏ" → **"Huỷ bỏ"**; bổ sung nút modal ĐVT quy đổi (**Huỷ / Thêm**) + modal Gắn SKU (**Huỷ / Gắn SKU**). |
| 2026-06-25 | 9 | Business Authority | **Giới hạn 500 ký tự cho "Mô tả" + "Ghi chú"** (BA chốt): bổ sung AC-8 — mỗi trường textarea tối đa 500 ký tự, vượt → cảnh báo mã mới `ERR-INV-046` highlight ô vi phạm, không cho lưu. Reference **BR-CAT-PROD-025** mới. Đồng bộ FEAT-CAT-PROD-EDIT v7 + BR-GF-INVENTORY-CATALOG v14 + ERROR-CODE-REGISTRY v15. |
| 2026-06-26 | 10 | Business Authority | **Giới hạn precision tỷ lệ quy đổi ≤ 6 chữ số thập phân** (BA chốt chuẩn hoá precision): AC-11 nhánh hợp lệ + nhánh lỗi mở rộng — "cho phép số thập phân" → "**cho phép số thập phân tối đa 6 chữ số sau dấu phẩy**"; vượt → mã lỗi mới **`ERR-INV-047`** highlight dòng ĐVT quy đổi + không lưu. Constraint `> 0` (`ERR-INV-013`) + non-trùng ĐVT (`ERR-INV-014`) giữ nguyên. BR-CAT-PROD-011 mirror cập nhật. Đồng bộ BR-GF-INVENTORY-CATALOG v15 + ERROR-CODE-REGISTRY v16 + FEAT-CAT-PROD-DETAIL v8 + FEAT-CAT-PROD-EDIT v8 + FEAT-IR-CREATE-V2 v19 + FEAT-ID-CREATE-V2 v14 + UX-FLOW-INVENTORY-CATALOG v9. |
| 2026-06-29 | 11 | Business Authority | **Revert dung lượng tệp đính kèm 10 MB → 30 MB** (BA chốt rà soát Wave 3 — kế toán cần upload PDF chứng từ + ảnh chất lượng cao). AC-13 + cite BR-CAT-PROD-015 §Business Rules cập nhật. Định dạng PDF/JPG/PNG + cap 5 tệp + mã lỗi `ERR-CMN-004/005` giữ nguyên. CHỈ áp Wave 3 — Receipt/Delivery V2 vẫn 10 MB. Đồng bộ BR-GF-INVENTORY-CATALOG v16 + FEAT-CAT-PROD-DETAIL + FEAT-CAT-PROD-EDIT. |
| 2026-06-29 | 12 | Business Authority | **Cleanup note divergence** — BA mở rộng scope all-30MB toàn Inventory V2 (Receipt V2 + Delivery V2 cùng bump 10→30 MB), do đó note "W03 dùng cap 30 MB riêng — khác Receipt/Delivery V2 = 10 MB" trong AC-13 + §5 BR cite trở nên sai/lạc hậu → xóa. AC-13 phục hồi wording "theo chuẩn upload file toàn platform". Đồng bộ BR-GF-INVENTORY-CATALOG v17 + BR-GF-INVENTORY-RECEIPT-V2 v25 + BR-GF-INVENTORY-DELIVERY-V2 v21. Follow-up: ERROR-CODE-REGISTRY (dual-owner CR) bump message ERR-CMN-004 "10MB" → "30MB". |
| 2026-07-02 | 13 | Business Authority | **Chuyển validate mã SP nội bộ từ blacklist → whitelist** (BA chốt chặn tiếng Việt có dấu): AC-2 rewrite — "không chứa ký tự đặc biệt" → "**chỉ chấp nhận** `A-Z a-z 0-9 - _ . / ( )` + khoảng trắng ở giữa + auto trim đầu cuối + tối đa 50 ký tự". Thêm cite `ERR-INV-006` + `BR-CAT-PROD-002`. Đồng bộ BR-GF-INVENTORY-CATALOG v19 (BR-CAT-PROD-002) + FEAT-CAT-GRP-CREATE v5 (BR-CAT-GRP-002). |
