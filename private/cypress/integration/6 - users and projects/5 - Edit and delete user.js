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

import { navigationMenu } from '../../../../src/config'

const isEnabled: () => boolean = () => {
  let usersEnabled = navigationMenu.find(i => i.value === 'users' && i.disabled === false)
  let projectsEnabled = navigationMenu.find(i => i.value === 'projects' && i.disabled === false)
  return Boolean(usersEnabled && projectsEnabled)
}

describe('Edit created user', () => {
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

  it('Shows user details page', () => {
    cy.get('a[data-test-id="navigation-item-users"]').click()
    cy.server()
    cy.route({ url: '**/role_assignments**', method: 'GET' }).as('getRoles')
    cy.get('div[data-test-id="ulItem-name"]').contains('cypress-user').click()
    cy.wait('@getRoles')
    cy.title().should('eq', 'User Details')
    cy.get('div[data-test-id="dcHeader-title"]').should('contain', 'cypress-user')
  })

  it('Opens user edit modal', () => {
    cy.get('button').contains('Edit user').click()
    cy.get('div[data-test-id="modal-title"]').should('contain', 'Update User')
  })

  it('Edits user', () => {
    cy.get('input[data-test-id="endpointField-textInput-username"]').clear()
    cy.get('input[data-test-id="endpointField-textInput-username"]').type('user-cypress')
    cy.server()
    cy.route({ url: '**/users/**', method: 'PATCH' }).as('updateUser')
    cy.route({ url: '**/role_assignments**', method: 'GET' }).as('getRoles')
    cy.get('button').contains('Update User').click()
    cy.wait(['@updateUser', '@getRoles'])
    cy.get('div[data-test-id="dcHeader-title"]').should('contain', 'user-cypress')
  })

  it('Deletes the user', () => {
    cy.server()
    cy.get('button').contains('Delete user').click()
    cy.route({ url: '**/users/**', method: 'DELETE' }).as('deleteUser')
    cy.route({ url: '**/users', method: 'GET' }).as('getUsers')
    cy.get('button[data-test-id="aModal-yesButton"]').click()
    cy.wait(['@deleteUser', '@getUsers'])
    cy.get('div[data-test-id="ulItem-name"]').contains('user-cypress').should('not.exist')
  })
})
