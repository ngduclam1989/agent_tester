---
type: feature
artifact_kind: feature
status: PLANNED
version: 13
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-RECEIPT-V2"
boundary: "gf-inventory"
last_reviewed: "2026-06-29"
supersedes: "FEAT-IR-EDIT"
---
# FEAT-IR-EDIT-V2: Chỉnh sửa phiếu nhập kho (V2)

---

## Metadata


| Field             | Value                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| Feature ID        | `FEAT-IR-EDIT-V2`                                                                                  |
| Title             | Chỉnh sửa phiếu nhập kho (V2)                                                                  |
| Parent Epic       | `EP-INVENTORY-RECEIPT-V2`                                                                          |
| Boundary          | `gf-inventory`                                                                                     |
| Priority          | P1                                                                                                 |
| Status            | PLANNED                                                                                            |
| Depends on        | `EP-INVENTORY-ACCOUNTING-PERIOD` (lock kỳ), `EP-INVENTORY-CATALOG` (mã nội bộ / ĐVT)          |

## 1. User Story

**As** chủ garage / kế toán, **I want** chỉnh sửa phiếu nhập kho (Nháp hoặc Ghi sổ kho khi kỳ chưa khóa), **so that** tôi sửa sai sót — và hệ thống tính lại tồn, chặn tồn âm / kỳ đã khóa.

## 2. Acceptance Criteria

### Nhóm A — Mở form & điều kiện sửa

- [ ]  **AC-1**: Mở form sửa

  - Tại: danh sách (icon Sửa) hoặc chi tiết (nút **"Sửa"**).
  - Khi: chủ garage chọn sửa.
  - Thì: hệ thống mở form **"Sửa phiếu nhập kho"** với mô tả **"Sửa phiếu Nháp hoặc Ghi sổ kho nếu kỳ chưa khóa; hệ thống tính lại tồn khi sửa số lượng/ngày."**, dữ liệu điền sẵn. (Nút **Sửa bị ẩn** khi kỳ đã khóa — xem `FEAT-IR-DETAIL-V2` AC-4. AC-2 dưới đây là **guard phòng vệ** cho trường hợp kỳ bị khóa sau khi form đã mở.)
- [ ]  **AC-2**: Chặn sửa khi kỳ đã khóa

  - Tại: form sửa, khi Lưu.
  - Khi: phiếu (Ghi sổ kho) có ngày chứng từ thuộc **kỳ kế toán đã đóng**.
  - Thì: hệ thống báo lỗi **"kỳ đã khóa"** và không cho lưu.

### Nhóm B — Sửa thông tin & dòng

- [ ]  **AC-3**: Sửa header & dòng

  - Tại: header + tab chi tiết.
  - Khi: chủ garage sửa các trường / dòng (đổi SKU/mã nội bộ, SL, đơn giá, kho, ngày nhập...).
  - Thì: hệ thống nhận giá trị mới; áp các quy tắc đổ dữ liệu + tính SL quy đổi + thành tiền như khi tạo (`FEAT-IR-CREATE-V2`). **Nếu phiếu có gắn PO**: vẫn validate SL nhập ≤ SL đặt hàng (`FEAT-IR-CREATE-V2` AC-3b) — V2 chỉ bỏ *bắt buộc chọn PO*, không bỏ validate khi đã gắn.
- [ ]  **AC-3b**: Nút trên tab chi tiết

  - Tại: tab **CHI TIẾT** (cả form Tạo lẫn Sửa).
  - Khi: form được mở.
  - Thì: thanh trên chỉ có nút **"Thêm phụ tùng"**; **xóa dòng** là **icon ở cột "Thao tác"** trên từng dòng — không có nút "Xóa dòng" hàng loạt ở thanh trên.
- [ ]  **AC-4**: Tính lại tồn

  - Tại: phiếu **Ghi sổ kho** được sửa (kỳ chưa khóa).
  - Khi: thay đổi SL / ngày / sản phẩm / kho / xóa dòng — bất kỳ điều gì ảnh hưởng tồn.
  - Thì: hệ thống **tính lại tồn** theo (mã + kho + gara) và **re-check tồn âm** (chặn nếu vi phạm tại bất kỳ thời điểm nào).

