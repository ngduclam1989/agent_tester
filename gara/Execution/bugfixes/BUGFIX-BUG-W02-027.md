# BUGFIX BUG-W02-027 — RBAC tab "Hồ sơ BH đã xuất" mobile blocked by gf-system permission resource provisioning

> **Status**: ESCALATED — cross-boundary blocker (gf-system permission provisioning).
> **Authored by**: agent-fix-garage-mobile (W02 FIX cycle 2026-06-24).
> **Related**: BUG-W02-029 (web RBAC parity), checklist T44 NEEDS_REVIEW.

---

## 1. Failure Mode

Tab "Hồ sơ bảo hiểm đã xuất" trên `InsuranceSettlementDetailScreen` mobile không gate đúng theo permission resource `settlement` + action `view`/`detail`. Mọi role (kể cả `staff` không có quyền) đều thấy tab — vi phạm AC-8 soft.

## 2. Root Cause

**Mobile-side UI logic ĐÃ đúng** tại `mobile/gf-garage-app/lib/ui/settlement/settlement_detail/insurance_settlement_detail_screen.dart:428-440`:

```dart
Widget _buildDossierTab(BuildContext context, String code) {
  final tab = DossierHistoryTab(...);
  final perms = GetIt.I<AppPreferences>().permissionsLocal;
  if (perms == null || !perms.hasResource('settlement')) return tab;  // brownfield fail-open
  final allowed = perms.hasAnyPermission(
    resource: 'settlement',
    actions: const ['view', 'detail'],
  );
  return allowed ? tab : const SizedBox.shrink();
}
```

Gate logic correct nhưng **fail-open** (return tab) khi resource chưa được provision — vì hệ thống brownfield chưa cấp resource `settlement`. Trong khi backend chưa provision, mọi role pass qua → render tab cho mọi user.

Root cause thực sự = **cross-tier**: `gf-system` chưa provision permission resource `settlement` + action `view`/`detail` trong matrix.

## 3. Fix Path (Cross-Boundary — REQUIRES CR)

Theo bug filing + NOTE "cross-tier CR cần `/cr-raise MODERATE` gf-system trước khi mobile FIX":

1. **`gf-system`** (CR MODERATE required): thêm permission resource `settlement` + actions `view`/`detail` + Flyway migration `V{N+1}__add_permission_settlement.sql` additive
2. **`gf-system`**: update permission grant matrix — accountant + garage-owner full access, staff denied
3. **`garage-mobile`**: UI logic đã correct — sẽ tự gate khi backend cấp resource
4. **Test**: `TC-W02-MOB-UI-DOSSIER-TAB-RBAC` — 3 role × verify tab visibility

## 4. Why Escalating (Not Self-Fix)

- Cross-boundary primary owner = `gf-system` (NOT garage-mobile)
- Mobile code đã correct, không có fix mobile-side khả thi đến khi backend provision resource
- Per directive Escalation Trigger #1 "cross-boundary fix" — escalate ngay khi cần CR cho boundary khác
- Verify mobile-side khi backend ready: cần emulator + 3 role test users (DEBT-W01-MOBILE-BUILD-ENV)

## 5. Touched Files (Mobile-side: NONE)

- No mobile changes proposed — UI logic đã có sẵn `hasResource('settlement') && hasAnyPermission(['view','detail'])` per FEAT-INS-DOSSIER-VIEW T44

## 6. Regression Test (Deferred — needs backend)

- `bug_w02_027_dossier_tab_rbac_test.dart`: pump `InsuranceSettlementDetailScreen` với mock `PermissionSnapshot` 3 case (no-resource → tab visible; resource-without-action → tab hidden; resource-with-view → tab visible). Test cần resource `settlement` được mock trong PermissionSnapshot — viết được nhưng yêu cầu backend contract cấp resource.

## 7. Status

ESCALATED → cần CR cho gf-system + REVIEW_GROUP approval trước khi unblock.

## 8. Notes — Harness Limitation

Subagent spawn ở môi trường này gặp hook session_id propagation gap (FM-012 hook không phân biệt được subagent vs main). Code edits trong mobile/ tree bị block dù trực tiếp được phép theo directive. BUGFIX doc + status update vẫn được persist.
