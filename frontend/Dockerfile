# Stage 1: Build
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# After RUN npm run build, add:
RUN echo "=== BUILD OUTPUT CHECK ===" && \
    ls -la dist/ && \
    echo "=== DIST/SERVER CHECK ===" && \
    ls -la dist/server/ && \
    echo "=== CHECKING ENTRY SERVER ===" && \
    cat dist/server/entry-server.js | head -20 || echo "No entry-server.js found"
    
# Stage 2: Production with nginx + Node.js
FROM nginx:1.25-alpine

RUN apk add --no-cache openssl nodejs npm

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Generate self-signed SSL certificate
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Create app directory for Node.js
RUN mkdir -p /app
WORKDIR /app

# Copy built files
COPY --from=build /app/dist/client /usr/share/nginx/html
COPY --from=build /app/dist/server /app/dist/server
COPY --from=build /app/package*.json ./
COPY --from=build /app/scripts/server.js ./scripts/

# Install production dependencies only
RUN npm install --production

# Copy nginx config
COPY nginx.prod.conf /etc/nginx/nginx.conf

# Copy startup script
COPY scripts/start-ssl.sh /scripts/start-ssl.sh
RUN chmod +x /scripts/start-ssl.sh

EXPOSE 80 433
ENTRYPOINT ["/scripts/start-ssl.sh"]