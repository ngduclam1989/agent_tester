---
type: feature
artifact_kind: feature
status: PLANNED
version: 10
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-STOCK-V2"
boundary: "gf-inventory"
last_reviewed: "2026-07-21"
supersedes: "FEAT-IP-VIEW"
---

# FEAT-IP-VIEW-V2: Báo cáo Nhập Xuất Tồn (NXT)

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-IP-VIEW-V2` |
| Title | Báo cáo Nhập Xuất Tồn (NXT) |
| Parent Epic | `EP-INVENTORY-STOCK-V2` |
| Boundary | `gf-inventory` |
| Platform scope | **Web GMS only trong W06**. App Garage W06 không triển khai NXT; mobile chỉ có `FEAT-STK-LIST-V2`. |
| Priority | P1 |
| Status | PLANNED |

> V2 của `FEAT-IP-VIEW` (báo cáo NXT cũ thuộc `EP-INVENTORY-PERIOD`). V2 **dời nhà** sang `EP-INVENTORY-STOCK-V2`. File V1 cũ giữ nguyên baseline.
>
> **Scope guard mobile W06:** file này không thuộc scope App Garage W06. Mobile hub tile **"Tồn kho"** chỉ mở `FEAT-STK-LIST-V2`, không mở NXT.

## 1. User Story

**As** chủ garage / kế toán, **I want** xem báo cáo Nhập-Xuất-Tồn theo khoảng ngày (tồn đầu kỳ, nhập, xuất, tồn cuối kỳ) theo mã sản phẩm nội bộ, **so that** tôi nắm biến động và tồn của kho trong kỳ phục vụ đối soát / báo cáo.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị báo cáo

- [ ] **AC-1**: Mở màn báo cáo
  - Tại: tab **"Báo cáo NXT"**.
  - Khi: chủ garage truy cập.
  - Thì: hệ thống hiển thị màn **"Báo cáo Nhập Xuất Tồn"** với mô tả **"Hiển thị tồn đầu kỳ, nhập, xuất, tồn cuối kỳ theo Mã sản phẩm nội bộ."**, bộ lọc, bảng, dòng Tổng, phân trang, nút **"Xuất file"**.

- [ ] **AC-2**: Cột hiển thị
  - Tại: bảng báo cáo.
  - Thì: hệ thống hiển thị (v7 — đổi tên cột + gộp nhóm 2-tầng header, khớp screenshot UI + đồng bộ `FEAT-STK-DETAIL-V2`): **"STT"**, **"Mã SP nội bộ"**, **"Tên SP nội bộ"**, **"ĐVT chính"**, **"Kho"**, rồi 4 nhóm cột (mỗi nhóm 2 cột con **Số lượng** + **Giá trị**): **"Đầu kỳ"**, **"Nhập kho"**, **"Xuất kho"**, **"Cuối kỳ"**. Dòng **Tổng** tất cả cột số.

- [ ] **AC-3**: Công thức cột
  - Tại: các cột số.
  - Khi: báo cáo theo khoảng [Từ ngày, Đến ngày].
  - Thì: **cả 4 cột đọc trực tiếp từ sổ tồn**, KHÔNG đọc chi tiết phiếu nhập/xuất — đảm bảo cùng nguồn với Báo cáo tồn-đến-ngày:
    - **Tồn đầu kỳ** = tồn cuối ngày của mốc sổ tồn gần nhất ≤ (Từ ngày − 1).
    - **Nhập trong kỳ** = tổng SL/GT **biến động nhập** của sổ tồn trong khoảng [Từ, Đến].
    - **Xuất trong kỳ** = tổng SL/GT **biến động xuất** của sổ tồn trong khoảng [Từ, Đến].
    - **Tồn cuối kỳ** = tồn cuối ngày của mốc sổ tồn gần nhất ≤ Đến ngày (bằng Tồn đầu kỳ + Nhập − Xuất theo tính chất).

- [ ] **AC-4**: Giá trị (GT) theo BQGQ
  - Tại: các cột GT.
  - Khi: mã chưa chạy tính giá BQGQ.
  - Thì: **GT Tồn đầu kỳ** và **GT Nhập** vẫn hiển thị **giá trị thật** (đơn giá nhập đã biết). **Chỉ GT Xuất = 0** (giá vốn chưa chốt), kéo theo **GT Tồn cuối = GT đầu + GT nhập − 0**. Đã chạy BQGQ → GT Xuất / GT Tồn cuối là số thực theo giá vốn. **Không dùng chữ "Tạm tính"** trong ô (chỉ ghi chú ngoài bảng nhắc cần chạy tính giá).

### Nhóm B — Bộ lọc & hiển thị

- [ ] **AC-5**: Bộ lọc
  - Tại: ô tìm kiếm (mã/tên) + **Kho** + **khoảng ngày** (1 range-picker "Từ ngày - Đến ngày" gộp, v7 — khớp screenshot UI, mặc định **tự fill tháng hiện tại**: Từ ngày = ngày 01 tháng hiện tại, Đến ngày = ngày cuối tháng hiện tại — đồng bộ `FEAT-STK-DETAIL-V2`).
  - Thì: search LIKE mã/tên; Kho tất cả/nhiều; khoảng ngày. **Không filter Garage**.

- [ ] **AC-6**: Tách dòng theo kho & hiển thị mã
  - Tại: bảng báo cáo.
  - Thì: **mỗi (mã + kho) = 1 dòng**. Hiển thị mã có **phát sinh nhập/xuất trong kỳ HOẶC tồn đầu/cuối ≠ 0**.

### Nhóm C — Xuất file & phân quyền

- [ ] **AC-7**: Xuất file
  - Tại: nút **"Xuất file"**.
  - Thì: hệ thống xuất `.xlsx` đúng các cột đang hiển thị theo bộ lọc và bám **mẫu Excel chuẩn** [Báo cáo nhập xuất tồn.xlsx](<../ux/assets/Báo cáo nhập xuất tồn.xlsx>) (tên sheet / cột / thứ tự / định dạng số / header nhóm).

- [ ] **AC-8**: Phân quyền — chủ garage + kế toán quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14507-89273&t=W7XJPVvhmdBPtv2c-4 |
| **Excel Template** | file `.xlsx` | [Báo cáo nhập xuất tồn.xlsx](<../ux/assets/Báo cáo nhập xuất tồn.xlsx>) — mẫu file export chuẩn cho `FEAT-IP-VIEW-V2`; DEV bám theo mẫu này (tên sheet / cột / thứ tự / định dạng số / merge / header nhóm) |

- Luồng: [UX-FLOW-INVENTORY-STOCK-V2](../ux/UX-FLOW-INVENTORY-STOCK-V2.md) §3.2.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Báo cáo NXT: Query `[PROPOSED] InventoryMovementReport`.

## 5. Business Rules

- **BR-STKV2-001 / 002**: Cơ chế sổ tồn; SL realtime + GT số/0.
- **BR-STKV2-003 / 004**: Tách theo kho; không filter Garage.
- **BR-STKV2-005**: Xuất file `.xlsx` theo bộ lọc hiện tại và bám mẫu chuẩn [Báo cáo nhập xuất tồn.xlsx](<../ux/assets/Báo cáo nhập xuất tồn.xlsx>).
- **BR-STKV2-009 / 010 / 011**: NXT 1 dòng/(mã+kho); đầu kỳ tra + nhập/xuất tính + cuối kỳ; hiển thị mã có phát sinh / tồn ≠ 0; chưa tính giá → chỉ GT Xuất = 0 (GT đầu/nhập là số thật, GT cuối = đầu + nhập − xuất).
- **BR-STKV2-015**: Phân quyền — chủ garage và kế toán quyền ngang nhau (AC-8).

## 6. Edge Cases

- **EC-1**: Mã chưa chạy BQGQ → chỉ GT Xuất = 0; GT Tồn đầu / GT Nhập là số thật; GT Tồn cuối = GT đầu + GT nhập.
- **EC-2**: Mã chỉ có tồn đầu (không phát sinh trong kỳ) → vẫn hiển thị (tồn đầu/cuối ≠ 0).
- **EC-3**: Mã ở nhiều kho → mỗi kho 1 dòng.
- **EC-4** (v8 — mới): Không có mã nào khớp filter hiện tại (hoặc garage chưa có dữ liệu tồn kho) → hiển thị **empty state** (`EMPTY_STATE`): illustration + text verbatim **"Không có dữ liệu"**.

## 7. Out of Scope

- Báo cáo tồn đến ngày → `FEAT-STK-LIST-V2`. Thẻ kho → `FEAT-STK-DETAIL-V2`.
- **App Garage W06** — NXT không nằm trong scope mobile; mobile chỉ có `FEAT-STK-LIST-V2`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-IP-VIEW-V2 (V2 của FEAT-IP-VIEW, dời từ EP-PERIOD sang STOCK-V2) — báo cáo NXT theo khoảng, 1 dòng/(mã+kho): Tồn đầu (tra) / Nhập-Xuất (tính) / Tồn cuối; GT theo BQGQ (số/0); lọc Kho multi + Từ/Đến; Xuất file. |
| 2026-06-15 | 2 | Business Authority | Sửa AC-4 / EC-1 / §5 cho khớp BR-STKV2-011 (Cách 1): khi chưa chạy BQGQ chỉ **GT Xuất = 0**, GT Tồn đầu / GT Nhập là số thật, GT Tồn cuối = GT đầu + GT nhập − GT xuất — bỏ cách diễn đạt "cả cột GT = 0". |
| 2026-06-15 | 3 | Business Authority | Đổi thuật ngữ tiếng Anh sang **"sổ tồn"** (AC-3, §5). |
| 2026-06-16 | 4 | Business Authority | Bổ sung cross-ref BR-STKV2-015 (phân quyền) vào §5 — đối xứng FEAT-STK-LIST-V2. |
| 2026-06-26 | 5 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14507-89273`. Mobile chưa có. |
| 2026-07-01 | 6 | Business Authority | **Sync với BR-STKV2-001/010 v5** — AC-3 đổi cả 4 cột (Tồn đầu / Nhập / Xuất / Tồn cuối) **đọc trực tiếp từ sổ tồn** (biến động cột nhập/xuất) thay vì tổng dòng chi tiết phiếu. Ghi rõ "KHÔNG đọc chi tiết phiếu" để tránh drift + đảm bảo cùng nguồn với Báo cáo tồn-đến-ngày. |
| 2026-07-20 | 7 | Business Authority (user sonhoang directive 2026-07-20) | **Đồng bộ UI với `FEAT-STK-DETAIL-V2`** — khớp screenshot UI thực tế. (1) AC-2 rename cột: "Mã nội bộ"→"Mã SP nội bộ", "Tên sản phẩm"→"Tên SP nội bộ". (2) AC-2 restructure: 8 cột phẳng (Tồn đầu kỳ SL/GT, Nhập SL/GT, Xuất SL/GT, Tồn cuối SL/GT) → gộp 4 nhóm 2-tầng header (Đầu kỳ/Nhập kho/Xuất kho/Cuối kỳ, mỗi nhóm Số lượng+Giá trị) — đồng bộ layout với thẻ kho. (3) AC-5: gộp "Từ ngày"+"Đến ngày" thành 1 range-picker, mặc định tự fill tháng hiện tại (01 → ngày cuối tháng) — đồng bộ default `FEAT-STK-DETAIL-V2` v6. Pre-wave (W06 chưa DEV) — không cascade sync xuống service repo. v6 → v7. |
| 2026-07-20 | 8 | Business Authority (user sonhoang directive 2026-07-20) | **Thêm EC-4 empty state** — screenshot UI cho thấy màn trống khi chưa có dữ liệu khớp filter, hiển thị illustration + text "Không có dữ liệu" (`EMPTY_STATE`). Đồng bộ với `FEAT-STK-LIST-V2` + `FEAT-STK-DETAIL-V2`. Pre-wave (W06 chưa DEV) — không cascade sync xuống service repo. v7 → v8. |
| 2026-07-21 | 9 | Business Authority (user directive) | **Làm rõ platform scope** — `FEAT-IP-VIEW-V2` là Web GMS only trong W06; App Garage W06 không triển khai NXT, mobile hub tile "Tồn kho" chỉ dẫn vào `FEAT-STK-LIST-V2`. |
| 2026-07-21 | 10 | Business Authority (user directive) | **Gắn mẫu Excel export chuẩn** — AC-7 + §3 + §5 cite file `Product/ux/assets/Báo cáo nhập xuất tồn.xlsx`; export không còn mô tả "không cần mẫu riêng", DEV phải bám mẫu về sheet/cột/thứ tự/định dạng/header nhóm. |
