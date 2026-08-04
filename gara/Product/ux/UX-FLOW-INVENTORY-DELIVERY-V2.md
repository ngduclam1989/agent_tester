---
type: ux
artifact_kind: ux-spec
status: PLANNED
version: 9
tier: T2
owner_authority: Business Authority
last_reviewed: "2026-06-16"
---

# UX-FLOW-INVENTORY-DELIVERY-V2: Xuất kho (V2)

---

## Metadata

| Field | Value |
|---|---|
| Screen / Flow | `UX-FLOW-INVENTORY-DELIVERY-V2` |
| Kind | FLOW |
| Referenced by | `FEAT-ID-LIST-V2`, `FEAT-ID-CREATE-V2`, `FEAT-ID-DETAIL-V2`, `FEAT-ID-EDIT-V2`, `FEAT-ID-DELETE`, `FEAT-ID-PRINT`, `FEAT-ID-EXPORT` |

## 1. Purpose

Luồng xuất kho V2: tạo phiếu (Nháp) → **Ghi sổ kho** (trừ tồn) → có thể **Bỏ ghi sổ kho** (về Nháp) hoặc **Xóa**. Phiếu ghi nhận theo **mã sản phẩm nội bộ** (mapping SKU), xuất theo **ĐVT quy đổi** quy về **ĐVT chính**, hiển thị **tồn khả dụng** và **chặn tồn âm** khi ghi sổ, đối soát phiếu dịch vụ (SO), tuân **lock kỳ kế toán**. Giá vốn xuất = 0 đến khi chạy BQGQ cuối kỳ.

**Người thực hiện:** Chủ garage và Kế toán — quyền ngang nhau. **Nền tảng:** Garage Care — **Web GMS** (đầy đủ: tạo/sửa/ghi sổ/xóa…) + **App Garage** (chỉ **XEM** — view-only: danh sách & chi tiết phiếu xuất, không tạo/sửa).

### Sơ đồ luồng vận hành tổng quan

```
┌───────────────────────────────────────────────────────────────────┐
│                    LUỒNG XUẤT KHO V2                               │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ① TẠO PHIẾU (header + tab chi tiết, hiển thị Tồn khả dụng)      │
│     → Nháp                                                        │
│                                                                   │
│  ② TẠI CHI TIẾT PHIẾU                                            │
│     Nháp ──┬─ Ghi sổ kho ──► Ghi sổ kho (trừ tồn)               │
│            │     └─ check tồn khả dụng: "Không đủ tồn" → chặn     │
│            ├─ Sửa / Xóa                                           │
│     Ghi sổ kho ──┬─ Bỏ ghi sổ kho ──► Nháp (cộng tồn lại)       │
│                   ├─ Sửa (kỳ chưa khóa) → tính lại tồn           │
│                   ├─ Xóa (kỳ chưa khóa) → cộng tồn lại           │
│                   └─ In phiếu xuất (PDF)                          │
│                                                                   │
│  ③ GUARDRAIL                                                      │
│     • Kỳ kế toán đã đóng → chặn thêm/sửa/xóa/ghi sổ              │
│     • Chặn tồn âm (mọi thời điểm từ ngày chứng từ trở đi ≥ 0)    │
│     • Đối soát SO lệch → cảnh báo (không chặn)                   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Dependency liên module

| Hướng | Module | Quan hệ |
|---|---|---|
| Upstream | `EP-INVENTORY-CATALOG` | Mã nội bộ + SKU + ĐVT |
| Upstream | `EP-INVENTORY-ACCOUNTING-PERIOD` | Kỳ đã đóng → khóa; PRC cập nhật giá vốn |
| Upstream | `EP-INVENTORY-RECEIPT-V2` / `EP-INVENTORY-OPENING-BALANCE` | Nguồn tồn để xuất |
| Liên quan | `EP-SERVICE-ORDER` | Đối soát phiếu dịch vụ (SO) |
| Downstream | `EP-INVENTORY-STOCK-V2` | Phiếu xuất ghi sổ = biến động −tồn |

## 2. Entry Points

| # | Điểm vào | Điều kiện | Đầu ra |
|---|---|---|---|
| 1 | Tab **"Phiếu xuất kho"** | Đã đăng nhập | Màn Danh sách phiếu xuất kho |
| 2 | Nút **"Tạo mới PX"** | Đang ở Danh sách | Form tạo phiếu xuất kho |
| 3 | Nhấn Số phiếu | Đang ở Danh sách | Màn chi tiết phiếu |
| 4 | Icon Sửa / Xóa (cột Thao tác) | Theo trạng thái + kỳ chưa khóa | Form sửa / popup xóa |
| 5 | Nút **"In"** / **"Xuất excel"** | — | In phiếu / xuất file |

## 3. Layout / Wireframe

```
┌──────────────────────┐  Tạo mới PX  ┌──────────────────────┐
│  Danh sách phiếu     │─────────────►│  Form tạo phiếu      │
│  xuất kho            │              │  (header + tab       │
│ (FEAT-ID-LIST-V2)    │◄─────────────│   CHI TIẾT/ĐÍNH KÈM) │
│  + Xuất excel / In   │ Lưu / Đóng   │ (FEAT-ID-CREATE-V2)  │
└──┬───────────────────┘              └──────────────────────┘
   │ Xem chi tiết
   ▼
