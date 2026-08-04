---
type: business-rules
artifact_kind: business-rules
status: ACTIVE
version: 3
tier: T1
owner_authority: Business Authority
boundary: "gf-inventory"
last_reviewed: "2026-07-02"
supersedes: "none"
---

# Business Rules — gf-inventory

> Boundary này sở hữu domain: Phiếu nhập kho, Phiếu xuất kho, Tồn kho theo kỳ, Tồn kho.

---

## §1 Cross-boundary Rules

| # | Rule | Hướng | Boundary liên quan | Cơ chế |
|---|---|---|---|---|
| CB-001 | Khi gf-system phát event `BranchCreatedEvent` (topic `AC-DEV-BRANCH-LIFECYCLE`, MessageGroup=`BRANCH_LIFECYCLE`, MessageStep=`BRANCH_CREATED`), gf-inventory tự động tạo kho hàng mặc định cho chi nhánh. | Inbound event | `gf-system` | Kafka consumer + inbox dedup (`ProcessedEventEntity`) |
| CB-002 | Phiếu nhập kho nguồn **"Nền tảng"** tham chiếu đơn hàng mua từ `gf-purchase`. gf-inventory gọi REST `gf-purchase` để validate PO (`GET /protected/v1/purchase-orders/{code}/items`). | Outbound sync | `gf-purchase` | REST + x-api-key |
| CB-003 | Phiếu xuất kho liên kết phiếu dịch vụ từ `gf-sales`. Khi hoàn tất xuất kho, gf-inventory gọi REST `gf-sales` để đối soát SO (`GET /protected/v1/service-orders/{tenantId}/detail/{code}`). Kết quả trả cờ chênh lệch (không chặn). | Outbound sync | `gf-sales` | REST + x-api-key |
| CB-004 | `gf-inventory-worker` gọi internal REST API của gf-inventory để thực hiện: tạo/hoàn tất/hủy phiếu nhập/xuất kho, chốt kỳ tồn kho, expire/release reservation. | Inbound sync | `gf-inventory-worker` | REST + x-api-key (Temporal activities) |
| CB-005 | `gf-purchase` gọi internal REST để tra cứu product info, receipt summary theo PO code. `gf-sales` gọi internal REST để tra cứu delivery summary theo SO code. | Inbound sync | `gf-purchase`, `gf-sales` | REST + x-api-key |
| CB-006 | gf-inventory lưu outbox events (ReceiptCompleted, DeliveryCompleted, ReservationExpired, PeriodStockAdjusted, v.v.) vào outbox table. Outbox scheduler publish qua Kafka. | Outbound event | Kafka consumers | Transactional outbox |
| CB-007 | gf-inventory consume event `TenantProvisioned` từ topic `AC-DEV-TENANT-PROVISIONING` để cache subscription quota vào Redis. | Inbound event | `gf-system` | Kafka consumer + Redis cache |

---

## §2 Rules Registry

### 2.1 Phiếu nhập kho (BR-IR-001 .. BR-IR-018)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-IR-001 | Phiếu nhập kho khởi tạo ở trạng thái **"Chờ duyệt"** (PENDING). | Status Init | FEAT-IR-CREATE |
| BR-IR-002 | Mã phiếu nhập kho được hệ thống tự sinh theo sequence table `INVENTORY_RECEIPT`, unique per tenant (UK `tenant_id` + `receipt_code`). Không cho phép nhập thủ công. | Code Generation | FEAT-IR-CREATE |
| BR-IR-003 | Vòng đời trạng thái: **"Chờ duyệt"** -> **"Đã duyệt"** / **"Đã hủy"**; **"Đã duyệt"** -> **"Hoàn tác"**. Không có chuyển trạng thái nào khác. | Status Transition | FEAT-IR-DETAIL |
| BR-IR-004 | Chỉ phiếu ở trạng thái **"Chờ duyệt"** mới cho phép chỉnh sửa hoặc hủy. Phiếu ở trạng thái **"Đã duyệt"**, **"Hoàn tác"**, **"Đã hủy"** không thể chỉnh sửa. | Status Guard | FEAT-IR-EDIT, FEAT-IR-DETAIL, FEAT-IR-LIST |
| BR-IR-005 | Chỉ phiếu ở trạng thái **"Đã duyệt"** mới cho phép hoàn tác. | Status Guard | FEAT-IR-DETAIL |
| BR-IR-006 | Khi duyệt (hoàn tất) phiếu nhập kho: hệ thống tăng tồn kho theo từng dòng sản phẩm (số lượng + cập nhật giá vốn WAC). Danh sách sản phẩm phải không rỗng. | Stock Impact | FEAT-IR-DETAIL |
| BR-IR-007 | Khi hoàn tác phiếu nhập kho đã duyệt: hệ thống giảm tồn kho trở lại theo từng dòng sản phẩm. Nếu kỳ kho đã đóng (CLOSED), hệ thống tự động trigger điều chỉnh kỳ kho (period stock adjustment). | Stock Impact | FEAT-IR-DETAIL |
| BR-IR-008 | Hủy phiếu yêu cầu nhập lý do hủy. Lý do hủy bắt buộc, không cho phép bỏ trống. | Cancellation | FEAT-IR-DETAIL |
| BR-IR-009 | Nguồn nhập có 2 giá trị: **"Mua ngoài"** và **"Nền tảng"**. | Enum | FEAT-IR-CREATE, FEAT-IR-EDIT, FEAT-IR-LIST |
| BR-IR-010 | Nguồn nhập **"Nền tảng"** yêu cầu phải có mã đơn hàng liên kết. Số lượng nhập không được vượt quá số lượng đặt hàng từ đơn hàng tương ứng. | Validation | FEAT-IR-CREATE, FEAT-IR-EDIT |
| BR-IR-011 | Nguồn nhập **"Mua ngoài"** cho phép chỉnh sửa các trường sản phẩm (phân khúc, thông tin bổ sung). Không liên kết đơn hàng. | Validation | FEAT-IR-CREATE, FEAT-IR-EDIT |
| BR-IR-012 | Danh sách sản phẩm nhập kho phải có ít nhất 1 dòng sản phẩm với đầy đủ thông tin bắt buộc (tên, số lượng, đơn vị kho). | Validation | FEAT-IR-CREATE, FEAT-IR-EDIT |
| BR-IR-013 | Số lượng nhập >= 0. Tỷ lệ quy đổi > 0. Giá bán gợi ý >= 0. | Validation | FEAT-IR-CREATE, FEAT-IR-EDIT |
| BR-IR-014 | Số lượng sau quy đổi = Số lượng nhập x Tỷ lệ quy đổi. Tổng giá trị = tổng giá nhập tất cả dòng sản phẩm. | Calculation | FEAT-IR-CREATE, FEAT-IR-EDIT |
| BR-IR-015 | Chỉnh sửa phiếu không làm thay đổi trạng thái — phiếu giữ nguyên **"Chờ duyệt"** sau khi lưu. | Status Guard | FEAT-IR-EDIT |
| BR-IR-016 | In phiếu khả dụng ở tất cả trạng thái. | Permission | FEAT-IR-DETAIL |
| BR-IR-017 | Danh sách phiếu nhập kho luôn được phạm vi theo garage hiện tại (tenant isolation) — không hiển thị phiếu của garage khác. | Tenant Isolation | FEAT-IR-LIST |
| BR-IR-018 | Tìm kiếm từ khóa áp dụng đồng thời cho mã phiếu nhập kho và mã đơn hàng (PO). | Search | FEAT-IR-LIST |

