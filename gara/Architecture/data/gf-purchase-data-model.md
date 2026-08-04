---
type: architecture
artifact_kind: data-model
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: "gf-purchase"
last_reviewed: "2026-05-19"
---

# Data Model - `gf-purchase`

> PostgreSQL qua Spring Data JPA. Schema mặc định là `${DB_SCHEMA:dev-gf-purchase}`. Source hiện tại dùng Hibernate `ddl-auto: update` cùng Flyway migration từ `V1.0.0` đến `V1.0.14`.

## 1. ERD Overview

```mermaid
erDiagram
    asked_vehicles ||--|| quotation_asks : "vehicle_id"
    quotation_asks ||--o{ asked_spare_parts : "quotation_ask_id"
    quotation_asks ||--o{ asked_attachments : "quotation_ask_id"
    quotation_asks ||--o{ quotation_bids : "quotation_ask_code"
    quotation_asks ||--o| preliminary_quotations : "quotation_ask_code"
    quotation_asks ||--o{ quotation_asks_pricing_request : "quotation_ask_code"
    quotation_asks ||--o{ quotation_asks_pricing_proposal : "quotation_ask_code"
    quotation_asks ||--o{ quotation_ask_histories : "quotation_ask_code"
    quotation_ask_histories ||--o{ quotation_ask_history_items : "quotation_ask_history_id"
    quotation_bids ||--o{ bidded_spare_parts : "quotation_bid_id"
    quotation_bids ||--o{ spare_part_price_line_items : "quotation_bid_id"
    quotation_bids ||--o{ added_spare_part_price_line_items : "quotation_bid_id"
    quotation_asks_pricing_request ||--o{ asked_spare_parts_pricing_request : "quotation_ask_pricing_id"
    quotation_asks_pricing_proposal ||--o{ asked_spare_parts_pricing_proposal : "quotation_ask_pricing_proposal_id"
    purchase_request ||--o{ purchase_request_data : "purchase_request_id"
    purchase_request ||--o{ purchase_request_confirmations : "purchase_request_id"
    purchase_request ||--o{ pr_quotation_ref : "pr_id"
    purchase_request ||--o{ pr_transition_history : "pr_id"
    purchase_request ||--o{ purchase_orders : "pr_id"
    purchase_request ||--o{ payment_orders : "purchase_request_code"
    purchase_orders ||--o{ purchase_order_items : "purchase_order_id"
    purchase_orders ||--o{ purchase_order_attachments : "purchase_order_id"
    purchase_orders ||--o{ po_products : "po_id"
    purchase_orders ||--o{ po_supplier : "po_id"
    purchase_orders ||--o{ po_quotation_ref : "po_id"
    purchase_orders ||--o{ po_transition_history : "po_id"
    payment_orders ||--o{ payment_balances : "payment_order_id"
    suppliers ||--o{ purchase_orders : "supplier_id hoac direct_supplier_id"
    suppliers ||--o{ po_supplier : "supplier_id"

    quotation_asks {
        BIGINT id PK "khóa chính do service cấp"
        VARCHAR code UK "mã báo giá mua hàng, NOT NULL"
        BIGINT tenant_id "tenant gara, NOT NULL"
        VARCHAR tenant_name "tên tenant, NOT NULL"
        VARCHAR tenant_phone_number "số điện thoại tenant"
        VARCHAR tenant_ops_area "khu vực vận hành"
        TEXT tenant_address "địa chỉ tenant"
        VARCHAR tenant_ops_region "vùng vận hành"
        TEXT ask_note "ghi chú yêu cầu báo giá"
        BOOLEAN is_invoice_required "yêu cầu xuất hóa đơn, NOT NULL"
        VARCHAR invoice_company_name "tên công ty xuất hóa đơn"
        VARCHAR tax_code "mã số thuế"
        VARCHAR invoice_company_email_address "email nhận hóa đơn"
        TEXT invoice_company_address "địa chỉ xuất hóa đơn"
        VARCHAR status "QuotationStatus, NOT NULL"
        BOOLEAN is_processed "đã xử lý, NOT NULL"
        TIMESTAMP processed_at "thời điểm xử lý"
        BOOLEAN is_best_price "yêu cầu giá tốt nhất, NOT NULL"
        VARCHAR quotation_ref_code "mã báo giá tham chiếu"
        VARCHAR insurance_code "mã bảo hiểm"
        BIGINT vehicle_id FK "tham chiếu asked_vehicles.id, NOT NULL"
        BIGINT version "optimistic lock"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    asked_vehicles {
        BIGINT id PK "khóa chính tự tăng"
        VARCHAR car_brand "hãng xe, NOT NULL"
        VARCHAR car_model "dòng xe, NOT NULL"
        VARCHAR year_of_manufacture "năm sản xuất"
        VARCHAR car_type "CarType"
        VARCHAR trims_level "phiên bản xe"
        VARCHAR vin "số VIN"
        VARCHAR license_plate "biển số"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    asked_spare_parts {
        BIGINT id PK "khóa chính do service cấp"
        VARCHAR code UK "mã phụ tùng hỏi mua, NOT NULL"
        VARCHAR part_name_input "tên phụ tùng nhập vào, NOT NULL"
        VARCHAR part_name_unit "đơn vị tên phụ tùng, NOT NULL"
        VARCHAR ref_code "mã tham chiếu"
        BIGINT tenant_id "tenant gara, NOT NULL"
        BOOLEAN deleted "xóa mềm, NOT NULL"
        BIGINT quantity "số lượng yêu cầu"
        VARCHAR genuine_code "mã genuine"
        VARCHAR parent_code "mã phụ tùng cha"
        BIGINT quotation_ask_id FK "tham chiếu quotation_asks.id, NOT NULL"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    asked_attachments {
        BIGINT id PK "khóa chính tự tăng"
        BIGINT quotation_ask_id FK "tham chiếu quotation_asks.id, NOT NULL"
        TEXT attachment_url "đường dẫn file, NOT NULL"
        VARCHAR owner "OwnerType, NOT NULL"
        TEXT note "ghi chú"
        BOOLEAN deleted "xóa mềm, NOT NULL"
        VARCHAR ref_code "mã tham chiếu"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    quotation_bids {
        BIGINT id PK "khóa chính do service cấp"
        BIGINT tenant_id "tenant vendor, NOT NULL"
        VARCHAR tenant_type "TenantType, NOT NULL"
        VARCHAR quotation_ask_code "mã quotation_asks.code"
        VARCHAR bid_type "BidType, NOT NULL"
        VARCHAR status "QuotationBidStatus, NOT NULL"
        VARCHAR note "ghi chú"
        BIGINT version "optimistic lock"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    bidded_spare_parts {
        BIGINT id PK "khóa chính tự tăng"
        VARCHAR code UK "mã phụ tùng báo giá"
        VARCHAR ref_code "mã tham chiếu, NOT NULL"
        BIGINT tenant_id "tenant vendor"
        VARCHAR part_name_input "tên phụ tùng, NOT NULL"
        VARCHAR part_name_unit "đơn vị tên phụ tùng"
        BOOLEAN deleted "xóa mềm, NOT NULL"
        BIGINT quotation_bid_id FK "tham chiếu quotation_bids.id, NOT NULL"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    spare_part_price_line_items {
        BIGINT id PK "khóa chính tự tăng"
        VARCHAR spare_part_input_code "mã phụ tùng đầu vào"
        VARCHAR segment "Segment, NOT NULL"
        NUMERIC price "giá báo"
        VARCHAR currency "tiền tệ"
        VARCHAR note "ghi chú"
        VARCHAR unit "đơn vị"
        BOOLEAN picked_to_po "đã chọn sang PO, NOT NULL"
        BOOLEAN detail_status "đã hỏi giá chi tiết, NOT NULL"
        BOOLEAN receive_detail_status "vendor đã phản hồi chi tiết, NOT NULL"
        INTEGER quantity "số lượng"
        NUMERIC material_price "giá vật tư"
        NUMERIC servicing_price "giá công"
        BOOLEAN deleted "xóa mềm, NOT NULL"
        BIGINT quotation_bid_id FK "tham chiếu quotation_bids.id, NOT NULL"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    added_spare_part_price_line_items {
        BIGINT id PK "khóa chính tự tăng"
        VARCHAR spare_part_input_code "mã phụ tùng thêm"
        VARCHAR segment "Segment, NOT NULL"
        NUMERIC price "giá báo"
        VARCHAR currency "tiền tệ"
        VARCHAR note "ghi chú"
        VARCHAR unit "đơn vị"
        BOOLEAN picked_to_po "đã chọn sang PO, NOT NULL"
        BOOLEAN deleted "xóa mềm, NOT NULL"
        BOOLEAN detail_status "đã hỏi giá chi tiết, NOT NULL"
        BOOLEAN receive_detail_status "vendor đã phản hồi chi tiết, NOT NULL"
        INTEGER quantity "số lượng"
        NUMERIC material_price "giá vật tư"
        NUMERIC servicing_price "giá công"
        BIGINT quotation_bid_id FK "tham chiếu quotation_bids.id, NOT NULL"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    quotation_asks_pricing_request {
        BIGINT id PK "khóa chính tự tăng"
        VARCHAR quotation_ask_code "mã quotation_asks.code, NOT NULL"
        BIGINT origin_tenant_id "tenant gửi yêu cầu, NOT NULL"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    asked_spare_parts_pricing_request {
        BIGINT id PK "khóa chính tự tăng"
        VARCHAR code "mã phụ tùng, NOT NULL"
        VARCHAR part_name_input "tên phụ tùng, NOT NULL"
        VARCHAR part_name_unit "đơn vị tên phụ tùng, NOT NULL"
        INTEGER quantity "số lượng, NOT NULL"
        VARCHAR segment "Segment, NOT NULL"
        VARCHAR ref_code "mã tham chiếu"
        BIGINT tenant_id "tenant vendor, NOT NULL"
        BOOLEAN proposal_status "đã có proposal, NOT NULL"
        BIGINT quotation_ask_pricing_id FK "tham chiếu quotation_asks_pricing_request.id, NOT NULL"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    quotation_asks_pricing_proposal {
        BIGINT id PK "khóa chính tự tăng"
        VARCHAR quotation_ask_code "mã quotation_asks.code, NOT NULL"
        BIGINT reply_tenant_id "tenant phản hồi, NOT NULL"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    asked_spare_parts_pricing_proposal {
        BIGINT id PK "khóa chính tự tăng"
        VARCHAR spare_part_input_code "mã phụ tùng, NOT NULL"
        VARCHAR segment "Segment, NOT NULL"
        NUMERIC material_price "giá vật tư, NOT NULL"
        NUMERIC servicing_price "giá công, NOT NULL"
        VARCHAR currency "tiền tệ, NOT NULL"
        INTEGER quantity "số lượng, NOT NULL"
        VARCHAR unit "đơn vị, NOT NULL"
        VARCHAR ref_code "mã tham chiếu"
        TEXT note "ghi chú"
        BOOLEAN updated_status "trạng thái cập nhật giá, NOT NULL"
        BIGINT quotation_ask_pricing_proposal_id FK "tham chiếu quotation_asks_pricing_proposal.id, NOT NULL"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    preliminary_quotations {
        BIGINT id PK "khóa chính tự tăng"
        VARCHAR code UK "mã báo giá sơ bộ, NOT NULL"
        VARCHAR quotation_ask_code UK "mã quotation_asks.code, NOT NULL"
        BIGINT consultant_id "tư vấn viên, NOT NULL"
        VARCHAR consultant_name "tên tư vấn viên"
        VARCHAR consultant_phone_number "số điện thoại tư vấn viên"
        BIGINT tenant_id "tenant gara, NOT NULL"
        JSONB spare_parts "danh sách phụ tùng"
        NUMERIC total_amount "tổng tiền"
        TEXT note "ghi chú"
        VARCHAR status "PreliminaryQuotationStatus, NOT NULL"
        INTEGER version "phiên bản nghiệp vụ, NOT NULL"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    cart {
        BIGINT id PK "khóa chính tự tăng"
        BIGINT product_id "sản phẩm, NOT NULL"
        BIGINT quotation_ask_id "quotation ask, NOT NULL"
        BIGINT purchaser_id "tenant gara, NOT NULL"
        BIGINT supplier_id "tenant vendor, NOT NULL"
        INTEGER quantity "số lượng, NOT NULL"
        BOOLEAN is_picked "đã chọn, NOT NULL"
        VARCHAR ref_pr_code "mã PR tham chiếu"
        BOOLEAN deleted "xóa mềm, NOT NULL"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    purchase_request {
        BIGINT id PK "khóa chính do service cấp"
        VARCHAR code UK "mã PR, NOT NULL"
        BIGINT purchaser_id "tenant gara, NOT NULL"
        VARCHAR status "PurchaseRequestStatus"
        TEXT note "ghi chú"
        JSONB status_transition_data "lịch sử chuyển trạng thái"
        VARCHAR payment_method "PaymentMethod"
        VARCHAR payment_status "PaymentStatus"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    purchase_request_data {
        BIGINT id PK "khóa chính tự tăng"
        VARCHAR requested_product_name "tên sản phẩm yêu cầu, NOT NULL"
        VARCHAR quotation_ask_code "mã quotation ask, NOT NULL"
        BIGINT product_id "sản phẩm, NOT NULL"
        BIGINT purchase_request_id "tham chiếu purchase_request.id, NOT NULL"
        BIGINT purchaser_id "tenant gara, NOT NULL"
        BIGINT supplier_id "tenant vendor, NOT NULL"
        INTEGER requested_quantity "số lượng yêu cầu, NOT NULL"
        INTEGER actual_sales_quantity "số lượng bán thực tế"
        NUMERIC detailed_price "giá chi tiết"
        NUMERIC material_price "giá vật tư"
        NUMERIC servicing_price "giá công"
        VARCHAR sales_status "PurchaseRequestDataStatus, NOT NULL"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    purchase_request_confirmations {
        BIGINT id PK "khóa chính tự tăng"
        BIGINT purchase_request_id "tham chiếu purchase_request.id, NOT NULL"
        VARCHAR purchase_request_code "mã PR, NOT NULL"
        VARCHAR status "PurchaseRequestConfirmationStatus, NOT NULL"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    pr_quotation_ref {
        BIGINT id PK "khóa chính tự tăng"
        BIGINT pr_id "tham chiếu purchase_request.id, NOT NULL"
        BIGINT quotation_ask_id "tham chiếu quotation_asks.id, NOT NULL"
    }

    pr_transition_history {
        BIGINT id PK "khóa chính tự tăng"
        BIGINT pr_id "tham chiếu purchase_request.id, NOT NULL"
        JSONB previous_stages "stage trước đó"
        JSONB transition_data "dữ liệu chuyển trạng thái"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    purchase_orders {
        BIGINT id PK "khóa chính do service cấp"
        VARCHAR code UK "mã PO"
        VARCHAR source "PurchaseSource"
        BIGINT transport_order_id "transport order"
        BIGINT purchaser_id "tenant gara"
        BIGINT supplier_id "tenant vendor"
        VARCHAR supplier_name "tên supplier"
        VARCHAR payment_method "PaymentMethod"
        BOOLEAN is_best_price "giá tốt nhất"
        BIGINT transport_route_id "route vận chuyển"
        TEXT quotation_ask_code "mã quotation ask"
        VARCHAR stage "POStage"
        VARCHAR status "POStatusEnum"
        VARCHAR note "ghi chú"
        BIGINT pr_id "tham chiếu purchase_request.id"
        VARCHAR sale_order_code "mã sale order"
        BIGINT version "optimistic lock"
        BIGINT tenant_id "tenant direct purchase"
        BIGINT direct_supplier_id "supplier trực tiếp"
        VARCHAR priority "độ ưu tiên"
        VARCHAR related_service_order_code "service order liên quan"
        DATE expected_delivery_date "ngày giao dự kiến"
        VARCHAR supplier_contact_phone "điện thoại supplier"
        VARCHAR supplier_tax_code "mã số thuế supplier"
        TEXT supplier_address "địa chỉ supplier"
        TEXT notes "ghi chú direct purchase"
        VARCHAR confirmed_by "người xác nhận"
        TIMESTAMP confirmed_at "thời điểm xác nhận"
        VARCHAR delivering_by "người chuyển sang giao"
        TIMESTAMP delivering_at "thời điểm chuyển sang giao"
        TIMESTAMP delivered_at "thời điểm đã giao"
        VARCHAR completed_by "người hoàn tất"
        TIMESTAMP closed_at "thời điểm đóng"
        VARCHAR closed_by "người đóng"
        VARCHAR cancelled_by "người hủy"
        TIMESTAMP cancelled_at "thời điểm hủy"
        TEXT cancellation_reason "lý do hủy"
        VARCHAR returned_by "người trả hàng"
        TIMESTAMP returned_at "thời điểm trả hàng"
        TEXT return_reason "lý do trả hàng"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    purchase_order_items {
        BIGINT id PK "khóa chính tự tăng"
        BIGINT tenant_id "tenant, NOT NULL"
        BIGINT purchase_order_id "tham chiếu purchase_orders.id, NOT NULL"
        VARCHAR sku "SKU, NOT NULL"
        VARCHAR genuine_code "mã genuine"
        VARCHAR product_name "tên sản phẩm, NOT NULL"
        VARCHAR tier "tier"
        VARCHAR origin "xuất xứ"
        NUMERIC quantity "số lượng, NOT NULL, (10,2)"
        VARCHAR unit_of_measure "đơn vị, NOT NULL"
        NUMERIC unit_price "đơn giá, NOT NULL, (15,2)"
        NUMERIC discount_percent "phần trăm giảm giá, (5,2)"
        NUMERIC discount_amount "tiền giảm giá, (15,2)"
        NUMERIC tax_rate "thuế suất, (5,2)"
        NUMERIC tax_amount "tiền thuế, (15,2)"
        NUMERIC line_amount "thành tiền dòng, NOT NULL, (15,2)"
        NUMERIC total_amount "tổng tiền dòng, NOT NULL, (15,2)"
        VARCHAR quotation_ask_code "mã quotation ask"
        BIGINT product_id "sản phẩm"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    purchase_order_attachments {
        BIGINT id PK "khóa chính tự tăng"
        BIGINT purchase_order_id "tham chiếu purchase_orders.id, NOT NULL"
        TEXT attachment_url "đường dẫn file, NOT NULL"
        VARCHAR file_name "tên file"
        VARCHAR file_type "loại file"
        VARCHAR type "AttachmentType, NOT NULL"
        BOOLEAN deleted "xóa mềm, NOT NULL"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    po_products {
        BIGINT id PK "khóa chính tự tăng"
        BIGINT po_id "tham chiếu purchase_orders.id, NOT NULL"
        BIGINT product_id "sản phẩm, NOT NULL"
        VARCHAR requested_product_name "tên sản phẩm yêu cầu, NOT NULL"
        BIGINT quantity "số lượng, NOT NULL"
        NUMERIC unit_price "đơn giá, NOT NULL"
        VARCHAR unit "đơn vị, NOT NULL"
        VARCHAR segment "Segment, NOT NULL"
        BIGINT supplier_id "supplier, NOT NULL"
        VARCHAR quotation_ask_code "mã quotation ask"
        VARCHAR sku "SKU"
        VARCHAR genuine_code "mã genuine"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    po_supplier {
        BIGINT id PK "khóa chính tự tăng"
        BIGINT po_id "tham chiếu purchase_orders.id, NOT NULL"
        BIGINT supplier_id "supplier, NOT NULL"
        VARCHAR status "POSupplyStatus, NOT NULL"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    po_quotation_ref {
        BIGINT id PK "khóa chính tự tăng"
        BIGINT po_id "tham chiếu purchase_orders.id, NOT NULL"
        VARCHAR quotation_ask_code "mã quotation ask, NOT NULL"
    }

    po_transition_history {
        BIGINT id PK "khóa chính tự tăng"
        BIGINT po_id "tham chiếu purchase_orders.id, NOT NULL"
        JSONB previous_stages "stage trước đó"
        JSONB transition_data "dữ liệu chuyển trạng thái"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    suppliers {
        BIGINT id PK "khóa chính do service cấp"
        BIGINT tenant_id "tenant, NOT NULL"
        VARCHAR supplier_code "mã supplier, NOT NULL"
        VARCHAR supplier_name "tên supplier, NOT NULL"
        VARCHAR tax_code "mã số thuế"
        VARCHAR contact_phone "số điện thoại, NOT NULL"
        TEXT address "địa chỉ"
        TEXT province "tỉnh/thành"
        TEXT commune "xã/phường"
        VARCHAR payment_terms "PaymentTerms, NOT NULL"
        VARCHAR preferred_warehouse_code "kho ưu tiên"
        BOOLEAN is_active "đang hoạt động, NOT NULL"
        VARCHAR onboard_source "SupplierOnboardSource, NOT NULL"
        VARCHAR private_phone "số điện thoại riêng"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    user_preferences {
        BIGINT id PK "khóa chính tự tăng"
        VARCHAR user_id "người dùng, NOT NULL"
        BIGINT tenant_id "tenant, NOT NULL"
        VARCHAR subdomain "subdomain"
        VARCHAR preference_key "PreferenceKey, NOT NULL"
        TEXT value "giá trị preference"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    user_cards {
        BIGINT id PK "khóa chính tự tăng"
        VARCHAR user_id "người dùng, NOT NULL"
        VARCHAR card_brand "thương hiệu thẻ, NOT NULL"
        VARCHAR card_masked "số thẻ đã che, NOT NULL"
        VARCHAR token_num "token thẻ, NOT NULL"
        VARCHAR token_exp "hạn token"
        VARCHAR card_uid "UID thẻ"
        BOOLEAN deleted "xóa mềm, NOT NULL"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    payment_orders {
        BIGINT id PK "khóa chính tự tăng"
        VARCHAR purchase_request_code "mã PR"
        VARCHAR payment_method "PaymentMethod, NOT NULL"
        VARCHAR payment_status "PaymentStatus, NOT NULL"
        VARCHAR total_amount "tổng tiền dạng chuỗi"
        VARCHAR currency "Currency, NOT NULL"
        TIMESTAMPTZ payment_time "thời điểm thanh toán"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    payment_balances {
        BIGINT id PK "khóa chính tự tăng"
        BIGINT payment_order_id "tham chiếu payment_orders.id"
        BIGINT purchaser_id "tenant gara"
        BIGINT supplier_id "tenant vendor"
        VARCHAR amount "số tiền dạng chuỗi"
        VARCHAR sale_order_code "mã sale order"
        VARCHAR purchase_order_code "mã PO"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    inbound_messages {
        BIGINT id PK "khóa chính tự tăng"
        VARCHAR message_key "khóa idempotency, NOT NULL"
        VARCHAR message_type "loại message, NOT NULL"
        BIGINT tenant_id "tenant xử lý"
        VARCHAR message_code "mã message"
        JSONB payload "payload tích hợp"
        VARCHAR message_group "nhóm message"
        VARCHAR message_step "bước xử lý"
        BIGINT origin_tenant_id "tenant nguồn"
        VARCHAR status "ProcessingStatus, NOT NULL"
        INTEGER attempt_count "số lần thử, NOT NULL"
        TEXT last_error "lỗi cuối"
        BOOLEAN is_notified "đã notify, NOT NULL"
        TIMESTAMP created_at "thời điểm tạo, NOT NULL"
        TIMESTAMP updated_at "thời điểm cập nhật, NOT NULL"
        TIMESTAMP processed_at "thời điểm xử lý"
    }

    outbound_messages {
        BIGINT id PK "khóa chính tự tăng"
        VARCHAR message_type "loại message, NOT NULL"
        BIGINT tenant_id "tenant xử lý"
        VARCHAR message_code "mã message"
        JSONB payload "payload tích hợp"
        VARCHAR message_group "nhóm message"
        VARCHAR message_step "bước xử lý"
        BIGINT origin_tenant_id "tenant nguồn"
        VARCHAR status "ProcessingStatus, NOT NULL"
        INTEGER attempt_count "số lần thử, NOT NULL"
        TEXT last_error "lỗi cuối"
        BOOLEAN is_notified "đã notify, NOT NULL"
        TIMESTAMP created_at "thời điểm tạo, NOT NULL"
        TIMESTAMP updated_at "thời điểm cập nhật, NOT NULL"
        TIMESTAMP processed_at "thời điểm xử lý"
    }

    ocr_vehicle_info_history {
        BIGINT id PK "khóa chính tự tăng"
        BIGINT quotation_ask_id "quotation ask liên quan"
        BIGINT tenant_id "tenant gara"
        TEXT attachment_url "ảnh đăng ký xe, NOT NULL"
        VARCHAR status_response "trạng thái OCR"
        TEXT json_response "kết quả OCR, NOT NULL"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    quotation_ask_histories {
        BIGINT id PK "khóa chính tự tăng"
        VARCHAR quotation_ask_code "mã quotation ask, NOT NULL"
        BIGINT updated_by_tenant_id "tenant cập nhật"
        VARCHAR updated_role "OwnerType, NOT NULL"
        VARCHAR updated_type "UpdatedType, NOT NULL"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    quotation_ask_history_items {
        BIGINT id PK "khóa chính tự tăng"
        VARCHAR field_name "field thay đổi"
        TEXT old_data "giá trị cũ"
        TEXT new_data "giá trị mới"
        TEXT note "ghi chú"
        BIGINT quotation_ask_history_id FK "tham chiếu quotation_ask_histories.id, NOT NULL"
        VARCHAR created_by "người tạo, NOT NULL"
        TIMESTAMPTZ created_at "thời điểm tạo, NOT NULL"
        VARCHAR updated_by "người cập nhật"
        TIMESTAMPTZ updated_at "thời điểm cập nhật"
    }

    sequences {
        VARCHAR sequence_name PK "tên sequence"
        BIGINT current_value "giá trị hiện tại, NOT NULL"
        INTEGER increment_by "bước tăng, NOT NULL"
        TIMESTAMP created_at "thời điểm tạo, NOT NULL"
        TIMESTAMP updated_at "thời điểm cập nhật, NOT NULL"
    }
```

