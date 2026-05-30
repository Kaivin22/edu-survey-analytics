# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
# Install packages
RUN npm install

COPY . .

# Set default API URL environment variable at build time
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

# Build static assets
RUN npm run build

# Stage 2: Serve stage (extremely lightweight)
FROM nginx:alpine

# Copy built files from build stage to nginx html serving folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for React SPA routing support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
