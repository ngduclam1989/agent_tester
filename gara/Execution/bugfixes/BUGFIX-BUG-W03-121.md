# BUGFIX-BUG-W03-121: Tách semantic message file rỗng vs vượt 30MB trên `internal_product_attachment`

## Bug

| Thuộc tính | Chi tiết |
|---|---|
| **ID** | BUG-W03-121 |
| **Service** | gf-inventory |
| **Priority** | P3 |
| **Layer** | app.service (`InternalProductService.persistAttachment`) |
| **Affected FEAT** | FEAT-CAT-PROD-DETAIL (V2-18 addAttachment + V2-10 create inline attachments) |
| **Affected BR** | BR-CAT-PROD-015 (30MB cap) — clarification, không đổi ngưỡng |
| **Mô tả** | Gọi `POST /api/v2/internal-products/{id}/attachments` (hoặc `POST /api/v2/internal-products` với `attachments[].fileSizeBytes=0` inline) với `fileSizeBytes=0` hoặc âm → HTTP 400 code `ERR-CMN-004` message "Kích thước tệp vượt 30MB". Ngữ nghĩa sai: file 0 byte KHÔNG vượt 30MB → user hiểu nhầm nguyên nhân reject. |

## Reproduction Steps

1. Auth vào 1 tenant có sẵn 1 internal product `id=P`.
2. Gọi:
   ```
   POST /api/v2/internal-products/{P}/attachments
   {
     "fileName":"empty.pdf",
     "fileType":"application/pdf",
     "fileSizeBytes":0,
     "fileUrl":"https://cdn/empty.pdf"
   }
   ```
3. Expected (theo AC/BR + verify §2.2): HTTP 400 message rõ ràng "Kích thước tệp không hợp lệ (0 byte)" / "File rỗng".
4. Actual (trước fix): HTTP 400 code `ERR-CMN-004` message `"Kích thước tệp vượt 30MB"`.
5. Tương tự với `fileSizeBytes=-100` (âm) và `fileSizeBytes=null`.

## Root Cause

Why-chain:
1. Message hiển thị "vượt 30MB" cho case 0 byte → validation gộp sai bucket.
2. Trace về `InternalProductService.persistAttachment(...)` — 1 branch check gộp cả 3 case: `sizeBytes == null || sizeBytes <= 0 || sizeBytes > maxBytes` cùng throw `ATTACHMENT_LIMIT_EXCEEDED` với 1 message hard-code "Kích thước tệp vượt 30MB".
3. Semantic 2 case khác nhau — (a) "file rỗng/kích thước không hợp lệ" là validation input shape; (b) "vượt cap 30MB" là business rule BR-CAT-PROD-015 — nhưng cùng chia sẻ 1 error code + 1 message trong impl.
4. Gốc: khi BR-CAT-PROD-015 mở rộng cap 10MB → 30MB (v16-17, 2026-06-29), branch `sizeBytes <= 0` được gộp thẳng vào cùng throw để "gọn code" mà không sinh error code / message riêng — quyết định vô tình che luôn semantic "file rỗng".

## Fix

- **Files changed** (service repo `services/gf-inventory/`):
  - `src/main/java/com/actechx/gf/domain/exception/catalog/CatalogErrorCode.java` — thêm hằng số `ATTACHMENT_SIZE_INVALID = "ERR-INV-048"` (boundary-local, phân vùng ERR-INV, additive không đụng T0 doc / registry chung; ERR-INV-047 là mã sau cùng đang dùng nên 048 là mã kế tiếp trong dãy).
  - `src/main/java/com/actechx/gf/app/service/catalog/InternalProductService.java` — trong `persistAttachment(...)` tách branch cũ (`null || <=0 || > maxBytes`) thành **2 branch tuần tự**:
    1. `if (sizeBytes == null || sizeBytes <= 0)` → throw `ATTACHMENT_SIZE_INVALID` message "Kích thước tệp không hợp lệ (file rỗng hoặc 0 byte)".
    2. `if (sizeBytes > maxBytes)` → giữ nguyên throw `ATTACHMENT_LIMIT_EXCEEDED` message "Kích thước tệp vượt 30MB" (backward-compat cho case vượt cap).
- **Schema change**: Không.
- **Workflow change**: Không.
- **API contract**: Không đổi shape request/response; chỉ mở rộng error-code enum trả về (`ERR-INV-048` là code mới cho semantic cũ vốn bị nhóm lẫn). Downstream FE có thể handle `ERR-INV-048` giống `ERR-CMN-004` (inline-field error) — chưa cần cascade FE ngay vì response envelope + HTTP 400 giống nhau; message string giờ chính xác cho user.
- **Logging**: Không đụng prefix alert `[INVENTORY_ALERT*]`.
- **Scope discipline**: Fix chỉ chạm branch validation, KHÔNG refactor `persistAttachment` cấu trúc chung; giữ nguyên MIME whitelist check + cap-5 check.

