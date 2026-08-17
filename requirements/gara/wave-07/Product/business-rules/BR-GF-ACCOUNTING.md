---
type: business-rules
artifact_kind: business-rules
status: ACTIVE
version: 4
tier: T1
owner_authority: Business Authority
boundary: "gf-accounting"
last_reviewed: "2026-08-11"
supersedes: "none"
---

# Business Rules — gf-accounting

> Boundary này sở hữu domain: Settlement record (phiếu quyết toán), document sync (chứng từ & hóa đơn), sequence generation (mã phiếu), printing (in phiếu quyết toán).
> Phạm vi tài liệu: EP-SETTLEMENT (3 FEAT: STL-LIST, STL-CREATE, STL-DETAIL).

---

## §1 Cross-boundary Rules

| Rule | Mô tả | Boundaries liên quan |
|---|---|---|
| CB-ACC-001 | Dữ liệu phiếu quyết toán được phạm vi theo tenant (garage). Mọi truy vấn và thao tác đều phải filter theo `tenantId`. | gf-accounting, agg-garage-graph |
| CB-ACC-002 | Tạo phiếu quyết toán phải lấy **snapshot** phiếu dịch vụ từ `gf-sales` trước khi ghi nhận — đảm bảo dữ liệu chi phí khớp tại thời điểm quyết toán. | gf-accounting, gf-sales |
| CB-ACC-003 | Khi tạo quyết toán thành công, `gf-accounting` gọi callback `gf-sales` để chuyển phiếu dịch vụ sang trạng thái đã quyết toán. Khi hủy quyết toán, callback mở lại phiếu dịch vụ. | gf-accounting, gf-sales |
| CB-ACC-004 | Trạng thái thanh toán (Chưa thanh toán / Thanh toán 1 phần / Đã thanh toán) **không thuộc** gf-accounting — thuộc phiếu dịch vụ trên `gf-sales`. gf-accounting chỉ hiển thị read-only. | gf-accounting, gf-sales |
| CB-ACC-005 | Hủy quyết toán bị chặn nếu phiếu dịch vụ đã có giao dịch thanh toán trên `gf-sales`. | gf-accounting, gf-sales |
| CB-ACC-006 | Mọi thao tác quyết toán đi qua BFF `agg-garage-graph` (GraphQL) rồi gọi REST API `gf-accounting`. Frontend không truy cập trực tiếp. | gf-accounting, agg-garage-graph |
| CB-ACC-007 | Thông tin khách hàng và xe hiển thị trong phiếu quyết toán là **dữ liệu snapshot** từ phiếu dịch vụ — không truy vấn realtime từ `gf-customer`. | gf-accounting, gf-customer (indirect) |
| CB-ACC-008 (v3, 2026-08-11 — đồng bộ ADR-031) | Khi tạo phiếu quyết toán thành công cho phiếu dịch vụ liên kết booking nguồn Driver+ và `Document:DriverPlus=on`, `gf-accounting` **tự gửi trực tiếp** Kafka event `DOCUMENT.SETTLEMENT.SYNC` trên `AC-DEV-DOCUMENT-EVENTS`, kèm mã phiếu và URL tuyệt đối tải tệp; không nhúng binary và **không đi qua `gf-sales`**. Nếu chưa render, tải hoặc gửi được tệp, phiếu vẫn được tạo thành công; hệ thống phải lưu yêu cầu chờ đồng bộ và tự động thử lại đến khi gửi thành công. Người dùng không phải tạo lại phiếu và Driver+ không được ghi trùng chứng từ. Flag chứng từ độc lập với `Booking:DriverPlus`; không có luồng inbound từ Driver+ vào `gf-accounting`. | gf-accounting, Driver+ (external, trực tiếp) |

---

## §2 Rules Registry

