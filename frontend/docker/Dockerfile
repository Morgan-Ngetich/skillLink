# Stage 1: Build
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_API_URL=$VITE_API_URL

# Copy source code
COPY . .
RUN npm run build

# Stage 2: Production with nginx + Node.js 22
FROM node:22-alpine

# Install nginx and openssl
RUN apk add --no-cache nginx openssl

# Create necessary directories
RUN mkdir -p /etc/nginx/ssl /var/log/nginx /var/lib/nginx /run/nginx

# Generate self-signed SSL certificate
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

WORKDIR /app

# Copy built files from build stage
COPY --from=build /app/.output /app/.output
COPY --from=build /app/package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy nginx configs
COPY docker/nginx.prod.conf /etc/nginx/nginx.prod.conf
COPY docker/nginx.local.conf /etc/nginx/nginx.local.conf

# Copy startup script
COPY docker/start-ssl.sh /start-ssl.sh
RUN chmod +x /start-ssl.sh

EXPOSE 80 443

ENTRYPOINT ["/start-ssl.sh"]