Sửa dùng chung cho cả 2 gate:

- `POST /api/v2/internal-products/{id}/attachments` (V2-18 `addAttachment` — path bug filed).
- `POST /api/v2/internal-products` (V2-10 `create` — inline attachments qua cùng helper `persistAttachment`, R31 pattern). Cùng 1 điểm fix nên fix R32 cả 2 flow.

## Regression Test

`src/test/java/com/actechx/gf/app/service/catalog/InternalProductServiceTest.java` — thêm 3 test mới trong section `V2-18/19 attachments`:

- `addAttachment_rejectsZeroSizeWithSizeInvalidCode_BUG_W03_121` — assert `errorCode == ATTACHMENT_SIZE_INVALID` + message KHÔNG chứa `"30MB"`.
- `addAttachment_rejectsNegativeSizeWithSizeInvalidCode_BUG_W03_121` — `fileSizeBytes=-100`, cùng assertion.
- `addAttachment_rejectsNullSizeWithSizeInvalidCode_BUG_W03_121` — `fileSizeBytes=null`, assert code = `ATTACHMENT_SIZE_INVALID`.

Trước fix: đều FAIL (throw `ATTACHMENT_LIMIT_EXCEEDED` — code assertion sai). Sau fix: đều PASS.

Case vẫn phải giữ đúng: test `addAttachment_rejectsOversizeAbove30MB` (đã có sẵn, `fileSizeBytes=31MB`) tiếp tục assert `ATTACHMENT_LIMIT_EXCEEDED` — verify path "vượt cap" không bị regression.

## Test Runs

- `./gradlew test --tests "com.actechx.gf.app.service.catalog.InternalProductServiceTest"` — **PASS** (58/58, 0 failures/errors).
- 3 test mới `..._BUG_W03_121` xác nhận trong `build/test-results/test/TEST-...InternalProductServiceTest.xml`.
- `./gradlew build` (full) — FAIL 3 tests trong `MaterialGroupServiceTest` (`create_rejectsDuplicateCode`, `delete_rejectsIfGroupHasProducts`, `delete_rejectsIfGroupHasChildren`). **KHÔNG do fix này** — do 1 parallel fix cycle khác (BUG-W03-106 chuyển `existsByTenantIdAndCode` → `existsByTenantIdAndCodeIgnoreCase`) đang dang dở trong working tree (`MaterialGroupService.java` + `MaterialGroupServiceTest.java` đã bị sửa trước khi task này start). Xác nhận bằng cách stash toàn bộ working tree + chỉ chạy `MaterialGroupServiceTest` → cũng PASS trên baseline `HEAD` sạch. Ngoài scope fix BUG-W03-121; owner cycle BUG-W03-106 phải giải quyết riêng.

## Blast Radius

- Trong 1 boundary (gf-inventory) — không cross-boundary.
- Cùng FEAT-CAT-PROD-DETAIL, cùng 1 helper `persistAttachment` phục vụ V2-10 + V2-18 (đã cover trong regression tests).
- FE downstream (`agg-garage-graph` + `garage-web` + `garage-mobile`) trả `ERR-INV-048` code mới — currently FE fallback message = message BE trả (verbatim) nên hiển thị đúng "Kích thước tệp không hợp lệ (file rỗng hoặc 0 byte)". Nếu FE có mapping code→message local (không phổ biến), có thể cần thêm 1 entry. Không có breaking API/event schema change nên KHÔNG cần escalate cross-boundary.

## Change Log Entry (KG / API doc)

- **KG (`services/gf-inventory/knowledge-graph.yaml`)**: Không thay đổi entity/event/workflow/API-signature — không invariant/BR mới. Chỉ tách error-code semantic cho 1 branch validation hiện có. → **KHÔNG bump KG** (per policy: KG bump khi entities/events/permissions/BR thay đổi).
- **T1 API doc (`Architecture/api/gf-inventory-api.md`)**: Không edit trong scope FIX (không phải OWNED_PATH, không thay đổi request/response body shape). Follow-up (out-of-scope): Architecture Authority thêm `ERR-INV-048` vào bảng error-code cho V2-18/V2-10 khi rà soát chung với các mã ERR-INV-04x khác đã đăng ký.

## Verdict

- Bug status: `OPEN` → `FIX_DONE`.
- Ngày fix: 2026-07-03.
- Owner FIX: `agent-fix-gf-inventory`.
- Verify pending: QC re-run TC-W03-API-PROD-014 + verify §4.2 test matrix (0, -100, 31MB, 1MB).
