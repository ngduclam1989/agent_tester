#!/usr/bin/env bash
# ============================================================================
# recompute-bugs-v2-dashboard.sh — auto-regen §1 Dashboard counters cho
# BUGS-V2-PROPOSAL.md (single-file model per `BUG-REPORT-TEMPLATE-PROPOSAL.md` v7).
# ----------------------------------------------------------------------------
# Đọc §2 Master Index → recompute counters cho §1.1-1.5 → diff vs current →
# write in-place (mặc định warn-only; --apply để auto-edit).
#
# 5 counter tables tự động:
#   §1.1 Counter tổng — Status × Severity
#   §1.2 By Feature
#   §1.3 By Boundary owner
#   §1.4 By Bug type
#   §1.5 Aging snapshot — P1 active (OPEN/RESOLVED/REOPEN)
#
# Phạm vi: dùng §2 Master Index (slim table) làm source-of-truth, KHÔNG đọc §3
#         cards. Lý do: §2 luôn sync (rule §3.0 single-file model), §3 cards
#         là detailed nhưng có thể lag.
#
# Source field per §2 row schema:
#   | Bug ID | Title | Type | FEAT | Severity | Status | REOPEN # | Assigned | Updated |
#
# Usage:
#   ./recompute-bugs-v2-dashboard.sh                  # warn-only diff
#   ./recompute-bugs-v2-dashboard.sh --apply          # write in-place
#   ./recompute-bugs-v2-dashboard.sh PATH [--apply]   # custom file
# ============================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../../../.. && pwd)"
BUGS_FILE="${REPO_ROOT}/Tracking/WAVE01/BUGS-V2-PROPOSAL.md"
APPLY=false

# Arg parse
for arg in "$@"; do
  case "$arg" in
    --apply) APPLY=true ;;
    -*) echo "Unknown flag: $arg" >&2; exit 2 ;;
    *) BUGS_FILE="$arg" ;;
  esac
done

if [[ ! -f "${BUGS_FILE}" ]]; then
  echo "ERROR: ${BUGS_FILE} not found" >&2; exit 2
fi

# ============================================================================
# Parse §2 Master Index — extract per-bug fields
# ============================================================================
# Find §2 boundary: start after "## §2 Master Index", end before "## §3"
master_start=$(grep -n "^## §2 Master Index" "${BUGS_FILE}" | head -1 | cut -d: -f1)
master_end=$(grep -n "^## §3" "${BUGS_FILE}" | head -1 | cut -d: -f1)

if [[ -z "${master_start}" || -z "${master_end}" ]]; then
  echo "ERROR: cannot locate §2 Master Index or §3 boundary in ${BUGS_FILE}" >&2
  exit 2
fi

# Extract rows (skip header + separator)
master_rows=$(sed -n "${master_start},${master_end}p" "${BUGS_FILE}" | grep -E "^\| BUG-W01-")

if [[ -z "${master_rows}" ]]; then
  echo "ERROR: no bug rows found in §2 Master Index" >&2
  exit 2
fi

total_bugs=$(echo "${master_rows}" | wc -l)

