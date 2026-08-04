// W03 Mobile E2E — dual persona parity, concurrent-edit, cross-platform sync
// (mobile <-> "web" giả lập qua repository call trực tiếp — hành động phía
// "web" không thể lái browser thật từ agent này, nhưng Cross-Platform Parity
// Reference chỉ yêu cầu mobile E2E assert phần mobile-specific + end-state,
// KHÔNG duplicate happy path đã cover bên agent-test-e2e).
// TC map: TC-W03-ME2E-046, -048, -039, -040, -042
// (TC-038/041/043 cần data do WEB tạo trước — dùng chung cơ chế repository
//  call giả lập "web actor"; TC-044 network-observation + TC-047 session
//  expiry KHÔNG có harness khả dụng — xem Notes/BLOCKED trong report.)
// Cluster: C2/C3.
// Runner:
//   cd mobile/gf-garage-app
//   patrol test --flavor dev \
//     --target ../../Execution/auto/specs/W03/mobile-e2e/cross_cutting_patrol_test.dart \
//     -d emulator-5554
//
// NOTE: 1 file = 1 patrolTest (xem inventory_hub_patrol_test.dart header).

import 'package:cardoctor_garage_v3/core/models/inventory_catalog/material_group_models.dart';
import 'package:cardoctor_garage_v3/core/models/inventory_catalog/material_group_status.dart';
import 'package:cardoctor_garage_v3/core/repositories/inventory_catalog/inventory_catalog_repository.dart';
import 'package:cardoctor_garage_v3/injection_container.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:patrol/patrol.dart';

import './_helpers.dart';

