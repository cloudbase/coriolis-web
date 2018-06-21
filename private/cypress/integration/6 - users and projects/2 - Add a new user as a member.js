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

import { navigationMenu } from '../../../../src/config'

const isEnabled: () => boolean = () => {
  let usersEnabled = navigationMenu.find(i => i.value === 'users' && i.disabled === false)
  let projectsEnabled = navigationMenu.find(i => i.value === 'projects' && i.disabled === false)
  return Boolean(usersEnabled && projectsEnabled)
}

describe('Adds a new user as a member to the project', () => {
  before(() => {
    if (isEnabled()) {
      cy.login()
    }
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  if (!isEnabled()) {
    it('Users and projects management is disabled!', () => { })
    return
  }

  it('Shows projects details page', () => {
    cy.get('a[data-test-id="navigation-item-projects"]').click()
    cy.get('div[data-test-id="plItem-content"]').contains('cypress-project').click()
    cy.title().should('eq', 'Project Details')
  })

  it('Opens add member modal', () => {
    cy.get('button').contains('Add Member').click()
    cy.get('div[data-test-id="modal-title"]').should('contain', 'Add Project Member')
  })

  it('Creates new user', () => {
    cy.get('div[data-test-id="toggleButtonBar-new"]').click()
    cy.get('input[data-test-id="endpointField-textInput-username"]').type('cypress-member-user')
    cy.get('input[data-test-id="endpointField-textInput-description"]').type('User created by Cypress in Add Project Member modal')
    cy.get('div[data-test-id="endpointField-dropdown-Primary Project"]').click()
    cy.get('div[data-test-id="dropdownListItem"]').contains('cypress-project').click()
    cy.get('div[data-test-id="endpointField-multidropdown-role(s)"]').click()
    cy.get('div[data-test-id="dropdownListItem"]').contains('_member_').click()
    cy.get('input[data-test-id="endpointField-textInput-password"]').type('cypress-member-user')
    cy.get('input[data-test-id="endpointField-textInput-confirm_password"]').type('cypress-member-user')
    cy.server()
    cy.route({ url: '**/users', method: 'POST' }).as('addUser')
    cy.route({ url: '**/roles/**', method: 'PUT' }).as('addRole')
    cy.route({ url: '**/role_assignments**', method: 'GET' }).as('getRoles')
    cy.get('button[data-test-id="pmModal-addButton"]').contains('Add Member').click()
    cy.wait('@addUser')
    cy.wait('@addRole')
    cy.wait('@getRoles')
    cy.get('a[data-test-id="pdContent-users-cypress-member-user"]').its('length').should('eq', 1)
    cy.get('div[data-test-id="pdContent-roles-cypress-member-user"]').should('contain', '_member_')
  })

  it('Adds admin as its role', () => {
    cy.get('div[data-test-id="pdContent-roles-cypress-member-user"]').click()
    cy.get('div[data-test-id="dropdownLink-listItem"]').contains('admin').click()
    cy.get('div[data-test-id="pdContent-roles-cypress-member-user"]').should('contain', '_member_, admin')
  })

  it('Removes user from project', () => {
    cy.get('div[data-test-id="pdContent-actions-cypress-member-user"]').click()
    cy.get('div[data-test-id="dropdownLink-listItem"]').contains('Remove').click()
    cy.server()
    cy.route({ url: '**/roles/**', method: 'DELETE' }).as('deleteRole')
    cy.get('button[data-test-id="aModal-yesButton"]').click()
    cy.wait('@deleteRole')
    cy.get('a[data-test-id="pdContent-users-cypress-member-user"]').should('not.exist')
  })
})
