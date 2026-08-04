---
type: architecture
artifact_kind: integration-frontend
status: ACTIVE
version: 18
tier: T1
owner_authority: Architecture Authority
boundary: garage-web
boundary_frontend: garage-web
boundary_bff: agg-garage-graph
last_reviewed: "2026-07-08"  # v18 W04 cascade agg-garage-graph-graphql.md v7.54 AP-Q1 removal vào §3.6b UI mapping table — 3 row cascade (Mở tab hierarchy hint text, Ô tìm kiếm alternative note, Đổi filter năm dropdown): bỏ mention "AP-Q1 fallback" / "searchAccountingPeriods flat search" / "redirect AP-Q1"; chuyển hint text "narrow qua year filter hoặc name LIKE cụ thể" per §3e.3 v7.54 tree cap rule. Pair với agg-garage-graph-HLD.md v13 + agg-garage-graph-graphql.md v7.59. v17 W04 Q2 fix — BA/PO chốt template `.xlsx` do FE quản lý. §3.6c UI Action row "Tải template": thay wording "query getOpeningBalanceTemplate → W04-2 GET /template → Response templateUrl S3 signed URL 15min" bằng "(none — FE bundled static asset) — FE bundle `Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx` sync vào `frontend/gf-gms-web/src/assets/`, render qua `<a href download>`". Không đụng Product docs. v16 W04 — Add §3.6c Inventory V2 Opening Balance + Stock Ledger foundation (web-only): 8 UI actions map → 7 GraphQL ops → 7 REST W04-1..W04-7. Route convention `/inventory/opening-balances*`. FE parses .xlsx browser-side (ADR-018/022); 500-cap FE first-check; idempotency-key FE-generated UUID. ERR-INV-024 UX message for period-lock reject.
---

# INTEG-FE - Garage Web <-> `agg-garage-graph`

> **FM-016 bắt buộc** - bảng ở mục 3 phải được điền trước mỗi wave DEV. DEV agent không được tự đoán operation GraphQL từ tên button, route hoặc component.

## 1. Thông tin Frontend

| Thuộc tính | Giá trị |
|---|---|
| Frontend | `gf-gms-web` / `garage-web` - React 19 + TypeScript + Vite SPA |
| HLD | [garage-web-HLD.md](../hld/garage-web-HLD.md) |
| BFF | `agg-garage-graph` |
| Schema | [agg-garage-graph-graphql.md](../api/agg-garage-graph-graphql.md) |
| Endpoint | `VITE_GRAPHQL_URI` |
| Apollo client | `src/layouts/home/common/home-client.ts`, `src/layouts/home/common/apollo-client.tsx` |
| Upload helpers | `src/hooks/use-files.ts`, `src/hooks/use-attachments.ts`, `apollo-upload-client` |
| Nhóm người dùng | garage operator, service advisor, inventory staff, purchase staff, CRM/marketing staff, admin |

## 2. Luồng xác thực theo route

| Route | Xác thực | Cổng UI | Ghi chú |
|---|---|---|---|
| `/_modules/*` | Có | Module shell token guard | Tất cả domain call dùng `HOME_CLIENT` trỏ tới `VITE_GRAPHQL_URI` |
| `/dashboard` | Có | Sidebar link `header.overview` | Domain KPI qua `agg-garage-graph`; Superset token đi qua `agg-sso-graph` |
| `/booking/*`, `/service-order/*`, `/settlement-voucher/*` | Có | Sidebar group `work_orders` | Sửa chữa, lịch hẹn, phiếu dịch vụ, quyết toán |
| `/quotation-requests/*`, `/purchase-requests/*`, `/purchase-orders/*`, `/suppliers/*`, `/linked-transporters/*` | Có | Sidebar group `operations` | Mua hàng và nhà cung cấp |
| `/inventory-*/*` | Có | Sidebar group `inventory` | Tồn kho, nhập kho, xuất kho, kỳ tồn, dịch vụ |
| `/customers/*`, `/vehicles/*`, `/segments/*` | Có | Sidebar group `customer` | Khách hàng, xe, phân khúc |
| `/campaign/*`, `/voucher-programs/*` | Có | Sidebar group `marketing` | Campaign và voucher |
| `/employees/*`, `/accounts/*`, `/permissions/*` | Có | Sidebar group `account`; một số menu đang comment trong code | HRMS, account, policy role |
| `/payment` | Có, đi qua `/_modules` token guard trong source | Route callback | Chỉ render callback/result; không tạo payment secret ở FE |

## 3. Ánh xạ UI Action -> GraphQL Operation

### 3.1 Shell và helper dùng chung

| UI / Kích hoạt trong code | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Mount module shell sau login, `useTenantInfo()` trong `layouts/home/modules/index.tsx` | `/_modules/*` | `query GetTenantInfo` | `src/hooks/use-tenant-info.ts` | Lưu tenant vào `useTenantInfoStore`; không tự cache dài hạn ngoài runtime store |
| Click sidebar `Link` trong `layouts/home/modules/index.tsx` render từ `MAIN_NAVIGATION` | Tất cả module route | Query list/detail của route đích | `src/layouts/home/modules/constants.ts` | Link chỉ điều hướng; query chạy trong feature component sau mount |
| Notification bell/list/read state trong module shell | Header/module shell | `query UnreadCountApiResponse`, `query GetNotifications`, `mutation MarkAllAsRead`, `mutation MarkAsRead` | `src/features/notifications/hooks/use-unread-count.ts`, `use-notifications.ts`, `use-read-all.ts`, `use-read.ts` | Source dùng shared `useQuery`/`useMutation` dưới `ApolloClientLayout` nên đi qua `HOME_CLIENT` -> `VITE_GRAPHQL_URI` |
| `MainFilter` thay đổi keyword/filter/page | Các list page | Query list tương ứng | `src/components/customs/filter/main-filter`, feature `use*ListForWeb` | Filter/pagination đi vào input query; refetch theo store của feature |
| Chọn file ở upload/drop-zone/attachment widget | Các form có attachment/import | `mutation UploadMultipleFiles`, `mutation UploadAttachment` | `src/hooks/use-files.ts`, `src/hooks/use-attachments.ts` | Dùng upload link; sau success refetch entity sở hữu file |
| Preview/download image/PDF bằng image quickview hoặc export helper | Detail/print/export UI | REST/download qua gateway base | `src/utils/rest-api.ts`, `src/components/share/images/image-quickview.tsx` | Không gọi trực tiếp storage service từ browser |
| Load card/payment method selector | Purchase request checkout/payment widgets | `query GetUserCards`, `query PrGetPaymentMethods` | `src/hooks/use-user-cards.ts`, `src/hooks/use-payment-methods.ts` | FE chỉ hiển thị lựa chọn; payment authority thuộc backend/provider |

### 3.2 Dashboard và company context

| UI / Kích hoạt trong code | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Click sidebar `header.overview` link tới `/dashboard` | `/dashboard` | `query GetDashboardRealtime` | `src/features/dashboard/hooks/use-get-dashboard-realtime.ts` | Render KPI cards; lỗi widget không được block shell |
| Header user popover `Link` "Thông tin công ty" | `/company-info` | `query GetTenantInfo` | `src/layouts/home/common/header.tsx`, `src/hooks/use-tenant-info.ts` | Company info dùng tenant context; chưa thấy mutation domain trong source hiện tại |

### 3.3 Booking

