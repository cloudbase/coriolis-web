# ![Coriolis Web](/src/components/atoms/Logo/images/coriolis-small-black.svg)

Web  GUI for [coriolis](https://github.com/cloudbase/coriolis)

![CI Badge](https://github.com/cloudbase/coriolis-web/workflows/Master/badge.svg) [![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

## Install instructions

- [node](https://nodejs.org/en/download/package-manager/) >=6.x and [yarn](https://yarnpkg.com/lang/en/docs/install/) are required
- clone repo
- run `yarn install` or `yarn install --production` to install packages and dependencies for development or production mode
- change the `coriolisUrl` variable in ./src/config.js to match the Coriolis Server path

## Build instructions

- run `yarn build`
- run `node server.js` to start the server

Your server will be running at `http://localhost:3000/`

## Testing

- unit tests can be run using `yarn test`
- e2e integration tests can be run using `yarn cypress`. First though, you have to create the `private/cypress/config.js` file using `private/cypress/config.template.js` as a template and then run `yarn build` and `node server`.

## Development mode

- run `yarn start` to start local development server

Your development server will be running at `http://localhost:3000/`

This should be used only for development, as it contains live-reload and other development tools.

You can view some of the UIs components in the [Storybook](https://github.com/storybooks/storybook) by running `yarn storybook`

## Modding

The UI can be modded externally using a `.json` modding file. A sample is available in the repo [`ui-mod-sample.json`](ui-mod-sample.json).

The path to the .json mod file needs to be set in `MOD_JSON` environment variable (ex.: `MOD_JSON=/usr/ui-mod.json`).

Any provider logos can be replaced using local logo images. The local image file paths need to be absolute.

You can specify one logo, in which case it will be scaled to all sizes. You can also specify logos for just a couple of the sizes, in which case the closest size to the one required will be used. Open [`ui-mod-sample.json`](ui-mod-sample.json) for more details.

Any option from [`config.js`](config.js) can be modified by adding the `config` field to the [`ui-mod-sample.json`](ui-mod-sample.json) file.
