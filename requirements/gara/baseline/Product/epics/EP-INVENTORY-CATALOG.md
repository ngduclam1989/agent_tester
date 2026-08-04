---
type: epic
artifact_kind: epic
status: PLANNED
version: 8
tier: T2
owner_authority: Business Authority
boundary: "gf-inventory"
last_reviewed: "2026-07-02"
supersedes: null
---

# EP-INVENTORY-CATALOG: Danh mục vật tư kho (Mã sản phẩm nội bộ & Nhóm vật tư hàng hóa)

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-INVENTORY-CATALOG` |
| Title | Danh mục vật tư kho — Mã sản phẩm nội bộ & Nhóm vật tư hàng hóa |
| Status | PLANNED |
| Priority | P1 |
| Target wave | **Wave 3** (W03) — Inventory V2 (post-baseline) |

> **Phạm vi V2 / forward design**: Epic này là **mới hoàn toàn**, không có bản V1 gốc. Nó tách riêng khỏi `EP-CATALOG` cũ (danh mục dịch vụ / nhà cung cấp / nhà xe — thuộc gf-erp-mdm, gf-purchase, gf-system). `EP-CATALOG` cũ giữ nguyên, không chỉnh sửa, không có bản V2.

## 1. Outcome / Hypothesis

Nếu garage có một danh mục **Mã sản phẩm nội bộ** chuẩn hóa (mã chuẩn dùng để tính tồn và mapping SKU) cùng hệ thống **Nhóm vật tư hàng hóa** phân cấp để phân loại sản phẩm — quản lý tập trung trên một hệ thống — thì garage sẽ có nền tảng dữ liệu vật tư thống nhất phục vụ toàn bộ nghiệp vụ kho V2 (nhập kho, xuất kho, tồn đầu kỳ, tính giá, báo cáo tồn), giảm sai sót do trùng/lệch mã giữa các nguồn, và kiểm soát được vòng đời sản phẩm (đang dùng / ngừng dùng).

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Quản lý toàn bộ danh mục: tạo/sửa/xóa mã sản phẩm nội bộ, nhóm vật tư hàng hóa, gắn SKU, khai báo ĐVT quy đổi, import/export |
| Kế toán | PRIMARY | Quyền tương đương chủ garage trên toàn bộ danh mục |

## 3. Vòng đời trạng thái

### 3.1 Nhóm vật tư hàng hóa (GRP)

```
  ┌──────────────────┐
  │    Tạo mới       │
  │  (Create)        │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐         ┌──────────────────┐
  │ Đang hoạt động   │────────▶│ Ngừng hoạt động  │
  │   (ACTIVE)       │  Ngừng  │   (INACTIVE)     │
  └──────────────────┘         └──────────────────┘
           ▲                            │
           │       Kích hoạt lại        │
           └────────────────────────────┘
```

**Ghi chú:**
- Khi tạo nhóm, trạng thái khởi tạo là **"Đang hoạt động"**.
- Nhóm có cấu trúc **phân cấp đa tầng** (cha–con qua trường "Thuộc nhóm", không giới hạn số cấp). *Lưu ý: đây là cấu trúc dữ liệu — danh sách Nhóm VTHH render dạng **trải phẳng có phân trang**, không phải tree view (xem `FEAT-CAT-GRP-LIST` AC-3).*
- Khi nhóm **cha** chuyển sang **"Ngừng hoạt động"**, hệ thống **tự động** cập nhật toàn bộ nhóm con (mọi cấp dưới) sang **"Ngừng hoạt động"**.
- Nhóm ở trạng thái **"Ngừng hoạt động"** không cho phép gắn vào mã sản phẩm nội bộ mới.

### 3.2 Mã sản phẩm nội bộ (PROD)

```
  ┌──────────────────┐
  │    Tạo mới       │
  │  (Create)        │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐         ┌──────────────────┐
  │ Đang hoạt động   │────────▶│ Ngừng hoạt động  │
  │   (ACTIVE)       │  Ngừng  │   (INACTIVE)     │
  └──────────────────┘         └──────────────────┘
           ▲                            │
           │       Kích hoạt lại        │
           └────────────────────────────┘