| UI / Kích hoạt trong code | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Click sidebar `header.work_orders.booking` hoặc route `/booking` | `/booking` | `query SearchBookingsV3` hoặc V2 `SearchBookings` qua feature flag | `src/features/booking/hooks/use-booking-list-for-web.ts`, `use-search-bookings.ts`, `use-search-bookings-v3.ts`, `use-search-bookings-v2.ts` | List query chạy qua `useBookingListForWeb()` -> `useSearchBookings()`; `FEATURE_FLAG_KEYS.SALE.SALES_MANAGEMENT_V01` chọn V3/V2 |
| `MainFilter` placeholder "Tìm kiếm biển số, tên khách, SĐT" | `/booking` | `query SearchBookingsV3` hoặc V2 `SearchBookings` qua feature flag | `src/features/booking/components/list/index.tsx`, `src/features/booking/hooks/use-search-bookings.ts` | Keyword/filter/page map vào `BookingSearchV3Request` khi V3 flag bật; nếu flag tắt dùng V2 input |
| `PageHeader` action button "Tạo lịch hẹn" | `/booking` -> `/booking/create` | Chỉ điều hướng; form submit gọi `CreateBookingV3` | `src/features/booking/components/list/index.tsx`, `src/features/booking/hooks/use-create-booking-v3.ts` | Button route sang create page |
| Link mã lịch hẹn trong cột "Mã lịch hẹn" | `/booking/$code/detail` | `query GetBookingByIdV3` | `src/features/booking/components/list/index.tsx`, `src/features/booking/hooks/use-booking-by-id-v3.ts` | `params.code` hiện dùng `row.original.id.toString()` |
| Icon `Edit` trong cột "Thao tác" | `/booking/$code/edit` | Chỉ điều hướng; form submit gọi `UpdateBookingV3` | `src/features/booking/components/list/index.tsx`, `src/features/booking/hooks/use-update-booking-v3.ts` | Chỉ enabled khi status `BOOKING` hoặc `BOOKED` |
| Button "Chỉnh sửa" ở `PageHeader.childrenRight` detail | `/booking/$code/detail` -> edit | Chỉ điều hướng; form submit gọi `UpdateBookingV3` | `src/features/booking/components/detail/index.tsx` | Chỉ hiện với status `BOOKING`/`BOOKED` |
| Button "Xác nhận lịch hẹn" mở dialog; button confirm trong dialog | Booking detail | `mutation ConfirmBookingV3` | `src/features/booking/components/detail/confirm-booking.tsx`, `src/features/booking/hooks/use-confirm-booking-v3.ts` | Success gọi `refetch()` detail |
| Button "Xe đã đến" mở dialog; button confirm trong dialog | Booking detail | `mutation ArriveBookingV3` | `src/features/booking/components/detail/arrive-booking.tsx`, `src/features/booking/hooks/use-arrive-booking-v3.ts` | Success gọi `refetch()` detail |
| Component `CancelBooking` trong `childrenRight` detail | Booking detail | `mutation CancelBookingV3` | `src/features/booking/components/detail/cancel-booking.tsx`, `src/features/booking/hooks/use-cancel-booking-v3.ts` | Chỉ hiện khi `BOOKED` và chưa linked service order |
| Component `RejectBooking` trong `childrenRight` detail | Booking detail | `mutation DeclineBookingV3` | `src/features/booking/components/detail/reject-booking.tsx`, `src/features/booking/hooks/use-decline-booking-v3.ts` | Chỉ hiện khi status `BOOKING` |
| Link/Button "Tạo phiếu dịch vụ" trong booking detail | Booking detail -> `/service-order/create` | Chỉ điều hướng; service order create dùng `CreateServiceOrderV3` | `src/features/booking/components/detail/index.tsx`, `src/features/service-order/hooks/use-service-order-create.ts` | Ghi `serviceOrderBookingId` vào `sessionStorage` để prefill |
| Customer/vehicle autocomplete trong booking form | Booking create/edit | `SuggestCustomerByPhone`, `SuggestCustomerByName`, `SuggestVehicleByPlate`, `SuggestVehicles`, `CheckAvailabilityV3` | `src/features/booking/hooks/use-suggest-*.ts`, `use-check-availability-v3.ts` | Debounce ở UI; không mutate customer/vehicle tại autocomplete |

### 3.4 Service order và settlement

| UI / Kích hoạt trong code | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Click sidebar `header.work_orders.service_order` | `/service-order` | `query SearchServiceOrdersV3` | `src/features/service-order/hooks/use-service-order-list.ts` | List + filter/pagination |
| Link/row detail service order từ list | `/service-order/$code` | `query GetServiceOrderByCode` | `src/features/service-order/hooks/use-service-order-detail.ts` | Route param `code` map vào query |
| PageHeader action create hoặc booking link "Tạo phiếu dịch vụ" | `/service-order/create` | `mutation CreateServiceOrderV3` khi submit form | `src/features/service-order/hooks/use-service-order-create.ts` | Form data map qua helper/schema của service order |
| Edit action/detail route | `/service-order/$code/edit` | `mutation UpdateServiceOrderV3` khi submit form | `src/features/service-order/hooks/use-service-order-update.ts` | Refetch detail/list sau success |
| Sale service-order create/detail/edit routes | `/service-order/sale/create`, `/service-order/sale/$code`, `/service-order/sale/$code/edit` | Service-order sale flow operations theo feature implementation | `src/config/route.ts`, `src/routes/_modules/_repair-services/service-order/sale/*`, service-order feature hooks | Nhánh bán lẻ tồn tại trong route tree; phải document riêng khi bổ sung action-level mapping |
| Detail lifecycle buttons: start/confirm/complete/cancel/send quotation | Service order detail | `StartServiceOrderV3`, `ConfirmServiceOrderV3`, `CompleteServiceOrderV3`, `CancelServiceOrderV3`, `SendQuotationV3` | `src/features/service-order/hooks/use-start-service-order.ts`, `use-confirm-service-order.ts`, `use-complete-service-order.ts`, `use-cancel-service-order.ts`, `use-send-quotation.ts` | Các button đổi trạng thái phải có loading/confirm rõ ràng |
| Parts/stock widget trong service order form/detail | Service order form/detail | `query GetTotalStockBySkus` | `src/features/service-order/hooks/use-get-total-stock-by-skus.ts` | SKU đã chọn map vào `GetTotalStockBySkusInput` |
| Print/export image action ở detail | Service order detail | `query ExportServiceOrderToImage` | `src/features/service-order/hooks/use-print-service-order-image.ts` | FE chỉ preview/download artifact |
| Click sidebar/route "Phiếu quyết toán" | `/settlement-voucher` | `query SearchSettlements` | `src/features/settlement-voucher/hooks/use-search-settlements.ts` | List query |
| Link mã settlement hoặc route detail | `/settlement-voucher/$code` | `query GetSettlementByCode` | `src/features/settlement-voucher/hooks/use-get-settlement-by-code.ts` | Route param `code` |
| Settlement create form submit | `/settlement-voucher/create` | `mutation CreateSettlement` | `src/features/settlement-voucher/hooks/use-create-settlement.ts` | Success điều hướng/refetch theo callback |
| Detail edit/save action | Settlement detail | `mutation UpdateSettlement` | `src/features/settlement-voucher/hooks/use-update-settlement.ts` | Code + form input |
| Detail cancel action | Settlement detail | `mutation CancelSettlement` | `src/features/settlement-voucher/hooks/use-cancel-settlement-voucher.ts` | Confirm trước khi gọi mutation |
| Add payment action trong settlement detail | Settlement detail | `mutation RecordServiceOrderPaymentByCode` | `src/features/settlement-voucher/hooks/use-add-settlement-payment.ts` | Payment form phải có success/error rõ ràng |
| Finalize/update actual quantities action | Settlement detail | `FinalizeServiceOrderAmounts`, `UpdateActualQuantities` | `src/features/settlement-voucher/hooks/use-finalize-service-order-amounts.ts`, `use-update-actual-quantities.ts` | Backend là authority cho amount/quantity |

#### 3.4b Insurance Settlement (DESIGN — EP-INSURANCE-SETTLEMENT, ADR-014; chưa có trong source)

> ⚠️ UI Action → GraphQL → REST. Section điều chỉnh BH + cột Nguồn TT **chỉ ở Edit/Detail, KHÔNG Create** (BR-INS-SO-PS-006). Backend là authority cho amount.

| UI / Kích hoạt | Route/Màn hình | GraphQL Operation | → REST downstream | Ghi chú |
|---|---|---|---|---|
| Nhập 5 khoản điều chỉnh BH + chọn Nguồn TT per dòng (Edit/Detail) | `/service-order/$code/edit` | `mutation UpdateServiceOrderV3` (additive allocation input) | `PUT /api/v3/service-orders/:id` (gf-sales) | Bảng tổng BH/KH thanh toán realtime; VLD-INS-SO-003/004/005 |
| Mở tab "Chi tiết phiếu QT BH" | `/settlement-voucher/$code` | `query GetSettlementByCode` (block insurance) | `GET /api/v1/settlements/:code` (gf-accounting) | Panel công nợ + lịch sử thanh toán |
| Ghi nhận đợt thanh toán BH | Settlement BH detail | `mutation RecordInsurancePayment` | `POST /api/v1/settlements/:code/insurance-payments` (gf-accounting) | Trạng thái "Chưa/Một phần/Đủ thu" derived |
| Tạo bộ Hồ sơ BH (4 tài liệu) | `/settlement-voucher/$code/insurance-dossier` | `mutation CreateInsuranceDossier` | `POST /api/v1/insurance-dossiers` (gf-accounting) | ①② auto READY, ③④ Bổ sung |
| Điền ③ biên bản / template ④ / upload scan | Dossier editor | `mutation UpdateDossierDocument` (`Upload` scalar) | `PUT /api/v1/insurance-dossiers/documents/:docId` | File ≤10MB PDF/JPG/PNG (VLD-INS-DOSSIER-002) |
| Xuất PDF (tài liệu tích chọn) | Dossier editor | `mutation ExportInsuranceDossier` | `POST /api/v1/insurance-dossiers/:dossierId/export` | KHÔNG bắt buộc 4/4 (BR-INS-DOSSIER-005); version immutable |
| Tạo bản hồ sơ mới (BH yêu cầu sửa) | Dossier view | `mutation CreateInsuranceDossierVersion` | `POST /api/v1/insurance-dossiers/:settlementCode/versions` | Option sao chép từ vN |
| Tab "Hồ sơ đã xuất" (read-only, versioning) | `/settlement-voucher/$code/insurance-dossier` | `query GetInsuranceDossierVersions` | `GET /api/v1/insurance-dossiers/:settlementCode` | List version + preview |
| Tải/preview PDF hồ sơ | Dossier view | `query GetInsuranceDossierDownloadUrl` | `GET /api/v1/insurance-dossiers/documents/:docId/download` | Signed URL TTL |
| Widget công nợ BH + filter kỳ | `/` (Dashboard) | `query GetInsuranceDebtWidget` | `GET /api/v2/dashboard/insurance-debt-widget` (gf-sales→gf-accounting) | 3 KPI + 2 top-list; drill-down → phiếu QT BH |

### 3.5 Purchase, supplier, transporter

