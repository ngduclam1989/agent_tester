---
type: ux
artifact_kind: ux-spec
status: PLANNED
version: 10
tier: T2
owner_authority: Business Authority
last_reviewed: "2026-07-08"
---

# UX-FLOW-INVENTORY-OPENING-BALANCE: Tồn đầu kỳ

---

## Metadata

| Field | Value |
|---|---|
| Screen / Flow | `UX-FLOW-INVENTORY-OPENING-BALANCE` |
| Kind | FLOW |
| Referenced by | `FEAT-OB-LIST`, `FEAT-OB-IMPORT`, `FEAT-OB-EDIT`, `FEAT-OB-DELETE-LINES` |

## 1. Purpose

Luồng tồn đầu kỳ mô tả cách garage **import** số lượng và giá trị tồn theo mã sản phẩm nội bộ (theo kho, chốt tại một ngày) với bước kiểm tra dữ liệu trước khi ghi, và **rà soát / xóa** các dòng đã import theo guardrail. Tồn đầu kỳ là nguồn tồn cho xuất kho và báo cáo tồn/NXT.

**Người thực hiện:** Chủ garage và Kế toán — quyền ngang nhau.

**Nền tảng:** Garage Care — **Web GMS** (đầy đủ: import/xóa…) + **App Garage** (chỉ **XEM** — read-only ops: danh sách tồn đầu kỳ + **search theo mã / tên sản phẩm** + **filter theo Kho / Ngày Import**. KHÔNG có: import / edit / delete).

### Sơ đồ luồng vận hành tổng quan

