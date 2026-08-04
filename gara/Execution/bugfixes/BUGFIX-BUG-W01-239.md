# BUGFIX BUG-W01-239 — SO Edit "Phân bổ quyết toán bảo hiểm" còn hiển thị khi BH=Không

> **Status**: RESOLVED.
> **Authored by**: agent-fix-garage-web.
> **Related**: BUG-W01-025 / 026 (cùng family — toggle off path, đã RESOLVED).

---

## 1. Failure mode

| Field | Value |
|---|---|
| Bug | BUG-W01-239 (P2) |
| Symptom | Mở SO PDV-20260611-00006 (BH=Không) → Detail view không hiển thị section ✓. Click "Chỉnh sửa" → Edit form vẫn render section "Phân bổ quyết toán bảo hiểm" (H2 count = 1) — vi phạm AC-1. |
| Reporter | agent-test-ui (TC-AUTO-006 Playwright FAIL) |

## 2. Root cause (why-chain)

### Why #1 — Tại sao Edit form render section khi `hasInsurance=false`?

`<ServiceOrderForm>` (`frontend/gf-gms-web/src/features/service-order/components/form/index.tsx:324` pre-fix) gate `<InsuranceAllocationSection>` bằng:

```tsx
<Show when={!!isEditing}>
  <InsuranceAllocationSection ... />
</Show>
```

Gate chỉ check `isEditing` — KHÔNG check `hasInsurance`.

### Why #2 — Tại sao `<InsuranceAllocationSection>` không tự ẩn theo `hasInsurance`?

Component (`frontend/gf-gms-web/src/features/insurance-allocation/components/insurance-allocation-section.tsx`) KHÔNG đọc form state `hasInsurance` — nó luôn render header H2 + AdjustmentFields khi mount. Comment trong form/index.tsx (pre-fix line 317) nói "Bên trong section còn gate theo toggle 'Bảo hiểm = Có'" — **comment sai**, không có gate nội tại.

### Why #3 — Tại sao gate ngoài lại quên `hasInsurance`?

Lịch sử fix:
- BUG-W01-216 thêm `<InsuranceAllocationSection>` cho SO Edit.
- BUG-W01-222 thêm mount EXPLICIT props (`useWatch` + `setValue` controller pattern).
- Cả 2 fix tập trung vào VALUE flow, không cập nhật gate.
- BUG-W01-025/026 fix toggle-off path (clear adjustments khi toggle Có → Không), nhưng không fix initial-load case khi SO load với `hasInsurance=false`.

Trên SO Detail (`detail/index.tsx:267`) gate đã đúng: `<Show when={!!data?.hasInsurance}>`. Asymmetry giữa Detail và Edit = root cause.

### Why #4 — Tại sao Detail mode đúng mà Edit sai?

`<ServiceOrderDetail>` đọc `data.hasInsurance` trực tiếp từ API response. `<ServiceOrderForm>` (Edit) đọc qua RHF state (`useWatch({control, name: "hasInsurance"})`). Cả 2 chỗ đều CÓ `hasInsurance` variable trong scope, nhưng Edit form chỉ dùng cho:
- Hide `<GrandSummary>` baseline panel (line 308 — `<Show when={!hasInsurance}>`).
- Conditional payload build (line 232 — `if (values.hasInsurance) {...}`).

Quên dùng cho `<InsuranceAllocationSection>` gate.

## 3. Fix

### Touched files

- `frontend/gf-gms-web/src/features/service-order/components/form/index.tsx` — gate `<Show>` thêm `&& !!hasInsurance`; rewrite comment block để bám source of truth chính xác.

### Diff highlights

```diff
-          <Show when={!!isEditing}>
+          <Show when={!!isEditing && !!hasInsurance}>
             <InsuranceAllocationSection ... />
           </Show>
```

Đồng thời rewrite comment block phía trên (gỡ inline bug ID per `.claude/rules/code-comment-rules.md` §Forbidden Anti-Patterns #1, mô tả lại điều kiện hiển thị đúng nghiệp vụ).

## 4. Regression test

`frontend/gf-gms-web/src/features/service-order/components/form/insurance-section-gate.test.ts` (NEW — 3 assertions):

1. Source code chứa pattern `<Show when={!!isEditing && !!hasInsurance}>` (positive assertion).
2. Source code KHÔNG còn pattern `<Show when={!!isEditing}>` ngay trên `<InsuranceAllocationSection` mount (negative assertion — catch regression nếu future change tháo `hasInsurance`).
3. Form vẫn watch `hasInsurance` qua `useWatch` (single source of truth preserved).

Lý do dùng source-level test thay vì render test: form pull đầy đủ RHF + Apollo + zustand + tenant-info context — render test sẽ brittle. Gate là literal condition trên source, source-level pattern check đủ catch regression.

Run: `npx vitest run src/features/service-order/components/form/insurance-section-gate.test.ts` → 3/3 PASS.

## 5. Blast radius

| Surface | Affected? | Note |
|---|---|---|
| SO Edit page UI | YES (target fix) — section hide khi `hasInsurance=false` |
| SO Create page | NO — `isEditing=false` luôn → gate vẫn false (AC-0 preserved) |
| SO Detail page | NO — không chia sẻ code path |
| Save payload (`buildServiceOrderEditPayload`) | NO — payload logic ở line 232 (`if (values.hasInsurance) {...}`) unchanged; payload không kèm allocation block khi `hasInsurance=false` (đã đúng theo BR-INS-SO-ADJ-001) |
| Toggle Có → Không runtime | LOW — section sẽ tự unmount khi `hasInsurance` đổi false (đồng bộ với khu vực thông tin bảo hiểm) |
| Toggle Không → Có runtime | LOW — section mount khi `hasInsurance` đổi true; RHF state `insuranceAllocation` giữ default `emptyAdjustmentInput()` |

## 6. Verification

- `npm test` → 48/48 PASS.
- `npm run build` → exit 0.
- Lint không introduce error mới.

Manual repro pending L2: mở SO PDV-20260611-00006 → Detail (không section ✓) → "Chỉnh sửa" → Edit (cũng không section ✓ post-fix).

## 7. Follow-ups

- `<InsuranceAllocationSection>` self-gate (đọc `hasInsurance` từ form context bên trong) sẽ làm component robust hơn. Hiện tại 2 caller (Detail / Edit) đều gate ngoài — repeated pattern. Có thể refactor vào component internal sau, NHƯNG ngoài scope bug fix lần này.
