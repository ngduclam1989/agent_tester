# BUGFIX-BUG-W03-170: Server-side defense-in-depth guard chặn ĐVT quy đổi trùng ĐVT chính

## Bug

| Thuộc tính | Chi tiết |
|---|---|
| **ID** | BUG-W03-170 |
| **Service** | gf-inventory |
| **Priority** | P2 |
| **Layer** | app.service (`InternalProductService` — private helper `addConversionUnit`, dùng chung bởi 3 call-site: V2-15 direct add, V2-10 create inline, V2-11 update bulk-sync insert phase) |
| **Affected FEAT** | FEAT-CAT-PROD-DETAIL (V2-15 `POST /api/v2/internal-products/{id}/conversion-units`) |
| **Affected BR** | BR-CAT-PROD-011 (ĐVT quy đổi: rate > 0, scale ≤6, không trùng ĐVT — invariant "không trùng" đã document rõ trong Product layer là bao gồm cả ĐVT chính, xem Root Cause §3) |
| **Split from** | `BUG-W03-165` (FE phần đã RESOLVED — DetailPage callsite `mainUnitCode` prop). BE co-suspect ban đầu gán nhầm `gf-erp-mdm` (ngoài scope W03, chỉ sở hữu UNIT/COUNTRY directory lookup), đã correct sang `gf-inventory` (entity `internal_product_conversion_unit` sở hữu bởi service này) 2026-07-06 bởi `agent-test-api`. |
| **Mô tả** | Gọi `POST /api/v2/internal-products/{id}/conversion-units` với `unitCode` trùng `internal_product.main_unit_code` của chính sản phẩm đó (vd `{unitCode:"Cặp", conversionRate:1}` khi `mainUnitCode="Cặp"`) → server CHẤP NHẬN + persist thành công. Dữ liệu vô nghĩa nghiệp vụ (ĐVT quy đổi trùng ĐVT chính, tỷ lệ 1:1 không phải quy đổi thật). CONFIRMED trên SIT 2026-07-03 (Manual QC), sản phẩm `id=6`. |

## Reproduction Steps

1. Auth vào 1 tenant có sẵn 1 internal product `id=P` với `mainUnitCode = "Cặp"`.
2. Gọi:
   ```
   POST /api/v2/internal-products/{P}/conversion-units
   { "unitCode": "Cặp", "conversionRate": 1 }
   ```
3. Expected (theo `verify/BUG-W03-170.verify.md` §2.2): server từ chối request, trả lỗi rõ ràng, KHÔNG persist.
4. Actual (trước fix): HTTP 201 — server tạo thành công 1 row `internal_product_conversion_unit` với `unit_code = main_unit_code`, `conversion_rate = 1`.

## Root Cause

