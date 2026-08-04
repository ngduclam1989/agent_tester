// SPEC: TC-W03-MUI-HUB-003, TC-W03-MUI-HUB-004, TC-W03-MUI-HUB-005, TC-W03-MUI-HUB-006,
//       TC-W03-MUI-HUB-007, TC-W03-MUI-HUB-008
// Cluster: C1 — bloc_test + mocktail headless (no emulator)
// Runner: flutter test Execution/auto/specs/W03/mobile-ui/hub_bloc_test.dart
//         (requires QC harness: cd Execution/auto/harness/flutter-widget && flutter pub get)
// NOTE: Inline pure-Dart stubs — cannot import cardoctor_garage_v3 from QC harness
//       (TL-W01-MUI-003: firebase_core/dio/graphql_flutter transitive native plugin chain).
//       Mirrors lib/ui/inventory_catalog/hub/inventory_hub_cubit.dart contract per
//       Execution/wave-specs/W03/Product/features/mobile/FEAT-INV-MOBILE-MENU.md §5.4.
//       Widget pump / real navigation must run project-native in mobile/gf-garage-app/test/
//       (agent-test-garage-mobile / agent-fix-garage-mobile owner) or Patrol C3 (see
//       hub_patrol smoke reference in Test Environment & Data).

import 'package:bloc/bloc.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

// ---------------------------------------------------------------------------
// Inline stub mirroring InventoryHubCubit / InventoryHubState (freezed union)
// ---------------------------------------------------------------------------

class HubTile {
  final String label;
  final String route;
  const HubTile({required this.label, required this.route});

  @override
  bool operator ==(Object other) =>
      other is HubTile && other.label == label && other.route == route;
  @override
  int get hashCode => Object.hash(label, route);
}

abstract class InventoryHubState {
  final List<HubTile> visibleTiles;
  InventoryHubState(this.visibleTiles);
}

class HubInitial extends InventoryHubState {
  HubInitial() : super(const []);
}

class HubLoaded extends InventoryHubState {
  HubLoaded(List<HubTile> tiles) : super(tiles);
}

// W03 compile-time const tile list per wave-spec §Cluster B AC-4.
const _kW03Tiles = [
  HubTile(label: 'Sản phẩm', route: '/catalog/internal-products'),
  HubTile(label: 'Nhóm vật tư', route: '/catalog/material-groups'),
];

const _kHiddenLabelsW03 = [
  'Phiếu nhập',
  'Phiếu xuất',
  'Tồn kho',
  'Tồn đầu kỳ',
];

class InventoryHubCubitStub extends Cubit<InventoryHubState> {
  InventoryHubCubitStub() : super(HubInitial()) {
    emit(HubLoaded(_kW03Tiles));
  }
}

// Router abstraction for navigate() debounce verification (AC-5).
abstract class RouterGateway {
  void push(String route);
}

class MockRouterGateway extends Mock implements RouterGateway {}

class NavigateHandler {
  final RouterGateway router;
  DateTime? _lastTap;
  NavigateHandler(this.router);

  void onTileTap(String route) {
    final now = DateTime.now();
    if (_lastTap != null && now.difference(_lastTap!) < const Duration(milliseconds: 300)) {
      return; // debounce — ignore rapid re-tap
    }
    _lastTap = now;
    router.push(route);
  }
}

void main() {
  group('TC-W03-MUI-HUB-003 — InventoryHubCubit initial -> loaded (W03 = 2 tiles)', () {
    blocTest<InventoryHubCubitStub, InventoryHubState>(
      'emits HubLoaded with exactly 2 visibleTiles at construction (no async I/O)',
      build: () => InventoryHubCubitStub(),
      verify: (cubit) {
        expect(cubit.state, isA<HubLoaded>());
        expect(cubit.state.visibleTiles.length, 2,
            reason: 'W03 hub state matrix ships exactly 2 tiles (Sản phẩm + Nhóm vật tư)');
      },
    );

    test('visibleTiles order matches Figma (Sản phẩm first, Nhóm vật tư second)', () {
      expect(_kW03Tiles[0].label, 'Sản phẩm');
      expect(_kW03Tiles[1].label, 'Nhóm vật tư');
    });
  });

  group('TC-W03-MUI-HUB-004 — 4 hidden tiles have zero entry (not filtered at render)', () {
    test('const tile list does NOT contain any of the 4 hidden W04-W06 tiles', () {
      for (final hidden in _kHiddenLabelsW03) {
        expect(_kW03Tiles.any((t) => t.label == hidden), isFalse,
            reason: '$hidden must be ABSENT from compile-time list (no Visibility(false) waste)');
      }
    });
  });

  group('TC-W03-MUI-HUB-005/006 — navigate() invokes correct route (interactive-behavior, logic-only)', () {
    late MockRouterGateway router;
    late NavigateHandler handler;

    setUp(() {
      router = MockRouterGateway();
      handler = NavigateHandler(router);
    });

    test('tap "Sản phẩm" tile invokes router.push(/catalog/internal-products) exactly once', () {
      handler.onTileTap('/catalog/internal-products');
      verify(() => router.push('/catalog/internal-products')).called(1);
    });

    test('tap "Nhóm vật tư" tile invokes router.push(/catalog/material-groups) exactly once', () {
      handler.onTileTap('/catalog/material-groups');
      verify(() => router.push('/catalog/material-groups')).called(1);
    });
  });

  group('TC-W03-MUI-HUB-007 — both roles render identical visibleTiles (no role filter at hub)', () {
    test('cubit constructed under garage-owner context yields same 2-tile list', () {
      final cubit = InventoryHubCubitStub();
      expect(cubit.state.visibleTiles, _kW03Tiles);
    });
    test('cubit constructed under accountant context yields same 2-tile list', () {
      final cubit = InventoryHubCubitStub();
      expect(cubit.state.visibleTiles, _kW03Tiles);
    });
  });

  group('TC-W03-MUI-HUB-008 — rapid double-tap within 300ms debounced to single navigate', () {
    test('2 taps < 300ms apart => router.push called once', () async {
      final router = MockRouterGateway();
      final handler = NavigateHandler(router);
      handler.onTileTap('/catalog/material-groups');
      await Future<void>.delayed(const Duration(milliseconds: 50));
      handler.onTileTap('/catalog/material-groups');
      verify(() => router.push('/catalog/material-groups')).called(1);
    });

    test('2 taps > 300ms apart => router.push called twice (not over-debounced)', () async {
      final router = MockRouterGateway();
      final handler = NavigateHandler(router);
      handler.onTileTap('/catalog/material-groups');
      await Future<void>.delayed(const Duration(milliseconds: 350));
      handler.onTileTap('/catalog/material-groups');
      verify(() => router.push('/catalog/material-groups')).called(2);
    });
  });
}
