---
type: product
artifact_kind: prd
status: DONE
version: 18
tier: T0
owner_authority: Business Authority
last_reviewed: "2026-07-08"
---

# PRD — Garage (Garage Care)

> Hệ thống quản lý garage ô tô phục vụ thị trường Việt Nam.

---

## 1. Vision & Problem

### 1.1 Problem Statement

Các garage ô tô tại Việt Nam đang vận hành bằng nhiều công cụ rời rạc — sổ sách, Excel, phần mềm kế toán riêng, nhóm Zalo — dẫn đến:

- **Phân tán dữ liệu**: thông tin khách hàng, lịch sử sửa chữa, tồn kho nằm ở nhiều nơi, khó tra cứu và đối chiếu.
- **Thiếu kiểm soát quy trình**: từ tiếp nhận xe đến quyết toán không có luồng liền mạch, dễ sai sót và bỏ sót.
- **Khó mở rộng**: khi garage tăng khối lượng công việc hoặc mở thêm chi nhánh, công cụ thủ công không theo kịp.
- **Thiếu dữ liệu ra quyết định**: không có dashboard tổng quan, không biết doanh thu thực tế, công nợ tồn đọng hay hiệu suất sửa chữa.

### 1.2 Vision

**Garage Care** — bao gồm **Web GMS** (dành cho máy tính) và **App Garage** (dành cho di động) — là hệ thống quản lý garage ô tô duy nhất mà garage cần. Từ lịch hẹn, phiếu dịch vụ, mua hàng, tồn kho, khách hàng đến quyết toán — tất cả trên một nền tảng, liên thông dữ liệu realtime.

Garage Care giúp garage:
- Vận hành chuyên nghiệp, giảm sai sót, tăng năng suất.
- Kiểm soát tài chính: doanh thu, chi phí, công nợ minh bạch.
- Chăm sóc khách hàng chủ động: lịch sử xe, marketing, ưu đãi.
- Ra quyết định dựa trên dữ liệu thực tế.

---

## 2. Goals & Success Metrics

### 2.1 Goals

| # | Goal | Mô tả |
|---|---|---|
| G-1 | Số hóa toàn bộ quy trình vận hành | Từ tiếp nhận xe → sửa chữa → quyết toán, 100% trên hệ thống |
| G-2 | Kiểm soát tồn kho chính xác | Nhập/xuất kho liên thông phiếu dịch vụ và đơn hàng mua, giảm chênh lệch |
| G-3 | Quản lý khách hàng & lịch sử xe | Mỗi xe có lịch sử sửa chữa, phụ tùng đã thay — hỗ trợ tư vấn chính xác |
| G-4 | Tối ưu mua hàng | Báo giá → đặt hàng → nhận hàng → nhập kho liền mạch |
| G-5 | Marketing chủ động | Chiến dịch, voucher, phân khúc khách hàng — tăng tỷ lệ quay lại |
| G-6 | Dashboard tổng quan | Ra quyết định dựa trên dữ liệu realtime |

### 2.2 Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ phiếu dịch vụ hoàn thành quyết toán | >= 80% | Số phiếu có quyết toán / tổng phiếu hoàn thành |
| Tỷ lệ lịch hẹn xử lý trong 24h | >= 90% | Lịch hẹn được xác nhận/từ chối trong 24h |
| Độ chính xác tồn kho sau kiểm kê | >= 95% | Chênh lệch thực tế vs hệ thống |
| Tỷ lệ chuyển đổi báo giá → đơn hàng mua | >= 60% | Đơn hàng mua / yêu cầu báo giá |
| Tỷ lệ garage sử dụng dashboard hàng ngày | >= 60% | DAU dashboard / tổng garage active |
| Tỷ lệ voucher được sử dụng | >= 30% | Voucher redeemed / voucher issued |
| Tỷ lệ phiếu quyết toán bảo hiểm có hồ sơ đã xuất PDF | >= 90% | Số phiếu QT BH có hồ sơ PDF / tổng phiếu QT BH |
| Thời gian trung bình từ tạo phiếu QT BH đến xuất hồ sơ gửi BH | <= 2 ngày làm việc | (Thời điểm xuất PDF) − (Thời điểm tạo phiếu QT BH) |
| Tỷ lệ ca sửa chữa BH có ít nhất 1 dòng "BH thanh toán" được phân bổ chính xác | >= 95% | Audit thủ công theo mẫu (NEED CONFIRMATION: cách lấy mẫu) |

---

## 3. Constraints

| # | Constraint | Mô tả |
|---|---|---|
| C-1 | Ngôn ngữ | Giao diện và nội dung hoàn toàn tiếng Việt (vi-VN) |
| C-2 | Dual persona | Chỉ 2 vai trò: Chủ garage và Kế toán. Không tạo thêm vai trò mới |
| C-3 | Multi-tenant | Mỗi garage là một tenant độc lập, dữ liệu cách ly hoàn toàn |
| C-4 | Tích hợp Driver+ | Nhận lịch hẹn từ ứng dụng tài xế Driver+ — hệ thống bên ngoài |
| C-5 | Tích hợp ERP/COP | Đồng bộ dữ liệu sản phẩm, nhà cung cấp qua cầu nối ERP |
| C-6 | Thiết bị | Web GMS trên desktop + App Garage trên mobile, cần hỗ trợ cả hai |

---

## 4. Personas

### 4.1 Chủ garage (`garage-owner`)

| Aspect | Detail |
|---|---|
| Vai trò | Quản lý toàn bộ hoạt động garage ô tô |
| Thiết bị | Web GMS + App Garage |
| Quyền hạn | **Toàn quyền** — tất cả chức năng trong hệ thống |
| Mục tiêu chính | Quản lý garage trên một hệ thống duy nhất, kiểm soát tài chính, chăm sóc khách hàng |

> Chi tiết: [garage-owner.md](personas/garage-owner.md)

### 4.2 Kế toán (`accountant`)

| Aspect | Detail |
|---|---|
| Vai trò | Quản lý tài chính, theo dõi công nợ, đối soát thanh toán |
| Thiết bị | Chủ yếu Web GMS trên desktop |
| Quyền hạn | Toàn quyền, **ngoại trừ** nhóm chat theo xe |
| Mục tiêu chính | Quyết toán chính xác, kiểm soát chi phí mua hàng, kiểm kê tồn kho |

> Chi tiết: [accountant.md](personas/accountant.md)

**Ngoại lệ phân quyền duy nhất**: Kế toán không có quyền vào nhóm chat theo xe (thuộc EP-SUPPORT). Mọi chức năng khác hai vai trò thực hiện ngang nhau.

---

## 5. Scope

### 5.1 In-Scope — 16 Epics, 85 Features

#### Wave 1 — Nền tảng & Nghiệp vụ cốt lõi (9 epics, 47 features)

| # | Epic ID | Title | Boundary | Priority | Features |
|---|---|---|---|---|---|
| 1 | EP-FOUND | Nền tảng garage, tài khoản, chi nhánh & phân quyền | gf-hrms | P0 | 6 |
| 2 | EP-CUSTOMER | Quản lý khách hàng | gf-customer | P0 | 5 |
| 3 | EP-VEHICLE | Xe & lịch sử xe | gf-customer | P0 | 2 |
| 4 | EP-BOOKING | Lịch hẹn & Driver+ | gf-sales | P0 | 8 |
| 5 | EP-SERVICE-ORDER | Phiếu dịch vụ | gf-sales | P0 | 7 |
| 6 | EP-SETTLEMENT | Quyết toán | gf-accounting | P0 | 3 |
| 7 | EP-CATALOG | Danh mục dịch vụ, nhà cung cấp & nhà xe | gf-erp-mdm | P1 | 10 |
| 8 | EP-INVENTORY-STOCK | Tồn kho | gf-inventory | P1 | 5 |
| 9 | EP-DASHBOARD | Tổng quan hoạt động | gf-sales | P1 | 1 |

