# BUGFIX BUG-W01-285 — SO Edit gửi root `depreciationPercent` xuống BE dù KHÔNG broadcast

> **Status**: RESOLVED.
> **Severity**: P1.
> **Boundary**: garage-web (frontend).
> **Authored by**: agent-fix-garage-web (Wave 01).
> **Related**: FEAT-INS-SO-ADJUSTMENT AC-5/AC-8/EC-4, BR-INS-SO-ADJ-005,
> BUG-W01-262 (per-part contract refactor), BUG-W01-261 (root
> `depreciationByLine` bỏ SDL), BUG-W01-280/281 (preview EC-4 canonical),
> BUG-W01-284 (clear-value asym).

---

## 1. Failure mode

Trên SO Edit BH non-terminal:

- B1. User nhập "Khấu hao VT" per-part trong bảng Phụ tùng (vd Lọc gió 8%,
  Bánh xe 10%).
- B2. Section "Phân bổ Bảo hiểm" → field "Khấu hao vật tư / thay mới" user
  nhập 5% NHƯNG KHÔNG bấm "Áp dụng tất cả".
- B3. Submit "Lưu chỉnh sửa".

Quan sát: payload `UpdateServiceOrderV3` vẫn gửi root `depreciationDefault: 5`
xuống BE. BE map mapper có thể override per-part values bằng root scalar
(vi phạm EC-4 — per-part canonical). Reload SO Detail thấy giá trị root 5%
đã persist trong DB. Cascade risk: settlement snapshot depreciation sai
khi `createInsuranceSettlement` consume từ master.

## 2. Root cause

FE thiếu broadcast-state machine giữa root `depreciationDefault.percent` và
per-part `parts[i].depreciationPercent`:

- `buildInsuranceAllocationRequest` (`insurance-allocation/helper/index.ts`)
  luôn unconditional resolve root scalar và emit nó xuống payload.
- Không có cờ track "user đã commit broadcast chưa" — root field vừa là
  display-state (hiển thị giá trị mặc định cho seed input) vừa là source
  cho payload — 2 vai trò xung đột.
- Khi user nhập root nhưng không click "Áp dụng tất cả", intent là chỉ
  set seed cho lần broadcast sau; nhưng mapper coi đó là intent commit
  root → emit xuống BE.

## 3. Fix — `rootBroadcastCommitted` state machine

Thêm flag boolean optional vào schema + interface. Flag chỉ true sau khi
user click "Áp dụng tất cả"; clear thành false khi user edit root field
hoặc per-part value sau broadcast. Mapper chỉ emit root `depreciationDefault`
khi flag === true.

### 3.1 Schema (`insurance-allocation/schemas/index.ts`)

```ts
export const insuranceAllocationSchema = z.object({
  /* ...existing fields... */
  rootBroadcastCommitted: z.boolean().optional(),
});
```

### 3.2 Interface (`insurance-allocation/interfaces/index.ts`)

```ts
export interface InsuranceAdjustmentInput {
  /* ...existing fields... */
  rootBroadcastCommitted?: boolean;
}
```

### 3.3 Mapper gate (`insurance-allocation/helper/index.ts`)

```ts
const rootCommitted = input.rootBroadcastCommitted === true;
const request = {
  /* ...composite slots... */
  depreciationDefault: rootCommitted
    ? resolveDepreciationDefault(input)
    : undefined,
  insuranceDeductible: resolveInsuranceDeductible(input),
};
```

### 3.4 Broadcast handler (`components/insurance-allocation-section.tsx`)

```ts
const handleApplyDepreciationToAll = () => {
  /* ...apply percent to all matching parts... */
  onChange?.({ ...safeValue, rootBroadcastCommitted: true });
};
```

### 3.5 Root field user-edit invalidate (`components/adjustment-fields.tsx`)

Root depreciation input onChange merges `rootBroadcastCommitted: false`.
`normalizeAdjustmentInput` preserves the flag through render cycles.

### 3.6 Per-part user-edit invalidate (`service-order/components/form/index.tsx`)

`useRef` `broadcastInFlightRef` guards setValue cascades from broadcast.
`useEffect` watches `parts[].depreciationPercent`; if changed while
`broadcastInFlightRef === false` AND `rootBroadcastCommitted === true`,
clear flag.

### 3.7 Edit payload helper (`service-order/components/edit/index.tsx`)

`buildServiceOrderEditPayload` preserves `rootBroadcastCommitted` qua legacy
flat conversion (otherwise flag lost when converting nested → flat shape).

## 4. Blast radius

- **Inbound**: SO Edit form save path (`internalSubmit` →
  `buildInsuranceAllocationRequest`) và `buildServiceOrderEditPayload`.
- **Outbound**: agg-garage-graph `UpdateServiceOrderV3` mutation — root
  `depreciationDefault` chỉ xuất hiện trong payload khi flag === true.
  Per-part `parts[i].depreciationPercent` không đổi (đã canonical).
- **No BE/BFF contract change** — chỉ omit optional field; BE giữ
  per-part canonical khi root absent.

## 5. Regression test

`insurance-allocation/helper/build-allocation-request.broadcast.test.ts`
(6 specs cover 4 canonical case + Case B full + Case A explicit false):

- Case A: per-part edit + root nhập + KHÔNG broadcast → omit root.
- Case A explicit false: root edit + flag=false → omit root.
- Case B: broadcast committed (flag=true) → include root.
- Case C: per-part edit invalidates broadcast → omit root.
- Case D: clear → request undefined / root not emitted.
- Case B full: all 5 fields persist (no silent drop).

Existing tests `build-allocation-request.test.ts` + `build-service-order-edit-payload.test.ts`
updated fixtures với `rootBroadcastCommitted: true` để pin Case B behavior
(no logic weakening — chỉ reflect canonical post-broadcast state).

## 6. Files changed

- `frontend/gf-gms-web/src/features/insurance-allocation/schemas/index.ts`
- `frontend/gf-gms-web/src/features/insurance-allocation/interfaces/index.ts`
- `frontend/gf-gms-web/src/features/insurance-allocation/helper/index.ts`
- `frontend/gf-gms-web/src/features/insurance-allocation/components/insurance-allocation-section.tsx`
- `frontend/gf-gms-web/src/features/insurance-allocation/components/adjustment-fields.tsx`
- `frontend/gf-gms-web/src/features/service-order/components/form/index.tsx`
- `frontend/gf-gms-web/src/features/service-order/components/edit/index.tsx`
- `frontend/gf-gms-web/src/features/insurance-allocation/helper/build-allocation-request.broadcast.test.ts` (NEW)
- `frontend/gf-gms-web/src/features/insurance-allocation/helper/build-allocation-request.test.ts` (fixture update)
- `frontend/gf-gms-web/src/features/service-order/components/edit/build-service-order-edit-payload.test.ts` (fixture update)

## 7. Verification

- `npx vitest run src/features/insurance-allocation/` — 68/68 pass.
- `npx vitest run src/features/service-order/` — 20/22 (2 pre-existing
  failures BUG-W01-267 unrelated).
- `npx tsc -b` — clean.
- `npm run build` — pass.
