---
type: feature
artifact_kind: feature
status: PLANNED
version: 5
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-DELIVERY-V2"
boundary: "gf-inventory"
last_reviewed: "2026-07-16"  # v5 RGR RR-045 fix (bachho + sonhoang 2026-07-16) — AC-5 cap dialog 20 mã đầu + link chi tiết phiếu gốc + cuộn dọc trong content area. Pure UX detail, no cascade. v4 → v5. # v4 RGR RR-039 fix — AC-4 tách 2 message riêng biệt (kỳ đóng cite ERR-INV-024 + tồn âm cite ERR-INV-036 với ngày/mã/kho cụ thể).
---

# FEAT-ID-DELETE: Xóa phiếu xuất kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-ID-DELETE` |
| Title | Xóa phiếu xuất kho |
| Parent Epic | `EP-INVENTORY-DELIVERY-V2` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xóa phiếu xuất kho nhập sai, **so that** dữ liệu sạch — đồng thời hệ thống tính lại tồn và ngăn xóa khi thuộc kỳ đã khóa hoặc làm tồn âm.

## 2. Acceptance Criteria

### Nhóm A — Xác nhận xóa

- [ ] **AC-1**: Mở popup xác nhận
  - Tại: danh sách (icon Xóa) hoặc chi tiết (nút **"Xóa"**).
  - Khi: chủ garage xóa một phiếu (Nháp hoặc Ghi sổ kho) khi **kỳ chưa khóa** và xóa không làm tồn âm.
  - Thì: hệ thống hiển thị popup **"Xác nhận"** với nội dung **"Bạn có chắc chắn muốn xóa phiếu PX-xxxxx không?"**, nút **"Xóa"** / **"Hủy"**.

- [ ] **AC-2**: Thực hiện xóa + tính lại tồn
  - Tại: popup, nút **"Xóa"**.
  - Khi: chủ garage xác nhận.
  - Thì: hệ thống xóa phiếu; nếu phiếu **đã Ghi sổ kho** → cộng tồn lại (đảo phần đã trừ) và tính lại tồn. Hiển thị thông báo thành công.

- [ ] **AC-3**: Hủy — nút **"Hủy"** đóng popup, không xóa.

### Nhóm B — Chặn xóa

- [ ] **AC-4**: Chặn khi kỳ đã đóng hoặc tồn âm — **2 message riêng biệt**
  - Tại: thao tác xóa.
  - Khi: phiếu có ngày chứng từ thuộc **kỳ kế toán đã đóng** (`ERR-INV-024`, BR-IDV2-007).
  - Thì: hệ thống hiển thị popup **"Không thể xóa"** với nội dung **"Phiếu PX-xxxxx thuộc kỳ kế toán đã đóng — không thể xóa. Vui lòng liên hệ kế toán trưởng nếu cần mở lại kỳ."**, chỉ có nút **"Đóng"**.
  - Khi: việc xóa làm **tồn (mã + kho + gara) < 0** tại bất kỳ thời điểm nào (`ERR-INV-036`, BR-IDV2-004).
  - Thì: hệ thống hiển thị popup **"Không thể xóa"** với nội dung **"Xóa phiếu PX-xxxxx sẽ làm tồn kho âm tại ngày {ngày_vi_phạm_sớm_nhất} (mã {mã_SP}, kho {tên_kho}). Vui lòng điều chỉnh phiếu xuất khác trước khi xóa phiếu này."**, chỉ có nút **"Đóng"**. `{ngày_vi_phạm_sớm_nhất}` là ngày sớm nhất tồn âm phát hiện theo cascade recompute (ADR-023).
  - **2 case xử lý riêng biệt** — user click **[Đóng]** phía trên thuộc case nào thì message rõ ràng theo case đó, không gộp chung "hoặc". Nếu cả 2 case cùng đúng (phiếu vừa thuộc kỳ đóng vừa gây tồn âm) → check kỳ đóng trước (order priority), hiển thị message kỳ đóng (user fix xong kỳ mới thấy tồn âm nếu vẫn còn).

