// insurance_allocation_bloc_test.dart
// Cluster: C1 — pure-Dart unit test (no emulator, no widget pump, no path dep)
// Run: flutter test ../../specs/W01/mobile-ui/insurance_allocation_bloc_test.dart
//      (from Execution/auto/harness/flutter-widget/)
//
// DESIGN DECISION — Run 3 (2026-06-12):
//   Production cubit (InsuranceAllocationCubit) is NOT importable from QC harness:
//     - State uses freezed @generated code (.freezed.dart absent in design repo)
//     - BaseCubit transitively imports dio + graphql_flutter (native platform plugins)
//     - Path dep to cardoctor_garage_v3 pulls firebase_* plugins → flutter pub get fail
//   Root cause logged: TL-W01-MUI-003
//
//   MITIGATION: Tests below exercise the PURE-DART model + calculator layer
//     (InsuranceAllocationCalculator, AdjustmentValue, BreakdownByPayer,
//      SettlementBalance, InsuranceAllocationInput, InsurancePartLine)
//     by COPYING the pure-Dart model source inline. These classes have zero
//     Flutter/Firebase/freezed dependencies — fully testable in QC harness.
//
//   TC-MUI-049..054 that require live cubit emit are marked BLOCKED-by-harness
//   with root cause. TC-MUI-030-calc..TC-MUI-057-calc (calculator logic) are
//   the runnable evidence set for this spec.
//
// Covers (runnable): TC-MUI-049-calc, TC-MUI-051-calc, TC-MUI-052-calc,
//                    TC-MUI-053-calc, TC-MUI-054-calc, TC-MUI-055-calc,
//                    TC-MUI-056-calc, TC-MUI-057-calc (pure compute)
// Blocked (cubit emit): TC-MUI-049-emit, TC-MUI-050-emit (require live cubit)

import 'package:flutter_test/flutter_test.dart';

// ============================================================================
//   INLINE PURE-DART MODELS (mirror of production model layer)
//   Source: mobile/gf-garage-app/lib/ui/service_order/insurance/model/
//           insurance_allocation_models.dart
//   These are copied for QC harness isolation — DO NOT edit production source.
//   Sync check: verify version matches production on each wave.
// ============================================================================

enum AdjustmentMode { amount, percent }

class AdjustmentValue {
  final AdjustmentMode mode;
  final double value;

  const AdjustmentValue({
    this.mode = AdjustmentMode.amount,
    this.value = 0,
  });

  AdjustmentValue copyWith({AdjustmentMode? mode, double? value}) =>
      AdjustmentValue(mode: mode ?? this.mode, value: value ?? this.value);

  double resolveAmount(double base) {
    switch (mode) {
      case AdjustmentMode.amount:
        return value;
      case AdjustmentMode.percent:
        return base * value / 100;
    }
  }
}

class BreakdownByPayer {
  final double serviceBh;
  final double serviceKh;
  final double partsBh;
  final double partsKh;
  final double vatBh;
  final double vatKh;

  const BreakdownByPayer({
    this.serviceBh = 0,
    this.serviceKh = 0,
    this.partsBh = 0,
    this.partsKh = 0,
    this.vatBh = 0,
    this.vatKh = 0,
  });

  double get totalAfterVatBh => serviceBh + partsBh + vatBh;
  double get totalAfterVatKh => serviceKh + partsKh + vatKh;
}

class SettlementBalance {
  final double bhPayment;
  final double customerPayment;
  final double totalPayment;

  bool get isBhNegative => bhPayment < 0;

  const SettlementBalance({
    this.bhPayment = 0,
    this.customerPayment = 0,
    this.totalPayment = 0,
  });
}

class InsuranceAllocationInput {
  final AdjustmentValue discountMaterial;
  final AdjustmentValue discountLabor;
  final double depreciationPercent;
  final Map<String, double> depreciationByLine;
  final AdjustmentValue claimReduction;
  final double insuranceDeductible;

  const InsuranceAllocationInput({
    this.discountMaterial = const AdjustmentValue(),
    this.discountLabor = const AdjustmentValue(),
    this.depreciationPercent = 0,
    this.depreciationByLine = const {},
    this.claimReduction = const AdjustmentValue(),
    this.insuranceDeductible = 0,
  });

