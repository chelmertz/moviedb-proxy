FROM node:16-alpine3.11 as deps

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install

FROM node:16-alpine3.11 as run

WORKDIR /app
COPY src ./
COPY --from=deps /app/node_modules ./node_modules
USER node
CMD ["node", "index.js"]

