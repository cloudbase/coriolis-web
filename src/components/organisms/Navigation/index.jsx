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
import { observer } from 'mobx-react'
import styled from 'styled-components'

import Logo from '../../atoms/Logo'
import userStore from '../../../stores/UserStore'

import { navigationMenu } from '../../../config'
import backgroundImage from './images/star-bg.jpg'

const Wrapper = styled.div`
  background-image: url('${backgroundImage}');
  display: flex;
  flex-direction: column;
  height: 100%;
`

const LogoStyled = styled(Logo) `
  margin: 40px auto 0 30px;
  cursor: pointer;
`

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  margin-top:32px;
`

const MenuItem = styled.a`
  font-size: 18px;
  color: ${props => props.selected ? '#007AFF' : 'white'};
  cursor: pointer;
  margin-top: 26px;
  margin-left: 96px;
  display: inline-block;
  text-decoration: none;
`
const Footer = styled.div``

@observer
class Navigation extends React.Component<{ currentPage: string }> {
  renderMenu() {
    const isAdmin = userStore.loggedUser ? userStore.loggedUser.isAdmin : false
    return (
      <Menu>
        {navigationMenu.filter(i => i.disabled ? !i.disabled : i.requiresAdmin ? isAdmin : true).map(item => {
          return (
            <MenuItem
              key={item.value}
              selected={this.props.currentPage === item.value}
              href={`/#/${item.value}`}
              data-test-id={`navigation-item-${item.value}`}
            >{item.label}</MenuItem>
          )
        })}
      </Menu>
    )
  }

  render() {
    return (
      <Wrapper>
        <LogoStyled small href={navigationMenu[0].value} />
        {this.renderMenu()}
        <Footer />
      </Wrapper>
    )
  }
}

export default Navigation