```
┌───────────────────────────────────────────────────────────────────┐
│                     LUỒNG TỒN ĐẦU KỲ (OPENING BALANCE)            │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Danh sách tồn đầu kỳ                                             │
│     ├─ Import tồn đầu kỳ (SINGLE-PAGE — không wizard)             │
│     │     • Tải template (.xlsx) → upload file                    │
│     │     • Preview inline: 3 card (Tổng / Hợp lệ / Lỗi)          │
│     │     • Bảng preview + "Tải file lỗi" (nếu có dòng lỗi)       │
│     │     • Rule: >0 dòng lỗi ⇒ nút "Xác nhận" DISABLED           │
│     │     • Cap 500 dòng/file (ERR-INV-048)                       │
│     │     └─ Xác nhận import → ALL-OR-NOTHING (BR-OB-004a)        │
│     │         • 1 dòng lỗi → reject toàn bộ + rollback            │
│     │         • 100% valid → toast SUCCESS + về danh sách         │
│     │                                                             │
│     ├─ Sửa dòng (icon ✏️ per row) → form Sửa dòng OB              │
│     │     • Sửa SL/giá trị/ĐVT, cascade sổ tồn từ "Tồn đến ngày"  │
│     │                                                             │
│     └─ Chọn dòng (checkbox) → Xóa dòng đã chọn                    │
│           • Fail-fast theo ids[]: dừng ở id đầu vi phạm           │
│           • Thứ tự mã lỗi: ERR-INV-024 (kỳ đóng) TRƯỚC            │
│                            → ERR-INV-036 (tồn âm) SAU             │
│           • Cho xóa nếu tồn ≥ 0 sau delete (BR-OB-DEL-005)        │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Dependency liên module

| Hướng | Module | Quan hệ |
|---|---|---|
| Upstream | `EP-INVENTORY-CATALOG` | Tham chiếu mã sản phẩm nội bộ + ĐVT chính (validate ĐVT khớp) |
| Upstream | `EP-INVENTORY-ACCOUNTING-PERIOD` | "Tồn đến ngày" rơi vào kỳ đã đóng → chặn import/xóa |
| Ràng buộc | `EP-INVENTORY-RECEIPT-V2` / `EP-INVENTORY-DELIVERY-V2` | OB phải **trước mọi phiếu** (mã+kho): import OB sau phiếu đã ghi sổ → chặn (BR-OB-016); tạo phiếu nhập trước OB → chặn (BR-IRV2-030) |
| Downstream | `EP-INVENTORY-DELIVERY-V2` | Tồn đầu kỳ là nguồn tồn để xuất kho |
| Downstream | `EP-INVENTORY-STOCK-V2` | Báo cáo tồn/NXT lấy tồn đầu kỳ làm điểm khởi đầu |

## 2. Entry Points

| # | Điểm vào | Điều kiện | Đầu ra |
|---|---|---|---|
| 1 | Menu/Nút **"Tồn đầu kỳ"** (Web GMS) | Đã đăng nhập, thuộc garage hiện tại | Màn Danh sách tồn đầu kỳ (màn mặc định) |
| 2 | Nút **"Import tồn đầu kỳ"** (Web GMS) | Đang ở Danh sách | Màn Import **single-page** (upload + preview inline + xác nhận cùng 1 màn) |
| 3 | Icon **✏️ Sửa** trên dòng OB (danh sách, Web GMS) | Row hợp lệ, không thuộc kỳ đóng | Form **"Sửa dòng OB"** (FEAT-OB-EDIT) |
| 4 | Chọn dòng (checkbox) + nút **"Xóa dòng đã chọn"** (Web GMS) | Đã chọn ≥ 1 dòng | Popup xác nhận / chặn xóa (fail-fast theo `ids[]`) |
| 5 | Mission tile **"Quản lý kho hàng"** → tile **"Tồn đầu kỳ"** (App Garage) | Đã đăng nhập App Garage, trên màn Home (Sảnh chính) | Màn **"Tồn đầu kỳ"** mobile (view-only + search + filter — xem §3.3) |

## 3. Layout / Wireframe

```
┌──────────────────────────┐ Import  ┌───────────────────────────────┐
│  Danh sách tồn đầu kỳ    │────────►│  Màn Import (SINGLE-PAGE)     │
│  đã import               │         │  Header: ← Huỷ bỏ / Xác nhận  │
│ (FEAT-OB-LIST)           │         │  - Tải template (.xlsx)       │
│  - search + 3 filter     │◄────────│  - Upload / kéo thả file      │
│  - checkbox chọn dòng    │ Toast   │  - 3 card: Tổng/Hợp lệ/Lỗi    │
│  - icon ✏️ / 🗑️ per row  │ SUCCESS │  - Bảng preview + tab "ĐVT"   │
│  - dòng Tổng             │         │  - Nút "Tải file lỗi"         │
└──┬────────────┬──────────┘         │  Rule: >0 lỗi ⇒ Xác nhận      │
   │            │                    │        DISABLED                │
   │ ✏️ Sửa     │ 🗑️ Xóa nhiều       │  Rule: >500 dòng ⇒ ERR-INV-048 │
   ▼            ▼                    │  (FEAT-OB-IMPORT)              │
