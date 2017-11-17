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

import React from 'react'
import styled, { injectGlobal } from 'styled-components'
import NotificationSystem from 'react-notification-system'

import NotificationsStyle from './NotificationsStyle.js'

import NotificationStore from '../../../stores/NotificationStore'

injectGlobal`
  ${NotificationsStyle}
`

const Wrapper = styled.div``

class Notifications extends React.Component {
  constructor() {
    super()

    this.state = NotificationStore.getState()
  }

  componentDidMount() {
    NotificationStore.listen((state) => { this.onStoreChange(state) })
  }

  componentWillUnmount() {
    NotificationStore.unlisten(this.onStoreChange.bind(this))
  }

  onStoreChange(state) {
    if (!state.notifications.length) {
      return
    }

    let lastNotification = state.notifications[state.notifications.length - 1]
    this.notificationSystem.addNotification({
      title: lastNotification.title || lastNotification.message,
      message: lastNotification.title ? lastNotification.message : null,
      level: lastNotification.level || 'info',
      position: 'br',
      autoDismiss: 10,
      action: lastNotification.action,
    })
  }

  render() {
    return (
      <Wrapper>
        <NotificationSystem ref={(n) => { this.notificationSystem = n }} />
      </Wrapper>
    )
  }
}

export default Notifications
