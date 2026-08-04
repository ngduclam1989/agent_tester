---
type: feature
artifact_kind: feature
status: PLANNED
version: 16
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-STOCK-V2"
boundary: "gf-inventory"
last_reviewed: "2026-07-31" # v16
supersedes: "FEAT-STK-DETAIL"
---

# FEAT-STK-DETAIL-V2: Xem lịch sử tồn kho (thẻ kho)

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-STK-DETAIL-V2` |
| Title | Xem lịch sử tồn kho (thẻ kho) |
| Parent Epic | `EP-INVENTORY-STOCK-V2` |
| Boundary | `gf-inventory` |
| Platform scope | **Web GMS only trong W06**. App Garage W06 không triển khai thẻ kho; mobile chỉ có `FEAT-STK-LIST-V2`. |
| Priority | P1 |
| Status | PLANNED |

> **Scope guard mobile W06:** file này là scope Web GMS trong W06. App Garage không có route/màn thẻ kho và `FEAT-STK-LIST-V2` trên mobile không hiển thị action **"Xem lịch sử"**.

## 1. User Story

**As** chủ garage / kế toán, **I want** xem lịch sử biến động (nhập/xuất) và tồn của một mã sản phẩm trong một kho theo khoảng ngày, **so that** tôi truy vết được dòng chảy tồn kho (thẻ kho) của mã đó.

## 2. Acceptance Criteria

### Nhóm A — Mở thẻ kho

- [ ] **AC-1**: Mở màn thẻ kho (v7 — đổi từ popup sang full-page, khớp screenshot UI)
  - Tại: Báo cáo tồn kho (`FEAT-STK-LIST-V2`) trên **Web GMS**, nút **"Xem lịch sử"** trên một dòng.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống **chuyển sang màn riêng** (full-page, có thanh nav + tabs — KHÔNG phải overlay) **"Xem lịch sử tồn kho"** với mô tả **"Tra cứu phát sinh nhập/xuất và biến động tồn của một mã sản phẩm trong kho."**, tự lấy **mã + kho** của dòng đó (**không chọn mã trực tiếp**, **không hiển thị bộ lọc/chip Kho trên UI** — v15, bỏ chip disabled, kho vẫn xác định ngầm từ dòng nguồn) + **khoảng ngày** (1 range-picker "Từ ngày - Đến ngày" gộp, v6 — khớp screenshot UI, mặc định **tự fill tháng hiện tại**: Từ ngày = ngày 01 tháng hiện tại, Đến ngày = ngày cuối tháng hiện tại), bảng, dòng Tổng, nút **"Xuất file"** / **"Đóng"** (Đóng → điều hướng quay lại `FEAT-STK-LIST-V2`, KHÔNG phải đóng overlay).

### Nhóm B — Bảng thẻ kho (running)

- [ ] **AC-2**: Cột hiển thị
  - Tại: bảng thẻ kho.
  - Thì: hệ thống hiển thị: **"STT"**, **"Kho"**, **"Mã SP nội bộ"**, **"Tên SP nội bộ"**, **"Ngày nhập/xuất"**, **"Số phiếu"** (v16 — **link**, click → **chuyển màn** (không mở tab mới) sang màn chi tiết phiếu tương ứng: `Loại phiếu` = phiếu nhập → `FEAT-IR-DETAIL-V2`, phiếu xuất → `FEAT-ID-DETAIL-V2`; map theo field `slipType`, KHÔNG parse tiền tố mã phiếu), **"Loại phiếu"**, **"ĐVT"** (v8 — bỏ cột "Diễn giải", hiện Figma không vẽ), **"Đầu kỳ"** (SL, Giá trị), **"Nhập kho"** (SL, Giá trị), **"Xuất kho"** (SL, Giá trị), **"Cuối kỳ"** (SL, Giá trị).

- [ ] **AC-3**: Mỗi dòng = 1 phiếu, chạy running
  - Tại: bảng thẻ kho.
  - Khi: bảng render.
  - Thì: mỗi dòng tương ứng **1 phiếu** (nhập/xuất đã ghi sổ) trong khoảng; **Cuối kỳ dòng trước = Đầu kỳ dòng sau** (running). Cuối kỳ mỗi dòng = Đầu kỳ + Nhập − Xuất của dòng đó.

- [ ] **AC-4**: Đầu kỳ dòng đầu
  - Tại: dòng đầu tiên.
  - Khi: bảng render.
  - Thì: **Đầu kỳ** = tra sổ tồn gần nhất ≤ (Từ ngày − 1) của (mã + kho); nếu chưa có biến động trước đó → **0**.

- [ ] **AC-5**: Giá trị theo BQGQ
  - Tại: cột Giá trị (Đầu kỳ / Nhập / Xuất / Cuối kỳ).
  - Khi: mã chưa chạy BQGQ.
  - Thì: **GT Đầu kỳ** và **GT Nhập** vẫn là **số thật** (đơn giá nhập đã biết). **Chỉ GT Xuất = 0** (giá vốn chưa chốt), kéo theo **GT Cuối kỳ = GT Đầu + GT Nhập − 0**. Đã chạy → GT Xuất / GT Cuối kỳ là số thực theo giá vốn BQGQ. **Không dùng chữ "Tạm tính"**.

- [ ] **AC-6**: Dòng tổng
  - Tại: cuối bảng.
  - Thì: hệ thống hiển thị Tổng: **Đầu kỳ** (đầu khoảng) / **Σ Nhập** / **Σ Xuất** / **Cuối kỳ** (cuối khoảng), mỗi cụm SL + Giá trị.

### Nhóm C — Xuất file & phân quyền

- [ ] **AC-7**: Xuất file
  - Tại: nút **"Xuất file"**.
  - Thì: hệ thống xuất `.xlsx` đúng các cột đang hiển thị theo bộ lọc và bám **mẫu Excel chuẩn** [Báo cáo thẻ kho.xlsx](<../ux/assets/Báo cáo thẻ kho.xlsx>) (tên sheet / cột / thứ tự / định dạng số / header nhóm).

- [ ] **AC-8**: Phân quyền — chủ garage + kế toán quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14507-89272&t=W7XJPVvhmdBPtv2c-4 |
| **Excel Template** | file `.xlsx` | [Báo cáo thẻ kho.xlsx](<../ux/assets/Báo cáo thẻ kho.xlsx>) — mẫu file export chuẩn cho `FEAT-STK-DETAIL-V2`; DEV bám theo mẫu này (tên sheet / cột / thứ tự / định dạng số / merge / header nhóm) |

- Luồng: [UX-FLOW-INVENTORY-STOCK-V2](../ux/UX-FLOW-INVENTORY-STOCK-V2.md) §3.3.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Thẻ kho: Query `[PROPOSED] StockCardReport`.

## 5. Business Rules

- **BR-STKV2-001 / 002**: Cơ chế sổ tồn; SL realtime + giá trị số/0.
- **BR-STKV2-005**: Xuất file `.xlsx` theo bộ lọc hiện tại và bám mẫu chuẩn [Báo cáo thẻ kho.xlsx](<../ux/assets/Báo cáo thẻ kho.xlsx>).
- **BR-STKV2-012 / 013 / 014**: Thẻ kho 1 mã+kho (full-page từ Xem lịch sử, v7); mỗi dòng = 1 phiếu running; đầu kỳ tra sổ tồn; dòng Tổng.
- **BR-STKV2-015**: Phân quyền — chủ garage và kế toán quyền ngang nhau (AC-8).

## 6. Edge Cases

- **EC-1**: Mã chưa có biến động trước Từ ngày → Đầu kỳ = 0.
- **EC-2**: Mã chưa chạy BQGQ → chỉ GT Xuất = 0; GT Đầu kỳ / GT Nhập là số thật; GT Cuối kỳ = GT Đầu + GT Nhập.
- **EC-3**: Không có biến động trong khoảng → bảng phiếu rỗng (v9 — hiển thị **empty state** `EMPTY_STATE`: illustration + text verbatim **"Không có dữ liệu"**), dòng **Tổng** vẫn hiện: Đầu kỳ = Cuối kỳ (= tồn tra được).

## 7. Out of Scope

- Báo cáo tồn đến ngày → `FEAT-STK-LIST-V2`. Báo cáo NXT → `FEAT-IP-VIEW-V2`.
- **App Garage W06** — thẻ kho không nằm trong scope mobile; mobile chỉ có `FEAT-STK-LIST-V2`.
- Chọn mã trực tiếp trong thẻ kho → không có (màn tự lấy mã+kho từ báo cáo tồn).

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-STK-DETAIL-V2 (V2 của FEAT-STK-DETAIL) — thẻ kho popup từ "Xem lịch sử" (1 mã+kho); mỗi dòng = 1 phiếu running Đầu kỳ→Nhập→Xuất→Cuối kỳ (SL+GT); đầu kỳ tra sổ tồn; giá trị số/0; Xuất file. |
| 2026-06-15 | 2 | Business Authority | Sửa AC-5 / EC-2 cho khớp BR-STKV2-014 (Cách 1): khi chưa chạy BQGQ chỉ **GT Xuất = 0**, GT Đầu kỳ / GT Nhập là số thật, GT Cuối kỳ = GT Đầu + GT Nhập − GT Xuất — bỏ cách diễn đạt "cả cột giá trị = 0". |
| 2026-06-15 | 3 | Business Authority | Đổi thuật ngữ tiếng Anh sang **"sổ tồn"** (AC-4, §5). |
| 2026-06-16 | 4 | Business Authority | Bổ sung cross-ref BR-STKV2-015 (phân quyền) vào §5 — đối xứng FEAT-STK-LIST-V2. |
| 2026-06-26 | 5 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14507-89272`. Mobile chưa có. |
| 2026-07-20 | 6 | Business Authority (user sonhoang directive 2026-07-20) | **AC-1: gộp "Từ ngày"+"Đến ngày" thành 1 range-picker + default tháng hiện tại** — khớp screenshot UI thực tế (1 field "Từ ngày - Đến ngày" thay vì 2 field riêng). Mặc định khi mở màn: Từ ngày = ngày 01 tháng hiện tại, Đến ngày = ngày cuối tháng hiện tại (user chốt — không dùng "hôm nay" để tránh khoảng trống vô nghĩa cuối tháng). **Chưa đổi** "mở popup" / nút "Đóng" — đang chờ user xác nhận riêng (có thể đã đổi thành full-page). Pre-wave (W06 chưa DEV) — không cascade sync xuống service repo. v5 → v6. |
| 2026-07-20 | 7 | Business Authority (user sonhoang directive 2026-07-20) | **AC-1: đổi từ popup sang full-page** — user xác nhận khớp screenshot UI, KHÔNG phải popup overlay. Nút "Đóng" → điều hướng quay lại `FEAT-STK-LIST-V2`. §7 wording "popup" → "màn". Cascade: `FEAT-STK-LIST-V2` AC-7 (mở popup → chuyển màn) + `BR-GF-INVENTORY-STOCK-V2` BR-STKV2-012. Pre-wave (W06 chưa DEV) — không cascade sync xuống service repo. v6 → v7. |
| 2026-07-20 | 8 | Business Authority (user sonhoang directive 2026-07-20) | **AC-2: bỏ cột "Diễn giải"** — user xác nhận Figma hiện không vẽ cột này (không phải do ảnh cắt/cuộn ngang). Cột bảng thẻ kho còn lại: Kho / Mã SP nội bộ / Tên SP nội bộ / Ngày nhập/xuất / Số phiếu / Loại phiếu / ĐVT / Đầu kỳ / Nhập kho / Xuất kho / Cuối kỳ. Pre-wave (W06 chưa DEV) — không cascade sync xuống service repo. v7 → v8. |
| 2026-07-20 | 9 | Business Authority (user sonhoang directive 2026-07-20) | **EC-3 bổ sung UI empty state** — mô tả rõ khi bảng phiếu rỗng (không có biến động trong khoảng), hiển thị illustration + text "Không có dữ liệu" (`EMPTY_STATE`) cho bảng phiếu, trong khi dòng Tổng vẫn hiện Đầu kỳ=Cuối kỳ. Trước đây chỉ mô tả logic số liệu, chưa mô tả UI. Đồng bộ với `FEAT-STK-LIST-V2` + `FEAT-IP-VIEW-V2`. Pre-wave (W06 chưa DEV) — không cascade sync xuống service repo. v8 → v9. |
| 2026-07-21 | 10 | Business Authority (user directive) | **Làm rõ platform scope** — `FEAT-STK-DETAIL-V2` là Web GMS only trong W06; App Garage W06 không triển khai thẻ kho và không nhận route từ mobile `FEAT-STK-LIST-V2`. |
| 2026-07-21 | 11 | Business Authority (user directive) | **Gắn mẫu Excel export chuẩn** — AC-7 + §3 + §5 cite file `Product/ux/assets/Báo cáo thẻ kho.xlsx`; export không còn mô tả "không cần mẫu riêng", DEV phải bám mẫu về sheet/cột/thứ tự/định dạng/header nhóm. |
| 2026-07-21 | 12 | Business Authority (user directive) | **Sync Excel template columns** — AC-2 bổ sung cột **"STT"** đầu bảng thẻ kho để khớp mẫu export `Báo cáo thẻ kho.xlsx` và layout báo cáo chuẩn. |
| 2026-07-24 | 13 | Business Authority (user directive) | **AC-1: gỡ disclaimer "Figma sẽ bổ sung nút này"** — design đã bổ sung nút "Đóng", AC-1 chỉ giữ mô tả hành vi điều hướng quay lại `FEAT-STK-LIST-V2`. v12 → v13. |
| 2026-07-24 | 14 | Business Authority (user directive) | **AC-1: chốt bộ lọc Kho = disabled** (chip hiển thị kho hiện tại nhưng không tương tác, chỉ show context của dòng nguồn từ `FEAT-STK-LIST-V2`). Cascade: BR-STKV2-012. v13 → v14. |
| 2026-07-31 | 15 | Business Authority (user directive) | **AC-1: bỏ hẳn chip/bộ lọc Kho trên UI** (trước đó là disabled chip hiển thị context, giờ không hiển thị nữa) — kho vẫn được BE xác định ngầm từ mã + kho của dòng nguồn khi mở "Xem lịch sử", hành vi/dữ liệu không đổi. Cascade: `BR-GF-INVENTORY-STOCK-V2` BR-STKV2-012. Architecture API contract không đụng — `W06-STK-Q3 warehouseCode` vẫn server-side, độc lập UI chip (đã xác nhận CR không cần cascade Architecture). v14 → v15. |
| 2026-07-31 | 16 | Business Authority (user directive) | **AC-2: cột "Số phiếu" thêm link điều hướng sang chi tiết phiếu** — click → **chuyển màn** (KHÔNG mở tab mới, khác pattern "Số phiếu xuất"/"Số phiếu nhập" của `FEAT-IR-DETAIL-V2`/`FEAT-ID-DETAIL-V2`) sang `FEAT-IR-DETAIL-V2` (phiếu nhập) hoặc `FEAT-ID-DETAIL-V2` (phiếu xuất) theo `slipType`. Cascade: `BR-GF-INVENTORY-STOCK-V2` BR-STKV2-012 + `FEAT-IR-DETAIL-V2` AC-1 + `FEAT-ID-DETAIL-V2` AC-1 (thêm entry point từ thẻ kho). Architecture không đổi — API `W06-STK-Q3` đã trả `slipCode` + `slipType` đủ để FE tự build route, endpoint detail phiếu fetch theo `code`. v15 → v16. |
