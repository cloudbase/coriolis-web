
// @flow

import config from '../../config'

describe('Cancel a running replica', () => {
  before(() => {
    cy.visit(config.nodeServer)
    cy.get('input[label="Username"]').type(config.username)
    cy.get('input[label="Password"]').type(config.password)
    cy.get('button').click()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('unscopedToken', 'token', 'projectId')
  })

  it('Cancels replica execution', () => {
    cy.get('div[data-test-id="statusPill-RUNNING"]').eq(0).click()
    cy.get('a').contains('Executions').click()
    cy.server()
    cy.get('button').contains('Cancel Execution').click()
    cy.route({ url: '**/actions', method: 'POST' }).as('cancel')
    cy.get('button').contains('Yes').click()
    cy.wait('@cancel')
  })
})
