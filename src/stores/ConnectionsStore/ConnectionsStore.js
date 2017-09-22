/* eslint-disable */

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


import React from 'react';
import Reflux from 'reflux';
import moment from 'moment'
import ConnectionsActions from '../../actions/ConnectionsActions';
import MigrationActions from '../../actions/MigrationActions';
import Helper from '../../components/Helper';
import Api from '../../components/ApiCaller'
import {servicesUrl, providerType} from '../../config';
import Location from '../../core/Location';

class ConnectionsStore extends Reflux.Store
{

  constructor()
  {
    super()
    this.listenables = ConnectionsActions

    ConnectionsActions.loadConnections()

    this.state = {
      sourceClouds: [],
      targetClouds: [],
      allClouds: null,
      connections: null
    }
  }

  onLoadProvidersCompleted(response) {
    let clouds = []
    if (response.data.providers) {
      let providers = response.data.providers
      for (let provider in providers) {
        let cloud = {
          name: provider,
          credentialSelected: null,
          credentials: [],
          fields: null,
          migration: {
            import: providers[provider].types.indexOf(providerType.import_migration) > -1,
            export: providers[provider].types.indexOf(providerType.export_migration) > -1
          },
          replica: {
            import: providers[provider].types.indexOf(providerType.import_replica) > -1,
            export: providers[provider].types.indexOf(providerType.export_replica) > -1
          },
          selected: false,
          vms: null,
          networks: [
            {id: "net1", name: "Network-1", migrateNetwork: null, selected: false},
            {id: "net2", name: "Network-2", migrateNetwork: null, selected: false},
            {id: "net3", name: "Network-3", migrateNetwork: null, selected: false}
          ],
        }
        clouds.push(cloud)
        ConnectionsActions.loadProviderType(cloud.name, "endpoint")
      }
    }
    this.setState({allClouds: clouds})
    ConnectionsActions.assignConnectionProvider()
  }

  onLoadProviderType(providerName, type) {
    let projectId = Reflux.GlobalState.userStore.currentUser.project.id
    Api.sendAjaxRequest({
      url: `${servicesUrl.coriolis}/${projectId}/providers/${providerName}/schemas/${providerType[type]}`,
      method: "GET"
    }).then(response => {
      let provider = this.state.allClouds.filter(cloud => cloud.name == providerName)[0]
      if (response.data.schemas.connection_info_schema) {
        provider[type] = {}
        provider[type].fields = ConnectionsStore.processCloud(
          response.data.schemas.connection_info_schema, providerName)
      }

      if (response.data.schemas.destination_environment_schema) {
        provider[type] = {}
        provider[type].fields = ConnectionsStore.processCloud(
          response.data.schemas.destination_environment_schema.oneOf[0], providerName, 'destination_env')
      }
      ConnectionsActions.updateProvider(provider)
    }, ConnectionsActions.updateProvider.failed)
      .catch(ConnectionsActions.updateProvider.failed);
  }

  onUpdateProvider(provider) {
    let allClouds = this.state.allClouds
    for (let i in allClouds) {
      if (allClouds[i].name == provider.name) {
        allClouds[i] = provider
      }
    }
    this.setState({ allClouds: allClouds })
  }

  onAssignConnectionProvider() {
    if (this.state.allClouds == null || this.state.connections == null) {
      return false
    } else {
      let allClouds = this.state.allClouds
      for (let i in allClouds) {
        allClouds[i].credentials = []
        this.state.connections.forEach(connection => {
          if (connection.type == allClouds[i].name) {
            allClouds[i].credentials.push({id: connection.id, name: connection.name})
          }
        })
      }
      this.setState({ allClouds: allClouds })
    }
  }

  onResetSelections()
  {
    console.log("TODO: Reset Selections")
  }

  onSetConnection(connection_id)
  {
    this.state.connections.forEach(connection => {
      if (connection.id == connection_id) {
        this.setState({connection: connection})
      }
    }, this)
  }

  onNewEndpointSuccess(response, data, callback = null)
  {
    ConnectionsActions.saveEndpoint(data, response.data.secret_ref, callback)
  }

  onEditEndpointSuccess(response, connection, data, callback)
  {
    data.connection_info = { secret_ref: response.data.secret_ref }
    ConnectionsActions.saveEditEndpoint(connection, data, callback)
  }

  onSaveEndpointSuccess(response, callback = null) {
    let connections = this.state.connections
    connections.push(response.data.endpoint)

    this.setState({connections: connections})
    ConnectionsActions.assignConnectionProvider()

    if (typeof callback === "function") {
      callback(response)
    }
  }

  onSaveEditEndpointSuccess(response) {
    let connections = this.state.connections
    connections = connections.map(connection => {
      if (connection.id == response.data.endpoint.id) {
        connection = response.data.endpoint
      }
      return connection
    })
    this.setState({connections: connections})
  }

  onLoadConnectionsCompleted(data) {
    let connections = []
    if (data.data.endpoints.length) {
      data.data.endpoints.forEach(endpoint => {
        connections.push(endpoint)
      })
    }
    
    connections.sort((c1, c2) => moment(c2.created_at).isAfter(c1.created_at))
    this.setState({connections: connections})

    if (window.location.pathname === "/" || window.location.pathname === "/login") {
      if (connections.length === 0) {
        Location.push('/cloud-endpoints')
      } else {
        Location.push('/replicas')
      }
    }
    ConnectionsActions.assignConnectionProvider()
    MigrationActions.loadMigrations()
    MigrationActions.loadReplicas()
  }

