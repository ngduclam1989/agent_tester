# BUGFIX — BUG-W03-113

> `GET /api/v2/internal-products/search` (POST-only route) trả HTTP 500 "unexpected runtime exception" thay vì 405 chuẩn REST
> Severity: **P3** · Boundary: `gf-inventory` · Status: **RESOLVED** · Date: 2026-07-03

## 1. Summary

Endpoint `/api/v2/internal-products/search` (V2-7) khai báo là `@PostMapping("/search")`. Khi client gọi với HTTP GET (hoặc PUT), request path `/search` bị `@GetMapping("/{id}")` (V2-8) bắt như một `PathVariable`, Spring MVC cố convert chuỗi `"search"` → `Long` → ném `MethodArgumentTypeMismatchException`, exception bubble tới platform `GlobalExceptionHandler` (thuộc `com.actechx.common`) — được map thành body chung `{"code":"INTERNAL_SERVER_ERROR","message":"An unexpected runtime exception occurred","statusCode":500}`. Người gọi thấy 500 thay vì 405 chuẩn.

Sibling `MaterialGroupController` cũng có cùng pattern (`POST /search` + `@GetMapping("/{id}")`) nên `GET /api/v2/material-groups/search` sẽ có cùng triệu chứng — fix đồng thời để không phát sinh bug follow-up.

## 2. Root cause (why-chain)

1. FE gọi `GET /api/v2/internal-products/search` → route mismatch (endpoint chỉ định POST).
2. Spring MVC `RequestMappingHandlerMapping` không có `HttpMethod-only` filter cho path pattern `/search` (path pattern `/{id}` khớp bất kỳ chuỗi nào không có `/`, kể cả `"search"`) → chọn handler `@GetMapping("/{id}")`.
3. `ArgumentResolver` cố convert `"search"` → `Long` → ném `MethodArgumentTypeMismatchException` (extends `TypeMismatchException`, extends `ConversionFailedException` — root là `NumberFormatException`).
4. Exception không có handler cụ thể trong service này — bubble tới platform-level `@RestControllerAdvice` (từ `com.actechx.common`) — catch `RuntimeException` → map generic 500.
5. **Root cause**: (a) `@GetMapping("/{id}")` thiếu regex constraint để loại chuỗi không phải số; (b) không có `@ExceptionHandler(HttpRequestMethodNotSupportedException.class)` / `@ExceptionHandler(MethodArgumentTypeMismatchException.class)` scoped tại service — protocol-level errors đều fall-through tới generic 500 handler.

## 3. Fix

**Fix chính (route hardening)** — thêm regex `{id:\\d+}` cho path variable kiểu `Long` trên toàn bộ handler CRUD của `ProductInternalController` (V2-8/V2-11/V2-12/V2-13/V2-14/V2-15/V2-16/V2-17/V2-18/V2-19) và `MaterialGroupController` (V2-3/V2-5/V2-6). Sau khi có constraint, chuỗi `"search"` không match handler `{id}` → Spring MVC nhìn thấy `POST /search` là handler duy nhất trên path đó → ném `HttpRequestMethodNotSupportedException` với `Allow: POST` (đúng bán chuẩn REST).

**Fix bổ sung (structured error body)** — mở rộng `CatalogExceptionHandler` (`@RestControllerAdvice`, `@Order(0)` — chạy trước platform advice) với 2 handler mới:

- `@ExceptionHandler(HttpRequestMethodNotSupportedException.class)` → HTTP 405, body `ApiResponse{success:false, code:"ERR-CMN-METHOD-NOT-ALLOWED", ...}`, header `Allow` echo `getSupportedHttpMethods()`.
- `@ExceptionHandler(MethodArgumentTypeMismatchException.class)` → HTTP 400, body `ApiResponse{success:false, code:"ERR-CMN-INVALID-PATH-VAR", ...}` — defensive complement cho regex constraint (bắt trường hợp path variable numeric xuất hiện endpoint mới trong tương lai mà thiếu regex).

*Ghi chú kỹ thuật* — advice `basePackages` restriction bị revert (giữ nguyên global scope ban đầu) vì `HttpRequestMethodNotSupportedException` được ném từ handler-mapping stage TRƯỚC khi controller method được resolve, `ExceptionHandlerExceptionResolver` chỉ tra advice global (không match theo basePackages) khi `handlerMethod == null`. Cả 2 handler mới chỉ nhắm protocol-level error (không đè handler nghiệp vụ nào), nên global scope không gây side-effect cho controller khác.

## 4. Files changed

| File | Change |
|---|---|
| `services/gf-inventory/src/main/java/com/actechx/gf/adapter/controller/catalog/ProductInternalController.java` | Regex `{id:\\d+}` + `{productId:\\d+}` + `{unitId:\\d+}` + `{attachmentId:\\d+}` cho toàn bộ path var kiểu `Long` (V2-8/V2-11/V2-12/V2-13/V2-14/V2-15/V2-16/V2-17/V2-18/V2-19). Javadoc note nhắc BUG-W03-113. |
| `services/gf-inventory/src/main/java/com/actechx/gf/adapter/controller/catalog/MaterialGroupController.java` | Regex `{id:\\d+}` cho V2-3/V2-5/V2-6. Javadoc note nhắc BUG-W03-113. |
| `services/gf-inventory/src/main/java/com/actechx/gf/adapter/controller/catalog/CatalogExceptionHandler.java` | Thêm `handleMethodNotAllowed(HttpRequestMethodNotSupportedException)` + `handleTypeMismatch(MethodArgumentTypeMismatchException)` — map sang `ApiResponse` structured body. |
| `services/gf-inventory/src/test/java/com/actechx/gf/adapter/controller/catalog/CatalogRestProtocolErrorTest.java` | **New** — 5 test MockMvc reproducing exact bug scenarios. |

