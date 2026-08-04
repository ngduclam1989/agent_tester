---
type: ux
artifact_kind: ux-spec
status: PLANNED
version: 6
tier: T2
owner_authority: Business Authority
last_reviewed: "2026-07-01"
---

# UX-FLOW-INVENTORY-STOCK-V2: Báo cáo tồn kho (V2)

---

## Metadata

| Field | Value |
|---|---|
| Screen / Flow | `UX-FLOW-INVENTORY-STOCK-V2` |
| Kind | FLOW |
| Referenced by | `FEAT-STK-LIST-V2`, `FEAT-IP-VIEW-V2`, `FEAT-STK-DETAIL-V2` |

## 1. Purpose

Luồng báo cáo tồn kho V2 gồm 3 màn: **Báo cáo tồn kho đến ngày**, **Báo cáo Nhập Xuất Tồn (NXT)**, và **Xem lịch sử tồn kho (thẻ kho)**. Tất cả dựa trên **cơ chế lưu tồn (sổ tồn)**: SL realtime, giá trị theo BQGQ (số/0, không "Tạm tính"); tách dòng theo (mã + kho); không filter Garage (theo login).

**Người thực hiện:** Chủ garage và Kế toán — quyền ngang nhau. **Nền tảng:** Garage Care — **Web GMS** (đầy đủ) + **App Garage** (chỉ **XEM** — view-only: báo cáo tồn kho, không thao tác).

> V2 **không có điều chỉnh tồn**; file V1 cũ giữ nguyên, không link.

### Sơ đồ luồng

```
┌───────────────────────────────────────────────────────────────────┐
│                  BÁO CÁO TỒN KHO V2                               │
├───────────────────────────────────────────────────────────────────┤
│  Tab "Báo cáo tồn kho" (FEAT-STK-LIST-V2)                        │
│     lọc: mã/tên + Kho + "đến ngày"                               │
│     → SL tồn (realtime) + Giá trị tồn (số/0)                      │
│     └─ "Xem lịch sử" ──► Thẻ kho (popup, FEAT-STK-DETAIL-V2)     │
│           1 mã + 1 kho · lọc Từ/Đến · Đầu kỳ→Nhập→Xuất→Cuối       │
│           (running theo từng phiếu)                               │
│                                                                   │
│  Tab "Báo cáo NXT" (FEAT-IP-VIEW-V2)                             │
│     lọc: mã/tên + Kho + Từ/Đến                                   │
│     → 1 dòng/(mã+kho): Tồn đầu / Nhập / Xuất / Tồn cuối (SL+GT)  │
│                                                                   │
│  Tất cả: nút "Xuất file" (.xlsx, dump đúng cột hiển thị)        │
└───────────────────────────────────────────────────────────────────┘
```

### Dependency liên module

| Hướng | Module | Quan hệ |
|---|---|---|
| Upstream | RECEIPT-V2 / DELIVERY-V2 / OPENING-BALANCE | Biến động → sổ tồn tồn |
| Upstream | ACCOUNTING-PERIOD (PRC) | Giá vốn xuất chốt sau BQGQ; chưa chạy → chỉ GT Xuất = 0 (GT đầu kỳ / GT nhập vẫn là số thật) |
| Upstream | CATALOG | Mã nội bộ + ĐVT chính |

## 2. Entry Points

| # | Điểm vào | Đầu ra |
|---|---|---|
| 1 | Tab **"Báo cáo tồn kho"** | Màn Báo cáo tồn kho đến ngày |
| 2 | Tab **"Báo cáo NXT"** | Màn Báo cáo Nhập Xuất Tồn |
| 3 | Nút **"Xem lịch sử"** trên dòng báo cáo tồn | Popup Thẻ kho (mã + kho của dòng đó) |
| 4 | Nút **"Xuất file"** | Tải `.xlsx` theo bộ lọc |

## 3. Layout / Wireframe

### 3.1 Báo cáo tồn kho đến ngày (STK-LIST-V2)
- Filter: search (mã/tên) · Kho (tất cả/nhiều) · **Ngày (đến ngày)**.
- Cột: STT · Mã nội bộ · Tên SP · ĐVT chính · Kho · **Số lượng tồn** · **Giá trị tồn** · Thao tác (**Xem lịch sử**). Dòng Tổng. Nút Xuất file.

### 3.2 Báo cáo NXT (IP-VIEW-V2)
- Filter: search (mã/tên) · Kho · **Từ ngày + Đến ngày**.
- Cột: STT · Mã nội bộ · Tên SP · ĐVT chính · Kho · **Tồn đầu kỳ (SL, GT)** · **Nhập (SL, GT)** · **Xuất (SL, GT)** · **Tồn cuối (SL, GT)**. Dòng Tổng. Nút Xuất file.