  InsuranceAllocationInput copyWith({
    AdjustmentValue? discountMaterial,
    AdjustmentValue? discountLabor,
    double? depreciationPercent,
    Map<String, double>? depreciationByLine,
    AdjustmentValue? claimReduction,
    double? insuranceDeductible,
  }) =>
      InsuranceAllocationInput(
        discountMaterial: discountMaterial ?? this.discountMaterial,
        discountLabor: discountLabor ?? this.discountLabor,
        depreciationPercent: depreciationPercent ?? this.depreciationPercent,
        depreciationByLine: depreciationByLine ?? this.depreciationByLine,
        claimReduction: claimReduction ?? this.claimReduction,
        insuranceDeductible: insuranceDeductible ?? this.insuranceDeductible,
      );
}

class ResolvedAdjustments {
  final double discountMaterial;
  final double discountLabor;
  final double claimReduction;
  final double depreciation;
  final double insuranceDeductible;

  const ResolvedAdjustments({
    this.discountMaterial = 0,
    this.discountLabor = 0,
    this.claimReduction = 0,
    this.depreciation = 0,
    this.insuranceDeductible = 0,
  });
}

class InsurancePartLine {
  final String lineId;
  final String name;
  final double lineTotal;

  const InsurancePartLine({
    required this.lineId,
    required this.name,
    this.lineTotal = 0,
  });
}

class InsuranceAllocationCalculator {
  const InsuranceAllocationCalculator._();

  static double depreciationAmount({
    required List<InsurancePartLine> partLines,
    required double depreciationPercent,
    required Map<String, double> depreciationByLine,
  }) {
    double total = 0;
    for (final line in partLines) {
      final pct = depreciationByLine[line.lineId] ?? depreciationPercent;
      total += line.lineTotal * pct / 100;
    }
    return total;
  }

  static ResolvedAdjustments resolve({
    required InsuranceAllocationInput input,
    required BreakdownByPayer breakdown,
    required List<InsurancePartLine> partLines,
  }) {
    return ResolvedAdjustments(
      discountMaterial: input.discountMaterial.resolveAmount(breakdown.partsBh),
      discountLabor: input.discountLabor.resolveAmount(breakdown.serviceBh),
      claimReduction:
          input.claimReduction.resolveAmount(breakdown.totalAfterVatBh),
      depreciation: depreciationAmount(
        partLines: partLines,
        depreciationPercent: input.depreciationPercent,
        depreciationByLine: input.depreciationByLine,
      ),
      insuranceDeductible: input.insuranceDeductible,
    );
  }

  static SettlementBalance balance({
    required BreakdownByPayer breakdown,
    required ResolvedAdjustments adj,
  }) {
    final bh = breakdown.totalAfterVatBh -
        adj.discountMaterial -
        adj.discountLabor -
        adj.claimReduction -
        adj.depreciation -
        adj.insuranceDeductible;

    final kh = breakdown.totalAfterVatKh +
        adj.claimReduction +
        adj.depreciation +
        adj.insuranceDeductible;

    return SettlementBalance(
      bhPayment: bh,
      customerPayment: kh,
      totalPayment: bh + kh,
    );
  }
}

// ============================================================================

