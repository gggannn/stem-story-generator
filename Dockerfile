# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:23-slim AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (include devDependencies needed for build)
RUN npm ci && \
    npm cache clean --force


# ============================================
# Stage 2: Builder
# ============================================
FROM node:23-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the application
RUN npm run build

# Remove development dependencies from production build
RUN npm prune --production


# ============================================
# Stage 3: Runner (Production)
# ============================================
FROM node:23-slim AS runner
WORKDIR /app

# Install wget for health checks and dumb-init for proper signal handling
RUN apt-get update && apt-get install -y --no-install-recommends wget dumb-init && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership to non-root user
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