| UI / Kích hoạt trong code | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Sidebar link `header.operations.quotation_requests` | `/quotation-requests` | `query SearchQuotationAsksForWeb` | `src/features/quotation-requests/hooks/use-quotation-requests-list-for-web.ts` | List query |
| Link mã quotation request | `/quotation-requests/$code` | `query QuotationAskV3ByCode` | `src/features/quotation-requests/hooks/use-quotation-ask-by-code.ts` | Detail query; histories dùng `QuotationAskHistories` |
| Create quotation request form submit | `/quotation-requests/create` | `CreateQuotationAskV3`, `CreateSalesQuotationAsk` | `src/features/quotation-requests/hooks/use-create-quotation-requests.ts`, `use-create-sales-quotation-ask.ts` | Form chọn parts/catalog/supplier |
| Button/action tạo purchase request từ quotation | Quotation detail | `mutation AddPurchaseRequestV2` | `src/features/quotation-requests/hooks/use-add-purchase-request-v2.ts` | Success điều hướng sang PR/detail |
| Quotation form helper UI: part/catalog/preliminary/preference selectors | Quotation create/detail | `GetMdmParts`, `SearchCatalog`, `GetPreliminaryQuotation`, `GetPreferences`, `QuotationAskTenantInvoiceInfo` | `src/features/quotation-requests/hooks/use-*.ts` | Read-side helper, không ghi local catalog |
| Checkbox `Yêu cầu xuất hóa đơn` trong quotation create form | `/quotation-requests/create` | `query QuotationAskTenantInvoiceInfo` khi checkbox bật; `mutation CreateQuotationAskV3` khi submit | `src/features/quotation-requests/components/create/quotation-request-form.tsx`, `src/features/quotation-requests/hooks/use-quotation-ask-tenant-invoice-info.ts`, `src/features/quotation-requests/hooks/use-create-quotation-requests.ts` | `QuotationAskTenantInvoiceInfo` prefill/lock các field `invoiceCompanyName`, `taxCode`, `invoiceCompanyEmailAddress`, `invoiceCompanyAddress`; submit gửi `isInvoiceRequired` và các field invoice trong payload tạo YCBG |
| Card `Yêu cầu xuất hóa đơn` trong quotation detail | `/quotation-requests/$code` | `query QuotationAskV3ByCode` | `src/features/quotation-requests/components/detail/invoice-info.tsx`, `src/features/quotation-requests/hooks/use-quotation-ask-by-code.ts` | Hiển thị `Tên công ty`, `Mã số thuế`, `Email công ty`, `Địa chỉ` nếu `isInvoiceRequired=true`; nếu false hiển thị `Không yêu cầu xuất hóa đơn` |
| Sidebar link `header.operations.purchase_requests` | `/purchase-requests` | `query SearchPurchaseRequestsForWeb` | `src/features/purchase-requests/hooks/use-purchase-requests.ts` | List query |
| Link mã purchase request | `/purchase-requests/$code` | `query GetPurchaseRequestDetailByCode` | `src/features/purchase-requests/hooks/use-purchase-request-detail.ts` | Detail query |
| Checkout QR/CC buttons trong PR checkout/detail | Purchase request detail/checkout | `PrCheckoutQR`, `PrCheckoutCC` | `src/features/purchase-requests/hooks/use-checkout-pr.ts`, `use-checkout-cc.ts` | Trả payment response/redirect; không lưu card secret ở FE |
| Place order button/action | Purchase request detail | `mutation PrPlaceOrder` | `src/features/purchase-requests/hooks/pr-place-order.ts` | PR id + place order payload |
| Cancel purchase request action | Purchase request detail | `mutation CancelPurchaseRequest` | `src/features/purchase-requests/hooks/use-cancel-purchase-request.ts` | Require reason/input; refetch detail |
| Sidebar link `header.operations.orders` | `/purchase-orders` | `SearchDirectPurchaseOrders` hoặc `SearchPurchaseOrdersForWeb` | `src/features/purchase-orders/v3/hooks/use-orders-list-for-web.ts`, `v2/hooks/use-orders-list-for-web.ts` | V2/V3 cùng tồn tại |
| Link mã purchase order | `/purchase-orders/$code` | `GetPurchaseOrderDetailV3` hoặc `GetPurchaseOrderByCode` | `src/features/purchase-orders/v3/hooks/use-order-detail.ts`, `v2/hooks/use-order-detail.ts` | Route implementation quyết định version |
| Purchase order create/edit form submit | `/purchase-orders/create`, `/purchase-orders/$code/edit` | `CreateDirectPurchaseOrder`, `UpdateDirectPurchaseOrder`, legacy `CreatePurchaseOrder` | `src/features/purchase-orders/v3/hooks/use-create-purchase-order.ts`, `use-update-purchase-order.ts`, `v2/hooks/use-create-purchase-order.ts` | Form data map vào PO input |
| PO status/received/attachment actions | Purchase order detail | `UpdateDirectPurchaseOrderStatus`, `ConfirmReceivedPurchaseOrderByCode`, `UpdateDirectPurchaseOrderAttachments` | `src/features/purchase-orders/v3/hooks/use-change-purchase-order-status.ts`, `use-confirm-received-purchase-order.ts`, `use-update-direct-purchase-order-attachments.ts` | Success refetch detail |
| Sidebar link `header.operations.suppliers` | `/suppliers` | `query SearchSuppliers` | `src/features/suppliers/hooks/use-get-suppliers.ts` | List query |
| Supplier create/edit form submit | `/suppliers/create`, `/suppliers/$id/edit` | `CreateSupplier`, `UpdateSupplier` | `src/features/suppliers/hooks/use-create-supplier.ts`, `use-update-supplier.ts` | Warehouse selector dùng `SearchWarehouses` |
| Supplier detail/status toggle button | Supplier detail/list | `ToggleSupplierStatus` | `src/features/suppliers/hooks/use-toggle-supplier-status.ts` | Nên confirm khi suspend/reactivate |
| Sidebar link "Nhà xe liên kết" | `/linked-transporters` | `SearchTenantTransporterRegistries` | `src/layouts/home/modules/constants.ts`, `src/features/linked-transporters/hooks/use-linked-transporters.ts` | Navigation item dùng resource `LINKED_TRANSPORTER`, feature flag `PURCHASE.PURCHASE_V02`; list query chạy sau khi route mount |
| Button `Thêm nhà xe liên kết` | `/linked-transporters` -> `/linked-transporters/create` | Chỉ điều hướng; submit gọi `CreateTenantTransporterRegistry` | `src/features/linked-transporters/index.tsx`, `src/features/linked-transporters/components/create/index.tsx` | Button trên `PageHeader` list |
| Button `Tạo mới` và dialog `Xác nhận tạo nhà xe liên kết` | `/linked-transporters/create` | `mutation CreateTenantTransporterRegistry` | `src/features/linked-transporters/components/create/index.tsx`, `src/features/linked-transporters/hooks/use-create-linked-transporter.ts` | Form gửi `transporterName`, `routeContactPhoneNumber`, `shippingAddress`, `routeName`, `routeStartedAt`, `note`, `isActive`; có route return về quotation detail khi tạo từ order-confirm flow |
| Button `Cập nhật` và dialog `Xác nhận cập nhật nhà xe liên kết` | `/linked-transporters/$id/edit` | `mutation UpdateTenantTransporterRegistry` | `src/features/linked-transporters/components/edit/index.tsx`, `src/features/linked-transporters/hooks/use-update-linked-transporter.ts` | Detail/edit prefill từ `useLinkedTransporterDetail`; submit update theo `id` route |
| Button/icon `Xóa` và dialog `Xác nhận xóa nhà xe liên kết` | `/linked-transporters`, `/linked-transporters/$id` | `query GetTenantTransporterRegistryReferences`, sau đó `mutation DeleteTenantTransporterRegistry` nếu không bị tham chiếu | `src/features/linked-transporters/index.tsx`, `src/features/linked-transporters/components/detail/index.tsx`, `src/features/linked-transporters/hooks/use-delete-linked-transporter.ts`, `src/features/linked-transporters/components/delete-reference-description.tsx` | Pre-check reference bằng `copTransporterRegistryId`; nếu có PR/PO liên quan hiển thị `Không thể xóa bản ghi nhà xe liên kết` và không gọi delete |

### 3.6 Inventory