### 2.2 Phiếu xuất kho (BR-ID-001 .. BR-ID-020)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-ID-001 | Phiếu xuất kho khởi tạo ở trạng thái **"Chờ duyệt"** (PENDING). | Status Init | FEAT-ID-CREATE |
| BR-ID-002 | Mã phiếu xuất kho được hệ thống tự sinh. Không cho phép nhập thủ công. | Code Generation | FEAT-ID-CREATE |
| BR-ID-003 | Vòng đời trạng thái: **"Chờ duyệt"** -> **"Đã duyệt"** / **"Đã hủy"**; **"Đã duyệt"** -> **"Hoàn tác"**. Không có chuyển trạng thái nào khác. | Status Transition | FEAT-ID-DETAIL |
| BR-ID-004 | Chỉ phiếu ở trạng thái **"Chờ duyệt"** mới cho phép chỉnh sửa hoặc hủy. | Status Guard | FEAT-ID-EDIT, FEAT-ID-DETAIL, FEAT-ID-LIST |
| BR-ID-005 | Chỉ phiếu ở trạng thái **"Đã duyệt"** mới cho phép hoàn tác. | Status Guard | FEAT-ID-DETAIL |
| BR-ID-006 | Khi hoàn tất xuất kho: hệ thống giảm tồn kho tương ứng với số lượng xuất của từng sản phẩm. | Stock Impact | FEAT-ID-DETAIL |
| BR-ID-007 | Khi hoàn tác phiếu xuất kho: hệ thống tăng tồn kho trở lại. Nếu kỳ kho đã đóng (CLOSED), hệ thống tự động trigger điều chỉnh kỳ kho. | Stock Impact | FEAT-ID-DETAIL |
| BR-ID-008 | Khi hoàn tất xuất kho có liên kết phiếu dịch vụ: hệ thống đối soát sản phẩm và số lượng giữa phiếu xuất và phiếu dịch vụ. SO phải tồn tại và chưa hủy. Nếu chênh lệch, trả cờ cảnh báo (mismatch flag) nhưng KHÔNG chặn thao tác. | Reconciliation | FEAT-ID-DETAIL |
| BR-ID-009 | Hủy phiếu yêu cầu nhập lý do hủy. Lý do hủy bắt buộc. | Cancellation | FEAT-ID-DETAIL |
| BR-ID-010 | Nguồn xuất có 2 giá trị: **"Mua ngoài"** và **"Nền tảng"**. | Enum | FEAT-ID-CREATE, FEAT-ID-EDIT, FEAT-ID-LIST |
| BR-ID-011 | Nguồn xuất và mã phiếu dịch vụ là trường bắt buộc khi tạo/chỉnh sửa phiếu xuất kho. | Validation | FEAT-ID-CREATE, FEAT-ID-EDIT |
| BR-ID-012 | Danh sách sản phẩm xuất kho phải có ít nhất 1 dòng sản phẩm với đầy đủ thông tin bắt buộc (tên, số lượng, đơn vị kho). | Validation | FEAT-ID-CREATE, FEAT-ID-EDIT |
| BR-ID-013 | Số lượng xuất >= 0. Giá vốn >= 0. | Validation | FEAT-ID-CREATE, FEAT-ID-EDIT |
| BR-ID-014 | Khi nguồn xuất là **"Nền tảng"**, số lượng xuất không được vượt quá số lượng đặt hàng. | Validation | FEAT-ID-CREATE, FEAT-ID-EDIT |
| BR-ID-015 | Tệp đính kèm tối đa 5 tệp, mỗi tệp không vượt quá 30 MB. | Validation | FEAT-ID-CREATE, FEAT-ID-EDIT |
| BR-ID-016 | Chỉnh sửa phiếu không làm thay đổi trạng thái — phiếu giữ nguyên **"Chờ duyệt"** sau lưu. | Status Guard | FEAT-ID-EDIT |
| BR-ID-017 | In phiếu khả dụng ở tất cả trạng thái. | Permission | FEAT-ID-DETAIL |
| BR-ID-018 | Danh sách phiếu xuất kho luôn được phạm vi theo garage hiện tại (tenant isolation). | Tenant Isolation | FEAT-ID-LIST |
| BR-ID-019 | Tìm kiếm từ khóa áp dụng đồng thời cho mã phiếu xuất kho và mã phiếu dịch vụ. | Search | FEAT-ID-LIST |
| BR-ID-020 | Tổng giá trị phiếu xuất = tổng (số lượng x giá vốn) của tất cả dòng sản phẩm. | Calculation | FEAT-ID-CREATE, FEAT-ID-EDIT |