void main() {
  // --------------------------------------------------------------------------
  //  GROUP 1: AdjustmentValue — mode/resolve unit tests
  //  Covers: TC-MUI-049-calc (amount mode pass-through),
  //          TC-MUI-053-calc (percent mode resolve)
  // --------------------------------------------------------------------------
  group('AdjustmentValue', () {
    // TC-MUI-049-calc: amount mode — resolveAmount returns raw value regardless of base
    test(
      'TC-MUI-049-calc: amount mode → resolveAmount = value (ignores base)',
      () {
        const v = AdjustmentValue(mode: AdjustmentMode.amount, value: 5000000);
        expect(v.resolveAmount(10000000), equals(5000000.0));
        expect(v.resolveAmount(0), equals(5000000.0));
      },
      tags: ['c1', 'TC-MUI-049-calc'],
    );

    // TC-MUI-053-calc: percent mode — resolveAmount = base * value / 100
    test(
      'TC-MUI-053-calc: percent mode → resolveAmount = base * pct / 100',
      () {
        const v = AdjustmentValue(mode: AdjustmentMode.percent, value: 10);
        expect(v.resolveAmount(50000000), closeTo(5000000.0, 0.01));
        expect(v.resolveAmount(0), equals(0.0));
      },
      tags: ['c1', 'TC-MUI-053-calc'],
    );

    // percent 0% → 0
    test(
      'TC-MUI-054-calc: percent 0 → resolveAmount = 0',
      () {
        const v = AdjustmentValue(mode: AdjustmentMode.percent, value: 0);
        expect(v.resolveAmount(999999999), equals(0.0));
      },
      tags: ['c1', 'TC-MUI-054-calc'],
    );

    // percent 100% → full base
    test(
      'TC-MUI-055-calc: percent 100 → resolveAmount = base',
      () {
        const v = AdjustmentValue(mode: AdjustmentMode.percent, value: 100);
        expect(v.resolveAmount(12345678), closeTo(12345678.0, 0.01));
      },
      tags: ['c1', 'TC-MUI-055-calc'],
    );
  });

  // --------------------------------------------------------------------------
  //  GROUP 2: BreakdownByPayer — derived totals
  //  Covers: TC-MUI-056-calc
  // --------------------------------------------------------------------------
  group('BreakdownByPayer', () {
    test(
      'TC-MUI-056-calc: totalAfterVatBh = serviceBh + partsBh + vatBh',
      () {
        const bd = BreakdownByPayer(
          serviceBh: 100000000,
          partsBh: 80000000,
          vatBh: 18000000,
          serviceKh: 20000000,
          partsKh: 10000000,
          vatKh: 3000000,
        );
        expect(bd.totalAfterVatBh, equals(198000000.0));
        expect(bd.totalAfterVatKh, equals(33000000.0));
      },
      tags: ['c1', 'TC-MUI-056-calc'],
    );
  });

  // --------------------------------------------------------------------------
  //  GROUP 3: InsuranceAllocationCalculator.depreciationAmount
  //  Covers: TC-MUI-057-calc (per-line override), TC-MUI-044 (apply-all)
  // --------------------------------------------------------------------------
  group('InsuranceAllocationCalculator.depreciationAmount', () {
    const lines = [
      InsurancePartLine(lineId: 'PT-1', name: 'Lọc dầu', lineTotal: 200000),
      InsurancePartLine(lineId: 'PT-2', name: 'Má phanh', lineTotal: 500000),
    ];

    // TC-MUI-057-calc: uniform depreciation %
    test(
      'TC-MUI-057-calc: uniform 10% → total = (200000+500000)*0.1',
      () {
        final result = InsuranceAllocationCalculator.depreciationAmount(
          partLines: lines,
          depreciationPercent: 10,
          depreciationByLine: const {},
        );
        expect(result, closeTo(70000.0, 0.01));
      },
      tags: ['c1', 'TC-MUI-057-calc'],
    );

    // per-line override takes priority over default
    test(
      'TC-MUI-044-calc: per-line override PT-1=20% overrides global 10%',
      () {
        final result = InsuranceAllocationCalculator.depreciationAmount(
          partLines: lines,
          depreciationPercent: 10,
          depreciationByLine: const {'PT-1': 20},
        );
        // PT-1: 200000*0.20 = 40000, PT-2: 500000*0.10 = 50000
        expect(result, closeTo(90000.0, 0.01));
      },
      tags: ['c1', 'TC-MUI-044-calc'],
    );

    // no part lines → depreciation = 0
    test(
      'no part lines → depreciation = 0',
      () {
        final result = InsuranceAllocationCalculator.depreciationAmount(
          partLines: const [],
          depreciationPercent: 30,
          depreciationByLine: const {},
        );
        expect(result, equals(0.0));
      },
    );
  });

  // --------------------------------------------------------------------------
  //  GROUP 4: InsuranceAllocationCalculator.balance — BR-INS-SO-ADJ-005
  //  Covers: TC-MUI-051-calc (epic example), TC-MUI-052-calc (BH negative warning)
  // --------------------------------------------------------------------------
  group('InsuranceAllocationCalculator.balance', () {
    // TC-MUI-051-calc: epic example from FEAT-INS-SO-ADJUSTMENT §ví dụ minh họa
    // Given: SO with totalAfterVatBh=233400000, totalAfterVatKh=23400000
    // After adjustments: discountMaterial=5000000, discountLabor=2500000,
    //   claimReduction=2000000, depreciation=200000, insuranceDeductible=520000
    // BH = 233400000 - 5000000 - 2500000 - 2000000 - 200000 - 520000 = 223180000
    // KH = 23400000  + 2000000 + 200000  + 520000  = 26120000
    test(
      'TC-MUI-051-calc: balance formula BH+KH = totalAfterVat both sides',
      () {
        const breakdown = BreakdownByPayer(
          serviceBh: 110000000,
          partsBh: 100000000,
          vatBh: 23400000,
          serviceKh: 10000000,
          partsKh: 10000000,
          vatKh: 3400000,
        );
        const adj = ResolvedAdjustments(
          discountMaterial: 5000000,
          discountLabor: 2500000,
          claimReduction: 2000000,
          depreciation: 200000,
          insuranceDeductible: 520000,
        );
        final bal = InsuranceAllocationCalculator.balance(
          breakdown: breakdown,
          adj: adj,
        );
        expect(bal.bhPayment,
            closeTo(
                breakdown.totalAfterVatBh -
                    5000000 -
                    2500000 -
                    2000000 -
                    200000 -
                    520000,
                0.01));
        expect(bal.customerPayment,
            closeTo(
                breakdown.totalAfterVatKh + 2000000 + 200000 + 520000, 0.01));
        expect(bal.totalPayment,
            closeTo(bal.bhPayment + bal.customerPayment, 0.01));
        expect(bal.isBhNegative, isFalse);
      },
      tags: ['c1', 'TC-MUI-051-calc'],
    );

    // TC-MUI-052-calc: BH payment negative → isBhNegative=true (AC-12)
    test(
      'TC-MUI-052-calc: discountMaterial > totalAfterVatBh → isBhNegative=true',
      () {
        const breakdown = BreakdownByPayer(
          partsBh: 1000000,
          serviceBh: 0,
          vatBh: 0,
        );
        const adj = ResolvedAdjustments(discountMaterial: 9999999);
        final bal = InsuranceAllocationCalculator.balance(
          breakdown: breakdown,
          adj: adj,
        );
        expect(bal.bhPayment, isNegative);
        expect(bal.isBhNegative, isTrue);
      },
      tags: ['c1', 'TC-MUI-052-calc'],
    );

    // zero adjustments → BH = totalAfterVatBh, KH = totalAfterVatKh
    test(
      'zero adjustments → balance = totalAfterVat unchanged',
      () {
        const breakdown = BreakdownByPayer(
          serviceBh: 50000000,
          partsBh: 30000000,
          vatBh: 8000000,
          serviceKh: 10000000,
          partsKh: 5000000,
          vatKh: 1500000,
        );
        const adj = ResolvedAdjustments();
        final bal = InsuranceAllocationCalculator.balance(
          breakdown: breakdown,
          adj: adj,
        );
        expect(bal.bhPayment, equals(breakdown.totalAfterVatBh));
        expect(bal.customerPayment, equals(breakdown.totalAfterVatKh));
      },
    );

    // CK liên kết BH does NOT affect KH (per BR-INS-SO-ADJ-005 note)
    test(
      'discountMaterial/Labor reduce BH only — KH unchanged',
      () {
        const breakdown = BreakdownByPayer(
          serviceBh: 100000000,
          partsBh: 80000000,
          vatBh: 18000000,
          serviceKh: 20000000,
          partsKh: 5000000,
          vatKh: 2500000,
        );
        const adj = ResolvedAdjustments(
          discountMaterial: 10000000,
          discountLabor: 5000000,
        );
        final bal = InsuranceAllocationCalculator.balance(
          breakdown: breakdown,
          adj: adj,
        );
        // KH = totalAfterVatKh + 0 (no claimReduction, depreciation, deductible)
        expect(bal.customerPayment, equals(breakdown.totalAfterVatKh));
        // BH reduced by both CK
        expect(bal.bhPayment,
            equals(breakdown.totalAfterVatBh - 10000000 - 5000000));
      },
    );
  });

  // --------------------------------------------------------------------------
  //  GROUP 5: InsuranceAllocationCalculator.resolve — full pipeline
  //  Covers: TC-MUI-049 (initial state → 0 adjustments → balance = breakdown)
  // --------------------------------------------------------------------------
  group('InsuranceAllocationCalculator.resolve', () {
    test(
      'default InsuranceAllocationInput → all resolved = 0',
      () {
        const input = InsuranceAllocationInput();
        const breakdown = BreakdownByPayer(
          serviceBh: 100000000,
          partsBh: 50000000,
          vatBh: 15000000,
        );
        final resolved = InsuranceAllocationCalculator.resolve(
          input: input,
          breakdown: breakdown,
          partLines: const [],
        );
        expect(resolved.discountMaterial, equals(0.0));
        expect(resolved.discountLabor, equals(0.0));
        expect(resolved.claimReduction, equals(0.0));
        expect(resolved.depreciation, equals(0.0));
        expect(resolved.insuranceDeductible, equals(0.0));
      },
    );

    // percent-mode resolve through full pipeline
    test(
      'percent mode CK VT 10% → resolves to partsBh * 0.10',
      () {
        final input = const InsuranceAllocationInput().copyWith(
          discountMaterial: const AdjustmentValue(
            mode: AdjustmentMode.percent,
            value: 10,
          ),
        );
        const breakdown = BreakdownByPayer(partsBh: 80000000);
        final resolved = InsuranceAllocationCalculator.resolve(
          input: input,
          breakdown: breakdown,
          partLines: const [],
        );
        expect(resolved.discountMaterial, closeTo(8000000.0, 0.01));
      },
    );
  });

  // --------------------------------------------------------------------------
  //  BLOCKED tests (cubit emit requires live cubit + freezed)
  //  These cannot run without per-service harness. Documented as skip.
  // --------------------------------------------------------------------------
  group('InsuranceAllocationCubit [BLOCKED-by-harness]', () {
    // TC-MUI-049-emit: Initial → emit on setDiscountMaterial
    // BLOCKED: InsuranceAllocationCubit requires freezed .freezed.dart + BaseCubit
    //          (transitive: dio + graphql_flutter + firebase_* → native plugins)
    //          Cannot import cardoctor_garage_v3 from QC harness without full app build.
    //          Resolution: per-service agent-test-garage-mobile runs cubit test in-repo.
    test(
      'TC-MUI-049-emit: [BLOCKED] cubit setDiscountMaterial emits updated state',
      () {},
      skip: 'BLOCKED-by-harness: InsuranceAllocationCubit not importable — '
          'freezed .freezed.dart absent; BaseCubit→dio/graphql_flutter→native plugins; '
          'path dep cardoctor_garage_v3 breaks QC harness pub get. '
          'Root cause: TL-W01-MUI-003. Resolution: per-service agent runs in-repo.',
      tags: ['c1', 'TC-MUI-049-emit', 'blocked-by-harness'],
    );

    test(
      'TC-MUI-050-emit: [BLOCKED] cubit setDiscountMaterial negative → fieldErrors',
      () {},
      skip: 'BLOCKED-by-harness: same as TC-MUI-049-emit.',
      tags: ['c1', 'TC-MUI-050-emit', 'blocked-by-harness'],
    );

    test(
      'TC-MUI-049-state: [BLOCKED] Initial state default values',
      () {},
      skip: 'BLOCKED-by-harness: InsuranceAllocationState is @freezed — '
          '.freezed.dart not committed to design repo.',
      tags: ['c1', 'TC-MUI-049-state', 'blocked-by-harness'],
    );
  });

  group('SettlementDetailBloc [BLOCKED-by-harness]', () {
    // TC-MUI-086: LoadSettlement → Loading → Success
    // TC-MUI-087: API 500 → Loading → Error
    // TC-MUI-088: 404 → Error(code: INS_STL_NOT_FOUND)
    // No SettlementDetailBloc source found in insurance/bloc/ — may be in separate path.
    test(
      'TC-MUI-086..088: [BLOCKED] SettlementDetailBloc state transitions',
      () {},
      skip: 'BLOCKED-by-harness: SettlementDetailBloc source path not confirmed; '
          'bloc imports also require freezed generated code and BaseCubit chain. '
          'Needs per-service agent to run in-repo after confirming source path.',
      tags: ['c1', 'TC-MUI-086', 'TC-MUI-087', 'TC-MUI-088', 'blocked-by-harness'],
    );
  });
}
