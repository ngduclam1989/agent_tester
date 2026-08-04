---
type: feature
artifact_kind: feature
status: PLANNED
version: 6
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-STOCK-V2"
boundary: "gf-inventory"
last_reviewed: "2026-07-01"
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
| Priority | P1 |
| Status | PLANNED |

> V2 của `FEAT-IP-VIEW` (báo cáo NXT cũ thuộc `EP-INVENTORY-PERIOD`). V2 **dời nhà** sang `EP-INVENTORY-STOCK-V2`. File V1 cũ giữ nguyên baseline.

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
  - Thì: hệ thống hiển thị: **"STT"**, **"Mã nội bộ"**, **"Tên sản phẩm"**, **"ĐVT chính"**, **"Kho"**, **"Tồn đầu kỳ SL"**, **"Tồn đầu kỳ GT"**, **"Nhập SL"**, **"Nhập GT"**, **"Xuất SL"**, **"Xuất GT"**, **"Tồn cuối SL"**, **"Tồn cuối GT"**. Dòng **Tổng** tất cả cột số.

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
  - Tại: ô tìm kiếm (mã/tên) + **Kho** + **Từ ngày + Đến ngày** (khoảng).
  - Thì: search LIKE mã/tên; Kho tất cả/nhiều; khoảng ngày. **Không filter Garage**.

- [ ] **AC-6**: Tách dòng theo kho & hiển thị mã
  - Tại: bảng báo cáo.
  - Thì: **mỗi (mã + kho) = 1 dòng**. Hiển thị mã có **phát sinh nhập/xuất trong kỳ HOẶC tồn đầu/cuối ≠ 0**.

### Nhóm C — Xuất file & phân quyền

- [ ] **AC-7**: Xuất file
  - Tại: nút **"Xuất file"**.
  - Thì: hệ thống xuất `.xlsx` đúng các cột đang hiển thị theo bộ lọc (không cần mẫu riêng).

- [ ] **AC-8**: Phân quyền — chủ garage + kế toán quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14507-89273&t=W7XJPVvhmdBPtv2c-4 |

- Luồng: [UX-FLOW-INVENTORY-STOCK-V2](../ux/UX-FLOW-INVENTORY-STOCK-V2.md) §3.2.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Báo cáo NXT: Query `[PROPOSED] InventoryMovementReport`.

## 5. Business Rules

- **BR-STKV2-001 / 002**: Cơ chế sổ tồn; SL realtime + GT số/0.
- **BR-STKV2-003 / 004 / 005**: Tách theo kho; không filter Garage; xuất file dump bảng.
- **BR-STKV2-009 / 010 / 011**: NXT 1 dòng/(mã+kho); đầu kỳ tra + nhập/xuất tính + cuối kỳ; hiển thị mã có phát sinh / tồn ≠ 0; chưa tính giá → chỉ GT Xuất = 0 (GT đầu/nhập là số thật, GT cuối = đầu + nhập − xuất).
- **BR-STKV2-015**: Phân quyền — chủ garage và kế toán quyền ngang nhau (AC-8).

## 6. Edge Cases

- **EC-1**: Mã chưa chạy BQGQ → chỉ GT Xuất = 0; GT Tồn đầu / GT Nhập là số thật; GT Tồn cuối = GT đầu + GT nhập.
- **EC-2**: Mã chỉ có tồn đầu (không phát sinh trong kỳ) → vẫn hiển thị (tồn đầu/cuối ≠ 0).
- **EC-3**: Mã ở nhiều kho → mỗi kho 1 dòng.

## 7. Out of Scope

- Báo cáo tồn đến ngày → `FEAT-STK-LIST-V2`. Thẻ kho → `FEAT-STK-DETAIL-V2`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-IP-VIEW-V2 (V2 của FEAT-IP-VIEW, dời từ EP-PERIOD sang STOCK-V2) — báo cáo NXT theo khoảng, 1 dòng/(mã+kho): Tồn đầu (tra) / Nhập-Xuất (tính) / Tồn cuối; GT theo BQGQ (số/0); lọc Kho multi + Từ/Đến; Xuất file. |
| 2026-06-15 | 2 | Business Authority | Sửa AC-4 / EC-1 / §5 cho khớp BR-STKV2-011 (Cách 1): khi chưa chạy BQGQ chỉ **GT Xuất = 0**, GT Tồn đầu / GT Nhập là số thật, GT Tồn cuối = GT đầu + GT nhập − GT xuất — bỏ cách diễn đạt "cả cột GT = 0". |
| 2026-06-15 | 3 | Business Authority | Đổi thuật ngữ tiếng Anh sang **"sổ tồn"** (AC-3, §5). |
| 2026-06-16 | 4 | Business Authority | Bổ sung cross-ref BR-STKV2-015 (phân quyền) vào §5 — đối xứng FEAT-STK-LIST-V2. |
| 2026-06-26 | 5 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14507-89273`. Mobile chưa có. |
| 2026-07-01 | 6 | Business Authority | **Sync với BR-STKV2-001/010 v5** — AC-3 đổi cả 4 cột (Tồn đầu / Nhập / Xuất / Tồn cuối) **đọc trực tiếp từ sổ tồn** (biến động cột nhập/xuất) thay vì tổng dòng chi tiết phiếu. Ghi rõ "KHÔNG đọc chi tiết phiếu" để tránh drift + đảm bảo cùng nguồn với Báo cáo tồn-đến-ngày. |
