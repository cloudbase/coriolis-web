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

declare var expect: any

describe('Delete the Openstack and VmWare endpoints created for e2e testing', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Goes to endpoints page', () => {
    cy.get('#app').should('contain', 'Coriolis Replicas')
    cy.visit(`${config.nodeServer}#/endpoints`)
    cy.get('#app').should('contain', 'Coriolis Endpoints')
  })

  it('Selects both endpoints', () => {
    cy.get('[data-test-id="endpointListItem-checkbox-e2e-openstack-test"]').should('have.length', 1)
    cy.get('[data-test-id="endpointListItem-checkbox-e2e-vmware-test"]').should('have.length', 1)
    cy.get('[data-test-id="endpointListItem-checkbox-e2e-openstack-test"]').click()
    cy.get('[data-test-id="endpointListItem-checkbox-e2e-vmware-test"]').click()
    cy.get('[data-test-id="mainListFilter-selectionText"]').should('contain', '2 of 2')
  })

  it('Deletes selected endpoints', () => {
    cy.get('div[data-test-id="dropdown-dropdownButton"]').contains('Select an action').click()
    cy.get('div[data-test-id="dropdownListItem"]').contains('Delete').click()
    cy.server()
    cy.route({ url: '**/secrets/**', method: 'DELETE' }).as('delete')
    cy.get('[data-test-id="aModal-yesButton"]').click()
    cy.wait(['@delete', '@delete'])
    cy.get('[data-test-id="endpointListItem-checkbox-e2e-openstack-test"]').should('have.length', 0)
    cy.get('[data-test-id="endpointListItem-checkbox-e2e-vmware-test"]').should('have.length', 0)
  })
})
