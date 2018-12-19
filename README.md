# ![Coriolis Web](/src/components/atoms/Logo/images/coriolis-small-black.svg)

Web  GUI for [coriolis](https://github.com/cloudbase/coriolis)

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
   
### Install instructions
- [node](https://nodejs.org/en/download/package-manager/) >=6.x and [yarn](https://yarnpkg.com/lang/en/docs/install/) are required
- clone repo
- run `yarn install` or `yarn install --production` to install packages and dependencies for development or production mode
- change the `coriolisUrl` variable in ./src/config.js to match the Coriolis Server path


### Build instructions
- run `yarn build`
- run `node server.js` to start the server

Your server will be running at http://localhost:3000/

### Testing

- unit tests can be run using `yarn test`
- e2e integration tests can be run using `yarn cypress`. First though, you have to create the `private/cypress/config.js` file using `private/cypress/config.template.js` as a template and then run `yarn build` and `node server`.

### Development mode
- run `yarn start` to start local development server

Your development server will be running at http://localhost:3000/

This should be used only for development, as it contains live-reload and other development tools.

You can view some of the UIs components in the [Storybook](https://github.com/storybooks/storybook) by running `yarn storybook`
