# Base Image for Build Stage
FROM node:20-buster-slim AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install development and production dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Production Stage (smaller runtime image)
FROM node:20-buster-slim AS production

# Set the working directory inside the container
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app

# Set environment variables
ENV NODE_ENV=prod

# Expose the application's port (update if using a different port)
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main.js"]
