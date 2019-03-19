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

describe('Create a project', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Shows projects page', () => {
    cy.getById('navigation-smallMenuItem-projects').click()
    cy.title().should('eq', 'Projects')
  })

  it('Shows new project modal', () => {
    cy.getById('newItemDropdown-button').click()
    cy.getById('newItemDropdown-listItem-Project').click()
    cy.getById('modal-title').should('contain', 'New Project')
  })

  it('Creates project', () => {
    cy.getById('endpointField-textInput-project_name').last().type('cypress-project')
    cy.getById('endpointField-textInput-description').last().type('Project created by Cypress')
    cy.server()
    cy.route({ url: '**/projects/', method: 'POST' }).as('addProject')
    cy.route({ url: '**/roles/**', method: 'PUT' }).as('addRole')
    cy.get('button').contains('New Project').click()
    cy.wait(['@addProject', '@addRole'])
    cy.getById('plItem-content').should('contain', 'cypress-project')
    cy.getById('plItem-content').should('contain', 'Project created by Cypress')
  })
})
