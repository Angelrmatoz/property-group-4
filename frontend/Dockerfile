# ==========================================
# 1. Base Stage
# ==========================================
FROM node:22-alpine AS base
# We need libc6-compat for some node modules like sharp (often used by Next.js)
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.18.1
WORKDIR /app

# ==========================================
# 2. Development Stage
# ==========================================
FROM base AS dev
ENV NODE_ENV=development
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 3000
CMD ["pnpm", "run", "dev"]

# ==========================================
# 3. Builder Stage
# ==========================================
FROM base AS builder
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# We build the Next.js app. The configuration must include 'output: standalone'
RUN pnpm run build

# ==========================================
# 4. Production Stage
# ==========================================
FROM base AS production
ENV NODE_ENV=production
# Solo necesitamos los archivos estáticos y el servidor standalone generado por Next.js
COPY --from=builder /app/public ./public
# Automatically created by next build with `output: "standalone"`
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
ENV PORT=3000
# El archivo server.js es generado por standalone
CMD ["node", "server.js"]
