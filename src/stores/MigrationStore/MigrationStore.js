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


import Reflux from 'reflux';
import MigrationActions from '../../actions/MigrationActions';
import {networkMock, targetNetworkMock} from '../../config';
import moment from 'moment';

class MigrationStore extends Reflux.Store
{

  constructor() {
    super()
    this.listenables = MigrationActions

    this.state = {
      migrations: null,
      migration: null,
      migrationsLoaded: false,
      replicasLoaded: false,
      queryInProgress: false
    }
  }

  onLoadMigrations() {
    this.setState({ migrationsLoaded: false, replicasLoaded: false, queryInProgress: true })
  }

  onLoadMigrationsCompleted(response) {
    let connections = Reflux.GlobalState.connectionStore.connections
    // if none are loaded yet, clear the collection
    if (!this.state.replicasLoaded && !this.state.migrationsLoaded) {
      this.setState({ migrations: [] })
    }

    if (typeof response.data.replicas !== "undefined") {
      this.setState({ replicasLoaded: response.data.replicas})
    }
    if (typeof response.data.migrations !== "undefined") {
      this.setState({ migrationsLoaded: response.data.migrations})
    }
    if (this.state.migrationsLoaded && this.state.replicasLoaded) {
      let allMigrations = this.state.migrationsLoaded.concat(this.state.replicasLoaded)
      allMigrations.forEach(migration => {
        let connection = connections.filter(connection => connection.id == migration.destination_endpoint_id)[0]
        if (connection) {
          migration.destination_endpoint_type = connection.type
        }
        connection = connections.filter(connection => connection.id == migration.origin_endpoint_id)[0]
        if (connection) {
          migration.origin_endpoint_type = connection.type
        }

        migration.name = migration.instances.join(", ");

        if (migration.type == 'replica') {
          if (migration.executions.length) {
            MigrationActions.getReplicaExecutions(migration)
          }
        }
      })

      allMigrations.sort((a, b) => {
        return moment(b.created_at).isAfter(moment(a.created_at))
      })

      this.setState({
        migrations: allMigrations,
        migrationsLoaded: false,
        replicasLoaded: false,
        queryInProgress: false
      })
    }
  }

  onLoadMigrationCompleted(response) {
    let migrations = this.state.migrations
    let connections = Reflux.GlobalState.connectionStore.connections
    migrations.forEach((migration, index) => {
      let updatedMigration = response.data.migration
      if (migration.id === updatedMigration.id) {
        let connection = connections.filter(connection => connection.id === updatedMigration.destination_endpoint_id)[0]
        if (connection) {
          updatedMigration.destination_endpoint_type = connection.type
        }
        connection = connections.filter(connection => connection.id === updatedMigration.origin_endpoint_id)[0]
        if (connection) {
          updatedMigration.origin_endpoint_type = connection.type
        }

        updatedMigration.name = migration.instances.join(", ");

        migrations[index] = updatedMigration
      }
    })
    this.setState({ migrations: migrations })
  }

  onGetReplicaExecutionsCompleted(replica, response) {
    let migrations = this.state.migrations
    migrations.forEach((migration, index) => {
      if (migration.id == replica.id) {
        migration.executions = response.data.executions.sort((a, b) => a.number - b.number)
        migration.tasks = migration.executions[migration.executions.length - 1].tasks
        migration.status = migration.executions[migration.executions.length - 1].status
        migration.executions.forEach(execution => {
          //MigrationActions.getReplicaExecutionDetail(replica, execution.id)
        })
      }
    })
    this.setState({ migrations: migrations })
  }

  onGetReplicaExecutionDetailCompleted(replica, executionId, response) {
    let replicas = this.state.migrations
    let index = replicas.indexOf(replica)
    replicas[index].executions.forEach((execution, execIndex) => {
      if (execution.id == executionId) {
        replicas[index].executions[execIndex] = response.data.execution
      }
      replicas[index].tasks = replica.executions[replica.executions.length - 1].tasks
    })
    this.setState({ migrations: replicas })

  }

  onGetReplicaExecutionDetailFailed(response) {
  }

