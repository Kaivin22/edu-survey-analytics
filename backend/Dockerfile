FROM node:20-alpine

# Set environment to production
ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Create folder for SQLite persistence
RUN mkdir -p data

# Expose port
EXPOSE 5000

# Start server
CMD [ "npm", "start" ]
