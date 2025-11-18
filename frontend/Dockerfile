# Multi-stage build for production frontend

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Accept build arguments for environment variables
ARG EXPO_PUBLIC_BACKEND_URL
ARG EXPO_PUBLIC_SUPABASE_PROJ_URL
ARG EXPO_PUBLIC_SUPABASE_ANON_KEY

# Set environment variables for build
ENV EXPO_PUBLIC_BACKEND_URL=${EXPO_PUBLIC_BACKEND_URL}
ENV EXPO_PUBLIC_SUPABASE_PROJ_URL=${EXPO_PUBLIC_SUPABASE_PROJ_URL}
ENV EXPO_PUBLIC_SUPABASE_ANON_KEY=${EXPO_PUBLIC_SUPABASE_ANON_KEY}

# Build the web application (outputs to dist/)
RUN npm run build:web

# Stage 2: Production stage with nginx
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