### 2.3 Tồn kho theo kỳ (BR-IP-001 .. BR-IP-008)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-IP-001 | Dữ liệu tồn kho theo kỳ luôn được phạm vi theo garage hiện tại (tenant isolation). | Tenant Isolation | FEAT-IP-VIEW |
| BR-IP-002 | Giá vốn cuối kỳ tính theo phương pháp bình quân gia quyền (WAC): `closingCostPrice = (openingCost + receivedCost) / (openingQty + receivedQty)`. | Calculation | FEAT-IP-VIEW |
| BR-IP-003 | Tồn cuối kỳ = tồn đầu kỳ + nhập trong kỳ - xuất trong kỳ. | Calculation | FEAT-IP-VIEW |
| BR-IP-004 | COGS (giá vốn hàng xuất) = deliveredQty x closingCostPrice. | Calculation | FEAT-IP-VIEW |
| BR-IP-005 | Mỗi kỳ có trạng thái: **đang mở** (OPEN), **đã chốt** (CLOSED), **đã điều chỉnh** (ADJUSTED). Dữ liệu kỳ đã chốt là dữ liệu lịch sử, chỉ đọc. | Status | FEAT-IP-VIEW |
| BR-IP-006 | Chốt kỳ thực hiện bằng atomic close + create next period trong một transaction với idempotency key. Sử dụng native SQL cho scale (100M+ SKUs). | System | (internal) |
| BR-IP-007 | Khi hoàn tác phiếu nhập/xuất kho sau khi chốt kỳ, hệ thống tự động trigger điều chỉnh kỳ kho. Dữ liệu hiển thị phản ánh giá trị sau điều chỉnh. | Adjustment | FEAT-IP-VIEW |
| BR-IP-008 | Bộ lọc kỳ hiển thị danh sách tất cả các kỳ đã có (bao gồm kỳ đang mở và kỳ đã chốt). Tìm kiếm áp dụng đồng thời cho mã SKU và tên sản phẩm. | Search | FEAT-IP-VIEW |

### 2.4 Tồn kho & Giá bán (BR-STK-001 .. BR-STK-012)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-STK-001 | Tồn kho cho phép âm (negative stock) theo yêu cầu nghiệp vụ. Hiển thị giá trị âm bình thường, không cảnh báo, không chặn. (ref: BR-GF-INVENTORY-014) | Core Rule | FEAT-STK-LIST, FEAT-STK-DETAIL, FEAT-STK-ADJUST |
| BR-STK-002 | Số lượng đặt trước (reservedQuantity) là tracking marker only. KHÔNG trừ khỏi số lượng khả dụng (availableQuantity = quantity). | Core Rule | FEAT-STK-LIST, FEAT-STK-DETAIL |
| BR-STK-003 | Optimistic locking via @Version trên InventoryStock. Concurrent update sẽ bị reject. | Concurrency | (internal) |
| BR-STK-004 | Danh sách tồn kho luôn được phạm vi theo garage hiện tại (tenant isolation). | Tenant Isolation | FEAT-STK-LIST |
| BR-STK-005 | Tìm kiếm tồn kho áp dụng đồng thời cho tên phụ tùng và SKU. | Search | FEAT-STK-LIST |
| BR-STK-006 | Lịch sử xuất nhập hiển thị 3 loại giao dịch: nhập kho (RECEIPT), xuất kho (DELIVERY), điều chỉnh (ADJUSTMENT). | History | FEAT-STK-DETAIL |
| BR-STK-007 | Điều chỉnh tồn kho trực tiếp thay đổi quantity trên InventoryStock, tạo giao dịch ADJUSTMENT trong lịch sử. (ref: BR-GF-INVENTORY-015) | Stock Adjust | FEAT-STK-ADJUST |
| BR-STK-008 | Nếu kỳ kho hiện tại đã đóng (CLOSED), điều chỉnh tồn kho tự động trigger điều chỉnh kỳ kho (period stock adjustment). | Stock Adjust | FEAT-STK-ADJUST |
| BR-STK-009 | Lý do điều chỉnh bắt buộc nhập. Chênh lệch = 0 (thực tế = hiện tại) thì không cho phép xác nhận (nút disabled). | Validation | FEAT-STK-ADJUST |
| BR-STK-010 | Giá bán (sale price) là thuộc tính của tồn kho, khác với giá vốn (cost price) tính từ phiếu nhập kho. | Data Model | FEAT-STK-PRICE |
| BR-STK-011 | Giá bán >= 0. Giá bán = 0 hợp lệ (sản phẩm miễn phí/khuyến mãi). Giá bán có thể null (chưa thiết lập). | Validation | FEAT-STK-PRICE |
| BR-STK-012 | Cập nhật giá bán hàng loạt gửi batch request — tất cả sản phẩm trong batch phải cùng thành công hoặc cùng thất bại (atomic batch). | Batch Rule | FEAT-STK-PRICE |