| UI / Kích hoạt trong code | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Sidebar link `stock_inventory` | `/inventory-stock` | `query SearchInventoryStocks` | `src/features/inventory-stock/hooks/use-search-inventory-stocks.ts` | List/filter query |
| Click editable quantity cell | `/inventory-stock` | `mutation AdjustStockQuantity` | `src/features/inventory-stock/components/list/editable-quantity-cell.tsx`, `hooks/use-adjust-stock-quantity.ts` | Modal submit điều chỉnh tồn |
| Click editable suggested price cell | `/inventory-stock` | `mutation UpdateStockPrice` | `src/features/inventory-stock/components/list/editable-suggested-price-cell.tsx`, `hooks/use-update-stock-price.ts` | Modal submit cập nhật giá |
| Open stock history widget/drawer | `/inventory-stock` | `query GetHistoryStock` | `src/features/inventory-stock/hooks/use-history-stock.ts` | Stock/product/warehouse map vào input |
| Sidebar link `inventory_receipt` | `/inventory-receipt` | `query SearchReceipts` | `src/features/inventory-receipt/hooks/use-search-receipts.ts` | List query |
| Receipt create/edit form submit | `/inventory-receipt/create`, `/inventory-receipt/$code/edit` | `CreateReceipts`, `UpdateReceipts` | `src/features/inventory-receipt/hooks/use-create-receipt.ts`, `use-update-receipt.ts` | Form selector có `SearchProducts`, `SearchGroupedProductApiResponse`, `GetPurchaseOrderForReceipt` |
| Receipt lifecycle buttons | Receipt detail | `CancelReceipts`, `CompleteReceipts`, `ReverseReceipts` | `src/features/inventory-receipt/hooks/use-cancel-receipt.ts`, `use-complete-receipt.ts`, `use-reverse-receipt.ts` | Backend kiểm soát state transition |
| Sidebar link `inventory_delivery` | `/inventory-delivery` | `query SearchDeliveries` | `src/features/inventory-delivery/hooks/use-search-deliveries.ts` | List query |
| Delivery create/edit form submit | `/inventory-delivery/create`, `/inventory-delivery/$code/edit` | `CreateDelivery`, `UpdateDelivery` | `src/features/inventory-delivery/hooks/use-create-delivery.ts`, `use-update-delivery.ts` | Parts selector dùng `SearchDeliveryProducts`, `GetPartsForDeliveryV3` |
| Delivery lifecycle buttons | Delivery detail | `CancelDelivery`, `CompleteDelivery`, `ReverseDelivery` | `src/features/inventory-delivery/hooks/use-cancel-delivery.ts`, `use-complete-delivery.ts`, `use-reverse-delivery.ts` | Confirm cho cancel/reverse |
| Sidebar link `inventory_period` | `/inventory-period` | `query SearchPeriodStocks` | `src/features/inventory-period/hooks/use-search-inventory-periods.ts` | Read-only period report trong source hiện tại |
| Sidebar link `inventory_services` | `/inventory-services` | `query SearchServices` | `src/features/inventory-service/hooks/use-service-list.ts` | List query |
| Inventory service create/edit form submit | `/inventory-services/create`, `/inventory-services/$id/edit` | `CreateService`, `updateService` operation alias `Mutation` | `src/features/inventory-service/hooks/use-create-service.ts`, `use-update-service.ts` | Detail dùng `GetServiceById` |

#### 3.6a Inventory V2 — Catalog-v2 + Accounting Period (DESIGN — ADR-017/018/019)

> ⚠️ **Web-only batch**: V2 catalog + AP slice CHỈ trên Garage Care Web GMS (UX-FLOW-INVENTORY-CATALOG.md:34 "Garage Care Web GMS only"). Mobile out of scope — future expansion = CR riêng. Authoritative source: `Architecture/api/gf-inventory-api.md §3a.4` + `Architecture/api/agg-garage-graph-graphql.md §3d`.

| UI / Kích hoạt | Route/Màn hình | GraphQL Operation | → REST downstream | Ghi chú |
|---|---|---|---|---|
| Tab "Nhóm VTHH" — list/filter (flat-grouped-by-parent) | `/inventory-catalog/material-groups` | `query searchMaterialGroups(input: {keyword, parentId, status, page, size, sort: "default"})` | V2-1 `POST /api/v2/material-groups/search` (gf-inventory) | Paged list + `keyword` OR-match name/code (single search-box UX, BR-CAT-GRP-013); default ordering = `(parent_path, display_order, id)` — siblings adjacent; FE render parent header từ `parentName` enrichment (duplicate khi group spans pages). Default `status=ACTIVE` (R5). |
| Tab "Mã SP" — list/filter (R10) | `/inventory-catalog/internal-products` | `query searchInternalProducts(input: {keyword, status, nature, materialGroupId, page, size, sort})` | V2-7 `POST /api/v2/internal-products/search` (gf-inventory) | R10: GET→POST + `keyword` OR-match **3 columns** (`internal_product.code` + `name` + legacy `product.sku` qua mapping join). Default `status=ACTIVE`, `sort=updatedAt,desc`. BFF passthrough. |
| Tab "Nhóm VTHH" — cây phân cấp | `/inventory-catalog/material-groups` (tree view) | `query getMaterialGroupTree()` | V2-2 `GET /api/v2/material-groups/tree` | MAX 1000 nodes/tenant — vượt → BFF 413 redirect V2-Q1 |
| Thêm nhóm VTHH | Modal `/inventory-catalog/material-groups` | `mutation createMaterialGroup(input)` | V2-4 `POST /api/v2/material-groups` | Validate regex + tenant-unique `ERR-INV-001/002` |
| Sửa nhóm VTHH | Modal | `mutation updateMaterialGroup(id, input)` | V2-5 `PUT /api/v2/material-groups/{id}` | `code` immutable; cycle check `ERR-INV-003` |
| Xóa nhóm VTHH | Modal confirm | `mutation deleteMaterialGroup(id)` | V2-6 `DELETE /api/v2/material-groups/{id}` | Guard `ERR-INV-004/005` (có SP hoặc có children) |
| Detail mã SP | `/inventory-catalog/internal-products/$id` | `query getInternalProduct(id)` | V2-8 | R10: history endpoint V2-9 REMOVED (BA chốt no history audit); FEAT-CAT-PROD-DETAIL v3 đã bỏ tab "Lịch sử" (2026-06-16). |
| Thêm mã SP | `/inventory-catalog/internal-products/create` | `mutation createInternalProduct(input)` | V2-10 `POST /api/v2/internal-products` | UoM validate qua gf-erp-mdm; `ERR-INV-006/007/012/013/014/015` |
| Sửa mã SP | `/inventory-catalog/internal-products/$id/edit` | `mutation updateInternalProduct(id, input)` | V2-11 `PUT /api/v2/internal-products/{id}` | `code` immutable; status INACTIVE blocks future use |
| Xóa mã SP | Modal confirm | `mutation deleteInternalProduct(id)` | V2-12 `DELETE /api/v2/internal-products/{id}` | Guard `ERR-INV-008` (đã giao dịch) |
| Modal "Gắn SKU" — search | Modal trong detail mã SP | `query searchSkus(q, unmapped: true)` | V2-23 `GET /api/v2/skus/search` | Trả `mappingStatus: UNMAPPED/MAPPED_OTHER/MAPPED_SELF` |
| Modal "Gắn SKU" — gắn / bỏ gắn | Modal | `mutation mapSkuToInternalProduct(id, productId)` / `unmapSkuFromInternalProduct(id, productId)` | V2-13 / V2-14 | R9: arg `skuId` → `productId` (= legacy `product.id`, FK column tường minh); mutation names + business term "SKU" preserved. Bỏ gắn chỉ xóa mapping row, KHÔNG xóa legacy `product`. |
| Modal "ĐVT quy đổi" — add/update/delete | Modal trong detail mã SP | `addConversionUom` / `updateConversionUom` / `deleteConversionUom` | V2-15 / V2-16 / V2-17 | `conversionRate > 0`; UoM unique trong mã SP |
| Attachment — add/delete | Modal trong detail mã SP | `addInternalProductAttachment` / `deleteInternalProductAttachment` | V2-18 / V2-19 | ≤10MB PDF/JPG/PNG `ERR-CMN-004/005` |
| Import bulk — bước "Kiểm tra dữ liệu" | `/inventory-catalog/internal-products/import` (wizard step 2) | `mutation verifyImportInternalProducts(input)` | V2-20 `POST /api/v2/internal-products/verify-import` | Cap 500 rows BFF+BE (ADR-018); read-only preview |
| Import bulk — bước "Kết quả" | Wizard step 3 | `mutation importInternalProducts(input)` | V2-21 `POST /api/v2/internal-products/import` | Cap 500 rows; commit valid rows; bỏ qua error rows |
| Export `.xlsx` theo filter | `/inventory-catalog/internal-products` action | `query exportInternalProducts(filter: {keyword, status, nature, materialGroupId})` → file URL | V2-22 `POST /api/v2/internal-products/export` (body subset V2-7 — R15 align search filter) | Format flag-only (deferred BA decision F8) |

#### 3.6b Accounting Period (Kỳ kế toán) — DESIGN ADR-019 (gf-accounting module, NOT gf-inventory)

> ⚠️ **Web-only batch + boundary correction**: 5 features FEAT-AP-LIST/CREATE/DETAIL/EDIT/DELETE CHỈ trên Garage Care Web GMS (UX-FLOW-INVENTORY-ACCOUNTING-PERIOD line 31 "Garage Care Web GMS only"). Mobile out of scope. **Backend module = `gf-accounting/accounting-period`** (NOT `gf-inventory`) per Delivery Authority boundary correction 2026-06-23, CLAUDE override 2026-06-24, ADR-019. BA frontmatter trên Product files (EP/FEAT/BR) vẫn ghi `boundary: gf-inventory` (chưa fix — OQ1). Authoritative source: `Architecture/api/gf-accounting-api.md §4` (7 REST endpoints) + `Architecture/api/agg-garage-graph-graphql.md §3e` (7 GraphQL ops AP-Q1..Q4, AP-M1..M3). Tree size cap cross-ref §3e.3 (MAX 500 periods/tenant → BFF HTTP 413). Lock-check cache 30s LRU scope `(tenantId, date)`.
>
> Route convention (proposal — verify với FE team khi implement): `/accounting/periods` (tab "Kỳ kế toán" trong khu vực danh mục per UX-FLOW §1; có thể nằm dưới `/inventory-catalog/accounting-periods` nếu FE quyết định tab grouping theo current UX baseline). Final route quyết bởi FE.

