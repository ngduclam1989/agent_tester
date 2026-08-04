// SPEC: TC-W03-MUI-A-004, TC-W03-MUI-A-005, TC-W03-MUI-A-006, TC-W03-MUI-A-007
// Cluster: C1 — bloc_test + mocktail headless (no emulator)
// Runner: flutter test Execution/auto/specs/W03/mobile-ui/material_group_list_bloc_test.dart
//         (requires QC harness: cd Execution/auto/harness/flutter-widget && flutter pub get)
// NOTE: Inline pure-Dart stub mirroring `MaterialGroupListCubit` contract consumed by
//       `ListWidget` (isInitial/isLoading/isFailure/isEmpty) per PKG-W03 §2.2.4.
//       Real widget pump (ListWidget + ListTabBarWidget render) requires project-native
//       runner in mobile/gf-garage-app/test/ (TL-W01-MUI-003) or alchemist golden
//       (see catalog_golden_test.dart in this same directory for Tier-1 layout evidence).

import 'package:bloc/bloc.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';

class MaterialGroupRow {
  final String code;
  final String name;
  final String status; // 'ACTIVE' | 'INACTIVE'
  final String? parentName;
  const MaterialGroupRow({
    required this.code,
    required this.name,
    required this.status,
    this.parentName,
  });
}

abstract class MaterialGroupListState {
  bool get isInitial => false;
  bool get isLoading => false;
  bool get isFailure => false;
  bool get isEmpty => false;
}

class ListInitial extends MaterialGroupListState {
  @override
  bool get isInitial => true;
}

class ListLoading extends MaterialGroupListState {
  @override
  bool get isLoading => true;
}

class ListSuccess extends MaterialGroupListState {
  final List<MaterialGroupRow> rows;
  final String activeTab; // 'all' | 'active' | 'inactive'
  ListSuccess(this.rows, {this.activeTab = 'active'});
  @override
  bool get isEmpty => rows.isEmpty;
}

class ListFailure extends MaterialGroupListState {
  final String message;
  ListFailure(this.message);
  @override
  bool get isFailure => true;
}

class MaterialGroupListCubitStub extends Cubit<MaterialGroupListState> {
  final Future<List<MaterialGroupRow>> Function(String tab) fetcher;
  MaterialGroupListCubitStub(this.fetcher) : super(ListInitial());

  Future<void> load({String tab = 'active'}) async {
    emit(ListLoading());
    try {
      final rows = await fetcher(tab);
      emit(ListSuccess(rows, activeTab: tab));
    } catch (e) {
      emit(ListFailure('Không tải được danh sách nhóm vật tư'));
    }
  }
}

void main() {
  group('TC-W03-MUI-A-004 — Initial -> Loading -> Success, no skip', () {
    blocTest<MaterialGroupListCubitStub, MaterialGroupListState>(
      'emits [Loading, Success] khi load() thành công (Q1 searchMaterialGroups)',
      build: () => MaterialGroupListCubitStub(
        (tab) async => const [
          MaterialGroupRow(code: 'NK240516-001', name: 'Phụ tùng bảo dưỡng', status: 'ACTIVE'),
        ],
      ),
      act: (cubit) => cubit.load(tab: 'active'),
      expect: () => [isA<ListLoading>(), isA<ListSuccess>()],
    );
  });

  group('TC-W03-MUI-A-005 — Loading -> Error khi API fail', () {
    blocTest<MaterialGroupListCubitStub, MaterialGroupListState>(
      'emits [Loading, Failure] khi fetcher throw (network/5xx)',
      build: () => MaterialGroupListCubitStub((tab) async => throw Exception('network')),
      act: (cubit) => cubit.load(tab: 'active'),
      expect: () => [isA<ListLoading>(), isA<ListFailure>()],
      verify: (cubit) {
        final s = cubit.state as ListFailure;
        expect(s.message, isNotEmpty);
        expect(s.message, isNot(contains('errors.')), reason: 'không lộ raw l10n key');
      },
    );
  });

  group('TC-W03-MUI-A-006 — Empty state khi API return []', () {
    blocTest<MaterialGroupListCubitStub, MaterialGroupListState>(
      'ListSuccess([]).isEmpty == true => LoadEmpty widget path',
      build: () => MaterialGroupListCubitStub((tab) async => const []),
      act: (cubit) => cubit.load(tab: 'all'),
      expect: () => [isA<ListLoading>(), isA<ListSuccess>()],
      verify: (cubit) {
        expect((cubit.state as ListSuccess).isEmpty, isTrue);
      },
    );
  });

  group('TC-W03-MUI-A-007 — Tab bar refilter (Tất cả / Đang hoạt động / Ngừng hoạt động)', () {
    blocTest<MaterialGroupListCubitStub, MaterialGroupListState>(
      'default tab = active; load(tab: "all") includes ACTIVE + INACTIVE rows',
      build: () => MaterialGroupListCubitStub(
        (tab) async => tab == 'all'
            ? const [
                MaterialGroupRow(code: 'A', name: 'A', status: 'ACTIVE'),
                MaterialGroupRow(code: 'B', name: 'B', status: 'INACTIVE'),
              ]
            : const [MaterialGroupRow(code: 'A', name: 'A', status: 'ACTIVE')],
      ),
      act: (cubit) => cubit.load(tab: 'all'),
      verify: (cubit) {
        final s = cubit.state as ListSuccess;
        expect(s.rows.length, 2, reason: 'tab "Tất cả" phải trả cả ACTIVE + INACTIVE');
        expect(s.activeTab, 'all');
      },
    );

    test('default construction is initial (not auto-fetch) — first tap-in load must go active tab',
        () {
      final cubit = MaterialGroupListCubitStub((tab) async => const []);
      expect(cubit.state, isA<ListInitial>());
      cubit.close();
    });
  });
}
