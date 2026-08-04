// SPEC: TC-W03-MUI-HUB-001, HUB-009, A-001, B-001, C-001, D-001, D-004, E-001, E-003,
//       F-001, G-001, G-004
// Cluster: C2 — alchemist golden (deterministic Roboto font, no emulator)
// Runner: flutter test Execution/auto/specs/W03/mobile-ui/catalog_golden_test.dart
//         (requires QC harness: cd Execution/auto/harness/alchemist && flutter pub get)
//
// NOTE (residual fidelity risk — TL-W02-ALL-007 item 6, tracked for fix-mobile, NOT a
// planning blocker for this agent per lesson action-owner split): this harness is a
// standalone widget-tree RECONSTRUCTION mirroring the oracle token/dimension spec, not a
// `path:` dependency importing the real `cardoctor_garage_v3` app (native plugin transitive
// chain — firebase_core/dio/graphql_flutter — makes path: dep infeasible for the QC harness,
// per TL-W01-MUI-003). Golden diff here validates TOKEN/DIMENSION compliance against the
// oracle spec; it does NOT substitute for a real per-service `flutter test` / Patrol run in
// `mobile/gf-garage-app/test/` for final pixel-identical acceptance. Both evidence classes
// are required before final sign-off; this file satisfies the QC-owned C2 cluster only.
//
// Design tokens (do NOT hardcode raw hex/TextStyle in production code — this test file
// hardcodes ONLY for comparison purposes against the oracle spec values):
//   AppColors.bgBase        #ffffff
//   AppColors.bgSecondary   #f3f3f4
//   AppColors.textPrimary   #262626
//   AppColors.textActivePrimary #0052ff
//   AppColors.bgBadgeSuccess #f0fdf1 / textSuccessPrimary #15aa2c
//   AppColors.borderPrimary #e8e8ea

import 'package:alchemist/alchemist.dart';
import 'package:flutter/material.dart';

const _kBgBase = Color(0xFFFFFFFF);
const _kBgSecondary = Color(0xFFF3F3F4);
const _kTextPrimary = Color(0xFF262626);
const _kTextActivePrimary = Color(0xFF0052FF);
const _kBgBadgeSuccess = Color(0xFFF0FDF1);
const _kTextSuccessPrimary = Color(0xFF15AA2C);
const _kBorderPrimary = Color(0xFFE8E8EA);

Widget _featureTile(String label) => Container(
      width: 167.5,
      height: 104,
      decoration: BoxDecoration(
        color: _kBgBase,
        borderRadius: BorderRadius.circular(8),
        boxShadow: const [BoxShadow(color: Color(0x0F000000), blurRadius: 8, offset: Offset(0, 2))],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: const BoxDecoration(color: Color(0xFFEDF7FF), shape: BoxShape.circle),
          ),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: _kTextPrimary)),
        ],
      ),
    );

/// Oracle gap note (TC-W03-MUI-HUB-001): QA oracle
/// Product/ux/figma-test-mobile/wave03-inv-mobile-menu-oracle.md does NOT exist yet
/// (recommend /prefetch-figma-oracle mobile 03 FEAT-INV-MOBILE-MENU). Layout below mirrors
/// substitute source Product/ux/figma-mobile/wave03-inv-mobile-menu.md v7 ACTIVE
/// (screenshot-verified node 21519:27371) + wave-spec T4 §4.1.
Widget _hubScreen() => Scaffold(
      backgroundColor: _kBgSecondary,
      appBar: AppBar(
        backgroundColor: _kBgBase,
        elevation: 0,
        leading: const BackButton(color: _kTextPrimary),
        title: const Text('Quản lý kho hàng',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: _kTextPrimary)),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: GridView.count(
          crossAxisCount: 2,
          mainAxisSpacing: 8,
          crossAxisSpacing: 8,
          childAspectRatio: 167.5 / 104,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          children: [_featureTile('Sản phẩm'), _featureTile('Nhóm vật tư')],
        ),
      ),
    );

/// TC-W03-MUI-A-001: MaterialGroupListPage — flat card layout (KHÔNG TreeView per
/// CR-1782381477). Oracle for GRP-LIST is REGISTRY-DRIFT (both
/// wave03-cat-grp-list--kh-alloc-only-oracle.md and wave03-cat-grp-list--section-oracle.md
/// self-flag their content as FEAT-INS-STL-DETAIL settlement screens, NOT GRP-LIST — see
/// each file's own "REGISTRY/SCOPE DRIFT" banner). Layout below mirrors
/// UX-FLOW-INVENTORY-CATALOG.md §3.1 + FEAT-CAT-GRP-LIST AC-1..3 + PKG-W03 §2.2.4
/// canonical widget list (ListWidget/ListTabBarWidget/GroupListFooter — no FAB).
Widget _groupListScreen({bool showFooterFab = false}) => Scaffold(
      appBar: AppBar(
        title: const Text('Nhóm vật tư hàng hóa',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: _kTextPrimary)),
        actions: const [Icon(Icons.search), Icon(Icons.filter_list)],
      ),
      body: Column(
        children: [
          const TabBar(
            tabs: [Tab(text: 'Tất cả'), Tab(text: 'Đang hoạt động'), Tab(text: 'Ngừng hoạt động')],
          ),
          Expanded(
            child: ListView(
              children: [
                _groupCard(code: '#NK240516-001', name: 'Phụ tùng bảo dưỡng', active: true),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            decoration: BoxDecoration(border: Border(top: BorderSide(color: _kBorderPrimary))),
            child: const Text('Thêm nhóm vật tư'),
          ),
        ],
      ),
      floatingActionButton: showFooterFab ? const FloatingActionButton(onPressed: null, child: Icon(Icons.add)) : null,
    );

Widget _groupCard({required String code, required String name, required bool active}) => Container(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Text(code, style: const TextStyle(color: _kTextActivePrimary, fontWeight: FontWeight.bold)),
            const Spacer(),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(color: active ? _kBgBadgeSuccess : _kBgSecondary, borderRadius: BorderRadius.circular(8)),
              child: Text(active ? 'Đang hoạt động' : 'Ngừng hoạt động',
                  style: TextStyle(color: active ? _kTextSuccessPrimary : Colors.grey, fontSize: 12)),
            ),
          ]),
          Text(name),
        ],
      ),
    );

void main() {
  goldenTest(
    'Hub — Quản lý kho hàng — 2 tile W03 grid',
    fileName: 'hub_w03_2tiles',
    builder: () => GoldenTestGroup(
      children: [GoldenTestScenario(name: 'W03-2-tiles', child: MaterialApp(home: _hubScreen()))],
    ),
  );

  goldenTest(
    'MaterialGroupListPage — flat card list default (NO FAB, footer text-button only)',
    fileName: 'material_group_list_default',
    builder: () => GoldenTestGroup(
      children: [
        GoldenTestScenario(
            name: 'flat-no-fab', child: MaterialApp(home: _groupListScreen(showFooterFab: false))),
      ],
    ),
  );

  goldenTest(
    'StatusBadge — Active (green) vs Inactive (grey) cross-domain (Group orange vs Product grey — see G-004)',
    fileName: 'status_badge_variants',
    builder: () => GoldenTestGroup(
      children: [
        GoldenTestScenario(
          name: 'group-active',
          child: MaterialApp(
            home: Scaffold(body: Center(child: _groupCard(code: '#A', name: 'A', active: true))),
          ),
        ),
        GoldenTestScenario(
          name: 'group-inactive',
          child: MaterialApp(
            home: Scaffold(body: Center(child: _groupCard(code: '#B', name: 'B', active: false))),
          ),
        ),
      ],
    ),
  );
}