```

**Ghi chú:**
- Khi tạo mã sản phẩm nội bộ, trạng thái khởi tạo là **"Đang hoạt động"**.
- Mã sản phẩm ở trạng thái **"Ngừng hoạt động"** không cho phép sử dụng trong phiếu nhập kho / xuất kho mới.
- Mã sản phẩm nội bộ là **mã chuẩn** dùng để tính tồn kho và mapping với mã SKU (một mã nội bộ gắn nhiều SKU; một SKU chỉ thuộc một mã nội bộ).

## 4. Features

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-CAT-GRP-LIST` | Danh sách nhóm vật tư hàng hóa | [FEAT-CAT-GRP-LIST](../features/FEAT-CAT-GRP-LIST.md) | P1 |
| `FEAT-CAT-GRP-CREATE` | Tạo nhóm vật tư hàng hóa | [FEAT-CAT-GRP-CREATE](../features/FEAT-CAT-GRP-CREATE.md) | P1 |
| `FEAT-CAT-GRP-DETAIL` | Chi tiết nhóm vật tư hàng hóa | [FEAT-CAT-GRP-DETAIL](../features/FEAT-CAT-GRP-DETAIL.md) | P1 |
| `FEAT-CAT-GRP-EDIT` | Chỉnh sửa nhóm vật tư hàng hóa | [FEAT-CAT-GRP-EDIT](../features/FEAT-CAT-GRP-EDIT.md) | P1 |
| `FEAT-CAT-GRP-DELETE` | Xóa nhóm vật tư hàng hóa | [FEAT-CAT-GRP-DELETE](../features/FEAT-CAT-GRP-DELETE.md) | P1 |
| `FEAT-CAT-PROD-LIST` | Danh sách mã sản phẩm nội bộ | [FEAT-CAT-PROD-LIST](../features/FEAT-CAT-PROD-LIST.md) | P1 |
| `FEAT-CAT-PROD-CREATE` | Tạo mã sản phẩm nội bộ | [FEAT-CAT-PROD-CREATE](../features/FEAT-CAT-PROD-CREATE.md) | P1 |
| `FEAT-CAT-PROD-DETAIL` | Chi tiết mã sản phẩm nội bộ (gắn SKU, ĐVT quy đổi) | [FEAT-CAT-PROD-DETAIL](../features/FEAT-CAT-PROD-DETAIL.md) | P1 |
| `FEAT-CAT-PROD-EDIT` | Chỉnh sửa mã sản phẩm nội bộ | [FEAT-CAT-PROD-EDIT](../features/FEAT-CAT-PROD-EDIT.md) | P1 |
| `FEAT-CAT-PROD-DELETE` | Xóa mã sản phẩm nội bộ | [FEAT-CAT-PROD-DELETE](../features/FEAT-CAT-PROD-DELETE.md) | P1 |
| `FEAT-CAT-PROD-IMPORT` | Import danh mục mã sản phẩm nội bộ | [FEAT-CAT-PROD-IMPORT](../features/FEAT-CAT-PROD-IMPORT.md) | P1 |
| `FEAT-CAT-PROD-EXPORT` | Export danh mục mã sản phẩm nội bộ | [FEAT-CAT-PROD-EXPORT](../features/FEAT-CAT-PROD-EXPORT.md) | P2 |
| `FEAT-INV-MOBILE-MENU` | Màn quản lý kho hàng — hub điều hướng mobile (6 tile, mobile-only) | [FEAT-INV-MOBILE-MENU](../features/FEAT-INV-MOBILE-MENU.md) | P1 |

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-INVENTORY-RECEIPT-V2` | Downstream | Phiếu nhập kho V2 chọn mã sản phẩm nội bộ + ĐVT (chính/quy đổi) từ danh mục này. |
| `EP-INVENTORY-DELIVERY-V2` | Downstream | Phiếu xuất kho V2 chọn mã sản phẩm nội bộ từ danh mục này. |
| `EP-INVENTORY-STOCK-V2` | Downstream | Báo cáo tồn kho / NXT tính theo mã sản phẩm nội bộ. |
| `EP-INVENTORY-OPENING-BALANCE` | Downstream | Import tồn đầu kỳ tham chiếu mã sản phẩm nội bộ. |
| `EP-INVENTORY-ACCOUNTING-PERIOD` | Downstream | Tính giá xuất kho (BQGQ cuối kỳ) theo mã sản phẩm nội bộ + phương pháp tính giá khai báo ở từng mã. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-inventory` | Boundary chính: quản lý mã sản phẩm nội bộ, nhóm vật tư hàng hóa, mapping SKU, ĐVT quy đổi. |
| `agg-garage-graph` | BFF layer: chuyển tiếp GraphQL operations từ frontend sang gf-inventory. |
| Danh mục ĐVT (master) | Nguồn đơn vị tính dùng cho ĐVT chính + ĐVT quy đổi của mã sản phẩm. |
| Danh mục SKU (sẵn có) | Nguồn mã SKU để gắn (mapping) vào mã sản phẩm nội bộ. |
| **Feature Flag** | **`Inventory:InventoryV2`** — toàn bộ API Catalog được gate (`@FeatureOn` class-level). Tenant chưa enable → API 403; Web ẩn sidebar; Mobile ẩn tile hub. (CR-1782974034: W03 thiếu, backfill W04.) |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ mã sản phẩm nội bộ có gắn nhóm vật tư hàng hóa | >= 90% | Số mã có nhóm / tổng mã sản phẩm |
| Tỷ lệ mã sản phẩm nội bộ đang hoạt động | >= 80% | Số mã **"Đang hoạt động"** / tổng mã sản phẩm |
| Thời gian trung bình tạo mã sản phẩm nội bộ | <= 2 phút | Từ mở form đến lưu thành công |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo EP-INVENTORY-CATALOG (epic mới, no V1) — danh mục vật tư kho V2 gồm Nhóm vật tư hàng hóa (GRP, 5 feature) + Mã sản phẩm nội bộ (PROD, 7 feature). Tách riêng khỏi EP-CATALOG cũ. Vòng đời 2 trạng thái Đang/Ngừng hoạt động cho cả GRP và PROD; GRP phân cấp đa tầng + cascade ngừng hoạt động xuống nhóm con. |
| 2026-06-16 | 2 | Business Authority | Fix: sửa tham chiếu sai ID epic EP-ACCOUNTING-PERIOD → EP-INVENTORY-ACCOUNTING-PERIOD |
| 2026-06-16 | 3 | Business Authority | Gỡ con trỏ §27 "Xem `Plan/INVENTORY-V2-RULES.md`" (note file sắp xóa) — Product độc lập. |
| 2026-06-16 | 4 | Business Authority | Bỏ hẳn lịch sử: title FEAT-CAT-PROD-DETAIL bỏ "lịch sử" (gắn SKU, ĐVT quy đổi). Đồng bộ bỏ tab Lịch sử + BR-CAT-CMN-001. |
| 2026-06-24 | 5 | Business Authority | §Metadata **Target wave: TBD → Wave 3 (W03)** — epic chính thức vào dev wave 3 (rà soát wave 3). |
| 2026-06-26 | 6 | Business Authority | **Đồng bộ wording data hierarchy Nhóm VTHH** (theo Figma web mới + FEAT-CAT-GRP-LIST v6 + UX-FLOW-INVENTORY-CATALOG v8): §3.1 Ghi chú — "(cây cha–con, không giới hạn số cấp)" → **"(cha–con qua trường 'Thuộc nhóm', không giới hạn số cấp)"** + thêm note phân biệt rõ data hierarchy vs render. Render danh sách = **trải phẳng có phân trang** (KHÔNG tree view) — cấu trúc dữ liệu cha–con vẫn nguyên trạng + cascade ngừng hoạt động vẫn áp dụng. |
| 2026-07-02 | 8 | Business Authority | **Thêm Feature Flag `Inventory:InventoryV2`** vào §5.2 Architecture Dependencies — 1 flag duy nhất gate toàn bộ Inventory V2 (W03–W06). W03 Catalog thiếu flag → backfill W04 (CR-1782974034). Ref BR-GF-INVENTORY §6.6 v3. |
| 2026-06-29 | 7 | Business Authority | **Thêm FEAT-INV-MOBILE-MENU** (hub điều hướng mobile "Quản lý kho hàng", mobile-only) vào §4 Features (12→13 feature). Hub render grid 2 cột tối đa 6 tile xuyên W03–W06 (Sản phẩm + Nhóm vật tư + Phiếu nhập + Phiếu xuất + Tồn kho + Tồn đầu kỳ). BA decisions 2026-06-29: (a) tile chưa ship **ẨN HOÀN TOÀN không badge** — W03 chỉ render 2 tile, W04 thêm 1, W05 thêm 2, W06 đủ 6; (b) gom hub vào EP-INVENTORY-CATALOG (ship W03 cùng catalog); (c) cả 2 role thấy đủ tile (permission gate ở route đích, không tại hub); (d) header "Quản lý kho hàng" verbatim Figma. Web KHÔNG có FEAT tương ứng — dùng sidebar điều hướng. NEED CONFIRMATION: Figma node-id màn hub + điểm vào hub từ đâu (tile màn chính / drawer / bottom-nav). |