### 2.1 Danh sách phiếu quyết toán (BR-STL-LST-001..006)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-STL-LST-001 | Danh sách phiếu quyết toán luôn được phạm vi theo garage hiện tại — không hiển thị phiếu quyết toán của garage khác. | Tenant isolation | FEAT-STL-LIST |
| BR-STL-LST-002 | Tìm kiếm từ khóa áp dụng đồng thời cho mã quyết toán, mã phiếu dịch vụ, tên khách hàng và số điện thoại khách hàng. | Search | FEAT-STL-LIST |
| BR-STL-LST-003 | Trạng thái phiếu quyết toán chỉ có hai giá trị: **"Hoạt động"** và **"Đã hủy"**. | Domain constraint | FEAT-STL-LIST |
| BR-STL-LST-004 | Trạng thái thanh toán có bốn giá trị: **"Chờ thanh toán"**, **"Đã thanh toán"**, **"Chưa thanh toán"** và **"Thanh toán một phần"**. | Domain constraint | FEAT-STL-LIST |
| BR-STL-LST-005 | Bên thanh toán chỉ có hai giá trị: **"Khách hàng"** và **"Bảo hiểm"**. | Domain constraint | FEAT-STL-LIST |
| BR-STL-LST-006 | Loại phiếu quyết toán chỉ có hai giá trị: **"Bán phụ tùng"** và **"Dịch vụ xe"**. | Domain constraint | FEAT-STL-LIST |

### 2.2 Tạo phiếu quyết toán (BR-STL-CRE-001..007)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-STL-CRE-001 | Tạo phiếu quyết toán phải lấy snapshot phiếu dịch vụ trước khi ghi nhận — đảm bảo dữ liệu chi phí dịch vụ và phụ tùng khớp tại thời điểm quyết toán. | Data integrity | FEAT-STL-CREATE |
| BR-STL-CRE-002 | Nếu phiếu dịch vụ có cả hạng mục khách hàng và bảo hiểm, hệ thống tạo **cặp** phiếu quyết toán **"Khách hàng"** và **"Bảo hiểm"**, liên kết hai chiều qua mã phiếu quyết toán liên quan. | Pair creation | FEAT-STL-CREATE |
| BR-STL-CRE-003 | Nếu phiếu dịch vụ chỉ có hạng mục khách hàng → tạo phiếu **"Khách hàng"**; chỉ có hạng mục bảo hiểm → tạo phiếu **"Bảo hiểm"**. Cả hai trường hợp đều chuyển phiếu dịch vụ sang trạng thái đã quyết toán. | Single creation | FEAT-STL-CREATE |
| BR-STL-CRE-004 | Không cho phép tạo phiếu quyết toán **đang hoạt động** trùng mã phiếu dịch vụ và loại bên thanh toán. Phiếu đã hủy trước đó có thể được tái sử dụng mã khi tạo lại. | Uniqueness | FEAT-STL-CREATE |
| BR-STL-CRE-005 | Tổng tiền quyết toán (tổng tiền khách trả, tổng tiền bảo hiểm trả) nhận trực tiếp từ giá trị chủ garage nhập — hệ thống **không** tự tính server-side. Cho phép thương lượng giá. | Manual input | FEAT-STL-CREATE |
| BR-STL-CRE-006 | Mã phiếu quyết toán được hệ thống tự sinh theo định dạng **SET-{yyyyMMdd}-{00001}**, unique theo tenant. Không cho phép nhập thủ công. | Auto-generate | FEAT-STL-CREATE |
| BR-STL-CRE-007 | Phiếu quyết toán khởi tạo luôn ở trạng thái **"Nháp"** (tương đương **"Hoạt động"** trên UI). Không có trạng thái phê duyệt hay thanh toán trên phiếu quyết toán — vòng đời thanh toán thuộc phiếu dịch vụ. | Default status | FEAT-STL-CREATE |
| BR-STL-CRE-008 (v2, 2026-08-11) | Khi tạo phiếu quyết toán thành công, phiếu dịch vụ gốc liên kết booking nguồn Driver+ và `Document:DriverPlus=on`, hệ thống phát `DOCUMENT.SETTLEMENT.SYNC` kèm mã phiếu + URL tuyệt đối tải tệp, không nhúng binary. Phiếu quyết toán gửi độc lập với phiếu dịch vụ phía `gf-sales` (`FEAT-SO-DETAIL` BR-SO-DTL-007), không chờ đủ hai loại; nếu tạo cặp Khách hàng/Bảo hiểm thì mỗi phiếu phát một event riêng. Khi chưa render, tải hoặc gửi được tệp, nghiệp vụ tạo phiếu không rollback; hệ thống lưu yêu cầu chờ đồng bộ và tự động thử lại đến khi thành công, không yêu cầu người dùng tạo lại và không tạo chứng từ trùng tại Driver+. | Integration | FEAT-STL-CREATE |

