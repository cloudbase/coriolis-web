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

import EndpointSource from '../sources/EndpointSource'

class EndpointActions {
  getEndpoints(options) {
    EndpointSource.getEndpoints().then(
      endpoints => { this.getEndpointsCompleted(endpoints) },
      response => { this.getEndpointsFailed(response) }
    )

    return options || true
  }

  getEndpointsCompleted(endpoints) {
    return endpoints
  }

  getEndpointsFailed(response) {
    return response || true
  }

  delete(endpoint) {
    EndpointSource.delete(endpoint).then(
      () => { this.deleteSuccess(endpoint.id) },
      response => { this.deleteFailed(response) },
    )
    return endpoint
  }

  deleteSuccess(endpointId) {
    return endpointId
  }

  deleteFailed(response) {
    return response || true
  }

  getConnectionInfo(endpoint) {
    EndpointSource.getConnectionInfo(endpoint).then(
      connectionInfo => { this.getConnectionInfoSuccess(connectionInfo) },
      response => { this.getConnectionInfoFailed(response) },
    )
    return endpoint || true
  }

  getConnectionInfoSuccess(connectionInfo) {
    return connectionInfo
  }

  getConnectionInfoFailed(response) {
    return response || true
  }

  validate(endpoint) {
    EndpointSource.validate(endpoint).then(
      validation => { this.validateSuccess(validation) },
      response => { this.validateFailed(response) },
    )
    return endpoint
  }

  validateSuccess(validation) {
    return validation
  }

  validateFailed(response) {
    return response || true
  }

  clearValidation() {
    return true
  }

  update(endpoint) {
    EndpointSource.update(endpoint).then(
      endpointResponse => { this.updateSuccess(endpointResponse) },
      response => { this.updateFailed(response) },
    )

    return endpoint
  }

  updateSuccess(endpoint) {
    return endpoint
  }

  updateFailed(response) {
    return response || true
  }

  clearConnectionInfo() {
    return true
  }

  add(endpoint) {
    EndpointSource.add(endpoint).then(
      endpointResponse => { this.addSuccess(endpointResponse) },
      response => { this.addFailed(response) },
    )

    return endpoint
  }

  addSuccess(endpoint) {
    return endpoint
  }

  addFailed(response) {
    return response || true
  }
}

export default alt.createActions(EndpointActions)
