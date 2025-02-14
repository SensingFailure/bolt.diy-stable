ARG BASE=node:20.18.0
FROM ${BASE} AS base

WORKDIR /app

# Install dependencies (this step is cached as long as the dependencies don't change)
COPY package.json pnpm-lock.yaml ./

RUN npm install -g corepack@latest && \
    corepack enable pnpm && \
    pnpm install

# Copy the rest of your app's source code
COPY . .

# Make bindings.sh executable and ensure correct line endings
RUN chmod +x bindings.sh && \
    sed -i 's/\r$//' bindings.sh

# Expose the port the app runs on
EXPOSE 5173

# Production image
FROM base AS bolt-ai-production

# Define environment variables with default values or let them be overridden
ARG AWS_BEDROCK_CONFIG
ARG VITE_LOG_LEVEL=debug
ARG DEFAULT_NUM_CTX

ENV PORT=5173 \
    AWS_BEDROCK_CONFIG=${AWS_BEDROCK_CONFIG} \
    VITE_LOG_LEVEL=${VITE_LOG_LEVEL} \
    DEFAULT_NUM_CTX=${DEFAULT_NUM_CTX}\
    RUNNING_IN_DOCKER=true \
    NODE_ENV=production

# Build the application
RUN pnpm run build

# Start the server using the production server
CMD ["pnpm", "run", "dockerstart"]

# Development image
FROM base AS bolt-ai-development

# Define the same environment variables for development
ARG VITE_LOG_LEVEL=debug
ARG DEFAULT_NUM_CTX

ENV AWS_BEDROCK_CONFIG=${AWS_BEDROCK_CONFIG} \
    VITE_LOG_LEVEL=${VITE_LOG_LEVEL} \
    DEFAULT_NUM_CTX=${DEFAULT_NUM_CTX}\
    RUNNING_IN_DOCKER=true

RUN mkdir -p ${WORKDIR}/run
CMD pnpm run dev --host