### 2.3 Chi tiết phiếu quyết toán (BR-STL-DTL-001..006)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-STL-DTL-001 | Thông tin phiếu quyết toán luôn được phạm vi theo garage hiện tại. | Tenant isolation | FEAT-STL-DETAIL |
| BR-STL-DTL-002 | Hủy phiếu quyết toán sẽ hủy **toàn bộ** phiếu quyết toán cùng mã phiếu dịch vụ (bao gồm phiếu liên kết trong cặp khách hàng/bảo hiểm) và mở lại phiếu dịch vụ từ trạng thái đã quyết toán. | Cascade cancel | FEAT-STL-DETAIL |
| BR-STL-DTL-003 | Hủy phiếu quyết toán bị **chặn** nếu phiếu dịch vụ đã có giao dịch thanh toán. | Cancel guard | FEAT-STL-DETAIL |
| BR-STL-DTL-004 | Cập nhật phiếu quyết toán chỉ cho phép thay đổi **ghi chú** và **đồng bộ chứng từ**. Chứng từ đồng bộ theo đường dẫn file: đường dẫn không có trong request sẽ bị xóa mềm, đường dẫn mới sẽ được thêm. Các thông tin khác (dịch vụ, phụ tùng, tổng tiền, khách hàng) không được phép sửa. | Limited update | FEAT-STL-DETAIL |
| BR-STL-DTL-005 | In phiếu quyết toán chỉ hiển thị hạng mục theo bên thanh toán tương ứng: phiếu **"Khách hàng"** chỉ in hạng mục khách hàng chi trả; phiếu **"Bảo hiểm"** chỉ in hạng mục bảo hiểm chi trả. Tổng tiền được hiển thị bằng chữ tiếng Việt. | Print logic | FEAT-STL-DETAIL |
| BR-STL-DTL-006 | Phiếu quyết toán đã hủy: các nút **"Chỉnh sửa"**, hủy, **"Thêm thanh toán"** không hiển thị. Chỉ có nút **"In phiếu"** (nếu có). | Action guard | FEAT-STL-DETAIL |

---

## §3 Status Transition Rules

### 3.1 Trạng thái phiếu quyết toán (2 trạng thái)

```
  ┌──────────────────┐
  │    Tạo mới       │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐         ┌──────────────────┐
  │   Nháp           │────────▶│   Đã hủy         │
  │  (Hoạt động)     │  Hủy    │                  │
  └──────────────────┘         └──────────────────┘
```

| Trạng thái hiện tại | Hành động | Trạng thái đích | Điều kiện |
|---|---|---|---|
| *(Tạo mới)* | Tạo phiếu quyết toán | Nháp (Hoạt động) | Phiếu dịch vụ hợp lệ + chưa có phiếu QT đang hoạt động cùng loại |
| Nháp (Hoạt động) | Hủy phiếu quyết toán | Đã hủy | Phiếu dịch vụ chưa có giao dịch thanh toán (BR-STL-DTL-003) |

**Ghi chú quan trọng:**
- Vòng đời phiếu quyết toán rất đơn giản: chỉ Nháp → Đã hủy.
- **Không có** trạng thái phê duyệt hay thanh toán trên phiếu quyết toán.
- Trạng thái thanh toán (Chưa thanh toán / Thanh toán 1 phần / Đã thanh toán) thuộc phiếu dịch vụ gốc trên `gf-sales`.
- Trạng thái **"Nháp"** (DRAFT) hiển thị trên UI là **"Hoạt động"**.
- Hủy phiếu quyết toán là **cascade** — hủy cả cặp (nếu có) và mở lại phiếu dịch vụ.
- **Không có luồng quay lại** từ "Đã hủy" — muốn quyết toán lại phải tạo phiếu mới.

### 3.2 Trạng thái thanh toán (hiển thị — không thuộc gf-accounting)

