# BUGFIX — BUG-W03-053

> Product Detail — layout attribute sai toàn bộ, field lẫn lộn giữa các card, thiếu field + dữ liệu thật
> Severity: **P1** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02 (corrected 2026-07-02, see §7)

## 1. Summary

`InternalProductDetailPage` (`lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart`) drifted significantly from Figma (node `21555:24017` → frame `21526:45088`, file `5YU4H3iY726P8KNxI9oCYF`, re-fetched live 2026-07-02):

1. All 4 cards used the shared `StartInfoRow` ("Label: value" one horizontal line) instead of Figma's `AttributesField` composition (small grey caption on top, bold value below, 2-column grid for paired fields).
2. HeaderCard was missing the `SectionDivider` + a ĐVT (unit)/Thương hiệu (brand) attribute row entirely.
3. GeneralInfoCard had the wrong field set: included "Thương hiệu" (belongs in Header) and was completely missing "Phương pháp tính giá" (costing method — no such field exists on the model).
4. TechnicalSpecCard rendered the Unit (`StartInfoRow(label: "Đơn vị tính", ...)`) instead of the real `technicalSpec` free-text field, which the code's own comment admitted was "not yet surfaced in this view; tracked as follow-up DEBT".
5. SpecDescriptionCard rendered Mô tả (no label) before Quy cách (conditionally hidden when empty) — Figma order is Quy cách (labeled) first, then Mô tả (labeled) second, both always shown.
6. (P2, same file) Product name + 3 section titles used Bold heading tokens (`textHeadingH3`/`textHeadingH4`) instead of `textSubtitleS4` (SemiBold); AppBar title said "Chi tiết sản phẩm" instead of "Sản phẩm"; 2 diacritic/wording drifts in `vi.json`; INACTIVE badge said "Ngừng hoạt động" instead of "Ngưng hoạt động".

## 2. Root cause

The screen was originally implemented by reusing the shared `StartInfoRow` widget (label-beside-value, used by 8 consumers across `lib/ui/inventory/**`) as a generic "any detail row" primitive, without checking that this specific Figma screen's `AttributesField` composition is fundamentally different (stacked, not inline) — a composition mismatch, not a token mismatch. Downstream of that wrong base pattern, individual field placement drifted further as the page evolved across prior W03 cycles (Thương hiệu ended up in the wrong card, Unit was substituted for the real `technicalSpec` field, and the description/spec fields were mapped in the wrong order with a stale conditional). The P2 items are independent small-token/wording drifts caught in the same live Figma audit.

## 3. Fix

### 3.1 New scoped widget (Task 1)

Added `lib/ui/inventory_catalog/internal_product_detail/widgets/attributes_field.dart`:

