# Stage 1: Build
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

# Accept VITE_ environment variables as build args
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Optional: echo to verify (fixed the typo)
RUN echo "Using VITE_SUPABASE_URL=$VITE_SUPABASE_URL"
RUN echo "Using VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY"

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY


COPY . .

# Vite will pick up VITE_ vars from the environment during this build
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:1.25-alpine
RUN apk add --no-cache gettext

RUN mkdir -p /usr/share/nginx/html
# Remove default static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx config template
COPY nginx.template.conf /etc/nginx/nginx.template.conf

# Copy the entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# After copying files in final stage
EXPOSE 80

# Use the entrypoint to inject env vars and start Nginx
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
