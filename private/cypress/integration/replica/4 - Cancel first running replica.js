
// @flow

describe('Cancel a running replica', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Cancels replica execution', () => {
    cy.server()
    cy.route({ url: '**/executions/detail', method: 'GET' }).as('execution')
    cy.get('div[data-test-id="statusPill-RUNNING"]').eq(0).click()
    cy.wait('@execution')
    cy.get('a').contains('Executions').click()
    cy.get('button').contains('Cancel Execution').click()
    cy.route({ url: '**/actions', method: 'POST' }).as('cancel')
    cy.get('button').contains('Yes').click()
    cy.wait('@cancel')
    cy.get('div[data-test-id="mainStatusPill-ERROR"]', { timeout: 120000 })
  })
})
