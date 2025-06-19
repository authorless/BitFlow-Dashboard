FROM node:18-alpine AS deps

WORKDIR /app

# Копируем файлы для установки зависимостей
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm ci

FROM node:18-alpine AS builder

WORKDIR /app

# Копируем зависимости
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Копируем исходный код
COPY . .

# Устанавливаем переменные среды для сборки
ENV NODE_ENV=production

# Собираем приложение
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

# Устанавливаем необходимые инструменты для healthcheck
RUN apk add --no-cache curl

# Копируем собранное приложение и зависимости
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Устанавливаем production переменные окружения
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
