---
title: Figma VN Layer Name → English Identifier Glossary
owner: Delivery Authority + SA
status: ACTIVE
version: 1
last_reviewed: 2026-06-22
---

# Figma VN → Identifier glossary

> **Single source-of-truth** cho mọi pipeline (`/prefetch-figma` → `/gen-ep-feat`
> → `/gen-execution-spec` → `/spawn-dev`). Khi Figma layer hoặc business term
> dùng Vietnamese (full/romanized), identifier (file/class/route slug) **PHẢI**
> lookup ở đây.
>
> **Rule**: ban Vietnamese trong identifier ở mọi tier (Figma transform output,
> FEAT spec widget breakdown, checklist scope path, router URL slug, DEV code).
> Vietnamese OK trong: UI literal string (sẽ qua `LocaleKeys.*.tr()`), comment,
> business term trong description. KHÔNG OK trong: file path, class name,
> variable, function, route slug.

---

## 1. Insurance settlement / dossier domain (W02)

| VN (Figma layer / business term) | Identifier (PascalCase) | snake_case file | URL slug |
|---|---|---|---|
| Phiếu quyết toán | `SettlementSheet` | `settlement_sheet` | `settlement-sheet` |
| Phiếu báo giá | `QuotationSheet` | `quotation_sheet` | `quotation-sheet` |
| Biên bản nghiệm thu | `AcceptanceRecord` | `acceptance_record` | `acceptance-record` |
| Giấy ủy quyền (nhận tiền bồi thường) | `PaymentAuthorization` | `payment_authorization` | `payment-authorization` |
| Hồ sơ bảo hiểm | `InsuranceDossier` | `insurance_dossier` | `insurance-dossier` |
| Phân bổ bảo hiểm | `InsuranceAllocation` | `insurance_allocation` | `insurance-allocation` |
| Bảng chi phí | `CostTable` | `cost_table` | `cost-table` |
| Chứng từ & hóa đơn | `DocumentInvoice` | `document_invoice` | `document-invoice` |
| Lịch sử thanh toán | `PaymentHistory` | `payment_history` | `payment-history` |

## 2. Service order / quotation domain (W01)

| VN (Figma / business term) | Identifier | snake_case | URL slug |
|---|---|---|---|
| Đơn dịch vụ | `ServiceOrder` | `service_order` | `service-order` |
| Báo giá | `Quotation` | `quotation` | `quotation` |
| Lịch hẹn | `Booking` | `booking` | `booking` |
| Phiếu tiếp nhận | `ReceptionVoucher` | `reception_voucher` | `reception-voucher` |
| Quyết toán | `Settlement` | `settlement` | `settlement` |
| Phiếu thu | `Receipt` | `receipt` | `receipt` |
| Phiếu chi | `PaymentVoucher` | `payment_voucher` | `payment-voucher` |
| Hợp đồng | `Contract` | `contract` | `contract` |
| Hóa đơn | `Invoice` | `invoice` | `invoice` |
| Đề nghị thanh toán | `PaymentRequest` | `payment_request` | `payment-request` |

## 3. Inventory / procurement domain

| VN | Identifier | snake_case | URL slug |
|---|---|---|---|
| Phiếu nhập kho | `GoodsReceipt` | `goods_receipt` | `goods-receipt` |
| Phiếu xuất kho | `GoodsDelivery` | `goods_delivery` | `goods-delivery` |
| Kiểm kê | `StockCount` | `stock_count` | `stock-count` |
| Yêu cầu mua | `PurchaseRequest` | `purchase_request` | `purchase-request` |
| Đơn đặt mua | `PurchaseOrder` | `purchase_order` | `purchase-order` |
| Nhà cung cấp | `Supplier` | `supplier` | `supplier` |
| Tồn kho | `StockBalance` | `stock_balance` | `stock-balance` |

## 4. Customer / marketing domain

| VN | Identifier | snake_case | URL slug |
|---|---|---|---|
| Khách hàng | `Customer` | `customer` | `customer` |
| Phương tiện / Xe | `Vehicle` | `vehicle` | `vehicle` |
| Chiến dịch | `Campaign` | `campaign` | `campaign` |
| Voucher | `Voucher` | `voucher` | `voucher` |
| Phân loại khách | `CustomerSegment` | `customer_segment` | `customer-segment` |

## 5. Generic VN tokens — BAN trong identifier

Identifier (file/class/route/variable) **KHÔNG được chứa** các token sau (case-insensitive):

```
phieu, bao_gia, bao-gia, baoGia, BaoGia,
quyet_toan, quyetToan, QuyetToan,
bien_ban, bien-ban, bienBan, BienBan,
giay, giay_uy_quyen, giayUyQuyen, GiayUyQuyen,
uy_quyen, uyQuyen, UyQuyen,
nghiem_thu, nghiemThu, NghiemThu,
hop_dong, hopDong, HopDong,
hoa_don, hoaDon, HoaDon,
lap, ten (khi standalone — không phải prefix "tenant"),
de_nghi, deNghi, DeNghi,
khach_hang, khachHang, KhachHang,
nha_cung_cap, nhaCungCap, NhaCungCap,
bh, kh, BH, KH (viết tắt bảo hiểm/khách hàng — dùng "insurance"/"customer")
```

## 6. Lookup protocol

**Khi Figma layer name có VN romanization** (vd `Row/PhieuQuyetToan`):

1. Lookup glossary table §1-§4 cho exact match.
2. Found → emit `[identifier: SettlementSheet]` alongside Figma node name (dual annotation).
3. Not found → STOP, raise question to Business Authority: "VN term `<X>` chưa có mapping
   English — đề xuất identifier `<Y>`. Confirm?" — KHÔNG self-translate, KHÔNG đoán.
4. Sau BA confirm → append entry vào glossary (bump version + Change Log) → tiếp tục.

**Khi FEAT spec / checklist author** ghi widget/class name:
- Source identifier từ glossary, KHÔNG copy verbatim VN từ Figma layer name.
- Self-check pre-emit: grep regex `(Phieu|BaoGia|QuyetToan|BienBan|GiayUyQuyen|HopDong|HoaDon|NghiemThu|UyQuyen|DeNghi|KhachHang|NhaCungCap)` trong identifier → reject.

**Khi DEV agent** code:
- Checklist `scope:` path là contract — DEV phải dùng đúng path.
- Nếu scope path chứa VN romanization → STOP, raise gap (lý do: checklist sai upstream),
  KHÔNG tự rename trong code (sẽ mismatch checklist).

## 7. Cascade rules

- Glossary là **T1 Policy artifact** (tier-1 cascade per `DOC-DEPENDENCY-MAP.md`).
- Update glossary → cascade re-emit cho: tất cả `Product/ux/figma-{web,mobile}/wave*-*.md`
  + FEAT spec đang ACTIVE + checklist W{N} đang DRAFT/ACTIVE.
- Wave đã ship (W01, W02 trở về trước): KHÔNG retro rename — flag DEBT-NAMING-VN-{wave}
  nếu muốn refactor sau.
- W02 evidence: 4 file rename post-DEV (`dossier_phieu_quyet_toan_screen.dart` →
  `dossier_settlement_sheet_screen.dart`, etc) — 3730 LoC user rework, không tính qua
  glossary nên không enforce kịp.

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-22 | 1 | Delivery Authority + SA | Initial glossary — extract từ W02 evidence (4 file rename post-DEV). 5 domain × ~40 entries. Generic ban list 22 token. Lookup + cascade protocol. T1 Policy tier. |
