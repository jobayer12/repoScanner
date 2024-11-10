# Base Image for Build Stage (Using Debian Buster Slim)
FROM node:20-buster-slim AS builder

# Set working directory
WORKDIR /app

# Install essential build dependencies (libzmq3-dev instead of zeromq)
RUN apt update && apt install -y python3 make

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies (excluding optional dependencies)
RUN npm install --no-optional --build-from-source && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Production Stage (smaller runtime image)
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy built files and essential packages from the builder stage
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app
COPY --from=builder /app/node_modules /app/node_modules

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]