---
type: business-rules
artifact_kind: business-rules
status: ACTIVE
version: 1
tier: T1
owner_authority: Business Authority
boundary: "gf-hrms"
last_reviewed: "2026-05-20"
supersedes: "none"
---

# Business Rules — gf-hrms

> Boundary này sở hữu domain: Employee CRUD, employee lifecycle (trạng thái làm việc), SSO account lifecycle (trạng thái tài khoản đăng nhập).
> Phạm vi tài liệu: EP-FOUND (6 FEAT: LIST, CREATE, DETAIL, EDIT, STATUS, SSO).

---

## §1 Cross-boundary Rules

| Rule | Mô tả | Boundaries liên quan |
|---|---|---|
| CB-HRMS-001 | Dữ liệu nhân viên được phạm vi theo tenant (garage). Mọi truy vấn và thao tác đều phải filter theo `tenantId`. | gf-hrms, agg-garage-graph |
| CB-HRMS-002 | Danh mục tỉnh/thành phố và phường/xã dùng khi tạo/sửa nhân viên được lấy từ `gf-erp-mdm` (Redis-cached MDM). | gf-hrms, gf-erp-mdm |
| CB-HRMS-003 | Cấp/vô hiệu/kích hoạt tài khoản SSO gửi yêu cầu qua Kafka events đến hệ thống IAM / Tenant User bên ngoài. Kết quả phản hồi bất đồng bộ. | gf-hrms, IAM (external) |
| CB-HRMS-004 | Mọi thao tác CRUD nhân viên đi qua BFF `agg-garage-graph` (GraphQL) rồi gọi REST API `gf-hrms`. Frontend không truy cập trực tiếp `gf-hrms`. | gf-hrms, agg-garage-graph |
| CB-HRMS-005 | Nhân viên tham gia downstream vào EP-BOOKING (xác nhận, từ chối, tiếp nhận lịch hẹn) và EP-SERVICE-ORDER (tạo, xử lý phiếu dịch vụ). | gf-hrms, gf-sales |

---

## §2 Rules Registry

### 2.1 Danh sách nhân viên (BR-EMP-LST-001..004)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-EMP-LST-001 | Danh sách nhân viên luôn được phạm vi theo garage hiện tại — không hiển thị nhân viên của garage khác. | Tenant isolation | FEAT-FND-EMP-LIST |
| BR-EMP-LST-002 | Nút chỉnh sửa trong cột **"Thao tác"** chỉ hiển thị cho nhân viên có trạng thái **"Đang làm việc"**. Nhân viên ở trạng thái **"Tạm nghỉ"** hoặc **"Đã nghỉ việc"** không hiển thị nút chỉnh sửa. | Conditional action | FEAT-FND-EMP-LIST |
| BR-EMP-LST-003 | Trạng thái nhân viên hiển thị dưới dạng badge với màu phân biệt: **"Đang làm việc"** (xanh), **"Tạm nghỉ"** (cam), **"Đã nghỉ việc"** (đỏ). | Display | FEAT-FND-EMP-LIST |
| BR-EMP-LST-004 | Tìm kiếm từ khóa áp dụng đồng thời cho tên, mã nhân viên và số điện thoại. | Search | FEAT-FND-EMP-LIST |

### 2.2 Tạo nhân viên (BR-EMP-CRE-001..005)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-EMP-CRE-001 | Số điện thoại không được trùng trong cùng một garage. Nếu trùng, hiển thị hộp thoại thông tin nhân viên đã tồn tại và cho phép khôi phục hồ sơ (nếu nhân viên đã nghỉ việc). | Uniqueness | FEAT-FND-EMP-CREATE |
| BR-EMP-CRE-002 | Mã nhân viên được hệ thống tự sinh theo định dạng chuẩn, không cho phép nhập thủ công. Mã được tạo sau khi lưu thành công. | Auto-generate | FEAT-FND-EMP-CREATE |
| BR-EMP-CRE-003 | Khi tạo nhân viên, trạng thái khởi tạo luôn là **"Đang làm việc"**. Hệ thống ghi nhận lịch sử trạng thái ban đầu. | Default value | FEAT-FND-EMP-CREATE |
| BR-EMP-CRE-004 | Tỉnh/thành phố và phường/xã (nếu có) được kiểm tra hợp lệ theo danh mục hệ thống (gf-erp-mdm). Nếu để trống thì bỏ qua kiểm tra. | MDM validation | FEAT-FND-EMP-CREATE |
| BR-EMP-CRE-005 | CCCD/CMND chỉ chứa số, độ dài 9 hoặc 12 ký tự. | Validation | FEAT-FND-EMP-CREATE |