- [ ] **AC-5**: Chặn khi có phiếu Nhập hàng bán bị trả lại tham chiếu (reference integrity)
  - Tại: thao tác xóa phiếu Xuất.
  - Khi: phiếu có **Loại phiếu = Xuất bán** (`DELIVERY_SALE`) VÀ tồn tại ≥ 1 phiếu **Nhập hàng bán bị trả lại** (`RECEIPT_SALE_RETURN`) có `source_delivery_id = {phiếu này}` — bất kể trạng thái phiếu con (Nháp / Ghi sổ kho — V2 không có "Đã hủy" theo BR-IDV2-002).
  - Thì: hệ thống chặn xóa, hiển thị popup **"Không thể xóa"** với nội dung liệt kê mã phiếu con: **"Không thể xóa phiếu PX-xxxxx — đã có {N} phiếu nhập hàng bán bị trả lại tham chiếu: PN-yyy01, PN-yyy02, ..."**. **Cap hiển thị tối đa 20 mã đầu** (sắp xếp theo thời gian tạo mới nhất trước); nếu N > 20 → append dòng cuối **"… và {N - 20} phiếu khác. Xem danh sách đầy đủ trong Chi tiết phiếu."** kèm liên kết mở tab chi tiết phiếu Xuất gốc (nơi hiển thị block "Phiếu con liên kết" full-list, RGR RR-045 decision 2026-07-16). Kết thúc content: **"Vui lòng xóa các phiếu trả trước."** → mã lỗi **`ERR-INV-049`**. Nút **"Đóng"**. Chỉ áp cho `DELIVERY_SALE` — các loại Xuất khác không áp (BR-IDV2-034). Chiều cao dialog tối đa 400px; nếu list > 20 mã hiển thị cuộn dọc trong content area, không vỡ layout.

> Lưu ý: theo quyết định nghiệp vụ, phiếu **đã Ghi sổ kho** vẫn xóa được khi kỳ chưa khóa (không bắt buộc Bỏ ghi sổ trước) — chỉ chặn vì kỳ đã đóng, tồn âm, hoặc có phiếu Nhập trả KH tham chiếu.

### Nhóm C — Phân quyền

- [ ] **AC-6**: Phân quyền — chủ garage + kế toán quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14492-89261&t=W7XJPVvhmdBPtv2c-4 |

- Luồng: [UX-FLOW-INVENTORY-DELIVERY-V2](../ux/UX-FLOW-INVENTORY-DELIVERY-V2.md) §3, EC-2/EC-3.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Xóa phiếu: Mutation `[PROPOSED] DeleteDeliveryV2`.

## 5. Business Rules

- **BR-IDV2-006**: Xóa phiếu → tính lại tồn (cộng lại nếu đã ghi sổ).
- **BR-IDV2-007**: Chặn khi kỳ đã khóa; kỳ chưa khóa cho xóa cả phiếu ghi sổ.
- **BR-IDV2-004**: Chặn nếu xóa làm tồn âm (point-in-time).
- **BR-IDV2-034**: Chặn xóa phiếu **Xuất bán** khi có phiếu **Nhập hàng bán bị trả lại** tham chiếu `source_delivery_id` (bất kể trạng thái Nháp/Ghi sổ; `ERR-INV-049`; dialog liệt kê tất cả mã phiếu con). Đối xứng BR-IRV2-035.

## 6. Edge Cases

- **EC-1**: Xóa phiếu Nháp → không tác động tồn.
- **EC-2**: Xóa phiếu Ghi sổ kho (kỳ chưa khóa) → cộng tồn lại; chỉ chặn nếu việc cộng/đảo gây mâu thuẫn tồn âm về sau.
- **EC-3**: Phiếu thuộc kỳ đã đóng → chặn.
- **EC-4**: Xóa phiếu **Xuất bán** đã có phiếu **Nhập hàng bán bị trả lại** (bất kể Nháp/Ghi sổ) source-from → chặn, dialog liệt kê tất cả mã phiếu con (`ERR-INV-049`). User phải xóa các phiếu Nhập trả KH trước rồi mới xóa được phiếu Xuất gốc.