| UI / Kích hoạt | Route/Màn hình (proposal) | GraphQL Operation | → REST downstream (gf-accounting) | Ghi chú |
|---|---|---|---|---|
| Mở tab "Kỳ kế toán" → render cây phân cấp | `/accounting/periods` | `query searchAccountingPeriodTree(input: {year: currentYear})` | AP-Q2 `POST /api/v2/accounting-periods/tree` (body `{year}`) | Default year = current year (BR-AP-015 / FEAT-AP-LIST AC-6). Cây 3 cấp Năm→Quý→Tháng (BR-AP-003). Cap 500 nodes BFF defense-in-depth → HTTP 413 hint "narrow qua year filter hoặc name LIKE cụ thể" per §3e.3 v7.54 (AP-Q1 flat search removed v7.54 — không còn fallback). |
| Ô tìm kiếm theo tên (trong tab cây) | `/accounting/periods` | `query searchAccountingPeriodTree(input: {year, name: "..."})` | AP-Q2 `POST /api/v2/accounting-periods/tree` (body `{year, name}`) | **R4 — name search trong tree**: LIKE-unaccent trên `accounting_period.name` (single column, match bất kỳ Năm/Quý/Tháng). Tree response trả matching node + ancestor path + descendant subtree preserved. Khi name rỗng → behavior cũ (full tree theo year). AP-Q1 flat `searchAccountingPeriods` **removed v7.54** — tree query là single mapping cho FEAT-AP-LIST. |
| Đổi filter năm (dropdown) | `/accounting/periods` | `query searchAccountingPeriodTree(input: {year: {Y}, name?})` | AP-Q2 | Tree default; vượt cap 500 → narrow qua `year` filter hoặc `name` LIKE cụ thể per §3e.3 v7.54 (không còn AP-Q1 fallback). |
| Bấm "Thêm kỳ kế toán" → mở form | `/accounting/periods` modal hoặc `/accounting/periods/create` | (mở form local, chưa gọi GraphQL) | — | Form pre-fill defaults (`status: OPEN`, `displayOrder: 0`). |
| Submit form Tạo kỳ (single, không tự sinh) | Form modal/route | `mutation createAccountingPeriod({name, type, parentId?, startDate, endDate, status, displayOrder, description})` | AP-M1 `POST /api/v2/accounting-periods` | Validate hierarchy + overlap (BR-AP-006/007/008) → `ERR-INV-021/022/023`. |
| Submit form Tạo kỳ + tick "Tự động sinh kỳ" | Form modal/route | `mutation createAccountingPeriod({..., autoGenerateChildren: true})` | AP-M1 (atomic) | Năm + tick → 1+4+12 = 17 rows atomic; Quý + tick → 1+3 = 4 rows atomic. Skip existing siblings → response `{generated: {created, skipped, skippedDetails}}` → UI toast "Đã tạo X kỳ, bỏ qua Y kỳ đã tồn tại" (FEAT-AP-CREATE AC-8). Tháng không có flag (BR-AP-009). |
| Click icon "Xem" cột Thao tác → mở chi tiết | `/accounting/periods/$id` | `query getAccountingPeriod(id)` | AP-Q3 `GET /api/v2/accounting-periods/{id}` | Read-only display + audit (createdAt/createdBy/updatedAt/updatedBy) + parentBreadcrumb (BR-AP-CMN-001). |
| Click "Sửa" trong chi tiết hoặc danh sách → mở form sửa | `/accounting/periods/$id/edit` | `query getAccountingPeriod(id)` (pre-fill) → `mutation updateAccountingPeriod(id, {name, description, displayOrder, status})` | AP-Q3 + AP-M2 `PUT /api/v2/accounting-periods/{id}` | Form lock các field immutable (type/parentId/startDate/endDate/autoGenerateChildren) per BR-AP-016 → display only. Vi phạm submit → **`ERR-AP-001`** (R2 F1 fix — NEW namespace `ERR-AP-*` pending BA register, OQ7; **switched từ `ERR-INV-032` đã collide với BR-OB-008 FEAT-OB-IMPORT registry:130**). |
| Đổi trạng thái "Đã đóng kỳ" dropdown trong form sửa | `/accounting/periods/$id/edit` | `mutation updateAccountingPeriod(id, {status: "CLOSED" | "OPEN"})` | AP-M2 | Đối xứng OPEN ⇄ CLOSED (BR-AP-010/011 — cho mở lại). KHÔNG ràng buộc thứ tự đóng cha/con. CLOSED → trigger downstream khóa phiếu (BR-AP-012); UI toast confirm. |
| Click icon "Xóa" → mở popup xác nhận | `/accounting/periods` modal | (mở popup local — fetch eligibility via cached AP detail) | — | Popup hiển thị tên kỳ + nhắc "Chỉ xóa được kỳ chưa đóng và chưa phát sinh dữ liệu kho liên quan" (FEAT-AP-DELETE AC-1). |
| Submit xóa | Popup confirm | `mutation deleteAccountingPeriod(id)` | AP-M3 `DELETE /api/v2/accounting-periods/{id}` | 3-guard backend → `ERR-INV-025` (CLOSED hoặc có data) hoặc `ERR-INV-026` (còn kỳ con) → popup "Không thể xóa" (FEAT-AP-DELETE AC-4/5). |
| (advisory internal) Tạo phiếu nhập/xuất / OB / PRC pre-check ngày | Trong các form FEAT khác | `query checkAccountingPeriodLock(date: "YYYY-MM-DD")` | AP-Q4 `GET /protected/v1/accounting-periods/lock-check?date=` (S2S — BFF proxies x-api-key) | Fail-fast UX khi user nhập ngày rơi vào CLOSED period. Cache 30s LRU `(tenantId, date)`. Authoritative re-check tại backend commit (advisory only — INTEG-EXT-gf-accounting §6.2). Future FEAT-IRV2/IDV2/OB/PRC integrate. |

#### 3.6c Inventory V2 — Opening Balance + Stock Ledger foundation (DESIGN — W04, ADR-020/021/022)

> ⚠️ **Web-only wave for CRUD** (import/edit/delete): 4 features FEAT-OB-LIST/IMPORT/EDIT/DELETE-LINES CHỈ trên Garage Care Web GMS (UX-FLOW-INVENTORY-OPENING-BALANCE §29). App Garage view-only list (per §3.4 in `INTEG-MOB-...` §3.4b). Backend module = `gf-inventory/opening-balance` per ADR-022. BFF module = `gf-inventory/opening-balance` (BFF §3g authored `agg-garage-graph-graphql.md v7.43 §3g`).
>
> **Route convention** (proposal — verify với FE team khi implement): `/inventory/opening-balances` (tab "Tồn đầu kỳ" — màn mặc định FEAT-OB-LIST AC-1). Sub-routes: `/inventory/opening-balances/import` (wizard 2-step); popup modal cho edit + delete + delete-lines.

| UI / Kích hoạt | Route/Màn hình (proposal) | GraphQL Operation | → REST downstream (gf-inventory) | Ghi chú |
|---|---|---|---|---|
| Mở tab "Tồn đầu kỳ" → render danh sách paged + dòng Tổng | `/inventory/opening-balances` | `query searchOpeningBalances(input: {page: 0, size: 20, sort: "createdAt,desc"})` | W04-1 `POST /api/v2/opening-balances/search` | Default `size=20`, sort DESC `createdAt` (BR-OB-014). `content[]` + `aggregates.totalQuantity/totalValue` renders dòng Tổng (FEAT-OB-LIST AC-3). |
| Ô tìm kiếm mã/tên sản phẩm | `/inventory/opening-balances` | `searchOpeningBalances(input: {keyword: "Lốp"})` | W04-1 | LIKE trên `product_code` + `product_name` (BR-OB-014). |
| 3 bộ lọc: Kho / Người import / Ngày Import | `/inventory/opening-balances` | `searchOpeningBalances(input: {warehouseId, createdBy, importedFrom, importedTo})` | W04-1 | FEAT-OB-LIST AC-5. |
| Bấm link "Tải template" trong wizard | `/inventory/opening-balances/import` (section "Thông tin cơ bản") | (none — FE bundled static asset) | (none — FE static asset) | FE bundle `Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx` sync vào `frontend/gf-gms-web/src/assets/`. Render qua `<a href={bundled_url} download="Mẫu Import tồn đầu kỳ.xlsx">` hoặc `fetch(bundled_url).then(blob → saveAs)`. Zero BFF/BE call. Browser cache immutable bundle. Cập nhật template = rebuild FE. (BA/PO chốt 2026-07-06 — Q2 fix.) |
| Chọn file `.xlsx` → wizard step 2 preview | `/inventory/opening-balances/import` (bước 2) | `mutation verifyImportOpeningBalances(input)` | W04-3 `POST /api/v2/opening-balances/verify-import` | FE parses `.xlsx` browser-side (SheetJS per ADR-018 mirror). FE first-check `.xlsx` extension + non-empty + rows.length ≤ 500 (`ERR-INV-048`); BFF re-check defensive cap; BE re-check authoritative. Response render cards (Tổng/Hợp lệ/Lỗi/Kho) + bảng preview + button "Xác nhận import" disabled nếu `canCommit=false` (BR-OB-004a). |
| Bấm "Xác nhận import" | `/inventory/opening-balances/import` (bước 3) | `mutation importOpeningBalances(input, idempotencyKey: "OB-IMPORT-{tenantId}-{uuid}")` | W04-4 `POST /api/v2/opening-balances/import` + header `X-Idempotency-Key` | FE generate UUID trước gọi; retry safe. All-or-nothing (BR-OB-004a); response `importedRows == totalRows` + `cascadedKeys[]`. Result card = FEAT-OB-IMPORT AC-8. |
| Icon ✏️ sửa dòng | Modal `/inventory/opening-balances` | `mutation updateOpeningBalanceLine(id, input)` | W04-5 `PUT /api/v2/opening-balances/{id}` | Form 6 field (FEAT-OB-EDIT AC-2). Guardrails: `ERR-INV-024/034/035/036` (BR-OB-EDIT-002..005). ĐVT readonly (auto-derive từ `productCode` selection). |
| Icon 🗑️ xóa dòng đơn | Modal confirm | `mutation deleteOpeningBalanceLine(id)` | W04-6 `DELETE /api/v2/opening-balances/{id}` | FEAT-OB-LIST AC-11. Popup xác nhận. `ERR-INV-024/036` block. |
| Checkbox chọn ≥ 1 dòng → nút "Xóa dòng đã chọn" | Modal confirm | `mutation deleteOpeningBalanceLines(input: {ids})` | W04-7 `POST /api/v2/opening-balances/delete-lines` | FEAT-OB-DELETE-LINES AC-1..5. All-or-nothing batch delete (BR-OB-DEL-004). |

