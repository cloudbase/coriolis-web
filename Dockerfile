FROM node:7.9.0-alpine

# Set a working directory
WORKDIR /usr/src/app

COPY ./build/package.json .
COPY yarn.lock .

# Set CORIOLIS_URL
ENV CORIOLIS_URL http://127.0.0.1
COPY ./src/config.sample.js ./src/config.js

# Install Node.js dependencies
RUN yarn install --production --no-progress

# Copy application files
COPY ./build .

EXPOSE 3000

CMD [ "node", "server.js" ]
