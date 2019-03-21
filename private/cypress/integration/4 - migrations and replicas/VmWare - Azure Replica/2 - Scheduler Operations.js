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

  it('Creates a schedule', () => {
    cy.server()
    cy.route('GET', '**/executions/detail').as('execution')
    cy.getById('mainListItem-content').first().click()
    cy.wait('@execution')
    cy.getById('detailsNavigation-schedule').click()
    cy.route('POST', '**/schedules').as('schedule')
    cy.getById('schedule-noScheduleAddButton').click()
    cy.wait('@schedule')
    cy.getById('scheduleItem-saveButton').should('not.be.visible')
  })

  it('Changes the month', () => {
    cy.getById('scheduleItem-monthDropdown').last().click()
    cy.getById('dropdownListItem').contains('October').click()
    cy.getById('scheduleItem-monthDropdown').last().should('contain', 'October')
    cy.getById('scheduleItem-saveButton').should('be.visible')
  })

  it('Changes the hour', () => {
    cy.getById('scheduleItem-hourDropdown').last().click()
    cy.getById('dropdownListItem').contains('04').click()
    cy.getById('scheduleItem-hourDropdown').last().should('contain', '04')
  })

  it('Changes timezone', () => {
    cy.getById('schedule-timezoneDropdown').click()
    cy.get('div').contains('UTC').click()
    let utcTime = 4 + (new Date().getTimezoneOffset() / 60)
    if (utcTime < 10) {
      utcTime = `0${utcTime}`
    }
    utcTime = utcTime.toString()
    cy.getById('scheduleItem-hourDropdown').last().should('contain', utcTime)
  })

  it('Saves the changes', () => {
    cy.server()
    cy.route('PUT', '**/schedules/**').as('schedule')
    cy.getById('scheduleItem-saveButton').should('be.visible').last().click()
    cy.wait('@schedule')
    cy.getById('scheduleItem-saveButton').should('not.be.visible')
  })

  it('Deletes the last schedule', () => {
    cy.getById('scheduleItem-deleteButton').last().click()
    cy.server()
    cy.route('DELETE', '**/schedules/**').as('schedule')
    cy.get('button').contains('Yes').click()
    cy.wait('@schedule')
  })
})