> **AP interaction implicit (W04)**: mọi write op OB (verify/import/edit/delete) trigger gf-inventory cross-boundary REST call to gf-accounting `/lock-check` (ADR-021). Web FE **KHÔNG trực tiếp** gọi AP lock-check — logic hidden trong gf-inventory REST endpoint. UX: nếu response error `ERR-INV-024` → hiển thị message "Tồn đến ngày rơi vào kỳ kế toán đã đóng — vui lòng chọn ngày khác hoặc mở lại kỳ".

### 3.7 CRM, vehicle, segment, marketing, voucher

| UI / Kích hoạt trong code | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Sidebar link `common.customer` | `/customers` | `query SearchCustomers` | `src/features/customers/hooks/use-customer-list.ts` | List query |
| Customer row/link detail | `/customers/$id` | `query GetCustomer` | `src/features/customers/hooks/use-customer-detail.ts` | Detail tabs/widgets |
| Customer create/edit form submit | `/customers/create`, `/customers/$id/edit` | `CreateCustomer`, `UpdateCustomer` | `src/features/customers/hooks/use-create-customer.ts`, `use-edit-customer.ts` | Form state qua React Hook Form/Zod |
| Customer import page submit/verify | `/customers/import` | `VerifyImportCustomers`, `ImportCustomers` | `src/features/customers/hooks/use-verify-import-customer.ts`, `use-import-customers.ts` | Verify trước khi commit import |
| Customer autocomplete inputs | Booking/customer forms | `SuggestCustomers`, `SuggestCustomersByName` | `src/features/customers/hooks/use-suggest-customers.ts`, `use-suggest-customers-by-name.ts` | Debounce; không tạo customer tự động |
| Customer interaction tab | Customer detail | `SearchInteractions`, `GetInteraction` | `src/features/interactions/hooks/use-interaction-list.ts`, `use-get-interaction.ts` | Timeline read-side |
| Sidebar link "Xe" | `/vehicles` | `query SearchVehicles` | `src/features/vehicles/hooks/use-vehicle-list.ts` | List query |
| Vehicle row/link detail và tab buttons | `/vehicles/$id` | `GetVehicle`, `GetLatestServiceOrdersByVehicleV3`, `SearchCompletedItemsV3`, `SearchCompletedPartsV3`, `SearchCompletedVehicleNotesV3` | `src/features/vehicles/hooks/use-*.ts` | Tab switch kích hoạt query tương ứng |
| Segment list/create/detail UI | `/segments`, `/segments/create`, `/segments/$id` | `SearchSegments`, `GetSegment`, `PreviewSegmentCustomers`, `CreateSegment`, `UpdateSegment`, `UpdateSegmentRules` | `src/features/segment/hooks/use-*.ts` | Source chưa có route `/segments/$id/edit`; edit/rule update nằm trong detail UI |
| Sidebar link `header.marketing.campaigns` | `/campaign` | `query SearchCampaigns` | `src/features/campaigns/hooks/use-get-campaigns.ts` | List query |
| Campaign row `Link` tới detail | `/campaign/$id` | `query GetCampaignById` | `src/features/campaigns/index.tsx`, `hooks/use-get-campaign-detail.ts` | Row link dùng campaign id |
| Campaign list action edit/delete và create dialog | `/campaign` | `CreateCampaign`, `UpdateCampaign`, `DeleteCampaign` | `src/features/campaigns/index.tsx`, `hooks/use-create-campaign.ts`, `use-update-campaign.ts`, `use-delete-campaign.ts` | Create hiện mở dialog bằng `setShowCreateDialog(true)` |
| Campaign lifecycle buttons | Campaign detail | `StartCampaign`, `PauseCampaign`, `ResumeCampaign`, `CancelCampaign` | `src/features/campaigns/hooks/use-start-campaign.ts`, `use-pause-campaign.ts`, `use-resume-campaign.ts`, `use-cancel-campaign.ts` | Disable action theo status |
| Campaign wave actions | Campaign detail | `PauseCampaignWave`, `ResumeCampaignWave`, `CancelCampaignWave` | `src/features/campaigns/hooks/use-pause-campaign-wave.ts`, `use-resume-campaign-wave.ts`, `use-cancel-campaign-wave.ts` | Wave id + campaign id |
| Campaign helper selectors | Campaign create/detail | `SearchCampaignMessages`, `GetNotificationLimits`, `SearchMessageTemplates`, `SearchVoucherPrograms`, `SearchUsers`, `GetSegmentCustomerCount` | `src/features/campaigns/hooks/use-*.ts` | Optional helper query không block toàn page |
| Sidebar link "Chương trình Voucher" | `/voucher-programs` | `query SearchVoucherPrograms` | `src/features/voucher-programs/hooks/use-voucher-program-list.ts` | List query |
| Voucher program create/edit/detail/lifecycle actions | `/voucher-programs/*` | `GetVoucherProgramById`, `CreateVoucherProgram`, `UpdateVoucherProgram`, `ActivateVoucherProgram`, `SuspendVoucherProgram`, `CancelVoucherProgram`, `DeleteVoucherProgram`, `GenerateVoucherProgramQr` | `src/features/voucher-programs/hooks/use-*.ts` | QR generation trả artifact render/download |
| Voucher lookup/cancel widgets | Voucher-related widgets | `SearchVouchers`, `GetVoucherByCode`, `VoucherRedemption`, `CancelVouchers` | `src/features/vouchers/hooks/use-*.ts` | Scope theo voucher program/customer |

### 3.8 HRMS, account, permission

| UI / Kích hoạt trong code | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Sidebar link "Danh sách nhân viên" | `/employees` | `query SearchEmployees` | `src/features/employees/hooks/use-search-employees.ts` | List query |
| Employee code/name `Link` trong list | `/employees/$id` | `query GetEmployeeByCode` | `src/features/employees/components/list/index.tsx`, `hooks/use-employee-by-code.ts` | `row.original.code` map vào route id |
| Employee list icon/button edit | `/employees/$id/edit` | Chỉ điều hướng; submit gọi `UpdateEmployee` | `src/features/employees/components/list/index.tsx`, `hooks/use-update-employee.ts` | Row action `Button`/icon `onEdit` |
| PageHeader action "Tạo mới" trong employee list | `/employees/create` | `mutation CreateEmployee` khi submit form | `src/features/employees/components/list/index.tsx`, `components/create/index.tsx`, `hooks/use-create-employee.ts` | Create form PageHeader action "Lưu" gọi `formRef.current?.submit()` |
| Employee detail account tab button `onProvisionAccount` | Employee detail | `ProvisionEmployeeSso` | `src/features/employees/components/detail/account-tab/provisioning-state.tsx`, `hooks/use-provision-employee-sso.ts` | Tạo account SSO cho employee |
| Employee detail account tab button `onRevokeAccount` | Employee detail | `DisableEmployeeSso` | `src/features/employees/components/detail/account-tab/account-info-state.tsx`, `hooks/use-disable-employee-sso.ts` | Confirm modal trước khi revoke |
| Employee detail disabled account button `onReactivate` | Employee detail | `EnableEmployeeSso` | `src/features/employees/components/detail/account-tab/disabled-account-state.tsx`, `hooks/use-enable-employee-sso.ts` | Reactivate SSO |
| Employee status confirm modals | Employee detail | `SuspendEmployee`, `ReactivateEmployee`, `TerminateEmployee` | `src/features/employees/hooks/use-suspend-employee.ts`, `use-reactivate-employee.ts`, `use-terminate-employee.ts` | Confirm modal buttons "Xác nhận" gọi mutation |
| Account list/detail/create/edit/toggle UI | `/accounts/*` | `HrmsSearchUsers`, `HrmsUserById`, `HrmsCreateUser`, `HrmsUpdateUser`, `HrmsToggleUserStatus` | `src/features/account/hooks/use-*.ts` | Một số account menu đang comment trong navigation |
| Permission route/bootstrap | `/permissions` và protected shell | `PolicyClientGetPermissions` | `src/features/permissions/hooks/use-policy-client-get-permissons.ts` | FE dùng để hide/guard UX; backend vẫn enforce |
| Permission create/edit form submit | `/permissions/create`, `/permissions/$id/edit` | `PolicyRoleCreate`, `PolicyRoleUpdate` | `src/features/permissions/components/form/index.tsx`, `hooks/use-create-policy-role.ts`, `use-edit-policy-role.ts` | Checkbox/action matrix map vào role input |
| Permission row/detail/delete action | `/permissions/$id` | `PolicyRoleById`, `PolicyRoleDelete`, `PolicyResourceTypes`, `PolicyRoleList` | `src/features/permissions/hooks/use-*.ts` | Delete phải confirm; resource types load cho form |

