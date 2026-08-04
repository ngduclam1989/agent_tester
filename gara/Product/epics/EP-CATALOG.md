---
type: epic
artifact_kind: epic
status: DONE
version: 3
tier: T2
owner_authority: Business Authority
boundary: "gf-erp-mdm"
last_reviewed: "2026-05-27"
supersedes: null
---

# EP-CATALOG: Danh mục dịch vụ, nhà cung cấp & nhà xe

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-CATALOG` |
| Title | Danh mục dịch vụ, nhà cung cấp & nhà xe |
| Status | PLANNED |
| Priority | P1 |
| Target wave | Wave 1 |

## 1. Outcome / Hypothesis

Nếu garage có thể quản lý danh mục dịch vụ (tạo, chỉnh sửa, tra cứu), danh mục nhà cung cấp (tạo, chỉnh sửa, quản lý trạng thái) và danh mục nhà xe liên kết (tạo, chỉnh sửa, xóa) — trên một hệ thống duy nhất — thì garage sẽ chuẩn hóa được dữ liệu nền tảng, giảm sai sót khi tạo phiếu dịch vụ và đơn hàng mua, đồng thời quản lý nhà xe liên kết hiệu quả.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Quản lý toàn bộ danh mục: tạo/sửa dịch vụ, nhà cung cấp, nhà xe |
| Kế toán | PRIMARY | Quyền tương đương chủ garage trong quản lý danh mục |

## 3. Vòng đời trạng thái

### 3.1 Dịch vụ

Dịch vụ không có vòng đời trạng thái — dịch vụ được tạo và chỉnh sửa, không có trạng thái hoạt động/ngừng hoạt động.

### 3.2 Nhà cung cấp

```
  ┌──────────────────┐
  │    Tạo mới       │
  │  (Create)        │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐         ┌──────────────────┐
  │ Đang hoạt động   │────────▶│ Ngừng hoạt động  │
  │   (is_active     │  Ngừng  │   (is_active     │
  │    = true)       │         │    = false)       │
  └──────────────────┘         └──────────────────┘
           ▲                            │
           │       Kích hoạt lại        │
           └────────────────────────────┘
```

**Ghi chú:**
- Khi tạo nhà cung cấp, trạng thái khởi tạo là **"Đang hoạt động"**.
- Mã nhà cung cấp sinh tự động, unique theo tenant.
- Nhà cung cấp từ nguồn **CarDoctor** chỉ cho phép chỉnh sửa một tập trường hạn chế.

### 3.3 Nhà xe liên kết

```
  ┌──────────────────┐
  │    Tạo mới       │
  │  (Create)        │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐         ┌──────────────────┐
  │ Đang hoạt động   │────────▶│ Ngừng hoạt động  │
  │   (is_active     │  Ngừng  │   (is_active     │
  │    = true)       │         │    = false)       │
  └──────────────────┘         └──────────────────┘
           ▲                            │
           │       Kích hoạt lại        │
           └────────────────────────────┘
