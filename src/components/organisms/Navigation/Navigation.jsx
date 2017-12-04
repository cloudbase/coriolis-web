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
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { Logo } from 'components'

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

const Menu = styled.div`margin-top:32px`

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

const MenuItems = [
  {
    label: 'Replicas',
    value: 'replicas',
  }, {
    label: 'Migrations',
    value: 'migrations',
  }, {
    label: 'Cloud Endpoints',
    value: 'endpoints',
  },
]

class Navigation extends React.Component {
  static propTypes = {
    currentPage: PropTypes.string,
  }

  renderMenu() {
    return (
      <Menu>
        {MenuItems.map(item => {
          return (
            <MenuItem
              key={item.value}
              selected={this.props.currentPage === item.value}
              href={`/#/${item.value}`}
            >{item.label}</MenuItem>
          )
        })}
      </Menu>
    )
  }

  render() {
    return (
      <Wrapper>
        <LogoStyled small href="/#/replicas" />
        {this.renderMenu()}
        <Footer />
      </Wrapper>
    )
  }
}

export default Navigation
