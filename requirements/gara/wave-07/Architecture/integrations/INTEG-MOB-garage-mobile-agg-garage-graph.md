---
type: architecture
artifact_kind: integration-mobile
status: ACTIVE
version: 10
tier: T1
owner_authority: Architecture Authority
boundary: garage-mobile
boundary_frontend: garage-mobile
boundary_bff: agg-garage-graph
last_reviewed: "2026-08-05"  # v10 W07 EP-PARTNER-LINK (DESIGN) — thêm §3.6 UI mapping "Liên kết đối tác — Driver Plus" (14 UI action → 6 GraphQL op §3k). Scope mobile = **FULL 6/6 op** (khác W04/W06 view-only/narrow) vì FEAT-SYS-DRIVERPLUS-LINK ship đồng thời web + mobile, cùng 1 FEAT + cùng 1 BFF, không có op riêng cho mobile. Khác biệt chỉ ở UI màn danh sách (bottom-nav tab, card layout + đếm "{N} yêu cầu", màn Bộ lọc full-screen); màn chi tiết + 4 modal giữ 100% như web. §2 route +1 row. Cite ADR-029/ADR-030. KHÔNG đụng §3.1-§3.5. v9 → v10.  # v9 W06 Round 8 cascade — sync §3.4c REST reference for FEAT-STK-LIST-V2 mobile mapping (Q1 only — mobile scope narrow, doesn't touch Q2/Q3) after `gf-inventory-api v67` flipped Q1 GET→POST+`/search`. Touched: §3.4c intro note "Authoritative source" line — REST endpoint text `GET /api/v*/stock-ledgers/at-date` → `POST /api/v*/stock-ledgers/at-date/search (JSON body per gf-inventory-api §3g.2 W06-STK-Q1 v67 — R8 flip GET→POST+/search per codebase majority convention)` + append explicit note "GraphQL Query type UNCHANGED — mobile FE contract stable; `InventoryRepository.stockLedgerAtDate` op semantics unchanged, Input/Response shapes verbatim; flip is BFF→REST internal transport only". §3.4c 4 table rows UNCHANGED (no REST column in mobile table structure; GraphQL Op column stable). Hub state matrix + PRC opt-out reason + backward-compat note UNCHANGED. Q2 (IP-VIEW-V2) + Q3 (STK-DETAIL-V2) NOT applicable — web-only per FEAT platform scope, mobile Flutter SDK MUST NOT emit those queries (§3.4c scope declaration line 138-140 unchanged). Old "pending backfill trong gf-inventory-api.md — soft open_questions[] cascade CR" language obsolete (backfilled Round 3 v64) — rewritten reflecting v67 R8 flip. **KHÔNG đụng**: (a) §3.1-3.3 baseline + §3.4 domain khác + §3.4b W04 OB view-only + §3.5 upload/OCR; (b) §3.4c 4 mapping rows (GraphQL Op + Source columns stable) + Hub state matrix W06 v3 + PRC opt-out reason + backward-compat toast fallback; (c) §1-§2 route + auth flow; (d) §4-§5 state management + Forbidden Patterns; (e) R12 catalog mobile scope note + AP-on-gf-accounting web-only note. Cascade pair: `gf-inventory-api v67` (primary REST verb flip + Request body JSON schema) + `agg-garage-graph-graphql v7.77 §3j` (BFF Downstream text + resolver discipline dual-transport) + `INTEG-FE-garage-web-agg-garage-graph.md v22 §3.6d` (web REST col 3 rows Q1/Q2/Q3) + `gf-inventory-HLD.md §6b.9` (conditional no-op). Product docs untouched (transport-mechanism internal detail, not Product-visible behavior; FEAT-STK-LIST-V2 mobile AC-2/AC-3 hide-action-column stable). Round 8 mandate `Tracking/arch-design-W06-answers-8.md`. Trigger user directive 2026-07-23 "các api liên quan đến search có phân trang thì cần dùng POST, tuân thủ theo code base hiện tại". v8 → v9.  # v8 W06 arch-design Round 2 — Add §3.4c Inventory V2 Stock V2 Report mobile scope (NARROW — FEAT-STK-LIST-V2 ONLY per platform scope). Cross-wave FEAT-INV-MOBILE-MENU tile "Tồn kho" flip HIDDEN → VISIBLE (state matrix v3 W06) — pure state matrix update, KHÔNG design UI riêng cho hub. 1 mobile op consumed = `stockLedgerAtDate` (W06-STK-Q1). PRC 5 FEAT + 2 Stock V2 report FEAT (IP-VIEW-V2 + STK-DETAIL-V2) entirely web-only — mobile Flutter SDK MUST NOT emit those queries. Mobile FEAT-STK-LIST-V2 AC-2 hide action column "Thao tác" — no drill-down to thẻ kho mobile. Backward-compat: tenant chưa enable Inventory:InventoryV2 flag → tile tap toast fallback. Authoritative BFF source §3j.6 stockLedgerAtDate agg-garage-graph-graphql v7.74. Soft flag: gf-inventory-api.md v63 chưa có sub-section cho public REST /api/v*/stock-ledgers/at-date — pending Delivery Authority cascade CR + backfill trước /dev-start W06. v7 → v8.  # v7 W04 — §3.4b Add Opening Balance (view-only mobile) + Mobile Hub (FEAT-INV-MOBILE-MENU, zero backend interaction). Tile "Tồn đầu kỳ" enabled W04 per state matrix row 6. Mobile hub client-side navigation only; sub-tile tap → route to searchOpeningBalances. NO import/edit/delete on mobile (web-only per UX-FLOW §29). Total mobile ops now includes searchOpeningBalances.
supersedes: "none"
---

# INTEG-MOB - Garage Mobile <-> `agg-garage-graph`

> **FM-016 bắt buộc** - mọi query/mutation business mới trên mobile phải được thêm vào mục 3 trước DEV.
>
> File này chỉ bao phủ contract giữa `garage-mobile` và `agg-garage-graph`. Auth/session, device token, CometChat auth token và conversation-routing qua SSO được tách sang [INTEG-MOB-garage-mobile-agg-sso-graph.md](./INTEG-MOB-garage-mobile-agg-sso-graph.md).

## 1. Thông tin Mobile

| Thuộc tính | Giá trị |
|---|---|
| Mobile | current Flutter mobile app / App Garage, single codebase iOS + Android |
| HLD | [garage-mobile-HLD.md](../hld/garage-mobile-HLD.md) |
| BFF | `agg-garage-graph` |
| Schema | [agg-garage-graph-graphql.md](../api/agg-garage-graph-graphql.md) |
| Endpoint | `F.graphQLUrl` |
| Client/service | `GraphQLService`, `GraphQLServiceBase` |
| Document source | `lib/core/services/graphql/documents/*.dart` trừ auth/chat-routing qua SSO |
| Upload helper | GraphQL multipart qua `media_repository_impl.dart` |
| Shell state | `AppCubit`, `MainCubit`, `ProfileCubit`, `PolicyFirstCubit` |
| Guard baseline | `AuthGuard` + `PermissionGuard` + policy/feature gates |
| Nhóm người dùng | service advisor, inventory staff, purchase staff, manager, support operator |

