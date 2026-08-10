#!/usr/bin/env bash
# PostToolUse hook cho Write|Edit — mỗi khi 1 file khớp pattern
# practices/testcases/**/TC_*.md được ghi/sửa, tự động chạy
# scripts/validate_testcases/validate_tc.py để bắt lỗi traceability/
# sequence/summary-table consistency (xem skill rbt_manual_testing,
# mục "Traceability Coverage Audit" Bước 5 + Bước 6).
#
# Không block cứng — chỉ cảnh báo rõ ràng để agent tự sửa trước khi
# báo hoàn thành với user.
set -euo pipefail

cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

input=$(cat)
file=$(echo "$input" | jq -r '.tool_input.file_path // .tool_response.filePath // empty')

if [ -z "$file" ]; then
  printf '{}'
  exit 0
fi

base=$(basename -- "$file")
case "$file" in
  *practices/testcases/*)
    case "$base" in
      TC_*.md) ;;
      *) printf '{}'; exit 0 ;;
    esac
    ;;
  *) printf '{}'; exit 0 ;;
esac

if [ ! -f "scripts/validate_testcases/validate_tc.py" ]; then
  printf '{}'
  exit 0
fi

output=$(python3 scripts/validate_testcases/validate_tc.py "$file" 2>&1) && rc=0 || rc=$?

# Multi-file convention (tách file theo sub-module): nếu file vừa ghi là 1 file
# con (TC_[MODULE]-[SUBMODULE].md), file này còn được đối chiếu tổng số liệu/
# tính liên tục TC ID ở file rollup (TC_[MODULE].md) cùng thư mục. Quét các
# TC_*.md khác trong cùng thư mục: nếu file đó có bảng "Danh sách file con" và
# có nhắc tới tên file vừa ghi → coi là rollup của file này, validate luôn.
dir=$(dirname -- "$file")
for candidate in "$dir"/TC_*.md; do
  [ -f "$candidate" ] || continue
  [ "$candidate" = "$file" ] && continue
  if grep -qE '^\s*\|\s*File\s*\|\s*Sub-module\s*\|' "$candidate" 2>/dev/null \
     && grep -qF "$base" "$candidate" 2>/dev/null; then
    rollup_output=$(python3 scripts/validate_testcases/validate_tc.py "$candidate" 2>&1) && rollup_rc=0 || rollup_rc=$?
    output="$output

=== Rollup check ($candidate) — $base là file con của rollup này ===
$rollup_output"
    if [ "$rollup_rc" -ne 0 ]; then
      rc=$rollup_rc
    fi
  fi
done

if [ "$rc" -ne 0 ]; then
  jq -n --arg file "$file" \
        --arg msg "validate_tc.py phát hiện lỗi trong $file — xem chi tiết và tự sửa trước khi báo hoàn thành." \
        --arg out "$output" \
        '{
          systemMessage: $msg,
          hookSpecificOutput: {
            hookEventName: "PostToolUse",
            additionalContext: ("validate_tc.py FAIL cho " + $file + "\n\nOutput:\n" + $out)
          }
        }'
else
  printf '{}'
fi
