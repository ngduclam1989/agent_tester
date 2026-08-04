# BUGFIX BUG-W02-062 — GUQ prefill mã/ngày Phiếu dịch vụ (Căn cứ phiếu báo giá)

> **Status**: PARTIAL RESOLVED — double-init bug (B) fixed in commit `72505b74` (mobile repo). Prefill helper for Defect (A) still PROPOSED.
> **Authored by**: agent-fix-garage-mobile (W02 FIX cycle 2026-06-24).
> **Applied by**: agent-test-orchestrator via Bash cp+patch (2026-06-24, FM-012 Bash exception).
> **Related**: BUG-W02-061 (BBNT same defect A — same commit).

---

## 1. Failure Mode

Preview "Giấy ủy quyền" (Tạo hồ sơ BH, mobile) — 2 defects:

- **(A)** Trường "Căn cứ phiếu báo giá" KHÔNG prefill (để trống). BA confirm 2026-06-24: design GUQ CÓ trường này + LUÔN prefill (mã ← mã PDV, ngày ← ngày tạo PDV; mockup "Phiếu báo giá số BG-240426-01 ngày 24/04/2026").
- **(B)** Clause "IV. Cam kết" Mục N (dòng thêm/trống) placeholder literal "Nhập null" — cùng shared clause-input widget với BBNT BUG-W02-061-B (fix 1 chỗ).

⚠️ **SPEC GAP**: AC-7 field table KHÔNG liệt kê "Căn cứ phiếu báo giá" dù design có → FEAT-INS-DOSSIER-CREATE AC-7 cần bổ sung field row + prefill rule (Business Authority). OUT-OF-SCOPE.

## 2. Root Cause

`mobile/gf-garage-app/lib/ui/insurance_dossier/dossier_payment_authorization_screen.dart` — initState có **double assignment bug** (botched merge):

Line 77-79 (đặt `_quoteRef` từ initial / settlement):
```dart
_quoteRef = TextEditingController(
  text: i?.quoteReference?.code ?? widget.settlement?.code ?? widget.settlementCode,
);
```

Line 86 ngay sau OVERWRITE empty:
```dart
_quoteRef = TextEditingController();  // ← BUG: overwrites line 77-79
```

→ `_quoteRef` luôn empty regardless of initial / settlement data.

Tương tự `_placeIssued` (line 75 vs 82) và `_dateIssued` (line 76 vs 83-85). Double initialization indicates merge artifact.

Defect (B): same shared widget với BUG-W02-061 → fix tại `dossier_clause_list.dart`.

## 3. Proposed Fix

### Fix A — Clean up double initialization + add PDV prefill

`dossier_payment_authorization_screen.dart:65-117` (initState) — refactor for single assignment:

```dart
@override
void initState() {
  super.initState();
  final i = widget.initial;
  final so = widget.settlement?.serviceOrder;
  final plate = so?.vehicleResponse?.plate ?? '';
  final business = getIt<ProfileCubit>().state.businessInfo;
  final defaultBranch =
      business?.branches?.where((b) => b.isDefault == true).firstOrNull
          ?? business?.branches?.firstOrNull;

  // Header
  _placeIssued = TextEditingController(
    text: i?.placeIssued ?? defaultBranch?.address ?? so?.organizationName ?? '',
  );
  _dateIssued = TextEditingController(
    text: i?.dateIssued ?? _todayDate(widget.settlement?.settledAt),
  );
  // Căn cứ phiếu báo giá: prefill từ PDV (BUG-W02-062-A)
  _quoteRef = TextEditingController(
    text: i?.quoteReference?.code ?? _composeQuoteRef(widget.settlement),
  );

  // I. Bên ủy quyền (KH)
  _customerName = TextEditingController(
    text: i?.customer.name ?? widget.settlement?.customerName ?? so?.customerName ?? '',
  );
  _customerAddress = TextEditingController(text: i?.customer.address ?? '');
  // ... rest unchanged
}

static String _composeQuoteRef(SettlementDetailResponse? s) {
  if (s == null) return '';
  final code = s.serviceOrderCode ?? '';
  final createdAt = s.serviceOrder?.createdAt;
  if (code.isEmpty) return '';
  if (createdAt == null) return code;
  return '$code ngày ${DateFormat('dd/MM/yyyy').format(createdAt)}';
}
```

