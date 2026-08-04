---
type: feature
artifact_kind: feature
status: PLANNED
version: 5
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-STOCK-V2"
boundary: "gf-inventory"
last_reviewed: "2026-06-26"
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
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem lịch sử biến động (nhập/xuất) và tồn của một mã sản phẩm trong một kho theo khoảng ngày, **so that** tôi truy vết được dòng chảy tồn kho (thẻ kho) của mã đó.

## 2. Acceptance Criteria

### Nhóm A — Mở thẻ kho

- [ ] **AC-1**: Mở popup thẻ kho
  - Tại: Báo cáo tồn kho (`FEAT-STK-LIST-V2`), nút **"Xem lịch sử"** trên một dòng.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống mở popup **"Xem lịch sử tồn kho"** với mô tả **"Tra cứu phát sinh nhập/xuất và biến động tồn của một mã sản phẩm trong kho."**, tự lấy **mã + kho** của dòng đó (**không chọn mã trực tiếp**), bộ lọc Kho + Từ ngày + Đến ngày, bảng, dòng Tổng, nút **"Xuất file"** / **"Đóng"**.

### Nhóm B — Bảng thẻ kho (running)

- [ ] **AC-2**: Cột hiển thị
  - Tại: bảng thẻ kho.
  - Thì: hệ thống hiển thị: **"Kho"**, **"Mã SP nội bộ"**, **"Tên SP nội bộ"**, **"Ngày nhập/xuất"**, **"Số phiếu"**, **"Loại phiếu"**, **"Diễn giải"**, **"ĐVT"**, **"Đầu kỳ"** (SL, Giá trị), **"Nhập kho"** (SL, Giá trị), **"Xuất kho"** (SL, Giá trị), **"Cuối kỳ"** (SL, Giá trị).

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
  - Thì: hệ thống xuất `.xlsx` đúng các cột đang hiển thị theo bộ lọc (không cần mẫu riêng).

- [ ] **AC-8**: Phân quyền — chủ garage + kế toán quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14507-89272&t=W7XJPVvhmdBPtv2c-4 |

- Luồng: [UX-FLOW-INVENTORY-STOCK-V2](../ux/UX-FLOW-INVENTORY-STOCK-V2.md) §3.3.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Thẻ kho: Query `[PROPOSED] StockCardReport`.

## 5. Business Rules

- **BR-STKV2-001 / 002**: Cơ chế sổ tồn; SL realtime + giá trị số/0.
- **BR-STKV2-012 / 013 / 014**: Thẻ kho 1 mã+kho (popup từ Xem lịch sử); mỗi dòng = 1 phiếu running; đầu kỳ tra sổ tồn; dòng Tổng.
- **BR-STKV2-015**: Phân quyền — chủ garage và kế toán quyền ngang nhau (AC-8).

## 6. Edge Cases

- **EC-1**: Mã chưa có biến động trước Từ ngày → Đầu kỳ = 0.
- **EC-2**: Mã chưa chạy BQGQ → chỉ GT Xuất = 0; GT Đầu kỳ / GT Nhập là số thật; GT Cuối kỳ = GT Đầu + GT Nhập.
- **EC-3**: Không có biến động trong khoảng → bảng rỗng, Đầu kỳ = Cuối kỳ (= tồn tra được).

## 7. Out of Scope

- Báo cáo tồn đến ngày → `FEAT-STK-LIST-V2`. Báo cáo NXT → `FEAT-IP-VIEW-V2`.
- Chọn mã trực tiếp trong thẻ kho → không có (popup tự lấy mã+kho từ báo cáo tồn).

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-STK-DETAIL-V2 (V2 của FEAT-STK-DETAIL) — thẻ kho popup từ "Xem lịch sử" (1 mã+kho); mỗi dòng = 1 phiếu running Đầu kỳ→Nhập→Xuất→Cuối kỳ (SL+GT); đầu kỳ tra sổ tồn; giá trị số/0; Xuất file. |
| 2026-06-15 | 2 | Business Authority | Sửa AC-5 / EC-2 cho khớp BR-STKV2-014 (Cách 1): khi chưa chạy BQGQ chỉ **GT Xuất = 0**, GT Đầu kỳ / GT Nhập là số thật, GT Cuối kỳ = GT Đầu + GT Nhập − GT Xuất — bỏ cách diễn đạt "cả cột giá trị = 0". |
| 2026-06-15 | 3 | Business Authority | Đổi thuật ngữ tiếng Anh sang **"sổ tồn"** (AC-4, §5). |
| 2026-06-16 | 4 | Business Authority | Bổ sung cross-ref BR-STKV2-015 (phân quyền) vào §5 — đối xứng FEAT-STK-LIST-V2. |
| 2026-06-26 | 5 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14507-89272`. Mobile chưa có. |