> EP-DASHBOARD phụ thuộc nhiều epic khác (EP-SERVICE-ORDER, EP-BOOKING, EP-SETTLEMENT, EP-PROCUREMENT) — triển khai cuối Wave 1.

#### Wave 2 — Mở rộng (7 epics, 38 features)

| # | Epic ID | Title | Boundary | Priority | Features |
|---|---|---|---|---|---|
| 10 | EP-PROCUREMENT | Mua hàng | gf-purchase | P1 | 10 |
| 11 | EP-INVENTORY-RECEIPT | Nhập kho | gf-inventory | P1 | 4 |
| 12 | EP-INVENTORY-DELIVERY | Xuất kho | gf-inventory | P1 | 4 |
| 13 | EP-INVENTORY-PERIOD | Tồn kho theo kỳ | gf-inventory | P2 | 1 |
| 14 | EP-SUPPORT | Hỗ trợ & phản hồi | agg-garage-graph | P2 | 2 |
| 15 | EP-MARKETING | Marketing & phân khúc khách hàng | gf-marketing | P2 | 11 |
| 16 | EP-INSURANCE-SETTLEMENT | Quyết toán bảo hiểm & hồ sơ bảo hiểm | gf-accounting (chính), gf-sales (mở rộng); ranh giới ownership chi tiết do Architect quyết định | P1 — NEED CONFIRMATION (Delivery Authority) | 6 |

#### Inventory V2 — Forward Design `[DRAFT/PROPOSED — chưa cutover]`

> Các epic/feature dưới đây là **thiết kế hướng tới (to-be)** cho rework phần kho V2, **chưa thay** baseline production ở trên. Bản gốc giữ nguyên làm baseline. **Đã đặc tả đủ 6/6 epic Inventory V2** (44 feature).
>
> **Feature-flag gate**: toàn subsystem Inventory V2 (W03/W04/W05/W06) gate qua feature-flag **`Inventory:InventoryV2`** — **default ON** tại GA cho MỌI tenant, Ops kill-switch per-tenant (`spring-feature-flag-starter` config sẵn ở boundary service · CR-20260707-02). Flag OFF → toàn bộ endpoint V2 trả 403 + sidebar/hub tile ẩn.

| Epic ID | Title | Boundary | Loại | Features | Status |
|---|---|---|---|---|---|
| EP-INVENTORY-CATALOG | Danh mục vật tư kho (Mã SP nội bộ & Nhóm VTHH + hub mobile) | gf-inventory | Mới | 13 | DRAFT/PROPOSED |
| EP-INVENTORY-ACCOUNTING-PERIOD | Kỳ kế toán & Tính giá xuất kho | gf-accounting | Mới | 10 (5 AP + 5 PRC) | DRAFT/PROPOSED |
| EP-INVENTORY-OPENING-BALANCE | Tồn đầu kỳ | gf-inventory | Mới | 4 | DRAFT/PROPOSED |
| EP-INVENTORY-RECEIPT-V2 | Nhập kho (V2) | gf-inventory | V2 | 7 (4 V2 + 3 mới) | DRAFT/PROPOSED |
| EP-INVENTORY-DELIVERY-V2 | Xuất kho (V2) | gf-inventory | V2 | 7 (4 V2 + 3 mới) | DRAFT/PROPOSED |
| EP-INVENTORY-STOCK-V2 | Báo cáo tồn kho (V2) — tồn đến ngày · NXT · thẻ kho | gf-inventory | V2 | 3 | DRAFT/PROPOSED |

#### UX Flows — 10 luồng

| # | Flow | Referenced Features |
|---|---|---|
| 1 | Luồng lịch hẹn & tiếp nhận xe | 8 FEAT (booking) |
| 2 | Tiếp nhận, sửa chữa xe | 4 FEAT (service order) |
| 3 | Bán lẻ phụ tùng | 4 FEAT (retail sale) |
| 4 | Thanh toán, ghi nhận công nợ | 3 FEAT (settlement) |
| 5 | Mua hàng qua sàn | 10 FEAT (procurement) |
| 6 | Nhập kho | 4 FEAT (receipt) |
| 7 | Xuất kho | 4 FEAT (delivery) |
| 8 | Tồn kho theo kỳ | 1 FEAT (period) |
| 9 | Tồn kho | 5 FEAT (stock) |
| 10 | Quyết toán bảo hiểm & hồ sơ bảo hiểm | 6 FEAT (insurance settlement) — chi tiết tại [UX-FLOW-INSURANCE-SETTLEMENT.md](ux/UX-FLOW-INSURANCE-SETTLEMENT.md) |

### 5.2 Out-of-Scope

| # | Nội dung | Lý do |
|---|---|---|
| OS-1 | Kế toán tài chính (sổ cái, báo cáo thuế, hóa đơn điện tử) | Sử dụng phần mềm kế toán bên ngoài |
| OS-2 | Quản lý lương, chấm công, KPI nhân viên | Ngoài phạm vi quản lý garage |
| OS-3 | Thương mại điện tử (bán phụ tùng online) | Chỉ bán lẻ tại garage |
| OS-4 | Tích hợp **2 chiều realtime** với hệ thống doanh nghiệp bảo hiểm (gửi claim qua API, nhận phê duyệt, đồng bộ trạng thái bồi thường) | Garage làm việc với bảo hiểm qua hồ sơ giấy / PDF — không có API chuẩn cho thị trường VN. **Lưu ý**: việc ghi nhận chi phí bảo hiểm, tính toán phân bổ, tạo & xuất PDF hồ sơ, đối soát thanh toán BH đã **trong scope** qua `EP-INSURANCE-SETTLEMENT` (6 FEAT). Danh sách công ty BH = system-seeded production (không có master data CRUD) |
| OS-5 | Quản lý đội xe (fleet management) | Khác domain — garage chỉ sửa xe, không quản lý đội xe |

---

## 6. Assumptions

| # | Assumption | Verify khi |
|---|---|---|
| A-1 | Mỗi garage có internet ổn định (Wi-Fi hoặc 4G) | Pilot |
| A-2 | Chủ garage và kế toán có thể sử dụng máy tính và điện thoại smartphone | Pilot |
| A-3 | Garage đã có danh sách khách hàng (dù chưa số hóa) — có thể import | Onboarding |
| A-4 | Nhà cung cấp phụ tùng sẵn sàng nhận yêu cầu báo giá qua hệ thống | Phase 2 (ERP integration) |
| A-5 | Driver+ API ổn định và có document đầy đủ cho tích hợp lịch hẹn | Trước Wave 1 |
| A-6 | Dữ liệu sản phẩm (phụ tùng) được đồng bộ từ ERP/COP qua gf-erp-agent — garage không tự nhập sản phẩm | Trước Wave 1 |

---

## 7. Epic Summary

### 7.1 Priority Distribution

| Priority | Số lượng | Epics |
|---|---|---|
| **P0** | 6 | EP-FOUND, EP-CUSTOMER, EP-VEHICLE, EP-BOOKING, EP-SERVICE-ORDER, EP-SETTLEMENT |
| **P1** | 7 | EP-CATALOG, EP-INVENTORY-STOCK, EP-PROCUREMENT, EP-INVENTORY-RECEIPT, EP-INVENTORY-DELIVERY, EP-DASHBOARD, EP-INSURANCE-SETTLEMENT (NEED CONFIRMATION priority) |
| **P2** | 3 | EP-INVENTORY-PERIOD, EP-SUPPORT, EP-MARKETING |

### 7.2 Dependency Graph (đơn giản hóa)

