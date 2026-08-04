#!/usr/bin/env bash
# QC-owned seed harness — khung chung param hoá (Lớp A, CR-20260701-03 §B2).
# Wave seed script (auto/specs/W{NN}/seed/*.sh) source file này để tránh lặp
# lại PG_CONTAINER/PG_USER/docker-exec-psql boilerplate.
#
# Usage trong wave seed script:
#   source "$(dirname "$0")/../../../harness/seed/lib/pg-exec.sh"
#   pg_exec gf_sales "UPDATE dev_gf_sales.service_order SET status='COMPLETED' WHERE code='...';"
#   pg_query gf_sales "SELECT status FROM dev_gf_sales.service_order WHERE code='...';"

: "${PG_CONTAINER:=gf-postgres}"
: "${PG_USER:=chungnt}"

# pg_exec <db> <sql> — chạy statement, không cần output (UPDATE/DELETE/INSERT)
pg_exec() {
  local db="$1" sql="$2"
  docker exec "$PG_CONTAINER" psql -U "$PG_USER" -d "$db" -c "$sql"
}

# pg_query <db> <sql> — chạy SELECT, trả về tuples-only unaligned (dùng trong $() capture)
pg_query() {
  local db="$1" sql="$2"
  docker exec "$PG_CONTAINER" psql -U "$PG_USER" -d "$db" -tA -c "$sql"
}
