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
import { observer } from 'mobx-react'
import styled, { createGlobalStyle } from 'styled-components'
import NotificationSystem from 'react-notification-system'
import { observe } from 'mobx'

import { AxiosRequestConfig } from 'axios'
import notificationStore from '../../../stores/NotificationStore'

import CopyMultilineValue from '../../ui/CopyMultilineValue/CopyMultilineValue'
import Button from '../../ui/Button/Button'
import Modal from '../../ui/Modal/Modal'

import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'
import NotificationsStyle from './style'
import DomUtils from '../../../utils/DomUtils'

import type { AlertInfo } from '../../../@types/NotificationItem'

const GlobalStyle = createGlobalStyle`
  ${NotificationsStyle}
`

const Wrapper = styled.div<any>``
const ErrorInfoWrapper = styled.div<any>`
  margin: 32px;
  overflow: auto;
`
const ErrorInfoRequest = styled.div<any>``
const ErrorInfoRequestItem = styled.div<any>`
  margin-bottom: 16px;
`
const ErrorInfoRequestLabel = styled.div<any>`
  font-size: 10px;
  font-weight: ${StyleProps.fontWeights.medium};
  color: ${Palette.grayscale[3]};
  text-transform: uppercase;
  margin-bottom: 4px;
`
const ErrorInfoRequestData = styled.pre`
  word-break: break-word;
  white-space: pre-wrap;
  margin: 0;
  .key { color: #053997; }
  .number { color: #107947; }
  .string { color: #92000C; }
  .boolean { color: #0000FF; }
  .null { color: #000A5D; }
`
const ButtonWrapper = styled.div<any>`
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
`

type State = {
  errorInfo: {
    error: { message: string | null, status: string | null },
    request: AxiosRequestConfig
  } | null,
}

const MAX_NOTIFICATIONS = 3

@observer
class NotificationsModule extends React.Component<{}, State> {
  state: State = {
    errorInfo: null,
  }

  notificationSystem!: NotificationSystem.System

  notificationsCount = 0

  activeNotifications: any[] = []

  componentDidMount() {
    observe(notificationStore.alerts, change => {
      this.handleStoreChange(change.object)
    })
  }

  handleStoreChange(alerts: AlertInfo[]) {
    if (!alerts.length || alerts.length <= this.notificationsCount) {
      return
    }
    const lastNotification = alerts[alerts.length - 1]
    let action = lastNotification.options ? lastNotification.options.action : undefined
    let autoDismiss = lastNotification.message.length < 150 ? 10 : 30
    if (action && lastNotification.level === 'error') {
      const errorInfo = action.callback()
      action = {
        ...action,
        callback: () => {
          this.setState({ errorInfo })
        },
      }
      autoDismiss = 0
    }

    this.notificationSystem.addNotification({
      title: lastNotification.title || lastNotification.message,
      message: lastNotification.title ? lastNotification.message : undefined,
      level: lastNotification.level || 'info',
      position: 'br',
      autoDismiss,
      action,
      onAdd: notification => {
        this.activeNotifications.push(notification)
        for (let i = 0; i < this.activeNotifications.length - MAX_NOTIFICATIONS; i += 1) {
          this.notificationSystem.removeNotification(this.activeNotifications[i].uid)
        }
      },
      onRemove: notification => {
        this.activeNotifications = this.activeNotifications.filter(n => n.uid !== notification.uid)
      },
    })

    this.notificationsCount = alerts.length
  }

  render() {
    const error = this.state.errorInfo
    let jsonData = error && error.request.data
    try {
      jsonData = JSON.stringify(jsonData, null, 2)
      jsonData = DomUtils.jsonSyntaxHighlight(jsonData)
      // eslint-disable-next-line no-empty
    } catch (err) { }
    return (
      <Wrapper>
        <GlobalStyle />
        <NotificationSystem ref={(n: NotificationSystem.System) => {
          this.notificationSystem = n
        }}
        />
        {error ? (
          <Modal
            title="Error Details"
            isOpen
            onRequestClose={() => { this.setState({ errorInfo: null }) }}
          >
            <ErrorInfoWrapper>
              <ErrorInfoRequest>
                <ErrorInfoRequestItem>
                  <ErrorInfoRequestLabel>Request URL</ErrorInfoRequestLabel>
                  <CopyMultilineValue value={error.request.url} />
                </ErrorInfoRequestItem>
                <ErrorInfoRequestItem>
                  <ErrorInfoRequestLabel>Request Method</ErrorInfoRequestLabel>
                  <CopyMultilineValue value={error.request.method || 'GET'} />
                </ErrorInfoRequestItem>
                {error.request.data ? (
                  <ErrorInfoRequestItem>
                    <ErrorInfoRequestLabel>Request Data</ErrorInfoRequestLabel>
                    <ErrorInfoRequestData dangerouslySetInnerHTML={{ __html: jsonData }} />
                  </ErrorInfoRequestItem>
                ) : null}
                <ErrorInfoRequestItem>
                  <ErrorInfoRequestLabel>Response Status</ErrorInfoRequestLabel>
                  <CopyMultilineValue value={error.error.status || '-'} />
                </ErrorInfoRequestItem>
                {error.error.message ? (
                  <ErrorInfoRequestItem>
                    <ErrorInfoRequestLabel>Response Message</ErrorInfoRequestLabel>
                    <CopyMultilineValue value={error.error.message} />
                  </ErrorInfoRequestItem>
                ) : null}
              </ErrorInfoRequest>
            </ErrorInfoWrapper>
            <ButtonWrapper>
              <Button
                secondary
                onClick={() => { this.setState({ errorInfo: null }) }}
              >Dismiss
              </Button>
            </ButtonWrapper>
          </Modal>
        ) : null}
      </Wrapper>
    )
  }
}

export default NotificationsModule