## 2. Luồng xác thực theo route

| Route/UI | Xác thực | Nhóm operation | Ghi chú |
|---|---|---|---|
| Splash / boot với session đã restore | PARTIAL | `getTenantInfo`, `featureFlags` | Chỉ gọi khi app đã có session material; nếu chưa có session thì không chạm business graph |
| Policy-first / T&C confirmation | YES (pending) | `getTenantInfo`, `tcDataPrivacyConfirmed` | Session đã có nhưng chưa vào main shell |
| Main shell / home / profile / notification | YES | dashboard, profile, notifications, permission bootstrap, payment gate | Dùng `GraphQLService` xuyên suốt |
| Booking / quotation / ordering / service-order / settlement / inventory / customer / supplier / vehicle | YES | domain query + mutation | Tất cả business flow đi qua `agg-garage-graph` |
| Push tap / local notification relaunch | YES | `markAsReadPush` + detail query liên quan | Rehydrate session trước khi mở screen đích |
| OCR upload / attachment upload / payment init | YES | `uploadAttachment`, `uploadMultipleFiles`, `ocrUpload`, `prCheckoutQR`, `prCheckoutCC` | Side-channel tiếp theo có thể là WebView/REST, nhưng khởi tạo vẫn qua business graph |
| Tab **"Liên kết"** bottom-nav *(W07, DESIGN)* | YES | `listPartnerLinkRequests`, `getPartnerLinkRequestDetail`, 4 mutation partner-link | Ẩn tab khi feature flag `PartnerLink:DriverPlus` = off. Dual persona `garage-owner` + `accountant` **ngang quyền** (`BR-DPL-CMN-004`) |

## 3. Ánh xạ UI Action -> GraphQL Operation

### 3.1 Bootstrap, shell, dashboard, notifications, permissions

| UI Action | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Resolve tenant context sau login hoặc authenticated boot | splash / login bootstrap | `getTenantInfo` | `ProfileRepository` | Lưu `tcConfirmed` và business info để quyết định routing |
| Xác nhận data privacy / T&C | policy-first | `tcDataPrivacyConfirmed` | `ProfileRepository` | Clear policy gate trước khi vào shell |
| Acknowledge ecommerce confirmation gate khi flow bật | main shell / ecommerce confirm | `ecommerceConfirmed` | `ProfileRepository` | Cập nhật cờ xác nhận phía tenant context |
| Load feature flags | authenticated boot | `featureFlags` | `FlagsRepository` | Có `.ff_cache` fallback nếu fetch fail |
| Mở home dashboard | main/home | `getStats`, `getSpendingOverview`, `getSpendingChart`, `getDashboardRealtime` | `HomeRepository` | KPI cards, chart và realtime refresh |
| Resolve payment feature gate | main/home/payment entry | `getEnablePaymentMethodMobile` | `HomeRepository` | Gate QR/card payment theo backend + version |
| Load notification inbox | notification list / shell badge | `getNotifications`, `getUnreadCount` | `NotificationRepository` | Notification center của mobile đi qua business graph |
| Update notification read-state | notification detail / push tap / bulk action | `markAsRead`, `markAllAsRead`, `markAsReadPush` | `NotificationRepository` | `markAsReadPush` dùng cho payload từ push/local replay |
| Load permission matrix | shell bootstrap / guarded action | `policyClientGetPermissions` | `PermissionRepository` | Client chỉ dùng để gate UX, backend vẫn là authority |
| Load profile snapshot | main/profile / profile QR / account area | `getCurrentUser` | `ProfileRepository` | Profile runtime snapshot cho shell và account widgets |

### 3.2 Quotation, ordering và payment init

| UI Action | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Search quotation catalog và tạo quotation ask | quotation / request quote | `searchCatalog`, `createQuotationAsk` | `QuotationRepository`, `RequestQuoteRepository` | Entry point cho RFQ/quotation flow |
| View quotation ask và pricing context | quotation detail | `quotationAskByCode`, `quotationAskHistories`, `quotationPricingRequest`, `getPreliminaryQuotation` | `QuotationRepository` | Bao phủ detail, history và pricing |
| Load part master và enrichment | quotation / ordering helper | `getMdmParts`, `getMdmPartsGoogleImages` | `QuotationRepository`, `OrderingRepository` | Lookup part + image enrichment |
| Manage cart | ordering cart | `getCart`, `addSparePartToCart`, `updateCart`, `deleteCartItem` | `OrderingRepository` | Cart state thuộc business graph, không local-only |
| Create purchase request | purchase request create | `addPurchaseRequest`, `addPurchaseRequestV2` | `OrderingRepository` | V1/V2 coexist theo flow hiện tại |
| View PR/PO list và detail | purchase request / purchase order | `searchPurchaseRequests`, `getPurchaseRequestDetailByCode`, `searchPurchaseOrders`, `getPurchaseOrderByCode` | `OrderingRepository` | List + detail cho PR/PO |
| Transition PR/PO lifecycle | purchase request / purchase order detail | `cancelPurchaseRequest`, `prPlaceOrder`, `confirmReceivedPurchaseOrderByCode` | `OrderingRepository` | Business-side lifecycle actions |
| Resolve supplier + cross-domain helper | ordering helper | `searchSuppliers`, `getSupplierById`, `searchServiceOrdersV3`, `getPartsForDeliveryV3` | `SupplierRepository`, `OrderingRepository`, `ServiceOrderRepository` | Support selector và cross-link với SO/delivery |
| Init payment từ ordering flow | checkout / confirm order | `prCheckoutQR`, `prCheckoutCC`, `prGetPaymentMethods`, `changePaymentMethod`, `getPaymentByPurchase`, `getUserCards`, `deleteUserCard` | `OrderingRepository` | `prCheckoutCC` trả payment context để mobile handoff qua WebView |

### 3.3 Booking và service order

