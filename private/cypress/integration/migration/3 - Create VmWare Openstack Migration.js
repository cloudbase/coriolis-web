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

import config from '../../config'

describe('Create VmWare to Openstack Migration', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Shows Wizard page', () => {
    cy.get('div').contains('New').click()
    cy.get('a').contains('Migration').click()
    cy.get('#app').should('contain', 'New Migration')
  })

  it('Chooses VmWare as Source Cloud', () => {
    cy.server()
    cy.route({ url: '**/instances**', method: 'GET' }).as('sourceInstances')
    cy.get('button').contains('Next').click()
    cy.get('div[data-test-id="wEndpointList-dropdown-vmware_vsphere"]').first().click()
    cy.get('div').contains('e2e-vmware-test').click()
    cy.wait('@sourceInstances')
  })

  it('Chooses Openstack as Target Cloud', () => {
    cy.get('button').contains('Next').click()
    cy.get('div[data-test-id="wEndpointList-dropdown-openstack"]').first().click()
    cy.get('div').contains('e2e-openstack-test').click()
  })

  it('Searches and selects instances', () => {
    cy.get('button').contains('Next').click()
    cy.server()
    cy.route({ url: '**/instances**', method: 'GET' }).as('search')
    cy.get('input[placeholder="Search VMs"]').type(config.wizard.instancesSearch)
    cy.wait('@search')
    cy.get('div[data-test-id="wInstances-instanceItem"]').contains(config.wizard.instancesSearch)
    cy.get('div[data-test-id="wInstances-instanceItem"]').its('length').should('be.gt', 0)
    cy.get('div[data-test-id="wInstances-instanceItem"]').eq(config.wizard.instancesSelectItem).click()
  })

  it('Fills Openstack migration info', () => {
    cy.get('button').contains('Next').click()
    cy.get('div').contains('Advanced').click()
    cy.get('input[placeholder="Description"]').type('VmWare Openstack Migration')
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
    cy.get('div[data-test-id="dropdownListItem"]').contains(config.wizard.openstack.network).click()
    cy.get('button').contains('Next').should('not.be.disabled')
  })

  it('Shows summary page', () => {
    cy.get('button').contains('Next').click()
    cy.get('#app').should('contain', 'Summary')
    cy.get('#app').should('contain', 'e2e-vmware-test')
    cy.get('#app').should('contain', 'e2e-openstack-test')
    cy.get('#app').should('contain', 'Coriolis Migration')
    cy.get('#app').should('contain', 'Migration Options')
    cy.get('#app').should('contain', 'VmWare Openstack Migration')
    cy.get('#app').should('contain', 'Networks')
    cy.get('#app').should('contain', 'Instances')
  })

  it('Executes migration', () => {
    cy.server()
    cy.route({ url: '**/migrations', method: 'POST' }).as('migration')
    cy.get('button').contains('Finish').click()
    cy.wait('@migration')
  })

  it('Shows running migration page', () => {
    cy.get('div[data-test-id="statusPill-RUNNING"]').should('exist')
  })
})
