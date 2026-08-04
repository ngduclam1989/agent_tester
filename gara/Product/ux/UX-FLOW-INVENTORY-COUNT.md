---
type: ux
artifact_kind: ux-spec
status: PLANNED
version: 4
tier: T2
owner_authority: Business Authority
last_reviewed: "2026-05-21"
---

# UX-FLOW-INVENTORY-COUNT: Tồn kho theo kỳ

---

## Metadata

| Field | Value |
|---|---|
| Screen / Flow | `UX-FLOW-INVENTORY-COUNT` |
| Kind | FLOW |
| Referenced by | `FEAT-IP-VIEW` |

## 1. Purpose

Luồng tồn kho theo kỳ mô tả cách chủ garage và kế toán xem dữ liệu tồn kho theo kỳ — bao gồm tồn đầu kỳ, nhập trong kỳ, xuất trong kỳ, tồn cuối kỳ, giá vốn đầu kỳ và giá vốn cuối kỳ. Đây là luồng **chỉ xem** (view-only), không có hành động tạo mới, chỉnh sửa hay chuyển trạng thái.

**Người thực hiện:** Chủ garage và Kế toán — quyền ngang nhau trên toàn bộ chức năng xem tồn kho theo kỳ.

**Nền tảng:** Garage Care (bao gồm Web GMS và App Garage) — giao diện vận hành cho garage.

### Sơ đồ luồng vận hành tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│              LUỒNG XEM TỒN KHO THEO KỲ (VIEW-ONLY)             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ① TRUY CẬP                                                    │
│     Menu Kho ── Tồn kho theo kỳ ──────► Bảng danh sách         │
│                                                                 │
│  ② TÌM KIẾM & LỌC                                              │
│     Ô tìm kiếm ── Mã SKU / Tên SP ───► Danh sách cập nhật     │
│     Bộ lọc Kỳ ────────────────────────► Danh sách cập nhật     │
│                                                                 │
│  ③ XEM CHI TIẾT                                                 │
│     Nhấn dòng trong bảng ─────────────► Thông tin chi tiết SP   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency liên module

| Hướng | Module | Quan hệ |
|---|---|---|
| Upstream | `EP-INVENTORY-RECEIPT` | Phiếu nhập kho đã duyệt cung cấp dữ liệu nhập trong kỳ và ảnh hưởng giá vốn |
| Upstream | `EP-INVENTORY-DELIVERY` | Phiếu xuất kho đã duyệt cung cấp dữ liệu xuất trong kỳ |

## 2. Entry Points

| # | Điểm vào | Điều kiện | Đầu ra |
|---|---|---|---|
| 1 | Menu Kho trên Web GMS, mục **"Tồn kho theo kỳ"** | Đã đăng nhập, thuộc garage hiện tại | Màn hình Tồn kho theo kỳ |

## 3. Layout / Wireframe

> Luồng tồn kho theo kỳ gồm 1 màn hình chính duy nhất — bảng danh sách với bộ lọc, ô tìm kiếm và khả năng xem chi tiết từng dòng.

