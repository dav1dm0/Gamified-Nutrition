# === Build Stage ===
# Build the React Frontend (nutrition-web)
FROM node:20-slim as client-builder
WORKDIR /app
COPY apps/nutrition-web/package.json  ./apps/nutrition-web/
COPY apps/nutrition-web/public/ ./apps/nutrition-web/public/
COPY apps/nutrition-web/src/ ./apps/nutrition-web/src/

# Install dependencies and build the client
WORKDIR /app/apps/nutrition-web
RUN npm install
RUN npm run build

# === Production Stage ===
# Build the Node.js Server (nutrition-api)
FROM node:20-slim
WORKDIR /app

# Copy server dependencies and install
COPY apps/nutrition-api/package.json ./apps/nutrition-api/
RUN cd apps/nutrition-api && npm install --production

# Copy server source code
COPY apps/nutrition-api/ ./apps/nutrition-api/

# Copy the built React app from the "Build Stage"
COPY --from=client-builder /app/apps/nutrition-web/build ./apps/nutrition-api/build

# Tell GCP how to start  app

CMD ["node", "apps/nutrition-api/server.js"]