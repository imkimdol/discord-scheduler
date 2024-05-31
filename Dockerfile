FROM node:18-alpine

WORKDIR /bot

RUN yarn global add pm2

COPY package.json ./
COPY yarn.lock ./
RUN yarn install

COPY tsconfig.json ./
COPY ./src ./src
RUN yarn run compile

COPY .env ./
RUN yarn run deploy all

CMD yarn run start-runtime