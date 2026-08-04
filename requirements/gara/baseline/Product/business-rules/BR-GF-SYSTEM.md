---
type: business-rules
artifact_kind: business-rules
status: ACTIVE
version: 1
tier: T1
owner_authority: Business Authority
boundary: "gf-system"
last_reviewed: "2026-05-20"
supersedes: "none"
---

# Business Rules — gf-system

> Boundary này sở hữu domain: Tenant provisioning, branch, nhà xe liên kết (transporter registry).
> Phạm vi tài liệu: chỉ cover nghiệp vụ nhà xe liên kết thuộc EP-CATALOG (4 FEAT: LIST, CREATE, EDIT, DELETE).

---

## §1 Cross-boundary Rules

| Rule | Mô tả | Boundaries liên quan |
|---|---|---|
| CB-SYS-001 | Dữ liệu nhà xe liên kết được phạm vi theo tenant (garage). Mọi truy vấn và thao tác đều phải filter theo `tenantId` — không hiển thị hoặc cho phép thao tác dữ liệu của garage khác. | gf-system, agg-garage-graph |
| CB-SYS-002 | Nhà xe liên kết được tham chiếu bởi yêu cầu đặt hàng và đơn hàng mua trên `gf-purchase`. Xóa nhà xe liên kết bị chặn nếu có dữ liệu tham chiếu. | gf-system, gf-purchase |
| CB-SYS-003 | Mọi thao tác CRUD nhà xe liên kết đi qua BFF `agg-garage-graph` (GraphQL) rồi gọi REST API `gf-system`. Frontend không truy cập trực tiếp `gf-system`. | gf-system, agg-garage-graph |

---

## §2 Rules Registry

### 2.1 Danh sách nhà xe liên kết (BR-TRANS-LST-001..003)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-TRANS-LST-001 | Danh sách nhà xe liên kết luôn được phạm vi theo garage hiện tại — không hiển thị nhà xe liên kết của garage khác. | Tenant isolation | FEAT-CAT-TRANS-LIST |
| BR-TRANS-LST-002 | Tìm kiếm từ khóa áp dụng đồng thời cho tên nhà xe, số điện thoại và tuyến xe. | Search | FEAT-CAT-TRANS-LIST |
| BR-TRANS-LST-003 | Trạng thái nhà xe liên kết chỉ có hai giá trị: **"Đang hoạt động"** và **"Ngừng hoạt động"**. | Domain constraint | FEAT-CAT-TRANS-LIST |

### 2.2 Tạo nhà xe liên kết (BR-TRANS-CRE-001..005)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-TRANS-CRE-001 | Số điện thoại nhà xe liên kết không được trùng trong cùng một garage. Nếu trùng, hệ thống từ chối tạo và thông báo lỗi. | Uniqueness | FEAT-CAT-TRANS-CREATE |
| BR-TRANS-CRE-002 | Số điện thoại phải đúng 10 chữ số. | Validation | FEAT-CAT-TRANS-CREATE |
| BR-TRANS-CRE-003 | Thời gian xe chạy theo định dạng hh:mm, có thể nhập nhiều giá trị cách nhau bằng dấu phẩy. | Format | FEAT-CAT-TRANS-CREATE |
| BR-TRANS-CRE-004 | Trạng thái nhà xe liên kết mặc định khi tạo là **"Đang hoạt động"**. | Default value | FEAT-CAT-TRANS-CREATE |
| BR-TRANS-CRE-005 | Các trường bắt buộc khi tạo: Tên nhà xe, Số điện thoại, Địa chỉ nhà xe nhận hàng, Thông tin tuyến xe, Thời gian xe chạy. | Required fields | FEAT-CAT-TRANS-CREATE |

