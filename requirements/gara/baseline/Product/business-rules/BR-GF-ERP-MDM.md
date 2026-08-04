---
type: business-rules
artifact_kind: business-rules
status: ACTIVE
version: 1
tier: T1
owner_authority: Business Authority
boundary: "gf-erp-mdm"
last_reviewed: "2026-05-20"
supersedes: "none"
---

# Business Rules — gf-erp-mdm

> Boundary này sở hữu domain: Catalog MDM (danh mục dịch vụ, hãng xe/dòng xe/phiên bản, tỉnh/thành phố, dynamic-data, PIM ingest).
> Phạm vi tài liệu: chỉ cover nghiệp vụ danh mục dịch vụ thuộc EP-CATALOG (3 FEAT: SVC-LIST, SVC-CREATE, SVC-EDIT).

---

## §1 Cross-boundary Rules

| Rule | Mô tả | Boundaries liên quan |
|---|---|---|
| CB-MDM-001 | Dữ liệu dịch vụ được phạm vi theo tenant (garage). Mọi truy vấn và thao tác đều phải filter theo `tenantId` — không hiển thị hoặc cho phép thao tác dữ liệu của garage khác. | gf-erp-mdm, agg-garage-graph |
| CB-MDM-002 | Danh mục dịch vụ được phiếu dịch vụ (gf-sales) tham chiếu khi thêm công/dịch vụ vào phiếu. Chỉnh sửa dịch vụ không ảnh hưởng đến các phiếu dịch vụ đã tạo trước đó. | gf-erp-mdm, gf-sales |
| CB-MDM-003 | Danh mục đơn vị dịch vụ được quản lý bởi chính gf-erp-mdm — danh sách đơn vị lấy từ danh mục hệ thống nội bộ. | gf-erp-mdm |
| CB-MDM-004 | Mọi thao tác CRUD dịch vụ đi qua BFF `agg-garage-graph` (GraphQL) rồi gọi REST API `gf-erp-mdm`. Frontend không truy cập trực tiếp. | gf-erp-mdm, agg-garage-graph |
| CB-MDM-005 | gf-erp-mdm cung cấp danh mục tỉnh/thành phố, phường/xã cho EP-FOUND (gf-hrms) và danh mục hãng xe/dòng xe cho EP-CUSTOMER (gf-customer). Phạm vi BR này không cover các danh mục đó. | gf-erp-mdm, gf-hrms, gf-customer |

---

## §2 Rules Registry

### 2.1 Danh sách dịch vụ (BR-SVC-LST-001..003)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-SVC-LST-001 | Danh sách dịch vụ luôn được phạm vi theo garage hiện tại — không hiển thị dịch vụ của garage khác. | Tenant isolation | FEAT-CAT-SVC-LIST |
| BR-SVC-LST-002 | Tìm kiếm từ khóa áp dụng đồng thời cho tên dịch vụ và mã dịch vụ. | Search | FEAT-CAT-SVC-LIST |
| BR-SVC-LST-003 | Cột **"Thao tác"** luôn hiển thị biểu tượng chỉnh sửa cho mỗi dòng dịch vụ — không có điều kiện ẩn/hiện. | Unconditional action | FEAT-CAT-SVC-LIST |

### 2.2 Tạo dịch vụ (BR-SVC-CRE-001..005)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-SVC-CRE-001 | Tên dịch vụ là trường bắt buộc, không được để trống, giới hạn tối đa 200 ký tự. | Required field | FEAT-CAT-SVC-CREATE |
| BR-SVC-CRE-002 | Đơn vị là trường bắt buộc, không được để trống. Danh sách đơn vị được lấy từ danh mục hệ thống (gf-erp-mdm). | Required field | FEAT-CAT-SVC-CREATE |
| BR-SVC-CRE-003 | Giá bán là trường bắt buộc, phải là số và phải lớn hơn hoặc bằng 0. | Required field + validation | FEAT-CAT-SVC-CREATE |
| BR-SVC-CRE-004 | Mã dịch vụ là trường không bắt buộc — người dùng có thể nhập hoặc để trống. | Optional field | FEAT-CAT-SVC-CREATE |
| BR-SVC-CRE-005 | Dịch vụ được tạo thuộc phạm vi garage hiện tại — không ảnh hưởng đến danh mục dịch vụ của garage khác. | Tenant isolation | FEAT-CAT-SVC-CREATE |

