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

describe('Edit created project', () => {
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

  it('Shows project details page', () => {
    cy.get('a[data-test-id="navigation-item-projects"]').click()
    cy.server()
    cy.route({ url: '**/role_assignments**', method: 'GET' }).as('getRoles')
    cy.get('div[data-test-id="plItem-content"]').contains('cypress-project').click()
    cy.wait('@getRoles')
    cy.title().should('eq', 'Project Details')
    cy.get('div[data-test-id="dcHeader-title"]').should('contain', 'cypress-project')
  })

  it('Opens project edit modal', () => {
    cy.get('button').contains('Edit Project').click()
    cy.get('div[data-test-id="modal-title"]').should('contain', 'Update Project')
  })

  it('Edits project', () => {
    cy.get('input[data-test-id="endpointField-textInput-project_name"]').clear()
    cy.get('input[data-test-id="endpointField-textInput-project_name').type('project-cypress')
    cy.server()
    cy.route({ url: '**/projects/**', method: 'PATCH' }).as('updateProject')
    cy.get('button').contains('Update Project').click()
    cy.wait('@updateProject')
    cy.get('div[data-test-id="dcHeader-title"]').should('contain', 'project-cypress')
  })

  it('Deletes the project', () => {
    cy.server()
    cy.get('button').contains('Delete Project').click()
    cy.route({ url: '**/projects/**', method: 'DELETE' }).as('deleteProject')
    cy.route({ url: '**/role_assignments**', method: 'GET' }).as('getRoles')
    cy.get('button[data-test-id="aModal-yesButton"]').click()
    cy.wait(['@deleteProject', '@getRoles'])
    cy.get('div[data-test-id="plItem-content"]').contains('project-cypress').should('not.exist')
  })
})
