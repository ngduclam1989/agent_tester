---
type: feature
artifact_kind: feature
status: PLANNED
version: 7
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-RECEIPT-V2"
boundary: "gf-inventory"
last_reviewed: "2026-07-16"  # v7 RGR RR-045 fix (bachho + sonhoang 2026-07-16) — AC-6 cap dialog 20 mã đầu + link chi tiết phiếu gốc + cuộn dọc trong content area. Pure UX detail, no cascade. Đối xứng FEAT-ID-DELETE v5. v6 → v7.
---

# FEAT-IR-DELETE: Xóa phiếu nhập kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-IR-DELETE` |
| Title | Xóa phiếu nhập kho |
| Parent Epic | `EP-INVENTORY-RECEIPT-V2` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |
| Depends on | `EP-INVENTORY-ACCOUNTING-PERIOD` (lock kỳ), `EP-INVENTORY-STOCK-V2` (tính lại tồn) |

## 1. User Story

**As** chủ garage / kế toán, **I want** xóa phiếu nhập kho nhập sai, **so that** dữ liệu sạch — đồng thời hệ thống tính lại tồn và ngăn xóa khi làm tồn âm hoặc thuộc kỳ đã khóa.

## 2. Acceptance Criteria

### Nhóm A — Xác nhận xóa

- [ ] **AC-1**: Mở popup xác nhận
  - Tại: danh sách (icon Xóa) hoặc chi tiết (nút **"Xóa"**).
  - Khi: chủ garage xóa một phiếu thỏa điều kiện (không thuộc kỳ đã khóa; xóa không làm tồn âm).
  - Thì: hệ thống hiển thị popup xác nhận **"Bạn có chắc chắn muốn xóa phiếu nhập kho [số phiếu] không?"**, nút **"Xóa"** / **"Hủy"**.

- [ ] **AC-2**: Thực hiện xóa + tính lại tồn
  - Tại: popup, nút **"Xóa"**.
  - Khi: chủ garage xác nhận.
  - Thì: hệ thống xóa phiếu; nếu phiếu **đã Ghi sổ kho** → trừ tồn đã cộng và **tính lại tồn** theo (mã + kho + gara). Hiển thị thông báo thành công.

- [ ] **AC-3**: Hủy
  - Tại: popup, nút **"Hủy"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống đóng popup, không xóa.

### Nhóm B — Chặn xóa

- [ ] **AC-4**: Chặn khi kỳ đã khóa
  - Tại: thao tác xóa.
  - Khi: phiếu có ngày chứng từ thuộc **kỳ kế toán đã đóng**.
  - Thì: hệ thống chặn, báo lỗi **"kỳ đã khóa"**.

- [ ] **AC-5**: Chặn khi làm tồn âm
  - Tại: thao tác xóa phiếu đã Ghi sổ kho.
  - Khi: việc xóa (trừ tồn đã cộng) làm **tồn (mã + kho + gara) < 0 tại bất kỳ thời điểm nào** từ ngày chứng từ trở đi (vd tồn đã bị phiếu xuất sau đó tiêu thụ).
  - Thì: hệ thống chặn, báo lỗi tồn âm.

- [ ] **AC-6**: Chặn khi có phiếu Xuất trả hàng mua tham chiếu (reference integrity)
  - Tại: thao tác xóa phiếu Nhập.
  - Khi: phiếu có **Loại phiếu = Nhập mua** (`RECEIPT_PURCHASE`) VÀ tồn tại ≥ 1 phiếu **Xuất trả hàng mua** (`DELIVERY_PURCHASE_RETURN`) có `source_receipt_id = {phiếu này}` — bất kể trạng thái phiếu con (Nháp / Ghi sổ kho — V2 không có "Đã hủy" theo BR-IRV2-002).
  - Thì: hệ thống chặn xóa, hiển thị popup **"Không thể xóa"** với nội dung liệt kê mã phiếu con: **"Không thể xóa phiếu PN-xxxxx — đã có {N} phiếu xuất trả hàng mua tham chiếu: PX-yyy01, PX-yyy02, ..."**. **Cap hiển thị tối đa 20 mã đầu** (sắp xếp theo thời gian tạo mới nhất trước); nếu N > 20 → append dòng cuối **"… và {N - 20} phiếu khác. Xem danh sách đầy đủ trong Chi tiết phiếu."** kèm liên kết mở tab chi tiết phiếu Nhập gốc (nơi hiển thị block "Phiếu con liên kết" full-list, RGR RR-045 decision 2026-07-16). Kết thúc content: **"Vui lòng xóa các phiếu trả trước."** → mã lỗi **`ERR-INV-049`**. Nút **"Đóng"**. Chỉ áp cho `RECEIPT_PURCHASE` — các loại Nhập khác không áp (BR-IRV2-035). Chiều cao dialog tối đa 400px; nếu list > 20 mã hiển thị cuộn dọc trong content area, không vỡ layout.

### Nhóm C — Phân quyền

- [ ] **AC-7**: Phân quyền
  - Tại: danh sách / chi tiết.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò xóa được với quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14492-89260&t=W7XJPVvhmdBPtv2c-4 |

- Luồng: [UX-FLOW-INVENTORY-RECEIPT-V2](../ux/UX-FLOW-INVENTORY-RECEIPT-V2.md) §3, EC-1/EC-2.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Xóa phiếu: Mutation `[PROPOSED] DeleteReceiptV2`.

