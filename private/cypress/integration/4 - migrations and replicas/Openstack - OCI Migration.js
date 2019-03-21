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

describe('Create Openstack to OCI Migration', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Shows Wizard page', () => {
    cy.get('div').contains('New').click()
    cy.getById('newItemDropdown-listItem-Migration').click()
    cy.get('#app').should('contain', 'New Migration')
  })

  it('Chooses Openstack as Source Cloud', () => {
    cy.server()
    cy.route({ url: '**/instances**', method: 'GET' }).as('sourceInstances')
    cy.get('button').contains('Next').click()
    cy.getById('wEndpointList-dropdown-openstack').first().click()
    cy.get('div').contains('e2e-openstack-test').click()
    cy.wait('@sourceInstances')
  })

  it('Searches and selects instances', () => {
    cy.get('button').contains('Next').click()
    // cy.server()
    // cy.route({ url: '**/instances**', method: 'GET' }).as('search')
    cy.get('input[placeholder="Search VMs"]').type(config.wizard.instancesSearch.openstackSearchText)
    // cy.wait('@search')
    cy.getById('wInstances-instanceItem').contains(config.wizard.instancesSearch.openstackSearchText)
    cy.getById('wInstances-instanceItem').its('length').should('be.gt', 0)
    cy.getById('wInstances-instanceItem').eq(config.wizard.instancesSearch.openstackItemIndex).click()
  })

  it('Chooses OCI as Target Cloud', () => {
    cy.server()
    cy.get('button').contains('Next').click()
    cy.getById('wEndpointList-dropdown-oci').first().click()
    cy.route({ url: '**/destination-options', method: 'GET' }).as('destOptions')
    cy.get('div').contains('e2e-oci-test').click()
    cy.wait('@destOptions')
  })

  it('Fills OCI migration info', () => {
    cy.get('button').contains('Next').click()
    cy.getById('wOptionsField-enumDropdown-compartment').click()
    cy.getById('dropdownListItem').contains(config.wizard.oci.compartment).click()
    cy.getById('wOptionsField-enumDropdown-availability_domain').click()
    cy.server()
    cy.route({ url: '**/destination-options**', method: 'GET' }).as('destOptions')
    cy.getById('dropdownListItem').contains(config.wizard.oci.availabilityDomain).click()
    cy.wait('@destOptions')
    cy.getById('wOptionsField-enumDropdown-migr_subnet_id').click()
    cy.getById('dropdownListItem').contains(config.wizard.oci.migrSubnetId).click()
  })

  it('Selects first available network mapping', () => {
    cy.server()
    cy.route({ url: '**/networks**', method: 'GET' }).as('networks')
    cy.route({ url: '**/instances/**', method: 'GET' }).as('instances')
    cy.get('button').contains('Next').click()
    cy.wait(['@networks', '@instances'])
    cy.get('button').contains('Next').should('be.disabled')
    cy.getById('networkItem').its('length').should('be.gt', 0)
    cy.get('div[value="Select ..."]').first().click()
    cy.getById('dropdownListItem').first().click()
    cy.get('button').contains('Next').should('not.be.disabled')
  })

  it('Shows summary page', () => {
    cy.get('button').contains('Next').click()
    cy.get('#app').should('contain', 'Summary')
    cy.get('#app').should('contain', 'e2e-openstack-test')
    cy.get('#app').should('contain', 'e2e-oci-test')
    cy.get('#app').should('contain', 'Coriolis Migration')
    cy.get('#app').should('contain', 'Migration Target Options')
    cy.getById('wSummary-optionValue-compartment').should('contain', 'ocid1.compartment')
    cy.getById('wSummary-optionValue-availability_domain').should('contain', config.wizard.oci.availabilityDomain)
    cy.getById('wSummary-optionValue-migr_subnet_id').should('contain', 'ocid1.subnet')
  })

  it('Executes migration', () => {
    cy.server()
    cy.route({ url: '**/migrations', method: 'POST' }).as('migration')
    cy.get('button').contains('Finish').click()
    cy.wait('@migration')
  })

  it('Shows running migration page', () => {
    cy.getById('statusPill-RUNNING').should('exist')
  })

  it('Cancels migration', () => {
    cy.getById('dcHeader-actionButton').click()
    cy.get('*[data-test-id="actionDropdown-listItem-Cancel"]', { timeout: 10000 }).click()
    cy.server()
    cy.route({ url: '**/actions', method: 'POST' }).as('cancel')
    cy.getById('aModal-yesButton').click()
    cy.wait('@cancel')
    cy.get('div[data-test-id="dcHeader-statusPill-ERROR"]', { timeout: 120000 })
  })

  it('Deletes migration', () => {
    cy.getById('dcHeader-actionButton').click()
    cy.getById('actionDropdown-listItem-Delete Migration').click()
    cy.server()
    cy.route({ url: '**/migrations/**', method: 'DELETE' }).as('delete')
    cy.getById('aModal-yesButton').click()
    cy.wait('@delete')
  })
})
