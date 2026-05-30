FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Create directory for SQLite persistence
RUN mkdir -p data

# Expose port
EXPOSE 5000

# Start server
CMD [ "npm", "start" ]