```

**Ghi chú:**
- Khi tạo nhà xe liên kết, trạng thái khởi tạo là **"Đang hoạt động"**.
- Nhà xe liên kết có thể xóa vật lý (hard delete). Xóa bị chặn nếu nhà xe đang được tham chiếu bởi yêu cầu đặt hàng hoặc đơn hàng mua.

## 4. Features

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-CAT-SVC-LIST` | Danh sách dịch vụ | [FEAT-CAT-SVC-LIST](../features/FEAT-CAT-SVC-LIST.md) | P1 |
| `FEAT-CAT-SVC-CREATE` | Tạo dịch vụ | [FEAT-CAT-SVC-CREATE](../features/FEAT-CAT-SVC-CREATE.md) | P1 |
| `FEAT-CAT-SVC-EDIT` | Chỉnh sửa dịch vụ | [FEAT-CAT-SVC-EDIT](../features/FEAT-CAT-SVC-EDIT.md) | P1 |
| `FEAT-CAT-SUP-LIST` | Danh sách nhà cung cấp | [FEAT-CAT-SUP-LIST](../features/FEAT-CAT-SUP-LIST.md) | P1 |
| `FEAT-CAT-SUP-CREATE` | Tạo nhà cung cấp | [FEAT-CAT-SUP-CREATE](../features/FEAT-CAT-SUP-CREATE.md) | P1 |
| `FEAT-CAT-SUP-EDIT` | Chỉnh sửa nhà cung cấp | [FEAT-CAT-SUP-EDIT](../features/FEAT-CAT-SUP-EDIT.md) | P1 |
| `FEAT-CAT-TRANS-LIST` | Danh sách nhà xe liên kết | [FEAT-CAT-TRANS-LIST](../features/FEAT-CAT-TRANS-LIST.md) | P1 |
| `FEAT-CAT-TRANS-CREATE` | Tạo nhà xe liên kết | [FEAT-CAT-TRANS-CREATE](../features/FEAT-CAT-TRANS-CREATE.md) | P1 |
| `FEAT-CAT-TRANS-EDIT` | Chỉnh sửa nhà xe liên kết | [FEAT-CAT-TRANS-EDIT](../features/FEAT-CAT-TRANS-EDIT.md) | P1 |
| `FEAT-CAT-TRANS-DELETE` | Xóa nhà xe liên kết | [FEAT-CAT-TRANS-DELETE](../features/FEAT-CAT-TRANS-DELETE.md) | P1 |

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-SERVICE-ORDER` | Downstream | Phiếu dịch vụ sử dụng danh mục dịch vụ khi thêm công/dịch vụ vào phiếu. |
| `EP-PROCUREMENT` | Downstream | Yêu cầu đặt hàng và đơn hàng mua tham chiếu nhà cung cấp và nhà xe. |
| `EP-CUSTOMER` | Downstream | Thông tin hãng xe, dòng xe, phiên bản từ danh mục MDM dùng khi tạo/sửa xe. |
| `EP-FOUND` | Downstream | Danh mục tỉnh/thành phố, phường/xã dùng khi tạo/sửa nhà cung cấp và nhân viên. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-erp-mdm` | Quản lý danh mục dịch vụ (Service CRUD), danh mục hãng xe/dòng xe/phiên bản, tỉnh/thành phố qua Redis-cached MDM. |
| `gf-purchase` | Quản lý danh mục nhà cung cấp (Supplier CRUD, toggle status). |
| `gf-system` | Quản lý nhà xe liên kết (Transporter CRUD, hard delete). |
| `agg-garage-graph` | BFF layer: chuyển tiếp GraphQL operations từ frontend sang gf-erp-mdm, gf-purchase và gf-system. |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ dịch vụ có đầy đủ thông tin | >= 90% | Số dịch vụ có tên + đơn vị + giá bán / tổng dịch vụ |
| Tỷ lệ nhà cung cấp đang hoạt động | >= 70% | Số nhà cung cấp **"Đang hoạt động"** / tổng nhà cung cấp |
| Thời gian trung bình tạo nhà cung cấp | <= 2 phút | Từ mở form đến lưu thành công |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo EP-CATALOG từ 10 FEAT đã gen: dịch vụ (LIST/CREATE/EDIT v1), nhà cung cấp (LIST/CREATE/EDIT v1), nhà xe (LIST/CREATE/EDIT/DELETE v1). Epic này span 3 boundaries: gf-erp-mdm (dịch vụ), gf-purchase (nhà cung cấp), gf-system (nhà xe). |
| 2026-05-20 | 2 | Business Authority | Đổi tên "nhà vận chuyển liên kết" → "nhà xe liên kết" toàn bộ file (tiêu đề, §1, §3.3, §4, §5, §7). |
| 2026-05-20 | 3 | Business Authority | Bổ sung sơ đồ ASCII vòng đời trạng thái §3.3 Nhà xe liên kết (Đang hoạt động ↔ Ngừng hoạt động + ghi chú hard delete). |