### 2.3 Chỉnh sửa nhà xe liên kết (BR-TRANS-EDT-001..005)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-TRANS-EDT-001 | Số điện thoại nhà xe liên kết không được trùng với nhà xe liên kết khác trong cùng một garage. Nếu trùng, hệ thống từ chối cập nhật. | Uniqueness | FEAT-CAT-TRANS-EDIT |
| BR-TRANS-EDT-002 | Số điện thoại phải đúng 10 chữ số. | Validation | FEAT-CAT-TRANS-EDIT |
| BR-TRANS-EDT-003 | Thời gian xe chạy theo định dạng hh:mm, có thể nhập nhiều giá trị cách nhau bằng dấu phẩy. | Format | FEAT-CAT-TRANS-EDIT |
| BR-TRANS-EDT-004 | Các trường bắt buộc khi cập nhật: Tên nhà xe, Số điện thoại, Địa chỉ nhà xe nhận hàng, Thông tin tuyến xe, Thời gian xe chạy. | Required fields | FEAT-CAT-TRANS-EDIT |
| BR-TRANS-EDT-005 | Trạng thái nhà xe liên kết có thể thay đổi giữa **"Đang hoạt động"** và **"Ngừng hoạt động"** khi chỉnh sửa. | Status toggle | FEAT-CAT-TRANS-EDIT |

### 2.4 Xóa nhà xe liên kết (BR-TRANS-DEL-001..003)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-TRANS-DEL-001 | Xóa nhà xe liên kết là xóa hoàn toàn bản ghi khỏi hệ thống (hard delete) — không phải soft delete. | Delete policy | FEAT-CAT-TRANS-DELETE |
| BR-TRANS-DEL-002 | Hệ thống không cho phép xóa nhà xe liên kết khi có dữ liệu liên quan đang sử dụng (Yêu cầu đặt hàng hoặc Đơn hàng mua đang tham chiếu). | Referential integrity | FEAT-CAT-TRANS-DELETE |
| BR-TRANS-DEL-003 | Trước khi xóa, hệ thống bắt buộc hiển thị dialog xác nhận để tránh xóa nhầm. | Safety guard | FEAT-CAT-TRANS-DELETE |

---

## §3 Status Transition Rules

### 3.1 Trạng thái nhà xe liên kết

```
  ┌──────────────────┐
  │    Tạo mới       │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐         ┌──────────────────┐
  │ Đang hoạt động   │────────▶│ Ngừng hoạt động  │
  └──────────────────┘  Ngừng  └──────────────────┘
           ▲                            │
           │       Kích hoạt lại        │
           └────────────────────────────┘
```

| Trạng thái hiện tại | Hành động | Trạng thái đích | Điều kiện |
|---|---|---|---|
| *(Tạo mới)* | Tạo nhà xe liên kết | Đang hoạt động | Mặc định khi tạo |
| Đang hoạt động | Chuyển ngừng hoạt động | Ngừng hoạt động | Qua FEAT-CAT-TRANS-EDIT |
| Ngừng hoạt động | Kích hoạt lại | Đang hoạt động | Qua FEAT-CAT-TRANS-EDIT |
| Đang hoạt động / Ngừng hoạt động | Xóa | *(Xóa vật lý)* | Không có dữ liệu tham chiếu (BR-TRANS-DEL-002) |

---

## §4 Permission Rules

| Action | garage-owner | accountant | Condition |
|---|---|---|---|
| Xem danh sách nhà xe liên kết | Cho phep | Cho phep | Không có ngoại lệ |
| Tạo nhà xe liên kết | Cho phep | Cho phep | Không có ngoại lệ |
| Chỉnh sửa nhà xe liên kết | Cho phep | Cho phep | Không có ngoại lệ |
| Xóa nhà xe liên kết | Cho phep | Cho phep | Không có ngoại lệ |

> Không có ngoại lệ phân quyền trong toàn bộ domain nhà xe liên kết.

---

## §5 Validation Rules

### 5.1 Số điện thoại

| Rule | Validation | Error message | Features |
|---|---|---|---|
| VLD-TRANS-001 | Đúng 10 chữ số | **"Số điện thoại phải gồm 10 số."** | CREATE, EDIT |
| VLD-TRANS-002 | Unique trong cùng garage | **"Số điện thoại đã tồn tại."** | CREATE, EDIT |

### 5.2 Trường bắt buộc