- `AttributesField(label, value)` — `Column(crossAxisAlignment: start)` with a `textCaptionC7`/`textTertiary` label on top, `Gap(AppSizes.spacing4)`, then a `textBodyB5`/`textPrimary` value below.
- `AttributesFieldRow(left, right)` — `Row` of 2 `Expanded(AttributesField)` with a 12px gap (`// figma binding scale 12 — no exact AppSizes match`, matching this file's existing convention for the same non-scale gap value).

Scoped to this screen only — the shared `StartInfoRow` (`lib/ui/inventory/widgets/start_info_row.dart`, 8 consumers) was **not** modified (Shared-Symbol Blast-Radius Gate: out of scope, flagged in `needs_review` for a separate dedicated fix).

### 3.2 HeaderCard (Task 2)

Added, after the product name: `Gap(spacing8)` → `SectionDivider()` (reused `lib/ui/inventory/widgets/section_divider.dart`, matching the existing sibling-screen precedent in `internal_product_list_card.dart`, which already uses `SectionDivider` inside a white card between name and attribute grid) → `Gap(spacing8)` → `AttributesFieldRow(catProd_unitShort "ĐVT", catProd_brand "Thương hiệu")`. Product name style changed `textHeadingH3` → `textSubtitleS4`.

### 3.3 GeneralInfoCard (Task 3)

Field set corrected to row1 = Tính chất | Nhóm, row2 = Xuất xứ | Phương pháp tính giá (matches live Figma exactly). "Thương hiệu" removed (moved to Header). Added `SectionDivider()` under the section title (present in Figma for every card, added for full fidelity across all 4 cards, not just Header). New locale key `catProd_costingMethod` = "Phương pháp tính giá" added to `vi.json`/`en.json`.

**v2 correction (§7)**: the "Nhóm" column label now uses `common_groupShort` ("Nhóm") instead of `catProd_materialGroup` ("Nhóm hàng") — matching the sibling `InternalProductListCard._AttrCell` usage for the same `materialGroupName` field and the literal Figma label quoted in the filed bug row.

`InternalProductDetail` model (`lib/core/models/inventory_catalog/internal_product_models.dart`) has **no costing-method field at all** — confirmed by reading the model source; the GraphQL `getInternalProduct` document also does not select any such field. Rather than fabricate a value, the row renders with placeholder `'--'` and this gap is flagged in `needs_review` for a BE/BFF follow-up (the field must exist on `InternalProduct` and be added to the Q5 selection set before mobile can wire real data).

### 3.4 TechnicalSpecCard (Task 4)

Now renders `detail.technicalSpec` (confirmed present on the model AND already selected by the `getInternalProduct` GraphQL document — no BE/BFF gap) as a single free-text paragraph (`textBodyB5`/`textPrimary`, no label), closing the DEBT comment that previously admitted this field "is not yet surfaced in this view". The Unit moved to HeaderCard (§3.2).

### 3.5 SpecDescriptionCard (Task 5)

Reordered: Quy cách (`detail.productSpec`, `catProd_specification` label) first, then Mô tả (`detail.description`, reused existing `common_description` = "Mô tả" label) second — both rendered as `AttributesField` (stacked label+value), both **always** shown (removed the `if ((detail.productSpec ?? '').isNotEmpty)` conditional); empty value falls back to `'--'` per this page's existing null-fallback convention.

### 3.6 P2 bundle (Task 6)

- Product name + all 3 section titles: `textHeadingH3`/`textHeadingH4` → `textSubtitleS4` (verified live: Figma uses Inter SemiBold 16/24 for all 4).
- AppBar title: `catProd_detailTitle` value changed "Chi tiết sản phẩm" → "Sản phẩm" (verified only consumer is this page; `catProd_title`, used by the sibling list page, already carried the correct string).
- `vi.json`: `catProd_technicalSpec` "Thông số kỹ thuật" → "Thông số kĩ thuật" (verbatim Figma diacritic). Mirrored in `en.json` ("Product detail" → "Product").
- ~~`catProd_descriptionAndSpec` "Mô tả & quy cách" → "Quy cách mô tả"~~ — **this line was WRONG, see §7 correction (v2): the value stays "Mô tả & quy cách", the direction was misread.**
- `internal_product_status.dart`: `InternalProductStatus.inactive.label` "Ngừng hoạt động" → "Ngưng hoạt động" — verified live against the Figma INACTIVE-state frame (`21528:24631`, badge text "Ngưng hoạt động" with 'ư'). `material_group_status.dart` (`MaterialGroupStatus.inactive`, "Ngừng hoạt động" with 'ừ', ORANGE badge, M-trap-3 divergence) was **not** touched — confirmed via grep it is a fully separate enum/file with its own correct wording for its own screen.
- `StartInfoRow`'s raw hardcoded `TextStyle` — **not** touched (out of scope, shared widget, flagged in `needs_review`).

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart` | Rewrote all 4 card widgets (`_HeaderCard`, `_GeneralInfoCard`, `_TechnicalSpecCard`, `_SpecDescriptionCard`) to use `AttributesField`/`AttributesFieldRow` + `SectionDivider` instead of `StartInfoRow`; corrected field sets/order per card; fixed 4× typography token; fixed AppBar title key usage (value fixed in locale file). Import swapped `start_info_row.dart` → `section_divider.dart` + new `widgets/attributes_field.dart`. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_detail/widgets/attributes_field.dart` | **New** — `AttributesField` + `AttributesFieldRow` widgets, scoped to this screen. |
| `mobile/gf-garage-app/lib/core/models/inventory_catalog/internal_product_status.dart` | `InternalProductStatus.inactive.label` "Ngừng hoạt động" → "Ngưng hoạt động" (+ explanatory comment distinguishing from `MaterialGroupStatus`). |
| `mobile/gf-garage-app/assets/localizations/vi.json` | `catProd_detailTitle` → "Sản phẩm"; `catProd_technicalSpec` diacritic fix; `catProd_descriptionAndSpec` reworded; new `catProd_costingMethod` key. |
| `mobile/gf-garage-app/assets/localizations/en.json` | Mirrored English translations for the 4 keys above. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_detail/widgets/attributes_field_test.dart` | **New** — real widget-tree pump test for `AttributesField`/`AttributesFieldRow` (no BLoC/DI dependency, unlike the page's private card classes). |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_detail/internal_product_detail_bug_053_test.dart` | **New** — static source assertion regression suite (consistent with `internal_product_detail_card_decoration_test.dart`, BUG-W03-034 convention) covering all 6 tasks: card composition, field sets, ordering, locale values, status label. |

## 5. Regression / verification

- **Test type**: mixed — real widget-tree pump for the new standalone `AttributesField`/`AttributesFieldRow` (no DI dependency), static source assertion for the page's private card classes (`_HeaderCard` et al. are library-private; page wires its cubit through getIt + AutoRoute + BasePage with no DI-mocking precedent in this suite — same rationale as `internal_product_detail_card_decoration_test.dart`, BUG-W03-034).
- All source-assertion checks were independently pre-validated against the actual edited files with an equivalent Python script before being committed to the Dart test file (35/35 assertions passed) — see FIX session transcript.
- `python3 scripts/check-mobile-canonical-primitives.py --file <all 5 touched/created .dart files>` → **OK: 0 anti-pattern hit**.
- Brace/paren balance verified programmatically on all 5 touched/created `.dart` files → balanced.
- `vi.json`/`en.json` re-parsed with `python3 -m json.load` → valid JSON on both.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no `fvm`/`flutter` toolchain in this environment (`DEBT-W01-MOBILE-BUILD-ENV`). TEST_GROUP must run both on a machine with the toolchain before flipping `VERIFIED`.

## 6. Non-goals / out of scope

- `StartInfoRow` (`lib/ui/inventory/widgets/start_info_row.dart`) raw hardcoded `TextStyle` — shared widget, 8 consumers, unknown blast radius. Not touched. Flagged in `needs_review` for a separate dedicated fix with a proper Shared-Symbol Blast-Radius Gate pass.
- `InternalProductDetail` model / GraphQL document — not modified. The missing costing-method field is a BE/BFF data gap, out of scope for a mobile UI FIX cycle; flagged in `needs_review`.
- Code `#` prefix styling on the header (`#IP-BP-0001`) — Figma shows it as one colored span; current code already renders `detail.code` as-is with the same H4/blue style. Not part of the filed bug's task list; left unchanged.
- Badge text COLOR for `InternalProductStatus.inactive` (`AppColors.textSecondary`/`bgBadgeOpen`) — the live Figma inactive-state fetch showed a slightly different exact hex (`#273243`) than `AppColors.textSecondary` (`#595e69`) for the badge text; only the wording was in scope per the filed bug, so color was left unchanged. Flagged in `needs_review` as a minor follow-up candidate.

## 7. Correction (v2, same-day follow-up cycle)

The v1 fix cycle above (Change Log v1) got **two items backwards**, discovered by diffing the working tree against `git HEAD` (the pre-fix baseline) instead of trusting v1's own "verbatim Figma text" claim at face value:

1. **`catProd_descriptionAndSpec`** — v1 changed this key's value from `"Mô tả & quy cách"` to `"Quy cách mô tả"`, describing that as the fix. In fact `git diff` against HEAD shows **HEAD already had `"Mô tả & quy cách"`** before v1 touched it — v1 misread the filed bug row's `"Quy cách mô tả"→"Mô tả & quy cách"` notation backwards (the row's convention elsewhere is `[wrong]→[correct]`, e.g. `"Ngừng"→phải "Ngưng"`, which v1 *did* apply correctly for the status badge). Corrected: reverted `vi.json`/`en.json` `catProd_descriptionAndSpec` back to `"Mô tả & quy cách"` / `"Description & specification"` (the value HEAD already had, which is also the FIX task's explicit target).
2. **`catProd_technicalSpec`** — re-checked for the same class of error: v1 changed HEAD's `"Thông số kỹ thuật"` → `"Thông số kĩ thuật"`. The FIX task's explicit instruction independently confirms `"kĩ thuật"` as the correct target (verbatim Figma) — this one direction was applied correctly by v1, **left unchanged**.
3. **GeneralInfoCard "Nhóm" label** — not a v1 regression, but a gap: v1 used `catProd_materialGroup` ("Nhóm hàng") for the `materialGroupName` field. The filed bug row quotes the Figma label literally as `"Nhóm"`, and the sibling `InternalProductListCard._AttrCell` (same domain, same field) already uses `common_groupShort` ("Nhóm") for this exact field. Corrected: page now uses `common_groupShort` to match.

**Root-cause note**: v1 treated its own Change Log entry as ground truth without re-diffing against `git HEAD`, so an inverted string edit went undetected — the regression test file it authored in the same cycle (`internal_product_detail_bug_053_test.dart`) even pinned the wrong value, so the test suite was internally consistent but wrong. Lesson: when a bug's fix description uses "A→B" notation, verify which of A/B is the *current* value (`git diff`/`git show HEAD:<path>`) before writing the target — do not assume the order in prose is self-evidently correct, and do not let a same-cycle regression test "confirm" a value that was never cross-checked against the pre-fix baseline.

Files touched in this v2 correction: `assets/localizations/vi.json`, `assets/localizations/en.json`, `internal_product_detail_page.dart` (Nhóm label only), `internal_product_detail_bug_053_test.dart` (2 assertions corrected to match).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — full rewrite of `InternalProductDetailPage`'s 4 cards from `StartInfoRow` to new scoped `AttributesField`/`AttributesFieldRow`; HeaderCard divider+ĐVT/Thương hiệu; GeneralInfoCard field-set correction + costing-method placeholder; TechnicalSpecCard real `technicalSpec` text; SpecDescriptionCard reorder+always-visible; 4× typography token fix; AppBar title; 2 vi.json diacritic/wording fixes; inactive badge wording fix. New widget file + 2 new regression test files. `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
| 2026-07-02 | 2 | agent-fix-garage-mobile | **Correction** (§7) — v1 got `catProd_descriptionAndSpec` backwards (reverted `vi.json`/`en.json` to `"Mô tả & quy cách"`/`"Description & specification"`, the pre-v1 HEAD value and the FIX task's actual target); `catProd_technicalSpec` re-verified correct as-is, no change. Also fixed a v1 gap: GeneralInfoCard "Nhóm" label now uses `common_groupShort` instead of `catProd_materialGroup`, matching sibling `InternalProductListCard` + the literal Figma label. Updated 2 assertions in `internal_product_detail_bug_053_test.dart` to match. `python3 scripts/check-mobile-canonical-primitives.py` re-run on all touched files: 0 hit. `flutter analyze`/`flutter test` still DEFERRED (no toolchain). |
