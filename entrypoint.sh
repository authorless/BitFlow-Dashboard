#!/bin/sh

set -eu

max_attempts="${DB_MIGRATION_MAX_ATTEMPTS:-30}"
attempt=1

echo "Applying database migrations..."

until ./node_modules/.bin/prisma migrate deploy; do
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Database migration failed after $attempt attempts" >&2
    exit 1
  fi

  echo "Database is not ready yet (attempt $attempt/$max_attempts)"
  attempt=$((attempt + 1))
  sleep 2
done

echo "Starting BitFlow Dashboard..."
exec node .output/server/index.mjs
