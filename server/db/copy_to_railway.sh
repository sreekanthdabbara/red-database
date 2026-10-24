#!/bin/bash
# ============================================================
# Copy the local red_database into Railway's MySQL
# Usage (from the repo root):
#   bash server/db/copy_to_railway.sh "<MYSQL_PUBLIC_URL from Railway>"
#
# MYSQL_PUBLIC_URL is on the Railway MySQL service → Variables tab,
# e.g. mysql://root:xxxx@xxxx.proxy.rlwy.net:12345/railway
# Existing tables with the same names on Railway are replaced.
# ============================================================
set -euo pipefail

URL="${1:-}"
if [[ ! "$URL" =~ ^mysql://([^:]+):([^@]+)@([^:/]+):([0-9]+)/(.+)$ ]]; then
  echo "Usage: bash server/db/copy_to_railway.sh \"mysql://user:pass@host:port/db\""
  exit 1
fi
R_USER="${BASH_REMATCH[1]}"; R_PASS="${BASH_REMATCH[2]}"
R_HOST="${BASH_REMATCH[3]}"; R_PORT="${BASH_REMATCH[4]}"; R_DB="${BASH_REMATCH[5]}"

# Local connection settings from server/.env
set -a; source "$(dirname "$0")/../.env"; set +a

DUMP="deploy_dump.sql"   # git-ignored
echo "📤 Dumping local ${DB_NAME:-red_database}…"
MYSQL_PWD="${DB_PASSWORD:-}" mysqldump \
  -h "${DB_HOST:-localhost}" -P "${DB_PORT:-3306}" -u "${DB_USER:-root}" \
  --single-transaction --no-tablespaces --set-gtid-purged=OFF \
  "${DB_NAME:-red_database}" > "$DUMP"
echo "   $(du -h "$DUMP" | cut -f1) written to $DUMP"

echo "📥 Loading into Railway ($R_HOST:$R_PORT/$R_DB)…"
MYSQL_PWD="$R_PASS" mysql -h "$R_HOST" -P "$R_PORT" -u "$R_USER" "$R_DB" < "$DUMP"

echo "🔎 Row counts on Railway:"
MYSQL_PWD="$R_PASS" mysql -h "$R_HOST" -P "$R_PORT" -u "$R_USER" "$R_DB" -e "
  SELECT 'epi_data' t, COUNT(*) n FROM epi_data UNION ALL
  SELECT 'survival_data', COUNT(*) FROM survival_data UNION ALL
  SELECT 'genetic_testing_data', COUNT(*) FROM genetic_testing_data UNION ALL
  SELECT 'mortality_data', COUNT(*) FROM mortality_data UNION ALL
  SELECT 'incidence_data', COUNT(*) FROM incidence_data UNION ALL
  SELECT 'mutation_rate_data', COUNT(*) FROM mutation_rate_data UNION ALL
  SELECT 'population_gender', COUNT(*) FROM population_gender UNION ALL
  SELECT 'users', COUNT(*) FROM users;"

rm -f "$DUMP"
echo "✅ Done"