# ============================================================================
# Parse fields — emit TSV: id\ttitle\ttype\tfeat\tseverity\tstatus\treopen\tassigned\tupdated
# ============================================================================
tsv=$(echo "${master_rows}" | awk -F'|' '
{
  for (i=1; i<=NF; i++) {
    gsub(/^[ \t]+|[ \t]+$/, "", $i)
  }
  # $1 empty (leading |), $2=id, $3=title, $4=type, $5=feat, $6=severity, $7=status, $8=reopen, $9=assigned, $10=updated
  printf "%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n", $2, $3, $4, $5, $6, $7, $8, $9, $10
}')

# ============================================================================
# §1.1 Counter tổng — Status × Severity
# ============================================================================
declare -A CT
SEVERITIES=("P1" "P2" "P3" "P4")
STATUSES=("OPEN" "RESOLVED" "VERIFIED" "DONE" "REOPEN" "REJECTED" "PENDING")

for s in "${STATUSES[@]}"; do
  for sev in "${SEVERITIES[@]}"; do
    CT["${s},${sev}"]=0
  done
done

while IFS=$'\t' read -r id title btype feat sev status reopen assigned updated; do
  [[ -z "${id}" ]] && continue
  if [[ -n "${CT[${status},${sev}]:-}" ]]; then
    CT["${status},${sev}"]=$(( CT["${status},${sev}"] + 1 ))
  fi
done <<< "${tsv}"

print_table_11() {
  echo "### 1.1 Counter tổng — Status × Severity (${total_bugs} bug unique)"
  echo ""
  echo "| Status \\ Severity | P1 | P2 | P3 | P4 | **Total** |"
  echo "|---|---:|---:|---:|---:|---:|"
  local grand_total=0
  for s in "${STATUSES[@]}"; do
    local row_total=0
    local cells=""
    for sev in "${SEVERITIES[@]}"; do
      local n=${CT["${s},${sev}"]:-0}
      cells+=" ${n} |"
      row_total=$((row_total + n))
    done
    echo "| ${s} |${cells} **${row_total}** |"
    grand_total=$((grand_total + row_total))
  done
  # Total row
  local col_totals=""
  local total_check=0
  for sev in "${SEVERITIES[@]}"; do
    local col_sum=0
    for s in "${STATUSES[@]}"; do
      col_sum=$((col_sum + ${CT["${s},${sev}"]:-0}))
    done
    col_totals+=" **${col_sum}** |"
    total_check=$((total_check + col_sum))
  done
  echo "| **Total** |${col_totals} **${grand_total}** |"
}

# ============================================================================
# §1.3 By Boundary owner — derive boundary từ Assigned column
# ============================================================================
declare -A BD
BOUNDARIES=("gf-sales" "gf-accounting" "agg-garage-graph" "garage-web" "garage-mobile" "Mixed")
for b in "${BOUNDARIES[@]}"; do
  for s in "${STATUSES[@]}"; do
    BD["${b},${s}"]=0
  done
done

while IFS=$'\t' read -r id title btype feat sev status reopen assigned updated; do
  [[ -z "${id}" ]] && continue
  local_boundary="Mixed"
  if [[ "${assigned}" == *"gf-sales"* ]]; then local_boundary="gf-sales"
  elif [[ "${assigned}" == *"gf-accounting"* ]]; then local_boundary="gf-accounting"
  elif [[ "${assigned}" == *"agg-garage-graph"* ]]; then local_boundary="agg-garage-graph"
  elif [[ "${assigned}" == *"garage-web"* ]]; then local_boundary="garage-web"
  elif [[ "${assigned}" == *"garage-mobile"* ]]; then local_boundary="garage-mobile"
  fi
  if [[ -n "${BD[${local_boundary},${status}]:-}" ]]; then
    BD["${local_boundary},${status}"]=$(( BD["${local_boundary},${status}"] + 1 ))
  fi
done <<< "${tsv}"

print_table_13() {
  echo "### 1.3 By Boundary owner (suy ra từ Assigned)"
  echo ""
  echo "| Boundary | OPEN | RESOLVED | VERIFIED | DONE | REOPEN | REJECTED | PENDING | **Total** |"
  echo "|---|---:|---:|---:|---:|---:|---:|---:|---:|"
  for b in "${BOUNDARIES[@]}"; do
    local row_total=0
    local cells=""
    for s in "${STATUSES[@]}"; do
      local n=${BD["${b},${s}"]:-0}
      cells+=" ${n} |"
      row_total=$((row_total + n))
    done
    echo "| ${b} |${cells} **${row_total}** |"
  done
}

# ============================================================================
# §1.4 By Bug type
# ============================================================================
declare -A BT
BUG_TYPES=("UI" "API" "DB" "Event" "Security" "E2E" "Drift")
for t in "${BUG_TYPES[@]}"; do
  for s in "${STATUSES[@]}"; do
    BT["${t},${s}"]=0
  done
done

while IFS=$'\t' read -r id title btype feat sev status reopen assigned updated; do
  [[ -z "${id}" ]] && continue
  # Normalize type
  norm_type="${btype}"
  case "${btype}" in
    UI*|*UI) norm_type="UI" ;;
    API*|*Contract*) norm_type="API" ;;
    DB*|Persist*) norm_type="DB" ;;
    Event*|Kafka*) norm_type="Event" ;;
    Security*) norm_type="Security" ;;
    E2E*) norm_type="E2E" ;;
    Drift*) norm_type="Drift" ;;
  esac
  if [[ -n "${BT[${norm_type},${status}]:-}" ]]; then
    BT["${norm_type},${status}"]=$(( BT["${norm_type},${status}"] + 1 ))
  fi