  onLoadMigrationsFailed(response) {
  }

  onAddMigrationCompleted(response)
  {
    let migrations = this.state.migrations
    let migration = response.data.migration ? response.data.migration : response.data.replica
    let migrationType = !!response.data.migration ? "migration" : "replica"
    let connections = Reflux.GlobalState.connectionStore.connections

    migration.selected = false

    let connection = connections.filter(connection => connection.id == migration.destination_endpoint_id)[0]
    if (connection) {
      migration.destination_endpoint_type = connection.type
    }
    connection = connections.filter(connection => connection.id == migration.origin_endpoint_id)[0]
    if (connection) {
      migration.origin_endpoint_type = connection.type
    }

    migration.name = migration.instances.join(", ");

    migrations.push(migration)

    this.setState({migrations: migrations})

    if (migrationType == "replica") {
      MigrationActions.executeReplica(migration)
    }
  }

  onDeleteMigrationCompleted(migration) {
    let migrations = this.state.migrations
    let index = migrations.indexOf(migration)
    migrations.splice(index, 1)
    this.setState({migrations: migrations})
  }

  onExecuteReplicaCompleted(replica, response) {
    let migrations = this.state.migrations
    migrations.forEach((migration, index) => {
      if (migration.id == replica.id) {
        migrations[index].executions.push(response.data.execution)
        migrations[index].tasks = migration.executions[migration.executions.length - 1].tasks
        migrations[index].status = migration.executions[migration.executions.length - 1].status
      }
    })

    this.setState({ migrations: migrations })

  }

  onCancelMigrationCompleted(migration, response, callback = null) {
    if (callback) {
      callback(migration, response)
    }
  }

  onSetMigration(migrationId) {
    let migration = this.onGetMigration(migrationId)
    this.setState({migration: migration})
    if (migration && migration.type === "migration") {
      MigrationActions.loadMigration(migration)
    }
  }

  onGetMigration(migrationId)
  {
    let migration = null
    if (this.state.migrations) {
      this.state.migrations.forEach(function(item) {
        if (item.id == migrationId) {
          migration = item
        }
      })
    }
    return migration
  }

  onSetMigrationProperty(migrationId, property, value) {migara
    this.state.migrations.forEach(function(item) {
      if (item.id == migrationId) {
        item[property] = value
      }
    })
  }

  onCreateMigrationFromReplicaCompleted(response) {
    if (response.data.migration) {
      let migrations = this.state.migrations
      let migration = response.data.migration
      let connections = Reflux.GlobalState.connectionStore.connections
      let connection = connections.filter(connection => connection.id == migration.destination_endpoint_id)[0]
      if (connection) {
        migration.destination_endpoint_type = connection.type
      }
      connection = connections.filter(connection => connection.id == migration.origin_endpoint_id)[0]
      if (connection) {
        migration.origin_endpoint_type = connection.type
      }

      migration.name = migration.instances.join(", ");

      migrations.push(migration)

      this.setState({migrations: migrations})
    }

  }

  processTasks(tasksRaw) {
    let lines = tasksRaw.split("\n")
    let tasks = []
    let currentTask = {}
    let newTask = false
    let progressUpdates = []
    for (let i in lines) {
      if (newTask) {
        currentTask["progress_updates"] = progressUpdates
        tasks.push(currentTask)
        currentTask = {}
        newTask = false
        progressUpdates = []
      }

      let line = lines[i].trim()

      if (line == "") {
        newTask = true
      } else {
        let sep = line.split(": ")
        if (sep[0] == "progress_updates:") { // progress updates section starts
          currentTask["progress_updates"] = null
        } else if (isNaN(sep[0][0])) {
          currentTask[sep[0]] = sep[1]
        } else { // adds progress messages
          let date = line.substring(0, line.indexOf(' '))
          let msg = line.substring(line.indexOf(' ')+1)
          progressUpdates.push([date, msg])
        }
      }
    }
    currentTask["progress_updates"] = progressUpdates
    tasks.push(currentTask)
    console.log(tasks)
    return tasks
  }
}


MigrationStore.id = "migrationStore"


export default MigrationStore;
