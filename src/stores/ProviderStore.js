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
import ProviderActions from '../actions/ProviderActions'

class ProviderStore {
  constructor() {
    this.connectionInfoSchema = []
    this.connectionSchemaLoading = false
    this.providers = null
    this.providersLoading = false
    this.optionsSchema = []
    this.optionsSchemaLoading = false

    this.bindListeners({
      handleGetConnectionInfoSchema: ProviderActions.GET_CONNECTION_INFO_SCHEMA,
      handleGetConnectionInfoSchemaSuccess: ProviderActions.GET_CONNECTION_INFO_SCHEMA_SUCCESS,
      handleGetConnectionInfoSchemaFailed: ProviderActions.GET_CONNECTION_INFO_SCHEMA_FAILED,
      handleLoadProviders: ProviderActions.LOAD_PROVIDERS,
      handleLoadProvidersSuccess: ProviderActions.LOAD_PROVIDERS_SUCCESS,
      handleLoadOptionsSchema: ProviderActions.LOAD_OPTIONS_SCHEMA,
      handleLoadOptionsSchemaSuccess: ProviderActions.LOAD_OPTIONS_SCHEMA_SUCCESS,
      handleLoadOptionsSchemaFailed: ProviderActions.LOAD_OPTIONS_SCHEMA_FAILED,
    })
  }

  handleGetConnectionInfoSchema() {
    this.connectionSchemaLoading = true
  }

  handleGetConnectionInfoSchemaSuccess(schema) {
    this.connectionSchemaLoading = false
    this.connectionInfoSchema = schema
  }

  handleGetConnectionInfoSchemaFailed() {
    this.connectionSchemaLoading = false
  }

  handleLoadProviders() {
    this.providers = null
    this.providersLoading = true
  }

  handleLoadProvidersSuccess(providers) {
    this.providers = providers
    this.providersLoading = false
  }

  handleLoadOptionsSchema() {
    this.optionsSchemaLoading = true
  }

  handleLoadOptionsSchemaSuccess(schema) {
    this.optionsSchemaLoading = false
    this.optionsSchema = schema
  }

  handleLoadOptionsSchemaFailed() {
    this.optionsSchemaLoading = false
  }
}

export default alt.createStore(ProviderStore)