## 7. Out of Scope

- Sửa → `FEAT-ID-EDIT-V2`. Bỏ ghi sổ → `FEAT-ID-DETAIL-V2`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-15 | 3 | Business Authority | **Thêm AC-5 reference-integrity chặn xóa Xuất bán khi có Nhập hàng bán bị trả lại tham chiếu** (BA-review W05 prep — gap phát hiện session cross-check, đối xứng FEAT-IR-DELETE v6 AC-6). AC-5 chỉ áp `DELIVERY_SALE`; check `RECEIPT_SALE_RETURN.source_delivery_id`; áp bất kể trạng thái phiếu con (V2 không có "Đã hủy" theo BR-IDV2-002). Dialog liệt kê **tất cả** mã phiếu con. Mã lỗi `ERR-INV-049` (mới). Renumber AC-5 (Phân quyền) → AC-6. §5 cite BR-IDV2-034 (mới). §6 EC-4 (mới). Cascade BR-GF-INVENTORY-DELIVERY-V2 v37 + ERROR-CODE-REGISTRY v23. |
| 2026-07-16 | 4 | Business Authority (RGR bachho + user sonhoang decision 2026-07-16) | **RGR RR-039 fix — tách AC-4 thành 2 message riêng biệt cho 2 case (kỳ đóng vs tồn âm)**. Trước: 1 message gộp "Phiếu PX-xxxxx thuộc kỳ kế toán đã đóng **hoặc** việc xóa làm tồn kho âm nên không được xóa." — user không biết case nào áp dụng → không biết cách fix. Sau: (a) Case kỳ đóng (`ERR-INV-024`, BR-IDV2-007): "Phiếu PX-xxxxx thuộc kỳ kế toán đã đóng — không thể xóa. Vui lòng liên hệ kế toán trưởng nếu cần mở lại kỳ." (b) Case tồn âm (`ERR-INV-036`, BR-IDV2-004): "Xóa phiếu PX-xxxxx sẽ làm tồn kho âm tại ngày {ngày_vi_phạm_sớm_nhất} (mã {mã_SP}, kho {tên_kho}). Vui lòng điều chỉnh phiếu xuất khác trước khi xóa phiếu này." — cite ngày + mã + kho cụ thể theo cascade recompute (ADR-023). (c) Order priority: nếu cả 2 case cùng đúng → check kỳ đóng trước, user fix xong kỳ mới thấy tồn âm nếu vẫn còn. **KHÔNG đụng** BR-IDV2-007 / BR-IDV2-004 / ERROR-CODE-REGISTRY (2 mã lỗi ERR-INV-024 + ERR-INV-036 đã tồn tại) / Architecture. Pure Product UX detail (message wording). v3 → v4. |
| 2026-07-16 | 5 | Business Authority (RGR bachho + user sonhoang decision 2026-07-16) | **RGR RR-045 fix — AC-5 dialog cap tối đa 20 mã đầu + link chi tiết phiếu gốc**. Trước: liệt kê **tất cả** mã phiếu con — vỡ layout khi N > 100 (phiếu Xuất bán lớn có thể có 200-500 phiếu Nhập trả). Sau: cap 20 mã đầu (sắp xếp theo thời gian tạo mới nhất trước) + append dòng "… và {N - 20} phiếu khác. Xem danh sách đầy đủ trong Chi tiết phiếu." + liên kết mở tab Chi tiết phiếu Xuất gốc (block "Phiếu con liên kết" full-list). Chiều cao dialog tối đa 400px, cuộn dọc trong content area khi > 20 mã. **KHÔNG đụng** BR-IDV2-034 (rule vẫn "liệt kê") / ERROR-CODE-REGISTRY / Architecture. Pure Product UX detail. v4 → v5. |
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-ID-DELETE (mới) — xóa phiếu xuất (cả phiếu đã ghi sổ khi kỳ chưa khóa) + tính lại tồn; chặn khi kỳ đã đóng hoặc xóa làm tồn âm. |
| 2026-06-26 | 2 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14492-89261`. Mobile chưa có. |
