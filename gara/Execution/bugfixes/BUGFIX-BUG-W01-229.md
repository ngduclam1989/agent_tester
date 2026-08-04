# BUGFIX BUG-W01-229 — Analysis-only (Rule #19) → Bug status updated to INVALID

> **Bug L1 status (per `Tracking/WAVE01/BUGS.md` 2026-06-11)**: `INVALID` (sai oracle / not-a-defect — closed by triage after this analysis was authored).
> **Status from FIX agent**: Analysis preserved for audit + future reference if status changes.
> **Authored by**: design-repo subagent (agent-fix-agg-garage-graph spawned from `garage-agentic-design`).
> **Rule #19 compliance**: design repo NO-CODE — patch ghi unified-diff. Hiện không cần apply vì bug status = INVALID.

> NOTE: Phân tích why-chain + đề xuất auth-guard Apollo plugin + HTTP 401 response mapping vẫn có
> giá trị nếu chính sách auth thay đổi sau khi BUG-W01-227/228 backend JWT verify được resolve.
> Giữ doc làm reference; KHÔNG apply ở W01.

---

## 1. Failure mode (observed)

| Field | Value |
|---|---|
| Bug | BUG-W01-229 (P2, OPEN) |
| Symptom | GraphQL mutation `updateServiceOrderV3`, `createInsuranceSettlement`, query `getSettlementByCode` KHÔNG có `Authorization` header → BFF trả HTTP 200 với body `{"errors":[{"extensions":{"code":"API_ERROR"}}]}` thay vì HTTP 401 |
| Expected | HTTP 401 Unauthorized tại GraphQL layer trước khi resolver execute |
| Reporter | `agent-test-security` (TC-W01-SEC-AUTO-001/007/011) |

## 2. Root-cause Why-chain (≥3 levels)

### Why #1 — Tại sao BFF trả HTTP 200 cho request không có token?

Apollo Server v4 mặc định trả HTTP 200 cho **mọi** GraphQL response, kể cả error response (đó là spec — GraphQL response transport status code tách rời với GraphQL errors). Để trả HTTP 401, phải có middleware **trước** Apollo execution check `Authorization` header và short-circuit response với status 401.

### Why #2 — Tại sao BFF không có auth middleware?

Đọc `bffs/agg-garage-graph/src/server.ts:251-266`: `expressMiddleware(server, { context: async ({ req, res }) => ({ req, res, token: req.headers.authorization || null, ... }) })`. Context builder chỉ pass token (hoặc null) xuống context — KHÔNG verify, KHÔNG reject. HLD §1 ("BFF aware no auth — chỉ forward token") và CLAUDE.md repo (line 152) xác nhận "không thêm local JWT validation trừ khi kiến trúc yêu cầu rõ ràng".

→ Đây là **deliberate design** (passthrough-first, KG `gf-system` AGENT-REGISTRY +`policy-agent` đảm nhiệm authz). KHÔNG có local JWT verification.

### Why #3 — Tại sao downstream trả 403/200 thay vì BFF trả 401?

Khi không có token, BFF vẫn forward request xuống backend → backend (gf-sales, gf-accounting) verify token (qua `JwtTokenFilter` Java) → trả 403/401. ApiClient catch → `ApiClientError` → handler bọc thành GraphQL `ErrorResponse` HTTP 200.

### Why #4 — Vùng nào trong BFF có thể trả HTTP 401 mechanical (không break passthrough discipline)?

3 cách approach:

1. **Express middleware reject pre-Apollo** — Check `Authorization` header existence (KHÔNG verify JWT signature) trước khi route tới GraphQL handler. Reject HTTP 401 nếu missing. Pro: simple, không vi phạm "no local JWT validation" (chỉ check existence, không verify). Con: applies tới TẤT cả operations (kể cả public, vd `featureFlags` query line 956-959 KG không cần auth).
2. **Apollo plugin `requestDidStart` check context** — In plugin hook, check `contextValue.token`; nếu null + operation không thuộc `PUBLIC_OPERATIONS` allowlist → throw `GraphQLError("Unauthorized", { extensions: { code: "UNAUTHENTICATED", http: { status: 401 } } })`. Pro: per-operation, supports public ops. Con: Apollo trả 200 by default — phải set `http.status: 401` qua `formatError` hoặc plugin `willSendResponse`.
3. **Express response.status override sau Apollo execution** — Đọc response body, nếu phát hiện error code `UNAUTHENTICATED`, set `res.status(401)`. Đã có pattern tương tự ở `server.ts:222-238` (statusCode field). Con: late binding, request đã chạy resolver.