  onLoadConnectionDetail(connectionId) {
    if (this.state.connections) {
      let connection = this.state.connections.filter((connection => connection.id == connectionId))[0]
      if (connection.connection_info && connection.connection_info.secret_ref) {
        console.log("secret_ref", connection.connection_info.secret_ref)
        let index = connection.connection_info.secret_ref.lastIndexOf("/")
        let uuid = connection.connection_info.secret_ref.substr(index + 1)

        Api.sendAjaxRequest({
          url: servicesUrl.barbican + "/v1/secrets/" + uuid + "/payload",
          method: "GET",
          json: false,
          headers: {'Accept': 'text/plain'}
        }).then(
          (response) => ConnectionsActions.loadConnectionDetail.completed(response, connectionId),
          ConnectionsActions.loadConnectionDetail.failed)
          .catch(ConnectionsActions.loadConnectionDetail.failed);
      } else {
        let connections = this.state.connections
        this.state.connections.forEach(conn => {
          if (conn.id == connectionId) {
            conn.credentials = conn.connection_info
          }
        })
        this.setState({connections: connections})
      }
    }
  }

  onLoadConnectionDetailCompleted(response, uuid) {
    let payload = JSON.parse(response.data)
    let connections = this.state.connections
    this.state.connections.forEach(conn => {
      if (conn.id == uuid) {
        conn.credentials = payload
      }
    })
    this.setState({connections: connections})
  }

  onLoadConnectionDetailFailed(response) {
    // TODO: when load connections fail
    console.log("onLoadConnectionDetailFAILED", response)
  }

  onDeleteConnectionCompleted(connection) {
    let connections = this.state.connections
    let index = connections.indexOf(connection)
    connections.splice(index, 1)
    this.setState({ connections: connections })

    ConnectionsActions.assignConnectionProvider()
  }

  static processCloud(cloudData, providerName = null, type = 'connection') {
    if (!cloudData.hasOwnProperty('type')) {
      cloudData = cloudData.oneOf[0]
    }

    let fields = []
    for (let propName in cloudData.properties) {
      let field = {
        name: propName,
        label: Helper.convertCloudFieldLabel(propName)
      }

      if (cloudData.properties[propName].default) {
        field.default = cloudData.properties[propName].default
      }
      switch (cloudData.properties[propName].type) {
        case "boolean":
          field.type = "switch"
          break

        case "string":
          field.type = "text"
          break

        case "integer":
          if (cloudData.properties[propName].minimum && cloudData.properties[propName].maximum) {
            field.type = "dropdown"
            field.options = []
            for (let i = cloudData.properties[propName].minimum; i <= cloudData.properties[propName].maximum; i++) {
              // Values need to be strings, due to a limitation in react-dropdown
              field.options.push({
                  label: i.toString(),
                  value: i.toString()
                },
              )
            }
          } else {
            field.type = "text"
          }
          break
          case "object":
            if (type !== 'connection') {
              break
            }
            field.value = field.name
            field.default = true
            field.fields = this.processCloud(cloudData.properties[propName])
            break
        }

      field.defaultValue = cloudData.properties[propName].default;
      field.dataType = cloudData.properties[propName].type;

      if (field.name == 'username' || (cloudData.required && cloudData.required.indexOf(field.name) > -1)) {
        field.required = true
      } 
      
      if (field.name == 'password') {
        field.type = 'password'
        field.required = true
      }

      fields.push(field)
    }

    let sortPriority = {username: 1, password: 2}
    fields.sort((a, b) => {
      if (sortPriority[a.name] && sortPriority[b.name]) {
        return sortPriority[a.name] - sortPriority[b.name];
      }
      if (sortPriority[a.name] || (a.required && !b.required)) {
        return -1
      }
      if (sortPriority[b.name] || (!a.required && b.required)) {
        return 1
      }
      return 0
    })

    // If a hierarchical structure has been generated, 
    // group all top level nodes (fields of type object) in a 'login_type' switch (basically multpiple login types are now supported),
    // put all non-nodes (fields not of type object) as children of top level nodes
    let objectFields = fields.filter(field => field.dataType === 'object')
    if (type === 'connection' && objectFields.length > 1) {
      let otherFields = fields.filter(field => field.dataType !== 'object' && field.name !== 'secret_ref')
      // Sort it so that if there's an option with username or password, it has priority
      objectFields.sort((a, b) => {
        let testFunc = f => f.name === 'username' || f.name === 'password'
        if (a.fields.find(testFunc)) {
          return -1
        }
        if (b.fields.find(testFunc)) {
          return 1
        }
        return 0
      })
      let loginRadioField = {
        type: "switch-radio",
        name: "login_type",
        options: objectFields
      }
      
      loginRadioField.options.forEach((option, index) => {
        option.default = index === 0
        option.fields = option.fields.concat(otherFields)
      })

      return [loginRadioField]
    }

    return fields
  }
}

ConnectionsStore.id = "connectionStore"


export default ConnectionsStore;
