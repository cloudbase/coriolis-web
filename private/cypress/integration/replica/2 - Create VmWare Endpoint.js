
// @flow

import config from '../../config'

describe('Create VmWare Endpoint', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Shows new VmWare endpoint dialog', () => {
    cy.get('div').contains('New').click()
    cy.get('a').contains('Endpoint').click()
    cy.get('div[data-test-id="endpointLogo-vmware_vsphere"]').click()
  })

  it('Fills VmWare connection info', () => {
    cy.get('input[placeholder="Name"]').type('e2e-vmware-test')
    cy.get('input[placeholder="Username"]').type(config.endpoints.vmware.username)
    cy.get('input[placeholder="Password"]').type(config.endpoints.vmware.password)
    cy.get('input[placeholder="Host"]').type(config.endpoints.vmware.host)

    cy.server()
    cy.route({ url: '**/actions', method: 'POST' }).as('validate')
    cy.get('button').contains('Validate and save').click()
    cy.wait('@validate')
    cy.get('div[data-test-id="endpointStatus"]').should('contain', 'Endpoint is Valid')
  })

  it('Added Endpoint to endpoint list', () => {
    cy.visit(`${config.nodeServer}endpoints/`)
    cy.get('div[data-test-id="endpointListItemContent-e2e-vmware-test"]').should('contain', 'e2e-vmware-test')
  })
})
