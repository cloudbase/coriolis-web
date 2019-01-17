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
    cy.get('a').contains('Migration').click()
    cy.get('#app').should('contain', 'New Migration')
  })

  it('Chooses Openstack as Source Cloud', () => {
    cy.server()
    cy.route({ url: '**/instances**', method: 'GET' }).as('sourceInstances')
    cy.get('button').contains('Next').click()
    cy.get('div[data-test-id="wEndpointList-dropdown-openstack"]').first().click()
    cy.get('div').contains('e2e-openstack-test').click()
    cy.wait('@sourceInstances')
  })

  it('Chooses OCI as Target Cloud', () => {
    cy.server()
    cy.get('button').contains('Next').click()
    cy.get('div[data-test-id="wEndpointList-dropdown-oci"]').first().click()
    cy.route({ url: '**/destination-options', method: 'GET' }).as('destOptions')
    cy.get('div').contains('e2e-oci-test').click()
    cy.wait('@destOptions')
  })

  it('Searches and selects instances', () => {
    cy.get('button').contains('Next').click()
    cy.server()
    cy.route({ url: '**/instances**', method: 'GET' }).as('search')
    cy.get('input[placeholder="Search VMs"]').type(config.wizard.instancesSearch.ociSearchText)
    cy.wait('@search')
    cy.get('div[data-test-id="wInstances-instanceItem"]').contains(config.wizard.instancesSearch.ociSearchText)
    cy.get('div[data-test-id="wInstances-instanceItem"]').its('length').should('be.gt', 0)
    cy.get('div[data-test-id="wInstances-instanceItem"]').eq(config.wizard.instancesSearch.ociItemIndex).click()
  })

  it('Fills OCI migration info', () => {
    cy.get('button').contains('Next').click()
    cy.get('div[data-test-id="wOptionsField-enumDropdown-compartment"]').click()
    cy.get('div[data-test-id="dropdownListItem"]').contains(config.wizard.oci.compartment.label).click()
    cy.get('div[data-test-id="wOptionsField-enumDropdown-availability_domain"]').click()
    cy.server()
    cy.route({ url: '**/destination-options**', method: 'GET' }).as('destOptions')
    cy.get('div[data-test-id="dropdownListItem"]').contains(config.wizard.oci.availabilityDomain).click()
    cy.wait('@destOptions')
    cy.get('div[data-test-id="wOptionsField-enumDropdown-migr_subnet_id"]').click()
    cy.get('div[data-test-id="dropdownListItem"]').contains(config.wizard.oci.migrSubnetId.label).click()
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

  it('Shows summary page', () => {
    cy.get('button').contains('Next').click()
    cy.get('#app').should('contain', 'Summary')
    cy.get('#app').should('contain', 'e2e-openstack-test')
    cy.get('#app').should('contain', 'e2e-oci-test')
    cy.get('#app').should('contain', 'Coriolis Migration')
    cy.get('#app').should('contain', 'Migration Options')
    cy.get('div[data-test-id="wSummary-optionValue-compartment"]').should('contain', config.wizard.oci.compartment.value)
    cy.get('div[data-test-id="wSummary-optionValue-availability_domain"]').should('contain', config.wizard.oci.availabilityDomain)
    cy.get('div[data-test-id="wSummary-optionValue-migr_subnet_id"]').should('contain', config.wizard.oci.migrSubnetId.value)
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

  it('Cancels migration', () => {
    cy.server()
    cy.get('button', { timeout: 10000 }).contains('Cancel').click()
    cy.route({ url: '**/actions', method: 'POST' }).as('cancel')
    cy.get('button').contains('Yes').click()
    cy.wait('@cancel')
    cy.get('div[data-test-id="dcHeader-statusPill-ERROR"]', { timeout: 120000 })
  })

  it('Deletes migration', () => {
    cy.get('a[data-test-id="detailsNavigation-"]').click()
    cy.get('button').contains('Delete Migration').click()
    cy.server()
    cy.route({ url: '**/migrations/**', method: 'DELETE' }).as('delete')
    cy.get('button').contains('Yes').click()
    cy.wait('@delete')
  })
})