## 4. Tác động tới quản lý trạng thái

- Apollo `InMemoryCache` là cache transport; source hiện thường dùng refetch thủ công sau mutation.
- Shared `useQuery` có default `fetchPolicy: "no-cache"` nếu caller không override.
- Zustand giữ tenant, filter, breadcrumb, permission, chat/common, notification unread/refetch handle và feature UI state.
- Form state dùng React Hook Form + Zod; backend vẫn quyết định business validation.
- GraphQL error/toast đi qua shared `useQuery`/`useMutation`; feature chỉ override khi cần UX riêng.

## 5. Pattern không được dùng

- Không gọi trực tiếp `gf-*`, `hrms`, `policy-agent`, `ct-*`, payment, storage hoặc DynamoDB services từ browser.
- Không hardcode backend URL trong component; domain GraphQL phải qua `VITE_GRAPHQL_URI` và shared client/helper.
- Không coi sidebar/menu/feature flag/client permission là authorization authority.
- Không tự bịa operation GraphQL khi implement button/form mới; phải bổ sung vào mục 3 trước DEV.
- Không lưu domain-sensitive data, payment/card data hoặc token provider vào long-lived browser storage.
- Không dùng `client.resetStore()` cho cập nhật domain thông thường; chỉ dùng full reset cho logout/recovery.

## 6. Tham chiếu

