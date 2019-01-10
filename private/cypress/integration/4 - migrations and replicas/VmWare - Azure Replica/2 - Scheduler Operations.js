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

describe('Scheduler Operations', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Goes to scheduler\'s page', () => {
    cy.server()
    cy.route('GET', '**/executions/detail').as('execution')
    cy.get('div[data-test-id="mainListItem-content"]').first().click()
    cy.wait('@execution')
    cy.get('a').contains('Schedule').click()
    cy.get('button').should('contain', 'Add Schedule')
  })

  it('Creates a schedule', () => {
    cy.server()
    cy.route('POST', '**/schedules').as('schedule')
    cy.get('button').contains('Add Schedule').click()
    cy.wait('@schedule')
    cy.get('div[data-test-id="scheduleItem-saveButton"]').should('not.be.visible')
  })

  it('Changes the month', () => {
    cy.get('div[data-test-id="scheduleItem-monthDropdown"]').last().click()
    cy.get('div[data-test-id="dropdownListItem"]').contains('October').click()
    cy.get('div[data-test-id="scheduleItem-monthDropdown"]').last().should('contain', 'October')
    cy.get('div[data-test-id="scheduleItem-saveButton"]').should('be.visible')
  })

  it('Changes the hour', () => {
    cy.get('div[data-test-id="scheduleItem-hourDropdown"]').last().click()
    cy.get('div[data-test-id="dropdownListItem"]').contains('04').click()
    cy.get('div[data-test-id="scheduleItem-hourDropdown"]').last().should('contain', '04')
  })

  it('Changes timezone', () => {
    cy.get('[data-test-id="schedule-timezoneDropdown"]').click()
    cy.get('div').contains('UTC').click()
    let utcTime = 4 + (new Date().getTimezoneOffset() / 60)
    if (utcTime < 10) {
      utcTime = `0${utcTime}`
    }
    utcTime = utcTime.toString()
    cy.get('div[data-test-id="scheduleItem-hourDropdown"]').last().should('contain', utcTime)
  })

  it('Saves the changes', () => {
    cy.server()
    cy.route('PUT', '**/schedules/**').as('schedule')
    cy.get('div[data-test-id="scheduleItem-saveButton"]').should('be.visible').last().click()
    cy.wait('@schedule')
    cy.get('div[data-test-id="scheduleItem-saveButton"]').should('not.be.visible')
  })

  it('Deletes the last schedule', () => {
    cy.get('div[data-test-id="scheduleItem-deleteButton"]').last().click()
    cy.server()
    cy.route('DELETE', '**/schedules/**').as('schedule')
    cy.get('button').contains('Yes').click()
    cy.wait('@schedule')
  })
})
