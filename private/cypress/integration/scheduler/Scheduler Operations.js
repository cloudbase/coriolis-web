
// @flow

describe('Scheduler Operations', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Goes to scheduler\'s page', () => {
    cy.get('div[data-test-id="mainListItem"]').first().click()
    cy.get('a').contains('Schedule').click()
    cy.get('button').should('contain', 'Add Schedule')
  })

  it('Creates a schedule', () => {
    cy.server()
    cy.route('POST', '**/schedules').as('schedule')
    cy.get('button').contains('Add Schedule').click()
    cy.wait('@schedule')
    cy.get('div[data-test-id="saveButton"]').should('not.be.visible')
  })

  it('Changes the month', () => {
    cy.get('div[data-test-id="monthDropdown"]').last().click()
    cy.get('div[data-test-id="dropdownListItem"]').contains('October').click()
    cy.get('div[data-test-id="monthDropdown"]').last().should('contain', 'October')
    cy.get('div[data-test-id="saveButton"]').should('be.visible')
  })

  it('Changes the hour', () => {
    cy.get('div[data-test-id="hourDropdown"]').last().click()
    cy.get('div[data-test-id="dropdownListItem"]').contains('04').click()
    cy.get('div[data-test-id="hourDropdown"]').last().should('contain', '04')
  })

  it('Changes timezone', () => {
    cy.get('div').contains('Local Time').click()
    cy.get('div').contains('UTC').click()
    let utcTime = 4 + (new Date().getTimezoneOffset() / 60)
    if (utcTime < 10) {
      utcTime = `0${utcTime}`
    }
    utcTime = utcTime.toString()
    cy.get('div[data-test-id="hourDropdown"]').last().should('contain', utcTime)
  })

  it('Saves the changes', () => {
    cy.server()
    cy.route('PUT', '**/schedules/**').as('schedule')
    cy.get('div[data-test-id="saveButton"]').should('be.visible').last().click()
    cy.wait('@schedule')
    cy.get('div[data-test-id="saveButton"]').should('not.be.visible')
  })

  it('Deletes the last schedule', () => {
    cy.get('div[data-test-id="deleteButton"]').last().click()
    cy.server()
    cy.route('DELETE', '**/schedules/**').as('schedule')
    cy.get('button').contains('Yes').click()
    cy.wait('@schedule')
  })
})
