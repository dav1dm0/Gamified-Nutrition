# === Build Stage ===
FROM node:20-slim as client-builder
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# === Production Stage ===
# Build the Node.js Server
FROM node:20-slim
WORKDIR /app

# Copy server dependencies and install
COPY server/package.json ./server/
RUN cd server && npm install --production

# Copy server source code
COPY server/ ./server/

# Copy the built React app from the "Build Stage"
COPY --from=client-builder /app/client/build ./client/build


CMD ["node", "server/server.js"]