→ Best path: **Approach 2** (Apollo plugin) + bổ sung **Approach 3** (response status mapping) trong existing res.send override (server.ts:197-245). Approach 1 quá invasive.

### Why #5 — Public operations là gì?

KG `Execution/knowledge-graphs/agg-garage-graph.knowledge-graph.yaml` cần audit cho public ops. Hiện tại scan SDL: `featureFlags`, `getEnablePaymentMethodMobile` có khả năng public. Cần allowlist tường minh để approach 2 hoạt động.

## 3. Blast radius

| Surface | Affected |
|---|---|
| All authenticated GraphQL operations | YES — status code HTTP 200 → 401 cho no-token case |
| Public ops (featureFlags, etc.) | NO if allowlist setup đúng |
| Client error handling logic | YES — client cần phân biệt 401 vs 200+API_ERROR; per verify §8a.2 "garage-web, garage-mobile cần handle 401 vs API_ERROR correctly trong error interceptor" |
| HTTP status propagation từ backend (5xx errors) | NO — chỉ thay đổi cho UNAUTHENTICATED specifically |

## 4. Files to change

- `bffs/agg-garage-graph/src/server.ts` (lines 96-107 register plugin; lines 250-266 context — add plugin)
- New file `bffs/agg-garage-graph/src/config/auth-guard-plugin.ts` (Apollo plugin)
- `bffs/agg-garage-graph/src/config/graphqlErrorHandler.ts` (re-export — pass through)
- `bffs/agg-garage-graph/src/config/errors/handlers.ts` (extension http.status for UNAUTHENTICATED)
- New regression: `bffs/agg-garage-graph/src/config/auth-guard-plugin.regression.ts`

## 5. Proposed patch — unified diff

### 5.1 Auth-guard Apollo plugin

```diff
--- /dev/null
+++ b/bffs/agg-garage-graph/src/config/auth-guard-plugin.ts
@@ -0,0 +1,82 @@
+// ==========================================
+// AUTH GUARD APOLLO PLUGIN (BUG-W01-229)
+// ==========================================
+// Reject any operation that's not on the public allowlist when no `Authorization`
+// header is present. The plugin does NOT verify JWT signature — that stays at the
+// backend per CLAUDE.md / HLD passthrough-first discipline. It only checks header
+// existence, which is enough to surface HTTP 401 to the client (vs HTTP 200 with
+// downstream 403 wrapped as API_ERROR).
+//
+// Allowlist: operations that may run without a token. Keep small, audited.
+
+import {
+  ApolloServerPlugin,
+  GraphQLRequestContext,
+  GraphQLRequestListener,
+} from "@apollo/server";
+import { GraphQLError } from "graphql";
+import { GraphQLContext } from "../types/common";
+
+/**
+ * Operation names that are allowed without an Authorization header.
+ * Keep this list tight — every entry is an explicit policy decision.
+ */
+export const PUBLIC_OPERATION_ALLOWLIST: ReadonlySet<string> = new Set<string>([
+  "FeatureFlags",
+  "GetEnablePaymentMethodMobile",
+  // Add operations here only after security review.
+]);
+
+/**
+ * Returns true if the operation name is on the public allowlist.
+ * Tolerates missing operation name (returns false — caller decides reject).
+ */
+export function isPublicOperation(operationName: string | null | undefined): boolean {
+  if (!operationName) return false;
+  return PUBLIC_OPERATION_ALLOWLIST.has(operationName);
+}
+
+export function createAuthGuardPlugin(): ApolloServerPlugin<GraphQLContext> {
+  return {
+    async requestDidStart(): Promise<GraphQLRequestListener<GraphQLContext>> {
+      return {
+        async didResolveOperation(
+          ctx: GraphQLRequestContext<GraphQLContext>,
+        ): Promise<void> {
+          const opName = ctx.operationName ?? ctx.request.operationName ?? null;
+          if (isPublicOperation(opName)) return;
+          const token = ctx.contextValue.token;
+          if (!token) {
+            throw new GraphQLError("Unauthorized", {
+              extensions: {
+                code: "UNAUTHENTICATED",
+                http: { status: 401 },
+              },
+            });
+          }
+        },
+      };
+    },
+  };
+}
```