### 2.3 Chi tiết nhân viên (BR-EMP-DTL-001..008)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-EMP-DTL-001 | Chỉ nhân viên ở trạng thái **"Đang làm việc"** mới hiển thị nút **"Chỉnh sửa"**. | Conditional action | FEAT-FND-EMP-DETAIL |
| BR-EMP-DTL-002 | Trạng thái làm việc chỉ chuyển theo quy tắc: **"Đang làm việc"** → **"Tạm nghỉ"** / **"Đã nghỉ việc"**; **"Tạm nghỉ"** → **"Đang làm việc"** / **"Đã nghỉ việc"**; **"Đã nghỉ việc"** → **"Đang làm việc"**. | State machine | FEAT-FND-EMP-DETAIL |
| BR-EMP-DTL-003 | Ngày nghỉ việc không được nhỏ hơn ngày vào làm. | Validation | FEAT-FND-EMP-DETAIL |
| BR-EMP-DTL-004 | Hệ thống ghi nhận lịch sử trạng thái mỗi khi có thay đổi (tạm nghỉ, chấm dứt HĐ, kích hoạt lại) kèm người thực hiện và thời gian. | Audit trail | FEAT-FND-EMP-DETAIL |
| BR-EMP-DTL-005 | Cấp tài khoản chỉ thực hiện được khi tài khoản ở trạng thái **"Chưa cấp tài khoản"** hoặc **"Tạo thất bại"** và nhân viên ở trạng thái **"Đang làm việc"**. | SSO precondition | FEAT-FND-EMP-DETAIL |
| BR-EMP-DTL-006 | Thu hồi tài khoản (vô hiệu hóa) chỉ yêu cầu tài khoản ở trạng thái **"Đang hoạt động"** — **không** yêu cầu nhân viên ở trạng thái **"Đang làm việc"**. | SSO precondition | FEAT-FND-EMP-DETAIL |
| BR-EMP-DTL-007 | Kích hoạt lại tài khoản yêu cầu tài khoản ở trạng thái **"Đã vô hiệu hóa"** **và** nhân viên ở trạng thái **"Đang làm việc"**. | SSO precondition | FEAT-FND-EMP-DETAIL |
| BR-EMP-DTL-008 | Trạng thái làm việc và trạng thái tài khoản hoạt động **độc lập** — chấm dứt hợp đồng hoặc tạm nghỉ **không** tự động thu hồi tài khoản. | Independence | FEAT-FND-EMP-DETAIL, FEAT-FND-EMP-STATUS, FEAT-FND-EMP-SSO |

### 2.4 Chỉnh sửa nhân viên (BR-EMP-EDT-001..005)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-EMP-EDT-001 | Chỉ nhân viên đang ở trạng thái **"Đang làm việc"** mới được chỉnh sửa thông tin. | Precondition | FEAT-FND-EMP-EDIT |
| BR-EMP-EDT-002 | Khi thay đổi số điện thoại, số mới không được trùng với nhân viên khác trong cùng garage. | Uniqueness | FEAT-FND-EMP-EDIT |
| BR-EMP-EDT-003 | Khi thay đổi vai trò, hệ thống ghi nhận lịch sử thay đổi vai trò gồm vai trò cũ, vai trò mới, người thực hiện và thời gian. | Audit trail | FEAT-FND-EMP-EDIT |
| BR-EMP-EDT-004 | Mã nhân viên là giá trị chỉ đọc, không cho phép thay đổi sau khi tạo. | Immutable field | FEAT-FND-EMP-EDIT |
| BR-EMP-EDT-005 | Tỉnh/thành phố và phường/xã phải hợp lệ theo danh mục địa chính (gf-erp-mdm). Nếu để trống thì bỏ qua kiểm tra. | MDM validation | FEAT-FND-EMP-EDIT |