| UI Action | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Search và view booking | booking list / detail | `searchBookings`, `searchBookingsV3`, `getBookingById`, `getBookingByIdV3` | `BookingRepository` | V2/V3 coexist |
| Check availability + create/update booking | booking create / edit | `checkAvailability`, `checkAvailabilityV3`, `createBooking`, `createBookingV3`, `updateBooking`, `updateBookingV3` | `BookingRepository` | Availability là business guard trước submit |
| Transition booking lifecycle | booking detail | `confirmBooking`, `confirmBookingV3`, `declineBooking`, `declineBookingV3`, `cancelBooking`, `cancelBookingV3`, `arriveBooking`, `arriveBookingV3` | `BookingRepository` | Action buttons trên detail / list |
| Search và view service order | service-order list / detail | `searchServiceOrders`, `searchServiceOrdersV3`, `getServiceOrderById`, `getServiceOrderByIdV3`, `getServiceOrderByCode` | `ServiceOrderRepository` | Bao phủ SO V1 và V3 |
| Create/update service order | service-order create / edit | `createServiceOrder`, `createServiceOrderV3`, `updateServiceOrder`, `updateServiceOrderV3` | `ServiceOrderRepository` | Booking -> SO prefill vẫn đi qua business graph |
| Transition service order lifecycle | service-order detail | `startServiceOrder`, `startServiceOrderV3`, `cancelServiceOrder`, `cancelServiceOrderV3`, `completeServiceOrder`, `completeServiceOrderV3`, `confirmServiceOrderV3` | `ServiceOrderRepository` | Main lifecycle actions |
| Payment, quotation và stock helper cho SO | service-order detail / settlement interaction | `recordServiceOrderPayment`, `recordServiceOrderPaymentByCode`, `sendQuotationV3`, `getTotalStockBySkus` | `ServiceOrderRepository`, `SettlementRepository` | Payment record vẫn là business mutation |
| Suggest customer / vehicle trong booking hoặc SO create | booking / service-order form | `suggestCustomers`, `suggestCustomersByName`, `suggestCustomerByName`, `suggestCustomerByPhone`, `suggestVehicleByPlate`, `suggestVehicles` | `SuggestRepository` | Assisted input, không auto-create entity |

### 3.4 Customer, supplier, inventory, settlement, HR, vehicle

| UI Action | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Customer CRUD và interaction history | customer list / detail | `searchCustomers`, `createCustomer`, `updateCustomer`, `getCustomer`, `searchInteractions` | `CustomerRepository` | CRM flow trên mobile |
| Supplier, warehouse và product flow | supplier / product / helper selector | `searchSuppliers`, `createSupplier`, `updateSupplier`, `toggleSupplierStatus`, `getSupplierById`, `searchWarehouses`, `searchProducts`, `searchGroupedProducts`, `createProducts` | `SupplierRepository`, `ProductRepository` | Supplier có cả CRUD và selector use case |
| Inventory stock, receipt, delivery, service, period | inventory module | `searchInventoryStockMobile`, `searchReceiptsMobile`, `searchDeliveriesMobile`, `searchServices`, `searchPeriodStocksMobile`, `getReceiptMobile`, `getMobileDeliveryById`, `getServiceById`, `getHistoryStockMobileById`, `getPeriodStockDetailMobile` | `InventoryRepository`, `InventoryStockRepository` | Mobile đang tiêu thụ read-heavy inventory surface |
| Settlement module | settlement list / detail | `searchSettlements`, `getSettlementByCode`, `createSettlement`, `updateSettlement`, `cancelSettlement` | `SettlementRepository` | Quyết toán và insurance-related flow |
| **(DESIGN — Insurance Settlement, EP-INSURANCE-SETTLEMENT, ADR-014)** Điều chỉnh BH + Nguồn TT trên SO (Edit/Detail only) | service-order edit/detail | `updateServiceOrderV3` (additive allocation input) → `PUT /api/v3/service-orders/:id` (gf-sales) | `ServiceOrderRepository` | KHÔNG ở Create (BR-INS-SO-PS-006); bảng tổng realtime |
| **(DESIGN)** Chi tiết phiếu QT BH + ghi nhận thanh toán BH | settlement BH detail | `getSettlementByCode` (block insurance), `recordInsurancePayment` → `POST /api/v1/settlements/:code/insurance-payments` (gf-accounting) | `SettlementRepository` | Trạng thái thu derived; reuse baseline (CB-INS-005) |
| **(DESIGN)** Hồ sơ BH (4 tài liệu) + versioning + xuất PDF | insurance dossier | `createInsuranceDossier`, `createInsuranceDossierVersion`, `updateDossierDocument` (`Upload`), `exportInsuranceDossier`, `getInsuranceDossierVersions`, `getInsuranceDossierDownloadUrl` → `/api/v1/insurance-dossiers/*` (gf-accounting) | `SettlementRepository` | Online-first; upload scan ③ ≤10MB; signed URL preview |
| **(DESIGN)** Widget công nợ BH + filter kỳ | dashboard | `getInsuranceDebtWidget` → `GET /api/v2/dashboard/insurance-debt-widget` (gf-sales→gf-accounting) | `HomeRepository` | 3 KPI + 2 top-list; CB-INS-008 |
| Employee + employee-account management | human resource / account | `searchEmployees`, `getEmployeeByCode`, `createEmployee`, `updateEmployee`, `suspendEmployee`, `reactivateEmployee`, `terminateEmployee`, `provisionEmployeeSso`, `disableEmployeeSso`, `enableEmployeeSso`, `changeEmployeeRole`, `hrmsSearchUsers`, `policyRoleList`, `hrmsUserById` | `EmployeeRepository`, `EmployeeAccountsRepository` | Mobile đang đi business graph cho HR/account flow hiện tại |
| Vehicle management và service history | vehicle list / detail | `searchVehicles`, `getVehicle`, `getLatestServiceOrdersByVehicleV3`, `searchCompletedVehicleNotesV3`, `searchCompletedPartsV3`, `searchCompletedItemsV3` | `VehicleManagementRepository` | Vehicle history là read-heavy flow |

> **R12 — Inventory V2 Catalog scope mobile = PARTIAL (BA decision 2026-06-24, ratify cho W03 qua CR-1782373204 2026-06-25)**: 12 features EP-INVENTORY-CATALOG được split theo nhóm chức năng (per `Product/ux/UX-FLOW-INVENTORY-CATALOG.md:34` + `Product/features/FEAT-CAT-GRP-LIST.md` AC-11 + `Product/features/FEAT-CAT-PROD-LIST.md` AC-11):
>
> | Nhóm | Features | Mobile scope | Ops mobile consume |
> |---|---|---|---|
> | **Material Group (full)** | FEAT-CAT-GRP-{LIST, DETAIL, CREATE, EDIT, DELETE} (5) | ✅ full CRUD trên mobile (list = **flat card** per Figma `21254:52586`, KHÔNG TreeView — CR-1782381477) | Q1 `searchMaterialGroups`, Q3 `getMaterialGroup`, M1 `createMaterialGroup`, M2 `updateMaterialGroup`, M3 `deleteMaterialGroup` (5 ops — **KHÔNG Q2** `getMaterialGroupTree`) |
> | **Internal Product (view-only)** | FEAT-CAT-PROD-LIST + FEAT-CAT-PROD-DETAIL (2) | ✅ list + detail only (read-only) | Q4 `searchInternalProducts`, Q5 `getInternalProduct` |
> | **Internal Product (web-only)** | FEAT-CAT-PROD-{CREATE, EDIT, DELETE, IMPORT, EXPORT} (5) | ❌ NO mobile | — |
>
> Mobile **KHÔNG wire**: **Q2** `getMaterialGroupTree` (CR-1782381477 — mobile flat card list per Figma, dùng Q1 paginated với status từ tab + parentId từ filter sheet) + M4..M15 (Product CRUD, SKU mapping, conversion-unit, attachment, import/export) + Q6..Q9 (export, SKU search unmapped, listUnits). AppBar list Product trên mobile = KHÔNG có nút Thêm/Import/Export; Detail Product = KHÔNG có Edit/Delete. Bulk import V2-20/V2-21 + export V2-22 chỉ phục vụ web. Mobile inventory ops giữ V1 surface legacy (stock/receipt/delivery/period — row trên). Web mapping authoritative xem `INTEG-FE-garage-web-agg-garage-graph.md §3.6a` (17 catalog UI actions). Figma registry [`Product/ux/figma/figma-links.yaml`](../../Product/ux/figma/figma-links.yaml) W03 mobile node = 7/12 feature consistent với scope này. **AP-on-gf-accounting** (5 features `FEAT-AP-*`) vẫn **OUT of scope mobile** per `UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md:31` Web GMS only (không thay đổi). Future mobile expansion (Product CRUD/Import/Export) = CR riêng + BA confirm UX-FLOW update.
>
> **AP-on-gf-accounting (5 features FEAT-AP-*)** cũng OUT of scope mobile per `Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md:31` Web GMS only. Web mapping ở `INTEG-FE-garage-web-agg-garage-graph.md §3.6b` (12 AP UI actions).