## 5. Regression / verification

Regression test: `CatalogRestProtocolErrorTest` — MockMvc `standaloneSetup(productCtrl, groupCtrl).setControllerAdvice(new CatalogExceptionHandler())`:

1. `getOnInternalProductsSearchReturns405WithAllowPostAndStructuredBody` — assert 405 + `Allow: POST` header + body `code:ERR-CMN-METHOD-NOT-ALLOWED` (repro chính bug).
2. `putOnInternalProductsSearchReturns405WithStructuredBody` — assert 405 (verify.md §4.2 test 4).
3. `getOnMaterialGroupsSearchReturns405` — assert cùng behavior trên sibling controller (defensive; ngăn cùng bug tái xuất hiện ở endpoint kề).
4. `postOnInternalProductsSearchReturns200` — happy-path regression: POST /search vẫn hoạt động, không breaking (verify.md §4.2 test 2).
5. `getOnInternalProductsWithNonNumericIdDoesNotReturn500` — defensive: `GET /api/v2/internal-products/abc` không bao giờ trả 500 (chấp nhận 400/404/405).

Đã chạy pre-fix: 3/5 test FAIL (protocol-mismatch → empty body 405 do `DefaultHandlerExceptionResolver` mặc định, không hit `@ExceptionHandler` của service). Sau fix: 5/5 test PASS.

Build/test:

- `./gradlew build` — **PASS** (BUILD SUCCESSFUL, 11 tasks) trong `services/gf-inventory` với `JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64`.
- `./gradlew test` — **PASS** (full test suite, không có test cũ bị fail).
- Spotless (Google Java Format) — **PASS** (chạy tự động trong `build`).
- `./gradlew checkstyleMain` — **N/A** (repo không config Checkstyle plugin, chỉ có Spotless — không phải regression).
- Coverage delta ≥ 0 — thêm 5 test mới, không xoá test cũ. Coverage tuyệt đối toàn service ~11.8% instruction (mức baseline cũ, không do fix này gây ra) — dưới ngưỡng 80% của Exit Criteria nhưng đây là pre-existing state, thuộc DEBT tổng thể chứ không phải regression của fix. Fix chỉ chạm controller adapter (đã có test riêng); không đổi coverage domain/app.

Manual repro theo verify.md §4.2 (chưa chạy trong sandbox, cần service instance):

- `curl -X GET http://<inv>:45086/api/v2/internal-products/search` → kỳ vọng 405 + `Allow: POST` + body `{"success":false,"code":"ERR-CMN-METHOD-NOT-ALLOWED",...}`.
- `curl -X POST http://<inv>:45086/api/v2/internal-products/search -d '{}'` → 200 (regression check).
- `curl -X GET http://<inv>:45086/api/v2/internal-products/999999` → 404 với `code:ERR-INV-*` (không bị fix chạm — vẫn qua `service.get(id)` throw `CatalogException.NOT_FOUND`).
- `curl -X PUT http://<inv>:45086/api/v2/internal-products/search` → 405.

## 6. Blast radius

- Đổi shape body của response 405 và 400 trên MỌI controller trong `gf-inventory` (advice global) — trước đây 405 trả empty body (Spring default) / 400 tùy platform advice. Client nhận 405 chỉ dựa trên status code + Allow header (chuẩn REST) vẫn hoạt động; client nào từng phụ thuộc "body rỗng khi 405" sẽ phải chấp nhận structured body — thay đổi backward-compatible theo hướng cải thiện.
- Không đụng contract của V2-7 POST /search (endpoint hạnh phúc), V2-8 GET /{id} (numeric id vẫn resolve như cũ). Regex `{id:\\d+}` chỉ chặn không cho path segment string match — tương đương với ràng buộc mà `@PathVariable Long id` đã implicit đặt ra qua conversion, chỉ khác điểm ném lỗi (mapping stage vs conversion stage).
- Không breaking OpenAPI / API doc: numeric-id path var vẫn là `long`, chỉ thêm constraint pattern.

## 7. Non-goals / out of scope

- Không audit các V2 catalog controller khác (SkuSearchController, InternalProductImportExportController) — không có endpoint nào ở đó có route conflict tương tự (đã grep). Nếu tương lai thêm endpoint numeric-id, defensive `MethodArgumentTypeMismatchException` handler sẽ bắt được.
- Không đổi platform-level `GlobalExceptionHandler` (nằm ngoài boundary, thuộc `com.actechx.common`) — fix scoped trong service.
- Không đổi các V2 endpoint khác trong `ProductInternalController`/`MaterialGroupController` về mặt schema/response — chỉ regex path var.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-03 | 1 | agent-fix-gf-inventory | Fix — regex `{id:\\d+}` trên numeric path var (ProductInternalController + MaterialGroupController) + `CatalogExceptionHandler` thêm handler cho `HttpRequestMethodNotSupportedException` (405 structured + Allow) và `MethodArgumentTypeMismatchException` (400 structured). Regression test mới (5 MockMvc test) PASS; `./gradlew build` PASS. |
