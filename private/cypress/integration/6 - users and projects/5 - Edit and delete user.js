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

describe('Edit created user', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Shows user details page', () => {
    cy.getById('navigation-smallMenuItem-users').click()
    cy.server()
    cy.route({ url: '**/role_assignments**', method: 'GET' }).as('getRoles')
    cy.getById('ulItem-name').contains('cypress-user').click()
    cy.wait('@getRoles')
    cy.title().should('eq', 'User Details')
    cy.getById('dcHeader-title').should('contain', 'cypress-user')
  })

  it('Opens user edit modal', () => {
    cy.getById('dcHeader-actionButton').click()
    cy.getById('actionDropdown-listItem-Edit user').click()
    cy.getById('modal-title').should('contain', 'Update User')
  })

  it('Edits user', () => {
    cy.getById('endpointField-textInput-username').last().clear()
    cy.getById('endpointField-textInput-username').last().type('user-cypress')
    cy.server()
    cy.route({ url: '**/users/**', method: 'PATCH' }).as('updateUser')
    cy.route({ url: '**/role_assignments**', method: 'GET' }).as('getRoles')
    cy.get('button').contains('Update User').click()
    cy.wait(['@updateUser', '@getRoles'])
    cy.getById('dcHeader-title').should('contain', 'user-cypress')
  })

  it('Deletes the user', () => {
    cy.server()
    cy.get('button').contains('Delete user').click()
    cy.route({ url: '**/users/**', method: 'DELETE' }).as('deleteUser')
    cy.route({ url: '**/users', method: 'GET' }).as('getUsers')
    cy.getById('aModal-yesButton').click()
    cy.wait(['@deleteUser', '@getUsers'])
    cy.getById('ulItem-name').contains('user-cypress').should('not.exist')
  })
})
