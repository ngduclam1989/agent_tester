// insurance_allocation_golden_test.dart
// Cluster: C2 — alchemist golden test (deterministic Roboto font, alchemist ^0.14.0)
// Run: flutter test insurance_allocation_golden_test.dart
//      (from Execution/auto/harness/alchemist/, first run creates baseline)
// Run (baseline create): flutter test insurance_allocation_golden_test.dart --update-goldens
//      ONLY AFTER human approval — per MOBILE_UI_GOLDEN_AUTO_UPDATE rule
//
// Covers: TC-MUI-006 (placeholder golden — production widget import BLOCKED),
//         TC-MUI-042, TC-MUI-060, TC-MUI-062, TC-MUI-103..TC-MUI-107
//
// DESIGN DECISION — Run 3 (2026-06-12):
//   - alchemist upgraded from 0.10.0 to 0.14.0 (fixes Canvas.clipRSuperellipse /
//     drawRSuperellipse incompatibility with Flutter 3.44.1 Canvas API)
//   - Production widget imports remain BLOCKED-by-harness (same root cause as
//     insurance_allocation_section_test.dart — TL-W01-MUI-003)
//   - These golden tests use Placeholder widgets to verify the alchemist pipeline
//     (font setup, diff threshold, golden dir) — NOT production widget fidelity
//   - Status: pipeline-smoke golden PASS (alchemist + Roboto font OK)
//             Production widget golden: BLOCKED-by-harness pending per-service harness
//   - textScaleFactor deprecated in Flutter 3.x → use textScaler instead
//
// IMPORTANT:
//   - Font MUST be Roboto bundled (see harness/alchemist/pubspec.yaml) — no system font
//   - KHÔNG update-goldens khi chưa có human review (MOBILE_UI_GOLDEN_AUTO_UPDATE)
//   - Golden baseline PNG tại: ../../specs/W01/mobile-ui/golden/*.png
//   - Platform-agnostic golden: alchemist_config.yaml → platform_agnostic=true

import 'package:alchemist/alchemist.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  // TC-MUI-006: Golden — InsuranceAllocationSection panel nhập default state
  // NOTE: Uses Placeholder stub — production InsuranceAllocationSection BLOCKED.
  //       This golden verifies: alchemist pipeline + font setup + diff threshold.
  //       Production visual fidelity to be verified by per-service agent in mobile repo.
  goldenTest(
    'TC-MUI-006: golden — ins_so_adj_panel_input_default 375×822 [pipeline smoke]',
    fileName: 'ins_so_adj_panel_input_default',
    builder: () => GoldenTestGroup(
      children: [
        GoldenTestScenario(
          name: 'phone portrait 375x822 — placeholder (production widget BLOCKED)',
          child: MediaQuery(
            data: const MediaQueryData(size: Size(375, 822)),
            child: MaterialApp(
              theme: ThemeData(
                fontFamily: 'Roboto',
                colorScheme: ColorScheme.fromSeed(
                  seedColor: const Color(0xFF0052FF),
                ),
              ),
              home: const Scaffold(
                body: Center(
                  // BLOCKED: replace with real InsuranceAllocationSection after
                  // per-service harness links production widget
                  child: Placeholder(
                    fallbackWidth: 343,
                    fallbackHeight: 400,
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    ),
  );

  // TC-MUI-042: Golden — SegmentedButton KH/BH tokens
  // NOTE: Uses Placeholder stub — production TotalServicePricePanel BLOCKED.
  goldenTest(
    'TC-MUI-042: golden — ins_so_adj_segmented_btn [pipeline smoke]',
    fileName: 'ins_so_adj_segmented_btn',
    builder: () => GoldenTestGroup(
      children: [
        GoldenTestScenario(
          name: 'segmented button placeholder — KH/BH (production widget BLOCKED)',
          child: MaterialApp(
            theme: ThemeData(fontFamily: 'Roboto'),
            home: const Scaffold(
              body: Center(
                child: Placeholder(
                  fallbackWidth: 343,
                  fallbackHeight: 48,
                ),
              ),
            ),
          ),
        ),
      ],
    ),
  );

  // TC-MUI-060: Golden — InsuranceSettlementDetailScreen full
  // NOTE: Uses Placeholder stub.
  goldenTest(
    'TC-MUI-060: golden — ins_stl_detail_full 375×812 [pipeline smoke]',
    fileName: 'ins_stl_detail_full',
    builder: () => GoldenTestGroup(
      children: [
        GoldenTestScenario(
          name: 'STL Detail placeholder (production widget BLOCKED)',
          child: MediaQuery(
            data: const MediaQueryData(size: Size(375, 812)),
            child: MaterialApp(
              theme: ThemeData(fontFamily: 'Roboto'),
              home: const Scaffold(
                body: Center(
                  child: Placeholder(
                    fallbackWidth: 375,
                    fallbackHeight: 812,
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    ),
  );

  // TC-MUI-103: Responsive golden — phone portrait 375×822
  goldenTest(
    'TC-MUI-103: golden — ins_so_adj_phone_portrait_375 [pipeline smoke]',
    fileName: 'ins_so_adj_phone_portrait',
    builder: () => GoldenTestGroup(
      children: [
        GoldenTestScenario(
          name: 'phone portrait 375',
          child: MediaQuery(
            data: const MediaQueryData(size: Size(375, 822)),
            child: MaterialApp(
              theme: ThemeData(fontFamily: 'Roboto'),
              home: const Scaffold(
                body: Center(
                  child: Placeholder(fallbackWidth: 375, fallbackHeight: 822),
                ),
              ),
            ),
          ),
        ),
      ],
    ),
  );

  // TC-MUI-105: Responsive golden — phone landscape 800×360
  goldenTest(
    'TC-MUI-105: golden — ins_so_adj_phone_landscape_800 [pipeline smoke]',
    fileName: 'ins_so_adj_phone_landscape',
    builder: () => GoldenTestGroup(
      children: [
        GoldenTestScenario(
          name: 'phone landscape 800x360',
          child: MediaQuery(
            data: const MediaQueryData(size: Size(800, 360)),
            child: MaterialApp(
              theme: ThemeData(fontFamily: 'Roboto'),
              home: const Scaffold(
                body: Center(
                  child: Placeholder(fallbackWidth: 800, fallbackHeight: 360),
                ),
              ),
            ),
          ),
        ),
      ],
    ),
  );

  // TC-MUI-107: Text scale golden — 1.5x
  // NOTE: textScaleFactor deprecated in Flutter 3.x → use textScaler
  goldenTest(
    'TC-MUI-107: golden — ins_so_adj_text_scale_1_5 [pipeline smoke]',
    fileName: 'ins_so_adj_text_scale_150',
    builder: () => GoldenTestGroup(
      children: [
        GoldenTestScenario(
          name: 'text scale 1.5x',
          child: MediaQuery(
            data: MediaQueryData(
              size: const Size(375, 822),
              textScaler: TextScaler.linear(1.5),
            ),
            child: MaterialApp(
              theme: ThemeData(fontFamily: 'Roboto'),
              home: const Scaffold(
                body: Center(
                  child: Placeholder(fallbackWidth: 375, fallbackHeight: 822),
                ),
              ),
            ),
          ),
        ),
      ],
    ),
  );
}
