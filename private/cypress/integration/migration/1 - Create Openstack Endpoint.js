
// @flow

import config from '../../config'

describe('Create Openstack Endpoint', () => {
  before(() => {
    cy.visit(config.nodeServer)
    cy.get('input[label="Username"]').type(config.username)
    cy.get('input[label="Password"]').type(config.password)
    cy.get('button').click()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('unscopedToken', 'token', 'projectId')
  })

  it('Shows new Openstack endpoint dialog', () => {
    cy.get('div').contains('New').click()
    cy.get('a').contains('Endpoint').click()
    cy.get('div[data-test-id="endpointLogo-openstack"]').click()
  })

  it('Fills Openstack connection info', () => {
    cy.get('div').contains('Advanced').click()
    cy.get('input[placeholder="Name"]').type('e2e-openstack-test')
    cy.get('input[placeholder="Username"]').type(config.endpoints.openstack.username)
    cy.get('input[placeholder="Password"]').type(config.endpoints.openstack.password)
    cy.get('input[placeholder="Auth URL"]').type(config.endpoints.openstack.authUrl)
    cy.get('input[placeholder="Project Name"]').type(config.endpoints.openstack.projectName)
    cy.get('div[data-test-id="dropdown-glance_api_version"]').first().click()
    cy.get('div[data-test-id="dropdownListItem"]').contains('2').click()
    cy.get('div[data-test-id="dropdown-identity_api_version"]').first().click()
    cy.get('div[data-test-id="dropdownListItem"]').contains('3').click()
    cy.get('input[placeholder="Project Domain Name"]').type(config.endpoints.openstack.projectDomainName)
    cy.get('input[placeholder="User Domain Name"]').type(config.endpoints.openstack.userDomainName)

    cy.server()
    cy.route({ url: '**/actions', method: 'POST' }).as('validate')
    cy.get('button').contains('Validate and save').click()
    cy.wait('@validate')
    cy.get('div[data-test-id="endpointStatus"]').should('contain', 'Endpoint is Valid')
  })

  it('Added Openstack to endpoint list', () => {
    cy.visit(`${config.nodeServer}endpoints/`)
    cy.get('div[data-test-id="endpointListItemContent-e2e-openstack-test"]').should('contain', 'e2e-openstack-test')
  })
})
