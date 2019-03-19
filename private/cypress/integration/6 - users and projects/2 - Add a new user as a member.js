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

describe('Adds a new user as a member to the project', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Shows projects details page', () => {
    cy.getById('navigation-smallMenuItem-projects').click()
    cy.getById('plItem-content').contains('cypress-project').click()
    cy.title().should('eq', 'Project Details')
  })

  it('Opens add member modal', () => {
    cy.get('button').contains('Add Member').click()
    cy.getById('modal-title').should('contain', 'Add Project Member')
  })

  it('Creates new user', () => {
    cy.getById('toggleButtonBar-new').click()
    cy.getById('endpointField-textInput-username').last().type('cypress-member-user')
    cy.getById('endpointField-textInput-description').last().type('User created by Cypress in Add Project Member modal')
    cy.getById('endpointField-dropdown-Primary Project').click()
    cy.getById('dropdownListItem').contains('cypress-project').click()
    cy.getById('endpointField-multidropdown-role(s)').click()
    cy.getById('dropdownListItem').contains('_member_').click()
    cy.getById('endpointField-textInput-password').last().type('cypress-member-user')
    cy.getById('endpointField-textInput-confirm_password').last().type('cypress-member-user')
    cy.server()
    cy.route({ url: '**/users', method: 'POST' }).as('addUser')
    cy.route({ url: '**/roles/**', method: 'PUT' }).as('addRole')
    cy.route({ url: '**/role_assignments**', method: 'GET' }).as('getRoles')
    cy.getById('pmModal-addButton').contains('Add Member').click()
    cy.wait(['@addUser', '@addRole', '@getRoles'])
    cy.getById('pdContent-users-cypress-member-user').its('length').should('eq', 1)
    cy.getById('pdContent-roles-cypress-member-user').should('contain', '_member_')
  })

  it('Adds admin as its role', () => {
    cy.getById('pdContent-roles-cypress-member-user').click()
    cy.getById('dropdownLink-listItem').contains('admin').click()
    cy.getById('pdContent-roles-cypress-member-user').should('contain', '_member_, admin')
  })

  it('Removes user from project', () => {
    cy.getById('pdContent-actions-cypress-member-user').click()
    cy.getById('dropdownLink-listItem').contains('Remove').click()
    cy.server()
    cy.route({ url: '**/roles/**', method: 'DELETE' }).as('deleteRole')
    cy.getById('aModal-yesButton').click()
    cy.wait('@deleteRole')
    cy.getById('pdContent-users-cypress-member-user').should('not.exist')
  })
})