## 5. Business Rules

- **BR-IRV2-006**: Xóa phiếu → tính lại tồn.
- **BR-IRV2-007**: Chặn khi kỳ đã khóa.
- **BR-IRV2-008**: Chặn nếu xóa làm tồn âm (point-in-time).
- **BR-IRV2-035**: Chặn xóa phiếu **Nhập mua** khi có phiếu **Xuất trả hàng mua** tham chiếu `source_receipt_id` (bất kể trạng thái Nháp/Ghi sổ; `ERR-INV-049`; dialog liệt kê tất cả mã phiếu con). Đối xứng BR-IDV2-034.

## 6. Edge Cases

- **EC-1**: Xóa phiếu Nháp → không tác động tồn (chưa cộng).
- **EC-2**: Xóa phiếu Ghi sổ kho mà tồn đã bị xuất tiêu thụ → trừ tồn làm âm → chặn.
- **EC-3**: Phiếu thuộc kỳ đã đóng → chặn.
- **EC-4**: Xóa phiếu **Nhập mua** đã có phiếu **Xuất trả hàng mua** (bất kể Nháp/Ghi sổ) source-from → chặn, dialog liệt kê tất cả mã phiếu con (`ERR-INV-049`). User phải xóa các phiếu Xuất trả NCC trước rồi mới xóa được phiếu Nhập gốc.

## 7. Out of Scope

- Sửa phiếu → `FEAT-IR-EDIT-V2`. Bỏ ghi sổ (thay vì xóa) → `FEAT-IR-DETAIL-V2`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-15 | 6 | Business Authority | **Thêm AC-6 reference-integrity chặn xóa Nhập mua khi có Xuất trả hàng mua tham chiếu** (BA-review W05 prep — gap phát hiện session cross-check). AC-6 chỉ áp `RECEIPT_PURCHASE`; check `DELIVERY_PURCHASE_RETURN.source_receipt_id`; áp bất kể trạng thái phiếu con (V2 không có "Đã hủy" theo BR-IRV2-002). Dialog liệt kê **tất cả** mã phiếu con. Mã lỗi `ERR-INV-049` (mới). Renumber AC-6 (Phân quyền) → AC-7. §5 cite BR-IRV2-035 (mới). §6 EC-4 (mới). Cascade BR-GF-INVENTORY-RECEIPT-V2 v40 + ERROR-CODE-REGISTRY v23. Đối xứng FEAT-ID-DELETE v3 (AC-6 phía Xuất bán). |
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-IR-DELETE (mới) — xóa phiếu nhập kho + tính lại tồn; chặn khi kỳ đã khóa hoặc xóa làm tồn âm point-in-time. |
| 2026-06-10 | 2 | Business Authority | Thêm §0 Δ Thay đổi so với V1 (feature mới — V1 dùng "Hủy phiếu" trong DETAIL, V2 thay bằng Xóa cứng) + gắn tag [MỚI] + con trỏ lineage `← thay FEAT-IR-DETAIL AC-10` cho AC-1/2 (để agent truy vết nguồn gốc). |
| 2026-06-10 | 3 | Business Authority | Thêm khung **CR** giống mẫu: Metadata (Loại thay đổi CR / Màn hình target FEAT-IR-DETAIL / Depends on) + section **§0 Bối cảnh thay đổi (Change Request — DEV đọc trước)**; bảng Δ chuyển xuống §0.1. |
| 2026-06-10 | 4 | Business Authority | Gỡ khung mapping V1↔V2 (CR, §0 Bối cảnh, bảng Δ, lineage tags) — spec V2 đứng độc lập; giữ nguyên toàn bộ nội dung nghiệp vụ. |
| 2026-06-26 | 5 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14492-89260`. Mobile chưa có. |
| 2026-07-15 | 6 | Business Authority | **Thêm AC-6 reference-integrity chặn xóa Nhập mua khi có Xuất trả hàng mua tham chiếu** (backfill entry — frontmatter v6 đã set nhưng CL chưa có, cover source_receipt_id check + dialog liệt kê + ERR-INV-049 + BR-IRV2-035; đối xứng FEAT-ID-DELETE v3 AC-5 pattern). Backfill sau khi phát hiện version drift 2026-07-16 (RGR RR-045 fix). |
| 2026-07-16 | 7 | Business Authority (RGR bachho + user sonhoang decision 2026-07-16) | **RGR RR-045 fix — AC-6 dialog cap tối đa 20 mã đầu + link chi tiết phiếu gốc**. Trước: liệt kê **tất cả** mã phiếu con — vỡ layout khi N > 100 (phiếu Nhập mua lớn có thể có 100-300 phiếu Xuất trả). Sau: cap 20 mã đầu (sắp xếp theo thời gian tạo mới nhất trước) + append dòng "… và {N - 20} phiếu khác. Xem danh sách đầy đủ trong Chi tiết phiếu." + liên kết mở tab Chi tiết phiếu Nhập gốc (block "Phiếu con liên kết" full-list). Chiều cao dialog tối đa 400px, cuộn dọc trong content area khi > 20 mã. **KHÔNG đụng** BR-IRV2-035 (rule vẫn "liệt kê") / ERROR-CODE-REGISTRY / Architecture. Pure Product UX detail. Đối xứng FEAT-ID-DELETE v5 AC-5. v6 → v7. |