Các quan hệ trong ERD là quan hệ logic từ JPA mapping, query repository và cột tham chiếu. Migration SQL hiện tại không khai báo FK thủ công; một số FK vật lý có thể do Hibernate tạo khi `ddl-auto=update` xử lý `@JoinColumn`.

## 2. Entities

### `quotation_asks`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính; entity không khai báo `GenerationType`, giá trị do service/sequence cấp. |
| `code` | VARCHAR(50) | NO | Mã yêu cầu báo giá; `unique = true`. |
| `tenant_id` | BIGINT | NO | Tenant gara sở hữu yêu cầu. |
| `tenant_name` | VARCHAR(255) | NO | Tên tenant gara. |
| `tenant_phone_number` | VARCHAR(20) | YES | Số điện thoại tenant. |
| `tenant_ops_area` | VARCHAR(255) | YES | Khu vực vận hành. |
| `tenant_address` | TEXT | YES | Địa chỉ tenant. |
| `tenant_ops_region` | VARCHAR(255) | YES | Vùng vận hành. |
| `ask_note` | TEXT | YES | Ghi chú yêu cầu. |
| `is_invoice_required` | BOOLEAN | NO | Cờ yêu cầu xuất hóa đơn. |
| `invoice_company_name` | VARCHAR(255) | YES | Tên công ty nhận hóa đơn. |
| `tax_code` | VARCHAR(50) | YES | Mã số thuế nhận hóa đơn. |
| `invoice_company_email_address` | VARCHAR(255) | YES | Email nhận hóa đơn. |
| `invoice_company_address` | TEXT | YES | Địa chỉ công ty nhận hóa đơn. |
| `status` | VARCHAR(20) | NO | Enum `QuotationStatus`: `OPEN`, `ASKING`, `BIDDING`, `PRICING`, `ORDER_CONFIRMING`, `CANCELLED`, `CLOSED`. |
| `is_processed` | BOOLEAN | NO | Cờ đã xử lý; default Java là `false`. |
| `processed_at` | TIMESTAMP | YES | Thời điểm xử lý. |
| `is_best_price` | BOOLEAN | NO | Cờ yêu cầu giá tốt nhất; default DB/Java là `false`. |
| `quotation_ref_code` | VARCHAR(255) | YES | Mã báo giá tham chiếu; field không có `@Column`, được map bằng naming strategy. |
| `insurance_code` | VARCHAR(255) | YES | Mã bảo hiểm. |
| `vehicle_id` | BIGINT | NO | `@OneToOne` tới `asked_vehicles.id`. |
| `version` | BIGINT | YES | `@Version` optimistic lock. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; unique/index trên `code`; `idx_quotation_asks_status`, `idx_quotation_asks_is_processed`, `idx_quotation_asks_is_best_price`, `idx_quotation_asks_tenant_id`, `idx_quotation_asks_code`, `idx_quotation_asks_vehicle_id`, `idx_quotation_asks_code_tenant_id`, `idx_quotation_asks_tenant_id_status`, `idx_quotation_asks_tenant_id_status_asking`.
**Constraints**: `NOT NULL` theo bảng trên; unique vật lý trên `code`; enum check `quotation_asks_status_check` bị drop trong `V1.0.7` để application enum mở rộng được.

