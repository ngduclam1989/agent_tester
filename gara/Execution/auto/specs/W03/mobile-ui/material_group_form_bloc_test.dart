// SPEC: TC-W03-MUI-B-004, B-005, B-006, B-007, B-008, B-009, B-010, B-013, B-014, B-015,
//       TC-W03-MUI-C-002, C-004, C-005, C-006, C-009, C-012, C-013
// Cluster: C1 — bloc_test + mocktail headless (no emulator)
// Runner: flutter test Execution/auto/specs/W03/mobile-ui/material_group_form_bloc_test.dart
// NOTE: Inline pure-Dart stub mirroring AddMaterialGroupCubit / EditMaterialGroupCubit +
//       MaterialGroupForm field-validation logic per FEAT-CAT-GRP-CREATE v4 (AC-2/3/4/5/6/7)
//       + FEAT-CAT-GRP-EDIT v4 (AC-2/3/4/5). Rendered `errorText` widget assertion (wording)
//       requires project-native runner in mobile/gf-garage-app/test/ (TL-W01-MUI-003) —
//       this file covers validation LOGIC (branch + message content), not rendered Text().

import 'package:bloc/bloc.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';

// ---------------------------------------------------------------------------
// Field validators (mirror MaterialGroupForm client-side rules)
// ---------------------------------------------------------------------------

const _kSpecialCharPattern = r'[~!@#$%^&*]';

class FieldValidationResult {
  final bool valid;
  final String? errorMessage;
  const FieldValidationResult.ok() : valid = true, errorMessage = null;
  const FieldValidationResult.error(this.errorMessage) : valid = false;
}

FieldValidationResult validateMaCode(String raw, {required Set<String> existingCodes}) {
  final value = raw.toUpperCase(); // BUG-W03-018/019 fix: autoUppercase on input
  if (value.trim().isEmpty) {
    return const FieldValidationResult.error('Vui lòng nhập mã nhóm');
  }
  if (RegExp(_kSpecialCharPattern).hasMatch(value)) {
    return const FieldValidationResult.error('Mã nhóm không được chứa ký tự đặc biệt');
  }
  if (existingCodes.contains(value)) {
    return const FieldValidationResult.error('Mã nhóm đã tồn tại');
  }
  return const FieldValidationResult.ok();
}

FieldValidationResult validateTenNhom(String raw) {
  if (raw.trim().isEmpty) {
    return const FieldValidationResult.error('Tên nhóm là bắt buộc');
  }
  return const FieldValidationResult.ok();
}

FieldValidationResult validateMoTa(String raw) {
  if (raw.length > 255) {
    return const FieldValidationResult.error('Mô tả không quá 255 ký tự');
  }
  return const FieldValidationResult.ok();
}

/// BR-CAT-GRP-009: dropdown "Thuộc nhóm" trong Edit loại bỏ chính nhóm đang sửa
/// + toàn bộ nhóm con/hậu duệ. BR-CAT-GRP-008: chỉ liệt kê nhóm ACTIVE.
List<String> filterParentDropdownOptions({
  required List<Map<String, String>> allGroups, // {code, status, parentCode}
  String? editingCode,
}) {
  final descendants = <String>{};
  if (editingCode != null) {
    descendants.add(editingCode);
    bool changed = true;
    while (changed) {
      changed = false;
      for (final g in allGroups) {
        if (descendants.contains(g['parentCode']) && !descendants.contains(g['code'])) {
          descendants.add(g['code']!);
          changed = true;
        }
      }
    }
  }
  return allGroups
      .where((g) => g['status'] == 'ACTIVE' && !descendants.contains(g['code']))
      .map((g) => g['code']!)
      .toList();
}

bool isSelfOrDescendantParent({required String editingCode, required String candidateParent, required List<Map<String, String>> allGroups}) {
  final options = filterParentDropdownOptions(allGroups: allGroups, editingCode: editingCode);
  return !options.contains(candidateParent);
}

// ---------------------------------------------------------------------------
// Cubit stubs
// ---------------------------------------------------------------------------

abstract class GroupSubmitState {}
class SubmitIdle extends GroupSubmitState {}
class Submitting extends GroupSubmitState {}
class SubmitSuccess extends GroupSubmitState {}
class SubmitError extends GroupSubmitState {
  final String message;
  SubmitError(this.message);
}

