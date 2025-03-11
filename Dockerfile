##################
# BUILD BASE IMAGE
##################
FROM node:23-alpine AS base
RUN npm install -g pnpm

#############################
# BUILD FOR LOCAL DEVELOPMENT
#############################
FROM base AS development
WORKDIR /app
RUN chown -R node:node /app
COPY --chown=node:node package*.json pnpm-lock.yaml ./
RUN pnpm install
COPY --chown=node:node . .
USER node

#####################
# BUILD BUILDER IMAGE
#####################
FROM base AS builder
WORKDIR /app
# multiple COPY for better layer cache
COPY --chown=node:node package*.json pnpm-lock.yaml ./
COPY --chown=node:node --from=development /app/node_modules ./node_modules
COPY --chown=node:node --from=development /app/src ./src
COPY --chown=node:node --from=development /app/tsconfig.json ./tsconfig.json
COPY --chown=node:node --from=development /app/tsconfig.build.json ./tsconfig.build.json
COPY --chown=node:node --from=development /app/nest-cli.json ./nest-cli.json
RUN pnpm build
ENV NODE_ENV=production
RUN pnpm prune --prod
RUN pnpm install --prod
USER node

######################
# BUILD FOR PRODUCTION
######################
FROM node:23-alpine AS production
WORKDIR /app
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/package.json ./
USER node
CMD ["node", "dist/main.js"]