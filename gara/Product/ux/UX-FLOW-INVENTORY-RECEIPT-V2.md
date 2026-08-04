---
type: ux
artifact_kind: ux-spec
status: PLANNED
version: 9
tier: T2
owner_authority: Business Authority
last_reviewed: "2026-06-16"
supersedes: "UX-FLOW-INVENTORY-RECEIPT"
---

# UX-FLOW-INVENTORY-RECEIPT-V2: Nhập kho (V2)

---

## Metadata

| Field | Value |
|---|---|
| Screen / Flow | `UX-FLOW-INVENTORY-RECEIPT-V2` |
| Kind | FLOW |
| Referenced by | `FEAT-IR-LIST-V2`, `FEAT-IR-CREATE-V2`, `FEAT-IR-DETAIL-V2`, `FEAT-IR-EDIT-V2`, `FEAT-IR-DELETE`, `FEAT-IR-PRINT`, `FEAT-IR-EXPORT` |

## 1. Purpose

Luồng nhập kho V2 mô tả vòng đời phiếu nhập kho theo mô hình mới: tạo phiếu (Nháp) → **Ghi sổ kho** (cộng tồn) → có thể **Bỏ ghi sổ kho** (về Nháp) hoặc **Xóa**. Phiếu ghi nhận theo **mã sản phẩm nội bộ** (mapping SKU), nhập theo **ĐVT quy đổi** nhưng tồn lưu theo **ĐVT chính**, gắn **kho** từng dòng, tuân **lock kỳ kế toán** và **chặn tồn âm**.

**Người thực hiện:** Chủ garage và Kế toán — quyền ngang nhau.

**Nền tảng:** Garage Care — **Web GMS** (đầy đủ: tạo/sửa/ghi sổ/xóa…) + **App Garage** (chỉ **XEM** — view-only: danh sách & chi tiết phiếu nhập, không tạo/sửa).


### Sơ đồ luồng vận hành tổng quan

```
┌───────────────────────────────────────────────────────────────────┐
│                    LUỒNG NHẬP KHO V2                               │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ① TẠO PHIẾU (thông tin chung + tab chi tiết dòng)               │
│     → Nháp                                                        │
│                                                                   │
│  ② TẠI CHI TIẾT PHIẾU                                            │
│     Nháp ──┬─ Ghi sổ kho ──────────────► Ghi sổ kho (cộng tồn)   │
│            ├─ Sửa ─────────────────────► Nháp / Ghi sổ kho        │
│            └─ Xóa                                                 │
│     Ghi sổ kho ──┬─ Bỏ ghi sổ kho ─────► Nháp (trừ tồn)          │
│                   ├─ Sửa (nếu kỳ chưa khóa) → tính lại tồn        │
│                   ├─ In phiếu (PDF)                               │
│                   └─ Xóa (trừ tồn; chặn nếu tồn âm / kỳ khóa)    │
│                                                                   │
│  ③ GUARDRAIL                                                      │
│     • Kỳ kế toán đã đóng → chặn thêm/sửa/xóa                     │
│     • Chặn tồn âm (mọi thời điểm từ ngày chứng từ trở đi ≥ 0)    │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Dependency liên module

| Hướng | Module | Quan hệ |
|---|---|---|
| Upstream | `EP-INVENTORY-CATALOG` | Mã nội bộ + SKU + ĐVT |
| Upstream | `EP-INVENTORY-ACCOUNTING-PERIOD` | Kỳ đã đóng → khóa phiếu |
| Upstream | `EP-PROCUREMENT` | Kế thừa dữ liệu PO (không bắt buộc) |
| Downstream | `EP-INVENTORY-STOCK-V2` | Phiếu ghi sổ = biến động +tồn cho báo cáo |

## 2. Entry Points

| # | Điểm vào | Điều kiện | Đầu ra |
|---|---|---|---|
| 1 | Tab **"Phiếu nhập kho"** | Đã đăng nhập | Màn Danh sách phiếu nhập kho |
| 2 | Nút **"Tạo mới PN"** | Đang ở Danh sách | Form tạo phiếu nhập kho |
| 3 | Nhấn vào số phiếu | Đang ở Danh sách | Màn chi tiết phiếu |
| 4 | Icon Sửa (cột Thao tác) | Phiếu Nháp / Ghi sổ kho (kỳ chưa khóa) | Form sửa phiếu |
| 5 | Nút **"In"** / **"Xuất excel"** (Danh sách) | — | In phiếu / xuất file |

## 3. Layout / Wireframe

```
┌──────────────────────┐  Tạo mới PN  ┌──────────────────────┐
│  Danh sách phiếu     │─────────────►│  Form tạo phiếu      │
│  nhập kho            │              │  (header + tab       │
│ (FEAT-IR-LIST-V2)    │◄─────────────│   CHI TIẾT/ĐÍNH KÈM) │
│  + Xuất excel / In   │ Lưu / Đóng   │ (FEAT-IR-CREATE-V2)  │
└──┬───────────────────┘              └──────────────────────┘
   │ Xem chi tiết
   ▼