### 3.3 Thẻ kho — Xem lịch sử tồn kho (STK-DETAIL-V2, popup)
- Mở từ "Xem lịch sử" → tự lấy mã + kho. Filter: Kho · Từ ngày · Đến ngày.
- Cột: Kho · Mã nội bộ · Tên SP · Ngày nhập/xuất · Số phiếu · Loại phiếu · Diễn giải · ĐVT · **Đầu kỳ (SL, GT)** · **Nhập kho (SL, GT)** · **Xuất kho (SL, GT)** · **Cuối kỳ (SL, GT)**. Dòng Tổng. Nút Xuất file / Đóng.

## 4. Quy tắc hiển thị

| Quy tắc | Chi tiết |
|---|---|
| SL tồn | Realtime (tra sổ tồn) |
| Giá trị tồn | Số/0 — **không "Tạm tính"** trong ô |
| Tách theo kho | 1 (mã + kho) = 1 dòng |
| Hiển thị mã (báo cáo tồn) | SL tồn > 0 tại ngày đã chọn |
| Hiển thị mã (NXT) | Có phát sinh nhập/xuất trong kỳ HOẶC tồn đầu/cuối ≠ 0 |
| Đầu kỳ / tồn-đến-ngày | **Đọc trực tiếp từ sổ tồn** — tồn cuối ngày của mốc gần nhất ≤ ngày |
| Nhập/Xuất trong kỳ (NXT) | **Đọc trực tiếp từ sổ tồn** — tổng biến động nhập/xuất trong khoảng (KHÔNG đọc chi tiết phiếu) |
| Tồn cuối kỳ (NXT) | **Đọc trực tiếp từ sổ tồn** — tồn cuối ngày mốc gần nhất ≤ Đến ngày (= Đầu + Nhập − Xuất theo tính chất) |
| Thẻ kho (per-phiếu) | Đọc chi tiết phiếu nhập/xuất (running balance, đầu kỳ tra sổ tồn) |

## 5. Edge Cases & Error States

| # | Tình huống | Xử lý UX |
|---|---|---|
| EC-1 | Mã chưa chạy BQGQ | Chỉ GT Xuất = 0 (giá vốn chưa chốt); GT đầu kỳ / GT nhập là số thật; GT tồn cuối = GT đầu + GT nhập − GT xuất. Ghi chú ngoài bảng nhắc cần chạy tính giá |
| EC-2 | Tra ngày trước mốc tồn đầu (OB) | Tồn = 0 |
| EC-3 | Tra ngày tương lai | = tồn hiện tại (= dòng sổ tồn gần nhất ≤ ngày hiện tại; không cộng dồn) |
| EC-4 | Mã ở nhiều kho | Mỗi kho 1 dòng |
| EC-5 | Xem lịch sử của 1 mã+kho | Popup thẻ kho tự lấy mã+kho, không cho đổi mã |

## 6. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo UX-FLOW-INVENTORY-STOCK-V2 (file mới) — 3 màn: Báo cáo tồn đến ngày, Báo cáo NXT, Thẻ kho (popup từ Xem lịch sử). Cơ chế lưu tồn (sổ tồn): SL realtime + giá trị số/0, tách theo kho, xuất file dump bảng. |
| 2026-06-15 | 2 | Business Authority | Sửa Dependency (§1) và EC-1 (§5) cho khớp BR-STKV2-002/011/014 (Cách 1): khi chưa chạy BQGQ chỉ **GT Xuất = 0**, GT đầu kỳ / GT nhập là số thật, GT tồn cuối = GT đầu + GT nhập − GT xuất — bỏ cách diễn đạt "cả cột giá trị = 0". |
| 2026-06-15 | 3 | Business Authority | Đổi thuật ngữ tiếng Anh sang **"sổ tồn"** (§1, §3, §4). |
| 2026-06-16 | 4 | Business Authority | Fix: sửa wording EC-3 cho khớp cơ chế tra cứu tồn-đến-ngày (không cộng dồn). |
| 2026-06-16 | 5 | Business Authority | **Mở mobile (view-only)**: dòng "Nền tảng" → Web GMS (đầy đủ) + **App Garage (chỉ XEM** báo cáo tồn kho). Đảo "Web GMS only". (Bước 1 CR mobile kho V2.) |
| 2026-07-01 | 6 | Business Authority | **Sync §4 với BR-STKV2-001/010 v5** — quy tắc hiển thị Đầu kỳ / Nhập/Xuất kỳ / Tồn cuối kỳ đều **đọc trực tiếp từ sổ tồn** (báo cáo tồn-đến-ngày + NXT cùng 1 nguồn). Thẻ kho đọc chi tiết phiếu (per-phiếu, running balance, đầu kỳ tra sổ tồn). Bỏ wording "tính tổng biến động" (drift với BR mới). |
