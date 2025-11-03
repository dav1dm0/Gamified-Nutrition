# === Base Stage (to get pnpm) ===
FROM node:20-slim AS base
# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# === Builder Stage ===
# 1. Build the React Frontend (nutrition-web)
FROM base AS client-builder
WORKDIR /app

# Copy ALL package files and monorepo config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy source code for ALL apps/libs needed for the build
COPY ./apps ./apps
COPY ./libs ./libs

# Install all dependencies (including devDependencies)
RUN pnpm install --prod=false 
ENV DISABLE_ESLINT_PLUGIN=true

# Build the frontend (nutrition-web)
RUN pnpm turbo build --filter=nutrition-web

# === Production Stage ===
# 2. Build the Node.js Server (nutrition-api)
FROM base
WORKDIR /app

# Copy root dependency files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy source code for ALL apps/libs
COPY ./apps ./apps
COPY ./libs ./libs

# Install ONLY production dependencies
RUN pnpm install --prod

# Copy the built React app from the "Build Stage"
COPY --from=client-builder /app/apps/nutrition-web/build ./apps/nutrition-api/build

# Start the server
CMD ["node", "apps/nutrition-api/server.js"]