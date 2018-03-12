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
import styled from 'styled-components'
import { observer } from 'mobx-react'

import SideMenu from '../../molecules/SideMenu'
import NotificationDropdown from '../../molecules/NotificationDropdown'
import UserDropdown from '../../molecules/UserDropdown'
import type { User as UserType } from '../../../types/User'

import NotificationStore from '../../../stores/NotificationStore'

import backgroundImage from './images/star-bg.jpg'
import logoImage from './images/logo.svg'

const Wrapper = styled.div`
  display: flex;
  height: 64px;
  background: url('${backgroundImage}');
  align-items: center;
  padding: 0 22px;
  justify-content: space-between;
`
const Logo = styled.a`
  width: 240px;
  height: 48px;
  background: url('${logoImage}') no-repeat;
  cursor: pointer;
`
const UserDropdownStyled = styled(UserDropdown) `
  margin-left: 16px;
`
const Menu = styled.div`
  display: flex;
  align-items: center;
`
const User = styled.div`
  display: flex;
  align-items: center;
`

type Props = {
  user?: ?UserType,
  onUserItemClick: (userItem: { label: string, value: string }) => void,
}
@observer
export class DetailsPageHeader extends React.Component<Props> {
  componentDidMount() {
    NotificationStore.loadNotifications()
  }

  handleNotificationsClose() {
    NotificationStore.clearNotifications()
  }

  render() {
    return (
      <Wrapper>
        <Menu>
          <SideMenu />
          <Logo href="/#/replicas" />
        </Menu>
        <User>
          <NotificationDropdown white items={NotificationStore.persistedNotifications} onClose={() => this.handleNotificationsClose()} />
          <UserDropdownStyled
            white
            user={this.props.user}
            onItemClick={this.props.onUserItemClick}
          />
        </User>
      </Wrapper>
    )
  }
}

export default DetailsPageHeader