### 2.5 Kho hàng (BR-WH-001 .. BR-WH-003)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-WH-001 | Kho hàng được tạo tự động khi tạo chi nhánh mới (BranchCreatedEvent). Không có chức năng tạo kho thủ công trên giao diện. (ref: BR-GF-INVENTORY-019) | Auto-creation | FEAT-WH-LIST |
| BR-WH-002 | Danh sách kho hàng luôn được phạm vi theo garage hiện tại (tenant isolation). | Tenant Isolation | FEAT-WH-LIST |
| BR-WH-003 | Mỗi chi nhánh có một kho hàng mặc định. Kho hàng chỉ có chức năng xem (view-only): không hỗ trợ tạo, sửa, xóa qua giao diện. | Constraint | FEAT-WH-LIST |

### 2.6 Hub điều hướng mobile (BR-INV-MENU-001 .. BR-INV-MENU-004) — mobile-only

> Hub "Quản lý kho hàng" trên app Garage (`FEAT-INV-MOBILE-MENU`). Web KHÔNG triển khai hub — dùng sidebar điều hướng tương ứng.

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-INV-MENU-001 | Thứ tự và nhãn 6 tile cố định theo Figma: **Sản phẩm** · **Nhóm vật tư** · **Phiếu nhập** · **Phiếu xuất** · **Tồn kho** · **Tồn đầu kỳ** (grid 2 cột, top → bottom, left → right). KHÔNG reorder, KHÔNG relabel — nhãn tile phải đồng bộ với nhãn sidebar web tương ứng để tránh user dual-platform confuse. | UI Constraint | FEAT-INV-MOBILE-MENU |
| BR-INV-MENU-002 | Tile chỉ render khi sub-module tương ứng đã GA — **ẨN HOÀN TOÀN** tile chưa GA. KHÔNG hiển thị placeholder, KHÔNG badge "Sắp ra mắt". Hub W03 render đúng 2 tile (Sản phẩm + Nhóm vật tư); W04 thêm Tồn đầu kỳ; W05 thêm Phiếu nhập + Phiếu xuất; W06 đủ 6 tile. *(BA decision 2026-06-29: hide-only strategy.)* | Tile Visibility | FEAT-INV-MOBILE-MENU |
| BR-INV-MENU-003 | Cả 2 vai trò (chủ garage + kế toán) thấy đầy đủ tile đã enable trên hub. Permission per sub-module gate **ở route đích** (vào sub-screen mới check role) — KHÔNG filter tile theo role tại lớp hub. | Permission | FEAT-INV-MOBILE-MENU |
| BR-INV-MENU-004 | Tap tile → push route tới màn list sub-module + preserve back stack. Back từ sub-module quay về hub (không nhảy về root). Hub là pure client-side navigation — KHÔNG gọi BFF, KHÔNG fetch data. | Navigation | FEAT-INV-MOBILE-MENU |

---

## §3 Status Transition Rules

### 3.1 Phiếu nhập kho Lifecycle

```
  ┌──────────────────┐
  │    Tạo mới       │
  │  (Create)        │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │   Chờ duyệt     │──────── Huỷ phiếu ──┐
  │  (PENDING)       │    [lý do bắt buộc] │
  └────────┬─────────┘                      │
           │                                │
      Hoàn tất nhập kho                     │
      [+stock, +WAC]                        │
           │                                │
           ▼                                ▼
  ┌──────────────────┐            ┌──────────────────┐
  │   Đã duyệt      │            │     Đã huỷ       │
  │  (COMPLETED)     │            │   (CANCELLED)    │
  └────────┬─────────┘            └──────────────────┘
           │
      Hoàn tác
      [-stock, period adjust nếu CLOSED]
      [lý do bắt buộc]
           │
           ▼
  ┌──────────────────┐
  │   Hoàn tác       │
  │  (REVERSED)      │
  └──────────────────┘
```

| Trạng thái hiện tại | Hành động | Trạng thái tiếp | Điều kiện | Tác động tồn kho |
|---|---|---|---|---|
| **"Chờ duyệt"** | Hoàn tất nhập kho | **"Đã duyệt"** | Danh sách sản phẩm non-empty | Cộng tồn kho + cập nhật giá vốn WAC |
| **"Chờ duyệt"** | Hủy phiếu | **"Đã hủy"** | Nhập lý do hủy bắt buộc | Không thay đổi tồn kho |
| **"Đã duyệt"** | Hoàn tác | **"Hoàn tác"** | Nhập lý do hoàn tác bắt buộc | Trừ tồn kho; trigger điều chỉnh kỳ nếu CLOSED |

**Actions theo trạng thái (ma trận nút):**

| Trạng thái | Chỉnh sửa | Hoàn tất | Hủy | Hoàn tác | In phiếu |
|---|---|---|---|---|---|
| **"Chờ duyệt"** | Co | Co | Co | An | Co |
| **"Đã duyệt"** | An | An | An | Co | Co |
| **"Hoàn tác"** | An | An | An | An | Co |
| **"Đã hủy"** | An | An | An | An | Co |

> Co = Co the thao tac (hien thi); An = An (khong hien thi)

### 3.2 Phiếu xuất kho Lifecycle

```
  ┌──────────────────┐
  │    Tạo mới       │
  │  (Create)        │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │   Chờ duyệt     │──────── Huỷ phiếu ──┐
  │  (PENDING)       │    [lý do bắt buộc] │
  └────────┬─────────┘                      │
           │                                │
      Hoàn tất xuất kho                     │
      [-stock, SO reconcile]                │
           │                                │
           ▼                                ▼
  ┌──────────────────┐            ┌──────────────────┐
  │   Đã duyệt      │            │     Đã huỷ       │
  │  (COMPLETED)     │            │   (CANCELLED)    │
  └────────┬─────────┘            └──────────────────┘
           │
      Hoàn tác
      [+stock, period adjust nếu CLOSED]
           │
           ▼
  ┌──────────────────┐
  │   Hoàn tác       │
  │  (REVERSED)      │
  └──────────────────┘
```

