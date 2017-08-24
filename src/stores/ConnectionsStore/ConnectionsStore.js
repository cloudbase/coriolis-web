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


import React, { Component, PropTypes } from 'react';
import Reflux from 'reflux';
import ConnectionsActions from '../../actions/ConnectionsActions';
import MigrationActions from '../../actions/MigrationActions';
import Helper from '../../components/Helper';
import Api from '../../components/ApiCaller'
import {servicesUrl, providerType} from '../../config';

class ConnectionsStore extends Reflux.Store
{
  connections = [
    {
      id: "vSphere-Cluster",
      name: "vSphere-Cluster",
      description: "",
      created: new Date(),
      cloudName: "vmware",
      secretUrl: null,
      credentials: {

      }
    },
    {
      id: "vSphere-Cluster2",
      name: "vSphere-Cluster2",
      description: "",
      created: new Date(),
      cloudName: "vmware",
      secretUrl: null,
      credentials: {

      }
    },
    {
      id: "azure-Cluster",
      name: "Azure-Cluster",
      description: "",
      created: new Date(),
      cloudName: "azure",
      secretUrl: null,
      credentials: {

      }
    }
  ]

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
      for (var provider in providers) {
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
    for (var i in allClouds) {
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
      for (var i in allClouds) {
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
    connections.forEach(connection => {
      if (connection.id == response.data.endpoint.id) {
        connection = response.data.endpoint
      }
    })
    this.setState({connections: connections})
  }

  onLoadConnectionsCompleted(data) {
    let connections = []
    if (data.data.endpoints.length) {
      data.data.endpoints.forEach(endpoint => {
        connections.push(endpoint)
        /*let cloudType = endpoint.name.substr(0, endpoint.name.indexOf("::"))
        let secretName = endpoint.name.substr(endpoint.name.indexOf("::") + 2)
        let secretId = secret.secret_ref.substr(secret.secret_ref.lastIndexOf("/") + 1)
        connections.push({
          id: secretId,
          name: secretName,
          description: "",
          created: new Date(secret.created),
          cloudName: cloudType,
          secretUrl: secret.secret_ref,
          credentials: {}
        })*/
      })
    }
    this.setState({connections: connections})
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
    if (providerName != "azure" && providerName != null && cloudData.oneOf) {
      cloudData = cloudData.oneOf[0]
    }

    if (providerName == "azure" && type == "connection") {
      let subscriptionId = {
        subscription_id: cloudData.properties.subscription_id
      }
      let userCredentialFields = {
        properties: { subscription_id: cloudData.properties.subscription_id },
        required: cloudData.properties.user_credentials.required
      }

      userCredentialFields.required.push("subscription_id")

      for (var i in cloudData.properties.user_credentials.properties) {
        userCredentialFields.properties[i] = cloudData.properties.user_credentials.properties[i]
      }

      let servicePrincipalCredentialFields = {
        properties: { subscription_id: cloudData.properties.subscription_id },
        required: cloudData.properties.service_principal_credentials.required
      }
      for (var i in cloudData.properties.service_principal_credentials.properties) {
        servicePrincipalCredentialFields.properties[i] = cloudData.properties.service_principal_credentials.properties[i]
      }
      servicePrincipalCredentialFields.required.push("subscription_id")

      let newCloudData = {
        type: "switch-radio",
        name: "login_type",
        options: [
          {
            label: "User Credentials",
            value: "user_credentials",
            fields: this.processCloud(userCredentialFields)
          },
          {
            label: "Service Principal Credentials",
            value: "service_principal_credentials",
            fields: this.processCloud(servicePrincipalCredentialFields)
          }
        ]
      }

      return [newCloudData]
    } else {
      let fields = []
      let sortedFields = [{}, {}]
      for (var propName in cloudData.properties) {
        let field = {
          name: propName,
          label: Helper.convertCloudFieldLabel(propName)
        }

        if (cloudData.properties[propName].default) {
          field.default = cloudData.properties[propName].default
        }
        switch (cloudData.properties[propName].type) {
          case "boolean":
            field.type = "dropdown"
            field.options = [
              // Values need to be strings, due to a limitation in react-dropdown
              {label: "Yes", value: "true"},
              {label: "No", value: "false"}
            ]

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
        }

        field.defaultValue = cloudData.properties[propName].default;
        field.dataType = cloudData.properties[propName].type;

        if (field.name == 'username') {
          field.required = true
          sortedFields[0] = field
        } else if (field.name == 'password') {
          field.type = "password"
          field.required = true
          sortedFields[1] = field
        } else if (cloudData.required.indexOf(field.name) > -1) {
          field.required = true
          sortedFields.push(field)
        } else {
          fields.push(field)
        }
      }
      //in case we don't have username and password
      if (Object.keys(sortedFields[0]).length === 0 && Object.keys(sortedFields[0]).length === 0) {
        sortedFields.shift()
        sortedFields.shift()
      }
      console.log("sortedFields.concat(fields)", sortedFields.concat(fields))

      return sortedFields.concat(fields)
    }
  }
}

ConnectionsStore.id = "connectionStore"


export default ConnectionsStore;
