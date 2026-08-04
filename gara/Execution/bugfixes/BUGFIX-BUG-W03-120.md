# BUGFIX-BUG-W03-120: App-layer integer-part overflow guard cho `conversion_rate` NUMERIC(18,6)

## Bug

| Thuộc tính | Chi tiết |
|---|---|
| **ID** | BUG-W03-120 |
| **Service** | gf-inventory |
| **Priority** | P3 |
| **Layer** | app.service (`InternalProductService` — 3 site: addConversionUnit, updateConversionUnit, reconcileConversionUnits) + adapter.validation (helper) |
| **Affected FEAT** | FEAT-CAT-PROD-DETAIL (V2-15/V2-16), FEAT-CAT-PROD-CREATE (V2-10 inline), FEAT-CAT-PROD-EDIT (V2-11 bulk sync) |
| **Affected BR** | BR-CAT-PROD-011 (conversion rate constraints) — additive: hoàn thiện envelope guard đối xứng với precision-scale guard đã có ở `ERR-INV-047` |
| **Mô tả** | Gọi `POST /api/v2/internal-products/{id}/conversion-units` (hoặc bất kỳ path nào ghi `conversion_rate`) với `conversionRate=99999999999999` (14 chữ số phần nguyên) → HTTP 500 `code=INTERNAL_SERVER_ERROR` `message=An unexpected runtime exception occurred`. Backend crash lúc JPA save vì `NUMERIC(18,6)` chỉ chứa được integer part ≤ 12 chữ số. |

## Reproduction Steps

1. Auth vào 1 tenant có sẵn 1 internal product `id=P`.
2. Gọi 1 trong các endpoint sau (mọi endpoint đều bug):
   ```
   POST /api/v2/internal-products/{P}/conversion-units
   { "unitCode":"BOX", "conversionRate":99999999999999 }
   ```
   hoặc `PUT /api/v2/internal-products/{P}/conversion-units/{unitId}` `{ "conversionRate":99999999999999 }`
   hoặc `POST /api/v2/internal-products` với `initialConversionUnits[{unitCode:"BOX", conversionRate:99999999999999}]`
   hoặc `PUT /api/v2/internal-products/{P}` (V2-11 R39) với `initialConversionUnits[{id, unitCode, conversionRate:99999999999999}]`.
3. Expected (verify §2.2): HTTP 400 với validation error rõ ràng.
4. Actual (trước fix): HTTP 500 (JPA `DataIntegrityViolationException: numeric field overflow` bubbled up thành generic `INTERNAL_SERVER_ERROR`).

## Root Cause

Why-chain:
1. Message trả HTTP 500 thay vì 400 rõ ràng → validation không được kick trước khi chạm DB.
2. Trace về DTO `ConversionUnitRequest.conversionRate`: chỉ có `@NotNull`, không có annotation range/precision. Existing service-layer guard `ConversionRatePrecisionValidator.exceeds(rate, 6)` (ERR-INV-047) chỉ check **scale** (phần thập phân), KHÔNG check **integer part**.
3. Trace tiếp: `InternalProductConversionUnitEntity.conversionRate` map sang cột PostgreSQL `NUMERIC(18,6)` — envelope 18 chữ số total, 6 chữ số fraction → phần nguyên tối đa 12 chữ số. Client gửi 14 chữ số vượt envelope.
4. Trace tiếp: JPA save ném `DataIntegrityViolationException` (PostgreSQL `numeric field overflow`). Không có `@ControllerAdvice` handler nào map `DataIntegrityViolationException` thành 400 với ERR-INV code → rơi vào generic 500 handler.
5. Gốc: khi R29 (BA 2026-06-26) cascade BR-CAT-PROD-011 v15 chỉ document precision-scale guard (`ERR-INV-047` — silent-round scale), KHÔNG document integer-part guard đối xứng vì "PostgreSQL raises overflow, giả định handler tự map". Thực tế handler map thành 500. Envelope integer bị bỏ ngỏ, chỉ chờ khách hàng test overflow là lộ.

## Fix

- **Files changed** (service repo `services/gf-inventory/`):
  - `src/main/java/com/actechx/gf/domain/exception/catalog/CatalogErrorCode.java` — thêm hằng số `CONVERSION_RATE_OVERFLOW = "ERR-INV-049"` (boundary-local, additive không đụng T0 doc / registry chung; ERR-INV-048 là mã sau cùng đang dùng, xem BUG-W03-121, nên 049 là mã kế tiếp).
  - `src/main/java/com/actechx/gf/adapter/validation/ConversionRatePrecisionValidator.java` — thêm helper mới `public static boolean overflowsIntegerPart(BigDecimal value, int maxIntegerDigits)` — trả `true` nếu `|value| >= 10^maxIntegerDigits`. Null-safe. Đối xứng với helper `exceeds(...)` đã có cho scale.
  - `src/main/java/com/actechx/gf/app/service/catalog/InternalProductService.java` — thêm block guard sau mỗi precision (scale) check hiện có, tại 3 site:
    1. `addConversionUnit(product, request, seenUnits)` — private helper dùng chung cho V2-15 direct add + V2-10 create inline. Guard sau scale check, trước duplicate-unit check.
    2. `updateConversionUnit(id, unitId, request)` — V2-16 direct update.
    3. `reconcileConversionUnits(...)` update branch — V2-11 bulk sync (R39 diff-by-id). Insert branch đã reuse `addConversionUnit` nên tự động cover.
  Cả 3 block đều throw `CatalogException(CONVERSION_RATE_OVERFLOW, "Tỷ lệ quy đổi vượt giới hạn (phần nguyên tối đa 12 chữ số)")` khi `overflowsIntegerPart(rate, 12) == true` (12 = 18 - 6 = envelope integer digits).
