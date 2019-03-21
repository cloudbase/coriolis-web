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

describe('Delete the Azure endpoint created for e2e testing', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Goes to endpoints page', () => {
    cy.getById('navigation-smallMenuItem-endpoints').click()
    cy.get('#app').should('contain', 'Coriolis Endpoints')
  })

  it('Delete e2e Azure endpoint', () => {
    cy.getById('endpointListItem-content-e2e-azure-test').should('contain', 'e2e-azure-test')
    cy.getById('endpointListItem-content-e2e-azure-test').first().click()
    cy.server()
    cy.route({ url: '**/migrations/**', method: 'GET' }).as('migrations')
    cy.route({ url: '**/replicas/**', method: 'GET' }).as('replicas')
    cy.get('button').contains('Delete Endpoint').click()
    cy.wait(['@migrations', '@replicas'])
    cy.route({ url: '**/endpoints/**', method: 'DELETE' }).as('delete')
    cy.get('button').contains('Yes').click()
    cy.wait('@delete')
  })
})

