# BUGFIX — BUG-W03-066

> `MaterialGroupSearchInput` GraphQL input type thiếu field `parentIdProvided: Boolean` — backend gf-inventory đã sẵn field/JPQL chờ nhưng BFF chưa forward, khiến filter `parentId` là no-op hoàn toàn
> Severity: **P2** · Boundary: `agg-garage-graph` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

`gf-inventory`'s `MaterialGroupSearchRequest` DTO and `JpaMaterialGroupRepository` JPQL already implemented a 3-state `parentId` filter (all-level / root-only / children-of-X), gated by a `parentIdProvided: boolean` flag on the request. Nothing upstream of `gf-inventory` ever set that flag, because `agg-garage-graph`'s `MaterialGroupSearchInput` GraphQL input type (`inventory-catalog.schema.ts`) never declared the field — so it silently defaulted `false` on every request and the backend's `parentId` filter branch never activated, regardless of what `parentId` value the client sent.

## 2. Root cause

`searchMaterialGroups` (`inventory-catalog.resolver.ts:118-128`) is a pure, unconditional passthrough:

```ts
const { input } = args as { input: MaterialGroupSearchInput };
return gfInventoryService.post(
  API_ENDPOINTS.INVENTORY_CATALOG.MATERIAL_GROUP_SEARCH,
  input as unknown as Record<string, unknown>,
  context,
);
```

It forwards whatever fields exist on the GraphQL `input` object verbatim into the REST body — no allowlist, no transform. Because the SDL `input MaterialGroupSearchInput { keyword, parentId, status, page, size, sort }` never declared `parentIdProvided`, GraphQL would reject any client attempt to pass it (unknown input field), so the field could never reach the resolver in the first place. The backend contract half of the feature (`parentIdProvided` flag + 3-state JPQL branch) was already deployed and correct — this was purely a missing field on the upstream GraphQL contract, a contract gap rather than a resolver logic bug.

## 3. Fix

- **`inventory-catalog.schema.ts`** — added `parentIdProvided: Boolean` (optional, nullable, additive) to the `MaterialGroupSearchInput` input type, with a short SDL description documenting the 3-state semantics (`Set true to activate the parentId filter [...] Omit/false = parentId ignored, all levels returned.`) since the flag's meaning is non-obvious from the field name alone.
- **`inventory-catalog.types.ts`** — added the mirroring `parentIdProvided?: boolean` field to the `MaterialGroupSearchInput` TypeScript interface, keeping the SDL and TS type in sync.
- **Resolver — confirmed no change needed.** Re-read `searchMaterialGroups` in full; it is a generic passthrough with no field-picking logic, so the new SDL field is forwarded to the REST body automatically once GraphQL accepts it as a valid input field.
- **Consumer audit** — repo-wide `grep -rn "MaterialGroupSearchInput\|searchMaterialGroups"` across `.ts`/`.graphql`/`.md` confirmed exactly one usage site (schema declaration, TS interface, resolver arg cast) plus the smoke-test file itself. No other fixture, mock resolver, or integration test referenced this input type's shape, so no additional consumer needed updating.

This is a purely additive, non-breaking SDL change: existing callers that don't pass `parentIdProvided` are unaffected (GraphQL nullable-field default `null`/`undefined`, same as before the fix).

## 4. Files changed

| File | Change |
|---|---|
| `bffs/agg-garage-graph/src/graphql/modules/inventory-catalog/inventory-catalog.schema.ts` | Added `parentIdProvided: Boolean` to `MaterialGroupSearchInput` SDL input type + description |
| `bffs/agg-garage-graph/src/graphql/modules/inventory-catalog/inventory-catalog.types.ts` | Added `parentIdProvided?: boolean` to the `MaterialGroupSearchInput` TS interface |
| `bffs/agg-garage-graph/scripts/smoke-inventory-catalog.ts` | **New regression checks** — §5 BUG-W03-066: monkey-patches `gfInventoryService.post` to capture the REST body actually forwarded downstream, asserts `parentIdProvided`/`parentId` survive verbatim when set, and stay `undefined` when omitted |

## 5. Regression / verification

- `scripts/smoke-inventory-catalog.ts` — this repo ships no Vitest/Jest; the established regression convention for this module (see `npm run test:inventory-catalog`) is a lightweight smoke harness that executes real queries/mutations via `graphql()` against the composed schema. Added 2 new checks:
  1. `BUG-W03-066 — parentIdProvided forwarded verbatim to gf-inventory REST body` — calls `searchMaterialGroups` with `{ keyword: "vt", parentId: 42, parentIdProvided: true }`, asserts the stubbed `gfInventoryService.post` receives `parentIdProvided === true && parentId === 42`.
  2. `BUG-W03-066 — omitted parentIdProvided stays undefined (non-breaking default)` — calls `searchMaterialGroups` with only `{ keyword: "vt" }`, asserts the captured REST body's `parentIdProvided` is `undefined` — confirming the fix does not change behavior for existing callers.
- `npx ts-node scripts/smoke-inventory-catalog.ts` → **35/35 checks PASS** (33 pre-existing + 2 new).
- `npm run build` (`tsc`) → pass, 0 errors.
- `npm run typecheck` (`tsc --noEmit`) → pass, 0 errors.
- `npm run lint` — diffed via `git stash` before/after this change: the 3 touched files introduce **zero new lint errors**. The repo carries a large pre-existing baseline (~2070 `@typescript-eslint/no-explicit-any` / misc errors across unrelated files, plus a pre-existing `scripts/smoke-inventory-catalog.ts` parser-config warning unrelated to this diff — confirmed present before this change via `git stash`) — out of this fix's scope, not introduced or worsened here.

## 6. Non-goals / out of scope

- Did **not** touch `garage-mobile` — the client-side counterpart (deciding *when* to send `parentIdProvided: true` and wiring it into `SearchMaterialGroupsRequest.toJson()`) is tracked separately as **BUG-W03-067**, explicitly dependent on this fix landing first (GraphQL would reject the variable if the BFF schema didn't expose the field yet). Per the FIX dispatch's explicit instruction, BUG-W03-067 is out of scope for this cycle.
- Did **not** modify the resolver, `PassthroughService`, or any downstream `gf-inventory` code — both were already correct; this was purely an upstream contract gap.
- Did **not** add field-level validation/allowlisting to the resolver — consistent with this boundary's passthrough-first discipline (`rules-bff` §4 PassthroughService Discipline); business validation belongs to the backend, which already enforces it via the 3-state JPQL branch.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-agg-garage-graph | Fix — added `parentIdProvided: Boolean` to `MaterialGroupSearchInput` SDL + TS interface (additive, non-breaking); confirmed passthrough resolver needs no change; 2 new regression checks in `scripts/smoke-inventory-catalog.ts` (35/35 pass); `build`/`typecheck` pass, no new lint errors. |
