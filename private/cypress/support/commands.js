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
const coriolisUrl = `${config.coriolisUrl}coriolis`

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

    // $FlowIssue
    expect(unscopedToken).to.exist

    cy.request({
      method: 'GET',
      url: projectsUrl,
      headers: { 'X-Auth-Token': unscopedToken },
    }).then(projectsReponse => {
      let projects = projectsReponse.body.projects
      let cypressProject = projects.find(p => p.name === 'cypress')
      let projectId = cypressProject ? cypressProject.id : projects[0].id

      // $FlowIssue
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
        // $FlowIssue
        expect(scopedToken).to.exist

        cy.setCookie('token', scopedToken)
        cy.setCookie('projectId', projectId)
        cy.visit(config.nodeServer)
      })
    })
  })
})

Cypress.Commands.add('logout', () => {
  let token
  return cy.getCookies().then(cookies => {
    let tokenCookie = cookies.find(c => c.name === 'token')
    if (tokenCookie) {
      token = tokenCookie.value
    }
  }).then(() => {
    if (!token) {
      return Promise.resolve()
    }
    return cy.request({
      method: 'DELETE',
      url: `${config.coriolisUrl}identity/auth/tokens`,
      headers: { 'X-Subject-Token': token, 'X-Auth-Token': token },
    })
  })
})

Cypress.Commands.add('cleanup', () => {
  if (config.username !== 'cypress') {
    return Promise.resolve()
  }

  let token
  let projectId
  return cy.getCookies().then(cookies => {
    token = cookies.find(c => c.name === 'token').value
    projectId = cookies.find(c => c.name === 'projectId').value
  }).then(() => {
    if (!token || !projectId) {
      return Promise.resolve()
    }

    // Delete replicas
    return cy.request({
      method: 'GET',
      url: `${coriolisUrl}/${projectId}/replicas/detail`,
      headers: { 'X-Auth-Token': token },
    }).then(response => response.body.replicas)
      .then(replicas => Promise.all(replicas.map(replica => cy.request({
        method: 'DELETE',
        url: `${coriolisUrl}/${projectId}/replicas/${replica.id}`,
        headers: { 'X-Auth-Token': token },
      }))))
  }).then(() => {
    // Delete migrations
    return cy.request({
      method: 'GET',
      url: `${coriolisUrl}/${projectId}/migrations/detail`,
      headers: { 'X-Auth-Token': token },
    }).then(response => response.body.migrations)
      .then(migrations => Promise.all(migrations.map(migration => cy.request({
        method: 'DELETE',
        url: `${coriolisUrl}/${projectId}/migrations/${migration.id}`,
        headers: { 'X-Auth-Token': token },
      }))))
  }).then(() => {
    // Delete endpoints
    return cy.request({
      method: 'GET',
      url: `${coriolisUrl}/${projectId}/endpoints`,
      headers: { 'X-Auth-Token': token },
    }).then(response => response.body.endpoints)
      .then(endpoints => Promise.all(endpoints.map(endpoint => cy.request({
        method: 'DELETE',
        url: `${coriolisUrl}/${projectId}/endpoints/${endpoint.id}`,
        headers: { 'X-Auth-Token': token },
      }))))
  }).then(() => {
    // Delete users created by Cypress
    return cy.request({
      method: 'GET',
      url: `${config.coriolisUrl}identity/users`,
      headers: { 'X-Auth-Token': token },
    }).then(response => response.body.users
      .filter(user => user.description && /user created by cypress/gi.test(user.description))
    ).then(users => Promise.all(users.map(user => cy.request({
      method: 'DELETE',
      url: `${config.coriolisUrl}identity/users/${user.id}`,
      headers: { 'X-Auth-Token': token },
    }))))
  }).then(() => {
    // Delete projects created by Cypress
    return cy.request({
      method: 'GET',
      url: `${config.coriolisUrl}identity/projects`,
      headers: { 'X-Auth-Token': token },
    }).then(response => response.body.projects
      .filter(project => project.description && /project created by cypress/gi.test(project.description))
    ).then(projects => Promise.all(projects.map(project => cy.request({
      method: 'DELETE',
      url: `${config.coriolisUrl}identity/projects/${project.id}`,
      headers: { 'X-Auth-Token': token },
    }))))
  })
})

Cypress.Commands.add('getById', (id, type) => {
  return cy.get(`${type || ''}[data-test-id="${id}"]`)
})

Cypress.Commands.add('getServerConfig', () => {
  return cy.request({
    url: `${config.nodeServer}config`,
    method: 'GET',
  }).then(response => {
    return response.body
  })
})
