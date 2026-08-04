---
type: feature
artifact_kind: feature
status: PLANNED
version: 14
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-DELIVERY-V2"
boundary: "gf-inventory"
last_reviewed: "2026-07-31" # v14
supersedes: "FEAT-ID-DETAIL"
---

# FEAT-ID-DETAIL-V2: Chi tiết phiếu xuất kho (V2)

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-ID-DETAIL-V2` |
| Title | Chi tiết phiếu xuất kho (V2) |
| Parent Epic | `EP-INVENTORY-DELIVERY-V2` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết phiếu xuất kho và ghi sổ / bỏ ghi sổ / sửa / xóa / in, **so that** tôi kiểm soát vòng đời phiếu và tác động tồn kho.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị chi tiết

- [ ] **AC-1**: Mở màn chi tiết
  - Tại: danh sách, nhấn Số phiếu; **hoặc từ thẻ kho** (`FEAT-STK-DETAIL-V2`), nhấn **"Số phiếu"** trên dòng phiếu xuất (v14 — click → **chuyển màn**, không mở tab mới, khác pattern "Số phiếu nhập" của AC-2).
  - Thì: hệ thống mở màn **"Chi tiết phiếu xuất kho [số phiếu]"** với mô tả **"Dạng xem phiếu đã ghi sổ, action theo trạng thái và quyền."**, header read-only + tab **Chi tiết** / **Đính kèm**, sidebar Tổng giá trị, các nút hành động.

- [ ] **AC-2**: Thông tin hiển thị
  - Tại: header + tab chi tiết.
  - Thì: hệ thống hiển thị read-only header (Loại phiếu, Mã đơn hàng/SO, Mã lô hàng, **Số phiếu nhập** [link tham chiếu tới phiếu Nhập mua gốc — chỉ hiển thị khi Loại phiếu = **Xuất trả hàng mua** / `DELIVERY_PURCHASE_RETURN`, click → mở phiếu Nhập mua nguồn ở tab mới; các loại khác **ẩn** field này], Đối tượng, Người phụ trách, Người giao hàng, Kho xuất, Diễn giải, Số phiếu, Ngày xuất kho, Trạng thái) + bảng dòng (SKU, mã nội bộ, SL tồn, Số lượng xuất, SL quy đổi, ĐVT chính, đơn giá vốn, tiền vốn, kho, ghi chú) + dòng Tổng. Tiền vốn = 0 nếu chưa chạy BQGQ; số thực sau khi chạy.

- [ ] **AC-3**: Thông tin audit
  - Tại: cuối màn.
  - Thì: hệ thống hiển thị Ngày tạo / Người tạo / Ngày sửa / Người sửa.

### Nhóm B — Ẩn/hiện nút theo trạng thái & kỳ

- [ ] **AC-4**: Ẩn/hiện nút hành động
  - Tại: thanh nút đầu màn chi tiết.
  - **Web** — Khi: phiếu **"Nháp"** và kỳ **chưa khóa**.
  - Thì: hiển thị **Sửa**, **Xóa**, **Ghi sổ kho** (ẩn "Bỏ ghi sổ kho").
  - **Web** — Khi: phiếu **"Ghi sổ kho"** và kỳ **chưa khóa**.
  - Thì: hiển thị **Sửa**, **Xóa**, **Bỏ ghi sổ kho** (ẩn "Ghi sổ kho").
  - **Web** — Khi: ngày chứng từ thuộc **kỳ đã khóa**.
  - Thì: **ẩn các nút thao tác (Sửa / Xóa / Ghi sổ kho / Bỏ ghi sổ kho)**.
  - **Web** — Khi: bất kỳ trạng thái / kỳ.
  - Thì: **"In phiếu xuất"** **luôn hiển thị**.
  - **Mobile** (mobile-only pattern, khác web — mobile Detail chỉ có Post/Unpost, KHÔNG có Sửa/Xóa/In per PKG-W05 §2.2.4) — Khi: phiếu **"Nháp"** và kỳ **chưa khóa**.
  - Thì: hệ thống hiển thị **CHỈ nút "Ghi sổ kho"** (ẩn "Bỏ ghi sổ kho"). Không có nút Sửa / Xóa / In trên mobile (4 op web-only).
  - **Mobile** — Khi: phiếu **"Ghi sổ kho"** và kỳ **chưa khóa**.
  - Thì: hệ thống hiển thị **CHỈ nút "Bỏ ghi sổ kho"** (ẩn "Ghi sổ kho").
  - **Mobile** — Khi: ngày chứng từ thuộc **kỳ đã khóa**.
  - Thì: hệ thống **ẩn cả 2 nút (Ghi sổ kho / Bỏ ghi sổ kho)** — mobile Detail read-only hoàn toàn.

### Nhóm C — Hành động ghi sổ

- [ ] **AC-5**: Ghi sổ kho (kèm đối soát SO — narrow V1 semantic per BR-IDV2-009)
  - Tại: nút **"Ghi sổ kho"** (phiếu Nháp, web hoặc mobile Chi tiết per AC-4 button state).
  - Khi: chủ garage / kế toán nhấn.
  - Thì:
    1. Hệ thống hiển thị **popup xác nhận Ghi sổ chung** verbatim: **"Bạn có chắc chắn muốn thực hiện Ghi sổ kho phiếu này hay không?"** + button **[Đóng]** + **[Xác nhận]**.
    2. User click **[Xác nhận]** → BE call `gf-sales` `/protected/v1/product/so-summary` đối soát SL/sản phẩm phiếu vs SO (chỉ khi phiếu có liên kết SO — "Mã đơn hàng" ≠ trống; nếu không có SO → skip đối soát, đi thẳng bước 5).
    3. **Case lệch** (`ERR-INV-039`, `reconciliationWarnings[]` không rỗng) → hiển thị **popup cảnh báo verbatim** (BR-IDV2-009 canonical): title `"Số lượng phụ tùng trong phiếu xuất kho và phiếu dịch vụ #{mã_phiếu} chưa trùng khớp. Vui lòng cập nhật chính xác số lượng phụ tùng."` + content list dòng lệch (VD `"Phụ tùng A thừa 5 cái chưa khớp phiếu xuất kho"`) + button **[Đóng]** + **[Vẫn Ghi sổ]**. Click **[Đóng]** → hủy Ghi sổ, phiếu giữ Nháp. Click **[Vẫn Ghi sổ]** → đi bước 5 commit.
    4. **Case DEGRADED** (`ERR-CMN-007-DEGRADED`, `gf-sales` unreachable/timeout, fail-OPEN) → hiển thị **popup DEGRADED verbatim**: `"Hệ thống chưa đối soát được vì mất kết nối phòng dịch vụ. Bạn vẫn muốn Ghi sổ hay đợi thử lại?"` + button **[Đóng]** + **[Vẫn Ghi sổ]**. Click **[Đóng]** → hủy Ghi sổ. Click **[Vẫn Ghi sổ]** → đi bước 5 commit.
    5. **Commit** — trước khi commit: **bắt buộc mọi dòng có mã nội bộ** (BR-IDV2-028, thiếu → chặn `ERR-INV-011`) + **check tồn khả dụng** (chặn `ERR-INV-036` nếu tồn âm point-in-time) + **lock kỳ** (chặn `ERR-INV-024` nếu kỳ đã đóng). Nếu qua guard → trừ tồn theo SL quy đổi, chuyển state **"Ghi sổ kho"**.
  - **Web** + **Mobile Chi tiết** share cùng flow này (popup verbatim identical). **Mobile List inline Ghi sổ** cùng semantic — xem `FEAT-ID-LIST-V2`.
  - **UI Figma**: popup cảnh báo + popup DEGRADED **pending** (BA sẽ vẽ mới) — DEV placeholder theo wording verbatim ở đây trước khi Figma xong.

- [ ] **AC-6**: Bỏ ghi sổ kho
  - Tại: nút **"Bỏ ghi sổ kho"** (phiếu Ghi sổ kho).
  - Thì: hệ thống hiển thị popup xác nhận **"Bạn có chắc chắn muốn thực hiện Bỏ ghi sổ kho phiếu này hay không?"**; xác nhận → cộng tồn lại, đưa về **"Nháp"**. Nếu việc cộng tồn lại làm tồn âm ở thời điểm về sau → chặn (`ERR-INV-036`); nếu kỳ đã đóng → chặn (`ERR-INV-024`).

### Nhóm D — Sửa / Xóa / In

- [ ] **AC-7**: Các nút hành động
  - Tại: đầu màn chi tiết (nút hiển thị theo AC-4).
  - Thì: **"Sửa"** → `FEAT-ID-EDIT-V2`; **"Xóa"** → `FEAT-ID-DELETE`; **"In phiếu xuất"** → `FEAT-ID-PRINT`.

### Nhóm E — Phân quyền

- [ ] **AC-8**: Phân quyền — chủ garage + kế toán quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87563&t=W7XJPVvhmdBPtv2c-4 |
| Figma | mobile | https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21629-28663&t=30dKkXMi0PSOdK7b-4 |

- Luồng: [UX-FLOW-INVENTORY-DELIVERY-V2](../ux/UX-FLOW-INVENTORY-DELIVERY-V2.md) §3, §4.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Chi tiết phiếu: Query `[PROPOSED] GetDeliveryV2`.
- Ghi sổ / bỏ ghi sổ: Mutation `[PROPOSED] PostDeliveryV2` / `[PROPOSED] UnpostDeliveryV2`.

## 5. Business Rules

- **BR-IDV2-002**: Vòng đời Nháp → Ghi sổ kho → Bỏ ghi sổ kho.
- **BR-IDV2-003 / 004 / 005**: Ghi sổ trừ tồn (check tồn khả dụng) / bỏ ghi sổ cộng tồn.
- **BR-IDV2-007**: Lock kỳ đã đóng.
- **BR-IDV2-008**: Giá vốn = 0 đến khi BQGQ.
- **BR-IDV2-009**: Đối soát SO (cảnh báo).
- **BR-IDV2-022**: Audit.
- **BR-IDV2-024**: Ẩn/hiện nút theo trạng thái + kỳ.

## 6. Edge Cases

- **EC-1**: Ghi sổ làm tồn âm → chặn (popup không hoàn tất).
- **EC-2**: Phiếu thuộc kỳ đã đóng → **ẩn các nút thao tác** (Sửa/Xóa/Ghi sổ/Bỏ ghi sổ).

## 7. Out of Scope

- Sửa → `FEAT-ID-EDIT-V2`. Xóa → `FEAT-ID-DELETE`. In → `FEAT-ID-PRINT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-ID-DETAIL-V2 (V2 của FEAT-ID-DETAIL) — xem phiếu + Ghi sổ/Bỏ ghi sổ (popup xác nhận, trừ/cộng tồn, check tồn khả dụng + lock kỳ) + Sửa/Xóa/In; ẩn/hiện nút theo trạng thái + kỳ; giá vốn=0 đến BQGQ; audit. |
| 2026-06-10 | 2 | Business Authority | AC-5 (Ghi sổ kho): thêm điều kiện **bắt buộc mọi dòng có mã nội bộ** trước khi trừ tồn (BR-IDV2-028, `INTERNAL_PRODUCT_REQUIRED`) — phiếu Nền tảng (SO đẩy) còn dòng chỉ có SKU thì chặn. |
| 2026-06-15 | 3 | Business Authority | Đổi nhãn cột **"giá vốn" → "tiền vốn"** ở AC-2 (bảng dòng + ô = 0) — đồng bộ "Tiền vốn". Giữ "đơn giá vốn" và khái niệm "giá vốn xuất". |
| 2026-06-16 | 4 | Business Authority | Fix (quyết định BA — ý f): AC-4 + EC-2 kỳ đã khóa → **nút "Sửa" vẫn hiển thị** (mở form được, chặn khi Lưu — FEAT-ID-EDIT-V2 AC-2); chỉ ẩn Xóa/Ghi sổ/Bỏ ghi sổ. Đồng bộ BR-IDV2-024. |
| 2026-06-16 | 5 | Business Authority | Đăng ký mã lỗi: đổi mã bare → ERR-INV-NNN (ERROR-CODE-REGISTRY §4). |
| 2026-06-16 | 6 | Business Authority | Fix (quyết định BA cuối): kỳ đã khóa → ẩn nút Sửa (đảo lại "Sửa vẫn hiện"); làm rõ Thêm mới chặn khi Lưu (BR-IDV2-007). Guard Lưu = phòng vệ. |
| 2026-06-26 | 7 | Business Authority | **Gắn Figma web + mobile vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14146-87563`, mobile node `21629-28663`. |
| 2026-07-14 | 8 | Business Authority | **AC-2 thêm cross-ref field "Số phiếu nhập"** (Figma-crosscheck W05 BUG-4 P1 unblock, BA chốt Option A, đối xứng FEAT-IR-DETAIL-V2 v10). Field chỉ hiển thị conditional khi Loại phiếu = `DELIVERY_PURCHASE_RETURN` (Xuất trả hàng mua) — link tới phiếu Nhập mua gốc; click mở phiếu nguồn ở tab mới. Các loại khác ẩn field. Figma render đúng — trước đây FEAT AC không declare field này. |
| 2026-07-14 | 9 | Business Authority | **Sync doc ↔ Figma cross-check W05 SYS-6 + SYS-11 P1** (đối xứng FEAT-IR-DETAIL-V2 v11): (a) Tab casing → sentence-case. (b) "SL xuất" → **"Số lượng xuất"** trong AC-2 (SL tồn / SL quy đổi giữ viết tắt). |
| 2026-07-15 | 10 | Business Authority | **Bổ sung AC-2b banner đối soát SO** (GAP #3 pre-DEV W05 rà soát) — thêm AC mới để declare UI banner render khi BE trả `reconciliationWarnings[]` không rỗng: wording verbatim "Đối soát với đơn dịch vụ có sai lệch" (case bình thường `ERR-INV-039`) + "Không thể đối soát với đơn dịch vụ" (case DEGRADED `ERR-CMN-007-DEGRADED` fail-OPEN). Warning-only KHÔNG chặn. Trước đây FEAT chỉ có 8 AC (mở màn / hiển thị / audit / nút / ghi sổ / bỏ ghi sổ / nút hành động / phân quyền) → không AC nào declare banner → DEV/QA thiếu spec T2. Nguồn wording: PKG-W05 §2.2.3. Vị trí/màu/icon/expandable-list → chờ Figma (chưa có Figma banner này). |
| 2026-07-15 | 11 | Business Authority | **AC-2b chốt style Option B — reuse pattern có sẵn thay vì vẽ Figma mới** (BA chốt trade-off: warning-only không chặn business flow → chấp nhận không cần pixel-perfect Figma, tránh delay wave 5). Thêm block "Style" cụ thể vào AC-2b: (a) Web dùng shadcn `<Alert variant="warning">` (ui layer registry) case bình thường + `<Alert variant="default">` case DEGRADED; (b) Mobile reuse Alert/Callout Flutter widget với `AppColors.warning`/`AppColors.muted`; (c) Vị trí ngay dưới PageHeader, phía trên TabsList; (d) KHÔNG expandable list dòng lệch (polish sau nếu BE expose fields chi tiết); (e) KHÔNG dismissable. Nếu Designer bổ sung Figma khác pattern sau → cascade + polish PR (không breaking). CREATE AC-12 + EDIT AC-4b tự thừa hưởng (delegate). |
| 2026-07-16 | 12 | Business Authority | **AC-4 thêm mobile carve-out** (GAP-01 pre-DEV W05 rà soát — mirror pattern FEAT-ID-LIST-V2 AC-6 đã tách web/mobile inline; đối xứng FEAT-IR-DETAIL-V2 v12). Web giữ nguyên baseline. **Mobile**: chỉ hiện nút Ghi sổ / Bỏ ghi sổ (ẩn Sửa / Xóa / In per PKG-W05 §2.2.4 — 4 op web-only). Kỳ đã khóa → ẩn cả 2 nút, mobile Detail read-only hoàn toàn. Trước đây AC-4 default implicit "cả 2 platform hiện Sửa / Xóa / In" → mâu thuẫn PKG-W05 mobile scope + inconsistent với LIST-V2 AC-6 đã carve-out. |
| 2026-07-16 | 13 | Business Authority | **AC-2b BỎ HOÀN TOÀN + AC-5 rewrite popup logic** (narrow V1 semantic per BR-IDV2-009 v40 rewrite). (a) **AC-2b banner đối soát SO** trên màn Chi tiết deprecated — banner cảnh báo persistent không còn hợp lý sau khi narrow trigger về "chỉ Nháp → Ghi sổ". Migration policy: BE không backfill `reconciliationWarnings[]`, FE không render (chỉ hiển thị nếu popup triggered lần Ghi sổ mới). (b) **AC-5 Ghi sổ kho** rewrite từ 1-bước (popup xác nhận + guard tồn/lock) thành **5-bước flow đối soát SO**: (1) popup xác nhận Ghi sổ chung verbatim + `[Đóng]`+`[Xác nhận]`; (2) BE call `gf-sales /protected/v1/product/so-summary` đối soát (skip nếu không SO); (3) case lệch (`ERR-INV-039`) popup cảnh báo verbatim + list dòng lệch + `[Đóng]`+`[Vẫn Ghi sổ]`; (4) case DEGRADED (`ERR-CMN-007-DEGRADED` fail-OPEN) popup verbatim + `[Đóng]`+`[Vẫn Ghi sổ]`; (5) commit — guard `ERR-INV-011/024/036` + trừ tồn + chuyển state. Web + Mobile Chi tiết share cùng flow. Fix version drift do session refactor (BR-IDV2-009 rewrite v40 kéo cascade AC-5 spec change nhưng chưa bump version 3-in-1). UI Figma popup cảnh báo + DEGRADED pending (BA vẽ mới sau) — DEV placeholder theo wording verbatim. |
| 2026-07-31 | 14 | Business Authority (user directive) | **AC-1: thêm entry point từ thẻ kho** — `FEAT-STK-DETAIL-V2` AC-2 cột "Số phiếu" nay là link, click → chuyển màn (không mở tab mới) sang màn này khi phiếu là phiếu xuất. Cascade: `BR-GF-INVENTORY-STOCK-V2` BR-STKV2-012 + `FEAT-STK-DETAIL-V2` AC-2. Không đổi field/hành vi hiển thị nào khác của AC-1. Architecture không đổi. v13 → v14. |