```
EP-FOUND ─────────────────────────────┐
EP-CATALOG ───────────────────────────┤
EP-CUSTOMER ──┬── EP-VEHICLE          │
              │                       ▼
              └── EP-BOOKING ──► EP-SERVICE-ORDER ──┬── EP-SETTLEMENT ──► EP-INSURANCE-SETTLEMENT
                                      │             │
                                      ▼             ▼
                                EP-INVENTORY   EP-DASHBOARD
                                DELIVERY
                                      │
EP-PROCUREMENT ──► EP-INVENTORY ──────┤
                   RECEIPT            │
                                      ▼
                              EP-INVENTORY-PERIOD

EP-CUSTOMER ──► EP-MARKETING
EP-VEHICLE ──► EP-SUPPORT
```

### 7.3 Chi tiết từng Epic

#### EP-FOUND — Nền tảng garage, tài khoản, chi nhánh & phân quyền

| Field | Value |
|---|---|
| Priority | P0 |
| Wave | 1 |
| Boundary | gf-hrms |
| Features | 6 |

**Outcome**: Nếu garage có thể quản lý toàn bộ vòng đời nhân viên cùng với việc cấp, vô hiệu hóa và kích hoạt lại tài khoản đăng nhập — thì garage sẽ kiểm soát được đội ngũ nhân sự, phân quyền truy cập hệ thống chính xác và giảm rủi ro truy cập trái phép.

| FEAT ID | Title | Priority |
|---|---|---|
| FEAT-FND-EMP-LIST | Danh sách nhân viên | P0 |
| FEAT-FND-EMP-DETAIL | Chi tiết nhân viên | P0 |
| FEAT-FND-EMP-CREATE | Tạo nhân viên | P0 |
| FEAT-FND-EMP-EDIT | Chỉnh sửa nhân viên | P1 |
| FEAT-FND-EMP-STATUS | Quản lý trạng thái nhân viên | P1 |
| FEAT-FND-EMP-SSO | Quản lý tài khoản đăng nhập nhân viên | P1 |

---

#### EP-CUSTOMER — Quản lý khách hàng

| Field | Value |
|---|---|
| Priority | P0 |
| Wave | 1 |
| Boundary | gf-customer |
| Features | 5 |

**Outcome**: Nếu garage có thể quản lý toàn bộ danh sách khách hàng — thì garage sẽ nắm bắt được thông tin khách hàng chính xác, theo dõi lịch sử ghé thăm và chi tiêu, từ đó nâng cao chất lượng phục vụ và tăng tỷ lệ khách quay lại.

| FEAT ID | Title | Priority |
|---|---|---|
| FEAT-CUST-LIST | Danh sách khách hàng | P0 |
| FEAT-CUST-DETAIL | Chi tiết khách hàng | P0 |
| FEAT-CUST-CREATE | Tạo khách hàng | P0 |
| FEAT-CUST-EDIT | Chỉnh sửa khách hàng | P1 |
| FEAT-CUST-IMPORT | Import khách hàng | P1 |

---

#### EP-VEHICLE — Xe & lịch sử xe

| Field | Value |
|---|---|
| Priority | P0 |
| Wave | 1 |
| Boundary | gf-customer |
| Features | 2 |

**Outcome**: Nếu garage có thể xem danh sách toàn bộ xe và tra cứu chi tiết lịch sử sửa chữa — thì garage sẽ đưa ra tư vấn bảo dưỡng chính xác và nâng cao chất lượng dịch vụ.

| FEAT ID | Title | Priority |
|---|---|---|
| FEAT-VEH-LIST | Danh sách xe | P0 |
| FEAT-VEH-DETAIL | Chi tiết xe | P0 |

---

#### EP-BOOKING — Lịch hẹn & Driver+

| Field | Value |
|---|---|
| Priority | P0 |
| Wave | 1 |
| Boundary | gf-sales |
| Features | 8 |

**Outcome**: Nếu garage có thể quản lý toàn bộ vòng đời lịch hẹn, đồng thời tự động nhận lịch hẹn từ Driver+ — thì garage sẽ giảm sai sót tiếp nhận xe, rút ngắn thời gian chờ và tăng tỷ lệ chuyển đổi sang phiếu dịch vụ.

| FEAT ID | Title | Priority |
|---|---|---|
| FEAT-BOOK-LIST | Danh sách lịch hẹn | P0 |
| FEAT-BOOK-DETAIL | Chi tiết lịch hẹn | P0 |
| FEAT-BOOK-CREATE | Tạo lịch hẹn mới | P0 |
| FEAT-BOOK-EDIT | Chỉnh sửa lịch hẹn | P1 |
| FEAT-BOOK-CONFIRM | Xác nhận lịch hẹn | P0 |
| FEAT-BOOK-ARRIVE | Xác nhận xe đã đến | P0 |
| FEAT-BOOK-CANCEL | Hủy lịch hẹn | P1 |
| FEAT-BOOK-DECLINE | Từ chối lịch hẹn | P1 |

---

#### EP-SERVICE-ORDER — Phiếu dịch vụ

| Field | Value |
|---|---|
| Priority | P0 |
| Wave | 1 |
| Boundary | gf-sales |
| Features | 7 |

**Outcome**: Nếu garage có thể tạo và quản lý toàn bộ phiếu dịch vụ (sửa chữa xe + bán lẻ phụ tùng) từ báo giá đến hoàn thành — thì garage sẽ kiểm soát tiến trình sửa chữa, tối ưu doanh thu và giảm sai sót vận hành.

| FEAT ID | Title | Priority |
|---|---|---|
| FEAT-SO-LIST | Danh sách phiếu dịch vụ | P0 |
| FEAT-SO-CREATE | Tạo phiếu dịch vụ xe | P0 |
| FEAT-SO-DETAIL | Chi tiết phiếu dịch vụ xe | P0 |
| FEAT-SO-EDIT | Chỉnh sửa phiếu dịch vụ xe | P0 |
| FEAT-SO-SALE-CREATE | Tạo phiếu bán lẻ phụ tùng | P0 |
| FEAT-SO-SALE-DETAIL | Chi tiết phiếu bán lẻ phụ tùng | P0 |
| FEAT-SO-SALE-EDIT | Chỉnh sửa phiếu bán lẻ phụ tùng | P0 |

---

#### EP-SETTLEMENT — Quyết toán

| Field | Value |
|---|---|
| Priority | P0 |
| Wave | 1 |
| Boundary | gf-accounting |
| Features | 3 |

**Outcome**: Nếu garage có thể tạo phiếu quyết toán, theo dõi trạng thái thanh toán và quản lý chứng từ — thì garage sẽ kiểm soát dòng tiền, giảm sai sót quyết toán và đẩy nhanh thu hồi công nợ.

| FEAT ID | Title | Priority |
|---|---|---|
| FEAT-STL-LIST | Danh sách phiếu quyết toán | P0 |
| FEAT-STL-CREATE | Tạo phiếu quyết toán | P0 |
| FEAT-STL-DETAIL | Chi tiết phiếu quyết toán | P0 |

---

#### EP-CATALOG — Danh mục dịch vụ, nhà cung cấp & nhà xe

| Field | Value |
|---|---|
| Priority | P1 |
| Wave | 1 |
| Boundary | gf-erp-mdm |
| Features | 10 |

**Outcome**: Nếu garage có thể quản lý danh mục dịch vụ, nhà cung cấp và nhà xe liên kết — thì garage sẽ chuẩn hóa dữ liệu nền tảng, giảm sai sót khi tạo phiếu dịch vụ và đơn hàng mua.