┌──────────────────────┐   Sửa        ┌──────────────────────┐
│  Chi tiết phiếu      │─────────────►│  Form sửa phiếu      │
│ (FEAT-IR-DETAIL-V2)  │◄─────────────│ (FEAT-IR-EDIT-V2)    │
│  Actions:            │ Lưu / Đóng   └──────────────────────┘
│  • Sửa               │
│  • Xóa               │──► popup xóa (FEAT-IR-DELETE)
│  • Ghi sổ kho        │
│  • Bỏ ghi sổ kho     │
│  • In phiếu nhập     │──► PDF (FEAT-IR-PRINT)
└──────────────────────┘
```

### 3.1 Bố cục form phiếu

- **Header**: Loại phiếu* · Mã đơn hàng (PO) · Mã lô hàng | Đối tượng* · Người phụ trách · Người giao hàng · Kho nhập* · Diễn giải | Số phiếu* (tự sinh) · Ngày nhập kho* · Trạng thái* | **Tổng giá trị phiếu** (sidebar).
- **Tab CHI TIẾT**: thanh trên chỉ có nút **Thêm phụ tùng** (không có nút "Xóa dòng" hàng loạt). Cột: STT · SKU · Tên phụ tùng · Mã SP nội bộ · Tên SP nội bộ · ĐVT nhập · SL nhập · SL quy đổi · ĐVT chính · Đơn giá nhập · Thành tiền · Kho · Ghi chú · **Thao tác (icon xóa dòng)**. Dòng Tổng (SL nhập, SL quy đổi, Thành tiền).
  - Dropdown **Mã SP nội bộ** có mục cuối **"+ Tạo mới mã nội bộ"** → **điều hướng** sang màn Tạo mã nội bộ (`FEAT-CAT-PROD-CREATE`); **cảnh báo rời trang** nếu phiếu có thay đổi chưa lưu (BR-IRV2-027).
  - Dropdown **ĐVT nhập** có mục cuối **"+ Thêm ĐVT quy đổi"** (khi dòng đã có mã nội bộ) → **modal inline** thêm ĐVT quy đổi cho mã (không rời phiếu) + tự chọn vào dòng (BR-IRV2-029).
- **Tab ĐÍNH KÈM**.

## 4. Trạng thái & quy tắc hiển thị

| Trạng thái | Badge | Nút hiện (kỳ **chưa khóa**) | Kỳ **đã khóa** |
|---|---|---|---|
| Nháp | cam | **Sửa · Xóa · Ghi sổ kho** | ẩn nút thao tác |
| Ghi sổ kho | xanh | **Sửa · Xóa · Bỏ ghi sổ kho** | ẩn nút thao tác |

> **In phiếu** (chi tiết) và **Xuất excel** (danh sách) **luôn khả dụng** — không phụ thuộc trạng thái hay kỳ. Quy tắc ẩn/hiện: xem `BR-IRV2-024`.

Bộ lọc danh sách: Nguồn nhập · Loại phiếu · Đối tượng · Trạng thái · Ngày nhập + tìm kiếm (Số phiếu / Số đơn hàng / Người tạo).

## 5. Edge Cases & Error States

| # | Tình huống | Xử lý UX |
|---|---|---|
| EC-1 | Ghi sổ / sửa / xóa làm tồn âm (bất kỳ thời điểm nào từ ngày chứng từ) | Chặn, báo lỗi tồn âm |
| EC-2 | Phiếu Ghi sổ kho thuộc kỳ đã khóa → bấm Sửa/Lưu | Báo lỗi "kỳ đã khóa", không cho lưu |
| EC-3 | Chọn PO | Kế thừa dữ liệu sản phẩm từ đơn hàng |
| EC-4 | Không chọn SKU | Vẫn chọn mã nội bộ độc lập, đổ tên + ĐVT chính |
| EC-5 | Đổi kho ở dòng / sửa SL / ngày | Tính lại tồn + re-check tồn âm |
| EC-6 | Bỏ ghi sổ kho | Trừ tồn đã cộng, phiếu về Nháp |
| EC-7 | Phiếu **Nền tảng** (mua đẩy sang) ở Nháp có dòng chỉ có SKU (chưa mã nội bộ) | Lưu Nháp được (chưa tác động tồn); bấm Ghi sổ mà còn dòng thiếu mã nội bộ → **chặn** (`ERR-INV-011`), yêu cầu tạo/gắn mã nội bộ (nút "+ Tạo mới mã nội bộ" trên dòng) |

## 6. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo UX-FLOW-INVENTORY-RECEIPT-V2 (file mới) — luồng nhập kho V2: Nháp→Ghi sổ kho→Bỏ ghi sổ + Xóa; form header + tab chi tiết (SKU/mã nội bộ/ĐVT quy đổi/kho theo dòng); guardrail chặn tồn âm + lock kỳ; In phiếu / Xuất excel. §4 ma trận ẩn/hiện nút theo trạng thái + kỳ (BR-IRV2-024). |
| 2026-06-10 | 2 | Business Authority | Thêm khung **CR** (tailor đầy đủ cho UX): Metadata (Loại thay đổi CR / Màn hình target UX-FLOW-INVENTORY-RECEIPT) + section **§0 Bối cảnh thay đổi (Change Request — DEV đọc trước)** + **§0.1 bảng Δ map luồng V2↔V1** (trước đó UX-flow chưa có Δ). Bổ sung frontmatter `supersedes`. |
| 2026-06-10 | 3 | Business Authority | Gỡ nhắc **"Import dòng"** khỏi §0.1 Δ + §3.1 Tab CHI TIẾT. |
| 2026-06-10 | 4 | Business Authority | §3.1: thêm hành vi dropdown "Mã SP nội bộ" có **"+ Tạo mới mã nội bộ"** → điều hướng `FEAT-CAT-PROD-CREATE` (BR-IRV2-027). |
| 2026-06-10 | 5 | Business Authority | Thêm **EC-7**: phiếu Nền tảng (mua đẩy) ở Nháp có dòng chỉ có SKU → Ghi sổ bắt buộc đủ mã nội bộ, thiếu thì chặn (BR-IRV2-028). |
| 2026-06-10 | 6 | Business Authority | §3.1: thêm hành vi dropdown **ĐVT nhập** có **"+ Thêm ĐVT quy đổi"** → modal inline (BR-IRV2-029). |
| 2026-06-10 | 7 | Business Authority | Gỡ khung mapping V1↔V2 (CR, §0 Bối cảnh, bảng Δ, lineage tags) — spec V2 đứng độc lập; giữ nguyên toàn bộ nội dung nghiệp vụ. |
| 2026-06-16 | 8 | Business Authority | Đăng ký mã lỗi: đổi mã bare → ERR-INV-NNN (ERROR-CODE-REGISTRY §4). |
| 2026-06-16 | 9 | Business Authority | **Mở mobile (view-only)**: dòng "Nền tảng" → Web GMS (đầy đủ) + **App Garage (chỉ XEM** danh sách & chi tiết phiếu nhập). Đảo "Web GMS only". (Bước 1 CR mobile kho V2.) |
