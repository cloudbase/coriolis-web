
// @flow

import config from '../../config'

describe('Delete the first migration', () => {
  before(() => {
    cy.visit(config.nodeServer)
    cy.get('input[label="Username"]').type(config.username)
    cy.get('input[label="Password"]').type(config.password)
    cy.get('button').click()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('unscopedToken', 'token', 'projectId')
  })

  it('Deletes migration', () => {
    cy.server()
    cy.route({ url: '**/replicas/**', method: 'GET' }).as('replicas')
    cy.wait('@replicas')
    cy.get('a').contains('Migrations').click()
    cy.get('div[data-test-id="mainListItem"]').first().click()
    cy.get('button').last().should('contain', 'Delete Migration').click()
    cy.route({ url: '**/migrations/**', method: 'DELETE' }).as('delete')
    cy.get('button').contains('Yes').click()
    cy.wait('@delete')
  })
})
