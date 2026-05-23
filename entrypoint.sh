#!/bin/sh

set -e

echo "Waiting for PostgreSQL..."

until nc -z db 5432; do
  sleep 1
done

echo "PostgreSQL started"

echo "Generating Prisma client..."
npx prisma generate

echo "Applying Prisma schema..."
npx prisma db push

echo "Starting Nuxt application..."

exec node .output/server/index.mjs
