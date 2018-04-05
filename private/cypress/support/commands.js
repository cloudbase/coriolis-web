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
