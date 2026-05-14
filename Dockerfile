# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files and tsconfig
COPY package*.json ./
COPY tsconfig.base.json tsconfig.json ./

# Copy API app with all config files
COPY apps/api ./apps/api

# Install dependencies
RUN npm install

# Build API (tsc-alias will convert @api/* aliases to relative paths)
RUN npm run build:api

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy root package files
COPY package*.json ./

# Copy only API app (not entire monorepo)
COPY apps/api/package*.json ./apps/api/

# Copy built dist from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Install production dependencies (root + api)
RUN npm install --production --no-audit --no-fund && \
    cd ./apps/api && npm install --production --no-audit --no-fund

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run with dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start", "--workspace=api"]
