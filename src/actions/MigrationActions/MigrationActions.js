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
import NotificationActions from '../NotificationActions'
import { servicesUrl, securityGroups } from '../../config';

let MigrationActions = Reflux.createActions({
  loadMigrations: { children: ['completed', 'failed'], shouldEmit: () => {} },
  loadReplicas: { children: ['completed', 'failed'], shouldEmit: () => {} },
  loadMigration: { children: ['completed', 'failed'] }, // TODO: Reload migration action
  addMigration: { children: ['completed', 'failed'] },
  deleteMigration: { children: ['completed', 'failed'] },
  deleteReplica: { children: ['completed', 'failed'] },
  executeReplica: { children: ['completed', 'failed'] },
  cancelMigration: { children: ['completed', 'failed'] },
  getReplicaExecutions: { children: ['completed', 'failed'] },
  getReplicaExecutionDetail: { children: ['completed', 'failed'] },
  createMigrationFromReplica: { children: ['completed', 'failed'] },
  deleteReplicaExecution: { children: ['completed', 'failed'] },
  getMigration: {},
  setMigration: {},
  setReplica: {},
  setMigrationProperty: {}
})

MigrationActions.loadMigrations.listen(() => {
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id

  Api.sendAjaxRequest({
    url: `${servicesUrl.coriolis}/${projectId}/migrations/detail`,
    method: "GET"
  })
    .then(MigrationActions.loadMigrations.completed, MigrationActions.loadMigrations.failed)
    .catch(MigrationActions.loadMigrations.failed);
})

MigrationActions.loadMigrations.shouldEmit = () => {
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id
  let scoped = Reflux.GlobalState.userStore.currentUser.scoped
  return typeof projectId !== "undefined" && scoped
}

MigrationActions.loadReplicas.listen(() => {
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id
  Api.sendAjaxRequest({
    url: `${servicesUrl.coriolis}/${projectId}/replicas/detail`,
    method: "GET"
  })
    .then(MigrationActions.loadReplicas.completed, MigrationActions.loadReplicas.failed)
    .catch(MigrationActions.loadReplicas.failed);
})

MigrationActions.loadReplicas.shouldEmit = () => {
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id

  let scoped = Reflux.GlobalState.userStore.currentUser.scoped
  return typeof projectId !== "undefined" && scoped
}

MigrationActions.loadMigration.listen((migration) => {
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id

  Api.sendAjaxRequest({
    url: `${servicesUrl.coriolis}/${projectId}/migrations/${migration.id}`,
    method: "GET"
  })
    .then(MigrationActions.loadMigration.completed, MigrationActions.loadMigration.failed)
    .catch(MigrationActions.loadMigration.failed);
})

MigrationActions.loadMigration.shouldEmit = () => {
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id
  return typeof projectId !== "undefined"
}

MigrationActions.deleteMigration.listen((migration, callback = null) => {
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id
  Api.sendAjaxRequest({
    url: `${servicesUrl.coriolis}/${projectId}/migrations/${migration.id}`,
    method: "DELETE"
  })
  .then(() => {
    MigrationActions.deleteMigration.completed(migration)
    if (callback) {
      callback(migration)
    }
  }, MigrationActions.deleteMigration.failed)
  .catch(MigrationActions.deleteMigration.failed);
})

MigrationActions.deleteReplica.listen((replica, callback = null) => {
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id
  Api.sendAjaxRequest({
    url: `${servicesUrl.coriolis}/${projectId}/replicas/${replica.id}`,
    method: "DELETE"
  })
    .then(() => {
      MigrationActions.deleteReplica.completed(replica)
      if (callback) {
        callback(replica)
      }
    }, MigrationActions.deleteReplica.failed)
    .catch(MigrationActions.deleteReplica.failed);
})

MigrationActions.executeReplica.listen((replica, callback = null, errorCallback = null, options = null) => {
  if (replica.type == 'replica') {
    // check if endpoints exists
    let connections = Reflux.GlobalState.connectionStore.connections
    let originEndpoint = false
    let destinationEndpoint = false

    connections.forEach(connection => {
      if (replica.origin_endpoint_id === connection.id) {
        originEndpoint = true
      }
      if (replica.destination_endpoint_id === connection.id) {
        destinationEndpoint = true
      }
    })

    if (!originEndpoint) {
      NotificationActions.notify("Origin endpoint is missing. Cannot execute this replica.", "error")
      return
    }
    if (!destinationEndpoint) {
      NotificationActions.notify("Destination endpoint is missing. Cannot execute this replica.", "error")
      return
    }
    let projectId = Reflux.GlobalState.userStore.currentUser.project.id

    let payload = { execution: { shutdown_instances: false } }
    if (options) {
      options.forEach(o => {
        payload.execution[o.field] = o.value || false
      })
    }

    Api.sendAjaxRequest({
      url: `${servicesUrl.coriolis}/${projectId}/replicas/${replica.id}/executions`,
      method: "POST",
      data: payload
    })
      .then((response) => {
        MigrationActions.executeReplica.completed(replica, response)
        if (callback) {
          callback(replica, response)
        }
      }, (err) => {
        MigrationActions.executeReplica.failed(err)
        if (errorCallback) {
          errorCallback(replica, err)
        }
      })
      .catch((err) => {
        MigrationActions.executeReplica.failed(err)
        if (errorCallback) {
          errorCallback(replica, err)
        }
      });
  } else {
    NotificationActions.notify("You cannot execute a migration.", "warning")
  }
})

