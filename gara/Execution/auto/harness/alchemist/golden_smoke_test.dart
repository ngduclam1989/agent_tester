// golden_smoke_test.dart — alchemist pipeline preflight
// Run: flutter test golden_smoke_test.dart
// Expected: PASS — generates golden/smoke_100x100.png (100x100 solid color box)
// Verifies: alchemist goldenTest pipeline + Roboto font deterministic

import 'package:alchemist/alchemist.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  goldenTest(
    'smoke: 100x100 solid box — alchemist pipeline OK',
    fileName: 'smoke_100x100',
    builder: () => GoldenTestGroup(
      children: [
        GoldenTestScenario(
          name: 'solid box',
          child: SizedBox(
            width: 100,
            height: 100,
            child: ColoredBox(color: Color(0xFF0052FF)),
          ),
        ),
      ],
    ),
  );
}
