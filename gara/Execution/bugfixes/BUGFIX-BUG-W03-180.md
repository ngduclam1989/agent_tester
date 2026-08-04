# BUGFIX — BUG-W03-180

> Nhãn trạng thái INACTIVE của `InternalProductStatus` trên card / list / detail của Internal Product bị đổi từ `"Ngưng hoạt động"` ('ư') sang `"Ngừng hoạt động"` ('ừ') để đồng nhất với `MaterialGroupStatus.inactive` + tab-filter LocaleKey `internalProductList_tabInactive`. **User-directed override** áp dụng ở **code layer only** — docs (Figma spec, FEAT-CAT-PROD-DETAIL, rules-mobile M-trap-3) intentionally NOT updated.
> Severity: **P3** · Boundary: `garage-mobile` · Status: **FIX_DONE (Round 2)** · Date: 2026-07-07

## 1. Summary

Round-1 (2026-07-07 cycle 1) ESCALATED SPEC-CONFLICT: bug premise "typo — thiếu dấu huyền" trực tiếp mâu thuẫn với Figma node `21528:24631` (live-verified 2026-07-02) verbatim `"Ngưng"` + FEAT-CAT-PROD-DETAIL.md line 149/219 M-trap-3 divergence rule + 2 pinned regression tests (BUG-W03-053 bug_053, BUG-W03-059 bug_059) + memory FIX-035 warning về direction-flip trên chính chuỗi này.