MigrationActions.cancelMigration.listen((migration, callback = null) => {
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id
  let url = null
  if (migration.type == 'migration') {
    url = `${servicesUrl.coriolis}/${projectId}/migrations/${migration.id}/actions`
  } else {
    if (migration.executions.length) {
      let executionId = migration.executions[migration.executions.length - 1].id
      url = `${servicesUrl.coriolis}/${projectId}/replicas/${migration.id}/executions/${executionId}/actions`
    } else {
      NotificationActions.notify("No executions to cancel on this replica")
    }
  }

  let payload = {
    cancel: null
  }

  Api.sendAjaxRequest({
    url: url,
    method: "POST",
    data: payload
  })
    .then((response) => {
      if (callback) {
        callback(migration, response)
      }
      MigrationActions.cancelMigration.completed(migration, response)
    }, MigrationActions.cancelMigration.failed)
    .catch(MigrationActions.cancelMigration.failed);
})

MigrationActions.getReplicaExecutions.listen((replica, callback) => {
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id
  Api.sendAjaxRequest({
    url: `${servicesUrl.coriolis}/${projectId}/replicas/${replica.id}/executions/detail`,
    method: "GET"
  })
    .then((response) => {
      MigrationActions.getReplicaExecutions.completed(replica, response)
      if (callback) callback()
    }, MigrationActions.getReplicaExecutions.failed)
    .catch(MigrationActions.getReplicaExecutions.failed);
})


MigrationActions.getReplicaExecutionDetail.listen((replica, executionId, callback = null) => {
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id
  Api.sendAjaxRequest({
    url: `${servicesUrl.coriolis}/${projectId}/replicas/${replica.id}/executions/${executionId}`,
    method: "GET"
  })
    .then((response) => {
      MigrationActions.getReplicaExecutionDetail.completed(replica, executionId, response)
      if (callback) {
        callback(replica, executionId, response)
      }
    }, MigrationActions.getReplicaExecutionDetail.failed)
    .catch(MigrationActions.getReplicaExecutionDetail.failed);
})

MigrationActions.deleteReplicaExecution.listen((replica, executionId, callback = null) => {
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id
  Api.sendAjaxRequest({
    url: `${servicesUrl.coriolis}/${projectId}/replicas/${replica.id}/executions/${executionId}`,
    method: "DELETE"
  })
    .then((response) => {
      MigrationActions.deleteReplicaExecution.completed(replica, executionId)
      if (callback) {
        callback(replica, executionId, response)
      }
    }, MigrationActions.deleteReplicaExecution.failed)
    .catch(MigrationActions.deleteReplicaExecution.failed);
})

MigrationActions.addMigration.listen((migration, callback = null, errorCallback = null) => {
  let payload = {}
  let instances = []

  migration.selectedInstances.forEach(instance => {
    if (migration.selectedInstances.indexOf(instance.id)) {
      instances.push(instance.instance_name)
    }
  })

  let networkMap = {}
  if (migration.networks) {
    migration.networks.forEach(network => {
      networkMap[network.network_name] = network.migrateNetwork
    })
  }

  let destinationEnv = {}

  let getValueInOriginalDataType = (fieldName, value) => {
    let fields = migration.targetCloud.cloudRef['import_' + migration.migrationType].fields
    let field = fields.find(f => f.name === fieldName)

    if (!field) {
      return value
    }

    switch (field.dataType) {
      case 'boolean':
        return value === 'true' || value === true
      case 'integer':
        return parseInt(value, 10)
      default:
        return value
    }
  }

  for (let i in migration.destination_environment) {
    let destField = migration.destination_environment[i]

    if (destField.label) { // removing label from dropdown if present
      destinationEnv[i] = getValueInOriginalDataType(i, destField.value)
    } else {
      destinationEnv[i] = getValueInOriginalDataType(i, destField)
    }
  }

  destinationEnv.network_map = networkMap

  payload[migration.migrationType] = {
    origin_endpoint_id: migration.sourceCloud.credential.id,
    destination_endpoint_id: migration.targetCloud.credential.id,
    destination_environment: destinationEnv,
    instances: instances,
    notes: migration.notes,
    security_groups: securityGroups
  }

  let migrationType = migration.migrationType === 'replica' ? 'replicas' : 'migrations'
  let projectId = Reflux.GlobalState.userStore.currentUser.project.id
  Api.sendAjaxRequest({
    url: `${servicesUrl.coriolis}/${projectId}/${migrationType}`,
    method: "POST",
    data: payload
  })
    .then((response) => {
      MigrationActions.addMigration.completed(response);
      if (callback) {
        callback(migration);
      }
    }, (response) => {
      MigrationActions.addMigration.failed(response)
      if (errorCallback) {
        errorCallback(migration);
      }
    })
    .catch(MigrationActions.addMigration.failed);
})

MigrationActions.createMigrationFromReplica.listen((replica, options) => {
  let payload = {
    migration: {
      replica_id: replica.id
    }
  }
  options.forEach(o => {
    payload.migration[o.field] = o.value || false
  })

  let projectId = Reflux.GlobalState.userStore.currentUser.project.id

  Api.sendAjaxRequest({
    url: `${servicesUrl.coriolis}/${projectId}/migrations`,
    method: "POST",
    data: payload
  })
    .then(MigrationActions.createMigrationFromReplica.completed, MigrationActions.createMigrationFromReplica.failed)
    .catch(MigrationActions.createMigrationFromReplica.failed);
})


export default MigrationActions;
