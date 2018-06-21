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

describe('Create a user', () => {
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

  it('Shows users page', () => {
    cy.get('a[data-test-id="navigation-item-users"]').click()
    cy.title().should('eq', 'Users')
  })

  it('Shows new user modal', () => {
    cy.get('div[data-test-id="newItemDropdown-button"]').click()
    cy.get('a[data-test-id="newItemDropdown-listItem-User"]').click()
    cy.get('div[data-test-id="modal-title"]').should('contain', 'New User')
  })

  it('Creates user', () => {
    cy.get('input[data-test-id="endpointField-textInput-username"]').type('cypress-user')
    cy.get('input[data-test-id="endpointField-textInput-description"]').type('User created by Cypress')
    cy.get('div[data-test-id="endpointField-dropdown-Primary Project"]').click()
    cy.get('div[data-test-id="dropdownListItem"]').contains('cypress-project').click()
    cy.get('input[data-test-id="endpointField-textInput-new_password"]').type('cypress-user')
    cy.get('input[data-test-id="endpointField-textInput-confirm_password"]').type('cypress-user')
    cy.server()
    cy.route({ url: '**/users', method: 'POST' }).as('addUser')
    cy.route({ url: '**/roles/**', method: 'PUT' }).as('addRole')
    cy.get('button').contains('New User').click()
    cy.wait('@addUser')
    cy.wait('@addRole')
    cy.get('div[data-test-id="ulItem-name"]').contains('cypress-user').should('exist')
  })
})