#### 3.4b Inventory V2 — Opening Balance (view-only) + Mobile Hub (W04, ADR-020/021/022)

> ⚠️ **Mobile scope PARTIAL** (per `UX-FLOW-INVENTORY-OPENING-BALANCE.md:29` "App Garage chỉ XEM"): mobile consumes **only** `searchOpeningBalances` (view danh sách + dòng Tổng); no import/edit/delete surface on mobile. Full CRUD web-only per `INTEG-FE-garage-web-agg-garage-graph.md §3.6c`.
>
> **FEAT-INV-MOBILE-MENU (mobile hub)**: pure client-side navigation hub trên app Garage; render grid 2 cột tile "Quản lý kho hàng" (FEAT-INV-MOBILE-MENU §3 state matrix). **ZERO GraphQL / REST call cho hub itself** — tile-tap push route to sub-FEAT list. Tile "Tồn đầu kỳ" (W04 enable per state matrix row 6) → wire to `searchOpeningBalances` (mobile view-only route).

| UI Action | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Mobile hub "Quản lý kho hàng" — render tile grid | Hub route (client-side) | — (no GraphQL call) | `InventoryHubCubit` (client-only) | Zero backend interaction; tile visibility từ state matrix client-side (FEAT-INV-MOBILE-MENU AC-4 hide-only strategy). |
| Tap tile "Tồn đầu kỳ" | Push route → OB list | (route change trigger `searchOpeningBalances` on next screen) | — | FEAT-INV-MOBILE-MENU AC-5 back-stack preserve. |
| Mở màn danh sách tồn đầu kỳ (mobile) | OB list route | `query searchOpeningBalances(input)` | `InventoryRepository` (new — thêm ops OB) | View-only: pagination + filter (Kho/Ngày Import) + dòng Tổng. NO import/edit/delete button trên mobile (per UX-FLOW §29 "chỉ XEM"). |
| Filter Kho / Ngày Import (mobile) | OB list route | `searchOpeningBalances(input: {warehouseId, importedFrom, importedTo})` | `InventoryRepository` | Cùng op web (§3.6c). Cùng response schema. |

> **Mobile hub tile state matrix W04** (per FEAT-INV-MOBILE-MENU §3 v2): 3 tiles visible — "Sản phẩm" (W03 view-only, `searchInternalProducts`) + "Nhóm vật tư" (W03 full CRUD) + **"Tồn đầu kỳ" (W04 view-only, `searchOpeningBalances`)**. 3 remaining tiles ("Phiếu nhập"/"Phiếu xuất"/"Tồn kho") hidden per hide-only strategy (AC-4).
>
> **AP interaction implicit**: mobile view-only KHÔNG trigger lock-check (view chỉ đọc). AP W04 out of scope mobile (per UX-FLOW-INVENTORY-ACCOUNTING-PERIOD §31 web-only).

#### 3.4c Inventory V2 — Stock V2 Report (FEAT-STK-LIST-V2 only) + Hub tile "Tồn kho" (W06, ADR-027/028)

> ⚠️ **Mobile scope W06 NARROW** (per `FEAT-STK-LIST-V2.md` Platform scope + `FEAT-INV-MOBILE-MENU` state matrix v3 W06):
> - **Chỉ 1/3 report FEAT** consumed mobile: `stockLedgerAtDate` (FEAT-STK-LIST-V2 — báo cáo tồn kho đến ngày).
> - **KHÔNG mobile**: FEAT-IP-VIEW-V2 (báo cáo NXT web-only), FEAT-STK-DETAIL-V2 (thẻ kho web-only).
> - **KHÔNG mobile PRC**: 5 FEAT-PRC-* (LIST/CREATE/DETAIL/RECALC/DELETE) entirely web-only per EP-INVENTORY-ACCOUNTING-PERIOD §3.2. Mobile SDK client (Flutter) MUST NOT emit `priceCalcRun*` queries.
> - **Scope guard mobile W06**: FEAT-STK-LIST-V2 AC-2 mobile explicit — bảng/list mobile **không hiển thị** cột/entry action "Thao tác" (Xem lịch sử) — vì action duy nhất là drill-down thẻ kho = web-only.
>
> **Hub tile flip (cross-wave FEAT-INV-MOBILE-MENU)**: Tile "Tồn kho" (row 5 state matrix v3) — trạng thái flip từ `HIDDEN` (W04/W05) → `VISIBLE` (W06). Pure feature-flag / state-matrix update per BR-INV-MENU-002; **KHÔNG design UI riêng cho hub** — mobile hub base ship W04 (`INTEG-MOB §3.4b`). Tile-tap route vào FEAT-STK-LIST-V2 màn mặc định.
>
> **Authoritative source**: `agg-garage-graph-graphql.md §3j.6 stockLedgerAtDate` (BFF v7.77) + downstream `gf-inventory` public REST **`POST /api/v*/stock-ledgers/at-date/search`** (JSON body per `gf-inventory-api §3g.2 W06-STK-Q1` v67 — v22/v67/v7.77 R8 HTTP-verb flip GET→POST+`/search` per codebase majority convention for filter + paginated search endpoints, 2026-07-23). **GraphQL Query type UNCHANGED** — mobile FE contract stable; `InventoryRepository.stockLedgerAtDate` op semantics unchanged, Input/Response shapes verbatim; the flip is BFF→REST internal transport only (mobile Flutter SDK sees zero difference).