| Trường | Error message khi trống | Features |
|---|---|---|
| Tên nhà xe | **"Tên nhà xe là bắt buộc."** | CREATE, EDIT |
| Số điện thoại | (xem VLD-TRANS-001, VLD-TRANS-002) | CREATE, EDIT |
| Địa chỉ nhà xe nhận hàng | **"Địa chỉ nhà xe nhận hàng là bắt buộc."** | CREATE, EDIT |
| Thông tin tuyến xe | **"Thông tin tuyến xe là bắt buộc."** | CREATE, EDIT |
| Thời gian xe chạy | **"Thời gian xe chạy là bắt buộc."** | CREATE, EDIT |

### 5.3 Định dạng

| Trường | Định dạng | Features |
|---|---|---|
| Thời gian xe chạy | hh:mm, nhiều giá trị cách nhau bằng dấu phẩy | CREATE, EDIT |

### 5.4 Xóa

| Rule | Validation | Error message | Features |
|---|---|---|---|
| VLD-TRANS-DEL-001 | Không có dữ liệu tham chiếu (Yêu cầu đặt hàng / Đơn hàng mua) | **"Không thể xóa thông tin liên kết nhà xe vì đang có dữ liệu liên quan sử dụng thông tin này."** | DELETE |

---

## §6 Dependency Rules

| Dependency | Loại | Mô tả |
|---|---|---|
| gf-purchase | Downstream | Yêu cầu đặt hàng và đơn hàng mua tham chiếu nhà xe liên kết. Xóa bị chặn khi có tham chiếu. |
| agg-garage-graph | Gateway | BFF chuyển tiếp GraphQL → REST. Frontend không gọi trực tiếp gf-system. |
| EP-CATALOG | Epic | Nhà xe liên kết là 1 trong 3 nhóm danh mục trong EP-CATALOG (cùng dịch vụ và nhà cung cấp). |

---

## §7 Phan tich & De xuat

### 7.1 Conflict / Overlap detected

- **Không phát hiện conflict**: Các BR giữa CREATE và EDIT nhất quán — cùng validation rules (số điện thoại 10 số, unique, 5 trường bắt buộc, format hh:mm).

### 7.2 Missing rules

| ID | Mô tả | Mức độ |
|---|---|---|
| MISS-SYS-001 | **Giới hạn độ dài** tên nhà xe, địa chỉ, tuyến xe, ghi chú chưa được quy định (FEAT chỉ quy định placeholder, không có maxLength). | ⚠ NEED CLARIFICATION |
| MISS-SYS-002 | **Validation format hh:mm** chưa rõ: hệ thống có reject giá trị không đúng format (ví dụ "25:70") không? FEAT chỉ mô tả format mong đợi, không mô tả error message cho format sai. | ⚠ NEED CLARIFICATION |
| MISS-SYS-003 | **Concurrent edit**: FEAT-CAT-TRANS-EDIT EC-3 mô tả "nhà xe đã bị xóa bởi người dùng khác" nhưng không quy định cơ chế optimistic locking (version check). | ⚠ NEED CLARIFICATION |
| MISS-SYS-004 | **Số điện thoại format**: chỉ yêu cầu "đúng 10 chữ số" — chưa rõ có bắt buộc bắt đầu bằng "0" hoặc prefix cụ thể không. | ⚠ NEED CLARIFICATION |

### 7.3 De xuat cai tien

1. **Bổ sung maxLength cho các trường text** (tên nhà xe, địa chỉ, tuyến xe, ghi chú) — thống nhất giới hạn tránh lỗi server-side.
2. **Bổ sung validation error message cho format thời gian sai** (ví dụ: **"Thời gian xe chạy phải theo định dạng hh:mm."**).
3. **Cân nhắc soft delete thay vì hard delete** — để giữ lịch sử tham chiếu cho báo cáo. Hiện tại hard delete có thể gây mất trace khi cần audit.
4. **Bổ sung optimistic locking** cho concurrent edit/delete — gf-system nên trả lỗi conflict khi version mismatch.

---

## Change Log

| Date | Summary | Author |
|---|---|---|
| 2026-05-20 | Khởi tạo business rules cho gf-system — nhà xe liên kết (4 FEAT: LIST, CREATE, EDIT, DELETE). Tổng hợp 16 BR, 5 validation rules, 4 missing rules cần clarify. | Business Authority |
