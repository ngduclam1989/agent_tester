#!/usr/bin/env bash
# ============================================================================
# validate-bugs-md.sh — lint wave bug registry (multi-wave, auto-detect schema)
# ----------------------------------------------------------------------------
# 2026-07-02: rewrite tổng quát, hỗ trợ 3 schema:
#   * W01 legacy 15 cột: Bug ID | Wave | Source TC | Feature | AC | Severity |
#                        Status | Title | Steps | Expected | Actual | Reporter |
#                        Assigned | Updated | Notes
#   * W02 slim 13 cột (Tracking/BUGS.md §3.2): Bug ID | Wave | Severity |
#                     Status | Title | Spec | Source TC | Reporter | Assigned |
#                     Related | Impact | Environment | Verify→Fix
#   * W03 slim 13 cột (custom): Bug ID | Severity | Status | FEAT | Boundary |
#                     Component | Title | Impact | Related | Source TC |
#                     Suspected | Reporter | Logged
#
# Wave auto-detect từ:
#   1. path arg (Tracking/WAVE{NN}/BUGS.md)
#   2. row đầu tiên (BUG-W{NN}-...)
#
# Checks (non-blocking — exit 0 clean, exit 1 nếu có violation FAIL):
#   1. Bug ID unique
#   2. Status ∈ canonical enum (INFO cho legacy alias)
#   3. P1 row PHẢI có L2 verify file (Tracking/WAVE{NN}/verify/BUG-W{NN}-NNN.verify.md
#      hoặc cluster file chứa NNN) — FAIL nếu thiếu
#   4. P2 OPEN nên có L2 verify file — WARN nếu thiếu (rule §3.3 recommendation)
#   5. Title (cột title) ≤ 200 ký tự — WARN nếu vượt (rule 27 chuẩn ≤ 120)
#   6. Cell Impact/Notes > 5000 chars → WARN (rule slim §3.2 recommendation)
#   7. Wave ID trong Bug ID khớp wave folder (BUG-W03-* phải nằm trong WAVE03/)
#
# Usage: ./validate-bugs-md.sh [path/to/BUGS.md]
# Default: Tracking/WAVE01/BUGS.md (backward compat)
# ============================================================================
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../../../.. && pwd)"
BUGS_MD="${1:-${REPO_ROOT}/Tracking/WAVE01/BUGS.md}"

# --- Detect wave từ path ---
WAVE=""
if [[ "${BUGS_MD}" =~ WAVE([0-9]+) ]]; then
  WAVE="${BASH_REMATCH[1]}"
fi
if [[ -z "${WAVE}" ]] && [[ -f "${BUGS_MD}" ]]; then
  first_id=$(grep -oE 'BUG-W[0-9]+' "${BUGS_MD}" | head -1)
  if [[ "${first_id}" =~ BUG-W([0-9]+) ]]; then
    WAVE="${BASH_REMATCH[1]}"
  fi
fi
if [[ -z "${WAVE}" ]]; then
  echo "ERROR: Không detect được wave từ path '${BUGS_MD}' hoặc nội dung file" >&2
  exit 2
fi

VERIFY_DIR="${REPO_ROOT}/Tracking/WAVE${WAVE}/verify"
BUG_PREFIX="BUG-W${WAVE}-"

CANONICAL_STATUSES=("OPEN" "ASSIGNED" "IN_FIX" "FIX_DONE" "VERIFY_PENDING" "VERIFIED" "REOPENED" "DEFERRED" "INVALID")
LEGACY_STATUSES=("FIXED" "RESOLVED" "VERIFIED-FIXED" "CLOSED" "IN_PROGRESS")

if [[ ! -f "${BUGS_MD}" ]]; then
  echo "ERROR: ${BUGS_MD} not found" >&2; exit 2
fi
if [[ ! -d "${VERIFY_DIR}" ]]; then
  echo "ERROR: ${VERIFY_DIR} not found" >&2; exit 2
fi

echo "=== validate-bugs-md.sh — WAVE${WAVE} ==="
echo "  File:        ${BUGS_MD}"
echo "  Verify dir:  ${VERIFY_DIR}"

violations=0
warnings=0

# --- Detect schema từ header row ---
HEADER=$(grep -m1 -E "^\| Bug ID" "${BUGS_MD}" || echo "")
SCHEMA="unknown"
SEV_COL=3; STATUS_COL=4; TITLE_COL=5; IMPACT_COL=11

if echo "${HEADER}" | grep -q "| Steps "; then
  SCHEMA="W01"
  SEV_COL=6; STATUS_COL=7; TITLE_COL=8; IMPACT_COL=15
elif echo "${HEADER}" | grep -q "| FEAT "; then
  SCHEMA="W03-custom"
  SEV_COL=2; STATUS_COL=3; TITLE_COL=7; IMPACT_COL=8
elif echo "${HEADER}" | grep -q "| Spec "; then
  SCHEMA="W02-slim"
  SEV_COL=3; STATUS_COL=4; TITLE_COL=5; IMPACT_COL=11
else
  echo "WARN: Không nhận diện schema từ header — dùng heuristic mặc định W02+"
fi
echo "  Schema:      ${SCHEMA} (sev@col${SEV_COL}, status@col${STATUS_COL}, title@col${TITLE_COL}, impact@col${IMPACT_COL})"