### 2.5 Quản lý trạng thái nhân viên (BR-EMP-STS-001..005)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-EMP-STS-001 | Trạng thái làm việc chỉ chuyển theo các luồng hợp lệ (xem §3.1). | State machine | FEAT-FND-EMP-STATUS |
| BR-EMP-STS-002 | Ngày nghỉ việc không được nhỏ hơn ngày vào làm của nhân viên. | Validation | FEAT-FND-EMP-STATUS |
| BR-EMP-STS-003 | Mọi thay đổi trạng thái đều được ghi lại trong lịch sử trạng thái với người thực hiện và thời gian. | Audit trail | FEAT-FND-EMP-STATUS |
| BR-EMP-STS-004 | Tạm nghỉ và chấm dứt hợp đồng **không** tự động vô hiệu hóa tài khoản đăng nhập — hai lifecycle độc lập. | Independence | FEAT-FND-EMP-STATUS |
| BR-EMP-STS-005 | Chỉ nhân viên ở trạng thái **"Đang làm việc"** mới được cập nhật thông tin cá nhân. Tạm nghỉ và chấm dứt HĐ thì không. | Edit guard | FEAT-FND-EMP-STATUS |

### 2.6 Quản lý tài khoản SSO (BR-EMP-SSO-001..006)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-EMP-SSO-001 | Cấp tài khoản chỉ thực hiện được khi trạng thái tài khoản là **"Chưa cấp tài khoản"** hoặc **"Tạo thất bại"**. | SSO precondition | FEAT-FND-EMP-SSO |
| BR-EMP-SSO-002 | Cấp tài khoản và kích hoạt lại tài khoản yêu cầu nhân viên phải ở trạng thái làm việc **"Đang làm việc"**. | SSO precondition | FEAT-FND-EMP-SSO |
| BR-EMP-SSO-003 | Vô hiệu hóa tài khoản chỉ yêu cầu tài khoản ở trạng thái **"Đang hoạt động"** — **không** yêu cầu nhân viên ở trạng thái **"Đang làm việc"**. | SSO precondition | FEAT-FND-EMP-SSO |
| BR-EMP-SSO-004 | Kích hoạt lại tài khoản yêu cầu tài khoản ở trạng thái **"Đã vô hiệu hóa"** **và** nhân viên ở trạng thái **"Đang làm việc"**. | SSO precondition | FEAT-FND-EMP-SSO |
| BR-EMP-SSO-005 | Trạng thái tài khoản chỉ thay đổi thực sự sau khi hệ thống bên ngoài (IAM) xử lý xong và phản hồi kết quả. Người dùng nhìn thấy trạng thái trung gian **"Đang tạo tài khoản"** cho đến khi có kết quả. | Async processing | FEAT-FND-EMP-SSO |
| BR-EMP-SSO-006 | Khi cấp tài khoản, thông tin tài khoản được gửi tự động về số điện thoại của nhân viên. | Notification | FEAT-FND-EMP-SSO |

---

## §3 Status Transition Rules

### 3.1 Trạng thái làm việc (3 trạng thái)

```
                    ┌──────────────────┐
                    │    Tạo mới       │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
          ┌────────│  Đang làm việc   │────────┐
          │        └────────┬─────────┘        │
          │                 │                   │
     Tạm nghỉ              │           Chấm dứt HĐ
          │                 │                   │
          ▼                 │                   ▼
 ┌──────────────────┐      │         ┌──────────────────┐
 │    Tạm nghỉ      │──────┼────────▶│  Đã nghỉ việc    │
 └──────────────────┘  Chấm dứt HĐ  └──────────────────┘
          │                │                   │
          │           Kích hoạt lại            │
          │                │                   │
          └────────────────┼───────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  Đang làm việc   │
                  └──────────────────┘
```

