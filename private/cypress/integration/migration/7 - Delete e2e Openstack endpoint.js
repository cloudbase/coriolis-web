
// @flow

import config from '../../config'

describe('Delete the Openstack endpoint created for e2e testing', () => {
  before(() => {
    cy.visit(config.nodeServer)
    cy.get('input[label="Username"]').type(config.username)
    cy.get('input[label="Password"]').type(config.password)
    cy.get('button').click()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('unscopedToken', 'token', 'projectId')
  })

  it('Goes to endpoints page', () => {
    cy.get('#app').should('contain', 'Coriolis Replicas')
    cy.visit(`${config.nodeServer}#/endpoints`)
    cy.get('#app').should('contain', 'Coriolis Endpoints')
  })

  it('Delete e2e Openstack endpoint', () => {
    cy.get('div[data-test-id="endpointListItemContent-e2e-openstack-test"]').should('contain', 'e2e-openstack-test')
    cy.get('div[data-test-id="endpointListItemContent-e2e-openstack-test"]').first().click()
    cy.server()
    cy.route({ url: '**/migrations/**', method: 'GET' }).as('migrations')
    cy.route({ url: '**/replicas/**', method: 'GET' }).as('replicas')
    cy.get('button').contains('Delete Endpoint').click()
    cy.wait('@migrations')
    cy.wait('@replicas')
    cy.get('button').contains('Yes').click()
  })
})

