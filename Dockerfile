FROM node:22-alpine
COPY . /app
WORKDIR /app
RUN npm i -g bun
RUN bun i
RUN bun add -g dotenv-cli
RUN bun run build

CMD ["bun", "run", "start"]