| UI Action | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Mobile hub "Quản lý kho hàng" — render tile grid W06 state | Hub route (client-side) | — (no GraphQL call) | `InventoryHubCubit` (client-only) | State matrix W06: 4 tile visible = "Sản phẩm" (W03) + "Nhóm vật tư" (W03) + "Tồn đầu kỳ" (W04) + **"Tồn kho" (W06 new — VISIBLE flip)**. 2 tile vẫn hidden ("Phiếu nhập" / "Phiếu xuất" — W05 mobile Slip V2 policy per §3.4b W05 ratify separate CR, out of scope W06 STK report design). Hub zero backend call (FEAT-INV-MOBILE-MENU AC-4). |
| Tap tile "Tồn kho" | Push route → STK report list | (route change trigger `stockLedgerAtDate` on next screen) | — | FEAT-INV-MOBILE-MENU AC-5 back-stack preserve. Không cần feature-flag check ngoài state matrix (BE gate `Inventory:InventoryV2` áp downstream). |
| Mở màn "Báo cáo tồn kho đến ngày" (mobile) | STK report route | `query stockLedgerAtDate(input: StockLedgerAtDateInput!)` | `InventoryRepository` (extend — thêm ops STK Reports) | View-only: filter Kho (multi) + Ngày (asOfDate) + search mã/tên (keyword) + pagination + dòng Tổng (aggregates footer). AC-2 mobile hide action column "Thao tác" (không có drill-down "Xem lịch sử" — web only). Realtime read — no cache. |
| Filter Kho (multi-select) + Ngày + search mã/tên | STK report route | `stockLedgerAtDate(input: {asOfDate, warehouseIds, keyword, page, size, sort})` | `InventoryRepository` | Cùng op web (§3.6d). Cùng response schema. Mobile UI render dòng Tổng (`aggregates.totalQuantity/totalValue`) tương tự web. |

> **Cross-wave hub state cascade (FEAT-INV-MOBILE-MENU W06)**: state matrix v3 = 6 tiles total, W06 flip 1 tile ("Tồn kho") từ HIDDEN → VISIBLE. Client Flutter chỉ cần deploy state matrix version bump — KHÔNG cần thêm route/screen mới (tile-tap route trỏ tới FEAT-STK-LIST-V2 màn mặc định). Backward-compat: tenant cũ (chưa enable `Inventory:InventoryV2` flag hoặc `stockLedgerAtDate` return 403) → mobile UX default hiển thị tile nhưng tap → toast "Chưa bật tính năng — liên hệ CSKH". FE hide-only strategy alternative: dùng feature flag check client-side.
>
> **Mobile PRC opt-out reason**: FEAT-PRC-* entirely web-only per platform scope. PRC là background operator task — chạy end-of-month bởi kế toán/chủ garage tại console. Mobile use-case = field operator (thủ kho, nhân viên xưởng) — không có nghiệp vụ tính giá. Nếu tương lai muốn expose progress polling to mobile → cần cascade CR + BA extend FEAT platform scope.
>
> **AP interaction implicit**: mobile STK report view-only KHÔNG trigger lock-check (read chỉ đọc sổ tồn realtime; không phải write op). AP W06 out of scope mobile.

### 3.5 Upload, OCR và business-side chat context

| UI Action | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Upload single hoặc multi attachment | image picker / attachment picker | `uploadAttachment`, `uploadMultipleFiles` | `MediaRepositoryImpl` | GraphQL multipart với `x-apollo-operation-name` |
| Delete uploaded files | attachment cleanup | `deleteFiles` | `MediaRepositoryImpl` | Cleanup sau replace/remove attachment |
| OCR giấy xe từ local file hoặc uploaded URL | vehicle info recognizer | `ocrUpload` | `MediaRepositoryImpl`, `VehicleInfoRecognizerCubit` | Flow OCR vẫn do backend own extraction |
| Resolve pinned business data cho chat PR | purchase request chat context | `getPurchaseRequestChat` | `CometChatRepository` qua `GraphQLService` | Pinned order data thuộc business graph |
| Resolve pinned business data cho chat quotation | quotation chat context | `quotationAskChatByCode` | `CometChatRepository` qua `GraphQLService` | Pinned quote data thuộc business graph |

### 3.6 Liên kết đối tác — Driver Plus (DESIGN — W07, EP-PARTNER-LINK)

> **FM-016**: điền đủ trước DEV. BFF authoritative: [`agg-garage-graph-graphql.md §3k`](../api/agg-garage-graph-graphql.md) (6 operation `W07-PL-Q1..Q2` + `W07-PL-M1..M4`). Backend: [`gf-system-api.md §3bis`](../api/gf-system-api.md). Canonical names: [`gf-system-api.md §5`](../api/gf-system-api.md).
>
> **Scope mobile = FULL (6/6 operation)** — khác các module W04/W06 (mobile view-only / narrow). `FEAT-SYS-DRIVERPLUS-LINK` ship **đồng thời** Web GMS + Mobile app, cùng 1 FEAT, cùng nghiệp vụ/lifecycle (`EP-PARTNER-LINK` §4 Platform + FEAT Nhóm N). **Cùng 1 BFF, KHÔNG có operation riêng cho mobile.**
>
> **Khác biệt so với web chỉ nằm ở UI màn danh sách "bên ngoài"** (entry point, layout card, bộ lọc). Màn chi tiết (3 section) + 4 modal action **giữ nguyên 100% như web** (FEAT Nhóm N ghi chú đầu mục) — không có AC riêng, không có operation riêng.