### `asked_vehicles`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `car_brand` | VARCHAR(255) | NO | Hãng xe. |
| `car_model` | VARCHAR(255) | NO | Dòng xe. |
| `year_of_manufacture` | VARCHAR(255) | YES | Năm sản xuất. |
| `car_type` | VARCHAR(20) | YES | Enum `CarType`: `ELECTRIC_CAR`, `HYBRID_CAR`, `ICE_CAR`. |
| `trims_level` | VARCHAR(255) | YES | Phiên bản xe. |
| `vin` | VARCHAR(255) | YES | Số VIN. |
| `license_plate` | VARCHAR(255) | YES | Biển số xe. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; không thấy index phụ trong annotation hoặc migration SQL.
**Constraints**: `NOT NULL` trên `id`, `car_brand`, `car_model`, `created_by`, `created_at`; enum check `asked_vehicles_car_type_check` bị drop trong `V1.0.7`.

### `asked_spare_parts`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính; entity không khai báo `GenerationType`, giá trị do service/sequence cấp. |
| `code` | VARCHAR(20) | NO | Mã phụ tùng hỏi mua; `unique = true`. |
| `part_name_input` | VARCHAR(255) | NO | Tên phụ tùng nhập vào. |
| `part_name_unit` | VARCHAR(50) | NO | Đơn vị tên phụ tùng. |
| `ref_code` | VARCHAR(255) | YES | Mã tham chiếu. |
| `tenant_id` | BIGINT | NO | Tenant gara. |
| `deleted` | BOOLEAN | NO | Cờ xóa mềm; getter parent lọc bản ghi đã xóa. |
| `quantity` | BIGINT | YES | Số lượng yêu cầu. |
| `genuine_code` | VARCHAR(255) | YES | Mã genuine. |
| `parent_code` | VARCHAR(255) | YES | Mã phụ tùng cha. |
| `quotation_ask_id` | BIGINT | NO | `@ManyToOne` tới `quotation_asks.id`. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; unique/index trên `code`; `idx_asked_spare_parts_quotation_ask_id`, `idx_asked_spare_parts_code`, `idx_asked_spare_parts_tenant_id`, `idx_asked_spare_parts_deleted`, `idx_asked_spare_parts_quotation_ask_tenant`.
**Constraints**: `NOT NULL` theo bảng trên; unique vật lý trên `code`; quan hệ JPA qua `quotation_ask_id`.

