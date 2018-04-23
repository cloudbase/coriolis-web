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

import config from '../config.js'

const identityUrl = `${config.coriolisUrl}identity/auth/tokens`
const projectsUrl = `${config.coriolisUrl}identity/auth/projects`

declare var expect: any

Cypress.Commands.add('login', () => {
  let unscopedBody = {
    auth: {
      identity: {
        methods: ['password'],
        password: {
          user: {
            name: config.username,
            domain: { name: 'default' },
            password: config.password,
          },
        },
      },
      scope: 'unscoped',
    },
  }

  cy.request({
    method: 'POST',
    url: identityUrl,
    body: unscopedBody,
  }).then(unscopedResponse => {
    let unscopedToken = unscopedResponse.headers['x-subject-token']
    expect(unscopedToken).to.exist

    cy.request({
      method: 'GET',
      url: projectsUrl,
      headers: { 'X-Auth-Token': unscopedToken },
    }).then(projectsReponse => {
      let projectId = projectsReponse.body.projects[0].id
      expect(projectId).to.exist

      let scopedBody = {
        auth: {
          identity: {
            methods: ['token'],
            token: {
              id: unscopedToken,
            },
          },
          scope: {
            project: {
              id: projectId,
            },
          },
        },
      }

      cy.request({
        method: 'POST',
        url: identityUrl,
        body: scopedBody,
      }).then(scopedResponse => {
        let scopedToken = scopedResponse.headers['x-subject-token']
        expect(scopedToken).to.exist

        cy.setCookie('token', scopedToken)
        cy.setCookie('projectId', projectId)
        cy.visit(config.nodeServer)
      })
    })
  })
})
