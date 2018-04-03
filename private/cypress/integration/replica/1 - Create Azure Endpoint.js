
// @flow

import config from '../../config'

describe('Create Azure Endpoint', () => {
  before(() => {
    cy.visit(config.nodeServer)
    cy.get('input[label="Username"]').type(config.username)
    cy.get('input[label="Password"]').type(config.password)
    cy.get('button').click()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('unscopedToken', 'token', 'projectId')
  })

  it('Shows new Azure endpoint dialog', () => {
    cy.get('div').contains('New').click()
    cy.get('a').contains('Endpoint').click()
    cy.get('div[data-test-id="endpointLogo-azure"]').click()
  })

  it('Fills Azure connection info', () => {
    cy.get('input[placeholder="Name"]').type('e2e-azure-test')
    cy.get('div[data-test-id="switch-allow_untrusted"]').click()
    cy.get('input[placeholder="Username"]').type(config.endpoints.azure.username)
    cy.get('input[placeholder="Password"]').type(config.endpoints.azure.password)
    cy.get('input[placeholder="Subscription ID"]').type(config.endpoints.azure.subscriptionId)

    cy.server()
    cy.route({ url: '**/actions', method: 'POST' }).as('validate')
    cy.get('button').contains('Validate and save').click()
    cy.wait('@validate')
    cy.get('div[data-test-id="endpointStatus"]').should('contain', 'Endpoint is Valid')
  })

  it('Added Endpoint to endpoint list', () => {
    cy.visit(`${config.nodeServer}endpoints/`)
    cy.get('div[data-test-id="endpointListItemContent-e2e-azure-test"]').should('contain', 'e2e-azure-test')
  })
})
