---
type: feature
artifact_kind: feature
status: PLANNED
version: 9
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-DELIVERY-V2"
boundary: "gf-inventory"
last_reviewed: "2026-06-29"
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
  - Thì: hệ thống mở form **"Sửa phiếu xuất kho"** với mô tả **"Kiểm tra kỳ khóa sổ và kiểm tra không âm tồn khi ghi sổ."** + cảnh báo **"phase hiện tại không cho phép ngoại lệ xuất âm kho"**, dữ liệu điền sẵn.

- [ ] **AC-2**: Chặn sửa khi kỳ đã khóa
  - Tại: form sửa, khi Lưu.
  - Khi: phiếu có ngày chứng từ thuộc **kỳ kế toán đã đóng**.
  - Thì: hệ thống báo lỗi **"kỳ đã khóa"** (`ERR-INV-024`), không cho lưu. Kỳ **chưa khóa** → cho sửa (kể cả phiếu đã Ghi sổ kho). *(Nút **Sửa bị ẩn** khi kỳ đã khóa — xem `FEAT-ID-DETAIL-V2` AC-4. Guard khi Lưu là **phòng vệ** chống race-condition.)*

### Nhóm B — Sửa & tính lại tồn

- [ ] **AC-3**: Sửa header & dòng
  - Tại: header + tab chi tiết.
  - Thì: hệ thống cho sửa các trường / dòng (đổi SKU/mã nội bộ, SL xuất, kho, ngày...); áp quy tắc đổ dữ liệu + SL quy đổi + hiển thị tồn khả dụng như khi tạo.

- [ ] **AC-3b**: Nút trên tab chi tiết
  - Tại: tab **CHI TIẾT** (cả form Tạo lẫn Sửa).
  - Khi: form được mở.
  - Thì: thanh trên chỉ có nút **"Thêm phụ tùng"**; **xóa dòng** là **icon ở cột "Thao tác"** trên từng dòng — không có nút "Xóa dòng" hàng loạt.

- [ ] **AC-4**: Tính lại tồn + check tồn âm
  - Tại: phiếu **Ghi sổ kho** được sửa (kỳ chưa khóa).
  - Khi: thay đổi SL / ngày / sản phẩm / kho / xóa dòng.
  - Thì: hệ thống **tính lại tồn** theo (mã + kho + gara) và **re-check tồn âm** (chặn nếu làm tồn < 0 tại bất kỳ thời điểm nào; dòng vượt tồn hiện **"Không đủ tồn"**).

### Nhóm C — Lưu / Đóng

- [ ] **AC-5**: Lưu thay đổi
  - Tại: nút **"Lưu"**.
  - Khi: hợp lệ, không vi phạm tồn âm / kỳ khóa.
  - Thì: hệ thống lưu, cập nhật tồn (nếu đã ghi sổ), cập nhật Người sửa / Ngày sửa.

- [ ] **AC-5b**: Tab Đính kèm
  - Tại: tab **ĐÍNH KÈM**.
  - Khi: chủ garage sửa/thêm/xóa tệp đính kèm của phiếu.
  - Thì: hệ thống cho sửa/thêm/xóa tệp như khi Tạo — tối đa **5 tệp**, mỗi tệp **≤ 30 MB** (`ERR-CMN-004`), định dạng **PDF / JPG / PNG** (`ERR-CMN-005`) — theo chuẩn upload file toàn platform (BR-IDV2-026). Không bắt buộc.

- [ ] **AC-6**: Đóng — nút **"Đóng"** đóng form, không lưu.

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
- **BR-IDV2-026**: Tệp đính kèm — tối đa 5 tệp, **≤ 30 MB (`ERR-CMN-004`)**, PDF/JPG/PNG (`ERR-CMN-005`); sửa/thêm/xóa như khi Tạo.

## 6. Edge Cases

- **EC-1**: Sửa phiếu Ghi sổ kho trong kỳ đã đóng → chặn.
- **EC-2**: Sửa SL xuất vượt tồn → "Không đủ tồn", chặn.
- **EC-3**: Đổi kho dòng → tính lại tồn theo kho mới.
- **EC-4**: Đổi **ngày xuất lùi về trước** → tính lại tồn (sổ tồn) **point-in-time** từ ngày mới trở đi (cascade); nếu làm tồn (mã+kho) âm tại **bất kỳ thời điểm nào** (kể cả lùi về trước OB — lúc đó tồn = 0) → **chặn** ("Không đủ tồn" / `ERR-INV-036`).

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
