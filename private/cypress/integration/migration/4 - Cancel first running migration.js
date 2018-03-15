
// @flow

import config from '../../config'

describe('Cancel a running migration', () => {
  before(() => {
    cy.visit(config.nodeServer)
    cy.get('input[label="Username"]').type(config.username)
    cy.get('input[label="Password"]').type(config.password)
    cy.get('button').click()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('unscopedToken', 'token', 'projectId')
  })

  it('Cancels migration', () => {
    cy.server()
    cy.route({ url: '**/replicas/**', method: 'GET' }).as('replicas')
    cy.wait('@replicas')
    cy.get('a').contains('Migrations').click()
    cy.get('div[data-test-id="statusPill-RUNNING"]').eq(0).click()
    cy.get('button').contains('Cancel').click()
    cy.route({ url: '**/actions', method: 'POST' }).as('cancel')
    cy.get('button').contains('Yes').click()
    cy.wait('@cancel')
  })
})
