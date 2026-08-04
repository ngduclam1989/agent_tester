---
type: execution
artifact_kind: review-checklist-base
status: ACTIVE
version: 2
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-06-30"
stack: mobile
---

# Review Checklist — Base (garage-mobile · Flutter 3.41 / Dart / BLoC)

> Composed source. Ghép với `deltas/garage-mobile.md` → `mobile/gf-garage-app/.harness/_REVIEW-CHECKLIST.md`.
> Dùng bởi **agent-review-garage-mobile** (REVIEW, sống trong mobile service repo) **và**
> DEV/FIX garage-mobile (self-check trước handoff). Mirror nội dung
> `mobile/gf-garage-app/.claude/agents/agent-review-garage-mobile.md` — đổi nội dung phải đồng bộ 2 nơi.

## Checklist

- [ ] R1 **Architecture compliance**: change fits boundary + repo layering (lib/ui/<domain>, lib/core/repositories/<domain>).
- [ ] R2 **Boundary isolation**: shared-core / cross-domain edits có explicit impact reasoning; thay đổi giữ trong 1 domain + minimum shared core.
- [ ] R3 **Repository/API correctness**: UI không bypass repositories; GraphQL mappings align với operation root field (`lib/core/services/graphql/documents/*_document.dart`).
- [ ] R4 **Routing & DI safety**: route/injectable changes kèm generator updates (auto_route, injectable, freezed, json_serializable, localization, assets).
- [ ] R5 **UI conventions**: shared widgets, styles, localization patterns preserved (`lib/ui/widgets/`, `lib/core/common/`).
- [ ] R6 **Behavioral safety**: loading / empty / error / retry / permission states không bị break.
- [ ] R7 **Performance & lifecycle**: no rebuild abuse, lifecycle misuse, platform regressions.
- [ ] R8 **Security & config hygiene**: no hardcoded secrets, unsafe config duplication, forbidden environment edits.
- [ ] R9 **Validation coverage**: `fvm flutter analyze` + `fvm flutter test` + codegen + asset generation đã chạy khi required.
- [ ] R10 **Widget catalog compliance**: mọi page mới dùng `AppBarCustom` (KHÔNG Material AppBar / CustomAppBar deprecated), `AppButton.*` (KHÔNG raw OutlinedButton/ElevatedButton), `AppDialog`/`ConfirmationDialog` (KHÔNG raw Dialog/AlertDialog).
- [ ] R11 **Routing typed**: KHÔNG `Navigator.pushNamed(String)` / `context.router.pushNamed(String)`. Mọi navigation qua typed `context.pushRoute(<Route>())`.
- [ ] R12 **LocaleKeys compliance**: KHÔNG hardcode VN literal trong `lib/ui/**` (M-30 §4.1).
- [ ] R13 **Design token compliance**: spacing literal MUST `AppSizes.spacing{0,4,8,16,32,52}` hoặc raw int + `// figma binding scale N`. Color MUST `AppColors.*`. TextStyle MUST `AppTextStyle.*`. Shadow MUST `AppShadow.*` (singular).

---

## Severity Tiers

- **P0**: security breach, secret exposure, broken build/flavor, breaking change unflagged.
- **P1**: convention violation gây regression, repository bypass, missing generator update.
- **P2**: incomplete handoff, broken behavioral state, scope creep ngoài 1 domain.
- **P3**: style nit, naming, comment quality, optional refactor.

## Forbidden Actions (reviewer)

- Không edit code under review. Không approve khi route/DI/freezed/json/localization/assets đổi mà chưa check generated-code implications. Không skip boundary-impact analysis cho shared code.
- Không file finding không reference exact `file:line`.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-02 | 1 | Delivery Authority | Mirror 9-item mobile checklist từ `mobile/gf-garage-app/.claude/agents/agent-review-garage-mobile.md` → base composable. |
| 2026-06-30 | 2 | Delivery Authority + agent-fix-garage-mobile | W03 retro hardening: append R10 widget-catalog, R11 typed routing, R12 LocaleKeys, R13 design-token to checklist (mirror agent-review-garage-mobile). |
