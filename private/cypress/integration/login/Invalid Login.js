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

import config from '../../config'

declare var cy: any

describe('Coriolis Login Failed', () => {
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
