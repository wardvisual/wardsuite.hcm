# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.base.json ./

# Copy API app
COPY apps/api ./apps/api

# Install dependencies
RUN npm install

# Build API
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

# Install production dependencies only
RUN npm install --production && \
    npm install --workspace=api --production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run with dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start", "--workspace=api"]
