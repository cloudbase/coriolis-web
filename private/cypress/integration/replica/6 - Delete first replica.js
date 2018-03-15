
// @flow

import config from '../../config'

describe('Delete the first replica', () => {
  before(() => {
    cy.visit(config.nodeServer)
    cy.get('input[label="Username"]').type(config.username)
    cy.get('input[label="Password"]').type(config.password)
    cy.get('button').click()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('unscopedToken', 'token', 'projectId')
  })

  it('Delete replica', () => {
    cy.server()
    cy.route({ url: '**/executions/**', method: 'GET' }).as('executions')
    cy.get('div[data-test-id="mainListItem"]').first().click()
    cy.wait('@executions')
    cy.get('button').last().should('contain', 'Delete Replica').click()
    cy.route({ url: '**/replicas/**', method: 'DELETE' }).as('delete')
    cy.get('button').contains('Yes').click()
    cy.wait('@delete')
  })
})