### 5.2 Wire plugin into server

```diff
--- a/bffs/agg-garage-graph/src/server.ts
+++ b/bffs/agg-garage-graph/src/server.ts
@@ -22,6 +22,7 @@ import {
   formatGraphQLError,
   createErrorHandlerPlugin,
 } from "./config/graphqlErrorHandler";
+import { createAuthGuardPlugin } from "./config/auth-guard-plugin";
 import cors from "cors";
@@ -99,6 +100,7 @@ async function startServer() {
     introspection: env.NODE_ENV !== "production",
     plugins: [
       ApolloServerPluginDrainHttpServer({ httpServer }),
+      createAuthGuardPlugin(),
       createErrorHandlerPlugin(),
       createResolverLoggingPlugin(),
       // OpenTelemetry auto-instrumentation handles all metrics
```

### 5.3 Force HTTP 401 status when UNAUTHENTICATED appears

Apollo Server 4 với `http.status` extension không tự set HTTP status. Cần extend response middleware hiện có ở `server.ts:197-245` để map UNAUTHENTICATED → 401.

```diff
--- a/bffs/agg-garage-graph/src/server.ts
+++ b/bffs/agg-garage-graph/src/server.ts
@@ -210,6 +210,21 @@ async function startServer() {

         if (parsedBody?.errors && parsedBody.errors.length > 0) {
+          // BUG-W01-229: surface UNAUTHENTICATED as HTTP 401 (default Apollo = 200).
+          const hasUnauth = parsedBody.errors.some((err: any) => {
+            const code = err?.extensions?.code;
+            return code === "UNAUTHENTICATED";
+          });
+          if (hasUnauth) {
+            res.status(401);
+          }
+
+          // BUG-W01-228 (related): forwarded backend FORBIDDEN → HTTP 403.
+          const hasForbidden = parsedBody.errors.some((err: any) => {
+            const code = err?.extensions?.code;
+            return code === "FORBIDDEN";
+          });
+          if (hasForbidden && res.statusCode === 200) {
+            res.status(403);
+          }
           logger.warn(`GraphQL Errors in ${operationName}:`, {
```

### 5.4 Ensure formatGraphQLError preserves UNAUTHENTICATED extension

```diff
--- a/bffs/agg-garage-graph/src/config/errors/handlers.ts
+++ b/bffs/agg-garage-graph/src/config/errors/handlers.ts
@@ -28,6 +28,20 @@ export function formatGraphQLError(

   const errorCode = formattedError.extensions?.code as string | undefined;

+  // BUG-W01-229: preserve UNAUTHENTICATED extension end-to-end so server.ts
+  // response middleware can map to HTTP 401.
+  if (errorCode === "UNAUTHENTICATED") {
+    return {
+      message: formattedError.message || "Unauthorized",
+      locations: formattedError.locations,
+      path: formattedError.path,
+      extensions: {
+        ...formattedError.extensions,
+        code: "UNAUTHENTICATED",
+      } as Record<string, unknown>,
+    };
+  }
+
   // Handle API errors - preserve backend error details and status
   if (errorCode === "API_ERROR") {
```

## 6. Regression test design

```diff
--- /dev/null
+++ b/bffs/agg-garage-graph/src/config/auth-guard-plugin.regression.ts
@@ -0,0 +1,75 @@
+// ==========================================
+// REGRESSION CHECK — auth-guard-plugin (BUG-W01-229)
+// ==========================================
+// Self-contained ts-node script. Run: `npm run test:auth-guard`.
+
+import { isPublicOperation, PUBLIC_OPERATION_ALLOWLIST } from "./auth-guard-plugin";
+
+let failures = 0;
+function assert(cond: boolean, msg: string) {
+  if (!cond) { failures++; console.error(`  ✗ ${msg}`); }
+  else console.log(`  ✓ ${msg}`);
+}
+
+console.log("BUG-W01-229 — isPublicOperation allowlist semantics:");
+
+// Case 1: protected operation rejected
+assert(!isPublicOperation("GetSettlementByCode"), "GetSettlementByCode is NOT public");
+assert(!isPublicOperation("UpdateServiceOrderV3"), "UpdateServiceOrderV3 is NOT public");
+assert(!isPublicOperation("CreateInsuranceSettlement"), "CreateInsuranceSettlement is NOT public");
+
+// Case 2: public operations on allowlist
+assert(isPublicOperation("FeatureFlags"), "FeatureFlags IS public");
+assert(isPublicOperation("GetEnablePaymentMethodMobile"), "GetEnablePaymentMethodMobile IS public");
+
+// Case 3: missing operation name → not public (caller will reject)
+assert(!isPublicOperation(null), "null operationName → NOT public");
+assert(!isPublicOperation(undefined), "undefined operationName → NOT public");
+assert(!isPublicOperation(""), "empty operationName → NOT public");
+
+// Case 4: allowlist is intentional + small
+assert(PUBLIC_OPERATION_ALLOWLIST.size <= 5, "Allowlist must stay small + audited");
+
+console.log(`\n${failures === 0 ? "PASS" : "FAIL"}: ${failures} failure(s)`);
+process.exit(failures === 0 ? 0 : 1);
```