### `asked_attachments`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `quotation_ask_id` | BIGINT | NO | `@ManyToOne` tới `quotation_asks.id`. |
| `attachment_url` | TEXT | NO | Đường dẫn file đính kèm. |
| `owner` | VARCHAR(20) | NO | Enum `OwnerType`: `GARAGE`, `VENDOR`, `CSKH`. |
| `note` | TEXT | YES | Ghi chú file. |
| `deleted` | BOOLEAN | NO | Cờ xóa mềm. |
| `ref_code` | VARCHAR(255) | YES | Mã tham chiếu. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; không thấy index phụ trong migration SQL.
**Constraints**: `NOT NULL` theo bảng trên; quan hệ JPA qua `quotation_ask_id`; enum check `asked_attachments_owner_check` bị drop trong `V1.0.7`.

### `quotation_bids`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính; entity không khai báo `GenerationType`, giá trị do service/sequence cấp. |
| `tenant_id` | BIGINT | NO | Tenant vendor báo giá. |
| `tenant_type` | VARCHAR(20) | NO | Enum common `TenantType`: `GARAGE`, `VENDOR`. |
| `quotation_ask_code` | VARCHAR(50) | YES | Tham chiếu logic tới `quotation_asks.code`. |
| `bid_type` | VARCHAR(20) | NO | Enum `BidType`: `BIDDED`, `SOLD_OUT`, `IGNORED`. |
| `status` | VARCHAR(20) | NO | Enum `QuotationBidStatus`: `OPEN`, `PRICED`, `SOLD_OUT`, `CANCELLED`, `CLOSED`. |
| `note` | VARCHAR(255) | YES | Ghi chú báo giá. |
| `version` | BIGINT | YES | `@Version` optimistic lock. |
| `created_by` | VARCHAR(255) | NO | Người tạo; entity khai báo explicit và cũng kế thừa audit column cùng tên. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật; entity khai báo explicit và cũng kế thừa audit column cùng tên. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; `idx_quotation_bids_status`, `idx_quotation_bids_bid_type`, `idx_quotation_bids_tenant_id`, `idx_quotation_bids_quotation_ask_code`, `idx_quotation_bids_quotation_ask_code_tenant_id`.
**Constraints**: `NOT NULL` theo bảng trên; enum checks `quotation_bids_bid_type_check`, `quotation_bids_status_check`, `quotation_bids_tenant_type_check` bị drop trong `V1.0.7`.

### `bidded_spare_parts`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `code` | VARCHAR(255) | YES | Mã phụ tùng được vendor báo giá; `unique = true`. |
| `ref_code` | VARCHAR(255) | NO | Mã tham chiếu. |
| `tenant_id` | BIGINT | YES | Tenant vendor. |
| `part_name_input` | VARCHAR(255) | NO | Tên phụ tùng. |
| `part_name_unit` | VARCHAR(50) | YES | Đơn vị tên phụ tùng. |
| `deleted` | BOOLEAN | NO | Cờ xóa mềm. |
| `quotation_bid_id` | BIGINT | NO | `@ManyToOne` tới `quotation_bids.id`. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; unique/index trên `code`; `idx_bidded_spare_parts_quotation_bid_id`, `idx_bidded_spare_parts_code`, `idx_bidded_spare_parts_tenant_id`, `idx_bidded_spare_parts_deleted`.
**Constraints**: `NOT NULL` theo bảng trên; unique vật lý trên `code`; quan hệ JPA qua `quotation_bid_id`.

### `spare_part_price_line_items`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `spare_part_input_code` | VARCHAR(50) | YES | Mã phụ tùng đầu vào. |
| `segment` | VARCHAR(20) | NO | Enum `Segment`: `TIER1`, `TIER2`, `TIER3`, `TIER4`, `TIER5`. |
| `price` | NUMERIC | YES | Giá báo tổng. |
| `currency` | VARCHAR(10) | YES | Tiền tệ. |
| `note` | VARCHAR(255) | YES | Ghi chú dòng giá. |
| `unit` | VARCHAR(255) | YES | Đơn vị. |
| `picked_to_po` | BOOLEAN | NO | Cờ đã chọn sang PO; Java type là primitive `boolean`. |
| `detail_status` | BOOLEAN | NO | Gara đã hỏi giá chi tiết. |
| `receive_detail_status` | BOOLEAN | NO | Vendor đã phản hồi báo giá chi tiết. |
| `quantity` | INTEGER | YES | Số lượng. |
| `material_price` | NUMERIC | YES | Giá vật tư. |
| `servicing_price` | NUMERIC | YES | Giá công. |
| `deleted` | BOOLEAN | NO | Cờ xóa mềm. |
| `quotation_bid_id` | BIGINT | NO | `@ManyToOne` tới `quotation_bids.id`. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; `idx_spare_part_price_line_items_quotation_bid_id`, `idx_spare_part_price_line_items_spare_part_code`, `idx_spare_part_price_line_items_segment`, `idx_spare_part_price_line_items_deleted`, `idx_spare_part_price_line_items_detail_status`.
**Constraints**: `NOT NULL` theo bảng trên; quan hệ JPA qua `quotation_bid_id`; enum check `spare_part_price_line_items_segment_check` bị drop trong `V1.0.7`.

### `added_spare_part_price_line_items`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `spare_part_input_code` | VARCHAR(50) | YES | Mã phụ tùng được thêm. |
| `segment` | VARCHAR(20) | NO | Enum `Segment`: `TIER1`, `TIER2`, `TIER3`, `TIER4`, `TIER5`. |
| `price` | NUMERIC | YES | Giá báo tổng. |
| `currency` | VARCHAR(10) | YES | Tiền tệ. |
| `note` | VARCHAR(255) | YES | Ghi chú dòng giá. |
| `unit` | VARCHAR(255) | YES | Đơn vị. |
| `picked_to_po` | BOOLEAN | NO | Cờ đã chọn sang PO; Java type là primitive `boolean`. |
| `deleted` | BOOLEAN | NO | Cờ xóa mềm. |
| `detail_status` | BOOLEAN | NO | Gara đã hỏi giá chi tiết. |
| `receive_detail_status` | BOOLEAN | NO | Vendor đã phản hồi báo giá chi tiết. |
| `quantity` | INTEGER | YES | Số lượng. |
| `material_price` | NUMERIC | YES | Giá vật tư. |
| `servicing_price` | NUMERIC | YES | Giá công. |
| `quotation_bid_id` | BIGINT | NO | `@ManyToOne` tới `quotation_bids.id`. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; `idx_added_spare_part_price_line_items_quotation_bid_id`, `idx_added_spare_part_price_line_items_spare_part_code`, `idx_added_spare_part_price_line_items_segment`, `idx_added_spare_part_price_line_items_deleted`, `idx_added_spare_part_price_line_items_detail_status`.
**Constraints**: `NOT NULL` theo bảng trên; quan hệ JPA qua `quotation_bid_id`; enum check `added_spare_part_price_line_items_segment_check` bị drop trong `V1.0.7`.

### `quotation_asks_pricing_request`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `quotation_ask_code` | VARCHAR(50) | NO | Tham chiếu logic tới `quotation_asks.code`. |
| `origin_tenant_id` | BIGINT | NO | Tenant gửi yêu cầu báo giá chi tiết. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; `idx_quotation_asks_pricing_request_quotation_ask_code`, `idx_quotation_asks_pricing_request_origin_tenant_id`.
**Constraints**: `NOT NULL` theo bảng trên; không thấy unique hoặc FK vật lý trong migration SQL.

### `asked_spare_parts_pricing_request`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `code` | VARCHAR(50) | NO | Mã phụ tùng yêu cầu pricing. |
| `part_name_input` | VARCHAR(255) | NO | Tên phụ tùng. |
| `part_name_unit` | VARCHAR(50) | NO | Đơn vị tên phụ tùng. |
| `quantity` | INTEGER | NO | Số lượng. |
| `segment` | VARCHAR(20) | NO | Enum `Segment`: `TIER1`, `TIER2`, `TIER3`, `TIER4`, `TIER5`. |
| `ref_code` | VARCHAR(255) | YES | Mã tham chiếu. |
| `tenant_id` | BIGINT | NO | Tenant vendor nhận yêu cầu. |
| `proposal_status` | BOOLEAN | NO | Đã có proposal từ vendor hay chưa. |
| `quotation_ask_pricing_id` | BIGINT | NO | `@ManyToOne` tới `quotation_asks_pricing_request.id`. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; không thấy index phụ trong migration SQL cho bảng này.
**Constraints**: `NOT NULL` theo bảng trên; quan hệ JPA qua `quotation_ask_pricing_id`; enum check `asked_spare_parts_pricing_request_segment_check` bị drop trong `V1.0.7`.