| UI Action | Route/Màn hình | GraphQL Operation | Op ID | Ghi chú |
|---|---|---|---|---|
| Tab **"Liên kết"** trên bottom-navigation | Bottom-nav (cùng nhóm Tổng quan / Danh mục / Liên kết / Tài khoản) | (điều hướng) | — | AC-40. **KHÔNG badge đỏ** đếm yêu cầu mới (đồng bộ web AC-1). Tab ẩn khi feature flag `PartnerLink:DriverPlus` = off — đọc qua `featureFlags` sẵn có (§3.1) |
| Vào tab → tab con **"Driver Plus"** active mặc định | Màn Liên kết | `listPartnerLinkRequests` | `W07-PL-Q1` | AC-40. Tab con **"Đối tác khác"** = placeholder, **KHÔNG có operation** |
| Render **danh sách dạng card** xếp dọc (KHÔNG master-detail như web) | Màn Liên kết | ↑ cùng query | `W07-PL-Q1` | AC-41. Tiêu đề "Danh sách yêu cầu liên kết" + đếm **"{N} yêu cầu"** ← `data.totalItems`. Mỗi card: `requestCode` + badge `status` + `partnerAccountName` + `partnerAccountPhone` + `requestedAt` **VÀ bổ sung** `processedByLabel` + `reason` (`BR-DPL-LST-005`) — cả 2 field **đã có sẵn** trong `PartnerLinkRequest`, KHÔNG cần field/op mới |
| Nút hành động **ngay trên card** (không cần vào chi tiết) | Card | Mở đúng modal tương ứng → 1 trong 4 mutation | `W07-PL-M1..M4` | AC-41. `PENDING` → [Từ chối] [Duyệt]; `LINKED` → [Đồng bộ lại] [Hủy liên kết]. Suy từ `status` của card; khi mở chi tiết thì dùng `availableActions` server-derived (parity web) |
| Text dài (tên tài khoản D+ / lý do) vượt độ rộng card | Card | — | — | AC-41: ellipsis cuối dòng + tap/hold hiện full text (`BR-COMMON#SYS-RETRY-025`) |
| Bấm **icon phễu** → mở màn **"Bộ lọc" full-screen** | Màn Bộ lọc (back-nav `<`) | ↑ `listPartnerLinkRequests` refetch với `statuses` mới | `W07-PL-Q1` | AC-42. **KHÔNG** dùng dropdown popover như web. 4 checkbox kèm chấm màu; default tick **`PENDING` + `LINKED`**; ghi nhớ trong phiên (`BR-COMMON#SYS-RETRY-009`), thoát session → về default. Bấm back áp filter vừa chọn |
| Empty state — chưa từng có yêu cầu | Màn Liên kết | ↑ (`totalItems: 0`, không filter) | — | AC-41: **"0 yêu cầu"** + minh hoạ hộp trống + text **"Chưa có yêu cầu liên kết nào từ Driver Plus."** (`ERR-DPL-008`) |
| Empty state — filter loại hết | Màn Liên kết | ↑ (`totalItems: 0`, có filter) | — | AC-41: **"Không có yêu cầu nào khớp bộ lọc."** (`ERR-DPL-009`). **KHÔNG** dùng chung text với case trên, **KHÔNG** dùng text generic "Không có dữ liệu" của component chung app |
| **Tap vào card** (ngoài vùng nút) → màn **chi tiết full-screen** | Màn chi tiết (back-nav) | `getPartnerLinkRequestDetail` | `W07-PL-Q2` | Nội dung 3 section **không đổi so với web** (AC-8..AC-11). Không cache — khối `garageProfile`/`invoiceInfo` phải real-time (CB-SYS-006) |
| 4 modal action (Duyệt / Từ chối / Đồng bộ lại / Hủy liên kết) | Modal | `approvePartnerLinkRequest` · `rejectPartnerLinkRequest` · `resyncPartnerLinkData` · `cancelPartnerLink` | `W07-PL-M1..M4` | **Giống hệt web** về nội dung + gate (scroll-to-end checkbox điều khoản, lý do bắt buộc, toast) — FEAT Nhóm N ghi chú cuối mục. Nút back cứng Android ≡ `Esc` (UX-FLOW §5) |
| Race condition — record đã bị người khác xử lý | Modal | ↑ mutation trả `ERR-DPL-004` (409) | — | AC-27 nhánh Mobile: nếu đang ở **màn danh sách** → refresh card tương ứng; nếu đang ở **màn chi tiết** → refresh nội dung màn đó. Cùng cơ chế web, khác UI element |
| Race condition — 2 user Duyệt cùng lúc | Modal Duyệt | ↑ `ERR-DPL-006` (409) | — | AC-31 nhánh Mobile: toast + đóng modal + refresh card **hoặc** màn chi tiết đang mở |
| Lỗi hệ thống khi gọi 4 action | Modal | ↑ `ERR-DPL-005` (503) | — | AC-29 (platform-agnostic): modal giữ nguyên dữ liệu + toast |
| Trạng thái đổi ngầm do Driver Plus | Màn danh sách / chi tiết | (không subscription/polling) | — | AC-33, AC-35: **KHÔNG toast, KHÔNG push realtime** — user pull-to-refresh hoặc thao tác khác sẽ thấy trạng thái mới |

**Ràng buộc mobile bắt buộc**:

- **KHÔNG** thêm routing-stack mới / state-management mới — dùng pattern hiện hữu (`SERVICE-BOUNDARY-MATRIX` forbidden scope `garage-mobile`).
- **KHÔNG** bypass `GraphQLService`; **KHÔNG** gọi trực tiếp `gf-system`.
- **KHÔNG** invent operation — 6 op trên là toàn bộ surface W07; mọi op mới phải bổ sung vào bảng này trước DEV (FM-016).
- **KHÔNG** phân trang / infinite-scroll cho danh sách (`BR-DPL-LST-004` — deviation có chủ đích so với default mobile `BR-COMMON#SYS-RETRY-004` 20 bản ghi/trang, áp cho **cả 2 platform**).
- Accessibility: badge trạng thái có accessibility label (TalkBack/VoiceOver); nút disabled có semantics tương đương `aria-disabled` + lý do (UX-FLOW §5).

## 4. Tác động tới quản lý trạng thái

- `GraphQLService` là client business duy nhất; mobile hiện dùng `FetchPolicy.networkOnly` với `GraphQLCache(HiveStore())`.
- `ProfileRepository`, `FlagsRepository`, `HomeRepository`, `NotificationRepository`, `OrderingRepository`, `BookingRepository`, `ServiceOrderRepository`, `SettlementRepository`, `InventoryRepository`, `SupplierRepository`, `VehicleManagementRepository` là lớp map request/response chính.
- `AppCubit`, `MainCubit`, `ProfileCubit`, `PolicyFirstCubit` tiêu thụ trực tiếp state từ business graph để mở shell, gate T&C, unread count, payment gate và tenant context.
- `SharedPreferences` và `HiveStore` chỉ giữ bootstrap hint/cache (`PROFILE`, `TC_AUTH`, feature flags cache, payment gate hints); chúng không phải business source of truth.
- Mobile là online-first; repo hiện không có offline mutation queue hoặc local domain DB cho business flow.

## 5. Pattern không được dùng

- Không bypass `GraphQLService` cho feature business mới.
- Không dùng REST/WebView/native callback làm baseline thay cho contract `agg-garage-graph`.
- Không đánh dấu payment success trước callback cuối từ WebView/payment gateway.
- Không mở rộng REST export/upload helper thành transport mặc định cho feature business mới.
- Không coi `PermissionGuard` hoặc local permission snapshot là authorization authority cuối cùng.
- Không persist booking, service order, inventory hoặc settlement như durable local source of truth.

## 6. Tham chiếu

