
// @flow

describe('Cancel a running migration', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
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
    cy.get('div[data-test-id="mainStatusPill-ERROR"]', { timeout: 120000 })
  })
})
