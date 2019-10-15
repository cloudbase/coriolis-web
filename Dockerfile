FROM node:12.5.0

WORKDIR /usr/src/app
COPY . .

RUN yarn install --production
RUN yarn build

ENTRYPOINT [ "node", "server.js" ]

EXPOSE 3000