### `quotation_asks_pricing_proposal`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `quotation_ask_code` | VARCHAR(50) | NO | Tham chiếu logic tới `quotation_asks.code`. |
| `reply_tenant_id` | BIGINT | NO | Tenant vendor phản hồi. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; `idx_quotation_asks_pricing_proposal_quotation_ask_code`, `idx_quotation_asks_pricing_proposal_reply_tenant_id`, `idx_quotation_asks_pricing_proposal_code_tenant`.
**Constraints**: `NOT NULL` theo bảng trên; không thấy unique hoặc FK vật lý trong migration SQL.

### `asked_spare_parts_pricing_proposal`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `spare_part_input_code` | VARCHAR(50) | NO | Mã phụ tùng được pricing. |
| `segment` | VARCHAR(20) | NO | Enum `Segment`: `TIER1`, `TIER2`, `TIER3`, `TIER4`, `TIER5`. |
| `material_price` | NUMERIC | NO | Giá vật tư. |
| `servicing_price` | NUMERIC | NO | Giá công. |
| `currency` | VARCHAR(10) | NO | Tiền tệ. |
| `quantity` | INTEGER | NO | Số lượng. |
| `unit` | VARCHAR(50) | NO | Đơn vị. |
| `ref_code` | VARCHAR(255) | YES | Mã tham chiếu. |
| `note` | TEXT | YES | Ghi chú. |
| `updated_status` | BOOLEAN | NO | Trạng thái vendor cập nhật lại giá. |
| `quotation_ask_pricing_proposal_id` | BIGINT | NO | `@ManyToOne` tới `quotation_asks_pricing_proposal.id`. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; `idx_asked_spare_parts_pricing_proposal_quotation_ask_pricing_proposal_id`, `idx_asked_spare_parts_pricing_proposal_spare_part_code`, `idx_asked_spare_parts_pricing_proposal_segment`.
**Constraints**: `NOT NULL` theo bảng trên; quan hệ JPA qua `quotation_ask_pricing_proposal_id`; enum check `asked_spare_parts_pricing_proposal_segment_check` bị drop trong `V1.0.7`.

### `preliminary_quotations`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `code` | VARCHAR(255) | NO | Mã báo giá sơ bộ; `unique = true`. |
| `quotation_ask_code` | VARCHAR(255) | NO | Tham chiếu logic tới `quotation_asks.code`; `unique = true`. |
| `consultant_id` | BIGINT | NO | Tư vấn viên phụ trách. |
| `consultant_name` | VARCHAR(255) | YES | Tên tư vấn viên. |
| `consultant_phone_number` | VARCHAR(15) | YES | Số điện thoại tư vấn viên. |
| `tenant_id` | BIGINT | NO | Tenant gara. |
| `spare_parts` | JSONB | YES | Danh sách phụ tùng trong báo giá sơ bộ. |
| `total_amount` | NUMERIC(15,2) | YES | Tổng tiền. |
| `note` | TEXT | YES | Ghi chú. |
| `status` | VARCHAR(20) | NO | Enum `PreliminaryQuotationStatus`: `DRAFT`, `SENT`, `UPDATED`. |
| `version` | INTEGER | NO | Phiên bản nghiệp vụ; default Java là `1`. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; unique/index trên `code` và `quotation_ask_code`.
**Constraints**: `NOT NULL` theo bảng trên; unique vật lý trên `code`; unique vật lý trên `quotation_ask_code`.

### `cart`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `product_id` | BIGINT | NO | Tham chiếu logic tới product catalog. |
| `quotation_ask_id` | BIGINT | NO | Tham chiếu logic tới quotation ask. |
| `purchaser_id` | BIGINT | NO | Tenant gara. |
| `supplier_id` | BIGINT | NO | Tenant vendor. |
| `quantity` | INTEGER | NO | Số lượng trong giỏ. |
| `is_picked` | BOOLEAN | NO | Cờ đã chọn để checkout; default Java là `false`. |
| `ref_pr_code` | VARCHAR(255) | YES | Mã purchase request tham chiếu. |
| `deleted` | BOOLEAN | NO | Cờ xóa mềm; default Java là `false`. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; không thấy index phụ trong migration SQL.
**Constraints**: `NOT NULL` theo bảng trên; repository dùng tổ hợp `product_id`, `quotation_ask_id`, `purchaser_id`, `supplier_id`, `deleted` nhưng không thấy unique constraint tương ứng.

### `purchase_request`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính; entity không khai báo `GenerationType`, giá trị do service/sequence cấp. |
| `code` | VARCHAR(50) | NO | Mã purchase request; `unique = true`. |
| `purchaser_id` | BIGINT | NO | Tenant gara. |
| `status` | VARCHAR(255) | YES | Enum `PurchaseRequestStatus`: `OPEN`, `WAIT_FOR_PAYMENT`, `ORDER_CREATED`, `INSUFFICIENT_QUANTITY`, `INSUFFICIENT_PRODUCT`, `CANCELLED`. |
| `note` | TEXT | YES | Ghi chú. |
| `status_transition_data` | JSONB | YES | Danh sách/lịch sử chuyển trạng thái. |
| `payment_method` | VARCHAR(50) | YES | Enum `PaymentMethod`; cột được thêm trước trong `V1.0.8`. |
| `payment_status` | VARCHAR(50) | YES | Enum `PaymentStatus`; cột được thêm trước trong `V1.0.9`. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; unique/index trên `code`; `idx_purchase_request_status`, `idx_purchase_request_payment_status`, `idx_purchase_request_payment_method`, `idx_purchase_request_purchaser_id`, `idx_purchase_request_code`, `idx_purchase_request_code_purchaser_id`.
**Constraints**: `NOT NULL` theo bảng trên; unique vật lý trên `code`; enum check `purchase_request_status_check` bị drop trong `V1.0.7`.

### `purchase_request_data`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `requested_product_name` | VARCHAR(255) | NO | Tên sản phẩm yêu cầu. |
| `quotation_ask_code` | VARCHAR(255) | NO | Mã quotation ask liên quan. |
| `product_id` | BIGINT | NO | Product catalog id. |
| `purchase_request_id` | BIGINT | NO | Tham chiếu logic tới `purchase_request.id`. |
| `purchaser_id` | BIGINT | NO | Tenant gara. |
| `supplier_id` | BIGINT | NO | Tenant vendor. |
| `requested_quantity` | INTEGER | NO | Số lượng yêu cầu. |
| `actual_sales_quantity` | INTEGER | YES | Số lượng vendor xác nhận bán. |
| `detailed_price` | NUMERIC | YES | Giá chi tiết. |
| `material_price` | NUMERIC | YES | Giá vật tư. |
| `servicing_price` | NUMERIC | YES | Giá công. |
| `sales_status` | VARCHAR(20) | NO | Enum `PurchaseRequestDataStatus`: `OPEN`, `CONFIRMED`, `STOCK_CHANGED`, `SOLD_OUT`. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; `idx_purchase_request_data_purchase_request_id`, `idx_purchase_request_data_purchaser_id`, `idx_purchase_request_data_supplier_id`, `idx_purchase_request_data_product_id`, `idx_purchase_request_data_sales_status`, `idx_purchase_request_data_quotation_ask_code`.
**Constraints**: `NOT NULL` theo bảng trên; enum check `purchase_request_data_sales_status_check` bị drop trong `V1.0.7`.

### `purchase_request_confirmations`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `purchase_request_id` | BIGINT | NO | Tham chiếu logic tới `purchase_request.id`. |
| `purchase_request_code` | VARCHAR(255) | NO | Mã purchase request. |
| `status` | VARCHAR(50) | NO | Enum `PurchaseRequestConfirmationStatus`: `PENDING`, `COMPLETE`. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; `idx_purchase_request_confirmations_purchase_request_id`, `idx_purchase_request_confirmations_purchase_request_code`, `idx_purchase_request_confirmations_status`.
**Constraints**: `NOT NULL` theo bảng trên; không thấy unique hoặc FK vật lý trong migration SQL.

### `pr_quotation_ref`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `pr_id` | BIGINT | NO | Tham chiếu logic tới `purchase_request.id`. |
| `quotation_ask_id` | BIGINT | NO | Tham chiếu logic tới `quotation_asks.id`. |

**Indexes**: PK trên `id`; không thấy index phụ trong migration SQL.
**Constraints**: `NOT NULL` theo bảng trên; không thấy unique hoặc FK vật lý trong migration SQL.

### `pr_transition_history`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `pr_id` | BIGINT | NO | Tham chiếu logic tới `purchase_request.id`. |
| `previous_stages` | JSONB | YES | Danh sách trạng thái trước đó. |
| `transition_data` | JSONB | YES | Dữ liệu chuyển trạng thái. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; không thấy index phụ trong migration SQL.
**Constraints**: `NOT NULL` trên `id`, `pr_id`, `created_by`, `created_at`; không thấy unique hoặc FK vật lý trong migration SQL.