- **Schema change**: Không. NUMERIC(18,6) đã đúng từ v10 R8 D-E — chỉ guard app-layer trước save.
- **Workflow change**: Không.
- **API contract**: Không đổi shape request/response; chỉ mở rộng error-code enum trả về (`ERR-INV-049` là code mới cho semantic overflow chưa được cover). Downstream FE có thể handle giống `ERR-INV-047` (inline-field error) — cùng envelope + HTTP 400 + display INLINE_FIELD.
- **Logging**: Không đụng prefix alert `[INVENTORY_ALERT*]`.
- **Scope discipline**: Fix chỉ ADD guard, KHÔNG refactor existing validation, KHÔNG đổi `@Digits`/`@DecimalMax` annotation trên DTO (giữ pattern service-layer guard consistent với existing precision check).

## Regression Test

`src/test/java/com/actechx/gf/app/service/catalog/InternalProductServiceTest.java` — thêm 5 test mới:

1. `addConversionUnit_rejects14DigitOverflow_withOverflowCode_BUG_W03_120` — verify.md reproducer (14-digit 99999999999999) → throw `CONVERSION_RATE_OVERFLOW`, `save()` never called.
2. `addConversionUnit_rejects13DigitOverflow_withOverflowCode_BUG_W03_120` — boundary 13-digit (9999999999999) vẫn overflow.
3. `addConversionUnit_acceptsMaxBoundary_BUG_W03_120` — max hợp lệ `999999999999.999999` (12 int + 6 frac = full NUMERIC(18,6) envelope) → save PASS.
4. `updateConversionUnit_rejects14DigitOverflow_withOverflowCode_BUG_W03_120` — cover V2-16 update path.
5. `update_syncsConversionUnits_rejectsOverflowOnUpdatePath_BUG_W03_120` — cover V2-11 R39 bulk sync update path.

`src/test/java/com/actechx/gf/app/service/catalog/ConversionRatePrecisionValidatorTest.java` — thêm 6 unit test cho helper mới:

- `overflowsIntegerPart_returnsFalse_forNull`
- `overflowsIntegerPart_returnsFalse_withinLimit` — `999999999999.999999` (12 digit max hợp lệ).
- `overflowsIntegerPart_returnsTrue_at13Digits`
- `overflowsIntegerPart_returnsTrue_atExact10Pow` — `10^12` = 13-digit boundary.
- `overflowsIntegerPart_handlesNegativeValues` — `|value|` semantic.
- `overflowsIntegerPart_returnsFalse_forSmallDecimal` — `0.000001`.

Kết quả: `InternalProductServiceTest` 64/64 PASS (58 cũ + 5 mới + 1 chạy sẵn khác), `ConversionRatePrecisionValidatorTest` 12/12 PASS (6 cũ + 6 mới). `./gradlew build` PASS.

## Blast Radius

- **Impacted paths**: V2-10 (create inline `initialConversionUnits[]`), V2-11 (R39 bulk sync `initialConversionUnits[]` — cover cả update path và insert path), V2-15 (add), V2-16 (update). V2-17 (delete) không chạm `conversion_rate` write nên không impact.
- **API contract**: Additive — client cũ đang gửi rate hợp lệ (≤ 12-digit integer + ≤ 6-digit fraction) không bị impact. Client gửi overflow trước đây nhận 500 → nay nhận 400 với `ERR-INV-049`.
- **Downstream**: BFF `agg-garage-graph` mutations `createInternalProduct` / `updateInternalProduct` / `addConversionUnit` / `updateConversionUnit` sẽ propagate `ERR-INV-049` như một mã inline-field error khác — không cần schema change GraphQL SDL (Graph error extension đã pass-through code + message). FE hiển thị message tiếng Việt có sẵn từ BE.
- **KHÔNG cascade contract doc T0/T1** trong lần fix này: mã ERR-INV-049 là boundary-local (namespace `ERR-INV-` cho gf-inventory), thêm additive vào `CatalogErrorCode` enum. Registry T3 `Product/error-code/ERROR-CODE-REGISTRY.md` follow-up nếu BA muốn document canonical (tương tự hình thái BUG-W03-121 với `ERR-INV-048`).

## Verification

| Field | Value |
|---|---|
| Regression test PASS trước fix | `assertThatThrownBy` sẽ fail (JPA save nhận rate 14-digit → không throw CatalogException, thay vào đó là DataIntegrityViolationException khi @DataJpaTest hoặc runtime — trong unit test hiện tại với mock repo, việc save không throw sẽ khiến `assertThatThrownBy(...).isInstanceOf(CatalogException.class)` FAIL). Verified locally via revert-then-run. |
| Regression test PASS sau fix | 5/5 InternalProductServiceTest new + 6/6 ConversionRatePrecisionValidatorTest new. |
| Full test suite | `./gradlew test` — 64/64 InternalProductServiceTest, 12/12 ConversionRatePrecisionValidatorTest, cả build suite PASS. |
| Full build | `./gradlew build` PASS (compile + spotless + test). |

## Related

- Sibling error code: `ERR-INV-047 CONVERSION_RATE_PRECISION_EXCEEDED` (scale > 6) — cùng envelope guard hình thái đối xứng.
- Sibling BUGFIX: BUG-W03-121 (ATTACHMENT_SIZE_INVALID / ERR-INV-048) — cùng cluster "app-layer guard trước DB constraint bubble-up as 500".

## Change Log

| Ngày | Người | Ghi chú |
|---|---|---|
| 2026-07-03 | agent-fix-gf-inventory | Fix + doc. |