| Trạng thái hiện tại | Hành động | Trạng thái đích | Điều kiện | Dữ liệu bổ sung |
|---|---|---|---|---|
| *(Tạo mới)* | Tạo nhân viên | Đang làm việc | Mặc định khi tạo | Ghi lịch sử trạng thái ban đầu |
| Đang làm việc | Tạm nghỉ | Tạm nghỉ | Dialog xác nhận | Ghi lịch sử + người thực hiện + thời gian |
| Đang làm việc | Chấm dứt HĐ | Đã nghỉ việc | Dialog xác nhận + Ngày nghỉ >= Ngày vào làm + Lý do bắt buộc | Ghi ngày nghỉ + lý do + lịch sử |
| Tạm nghỉ | Chấm dứt HĐ | Đã nghỉ việc | Dialog xác nhận + Ngày nghỉ >= Ngày vào làm + Lý do bắt buộc | Ghi ngày nghỉ + lý do + lịch sử |
| Tạm nghỉ | Kích hoạt lại | Đang làm việc | Dialog xác nhận | Ghi lịch sử |
| Đã nghỉ việc | Kích hoạt lại | Đang làm việc | Dialog xác nhận | Ghi lịch sử |

### 3.2 Trạng thái tài khoản SSO (5 trạng thái)

```
  ┌──────────────────┐
  │ Chưa cấp tài    │──── Cấp tài khoản ───▶ ┌──────────────────┐
  │ khoản (NONE)     │                         │ Đang tạo tài     │
  └──────────────────┘                         │ khoản             │
                                               └──┬────────┬──────┘
  ┌──────────────────┐                             │        │
  │ Tạo thất bại    │◀── Thất bại ────────────────┘   Thành công
  └──────┬───────────┘                                      │
         │                                                  ▼
         │  Cấp lại                              ┌──────────────────┐
         └──────────────────────────────────────▶│ Đang hoạt động   │
                                                 └──┬───────────────┘
                                                    │
                                            Thu hồi tài khoản
                                                    │
                                                    ▼
                                          ┌──────────────────┐
                             Kích hoạt ◀──│ Đã vô hiệu hóa  │
                             lại          └──────────────────┘
```

| Trạng thái TK hiện tại | Hành động | Trạng thái TK đích | Điều kiện trạng thái NV |
|---|---|---|---|
| Chưa cấp tài khoản | Cấp tài khoản | Đang tạo tài khoản | NV phải **"Đang làm việc"** |
| Tạo thất bại | Cấp lại | Đang tạo tài khoản | NV phải **"Đang làm việc"** |
| Đang tạo tài khoản | IAM thành công | Đang hoạt động | Tự động (async callback) |
| Đang tạo tài khoản | IAM thất bại | Tạo thất bại | Tự động (async callback) |
| Đang hoạt động | Thu hồi tài khoản | Đã vô hiệu hóa | Không yêu cầu NV **"Đang làm việc"** |
| Đã vô hiệu hóa | Kích hoạt lại TK | Đang hoạt động | NV phải **"Đang làm việc"** |

> **Nguyên tắc quan trọng**: Trạng thái làm việc và trạng thái tài khoản SSO hoạt động **độc lập**. Tạm nghỉ / chấm dứt HĐ **không** tự động vô hiệu hóa tài khoản.

---

## §4 Permission Rules

| Action | garage-owner | accountant | Condition |
|---|---|---|---|
| Xem danh sách nhân viên | Cho phep | Cho phep | Không có ngoại lệ |
| Tạo nhân viên | Cho phep | Cho phep | Không có ngoại lệ |
| Xem chi tiết nhân viên | Cho phep | Cho phep | Không có ngoại lệ |
| Chỉnh sửa nhân viên | Cho phep | Cho phep | NV phải ở trạng thái **"Đang làm việc"** |
| Tạm nghỉ nhân viên | Cho phep | Cho phep | NV phải ở trạng thái **"Đang làm việc"** |
| Chấm dứt hợp đồng | Cho phep | Cho phep | NV ở **"Đang làm việc"** hoặc **"Tạm nghỉ"** |
| Kích hoạt lại nhân viên | Cho phep | Cho phep | NV ở **"Tạm nghỉ"** hoặc **"Đã nghỉ việc"** |
| Cấp tài khoản SSO | Cho phep | Cho phep | TK **"Chưa cấp"** / **"Tạo thất bại"** + NV **"Đang làm việc"** |
| Thu hồi tài khoản SSO | Cho phep | Cho phep | TK **"Đang hoạt động"** (không yêu cầu NV trạng thái cụ thể) |
| Kích hoạt lại tài khoản SSO | Cho phep | Cho phep | TK **"Đã vô hiệu hóa"** + NV **"Đang làm việc"** |

