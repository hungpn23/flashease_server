##################
# BUILD BASE IMAGE
##################
FROM node:23-alpine AS base
RUN npm install -g pnpm

#####################
# BUILD BUILDER IMAGE
#####################
FROM base AS builder
WORKDIR /app

COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY --chown=node:node tsconfig.json ./
COPY --chown=node:node tsconfig.build.json ./
COPY --chown=node:node nest-cli.json ./
COPY --chown=node:node src/ ./src/

RUN pnpm build

ENV NODE_ENV=production
RUN pnpm prune --prod

######################
# BUILD FOR PRODUCTION
######################
FROM node:23-alpine AS production
WORKDIR /app

COPY --chown=node:node --from=builder /app/package.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

USER node
CMD ["node", "dist/main.js"]