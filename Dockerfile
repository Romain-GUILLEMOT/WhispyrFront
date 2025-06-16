FROM oven/bun:alpine AS builder
COPY . /app
WORKDIR /app
RUN bun i
RUN bun run build

CMD ["bun", "run", "start"]
