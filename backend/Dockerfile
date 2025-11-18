# Multi-stage build for production backend

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for TypeScript compilation)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Run database sync and build TypeScript to JavaScript
RUN npm run sync:db || true
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled code from builder stage
COPY --from=builder /app/dist ./dist

# Copy any additional files needed at runtime (if any)
COPY drizzle.config.ts ./

# Expose port
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production

# Run the compiled application
CMD ["node", "dist/src/index.js"]
