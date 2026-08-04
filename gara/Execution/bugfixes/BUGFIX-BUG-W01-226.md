# BUGFIX BUG-W01-226 — Analysis-only (Rule #19) → Bug status updated to INVALID

> **Bug L1 status (per `Tracking/WAVE01/BUGS.md` 2026-06-11)**: `INVALID` (sai oracle / not-a-defect — closed by triage after this analysis was authored).
> **Status from FIX agent**: Analysis preserved for audit + future reference if status changes.
> **Authored by**: design-repo subagent (agent-fix-agg-garage-graph spawned from `garage-agentic-design`).
> **Rule #19 compliance**: design repo NO-CODE — patch ghi unified-diff. Hiện không cần apply vì bug status = INVALID.

> NOTE: Phân tích why-chain + đề xuất sanitization layer ở `formatGraphQLError` + ApiClient vẫn có giá trị
> như defense-in-depth nếu chính sách info-disclosure thay đổi. Giữ doc làm reference; KHÔNG apply ở W01.

---

## 1. Failure mode (observed)

| Field | Value |
|---|---|
| Bug | BUG-W01-226 (P2, OPEN) |
| Symptom | GraphQL error response cho mutation `createInsuranceSettlement(id: 101)` cross-tenant (token tenant_id=1, SO id=101 thuộc tenant_id=2): `ErrorResponse.message = "External service 'gf-sales' failed during '/protected/v1/service-orders/1/101/for-settlement': ..."` — lộ internal S2S path + downstream error body |
| Category | P2 info disclosure (KHÔNG data breach — isolation vẫn block) |
| Reporter | `agent-test-isolation` (TC-W01-ISO-014) |

## 2. Root-cause Why-chain (≥3 levels)

### Why #1 — Tại sao client thấy internal S2S path `/protected/v1/service-orders/...`?

Path đó là gf-accounting → gf-sales S2S call. BFF `createInsuranceSettlement` resolver chỉ gọi gf-accounting (line 308-313 trong `settlements.resolver.ts`); path `/protected/v1/...` không phải BFF call mà là gf-accounting internal call sang gf-sales. Nghĩa là **gf-accounting** đã include path đó trong error response body khi nó fail (gf-sales reject 400 NOT_FOUND vì TenantFilter block).

### Why #2 — Tại sao path đó propagate lên BFF response?

`bffs/agg-garage-graph/src/utils/apiClient.ts:264-310` (`createAxiosErrorResponse`) extract backend error response **as-is**:

```ts
return {
  ...
  message: this.extractStringField(backendError, "message") || message,
  // serverResponse: this.extractObjectField(backendError, "data"),  // backend body propagated as `serverResponse`
  ...
};
```

`extractStringField(backendError, "message")` lấy nguyên xi field `message` từ gf-accounting response body. Nếu gf-accounting trả `{message: "External service 'gf-sales' failed during '/protected/v1/...'", ...}`, BFF wrap không filter.

### Why #3 — Tại sao gf-accounting expose path trong error message?

Đây là **gf-accounting** behavior — `DownstreamServiceException` của gf-accounting (Java Spring) construct message bằng `String.format("External service '%s' failed during '%s': %s", service, path, error.body)`. Pattern này áp dụng cho **mọi** S2S call fail trong gf-accounting (cross-FEAT impact per BUG-W01-226 verify §8a.1).

### Why #4 — Vùng nào trong BFF có thể mask/transform?

Có **3 chỗ** trong BFF có thể mask/transform downstream error message:

1. **`apiClient.ts:264-310` `createAxiosErrorResponse`** — central chỗ extract. Filter ở đây ảnh hưởng MỌI resolver (cross-FEAT coverage).
2. **`graphqlErrorHandler.ts` (`formatGraphQLError`)** — Apollo `formatError` hook. Cho `API_ERROR` code, hiện chỉ preserve nguyên: `message: formattedError.message`. Filter ở đây cũng cross-FEAT.
3. **Resolver-level `handlers.createInsuranceSettlement`** (line 300-314) — catch + map riêng cho mutation này. Scope hẹp, chỉ fix BUG-W01-226.

BR-AGG-GARAGE-GRAPH-005 (error handling) yêu cầu mask internal paths. Best practice: fix ở **layer 2 (Apollo formatError)** — cross-FEAT coverage, không cần modify mỗi resolver, không nuốt structured field `serverResponse` (đã ở `extensions`).

### Why #5 — Tại sao cách fix theo bug-report (resolver-level catch) không tối ưu?

