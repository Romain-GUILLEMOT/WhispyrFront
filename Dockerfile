FROM node:22-alpine
COPY . /app
WORKDIR /app
RUN npm i -g bun dotenv-cli
RUN bun i
RUN bun run build

CMD ["bun", "run", "start"]
