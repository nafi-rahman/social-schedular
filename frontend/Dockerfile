# frontend/Dockerfile

# 1. Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
# The NEXT_TELEMETRY_DISABLED=1 prevents unnecessary telemetry logging
RUN NEXT_TELEMETRY_DISABLED=1 npm run build

# 2. Production Stage
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV production
# Next.js defaults to port 3000
ENV PORT 3000

# Copy necessary files from the build stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the Next.js port
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]