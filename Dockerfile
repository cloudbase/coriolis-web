FROM node:18

WORKDIR /root/coriolis-web

COPY ./ .

ENV NODE_OPTIONS=--openssl-legacy-provider
ENV NODE_ENV=production

RUN npm install
RUN npm run build

ENTRYPOINT [ "npm", "run", "start" ]
EXPOSE 3000