> Không có ngoại lệ phân quyền trong toàn bộ domain nhân viên.

---

## §5 Validation Rules

### 5.1 Thông tin chung — Tạo và Chỉnh sửa

| Trường | Bắt buộc | Max length | Validation | Error message |
|---|---|---|---|---|
| Họ và tên đệm | Co | 200 | Không trống | **"Vui lòng nhập họ và tên đệm."** / **"Họ và tên đệm không quá 200 ký tự"** |
| Tên | Co | 100 | Không trống | **"Vui lòng nhập tên."** / **"Tên không quá 100 ký tự"** |
| Số điện thoại | Co | — | Không trống + unique trong garage | **"Vui lòng nhập số điện thoại."** / Hộp thoại **"Nhân viên đã có trên hệ thống"** |
| Mã nhân viên | — | — | Tự sinh, chỉ đọc | — |
| Ngày sinh | Không | — | — | — |
| Email | Không | — | — | — |
| CCCD/CMND | Không | — | Chỉ số, 9 hoặc 12 ký tự | **"CCCD/CMND chỉ chứa số, độ dài 9 hoặc 12 ký tự"** |
| Tỉnh/Thành phố | Không | — | Phải hợp lệ theo danh mục MDM (nếu có) | Lỗi validation |
| Phường/Xã | Không | — | Phải hợp lệ theo danh mục MDM (nếu có) | Lỗi validation |
| Địa chỉ | Không | — | — | — |
| Ảnh đại diện | Không | — | Tối đa 1 ảnh | — |

### 5.2 Thông tin công việc — Tạo và Chỉnh sửa

| Trường | Bắt buộc | Validation | Error message |
|---|---|---|---|
| Vai trò | Co | Phải chọn 1 trong 9 vai trò | **"Vui lòng chọn vai trò."** |
| Ngày vào làm | Co | Phải chọn ngày | **"Vui lòng chọn ngày vào làm."** |

### 5.3 Chấm dứt hợp đồng

| Trường | Bắt buộc | Validation | Error message |
|---|---|---|---|
| Ngày nghỉ việc | Co | Không nhỏ hơn ngày vào làm | **"Ngày nghỉ việc không thể nhỏ hơn ngày vào làm."** / **"Vui lòng chọn ngày nghỉ việc"** |
| Lý do nghỉ việc | Co | Không trống | **"Vui lòng nhập lý do nghỉ việc."** |

### 5.4 Danh sách vai trò (enumeration)

Thợ sửa chữa, Cố vấn dịch vụ, Kế toán, Nhân viên quản lý kho, Nhân viên dịch vụ nhanh, Nhân viên Marketing, Chăm sóc khách hàng, Quản lý nhân sự, Chủ sở hữu.

---

## §6 Dependency Rules

| Dependency | Loại | Mô tả |
|---|---|---|
| gf-erp-mdm | Upstream | Cung cấp danh mục tỉnh/thành phố, phường/xã để validate thông tin địa chỉ nhân viên. |
| IAM / Tenant User (external) | External | Nhận yêu cầu cấp/vô hiệu/kích hoạt tài khoản qua Kafka events và phản hồi kết quả bất đồng bộ. |
| agg-garage-graph | Gateway | BFF chuyển tiếp GraphQL → REST. Frontend không gọi trực tiếp gf-hrms. |
| EP-BOOKING, EP-SERVICE-ORDER | Downstream | Nhân viên thực hiện xác nhận booking, tạo/xử lý phiếu dịch vụ. |

---

## §7 Phan tich & De xuat

### 7.1 Conflict / Overlap detected

