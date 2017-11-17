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
import EndpointActions from '../actions/EndpointActions'

const updateEndpoint = (endpoint, endpoints) => endpoints.map(e => {
  if (e.id === endpoint.id) {
    return { ...endpoint }
  }
  return { ...e }
})

class EndpointStore {
  constructor() {
    this.endpoints = []
    this.loading = false
    this.connectionInfo = null
    this.validation = null
    this.validating = false
    this.updating = false
    this.adding = false
    this.connectionInfoLoading = false

    this.bindListeners({
      handleGetEndpoints: EndpointActions.GET_ENDPOINTS,
      handleGetEndpointsCompleted: EndpointActions.GET_ENDPOINTS_COMPLETED,
      handleGetEndpointsFailed: EndpointActions.GET_ENDPOINTS_FAILED,
      handleDeleteSuccess: EndpointActions.DELETE_SUCCESS,
      handleGetConnectionInfo: EndpointActions.GET_CONNECTION_INFO,
      handleGetConnectionInfoSuccess: EndpointActions.GET_CONNECTION_INFO_SUCCESS,
      handleGetConnectionInfoFailed: EndpointActions.GET_CONNECTION_INFO_FAILED,
      handleValidate: EndpointActions.VALIDATE,
      handleValidateSuccess: EndpointActions.VALIDATE_SUCCESS,
      handleValidateFailed: EndpointActions.VALIDATE_FAILED,
      handleClearValidation: EndpointActions.CLEAR_VALIDATION,
      handleUpdateSuccess: EndpointActions.UPDATE_SUCCESS,
      handleUpdate: EndpointActions.UPDATE,
      handleClearConnectionInfo: EndpointActions.CLEAR_CONNECTION_INFO,
      handleAdd: EndpointActions.ADD,
      handleAddSuccess: EndpointActions.ADD_SUCCESS,
      handleAddFailed: EndpointActions.ADD_FAILED,
    })
  }

  handleGetEndpoints({ showLoading }) {
    if (showLoading || this.endpoints.length === 0) {
      this.loading = true
    }
  }

  handleGetEndpointsCompleted(endpoints) {
    this.endpoints = endpoints
    this.loading = false
  }

  handleGetEndpointsFailed() {
    this.loading = false
  }

  handleDeleteSuccess(endpointId) {
    this.endpoints = this.endpoints.filter(e => e.id !== endpointId)
  }

  handleGetConnectionInfo() {
    this.connectionInfoLoading = true
  }

  handleGetConnectionInfoSuccess(connectionInfo) {
    this.connectionInfo = connectionInfo
    this.connectionInfoLoading = false
  }

  handleGetConnectionInfoFailed() {
    this.connectionInfoLoading = false
  }

  handleValidate() {
    this.validating = true
  }

  handleValidateSuccess(validation) {
    this.validation = validation
    this.validating = false
  }

  handleValidateFailed() {
    this.validating = false
    this.validation = { valid: false }
  }

  handleClearValidation() {
    this.validating = false
    this.validation = null
  }

  handleUpdate(endpoint) {
    this.endpoints = updateEndpoint(endpoint, this.endpoints)
    this.connectionInfo = { ...endpoint.connection_info }
    this.updating = true
  }

  handleUpdateSuccess(endpoint) {
    this.endpoints = updateEndpoint(endpoint, this.endpoints)
    this.connectionInfo = { ...endpoint.connection_info }
    this.updating = false
  }

  handleClearConnectionInfo() {
    this.connectionInfo = null
  }

  handleAdd() {
    this.adding = true
  }

  handleAddSuccess(endpoint) {
    this.endpoints = [
      endpoint,
      ...this.endpoints,
    ]

    this.connectionInfo = endpoint.connection_info
    this.adding = false
  }

  handleAddFailed() {
    this.adding = false
  }
}

export default alt.createStore(EndpointStore)