| FEAT ID | Title | Priority |
|---|---|---|
| FEAT-CAT-SVC-LIST | Danh sách dịch vụ | P1 |
| FEAT-CAT-SVC-CREATE | Tạo dịch vụ | P1 |
| FEAT-CAT-SVC-EDIT | Chỉnh sửa dịch vụ | P1 |
| FEAT-CAT-SUP-LIST | Danh sách nhà cung cấp | P1 |
| FEAT-CAT-SUP-CREATE | Tạo nhà cung cấp | P1 |
| FEAT-CAT-SUP-EDIT | Chỉnh sửa nhà cung cấp | P1 |
| FEAT-CAT-TRANS-LIST | Danh sách nhà xe liên kết | P1 |
| FEAT-CAT-TRANS-CREATE | Tạo nhà xe liên kết | P1 |
| FEAT-CAT-TRANS-EDIT | Chỉnh sửa nhà xe liên kết | P1 |
| FEAT-CAT-TRANS-DELETE | Xóa nhà xe liên kết | P1 |

---

#### EP-INVENTORY-STOCK — Tồn kho

| Field | Value |
|---|---|
| Priority | P1 |
| Wave | 1 |
| Boundary | gf-inventory |
| Features | 5 |

**Outcome**: Nếu garage có thể xem tồn kho realtime, tra cứu thẻ kho, điều chỉnh tồn kho khi chênh lệch và cập nhật giá bán — thì garage sẽ kiểm soát chính xác số lượng tồn và quản lý giá bán linh hoạt.

| FEAT ID | Title | Priority |
|---|---|---|
| FEAT-STK-LIST | Danh sách tồn kho | P1 |
| FEAT-STK-DETAIL | Chi tiết tồn kho | P1 |
| FEAT-STK-ADJUST | Điều chỉnh tồn kho | P1 |
| FEAT-STK-PRICE | Cập nhật giá bán | P1 |
| FEAT-WH-LIST | Danh sách kho hàng | P1 |

---

#### EP-PROCUREMENT — Mua hàng

| Field | Value |
|---|---|
| Priority | P1 |
| Wave | 2 |
| Boundary | gf-purchase |
| Features | 10 |

**Outcome**: Nếu garage có thể tạo yêu cầu báo giá, chuyển thành đặt hàng và theo dõi đơn hàng mua — thì garage sẽ tối ưu chi phí mua phụ tùng và giảm thời gian chờ hàng.

| FEAT ID | Title | Priority |
|---|---|---|
| FEAT-QR-LIST | Danh sách yêu cầu báo giá | P1 |
| FEAT-QR-CREATE | Tạo yêu cầu báo giá | P1 |
| FEAT-QR-DETAIL | Chi tiết yêu cầu báo giá | P1 |
| FEAT-PR-LIST | Danh sách yêu cầu đặt hàng | P1 |
| FEAT-PR-CREATE | Tạo yêu cầu đặt hàng | P1 |
| FEAT-PR-DETAIL | Chi tiết yêu cầu đặt hàng | P1 |
| FEAT-PO-LIST | Danh sách đơn hàng mua | P1 |
| FEAT-PO-CREATE | Tạo đơn hàng mua | P1 |
| FEAT-PO-DETAIL | Chi tiết đơn hàng mua | P1 |
| FEAT-PO-EDIT | Chỉnh sửa đơn hàng mua | P1 |

---

#### EP-INVENTORY-RECEIPT — Nhập kho

| Field | Value |
|---|---|
| Priority | P1 |
| Wave | 2 |
| Boundary | gf-inventory |
| Features | 4 |

**Outcome**: Nếu garage có thể tạo và quản lý phiếu nhập kho, với khả năng hoàn tác khi sai sót — thì garage sẽ kiểm soát luồng hàng vào kho và truy vết nguồn gốc phụ tùng.

| FEAT ID | Title | Priority |
|---|---|---|
| FEAT-IR-LIST | Danh sách phiếu nhập kho | P1 |
| FEAT-IR-CREATE | Tạo phiếu nhập kho | P1 |
| FEAT-IR-DETAIL | Chi tiết phiếu nhập kho | P1 |
| FEAT-IR-EDIT | Chỉnh sửa phiếu nhập kho | P1 |

---

#### EP-INVENTORY-DELIVERY — Xuất kho

| Field | Value |
|---|---|
| Priority | P1 |
| Wave | 2 |
| Boundary | gf-inventory |
| Features | 4 |

**Outcome**: Nếu garage có thể tạo và quản lý phiếu xuất kho, với khả năng hoàn tác khi sai sót — thì garage sẽ kiểm soát luồng hàng ra kho và liên kết phụ tùng xuất với phiếu dịch vụ.

| FEAT ID | Title | Priority |
|---|---|---|
| FEAT-ID-LIST | Danh sách phiếu xuất kho | P1 |
| FEAT-ID-CREATE | Tạo phiếu xuất kho | P1 |
| FEAT-ID-DETAIL | Chi tiết phiếu xuất kho | P1 |
| FEAT-ID-EDIT | Chỉnh sửa phiếu xuất kho | P1 |

---

#### EP-DASHBOARD — Tổng quan hoạt động

| Field | Value |
|---|---|
| Priority | P1 |
| Wave | 1 |
| Boundary | gf-sales |
| Features | 1 |

**Outcome**: Nếu garage có thể xem tổng quan hoạt động realtime — thì garage sẽ nắm bắt tình hình kinh doanh nhanh chóng và đưa ra quyết định dựa trên dữ liệu.

| FEAT ID | Title | Priority |
|---|---|---|
| FEAT-DASH-VIEW | Tổng quan hoạt động | P1 |

---

#### EP-INVENTORY-PERIOD — Tồn kho theo kỳ

| Field | Value |
|---|---|
| Priority | P2 |
| Wave | 2 |
| Boundary | gf-inventory |
| Features | 1 |

**Outcome**: Nếu garage có thể xem tồn kho theo từng kỳ — thì garage sẽ kiểm soát biến động tồn kho qua thời gian và hỗ trợ kiểm kê định kỳ.

| FEAT ID | Title | Priority |
|---|---|---|
| FEAT-IP-VIEW | Tồn kho theo kỳ | P2 |

---

#### EP-SUPPORT — Hỗ trợ & phản hồi

| Field | Value |
|---|---|
| Priority | P2 |
| Wave | 2 |
| Boundary | agg-garage-graph |
| Features | 2 |

**Outcome**: Nếu garage có thể trao đổi với đội hỗ trợ qua chat và gửi phản hồi — thì garage sẽ được hỗ trợ kịp thời và đóng góp ý kiến cải thiện sản phẩm.

| FEAT ID | Title | Priority |
|---|---|---|
| FEAT-SUP-CHAT | Chat hỗ trợ & chat theo xe | P2 |
| FEAT-SUP-FEEDBACK | Gửi phản hồi | P2 |

---

#### EP-MARKETING — Marketing & phân khúc khách hàng

| Field | Value |
|---|---|
| Priority | P2 |
| Wave | 2 |
| Boundary | gf-marketing |
| Features | 11 |

**Outcome**: Nếu garage có thể tạo chiến dịch marketing, phát hành voucher và xem phân khúc khách hàng — thì garage sẽ tăng tỷ lệ khách quay lại và đo lường hiệu quả marketing.

| FEAT ID | Title | Priority |
|---|---|---|
| FEAT-MKT-CAMP-LIST | Danh sách chiến dịch | P2 |
| FEAT-MKT-CAMP-CREATE | Tạo chiến dịch | P2 |
| FEAT-MKT-CAMP-DETAIL | Chi tiết chiến dịch | P2 |
| FEAT-MKT-CAMP-EDIT | Chỉnh sửa chiến dịch | P2 |
| FEAT-MKT-VOUC-LIST | Danh sách voucher | P2 |
| FEAT-MKT-VOUC-CREATE | Tạo voucher | P2 |
| FEAT-MKT-VOUC-DETAIL | Chi tiết voucher | P2 |
| FEAT-MKT-VOUC-EDIT | Chỉnh sửa voucher | P2 |
| FEAT-MKT-SEG-LIST | Danh sách phân khúc khách hàng | P2 |
| FEAT-MKT-SEG-CREATE | Tạo phân khúc khách hàng | P2 |
| FEAT-MKT-SEG-DETAIL | Chi tiết phân khúc khách hàng | P2 |

