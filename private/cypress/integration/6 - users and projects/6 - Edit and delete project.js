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

describe('Edit created project', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Shows project details page', () => {
    cy.getById('navigation-smallMenuItem-projects').click()
    cy.server()
    cy.route({ url: '**/role_assignments**', method: 'GET' }).as('getRoles')
    cy.getById('plItem-content').contains('cypress-project').click()
    cy.wait('@getRoles')
    cy.title().should('eq', 'Project Details')
    cy.getById('dcHeader-title').should('contain', 'cypress-project')
  })

  it('Opens project edit modal', () => {
    cy.getById('dcHeader-actionButton').click()
    cy.getById('actionDropdown-listItem-Edit Project').click()
    cy.getById('modal-title').should('contain', 'Update Project')
  })

  it('Edits project', () => {
    cy.getById('endpointField-textInput-project_name').last().clear()
    cy.get('input[data-test-id="endpointField-textInput-project_name').last().type('project-cypress')
    cy.server()
    cy.route({ url: '**/projects/**', method: 'PATCH' }).as('updateProject')
    cy.get('button').contains('Update Project').click()
    cy.wait('@updateProject')
    cy.getById('dcHeader-title').should('contain', 'project-cypress')
  })

  it('Deletes the project', () => {
    cy.server()
    cy.get('button').contains('Delete Project').click()
    cy.route({ url: '**/projects/**', method: 'DELETE' }).as('deleteProject')
    cy.route({ url: '**/role_assignments**', method: 'GET' }).as('getRoles')
    cy.getById('aModal-yesButton').click()
    cy.wait(['@deleteProject', '@getRoles'])
    cy.getById('plItem-content').contains('project-cypress').should('not.exist')
  })
})
