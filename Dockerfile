# Dockerfile for full-stack deployment
FROM node:20-alpine AS build

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install all dependencies (including devDependencies for compiling)
RUN npm ci

# Copy application source code
COPY . .

# Build the application (runs Vite build + esbuild bundle for backend)
RUN npm run build

# Stage 2: Compact production runtime image
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy package manifest and production-ready built artifacts
COPY package*.json ./
COPY --from=build /app/dist ./dist

# Install production dependencies only to keep the image slim and stable
RUN npm ci --only=production

# Expose fallback port 3000
EXPOSE 3000

# Run the compiled backend Express/Vite wrapper
CMD ["node", "dist/server.cjs"]
