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
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { observer } from 'mobx-react'

import NavigationMini from '../../molecules/NavigationMini'
import NotificationDropdown from '../../molecules/NotificationDropdown'
import UserDropdown from '../../molecules/UserDropdown'
import AboutModal from '../../pages/AboutModal'

import type { User as UserType } from '../../../@types/User'

import notificationStore from '../../../stores/NotificationStore'

import backgroundImage from './images/star-bg.jpg'
import logoImage from './images/logo.svg'

const Wrapper = styled.div<any>`
  display: flex;
  height: 64px;
  background: url('${backgroundImage}');
  align-items: center;
  padding-right: 22px;
  justify-content: space-between;
`
const Logo = styled(Link)`
  width: 240px;
  height: 48px;
  background: url('${logoImage}') no-repeat;
  cursor: pointer;
`
const UserDropdownStyled = styled(UserDropdown)`
  margin-left: 16px;
`
const Menu = styled.div<any>`
  display: flex;
  align-items: center;
`
const User = styled.div<any>`
  display: flex;
  align-items: center;
`
type State = {
  showAbout: boolean,
}
type Props = {
  user?: UserType | null,
  onUserItemClick: (userItem: { label: string, value: string }) => void,
  testMode?: boolean,
}

@observer
class DetailsPageHeader extends React.Component<Props, State> {
  state = {
    showAbout: false,
  }

  pollTimeout: number | undefined

  stopPolling!: boolean

  UNSAFE_componentWillMount() {
    if (this.props.testMode) {
      return
    }
    this.stopPolling = false
    this.pollData(true)
  }

  componentWillUnmount() {
    clearTimeout(this.pollTimeout)
    this.stopPolling = true
  }

  handleNotificationsClose() {
    notificationStore.saveSeen()
  }

  handleUserItemClick(item: { label: string, value: string }) {
    switch (item.value) {
      case 'about':
        this.setState({ showAbout: true })
        break
      default:
        this.props.onUserItemClick(item)
    }
  }

  async pollData(showLoading?: boolean) {
    if (this.stopPolling) {
      return
    }

    await notificationStore.loadData(showLoading)
    this.pollTimeout = setTimeout(() => { this.pollData() }, 15000)
  }

  render() {
    return (
      <Wrapper>
        <Menu>
          <NavigationMini />
          <Logo to="/" />
        </Menu>
        <User>
          <NotificationDropdown
            white
            items={notificationStore.notificationItems}
            onClose={() => this.handleNotificationsClose()}
          />
          <UserDropdownStyled
            white
            user={this.props.user}
            onItemClick={item => { this.handleUserItemClick(item) }}
          />
        </User>
        {this.state.showAbout ? (
          <AboutModal onRequestClose={() => { this.setState({ showAbout: false }) }} />
        ) : null}
      </Wrapper>
    )
  }
}

export default DetailsPageHeader