### 2.3 Chỉnh sửa dịch vụ (BR-SVC-EDT-001..005)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-SVC-EDT-001 | Tên dịch vụ là trường bắt buộc, không được để trống, giới hạn tối đa 200 ký tự. | Required field | FEAT-CAT-SVC-EDIT |
| BR-SVC-EDT-002 | Đơn vị là trường bắt buộc, không được để trống. Danh sách đơn vị được lấy từ danh mục hệ thống. | Required field | FEAT-CAT-SVC-EDIT |
| BR-SVC-EDT-003 | Giá bán là trường bắt buộc, phải là số và phải lớn hơn hoặc bằng 0. | Required field + validation | FEAT-CAT-SVC-EDIT |
| BR-SVC-EDT-004 | Mã dịch vụ là trường không bắt buộc. | Optional field | FEAT-CAT-SVC-EDIT |
| BR-SVC-EDT-005 | Chỉ chỉnh sửa được dịch vụ thuộc phạm vi garage hiện tại — không ảnh hưởng đến danh mục dịch vụ của garage khác. | Tenant isolation | FEAT-CAT-SVC-EDIT |

---

## §3 Status Transition Rules

Dịch vụ **không có vòng đời trạng thái** — dịch vụ được tạo và chỉnh sửa, không có trạng thái hoạt động/ngừng hoạt động. (Xác nhận trong EP-CATALOG §3.1.)

> Không có chức năng xóa dịch vụ hay vô hiệu hóa dịch vụ trong phạm vi hiện tại.

---

## §4 Permission Rules

| Action | garage-owner | accountant | Condition |
|---|---|---|---|
| Xem danh sách dịch vụ | Cho phep | Cho phep | Không có ngoại lệ |
| Tạo dịch vụ | Cho phep | Cho phep | Không có ngoại lệ |
| Chỉnh sửa dịch vụ | Cho phep | Cho phep | Không có ngoại lệ |

> Không có ngoại lệ phân quyền trong toàn bộ domain dịch vụ.

---

## §5 Validation Rules

### 5.1 Thông tin cơ bản — Tạo và Chỉnh sửa

| Trường | Bắt buộc | Max length | Validation | Error message |
|---|---|---|---|---|
| Tên dịch vụ | Co | 200 | Không trống, <= 200 ký tự | **"Tên dịch vụ không được để trống"** / **"Tên dịch vụ không được vượt quá 200 ký tự"** |
| Mã dịch vụ | Không | — | — | — |
| Đơn vị | Co | — | Phải chọn từ danh mục hệ thống | **"Đơn vị không được để trống"** |
| Giá bán | Co | — | Phải là số, >= 0 | **"Giá bán không được để trống"** / **"Giá bán phải là số"** / **"Giá bán phải lớn hơn hoặc bằng 0"** |

### 5.2 Hình ảnh & mô tả

| Trường | Bắt buộc | Validation | Error message |
|---|---|---|---|
| Mô tả | Không | — | — |
| Hình ảnh | Không | — | — |

---

## §6 Dependency Rules

| Dependency | Loại | Mô tả |
|---|---|---|
| gf-sales (EP-SERVICE-ORDER) | Downstream | Phiếu dịch vụ tham chiếu dịch vụ khi thêm công/dịch vụ vào phiếu. |
| agg-garage-graph | Gateway | BFF chuyển tiếp GraphQL → REST. Frontend không gọi trực tiếp gf-erp-mdm. |
| EP-CATALOG | Epic | Dịch vụ là 1 trong 3 nhóm danh mục trong EP-CATALOG (cùng nhà cung cấp và nhà xe). |
| EP-FOUND | Downstream | gf-erp-mdm cung cấp danh mục tỉnh/thành phố cho gf-hrms khi tạo/sửa nhân viên. |
| EP-CUSTOMER | Downstream | gf-erp-mdm cung cấp danh mục hãng xe/dòng xe/phiên bản cho gf-customer. |

