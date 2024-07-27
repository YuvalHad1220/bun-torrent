# Use a Node.js image to build the project
FROM oven/bun as build

# Set the working directory
WORKDIR /app

# Copy the package.json and install dependencies
COPY ./frontend/package.json ./frontend/bun.lockb /app/frontend/
RUN cd frontend && bun i

# Copy the rest of the frontend code and build the project
COPY ./frontend /app/frontend
RUN cd frontend && bun run build

# Use an Nginx image to serve the built files
FROM nginx:latest

# Copy the built files from the previous stage
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Copy the Nginx configuration file
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
