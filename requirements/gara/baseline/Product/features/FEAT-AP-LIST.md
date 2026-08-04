---
type: feature
artifact_kind: feature
status: PLANNED
version: 10
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
boundary: "gf-accounting"
last_reviewed: "2026-07-08"
---

# FEAT-AP-LIST: Danh sách kỳ kế toán

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-AP-LIST` |
| Title | Danh sách kỳ kế toán |
| Parent Epic | `EP-INVENTORY-ACCOUNTING-PERIOD` |
| Boundary | `gf-accounting` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách kỳ kế toán dạng cây phân cấp (năm → quý → tháng) với tìm kiếm và lọc theo năm, **so that** tôi tra cứu nhanh các kỳ và trạng thái đóng/mở để kiểm soát chốt sổ kho.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị danh sách

- [ ] **AC-1**: Mở màn hình danh sách kỳ kế toán
  - Tại: tab **"Kỳ kế toán"** trong khu vực danh mục.
  - Khi: chủ garage truy cập tab.
  - Thì: hệ thống hiển thị màn **"Danh sách Kỳ kế toán"** với mô tả **"Danh mục kỳ dùng để kiểm soát đóng/mở kỳ kho, tính giá xuất kho và báo cáo tồn/NXT."**, ô tìm kiếm + bộ lọc năm, bảng dạng cây, và nút **"Thêm kỳ kế toán"**.

- [ ] **AC-2**: Cột hiển thị trong bảng
  - Tại: bảng danh sách.
  - Khi: bảng được render.
  - Thì: hệ thống hiển thị các cột: **"Tên kỳ kế toán"**, **"Loại kỳ kế toán"**, **"Ngày bắt đầu"**, **"Ngày kết thúc"**, **"Trạng thái"**, **"Thao tác"**.

- [ ] **AC-3**: Hiển thị dạng cây phân cấp
  - Tại: cột **"Tên kỳ kế toán"**.
  - Khi: danh sách có kỳ năm, quý, tháng.
  - Thì: hệ thống hiển thị kỳ quý thụt dưới kỳ năm, kỳ tháng thụt dưới kỳ quý, có biểu tượng mở/đóng (▼) để expand/collapse.

- [ ] **AC-4**: Hiển thị trạng thái đóng kỳ
  - Tại: cột **"Trạng thái"**.
  - Khi: bảng được render.
  - Thì: hệ thống hiển thị **text badge chip** (không dùng icon):
    - Kỳ **"Chưa đóng kỳ"** → badge nền **xanh** (trạng thái đang mở, thao tác được).
    - Kỳ **"Đã đóng kỳ"** → badge nền **đỏ** (trạng thái đã khóa, cảnh báo — không thao tác được phiếu trong kỳ, xem `FEAT-AP-EDIT` AC-4).

- [ ] **AC-4b**: Trạng thái trống (chưa có kỳ nào cho garage)
  - Tại: màn danh sách kỳ kế toán.
  - Khi: garage hiện tại **chưa có kỳ kế toán nào** (bảng kỳ không có record thuộc tenant).
  - Thì: hệ thống hiển thị:
    - Header giữ đầy đủ: page title **"Danh sách Kỳ kế toán"** + mô tả + ô tìm kiếm + bộ lọc năm + nút **"Thêm kỳ kế toán"** (top-right, luôn enable).
    - Vùng bảng: **icon minh hoạ empty** + text **"Không có dữ liệu"** ở giữa (không hiển thị dòng nào).
  - Khi: chủ garage nhấn **"Thêm kỳ kế toán"** ở trạng thái trống.
  - Thì: mở form tạo kỳ (`FEAT-AP-CREATE`) — luồng khởi tạo dữ liệu kỳ lần đầu cho garage.

### Nhóm B — Tìm kiếm & lọc

- [ ] **AC-5**: Tìm kiếm theo tên kỳ
  - Tại: ô tìm kiếm, placeholder **"Tìm theo tên kỳ kế toán"**.
  - Khi: chủ garage nhập từ khóa.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp tương đối (LIKE) trên tên kỳ kế toán.

- [ ] **AC-6**: Lọc theo năm
  - Tại: bộ lọc năm (dropdown).
  - Khi: màn hình được mở lần đầu.
  - Thì: hệ thống mặc định lọc theo **năm hiện tại** — bảng chỉ hiển thị kỳ thuộc năm này (không hiển thị các năm khác).
  - Khi: chủ garage mở dropdown chọn năm khác.
  - Thì: dropdown liệt kê các năm đã tồn tại trong garage, sắp xếp **năm giảm dần (năm mới nhất lên đầu)**. Chọn năm khác → bảng chuyển sang hiển thị kỳ của năm đã chọn.
  - Ràng buộc: dropdown năm **KHÔNG cho phép clear/bỏ chọn** (không có nút × / "Xóa lọc" / option "Tất cả") — user chỉ có thể **đổi giá trị** sang năm khác trong danh sách, luôn phải có đúng 1 năm được chọn. Mục đích: đảm bảo bảng luôn có scope năm rõ ràng, không rơi vào trạng thái "hiển thị tất cả năm" khiến cây phân cấp quá lớn.

- [ ] **AC-6b**: Thứ tự sắp xếp mặc định trong tập kết quả
  - Tại: bảng danh sách (sau khi áp filter năm ở AC-6).
  - Khi: bảng được render.
  - Thì: hệ thống sắp xếp bản ghi theo trường **"Thứ tự hiển thị"** (`display_order` — do người dùng nhập ở form Thêm/Sửa, xem `FEAT-AP-CREATE` AC-7) **tăng dần (ASC)** trong phạm vi từng kỳ cha:
    - Kỳ **năm** (root của tập kết quả — theo filter AC-6): ASC theo "Thứ tự hiển thị".
    - Kỳ **quý** dưới mỗi kỳ năm: ASC theo "Thứ tự hiển thị" trong phạm vi năm đó.
    - Kỳ **tháng** dưới mỗi kỳ quý: ASC theo "Thứ tự hiển thị" trong phạm vi quý đó.
  - Trường **"Thứ tự hiển thị"** **KHÔNG hiển thị** thành cột trong bảng — chỉ dùng làm **sort key ngầm**.

### Nhóm C — Thao tác

- [ ] **AC-7**: Thao tác theo dòng
  - Tại: mỗi dòng kỳ kế toán trong bảng.
  - Khi: bảng được render.
  - Thì: hệ thống hiển thị **2 icon trong cột "Thao tác"** — **Sửa** (→ `FEAT-AP-EDIT`) và **Xóa** (→ `FEAT-AP-DELETE`); riêng hành động **Xem chi tiết** (→ `FEAT-AP-DETAIL`) kích hoạt bằng cách **nhấn vào giá trị cột đầu tiên "Tên kỳ kế toán"** của dòng (dòng đầu render dạng link, không có icon Eye riêng trong cột Thao tác).

- [ ] **AC-8**: Mở form thêm kỳ
  - Tại: nút **"Thêm kỳ kế toán"** ở góc trên bên phải.
  - Khi: chủ garage nhấn nút.
  - Thì: hệ thống mở form thêm kỳ kế toán (`FEAT-AP-CREATE`).

### Nhóm D — Phân quyền & tenant

- [ ] **AC-9**: Phân quyền và phạm vi garage
  - Tại: danh sách kỳ kế toán.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò xem và thao tác với quyền ngang nhau; danh sách chỉ hiển thị kỳ thuộc garage hiện tại.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14492-89259&t=W7XJPVvhmdBPtv2c-4 |

- Luồng: [UX-FLOW-INVENTORY-ACCOUNTING-PERIOD](../ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md) §3.

## 4. API Reference

- Boundary: `gf-accounting` (qua BFF `agg-garage-graph`).
- Lấy danh sách kỳ (cây) + filter năm: Query `[PROPOSED] ListAccountingPeriods`.

## 5. Business Rules

- **BR-AP-003**: Phân cấp cố định Năm → Quý → Tháng.
- **BR-AP-010**: Trạng thái đóng kỳ có 2 giá trị — "Chưa đóng" (OPEN) / "Đã đóng" (CLOSED). Hình thức hiển thị: text badge chip theo AC-4 (xanh cho "Chưa đóng kỳ", đỏ cho "Đã đóng kỳ" — không dùng icon ✓/✗).
- **BR-AP-015**: Tenant isolation + tìm kiếm LIKE theo tên + lọc theo năm (mặc định năm hiện tại).

## 6. Edge Cases

- **EC-1**: Garage **có kỳ** nhưng **tìm kiếm / bộ lọc năm không match** dòng nào → vùng bảng hiển thị empty state với text **"Không tìm thấy kết quả phù hợp"** (phân biệt với AC-4b — trạng thái global chưa có kỳ nào). Giữ thanh tìm kiếm + bộ lọc để user điều chỉnh/xoá điều kiện.
- **EC-2**: Cây nhiều cấp — expand/collapse từng nhánh năm/quý.

## 7. Out of Scope

- Tạo kỳ → xem `FEAT-AP-CREATE`.
- Xem chi tiết → xem `FEAT-AP-DETAIL`.
- Sửa / đóng-mở kỳ → xem `FEAT-AP-EDIT`.
- Xóa → xem `FEAT-AP-DELETE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-AP-LIST (mới) — danh sách kỳ kế toán dạng cây Năm→Quý→Tháng, cột Đã đóng kỳ (✓/✗), tìm kiếm LIKE theo tên, lọc theo năm (mặc định năm hiện tại). |
| 2026-06-26 | 2 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14492-89259`. Mobile chưa có. |
| 2026-07-03 | 3 | Business Authority | Bổ sung **sort rule cho bảng danh sách**: (1) AC-6 clarify — vào màn hình mặc định lọc năm hiện tại (chỉ hiển thị năm này), dropdown filter năm sắp xếp **năm DESC** (mới nhất lên đầu); (2) thêm **AC-6b** — sort mặc định trong tập kết quả theo trường **"Thứ tự hiển thị"** (cross-ref `FEAT-AP-CREATE` AC-7) **ASC** trong phạm vi từng kỳ cha (năm-root, quý dưới năm, tháng dưới quý). Trường "Thứ tự hiển thị" **KHÔNG hiển thị** thành cột — chỉ là sort key ngầm. |
| 2026-07-03 | 4 | Business Authority | **Đồng bộ wording labels theo Figma** (rà soát wave 3): AC-2 cột "Loại" → **"Loại kỳ kế toán"**, cột "Đã đóng kỳ" → **"Trạng thái"**; AC-4 update cùng cột name; AC-5 placeholder "Tìm kiếm theo Tên kỳ kế toán" → **"Tìm theo tên kỳ kế toán"**; EC-1 empty state ghi rõ text **"Không có dữ liệu"** + icon placeholder + giữ thanh search/filter/nút Thêm. **Follow-up NEED CONFIRMATION**: (a) filter dropdown ở LIST là filter loại kỳ hay năm — AC-6/6b v3 có thể sai định hướng nếu là filter loại kỳ; (b) badge trạng thái: Figma dùng text badge chip (đỏ/xanh) — màu ngược với AC-4 hiện tại (Figma "Đã đóng"=đỏ, "Chưa đóng"=xanh vs AC-4 ngược lại), text "đóng ký" vs "đóng kỳ" cũng cần confirm typo. |
| 2026-07-03 | 5 | Business Authority | **Chốt badge trạng thái theo Figma** (BA confirm rà soát wave 3): AC-4 rewrite — bỏ icon ✓/✗, chuyển sang **text badge chip**: **"Chưa đóng kỳ" = badge nền xanh** (đang mở, thao tác được) · **"Đã đóng kỳ" = badge nền đỏ** (đã khóa, cảnh báo). Resolve 2/2 follow-up của v4: (a) filter dropdown = filter năm mặc định năm hiện tại → AC-6/6b v3 giữ nguyên đúng định hướng (không revert); (b) badge màu theo Figma. **Note designer**: Figma đang có typo "đóng **ký**" ở badge text — chuẩn tiếng Việt là "đóng **kỳ**" (dòng name của trạng thái = "Chưa đóng kỳ"/"Đã đóng kỳ") — nhờ designer sửa Figma. |
| 2026-07-06 | 6 | Business Authority (in-session, user ninhnguyen) | **Promote empty state từ EC-1 lên AC-4b** — đồng bộ pattern với `FEAT-OB-LIST` AC-3b: trạng thái "chưa có kỳ nào cho garage" chuyển từ Edge Cases §6 sang AC riêng trong Nhóm A. Ghi rõ: header (page title + mô tả + tìm kiếm + filter năm + nút "Thêm kỳ kế toán") vẫn hiển thị đầy đủ, vùng bảng show icon empty + text "Không có dữ liệu"; bấm "Thêm kỳ kế toán" ở empty → mở `FEAT-AP-CREATE`. EC-1 rewrite thành case "có kỳ nhưng tìm/lọc không match" → text **"Không tìm thấy kết quả phù hợp"** (phân biệt với AC-4b), giống pattern EC-4 của FEAT-CAT-PROD-LIST / FEAT-CAT-GRP-LIST. |
| 2026-07-07 | 7 | Business Authority + Senior PM | **Move boundary**: frontmatter `gf-inventory` → `gf-accounting`. Rationale: Kỳ kế toán (AP) thuộc nghiệp vụ kế toán (kho tracks SL, kế toán tính money/costing) — khớp SAP FI-CO / Misa / Fast / Odoo. Chỗ cross-boundary duy nhất ở scope PRC: `gf-accounting` REST đọc Sổ tồn SL + phiếu nhập/xuất từ `gf-inventory` khi chạy BQGQ cuối kỳ. OB + Sổ tồn giữ ở `gf-inventory`. Ref EP-INVENTORY-ACCOUNTING-PERIOD v16. Nội dung AC/BR không đổi. |
| 2026-07-08 | 8 | Business Authority (quannn) + main agent | **P2-b fix §5 BR-AP-010 wording legacy "(icon ✓/✗)"** (audit W04 P2-b 2026-07-08). §5 BR-AP-010 ref còn ghi "Trạng thái đóng kỳ 2 giá trị (icon ✓/✗)" — legacy trước v5. AC-4 v5 đã chốt **text badge chip** ("Chưa đóng kỳ" xanh / "Đã đóng kỳ" đỏ, bỏ icon). Cascade UX-FLOW-AP v12 §4 cùng lúc. Rewrite dòng BR-AP-010 ref: liệt kê 2 giá trị (OPEN/CLOSED) + delegate hình thức hiển thị về AC-4 (badge chip màu — KHÔNG icon). Không đổi BR gốc (BR-AP-010 canonical ở BR-GF-INVENTORY-ACCOUNTING-PERIOD line 46 vẫn OK — không nhắc icon). |
| 2026-07-08 | 9 | Business Authority (quannn) + main agent | **Rewrite AC-7 — bỏ icon Xem trong cột "Thao tác", chuyển hành động Xem chi tiết sang click cột đầu "Tên kỳ kế toán"** (user quannn confirm in-session 2026-07-08 khi review gap fe-web vs figma-web). Trước: cột "Thao tác" render 3 icon (Xem/Sửa/Xóa) — mâu thuẫn Figma PNG chỉ có 2 icon. Sau: cột "Thao tác" chỉ 2 icon (Sửa + Xóa) khớp Figma, giá trị cột đầu tiên "Tên kỳ kế toán" của mỗi dòng render dạng link — click mở `FEAT-AP-DETAIL`. Rationale: pattern riêng cho AP-LIST, KHÔNG copy pattern 3-icon từ các list màn khác (Product/Group list). Cascade fe-web execution spec (W04) cùng lúc. Không đổi 3 target FEAT (DETAIL/EDIT/DELETE) — chỉ đổi trigger UX. |
| 2026-07-08 | 10 | Business Authority (quannn) + main agent | **AC-6 bổ sung ràng buộc: dropdown năm KHÔNG cho phép clear/bỏ chọn** (user quannn confirm in-session 2026-07-08). Trước: AC-6 chỉ nói default = năm hiện tại + user đổi năm khác. Sau: thêm câu ràng buộc — dropdown KHÔNG có nút × / "Xóa lọc" / option "Tất cả"; user chỉ có thể **đổi giá trị** sang năm khác, luôn phải có đúng 1 năm được chọn. Rationale: tránh trạng thái "hiển thị tất cả năm" khiến cây phân cấp Năm→Quý→Tháng quá lớn (perf + UX). Cascade fe-web execution spec §3 AC-6 + §4.1 visual fidelity + §5.2 component reuse note (customs/filter dropdown component có thể cần verify prop `clearable={false}` khi DEV — flag P2). Không đổi contract BFF/BE (query luôn có `year` mandatory). |
