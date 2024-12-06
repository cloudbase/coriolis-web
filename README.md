# ![Coriolis Web](/src/components/ui/Logo/images/coriolis-small-black.svg)

Web GUI for [coriolis](https://github.com/cloudbase/coriolis)

[![Build and Test](https://github.com/cloudbase/coriolis-web/actions/workflows/build.yml/badge.svg)](https://github.com/cloudbase/coriolis-web/actions/workflows/build.yml) [![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

## Install instructions

- Install [Node 18](https://nodejs.org/en/download)
- clone repo
- run `corepack enable` for yarn 3 support
- run `yarn install` (development deps) or `yarn workspaces focus --all --production` (production deps)
- set `CORIOLIS_URL` environment variable

## Build instructions

Build the production version of the UI:

- run `npm run build`
- run `npm run start` to start the server

Your server will be running at `http://localhost:3000/` (the port is configurable through `PORT` environment variable)

## Testing

- unit tests can be run using `npm run test`
- run `npm run test-release` to check for Typescript, ESLint and prettier errors. This will also run the unit tests and will try to build and start a production version. If eeverything is OK, it will revert to the development installation.

### Integration tests

Integration tests can be executed using `npm run e2e`. All API calls will be mocked, eliminating the need for a running Coriolis instance.

To run the integration tests, you must set the environment variable `NODE_ENV='development'`, then execute `npm run build` and `npm run start`. It is also recommended to set `CORIOLIS_URL` to a non-existent URL (such as <https://invalidd.it/>) to prevent the UI from attempting to connect to a Coriolis instance for CORS checks. Although Cypress is configured to mock API calls, if a valid URL is set, the UI will still attempt to connect to it for CORS checks.

You can also run the integration tests for easier debugging by using `npm run server-dev` and `npm run client-dev`, and by updating the `baseUrl` in `cypress.config.ts` to `<http://localhost:3001>`. The variables `NODE_ENV` and `CORIOLIS_URL`, as described above, are still required. Subsequently, execute the tests using `npx cypress open`. This procedure allows you to update the source code and see the changes reflected in the UI without having to rebuild and restart the server. Additionally, the tests will automatically re-run when you save a test file.

## Development mode

- set env. variable `NODE_ENV='development'`
- run `npm run client-dev` to start local development server (starts on port 3001)
- run `npm run server-dev` to start the express server in development mode

To debug the client code using VS Code, simply run the project's launch configuration from the 'Run' menu (Ctrl+Shift+D).
The last 2 `npm run ...` commands must be running in the background.

To debug the Node server using VS Code, run `npm run server-debug` instead of `npm run server-dev`.

You can view some of the UIs components in the [Storybook](https://github.com/storybooks/storybook) by running `npm run storybook`

## Modding

The UI can be modded externally using a `.json` modding file. A sample is available in the repo [`ui-mod-sample.json`](ui-mod-sample.json).

The path to the .json mod file needs to be set in `MOD_JSON` environment variable (ex.: `MOD_JSON=/usr/ui-mod.json`).

Any provider logos can be replaced using local logo images. The local image file paths need to be absolute.

You can specify one logo, in which case it will be scaled to all sizes. You can also specify logos for just a couple of the sizes, in which case the closest size to the one required will be used. Open [`ui-mod-sample.json`](ui-mod-sample.json) for more details.

Any option from [`config.ts`](config.ts) can be modified by adding the `config` field to the [`ui-mod-sample.json`](ui-mod-sample.json) file.

## Environment variables

All environment variables can be set in a `.env` file created in the root directory.

The following is the list of environment variables and their default values:

```(bash)
NODE_ENV='production'
CORIOLIS_URL='<your-coriolis-url>'
MOD_JSON='<path-to-json>'
CA_FINGERPRINT='<path to CA fingerprint file used by metal hub agent>'
```
