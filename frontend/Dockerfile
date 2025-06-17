# Stage 1: Build
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:1.25-alpine

# Remove default config if any
RUN rm -rf /usr/share/nginx/html/*

# Copy build output to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Add custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