| Trạng thái hiện tại | Hành động | Trạng thái tiếp | Điều kiện | Tác động tồn kho |
|---|---|---|---|---|
| **"Chờ duyệt"** | Hoàn tất xuất kho | **"Đã duyệt"** | Danh sách sản phẩm non-empty; SO validate (mismatch = warning only) | Trừ tồn kho |
| **"Chờ duyệt"** | Hủy phiếu | **"Đã hủy"** | Nhập lý do hủy bắt buộc | Không thay đổi tồn kho |
| **"Đã duyệt"** | Hoàn tác | **"Hoàn tác"** | Nhập lý do hoàn tác bắt buộc | Cộng lại tồn kho; trigger điều chỉnh kỳ nếu CLOSED |

**Actions theo trạng thái (ma trận nút):**

| Trạng thái | Chỉnh sửa | Hoàn tất | Hủy | Hoàn tác | In phiếu | Tạo phiếu |
|---|---|---|---|---|---|---|
| **"Chờ duyệt"** | Co | Co | Co | An | Co | Co |
| **"Đã duyệt"** | An | An | An | Co | Co | Co |
| **"Hoàn tác"** | An | An | An | An | Co | Co |
| **"Đã hủy"** | An | An | An | An | Co | Co |

### 3.3 Kỳ tồn kho Lifecycle

```
  ┌──────────────────┐
  │   Đang mở        │
  │  (OPEN)          │
  └────────┬─────────┘
           │
      Chốt kỳ (atomic close)
      [WAC calculation, snapshot]
           │
           ▼
  ┌──────────────────┐
  │   Đã chốt       │
  │  (CLOSED)        │
  └────────┬─────────┘
           │
      Điều chỉnh (reverse receipt/delivery)
           │
           ▼
  ┌──────────────────┐
  │   Đã điều chỉnh  │
  │  (ADJUSTED)      │
  └──────────────────┘
```

| Trạng thái | Hành động | Trạng thái tiếp | Trigger |
|---|---|---|---|
| **Đang mở** | Chốt kỳ | **Đã chốt** | Temporal PeriodClosureWorkflow (gf-inventory-worker) |
| **Đã chốt** | Điều chỉnh | **Đã điều chỉnh** | Hoàn tác phiếu nhập/xuất hoặc điều chỉnh tồn kho |

---

## §4 Permission Rules

Trong module gf-inventory, cả hai actor (garage-owner, accountant) có quyền tương đương. Không có ngoại lệ phân quyền.

| Action | Chủ garage (garage-owner) | Kế toán (accountant) | Điều kiện |
|---|---|---|---|
| Xem danh sách phiếu nhập kho | Co | Co | Tenant-scoped |
| Tạo phiếu nhập kho | Co | Co | -- |
| Chỉnh sửa phiếu nhập kho | Co | Co | Phiếu trạng thái **"Chờ duyệt"** |
| Duyệt (hoàn tất) phiếu nhập kho | Co | Co | Phiếu trạng thái **"Chờ duyệt"** |
| Hủy phiếu nhập kho | Co | Co | Phiếu trạng thái **"Chờ duyệt"**, nhập lý do |
| Hoàn tác phiếu nhập kho | Co | Co | Phiếu trạng thái **"Đã duyệt"**, nhập lý do |
| In phiếu nhập kho | Co | Co | Tất cả trạng thái |
| Xuất file danh sách nhập kho | Co | Co | -- |
| Xem danh sách phiếu xuất kho | Co | Co | Tenant-scoped |
| Tạo phiếu xuất kho | Co | Co | -- |
| Chỉnh sửa phiếu xuất kho | Co | Co | Phiếu trạng thái **"Chờ duyệt"** |
| Duyệt (hoàn tất) phiếu xuất kho | Co | Co | Phiếu trạng thái **"Chờ duyệt"** |
| Hủy phiếu xuất kho | Co | Co | Phiếu trạng thái **"Chờ duyệt"**, nhập lý do |
| Hoàn tác phiếu xuất kho | Co | Co | Phiếu trạng thái **"Đã duyệt"**, nhập lý do |
| In phiếu xuất kho | Co | Co | Tất cả trạng thái |
| Xuất file danh sách xuất kho | Co | Co | -- |
| Xem tồn kho theo kỳ | Co | Co | Tenant-scoped |
| Xem danh sách tồn kho | Co | Co | Tenant-scoped |
| Xem chi tiết tồn kho | Co | Co | Tenant-scoped |
| Điều chỉnh tồn kho | Co | Co | Nhập lý do, chênh lệch khác 0 |
| Cập nhật giá bán | Co | Co | -- |
| Xem danh sách kho hàng | Co | Co | Tenant-scoped |

---

## §5 Validation Rules

### 5.1 Phiếu nhập kho

