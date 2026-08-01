# Step 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci || npm install
COPY frontend/ ./
ENV VITE_API_BASE_URL=""
RUN npm run build

# Step 2: Production Image with PHP, Node.js, and Nginx
FROM php:8.2-cli-alpine

# Install Nginx, Node.js, npm, bash, and PHP extensions
RUN apk add --no-cache \
    nginx \
    nodejs \
    npm \
    bash \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    libxml2-dev

RUN docker-php-ext-install pdo pdo_mysql mbstring

WORKDIR /app

# Copy backend dependencies & code
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

COPY backend/ ./backend/

# Copy built frontend static assets
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy Nginx template and startup script
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Render dynamically sets PORT environment variable (default 10000)
EXPOSE 10000

CMD ["/app/start.sh"]