- HLD [garage-mobile-HLD.md](../hld/garage-mobile-HLD.md)
- BFF HLD [agg-garage-graph-HLD.md](../hld/agg-garage-graph-HLD.md)
- API [agg-garage-graph-graphql.md](../api/agg-garage-graph-graphql.md)
- Source tham chiếu: `cardoctor_garage_v3` / `gf-garage-app`
- **W07 Partner Link**: [agg-garage-graph-graphql.md §3k](../api/agg-garage-graph-graphql.md) — 6 operation `W07-PL-Q1..Q2` + `W07-PL-M1..M4`; [gf-system-api.md §3bis + §5](../api/gf-system-api.md) — REST endpoint + Naming Registry canonical; **ADR-029** + **ADR-030**; [INTEG-EXT-driver-plus.md](INTEG-EXT-driver-plus.md); Product: EP-PARTNER-LINK + FEAT-SYS-DRIVERPLUS-LINK (**Nhóm N** mobile) + UX-FLOW-PARTNER-LINK (bước ②' Mobile variant) + BR-GF-SYSTEM §2.5 (đặc biệt `BR-DPL-LST-005` mobile card variant) + ERROR-CODE-REGISTRY §5.

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-08-05 | v10 | **W07 EP-PARTNER-LINK (DESIGN) — thêm §3.6 UI mapping "Liên kết đối tác — Driver Plus"** (14 UI action → 6 GraphQL operation §3k). §2 Luồng xác thực +1 row tab "Liên kết" bottom-nav. **Scope mobile = FULL 6/6 operation** — khác hẳn pattern W04 (OB view-only) và W06 (narrow 1/8 FEAT): `FEAT-SYS-DRIVERPLUS-LINK` ship **đồng thời** web + mobile trong cùng 1 FEAT, cùng nghiệp vụ/lifecycle, **cùng 1 BFF, không có operation riêng cho mobile** (`EP-PARTNER-LINK` §4 Platform + §5.2). Khác biệt so với web **chỉ ở màn danh sách bên ngoài**: entry point bottom-nav tab (AC-40, không badge đỏ) · danh sách **card** xếp dọc + đếm "{N} yêu cầu" + 2 field bổ sung `processedByLabel`/`reason` trên card (`BR-DPL-LST-005` — field đã có sẵn trong `PartnerLinkRequest`, KHÔNG cần op/field mới) + nút action ngay trên card · màn **Bộ lọc full-screen** riêng (AC-42, không dropdown popover) · 2 empty state tách biệt đúng câu chữ web. Màn chi tiết + 4 modal **giữ 100% như web** (FEAT Nhóm N). Thêm block "Ràng buộc mobile bắt buộc" (no new routing/state-mgmt, no bypass `GraphQLService`, no invent operation FM-016, **no pagination** per `BR-DPL-LST-004` deviation, a11y label). §6 Tham chiếu +1 bullet W07. **KHÔNG đụng**: §1 · §3.1-§3.5 (mọi domain trước, gồm §3.4b OB W04 + §3.4c Stock V2 W06) · §4-§5. v9 → v10. |
| 2026-07-23 | v9 | **W06 Round 8 cascade — sync §3.4c REST reference for FEAT-STK-LIST-V2 mobile mapping (Q1 only — mobile scope narrow, doesn't touch Q2/Q3) after `gf-inventory-api v67` flipped Q1 GET→POST+`/search` per codebase majority convention** (1 user directive, no new design decision, no re-litigation of any prior round). **Trigger**: user 2026-07-23 "các api liên quan đến search có phân trang thì cần dùng POST, tuân thủ theo code base hiện tại". Read-only codebase audit confirmed majority convention (`gf-customer`, `gf-sales`, `gf-marketing`, `gf-erp-mdm`, `gf-accounting-api W06-1 price-calc-runs/search`). **Fixes** §3.4c intro note "Authoritative source" line: REST endpoint text `GET /api/v*/stock-ledgers/at-date` → `POST /api/v*/stock-ledgers/at-date/search (JSON body per gf-inventory-api §3g.2 W06-STK-Q1 v67)` + explicit annotation "R8 flip GET→POST+`/search` per codebase majority convention, 2026-07-23" + append "GraphQL Query type UNCHANGED — mobile FE contract stable; `InventoryRepository.stockLedgerAtDate` op semantics unchanged, Input/Response shapes verbatim; flip is BFF→REST internal transport only (mobile Flutter SDK sees zero difference)". Old "pending backfill trong gf-inventory-api.md — soft open_questions[] cascade CR" language obsolete (backfilled Round 3 v64) — rewritten reflecting v67 R8 flip. §3.4c 4 table rows UNCHANGED (no REST column in mobile table structure — 5 cols: UI Action / Route / GraphQL Op / Source / Ghi chú; GraphQL Op column stable). Hub state matrix W06 v3 (4 tile visible flip HIDDEN→VISIBLE "Tồn kho") + PRC opt-out reason + backward-compat toast fallback UNCHANGED. Q2 (IP-VIEW-V2) + Q3 (STK-DETAIL-V2) NOT applicable — web-only per FEAT platform scope, mobile Flutter SDK MUST NOT emit those queries (§3.4c scope declaration stable). **KHÔNG đụng**: (a) §3.1-3.3 baseline + §3.4 domain khác + §3.4b W04 OB view-only + §3.5 upload/OCR; (b) §3.4c 4 mapping rows (GraphQL Op + Source columns stable) + Hub state matrix + PRC opt-out reason + backward-compat toast fallback; (c) §1-§2 route + auth flow; (d) §4-§5 state management + Forbidden Patterns; (e) R12 catalog mobile scope note + AP-on-gf-accounting web-only note. Cascade pair: `gf-inventory-api v67` (primary REST verb flip + Request body JSON schema per G5 6-block completeness) + `agg-garage-graph-graphql v7.77 §3j` (BFF Downstream text + resolver discipline dual-transport update) + `INTEG-FE-garage-web-agg-garage-graph.md v22 §3.6d` (web REST col 3 rows Q1/Q2/Q3) + `gf-inventory-HLD.md §6b.9` (conditional no-op — no GET-specific wording found tied to index-usage discussion). Product docs untouched (transport-mechanism internal detail, not Product-visible behavior; FEAT-STK-LIST-V2 mobile AC-2/AC-3 hide-action-column stable). Round 8 mandate `Tracking/arch-design-W06-answers-8.md`. v8 → v9. |
| 2026-07-22 | v8 | **W06 arch-design Round 2 — Add §3.4c Stock V2 Report mobile scope (NARROW FEAT-STK-LIST-V2 ONLY) + cross-wave FEAT-INV-MOBILE-MENU tile "Tồn kho" flip**. Round 1 Q1/Q2/Q3=A ratified 2026-07-22 unchanged. Round 2 mobile scope narrow — Web GMS carries 8/8 W06 FEAT, mobile carries 1/8 (FEAT-STK-LIST-V2). Rationale: PRC là background operator task cho kế toán/chủ garage tại console; mobile use-case = field operator không có PRC nghiệp vụ. FEAT-IP-VIEW-V2 + FEAT-STK-DETAIL-V2 web-only per FEAT `Platform scope: Web GMS only`. §3.4c section: (a) Hub state matrix W06 v3 = 4 tile visible (Sản phẩm W03 + Nhóm vật tư W03 + Tồn đầu kỳ W04 + **Tồn kho W06 flip HIDDEN → VISIBLE**), 2 tile vẫn HIDDEN (Phiếu nhập/Xuất — W05 mobile Slip V2 policy separate CR); (b) Tile-tap "Tồn kho" push route → FEAT-STK-LIST-V2 màn mặc định; (c) 1 mobile op `stockLedgerAtDate` (W06-STK-Q1) — view-only, filter Kho multi + Ngày asOfDate + search mã/tên + pagination + aggregates footer dòng Tổng; realtime read no cache; (d) AC-2 mobile hide action column "Thao tác" — không drill-down thẻ kho mobile (STK-DETAIL-V2 web-only). Backward-compat: tenant chưa enable `Inventory:InventoryV2` → tile visible but tap-toast fallback (hoặc client-side flag hide alternative). PRC opt-out reason documented — nếu tương lai muốn expose progress polling to mobile cần cascade CR + BA extend FEAT platform scope. AP W06 out of scope mobile — view-only KHÔNG trigger lock-check. **Soft flag**: gf-inventory-api.md v63 chưa có sub-section cho public REST `/api/v*/stock-ledgers/at-date` — pending Delivery Authority cascade CR + backfill trước `/dev-start` W06. Pair với `agg-garage-graph-graphql.md v7.74 §3j` + `INTEG-FE v19 §3.6d` + `garage-mobile-HLD v22 §11d` + `garage-web-HLD v13`. **KHÔNG đụng**: (a) §3.1-3.3 baseline + §3.4 domain khác + §3.4b W04 OB view-only + §3.5 upload/OCR; (b) §1-§2 route + auth flow; (c) §4-§5 state management + Forbidden Patterns; (d) R12 catalog mobile scope note + AP-on-gf-accounting web-only note. v7 → v8. |
| 2026-07-06 | v7 | **W04 — Add §3.4b Inventory V2 Opening Balance (view-only) + Mobile Hub FEAT-INV-MOBILE-MENU**. (a) Mobile hub tile grid render 3 tiles trong W04: Sản phẩm (W03 view-only) + Nhóm vật tư (W03 full CRUD) + Tồn đầu kỳ (W04 view-only, `searchOpeningBalances`). Hub is client-side navigation only — zero GraphQL/REST call for hub itself (FEAT-INV-MOBILE-MENU AC-3/4/5 hide-only strategy, back-stack preserve). (b) Mobile OB list route consumes `searchOpeningBalances` only (view-only per UX-FLOW-INVENTORY-OPENING-BALANCE §29 "App Garage chỉ XEM") with filter Kho/NgàyImport + dòng Tổng. NO import/edit/delete surface on mobile — full CRUD web-only (per INTEG-FE §3.6c). AP interaction implicit: mobile view-only KHÔNG trigger lock-check; AP W04 out of scope mobile. Note remaining 3 tiles ("Phiếu nhập"/"Phiếu xuất"/"Tồn kho") hidden per state matrix (W05/W06 will enable). v6 → v7. |
| 2026-06-25 | v6 | **R12 — Mobile `MaterialGroupListScreen` flat card (KHÔNG TreeView) — bỏ Q2 `getMaterialGroupTree` khỏi mobile-consume** (CR-1782381477, MINOR, self-approve) — sau visual verification Figma `5YU4H3iY726P8KNxI9oCYF` node `21254:52586`: mobile = flat card list (AppBar + Tab segment status + ListView card + FAB + filter bottom sheet), KHÔNG indent/expand-collapse. Bảng R12 row "Material Group (full)" — cột "Ops mobile consume" bỏ Q2 → còn 5 ops (Q1/Q3 + M1/M2/M3); thêm note "list = flat card per Figma". Tail sentence thêm explicit Q2 KHÔNG wire (mobile dùng Q1 paginated với status tab + parentId filter sheet). Tổng mobile consume 8 → 7 ops (4 Q + 3 M). BE V2-2 endpoint + BFF Q2 resolver vẫn keep additive cho integration future. Pattern align web G4 (cả 2 platform flat). v5 → v6. |
| 2026-06-25 | v5 | **R12 — Reclassify Inventory V2 Catalog mobile scope OUT → PARTIAL** (CR-1782373204 2026-06-25, MINOR, self-approve) — v4 phát biểu "OUT of scope mobile" cho 12 feature Inventory V2 Catalog là stale vì BA decision cùng ngày 2026-06-24 đã thể hiện trên `Product/ux/UX-FLOW-INVENTORY-CATALOG.md:34` ("**Nền tảng:** Garage Care — Web GMS (đầy đủ…) + App Garage (mobile, phạm vi khác nhau theo nhóm chức năng): Nhóm VTHH **đầy đủ** thêm/sửa/xóa/list/xem · Mã SP nội bộ **chỉ list + xem view-only**") + `Product/features/FEAT-CAT-GRP-LIST.md` AC-11 + `Product/features/FEAT-CAT-PROD-LIST.md` AC-11. v5 rewrite R12 paragraph thành bảng 3 nhóm: (1) Material Group full CRUD mobile = 5 FEAT-CAT-GRP-* (Q1/Q2/Q3 + M1/M2/M3); (2) Internal Product view-only = FEAT-CAT-PROD-LIST + FEAT-CAT-PROD-DETAIL (Q4/Q5); (3) Internal Product web-only = 5 FEAT-CAT-PROD-{CREATE,EDIT,DELETE,IMPORT,EXPORT} không có mobile mapping. Tổng mobile consume = 8 ops (5 Q + 3 M). AppBar list Product KHÔNG có Thêm/Import/Export; Detail KHÔNG có Edit/Delete. Cross-link tới Figma registry `Product/ux/figma/figma-links.yaml` W03 = 7/12 mobile node consistent. AP-on-gf-accounting (5 FEAT-AP-*) vẫn OUT of scope (không đụng). v4 → v5. |
| 2026-06-24 | v4 | **R12 — Document Inventory V2 Catalog + AP mobile scope (per Delivery Authority feedback 2026-06-24)** — §3.4 thêm explicit note "**OUT of scope mobile**" cho 2 batch: (1) Inventory V2 Catalog (12 features `FEAT-CAT-GRP-*` + `FEAT-CAT-PROD-*`, material_group + internal_product + conversion_unit + sku_mapping + attachment + search V2-1/V2-7 POST + bulk import + export) per `UX-FLOW-INVENTORY-CATALOG.md:34` "Garage Care Web GMS only"; (2) AP-on-gf-accounting (5 features `FEAT-AP-*`) per `UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md:31` Web GMS only. Mobile inventory ops giữ V1 surface legacy (stock/receipt/delivery/period). Cross-link tới web mapping authoritative `INTEG-FE §3.6a + §3.6b`. Future mobile expansion = CR riêng + BA confirm UX-FLOW. v3 → v4. |
| 2026-06-04 | v3 | **Reconcile op-name (Blocker 2, verified vs committed HEAD agg graph)**: §3.4 row "Điều chỉnh BH + Nguồn TT" — `applyInsuranceAdjustments` → `updateServiceOrderV3` (additive allocation input; op `applyInsuranceAdjustments` KHÔNG có trong agg graph, đã gỡ khỏi contract §3c). REST đích `PUT /api/v3/service-orders/:id` giữ nguyên. |
| 2026-05-30 | v2 | **Insurance Settlement (DESIGN — EP-INSURANCE-SETTLEMENT, CR-1780147390, ADR-014)**: thêm §3.4 — 4 mapping rows (applyInsuranceAdjustments→gf-sales; insurance settlement detail + recordInsurancePayment→gf-accounting; dossier CRUD/export/download→gf-accounting; insurance debt widget→gf-sales→gf-accounting). Online-first (no offline queue); `Upload` scan ③; section điều chỉnh chỉ Edit/Detail (BR-INS-SO-PS-006). |
| 2026-05-13 | v1 | Tạo contract mobile -> `agg-garage-graph`; gom riêng bootstrap/tenant/profile, dashboard/notification/permission, quotation-ordering-payment init, booking/service-order, inventory/settlement/customer/supplier/vehicle và upload/OCR business-side chat context. |