| Trường | Rule | Thông báo lỗi | Features |
|---|---|---|---|
| Nguồn nhập | Bắt buộc | **"Vui lòng chọn nguồn."** | FEAT-IR-CREATE, FEAT-IR-EDIT |
| Mã đơn hàng | Bắt buộc | **"Vui lòng nhập mã đơn hàng."** | FEAT-IR-CREATE, FEAT-IR-EDIT |
| Mã lô hàng | Không bắt buộc | -- | FEAT-IR-CREATE, FEAT-IR-EDIT |
| Danh sách sản phẩm | >= 1 dòng | **"Vui lòng thêm ít nhất một sản phẩm."** | FEAT-IR-CREATE, FEAT-IR-EDIT |
| Sản phẩm — thông tin bắt buộc | Tên + Số lượng + Đơn vị kho | **"Vui lòng nhập đầy đủ thông tin sản phẩm (tên, số lượng, đơn vị kho)."** | FEAT-IR-CREATE, FEAT-IR-EDIT |
| Số lượng nhập | >= 0, bắt buộc | **"Vui lòng nhập số lượng."** / **"Số lượng phải lớn hơn hoặc bằng 0."** | FEAT-IR-CREATE, FEAT-IR-EDIT |
| Số lượng nhập (nguồn Nền tảng) | <= số lượng đặt hàng | **"Số lượng nhập không được vượt quá số lượng đặt hàng."** | FEAT-IR-CREATE, FEAT-IR-EDIT |
| Đơn vị kho | Bắt buộc | **"Vui lòng nhập đơn vị kho."** | FEAT-IR-CREATE, FEAT-IR-EDIT |
| Tỷ lệ quy đổi | > 0 | **"Vui lòng nhập tỷ lệ quy đổi lớn hơn 0"** | FEAT-IR-CREATE, FEAT-IR-EDIT |
| Giá bán gợi ý | >= 0 | **"Vui lòng nhập giá đề xuất lớn hơn hoặc bằng 0"** | FEAT-IR-CREATE, FEAT-IR-EDIT |
| Lý do hủy | Bắt buộc khi hủy | (modal) | FEAT-IR-DETAIL |
| Lý do hoàn tác | Bắt buộc khi hoàn tác | (modal) | FEAT-IR-DETAIL |
| Tệp đính kèm | Hỗ trợ .doc, .jpeg, .png, .xlsx, .pdf | -- | FEAT-IR-CREATE, FEAT-IR-EDIT |

### 5.2 Phiếu xuất kho

| Trường | Rule | Thông báo lỗi | Features |
|---|---|---|---|
| Nguồn xuất | Bắt buộc | **"Vui lòng chọn nguồn."** | FEAT-ID-CREATE, FEAT-ID-EDIT |
| Mã phiếu dịch vụ | Bắt buộc | **"Vui lòng nhập mã phiếu dịch vụ."** | FEAT-ID-CREATE, FEAT-ID-EDIT |
| Mã lô hàng | Không bắt buộc | -- | FEAT-ID-CREATE, FEAT-ID-EDIT |
| Ghi chú | Không bắt buộc | -- | FEAT-ID-CREATE, FEAT-ID-EDIT |
| Tệp đính kèm | Tối đa 5 tệp, 30MB/tệp | **"(Tối đa 5 tệp (30mb/tệp))"** | FEAT-ID-CREATE, FEAT-ID-EDIT |
| Danh sách sản phẩm | >= 1 dòng | **"Vui lòng thêm ít nhất một sản phẩm."** | FEAT-ID-CREATE, FEAT-ID-EDIT |
| Sản phẩm — thông tin bắt buộc | Tên + Số lượng + Đơn vị kho | **"Vui lòng nhập đầy đủ thông tin sản phẩm (tên, số lượng, đơn vị kho)."** | FEAT-ID-CREATE, FEAT-ID-EDIT |
| Số lượng xuất | >= 0, bắt buộc | **"Vui lòng nhập số lượng."** / **"Số lượng phải lớn hơn hoặc bằng 0."** | FEAT-ID-CREATE, FEAT-ID-EDIT |
| Số lượng xuất (nguồn Nền tảng) | <= số lượng đặt hàng | **"Số lượng xuất không được vượt quá số lượng đặt hàng."** | FEAT-ID-CREATE, FEAT-ID-EDIT |
| Đơn vị kho | Bắt buộc | **"Vui lòng nhập đơn vị kho."** | FEAT-ID-CREATE, FEAT-ID-EDIT |
| Giá vốn | >= 0, bắt buộc | **"Vui lòng nhập giá vốn."** / **"Vui lòng nhập giá vốn lớn hơn hoặc bằng 0"** | FEAT-ID-CREATE, FEAT-ID-EDIT |
| Lý do hủy | Bắt buộc khi hủy | (modal) | FEAT-ID-DETAIL |

### 5.3 Điều chỉnh tồn kho

| Trường | Rule | Thông báo lỗi | Features |
|---|---|---|---|
| Số lượng tồn thực tế | Bắt buộc; cho phép giá trị âm | Lỗi validation nếu trống | FEAT-STK-ADJUST |
| Lý do điều chỉnh | Bắt buộc | Lỗi validation nếu trống | FEAT-STK-ADJUST |
| Chênh lệch | Phải khác 0 | Nút xác nhận disabled nếu = 0 | FEAT-STK-ADJUST |

### 5.4 Giá bán

| Trường | Rule | Thông báo lỗi | Features |
|---|---|---|---|
| Giá bán | >= 0 hoặc null | Lỗi validation nếu < 0 | FEAT-STK-PRICE |
| Batch update | >= 1 sản phẩm chọn | Nút disabled nếu chưa chọn sản phẩm | FEAT-STK-PRICE |

---

## §6 Dependency Rules

### 6.1 Tồn kho âm (Negative Stock)

- **BR-GF-INVENTORY-014**: Tồn kho cho phép âm theo yêu cầu nghiệp vụ. Hệ thống không chặn hoàn tất xuất kho khi tồn kho không đủ. Hiển thị giá trị âm bình thường.
- **Impact**: Xuất kho, hoàn tác nhập kho, điều chỉnh tồn kho đều có thể dẫn đến tồn kho âm.
- **Lưu ý**: Không có cơ chế cảnh báo tồn kho âm trên giao diện (chỉ hiển thị giá trị).

