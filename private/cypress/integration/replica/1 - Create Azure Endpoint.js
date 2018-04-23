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

describe('Create Azure Endpoint', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Shows new Azure endpoint dialog', () => {
    cy.get('div').contains('New').click()
    cy.get('a').contains('Endpoint').click()
    cy.get('div[data-test-id="endpointLogo-azure"]').click()
  })

  it('Fills Azure connection info', () => {
    cy.get('input[placeholder="Name"]').type('e2e-azure-test')
    cy.get('div[data-test-id="switch-allow_untrusted"]').click()
    cy.get('input[placeholder="Username"]').type(config.endpoints.azure.username)
    cy.get('input[placeholder="Password"]').type(config.endpoints.azure.password)
    cy.get('input[placeholder="Subscription ID"]').type(config.endpoints.azure.subscriptionId)

    cy.server()
    cy.route({ url: '**/actions', method: 'POST' }).as('validate')
    cy.get('button').contains('Validate and save').click()
    cy.wait('@validate')
    cy.get('div[data-test-id="endpointStatus"]').should('contain', 'Endpoint is Valid')
  })

  it('Added Endpoint to endpoint list', () => {
    cy.visit(`${config.nodeServer}endpoints/`)
    cy.get('div[data-test-id="endpointListItemContent-e2e-azure-test"]').should('contain', 'e2e-azure-test')
  })
})