### `purchase_orders`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính; entity không khai báo `GenerationType`, repository có native query `nextval('purchase_orders_id_seq')`. |
| `code` | VARCHAR(255) | YES | Mã purchase order; `unique = true`. |
| `source` | VARCHAR(255) | YES | Enum `PurchaseSource`: `QUOTATION_ASK`, `CART`, `CHAT`, `DIRECT`, `ECOMMERCE`; `V1.0.12` drop `NOT NULL`. |
| `transport_order_id` | BIGINT | YES | Id đơn vận chuyển. |
| `purchaser_id` | BIGINT | YES | Tenant gara; `V1.0.12` drop `NOT NULL`. |
| `supplier_id` | BIGINT | YES | Tenant vendor; `V1.0.12` drop `NOT NULL`. |
| `supplier_name` | VARCHAR(255) | YES | Tên supplier. |
| `payment_method` | VARCHAR(255) | YES | Enum `PaymentMethod`: `COD`, `POST_PAID_QR`, `PRE_PAID_QR`, `PRE_PAID_CC`, `BANK_TRANSFER`, `CREDIT`. |
| `is_best_price` | BOOLEAN | YES | Cờ giá tốt nhất. |
| `transport_route_id` | BIGINT | YES | Route vận chuyển. |
| `quotation_ask_code` | TEXT | YES | Mã quotation ask; `V1.0.12` drop `NOT NULL`. |
| `stage` | VARCHAR(20) | YES | Enum `POStage`: `WAIT_TO_CONFIRM`, `OPEN`, `DELIVERING`, `DELIVERED`, `CLOSED`, `COMPLETED`, `CANCELLED`, `RETURNED`; `V1.0.12` drop `NOT NULL`. |
| `status` | VARCHAR(50) | YES | Enum `POStatusEnum`: `WAIT_TO_CONFIRM`, `WAIT_GARAGE_TO_CONFIRM`, `CONFIRMED`, `OPEN`, `STOCKED_IN`, `STOCKED_OUT`, `IN_SHIPPING`, `DELIVERED`, `CLOSED`, `CANCELLED`, `WAIT_TO_CONFIRM_PRICE_PROCESSING`, `WAIT_TO_CONFIRM_PRICE_PENDING`, `WAIT_TO_CONFIRM_PRICE_CONFIRMED`, `RETURNED`, `DELIVERING`, `COMPLETED`; `V1.0.12` drop `NOT NULL`. |
| `note` | VARCHAR(255) | YES | Ghi chú legacy/ecommerce PO. |
| `pr_id` | BIGINT | YES | Tham chiếu logic tới `purchase_request.id`; `V1.0.12` drop `NOT NULL`. |
| `sale_order_code` | VARCHAR(255) | YES | Mã sale order liên quan. |
| `version` | BIGINT | YES | `@Version` optimistic lock. |
| `tenant_id` | BIGINT | YES | Tenant cho direct purchase; thêm trong `V1.0.12`. |
| `direct_supplier_id` | BIGINT | YES | Supplier trực tiếp; thêm trong `V1.0.12`. |
| `priority` | VARCHAR(20) | YES | Độ ưu tiên direct purchase; default migration là `NORMAL`, intended enum `PurchaseOrderPriority`: `NORMAL`, `URGENT`, `CRITICAL`. |
| `related_service_order_code` | VARCHAR(50) | YES | Service order liên quan. |
| `expected_delivery_date` | DATE | YES | Ngày giao dự kiến. |
| `supplier_contact_phone` | VARCHAR(255) | YES | Số điện thoại supplier. |
| `supplier_tax_code` | VARCHAR(255) | YES | Mã số thuế supplier. |
| `supplier_address` | TEXT | YES | Địa chỉ supplier. |
| `notes` | TEXT | YES | Ghi chú direct purchase. |
| `confirmed_by` | VARCHAR(100) | YES | Người xác nhận PO; thêm trong `V1.0.12`. |
| `confirmed_at` | TIMESTAMP | YES | Thời điểm xác nhận; thêm trong `V1.0.12`. |
| `delivering_by` | VARCHAR(255) | YES | Người chuyển sang trạng thái giao hàng; có trong entity. |
| `delivering_at` | TIMESTAMP | YES | Thời điểm chuyển sang trạng thái giao hàng; có trong entity. |
| `delivered_at` | TIMESTAMP | YES | Thời điểm đã giao; thêm trong `V1.0.12`. |
| `completed_by` | VARCHAR(255) | YES | Người hoàn tất PO; có trong entity. |
| `closed_at` | TIMESTAMP | YES | Thời điểm đóng; thêm trong `V1.0.12`. |
| `closed_by` | VARCHAR(255) | YES | Người đóng PO; có trong entity. |
| `cancelled_by` | VARCHAR(100) | YES | Người hủy PO; thêm trong `V1.0.12`. |
| `cancelled_at` | TIMESTAMP | YES | Thời điểm hủy; thêm trong `V1.0.12`. |
| `cancellation_reason` | TEXT | YES | Lý do hủy; thêm trong `V1.0.12`. |
| `returned_by` | VARCHAR(255) | YES | Người trả hàng; có trong entity. |
| `returned_at` | TIMESTAMP | YES | Thời điểm trả hàng; có trong entity. |
| `return_reason` | TEXT | YES | Lý do trả hàng; có trong entity. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; unique/index trên `code`; `idx_purchase_orders_stage`, `idx_purchase_orders_status`, `idx_purchase_orders_purchaser_id`, `idx_purchase_orders_supplier_id`, `idx_purchase_orders_pr_id`, `idx_purchase_orders_code`, `idx_purchase_orders_quotation_ask_code`, `idx_purchase_orders_sale_order_code`, `idx_purchase_orders_transport_order_id`, `idx_purchase_orders_pr_id_purchaser_id`, `idx_purchase_orders_code_purchaser_id`, `idx_purchase_orders_stage_status`, `idx_purchase_orders_purchaser_id_stage_delivering`, `idx_po_tenant`, `idx_po_tenant_status`, `idx_po_direct_supplier`, `idx_po_service_order`, `idx_po_priority`, `idx_po_created_at`, `idx_po_source`, `idx_purchase_orders_purchaser_transport_route` (partial, `V1.0.14`), `idx_purchase_orders_tenant_transport_route` (partial, `V1.0.14`).
**Constraints**: `NOT NULL` trên `id`, `created_by`, `created_at`; unique vật lý trên `code`; `V1.0.12` drop `NOT NULL` cho `source`, `purchaser_id`, `supplier_id`, `stage`, `status`, `pr_id`, `quotation_ask_code`; enum checks `purchase_orders_source_check`, `purchase_orders_stage_check`, `purchase_orders_status_check`, `purchase_orders_payment_method_check` bị drop trong `V1.0.7`.

### `purchase_order_items`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `tenant_id` | BIGINT | NO | Tenant sở hữu dòng hàng. |
| `purchase_order_id` | BIGINT | NO | Tham chiếu logic tới `purchase_orders.id`. |
| `sku` | VARCHAR(100) | NO | SKU sản phẩm. |
| `genuine_code` | VARCHAR(100) | YES | Mã genuine. |
| `product_name` | VARCHAR(255) | NO | Tên sản phẩm. |
| `tier` | VARCHAR(50) | YES | Tier sản phẩm. |
| `origin` | VARCHAR(100) | YES | Xuất xứ. |
| `quantity` | NUMERIC(10,2) | NO | Số lượng. |
| `unit_of_measure` | VARCHAR(20) | NO | Đơn vị tính; default Java là `PCS`. |
| `unit_price` | NUMERIC(15,2) | NO | Đơn giá. |
| `discount_percent` | NUMERIC(5,2) | YES | Phần trăm giảm giá; default Java là `0`. |
| `discount_amount` | NUMERIC(15,2) | YES | Tiền giảm giá; default Java là `0`. |
| `tax_rate` | NUMERIC(5,2) | YES | Thuế suất; default Java là `0`. |
| `tax_amount` | NUMERIC(15,2) | YES | Tiền thuế; default Java là `0`. |
| `line_amount` | NUMERIC(15,2) | NO | Thành tiền trước/tại dòng. |
| `total_amount` | NUMERIC(15,2) | NO | Tổng tiền dòng. |
| `quotation_ask_code` | VARCHAR(255) | YES | Mã quotation ask liên quan. |
| `product_id` | BIGINT | YES | Product catalog id. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; không thấy index phụ trong migration SQL.
**Constraints**: `NOT NULL` theo bảng trên; repository lọc theo `purchase_order_id`, `tenant_id`, `id` nhưng không thấy unique hoặc FK vật lý trong migration SQL.

### `purchase_order_attachments`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `purchase_order_id` | BIGINT | NO | Tham chiếu logic tới `purchase_orders.id`. |
| `attachment_url` | TEXT | NO | Đường dẫn file đính kèm. |
| `file_name` | VARCHAR(255) | YES | Tên file. |
| `file_type` | VARCHAR(10) | YES | Đuôi/loại file. |
| `type` | VARCHAR(20) | NO | Enum `AttachmentType`: `INVOICE`, `OTHER`. |
| `deleted` | BOOLEAN | NO | Cờ xóa mềm. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; không thấy index phụ trong migration SQL.
**Constraints**: `NOT NULL` theo bảng trên; repository lọc theo `purchase_order_id`, `deleted`.

### `po_products`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `po_id` | BIGINT | NO | Tham chiếu logic tới `purchase_orders.id`. |
| `product_id` | BIGINT | NO | Product catalog id. |
| `requested_product_name` | VARCHAR(255) | NO | Tên sản phẩm yêu cầu; default DB là chuỗi rỗng. |
| `quantity` | BIGINT | NO | Số lượng. |
| `unit_price` | NUMERIC | NO | Đơn giá. |
| `unit` | VARCHAR(255) | NO | Đơn vị. |
| `segment` | VARCHAR(10) | NO | Enum `Segment`: `TIER1`, `TIER2`, `TIER3`, `TIER4`, `TIER5`. |
| `supplier_id` | BIGINT | NO | Supplier/vendor. |
| `quotation_ask_code` | VARCHAR(255) | YES | Mã quotation ask. |
| `sku` | VARCHAR(255) | YES | SKU; thêm trong `V1.0.13`. |
| `genuine_code` | VARCHAR(255) | YES | Mã genuine; thêm trong `V1.0.13`. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; `idx_po_products_po_id`, `idx_po_products_product_id`, `idx_po_products_supplier_id`, `idx_po_products_segment`, `idx_po_products_quotation_ask_code`.
**Constraints**: `NOT NULL` theo bảng trên; enum check `po_products_segment_check` bị drop trong `V1.0.7`; không thấy unique hoặc FK vật lý trong migration SQL.

### `po_supplier`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `po_id` | BIGINT | NO | Tham chiếu logic tới `purchase_orders.id`. |
| `supplier_id` | BIGINT | NO | Supplier/vendor. |
| `status` | VARCHAR(50) | NO | Enum `POSupplyStatus`: `SALES_ORDER_CONFIRM`, `STOCK_CHANGED`, `DELIVERY_DATE_CHANGED`, `DECLINED`. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; `idx_po_supplier_po_id`, `idx_po_supplier_supplier_id`, `idx_po_supplier_po_id_supplier_id`.
**Constraints**: `NOT NULL` theo bảng trên; enum check `po_supplier_status_check` bị drop trong `V1.0.7`; không thấy unique hoặc FK vật lý trong migration SQL.