### 6.2 Kho hàng tự động tạo từ BranchCreatedEvent

- **BR-GF-INVENTORY-019**: Khi `gf-system` phát event `BranchCreatedEvent`, consumer trong gf-inventory tự động tạo kho hàng mặc định cho chi nhánh mới.
- **Idempotency**: Inbox dedup qua `ProcessedEventEntity` — cùng event không xử lý lại.
- **Impact**: Nếu event chưa được xử lý (delay, lỗi), danh sách kho hàng sẽ trống.

### 6.3 Điều chỉnh tồn kho và Kỳ kho

- **BR-GF-INVENTORY-015**: Điều chỉnh tồn kho (stock adjustment) trực tiếp thay đổi quantity, tạo giao dịch ADJUSTMENT, và trigger điều chỉnh kỳ kho nếu kỳ đã đóng (CLOSED).
- **Tương tự**: Hoàn tác phiếu nhập kho (BR-IR-007) và hoàn tác phiếu xuất kho (BR-ID-007) cũng trigger điều chỉnh kỳ kho nếu kỳ đã đóng.

### 6.4 Reservation (tracking only)

- **BR-GF-INVENTORY-016**: Reservation có TTL 30 phút (ecommerce) / 3 phút (direct). Status: ACTIVE -> FULFILLED/EXPIRED/CANCELLED/RELEASED. Auto-expire qua gf-inventory-worker Temporal workflow.
- **Lưu ý quan trọng**: `reservedQuantity` trên InventoryStock là tracking marker only. Nó KHÔNG trừ khỏi số lượng khả dụng (`availableQuantity = quantity`).

### 6.5 Đối soát phiếu xuất kho vs phiếu dịch vụ

- **BR-GF-INVENTORY-012**: Khi hoàn tất xuất kho, hệ thống validate SO: SO phải tồn tại + chưa hủy + sản phẩm/số lượng khớp. Nếu không khớp, trả 200 với mismatch flag (KHÔNG trả 400).
- **Impact**: Chênh lệch không chặn hoàn tất xuất kho. Garage tự xử lý chênh lệch.

### 6.6 Feature flag Inventory:InventoryV2

- Toàn bộ API thuộc **Inventory V2** (Catalog + Kỳ kế toán + Tồn đầu kỳ + Phiếu nhập/xuất V2 + Tính giá + Báo cáo tồn/NXT/thẻ kho) được gate bởi feature flag **`Inventory:InventoryV2`** (class-level `@FeatureOn`). Tenant chưa enable → API trả 403; Web ẩn sidebar menu kho V2; Mobile ẩn tile hub "Quản lý kho hàng" + route tương ứng.
- **1 flag duy nhất** gate toàn bộ 6 epic V2 (W03–W06) — bật = mở cả bộ kho V2 cho tenant. (CR-1782974034: W03 Catalog thiếu flag, backfill trong W04.)
- *Lưu ý*: flag V1 cũ `INVENTORY_STOCK` (gate delivery/receipt/stock/period-stock baseline) **vẫn giữ song song** — V1 và V2 là 2 flag độc lập, V2 không thay thế V1.

---

## §7 Phan tich & De xuat

### 7.1 Conflict / Overlap detected

| # | Phat hien | Muc do | Chi tiet |
|---|---|---|---|
| CON-001 | **Phiếu nhập kho: "Mã đơn hàng" luôn bắt buộc** | Trung binh | FEAT-IR-CREATE AC-3 và FEAT-IR-EDIT AC-4 đều yêu cầu mã đơn hàng bắt buộc. Tuy nhiên, nguồn nhập **"Mua ngoài"** theo EP-INVENTORY-RECEIPT không liên kết đơn hàng. Mâu thuẫn: nếu nguồn **"Mua ngoài"** thì mã đơn hàng là gì? FEAT-IR-CREATE EC-3 ghi **"Nguồn Mua ngoài không liên kết đơn hàng"** nhưng AC-3 vẫn bắt buộc trường này. |
| CON-002 | **Hoàn tác phiếu xuất kho: thiếu lý do bắt buộc trong FEAT** | Thap | EP-INVENTORY-DELIVERY §3 ghi **"Huỷ phiếu yêu cầu nhập lý do"** nhưng không đề cập lý do hoàn tác. FEAT-ID-DETAIL AC-11 cũng không yêu cầu nhập lý do khi hoàn tác (chỉ nhắc modal xác nhận). So sánh: FEAT-IR-DETAIL AC-11 phiếu nhập kho YÊU CẦU nhập lý do hoàn tác. Cần xác nhận tính nhất quán. |
| CON-003 | **Phiếu nhập kho: tệp đính kèm không có giới hạn số lượng/kích thước** | Thap | FEAT-IR-CREATE AC-14 không nêu giới hạn tệp (chỉ nêu loại file hỗ trợ). Trong khi FEAT-ID-CREATE AC-9 phiếu xuất kho ghi rõ **"Tối đa 5 tệp (30mb/tệp)"**. Cần bổ sung giới hạn cho phiếu nhập kho. |

### 7.2 Missing rules

