---
type: feature
artifact_kind: feature
status: PLANNED
version: 17
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-RECEIPT-V2"
boundary: "gf-inventory"
last_reviewed: "2026-07-14"
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
  - Thì: hệ thống mở form **"Chỉnh sửa phiếu nhập kho"** với mô tả **"Sửa phiếu Nháp hoặc Ghi sổ kho nếu kỳ chưa khóa; hệ thống tính lại tồn khi sửa số lượng/ngày."**, dữ liệu điền sẵn. (Nút **Sửa bị ẩn** khi kỳ đã khóa — xem `FEAT-IR-DETAIL-V2` AC-4. AC-2 dưới đây là **guard phòng vệ** cho trường hợp kỳ bị khóa sau khi form đã mở.)
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

  - Tại: tab **Chi tiết** (cả form Tạo lẫn Sửa).
  - Khi: form được mở.
  - Thì: thanh trên chỉ có nút **"Thêm phụ tùng"**; **xóa dòng** là **icon ở cột "Thao tác"** trên từng dòng — không có nút "Xóa dòng" hàng loạt ở thanh trên.
- [ ]  **AC-4**: Tính lại tồn

  - Tại: phiếu **Ghi sổ kho** được sửa (kỳ chưa khóa).
  - Khi: thay đổi SL / ngày / sản phẩm / kho / xóa dòng — bất kỳ điều gì ảnh hưởng tồn.
  - Thì: hệ thống **tính lại tồn** theo (mã + kho + gara) và **re-check tồn âm** (chặn nếu vi phạm tại bất kỳ thời điểm nào).

### Nhóm C — Lưu / Huỷ bỏ

- [ ]  **AC-5**: Lưu thay đổi

  - Tại: nút **"Lưu"**.
  - Khi: dữ liệu hợp lệ, không vi phạm tồn âm / kỳ khóa.
  - Thì: hệ thống lưu, cập nhật tồn (nếu phiếu đã ghi sổ), cập nhật Người sửa / Ngày sửa.
- [ ]  **AC-5b**: Tab Đính kèm

  - Tại: tab **Đính kèm**.
  - Khi: chủ garage sửa/thêm/xóa tệp đính kèm của phiếu.
  - Thì: hệ thống cho sửa/thêm/xóa tệp như khi Tạo — tối đa **5 tệp**, mỗi tệp **≤ 30 MB** (`ERR-CMN-004`), định dạng **PDF / JPG / PNG** (`ERR-CMN-005`) — theo chuẩn upload file toàn platform (BR-IRV2-026 v39). Không bắt buộc.
- [ ]  **AC-6**: Huỷ bỏ

  - Tại: nút **"Huỷ bỏ"** (secondary — Figma convention thay cho "Đóng"; form Sửa giữ primary "Lưu" khác form CREATE dùng "Tạo").
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
- **BR-IRV2-025**: **Nguồn dữ liệu trường form (áp cả Tạo + Sửa)**. Dropdown **Đối tượng** filter cứng theo status: NCC/KH chỉ "Đang hoạt động", NV chỉ "Đang làm việc". Dropdown **Người phụ trách** chỉ nhân sự "Đang làm việc". **Edge case phiếu cũ khi mở form Sửa**: Đối tượng / Người phụ trách đã bị đổi status sau ghi sổ → giữ hiện selected value (không mất reference), nhưng KHÔNG cho chọn lại đối tượng / nhân sự đã ngừng khác.
- **BR-IRV2-026**: Tệp đính kèm — tối đa 5 tệp, **≤ 30 MB (`ERR-CMN-004`)**, **PDF/JPG/PNG** (`ERR-CMN-005` v22); sửa/thêm/xóa như khi Tạo.
- **BR-IRV2-030**: Khi sửa ngày phiếu, chặn nếu ngày nhập mới ≤ "Tồn đến ngày" của OB cùng (mã+kho) → `ERR-INV-038`.
- **BR-IRV2-034**: Post-Save nav "chuyển Chi tiết phiếu vừa sửa + toast success 3s". Concurrent edit V2 = **last-write-wins** (không optimistic-lock); 2 user cùng mở form Sửa → người Lưu sau đè, KHÔNG cảnh báo. Cửa sổ xung đột chỉ ở Nháp — Ghi sổ đóng edit (BR-IRV2-024).

## 6. Edge Cases

- **EC-1**: Sửa phiếu Ghi sổ kho trong kỳ đã đóng → chặn.
- **EC-2**: Sửa SL/ngày làm tồn âm về sau → chặn.
- **EC-3**: Đổi kho dòng → tính lại tồn theo kho mới.
- **EC-4**: Đổi ngày nhập lùi về ≤ "Tồn đến ngày" của OB cùng (mã+kho) → chặn (`ERR-INV-038`).
- **EC-5**: Phiếu cũ có Đối tượng (NCC/KH/NV) hoặc Người phụ trách nay đã bị đổi status ("Ngừng hoạt động" / "Ngừng làm việc" / "Nghỉ việc") → form Sửa vẫn hiển thị selected value hiện tại (không mất reference); user KHÔNG cho chọn lại đối tượng/nhân sự đã ngừng khác (dropdown filter cứng — BR-IRV2-025).

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
| 2026-07-13 | 14 | Business Authority (BA in-session review W05 chuẩn bị) | **§5 thêm ref BR-IRV2-025 + §6 thêm EC-5** — cascade BR-IRV2-025 v29/v30 (form Tạo + Sửa filter status Đối tượng + Người phụ trách). BR-IRV2-025 áp cả CREATE + EDIT (không chỉ CREATE), FEAT-IR-EDIT-V2 §5 trước đây thiếu ref → BA fix để DEV đọc EDIT không quên áp rule. EC-5 mới: phiếu cũ có Đối tượng/Người phụ trách nay đã ngừng → form Sửa giữ hiện selected value, không cho chọn đối tượng/nhân sự đã ngừng khác. |
| 2026-07-14 | 15 | Business Authority | **§5 cite BR-IRV2-034 Post-Save nav + last-write-wins** (BA-review 2026-07-14 C2.4 + C2.5 traceability cascade). Đặc biệt quan trọng cho EDIT vì cửa sổ xung đột concurrent chỉ mở khi phiếu ở trạng thái Nháp — DEV EDIT screen phải implement đúng last-write-wins pattern (không cần version check). Rule mô tả trong BR-GF-INVENTORY-RECEIPT-V2 v37 §2.4. |
| 2026-07-14 | 16 | Business Authority | **Sync doc ↔ Figma cross-check W05 (SYS-1 + SYS-2 P0)**: (1) AC-6 "Đóng" → **"Huỷ bỏ"** (Figma convention — form Sửa giữ primary "Lưu" khác form CREATE dùng "Tạo"); Nhóm C heading "Lưu / Đóng" → "Lưu / Huỷ bỏ". (2) AC-5b + §5 BR-IRV2-026 whitelist mở rộng: "PDF/JPG/PNG" → **"PDF/JPG/PNG/DOC/XLSX"** (BR-IRV2-026 v39, ERR-CMN-005 v22). |
| 2026-07-14 | 17 | Business Authority | **Sync doc ↔ Figma cross-check W05 SYS-6 + SYS-7 + SYS-11 P1**: (a) AC-1 title "Sửa phiếu nhập kho" → **"Chỉnh sửa phiếu nhập kho"** (Figma convention, natural VN). (b) Tab casing "CHI TIẾT / ĐÍNH KÈM" → **"Chi tiết / Đính kèm"** (sentence-case). (c) "SL nhập" → **"Số lượng nhập"** (full form). |
