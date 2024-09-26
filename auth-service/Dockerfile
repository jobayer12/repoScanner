# Use the official Node.js image as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the application port (default for NestJS is 3000)
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]