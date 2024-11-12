# Base Image for Build Stage (Using Debian Buster Slim)
FROM node:20-buster-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Production Stage (smaller runtime image)
FROM gcr.io/distroless/nodejs20 AS production

# Set working directory
WORKDIR /app

# Copy built files and essential packages from the builder stage
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app

# Start the application
CMD ["node", "dist/main.js"]