---
type: feature
artifact_kind: feature
status: PLANNED
version: 4
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-STOCK-V2"
boundary: "gf-inventory"
last_reviewed: "2026-06-26"
supersedes: "FEAT-STK-LIST"
---

# FEAT-STK-LIST-V2: Báo cáo tồn kho đến ngày

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-STK-LIST-V2` |
| Title | Báo cáo tồn kho đến ngày |
| Parent Epic | `EP-INVENTORY-STOCK-V2` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem tồn kho (số lượng + giá trị) của mã sản phẩm nội bộ đến một ngày bất kỳ, **so that** tôi nắm tồn tại thời điểm cần (kiểm kê, đối soát) và mở thẻ kho khi cần.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị báo cáo

- [ ] **AC-1**: Mở màn báo cáo
  - Tại: tab **"Báo cáo tồn kho"**.
  - Khi: chủ garage truy cập.
  - Thì: hệ thống hiển thị màn **"Báo cáo tồn kho đến ngày"** với mô tả **"Xem số lượng tồn realtime theo Ngày nhập/Ngày xuất; giá trị phụ thuộc tính giá bình quân."**, bộ lọc, bảng, dòng Tổng, phân trang, nút **"Xuất file"**.

- [ ] **AC-2**: Cột hiển thị
  - Tại: bảng báo cáo.
  - Thì: hệ thống hiển thị: **"STT"**, **"Mã nội bộ"**, **"Tên sản phẩm"**, **"ĐVT chính"**, **"Kho"**, **"Số lượng tồn"**, **"Giá trị tồn"**, **"Thao tác"** (Xem lịch sử). Dòng **Tổng** (Số lượng tồn + Giá trị tồn).

- [ ] **AC-3**: Số lượng & giá trị tồn
  - Tại: cột **"Số lượng tồn"** / **"Giá trị tồn"**.
  - Khi: báo cáo render theo ngày đã chọn.
  - Thì: **Số lượng tồn** = SL tồn của dòng sổ tồn gần nhất ≤ ngày đã chọn (realtime, tra cứu). **Giá trị tồn** = một con số (= GT tồn đầu + GT nhập − giá vốn xuất; giá vốn xuất = 0 nếu chưa chạy BQGQ) — **không hiển thị chữ "Tạm tính"**.

### Nhóm B — Bộ lọc

- [ ] **AC-4**: Bộ lọc
  - Tại: ô tìm kiếm (placeholder **"Mã sản phẩm nội bộ, tên sản phẩm"**) + **Kho** + **Ngày** (đến ngày).
  - Thì: search LIKE mã/tên; **Kho** chọn tất cả / nhiều kho; **Ngày** là 1 mốc "đến ngày". **Không filter Garage** (theo login).

- [ ] **AC-5**: Tách dòng theo kho
  - Tại: bảng báo cáo.
  - Khi: một mã có tồn ở nhiều kho.
  - Thì: hệ thống hiển thị **mỗi (mã + kho) = 1 dòng** (không gộp kho).

- [ ] **AC-6**: Hiển thị mã theo ngày
  - Tại: bảng báo cáo.
  - Khi: báo cáo theo ngày đã chọn.
  - Thì: hệ thống hiển thị các mã có **SL tồn > 0 tại ngày đó** (tồn biến theo ngày — cùng mã có thể hiện/ẩn tùy ngày lọc).

### Nhóm C — Thao tác

- [ ] **AC-7**: Xem lịch sử (thẻ kho)
  - Tại: cột Thao tác, link **"Xem lịch sử"**.
  - Khi: chủ garage nhấn trên một dòng.
  - Thì: hệ thống mở popup **Thẻ kho** (`FEAT-STK-DETAIL-V2`) — tự lấy **mã + kho** của dòng đó.

- [ ] **AC-8**: Xuất file
  - Tại: nút **"Xuất file"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống xuất `.xlsx` đúng các cột đang hiển thị theo bộ lọc hiện tại (không cần mẫu riêng).

### Nhóm D — Phân quyền

- [ ] **AC-9**: Phân quyền — chủ garage + kế toán quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14507-89271&t=W7XJPVvhmdBPtv2c-4 |
| Figma | mobile | https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21632-28892&t=30dKkXMi0PSOdK7b-4 |

- Luồng: [UX-FLOW-INVENTORY-STOCK-V2](../ux/UX-FLOW-INVENTORY-STOCK-V2.md) §3.1.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Báo cáo tồn đến ngày: Query `[PROPOSED] StockOnHandReport`.

## 5. Business Rules

- **BR-STKV2-001 / 002**: Cơ chế sổ tồn; SL realtime + giá trị số/0 (không "Tạm tính").
- **BR-STKV2-003 / 004 / 005**: Tách theo kho; không filter Garage; xuất file dump bảng.
- **BR-STKV2-006 / 007 / 008**: Mốc "đến ngày"; hiển thị mã SL>0 theo ngày; bộ lọc.
- **BR-STKV2-015**: Phân quyền — chủ garage và kế toán quyền ngang nhau (AC-9).

## 6. Edge Cases

- **EC-1**: Tra ngày trước mốc tồn đầu (OB) → tồn = 0.
- **EC-2**: Tra ngày tương lai → = tồn hiện tại.
- **EC-3**: Mã chưa chạy BQGQ → giá trị tồn vẫn là số (tồn đầu + nhập − 0).

## 7. Out of Scope

- Thẻ kho (lịch sử biến động) → `FEAT-STK-DETAIL-V2`.
- Báo cáo NXT → `FEAT-IP-VIEW-V2`.
- Điều chỉnh tồn → **không có trong V2**.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-STK-LIST-V2 (V2 của FEAT-STK-LIST) — báo cáo tồn kho đến ngày: SL realtime (tra sổ tồn) + giá trị số/0, lọc mã/tên + Kho (multi) + "đến ngày", tách dòng theo kho, hiển thị mã SL>0 theo ngày, Xem lịch sử (thẻ kho), Xuất file. |
| 2026-06-15 | 2 | Business Authority | Đổi thuật ngữ tiếng Anh sang **"sổ tồn"** (AC-3, §5). |
| 2026-06-16 | 3 | Business Authority | Fix: bổ sung tham chiếu BR-STKV2-015 (phân quyền) vào §5. |
| 2026-06-26 | 4 | Business Authority | **Gắn Figma web + mobile vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14507-89271`, mobile node `21632-28892`. |
