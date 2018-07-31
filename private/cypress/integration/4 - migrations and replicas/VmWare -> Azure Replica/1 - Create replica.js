/*
Copyright (C) 2018  Cloudbase Solutions SRL
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// @flow

import config from '../../../config'

describe('Create VmWare to Azure Replica', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
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
    cy.get('div[data-test-id="wEndpointList-dropdown-vmware_vsphere"]').first().click()
    cy.get('div').contains('e2e-vmware-test').click()
    cy.wait('@sourceInstances')
  })

  it('Chooses Azure as Target Cloud', () => {
    cy.get('button').contains('Next').click()
    cy.get('div[data-test-id="wEndpointList-dropdown-azure"]').first().click()
    cy.get('div').contains('e2e-azure-test').click()
  })

  it('Searches and selects instances', () => {
    cy.get('button').contains('Next').click()
    cy.server()
    cy.route({ url: '**/instances**', method: 'GET' }).as('search')
    cy.get('input[placeholder="Search VMs"]').type(config.wizard.instancesSearch.vmwareSearchText)
    cy.wait('@search')
    cy.get('div[data-test-id="wInstances-instanceItem"]').contains(config.wizard.instancesSearch.vmwareSearchText)
    cy.get('div[data-test-id="wInstances-instanceItem"]').its('length').should('be.gt', 0)
    cy.get('div[data-test-id="wInstances-instanceItem"]').eq(config.wizard.instancesSearch.vmwareItemIndex).click()
  })

  it('Fills Azure replica info', () => {
    cy.get('button').contains('Next').click()
    cy.get('div[data-test-id="wOptionsField-enumDropdown-resource_group"]').first().click()
    cy.server()
    cy.route({ url: '**/destination-options**', method: 'GET' }).as('dest-options')
    cy.get('div[data-test-id="dropdownListItem"]').contains(config.wizard.azure.resourceGroup.label).click()
    cy.wait('@dest-options')
  })

  it('Selects first available network mapping', () => {
    cy.server()
    cy.route({ url: '**/networks**', method: 'GET' }).as('networks')
    cy.route({ url: '**/instances/**', method: 'GET' }).as('instances')
    cy.get('button').contains('Next').click()
    cy.wait(['@networks', '@instances'])
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
    cy.get('div[data-test-id="wSummary-optionValue-resource_group"]').should('contain', config.wizard.azure.resourceGroup.value)
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

  it('Cancels replica execution', () => {
    cy.server()
    cy.get('button').contains('Cancel Execution').click()
    cy.route({ url: '**/actions', method: 'POST' }).as('cancel')
    cy.get('button').contains('Yes').click()
    cy.wait('@cancel')
    cy.get('div[data-test-id="dcHeader-statusPill-ERROR"]', { timeout: 120000 })
  })

  it('Should show in usage message when trying to delete', () => {
    cy.get('div[data-test-id="dcHeader-backButton"]').click()
    cy.get('a[data-test-id="navigation-item-endpoints"]').click()
    cy.get('div[data-test-id="endpointListItem-content-e2e-azure-test"]').click()
    cy.get('button').contains('Delete Endpoint').click()
    cy.get('div[data-test-id="alertModal"]').should('contain', 'The endpoint can\'t be deleted because it is in use by replicas or migrations.')
    cy.get('button[data-test-id="aModal-dismissButton"]').click()
  })
})
