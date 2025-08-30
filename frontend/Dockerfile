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

# Stage 2: NGINX Server
FROM nginx:1.25-alpine

# Copy both configs
COPY nginx.local.conf /etc/nginx/nginx.local.conf
COPY nginx.prod.conf /etc/nginx/nginx.prod.conf

# Cleanup default static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx switch script
COPY scripts/nginx.sh /scripts/nginx.sh
RUN chmod +x /scripts/nginx.sh

# Use env variable passed at runtime
ENV RAILWAY_ENVIRONMENT=''

RUN echo "Current nginx.conf:" && cat /etc/nginx/nginx.conf

EXPOSE 80
ENTRYPOINT ["/scripts/nginx.sh"]
