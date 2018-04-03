
// @flow

import config from '../../config'

declare var cy: any

describe('Coriolis Login', () => {
  it('Displays incorrect password', () => {
    cy.server()
    cy.route({ url: '**/identity/**', method: 'POST' }).as('login')

    cy.visit(config.nodeServer)
    cy.get('input[label="Username"]').type('blabla')
    cy.get('input[label="Password"]').type('blabla')

    cy.get('button').click()
    cy.wait('@login')

    cy.get('#app').should('contain', 'The username or password did not match.')
  })
})
