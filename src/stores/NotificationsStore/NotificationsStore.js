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
import UserActions from '../../actions/UserActions';
import NotificationActions from '../../actions/NotificationActions';
import ConnectionsActions from '../../actions/ConnectionsActions';
import MigrationActions from '../../actions/MigrationActions';
import Location from '../../core/Location';


class NotificationsStore extends Reflux.Store
{
  constructor() {
    super()
    this.listenables = [UserActions, NotificationActions, ConnectionsActions, MigrationActions]

    this.state = {
      notifications: [],
      allNotifications: []
    }
  }

  onLoginScopeSuccess(response) {
    let notifications = [{
      message: "Signed in",
      type: 'success'
    }]
    this.setState({ notifications: notifications })
  }

  onTokenLoginFailed(response) {
    let notifications = [
      {
        message: "Session expired, please sign in",
        type: 'error'
      }
    ]
    this.setState({ notifications: notifications })
  }

  onLogout(response) {
    let notifications = [
      {
        message: "You have been signed out",
        type: 'info'
      }
    ]
    this.setState({ notifications: notifications })
  }

  onSaveEndpoint(response) {
    let notifications = [{
      title: "New Connection",
      message: "Connection added successfully",
      type: 'success',
      keep: true
    }]
    this.setState({ notifications: notifications })
  }

  onAddMigrationCompleted(response) {
    let notifications = null

    if (response.data.migration) {
      notifications = [{
        title: "New Migration",
        message: "Migration created successfully",
        type: 'success',
        keep: true,
        action: {
          label: "View Migration Status",
          callback: () => {
            Location.push("/migration/tasks/" + response.data.migration.id + "/")
          }
        }
      }]
    } else {
      notifications = [{
        title: "New Replica",
        message: "Replica created successfully",
        type: 'success',
        keep: true,
        action: {
          label: "View Replica Status",
          callback: () => {
            Location.push("/replica/executions/" + response.data.replica.id + "/")
          }
        }
      }]
    }

    this.setState({ notifications: notifications })
  }

  onDeleteConnection() {
    let notifications = [{
      message: "Connection deleted successfully",
      type: 'success'
    }]
    this.setState({ notifications: notifications })
  }

  onDeleteMigrationCompleted() {
    let notifications = [{
      message: "Migration deleted successfully",
      type: 'success'
    }]
    this.setState({ notifications: notifications })
  }

  onDeleteMigrationFailed() {
    let notifications = [{
      message: "Could not delete migration",
      type: 'error'
    }]
    this.setState({ notifications: notifications })
  }

  onDeleteReplicaCompleted() {
    let notifications = [{
      message: "Replica deleted successfully",
      type: 'success'
    }]
    this.setState({ notifications: notifications })
  }

  onDeleteReplicaFailed() {
    let notifications = [{
      message: "Could not delete replica",
      type: 'error'
    }]
    this.setState({ notifications: notifications })
  }

  onLoginFailed(response) {
    let notifications = [{
      message: "Login failed",
      type: 'error'
    }]
    this.setState({ notifications: notifications })
  }

  onExecuteReplicaCompleted() {
    let notifications = [{
      message: "Executing replica",
      type: 'info'
    }]
    this.setState({ notifications: notifications })
  }

  onDeleteReplicaExecutionCompleted() {
    let notifications = [{
      message: "Execution deleted",
      type: 'info'
    }]
    this.setState({ notifications: notifications })
  }

  onCancelMigrationCompleted(migration) {
    let message = "Canceled"
    if (migration.type == "migration") {
      message = "Migration canceled successful"
    }
    let notifications = [{
      message: message,
      type: 'success'
    }]
    this.setState({ notifications: notifications })
  }

  onCreateMigrationFromReplicaCompleted(response) {
    let notifications = [{
      title: "New Migration",
      message: "Migration successfully created from replica.",
      type: 'success',
      hideDelay: 10000,
      keep: true,
      action: {
        label: "View Migration Status",
        callback: () => {
          Location.push("/migration/tasks/" + response.data.migration.id + "/")
        }
      }
    }]
    this.setState({ notifications: notifications })
  }

  onLoadInstancesFailed() {
    let notifications = [{
      message: "Could not load instances.",
      type: 'error'
    }]
    this.setState({ notifications: notifications })
  }

  onNotify(message, type = "info", title = null, callback = null) {
    this.setState({notifications: [
      {
        message: message,
        type: type,
        title: title
      }
    ]})
  }

  onMarkAsRead() {
    let allNotifications = this.state.allNotifications
    allNotifications.forEach(notification => {
      notification.unread = false
    })
    this.setState({ allNotifications: allNotifications })
  }

  onKeepNotification(notification) {
    let allNotifications = this.state.allNotifications
    allNotifications.unshift(notification)
    this.setState({ allNotifications: allNotifications })
  }

  onRemoveNotification() {
    this.setState({notifications: []})
  }

  onSwitchProject() {
    let notifications = [{
      message: "Switching project",
      type: 'info'
    }]
    this.setState({ notifications: notifications })
  }

}

export default NotificationsStore;
