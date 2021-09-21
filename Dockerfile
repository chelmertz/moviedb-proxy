FROM node:16-alpine3.11 as build

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . ./
RUN yarn build


FROM node:16-alpine3.11 as run

WORKDIR /app
COPY --from=build /app/dist/index.js ./
COPY --from=build /app/node_modules ./node_modules
USER node
CMD ["node", "index.js"]