| # | Rule thiếu | Muc do | De xuat |
|---|---|---|---|
| MIS-001 | **Không có rule concurrency control cho chỉnh sửa phiếu** | Trung binh | FEAT-IR-EDIT EC-1 và FEAT-ID-EDIT EC-1 đề cập trường hợp phiếu bị người khác chuyển trạng thái trong lúc edit. Cần business rule rõ ràng: hệ thống sử dụng optimistic locking (version check) khi lưu chỉnh sửa. |
| MIS-002 | **Thiếu rule về giới hạn số lượng dòng sản phẩm tối đa** | Thap | Phiếu nhập/xuất kho cho phép **"thêm nhiều dòng sản phẩm"** nhưng không giới hạn tối đa. Cần xác nhận có giới hạn kỹ thuật hoặc nghiệp vụ không. |
| MIS-003 | **Thiếu rule về chốt kỳ tồn kho (FEAT riêng)** | Trung binh | EP-INVENTORY-PERIOD §7 Out of Scope ghi **"Chốt kỳ sẽ thuộc FEAT riêng"** nhưng chưa có FEAT nào. Hiện tại chốt kỳ là tác vụ hệ thống tự động (Temporal workflow). Cần xác nhận: có FEAT cho user trigger chốt kỳ thủ công không? |
| MIS-004 | **Thiếu rule về xuất file cho tồn kho theo kỳ** | Thap | FEAT-IP-VIEW §7 Out of Scope ghi **"Xuất file báo cáo tồn kho theo kỳ: sẽ thuộc FEAT riêng nếu có yêu cầu"**. Trong khi FEAT-IR-LIST và FEAT-ID-LIST đều có chức năng xuất file. |
| MIS-005 | **Thiếu rule về xóa kho hàng hoặc vô hiệu hóa kho** | Thap | FEAT-WH-LIST §7 ghi **"Tạo, sửa, xóa kho hàng — không có API hỗ trợ"**. Cần xác nhận: khi chi nhánh bị đóng/xóa, kho hàng tương ứng xử lý thế nào? |
| MIS-006 | **Thiếu rule về duplicate sản phẩm trong phiếu** | Thap | Không có rule nào cấm thêm cùng sản phẩm (cùng SKU) nhiều lần trong một phiếu nhập/xuất. Cần xác nhận hành vi: cho phép hay gộp? |
| MIS-007 | **Thiếu rule giá nhập (costPrice) trên phiếu nhập kho** | Thap | FEAT-IR-CREATE có cột **"Giá nhập"** nhưng không có validation rule cho trường này (không có thông báo lỗi nếu bỏ trống hoặc giá trị âm). So sánh: phiếu xuất kho có validation rõ ràng cho **"Giá vốn"** (>= 0, bắt buộc). |

### 7.3 De xuat cai tien

| # | De xuat | Ly do |
|---|---|---|
| IMP-001 | **Bổ sung cảnh báo khi tồn kho sắp/đã âm**: Hiện tại negative stock cho phép nhưng không có bất kỳ cảnh báo nào. Đề xuất thêm cảnh báo (warning, không chặn) khi xuất kho dẫn đến tồn kho âm. | Giảm rủi ro sai sót nghiệp vụ khi garage xuất quá số lượng thực tế. |
| IMP-002 | **Thống nhất lý do hoàn tác cho phiếu xuất kho**: Phiếu nhập kho yêu cầu nhập lý do khi hoàn tác (FEAT-IR-DETAIL AC-11). Phiếu xuất kho nên có yêu cầu tương tự để đảm bảo truy vết. | Nhất quán nghiệp vụ và hỗ trợ audit trail. |
| IMP-003 | **Bổ sung giới hạn tệp đính kèm cho phiếu nhập kho**: Thống nhất với phiếu xuất kho (tối đa 5 tệp, 30MB/tệp). | Tránh tải lên không kiểm soát, nhất quán UX. |
| IMP-004 | **Làm rõ trường "Mã đơn hàng" cho nguồn "Mua ngoài"**: Nên chuyển thành conditional required — chỉ bắt buộc khi nguồn nhập là **"Nền tảng"**. | Loại bỏ mâu thuẫn giữa AC-3 và EC-3 trong FEAT-IR-CREATE. |
| IMP-005 | **Bổ sung validation giá nhập (costPrice) cho phiếu nhập kho**: Tương tự giá vốn trên phiếu xuất kho (>= 0, bắt buộc). | Đảm bảo dữ liệu đầu vào đầy đủ cho tính toán WAC. |

---

## Change Log

| Date | Summary | Author |
|---|---|---|
| 2026-05-20 | Khoi tao BR-GF-INVENTORY: 61 business rules tu 4 EP va 14 FEAT. 5 domain: phieu nhap kho (18 BR), phieu xuat kho (20 BR), ton kho theo ky (8 BR), ton kho & gia ban (12 BR), kho hang (3 BR). Cross-boundary rules (7 CB). Phat hien 3 conflicts, 7 missing rules, 5 de xuat cai tien. | Business Authority |
| 2026-06-29 | v2 — Thêm §2.6 BR-INV-MENU-001..004 (4 BR, mobile-only) cho FEAT-INV-MOBILE-MENU mới. BR-INV-MENU-001 fix thứ tự + label 6 tile (đồng bộ sidebar web). BR-INV-MENU-002 enforce ẨN HOÀN TOÀN tile chưa GA (no badge — BA decision 2026-06-29). BR-INV-MENU-003 quyền: cả 2 role thấy đủ tile (gate ở route đích, không ở hub). BR-INV-MENU-004 navigation: client-only push route + preserve back stack, hub KHÔNG gọi BFF. Bump version 1→2, last_reviewed 2026-05-20→2026-06-29. | Business Authority |
| 2026-07-02 | v3 — §6.6 đổi `INVENTORY_STOCK` → **`Inventory:InventoryV2`**: 1 flag duy nhất gate toàn bộ 6 epic Inventory V2 (W03–W06). Tenant chưa enable → API 403 + Web ẩn sidebar + Mobile ẩn tile hub. Flag V1 `INVENTORY_STOCK` giữ song song (độc lập V2). Ref CR-1782974034. | Business Authority |
