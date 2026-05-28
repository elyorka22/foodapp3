# syntax=docker/dockerfile:1

# --- Base: OpenSSL for Prisma on Debian slim ---
FROM node:20-slim AS base
WORKDIR /app
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# --- Dependencies (full, for build) ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- Build NestJS + Prisma client ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src/

RUN npx prisma generate
RUN npm run build
# Fail the image build early if the entry file is missing
RUN test -f dist/main.js

# Keep production node_modules (includes generated @prisma/client)
RUN npm prune --omit=dev

# --- Production image ---
FROM base AS runner
ENV NODE_ENV=production

RUN groupadd --system --gid 1001 nestjs \
  && useradd --system --uid 1001 --gid nestjs nestjs

COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
  && mkdir -p uploads \
  && chown -R nestjs:nestjs /app

USER nestjs
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
