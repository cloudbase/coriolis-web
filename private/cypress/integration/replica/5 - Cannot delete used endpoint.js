
// @flow

describe('Cannot delete used endpoint', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Should show in usage message when trying to delete', () => {
    cy.get('div').contains('Cloud Endpoints').first().click()
    cy.get('div[data-test-id="endpointListItemContent-e2e-azure-test"]').click()
    cy.get('button').contains('Delete Endpoint').click()
    cy.get('div[data-test-id="alertModal"]').should('contain', 'The endpoint can\'t be deleted because it is in use by replicas or migrations.')
  })
})
