#!/usr/bin/env bash
# =============================================================================
# seed-w02-mobile-e2e.sh — Seed fresh test data cho W02 Mobile E2E (Patrol)
#
# Mục đích: Tạo toàn bộ test data từ bước Tạo phiếu dịch vụ (PDV) → Settlement
#            → Dossier để Mobile E2E Patrol tests có thể chạy với data sạch.
#
# QUAN TRỌNG: Script này chạy trên DEV / TEST machine có Docker local + BFF local.
#   - BFF: http://localhost:3000 (hoặc set BFF_URL)
#   - SSO stub: http://localhost:45410 (hoặc set SSO_URL)
#   - Kết quả ghi ra .env.w02-mobile-e2e (Patrol harness đọc)
#
# Usage:
#   bash Execution/auto/specs/W02/seed/seed-w02-mobile-e2e.sh
#
#   # Override endpoints:
#   BFF_URL=http://localhost:3000 SSO_URL=http://localhost:45410 \
#   TENANT_ID=1 IDENTIFIER=0810000002 \
#   bash Execution/auto/specs/W02/seed/seed-w02-mobile-e2e.sh
#
# Output: Execution/auto/harness/patrol/.env.w02-mobile-e2e
#
# Context: W02/TEST_EXECUTION Group 4 — Mobile E2E 38 TCs
#   Lý do stale data: data từ lúc dev code lần đầu (chưa hoàn chỉnh) dùng để
#   verify bug 023/024/025/026 → verify sai. QC manual re-verified 2026-06-23:
#   tạo data mới hoàn toàn từ bước PDV → flow chạy được hết.
# =============================================================================

set -euo pipefail

BFF_URL="${BFF_URL:-http://localhost:3000}"
SSO_URL="${SSO_URL:-http://localhost:45410}"
TENANT_ID="${TENANT_ID:-1}"
IDENTIFIER="${IDENTIFIER:-0810000002}"
OUTPUT_FILE="${OUTPUT_FILE:-$(dirname "$0")/../patrol/.env.w02-mobile-e2e}"

log() { echo "[$(date +%H:%M:%S)] $*"; }
die() { echo "ERROR: $*" >&2; exit 1; }

log "=== W02 Mobile E2E Seed ==="
log "BFF: $BFF_URL"
log "SSO: $SSO_URL"
log "Tenant: $TENANT_ID"

# ─────────────────────────────────────────────────────────
# Step 1: Get auth token
# ─────────────────────────────────────────────────────────
log "[1/6] Getting auth token..."

TOKEN=$(curl -sf "$SSO_URL/dev/token?identifier=$IDENTIFIER" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('accessToken',''))" 2>/dev/null) || \
TOKEN=$(curl -sf -X POST "$SSO_URL/graphql" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation{login(input:{identifier:\\\"$IDENTIFIER\\\",password:\\\"Test@12345\\\"}){...on LoginOutput{accessToken}}}\"}" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['login']['accessToken'])" 2>/dev/null)

[[ -z "$TOKEN" ]] && die "Cannot obtain auth token from $SSO_URL"
log "  ✓ Token obtained"

gql() {
  local query="$1"
  curl -sf -X POST "$BFF_URL/garage/graphql" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -H "X-Tenant-Id: $TENANT_ID" \
    -d "{\"query\": $(python3 -c "import sys,json; print(json.dumps(sys.argv[1]))" "$query")}"
}

# ─────────────────────────────────────────────────────────
# Step 2: Create fresh SO with insurance (BH)
# ─────────────────────────────────────────────────────────
log "[2/6] Creating fresh SO with insurance..."

