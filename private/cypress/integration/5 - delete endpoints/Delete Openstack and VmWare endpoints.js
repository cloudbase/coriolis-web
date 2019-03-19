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

describe('Delete the Openstack and VmWare endpoints created for e2e testing', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Goes to endpoints page', () => {
    cy.getById('navigation-smallMenuItem-endpoints').click()
    cy.get('#app').should('contain', 'Coriolis Endpoints')
  })

  it('Selects both endpoints', () => {
    cy.getById('endpointListItem-checkbox-e2e-openstack-test').should('have.length', 1)
    cy.getById('endpointListItem-checkbox-e2e-vmware-test').should('have.length', 1)
    cy.getById('endpointListItem-checkbox-e2e-openstack-test').click()
    cy.getById('endpointListItem-checkbox-e2e-vmware-test').click()
    cy.getById('mainListFilter-selectionText').should('contain', '2 of 2')
  })

  it('Deletes selected endpoints', () => {
    cy.getById('dropdown-dropdownButton').contains('Select an action').click()
    cy.getById('dropdownListItem').contains('Delete').click()
    cy.server()
    cy.route({ url: '**/endpoints/**', method: 'DELETE' }).as('delete')
    cy.getById('aModal-yesButton').click()
    cy.wait(['@delete', '@delete'])
    cy.getById('endpointListItem-checkbox-e2e-openstack-test').should('have.length', 0)
    cy.getById('endpointListItem-checkbox-e2e-vmware-test').should('have.length', 0)
  })
})
