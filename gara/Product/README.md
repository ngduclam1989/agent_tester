---
type: product-index
artifact_kind: product-index
status: ACTIVE
version: 15
tier: T0
owner_authority: Business Authority
last_reviewed: "2026-07-08"
supersedes: "none"
---

# Product Index — Garage (Garage Care)

> Entry point cho toàn bộ Product layer. File này là **bảng index** — không chứa spec.
>
> Brownfield baseline: 15/15 epics + 79/79 features đã production. Tài liệu Product là **document hệ thống đang chạy**, làm input cho phát triển feature mới + xử lý technical debt.
>
> **v7 (2026-06-15)**: scope hậu baseline `EP-INSURANCE-SETTLEMENT` (**6 FEAT**, PLANNED) — điều chỉnh BH trên SO (+ truyền phân bổ khi tạo phiếu QT), **panel phân bổ read-only trên màn Tạo phiếu QT** (FEAT-INS-STL-CREATE), chi tiết QT BH, hồ sơ BH versioning, widget công nợ Dashboard. Foundation đã production (không tính vào features): chọn bên thanh toán per dòng + luồng tạo phiếu QT cặp KH+BH + danh sách công ty BH (system-seeded). Tổng: **16 epics / 85 features / 10 UX flows / 10 BR files**.

---

## 1. Reading Order

