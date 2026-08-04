// smoke_test.dart — harness preflight verify
// Run: flutter test smoke_test.dart
// Expected: PASS (no emulator needed)
// Verifies: flutter_test + MaterialApp pump basic

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('smoke: MaterialApp pumps and finds Text', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Center(child: Text('Garage Mobile UI Harness OK')),
        ),
      ),
    );
    expect(find.text('Garage Mobile UI Harness OK'), findsOneWidget);
  });
}