### Nhóm C — Lưu / Đóng

- [ ]  **AC-5**: Lưu thay đổi

  - Tại: nút **"Lưu"**.
  - Khi: dữ liệu hợp lệ, không vi phạm tồn âm / kỳ khóa.
  - Thì: hệ thống lưu, cập nhật tồn (nếu phiếu đã ghi sổ), cập nhật Người sửa / Ngày sửa.
- [ ]  **AC-5b**: Tab Đính kèm

  - Tại: tab **ĐÍNH KÈM**.
  - Khi: chủ garage sửa/thêm/xóa tệp đính kèm của phiếu.
  - Thì: hệ thống cho sửa/thêm/xóa tệp như khi Tạo — tối đa **5 tệp**, mỗi tệp **≤ 30 MB** (`ERR-CMN-004`), định dạng **PDF / JPG / PNG** (`ERR-CMN-005`) — theo chuẩn upload file toàn platform (BR-IRV2-026). Không bắt buộc.
- [ ]  **AC-6**: Đóng

  - Tại: nút **"Đóng"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống đóng form, không lưu thay đổi.

### Nhóm D — Phân quyền

- [ ]  **AC-7**: Phân quyền
  - Tại: form sửa.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò sửa được với quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87558&t=W7XJPVvhmdBPtv2c-4 |

- Luồng: [UX-FLOW-INVENTORY-RECEIPT-V2](../ux/UX-FLOW-INVENTORY-RECEIPT-V2.md) §3, EC-2/EC-5.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Cập nhật phiếu: Mutation `[PROPOSED] UpdateReceiptV2`.

## 5. Business Rules

- **BR-IRV2-005**: Phiếu Nháp sửa tự do (trừ kỳ khóa).
- **BR-IRV2-006**: Tính lại tồn khi sửa/xóa dòng/đổi SP/SL/ngày/kho.
- **BR-IRV2-007**: Lock kỳ đã đóng.
- **BR-IRV2-008**: Chặn tồn âm point-in-time.
- **BR-IRV2-014 / 015**: Đổ dữ liệu SKU/mã nội bộ + SL quy đổi.
- **BR-IRV2-026**: Tệp đính kèm — tối đa 5 tệp, **≤ 30 MB (`ERR-CMN-004`)**, PDF/JPG/PNG (`ERR-CMN-005`); sửa/thêm/xóa như khi Tạo.
- **BR-IRV2-030**: Khi sửa ngày phiếu, chặn nếu ngày nhập mới ≤ "Tồn đến ngày" của OB cùng (mã+kho) → `ERR-INV-038`.

## 6. Edge Cases

- **EC-1**: Sửa phiếu Ghi sổ kho trong kỳ đã đóng → chặn.
- **EC-2**: Sửa SL/ngày làm tồn âm về sau → chặn.
- **EC-3**: Đổi kho dòng → tính lại tồn theo kho mới.
- **EC-4**: Đổi ngày nhập lùi về ≤ "Tồn đến ngày" của OB cùng (mã+kho) → chặn (`ERR-INV-038`).

## 7. Out of Scope

- Tạo phiếu → `FEAT-IR-CREATE-V2`. Ghi sổ / bỏ ghi sổ → `FEAT-IR-DETAIL-V2`. Xóa → `FEAT-IR-DELETE`.

## 8. Change Log


