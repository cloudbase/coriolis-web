/*
Copyright (C) 2018  Cloudbase Solutions SRL
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// @flow

import config from '../../config'

describe('Create OCI Endpoint', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Shows new OCI endpoint dialog', () => {
    cy.get('div').contains('New').click()
    cy.get('a').contains('Endpoint').click()
    cy.get('div[data-test-id="cProvider-endpointLogo-oci"]').click()
  })

  it('Fills OCI connection info', () => {
    cy.get('input[data-test-id="endpointField-textInput-name"]').type('e2e-oci-test')
    cy.get('textarea[data-test-id="endpointField-textArea-private_key_data"]').type(config.endpoints.oci.privateKeyData, { delay: 0 })
    cy.get('input[data-test-id="endpointField-textInput-region"]').type(config.endpoints.oci.region)
    cy.get('input[data-test-id="endpointField-textInput-tenancy"]').type(config.endpoints.oci.tenancy)
    cy.get('input[data-test-id="endpointField-textInput-user"]').type(config.endpoints.oci.user)
    cy.get('input[data-test-id="endpointField-textInput-private_key_passphrase"]').type(config.endpoints.oci.privateKeyPassphrase)
    cy.server()
    cy.route({ url: '**/actions', method: 'POST' }).as('validate')
    cy.get('button').contains('Validate and save').click()
    cy.wait('@validate')
    cy.get('div[data-test-id="endpointStatus"]').should('contain', 'Endpoint is Valid')
  })

  it('Added Endpoint to endpoint list', () => {
    cy.get('a[data-test-id="navigation-item-endpoints"]').click()
    cy.get('div[data-test-id="endpointListItem-content-e2e-oci-test"]').should('contain', 'e2e-oci-test')
  })
})