```
┌─────────────────────────────────────────────────────────────────┐
│  Tồn kho theo kỳ                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Bộ lọc:  [ Kỳ ▾ ]                                      │   │
│  │                                                          │   │
│  │ [ 🔍 Tìm kiếm theo mã SKU, tên sản phẩm              ] │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ Thời gian │ Tên       │ Mã  │ Phân  │ Tồn đầu│ Nhập  │ Xuất  │ Tồn  │ Giá vốn │   │
│  │ chốt kỳ   │ phụ tùng  │ SKU │ khúc  │ kỳ     │ trong │ trong │ cuối │ đầu kỳ  │   │
│  │           │           │     │       │        │ kỳ    │ kỳ    │ kỳ   │ cuối kỳ │   │
│  ├───────────┼───────────┼─────┼───────┼────────┼───────┼───────┼──────┼─────────┤   │
│  │ Dòng 1    │    ...    │ ... │  ...  │  ...   │  ...  │  ...  │ ...  │   ...   │   │
│  │ Dòng 2    │    ...    │ ... │  ...  │  ...   │  ...  │  ...  │ ...  │   ...   │   │
│  │ ...       │    ...    │ ... │  ...  │  ...   │  ...  │  ...  │ ...  │   ...   │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ◄  1  2  3  ...  ►   (Phân trang)                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Chi tiết tồn kho (hiển thị khi nhấn vào dòng)           │   │
│  │                                                          │   │
│  │ Tên phụ tùng: ___   Mã SKU: ___   Phân khúc: ___         │   │
│  │ Tồn đầu kỳ: ___    Nhập trong kỳ: ___                   │   │
│  │ Xuất trong kỳ: ___  Tồn cuối kỳ: ___                    │   │
│  │ Giá vốn đầu kỳ: ___ Giá vốn cuối kỳ: ___               │   │
│  │ Thời gian chốt kỳ: ___                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 4. Behavior

### 4.1 Xem danh sách tồn kho theo kỳ

> FEAT tham chiếu: `FEAT-IP-VIEW`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Chủ garage / Kế toán truy cập menu Kho, chọn **"Tồn kho theo kỳ"** | Hiển thị bảng danh sách với các cột: **"Tên phụ tùng"**, **"Mã SKU"**, **"Phân khúc"**, **"Thời gian chốt kỳ"**, **"Tồn đầu kỳ"**, **"Nhập trong kỳ"**, **"Xuất trong kỳ"**, **"Tồn cuối kỳ"**, **"Giá vốn đầu kỳ"**, **"Giá vốn cuối kỳ"**. Dữ liệu được phân trang |
| 2 | Danh sách vượt quá số lượng hiển thị trên một trang | Hệ thống hiển thị phân trang cho phép chuyển giữa các trang |

**Trường hợp ngoại lệ:**
- Không có dữ liệu tồn kho nào → bảng trống, không có dòng dữ liệu.
- Garage chưa chốt kỳ lần nào → hiển thị dữ liệu kỳ đang mở hiện tại (nếu có). Bộ lọc kỳ chỉ chứa kỳ đang mở.
- Garage mới chưa có giao dịch nhập/xuất kho → tất cả các cột số lượng và giá vốn hiển thị giá trị 0.

### 4.2 Tìm kiếm theo mã SKU hoặc tên sản phẩm

> FEAT tham chiếu: `FEAT-IP-VIEW`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhập từ khóa vào ô tìm kiếm (placeholder: **"Tìm kiếm theo mã SKU, tên sản phẩm"**) | Hệ thống lọc danh sách theo từ khóa khớp với mã SKU hoặc tên sản phẩm. Kết quả được cập nhật tự động |

**Trường hợp ngoại lệ:**
- Tìm kiếm không có kết quả → bảng trống, không có dòng dữ liệu.

### 4.3 Lọc theo kỳ

> FEAT tham chiếu: `FEAT-IP-VIEW`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Chọn giá trị từ bộ lọc **"Kỳ"** | Hệ thống hiển thị dữ liệu tồn kho tương ứng với kỳ đã chọn. Danh sách kỳ bao gồm các kỳ đã chốt và kỳ đang mở |

### 4.4 Kết hợp nhiều bộ lọc và tìm kiếm

> FEAT tham chiếu: `FEAT-IP-VIEW`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Kết hợp bộ lọc Kỳ + từ khóa tìm kiếm cùng lúc | Hệ thống áp dụng tất cả điều kiện đồng thời và hiển thị kết quả khớp |

**Trường hợp ngoại lệ:**
- Kết hợp nhiều điều kiện mà không có kết quả khớp → bảng trống, không có dòng dữ liệu.

### 4.5 Xem chi tiết tồn kho sản phẩm

> FEAT tham chiếu: `FEAT-IP-VIEW`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn vào một dòng trong bảng danh sách | Hệ thống hiển thị chi tiết tồn kho theo kỳ của sản phẩm đó, bao gồm: tên phụ tùng, mã SKU, phân khúc, tồn đầu kỳ, nhập trong kỳ, xuất trong kỳ, tồn cuối kỳ, giá vốn đầu kỳ, giá vốn cuối kỳ và thời gian chốt kỳ |

## 5. States

### 5.1 Trạng thái hiển thị dữ liệu

Luồng tồn kho theo kỳ là **view-only** — không có vòng đời trạng thái hay chuyển đổi trạng thái. Dưới đây là các trạng thái hiển thị của màn hình:

| Trạng thái hiển thị | Mô tả | Điều kiện |
|---|---|---|
| Đang tải | Hệ thống đang truy vấn dữ liệu tồn kho | Khi mở màn hình, thay đổi bộ lọc hoặc chuyển trang |
| Có dữ liệu | Bảng hiển thị danh sách dòng tồn kho theo kỳ | Có ít nhất 1 dòng dữ liệu khớp điều kiện |
| Trống | Bảng không có dòng dữ liệu | Không có dữ liệu trong hệ thống hoặc không có kết quả khớp với tìm kiếm/lọc |

### 5.2 Ma trận hành động

Luồng này **không có nút hành động chuyển trạng thái**. Toàn bộ tương tác giới hạn ở:

| Hành động | Mô tả |
|---|---|
| Tìm kiếm | Nhập từ khóa theo mã SKU hoặc tên sản phẩm |
| Lọc theo Kỳ | Chọn kỳ từ danh sách bộ lọc |
| Phân trang | Chuyển giữa các trang khi danh sách vượt quá số lượng hiển thị |
| Xem chi tiết | Nhấn vào dòng trong bảng để xem thông tin chi tiết sản phẩm |

## 6. Validation Rules

Không áp dụng — luồng tồn kho theo kỳ là view-only, không có form nhập liệu.

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo UX-FLOW-INVENTORY-COUNT từ EP-INVENTORY-PERIOD v1 và FEAT-IP-VIEW v1. Luồng view-only: 1 màn hình, bộ lọc Kỳ/Phân khúc, tìm kiếm, xem chi tiết. |
| 2026-05-21 | 2 | Business Authority | Đổi tên "Kiểm kê kho" → "Tồn kho theo kỳ" cho đúng nghiệp vụ. |
| 2026-05-21 | 3 | Business Authority | Xóa bộ lọc "Phân khúc" — KG không có filter param segment trong SearchPeriodStocksInput, "Phân khúc" chỉ là cột hiển thị (field `tier` trong response), không phải bộ lọc. Đánh lại số §4.4–4.5. |
| 2026-05-21 | 4 | Business Authority | Bổ sung 3 cột định danh sản phẩm (Tên phụ tùng, Mã SKU, Phân khúc) vào wireframe §3, behavior §4.1 và chi tiết §4.5 — theo KG garage-web IInventoryPeriod response fields (sparePartName, sku, tier). |
