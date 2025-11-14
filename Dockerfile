FROM node:24.11.1-alpine@sha256:2867d550cf9d8bb50059a0fff528741f11a84d985c732e60e19e8e75c7239c43 AS base

WORKDIR /app

# Устанавливаем необходимые системные пакеты
RUN apk add --no-cache curl

FROM base AS deps

# Копируем файлы зависимостей
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN npm ci --only=production && npm cache clean --force

FROM base AS builder

# Копируем зависимости и исходный код
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/prisma ./prisma
COPY . .

# Генерируем Prisma client и собираем приложение
RUN npx prisma generate
RUN npm run build

FROM base AS runner

# Создаем пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxtjs

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NUXT_TELEMETRY_DISABLED=1

# Копируем собранное приложение
COPY --from=builder --chown=nuxtjs:nodejs /app/.output ./.output
COPY --from=builder --chown=nuxtjs:nodejs /app/package.json ./
COPY --from=builder --chown=nuxtjs:nodejs /app/prisma ./prisma
COPY --from=deps --chown=nuxtjs:nodejs /app/node_modules ./node_modules

# Создаем entrypoint script
RUN echo '#!/bin/sh\n\
set -e\n\
echo "🔗 Generating Prisma client..."\n\
npx prisma generate\n\
echo "🗄️  Setting up database..."\n\
npx prisma db push --accept-data-loss\n\
echo "🚀 Starting application..."\n\
exec "$@"' > /app/docker-entrypoint.sh && \
chmod +x /app/docker-entrypoint.sh && \
chown nuxtjs:nodejs /app/docker-entrypoint.sh

USER nuxtjs

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", ".output/server/index.mjs"]
