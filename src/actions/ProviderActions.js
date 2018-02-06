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

import alt from '../alt'

import ProviderSource from '../sources/ProviderSource'

class ProviderActions {
  getConnectionInfoSchema(providerName) {
    ProviderSource.getConnectionInfoSchema(providerName).then(
      schema => { this.getConnectionInfoSchemaSuccess(schema) },
      response => { this.getConnectionInfoSchemaFailed(response) },
    )
    return true
  }

  getConnectionInfoSchemaSuccess(schema) {
    return schema
  }

  getConnectionInfoSchemaFailed(response) {
    return response || true
  }

  clearConnectionInfoSchema() {
    return true
  }

  loadProviders() {
    ProviderSource.loadProviders().then(
      providers => { this.loadProvidersSuccess(providers) },
      response => { this.loadProvidersFailed(response) },
    )

    return true
  }

  loadProvidersSuccess(providers) {
    return providers
  }

  loadProvidersFailed(response) {
    return response || true
  }

  loadOptionsSchema(providerName, schemaType) {
    ProviderSource.loadOptionsSchema(providerName, schemaType).then(
      schema => { this.loadOptionsSchemaSuccess(schema) },
      response => { this.loadOptionsSchemaFailed(response) },
    )
    return true
  }

  loadOptionsSchemaSuccess(schema) {
    return schema
  }

  loadOptionsSchemaFailed(response) {
    return response || true
  }
}

export default alt.createActions(ProviderActions)