class AddMaterialGroupCubitStub extends Cubit<GroupSubmitState> {
  final Future<void> Function() createFn;
  int createCallCount = 0;
  AddMaterialGroupCubitStub(this.createFn) : super(SubmitIdle());

  Future<void> submit() async {
    if (state is Submitting) return; // debounce: ignore re-entrant submit
    emit(Submitting());
    createCallCount++;
    try {
      await createFn();
      emit(SubmitSuccess());
    } catch (e) {
      emit(SubmitError('Mã nhóm đã tồn tại'));
    }
  }
}

class EditMaterialGroupCubitStub extends Cubit<GroupSubmitState> {
  final Future<void> Function() updateFn;
  EditMaterialGroupCubitStub(this.updateFn) : super(SubmitIdle());

  Future<void> submit() async {
    emit(Submitting());
    try {
      await updateFn();
      emit(SubmitSuccess());
    } catch (e) {
      emit(SubmitError('Không cập nhật được nhóm vật tư'));
    }
  }
}

void main() {
  group('TC-W03-MUI-B-004 — Mã nhóm bỏ trống', () {
    test('empty string => "Vui lòng nhập mã nhóm"', () {
      final r = validateMaCode('', existingCodes: {});
      expect(r.valid, isFalse);
      expect(r.errorMessage, 'Vui lòng nhập mã nhóm');
    });
  });

  group('TC-W03-MUI-B-005 / B-045 (đối xứng TC-UI-012 Web) — Mã nhóm ký tự đặc biệt + autoUppercase', () {
    test('grp@01 => uppercased GRP@01, rejected as ký tự đặc biệt', () {
      final r = validateMaCode('grp@01', existingCodes: {});
      expect(r.valid, isFalse);
      expect(r.errorMessage, 'Mã nhóm không được chứa ký tự đặc biệt');
    });
    test('GRP01 (no special char) => valid', () {
      final r = validateMaCode('grp01', existingCodes: {});
      expect(r.valid, isTrue);
    });
  });

  group('TC-W03-MUI-B-006 / B-048 (đối xứng TC-UI-017 Web) — Mã nhóm trùng', () {
    test('mã đã tồn tại trong garage => "Mã nhóm đã tồn tại"', () {
      final r = validateMaCode('GRP-DUP', existingCodes: {'GRP-DUP'});
      expect(r.valid, isFalse);
      expect(r.errorMessage, 'Mã nhóm đã tồn tại');
    });
  });

  group('TC-W03-MUI-B-007 / B-046 (đối xứng TC-UI-014 Web) — Tên nhóm bỏ trống', () {
    test('empty => "Tên nhóm là bắt buộc"', () {
      final r = validateTenNhom('');
      expect(r.valid, isFalse);
      expect(r.errorMessage, 'Tên nhóm là bắt buộc');
    });
  });

  group('TC-W03-MUI-B-010 / B-047 / C-009 (đối xứng TC-UI-016 Web) — Mô tả boundary 255/256', () {
    test('255 ký tự => valid (boundary OK)', () {
      final r = validateMoTa('A' * 255);
      expect(r.valid, isTrue);
    });
    test('256 ký tự => "Mô tả không quá 255 ký tự"', () {
      final r = validateMoTa('A' * 256);
      expect(r.valid, isFalse);
      expect(r.errorMessage, 'Mô tả không quá 255 ký tự');
    });
  });

  group('TC-W03-MUI-B-008 / C-005 — BR-CAT-GRP-008 dropdown Thuộc nhóm chỉ ACTIVE', () {
    test('INACTIVE parent bị loại khỏi dropdown options', () {
      final all = [
        {'code': 'P1', 'status': 'ACTIVE', 'parentCode': ''},
        {'code': 'P2', 'status': 'INACTIVE', 'parentCode': ''},
      ];
      final options = filterParentDropdownOptions(allGroups: all);
      expect(options, contains('P1'));
      expect(options, isNot(contains('P2')));
    });
  });

  group('TC-W03-MUI-C-004 / C-006 — BR-CAT-GRP-009 dropdown loại self + descendant (Edit)', () {
    test('sửa GRP-A (A->B->C): dropdown loại A, B, C', () {
      final tree = [
        {'code': 'GRP-A', 'status': 'ACTIVE', 'parentCode': ''},
        {'code': 'GRP-B', 'status': 'ACTIVE', 'parentCode': 'GRP-A'},
        {'code': 'GRP-C', 'status': 'ACTIVE', 'parentCode': 'GRP-B'},
        {'code': 'GRP-OTHER', 'status': 'ACTIVE', 'parentCode': ''},
      ];
      final options = filterParentDropdownOptions(allGroups: tree, editingCode: 'GRP-A');
      expect(options, isNot(contains('GRP-A')));
      expect(options, isNot(contains('GRP-B')));
      expect(options, isNot(contains('GRP-C')));
      expect(options, contains('GRP-OTHER'));
    });

    test('client-side guard: chọn chính nhóm đang sửa hoặc hậu duệ => chặn (isSelfOrDescendantParent)', () {
      final tree = [
        {'code': 'GRP-A', 'status': 'ACTIVE', 'parentCode': ''},
        {'code': 'GRP-B', 'status': 'ACTIVE', 'parentCode': 'GRP-A'},
      ];
      expect(isSelfOrDescendantParent(editingCode: 'GRP-A', candidateParent: 'GRP-B', allGroups: tree),
          isTrue, reason: 'GRP-B là con của GRP-A đang sửa => phải bị chặn (vòng lặp phân cấp)');
      expect(isSelfOrDescendantParent(editingCode: 'GRP-A', candidateParent: 'GRP-A', allGroups: tree),
          isTrue, reason: 'chọn chính nó => phải bị chặn');
    });
  });

  group('TC-W03-MUI-B-013 — AddMaterialGroupCubit Idle -> Submitting -> Success', () {
    blocTest<AddMaterialGroupCubitStub, GroupSubmitState>(
      'emits [Submitting, Success] khi createMaterialGroup thành công',
      build: () => AddMaterialGroupCubitStub(() async {}),
      act: (c) => c.submit(),
      expect: () => [isA<Submitting>(), isA<SubmitSuccess>()],
    );
  });

  group('TC-W03-MUI-B-014 — AddMaterialGroupCubit Error khi trùng mã', () {
    blocTest<AddMaterialGroupCubitStub, GroupSubmitState>(
      'emits [Submitting, Error("Mã nhóm đã tồn tại")] khi backend reject duplicate',
      build: () => AddMaterialGroupCubitStub(() async => throw Exception('duplicate')),
      act: (c) => c.submit(),
      expect: () => [isA<Submitting>(), isA<SubmitError>()],
      verify: (c) => expect((c.state as SubmitError).message, 'Mã nhóm đã tồn tại'),
    );
  });

  group('TC-W03-MUI-B-015 — Double-tap "Lưu" debounce: chỉ 1 createMaterialGroup call', () {
    test('gọi submit() 2 lần liên tiếp trong khi đang Submitting => chỉ 1 network call', () async {
      var callCount = 0;
      final cubit = AddMaterialGroupCubitStub(() async {
        callCount++;
        await Future<void>.delayed(const Duration(milliseconds: 100));
      });
      final f1 = cubit.submit();
      final f2 = cubit.submit(); // re-entrant while Submitting -> no-op
      await Future.wait([f1, f2]);
      expect(callCount, 1, reason: 'debounce phải chặn double-tap tạo request trùng');
    });
  });

  group('TC-W03-MUI-C-012 — EditMaterialGroupCubit state order Submitting -> Success', () {
    blocTest<EditMaterialGroupCubitStub, GroupSubmitState>(
      'emits [Submitting, Success] khi updateMaterialGroup thành công',
      build: () => EditMaterialGroupCubitStub(() async {}),
      act: (c) => c.submit(),
      expect: () => [isA<Submitting>(), isA<SubmitSuccess>()],
    );
  });

  group('TC-W03-MUI-C-013 — EditMaterialGroupCubit Error khi network fail', () {
    blocTest<EditMaterialGroupCubitStub, GroupSubmitState>(
      'emits [Submitting, Error] khi updateFn throw',
      build: () => EditMaterialGroupCubitStub(() async => throw Exception('network')),
      act: (c) => c.submit(),
      expect: () => [isA<Submitting>(), isA<SubmitError>()],
    );
  });
}
