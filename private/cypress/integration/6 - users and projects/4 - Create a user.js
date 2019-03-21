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

describe('Create a user', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Shows users page', () => {
    cy.getById('navigation-smallMenuItem-users').click()
    cy.title().should('eq', 'Users')
  })

  it('Shows new user modal', () => {
    cy.getById('newItemDropdown-button').click()
    cy.getById('newItemDropdown-listItem-User').click()
    cy.getById('modal-title').should('contain', 'New User')
  })

  it('Creates user', () => {
    cy.getById('endpointField-textInput-username').last().type('cypress-user')
    cy.getById('endpointField-textInput-description').last().type('User created by Cypress')
    cy.getById('endpointField-dropdown-Primary Project').click()
    cy.getById('dropdownListItem').contains('cypress-project').click()
    cy.getById('endpointField-textInput-new_password').last().type('cypress-user')
    cy.getById('endpointField-textInput-confirm_password').last().type('cypress-user')
    cy.server()
    cy.route({ url: '**/users', method: 'POST' }).as('addUser')
    cy.route({ url: '**/roles/**', method: 'PUT' }).as('addRole')
    cy.get('button').contains('New User').click()
    cy.wait(['@addUser', '@addRole'])
    cy.getById('ulItem-name').contains('cypress-user').should('exist')
  })
})