Bug-report Notes đề xuất: *"BFF `createInsuranceSettlement` resolver phải catch `DownstreamServiceException` và map sang generic error message"*. Cách này:
- Chỉ fix `createInsuranceSettlement` — pattern tương tự sẽ leak ở **mọi** mutation/query khác gọi gf-accounting với S2S downstream. Per verify §8a.1: "Potentially cross-FEAT nếu các BFF resolver khác (vd `getServiceOrderByCode`, `updateServiceOrderV3`) cũng propagate downstream error detail raw."
- Pattern lặp lại trong N resolver — anti-DRY.

→ **Đúng pattern**: fix ở `formatGraphQLError` (cross-FEAT) + ApiClient layer (defensive).

## 3. Blast radius

| Surface | Affected |
|---|---|
| All GraphQL mutations/queries through `formatGraphQLError` | YES (cross-FEAT) — message filter ảnh hưởng MỌI operation có error |
| `ErrorResponse.message` GraphQL union field | YES — semantics đổi (mask path, không giữ raw downstream body) |
| `ErrorResponse.serverResponse` (raw body) | YES — cần đảm bảo serverResponse cũng được sanitized HOẶC gỡ khỏi response (current: `extractObjectField(backendError, "data")` giữ raw `data` field; nếu downstream encode path trong `data.path` — vẫn leak; cần audit) |
| Client error parsing | Theo BR-AGG-GARAGE-GRAPH-005, client expect `code: "API_ERROR"`. Message thay đổi nội dung — backward compat OK vì client không depend chuỗi exact |

## 4. Files to change

- `bffs/agg-garage-graph/src/config/errors/handlers.ts` (line 31-41 — `formatGraphQLError` API_ERROR branch: mask path patterns)
- `bffs/agg-garage-graph/src/utils/apiClient.ts` (line 287-300 — `createAxiosErrorResponse`: sanitize message before constructing ErrorResponse; preserve raw body in `details.original_message` for non-production only)
- `bffs/agg-garage-graph/src/utils/constants.ts` (NEW constant: `INTERNAL_PATH_PATTERNS` regex list)
- New regression: `bffs/agg-garage-graph/src/config/errors/handlers.regression.ts`

## 5. Proposed patch — unified diff

### 5.1 Add constants

```diff
--- a/bffs/agg-garage-graph/src/utils/constants.ts
+++ b/bffs/agg-garage-graph/src/utils/constants.ts
@@ -1,3 +1,20 @@
+/**
+ * BR-AGG-GARAGE-GRAPH-005 / BUG-W01-226 — internal architecture path patterns
+ * stripped from client-facing error messages to prevent info disclosure (P2).
+ * Patterns target gf-accounting `DownstreamServiceException` format
+ * `External service 'X' failed during 'Y': Z`.
+ */
+export const INTERNAL_PATH_PATTERNS: RegExp[] = [
+  // Hide internal REST paths
+  /\/protected\/v\d+\/[\w\-\/{}]+/g,
+  /\/api\/v\d+\/[\w\-\/{}]+/g,
+  // Hide service identifiers
+  /External service '[\w\-]+' failed during '[^']+':\s*/g,
+  // Hide host/port info
+  /https?:\/\/[\w\-.]+(:\d+)?/g,
+];
+
+export const GENERIC_DOWNSTREAM_FAILURE_MESSAGE = "Lỗi từ dịch vụ phụ thuộc. Vui lòng thử lại sau.";
+
 // ... existing constants
```

### 5.2 Sanitize message in formatGraphQLError