Trạng thái thanh toán hiển thị trên danh sách phiếu quyết toán nhưng **không được quản lý bởi gf-accounting**:

| Trạng thái thanh toán | Mô tả | Nguồn |
|---|---|---|
| Chờ thanh toán | Phiếu dịch vụ chưa thanh toán | gf-sales |
| Chưa thanh toán | Không có thanh toán | gf-sales |
| Thanh toán một phần | Đã thanh toán một phần | gf-sales |
| Đã thanh toán | Thanh toán đầy đủ | gf-sales |

---

## §4 Permission Rules

| Action | garage-owner | accountant | Condition |
|---|---|---|---|
| Xem danh sách phiếu quyết toán | Cho phep | Cho phep | Không có ngoại lệ |
| Tạo phiếu quyết toán | Cho phep | Cho phep | Phiếu dịch vụ hợp lệ, chưa có QT đang hoạt động |
| Xem chi tiết phiếu quyết toán | Cho phep | Cho phep | Không có ngoại lệ |
| Chỉnh sửa ghi chú & chứng từ | Cho phep | Cho phep | Phiếu ở trạng thái **"Hoạt động"** |
| Hủy phiếu quyết toán | Cho phep | Cho phep | Phiếu ở trạng thái **"Hoạt động"** + chưa có thanh toán |
| In phiếu quyết toán | Cho phep | Cho phep | Phiếu ở trạng thái **"Hoạt động"** |

> Không có ngoại lệ phân quyền trong toàn bộ domain quyết toán.

---

## §5 Validation Rules

### 5.1 Tạo phiếu quyết toán

| Rule | Validation | Error message | Features |
|---|---|---|---|
| VLD-STL-001 | Phiếu dịch vụ là bắt buộc | **"Phiếu dịch vụ là bắt buộc"** | CREATE |
| VLD-STL-002 | Tổng tiền khách trả phải là số hợp lệ | **"Số tiền quyết toán không hợp lệ"** | CREATE |
| VLD-STL-003 | Tổng tiền bảo hiểm trả phải là số hợp lệ (khi có bảo hiểm) | **"Số tiền quyết toán không hợp lệ"** | CREATE |
| VLD-STL-004 | Phiếu dịch vụ chưa có phiếu quyết toán đang hoạt động cùng loại bên thanh toán | Thông báo lỗi: đã tồn tại phiếu quyết toán đang hoạt động | CREATE |
| VLD-STL-005 | Phiếu dịch vụ phải tồn tại và có thể tải snapshot | **"Không tìm thấy thông tin phiếu dịch vụ"** | CREATE |

### 5.2 Hủy phiếu quyết toán

| Rule | Validation | Error message | Features |
|---|---|---|---|
| VLD-STL-006 | Phiếu dịch vụ chưa có giao dịch thanh toán | **"Không thể hủy vì đã có phát sinh thanh toán."** | DETAIL |

---

## §6 Dependency Rules

| Dependency | Loại | Mô tả |
|---|---|---|
| gf-sales | Upstream (Critical) | Cung cấp snapshot phiếu dịch vụ (dịch vụ, phụ tùng, tổng tiền) khi tạo quyết toán. Nhận callback settle/reopen để cập nhật trạng thái phiếu dịch vụ. Trạng thái thanh toán thuộc gf-sales. |
| gf-customer | Upstream (Indirect) | Thông tin khách hàng và xe trong phiếu quyết toán là snapshot từ phiếu dịch vụ — không truy vấn trực tiếp gf-customer. |
| agg-garage-graph | Gateway | BFF chuyển tiếp GraphQL → REST. Frontend không gọi trực tiếp gf-accounting. |
| EP-SERVICE-ORDER | Upstream | Phiếu quyết toán được tạo từ phiếu dịch vụ đã hoàn thành (SERVICE) hoặc đã xuất kho (RETAIL). |

---

## §7 Phan tich & De xuat

### 7.1 Conflict / Overlap detected