void main() {
  patrolTest(
    'W03 Cross-cutting: TC-048 dual-persona, TC-046 concurrent-edit, TC-039+040+042 cross-platform sync (web-actor giả lập qua repository)',
    config: PatrolTesterConfig(
      visibleTimeout: const Duration(seconds: 25),
      settleTimeout: const Duration(seconds: 25),
    ),
    ($) async {
      final suffix = DateTime.now().millisecondsSinceEpoch.toString().substring(5);

      // ===== TC-W03-ME2E-048: dual persona (chủ garage) =====
      await loginAs($, phone: kOwnerPhone);
      // FIX (Run 5, spec-level): getIt<InventoryCatalogRepository>() PHẢI gọi
      // SAU loginAs() — DI container (injection_container.dart) chỉ được
      // populate sau khi bootstrapApp()->start() chạy xong (bên trong
      // loginAs()). Gọi getIt<...>() trước đó ném StateError "not registered
      // inside GetIt" (quan sát Run 5: test fail 0s ngay dòng đầu, KHÔNG
      // phải product bug — thứ tự spec sai).
      final repo = getIt<InventoryCatalogRepository>();
      await openInventoryHub($);
      await tapBounded($, find.textContaining('Nhóm vật tư'), label: 'autoFixA51', framesAfterTap: 7);

      final ownerCode = 'GRPOWN$suffix';
      await tapBounded($, find.text('Thêm nhóm vật tư'), label: 'autoFixA52', framesAfterTap: 4);
      var fields = find.byType(TextFormField);
      await $.tester.enterText(fields.at(0), ownerCode);
      await $.tester.enterText(fields.at(1), 'Nhom chu garage $suffix');
      await pumpFrames($, count: 3, label: 'autoFixC2_17');
      await tapBounded($, find.text('Lưu'), label: 'autoFixA53', framesAfterTap: 10);
      expect($.tester.any(find.text('Nhóm vật tư hàng hoá')), isTrue,
          reason: 'TC-048: chủ garage phải Create thành công y hệt kế toán (BR-CAT-CMN-003)');
      expect($.tester.any(find.textContaining(ownerCode)), isTrue);

      await tapBounded($, find.textContaining(ownerCode), label: 'autoFixA54', framesAfterTap: 7);
      await tapBounded($, find.text('Sửa'), label: 'autoFixA55', framesAfterTap: 4);
      var editFields = find.byType(TextFormField);
      await $.tester.enterText(editFields.at(1), 'Nhom chu garage da sua $suffix');
      await pumpFrames($, count: 3, label: 'autoFixC2_18');
      await tapBounded($, find.text('Lưu'), label: 'autoFixA56', framesAfterTap: 10);
      expect($.tester.any(find.text('Chi tiết nhóm vật tư hàng hoá')), isTrue,
          reason: 'TC-048: chủ garage Edit thành công');

      await tapBounded($, find.text('Xoá'), label: 'autoFixA57', framesAfterTap: 4);
      await tapBounded($, find.text('Xác nhận'), label: 'autoFixA58', framesAfterTap: 10);
      expect($.tester.any(find.textContaining(ownerCode)), isFalse,
          reason: 'TC-048: chủ garage Delete thành công (dual persona parity đủ CRUD)');

      // ===== TC-W03-ME2E-046: concurrent-edit mobile A / "web" B =====
      final concCode = 'GRPCONC$suffix';
      await tapBounded($, find.text('Thêm nhóm vật tư'), label: 'autoFixA59', framesAfterTap: 4);
      fields = find.byType(TextFormField);
      await $.tester.enterText(fields.at(0), concCode);
      await $.tester.enterText(fields.at(1), 'Nhom concurrent goc $suffix');
      await pumpFrames($, count: 3, label: 'autoFixC2_19');
      await tapBounded($, find.text('Lưu'), label: 'autoFixA60', framesAfterTap: 10);

      await tapBounded($, find.textContaining(concCode), label: 'autoFixA61', framesAfterTap: 7);
      await tapBounded($, find.text('Sửa'), label: 'autoFixA62', framesAfterTap: 4);
      // Mobile A: sửa tên (CHƯA Lưu).
      editFields = find.byType(TextFormField);
      await $.tester.enterText(editFields.at(1), 'Sua tu mobile $suffix');
      await pumpFrames($, count: 3, label: 'autoFixC2_20');

      // "web" B: sửa + lưu trước qua repository call trực tiếp (giả lập actor
      // thứ 2 — agent này không lái được browser thật, nhưng effect trên
      // backend giống hệt 1 session web thật ghi đè).
      final concSearch = await repo.searchMaterialGroups(
          SearchMaterialGroupsRequest(keyword: concCode, size: 5));
      final concMatch = concSearch.data?.content
          ?.where((g) => g.code == concCode)
          .toList();
      expect(concMatch, isNotNull);
      expect(concMatch!.isNotEmpty, isTrue);
      final concId = concMatch.first.id!;
      await repo.updateMaterialGroup(UpdateMaterialGroupRequest(
        id: concId,
        name: 'Sua tu web B truoc $suffix',
        status: MaterialGroupStatus.active,
      ));

      // Mobile A: tap Lưu sau (submit giá trị cũ đã pre-fill trước khi web B
      // lưu) — [spec-gap] không có optimistic-lock spec, chỉ assert app
      // KHÔNG crash + có phản hồi rõ ràng.
      await tapBounded($, find.text('Lưu'), label: 'autoFixA63', framesAfterTap: 10);
      final backOnDetail = $.tester.any(find.text('Chi tiết nhóm vật tư hàng hoá'));
      final stillOnEdit = $.tester.any(find.text('Chỉnh sửa Nhóm vật tư hàng hoá'));
      expect(backOnDetail || stillOnEdit, isTrue,
          reason:
              'TC-046: app phải ở 1 trong 2 trạng thái rõ ràng (Detail nếu last-write-wins thành công, hoặc vẫn ở Edit nếu server reject) — KHÔNG crash, KHÔNG treo màn hình trắng. backOnDetail=$backOnDetail stillOnEdit=$stillOnEdit (spec-gap: hành vi optimistic-lock cụ thể cần agent-test-api xác nhận contract)');

      // ===== TC-W03-ME2E-039/042: "web" tạo/sửa nhóm -> mobile pull-refresh thấy =====
      await tapAppBarBack($);
      await pumpFrames($, count: 4, label: 'autoFixC14');
      if (stillOnEdit) {
        await tapAppBarBack($);
        await pumpFrames($, count: 4, label: 'autoFixC15');
      }

      final webSyncCode = 'GRPWEBSYNC$suffix';
      final createResp = await repo.createMaterialGroup(CreateMaterialGroupRequest(
        code: webSyncCode,
        name: 'Nhom tao tu web $suffix',
      ));
      expect(createResp.success, isTrue,
          reason: 'TC-039 setup: "web" (repository call giả lập) tạo nhóm mới phải thành công');

      await $.tester.fling(find.byType(Scrollable).first, const Offset(0, 300), 800);
      await pumpFrames($, count: 10, label: 'autoFixC16');
      expect($.tester.any(find.textContaining(webSyncCode)), isTrue,
          reason: 'TC-039: mobile pull-to-refresh phải thấy nhóm do "web" tạo');

      // TC-042: "web" sửa nhóm đó -> mobile pull-refresh phản ánh tên mới.
      final newWebName = 'Ten da sua tu web $suffix';
      await repo.updateMaterialGroup(UpdateMaterialGroupRequest(
        id: createResp.data!.id!,
        name: newWebName,
        status: MaterialGroupStatus.active,
      ));
      await $.tester.fling(find.byType(Scrollable).first, const Offset(0, 300), 800);
      await pumpFrames($, count: 10, label: 'autoFixC17');
      expect($.tester.any(find.textContaining(newWebName)), isTrue,
          reason: 'TC-042: mobile List sau refresh phải phản ánh tên mới do "web" sửa (no stale cache)');

      await tapBounded($, find.textContaining(newWebName), label: 'autoFixA64', framesAfterTap: 7);
      expect($.tester.any(find.text(newWebName)), isTrue,
          reason: 'TC-042: Detail cũng phải phản ánh tên mới');

      // ===== TC-W03-ME2E-040: "web" xoá nhóm -> mobile List reload không còn thấy =====
      await tapAppBarBack($);
      await pumpFrames($, count: 4, label: 'autoFixC18');
      await repo.deleteMaterialGroup(createResp.data!.id!);
      await $.tester.fling(find.byType(Scrollable).first, const Offset(0, 300), 800);
      await pumpFrames($, count: 10, label: 'autoFixC19');
      expect($.tester.any(find.textContaining(webSyncCode)), isFalse,
          reason: 'TC-040: sau khi "web" xoá + mobile reload, nhóm không còn xuất hiện');
    },
  );
}
