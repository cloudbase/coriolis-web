
// @flow

import config from '../../config'

describe('Create VmWare to Azure Replica', () => {
  before(() => {
    cy.visit(config.nodeServer)
    cy.get('input[label="Username"]').type(config.username)
    cy.get('input[label="Password"]').type(config.password)
    cy.get('button').click()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('unscopedToken', 'token', 'projectId')
  })

  it('Shows Wizard page', () => {
    cy.get('div').contains('New').click()
    cy.get('a').contains('Replica').click()
    cy.get('#app').should('contain', 'New Replica')
  })

  it('Chooses VmWare as Source Cloud', () => {
    cy.server()
    cy.route({ url: '**/instances**', method: 'GET' }).as('sourceInstances')
    cy.get('button').contains('Next').click()
    cy.get('div[data-test-id="dropdown-vmware_vsphere"]').first().click()
    cy.get('div').contains('e2e-vmware-test').click()
    cy.wait('@sourceInstances')
  })

  it('Chooses Azure as Target Cloud', () => {
    cy.get('button').contains('Next').click()
    cy.get('div[data-test-id="dropdown-azure"]').first().click()
    cy.get('div').contains('e2e-azure-test').click()
  })

  it('Searches and selects instances', () => {
    cy.get('button').contains('Next').click()
    cy.server()
    cy.route({ url: '**/instances**', method: 'GET' }).as('search')
    cy.get('input[placeholder="Search VMs"]').type(config.wizard.instancesSearch)
    cy.wait('@search')
    cy.get('div[data-test-id="instanceItem"]').contains(config.wizard.instancesSearch)
    cy.get('div[data-test-id="instanceItem"]').its('length').should('be.gt', 0)
    cy.get('div[data-test-id="instanceItem"]').eq(config.wizard.instancesSelectItem).click()
  })

  it('Fills Azure replica info', () => {
    cy.get('button').contains('Next').click()
    cy.get('div[data-test-id="dropdown-location"]').first().click()
    cy.get('div[data-test-id="dropdownListItem"]').contains(config.wizard.azure.location.label).click()
    cy.get('div[data-test-id="dropdown-resource_group"]').first().click()
    cy.get('div[data-test-id="dropdownListItem"]').contains(config.wizard.azure.resourceGroup.label).click()
  })

  it('Selects first available network mapping', () => {
    cy.server()
    cy.route({ url: '**/networks**', method: 'GET' }).as('networks')
    cy.route({ url: '**/instances/**', method: 'GET' }).as('instances')
    cy.get('button').contains('Next').click()
    cy.wait('@networks')
    cy.wait('@instances')
    cy.get('button').contains('Next').should('be.disabled')
    cy.get('div[data-test-id="networkItem"]').its('length').should('be.gt', 0)
    cy.get('div[value="Select ..."]').first().click()
    cy.get('div[data-test-id="dropdownListItem"]').first().click()
    cy.get('button').contains('Next').should('not.be.disabled')
  })

  it('Shows schedule page', () => {
    cy.get('button').contains('Next').click()
    cy.get('#app').should('contain', 'Schedule')
  })

  it('Shows summary page', () => {
    cy.get('button').contains('Next').click()
    cy.get('#app').should('contain', 'Summary')
    cy.get('#app').should('contain', 'e2e-vmware-test')
    cy.get('#app').should('contain', 'e2e-azure-test')
    cy.get('#app').should('contain', 'Coriolis Replica')
    cy.get('#app').should('contain', 'Replica Options')
    cy.get('#app').should('contain', config.wizard.azure.location.value)
    cy.get('#app').should('contain', config.wizard.azure.resourceGroup.value)
    cy.get('#app').should('contain', 'Networks')
    cy.get('#app').should('contain', 'Instances')
  })

  it('Executes replica', () => {
    cy.server()
    cy.route({ url: '**/replicas', method: 'POST' }).as('replica')
    cy.get('button').contains('Finish').click()
    cy.wait('@replica')
  })

  it('Shows running replica page', () => {
    cy.get('div[data-test-id="statusPill-RUNNING"]').should('exist')
  })
})
