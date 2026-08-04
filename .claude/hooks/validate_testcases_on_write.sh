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