---

## §7 Phan tich & De xuat

### 7.1 Conflict / Overlap detected

- **Overlap CREATE/EDIT**: BR-SVC-CRE-001..005 gần như trùng hoàn toàn với BR-SVC-EDT-001..005. Đây là overlap có chủ đích — cùng validation rules cho 2 luồng khác nhau.

### 7.2 Missing rules

| ID | Mô tả | Mức độ |
|---|---|---|
| MISS-MDM-001 | **Uniqueness tên dịch vụ**: Không có BR nào quy định tên dịch vụ phải unique trong garage. Hai dịch vụ có thể trùng tên — cần xác nhận đây là thiết kế hay thiếu sót. | ⚠ NEED CLARIFICATION |
| MISS-MDM-002 | **Uniqueness mã dịch vụ**: Mã dịch vụ là optional, nhưng không rõ nếu nhập thì có phải unique không. | ⚠ NEED CLARIFICATION |
| MISS-MDM-003 | **Xóa / vô hiệu hóa dịch vụ**: Hiện tại không có FEAT xóa hoặc vô hiệu hóa dịch vụ. Dịch vụ tạo ra sẽ tồn tại vĩnh viễn — cần xác nhận đây là thiết kế chủ đích. | ⚠ NEED CLARIFICATION |
| MISS-MDM-004 | **Giá bán decimal precision**: Chưa quy định độ chính xác thập phân cho giá bán (VND thường không có thập phân, nhưng cần confirm). | ⚠ NEED CLARIFICATION |
| MISS-MDM-005 | **Giới hạn dung lượng hình ảnh**: FEAT cho phép tải hình ảnh nhưng không quy định giới hạn dung lượng, kích thước, định dạng file. | ⚠ NEED CLARIFICATION |
| MISS-MDM-006 | **Impact chỉnh sửa dịch vụ lên phiếu dịch vụ cũ**: EC-2 của FEAT-CAT-SVC-EDIT ghi "không ảnh hưởng phiếu dịch vụ đã tạo" — cần confirm phiếu dịch vụ snapshot giá tại thời điểm tạo. | ⚠ NEED CLARIFICATION |

### 7.3 De xuat cai tien

1. **Bổ sung uniqueness rule cho mã dịch vụ** (nếu có nhập): tránh hai dịch vụ có cùng mã gây nhầm lẫn khi tra cứu.
2. **Cân nhắc thêm chức năng vô hiệu hóa dịch vụ**: Cho phép garage ẩn dịch vụ không còn cung cấp thay vì để danh sách phình lên vô hạn.
3. **Quy định giới hạn hình ảnh**: Định dạng (JPG, PNG), dung lượng tối đa (ví dụ 5MB), kích thước pixel tối đa.
4. **Xác nhận giá bán**: Sử dụng số nguyên (VND, không thập phân) hoặc cho phép thập phân — ảnh hưởng đến kiểu dữ liệu backend.
5. **Confirm snapshot behavior**: Ghi nhận rõ trong BR rằng phiếu dịch vụ snapshot thông tin dịch vụ (tên, giá, đơn vị) tại thời điểm thêm vào phiếu — thay đổi sau đó không ảnh hưởng.

---

## Change Log

| Date | Summary | Author |
|---|---|---|
| 2026-05-20 | Khởi tạo business rules cho gf-erp-mdm — danh mục dịch vụ (3 FEAT: LIST, CREATE, EDIT). Tổng hợp 13 BR, không có status lifecycle, 6 missing rules cần clarify. Domain đơn giản nhất trong 4 boundaries. | Business Authority |