Round-2 (2026-07-07 cycle 2) — user reviewed toàn bộ round-1 evidence + FIX-035 warning, **ratify override option (B')**: đổi wording ở code layer để normalise cross-screen convention, **giữ nguyên tất cả docs** (Figma, FEAT, BR, rules-mobile M-trap-3) → tự chọn accepted code-vs-doc drift. Round-1 escalation evidence được retain nguyên trong `verify/BUG-W03-180.verify.md` §2-§4 làm audit trail cho future agents.

## 2. Root cause

Không phải "typo" — wording `"Ngưng hoạt động"` ('ư') trước đây trong `internal_product_status.dart` là **đúng verbatim theo Figma spec + M-trap-3 divergence rule** (khác GROUP status vốn dùng `"Ngừng"` với dấu huyền). Round-1 xác nhận direction bug-row đề xuất mâu thuẫn với 4 nguồn spec/test đã pin.

Round-2 override = **business decision** của user (mobile dev role) để re-align UX cross-screen (PROD list/detail = GRP list/detail = tab filter đều dùng `"Ngừng"`) at code layer, chấp nhận drift vs Figma / FEAT / BR paper source.

## 3. Fix

**File 1 — `mobile/gf-garage-app/lib/core/models/inventory_catalog/internal_product_status.dart`**

Đổi expression tại `InternalProductStatus.inactive` branch trong getter `label`:

```dart
// BEFORE (round-1 state)
case InternalProductStatus.inactive:
  // BUG-W03-053: Figma node 21528:24631 (wave03-cat-prod-detail
  // INACTIVE state, live-verified 2026-07-02) verbatim badge text is
  // "Ngưng hoạt động" ('ư') — a different word from
  // MaterialGroupStatus.inactive's "Ngừng hoạt động" ('ừ', orange
  // badge) per M-trap-3 divergence. Do NOT change
  // material_group_status.dart to match — that enum's "Ngừng" is the
  // correct wording for its own screen.
  return 'Ngưng hoạt động';

// AFTER (round-2)
case InternalProductStatus.inactive:
  // BUG-W03-180 (2026-07-07): user-directed override — badge wording
  // switched from "Ngưng hoạt động" ('ư') to "Ngừng hoạt động" ('ừ')
  // to match MaterialGroupStatus.inactive + tab-filter locale key
  // internalProductList_tabInactive. This creates a documented drift
  // vs Figma node 21528:24631 verbatim (still says 'Ngưng') + drift
  // vs FEAT-CAT-PROD-DETAIL.md M-trap-3 divergence rule. User has
  // accepted the trade-off at code level; docs (FEAT/BR/spec/M-trap-3
  // in rules-mobile) are intentionally NOT updated. Prior lesson
  // FIX-035 warning about direction-flip on this exact string was
  // reviewed by user before ratifying this override; see memory/fix.md
  // entry 2026-07-07 note.
  return 'Ngừng hoạt động';
```

Comment block giữ dài (không rút single-line như prompt option) vì cần audit trail: (a) direction override, (b) drift acknowledged, (c) FIX-035 warning was reviewed. Đây là insurance chống future agent "restore Figma verbatim" mà không tra history.

**Byte-encoding verify** (post-edit):
- `grep -c $'\xe1\xbb\xab' internal_product_status.dart` = 2 (line 43 comment mention + line 53 return) — `ừ` = U+1EEB = UTF-8 `e1 bb ab` present. ✓
- `grep -c $'\xc6\xb0' internal_product_status.dart` = 4 (all in the audit comment describing the "Ngưng" → "Ngừng" flip + Figma node reference) — no residual `ư` in the return expression. ✓

**Regression tests (3 files)**:

1. **`test/ui/inventory_catalog/internal_product_detail/internal_product_detail_bug_053_test.dart:249-259`** — original BUG-W03-053 pin flipped:
   - Test name updated `'inactive label is "Ngừng hoạt động" (BUG-W03-180 override, not "Ngưng hoạt động")'`
   - Assertion `source.contains("return 'Ngừng hoạt động';")` = isTrue (was `"Ngưng"`)
   - Guard-revert assertion `source.contains("return 'Ngưng hoạt động';")` = isFalse (new)
   - Parity assertion `MaterialGroupStatus` source still contains `"'Ngừng hoạt động'"` (untouched — parity check)
   - Round-2 note in code comment above the group referencing BUG-W03-180

2. **`test/ui/inventory_catalog/widgets/internal_product_list_card_bug_059_test.dart:140,151`** — original BUG-W03-059 pin flipped:
   - `tester.widget<Text>(find.text('Ngừng hoạt động'))` (was `'Ngưng'`)
   - `expect(InternalProductStatus.inactive.label, 'Ngừng hoạt động')` (was `'Ngưng'`)

3. **`test/ui/inventory_catalog/widgets/internal_product_list_card_bug_180_test.dart`** — **new** static-source-assertion regression pin (4 tests):
   - `enum label returns 'Ngừng hoạt động'`
   - `enum label NO LONGER returns 'Ngưng hoạt động'`
   - `source pins 'Ngừng' literal and drops 'Ngưng' — static guard`
   - `MaterialGroupStatus wording remains 'Ngừng hoạt động' (parity)`
   - File header cites round-1 escalation evidence + FIX-035 review + `Product/ux/figma-mobile/wave03-cat-prod-detail.md` explicit NOT updated → guards future "restore Figma verbatim" agent.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/core/models/inventory_catalog/internal_product_status.dart` | `InternalProductStatus.inactive.label` returns `'Ngừng hoạt động'` (was `'Ngưng'`); M-trap-3 rationale comment replaced by override-audit comment citing BUG-W03-180 + FIX-035 |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_detail/internal_product_detail_bug_053_test.dart` | Test name + 2 assertions flipped, parity check for MaterialGroupStatus retained |
| `mobile/gf-garage-app/test/ui/inventory_catalog/widgets/internal_product_list_card_bug_059_test.dart` | 2 assertions flipped (widget-under-test + enum label) |
| `mobile/gf-garage-app/test/ui/inventory_catalog/widgets/internal_product_list_card_bug_180_test.dart` | **New** — 4 static-source + enum-label assertions pinning new wording, header documents user-override rationale |

## 5. Non-goals / out of scope (DELIBERATELY NOT TOUCHED per user override)

- `Product/features/FEAT-CAT-PROD-DETAIL.md` (line 149, 219) — still specifies verbatim `"Ngưng"` M-trap-3 divergence.
- `Product/business-rules/BR-GF-INVENTORY-CATALOG.md` — unchanged.
- `Product/ux/figma-mobile/wave03-cat-prod-detail.md` (line 189-219) — PNG-verified `"Ngưng"` grey pill note untouched.
- `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-DETAIL.md` — spec tier unchanged.
- `.claude/skills/dev/rules-mobile.md` M-trap-3 rule — unchanged.
- Figma node `21528:24631` — no Figma edit / no CR / no `use_figma` invocation.
- Memory `fix.md` FIX-035 — the warning entry stays as an anti-pattern; a 2026-07-07 addendum documents this override was made KNOWINGLY.

User acknowledged the documented drift; docs remain the paper source-of-truth for reference but code diverges intentionally.

## 6. Verification

**Static verification** performed in-agent:
- Byte encoding of `ừ` (U+1EEB, e1 bb ab) confirmed via `grep -c` on the source file. ≥1 occurrence in the return expression.
- All 3 regression test files re-read end-to-end — assertion strings and setup blocks internally consistent, no leftover reference to old wording in the pinned-slot slots.
- No other test file references `'Ngưng hoạt động'` (grep sweep across `mobile/gf-garage-app/test/` returned only the intentional `'Ngừng'` references in bug_089 tests unrelated to InternalProductStatus).

**Dynamic verification (`fvm flutter analyze` / `test`)**: **DEFERRED** — `which fvm` / `which flutter` / `which dart` all empty on design-repo host (`DEBT-W01-MOBILE-BUILD-ENV`).

**KG update**: skipped — enum label change, no entity / event / permission / cubit / route surface impacted.

## 7. Needs review

| Item | Concern |
|---|---|
| Docs drift catalog | Code intentionally diverges from Figma spec + FEAT-CAT-PROD-DETAIL + rules-mobile M-trap-3. If a future audit surfaces this as a policy violation, the anchor decision is documented in this BUGFIX + code comment + `verify/BUG-W03-180.verify.md` Verdict Log cycle 2. |
| M-trap-3 rule | rules-mobile M-trap-3 divergence rule (`PROD INACTIVE = 'Ngưng' vs GRP INACTIVE = 'Ngừng'`) is now factually false at code layer. Rule text unchanged per override scope. |
| Memory FIX-035 addendum | Anchor lesson about direction-flip verification should keep a 2026-07-07 addendum noting user reviewed and overrode. (Memory files live under `mobile/gf-garage-app/.claude/memory/` — updated separately by dev-role handoff, not in scope of this BUGFIX doc.) |

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-07 | 1 | agent-fix-garage-mobile | Round-2 fix — user-directed override applied at code layer only. Enum wording flipped `'Ngưng'` → `'Ngừng'` + 2 pinned regression tests flipped + new `bug_180_test.dart` (4 assertions) pinning new wording. Docs (Figma / FEAT / BR / rules-mobile M-trap-3) intentionally NOT updated → accepted code-vs-doc drift. Byte-encoding verified U+1EEB. Round-1 escalation evidence retained in L2 verify §2-§4 for audit. `flutter analyze/test` DEFERRED (no fvm — DEBT-W01-MOBILE-BUILD-ENV). |