### `po_quotation_ref`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `po_id` | BIGINT | NO | Tham chiếu logic tới `purchase_orders.id`. |
| `quotation_ask_code` | VARCHAR(255) | NO | Mã quotation ask. |

**Indexes**: PK trên `id`; `idx_po_quotation_ref_po_id`.
**Constraints**: `NOT NULL` theo bảng trên; không thấy unique hoặc FK vật lý trong migration SQL.

### `po_transition_history`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `po_id` | BIGINT | NO | Tham chiếu logic tới `purchase_orders.id`. |
| `previous_stages` | JSONB | YES | Danh sách trạng thái trước đó. |
| `transition_data` | JSONB | YES | Dữ liệu chuyển trạng thái. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; không thấy index phụ trong migration SQL.
**Constraints**: `NOT NULL` trên `id`, `po_id`, `created_by`, `created_at`; không thấy unique hoặc FK vật lý trong migration SQL.

### `suppliers`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính; entity không khai báo `GenerationType`, giá trị do service cấp. |
| `tenant_id` | BIGINT | NO | Tenant sở hữu supplier. |
| `supplier_code` | VARCHAR(50) | NO | Mã supplier. |
| `supplier_name` | VARCHAR(200) | NO | Tên supplier. |
| `tax_code` | VARCHAR(50) | YES | Mã số thuế. |
| `contact_phone` | VARCHAR(20) | NO | Số điện thoại liên hệ. |
| `address` | TEXT | YES | Địa chỉ. |
| `province` | TEXT | YES | Tỉnh/thành. |
| `commune` | TEXT | YES | Xã/phường. |
| `payment_terms` | VARCHAR(50) | NO | Enum `PaymentTerms`: `COD`, `NET_7`, `NET_15`, `NET_30`, `NET_60`, `CREDIT`. |
| `preferred_warehouse_code` | VARCHAR(50) | YES | Mã kho ưu tiên. |
| `is_active` | BOOLEAN | NO | Trạng thái hoạt động. |
| `onboard_source` | VARCHAR(20) | NO | Enum `SupplierOnboardSource`: `GARAGE`, `CARDOCTOR`. |
| `private_phone` | VARCHAR(20) | YES | Số điện thoại riêng. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; `idx_supplier_tenant`, `idx_supplier_lookup`, `idx_supplier_code_lookup` khai báo bằng `@Table(indexes = ...)`.
**Constraints**: `NOT NULL` theo bảng trên; repository kiểm tra trùng `contact_phone` theo `tenant_id`, nhưng source không khai báo unique constraint.

### `user_preferences`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `user_id` | VARCHAR(255) | NO | Người dùng. |
| `tenant_id` | BIGINT | NO | Tenant của preference. |
| `subdomain` | VARCHAR(255) | YES | Subdomain tenant. |
| `preference_key` | VARCHAR(255) | NO | Enum `PreferenceKey`: `PAYMENT_METHOD`. |
| `value` | TEXT | YES | Giá trị preference. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; `idx_user_preferences_user_id`, `idx_user_preferences_tenant_id`, `idx_user_preferences_preference_key`, `idx_user_preferences_key_user_tenant`.
**Constraints**: `NOT NULL` theo bảng trên; repository lookup theo `preference_key`, `user_id`, `tenant_id` nhưng không thấy unique constraint tương ứng.

### `user_cards`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `user_id` | VARCHAR(255) | NO | Người dùng sở hữu thẻ. |
| `card_brand` | VARCHAR(255) | NO | Thương hiệu thẻ. |
| `card_masked` | VARCHAR(255) | NO | Số thẻ đã che. |
| `token_num` | VARCHAR(255) | NO | Token thẻ; dữ liệu nhạy cảm, không được log raw. |
| `token_exp` | VARCHAR(255) | YES | Hạn token. |
| `card_uid` | VARCHAR(255) | YES | UID thẻ từ payment gateway. |
| `deleted` | BOOLEAN | NO | Cờ xóa mềm. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; `idx_user_cards_user_id`, `idx_user_cards_deleted`, `idx_user_cards_card_uid`, `idx_user_cards_user_id_deleted`, `idx_user_cards_card_uid_user_id_deleted`.
**Constraints**: `NOT NULL` theo bảng trên; repository lookup theo `card_uid`, `user_id`, `deleted` nhưng không thấy unique constraint tương ứng.

### `payment_orders`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `purchase_request_code` | VARCHAR(255) | YES | Tham chiếu logic tới `purchase_request.code`. |
| `payment_method` | VARCHAR(255) | NO | Enum `PaymentMethod`: `COD`, `POST_PAID_QR`, `PRE_PAID_QR`, `PRE_PAID_CC`, `BANK_TRANSFER`, `CREDIT`. |
| `payment_status` | VARCHAR(255) | NO | Enum `PaymentStatus`: `PENDING`, `PAID`. |
| `total_amount` | VARCHAR(255) | YES | Tổng tiền đang lưu dạng chuỗi. |
| `currency` | VARCHAR(255) | NO | Enum `Currency`: `VND`. |
| `payment_time` | TIMESTAMPTZ | YES | Thời điểm thanh toán. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; không thấy index phụ trong annotation hoặc migration SQL.
**Constraints**: `NOT NULL` theo bảng trên; không thấy unique hoặc FK vật lý trong migration SQL.

### `payment_balances`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `payment_order_id` | BIGINT | YES | Tham chiếu logic tới `payment_orders.id`. |
| `purchaser_id` | BIGINT | YES | Tenant gara. |
| `supplier_id` | BIGINT | YES | Tenant vendor. |
| `amount` | VARCHAR(255) | YES | Số tiền đang lưu dạng chuỗi. |
| `sale_order_code` | VARCHAR(255) | YES | Mã sale order. |
| `purchase_order_code` | VARCHAR(255) | YES | Mã purchase order. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; không thấy index phụ trong annotation hoặc migration SQL.
**Constraints**: `NOT NULL` trên `id`, `created_by`, `created_at`; không thấy unique hoặc FK vật lý trong migration SQL.

### `inbound_messages`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `message_key` | VARCHAR(500) | NO | Khóa idempotency inbound; repository có `findByMessageKey`. |
| `message_type` | VARCHAR(50) | NO | Loại message inbound; `InboundMessageType` hiện không có enum constant. |
| `tenant_id` | BIGINT | YES | Tenant xử lý message. |
| `message_code` | VARCHAR(255) | YES | Mã message nghiệp vụ. |
| `payload` | JSONB | YES | Payload inbound. |
| `message_group` | VARCHAR(50) | YES | Nhóm message. |
| `message_step` | VARCHAR(50) | YES | Bước message. |
| `origin_tenant_id` | BIGINT | YES | Tenant nguồn. |
| `status` | VARCHAR(20) | NO | Enum `ProcessingStatus`: `PENDING`, `COMPLETED`, `FAILED`, `RETRYING`; default Java là `PENDING`. |
| `attempt_count` | INTEGER | NO | Số lần xử lý; default Java là `0`. |
| `last_error` | TEXT | YES | Lỗi cuối cùng. |
| `is_notified` | BOOLEAN | NO | Đã gửi thông báo lỗi hay chưa; default Java là `false`. |
| `created_at` | TIMESTAMP | NO | Thời điểm tạo, khai báo thủ công trong entity. |
| `updated_at` | TIMESTAMP | NO | Thời điểm cập nhật, khai báo thủ công trong entity. |
| `processed_at` | TIMESTAMP | YES | Thời điểm xử lý xong. |

**Indexes**: PK trên `id`; không thấy index phụ trong annotation hoặc migration SQL.
**Constraints**: `NOT NULL` theo bảng trên; không thấy unique constraint trên `message_key`. Native repository chọn bản ghi `PENDING`/`RETRYING` theo `created_at` với `FOR UPDATE SKIP LOCKED`.

### `outbound_messages`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `message_type` | VARCHAR(50) | NO | Loại message outbound; enum nghiệp vụ chính là `OutboundMessageType.PURCHASE_ORDER_STATUS_CHANGED`. |
| `tenant_id` | BIGINT | YES | Tenant xử lý message. |
| `message_code` | VARCHAR(255) | YES | Mã message nghiệp vụ. |
| `payload` | JSONB | YES | Payload outbound. |
| `message_group` | VARCHAR(50) | YES | Nhóm message. |
| `message_step` | VARCHAR(50) | YES | Bước message. |
| `origin_tenant_id` | BIGINT | YES | Tenant nguồn. |
| `status` | VARCHAR(20) | NO | Enum `ProcessingStatus`: `PENDING`, `COMPLETED`, `FAILED`, `RETRYING`. |
| `attempt_count` | INTEGER | NO | Số lần xử lý; default Java là `0`. |
| `last_error` | TEXT | YES | Lỗi cuối cùng. |
| `is_notified` | BOOLEAN | NO | Đã gửi thông báo lỗi hay chưa; default Java là `false`. |
| `created_at` | TIMESTAMP | NO | Thời điểm tạo, khai báo thủ công trong entity. |
| `updated_at` | TIMESTAMP | NO | Thời điểm cập nhật, khai báo thủ công trong entity. |
| `processed_at` | TIMESTAMP | YES | Thời điểm xử lý xong. |

**Indexes**: PK trên `id`; không thấy index phụ trong annotation hoặc migration SQL.
**Constraints**: `NOT NULL` theo bảng trên. Native repository chọn bản ghi `PENDING`/`RETRYING` theo `created_at` với `FOR UPDATE SKIP LOCKED`.

