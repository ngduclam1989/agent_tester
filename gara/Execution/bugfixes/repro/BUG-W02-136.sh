#!/usr/bin/env bash
# BUG-W02-136 persistent repro script
# Confirms: androidx.test:runner:1.6.2 vs {strictly 1.5.1} conflict in mobile/gf-garage-app
#
# Usage:
#   MOBILE_APP_DIR=/path/to/mobile/gf-garage-app bash BUG-W02-136.sh
#
# Expected (BUG present): Gradle error "Cannot resolve androidx.test:runner:1.6.2"
# Expected (BUG fixed):   BUILD SUCCESSFUL
#
# Filed: 2026-06-26 / Run 10 / agent-test-mobile-e2e
# Owner: agent-fix-garage-mobile (fix) / agent-test-mobile-e2e (verify)

set -euo pipefail

MOBILE_APP_DIR="${MOBILE_APP_DIR:-}"
DEVICE="${DEVICE:-emulator-5554}"
BFF_BASE_URL="${BFF_BASE_URL:-http://192.168.110.191:45401}"
PATROL_CLI="${PATROL_CLI:-/Users/all_engineer/.pub-cache/bin/patrol}"
SMOKE_SPEC="${SMOKE_SPEC:-/Users/all_engineer/Projects/lemn/garage-agentic-design/Execution/auto/specs/W02/mobile-e2e/harness_smoke_patrol_test.dart}"

if [[ -z "$MOBILE_APP_DIR" ]]; then
  # Auto-detect from common copy paths
  CANDIDATES=(
    "/Users/all_engineer/phinh/garage-agentic-design/mobile/gf-garage-app"
    "/Users/all_engineer/.Kaiser/garage-agentic-design/mobile/gf-garage-app"
    "/Users/all_engineer/congvn-mobile/garage-agentic-design/mobile/gf-garage-app"
    "/Users/all_engineer/lult/garage-agentic-design/mobile/gf-garage-app"
  )
  for c in "${CANDIDATES[@]}"; do
    if [[ -d "$c" ]]; then
      MOBILE_APP_DIR="$c"
      echo "[repro] Auto-detected mobile app dir: $MOBILE_APP_DIR"
      break
    fi
  done
fi

if [[ -z "$MOBILE_APP_DIR" || ! -d "$MOBILE_APP_DIR" ]]; then
  echo "[repro] ERROR: MOBILE_APP_DIR not found. Set MOBILE_APP_DIR env var."
  exit 1
fi

echo "=== BUG-W02-136 Repro Script ==="
echo "Date: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "Mobile app: $MOBILE_APP_DIR"
echo "Device: $DEVICE"
echo ""

# Step 1: Confirm the conflict-triggering line is present
BUILD_GRADLE="$MOBILE_APP_DIR/android/app/build.gradle"
echo "--- Step 1: Check build.gradle for conflicting runner version ---"
if grep -n "runner:1.6.2" "$BUILD_GRADLE"; then
  echo "[RESULT] CONFLICT LINE FOUND — bug present"
else
  echo "[RESULT] No runner:1.6.2 found — bug may be fixed (proceed to build verification)"
fi
echo ""

# Step 2: Check patrol 4.6.1 declares runner:1.5.1
PATROL_BUILD_GRADLE="$HOME/.pub-cache/hosted/pub.dev/patrol-4.6.1/android/build.gradle"
echo "--- Step 2: Check patrol 4.6.1 declares runner:1.5.1 ---"
if [[ -f "$PATROL_BUILD_GRADLE" ]]; then
  grep -n "runner" "$PATROL_BUILD_GRADLE" || echo "(no runner line found in patrol build.gradle)"
else
  echo "(patrol 4.6.1 build.gradle not found at $PATROL_BUILD_GRADLE)"
fi
echo ""

# Step 3: Run patrol build attempt
echo "--- Step 3: patrol test build attempt (expect BLOCKED if bug present) ---"
cd "$MOBILE_APP_DIR"
set +e
"$PATROL_CLI" test \
  --target "$SMOKE_SPEC" \
  --device "$DEVICE" \
  --flavor dev \
  --dart-define=BFF_BASE_URL="$BFF_BASE_URL" 2>&1 | grep -E "runner|BUILD|FAILED|SUCCESSFUL|Cannot resolve|strictly|processDevDebug" | head -40
BUILD_EXIT=$?
set -e

if [[ $BUILD_EXIT -ne 0 ]]; then
  echo ""
  echo "[RESULT] BUILD FAILED — BUG-W02-136 PRESENT (exit $BUILD_EXIT)"
  echo "Fix required: change line in android/app/build.gradle:"
  echo "  FROM: androidTestImplementation \"androidx.test:runner:1.6.2\""
  echo "  TO:   androidTestImplementation \"androidx.test:runner:1.5.1\""
  echo "  OR: remove the duplicate block (lines ~199-203 duplicate lines ~196-197)"
  exit 1
else
  echo ""
  echo "[RESULT] BUILD SUCCESSFUL — BUG-W02-136 FIXED"
  exit 0
fi
