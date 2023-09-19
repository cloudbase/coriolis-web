FROM node:18

WORKDIR /root/coriolis-web

COPY ./ .

ENV NODE_OPTIONS=--openssl-legacy-provider

RUN yarn install --production --no-progress
RUN yarn build

ENTRYPOINT [ "yarn", "start" ]
EXPOSE 3000
