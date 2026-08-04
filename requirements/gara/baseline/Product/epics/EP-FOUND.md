---
type: epic
artifact_kind: epic
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
boundary: "gf-hrms"
last_reviewed: "2026-05-27"
supersedes: null
---

# EP-FOUND: Nền tảng garage, tài khoản, chi nhánh & phân quyền

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-FOUND` |
| Title | Nền tảng garage, tài khoản, chi nhánh & phân quyền |
| Status | PLANNED |
| Priority | P0 |
| Target wave | Wave 1 |

## 1. Outcome / Hypothesis

Nếu garage có thể quản lý toàn bộ vòng đời nhân viên (tạo, chỉnh sửa, tạm nghỉ, chấm dứt hợp đồng, kích hoạt lại) cùng với việc cấp, vô hiệu hóa và kích hoạt lại tài khoản đăng nhập — trên một hệ thống duy nhất — thì garage sẽ kiểm soát được đội ngũ nhân sự, phân quyền truy cập hệ thống chính xác và giảm rủi ro truy cập trái phép.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Quản lý nhân viên, cấp/thu hồi tài khoản, thay đổi trạng thái làm việc |
| Kế toán | PRIMARY | Quyền tương đương chủ garage trong quản lý nhân viên và tài khoản |

## 3. Vòng đời trạng thái

### 3.1 Trạng thái làm việc

```
                    ┌──────────────────┐
                    │    Tạo mới       │
                    │  (Create)        │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
          ┌────────│  Đang làm việc   │────────┐
          │        │    (ACTIVE)       │        │
          │        └────────┬─────────┘        │
          │                 │                   │
     Tạm nghỉ              │           Chấm dứt HĐ
          │                 │                   │
          ▼                 │                   ▼
 ┌──────────────────┐      │         ┌──────────────────┐
 │    Tạm nghỉ      │──────┼────────▶│  Đã nghỉ việc    │
 │   (SUSPENDED)    │  Chấm dứt HĐ  │  (TERMINATED)    │
 └──────────────────┘      │         └──────────────────┘
          │                │                   │
          │           Kích hoạt lại            │
          │                │                   │
          └────────────────┼───────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  Đang làm việc   │
                  │    (ACTIVE)      │
                  └──────────────────┘
```

**Ghi chú:**
- Khi tạo nhân viên, trạng thái khởi tạo là **"Đang làm việc"**.
- **"Tạm nghỉ"** và **"Đã nghỉ việc"** đều có thể kích hoạt lại về **"Đang làm việc"**.
- Chỉ nhân viên ở trạng thái **"Đang làm việc"** mới được cập nhật thông tin cá nhân.
- Trạng thái làm việc và trạng thái tài khoản được quản lý tách biệt — tạm nghỉ/chấm dứt hợp đồng **không** tự động vô hiệu hóa tài khoản.

### 3.2 Trạng thái tài khoản (SSO)

```
  ┌──────────────────┐
  │ Chưa cấp tài    │──── Cấp tài khoản ───▶ ┌──────────────────┐
  │ khoản (NONE)     │                         │ Đang tạo tài     │
  └──────────────────┘                         │ khoản             │
                                               │ (PROVISIONING)    │
  ┌──────────────────┐                         └──┬────────┬──────┘
  │ Tạo thất bại    │◀── Thất bại ────────────────┘        │
  │ (FAILED)         │                                 Thành công
  └──────┬───────────┘                                      │
         │                                                  ▼
         │  Cấp lại                              ┌──────────────────┐
         └──────────────────────────────────────▶│ Đang hoạt động   │
                                                 │ (ACTIVE)          │
                                                 └──┬───────────────┘
                                                    │
                                            Thu hồi tài khoản
                                                    │
                                                    ▼
                                          ┌──────────────────┐
                             Kích hoạt ◀──│ Đã vô hiệu hóa  │
                             lại          │ (DISABLED)        │
                                          └──────────────────┘
```

**Ghi chú:**
- Cấp tài khoản chỉ từ **"Chưa cấp tài khoản"** hoặc **"Tạo thất bại"**, và nhân viên phải ở trạng thái **"Đang làm việc"**.
- Thu hồi tài khoản (vô hiệu hóa) **không** yêu cầu nhân viên ở trạng thái **"Đang làm việc"**.
- Kích hoạt lại tài khoản yêu cầu tài khoản ở trạng thái **"Đã vô hiệu hóa"** **và** nhân viên ở trạng thái **"Đang làm việc"**.

## 4. Features

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-FND-EMP-LIST` | Danh sách nhân viên | [FEAT-FND-EMP-LIST](../features/FEAT-FND-EMP-LIST.md) | P0 |
| `FEAT-FND-EMP-DETAIL` | Chi tiết nhân viên | [FEAT-FND-EMP-DETAIL](../features/FEAT-FND-EMP-DETAIL.md) | P0 |
| `FEAT-FND-EMP-CREATE` | Tạo nhân viên | [FEAT-FND-EMP-CREATE](../features/FEAT-FND-EMP-CREATE.md) | P0 |
| `FEAT-FND-EMP-EDIT` | Chỉnh sửa nhân viên | [FEAT-FND-EMP-EDIT](../features/FEAT-FND-EMP-EDIT.md) | P1 |
| `FEAT-FND-EMP-STATUS` | Quản lý trạng thái nhân viên | [FEAT-FND-EMP-STATUS](../features/FEAT-FND-EMP-STATUS.md) | P1 |
| `FEAT-FND-EMP-SSO` | Quản lý tài khoản đăng nhập nhân viên | [FEAT-FND-EMP-SSO](../features/FEAT-FND-EMP-SSO.md) | P1 |

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-BOOKING` | Downstream | Nhân viên thực hiện xác nhận, từ chối, tiếp nhận lịch hẹn. |
| `EP-SERVICE-ORDER` | Downstream | Nhân viên thực hiện tạo, xử lý phiếu dịch vụ. |
| `EP-CATALOG` | Upstream | Danh mục tỉnh/thành phố, phường/xã để validate thông tin địa chỉ nhân viên. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-hrms` | Boundary chính: xử lý toàn bộ nghiệp vụ nhân viên và lifecycle SSO. |
| `agg-garage-graph` | BFF layer: chuyển tiếp GraphQL operations từ frontend sang gf-hrms. |
| `gf-erp-mdm` | Cung cấp danh mục tỉnh/thành phố, phường/xã qua cache MDM. |
| IAM / Tenant User (external) | Hệ thống quản lý tài khoản — nhận yêu cầu cấp/vô hiệu/kích hoạt tài khoản qua Kafka events và phản hồi kết quả. |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ nhân viên có tài khoản đăng nhập | >= 80% | Số nhân viên **"Đang làm việc"** có tài khoản **"Đang hoạt động"** / tổng nhân viên **"Đang làm việc"** |
| Tỷ lệ cấp tài khoản thành công | >= 95% | Số yêu cầu cấp tài khoản thành công / tổng yêu cầu cấp |
| Thời gian trung bình xử lý tạo nhân viên | <= 2 phút | Từ mở form đến lưu thành công |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo EP-FOUND từ 6 FEAT đã gen (LIST v1, DETAIL v1, CREATE v1, EDIT v1, STATUS v1, SSO v1). Vòng đời trạng thái tổng hợp từ KG gf-hrms v2 — bao gồm trạng thái làm việc (3 trạng thái) và trạng thái tài khoản SSO (5 trạng thái). |
