# ==========================================
# 1. Base Stage
# ==========================================
FROM node:22-alpine AS base
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
EXPOSE 8000
CMD ["pnpm", "run", "dev"]

# ==========================================
# 3. Builder Stage
# ==========================================
FROM base AS builder
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build:clean

# ==========================================
# 4. Production Stage
# ==========================================
FROM base AS production
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=builder /app/dist ./dist
# package.json es necesario para los scripts de pnpm start y module-alias
EXPOSE 8000
CMD ["pnpm", "start"]
