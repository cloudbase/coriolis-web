FROM node:22.13.1

WORKDIR /root/coriolis-web

COPY ./ .

ENV NODE_ENV=production

RUN corepack enable
RUN yarn workspaces focus --all --production
RUN npm run build:prod

ENTRYPOINT [ "npm", "run", "start" ]
EXPOSE 3000
