# ============================================================
# Stage 1: Build — Install deps & build React app
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files (cache optimization)
COPY package.json package-lock.json* ./

# Clean install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set API URL for production build (embedded via Vite)
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

# Build React app -> output in /app/dist/
RUN npm run build

# ============================================================
# Stage 2: Production — Serve dengan Nginx
# ============================================================
FROM nginx:alpine

# Copy build output from Stage 1
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Copy custom production-ready nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx default port
EXPOSE 80

# Run in foreground
CMD ["nginx", "-g", "daemon off;"]