TS=$(date +%s)
CREATE_SO_RESP=$(gql "mutation {
  createServiceOrderV3(input: {
    customerName: \"QC-BH-$TS\"
    customerPhoneNumber: \"09001$(( RANDOM % 90000 + 10000 ))\"
    customerType: \"INDIVIDUAL\"
    hasInsurance: true
    insuranceCompany: \"PTI-TEST\"
    insurancePolicyNumber: \"PTI-W02-$TS\"
    insuranceExpiryDate: \"2027-12-31\"
    insuranceContactPhone: \"19001717\"
    vehicleRequest: {
      plate: \"51K-W02-$TS\"
      brand: \"TOYOTA\"
      model: \"Camry\"
      year: \"2022\"
    }
    items: [
      {
        serviceName: \"Thay đèn pha trước\"
        quantity: 1
        unitPrice: 3000000
        taxPercent: 10
        payer: \"INSURANCE\"
      }
      {
        serviceName: \"Cân chỉnh vô lăng\"
        quantity: 1
        unitPrice: 500000
        taxPercent: 10
        payer: \"CUSTOMER\"
      }
    ]
    serviceType: \"MAINTENANCE\"
    orderType: \"SERVICE\"
    noteVehicleCondition: \"W02 Mobile E2E test data - $TS\"
  }) {
    ...on ApiResponseServiceOrderDetailV3Response {
      data { id code status hasInsurance }
    }
    ...on ErrorResponse { code message }
  }
}")