### `ocr_vehicle_info_history`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `quotation_ask_id` | BIGINT | YES | Quotation ask liên quan; field không khai báo `@Column`. |
| `tenant_id` | BIGINT | YES | Tenant gara trong lần OCR. |
| `attachment_url` | TEXT | NO | Ảnh/file đăng ký xe gửi OCR. |
| `status_response` | VARCHAR(255) | YES | Trạng thái phản hồi OCR. |
| `json_response` | TEXT | NO | JSON phản hồi OCR lưu dạng text. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; không thấy index phụ trong annotation hoặc migration SQL.
**Constraints**: `NOT NULL` theo bảng trên; không thấy unique hoặc FK vật lý trong migration SQL.

### `quotation_ask_histories`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `quotation_ask_code` | VARCHAR(50) | NO | Mã quotation ask được thay đổi. |
| `updated_by_tenant_id` | BIGINT | YES | Tenant thực hiện cập nhật. |
| `updated_role` | VARCHAR(20) | NO | Enum `OwnerType`: `GARAGE`, `VENDOR`, `CSKH`. |
| `updated_type` | VARCHAR(20) | NO | Enum `UpdatedType`: `ASKING`, `BIDDING`, `PRICING`. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; `idx_quotation_ask_histories_quotation_ask_code`, `idx_quotation_ask_histories_updated_by_tenant_id`, `idx_quotation_ask_histories_code_tenant_created`, `idx_quotation_ask_histories_code_created`.
**Constraints**: `NOT NULL` theo bảng trên; enum checks `quotation_ask_histories_updated_role_check`, `quotation_ask_histories_updated_type_check` bị drop trong `V1.0.7`.

### `quotation_ask_history_items`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | BIGINT | NO | Khóa chính, sinh tự động bằng `GenerationType.IDENTITY`. |
| `field_name` | VARCHAR(255) | YES | Field được thay đổi. |
| `old_data` | TEXT | YES | Giá trị cũ. |
| `new_data` | TEXT | YES | Giá trị mới. |
| `note` | TEXT | YES | Ghi chú enrich theo tên phụ tùng. |
| `quotation_ask_history_id` | BIGINT | NO | `@ManyToOne` tới `quotation_ask_histories.id`. |
| `created_by` | VARCHAR(255) | NO | Người tạo, kế thừa từ `AuditableEntity`. |
| `created_at` | TIMESTAMPTZ | NO | Thời điểm tạo, kế thừa từ `AuditableEntity`. |
| `updated_by` | VARCHAR(255) | YES | Người cập nhật cuối, kế thừa từ `AuditableEntity`. |
| `updated_at` | TIMESTAMPTZ | YES | Thời điểm cập nhật cuối, kế thừa từ `AuditableEntity`. |

**Indexes**: PK trên `id`; không thấy index phụ trong migration SQL.
**Constraints**: `NOT NULL` trên `id`, `quotation_ask_history_id`, `created_by`, `created_at`; quan hệ JPA qua `quotation_ask_history_id`.

### `sequences`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `sequence_name` | VARCHAR(100) | NO | Khóa chính, tên sequence nghiệp vụ. |
| `current_value` | BIGINT | NO | Giá trị hiện tại, default `0`. |
| `increment_by` | INTEGER | NO | Bước tăng, default `1`. |
| `created_at` | TIMESTAMP | NO | Thời điểm tạo, default `CURRENT_TIMESTAMP`. |
| `updated_at` | TIMESTAMP | NO | Thời điểm cập nhật, default `CURRENT_TIMESTAMP`. |

**Indexes**: PK trên `sequence_name`; `idx_sequences_sequence_name`.
**Constraints**: `PRIMARY KEY (sequence_name)`; `NOT NULL` theo bảng trên. Function hiện hành sau `V1.0.6` là `get_next_number(schemaName VARCHAR(100), sequenceName VARCHAR(100)) RETURNS BIGINT`.

## 3. Data Isolation

Các bảng có `tenant_id` hoặc tenant field trực tiếp gồm `quotation_asks`, `asked_spare_parts`, `quotation_bids`, `bidded_spare_parts`, `quotation_asks_pricing_request.origin_tenant_id`, `asked_spare_parts_pricing_request`, `quotation_asks_pricing_proposal.reply_tenant_id`, `preliminary_quotations`, `cart.purchaser_id/supplier_id`, `purchase_request.purchaser_id`, `purchase_request_data.purchaser_id/supplier_id`, `purchase_orders.purchaser_id/supplier_id/tenant_id/direct_supplier_id`, `purchase_order_items`, `suppliers`, `user_preferences`, `payment_balances.purchaser_id/supplier_id`, `inbound_messages`, `outbound_messages`, `ocr_vehicle_info_history`, và `quotation_ask_histories.updated_by_tenant_id`.

Nhiều child table không có tenant field trực tiếp, ví dụ `asked_attachments`, `quotation_ask_history_items`, `spare_part_price_line_items`, `added_spare_part_price_line_items`, `purchase_request_confirmations`, `pr_quotation_ref`, `pr_transition_history`, `purchase_order_attachments`, `po_products`, `po_supplier`, `po_quotation_ref`, `po_transition_history`, và `payment_orders`. Với các bảng này, cách ly tenant phụ thuộc vào service/repository luôn truy cập qua parent aggregate hoặc qua code/id nghiệp vụ đã được lọc tenant ở bảng cha.

Không thấy tenant filter tự động ở tầng entity/base repository. Vì vậy quy tắc kiến trúc hiện tại là: mọi query theo người dùng phải thêm điều kiện tenant trực tiếp nếu bảng có tenant field, hoặc join/truy vết về parent có tenant nếu bảng con không có tenant field.

## 4. Migration

Flyway được bật với `validate-on-migrate=true`, `baseline-on-migrate=true`, schema `${DB_SCHEMA:dev-gf-purchase}`. Hibernate vẫn để `ddl-auto=update`, nên cấu trúc bảng ban đầu và các cột entity mới có thể được tạo bởi JPA ngoài migration SQL.

Các migration hiện tại:

| Migration | Nội dung dữ liệu/schema |
|---|---|
| `V1.0.0__initialize.sql` | Rỗng; schema ban đầu phụ thuộc JPA `ddl-auto=update`. |
| `V1.0.1__create_sequence_table.sql` | Tạo bảng `sequences`, procedure `get_next_number`, index `idx_sequences_sequence_name`. |
| `V1.0.2__update_sequence_table.sql` | Đổi procedure thành function `get_next_number(schemaName, sequenceName)`. |
| `V1.0.3__extension_unaccent.sql` | Bật extension `unaccent`. |
| `V1.0.4__update_extension_unaccent.sql` | Cập nhật extension `unaccent`. |
| `V1.0.5__create_unaccent_vi.sql` | Tạo function helper `unaccent_vi(input TEXT)`. |
| `V1.0.6__update_sequence_table_v2.sql` | Cập nhật function `get_next_number` để xử lý insert lần đầu bằng `ON CONFLICT DO NOTHING`. |
| `V1.0.7__drop_enum_constraints.sql` | Drop các enum check constraints do Hibernate tạo trước đó. |
| `V1.0.8__update_pr_payment_method.sql` | Thêm `purchase_request.payment_method` và backfill `COD`. |
| `V1.0.9__prevent_check_constraint_payment_status.sql` | Thêm trước `purchase_request.payment_status` để tránh check constraint enum. |
| `V1.0.10__create_indexes.sql` | Tạo index cho purchase, quotation, pricing, user và history. |
| `V1.0.11__dashboard_realtime_indexes.sql` | Tạo index dashboard realtime cho quotation đang `ASKING` và PO đang `DELIVERING`. |
| `V1.0.12__add_direct_purchase_order_support.sql` | Thêm cột direct purchase order, nới nullable một số cột PO và tạo index direct purchase. |
| `V1.0.13__add_sku_genuine_code_to_po_products.sql` | Thêm `sku`, `genuine_code` vào `po_products`. |
| `V1.0.14__add_purchase_orders_transport_route_id_index.sql` | Tạo partial index `idx_purchase_orders_purchaser_transport_route` trên `(purchaser_id, transport_route_id)` WHERE `transport_route_id IS NOT NULL` và `idx_purchase_orders_tenant_transport_route` trên `(tenant_id, transport_route_id)` WHERE `tenant_id IS NOT NULL AND transport_route_id IS NOT NULL`. |

Hệ quả cần lưu ý: enum values nằm ở application enum, không còn được bảo vệ bằng check constraint sau `V1.0.7`; các bảng messaging không có migration index cho luồng `FOR UPDATE SKIP LOCKED`; một số cột direct purchase order có trong entity nhưng không có dòng migration tương ứng và sẽ phụ thuộc vào `ddl-auto=update` nếu chưa tồn tại.

## 5. References

- [gf-purchase-HLD.md](../hld/gf-purchase-HLD.md)
- [gf-purchase-api.md](../api/gf-purchase-api.md)
- [_TEMPLATE-data-model.md](_TEMPLATE-data-model.md)

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial data model cho `gf-purchase`: PostgreSQL schema `${DB_SCHEMA:dev-gf-purchase}` với 36 JPA entity/table bao quát quotation (`quotation_asks`, `asked_vehicles`, `asked_spare_parts`, `quotation_bids`, `bidded_spare_parts`...), pricing (`quotation_asks_pricing_request`, `quotation_asks_pricing_proposal`...), purchase request (`purchase_request`, `pr_quotation_ref`, `pr_transition_history`), purchase order (`purchase_orders`, `purchase_order_items`, `po_products`, `po_supplier`), payment (`payment_orders`, `payment_balances`), `suppliers`, và bảng SQL `sequences`; các enum nghiệp vụ (`QuotationStatus`, `PurchaseRequestStatus`, `PurchaseOrderStatus`, `PaymentStatus`...). Pooled multi-tenant qua `tenant_id`. Migration bằng Flyway (V1.0.0-V1.0.13) với Hibernate `ddl-auto=update`. Bao gồm ERD overview, entities, data isolation, migration, references. |
| 2026-05-19 | v2 | Thêm migration `V1.0.14` (partial indexes trên `purchase_orders` cho `transport_route_id`); thêm precision vào ERD `purchase_order_items` NUMERIC fields cho khớp entity `(10,2)`, `(15,2)`, `(5,2)`; cập nhật indexes cho `purchase_orders` thêm 2 partial index từ `V1.0.14`. |