```diff
--- a/bffs/agg-garage-graph/src/config/errors/handlers.ts
+++ b/bffs/agg-garage-graph/src/config/errors/handlers.ts
@@ -1,9 +1,32 @@
 // ==========================================
 // GRAPHQL ERROR FORMATTERS
 // ==========================================

 import { GraphQLFormattedError } from "graphql";
 import { createDefaultErrorResponse } from "./factory";
 import { logger } from "../logger";
+import {
+  INTERNAL_PATH_PATTERNS,
+  GENERIC_DOWNSTREAM_FAILURE_MESSAGE,
+} from "../../utils/constants";
+
+/**
+ * BR-AGG-GARAGE-GRAPH-005 — strip internal architecture paths/host/service names
+ * from error messages exposed to clients (BUG-W01-226 P2 info disclosure).
+ *
+ * Behavior:
+ *   - If message contains any internal-path pattern, replace fully with generic
+ *     `GENERIC_DOWNSTREAM_FAILURE_MESSAGE`.
+ *   - Otherwise, return message as-is.
+ *
+ * Pure function — no I/O. Centralizes the sanitization policy across all
+ * resolvers (cross-FEAT coverage per BUG-W01-226 verify §8a.1).
+ */
+export function sanitizeErrorMessage(raw?: string | null): string {
+  if (!raw) return GENERIC_DOWNSTREAM_FAILURE_MESSAGE;
+  for (const pattern of INTERNAL_PATH_PATTERNS) {
+    if (pattern.test(raw)) return GENERIC_DOWNSTREAM_FAILURE_MESSAGE;
+  }
+  return raw;
+}

 /**
  * Formats GraphQL errors for client response
  * - Preserves API errors from backend
  * - Converts other errors to standardized format
@@ -25,15 +48,19 @@ export function formatGraphQLError(

   const errorCode = formattedError.extensions?.code as string | undefined;

   // Handle API errors - preserve backend error details and status
   if (errorCode === "API_ERROR") {
+    const safeMessage = sanitizeErrorMessage(formattedError.message);
     return {
-      message: formattedError.message,
+      message: safeMessage,
       locations: formattedError.locations,
       path: formattedError.path,
       extensions: {
         ...formattedError.extensions,
         code: "API_ERROR",
+        // Preserve original message for ops/debugging via observability (logger above),
+        // never on the wire. statusCode kept for client routing logic.
       } as Record<string, unknown>,
     };
   }
```

### 5.3 Defense in depth — also sanitize in ApiClient

```diff
--- a/bffs/agg-garage-graph/src/utils/apiClient.ts
+++ b/bffs/agg-garage-graph/src/utils/apiClient.ts
@@ -1,6 +1,7 @@
 import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
 import { ErrorResponse } from "../graphql/common/base.type";
 import { ApiClientError } from "./apiClientError";
+import { sanitizeErrorMessage } from "../config/errors/handlers";
 import { API_CLIENT, ERROR_CODES, HEADER_KEYS } from "./constants";
@@ -283,20 +284,22 @@ export class ApiClient {

     // Try to extract backend error response
     if (response?.data && typeof response.data === "object") {
       const backendError = response.data as Record<string, unknown>;

+      const rawMessage =
+        this.extractStringField(backendError, "message") || message;
       return {
         id: this.extractStringField(backendError, "id"),
-        serverResponse: this.extractObjectField(backendError, "data"),
+        // BR-AGG-GARAGE-GRAPH-005 / BUG-W01-226: omit raw backend `data` field
+        // (may contain internal path/host details).
+        serverResponse: undefined,
         code:
           this.extractStringField(backendError, "code") ||
           ERROR_CODES.API_ERROR,
-        message: this.extractStringField(backendError, "message") || message,
+        message: sanitizeErrorMessage(rawMessage),
         statusCode: response.status,
-        path: config?.url,
+        // path omitted — leaks BFF endpoint structure to client.
         timestamp:
           this.extractStringField(backendError, "timestamp") ||
           new Date().toISOString(),
-        details: this.extractObjectField(backendError, "details"),
+        details: undefined,
       };
     }
```

## 6. Regression test design

