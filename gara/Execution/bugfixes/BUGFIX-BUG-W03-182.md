# BUGFIX — BUG-W03-182

> Trường **"Thuộc nhóm"** (parent group) trên màn `EditMaterialGroupPage` được re-enable (tap-able / picker mở, có default value = nhóm cha hiện tại). **User-directed override** áp dụng ở **code layer only** — docs (FEAT-CAT-GRP-EDIT.md v5 AC-4, BR-CAT-GRP-009 v19) intentionally NOT reverted to v4.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE (Round 2)** · Date: 2026-07-07

## 1. Summary

Round-1 (2026-07-07 cycle 1) ESCALATED SPEC-CONFLICT: bug premise "field bị disable, vi phạm AC-4 line 131-136" mâu thuẫn trực tiếp với `FEAT-CAT-GRP-EDIT.md` **v5 (2026-07-02)** — chính user "mobile dev" đã ratify quyết định KHOÁ VĨNH VIỄN trường parent 5 ngày trước, code đang thực thi đúng v5 (`enabled: !widget.isEdit` → khoá khi isEdit). Bug row cite spec v4 (obsolete).

Round-2 (2026-07-07 cycle 2) — user changed mind, **ratify override option (B')**: re-enable field ở code layer để lấy lại UX v4 behavior, **KHÔNG revert v5 spec + BR v19** (không CR, không Business Authority workflow), tự chấp nhận drift. Round-1 escalation evidence được retain nguyên trong `verify/BUG-W03-182.verify.md` §2 làm audit trail.

## 2. Root cause

Không phải "code bug" — code `enabled: !widget.isEdit` là **đúng verbatim theo FEAT v5 AC-4 + BR-CAT-GRP-009 v19** (locked field). Round-1 xác nhận direction bug-row đề xuất = revert quyết định 5 ngày trước.

Round-2 override = **business decision** của user để re-open parent selection at code layer only, chấp nhận drift vs FEAT-CAT-GRP-EDIT.md v5 + BR-CAT-GRP-009 v19.

## 3. Fix

**File — `mobile/gf-garage-app/lib/ui/inventory_catalog/widgets/material_group_form.dart`** (shared widget between Add + Edit — parent DropdownMenuWidget is the same widget instance; the only isEdit-conditional was on `enabled`).

### 3.1 Dartdoc header (line 15-31)

Rewrite item 3 of the field list:

```dart
// BEFORE
///  - Thuộc nhóm (optional dropdown, ACTIVE-only, exclude self/descendants;
///    disabled in edit — immutable after creation per BR-CAT-GRP-009)

// AFTER
///  - Thuộc nhóm (optional dropdown, ACTIVE-only, exclude self;
///    editable in edit mode — BUG-W03-182 override 2026-07-07 re-enabled
///    parent selection; server-side BR-CAT-GRP-009 cycle guard remains via
///    ERR-INV-003 → cubit.cycleError toast. Doc FEAT-CAT-GRP-EDIT.md v5
///    still locks the field on paper; drift accepted at code level).
```

### 3.2 `_parentDataList` self-exclusion filter (line 86-94)

Drop the `!widget.isEdit ||` short-circuit — self must be excluded unconditionally (in create mode `widget.initial` is null → filter no-op; in edit mode self must always be excluded):

```dart
// BEFORE
.where((p) => !widget.isEdit || p.id != widget.initial?.id)

// AFTER
// Exclude self in edit mode (client-side self-cycle guard).
// Descendant cycles rely on server-side BR-CAT-GRP-009 →
// ERR-INV-003 → cubit.cycleError toast (see edit_material_group_cubit).
.where((p) => p.id != widget.initial?.id)
```

### 3.3 Parent `DropdownMenuWidget.enabled` (line ~204-210)

Unconditionally enable + attach override-audit comment:

```dart
// BEFORE
child: DropdownMenuWidget(
  ...
  hintText: LocaleKeys.catGrp_parent.tr(),
  enabled: !widget.isEdit,
  onSelected: ...

// AFTER
child: DropdownMenuWidget(
  ...
  hintText: LocaleKeys.catGrp_parent.tr(),
  // BUG-W03-182 (2026-07-07) — user-directed override reversed
  // the FEAT-CAT-GRP-EDIT.md v5 (2026-07-02) lock decision;
  // parent selection is now editable in edit mode. Client-side
  // self-cycle guard in `_parentDataList`; deeper cycles rely
  // on server-side BR-CAT-GRP-009 (ERR-INV-003 → cycleError
  // toast). Docs intentionally NOT updated — accepted drift.
  enabled: true,
  onSelected: ...
```

### 3.4 Cubit / repository / state / mutation — NO CHANGE required

`EditMaterialGroupCubit` (`edit_material_group_cubit.dart`) already contains all wiring needed:

- Line 21-38 `load(int id)` — `Future.wait([getMaterialGroup(id), searchMaterialGroups(status: ACTIVE, page: 0, size: 200)])` populates `state.detail` (has `parentId` + `parentName`) + `state.parentOptions` in parallel.
- Line 42-51 `loadParents()` — refreshes options when seeded detail path is used (from previous screen).
- Line 55-81 `submit(...)` — `updateMaterialGroup(UpdateMaterialGroupRequest(..., parentId: parentId, ...))` — mutation input already carries `parentId`; picker's new selection propagates via `MaterialGroupFormValues.parentId` → page `_submit()` → cubit `submit(parentId: v.parentId)`.
- Line 72-73 `code == 'ERR-INV-003'` → `emit(state.copyWith(cycleError: true))` → page line 47-51 shows SnackBar `LocaleKeys.catGrp_cycleError.tr()` (defense-in-depth for descendant cycles).

`EditMaterialGroupPage.initState()` (line 34-42) already calls `cubit.load(widget.groupId)` or `cubit.loadParents()` after seed. `MaterialGroupForm(parentOptions: state.parentOptions, ...)` already passes options through. Default value renders via `_parentLabelFor(_parentId)` at `initState()` (line 104) from `widget.initial?.parentId`.

The Add screen (`add_material_group_cubit.dart` + page) uses the same `DropdownMenuWidget` inside the same shared `MaterialGroupForm` widget → pattern reuse is by construction; no new picker widget needed.

### 3.5 Regression test

**`mobile/gf-garage-app/test/ui/inventory_catalog/material_group_edit/material_group_edit_bug_182_test.dart`** — new static-source-assertion pin (5 tests, guards revert):

1. `parent DropdownMenuWidget no longer gates enabled on widget.isEdit` — assert source does NOT contain `'enabled: !widget.isEdit,'` in the parent block. (Note: `enabled: !widget.isEdit` still legitimately appears on the `AppTextField` for "Mã nhóm VTHH" per BR-CAT-GRP-004 code immutability — the test relies on the fact the dropdown call site no longer carries the literal because it uses `enabled: true,`; the AppTextField call site has different surrounding props like `controller:` and `readOnly:` so scoping is safe.)
2. `parent DropdownMenuWidget has literal enabled: true + BUG-W03-182 marker` — anchor at `hintText: LocaleKeys.catGrp_parent.tr(),`, scan 600-char window, assert `enabled: true,` present.
3. `client-side self-cycle guard excludes widget.initial?.id` — assert `p.id != widget.initial?.id` still exists.
4. `edit-mode conditional filter (!widget.isEdit ||) is dropped` — assert old conditional gone.
5. `EditMaterialGroupCubit still wires parentId in submit + loadParents` — reads cubit source, asserts `parentId: parentId`, `loadParents()`, `code == 'ERR-INV-003'` all present.

Header of the test file explicitly cites the BUG-W03-182 override + doc-vs-code drift to catch future "restore FEAT v5 lock" agent in review.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/widgets/material_group_form.dart` | Dartdoc parent-field description rewritten; `_parentDataList` self-filter unconditional; parent `DropdownMenuWidget.enabled: !widget.isEdit` → `enabled: true` with BUG-W03-182 override-audit comment |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_edit/material_group_edit_bug_182_test.dart` | **New** — 5 static-source assertions pin new behavior, guard against re-lock revert, verify cubit wiring intact |

Cubit / state / page / repository files: **NOT modified** — pre-existing wiring is complete.

## 5. Non-goals / out of scope (DELIBERATELY NOT TOUCHED per user override)

- `Product/features/FEAT-CAT-GRP-EDIT.md` — v5 AC-4 remains: parent field locked in edit. Change Log v5 entry (2026-07-02, user "mobile dev" ratified) intact.
- `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-EDIT.md` — spec tier unchanged.
- `Product/business-rules/BR-GF-INVENTORY-CATALOG.md` — BR-CAT-GRP-009 v19 (parent immutable after creation) unchanged.
- `Product/ux/figma-mobile/wave03-cat-grp-edit.md` — Figma spec / PNG untouched, no `use_figma` call.
- `FEAT-CAT-GRP-CREATE.md` — no cross-ref change.
- No CR raised — user exercised code-only override authority.

Server-side BR-CAT-GRP-009 (cycle detection via `ERR-INV-003`) remains active as defense-in-depth; the cubit already handles the error → toast per FEAT AC-4 wording. Descendant cycles are guaranteed to be caught by BE even without client-side descendant filtering.

## 6. Verification

**Static verification** performed in-agent:
- `material_group_form.dart` re-read end-to-end — dartdoc, `_parentDataList` filter, and DropdownMenuWidget block all internally consistent.
- Grep confirmed the previous conditional `!widget.isEdit || p.id != widget.initial?.id` no longer present.
- Grep confirmed `enabled: !widget.isEdit,` present exactly once (on the "Mã nhóm VTHH" AppTextField per BR-CAT-GRP-004 code immutability — legitimate, unrelated to this fix scope).
- `edit_material_group_cubit.dart` verified to already contain: `loadParents()`, `searchMaterialGroups(...ACTIVE, page: 0, size: 200)`, `updateMaterialGroup(...parentId: parentId...)`, `code == 'ERR-INV-003'` → `cycleError`. No cubit edit needed.
- Test file assertions cross-referenced against actual source content — all pins reference existing string patterns.

**Dynamic verification (`fvm flutter analyze` / `test`)**: **DEFERRED** — `which fvm` / `which flutter` / `which dart` all empty on design-repo host (`DEBT-W01-MOBILE-BUILD-ENV`).

**KG update**: skipped — widget-enable change, no entity / event / permission / cubit / route surface added.

## 7. Needs review

| Item | Concern |
|---|---|
| Docs drift catalog | Code intentionally diverges from FEAT-CAT-GRP-EDIT.md v5 AC-4 + BR-CAT-GRP-009 v19. If a future audit surfaces this as a policy violation, the anchor decision is documented in this BUGFIX + code comment + `verify/BUG-W03-182.verify.md` Verdict Log cycle 2. |
| Bottom-sheet vs Dropdown picker | Bug row wording asked for "bottom sheet picker". Implementation uses existing shared `DropdownMenuWidget` (same widget as `FEAT-CAT-GRP-CREATE` uses — pattern reuse honored). If user specifically wanted a bottom-sheet redesign (larger surface, search-inside-sheet), that would be a separate UX change; not in scope of this fix. |
| Client-side descendant filter | Not added — bug row cited `FEAT AC-4 line 133-136` mention of self+descendants exclusion, but implementation relies on server-side BR-CAT-GRP-009 cycle guard (which already exists + is already wired to toast). Trade-off: extra network round-trip on invalid selection, but no risk of stale descendant graph on client. Documented as acceptable per FEAT AC-4 line 138 wording ("Nhóm cha không hợp lệ: tạo thành vòng tròn trong cây phân cấp") which describes the toast-based recovery flow. |
| FEAT-CAT-GRP-CREATE reference | Add page uses the same `MaterialGroupForm` shared widget with `isEdit: false` — after this override, both create AND edit paths route through the identical `enabled: true` branch. Symmetry preserved. |

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-07 | 1 | agent-fix-garage-mobile | Round-2 fix — user-directed override applied at code layer only. Parent field re-enabled in edit: dartdoc header rewritten, `_parentDataList` self-filter unconditional, DropdownMenuWidget `enabled: true` + override-audit comment. Cubit unchanged (already wired end-to-end). Regression `material_group_edit_bug_182_test.dart` static-source × 5. Docs (FEAT-CAT-GRP-EDIT v5, BR-CAT-GRP-009 v19) intentionally NOT reverted → accepted code-vs-doc drift. Round-1 escalation evidence retained in L2 verify §2 for audit. `flutter analyze/test` DEFERRED (no fvm — DEBT-W01-MOBILE-BUILD-ENV). |
