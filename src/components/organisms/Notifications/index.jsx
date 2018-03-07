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

// @flow

import React from 'react'
import styled, { injectGlobal } from 'styled-components'
import NotificationSystem from 'react-notification-system'
import { observe } from 'mobx'

import NotificationStore from '../../../stores/NotificationStore'
import type { NotificationItem } from '../../../types/NotificationItem'

import NotificationsStyle from './style.js'

injectGlobal`
  ${NotificationsStyle}
`

const Wrapper = styled.div``

class Notifications extends React.Component<{}> {
  notificationsCount: number
  notificationSystem: NotificationSystem

  constructor() {
    super()
    this.notificationsCount = 0
  }

  componentDidMount() {
    observe(NotificationStore.notifications, change => {
      this.handleStoreChange(change.object)
    })
  }

  handleStoreChange(notifications: NotificationItem[]) {
    if (!notifications.length || notifications.length <= this.notificationsCount) {
      return
    }

    let lastNotification = notifications[notifications.length - 1]
    this.notificationSystem.addNotification({
      title: lastNotification.title || lastNotification.message,
      message: lastNotification.title ? lastNotification.message : null,
      level: lastNotification.level || 'info',
      position: 'br',
      autoDismiss: 10,
      action: lastNotification.options ? lastNotification.options.action : null,
    })

    this.notificationsCount = notifications.length
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