1. **[PRD.md](PRD.md)** (T0) — vision, goals, success metrics, scope, 16 epics, 2 personas
2. **[BUSINESS-RULES.md](BUSINESS-RULES.md)** (T1) — cornerstone rules + cross-boundary + traceability
3. **[DESIGN-SOURCE-POLICY.md](DESIGN-SOURCE-POLICY.md)** (T1) — visual source rules (brownfield code + XOR mode cho new feature)
4. **[personas/*.md](personas/)** (T1) — 2 actor: chủ garage, kế toán
5. **[epics/EP-*.md](epics/)** (T2) — outcome + feature breakdown cho 16 epic
6. **[features/FEAT-*.md](features/)** (T2) — 85 feature spec với AC embedded
7. **[ux/UX-FLOW-*.md](ux/)** (T2) — 10 luồng UX end-to-end

---

## 2. PRD

| Artifact | Path | Status | Last reviewed |
|---|---|---|---|
| Product Requirements Document | [PRD.md](PRD.md) | DONE | 2026-05-27 |
| Business Rules Registry (index) | [BUSINESS-RULES.md](BUSINESS-RULES.md) | ACTIVE | 2026-05-27 |
| Design Source Policy | [DESIGN-SOURCE-POLICY.md](DESIGN-SOURCE-POLICY.md) | ACTIVE | 2026-05-27 |
| Business Rules per boundary (16 files: 9 baseline + 6 Inventory V2 + 1 epic) | [business-rules/](business-rules/) | ACTIVE | 2026-05-20 |
| Business Rules per epic (1 file — cross-boundary) | [business-rules/BR-EP-INSURANCE-SETTLEMENT.md](business-rules/BR-EP-INSURANCE-SETTLEMENT.md) | PLANNED | 2026-05-27 |
| Business Rules — Inventory Catalog V2 `[DRAFT/PROPOSED]` | [business-rules/BR-GF-INVENTORY-CATALOG.md](business-rules/BR-GF-INVENTORY-CATALOG.md) | ACTIVE | 2026-06-24 |
| Business Rules — Inventory Accounting Period `[DRAFT/PROPOSED]` | [business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md](business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md) | ACTIVE | 2026-06-03 |
| Business Rules — Inventory Opening Balance `[DRAFT/PROPOSED]` | [business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md](business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md) | ACTIVE | 2026-06-03 |
| Business Rules — Inventory Receipt V2 `[DRAFT/PROPOSED]` | [business-rules/BR-GF-INVENTORY-RECEIPT-V2.md](business-rules/BR-GF-INVENTORY-RECEIPT-V2.md) | ACTIVE | 2026-06-03 |
| Business Rules — Inventory Delivery V2 `[DRAFT/PROPOSED]` | [business-rules/BR-GF-INVENTORY-DELIVERY-V2.md](business-rules/BR-GF-INVENTORY-DELIVERY-V2.md) | ACTIVE | 2026-06-03 |
| Business Rules — Inventory Stock V2 `[DRAFT/PROPOSED]` | [business-rules/BR-GF-INVENTORY-STOCK-V2.md](business-rules/BR-GF-INVENTORY-STOCK-V2.md) | ACTIVE | 2026-06-03 |

---

## 3. Epic Log

> Đầy đủ outcome + feature mapping: xem [PRD.md §7.3](PRD.md#73-chi-tiết-từng-epic).

| Epic ID | Title | Boundary | Priority | Wave | Features | Status |
|---|---|---|---|---|---|---|
| [EP-FOUND](epics/EP-FOUND.md) | Nền tảng garage, tài khoản, chi nhánh & phân quyền | gf-hrms | P0 | 1 | 6 | DONE |
| [EP-CUSTOMER](epics/EP-CUSTOMER.md) | Quản lý khách hàng | gf-customer | P0 | 1 | 5 | DONE |
| [EP-VEHICLE](epics/EP-VEHICLE.md) | Xe & lịch sử xe | gf-customer | P0 | 1 | 2 | DONE |
| [EP-BOOKING](epics/EP-BOOKING.md) | Lịch hẹn & Driver+ | gf-sales | P0 | 1 | 8 | DONE |
| [EP-SERVICE-ORDER](epics/EP-SERVICE-ORDER.md) | Phiếu dịch vụ | gf-sales | P0 | 1 | 7 | DONE |
| [EP-SETTLEMENT](epics/EP-SETTLEMENT.md) | Quyết toán | gf-accounting | P0 | 1 | 3 | DONE |
| [EP-CATALOG](epics/EP-CATALOG.md) | Danh mục dịch vụ, nhà cung cấp & nhà xe | gf-erp-mdm + gf-system | P1 | 1 | 10 | DONE |
| [EP-INVENTORY-STOCK](epics/EP-INVENTORY-STOCK.md) | Tồn kho | gf-inventory | P1 | 1 | 5 | DONE |
| [EP-DASHBOARD](epics/EP-DASHBOARD.md) | Tổng quan hoạt động | gf-sales | P1 | 1 | 1 | DONE |
| [EP-PROCUREMENT](epics/EP-PROCUREMENT.md) | Mua hàng | gf-purchase | P1 | 2 | 10 | DONE |
| [EP-INVENTORY-RECEIPT](epics/EP-INVENTORY-RECEIPT.md) | Nhập kho | gf-inventory | P1 | 2 | 4 | DONE |
| [EP-INVENTORY-DELIVERY](epics/EP-INVENTORY-DELIVERY.md) | Xuất kho | gf-inventory | P1 | 2 | 4 | DONE |
| [EP-INVENTORY-PERIOD](epics/EP-INVENTORY-PERIOD.md) | Tồn kho theo kỳ | gf-inventory | P2 | 2 | 1 | DONE |
| [EP-SUPPORT](epics/EP-SUPPORT.md) | Hỗ trợ & phản hồi | agg-garage-graph | P2 | 2 | 2 | DONE |
| [EP-MARKETING](epics/EP-MARKETING.md) | Marketing & phân khúc khách hàng | gf-marketing | P2 | 2 | 11 | DONE |
| [EP-INSURANCE-SETTLEMENT](epics/EP-INSURANCE-SETTLEMENT.md) | Quyết toán bảo hiểm & hồ sơ bảo hiểm | gf-accounting + gf-sales (cross-boundary) | P1 | (post-baseline — NEED CONFIRMATION) | 6 | PLANNED |

**Tổng**: 16 epics · 85 features · 6 P0 + 7 P1 + 3 P2 (15 baseline DONE + 1 PLANNED hậu baseline)

### 3.1 Inventory V2 — Forward Design `[DRAFT/PROPOSED — chưa cutover]`

> Epic thiết kế hướng tới (to-be) cho rework phần kho V2 — **chưa thay** baseline ở trên. Các epic V2 còn lại sẽ bổ sung dần.

| Epic ID | Title | Boundary | Loại | Features | Status |
|---|---|---|---|---|---|
| [EP-INVENTORY-CATALOG](epics/EP-INVENTORY-CATALOG.md) | Danh mục vật tư kho (Mã SP nội bộ & Nhóm VTHH) | gf-inventory | Mới | 13 | DRAFT/PROPOSED |
| [EP-INVENTORY-ACCOUNTING-PERIOD](epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) | Kỳ kế toán & Tính giá xuất kho | gf-accounting | Mới | 10 (5 AP + 5 PRC) | DRAFT/PROPOSED |
| [EP-INVENTORY-OPENING-BALANCE](epics/EP-INVENTORY-OPENING-BALANCE.md) | Tồn đầu kỳ | gf-inventory | Mới | 4 | DRAFT/PROPOSED |
| [EP-INVENTORY-RECEIPT-V2](epics/EP-INVENTORY-RECEIPT-V2.md) | Nhập kho (V2) | gf-inventory | V2 | 7 (4 V2 + 3 mới) | DRAFT/PROPOSED |
| [EP-INVENTORY-DELIVERY-V2](epics/EP-INVENTORY-DELIVERY-V2.md) | Xuất kho (V2) | gf-inventory | V2 | 7 (4 V2 + 3 mới) | DRAFT/PROPOSED |
| [EP-INVENTORY-STOCK-V2](epics/EP-INVENTORY-STOCK-V2.md) | Báo cáo tồn kho (V2) — tồn đến ngày · NXT · thẻ kho | gf-inventory | V2 | 3 | DRAFT/PROPOSED |

---

## 4. Feature Index

> Bảng tóm tắt nhóm theo epic. Detail spec + AC nằm trong từng `features/FEAT-*.md`.

### 4.1 EP-FOUND — Nhân sự & tài khoản (6)

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-FND-EMP-LIST](features/FEAT-FND-EMP-LIST.md) | Danh sách nhân viên | P0 |
| [FEAT-FND-EMP-DETAIL](features/FEAT-FND-EMP-DETAIL.md) | Chi tiết nhân viên | P0 |
| [FEAT-FND-EMP-CREATE](features/FEAT-FND-EMP-CREATE.md) | Tạo nhân viên | P0 |
| [FEAT-FND-EMP-EDIT](features/FEAT-FND-EMP-EDIT.md) | Chỉnh sửa nhân viên | P1 |
| [FEAT-FND-EMP-STATUS](features/FEAT-FND-EMP-STATUS.md) | Quản lý trạng thái nhân viên | P1 |
| [FEAT-FND-EMP-SSO](features/FEAT-FND-EMP-SSO.md) | Quản lý tài khoản đăng nhập | P1 |

### 4.2 EP-CUSTOMER — Khách hàng (5)

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-CUST-LIST](features/FEAT-CUST-LIST.md) | Danh sách khách hàng | P0 |
| [FEAT-CUST-DETAIL](features/FEAT-CUST-DETAIL.md) | Chi tiết khách hàng | P0 |
| [FEAT-CUST-CREATE](features/FEAT-CUST-CREATE.md) | Tạo khách hàng | P0 |
| [FEAT-CUST-EDIT](features/FEAT-CUST-EDIT.md) | Chỉnh sửa khách hàng | P1 |
| [FEAT-CUST-IMPORT](features/FEAT-CUST-IMPORT.md) | Import khách hàng | P1 |

### 4.3 EP-VEHICLE — Xe & lịch sử (2)

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-VEH-LIST](features/FEAT-VEH-LIST.md) | Danh sách xe | P0 |
| [FEAT-VEH-DETAIL](features/FEAT-VEH-DETAIL.md) | Chi tiết xe | P0 |

### 4.4 EP-BOOKING — Lịch hẹn (8)

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-BOOK-LIST](features/FEAT-BOOK-LIST.md) | Danh sách lịch hẹn | P0 |
| [FEAT-BOOK-DETAIL](features/FEAT-BOOK-DETAIL.md) | Chi tiết lịch hẹn | P0 |
| [FEAT-BOOK-CREATE](features/FEAT-BOOK-CREATE.md) | Tạo lịch hẹn mới | P0 |
| [FEAT-BOOK-EDIT](features/FEAT-BOOK-EDIT.md) | Chỉnh sửa lịch hẹn | P1 |
| [FEAT-BOOK-CONFIRM](features/FEAT-BOOK-CONFIRM.md) | Xác nhận lịch hẹn | P0 |
| [FEAT-BOOK-ARRIVE](features/FEAT-BOOK-ARRIVE.md) | Xác nhận xe đã đến | P0 |
| [FEAT-BOOK-CANCEL](features/FEAT-BOOK-CANCEL.md) | Hủy lịch hẹn | P1 |
| [FEAT-BOOK-DECLINE](features/FEAT-BOOK-DECLINE.md) | Từ chối lịch hẹn | P1 |

### 4.5 EP-SERVICE-ORDER — Phiếu dịch vụ (7)

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-SO-LIST](features/FEAT-SO-LIST.md) | Danh sách phiếu dịch vụ | P0 |
| [FEAT-SO-CREATE](features/FEAT-SO-CREATE.md) | Tạo phiếu dịch vụ xe | P0 |
| [FEAT-SO-DETAIL](features/FEAT-SO-DETAIL.md) | Chi tiết phiếu dịch vụ xe | P0 |
| [FEAT-SO-EDIT](features/FEAT-SO-EDIT.md) | Chỉnh sửa phiếu dịch vụ xe | P0 |
| [FEAT-SO-SALE-CREATE](features/FEAT-SO-SALE-CREATE.md) | Tạo phiếu bán lẻ phụ tùng | P0 |
| [FEAT-SO-SALE-DETAIL](features/FEAT-SO-SALE-DETAIL.md) | Chi tiết phiếu bán lẻ | P0 |
| [FEAT-SO-SALE-EDIT](features/FEAT-SO-SALE-EDIT.md) | Chỉnh sửa phiếu bán lẻ | P0 |

### 4.6 EP-SETTLEMENT — Quyết toán (3)

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-STL-LIST](features/FEAT-STL-LIST.md) | Danh sách phiếu quyết toán | P0 |
| [FEAT-STL-CREATE](features/FEAT-STL-CREATE.md) | Tạo phiếu quyết toán | P0 |
| [FEAT-STL-DETAIL](features/FEAT-STL-DETAIL.md) | Chi tiết phiếu quyết toán | P0 |

### 4.7 EP-CATALOG — Danh mục (10)

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-CAT-SVC-LIST](features/FEAT-CAT-SVC-LIST.md) | Danh sách dịch vụ | P1 |
| [FEAT-CAT-SVC-CREATE](features/FEAT-CAT-SVC-CREATE.md) | Tạo dịch vụ | P1 |
| [FEAT-CAT-SVC-EDIT](features/FEAT-CAT-SVC-EDIT.md) | Chỉnh sửa dịch vụ | P1 |
| [FEAT-CAT-SUP-LIST](features/FEAT-CAT-SUP-LIST.md) | Danh sách nhà cung cấp | P1 |
| [FEAT-CAT-SUP-CREATE](features/FEAT-CAT-SUP-CREATE.md) | Tạo nhà cung cấp | P1 |
| [FEAT-CAT-SUP-EDIT](features/FEAT-CAT-SUP-EDIT.md) | Chỉnh sửa nhà cung cấp | P1 |
| [FEAT-CAT-TRANS-LIST](features/FEAT-CAT-TRANS-LIST.md) | Danh sách nhà xe liên kết | P1 |
| [FEAT-CAT-TRANS-CREATE](features/FEAT-CAT-TRANS-CREATE.md) | Tạo nhà xe liên kết | P1 |
| [FEAT-CAT-TRANS-EDIT](features/FEAT-CAT-TRANS-EDIT.md) | Chỉnh sửa nhà xe liên kết | P1 |
| [FEAT-CAT-TRANS-DELETE](features/FEAT-CAT-TRANS-DELETE.md) | Xóa nhà xe liên kết | P1 |

### 4.8 EP-INVENTORY-STOCK — Tồn kho (5)

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-STK-LIST](features/FEAT-STK-LIST.md) | Danh sách tồn kho | P1 |
| [FEAT-STK-DETAIL](features/FEAT-STK-DETAIL.md) | Chi tiết tồn kho | P1 |
| [FEAT-STK-ADJUST](features/FEAT-STK-ADJUST.md) | Điều chỉnh tồn kho | P1 |
| [FEAT-STK-PRICE](features/FEAT-STK-PRICE.md) | Cập nhật giá bán | P1 |
| [FEAT-WH-LIST](features/FEAT-WH-LIST.md) | Danh sách kho hàng | P1 |

### 4.9 EP-DASHBOARD — Tổng quan (1)

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-DASH-VIEW](features/FEAT-DASH-VIEW.md) | Tổng quan hoạt động | P1 |

### 4.10 EP-PROCUREMENT — Mua hàng (10)

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-QR-LIST](features/FEAT-QR-LIST.md) | Danh sách yêu cầu báo giá | P1 |
| [FEAT-QR-CREATE](features/FEAT-QR-CREATE.md) | Tạo yêu cầu báo giá | P1 |
| [FEAT-QR-DETAIL](features/FEAT-QR-DETAIL.md) | Chi tiết yêu cầu báo giá | P1 |
| [FEAT-PR-LIST](features/FEAT-PR-LIST.md) | Danh sách yêu cầu đặt hàng | P1 |
| [FEAT-PR-CREATE](features/FEAT-PR-CREATE.md) | Tạo yêu cầu đặt hàng | P1 |
| [FEAT-PR-DETAIL](features/FEAT-PR-DETAIL.md) | Chi tiết yêu cầu đặt hàng | P1 |
| [FEAT-PO-LIST](features/FEAT-PO-LIST.md) | Danh sách đơn hàng mua | P1 |
| [FEAT-PO-CREATE](features/FEAT-PO-CREATE.md) | Tạo đơn hàng mua | P1 |
| [FEAT-PO-DETAIL](features/FEAT-PO-DETAIL.md) | Chi tiết đơn hàng mua | P1 |
| [FEAT-PO-EDIT](features/FEAT-PO-EDIT.md) | Chỉnh sửa đơn hàng mua | P1 |

### 4.11 EP-INVENTORY-RECEIPT — Nhập kho (4)

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-IR-LIST](features/FEAT-IR-LIST.md) | Danh sách phiếu nhập kho | P1 |
| [FEAT-IR-CREATE](features/FEAT-IR-CREATE.md) | Tạo phiếu nhập kho | P1 |
| [FEAT-IR-DETAIL](features/FEAT-IR-DETAIL.md) | Chi tiết phiếu nhập kho | P1 |
| [FEAT-IR-EDIT](features/FEAT-IR-EDIT.md) | Chỉnh sửa phiếu nhập kho | P1 |

### 4.12 EP-INVENTORY-DELIVERY — Xuất kho (4)

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-ID-LIST](features/FEAT-ID-LIST.md) | Danh sách phiếu xuất kho | P1 |
| [FEAT-ID-CREATE](features/FEAT-ID-CREATE.md) | Tạo phiếu xuất kho | P1 |
| [FEAT-ID-DETAIL](features/FEAT-ID-DETAIL.md) | Chi tiết phiếu xuất kho | P1 |
| [FEAT-ID-EDIT](features/FEAT-ID-EDIT.md) | Chỉnh sửa phiếu xuất kho | P1 |

### 4.13 EP-INVENTORY-PERIOD — Tồn kho theo kỳ (1)

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-IP-VIEW](features/FEAT-IP-VIEW.md) | Tồn kho theo kỳ | P2 |

### 4.14 EP-SUPPORT — Hỗ trợ & phản hồi (2)

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-SUP-CHAT](features/FEAT-SUP-CHAT.md) | Chat hỗ trợ & chat theo xe | P2 |
| [FEAT-SUP-FEEDBACK](features/FEAT-SUP-FEEDBACK.md) | Gửi phản hồi | P2 |

### 4.15 EP-MARKETING — Marketing (11)

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-MKT-CAMP-LIST](features/FEAT-MKT-CAMP-LIST.md) | Danh sách chiến dịch | P2 |
| [FEAT-MKT-CAMP-CREATE](features/FEAT-MKT-CAMP-CREATE.md) | Tạo chiến dịch | P2 |
| [FEAT-MKT-CAMP-DETAIL](features/FEAT-MKT-CAMP-DETAIL.md) | Chi tiết chiến dịch | P2 |
| [FEAT-MKT-CAMP-EDIT](features/FEAT-MKT-CAMP-EDIT.md) | Chỉnh sửa chiến dịch | P2 |
| [FEAT-MKT-VOUC-LIST](features/FEAT-MKT-VOUC-LIST.md) | Danh sách voucher | P2 |
| [FEAT-MKT-VOUC-CREATE](features/FEAT-MKT-VOUC-CREATE.md) | Tạo voucher | P2 |
| [FEAT-MKT-VOUC-DETAIL](features/FEAT-MKT-VOUC-DETAIL.md) | Chi tiết voucher | P2 |
| [FEAT-MKT-VOUC-EDIT](features/FEAT-MKT-VOUC-EDIT.md) | Chỉnh sửa voucher | P2 |
| [FEAT-MKT-SEG-LIST](features/FEAT-MKT-SEG-LIST.md) | Danh sách phân khúc | P2 |
| [FEAT-MKT-SEG-CREATE](features/FEAT-MKT-SEG-CREATE.md) | Tạo phân khúc | P2 |
| [FEAT-MKT-SEG-DETAIL](features/FEAT-MKT-SEG-DETAIL.md) | Chi tiết phân khúc | P2 |

### 4.16 EP-INSURANCE-SETTLEMENT — Quyết toán bảo hiểm (6 features) — PLANNED hậu baseline

> Foundation (đã production, không thuộc danh sách): (1) chọn bên thanh toán BH/KH per dòng trên SO — EP-SERVICE-ORDER baseline; (2) **luồng tạo** phiếu quyết toán cặp KH+BH — EP-SETTLEMENT / FEAT-STL-CREATE baseline (phần mới: truyền phân bổ BH → gộp FEAT-INS-SO-ADJUSTMENT + hiển thị panel phân bổ read-only trên màn tạo → FEAT-INS-STL-CREATE, KHÔNG rebuild luồng tạo); (3) danh sách/dropdown công ty BH — system-seeded production (đã bỏ 3 features FEAT-INS-COMPANY-*).

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-INS-SO-ADJUSTMENT](features/FEAT-INS-SO-ADJUSTMENT.md) | Nhập & tính điều chỉnh BH trên SO + truyền phân bổ khi tạo phiếu QT | P1 |
| [FEAT-INS-STL-CREATE](features/FEAT-INS-STL-CREATE.md) | Hiển thị panel phân bổ BH (read-only) trên màn Tạo phiếu quyết toán (CR mở rộng FEAT-STL-CREATE) | P1 |
| [FEAT-INS-STL-DETAIL](features/FEAT-INS-STL-DETAIL.md) | Chi tiết phiếu quyết toán bảo hiểm | P1 |
| [FEAT-INS-DOSSIER-CREATE](features/FEAT-INS-DOSSIER-CREATE.md) | Tạo & quản lý hồ sơ bảo hiểm (4 tài liệu chuẩn) | P1 |
| [FEAT-INS-DOSSIER-VIEW](features/FEAT-INS-DOSSIER-VIEW.md) | Xem hồ sơ bảo hiểm đã xuất (read-only, versioning) | P1 |
| [FEAT-INS-DASH-DEBT](features/FEAT-INS-DASH-DEBT.md) | Widget công nợ bảo hiểm trên Dashboard | P1 |

### 4.V2 EP-INVENTORY-CATALOG — Danh mục vật tư kho (13) `[DRAFT/PROPOSED — chưa cutover]`

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-CAT-GRP-LIST](features/FEAT-CAT-GRP-LIST.md) | Danh sách nhóm vật tư hàng hóa | P1 |
| [FEAT-CAT-GRP-CREATE](features/FEAT-CAT-GRP-CREATE.md) | Tạo nhóm vật tư hàng hóa | P1 |
| [FEAT-CAT-GRP-DETAIL](features/FEAT-CAT-GRP-DETAIL.md) | Chi tiết nhóm vật tư hàng hóa | P1 |
| [FEAT-CAT-GRP-EDIT](features/FEAT-CAT-GRP-EDIT.md) | Chỉnh sửa nhóm vật tư hàng hóa | P1 |
| [FEAT-CAT-GRP-DELETE](features/FEAT-CAT-GRP-DELETE.md) | Xóa nhóm vật tư hàng hóa | P1 |
| [FEAT-CAT-PROD-LIST](features/FEAT-CAT-PROD-LIST.md) | Danh sách mã sản phẩm nội bộ | P1 |
| [FEAT-CAT-PROD-CREATE](features/FEAT-CAT-PROD-CREATE.md) | Tạo mã sản phẩm nội bộ | P1 |
| [FEAT-CAT-PROD-DETAIL](features/FEAT-CAT-PROD-DETAIL.md) | Chi tiết mã sản phẩm nội bộ | P1 |
| [FEAT-CAT-PROD-EDIT](features/FEAT-CAT-PROD-EDIT.md) | Chỉnh sửa mã sản phẩm nội bộ | P1 |
| [FEAT-CAT-PROD-DELETE](features/FEAT-CAT-PROD-DELETE.md) | Xóa mã sản phẩm nội bộ | P1 |
| [FEAT-CAT-PROD-IMPORT](features/FEAT-CAT-PROD-IMPORT.md) | Import danh mục mã sản phẩm nội bộ | P1 |
| [FEAT-CAT-PROD-EXPORT](features/FEAT-CAT-PROD-EXPORT.md) | Export danh mục mã sản phẩm nội bộ | P2 |
| [FEAT-INV-MOBILE-MENU](features/FEAT-INV-MOBILE-MENU.md) | Màn quản lý kho hàng — hub điều hướng mobile (6 tile, mobile-only) | P1 |

### 4.V2b EP-INVENTORY-ACCOUNTING-PERIOD — Kỳ kế toán & Tính giá xuất kho (10) `[DRAFT/PROPOSED — chưa cutover]`

> Nhóm Kỳ kế toán (AP, 5) + Tính giá xuất kho (PRC, 5) — đủ 10 feature.

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-AP-LIST](features/FEAT-AP-LIST.md) | Danh sách kỳ kế toán | P1 |
| [FEAT-AP-CREATE](features/FEAT-AP-CREATE.md) | Tạo kỳ kế toán | P1 |
| [FEAT-AP-DETAIL](features/FEAT-AP-DETAIL.md) | Chi tiết kỳ kế toán | P1 |
| [FEAT-AP-EDIT](features/FEAT-AP-EDIT.md) | Chỉnh sửa kỳ kế toán (gồm đóng/mở kỳ) | P1 |
| [FEAT-AP-DELETE](features/FEAT-AP-DELETE.md) | Xóa kỳ kế toán | P1 |
| [FEAT-PRC-LIST](features/FEAT-PRC-LIST.md) | Danh sách lịch sử tính giá xuất kho | P1 |
| [FEAT-PRC-CREATE](features/FEAT-PRC-CREATE.md) | Thực hiện tính giá xuất kho | P1 |
| [FEAT-PRC-DETAIL](features/FEAT-PRC-DETAIL.md) | Chi tiết lần tính giá xuất kho | P1 |
| [FEAT-PRC-RECALC](features/FEAT-PRC-RECALC.md) | Tính lại giá xuất kho | P1 |
| [FEAT-PRC-DELETE](features/FEAT-PRC-DELETE.md) | Xóa khoản mục lịch sử tính giá | P1 |

### 4.V2c EP-INVENTORY-OPENING-BALANCE — Tồn đầu kỳ (4) `[DRAFT/PROPOSED — chưa cutover]`

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-OB-LIST](features/FEAT-OB-LIST.md) | Danh sách tồn đầu kỳ | P1 |
| [FEAT-OB-IMPORT](features/FEAT-OB-IMPORT.md) | Import tồn đầu kỳ | P1 |
| [FEAT-OB-EDIT](features/FEAT-OB-EDIT.md) | Sửa dòng tồn đầu kỳ | P1 |
| [FEAT-OB-DELETE-LINES](features/FEAT-OB-DELETE-LINES.md) | Xóa dòng tồn đầu kỳ đã chọn | P1 |

### 4.V2d EP-INVENTORY-RECEIPT-V2 — Nhập kho V2 (7) `[DRAFT/PROPOSED — chưa cutover]`

> V2 của EP-INVENTORY-RECEIPT (V1 giữ baseline). 4 feature V2 (`-V2`) + 3 feature mới.

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-IR-LIST-V2](features/FEAT-IR-LIST-V2.md) | Danh sách phiếu nhập kho (V2) | P1 |
| [FEAT-IR-CREATE-V2](features/FEAT-IR-CREATE-V2.md) | Tạo phiếu nhập kho (V2) | P1 |
| [FEAT-IR-DETAIL-V2](features/FEAT-IR-DETAIL-V2.md) | Chi tiết phiếu nhập kho (V2) | P1 |
| [FEAT-IR-EDIT-V2](features/FEAT-IR-EDIT-V2.md) | Chỉnh sửa phiếu nhập kho (V2) | P1 |
| [FEAT-IR-DELETE](features/FEAT-IR-DELETE.md) | Xóa phiếu nhập kho | P1 |
| [FEAT-IR-PRINT](features/FEAT-IR-PRINT.md) | In phiếu nhập kho | P2 |
| [FEAT-IR-EXPORT](features/FEAT-IR-EXPORT.md) | Xuất excel danh sách phiếu nhập kho | P2 |

### 4.V2e EP-INVENTORY-DELIVERY-V2 — Xuất kho V2 (7) `[DRAFT/PROPOSED — chưa cutover]`

> V2 của EP-INVENTORY-DELIVERY (V1 giữ baseline). 4 feature V2 (`-V2`) + 3 feature mới.

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-ID-LIST-V2](features/FEAT-ID-LIST-V2.md) | Danh sách phiếu xuất kho (V2) | P1 |
| [FEAT-ID-CREATE-V2](features/FEAT-ID-CREATE-V2.md) | Tạo phiếu xuất kho (V2) | P1 |
| [FEAT-ID-DETAIL-V2](features/FEAT-ID-DETAIL-V2.md) | Chi tiết phiếu xuất kho (V2) | P1 |
| [FEAT-ID-EDIT-V2](features/FEAT-ID-EDIT-V2.md) | Chỉnh sửa phiếu xuất kho (V2) | P1 |
| [FEAT-ID-DELETE](features/FEAT-ID-DELETE.md) | Xóa phiếu xuất kho | P1 |
| [FEAT-ID-PRINT](features/FEAT-ID-PRINT.md) | In phiếu xuất kho | P2 |
| [FEAT-ID-EXPORT](features/FEAT-ID-EXPORT.md) | Xuất excel danh sách phiếu xuất kho | P2 |

### 4.V2f EP-INVENTORY-STOCK-V2 — Báo cáo tồn kho V2 (3) `[DRAFT/PROPOSED — chưa cutover]`

> V2 của EP-INVENTORY-STOCK (V1 giữ baseline). FEAT-IP-VIEW-V2 dời từ EP-INVENTORY-PERIOD sang. V2 không có điều chỉnh tồn.

| Feature ID | Title | Priority |
|---|---|---|
| [FEAT-STK-LIST-V2](features/FEAT-STK-LIST-V2.md) | Báo cáo tồn kho đến ngày | P1 |
| [FEAT-IP-VIEW-V2](features/FEAT-IP-VIEW-V2.md) | Báo cáo Nhập Xuất Tồn (NXT) | P1 |
| [FEAT-STK-DETAIL-V2](features/FEAT-STK-DETAIL-V2.md) | Xem lịch sử tồn kho (thẻ kho) | P1 |

---

## 5. Persona Inventory

| Persona | Type | Vai trò | Quyền hạn | File |
|---|---|---|---|---|
| Chủ garage (`garage-owner`) | PRIMARY | Quản lý toàn bộ hoạt động garage | Toàn quyền | [personas/garage-owner.md](personas/garage-owner.md) |
| Kế toán (`accountant`) | PRIMARY | Quản lý tài chính, công nợ, đối soát | Toàn quyền **ngoại trừ** chat theo xe (EP-SUPPORT) | [personas/accountant.md](personas/accountant.md) |

> Constraint C-2 (PRD §3): **chỉ 2 persona**, không tạo thêm vai trò mới.

---

## 6. UX Inventory

| UX Flow | Kind | Referenced Features | File |
|---|---|---|---|
| Lịch hẹn & tiếp nhận xe | FLOW | 8 FEAT (FEAT-BOOK-*) | [ux/UX-FLOW-BOOKING.md](ux/UX-FLOW-BOOKING.md) |
| Tiếp nhận, sửa chữa xe | FLOW | 4 FEAT (FEAT-SO-LIST/CREATE/DETAIL/EDIT) | [ux/UX-FLOW-SERVICE-REPAIR.md](ux/UX-FLOW-SERVICE-REPAIR.md) |
| Bán lẻ phụ tùng | FLOW | 4 FEAT (FEAT-SO-SALE-* + LIST) | [ux/UX-FLOW-RETAIL.md](ux/UX-FLOW-RETAIL.md) |
| Thanh toán, ghi nhận công nợ | FLOW | 3 FEAT (FEAT-STL-*) | [ux/UX-FLOW-PAYMENT.md](ux/UX-FLOW-PAYMENT.md) |
| Mua hàng qua sàn | FLOW | 10 FEAT (FEAT-QR/PR/PO-*) | [ux/UX-FLOW-PROCUREMENT.md](ux/UX-FLOW-PROCUREMENT.md) |
| Nhập kho | FLOW | 4 FEAT (FEAT-IR-*) | [ux/UX-FLOW-INVENTORY-RECEIPT.md](ux/UX-FLOW-INVENTORY-RECEIPT.md) |
| Xuất kho | FLOW | 4 FEAT (FEAT-ID-*) | [ux/UX-FLOW-INVENTORY-DELIVERY.md](ux/UX-FLOW-INVENTORY-DELIVERY.md) |
| Tồn kho theo kỳ | FLOW | 1 FEAT (FEAT-IP-VIEW) | [ux/UX-FLOW-INVENTORY-COUNT.md](ux/UX-FLOW-INVENTORY-COUNT.md) |
| Tồn kho | FLOW | 5 FEAT (FEAT-STK-* + FEAT-WH-LIST) | [ux/UX-FLOW-INVENTORY-STOCK.md](ux/UX-FLOW-INVENTORY-STOCK.md) |
| Quyết toán bảo hiểm, hồ sơ BH & công nợ BH | FLOW | 6 FEAT (FEAT-INS-*) | [ux/UX-FLOW-INSURANCE-SETTLEMENT.md](ux/UX-FLOW-INSURANCE-SETTLEMENT.md) |

> Visual source: xem [DESIGN-SOURCE-POLICY.md](DESIGN-SOURCE-POLICY.md). Brownfield baseline = production code trong `garage-functions/gf-gms-web/` và `garage-functions/garage-mobile/`.

---

## 7. Cross-references

| Cần tra cứu | Đi đến |
|---|---|
| Tech stack, versions, libraries | [Architecture/TECHSTACK.md](../Architecture/TECHSTACK.md) |
| Service boundary ownership, write access | [Execution/SERVICE-BOUNDARY-MATRIX.md](../Execution/SERVICE-BOUNDARY-MATRIX.md) |
| C4 diagrams, communication patterns | [Architecture/SYSTEM-ARCHITECTURE.md](../Architecture/SYSTEM-ARCHITECTURE.md) |
| Knowledge graph per boundary | [Execution/knowledge-graphs/](../Execution/knowledge-graphs/) |
| Architecture decisions (12 ADRs) | [Architecture/decisions/](../Architecture/decisions/) |
| GraphQL mapping FE/Mobile → BFF | [Architecture/integrations/INTEG-FE-*.md, INTEG-MOB-*.md](../Architecture/integrations/) |
| Roadmap, TD remediation waves | [Plan/ROADMAP.md](../Plan/ROADMAP.md), [Plan/WAVE-SEQUENCE.md](../Plan/WAVE-SEQUENCE.md) |

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-15 | 7 | Business Authority + Senior PM | **Tái lập FEAT-INS-STL-CREATE** (scope mới: hiển thị panel phân bổ read-only trên màn Tạo phiếu QT, CR mở rộng FEAT-STL-CREATE — không rebuild). EP-INSURANCE-SETTLEMENT **5 → 6 features**; tổng **84 → 85 features**. Cập nhật §1 reading list (85 feature spec), §3 Epic Log (row count 5→6 + tổng 85), §4.16 Feature Index (thêm row + note foundation), §6 UX Inventory (5→6 FEAT). Đồng bộ EP v18, FEAT-INS-STL-CREATE v3. Flag: PRD §5.1/§7.3 + UX-FLOW + BR-EP (BR-INS-STL-CRE-009 đề xuất) cần đồng bộ sau. |
| 2026-05-27 | 1 | Business Authority | Khởi tạo Product index cho GMS Garage: 15 epics, 79 features, 2 personas, 9 UX flows, 9 BR per-boundary files (brownfield baseline) |
| 2026-05-27 | 2 | Business Authority | Bổ sung scope hậu baseline EP-INSURANCE-SETTLEMENT: +1 epic (PLANNED), +10 features (PLANNED), +1 UX flow (UX-FLOW-INSURANCE-SETTLEMENT), +1 BR file epic-scoped (BR-EP-INSURANCE-SETTLEMENT). Cập nhật tổng scope: 15→16 epics, 79→89 features, 9→10 UX flows, 9→10 BR files. Cập nhật §1 reading list (counts), §2 PRD table (thêm BR-EP file), §3 Epic Log (thêm row 16 + tổng kết priority), §4.16 Feature Index, §6 UX Inventory. |
| 2026-05-27 | 3 | Business Authority | Đánh dấu FEAT-INS-SO-PAYMENT-SOURCE = **BASELINE (đã production)** trong §4.16: chọn bên thanh toán per dòng đã có sẵn, không dev lần này. EP-INSURANCE-SETTLEMENT functional surface 10 features = 9 dev mới + 1 baseline. Tổng scope giữ nguyên. |
| 2026-05-27 | 4 | Business Authority | **Xoá FEAT-INS-SO-PAYMENT-SOURCE** (đã production). EP-INSURANCE-SETTLEMENT 10 → **9 features**; tổng PRD 89 → **88 features**. §4.16 gỡ row + thêm note foundation. Cập nhật §1 reading list + §3 Epic Log totals. Đồng bộ PRD v9, EP v6. |
| 2026-05-27 | 5 | Business Authority | **Xoá FEAT-INS-STL-CREATE** (tạo phiếu QT đã production; phần mới = truyền phân bổ BH gộp vào FEAT-INS-SO-ADJUSTMENT). EP-INSURANCE-SETTLEMENT 9 → **8 features**; tổng PRD 88 → **87 features**. §4.16 gỡ row + note foundation (thêm tạo phiếu QT). Cập nhật §1 + §3 Epic Log. Đồng bộ PRD v10, EP v8. |
| 2026-05-27 | 6 | Business Authority | **Xoá 3 features FEAT-INS-COMPANY-LIST/CREATE/EDIT** (danh sách công ty BH = system-seeded production). EP-INSURANCE-SETTLEMENT 8 → **5 features**; tổng PRD 87 → **84 features**. §4.16 gỡ 3 rows + note foundation (thêm danh sách công ty BH). Cập nhật §1 + §3 Epic Log. Đồng bộ PRD v12, EP v11. |
| 2026-06-12 | 7 | Business Authority | **Thêm FEAT-INS-STL-CREATE** (CR mở rộng màn Tạo phiếu quyết toán — hiển thị panel "Tổng giá dịch vụ" read-only). EP-INSURANCE-SETTLEMENT 5 → **6 features**; tổng **84 → 85 features**. Cập nhật §1 reading list (84→85), §3 Epic Log (row + tổng), §4.16 (header 6 + row + note foundation), §6 UX Inventory (5→6 FEAT). Đồng bộ FEAT-INS-STL-CREATE v1, EP v18, BR-EP v28, UX-FLOW v18. Tái tạo ID đã xoá ở v5 với scope khác (hiển thị panel, không rebuild luồng). |
| 2026-06-16 | 9 | Business Authority | Housekeeping: sửa số liệu cũ — §2 document registry dòng "Business Rules per boundary" ghi "(9 files)" stale → "(16 files: 9 baseline + 6 Inventory V2 + 1 epic)" cho khớp thực tế thư mục `business-rules/` (16 file). Không đụng nội dung khác. |
| 2026-06-12 | 8 | Business Authority | Additive (Inventory V2 forward design — gộp từ workstream kho): thêm §3.1 (bảng 6 epic EP-INVENTORY-* `[DRAFT/PROPOSED]`), 6 dòng BR-GF-INVENTORY-* vào §2 document registry, và §4.V2–4.V2f Feature Index (42 feature kho: 12 CATALOG + 10 AP/PRC + 3 OB + 7 IR + 7 ID + 3 STK). KHÔNG đụng baseline 16 epic/85 feature hay phần bảo hiểm. |
| 2026-06-16 | 10 | Business Authority | Gỡ con trỏ "Bối cảnh: `Plan/INVENTORY-V2-RULES.md`" khỏi §3.1 blockquote Inventory V2 forward-design (note file sắp xóa). |
| 2026-06-24 | 11 | Business Authority | Sync ngày `last_reviewed` của BR-GF-INVENTORY-CATALOG trong document-registry (2026-06-03 → 2026-06-24, khớp file thực tế v12) — rà soát wave 3. |
| 2026-06-29 | 12 | Business Authority | **Thêm FEAT-INV-MOBILE-MENU vào EP-INVENTORY-CATALOG** (hub điều hướng mobile "Quản lý kho hàng", mobile-only). §3 Epic Log: row EP-INVENTORY-CATALOG count 12→13. §4.V2: header "(12)" → "(13)" + thêm row FEAT-INV-MOBILE-MENU P1. Hub render grid 2 cột tối đa 6 tile xuyên W03–W06. **BA decisions 2026-06-29**: (a) tile chưa ship ẨN HOÀN TOÀN không badge (W03 chỉ render 2 tile); (b) gom vào EP-INVENTORY-CATALOG ship W03; (c) cả 2 role thấy đủ tile (gate ở route đích); (d) header "Quản lý kho hàng" verbatim Figma. Web KHÔNG có FEAT tương ứng. Đồng bộ EP v7, UX-FLOW v10, BR-GF-INVENTORY v2 (4 BR-INV-MENU mới), figma-links.yaml W03 (entry pending Figma node-id). NEED CONFIRMATION: Figma URL + node-id màn hub + điểm vào hub trên app. |
| 2026-07-07 | 13 | Business Authority + Senior PM | **Sync boundary EP-INVENTORY-ACCOUNTING-PERIOD**: §3 Epic Log row 84 cột Boundary `gf-inventory` → `gf-accounting` (Kỳ kế toán + Tính giá xuất kho BQGQ thuộc nghiệp vụ kế toán, khớp SAP FI-CO / Misa / Fast / Odoo). Đồng bộ EP v16 + 10 FEAT (5 AP + 5 PRC v-mới) + BR-GF-INVENTORY-ACCOUNTING-PERIOD v24 (giữ tên file legacy). OB + Sổ tồn giữ ở gf-inventory. §4.V2b Feature Index không đụng (không ghi boundary explicit). Consistency check pass: EP + 10 FEAT + BR + README Epic Log đều gf-accounting. |
| 2026-07-08 | 14 | Business Authority (quannn) + main agent | **P1-4 fix EP-OB count 3→4 + thêm row FEAT-OB-EDIT** (audit W04 P1-4 2026-07-08). EP-INVENTORY-OPENING-BALANCE v4 đã thêm `FEAT-OB-EDIT` (2026-07-02, sửa dòng OB từ icon ✏️ trên list) nhưng README §3 Epic Log + §4.V2c header + §4.V2c row list vẫn ghi 3 FEAT. Cascade 2 chỗ: (1) §3 row 85 count `3` → `4`; (2) §4.V2c heading "(3)" → "(4)" + insert row `[FEAT-OB-EDIT](features/FEAT-OB-EDIT.md) | Sửa dòng tồn đầu kỳ | P1` giữa IMPORT và DELETE-LINES. Consistency: 4 FEAT OB khớp EP-OB v4 + PKG-W04 §2.1 (list 10 FEAT W04 gồm 4 OB) + BR-GF-INVENTORY-OPENING-BALANCE có BR-OB-EDIT-*. |
| 2026-07-08 | 15 | Business Authority (quannn) + main agent | **Gọn title FEAT-OB-LIST "Danh sách tồn đầu kỳ đã import" → "Danh sách tồn đầu kỳ"** (cascade FEAT-OB-LIST v6). §4.V2c row FEAT-OB-LIST title. Lý do: BA quannn 2026-07-08 quyết định label đã hiển thị dữ liệu tồn đầu kỳ là đủ ngữ cảnh — bỏ hàm nghĩa "đã import". |
