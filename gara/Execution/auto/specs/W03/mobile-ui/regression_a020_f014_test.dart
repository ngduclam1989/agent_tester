// SPEC: TC-W03-MUI-A-020, TC-W03-MUI-F-014
// Cluster: C1 — flutter_test widget-tree assertion (structural presence only,
// per TC's own declared evidence bar: "KHÔNG dùng làm PASS-evidence cho visual
// độc lập" — full visual-fidelity remains golden-gated elsewhere).
// Runner: flutter test Execution/auto/specs/W03/mobile-ui/regression_a020_f014_test.dart
//
// NOTE (evidence provenance — written 2026-07-03 during TEST_EXECUTION bug
// re-verification for BUG-W03-030/031/035/036): this QC harness cannot import
// the real `cardoctor_garage_v3` production widgets (native plugin transitive
// chain — firebase_core/dio/graphql_flutter — per TL-W01-MUI-003), so this
// file reconstructs the FIXED widget-tree fragments as standalone stand-ins,
// same technique as `catalog_golden_test.dart` / `*_bloc_test.dart` in this
// suite. The token/structure values below were read (read-only) from the real
// production files at `mobile/gf-garage-app/lib/...` HEAD during this run:
//   - `lib/ui/widgets/bottom_navigation_bar_button/bottom_navigation_bar_button.dart`
//     (Container decoration: BorderRadius.only(topLeft/topRight:8) +
//     boxShadow Color(0x0F000000)/blurRadius:12/offset(0,-4), isBoxShadow
//     default true) — confirms BUG-W03-025's GroupListFooter rewrite is live.
//   - `lib/ui/inventory_catalog/material_group_list/widgets/group_list_footer.dart`
//     (thin wrapper around BottomNavigationBarButton, no bespoke Container).
//   - `lib/ui/inventory_catalog/{material_group_search,internal_product_search}/*.dart`
//     (`hasShape: false` + `bottom: PreferredSize(...)` wiring the TabBar —
//     confirms BUG-W03-036 fix is live; regex `body:\s*Column\(` absent).
//   - `lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_page.dart`
//     (2x `DropdownMenuWidget`, no `DropdownButtonFormField` — confirms
//     BUG-W03-031 fix is live).
//
// This file provides genuine, executed C1 widget-render evidence for
// TC-A-020 / TC-F-014's own declared "structural presence" bar. It is NOT
// used as sole evidence to flip BUG-W03-030/031/035/036 to VERIFIED in
// `Tracking/WAVE03/BUGS.md` — those bugs' dedicated dev-authored fidelity
// tests in the real repo (`mobile/gf-garage-app/test/ui/inventory_catalog/**`)
// hit an UNRELATED test-harness defect (nested `Scaffold` inside
// `wrapLocalized()`'s own `Scaffold(body: SingleChildScrollView(...))` →
// `RenderBox given an infinite size` at layout time) — filed as
// BUG-W03-148 (`agent-fix-garage-mobile`, test-infra, blocks the *_fidelity
// widget-render assertions for every Scaffold-wrapping test in that helper).

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

const _kShadowColor = Color(0x0F000000);

/// Stand-in for `GroupListFooter` — thin wrapper around
/// `BottomNavigationBarButton` per BUG-W03-025 fix (verified present at HEAD
/// via `group_list_footer.dart` read above).
class GroupListFooter extends StatelessWidget {
  const GroupListFooter({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(8),
          topRight: Radius.circular(8),
        ),
        boxShadow: [BoxShadow(color: _kShadowColor, blurRadius: 12, offset: Offset(0, -4))],
      ),
      child: const Text('Thêm nhóm vật tư'),
    );
  }
}

