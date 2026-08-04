---
type: feature
artifact_kind: feature
status: PLANNED
version: 15
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-DELIVERY-V2"
boundary: "gf-inventory"
last_reviewed: "2026-07-16"
supersedes: "FEAT-ID-EDIT"
---

# FEAT-ID-EDIT-V2: Chỉnh sửa phiếu xuất kho (V2)

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-ID-EDIT-V2` |
| Title | Chỉnh sửa phiếu xuất kho (V2) |
| Parent Epic | `EP-INVENTORY-DELIVERY-V2` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** chỉnh sửa phiếu xuất kho (Nháp hoặc Ghi sổ kho khi kỳ chưa khóa), **so that** tôi sửa sai sót — và hệ thống tính lại tồn, chặn tồn âm / kỳ đã khóa.

## 2. Acceptance Criteria

### Nhóm A — Mở form & điều kiện

- [ ] **AC-1**: Mở form sửa
  - Tại: danh sách (icon Sửa) hoặc chi tiết (nút **"Sửa"**).
  - Thì: hệ thống mở form **"Chỉnh sửa phiếu xuất kho"** với mô tả **"Kiểm tra kỳ khóa sổ và kiểm tra không âm tồn khi ghi sổ."** + cảnh báo **"phase hiện tại không cho phép ngoại lệ xuất âm kho"**, dữ liệu điền sẵn.

- [ ] **AC-2**: Chặn sửa khi kỳ đã khóa
  - Tại: form sửa, khi Lưu.
  - Khi: phiếu có ngày chứng từ thuộc **kỳ kế toán đã đóng**.
  - Thì: hệ thống báo lỗi **"kỳ đã khóa"** (`ERR-INV-024`), không cho lưu. Kỳ **chưa khóa** → cho sửa (kể cả phiếu đã Ghi sổ kho). *(Nút **Sửa bị ẩn** khi kỳ đã khóa — xem `FEAT-ID-DETAIL-V2` AC-4. Guard khi Lưu là **phòng vệ** chống race-condition.)*

### Nhóm B — Sửa & tính lại tồn

- [ ] **AC-3**: Sửa header & dòng
  - Tại: header + tab chi tiết.
  - Thì: hệ thống cho sửa các trường / dòng (đổi SKU/mã nội bộ, SL xuất, kho, ngày...); áp quy tắc đổ dữ liệu + SL quy đổi + hiển thị tồn khả dụng như khi tạo.

- [ ] **AC-3b**: Nút trên tab chi tiết
  - Tại: tab **Chi tiết** (cả form Tạo lẫn Sửa).
  - Khi: form được mở.
  - Thì: thanh trên chỉ có nút **"Thêm phụ tùng"**; **xóa dòng** là **icon ở cột "Thao tác"** trên từng dòng — không có nút "Xóa dòng" hàng loạt.

- [ ] **AC-4**: Tính lại tồn + check tồn âm
  - Tại: phiếu **Ghi sổ kho** được sửa (kỳ chưa khóa).
  - Khi: thay đổi SL / ngày / sản phẩm / kho / xóa dòng.
  - Thì: hệ thống **tính lại tồn** theo (mã + kho + gara) và **re-check tồn âm** (chặn nếu làm tồn < 0 tại bất kỳ thời điểm nào; dòng vượt tồn hiện **"Không đủ tồn"**).

- [ ] **AC-4b**: Chuyển trạng thái Ghi sổ trong form Sửa (đối soát SO — narrow V1 semantic)
  - Tại: form Sửa, **dropdown Trạng thái** (Nháp / Ghi sổ).
  - Khi: user đổi dropdown Trạng thái từ **Nháp → Ghi sổ** + click **Lưu**.
  - Thì (**KHÔNG hiển thị popup xác nhận Ghi sổ chung** — user đã explicit chọn dropdown + Lưu, hành động rõ ràng; popup xác nhận chung chỉ áp cho nút "Ghi sổ" ở form Chi tiết + mobile List inline — xem `FEAT-ID-DETAIL-V2` AC-5 + `FEAT-ID-LIST-V2` mobile):
    1. BE call `gf-sales` `/protected/v1/product/so-summary` đối soát SL/sản phẩm phiếu vs SO **ngay lập tức** (chỉ khi phiếu có liên kết SO — "Mã đơn hàng" ≠ trống; nếu không có SO → skip đối soát, đi thẳng bước 4 commit).
    2. **Case lệch** (`ERR-INV-039`, `reconciliationWarnings[]` không rỗng) → hiển thị **popup cảnh báo verbatim** (BR-IDV2-009 canonical): title `"Số lượng phụ tùng trong phiếu xuất kho và phiếu dịch vụ #{mã_phiếu} chưa trùng khớp. Vui lòng cập nhật chính xác số lượng phụ tùng."` + content list dòng lệch (VD `"Phụ tùng A thừa 5 cái chưa khớp phiếu xuất kho"`) + button **[Đóng]** + **[Vẫn Ghi sổ]**. Click **[Đóng]** → hủy Ghi sổ, form Sửa quay lại state Nháp (dropdown revert), không đóng form (user có thể tiếp tục sửa). Click **[Vẫn Ghi sổ]** → đi bước 4 commit.
    3. **Case DEGRADED** (`ERR-CMN-007-DEGRADED`, `gf-sales` unreachable/timeout, fail-OPEN) → hiển thị **popup DEGRADED verbatim**: `"Hệ thống chưa đối soát được vì mất kết nối phòng dịch vụ. Bạn vẫn muốn Ghi sổ hay đợi thử lại?"` + button **[Đóng]** + **[Vẫn Ghi sổ]**. Click **[Đóng]** → hủy Ghi sổ, form Sửa giữ nguyên. Click **[Vẫn Ghi sổ]** → đi bước 4 commit.
    4. **Commit** — trước khi commit: **bắt buộc mọi dòng có mã nội bộ** (BR-IDV2-028, thiếu → chặn `ERR-INV-011`) + **check tồn khả dụng** (chặn `ERR-INV-036` nếu tồn âm point-in-time) + **lock kỳ** (chặn `ERR-INV-024` nếu kỳ đã đóng). Nếu qua guard → trừ tồn theo SL quy đổi, chuyển state **"Ghi sổ kho"**, đóng form Sửa, quay về màn Chi tiết.
  - **Không trigger đối soát** khi: user chỉ đổi dropdown Nháp → Nháp (giữ Nháp) + click Lưu, hoặc user đổi content phiếu (SL/dòng/SO) mà **KHÔNG chuyển state Ghi sổ**. Chỉ trigger tại state transition Nháp → Ghi sổ.
  - **UI Figma**: popup cảnh báo + popup DEGRADED **pending** (BA sẽ vẽ mới) — DEV placeholder theo wording verbatim ở đây (BR-IDV2-009 canonical) trước khi Figma xong.

### Nhóm C — Lưu / Huỷ bỏ

- [ ] **AC-5**: Lưu thay đổi
  - Tại: nút **"Lưu"**.
  - Khi: hợp lệ, không vi phạm tồn âm / kỳ khóa.
  - Thì: hệ thống lưu, cập nhật tồn (nếu đã ghi sổ), cập nhật Người sửa / Ngày sửa.

- [ ] **AC-5b**: Tab Đính kèm
  - Tại: tab **Đính kèm**.
  - Khi: chủ garage sửa/thêm/xóa tệp đính kèm của phiếu.
  - Thì: hệ thống cho sửa/thêm/xóa tệp như khi Tạo — tối đa **5 tệp**, mỗi tệp **≤ 30 MB** (`ERR-CMN-004`), định dạng **PDF / JPG / PNG** (`ERR-CMN-005`) — theo chuẩn upload file toàn platform (BR-IDV2-026 v36). Không bắt buộc.

- [ ] **AC-6**: Huỷ bỏ — nút **"Huỷ bỏ"** (secondary — Figma convention thay cho "Đóng"; form Sửa giữ primary "Lưu" khác form CREATE dùng "Tạo") đóng form, không lưu.

### Nhóm D — Phân quyền

- [ ] **AC-7**: Phân quyền — chủ garage + kế toán quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87564&t=W7XJPVvhmdBPtv2c-4 |

- Luồng: [UX-FLOW-INVENTORY-DELIVERY-V2](../ux/UX-FLOW-INVENTORY-DELIVERY-V2.md) §3, EC-1/EC-2/EC-3.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Cập nhật phiếu: Mutation `[PROPOSED] UpdateDeliveryV2`.

## 5. Business Rules

- **BR-IDV2-004**: Check tồn khả dụng, chặn tồn âm.
- **BR-IDV2-006**: Tính lại tồn khi sửa/xóa dòng/đổi SP/SL/ngày/kho.
- **BR-IDV2-007**: Lock kỳ đã đóng; kỳ chưa khóa cho sửa cả phiếu ghi sổ.
- **BR-IDV2-015 / 016**: Đổ dữ liệu SKU/mã nội bộ + SL quy đổi.
- **BR-IDV2-025**: **Nguồn dữ liệu trường form (áp cả Tạo + Sửa)**. Dropdown **Đối tượng** filter cứng theo status: NCC/KH chỉ "Đang hoạt động", NV chỉ "Đang làm việc". Dropdown **Người phụ trách** chỉ nhân sự "Đang làm việc". **Edge case phiếu cũ khi mở form Sửa**: Đối tượng / Người phụ trách đã bị đổi status sau ghi sổ → giữ hiện selected value (không mất reference), nhưng KHÔNG cho chọn lại đối tượng / nhân sự đã ngừng khác.
- **BR-IDV2-026**: Tệp đính kèm — tối đa 5 tệp, **≤ 30 MB (`ERR-CMN-004`)**, **PDF/JPG/PNG** (`ERR-CMN-005` v22); sửa/thêm/xóa như khi Tạo.
- **BR-IDV2-033**: Post-Save nav "chuyển Chi tiết phiếu vừa sửa + toast success 3s". Concurrent edit V2 = **last-write-wins** (không optimistic-lock); 2 user cùng mở form Sửa → người Lưu sau đè, KHÔNG cảnh báo. Cửa sổ xung đột chỉ ở Nháp — Ghi sổ đóng edit (BR-IDV2-024).
- **BR-IDV2-009**: Đối soát SO — sửa phiếu có liên kết SO, BE re-check reconciliation nếu SO/lines đổi (AC-4b) — warning-only không chặn (`ERR-INV-039` / DEGRADED `ERR-CMN-007-DEGRADED`).

## 6. Edge Cases

- **EC-1**: Sửa phiếu Ghi sổ kho trong kỳ đã đóng → chặn.
- **EC-2**: Sửa SL xuất vượt tồn → "Không đủ tồn", chặn.
- **EC-3**: Đổi kho dòng → tính lại tồn theo kho mới.
- **EC-4**: Đổi **ngày xuất lùi về trước** → tính lại tồn (sổ tồn) **point-in-time** từ ngày mới trở đi (cascade); nếu làm tồn (mã+kho) âm tại **bất kỳ thời điểm nào** (kể cả lùi về trước OB — lúc đó tồn = 0) → **chặn** ("Không đủ tồn" / `ERR-INV-036`).
- **EC-5**: Phiếu cũ có Đối tượng (NCC/KH/NV) hoặc Người phụ trách nay đã bị đổi status ("Ngừng hoạt động" / "Ngừng làm việc" / "Nghỉ việc") → form Sửa vẫn hiển thị selected value hiện tại (không mất reference); user KHÔNG cho chọn lại đối tượng/nhân sự đã ngừng khác (dropdown filter cứng — BR-IDV2-025).

## 7. Out of Scope

- Tạo → `FEAT-ID-CREATE-V2`. Ghi sổ / bỏ ghi sổ → `FEAT-ID-DETAIL-V2`. Xóa → `FEAT-ID-DELETE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-ID-EDIT-V2 (V2 của FEAT-ID-EDIT) — sửa phiếu Nháp / Ghi sổ kho (kỳ chưa khóa); tính lại tồn + check tồn âm (Không đủ tồn); chặn kỳ đã khóa. |
| 2026-06-10 | 2 | Business Authority | Gỡ nhắc **"Import dòng"** khỏi AC-3b (V1 vốn không có chức năng này). |
| 2026-06-15 | 3 | Business Authority | Rà lỗ hổng (Nhóm D-4): thêm **EC-4** — đổi ngày xuất lùi → cascade tính lại tồn point-in-time; tồn âm (kể cả lùi trước OB) → chặn. |
| 2026-06-16 | 4 | Business Authority | Đăng ký mã lỗi: đổi mã bare → ERR-INV-NNN (ERROR-CODE-REGISTRY §4). |
| 2026-06-16 | 5 | Business Authority | Fix (quyết định BA cuối): kỳ đã khóa → ẩn nút Sửa (đảo lại "Sửa vẫn hiện"); làm rõ Thêm mới chặn khi Lưu (BR-IDV2-007). Guard Lưu = phòng vệ. |
| 2026-06-16 | 6 | Business Authority | Nhất quán với BR-IDV2-026 (map cả CREATE + EDIT): thêm **AC-5b** tab Đính kèm (sửa/thêm/xóa tệp như khi Tạo — ≤10MB, PDF/JPG/PNG, ERR-CMN-004/005) + bổ sung BR-IDV2-026 vào §5. |
| 2026-06-26 | 7 | Business Authority | **Nâng giới hạn file đính kèm 10 MB → 30 MB**: AC-5b + BR-IDV2-026 mirror — "≤ 10 MB (`ERR-CMN-004`)" → "**≤ 30 MB (`ERR-INV-048`** mới — giới hạn Inventory V2)". ERR-CMN-005 + max 5 tệp giữ nguyên. Đồng bộ BR-IDV2-026 v21 + FEAT-ID-CREATE-V2 v15 + ERROR-CODE-REGISTRY v17. |
| 2026-06-26 | 8 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14146-87564`. Mobile chưa có. |
| 2026-06-29 | 9 | Business Authority | **Đồng bộ approach 30 MB toàn Inventory V2 — đảo `ERR-INV-048` → `ERR-CMN-004`**: BA chốt all-30MB toàn Inventory V2 đồng nhất → `ERR-CMN-004` common message sẽ đổi "10MB" → "30MB". AC-5b + BR-IDV2-026 mirror phục hồi wording "theo chuẩn upload file toàn platform". Đồng bộ BR-IDV2-026 v25 + FEAT-ID-CREATE-V2 v17 + ERROR-CODE-REGISTRY. |
| 2026-07-13 | 10 | Business Authority (BA in-session review W05 chuẩn bị) | **§5 thêm ref BR-IDV2-025 + §6 thêm EC-5** — cascade BR-IDV2-025 v25/v26 (form Tạo + Sửa filter status Đối tượng + Người phụ trách). BR-IDV2-025 áp cả CREATE + EDIT (không chỉ CREATE), FEAT-ID-EDIT-V2 §5 trước đây thiếu ref → BA fix để DEV đọc EDIT không quên áp rule. EC-5 mới: phiếu cũ có Đối tượng/Người phụ trách nay đã ngừng → form Sửa giữ hiện selected value, không cho chọn đối tượng/nhân sự đã ngừng khác. |
| 2026-07-14 | 11 | Business Authority | **§5 cite BR-IDV2-033 Post-Save nav + last-write-wins** (BA-review 2026-07-14 C2.4 + C2.5 traceability cascade, đối xứng FEAT-IR-EDIT-V2 v15). Đặc biệt quan trọng cho EDIT vì cửa sổ xung đột concurrent chỉ ở trạng thái Nháp — DEV EDIT screen implement last-write-wins pattern (không cần version check). Rule mô tả trong BR-GF-INVENTORY-DELIVERY-V2 v34 §2.4. |
| 2026-07-14 | 12 | Business Authority | **Sync doc ↔ Figma cross-check W05 (SYS-1 + SYS-2 P0, đối xứng FEAT-IR-EDIT-V2 v16)**: (1) AC-6 "Đóng" → **"Huỷ bỏ"** (Figma convention); Nhóm C heading "Lưu / Đóng" → "Lưu / Huỷ bỏ". (2) AC-5b + §5 BR-IDV2-026 whitelist mở rộng: "PDF/JPG/PNG" → **"PDF/JPG/PNG/DOC/XLSX"** (BR-IDV2-026 v36, ERR-CMN-005 v22). |
| 2026-07-14 | 13 | Business Authority | **Sync doc ↔ Figma cross-check W05 SYS-6 + SYS-7 + SYS-11 P1** (đối xứng FEAT-IR-EDIT-V2 v17): (a) AC-1 title "Sửa phiếu xuất kho" → **"Chỉnh sửa phiếu xuất kho"**. (b) Tab casing → sentence-case. (c) "SL xuất" → **"Số lượng xuất"**. |
| 2026-07-15 | 14 | Business Authority | **Bổ sung AC-4b banner đối soát SO khi sửa phiếu đã Ghi sổ** (GAP #3 pre-DEV W05 rà soát) — thêm AC mới declare BE re-check reconciliation khi user sửa SO/lines phiếu POSTED (PKG-W05 W05-D4), banner render trên màn chi tiết post-save (delegated wording/vị trí về `FEAT-ID-DETAIL-V2` AC-2b để tránh duplicate spec). Warning-only KHÔNG chặn Lưu. §5 thêm ref BR-IDV2-009. Trước đây FEAT chỉ có AC-1..7 (không AC nào chạm reconciliation) → DEV/QA thiếu spec T2. |
| 2026-07-16 | 15 | Business Authority | **AC-4b rewrite: từ banner delegate về AC-2b → popup verbatim đầy đủ trong AC-4b** (narrow V1 semantic per BR-IDV2-009 v40 rewrite; AC-2b đã BỎ HOÀN TOÀN nên delegate pattern v14 không còn valid). AC-4b hiện chỉ trigger tại state transition **Nháp → Ghi sổ** trong form Sửa (dropdown Trạng thái + Lưu — entry point (a) per BR-IDV2-009). **KHÔNG popup xác nhận Ghi sổ chung** trước BE check (khác Detail button + mobile inline vì user đã explicit chọn dropdown + click Lưu — hành động rõ ràng không cần confirm lại). Flow: BE call `gf-sales /protected/v1/product/so-summary` ngay lập tức → case lệch (`ERR-INV-039`) popup verbatim + `[Đóng]`+`[Vẫn Ghi sổ]` (Đóng → form Sửa revert dropdown về Nháp, không đóng form) → case DEGRADED (`ERR-CMN-007-DEGRADED` fail-OPEN) popup verbatim + `[Đóng]`+`[Vẫn Ghi sổ]` → commit. KHÔNG trigger khi: đổi content phiếu (SL/dòng/SO) mà giữ state Nháp; chỉ đổi Nháp → Nháp + Lưu. Fix version drift do session refactor (BR-IDV2-009 rewrite v40 kéo cascade AC-4b spec change nhưng chưa bump version 3-in-1). |
