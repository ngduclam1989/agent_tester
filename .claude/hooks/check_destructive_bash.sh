#!/usr/bin/env bash
# PreToolUse hook cho Bash — chặn lệnh phá hủy dữ liệu theo CLAUDE.md
# (rm -rf, DROP TABLE, DELETE FROM, Remove-Item -Recurse -Force) và yêu cầu
# xác nhận rõ ràng từ user thay vì để agent tự ý chạy.
set -euo pipefail

cmd=$(jq -r '.tool_input.command // empty')

pattern='rm[[:space:]]+(-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*|-[a-zA-Z]*f[a-zA-Z]*r[a-zA-Z]*|-r[[:space:]]+-f|-f[[:space:]]+-r|--recursive[[:space:]]+--force|--force[[:space:]]+--recursive)|drop[[:space:]]+table|delete[[:space:]]+from|remove-item[^|;&]*-recurse[^|;&]*-force'

if echo "$cmd" | grep -qiE "$pattern"; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: "Lệnh khớp pattern phá hủy dữ liệu theo CLAUDE.md (rm -rf / DROP TABLE / DELETE FROM / Remove-Item -Recurse -Force). Cần xác nhận rõ ràng từ user trước khi thực thi."
    }
  }'
else
  printf '{}'
fi
