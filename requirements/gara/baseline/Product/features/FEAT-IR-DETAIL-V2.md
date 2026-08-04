---
type: feature
artifact_kind: feature
status: PLANNED
version: 18
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-RECEIPT-V2"
boundary: "gf-inventory"
last_reviewed: "2026-07-31"  # v18 (user directive 2026-07-31) — AC-1 thêm entry point từ FEAT-STK-DETAIL-V2 (link cột "Số phiếu" trên thẻ kho, chuyển màn không mở tab mới).
supersedes: "FEAT-IR-DETAIL"
---

# FEAT-IR-DETAIL-V2: Chi tiết phiếu nhập kho (V2)

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-IR-DETAIL-V2` |
| Title | Chi tiết phiếu nhập kho (V2) |
| Parent Epic | `EP-INVENTORY-RECEIPT-V2` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |
| Depends on | `EP-INVENTORY-ACCOUNTING-PERIOD` (lock kỳ), `EP-INVENTORY-STOCK-V2` (ghi sổ → biến động tồn) |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết phiếu nhập kho và thực hiện ghi sổ / bỏ ghi sổ / sửa / xóa / in, **so that** tôi kiểm soát vòng đời phiếu và tác động tồn kho.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị chi tiết

- [ ] **AC-1**: Mở màn chi tiết
  - Tại: danh sách, nhấn Số phiếu; **hoặc từ thẻ kho** (`FEAT-STK-DETAIL-V2`), nhấn **"Số phiếu"** trên dòng phiếu nhập (v18 — click → **chuyển màn**, không mở tab mới, khác pattern "Số phiếu xuất" của AC-2).
  - Khi: chủ garage chọn xem.
  - Thì: hệ thống mở màn **"Chi tiết phiếu nhập kho [số phiếu]"** với mô tả **"Dạng xem phiếu đã ghi sổ, giữ layout theo mẫu popup phiếu nhập."**, header read-only + tab **Chi tiết** / **Đính kèm**, sidebar Tổng giá trị, các nút hành động.

- [ ] **AC-2**: Thông tin hiển thị
  - Tại: header + tab chi tiết.
  - Thì: hệ thống hiển thị read-only toàn bộ trường header (Loại phiếu, Mã đơn hàng, Mã lô hàng, **Số phiếu xuất** [link tham chiếu tới phiếu Xuất bán gốc — chỉ hiển thị khi Loại phiếu = **Nhập hàng bán bị trả lại** / `RECEIPT_SALE_RETURN`, click → mở phiếu Xuất bán nguồn ở tab mới; các loại khác **ẩn** field này], Đối tượng, Người phụ trách, Người giao hàng, Kho nhập, Diễn giải, Số phiếu, Ngày nhập kho, Trạng thái) + bảng dòng chi tiết (SKU, mã nội bộ, ĐVT nhập, Số lượng nhập, SL quy đổi, ĐVT chính, đơn giá nhập, thành tiền, kho, ghi chú) + dòng Tổng.

- [ ] **AC-3**: Thông tin audit
  - Tại: cuối màn.
  - Thì: hệ thống hiển thị Ngày tạo / Người tạo / Ngày sửa / Người sửa.

### Nhóm B — Ẩn/hiện nút theo trạng thái & kỳ

- [ ] **AC-4**: Ẩn/hiện nút hành động
  - Tại: thanh nút đầu màn chi tiết.
  - **Web** — Khi: phiếu **"Nháp"** và kỳ kế toán **chưa khóa**.
  - Thì: hệ thống hiển thị **"Sửa"**, **"Xóa"**, **"Ghi sổ kho"** (ẩn "Bỏ ghi sổ kho").
  - **Web** — Khi: phiếu **"Ghi sổ kho"** và kỳ kế toán **chưa khóa**.
  - Thì: hệ thống hiển thị **"Sửa"**, **"Xóa"**, **"Bỏ ghi sổ kho"** (ẩn "Ghi sổ kho").
  - **Web** — Khi: ngày chứng từ phiếu thuộc **kỳ kế toán đã khóa**.
  - Thì: hệ thống **ẩn các nút thao tác (Sửa / Xóa / Ghi sổ kho / Bỏ ghi sổ kho)**.
  - **Web** — Khi: bất kỳ trạng thái / kỳ nào.
  - Thì: **"In phiếu nhập"** **luôn hiển thị** (không phụ thuộc trạng thái hay kỳ).
  - **Mobile** (mobile-only pattern, khác web — mobile Detail chỉ có Post/Unpost, KHÔNG có Sửa/Xóa/In per PKG-W05 §2.2.4; v17 **REVERT** v12 proactive-hide theo BA clarify — nút Post/Unpost LUÔN HIỂN THỊ, reactive-only guard qua toast/popup sau tap) — Khi: phiếu **"Nháp"** (bất kể kỳ mở/đóng).
  - Thì: hệ thống hiển thị **CHỈ nút "Ghi sổ kho"** (ẩn "Bỏ ghi sổ kho" vì status=Nháp). Không có nút Sửa / Xóa / In trên mobile (3 op web-only). Kỳ đóng behavior handled tại AC-5 (toast trong guard chain).
  - **Mobile** — Khi: phiếu **"Ghi sổ kho"** (bất kể kỳ mở/đóng).
  - Thì: hệ thống hiển thị **CHỈ nút "Bỏ ghi sổ kho"** (ẩn "Ghi sổ kho" vì status=Ghi sổ kho). Kỳ đóng behavior handled tại AC-6 (toast trong guard chain).

### Nhóm C — Hành động ghi sổ

- [ ] **AC-5**: Ghi sổ kho (v17 — 2-step guard chain trên mobile)
  - Tại: nút **"Ghi sổ kho"** (phiếu đang Nháp).
  - **Web** — Khi: chủ garage nhấn.
    - Thì: hệ thống hiển thị **popup xác nhận verbatim** **"Bạn có chắc chắn muốn thực hiện Ghi sổ kho phiếu này hay không?"** + button **[Đóng]** + **[Xác nhận]** (đối xứng FEAT-ID-DETAIL-V2 AC-5). Click **[Đóng]** → hủy Ghi sổ, phiếu giữ Nháp. Click **[Xác nhận]** → cộng tồn theo SL quy đổi cho từng (mã + kho + gara), chuyển trạng thái **"Ghi sổ kho"**. Trước khi cộng: **bắt buộc mọi dòng có mã nội bộ** (BR-IRV2-028 — phiếu Nền tảng còn dòng chỉ có SKU → chặn `ERR-INV-011`) + **check tồn âm** (chặn nếu vi phạm → `ERR-INV-036`) + **lock kỳ** (chặn nếu kỳ đã đóng → `ERR-INV-024`).
  - **Mobile** (v17 revise — 2-step guard chain, mirror `FEAT-IR-LIST-V2` AC-8 mobile inline) — Khi: chủ garage tap nút Ghi sổ kho.
    - Bước 1: gọi **`checkAccountingPeriodLock(date: entryDate)`**. Response `locked=true` → common toast "Kỳ kế toán đã khóa, không thể thực hiện" (2s snackbar) + STOP.
    - Bước 2 (`locked=false`): hiển thị popup xác nhận verbatim `"Bạn có chắc chắn muốn thực hiện Ghi sổ kho phiếu này hay không?"` + 2 nút `[Huỷ | Xác nhận]`. Huỷ → giữ Nháp. Xác nhận → bước 3.
    - Bước 3: gọi **`getInheritedReceiptFromSaleDelivery(receiptId)`**. Response `mismatch=true` → hiển thị popup mismatch warning `22260:24396` (xem AC-9 v17). User trong popup mismatch: [Huỷ]=giữ Nháp · [Xác nhận]=force-through, tiếp bước 4. Response `mismatch=false` → bước 4 trực tiếp.
    - Bước 4: gọi mutation **`postReceiptV2(id, idempotencyKey)`** → thành công: badge chuyển "Ghi sổ kho" + nút Detail lật thành "Bỏ ghi sổ kho" + sổ tồn cộng đúng SL quy đổi. Guard bên BE: BR-IRV2-028/036/024 vẫn enforce ở mutation layer làm defense-in-depth.

- [ ] **AC-6**: Bỏ ghi sổ kho (v17 — 1-step guard chain trên mobile, KHÔNG check mismatch)
  - Tại: nút **"Bỏ ghi sổ kho"** (phiếu đang Ghi sổ kho).
  - **Web** — Khi: chủ garage nhấn.
    - Thì: hệ thống hiển thị **popup xác nhận verbatim** **"Bạn có chắc chắn muốn thực hiện Bỏ ghi sổ kho phiếu này hay không?"** + button **[Đóng]** + **[Xác nhận]** (đối xứng FEAT-ID-DETAIL-V2 AC-6). Click **[Đóng]** → hủy Bỏ ghi sổ, phiếu giữ Ghi sổ kho. Click **[Xác nhận]** → trừ tồn đã cộng, đưa phiếu về **"Nháp"**. Nếu việc trừ làm tồn âm ở thời điểm về sau → chặn (`ERR-INV-036`); nếu kỳ đã đóng → chặn (`ERR-INV-024`).
  - **Mobile** (v17 revise — mirror `FEAT-IR-LIST-V2` AC-8 mobile inline; KHÔNG check `getInheritedReceiptFromSaleDelivery`) — Khi: chủ garage tap nút Bỏ ghi sổ kho.
    - Bước 1: gọi **`checkAccountingPeriodLock(date: entryDate)`**. Response `locked=true` → common toast + STOP.
    - Bước 2 (`locked=false`): popup xác nhận verbatim `"Bạn có chắc chắn muốn thực hiện Bỏ ghi sổ kho phiếu này hay không?"` + 2 nút `[Huỷ | Xác nhận]`. Huỷ → giữ Ghi sổ kho. Xác nhận → gọi mutation **`unpostReceiptV2(id, idempotencyKey)`** → badge về "Nháp" + nút lật lại + sổ tồn đảo. BE guard `ERR-INV-036` / `ERR-INV-024` giữ nguyên (defense-in-depth).

### Nhóm D — Sửa / Xóa / In

- [ ] **AC-7**: Các nút hành động
  - Tại: đầu màn chi tiết.
  - Khi: chủ garage nhấn (nút hiển thị theo AC-4).
  - Thì: **"Sửa"** → `FEAT-IR-EDIT-V2`; **"Xóa"** → `FEAT-IR-DELETE`; **"In phiếu nhập"** → `FEAT-IR-PRINT`.

### Nhóm E — Phân quyền

- [ ] **AC-8**: Phân quyền
  - Tại: màn chi tiết.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò xem và thao tác với quyền ngang nhau.

### Nhóm F — Popup mismatch warning (mobile-only, v17 revise)

- [ ] **AC-9**: Popup "Không thể xoá" — cảnh báo mismatch khi Ghi sổ kho (mobile-only, force-through pattern; mirror `FEAT-IR-LIST-V2` AC-11)
  - Tại: mobile — flow **Ghi sổ kho** trên màn Chi tiết (nút AC-4) — mã Figma popup: `22260:24396` (xem §3).
  - Khi: user tap "Ghi sổ kho" (phiếu Nháp) → chạy guard chain AC-5 v17 bước 3: sau khi user đã confirm popup "Chắc chắn Ghi sổ" và trước khi mutation `postReceiptV2`, hệ thống gọi **`getInheritedReceiptFromSaleDelivery(receiptId)`**. Response detect **phụ tùng nhập đã được xuất kho (`phiếu xuất kho`) phục vụ phiếu dịch vụ (SO)** nhưng SL giữa 2 phiếu chưa trùng khớp → **hiển thị popup này**.
  - Thì: popup overlay 375×812 (barrier + Popover content), chứa:
    - **Tiêu đề nội dung verbatim** (giữ nguyên placeholder mã phiếu): *"Số lượng phụ tùng trong phiếu xuất kho và phiếu dịch vụ `#mã_phiếu` chưa trùng khớp. Vui lòng cập nhật chính xác số lượng phụ tùng."*
    - **Danh sách phụ tùng lệch** (dòng lặp lại per item từ response `getInheritedReceiptFromSaleDelivery`), format verbatim: *"Phụ tùng `{tên}` thừa `{n}` cái chưa khớp phiếu xuất kho"* — scroll trong overlay nếu vượt chiều cao.
    - **Action bar 2 nút** (Figma partial `_Partials/Action bar 2-button`): **[Huỷ]** (secondary) + **[Xác nhận]** (primary). Semantic **force-through** (chốt v17):
      - **[Huỷ]** → dismiss popup, **cancel Ghi sổ kho**, phiếu giữ trạng thái **Nháp** (không gọi mutation).
      - **[Xác nhận]** → dismiss popup, **chạy tiếp mutation `postReceiptV2`** bình thường (force-through — accept SL mismatch, tồn cộng theo SL phiếu nhập, downstream SO reconciliation vẫn lệch cho tới khi user chỉnh phiếu Xuất/SO manual). Không cần flag `force: true` mới trên BFF — mutation hiện tại tự xử lý; popup chỉ là UX warning layer trước khi commit.
  - Ghi chú spec:
    - Icon overlay `vuesax/bold/clipboard-close` được ẩn ở variant này (hidden per Figma), không render.
    - Popup **CHỈ áp cho flow Ghi sổ kho** (AC-5 mobile bước 3). Flow **Bỏ ghi sổ** (AC-6) KHÔNG gọi `getInheritedReceiptFromSaleDelivery` → không hiển thị popup này.
    - `getInheritedReceiptFromSaleDelivery` là op **NEW** (v17) — chưa ratified trong BFF/BE SDL W05 hiện tại. Response cần tối thiểu `{ mismatch: Boolean!, items: [{name: String!, excessQty: Int!}]! }` — cascade Architecture Authority ratify contract + owner (BE `gf-inventory` hay BFF `agg-garage-graph` aggregate?) trước /dev-start.
  - Web: **không áp dụng** — web Detail có Xoá (`FEAT-IR-DELETE`) không cần popup này; nếu web cũng cần warning mismatch khi Ghi sổ → separate CR cho web tier.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87557&t=W7XJPVvhmdBPtv2c-4 |