┌──────────┐ ┌───────────────────┐   └───────────────────────────────┘
│ Form Sửa │ │ Popup xác nhận /  │
│ dòng OB  │ │ "Không thể xóa"   │
│ (FEAT-   │ │ (FEAT-OB-DELETE-  │
│ OB-EDIT) │ │  LINES)           │
└──────────┘ └───────────────────┘
```

### 3.1 Màn Import (single-page — không wizard)

| Vùng | Nội dung |
|---|---|
| **Header** | Back-arrow ← + nút **"Huỷ bỏ"** + nút **"Xác nhận"** (disabled khi errorRows > 0 HOẶC totalRows = 0). |
| **Tải Template** | Nút "Tải template" — file `.xlsx` bundled FE (BA chốt 2026-07-06 — không endpoint BE). Cột theo thứ tự: **STT · Mã nội bộ · Tên nội bộ · ĐVT · Kho · SL tồn · Giá trị tồn · Tồn đến ngày**. Nhập ĐVT + Kho theo **tên** (không mã). Có tab **"ĐVT"** reference cạnh vùng upload để user lookup nhanh danh sách ĐVT hợp lệ. |
| **Upload** | Vùng kéo thả file / chọn file. Chấp nhận `.xlsx`. |
| **3 card tổng quan** | (1) **Tổng cộng** (totalRows) · (2) **Hợp lệ** (số dòng valid) · (3) **Lỗi** (errorRows). Không còn card "Kho áp dụng" (bỏ). |
| **Bảng preview** | STT / Dòng file / Tồn đến ngày / Kho / Mã nội bộ / Tên nội bộ / ĐVT / SL tồn / Giá trị tồn / Trạng thái / Lý do lỗi. Filter theo trạng thái (Tất cả/Hợp lệ/Lỗi) + search. Dòng Tổng cuối bảng. |
| **Nút "Tải file lỗi"** | Hiển thị khi errorRows > 0 → download file `.xlsx` chỉ chứa các dòng lỗi + cột "Lý do lỗi" để user sửa nhanh → re-upload lại. |
| **Empty file** | totalRows = 0 → banner INFO "0 dòng, không thể commit" + Xác nhận DISABLED (BA chốt 2026-07-06 phương án (b), ADR-022 v3). |
| **File > 500 dòng** | Reject client-side + banner ERROR verbatim `ERR-INV-048 ROW_LIMIT_EXCEEDED` (BR-OB-004b). |
| **Commit thành công** | Toast SUCCESS "Đã import {N} dòng" + tự điều hướng về **Danh sách tồn đầu kỳ** (KHÔNG có màn "Kết quả" riêng). |
| **Commit reject** | 1 dòng lỗi phát sinh runtime → rollback toàn bộ (all-or-nothing BR-OB-004a) + banner ERROR + giữ lại preview. |

### 3.2 Form Sửa dòng OB (FEAT-OB-EDIT v4)

| Vùng | Nội dung |
|---|---|
| **Entry** | Click icon ✏️ trên dòng OB ở danh sách → mở màn **"Sửa chi tiết tồn kho vật tư hàng hoá"** (route riêng theo Figma). Header: nút **"← Quay lại"** + **"Huỷ bỏ"** + **"Lưu"** (FEAT-OB-EDIT AC-1). |
| **Section "Thông tin tồn đầu kỳ"** | 6 field đổ sẵn dữ liệu hiện tại (FEAT-OB-EDIT AC-2). |
| **Trường được sửa (5)** | **Sản phẩm nội bộ \*** (dropdown chọn lại — chỉ mã "Đang hoạt động") · **Kho \*** (dropdown chọn lại từ danh mục kho garage) · **Số lượng tồn \*** (input số, cho số lẻ) · **Tồn đến ngày \*** (date picker) · **Giá trị tồn** (input số, cho =0 hoặc trống). |
| **Trường khóa (1)** | **Đơn vị tính** — **readonly**, tự đổi theo mã sản phẩm nội bộ đã chọn (= ĐVT chính của mã). Không có dropdown chọn ĐVT — user muốn đổi ĐVT phải đổi mã sản phẩm. |
| **Lưu — guardrails** | Server enforce theo thứ tự AC-5..AC-8: (1) **`ERR-INV-024`** LOCKED_PERIOD nếu "Tồn đến ngày" (mới hoặc cũ) rơi kỳ đóng · (2) **`ERR-INV-036`** NEGATIVE_STOCK nếu tồn lũy kế < 0 tại bất kỳ thời điểm nào từ "Tồn đến ngày" trở đi cho (mã+kho+gara) · (3) **`ERR-INV-035`** OB_AFTER_TRANSACTION nếu "Tồn đến ngày" (mới) ≥ ngày phát sinh sớm nhất của phiếu đã ghi sổ của (mã+kho) mới · (4) **`ERR-INV-034`** DUPLICATE nếu (mã+kho) mới đã có OB khác. |
| **Cascade** | Thành công → cập nhật dòng OB + **cascade tồn cuối ngày (mã+kho+gara) trong sổ tồn** từ "Tồn đến ngày" trở đi (BR-STKV2-001; `origin_context = OB_EDIT` — ADR-020 v4 §C3). |
| **Huỷ bỏ / Quay lại** | Đóng form, không lưu thay đổi (AC-4). |

### 3.3 Layout mobile (App Garage — view-only)

> **Scope**: App Garage chỉ có **3 read-only op** — xem danh sách + search + filter. KHÔNG có import / edit / delete (Web GMS only). Toàn bộ mobile mapping vào 1 backend op duy nhất (`searchOpeningBalances` per Architecture/api/agg-garage-graph-graphql §3g.2).

```
┌──────────────────────────────────┐            ┌──────────────────────────────────┐
│  Màn chính "Tồn đầu kỳ"          │            │  Màn Tìm kiếm (dedicated)        │
│  (Figma node 21290:52697)        │─── 🔍 ───► │  (Figma node 21290:52992         │
│  AppBar:                         │            │   Default / Results / No Results)│
│   ← back | "Tồn đầu kỳ" | 🔍 ⚙  │◄─── back ──│  AppBar:                         │
│                                  │            │   ← back + TextField             │
│  Body: SliverList of Card        │            │   placeholder "Tìm kiếm"         │
│   ┌──────────────────────────┐   │            │                                  │
│   │ #IP-BP-0001 (blue bold)  │   │            │  Body hint (Default state):      │
│   │ Lọc dầu động cơ Toyota   │   │            │   "Tìm kiếm sản phẩm theo từ     │
│   │ ────────────────────     │   │            │    khoá"                         │
│   │ 🏢 Kho: Kho chính        │   │            │   • Mã sản phẩm                  │
│   │ 📅 Tồn đến ngày: 31/12/25│   │            │   • Tên sản phẩm                 │
│   │ 🛒 Số lượng: 10          │   │            │                                  │
│   │ 💰 Giá trị tồn: 1.760.000│   │            │  Body (Results state):           │
│   │ 📦 ĐVT: Cái              │   │            │   List Card giống canonical      │
│   └──────────────────────────┘   │            │                                  │
│   ... (infinite-scroll size=20)  │            │  Body (No Results state):        │
│                                  │            │   "Không có kết quả phù hợp"     │
│  Footer sticky: "Tổng"           │            └──────────────────────────────────┘
│  (aggregate SL + Giá trị)        │
└──────────────┬───────────────────┘
               │ ⚙ Filter
               ▼
      ┌────────────────────────────────┐
      │  Filter bottom-sheet           │
      │  (title: "Bộ lọc")             │
      │  - Ngày Import:                │
      │    [date-picker range           │
      │     dd/mm/yyyy - dd/mm/yyyy]   │
      │  - Kho: [dropdown "Chọn kho"    │
      │     paginated searchWarehouses  │
      │     size=20 + load more]       │
      │  Footer: [Thiết lập lại]        │
      │          [Áp dụng]              │
      └────────────────────────────────┘
