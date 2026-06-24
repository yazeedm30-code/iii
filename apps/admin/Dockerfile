# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /workspace

FROM base AS deps
COPY pnpm-workspace.yaml package.json ./
COPY apps/admin/package.json ./apps/admin/
RUN pnpm install --filter @platform/admin... --frozen-lockfile

FROM deps AS build
COPY tsconfig.base.json ./
COPY apps/admin ./apps/admin
WORKDIR /workspace/apps/admin
RUN pnpm build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /workspace/apps/admin/.next ./.next
COPY --from=build /workspace/apps/admin/node_modules ./node_modules
COPY --from=build /workspace/apps/admin/package.json ./
EXPOSE 3001
CMD ["pnpm", "start"]
