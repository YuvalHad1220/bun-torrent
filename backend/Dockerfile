# Use the official Bun image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json /app/
RUN bun install

# Copy the rest of the application code
COPY . /app


# Expose port
EXPOSE 8080

# Run the application
CMD ["bun", "index.ts"]