| ID | Mô tả | Mức độ |
|---|---|---|
| CNF-ACC-001 | **Trạng thái "Nháp" vs "Hoạt động"**: EP-SETTLEMENT §3 ghi trạng thái là **"Nháp"** (DRAFT), nhưng FEAT-STL-LIST AC-2 hiển thị badge **"Hoạt động"** (không phải "Nháp"). Cần thống nhất: internal state = DRAFT, display label = "Hoạt động". | **MEDIUM** — cần document rõ mapping |
| CNF-ACC-002 | **Trạng thái thanh toán**: FEAT-STL-LIST AC-3 liệt kê 4 giá trị (**"Chờ thanh toán"**, **"Đã thanh toán"**, **"Chưa thanh toán"**, **"Thanh toán một phần"**) nhưng EP-SETTLEMENT §3 ghi chú chỉ nhắc 3 giá trị (Chưa thanh toán / Thanh toán 1 phần / Đã thanh toán). Giá trị **"Chờ thanh toán"** chỉ xuất hiện trong FEAT-STL-LIST. | **MEDIUM** — cần confirm 3 hay 4 giá trị |

### 7.2 Missing rules

| ID | Mô tả | Mức độ |
|---|---|---|
| MISS-ACC-001 | **Điều kiện phiếu dịch vụ hợp lệ để tạo quyết toán**: FEAT-STL-CREATE mô tả "phiếu dịch vụ đã hoàn thành" nhưng không quy định cụ thể trạng thái nào trên gf-sales được phép. EP-SETTLEMENT §5.1 ghi: "đã hoàn thành (SERVICE) hoặc đã xuất kho (RETAIL)". | ⚠ NEED CLARIFICATION — cần list đầy đủ trạng thái PĐV được phép |
| MISS-ACC-002 | **Giới hạn dung lượng chứng từ**: FEAT-STL-DETAIL cho phép upload chứng từ nhưng không quy định giới hạn dung lượng file, định dạng file, số lượng file tối đa. | ⚠ NEED CLARIFICATION |
| MISS-ACC-003 | **Số tiền quyết toán minimum**: BR-STL-CRE-005 cho phép chủ garage nhập tự do — không rõ có chấp nhận giá trị 0 hoặc âm không. | ⚠ NEED CLARIFICATION |
| MISS-ACC-004 | **Concurrent cancel**: Nếu hai người dùng cùng nhấn hủy phiếu quyết toán — chưa có cơ chế optimistic lock. | ⚠ NEED CLARIFICATION |
| MISS-ACC-005 | **Audit trail**: Không có BR nào yêu cầu ghi lịch sử thay đổi trạng thái phiếu quyết toán (tạo, hủy, chỉnh sửa). Cân nhắc bổ sung cho mục đích kiểm toán. | ⚠ NEED CLARIFICATION |

### 7.3 De xuat cai tien

1. **Document rõ mapping trạng thái**: Bổ sung mapping table: `DRAFT` (internal) = **"Hoạt động"** (UI), `CANCEL` (internal) = **"Đã hủy"** (UI) — tránh nhầm lẫn giữa các tài liệu.
2. **Xác nhận 3 hay 4 trạng thái thanh toán**: Thống nhất giữa EP-SETTLEMENT và FEAT-STL-LIST. Nếu **"Chờ thanh toán"** là giá trị hợp lệ, bổ sung vào EP.
3. **Bổ sung giới hạn chứng từ**: Quy định format file (PDF, JPG, PNG), dung lượng tối đa mỗi file, số lượng file tối đa.
4. **Bổ sung validation số tiền**: Quy định rõ minimum (>= 0 hay > 0), có cho phép nhập 0 không.
5. **Bổ sung audit trail**: Mỗi thay đổi trạng thái (tạo → hủy) và chỉnh sửa (ghi chú, chứng từ) nên ghi lại người thực hiện + thời gian — phục vụ kiểm toán tài chính.
6. **Bổ sung optimistic locking**: Version check cho concurrent edit/cancel.

---

## Appendix: Lưu ý về EP-SUPPORT (agg-garage-graph)

EP-SUPPORT gồm 2 FEAT thuộc boundary `agg-garage-graph` (BFF), **không thuộc gf-accounting**. Tuy nhiên, trong phạm vi 4 boundaries được phân tích, ghi nhận các BR quan trọng sau:

### FEAT-SUP-CHAT (Chat hỗ trợ)

| BR ID | Rule |
|---|---|
| BR-SUP-CHAT-001 | Hệ thống chat có ba màn hình: tất cả chat, chat hỗ trợ CSKH, chat theo xe. |
| BR-SUP-CHAT-002 | **Kế toán không có quyền truy cập nhóm chat theo xe.** Đây là ngoại lệ phân quyền duy nhất trong toàn bộ hệ thống. |
| BR-SUP-CHAT-003 | Tên nhóm chat hỗ trợ phải từ 3 đến 255 ký tự. |
| BR-SUP-CHAT-004 | File đính kèm trong chat chỉ chấp nhận định dạng PDF, DOC hoặc DOCX. |
| BR-SUP-CHAT-005 | Tin nhắn realtime — hiển thị thông báo popup khi có tin nhắn mới. |

### FEAT-SUP-FEEDBACK (Gửi phản hồi)

| BR ID | Rule |
|---|---|
| BR-SUP-FB-001 | Form phản hồi có ba trường bắt buộc: Tên Garage, Loại vấn đề, Chi tiết góp ý. |
| BR-SUP-FB-002 | Loại vấn đề cho phép chọn nhiều giá trị cùng lúc. |
| BR-SUP-FB-003 | Khi chọn loại vấn đề **"Khác"**, trường mô tả bổ sung trở thành bắt buộc. |
| BR-SUP-FB-004 | Phản hồi được gửi đến bộ phận CSKH qua dịch vụ bên ngoài (Google Sheet). |
| BR-SUP-FB-005 | Sau khi gửi thành công, người dùng có thể gửi phản hồi mới qua nút **"Gửi lại"**. |

> **Ngoại lệ phân quyền duy nhất**: BR-SUP-CHAT-002 — kế toán không được truy cập chat theo xe.

---

## Change Log

| Date | Summary | Author |
|---|---|---|
| 2026-05-20 | Khởi tạo business rules cho gf-accounting — phiếu quyết toán (3 FEAT: LIST, CREATE, DETAIL). Tổng hợp 19 BR, vòng đời đơn giản (Nháp → Đã hủy), 2 conflicts (naming + trạng thái thanh toán), 5 missing rules cần clarify. Appendix ghi nhận 10 BR từ EP-SUPPORT (agg-garage-graph). | Business Authority |
| 2026-08-03 | **v2 — Bổ sung tích hợp Driver+ (mới, đợt viết lại EP-BOOKING)**: thêm CB-ACC-008 (§1, emit phiếu quyết toán sang Driver+ khi booking nguồn D+) + BR-STL-CRE-008 (§2.2). Đây là lần đầu file này nhắc tới Driver+ — trước đó gf-accounting hoàn toàn không có tích hợp bên ngoài liên quan D+. Đồng bộ FEAT-STL-CREATE v2, FEAT-SO-DETAIL v4 (gf-sales), BR-GF-SALES v2. | user (Business Authority) qua main agent |
| 2026-08-03 | **v3 — Fix F4 (BA-review round 1)**: CB-ACC-008 cột quan hệ boundary gỡ "indirect qua gf-sales" (tự mâu thuẫn với chính body rule) — làm rõ gf-accounting **tự phát hành trực tiếp** qua outbox/Kafka producer riêng (Critical Rule #7 boundary isolation), không route qua gf-sales. Đồng bộ BR-GF-SALES v3 (BR-BOOK-024 thu hẹp phạm vi tương ứng, loại trừ phiếu quyết toán). | user (Business Authority) qua main agent |
| 2026-08-11 | **v4 — Đồng bộ document sync theo ADR-031 và FEAT-STL-CREATE v7**: CB-ACC-008 gỡ `NEED CONFIRMATION`, chốt `DOCUMENT.SETTLEMENT.SYNC`, topic, ownership trực tiếp và `Document:DriverPlus`; BR-STL-CRE-008 bổ sung URL thay binary, cặp phiếu phát riêng và yêu cầu lưu chờ–tự động thử lại khi render/upload/send thất bại, không rollback nghiệp vụ và không tạo chứng từ trùng. | Business Authority qua main agent |