---

#### EP-INSURANCE-SETTLEMENT — Quyết toán bảo hiểm & hồ sơ bảo hiểm

| Field | Value |
|---|---|
| Priority | P1 — NEED CONFIRMATION (đề xuất P1 do tính nghiệp vụ trọng yếu trong vận hành garage thực tế; chờ Business Authority xác nhận) |
| Wave | Hậu baseline (post-Wave 2) — NEED CONFIRMATION |
| Boundary | gf-accounting (phiếu QT BH + hồ sơ BH + đối soát thanh toán BH) + mở rộng gf-sales (điều chỉnh BH trên SO + widget công nợ BH trên dashboard) — ranh giới ownership chi tiết do Architect quyết định (BA/PO không quyết định kiến trúc) |
| Features | 6 |

**Outcome**: Nếu garage có thể phân tách chi phí sửa chữa theo nguồn thanh toán (bảo hiểm vs khách hàng), tính chính xác số tiền bảo hiểm phải trả sau các khoản điều chỉnh, tạo phiếu quyết toán bảo hiểm độc lập và xuất bộ hồ sơ PDF gửi doanh nghiệp bảo hiểm — thì garage sẽ kiểm soát được công nợ phải thu từ bảo hiểm, giảm sai sót quyết toán hai phía (BH/KH), rút ngắn thời gian thu hồi tiền bảo hiểm và loại bỏ thao tác Excel ngoài hệ thống.

**Phạm vi nghiệp vụ**:

1. **Trên Phiếu dịch vụ** (mở rộng `EP-SERVICE-ORDER`):
   - **Chỉ ở màn hình Chỉnh sửa (Edit) + Chi tiết (Detail), KHÔNG ở Tạo (Create)** (chốt v7). Luồng thực tế: `Xe đến → cố vấn khám xe + lên đầu mục → tạo SO + báo giá sơ bộ (Create) → gửi báo giá sang BH duyệt → BH duyệt + đưa thông tin phân bổ → garage chỉnh sửa SO (Edit) nhập phân bổ BH đã duyệt`. Tại Create chưa biết BH duyệt gì nên không có dữ liệu phân bổ.
   - Chọn **Nguồn thanh toán** (Bảo hiểm / Khách hàng tự thanh toán) cho từng dòng vật tư/phụ tùng và công dịch vụ — **đã có ở production (EP-SERVICE-ORDER baseline)**, là foundation, KHÔNG dev lần này.
   - **(MỚI)** Nhập các khoản điều chỉnh bảo hiểm trong section "Phân bổ quyết toán bảo hiểm" (ở màn Edit; đã chốt v4):
     - **Chiết khấu liên kết BH — Vật tư**: cho phép nhập theo **% hoặc số tiền** (UI có toggle/switch chuyển đổi giữa 2 chế độ; khi nhập % thì hệ thống tự tính ra số tiền và ngược lại).
     - **Chiết khấu liên kết BH — Công dịch vụ**: cho phép nhập theo **% hoặc số tiền** (tương tự trên).
     - **Khấu hao vật tư / thay mới**: áp dụng đồng loạt cho tất cả phụ tùng hoặc chỉnh riêng từng dòng.
     - **Giảm trừ bồi thường**: cho phép nhập theo **% hoặc số tiền** (đã chốt v5 — UI có toggle/switch chuyển đổi giữa 2 chế độ, tương tự cơ chế của Chiết khấu liên kết BH).
     - **Khấu trừ bảo hiểm**: **nhập tay số tiền** (đã chốt v4 — không tra cứu hợp đồng/template, kế toán nhập trực tiếp số tiền theo hồ sơ BH).

2. **Phiếu quyết toán bảo hiểm** (loại phiếu mới thuộc `EP-SETTLEMENT`, được module `EP-INSURANCE-SETTLEMENT` cung cấp):
   - Chỉ quyết toán các hạng mục có Nguồn thanh toán = Bảo hiểm trên SO liên kết.
   - Bên thanh toán = Doanh nghiệp bảo hiểm (không phải khách hàng).
   - Hiển thị: Phiếu dịch vụ liên kết, thông tin khách hàng/xe, danh sách hạng mục thuộc BH, bảng phân bổ BH, Tổng chi phí thuộc BH, Bảo hiểm thanh toán, Còn phải thu BH, KH chịu từ điều chỉnh BH.
   - **(MỚI — chốt 2026-06-15)** Trên **màn xác nhận Tạo phiếu quyết toán** (CR mở rộng màn tạo production, KHÔNG rebuild) hiển thị thêm panel read-only **"Tổng giá dịch vụ"** (Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm + Cân thanh toán) — snapshot từ phân bổ BH đã duyệt trên SO, hiển thị có điều kiện theo SO có/không Bảo hiểm. Trường "Tổng tiền bảo hiểm trả" bên BH chuyển read-only = computed (`FEAT-INS-STL-CREATE`).
   - Theo dõi trạng thái thanh toán riêng so với phần khách hàng tự trả.

3. **Hồ sơ bảo hiểm** (đã chốt v4: **dùng chung 1 bộ hồ sơ chuẩn cho tất cả doanh nghiệp bảo hiểm**, không phân biệt theo từng DN BH):
   - Bộ hồ sơ chuẩn gồm **4 tài liệu** theo thứ tự:
     1. **Phiếu quyết toán** — sinh tự động từ phiếu QT BH (auto, "Sẵn sàng").
     2. **Phiếu báo giá** — "PHIẾU BÁO GIÁ SỬA CHỮA" sinh từ phiếu QT BH (auto, "Sẵn sàng").
     3. **Biên bản nghiệm thu** — mẫu chung, kế toán hoàn tất ("Bổ sung").
     4. **Giấy ủy quyền nhận tiền bồi thường** — mẫu chung, cần chữ ký gốc KH ("Bổ sung").
   - UI (modal): progress bar "{X}/4 tài liệu sẵn sàng", 4 thẻ ngang có checkbox + badge "Sẵn sàng"/"Bổ sung", khu vực preview (In phiếu / Lưu phiếu), footer "Huỷ bỏ" / "Xuất hồ sơ bảo hiểm".
   - Sau khi xuất PDF, hệ thống lưu lại file trong tab **Hồ sơ bảo hiểm đã xuất** — chế độ chỉ xem (không chỉnh sửa, không upload thêm, không lưu thay đổi).
   - **Khi cần sửa/bổ sung sau xuất PDF** (đã chốt v4): tạo **bộ hồ sơ mới** (versioning) — không cho phép unlock & sửa bộ cũ. Bộ cũ vẫn được lưu trong tab "Hồ sơ bảo hiểm đã xuất" để truy vết.

4. **Đối soát thanh toán bảo hiểm** (đã chốt v4 + v5):
   - Sau khi doanh nghiệp BH chuyển tiền, **kế toán cập nhật thanh toán trực tiếp tại phiếu quyết toán loại BH**.
   - **Tái sử dụng chức năng ghi nhận thanh toán hiện hành** trên phiếu quyết toán (đã có sẵn ở FEAT-STL-DETAIL baseline) — **không phát triển thêm logic ghi nhận thanh toán** cho phiếu QT BH (đã chốt v5).
   - Bên thanh toán = Doanh nghiệp bảo hiểm thay vì khách hàng; các trường nhập (số tiền thanh toán, ngày thanh toán, ghi chú, file đính kèm chứng từ chuyển khoản, lịch sử thanh toán nhiều đợt) và quy trình thao tác **giữ nguyên** như phiếu quyết toán khách hàng hiện hành.
   - Trạng thái thanh toán hiển thị trên phiếu QT BH (Chưa thu / Thu một phần / Đã thu đủ) dùng chung logic với phiếu QT khách hàng.

