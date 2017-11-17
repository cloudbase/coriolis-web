FROM node:9.2.0

RUN curl -o- -L https://yarnpkg.com/install.sh | bash

WORKDIR /usr/src/app
COPY . .

RUN yarn install --production
RUN yarn build

ENTRYPOINT [ "node", "server.js" ]

EXPOSE 3000