#!/usr/bin/env bash
# Stop hook — dọn dẹp file tạm/debug ở workspace root + thư mục con cấp 1
# theo RULE_GLOBAL.md (mục "Cleanup Temp & Debug Files").
set -uo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$ROOT" || exit 0

PATTERNS=(
  "*_debug.txt" "debug_output.txt" "*_output.txt"
  "*.tmp" "*.temp"
  "page_snapshot.md" "snapshot_*.md"
  "dom_dump.txt" "html_dump.html"
  "network_requests.txt" "console_log.txt"
  "scratch_*.py" "scratch_*.js" "scratch_*.ts"
)

EXCLUDE_DIRS=(playwright-report test-results logs artifacts node_modules .git target build)

is_excluded() {
  local f="$1"
  for d in "${EXCLUDE_DIRS[@]}"; do
    case "$f" in
      "./$d/"*) return 0 ;;
    esac
  done
  case "$f" in
    ./package.json|./.gitignore|*.config.ts|*.config.js) return 0 ;;
  esac
  return 1
}

deleted=()
for pat in "${PATTERNS[@]}"; do
  while IFS= read -r -d '' f; do
    if ! is_excluded "$f"; then
      rm -f -- "$f" && deleted+=("$f")
    fi
  done < <(find . -maxdepth 2 -type f -name "$pat" -print0 2>/dev/null)
done

if [ "${#deleted[@]}" -gt 0 ]; then
  jq -n --arg m "🧹 Cleanup: đã xóa ${#deleted[@]} file tạm — $(IFS=,; echo "${deleted[*]}")" '{"systemMessage": $m}'
else
  printf '{}'
fi