5. **Số liệu công nợ BH trên Dashboard** (đã chốt v4 + v6):
   - Bổ sung widget/section trên `EP-DASHBOARD` (mở rộng FEAT-DASH-VIEW) hiển thị tổng quan công nợ phải thu từ BH.
   - Scope thu gọn (chốt v12): 3 KPI (Tổng phải thu BH, Đã thu trong kỳ, Số phiếu chờ thu) + 2 top list + filter kỳ 5 giá trị. **Bỏ** biểu đồ lịch sử + phân chia công nợ theo doanh nghiệp BH.

6. **Danh sách công ty bảo hiểm** (BASELINE production — chốt v12):
   - Dropdown "Công ty bảo hiểm" + danh sách công ty BH **là system-seeded toàn platform** (garage chỉ chọn, KHÔNG tự thêm/sửa) — đã có ở production.
   - Tham chiếu khi: chọn công ty BH trên Phiếu dịch vụ (toggle "Bảo hiểm = Có"); hiển thị tên trên phiếu QT BH, hồ sơ BH (in PDF).
   - **Đã bỏ 3 features CRUD** (FEAT-INS-COMPANY-LIST/CREATE/EDIT) — garage không quản lý danh sách. Không có % chiết khấu mặc định per công ty (chiết khấu nhập per-SO).

**Quy tắc tính toán nghiệp vụ** (tham chiếu khi viết AC cho từng feature):

```
Tổng chi phí thuộc BH        = Σ(vật tư có Nguồn TT = BH) + Σ(công DV có Nguồn TT = BH)

Bảo hiểm thanh toán          = Tổng chi phí thuộc BH
                               − Chiết khấu liên kết BH (vật tư + công DV)
                               − Giảm trừ bồi thường
                               − Khấu hao vật tư/thay mới
                               − Khấu trừ bảo hiểm

KH chịu từ điều chỉnh BH     = Giảm trừ bồi thường
                               + Khấu hao vật tư/thay mới
                               + Khấu trừ bảo hiểm
                             (Chiết khấu liên kết BH KHÔNG cộng sang KH — đây là khoản giữa garage và BH)

Tổng KH thanh toán           = Σ(các dòng có Nguồn TT = KH) + KH chịu từ điều chỉnh BH
```

**Personas chính**:
- **Kế toán / thu ngân**: thao tác chính — phân bổ nguồn TT, nhập điều chỉnh BH, tạo phiếu QT BH, tạo & xuất hồ sơ, đối soát thanh toán bảo hiểm.
- **Chủ garage**: kiểm soát doanh thu BH, chiết khấu liên kết, theo dõi tình trạng hồ sơ.

**Phụ thuộc**:
- Bắt buộc trước: `EP-SERVICE-ORDER` (FEAT-SO-CREATE, FEAT-SO-EDIT), `EP-SETTLEMENT` (FEAT-STL-CREATE).
- Tham chiếu data: `EP-CUSTOMER`, `EP-VEHICLE` (thông tin in trên hồ sơ).
- NEED CONFIRMATION: có cần master data "Doanh nghiệp bảo hiểm liên kết" trong `EP-CATALOG` không? (để chọn nhanh tên BH + thông tin hợp đồng/chiết khấu mặc định).

**Features**:

| FEAT ID | Title | Priority | Ghi chú |
|---|---|---|---|
| FEAT-INS-SO-ADJUSTMENT | Nhập & tính các khoản điều chỉnh BH trên Phiếu dịch vụ (chiết khấu liên kết, giảm trừ bồi thường, khấu hao, khấu trừ) + truyền thông tin phân bổ khi tạo phiếu QT | P1 | Section "Phân bổ quyết toán bảo hiểm" trên SO. Foundation đã production: chọn bên thanh toán per dòng (EP-SERVICE-ORDER) + tạo phiếu QT cặp KH+BH (EP-SETTLEMENT) |
| FEAT-INS-STL-DETAIL | Chi tiết phiếu quyết toán bảo hiểm (hạng mục thuộc BH, bảng phân bổ, số tiền BH thanh toán, còn phải thu) | P1 | Quyền & nghiệp vụ chỉnh sửa phiếu QT giữ nguyên như hiện hành (đã chốt v4). Ghi nhận thanh toán từ BH **tái sử dụng chức năng ghi nhận thanh toán hiện có** trên phiếu quyết toán baseline (đã chốt v5) — không phát triển thêm |
| FEAT-INS-DOSSIER-CREATE | Tạo & quản lý hồ sơ bảo hiểm (bộ 4 tài liệu chuẩn: Phiếu báo giá, Phiếu quyết toán, Biên bản nghiệm thu, Giấy ủy quyền — điền nội dung template, in/xuất PDF) | P1 | Truy cập từ phiếu QT BH bằng nút "Tạo hồ sơ bảo hiểm"; sửa sau xuất = tạo bộ mới |
| FEAT-INS-DOSSIER-VIEW | Xem hồ sơ bảo hiểm đã xuất (read-only, không chỉnh sửa, lưu nhiều bản theo version) | P1 | Tab riêng — lưu trữ file PDF đã phát hành |
| FEAT-INS-DASH-DEBT | Widget công nợ bảo hiểm trên Dashboard (3 KPI + 2 top list + filter kỳ) | P1 | Mở rộng FEAT-DASH-VIEW của `EP-DASHBOARD`, KHÔNG thay thế |

> **Foundation đã production (không phải feature epic)**: danh sách/dropdown công ty bảo hiểm = system-seeded toàn platform (garage chỉ chọn) → đã bỏ 3 features FEAT-INS-COMPANY-LIST/CREATE/EDIT.

**Open Questions / NEED CONFIRMATION** (còn lại sau cập nhật v6):

1. **Priority & Wave** (Delivery Authority): P1 hậu baseline có đúng không? Có cần đẩy P0 nếu có khách hàng/garage pilot đang chờ? — **STILL OPEN**.

**Architecture decisions** (thuộc Architect, không phải BA/PO — tách khỏi BA Open Questions):

- **Boundary chính module Hồ sơ BH**: gf-accounting có ownership đầy đủ, hay tách boundary mới `gf-insurance`? — Chờ Architect quyết định khi spawn dev. KHÔNG block BA/PO. *(Danh sách công ty BH là system-seeded production, không phải master data garage tự quản — không nằm trong câu hỏi boundary này.)*

**RESOLVED tại v4 + v5 + v6** (đã chốt với Business Authority 2026-05-27):