SO_CODE=$(echo "$CREATE_SO_RESP" | python3 -c "
import sys,json
d=json.load(sys.stdin)
r=d.get('data',{}).get('createServiceOrderV3',{})
if 'data' in r and r['data']:
    print(r['data']['code'])
else:
    import sys; print('ERROR:'+r.get('message','unknown'),file=sys.stderr); sys.exit(1)
" 2>&1) || die "createServiceOrderV3 failed: $SO_CODE"

SO_ID=$(echo "$CREATE_SO_RESP" | python3 -c "
import sys,json
d=json.load(sys.stdin)
r=d.get('data',{}).get('createServiceOrderV3',{})
print(r['data']['id'])
")

log "  ✓ SO created: $SO_CODE (id=$SO_ID)"

# ─────────────────────────────────────────────────────────
# Step 3: Start SO
# ─────────────────────────────────────────────────────────
log "[3/6] Starting SO (→ IN_PROGRESS)..."

START_RESP=$(gql "mutation { startServiceOrderV3(id: $SO_ID) {
  ...on ApiResponseServiceOrderDetailV3Response { data { status } }
  ...on ErrorResponse { code message }
}}")

STATUS=$(echo "$START_RESP" | python3 -c "
import sys,json
d=json.load(sys.stdin)
r=d.get('data',{}).get('startServiceOrderV3',{})
print(r.get('data',{}).get('status','') if 'data' in r else 'ERR:'+r.get('message',''))
")
log "  SO status after start: $STATUS"

# ─────────────────────────────────────────────────────────
# Step 4: Complete SO
# ─────────────────────────────────────────────────────────
log "[4/6] Completing SO (→ COMPLETED)..."

COMPLETE_RESP=$(gql "mutation { completeServiceOrderV3(id: $SO_ID) {
  ...on ApiResponseServiceOrderDetailV3Response { data { status } }
  ...on ErrorResponse { code message }
}}")

STATUS=$(echo "$COMPLETE_RESP" | python3 -c "
import sys,json
d=json.load(sys.stdin)
r=d.get('data',{}).get('completeServiceOrderV3',{})
if 'data' in r and r['data']:
    print(r['data']['status'])
else:
    print('ERR:'+r.get('message','unknown'), file=sys.stderr); import sys; sys.exit(1)
" 2>&1) || {
  log "  WARN: completeServiceOrderV3 returned non-success ($STATUS). SO may have insurance-negative warning."
  log "        If ERR-INS-003: call completeWithInsuranceWarning or confirm via app."
}
log "  SO status after complete: $STATUS"

# ─────────────────────────────────────────────────────────
# Step 5: Create insurance settlement
# ─────────────────────────────────────────────────────────
log "[5/6] Creating insurance settlement..."

STL_RESP=$(gql "mutation {
  createInsuranceSettlement(id: $SO_ID, input: {
    insuranceNotes: \"W02 E2E seed settlement $TS\"
  }) {
    ...on ApiResponseInsuranceSettlementResponse {
      success
      message
      data {
        insuranceSettlement { code }
        customerSettlement { code }
      }
    }
    ...on ErrorResponse { code message }
  }
}")

INS_STL_CODE=$(echo "$STL_RESP" | python3 -c "
import sys,json
d=json.load(sys.stdin)
r=d.get('data',{}).get('createInsuranceSettlement',{})
data=r.get('data') or {}
ins=(data.get('insuranceSettlement') or {}).get('code')
if ins:
    print(ins)
else:
    print('ERR:'+str(r.get('message','unknown')), file=sys.stderr); sys.exit(1)
" 2>&1) || die "createInsuranceSettlement failed: $INS_STL_CODE"

KH_STL_CODE=$(echo "$STL_RESP" | python3 -c "
import sys,json
d=json.load(sys.stdin)
r=d.get('data',{}).get('createInsuranceSettlement',{})
data=r.get('data') or {}
print((data.get('customerSettlement') or {}).get('code',''))
")

log "  ✓ Insurance settlement: $INS_STL_CODE"
log "  ✓ Customer settlement:  $KH_STL_CODE"

# ─────────────────────────────────────────────────────────
# Step 6: Export dossier (tạo hồ sơ bảo hiểm)
# ─────────────────────────────────────────────────────────
log "[6/6] Exporting insurance dossier..."

DOSSIER_RESP=$(gql "mutation {
  exportInsuranceDossier(
    settlementCode: \"$INS_STL_CODE\"
    documentTypes: [ACCEPTANCE_RECORD, PAYMENT_AUTHORIZATION]
  ) {
    versionNo
    exports { documentType fileUrl fileName }
  }
}" 2>/dev/null) || DOSSIER_RESP='{}'

DOSSIER_CODE=$(echo "$DOSSIER_RESP" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
except Exception:
    print('SKIP:parse-error'); sys.exit(0)
if d.get('errors'):
    print('SKIP:'+str(d['errors'][0].get('message','err'))[:60]); sys.exit(0)
r=(d.get('data') or {}).get('exportInsuranceDossier') or {}
v=r.get('versionNo')
if v is not None:
    print('v'+str(v)+':'+str(len(r.get('exports') or []))+'docs')
else:
    print('SKIP:not-created')
" 2>/dev/null) || DOSSIER_CODE="SKIP"

if [[ "$DOSSIER_CODE" == SKIP* ]]; then
  log "  NOTE: Dossier export skipped (${DOSSIER_CODE#SKIP:}) — settlement code sufficient for E2E flow"
  log "        Mobile E2E flow will create dossier via app UI (form fill → export)"
  DOSSIER_CODE=""
else
  log "  ✓ Dossier: $DOSSIER_CODE"
fi

# ─────────────────────────────────────────────────────────
# Write output env file for Patrol harness
# ─────────────────────────────────────────────────────────
mkdir -p "$(dirname "$OUTPUT_FILE")"
cat > "$OUTPUT_FILE" <<EOF
# W02 Mobile E2E — Fresh seed data
# Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ") by seed-w02-mobile-e2e.sh
# DO NOT commit this file (gitignored)

# Fresh SO (has_insurance=true, COMPLETED)
SEED_SO_BH_CODE=$SO_CODE
SEED_SO_BH_ID=$SO_ID

# Insurance settlement linked to SO
SEED_INS_STL_CODE=$INS_STL_CODE

# Customer settlement linked to SO
SEED_KH_STL_CODE=$KH_STL_CODE

# Dossier (may be empty if export required form data)
SEED_DOSSIER_CODE=$DOSSIER_CODE

# Auth
SEED_TENANT_ID=$TENANT_ID
SEED_IDENTIFIER=$IDENTIFIER
EOF

log ""
log "=== Seed Complete ==="
log "Output: $OUTPUT_FILE"
log ""
log "SO BH:         $SO_CODE (id=$SO_ID)"
log "Insurance STL: $INS_STL_CODE"
log "Customer STL:  $KH_STL_CODE"
log "Dossier:       ${DOSSIER_CODE:-'(create via app)'}"
log ""
log "Run Patrol tests:"
log "  cd Execution/auto/harness/patrol"
log "  flutter pub get && dart pub global activate patrol_cli"
log "  # Android emulator:"
log "  patrol test --target ../../specs/W02/mobile-e2e/ -d Pixel_6_API_33 \\"
log "    --dart-define=BFF_BASE_URL=http://10.0.2.2:3000 \\"
log "    --dart-define=SEED_SO_BH_CODE=$SO_CODE \\"
log "    --dart-define=SEED_INS_STL_CODE=$INS_STL_CODE"