Plus end-to-end integration repro `Execution/bugfixes/repro/BUG-W01-229.sh`:

```bash
#!/usr/bin/env bash
# BUG-W01-229 — verify HTTP 401 for protected ops without Authorization header.
set -euo pipefail
BFF_URL="${BFF_URL:-http://localhost:45401}"
GQL="${BFF_URL}/garage/graphql"

fail=0
for op_query in \
  "GetSettlementByCode|query GetSettlementByCode { getSettlementByCode(code: \\\"X\\\") { __typename } }" \
  "UpdateServiceOrderV3|mutation UpdateServiceOrderV3 { updateServiceOrderV3(id: 0, input: {}) { __typename } }" \
  "CreateInsuranceSettlement|mutation CreateInsuranceSettlement { createInsuranceSettlement(id: 0) { __typename } }"
do
  op="${op_query%%|*}"; q="${op_query##*|}"
  status=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$GQL" \
    -H "Content-Type: application/json" \
    -d "{\"operationName\":\"$op\",\"query\":\"$q\"}")
  if [ "$status" = "401" ]; then echo "PASS $op = 401"; else echo "FAIL $op = $status"; fail=1; fi
done

# Public ops still 200
status=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$GQL" \
  -H "Content-Type: application/json" \
  -d '{"operationName":"FeatureFlags","query":"query FeatureFlags { featureFlags { __typename } }"}')
if [ "$status" = "200" ]; then echo "PASS FeatureFlags public = 200"; else echo "FAIL FeatureFlags = $status"; fail=1; fi

exit $fail
```

Also extend `package.json`:

```diff
   "scripts": {
     ...
+    "test:auth-guard": "ts-node src/config/auth-guard-plugin.regression.ts",
```

## 7. Risk + verification plan

| Risk | Mitigation |
|---|---|
| Allowlist quá nhỏ → operation public bị reject (vd healthcheck queries) | Audit allowlist với security team trước khi apply; expand qua /cr-raise MINOR per addition |
| Plugin throw trong `didResolveOperation` không cause HTTP 401 by default | Verified via Apollo Server 4 docs: `formatError` + custom `extensions.http.status` + response.send override = HTTP 401 |
| Existing client (mobile) chưa handle 401 → could break UX | Per verify §8a.2 — mobile cần update interceptor. Coordinate với mobile team before rollout |
| Cross-impact với BUG-W01-227/228 (backend JWT verify) | BUG-W01-229 fix là **defensive layer 2** — backend vẫn cần verify JWT signature (BUG-W01-227/228). Two-layer defense |

Verification plan:
1. `npm run build && npm run lint` → pass.
2. `npm run test:auth-guard` → exit 0.
3. `bash Execution/bugfixes/repro/BUG-W01-229.sh` → all PASS.
4. Manual verify per `Tracking/WAVE01/verify/BUG-W01-229.verify.md` AC list (TC-W01-SEC-AUTO-001/007/011).
5. Regression check: every protected operation still works WITH valid token (sanity smoke test).

## 8. Status update for Tracking/WAVE01/BUGS.md

```
BUG-W01-229: Status OPEN → IN_PROGRESS
Updated: 2026-06-11
Notes prefix: "Analysis-only fix prepared per Rule #19 — see Execution/bugfixes/BUGFIX-BUG-W01-229.md;
              awaiting per-service agent to apply Apollo auth-guard plugin + response middleware
              HTTP 401 mapping. KHÔNG vi phạm passthrough discipline — chỉ check header existence,
              JWT signature verify vẫn ở backend (related: BUG-W01-227/228)."
```
