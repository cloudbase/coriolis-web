# Coriolis UI

### Install instructions
- [node](https://nodejs.org/en/download/package-manager/) >=6.x and [yarn](https://yarnpkg.com/lang/en/docs/install/) are required
- clone repo
- run `yarn install` or `yarn install --production` to install packages and dependencies for development or production mode
- change the `coriolisUrl` variable in ./src/config.js to match the Coriolis Server path


### Build instructions
- run `yarn build`
- run `node server.js` to start the server

Your server will be running at http://localhost:3000/



#### Development mode
- run `yarn start` to start local development server

Your development server will be running at http://localhost:3000/

This should be used only for development, as it contains live-reload and other development tools.

You can view some of the UIs components in the [Storybook](https://github.com/storybooks/storybook) by running `yarn storybook`

### Apache Configuration

#### Apache modules
- enable apache modules: `sudo a2enmod headers`, `sudo a2enmod rewrite`, `sudo a2enmod proxy`, `sudo a2enmod proxy_http`
- restart apache service: `service apache2 restart`

#### Apache CORS config
- add this configuration to .htaccess or apache site configuration

```
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "POST, GET, OPTIONS, DELETE, PUT"
Header always set Access-Control-Max-Age "1000"
Header always set Access-Control-Allow-Headers "x-requested-with, X-Auth-Token, X-Subject-Token, Content-Type, origin, authorization, accept, client-security-token"
Header always set Access-Control-Allow-Credentials "true"
Header add Access-Control-Expose-Headers "X-Subject-Token"
# Added a rewrite to respond with a 200 SUCCESS on every OPTIONS request.
RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# Proxy matches paths to appropiate services
ProxyPassMatch ^/identity/(.*)$ http://127.0.0.1:5000/v3/$1
ProxyPassMatch ^/barbican/(.*)$ http://127.0.0.1:9311/$1
ProxyPassMatch ^/coriolis/(.*)$ http://127.0.0.1:7667/v1/$1
ProxyPassMatch ^/((?!identity|coriolis|barbican).*)$ http://127.0.0.1:3000/$1
```