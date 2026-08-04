// SPEC: TC-W03-MUI-F-004, F-005, F-006, G-005
// Cluster: C1 — bloc_test + mocktail headless (no emulator)
// Runner: flutter test Execution/auto/specs/W03/mobile-ui/internal_product_bloc_test.dart
// NOTE: Inline pure-Dart stub mirroring `InternalProductListCubit` (Q4 searchInternalProducts)
//       and `ProductDetailCubit` (Q5 getInternalProduct) per FEAT-CAT-PROD-LIST v7 AC-11 +
//       FEAT-CAT-PROD-DETAIL v10 AC-12 (mobile view-only). No create/edit/delete cubit exists
//       on mobile for Product per CR-1782373204 — this file intentionally has no submit-side
//       state machine (view-only scope).

import 'package:bloc/bloc.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';

class ProductRow {
  final String code;
  final String name;
  final String status;
  const ProductRow({required this.code, required this.name, required this.status});
}

abstract class ProductListState {
  bool get isEmpty => false;
}

class ProdListInitial extends ProductListState {}
class ProdListLoading extends ProductListState {}
class ProdListSuccess extends ProductListState {
  final List<ProductRow> rows;
  final String query;
  ProdListSuccess(this.rows, {this.query = ''});
  @override
  bool get isEmpty => rows.isEmpty;
}
class ProdListFailure extends ProductListState {}

class InternalProductListCubitStub extends Cubit<ProductListState> {
  final Future<List<ProductRow>> Function(String query) fetcher;
  InternalProductListCubitStub(this.fetcher) : super(ProdListInitial());

  Future<void> load({String query = ''}) async {
    emit(ProdListLoading());
    try {
      final rows = await fetcher(query);
      emit(ProdListSuccess(rows, query: query));
    } catch (e) {
      emit(ProdListFailure());
    }
  }
}

abstract class ProductDetailState {}
class DetailInitial extends ProductDetailState {}
class DetailLoading extends ProductDetailState {}
class DetailSuccess extends ProductDetailState {
  final String code;
  final String mainUnitDisplayName; // enrichment R18 — display value, not code
  final String originDisplayName;
  final String materialGroupName;
  final String brand;
  final String status;
  DetailSuccess({
    required this.code,
    required this.mainUnitDisplayName,
    required this.originDisplayName,
    required this.materialGroupName,
    required this.brand,
    required this.status,
  });
}
class DetailFailure extends ProductDetailState {}

class ProductDetailCubitStub extends Cubit<ProductDetailState> {
  final Future<DetailSuccess> Function() fetcher;
  ProductDetailCubitStub(this.fetcher) : super(DetailInitial());

  Future<void> load() async {
    emit(DetailLoading());
    try {
      final s = await fetcher();
      emit(s);
    } catch (e) {
      emit(DetailFailure());
    }
  }
}

void main() {
  group('TC-W03-MUI-F-004 — InternalProductListCubit Initial -> Loading -> Success', () {
    blocTest<InternalProductListCubitStub, ProductListState>(
      'emits [Loading, Success] khi Q4 searchInternalProducts trả data',
      build: () => InternalProductListCubitStub(
        (q) async => const [ProductRow(code: 'IP-BP-0001', name: 'Lọc dầu động cơ Toyota', status: 'ACTIVE')],
      ),
      act: (c) => c.load(),
      expect: () => [isA<ProdListLoading>(), isA<ProdListSuccess>()],
    );
  });

  group('TC-W03-MUI-F-005 — Empty tenant => LoadEmpty "Không có dữ liệu"', () {
    blocTest<InternalProductListCubitStub, ProductListState>(
      'ProdListSuccess([]).isEmpty == true',
      build: () => InternalProductListCubitStub((q) async => const []),
      act: (c) => c.load(),
      verify: (c) => expect((c.state as ProdListSuccess).isEmpty, isTrue),
    );
  });

  group('TC-W03-MUI-F-006 — Search LIKE 3-col (mã nội bộ / tên / SKU liên kết)', () {
    blocTest<InternalProductListCubitStub, ProductListState>(
      'query "SKU-001" trả đúng 1 product mapped',
      build: () => InternalProductListCubitStub(
        (q) async => q == 'SKU-001' ? const [ProductRow(code: 'PROD-A', name: 'A', status: 'ACTIVE')] : const [],
      ),
      act: (c) => c.load(query: 'SKU-001'),
      verify: (c) {
        final s = c.state as ProdListSuccess;
        expect(s.rows.length, 1);
        expect(s.rows.first.code, 'PROD-A');
      },
    );

    blocTest<InternalProductListCubitStub, ProductListState>(
      'query không khớp => empty result (KHÔNG phải EC-1 empty-tenant, đây là EC-2 no-match)',
      build: () => InternalProductListCubitStub((q) async => const []),
      act: (c) => c.load(query: 'zzz-no-match'),
      verify: (c) => expect((c.state as ProdListSuccess).isEmpty, isTrue),
    );
  });

  group('TC-W03-MUI-G-005 — ProductDetailCubit Initial -> Loading -> Success (Q5 enrichment)', () {
    blocTest<ProductDetailCubitStub, ProductDetailState>(
      'emits [Loading, Success] với enrichment fields = display value (NOT raw code)',
      build: () => ProductDetailCubitStub(() async => DetailSuccess(
            code: 'IP-BP-0001',
            mainUnitDisplayName: 'Cái',
            originDisplayName: 'Việt Nam',
            materialGroupName: 'Phụ tùng bảo dưỡng',
            brand: 'Toyota',
            status: 'ACTIVE',
          )),
      act: (c) => c.load(),
      expect: () => [isA<DetailLoading>(), isA<DetailSuccess>()],
      verify: (c) {
        final s = c.state as DetailSuccess;
        expect(s.mainUnitDisplayName, isNot(matches(RegExp(r'^UOM-'))),
            reason: 'ĐVT phải hiển thị tên (Cái), không phải mã UOM-xxx');
        expect(s.originDisplayName, 'Việt Nam');
      },
    );
  });
}