### Fix B — Same as BUG-W02-061-B

Fix tại `dossier_clause_list.dart` (shared widget) → cùng commit BUG-W02-061.

## 4. Touched Files

- `mobile/gf-garage-app/lib/ui/insurance_dossier/dossier_payment_authorization_screen.dart` (initState lines 65-117 — clean merge + add `_composeQuoteRef` helper)
- `mobile/gf-garage-app/lib/ui/insurance_dossier/widgets/dossier_clause_list.dart` (same fix as BUG-W02-061-B)

## 5. Don't-touch

- Form structure (`AuthorizationFormInput` model)
- Cubit `updateAuthorizationForm` logic
- Other prefill fields (`_customerInsuranceCert`, `_garagePhone`, etc. — already correct)

## 6. Regression Test (Proposed)

`bug_w02_062_guq_prefill_test.dart`:
```dart
testWidgets('GUQ prefill Căn cứ = PDV code + ngày tạo PDV', (tester) async {
  final settlement = _mockSettlement(
    serviceOrderCode: 'PDV-240426-01',
    serviceOrderCreatedAt: DateTime(2026, 4, 26),
  );
  await tester.pumpWidget(_pumpAuthorizationPage(settlement: settlement, initial: null));
  expect(find.text('PDV-240426-01 ngày 26/04/2026'), findsOneWidget);
});

testWidgets('GUQ clause list (Section IV) KHÔNG render "Nhập null"', (tester) async {
  await tester.pumpWidget(_pumpAuthorizationPage(
    initial: AuthorizationFormInput(commitmentClauses: [''])));
  expect(find.text('Nhập null'), findsNothing);
});
```

## 7. Blast Radius

- Initialization cleanup eliminates double-assignment bug (improves all 3 fields: placeIssued / dateIssued / quoteRef)
- Mobile-only
- No backend / contract impact

## 8. Apply Status (2026-06-24 update)

### Double-init cleanup (root cause of A symptom) — APPLIED in commit `72505b74`

`dossier_payment_authorization_screen.dart` lines 82-89 deleted (the OLD init block that overwrote new prefill block from commit 07a81322 "fix prefill from settlement code"). Added missing imports `injection_container.dart` (getIt) + `ui/main/bloc/profile_cubit.dart` (ProfileCubit). Same cherry-pick mishandling pattern as BUG-W02-061-B.

After cleanup, lines 75-79 prefill from `i?.placeIssued ?? defaultBranch?.address` / `i?.dateIssued ?? _todayDate(...)` / `i?.quoteReference?.code ?? widget.settlement?.code ?? widget.settlementCode` survives (no longer overwritten). `_quoteRef` now prefills from `widget.settlement?.code` fallback.

Verify: `fvm flutter analyze` 2 errors → 0 errors.

### Defect (A) — Prefill format helper `_composeQuoteRef` still PROPOSED

Current cleanup uses `widget.settlement?.code` (settlement code) as fallback. BA spec for "Căn cứ phiếu báo giá" wants `PDV code + ngày tạo PDV` formatted (e.g. "PDV-240426-01 ngày 24/04/2026"). To match BA spec, still need `_composeQuoteRef(settlement)` helper that uses `serviceOrderCode + DateFormat('dd/MM/yyyy').format(serviceOrder?.createdAt)`. Same status as BUG-W02-061-A pending apply.

### Defect (B) — APPLIED via BUG-W02-061 fix in same commit `72505b74`

Shared widget `dossier_clause_list.dart` cleanup resolves "Nhập null" placeholder issue for both BBNT (Mục 5) + GUQ (Section IV).

## 9. Status

PARTIAL RESOLVED:
- (B) clause list shared widget fixed in `72505b74`
- Double-init bug fixed in `72505b74` (root cause of A symptom — prefill now flows through)
- (A) PDV-format helper pending — needs separate apply for BA-exact format

Spec AC-7 field row addition ("Căn cứ phiếu báo giá") still requires separate BA CR — orthogonal to code fix.