```

**Đặc điểm mobile**:
- AppBar title: **"Tồn đầu kỳ"** (verbatim Figma node `21290:52697`).
- Card layout: 5 field per row (Kho / Tồn đến ngày / Số lượng / Giá trị tồn / ĐVT) — **KHÔNG hiển thị**: STT / Người import / Ngày import / checkbox / cột Thao tác.
- Pagination: **infinite-scroll** (không có phân trang offset như web); `size=20` default; fetch next khi scroll đạt 75% list length.
- Empty state: card `"Chưa có tồn đầu kỳ"` giữa màn (KHÔNG có CTA — view-only per §1 line 29).
- Search: dedicated screen (không phải inline search bar như web); tap 🔍 AppBar → push; keyword LIKE trên **mã / tên sản phẩm nội bộ** (server-side).
- Filter: bottom-sheet title **"Bộ lọc"** — chỉ **2 filter**: (a) **Ngày Import** (date-picker range `dd/mm/yyyy - dd/mm/yyyy`); (b) **Kho** (dropdown placeholder "Chọn kho"). **KHÔNG có "Người import"** filter (web-only, verified qua Figma canonical `21290:54167` Default + `21290:54179` Filled).
- **Kho dropdown behavior (paginated + preserve selection)**: dropdown call GraphQL `searchWarehouses(input: WarehouseSearchRequest)` với `size=20 + load more` (per agg-garage-graph-graphql op #305). User scroll dropdown đến cuối trang → fetch next page (`page++`). **Preserve selection**: nếu user đã chọn 1 kho ở lần trước và kho đó nằm ngoài trang đầu (VD page 3), khi mở dropdown lại: (i) load page 0 mặc định; (ii) hiển thị header/badge "Đang chọn: {warehouseName}" (hoặc equivalent) ở top để user biết current selection dù item chưa render trong list; (iii) khi user load more đến page chứa item đó → item render với check-mark/highlight state "selected" đúng logic. Alternative pattern (cần BA/UX chốt): prefetch page chứa selected item trước, hoặc "sticky" selected item ở top danh sách.
- Filter footer buttons (mobile): **[Thiết lập lại]** (bên trái, secondary) + **[Áp dụng]** (bên phải, primary). Apply → close sheet + reset list to page 0 + fetch với activeFilters mới. Reset → clear tất cả filter values về default (KHÔNG apply, giữ sheet mở để user tuỳ chọn lại).
- **KHÔNG có** AppBar action / row swipe / long-press action (view-only).
- Backend contract: `searchOpeningBalances(input: {keyword?, warehouseId?, importedFrom?, importedTo?, page, size})` — cùng op với web (per `Architecture/api/agg-garage-graph-graphql §3g`).

**Entry mobile**: mission tile "Quản lý kho hàng" trong grid Home (Sảnh chính) → tile "Tồn đầu kỳ" → push route mobile OB list screen. Back về Home + preserve back stack.

## 4. Trạng thái & quy tắc hiển thị

| Đối tượng | Hiển thị |
|---|---|
| Dòng preview hợp lệ | Badge **"Hợp lệ"** (xanh) |
| Dòng preview lỗi | Badge **"Lỗi"** (đỏ) + cột "Lý do lỗi" (vd "Mã sản phẩm nội bộ không tồn tại") |
| Danh sách | Cột "Tồn đến ngày", "Số lượng tồn", "Giá trị tồn" + dòng Tổng cuối bảng |

## 5. Edge Cases & Error States

| # | Tình huống | Xử lý UX |
|---|---|---|
| EC-1 | File có dòng hợp lệ + dòng lỗi (bất kỳ tỷ lệ nào) | **All-or-nothing (BR-OB-004a)** — nút "Xác nhận" DISABLED, banner inline "Vui lòng sửa {N} dòng lỗi rồi tải lại tệp"; user tải "file lỗi" → sửa → re-upload. **KHÔNG còn** semantic "ghi dòng hợp lệ, bỏ qua dòng lỗi". |
| EC-2 | Mã sản phẩm không tồn tại / ngừng hoạt động | Dòng "Lỗi" + `ERR-INV-032` PRODUCT_NOT_FOUND / INACTIVE |
| EC-3 | SL tồn ≤ 0, hoặc giá trị tồn < 0 | Dòng "Lỗi" (`ERR-INV-033`) |
| EC-4 | ĐVT file ≠ ĐVT chính của mã | Dòng "Lỗi" (`ERR-INV-019`) |
| EC-5 | Kho không tồn tại trong danh mục garage | Dòng "Lỗi" (`ERR-INV-020`) |
| EC-6 | "Tồn đến ngày" rơi vào kỳ đã đóng | Dòng "Lỗi" (`ERR-INV-024` LOCKED_PERIOD); commit path fail-CLOSED → rollback toàn bộ (all-or-nothing) |
| EC-7 | Ngày không thuộc kỳ nào / ở **tương lai** | **Cho import** (không chặn) |
| EC-8 | **Trùng (mã + kho)** — đã có OB hoặc trùng trong cùng file | Dòng "Lỗi" (`ERR-INV-034` DUPLICATE — dùng chung cho cả duplicate-in-file lẫn duplicate-existing per BR-OB-012) — OB **duy nhất** theo (mã+kho) |
| EC-9 | "Tồn đến ngày" **sau/cùng ngày** phiếu nhập/xuất **đã ghi sổ** của (mã+kho) | Dòng "Lỗi" (`ERR-INV-035`) — OB phải trước mọi phiếu |
| EC-10 | Chèn OB làm tồn (mã+kho) **âm** tại thời điểm bất kỳ từ "Tồn đến ngày" trở đi | Dòng "Lỗi" (`ERR-INV-036`) |
| EC-11 | File > 500 dòng | Reject client-side + banner ERROR `ERR-INV-048 ROW_LIMIT_EXCEEDED` (BR-OB-004b) |
| EC-12 | File 0 dòng (empty file) | Banner INFO "0 dòng, không thể commit" + Xác nhận DISABLED (BA chốt 2026-07-06 phương án (b), ADR-022 v3) |
| EC-13 | **Preview-path** (`verifyImportOpeningBalances`) — `gf-accounting` unreachable | Fail-OPEN: trả `warningLockCheckUnavailable=true` + banner WARNING "Không kiểm tra được kỳ đóng, có thể sai lệch — vui lòng thử lại" (không throw 503) |
| EC-14 | **Commit-path** (`importOpeningBalances`) — `gf-accounting` unreachable | Fail-CLOSED `ERR-CMN-007` 503 + rollback toàn bộ tx |
| EC-15 | Import OB hợp lệ (100% row valid) | Toast SUCCESS "Đã import {N} dòng" + tự về danh sách; **cascade tính lại sổ tồn** của (mã+kho) từ "Tồn đến ngày" trở đi → báo cáo tồn/NXT cập nhật; `origin_context = OB_IMPORT` |
| EC-16 | **Sửa dòng OB** (FEAT-OB-EDIT) — kỳ đóng | `ERR-INV-024` — chặn sửa; banner inline trên form |
| EC-17 | **Sửa dòng OB** thành công | Cascade tính lại sổ tồn từ "Tồn đến ngày"; `origin_context = OB_EDIT` |
| EC-18 | **Xóa nhiều dòng** — có dòng vi phạm | Popup **"Không thể xóa"** verbatim per FEAT-OB-DELETE-LINES AC-4. **Thứ tự bắn mã lỗi (BR-OB-DEL-005)**: `ERR-INV-024` (kỳ đóng) **TRƯỚC** → `ERR-INV-036` (tồn âm) **SAU**. Fail-fast theo `ids[]`: dừng ngay tại id đầu tiên vi phạm, response `{errorCode, offendingIds: [<id đầu>]}`. All-or-nothing — chặn cả lô. |
| EC-19 | **Xóa dòng** thành công | Cho phép xóa nếu **tồn ≥ 0 sau delete** (BR-OB-DEL-005). Cascade tính lại sổ tồn từ "Tồn đến ngày"; `origin_context = OB_DELETE`; báo cáo cập nhật. |

## 6. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo UX-FLOW-INVENTORY-OPENING-BALANCE (file mới) — luồng tồn đầu kỳ: danh sách + wizard import 2 bước (validate, checksum) + xóa nhiều dòng theo guardrail (kỳ đã khóa / tồn ≥ 0, chặn cả lô). |
| 2026-06-15 | 2 | Business Authority | Rà lỗ hổng (Nhóm D-1): cập nhật §5 Edge Cases theo rule mới — WAREHOUSE_NOT_FOUND, ngày tương lai cho import, **trùng → chặn (OB duy nhất)**, OB-after-transaction, tồn âm point-in-time, **cascade sổ tồn khi import/xóa OB**; §1.4 thêm ràng buộc OB ↔ phiếu nhập/xuất (BR-OB-016 / BR-IRV2-030). |
| 2026-06-16 | 3 | Business Authority | Đăng ký mã lỗi: đổi mã bare → ERR-INV-NNN (ERROR-CODE-REGISTRY §4). |
| 2026-06-16 | 4 | Business Authority | **Mở mobile (view-only)**: dòng "Nền tảng" → Web GMS (đầy đủ) + **App Garage (chỉ XEM** danh sách tồn đầu kỳ). Đảo "Web GMS only". (Bước 1 CR mobile kho V2.) |
| 2026-07-08 | 5 | Business Authority (quannn) + main agent | **F1+F2+F8 W04 audit sync — đồng bộ với FEAT-OB-IMPORT v14 + FEAT-OB-EDIT + FEAT-OB-DELETE-LINES v7**: (F1) IMPORT chuyển từ **wizard 2 bước** → **single-page** (upload + preview + xác nhận trên 1 màn, header có back + Huỷ + Xác nhận); rule commit **all-or-nothing** (BR-OB-004a) thay vì partial-success — sơ đồ §1 + wireframe §3 + §3.1 rewrite; §3.1 chốt **3 card** (Tổng/Hợp lệ/Lỗi) bỏ card "Kho áp dụng"; thêm cap **500 dòng** (`ERR-INV-048`) + empty-file semantic (banner INFO + Xác nhận disabled) + nút "Tải file lỗi"; template columns list tường minh (STT/Mã/Tên/ĐVT/Kho/SL/GT/Tồn đến ngày); toast SUCCESS + về danh sách thay vì màn "Kết quả" riêng. (F2) Thêm mục **§3.2 Form Sửa dòng OB** (FEAT-OB-EDIT); Referenced by thêm FEAT-OB-EDIT; Entry Points thêm icon ✏️. (F8) §5 EC-12 rewrite tường minh **thứ tự mã lỗi** khi xóa nhiều dòng: `ERR-INV-024` (kỳ đóng) TRƯỚC → `ERR-INV-036` (tồn âm) SAU (BR-OB-DEL-005); thêm rule "cho xóa nếu tồn ≥ 0 sau delete" (EC-19). §5 mở rộng 13 → 19 EC (thêm empty-file, 500-cap, fail-OPEN preview, fail-CLOSED commit, EDIT cascade, thứ tự mã lỗi delete). |
| 2026-07-08 | 6 | Business Authority (quannn) + main agent | **P1-1 fix §3.2 field lock INVERTED** — v5 F2 viết ngược so với FEAT-OB-EDIT AC-2 + BR-OB-EDIT-001. Rewrite §3.2 khớp FEAT verbatim: **editable (5)** = Sản phẩm nội bộ (dropdown) + Kho (dropdown) + SL tồn + Tồn đến ngày + Giá trị tồn; **readonly (1)** = Đơn vị tính (tự đổi theo mã sản phẩm — user muốn đổi ĐVT phải đổi mã). Thêm guardrails đủ 4 tầng theo AC-5..8: `ERR-INV-024` LOCKED_PERIOD → `ERR-INV-036` NEGATIVE_STOCK → `ERR-INV-035` OB_AFTER_TRANSACTION → `ERR-INV-034` DUPLICATE. Header đúng "← Quay lại + Huỷ bỏ + Lưu" (AC-1). Section header đúng "Sửa chi tiết tồn kho vật tư hàng hoá" + section "Thông tin tồn đầu kỳ". Cascade `origin_context = OB_EDIT` (ADR-020 v4 §C3). |
| 2026-07-08 | 7 | Business Authority (quannn) + main agent | **P2-a fix EC-8 mã lỗi sai** — v5 ghi `ERR-INV-017 DUP_WITHIN_FILE` nhưng `ERR-INV-017` = REQUIRED_FIELD_MISSING theo ERROR-CODE-REGISTRY line 115. Duplicate (mã+kho) — cả in-file lẫn existing — dùng **`ERR-INV-034` DUPLICATE** (BR-OB-012, registry line 132). Xóa mention 017 khỏi EC-8, giữ 034 làm mã canonical duy nhất cho duplicate. |
| 2026-07-08 | 8 | Business Authority (quannn) + main agent | **Gọn label "Danh sách tồn đầu kỳ đã import" → "Danh sách tồn đầu kỳ"** (cascade FEAT-OB-LIST v6). Cập nhật 2 chỗ: (1) sơ đồ ASCII §1 header khối danh sách; (2) §2 Entry Points row 1 Output. Lý do: BA quannn 2026-07-08 quyết định label đã hiển thị dữ liệu tồn đầu kỳ là đủ ngữ cảnh — hàm nghĩa "đã import" gây thừa. Figma designer báo sửa song song. |
| 2026-07-08 | 9 | main agent (in-session, user quannn) + **pending BA/PO acknowledge** | **W04 mobile scope clarification** (đồng bộ với `Architecture/hld/garage-mobile-HLD.md §11b.2 v10` + `Architecture/api/agg-garage-graph-graphql §3g v7.50`). 3 changes: (1) §1 dòng 29 clarify wording "chỉ XEM" — mở rộng thành "read-only ops: danh sách tồn đầu kỳ + search theo mã / tên sản phẩm + filter theo Kho / Ngày Import. KHÔNG có: import / edit / delete" để phân biệt rõ mobile CÓ search + filter (không chỉ list flat). (2) §2 Entry Points thêm entry #5 mobile: mission tile "Quản lý kho hàng" → tile "Tồn đầu kỳ" (App Garage) trên màn Home (Sảnh chính) — cite HLD §11b.1 v8 BA/PO chốt entry-point. Bổ sung "(Web GMS)" annotation cho entry #1-4 để phân biệt platform. (3) §3 thêm mới **§3.3 Layout mobile (App Garage — view-only)** với ASCII wireframe canonical screen "Tồn đầu kỳ" (`21290:52697`) + Search dedicated screen 3 state (`21290:52992` Default / Results / No Results) + Filter bottom-sheet; đặc điểm mobile enumerate 8 point (title verbatim, card 5 field, infinite-scroll, empty state "Chưa có tồn đầu kỳ", search flow LIKE mã/tên, filter 2 filter Kho + Ngày Import range, no write UI, backend contract cite `searchOpeningBalances`); entry mobile note. **Flag NEED CONFIRMATION**: filter mobile 2 hay 3 filter — cần BA/PO cross-check Figma `Bộ lọc sản phẩm - Default/Filled` (HLD hiện assume 2 filter Kho + Ngày Import, có thể còn "Người import"). **Không đụng**: §3.1/§3.2 web (Import + Sửa dòng OB); §4/§5 rules + edge cases (cross-platform); §6 Change Log entries cũ. Priority BA/PO review: MEDIUM — DEV mobile đọc §3.3 làm wireframe reference; FEAT-OB-LIST v7 spec đã có sub-AC mobile song song. v8 → v9. |
| 2026-07-08 | 10 | main agent (in-session, user quannn) + **pending BA/PO acknowledge** | **W04 mobile filter — chốt canonical + add Kho paginated behavior** (3 fixes trong §3.3). (a) **Confirmed 2 filter Figma canonical**: node `21290:54167` (Default) + `21290:54179` (Filled) — screen title verbatim "Bộ lọc" (không phải "Bộ lọc sản phẩm" — node name khác display title), 2 filter fields: `Ngày Import` (date-picker range `dd/mm/yyyy - dd/mm/yyyy`) + `Kho` (dropdown "Chọn kho"). ⚠ NEED CONFIRMATION filter count v9 ĐÓNG. Figma inconsistency Ngày import vs Ngày nhập giữa 2 state đã được designer resolve → thống nhất **"Ngày Import"** (verified 2026-07-08). (b) **Fix wording button reset**: `[Đặt lại]` → **`[Thiết lập lại]`** verbatim Figma canonical. Cascade cả ASCII wireframe + prose §3.3 (2 chỗ). (c) **Add Kho dropdown paginated behavior + preserve selection** (BA quannn chốt 2026-07-08): dropdown call GraphQL `searchWarehouses(input: WarehouseSearchRequest)` per agg-garage-graph-graphql op #305 với `size=20 + load more` — user scroll dropdown đến cuối → fetch next page. **Preserve selection logic** khi user đã chọn 1 kho ở lần trước và item đó nằm ngoài trang đầu (page N > 0): (i) load page 0 default; (ii) header/badge "Đang chọn: {warehouseName}" ở top để user biết current selection dù item chưa render trong list; (iii) khi user load more đến page chứa item đó → item render với check-mark/highlight "selected" state đúng logic. Alternative pattern flag: prefetch page chứa selected item HOẶC "sticky" selected item ở top (BA/UX chốt approach cụ thể trong CR-1 tách nếu cần). Bổ sung reset button semantic: `[Thiết lập lại]` = clear filter values về default nhưng KHÔNG apply (giữ sheet mở); `[Áp dụng]` = close sheet + reset list page 0 + fetch. **Không đụng**: web filter (AC-5 [web] giữ 3 filter); §3.1/§3.2 form web. Priority: HIGH — DEV mobile cần biết paginated + preserve selection pattern trước implement. v9 → v10. |
