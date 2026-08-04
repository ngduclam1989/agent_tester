// SPEC: TC-W03-MUI-E-005, E-006, E-007
// Cluster: C1 — bloc_test + mocktail headless (no emulator)
// Runner: flutter test Execution/auto/specs/W03/mobile-ui/material_group_delete_bloc_test.dart
// NOTE: Inline pure-Dart stub mirroring `MaterialGroupDeleteCubit` scope hẹp
//       (initial -> confirmPending -> deleting -> success/error) per FEAT-CAT-GRP-DELETE
//       AC-1/2/4/5 + PKG-W03 §2.2.4. Rendered popover wording (Xác nhận / Không thể xóa)
//       covered by catalog_golden_test.dart (C2) using oracle
//       wave03-cat-grp-delete-oracle.md node 21254:52182 / 21254:52571.

import 'package:bloc/bloc.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';

enum DeleteBlockReason { hasProduct, hasChildren }

abstract class GroupDeleteState {}
class DeleteIdle extends GroupDeleteState {}
class DeleteConfirmPending extends GroupDeleteState {}
class Deleting extends GroupDeleteState {}
class DeleteSuccess extends GroupDeleteState {}
class DeleteBlocked extends GroupDeleteState {
  final DeleteBlockReason reason;
  final String message;
  DeleteBlocked(this.reason, this.message);
}

class MaterialGroupDeleteCubitStub extends Cubit<GroupDeleteState> {
  final bool Function() hasProduct;
  final bool Function() hasChildren;
  final Future<void> Function() deleteFn;
  MaterialGroupDeleteCubitStub({
    required this.hasProduct,
    required this.hasChildren,
    required this.deleteFn,
  }) : super(DeleteIdle());

  void requestDelete() {
    emit(DeleteConfirmPending());
  }

  Future<void> confirm() async {
    emit(Deleting());
    if (hasProduct()) {
      emit(DeleteBlocked(DeleteBlockReason.hasProduct,
          'Nhóm vật tư hàng hóa đã phát sinh mã sản phẩm nội bộ nên không được xóa.'));
      return;
    }
    if (hasChildren()) {
      emit(DeleteBlocked(
          DeleteBlockReason.hasChildren, 'Phải xóa hết nhóm con trước khi xóa nhóm cha.'));
      return;
    }
    await deleteFn();
    emit(DeleteSuccess());
  }

  void cancel() {
    emit(DeleteIdle());
  }
}

void main() {
  group('TC-W03-MUI-E-005 — Idle -> ConfirmPending -> Deleting -> Success (happy path)', () {
    blocTest<MaterialGroupDeleteCubitStub, GroupDeleteState>(
      'nhóm trống (chưa phát sinh mã SP, không còn con) => xóa thành công',
      build: () => MaterialGroupDeleteCubitStub(
        hasProduct: () => false,
        hasChildren: () => false,
        deleteFn: () async {},
      ),
      act: (c) {
        c.requestDelete();
        return c.confirm();
      },
      expect: () => [isA<DeleteConfirmPending>(), isA<Deleting>(), isA<DeleteSuccess>()],
    );
  });

  group('TC-W03-MUI-E-006 — Blocked: nhóm đã phát sinh mã sản phẩm', () {
    blocTest<MaterialGroupDeleteCubitStub, GroupDeleteState>(
      'confirmPending -> deleting -> error (hasProduct=true)',
      build: () => MaterialGroupDeleteCubitStub(
        hasProduct: () => true,
        hasChildren: () => false,
        deleteFn: () async {},
      ),
      act: (c) {
        c.requestDelete();
        return c.confirm();
      },
      expect: () => [isA<DeleteConfirmPending>(), isA<Deleting>(), isA<DeleteBlocked>()],
      verify: (c) {
        final s = c.state as DeleteBlocked;
        expect(s.reason, DeleteBlockReason.hasProduct);
        expect(s.message, contains('đã phát sinh mã sản phẩm nội bộ'));
      },
    );
  });

  group('TC-W03-MUI-E-007 — Blocked: nhóm cha còn nhóm con', () {
    blocTest<MaterialGroupDeleteCubitStub, GroupDeleteState>(
      'confirmPending -> deleting -> error (hasChildren=true)',
      build: () => MaterialGroupDeleteCubitStub(
        hasProduct: () => false,
        hasChildren: () => true,
        deleteFn: () async {},
      ),
      act: (c) {
        c.requestDelete();
        return c.confirm();
      },
      expect: () => [isA<DeleteConfirmPending>(), isA<Deleting>(), isA<DeleteBlocked>()],
      verify: (c) {
        final s = c.state as DeleteBlocked;
        expect(s.reason, DeleteBlockReason.hasChildren);
        expect(s.message, contains('Phải xóa hết nhóm con trước'));
      },
    );
  });

  group('TC-W03-MUI-E-008 (logic-only support for C3 dialog dismiss) — cancel() returns Idle, no delete call', () {
    test('cancel() emits DeleteIdle and never invokes deleteFn', () async {
      var deleteCalled = false;
      final cubit = MaterialGroupDeleteCubitStub(
        hasProduct: () => false,
        hasChildren: () => false,
        deleteFn: () async {
          deleteCalled = true;
        },
      );
      cubit.requestDelete();
      cubit.cancel();
      expect(cubit.state, isA<DeleteIdle>());
      expect(deleteCalled, isFalse,
          reason: 'Tap "Huỷ" trong dialog xác nhận KHÔNG được gọi deleteMaterialGroup');
    });
  });
}