Why-chain:
1. Endpoint V2-15 chấp nhận + persist ĐVT quy đổi trùng ĐVT chính → thiếu 1 nhánh validation cụ thể trong code.
2. Trace vào `InternalProductService.addConversionUnit(InternalProductEntity product, ConversionUnitRequest request, Set<String> seenUnits)` (private helper dùng chung cho mọi đường insert conversion-unit) — helper này validate `conversionRate > 0` (`ERR-INV-013`), scale ≤6 (`ERR-INV-047`), và unique `unitCode` per product (`ERR-INV-014`) — nhưng phần "unique per product" chỉ query `conversionUnitRepository.existsByTenantIdAndInternalProductIdAndUnitCode(...)`, tức chỉ so sánh với **các row khác đã tồn tại trong bảng con** `internal_product_conversion_unit`. Code **không hề so sánh** `request.getUnitCode()` với `product.getMainUnitCode()` (cột ở bảng cha `internal_product`).
3. **Quan trọng — đây KHÔNG phải thiếu 1 business rule mới**: đối chiếu Product layer (`Product/features/FEAT-ID-CREATE-V2.md`, `Product/business-rules/BR-GF-INVENTORY-RECEIPT-V2.md`, và đặc biệt `Tracking/WAVE03/verify/BUG-W03-134.verify.md` §2.2 — bug FE cùng invariant, đã ghi rõ "BR-CAT-PROD-011/ERR-INV-014: 'ĐVT quy đổi bị trùng trong cùng mã sản phẩm' (**phạm vi bao gồm cả ĐVT chính**)") xác nhận: rule "không trùng ĐVT" (`ERR-INV-014` `CONVERSION_UNIT_DUPLICATE`, message canonical "ĐVT quy đổi bị trùng trong cùng mã sản phẩm" per `Product/error-code/ERROR-CODE-REGISTRY.md`#112) **từ đầu đã được thiết kế để bao gồm cả so sánh với ĐVT chính**, không phải chỉ so sánh giữa các row quy đổi với nhau. Code implementation chỉ hiện thực hoá 1 nửa scope của rule này (row-vs-row) mà bỏ sót nửa kia (row-vs-main-unit).
4. Gốc: `existsByTenantIdAndInternalProductIdAndUnitCode(...)` query trực tiếp vào bảng `internal_product_conversion_unit` — tự nhiên không thể "thấy" cột `main_unit_code` nằm ở bảng cha `internal_product` trừ khi code chủ động so sánh thêm. Gap này lộ ra document tường minh nhất ở BUG-W03-134 (FE sibling, cùng ngày phát hiện, khác layer/entry-point) — cả FE dropdown và BE guard đều thiếu nhánh so sánh với `mainUnitCode`.

> **Correction note (2026-07-06, cùng phiên fix)**: Fix ban đầu của agent tạo **mã lỗi mới** `ERR-INV-050 CONVERSION_UNIT_EQUALS_MAIN_UNIT`, dựa trên giả định (sai) rằng scope của `ERR-INV-014` chỉ giới hạn ở row-vs-row. User chỉ ra message "ĐVT quy đổi không được trùng ĐVT chính" khả năng đã tồn tại — grep xác nhận đúng: `ERR-INV-014` đã được Product layer document với scope tường minh bao gồm cả ĐVT chính (xem §3 ở trên). Đã **revert `ERR-INV-050`** và sửa guard để **reuse `CONVERSION_UNIT_DUPLICATE` (`ERR-INV-014`)** thay vì tạo mã mới — tránh 2 mã lỗi khác nhau cho cùng 1 business rule (sẽ gây nhầm lẫn cho FE/BFF khi handle error code).

## Fix

- **Files changed** (service repo `services/gf-inventory/`):
  - `src/main/java/com/actechx/gf/domain/exception/catalog/CatalogErrorCode.java` — **KHÔNG thêm hằng số mới**. Chỉ thêm comment trên `CONVERSION_UNIT_DUPLICATE = "ERR-INV-014"` ghi rõ scope của mã này bao gồm cả trùng `main_unit_code` (tránh lặp lại nhầm lẫn ở lần fix sau).
  - `src/main/java/com/actechx/gf/app/service/catalog/InternalProductService.java` — thêm guard đầu tiên trong private helper `addConversionUnit(InternalProductEntity product, ConversionUnitRequest request, Set<String> seenUnits)` (trước mọi validation khác):
    ```java
    if (request.getUnitCode() != null && request.getUnitCode().equals(product.getMainUnitCode())) {
      throw new CatalogException(
          CatalogErrorCode.CONVERSION_UNIT_DUPLICATE,
          "ĐVT quy đổi bị trùng trong cùng mã sản phẩm (trùng ĐVT chính): "
              + request.getUnitCode());
    }
    ```
    Vì đây là helper **dùng chung** bởi 3 call-site, fix tự động cover cả 3:
    1. V2-15 `addConversionUnit(Long id, ConversionUnitRequest request)` — direct add (endpoint gốc của bug).
    2. V2-10 `create(...)` — `initialConversionUnits[]` tại lúc tạo mới sản phẩm.
    3. V2-11 `update(...)` → `reconcileConversionUnits(...)` insert phase (R39 bulk-sync diff-by-id) — item không có `id` → insert qua cùng helper.
- **Không cần sửa** `updateConversionUnit` (V2-16 PUT) hoặc `reconcileConversionUnits` update branch — `unitCode` là **immutable** trên update (BR-CAT-PROD-011), nên 1 row hợp lệ (đã qua guard lúc insert) không thể bị đổi `unitCode` thành `mainUnitCode` sau đó; chỉ đường insert cần guard.
- **Schema change**: Không. Không đụng migration, không đụng entity.
- **Workflow change**: Không.
- **API contract**: Additive validation — request hợp lệ trước đây (unitCode khác mainUnitCode) tiếp tục hoạt động bình thường không đổi. Chỉ request sai (unitCode == mainUnitCode) trước đây trả 201 nay trả 400 với `ERR-INV-014` (mã đã có sẵn, đã được FE hiểu + hiển thị từ trước qua case row-vs-row — nay chỉ mở rộng thêm 1 nhánh điều kiện trigger cùng mã, không cần FE/BFF thay đổi gì để nhận diện mã lỗi mới).
- **Logging**: Không đụng prefix alert `[INVENTORY_ALERT*]`.
- **Scope discipline**: Fix chỉ ADD guard, KHÔNG refactor logic hiện có, KHÔNG đổi API/event signature, KHÔNG chạm boundary khác, KHÔNG tạo error code mới (đã có sẵn).

## Regression Test

`src/test/java/com/actechx/gf/app/service/catalog/InternalProductServiceTest.java` — thêm 4 test mới:

1. `addConversionUnit_rejectsUnitCodeEqualsMainUnitCode_BUG_W03_170` — verify.md reproducer (unitCode="Cặp" == mainUnitCode="Cặp") → throw `CONVERSION_UNIT_DUPLICATE` (`ERR-INV-014`), `save()` never called. Cover trực tiếp V2-15.
2. `addConversionUnit_acceptsUnitCodeDifferentFromMainUnitCode_BUG_W03_170` — happy-path guard rail: unitCode khác mainUnitCode vẫn `save()` thành công — đảm bảo fix không reject case hợp lệ.
3. `create_rejectsInitialConversionUnitEqualsMainUnitCode_BUG_W03_170` — cover V2-10 `create()` với `initialConversionUnits[]` chứa unitCode trùng mainUnitCode gửi cùng request tạo mới.
4. `update_syncsConversionUnits_rejectsUnitCodeEqualsMainUnitCode_BUG_W03_170` — cover V2-11 `update()` bulk-sync insert phase (item không `id` trong `initialConversionUnits[]`, trùng mainUnitCode).

Kết quả: `InternalProductServiceTest` 68/68 PASS (64 cũ + 4 mới). `./gradlew build` PASS (spotlessCheck + compile + full test suite).

## Blast Radius

- **Impacted paths**: V2-15 (add, endpoint gốc của bug), V2-10 (create inline `initialConversionUnits[]`), V2-11 (R39 bulk-sync `initialConversionUnits[]` insert phase). V2-16 (update) và V2-17 (delete) không chạm insert nên không impact — `unitCode` immutable trên update.
- **API contract**: Additive — client cũ gửi `unitCode` hợp lệ (khác `mainUnitCode`) không bị impact. Client gửi `unitCode == mainUnitCode` (trước đây silently accepted) nay nhận `400 ERR-INV-014` — **mã đã tồn tại từ trước** (row-vs-row duplicate case), FE/BFF không cần thay đổi gì để nhận diện/hiển thị mã này cho case mới.
- **Downstream**: BFF `agg-garage-graph` mutation `addConversionUnit` / `createInternalProduct` / `updateInternalProduct` tiếp tục propagate `ERR-INV-014` như đã làm cho case row-vs-row — không có thay đổi contract nào ở tầng BFF/FE.
- **KHÔNG cascade contract doc T0/T1** — không tạo error code mới, không cần đăng ký gì thêm ở Product `ERROR-CODE-REGISTRY.md` (đã có sẵn `ERR-INV-014` với scope đúng).
- **Data cleanup SIT** (out of code-fix scope — không có admin/cleanup endpoint trong service): sản phẩm `id=6` trên môi trường SIT có 1 row `internal_product_conversion_unit` rác (`unit_code = main_unit_code = "Cặp"`, `conversion_rate = 1`) tạo trước khi fix. Đề xuất DevOps/DBA chạy:
  ```sql
  DELETE FROM internal_product_conversion_unit
  WHERE internal_product_id = 6
    AND unit_code = (SELECT main_unit_code FROM internal_product WHERE id = 6);
  ```
  sau khi xác nhận `tenant_id` + review dữ liệu thực tế trên SIT (không chạy tự động qua code fix này).

## Verification

| Field | Value |
|---|---|
| Regression test PASS trước fix | `assertThatThrownBy(...).isInstanceOf(CatalogException.class)` sẽ FAIL — trước fix, `addConversionUnit()` helper không có guard nên `conversionUnitRepository.save(...)` được gọi thành công (mock trả về argument), không throw exception nào. Verified locally via revert-then-run pattern (cùng phương pháp với BUG-W03-120). |
| Regression test PASS sau fix | 4/4 test mới PASS. |
| Full test suite | `InternalProductServiceTest` 68/68 PASS (64 cũ + 4 mới, 0 regression). |
| Full build | `./gradlew build` PASS (spotlessApply/Check + compile + toàn bộ test suite). |

## Related

- **Cùng error code, khác entry-point**: `ERR-INV-014 CONVERSION_UNIT_DUPLICATE` trước fix này chỉ cover row-vs-row duplicate; sau fix cover thêm row-vs-main-unit — cả 2 nhánh cùng 1 mã lỗi theo đúng scope đã document ở Product layer.
- Sibling error codes cùng namespace boundary-local additive (KHÔNG liên quan trực tiếp tới bug này, chỉ cùng pattern "app-layer guard trước DB constraint"): `ERR-INV-047 CONVERSION_RATE_PRECISION_EXCEEDED`, `ERR-INV-048 ATTACHMENT_SIZE_INVALID` (BUG-W03-121), `ERR-INV-049 CONVERSION_RATE_OVERFLOW` (BUG-W03-120).
- Cluster liên quan (cùng chức năng "Thêm ĐVT quy đổi", khác layer/entry-point): `BUG-W03-165` (FE — DetailPage entry, RESOLVED), `BUG-W03-164` (message sai khi trùng ĐVT chính ở FE Edit form, P3, RESOLVED), `BUG-W03-134` (FE — dropdown không disable ĐVT chính ở modal Create/Edit, cùng invariant `ERR-INV-014`, tracked riêng cho `agent-fix-garage-web`).
- L2 verify: `Tracking/WAVE03/verify/BUG-W03-170.verify.md` (repro + root-cause guidance), `Tracking/WAVE03/verify/BUG-W03-134.verify.md` (nguồn xác nhận scope `ERR-INV-014`).

## Change Log

| Ngày | Người | Ghi chú |
|---|---|---|
| 2026-07-06 | agent-fix-gf-inventory | Fix + doc. |
| 2026-07-06 | agent-fix-gf-inventory | Correction (cùng phiên, trước khi handoff): revert error code mới `ERR-INV-050`, đổi sang reuse `ERR-INV-014 CONVERSION_UNIT_DUPLICATE` theo scope đã document ở Product layer — user phát hiện message trùng lặp. |