┌──────────────────────┐   Sửa        ┌──────────────────────┐
│  Chi tiết phiếu      │─────────────►│  Form sửa phiếu      │
│ (FEAT-ID-DETAIL-V2)  │◄─────────────│ (FEAT-ID-EDIT-V2)    │
│  Actions: Sửa/Xóa/   │ Lưu / Đóng   └──────────────────────┘
│  Ghi sổ kho/Bỏ ghi   │
│  sổ kho/In phiếu xuất│──► popup xóa (FEAT-ID-DELETE)
│                      │──► popup Ghi sổ / Bỏ ghi sổ (xác nhận)
└──────────────────────┘──► PDF (FEAT-ID-PRINT)
```

### 3.1 Bố cục form phiếu

- **Header**: Loại phiếu* (Xuất bán / Xuất trả hàng mua / Xuất sửa chữa / Xuất khác) · Mã đơn hàng (SO) · Mã lô hàng | Đối tượng* (đổ theo loại phiếu) · Người phụ trách · Người giao hàng · Kho xuất* · Diễn giải | Số phiếu* (tự sinh) · Ngày xuất kho* · Trạng thái* | **Tổng giá trị phiếu** (= 0 đến khi chạy BQGQ).
- **Tab CHI TIẾT**: thanh trên chỉ có nút **Thêm phụ tùng** (không có nút "Xóa dòng" hàng loạt). Cột: STT · SKU · Tên phụ tùng · Mã SP nội bộ · Tên SP nội bộ · **Tồn khả dụng** · ĐVT xuất · SL xuất · SL quy đổi · ĐVT chính · Đơn giá vốn (0) · Tiền vốn (0) · Kho · Ghi chú · **Thao tác (icon xóa dòng)**. Dòng Tổng (SL xuất, SL quy đổi).
  - Dropdown **Mã SP nội bộ** có mục cuối **"+ Tạo mới mã nội bộ"** → **điều hướng** sang màn Tạo mã nội bộ (`FEAT-CAT-PROD-CREATE`); **cảnh báo rời trang** nếu phiếu có thay đổi chưa lưu (BR-IDV2-027).
  - Dropdown **ĐVT xuất** có mục cuối **"+ Thêm ĐVT quy đổi"** (khi dòng đã có mã nội bộ) → **modal inline** thêm ĐVT quy đổi cho mã (không rời phiếu) + tự chọn vào dòng (BR-IDV2-029).
- **Tab ĐÍNH KÈM**.

## 4. Trạng thái & quy tắc hiển thị nút

| Trạng thái | Badge | Nút hiện (kỳ **chưa khóa**) | Kỳ **đã khóa** |
|---|---|---|---|
| Nháp | cam | **Sửa · Xóa · Ghi sổ kho** | ẩn nút thao tác |
| Ghi sổ kho | xanh | **Sửa · Xóa · Bỏ ghi sổ kho** | ẩn nút thao tác |

> **In phiếu** (chi tiết) và **Xuất excel** (danh sách) **luôn khả dụng**. Quy tắc ẩn/hiện: `BR-IDV2-024`.

Bộ lọc danh sách: Loại phiếu · Đối tượng · Trạng thái · Ngày xuất + tìm kiếm (Số phiếu xuất / Phiếu dịch vụ / Người tạo).

## 5. Edge Cases & Error States

| # | Tình huống | Xử lý UX |
|---|---|---|
| EC-1 | SL xuất > tồn khả dụng | Dòng cảnh báo **"Không đủ tồn"** (đỏ); **chặn ghi sổ** |
| EC-2 | Ghi sổ / sửa / xóa làm tồn âm bất kỳ thời điểm | Chặn, báo lỗi tồn âm |
| EC-3 | Phiếu thuộc kỳ đã khóa | Chặn sửa/xóa/ghi sổ/bỏ ghi sổ |
| EC-4 | Phiếu liên kết SO nhưng SL/sản phẩm lệch | **Cảnh báo** (không chặn) |
| EC-5 | Phiếu **Nền tảng** (bán/SO đẩy) ở Nháp có dòng chỉ có SKU (chưa mã nội bộ) | Lưu Nháp được (chưa tác động tồn); bấm Ghi sổ mà còn dòng thiếu mã nội bộ → **chặn** (`ERR-INV-011`), tạo/gắn mã nội bộ (nút "+ Tạo mới mã nội bộ" trên dòng) |
| EC-6 | Bỏ ghi sổ kho | Cộng tồn lại, phiếu về Nháp |
| EC-7 | Tiền vốn trước khi chạy BQGQ | Hiển thị **0**; sau BQGQ → số thực |

## 6. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo UX-FLOW-INVENTORY-DELIVERY-V2 (file mới) — luồng xuất kho V2: Nháp→Ghi sổ kho→Bỏ ghi sổ + Xóa; tồn khả dụng + cảnh báo "Không đủ tồn" + chặn tồn âm; đối soát SO (cảnh báo); giá vốn=0 đến BQGQ; ma trận ẩn/hiện nút; In/Xuất excel. |
| 2026-06-10 | 2 | Business Authority | Gỡ nhắc **"Import dòng"** khỏi §3 Tab CHI TIẾT (V1 vốn không có chức năng này). |
| 2026-06-10 | 3 | Business Authority | §3: thêm hành vi dropdown "Mã SP nội bộ" có **"+ Tạo mới mã nội bộ"** → điều hướng `FEAT-CAT-PROD-CREATE` (BR-IDV2-027). |
| 2026-06-10 | 4 | Business Authority | Thêm **EC-5**: phiếu Nền tảng (bán/SO đẩy) ở Nháp có dòng chỉ có SKU → Ghi sổ bắt buộc đủ mã nội bộ, thiếu thì chặn (BR-IDV2-028). |
| 2026-06-10 | 5 | Business Authority | §3: thêm hành vi dropdown **ĐVT xuất** có **"+ Thêm ĐVT quy đổi"** → modal inline (BR-IDV2-029). |
| 2026-06-15 | 6 | Business Authority | Đổi nhãn cột **"Giá vốn" → "Tiền vốn"** ở tab CHI TIẾT (§3) + EC-6 — đồng bộ "Tiền vốn". |
| 2026-06-16 | 7 | Business Authority | Fix: renumber EC-5 trùng trong §5 — EC-5 "Bỏ ghi sổ kho" → EC-6; EC-6 "Tiền vốn trước BQGQ" → EC-7. EC liên tục không trùng. |
| 2026-06-16 | 8 | Business Authority | Đăng ký mã lỗi: đổi mã bare → ERR-INV-NNN (ERROR-CODE-REGISTRY §4). |
| 2026-06-16 | 9 | Business Authority | **Mở mobile (view-only)**: dòng "Nền tảng" → Web GMS (đầy đủ) + **App Garage (chỉ XEM** danh sách & chi tiết phiếu xuất). Đảo "Web GMS only". (Bước 1 CR mobile kho V2.) |
