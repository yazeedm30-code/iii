# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /workspace

FROM base AS deps
COPY pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --filter @platform/api... --frozen-lockfile

FROM deps AS build
COPY tsconfig.base.json ./
COPY apps/api ./apps/api
WORKDIR /workspace/apps/api
RUN pnpm prisma generate \
 && pnpm build

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /workspace/apps/api/dist ./dist
COPY --from=build --chown=app:app /workspace/apps/api/node_modules ./node_modules
COPY --from=build --chown=app:app /workspace/apps/api/prisma ./prisma
COPY --from=build --chown=app:app /workspace/apps/api/package.json ./
USER app
EXPOSE 3000
CMD ["node", "dist/main.js"]
