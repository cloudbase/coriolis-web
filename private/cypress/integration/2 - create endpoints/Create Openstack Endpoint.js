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

describe('Create Openstack Endpoint', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Shows new Openstack endpoint dialog', () => {
    cy.get('div').contains('New').click()
    cy.getById('newItemDropdown-listItem-Endpoint').click()
    cy.getById('cProvider-endpointLogo-openstack').click()
  })

  it('Fills Openstack connection info', () => {
    cy.get('div').contains('Advanced').click()
    cy.get('input[placeholder="Name"]').type('e2e-openstack-test')
    cy.get('input[placeholder="Username"]').type(config.endpoints.openstack.username)
    cy.get('input[placeholder="Password"]').type(config.endpoints.openstack.password)
    cy.get('input[placeholder="Authentication URL"]').type(config.endpoints.openstack.authUrl)
    cy.get('input[placeholder="Project Name"]').type(config.endpoints.openstack.projectName)
    cy.getById('endpointField-dropdown-glance_api_version').first().click()
    cy.getById('dropdownListItem').contains('2').click()
    cy.getById('endpointField-dropdown-identity_api_version').first().click()
    cy.getById('dropdownListItem').contains('3').click()
    cy.get('input[placeholder="Project Domain Name"]').type(config.endpoints.openstack.projectDomainName)
    cy.get('input[placeholder="User Domain Name"]').type(config.endpoints.openstack.userDomainName)

    if (config.endpoints.openstack.allowUntrusted) {
      cy.getById('endpointField-switch-allow_untrusted').click()
    }
    if (config.endpoints.openstack.allowUntrustedSwift) {
      cy.getById('endpointField-switch-allow_untrusted_swift').click()
    }

    cy.server()
    cy.route({ url: '**/actions', method: 'POST' }).as('validate')
    cy.get('button').contains('Validate and save').click()
    cy.wait('@validate')
    cy.getById('endpointStatus').should('contain', 'Endpoint is Valid')
  })

  it('Added Openstack to endpoint list', () => {
    cy.getById('navigation-smallMenuItem-endpoints').click()
    cy.getById('endpointListItem-content-e2e-openstack-test').should('contain', 'e2e-openstack-test')
  })
})
