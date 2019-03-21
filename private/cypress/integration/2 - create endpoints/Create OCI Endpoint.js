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
    cy.getById('newItemDropdown-listItem-Endpoint').click()
    cy.getById('cProvider-endpointLogo-oci').click()
  })

  it('Fills OCI connection info', () => {
    cy.getById('endpointField-textInput-name', 'input').type('e2e-oci-test')
    cy.getById('endpointField-textArea-private_key_data', 'textarea')
      .type(config.endpoints.oci.privateKeyData, { delay: 0 })
    cy.getById('endpointField-textInput-region', 'input').type(config.endpoints.oci.region)
    cy.getById('endpointField-textInput-tenancy', 'input').type(config.endpoints.oci.tenancy)
    cy.getById('endpointField-textInput-user', 'input').type(config.endpoints.oci.user)
    cy.getById('endpointField-textInput-private_key_passphrase', 'input').type(config.endpoints.oci.privateKeyPassphrase)
    cy.server()
    cy.route({ url: '**/actions', method: 'POST' }).as('validate')
    cy.get('button').contains('Validate and save').click()
    cy.wait('@validate')
    cy.getById('endpointStatus').should('contain', 'Endpoint is Valid')
  })

  it('Added Endpoint to endpoint list', () => {
    cy.getById('navigation-smallMenuItem-endpoints').click()
    cy.getById('endpointListItem-content-e2e-oci-test').should('contain', 'e2e-oci-test')
  })
})
