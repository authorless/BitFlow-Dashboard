FROM node:24-alpine@sha256:2bdb65ed1dab192432bc31c95f94155ca5ad7fc1392fb7eb7526ab682fa5bf14 AS base

WORKDIR /app

RUN apk add --no-cache \
    openssl \
    libc6-compat \
    curl \
    netcat-openbsd

ENV NUXT_TELEMETRY_DISABLED=1

FROM base AS deps

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci

RUN npx prisma generate

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

COPY . .

RUN npm run build

FROM node:24-alpine@sha256:2bdb65ed1dab192432bc31c95f94155ca5ad7fc1392fb7eb7526ab682fa5bf14 AS runner

WORKDIR /app

RUN apk add --no-cache \
    openssl \
    libc6-compat \
    netcat-openbsd

RUN addgroup -S nodejs
RUN adduser -S bitflow -G nodejs

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NUXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=bitflow:nodejs /app/.output ./.output
COPY --from=builder --chown=bitflow:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=bitflow:nodejs /app/package.json ./package.json
COPY --from=builder --chown=bitflow:nodejs /app/prisma ./prisma

COPY --chown=bitflow:nodejs entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

USER bitflow

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

ENTRYPOINT ["./entrypoint.sh"]