| ID | Mô tả | Mức độ |
|---|---|---|
| OVL-HRMS-001 | **Overlap BR giữa FEAT-FND-EMP-DETAIL và FEAT-FND-EMP-STATUS**: Cả hai đều mô tả state transition rules (BR-EMP-DTL-002 ≡ BR-EMP-STS-001) và ghi lịch sử trạng thái (BR-EMP-DTL-004 ≡ BR-EMP-STS-003). Không phải conflict — chỉ là overlap do cùng nghiệp vụ được mô tả ở 2 FEAT. | LOW — overlap, không phải conflict |
| OVL-HRMS-002 | **Overlap BR giữa FEAT-FND-EMP-DETAIL và FEAT-FND-EMP-SSO**: BR-EMP-DTL-005..007 ≡ BR-EMP-SSO-001..004. Cùng quy tắc SSO lifecycle mô tả ở 2 FEAT. | LOW — overlap, không phải conflict |
| CNF-HRMS-001 | **Tiềm ẩn mâu thuẫn** trong hộp thoại tạm nghỉ: FEAT-FND-EMP-STATUS AC-3 ghi **"Lưu ý: Tài khoản SSO của nhân viên sẽ bị vô hiệu hóa tạm thời"** nhưng BR-EMP-STS-004 và BR-EMP-DTL-008 khẳng định tạm nghỉ **không** tự động vô hiệu hóa tài khoản. Thông báo UI gây hiểu nhầm. | **MEDIUM** — UI message mâu thuẫn với BR |

### 7.2 Missing rules

| ID | Mô tả | Mức độ |
|---|---|---|
| MISS-HRMS-001 | **Validation số điện thoại**: FEAT-FND-EMP-CREATE không quy định format cụ thể (số ký tự, prefix). Trong khi gf-system yêu cầu đúng 10 chữ số cho nhà xe. Số điện thoại nhân viên nên thống nhất format. | ⚠ NEED CLARIFICATION |
| MISS-HRMS-002 | **Validation email**: FEAT-FND-EMP-CREATE/EDIT không quy định validation format email (chỉ ghi "không bắt buộc"). Nên thêm kiểm tra format email nếu có nhập. | ⚠ NEED CLARIFICATION |
| MISS-HRMS-003 | **Toast kích hoạt lại tài khoản SSO**: FEAT-FND-EMP-SSO AC-17 ghi chú **"NEED CLARIFICATION"** — chưa xác nhận toast text cho luồng kích hoạt lại tài khoản. | ⚠ NEED CLARIFICATION |
| MISS-HRMS-004 | **Optimistic locking**: FEAT-FND-EMP-EDIT EC-2 ghi "hai người cùng chỉnh sửa — người lưu sau ghi đè". Chưa có cơ chế optimistic lock (version check). | ⚠ NEED CLARIFICATION |
| MISS-HRMS-005 | **Khôi phục hồ sơ**: FEAT-FND-EMP-CREATE AC-20 mô tả khôi phục nhân viên đã nghỉ việc, nhưng chưa rõ dữ liệu nào được giữ lại, dữ liệu nào được cập nhật từ form tạo mới. | ⚠ NEED CLARIFICATION |

### 7.3 De xuat cai tien

1. **Sửa thông báo hộp thoại tạm nghỉ** (CNF-HRMS-001): Thay đổi lưu ý từ **"Tài khoản SSO sẽ bị vô hiệu hóa tạm thời"** thành **"Bạn có thể cần thu hồi tài khoản SSO thủ công nếu muốn chặn truy cập hệ thống"** — phản ánh đúng thiết kế hai lifecycle độc lập.
2. **Thống nhất validation số điện thoại**: Nên áp dụng rule "đúng 10 chữ số" cho cả nhân viên (giống nhà xe liên kết).
3. **Bổ sung email format validation**: Nếu nhân viên nhập email, validate format `*@*.*`.
4. **Bổ sung optimistic locking**: Sử dụng version field để tránh race condition khi hai người cùng chỉnh sửa.
5. **Clarify quy trình khôi phục hồ sơ**: Xác nhận rõ dữ liệu nào reset, dữ liệu nào giữ khi khôi phục nhân viên đã nghỉ việc.

---

## Change Log

| Date | Summary | Author |
|---|---|---|
| 2026-05-20 | Khởi tạo business rules cho gf-hrms — nhân viên (6 FEAT: LIST, CREATE, DETAIL, EDIT, STATUS, SSO). Tổng hợp 33 BR, 2 state machines (làm việc 3 trạng thái + SSO 5 trạng thái), 1 conflict tiềm ẩn (UI message tạm nghỉ), 5 missing rules cần clarify. | Business Authority |
