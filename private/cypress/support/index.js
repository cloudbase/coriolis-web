// @flow

import './commands'

/* eslint func-names: off */
afterEach(function () { if (this.currentTest.state === 'failed') { Cypress.runner.stop() } })