| Figma | mobile | https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21629-24082&t=30dKkXMi0PSOdK7b-4 |
| Figma | mobile | https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=22260-24396&t=30dKkXMi0PSOdK7b-4 |

> **Split-mode registry** (`Product/ux/figma/figma-links.yaml` waves.05.FEAT-IR-DETAIL-V2.mobile.screens`): 2 entry — slug `main` (`21629:24082`) là màn Chi tiết chính; slug `post-mismatch-warning-popup` (`22260:24396`) là popup cảnh báo SL mismatch khi Ghi sổ kho (v17 revise semantic từ "delete-blocker" — xem AC-9). Prefetch sinh 2 spec file: `wave05-ir-detail-v2--main.md` + `wave05-ir-detail-v2--post-mismatch-warning-popup.md`.

- Luồng: [UX-FLOW-INVENTORY-RECEIPT-V2](../ux/UX-FLOW-INVENTORY-RECEIPT-V2.md) §3.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Chi tiết phiếu: Query `[PROPOSED] GetReceiptV2`.
- Ghi sổ / bỏ ghi sổ: Mutation `[PROPOSED] PostReceiptV2` / `[PROPOSED] UnpostReceiptV2`.

## 5. Business Rules

- **BR-IRV2-002**: Vòng đời Nháp → Ghi sổ kho → Bỏ ghi sổ kho.
- **BR-IRV2-003 / 004**: Ghi sổ cộng tồn / bỏ ghi sổ trừ tồn.
- **BR-IRV2-007**: Lock kỳ đã đóng.
- **BR-IRV2-008**: Chặn tồn âm point-in-time.
- **BR-IRV2-022**: Hiển thị audit.
- **BR-IRV2-031** *(v17 revise — mirror `FEAT-IR-LIST-V2` v14; post-mismatch warning force-through)*: Guard mobile — flow **Ghi sổ kho** trên mobile Detail (AC-5 v17 bước 3) gọi `getInheritedReceiptFromSaleDelivery(receiptId)` sau khi user confirm popup "Chắc chắn Ghi sổ" và trước khi gọi `postReceiptV2` mutation. Nếu response `mismatch=true` → hiển thị popup cảnh báo "Không thể xoá" (Figma `22260:24396`, xem AC-9) liệt kê phụ tùng lệch. User [Xác nhận] = force-through → chạy tiếp mutation; [Huỷ] = cancel, giữ Nháp. Popup KHÔNG áp cho flow Bỏ ghi sổ. Op `getInheritedReceiptFromSaleDelivery` là NEW (chưa ratified BFF/BE SDL W05) — cascade Architecture Authority ratify contract trước /dev-start.

## 6. Edge Cases

- **EC-1**: Bỏ ghi sổ làm tồn âm về sau → chặn.
- **EC-2**: Phiếu thuộc kỳ đã đóng → các hành động ghi sổ/bỏ ghi sổ/sửa/xóa bị chặn.
- **EC-3** *(v17 revise)*: Phiếu Nháp có dòng phụ tùng đã xuất kho khớp SO nhưng SL không cân — flow Ghi sổ mobile Detail (AC-5 v17 bước 3) → sau confirm "Chắc chắn Ghi sổ" hiển thị popup AC-9 cảnh báo mismatch. User [Xác nhận] force-through commit mutation `postReceiptV2` (chấp nhận sổ tồn downstream tiếp tục lệch); [Huỷ] giữ Nháp.

## 7. Out of Scope

- Chỉnh sửa → `FEAT-IR-EDIT-V2`. Xóa → `FEAT-IR-DELETE`. In → `FEAT-IR-PRINT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-IR-DETAIL-V2 (V2 của FEAT-IR-DETAIL) — xem phiếu + Ghi sổ kho / Bỏ ghi sổ kho (cộng/trừ tồn, check tồn âm + lock kỳ) + Sửa/Xóa/In; audit. Thêm AC-4 ẩn/hiện nút theo trạng thái + kỳ (Nháp: Sửa/Xóa/Ghi sổ; Ghi sổ kho: Sửa/Xóa/Bỏ ghi sổ — kỳ chưa khóa; kỳ đã khóa ẩn nút thao tác; In luôn hiện). |
| 2026-06-10 | 2 | Business Authority | Thêm §0 Δ Thay đổi so với V1 (map 8 AC ↔ V1, note bỏ "Hủy phiếu" V1 → thay bằng Xóa; "Hoàn tất"/"Hoàn tác" → "Ghi sổ"/"Bỏ ghi sổ") + gắn tag [GIỮ]/[ĐỔI]/[MỚI] + con trỏ lineage `← FEAT-IR-DETAIL AC-n` vào từng AC (để agent truy vết). |
| 2026-06-10 | 3 | Business Authority | Thêm khung **CR** giống mẫu: Metadata (Loại thay đổi CR / Màn hình target FEAT-IR-DETAIL / Depends on) + section **§0 Bối cảnh thay đổi (Change Request — DEV đọc trước)**; bảng Δ chuyển xuống §0.1. |
| 2026-06-10 | 4 | Business Authority | AC-5 (Ghi sổ kho): thêm điều kiện **bắt buộc mọi dòng có mã nội bộ** trước khi cộng tồn (BR-IRV2-028, `INTERNAL_PRODUCT_REQUIRED`) — phiếu Nền tảng còn dòng chỉ có SKU thì chặn. |
| 2026-06-10 | 5 | Business Authority | Gỡ khung mapping V1↔V2 (CR, §0 Bối cảnh, bảng Δ, lineage tags) — spec V2 đứng độc lập; giữ nguyên toàn bộ nội dung nghiệp vụ. |
| 2026-06-16 | 6 | Business Authority | Fix (quyết định BA — ý f): AC-4 kỳ đã khóa → **nút "Sửa" vẫn hiển thị** (mở form được, chặn khi Lưu — FEAT-IR-EDIT-V2 AC-2); chỉ ẩn Xóa/Ghi sổ/Bỏ ghi sổ. Đồng bộ BR-IRV2-024. |
| 2026-06-16 | 7 | Business Authority | Đăng ký mã lỗi: đổi mã bare → ERR-INV-NNN (ERROR-CODE-REGISTRY §4). |
| 2026-06-16 | 8 | Business Authority | Fix (quyết định BA cuối): kỳ đã khóa → ẩn nút Sửa (đảo lại "Sửa vẫn hiện"); làm rõ Thêm mới chặn khi Lưu (BR-IRV2-007). Guard Lưu = phòng vệ. |
| 2026-06-26 | 9 | Business Authority | **Gắn Figma web + mobile vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14146-87557`, mobile node `21629-24082`. |
| 2026-07-14 | 10 | Business Authority | **AC-2 thêm cross-ref field "Số phiếu xuất"** (Figma-crosscheck W05 BUG-3 P1 unblock, BA chốt Option A). Field chỉ hiển thị conditional khi Loại phiếu = `RECEIPT_SALE_RETURN` (Nhập hàng bán bị trả lại) — link tới phiếu Xuất bán gốc; click mở phiếu nguồn ở tab mới. Các loại khác ẩn field. Figma render đúng — trước đây FEAT AC không declare field này. |
| 2026-07-14 | 11 | Business Authority | **Sync doc ↔ Figma cross-check W05 SYS-6 + SYS-11 P1**: (a) Tab casing "CHI TIẾT / ĐÍNH KÈM" → **"Chi tiết / Đính kèm"** trong AC-1. (b) Bảng dòng chi tiết cột "SL nhập" → **"Số lượng nhập"** trong AC-2 (full form Figma convention; SL quy đổi viết tắt giữ nguyên). |
| 2026-07-16 | 12 | Business Authority | **AC-4 thêm mobile carve-out** (GAP-01 pre-DEV W05 rà soát — mirror pattern FEAT-IR-LIST-V2 AC-8 đã tách web/mobile inline). Web giữ nguyên baseline (Sửa / Xóa / Ghi sổ hoặc Bỏ ghi sổ theo trạng thái + kỳ; In luôn hiện). **Mobile**: chỉ hiện nút Ghi sổ / Bỏ ghi sổ (ẩn Sửa / Xóa / In per PKG-W05 §2.2.4 — 4 op web-only). Kỳ đã khóa → ẩn cả 2 nút trên mobile (Detail read-only hoàn toàn). Trước đây AC-4 default implicit "cả 2 platform hiện Sửa / Xóa / In" → mâu thuẫn PKG-W05 mobile scope + inconsistent với LIST-V2 AC-8 đã carve-out. |
| 2026-07-16 | 13 | Business Authority | **Fix enum drift `RECEIPT_RETURN_FROM_SALES` → `RECEIPT_SALE_RETURN`** (BA-review Cycle 3 F-NEW-1 P1 HIGH — cross-layer drift Product ↔ Architecture). AC-2 body line 45 + CL v10 line 141 dùng tên bịa `RECEIPT_RETURN_FROM_SALES` (từ 2026-07-14 khi add conditional field "Số phiếu xuất") — không match canonical `RECEIPT_SALE_RETURN` lock tại BR-IRV2-009 + Architecture (SDL + HLD + event). Nếu DEV copy paste enum sai → BE reject unknown enum → conditional field "Số phiếu xuất" không hiển thị khi user mở phiếu loại "Nhập hàng bán bị trả lại", link ngược phiếu Xuất bán gốc broken → kế toán không trace back được. Sed replace 2 hit (AC-2 + CL v10). Cascade Figma prefetch cascade tự close 5 file downstream (wave05-ir-detail-v2.md + oracle test files) khi regenerate. Đồng bộ FEAT-IR-PRINT v8. |
| 2026-07-16 | 14 | Business Authority (RGR bachho + user sonhoang decision 2026-07-16) | **RGR RR-021 fix — AC-5 + AC-6 explicit 2 button [Đóng]+[Xác nhận] verbatim** (đối xứng FEAT-ID-DETAIL-V2 AC-5/AC-6 đã có `[Đóng]+[Xác nhận]`). Trước: AC-5 + AC-6 chỉ nói "popup xác nhận" + wording verbatim, DEV phải đoán button layout. Sau: explicit **[Đóng]** + **[Xác nhận]** + hành vi từng button ([Đóng] hủy giữ trạng thái cũ · [Xác nhận] thực hiện commit + guard chain). Bổ sung note "Web + Mobile Chi tiết share cùng flow, popup verbatim identical" + "Mobile List inline Ghi sổ cùng semantic — xem FEAT-IR-LIST-V2". No cascade BR / Architecture / API contract — pure UX spec detail (popup wording + button layout). v13 → v14. |
| 2026-07-17 | 15 | Business Authority (user sonhoang directive 2026-07-17) | **Add AC-9 Popup "Không thể xoá" mobile-only + split registry entry** — mirror FEAT-IR-LIST-V2 v12 AC-11 cho Detail. Node Figma mobile mới `22260-24396` là variant "Popup không thể xoá" liệt kê phụ tùng lệch số lượng giữa phiếu xuất kho + phiếu dịch vụ. Detail add: AC-9 (nội dung popup verbatim + button đóng đơn + không có nhánh "force delete") · §3 đổi table 3-cột (thêm cột `Screen slug`) + 3 row (web/mobile-main/mobile-delete-blocker-popup) · §5 add BR-IRV2-031 (NEED CONFIRMATION BA — trigger context delete-vs-unpost trên Detail; Detail có Xoá trên web AC-4/AC-7, mobile chỉ Post/Unpost per v12 carve-out) · §6 add EC-3. Registry `figma-links.yaml` waves.05.FEAT-IR-DETAIL-V2.mobile.screens chuyển từ single (slug:null) → split (main + delete-blocker-popup); prefetch sinh 2 spec file. Cascade từ FEAT-IR-LIST-V2 v12; Execution/wave-specs/W05/Product/features/mobile mirrors cần cập nhật cùng batch. **Chưa cascade BR-IRV2-031 chi tiết + Architecture/API guard** — chờ BA chốt trigger context + có nên bổ sung nút Xoá mobile hay áp popup vào flow Bỏ ghi sổ. v14 → v15. |
| 2026-07-17 | 16 | Business Authority (post-prefetch verification fix 2026-07-17) | **AC-9 button count drift fix — Figma render 2 nút `[Huỷ \| Xác nhận]` không phải 1 nút "Đóng"** như v15 initial patch (mirror FEAT-IR-LIST-V2 v13 CL). Update AC-9 Action bar description: 2-button `_Partials/Action bar 2-button` + flag semantic NEED CONFIRMATION BA giữa 2 phương án: (a) acknowledge-only vs (b) force-through override. Discovered qua worker `agent-figma-prefetch-worker` output G-1 khi worker fetch fresh MCP `get_metadata` + `get_design_context` cho node `22260:24396` và phát hiện shared instance `_Partials/Action bar 2-button`. v15 initial patch dựa trên `get_metadata` top-level không expand deep vào Action bar internals → 1-button assumption sai. Cascade từ FEAT-IR-LIST-V2 v13. Execution spec mirrors cần bump SHA + Change Log. v15 → v16. |
| 2026-07-17 | 17 | Business Authority (BA sonhoang flow clarify 2026-07-17) | **Rewrite AC-4/AC-5/AC-6/AC-9 semantic + REVERT v12 proactive-hide** — mirror FEAT-IR-LIST-V2 v14 BA clarify. (1) AC-4 mobile: REVERT v12 proactive-hide (nút Post/Unpost LUÔN hiện trên Detail bất kể kỳ mở/đóng); kỳ đóng handled reactive qua toast trong guard chain AC-5/AC-6. (2) AC-5 mobile: rewrite thành 4-step guard chain — (a) `checkAccountingPeriodLock` → toast/stop nếu locked, (b) popup "Chắc chắn Ghi sổ?" [Huỷ|Xác nhận], (c) op MỚI `getInheritedReceiptFromSaleDelivery(receiptId)` sau confirm, (d) nếu `mismatch=true` → popup `22260:24396` [Huỷ|Xác nhận force-through]; nếu mismatch=false → mutation trực tiếp. (3) AC-6 mobile: 2-step guard chain (period check + confirm popup), KHÔNG check mismatch (unpost không dùng `getInheritedReceiptFromSaleDelivery`). (4) AC-9: rewrite semantic từ "delete/unpost blocker acknowledge-only" → "post-mismatch warning force-through" — Xác nhận = chạy tiếp mutation `postReceiptV2` bình thường (không cần `force: true` flag mới). Slug rename registry + spec `delete-blocker-popup → post-mismatch-warning-popup`. BR-IRV2-031 semantic revised. Op `getInheritedReceiptFromSaleDelivery` **NEW** — chưa ratified BFF/BE SDL — cascade Architecture Authority. v16 → v17. |
| 2026-07-31 | 18 | Business Authority (user directive) | **AC-1: thêm entry point từ thẻ kho** — `FEAT-STK-DETAIL-V2` AC-2 cột "Số phiếu" nay là link, click → chuyển màn (không mở tab mới) sang màn này khi phiếu là phiếu nhập. Cascade: `BR-GF-INVENTORY-STOCK-V2` BR-STKV2-012 + `FEAT-STK-DETAIL-V2` AC-2. Không đổi field/hành vi hiển thị nào khác của AC-1. Architecture không đổi. v17 → v18. |