| Version | Câu hỏi | Quyết định |
|---|---|---|
| v4 | Cách nhập chiết khấu liên kết BH (vật tư & công DV) | Cho phép cả **% và số tiền** (UI có toggle chuyển đổi) |
| v4 | Cách nhập khấu trừ bảo hiểm | **Nhập tay số tiền** (không tra cứu hợp đồng/template) |
| v4 | Danh mục tài liệu hồ sơ BH | **1 bộ chuẩn dùng chung cho mọi DN BH** gồm 4 tài liệu: Phiếu báo giá, Phiếu quyết toán, Biên bản nghiệm thu, Giấy ủy quyền |
| v4 | Quyền & nghiệp vụ sửa phiếu QT của kế toán | **Giữ nguyên như hiện hành**, không thay đổi quyền hạn / quy trình |
| v4 | Sửa hồ sơ sau khi xuất PDF | **Tạo bộ hồ sơ mới** (versioning) — không unlock bộ cũ |
| v4 | Đối soát thanh toán BH | **Cập nhật trực tiếp tại phiếu QT loại BH** |
| v4 | Báo cáo công nợ BH | **Có** — bổ sung widget công nợ BH trên Dashboard (FEAT-INS-DASH-DEBT mới) |
| v4 | Tích hợp Driver+ | **Không cần** tích hợp Driver+ cho ca bảo hiểm |
| v5 | Cách tính Giảm trừ bồi thường | Cho phép cả **% và số tiền** (UI có toggle, tương tự Chiết khấu liên kết BH) |
| v5 | Số đợt thanh toán BH tối đa + cách hiển thị lịch sử thanh toán | **Tái sử dụng chức năng ghi nhận thanh toán hiện hành** trên phiếu quyết toán (FEAT-STL-DETAIL baseline) — không phát triển thêm logic mới |
| ~~v6~~ → **v12** | Master data Doanh nghiệp bảo hiểm | **SUPERSEDED**: quyết định v6 (thêm 3 features CRUD) đã bị đảo. Danh sách/dropdown công ty BH là **system-seeded toàn platform** (đã có ở production) — garage chỉ chọn, KHÔNG tự CRUD. **Đã bỏ FEAT-INS-COMPANY-LIST/CREATE/EDIT.** Các điểm tham chiếu (SO, phiếu QT BH, hồ sơ BH, widget dashboard) dùng dropdown system-seeded |
| **v6** | Boundary chính module BH | **Không thuộc trách nhiệm BA/PO** — Architect quyết định khi spawn dev (di chuyển khỏi BA Open Questions) |
| **v6** | Trường read-only/editable trên template Phiếu báo giá trong Hồ sơ BH | **Tất cả các trường đều read-only** — Phiếu báo giá render từ snapshot phiếu QT BH, kế toán không sửa nội dung trên hồ sơ. Nếu cần sửa số liệu phải sửa ngược về phiếu QT BH / SO |

**Logic conflict cần giải quyết với scope hiện tại**:

- **OS-4 (Out-of-Scope)** đã được điều chỉnh ở v3: phần *claim/approval realtime với BH* vẫn out-of-scope, phần *settlement + dossier nội bộ* nay đã in-scope.
- **Nguồn thanh toán per dòng** trên SO (chọn bên thanh toán BH/KH từng dòng) **đã có ở production** (EP-SERVICE-ORDER baseline) — là foundation cho phần phân bổ BH, KHÔNG dev lần này (feature doc FEAT-INS-SO-PAYMENT-SOURCE đã gỡ khỏi epic).
- **FEAT-STL-CREATE / FEAT-STL-DETAIL** (EP-SETTLEMENT) hiện đang xử lý quyết toán phía khách hàng — phiếu QT BH là loại phiếu **độc lập song song**, không thay thế. Cần làm rõ trên UI: một SO có thể sinh ra **đồng thời** 1 phiếu QT khách hàng + 1 phiếu QT bảo hiểm.

