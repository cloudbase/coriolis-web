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


import Reflux from 'reflux';
import Api from '../../components/ApiCaller';
import {servicesUrl, useSecret} from '../../config';

let ConnectionsActions = Reflux.createActions({
  loadConnections: { children: ['completed', 'failed'] },
  loadConnectionDetail: { children: ['completed', 'failed'] },
  loadProviders: { children: ['completed', 'failed'] },
  loadInstances: { children: ['completed', 'failed'] },
  loadProviderType: {},
  assignConnectionProvider: {},
  updateProvider: {},
  deleteConnection: { children: ['completed', 'failed'] },
  getSourceClouds: {},
  getTargetClouds: {},
  resetSelections: {},
  newConnection: { children: ['success', 'failed'] },
  saveEndpoint: { children: ['success', 'failed'] },
  editEndpoint: { children: ['success', 'failed'] },
  setConnection: {},
  validateConnection: { children: ['success', 'failed'] }
})


ConnectionsActions.loadProviders.listen(() => {
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id
  Api.sendAjaxRequest({
    url: `${servicesUrl.coriolis}/${projectId}/providers`,
    method: "GET"
  }).then(response => {
    ConnectionsActions.loadProviders.completed(response)
    }, ConnectionsActions.loadProviders.failed)
    .catch(ConnectionsActions.loadProviders.failed);
})

ConnectionsActions.saveEndpoint.listen((data, secretRef) => {
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id
  let payload = null
  if (useSecret) {
    payload = {
      endpoint: {
        name: data.name,
        description: data.description,
        type: data.type,
        connection_info: {
          secret_ref: secretRef
        }
      }
    }
  } else {
    payload = { endpoint: data }
  }

  Api.sendAjaxRequest({
    url: `${servicesUrl.coriolis}/${projectId}/endpoints`,
    method: "POST",
    data: payload
  }).then(ConnectionsActions.saveEndpoint.success, ConnectionsActions.saveEndpoint.failed)
    .catch(ConnectionsActions.saveEndpoint.failed);
})

ConnectionsActions.newConnection.listen((data) => {
  if (useSecret) {
    let barbicanPayload = {
      payload: JSON.stringify(data.connection_info),
      payload_content_type: "text/plain",
      content_types: {
        default: "text/plain"
      }
    }

    Api.sendAjaxRequest({
      url: servicesUrl.barbican + "/v1/secrets",
      method: "POST",
      data: barbicanPayload
    }).then((response) => {
        ConnectionsActions.newConnection.success(response, data)
      }, ConnectionsActions.newConnection.failed)
      .catch(ConnectionsActions.newConnection.failed);
  } else {
    ConnectionsActions.saveEndpoint(data)
  }
});

ConnectionsActions.loadConnections.listen(() => {
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id
  if (projectId) {
    Api.sendAjaxRequest({
      url: `${servicesUrl.coriolis}/${projectId}/endpoints`,
      method: "GET"
    }).then(ConnectionsActions.loadConnections.completed, ConnectionsActions.loadConnections.failed)
      .catch(ConnectionsActions.loadConnections.failed);
  }
})

ConnectionsActions.loadConnections.shouldEmit = () => {
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id
  return typeof projectId !== "undefined"
}

ConnectionsActions.deleteConnection.listen((connection) => {
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id

  Api.sendAjaxRequest({
    url: `${servicesUrl.coriolis}/${projectId}/endpoints/${connection.id}`,
    method: "DELETE"
  }).then(() => {
    if (connection.connection_info && connection.connection_info.secret_ref) {
      let uuidIndex = connection.connection_info.secret_ref.lastIndexOf("/")
      let uuid = connection.connection_info.secret_ref.substr(uuidIndex + 1)
      Api.sendAjaxRequest({
        url: servicesUrl.barbican + "/v1/secrets/" + uuid,
        method: "DELETE"
      }).then(ConnectionsActions.deleteConnection.completed(connection), ConnectionsActions.deleteConnection.failed)
    } else {
      ConnectionsActions.deleteConnection.completed(connection)
    }
  }, ConnectionsActions.deleteConnection.failed)
  .catch(ConnectionsActions.deleteConnection.failed);
})

ConnectionsActions.editEndpointSecret.listen((data) => {
  if (useSecret) {
    let barbicanPayload = {
      payload: JSON.stringify(data.connection_info),
      payload_content_type: "text/plain",
      content_types: {
        default: "text/plain"
      }
    }

    Api.sendAjaxRequest({
      url: servicesUrl.barbican + "/v1/secrets",
      method: "POST",
      data: barbicanPayload
    }).then((response) => {
      ConnectionsActions.newConnection.success(response, data)
    }, ConnectionsActions.newConnection.failed)
      .catch(ConnectionsActions.newConnection.failed);
  } else {
    ConnectionsActions.saveEndpoint(data)
  }
});

ConnectionsActions.editEndpoint.listen((connection, data) => {
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id
  let payload = null
  if (connection.connection_info && connection.connection_info.secret_ref) {
    let uuidIndex = connection.connection_info.secret_ref.lastIndexOf("/")
    let uuid = connection.connection_info.secret_ref.substr(uuidIndex + 1)

    Api.sendAjaxRequest({
      url: servicesUrl.barbican + "/v1/secrets/" + uuid,
      method: "POST"
    })
    payload = {
      endpoint: {
        name: data.name,
        description: data.description,
        connection_info: {
          secret_ref: connection.connection_info.secret_ref
        }
      }
    }
  } else {
    payload = { endpoint: data }
  }

  Api.sendAjaxRequest({
    url: `${servicesUrl.coriolis}/${projectId}/endpoints/${connection.id}`,
    method: "PUT",
    data: payload
  }).then(ConnectionsActions.editEndpoint.success, ConnectionsActions.editEndpoint.failed)
    .catch(ConnectionsActions.editEndpoint.failed);
})

ConnectionsActions.editEndpoint.listen((connection, data) => {
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id
  let payload = null
  if (connection.connection_info && connection.connection_info.secret_ref) {
    let uuidIndex = connection.connection_info.secret_ref.lastIndexOf("/")
    let uuid = connection.connection_info.secret_ref.substr(uuidIndex + 1)

    Api.sendAjaxRequest({
      url: servicesUrl.barbican + "/v1/secrets/" + uuid,
      method: "POST"
    })
    payload = {
      endpoint: {
        name: data.name,
        description: data.description,
        connection_info: {
          secret_ref: connection.connection_info.secret_ref
        }
      }
    }
  } else {
    payload = { endpoint: data }
  }

  Api.sendAjaxRequest({
    url: `${servicesUrl.coriolis}/${projectId}/endpoints/${connection.id}`,
    method: "PUT",
    data: payload
  }).then(ConnectionsActions.editEndpoint.success, ConnectionsActions.editEndpoint.failed)
    .catch(ConnectionsActions.editEndpoint.failed);
})


ConnectionsActions.validateConnection.listen((endpoint, callback) => {
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id
  Api.sendAjaxRequest({
    url: `${servicesUrl.coriolis}/${projectId}/endpoints/${endpoint.id}/actions`,
    method: "POST",
    data: { "validate-connection": null }
  }).then(response => {
    if (callback) {
      callback(response)
    }
    ConnectionsActions.validateConnection.completed(response)
  }, ConnectionsActions.validateConnection.failed)
    .catch(ConnectionsActions.validateConnection.failed);
})

export default ConnectionsActions;
