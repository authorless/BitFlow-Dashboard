#!/bin/sh

set -eu

for command in docker mktemp; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "Required command is missing: $command" >&2
    exit 1
  fi
done

docker compose version >/dev/null

project_name="${COMPOSE_PROJECT_NAME:-$(basename "$PWD" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9_-]//g')}"
source_volume="${POSTGRES16_VOLUME:-${project_name}_postgres_data}"
target_volume="${POSTGRES18_VOLUME:-${project_name}_postgres_data_v18}"
database="${POSTGRES_DB:-bitcoin_db}"
user="${POSTGRES_USER:-bitflow}"
password="${POSTGRES_PASSWORD:-bitflow-local-only}"
source_container="bitflow-pg16-migration-$$"
target_container="bitflow-pg18-migration-$$"
backup_dir="$(mktemp -d "${TMPDIR:-/tmp}/bitflow-pg18.XXXXXX")"
dump_file="$backup_dir/database.dump"
target_created=false
completed=false

cleanup() {
  docker rm -f "$source_container" "$target_container" >/dev/null 2>&1 || true
  rm -rf "$backup_dir"

  if [ "$completed" != true ] && [ "$target_created" = true ]; then
    docker volume rm "$target_volume" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

wait_for_postgres() {
  container="$1"
  attempt=1

  while [ "$attempt" -le 60 ]; do
    if docker exec "$container" pg_isready -U "$user" -d "$database" >/dev/null 2>&1; then
      return 0
    fi

    attempt=$((attempt + 1))
    sleep 1
  done

  echo "PostgreSQL did not become ready: $container" >&2
  return 1
}

if ! docker volume inspect "$source_volume" >/dev/null 2>&1; then
  echo "PostgreSQL 16 volume not found: $source_volume" >&2
  echo "Set POSTGRES16_VOLUME if the Compose project used a custom name." >&2
  exit 1
fi

if docker volume inspect "$target_volume" >/dev/null 2>&1; then
  echo "PostgreSQL 18 volume already exists: $target_volume" >&2
  echo "The migration will not overwrite it." >&2
  exit 1
fi

echo "Stopping the current Compose stack..."
docker compose -p "$project_name" down

echo "Starting the PostgreSQL 16 source volume..."
docker run -d --rm \
  --name "$source_container" \
  -e POSTGRES_DB="$database" \
  -e POSTGRES_USER="$user" \
  -e POSTGRES_PASSWORD="$password" \
  -v "$source_volume:/var/lib/postgresql/data" \
  postgres:16-alpine@sha256:cf78e76683b9ca8c5733cbbdce6c9262b45b6767934dd0a95e671f9a0fc20685 \
  >/dev/null
wait_for_postgres "$source_container"

echo "Creating a temporary database dump..."
docker exec "$source_container" \
  pg_dump -U "$user" -d "$database" --format=custom --no-owner --no-privileges \
  > "$dump_file"

source_rows="$(docker exec "$source_container" psql -U "$user" -d "$database" -Atc \
  "SELECT count(*) FROM bitcoin_prices;")"
docker rm -f "$source_container" >/dev/null

echo "Creating the PostgreSQL 18 target volume..."
docker volume create \
  --label "com.docker.compose.project=$project_name" \
  --label "com.docker.compose.volume=postgres_data_v18" \
  "$target_volume" >/dev/null
target_created=true

docker run -d --rm \
  --name "$target_container" \
  -e POSTGRES_DB="$database" \
  -e POSTGRES_USER="$user" \
  -e POSTGRES_PASSWORD="$password" \
  -v "$target_volume:/var/lib/postgresql" \
  postgres:18-alpine@sha256:d3e1620b530c944afa6e887d22eb899824da68e19c52024bf98f5220c88a65b2 \
  >/dev/null
wait_for_postgres "$target_container"

echo "Restoring the database into PostgreSQL 18..."
docker exec -i "$target_container" \
  pg_restore -U "$user" -d "$database" --clean --if-exists --no-owner --no-privileges \
  < "$dump_file"

target_rows="$(docker exec "$target_container" psql -U "$user" -d "$database" -Atc \
  "SELECT count(*) FROM bitcoin_prices;")"

if [ "$source_rows" != "$target_rows" ]; then
  echo "Row-count verification failed: PostgreSQL 16=$source_rows, PostgreSQL 18=$target_rows" >&2
  exit 1
fi

docker rm -f "$target_container" >/dev/null
completed=true

echo "Starting the upgraded Compose stack..."
docker compose -p "$project_name" up -d

echo "Migration completed successfully ($target_rows price rows)."
echo "Rollback volume retained: $source_volume"