| Date       | Version | Author             | Description                                                                                                                                                                                                                                                         |
| ---------- | ------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-03 | 1       | Business Authority | Khởi tạo FEAT-IR-EDIT-V2 (V2 của FEAT-IR-EDIT) — sửa phiếu Nháp / Ghi sổ kho (kỳ chưa khóa); tính lại tồn khi đổi SL/ngày/SP/kho/xóa dòng; chặn tồn âm + kỳ đã khóa.                                                                      |
| 2026-06-10 | 2       | Business Authority | Thêm §0 Δ Thay đổi so với V1 (map 8 AC ↔ V1, note mới: chặn kỳ khóa + tính lại tồn; mở rộng phạm vi sửa sang phiếu đã Ghi sổ) + gắn tag [GIỮ]/[ĐỔI]/[MỚI] + con trỏ lineage`← FEAT-IR-EDIT AC-n` vào từng AC (để agent truy vết). |
| 2026-06-10 | 3       | Business Authority | Thêm khung**CR** giống mẫu: Metadata (Loại thay đổi CR / Màn hình target FEAT-IR-EDIT / Depends on) + section **§0 Bối cảnh thay đổi (Change Request — DEV đọc trước)**; bảng Δ chuyển xuống §0.1.                                           |
| 2026-06-10 | 4       | Business Authority | Làm rõ AC-3: khi phiếu gắn PO vẫn validate SL nhập ≤ SL đặt hàng (FEAT-IR-CREATE-V2 AC-3b) — đồng bộ với đính chính BR-IRV2-010 (V2 chỉ bỏ bắt buộc chọn PO). |
| 2026-06-10 | 5 | Business Authority | Gỡ mọi nhắc **"Import dòng"** khỏi tài liệu (V1 vốn không có). AC-3b hạ [ĐỔI]→**[GIỮ]** (thêm/xóa dòng giống V1).                                                                                |
| 2026-06-10 | 6 | Business Authority | Gỡ khung mapping V1↔V2 (CR, §0 Bối cảnh, bảng Δ, lineage tags) — spec V2 đứng độc lập; giữ nguyên toàn bộ nội dung nghiệp vụ. |
| 2026-06-15 | 7 | Business Authority | Theo quyết định BA: §5 + EC-4 — chặn đổi ngày phiếu nhập lùi về ≤ "Tồn đến ngày" của OB (BR-IRV2-030, `TRANSACTION_BEFORE_OPENING_BALANCE`). |
| 2026-06-16 | 8 | Business Authority | Đăng ký mã lỗi: đổi mã bare → ERR-INV-NNN (ERROR-CODE-REGISTRY §4). |
| 2026-06-16 | 9 | Business Authority | Fix (quyết định BA cuối): kỳ đã khóa → ẩn nút Sửa (đảo lại "Sửa vẫn hiện"); làm rõ Thêm mới chặn khi Lưu (BR-IRV2-007). Guard Lưu = phòng vệ. |
| 2026-06-16 | 10 | Business Authority | Nhất quán với BR-IRV2-026 (map cả CREATE + EDIT): thêm **AC-5b** tab Đính kèm (sửa/thêm/xóa tệp như khi Tạo — ≤10MB, PDF/JPG/PNG, ERR-CMN-004/005) + bổ sung BR-IRV2-026 vào §5. |
| 2026-06-26 | 11 | Business Authority | **Nâng giới hạn file đính kèm 10 MB → 30 MB**: AC-5b + BR-IRV2-026 mirror — "≤ 10 MB (`ERR-CMN-004`)" → "**≤ 30 MB (`ERR-INV-048`** mới — giới hạn Inventory V2)". ERR-CMN-005 + max 5 tệp giữ nguyên. Đồng bộ BR-IRV2-026 v25 + FEAT-IR-CREATE-V2 v20 + ERROR-CODE-REGISTRY v17. |
| 2026-06-26 | 12 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14146-87558`. Mobile chưa có. |
| 2026-06-29 | 13 | Business Authority | **Đồng bộ approach 30 MB toàn Inventory V2 — đảo `ERR-INV-048` → `ERR-CMN-004`**: BA chốt all-30MB toàn Inventory V2 đồng nhất → `ERR-CMN-004` common message sẽ đổi "10MB" → "30MB". AC-5b + BR-IRV2-026 mirror phục hồi wording "theo chuẩn upload file toàn platform". Đồng bộ BR-IRV2-026 v25 + FEAT-IR-CREATE-V2 v22 + ERROR-CODE-REGISTRY. |
