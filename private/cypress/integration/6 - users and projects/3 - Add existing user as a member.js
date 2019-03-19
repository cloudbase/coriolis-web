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

describe('Adds existing user as a member to the project', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Shows projects details page', () => {
    cy.getById('navigation-smallMenuItem-projects').click()
    cy.getById('plItem-content').contains('cypress-project').click()
  })

  it('Opens add member modal', () => {
    cy.get('button').contains('Add Member').click()
    cy.getById('modal-title').should('contain', 'Add Project Member')
  })

  it('Adds existing user', () => {
    cy.getById('acInput-text').last().type('cy')
    cy.getById('ad-listItem').contains('cypress-member-user').click()
    cy.getById('endpointField-multidropdown-role(s)').click()
    cy.getById('dropdownListItem').contains('_member_').click()
    cy.getById('dropdownListItem').contains('admin').click()
    cy.getById('modal-title').click()
    cy.server()
    cy.route({ url: '**/roles/**', method: 'PUT' }).as('addRoles')
    cy.route({ url: '**/role_assignments**', method: 'GET' }).as('getRoles')
    cy.getById('pmModal-addButton').click()
    cy.wait(['@addRoles', '@getRoles'])
    cy.getById('pdContent-roles-cypress-member-user').should('contain', '_member_, admin')
  })

  it('Deletes the user', () => {
    cy.server()
    cy.route({ url: '**/role_assignments**', method: 'GET' }).as('getRoles')
    cy.getById('pdContent-users-cypress-member-user').click()
    cy.wait('@getRoles')
    cy.get('button').contains('Delete user').click()
    cy.route({ url: '**/users/**', method: 'DELETE' }).as('deleteUser')
    cy.getById('aModal-yesButton').click()
    cy.wait('@deleteUser')
  })
})