```diff
--- /dev/null
+++ b/bffs/agg-garage-graph/src/config/errors/handlers.regression.ts
@@ -0,0 +1,80 @@
+// ==========================================
+// REGRESSION CHECK — formatGraphQLError + sanitizeErrorMessage (BUG-W01-226)
+// ==========================================
+// Self-contained ts-node script. Run: `npm run test:error-handlers`.
+// Exits non-zero on any failure.
+
+import { sanitizeErrorMessage, formatGraphQLError } from "./handlers";
+import { GENERIC_DOWNSTREAM_FAILURE_MESSAGE } from "../../utils/constants";
+
+let failures = 0;
+function assert(cond: boolean, msg: string) {
+  if (!cond) { failures++; console.error(`  ✗ ${msg}`); }
+  else console.log(`  ✓ ${msg}`);
+}
+
+console.log("BUG-W01-226 — sanitizeErrorMessage strips internal architecture leaks:");
+
+// Case 1: raw gf-accounting DownstreamServiceException message → fully masked
+const leak = "External service 'gf-sales' failed during '/protected/v1/service-orders/1/101/for-settlement': 404 NOT_FOUND";
+assert(
+  sanitizeErrorMessage(leak) === GENERIC_DOWNSTREAM_FAILURE_MESSAGE,
+  "DownstreamServiceException message fully masked"
+);
+
+// Case 2: protected path alone
+assert(
+  sanitizeErrorMessage("Failed at /protected/v1/internal-thing").includes("Lỗi từ dịch vụ"),
+  "/protected/v1/... path detected → masked"
+);
+
+// Case 3: REST path
+assert(
+  sanitizeErrorMessage("Got 500 at /api/v3/service-orders/123/cancel").includes("Lỗi từ dịch vụ"),
+  "/api/v\\d+/... path detected → masked"
+);
+
+// Case 4: host:port leak
+assert(
+  sanitizeErrorMessage("Cannot connect http://gf-sales-internal:8080/health").includes("Lỗi từ dịch vụ"),
+  "host:port leak detected → masked"
+);
+
+// Case 5: clean business message → passes through unchanged
+const clean = "Mã phiếu không tồn tại trong hệ thống.";
+assert(sanitizeErrorMessage(clean) === clean, "Clean business message preserved");
+
+// Case 6: null / empty → generic
+assert(sanitizeErrorMessage(null) === GENERIC_DOWNSTREAM_FAILURE_MESSAGE, "null message → generic");
+assert(sanitizeErrorMessage("") === GENERIC_DOWNSTREAM_FAILURE_MESSAGE, "empty message → generic");
+
+// Case 7: formatGraphQLError end-to-end for API_ERROR with leaky message
+console.log("BUG-W01-226 — formatGraphQLError sanitizes API_ERROR messages:");
+const formatted = formatGraphQLError(
+  {
+    message: "External service 'gf-sales' failed during '/protected/v1/foo': boom",
+    extensions: { code: "API_ERROR", statusCode: 400 },
+    path: ["createInsuranceSettlement"],
+  } as any,
+  new Error("ignored"),
+);
+assert(
+  formatted.message === GENERIC_DOWNSTREAM_FAILURE_MESSAGE,
+  "formatGraphQLError API_ERROR branch masks message"
+);
+assert(
+  (formatted.extensions as any)?.code === "API_ERROR",
+  "formatGraphQLError preserves API_ERROR code"
+);
+
+console.log(`\n${failures === 0 ? "PASS" : "FAIL"}: ${failures} failure(s)`);
+process.exit(failures === 0 ? 0 : 1);
```

Also extend `package.json`:

```diff
   "scripts": {
     ...
     "test:insurance-mapper": "ts-node src/graphql/modules/gf-accounting/settlements/insurance.mapper.regression.ts",
+    "test:error-handlers": "ts-node src/config/errors/handlers.regression.ts",
```

## 7. Risk + verification plan

| Risk | Mitigation |
|---|---|
| Sanitization too aggressive — masks legitimate business error messages chứa "/api/v1/..." chuỗi accidental | Patterns chỉ match path-like prefix; unit test Case 5 verify clean message preserved |
| `path` + `details` + `serverResponse` removed → debug khó hơn | Original message vẫn log qua `logger.error` (handler line 20-26) — Ops debug qua log + requestId |
| Cross-FEAT regression — mọi `API_ERROR` message thay đổi (BUG-W01-204/205/206 family) | Verify chain `BUG-W01-201..208` (CR-1780980611 — error-code registry) — sanitize chỉ message string, code preserved → contract OK |
| Backward compat client parse message string | Client expect `code: "API_ERROR"`; message thay đổi chuỗi không break parser (giả định client không regex message — verify với FE team) |

Verification plan:
1. `npm run build && npm run lint` → pass.
2. `npm run test:error-handlers` → exit 0.
3. Re-run TC-W01-ISO-014 manual: confirm `ErrorResponse.message` không chứa `/protected/v1/`.
4. Spot-check 3 other `API_ERROR` flows (vd `BUG-W01-201..208` error codes) → confirm message vẫn rea`sonable nếu fail.
5. L2 verify per `Tracking/WAVE01/verify/BUG-W01-226.verify.md` AC list.

## 8. Status update for Tracking/WAVE01/BUGS.md

```
BUG-W01-226: Status OPEN → IN_PROGRESS
Updated: 2026-06-11
Notes prefix: "Analysis-only fix prepared per Rule #19 — see Execution/bugfixes/BUGFIX-BUG-W01-226.md;
              awaiting per-service agent to apply sanitization layer trong formatGraphQLError +
              ApiClient (cross-FEAT coverage per BR-AGG-GARAGE-GRAPH-005)."
```
