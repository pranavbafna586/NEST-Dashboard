# Development mode - No build required
FROM node:20-alpine

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ sqlite-dev

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies with native module rebuilding
# RUN pnpm install --frozen-lockfile --force

# Install dependencies and rebuild better-sqlite3
RUN pnpm install --frozen-lockfile

# Rebuild better-sqlite3 specifically for Alpine Linux
RUN pnpm rebuild better-sqlite3

# Copy source files (excluding node_modules via .dockerignore)
COPY . .

# Ensure better-sqlite3 is properly built for Alpine
# RUN cd node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3 && npm run build-release || true

# Expose the port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=development

# Start the application in development mode
CMD ["pnpm", "dev"]