---

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-16 | 16 | Business Authority | Housekeeping: sửa số liệu/link cũ (2 link personas §4.1/§4.2 gãy do thừa tiền tố "Product/" — `Product/personas/*.md` → `personas/*.md`, vì PRD.md nằm trong Product/ nên path tương đối không cần tiền tố). Không đụng nội dung nghiệp vụ. |
| 2026-06-12 | 15 | Business Authority | Additive (Inventory V2 forward design — gộp từ workstream kho): thêm khối "Inventory V2 — Forward Design `[DRAFT/PROPOSED — chưa cutover]`" trong §5.1, đăng ký 6 epic EP-INVENTORY-{CATALOG, ACCOUNTING-PERIOD, OPENING-BALANCE, RECEIPT-V2, DELIVERY-V2, STOCK-V2} (42 feature). Baseline 16 epic/85 feature + phần bảo hiểm giữ nguyên — KHÔNG đụng. |
| 2026-06-12 | 14 | Business Authority + Senior PM | **Thêm lại FEAT-INS-STL-CREATE** (scope khác lần xoá v10): CR mở rộng màn Tạo phiếu quyết toán — hiển thị panel "Tổng giá dịch vụ" read-only (Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm + Cân thanh toán) trên màn xác nhận tạo phiếu QT. EP-INSURANCE-SETTLEMENT 5 → **6 features**; tổng PRD 84 → **85 features**. Cập nhật §5.1 count + epic table + OS-4 note + UX flow #10 + §EP detail block (Features 6). Đồng bộ EP v18, README v7, BR-EP v28 (BR-INS-STL-CRE-009), UX-FLOW v18, FEAT-INS-STL-CREATE v1. |
| 2026-06-11 | 13 | BA/PO (anhluong) | **Bỏ chức năng upload file scan hồ sơ BH** (chốt B-3): §5.1 mô tả FEAT-INS-DOSSIER-CREATE — Biên bản nghiệm thu + Giấy ủy quyền "điền nội dung template, in/xuất PDF; không upload file scan". Đồng bộ EP v17, FEAT-INS-DOSSIER-CREATE v17, BR-EP v26, UX-FLOW v16, ERROR-CODE-REGISTRY v3, persona accountant v3. |
| 2026-05-21 | 1 | Business Authority + Senior PM | Khởi tạo PRD — 15 epics, 79 features, 2 personas, 9 UX flows |
| 2026-05-27 | 2 | Delivery Authority | Sync metadata: status DRAFT → DONE để khớp với brownfield production baseline (15/15 epics + 79/79 features đã ship); cập nhật last_reviewed |
| 2026-05-27 | 3 | Business Authority + Senior PM | Bổ sung scope mới hậu baseline: `EP-INSURANCE-SETTLEMENT` (Quyết toán bảo hiểm & Hồ sơ bảo hiểm) — 1 epic / 6 features (FEAT-INS-SO-PAYMENT-SOURCE, FEAT-INS-SO-ADJUSTMENT, FEAT-INS-STL-CREATE, FEAT-INS-STL-DETAIL, FEAT-INS-DOSSIER-CREATE, FEAT-INS-DOSSIER-VIEW). Cập nhật tổng scope 15→16 epics, 79→85 features, 9→10 UX flows. Bổ sung 3 success metrics liên quan tỷ lệ xuất hồ sơ BH & độ chính xác phân bổ. Thu hẹp OS-4: giữ phần *claim/approval realtime với hệ thống BH* out-of-scope, đưa phần *settlement + dossier nội bộ* in-scope. Cập nhật Priority Distribution (P1 6→7) và Dependency Graph. Mục mới mark ~12 NEED CONFIRMATION items chờ Business Authority + Architect xác nhận. |
| 2026-05-27 | 4 | Business Authority + Senior PM | Resolve 7/10 Open Questions của `EP-INSURANCE-SETTLEMENT`: (a) chiết khấu liên kết BH cho phép % hoặc số tiền; (b) khấu trừ BH nhập tay số tiền; (c) hồ sơ BH dùng 1 bộ chuẩn 4 tài liệu cho mọi DN BH (Phiếu báo giá, Phiếu quyết toán, Biên bản nghiệm thu, Giấy ủy quyền); (d) quyền & nghiệp vụ chỉnh sửa phiếu QT của kế toán giữ nguyên; (e) sửa hồ sơ sau xuất PDF = tạo bộ mới (versioning); (f) đối soát thanh toán BH tại phiếu QT loại BH; (g) không tích hợp Driver+. Mở rộng FEAT-INS-STL-DETAIL để ghi nhận thanh toán BH nhiều đợt. **Thêm FEAT-INS-DASH-DEBT** (widget công nợ BH trên Dashboard) → epic 6→7 features, scope 85→86 features. Open Questions còn lại: Q1 (Priority/Wave), Q2 (Boundary chính), Q3 (Master data DN BH), Q4 sub (cách tính Giảm trừ bồi thường), Q5 mới (số đợt thanh toán BH tối đa). |
| 2026-05-27 | 5 | Business Authority + Senior PM | Resolve 2 Open Questions còn lại trong scope nghiệp vụ của `EP-INSURANCE-SETTLEMENT`: (a) **Giảm trừ bồi thường** cho phép nhập cả **% và số tiền** (UI toggle tương tự Chiết khấu liên kết BH); (b) **Đối soát thanh toán BH** **tái sử dụng chức năng ghi nhận thanh toán hiện hành** trên phiếu quyết toán baseline (FEAT-STL-DETAIL) — không phát triển thêm logic mới cho phiếu QT BH. Cập nhật mô tả FEAT-INS-STL-DETAIL (gỡ phần "mở rộng để ghi nhận thanh toán BH nhiều đợt"). Open Questions còn lại chỉ ở mức architecture/planning: Q1 (Priority/Wave), Q2 (Boundary chính), Q3 (Master data DN BH) — chờ Architect + Delivery Authority xác nhận, KHÔNG block phần nghiệp vụ. |
| 2026-05-27 | 11 | Business Authority + Senior PM | Cập nhật §3 Hồ sơ BH theo production design: thứ tự 4 tài liệu (1) Phiếu quyết toán (2) Phiếu báo giá (3) Biên bản nghiệm thu (4) Giấy ủy quyền nhận tiền bồi thường; ①② auto "Sẵn sàng", ③④ "Bổ sung" mẫu chung; UI modal (progress bar, 4 thẻ ngang có checkbox, preview, Xuất hồ sơ bảo hiểm). Đồng bộ FEAT-INS-DOSSIER-CREATE v4, EP v9, BR-EP v11. |
| 2026-05-27 | 12 | Business Authority + Senior PM | **Xoá 3 features FEAT-INS-COMPANY-LIST/CREATE/EDIT** — danh sách công ty BH là **system-seeded production** (garage chỉ chọn, không CRUD). EP-INSURANCE-SETTLEMENT 8 → **5 features**; tổng PRD 87 → **84 features**. Cập nhật §5.1 (count + boundary + bỏ "master data DN BH" khỏi tên epic), §EP detail block, §EP features table (gỡ 3 rows + note foundation), §phạm vi nghiệp vụ §6 (reframe danh sách công ty BH = baseline). Đồng bộ EP v11, README, UX-FLOW, BR-EP, FEAT-INS-SO-ADJUSTMENT/DASH-DEBT. |
| 2026-05-27 | 10 | Business Authority + Senior PM | **Xoá FEAT-INS-STL-CREATE** (tạo phiếu quyết toán đã production). Phần mới = truyền thêm thông tin phân bổ BH khi tạo phiếu QT → gộp vào FEAT-INS-SO-ADJUSTMENT (AC-15). EP-INSURANCE-SETTLEMENT 9 → **8 features**; tổng PRD 88 → **87 features**. Cập nhật §5.1 (count + boundary), §EP features table + detail block, §UX flow #10. Đồng bộ EP v8, README, UX-FLOW, BR-EP, FEAT-INS-STL-DETAIL/DOSSIER-CREATE. |
| 2026-05-27 | 9 | Business Authority + Senior PM | **Xoá FEAT-INS-SO-PAYMENT-SOURCE** (đã production, không dev đợt này). Năng lực chọn bên thanh toán per dòng ghi nhận là foundation thuộc EP-SERVICE-ORDER baseline. EP-INSURANCE-SETTLEMENT 10 → **9 features**; tổng PRD 89 → **88 features**. Cập nhật §5.1 (count + boundary), §EP detail block (Features 9, phạm vi §1 reframe Nguồn TT là baseline), §UX flow #10 (9 FEAT), logic conflict note. Đồng bộ EP v6, README, UX-FLOW, BR-EP. |
| 2026-05-27 | 8 | Business Authority + Senior PM | **FEAT-INS-SO-PAYMENT-SOURCE = BASELINE đã production**: năng lực chọn bên thanh toán (BH/KH) tại từng dòng phụ tùng & dịch vụ trên Phiếu dịch vụ đã được phát triển ở production — KHÔNG dev trong scope lần này. Đánh dấu trong §5.1 (10 features = 9 dev mới + 1 baseline) + §EP features table (priority "— baseline", note ĐÃ PRODUCTION). Tổng scope PRD giữ nguyên 89 features (functional surface). Đồng bộ EP v4, FEAT-INS-SO-PAYMENT-SOURCE v3 (status DONE). |
| 2026-05-27 | 7 | Business Authority + Senior PM | **Correction luồng nghiệp vụ phần phân bổ BH trên Phiếu dịch vụ**: chỉ ở màn hình **Chỉnh sửa (Edit) + Chi tiết (Detail), KHÔNG ở Tạo (Create)**. Luồng thực: Xe đến → cố vấn khám + lên đầu mục → tạo SO + báo giá sơ bộ (Create) → gửi BH duyệt → BH đưa phân bổ → garage Edit SO nhập phân bổ đã duyệt. Cập nhật §EP-INSURANCE-SETTLEMENT phạm vi nghiệp vụ §1. Đồng bộ artifacts: EP v3, FEAT-INS-SO-PAYMENT-SOURCE v2, FEAT-INS-SO-ADJUSTMENT v3, UX-FLOW v2, BR-EP v2. |
| 2026-05-27 | 6 | Business Authority + Senior PM | Resolve 3 Open Questions cuối: (a) **Master data Doanh nghiệp bảo hiểm cần phải có** — bổ sung 3 features CRUD mới (FEAT-INS-COMPANY-LIST, FEAT-INS-COMPANY-CREATE, FEAT-INS-COMPANY-EDIT) vào `EP-INSURANCE-SETTLEMENT`; cập nhật các điểm tham chiếu DN BH (SO, phiếu QT BH, hồ sơ BH, dashboard) chuyển từ free text sang dropdown master data; (b) **Template Phiếu báo giá trong Hồ sơ BH** tất cả trường **read-only**, render từ snapshot phiếu QT BH; (c) **Quyết định boundary chính** module BH tách khỏi BA Open Questions vì BA/PO không quyết định kiến trúc — Architect xử lý khi spawn dev. Cập nhật phạm vi nghiệp vụ §4.5 (chốt phân chia theo DN BH chính xác hơn), thêm §4.6 master data DN BH (5 trường tối thiểu + 1 NEED CONFIRMATION mở rộng). Cập nhật tổng scope EP-INSURANCE-SETTLEMENT 7→10 features, PRD 86→89 features. |
| 2026-06-16 | 17 | Business Authority | Gỡ con trỏ "Bối cảnh + quy ước: `Plan/INVENTORY-V2-RULES.md`" khỏi blockquote Inventory V2 forward-design (note file sắp xóa — Product độc lập). |
| 2026-07-08 | 18 | Business Authority (quannn) + main agent | **P2-c fix §5.1 Inventory V2 khối drift + thêm feature-flag `Inventory:InventoryV2` note** (audit W04 P2-c 2026-07-08). §5.1 Inventory V2 block: (a) blockquote `42 feature` → **`44 feature`** (sync tổng thực: 13+10+4+7+7+3); (b) thêm sub-blockquote **Feature-flag gate** — toàn subsystem V2 gate qua `Inventory:InventoryV2` default ON GA, Ops kill-switch per-tenant (CR-20260707-02 · `spring-feature-flag-starter`); (c) bảng row EP-INVENTORY-CATALOG count `12` → `13` (đã add FEAT-INV-MOBILE-MENU 2026-06-29 v12 README nhưng PRD chưa cascade); (d) bảng row EP-INVENTORY-ACCOUNTING-PERIOD boundary `gf-inventory` → **`gf-accounting`** (cascade EP v16 boundary move 2026-07-07); (e) bảng row EP-INVENTORY-OPENING-BALANCE count `3` → **`4`** (EP v4 đã add FEAT-OB-EDIT 2026-07-02 nhưng PRD chưa cascade); (f) title EP-INVENTORY-CATALOG bổ sung "+ hub mobile" reflect FEAT-INV-MOBILE-MENU. Consistency check pass: PRD §5.1 ↔ README §3 ↔ EP-* frontmatter. |
