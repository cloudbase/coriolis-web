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

describe('Adds existing user as a member to the project', () => {
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
  })

  it('Opens add member modal', () => {
    cy.get('button').contains('Add Member').click()
    cy.get('div[data-test-id="modal-title"]').should('contain', 'Add Project Member')
  })

  it('Adds existing user', () => {
    cy.get('input[data-test-id="textInput-input"]').type('cy')
    cy.get('div[data-test-id="ad-listItem"]').contains('cypress-member-user').click()
    cy.get('div[data-test-id="endpointField-multidropdown-role(s)"]').click()
    cy.get('div[data-test-id="dropdownListItem"]').contains('_member_').click()
    cy.get('div[data-test-id="dropdownListItem"]').contains('admin').click()
    cy.get('div[data-test-id="modal-title"]').click()
    cy.server()
    cy.route({ url: '**/roles/**', method: 'PUT' }).as('addRoles')
    cy.route({ url: '**/role_assignments**', method: 'GET' }).as('getRoles')
    cy.get('button[data-test-id="pmModal-addButton"]').click()
    cy.wait('@addRoles')
    cy.wait('@getRoles')
    cy.get('div[data-test-id="pdContent-roles-cypress-member-user"]').should('contain', '_member_, admin')
  })

  it('Deletes the user', () => {
    cy.server()
    cy.route({ url: '**/role_assignments**', method: 'GET' }).as('getRoles')
    cy.get('a[data-test-id="pdContent-users-cypress-member-user"]').click()
    cy.wait('@getRoles')
    cy.get('button').contains('Delete user').click()
    cy.route({ url: '**/users/**', method: 'DELETE' }).as('deleteUser')
    cy.get('button[data-test-id="aModal-yesButton"]').click()
    cy.wait('@deleteUser')
  })
})
