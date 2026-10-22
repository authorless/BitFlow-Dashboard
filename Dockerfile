FROM node:24-alpine@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS base

WORKDIR /app

RUN apk add --no-cache \
    openssl \
    libc6-compat

ENV NUXT_TELEMETRY_DISABLED=1

FROM base AS deps

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

COPY . .

RUN npm run postinstall && npm run build

RUN npm prune --omit=dev

FROM node:24-alpine@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS runner

WORKDIR /app

RUN apk add --no-cache \
    openssl \
    libc6-compat

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

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

ENTRYPOINT ["./entrypoint.sh"]
