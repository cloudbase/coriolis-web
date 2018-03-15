
// @flow

import config from '../../config'

describe('Cannot delete used endpoint', () => {
  before(() => {
    cy.visit(config.nodeServer)
    cy.get('input[label="Username"]').type(config.username)
    cy.get('input[label="Password"]').type(config.password)
    cy.get('button').click()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('unscopedToken', 'token', 'projectId')
  })

  it('Should show in usage message when trying to delete', () => {
    cy.get('div').contains('Cloud Endpoints').first().click()
    cy.get('div[data-test-id="endpointListItemContent-e2e-azure-test"]').click()
    cy.get('button').contains('Delete Endpoint').click()
    cy.get('div[data-test-id="alertModal"]').should('contain', 'The endpoint can\'t be deleted because it is in use by replicas or migrations.')
  })
})