# Build verify-file index
verify_index=""
for f in "${VERIFY_DIR}"/*.verify.md; do
  [[ -f "$f" ]] || continue
  base="$(basename "$f" .verify.md)"
  verify_index+="$base"$'\n'
done

seen_ids=""

while IFS= read -r line; do
  [[ "${line}" == "| ${BUG_PREFIX}"* ]] || continue

  # Bỏ leading "| " và trailing " |"
  content="${line#| }"
  content="${content% |}"

  # Split theo " | " qua Python (robust, xử lý đúng escape/whitespace)
  read -r -a fields < <(python3 -c '
import sys
raw = sys.argv[1]
parts = raw.split(" | ")
print(" ".join([repr(p.strip()) for p in parts]))
' "${content}" 2>/dev/null | python3 -c '
import sys, ast
line = sys.stdin.read().strip()
if not line: sys.exit(0)
# Reconstruct list từ repr string
parts = []
for tok in line.split(" "):
    try:
        parts.append(ast.literal_eval(tok))
    except Exception:
        parts.append(tok)
# Print each on separate line for bash read -a
for p in parts:
    # escape special để bash không hiểu nhầm
    print(p.replace(" ", "\x1f"))
' 2>/dev/null)

  # Fallback nếu Python split fail
  if [[ "${#fields[@]}" -lt 3 ]]; then
    # Simple bash split (kém robust nhưng đủ dùng)
    IFS='|' read -r -a fields2 <<< "${content}"
    fields=()
    for f in "${fields2[@]}"; do
      trimmed="$(echo -n "${f}" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
      fields+=("${trimmed}")
    done
  fi

  ncols=${#fields[@]}
  if [[ "${ncols}" -lt "${SEV_COL}" ]]; then
    continue
  fi

  bug_id="${fields[0]//$'\x1f'/ }"
  severity="${fields[$((SEV_COL-1))]//$'\x1f'/ }"
  status="${fields[$((STATUS_COL-1))]//$'\x1f'/ }"
  title="${fields[$((TITLE_COL-1))]//$'\x1f'/ }"
  # Impact có thể ngoài giới hạn nếu row thiếu cột
  if [[ "${ncols}" -ge "${IMPACT_COL}" ]]; then
    impact="${fields[$((IMPACT_COL-1))]//$'\x1f'/ }"
  else
    impact=""
  fi

  # Check 1: duplicate ID
  if echo "${seen_ids}" | grep -qx "${bug_id}"; then
    echo "ERROR [duplicate]: ${bug_id} appears multiple times"
    violations=$((violations+1))
    continue
  fi
  seen_ids+="${bug_id}"$'\n'

  # Check 7: Wave ID match
  if [[ ! "${bug_id}" == "${BUG_PREFIX}"* ]]; then
    echo "ERROR [wave-mismatch]: ${bug_id} không thuộc WAVE${WAVE}"
    violations=$((violations+1))
    continue
  fi

  # Check 2: status enum
  is_canonical=false; is_legacy=false
  for s in "${CANONICAL_STATUSES[@]}"; do [[ "${status}" == "${s}" ]] && is_canonical=true; done
  for s in "${LEGACY_STATUSES[@]}"; do [[ "${status}" == "${s}" ]] && is_legacy=true; done

  if [[ "${is_canonical}" == "false" && "${is_legacy}" == "false" ]]; then
    echo "ERROR [status]: ${bug_id} has invalid status '${status}'"
    violations=$((violations+1))
  elif [[ "${is_legacy}" == "true" ]]; then
    echo "INFO  [legacy-status]: ${bug_id} uses legacy status '${status}' — canonical mapping ở Tracking/BUGS.md §5.1"
  fi

  # Check 3+4: L2 verify file
  nnn="${bug_id#${BUG_PREFIX}}"
  has_l2=false
  if echo "${verify_index}" | grep -q "^${bug_id}$"; then
    has_l2=true
  elif echo "${verify_index}" | grep -Eq "BUG-W${WAVE}-[0-9-]*${nnn}[-0-9]*cluster"; then
    has_l2=true
  fi

  if [[ "${severity}" == "P1" && "${has_l2}" == "false" ]]; then
    echo "ERROR [missing-L2-P1]: ${bug_id} (P1) lacks verify file"
    violations=$((violations+1))
  elif [[ "${severity}" == "P2" && "${status}" == "OPEN" && "${has_l2}" == "false" ]]; then
    echo "WARN  [missing-L2-P2]: ${bug_id} (P2 OPEN) nên có verify file (rule §3.3)"
    warnings=$((warnings+1))
  fi

  # Check 5: Title length ≤ 200
  title_len=${#title}
  if [[ ${title_len} -gt 200 ]]; then
    echo "WARN  [title-too-long]: ${bug_id} Title ${title_len} chars > 200 — rule 27 chuẩn ≤ 120"
    warnings=$((warnings+1))
  fi

  # Check 6: Impact/Notes > 5000
  impact_len=${#impact}
  if [[ ${impact_len} -gt 5000 ]]; then
    echo "WARN  [slim-needed]: ${bug_id} Impact/Notes ${impact_len} chars > 5000 — recommend move detail sang L2/L3"
    warnings=$((warnings+1))
  fi
done < "${BUGS_MD}"

# Summary
total_bugs=$(echo "${seen_ids}" | grep -c "^${BUG_PREFIX}" || true)
echo ""
echo "=== Summary ==="
echo "  Total bugs: ${total_bugs}"
echo "  Violations: ${violations}"
echo "  Warnings:   ${warnings}"

if [[ ${violations} -gt 0 ]]; then
  echo "VERDICT: FAIL"
  exit 1
fi
echo "VERDICT: PASS"
exit 0
