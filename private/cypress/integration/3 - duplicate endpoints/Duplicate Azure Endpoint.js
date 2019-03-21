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

describe('Duplicate Azure Endpoint', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Creates duplicate', () => {
    cy.getById('navigation-smallMenuItem-endpoints').click()
    cy.getById('endpointListItem-content-e2e-azure-test').should('contain', 'e2e-azure-test')
    cy.getById('endpointListItem-checkbox-e2e-azure-test').click()
    cy.getById('dropdown-dropdownButton').contains('Select an action').click()
    cy.getById('dropdownListItem').contains('Duplicate').click()
    cy.server()
    cy.route({ url: '**/endpoints', method: 'POST' }).as('duplicate')
    cy.get('button').contains('Duplicate').click()
    cy.wait('@duplicate')
  })

  it('Validates duplicated endpoint', () => {
    cy.get('div[data-test-id="endpointListItem-content-e2e-azure-test (copy)"').click()
    cy.server()
    cy.route({ url: '**/actions', method: 'POST' }).as('validate')
    cy.getById('edContent-validateButton').click()
    cy.wait('@validate')
    cy.getById('eValidation-title').should('contain', 'Endpoint is Valid')
    cy.get('button').contains('Dismiss').click()
  })

  it('Deletes duplicated endpoint', () => {
    cy.server()
    cy.route({ url: '**/replicas/detail', method: 'GET' }).as('replicas')
    cy.route({ url: '**/migrations/detail', method: 'GET' }).as('migrations')
    cy.getById('edContent-deleteButton').click()
    cy.wait(['@replicas', '@migrations'])
    cy.route({ url: '**/secrets/**', method: 'DELETE' }).as('delete')
    cy.getById('aModal-yesButton').click()
    cy.wait('@delete')
  })
})