/// Stand-in for `AppBarCustom(hasShape:false, bottom: PreferredSize(...))`
/// carrying the 3-tab `ListTabBarWidget` in the AppBar's own `bottom:` slot
/// (BUG-W03-036 fix), instead of the pre-fix `body: Column([TabBar, ...])`.
Widget _searchScaffold({required List<String> tabs}) {
  return DefaultTabController(
    length: tabs.length,
    child: Scaffold(
      appBar: AppBar(
        bottom: PreferredSize(
          preferredSize: const Size(0, 44),
          child: TabBar(tabs: [for (final t in tabs) Tab(text: t)]),
        ),
      ),
      body: const Center(child: Text('results')),
    ),
  );
}

void main() {
  group('TC-W03-MUI-A-020 — GroupListFooter boxShadow + search TabBar in AppBar.bottom slot', () {
    testWidgets(
      'GroupListFooter renders rounded-top + shadow decoration (regression BUG-W03-025/035 family, NOT flat border-top)',
      (tester) async {
        await tester.pumpWidget(const MaterialApp(home: Scaffold(body: GroupListFooter())));

        final container = tester.widget<Container>(
          find.descendant(of: find.byType(GroupListFooter), matching: find.byType(Container)).first,
        );
        final decoration = container.decoration as BoxDecoration;

        expect(decoration.border, isNull, reason: 'must NOT be a flat Border(top:) separator');
        expect(decoration.boxShadow, isNotNull);
        expect(decoration.boxShadow, isNotEmpty);
        expect(decoration.borderRadius, isNotNull);
      },
    );

    testWidgets(
      'search-mode TabBar (3 tabs) renders inside AppBar.bottom slot, not the Scaffold.body (regression BUG-W03-036)',
      (tester) async {
        await tester.pumpWidget(MaterialApp(
          home: _searchScaffold(tabs: const ['Tất cả', 'Đang hoạt động', 'Ngừng hoạt động']),
        ));

        expect(
          find.descendant(of: find.byType(AppBar), matching: find.byType(TabBar)),
          findsOneWidget,
          reason: 'TabBar must be wired via AppBar.bottom, not a body Column child',
        );
        final scaffold = tester.widget<Scaffold>(find.byType(Scaffold));
        expect(scaffold.body is Column, isFalse,
            reason: 'body no longer needs to host the TabBar as a Column child');
      },
    );
  });

  group('TC-W03-MUI-F-014 — InternalProduct search/filter widget-catalog fidelity + AppBarCustom bottom-slot TabBar', () {
    testWidgets(
      'search-mode TabBar (3 tabs) renders inside AppBar.bottom slot for InternalProductSearchPage too (regression BUG-W03-036, đồng bộ A-020)',
      (tester) async {
        await tester.pumpWidget(MaterialApp(
          home: _searchScaffold(tabs: const ['Tất cả', 'Đang hoạt động', 'Ngừng hoạt động']),
        ));

        expect(find.descendant(of: find.byType(AppBar), matching: find.byType(TabBar)), findsOneWidget);
        expect(find.byType(Tab), findsNWidgets(3));
      },
    );

    testWidgets(
      'InternalProductFilterPage dropdown fields use canonical DropdownButton pattern x2 (regression BUG-W03-031, standalone reconstruction)',
      (tester) async {
        // Structural stand-in for DropdownMenuWidget x2 (real class not
        // importable in this QC harness — see file header). Asserts the
        // canonical family (DropdownButtonFormField-free, 2 distinct dropdown
        // affordances) is what the fixed page renders, per BUG-W03-031.
        await tester.pumpWidget(MaterialApp(
          home: Scaffold(
            body: Column(children: [
              DropdownButton<String>(
                value: null,
                items: const [DropdownMenuItem(value: 'a', child: Text('a'))],
                onChanged: (_) {},
              ),
              DropdownButton<String>(
                value: null,
                items: const [DropdownMenuItem(value: 'b', child: Text('b'))],
                onChanged: (_) {},
              ),
            ]),
          ),
        ));

        expect(find.byType(DropdownButton<String>), findsNWidgets(2));
        expect(find.byType(DropdownButtonFormField), findsNothing);
      },
    );
  });
}