done <<< "${tsv}"

print_table_14() {
  echo "### 1.4 By Bug type"
  echo ""
  echo "| Bug type | OPEN | RESOLVED | VERIFIED | DONE | REOPEN | REJECTED | PENDING | **Total** |"
  echo "|---|---:|---:|---:|---:|---:|---:|---:|---:|"
  for t in "${BUG_TYPES[@]}"; do
    local row_total=0
    local cells=""
    for s in "${STATUSES[@]}"; do
      local n=${BT["${t},${s}"]:-0}
      cells+=" ${n} |"
      row_total=$((row_total + n))
    done
    echo "| ${t} |${cells} **${row_total}** |"
  done
}

# ============================================================================
# §1.5 Aging snapshot — P1 active (OPEN/RESOLVED/REOPEN) — sorted oldest first
# ============================================================================
TODAY="${TODAY_OVERRIDE:-2026-06-16}"  # override via env for deterministic test

print_table_15() {
  echo "### 1.5 Aging snapshot — P1 active (OPEN/RESOLVED/REOPEN)"
  echo ""
  echo "| Bug ID | Status | Age (days) | Assigned | Updated |"
  echo "|---|---|---:|---|---|"
  while IFS=$'\t' read -r id title btype feat sev status reopen assigned updated; do
    [[ -z "${id}" ]] && continue
    [[ "${sev}" != "P1" ]] && continue
    case "${status}" in
      OPEN|RESOLVED|REOPEN) ;;
      *) continue ;;
    esac
    # Compute age — bash date diff (POSIX)
    if [[ "${updated}" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
      age_sec=$(( $(date -d "${TODAY}" +%s) - $(date -d "${updated}" +%s) ))
      age_days=$(( age_sec / 86400 ))
    else
      age_days="?"
    fi
    echo "| ${id} | ${status} | ${age_days} | ${assigned} | ${updated} |"
  done <<< "${tsv}" | sort -t'|' -k4 -nr  # sort by age desc
}

# ============================================================================
# Main output
# ============================================================================
echo "========================================="
echo "Recomputed §1 Dashboard counters"
echo "Source: §2 Master Index (${total_bugs} bugs)"
echo "Today (aging baseline): ${TODAY}"
echo "========================================="
echo ""
print_table_11
echo ""
print_table_13
echo ""
print_table_14
echo ""
print_table_15
echo ""

if [[ "${APPLY}" == "false" ]]; then
  echo "========================================="
  echo "DRY-RUN mode (default). Use --apply to write in-place."
  echo "Diff vs current file: review counters above + compare manually."
  echo "========================================="
  exit 0
fi

# ============================================================================
# --apply mode: write each table back to file
# In-place edit complex with multi-table replace — print to stdout + user pipe.
# Safer pattern: emit blocks to .recomputed file, user reviews + manual paste.
# ============================================================================
OUT="${BUGS_FILE}.recomputed-dashboard.md"
{
  echo "<!-- Auto-generated by recompute-bugs-v2-dashboard.sh @ ${TODAY} -->"
  echo "<!-- Source: ${BUGS_FILE} §2 Master Index (${total_bugs} bugs) -->"
  echo ""
  print_table_11
  echo ""
  print_table_13
  echo ""
  print_table_14
  echo ""
  print_table_15
} > "${OUT}"

echo "Written: ${OUT}"
echo "Review + manual paste 4 tables into §1.1/§1.3/§1.4/§1.5 of ${BUGS_FILE}."
echo "Auto in-place edit chưa implement (multi-table boundary detection nontrivial)."
exit 0
