FROM oven/bun:latest AS base

COPY . /usr/proxy-container
WORKDIR /usr/proxy-container

FROM base AS builder

RUN bun install --filter="@ovencord/proxy-container..."
RUN bun run build --filter="@ovencord/proxy-container..."

FROM builder AS pruned

WORKDIR /usr/proxy-container/pruned
COPY --from=builder /usr/proxy-container .

FROM base AS proxy

WORKDIR /usr/proxy-container
COPY --from=pruned /usr/proxy-container/pruned .

CMD ["bun", "run", "dist/index.js"]
