/*
Copyright (C) 2017  Cloudbase Solutions SRL
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

describe('Cannot delete used endpoint', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Should show in usage message when trying to delete', () => {
    cy.get('div').contains('Cloud Endpoints').first().click()
    cy.get('div[data-test-id="endpointListItemContent-e2e-azure-test"]').click()
    cy.get('button').contains('Delete Endpoint').click()
    cy.get('div[data-test-id="alertModal"]').should('contain', 'The endpoint can\'t be deleted because it is in use by replicas or migrations.')
  })
})
