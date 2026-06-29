# =============================================================================
# EBFMS Backend — Multi-stage Dockerfile
#
# Stages:
#   base        — shared Node.js base with system deps
#   development — hot-reload dev server via tsx watch
#   builder     — compiles TypeScript to dist/
#   production  — minimal runtime image, runs compiled JS
# =============================================================================

ARG NODE_VERSION=20-alpine

# ── Base ──────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS base

# Install OpenSSL for Prisma (required on Alpine)
RUN apk add --no-cache openssl

WORKDIR /app

# Copy manifests first to leverage Docker layer caching
COPY package*.json ./
COPY prisma/schema.prisma ./prisma/

# ── Development ───────────────────────────────────────────────────────────────
FROM base AS development

ENV NODE_ENV=development

# Install all dependencies including devDependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# ── Builder ───────────────────────────────────────────────────────────────────
FROM base AS builder

ENV NODE_ENV=production

# Install all deps (including dev) for the build step
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

COPY . .

# Compile TypeScript
RUN npm run build

# ── Production ────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS production

RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production

# Copy only production manifests
COPY package*.json ./
COPY prisma/schema.prisma ./prisma/

# Install production dependencies only
RUN npm ci --omit=dev

# Generate Prisma client (production)
RUN npx prisma generate

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Drop root privileges for security
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