- HLD [garage-web-HLD.md](../hld/garage-web-HLD.md)
- BFF HLD [agg-garage-graph-HLD.md](../hld/agg-garage-graph-HLD.md) §1 (catalog-v2 + accounting-period + opening-balance module callout)
- API [agg-garage-graph-graphql.md](../api/agg-garage-graph-graphql.md) §3d (catalog-v2) + **§3e (accounting-period)** + **§3g (opening-balance W04)**
- gf-inventory REST [gf-inventory-api.md §3b](../api/gf-inventory-api.md) — 7 OB endpoints W04-1..W04-7
- gf-accounting REST [gf-accounting-api.md §4](../api/gf-accounting-api.md) — 7 AP endpoints + lock-check
- INTEG-EXT [INTEG-EXT-gf-accounting.md §6](INTEG-EXT-gf-accounting.md) — lock-check consumer pattern (future RECEIPT-V2/DELIVERY-V2/PRC); [INTEG-EXT-gf-inventory.md §13b](INTEG-EXT-gf-inventory.md) — gf-inventory→gf-accounting lock-check consumer (W04)
- ADR: ADR-017/018 (catalog-v2), **ADR-019 (Accounting Period on gf-accounting)**, **ADR-020/021/022 (W04 stock ledger + OB lock-check + OB import all-or-nothing)**
- Product: EP-INVENTORY-ACCOUNTING-PERIOD + 5 FEAT-AP-* + UX-FLOW-INVENTORY-ACCOUNTING-PERIOD (web-only); BR-GF-INVENTORY-ACCOUNTING-PERIOD (frontmatter `boundary: gf-inventory` mismatch — OQ1). **W04**: EP-INVENTORY-OPENING-BALANCE + 4 FEAT-OB-* + UX-FLOW-INVENTORY-OPENING-BALANCE (web full CRUD, mobile view-only); BR-GF-INVENTORY-OPENING-BALANCE + BR-STKV2-001/005a.
- Source tham chiếu: `gf-gms-web`

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-07-08 | v18 | **W04 cascade `agg-garage-graph-graphql.md` v7.54 AP-Q1 removal vào §3.6b UI mapping table**. v7.54 (2026-07-08) xoá GraphQL op `searchAccountingPeriods` (AP-Q1) khỏi §3e Accounting Period module per user quannn — FEAT-AP-LIST chuyển sang `searchAccountingPeriodTree` (AP-Q2, single mapping). INTEG-FE v17 chưa cascade → §3.6b UI mapping table còn 3 row cite AP-Q1: (a) row "Mở tab Kỳ kế toán render cây" hint text "HTTP 413 hint redirect AP-Q1"; (b) row "Ô tìm kiếm theo tên" Alternative note "dùng AP-Q1 flat search nếu UX cần paged result"; (c) row "Đổi filter năm dropdown" GraphQL cell chứa `hoặc searchAccountingPeriods({year: {Y}})` + op ID cell "AP-Q2 hoặc AP-Q1" + hint text "switch sang search khi vượt cap 500". Sửa 3 row: (a) hint text "HTTP 413 hint redirect AP-Q1" → "HTTP 413 hint 'narrow qua year filter hoặc name LIKE cụ thể' per §3e.3 v7.54 (AP-Q1 flat search removed v7.54 — không còn fallback)"; (b) Alternative note "dùng AP-Q1 flat search" → note "AP-Q1 flat `searchAccountingPeriods` removed v7.54 — tree query là single mapping cho FEAT-AP-LIST"; (c) row "Đổi filter năm" chỉ giữ AP-Q2 tree query; op ID "AP-Q2 hoặc AP-Q1" → "AP-Q2"; hint "switch sang search khi vượt cap 500" → "vượt cap 500 → narrow qua `year` filter hoặc `name` LIKE cụ thể per §3e.3 v7.54 (không còn AP-Q1 fallback)". Pair với `agg-garage-graph-HLD.md v13` + `agg-garage-graph-graphql.md v7.59`. **KHÔNG đụng**: §3.6b các row khác (14 row còn lại), §3.6a, §3.6c, các section khác. v17 → v18. |
| 2026-07-06 | v17 | **W04 Q2 fix — BA/PO chốt template `.xlsx` do FE quản lý (bundled static asset)**. §3.6c UI Action mapping row "Tải template": XOÁ wording "query getOpeningBalanceTemplate → W04-2 GET /api/v2/opening-balances/template → Response templateUrl S3 signed URL 15min. Client redirect download.". THAY bằng "(none — FE bundled static asset)" cho cả GraphQL + REST cột; description: "FE bundle Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx sync vào frontend/gf-gms-web/src/assets/, render qua `<a href={bundled_url} download>` hoặc `fetch(bundled_url).then(blob → saveAs)`. Zero BFF/BE call. Browser cache immutable bundle. Cập nhật template = rebuild FE. (BA/PO chốt 2026-07-06 — Q2 fix.)". Route note đổi "(bước 1)" → "(section 'Thông tin cơ bản')" khớp UI section thực. Pair với `gf-inventory-api v38` + `agg-garage-graph-graphql v7.47` + `agg-garage-graph-HLD v12` + `garage-web-HLD v11` + `ADR-022 v4`. **KHÔNG đụng Product docs** (`FEAT-OB-IMPORT.md` AC-2 "Tải template mẫu" wording fit cả BE-endpoint và FE-bundled patterns). Note: v16 (W04 add §3.6c) đã bump frontmatter version nhưng thiếu Change Log row — không backfill trong scope Q2 fix này (frontmatter comment header đã document đủ). v16 → v17. |
| 2026-06-24 | v15 | **R16 — Dọn duplicate row + sync export cap 1000 (per Backend review 2026-06-24)** — §3.6a: (a) **Remove duplicate row** "Tab Mã sản phẩm — list/filter" với REST stale `V2-7 GET /api/v2/internal-products` (đã bị thay bởi row R10 `V2-7 POST /api/v2/internal-products/search` ở dòng phía trên — duplicate này là rác từ refactor); (b) "Detail mã SP" note bỏ ref OQ12 tab "Lịch sử" — FEAT-CAT-PROD-DETAIL v3 đã chốt bỏ tab; (c) export cap note: backend hard-cap matched-count ≤ 1,000 rows (gf-inventory-api v16 R16) — FE cần toast "Filter quá rộng, thu hẹp ≤ 1000 dòng" khi nhận `EXPORT_ROW_CAP_EXCEEDED`. Sync gf-inventory-api v16 + graphql v7.20. v14 → v15. |
| 2026-06-24 | v14 | **R15 — V2-22 export align với V2-7 search filter (per Delivery Authority feedback 2026-06-24)** — §3.6a row "Export .xlsx theo filter": GraphQL arg `filter` enumerate `{keyword, status, nature, materialGroupId}` subset V2-7; REST `GET /export` → `POST /export` body shape. Sync gf-inventory-api v15 + graphql v7.19. v13 → v14. |
| 2026-06-24 | v13 | **R10 — V2-7 POST/search + 3-col keyword + REMOVE V2-9 history (per Delivery Authority feedback 2026-06-24)** — §3.6a: "Detail mã SP + lịch sử" row updated — remove `getInternalProductHistory(id)` + V2-9 reference (R10 BA chốt no history audit); thêm row "Tab Mã SP — list/filter" với GraphQL `searchInternalProducts(input: {keyword,...})` + REST `POST /api/v2/internal-products/search` body + note 3-column keyword OR-match (code + name + legacy product.sku qua mapping). Sync gf-inventory-api v12 + graphql v7.15 + data-model v12 + HLD v9. OQ12: BA self-handle Tab "Lịch sử" trong FEAT-CAT-PROD-DETAIL UX. v12 → v13. |
| 2026-06-24 | v12 | **R9 — Mutation arg rename `skuId` → `productId` (per Delivery Authority feedback 2026-06-24)** — §3.6a row "Modal Gắn SKU — gắn/bỏ gắn": mutation args `(id, skuId)` → `(id, productId)` (= legacy `product.id`, FK column tường minh); description note FK lineage. Mutation NAMES `mapSkuToInternalProduct`/`unmapSkuFromInternalProduct` PRESERVED — business operation semantic. Sync gf-inventory-api v11 + graphql v7.14 + data-model v11. v11 → v12. |
| 2026-06-24 | v11 | **V2-1 input field rename `name` → `keyword` (OR-match name/code) (per Delivery Authority feedback 2026-06-24)** — §3.6a row V2-1 GraphQL signature: `input: {keyword, parentId, status, page, size, sort}` (was `name`); description note thêm "OR-match name/code (single search-box UX)". Sync gf-inventory-api v8 + agg-garage-graph-graphql v7.12. v10 → v11. |
| 2026-06-24 | v10 | **V2-1 GET→POST + flat-grouped-by-parent (per Delivery Authority feedback 2026-06-24)** — §3.6a row "Tab Nhóm VTHH — list/filter": REST `GET /api/v2/material-groups` → `POST /api/v2/material-groups/search` (body); GraphQL input thêm `sort: "default"` để enforce flat-grouped-by-parent ordering. FE responsibility: render `parentName` enrichment field thành parent header (duplicate khi group spans pages, acceptable UX). Sync gf-inventory-api v7 + agg-garage-graph-graphql v7.11. v9 → v10. |
| 2026-06-24 | v9 | **R4 tree endpoint GET→POST + name search (per Delivery Authority feedback 2026-06-24)** — §3.6b: row "Mở tab Kỳ kế toán" GraphQL op `getAccountingPeriodTree(year)` → `searchAccountingPeriodTree(input: {year})` + REST `GET /tree?year=` → `POST /tree` body. Row "Ô tìm kiếm theo tên" gộp vào AP-Q2 (search trong cây thay vì AP-Q1 flat) — LIKE-unaccent trên `accounting_period.name` (single column, match Năm/Quý/Tháng); response trả matching node + ancestor path + descendant subtree. Row "Đổi filter năm" cập nhật GraphQL op tên mới. Sync gf-accounting-api v14 + agg-garage-graph-graphql v7.9 + HLD v9 (quality table). v8 → v9. |
| 2026-06-24 | v8 | **R2 surgical fix F1 (Round 2 arch-review)**: §3.6b row "Click Sửa..." — replace `ERR-INV-032` (collide với registry:130 BR-OB-008 "Số lượng tồn phải > 0" FEAT-OB-IMPORT) → **`ERR-AP-001`** (NEW namespace `ERR-AP-*` dedicated cho Accounting Period domain trên gf-accounting boundary; pending BA register trong ERROR-CODE-REGISTRY.md — OQ7 new). Aligns với gf-accounting-api.md v12 fix. v7 → v8. |
| 2026-06-24 | v7 | **+§3.6b Accounting Period UI mapping (DESIGN — `gf-accounting/accounting-period` BFF module, ADR-019, Delivery Authority boundary correction 2026-06-23, CLAUDE override 2026-06-24)** — re-introduce AP UI mapping nhưng under `gf-accounting` module (NOT `gf-inventory` như v5 trước R4 strip). 12 rows mapping UI Action → GraphQL → REST: mở tab cây phân cấp, search by name, filter year, mở form thêm, submit Tạo (single + autoGenerateChildren atomic per BR-AP-009), xem chi tiết, sửa (mutable fields per BR-AP-016 + status toggle OPEN⇄CLOSED đối xứng per BR-AP-010/011), xóa (3-guard `ERR-INV-025/026`), lock-check advisory (internal cho FEAT-IRV2/IDV2/OB/PRC future). Authoritative source: `gf-accounting-api.md §4` (7 REST) + `agg-garage-graph-graphql.md §3e` (7 GraphQL ops). Tree cap 500 BFF defense-in-depth. Lock-check 30s LRU cache scope `(tenantId, date)`. Web-only (UX-FLOW line 31 Web GMS only; mobile out of scope). Route convention proposal `/accounting/periods` (verify với FE team khi implement). §6 References +gf-accounting-api §4 + INTEG-EXT-gf-accounting §6 + ADR-019 + AP Product files. Note BA frontmatter `boundary: gf-inventory` mismatch (OQ1). v6 → v7. |
| 2026-06-23 | v6 | **R4 — Strip AP scope (Boundary correction — AP moved to gf-accounting wave per Delivery Authority decision 2026-06-23)** — §3.6a: gỡ 7 rows "Tab Kỳ kế toán list/cây/chi tiết + create/update/delete + lock-check" (V2-24..V2-30 mappings). Catalog rows (10) intact: nhóm VTHH list/tree/CRUD, mã SP list/detail/CRUD/SKU-mapping/UoM-conversion/attachment/import-export. |
| 2026-06-23 | v5 | **Inventory V2 catalog-v2 + AP slice (DESIGN, R3 F2 — ADR-017/018/019)** — §3.6a mới: 17 critical UI actions (web-only per UX-FLOW-INVENTORY-CATALOG.md:34) → GraphQL operation → REST endpoint mapping cho subsystem catalog-v2 (material-groups CRUD + tree V2-Q2, internal-products CRUD + detail/history + sku-mappings + conversion-uoms + attachments + import 2-step + export) + accounting-period (CRUD + tree V2-Q11 + lock-check advisory). Authoritative source links: `gf-inventory-api.md §3a.4` (30 endpoints) + `agg-garage-graph-graphql.md §3d`. Mobile out of scope. Tree size caps cross-ref §3d.3 (V2-Q2 1000 nodes, V2-Q11 500 periods, R3 F10 BFF defense-in-depth). |
| 2026-06-04 | v4 | **Reconcile op-name (Blocker 2, verified vs committed HEAD agg graph)**: §3.4b row "Nhập 5 khoản điều chỉnh BH" — `mutation ApplyInsuranceAdjustments` → `mutation UpdateServiceOrderV3` (additive allocation input; op `applyInsuranceAdjustments` KHÔNG có trong agg graph, đã gỡ khỏi contract §3c). REST đích `PUT /api/v3/service-orders/:id` giữ nguyên. |
| 2026-05-30 | v3 | **Insurance Settlement (DESIGN — EP-INSURANCE-SETTLEMENT, CR-1780147390, ADR-014)**: thêm §3.4b — 10 UI Action→GraphQL→REST mapping (applyInsuranceAdjustments, getSettlementByCode insurance block, recordInsurancePayment, dossier create/version/update/export/view/download, insurance debt widget). Section điều chỉnh chỉ Edit/Detail (BR-INS-SO-PS-006); `Upload` scalar scan ③; backend authority cho amount. |
| 2026-05-19 | v2 | Synced latest `gf-gms-web` operations coverage: corrected sidebar label to `Nhà xe liên kết`, expanded linked transporter action mapping, and documented quotation invoice information flow through `QuotationAskTenantInvoiceInfo` and `CreateQuotationAskV3`. |
| 2026-05-12 | v1.1 | Source-aligned route coverage với `gf-gms-web`: `/payment` đi qua `/_modules` token guard, bổ sung nhánh `/service-order/sale/*`, thu hẹp segment routes theo source hiện tại, và ghi rõ notification center read/read-state operations đi qua `VITE_GRAPHQL_URI`. |
| 2026-05-07 | v1 | Initial integration contract `garage-web` (React 19 + TypeScript + Vite SPA, `gf-gms-web`) -> `agg-garage-graph` (BFF GraphQL): GraphQL/HTTPS qua Apollo Client (`HOME_CLIENT` trỏ tới `VITE_GRAPHQL_URI`), auth bearer JWT (module shell token guard, refresh token flow), key queries/mutations cho dashboard, booking, service-order, settlement-voucher, quotation/purchase requests, suppliers, inventory, customers/vehicles/segments, campaign/voucher, employees/accounts/permissions; multipart upload qua `apollo-upload-client` (`use-files`, `use-attachments` hooks); payment route chỉ render callback (FE không tạo payment secret). Bao gồm Thông tin Frontend, Luồng xác thực theo route, Ánh xạ UI Action -> GraphQL Operation (shell + per-domain), Tác động tới quản lý trạng thái, Pattern không được dùng, Tham chiếu. |
