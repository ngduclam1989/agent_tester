#!/usr/bin/env bash
# Seed W02 SO BH COMPLETED — temporary test-only revert helper
#
# Background: W02 TEST_EXECUTION E2E Phase A (A01..A09 + REG-07..10) requires
# ≥2 SO with `has_insurance=true + status=COMPLETED + NO settlement linked`.
# Per TL-W02-E2E-003: DB only had 1 such SO; rest were SETTLED.
#
# Strategy: revert 2 SETTLED SO BH → COMPLETED via SQL UPDATE + delete linked
# settlement rows so SO appears ready-to-settle again. This is a test-data
# revert, NOT a production-safe migration. Use only in dev-local infra.
#
# Affected test SO codes (idempotent — re-run safe):
#   - PDV-20260622-00012 (id=12) — revert SETTLED → COMPLETED
#   - PDV-20260622-00009 (id=9)  — revert SETTLED → COMPLETED
# Pre-existing kept:
#   - PDV-20260622-00010 (id=10) — already COMPLETED
#
# Total after seed: 3 SO BH COMPLETED (sufficient for E2E A01..A09 + REG).
#
# Usage:
#   bash Execution/auto/specs/W02/seed/seed-w02-bh-completed.sh
#   # OR with custom postgres container:
#   PG_CONTAINER=gf-postgres bash Execution/auto/specs/W02/seed/seed-w02-bh-completed.sh

set -euo pipefail

PG_CONTAINER="${PG_CONTAINER:-gf-postgres}"
PG_USER="${PG_USER:-chungnt}"
SALES_DB="${SALES_DB:-gf_sales}"
ACCOUNTING_DB="${ACCOUNTING_DB:-gf_accounting}"

SO_CODES_TO_REVERT=(
  "PDV-20260622-00012"
  "PDV-20260622-00009"
)

echo "=== W02 Seed: revert SO BH SETTLED → COMPLETED ==="
echo "Container: $PG_CONTAINER"

for SO_CODE in "${SO_CODES_TO_REVERT[@]}"; do
  echo ""
  echo "→ Processing $SO_CODE"

  CURRENT_STATUS=$(docker exec "$PG_CONTAINER" psql -U "$PG_USER" -d "$SALES_DB" -tA -c \
    "SELECT status FROM dev_gf_sales.service_order WHERE code='$SO_CODE';" 2>/dev/null || echo "")

  if [[ -z "$CURRENT_STATUS" ]]; then
    echo "  WARN: SO not found, skipping"
    continue
  fi
  echo "  current status: $CURRENT_STATUS"

  if [[ "$CURRENT_STATUS" == "COMPLETED" ]]; then
    echo "  already COMPLETED — skip"
    continue
  fi

  if [[ "$CURRENT_STATUS" != "SETTLED" ]]; then
    echo "  WARN: unexpected status ($CURRENT_STATUS), only SETTLED→COMPLETED supported. Skip."
    continue
  fi

  # 1. Delete linked settlement rows in gf-accounting (schema = gf_accounting, table = settlement_records)
  #    settlement_documents has FK to settlement_records — delete children first
  echo "  cleaning gf_accounting.settlement_records linked to $SO_CODE..."
  docker exec "$PG_CONTAINER" psql -U "$PG_USER" -d "$ACCOUNTING_DB" -c \
    "DELETE FROM gf_accounting.settlement_documents WHERE settlement_id IN (
       SELECT id FROM gf_accounting.settlement_records WHERE service_order_code='$SO_CODE');
     DELETE FROM gf_accounting.settlement_records WHERE service_order_code='$SO_CODE';" 2>&1 | tail -3 || true

  # 2. Revert SO status SETTLED → COMPLETED
  echo "  reverting SO status..."
  docker exec "$PG_CONTAINER" psql -U "$PG_USER" -d "$SALES_DB" -c \
    "UPDATE dev_gf_sales.service_order SET status='COMPLETED', updated_at=NOW() WHERE code='$SO_CODE';" 2>&1 | tail -2

  echo "  ✓ $SO_CODE reverted to COMPLETED"
done

echo ""
echo "=== Verify final state ==="
docker exec "$PG_CONTAINER" psql -U "$PG_USER" -d "$SALES_DB" -c \
  "SET search_path TO dev_gf_sales;
   SELECT status, count(*) FROM service_order WHERE has_insurance=true GROUP BY status ORDER BY status;"

echo ""
echo "=== SO BH COMPLETED ready for E2E ==="
docker exec "$PG_CONTAINER" psql -U "$PG_USER" -d "$SALES_DB" -tA -c \
  "SET search_path TO dev_gf_sales;
   SELECT code FROM service_order WHERE has_insurance=true AND status='COMPLETED' ORDER BY id DESC;"
